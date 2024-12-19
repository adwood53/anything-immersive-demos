#include "system.hpp"
#include <memory>
#include <iostream>

// Main SLAM system class constructor/destructor
System::System() { }
System::~System() { }

// Initializes the SLAM system with camera parameters
void System::configure(int imageWidth, int imageHeight, double fx, double fy, double cx, double cy, double k1, double k2, double p1, double p2, bool claheEnabled = false, float mapKeyframeFilteringRatio = 0.95, bool p3pEnabled = true, bool debug = false)
{
    // Initialize system state with image dimensions and cell size for feature detection
    state_ = std::make_shared<State>(imageWidth, imageHeight, 35);
    state_->debug_ = debug;
    state_->claheEnabled_ = claheEnabled;  // CLAHE = Contrast Limited Adaptive Histogram Equalization
    state_->mapKeyframeFilteringRatio_ = mapKeyframeFilteringRatio;  // Controls keyframe selection threshold
    state_->p3pEnabled_ = p3pEnabled;  // Perspective-3-Point algorithm for pose estimation

    // Log configuration parameters
    std::cout << "- [System]: Configure";
    std::cout << ": width: " << state_->imgWidth_;
    std::cout << ", height: " << state_->imgHeight_;
    std::cout << ", Frame Max Cell Size: " << state_->frameMaxCellSize_;
    std::cout << ", CLAHE Enabled: " << state_->claheEnabled_;
    std::cout << ", Map Keyframe Filtering Ratio: " << state_->mapKeyframeFilteringRatio_;
    std::cout << ", P3P Enabled: " << state_->p3pEnabled_ << std::endl;

    // Initialize camera calibration with intrinsic parameters
    // fx, fy: focal lengths, cx, cy: principal point, k1,k2,p1,p2: distortion coefficients
    cameraCalibration_ = std::make_shared<CameraCalibration>(fx, fy, cx, cy, k1, k2, p1, p2, imageWidth, imageHeight, 20);

    // Create current frame object with camera calibration
    currFrame_ = std::make_shared<Frame>(cameraCalibration_, state_->frameMaxCellSize_);

    // Initialize feature detection and tracking components
    featureExtractor_ = std::make_shared<FeatureExtractor>(state_->extractorMaxQuality_);
    featureTracker_ = std::make_shared<FeatureTracker>(state_->trackerMaxIterations_, state_->trackerMaxPxPrecision_);

    // Initialize mapping components
    mapManager_ = std::make_shared<MapManager>(state_, currFrame_, featureExtractor_);
    mapper_ = std::make_shared<Mapper>(state_, mapManager_, currFrame_);

    // Initialize visual frontend (handles feature tracking and pose estimation)
    visualFrontend_ = std::make_unique<VisualFrontend>(state_, currFrame_, mapManager_, mapper_, featureTracker_);
}

// Resets the SLAM system state
void System::reset()
{
    if (state_->debug_)
    {
        std::cout << "- [System]: Reset" << std::endl;
    }

    currFrame_->reset();
    visualFrontend_->reset();
    mapManager_->reset();
    state_->reset();

    prevTranslation_.setZero();
}

// Estimates camera pose using both camera image and IMU data
int System::findCameraPoseWithIMU(int imageRGBADataPtr, int imuDataPtr, int posePtr)
{
    // Convert raw pointers to appropriate data types
    auto *imageData = reinterpret_cast<uint8_t *>(imageRGBADataPtr);
    auto *imuData = reinterpret_cast<double *>(imuDataPtr);
    auto *poseData = reinterpret_cast<float *>(posePtr);

    // Convert RGBA image to grayscale for feature detection
    cv::Mat image = cv::Mat(state_->imgHeight_, state_->imgWidth_, CV_8UC4, imageData);
    cv::cvtColor(image, image, cv::COLOR_RGBA2GRAY);

    // Process IMU orientation (quaternion wxyz format)
    // Note: x is mirrored to match SLAM coordinate system
    Eigen::Quaterniond orientation(imuData[0], -imuData[1], imuData[2], imuData[3]);
    Eigen::Matrix3d qwc = orientation.toRotationMatrix().inverse();
    Eigen::Vector3d twc(0.0, 0.0, 0.0);
    Sophus::SE3d Twc(qwc, twc);  // SE3 transformation matrix (rotation + translation)

    // Process IMU motion samples
    int motionSampleSize = 7;  // Each sample contains 7 values
    int motionSampleNum = (int) imuData[4] * motionSampleSize;

    // Process each IMU motion sample
    for (int i = 5; i < motionSampleNum; i += motionSampleSize)
    {
        // Format: { timestamp, gx, gy, gz, ax, ay, az }
        auto timestamp = (uint64_t) imuData[i];
        Eigen::Vector3d gyr(imuData[i + 1], imuData[i + 2], imuData[i + 3]);  // Gyroscope data
        Eigen::Vector3d acc(imuData[i + 4], imuData[i + 5], imuData[i + 6]);  // Accelerometer data
    }

    // Get current timestamp
    uint64_t timestamp = duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();

    // Process visual data and get camera pose
    int status = processCameraPose(image, timestamp);

    // Update accumulated translation if pose estimation successful
    if (status == 1)
    {
        Eigen::Vector3d transition = currFrame_->getTwc().translation();
        currTranslation_ = currTranslation_ + transition - prevTranslation_;
        prevTranslation_ = transition;
    }
    else
    {
        prevTranslation_.setZero();
    }

    // Combine IMU orientation with accumulated translation
    Twc.translation() = currTranslation_;

    // Convert pose to array format for JavaScript
    Utils::toPoseArray(Twc, poseData);

    return 1;
}

// Estimates camera pose using only camera image data
int System::findCameraPose(int imageRGBADataPtr, int posePtr)
{
    auto *imageData = reinterpret_cast<uint8_t *>(imageRGBADataPtr);
    auto *poseData = reinterpret_cast<float *>(posePtr);

    // Convert RGBA image to grayscale
    cv::Mat image = cv::Mat(state_->imgHeight_, state_->imgWidth_, CV_8UC4, imageData);
    cv::cvtColor(image, image, cv::COLOR_RGBA2GRAY);

    uint64_t timestamp = duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();

    // Process image to get camera pose
    int status = processCameraPose(image, timestamp);

    // Convert pose to array format for JavaScript
    Utils::toPoseArray(currFrame_->getTwc(), poseData);

    return status;
}

// Detects ground plane from current map points using RANSAC
int System::findPlane(int locationPtr, int numIterations)
{
    cv::Mat mat = processPlane(mapManager_->getCurrentFrameMapPoints(), currFrame_->getTwc(), numIterations);

    if (mat.empty())
    {
        return 0;
    }

    auto *poseData = reinterpret_cast<float *>(locationPtr);
    Utils::toPoseArray(mat, poseData);

    return 1;
}

// Returns 2D feature points from current frame
int System::getFramePoints(int pointsPtr)
{
    auto *data = reinterpret_cast<int *>(pointsPtr);

    int numPoints = currFrame_->getKeypoints2d().size();
    int n = std::min(numPoints * 2, 4096);  // Limit number of points

    // Copy x,y coordinates to array
    for (int i = 0, j = 0; i < n; ++i)
    {
        cv::Point2f p = currFrame_->getKeypoints2d()[i].unpx_;
        data[j++] = (int) p.x;
        data[j++] = (int) p.y;
    }

    return numPoints;
}

// Core function for processing camera frames and updating SLAM state
int System::processCameraPose(cv::Mat &image, double timestamp)
{
    currFrame_->id_++;
    currFrame_->timestamp_ = timestamp;

    // Track features and update pose
    visualFrontend_->track(image, timestamp);

    if (state_->slamResetRequested_)
    {
        reset();
        return 2;
    }

    if (!state_->slamReadyForInit_)
    {
        return 3;
    }

    return 1;
}

// Detects ground plane from 3D map points using RANSAC (Random Sample Consensus)
// Parameters:
//   mapPoints: 3D points in world coordinates
//   Twc: Current camera pose (Transform from World to Camera)
//   numIterations: Number of RANSAC iterations
// Returns: 4x4 transformation matrix representing plane pose
cv::Mat System::processPlane(std::vector<Eigen::Vector3d> mapPoints, Sophus::SE3d Twc, int numIterations)
{
    const long numMapPoints = mapPoints.size();

    // Require minimum number of points for reliable plane detection
    if (numMapPoints < 32)
    {
        if (state_->debug_)
        {
            std::cout << "- [System]: FindPlane - Too few points to detect plane: " << numMapPoints << std::endl;
        }
        return cv::Mat();
    }

    // Initialize data structures for point processing
    std::vector<cv::Mat> points(numMapPoints);        // OpenCV format points
    std::vector<int> indices(numMapPoints);           // Indices for random sampling
    std::vector<float> distances(numMapPoints, 0.0f); // Distances to best plane
    float bestDist = 1e10;                           // Best median distance found

    // Convert Eigen points to OpenCV format for processing
    for (int i = 0; i < numMapPoints; i++)
    {
        cv::Mat pointWorldPos(1, 3, CV_32F);
        cv::eigen2cv(mapPoints[i], pointWorldPos);
        points[i] = pointWorldPos;
        indices[i] = i;
    }

    // RANSAC loop to find best plane fit
    std::vector<float> dists(numMapPoints, 0);        // Temporary distances for each iteration
    std::vector<int> indicesPicked(3);               // Indices of randomly sampled points
    for (int n = 0; n < numIterations; n++)
    {
        // Randomly sample 3 points to define a plane
        std::sample(indices.begin(), indices.end(), indicesPicked.begin(), 3, std::mt19937{std::random_device{}()});

        // Set up matrix for SVD (Singular Value Decomposition)
        cv::Mat u, w, vt;
        cv::Mat A(3, 4, CV_32F);
        A.col(3) = cv::Mat::ones(3, 1, CV_32F);  // Homogeneous coordinates

        // Fill matrix with sampled points
        for (int i = 0; i < 3; i++)
        {
            A.row(i).colRange(0, 3) = points[indicesPicked[i]].t();
        }

        // Compute SVD to find plane parameters
        cv::SVDecomp(A, w, u, vt, cv::SVD::MODIFY_A | cv::SVD::FULL_UV);

        // Extract plane equation coefficients (ax + by + cz + d = 0)
        const float a = vt.at<float>(3, 0);
        const float b = vt.at<float>(3, 1);
        const float c = vt.at<float>(3, 2);
        const float d = vt.at<float>(3, 3);

        // Check if plane is horizontal (within 5 degrees of horizontal)
        const float angleThreshold = 5.0f * CV_PI / 180.0f;
        const cv::Vec3f normal(a, b, c);             // Plane normal vector
        const cv::Vec3f zAxis(0.0f, 0.0f, 1.0f);    // Vertical axis
        if (cv::norm(normal.cross(zAxis)) > sin(angleThreshold))
        {
            continue;  // Skip if plane is not close to horizontal
        }

        // Normalize plane coefficients
        const float f = 1.0f / std::sqrt(a * a + b * b + c * c + d * d);

        // Compute point-to-plane distances for all points
        for (int i = 0; i < numMapPoints; i++)
        {
            dists[i] = std::fabs(points[i].at<float>(0) * a + points[i].at<float>(1) * b + points[i].at<float>(2) * c + d) * f;
        }

        // Find median distance (using nth_element for efficiency)
        std::nth_element(dists.begin(), dists.begin() + std::max((int)(0.2 * numMapPoints), 20), dists.end());
        const float medianDist = dists[std::max((int)(0.2 * numMapPoints), 20)];

        // Update best plane if current one is better
        if (medianDist < bestDist)
        {
            bestDist = medianDist;
            distances = dists;
        }
    }

    // Select inlier points using distance threshold
    const float threshold = 1.4f * bestDist;
    std::vector<cv::Mat> pointsInliers;

    for (int i = 0; i < numMapPoints; i++)
    {
        if (distances[i] < threshold)
        {
            pointsInliers.push_back(points[i]);
        }
    }

    const long numInliers = pointsInliers.size();

    // Verify sufficient inliers found
    if (numInliers < 32)
    {
        if (state_->debug_)
        {
            std::cout << "- [System]: FindPlane - Too few inliers to detect plane: " << numInliers << std::endl;
        }
        return cv::Mat();
    }

    // Recompute plane using all inlier points for better accuracy
    cv::Mat planeCoefficientsMatrix = cv::Mat(numInliers, 4, CV_32F);
    planeCoefficientsMatrix.col(3) = cv::Mat::ones(numInliers, 1, CV_32F);

    // Compute centroid of inlier points
    cv::Mat inliersOrigin = cv::Mat::zeros(3, 1, CV_32F);

    for (int i = 0; i < numInliers; i++)
    {
        cv::Mat worldPoint = pointsInliers[i];
        inliersOrigin += worldPoint;
        planeCoefficientsMatrix.row(i).colRange(0, 3) = worldPoint.t();
    }

    planeCoefficientsMatrix.resize(numInliers);

    // Compute final plane parameters using SVD
    cv::Mat u, w, vt;
    cv::SVDecomp(planeCoefficientsMatrix, w, u, vt, cv::SVD::MODIFY_A | cv::SVD::FULL_UV);

    float a = vt.at<float>(3, 0);
    float b = vt.at<float>(3, 1);
    float c = vt.at<float>(3, 2);

    // Compute plane center and normalize parameters
    inliersOrigin = inliersOrigin * (1.0f / numInliers);
    const float f = 1.0f / sqrt(a * a + b * b + c * c);

    // Convert camera pose from Eigen to OpenCV format
    cv::Mat camPose(4, 4, CV_32F);
    Utils::toPoseMat(Twc, camPose);

    // Compute camera center in world coordinates
    cv::Mat Oc = -camPose.colRange(0, 3).rowRange(0, 3).t() * camPose.rowRange(0, 3).col(3);
    // Vector from plane origin to camera center
    cv::Mat mXC = Oc - inliersOrigin;

    // Ensure plane normal points towards camera
    if ((mXC.at<float>(0) * a + mXC.at<float>(1) * b + mXC.at<float>(2) * c) > 0)
    {
        a = -a;
        b = -b;
        c = -c;
    }

    // Compute normalized plane normal
    const float nx = a * f;
    const float ny = b * f;
    const float nz = c * f;

    // Create rotation matrix to align plane with world coordinate system
    cv::Mat normal = (cv::Mat_<float>(3, 1) << nx, ny, nz);
    cv::Mat up = (cv::Mat_<float>(3, 1) << 1.0f, 0.0f, 0.0f);
    cv::Mat v = up.cross(normal);
    const float sa = cv::norm(v);        // sine of angle
    const float ca = up.dot(normal);     // cosine of angle
    const float ang = atan2(sa, ca);     // angle between vectors

    // Convert rotation vectors to rotation matrices using Rodrigues formula
    cv::Mat R1, R2;
    cv::Rodrigues((v * ang / sa), R1);   // Rotation from up vector to normal
    cv::Rodrigues(up, R2);               // Additional rotation around up vector

    // Construct final plane pose matrix (4x4 transformation matrix)
    cv::Mat planePose = cv::Mat::eye(4, 4, CV_32F);
    planePose.rowRange(0, 3).colRange(0, 3) = R1 * R2;      // Set rotation
    inliersOrigin.copyTo(planePose.col(3).rowRange(0, 3));  // Set translation to plane center

    return planePose;
}


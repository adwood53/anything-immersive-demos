'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './SLAMCamera.module.css';
import Slider from '@/components/Slider';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';

const CameraView = () => {
  const [isSLAMInitialized, setIsSLAMInitialized] = useState(false);  // State for rendering debug content
  const [isSLAMControlEnabled, setIsSLAMControlEnabled] = useState(false);  // State for rendering debug content

  const isSLAMInitializedRef = useRef(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const camera = useRef(null);
  const isFirstFrameLostPoseRef = useRef(true);
  const posePositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const poseRotationRef = useRef(new THREE.Quaternion(0, 0, 0, 1));
  const previousLookRotationRef = useRef(new THREE.Quaternion(0, 0, 0, 1));
  const alvaRef = useRef(null);

  const useDeviceOrientationRef = useRef(true);
  const useInterpolationRef = useRef(true);
  const showFeaturesRef = useRef(true);

  // Default SLAM Settings
  const [frameMaxCellSize, setFrameMaxCellSize] = useState(40);
  const [mapKeyframeFilteringRatio, setMapKeyframeFilteringRatio] = useState(0.95);
  const [isP3pEnabled, setIsP3pEnabled] = useState(true);
  const [isClaheEnabled, setIsClaheEnabled] = useState(false);
  const [isVideoStabilisationEnabled, setIsVideoStabilisationEnabled] = useState(false);
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);

  useEffect(() => {
    camera.current = document.querySelector('a-camera');
    camera.current.setAttribute("look-controls", `enabled: ${useDeviceOrientationRef.current}`);
    // const lookControls = document.getElementById('camera-controls');

    const initializeSLAM = async () => {
      const [{ AlvaAR }, { Camera, resize2cover, onFrame }] =
        await Promise.all([import('@/slam/assets/alva_ar.js'), import('@/slam/assets/utils.js')]);

      const $container = containerRef.current;
      const $canvas = canvasRef.current;

      const config = {
        video: {
          facingMode: 'environment',
          aspectRatio: 16 / 9,
          width: { ideal: 1280 },
        },
        audio: false,
      };
      const media = await Camera.Initialize(config);

      const $video = media.el;
      const size = resize2cover(
        $video.videoWidth,
        $video.videoHeight,
        $container.clientWidth,
        $container.clientHeight
      );

      $canvas.width = $container.clientWidth;
      $canvas.height = $container.clientHeight;
      $video.style.width = `${size.width}px`;
      $video.style.height = `${size.height}px`;

      const alva = await AlvaAR.Initialize($canvas.width, $canvas.height, 45, frameMaxCellSize, mapKeyframeFilteringRatio, isP3pEnabled, isClaheEnabled, isDebugEnabled);
      alvaRef.current = alva;
      document.body.addEventListener('click', () => alva.reset(), false);
      
      const ctx = $canvas.getContext('2d', { alpha: false, desynchronized: true });
      onFrame(() => {
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);

        if (!document['hidden']) {
          ctx.drawImage(
            $video,
            0,
            0,
            $video.videoWidth,
            $video.videoHeight,
            size.x,
            size.y,
            size.width,
            size.height
          );
          const frame = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
          const pose = alva.findCameraPose(frame);

          // const currentLookRotation = lookControls.object3D.quaternion;
          if (pose) {
            // if (isFirstFrameLostPoseRef.current == false) {
            //   lookControls.setAttribute("look-controls", "enabled: false");
            //   isFirstFrameLostPoseRef.current = true;
            // }
            
            const targetPosition = new THREE.Vector3(pose[12], pose[13], pose[14]);
            const poseMatrix = new THREE.Matrix4().fromArray(pose);
            const targetRotation = new THREE.Quaternion().setFromRotationMatrix(poseMatrix).normalize();

            targetPosition.y = -targetPosition.y;
            targetPosition.z = -targetPosition.z;
            targetRotation.x = -targetRotation.x;

            if (useInterpolationRef.current) {
              const smoothingFactor = 0.5; // Adjust this value to control the smoothing speed
              posePositionRef.current = posePositionRef.current.lerp(targetPosition, smoothingFactor);
              if (!useDeviceOrientationRef.current) {
                console.log("rot");
                poseRotationRef.current = poseRotationRef.current.normalize().slerp(targetRotation, smoothingFactor).normalize();
              }
            }
            else {
              posePositionRef.current = targetPosition;
              if (!useDeviceOrientationRef.current) {
                poseRotationRef.current = targetRotation;
              }
            }

            setCameraPosition(posePositionRef.current);
            if (!useDeviceOrientationRef.current) {
              setCameraRotation(poseRotationRef.current);
            }

            if (showFeaturesRef.current) {
              drawFramePoints(true);
            }
          } else {
            // if (isFirstFrameLostPoseRef.current == true) {
            //   lookControls.setAttribute("look-controls", "enabled: true");
            //   isFirstFrameLostPoseRef.current = false;
            // }
            
            // if (!previousLookRotationRef.current.equals(currentLookRotation)) {
            //   previousLookRotationRef.current.normalize();
            //   currentLookRotation.normalize();
            //   const lookVelocity = new THREE.Quaternion();
            //   lookVelocity.copy(currentLookRotation);
            //   lookVelocity.multiply(previousLookRotationRef.current.clone().invert());
            //   poseRotationRef.current.multiply(lookVelocity);
            //   poseRotationRef.current.normalize();
            //   setCameraRotation(poseRotationRef.current);
            // }

            // previousLookRotationRef.current.copy(currentLookRotation);
            
            if (showFeaturesRef.current) {
              drawFramePoints(false);
            }
          }
        }

        return true;
      }, 30);

      function drawFramePoints(hasPose) {
        const dots = alva.getFramePoints();
        for (const p of dots) {
          ctx.fillStyle = hasPose ? '#bdffc0' : '#ff7575';
          ctx.fillRect(p.x, p.y, 2, 2);
        }
      }
    };

    if (!isSLAMInitializedRef.current) {
      isSLAMInitializedRef.current = true;  // Use ref to track if initialization has occurred
      initializeSLAM().then(() => {
        setIsSLAMInitialized(true); // Once SLAM is initialized, update the state to trigger rendering the debug content
      }).catch((error) => {
        console.error('Error initializing SLAM:', error);
      });
    }

    const setCameraPosition = (position) => {
      camera.current.setAttribute('position', {
        x: position.x,
        y: position.y,
        z: position.z
      });
    }
    
    const setCameraRotation = (rotation) => {
      camera.current.setAttribute('quaternion-rotation', {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z,
        w: rotation.w
      });
    }
  }, []);

  const onShowSLAMControlsToggle = (value) => setIsSLAMControlEnabled(value);
  const onShowFeaturesToggle = (value) => showFeaturesRef.current = value;
  const onInterpolationToggle = (value) => useInterpolationRef.current = value;
  function onDeviceOrientationToggle(value) {
    useDeviceOrientationRef.current = value;
    if (camera.current != null) {
      camera.current.setAttribute("look-controls", `enabled: ${value}`);
    }
  }
  const onClaheToggle = (value) => setIsClaheEnabled(value);
  const onP3pToggle = (value) => setIsP3pEnabled(value);
  const onDebugToggle = (value) => setIsDebugEnabled(value);
  const onVideoStabilisationToggle = (value) => setIsVideoStabilisationEnabled(value);
  const onFrameMaxCellSizeChanged = (value) => setFrameMaxCellSize(value);
  const onMapKeyframeFilteringRatioChanged = (value) => setMapKeyframeFilteringRatio(value);
  function onApplyClicked() {
    alvaRef.current.reconfigure(frameMaxCellSize, mapKeyframeFilteringRatio, isP3pEnabled, isClaheEnabled, isVideoStabilisationEnabled, isDebugEnabled);
  }

  return (
    <>
      {/* Render the debug content only when SLAM is initialized */}
      {isSLAMInitialized && (
        <div className={`${styles.debugContainer}`}>
          <Toggle
            onToggle={onShowSLAMControlsToggle}
            defaultState={isDebugEnabled}
            activeColor={"#E79023"}
            label={`Show SLAM Controls`} />
          {isSLAMControlEnabled && (
            <>
              {/* JS Side */}
              <Toggle
                onToggle={onInterpolationToggle}
                defaultState={useInterpolationRef.current}
                label={`Use Interpolation`} />
              <Toggle
                onToggle={onDeviceOrientationToggle}
                defaultState={useDeviceOrientationRef.current}
                label={`Use Device Orientation`} />
              <Toggle
                onToggle={onShowFeaturesToggle}
                defaultState={showFeaturesRef.current}
                label={`Show Features`} />
              {/* SLAM Side */}
              <Slider
                onValueChanged={onFrameMaxCellSizeChanged}
                minValue={10}
                maxValue={100}
                defaultValue={frameMaxCellSize}
                step={1}
                label={"Frame Max Cell Size:"} />
              <Slider
                onValueChanged={onMapKeyframeFilteringRatioChanged}
                minValue={0}
                maxValue={1}
                defaultValue={mapKeyframeFilteringRatio}
                step={0.01}
                label={"Map Keyframe Filtering Ratio:"} />
              <Toggle
                onToggle={onClaheToggle}
                defaultState={isClaheEnabled}
                label={"Use CLAHE"} />
              <Toggle
                onToggle={onP3pToggle}
                defaultState={isP3pEnabled}
                label={"Use P3P"} />
              <Toggle
                onToggle={onVideoStabilisationToggle}
                defaultState={isDebugEnabled}
                label={"Use Video Stabilisation"} />
              <Toggle
                onToggle={onDebugToggle}
                defaultState={isDebugEnabled}
                label={"Show Debug Logs"} />
              <Button
                onClick={onApplyClicked}
                label={"APPLY"} />
            </>
          )}
        </div>
      )}

      <div className={`${styles.container}`} ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default CameraView;

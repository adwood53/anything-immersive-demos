'use client';

import { useEffect, useRef } from 'react';
import styles from './DeviceCamera.module.css';

const CameraView = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isSLAMInitialized = useRef(false);
  const isFirstFrameLostPose = useRef(true);

  useEffect(() => {
    const camera = document.querySelector('a-camera');
    const looker = camera.parentNode;

    const initializeSLAM = async () => {
      const [{ AlvaAR }, { Camera, resize2cover, onFrame }] =
        await Promise.all([
          import('@/slam/assets/alva_ar.js'),
          import('@/slam/assets/utils.js')
        ]);

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

      const alva = await AlvaAR.Initialize($canvas.width, $canvas.height);
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
          const frame = ctx.getImageData(
            0,
            0,
            $canvas.width,
            $canvas.height
          );
          const pose = alva.findCameraPose(frame);

          // Have Pose
          if (pose) {
            if (isFirstFrameLostPose.current == false) {
              looker.setAttribute("look-controls", "enabled: false");
              isFirstFrameLostPose.current = true;
            }
            //console.log("have");
            
            // Smoothing factor: this defines how fast you want to smooth the transition
            const smoothingFactor = 0.75; // Adjust this value to control the smoothing speed

            // Get current position and quaternion rotation
            const currentPositionComponent = looker.getAttribute('position');
            const currentQuaternionComponent = camera.getAttribute('quaternion-rotation');

            // Target position and rotation from the pose array
            const targetPosition = new THREE.Vector3(pose[12], pose[13], pose[14]);
            const poseMatrix = new THREE.Matrix4().fromArray(pose);
            const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(poseMatrix)

            // Interpolate position smoothly using lerpVectors
            const currentPosition = new THREE.Vector3(currentPositionComponent.x, currentPositionComponent.y, currentPositionComponent.z);
            const smoothedPosition = currentPosition.lerp(targetPosition, smoothingFactor);

            // Interpolate rotation smoothly using slerpQuaternions
            const currentRotation = new THREE.Quaternion(currentQuaternionComponent.x, currentQuaternionComponent.y, currentQuaternionComponent.z, currentQuaternionComponent.w).normalize();
            const smoothedQuaternion = currentRotation.slerp(targetQuaternion.normalize(), smoothingFactor).normalize();

            // Update the camera's position and rotation
            looker.setAttribute('position', {
              x: smoothedPosition.x,
              y: -smoothedPosition.y,
              z: -smoothedPosition.z
            });
            camera.setAttribute('quaternion-rotation', {
              x: -smoothedQuaternion.x,
              y: smoothedQuaternion.y,
              z: smoothedQuaternion.z,
              w: smoothedQuaternion.w
            });
          }
          // Lost Pose
          else {
            // console.log("lost");]
            if (isFirstFrameLostPose.current == true) {
              const currentQuaternionComponent = camera.getAttribute('quaternion-rotation');
              looker.setAttribute('position', "0 0 0");
              camera.setAttribute('quaternion-rotation', {
                x: -currentQuaternionComponent.x,
                y: -currentQuaternionComponent.y,
                z: -currentQuaternionComponent.z,
                w: currentQuaternionComponent.w
              });

              looker.setAttribute("look-controls", "enabled: true");
              isFirstFrameLostPose.current = false;
            }

            const dots = alva.getFramePoints();
            for (const p of dots) {
              ctx.fillStyle = 'white';
              ctx.fillRect(p.x, p.y, 2, 2);
            }
          }
        }

        return true;
      }, 30);
    };

    if (!isSLAMInitialized.current)
    {
      initializeSLAM().catch((error) => {
        console.error('Error initializing SLAM:', error);
      });
      isSLAMInitialized.current = true;
    }
  }, []);

  return (
    <div className={`${styles.container}`} ref={containerRef}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CameraView;

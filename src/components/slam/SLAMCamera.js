'use client';

import { useEffect, useRef } from 'react';
import styles from './DeviceCamera.module.css';

const CameraView = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isSLAMInitialized = useRef(false);
  const isFirstFrameLostPose = useRef(true);
  const positionRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotationRef = useRef(new THREE.Quaternion(0, 0, 0, 1));
  
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
          const frame = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
          const pose = alva.findCameraPose(frame);

          // Have Pose
          if (pose) {
            if (isFirstFrameLostPose.current == false) {
              // camera.setAttribute("rotation", "0 0 0");
              // rotationRef.current = camera.getAttribute("quaternion-rotation");
              camera.setAttribute("look-controls", "enabled: false");
              isFirstFrameLostPose.current = true;
            }
            
            // Smoothing factor: this defines how fast you want to smooth the transition
            const smoothingFactor = 0.5; // Adjust this value to control the smoothing speed

            // Target position and rotation from the pose array
            const targetPosition = new THREE.Vector3(pose[12], pose[13], pose[14]);
            const poseMatrix = new THREE.Matrix4().fromArray(pose);
            const targetRotation = new THREE.Quaternion().setFromRotationMatrix(poseMatrix).normalize();

            const currentPosition = new THREE.Vector3(positionRef.current.x, positionRef.current.y, positionRef.current.z);
            const currentRotation = new THREE.Quaternion(rotationRef.current.x, rotationRef.current.y, rotationRef.current.z, rotationRef.current.w).normalize();

            const smoothedPosition = currentPosition.lerp(targetPosition, smoothingFactor);
            const smoothedRotation = currentRotation.slerp(targetRotation, smoothingFactor).normalize();

            // Update the camera's position and rotation
            camera.setAttribute('position', {
              x: smoothedPosition.x,
              y: -smoothedPosition.y,
              z: -smoothedPosition.z
            });
            camera.setAttribute('quaternion-rotation', {
              x: -smoothedRotation.x,
              y: smoothedRotation.y,
              z: smoothedRotation.z,
              w: smoothedRotation.w
            });
            positionRef.current = smoothedPosition;
            rotationRef.current = smoothedRotation;
          }
          // Lost Pose
          else {
            if (isFirstFrameLostPose.current == true) {
              // rotationRef.current = { x: 0, y: 0, z: 0, w: 1 };
              // camera.setAttribute('quaternion-rotation', rotationRef.current);
              camera.setAttribute("look-controls", "enabled: true");
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

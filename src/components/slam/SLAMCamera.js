'use client';

import { useEffect, useRef } from 'react';
import styles from './DeviceCamera.module.css';

const CameraView = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isSLAMInitialized = useRef(false);
  const isFirstPose = useRef(true);
  const previousPosition = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const camera = document.querySelector('a-camera');
    // const looker = camera.parentNode;

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
            //console.log("have");
            
            // Smoothing factor: this defines how fast you want to smooth the transition
            const smoothingFactor = 0.35; // Adjust this value to control the smoothing speed

            // Get current position and quaternion rotation
            const currentPosition = camera.getAttribute('position');
            const currentQuaternion = camera.getAttribute('quaternion-rotation');

            // Target position and rotation from the pose array
            const targetPosition = new THREE.Vector3(pose[12], pose[13], pose[14]);
            const poseMatrix = new THREE.Matrix4().fromArray(pose);
            const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(poseMatrix);

            // Interpolate position smoothly using lerpVectors
            const smoothedPosition = new THREE.Vector3().lerpVectors(
              new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z),
              targetPosition,
              smoothingFactor
            );

            // Interpolate rotation smoothly using slerpQuaternions
            const smoothedQuaternion = new THREE.Quaternion().slerpQuaternions(
              new THREE.Quaternion(currentQuaternion.x, currentQuaternion.y, currentQuaternion.z, currentQuaternion.w), 
              targetQuaternion, 
              smoothingFactor
            );

            // Update the camera's position and rotation
            camera.setAttribute('position', `${smoothedPosition.x} ${-smoothedPosition.y} ${-smoothedPosition.z}`);
            camera.setAttribute('quaternion-rotation', `${-smoothedQuaternion.x} ${smoothedQuaternion.y} ${smoothedQuaternion.z} ${smoothedQuaternion.w}`);
          }
          // Lost Pose
          else {
            // console.log("lost");
            isFirstPose.current = true;

            const dots = alva.getFramePoints();
            for (const p of dots) {
              ctx.fillStyle = 'white';
              ctx.fillRect(p.x, p.y, 2, 2);
            }
          }
        }

        return true;
      }, 60);
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

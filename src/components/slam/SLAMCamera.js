'use client';

import { useEffect, useRef } from 'react';
import styles from './DeviceCamera.module.css';

const CameraView = () => {
  const isSLAMInitializedRef = useRef(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isFirstFrameLostPoseRef = useRef(true);
  const posePositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const poseRotationRef = useRef(new THREE.Quaternion(0, 0, 0, 1));
  const previousLookRotationRef = useRef(new THREE.Vector3(0, 0, 0));
  
  useEffect(() => {
    const camera = document.querySelector('a-camera');
    const lookControls = document.getElementById('camera-controls');

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
            if (isFirstFrameLostPoseRef.current == false) {
              // camera.setAttribute("rotation", "0 0 0");
              // rotationRef.current = camera.getAttribute("quaternion-rotation");
              lookControls.setAttribute("look-controls", "enabled: false");
              // lookControls.setAttribute("rotation", "0 0 0");
              isFirstFrameLostPoseRef.current = true;
            }
            
            // Smoothing factor: this defines how fast you want to smooth the transition
            const smoothingFactor = 0.5; // Adjust this value to control the smoothing speed

            // Target position and rotation from the pose array
            const targetPosition = new THREE.Vector3(pose[12], pose[13], pose[14]);
            const poseMatrix = new THREE.Matrix4().fromArray(pose);
            const targetRotation = new THREE.Quaternion().setFromRotationMatrix(poseMatrix).normalize();

            const smoothedPosition = posePositionRef.current.lerp(targetPosition, smoothingFactor);
            const smoothedRotation = poseRotationRef.current.normalize().slerp(targetRotation, smoothingFactor).normalize();

            setCameraPosition({
              x: smoothedPosition.x,
              y: -smoothedPosition.y,
              z: -smoothedPosition.z
            });
            setCameraRotation({
              x: -smoothedRotation.x,
              y: smoothedRotation.y,
              z: smoothedRotation.z,
              w: smoothedRotation.w
            });
            posePositionRef.current = smoothedPosition;
            poseRotationRef.current = smoothedRotation;
          }
          // Lost Pose
          else {
            if (isFirstFrameLostPoseRef.current == true) {
              lookControls.setAttribute("look-controls", "enabled: true");
              isFirstFrameLostPoseRef.current = false;
            }

            const currentLookRotation = lookControls.getAttribute('rotation');
            const lookVelocity = {
              x: currentLookRotation.x - previousLookRotationRef.current.x,
              y: currentLookRotation.y - previousLookRotationRef.current.y,
              z: currentLookRotation.z - previousLookRotationRef.current.z
            };
            const lookVelocityRad = new THREE.Vector3(
              THREE.MathUtils.degToRad(lookVelocity.x),
              THREE.MathUtils.degToRad(lookVelocity.y),
              THREE.MathUtils.degToRad(lookVelocity.z)
            );
            const lookVelocityEuler = new THREE.Euler(lookVelocityRad.x, lookVelocityRad.y, lookVelocityRad.z, 'YXZ');
            const lookVelocityQuaternion = new THREE.Quaternion();
            lookVelocityQuaternion.setFromEuler(lookVelocityEuler);
            poseRotationRef.current.premultiply(lookVelocityQuaternion).normalize();
            setCameraRotation(camera, poseRotationRef)

            // Debug
            {
              const dots = alva.getFramePoints();
              for (const p of dots) {
                ctx.fillStyle = 'white';
                ctx.fillRect(p.x, p.y, 2, 2);
              }
            }
          }

          previousLookRotationRef.current = lookControls.getAttribute('rotation');
        }

        return true;
      }, 30);
    };

    if (!isSLAMInitializedRef.current)
    {
      initializeSLAM().catch((error) => {
        console.error('Error initializing SLAM:', error);
      });
      isSLAMInitializedRef.current = true;
    }

    const setCameraPosition = (position) => {
      camera.setAttribute('position', {
        x: position.x,
        y: position.y,
        z: position.z
      });
    }
    
    const setCameraRotation = (rotation) => {
      camera.setAttribute('quaternion-rotation', {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z,
        w: rotation.w
      });
    }
  }, []);

  return (
    <div className={`${styles.container}`} ref={containerRef}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CameraView;

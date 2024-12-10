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
            console.log("have");
            const t = new THREE.Vector3(pose[12], pose[13], pose[14]);
            // const m = new THREE.Matrix4().fromArray(pose);
            // const r = new THREE.Quaternion().setFromRotationMatrix(m);
            //camera.setAttribute('position', `${t.x} ${-t.y} ${-t.z}`);
            // camera.setAttribute('rotation', `${-r.x} ${r.y} ${r.z}`);

            if (isFirstPose.current == true) {
              looker.setAttribute('position', "0 0 0");
              
              const currentLookRotation = looker.getAttribute('rotation');
              camera.setAttribute('rotation', {
                x: -currentLookRotation.x,
                y: -currentLookRotation.y,
                z: -currentLookRotation.z
              });

              isFirstPose.current = false;
            }
            else {
              const positionDelta = {
                x: t.x - previousPosition.current.x,
                y: t.y - previousPosition.current.y,
                z: t.z - previousPosition.current.z,
              };
              const currentPosition = looker.getAttribute('position');
              looker.setAttribute('position', {
                x: currentPosition.x + positionDelta.x,
                y: currentPosition.y - positionDelta.y, // Y-axis is usually flipped
                z: currentPosition.z - positionDelta.z, // Z-axis is inverted
              });
            }
            previousPosition.current = { x: t.x, y: t.y, z: t.z };
          }
          // Lost Pose
          else {
            console.log("lost");
            isFirstPose.current = true;

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

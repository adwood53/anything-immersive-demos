'use client';

import { useEffect, useRef } from 'react';
import styles from './DeviceCamera.module.css';

const CameraView = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const previousPosition = useRef({ x: 0, y: 0, z: 0 });
  const isFirstPose = useRef(false);
  const startingRotation = useRef({x: 0, y: 0, z: 0})

  useEffect(() => {
    const initializeSLAM = async () => {
      const config = {
        video: {
          facingMode: 'environment',
          aspectRatio: 16 / 9,
          width: { ideal: 1280 },
        },
        audio: false,
      };

      const $container = containerRef.current;
      const $canvas = canvasRef.current;

      const ctx = $canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
      });

      const [{ AlvaAR }, { Camera, resize2cover, onFrame }] =
        await Promise.all([
          import('@/slam/assets/alva_ar.js'),
          import('@/slam/assets/utils.js'),
        ]);

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

      const alva = await AlvaAR.Initialize(
        $canvas.width,
        $canvas.height
      );

      $container.appendChild($canvas);

      document.body.addEventListener(
        'click',
        () => alva.reset(),
        false
      );

      onFrame(() => {
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);

        if (!document.hidden) {
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

          if (pose) {
            // console.log("have pose");

            // const m = new THREE.Matrix4().fromArray(pose);
            // const r = new THREE.Quaternion().setFromRotationMatrix(m);
            const t = new THREE.Vector3(pose[12], pose[13], pose[14]);
            const camera = document.querySelector('a-camera');
            if (isFirstPose.current) {
              previousPosition.current = 0;
              const currentRotation = camera.getAttribute('rotation');
              startingRotation.current = {
                x: currentRotation.x,
                y: currentRotation.y,
                z: currentRotation.z
              }
              camera.setAttribute('position', "0 0 0");
              camera.setAttribute('rotation-offset', `
                pitch: ${-startingRotation.current.x}; 
                yaw: ${-startingRotation.current.y}; 
                roll: ${-startingRotation.current.z};
              `);
            }
            else {
              const delta = {
                x: t.x - previousPosition.current.x,
                y: t.y - previousPosition.current.y,
                z: t.z - previousPosition.current.z,
              };
              const currentPosition = camera.getAttribute('position');
              camera.setAttribute('position', {
                x: currentPosition.x + delta.x,
                y: currentPosition.y - delta.y, // Y-axis is usually flipped
                z: currentPosition.z - delta.z, // Z-axis is inverted
              });
            }
            previousPosition.current = { x: t.x, y: t.y, z: t.z };

            //camera.setAttribute('position', `${t.x} ${-t.y} ${-t.z}`);
            // camera.setAttribute('rotation', `${-r.x} ${r.y} ${r.z}`);

            isFirstPose.current = false;
          }
          else {
            isFirstPose.current = true;
            // console.log("lost pose");

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

    initializeSLAM().catch((error) => {
      console.error('Error initializing SLAM:', error);
    });
  }, []);

  return (
    <div className={`${styles.container}`} ref={containerRef}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CameraView;

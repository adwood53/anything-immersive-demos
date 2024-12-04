'use client';

import { useEffect, useRef } from 'react';
import styles from './DeviceCamera.module.css';

const CameraView = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

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

      if (!$container || !$canvas) return;

      const ctx = $canvas.getContext('2d', { alpha: false, desynchronized: true });

      // Import necessary assets dynamically
      const [{ AlvaAR }, { Camera, resize2cover }] = await Promise.all([
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

      const alva = await AlvaAR.Initialize($canvas.width, $canvas.height);

      $container.appendChild($canvas);

      document.body.addEventListener('click', () => alva.reset(), false);

      const frameLoop = () => {
        // ctx.clearRect(0, 0, $canvas.width, $canvas.height);

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
          const frame = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
          const pose = alva.findCameraPose(frame);

          if (pose) {
            // view.updateCameraPose(pose);
            console.log("have pose");
          } else {
            // console.log("lost pose");
            // view.lostCamera();

            const dots = alva.getFramePoints();

            for (const p of dots) {
              ctx.fillStyle = 'white';
              ctx.fillRect(p.x, p.y, 2, 2);
            }
          }

        // Request the next frame
        requestAnimationFrame(frameLoop);
      };
    };
    frameLoop();

    //   onFrame(() => {
    //     ctx.clearRect(0, 0, $canvas.width, $canvas.height);

    //     if (!document.hidden) {
    //       ctx.drawImage(
    //         $video,
    //         0,
    //         0,
    //         $video.videoWidth,
    //         $video.videoHeight,
    //         size.x,
    //         size.y,
    //         size.width,
    //         size.height
    //       );
    //       const frame = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
    //       const pose = alva.findCameraPose(frame);

    //       if (pose) {
    //         // view.updateCameraPose(pose);
    //         console.log("have pose");
    //       } else {
    //         // console.log("lost pose");
    //         // view.lostCamera();

    //         const dots = alva.getFramePoints();

    //         for (const p of dots) {
    //           ctx.fillStyle = 'white';
    //           ctx.fillRect(p.x, p.y, 2, 2);
    //         }
    //       }
    //     }

    //     return true;
    //   }, 30);
    };

    initializeSLAM().catch((error) => {
      console.error('Error initializing SLAM:', error);
    });
  }, []);

  return (
    <div>
      <div id="container" className={`${styles.container}`} ref={containerRef}></div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CameraView;

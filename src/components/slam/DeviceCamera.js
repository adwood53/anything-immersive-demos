'use client';

import { useEffect, useRef } from 'react';
import styles from './DeviceCamera.module.css';

const DeviceCamera = ({ facingMode }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const initializeSLAM = async () => {
      const $container = containerRef.current;
      const $canvas = canvasRef.current;

      if (!$container || !$canvas) return;

      const ctx = $canvas.getContext('2d', { alpha: false, desynchronized: true });

      const [{ Camera, onFrame, resize2cover }] = await Promise.all([
        import('@/slam/assets/utils.js'),
      ]);

      const config = {
        video: {
          facingMode: facingMode,
          aspectRatio: 16 / 9,
          width: { ideal: 1280 },
        },
        audio: false,
      };
      const media = await Camera.Initialize(config);
      const $video = media.el;

      $canvas.width = $container.clientWidth;
      $canvas.height = $container.clientHeight;
      $container.appendChild($canvas);

      const size = resize2cover(
        $video.videoWidth,
        $video.videoHeight,
        $container.clientWidth,
        $container.clientHeight
      );
      $video.style.width = `${size.width}px`;
      $video.style.height = `${size.height}px`;
      // TODO: Check - The attributes below may or may not be required.
      $video.setAttribute('autoplay', true);
      $video.setAttribute('playsinline', true);
      $video.setAttribute('webkit-playsinline', true);
      
      onFrame(() => {
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
        }

        return true;
      }, 30);
    };

    initializeSLAM().catch((error) => {
      console.error('Error initializing SLAM:', error);
    });
  }, [facingMode]);

  return (
    <div>
        <div className={`${styles.container}`} ref={containerRef}>
            <canvas id='device-camera-view' ref={canvasRef} />
        </div>
    </div>
  );
};

export default DeviceCamera;

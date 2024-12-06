'use client';

import { useEffect, useRef } from 'react';

const VideoPlayer = ({ videoSrc, loop = true }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Ensure the canvas size matches the video dimensions once the video metadata is loaded
    const onVideoLoadedMetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    video.addEventListener('loadedmetadata', onVideoLoadedMetadata);

    // Draw the video frame to the canvas
    const drawImage = () => {
      if (video.paused || video.ended) return; // Only draw when the video is playing

      // Get the canvas 2D context and draw the video frame
      canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      // Request the next frame
      requestAnimationFrame(drawImage);
    };

    // Start drawing frames once the video starts playing
    const onVideoPlay = () => {
      drawImage();
    };

    video.addEventListener('play', onVideoPlay);

    // Cleanup event listeners
    return () => {
      video.removeEventListener('loadedmetadata', onVideoLoadedMetadata);
      video.removeEventListener('play', onVideoPlay);
    };
  }, [videoSrc]);

  return (
    <>
      <video
        ref={videoRef}
        src={videoSrc}
        loop={loop}
        autoPlay
        muted
        playsInline
        style={{width: "0", height: "0"}}
        // style={{ display: 'none' }}
      />
      <canvas ref={canvasRef} style={{
        background: "red",
        objectFit: "fill",
        position:"absolute",
        }} />
      </>
  );
};

export default VideoPlayer;

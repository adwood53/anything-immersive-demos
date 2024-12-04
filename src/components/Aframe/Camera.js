'use client';
import React, { forwardRef } from 'react';

const Camera = forwardRef(({ enableWASD = false, enableLook = true, position = '0 0.4 0' }, ref) => {
  return (
    <a-camera
      ref={ref}
      position={position}
      wasd-controls={`enabled: ${enableWASD}`}
      look-controls={`enabled: ${enableLook}`}
    >
    </a-camera>
  );
});

Camera.displayName = 'Camera'; // Helpful for debugging

export default Camera;

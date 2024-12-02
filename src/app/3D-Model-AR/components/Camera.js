'use client';

function Camera() {
  return (
    <a-camera
      position="0 0.4 0"
      wasd-controls="enabled: false"
      look-controls="enabled: false"
    ></a-camera>
  );
}

export default Camera;

'use client';

function TrackedCamera() {
  return (
    <a-camera
      position="0 0.4 0"
      wasd-controls="enabled: false"
      look-controls="enabled: true"
    ></a-camera>
  );
}

export default TrackedCamera;

'use client';

function Plane() {
  return (
    <a-plane
      follow-shadow="#model-container"
      material="shader:shadow"
      shadow="cast:false;"
      rotation="-90 0 0"
      position="0 -0.5 -1"
      width="10"
      height="10"
    ></a-plane>
  );
}

export default Plane;

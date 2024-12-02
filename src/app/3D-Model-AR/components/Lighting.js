'use client';

function Lighting() {
  return (
    <a-entity>
      <a-entity
        id="sun"
        light="type: directional; color: #e85b1a; intensity: 0.9; castShadow: true; shadowCameraFar: 500;
          shadowCameraVisible: false;
          shadowBias: -0.001;
          shadowMapHeight:2048; shadowMapWidth:2048;
          shadowCameraLeft: -5; shadowCameraRight: 5;
          shadowCameraBottom: -5; shadowCameraTop: 5;"
        position="10 50 -10"
      ></a-entity>
      <a-entity light="type: ambient; intensity:0.15; color: #FFFFF"></a-entity>
      <a-entity light="type: point; intensity:1; color: #FFFFF"></a-entity>
      <a-entity light="type: hemisphere; color: #33C; groundColor: #3C3; intensity: 0"></a-entity>
    </a-entity>
  );
}

export default Lighting;

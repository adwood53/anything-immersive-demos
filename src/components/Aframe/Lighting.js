'use client';

function Lighting() {
  return (
    <a-entity>
      <a-entity
        id="sun"
        light="type: directional; color: #FFFFFF; intensity: 0.9; castShadow: true; shadowCameraFar: 500;
          shadowCameraVisible: false;
          shadowBias: -0.001;
          shadowMapHeight:2048; shadowMapWidth:2048;
          shadowCameraLeft: -5; shadowCameraRight: 5;
          shadowCameraBottom: -5; shadowCameraTop: 5;"
        position="10 50 -10"
      ></a-entity>
      <a-entity light="type: hemisphere; color: #c9f6ff; groundColor: #0ba11f; intensity: 0.7"></a-entity>
      <a-entity light="type: point; intensity:1; color: #FFFFFF"></a-entity>
      <a-entity light="type: ambient; intensity:0.3; color: #FFFFFF"></a-entity>
    </a-entity>
  );
}

export default Lighting;

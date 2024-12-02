'use client';
import { useEffect } from 'react';

function ARCamera() {
  useEffect(() => {
    if (
      !window.AFRAME ||
      AFRAME.components['camera-background-plane']
    )
      return;

    AFRAME.registerComponent('camera-background-plane', {
      schema: {
        distance: { type: 'number', default: -3 },
      },

      init() {
        this.video = document.createElement('video');
        this.video.setAttribute('autoplay', true);
        this.video.setAttribute('playsinline', true);
        this.video.setAttribute('webkit-playsinline', true);

        const setupPlane = () => {
          if (!this.video.videoWidth) return;

          const fov = this.el.sceneEl.camera.fov;
          const distance = Math.abs(this.data.distance);
          const vFov = THREE.MathUtils.degToRad(fov);
          const height = 2 * Math.tan(vFov / 2) * distance;
          const width =
            height * (window.innerWidth / window.innerHeight);

          if (this.plane) {
            this.el.removeObject3D('mesh');
          }

          const geometry = new THREE.PlaneGeometry(width, height);
          const material = new THREE.MeshBasicMaterial({
            map: new THREE.VideoTexture(this.video),
            side: THREE.DoubleSide,
          });

          this.plane = new THREE.Mesh(geometry, material);
          this.plane.position.z = this.data.distance;
          this.el.setObject3D('mesh', this.plane);
        };

        if (navigator.mediaDevices?.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia({
              video: {
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
            })
            .then((stream) => {
              this.video.srcObject = stream;
              this.video.play();
              this.video.addEventListener(
                'loadedmetadata',
                setupPlane
              );
            })
            .catch(console.error);
        }

        window.addEventListener('resize', setupPlane);
      },
    });
  }, []);

  return (
    <a-camera
      position="0 0.4 0"
      wasd-controls="enabled: false"
      look-controls="enabled: false"
    >
      <a-entity camera-background-plane="distance: -3"></a-entity>
    </a-camera>
  );
}

export default ARCamera;

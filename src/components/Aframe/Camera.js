'use client';
import { useEffect } from 'react';

function Camera({
  isAR = false,
  enableWASD = false,
  enableLook = true,
  position = '0 0.4 0',
  raycastType = null, // 'gaze', 'click', or 'gazeclick'
}) {
  useEffect(() => {
    if (!window.AFRAME) return;

    // AR Background setup
    if (isAR) {
      if (!AFRAME.components['camera-background-plane']) {
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
      }
    }

    // Raycasting setup
    const setupRaycasting = () => {
      const cameraEntity = document.querySelector('a-camera');
      if (!cameraEntity) {
        console.warn('Camera entity not found, retrying...');
        setTimeout(setupRaycasting, 100); // Retry after a short delay
        return;
      }

      console.log('Camera entity found, setting up raycasting.');

      const existingRaycaster =
        cameraEntity.querySelector('[raycaster]');
      if (existingRaycaster) {
        existingRaycaster.parentNode.removeChild(existingRaycaster);
        console.log('Removed existing raycaster.');
      }

      const raycasterEntity = document.createElement('a-entity');
      raycasterEntity.setAttribute('raycaster', {
        objects: '.selectable',
        far: 100,
        interval: 100,
      });

      // Add gaze interactions
      if (raycastType?.includes('gaze')) {
        raycasterEntity.addEventListener(
          'raycaster-intersection',
          (e) => {
            console.log(
              'Gaze intersection detected with:',
              e.detail.intersectedEls
            );
          }
        );

        raycasterEntity.addEventListener(
          'raycaster-intersection-cleared',
          () => {
            console.log('Gaze intersection cleared.');
          }
        );
      }

      // Add click interactions
      if (raycastType?.includes('click')) {
        raycasterEntity.addEventListener('click', (e) => {
          console.log('Click detected on:', e.target);
        });
      }

      cameraEntity.appendChild(raycasterEntity);
      console.log('Raycaster entity appended.');
    };

    if (raycastType) {
      setupRaycasting();
    }

    return () => {
      const raycasterEntity = document.querySelector('[raycaster]');
      if (raycasterEntity) {
        raycasterEntity.parentNode.removeChild(raycasterEntity);
        console.log('Cleaned up raycaster.');
      }
    };
  }, [isAR, raycastType]);

  return (
    <a-camera
      position={position}
      wasd-controls={`enabled: ${enableWASD}`}
      look-controls={`enabled: ${enableLook}`}
    >
      {isAR && (
        <a-entity camera-background-plane="distance: -3"></a-entity>
      )}
    </a-camera>
  );
}

export default Camera;

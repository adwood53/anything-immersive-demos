'use client';
import { useEffect, useRef } from 'react';

function Camera({ config = {} }) {
  const {
    position = '0 0 0',
    rotation = '0 0 0',
    enableWASD = false,
    enableLook = true,
    raycastType = null, // 'gaze', 'click', or 'gazeclick'
  } = config; // Destructure the config object

  const cameraRef = useRef(null);

  useEffect(() => {
    const camera = cameraRef.current;

    // camera.object3D.rotation.reorder('YXZ');

    // Raycasting setup
    const setupRaycasting = () => {
      if (!camera) {
        console.warn('Camera entity not found, retrying...');
        setTimeout(setupRaycasting, 100); // Retry after a short delay
        return;
      }

      console.log('Camera entity found, setting up raycasting.');

      const existingRaycaster = camera.querySelector('[raycaster]');
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

      camera.appendChild(raycasterEntity);
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
  }, [config]);

  return (
    // <a-entity position={position} look-controls={`enabled: ${enableLook}`}>
    //   <a-camera
    //     camera={'active: true; fov: 75; near: 0.01; far: 1000;'}
    //     ref={cameraRef}
    //     position="0 0 0"
    //     rotation
    //     wasd-controls={`enabled: ${enableWASD}`}
    //     look-controls={`enabled: false`}
    //   ></a-camera>
    // </a-entity>
    <a-camera
      camera={'active: true; fov: 75; near: 0.01; far: 1000;'}
      ref={cameraRef}
      position={position}
      rotation={rotation}
      wasd-controls={`enabled: ${enableWASD}`}
      look-controls={`enabled: ${enableLook}`}
    ></a-camera>
  );
}

export default Camera;

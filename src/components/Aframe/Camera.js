'use client';
import { useEffect } from 'react';

function Camera({config = {}}) {
  const {
    position = '0 0.4 0',
    enableWASD = false,
    enableLook = true,
    raycastType = null, // 'gaze', 'click', or 'gazeclick'
  } = config; // Destructure the config object

  useEffect(() => {
    if (!window.AFRAME) return;

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
  }, [config]);

  return (
    <a-camera
      position={position}
      wasd-controls={`enabled: ${enableWASD}`}
      look-controls={`enabled: ${enableLook}`}
    >
    </a-camera>
  );
}

export default Camera;

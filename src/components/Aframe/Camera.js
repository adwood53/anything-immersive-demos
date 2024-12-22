'use client';
import { useEffect, useRef } from 'react';
import '@/aframe/components/quaternion-rotation';

function Camera({ config = {} }) {
  const {
    position = '0 0 0',
    rotation = '0 0 0',
    enableWASD = false,
    enableLook = true,
    raycaster = {},
  } = config;

  const cameraRef = useRef(null);
  const initCamPosition = useRef(false);

  useEffect(() => {
    const camera = cameraRef.current; // Store the current ref value here

    if (initCamPosition) {
      camera.setAttribute('position', '0 0 0');
    }

    if (raycaster.enabled) {
      const objects = raycaster.objects || '.interactable';
      const far = raycaster.far || 100;

      // Remove any existing raycaster entity if present
      const existingRaycasterEntity =
        camera.querySelector('[raycaster]');
      if (existingRaycasterEntity) {
        existingRaycasterEntity.parentNode.removeChild(
          existingRaycasterEntity
        );
      }

      // Create and configure the raycaster + cursor entity
      const raycasterEntity = document.createElement('a-entity');
      raycasterEntity.setAttribute(
        'raycaster',
        `objects: ${objects}; far: ${far}`
      );
      raycasterEntity.setAttribute('cursor', 'rayOrigin: mouse');

      camera.appendChild(raycasterEntity);
    }

    return () => {
      // Use the stored 'camera' variable instead of cameraRef.current
      if (camera) {
        const raycasterEntity = camera.querySelector('[raycaster]');
        if (raycasterEntity) {
          raycasterEntity.parentNode.removeChild(raycasterEntity);
        }
      }
    };
  }, [config, raycaster.enabled, raycaster.far, raycaster.objects]);

  return (
    <a-entity
      id="camera-controls"
      position={position}
      wasd-controls={`enabled: ${enableWASD}`}
      look-controls={`enabled: ${enableLook}`}
    >
      <a-camera
        camera={'active: true; fov: 75; near: 0.01; far: 1000;'}
        ref={cameraRef}
        position="0 0 0"
        rotation="0 0 0"
        quaternion-rotation
      ></a-camera>
    </a-entity>

    // <>
    //   <a-entity
    //     id="camera-controls"
    //     position={position}
    //     rotation
    //     wasd-controls={`enabled: ${enableWASD}`}
    //     look-controls={`enabled: false`}
    //   ></a-entity>
    //   <a-camera
    //     camera={'active: true; fov: 75; near: 0.01; far: 1000;'}
    //     ref={cameraRef}
    //     position={position}
    //     rotation={rotation}
    //     quaternion-rotation
    //     wasd-controls={`enabled: false`}
    //     look-controls={`enabled: false`}
    //   ></a-camera>
    // </>

    // <a-camera
    //   camera={'active: true; fov: 75; near: 0.01; far: 1000;'}
    //   ref={cameraRef}
    //   position="0 0 0"
    //   rotation
    //   quaternion-rotation
    //   wasd-controls={`enabled: false`}
    //   look-controls={`enabled: false`}
    // ></a-camera>

    //   <a-camera
    //     camera={'active: true; fov: 75; near: 0.01; far: 1000;'}
    //     ref={cameraRef}
    //     position={position}
    //     rotation={rotation}
    //     quaternion-rotation
    //     wasd-controls={`enabled: ${enableWASD}`}
    //     look-controls={`enabled: ${enableLook}`}
    //   ></a-camera>
  );
}

export default Camera;

// ModelContainer.js
'use client';
import { useEffect } from 'react';
import ControlButtons from './ControlButtons';

function ModelContainer({ position, rotation, scale, modelId, rotateY = true, rotateZ = true }) {
  useEffect(() => {
    if (!window.AFRAME || AFRAME.components['model-control']) return;

    AFRAME.registerComponent('model-control', {
      schema: {
        rotateY: { type: 'boolean', default: true },
        rotateZ: { type: 'boolean', default: true },
      },

      init() {
        this.touchStart = { x: 0, y: 0 };
        this.currentRotation = { y: 90, z: 0 };
        this.isRotating = false;
        this.currentZ = -1;
        this.setupTouchEvents();
        this.updateRotation();
      },

      setupTouchEvents() {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        document.addEventListener('contextmenu', (e) =>
          e.preventDefault()
        );

        const touchStartHandler = (e) => {
          if (e.target === canvas) {
            e.preventDefault();
            this.isRotating = true;
            this.touchStart.x =
              e.type === 'touchstart'
                ? e.touches[0].clientX
                : e.clientX;
            this.touchStart.y =
              e.type === 'touchstart'
                ? e.touches[0].clientY
                : e.clientY;
          }
        };

        const touchMoveHandler = (e) => {
          if (!this.isRotating) return;
          e.preventDefault();

          const currentX =
            e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
          const currentY =
            e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

          if (this.data.rotateY) {
            const deltaX = currentX - this.touchStart.x;
            this.currentRotation.y += deltaX * 0.25;
          }

          if (this.data.rotateZ) {
            const deltaY = currentY - this.touchStart.y;
            this.currentRotation.z += deltaY * 0.25;
          }

          this.updateRotation();

          this.touchStart.x = currentX;
          this.touchStart.y = currentY;
        };

        const touchEndHandler = () => {
          this.isRotating = false;
        };

        canvas.addEventListener('touchstart', touchStartHandler, {
          passive: false,
        });
        canvas.addEventListener('touchmove', touchMoveHandler, {
          passive: false,
        });
        canvas.addEventListener('touchend', touchEndHandler);
        canvas.addEventListener('mousedown', touchStartHandler);
        canvas.addEventListener('mousemove', touchMoveHandler);
        canvas.addEventListener('mouseup', touchEndHandler);
      },

      updatePosition(delta) {
        this.currentZ += delta;
        this.currentZ = Math.max(-2, Math.min(-0.3, this.currentZ));
        this.el.object3D.position.z = this.currentZ;
      },

      resetModel() {
        this.currentZ = -1;
        this.currentRotation = { y: 90, z: 0 };
        this.el.object3D.position.z = this.currentZ;
        this.updateRotation();
      },

      updateRotation() {
        this.el.object3D.rotation.y = THREE.MathUtils.degToRad(
          this.currentRotation.y
        );
        this.el.object3D.rotation.z = THREE.MathUtils.degToRad(
          this.currentRotation.z
        );
      },
    });
    const modelEntity = document.querySelector('[gltf-model]');
    modelEntity?.setAttribute('gltf-model', modelId);

    const envEntity = document.querySelector('[envMap]');
    envEntity?.setAttribute('envMap', '#reflection');
  }, []);

  return (
    <>
      <a-entity
        id="model-container"
        position="0 0.5 -1"
        scale="1 1 1"
        rotation="0 90 0"
        model-control={`rotateY: ${rotateY}; rotateZ: ${rotateZ}`}
        shadow
      >
        <a-entity
          gltf-model={modelId}
          position={position}
          rotation={rotation}
          scale={scale}
          shadow="cast: true; receive: true"
          material="roughness: 0.7; metalness: 0;"
        ></a-entity>
      </a-entity>
      <ControlButtons />
    </>
  );
}

export default ModelContainer;

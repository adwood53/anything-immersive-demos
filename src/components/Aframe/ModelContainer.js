'use client';
import { useEffect, useRef } from 'react';
import '@/aframe/components/animation-mixer-control';
import '@/aframe/components/disable-culling';

function ModelContainer({ config = {} }) {
  const {
    format = 'gltf',
    rotateY = true,
    rotateZ = true,
    position = '0 0 0',
    rotation = '0 0 0',
    scale = '1 1 1',
    modelPosition = '0 0 0',
    frustumCulled = true,
    animationEnabled = false,
    animationClip = '*',
    useRegExp = false,
    duration = 0,
    crossFadeDuration = 0,
    loop = 'repeat',
    repetitions = Infinity,
    timeScale = 1,
    clampWhenFinished = false,
    startAt = 0,
    modelId = '',
    assetId = 'model',
    mtlAssetId = 'material',
    interactive = false,
  } = config;

  const containerId = `model-container-${modelId}`;
  const interactionInitialized = useRef(false); // To ensure listeners attach only once

  // This function sets up the event listeners once the model is ready
  const initializeInteraction = () => {
    if (interactionInitialized.current) return;

    const container = document.querySelector(`#${containerId}`);
    const modelEntity = container?.querySelector(
      format === 'gltf' ? '[gltf-model]' : '[obj-model]'
    );

    // If not present or not interactive, do nothing
    if (!container || !modelEntity || !interactive) return;

    // Hover events on container
    container.addEventListener('mouseenter', () => {
      if (!container.isSelected) {
        const currentScale = container.getAttribute('scale');
        container.setAttribute('scale', {
          x: currentScale.x * 1.1,
          y: currentScale.y * 1.1,
          z: currentScale.z * 1.1,
        });
      }
    });

    container.addEventListener('mouseleave', () => {
      if (!container.isSelected) {
        const currentScale = container.getAttribute('scale');
        container.setAttribute('scale', {
          x: currentScale.x / 1.1,
          y: currentScale.y / 1.1,
          z: currentScale.z / 1.1,
        });
      }
    });

    // Click event on model entity
    modelEntity.addEventListener('click', (e) => {
      console.log('Clicked model once', e);
      container.isSelected = !container.isSelected;

      container.sceneEl.dispatchEvent(
        new CustomEvent('model-selection-changed', {
          detail: {
            modelId: modelId,
            selected: container.isSelected,
          },
        })
      );

      const currentScale = container.getAttribute('scale');
      const factor = container.isSelected ? 1.1 : 1 / 1.1;
      container.setAttribute('scale', {
        x: currentScale.x * factor,
        y: currentScale.y * factor,
        z: currentScale.z * factor,
      });
    });

    interactionInitialized.current = true;
  };

  useEffect(() => {
    // Register model-control if not done
    if (!AFRAME.components['model-control']) {
      AFRAME.registerComponent('model-control', {
        schema: {
          rotateY: { type: 'boolean', default: true },
          rotateZ: { type: 'boolean', default: true },
          modelId: { type: 'string' },
        },

        init() {
          const position = this.el.object3D.position;
          this.initialPosition = {
            x: position.x,
            y: position.y,
            z: position.z,
          };
          this.currentPosition = { ...this.initialPosition };
          this.touchStart = { x: 0, y: 0 };
          this.currentRotation = { y: 90, z: 0 };
          this.isRotating = false;
          this.isSelected = false;
          this.setupTouchEvents();
          this.updateRotation();

          const event = new CustomEvent('model-registered', {
            detail: {
              modelId: this.data.modelId,
              element: this.el,
            },
          });
          this.el.sceneEl.dispatchEvent(event);
        },

        remove() {
          const event = new CustomEvent('model-unregistered', {
            detail: { modelId: this.data.modelId },
          });
          this.el.sceneEl.dispatchEvent(event);
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
              e.type === 'touchmove'
                ? e.touches[0].clientX
                : e.clientX;
            const currentY =
              e.type === 'touchmove'
                ? e.touches[0].clientY
                : e.clientY;

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
          this.currentPosition.z += delta;
          this.currentPosition.z = Math.max(
            this.initialPosition.z - 1,
            Math.min(
              this.initialPosition.z + 0.7,
              this.currentPosition.z
            )
          );
          this.el.object3D.position.z = this.currentPosition.z;
        },

        resetModel() {
          this.currentPosition = { ...this.initialPosition };
          this.currentRotation = { y: 90, z: 0 };
          this.el.object3D.position.copy(this.initialPosition);
          this.updateRotation();
        },

        updateRotation() {
          if (this.data.rotateY) {
            this.el.object3D.rotation.y = THREE.MathUtils.degToRad(
              this.currentRotation.y
            );
          }
          if (this.data.rotateZ) {
            this.el.object3D.rotation.z = THREE.MathUtils.degToRad(
              this.currentRotation.z
            );
          }
        },
      });
    }

    // Update model loading based on format
    const container = document.querySelector(`#${containerId}`);
    const modelSelector =
      format === 'gltf' ? '[gltf-model]' : '[obj-model]';
    const modelEntity = container?.querySelector(modelSelector);

    if (modelEntity) {
      if (format === 'obj') {
        modelEntity.setAttribute(
          'obj-model',
          `obj: #${assetId}; mtl: #${mtlAssetId}`
        );
      } else {
        modelEntity.setAttribute('gltf-model', `#${assetId}`);
      }
    }

    // We can try attaching listeners here once we confirm the elements
    // This ensures we only call initializeInteraction() once on component mount
    initializeInteraction();
  }, [
    format,
    modelId,
    assetId,
    mtlAssetId,
    interactive,
    animationEnabled,
    animationClip,
    useRegExp,
    duration,
    crossFadeDuration,
    loop,
    repetitions,
    timeScale,
    clampWhenFinished,
    startAt,
  ]);

  const modelProps =
    format === 'gltf'
      ? { 'gltf-model': `#${assetId}` }
      : { 'obj-model': `obj: #${assetId}; mtl: #${mtlAssetId}` };

  return (
    <a-entity
      id={containerId}
      class={`model-container${interactive ? ' selectable' : ''}`}
      position={position}
      scale={scale}
      rotation={rotation}
      model-control={`rotateY: ${rotateY}; rotateZ: ${rotateZ}; modelId: ${modelId}`}
    >
      <a-entity
        {...modelProps}
        class={`model${interactive ? ' interactable' : ''}`}
        position={modelPosition}
        shadow="cast: true; receive: true"
        disable-culling={frustumCulled ? undefined : ''}
        {...(animationEnabled
          ? {
              'animation-mixer-control': `
                enabled: ${animationEnabled};
                clip: ${animationClip};
                useRegExp: ${useRegExp};
                duration: ${duration};
                crossFadeDuration: ${crossFadeDuration};
                loop: ${loop};
                repetitions: ${repetitions};
                timeScale: ${timeScale};
                clampWhenFinished: ${clampWhenFinished};
                startAt: ${startAt}
              `,
            }
          : {})}
      />
    </a-entity>
  );
}

export default ModelContainer;

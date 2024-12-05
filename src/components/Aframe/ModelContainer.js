'use client';
import { useEffect } from 'react';

function ModelContainer({ config = {} }) {
  const {
    format = 'gltf',
    rotateY = true,
    rotateZ = true,
    position = '0 0.5 -1',
    rotation = '0 0 0',
    scale = '1 1 1',
    modelPosition = '0 -0.25 0',
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
    selectable = true,
  } = config; // Destructure the config object
  
  useEffect(() => {
    if (!window.AFRAME) return;

    if (!AFRAME.components['disable-culling']) {
      AFRAME.registerComponent('disable-culling', {
        init() {
          this.el.addEventListener('model-loaded', () => {
            const mesh = this.el.getObject3D('mesh');
            if (!mesh) return;
            mesh.traverse((node) => {
              if (node.isMesh) {
                node.frustumCulled = false;
              }
            });
          });
        },
      });
    }

    if (!AFRAME.components['model-control']) {
      AFRAME.registerComponent('model-control', {
        schema: {
          rotateY: { type: 'boolean', default: true },
          rotateZ: { type: 'boolean', default: true },
          modelId: { type: 'string' },
          selectable: { type: 'boolean', default: true },
        },

        init() {
          // Get initial position from the entity
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
          this.setupSelectionEvents();
          this.updateRotation();

          // Register with scene
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

        setupSelectionEvents() {
          if (!this.data.selectable) return;

          this.el.classList.add('selectable');

          this.el.addEventListener('click', () => {
            this.isSelected = !this.isSelected;
            this.el.emit('model-selection-changed', {
              modelId: this.data.modelId,
              selected: this.isSelected,
            });

            this.el.setAttribute(
              'scale',
              this.isSelected ? '1.1 1.1 1.1' : '1 1 1'
            );
          });

          this.el.addEventListener('mouseenter', () => {
            if (!this.isSelected) {
              this.el.setAttribute('scale', '1.05 1.05 1.05');
            }
          });

          this.el.addEventListener('mouseleave', () => {
            if (!this.isSelected) {
              this.el.setAttribute('scale', '1 1 1');
            }
          });
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
          // Use initial position as reference for limits
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
          // Reset to initial position
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

    if (!AFRAME.components['animation-mixer-control']) {
      AFRAME.registerComponent('animation-mixer-control', {
        schema: {
          enabled: { type: 'boolean', default: false },
          clip: { type: 'string', default: '*' },
          useRegExp: { type: 'boolean', default: false },
          duration: { type: 'number', default: 0 },
          crossFadeDuration: { type: 'number', default: 0 },
          loop: { type: 'string', default: 'repeat' },
          repetitions: { type: 'number', default: Infinity },
          timeScale: { type: 'number', default: 1 },
          clampWhenFinished: { type: 'boolean', default: false },
          startAt: { type: 'number', default: 0 },
        },

        init() {
          const self = this;

          this.el.addEventListener(
            'model-loaded',
            function setupAnimation() {
              if (!self.data.enabled) return;

              const model = self.el.getObject3D('mesh');
              if (!model) return;

              const mixer = new THREE.AnimationMixer(model);
              const animations =
                model.animations || self.el.animations;
              if (!animations) return;

              const clipName = self.data.useRegExp
                ? new RegExp(self.data.clip)
                : self.data.clip;

              const clips = animations.filter((clip) =>
                typeof clipName === 'string'
                  ? clip.name === clipName
                  : clipName.test(clip.name)
              );

              if (clips.length) {
                clips.forEach((clip) => {
                  const action = mixer.clipAction(clip);
                  action.loop =
                    self.data.loop === 'once'
                      ? THREE.LoopOnce
                      : self.data.loop === 'pingpong'
                      ? THREE.LoopPingPong
                      : THREE.LoopRepeat;

                  action.repetitions =
                    self.data.loop === 'once'
                      ? 1
                      : self.data.repetitions;
                  action.clampWhenFinished =
                    self.data.clampWhenFinished;
                  action.timeScale = self.data.timeScale;
                  action.startAt = self.data.startAt;
                  action.play();
                });
              }

              self.mixer = mixer;
            }
          );
        },

        tick(time, delta) {
          if (this.mixer) this.mixer.update(delta / 1000);
        },
      });
    }

    // Update model loading based on format and specific model entity
    const modelEntity = document.querySelector(
      `#model-container-${modelId} [${
        format === 'gltf' ? 'gltf-model' : 'obj-model'
      }]`
    );
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
  }, [config]);

  const modelProps =
    format === 'gltf'
      ? { 'gltf-model': `#${assetId}` }
      : { 'obj-model': `obj: #${assetId}; mtl: #${mtlAssetId}` };

  return (
    <a-entity
      id={`model-container-${modelId}`}
      class="model-container"
      position={position}
      scale={scale}
      rotation={rotation}
      model-control={`
        rotateY: ${rotateY}; 
        rotateZ: ${rotateZ}; 
        modelId: ${modelId};
        selectable: ${selectable}
      `}
    >
      <a-entity
        {...modelProps}
        position={modelPosition}
        shadow="cast: true; receive: true"
        disable-culling={!frustumCulled ? '' : undefined}
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
      ></a-entity>
    </a-entity>
  );
}

export default ModelContainer;

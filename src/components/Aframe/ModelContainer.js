'use client';
import { useEffect } from 'react';
import ControlButtons from './ControlButtons';

function ModelContainer({
  format = 'gltf', // Determines if GLTF or OBJ format is used
  rotateY = true,
  rotateZ = true,
  position = '0 0.5 -1',
  rotation = '0 0 0',
  modelPosition = '0 -0.25 0',
  frustumCulled = true,
  animationEnabled = false, // Default to true for GLTF, auto-disabled for OBJ
  animationClip = '*', // Default to play all clips
  useRegExp = false,
  duration = 0,
  crossFadeDuration = 0,
  loop = 'repeat',
  repetitions = Infinity,
  timeScale = 1,
  clampWhenFinished = false,
  startAt = 0,
}) {
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

    // Register animation-mixer-control
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
          this.el.addEventListener('model-loaded', () => {
            if (!this.data.enabled) return;

            const model = this.el.getObject3D('mesh');
            if (!model) return;

            const mixer = new THREE.AnimationMixer(model);
            const animations = model.animations || this.el.animations;

            const clipName = this.data.useRegExp
              ? new RegExp(this.data.clip)
              : this.data.clip;

            const clips = animations.filter((clip) =>
              typeof clipName === 'string'
                ? clip.name === clipName
                : clipName.test(clip.name)
            );

            if (clips.length) {
              clips.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.loop =
                  this.data.loop === 'once'
                    ? THREE.LoopOnce
                    : this.data.loop === 'pingpong'
                    ? THREE.LoopPingPong
                    : THREE.LoopRepeat;

                action.repetitions =
                  this.data.loop === 'once'
                    ? 1
                    : this.data.repetitions;
                action.clampWhenFinished =
                  this.data.clampWhenFinished;
                action.timeScale = this.data.timeScale;
                action.startAt = this.data.startAt;
                action.play();
              });
            }

            this.mixer = mixer;
          });
        },

        tick(time, delta) {
          if (this.mixer) this.mixer.update(delta / 1000);
        },
      });
    }

    // Set up model loading based on format
    if (format === 'obj') {
      const modelEntity = document.querySelector('[obj-model]');
      if (modelEntity) {
        modelEntity.setAttribute(
          'obj-model',
          'obj: #model; mtl: #material'
        );
      }
    } else {
      const modelEntity = document.querySelector('[gltf-model]');
      if (modelEntity) {
        modelEntity.setAttribute('gltf-model', '#model');
      }
    }
  }, [format]);

  const modelProps =
    format === 'gltf'
      ? { 'gltf-model': '#model' }
      : { 'obj-model': 'obj: #model; mtl: #material' };

  return (
    <>
      <a-entity
        id="model-container"
        position={position}
        scale="1 1 1"
        rotation={rotation}
        model-control={`rotateY: ${rotateY}; rotateZ: ${rotateZ}`}
      >
        <a-entity
          {...modelProps}
          position={modelPosition}
          shadow="cast: true; receive: true"
          {...(!frustumCulled && { 'disable-culling': '' })}
          animation-mixer-control={`enabled: ${animationEnabled}; clip: ${animationClip}; useRegExp: ${useRegExp}; duration: ${duration}; crossFadeDuration: ${crossFadeDuration}; loop: ${loop}; repetitions: ${repetitions}; timeScale: ${timeScale}; clampWhenFinished: ${clampWhenFinished}; startAt: ${startAt}`}
        ></a-entity>
      </a-entity>
      <ControlButtons />
    </>
  );
}

export default ModelContainer;

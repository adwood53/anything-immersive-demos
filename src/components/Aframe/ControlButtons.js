'use client';
import { useEffect, useState } from 'react';

function ControlButtons({
  effectAll = true,
  selectionMode = null,
  gazeTimeout = 1500,
}) {
  const [visible, setVisible] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [registeredModels, setRegisteredModels] = useState(new Set());

  useEffect(() => {
    if (!window.AFRAME) return;

    // Register the gaze cursor component if using gaze selection
    if (
      selectionMode === 'gaze' &&
      !AFRAME.components['gaze-cursor']
    ) {
      AFRAME.registerComponent('gaze-cursor', {
        schema: {
          timeout: { type: 'number', default: 1500 },
          color: { type: 'color', default: '#FFFFFF' },
          activeColor: { type: 'color', default: '#00FF00' },
        },

        init() {
          this.createCursor();
          this.setupGazeListeners();
        },

        createCursor() {
          // Main cursor ring
          const ring = document.createElement('a-ring');
          ring.setAttribute('radius-inner', '0.02');
          ring.setAttribute('radius-outer', '0.03');
          ring.setAttribute('position', '0 0 -1');
          ring.setAttribute('material', {
            color: this.data.color,
            shader: 'flat',
            opacity: 0.9,
            transparent: true,
          });
          this.el.appendChild(ring);
          this.cursorRing = ring;

          // Progress ring for gaze timer
          const progress = document.createElement('a-ring');
          progress.setAttribute('radius-inner', '0.024');
          progress.setAttribute('radius-outer', '0.026');
          progress.setAttribute('position', '0 0 -0.999');
          progress.setAttribute('material', {
            color: this.data.activeColor,
            shader: 'flat',
            opacity: 0,
            transparent: true,
          });
          progress.setAttribute('theta-length', 0);
          progress.setAttribute('visible', false);
          this.el.appendChild(progress);
          this.progressRing = progress;
        },

        setupGazeListeners() {
          let gazeStartTime = null;
          let animationFrame = null;

          const updateProgress = (timestamp) => {
            if (!gazeStartTime) return;

            const elapsed = timestamp - gazeStartTime;
            const progress = Math.min(elapsed / this.data.timeout, 1);

            if (this.progressRing) {
              this.progressRing.setAttribute('visible', true);
              this.progressRing.setAttribute(
                'theta-length',
                progress * 360
              );
              this.progressRing.setAttribute(
                'material',
                'opacity',
                progress * 0.9
              );
            }

            if (progress < 1) {
              animationFrame = requestAnimationFrame(updateProgress);
            } else {
              // Trigger click on completion
              const intersectedEl =
                this.el.components.raycaster?.intersectedEls[0];
              if (intersectedEl) {
                const clickEvent = new MouseEvent('click', {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                });
                intersectedEl.dispatchEvent(clickEvent);
              }
              this.resetGaze();
            }
          };

          this.resetGaze = () => {
            gazeStartTime = null;
            if (animationFrame) {
              cancelAnimationFrame(animationFrame);
            }
            if (this.progressRing) {
              this.progressRing.setAttribute('visible', false);
              this.progressRing.setAttribute('theta-length', 0);
              this.progressRing.setAttribute(
                'material',
                'opacity',
                0
              );
            }
            this.cursorRing.setAttribute(
              'material',
              'color',
              this.data.color
            );
          };

          this.el.addEventListener('raycaster-intersection', () => {
            if (!gazeStartTime) {
              gazeStartTime = performance.now();
              this.cursorRing.setAttribute(
                'material',
                'color',
                this.data.activeColor
              );
              animationFrame = requestAnimationFrame(updateProgress);
            }
          });

          this.el.addEventListener(
            'raycaster-intersection-cleared',
            () => {
              this.resetGaze();
            }
          );
        },
      });
    }

    // Setup camera and raycaster for gaze mode
    const setupGazeSystem = () => {
      if (selectionMode === 'gaze') {
        const camera = document.querySelector('[camera]');
        if (!camera) {
          setTimeout(setupGazeSystem, 100);
          return;
        }

        // Remove existing raycaster if any
        const existingRaycaster = camera.querySelector('[raycaster]');
        if (existingRaycaster) {
          existingRaycaster.parentNode.removeChild(existingRaycaster);
        }

        // Create raycaster entity with cursor
        const raycasterEntity = document.createElement('a-entity');
        raycasterEntity.setAttribute('raycaster', {
          objects: '.selectable',
          far: 100,
          interval: 100,
        });

        // Create gaze cursor
        const cursor = document.createElement('a-entity');
        cursor.setAttribute('gaze-cursor', {
          timeout: gazeTimeout,
          color: '#FFFFFF',
          activeColor: '#00FF00',
        });

        raycasterEntity.appendChild(cursor);
        camera.appendChild(raycasterEntity);
      }
    };

    if (selectionMode === 'gaze') {
      if (document.readyState === 'complete') {
        setupGazeSystem();
      } else {
        window.addEventListener('load', setupGazeSystem);
      }
    }

    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Model registration and selection handlers
    const handleModelRegistered = (event) => {
      setRegisteredModels((prev) => {
        const newSet = new Set(prev);
        newSet.add(event.detail.modelId);
        return newSet;
      });
      setVisible(true);
    };

    const handleModelUnregistered = (event) => {
      setRegisteredModels((prev) => {
        const newSet = new Set(prev);
        newSet.delete(event.detail.modelId);
        if (newSet.size === 0) setVisible(false);
        return newSet;
      });
    };

    const handleModelSelected = (event) => {
      if (!effectAll) {
        // Deselect previous model if exists
        if (
          selectedModelId &&
          selectedModelId !== event.detail.modelId
        ) {
          const prevModel = document.querySelector(
            `#model-container-${selectedModelId}`
          );
          if (prevModel?.components['model-control']) {
            prevModel.components['model-control'].isSelected = false;
            prevModel.setAttribute('scale', '1 1 1');
          }
        }

        setSelectedModelId(
          event.detail.selected ? event.detail.modelId : null
        );
      }
    };

    scene.addEventListener('model-registered', handleModelRegistered);
    scene.addEventListener(
      'model-unregistered',
      handleModelUnregistered
    );
    scene.addEventListener(
      'model-selection-changed',
      handleModelSelected
    );

    return () => {
      window.removeEventListener('load', setupGazeSystem);
      if (scene) {
        scene.removeEventListener(
          'model-registered',
          handleModelRegistered
        );
        scene.removeEventListener(
          'model-unregistered',
          handleModelUnregistered
        );
        scene.removeEventListener(
          'model-selection-changed',
          handleModelSelected
        );
      }
    };
  }, [effectAll, selectionMode, gazeTimeout, setSelectedModelId]);

  // Get models to control based on mode
  const getTargetModels = () => {
    if (effectAll) {
      return Array.from(
        document.querySelectorAll('.model-container')
      );
    } else if (selectedModelId) {
      const selected = document.querySelector(
        `#model-container-${selectedModelId}`
      );
      return selected ? [selected] : [];
    }
    return [];
  };

  const handleZoom = (delta) => {
    const targets = getTargetModels();
    targets.forEach((model) => {
      const control = model.components['model-control'];
      if (control) {
        control.updatePosition(delta);
      }
    });
  };

  const handleReset = () => {
    const targets = getTargetModels();
    targets.forEach((model) => {
      const control = model.components['model-control'];
      if (control) {
        control.resetModel();
      }
    });
  };

  if (!visible) return null;

  return (
    <div className="control-buttons">
      <button className="control-btn" onClick={() => handleZoom(0.1)}>
        −
      </button>
      <button className="control-btn reset-btn" onClick={handleReset}>
        RESET
      </button>
      <button
        className="control-btn"
        onClick={() => handleZoom(-0.1)}
      >
        +
      </button>

      <style jsx>{`
        .control-buttons {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          gap: 10px;
          touch-action: none;
          opacity: ${visible ? 1 : 0};
          transition: opacity 0.3s ease;
          pointer-events: ${visible ? 'auto' : 'none'};
        }
        .control-btn {
          appearance: none;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          padding: 0;
          touch-action: none;
          user-select: none;
          transition: transform 0.1s, background-color 0.1s;
        }
        .control-btn:active {
          transform: scale(0.95);
          background: rgba(0, 0, 0, 0.7);
        }
        .control-btn:hover {
          background: rgba(0, 0, 0, 0.8);
        }
        .reset-btn {
          font-size: 18px;
          width: 80px;
          border-radius: 30px;
        }
      `}</style>
    </div>
  );
}

export default ControlButtons;

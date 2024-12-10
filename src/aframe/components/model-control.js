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
if (!AFRAME.components['gaze-cursor']) {
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
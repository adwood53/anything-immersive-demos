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
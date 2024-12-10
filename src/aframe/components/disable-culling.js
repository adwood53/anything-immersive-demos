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
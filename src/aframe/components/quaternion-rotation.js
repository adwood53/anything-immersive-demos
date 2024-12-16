if (!AFRAME.components["quaternion-rotation"])
{
  AFRAME.registerComponent("quaternion-rotation", {
    schema: {type: 'vec4'},

    init: function () {
      this.object3D = this.el.object3D;
      //this.object3D.rotation.reorder('YXZ');
    },
    
    update: function () {
      const data = this.data;
      this.object3D.quaternion.set(data.x, data.y, data.z, data.w);
    },
  });
}

if (!AFRAME.components['rotation-offset']) {
    AFRAME.registerComponent('rotation-offset', {
        schema: {
            pitch: { type: 'number', default: 0 }, // Rotation offset around X-axis
            yaw: { type: 'number', default: 0 }, // Rotation offset around Y-axis
            roll: { type: 'number', default: 0 }, // Rotation offset around Z-axis
        },

        init: function () {
            this.el.sceneEl.addEventListener('loaded', () => {
            this.applyOffset();
            });
        },

        applyOffset: function () {
            const rotation = this.el.getAttribute('rotation');
            const offset = this.data;

            // Add the offset to the existing rotation
            const newRotation = {
            x: rotation.x + offset.pitch,
            y: rotation.y + offset.yaw,
            z: rotation.z + offset.roll,
            };

            // Apply the updated rotation
            this.el.setAttribute('rotation', newRotation);
        },
    });
}
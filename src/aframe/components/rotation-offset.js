if (!AFRAME.components['rotation-offset']) {
    AFRAME.registerComponent('rotation-offset', {
        schema: {
            x: { type: 'number', default: 0 },
            y: { type: 'number', default: 0 },
            z: { type: 'number', default: 0 }
        },

        // Called on init and schema changes
        update: function () {
            this.applyOffset();
        },

        applyOffset: function () {
            const rotation = this.el.getAttribute('rotation');
            const offset = this.data;

            console.log(rotation);
            console.log(offset);
            // Add the offset to the existing rotation
            const newRotation = {
                x: rotation.x + offset.x,
                y: rotation.y + offset.y,
                z: rotation.z + offset.z
            };

            // Apply the updated rotation
            this.el.setAttribute('rotation', newRotation);
            console.log(newRotation);
        },
    });
}
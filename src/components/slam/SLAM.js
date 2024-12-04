'use client';

import { useEffect } from 'react';

const SLAM = () => {
  useEffect(() => {
    const initializeSLAM = async () => {

      // Start the loop
      setTimeout(async () => {
        const [{ onFrame }, { AlvaAR }] = await Promise.all([
          import('@/slam/assets/utils.js'),
          import('@/slam/assets/alva_ar.js')
        ]);

        const deviceViewCanvas = document.getElementById("device-camera-view");
        const ctx = deviceViewCanvas.getContext('2d', { willReadFrequently: true, alpha: false, desynchronized: true });
        const alva = await AlvaAR.Initialize(deviceViewCanvas.width, deviceViewCanvas.height);

        document.body.addEventListener('click', () => alva.reset(), false);

        onFrame(() => {
          if (!document.hidden) {
            const frame = ctx.getImageData(0, 0, deviceViewCanvas.width, deviceViewCanvas.height);
            const pose = alva.findCameraPose(frame);

            if (pose) {
              // console.log("have pose");

              const m = new THREE.Matrix4().fromArray(pose);
              const r = new THREE.Quaternion().setFromRotationMatrix(m);
              const t = new THREE.Vector3(pose[12], pose[13], pose[14]);

              const camera = document.querySelector("a-camera");
              camera.setAttribute('position', { x: t.x, y: -t.y, z: -t.z });
              camera.setAttribute('rotation', { x: -r.x, y: r.y, z: r.z, w: r.w });
            } else {
              // console.log("lost pose");

              const dots = alva.getFramePoints();
              for (const p of dots) {
                ctx.fillStyle = 'white';
                ctx.fillRect(p.x, p.y, 2, 2);
              }
            }
          }
  
          return true;
        }, 60);
      }, 3000); // Delay of 3000ms (3 seconds)
    };

    initializeSLAM().catch((error) => {
      console.error('Error initializing SLAM:', error);
    });
  }, []);

  return (
    <>
    </>
  );
};

export default SLAM;

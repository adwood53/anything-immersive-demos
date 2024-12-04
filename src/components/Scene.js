'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
// import Plane from '@/components/Aframe/Plane';

function Scene({ template }) {
  if (!template)
    return;

  const [isAframeLoaded, setIsAframeLoaded] = useState(false);

  // In App Router, basePath is available from the environment
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.AFRAME) {
      setIsAframeLoaded(true);
    }
  }, []);

  if (!isAframeLoaded) return null;

  const getComponent = (condition, path) => 
    condition ? dynamic(() => import(`@/components/${path}`), { ssr: false }) : null;

  const DeviceCamera = getComponent(
    template.background.type === "devicecamera",
    'slam/DeviceCamera'
  );
  const SLAM = getComponent(
    template.background.useSlam,
    'slam/SLAM'
  );
  const Camera = getComponent(
    template.camera != null,
    'Aframe/Camera'
  );
  const Lighting = getComponent(
    template.lighting != null,
    'Aframe/Lighting'
  );
  const ModelContainer = getComponent(
    template.objects != null,
    'Aframe/ModelContainer'
  );
  const SkyImage = getComponent(
    template.background.type === "360image",
    'Aframe/SkyImage'
  );

  return (
    <>
      {DeviceCamera && <DeviceCamera facingMode={template.background.facingMode} />}
      {SLAM && <SLAM />}

      <a-scene
        renderer="colorManagement: true; physicallyCorrectLights: true; exposure: 1; toneMapping: ACESFilmic; antialias: true;"
        shadow="type: pcfsoft"
        vr-mode-ui="enabled: false"
      >
        <a-assets>
          {template.objects?.map((object) => (
            <a-asset-item
              key={object.modelId}
              id={object.modelId}
              src={`${basePath}/${object.modelUrl}`}
              response-type="arraybuffer"
            ></a-asset-item>
          ))}
          {SkyImage &&
            <img 
              id="sky"
              src={`${basePath}/${template.background.url}`}
            />
          }
        </a-assets>
        {Camera && <Camera enableWASD={template.camera.enableWASD} enableLook={template.camera.enableLook} />}
        {Lighting && <Lighting />}
        {template.objects?.map((object) => (
          <ModelContainer
            key={object.modelId}
            position={object.position || "0 0 0"}
            rotation={object.rotation || "0 0 0"}
            scale={object.scale || "1 1 1"}
            modelId={`#${object.modelId}`}
          />
        ))}
        {/* <Plane /> */}
        {SkyImage && <SkyImage />}
      </a-scene>
    </>
  );
}

export default Scene;

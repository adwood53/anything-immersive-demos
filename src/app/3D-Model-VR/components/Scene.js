'use client';
import { useEffect, useState } from 'react';
import Camera from '@/components/Aframe/Camera';
import Lighting from '@/components/Aframe/Lighting';
import ModelContainer from '@/components/Aframe/ModelContainer';
import Plane from '@/components/Aframe/Plane';
import SkyImage from '@/components/Aframe/SkyImage';

function Scene() {
  const [isAframeLoaded, setIsAframeLoaded] = useState(false);

  // In App Router, basePath is available from the environment
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.AFRAME) {
      setIsAframeLoaded(true);
    }
  }, []);

  if (!isAframeLoaded) return null;

  return (
    <a-scene
      renderer="colorManagement: true; physicallyCorrectLights: true; exposure: 1; toneMapping: ACESFilmic; antialias: true;"
      shadow="type: pcfsoft"
      vr-mode-ui="enabled: false"
    >
      <a-assets>
        <a-asset-item
          id="model"
          src={`${basePath}/3D-Model-AR/your-model.glb`}
          response-type="arraybuffer"
        ></a-asset-item>
        <img
          id="sky"
          src={`${basePath}/3D-Model-VR/puydesancy.jpg`}
        />
      </a-assets>
      <Camera isAR={false} enableWASD={false} enableLook={true} />
      <Lighting />
      <ModelContainer rotateY={true} rotateZ={false} />
      <Plane />
      <SkyImage />
    </a-scene>
  );
}

export default Scene;

'use client';
import { useEffect, useState } from 'react';
import ARCamera from './ARCamera';
import Lighting from './Lighting';
import ModelContainer from './ModelContainer';
import Plane from './Plane';

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
      </a-assets>
      <ARCamera />
      <Lighting />
      <ModelContainer />
      <Plane />
    </a-scene>
  );
}

export default Scene;

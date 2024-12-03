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
          src={`${basePath}/3D-Model-VR/idle-automaton.glb`}
          response-type="arraybuffer"
        ></a-asset-item>
        <img
          id="sky"
          src={`${basePath}/3D-Model-VR/puydesancy.jpg`}
        />
      </a-assets>
      <Camera
        isAR={false}
        enableWASD={false}
        enableLook={true}
        position="0 0.8 0"
      />
      <Lighting />
      <ModelContainer
        format="gltf"
        rotateY={false}
        rotateZ={false}
        modelPosition="0.5 -1 -1"
        frustumCulled={false}
        animationEnabled={true}
        useRegExp={true}
        animationClip="mixamo.com|Layer0.001"
      />
      <Plane />
      <SkyImage />
    </a-scene>
  );
}

export default Scene;

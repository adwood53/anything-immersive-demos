'use client';

import { useEffect, useState } from 'react';
import Camera from '@/components/Aframe/Camera';
import Lighting from '@/components/Aframe/Lighting';
import ModelContainer from '@/components/Aframe/ModelContainer';
import ControlButtons from '@/components/Aframe/ControlButtons';
import Plane from '@/components/Aframe/Plane';
import SkyImage from '@/components/Aframe/SkyImage';

function Scene() {
  const [isAframeLoaded, setIsAframeLoaded] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.AFRAME) {
      setIsAframeLoaded(true);
    }
  }, []);

  if (!isAframeLoaded) return null;

  return (
    <a-scene
      model-control-system
      renderer="colorManagement: true; physicallyCorrectLights: true; exposure: 1; toneMapping: ACESFilmic; antialias: true;"
      shadow="type: pcfsoft"
      vr-mode-ui="enabled: false"
    >
      <a-assets>
        <a-asset-item
          id="model1"
          src={`${basePath}/3D-Model-VR/idle-automaton.glb`}
          response-type="arraybuffer"
        ></a-asset-item>
        <a-asset-item
          id="model2"
          src={`${basePath}/3D-Model-AR/your-model.glb`}
          response-type="arraybuffer"
        ></a-asset-item>
        <img
          id="sky"
          src={`${basePath}/3D-Model-VR/puydesancy.jpg`}
          alt="Sky background"
        />
      </a-assets>

      <Camera
        isAR={false}
        enableWASD={false}
        enableLook={true}
        position="0 1.6 0"
        raycastType="gazeclick"
      />

      <Lighting />

      {/* Example with multiple models */}
      <ModelContainer
        modelId="model1"
        assetId="model1"
        format="gltf"
        position="-1 0 -2"
        modelPosition="0 0 0"
        scale="1 1 1"
        selectable={true}
        interactive={true}
        highlightColor="#00ff00"
        frustumCulled={false}
        animationEnabled={true}
        useRegExp={true}
        animationClip="mixamo.com|Layer0.001"
        rotateY={false}
        rotateZ={false}
      />

      <ModelContainer
        modelId="model2"
        assetId="model2"
        format="gltf"
        position="1 1.5 -2"
        modelPosition="0 -0.25 0"
        scale="1 1 1"
        selectable={true}
        interactive={true}
        highlightColor="#00ff00"
        rotateY={true}
        rotateZ={false}
      />

      {/* Control buttons with gaze selection */}
      <ControlButtons
        effectAll={true}
        selectionMode="gaze"
        gazeTimeout={1}
      />

      <Plane />
      <SkyImage />
    </a-scene>
  );
}

export default Scene;

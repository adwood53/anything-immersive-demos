//Scene.js
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';

function Scene({ template }) {
  const [isComponentsReady, setIsComponentsReady] = useState(false);
  const [components, setComponents] = useState({});

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    const loadComponents = async () => {
      const componentImports = {};

      if (
        template.background.type === 'devicecamera' &&
        template.background.useSlam
      ) {
        componentImports.SLAMCamera = (
          await import('@/components/slam/SLAMCamera')
        ).default;
      }
      if (template.camera != null) {
        componentImports.Camera = (
          await import('@/components/Aframe/Camera')
        ).default;
      }
      if (template.lighting != null) {
        componentImports.Lighting = (
          await import('@/components/Aframe/Lighting')
        ).default;
      }
      if (template.objects != null) {
        componentImports.ModelContainer = (
          await import('@/components/Aframe/ModelContainer')
        ).default;
      }
      if (template.shadow) {
        componentImports.Plane = (
          await import('@/components/Aframe/Plane')
        ).default;
      }
      if (template.background.type === '360image') {
        componentImports.SkyImage = (
          await import('@/components/Aframe/SkyImage')
        ).default;
      }
      if (template.controlButtons != null) {
        componentImports.ControlButtons = (
          await import('@/components/Aframe/ControlButtons')
        ).default;
      }

      setComponents(componentImports);
      setIsComponentsReady(true);
    };

    loadComponents();
  }, [template]);

  if (!isComponentsReady) {
    return <>Loading...</>;
  }

  const {
    DeviceCamera,
    SLAM,
    SLAMCamera,
    Camera,
    Lighting,
    ModelContainer,
    Plane,
    SkyImage,
    ControlButtons,
    SLAMVideo,
  } = components;

  return (
    <>
      {SLAMCamera && <SLAMCamera />}
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
          {SkyImage && (
            <img
              id="sky"
              src={`${basePath}/${template.background.url}`}
              alt="sky"
            />
          )}
        </a-assets>
        {Camera && <Camera config={template.camera} />}
        {Lighting && <Lighting />}
        {template.objects?.map((object) => (
          <ModelContainer key={object.modelId} config={object} />
        ))}
        {Plane && <Plane />}
        {SkyImage && <SkyImage />}
      </a-scene>
      {ControlButtons && (
        <ControlButtons config={template.controlButtons} />
      )}
    </>
  );
}

export default Scene;

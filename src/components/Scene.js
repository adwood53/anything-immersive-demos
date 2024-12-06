'use client';

import { useEffect, useState } from 'react';

function Scene({ template }) {
  const [isComponentsReady, setIsComponentsReady] = useState(false);
  const [components, setComponents] = useState({});

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    const loadComponents = async () => {
      const componentImports = {};

      // if (template.background.type === 'devicecamera') {
      //   componentImports.DeviceCamera = (await import('@/components/DeviceCamera')).default;
      // }
      // if (template.background.useSlam) {
      //   componentImports.SLAM = (await import('@/components/slam/SLAM')).default;
      // }
      if (template.background.type === 'devicecamera' && template.background.useSlam) {
        componentImports.SLAMCamera = (await import('@/components/slam/SLAMCamera')).default;
      }
      if (template.camera != null) {
        componentImports.Camera = (await import('@/components/aframe/Camera')).default;
      }
      if (template.lighting != null) {
        componentImports.Lighting = (await import('@/components/aframe/Lighting')).default;
      }
      if (template.objects != null) {
        componentImports.ModelContainer = (await import('@/components/aframe/ModelContainer')).default;
      }
      if (template.shadow) {
        componentImports.Plane = (await import('@/components/aframe/Plane')).default;
      }
      if (template.background.type === '360image') {
        componentImports.SkyImage = (await import('@/components/aframe/SkyImage')).default;
      }
      if (template.controlButtons != null) {
        componentImports.ControlButtons = (await import('@/components/aframe/ControlButtons')).default;
      }
      // if (template.background.type === 'video') {
      //   componentImports.VideoPlayer = (await import('@/components/VideoPlayer')).default;
      // }
      if (template.background.type === 'video' && template.background.useSlam) {
        componentImports.SLAMVideo = (await import('@/components/slam/SLAMVideo')).default;
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
    // DeviceCamera,
    // SLAM,
    SLAMCamera,
    Camera,
    Lighting,
    ModelContainer,
    Plane,
    SkyImage,
    ControlButtons,
    // VideoPlayer,
    SLAMVideo
  } = components;

  return (
    <>
      {/* {DeviceCamera && <DeviceCamera facingMode={template.background.facingMode} />}
      {SLAM && <SLAM />} */}
      {/* <VideoPlayer videoSrc={`${basePath}/3D-Model-AR/video.mp4`} loop={true} /> */}
      {SLAMCamera && <SLAMCamera />}
      {SLAMVideo && <SLAMVideo videoSrc={`${basePath}/${template.background.url}`} />}
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
            <img id="sky" src={`${basePath}/${template.background.url}`} />
          )}
        </a-assets>
        {Camera && <Camera config={template.camera} />}
        {Lighting && <Lighting />}
        {template.objects?.map((object) => (
          <ModelContainer key={object.modelId} config={object} />
        ))}
        {ControlButtons && <ControlButtons config={template.controlButtons} />}
        {Plane && <Plane />}
        {SkyImage && <SkyImage />}
      </a-scene>
    </>
  );
}

export default Scene;

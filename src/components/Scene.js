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

  const renderPrimitive = (primitive, index) => {
    const { type, ...props } = primitive;
    const key = props.id || `primitive-${index}`;

    switch (type) {
      case 'a-box':
        return <a-box key={key} {...props} />;
      case 'a-camera':
        return <a-camera key={key} {...props} />;
      case 'a-circle':
        return <a-circle key={key} {...props} />;
      case 'a-cone':
        return <a-cone key={key} {...props} />;
      case 'a-cursor':
        return <a-cursor key={key} {...props} />;
      case 'a-curvedimage':
        return <a-curvedimage key={key} {...props} />;
      case 'a-cylinder':
        return <a-cylinder key={key} {...props} />;
      case 'a-dodecahedron':
        return <a-dodecahedron key={key} {...props} />;
      case 'a-gltf-model':
        // This is just a convenience primitive for GLTF;
        // you might not need it if you prefer your ModelContainer.
        return <a-gltf-model key={key} {...props} />;
      case 'a-icosahedron':
        return <a-icosahedron key={key} {...props} />;
      case 'a-image':
        return <a-image key={key} {...props} />;
      case 'a-light':
        return <a-light key={key} {...props} />;
      case 'a-link':
        return <a-link key={key} {...props} />;
      case 'a-obj-model':
        return <a-obj-model key={key} {...props} />;
      case 'a-octahedron':
        return <a-octahedron key={key} {...props} />;
      case 'a-plane':
        return <a-plane key={key} {...props} />;
      case 'a-ring':
        return <a-ring key={key} {...props} />;
      case 'a-sky':
        return <a-sky key={key} {...props} />;
      case 'a-sound':
        return <a-sound key={key} {...props} />;
      case 'a-sphere':
        return <a-sphere key={key} {...props} />;
      case 'a-tetrahedron':
        return <a-tetrahedron key={key} {...props} />;
      case 'a-text':
        return <a-text key={key} {...props} />;
      case 'a-torus':
        return <a-torus key={key} {...props} />;
      case 'a-torus-knot':
        return <a-torus-knot key={key} {...props} />;
      case 'a-triangle':
        return <a-triangle key={key} {...props} />;
      case 'a-video':
        // Handle video with iOS playback support
        return (
          <a-video
            key={key}
            {...props}
            playsinline=""
            webkit-playsinline=""
            preload="auto"
            crossOrigin="anonymous"
            muted={props.muted || ''}
            autoplay={props.autoplay || ''}
            loop={props.loop || ''}
            onClick={(evt) => {
              const videoEl =
                evt.target.components.material.material.map.image;
              if (videoEl) {
                videoEl.play();
              }
            }}
          />
        );
      case 'a-videosphere':
        return <a-videosphere key={key} {...props} />;
      default:
        console.warn(
          `Unsupported or unknown primitive type: ${type}`
        );
        return null;
    }
  };

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
        {/* Render A-Frame primitives from JSON */}
        {template.primitives?.map(renderPrimitive)}
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

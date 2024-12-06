'use client';
import { useEffect } from 'react';
import "@/aframe/components/animation-mixer-control";
import "@/aframe/components/disable-culling";
import "@/aframe/components/model-control";

function ModelContainer({ config = {} }) {
  const {
    format = 'gltf',
    rotateY = true,
    rotateZ = true,
    position = '0 0 0',
    rotation = '0 0 0',
    scale = '1 1 1',
    modelPosition = '0 0 0',
    frustumCulled = true,
    animationEnabled = false,
    animationClip = '*',
    useRegExp = false,
    duration = 0,
    crossFadeDuration = 0,
    loop = 'repeat',
    repetitions = Infinity,
    timeScale = 1,
    clampWhenFinished = false,
    startAt = 0,
    modelId = '',
    assetId = 'model',
    mtlAssetId = 'material',
    selectable = true,
  } = config; // Destructure the config object
  
  useEffect(() => {
    // Update model loading based on format and specific model entity
    const modelEntity = document.querySelector(
      `#model-container-${modelId} [${
        format === 'gltf' ? 'gltf-model' : 'obj-model'
      }]`
    );
    if (modelEntity) {
      if (format === 'obj') {
        modelEntity.setAttribute(
          'obj-model',
          `obj: #${assetId}; mtl: #${mtlAssetId}`
        );
      } else {
        modelEntity.setAttribute('gltf-model', `#${assetId}`);
      }
    }
  }, [config]);

  const modelProps =
    format === 'gltf'
      ? { 'gltf-model': `#${assetId}` }
      : { 'obj-model': `obj: #${assetId}; mtl: #${mtlAssetId}` };

  return (
    <a-entity
      id={`model-container-${modelId}`}
      class="model-container"
      position={position}
      scale={scale}
      rotation={rotation}
      model-control={`
        rotateY: ${rotateY}; 
        rotateZ: ${rotateZ}; 
        modelId: ${modelId};
        selectable: ${selectable}
      `}
    >
      <a-entity
        {...modelProps}
        position={modelPosition}
        shadow="cast: true; receive: true"
        disable-culling={!frustumCulled ? '' : undefined}
        {...(animationEnabled
          ? {
              'animation-mixer-control': `
            enabled: ${animationEnabled}; 
            clip: ${animationClip}; 
            useRegExp: ${useRegExp}; 
            duration: ${duration}; 
            crossFadeDuration: ${crossFadeDuration}; 
            loop: ${loop}; 
            repetitions: ${repetitions}; 
            timeScale: ${timeScale}; 
            clampWhenFinished: ${clampWhenFinished}; 
            startAt: ${startAt}
          `,
            }
          : {})}
      ></a-entity>
    </a-entity>
  );
}

export default ModelContainer;

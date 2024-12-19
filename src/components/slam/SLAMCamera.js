'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './SLAMCamera.module.css';
import Slider from '@/components/Slider';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';

const CameraView = () => {
  const isSLAMInitializedRef = useRef(false);  // To track initialization status
  const [isSLAMInitialized, setIsSLAMInitialized] = useState(false);  // State for rendering debug content

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isFirstFrameLostPoseRef = useRef(true);
  const posePositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const poseRotationRef = useRef(new THREE.Quaternion(0, 0, 0, 1));
  const previousLookRotationRef = useRef(new THREE.Quaternion(0, 0, 0, 1));
  const alvaRef = useRef(null);

  let frameMaxCellSize = 40;
  let mapKeyframeFilteringRatio = 0.95;
  let isClaheEnabled = false;
  let isP3pEnabled = true;
  let isDebugEnabled = false;

  useEffect(() => {
    const camera = document.querySelector('a-camera');
    // const lookControls = document.getElementById('camera-controls');

    const initializeSLAM = async () => {
      const [{ AlvaAR }, { Camera, resize2cover, onFrame }] =
        await Promise.all([import('@/slam/assets/alva_ar.js'), import('@/slam/assets/utils.js')]);

      const $container = containerRef.current;
      const $canvas = canvasRef.current;

      const config = {
        video: {
          facingMode: 'environment',
          aspectRatio: 16 / 9,
          width: { ideal: 1280 },
        },
        audio: false,
      };
      const media = await Camera.Initialize(config);

      const $video = media.el;
      const size = resize2cover(
        $video.videoWidth,
        $video.videoHeight,
        $container.clientWidth,
        $container.clientHeight
      );

      $canvas.width = $container.clientWidth;
      $canvas.height = $container.clientHeight;
      $video.style.width = `${size.width}px`;
      $video.style.height = `${size.height}px`;

      const alva = await AlvaAR.Initialize($canvas.width, $canvas.height, 45, frameMaxCellSize, mapKeyframeFilteringRatio, isP3pEnabled, isClaheEnabled, isDebugEnabled);
      alvaRef.current = alva;
      document.body.addEventListener('click', () => alva.reset(), false);
      
      const ctx = $canvas.getContext('2d', { alpha: false, desynchronized: true });
      onFrame(() => {
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);

        if (!document['hidden']) {
          ctx.drawImage(
            $video,
            0,
            0,
            $video.videoWidth,
            $video.videoHeight,
            size.x,
            size.y,
            size.width,
            size.height
          );
          const frame = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
          const pose = alva.findCameraPose(frame);

          // const currentLookRotation = lookControls.object3D.quaternion;
          if (pose) {
            // if (isFirstFrameLostPoseRef.current == false) {
            //   lookControls.setAttribute("look-controls", "enabled: false");
            //   isFirstFrameLostPoseRef.current = true;
            // }
            
            const smoothingFactor = 0.5; // Adjust this value to control the smoothing speed
            const targetPosition = new THREE.Vector3(pose[12], pose[13], pose[14]);
            const poseMatrix = new THREE.Matrix4().fromArray(pose);
            const targetRotation = new THREE.Quaternion().setFromRotationMatrix(poseMatrix).normalize();

            targetPosition.y = -targetPosition.y;
            targetPosition.z = -targetPosition.z;
            targetRotation.x = -targetRotation.x;

            posePositionRef.current = posePositionRef.current.lerp(targetPosition, smoothingFactor);
            poseRotationRef.current = poseRotationRef.current.normalize().slerp(targetRotation, smoothingFactor).normalize();

            setCameraPosition(posePositionRef.current);
            setCameraRotation(poseRotationRef.current);
          } else {
            // if (isFirstFrameLostPoseRef.current == true) {
            //   lookControls.setAttribute("look-controls", "enabled: true");
            //   isFirstFrameLostPoseRef.current = false;
            // }
            
            // if (!previousLookRotationRef.current.equals(currentLookRotation)) {
            //   previousLookRotationRef.current.normalize();
            //   currentLookRotation.normalize();
            //   const lookVelocity = new THREE.Quaternion();
            //   lookVelocity.copy(currentLookRotation);
            //   lookVelocity.multiply(previousLookRotationRef.current.clone().invert());
            //   poseRotationRef.current.multiply(lookVelocity);
            //   poseRotationRef.current.normalize();
            //   setCameraRotation(poseRotationRef.current);
            // }

            // previousLookRotationRef.current.copy(currentLookRotation);
            
            const dots = alva.getFramePoints();
            for (const p of dots) {
              ctx.fillStyle = 'white';
              ctx.fillRect(p.x, p.y, 2, 2);
            }
          }
        }

        return true;
      }, 30);
    };

    if (!isSLAMInitializedRef.current) {
      isSLAMInitializedRef.current = true;  // Use ref to track if initialization has occurred
      initializeSLAM().then(() => {
        setIsSLAMInitialized(true); // Once SLAM is initialized, update the state to trigger rendering the debug content
      }).catch((error) => {
        console.error('Error initializing SLAM:', error);
      });
    }

    const setCameraPosition = (position) => {
      camera.setAttribute('position', {
        x: position.x,
        y: position.y,
        z: position.z
      });
    }
    
    const setCameraRotation = (rotation) => {
      camera.setAttribute('quaternion-rotation', {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z,
        w: rotation.w
      });
    }
  }, []);

  const onClaheToggle = (value) => {
    isClaheEnabled = value;
  };

  const onP3pToggle = (value) => {
    isP3pEnabled = value;
  };

  const onDebugToggle = (value) => {
    isDebugEnabled = value;
  };
  
  const onFrameMaxCellSizeChanged = (value) => {
    frameMaxCellSize = value;
  };

  const onMapKeyframeFilteringRatioChanged = (value) => {
    mapKeyframeFilteringRatio = value;
  };

  function onApplyClicked() {
    alvaRef.current.reconfigure(frameMaxCellSize, mapKeyframeFilteringRatio, isP3pEnabled, isClaheEnabled, isDebugEnabled);
  }

  return (
    <>
      {/* Render the debug content only when SLAM is initialized */}
      {isSLAMInitialized && (
        <div className={`${styles.debugContainer}`}>
          <Slider
            onValueChanged={onFrameMaxCellSizeChanged}
            minValue={10}
            maxValue={100}
            defaultValue={frameMaxCellSize}
            step={1}
            label={"Frame Max Cell Size:"}>
          </Slider>
          <Slider
            onValueChanged={onMapKeyframeFilteringRatioChanged}
            minValue={0}
            maxValue={1}
            defaultValue={mapKeyframeFilteringRatio}
            step={0.01}
            label={"Map Keyframe Filtering Ratio:"}>
          </Slider>
          <Toggle
            onToggle={onClaheToggle}
            defaultState={isClaheEnabled}
            label={"Use CLAHE"} />
          <Toggle
            onToggle={onP3pToggle}
            defaultState={isP3pEnabled}
            label={"Use P3P"} />
          <Toggle
            onToggle={onDebugToggle}
            defaultState={isDebugEnabled}
            label={"Debug Logs"} />
          <Button
            onClick={onApplyClicked}
            label={"APPLY"} />
        </div>
      )}

      <div className={`${styles.container}`} ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default CameraView;

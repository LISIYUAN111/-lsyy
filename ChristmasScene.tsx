import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { AppState } from '../types';
import { TreeParticles } from './TreeParticles';
import { PhotoCloud } from './PhotoCloud';
import { Meteors } from './Meteors';
import { OuterSnow } from './OuterSnow';
import { TopStar } from './TopStar';

interface ChristmasSceneProps {
  appState: AppState;
  setAppState: (s: AppState) => void;
  photos: string[];
  activePhotoIndex: number | null;
  setActivePhotoIndex: (n: number | null) => void;
  zoomLevel: number;
}

const CameraController = ({ appState, zoomLevel }: { appState: AppState, zoomLevel: number }) => {
    const { camera } = useThree();

    useFrame((state) => {
        // Apply zoom level (FOV scaling)
        if (camera instanceof THREE.PerspectiveCamera) {
            if (camera.zoom !== zoomLevel) {
                camera.zoom = zoomLevel;
                camera.updateProjectionMatrix();
            }
        }

        // In SCATTERED state, disable automatic camera control to allow OrbitControls to work
        if (appState === AppState.SCATTERED) return;

        // Subtle camera float logic for other states
        const t = state.clock.getElapsedTime();
        
        // Target positions based on state
        let targetPos = new THREE.Vector3(0, 0, 25);
        
        if (appState === AppState.PHOTO_VIEW) {
             targetPos.set(0, 0, 22); 
        } else {
             // Assembled - slow drift, slightly elevated to see star
             targetPos.set(Math.sin(t * 0.2) * 28, 2 + Math.sin(t * 0.1) * 2, Math.cos(t * 0.2) * 28);
        }
        
        camera.position.lerp(targetPos, 0.02);
        camera.lookAt(0, 1, 0); // Look slightly up
    });

    return null;
};

export const ChristmasScene: React.FC<ChristmasSceneProps> = ({ 
  appState, 
  setAppState, 
  photos,
  activePhotoIndex,
  setActivePhotoIndex,
  zoomLevel
}) => {
  const handleBackgroundClick = () => {
    // Single Click Logic
    if (appState === AppState.ASSEMBLED) {
        // 1. Click to Disperse
        setAppState(AppState.SCATTERED);
    } else if (appState === AppState.PHOTO_VIEW) {
        // Dismiss photo view if clicking background
        setAppState(AppState.SCATTERED); 
        setActivePhotoIndex(null);
    } 
    // If SCATTERED, do nothing on single click (allows dragging/rotation)
  };

  const handleBackgroundDoubleClick = () => {
      // 3. Double Click to Restore/Assemble
      setAppState(AppState.ASSEMBLED);
      setActivePhotoIndex(null);
  };

  const handlePhotoClick = (index: number) => {
      if (activePhotoIndex === index) {
          // Toggle off: if clicking the already zoomed photo, return it.
          setActivePhotoIndex(null);
          setAppState(AppState.SCATTERED);
      } else {
          // 2. Click photo to enlarge (works in Scattered state)
          setActivePhotoIndex(index);
          setAppState(AppState.PHOTO_VIEW);
      }
  };

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 25], fov: 45 }}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2, antialias: true }}
      className="w-full h-full"
      onClick={handleBackgroundClick}
      onDoubleClick={handleBackgroundDoubleClick}
    >
      <color attach="background" args={['#050505']} />
      
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={3} castShadow color="#ffd700" />
      <pointLight position={[-10, 10, -10]} intensity={2} color="#c41e3a" />
      <rectAreaLight width={10} height={10} intensity={2} position={[0, -10, 5]} color="#d4af37" rotation={[-Math.PI/2, 0, 0]} />
      
      <Environment preset="city" blur={1} background={false} />
      
      {/* Background Elements */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Meteors />
      
      {/* Scene Elements */}
      <Suspense fallback={null}>
        <TopStar />
        <OuterSnow />
        <TreeParticles appState={appState} count={1200} />
        <PhotoCloud 
            appState={appState} 
            photoUrls={photos} 
            onPhotoClick={handlePhotoClick}
            activePhotoIndex={activePhotoIndex}
        />
      </Suspense>

      <CameraController appState={appState} zoomLevel={zoomLevel} />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.6} mipmapBlur intensity={1.0} radius={0.4} />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
      
      {appState === AppState.SCATTERED && (
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate={false} 
            enableDamping 
            dampingFactor={0.05}
          />
      )}
    </Canvas>
  );
};
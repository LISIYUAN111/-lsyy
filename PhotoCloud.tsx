import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AppState } from '../types';

interface PhotoCloudProps {
  appState: AppState;
  photoUrls: string[];
  onPhotoClick: (index: number) => void;
  activePhotoIndex: number | null;
}

const PhotoFrame: React.FC<{
  url: string;
  index: number;
  appState: AppState;
  isActive: boolean;
  onClick: () => void;
}> = ({ url, index, appState, isActive, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Robust texture loading
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'Anonymous';
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.warn(`Failed to load texture for photo ${index}:`, url);
        setTexture(null); // Explicitly null to show placeholder
      }
    );
  }, [url, index]);
  
  // Pre-calculate positions & orientation
  const { treePos, scatterPos, treeRot } = useMemo(() => {
    // Tree parameters matching TreeParticles
    const TREE_HEIGHT = 22;
    const BASE_RADIUS = 7.5;
    
    // Spread photos vertically
    const heightRange = 12; // Focus on middle section
    const y = (index / 2.0) * heightRange - (heightRange / 2) + 2; 
    
    // Calculate exact radius at this height for "Backside fitted" placement
    const normalizedH = (y + TREE_HEIGHT/2) / TREE_HEIGHT;
    const radiusAtY = (1 - normalizedH) * BASE_RADIUS; 
    
    // Position angle
    const angle = (index / 3) * Math.PI * 2 + 1; // 120 degree separation if 3 photos
    
    // Position exactly on surface (maybe slightly inside -0.1 to nestle)
    const fitRadius = Math.max(0.1, radiusAtY - 0.2); 
    const treePos = new THREE.Vector3(
        Math.cos(angle) * fitRadius,
        y,
        Math.sin(angle) * fitRadius
    );

    // Orientation:
    // 1. Face outward (rotate Y by -angle + 90deg)
    // 2. Tilt back to match cone slope.
    // Cone Slope Angle: tan(theta) = radius / height = 7.5 / 22
    const tiltAngle = Math.atan(BASE_RADIUS / TREE_HEIGHT);
    
    // We construct the rotation Euler
    // Y Rotation to face 'out' from center: -angle - PI/2
    // X Rotation to tilt 'back': -tiltAngle
    // Order YXZ: First Y spin, then X tilt
    const treeRot = new THREE.Euler(-tiltAngle, -angle - Math.PI/2, 0, 'YXZ');
    
    const scatterPos = new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10 + 5 
    );
    
    return { treePos, scatterPos, treeRot };
  }, [index]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.getElapsedTime();
    const isAssembled = appState === AppState.ASSEMBLED;
    const isPhotoView = appState === AppState.PHOTO_VIEW;

    let targetPos = new THREE.Vector3();
    let targetRot = new THREE.Euler();
    let targetScale = 1;

    if (isActive && isPhotoView) {
      // Zoomed state
      targetPos.set(0, 0, 15);
      targetRot.set(0, 0, 0);
      targetScale = 3.5;
    } else if (isAssembled) {
      targetPos.copy(treePos);
      targetRot.copy(treeRot);
      targetScale = 0.5; // Compact size for decoration
    } else {
      // Scattered
      targetPos.copy(scatterPos);
      targetPos.y += Math.sin(t + index) * 0.05;
      targetRot.set(Math.sin(t * 0.5), Math.cos(t * 0.3), 0);
      targetScale = 1.5;
    }

    // Smooth transition
    meshRef.current.position.lerp(targetPos, 0.06);
    const q = new THREE.Quaternion().setFromEuler(targetRot);
    meshRef.current.quaternion.slerp(q, 0.06);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.06);
  });

  return (
    <group ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Invisible hitbox for easier clicking in motion */}
      {/* MUST be visible=true but transparent to register raycast events reliably */}
      <mesh>
          <boxGeometry args={[4, 4, 1]} />
          <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Frame Border - Beveled look */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.2, 3.2, 0.1]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* The Photo or Placeholder */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[3, 3]} />
        {texture ? (
          <meshBasicMaterial map={texture} side={THREE.FrontSide} />
        ) : (
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        )}
      </mesh>
      
      {/* Glow effect when active */}
      {isActive && (
         <pointLight distance={10} intensity={2} color="#d4af37" />
      )}
    </group>
  );
};

export const PhotoCloud: React.FC<PhotoCloudProps> = ({ appState, photoUrls, onPhotoClick, activePhotoIndex }) => {
  return (
    <group>
      {photoUrls.map((url, i) => (
        <PhotoFrame
          key={`${url}-${i}`}
          index={i}
          url={url}
          appState={appState}
          isActive={activePhotoIndex === i}
          onClick={() => onPhotoClick(i)}
        />
      ))}
    </group>
  );
};
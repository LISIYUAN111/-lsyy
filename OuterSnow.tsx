import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const OuterSnow: React.FC = () => {
  const count = 1500;
  const meshRef = useRef<THREE.Points>(null);

  // Create a soft snowflake texture programmatically
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.premultiplyAlpha = true;
    return tex;
  }, []);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Cylinder distribution with a hole in the middle (radius 8 to 20)
      const r = Math.random() * 12 + 8; 
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 40; // Height spread

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(theta);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Rotate the whole system slowly
    meshRef.current.rotation.y = t * 0.05;
    
    // Add a slight vertical bobbing or "falling" effect in the shader logic effectively
    // But since these are Points, modifying positions in JS loop is expensive.
    // Simple rotation is often enough for "hazy surround".
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.4}
        sizeAttenuation
        depthWrite={false}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        color="#aaccff"
      />
    </points>
  );
};
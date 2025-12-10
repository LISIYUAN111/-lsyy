import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const TopStar: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.5;
    const innerRadius = 0.6;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2;
      // Rotate by -PI/2 to point upwards initially
      const a = angle - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Center the geometry
  useMemo(() => {
    starGeometry.center();
  }, [starGeometry]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y = t * 0.5;
      // Gentle floating
      meshRef.current.position.y = 11.2 + Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <group>
      <pointLight position={[0, 11.2, 0]} color="#ffd700" intensity={8} distance={15} decay={2} />
      <mesh ref={meshRef} geometry={starGeometry} position={[0, 11.2, 0]}>
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffaa00" 
          emissiveIntensity={2.5} 
          roughness={0.1} 
          metalness={0.8} 
        />
      </mesh>
      {/* Glow Halo */}
      <mesh position={[0, 11.2, 0]} scale={[2.5, 2.5, 2.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
};
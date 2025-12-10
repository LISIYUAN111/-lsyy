import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ParticleData, AppState } from '../types';

interface TreeParticlesProps {
  appState: AppState;
  count: number;
}

const tempObject = new THREE.Object3D();
const vec3 = new THREE.Vector3();

export const TreeParticles: React.FC<TreeParticlesProps> = ({ appState, count }) => {
  const sphereRef = useRef<THREE.InstancedMesh>(null);
  const boxRef = useRef<THREE.InstancedMesh>(null);
  const caneRef = useRef<THREE.InstancedMesh>(null);
  const gingerRef = useRef<THREE.InstancedMesh>(null);
  const dustRef = useRef<THREE.InstancedMesh>(null);

  // Constants for Tree Shape
  const TREE_HEIGHT = 22;
  const BASE_RADIUS = 7.5;

  // Generate Data Once
  const { particles, counts } = useMemo(() => {
    const tempParticles: ParticleData[] = [];
    const counts = { sphere: 0, box: 0, cane: 0, ginger: 0, dust: 0 };

    // More vibrant, gift-like colors
    const colors = {
      green: [new THREE.Color('#1a472a'), new THREE.Color('#0f2e1a')], 
      ornament: [
          new THREE.Color('#ffd700'), // Gold
          new THREE.Color('#ff0033'), // Shiny Red
          new THREE.Color('#eeeeee'), // Silver/White
          new THREE.Color('#0066cc'), // Metallic Blue
          new THREE.Color('#ff6600')  // Metallic Orange
      ],
      cane: [new THREE.Color('#ff0000'), new THREE.Color('#ffffff')],
      ginger: [new THREE.Color('#cd853f'), new THREE.Color('#8b4513')],
      dust: [new THREE.Color('#ffd700'), new THREE.Color('#ffcc00')], // Gold dust
    };

    // 1. Structural Layer (Greenery & Main Ornaments) - uses Spiral for even coverage
    const structuralCount = 1000;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < structuralCount; i++) {
        const y = 1 - (i / (structuralCount - 1)) * 2; // 1 to -1
        const radius = Math.sqrt(1 - y * y); // Sphere distribution base
        
        // Map to Cone
        const coneY = (i / structuralCount) * TREE_HEIGHT - (TREE_HEIGHT / 2);
        const normalizedH = (coneY + TREE_HEIGHT/2) / TREE_HEIGHT;
        const coneRadius = (1 - normalizedH) * BASE_RADIUS; 

        // Spiral angle
        const theta = i * goldenAngle;

        // Add some noise to radius for depth, but keep it compact
        const r = Math.max(0.1, coneRadius - Math.random() * 0.5);
        
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);

        const posTree = new THREE.Vector3(x, coneY, z);
        
        // Determine Type
        let type: 'sphere' | 'box' | 'cane' | 'ginger' = 'sphere';
        const rand = Math.random();
        
        if (rand > 0.94) type = 'cane';
        else if (rand > 0.88) type = 'ginger';
        else if (rand > 0.82) type = 'box';
        else type = 'sphere';

        counts[type]++;

        // Scale & Color
        let scale = new THREE.Vector3(1, 1, 1);
        let color = new THREE.Color();
        const baseScale = Math.random() * 0.3 + 0.2;

        if (type === 'cane') {
            scale.set(0.06, 0.6, 0.06);
            color = colors.cane[i % 2];
        } else if (type === 'ginger') {
            scale.set(0.5, 0.6, 0.1);
            color = colors.ginger[i % 2];
        } else if (type === 'box') {
            scale.setScalar(baseScale * 1.5);
            color = colors.ornament[Math.floor(Math.random() * colors.ornament.length)];
        } else {
            // Mix of Green leaves and Ornaments
            // Outer layer has more ornaments
            const isOuter = r > (coneRadius - 0.8);
            if (isOuter && Math.random() > 0.6) {
                color = colors.ornament[Math.floor(Math.random() * colors.ornament.length)];
                scale.setScalar(baseScale * 1.3);
            } else {
                color = colors.green[Math.floor(Math.random() * colors.green.length)];
                scale.setScalar(baseScale * 1.1); // Bigger leaves for coverage
            }
        }

        const posScatter = new THREE.Vector3(
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 30
        );

        tempParticles.push({
            id: i,
            positionTree: posTree,
            positionScatter: posScatter,
            color, scale, speed: Math.random() * 0.02 + 0.01,
            type
        });
    }

    // 2. Dust Layer - Filler for gaps
    const dustCount = 1500;
    for (let i = 0; i < dustCount; i++) {
        counts.dust++;
        
        // Random volume filling within the cone
        const y = (Math.random() * TREE_HEIGHT) - (TREE_HEIGHT / 2);
        const normalizedH = (y + TREE_HEIGHT/2) / TREE_HEIGHT;
        const maxR = (1 - normalizedH) * BASE_RADIUS;
        
        // Bias towards surface but fill inside too
        const r = Math.sqrt(Math.random()) * maxR; 
        const theta = Math.random() * Math.PI * 2;
        
        const posTree = new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
        
        const posScatter = new THREE.Vector3(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 40
        );

        tempParticles.push({
            id: structuralCount + i,
            positionTree: posTree,
            positionScatter: posScatter,
            color: colors.dust[Math.floor(Math.random() * 2)],
            scale: new THREE.Vector3(0.1, 0.1, 0.1), // Tiny dots
            speed: Math.random() * 0.01 + 0.005,
            type: 'dust'
        });
    }

    return { particles: tempParticles, counts };
  }, [count]);

  useLayoutEffect(() => {
    let indices = { sphere: 0, box: 0, cane: 0, ginger: 0, dust: 0 };
    
    particles.forEach((p) => {
      let mesh: THREE.InstancedMesh | null = null;
      let idx = 0;

      if (p.type === 'sphere') { mesh = sphereRef.current; idx = indices.sphere++; }
      else if (p.type === 'box') { mesh = boxRef.current; idx = indices.box++; }
      else if (p.type === 'cane') { mesh = caneRef.current; idx = indices.cane++; }
      else if (p.type === 'ginger') { mesh = gingerRef.current; idx = indices.ginger++; }
      else if (p.type === 'dust') { mesh = dustRef.current; idx = indices.dust++; }

      if (mesh) {
        mesh.setColorAt(idx, p.color);
      }
    });

    [sphereRef, boxRef, caneRef, gingerRef, dustRef].forEach(ref => {
        if (ref.current && ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    });
  }, [particles]);

  useFrame((state) => {
    if (!sphereRef.current) return;

    const t = state.clock.getElapsedTime();
    const isAssembled = appState === AppState.ASSEMBLED;
    const isPhotoView = appState === AppState.PHOTO_VIEW;
    const targetIsScatter = !isAssembled;
    const lerpFactor = 0.04;

    let indices = { sphere: 0, box: 0, cane: 0, ginger: 0, dust: 0 };

    particles.forEach((p) => {
      const targetPos = targetIsScatter ? p.positionScatter : p.positionTree;
      
      const floatX = Math.sin(t * p.speed + p.id) * 0.1;
      const floatY = Math.cos(t * p.speed + p.id) * 0.1;
      
      let mesh: THREE.InstancedMesh | null = null;
      let idx = 0;

      if (p.type === 'sphere') { mesh = sphereRef.current; idx = indices.sphere++; }
      else if (p.type === 'box') { mesh = boxRef.current; idx = indices.box++; }
      else if (p.type === 'cane') { mesh = caneRef.current; idx = indices.cane++; }
      else if (p.type === 'ginger') { mesh = gingerRef.current; idx = indices.ginger++; }
      else if (p.type === 'dust') { mesh = dustRef.current; idx = indices.dust++; }

      if (mesh) {
        mesh.getMatrixAt(idx, tempObject.matrix);
        tempObject.matrix.decompose(tempObject.position, tempObject.quaternion, tempObject.scale);
        
        const dest = vec3.copy(targetPos);
        if (targetIsScatter) dest.add(new THREE.Vector3(floatX, floatY, 0));
        
        if (isPhotoView) {
             const dist = dest.length();
             if (dist < 8) dest.multiplyScalar(1.5);
        }

        tempObject.position.lerp(dest, lerpFactor);
        
        // Rotation logic
        if (targetIsScatter) {
          tempObject.rotation.x += 0.01;
          tempObject.rotation.y += 0.01;
        } else {
            if (p.type === 'dust') {
                tempObject.rotation.x += 0.02; // Twinkle effect
                tempObject.rotation.y += 0.02;
            } else if (p.type === 'cane' || p.type === 'ginger') {
                 // Orient roughly upright
                 tempObject.rotation.x = THREE.MathUtils.lerp(tempObject.rotation.x, Math.sin(p.id)*0.2, 0.05);
                 tempObject.rotation.z = THREE.MathUtils.lerp(tempObject.rotation.z, Math.cos(p.id)*0.2, 0.05);
            } else {
                 tempObject.rotation.y += 0.005;
            }
        }
        
        // Scale Pulse
        const scalePulse = 1 + Math.sin(t * 3 + p.id) * 0.05;
        tempObject.scale.set(
            p.scale.x * scalePulse,
            p.scale.y * scalePulse,
            p.scale.z * scalePulse
        );

        tempObject.updateMatrix();
        mesh.setMatrixAt(idx, tempObject.matrix);
      }
    });

    [sphereRef, boxRef, caneRef, gingerRef, dustRef].forEach(ref => {
        if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group>
      {/* High gloss, metallic, glowing spheres */}
      <instancedMesh ref={sphereRef} args={[undefined, undefined, counts.sphere]} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          roughness={0.2} 
          metalness={0.6} 
          emissive="#222222"
          emissiveIntensity={0.5}
        />
      </instancedMesh>
      
      {/* Gift Boxes - Very shiny like wrapping paper */}
      <instancedMesh ref={boxRef} args={[undefined, undefined, counts.box]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          roughness={0.1} 
          metalness={0.7} 
          emissive="#331111" 
          emissiveIntensity={0.6}
        />
      </instancedMesh>

      {/* Candy Canes - Slightly glowing white/red */}
      <instancedMesh ref={caneRef} args={[undefined, undefined, counts.cane]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial 
            roughness={0.3} 
            metalness={0.2} 
            emissive="#330000" 
            emissiveIntensity={0.4} 
        />
      </instancedMesh>

      {/* Gingerbread - Cookie texture (higher roughness), slight warmth */}
      <instancedMesh ref={gingerRef} args={[undefined, undefined, counts.ginger]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} /> 
        <meshStandardMaterial color="#8b4513" roughness={0.9} emissive="#5b2503" emissiveIntensity={0.2}/>
      </instancedMesh>

      {/* Gold Dust Instanced Mesh */}
      <instancedMesh ref={dustRef} args={[undefined, undefined, counts.dust]}>
          <tetrahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#ffd700" />
      </instancedMesh>
    </group>
  );
};
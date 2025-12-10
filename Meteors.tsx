import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Meteors = () => {
  const count = 20;
  const linesRef = useRef<THREE.InstancedMesh>(null);
  
  // Data for meteors: x, y, z, speed, length
  const meteorData = useRef(new Float32Array(count * 5));

  // Initialize
  React.useLayoutEffect(() => {
    for (let i = 0; i < count; i++) {
        resetMeteor(i);
    }
  }, []);

  const resetMeteor = (i: number) => {
     const x = (Math.random() - 0.5) * 100;
     const y = (Math.random() - 0.5) * 100 + 50; // Start high
     const z = (Math.random() - 0.5) * 50 - 20; // Background
     const speed = Math.random() * 0.5 + 0.2;
     const len = Math.random() * 5 + 2;
     
     meteorData.current[i * 5] = x;
     meteorData.current[i * 5 + 1] = y;
     meteorData.current[i * 5 + 2] = z;
     meteorData.current[i * 5 + 3] = speed;
     meteorData.current[i * 5 + 4] = len;
  };

  const dummy = new THREE.Object3D();

  useFrame(() => {
    if (!linesRef.current) return;

    for (let i = 0; i < count; i++) {
        let x = meteorData.current[i * 5];
        let y = meteorData.current[i * 5 + 1];
        let z = meteorData.current[i * 5 + 2];
        const speed = meteorData.current[i * 5 + 3];
        const len = meteorData.current[i * 5 + 4];

        // Move down and left
        x -= speed;
        y -= speed;

        // Reset if out of bounds
        if (y < -50) {
            resetMeteor(i);
            x = meteorData.current[i * 5];
            y = meteorData.current[i * 5 + 1];
            z = meteorData.current[i * 5 + 2];
        } else {
             meteorData.current[i * 5] = x;
             meteorData.current[i * 5 + 1] = y;
        }

        // Update Instance
        dummy.position.set(x, y, z);
        // Rotate 45 degrees to match movement
        dummy.rotation.z = Math.PI / 4;
        dummy.scale.set(len, 0.1, 0.1); // Long thin strip
        dummy.updateMatrix();
        linesRef.current.setMatrixAt(i, dummy.matrix);
    }
    linesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={linesRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </instancedMesh>
  );
};

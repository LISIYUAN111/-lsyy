import * as THREE from 'three';

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateTreePosition = (y: number, height: number, maxRadius: number) => {
  const radius = ((height - y) / height) * maxRadius;
  const angle = Math.random() * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return new THREE.Vector3(x, y - height / 2, z);
};

export const generateScatterPosition = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius; // Cube root for uniform distribution inside sphere
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

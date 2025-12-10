import * as THREE from 'three';

export enum AppState {
  ASSEMBLED = 'ASSEMBLED',
  SCATTERED = 'SCATTERED',
  PHOTO_VIEW = 'PHOTO_VIEW',
}

export interface ParticleData {
  id: number;
  positionTree: THREE.Vector3;
  positionScatter: THREE.Vector3;
  color: THREE.Color;
  scale: THREE.Vector3;
  speed: number;
  type: 'sphere' | 'box' | 'cane' | 'ginger' | 'dust';
}

export interface PhotoData {
  id: number;
  url: string;
  positionTree: THREE.Vector3;
  rotationTree: THREE.Euler;
  positionScatter: THREE.Vector3;
}
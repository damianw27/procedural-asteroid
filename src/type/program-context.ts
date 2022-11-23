import { Camera, Material, Mesh, Renderer, Scene } from 'three';
import { AsteroidFactors } from './asteroid-factors';

export interface ProgramContext {
  readonly camera: Camera;
  readonly scene: Scene;
  readonly renderer: Renderer;
  readonly sphere: Mesh;
  readonly material: Material;
  readonly asteroidFactors: AsteroidFactors;
}

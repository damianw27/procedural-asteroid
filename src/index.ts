import * as THREE from 'three';
import {
  Camera,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { fractalNoise } from './perlin-noise';
import { AsteroidFactors } from './type/asteroid-factors';
import { CameraConfig } from './type/camera-config';
import { GameLoop } from './type/game-loop';
import { ProgramContext } from './type/program-context';
import { GUI } from 'dat.gui';

const defaultCameraConfig: CameraConfig = {
  fov: 40,
  aspect: window.innerWidth / window.innerHeight,
  near: 1,
  far: 200,
};

function createCamera(cameraConfig?: CameraConfig): Camera {
  const { far, near, fov, aspect } = cameraConfig ?? defaultCameraConfig;
  const camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 20;
  camera.lookAt(0, 0, 0);
  return camera;
}

function programLoop(context: ProgramContext): GameLoop {
  const { camera, scene, renderer, sphere, asteroidFactors } = context;

  return (time) => {
    applyNoiseToMesh(sphere, asteroidFactors);

    if (asteroidFactors.shouldRotate) {
      sphere.rotation.x = time / 2000;
      sphere.rotation.y = time / 1000;
    }

    renderer.render(scene, camera);
  };
}

function applyNoiseToMesh(mesh: Mesh, factors: AsteroidFactors) {
  const verticesCount = mesh.geometry.attributes.position.count;

  for (let vertexIndex = 0; vertexIndex < verticesCount; vertexIndex++) {
    const vertexDataPointer = mesh.geometry.attributes.position;
    const vertexX = vertexDataPointer.getX(vertexIndex);
    const vertexY = vertexDataPointer.getY(vertexIndex);
    const vertexZ = vertexDataPointer.getZ(vertexIndex);
    const vertexPosition = new Vector3(vertexX, vertexY, vertexZ);
    const normalizedVertex = vertexPosition.normalize();
    const u = normalizedVertex.x * factors.period + factors.offset;
    const v = normalizedVertex.y * factors.period + factors.offset;
    const w = normalizedVertex.z * factors.period + factors.offset;
    const noisePosition = new Vector3(u, v, w);
    const noiseValue = fractalNoise(noisePosition, factors) * 3;

    const calculatedVertexOffset = normalizedVertex
      .multiplyScalar(noiseValue)
      .multiplyScalar(factors.amplitude);

    const output = vertexPosition.add(calculatedVertexOffset);
    vertexDataPointer.setXYZ(vertexIndex, output.x, output.y, output.z);
  }

  mesh.geometry.attributes.position.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

const camera = createCamera();
const scene = new THREE.Scene();
const geometry = new SphereGeometry(1, 64, 32);
const material = new MeshNormalMaterial();
const sphere = new Mesh(geometry, material);
scene.add(sphere);
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const asteroidFactors: AsteroidFactors = {
  amplitude: 1,
  period: 0.8,
  offset: 4.005,
  scale: 0.8,
  shouldRotate: true,
  octaves: 8,
  persistence: 0.45,
  lacunarity: 2,
  positionOffset: 0,
};

renderer.setAnimationLoop(
  programLoop({
    camera,
    scene,
    renderer,
    sphere,
    asteroidFactors,
    material,
  })
);

document.body.appendChild(renderer.domElement);

const randomizeButton = {
  Randomize: () => {
    asteroidFactors.positionOffset = Math.random() * 80000;
  },
};

const gui = new GUI();
const asteroidParams = gui.addFolder('Asteroid Properties');
asteroidParams.add(asteroidFactors, 'amplitude', 0, 1);
asteroidParams.add(asteroidFactors, 'scale', 0, 5);
asteroidParams.add(asteroidFactors, 'period', 0, 1);
asteroidParams.add(asteroidFactors, 'offset', 0, 5);
asteroidParams.add(asteroidFactors, 'octaves', 0, 10);
asteroidParams.add(asteroidFactors, 'persistence', 0, 2);
asteroidParams.add(asteroidFactors, 'lacunarity', 1, 10);
asteroidParams.add(asteroidFactors, 'shouldRotate');
asteroidParams.add(randomizeButton, 'Randomize');
asteroidParams.open();

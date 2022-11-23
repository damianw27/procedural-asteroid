import { Vector3 } from 'three';
import { FractalConfig } from './type/fractal-config';
import { fade, grad, lerp, scale } from './math';
import { predefinedPermutation } from './permutation';

const permutation = new Array(512);

for (let permutationIndex = 0; permutationIndex < 256; permutationIndex++) {
  const perm = predefinedPermutation[permutationIndex];
  permutation[256 + permutationIndex] = perm;
  permutation[permutationIndex] = perm;
}

function perlinNoise(inX: number, inY: number, inZ: number) {
  const X = Math.floor(inX) & 255;
  const Y = Math.floor(inY) & 255;
  const Z = Math.floor(inZ) & 255;

  const x = inX - Math.floor(inX);
  const y = inY - Math.floor(inY);
  const z = inZ - Math.floor(inZ);

  const u = fade(x);
  const v = fade(y);
  const w = fade(z);

  const A = permutation[X] + Y;
  const AA = permutation[A] + Z;
  const AB = permutation[A + 1] + Z;
  const B = permutation[X + 1] + Y;
  const BA = permutation[B] + Z;
  const BB = permutation[B + 1] + Z;

  const tx = x - 1;
  const ty = y - 1;
  const tz = z - 1;

  const aa0 = grad(permutation[AA], { x, y, z });
  const ba0 = grad(permutation[BA], { x: tx, y, z });
  const ab0 = grad(permutation[AB], { x, y: ty, z });
  const bb0 = grad(permutation[BB], { x: tx, y: ty, z });
  const aa1 = grad(permutation[AA + 1], { x, y, z: tz });
  const ba1 = grad(permutation[BA + 1], { x: tx, y, z: tz });
  const ab1 = grad(permutation[AB + 1], { x, y: ty, z: tz });
  const bb1 = grad(permutation[BB + 1], { x: tx, y: ty, z: tz });

  const lerp1 = lerp(v, lerp(u, aa0, ba0), lerp(u, ab0, bb0));
  const lerp2 = lerp(v, lerp(u, aa1, ba1), lerp(u, ab1, bb1));
  const lerp3 = lerp(w, lerp1, lerp2);

  return scale(lerp3);
}

export function fractalNoise(position: Vector3, config: FractalConfig): number {
  const { x, y, z } = position;
  const { octaves, scale, persistence, lacunarity, positionOffset } = config;

  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let iterationIndex = 0; iterationIndex < octaves; iterationIndex++) {
    const xOffset = x * frequency * scale + positionOffset;
    const yOffset = y * frequency * scale + positionOffset;
    const zOffset = z * frequency * scale + positionOffset;
    total += perlinNoise(xOffset, yOffset, zOffset) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxValue / 2;
}

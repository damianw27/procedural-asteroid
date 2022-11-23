export interface Position3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Position2 {
  readonly x: number;
  readonly y: number;
}

export function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

export function randomGradient(ix: number, iy: number): Position3 {
  const w = 8 * 8;
  const s = w / 2;
  let a = ix;
  let b = iy;
  a *= 3284157443;
  b ^= (a << s) | (a >> (w - s));
  b *= 1911520717;
  a ^= (b << s) | (b >> (w - s));
  a *= 2048419325;
  const random = a * (3.14159265 / ~(~0 >> 1));

  return {
    x: Math.cos(random),
    y: Math.sin(random),
    z: (Math.sin(random) + Math.cos(random)) / 2,
  };
}

export function grad(hash: number, position: Position3): number {
  const { x, y, z } = position;
  const h = hash & 15;
  const hValue = h === 12 || h === 14 ? x : z;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : hValue;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function scale(n: number): number {
  return (1 + n) / 2;
}

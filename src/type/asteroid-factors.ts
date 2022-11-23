import { FractalConfig } from './fractal-config';

export interface AsteroidFactors extends FractalConfig {
  amplitude: number;
  period: number;
  offset: number;
  scale: number;
  shouldRotate: boolean;
}

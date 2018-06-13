import { bool, number, string, arrayOf, shape } from 'prop-types';

export const RectType = shape({
  top: number.isRequired,
  left: number.isRequired,
  near: number,
  width: number.isRequired,
  height: number.isRequired,
  depth: number,
});

export const PointType = shape({
  x: number.isRequired,
  y: number.isRequired,
  z: number.isRequired,
});

export const CameraType = shape({
  is2d: bool.isRequired,
  fov: number.isRequired,
  near: number.isRequired,
  far: number.isRequired,
  alpha: number.isRequired,
  beta: number.isRequired,
  dist: number.isRequired,
  minDist: number.isRequired,
  maxDist: number.isRequired,
  bbox: RectType.isRequired,
});

export const TimerType = shape({
  time: number.isRequired,
  maxTime: number.isRequired,
  fps: number.isRequired,
  playing: bool.isRequired,
  labels: arrayOf(string).isRequired,
});

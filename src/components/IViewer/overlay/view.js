import { clamp } from '../utils';

export const onMouseDrag = ({ alpha, beta }, dx, dy, setCamera) => {
  setCamera({
    alpha: (alpha - dx * 0.005) % (2 * Math.PI),
    beta: clamp(-Math.PI / 2, Math.PI / 2, beta + dy * 0.005),
  });
};

export const onWheel = ({ dist }, { deltaY }, setCamera) => {
  setCamera({
    dist: dist * (deltaY > 0 ? 1.1 : 0.9),
  });
};

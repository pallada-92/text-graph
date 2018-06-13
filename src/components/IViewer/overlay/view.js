import { vec3 } from 'gl-matrix';

import { clamp } from '../utils';

export const onMouseDrag = ({ alpha, beta }, dx, dy, setCamera) => {
  setCamera({
    alpha: (alpha - dx * 0.005) % (2 * Math.PI),
    beta: clamp(-Math.PI / 2, Math.PI / 2, beta + dy * 0.005),
  });
};

export const onRightMouseDrag = (
  { alpha, beta, dist, bbox: { top, left, near, width, height, depth } },
  { x, y, z },
  dx,
  dy,
  setTarget
) => {
  const basisX = vec3.fromValues(1, 0, 0);
  vec3.rotateY(basisX, basisX, vec3.create(), alpha);
  const basisZ = vec3.fromValues(1, 0, 0);
  vec3.rotateZ(basisZ, basisZ, vec3.create(), -beta);
  vec3.rotateY(basisZ, basisZ, vec3.create(), alpha + Math.PI / 2);
  const basisY = vec3.create();
  vec3.cross(basisY, basisX, basisZ);
  const coeff = 0.001 * dist;

  setTarget({
    x: clamp(
      left,
      left + width,
      x + (basisY[0] * dy - basisX[0] * dx) * coeff
    ),
    y: clamp(
      top,
      top + height,
      y + (basisY[1] * dy - basisX[1] * dx) * coeff
    ),
    z: clamp(
      near,
      near + depth,
      z + (basisY[2] * dy - basisX[2] * dx) * coeff
    ),
  });
};

export const onWheel = ({ dist }, { deltaY }, setCamera) => {
  setCamera({
    dist: dist * (deltaY > 0 ? 1.1 : 0.9),
  });
};

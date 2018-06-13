import { mix, clamp, proportion } from '../utils';

const line = {
  l: 50,
  t: 150,
  b: 350,
  w: 2,
};

export const draw = (camera, ctx) => {
  const {
    canvas: { height: H },
  } = ctx;

  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(line.l, line.t, line.w, H - line.b);
  ctx.fillRect(line.l, line.t, line.w, H - line.b);
};

export const onMouseDown = (camera, canvas, x, y, setCamera) => {
  return false;
};

export const onMouseDrag = (camera, canvas, dx, dy, setCamera) => {
  return false;
};

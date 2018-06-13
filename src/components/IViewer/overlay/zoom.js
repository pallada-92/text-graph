import { mix, clamp, proportion } from '../utils';

const line = {
  l: 50,
  t: 150,
  b: 200,
  h: 300,
  w: 2,
};

const lineH = ({ height }) => Math.min(height - line.b - line.t, line.h);

const dist2Y = ({ minDist, maxDist, dist }, canvas) =>
  mix(
    line.t,
    line.t + lineH(canvas),
    clamp(
      0,
      1,
      proportion(Math.log(minDist), Math.log(maxDist), Math.log(dist))
    )
  );

export const draw = (camera, ctx) => {
  const h = lineH(ctx.canvas);

  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.rect(line.l, line.t, line.w, h);
  const y = dist2Y(camera, ctx.canvas);
  const r = 7;
  const x = line.l + line.w / 2;
  ctx.moveTo(x + r, y);
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();

  ctx.font = '30px Helvetica';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('+', line.l + line.w / 2, line.t - 20);
  ctx.fillText('+', line.l + line.w / 2, line.t - 20);
  ctx.strokeText('−', line.l + line.w / 2, line.t + h + 20);
  ctx.fillText('−', line.l + line.w / 2, line.t + h + 20);
};

export const onMouseDown = (camera, canvas, x, y, setCamera) => {
  return false;
};

export const onMouseDrag = (camera, canvas, dx, dy, setCamera) => {
  return false;
};

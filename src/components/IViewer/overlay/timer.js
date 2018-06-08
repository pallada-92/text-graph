import { roundRect, mix, clamp, proportion } from '../../../utils';

const line = {
  l: 120,
  r: 80,
  b: 40,
  h: 5,
  hoverR: 20,
};

const tickH = 15;

const btn = {
  r: 20,
  s: 60,
  b: 30,
};

export const initState = () => ({
  hovered: false,
});

const tickPos = (timer, ctx, t) => {
  const {
    canvas: { width: W, height: H },
  } = ctx;
  return [
    mix(line.l, W - line.r, t / timer.maxTime),
    H - line.b - line.h / 2,
  ];
};

export const draw = (timer, ctx) => {
  if (timer === null) return;
  const { time, maxTime, playing, fpc, labels } = timer;
  const {
    canvas: { width: W, height: H },
  } = ctx;

  roundRect(
    ctx,
    line.l - line.h / 2,
    H - line.b - line.h - 0.5,
    W - line.r - line.l + line.h,
    line.h,
    line.h / 2
  );
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'gray';
  ctx.stroke();

  ctx.fillStyle = 'gray';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '15px Helvetica';
  for (let i = 0; i <= maxTime * fpc; i += 1) {
    const curTick = tickPos(timer, ctx, i / fpc);
    if (i % fpc === 0) {
      ctx.fillRect(
        curTick[0],
        curTick[1] - line.h / 2,
        1,
        (tickH + line.h) / 2
      );
      if (labels) {
        ctx.fillText(labels[i / fpc], curTick[0], curTick[1] + tickH / 2 + 3);
      }
    } else {
      ctx.fillRect(curTick[0], curTick[1] - line.h / 2, 1, line.h);
    }
  }

  ctx.fillStyle = 'red';
  const curTick = tickPos(timer, ctx, time);
  ctx.fillRect(curTick[0] - 1, curTick[1] - tickH / 2, 2, tickH);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.font = '15px Helvetica';
  ctx.fillText(time.toFixed(2), curTick[0], curTick[1] - tickH / 2);
};

const where = (timer, ctx, x, y) => {
  const {
    canvas: { width: W, height: H },
  } = ctx;
  const cy = H - line.b - line.h / 2;
  if (y < cy - line.hoverR) return null;
  if (y > cy + line.hoverR) return null;
  if (x < line.l - line.hoverR) return null;
  if (x > W - line.r + 10) {
    return 'button';
  }
  return mix(
    0,
    timer.maxTime,
    clamp(0, 1, proportion(line.l, W - line.l - line.r, x))
  );
};

export const onMouseDown = (timer, x, y) => {};

export const onMouseOver = (state, timer, x, y) => {};

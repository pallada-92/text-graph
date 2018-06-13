import { roundRect, mix, clamp, proportion } from '../utils';

const line = {
  l: 120,
  r: 80,
  b: 40,
  h: 3,
  hoverR: 20,
};

const tickH = 15;

const btn = {
  r: 40,
  b: 42.5,
  s: 20,
};

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
  const { time, maxTime, playing, fps, labels } = timer;
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
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'white';
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.stroke();

  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 15px Helvetica';
  for (let i = 0; i <= maxTime * fps; i += 1) {
    const curTick = tickPos(timer, ctx, i / fps);
    if (i % fps === 0) {
      ctx.fillRect(
        curTick[0],
        curTick[1] - line.h / 2,
        1,
        (tickH + line.h) / 2
      );
      if (labels) {
        ctx.strokeText(
          labels[i / fps],
          curTick[0],
          curTick[1] + tickH / 2 + 3
        );
        ctx.fillText(labels[i / fps], curTick[0], curTick[1] + tickH / 2 + 3);
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
  ctx.font = 'bold 15px Helvetica';
  const selText = time === Math.round(time) ? labels[time] : time.toFixed(2);
  ctx.strokeText(selText, curTick[0], curTick[1] - tickH / 2);
  ctx.fillText(selText, curTick[0], curTick[1] - tickH / 2);

  ctx.save();
  ctx.translate(W - btn.r, H - btn.b);
  ctx.scale(btn.s, btn.s);
  ctx.lineWidth = 0.2;
  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'white';
  if (playing) {
    ctx.beginPath();
    const x0 = -1 / 2 / Math.sqrt(3);
    const x1 = 1 / Math.sqrt(3);
    ctx.moveTo(x0, -1 / 2);
    ctx.lineTo(x0, 1 / 2);
    ctx.lineTo(x1, 0);
    ctx.closePath();
  } else {
    ctx.beginPath();
    ctx.rect(-1 / 2, -1 / 2, 1 / 3, 1);
    ctx.rect(1 / 6, -1 / 2, 1 / 3, 1);
  }
  ctx.stroke();
  ctx.fill();
  ctx.restore();
};

const where = (timer, canvas, x, y) => {
  const { width: W, height: H } = canvas;
  const cy = H - line.b - line.h / 2;
  if (y < cy - line.hoverR) return null;
  if (y > cy + line.hoverR) return null;
  if (x < line.l - line.hoverR) return null;
  if (x > W - line.r + 10) {
    return { type: 'button' };
  }
  return {
    type: 'line',
    time: mix(
      0,
      timer.maxTime,
      clamp(0, 1, proportion(line.l, W - line.r, x))
    ),
  };
};

export const onMouseDown = (timer, canvas, x, y, togglePlayStop, setTime) => {
  const w = where(timer, canvas, x, y);
  if (w === null) return false;
  if (w.type === 'button') {
    togglePlayStop();
  }
  if (w.type === 'line') {
    setTime(w.time);
  }
  return true;
};

export const onMouseDrag = (timer, canvas, x0, y0, x, y, setTime) => {
  const w0 = where(timer, canvas, x0, y0);
  if (w0 === null) return false;
  if (w0.type === 'line') {
    const { width: W } = canvas;
    setTime(
      mix(0, timer.maxTime, clamp(0, 1, proportion(line.l, W - line.r, x)))
    );
    return true;
  }
  return false;
};

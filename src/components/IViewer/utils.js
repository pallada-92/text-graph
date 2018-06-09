export const roundRect = (ctx, x, y, w, h, radius) => {
  let r = radius;
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export const mix = (x0, x1, t) => x0 * (1 - t) + x1 * t;

export const proportion = (x0, x1, x) => (x - x0) / (x1 - x0);

export const inRect = ([x, y], { top, left, width, height }) => {
  if (x < left || x > left + width) return false;
  if (y < top || y > top + height) return false;
  return true;
};

export const clamp = (xMin, xMax, x) => {
  if (x < xMin) return xMin;
  if (x > xMax) return xMax;
  return x;
};

export const applyCamera = (
  { x: tx, y: ty, z: tz },
  { alpha, beta, dist, fov },
  width,
  height,
  [x, y, z]
) => {
  const dx = x - tx;
  const dy = y - ty;
  const dz = z - tz;

  const dx1 = dz * Math.sin(-alpha) + dx * Math.cos(-alpha);
  const dy1 = dy;
  const dz1 = dz * Math.cos(-alpha) - dx * Math.sin(-alpha);

  const dx2 = dx1;
  const dy2 = dz1 * Math.sin(-beta) + dy1 * Math.cos(-beta);
  const dz2 = dz1 * Math.cos(-beta) - dy1 * Math.sin(-beta);

  const dx3 = dx2;
  const dy3 = dy2;
  const dz3 = dist - dz2;

  const h = Math.tan(fov / 2) * dist;
  const c = ((dist / dz3 / h) * height) / 2;
  const u = dx3 * c;
  const v = dy3 * c;

  return [u + width / 2, -v + height / 2, 1 / dz3];
};

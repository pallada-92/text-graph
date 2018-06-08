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

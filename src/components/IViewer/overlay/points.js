import { applyCamera } from '../utils';

const random = i => (Math.sin(i) * 100) % 1;

export const draw = (target, camera, ctx) => {
  const {
    canvas: { width: W, height: H },
  } = ctx;
  ctx.fillStyle = 'black';

  for (let i = 0; i < 1000; i += 1) {
    const pt = [random(i + 0.1), random(i + 0.2), random(i + 0.3)];
    const [u, v, w] = applyCamera(target, camera, W, H, pt);
    if (w < 0) continue;
    ctx.fillRect(u - 1, v - 1, 2, 2);
  }
};

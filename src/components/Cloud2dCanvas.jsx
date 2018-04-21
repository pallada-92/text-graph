import React from 'react';

import Canvas from './Canvas';

const draw = (
  ctx,
  { pt_x, pt_y, pt_size, pt_order, viewport },
  width,
  height,
) => {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  const s = height / viewport[2];
  ctx.scale(s, s);
  ctx.translate(-viewport[0], -viewport[1]);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';

  pt_order.forEach(i => {
    const size = Math.max(pt_size[i] / s, 0.1);
    ctx.fillRect(pt_x[i] - size / 2, pt_y[i] - size / 2, size, size);
  });
  ctx.restore();
};

export default props => <Canvas draw={draw} {...props} />;

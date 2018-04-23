import React from 'react';

import Canvas from './Canvas';

const draw = (
  ctx,
  { pt_x, pt_y, pt_size, pt_order, pt_label, viewport },
  width,
  height,
) => {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  const s = height / viewport[2];
  ctx.scale(s, s);
  ctx.translate(-viewport[0], -viewport[1]);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '1px Helvetica';

  pt_order.forEach(i => {
    if (pt_size[i] === 0) return;
    const size = Math.max(pt_size[i] / s, 0.1);
    if (pt_label && pt_label[i]) {
      ctx.save();
      ctx.translate(pt_x[i], pt_y[i]);
      ctx.scale(size, size);
      ctx.fillText(pt_label[i], 0, 0);
      ctx.restore();
    } else {
      ctx.fillRect(pt_x[i] - size / 2, pt_y[i] - size / 2, size, size);
    }
  });
  ctx.restore();
};

export default props => <Canvas draw={draw} {...props} />;

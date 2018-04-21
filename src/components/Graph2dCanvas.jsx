import React from 'react';
import { zip } from 'ramda';

import Canvas from './Canvas';

const draw = (
  ctx,
  { node_x, node_y, node_label, edge_source, edge_target, edge_weight },
  width,
  height,
) => {
  console.log('draw');
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  zip(edge_source, edge_target).forEach(([s, t], i) => {
    ctx.lineWidth = Math.sqrt(edge_weight[i]);
    ctx.beginPath();
    ctx.moveTo(node_x[s], node_y[s]);
    ctx.lineTo(node_x[t], node_y[t]);
    ctx.stroke();
  });

  ctx.fillStyle = 'lightgray';
  zip(node_x, node_y).forEach(([x, y]) => {
    ctx.fillRect(x - 2, y - 2, 4, 4);
  });

  ctx.font = '14px Helvetica';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'black';
  node_label.forEach((label, i) => {
    ctx.fillText(label, node_x[i], node_y[i] - 4);
  });
  ctx.restore();
};

export default ({ width, height, graph }) => (
  <Canvas draw={draw} data={graph} width={width} height={height} />
);

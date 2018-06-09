import { applyCamera } from '../utils';
import { sortBy, mean, prop } from 'ramda';

const pos = {
  l: 50,
  b: 90,
  s: 50,
};

const edges = [
  {
    color: 'red',
    vertices: [[-1, -1, -1], [+1, -1, -1], [+1, +1, -1], [-1, +1, -1]],
  },
  {
    color: 'green',
    vertices: [[-1, -1, +1], [+1, -1, +1], [+1, +1, +1], [-1, +1, +1]],
  },
  {
    color: 'blue',
    vertices: [[-1, -1, -1], [-1, -1, +1], [+1, -1, +1], [+1, -1, -1]],
  },
  {
    color: 'orange',
    vertices: [[-1, +1, -1], [-1, +1, +1], [+1, +1, +1], [+1, +1, -1]],
  },
  {
    color: 'lightgray',
    vertices: [[-1, -1, -1], [-1, -1, +1], [-1, +1, +1], [-1, +1, -1]],
  },
  {
    color: 'yellow',
    vertices: [[+1, -1, -1], [+1, -1, +1], [+1, +1, +1], [+1, +1, -1]],
  },
];

export const draw = (target, camera, ctx) => {
  const {
    canvas: { height: H },
  } = ctx;
  const { alpha, beta } = camera;

  ctx.save();
  ctx.translate(pos.l, H - pos.b);
  ctx.scale(pos.s, pos.s);
  ctx.fillStyle = 'red';
  const ordered = sortBy(
    prop('camDist'),
    edges.map(({ color, vertices }) => {
      const projVertices = vertices.map(pt =>
        applyCamera(
          { x: 0, y: 0, z: 0 },
          { alpha, beta, dist: 5, fov: 0.5 },
          2,
          2,
          pt
        )
      );

      const camDist = mean(projVertices.map(prop('2')));

      return {
        color,
        camDist,
        projVertices,
      };
    })
  );

  ordered.forEach(({ color, projVertices }) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    projVertices.forEach(([x, y]) => {
      ctx.lineTo(x - 0.5, y - 0.5);
    });
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
};

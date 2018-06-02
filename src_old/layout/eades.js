import { clamp } from 'ramda';

export default (
  { edge_source, edge_target, edge_weight, node_x, node_y },
  { k, width, height },
) => {
  const x_disp = new Array(node_x.length).fill(0);
  const y_disp = new Array(node_y.length).fill(0);
  for (let i = 0; i < node_x.length; i++) {
    for (let j = i + 1; j < node_x.length; j++) {
      const dx = node_x[i] - node_x[j];
      const dy = node_y[i] - node_y[j];
      const len = Math.max(k / 10, Math.sqrt(dx * dx + dy * dy));
      const f = k * k / len / len;
      const fx = f * dx;
      const fy = f * dy;
      x_disp[i] += fx;
      y_disp[i] += fy;
      x_disp[j] -= fx;
      y_disp[j] -= fy;
    }
  }
  for (let i = 0; i < edge_source.length; i++) {
    const source = edge_source[i];
    const target = edge_target[i];
    const weight = edge_weight[i];
    const dx = node_x[source] - node_x[target];
    const dy = node_y[source] - node_y[target];
    const len = Math.sqrt(dx * dx + dy * dy);
    const f = -k * k / len / len + weight / 200 * (k * k / len / len - len / k);
    const fx = f * dx;
    const fy = f * dy;
    x_disp[source] += fx;
    y_disp[source] += fy;
    x_disp[target] -= fx;
    y_disp[target] -= fy;
  }
  const l = 0.001;
  let mean_x = 0;
  let mean_y = 0;
  for (let i = 0; i < node_x.length; i++) {
    node_x[i] = clamp(0, width, node_x[i] + x_disp[i] * l);
    mean_x += node_x[i];
    node_y[i] = clamp(0, height, node_y[i] + y_disp[i] * l);
    mean_y += node_y[i];
  }
  mean_x /= node_x.length;
  mean_y /= node_y.length;
  for (let i = 0; i < node_x.length; i++) {
    node_x[i] += width / 2 - mean_x;
    node_y[i] += height / 2 - mean_y;
  }
  // zip(edge_source, edge_target).forEach(([s, t]) => {});
};

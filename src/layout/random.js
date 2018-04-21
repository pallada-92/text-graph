export default (nodeCount, width, height) => {
  const x = new Array(nodeCount);
  const y = new Array(nodeCount);
  for (let i = 0; i < nodeCount; i++) {
    x[i] = Math.random() * width;
    y[i] = Math.random() * height;
  }
  return { x, y };
};

export const findNearest2d = (x_list, y_list, [x, y]) => {
  let res = null;
  let minDist = Infinity;
  
  for (let i=0; i<x_list.length; i++) {
    const dx = x - x_list[i];
    const dy = y - y_list[i];
    const dist = dx * dx + dy * dy;
    if (dist > minDist) continue;
    minDist = dist;
    res = i;
  }

  return res;
};

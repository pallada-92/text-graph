export const mapRange = (fun, num) => {
  const res = new Array(num);
  for (let i = 0; i < num; i++) {
    res[i] = fun(num);
  }
  return res;
};

export const sumGroups = (groups, values) =>
  groups.map(group => group.reduce((a, i) => a + values[i], 0));

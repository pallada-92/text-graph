import { zip } from 'ramda';

import Subset from './Subset';

export const mergeEdges = (source, target) => {
  const res = {
    source: [],
    target: [],
    groups: [],
  };

  const temp = {};

  zip(source, target).forEach(([first, second], i) => {
    if (first > second) {
      const t = second;
      second = first;
      first = t;
    }

    if (!(first in temp)) {
      temp[first] = {};
    }
    if (!(second in temp[first])) {
      const newGroup = [];
      temp[first][second] = newGroup;
      res.source.push(first);
      res.target.push(second);
      res.groups.push(newGroup);
    }

    temp[first][second].push(i);
  });

  return res;
};

export const degrees = (nodeCount, source, target) => {
  const res = new Array(nodeCount).fill(0);

  zip(source, target).forEach(([s, t]) => {
    res[s]++;
    res[t]++;
  });

  return res;
};

export const subEdges = (subNodes, source, target) => {
  return new Subset().fromFilter(
    zip(source, target),
    ([s, t]) => subNodes.hasIndex(s) && subNodes.hasIndex(t),
  );
};

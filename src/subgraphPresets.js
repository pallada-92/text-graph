import { sumGroups } from './array';
import { mergeEdges, degrees, subEdges } from './graph';
import Subset from './Subset';

export const edgeDateSlice = (
  { edge_source, edge_target, edge_weight, edge_date },
  { minDate, maxDate },
) => {
  const subEdges = new Subset().fromFilter(
    edge_date,
    date => minDate <= date && date < maxDate,
  );
  const { source, target, groups } = mergeEdges(
    subEdges.apply(edge_source),
    subEdges.apply(edge_target),
  );
  return {
    groups,
    edge_source: source,
    edge_target: target,
    edge_weight: sumGroups(groups, edge_weight),
  };
};

export const byDeg = (
  { edge_source, edge_target, edge_weight, node_label },
  { minDate, maxDate, minDegree },
) => {
  const degrees1 = degrees(node_label.length, edge_source, edge_target);

  const subNodes2 = new Subset().fromFilter(degrees1, x => x >= minDegree);
  const subEdges2 = subEdges(subNodes2, edge_source, edge_target);

  // const [source, target] = subEdges2.applyMany(edge_source, edge_target);

  // const degrees2 = degrees(node_label.length, source, target);

  return {
    subNodes: subNodes2,
    subEdges: subEdges2,
  };
};

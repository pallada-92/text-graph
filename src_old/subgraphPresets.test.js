import { byDeg } from './subgraphPresets';

const graph1 = {
  'edge/source': [0, 0, 0, 0, 0],
  'edge/target': [1, 2, 3, 4, 5],
  'edge/weight': [1, 1, 1, 1, 1],
  'node/label': [0, 1, 2, 3, 4, 5],
};

const serializePreset = ({ subNodes, subEdges }) => [
  subNodes.indices,
  subEdges.indices,
];

test('byDeg', () => {
  expect(serializePreset(byDeg(graph1, { minDegree: 3 }))).toEqual([[0], []]);
});

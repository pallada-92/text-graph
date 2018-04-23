import React, { Component } from 'react';

import Graph2dCanvas from './Graph2dCanvas';
import { edgeDateSlice, byDeg } from '../subgraphPresets';
import { random as randomLayout, eades as eadesLayout } from '../layout';

export default class extends Component {
  constructor(props) {
    super(props);
    this.active = false;

    const data = this.props.data;
    const graph1 = {
      node_label: data.node_label,
      ...edgeDateSlice(data, {
        minDate: 0,
        maxDate: Infinity,
      }),
    };

    const { subNodes, subEdges } = byDeg(graph1, {
      minDegree: 50,
    });

    const { x, y } = randomLayout(
      subNodes.length(),
      this.props.width,
      this.props.height,
    );

    this.graph = {
      node_x: x,
      node_y: y,
      node_label: subNodes.apply(graph1.node_label),
      edge_source: subNodes.reindex(subEdges.apply(graph1.edge_source)),
      edge_target: subNodes.reindex(subEdges.apply(graph1.edge_target)),
      edge_weight: subEdges.apply(graph1.edge_weight),
    };
  }

  componentDidMount = () => {
    this.active = true;
    this.tick();
  };

  componentWillUnmount = () => {
    this.active = false;
  };

  tick = () => {
    if (!this.active) return;
    window.requestAnimationFrame(this.tick);
    eadesLayout(this.graph, {
      k: Math.sqrt(
        this.props.width * this.props.height / this.graph.node_x.length,
      ),
      width: this.props.width,
      height: this.props.height,
    });
    this.setState({});
  };

  render = () => (
    <Graph2dCanvas
      graph={this.graph}
      width={this.props.width}
      height={this.props.height}
    />
  );
}

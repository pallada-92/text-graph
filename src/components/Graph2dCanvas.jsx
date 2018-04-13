import React, { Component } from 'react';

export default class extends Component {
  setCanvas = canvas => {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.redrawCanvas();
  };

  redrawCanvas = () => {
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
    this.ctx.fillRect(30, 30, 10, 10);
  };

  componentDidUpdate = () => {
    this.redrawCanvas();
  };

  render = () => <canvas ref={this.setCanvas} />;
}

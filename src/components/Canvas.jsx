import React, { Component } from 'react';

export default class extends Component {
  constructor(props) {
    super(props);
    this.active = false;
    this.canvas = null;
    this.needsRedraw = true;
    this.mousePressPosition = null;
  }

  componentDidMount = () => {
    this.active = true;
    this.tick();
  };

  tick = () => {
    if (!this.active) return;
    window.requestAnimationFrame(this.tick);

    if (!this.needsRedraw || !this.canvas) return;
    this.needsRedraw = false;

    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
    this.props.draw(
      this.ctx,
      this.props.data,
      this.props.width,
      this.props.height,
    );
  };

  componentWillUnmount = () => {
    this.active = false;
  };

  setCanvas = canvas => {
    this.canvas = canvas;
    if (canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  };

  redraw = () => {
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 256; j++) {
        this.ctx.fillRect(i * 3, j * 3, 2, 2);
      }
    }
  };

  componentDidUpdate = () => {
    this.needsRedraw = true;
  };

  onMouseMove = e => {
    if (this.mousePressPosition) {
      if (this.props.onMouseDrag) {
        this.props.onMouseDrag(
          e.nativeEvent.offsetX - this.mousePressPosition[0],
          e.nativeEvent.offsetY - this.mousePressPosition[1],
        );
      }
    } else if (this.props.onMouseHover) {
      this.props.onMouseHover(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }

    if (this.props.onMouseMove) {
      this.props.onMouseMove(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  onMouseDown = e => {
    this.mousePressPosition = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];

    if (this.props.onMouseDown) {
      this.props.onMouseDown(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  onMouseUp = e => {
    this.mousePressPosition = null;

    if (this.props.onMouseUp) {
      this.props.onMouseUp(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  onWheel = e => {
    if (this.props.onMouseWheel) {
      this.props.onMouseWheel(e.deltaY);
    }
  };

  onMouseOver = () => {
    if (this.props.onMouseOver) {
      this.props.onMouseOver();
    }
  };

  onMouseOut = () => {
    if (this.props.onMouseOut) {
      this.props.onMouseOut();
    }
  };

  render = () => (
    <canvas
      ref={this.setCanvas}
      onMouseMove={this.onMouseMove}
      onMouseDown={this.onMouseDown}
      onMouseUp={this.onMouseUp}
      onMouseOver={this.onMouseOver}
      onMouseOut={this.onMouseOut}
      onWheel={this.onWheel}
    />
  );
}

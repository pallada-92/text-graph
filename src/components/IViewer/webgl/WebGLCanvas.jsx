import React, { Component } from 'react';
import { number, func } from 'prop-types';

class WebGLCanvas extends Component {
  constructor(props) {
    super(props);
    this.width = this.props.width;
    this.height = this.props.height;
  }

  canvas = null;

  initialize(canvas) {
    this.canvas = canvas;
  }

  draw() {
    if (this.canvas === null) return;
    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, this.width, this.height);
  }

  render() {
    return (
      <canvas
        ref={canvas => {
          if (canvas !== null) {
            this.initialize(canvas);
            this.draw();
          }
        }}
        style={{ position: 'absolute', top: 0, left: 0 }}
        width={this.width}
        height={this.height}
      />
    );
  }
}

WebGLCanvas.propTypes = {
  width: number.isRequired,
  height: number.isRequired,
  registerDrawLayer: func.isRequired,
};

export default WebGLCanvas;

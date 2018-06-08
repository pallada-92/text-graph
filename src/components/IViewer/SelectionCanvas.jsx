import React, { Component } from 'react';

class SelectionCanvas extends Component {
  canvas = null;

  draw() {
    const { canvas } = this;
    if (canvas === null) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 100, 0.4)';
    ctx.fillRect(100, 100, 100, 100);
  }

  render() {
    const { width, height } = this.props;
    return (
      <canvas
        ref={canvas => {
          this.canvas = canvas;
          this.draw();
        }}
        width={width}
        height={height}
      />
    );
  }
}

export default SelectionCanvas;

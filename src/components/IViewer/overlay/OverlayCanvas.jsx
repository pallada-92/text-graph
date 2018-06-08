import React, { Component } from 'react';
import { number, func } from 'prop-types';

import { RectType, PointType, CameraType, TimerType } from '../../types';
import * as Timer from './timer';

class SelectionCanvas extends Component {
  canvas = null;

  draw() {
    const { canvas } = this;
    if (canvas === null) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 100, 0.4)';

    const { selection, timer } = this.props;
    if (selection) {
      const { top, left, width, height } = selection;
      // ctx.fillRect(top, left, width, height);
    }

    if (timer) {
      Timer.draw(timer, ctx);
    }
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

SelectionCanvas.propTypes = {
  width: number.isRequired,
  height: number.isRequired,
  selection: RectType,
  target: PointType.isRequired,
  camera: CameraType.isRequired,
  timer: TimerType,
  setTime: func.isRequired,
  togglePlayStop: func.isRequired,
};

SelectionCanvas.defaultProps = {
  selection: null,
  timer: null,
};

export default SelectionCanvas;

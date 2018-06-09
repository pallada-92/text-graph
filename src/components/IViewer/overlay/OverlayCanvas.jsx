import React, { Component } from 'react';
import { number, func } from 'prop-types';

import { RectType, PointType, CameraType, TimerType } from '../../types';
import * as Timer from './timer';
import * as Cube from './cube';

class SelectionCanvas extends Component {
  canvas = null;
  mouseDownPos = null;

  draw() {
    const { canvas } = this;
    if (canvas === null) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 100, 0.4)';

    const { selection, timer, camera, target } = this.props;
    if (selection) {
      const { top, left, width, height } = selection;
      // ctx.fillRect(top, left, width, height);
    }

    if (timer) {
      Timer.draw(timer, ctx);
    }

    Cube.draw(target, camera, ctx);
  }

  onMouseDown = ({ clientX, clientY }) => {
    this.mouseDownPos = [clientX, clientY];
    const { timer, togglePlayStop, setTime } = this.props;
    if (
      Timer.onMouseDown(
        timer,
        this.canvas,
        clientX,
        clientY,
        togglePlayStop,
        setTime
      )
    )
      return;
  };

  onMouseUp = () => {
    this.mouseDownPos = null;
  };

  onMouseMove = ({ clientX, clientY }) => {
    const { timer, setTime, camera, setCamera } = this.props;
    if (this.mouseDownPos === null) {
    } else {
      if (
        Timer.onMouseDrag(
          timer,
          this.canvas,
          ...this.mouseDownPos,
          clientX,
          clientY,
          setTime
        )
      )
        return;

      setCamera({
        alpha: camera.alpha + 0.1,
        beta: camera.beta + 0.1,
      });
    }
  };

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
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
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

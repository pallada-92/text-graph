import React, { Component } from 'react';
import { number, func } from 'prop-types';

import { PointType, CameraType, TimerType } from '../../types';
import * as Points from './points';
import * as View from './view';
import * as Timer from './timer';
import * as Cube from './cube';
import * as Zoom from './zoom';
import { prompt, log } from '../../../console';

class SelectionCanvas extends Component {
  onMouseDown = e => {
    const { clientX, clientY, button } = e;
    e.preventDefault();
    this.mouseDownPos = [clientX, clientY];
    const { timer, camera, target, togglePlayStop, setTime } = this.props;
    if (button !== 0) {
      this.mouseDownComp = 'view_left';
      this.mouseDownTarget = target;
      this.mouseDownCamera = camera;
    } else if (
      Timer.onMouseDown(
        timer,
        this.canvas,
        clientX,
        clientY,
        togglePlayStop,
        setTime
      )
    ) {
      this.mouseDownComp = 'timer';
    } else if (Cube.onMouseDown(this.canvas, clientX, clientY)) {
      if (this.mouseDownComp === 'cube') {
        prompt(
          'Вы можете скопировать текущние данные камеры:',
          JSON.stringify({
            camera,
            timer,
            target,
          })
        );
      }
      this.mouseDownComp = 'cube';
    } else if (Zoom.onMouseDown(this.canvas, clientX, clientY)) {
      this.mouseDownComp = 'zoom';
    } else {
      this.mouseDownComp = 'view';
      this.mouseDownCamera = camera;
    }
  };

  onMouseUp = () => {
    this.mouseDownPos = null;
  };

  onMouseMove = ({ clientX, clientY }) => {
    const { timer, setTime, setCamera, setTarget } = this.props;
    if (this.mouseDownPos === null) return;
    const dx = clientX - this.mouseDownPos[0];
    const dy = clientY - this.mouseDownPos[1];

    if (this.mouseDownComp === 'timer') {
      Timer.onMouseDrag(
        timer,
        this.canvas,
        ...this.mouseDownPos,
        clientX,
        clientY,
        setTime
      );
    } else if (this.mouseDownComp === 'zoom') {
      Zoom.onMouseDrag(this.mouseDownCamera, dx, dy, setCamera);
    } else if (this.mouseDownComp === 'view') {
      View.onMouseDrag(this.mouseDownCamera, dx, dy, setCamera);
    } else if (this.mouseDownComp === 'view_left') {
      View.onRightMouseDrag(
        this.mouseDownCamera,
        this.mouseDownTarget,
        dx,
        dy,
        setTarget
      );
    }
  };

  onWheel = e => {
    const { camera, setCamera } = this.props;
    View.onWheel(camera, e, setCamera);
  };

  canvas = null;
  mouseDownPos = null;
  mouseDownComp = null;
  mouseDownTarget = null;

  draw() {
    const { canvas } = this;
    if (canvas === null) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { timer, camera, target } = this.props;

    Points.draw(target, camera, ctx);

    if (timer) {
      Timer.draw(timer, ctx);
    }

    Cube.draw(target, camera, ctx);

    Zoom.draw(camera, ctx);
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
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
        onContextMenu={e => e.preventDefault()}
        onWheel={e => this.onWheel(e)}
      />
    );
  }
}

SelectionCanvas.propTypes = {
  width: number.isRequired,
  height: number.isRequired,
  target: PointType.isRequired,
  camera: CameraType.isRequired,
  timer: TimerType,
  setTime: func.isRequired,
  togglePlayStop: func.isRequired,
  setCamera: func.isRequired,
  setTarget: func.isRequired,
};

SelectionCanvas.defaultProps = {
  timer: null,
};

export default SelectionCanvas;

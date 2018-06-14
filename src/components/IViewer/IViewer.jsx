import React, { Component } from 'react';
import { shape, func } from 'prop-types';

import OverlayCanvas from './overlay/OverlayCanvas';
import TopLeftMenu from './TopLeftMenu';
import WebGLCanvas from './webgl/WebGLCanvas';

class IViewer extends Component {
  constructor(props) {
    super(props);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.state = {
      timer: {
        time: 0.5,
        maxTime: 2,
        playing: false,
        fps: 30,
        labels: ['2009', '2010', '2011'],
      },
      target: {
        x: 0,
        y: 0,
        z: 0,
      },
      camera: {
        is2d: false,
        near: 0.1,
        far: 100,
        fov: 1,
        alpha: 0,
        beta: 0,
        dist: 10,
        minDist: 0.01,
        maxDist: 100,
        bbox: {
          top: -1,
          left: -1,
          near: -1,
          width: 2,
          height: 2,
          depth: 2,
        },
      },
    };
  }

  setTarget = target => {
    this.setState({
      target,
    });
  };

  setCamera = newCamera => {
    const { camera } = this.state;
    this.setState({
      camera: {
        ...camera,
        ...newCamera,
      },
    });
  };

  setTime = time => {
    const { timer } = this.state;
    this.setState({
      timer: {
        ...timer,
        time: Math.round(time * timer.fps) / timer.fps,
      },
    });
  };

  togglePlayStop = () => {
    this.setState({
      timer: {
        ...this.state.timer,
        playing: !this.state.timer.playing,
      },
    });
  };

  render() {
    const { data, openDialog, openItem } = this.props;
    return (
      <div
        style={{
          position: 'relative',
          width: this.width,
          height: this.height,
          overflow: 'hidden',
        }}
      >
        <WebGLCanvas width={this.width} height={this.height} />
        <OverlayCanvas
          width={this.width}
          height={this.height}
          selection={{
            top: 100,
            left: 200,
            width: 300,
            height: 400,
          }}
          target={this.state.target}
          camera={this.state.camera}
          timer={this.state.timer}
          setCamera={this.setCamera}
          setTarget={this.setTarget}
          setTime={this.setTime}
          togglePlayStop={this.togglePlayStop}
        />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <TopLeftMenu
            data={data}
            openDialog={openDialog}
            openItem={openItem}
            curViewId={0}
            setView={() => 0}
          />
        </div>
      </div>
    );
  }
}

IViewer.propTypes = {
  data: shape({}).isRequired,
  openDialog: func.isRequired,
  openItem: func.isRequired,
};

export default IViewer;

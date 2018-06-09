import React, { Component } from 'react';
import { shape, func } from 'prop-types';

import OverlayCanvas from './overlay/OverlayCanvas';
import TopLeftMenu from './TopLeftMenu';
import WebGLCanvas from '../WebGLCanvas';

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
        fov: 30,
        alpha: 30,
        beta: 45,
        dist: 10,
      },
    };
  }

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
      <div>
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

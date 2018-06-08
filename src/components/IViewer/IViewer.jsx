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
  }

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
          target={{ x: 1, y: 2, z: 3 }}
          camera={{
            is2d: false,
            near: 0.1,
            far: 100,
            fov: 30,
            alpha: 30,
            beta: 45,
            dist: 10,
          }}
          timer={{
            time: 0.5,
            maxTime: 2,
            playing: false,
            fpc: 30,
            labels: ['0.0', '1.0', '2.0'],
          }}
          setTime={() => null}
          togglePlayStop={() => null}
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

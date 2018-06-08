import React, { Component } from 'react';
import { shape, func } from 'prop-types';

import SelectionCanvas from './SelectionCanvas';
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
        <SelectionCanvas width={this.width} height={this.height} />
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

import React, { Component } from 'react';
import { shape } from 'prop-types';

import WebGLCanvas from '../WebGLCanvas';

class IViewer extends Component {
  render() {
    return <WebGLCanvas />;
  }
}

IViewer.propTypes = {
  data: shape({}).isRequired,
};

export default IViewer;

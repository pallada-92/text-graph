import React, { Component } from 'react';
import { number } from 'prop-types';

class Canvas2d extends Component {
  drawLayer({ type, ...layer }) {
    if (type === 'squares') {
    }
  }

  render() {
    const { width, height } = this.props;
    return <canvas width={width} height={height} />;
  }
}

Canvas2d.propTypes = {
  width: number.isRequired,
  height: number.isRequired,
};

export default Canvas2d;

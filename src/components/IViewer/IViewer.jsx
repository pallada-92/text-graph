import React, { Component } from 'react';
import { shape } from 'prop-types';

class IViewer extends Component {
  render() {
    return (
      <div
        ref={elem =>
          elem &&
          elem.appendChild(this.props.data.images['vis_data/cmu_serif.png'])
        }
      />
    );
  }
}

IViewer.propTypes = {
  data: shape({}).isRequired,
};

export default IViewer;

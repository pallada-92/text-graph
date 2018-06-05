import React, { Component } from 'react';
import { shape, func, bool } from 'prop-types';

import { ItemType } from './OpenDialog';
import DownloadProgress from './DownloadProgress';

class DependencyResolver extends Component {
  getUrls = () => this.props.item.parts.map(pluck('url'));

  render() {
    const {
      downloader: { requestDownloads, allDone, progress, storage },
      item,
      children,
    } = this.props;

    return <span>DependencyResolver</span>;
  }
}

DependencyResolver.propTypes = {
  downloader: shape({
    requestDownloads: func.isRequired,
    allDone: bool.isRequired,
    progress: shape({}).isRequired,
    storage: shape({}).isRequired,
  }).isRequired,
  item: ItemType.isRequired,
  children: func.isRequired,
};

export default DependencyResolver;

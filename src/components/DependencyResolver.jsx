import React, { Component } from 'react';
import { shape, func, bool, arrayOf } from 'prop-types';
import { prop, propEq, mergeDeepRight, difference, fromPairs } from 'ramda';

import { ItemType } from './OpenDialog';
import DownloadProgress from './DownloadProgress';

class DependencyResolver extends Component {
  componentDidMount() {
    if (this.shouldMakeRequest()) {
      this.makeRequest();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.parts === this.props.item.parts) return;
    if (this.shouldMakeRequest()) {
      this.makeRequest();
    }
  }

  getUrls = () => this.props.item.parts.map(prop('url'));

  getLoadedUrls = () => {
    const { storage, allDone, progress } = this.props.downloader;
    return allDone ? Object.keys(storage) : progress.map(prop('url'));
  };

  getResolved() {
    let data = {};
    const { storage } = this.props.downloader;
    const { parts } = this.props.item;
    parts.filter(propEq('type', 'json')).forEach(({ url }) => {
      data = mergeDeepRight(data, storage[url]);
    });

    data.images = {};
    parts.filter(propEq('type', 'image')).forEach(({ url }) => {
      const img = new Image();
      img.src = URL.createObjectURL(storage[url]);
      img.onload = () => this.setState({});
      data.images[url] = img;
    });

    data.binary = {};
    parts.filter(propEq('type', 'binary')).forEach(({ url }) => {
      data.binary[url] = storage[url];
    });

    return data;
  }

  resolved = null;

  makeRequest = () => {
    this.props.downloader.requestDownloads(
      fromPairs(
        this.props.item.parts.map(({ url, title, type, size }) => [
          url,
          {
            url,
            title,
            size,
            key: url,
            type: { json: 'json', image: 'blob', binary: 'arraybuffer' }[
              type
            ],
          },
        ])
      )
    );
  };

  shouldMakeRequest = () =>
    difference(this.getUrls(), this.getLoadedUrls()).length > 0;

  render() {
    if (this.shouldMakeRequest()) {
      this.resolved = null;
      return <span>making request...</span>;
    }
    const { allDone, progress } = this.props.downloader;
    if (!allDone) {
      this.resolved = null;
      return <DownloadProgress progress={progress} />;
    }
    if (this.resolved === null) {
      this.resolved = this.getResolved();
    }
    let imagesReady = true;
    Object.values(this.resolved.images).forEach(image => {
      if (!image.complete) {
        imagesReady = false;
      }
    });
    if (!imagesReady) {
      return (
        <DownloadProgress
          progress={[
            {
              title: 'Чтение изображений',
              token: 'images',
              key: 'images',
              bytesDownloaded: 100,
              bytesToDownload: 100,
              state: 'done',
            },
          ]}
        />
      );
    }
    return this.props.children(this.resolved);
  }
}

DependencyResolver.propTypes = {
  downloader: shape({
    requestDownloads: func.isRequired,
    allDone: bool.isRequired,
    progress: arrayOf(shape({})).isRequired,
    storage: shape({}).isRequired,
  }).isRequired,
  item: ItemType.isRequired,
  children: func.isRequired,
};

export default DependencyResolver;

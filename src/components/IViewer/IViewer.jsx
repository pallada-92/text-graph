import React, { Component } from 'react';
import { func, shape } from 'prop-types';
import { pluck, equals } from 'ramda';

import { ItemType } from '../OpenDialog';

class IViewer extends Component {
  checkDownloads() {
    const {
      item: { parts },
      downloader: { requestDownloads, storage },
    } = this.props;

    const urls = pluck('url', parts);
    urls.sort();

    const tokens = Object.keys(storage);
    tokens.sort();
    if (equals(urls, tokens)) return true;

    const request = {};
    urls.forEach(url => {
      request[url] = {
        url,
        type: 'json',
        title: url,
        key: url,
      };
    });

    requestDownloads(request);
    return false;
  }

  render() {
    if (!this.checkDownloads()) return null;
    return <span>IViewer</span>;
  }
}

IViewer.propTypes = {
  downloader: shape({
    requestDownloads: func.isRequired,
    storage: shape({}).isRequired,
  }).isRequired,
  item: ItemType.isRequired,
};

export default IViewer;

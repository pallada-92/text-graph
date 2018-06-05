import React from 'react';
import { shape, func } from 'prop-types';
import { keys } from 'ramda';

import Downloader from './Downloader';
import DownloadProgress from './DownloadProgress';

const SimpleDownloader = ({ downloads, children }) => (
  <Downloader ref={elem => elem && elem.requestDownloads(downloads)}>
    {({ allDone, progress, storage }) =>
      allDone && keys(downloads).length === keys(storage).length ? (
        children(storage)
      ) : (
        <DownloadProgress progress={progress} />
      )
    }
  </Downloader>
);

SimpleDownloader.propTypes = {
  downloads: shape({}).isRequired,
  children: func.isRequired,
};

export default SimpleDownloader;

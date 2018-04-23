import React from 'react';
import { keys } from 'ramda';

import Downloader from './Downloader';
import DownloadProgress from './DownloadProgress';

export default ({ downloads, children }) => (
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

import React from 'react';

import SimpleDownloader from './SimpleDownloader';
import Downloader from './Downloader';
import OpenDialog from './OpenDialog';
import State from './State';
import findItem from '../findItem';
import IViewer from './IViewer';
import DownloadManager from './DownloadManager';

const App = () => (
  <SimpleDownloader
    downloads={{
      index: {
        url: 'vis_data/index.json',
        type: 'json',
        title: 'Список визуализаций',
        key: 'index',
      },
    }}
  >
    {({ index }) => {
      const selItemDefault = findItem(index);
      return (
        <State
          initial={{
            selItem: selItemDefault,
            isDialogOpened: selItemDefault === null,
          }}
        >
          {({ state: { selItem, isDialogOpened }, setState }) => (
            <Downloader>
              {downloader =>
                isDialogOpened ? (
                  <OpenDialog
                    index={index}
                    selection={(selItem && selItem.id) || ''}
                    doOpen={item => {
                      setState({ selItem: item, isDialogOpened: false });
                    }}
                  />
                ) : (
                  <DownloadManager downloader={downloader} item={selItem}>
                    {data => <IViewer data={data} />}
                  </DownloadManager>
                )
              }
            </Downloader>
          )}
        </State>
      );
    }}
  </SimpleDownloader>
);

export default App;

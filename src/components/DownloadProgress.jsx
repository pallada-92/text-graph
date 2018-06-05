import React from 'react';
import { arrayOf, shape, number, string } from 'prop-types';
import { sortBy, prop } from 'ramda';
import { Progress } from 'semantic-ui-react';

const DownloadProgress = ({ progress }) => (
  <div style={{ margin: 100 }}>
    {sortBy(prop('key'), progress).map(
      ({ token, title, bytesDownloaded, bytesToDownload, state }) => (
        <Progress
          key={token}
          size="tiny"
          error={state === 'fail'}
          success={state === 'done'}
          active={state === 'downloading'}
          percent={
            state === 'done'
              ? 100
              : bytesToDownload
                ? (bytesDownloaded / bytesToDownload) * 100
                : 50
          }
          content={state === 'fail' ? `${title}: ошибка` : title}
        />
      )
    )}
  </div>
);

DownloadProgress.propTypes = {
  progress: arrayOf(
    shape({
      key: string.isRequired,
      token: string.isRequired,
      bytesDownloaded: number.isRequired,
      bytesToDownload: number.isRequired,
      state: string.isRequired,
    })
  ).isRequired,
};

export default DownloadProgress;

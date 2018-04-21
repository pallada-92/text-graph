import React from 'react';
import { sortBy, prop } from 'ramda';
import { Progress } from 'semantic-ui-react';

export default ({ progress }) =>
  sortBy(prop('key'), progress).map(
    ({
      token,
      key,
      url,
      type,
      title,
      bytesDownloaded,
      bytesToDownload,
      state,
    }) => (
      <Progress
        key={token}
        size="tiny"
        error={state === 'fail'}
        success={state === 'done'}
        active={state === 'downloading'}
        percent={
          state === 'done'
            ? 100
            : bytesToDownload ? bytesDownloaded / bytesToDownload * 100 : 50
        }
        content={state === 'fail' ? title + ': ошибка' : title}
      />
    ),
  );

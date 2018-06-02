import React from 'react';

import SimpleDownloader from './SimpleDownloader';
import FullScreen from './FullScreen';
import Graph2dApp from './Graph2dApp';

export default () => (
  <SimpleDownloader
    downloads={{
      coords2d: {
        url: 'data/severstal.json',
        type: 'json',
        title: 'матрица совстречаемости',
        key: 'data',
      },
    }}
  >
    {({ data }) => (
      <FullScreen>
        {({ width, height }) => (
          <Graph2dApp data={data} width={width} height={height} />
        )}
      </FullScreen>
    )}
  </SimpleDownloader>
);

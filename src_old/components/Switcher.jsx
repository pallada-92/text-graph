import React, { Fragment } from 'react';
import { Dropdown } from 'semantic-ui-react';

import State from './State';
import Cloud3dApp from './Cloud3dApp';
import Cloud2dApp from './Cloud2dApp';
import Graph2dApp from './Graph2dContainer';
import DownloaderTestApp from './DownloaderTest';

const apps = {
  cloud3d: <Cloud3dApp />,
  cloud2d: <Cloud2dApp />,
  graph2d: <Graph2dApp />,
  downloaderTest: <DownloaderTestApp />,
};

export default () => (
  <State initial={{ selected: 'cloud3d' }}>
    {({ state: { selected }, setState }) => (
      <Fragment>
        {apps[selected]}
        <div style={{ position: 'absolute', top: 20, left: 20 }}>
          <Dropdown
            selection
            options={[
              { text: 'word2vec 3D', value: 'cloud3d' },
              { text: 'word2vec 2D', value: 'cloud2d' },
              { text: 'graph 2D', value: 'graph2d' },
              { text: 'downloader test', value: 'downloaderTest' },
            ]}
            onChange={(_, { value }) => setState({ selected: value })}
            value={selected}
          />
        </div>
      </Fragment>
    )}
  </State>
);

import React from 'react';
import { func, string } from 'prop-types';
import { Header, List as L } from 'semantic-ui-react';

import { IndexType } from './types';
import List from './List';

const OpenDialog = ({ index, doOpen, selection }) => (
  <div style={{ margin: 40 }}>
    <Header as="h2" style={{ marginBottom: 25 }}>
      Открыть
    </Header>
    <L>
      <List selection={selection} doOpen={doOpen}>
        {index}
      </List>
    </L>
  </div>
);

OpenDialog.propTypes = {
  index: IndexType.isRequired,
  doOpen: func.isRequired,
  selection: string.isRequired,
};

export default OpenDialog;

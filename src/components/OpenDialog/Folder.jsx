import React from 'react';
import { func, string } from 'prop-types';
import { List as L } from 'semantic-ui-react';

import { FolderType } from './types';
import List from './List';

const Folder = ({
  selection,
  doOpen,
  children: { title, description, children },
}) => (
  <L.Item>
    <L.Icon name="folder" />
    <L.Content>
      <L.Header>{title}</L.Header>
      <L.Description>{description}</L.Description>
      <L.List>
        <List selection={selection} doOpen={doOpen}>
          {children}
        </List>
      </L.List>
    </L.Content>
  </L.Item>
);

Folder.propTypes = {
  selection: string.isRequired,
  doOpen: func.isRequired,
  children: FolderType.isRequired,
};

export default Folder;

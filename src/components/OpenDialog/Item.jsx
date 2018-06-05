import React from 'react';
import { bool, func } from 'prop-types';
import { List as L, Label } from 'semantic-ui-react';

import { ItemType } from './types';

const Item = ({ selected, doOpen, children }) => (
  <L.Item>
    <L.Icon name={children.icon} />
    <L.Content>
      <L.Header>
        <a href="#" onClick={() => doOpen(children)}>
          {children.title}
        </a>
        {selected ? (
          <Label color="blue" size="mini" style={{ marginLeft: 6 }}>
            Открыто
          </Label>
        ) : null}
      </L.Header>
      <L.Description>{children.description}</L.Description>
    </L.Content>
  </L.Item>
);

Item.propTypes = {
  selected: bool.isRequired,
  doOpen: func.isRequired,
  children: ItemType.isRequired,
};

export default Item;

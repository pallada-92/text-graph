import React from 'react';
import { func, string } from 'prop-types';

import { IndexType } from './types';
import Item from './Item';
import Folder from './Folder';

const List = ({ selection, doOpen, children }) =>
  children.map(
    item =>
      item.type === 'item' ? (
        <Item key={item.id} selected={item.id === selection} doOpen={doOpen}>
          {item}
        </Item>
      ) : (
        <Folder key={item.id} selection={selection} doOpen={doOpen}>
          {item}
        </Folder>
      )
  );

List.propTypes = {
  selection: string.isRequired,
  doOpen: func.isRequired,
  children: IndexType.isRequired,
};

export default List;

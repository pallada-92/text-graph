import React from 'react';
import { Segment } from 'semantic-ui-react';

export default ({ word, rank }) => (
  <Segment>
    {word} ({rank})
  </Segment>
);

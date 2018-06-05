import { Component } from 'react';
import { func, shape } from 'prop-types';

class State extends Component {
  constructor(props) {
    super(props);

    if (this.props.initial) {
      this.state = this.props.initial;
    } else {
      this.state = {};
    }
  }

  render = () =>
    this.props.children({
      state: this.state,
      setState: data => this.setState(data),
    });
}

State.propTypes = {
  initial: shape({}),
  children: func.isRequired,
};

State.defaultProps = {
  initial: {},
};

export default State;

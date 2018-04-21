import { Component } from 'react';

export default class extends Component {
  state = {};

  render = () =>
    this.props.children({
      state: this.state,
      setState: data => this.setState(data),
    });
}

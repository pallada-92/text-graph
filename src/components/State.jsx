import { Component } from 'react';

export default class extends Component {
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

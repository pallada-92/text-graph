import React, { Component } from 'react';
import Graph2dCanvas from './Graph2dCanvas';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: {
        cx: 0,
        cy: 0,
        height: 100,
      },
      data: null,
      width: 0,
      height: 0,
    };
  }

  onResize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  componentDidMount = () => {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.onResize);
  };

  render = () => (
    <Graph2dCanvas
      data={this.state.data}
      width={this.state.width}
      height={this.state.height}
    />
  );
}

export default App;

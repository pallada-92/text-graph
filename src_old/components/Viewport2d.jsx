import { Component } from 'react';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: this.props.initialViewport,
      mouseScreenPos: [0, 0],
      mouseSpacePos: [0, 0],
      mouseOver: false,
    };
    this.mouseDownViewport = null;
  }

  onMouseDown = () => {
    this.mouseDownViewport = this.state.viewport;
  };

  screenToSpace([x, y]) {
    const v = this.state.viewport;
    const s = this.props.height / v[2];

    return [
      (x - this.props.width / 2) / s + v[0],
      (y - this.props.height / 2) / s + v[1],
    ];
  }

  onMouseOver = () => {
    this.setState({
      mouseOver: true,
    });
  };

  onMouseOut = () => {
    this.setState({
      mouseOver: false,
    });
  };

  onMouseMove = (x, y) => {
    this.setState({
      mouseOver: true,
      mouseScreenPos: [x, y],
      mouseSpacePos: this.screenToSpace([x, y]),
    });
  };

  onMouseDrag = (dx, dy) => {
    const scale = this.state.viewport[2] / this.props.height;
    const v = this.mouseDownViewport;

    this.setState({
      viewport: [v[0] - dx * scale, v[1] - dy * scale, v[2]],
    });
  };

  onMouseWheel = delta => {
    if (delta === 0) return;

    const v = this.state.viewport;
    const step = this.props.step || 1.1;
    const scale = delta > 0 ? step : 1 / step;
    const cnt = this.state.mouseOver ? this.state.mouseSpacePos : [v[0], v[1]];

    this.setState({
      viewport: [
        v[0] * scale + cnt[0] * (1 - scale),
        v[1] * scale + cnt[1] * (1 - scale),
        v[2] * scale,
      ],
    });
  };

  render() {
    return this.props.children({
      viewport: this.state.viewport,
      setViewport: viewport => this.setState({ viewport }),
      mouseScreenPos: this.state.mouseScreenPos,
      mouseSpacePos: this.state.mouseSpacePos,
      mouseOver: this.state.mouseOver,

      onMouseMove: this.onMouseMove,
      onMouseDown: this.onMouseDown,
      onMouseDrag: this.onMouseDrag,
      onMouseWheel: this.onMouseWheel,
      onMouseOver: this.onMouseOver,
      onMouseOut: this.onMouseOut,
    });
  }
}

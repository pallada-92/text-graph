import { Component } from 'react';
import { clamp } from 'ramda';

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      target: this.props.initialTarget,
      viewport: this.props.initialViewport,
    };

    this.mouseDownViewport = null;
  }

  pt2px = ([x, y, z]) => {
    const t = this.state.target;
    const dx = x - t[0];
    const dy = y - t[1];
    const dz = z - t[2];

    const [alpha, beta, dist, fov] = this.state.viewport;
    const dx1 = dz * Math.sin(-alpha) + dx * Math.cos(-alpha);
    const dy1 = dy;
    const dz1 = dz * Math.cos(-alpha) - dx * Math.sin(-alpha);

    const dx2 = dx1;
    const dy2 = dz1 * Math.sin(-beta) + dy1 * Math.cos(-beta);
    const dz2 = dz1 * Math.cos(-beta) - dy1 * Math.sin(-beta);

    const dx3 = dx2;
    const dy3 = dy2;
    const dz3 = dist - dz2;

    const h = Math.tan(fov / 2) * dist;
    const c = dist / dz3 / h * this.props.height / 2;
    const u = dx3 * c;
    const v = dy3 * c;

    return [u + this.props.width / 2, -v + this.props.height / 2, 1 / dz3];
  };

  onMouseDown = () => {
    this.mouseDownViewport = this.state.viewport;
  };

  onMouseDrag = (dx, dy) => {
    const v = this.mouseDownViewport;
    const scale = Math.PI / this.props.height;

    this.setState({
      viewport: [
        v[0] - dx * scale,
        clamp(-Math.PI / 2, Math.PI / 2, v[1] + dy * scale),
        v[2],
        v[3],
      ],
    });
  };

  onMouseWheel = delta => {
    if (delta === 0) return;

    const v = this.state.viewport;
    const step = this.props.step || 1.1;
    const scale = delta > 0 ? step : 1 / step;

    this.setState({
      viewport: [v[0], v[1], v[2] * scale, v[3]],
    });
  };

  render() {
    return this.props.children({
      target: this.state.target,
      viewport: this.state.viewport,
      setTarget: target => this.setState({ target }),
      setViewport: viewport => this.setState({ viewport }),
      pt2px: this.pt2px,

      onMouseMove: this.onMouseMove,
      onMouseDown: this.onMouseDown,
      onMouseDrag: this.onMouseDrag,
      onMouseWheel: this.onMouseWheel,
      onMouseOver: this.onMouseOver,
      onMouseOut: this.onMouseOut,
    });
  }
}

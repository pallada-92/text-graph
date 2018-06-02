import React from 'react';
import ReactDOM from 'react-dom';
import Stats from 'stats-js';
import 'semantic-ui-css/semantic.min.css';

import './index.css';
import Root from './components/Root';
import registerServiceWorker from './registerServiceWorker';

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = 0;
stats.domElement.style.bottom = 0;
document.body.appendChild(stats.domElement);
requestAnimationFrame(function loop() {
  stats.update();
  requestAnimationFrame(loop);
});

ReactDOM.render(React.createElement(Root), document.getElementById('root'));

registerServiceWorker();

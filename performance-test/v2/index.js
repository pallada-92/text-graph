function Test1(timer, width, height) {
  this.name = 'Test send time';
  this.webgl = new Webgl();
  this.width = width;
  this.height = height;

  this.prepare = callback => {
    load(['shaders/1.c'], ({ 'shaders/1.c': program }) => {
      const wgl = this.webgl;
      const gl = wgl.gl;
      this.program = wgl.compile(program, []);
      this.inputTexture = wgl.newRGBATexture(1, 1, 0);
      this.input = new Uint8Array([10, 20, 30, 40]);
      this.outputTexture = wgl.newRGBATexture(1, 1, null, 1);
      this.fb = wgl.newFramebuffer([this.outputTexture]);
      wgl.useFramebuffer(this.fb);
      gl.useProgram(this.program);
      this.output = new Uint8Array(1 * 1 * 4);
      callback([0, null]);
    });
  };

  this.iter = ([max, last]) => {
    const wgl = this.webgl;
    timer.phase('send');
    wgl.sendTexture(this.inputTexture, this.input);
    timer.phase('draw');
    wgl.draw();
    timer.phase('read');
    wgl.readPixels(this.output);
    max = Math.max(max, this.output[0]);
    timer.phase(null);
    return [max, this.output];
  };
}

function load(urls, callback) {
  let loaded = 0;
  const res = {};

  function checkLoaded() {
    if (loaded >= urls.length) {
      callback(res);
    }
  }

  urls.forEach(url => {
    const req = new XMLHttpRequest();
    req.addEventListener('load', () => {
      res[url] = req.responseText;
      loaded += 1;
      checkLoaded();
    });
    req.open('GET', url);
    req.send();
  });
}

function Timer() {
  this.timers = {};
  this.lastTimer = null;

  this.start = function(timerName) {
    if (!(timerName in this.timers)) {
      this.timers[timerName] = {
        count: 0,
        mean: 0,
        std: 0,
      };
    }
    this.timers[timerName].started = performance.now();
    this.lastTimer = timerName;
  };

  this.stop = function(timerName) {
    const timer = this.timers[timerName];
    const time = performance.now() - timer.started;
    timer.count += 1;
    timer.mean += time;
    timer.std += time * time;
    timer.started = 0;
    this.lastTimer = null;
  };

  this.phase = function(timerName) {
    if (this.lastTimer) {
      this.stop(this.lastTimer);
    }
    if (timerName) {
      this.start(timerName);
    }
  };

  this.printStats = function() {
    for (const timerName in this.timers) {
      const timer = this.timers[timerName];
      const N = timer.count;
      timer.std = Math.sqrt(
        (timer.std - Math.pow(timer.mean, 2) / N) / (N - 1),
      );
      timer.mean /= N;
    }
    console.table(this.timers);
  };
}

window.addEventListener('load', () => {
  const timer = new Timer();
  const test = new Test1(timer);
  window.test = test;
  const iters = 1000;
  test.prepare(result => {
    const started = performance.now();
    for (let i = 0; i < iters; i++) {
      result = test.iter(result);
    }
    const ended = performance.now();
    console.log('Result:', result);
    console.log(
      'Test "%s". Iters: %d. Total time: %f',
      test.name,
      iters,
      (ended - started) / iters,
    );
    timer.printStats();
  });
});

function Test1(timer, { inputWidth, inputHeight, outputWidth, outputHeight }) {
  this.name = 'Test send time';
  this.webgl = new Webgl();

  this.prepare = callback => {
    load(['shaders/1.c'], ({ 'shaders/1.c': program }) => {
      const wgl = this.webgl;
      const gl = wgl.gl;
      this.program = wgl.compile(program, []);
      this.inputTexture = wgl.newRGBATexture(inputWidth, inputHeight, 0);
      this.input = new Uint8Array(inputWidth * inputHeight * 4);
      this.outputTexture = wgl.newRGBATexture(outputWidth, outputHeight, 1);
      this.output = new Uint8Array(outputWidth * outputHeight * 4);
      wgl.sendTexture(this.outputTexture, null);
      wgl.sendTexture(this.inputTexture, this.input);
      this.fb = wgl.newFramebuffer([this.outputTexture]);
      wgl.useFramebuffer(this.fb);
      gl.useProgram(this.program);
      gl.uniform1i(this.program.input1, 0);
      callback([0, null]);
    });
  };

  this.iter = ([max, last]) => {
    const wgl = this.webgl;
    /*
    timer.phase('populate');
    for (let i = 0; i < this.input.length; i++) {
      this.input[i] = Math.floor(Math.random() * 256);
    }
    timer.phase('send');
    wgl.sendTexture(this.inputTexture, this.input);
    */
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

const tests = [
  [
    Test1,
    {
      inputWidth: 1,
      inputHeight: 1,
      outputWidth: 1,
      outputHeight: 1,
    },
    1000,
  ],
  [
    Test1,
    {
      inputWidth: 100,
      inputHeight: 100,
      outputWidth: 100,
      outputHeight: 100,
    },
    100,
  ],
];

function doTest(testObj, callback) {
  const timer = new Timer();
  const test = new testObj[0](timer, testObj[1]);
  window.test = test;
  const iters = testObj[2];
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
    if (callback) {
      callback();
    }
  });
}

window.addEventListener('load', () => {
  let curTest = -1;
  const fun = () => {
    curTest += 1;
    if (curTest >= tests.length) return;
    console.log('Test %d', curTest);
    doTest(tests[curTest], fun);
  };
  // fun();
  doTest(tests[1]);
});

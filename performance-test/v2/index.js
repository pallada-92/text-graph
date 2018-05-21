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

function TestAttractionsJS(timer, { eCnt, cCnt, cSize, vCnt, dim }) {
  this.name = 'Test attractions JS';

  this.prepare = callback => {
    this.edges = new Array(cCnt * (cSize + 1));
    for (let i = 0; i < this.edges.length; i++) {
      this.edges[i] = Math.random();
    }
    this.positions = new Array(vCnt * dim);
    for (let i = 0; i < this.positions.length; i++) {
      this.positions[i] = Math.random();
    }
    callback(0);
  };

  this.iter = result => {
    timer.start('all');
    for (let i = 0; i < cCnt; i++) {
      timer.start('iter');
      const source = this.edges[i * (cSize + 1) + 0];
      const x = this.positions[source * dim + 0];
      const y = this.positions[source * dim + 1];
      let x_sum = 0;
      let y_sum = 0;
      for (let j = 0; j < cSize; j++) {
        const entry = this.edges[i * (cSize + 1) + 1 + j];
        const weight = (entry * 100) % 1;
        const target = Math.floor(entry * 100);
        const dx = this.positions[target * dim + 0] - x;
        const dy = this.positions[target * dim + 1] - y;
        const sq_dist = dx * dx + dy * dy;
        const mul = weight / (sq_dist + 1);
        x_sum += mul * dx;
        y_sum += mul * dy;
      }
      this.positions[source * dim + 0] += x_sum;
      this.positions[source * dim + 1] += y_sum;
      timer.stop('iter');
    }
    timer.stop('all');
    return result;
  };
}

function TestAttractions(timer, { eCnt, cCnt, cSize, vCnt, dim }) {
  this.name = 'Test attractions';
  this.webgl = new Webgl();

  this.prepare = callback => {
    load(['shaders/attractions.c'], ({ 'shaders/attractions.c': program }) => {
      const wgl = this.webgl;
      const gl = wgl.gl;
      this.program = wgl.compile(program, [
        'positions',
        'edges',
        'eCnt',
        'vCnt',
        'cCnt',
        'cSize',
      ]);

      this.positionsTexture = wgl.newRGBATexture(dim, vCnt, 0);
      this.positions = new Uint8Array(vCnt * dim * 4);
      wgl.sendTexture(this.positionsTexture, this.positions);

      this.edgesTexture = wgl.newRGBATexture(1 + cSize, cCnt, 1);
      this.edges = new Uint8Array(cCnt * (1 + cSize) * 4);
      wgl.sendTexture(this.edgesTexture, this.edges);

      this.outputTextures = [];
      for (let i = 0; i < dim; i++) {
        const data = new Uint8Array(cCnt * 4);
        const texture = wgl.newRGBATexture(1, cCnt, 2 + i);
        const fb = wgl.newFramebuffer([texture]);
        this.outputTextures.push({
          data,
          texture,
          fb,
        });
        wgl.sendTexture(texture, null);
      }
      this.fb = wgl.newFramebuffer(
        this.outputTextures.map(({ texture }) => texture),
      );
      gl.useProgram(this.program);
      gl.uniform1i(this.program.positions, 0);
      gl.uniform1i(this.program.edges, 1);
      gl.uniform1i(this.program.eCnt, eCnt);
      gl.uniform1i(this.program.vCnt, vCnt);
      gl.uniform1i(this.program.cCnt, cCnt);
      gl.uniform1i(this.program.cSize, cSize);
      this.output = new Uint8Array(cCnt * 4);
      callback([0, null]);
    });
  };

  this.iter = ([max, last]) => {
    const wgl = this.webgl;
    timer.phase('populate');
    for (let i = 0; i < this.positions.length; i++) {
      this.positions[i] = Math.floor(Math.random() * 256);
    }
    timer.phase('send');
    wgl.sendTexture(this.positionsTexture, this.positions);
    timer.phase('draw');
    wgl.useFramebuffer(this.fb);
    wgl.draw();
    timer.phase('read1');
    wgl.useFramebuffer(this.outputTextures[0].fb);
    wgl.readPixels(this.output);
    timer.phase('read2');
    wgl.useFramebuffer(this.outputTextures[1].fb);
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

  this.reset = function() {
    this.timers = {};
    this.lastTimer = null;
  };

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
      inputWidth: 1,
      inputHeight: 1,
      outputWidth: 10,
      outputHeight: 10,
    },
    100,
  ],
  [
    TestAttractions,
    { eCnt: 4096 * 100, cCnt: 4096 * 2, cSize: 1000, vCnt: 4096, dim: 2 },
    1000,
  ],
  [
    TestAttractionsJS,
    { eCnt: 4096 * 100, cCnt: 4096 * 2, cSize: 1000, vCnt: 4096, dim: 2 },
    10,
  ],
];

function doTest(testObj, callback) {
  const timer = new Timer();
  const test = new testObj[0](timer, testObj[1]);
  window.test = test;
  const iters = testObj[2];
  test.prepare(result => {
    for (let i = 0; i < iters / 3; i++) {
      result = test.iter(result);
    }
    timer.reset();
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
  doTest(tests[3]);
});

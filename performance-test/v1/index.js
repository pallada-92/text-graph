function generatePoints(n, typed) {
  let res;
  if (typed === 32) {
    res = new Float32Array(2 * n);
  } else if (typed === 64) {
    res = new Float64Array(2 * n);
  } else {
    res = new Array(2 * n);
  }
  for (let i = 0; i < 2 * n; i++) {
    res[i] = (Math.abs(Math.sin(i)) * 1000) % 1;
  }
  return res;
}

function stepCopy(res) {
  const nextRes = new Array(res.length);
  for (let i = 0; i < res.length; i += 2) {
    const x1 = res[i];
    const y1 = res[i + 1];
    let sx = 0;
    let sy = 0;
    for (let j = 0; j < res.length; j += 2) {
      if (j == i) continue;
      const x2 = res[j];
      const y2 = res[j + 1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.log(dist / 0.5) * 0.00001;
      sx += dx / dist * force;
      sy += dy / dist * force;
    }
    nextRes[i] = x1 + sx;
    nextRes[i + 1] = y1 + sy;
  }
  return nextRes;
}

function stepRewr(res) {
  for (let i = 0; i < res.length; i += 2) {
    const x1 = res[i];
    const y1 = res[i + 1];
    let sx = 0;
    let sy = 0;
    for (let j = 0; j < res.length; j += 2) {
      if (j == i) continue;
      const x2 = res[j];
      const y2 = res[j + 1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.log(dist / 0.5) * 0.00001;
      sx += dx / dist * force;
      sy += dy / dist * force;
    }
    res[i] = x1 + sx;
    res[i + 1] = y1 + sy;
  }
  return res;
}

function stepRewrHalf(res) {
  for (let i = 0; i < res.length; i += 2) {
    const x1 = res[i];
    const y1 = res[i + 1];
    let sx = 0;
    let sy = 0;
    for (let j = 0; j < res.length; j += 2) {
      if (j <= i) continue;
      const x2 = res[j];
      const y2 = res[j + 1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.log(dist / 0.5) * 0.00001;
      const ddx = dx / dist * force;
      const ddy = dy / dist * force;
      res[i] += ddx;
      res[i + 1] += ddy;
      res[j] -= ddx;
      res[j + 1] -= ddy;
    }
  }
  return res;
}

function stepAsmModule(stdlib, foreign, heap) {
  'use asm';
  const res = new stdlib.Float64Array(heap);
  const sqrt = stdlib.Math.sqrt;
  const log = stdlib.Math.log;

  function rewrHalf(n) {
    n = n | 0;
    var i = 0,
      j = 0;
    var x1 = 0.0,
      y1 = 0.0,
      sx = 0.0,
      sy = 0.0;
    var x2 = 0.0,
      y2 = 0.0,
      dx = 0.0,
      dy = 0.0;
    var dist = 0.0,
      force = 0.0,
      ddx = 0.0,
      ddy = 0.0;
    for (i = 0; (i | 0) < ((n << 4) | 0); i = (i + 16) | 0) {
      x1 = +res[(i | 0) >> 3];
      y1 = +res[(i + 8) >> 3];
      sx = 0.0;
      sy = 0.0;
      for (j = 0; (j | 0) < ((n << 4) | 0); j = (j + 16) | 0) {
        if ((j | 0) > (i | 0)) {
          x2 = +res[j >> 3];
          y2 = +res[(j + 8) >> 3];
          dx = x2 - x1;
          dy = y2 - y1;
          dist = sqrt(dx * dx + dy * dy);
          force = log(dist / 0.5) * 0.00001;
          ddx = dx / dist * force;
          ddy = dy / dist * force;
          res[i >> 3] = +res[i >> 3] + ddx;
          res[(i + 8) >> 3] = +res[(i + 8) >> 3] + ddy;
          res[j >> 3] = +res[j >> 3] - +ddx;
          res[(j + 8) >> 3] = +res[(j + 8) >> 3] - +ddy;
        }
      }
    }
    return 0;
  }

  return {
    rewrHalf: rewrHalf,
  };
}

function drawPoints(points, color, clear) {
  canvas = document.getElementById('preview');
  ctx = canvas.getContext('2d');
  if (clear) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = color;
  const r = 1;
  for (let i = 0; i < points.length; i += 2) {
    const x = points[i] * canvas.width;
    const y = points[i + 1] * canvas.height;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
}

function sum(array) {
  let sum = 0;
  array.forEach(v => (sum += v * v));
  return sum;
}

if (0) {
  window.addEventListener('load', () => {
    window.points = generatePoints(4096, 64);
    const asm = stepAsmModule(window, null, window.points.buffer);

    function tick() {
      timer.start('all');
      for (let i = 0; i < 10; i++) {
        timer.start('iter');
        // asm.rewrHalf(4096);
        stepRewrHalf(window.points);
        timer.stop('iter');
      }
      timer.stop('all');
      timer.printStats();
      drawPoints(window.points, 'black', true);
      // window.requestAnimationFrame(tick);
    }
    tick();
  });
} else {
  window.addEventListener('load', () => {
    let points = generatePoints(4096, 64);
    const req = new XMLHttpRequest();

    function tick() {
      drawPoints(points, 'red', true);
      const t0 = performance.now();
      points = webgl(req.responseText, points);
      for (let iter = 0; iter < 10; iter++) {
        points = webgl(req.responseText, points);
      }
      timer.printStats();
      const dur = performance.now() - t0;
      console.log('webgl', dur);
      // window.requestAnimationFrame(tick);
    }

    req.addEventListener('load', () => {
      tick();
    });
    req.open('GET', 'shader.c');
    req.send();
  });
}

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

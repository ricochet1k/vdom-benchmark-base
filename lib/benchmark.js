'use strict';

var Executor = require('./executor');

function Benchmark(impl, data, reportCb) {
  if (reportCb === void 0) reportCb = null;

  this.impl = impl;
  this.data = data;
  this.reportCb = reportCb;
  this.container = document.createElement('div');

  this._runButton = document.getElementById('RunButton');
  this._iterationsElement = document.getElementById('Iterations');
  this._reportElement = document.createElement('pre');

  document.body.appendChild(this.container);
  document.body.appendChild(this._reportElement);

  var self = this;

  this._runButton.addEventListener('click', function(e) {
    if (self._runButton.disabled !== 'true') {
      var iterations = parseInt(self._iterationsElement.value);

      e.preventDefault();
      self.ready(false);
      self.run(function(samples) {
        self._reportElement.textContent = JSON.stringify(samples, null, ' ');
        if (self.reportCb != null) {
          self.reportCb(samples);
        }
        self.ready(true);
      }, iterations);
    }
  }, false);

  this.ready(true);
}

Benchmark.prototype.ready = function(v) {
  if (v) {
    this._runButton.disabled = '';
  } else {
    this._runButton.disabled = 'true';
  }
};

Benchmark.prototype.run = function(cb, iterations) {
  if (iterations === void 0) iterations = 10;

  new Executor(this.impl, this.container, this.data, 1, function() { // warmup
    new Executor(this.impl, this.container, this.data, iterations, cb).start();
  }).start();
};

module.exports = Benchmark;

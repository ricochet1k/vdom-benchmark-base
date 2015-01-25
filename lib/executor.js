'use strict';

function Executor(impl, container, data, iterations, cb, iterCb) {
  if (iterCb === void 0) iterCb = null;

  this.impl = impl;
  this.container = container;
  this.data = data;
  this.iterations = iterations;
  this.cb = cb;
  this.iterCb = iterCb;

  this._currentUnit = 0;
  this._currentIter = 0;
  this._renderSamples = [];
  this._updateSamples = [];
  this._result = [];

  this._tasksCount = data.units.length * iterations;

  this._iter = this.iter.bind(this);
}

Executor.prototype.start = function() {
  this._iter();
};

Executor.prototype.finished = function() {
  this.cb(this._result);
};

Executor.prototype.progress = function() {
  if (this._currentUnit === 0 && this._currentIter === 0) {
    return 0;
  }

  var units = this.data.units;
  return (this._currentUnit * units.length + this._currentIter) / (units.length * this.iterataions);
};

Executor.prototype.iter = function() {
  if (this.iterCb != null) {
    this.iterCb(this);
  }

  var units = this.data.units;

  if (this._currentUnit < units.length) {
    var unit = units[this._currentUnit];

    if (this._currentIter < this.iterations) {
      var e, t;
      var renderTime, updateTime;

      e = new this.impl(this.container, unit.data.a, unit.data.b);
      e.setUp();

      t = window.performance.now();
      e.render();
      renderTime = window.performance.now() - t;

      t = window.performance.now();
      e.update();
      updateTime = window.performance.now() - t;
      e.tearDown();

      this._renderSamples.push(renderTime);
      this._updateSamples.push(updateTime);

      this._currentIter++;
    } else {
      this._result.push({
        name: unit.name + ' ' + 'render()',
        data: this._renderSamples.slice(0)
      });

      this._result.push({
        name: unit.name + ' ' + 'update()',
        data: this._updateSamples.slice(0)
      });

      this._currentUnit++;

      this._currentIter = 0;
      this._renderSamples = [];
      this._updateSamples = [];
    }

    setTimeout(this._iter, 0);
  } else {
    this.finished();
  }
};

module.exports = Executor;

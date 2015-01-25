'use strict';

var Benchmark = require('./benchmark');

function initFromDataScript(dataUrl, impl) {
  var e = document.createElement('script');
  e.src = dataUrl;

  e.onload = function() {
    var data = window.generateBenchmarkData();
    new Benchmark(impl, data);
  };

  document.head.appendChild(e);
}

function initFromParentWindow(parent, name, version, impl) {
  window.addEventListener('message', function(e) {
    var data = e.data;
    var type = data.type;

    if (type === 'benchmarkData') {
      new Benchmark(impl, data.data, function(samples) {
        parent.postMessage({
            type: 'sendReport',
            data: {
              name: name,
              version: version,
              samples: samples
            }
        }, '*');
      });
    }
  }, false);

  parent.postMessage({
    type: 'getBenchmarkData',
    data: null
  }, '*');
}

function init(name, version, impl) {
  // Parse Query String.
  var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
      var p=a[i].split('=', 2);
      if (p.length == 1) {
        b[p[0]] = "";
      } else {
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
      }
    }
    return b;
  })(window.location.search.substr(1).split('&'));

  var dataUrl = qs['data']; // url to the script generating test data
  if (dataUrl !== void 0) {
    initFromDataScript(dataUrl, impl);
  } else {
    initFromParentWindow(window.opener, name, version, impl);
  }
}

// performance.now() polyfill
// https://gist.github.com/paulirish/5438650
// prepare base perf object
if (typeof window.performance === 'undefined') {
  window.performance = {};
}
if (!window.performance.now){
  var nowOffset = Date.now();
  if (performance.timing && performance.timing.navigationStart) {
    nowOffset = performance.timing.navigationStart;
  }
  window.performance.now = function now(){
    return Date.now() - nowOffset;
  };
}

module.exports = init;

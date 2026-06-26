/**
 * Standalone Wave Packet Tab Controller — thin wrapper around wpCanvasEmbed.
 */
'use strict';

var _wpStandalone = null;

function wpPlay() {
  if (_wpStandalone) _wpStandalone.play();
  var btnPlay = document.getElementById('wp-btn-play');
  var btnPause = document.getElementById('wp-btn-pause');
  if (btnPlay) btnPlay.classList.add('active');
  if (btnPause) btnPause.classList.remove('active');
}

function wpPause() {
  if (_wpStandalone) _wpStandalone.pause();
  var btnPlay = document.getElementById('wp-btn-play');
  var btnPause = document.getElementById('wp-btn-pause');
  if (btnPlay) btnPlay.classList.remove('active');
  if (btnPause) btnPause.classList.add('active');
}

function wpReset() {
  if (_wpStandalone) _wpStandalone.reset();
  else { wpPause(); }
}

function wpBuildPotential() {
  if (_wpStandalone) _wpStandalone.rebuild();
}

function wpDraw() {
  if (_wpStandalone) _wpStandalone.draw();
}

function initWavePacketUI() {
  _wpStandalone = wpCanvasEmbed({
    canvas: 'wp-canvas',
    V0: 5.0, width: 2.0, count: 1, spacing: 4.0,
    k0: 3.0, sigma: 1.2, dt: 0.001,
    barrierShape: 'semicircle',
    running: false
  });

  function _bind(id, key, postFn) {
    var slider = document.getElementById('wp-slider-' + id);
    var display = document.getElementById('wp-val-' + id);
    if (!slider) return;
    slider.addEventListener('input', function() {
      var v = parseFloat(this.value);
      if (display) display.textContent = (key === 'count') ? String(v) : v.toFixed(key === 'dt' ? 4 : 2);
      if (_wpStandalone) {
        if (key === 'v0') _wpStandalone.setV0(v);
        else if (key === 'width') _wpStandalone.setWidth(v);
        else if (key === 'count') _wpStandalone.setCount(v);
        else if (key === 'spacing') _wpStandalone.setSpacing(v);
        else if (key === 'k0') _wpStandalone.setK0(v);
        else if (key === 'sigma') _wpStandalone.setSigma(v);
        else if (key === 'dt') _wpStandalone.setDt(v);
      }
      if (postFn) postFn(v);
      if (!_wpStandalone || !_wpStandalone.running) wpDraw();
    });
  }

  _bind('v0', 'v0');
  _bind('width', 'width');
  _bind('count', 'count');
  _bind('spacing', 'spacing');
  _bind('k0', 'k0', function(v) {
    var e = v * v * 0.5;
    var el = document.getElementById('wp-energy');
    if (el) el.textContent = e.toFixed(2);
  });
  _bind('sigma', 'sigma');
  _bind('dt', 'dt');

  // shape toggles
  var shapeBtns = document.querySelectorAll('.wp-shape-btn');
  shapeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (_wpStandalone) _wpStandalone.setShape(this.dataset.shape);
      shapeBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      if (!_wpStandalone || !_wpStandalone.running) wpDraw();
    });
  });

  // playback
  var btnPlay = document.getElementById('wp-btn-play');
  var btnPause = document.getElementById('wp-btn-pause');
  var btnReset = document.getElementById('wp-btn-reset');
  if (btnPlay) btnPlay.addEventListener('click', wpPlay);
  if (btnPause) btnPause.addEventListener('click', wpPause);
  if (btnReset) btnReset.addEventListener('click', wpReset);
}

/* ============ MODE SWITCH HOOK ============ */
(function() {
  function _onWavePacketVisible() {
    var canvas = document.getElementById('wp-canvas');
    if (canvas) {
      var parent = canvas.parentElement;
      var w = parent ? (parent.clientWidth || 900) : 900;
      if (Math.abs(canvas.width - w) > 10 || canvas.width === 0) {
        canvas.width = Math.max(Math.floor(w), 400);
      }
      if (Math.abs(canvas.height - 400) > 10 || canvas.height === 0) {
        canvas.height = 400;
      }
    }
    wpDraw();
  }

  var orig = window.setGameMode;
  window.setGameMode = function(mode) {
    if (mode === 'play' && typeof window.__fastPlaygroundSwitch === 'function') {
      window.__fastPlaygroundSwitch(mode);
    } else if (typeof orig === 'function') {
      orig(mode);
    }
    if (mode === 'wavepacket') { _onWavePacketVisible(); wpPlay(); }
    else { wpPause(); }
  };

  var _wpVisObs = null;
  function _observeVis() {
    var s = document.getElementById('section-wavepacket');
    if (!s) return;
    _wpVisObs = new MutationObserver(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].attributeName === 'style') {
          if (s.style.display !== 'none') { _onWavePacketVisible(); wpPlay(); }
          else { wpPause(); }
        }
      }
    });
    _wpVisObs.observe(s, { attributes: true });
  }
  if (window.MutationObserver) { setTimeout(_observeVis, 500); }
})();

function initWavePacket() { initWavePacketUI(); }
window.initWavePacket = initWavePacket;

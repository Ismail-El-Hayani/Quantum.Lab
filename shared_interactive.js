/**
 * shared_interactive.js — Interactive utilities for Physics Playground
 * Drag handlers, real-time parameter linking, experiment builder, live console
 */

'use strict';

// ===== SLIDER ORCHESTRATION =====
// Links multiple sliders to a shared state and callback
function SliderGroup(cfg) {
  this.sliders = {};
  this.state = {};
  this.callback = cfg.onChange || function(){};
  var self = this;

  cfg.sliders.forEach(function(s) {
    var el = document.getElementById(s.id);
    var valEl = document.getElementById(s.valId);
    if (!el) return;

    self.sliders[s.key] = el;
    self.state[s.key] = s.default !== undefined ? s.default : parseFloat(el.value);

    el.addEventListener('input', function(e) {
      var v = parseFloat(e.target.value);
      if (s.step && s.step < 1) v = Math.round(v / s.step) * s.step;
      v = Math.round(v * 1e6) / 1e6;
      self.state[s.key] = v;

      if (valEl) valEl.textContent = s.format ? s.format(v) : v;
      if (s.liveUpdate !== false) self.update(s.key, v);
    });
  });
}
SliderGroup.prototype.update = function(key, value) {
  this.callback(this.state, key, value);
};
SliderGroup.prototype.get = function(key) {
  return this.state[key];
};
SliderGroup.prototype.set = function(key, value) {
  this.state[key] = value;
  var el = this.sliders[key];
  if (el) {
    el.value = value;
    var valEl = document.getElementById(el.id.replace('slider-', 'val-'));
    if (valEl) valEl.textContent = value;
  }
};

// ===== DRAG-AND-DROP PARTICLE =====
// Make an element draggable within a container, with physics callbacks
function makeDraggable(el, opts) {
  opts = opts || {};
  var container = opts.container || el.parentElement;
  var dragging = false;
  var startX, startY, offsetX, offsetY;

  el.style.cursor = opts.cursor || 'grab';
  el.addEventListener('mousedown', function(e) {
    dragging = true;
    el.style.cursor = 'grabbing';
    var rect = el.getBoundingClientRect();
    var containerRect = container.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    startX = rect.left - containerRect.left;
    startY = rect.top - containerRect.top;
    if (opts.onGrab) opts.onGrab(startX, startY, e);
  });

  document.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var containerRect = container.getBoundingClientRect();
    var x = e.clientX - containerRect.left - offsetX;
    var y = e.clientY - containerRect.top - offsetY;

    // Constrain to container
    if (opts.constrain !== false) {
      x = Math.max(0, Math.min(x, containerRect.width - el.offsetWidth));
      y = Math.max(0, Math.min(y, containerRect.height - el.offsetHeight));
    }

    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.position = 'absolute';

    if (opts.onDrag) opts.onDrag(x, y, e);
  });

  document.addEventListener('mouseup', function(e) {
    if (!dragging) return;
    dragging = false;
    el.style.cursor = opts.cursor || 'grab';
    var containerRect = container.getBoundingClientRect();
    var rect = el.getBoundingClientRect();
    var x = rect.left - containerRect.left;
    var y = rect.top - containerRect.top;
    if (opts.onRelease) opts.onRelease(x, y, e);
  });

  return {
    setPosition: function(x, y) {
      el.style.position = 'absolute';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    },
    getPosition: function() {
      var containerRect = container.getBoundingClientRect();
      var rect = el.getBoundingClientRect();
      return { x: rect.left - containerRect.left, y: rect.top - containerRect.top };
    }
  };
}

// ===== LIVE CONSOLE / MINI-TERMINAL =====
function LiveConsole(id) {
  this.el = document.getElementById(id);
  if (!this.el) return;
  this.lines = [];
}
LiveConsole.prototype.log = function(msg, type) {
  type = type || 'info';
  var color = type === 'error' ? '#ff4ecd' : type === 'success' ? '#4ade80' : type === 'warn' ? '#ffd740' : '#00f0ff';
  this.lines.push({ msg: msg, type: type, time: new Date().toLocaleTimeString() });
  if (this.lines.length > 50) this.lines.shift();

  this.el.innerHTML = '';
  var self = this;
  this.lines.forEach(function(l) {
    var row = document.createElement('div');
    var c = (l.type === 'error') ? '#ef4444' : (l.type === 'warn') ? '#f59e0b' : '#4ade80';
    row.style.cssText = 'font-family:JetBrains Mono,monospace;font-size:12px;margin:2px 0;';
    row.innerHTML = '<span style="color:var(--text-dim);font-size:10px;">[' + l.time + ']</span> ' +
      '<span style="color:' + c + '">' + l.msg + '</span>';
    self.el.appendChild(row);
  });
  self.el.scrollTop = self.el.scrollHeight;
};

/* ── Shared interactivity helpers ── */
// Record user parameter sets for replay (for "design challenge" mode)
function ExperimentRecorder() {
  this.steps = [];
  this.recording = false;
}
ExperimentRecorder.prototype.start = function(label) {
  this.steps = [];
  this.recording = true;
  this.label = label;
};
ExperimentRecorder.prototype.record = function(state, note) {
  if (!this.recording) return;
  this.steps.push({ state: JSON.parse(JSON.stringify(state)), note: note || '', t: Date.now() });
};
ExperimentRecorder.prototype.stop = function() {
  this.recording = false;
  return {
    label: this.label,
    steps: this.steps,
    duration: this.steps.length > 1 ? this.steps[this.steps.length-1].t - this.steps[0].t : 0,
    stepCount: this.steps.length
  };
};
ExperimentRecorder.prototype.replay = function(callback, speed) {
  speed = speed || 1;
  var self = this;
  if (!callback || this.steps.length === 0) return;

  this.steps.forEach(function(step, i) {
    setTimeout(function() {
      callback(step.state, step.note, i);
    }, (i * 500) / speed);
  });
};
ExperimentRecorder.prototype.toQueryString = function() {
  return encodeURIComponent(JSON.stringify(this.steps));
};

// ===== MATCHING GAME ENGINE =====
// Generic engine for "match the pattern" games
function MatchingGame(opts) {
  this.opts = opts;
  this.attempts = 0;
  this.score = 0;
  this.timer = null;
  this.timeLeft = opts.timeLimit || 60;
}
MatchingGame.prototype.start = function() {
  this.attempts = 0;
  this.score = 0;
  this.timeLeft = this.opts.timeLimit || 60;
  this.render(this.opts.generateLevel(1));
  this.startTimer();
};
MatchingGame.prototype.startTimer = function() {
  var self = this;
  this.timer = setInterval(function() {
    self.timeLeft--;
    if (self.opts.onTimer) self.opts.onTimer(self.timeLeft);
    if (self.timeLeft <= 0) self.gameOver();
  }, 1000);
};
MatchingGame.prototype.checkAnswer = function(answer) {
  this.attempts++;
  var correct = this.opts.validate(answer);
  if (correct) {
    this.score += Math.max(100 - this.attempts * 5 + this.timeLeft, 10);
    if (this.opts.onCorrect) this.opts.onCorrect(this.score, this.attempts);
    this.nextLevel();
  } else {
    if (this.opts.onWrong) this.opts.onWrong(answer, this.attempts);
  }
};
MatchingGame.prototype.nextLevel = function() {
  if (this.opts.onNextLevel) this.opts.onNextLevel();
};
MatchingGame.prototype.gameOver = function() {
  clearInterval(this.timer);
  if (this.opts.onGameOver) this.opts.onGameOver(this.score, this.attempts);
};
MatchingGame.prototype.stop = function() {
  clearInterval(this.timer);
};

// ===== PHYSICS ANIMATION PLAYER =====
// Plays a pre-computed physics animation frame by frame
function PhysicsAnimation(opts) {
  this.opts = opts;
  this.running = false;
  this.frame = 0;
  this.frames = opts.frames || [];
}
PhysicsAnimation.prototype.play = function() {
  this.running = true;
  this.frame = 0;
  var self = this;
  function step() {
    if (!self.running || self.frame >= self.frames.length) { self.stop(); return; }
    if (self.opts.onFrame) self.opts.onFrame(self.frames[self.frame], self.frame);
    self.frame++;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};
PhysicsAnimation.prototype.stop = function() {
  this.running = false;
  if (this.opts.onStop) this.opts.onStop();
};
PhysicsAnimation.prototype.seek = function(frameIndex) {
  this.frame = frameIndex;
  if (this.opts.onFrame && frameIndex < this.frames.length) {
    this.opts.onFrame(this.frames[frameIndex], frameIndex);
  }
};

// ===== PARAMETER LOCKING (challenge mode) =====
// Locks certain parameters so user must work with constraints
function ParameterLocker(sliderGroup, lockedParams, challengeCb) {
  this.group = sliderGroup;
  this.locked = lockedParams || {};
  this.challengeCb = challengeCb;
  var self = this;

  Object.keys(this.locked).forEach(function(key) {
    var el = sliderGroup.sliders[key];
    if (el) {
      el.disabled = true;
      el.style.opacity = '0.4';
      el.style.cursor = 'not-allowed';
    }
  });

  // Override update to inject challenge validation
  var origCallback = sliderGroup.callback;
  sliderGroup.callback = function(state, changedKey, value) {
    origCallback(state, changedKey, value);
    if (self.challengeCb) self.challengeCb(state);
  };
}

// ===== LEVEL PROGRESSION =====
var LevelProgression = {
  levels: {},
  setCurrent: function(module, level) { this.levels[module] = level; },
  getCurrent: function(module) { return this.levels[module] || 1; },
  advance: function(module) { this.levels[module] = (this.levels[module] || 1) + 1; },
  reset: function(module) { this.levels[module] = 1; }
};

// ===== SHARED MATH UTILITIES =====
function linspace(a, b, n) {
  var arr = new Array(n);
  for (var i = 0; i < n; i++) arr[i] = a + i * (b - a) / (n - 1);
  return arr;
}

// ===== PLOTLY HELPER =====
function _plot(id, traces, lay, cfg) {
  var el = document.getElementById(id);
  if (!el || typeof Plotly === 'undefined') return;
  // Skip hidden containers to prevent zero-dimension renders
  if (el.offsetParent === null) return;
  Plotly.react(id, traces, lay, cfg || {responsive: true, displayModeBar: false});
}
var _plotApp = _plot;

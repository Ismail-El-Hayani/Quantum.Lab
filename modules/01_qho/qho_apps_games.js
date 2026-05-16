/**
 * qho_apps_games.js — QHO Lab: gamified simulations, challenges, puzzles
 * Module 01 — Quantum Harmonic Oscillator
 */

'use strict';

function _qhoPlotCheck() {
  if (typeof Plotly === 'undefined') {
    console.error('[QHO Games] Plotly not available — plot skipped');
    return false;
  }
  return true;
}

// ===== MATH UTILITIES (self-contained) =====
function qhoFactorial(n) {
  if (n <= 1) return 1;
  var res = 1;
  for (var i = 2; i <= n; i++) res *= i;
  return res;
}

function hermite(n, x) {
  if (n === 0) return 1;
  if (n === 1) return 2 * x;
  var H0 = 1, H1 = 2 * x;
  for (var i = 2; i <= n; i++) {
    var H2 = 2 * x * H1 - 2 * (i - 1) * H0;
    H0 = H1; H1 = H2;
  }
  return H1;
}

function qhoPsi(n, x) {
  var norm = 1 / Math.sqrt(Math.pow(2, n) * qhoFactorial(n) * Math.sqrt(Math.PI));
  return norm * hermite(n, x) * Math.exp(-x * x / 2);
}

function qhoProb(n, x) { return qhoPsi(n, x) * qhoPsi(n, x); }

// ===== PLOTLY SHORTCUT (dark theme) =====
var _darkLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', size: 11 },
  margin: { l: 50, r: 20, t: 40, b: 40 },
  xaxis: { gridcolor: '#2a2a3a', zerolinecolor: '#3a3a5a' },
  yaxis: { gridcolor: '#2a2a3a', zerolinecolor: '#3a3a5a' }
};
function _extend(base, over) {
  var out = JSON.parse(JSON.stringify(base));
  for (var k in over) {
    if (typeof over[k] === 'object' && over[k] !== null && !Array.isArray(over[k]) && k in out && typeof out[k] === 'object') {
      for (var j in over[k]) out[k][j] = over[k][j];
    } else { out[k] = over[k]; }
  }
  return out;
}

// ===== GAME STATE =====
var __QHO = {
  animating: false,
  animFrame: null,
  animT: 0,
  n: 0,
  alpha: 0,
  showClassical: false,
  sliders: null,
  // Challenge state
  challenge: {
    active: false,
    targetN: 0,
    currentN: 0,
    score: 0,
    combo: 0,
    timer: null,
    timeLeft: 60,
    streak: 0
  },
  // Laser challenge
  laser: {
    from: 0,
    to: 1
  },
  // Selection rules puzzle
  selectedTransitions: {}
};

// ===== PLAYGROUND =====
function plotPlayground(n, alpha, showClassical) {
  var x = linspace(-5, 5, 300);
  var psi = x.map(function(xi) { return qhoPsi(n, xi); });
  var prob = x.map(function(xi) { return qhoProb(n, xi); });
  var V = x.map(function(xi) { return 0.5 * xi * xi; });

  var traces = [
    { x: x, y: psi, mode: 'lines', name: 'Ψ(x)', line: { color: '#00f0ff', width: 2 } },
    { x: x, y: prob, mode: 'lines', name: '|Ψ|²', line: { color: '#c084fc', width: 2, dash: 'dash' } },
    { x: x, y: V, mode: 'lines', name: 'V(x)', line: { color: '#facc15', width: 2, dash: 'dot' } }
  ];

  // Classical turning point
  if (showClassical) {
    var E_n = (n + 0.5);
    var xTP = Math.sqrt(2 * E_n);
    traces.push(
      { x: [xTP, xTP], y: [-2, 2], mode: 'lines', line: { color: '#4ade80', width: 2, dash: 'solid' }, name: 'Turning point' },
      { x: [-xTP, -xTP], y: [-2, 2], mode: 'lines', line: { color: '#4ade80', width: 2, dash: 'solid' }, name: '-Turning point' }
    );
  }

  if (_qhoPlotCheck()) Plotly.react('plot-playground', traces, _extend(_darkLayout, {
    title: { text: 'QHO Wavefunction n=' + n, font: { size: 13 } },
    xaxis: { title: 'x (natural units)' },
    yaxis: { title: 'Amplitude' },
    legend: { x: 1.02, y: 1, bgcolor: 'rgba(10,10,15,0.8)' }
  }), { responsive: true, displayModeBar: false });

  // Animate superposition
  if (alpha > 0 && !__QHO.animating) {
    animateSuperposition(n, alpha);
  }
}

function animateSuperposition(n, alpha) {
  __QHO.animating = true;
  __QHO.animT = 0;
  var x = linspace(-5, 5, 200);

  function frame() {
    if (!__QHO.animating) return;
    __QHO.animT += 0.03;
    var t = __QHO.animT;

    var psi1 = alpha === 0 ? qhoPsi(n, x[0]) : qhoPsi(n, x[0]);
    var psi2 = alpha === 0 ? 0 : qhoPsi(n + 1, x[0]);
    var combined = x.map(function(xi, i) {
      var p1 = qhoPsi(n, xi);
      var p2 = qhoPsi(n + 1, xi);
      return (1 - alpha) * p1 + alpha * p2 * Math.cos(t);
    });
    var prob = combined.map(function(p) { return p * p; });

    if (_qhoPlotCheck()) Plotly.animate('plot-playground', {
      data: [{ y: combined }, { y: prob }]
    }, { transition: { duration: 0 }, frame: { duration: 0 } });
    __QHO.animFrame = requestAnimationFrame(frame);
  }
  frame();
}

function stopQHOGameAnim() {
  __QHO.animating = false;
  if (__QHO.animFrame) cancelAnimationFrame(__QHO.animFrame);
}

function toggleAnimation() {
  var btn = document.getElementById('btn-animate-play');
  if (__QHO.animating) {
    stopQHOGameAnim();
    btn.textContent = '⏵ Animate time evolution';
    btn.classList.remove('active');
  } else {
    animateSuperposition(__QHO.n, __QHO.alpha);
    btn.textContent = '⏸ Stop animation';
    btn.classList.add('active');
    __GameState.addXP(5, 'Animation started');
  }
}

function toggleClassical() {
  __QHO.showClassical = !__QHO.showClassical;
  var btn = document.getElementById('btn-classical');
  var val = document.getElementById('val-classical');
  if (__QHO.showClassical) {
    btn.classList.add('active');
    val.textContent = 'ON';
  } else {
    btn.classList.remove('active');
    val.textContent = 'OFF';
  }
  plotPlayground(__QHO.n, __QHO.alpha, __QHO.showClassical);
}

function updateLiveReadout(n, alpha) {
  document.getElementById('live-E').textContent = (n + 0.5).toFixed(1) + 'ℏω';
  document.getElementById('live-nodes').textContent = n;
  document.getElementById('live-x2').textContent = (n + 0.5).toFixed(1) + 'a₀²';
}

// ===== CHALLENGE 1: MATCH WAVEFUNCTION =====
function startWaveMatch() {
  var c = __QHO.challenge;
  c.active = true;
  c.targetN = Math.floor(Math.random() * 9);
  c.currentN = 0;
  c.score = 0;
  c.combo = 0;
  c.timeLeft = 60;
  c.streak = 0;

  plotTargetWave(c.targetN);
  plotUserWave(0);
  startTimer();

  document.getElementById('challenge-score').textContent = '0';
  document.getElementById('challenge-combo').textContent = '0';
}

function plotTargetWave(n) {
  var x = linspace(-5, 5, 200);
  var target = x.map(function(xi) { return qhoPsi(n, xi); });
  if (_qhoPlotCheck()) Plotly.react('challenge-target-plot', [
    { x: x, y: target, mode: 'lines', line: { color: '#8080a0', width: 2, dash: 'dash' } }
  ], _extend(_darkLayout, {
    xaxis: { showticklabels: false }, yaxis: { showticklabels: false, range: [-0.8, 0.8] },
    margin: { l: 20, r: 20, t: 10, b: 10 }, showlegend: false
  }), { responsive: true, displayModeBar: false });
}

function plotUserWave(n) {
  var x = linspace(-5, 5, 200);
  var user = x.map(function(xi) { return qhoPsi(n, xi); });
  if (_qhoPlotCheck()) Plotly.react('challenge-user-plot', [
    { x: x, y: user, mode: 'lines', line: { color: '#00f0ff', width: 2 } }
  ], _extend(_darkLayout, {
    xaxis: { showticklabels: false }, yaxis: { showticklabels: false, range: [-0.8, 0.8] },
    margin: { l: 20, r: 20, t: 10, b: 10 }, showlegend: false
  }), { responsive: true, displayModeBar: false });
}

function checkWaveMatch() {
  var c = __QHO.challenge;
  if (!c.active) return;

  var guess = parseInt(document.getElementById('slider-challenge-n').value);
  var feedback = document.getElementById('challenge-1-feedback');
  var wrap = document.getElementById('challenge-user-plot-wrap');

  if (guess === c.targetN) {
    // Correct!
    c.streak++;
    var points = 50;
    if (c.streak >= 2) points += c.streak * 5;
    c.score += points;
    c.combo++;

    __GameState.addXP(points, 'Wave matched!');
    celebrateCorrect();

    feedback.className = 'challenge-feedback success';
    feedback.textContent = '✓ Correct! That was n = ' + c.targetN + '. +' + points + ' XP!';
    feedback.style.display = 'block';
    wrap.classList.add('correct');

    // Next level
    setTimeout(function() {
      wrap.classList.remove('correct');
      c.targetN = Math.floor(Math.random() * 9);
      plotTargetWave(c.targetN);
      plotUserWave(guess);
      feedback.style.display = 'none';
    }, 1500);

    // Check achievement
    if (c.score >= 200) {
      __GameState.unlock({ id: 'wave_master', title: 'Wave Master', desc: 'Scored 200+ points in wave matching', icon: '〰', xp: 25 });
    }
  } else {
    // Wrong
    c.streak = 0;
    c.combo = 0;
    feedback.className = 'challenge-feedback error';
    feedback.textContent = '✗ Not quite. Try counting the nodes: n = ' + guess + ' has ' + guess + ' nodes. The target has ' + c.targetN + ' nodes.';
    feedback.style.display = 'block';
  }

  document.getElementById('challenge-score').textContent = c.score;
  document.getElementById('challenge-combo').textContent = c.combo;
}

function skipTarget() {
  __QHO.challenge.targetN = Math.floor(Math.random() * 9);
  plotTargetWave(__QHO.challenge.targetN);
  __GameState.addXP(-10, 'Skipped target');
}

function startTimer() {
  clearInterval(__QHO.challenge.timer);
  __QHO.challenge.timer = setInterval(function() {
    if (!__QHO.challenge.active) return;
    __QHO.challenge.timeLeft--;
    var pct = (__QHO.challenge.timeLeft / 60) * 100;
    var bar = document.getElementById('timer-1');
    bar.style.width = pct + '%';
    if (pct < 20) bar.classList.add('urgent');

    if (__QHO.challenge.timeLeft <= 0) {
      clearInterval(__QHO.challenge.timer);
      __QHO.challenge.active = false;
      var fb = document.getElementById('challenge-1-feedback');
      fb.className = 'challenge-feedback';
      fb.style.display = 'block';
      fb.textContent = '⏰ Time\'s up! Final score: ' + __QHO.challenge.score;
    }
  }, 1000);
}

// ===== CHALLENGE 2: LASER FREQUENCY MATCHER =====
function plotLaserLevels() {
  var n = 8;
  var levels = [];
  for (var i = 0; i <= n; i++) {
    levels.push({ x: [0.2, 0.8], y: [i + 0.5, i + 0.5], mode: 'lines', line: { color: '#2a2a3a', width: 2 } });
    levels.push({
      x: [0.1, 0.9], y: [i + 0.5, i + 0.5], mode: 'text', text: 'n=' + i,
      textposition: 'right', textfont: { color: '#505070', size: 10 }, showlegend: false
    });
  }
  if (_qhoPlotCheck()) Plotly.react('plot-laser-levels', levels, _extend(_darkLayout, {
    title: { text: 'Energy Levels', font: { size: 12 } },
    xaxis: { range: [0, 1], showticklabels: false },
    yaxis: { title: 'E / ℏω', gridcolor: '#2a2a3a' },
    margin: { l: 40, r: 10, t: 30, b: 20 }, showlegend: false
  }), { responsive: true, displayModeBar: false });
}

function fireLaser() {
  var freq = parseFloat(document.getElementById('slider-laser-freq').value);
  var target = parseInt(document.getElementById('laser-to').textContent) - parseInt(document.getElementById('laser-from').textContent);
  var atom = document.getElementById('atom-target');
  var fb = document.getElementById('laser-feedback');

  // ΔE = (n_to - n_from) * ℏω
  if (Math.abs(freq - target) < 0.25) {
    // Resonance! Atom absorbs
    atom.classList.add('excited');
    atom.innerHTML = '✨';
    fb.className = 'challenge-feedback success';
    fb.style.display = 'block';
    fb.textContent = '✓ Resonance! ΔE = ' + target + 'ℏω absorbed. Atom excited!';
    __GameState.addXP(75, 'Laser resonance found!');

    // Reset after a bit
    setTimeout(function() {
      atom.classList.remove('excited');
      atom.innerHTML = '⚪';
      // New challenge
      __QHO.laser.from = Math.floor(Math.random() * 5);
      __QHO.laser.to = __QHO.laser.from + 1 + Math.floor(Math.random() * 3);
      document.getElementById('laser-from').textContent = __QHO.laser.from;
      document.getElementById('laser-to').textContent = __QHO.laser.to;
    }, 2000);
  } else {
    fb.className = 'challenge-feedback error';
    fb.style.display = 'block';
    var hint = freq > target ? 'Too high! Photon energy > level gap.' : 'Too low! Photon energy < level gap.';
    fb.textContent = '✗ No absorption. ' + hint;
  }
}

function showLaserHint() {
  var from = parseInt(document.getElementById('laser-from').textContent);
  var to = parseInt(document.getElementById('laser-to').textContent);
  var delta = to - from;
  var fb = document.getElementById('laser-feedback');
  fb.className = 'challenge-feedback hint';
  fb.style.display = 'block';
  fb.textContent = '💡 Energy levels are equally spaced: ΔE = (n_to − n_from)ℏω = ' + delta + 'ℏω';
  __GameState.addXP(-5, 'Hint used');
}

// ===== CHALLENGE 3: ZERO-POINT ENERGY =====
function checkZeroPointAnswer(ans) {
  var fb = document.getElementById('zero-point-feedback');
  var anim = document.getElementById('zero-point-anim');

  if (ans === 'infinite') {
    fb.className = 'challenge-feedback success';
    fb.style.display = 'block';
    fb.innerHTML = '✓ Brilliant! Δx → 0 forces Δp → ∞, so E = (Δp)²/2m → ∞. You CANNOT pin down both position and momentum. This is the uncertainty principle in action. Zero-point energy E₀ = ½ℏω is the absolute minimum allowed by nature.';
    __GameState.addXP(100, 'Uncertainty principle understood!');
    __GameState.unlock({ id: 'uncertainty_crusher', title: 'Uncertainty Crusher', desc: 'Correctly resolved the zero-point energy paradox', icon: '❄', xp: 25 });
    particleBurst(window.innerWidth/2, 400, '#00f0ff');

    // Animate the particle bouncing
    anim.innerHTML = '<div id="zpe-bounce" style="width:20px;height:20px;border-radius:50%;background:var(--accent-cyan);position:relative;box-shadow:0 0 20px rgba(0,212,255,0.5);"></div>';
    var el = document.getElementById('zpe-bounce');
    var pos = 0, vel = 3;
    function bounce() {
      pos += vel; vel += 0.2;
      if (pos > 80) { pos = 80; vel = -vel * 0.7; }
      if (pos < 0) { pos = 0; vel = -vel * 0.7; }
      el.style.top = pos + 'px';
      requestAnimationFrame(bounce);
    }
    bounce();
  } else if (ans === 'violated') {
    fb.className = 'challenge-feedback error';
    fb.style.display = 'block';
    fb.textContent = '✗ Close, but no — the uncertainty principle is NEVER violated. It is a fundamental law of nature. Try again!';
  } else {
    fb.className = 'challenge-feedback error';
    fb.style.display = 'block';
    fb.textContent = '✗ Not quite. Think about the uncertainty relation: Δx·Δp ≥ ℏ/2. What happens if Δx → 0?';
  }
}

// ===== PUZZLE 1: ENERGY LADDER =====
function initEnergyLadder() {
  var board = document.getElementById('energy-ladder');
  var pool = document.getElementById('particle-pool');
  board.innerHTML = '';
  pool.innerHTML = '';

  // Create 6 slots
  for (var n = 0; n < 6; n++) {
    var slot = document.createElement('div');
    slot.className = 'energy-slot';
    slot.dataset.level = n;
    slot.ondragover = function(e) { e.preventDefault(); this.classList.add('dragover'); };
    slot.ondragleave = function() { this.classList.remove('dragover'); };
    slot.ondrop = function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
      var nVal = e.dataTransfer.getData('n');
      this.textContent = 'n=' + nVal;
      this.classList.add('occupied');
      this.dataset.placed = nVal;
    };
    slot.textContent = 'E_' + n;
    board.appendChild(slot);
  }

  // Create draggable particles
  var placements = [];
  for (var i = 0; i < 6; i++) placements.push({ n: i, shuffled: Math.floor(Math.random() * 6) });
  placements.sort(function(a, b) { return a.shuffled - b.shuffled; });

  placements.forEach(function(p) {
    var part = document.createElement('div');
    part.className = 'energy-particle';
    part.textContent = 'n=' + p.n;
    part.draggable = true;
    part.dataset.n = p.n;
    part.ondragstart = function(e) { e.dataTransfer.setData('n', this.dataset.n); };
    pool.appendChild(part);
  });
}

function checkLadder() {
  var slots = document.querySelectorAll('.energy-slot');
  var correct = 0;
  slots.forEach(function(s) {
    var slotN = parseInt(s.dataset.level);
    var placedN = parseInt(s.dataset.placed);
    if (slotN === placedN) {
      s.style.borderColor = 'var(--accent-green)';
      s.style.background = 'rgba(105,240,174,0.12)';
      correct++;
    } else {
      s.style.borderColor = 'var(--accent-red)';
      s.style.background = 'rgba(255,68,68,0.08)';
    }
  });

  var fb = document.getElementById('ladder-feedback');
  if (correct === 6) {
    fb.className = 'challenge-feedback success';
    fb.textContent = '✓ Perfect! All particles in their correct energy levels. The spacing is equal: E_n = ℏω(n + ½). The zero-point energy is unavoidable!';
    __GameState.addXP(60, 'Energy ladder solved!');
  } else {
    fb.className = 'challenge-feedback error';
    fb.textContent = '✗ ' + (6 - correct) + ' out of 6 wrong. Remember: the label on the particle (n) must match the level index. E_n = ℏω(n + ½). Try again!';
  }
  fb.style.display = 'block';
}

function resetLadder() {
  initEnergyLadder();
  document.getElementById('ladder-feedback').style.display = 'none';
}

// ===== PUZZLE 2: HAMILTONIAN BUILDER =====
function initHamiltonian() {
  var terms = document.querySelectorAll('.draggable-target');
  var drops = document.querySelectorAll('.drop-zone');

  terms.forEach(function(t) {
    t.ondragstart = function(e) {
      e.dataTransfer.setData('term', this.id);
      t.classList.add('selected');
    };
    t.ondragend = function() { t.classList.remove('selected'); };
    t.onclick = function() {
      // Also support click-to-place for mobile
      document.querySelectorAll('.drop-zone').forEach(function(d) { d.classList.remove('dragover'); });
      document.querySelectorAll('.draggable-target').forEach(function(x) { x.classList.remove('selected'); });
      t.classList.add('selected');
    };
  });

  drops.forEach(function(d) {
    d.ondragover = function(e) { e.preventDefault(); this.classList.add('dragover'); };
    d.ondragleave = function() { this.classList.remove('dragover'); };
    d.ondrop = function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
      var termId = e.dataTransfer.getData('term');
      var term = document.getElementById(termId);
      if (!term) return;
      var termType = termId.replace('term-', '');
      var dropType = this.dataset.term;
      this.dataset.filled = termType;
      this.innerHTML = '<div style="font-family:var(--mono);font-size:0.9rem;color:var(--accent-cyan);">' + term.querySelector('div').textContent + '</div>';
      this.classList.add('correct');
    };
  });
}

function checkHamiltonian() {
  var kinetic = document.getElementById('drop-kinetic');
  var potential = document.getElementById('drop-potential');
  var fb = document.getElementById('hamilton-feedback');

  var kVal = kinetic.dataset.filled;
  var pVal = potential.dataset.filled;

  var gotKinetic = (kVal === 'kinetic' || kVal === 'momentum');
  var gotPotential = (pVal === 'potential');

  if (gotKinetic && gotPotential) {
    fb.className = 'challenge-feedback success';
    fb.textContent = '✓ Perfect! H = −ℏ²/2m · d²/dx² + ½mω²x². These two terms fight each other: kinetic wants spread (delocalization), potential wants confinement (localization), giving standing waves.';
    __GameState.addXP(80, 'Hamiltonian constructed!');
    __GameState.unlock({ id: 'hamilton_architect', title: 'Hamiltonian Architect', desc: 'Built the QHO Hamiltonian correctly', icon: '⚙', xp: 25 });
    particleBurst(window.innerWidth/2, 300, '#c084fc');
  } else if (!gotKinetic) {
    fb.className = 'challenge-feedback error';
    fb.textContent = '✗ Kinetic energy term missing. Remember: H always contains kinetic energy — −ℏ²/2m · d²/dx² or equivalently p²/2m.';
  } else {
    fb.className = 'challenge-feedback error';
    fb.textContent = '✗ Potential energy term missing. For the QHO, the potential is V(x) = ½mω²x² — the parabolic well.';
  }
  fb.style.display = 'block';
}

// ===== PUZZLE 3: SELECTION RULES =====
var transitionsList = [
  { from: 0, to: 1, allowed: true },
  { from: 0, to: 2, allowed: false },
  { from: 1, to: 2, allowed: true },
  { from: 1, to: 3, allowed: true },
  { from: 2, to: 2, allowed: false },
  { from: 2, to: 4, allowed: false },
  { from: 3, to: 4, allowed: true },
  { from: 0, to: 3, allowed: false }
];

function initSelectionRules() {
  var container = document.getElementById('transitions');
  __QHO.selectedTransitions = {};
  container.innerHTML = '';

  // Plot energy levels
  var x = []; var y = []; var text = [];
  for (var i = 0; i <= 5; i++) {
    x.push(0.5); y.push(i + 0.5); text.push('n=' + i);
  }
  var traces = [
    { x: x, y: y, mode: 'markers+text', text: text, textposition: 'right',
      marker: { color: '#3a3a5a', size: 12 }, textfont: { color: '#8080a0', size: 10 }, hoverinfo: 'text' }
  ];
  // Add horizontal lines
  for (i = 0; i <= 5; i++) {
    traces.push({ x: [0.2, 0.8], y: [i + 0.5, i + 0.5], mode: 'lines',
      line: { color: '#2a2a3a', width: 1 } });
  }

  // Arrows for transitions
  transitionsList.forEach(function(t) {
    traces.push({
      x: [0.55, 0.55], y: [t.from + 0.5, t.to + 0.5], mode: 'lines',
      line: { color: '#505070', width: 2, dash: 'dash' }
    });
  });

  if (_qhoPlotCheck()) Plotly.react('plot-selection', traces, _extend(_darkLayout, {
    title: { text: 'QHO Energy Levels', font: { size: 12 } },
    xaxis: { range: [0, 1], showticklabels: false },
    yaxis: { title: 'E / ℏω', range: [0, 6], gridcolor: '#2a2a3a' },
    margin: { l: 40, r: 40, t: 30, b: 20 }, showlegend: false
  }), { responsive: true, displayModeBar: false });

  // Buttons
  transitionsList.forEach(function(t, i) {
    var btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'n=' + t.from + ' → ' + 'n=' + t.to;
    btn.dataset.idx = i;
    btn.onclick = function() {
      __QHO.selectedTransitions[i] = !__QHO.selectedTransitions[i];
      this.classList.toggle('active');
    };
    container.appendChild(btn);
  });
}

function checkSelection() {
  var fb = document.getElementById('selection-feedback');
  var correct = 0;
  var wrongPicks = 0;

  transitionsList.forEach(function(t, i) {
    var selected = __QHO.selectedTransitions[i];
    if (selected === t.allowed) correct++;
    if (selected && !t.allowed) wrongPicks++;
  });

  if (correct === transitionsList.length) {
    fb.className = 'challenge-feedback success';
    fb.innerHTML = '✓ Mastered! The dipole operator x is odd (changes sign under x → −x). This means it can only connect states of opposite parity. Since parity = (−1)^n, transitions require Δn = ±1. Any other Δn is forbidden by symmetry!';
    __GameState.addXP(120, 'Selection rules mastered!');
    __GameState.unlock({ id: 'dipole_master', title: 'Dipole Master', desc: 'Discovered parity-based selection rules', icon: '⚡', xp: 30 });
    particleBurst(window.innerWidth/2, 300, '#facc15');
  } else {
    fb.className = 'challenge-feedback error';
    fb.textContent = '✗ ' + (transitionsList.length - correct) + ' wrong. Hint: the parity (even/odd) of Ψ changes by (−1)^n. The dipole x is odd. For the matrix element ⟨n|x|m⟩ to be non-zero, the integrand must be even overall.';
  }
  fb.style.display = 'block';
}

// ===== MODULE NAV =====
function buildModuleNav() {
  var nav = document.getElementById('module-nav');
  if (!nav) return;
  nav.innerHTML = '';

  var modules = [
    { num: '01', name: 'QHO', current: true },
    { num: '02', name: 'Hydrogen', url: '../02_hydrogen/index.html' },
    { num: '03', name: 'Spin-1/2', url: '../03_spin/index.html' },
    { num: '04', name: 'KP Model', url: '../04_kronig_penney/index.html' },
    { num: '05', name: 'Bands', url: '../05_energy_bands/index.html' },
    { num: '06', name: 'Fermi', url: '../06_fermi_surface/index.html' },
    { num: '07', name: 'Conductivity', url: '../07_conductivity/index.html' }
  ];

  modules.forEach(function(m) {
    var el = document.createElement(m.current ? 'div' : 'a');
    if (!m.current) { el.href = m.url; el.style.textDecoration = 'none'; }
    el.style.cssText = 'display:block;padding:0.5rem 0.7rem;border-radius:8px;margin-bottom:0.3rem;font-size:0.85rem;';
    if (m.current) {
      el.style.background = 'rgba(0,212,255,0.1)';
      el.style.border = '1px solid rgba(0,212,255,0.3)';
      el.style.color = 'var(--accent-cyan)';
      el.textContent = m.num + '. ' + m.name + ' (here)';
    } else {
      el.style.background = 'var(--bg-elevated)';
      el.style.border = '1px solid var(--border-subtle)';
      el.style.color = 'var(--text-dim)';
      el.textContent = m.num + '. ' + m.name;
    }
    nav.appendChild(el);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  // If plot-playground exists (legacy standalone page), init playground
  var hasPlayground = !!document.getElementById('plot-playground');
  if (hasPlayground) {
    var nSlider = document.getElementById('slider-n');
    var aSlider = document.getElementById('slider-alpha');

    if (nSlider) {
      nSlider.addEventListener('input', function(e) {
        __QHO.n = parseInt(e.target.value);
        document.getElementById('val-n').textContent = __QHO.n;
        updateLiveReadout(__QHO.n, __QHO.alpha);
        plotPlayground(__QHO.n, __QHO.alpha, __QHO.showClassical);
      });
    }

    if (aSlider) {
      aSlider.addEventListener('input', function(e) {
        __QHO.alpha = parseFloat(e.target.value);
        document.getElementById('val-alpha').textContent = __QHO.alpha.toFixed(2);
      });
    }

    plotPlayground(0, 0, false);
    updateLiveReadout(0, 0);
  }

  // Init challenges when mode switches (only if challenge elements exist)
  var hasChallenge = !!document.getElementById('challenge-target-plot');
  if (hasChallenge && typeof setGameMode === 'function') {
    var origSetGameMode = setGameMode;
    setGameMode = function(mode) {
      origSetGameMode(mode);
      if (mode === 'challenge') {
        startWaveMatch();
        plotLaserLevels();
      }
      if (mode === 'puzzle') {
        initEnergyLadder();
        initHamiltonian();
        initSelectionRules();
      }
    };
  }

  // Build nav and badges (shared UI)
  buildModuleNav();

  // Update stats if elements exist
  var badgeListEl = document.getElementById('stat-badges');
  if (badgeListEl) {
    var badges = __GameState.get('achievements') || [];
    badgeListEl.textContent = badges.length;
  }
  var xpEl = document.getElementById('stat-xp');
  if (xpEl) {
    var xp = __GameState.xp();
    xpEl.textContent = xp;
  }
  var navXpEl = document.getElementById('nav-xp');
  if (navXpEl) {
    navXpEl.textContent = __GameState.xp() + ' XP';
  }
});

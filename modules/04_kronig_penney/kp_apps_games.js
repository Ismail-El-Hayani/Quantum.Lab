/**
 * kp_apps_games.js — Kronig-Penney Lab: gamified simulations, challenges, puzzles
 * Module 04 — Kronig-Penney Model
 */

'use strict';

// ===== MATH UTILITIES =====

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
var __KP = {
  // Playground
  V0: 5,
  b_ratio: 0.2,
  a: 1.0,
  scheme: 'reduced',
  // Challenge 1: Crystal Designer
  cd: {
    active: false,
    targetGap: 0,
    currentGap: 0,
    score: 0,
    combo: 0,
    timer: null,
    timeLeft: 60,
    streak: 0
  },
  // Challenge 2: Bloch Oscillation
  bo: {
    E_field: 1.0,
    a_nm: 0.5,
    animFrame: null,
    t: 0
  },
  // Challenge 3: Bandgap Estimation
  be: {
    V0: 2.0,
    b_ratio: 0.15,
    a: 1.0
  },
  // Puzzle state
  tbFilled: [null, null, null],
  kpFilled: [null, null, null, null],
  bragg: {
    a: 0.5,
    k: 2 * Math.PI,
    n_target: 1,
    selected_n: null
  }
};

// ===== PLAYGROUND =====
var _playgroundInitialized = false;

function initPlayground() {
  // Sliders wired in kp_sim.js; just sync scheme buttons and state
  var btnR = document.getElementById('btn-reduced');
  var btnE = document.getElementById('btn-extended');
  if (btnR) btnR.classList.toggle('active', __KP.scheme === 'reduced');
  if (btnE) btnE.classList.toggle('active', __KP.scheme === 'extended');
  if (typeof state !== 'undefined') {
    state.V0 = __KP.V0;
    state.b = __KP.b_ratio * __KP.a;
    state.a = __KP.a;
    state.scheme = __KP.scheme;
  }
  // Only do the expensive full recompute the first time Playground opens.
  if (!_playgroundInitialized) {
    _playgroundInitialized = true;
    if (typeof updateAll === 'function') updateAll();
  }
}
window.initPlayground = initPlayground;

function updatePlayground() {
  if (typeof state !== 'undefined') {
    state.V0 = __KP.V0;
    state.b = __KP.b_ratio * __KP.a;
    state.a = __KP.a;
    state.scheme = __KP.scheme;
  }
  if (typeof updateAll === 'function') updateAll();
}

function setScheme(s) {
  __KP.scheme = s;
  document.getElementById('btn-reduced').classList.toggle('active', s === 'reduced');
  document.getElementById('btn-extended').classList.toggle('active', s === 'extended');
  updatePlayground();
}
window.setScheme = setScheme;

// ===== CHALLENGE 1: CRYSTAL DESIGNER =====
function startCrystalDesigner() {
  var c = __KP.cd;
  c.active = true;
  c.score = 0;
  c.combo = 0;
  c.timeLeft = 60;
  c.streak = 0;
  newCrystalDesignRound();
  startCDTimer();

  document.getElementById('cd-score').textContent = '0';
  document.getElementById('cd-combo').textContent = '0';

  var sV0 = document.getElementById('slider-cd-v0');
  var sB = document.getElementById('slider-cd-b');
  if (sV0) {
    sV0.addEventListener('input', function() {
      document.getElementById('val-cd-v0').textContent = parseFloat(this.value).toFixed(1);
      updateCrystalDesignerPlot();
    });
  }
  if (sB) {
    sB.addEventListener('input', function() {
      document.getElementById('val-cd-b').textContent = parseFloat(this.value).toFixed(2);
      updateCrystalDesignerPlot();
    });
  }
  updateCrystalDesignerPlot();
}

function newCrystalDesignRound() {
  var c = __KP.cd;
  // Generate a random target gap between 0.2 and 8.0
  c.targetGap = Math.round((0.3 + Math.random() * 6.0) * 100) / 100;
  document.getElementById('cd-target-gap').textContent = c.targetGap.toFixed(2) + ' ℏ²/ma²';
}

function updateCrystalDesignerPlot() {
  var V0 = parseFloat(document.getElementById('slider-cd-v0').value);
  var b_ratio = parseFloat(document.getElementById('slider-cd-b').value);
  if (typeof solveBands === 'function') {
    var result = solveBands(V0, 1.0, b_ratio, 200);
    var bands = result.bands;
    if (bands[0].length > 0 && bands[1].length > 0) {
      var top0 = Math.max.apply(null, bands[0].map(function(p) { return p.E; }));
      var bot1 = Math.min.apply(null, bands[1].map(function(p) { return p.E; }));
      __KP.cd.currentGap = bot1 - top0;
      document.getElementById('cd-current-gap').textContent = __KP.cd.currentGap.toFixed(3);
    }
    // Plot
    var colors = ['#00f0ff','#c084fc','#ff4ecd','#4ade80','#ffd740'];
    var traces = [];
    for (var ib = 0; ib < bands.length; ib++) {
      if (bands[ib].length < 3) continue;
      traces.push({
        x: bands[ib].map(function(p) { return p.k; }),
        y: bands[ib].map(function(p) { return p.E; }),
        mode: 'lines',
        name: 'Band ' + (ib + 1),
        line: { color: colors[ib % colors.length], width: 2 }
      });
    }
    traces.push({ x: [-Math.PI, -Math.PI], y: [0, V0 * 1.5], mode: 'lines', name: 'BZ edge', line: { color: 'rgba(255,255,255,0.15)', width: 1 } });
    traces.push({ x: [Math.PI, Math.PI], y: [0, V0 * 1.5], mode: 'lines', showlegend: false, line: { color: 'rgba(255,255,255,0.15)', width: 1 } });
    Plotly.react('plot-crystal-designer', traces, _extend(_darkLayout, {
      title: { text: 'E(k) — designer crystal', font: { size: 12 } },
      xaxis: { title: 'k (π/a)', tickmode: 'array', tickvals: [-Math.PI, 0, Math.PI], ticktext: ['-1', '0', '+1'] },
      yaxis: { title: 'E (ℏ²/ma²)' },
      margin: { l: 45, r: 10, t: 30, b: 35 }, showlegend: false
    }), { responsive: true, displayModeBar: false });
  }
  updateCrystalLattice(V0, b_ratio);
}

function updateCrystalLattice(V0, b_ratio) {
  var container = document.getElementById('crystal-lattice');
  if (!container) return;
  container.textContent = '';
  var nUnits = 8;
  for (var i = 0; i < nUnits; i++) {
    var well = document.createElement('div');
    well.className = 'well-block';
    well.style.height = '20px';
    container.appendChild(well);
    var bar = document.createElement('div');
    bar.className = 'barrier-block';
    bar.style.height = Math.min(70, V0 * 1.2) + 'px';
    bar.style.width = Math.max(8, b_ratio * 40) + 'px';
    container.appendChild(bar);
  }
}

function startCDTimer() {
  clearInterval(__KP.cd.timer);
  __KP.cd.timer = setInterval(function() {
    if (!__KP.cd.active) return;
    __KP.cd.timeLeft--;
    var pct = (__KP.cd.timeLeft / 60) * 100;
    var bar = document.getElementById('timer-1');
    bar.style.width = pct + '%';
    if (pct < 20) bar.classList.add('urgent');
    if (__KP.cd.timeLeft <= 0) {
      clearInterval(__KP.cd.timer);
      __KP.cd.active = false;
      var fb = document.getElementById('cd-feedback');
      fb.className = 'challenge-feedback';
      fb.style.display = 'block';
      fb.textContent = "⏰ Time's up! Final score: " + __KP.cd.score;
    }
  }, 1000);
}

function checkCrystalDesign() {
  var c = __KP.cd;
  if (!c.active) return;
  var fb = document.getElementById('cd-feedback');
  var diff = Math.abs(c.currentGap - c.targetGap);
  if (diff < 0.15) {
    c.streak++;
    var points = 50;
    if (c.streak >= 2) points += c.streak * 5;
    c.score += points;
    c.combo++;
    _GameState.addXP(points, 'Crystal designed!');
    celebrateCorrect();
    fb.className = 'challenge-feedback success';
    fb.textContent = '✓ Perfect! Gap = ' + c.currentGap.toFixed(3) + ' matches target. +' + points + ' XP!';
    fb.style.display = 'block';
    if (c.score >= 200) {
      _GameState.unlock({ id: 'crystal_engineer', title: 'Crystal Engineer', desc: 'Scored 200+ in Crystal Designer', icon: '🔷', xp: 25 });
    }
    setTimeout(function() {
      fb.style.display = 'none';
      newCrystalDesignRound();
      updateCrystalDesignerPlot();
    }, 1500);
  } else {
    c.streak = 0;
    c.combo = 0;
    fb.className = 'challenge-feedback error';
    fb.style.display = 'block';
    fb.textContent = '✗ Gap = ' + c.currentGap.toFixed(3) + ', target = ' + c.targetGap.toFixed(3) + '. Try adjusting V₀ or b/a.';
  }
  document.getElementById('cd-score').textContent = c.score;
  document.getElementById('cd-combo').textContent = c.combo;
}

function skipCrystalDesign() {
  newCrystalDesignRound();
  updateCrystalDesignerPlot();
  _GameState.addXP(-10, 'Skipped design');
}

// ===== CHALLENGE 2: BLOCH OSCILLATION =====
function initBlochOscillation() {
  var bo = __KP.bo;
  bo.E_field = 1.0 + Math.random() * 3.0;
  bo.a_nm = 0.3 + Math.random() * 0.5;
  document.getElementById('bo-E').textContent = bo.E_field.toFixed(1);
  document.getElementById('bo-a').textContent = bo.a_nm.toFixed(2);
  startBlochAnim();
}

function startBlochAnim() {
  var bo = __KP.bo;
  var el = document.getElementById('bloch-particle');
  var container = document.getElementById('bloch-anim');
  if (!el || !container) return;
  var start = performance.now();

  function frame(now) {
    var t = (now - start) / 1000;
    var a = bo.a_nm;
    var E = bo.E_field;
    var e = 1.6e-19;
    var hbar = 1.055e-34;
    // E_field is in units of 10^5 V/m (shown as "E = X × 10⁵ V/m")
    // omega_B = eEa/ℏ where E is in V/m → multiply by 1e5
    var omega_B = e * E * 1e5 * a * 1e-9 / hbar;
    var x = 0.5 * a * (1 - Math.cos(omega_B * t));
    var pct = (x / a) * 80 + 10; // map to 10-90% width
    el.style.left = pct + '%';
    el.style.top = '50%';
    bo.animFrame = requestAnimationFrame(frame);
  }
  if (bo.animFrame) cancelAnimationFrame(bo.animFrame);
  bo.animFrame = requestAnimationFrame(frame);
}

function checkBlochOscillation() {
  var bo = __KP.bo;
  var e = 1.6e-19;
  var hbar = 1.055e-34;
  var omega_B = e * bo.E_field * 1e5 * bo.a_nm * 1e-9 / hbar; // rad/s
  var omega_THz = omega_B / (2 * Math.PI * 1e12);
  var T_ps = 1 / omega_THz; // period in picoseconds = 1 / f(THz)

  var guessOmega = parseFloat(document.getElementById('bo-omega').value);
  var guessT = parseFloat(document.getElementById('bo-T').value);
  var fb = document.getElementById('bo-feedback');

  if (!isNaN(guessOmega) && !isNaN(guessT) && Math.abs(guessOmega - omega_THz) < 0.2 * omega_THz && Math.abs(guessT - T_ps) < 0.2 * T_ps) {
    fb.className = 'challenge-feedback success';
    fb.style.display = 'block';
    fb.textContent = '✓ Correct! ω_B = ' + omega_THz.toFixed(2) + ' THz, T_B = ' + T_ps.toFixed(2) + ' ps. Bloch oscillations are periodic motion of electrons in a lattice under an electric field.';
    _GameState.addXP(75, 'Bloch oscillation solved!');
    celebrateCorrect();
    _GameState.unlock({ id: 'bloch_racer', title: 'Bloch Racer', desc: 'Computed Bloch frequency correctly', icon: '〰', xp: 25 });
    initBlochOscillation();
  } else {
    fb.className = 'challenge-feedback error';
    fb.style.display = 'block';
    fb.textContent = '✗ Not quite. ω_B = eEa/ℏ (in rad/s). Convert to THz by dividing by 2π×10¹². T_B = 2π/ω_B in seconds, then convert to ps.';
  }
}

function showBlochHint() {
  var bo = __KP.bo;
  var fb = document.getElementById('bo-feedback');
  fb.className = 'challenge-feedback hint';
  fb.style.display = 'block';
  fb.textContent = '💡 Remember: ω_B (rad/s) = eEa/ℏ. Then f = ω_B/(2π) in Hz. Divide by 10¹² for THz. T_B = 1/f in seconds, multiply by 10¹² for ps.';
  _GameState.addXP(-5, 'Hint used');
}

// ===== CHALLENGE 3: BANDGAP ESTIMATION =====
function initBandgapEstimation() {
  var be = __KP.be;
  be.V0 = Math.round((1.0 + Math.random() * 4.0) * 100) / 100;
  be.b_ratio = Math.round((0.10 + Math.random() * 0.20) * 100) / 100;
  document.getElementById('be-v0').textContent = be.V0.toFixed(2);
  document.getElementById('be-b').textContent = be.b_ratio.toFixed(2);
  // Plot actual bands for these params
  if (typeof solveBands === 'function') {
    var result = solveBands(be.V0, 1.0, be.b_ratio, 200);
    var colors = ['#00f0ff','#c084fc','#ff4ecd','#4ade80','#ffd740'];
    var traces = [];
    for (var ib = 0; ib < result.bands.length; ib++) {
      if (result.bands[ib].length < 3) continue;
      traces.push({
        x: result.bands[ib].map(function(p) { return p.k; }),
        y: result.bands[ib].map(function(p) { return p.E; }),
        mode: 'lines',
        name: 'Band ' + (ib + 1),
        line: { color: colors[ib % colors.length], width: 2 }
      });
    }
    Plotly.react('plot-bandgap-est', traces, _extend(_darkLayout, {
      title: { text: 'Actual band structure', font: { size: 12 } },
      xaxis: { title: 'k (π/a)', tickmode: 'array', tickvals: [-Math.PI, 0, Math.PI], ticktext: ['-1', '0', '+1'] },
      yaxis: { title: 'E (ℏ²/ma²)' },
      margin: { l: 45, r: 10, t: 30, b: 35 }, showlegend: false
    }), { responsive: true, displayModeBar: false });
  }
}

function checkBandgapEstimation() {
  var be = __KP.be;
  var V_G = (be.V0 / Math.PI) * Math.sin(Math.PI * be.b_ratio);
  var predictedGap = 2 * Math.abs(V_G);
  var guess = parseFloat(document.getElementById('be-gap').value);
  var fb = document.getElementById('be-feedback');
  if (!isNaN(guess) && Math.abs(guess - predictedGap) < 0.15 * predictedGap + 0.05) {
    fb.className = 'challenge-feedback success';
    fb.style.display = 'block';
    fb.textContent = '✓ Excellent! Nearly-free gap ≈ 2|V_G| = ' + predictedGap.toFixed(3) + ' ℏ²/ma². The Fourier component V_G = (V₀/π)sin(πb/a) captures the periodic perturbation strength.';
    _GameState.addXP(100, 'Bandgap estimated!');
    celebrateCorrect();
    _GameState.unlock({ id: 'bandgap_architect', title: 'Bandgap Architect', desc: 'Mastered nearly-free electron gap estimation', icon: '📐', xp: 30 });
  } else {
    fb.className = 'challenge-feedback error';
    fb.style.display = 'block';
    fb.textContent = '✗ Try again. V_G = (V₀/π) sin(πb/a). Then E_gap ≈ 2|V_G|.';
  }
}

function newBandgapRound() {
  initBandgapEstimation();
  document.getElementById('be-feedback').style.display = 'none';
  document.getElementById('be-gap').value = '';
}

// ===== PUZZLE 1: TIGHT-BINDING CHAIN =====
function initTightBinding() {
  __KP.tbFilled = [null, null, null];
  document.querySelectorAll('.equation-drop-zone').forEach(function(el) {
    el.textContent = '?';
    el.classList.remove('correct', 'wrong');
  });
  initDragAndDrop('tb');
}

function initDragAndDrop(prefix) {
  var pool = document.getElementById(prefix + '-pool');
  if (!pool) return;

  // Preferred slot index for each chip value (when available).
  // KP has two 'cos' chips; we assign them to slots 0 and 1 in order.
  var preferredSlot = {};
  if (prefix === 'tb') {
    preferredSlot = { E0: 0, t: 1, ka: 2 };
  }

  pool.querySelectorAll('.term-chip').forEach(function(chip) {
    chip.onclick = function() {
      var val = chip.dataset.val;
      var slots = document.querySelectorAll('[id^="' + prefix + '-slot-"]');
      var preferred = preferredSlot[val];

      // For KP, the two 'cos' chips go to slots 0 and 1 respectively.
      if (prefix === 'kp' && val === 'cos') {
        if (slots[0].textContent === '?') { slots[0].textContent = val; __KP.kpFilled[0] = val; return; }
        if (slots[1].textContent === '?') { slots[1].textContent = val; __KP.kpFilled[1] = val; return; }
      }

      // Try preferred slot if empty
      if (preferred !== undefined && slots[preferred] && slots[preferred].textContent === '?') {
        slots[preferred].textContent = val;
        __KP[prefix + 'Filled'][preferred] = val;
        return;
      }

      // Otherwise fill first empty slot
      for (var i = 0; i < slots.length; i++) {
        if (slots[i].textContent === '?') {
          slots[i].textContent = val;
          __KP[prefix + 'Filled'][i] = val;
          break;
        }
      }
    };
    chip.ondragstart = function(e) {
      e.dataTransfer.setData('val', chip.dataset.val);
    };
  });

  var slots = document.querySelectorAll('[id^="' + prefix + '-slot-"]');
  slots.forEach(function(slot, idx) {
    slot.ondragover = function(e) { e.preventDefault(); };
    slot.ondrop = function(e) {
      e.preventDefault();
      var val = e.dataTransfer.getData('val');
      slot.textContent = val;
      __KP[prefix + 'Filled'][idx] = val;
    };
    slot.onclick = function() {
      slot.textContent = '?';
      __KP[prefix + 'Filled'][idx] = null;
    };
  });
}

function checkTightBinding() {
  var filled = __KP.tbFilled;
  var fb = document.getElementById('tb-feedback');
  if (filled[0] === 'E0' && filled[1] === 't' && filled[2] === 'ka') {
    fb.className = 'challenge-feedback success';
    fb.style.display = 'block';
    fb.textContent = '✓ Correct! E(k) = E₀ − 2t cos(ka). In the tight-binding limit, electrons hop between nearest-neighbor atoms with amplitude t. The cosine dispersion arises from translational symmetry.';
    _GameState.addXP(60, 'Tight-binding chain solved!');
    celebrateCorrect();
    document.querySelectorAll('#tb-slot-0, #tb-slot-1, #tb-slot-2').forEach(function(el) { el.classList.add('correct'); });
  } else {
    fb.className = 'challenge-feedback error';
    fb.style.display = 'block';
    fb.textContent = '✗ Not quite. E(k) = E₀ − 2t cos(ka). First slot = E₀, second = t, third = ka.';
    document.querySelectorAll('#tb-slot-0, #tb-slot-1, #tb-slot-2').forEach(function(el) { el.classList.add('wrong'); });
  }
}

function resetTightBinding() {
  initTightBinding();
  document.getElementById('tb-feedback').style.display = 'none';
  document.querySelectorAll('#tb-slot-0, #tb-slot-1, #tb-slot-2').forEach(function(el) { el.classList.remove('correct', 'wrong'); });
}

// ===== PUZZLE 2: K-P EQUATION ASSEMBLY =====
function initKPAssembly() {
  __KP.kpFilled = [null, null, null, null];
  document.querySelectorAll('#kp-slot-0, #kp-slot-1, #kp-slot-2, #kp-slot-3').forEach(function(el) {
    el.textContent = '?';
    el.classList.remove('correct', 'wrong');
  });
  initDragAndDrop('kp');
}

function checkKPAssembly() {
  var filled = __KP.kpFilled;
  var fb = document.getElementById('kp-feedback');
  var ok = (filled[0] === 'cos') && (filled[1] === 'cos') && (filled[2] === 'cosh') && (filled[3] === 'rhs1');
  if (ok) {
    fb.className = 'challenge-feedback success';
    fb.style.display = 'block';
    fb.textContent = '✓ Perfect! cos(ka) = cos(αw)cosh(βb) + [(β²−α²)/(2αβ)]sin(αw)sinh(βb). This is the exact transcendental equation for the Kronig-Penney model with E < V₀.';
    _GameState.addXP(80, 'K-P equation assembled!');
    celebrateCorrect();
    _GameState.unlock({ id: 'kp_assembler', title: 'Crystal Engineer', desc: 'Assembled the Kronig-Penney equation', icon: '⚙', xp: 25 });
    document.querySelectorAll('#kp-slot-0, #kp-slot-1, #kp-slot-2, #kp-slot-3').forEach(function(el) { el.classList.add('correct'); });
  } else {
    fb.className = 'challenge-feedback error';
    fb.style.display = 'block';
    fb.textContent = '✗ Check each term. Remember: cos(ka) = cos(αw)cosh(βb) + cross term with sin(αw)sinh(βb). First slot: cos, second: cos, third: cosh, fourth: the RHS cross term.';
    document.querySelectorAll('#kp-slot-0, #kp-slot-1, #kp-slot-2, #kp-slot-3').forEach(function(el) { el.classList.add('wrong'); });
  }
}

function resetKPAssembly() {
  initKPAssembly();
  document.getElementById('kp-feedback').style.display = 'none';
  document.querySelectorAll('#kp-slot-0, #kp-slot-1, #kp-slot-2, #kp-slot-3').forEach(function(el) { el.classList.remove('correct', 'wrong'); });
}

// ===== PUZZLE 3: BRAGG REFLECTION =====
function initBraggPuzzle() {
  var b = __KP.bragg;
  b.a = 0.3 + Math.random() * 0.6;
  b.k = (1 + Math.floor(Math.random() * 3)) * Math.PI / b.a;
  b.n_target = Math.round(b.k * b.a / Math.PI);
  document.getElementById('bragg-a').textContent = b.a.toFixed(2);
  document.getElementById('bragg-k').textContent = (b.k / Math.PI).toFixed(2) + 'π';

  var opts = document.getElementById('bragg-options');
  opts.textContent = '';
  for (var n = 1; n <= 4; n++) {
    var btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'n = ' + n;
    btn.dataset.n = n;
    btn.onclick = function() {
      b.selected_n = Number.parseInt(this.dataset.n);
      opts.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
    };
    opts.appendChild(btn);
  }
  drawBraggCanvas();
}

function drawBraggCanvas() {
  var canvas = document.getElementById('bragg-canvas');
  if (!canvas) return;
  canvas.textContent = '';
  var w = canvas.clientWidth;
  var h = canvas.clientHeight;
  // Draw atomic planes
  var nPlanes = 5;
  for (var i = 0; i < nPlanes; i++) {
    var atom = document.createElement('div');
    atom.className = 'bragg-atom';
    atom.style.left = (10 + i * 18) + '%';
    atom.style.top = (h / 2 - 6) + 'px';
    canvas.appendChild(atom);
  }
  // Draw incident ray
  var ray = document.createElement('div');
  ray.className = 'bragg-ray';
  ray.style.width = '30%';
  ray.style.left = '5%';
  ray.style.top = (h / 2) + 'px';
  var angle = Math.atan2(h * 0.3, w * 0.3) * 180 / Math.PI;
  ray.style.transform = 'rotate(' + (-angle) + 'deg)';
  canvas.appendChild(ray);
  // Reflected ray
  var rray = document.createElement('div');
  rray.className = 'bragg-ray';
  rray.style.width = '25%';
  rray.style.left = '45%';
  rray.style.top = (h / 2) + 'px';
  rray.style.transform = 'rotate(' + angle + 'deg)';
  canvas.appendChild(rray);
}

function checkBragg() {
  var b = __KP.bragg;
  var fb = document.getElementById('bragg-feedback');
  if (b.selected_n === b.n_target) {
    fb.className = 'challenge-feedback success';
    fb.style.display = 'block';
    fb.textContent = '✓ Correct! Bragg condition: nλ = 2a. With λ = 2π/k, this gives k = nπ/a. For a = ' + b.a.toFixed(2) + ' nm and k = ' + (b.k / Math.PI).toFixed(2) + 'π nm⁻¹, n = ' + b.n_target + '.';
    _GameState.addXP(120, 'Bragg reflection mastered!');
    celebrateCorrect();
    _GameState.unlock({ id: 'bragg_master', title: 'Bragg Master', desc: 'Matched all Bragg reflections', icon: '💎', xp: 35 });
    setTimeout(function() { initBraggPuzzle(); fb.style.display = 'none'; }, 2000);
  } else {
    fb.className = 'challenge-feedback error';
    fb.style.display = 'block';
    fb.textContent = '✗ Not quite. Remember: k = nπ/a, so n = ka/π. For these values, n should be ' + b.n_target + '.';
  }
}

function newBraggRound() {
  initBraggPuzzle();
  document.getElementById('bragg-feedback').style.display = 'none';
}

// ===== BADGES & SCOREBOARD =====
var KP_BADGES = [
  { id: 'crystal_engineer', name: 'Crystal Engineer', desc: 'Scored 200+ in Crystal Designer', icon: '🔷', xp: 25 },
  { id: 'bloch_racer', name: 'Bloch Racer', desc: 'Computed Bloch frequency correctly', icon: '〰', xp: 25 },
  { id: 'bandgap_architect', name: 'Bandgap Architect', desc: 'Mastered nearly-free electron gap estimation', icon: '📐', xp: 30 },
  { id: 'kp_assembler', name: 'K-P Assembler', desc: 'Assembled the Kronig-Penney equation', icon: '⚙', xp: 25 },
  { id: 'bragg_master', name: 'Bragg Master', desc: 'Matched all Bragg reflections', icon: '💎', xp: 35 },
  { id: 'tb_solver', name: 'Tight-Binding Solver', desc: 'Solved the tight-binding chain puzzle', icon: '🔗', xp: 20 }
];

function renderBadgesKP() {
  var earned = _GameState.get('achievements') || [];
  var earnedIds = earned.map(function(a){ return a.id; });
  ['badge-list','badge-list-story','badge-list-theory'].forEach(function(listId){
    var list = document.getElementById(listId);
    if (!list) return;
    list.textContent = '';
    KP_BADGES.forEach(function(b){
      var isEarned = earnedIds.indexOf(b.id) >= 0;
      var div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0;border-bottom:1px solid var(--glass-border);';
      var iconSpan = document.createElement('span');
      iconSpan.style.fontSize = '1.1rem';
      iconSpan.textContent = isEarned ? b.icon : '🔒';
      div.appendChild(iconSpan);
      var infoDiv = document.createElement('div');
      infoDiv.style.flex = '1';
      var nameDiv = document.createElement('div');
      nameDiv.style.fontSize = '0.8rem';
      nameDiv.style.color = isEarned ? 'var(--text-main)' : 'var(--text-dim)';
      nameDiv.textContent = b.name;
      infoDiv.appendChild(nameDiv);
      var descDiv = document.createElement('div');
      descDiv.style.fontSize = '0.7rem';
      descDiv.style.color = 'var(--text-dim)';
      descDiv.textContent = b.desc;
      infoDiv.appendChild(descDiv);
      div.appendChild(infoDiv);
      list.appendChild(div);
    });
  });
}

function updateScoreboardKP() {
  var earned = _GameState.get('achievements') || [];
  var xp = _GameState.xp();
  var ch = _GameState.get('challengesCompleted') || 0;
  var pz = _GameState.get('puzzlesCompleted') || 0;
  var counts = { challenges: ch, puzzles: pz, xp: xp, badges: earned.length };
  var bases = ['stat-challenges','stat-puzzles','stat-xp','stat-badges'];
  bases.forEach(function(base, idx){
    var key = Object.keys(counts)[idx];
    var v = counts[key];
    var el = document.getElementById(base); if (el) el.textContent = v;
    ['-story','-theory'].forEach(function(suffix){
      var el2 = document.getElementById(base + suffix); if (el2) el2.textContent = v;
    });
  });
  var elNav = document.getElementById('nav-xp'); if (elNav) elNav.textContent = xp + ' XP';
  renderBadgesKP();
}

// ===== MODULE NAV =====
function buildModuleNav() {
  var ids = ['module-nav', 'module-nav-story', 'module-nav-theory'];
  var containers = ids.map(function(id){ return document.getElementById(id); }).filter(Boolean);
  if (containers.length === 0) return;

  var modules = [
    { num: '00', name: 'Crystal to Quantum', url: '../00_crystal_to_quantum/index.html' },
    { num: '01', name: 'QHO', url: '../01_qho/index.html' },
    { num: '02', name: 'Hydrogen', url: '../02_hydrogen/index.html' },
    { num: '03', name: 'Spin-1/2', url: '../03_spin/index.html' },
    { num: '04', name: 'KP Model', current: true },
    { num: '05', name: 'Energy Bands', url: '../05_energy_bands/index.html' },
    { num: '06', name: 'Fermi Surface', url: '../06_fermi_surface/index.html' },
    { num: '07', name: 'Conductivity', url: '../07_conductivity/index.html' },
    { num: '08', name: 'Superconductivity', url: '../08_superconductivity/index.html' },
    { num: '09', name: 'Intrinsic Semiconductors', url: '../09_intrinsic_semiconductors/index.html' },
    { num: '10', name: 'Doped Semiconductors', url: '../10_doped_semiconductors/index.html' },
    { num: '11', name: 'Junctions & Devices', url: '../11_junctions_devices/index.html' },
    { num: '12', name: 'Optics & Dispersion', url: '../12_optics_dispersion/index.html' },
    { num: '13', name: 'Laser Physics', url: '../13_laser_physics/index.html' },
    { num: '14', name: 'Magnetism', url: '../14_magnetism/index.html' },
    { num: '15', name: 'Thermal Properties', url: '../15_thermal_properties/index.html' }
  ];

  containers.forEach(function(nav){
    nav.textContent = '';
    modules.forEach(function(m) {
      var el = document.createElement(m.current ? 'div' : 'a');
      if (!m.current) { el.href = m.url; el.style.textDecoration = 'none'; }
      el.style.cssText = 'display:block;padding:0.5rem 0.7rem;border-radius:8px;margin-bottom:0.3rem;font-size:0.85rem;';
      if (m.current) {
        el.style.background = 'rgba(179,136,255,0.1)';
        el.style.border = '1px solid rgba(179,136,255,0.3)';
        el.style.color = 'var(--accent-purple)';
        el.textContent = m.num + '. ' + m.name + ' (here)';
      } else {
        el.style.background = 'var(--bg-elevated)';
        el.style.border = '1px solid var(--border-subtle)';
        el.style.color = 'var(--text-dim)';
        el.textContent = m.num + '. ' + m.name;
      }
      nav.appendChild(el);
    });
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  initPlayground();
  if (typeof initKP === 'function') initKP();
  buildModuleNav();
  updateScoreboardKP();

  // Register init hooks so shared setGameMode calls them
  window.initChallenges = function() {
    startCrystalDesigner();
    initBlochOscillation();
    initBandgapEstimation();
  };
  window.initPuzzles = function() {
    initTightBinding();
    initKPAssembly();
    initBraggPuzzle();
  };
});

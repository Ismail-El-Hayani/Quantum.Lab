/**
 * eb_apps_games.js — Energy Bands & DOS Lab: gamified simulations
 * Module 05 — Energy Bands & Density of States
 */
'use strict';

var _dLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', size: 11 },
  margin: { l: 50, r: 20, t: 40, b: 40 },
  xaxis: { gridcolor: '#2a2a3a', zerolinecolor: '#3a3a5a' },
  yaxis: { gridcolor: '#2a2a3a', zerolinecolor: '#3a3a5a' }
};

function _ext(base, over) {
  var out = JSON.parse(JSON.stringify(base));
  for (var k in over) {
    if (typeof over[k] === 'object' && over[k] !== null && !Array.isArray(over[k]) && k in out && typeof out[k] === 'object') { for (var j in over[k]) out[k][j] = over[k][j]; }
    else out[k] = over[k];
  }
  return out;
}

var __EB = {
  challenge: { active: false, score: 0, combo: 0, timeLeft: 60, streak: 0, timer: null },
};

function plotDOSPlayground(dim) {
  if (window.setEBDim) window.setEBDim(dim);
}

function plotDopingEffect(n) {
  var E = linspace(0, 2, 100);
  var dos3D = E.map(function(e) { return Math.sqrt(e); });
  var EF = 0.026 * Math.log(n / 1e22);
  var fd = E.map(function(e) { return 1 / (1 + Math.exp((e - EF) / 0.026)); });
  var occ = E.map(function(e, i) { return dos3D[i] * fd[i]; });

  Plotly.react('plot-doping', [
    { x: E, y: dos3D, mode: 'lines', name: 'DOS D(E)', line: { color: '#00f0ff', width: 2 } },
    { x: E, y: occ, mode: 'lines', name: 'Occupied states', line: { color: '#ff4ecd', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(255,64,129,0.08)' },
    { x: [EF, EF], y: [0, Math.max.apply(null, dos3D)], mode: 'lines', line: { color: '#facc15', width: 2, dash: 'dot' }, name: 'E_F = ' + EF.toFixed(3) + ' eV' }
  ], _ext(_dLayout, {
    title: { text: 'Doping: n = ' + n.toExponential(1) + ' m⁻³ · E_F = ' + EF.toFixed(3) + ' eV', font: { size: 13 } },
    xaxis: { title: 'E (eV)' }, yaxis: { title: 'D(E) × f(E)' }
  }), { responsive: true, displayModeBar: false });
}

// ===== CHALLENGES =====
var fermiMaterials = [
  { name: 'Si (n-type, 10²¹ m⁻³)', doping: 1e21, type: 'n-type', EF: 0.9 },
  { name: 'Si (p-type, 10²¹ m⁻³)', doping: 1e21, type: 'p-type', EF: 0.1 },
  { name: 'GaAs (intrinsic)', doping: 1e14, type: 'intrinsic', EF: 0.5 },
  { name: 'Cu (metal)', doping: 1e28, type: 'metal', EF: 7.0 },
  { name: 'Ge (n-type)', doping: 1e22, type: 'n-type', EF: 0.35 },
  { name: 'Diamond (insulator)', doping: 1e10, type: 'insulator', EF: 3.0 }
];

function startFermiHunter() {
  var c = __EB.challenge;
  c.active = true; c.score = 0; c.combo = 0; c.timeLeft = 60; c.streak = 0;
  nextFermiTarget();
  document.getElementById('fermi-score').textContent = '0';
  document.getElementById('fermi-combo').textContent = '0';
  if (c.timer) clearInterval(c.timer);
  c.timer = setInterval(function() {
    if (!c.active) return;
    c.timeLeft--;
    var bar = document.getElementById('fermi-timer');
    if (bar) { bar.style.width = (c.timeLeft / 60 * 100) + '%'; if (c.timeLeft < 12) bar.classList.add('urgent'); }
    if (c.timeLeft <= 0) { clearInterval(c.timer); c.active = false;
      document.getElementById('fermi-feedback').textContent = '⏰ Time\'s up! Final score: ' + c.score;
    }
  }, 1000);
}

function nextFermiTarget() {
  var t = fermiMaterials[Math.floor(Math.random() * fermiMaterials.length)];
  __EB.challenge.target = t;
  var fb = document.getElementById('fermi-target-text');
  if (fb) fb.innerHTML = '🔎 <strong style="color:var(--text-main)">Material:</strong> ' + t.name + '<br/><span style="font-size:0.85rem;color:var(--text-muted);">Carrier density: n = ' + t.doping.toExponential(0) + ' m⁻³ · Is it n-type, p-type, intrinsic, metal, or insulator?</span>';
}

function guessFermiType(guess) {
  var c = __EB.challenge;
  if (!c.active) return;
  var fb = document.getElementById('fermi-feedback');
  if (guess === c.target.type) {
    c.streak++; var pts = 50 + c.streak * 5;
    c.score += pts; c.combo++;
    __GameState.addXP(pts, 'Material identified!');
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Correct! ' + c.target.name + ' is ' + c.target.type + '. E_F ≈ ' + c.target.EF + ' eV. +' + pts + ' XP';
    particleBurst(window.innerWidth / 2, 300);
    if (c.score >= 200) __GameState.unlock({ id: 'material_tuner', title: 'Material Tuner', desc: 'Scored 200+ on Fermi Hunter', icon: '⚗', xp: 25 });
    setTimeout(nextFermiTarget, 1500);
  } else {
    c.streak = 0; c.combo = 0;
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ Not ' + guess + '. Hint: n-type → E_F near conduction band. p-type → E_F near valence band. Metal → E_F inside band.';
  }
  document.getElementById('fermi-score').textContent = c.score;
  document.getElementById('fermi-combo').textContent = c.combo;
}

function checkEffectiveMass() {
  var guess = Number.parseFloat(document.getElementById('effmass-guess').value);
  var fb = document.getElementById('effmass-feedback');
  // Tie to the state.t from eb_sim.js
  var t_val = (window.state && window.state.t) ? window.state.t : 1.0;
  // E(k) ≈ ε + 2t·cos(ka). Near k=0: E ≈ ε + 2t - t(ka)².
  // Curvature |d²E/dk²| = 2ta². Comparing to E = ℏ²k²/(2m*):
  // m* = ℏ²/(2ta²). For a = 0.5 nm → ℏ²/(2m_e a²) ≈ 1.52 eV.
  // Therefore m*/m_e = 1.52 / t (numerically for a = 0.5 nm).
  var correctM = 1.52 / t_val;
  if (Math.abs(guess - correctM) < 0.2) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '✓ Correct! m* = ℏ²/(2ta²) ≈ 1.52/t (for a=0.5 nm). Higher t = narrower band = lighter mass. GaAs effective mass ≈ 0.067 mₑ comes from a very different band curvature in real semiconductors.';
    __GameState.addXP(75, 'Effective mass from curvature!');
    __GameState.unlock({ id: 'dos_explorer', title: 'DOS Explorer', desc: 'Calculated effective mass from band curvature', icon: '📐', xp: 25 });
    particleBurst(window.innerWidth / 2, 350, '#c084fc');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ Too far. Expand E(k) ≈ ε + 2t - t(ka)² near k=0, then compare to ℏ²k²/(2m*). Use t from the playground!';
  }
}

function plotEffectiveMass() {
  var t_val = (window.state && window.state.t) ? window.state.t : 1.0;
  var eps = (window.state && window.state.eps) ? window.state.eps : 0.0;
  var ka = [];
  var E_tb = [];
  var E_para = [];
  for (var i = 0; i <= 100; i++) {
    var k = (i / 100) * 0.5; // ka from 0 to 0.5
    ka.push(k);
    E_tb.push(eps + 2 * t_val * Math.cos(k));
    E_para.push(eps + 2 * t_val - t_val * k * k);
  }
  var correctM = 1.52 / t_val;
  document.getElementById('effmass-t').textContent = t_val.toFixed(2);
  Plotly.react('plot-effmass', [
    { x: ka, y: E_tb, mode: 'lines', name: 'TB: ε + 2t cos(ka)', line: { color: '#00f0ff', width: 2.5 } },
    { x: ka, y: E_para, mode: 'lines', name: 'Parabolic fit: ε + 2t - t(ka)²', line: { color: '#ff4ecd', width: 2, dash: 'dot' } }
  ], _ext(_dLayout, {
    title: { text: 'Band curvature (t=' + t_val.toFixed(2) + ' eV) · m* ≈ ' + correctM.toFixed(2) + ' mₑ', font: { size: 13 } },
    xaxis: { title: 'ka (dimensionless)' }, yaxis: { title: 'E (eV)' },
    legend: { x: 0.65, y: 0.95, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 }
  }), { responsive: true, displayModeBar: false });
}

var bandgapMaterials = [
  { name: 'Copper (Cu)', gap: 0, type: 'metal' },
  { name: 'Silicon (Si)', gap: 1.12, type: 'semiconductor' },
  { name: 'Diamond (C)', gap: 5.5, type: 'insulator' },
  { name: 'GaAs', gap: 1.43, type: 'semiconductor' },
  { name: 'Sodium (Na)', gap: 0, type: 'metal' },
  { name: 'SiO₂', gap: 8.9, type: 'insulator' }
];

function startBandgapDetective() {
  var t = bandgapMaterials[Math.floor(Math.random() * bandgapMaterials.length)];
  __EB.challenge.gapTarget = t;
  document.getElementById('gap-target-text').textContent = '🔎 Material: ' + t.name + ' · Bandgap = ?';
  document.getElementById('gap-feedback').style.display = 'none';
}

function guessBandgapCat(cat) {
  var t = __EB.challenge.gapTarget;
  var fb = document.getElementById('gap-feedback');
  if (cat === t.type) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '✓ Correct! ' + t.name + ' has E_g = ' + t.gap + ' eV. Metals (0 eV), SC (0.1-3 eV), Insulators (>3 eV).';
    __GameState.addXP(60, 'Bandgap material detected!');
    __GameState.unlock({ id: 'graphene_disciple', title: 'Graphene Disciple', desc: 'Classified materials by bandgap', icon: '🔷', xp: 20 });
    particleBurst(window.innerWidth / 2, 300, '#4ade80');
    setTimeout(startBandgapDetective, 2000);
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ Not ' + cat + '. ' + t.name + ' has bandgap ' + t.gap + ' eV.';
  }
}

function checkDopingSlider() {
  var targetType = document.getElementById('doping-target-type').textContent;
  var n = Math.pow(10, Number.parseFloat(document.getElementById('slider-doping').value));
  var fb = document.getElementById('doping-feedback');
  var isNtype = n > 1e21;
  var isPtype = n < 1e19;
  if ((targetType === 'n-type' && isNtype) || (targetType === 'p-type' && isPtype)) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Correct! E_F shifts toward the ' + (isNtype ? 'conduction' : 'valence') + ' band.';
    __GameState.addXP(60, 'Doping balance mastered!');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ Wrong regime. Adjust carrier density n to move E_F.';
  }
}

var integralTerms = [
  { label: '∫₀^∞ D(E) dE', correct: 'total-states' },
  { label: '∫₀^E_F D(E) dE', correct: 'electron-count' },
  { label: '∫₀^∞ D(E) f(E) dE', correct: 'occupied-states' },
  { label: '∫₀^∞ E·D(E) f(E) dE', correct: 'total-energy' },
  { label: '∂/∂E [D(E)]', correct: 'none' },
  { label: '∫_{E_F}^∞ D(E) dE', correct: 'empty-above' }
];
var integralTargets = [
  { id: 'total-states', label: 'Total available states' },
  { id: 'electron-count', label: 'Electron density n' },
  { id: 'occupied-states', label: 'Occupied states count' },
  { id: 'total-energy', label: 'Total energy U' },
  { id: 'empty-above', label: 'Empty states above E_F' }
];

function initIntegralPuzzle() {
  var pool = document.getElementById('integral-pool');
  var targets = document.getElementById('integral-targets');
  pool.innerHTML = ''; targets.innerHTML = '';
  integralTerms.forEach(function(t) {
    var el = document.createElement('div');
    el.className = 'draggable-target'; el.draggable = true;
    el.dataset.correct = t.correct;
    el.innerHTML = '<div style="font-family:var(--mono);font-size:0.8rem;color:var(--accent-cyan);">' + t.label + '</div>';
    el.ondragstart = function(e) { e.dataTransfer.setData('text', t.correct); };
    pool.appendChild(el);
  });
  integralTargets.forEach(function(t) {
    var zone = document.createElement('div');
    zone.className = 'drop-zone'; zone.dataset.term = t.id;
    zone.textContent = t.label;
    zone.ondrop = function(e) {
      e.preventDefault(); var term = e.dataTransfer.getData('text');
      if (term === t.id) { zone.classList.add('correct'); zone.textContent = '✓ ' + t.label; }
      else { zone.classList.add('wrong'); zone.textContent = '✗ ' + t.label; }
    };
    zone.ondragover = function(e) { e.preventDefault(); };
    targets.appendChild(zone);
  });
}

function checkIntegralPuzzle() {
  var correct = document.querySelectorAll('#integral-targets .drop-zone.correct').length;
  var fb = document.getElementById('integral-feedback');
  if (correct === 5) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Perfect! The DOS integral is the heart of device physics.';
    __GameState.addXP(100, 'Integral equations mastered!');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ ' + (5 - correct) + ' mismatches. Review the physics of DOS weighting!';
  }
}

function initDiracPuzzle() {
  var c = document.getElementById('dirac-list');
  c.innerHTML = '';
  var diracPuzzles = [
    { label: 'Free electron (3D)', shape: 'parabolic' },
    { label: 'Graphene (2D)', shape: 'conical' },
    { label: 'Quantum well (2D)', shape: 'parabolic' },
    { label: 'Carbon nanotube (1D)', shape: 'parabolic' },
    { label: 'Surface state (TI)', shape: 'conical' }
  ];
  diracPuzzles.forEach(function(p, i) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:1rem;padding:0.5rem;border-bottom:1px solid var(--border-subtle);';
    var label = document.createElement('div');
    label.style.cssText = 'font-family:var(--mono);font-size:0.85rem;color:var(--text-main);width:200px;';
    label.textContent = p.label;
    var sel = document.createElement('select');
    sel.id = 'dirac-sel-' + i;
    sel.style.cssText = 'background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;font-family:var(--font-mono);';
    [{v:'parabolic',t:'Parabolic (∝ k²)'},{v:'conical',t:'Conical (∝ |k|)'}].forEach(function(opt) {
      var o = document.createElement('option'); o.value = opt.v; o.textContent = opt.t; sel.appendChild(o);
    });
    row.appendChild(label); row.appendChild(sel);
    c.appendChild(row);
  });
}

function checkDiracPuzzle() {
  var correct = 0;
  var diracPuzzles = [
    { label: 'Free electron (3D)', shape: 'parabolic' },
    { label: 'Graphene (2D)', shape: 'conical' },
    { label: 'Quantum well (2D)', shape: 'parabolic' },
    { label: 'Carbon nanotube (1D)', shape: 'parabolic' },
    { label: 'Surface state (TI)', shape: 'conical' }
  ];
  diracPuzzles.forEach(function(p, i) {
    var v = document.getElementById('dirac-sel-' + i).value;
    if (v === p.shape) correct++;
  });
  var fb = document.getElementById('dirac-feedback');
  if (correct === diracPuzzles.length) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Excellent! Linear E-k dispersion implies massless fermions.';
    __GameState.addXP(120, 'Dirac vs parabolic mastered!');
    __GameState.unlock({ id: 'dirac_master', title: 'Dirac Master', desc: 'Distinguished parabolic and Dirac dispersions', icon: '🌊', xp: 30 });
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ ' + (diracPuzzles.length - correct) + ' wrong. Graphene = conical.';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var dSlider = document.getElementById('slider-doping');
  if (dSlider) {
    // Initialize plot with default value
    var defaultExp = Number.parseFloat(dSlider.value);
    var defaultN = Math.pow(10, defaultExp);
    document.getElementById('val-doping').textContent = defaultN.toExponential(1);
    plotDopingEffect(defaultN);

    dSlider.addEventListener('input', function(e) {
      var exp = Number.parseFloat(e.target.value);
      var n = Math.pow(10, exp);
      document.getElementById('val-doping').textContent = n.toExponential(1);
      plotDopingEffect(n);
    });
  }
  
  if (typeof setGameMode === 'function') {
    var orig = setGameMode;
    setGameMode = function(mode) {
      orig(mode);
      if (mode === 'challenge') { startFermiHunter(); startBandgapDetective(); plotEffectiveMass(); }
      if (mode === 'puzzle') { initIntegralPuzzle(); initDiracPuzzle();
        var t = Math.random() > 0.5 ? 'n-type' : 'p-type';
        var el = document.getElementById('doping-target-type');
        if (el) el.textContent = t;
      }
    };
  }

  var nav = document.getElementById('module-nav');
  if (nav) {
    var modules = [
      { num: '00', name: 'Intro', url: '../00_crystal_to_quantum/index.html' },
      { num: '01', name: 'QHO', url: '../01_qho/index.html' },
      { num: '02', name: 'Hydrogen', url: '../02_hydrogen/index.html' },
      { num: '03', name: 'Spin-1/2', url: '../03_spin/index.html' },
      { num: '04', name: 'KP Model', url: '../04_kronig_penney/index.html' },
      { num: '05', name: 'Bands', current: true },
      { num: '06', name: 'Fermi', url: '../06_fermi_surface/index.html' },
      { num: '07', name: 'Conductivity', url: '../07_conductivity/index.html' },
      { num: '08', name: 'Supercon.', url: '../08_superconductivity/index.html' },
      { num: '09', name: 'Intrinsic', url: '../09_intrinsic_semiconductors/index.html' },
      { num: '10', name: 'Doped', url: '../10_doped_semiconductors/index.html' },
      { num: '11', name: 'Junctions', url: '../11_junctions_devices/index.html' },
      { num: '12', name: 'Optics', url: '../12_optics_dispersion/index.html' },
      { num: '13', name: 'Laser', url: '../13_laser_physics/index.html' },
      { num: '14', name: 'Magnetism', url: '../14_magnetism/index.html' },
      { num: '15', name: 'Thermal', url: '../15_thermal_properties/index.html' }
    ];
    modules.forEach(function(m) {
      var el = document.createElement(m.current ? 'div' : 'a');
      if (!m.current) { el.href = m.url; el.style.textDecoration = 'none'; }
      el.style.cssText = 'display:block;padding:0.5rem 0.7rem;border-radius:8px;margin-bottom:0.3rem;font-size:0.85rem;';
      if (m.current) { el.style.background = 'rgba(255,64,129,0.08)'; el.style.border = '1px solid rgba(255,64,129,0.3)'; el.style.color = '#ff4ecd'; el.textContent = m.num + '. ' + m.name + ' (here)'; }
      else { el.style.background = 'var(--bg-elevated)'; el.style.border = '1px solid var(--border-subtle)'; el.style.color = 'var(--text-dim)'; el.textContent = m.num + '. ' + m.name; }
      nav.appendChild(el);
    });
  }
  var xpEl = document.getElementById('stat-xp'); if (xpEl) xpEl.textContent = __GameState.xp();
  var navXp = document.getElementById('nav-xp'); if (navXp) navXp.textContent = __GameState.xp() + ' XP';
});

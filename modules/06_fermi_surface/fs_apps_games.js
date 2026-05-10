/**
 * fs_apps_games.js — Fermi Surface Lab: gamified simulations
 * Module 06 — Fermi Surface & Fermi-Dirac Statistics
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

var __FS = {
  T: 300, EF: 5.0, n: 1e28,
  challenge: { active: false, score: 0, combo: 0, timeLeft: 60, streak: 0, timer: null },
  debyeGuess: 0,
  landauGuess: 0,
  tempRaceTarget: 1000
};

var kB_eV = 8.617333e-5;
function fermiDirac(E, mu, T) {
  if (T <= 0) return E < mu ? 1 : (E > mu ? 0 : 0.5);
  var x = (E - mu) / (kB_eV * T);
  if (x > 20) return 0;
  if (x < -20) return 1;
  return 1 / (1 + Math.exp(x));
}
function chemicalPotential(EF, T) {
  var TF = EF / kB_eV;
  if (T > TF * 0.5) return EF * 0.5;
  var r = kB_eV * T / EF;
  return EF * (1 - (Math.PI * Math.PI / 12) * r * r);
}
function linspace(a, b, n) { var arr = new Array(n); for (var i = 0; i < n; i++) arr[i] = a + i * (b - a) / (n - 1); return arr; }
function deBroglie(T) {
  var m = 9.109e-31, kB = 1.381e-23, h = 6.626e-34;
  return (h / Math.sqrt(2 * Math.PI * m * kB * T)) * 1e9;
}

// ===== PLAYGROUND: Fermi-Dirac smearing =====
function plotFDPlayground(T) {
  __FS.T = T;
  var mu = chemicalPotential(__FS.EF, T);
  var E = linspace(__FS.EF * -0.5, __FS.EF * 2.5, 200);
  var f_FD = E.map(function(e) { return fermiDirac(e, mu, T); });
  var f_MB = E.map(function(e) { return Math.exp(-(e - mu) / (kB_eV * T)); });

  Plotly.react('plot-fd', [
    { x: E, y: f_FD, mode: 'lines', name: 'Fermi-Dirac', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' },
    { x: E, y: f_MB, mode: 'lines', name: 'Maxwell-Boltzmann', line: { color: '#ff4ecd', width: 2, dash: 'dash' } },
    { x: [mu, mu], y: [0, 1], mode: 'lines', line: { color: '#facc15', width: 2, dash: 'dot' }, name: '\u03bc = ' + mu.toFixed(2) + ' eV' },
    { x: [__FS.EF, __FS.EF], y: [0, 1], mode: 'lines', line: { color: '#4ade80', width: 1, dash: 'dot' }, name: 'E_F = 5.0 eV' }
  ], _ext(_dLayout, {
    title: { text: 'Fermi-Dirac Distribution at T = ' + T + ' K (\u03bc = ' + mu.toFixed(3) + ' eV)', font: { size: 13 } },
    xaxis: { title: 'E (eV)' },
    yaxis: { title: 'f(E)' },
    legend: { x: 0.5, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' }
  }), { responsive: true, displayModeBar: false });

  // Update readout
  var del = deBroglie(T);
  var dEl = document.getElementById('live-debroglie');
  if (dEl) dEl.textContent = (del < 10 ? del.toFixed(2) : del.toFixed(1)) + ' nm';
  var muEl = document.getElementById('live-mu');
  if (muEl) muEl.textContent = mu.toFixed(3) + ' eV';
  var smearEl = document.getElementById('live-smear');
  if (smearEl) smearEl.textContent = (kB_eV * T * 1000).toFixed(1) + ' meV';
}

function plotFermi3D() {
  // Wireframe Fermi sphere cross-section (k_z = 0)
  var theta = linspace(0, 2 * Math.PI, 100);
  var kF = Math.sqrt(2 * __FS.EF);
  var x = theta.map(function(t) { return kF * Math.cos(t); });
  var y = theta.map(function(t) { return kF * Math.sin(t); });
  // Smearing shell
  var dT = kB_eV * __FS.T * 0.5;
  var xs = theta.map(function(t) { return (kF + dT) * Math.cos(t); });
  var ys = theta.map(function(t) { return (kF + dT) * Math.sin(t); });

  Plotly.react('plot-fermi-3d', [
    { x: x, y: y, mode: 'lines', name: 'k_F', line: { color: '#00f0ff', width: 3 } },
    { x: xs, y: ys, mode: 'lines', name: 'Thermal shell', line: { color: '#ff4ecd', width: 1.5, dash: 'dash' } }
  ], _ext(_dLayout, {
    title: { text: 'Fermi Sphere Cross-section (k_z = 0) · k_F = ' + kF.toFixed(2), font: { size: 13 } },
    xaxis: { title: 'k_x', scaleanchor: 'y' },
    yaxis: { title: 'k_y' },
    shapes: [{ type: 'circle', x0: -kF, x1: kF, y0: -kF, y1: kF, xref: 'x', yref: 'y', fillcolor: 'rgba(0,212,255,0.04)', line: { color: '#00f0ff', width: 0 } }]
  }), { responsive: true, displayModeBar: false });
}

// ===== CHALLENGE 1: TEMPERATURE RACE =====
function startTempRace() {
  var c = __FS.challenge;
  c.active = true; c.score = 0; c.combo = 0; c.timeLeft = 60; c.streak = 0;
  c.raceTarget = Math.floor(200 + Math.random() * 1000);
  document.getElementById('temp-race-target').textContent = 'Set \u03bc to match T = ' + c.raceTarget + ' K';
  document.getElementById('temp-race-feedback').style.display = 'none';
  if (c.timer) clearInterval(c.timer);
  c.timer = setInterval(function() {
    c.timeLeft--;
    var bar = document.getElementById('temp-race-timer');
    if (bar) { bar.style.width = (c.timeLeft / 60 * 100) + '%'; }
    if (c.timeLeft <= 0) { clearInterval(c.timer); c.active = false;
      document.getElementById('temp-race-feedback').textContent = '⏰ Time\'s up! Score: ' + c.score;
    }
  }, 1000);
}

function guessTempRace() {
  var c = __FS.challenge;
  if (!c.active) return;
  var guessT = parseFloat(document.getElementById('slider-temp-race').value);
  var mu = chemicalPotential(__FS.EF, guessT);
  var targetMu = chemicalPotential(__FS.EF, c.raceTarget);
  var err = Math.abs(mu - targetMu);
  var fb = document.getElementById('temp-race-feedback');
  if (err < 0.03) {
    c.streak++; var pts = 50 + c.streak * 5;
    c.score += pts; c.combo++;
    __GameState.addXP(pts, 'Temperature matched!');
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Excellent! T = ' + guessT + ' K gives μ = ' + mu.toFixed(3) + ' eV. +' + pts + ' XP';
    particleBurst(window.innerWidth / 2, 300);
    if (c.score >= 200) __GameState.unlock({ id: 'temp_racer', title: 'Temperature Racer', desc: 'Scored 200+ matching chemical potential', icon: '🌡', xp: 25 });
    setTimeout(startTempRace, 1500);
  } else {
    c.streak = 0; c.combo = 0;
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ μ = ' + mu.toFixed(3) + ' eV. Target μ(' + c.raceTarget + ' K) = ' + targetMu.toFixed(3) + ' eV. At low T, μ ≈ E_F[1 - (π²/12)(kT/E_F)²].';
  }
  document.getElementById('temp-race-score').textContent = c.score;
  document.getElementById('temp-race-combo').textContent = c.combo;
}

// ===== CHALLENGE 2: DEBYE THETA DETECTOR =====
function checkDebyeGuess() {
  var guess = parseFloat(document.getElementById('debye-guess').value);
  var fb = document.getElementById('debye-feedback');
  // Typical Debye temps: Cu 315, Pb 105, Al 394, Diamond 2230
  var material = { name: 'Cu', theta: 315 };
  var err = Math.abs(guess - material.theta) / material.theta;
  if (err < 0.2) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '✓ Great guess! Cu: \u03b8_D = 315 K. Diamond: 2230 K. Pb: 105 K. At T ≪ \u03b8_D, C_v = (12π⁴/5)Nk_B(T/\u03b8_D)³. This probes the phonon DOS.';
    __GameState.addXP(75, 'Debye temperature identified!');
    __GameState.unlock({ id: 'fermi_hunter', title: 'Fermi Hunter', desc: 'Identified Debye temperature', icon: '🎯', xp: 25 });
    particleBurst(window.innerWidth / 2, 350, '#facc15');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ Off. Cu has \u03b8_D ~ 300 K. Heavy elements (Pb) have low \u03b8_D, stiff lattices (diamond) have high \u03b8_D. C_v ∝ T³ at low T.';
  }
}

// ===== CHALLENGE 3: HEAVY FERMION GAMMA =====
function checkHeavyFermion() {
  var guess = document.getElementById('heavy-guess').value;
  var fb = document.getElementById('heavy-feedback');
  if (guess === 'large') {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '✓ Correct! Heavy fermions (CePb₃, UPt₃) have σ ∝ T with enormous coefficient γ because m* ~ 100-1000 m_e. Linear specific heat ∝ m* tells you the quasiparticle mass directly.';
    __GameState.addXP(100, 'Heavy fermion recognized!');
    __GameState.unlock({ id: 'heavy_fermion', title: 'Heavy Fermion', desc: 'Identified heavy-fermion signature', icon: '⚡', xp: 30 });
    particleBurst(window.innerWidth / 2, 300, '#c084fc');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ Heavy fermions have m* ≫ m_e. The Sommerfeld coefficient γ ∝ m*. So σ = γT with huge γ.';
  }
}

// ===== PUZZLE 1: OCCUPATION STATE COUNTING =====
var landauLevels = [0, 1, 2, 3, 4, 5];
function initLandauPuzzle() {
  var c = document.getElementById('landau-list');
  c.innerHTML = '';
  var B = parseFloat(document.getElementById('slider-landau-B').value) || 1;
  document.getElementById('val-landau-B').textContent = B.toFixed(1);
  landauLevels.forEach(function(n) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:1rem;padding:0.5rem;border-bottom:1px solid var(--border-subtle);';
    var label = document.createElement('div');
    label.style.cssText = 'font-family:var(--mono);font-size:0.85rem;color:var(--text-main);width:100px;';
    label.textContent = 'n = ' + n;
    var sel = document.createElement('select');
    sel.id = 'landau-' + n;
    sel.style.cssText = 'background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;font-family:var(--mono);';
    for (var s = 0; s <= 2; s++) { var o = document.createElement('option'); o.value = s; o.textContent = s + ' electrons'; sel.appendChild(o); }
    row.appendChild(label); row.appendChild(sel); c.appendChild(row);
  });
}

function checkLandauPuzzle() {
  var correct = 0;
  landauLevels.forEach(function(n) {
    var v = parseInt(document.getElementById('landau-' + n).value);
    // Each Landau level has spin degeneracy g=2, so 2 electrons if below E_F
    if (n === 0) { if (v === 1) correct++; } else { if (v === 2) correct++; }
  });
  var fb = document.getElementById('landau-feedback');
  if (correct === landauLevels.length) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Correct! Each Landau level holds 2 electrons (spin up/down) except the zero-energy mode which holds 1. This gives the quantum Hall effect: Hall conductance = νe²/h where ν is the filling factor.';
    __GameState.addXP(80, 'Landau levels counted!');
  } else { fb.className = 'challenge-feedback error'; fb.style.display = 'block'; fb.textContent = '✗ Off. Each LL has 2-fold spin degeneracy. n=0 is special: only 1 state at E=0 (no spin splitting).'; }
}

// ===== PUZZLE 2: FD vs MB DRAG =====
var dragPairs = [
  { label: 'Degenerate electron gas at 4 K', ans: 'FD' },
  { label: 'Classical ideal gas at 300 K', ans: 'MB' },
  { label: 'Neutron star matter at 10⁸ K', ans: 'FD' },
  { label: 'Air molecules in a room', ans: 'MB' },
  { label: 'Conduction electrons in Cu at 300 K', ans: 'FD' }
];

function initFDvsMB() {
  var pool = document.getElementById('fdmb-pool');
  var zones = document.getElementById('fdmb-zones');
  if (!pool || !zones) return;
  pool.innerHTML = '';
  dragPairs.forEach(function(p, i) {
    var el = document.createElement('div');
    el.className = 'draggable-target'; el.draggable = true;
    el.dataset.ans = p.ans;
    el.innerHTML = '<div style="font-size:0.85rem;color:var(--text-main);">' + p.label + '</div>';
    el.ondragstart = function(e) { e.dataTransfer.setData('text', p.ans); };
    pool.appendChild(el);
  });
  ['Fermi-Dirac', 'Maxwell-Boltzmann'].forEach(function(name) {
    var zone = document.createElement('div');
    zone.className = 'drop-zone'; zone.dataset.type = name === 'Fermi-Dirac' ? 'FD' : 'MB';
    zone.innerHTML = '<strong>' + name + '</strong><br/><span style="font-size:0.75rem;color:var(--text-dim);">Drop here</span>';
    zone.ondrop = function(e) {
      e.preventDefault(); var ans = e.dataTransfer.getData('text');
      if (ans === zone.dataset.type) { zone.classList.add('correct'); zone.innerHTML = '<strong>' + name + '</strong> ✓'; }
      else { zone.classList.add('wrong'); }
    };
    zone.ondragover = function(e) { e.preventDefault(); };
    zones.appendChild(zone);
  });
}

function checkFDvsMB() {
  var correct = document.querySelectorAll('#fdmb-zones .drop-zone.correct').length;
  var fb = document.getElementById('fdmb-feedback');
  if (correct === 2) { fb.className = 'challenge-feedback success'; fb.style.display = 'block'; fb.textContent = '✓ Perfect! Fermions (electrons, protons, neutrons) obey Pauli exclusion → FD. Classical distinguishable particles → MB.'; __GameState.addXP(60, 'FD vs MB mastered!'); }
  else { fb.className = 'challenge-feedback error'; fb.style.display = 'block'; fb.textContent = '✗ Some misclassified. Rule of thumb: electrons always FD, atoms in air MB.'; }
}

// ===== PUZZLE 3: WIEDEMANN-FRANZ CHECK =====
function checkWiedemannFranz() {
  var guess = document.getElementById('wf-guess').value;
  var fb = document.getElementById('wf-feedback');
  if (guess === 'yes') {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '✓ Correct! Wiedemann-Franz law: κ/(σT) = L = (π²/3)(k_B/e)² = 2.44×10⁻⁸ WΩ/K². It holds for metals where electrons carry both charge and heat. Violated in semiconductors (phonons dominate κ) and phonon-mediated superconductors.';
    __GameState.addXP(100, 'W-F law verified!');
    __GameState.unlock({ id: 'wf_guardian', title: 'W-F Guardian', desc: 'Verified Wiedemann-Franz law', icon: '🛡', xp: 30 });
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ The W-F law is a universal result for Fermi liquids. The Lorenz number L depends only on fundamental constants!';
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  var tSlider = document.getElementById('slider-T');
  if (tSlider) {
    tSlider.addEventListener('input', function(e) {
      __FS.T = parseInt(e.target.value);
      document.getElementById('val-T').textContent = __FS.T;
      plotFDPlayground(__FS.T);
      plotFermi3D();
    });
  }
  if (document.getElementById('plot-fd')) {
    plotFDPlayground(300);
    plotFermi3D();
  }

  if (typeof setGameMode === 'function') {
    var orig = setGameMode;
    setGameMode = function(mode) {
      orig(mode);
      if (mode === 'challenge') { startTempRace(); }
      if (mode === 'puzzle') { initLandauPuzzle(); initFDvsMB(); }
    };
  }

  var nav = document.getElementById('module-nav');
  if (nav) {
    var modules = [
      { num: '01', name: 'QHO', url: '../01_qho/index.html' },
      { num: '02', name: 'Hydrogen', url: '../02_hydrogen/index.html' },
      { num: '03', name: 'Spin-1/2', url: '../03_spin/index.html' },
      { num: '04', name: 'KP Model', url: '../04_kronig_penney/index.html' },
      { num: '05', name: 'Bands', url: '../05_energy_bands/index.html' },
      { num: '06', name: 'Fermi', current: true },
      { num: '07', name: 'Conductivity', url: '../07_conductivity/index.html' }
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

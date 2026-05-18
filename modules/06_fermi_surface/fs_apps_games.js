/**
 * fs_apps_games.js — Fermi Surface Lab: gamified simulations
 * Module 06 — Fermi Surface & Fermi-Dirac Statistics
 * ES5-safe
 */

'use strict';

// ===== MODULE NAV (16 modules) =====
var FS_MODULE_NAV = [
  { name: 'Crystal to Quantum', path: '../00_crystal_to_quantum/index.html' },
  { name: 'QHO',                path: '../01_qho/index.html' },
  { name: 'Hydrogen',           path: '../02_hydrogen/index.html' },
  { name: 'Spin-1/2',           path: '../03_spin/index.html' },
  { name: 'KP Model',           path: '../04_kronig_penney/index.html' },
  { name: 'Bands',              path: '../05_energy_bands/index.html' },
  { name: 'Fermi',              path: './index.html', current: true },
  { name: 'Conductivity',       path: '../07_conductivity/index.html' },
  { name: 'Superconductivity',  path: '../08_superconductivity/index.html' },
  { name: 'Doped Semiconductors', path: '../10_doped_semiconductors/index.html' },
  { name: 'Junctions',          path: '../11_junctions_devices/index.html' },
  { name: 'Optics',             path: '../12_optics_dispersion/index.html' },
  { name: 'Laser Physics',      path: '../13_laser_physics/index.html' },
  { name: 'Magnetism',          path: '../14_magnetism/index.html' },
  { name: 'Nanostructures',     path: '../15_nanostructures/index.html' },
  { name: 'Quantum Computing',  path: '../16_quantum_computing/index.html' }
];

// ===== BADGES =====
var FS_BADGES = [
  { id: 'fs-explorer',  name: 'Fermi Explorer',  desc: 'First playground session',     icon: '\uD83D\uDD2E', xp: 10 },
  { id: 'temp_racer',   name: 'Temperature Racer', desc: 'Scored 200+ in temperature race', icon: '\uD83C\uDF21', xp: 25 },
  { id: 'fermi_hunter', name: 'Fermi Hunter',    desc: 'Identified Debye temperature',  icon: '\uD83C\uDFAF', xp: 25 },
  { id: 'heavy_fermion',name: 'Heavy Fermion',   desc: 'Identified heavy-fermion signature', icon: '\u26A1', xp: 30 },
  { id: 'wf_guardian',  name: 'W-F Guardian',    desc: 'Verified Wiedemann-Franz law',  icon: '\uD83D\uDEE1', xp: 30 }
];

function renderFSBadges() {
  var bl = document.getElementById('badge-list');
  if (!bl) return;
  var earned = [];
  if (window._GameState && _GameState.earnedBadges) { earned = _GameState.earnedBadges; }
  if (!Array.isArray(earned) && earned && typeof earned.forEach === 'undefined') { earned = Array.from(earned); }
  if (!Array.isArray(earned)) earned = [];
  bl.innerHTML = '';
  FS_BADGES.forEach(function(b) {
    var earnedBadge = false;
    for (var i = 0; i < earned.length; i++) { if (earned[i] === b.id) { earnedBadge = true; break; } }
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0;font-size:0.78rem;';
    if (earnedBadge) {
      var icon = document.createElement('span');
      icon.textContent = b.icon + ' ';
      div.appendChild(icon);
      var name = document.createElement('span');
      name.style.color = 'var(--accent-green)';
      name.textContent = b.name;
      div.appendChild(name);
    } else {
      var icon2 = document.createElement('span');
      icon2.textContent = '⬜ ';
      div.appendChild(icon2);
      var name2 = document.createElement('span');
      name2.style.color = 'var(--text-dim)';
      name2.textContent = b.name;
      div.appendChild(name2);
    }
    bl.appendChild(div);
  });
}

function updateFSScoreboard() {
  var xp = 0, ch = 0, pz = 0, bd = 0;
  if (window._GameState) {
    xp = typeof _GameState.xp === 'function' ? _GameState.xp() : (_GameState.xp || 0);
    ch = _GameState.challengesDone || 0;
    pz = _GameState.puzzlesDone || 0;
    bd = (_GameState.earnedBadges && Array.isArray(_GameState.earnedBadges)) ? _GameState.earnedBadges.length : 0;
  }
  var el = document.getElementById('stat-xp');    if (el) el.textContent = xp;
  var el2 = document.getElementById('stat-challenges'); if (el2) el2.textContent = ch;
  var el3 = document.getElementById('stat-puzzles');     if (el3) el3.textContent = pz;
  var el4 = document.getElementById('stat-badges');      if (el4) el4.textContent = bd;
  var navXp = document.getElementById('nav-xp');
  if (navXp) navXp.textContent = xp + ' XP';
}

function fsAwardBadge(id) {
  if (window._GameState && _GameState.unlockBadge) {
    for (var i = 0; i < FS_BADGES.length; i++) { if (FS_BADGES[i].id === id) { _GameState.unlockBadge(FS_BADGES[i]); break; } }
  }
  renderFSBadges(); updateFSScoreboard();
}

function fsAddXP(amount, reason) {
  if (window._GameState && _GameState.addXP) { _GameState.addXP(amount, reason); }
  updateFSScoreboard();
}

// ===== GAME STATE LOCAL =====
var __FS = {
  T: 300, EF: 5.0,
  challenge: { active: false, score: 0, combo: 0, timeLeft: 60, streak: 0, timer: null, raceTarget: 1000 }
};

var fs_kB_eV = 8.617333e-5;
function fsChemicalPotential(EF, T) {
  var TF = EF / fs_kB_eV;
  if (T > TF * 0.5) return EF * 0.5;
  var r = fs_kB_eV * T / EF;
  return EF * (1 - (Math.PI * Math.PI / 12) * r * r);
}
function fsFermiDirac(E, mu, T) {
  if (T <= 0) return E < mu ? 1 : (E > mu ? 0 : 0.5);
  var x = (E - mu) / (fs_kB_eV * T);
  if (x > 20) return 0;
  if (x < -20) return 1;
  return 1 / (1 + Math.exp(x));
}

// ===== CHALLENGE 1: TEMPERATURE RACE =====
function startTempRace() {
  var c = __FS.challenge;
  c.active = true; c.score = 0; c.combo = 0; c.timeLeft = 60; c.streak = 0;
  c.raceTarget = Math.floor(200 + Math.random() * 1000);
  var tgt = document.getElementById('temp-race-target');
  if (tgt) tgt.textContent = 'Set mu to match target at T = ' + c.raceTarget + ' K';
  var fb = document.getElementById('temp-race-feedback');
  if (fb) fb.style.display = 'none';
  if (c.timer) clearInterval(c.timer);
  c.timer = setInterval(function() {
    c.timeLeft--;
    var bar = document.getElementById('temp-race-timer');
    if (bar) bar.style.width = (c.timeLeft / 60 * 100) + '%';
    if (c.timeLeft <= 0) { clearInterval(c.timer); c.active = false;
      var fb2 = document.getElementById('temp-race-feedback');
      if (fb2) { fb2.className = 'challenge-feedback error'; fb2.style.display = 'block'; fb2.textContent = "Time's up! Score: " + c.score; }
    }
  }, 1000);
}

function guessTempRace() {
  var c = __FS.challenge;
  if (!c.active) return;
  var guessT = Number.parseFloat(document.getElementById('slider-temp-race').value);
  var mu = fsChemicalPotential(__FS.EF, guessT);
  var targetMu = fsChemicalPotential(__FS.EF, c.raceTarget);
  var err = Math.abs(mu - targetMu);
  var fb = document.getElementById('temp-race-feedback');
  if (!fb) return;
  if (err < 0.03) {
    c.streak++; var pts = 50 + c.streak * 5;
    c.score += pts; c.combo++;
    fsAddXP(pts, 'Temperature matched!');
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '\u2713 Excellent! T = ' + Math.round(guessT) + ' K gives mu = ' + mu.toFixed(3) + ' eV. +' + pts + ' XP';
    if (c.score >= 200) fsAwardBadge('temp_racer');
    setTimeout(startTempRace, 1500);
  } else {
    c.streak = 0; c.combo = 0;
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '\u2717 mu = ' + mu.toFixed(3) + ' eV. Target mu(' + c.raceTarget + ' K) = ' + targetMu.toFixed(3) + ' eV.';
  }
  document.getElementById('temp-race-score').textContent = c.score;
  document.getElementById('temp-race-combo').textContent = c.combo;
}

// ===== CHALLENGE 2: DEBYE THETA =====
function checkDebyeGuess() {
  var guess = Number.parseFloat(document.getElementById('debye-guess').value);
  var fb = document.getElementById('debye-feedback');
  if (!fb) return;
  var material = { name: 'Cu', theta: 315 };
  var err = Math.abs(guess - material.theta) / material.theta;
  if (err < 0.2) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '\u2713 Great guess! Cu: theta_D = 315 K. Diamond: 2230 K. Pb: 105 K. At T ll theta_D, C_v ~ (12pi^4/5)Nk_B(T/theta_D)^3.';
    fsAddXP(75, 'Debye temperature identified!');
    fsAwardBadge('fermi_hunter');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '\u2717 Off. Cu has theta_D ~ 300 K. Heavy elements have low theta_D, stiff lattices have high.';
  }
}

// ===== CHALLENGE 3: HEAVY FERMION =====
function checkHeavyFermion(type) {
  var fb = document.getElementById('heavy-feedback');
  if (!fb) return;
  if (type === 'linear') {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '\u2713 Correct! Heavy fermions have C ~ gamma T with enormous gamma because m* ~ 100-1000 m_e.';
    fsAddXP(100, 'Heavy fermion recognised!');
    fsAwardBadge('heavy_fermion');
  } else if (type === 'exp') {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '\u2717 Not exponential. Heavy fermions are Fermi liquids with m* much larger than m_e.';
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '\u2717 Not constant. The Sommerfeld coefficient gamma ~ m*. So C = gamma T with huge gamma.';
  }
}

// ===== PUZZLE 1: LANDAU LEVELS =====
var landauLevels = [0, 1, 2, 3, 4, 5];
function initLandauPuzzle() {
  var c = document.getElementById('landau-list');
  if (!c) return;
  c.innerHTML = '';
  var B = Number.parseFloat(document.getElementById('slider-landau-B').value) || 1;
  var vB = document.getElementById('val-landau-B'); if (vB) vB.textContent = B.toFixed(1);
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
  for (var i = 0; i < landauLevels.length; i++) {
    var n = landauLevels[i];
    var v = Number.parseInt(document.getElementById('landau-' + n).value);
    if (n === 0) { if (v === 1) correct++; } else { if (v === 2) correct++; }
  }
  var fb = document.getElementById('landau-feedback');
  if (!fb) return;
  if (correct === landauLevels.length) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '\u2713 Correct! Each LL holds 2 electrons except n=0 (1 state at E=0). Quantum Hall effect: sigma_xy = nu e^2/h.';
    fsAddXP(80, 'Landau levels counted!');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '\u2717 Off. Each LL has 2-fold spin degeneracy. n=0 is special: only 1 state at E=0.';
  }
}

// ===== PUZZLE 2: FD vs MB DRAG =====
var dragPairs = [
  { label: 'Degenerate electron gas at 4 K', ans: 'FD' },
  { label: 'Classical ideal gas at 300 K',    ans: 'MB' },
  { label: 'Neutron star matter at 10^8 K',   ans: 'FD' },
  { label: 'Air molecules in a room',           ans: 'MB' },
  { label: 'Conduction electrons in Cu at 300 K', ans: 'FD' }
];

function initFDvsMB() {
  var pool = document.getElementById('fdmb-pool');
  var zones = document.getElementById('fdmb-zones');
  if (!pool || !zones) return;
  pool.innerHTML = '';
  zones.innerHTML = '';
  dragPairs.forEach(function(p) {
    var el = document.createElement('div');
    el.className = 'draggable-target'; el.draggable = true;
    el.dataset.ans = p.ans;
    el.innerHTML = '\u003cdiv style="font-size:0.85rem;color:var(--text-main);"\u003e' + p.label + '\u003c/div\u003e';
    el.ondragstart = function(e) { e.dataTransfer.setData('text', p.ans); };
    pool.appendChild(el);
  });
  ['Fermi-Dirac', 'Maxwell-Boltzmann'].forEach(function(name) {
    var zone = document.createElement('div');
    zone.className = 'drop-zone';
    zone.dataset.type = name === 'Fermi-Dirac' ? 'FD' : 'MB';
    zone.innerHTML = '\u003cstrong\u003e' + name + '\u003c/strong\u003e\u003cbr/\u003e\u003cspan style="font-size:0.75rem;color:var(--text-dim);"\u003eDrop here\u003c/span\u003e';
    zone.ondrop = function(e) {
      e.preventDefault(); var ans = e.dataTransfer.getData('text');
      if (ans === zone.dataset.type) { zone.classList.add('correct'); zone.innerHTML = '\u003cstrong\u003e' + name + '\u003c/strong\u003e \u2713'; }
      else { zone.classList.add('wrong'); }
    };
    zone.ondragover = function(e) { e.preventDefault(); };
    zones.appendChild(zone);
  });
}

function checkFDvsMB() {
  var correct = document.querySelectorAll('#fdmb-zones .drop-zone.correct').length;
  var fb = document.getElementById('fdmb-feedback');
  if (!fb) return;
  if (correct === 2) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '\u2713 Perfect! Fermions obey Pauli exclusion: FD. Classical distinguishable particles: MB.';
    fsAddXP(60, 'FD vs MB mastered!');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '\u2717 Some misclassified. Rule: electrons always FD, atoms in air MB.';
  }
}

// ===== PUZZLE 3: WIEDEMANN-FRANZ =====
function checkWiedemannFranz() {
  var guess = document.getElementById('wf-guess').value;
  var fb = document.getElementById('wf-feedback');
  if (!fb) return;
  if (guess === 'metals') {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '\u2713 Correct! W-F law: kappa/(sigma T) = L = (pi^2/3)(k_B/e)^2 = 2.44x10^{-8} WOmega/K^2. Holds for metals where electrons carry both charge and heat. Violated in semiconductors (phonons carry heat) and superconductors.';
    fsAddXP(100, 'W-F law verified!');
    fsAwardBadge('wf_guardian');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    if (guess === 'all') fb.textContent = '\u2717 Not for ALL materials. It fails in semiconductors and phonon-dominated systems.';
    else fb.textContent = '\u2717 The W-F law IS a universal result for Fermi liquids. The Lorenz number depends only on fundamental constants!';
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  // Wire landau slider (challenge/puzzle only)
  var sLandau = document.getElementById('slider-landau-B');
  if (sLandau) {
    sLandau.addEventListener('input', function() {
      var v = document.getElementById('val-landau-B');
      if (v) v.textContent = Number.parseFloat(this.value).toFixed(1);
    });
  }

  // Wire temp race slider
  var sRace = document.getElementById('slider-temp-race');
  if (sRace) {
    sRace.addEventListener('input', function() {
      var v = document.getElementById('val-temp-race');
      if (v) v.textContent = this.value;
    });
  }

  // Module NAV
  var nav = document.getElementById('module-nav');
  if (nav) {
    FS_MODULE_NAV.forEach(function(m) {
      var el = document.createElement(m.current ? 'div' : 'a');
      if (!m.current) {
        el.href = m.path; el.style.textDecoration = 'none';
        el.onclick = function() { if (_GameState && _GameState.save) _GameState.save(); };
      }
      el.style.cssText = 'display:block;padding:0.5rem 0.7rem;border-radius:8px;margin-bottom:0.3rem;font-size:0.85rem;';
      if (m.current) {
        el.style.background = 'rgba(255,64,129,0.08)'; el.style.border = '1px solid rgba(255,64,129,0.3)';
        el.style.color = '#ff4ecd'; el.textContent = m.name + ' (here)';
      } else {
        el.style.background = 'var(--bg-elevated)'; el.style.border = '1px solid var(--border-subtle)';
        el.style.color = 'var(--text-dim)'; el.textContent = m.name;
      }
      nav.appendChild(el);
    });
  }

  // GameState wrapper for mode switching
  if (typeof setGameMode === 'function') {
    var orig = setGameMode;
    window.setGameMode = function(mode) {
      orig(mode);
      if (mode === 'challenge') { startTempRace(); }
      if (mode === 'puzzle') { initLandauPuzzle(); initFDvsMB(); }
    };
  }

  renderFSBadges(); updateFSScoreboard();
});

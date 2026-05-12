/**
 * Intrinsic Semiconductors — Games: Challenges + Puzzles
 */

'use strict';

/* ---- Module Nav ---- */
var IS_MODULE_NAV = [
  { name: 'Crystal to Quantum', path: '../00_crystal_to_quantum/index.html', current: false },
  { name: 'QHO', path: '../01_qho/index.html', current: false },
  { name: 'Hydrogen', path: '../02_hydrogen/index.html', current: false },
  { name: 'Spin', path: '../03_spin/index.html', current: false },
  { name: 'Kronig-Penney', path: '../04_kronig_penney/index.html', current: false },
  { name: 'Energy Bands', path: '../05_energy_bands/index.html', current: false },
  { name: 'Fermi Surface', path: '../06_fermi_surface/index.html', current: false },
  { name: 'Conductivity', path: '../07_conductivity/index.html', current: false },
  { name: 'Superconductivity', path: '../08_superconductivity/index.html', current: false },
  { name: 'Intrinsic Semi', path: './index.html', current: true },
  { name: 'Doped Semi', path: '../10_doped_semiconductors/index.html', current: false },
  { name: 'Junctions', path: '../11_junctions_devices/index.html', current: false },
  { name: 'Optics', path: '../12_optics_dispersion/index.html', current: false },
  { name: 'Lasers', path: '../13_laser_physics/index.html', current: false },
  { name: 'Magnetism', path: '../14_magnetism/index.html', current: false },
  { name: 'Thermal', path: '../15_thermal_properties/index.html', current: false }
];

function buildModuleNavIS() {
  var el = document.getElementById('module-nav');
  if (!el) return;
  el.innerHTML = '';
  IS_MODULE_NAV.forEach(function(m) {
    var a = document.createElement('a');
    a.href = m.path;
    a.textContent = m.name;
    a.className = 'nav-link' + (m.current ? ' current' : '');
    if (m.current) a.style.fontWeight = '700';
    el.appendChild(a);
  });
}

/* ---- Badges ---- */
var IS_BADGES = [
  { id: 'is-explorer', name: 'Band-Gap Explorer', desc: 'First playground exploration', icon: '💎' },
  { id: 'intrinsic-guru', name: 'Intrinsic Guru', desc: '3 correct in semiconductor/insulator challenge', icon: '🎯' },
  { id: 'thermal-engineer', name: 'Thermal Engineer', desc: 'Temperature trend challenge completed', icon: '🌡' },
  { id: 'formula-builder', name: 'Formula Builder', desc: 'Built conductivity formula', icon: '🔧' },
  { id: 'fermi-architect', name: 'Fermi Architect', desc: 'Placed Fermi levels correctly', icon: '📐' },
  { id: 'optical-matchmaker', name: 'Optical Matchmaker', desc: 'Matched all optical excitations', icon: '💡' }
];

function renderBadgesIS() {
  var el = document.getElementById('badge-list');
  if (!el || !window._GameState) return;
  var s = _GameState.earnedBadges;
  var earned = IS_BADGES.filter(function(b) { return s.has(b.id); });
  var pending = IS_BADGES.filter(function(b) { return !s.has(b.id); });
  var html = '';
  if (earned.length) {
    html += '<div style="margin-bottom:0.5rem;color:var(--accent-green);">✨ Earned:</div>';
    earned.forEach(function(b) {
      html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:rgba(0,240,255,0.08);border:1px solid var(--accent-cyan);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>';
    });
  }
  if (pending.length) {
    html += '<div style="margin:0.5rem 0;color:var(--text-dim);">🔒 Pending:</div>';
    pending.forEach(function(b) {
      html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-dim);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>';
    });
  }
  el.innerHTML = html || 'Complete challenges to earn badges!';
}

function updateScoreboardIS() {
  if (!window._GameState) return;
  var challenges = _GameState.moduleScores['is_challenges'] || 0;
  var puzzles = _GameState.moduleScores['is_puzzles'] || 0;
  var elCh = document.getElementById('stat-challenges');
  var elPuz = document.getElementById('stat-puzzles');
  var elXP = document.getElementById('stat-xp');
  var elBad = document.getElementById('stat-badges');
  if (elCh) elCh.textContent = challenges;
  if (elPuz) elPuz.textContent = puzzles;
  if (elXP) elXP.textContent = _GameState.xp;
  if (elBad) elBad.textContent = _GameState.earnedBadges.size;
  var elNav = document.getElementById('nav-xp');
  if (elNav) elNav.textContent = _GameState.xp + ' XP';
  renderBadgesIS();
}

/* ---- CHALLENGE 1: Intrinsic or Insulator ---- */
var isMatcher = {
  materials: [
    { name: 'Silicon (Si)', Eg: 1.12 },
    { name: 'Germanium (Ge)', Eg: 0.67 },
    { name: 'GaAs', Eg: 1.42 },
    { name: 'GaN', Eg: 3.4 },
    { name: 'Diamond (C)', Eg: 5.5 },
    { name: 'ZnO', Eg: 3.4 },
    { name: 'Silica (SiO₂)', Eg: 8.9 },
    { name: 'AlN', Eg: 6.0 }
  ],
  score: 0,
  combo: 0,
  timer: null,
  timeLeft: 15,
  current: null,
  streak: 0
};

function startIsMatcher() {
  var txt = document.getElementById('is-target-text');
  if (!txt) return;
  isMatcher.current = isMatcher.materials[Math.floor(Math.random() * isMatcher.materials.length)];
  txt.innerHTML = '<strong>' + isMatcher.current.name + '</strong> — Eg = ' + isMatcher.current.Eg + ' eV<br><span style="font-size:1.4rem;">Semiconductor or Insulator?</span>';
  isMatcher.timeLeft = 15;
  updateIsTimer();
  clearInterval(isMatcher.timer);
  isMatcher.timer = setInterval(function() {
    isMatcher.timeLeft -= 1;
    updateIsTimer();
    if (isMatcher.timeLeft <= 0) { clearInterval(isMatcher.timer); guessIntrinsic(true); }
  }, 1000);
}

function updateIsTimer() {
  var bar = document.getElementById('is-timer');
  if (bar) bar.style.width = (isMatcher.timeLeft / 15 * 100) + '%';
}

function guessIntrinsic(yes) {
  clearInterval(isMatcher.timer);
  var fb = document.getElementById('is-feedback');
  // semiconductor if Eg <= 3.5 eV roughly
  var correct = yes === (isMatcher.current.Eg <= 3.5);
  if (correct) {
    isMatcher.combo += 1;
    isMatcher.streak += 1;
    isMatcher.score += 50 + isMatcher.combo * 5;
    if (fb) { fb.innerHTML = '<span class="success">✓ Correct! Eg = ' + isMatcher.current.Eg + ' eV — ' + (isMatcher.current.Eg <= 3.5 ? 'semiconductor' : 'insulator') + '.</span>'; fb.style.display = 'block'; }
    if (window._GameState) {
      _GameState.addXP(50 + isMatcher.combo * 5, 'is_challenges');
      if (isMatcher.streak >= 3) _GameState.earnedBadges.add('intrinsic-guru');
      _GameState.save(); updateScoreboardIS();
    }
  } else {
    isMatcher.combo = 0; isMatcher.streak = 0;
    if (fb) { fb.innerHTML = '<span class="error">✗ Wrong. ' + isMatcher.current.name + ' with Eg = ' + isMatcher.current.Eg + ' eV is a ' + (isMatcher.current.Eg <= 3.5 ? 'semiconductor' : 'insulator') + '.</span>'; fb.style.display = 'block'; }
  }
  var elScore = document.getElementById('is-score');
  var elCombo = document.getElementById('is-combo');
  if (elScore) elScore.textContent = isMatcher.score;
  if (elCombo) elCombo.textContent = isMatcher.combo;
  setTimeout(startIsMatcher, 2000);
}

/* ---- CHALLENGE 2: Carrier Density Calculator ---- */
var ncChallenge = {
  pool: [
    { Eg: 1.12, T: 300, Nc: 2.8e19, Nv: 1.04e19 },
    { Eg: 0.67, T: 300, Nc: 1.04e19, Nv: 6.0e18 },
    { Eg: 1.42, T: 300, Nc: 4.7e17, Nv: 7.0e18 },
    { Eg: 0.67, T: 400, Nc: 1.5e19, Nv: 8.5e18 }
  ],
  current: null
};

function startNcChallenge() {
  var txt = document.getElementById('nd-target-text');
  if (!txt) return;
  ncChallenge.current = ncChallenge.pool[Math.floor(Math.random() * ncChallenge.pool.length)];
  var c = ncChallenge.current;
  txt.innerHTML = 'Eg = ' + c.Eg + ' eV, T = ' + c.T + ' K<br>Nc = ' + c.Nc.toExponential(1) + ' cm⁻³, Nv = ' + c.Nv.toExponential(1) + ' cm⁻³<br><span style="font-size:0.9rem;">Estimate ni ≈ √(Nc·Nv)·exp(-Eg/2kT)</span>';
  document.getElementById('nd-answer').value = '';
}

function checkNCAnswer() {
  var valStr = document.getElementById('nd-answer').value;
  var fb = document.getElementById('nd-feedback');
  var c = ncChallenge.current;
  var kB = 8.617e-5;
  var ans = Math.sqrt(c.Nc * c.Nv) * Math.exp(-c.Eg / (2 * kB * c.T));
  var val = parseFloat(valStr);
  var correct = !isNaN(val) && Math.abs((val - ans) / ans) < 0.3;
  if (correct) {
    if (fb) { fb.innerHTML = '<span class="success">✓ Correct! ni ≈ ' + ans.toExponential(2) + ' cm⁻³.</span>'; fb.style.display = 'block'; }
    if (window._GameState) { _GameState.addXP(60, 'is_challenges'); _GameState.save(); updateScoreboardIS(); }
  } else {
    if (fb) { fb.innerHTML = '<span class="error">✗ Expected ≈ ' + ans.toExponential(2) + ' cm⁻³.</span>'; fb.style.display = 'block'; }
  }
  setTimeout(startNcChallenge, 2500);
}

/* ---- CHALLENGE 3: Temperature Trend ---- */
var trendChallenge = {
  pool: [
    { name: 'Silicon (intrinsic)', answer: 'rise', reason: 'Carrier density rises exponentially with T, outweighing mobility drop.' },
    { name: 'Copper (metal)', answer: 'fall', reason: 'In metals, phonon scattering increases with T, so resistivity rises.' },
    { name: 'Insulator (large Eg)', answer: 'rise', reason: 'Even insulators have some thermally excited carriers at high T; σ rises (very slightly).' },
    { name: 'Germanium (intrinsic)', answer: 'rise', reason: 'Same as Si: exponential carrier increase dominates.' }
  ],
  current: null
};

function startTrendChallenge() {
  var txt = document.getElementById('tt-target-text');
  if (!txt) return;
  trendChallenge.current = trendChallenge.pool[Math.floor(Math.random() * trendChallenge.pool.length)];
  txt.textContent = trendChallenge.current.name + ' — does conductivity rise or fall when T increases?';
}

function guessTrend(ans) {
  var fb = document.getElementById('tt-feedback');
  var correct = ans === trendChallenge.current.answer;
  if (correct) {
    if (fb) { fb.innerHTML = '<span class="success">✓ Correct! ' + trendChallenge.current.reason + '</span>'; fb.style.display = 'block'; }
    if (window._GameState) {
      _GameState.addXP(70, 'is_challenges');
      _GameState.earnedBadges.add('thermal-engineer');
      _GameState.save();
      updateScoreboardIS();
    }
  } else {
    if (fb) { fb.innerHTML = '<span class="error">✗ ' + trendChallenge.current.reason + '</span>'; fb.style.display = 'block'; }
  }
  setTimeout(startTrendChallenge, 2000);
}

/* ---- PUZZLE 1: Build Conductivity Formula ---- */
var condBuilder = {
  pool: [
    { label: 'e', id: 'e' },
    { label: 'n', id: 'n' },
    { label: 'μe', id: 'mue' },
    { label: 'p', id: 'p' },
    { label: 'μh', id: 'muh' },
    { label: '+', id: 'plus' },
    { label: '(', id: 'lp' },
    { label: ')', id: 'rp' }
  ],
  sequence: ['e', 'lp', 'n', 'mue', 'plus', 'p', 'muh', 'rp'],
  placed: []
};

function initCondBuilder() {
  var pool = document.getElementById('cond-pool');
  var zones = document.getElementById('cond-zones');
  if (!pool || !zones) return;
  pool.innerHTML = '';
  zones.innerHTML = '';
  condBuilder.placed = [];
  condBuilder.pool.forEach(function(item) {
    var d = document.createElement('div');
    d.className = 'draggable-target';
    d.textContent = item.label;
    d.dataset.id = item.id;
    d.draggable = true;
    d.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', item.id); });
    pool.appendChild(d);
  });
  condBuilder.sequence.forEach(function() {
    var z = document.createElement('div');
    z.className = 'drop-zone';
    z.textContent = '?';
    z.addEventListener('dragover', function(e) { e.preventDefault(); });
    z.addEventListener('drop', function(e) {
      e.preventDefault();
      var id = e.dataTransfer.getData('text/plain');
      var p = condBuilder.pool.find(function(x) { return x.id === id; });
      z.textContent = p ? p.label : '?';
      z.dataset.id = id;
    });
    zones.appendChild(z);
  });
}

function checkCondBuilder() {
  var zones = document.querySelectorAll('#cond-zones .drop-zone');
  var fb = document.getElementById('cond-feedback');
  var ok = true;
  zones.forEach(function(z, i) {
    if (z.dataset.id !== condBuilder.sequence[i]) ok = false;
  });
  if (ok) {
    if (fb) { fb.innerHTML = '<span class="success">✓ Correct! σ = e(nμe + pμh)</span>'; fb.style.display = 'block'; }
    if (window._GameState) {
      _GameState.addXP(60, 'is_puzzles');
      _GameState.earnedBadges.add('formula-builder');
      _GameState.save();
      updateScoreboardIS();
    }
  } else {
    if (fb) { fb.innerHTML = '<span class="error">✗ Some terms are out of order. Hint: σ = e(nμe + pμh).</span>'; fb.style.display = 'block'; }
    setTimeout(initCondBuilder, 1500);
  }
}

/* ---- PUZZLE 2: Fermi Level Placement ---- */
var fermiPuzzle = {
  pool: [
    { text: 'Intrinsic semiconductor at 300 K', answer: 'midgap' },
    { text: 'n-type semiconductor at low T', answer: 'upper' },
    { text: 'p-type semiconductor at low T', answer: 'lower' },
    { text: 'Undoped semiconductor at 0 K', answer: 'midgap' },
    { text: 'Heavily n-doped with shallow donors', answer: 'near-conduction' }
  ]
};

function initFermiPuzzle() {
  var list = document.getElementById('fermi-list');
  if (!list) return;
  list.innerHTML = '';
  fermiPuzzle.pool.forEach(function(item, i) {
    var row = document.createElement('div');
    row.style.cssText = 'margin:0.5rem 0;padding:0.5rem;background:var(--bg-elevated);border-radius:6px;font-size:0.85rem;';
    row.innerHTML = '<span style="color:var(--accent-cyan);">#' + (i + 1) + '</span> ' + item.text +
      '<br><select id="fermi-sel-' + i + '" style="margin-top:0.4rem;background:var(--bg-panel);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="" disabled selected>Choose...</option>' +
      '<option value="near-conduction">Near conduction band</option>' +
      '<option value="upper">Upper half of gap</option>' +
      '<option value="midgap">Middle of gap</option>' +
      '<option value="lower">Lower half of gap</option>' +
      '<option value="near-valence">Near valence band</option></select>';
    list.appendChild(row);
  });
}

function checkFermiPuzzle() {
  var fb = document.getElementById('fermi-feedback');
  var ok = true;
  fermiPuzzle.pool.forEach(function(item, i) {
    var sel = document.getElementById('fermi-sel-' + i);
    if (!sel || sel.value !== item.answer) ok = false;
  });
  if (ok) {
    if (fb) { fb.innerHTML = '<span class="success">✓ All correct! Intrinsic: midgap. n-type: upper. p-type: lower.</span>'; fb.style.display = 'block'; }
    if (window._GameState) {
      _GameState.addXP(70, 'is_puzzles');
      _GameState.earnedBadges.add('fermi-architect');
      _GameState.save();
      updateScoreboardIS();
    }
  } else {
    if (fb) { fb.innerHTML = '<span class="error">✗ Some placements are wrong. Hint: EF ≈ (Ec+Ev)/2 for intrinsic.</span>'; fb.style.display = 'block'; }
  }
}

/* ---- PUZZLE 3: Optical Excitation Match ---- */
var opticalPuzzle = {
  pool: [
    { material: 'Si (Eg = 1.12 eV)', lambda_nm: 1107 },
    { material: 'GaN (Eg = 3.4 eV)', lambda_nm: 365 },
    { material: 'Ge (Eg = 0.67 eV)', lambda_nm: 1851 },
    { material: 'GaAs (Eg = 1.42 eV)', lambda_nm: 873 },
    { material: 'ZnO (Eg = 2.4 eV)', lambda_nm: 517 }
  ]
};

function initOpticalPuzzle() {
  var list = document.getElementById('optical-list');
  if (!list) return;
  list.innerHTML = '';
  opticalPuzzle.pool.forEach(function(item, i) {
    var row = document.createElement('div');
    row.style.cssText = 'margin:0.5rem 0;padding:0.6rem;background:var(--bg-elevated);border-radius:6px;font-size:0.88rem;';
    row.innerHTML = '<span style="color:var(--accent-cyan);">#' + (i + 1) + '</span> ' + item.material +
      '<br><span style="font-size:0.8rem;color:var(--text-dim);">λ (nm) = hc/Eg ≈ 1240 / Eg[eV]</span>' +
      '<br><input type="number" id="opt-ans-' + i + '" placeholder="nm" style="width:120px;margin-top:0.4rem;background:var(--bg-panel);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;font-family:var(--font-mono);">';
    list.appendChild(row);
  });
}

function checkOpticalPuzzle() {
  var fb = document.getElementById('optical-feedback');
  var ok = true;
  opticalPuzzle.pool.forEach(function(item, i) {
    var inp = document.getElementById('opt-ans-' + i);
    if (!inp) { ok = false; return; }
    var val = parseFloat(inp.value);
    if (Math.abs(val - item.lambda_nm) > 50) ok = false;
  });
  if (ok) {
    if (fb) { fb.innerHTML = '<span class="success">✓ All matches correct! λ = 1240 / Eg (eV) in nm.</span>'; fb.style.display = 'block'; }
    if (window._GameState) {
      _GameState.addXP(120, 'is_puzzles');
      _GameState.earnedBadges.add('optical-matchmaker');
      _GameState.save();
      updateScoreboardIS();
    }
  } else {
    if (fb) { fb.innerHTML = '<span class="error">✗ Some λ values are off. Use λ ≈ 1240 / Eg[eV].</span>'; fb.style.display = 'block'; }
  }
}

/* ---- Game Mode Switch ---- */
function setGameMode(mode) {
  document.querySelectorAll('.game-mode-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('mode-' + mode).classList.add('active');
  ['play', 'challenge', 'puzzle'].forEach(function(m) {
    var el = document.getElementById('section-' + m);
    if (el) el.style.display = (m === mode) ? 'block' : 'none';
  });
  if (mode === 'challenge') { startIsMatcher(); startNcChallenge(); startTrendChallenge(); }
  if (mode === 'puzzle') { initCondBuilder(); initFermiPuzzle(); initOpticalPuzzle(); }
  if (mode === 'play') {
    if (window.initIntrinsicSemi) window.initIntrinsicSemi();
  }
}

/* ---- Boot ---- */
function initISGames() {
  buildModuleNavIS();
  updateScoreboardIS();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initISGames);
} else {
  initISGames();
}

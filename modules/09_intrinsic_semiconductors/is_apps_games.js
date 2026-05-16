/**
 * Intrinsic Semiconductors — Gamified layer: Challenges + Puzzles + 3D integration
 * Module 09 v2 — Three.js 3D band diagram + Varshni bandgap + doping
 */

'use strict';

/* ============ MODULE NAVIGATOR (aligned with actual directories) ============ */
var IS_MODULE_NAV = [
  { num: '00', name: 'Crystal to Quantum', url: '../00_crystal_to_quantum/index.html' },
  { num: '01', name: 'QHO', url: '../01_qho/index.html' },
  { num: '02', name: 'Hydrogen', url: '../02_hydrogen/index.html' },
  { num: '03', name: 'Spin-1/2', url: '../03_spin/index.html' },
  { num: '04', name: 'KP Model', url: '../04_kronig_penney/index.html' },
  { num: '05', name: 'Energy Bands', url: '../05_energy_bands/index.html' },
  { num: '06', name: 'Fermi Surface', url: '../06_fermi_surface/index.html' },
  { num: '07', name: 'Conductivity', url: '../07_conductivity/index.html' },
  { num: '08', name: 'Superconductivity', url: '../08_superconductivity/index.html' },
  { num: '09', name: 'Intrinsic Semi', current: true },
  { num: '10', name: 'Doped Semi', url: '../10_doped_semiconductors/index.html' },
  { num: '11', name: 'Junctions', url: '../11_junctions_devices/index.html' },
  { num: '12', name: 'Optics', url: '../12_optics_dispersion/index.html' },
  { num: '13', name: 'Lasers', url: '../13_laser_physics/index.html' },
  { num: '14', name: 'Magnetism', url: '../14_magnetism/index.html' },
  { num: '15', name: 'Thermal', url: '../15_thermal_properties/index.html' }
];

function buildModuleNavIS() {
  var nav = document.getElementById('module-nav');
  if (!nav) return;
  nav.innerHTML = '';
  IS_MODULE_NAV.forEach(function(m) {
    var el = document.createElement(m.current ? 'div' : 'a');
    if (!m.current) { el.href = m.url; el.style.textDecoration = 'none'; }
    el.style.cssText = 'display:block;padding:0.5rem 0.7rem;border-radius:8px;margin-bottom:0.3rem;font-size:0.85rem;';
    if (m.current) {
      el.style.background = 'rgba(0,240,255,0.1)';
      el.style.border = '1px solid rgba(0,240,255,0.3)';
      el.style.color = 'var(--accent-cyan)';
      el.textContent = m.num + '. ' + m.name + ' (here)';
    } else {
      el.style.background = 'var(--bg-elevated)';
      el.style.border = '1px solid var(--glass-border)';
      el.style.color = 'var(--text-dim)';
      el.textContent = m.num + '. ' + m.name;
    }
    nav.appendChild(el);
  });
}

/* ============ BADGES ============ */
var IS_BADGES = [
  { id: 'semi-explorer', name: 'Semiconductor Explorer', desc: 'First playground exploration', icon: '💎', xp: 10 },
  { id: 'material-master', name: 'Material Master', desc: 'Identified 3 materials correctly', icon: '⚗', xp: 25 },
  { id: 'doping-detective', name: 'Doping Detective', desc: 'Solved doping challenge', icon: '🔍', xp: 25 },
  { id: 'thermal-engineer', name: 'Thermal Engineer', desc: 'Temperature trend challenge completed', icon: '🌡', xp: 30 },
  { id: 'formula-builder', name: 'Formula Builder', desc: 'Built conductivity formula', icon: '🔧', xp: 20 },
  { id: 'fermi-architect', name: 'Fermi Architect', desc: 'Placed Fermi levels correctly', icon: '📐', xp: 25 },
  { id: 'optical-matchmaker', name: 'Optical Matchmaker', desc: 'Matched all optical excitations', icon: '💡', xp: 35 }
];

function renderBadgesIS() {
  var list = document.getElementById('badge-list');
  if (!list) return;
  var earned = (_GameState.get && _GameState.get('achievements')) || [];
  var earnedIds = earned.map(function(a) { return a.id; });
  list.innerHTML = '';
  IS_BADGES.forEach(function(b) {
    var isEarned = earnedIds.indexOf(b.id) >= 0;
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0;border-bottom:1px solid var(--glass-border);';
    div.innerHTML = '<span style="font-size:1.1rem;">' + (isEarned ? b.icon : '🔒') + '</span>' +
      '<div style="flex:1;"><div style="font-size:0.8rem;color:' + (isEarned ? 'var(--text-main)' : 'var(--text-dim)') + '">' + b.name + '</div>' +
      '<div style="font-size:0.7rem;color:var(--text-dim)">' + b.desc + '</div></div>';
    list.appendChild(div);
  });
}

function updateScoreboardIS() {
  var earned = (_GameState.get && _GameState.get('achievements')) || [];
  var xp = (_GameState.xp && _GameState.xp()) || 0;
  var ch = (_GameState.get && _GameState.get('challengesCompleted')) || 0;
  var pz = (_GameState.get && _GameState.get('puzzlesCompleted')) || 0;
  var elCh = document.getElementById('stat-challenges'); if (elCh) elCh.textContent = ch;
  var elPz = document.getElementById('stat-puzzles'); if (elPz) elPz.textContent = pz;
  var elXp = document.getElementById('stat-xp'); if (elXp) elXp.textContent = xp;
  var elBd = document.getElementById('stat-badges'); if (elBd) elBd.textContent = earned.length;
  var elNav = document.getElementById('nav-xp'); if (elNav) elNav.textContent = xp + ' XP';
  renderBadgesIS();
}

function celebrateCorrect() {
  if (typeof createConfetti === 'function') createConfetti();
}

/* ============ CHALLENGE 1: MATERIAL MATCHER ============ */
var mmChallenge = {
  current: null,
  score: 0,
  combo: 0,
  streak: 0
};

function startMaterialMatcher() {
  var keys = ['Si', 'GaAs', 'Ge'];
  var key = keys[Math.floor(Math.random() * keys.length)];
  var m = MAT_DB[key];
  var T = 300;
  var Eg = bandgapVarshini(key, T);
  var Nc = effectiveDensity(m.Nc300, T);
  var Nv = effectiveDensity(m.Nv300, T);
  var ni = intrinsicCarrierDensity(Eg, T, Nc, Nv);
  var sigma = conductivity(ni, ni, m.mu_e, m.mu_h);

  mmChallenge.current = { key: key, Eg: Eg, sigma: sigma };

  var txt = document.getElementById('mm-target-text');
  if (txt) {
    txt.innerHTML = 'At <strong>300 K</strong>: Eg ≈ ' + Eg.toFixed(2) + ' eV, σ ≈ ' + sigma.toExponential(1) + ' S/cm<br>' +
      '<span style="font-size:1.3rem;">Which material?</span>';
  }
}

function guessMaterial(guess) {
  var fb = document.getElementById('mm-feedback');
  var correct = (guess === mmChallenge.current.key);
  if (correct) {
    mmChallenge.combo++;
    mmChallenge.streak++;
    mmChallenge.score += 50 + mmChallenge.combo * 5;
    if (fb) {
      fb.className = 'challenge-feedback success';
      fb.style.display = 'block';
      fb.innerHTML = '✓ Correct! ' + MAT_DB[guess].name + ' at 300 K has Eg = ' + mmChallenge.current.Eg.toFixed(2) + ' eV.';
    }
    _GameState.addXP(50 + mmChallenge.combo * 5, 'Material matched!');
    celebrateCorrect();
    if (mmChallenge.streak >= 3) {
      _GameState.unlock({ id: 'material-master', title: 'Material Master', desc: 'Identified 3 materials correctly', icon: '⚗', xp: 25 });
    }
  } else {
    mmChallenge.combo = 0; mmChallenge.streak = 0;
    if (fb) {
      fb.className = 'challenge-feedback error';
      fb.style.display = 'block';
      fb.textContent = '✗ It was ' + MAT_DB[mmChallenge.current.key].name + '. Check the bandgap values at 300 K.';
    }
  }
  var elScore = document.getElementById('mm-score');
  var elCombo = document.getElementById('mm-combo');
  if (elScore) elScore.textContent = mmChallenge.score;
  if (elCombo) elCombo.textContent = mmChallenge.combo;
  setTimeout(startMaterialMatcher, 2000);
}

/* ============ CHALLENGE 2: DOPING DETECTIVE ============ */
var ddChallenge = {
  current: null
};

function startDopingDetective() {
  var keys = ['Si', 'GaAs', 'Ge'];
  var key = keys[Math.floor(Math.random() * keys.length)];
  var m = MAT_DB[key];
  var T = 300;
  var Eg = bandgapVarshini(key, T);
  var Nc = effectiveDensity(m.Nc300, T);
  var Nv = effectiveDensity(m.Nv300, T);
  var ni = intrinsicCarrierDensity(Eg, T, Nc, Nv);

  var type = Math.random() > 0.33 ? (Math.random() > 0.5 ? 'n-type' : 'p-type') : 'intrinsic';
  var Nd = 0, Na = 0;
  if (type === 'n-type') { Nd = 1e15 * Math.pow(10, Math.floor(Math.random() * 4)); }
  else if (type === 'p-type') { Na = 1e15 * Math.pow(10, Math.floor(Math.random() * 4)); }

  var doped = solveDoping(Nd, Na, ni);

  ddChallenge.current = {
    key: key, type: type, Nd: Nd, Na: Na,
    n: doped.n, p: doped.p, ni: ni
  };

  var txt = document.getElementById('dd-target-text');
  if (txt) {
    txt.innerHTML = '<strong>' + m.name + '</strong> at 300 K<br>n = ' + doped.n.toExponential(2) + ' cm⁻³, p = ' + doped.p.toExponential(2) + ' cm⁻³<br>' +
      'ni = ' + ni.toExponential(2) + ' cm⁻³<br><span style="font-size:0.9rem;">What is the doping regime and approximate dopant concentration?</span>';
  }
  var sel = document.getElementById('dd-regime');
  if (sel) sel.value = '';
  var inp = document.getElementById('dd-conc');
  if (inp) inp.value = '';
}

function checkDopingDetective() {
  var fb = document.getElementById('dd-feedback');
  var c = ddChallenge.current;
  if (!c) return;

  var regime = document.getElementById('dd-regime').value;
  var concStr = document.getElementById('dd-conc').value;
  var conc = parseFloat(concStr);

  var regimeOK = (regime === c.type);
  var concOK = true;
  var targetConc = (c.type === 'n-type') ? c.Nd : (c.type === 'p-type' ? c.Na : 0);
  if (c.type !== 'intrinsic' && !isNaN(conc)) {
    concOK = Math.abs(Math.log10(conc) - Math.log10(targetConc)) <= 1.5;
  }

  if (regimeOK && concOK) {
    if (fb) {
      fb.className = 'challenge-feedback success';
      fb.style.display = 'block';
      fb.innerHTML = '✓ Correct! ' + (c.type === 'intrinsic' ? 'Intrinsic — no doping.' : c.type + ' with ~' + targetConc.toExponential(1) + ' cm⁻³ dopants.');
    }
    _GameState.addXP(75, 'Doping detected!');
    celebrateCorrect();
    _GameState.unlock({ id: 'doping-detective', title: 'Doping Detective', desc: 'Solved doping challenge', icon: '🔍', xp: 25 });
  } else {
    if (fb) {
      fb.className = 'challenge-feedback error';
      fb.style.display = 'block';
      fb.textContent = '✗ Not quite. n/p ratio vs ni tells you the regime. The minority carrier concentration ≈ ni²/majority.';
    }
  }
  setTimeout(startDopingDetective, 2500);
}

/* ============ CHALLENGE 3: TEMPERATURE TREND ============ */
var trendChallenge = {
  pool: [
    { name: 'Intrinsic Si', Nd: 0, Na: 0, answer: 'rise', reason: 'Carrier density rises exponentially with T, outweighing mobility drop.' },
    { name: 'n-doped Si (Nd=1e16)', Nd: 1e16, Na: 0, answer: 'rise', reason: 'In extrinsic regime at moderate T, carrier density is roughly constant but mobility drops. However at high T intrinsic carriers dominate → σ rises.' },
    { name: 'Heavily doped Si (Nd=1e19)', Nd: 1e19, Na: 0, answer: 'fall', reason: 'Degenerately doped: carrier density is fixed. Mobility falls with T due to phonon scattering → σ decreases.' },
    { name: 'Intrinsic Ge', Nd: 0, Na: 0, answer: 'rise', reason: 'Same as Si: thermal carrier generation dominates.' }
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
  var correct = (ans === trendChallenge.current.answer);
  if (correct) {
    if (fb) {
      fb.className = 'challenge-feedback success';
      fb.style.display = 'block';
      fb.innerHTML = '✓ Correct! ' + trendChallenge.current.reason;
    }
    _GameState.addXP(100, 'Temperature trend predicted!');
    celebrateCorrect();
    _GameState.unlock({ id: 'thermal-engineer', title: 'Thermal Engineer', desc: 'Temperature trend challenge completed', icon: '🌡', xp: 30 });
  } else {
    if (fb) {
      fb.className = 'challenge-feedback error';
      fb.style.display = 'block';
      fb.textContent = '✗ ' + trendChallenge.current.reason;
    }
  }
  setTimeout(startTrendChallenge, 2500);
}

/* ============ PUZZLE 1: CONDUCTIVITY FORMULA ============ */
var condBuilder = {
  pool: [
    { label: 'e', id: 'e' }, { label: 'n', id: 'n' }, { label: 'μe', id: 'mue' },
    { label: 'p', id: 'p' }, { label: 'μh', id: 'muh' }, { label: '+', id: 'plus' },
    { label: '(', id: 'lp' }, { label: ')', id: 'rp' }
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
    d.className = 'term-chip';
    d.textContent = item.label;
    d.dataset.id = item.id;
    d.draggable = true;
    d.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', item.id); });
    d.addEventListener('click', function() {
      var emptyZones = Array.from(zones.querySelectorAll('.equation-drop-zone')).filter(function(z) { return z.textContent === '?'; });
      if (emptyZones.length > 0) {
        emptyZones[0].textContent = item.label;
        emptyZones[0].dataset.id = item.id;
      }
    });
    pool.appendChild(d);
  });
  condBuilder.sequence.forEach(function() {
    var z = document.createElement('div');
    z.className = 'equation-drop-zone';
    z.textContent = '?';
    z.style.minWidth = '50px';
    z.addEventListener('dragover', function(e) { e.preventDefault(); });
    z.addEventListener('drop', function(e) {
      e.preventDefault();
      var id = e.dataTransfer.getData('text/plain');
      var p = condBuilder.pool.find(function(x) { return x.id === id; });
      z.textContent = p ? p.label : '?';
      z.dataset.id = id;
    });
    z.addEventListener('click', function() { z.textContent = '?'; z.dataset.id = ''; });
    zones.appendChild(z);
  });
}

function checkCondBuilder() {
  var zones = document.querySelectorAll('#cond-zones .equation-drop-zone');
  var fb = document.getElementById('cond-feedback');
  var ok = true;
  zones.forEach(function(z, i) {
    if (z.dataset.id !== condBuilder.sequence[i]) ok = false;
  });
  if (ok) {
    if (fb) { fb.className = 'challenge-feedback success'; fb.style.display = 'block'; fb.innerHTML = '✓ Correct! σ = e(nμe + pμh)'; }
    _GameState.addXP(60, 'Formula built!');
    celebrateCorrect();
    _GameState.unlock({ id: 'formula-builder', title: 'Formula Builder', desc: 'Built conductivity formula', icon: '🔧', xp: 20 });
  } else {
    if (fb) { fb.className = 'challenge-feedback error'; fb.style.display = 'block'; fb.textContent = '✗ Try again. σ = e(nμe + pμh).'; }
  }
}

/* ============ PUZZLE 2: FERMI LEVEL PLACEMENT ============ */
var fermiPuzzle = {
  pool: [
    { text: 'Intrinsic semiconductor at 300 K', answer: 'midgap' },
    { text: 'n-type with Nd = 1e16 cm⁻³ at 300 K', answer: 'upper' },
    { text: 'p-type with Na = 1e16 cm⁻³ at 300 K', answer: 'lower' },
    { text: 'Heavily n-doped (Nd = 1e19 cm⁻³)', answer: 'near-conduction' },
    { text: 'Heavily p-doped (Na = 1e19 cm⁻³)', answer: 'near-valence' }
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
      '<br><select id="fermi-sel-' + i + '" style="margin-top:0.4rem;background:var(--bg-panel);border:1px solid var(--glass-border);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
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
    if (fb) { fb.className = 'challenge-feedback success'; fb.style.display = 'block'; fb.innerHTML = '✓ All correct! EF tracks the majority carrier concentration.'; }
    _GameState.addXP(70, 'Fermi levels placed!');
    celebrateCorrect();
    _GameState.unlock({ id: 'fermi-architect', title: 'Fermi Architect', desc: 'Placed Fermi levels correctly', icon: '📐', xp: 25 });
  } else {
    if (fb) { fb.className = 'challenge-feedback error'; fb.style.display = 'block'; fb.textContent = '✗ Some placements are wrong. Donors pull EF up; acceptors push it down.'; }
  }
}

/* ============ PUZZLE 3: OPTICAL EXCITATION ============ */
var opticalPuzzle = {
  pool: [
    { material: 'Si (Eg ≈ 1.12 eV)', lambda_nm: 1107 },
    { material: 'GaAs (Eg ≈ 1.42 eV)', lambda_nm: 873 },
    { material: 'Ge (Eg ≈ 0.67 eV)', lambda_nm: 1851 },
    { material: 'GaN (Eg ≈ 3.4 eV)', lambda_nm: 365 },
    { material: 'Diamond (Eg ≈ 5.5 eV)', lambda_nm: 225 }
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
      '<br><input type="number" id="opt-ans-' + i + '" placeholder="nm" style="width:120px;margin-top:0.4rem;background:var(--bg-panel);border:1px solid var(--glass-border);color:var(--text-main);padding:0.3rem;border-radius:4px;font-family:var(--font-mono);">';
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
    if (Math.abs(val - item.lambda_nm) > 80) ok = false;
  });
  if (ok) {
    if (fb) { fb.className = 'challenge-feedback success'; fb.style.display = 'block'; fb.innerHTML = '✓ All matches correct! λ = 1240 / Eg (eV) in nm.'; }
    _GameState.addXP(120, 'Optical excitations matched!');
    celebrateCorrect();
    _GameState.unlock({ id: 'optical-matchmaker', title: 'Optical Matchmaker', desc: 'Matched all optical excitations', icon: '💡', xp: 35 });
  } else {
    if (fb) { fb.className = 'challenge-feedback error'; fb.style.display = 'block'; fb.textContent = '✗ Some λ values are off. Use λ ≈ 1240 / Eg[eV].'; }
  }
}

/* ============ GAME MODE SWITCH (delegated to shared, with local hooks) ============ */
document.addEventListener('DOMContentLoaded', function() {
  buildModuleNavIS();
  updateScoreboardIS();

  // Register init hooks for shared setGameMode
  window.initPlayground = function() {
    if (typeof initIntrinsicSemi === 'function') initIntrinsicSemi();
  };
  window.initChallenges = function() {
    startMaterialMatcher();
    startDopingDetective();
    startTrendChallenge();
  };
  window.initPuzzles = function() {
    initCondBuilder();
    initFermiPuzzle();
    initOpticalPuzzle();
  };

  // Auto-start playground
  if (typeof initIntrinsicSemi === 'function') initIntrinsicSemi();
});

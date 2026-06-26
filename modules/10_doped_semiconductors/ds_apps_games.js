/**
 * Doped Semiconductors — Gamified Challenges + Puzzles
 * Pattern: MODULE_PATTERN.md
 */
'use strict';

/* ---- Module Navigation ---- */
var DS_MODULE_NAV = [
  { name: 'Crystal to Quantum', path: '../00_crystal_to_quantum/index.html', current: false },
  { name: 'QHO', path: '../01_qho/index.html', current: false },
  { name: 'Hydrogen', path: '../02_hydrogen/index.html', current: false },
  { name: 'Spin', path: '../03_spin/index.html', current: false },
  { name: 'Kronig-Penney', path: '../04_kronig_penney/index.html', current: false },
  { name: 'Energy Bands', path: '../05_energy_bands/index.html', current: false },
  { name: 'Fermi Surface', path: '../06_fermi_surface/index.html', current: false },
  { name: 'Conductivity', path: '../07_conductivity/index.html', current: false },
  { name: 'Superconductivity', path: '../08_superconductivity/index.html', current: false },
  { name: 'Intrinsic Semi', path: '../09_intrinsic_semiconductors/index.html', current: false },
  { name: 'Doped Semi', path: './index.html', current: true },
  { name: 'Junctions', path: '../11_junctions_devices/index.html', current: false },
  { name: 'Optics & Dispersion', path: '../12_optics_dispersion/index.html', current: false },
  { name: 'Lasers', path: '../13_laser_physics/index.html', current: false },
  { name: 'Magnetism', path: '../14_magnetism/index.html', current: false },
  { name: 'Thermal', path: '../15_thermal_properties/index.html', current: false }
];

function buildModuleNavDS() {
  var el = document.getElementById('module-nav');
  if (!el) return;
  el.innerHTML = '';
  DS_MODULE_NAV.forEach(function (m) {
    var a = document.createElement('a');
    a.href = m.path;
    a.textContent = m.name;
    a.className = 'nav-link' + (m.current ? ' current' : '');
    if (m.current) a.style.fontWeight = '700';
    el.appendChild(a);
  });
}

/* ---- Badges ---- */
var DS_BADGES = [
  { id: 'ds-explorer', name: 'Doping Explorer', desc: 'First playground exploration', icon: '🔧' },
  { id: 'type-master', name: 'Doping Master', desc: 'Classified 3 dopings correctly in Challenge 1', icon: '🎯' },
  { id: 'carrier-hunter', name: 'Carrier Hunter', desc: 'Solved carrier density calculator', icon: '⚗' },
  { id: 'compensation-sage', name: 'Compensation Sage', desc: 'Solved compensation puzzle', icon: '⚖' },
  { id: 'fermi-navigator', name: 'Fermi Navigator', desc: 'Placed Fermi level correctly in Puzzle 1', icon: '🧭' },
  { id: 'neutrality-expert', name: 'Charge Neutrality Expert', desc: 'Built charge neutrality equation', icon: '🔬' },
  { id: 'detector-dope', name: 'Doping Detective', desc: 'Matched all donor/acceptor pairs', icon: '🔎' }
];

function renderBadgesDS() {
  var el = document.getElementById('badge-list');
  if (!el || !window._GameState) return;
  var s = _GameState.earnedBadges;
  var earned = DS_BADGES.filter(function (b) { return s.has(b.id); });
  var pending = DS_BADGES.filter(function (b) { return !s.has(b.id); });
  var html = '';
  if (earned.length) {
    html += '<div style="margin-bottom:0.5rem;color:var(--accent-green);">✨ Earned:</div>';
    earned.forEach(function (b) {
      html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:rgba(0,240,255,0.08);border:1px solid var(--accent-cyan);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>';
    });
  }
  if (pending.length) {
    html += '<div style="margin:0.5rem 0;color:var(--text-dim);">🔒 Pending:</div>';
    pending.forEach(function (b) {
      html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-dim);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>';
    });
  }
  el.innerHTML = html || 'Complete challenges to earn badges!';
}

function updateScoreboardDS() {
  if (!window._GameState) return;
  var elCh = document.getElementById('stat-challenges');
  var elPuz = document.getElementById('stat-puzzles');
  var elXP = document.getElementById('stat-xp');
  var elBad = document.getElementById('stat-badges');
  var elNav = document.getElementById('nav-xp');
  if (elCh) elCh.textContent = _GameState.moduleScores['ds_challenges'] || 0;
  if (elPuz) elPuz.textContent = _GameState.moduleScores['ds_puzzles'] || 0;
  if (elXP) elXP.textContent = _GameState.xp;
  if (elBad) elBad.textContent = _GameState.earnedBadges.size;
  if (elNav) elNav.textContent = _GameState.xp + ' XP';
  renderBadgesDS();
}

/* ═══════════════════════════════════════════════════════════════
   CHALLENGE 1: Intrinsic or Extrinsic?
   Given a plot summary, guess whether intrinsic, n-type, or p-type.
   ═══════════════════════════════════════════════════════════════ */
var typeChallenge = {
  score: 0,
  combo: 0,
  current: null,
  timeLeft: 15,
  timer: null,
  streak: 0
};

function startTypeChallenge() {
  var txt = document.getElementById('type-target-text');
  if (!txt) return;
  var opts = [
    { desc: 'Si doped with 1e16 cm⁻³ Phosphorus at 300 K', type: 'n-type' },
    { desc: 'Si doped with 5e15 cm⁻³ Boron at 300 K', type: 'p-type' },
    { desc: 'Pure Ge at 300 K (no dopants)', type: 'intrinsic' },
    { desc: 'GaAs with Zinc doping, 2e16 cm⁻³ at 300 K', type: 'p-type' },
    { desc: 'Si with both Nd=1e15 and Na=1e15 at 300 K', type: 'intrinsic' },
    { desc: 'Ge doped with Arsenic, 1e17 cm⁻³ at 300 K', type: 'n-type' }
  ];
  typeChallenge.current = opts[Math.floor(Math.random() * opts.length)];
  txt.innerHTML = '<strong>' + typeChallenge.current.desc + '</strong><br><span style="font-size:1.3rem;margin-top:0.5rem;display:block;">Intrinsic, n-type, or p-type?</span>';
  typeChallenge.timeLeft = 15;
  updateTypeTimer();
  clearInterval(typeChallenge.timer);
  typeChallenge.timer = setInterval(function () {
    typeChallenge.timeLeft -= 1;
    updateTypeTimer();
    if (typeChallenge.timeLeft <= 0) {
      clearInterval(typeChallenge.timer);
      showTypeFeedback(false, 'Time up! It was ' + typeChallenge.current.type + '.');
      typeChallenge.combo = 0;
      setTimeout(startTypeChallenge, 1500);
    }
  }, 1000);
}

function updateTypeTimer() {
  var el = document.getElementById('type-timer');
  if (el) el.style.width = (typeChallenge.timeLeft / 15 * 100) + '%';
}

function guessDopingType(guess) {
  clearInterval(typeChallenge.timer);
  var correct = guess === typeChallenge.current.type;
  if (correct) {
    typeChallenge.combo += 1;
    typeChallenge.streak += 1;
    typeChallenge.score += 50 + (typeChallenge.combo - 1) * 5;
    showTypeFeedback(true, 'Correct! +' + (50 + (typeChallenge.combo - 1) * 5) + ' XP');
    if (window._GameState) {
      _GameState.addXP(50 + (typeChallenge.combo - 1) * 5, 'ds_challenges');
      if (typeChallenge.streak >= 3) _GameState.earnedBadges.add('type-master');
      _GameState.moduleScores['ds_challenges'] = typeChallenge.score;
      _GameState.save();
      updateScoreboardDS();
    }
  } else {
    typeChallenge.combo = 0;
    showTypeFeedback(false, 'Incorrect. It is ' + typeChallenge.current.type + '.');
  }
  var elScore = document.getElementById('type-score');
  var elCombo = document.getElementById('type-combo');
  if (elScore) elScore.textContent = typeChallenge.score;
  if (elCombo) elCombo.textContent = typeChallenge.combo;
  setTimeout(startTypeChallenge, 1500);
}

function showTypeFeedback(ok, msg) {
  var el = document.getElementById('type-feedback');
  if (!el) return;
  el.textContent = msg;
  el.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
}

/* ═══════════════════════════════════════════════════════════════
   CHALLENGE 2: Doping Calculator
   Calculate expected carrier density given Nd, Na, and ni.
   Timer-based.
   ═══════════════════════════════════════════════════════════════ */
var ndChallenge = {
  targetN: 0,
  targetP: 0,
  timer: null,
  timeLeft: 30
};

function startNdChallenge() {
  var txt = document.getElementById('nd-target-text-ds');
  if (!txt) return;
  var T = 250 + Math.floor(Math.random() * 350);
  var Nd = [1e14, 1e15, 1e16, 5e16, 1e17][Math.floor(Math.random() * 5)];
  var Na = [0, 1e13, 1e14, 1e15][Math.floor(Math.random() * 4)];
  if (Nd === Na) Nd *= 10;

  // Need ni(T) using Si defaults for challenge simplicity
  var NcT = 2.86e19 * Math.pow(T / 300, 1.5);
  var NvT = 1.04e19 * Math.pow(T / 300, 1.5);
  var niT = Math.sqrt(NcT * NvT) * Math.exp(-1.12 / (2 * 8.617e-5 * T));
  var net = Nd - Na;
  var n, p;
  if (net >= 0) {
    n = net / 2 + Math.sqrt(Math.pow(net / 2, 2) + niT * niT);
    p = niT * niT / n;
  } else {
    p = -net / 2 + Math.sqrt(Math.pow(net / 2, 2) + niT * niT);
    n = niT * niT / p;
  }
  ndChallenge.targetN = n;
  ndChallenge.targetP = p;
  ndChallenge.timeLeft = 30;
  txt.innerHTML = 'T = ' + T + ' K, Nd = ' + Nd.toExponential(1) + ' cm⁻³, Na = ' + Na.toExponential(1) + ' cm⁻³.<br>What is the electron concentration n (cm⁻³)?<br><span style="font-size:0.85rem;color:var(--text-dim);">Use charge neutrality: n ≈ (Nd−Na)/2 + √(((Nd−Na)/2)² + ni²)</span>';
  updateNdTimer();
  clearInterval(ndChallenge.timer);
  ndChallenge.timer = setInterval(function () {
    ndChallenge.timeLeft -= 1;
    updateNdTimer();
    if (ndChallenge.timeLeft <= 0) {
      clearInterval(ndChallenge.timer);
      var fb = document.getElementById('nd-feedback-ds');
      if (fb) { fb.textContent = 'Time up! n ≈ ' + ndChallenge.targetN.toExponential(2) + ' cm⁻³'; fb.className = 'challenge-feedback error'; }
    }
  }, 1000);
}

function updateNdTimer() {
  var bar = document.getElementById('nd-timer-ds');
  if (bar) bar.style.width = (ndChallenge.timeLeft / 30 * 100) + '%';
}

function checkNdAnswerDS() {
  clearInterval(ndChallenge.timer);
  var val = document.getElementById('nd-answer-ds');
  var fb = document.getElementById('nd-feedback-ds');
  if (!val || !fb) return;
  var guess = parseFloat(val.value);
  var ok = !isNaN(guess) && Math.abs((guess - ndChallenge.targetN) / ndChallenge.targetN) < 0.5;
  fb.textContent = ok ? 'Correct! n ≈ ' + ndChallenge.targetN.toExponential(2) + ' cm⁻³.' : 'Hint: n ≈ ' + ndChallenge.targetN.toExponential(2) + ' cm⁻³. Check your order of magnitude.';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'hint');
  if (ok && window._GameState) {
    _GameState.addXP(75, 'ds_challenges');
    _GameState.earnedBadges.add('carrier-hunter');
    _GameState.save();
    updateScoreboardDS();
  }
}

/* ═══════════════════════════════════════════════════════════════
   CHALLENGE 3: Compensation Puzzle
   If both donors AND acceptors are present, what is the net carrier type?
   ═══════════════════════════════════════════════════════════════ */
var compChallenge = {
  current: null
};

function startCompChallenge() {
  var txt = document.getElementById('comp-target-text');
  if (!txt) return;
  var items = [
    { Nd: 1e16, Na: 1e14, type: 'n-type', why: 'Nd > Na → excess donors' },
    { Nd: 1e15, Na: 5e15, type: 'p-type', why: 'Na > Nd → excess acceptors' },
    { Nd: 1e15, Na: 1e15, type: 'intrinsic', why: 'Nd ≈ Na → compensated, behaves intrinsic' },
    { Nd: 1e17, Na: 5e16, type: 'n-type', why: 'Nd still larger' }
  ];
  compChallenge.current = items[Math.floor(Math.random() * items.length)];
  txt.innerHTML = 'Nd = ' + compChallenge.current.Nd.toExponential(1) + ' cm⁻³, Na = ' + compChallenge.current.Na.toExponential(1) + ' cm⁻³.<br>What is the net carrier type?';
}

function guessCompensation(g) {
  var fb = document.getElementById('comp-feedback');
  if (!fb || !compChallenge.current) return;
  var ok = g === compChallenge.current.type;
  fb.textContent = ok ? 'Correct! ' + compChallenge.current.why : 'Incorrect. ' + compChallenge.current.why;
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) {
    _GameState.addXP(100, 'ds_challenges');
    _GameState.earnedBadges.add('compensation-sage');
    _GameState.save();
    updateScoreboardDS();
  }
  setTimeout(startCompChallenge, 2000);
}

/* ═══════════════════════════════════════════════════════════════
   PUZZLE 1: Fermi Level Slider
   Drag a slider to match the Fermi level to the doping condition.
   ═══════════════════════════════════════════════════════════════ */
var fermiSliderState = {
  target: null, // 'upper','mid','lower'
  current: 'mid'
};

function initFermiSliderPuzzle() {
  var wrap = document.getElementById('fermi-slider-wrap');
  if (!wrap) return;
  var scenarios = [
    { text: 'Heavily n-type Si at 300 K (Nd = 1e17)', target: 'upper' },
    { text: 'Intrinsic Si at 300 K', target: 'mid' },
    { text: 'Heavily p-type Si at 300 K (Na = 1e17)', target: 'lower' },
    { text: 'Compensated Si (Nd=Na=1e16) at 300 K', target: 'mid' }
  ];
  var s = scenarios[Math.floor(Math.random() * scenarios.length)];
  fermiSliderState.target = s.target;
  wrap.innerHTML = '<div style="margin-bottom:0.5rem;color:var(--accent-cyan);"><strong>' + s.text + '</strong></div>' +
    '<div style="position:relative;height:180px;background:var(--bg-elevated);border-radius:8px;overflow:hidden;margin:0.5rem 0;">' +
    '<div style="position:absolute;top:8px;left:8px;right:8px;height:30%;border:2px solid #00f0ff;background:rgba(0,240,255,0.06);border-radius:4px;"></div>' +
    '<div style="position:absolute;bottom:8px;left:8px;right:8px;height:30%;border:2px solid #c084fc;background:rgba(192,132,252,0.06);border-radius:4px;"></div>' +
    '<div id="fermi-slider-bar" style="position:absolute;left:8px;right:8px;height:3px;background:#ffd54f;top:50%;transform:translateY(-50%);"></div>' +
    '<div id="fermi-slider-thumb" draggable="true" style="position:absolute;left:50%;top:50%;width:20px;height:20px;border-radius:50%;background:#ffd54f;box-shadow:0 0 12px #ffd54f;cursor:grab;transform:translate(-50%,-50%);z-index:10;"></div>' +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-dim);"><span>near Ev</span><span>mid-gap</span><span>near Ec</span></div>';

  var thumb = document.getElementById('fermi-slider-thumb');
  var bar = document.getElementById('fermi-slider-bar');
  var dragging = false;

  thumb.addEventListener('mousedown', function (e) { dragging = true; });
  document.addEventListener('mouseup', function () { dragging = false; });
  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    var rect = bar.getBoundingClientRect();
    var x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    thumb.style.left = x + 'px';
    var frac = x / rect.width;
    if (frac < 0.33) fermiSliderState.current = 'lower';
    else if (frac > 0.66) fermiSliderState.current = 'upper';
    else fermiSliderState.current = 'mid';
  });
}

function checkFermiSliderPuzzle() {
  var fb = document.getElementById('fermi-slider-feedback');
  if (!fb) return;
  var ok = fermiSliderState.current === fermiSliderState.target;
  fb.textContent = ok ? 'Perfect placement! EF matches the doping condition.' : 'Not quite. Adjust the slider to the correct position.';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) {
    _GameState.addXP(120, 'ds_puzzles');
    _GameState.earnedBadges.add('fermi-navigator');
    _GameState.save();
    updateScoreboardDS();
  }
}

/* ═══════════════════════════════════════════════════════════════
   PUZZLE 2: Charge Neutrality Builder
   Drop terms into the charge neutrality equation: n + Na⁻ = p + Nd⁺
   ═══════════════════════════════════════════════════════════════ */
var neutralityBuilder = {
  sequence: ['n', 'Na⁻', '=', 'p', 'Nd⁺'],
  pool: [
    { label: 'n', id: 'n' }, { label: 'p', id: 'p' }, { label: 'Nd⁺', id: 'Nd+' },
    { label: 'Na⁻', id: 'Na-' }, { label: '=', id: 'eq' }, { label: '+', id: 'plus' }
  ]
};

function initNeutralityBuilder() {
  var pool = document.getElementById('neutrality-pool');
  var zones = document.getElementById('neutrality-zones');
  if (!pool || !zones) return;
  pool.innerHTML = '';
  zones.innerHTML = '';
  neutralityBuilder.pool.forEach(function (item) {
    var d = document.createElement('span');
    d.className = 'draggable-target';
    d.textContent = item.label;
    d.dataset.id = item.id;
    d.setAttribute('draggable', 'true');
    d.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', item.id); });
    pool.appendChild(d);
  });
  ['____', '+', '____', '=', '____', '+', '____'].forEach(function (lbl, i) {
    if (lbl === '____') {
      var z = document.createElement('div');
      z.className = 'drop-zone';
      z.style.minHeight = '40px';
      z.style.minWidth = '50px';
      z.style.display = 'inline-block';
      z.dataset.idx = i;
      z.addEventListener('dragover', function (e) { e.preventDefault(); z.classList.add('dragover'); });
      z.addEventListener('dragleave', function () { z.classList.remove('dragover'); });
      z.addEventListener('drop', function (e) {
        e.preventDefault();
        z.classList.remove('dragover');
        var id = e.dataTransfer.getData('text/plain');
        var p = neutralityBuilder.pool.find(function (x) { return x.id === id; });
        z.textContent = p ? p.label : '?';
        z.dataset.placed = id;
      });
      zones.appendChild(z);
    } else {
      var sp = document.createElement('span');
      sp.textContent = lbl;
      sp.style.padding = '0.4rem';
      sp.style.fontFamily = 'var(--font-mono)';
      sp.style.color = 'var(--text-muted)';
      zones.appendChild(sp);
    }
  });
}

function checkNeutralityBuilder() {
  var zones = document.querySelectorAll('#neutrality-zones .drop-zone');
  var ans = ['n', 'Na-', 'eq', 'p', 'Nd+'];
  var ok = true;
  zones.forEach(function (z, i) {
    if ((z.dataset.placed || '') !== ans[i]) ok = false;
  });
  var fb = document.getElementById('neutrality-feedback');
  fb.textContent = ok ? 'Correct! n + Na⁻ = p + Nd⁺' : 'Some terms are misplaced. The full neutrality equation is n + Na⁻ = p + Nd⁺.';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) {
    _GameState.addXP(120, 'ds_puzzles');
    _GameState.earnedBadges.add('neutrality-expert');
    _GameState.save();
    updateScoreboardDS();
  }
}

/* ═══════════════════════════════════════════════════════════════
   PUZZLE 3: Donor vs Acceptor Detective
   Match material/impurity pairs to n-type or p-type.
   ═══════════════════════════════════════════════════════════════ */
var dopeDetective = {
  pool: [
    { pair: 'Si + Phosphorus', type: 'n-type' },
    { pair: 'Si + Boron', type: 'p-type' },
    { pair: 'Ge + Arsenic', type: 'n-type' },
    { pair: 'GaAs + Zinc', type: 'p-type' },
    { pair: 'Si + Aluminum', type: 'p-type' }
  ]
};

function initDopeDetective() {
  var list = document.getElementById('detective-list');
  if (!list) return;
  list.innerHTML = '';
  // Shuffle
  var shuffled = dopeDetective.pool.slice().sort(function () { return Math.random() - 0.5; });
  shuffled.forEach(function (item, i) {
    var row = document.createElement('div');
    row.style.cssText = 'margin:0.5rem 0;padding:0.5rem;background:var(--bg-elevated);border-radius:6px;font-size:0.88rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;';
    row.innerHTML = '<span style="color:var(--accent-cyan);font-weight:600;">' + item.pair + '</span> → ' +
      '<select id="det-sel-' + i + '" data-ans="' + item.type + '" style="background:var(--bg-panel);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="" disabled selected>choose</option>' +
      '<option value="n-type">n-type</option><option value="p-type">p-type</option></select>';
    list.appendChild(row);
  });
}

function checkDopeDetective() {
  var fb = document.getElementById('detective-feedback');
  if (!fb) return;
  var ok = true;
  var selects = document.querySelectorAll('#detective-list select');
  selects.forEach(function (sel) {
    if (sel.value !== sel.dataset.ans) ok = false;
  });
  fb.textContent = ok ? 'All pairs matched correctly! Donors → n-type, Acceptors → p-type.' : 'Some matches are wrong. Group V donors give n-type; Group III acceptors give p-type.';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) {
    _GameState.addXP(120, 'ds_puzzles');
    _GameState.earnedBadges.add('detector-dope');
    _GameState.save();
    updateScoreboardDS();
  }
}

/* ═══════════════════════════════════════════════════════════════
   GAME MODE SWITCHER
   ═══════════════════════════════════════════════════════════════ */
function setGameMode(mode) {
  document.querySelectorAll('.game-mode-btn').forEach(function (b) { b.classList.remove('active'); });
  var btn = document.getElementById('mode-' + mode);
  if (btn) btn.classList.add('active');
  ['story', 'theory', 'play', 'challenge', 'puzzle'].forEach(function (m) {
    var el = document.getElementById('section-' + m);
    if (el) el.style.display = (m === mode) ? 'block' : 'none';
  });
  if (mode === 'challenge') {
    startTypeChallenge();
    startNdChallenge();
    startCompChallenge();
  }
  if (mode === 'puzzle') {
    initFermiSliderPuzzle();
    initNeutralityBuilder();
    initDopeDetective();
  }
  // Playground init deferred — handled by HTML wrapper
}

/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */
function initDSGames() {
  buildModuleNavDS();
  updateScoreboardDS();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDSGames);
} else {
  initDSGames();
}

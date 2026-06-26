
/* ═══════════════════════════════════════════════════════════════
   tf_apps_games.js  —  Module 12 — Optics & Dispersion: Challenges, Puzzles, Nav
   ═══════════════════════════════════════════════════════════════ */

/* ── Module Navigation ── */
var OD_MODULE_NAV = [
  { name: 'Crystal to Quantum',   path: '../00_crystal_to_quantum/index.html', current: false },
  { name: 'QHO',                path: '../01_qho/index.html', current: false },
  { name: 'Hydrogen',           path: '../02_hydrogen/index.html', current: false },
  { name: 'Spin',               path: '../03_spin/index.html', current: false },
  { name: 'Kronig-Penney',      path: '../04_kronig_penney/index.html', current: false },
  { name: 'Energy Bands',       path: '../05_energy_bands/index.html', current: false },
  { name: 'Fermi Surface',      path: '../06_fermi_surface/index.html', current: false },
  { name: 'Conductivity',       path: '../07_conductivity/index.html', current: false },
  { name: 'Superconductivity',  path: '../08_superconductivity/index.html', current: false },
  { name: 'Intrinsic Semi',     path: '../09_intrinsic_semiconductors/index.html', current: false },
  { name: 'Doped Semi',         path: '../10_doped_semiconductors/index.html', current: false },
  { name: 'Junctions',          path: '../11_junctions_devices/index.html', current: false },
  { name: 'Optics &amp; Dispersion', path: './index.html', current: true },
  { name: 'Lasers',             path: '../13_laser_physics/index.html', current: false },
  { name: 'Magnetism',          path: '../14_magnetism/index.html', current: false },
  { name: 'Thermal',            path: '../15_thermal_properties/index.html', current: false },
];

/* ── Badges ── */
var OD_BADGES = [
  { id: 'od-explorer', name: 'Optics Explorer',         desc: 'First playground visit',      icon: '\u{1F50D}' },
  { id: 'od-airy',     name: 'Airy Master',             desc: 'Match an Airy fringe prediction', icon: '\u{1F4CA}' },
  { id: 'od-coating',  name: 'AR Coating Designer',     desc: 'Solve the AR puzzle',         icon: '\u{1F9EA}' },
  { id: 'od-champ',    name: 'Optics Champion',         desc: 'Score 5/5 in challenges',     icon: '\u{1F3C6}' }
];

/* ── Challenge Bank ── */
var OD_CHALLENGE_BANK = [
  {
    q: "For air/SiO\u2082/Si with d=195 nm and \u03bb=620 nm, which outcome is dominant?",
    options: ["High reflection (R \u2248 65%)", "High transmission (T \u2248 80%)", "Total absorption", "R = T = 50%"],
    answer: 0, xp: 20,
    hint: "SiO\u2082 on Si has a large index contrast at the 2\u21923 interface, giving strong reflection."
  },
  {
    q: "A quarter-wave AR coating needs d = ? for n\u2082=1.38, n\u2083=1.52, \u03bb=550 nm.",
    options: ["d \u2248 100 nm", "d \u2248 200 nm", "d \u2248 550 nm", "d \u2248 380 nm"],
    answer: 0, xp: 25,
    hint: "Quarter-wave: d = \u03bb / (4 n\u2082) = 550 / (4 \u00d7 1.38) \u2248 100 nm."
  },
  {
    q: "If n\u2081 < n\u2082 < n\u2083 and \u03b8\u2081 increases, what happens to \u03b8\u2082?",
    options: ["\u03b8\u2082 increases", "\u03b8\u2082 decreases", "\u03b8\u2082 stays constant", "TIR occurs immediately"],
    answer: 0, xp: 15,
    hint: "Snell: n\u2081 sin \u03b8\u2081 = n\u2082 sin \u03b8\u2082 \u2192 larger \u03b8\u2081 means larger \u03b8\u2082."
  },
  {
    q: "At what \u03b2 does constructive interference in reflection occur?",
    options: ["\u03b2 = m\u03c0", "\u03b2 = (2m+1)\u03c0/2", "\u03b2 = m\u03c0/2", "\u03b2 = 0"],
    answer: 0, xp: 20,
    hint: "2\u03b2 = 2m\u03c0 \u2192 \u03b2 = m\u03c0 gives e^{2i\u03b2} = 1, adding r\u2081\u2082 + r\u2082\u2083 constructively."
  },
  {
    q: "For a soap film (n\u2082\u22481.33, d=400 nm) in air, at \u03bb=550 nm what colour is dominant in reflection?",
    options: ["Green (\u03bb\u2248550 nm reflected)", "Magenta (green absorbed)", "White", "Black (no reflection)"],
    answer: 0, xp: 20,
    hint: "Compute \u03b2: (2\u03c0/550)\u00d71.33\u00d7400\u00d7cos(0) \u2248 6.07 rad \u2248 1.93\u03c0 \u2192 near constructive."
  }
];

/* ── AR Puzzle Data ── */
var OD_PUZZLE_BANK = [
  { substrate: 'Si (n=3.5)',   correctN2: 1.87, correctD: 78,  n2Tol: 0.15, dTol: 12 },
  { substrate: 'Glass (n=1.5)', correctN2: 1.22, correctD: 112, n2Tol: 0.10, dTol: 15 },
  { substrate: 'GaAs (n=3.4)', correctN2: 1.84, correctD: 80,  n2Tol: 0.15, dTol: 12 }
];

/* ═══════════════════════ Challenge Engine ═══════════════════════ */

var odCh = { score: 0, combo: 0, current: null, timeLeft: 20, timer: null, total: 0 };

function initODChallenge() {
  odCh.score = 0; odCh.combo = 0; odCh.total = 0;
  nextODChallenge();
}

function nextODChallenge() {
  clearInterval(odCh.timer);
  var idx = Math.floor(Math.random() * OD_CHALLENGE_BANK.length);
  odCh.current = OD_CHALLENGE_BANK[idx];
  odCh.total++;
  odCh.timeLeft = 20;
  document.getElementById('ch-question').textContent = odCh.current.q;
  var opts = document.getElementById('ch-options');
  opts.innerHTML = '';
  for (var i = 0; i < odCh.current.options.length; i++) {
    var btn = document.createElement('button');
    btn.className = 'submit-btn';
    btn.textContent = odCh.current.options[i];
    btn.onclick = (function(ans) { return function() { guessODChallenge(ans); }; })(i);
    opts.appendChild(btn);
  }
  document.getElementById('ch-feedback').textContent = '';
  startODTimer(20);
}

function startODTimer(seconds) {
  var fill = document.getElementById('ch-timer');
  fill.style.width = '100%';
  odCh.timer = setInterval(function() {
    odCh.timeLeft--;
    fill.style.width = (odCh.timeLeft / seconds * 100) + '%';
    if (odCh.timeLeft <= 10) fill.classList.add('urgent');
    if (odCh.timeLeft <= 0) { clearInterval(odCh.timer); guessODChallenge(-1); }
  }, 1000);
}

function guessODChallenge(ans) {
  clearInterval(odCh.timer);
  var fb = document.getElementById('ch-feedback');
  if (ans === odCh.current.answer) {
    odCh.combo++;
    var bonus = odCh.combo >= 3 ? 5 : 0;
    var gain = odCh.current.xp + bonus;
    odCh.score += gain;
    fb.innerHTML = '\u2705 Correct! +' + gain + ' XP' + (bonus > 0 ? ' (combo!)' : '');
    _GameState.addXP(gain);
    if (odCh.score >= 100) grantODBadge('od-airy');
    if (odCh.combo >= 5) grantODBadge('od-champ');
  } else {
    odCh.combo = 0;
    fb.innerHTML = '\u274C Wrong. ' + odCh.current.hint;
  }
  updateODScoreboard();
  _GameState.save();
  setTimeout(nextODChallenge, 2500);
}

/* ═══════════════════════ Puzzle Engine ═══════════════════════ */

function initODPuzzle() {
  var list = document.getElementById('puz-list');
  list.innerHTML = '';
  for (var i = 0; i < OD_PUZZLE_BANK.length; i++) {
    var p = OD_PUZZLE_BANK[i];
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:12px;align-items:center;margin:8px 0;flex-wrap:wrap;';
    row.innerHTML =
      '\u003cspan style="min-width:140px;font-weight:600;color:var(--text-bright);"\u003e' + p.substrate + '\u003c/span\u003e' +
      '\u003clabel\u003en\u2082: \u003cinput type="number" step="0.01" id="pz-n2-' + i + '" style="width:70px;"\u003e\u003c/label\u003e' +
      '\u003clabel\u003ed (nm): \u003cinput type="number" step="1" id="pz-d-' + i + '" style="width:70px;"\u003e\u003c/label\u003e';
    list.appendChild(row);
  }
}

function checkODPuzzle() {
  var ok = 0, total = OD_PUZZLE_BANK.length;
  for (var i = 0; i < total; i++) {
    var p = OD_PUZZLE_BANK[i];
    var n2el = document.getElementById('pz-n2-' + i);
    var dEl  = document.getElementById('pz-d-' + i);
    var n2 = parseFloat(n2el ? n2el.value : '0');
    var d  = parseFloat(dEl  ? dEl.value  : '0');
    if (Math.abs(n2 - p.correctN2) <= p.n2Tol && Math.abs(d - p.correctD) <= p.dTol) ok++;
  }
  var fb = document.getElementById('puz-feedback');
  if (ok === total) {
    fb.innerHTML = '\u2705 Perfect! +' + (ok * 20) + ' XP';
    _GameState.addXP(ok * 20);
    grantODBadge('od-coating');
  } else {
    fb.innerHTML = ok + '/' + total + ' correct. Hint: n\u2082 \u2248 \u221a(n\u2081n\u2083) and d = \u03bb/(4n\u2082). ' +
      'For Si: n\u2082 \u2248 1.87, d \u2248 78 nm at \u03bb=550 nm.';
  }
  document.getElementById('stat-puzzles').textContent = ok + '/' + total;
  updateODScoreboard();
  _GameState.save();
}

/* ═══════════════════════ Badge / Scoreboard ═══════════════════════ */

function grantODBadge(id) {
  if (_GameState.earnedBadges.has(id)) return;
  _GameState.earnedBadges.add(id);
  var b = OD_BADGES.find(function(x) { return x.id === id; });
  if (b) _GameState.addXP(30);
}

function renderODBadges() {
  var box = document.getElementById('badge-list');
  if (!box) return;
  box.innerHTML = '';
  for (var i = 0; i < OD_BADGES.length; i++) {
    var b = OD_BADGES[i];
    var earned = _GameState.earnedBadges.has(b.id);
    var el = document.createElement('span');
    el.className = 'material-badge';
    el.style.cssText = earned
      ? 'color:#4ade80;border-color:#4ade80;background:rgba(74,222,128,0.08);'
      : 'color:var(--text-muted);border-color:var(--glass-border);background:transparent;';
    el.textContent = b.icon + ' ' + b.name;
    el.title = b.desc;
    box.appendChild(el);
  }
}

function updateODScoreboard() {
  document.getElementById('stat-challenges').textContent = odCh.score > 0 ? odCh.score : '0';
  var pu = document.getElementById('stat-puzzles').textContent || '0';
  document.getElementById('stat-badges').textContent = _GameState.earnedBadges.size;
  document.getElementById('stat-xp').textContent = _GameState.xp ? _GameState.xp() : 0;
  document.getElementById('nav-xp').textContent = (_GameState.xp ? _GameState.xp() : 0) + ' XP';
  renderODBadges();
}

/* ═══════════════════════ Module Nav Render ═══════════════════════ */

function renderODModuleNav() {
  var box = document.getElementById('module-nav');
  if (!box) return;
  box.innerHTML = '';
  for (var i = 0; i < OD_MODULE_NAV.length; i++) {
    var m = OD_MODULE_NAV[i];
    var a = document.createElement('a');
    a.href = m.path;
    a.textContent = m.name;
    a.style.cssText = 'display:block;padding:4px 0;font-size:0.82rem;color:' +
      (m.current ? 'var(--accent-cyan)' : 'var(--text-muted)') + ';text-decoration:none;';
    if (m.current) a.style.fontWeight = '600';
    box.appendChild(a);
  }
}

/* ═══════════════════════ Mode Switch Hook ═══════════════════════ */

var _prevODMode = '';
var _origSetGameMode = window.setGameMode;
window.setGameMode = function(mode) {
  if (typeof _origSetGameMode === 'function') _origSetGameMode(mode);

  if (mode === 'challenge') { initODChallenge(); }
  else if (mode === 'puzzle') { initODPuzzle(); }
  else if (mode === 'play') {
    /* Deferred init: init Playground on first access */
    if (typeof initODPlayground === 'function') initODPlayground();
    /* Show default sub-tab (Snell) */
    if (typeof odSubTab === 'function') odSubTab('snell');
  }

  /* Stop attenuation animation when leaving Playground */
  if (_prevODMode === 'play' && mode !== 'play') {
    if (typeof _odStopSkinAnim === 'function') _odStopSkinAnim();
  }
  _prevODMode = mode;
};

/* ═══════════════════════ Init ── */

function initODGames() {
  renderODModuleNav();
  updateODScoreboard();
  grantODBadge('od-explorer');
}
window.initODGames = initODGames;

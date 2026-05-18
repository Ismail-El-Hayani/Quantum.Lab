/**
 * Thermal Properties — Challenges + Puzzles
 */
'use strict';
var TP_MODULE_NAV = [
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
  { name: 'Doped Semi', path: '../10_doped_semiconductors/index.html', current: false },
  { name: 'Junctions', path: '../11_junctions_devices/index.html', current: false },
  { name: 'Optics', path: '../12_optics_dispersion/index.html', current: false },
  { name: 'Lasers', path: '../13_laser_physics/index.html', current: false },
  { name: 'Magnetism', path: '../14_magnetism/index.html', current: false },
  { name: 'Thermal', path: './index.html', current: true }
];
function buildModuleNavTP() {
  var el = document.getElementById('module-nav'); if (!el) return;
  el.innerHTML = '';
  TP_MODULE_NAV.forEach(function(m) { var a = document.createElement('a'); a.href = m.path; a.textContent = m.name; a.className = 'nav-link' + (m.current ? ' current' : ''); if (m.current) a.style.fontWeight = '700'; el.appendChild(a); });
}
var TP_BADGES = [
  { id: 'tp-explorer', name: 'Thermal Explorer', desc: 'First playground exploration', icon: '🔥' },
  { id: 'debye-sage', name: 'Debye Sage', desc: 'Debye T³ challenge solved', icon: '📐' },
  { id: 'metal-insulator', name: 'M/I Classifier', desc: 'Metal/insulator challenge done', icon: '🎯' },
  { id: 'wf-master', name: 'W-F Master', desc: 'Wiedemann-Franz challenge done', icon: '⚡' },
  { id: 'cv-builder', name: 'Cv Builder', desc: 'Built low-T Cv formula', icon: '🔧' },
  { id: 'expansion-sage', name: 'Expansion Sage', desc: 'Thermal expansion puzzle solved', icon: '📏' }
];
function renderBadgesTP() {
  var el = document.getElementById('badge-list'); if (!el || !window._GameState) return;
  var s = _GameState.earnedBadges;
  var earned = TP_BADGES.filter(function(b){ return s.has(b.id); });
  var pending = TP_BADGES.filter(function(b){ return !s.has(b.id); });
  var html = '';
  if (earned.length) { html += '<div style="margin-bottom:0.5rem;color:var(--accent-green);">✨ Earned:</div>'; earned.forEach(function(b){ html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:rgba(0,240,255,0.08);border:1px solid var(--accent-cyan);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>'; }); }
  if (pending.length) { html += '<div style="margin:0.5rem 0;color:var(--text-dim);">🔒 Pending:</div>'; pending.forEach(function(b){ html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-dim);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>'; }); }
  el.innerHTML = html || 'Complete challenges to earn badges!';
}
function updateScoreboardTP() {
  if (!window._GameState) return;
  var elCh = document.getElementById('stat-challenges'), elPuz = document.getElementById('stat-puzzles'), elXP = document.getElementById('stat-xp'), elBad = document.getElementById('stat-badges');
  if (elCh) elCh.textContent = _GameState.moduleScores['tp_challenges'] || 0;
  if (elPuz) elPuz.textContent = _GameState.moduleScores['tp_puzzles'] || 0;
  if (elXP) elXP.textContent = _GameState.xp;
  if (elBad) elBad.textContent = _GameState.earnedBadges.size;
  var elNav = document.getElementById('nav-xp'); if (elNav) elNav.textContent = _GameState.xp + ' XP';
  renderBadgesTP();
}

/* ---- Challenge 1: metal or insulator ---- */
var tpCh = { score: 0, combo: 0, current: null, timeLeft: 15, timer: null };
function startTPChallenge() {
  var txt = document.getElementById('tp-target-text'); if (!txt) return;
  var opts = [
    { desc: 'Low-T Cv ∝ T', answer: 'metal' },
    { desc: 'Low-T Cv ∝ T³', answer: 'insulator' },
    { desc: 'High-T Cv ≈ 25 J/mol·K', answer: 'insulator' },
    { desc: 'High-T Cv slightly > 25 J/mol·K', answer: 'metal' }
  ];
  tpCh.current = opts[Math.floor(Math.random() * opts.length)];
  txt.innerHTML = '<strong>' + tpCh.current.desc + '</strong><br><span style="font-size:1.2rem;">Metal or insulator?</span>';
  tpCh.timeLeft = 15; updateTPTimer();
  clearInterval(tpCh.timer);
  tpCh.timer = setInterval(function() { tpCh.timeLeft -= 1; updateTPTimer(); if (tpCh.timeLeft <= 0) { clearInterval(tpCh.timer); showTPFB(false, 'Time up!'); nextTP(); } }, 1000);
}
function updateTPTimer() { var el = document.getElementById('tp-timer'); if (el) el.style.width = (tpCh.timeLeft / 15 * 100) + '%'; }
function guessTP(g) {
  clearInterval(tpCh.timer);
  var ok = g === tpCh.current.answer;
  if (ok) { tpCh.score += 50 + tpCh.combo * 5; tpCh.combo++; showTPFB(true, 'Correct! +' + (50 + (tpCh.combo - 1) * 5) + ' XP'); }
  else { tpCh.combo = 0; showTPFB(false, 'Incorrect.'); }
  document.getElementById('tp-score').textContent = tpCh.score;
  document.getElementById('tp-combo').textContent = tpCh.combo;
  if (tpCh.score >= 150 && window._GameState) _GameState.earnedBadges.add('metal-insulator');
  if (window._GameState) { _GameState.addXP(ok ? 50 : 10, 'tp_challenges'); _GameState.moduleScores['tp_challenges'] = tpCh.score; _GameState.save(); }
  updateScoreboardTP(); setTimeout(nextTP, 1200);
}
function showTPFB(ok, msg) { var el = document.getElementById('tp-feedback'); if (!el) return; el.textContent = msg; el.className = 'challenge-feedback ' + (ok ? 'success' : 'error'); }
function nextTP() { startTPChallenge(); }

/* ---- Challenge 2: Debye temperature ---- */
var debyeCh = { theta: 0 };
function startDebyeChallenge() {
  var txt = document.getElementById('debye-target-text'); if (!txt) return;
  var theta = 200 + Math.floor(Math.random() * 400);
  debyeCh.theta = theta;
  txt.innerHTML = 'At T ≪ θD, Cv ∝ T³ with prefactor matching θD ≈ ' + theta + ' K.<br>What is θD?';
}
function checkDebye() {
  var val = document.getElementById('debye-ans'); var fb = document.getElementById('debye-feedback');
  if (!val || !fb) return;
  var guess = Number.parseFloat(val.value);
  var ok = Math.abs(guess - debyeCh.theta) < 25;
  fb.textContent = ok ? 'Correct! θD ≈ ' + debyeCh.theta + ' K' : 'Hint: compare your T³ slope to the Debye formula.';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'hint');
  if (ok && window._GameState) { _GameState.addXP(75, 'tp_challenges'); _GameState.earnedBadges.add('debye-sage'); _GameState.save(); updateScoreboardTP(); }
}

/* ---- Challenge 3: Wiedemann-Franz ---- */
var wfCh = { kappa: 0 };
function startWFChallenge() {
  var txt = document.getElementById('wf-target-text'); if (!txt) return;
  var sigma = 1e6 + Math.random() * 4e7, T = 200 + Math.floor(Math.random() * 200);
  wfCh.kappa = 2.44e-8 * sigma * T;
  txt.innerHTML = 'σ=' + sigma.toExponential(1) + ' S/m, T=' + T + ' K.<br>Estimate κ (W/m·K) using the Wiedemann-Franz law.';
}
function checkWF() {
  var val = document.getElementById('wf-ans'); var fb = document.getElementById('wf-feedback');
  if (!val || !fb) return;
  var guess = Number.parseFloat(val.value);
  var ok = Math.abs(guess - wfCh.kappa) / wfCh.kappa < 0.2;
  fb.textContent = ok ? 'Correct! κ ≈ ' + wfCh.kappa.toFixed(1) + ' W/m·K' : 'Hint: κ = L₀·σ·T with L₀≈2.44×10⁻⁸ W·Ω/K².';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'hint');
  if (ok && window._GameState) { _GameState.addXP(100, 'tp_challenges'); _GameState.earnedBadges.add('wf-master'); _GameState.save(); updateScoreboardTP(); }
}

/* ---- Puzzle 1: Build Cv(T) formula ---- */
function initTPBuilder() {
  var pool = document.getElementById('tp-pool'); if (!pool) return;
  var terms = ['Cv', '=', 'β', 'T³', '+', 'γ', 'T'];
  pool.innerHTML = '';
  terms.forEach(function(t) { var s = document.createElement('span'); s.textContent = t; s.className = 'draggable-target'; s.setAttribute('draggable', 'true'); s.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text', t); }); pool.appendChild(s); });
  var zones = document.getElementById('tp-zones'); zones.innerHTML = '';
  terms.forEach(function(lbl, i) { var z = document.createElement('div'); z.className = 'drop-zone'; z.style.minHeight = '36px'; z.style.minWidth = '36px'; z.dataset.idx = i; z.addEventListener('dragover', function(e) { e.preventDefault(); z.classList.add('dragover'); }); z.addEventListener('dragleave', function() { z.classList.remove('dragover'); }); z.addEventListener('drop', function(e) { e.preventDefault(); z.classList.remove('dragover'); z.textContent = e.dataTransfer.getData('text'); }); zones.appendChild(z); });
}
function checkTPBuilder() {
  var zones = document.querySelectorAll('#tp-zones .drop-zone');
  var ans = ['Cv', '=', 'β', 'T³', '+', 'γ', 'T'];
  var ok = true; zones.forEach(function(z, i) { if ((z.textContent || '').trim() !== ans[i]) ok = false; });
  var fb = document.getElementById('tp-builder-feedback');
  fb.textContent = ok ? 'Perfect! Cv = βT³ + γT.' : 'Some terms misplaced.'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(60, 'tp_puzzles'); _GameState.earnedBadges.add('cv-builder'); _GameState.save(); updateScoreboardTP(); }
}

/* ---- Puzzle 2: Debye vs Einstein ---- */
function initModelPuzzle() {
  var list = document.getElementById('model-list'); if (!list) return;
  var items = [
    { text: 'One characteristic vibrational frequency', answer: 'Einstein' },
    { text: 'Acoustic phonon spectrum up to ωD', answer: 'Debye' },
    { text: 'Cv ∝ T³ at low T', answer: 'Debye' },
    { text: 'Cv drops exponentially at low T', answer: 'Einstein' }
  ];
  list.innerHTML = '';
  items.forEach(function(it, i) {
    var row = document.createElement('div'); row.style.marginBottom = '0.5rem';
    row.innerHTML = '<span style="color:var(--text-muted);">' + it.text + '</span> — ' +
      '<select id="model-sel-' + i + '" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="">select</option><option value="Debye">Debye</option><option value="Einstein">Einstein</option></select>';
    list.appendChild(row);
  });
  list.dataset.items = JSON.stringify(items);
}
function checkModelPuzzle() {
  var list = document.getElementById('model-list'); var items = JSON.parse(list.dataset.items || '[]'); var ok = true;
  items.forEach(function(it, i) { var sel = document.getElementById('model-sel-' + i); if (!sel || sel.value !== it.answer) ok = false; });
  var fb = document.getElementById('model-feedback'); fb.textContent = ok ? 'All correct!' : 'Review the Debye and Einstein assumptions.'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(70, 'tp_puzzles'); _GameState.save(); updateScoreboardTP(); }
}

/* ---- Puzzle 3: thermal expansion ---- */
function initExpPuzzle() {
  var list = document.getElementById('exp-list'); if (!list) return;
  var items = [
    { text: 'Thermal expansion arises because the interatomic potential is', answer: 'anharmonic' },
    { text: 'In a purely harmonic potential, expansion would be', answer: 'zero' },
    { text: 'At T→0 K, thermal expansion tends to', answer: 'zero' }
  ];
  list.innerHTML = '';
  items.forEach(function(it, i) {
    var row = document.createElement('div'); row.style.marginBottom = '0.5rem';
    row.innerHTML = '<span style="color:var(--text-muted);">' + it.text + '</span> — ' +
      '<select id="exp-sel-' + i + '" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="">select</option><option value="anharmonic">anharmonic</option><option value="harmonic">harmonic</option><option value="zero">zero</option><option value="infinite">infinite</option></select>';
    list.appendChild(row);
  });
  list.dataset.items = JSON.stringify(items);
}
function checkExpPuzzle() {
  var list = document.getElementById('exp-list'); var items = JSON.parse(list.dataset.items || '[]'); var ok = true;
  items.forEach(function(it, i) { var sel = document.getElementById('exp-sel-' + i); if (!sel || sel.value !== it.answer) ok = false; });
  var fb = document.getElementById('exp-feedback'); fb.textContent = ok ? 'All correct! Anharmonicity is the key.' : 'Review the origin of thermal expansion.'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(120, 'tp_puzzles'); _GameState.earnedBadges.add('expansion-sage'); _GameState.save(); updateScoreboardTP(); }
}

function initTPGames() {
  buildModuleNavTP(); startTPChallenge(); startDebyeChallenge(); startWFChallenge(); updateScoreboardTP();
  initTPBuilder(); initModelPuzzle(); initExpPuzzle();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTPGames); else initTPGames();

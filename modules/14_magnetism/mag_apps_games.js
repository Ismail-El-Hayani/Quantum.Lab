/**
 * Magnetism — Challenges + Puzzles
 */
'use strict';
var MAG_MODULE_NAV = [
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
  { name: 'Magnetism', path: './index.html', current: true },
  { name: 'Thermal', path: '../15_thermal_properties/index.html', current: false }
];
function buildModuleNavMAG() {
  var el = document.getElementById('module-nav'); if (!el) return;
  el.innerHTML = '';
  MAG_MODULE_NAV.forEach(function(m) { var a = document.createElement('a'); a.href = m.path; a.textContent = m.name; a.className = 'nav-link' + (m.current ? ' current' : ''); if (m.current) a.style.fontWeight = '700'; el.appendChild(a); });
}
var MAG_BADGES = [
  { id: 'mag-explorer', name: 'Magnetism Explorer', desc: 'First playground exploration', icon: '🧲' },
  { id: 'classifier', name: 'Classifier', desc: 'Dia/Para/Ferro challenge done', icon: '🎯' },
  { id: 'curie-hunter', name: 'Curie Hunter', desc: 'Tc estimator solved', icon: '🌡' },
  { id: 'gmr-sage', name: 'GMR Sage', desc: 'GMR challenge done', icon: '📊' },
  { id: 'order-master', name: 'Order Master', desc: 'Ordering puzzle solved', icon: '🔧' },
  { id: 'hyst-architect', name: 'Hyst Architect', desc: 'Hysteresis puzzle done', icon: '🏗' }
];
function renderBadgesMAG() {
  var el = document.getElementById('badge-list'); if (!el || !window._GameState) return;
  var s = _GameState.earnedBadges;
  var earned = MAG_BADGES.filter(function(b){ return s.has(b.id); });
  var pending = MAG_BADGES.filter(function(b){ return !s.has(b.id); });
  var html = '';
  if (earned.length) { html += '<div style="margin-bottom:0.5rem;color:var(--accent-green);">✨ Earned:</div>'; earned.forEach(function(b){ html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:rgba(0,240,255,0.08);border:1px solid var(--accent-cyan);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>'; }); }
  if (pending.length) { html += '<div style="margin:0.5rem 0;color:var(--text-dim);">🔒 Pending:</div>'; pending.forEach(function(b){ html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-dim);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>'; }); }
  el.innerHTML = html || 'Complete challenges to earn badges!';
}
function updateScoreboardMAG() {
  if (!window._GameState) return;
  var elCh = document.getElementById('stat-challenges'), elPuz = document.getElementById('stat-puzzles'), elXP = document.getElementById('stat-xp'), elBad = document.getElementById('stat-badges');
  if (elCh) elCh.textContent = _GameState.moduleScores['mag_challenges'] || 0;
  if (elPuz) elPuz.textContent = _GameState.moduleScores['mag_puzzles'] || 0;
  if (elXP) elXP.textContent = _GameState.xp;
  if (elBad) elBad.textContent = _GameState.earnedBadges.size;
  var elNav = document.getElementById('nav-xp'); if (elNav) elNav.textContent = _GameState.xp + ' XP';
  renderBadgesMAG();
}

/* ---- Challenge 1: material classifier ---- */
var magCh = { score: 0, combo: 0, current: null, timeLeft: 15, timer: null };
function startMagChallenge() {
  var txt = document.getElementById('mag-target-text'); if (!txt) return;
  var opts = [
    { desc: 'χ < 0 at all T', answer: 'diamagnet' },
    { desc: 'χ > 0 and χ ∝ 1/T', answer: 'paramagnet' },
    { desc: 'Spontaneous M even at H=0 below Tc', answer: 'ferromagnet' },
    { desc: 'Antiparallel ordering with zero net M', answer: 'diamagnet' }
  ];
  magCh.current = opts[Math.floor(Math.random() * opts.length)];
  txt.innerHTML = '<strong>' + magCh.current.desc + '</strong><br><span style="font-size:1.2rem;">Which magnetic class?</span>';
  magCh.timeLeft = 15; updateMagTimer();
  clearInterval(magCh.timer);
  magCh.timer = setInterval(function() { magCh.timeLeft -= 1; updateMagTimer(); if (magCh.timeLeft <= 0) { clearInterval(magCh.timer); showMagFB(false, 'Time up!'); nextMag(); } }, 1000);
}
function updateMagTimer() { var el = document.getElementById('mag-timer'); if (el) el.style.width = (magCh.timeLeft / 15 * 100) + '%'; }
function guessMag(g) {
  clearInterval(magCh.timer);
  var ok = g === magCh.current.answer;
  if (ok) { magCh.score += 50 + magCh.combo * 5; magCh.combo++; showMagFB(true, 'Correct! +' + (50 + (magCh.combo - 1) * 5) + ' XP'); }
  else { magCh.combo = 0; showMagFB(false, 'Incorrect.'); }
  document.getElementById('mag-score').textContent = magCh.score;
  document.getElementById('mag-combo').textContent = magCh.combo;
  if (magCh.score >= 150 && window._GameState) _GameState.earnedBadges.add('classifier');
  if (window._GameState) { _GameState.addXP(ok ? 50 : 10, 'mag_challenges'); _GameState.moduleScores['mag_challenges'] = magCh.score; _GameState.save(); }
  updateScoreboardMAG(); setTimeout(nextMag, 1200);
}
function showMagFB(ok, msg) { var el = document.getElementById('mag-feedback'); if (!el) return; el.textContent = msg; el.className = 'challenge-feedback ' + (ok ? 'success' : 'error'); }
function nextMag() { startMagChallenge(); }

/* ---- Challenge 2: Curie temperature ---- */
var tcMagCh = { theta: 0 };
function startTcMagChallenge() {
  var txt = document.getElementById('tc-mag-text'); if (!txt) return;
  var theta = 50 + Math.floor(Math.random() * 250);
  tcMagCh.theta = theta;
  txt.innerHTML = 'Curie-Weiss fit gives χ = C/(T − θ) with θ ≈ ' + theta + ' K.<br>What is the approximate Curie temperature Tc?';
}
function checkTcMag() {
  var val = document.getElementById('tc-mag-ans'); var fb = document.getElementById('tc-mag-feedback');
  if (!val || !fb) return;
  var guess = parseFloat(val.value);
  var ok = Math.abs(guess - tcMagCh.theta) < 15;
  fb.textContent = ok ? 'Correct! Tc ≈ ' + tcMagCh.theta + ' K' : 'Hint: Tc ≈ θ in the Curie-Weiss model.';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'hint');
  if (ok && window._GameState) { _GameState.addXP(75, 'mag_challenges'); _GameState.earnedBadges.add('curie-hunter'); _GameState.save(); updateScoreboardMAG(); }
}

/* ---- Challenge 3: GMR sign ---- */
var gmrCh = { current: null };
function startGMRChallenge() {
  var txt = document.getElementById('gmr-target-text'); if (!txt) return;
  gmrCh.current = { answer: 'decrease' };
  txt.innerHTML = 'In a magnetic multilayer, applying an external field aligns the moments of adjacent layers.<br>Does the resistance increase or decrease?';
}
function guessGMR(g) {
  var fb = document.getElementById('gmr-feedback'); if (!fb) return;
  var ok = g === gmrCh.current.answer;
  fb.textContent = ok ? 'Correct! Aligned layers reduce spin-dependent scattering, lowering R.' : 'Incorrect. The resistance decreases.';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(100, 'mag_challenges'); _GameState.earnedBadges.add('gmr-sage'); _GameState.save(); updateScoreboardMAG(); }
}

/* ---- Puzzle 1: ordering match ---- */
function initOrderPuzzle() {
  var list = document.getElementById('order-list'); if (!list) return;
  var items = [
    { text: 'Spontaneous M, hysteresis, Tc', answer: 'ferromagnet' },
    { text: 'χ < 0, no T dependence', answer: 'diamagnet' },
    { text: 'Antiparallel sublattices, TN', answer: 'antiferromagnet' },
    { text: 'Antiparallel sublattices, unequal moments', answer: 'ferrimagnet' }
  ];
  list.innerHTML = '';
  items.forEach(function(it, i) {
    var row = document.createElement('div'); row.style.marginBottom = '0.5rem';
    row.innerHTML = '<span style="color:var(--text-muted);">' + it.text + '</span> — ' +
      '<select id="order-sel-' + i + '" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="">select</option><option value="ferromagnet">ferromagnet</option><option value="diamagnet">diamagnet</option><option value="paramagnet">paramagnet</option><option value="antiferromagnet">antiferromagnet</option><option value="ferrimagnet">ferrimagnet</option></select>';
    list.appendChild(row);
  });
  list.dataset.items = JSON.stringify(items);
}
function checkOrderPuzzle() {
  var list = document.getElementById('order-list'); var items = JSON.parse(list.dataset.items || '[]'); var ok = true;
  items.forEach(function(it, i) { var sel = document.getElementById('order-sel-' + i); if (!sel || sel.value !== it.answer) ok = false; });
  var fb = document.getElementById('order-feedback'); fb.textContent = ok ? 'All correct!' : 'Review the magnetic classes.'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(60, 'mag_puzzles'); _GameState.earnedBadges.add('order-master'); _GameState.save(); updateScoreboardMAG(); }
}

/* ---- Puzzle 2: hysteresis parameters ---- */
function initHystPuzzle() {
  var list = document.getElementById('hyst-list'); if (!list) return;
  var items = [
    { text: 'Field needed to reduce M to zero', answer: 'coercivity' },
    { text: 'M remaining after removing H', answer: 'remanence' },
    { text: 'Maximum M at high H', answer: 'saturation' }
  ];
  list.innerHTML = '';
  items.forEach(function(it, i) {
    var row = document.createElement('div'); row.style.marginBottom = '0.5rem';
    row.innerHTML = '<span style="color:var(--text-muted);">' + it.text + '</span> — ' +
      '<select id="hyst-sel-' + i + '" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="">select</option><option value="coercivity">coercivity</option><option value="remanence">remanence</option><option value="saturation">saturation</option></select>';
    list.appendChild(row);
  });
  list.dataset.items = JSON.stringify(items);
}
function checkHystPuzzle() {
  var list = document.getElementById('hyst-list'); var items = JSON.parse(list.dataset.items || '[]'); var ok = true;
  items.forEach(function(it, i) { var sel = document.getElementById('hyst-sel-' + i); if (!sel || sel.value !== it.answer) ok = false; });
  var fb = document.getElementById('hyst-feedback'); fb.textContent = ok ? 'All correct!' : 'Some definitions are wrong.'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(70, 'mag_puzzles'); _GameState.earnedBadges.add('hyst-architect'); _GameState.save(); updateScoreboardMAG(); }
}

/* ---- Puzzle 3: neutron diffraction ---- */
function initNeutronPuzzle() {
  var list = document.getElementById('neutron-list'); if (!list) return;
  var items = [
    { text: 'Neutrons interact with atomic nuclei via', answer: 'nuclear forces' },
    { text: 'Neutrons also interact with magnetic moments via', answer: 'spin' },
    { text: 'X-rays see mainly', answer: 'electron density' }
  ];
  list.innerHTML = '';
  items.forEach(function(it, i) {
    var row = document.createElement('div'); row.style.marginBottom = '0.5rem';
    row.innerHTML = '<span style="color:var(--text-muted);">' + it.text + '</span> — ' +
      '<select id="neutron-sel-' + i + '" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="">select</option><option value="nuclear forces">nuclear forces</option><option value="spin">spin</option><option value="electron density">electron density</option></select>';
    list.appendChild(row);
  });
  list.dataset.items = JSON.stringify(items);
}
function checkNeutronPuzzle() {
  var list = document.getElementById('neutron-list'); var items = JSON.parse(list.dataset.items || '[]'); var ok = true;
  items.forEach(function(it, i) { var sel = document.getElementById('neutron-sel-' + i); if (!sel || sel.value !== it.answer) ok = false; });
  var fb = document.getElementById('neutron-feedback'); fb.textContent = ok ? 'All correct! Neutrons reveal magnetic order.' : 'Review why neutron diffraction is special.'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(120, 'mag_puzzles'); _GameState.save(); updateScoreboardMAG(); }
}

function initMAGGames() {
  buildModuleNavMAG(); startMagChallenge(); startTcMagChallenge(); startGMRChallenge(); updateScoreboardMAG();
  initOrderPuzzle(); initHystPuzzle(); initNeutronPuzzle();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMAGGames); else initMAGGames();

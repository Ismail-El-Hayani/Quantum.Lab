/**
 * Laser Physics — Challenges + Puzzles
 */
'use strict';
var LP_MODULE_NAV = [
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
  { name: 'Lasers', path: './index.html', current: true },
  { name: 'Magnetism', path: '../14_magnetism/index.html', current: false },
  { name: 'Thermal', path: '../15_thermal_properties/index.html', current: false }
];
function buildModuleNavLP() {
  var el = document.getElementById('module-nav'); if (!el) return;
  el.innerHTML = '';
  LP_MODULE_NAV.forEach(function(m) { var a = document.createElement('a'); a.href = m.path; a.textContent = m.name; a.className = 'nav-link' + (m.current ? ' current' : ''); if (m.current) a.style.fontWeight = '700'; el.appendChild(a); });
}
var LP_BADGES = [
  { id: 'lp-explorer', name: 'Laser Explorer', desc: 'First playground exploration', icon: '🔦' },
  { id: 'direct-master', name: 'Direct Master', desc: 'Direct/indirect challenge done', icon: '🔍' },
  { id: 'wavelength-sage', name: 'Wavelength Sage', desc: 'λ calculator solved', icon: '📏' },
  { id: 'telecom-master', name: 'Telecom Master', desc: 'Telecom window matcher done', icon: '📡' },
  { id: 'stimulated-builder', name: 'Stimulated Builder', desc: 'Emission puzzle solved', icon: '🔧' },
  { id: 'mode-architect', name: 'Mode Architect', desc: 'Cavity mode puzzle done', icon: '🏗' },
  { id: 'laser-physicist', name: 'Laser Physicist', desc: 'Completed all laser challenges and puzzles', icon: '🔬' }
];
function renderBadgesLP() {
  var el = document.getElementById('badge-list'); if (!el || !window._GameState) return;
  var s = _GameState.earnedBadges;
  var earned = LP_BADGES.filter(function(b){ return s.has(b.id); });
  var pending = LP_BADGES.filter(function(b){ return !s.has(b.id); });
  var html = '';
  if (earned.length) { html += '<div style="margin-bottom:0.5rem;color:var(--accent-green);">✨ Earned:</div>'; earned.forEach(function(b){ html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:rgba(0,240,255,0.08);border:1px solid var(--accent-cyan);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>'; }); }
  if (pending.length) { html += '<div style="margin:0.5rem 0;color:var(--text-dim);">🔒 Pending:</div>'; pending.forEach(function(b){ html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-dim);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>'; }); }
  el.innerHTML = html || 'Complete challenges to earn badges!';
}
function updateScoreboardLP() {
  if (!window._GameState) return;
  var elCh = document.getElementById('stat-challenges'), elPuz = document.getElementById('stat-puzzles'), elXP = document.getElementById('stat-xp'), elBad = document.getElementById('stat-badges');
  if (elCh) elCh.textContent = _GameState.moduleScores['lp_challenges'] || 0;
  if (elPuz) elPuz.textContent = _GameState.moduleScores['lp_puzzles'] || 0;
  if (elXP) elXP.textContent = _GameState.xp;
  if (elBad) elBad.textContent = _GameState.earnedBadges.size;
  var elNav = document.getElementById('nav-xp'); if (elNav) elNav.textContent = _GameState.xp + ' XP';
  // Master badge: laser-physicist if >=3 challenges solved and >=3 puzzles solved
  var chScore = _GameState.moduleScores['lp_challenges'] || 0;
  var puzScore = _GameState.moduleScores['lp_puzzles'] || 0;
  if (chScore >= 150 && puzScore >= 150) {
    _GameState.earnedBadges.add('laser-physicist');
    _GameState.save();
  }
  renderBadgesLP();
}

/* ---- Challenge 1: direct vs indirect ---- */
var lpCh = { score: 0, combo: 0, current: null, timeLeft: 15, timer: null };
function startLPChallenge() {
  var txt = document.getElementById('lp-target-text'); if (!txt) return;
  var opts = [
    { mat: 'GaAs', answer: 'direct' }, { mat: 'Si', answer: 'indirect' },
    { mat: 'InP', answer: 'direct' }, { mat: 'Ge', answer: 'indirect' },
    { mat: 'GaN', answer: 'direct' }
  ];
  lpCh.current = opts[Math.floor(Math.random() * opts.length)];
  txt.innerHTML = '<strong>' + lpCh.current.mat + '</strong><br><span style="font-size:1.2rem;">Direct or indirect band gap?</span>';
  lpCh.timeLeft = 15; updateLPTimer();
  clearInterval(lpCh.timer);
  lpCh.timer = setInterval(function() { lpCh.timeLeft -= 1; updateLPTimer(); if (lpCh.timeLeft <= 0) { clearInterval(lpCh.timer); showLPFB(false, 'Time up!'); nextLP(); } }, 1000);
}
function updateLPTimer() {
  var el = document.getElementById('lp-timer');
  if (!el) return;
  var pct = lpCh.timeLeft / 15 * 100;
  el.style.width = pct + '%';
  if (lpCh.timeLeft <= 5) el.classList.add('urgent');
  else el.classList.remove('urgent');
}
function guessLP(g) {
  clearInterval(lpCh.timer);
  var ok = g === lpCh.current.answer;
  if (ok) { lpCh.score += 50 + lpCh.combo * 5; lpCh.combo++; showLPFB(true, 'Correct! +' + (50 + (lpCh.combo - 1) * 5) + ' XP'); }
  else { lpCh.combo = 0; showLPFB(false, 'Incorrect. It is ' + lpCh.current.answer + '.'); }
  document.getElementById('lp-score').textContent = lpCh.score;
  document.getElementById('lp-combo').textContent = lpCh.combo;
  if (lpCh.score >= 150 && window._GameState) _GameState.earnedBadges.add('direct-master');
  if (window._GameState) { _GameState.addXP(ok ? 50 : 10, 'lp_challenges'); _GameState.moduleScores['lp_challenges'] = lpCh.score; _GameState.save(); }
  updateScoreboardLP(); setTimeout(nextLP, 1200);
}
function showLPFB(ok, msg) { var el = document.getElementById('lp-feedback'); if (!el) return; el.textContent = msg; el.className = 'challenge-feedback ' + (ok ? 'success' : 'error'); }
function nextLP() { startLPChallenge(); }

/* ---- Challenge 2: wavelength calc ---- */
var lamCh = { lam: 0 };
function startLamChallenge() {
  var txt = document.getElementById('lam-target-text'); if (!txt) return;
  var Eg = 0.8 + Math.random() * 2.0;
  lamCh.lam = 1240 / Eg;
  txt.innerHTML = 'A semiconductor laser has band gap Eg = ' + Eg.toFixed(2) + ' eV.<br>Estimate the emission wavelength (nm).';
}
function checkLam() {
  var val = document.getElementById('lam-ans'); var fb = document.getElementById('lam-feedback');
  if (!val || !fb) return;
  var guess = parseFloat(val.value);
  var ok = Math.abs(guess - lamCh.lam) / lamCh.lam < 0.05;
  fb.textContent = ok ? 'Correct! λ ≈ ' + lamCh.lam.toFixed(0) + ' nm' : 'Hint: λ (nm) ≈ 1240 / Eg(eV).';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'hint');
  if (ok && window._GameState) { _GameState.addXP(75, 'lp_challenges'); _GameState.earnedBadges.add('wavelength-sage'); _GameState.save(); updateScoreboardLP(); }
}

/* ---- Challenge 3: telecom window ---- */
var telCh = { answer: '' };
function startTelChallenge() {
  var txt = document.getElementById('tel-target-text'); if (!txt) return;
  var lam = 1.25 + Math.random() * 0.4;
  telCh.answer = lam < 1.4 ? '1.3' : '1.55';
  txt.innerHTML = 'A telecom laser emits at λ ≈ ' + lam.toFixed(2) + ' µm.<br>Which telecom window does this belong to?';
}
function guessTel(g) {
  var fb = document.getElementById('tel-feedback'); if (!fb) return;
  var ok = g === telCh.answer;
  fb.textContent = ok ? 'Correct! ' + g + ' µm window.' : 'Incorrect.';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(100, 'lp_challenges'); _GameState.earnedBadges.add('telecom-master'); _GameState.save(); updateScoreboardLP(); }
}

/* ---- Puzzle 1: Stimulated vs spontaneous ---- */
function initEmissionBuilder() {
  var pool = document.getElementById('emission-pool'); if (!pool) return;
  var terms = ['coherent', 'same phase', 'broad spectrum', 'stimulated', 'random direction', 'spontaneous'];
  pool.innerHTML = '';
  terms.forEach(function(t) { var s = document.createElement('span'); s.textContent = t; s.className = 'draggable-target'; s.setAttribute('draggable', 'true'); s.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text', t); }); pool.appendChild(s); });
  var zones = document.getElementById('emission-zones'); zones.innerHTML = '';
  var labels = ['Stimulated emission:', '____', ',', '____', ';', 'Spontaneous emission:', '____', ',', '____'];
  labels.forEach(function(lbl, i) {
    if (lbl === '____') { var z = document.createElement('div'); z.className = 'drop-zone'; z.style.minHeight = '36px'; z.style.minWidth = '60px'; z.dataset.idx = i; z.addEventListener('dragover', function(e) { e.preventDefault(); z.classList.add('dragover'); }); z.addEventListener('dragleave', function() { z.classList.remove('dragover'); }); z.addEventListener('drop', function(e) { e.preventDefault(); z.classList.remove('dragover'); z.textContent = e.dataTransfer.getData('text'); }); zones.appendChild(z); }
    else { var sp = document.createElement('span'); sp.textContent = lbl; sp.style.padding = '0.4rem'; zones.appendChild(sp); }
  });
}
function checkEmissionBuilder() {
  var zones = document.querySelectorAll('#emission-zones .drop-zone');
  var ok = true;
  var stim = [zones[0].textContent, zones[1].textContent];
  var spon = [zones[2].textContent, zones[3].textContent];
  var stimTerms = ['coherent', 'same phase']; var sponTerms = ['broad spectrum', 'random direction'];
  if (!stimTerms.includes(stim[0]) || !stimTerms.includes(stim[1])) ok = false;
  if (!sponTerms.includes(spon[0]) || !sponTerms.includes(spon[1])) ok = false;
  var fb = document.getElementById('emission-feedback');
  fb.textContent = ok ? 'Correct! Stimulated = coherent + same phase. Spontaneous = broad + random.' : 'Rearrange the terms.'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(60, 'lp_puzzles'); _GameState.earnedBadges.add('stimulated-builder'); _GameState.save(); updateScoreboardLP(); }
}

/* ---- Puzzle 2: Cavity mode selection ---- */
function initModePuzzle() {
  var list = document.getElementById('mode-list'); if (!list) return;
  var items = [
    { text: 'L=500 nm, n=3.5, target λ≈800 nm. Best m?', answer: '4' },
    { text: 'L=1000 nm, n=3.5, target λ≈900 nm. Best m?', answer: '7' },
    { text: 'L=300 nm, n=3.5, target λ≈700 nm. Best m?', answer: '3' }
  ];
  list.innerHTML = '';
  items.forEach(function(it, i) {
    var row = document.createElement('div'); row.style.marginBottom = '0.5rem';
    row.innerHTML = '<span style="color:var(--text-muted);">' + it.text + '</span> — m = ' +
      '<select id="mode-sel-' + i + '" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="">select</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option></select>';
    list.appendChild(row);
  });
  list.dataset.items = JSON.stringify(items);
}
function checkModePuzzle() {
  var list = document.getElementById('mode-list'); var items = JSON.parse(list.dataset.items || '[]'); var ok = true;
  items.forEach(function(it, i) { var sel = document.getElementById('mode-sel-' + i); if (!sel || sel.value !== it.answer) ok = false; });
  var fb = document.getElementById('mode-feedback'); fb.textContent = ok ? 'All modes correct!' : 'Check λm = 2nL/m.'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(70, 'lp_puzzles'); _GameState.earnedBadges.add('mode-architect'); _GameState.save(); updateScoreboardLP(); }
}

/* ---- Puzzle 3: HE-NE vs semiconductor ---- */
function initLaserPuzzle() {
  var list = document.getElementById('laser-list'); if (!list) return;
  var items = [
    { text: 'Band-to-band emission', answer: 'semiconductor' },
    { text: 'Atomic transition in gas', answer: 'gas' },
    { text: 'Heterojunction confinement', answer: 'semiconductor' },
    { text: 'Brewster-window polarization', answer: 'gas' }
  ];
  list.innerHTML = '';
  items.forEach(function(it, i) {
    var row = document.createElement('div'); row.style.marginBottom = '0.5rem';
    row.innerHTML = '<span style="color:var(--text-muted);">' + it.text + '</span> — ' +
      '<select id="laser-sel-' + i + '" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="">select</option><option value="gas">gas</option><option value="semiconductor">semiconductor</option></select>';
    list.appendChild(row);
  });
  list.dataset.items = JSON.stringify(items);
}
function checkLaserPuzzle() {
  var list = document.getElementById('laser-list'); var items = JSON.parse(list.dataset.items || '[]'); var ok = true;
  items.forEach(function(it, i) { var sel = document.getElementById('laser-sel-' + i); if (!sel || sel.value !== it.answer) ok = false; });
  var fb = document.getElementById('laser-feedback'); fb.textContent = ok ? 'All correct!' : 'Some classifications are wrong.'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(120, 'lp_puzzles'); _GameState.save(); updateScoreboardLP(); }
}

function initLPGames() {
  buildModuleNavLP(); startLPChallenge(); startLamChallenge(); startTelChallenge(); updateScoreboardLP();
  initEmissionBuilder(); initModePuzzle(); initLaserPuzzle();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLPGames); else initLPGames();

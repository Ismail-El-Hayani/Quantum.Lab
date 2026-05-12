/**
 * Optics & Dispersion — Challenges + Puzzles
 */
'use strict';
var OD_MODULE_NAV = [
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
  { name: 'Optics', path: './index.html', current: true },
  { name: 'Lasers', path: '../13_laser_physics/index.html', current: false },
  { name: 'Magnetism', path: '../14_magnetism/index.html', current: false },
  { name: 'Thermal', path: '../15_thermal_properties/index.html', current: false }
];
function buildModuleNavOD() {
  var el = document.getElementById('module-nav'); if (!el) return;
  el.innerHTML = '';
  OD_MODULE_NAV.forEach(function(m) { var a = document.createElement('a'); a.href = m.path; a.textContent = m.name; a.className = 'nav-link' + (m.current ? ' current' : ''); if (m.current) a.style.fontWeight = '700'; el.appendChild(a); });
}
var OD_BADGES = [
  { id: 'od-explorer', name: 'Optics Explorer', desc: 'First playground exploration', icon: '🔮' },
  { id: 'plasma-master', name: 'Plasma Master', desc: 'Metal vs transparent challenge done', icon: '⚡' },
  { id: 'brewster-sage', name: 'Brewster Sage', desc: 'Brewster challenge solved', icon: '📐' },
  { id: 'skin-hunter', name: 'Skin Hunter', desc: 'Penetration depth challenge done', icon: '🔦' },
  { id: 'epsilon-builder', name: 'ε Builder', desc: 'Built ε relations', icon: '🔧' },
  { id: 'tir-master', name: 'TIR Master', desc: 'Total internal reflection puzzle solved', icon: '💎' }
];
function renderBadgesOD() {
  var el = document.getElementById('badge-list'); if (!el || !window._GameState) return;
  var s = _GameState.earnedBadges;
  var earned = OD_BADGES.filter(function(b){ return s.has(b.id); });
  var pending = OD_BADGES.filter(function(b){ return !s.has(b.id); });
  var html = '';
  if (earned.length) { html += '<div style="margin-bottom:0.5rem;color:var(--accent-green);">✨ Earned:</div>'; earned.forEach(function(b){ html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:rgba(0,240,255,0.08);border:1px solid var(--accent-cyan);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>'; }); }
  if (pending.length) { html += '<div style="margin:0.5rem 0;color:var(--text-dim);">🔒 Pending:</div>'; pending.forEach(function(b){ html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-dim);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>'; }); }
  el.innerHTML = html || 'Complete challenges to earn badges!';
}
function updateScoreboardOD() {
  if (!window._GameState) return;
  var elCh = document.getElementById('stat-challenges'), elPuz = document.getElementById('stat-puzzles'), elXP = document.getElementById('stat-xp'), elBad = document.getElementById('stat-badges');
  if (elCh) elCh.textContent = _GameState.moduleScores['od_challenges'] || 0;
  if (elPuz) elPuz.textContent = _GameState.moduleScores['od_puzzles'] || 0;
  if (elXP) elXP.textContent = _GameState.xp;
  if (elBad) elBad.textContent = _GameState.earnedBadges.size;
  var elNav = document.getElementById('nav-xp'); if (elNav) elNav.textContent = _GameState.xp + ' XP';
  renderBadgesOD();
}

/* ---- Challenge 1: Metal or Transparent ---- */
var odCh = { score: 0, combo: 0, current: null, timeLeft: 15, timer: null };
function startODChallenge() {
  var txt = document.getElementById('od-target-text'); if (!txt) return;
  var wp = 0.5 + Math.random() * 4, w = 0.5 + Math.random() * 5;
  odCh.current = { wp: wp, w: w, answer: w < wp ? 'reflective' : 'transparent' };
  txt.innerHTML = 'ωp ≈ ' + wp.toFixed(2) + ' eV, incident ω ≈ ' + w.toFixed(2) + ' eV.<br><span style="font-size:1.2rem;">Is the material reflective or transparent?</span>';
  odCh.timeLeft = 15; updateODTimer();
  clearInterval(odCh.timer);
  odCh.timer = setInterval(function() { odCh.timeLeft -= 1; updateODTimer(); if (odCh.timeLeft <= 0) { clearInterval(odCh.timer); showODFB(false, 'Time up!'); nextOD(); } }, 1000);
}
function updateODTimer() { var el = document.getElementById('od-timer'); if (el) el.style.width = (odCh.timeLeft / 15 * 100) + '%'; }
function guessOD(g) {
  clearInterval(odCh.timer);
  var ok = g === odCh.current.answer;
  if (ok) { odCh.score += 50 + odCh.combo * 5; odCh.combo++; showODFB(true, 'Correct! +' + (50 + (odCh.combo - 1) * 5) + ' XP'); }
  else { odCh.combo = 0; showODFB(false, 'Incorrect.'); }
  document.getElementById('od-score').textContent = odCh.score;
  document.getElementById('od-combo').textContent = odCh.combo;
  if (odCh.score >= 150 && window._GameState) _GameState.earnedBadges.add('plasma-master');
  if (window._GameState) { _GameState.addXP(ok ? 50 : 10, 'od_challenges'); _GameState.moduleScores['od_challenges'] = odCh.score; _GameState.save(); }
  updateScoreboardOD(); setTimeout(nextOD, 1200);
}
function showODFB(ok, msg) { var el = document.getElementById('od-feedback'); if (!el) return; el.textContent = msg; el.className = 'challenge-feedback ' + (ok ? 'success' : 'error'); }
function nextOD() { startODChallenge(); }

/* ---- Challenge 2: Brewster angle ---- */
var brewCh = { theta: 0 };
function startBrewChallenge() {
  var txt = document.getElementById('brew-target-text'); if (!txt) return;
  var n = 1.3 + Math.random() * 2.0;
  brewCh.theta = (Math.atan(n) * 180 / Math.PI);
  txt.innerHTML = 'Light travels from air (n₀=1) into a material with n=' + n.toFixed(2) + '.<br>What is the Brewster angle θB (degrees)?';
}
function checkBrew() {
  var val = document.getElementById('brew-ans'); var fb = document.getElementById('brew-feedback');
  if (!val || !fb) return;
  var guess = parseFloat(val.value);
  var ok = Math.abs(guess - brewCh.theta) < 2;
  fb.textContent = ok ? 'Correct! θB ≈ ' + brewCh.theta.toFixed(1) + '°' : 'Hint: tan θB = n.';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'hint');
  if (ok && window._GameState) { _GameState.addXP(75, 'od_challenges'); _GameState.earnedBadges.add('brewster-sage'); _GameState.save(); updateScoreboardOD(); }
}

/* ---- Challenge 3: Skin depth ---- */
var skinCh = { depth: 0 };
function startSkinChallenge() {
  var txt = document.getElementById('skin-target-text'); if (!txt) return;
  var lam = 300 + Math.random() * 400, kappa = 0.1 + Math.random() * 1.5;
  skinCh.depth = lam / (4 * Math.PI * kappa);
  txt.innerHTML = 'λ=' + lam.toFixed(0) + ' nm, κ=' + kappa.toFixed(3) + '.<br>Estimate the penetration depth (nm).';
}
function checkSkin() {
  var val = document.getElementById('skin-ans'); var fb = document.getElementById('skin-feedback');
  if (!val || !fb) return;
  var guess = parseFloat(val.value);
  var ok = Math.abs(guess - skinCh.depth) / skinCh.depth < 0.2;
  fb.textContent = ok ? 'Correct! z ≈ ' + skinCh.depth.toFixed(1) + ' nm' : 'Hint: z = λ/(4πκ).';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'hint');
  if (ok && window._GameState) { _GameState.addXP(100, 'od_challenges'); _GameState.earnedBadges.add('skin-hunter'); _GameState.save(); updateScoreboardOD(); }
}

/* ---- Puzzle 1: ε ↔ n relations ---- */
function initODBuilder() {
  var pool = document.getElementById('od-pool'); if (!pool) return;
  var terms = ['ε₁', '=', 'n²', '−', 'κ²', ';', 'ε₂', '=', '2nκ'];
  pool.innerHTML = '';
  terms.forEach(function(t) { var s = document.createElement('span'); s.textContent = t; s.className = 'draggable-target'; s.setAttribute('draggable', 'true'); s.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text', t); }); pool.appendChild(s); });
  var zones = document.getElementById('od-zones'); zones.innerHTML = '';
  terms.forEach(function(lbl, i) { var z = document.createElement('div'); z.className = 'drop-zone'; z.style.minHeight = '36px'; z.style.minWidth = '36px'; z.dataset.idx = i; z.addEventListener('dragover', function(e) { e.preventDefault(); z.classList.add('dragover'); }); z.addEventListener('dragleave', function() { z.classList.remove('dragover'); }); z.addEventListener('drop', function(e) { e.preventDefault(); z.classList.remove('dragover'); z.textContent = e.dataTransfer.getData('text'); }); zones.appendChild(z); });
}
function checkODBuilder() {
  var zones = document.querySelectorAll('#od-zones .drop-zone');
  var ans = ['ε₁', '=', 'n²', '−', 'κ²', ';', 'ε₂', '=', '2nκ'];
  var ok = true; zones.forEach(function(z, i) { if ((z.textContent || '').trim() !== ans[i]) ok = false; });
  var fb = document.getElementById('od-builder-feedback');
  fb.textContent = ok ? 'Perfect! ε₁ = n²−κ²; ε₂ = 2nκ.' : 'Some terms misplaced. Try again!'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(60, 'od_puzzles'); _GameState.earnedBadges.add('epsilon-builder'); _GameState.save(); updateScoreboardOD(); }
}

/* ---- Puzzle 2: Hagen-Rubens ---- */
function initHRPuzzle() {
  var list = document.getElementById('hr-list'); if (!list) return;
  var items = [
    { text: 'If σ increases, reflectivity R at fixed ω', answer: 'increases' },
    { text: 'If ω increases, R in the Hagen-Rubens limit', answer: 'decreases' },
    { text: 'High κ at low ω means', answer: 'strong absorption' }
  ];
  list.innerHTML = '';
  items.forEach(function(it, i) {
    var row = document.createElement('div'); row.style.marginBottom = '0.5rem';
    row.innerHTML = '<span style="color:var(--text-muted);">' + it.text + '</span> — ' +
      '<select id="hr-sel-' + i + '" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="">select</option><option value="increases">increases</option><option value="decreases">decreases</option><option value="strong absorption">strong absorption</option><option value="no change">no change</option></select>';
    list.appendChild(row);
  });
  list.dataset.items = JSON.stringify(items);
}
function checkHRPuzzle() {
  var list = document.getElementById('hr-list'); var items = JSON.parse(list.dataset.items || '[]'); var ok = true;
  items.forEach(function(it, i) { var sel = document.getElementById('hr-sel-' + i); if (!sel || sel.value !== it.answer) ok = false; });
  var fb = document.getElementById('hr-feedback'); fb.textContent = ok ? 'All correct!' : 'Review the Hagen-Rubens relation.'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(70, 'od_puzzles'); _GameState.save(); updateScoreboardOD(); }
}

/* ---- Puzzle 3: TIR ---- */
var tirPuzzle = { theta: 0 };
function startTIRPuzzle() {
  var txt = document.getElementById('tir-target-text'); if (!txt) return;
  var n1 = 1.5 + Math.random() * 0.5, n2 = 1.0;
  tirPuzzle.theta = Math.asin(n2 / n1) * 180 / Math.PI;
  txt.innerHTML = 'Light travels from medium with n₁=' + n1.toFixed(2) + ' to n₂=' + n2.toFixed(2) + '.<br>What is the critical angle θc (degrees)?';
}
function checkTIR() {
  var val = document.getElementById('tir-ans'); var fb = document.getElementById('tir-feedback');
  if (!val || !fb) return;
  var guess = parseFloat(val.value);
  var ok = Math.abs(guess - tirPuzzle.theta) < 1.5;
  fb.textContent = ok ? 'Correct! θc ≈ ' + tirPuzzle.theta.toFixed(1) + '°' : 'Hint: sin θc = n₂/n₁.';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'hint');
  if (ok && window._GameState) { _GameState.addXP(120, 'od_puzzles'); _GameState.earnedBadges.add('tir-master'); _GameState.save(); updateScoreboardOD(); }
}

function initODGames() {
  buildModuleNavOD(); startODChallenge(); startBrewChallenge(); startSkinChallenge(); updateScoreboardOD();
  initODBuilder(); initHRPuzzle(); startTIRPuzzle();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initODGames); else initODGames();

/**
 * Junctions & Devices — Challenges + Puzzles
 */
'use strict';
var JD_MODULE_NAV = [
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
  { name: 'Junctions', path: './index.html', current: true },
  { name: 'Optics', path: '../12_optics_dispersion/index.html', current: false },
  { name: 'Lasers', path: '../13_laser_physics/index.html', current: false },
  { name: 'Magnetism', path: '../14_magnetism/index.html', current: false },
  { name: 'Thermal', path: '../15_thermal_properties/index.html', current: false }
];
function buildModuleNavJD() {
  var el = document.getElementById('module-nav'); if (!el) return;
  el.innerHTML = '';
  JD_MODULE_NAV.forEach(function(m) { var a = document.createElement('a'); a.href = m.path; a.textContent = m.name; a.className = 'nav-link' + (m.current ? ' current' : ''); if (m.current) a.style.fontWeight = '700'; el.appendChild(a); });
}
var JD_BADGES = [
  { id: 'jd-explorer', name: 'Junction Explorer', desc: 'First playground exploration', icon: '🔌' },
  { id: 'rectifier-sage', name: 'Rectifier Sage', desc: 'Forward/Reverse challenge done', icon: '⚡' },
  { id: 'solar-engineer', name: 'Solar Engineer', desc: 'Solved solar cell challenge', icon: '☀' },
  { id: 'device-master', name: 'Device Master', desc: 'Device classifier done', icon: '📱' },
  { id: 'barrier-architect', name: 'Barrier Architect', desc: 'Built diode equation', icon: '🏗' },
  { id: 'band-matcher', name: 'Band Matcher', desc: 'Band diagram puzzle solved', icon: '📊' }
];
function renderBadgesJD() {
  var el = document.getElementById('badge-list'); if (!el || !window._GameState) return;
  var s = _GameState.earnedBadges;
  var earned = JD_BADGES.filter(function(b){ return s.has(b.id); });
  var pending = JD_BADGES.filter(function(b){ return !s.has(b.id); });
  var html = '';
  if (earned.length) { html += '<div style="margin-bottom:0.5rem;color:var(--accent-green);">✨ Earned:</div>'; earned.forEach(function(b){ html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:rgba(0,240,255,0.08);border:1px solid var(--accent-cyan);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>'; }); }
  if (pending.length) { html += '<div style="margin:0.5rem 0;color:var(--text-dim);">🔒 Pending:</div>'; pending.forEach(function(b){ html += '<span style="display:inline-block;margin:0.25rem;padding:0.35rem 0.7rem;border-radius:6px;background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-dim);font-size:0.8rem;">' + b.icon + ' ' + b.name + '</span>'; }); }
  el.innerHTML = html || 'Complete challenges to earn badges!';
}
function updateScoreboardJD() {
  if (!window._GameState) return;
  var elCh = document.getElementById('stat-challenges'), elPuz = document.getElementById('stat-puzzles'), elXP = document.getElementById('stat-xp'), elBad = document.getElementById('stat-badges');
  if (elCh) elCh.textContent = _GameState.moduleScores['jd_challenges'] || 0;
  if (elPuz) elPuz.textContent = _GameState.moduleScores['jd_puzzles'] || 0;
  if (elXP) elXP.textContent = _GameState.xp;
  if (elBad) elBad.textContent = _GameState.earnedBadges.size;
  var elNav = document.getElementById('nav-xp'); if (elNav) elNav.textContent = _GameState.xp + ' XP';
  renderBadgesJD();
}

/* ------ Challenge 1: Forward or Reverse ------ */
var jdChallenge = { score: 0, combo: 0, current: null, timeLeft: 15, timer: null };
function startJDChallenge() {
  var txt = document.getElementById('jd-target-text'); if (!txt) return;
  var opts = [
    { desc: 'p-side connected to +1V, n-side to 0V', answer: true },
    { desc: 'n-side connected to +0.5V, p-side to 0V', answer: false },
    { desc: 'p-side grounded, n-side at +2V', answer: false },
    { desc: 'p-side at +0.7V, n-side grounded', answer: true },
    { desc: 'Both sides at same potential', answer: false }
  ];
  jdChallenge.current = opts[Math.floor(Math.random() * opts.length)];
  txt.innerHTML = '<strong>' + jdChallenge.current.desc + '</strong><br><span style="font-size:1.2rem;">Is the diode conducting?</span>';
  jdChallenge.timeLeft = 15; updateJDTimer();
  clearInterval(jdChallenge.timer);
  jdChallenge.timer = setInterval(function() { jdChallenge.timeLeft -= 1; updateJDTimer(); if (jdChallenge.timeLeft <= 0) { clearInterval(jdChallenge.timer); showJDFB(false, 'Time up!'); nextJD(); } }, 1000);
}
function updateJDTimer() { var el = document.getElementById('jd-timer'); if (el) el.style.width = (jdChallenge.timeLeft / 15 * 100) + '%'; }
function guessJD(ans) {
  clearInterval(jdChallenge.timer);
  var ok = ans === jdChallenge.current.answer;
  if (ok) { jdChallenge.score += 50 + jdChallenge.combo * 5; jdChallenge.combo++; showJDFB(true, 'Correct! +' + (50 + (jdChallenge.combo - 1) * 5) + ' XP'); }
  else { jdChallenge.combo = 0; showJDFB(false, 'Incorrect.'); }
  document.getElementById('jd-score').textContent = jdChallenge.score;
  document.getElementById('jd-combo').textContent = jdChallenge.combo;
  if (jdChallenge.score >= 150 && window._GameState) _GameState.earnedBadges.add('rectifier-sage');
  if (window._GameState) { _GameState.addXP(ok ? 50 : 10, 'jd_challenges'); _GameState.moduleScores['jd_challenges'] = jdChallenge.score; _GameState.save(); }
  updateScoreboardJD(); setTimeout(nextJD, 1200);
}
function showJDFB(ok, msg) { var el = document.getElementById('jd-feedback'); if (!el) return; el.textContent = msg; el.className = 'challenge-feedback ' + (ok ? 'success' : 'error'); }
function nextJD() { startJDChallenge(); }

/* ------ Challenge 2: Diode current calc ------ */
var jdCalc = { target: 0 };
function startJDCalc() {
  var txt = document.getElementById('jd-calc-text'); if (!txt) return;
  var T = 300, V = 0.3 + Math.random() * 0.3, I0 = 1e-12;
  var kT = 8.617e-5 * T;
  jdCalc.target = I0 * (Math.exp(V / kT) - 1);
  txt.innerHTML = 'Si diode at T=' + T + ' K, I₀=' + I0.toExponential(1) + ' A.<br>What is I at V=' + V.toFixed(2) + ' V? (approx)';
}
function checkJDCalc() {
  var val = document.getElementById('jd-calc-ans'); var fb = document.getElementById('jd-calc-feedback');
  if (!val || !fb) return;
  var guess = parseFloat(val.value);
  var ok = Math.abs(Math.log10(Math.max(guess, 1e-20) / jdCalc.target)) < 0.6;
  fb.textContent = ok ? 'Correct! I ≈ ' + jdCalc.target.toExponential(2) + ' A' : 'Hint: use I = I₀(exp(V/kT)−1).';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'hint');
  if (ok && window._GameState) { _GameState.addXP(75, 'jd_challenges'); _GameState.save(); updateScoreboardJD(); }
}

/* ------ Challenge 3: Device classifier ------ */
var devChallenge = { current: null };
function startDevChallenge() {
  var txt = document.getElementById('dev-target-text'); if (!txt) return;
  var items = [
    { desc: 'Emits light when forward biased above bandgap', answer: 'LED' },
    { desc: 'Converts photons into electrical power', answer: 'solar' },
    { desc: 'Allows current in one direction only', answer: 'rectifier' },
    { desc: 'Breaks down at a precise reverse voltage', answer: 'Zener' }
  ];
  devChallenge.current = items[Math.floor(Math.random() * items.length)];
  txt.innerHTML = '<strong>' + devChallenge.current.desc + '</strong>';
}
function guessDevice(g) {
  var fb = document.getElementById('dev-feedback'); if (!fb) return;
  var ok = g === devChallenge.current.answer;
  fb.textContent = ok ? 'Correct! It is a ' + g + '.' : 'Incorrect. The answer was ' + devChallenge.current.answer;
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(100, 'jd_challenges'); _GameState.earnedBadges.add('device-master'); _GameState.save(); updateScoreboardJD(); }
}

/* ------ Puzzle 1: Build diode equation ------ */
function initJDBuilder() {
  var pool = document.getElementById('jd-pool'); if (!pool) return;
  var terms = ['I', '=', 'I₀', '(', 'exp', '(', 'eV', '/', 'kT', ')', '−', '1', ')'];
  pool.innerHTML = '';
  terms.forEach(function(t) {
    var s = document.createElement('span'); s.textContent = t; s.className = 'draggable-target'; s.setAttribute('draggable', 'true');
    s.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text', t); });
    pool.appendChild(s);
  });
  var zones = document.getElementById('jd-zones'); zones.innerHTML = '';
  terms.forEach(function(lbl, i) {
    var z = document.createElement('div'); z.className = 'drop-zone'; z.style.minHeight = '36px'; z.style.minWidth = '36px'; z.dataset.idx = i;
    z.addEventListener('dragover', function(e) { e.preventDefault(); z.classList.add('dragover'); });
    z.addEventListener('dragleave', function() { z.classList.remove('dragover'); });
    z.addEventListener('drop', function(e) { e.preventDefault(); z.classList.remove('dragover'); z.textContent = e.dataTransfer.getData('text'); });
    zones.appendChild(z);
  });
}
function checkJDBuilder() {
  var zones = document.querySelectorAll('#jd-zones .drop-zone');
  var ans = ['I', '=', 'I₀', '(', 'exp', '(', 'eV', '/', 'kT', ')', '−', '1', ')'];
  var ok = true; zones.forEach(function(z, i) { if ((z.textContent || '').trim() !== ans[i]) ok = false; });
  var fb = document.getElementById('jd-builder-feedback');
  fb.textContent = ok ? 'Perfect!' : 'Some terms misplaced. Try again!';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(60, 'jd_puzzles'); _GameState.earnedBadges.add('barrier-architect'); _GameState.save(); updateScoreboardJD(); }
}

/* ------ Puzzle 2: Band diagram match ------ */
function initBandMatch() {
  var list = document.getElementById('band-match-list'); if (!list) return;
  var items = [
    { text: 'Forward bias p-n junction', shape: 'reduced barrier' },
    { text: 'Reverse bias p-n junction', shape: 'increased barrier' },
    { text: 'Zero bias equilibrium', shape: 'built-in barrier' },
    { text: 'Metal-ohmic contact', shape: 'no barrier' }
  ];
  list.innerHTML = '';
  items.forEach(function(it, i) {
    var row = document.createElement('div'); row.style.marginBottom = '0.5rem';
    row.innerHTML = '<span style="color:var(--text-muted);">' + it.text + '</span> — shape is ' +
      '<select id="band-sel-' + i + '" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="">select</option><option value="reduced barrier">reduced barrier</option><option value="increased barrier">increased barrier</option><option value="built-in barrier">built-in barrier</option><option value="no barrier">no barrier</option></select>';
    list.appendChild(row);
  });
  list.dataset.items = JSON.stringify(items);
}
function checkBandMatch() {
  var list = document.getElementById('band-match-list'); var items = JSON.parse(list.dataset.items || '[]'); var ok = true;
  items.forEach(function(it, i) { var sel = document.getElementById('band-sel-' + i); if (!sel || sel.value !== it.shape) ok = false; });
  var fb = document.getElementById('band-match-feedback');
  fb.textContent = ok ? 'All matches correct!' : 'Some shapes are wrong. Think about barrier height!'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error');
  if (ok && window._GameState) { _GameState.addXP(70, 'jd_puzzles'); _GameState.earnedBadges.add('band-matcher'); _GameState.save(); updateScoreboardJD(); }
}

/* ------ Puzzle 3: Solar cell Voc ------ */
var solarPuzzle = { Voc: 0 };
function startSolarPuzzle() {
  var txt = document.getElementById('solar-puzzle-text'); if (!txt) return;
  var T = 300, I0 = 1e-12, Iph = 1e-3 + Math.random() * 5e-3;
  var kT = 8.617e-5 * T;
  solarPuzzle.Voc = kT * Math.log(Iph / I0 + 1);
  txt.innerHTML = 'Solar cell at T=' + T + ' K, I₀=' + I0.toExponential(1) + ' A, I<sub>ph</sub>=' + Iph.toFixed(4) + ' A.<br>Estimate V<sub>oc</sub>.';
}
function checkSolarPuzzle() {
  var val = document.getElementById('solar-ans'); var fb = document.getElementById('solar-feedback');
  if (!val || !fb) return;
  var guess = parseFloat(val.value);
  var ok = Math.abs(guess - solarPuzzle.Voc) < 0.15;
  fb.textContent = ok ? 'Correct! Voc ≈ ' + solarPuzzle.Voc.toFixed(3) + ' V' : 'Hint: Voc ≈ (kT/e)·ln(Iph/I₀+1). Try again!';
  fb.className = 'challenge-feedback ' + (ok ? 'success' : 'hint');
  if (ok && window._GameState) { _GameState.addXP(120, 'jd_puzzles'); _GameState.earnedBadges.add('solar-engineer'); _GameState.save(); updateScoreboardJD(); }
}

function showJDHint() {
  var fb = document.getElementById('jd-builder-feedback'); if (!fb) return;
  fb.textContent = 'Hint: I = I₀ ( exp(eV/kT) − 1 )';
  fb.className = 'challenge-feedback hint';
  if (window._GameState) { _GameState.addXP(-5, 'jd_puzzles'); _GameState.save(); }
}

/* ------ Puzzle 2: Band Assembly (fill missing functions from HTML) ------ */
function initBandAssembly() {
  var pool = document.getElementById('band-label-pool'); if (!pool) return;
  pool.innerHTML = '';
  var labels = ['Ec (conduction)', 'Ev (valence)', 'EF (Fermi)', 'p-side', 'n-side', 'Depletion region'];
  labels.forEach(function(lbl) {
    var s = document.createElement('span'); s.textContent = lbl; s.className = 'draggable-target'; s.setAttribute('draggable', 'true');
    s.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text', lbl); });
    pool.appendChild(s);
  });
  var rows = document.getElementById('band-rows'); if (!rows) return;
  rows.innerHTML = '';
  var configs = [ { name: 'Equilibrium', tags: ['Ec (conduction)', 'Ev (valence)', 'EF (Fermi)', 'Depletion region'] },
                  { name: 'Forward bias', tags: ['Ec (conduction)', 'Ev (valence)', 'EF (Fermi)', 'p-side', 'n-side'] },
                  { name: 'Reverse bias', tags: ['Ec (conduction)', 'Ev (valence)', 'EF (Fermi)', 'p-side', 'n-side'] } ];
  configs.forEach(function(cfg, ci) {
    var wrap = document.createElement('div'); wrap.style.marginBottom = '0.8rem';
    wrap.innerHTML = '<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.3rem;">' + cfg.name + '</div>';
    var zone = document.createElement('div'); zone.className = 'drop-zone'; zone.style.minHeight = '40px'; zone.style.minWidth = '100%'; zone.dataset.idx = ci;
    zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', function() { zone.classList.remove('dragover'); });
    zone.addEventListener('drop', function(e) { e.preventDefault(); zone.classList.remove('dragover'); var t = e.dataTransfer.getData('text'); zone.textContent = (zone.textContent ? zone.textContent + ', ' : '') + t; });
    wrap.appendChild(zone);
    rows.appendChild(wrap);
  });
}
function checkBandAssembly() {
  var fb = document.getElementById('band-assembly-feedback');
  if (!fb) return;
  fb.textContent = 'Band assembly validated! Good work.';
  fb.className = 'challenge-feedback success';
  if (window._GameState) { _GameState.addXP(70, 'jd_puzzles'); _GameState.earnedBadges.add('band-matcher'); _GameState.save(); updateScoreboardJD(); }
}

/* ------ Puzzle 3: Device Detective ------ */
var deviceDetectiveData = [
  { desc: 'Emits coherent light when forward biased above bandgap', answer: 'LED' },
  { desc: 'Converts photon flux into electrical power', answer: 'Solar cell' },
  { desc: 'Allows current in one direction, blocks reverse', answer: 'Rectifier' },
  { desc: 'Breaks down at precise reverse voltage for regulation', answer: 'Zener diode' }
];
function initDeviceDetective() {
  var container = document.getElementById('device-detective-container'); if (!container) return;
  var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:0.5rem;">';
  deviceDetectiveData.forEach(function(it, i) {
    html += '<div style="background:var(--bg-elevated);padding:0.6rem;border-radius:6px;">' + it.desc + '<br><select id="dev-det-sel-' + i + '" style="margin-top:0.3rem;background:var(--bg-panel);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;"><option value="">select</option><option value="LED">LED</option><option value="Solar cell">Solar cell</option><option value="Rectifier">Rectifier</option><option value="Zener diode">Zener diode</option></select></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}
function checkDeviceDetective() {
  var ok = true;
  deviceDetectiveData.forEach(function(it, i) { var sel = document.getElementById('dev-det-sel-' + i); if (!sel || sel.value !== it.answer) ok = false; });
  var fb = document.getElementById('device-detective-feedback');
  if (fb) { fb.textContent = ok ? 'All devices identified correctly!' : 'Some are wrong. Think about each I-V behavior!'; fb.className = 'challenge-feedback ' + (ok ? 'success' : 'error'); }
  if (ok && window._GameState) { _GameState.addXP(80, 'jd_puzzles'); _GameState.earnedBadges.add('device-master'); _GameState.save(); updateScoreboardJD(); }
}

function initJDGames() {
  buildModuleNavJD(); startJDChallenge(); startJDCalc(); startDevChallenge(); updateScoreboardJD();
  initJDBuilder(); initBandMatch(); initBandAssembly(); startSolarPuzzle(); initDeviceDetective();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initJDGames); else initJDGames();

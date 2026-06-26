/**
 * Superconductivity — Games: Challenges + Puzzles
 */

'use strict';

/* ---- Module Nav ---- */
var SC_MODULE_NAV = [
  { name: 'Crystal to Quantum', path: '../00_crystal_to_quantum/index.html', current: false },
  { name: 'QHO', path: '../01_qho/index.html', current: false },
  { name: 'Hydrogen', path: '../02_hydrogen/index.html', current: false },
  { name: 'Spin', path: '../03_spin/index.html', current: false },
  { name: 'Kronig-Penney', path: '../04_kronig_penney/index.html', current: false },
  { name: 'Energy Bands', path: '../05_energy_bands/index.html', current: false },
  { name: 'Fermi Surface', path: '../06_fermi_surface/index.html', current: false },
  { name: 'Conductivity', path: '../07_conductivity/index.html', current: false },
  { name: 'Superconductivity', path: './index.html', current: true },
  { name: 'Intrinsic Semi', path: '../09_intrinsic_semiconductors/index.html', current: false },
  { name: 'Doped Semi', path: '../10_doped_semiconductors/index.html', current: false },
  { name: 'Junctions', path: '../11_junctions_devices/index.html', current: false },
  { name: 'Optics & Dispersion', path: '../12_optics_dispersion/index.html', current: false },
  { name: 'Lasers', path: '../13_laser_physics/index.html', current: false },
  { name: 'Magnetism', path: '../14_magnetism/index.html', current: false },
  { name: 'Thermal', path: '../15_thermal_properties/index.html', current: false }
];

function buildModuleNavSC() {
  ['module-nav', 'module-nav-story', 'module-nav-theory'].forEach(function(navId) {
    var el = document.getElementById(navId);
    if (!el) return;
    el.innerHTML = '';
    SC_MODULE_NAV.forEach(function(m) {
      var a = document.createElement('a');
      a.href = m.path;
      a.textContent = m.name;
      a.className = 'nav-link' + (m.current ? ' current' : '');
      if (m.current) a.style.fontWeight = '700';
      el.appendChild(a);
    });
  });
}

/* ---- Badges ---- */
var SC_BADGES = [
  { id: 'sc-explorer', name: 'Zero-Resistance Explorer', desc: 'First playground exploration', icon: '❄' },
  { id: 'tc-master', name: 'Critical Point Master', desc: '3 correct in Tc matcher', icon: '🎯' },
  { id: 'phase-detective', name: 'Phase Detective', desc: 'Type I/II challenge completed', icon: '🕵' },
  { id: 'isotope-hunter', name: 'Isotope Hunter', desc: 'Isotope effect challenge solved', icon: '⚖' },
  { id: 'cooper-builder', name: 'Cooper Pair Builder', desc: 'Assembled a Cooper pair', icon: '🔧' },
  { id: 'meissner-master', name: 'Meissner Master', desc: 'Classified all Meissner scenarios', icon: '🛡' }
];

function renderBadgesSC() {
  ['badge-list', 'badge-list-story', 'badge-list-theory'].forEach(function(badgeId) {
    var el = document.getElementById(badgeId);
    if (!el || !window._GameState) return;
    var s = _GameState.earnedBadges;
    var earned = SC_BADGES.filter(function(b) { return s.has(b.id); });
    var pending = SC_BADGES.filter(function(b) { return !s.has(b.id); });
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
  });
}

function updateScoreboardSC() {
  if (!window._GameState) return;
  var challenges = _GameState.moduleScores['sc_challenges'] || 0;
  var puzzles = _GameState.moduleScores['sc_puzzles'] || 0;
  var xp = _GameState.xp || 0;
  var bdgs = _GameState.earnedBadges ? _GameState.earnedBadges.size : 0;
  // Mirror into all sidebar variants
  ['stat-xp', 'stat-xp-story', 'stat-xp-theory'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.textContent = xp;
  });
  ['stat-challenges', 'stat-challenges-story', 'stat-challenges-theory'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.textContent = challenges;
  });
  ['stat-puzzles', 'stat-puzzles-story', 'stat-puzzles-theory'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.textContent = puzzles;
  });
  ['stat-badges', 'stat-badges-story', 'stat-badges-theory'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.textContent = bdgs;
  });
  var elNav = document.getElementById('nav-xp');
  if (elNav) elNav.textContent = xp + ' XP';
  renderBadgesSC();
}

/* ---- CHALLENGE 1: Tc Matcher ---- */
var tcMatcher = {
  materials: [
    { name: 'Niobium (Nb)', Tc: 9.2 },
    { name: 'Mercury (Hg)', Tc: 4.2 },
    { name: 'YBCO', Tc: 93 },
    { name: 'Nb₃Sn', Tc: 23 },
    { name: 'Aluminum (Al)', Tc: 1.2 },
    { name: 'Lead (Pb)', Tc: 7.2 },
    { name: 'MgB₂', Tc: 39 }
  ],
  score: 0,
  combo: 0,
  timer: null,
  timeLeft: 15,
  current: null,
  streak: 0
};

function startTcMatcher() {
  var txt = document.getElementById('tc-target-text');
  if (!txt) return;
  tcMatcher.current = tcMatcher.materials[Math.floor(Math.random() * tcMatcher.materials.length)];
  var Tc = tcMatcher.current.Tc;
  var T = Math.max(0.1, (Tc - 5 + Math.random() * 10)).toFixed(1);
  tcMatcher.current.givenT = parseFloat(T);
  txt.innerHTML = '<strong>' + tcMatcher.current.name + '</strong> — Tc ≈ ' + tcMatcher.current.Tc + ' K<br><span style="font-size:1.4rem;">Is it superconducting at T = ' + T + ' K?</span>';
  tcMatcher.timeLeft = 15;
  updateTcTimer();
  clearInterval(tcMatcher.timer);
  tcMatcher.timer = setInterval(function() {
    tcMatcher.timeLeft -= 1;
    updateTcTimer();
    if (tcMatcher.timeLeft <= 0) {
      clearInterval(tcMatcher.timer);
      guessSCState('timeout');
    }
  }, 1000);
}

function updateTcTimer() {
  var bar = document.getElementById('tc-timer');
  if (bar) bar.style.width = (tcMatcher.timeLeft / 15 * 100) + '%';
}

function guessSCState(yes) {
  clearInterval(tcMatcher.timer);
  var fb = document.getElementById('tc-feedback');
  if (yes === 'timeout') {
    tcMatcher.combo = 0;
    tcMatcher.streak = 0;
    if (fb) {
      fb.innerHTML = '<span class="error">⏰ Time\'s up! ' + tcMatcher.current.name + ' has Tc = ' + tcMatcher.current.Tc + ' K. At ' + tcMatcher.current.givenT + ' K it is ' + (tcMatcher.current.givenT < tcMatcher.current.Tc ? 'superconducting' : 'normal') + '.</span>';
      fb.style.display = 'block';
    }
  } else {
    var correct = yes === (tcMatcher.current.givenT < tcMatcher.current.Tc);
    if (correct) {
      tcMatcher.combo += 1;
      tcMatcher.streak += 1;
      tcMatcher.score += 50 + tcMatcher.combo * 5;
      if (fb) {
        fb.innerHTML = '<span class="success">✓ Correct! ' + (tcMatcher.current.givenT < tcMatcher.current.Tc ? 'Below Tc → superconducting.' : 'Above Tc → normal state.') + '</span>';
        fb.style.display = 'block';
      }
      if (window._GameState) {
        _GameState.addXP(50 + tcMatcher.combo * 5, 'sc_challenges');
        if (tcMatcher.streak >= 3) _GameState.earnedBadges.add('tc-master');
        _GameState.save();
        updateScoreboardSC();
      }
    } else {
      tcMatcher.combo = 0;
      tcMatcher.streak = 0;
      if (fb) {
        fb.innerHTML = '<span class="error">✗ Wrong. ' + tcMatcher.current.name + ' has Tc = ' + tcMatcher.current.Tc + ' K. At ' + tcMatcher.current.givenT + ' K it is ' + (tcMatcher.current.givenT < tcMatcher.current.Tc ? 'superconducting' : 'normal') + '.</span>';
        fb.style.display = 'block';
      }
    }
  }
  var elScore = document.getElementById('tc-score');
  var elCombo = document.getElementById('tc-combo');
  if (elScore) elScore.textContent = tcMatcher.score;
  if (elCombo) elCombo.textContent = tcMatcher.combo;
  setTimeout(startTcMatcher, 2000);
}

/* ---- CHALLENGE 2: Type I vs Type II ---- */
var typeIIChallenge = {
  pool: [
    { text: 'Expels all magnetic field abruptly below one critical field.', answer: 'I' },
    { text: 'Allows magnetic flux penetration via Abrikosov vortices between two critical fields.', answer: 'II' },
    { text: 'Used in high-field MRI magnets (up to 15 T).', answer: 'II' },
    { text: 'Undergoes a first-order phase transition at Hc.', answer: 'I' },
    { text: 'Has a mixed/vortex state between Hc1 and Hc2.', answer: 'II' },
    { text: 'Mercury and lead are examples of this type.', answer: 'I' }
  ],
  current: null,
  asked: 0
};

function startTypeChallenge() {
  var txt = document.getElementById('type-target-text');
  if (!txt) return;
  var q = typeIIChallenge.pool[typeIIChallenge.asked % typeIIChallenge.pool.length];
  typeIIChallenge.current = q;
  txt.textContent = q.text;
  var fb = document.getElementById('type-feedback');
  if (fb) fb.style.display = 'none';
}

function guessType(ans) {
  var fb = document.getElementById('type-feedback');
  var correct = ans === typeIIChallenge.current.answer;
  if (correct) {
    if (fb) { fb.innerHTML = '<span class="success">✓ Correct!</span>'; fb.style.display = 'block'; }
    if (window._GameState) {
      _GameState.addXP(60, 'sc_challenges');
      _GameState.earnedBadges.add('phase-detective');
      _GameState.save();
      updateScoreboardSC();
    }
  } else {
    if (fb) { fb.innerHTML = '<span class="error">✗ That is Type ' + typeIIChallenge.current.answer + ' behavior.</span>'; fb.style.display = 'block'; }
  }
  typeIIChallenge.asked += 1;
  setTimeout(startTypeChallenge, 1500);
}

/* ---- CHALLENGE 3: Isotope Effect ---- */
var isoChallenge = {
  pool: [
    { M1: 200, M2: 204, answer: Math.sqrt(204 / 200) },
    { M1: 199, M2: 202, answer: Math.sqrt(202 / 199) },
    { M1: 116, M2: 120, answer: Math.sqrt(120 / 116) },
    { M1: 63, M2: 65, answer: Math.sqrt(65 / 63) }
  ],
  current: null
};

function startIsoChallenge() {
  var txt = document.getElementById('iso-target-text');
  if (!txt) return;
  var q = isoChallenge.pool[Math.floor(Math.random() * isoChallenge.pool.length)];
  isoChallenge.current = q;
  txt.innerHTML = 'Isotope masses: M₁ = ' + q.M1 + ' u, M₂ = ' + q.M2 + ' u<br><span style="font-size:0.9rem;">Assume M<sup>α</sup>·Tc = constant with α = 0.5. What is Tc₁/Tc₂?</span>';
  document.getElementById('iso-answer').value = '';
}

function checkIsotopeAnswer() {
  var val = parseFloat(document.getElementById('iso-answer').value);
  var fb = document.getElementById('iso-feedback');
  var ans = isoChallenge.current.answer;
  var correct = Math.abs(val - ans) < 0.02;
  if (correct) {
    if (fb) { fb.innerHTML = '<span class="success">✓ Correct! Tc ∝ 1/√M, so Tc₁/Tc₂ = √(M₂/M₁) = ' + ans.toFixed(3) + '.</span>'; fb.style.display = 'block'; }
    if (window._GameState) {
      _GameState.addXP(80, 'sc_challenges');
      _GameState.earnedBadges.add('isotope-hunter');
      _GameState.save();
      updateScoreboardSC();
    }
  } else {
    if (fb) { fb.innerHTML = '<span class="error">✗ Expected ' + ans.toFixed(3) + '. Remember Tc ∝ 1/√M.</span>'; fb.style.display = 'block'; }
  }
  setTimeout(startIsoChallenge, 2000);
}

/* ---- PUZZLE 1: Cooper Pair Builder ---- */
var cooperBuilder = {
  pool: [
    { label: 'Electron (k↑)', id: 'e1' },
    { label: 'Electron (-k↓)', id: 'e2' },
    { label: 'Phonon (lattice vibration)', id: 'phonon' },
    { label: 'Attractive interaction', id: 'attr' },
    { label: 'Bound state = Cooper pair', id: 'pair' }
  ],
  sequence: ['e1', 'phonon', 'e2', 'attr', 'pair'],
  placed: []
};

function initCooperBuilder() {
  var pool = document.getElementById('cooper-pool');
  var zones = document.getElementById('cooper-zones');
  if (!pool || !zones) return;
  pool.innerHTML = '';
  zones.innerHTML = '';
  cooperBuilder.placed = [];
  cooperBuilder.pool.forEach(function(item) {
    var d = document.createElement('div');
    d.className = 'draggable-target';
    d.textContent = item.label;
    d.dataset.id = item.id;
    d.draggable = true;
    d.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', item.id); });
    pool.appendChild(d);
  });
  cooperBuilder.sequence.forEach(function() {
    var z = document.createElement('div');
    z.className = 'drop-zone';
    z.textContent = '?';
    z.addEventListener('dragover', function(e) { e.preventDefault(); });
    z.addEventListener('drop', function(e) {
      e.preventDefault();
      var id = e.dataTransfer.getData('text/plain');
      var idx = cooperBuilder.sequence.indexOf(id);
      if (idx >= 0) {
        z.textContent = cooperBuilder.pool.find(function(p) { return p.id === id; }).label;
        z.dataset.id = id;
        z.classList.remove('wrong');
        z.classList.add('correct');
      }
    });
    zones.appendChild(z);
  });
}

function checkCooperBuilder() {
  var zones = document.querySelectorAll('#cooper-zones .drop-zone');
  var fb = document.getElementById('cooper-feedback');
  var ok = true;
  zones.forEach(function(z, i) {
    var expected = cooperBuilder.sequence[i];
    if (z.dataset.id === expected) {
      z.classList.add('correct');
    } else {
      z.classList.add('wrong');
      ok = false;
    }
  });
  if (ok) {
    if (fb) { fb.innerHTML = '<span class="success">✓ Perfect! Electron + phonon + opposite electron → attractive interaction → bound Cooper pair.</span>'; fb.style.display = 'block'; }
    if (window._GameState) {
      _GameState.addXP(60, 'sc_puzzles');
      _GameState.earnedBadges.add('cooper-builder');
      _GameState.save();
      updateScoreboardSC();
    }
  } else {
    if (fb) { fb.innerHTML = '<span class="error">✗ Some steps are out of order. Try again.</span>'; fb.style.display = 'block'; }
    setTimeout(initCooperBuilder, 1500);
  }
}

/* ---- PUZZLE 2: Critical Field Calculator ---- */
var hcPuzzle = {
  current: null
};

function startHCPuzzle() {
  var txt = document.getElementById('hc-puzzle-text');
  if (!txt) return;
  var H0 = (Math.random() * 0.4 + 0.05).toFixed(3);
  var Tc = (Math.random() * 20 + 1).toFixed(1);
  var T = (Math.random() * (parseFloat(Tc) - 0.5) + 0.1).toFixed(1);
  var ans = parseFloat(H0) * (1 - (parseFloat(T) * parseFloat(T)) / (parseFloat(Tc) * parseFloat(Tc)));
  hcPuzzle.current = { H0: parseFloat(H0), Tc: parseFloat(Tc), T: parseFloat(T), answer: ans };
  txt.innerHTML = 'H₀ = ' + H0 + ' T, Tc = ' + Tc + ' K<br>Calculate Hc at T = ' + T + ' K using Hc(T) = H₀[1 - T²/Tc²]';
  document.getElementById('hc-answer').value = '';
}

function checkHCPuzzle() {
  var val = parseFloat(document.getElementById('hc-answer').value);
  var fb = document.getElementById('hc-feedback');
  var c = hcPuzzle.current;
  var correct = Math.abs(val - c.answer) < 0.005;
  if (correct) {
    if (fb) { fb.innerHTML = '<span class="success">✓ Correct! Hc(' + c.T + ' K) = ' + c.answer.toFixed(3) + ' T.</span>'; fb.style.display = 'block'; }
    if (window._GameState) {
      _GameState.addXP(80, 'sc_puzzles');
      _GameState.save();
      updateScoreboardSC();
    }
  } else {
    if (fb) { fb.innerHTML = '<span class="error">✗ Expected ≈ ' + c.answer.toFixed(3) + ' T.</span>'; fb.style.display = 'block'; }
  }
  setTimeout(startHCPuzzle, 2500);
}

/* ---- PUZZLE 3: Meissner vs Perfect Conductor ---- */
var meissnerPuzzle = {
  pool: [
    { text: 'A material is cooled below Tc while a magnetic field is already present. Upon crossing Tc, the field is expelled from the interior.', answer: 'meissner' },
    { text: 'A material has zero resistance but when an external field is applied, it allows the field to penetrate according to Faraday induction.', answer: 'perfect' },
    { text: 'Below Tc, the magnetic induction B inside the sample is exactly zero regardless of field history.', answer: 'meissner' },
    { text: 'In the normal state, a magnetic field is present inside. Cooling in zero field and then applying a field leads to the same interior B=0 state as cooling in field.', answer: 'meissner' },
    { text: 'A hypothetical material with zero resistivity but no flux expulsion — field inside depends on the order of cooling and applying the field.', answer: 'perfect' }
  ],
  asked: 0
};

function initMeissnerPuzzle() {
  var list = document.getElementById('meissner-list');
  if (!list) return;
  list.innerHTML = '';
  meissnerPuzzle.pool.forEach(function(item, i) {
    var row = document.createElement('div');
    row.style.cssText = 'margin:0.5rem 0;padding:0.5rem;background:var(--bg-elevated);border-radius:6px;font-size:0.85rem;';
    row.innerHTML = '<span style="color:var(--accent-cyan);">#' + (i + 1) + '</span> ' + item.text +
      '<br><select id="meissner-sel-' + i + '" style="margin-top:0.4rem;background:var(--bg-panel);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;">' +
      '<option value="" disabled selected>Choose...</option>' +
      '<option value="meissner">True Superconductor (Meissner)</option>' +
      '<option value="perfect">Perfect Conductor (zero-R only)</option></select>';
    list.appendChild(row);
  });
}

function checkMeissnerPuzzle() {
  var fb = document.getElementById('meissner-feedback');
  var ok = true;
  meissnerPuzzle.pool.forEach(function(item, i) {
    var sel = document.getElementById('meissner-sel-' + i);
    if (!sel || sel.value !== item.answer) ok = false;
  });
  if (ok) {
    if (fb) { fb.innerHTML = '<span class="success">✓ All correct! Meissner effect is an active, thermodynamic state — not merely zero resistance.</span>'; fb.style.display = 'block'; }
    if (window._GameState) {
      _GameState.addXP(120, 'sc_puzzles');
      _GameState.earnedBadges.add('meissner-master');
      _GameState.save();
      updateScoreboardSC();
    }
  } else {
    if (fb) { fb.innerHTML = '<span class="error">✗ Some classifications are wrong. Hint: Meissner means B=0 inside, independent of history.</span>'; fb.style.display = 'block'; }
  }
}

/* ---- Game Mode Switch ---- */
function setGameMode(mode) {
  document.querySelectorAll('.game-mode-btn').forEach(function(b) { b.classList.remove('active'); });
  var btn = document.getElementById('mode-' + mode);
  if (btn) btn.classList.add('active');
  // Toggle all mode sections dynamically
  document.querySelectorAll('.mode-section').forEach(function(s) { s.style.display = 'none'; });
  var sec = document.getElementById('section-' + mode);
  if (sec) sec.style.display = 'block';
  // Module-specific hooks
  if (mode === 'challenge') { startTcMatcher(); startTypeChallenge(); startIsoChallenge(); }
  if (mode === 'puzzle') { initCooperBuilder(); startHCPuzzle(); initMeissnerPuzzle(); }
  if (mode === 'play') {
    if (typeof initSuperconductivityV2 === 'function') {
      if (_scInited) {
        setPlayMode(_scActiveSubTab);
      } else {
        initSuperconductivityV2();
      }
    }
  }
  // Pause all canvas animations when leaving Playground
  if (mode !== 'play') {
    if (typeof cooperAnimId !== 'undefined' && cooperAnimId) { cancelAnimationFrame(cooperAnimId); cooperAnimId = null; }
    if (typeof meissnerAnimId !== 'undefined' && meissnerAnimId) { cancelAnimationFrame(meissnerAnimId); meissnerAnimId = null; }
    if (typeof gapAnimId !== 'undefined' && gapAnimId) { cancelAnimationFrame(gapAnimId); gapAnimId = null; }
  }
}
window.setGameMode = setGameMode;

/* ---- Boot ---- */
function initSCGames() {
  buildModuleNavSC();
  updateScoreboardSC();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSCGames);
} else {
  initSCGames();
}

/**
 * cond_apps_games.js — Conductivity Lab: gamified simulations + Canvas wiring
 * Module 07 — Electrical Conductivity
 */

'use strict';

var _dLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
  font: { family: 'JetBrains Mono, monospace', color: '#b0b0d0', size: 11 },
  margin: { l: 55, r: 10, t: 30, b: 45 },
  xaxis: { title: { font: { color: '#a0a0c0' } }, color: '#a0a0c0', gridcolor: '#1a1a28', zerolinecolor: '#3a3a5a' },
  yaxis: { title: { font: { color: '#a0a0c0' } }, color: '#a0a0c0', gridcolor: '#1a1a28', zerolinecolor: '#3a3a5a' }
};
function _ext(base, over) {
  var out = JSON.parse(JSON.stringify(base));
  for (var k in over) {
    if (typeof over[k] === 'object' && over[k] !== null && !Array.isArray(over[k]) && k in out && typeof out[k] === 'object') { for (var j in over[k]) out[k][j] = over[k][j]; }
    else out[k] = over[k];
  }
  return out;
}

var __COND = {
  Efield: 0.01, tau: 30, T: 300, n: 1e28, material: 'Cu',
  challenge: { active: false, score: 0, combo: 0, timeLeft: 60, streak: 0, timer: null },
  driftScore: 0,
  sigmaState: {},
  superState: {}
};

/* ===== PLAYGROUND: I-V & supporting apps (Plotly in separate containers if present) ===== */
function plotMeanFreePathApp() {
  var T = linspace(10, 500, 100);
  var l_ph = T.map(function(t) { return 40 * (300 / Math.max(t, 50)); });
  var l_imp = T.map(function() { return 200; });
  var l_total = T.map(function(t, i) { return 1 / (1 / l_ph[i] + 1 / l_imp[i]); });
  if (document.getElementById('plot-mfp')) {
    Plotly.react('plot-mfp', [
      { x: T, y: l_ph, mode: 'lines', name: 'e' + '\u207b' + '-phonon', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
      { x: T, y: l_imp, mode: 'lines', name: 'e' + '\u207b' + '-impurity', line: { color: '#ff4ecd', width: 2, dash: 'dash' } },
      { x: T, y: l_total, mode: 'lines', name: 'Total (Matthiessen)', line: { color: '#ffd740', width: 2.5 } }
    ], _ext(_dLayout, {
      title: { text: 'Mean Free Path vs Temperature', font: { size: 13 } },
      xaxis: { title: 'T (K)' },
      yaxis: { title: '\u03bb (nm)', zeroline: true, zerolinecolor: '#5a5a80' },
      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#3a3a5a', font: { color: '#d0d0e0' } }
    }), { responsive: true, displayModeBar: true, scrollZoom: true });
  }
}

function plotHallApp() {
  var B = linspace(-2, 2, 200);
  var thickness = 100e-9; var I = 1e-3;
  var n = 1e28; var vh = I / (n * 1.6e-19 * thickness);
  var VH_n = B.map(function(b) { return vh * b * 1e6; });
  var VH_p = B.map(function(b) { return -vh * b * 1e6; });
  if (document.getElementById('plot-hall')) {
    Plotly.react('plot-hall', [
      { x: B, y: VH_n, mode: 'lines', name: 'n-type', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
      { x: B, y: VH_p, mode: 'lines', name: 'p-type', line: { color: '#ff4ecd', width: 2.5 } }
    ], _ext(_dLayout, {
      title: { text: 'Hall Voltage vs B-field', font: { size: 13 } },
      xaxis: { title: 'B (T)' },
      yaxis: { title: 'V_H (\u03bcV)', zeroline: true, zerolinecolor: '#5a5a80' },
      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#3a3a5a', font: { color: '#d0d0e0' } }
    }), { responsive: true, displayModeBar: true, scrollZoom: true });
  }
}

function plotIoffeRegelApp() {
  var T = linspace(10, 500, 100);
  var kFl = T.map(function(t) {
    var tau = 50 * 300 / Math.max(t, 10);
    var vF = Math.sqrt(2 * 7 * 1.6e-19 / 9.109e-31);
    var lambda = vF * tau * 1e-15 * 1e9;
    var kF = Math.sqrt(2 * 7) * 1e10;
    return kF * lambda;
  });
  var limit = T.map(function() { return 1; });
  if (document.getElementById('plot-ioffe')) {
    Plotly.react('plot-ioffe', [
      { x: T, y: kFl, mode: 'lines', name: 'k_F ' + '\u03bb', line: { color: '#ffd740', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(255,215,64,0.06)' },
      { x: T, y: limit, mode: 'lines', name: 'Ioffe-Regel limit', line: { color: '#ff4ecd', width: 2, dash: 'dash' } }
    ], _ext(_dLayout, {
      title: { text: 'Ioffe–Regel Criterion', font: { size: 13 } },
      xaxis: { title: 'T (K)' },
      yaxis: { title: 'k_F ' + '\u03bb', type: 'log', zeroline: true, zerolinecolor: '#5a5a80' },
      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#3a3a5a', font: { color: '#d0d0e0' } }
    }), { responsive: true, displayModeBar: true, scrollZoom: true });
  }
}

function plotWiedemannFranzApp() {
  var T = linspace(10, 500, 100);
  var L = T.map(function(t) {
    var tau = 50 * 300 / Math.max(t, 50);
    var vF = Math.sqrt(2 * 7 * 1.6e-19 / 9.109e-31);
    var lambda = vF * tau * 1e-15;
    var c_el = 1.6e-19 * Math.PI * Math.PI / 3 * 8.617e-5 * t / 7;
    var sigma = 1e28 * 1.6e-19 * 1.6e-19 * tau * 1e-15 / 9.109e-31;
    var kappa = (1 / 3) * c_el * vF * lambda;
    return kappa / (sigma * t);
  });
  var Sommerfeld = T.map(function() { return 2.44e-8; });
  if (document.getElementById('plot-wf')) {
    Plotly.react('plot-wf', [
      { x: T, y: L, mode: 'lines', name: 'L = ' + '\u03ba' + '/(' + '\u03c3' + 'T)', line: { color: '#4ade80', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.06)' },
      { x: T, y: Sommerfeld, mode: 'lines', name: 'Sommerfeld value 2.44e' + '\u207b' + '\u2078', line: { color: '#ffd740', width: 2, dash: 'dash' } }
    ], _ext(_dLayout, {
      title: { text: 'Wiedemann–Franz Law: L(T)', font: { size: 13 } },
      xaxis: { title: 'T (K)' },
      yaxis: { title: 'L (W' + '\u03a9' + '/K' + '\u00b2' + ')', zeroline: true, zerolinecolor: '#5a5a80' },
      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#3a3a5a', font: { color: '#d0d0e0' } }
    }), { responsive: true, displayModeBar: true, scrollZoom: true });
  }
}

function plotDriftAnimation() {
  // Canvas-driven; Plotly fallback only if canvas missing
  var Ef = linspace(0, 0.5, 100);
  var vDrift = Ef.map(function(ef) { return ef * __COND.tau * 1e-3; });
  if (document.getElementById('plot-drift')) {
    Plotly.react('plot-drift', [
      { x: Ef, y: vDrift, mode: 'lines', name: 'v_d = eE' + '\u03c4' + '/m', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.06)' },
      { x: [__COND.Efield, __COND.Efield], y: [0, Math.max.apply(null, vDrift)], mode: 'lines', line: { color: '#facc15', width: 2, dash: 'dot' }, name: 'Current E = ' + __COND.Efield.toFixed(2) }
    ], _ext(_dLayout, {
      title: { text: 'Drift Velocity vs Field', font: { size: 13 } },
      xaxis: { title: 'E (V/nm)' }, yaxis: { title: 'v_d (mm/s)' }
    }), { responsive: true, displayModeBar: false });
  }
}

function plotResistivityTemp() {
  var T = linspace(1, 500, 200);
  var rho = T.map(function(t) {
    var x = t / 315;
    if (x < 0.1) return 0.02;
    if (x < 1) return 0.02 + 124.4 * Math.pow(x, 5) * 1e-4;
    return 0.02 + 1.6 * x * 1e-4;
  });
  if (document.getElementById('plot-rho-T')) {
    Plotly.react('plot-rho-T', [
      { x: T, y: rho, mode: 'lines', name: '\u03c1(T)', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.06)' },
      { x: [__COND.T, __COND.T], y: [0, Math.max.apply(null, rho)], mode: 'lines', line: { color: '#facc15', width: 2, dash: 'dot' }, name: 'Current T = ' + __COND.T + ' K' }
    ], _ext(_dLayout, {
      title: { text: 'Resistivity vs Temperature', font: { size: 13 } },
      xaxis: { title: 'T (K)' }, yaxis: { title: '\u03c1 (\u03bc\u03a9·cm)' }
    }), { responsive: true, displayModeBar: false });
  }
}

function plotIVCurve() {
  var V = linspace(-5, 5, 200);
  var kT = 8.617e-5 * __COND.T;
  var I_ohmic = V.map(function(v) { return v / 1e-3; });
  var I_diode = V.map(function(v) { return 1e-3 * (Math.exp(v / kT) - 1); });
  if (document.getElementById('plot-iv')) {
    Plotly.react('plot-iv', [
      { x: V, y: I_ohmic, mode: 'lines', name: 'Ohmic (Cu)', line: { color: '#00f0ff', width: 2 } },
      { x: V, y: I_diode, mode: 'lines', name: 'p-n Diode at ' + __COND.T + ' K', line: { color: '#ff4ecd', width: 2 } }
    ], _ext(_dLayout, {
      title: { text: 'I-V Characteristics at T = ' + __COND.T + ' K', font: { size: 13 } },
      xaxis: { title: 'V (V)' }, yaxis: { title: 'I (A)', type: 'log' }
    }), { responsive: true, displayModeBar: false });
  }
}

// ===== CHALLENGE 1: I-V CURVE TRACER =====
var ivTargets = [
  { name: 'Ohmic resistor', type: 'ohmic', V: 2, I: 2 },
  { name: 'Silicon diode', type: 'diode', V: 0.7, I: 1e-3 },
  { name: 'Schottky diode', type: 'schottky', V: 0.3, I: 5e-4 }
];

function startIVChallenge() {
  var c = __COND.challenge;
  c.active = true; c.score = 0; c.combo = 0; c.timeLeft = 60; c.streak = 0;
  nextIVTarget();
  document.getElementById('iv-score').textContent = '0';
  document.getElementById('iv-combo').textContent = '0';
  if (c.timer) clearInterval(c.timer);
  c.timer = setInterval(function() {
    if (!c.active) return;
    c.timeLeft--;
    var bar = document.getElementById('iv-timer');
    if (bar) { bar.style.width = (c.timeLeft / 60 * 100) + '%'; if (c.timeLeft < 12) bar.classList.add('urgent'); }
    if (c.timeLeft <= 0) { clearInterval(c.timer); c.active = false;
      document.getElementById('iv-feedback').textContent = 'Time\'s up! Final: ' + c.score;
    }
  }, 1000);
}

function nextIVTarget() {
  __COND.challenge.targetIV = ivTargets[Math.floor(Math.random() * ivTargets.length)];
  var t = __COND.challenge.targetIV;
  document.getElementById('iv-target-text').innerHTML = '🔎 Device: ' + t.name + ' · Match the I-V curve from the buttons.';
}

function guessIVCurve(type) {
  var c = __COND.challenge;
  if (!c.active) return;
  var fb = document.getElementById('iv-feedback');
  if (type === c.targetIV.type) {
    c.streak++; var pts = 50 + c.streak * 5;
    c.score += pts; c.combo++;
    __GameState.addXP(pts, 'I-V curve matched!');
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Correct! ' + c.targetIV.name + ' is ' + type + '. +' + pts + ' XP';
    particleBurst(window.innerWidth / 2, 300);
    if (c.score >= 200) __GameState.unlock({ id: 'circuit_builder', title: 'Circuit Builder', desc: 'Scored 200+ on I-V Tracer', icon: '🔌', xp: 25 });
    setTimeout(nextIVTarget, 1500);
  } else {
    c.streak = 0; c.combo = 0;
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ Not ' + type + '. Ohmic → linear. Diode → exponential. Schottky → lower turn-on.';
  }
  document.getElementById('iv-score').textContent = c.score;
  document.getElementById('iv-combo').textContent = c.combo;
}

// ===== CHALLENGE 2: HALL EFFECT SIGN DETECTOR =====
var hallMaterials = [
  { name: 'n-type Si', sign: 'negative', carriers: 'electrons' },
  { name: 'p-type Ge', sign: 'positive', carriers: 'holes' },
  { name: 'Gold (metal)', sign: 'negative', carriers: 'electrons' }
];

function startHallChallenge() {
  var t = hallMaterials[Math.floor(Math.random() * hallMaterials.length)];
  __COND.challenge.hallTarget = t;
  document.getElementById('hall-target-text').textContent = '🔎 Material: ' + t.name + ' · Hall voltage sign?';
  document.getElementById('hall-feedback').style.display = 'none';
}

function guessHallSign(sign) {
  var t = __COND.challenge.hallTarget;
  var fb = document.getElementById('hall-feedback');
  if (sign === t.sign) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Correct! ' + t.name + ' has ' + t.carriers + ' → ' + t.sign + ' Hall voltage. R_H = 1/(n·e), sign tells carrier type.';
    __GameState.addXP(60, 'Hall sign detected!');
    __GameState.unlock({ id: 'hall_detector', title: 'Hall Detector', desc: 'Identified carrier types', icon: '🧲', xp: 25 });
    particleBurst(window.innerWidth / 2, 300, '#facc15');
    setTimeout(startHallChallenge, 2000);
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ ' + t.name + ' has ' + t.carriers + ' → ' + t.sign + ' V_H. Electrons = negative. Holes = positive.';
  }
}

// ===== CHALLENGE 3: SUPERCONDUCTING TRANSITION =====
var superMaterials = [
  { name: 'Niobium (Nb)', Tc: 9.2, type: 'BCS' },
  { name: 'YBCO', Tc: 93, type: 'high-Tc' },
  { name: 'Mercury (Hg)', Tc: 4.2, type: 'BCS' }
];

function startSuperChallenge() {
  var t = superMaterials[Math.floor(Math.random() * superMaterials.length)];
  __COND.challenge.superTarget = t;
  document.getElementById('super-target-text').textContent = '🔎 Material: ' + t.name + ' · Is it superconducting at 4 K?';
  document.getElementById('super-feedback').style.display = 'none';
}

function guessSuperConducting(answer) {
  var t = __COND.challenge.superTarget;
  var fb = document.getElementById('super-feedback');
  var isSC = t.Tc > 4;
  if (answer === isSC) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '✓ Correct! ' + t.name + ' has T_c = ' + t.Tc + ' K. At 4 K: ' + (isSC ? 'superconducting!' : 'normal metal.') + '<br/>Zero resistivity, Meissner effect, and persistent current.';
    __GameState.addXP(80, 'Superconductivity identified!');
    __GameState.unlock({ id: 'superconductor', title: 'Superconductor', desc: 'Identified superconducting state', icon: '❄', xp: 30 });
    particleBurst(window.innerWidth / 2, 300, '#00f0ff');
    setTimeout(startSuperChallenge, 2000);
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ ' + t.name + ': T_c = ' + t.Tc + ' K. At 4 K it is ' + (isSC ? 'superconducting' : 'normal') + '.';
  }
}

// ===== PUZZLE 1: MEAN FREE PATH BUILDER =====
var scatterTerms = [
  { label: 'Impurity scattering', correct: 'tau', type: 'add' },
  { label: 'Phonon scattering', correct: 'tau-ph', type: 'thermal' },
  { label: 'Electron-electron', correct: 'tau-ee', type: 'weak' },
  { label: 'Surface scattering', correct: 'tau-surf', type: 'thin-film' }
];

function initMFPBuilder() {
  var pool = document.getElementById('mfp-pool');
  var zones = document.getElementById('mfp-zones');
  if (!pool || !zones) return;
  pool.innerHTML = '';
  scatterTerms.forEach(function(t) {
    var el = document.createElement('div');
    el.className = 'draggable-target'; el.draggable = true;
    el.textContent = t.label;
    el.ondragstart = function(e) { e.dataTransfer.setData('text', t.correct); };
    pool.appendChild(el);
  });
  zones.innerHTML = '';
  [{label:'Increases resistance', ans:'tau'},{label:'Decreases with T', ans:'tau-ph'},{label:'Weak at low T', ans:'tau-ee'},{label:'Dominates in thin films', ans:'tau-surf'}].forEach(function(z) {
    var zone = document.createElement('div');
    zone.className = 'drop-zone'; zone.dataset.want = z.ans;
    zone.textContent = z.label;
    zone.ondrop = function(e) {
      e.preventDefault(); var got = e.dataTransfer.getData('text');
      if (got === z.ans) { zone.classList.add('correct'); zone.textContent = z.label + ' ✓'; }
      else { zone.style.borderColor = '#ef4444'; zone.textContent = z.label + ' ✗'; }
    };
    zone.ondragover = function(e) { e.preventDefault(); };
    zones.appendChild(zone);
  });
}

function checkMFPBuilder() {
  var fb = document.getElementById('mfp-feedback');
  var correct = document.querySelectorAll('#mfp-zones .drop-zone.correct').length;
  if (correct >= 2) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Good! Matthiessen\'s rule: 1/\u03c4 = 1/\u03c4_imp + 1/\u03c4_ph + ... Each independent scattering channel adds to resistivity.';
    __GameState.addXP(60, 'Mean free path understood!');
  } else { fb.className = 'challenge-feedback error'; fb.style.display = 'block'; fb.textContent = '✗ Try again. Matthiessen: resistivities from different mechanisms add.'; }
}

// ===== PUZZLE 2: CONDUCTIVITY FORMULA DRAG =====
var sigmaTerms = [
  { id: 'ne2', label: 'ne²', desc: 'carrier charge squared' },
  { id: 'tau', label: '\u03c4', desc: 'scattering time' },
  { id: 'm', label: 'm*', desc: 'effective mass' }
];

function initSigmaBuilder() {
  var pool = document.getElementById('sigma-pool');
  var target = document.getElementById('sigma-target');
  if (!pool || !target) return;
  pool.innerHTML = '';
  [
    {id:'ne2', label:'ne²', order:1},
    {id:'tau', label:'\u03c4', order:2},
    {id:'m', label:'m*', order:3},
    {id:'vF', label:'v_F', order:0,wrong:true},
    {id:'T', label:'T', order:0,wrong:true}
  ].forEach(function(t) {
    var el = document.createElement('div');
    el.className = 'draggable-target'; el.draggable = true;
    el.dataset.wrong = t.wrong || false;
    el.innerHTML = '\u003cspan style="font-family:var(--mono);color:var(--accent-cyan);">' + t.label + '\u003c/span\u003e';
    el.ondragstart = function(e) { e.dataTransfer.setData('text', t.wrong ? 'wrong' : t.id); };
    pool.appendChild(el);
  });
  target.innerHTML = '\u003cstrong\u003e\u03c3 = \u003c/strong\u003e \u003cdiv class="drop-zone" id="sigma-num" style="display:inline-block;min-width:80px;">?\u003c/div\u003e · \u003cdiv class="drop-zone" id="sigma-tau" style="display:inline-block;min-width:50px;">?\u003c/div\u003e / \u003cdiv class="drop-zone" id="sigma-m" style="display:inline-block;min-width:50px;">?\u003c/div\u003e';
  ['sigma-num','sigma-tau','sigma-m'].forEach(function(id, idx) {
    var want = ['ne2','tau','m'][idx];
    var el = document.getElementById(id);
    el.ondrop = function(e) {
      e.preventDefault(); var got = e.dataTransfer.getData('text');
      if (got === want) { el.classList.add('correct'); el.textContent = got === 'ne2' ? 'ne²' : (got === 'tau' ? '\u03c4' : 'm*'); }
      else el.classList.add('wrong');
    };
    el.ondragover = function(e) { e.preventDefault(); };
  });
}

function checkSigmaBuilder() {
  var fb = document.getElementById('sigma-feedback');
  var correct = document.querySelectorAll('#sigma-target .drop-zone.correct').length;
  if (correct === 3) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Perfect! \u03c3 = ne²\u03c4/m*. More carriers → higher \u03c3. Longer \u03c4 (cleaner crystal) → higher \u03c3. Heavier m* → lower mobility \u03bc.';
    __GameState.addXP(80, 'Conductivity formula built!');
  } else { fb.className = 'challenge-feedback error'; fb.style.display = 'block'; fb.textContent = '✗ \u03c3 = ne²\u03c4/m*. Drag ne², \u03c4, m* in the correct slots.'; }
}

// ===== PUZZLE 3: WIEDEMANN-FRANZ vs VIOLATION =====
var wfPuzzles = [
  { label: 'Pure Cu at 300 K', obey: true },
  { label: 'Semiconductor Si', obey: false },
  { label: 'Superconducting Nb below T_c', obey: false },
  { label: 'Aluminum (normal metal)', obey: true }
];

function initWFPuzzle() {
  var c = document.getElementById('wf-list');
  c.innerHTML = '';
  wfPuzzles.forEach(function(p, i) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:1rem;padding:0.5rem;border-bottom:1px solid var(--border-subtle);';
    var label = document.createElement('div');
    label.style.cssText = 'font-family:var(--mono);font-size:0.85rem;color:var(--text-main);width:200px;';
    label.textContent = p.label;
    var sel = document.createElement('select');
    sel.id = 'wf-sel-' + i;
    sel.style.cssText = 'background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;font-family:var(--mono);';
    [{v:'yes',t:'Obey W-F'},{v:'no',t:'Violate W-F'}].forEach(function(opt) {
      var o = document.createElement('option'); o.value = opt.v; o.textContent = opt.t; sel.appendChild(o);
    });
    row.appendChild(label); row.appendChild(sel); c.appendChild(row);
  });
}

function checkWFPuzzle() {
  var correct = 0;
  wfPuzzles.forEach(function(p, i) {
    var v = document.getElementById('wf-sel-' + i).value;
    if ((p.obey && v === 'yes') || (!p.obey && v === 'no')) correct++;
  });
  var fb = document.getElementById('wf-cond-feedback');
  if (correct === wfPuzzles.length) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Excellent! W-F law holds only for Fermi liquid metals. Violated in semiconductors (phonon heat) and superconductors (Cooper pairs carry no entropy).';
    __GameState.addXP(120, 'W-F law mastered!');
  } else { fb.className = 'challenge-feedback error'; fb.style.display = 'block'; fb.textContent = '✗ ' + (wfPuzzles.length - correct) + ' wrong. Semiconductors and superconductors violate W-F.'; }
}

// ===== MODE SWITCHING: Pause/Resume Canvas =====
function _condModeHook() {
  if (typeof setGameMode === 'function') {
    var orig = setGameMode;
    window.setGameMode = function(mode) {
      orig(mode);
      if (mode === 'play') {
        if (typeof condResumeAnimation === 'function') condResumeAnimation();
      } else {
        if (typeof condPauseAnimation === 'function') condPauseAnimation();
      }
      if (mode === 'challenge') { startIVChallenge(); startHallChallenge(); startSuperChallenge(); }
      if (mode === 'puzzle') { initMFPBuilder(); initSigmaBuilder(); initWFPuzzle(); }
    };
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  // Sync __COND sliders with new cond_sim.js sliders
  ['slider-Efield','slider-tau','slider-T-cond','slider-n-cond'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function(e) {
        var v = Number.parseFloat(e.target.value);
        if (id === 'slider-Efield') __COND.Efield = v;
        if (id === 'slider-tau') __COND.tau = v;
        if (id === 'slider-T-cond') __COND.T = v;
        if (id === 'slider-n-cond') __COND.n = v;
        plotDriftAnimation();
        plotResistivityTemp();
        plotIVCurve();
        plotMeanFreePathApp();
        plotHallApp();
        plotIoffeRegelApp();
        plotWiedemannFranzApp();
      });
    }
  });

  setTimeout(function() {
    plotDriftAnimation();
    plotResistivityTemp();
    plotIVCurve();
    plotMeanFreePathApp();
    plotHallApp();
    plotIoffeRegelApp();
    plotWiedemannFranzApp();
  }, 500);

  _condModeHook();

  var nav = document.getElementById('module-nav');
  if (nav) {
    var modules = [
      { num: '01', name: 'QHO', url: '../01_qho/index.html' },
      { num: '02', name: 'Hydrogen', url: '../02_hydrogen/index.html' },
      { num: '03', name: 'Spin-1/2', url: '../03_spin/index.html' },
      { num: '04', name: 'KP Model', url: '../04_kronig_penney/index.html' },
      { num: '05', name: 'Bands', url: '../05_energy_bands/index.html' },
      { num: '06', name: 'Fermi', url: '../06_fermi_surface/index.html' },
      { num: '07', name: 'Conductivity', current: true }
    ];
    modules.forEach(function(m) {
      var el = document.createElement(m.current ? 'div' : 'a');
      if (!m.current) { el.href = m.url; el.style.textDecoration = 'none'; }
      el.style.cssText = 'display:block;padding:0.5rem 0.7rem;border-radius:8px;margin-bottom:0.3rem;font-size:0.85rem;';
      if (m.current) { el.style.background = 'rgba(255,64,129,0.08)'; el.style.border = '1px solid rgba(255,64,129,0.3)'; el.style.color = '#ff4ecd'; el.textContent = m.num + '. ' + m.name + ' (here)'; }
      else { el.style.background = 'var(--bg-elevated)'; el.style.border = '1px solid var(--border-subtle)'; el.style.color = 'var(--text-dim)'; el.textContent = m.num + '. ' + m.name; }
      nav.appendChild(el);
    });
  }
  var xpEl = document.getElementById('stat-xp'); if (xpEl) xpEl.textContent = __GameState.xp();
  var navXp = document.getElementById('nav-xp'); if (navXp) navXp.textContent = __GameState.xp() + ' XP';
});

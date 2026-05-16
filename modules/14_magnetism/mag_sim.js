/**
 * Magnetism — Physics Engine (v4)
 * Susceptibility, Curie/Weiss law, ferromagnetism, hysteresis,
 * temperature-dependent M-T curve, antiferromagnetic peak,
 * material presets, and Ising lattice animation.
 */
'use strict';
function _plotMAG(id, traces, lay, cfg) {
  var el = document.getElementById(id);
  if (el && typeof Plotly !== 'undefined') Plotly.react(id, traces, lay, cfg);
}
const PLOT_CFG = { responsive: true, displayModeBar: false };
function magLayout(title, xtitle, ytitle, extra) {
  var base = {
    margin: { t: 25, r: 10, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    hovermode: 'x unified'
  };
  return Object.assign(base, extra || {});
}

let magState = {
  T: 300,
  C: 1.0,
  theta: 0,
  Ms: 1.0,
  Hc: 0.05,
  Tc: 1043,
  TN: 0,
  H: 0,
  material: 'Fe'
};

var MAG_MATERIALS = {
  'Fe': { Tc: 1043, TN: 0,   Ms: 1.7,  Hc: 0.05, label: 'Iron (Tc=1043 K)' },
  'Ni': { Tc: 627,  TN: 0,   Ms: 0.6,  Hc: 0.02, label: 'Nickel (Tc=627 K)' },
  'Co': { Tc: 1388, TN: 0,   Ms: 1.4,  Hc: 0.08, label: 'Cobalt (Tc=1388 K)' },
  'Gd': { Tc: 293,  TN: 0,   Ms: 2.1,  Hc: 0.01, label: 'Gadolinium (Tc=293 K)' },
  'Cu': { Tc: 0,    TN: 0,   Ms: 0,    Hc: 0,    label: 'Copper (paramagnetic)' }
};

function chiCurie(T, C) { return C / T; }
function chiCurieWeiss(T, C, theta) {
  if (theta > 0 && T > theta + 1) return C / (T - theta);
  return null;
}
function chiAntiferro(T, TN, C) {
  // Néel model: peak at TN, then paramagnetic ~ C/(T+TN) for T > TN
  if (TN <= 1) return null;
  if (T < TN) return C / (TN) * (1 + 0.5 * (1 - Math.pow(T / TN, 0.5)));
  return C / (T + TN);
}
function magnetization(T, Tc, Ms) {
  // Simplified Brillouin-like M(T)/Ms = (1 - T/Tc)^beta, beta~1/3 for 3D Ising
  if (Tc <= 1) return 0;
  if (T >= Tc) return 0;
  return Ms * Math.pow(1 - Math.pow(T / Tc, 2), 0.35);
}

function plotSusceptibility() {
  var T = [], chiC = [], chiCW = [], chiDia = [], chiAF = [];
  for (var t = 10; t <= 1400; t += 5) {
    T.push(t);
    chiC.push(chiCurie(t, magState.C));
    var cw = chiCurieWeiss(t, magState.C, magState.theta);
    chiCW.push(cw);
    chiDia.push(-0.001);
    var af = chiAntiferro(t, magState.TN, magState.C);
    chiAF.push(af);
  }
  var traces = [
    { x: T, y: chiC, mode: 'lines', name: 'χ = C/T (Curie)', line: { color: '#00f0ff', width: 2 } },
    { x: T, y: chiCW, mode: 'lines', name: 'χ = C/(T-θ) (Weiss)', line: { color: '#ff4ecd', width: 2 } },
    { x: T, y: chiDia, mode: 'lines', name: 'Diamagnetism', line: { color: '#ffd54f', width: 1.5, dash: 'dot' } },
    { x: [magState.Tc, magState.Tc], y: [-0.01, 0.1], mode: 'lines', line: { color: '#facc15', width: 1, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' }
  ];
  if (magState.TN > 1) {
    traces.push({ x: T, y: chiAF, mode: 'lines', name: 'χ AFM', line: { color: '#4ade80', width: 2 } });
    traces.push({ x: [magState.TN, magState.TN], y: [-0.01, 0.1], mode: 'lines', line: { color: '#4ade80', width: 1, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' });
  }
  var anns = [];
  anns.push({ x: magState.Tc + 30, y: 0.08, text: 'Tc = ' + magState.Tc + ' K', font: { color: '#ffd54f', size: 10 }, showarrow: false });
  if (magState.TN > 1) {
    anns.push({ x: magState.TN + 30, y: 0.065, text: 'TN = ' + magState.TN + ' K', font: { color: '#4ade80', size: 10 }, showarrow: false });
  }
  _plotMAG('plot-susceptibility', traces, magLayout(null, 'Temperature (K)', 'χ', { annotations: anns }), PLOT_CFG);
}

function plotMagnetizationCurve() {
  var T = [], M = [];
  var tc = magState.Tc || 0;
  for (var t = 0; t <= 1400; t += 5) {
    T.push(t);
    M.push(magnetization(t, tc, magState.Ms));
  }
  _plotMAG('plot-M-T', [
    { x: T, y: M, mode: 'lines', name: 'M(T)', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: [tc, tc], y: [0, magState.Ms], mode: 'lines', line: { color: '#facc15', width: 1.5, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' }
  ], magLayout(null, 'Temperature (K)', 'M / M_s', {
    annotations: [
      { x: tc + 30, y: magState.Ms * 0.5, text: 'Curie temp Tc', font: { color: '#ffd54f', size: 10 }, showarrow: false },
      { x: 200, y: magState.Ms * 0.9, text: 'Ferromagnetic', font: { color: '#4ade80', size: 9 }, showarrow: false },
      { x: tc + 100, y: 0.05, text: 'Paramagnetic', font: { color: '#ff4ecd', size: 9 }, showarrow: false }
    ]
  }), PLOT_CFG);
}

function plotHysteresis() {
  var H_up = [], M_up = [], H_down = [], M_down = [];
  var Ms = magState.Ms, Hc = magState.Hc;
  var t_ratio = magState.Tc > 1 ? Math.min(magState.T / magState.Tc, 1) : 1;
  var Hc_eff = Hc * Math.pow(1 - t_ratio, 0.5);
  var Mr = Ms; // remanence for a square-ish loop
  var alpha = 0.5; // slope parameter
  // Sweep H from -0.3 up to +0.3
  for (var h = -0.3; h <= 0.3 + 1e-9; h += 0.005) {
    H_up.push(h);
    if (h < -Hc_eff) M_up.push(-Ms + (Ms - Mr) * Math.tanh((h + Hc_eff) / alpha));
    else if (h > Hc_eff) M_up.push(Ms - (Ms - Mr) * Math.tanh((Hc_eff - h) / alpha));
    else M_up.push(Mr * (h / Math.max(Hc_eff, 1e-6)));
  }
  // Sweep H back down from +0.3 to -0.3
  for (var h = 0.3; h >= -0.3 - 1e-9; h -= 0.005) {
    H_down.push(h);
    if (h > Hc_eff) M_down.push(Ms - (Ms - Mr) * Math.tanh((h - Hc_eff) / alpha));
    else if (h < -Hc_eff) M_down.push(-Ms + (Ms - Mr) * Math.tanh((-Hc_eff - h) / alpha));
    else M_down.push(-Mr * (h / Math.max(Hc_eff, 1e-6)));
  }
  _plotMAG('plot-hysteresis', [
    { x: H_up, y: M_up, mode: 'lines', name: 'M sweep ↑', line: { color: '#4ade80', width: 2.5 }, showlegend: true },
    { x: H_down, y: M_down, mode: 'lines', name: 'M sweep ↓', line: { color: '#ff4ecd', width: 2.5 }, showlegend: true },
    { x: [-0.3, 0.3], y: [0, 0], mode: 'lines', line: { color: '#505070', width: 1, dash: 'dot' }, showlegend: false, hoverinfo: 'skip' },
    { x: [0, 0], y: [-Ms, Ms], mode: 'lines', line: { color: '#505070', width: 1, dash: 'dot' }, showlegend: false, hoverinfo: 'skip' },
    { x: [Hc_eff, Hc_eff], y: [-0.02, 0.02], mode: 'lines', line: { color: '#ffd54f', width: 2 }, showlegend: false, hoverinfo: 'skip' },
    { x: [-Hc_eff, -Hc_eff], y: [-0.02, 0.02], mode: 'lines', line: { color: '#ffd54f', width: 2 }, showlegend: false, hoverinfo: 'skip' }
  ], magLayout(null, 'H (arb.)', 'M (arb.)', {
    annotations: [
      { x: Hc_eff + 0.02, y: Ms * 0.5, text: 'Hc = ' + Hc_eff.toFixed(3), font: { color: '#ffd54f', size: 10 }, showarrow: false },
      { x: 0.15, y: Ms * 0.1, text: Hc_eff < 0.001 ? 'No hysteresis (T ≥ Tc)' : 'Hysteresis loop', font: { color: '#8080a0', size: 9 }, showarrow: false }
    ]
  }), PLOT_CFG);
}

/* ---- Ising lattice ---- */
const ISING_SIZE = 50;
var isingSpins = [];
var isingCanvas = null, isingCtx = null;
var isingCell = 6; // pixels per spin
var isingInterval = null;
function initIsing() {
  isingCanvas = document.getElementById('ising-canvas');
  if (!isingCanvas) return;
  var wrapper = document.getElementById('ising-wrapper');
  if (wrapper) { isingCanvas.width = wrapper.clientWidth; isingCanvas.height = wrapper.clientHeight; }
  isingCtx = isingCanvas.getContext('2d');
  // random init
  isingSpins = [];
  for (var i = 0; i < ISING_SIZE; i++) {
    var row = [];
    for (var j = 0; j < ISING_SIZE; j++) row.push(Math.random() < 0.5 ? 1 : -1);
    isingSpins.push(row);
  }
  isingCanvas.addEventListener('click', onIsingClick);
  if (!isingInterval) isingInterval = setInterval(stepIsing, 80);
}
function onIsingClick(e) {
  if (!isingCanvas) return;
  var rect = isingCanvas.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;
  var j = Math.floor(x / isingCell);
  var i = Math.floor(y / isingCell);
  if (i >= 0 && i < ISING_SIZE && j >= 0 && j < ISING_SIZE) {
    isingSpins[i][j] *= -1;
    drawIsing();
    updateLatticeM();
  }
}
function stepIsing() {
  if (!isingSpins.length) return;
  var J = 1.0; // exchange coupling
  var kB = 1.0;
  var T = magState.T;
  // Metropolis sweep: attempt N flips
  var N = ISING_SIZE * ISING_SIZE;
  var beta = T < 1 ? 100 : 1.0 / (0.001 * T); // scaled
  for (var s = 0; s < N; s++) {
    var i = Math.floor(Math.random() * ISING_SIZE);
    var j = Math.floor(Math.random() * ISING_SIZE);
    var neighbors = 0;
    if (i > 0) neighbors += isingSpins[i-1][j];
    if (i < ISING_SIZE-1) neighbors += isingSpins[i+1][j];
    if (j > 0) neighbors += isingSpins[i][j-1];
    if (j < ISING_SIZE-1) neighbors += isingSpins[i][j+1];
    var dE = 2 * J * isingSpins[i][j] * neighbors + 2 * magState.H * isingSpins[i][j];
    if (dE < 0 || Math.random() < Math.exp(-dE * beta)) {
      isingSpins[i][j] *= -1;
    }
  }
  drawIsing();
  updateLatticeM();
}
function drawIsing() {
  if (!isingCtx) return;
  isingCtx.clearRect(0, 0, isingCanvas.width, isingCanvas.height);
  // center the lattice
  var offX = (isingCanvas.width - ISING_SIZE * isingCell) / 2;
  var offY = (isingCanvas.height - ISING_SIZE * isingCell) / 2;
  for (var i = 0; i < ISING_SIZE; i++) {
    for (var j = 0; j < ISING_SIZE; j++) {
      var x = offX + j * isingCell;
      var y = offY + i * isingCell;
      var s = isingSpins[i][j];
      isingCtx.fillStyle = s === 1 ? '#00f0ff' : '#ff4ecd';
      // draw small arrow shape
      isingCtx.beginPath();
      if (s === 1) {
        isingCtx.moveTo(x + 2, y + isingCell - 2);
        isingCtx.lineTo(x + isingCell/2, y + 2);
        isingCtx.lineTo(x + isingCell - 2, y + isingCell - 2);
      } else {
        isingCtx.moveTo(x + 2, y + 2);
        isingCtx.lineTo(x + isingCell/2, y + isingCell - 2);
        isingCtx.lineTo(x + isingCell - 2, y + 2);
      }
      isingCtx.fill();
      // domain wall: if neighbors differ, tint yellow
      var neighDiff = 0;
      if (i < ISING_SIZE - 1 && isingSpins[i][j] !== isingSpins[i+1][j]) neighDiff = 1;
      if (j < ISING_SIZE - 1 && isingSpins[i][j] !== isingSpins[i][j+1]) neighDiff = 1;
      if (neighDiff) {
        isingCtx.fillStyle = 'rgba(250,204,21,0.25)';
        isingCtx.fillRect(x, y, isingCell, isingCell);
      }
    }
  }
}
function updateLatticeM() {
  var sum = 0;
  for (var i = 0; i < ISING_SIZE; i++)
    for (var j = 0; j < ISING_SIZE; j++) sum += isingSpins[i][j];
  var m = sum / (ISING_SIZE * ISING_SIZE);
  var el = document.getElementById('live-lattice-M');
  if (el) el.textContent = m.toFixed(3);
}

function updateLiveMAG() {
  var el = document.getElementById('live-chi'); if (el) el.textContent = chiCurie(magState.T, magState.C).toFixed(4);
  var el2 = document.getElementById('live-Hc');
  var t_ratio = magState.Tc > 1 ? Math.min(magState.T / magState.Tc, 1) : 1;
  var Hc_eff = magState.Hc * Math.pow(1 - t_ratio, 0.5);
  if (el2) el2.textContent = Hc_eff.toFixed(3);
  var elM = document.getElementById('live-M'); if (elM) elM.textContent = magnetization(magState.T, magState.Tc, magState.Ms).toFixed(3) + ' M_s';
  var elState = document.getElementById('live-mag-state');
  if (elState) {
    var isFM = magState.T < magState.Tc && magState.Ms > 0;
    elState.innerHTML = isFM ? '<span class="badge" style="color:#4ade80;">Ferromagnetic</span>' : '<span class="badge" style="color:#8080a0;">Paramagnetic</span>';
  }
  updateLatticeM();
}

function setMagMaterial(name) {
  var mat = MAG_MATERIALS[name];
  if (!mat) return;
  magState.Tc = mat.Tc;
  magState.TN = mat.TN || 0;
  magState.Ms = mat.Ms;
  magState.Hc = mat.Hc;
  magState.material = name;
  var sTc = document.getElementById('slider-Tc');
  var sMs = document.getElementById('slider-Ms');
  if (sTc) { sTc.value = mat.Tc; var el = document.getElementById('val-Tc'); if (el) el.textContent = mat.Tc; }
  if (sMs) { sMs.value = mat.Ms; var el = document.getElementById('val-Ms'); if (el) el.textContent = mat.Ms.toFixed(2); }
  // update active button
  document.querySelectorAll('.mat-btn').forEach(function(btn) { btn.classList.remove('active'); });
  var activeBtn = document.getElementById('btn-' + name);
  if (activeBtn) activeBtn.classList.add('active');
  plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); updateLiveMAG();
}

function initMagnetism() {
  var elT = document.getElementById('slider-T-mag');
  var elC = document.getElementById('slider-C');
  var elTheta = document.getElementById('slider-theta');
  var elMs = document.getElementById('slider-Ms');
  var elTc = document.getElementById('slider-Tc');
  var elH = document.getElementById('slider-H');

  if (elT) {
    elT.addEventListener('input', function() {
      magState.T = parseFloat(this.value);
      var elVal = document.getElementById('val-T-mag');
      if (elVal) elVal.textContent = magState.T;
      plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); updateLiveMAG();
    });
  }
  if (elC) {
    elC.addEventListener('input', function() {
      magState.C = parseFloat(this.value);
      var elVal = document.getElementById('val-C');
      if (elVal) elVal.textContent = magState.C.toFixed(2);
      plotSusceptibility(); updateLiveMAG();
    });
  }
  if (elTheta) {
    elTheta.addEventListener('input', function() {
      magState.theta = parseFloat(this.value);
      var elVal = document.getElementById('val-theta');
      if (elVal) elVal.textContent = magState.theta.toFixed(1);
      plotSusceptibility(); updateLiveMAG();
    });
  }
  if (elMs) {
    elMs.addEventListener('input', function() {
      magState.Ms = parseFloat(this.value);
      var elVal = document.getElementById('val-Ms');
      if (elVal) elVal.textContent = magState.Ms.toFixed(2);
      plotMagnetizationCurve(); plotHysteresis(); updateLiveMAG();
    });
  }
  if (elTc) {
    elTc.addEventListener('input', function() {
      magState.Tc = parseFloat(this.value);
      var elVal = document.getElementById('val-Tc');
      if (elVal) elVal.textContent = magState.Tc;
      plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); updateLiveMAG();
    });
  }
  if (elH) {
    elH.addEventListener('input', function() {
      magState.H = parseFloat(this.value);
      var elVal = document.getElementById('val-H');
      if (elVal) elVal.textContent = magState.H.toFixed(3);
      updateLiveMAG();
    });
  }

  plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); updateLiveMAG();
  initIsing();
}

// allow safe re-init
window.initMagnetism = initMagnetism;
window.setMagMaterial = setMagMaterial;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMagnetism);
} else {
  initMagnetism();
}

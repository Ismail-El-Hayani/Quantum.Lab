/**
 * Junctions & Devices — Physics Engine (v3)
 * p-n junction, Schottky, diode equation, solar cell I-V, MPP tracker,
 * material presets, ideality factor, contact-metal work functions.
 */
'use strict';
const q_eV = 1.602e-19;
const kB_eV = 8.617e-5;
function idealDiodeI(V, T, I0, n) {
  var kT = kB_eV * T;
  return I0 * (Math.exp(V / (n * kT)) - 1);
}
function schottkyI(V, T, phi_b, A) {
  // Thermionic emission: J = A* T² exp(-qφb/kT) [exp(qV/kT) - 1]
  var A_star = A || 120; // A* in A/cm²/K² for free electron mass
  var kT = kB_eV * T;
  return A_star * T * T * Math.exp(-phi_b / kT) * (Math.exp(V / kT) - 1);
}
function _plotJD(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}
const PLOT_CFG = { responsive: true, displayModeBar: false };
function jdLayout(title, xtitle, ytitle, extra) {
  const base = {
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

let jdState = {
  T: 300,
  I0: 1e-12,
  Vmax: 0.7,
  Vmin: -0.5,
  lightCurrent: 0,
  n: 1.0,
  Eg: 1.12,
  phi_b: 0.8,
  material: 'Si'
};

var JD_MATERIALS = {
  'Si':   { Eg: 1.12, I0: 1e-12, phi_b: 0.8, label: 'Silicon (solar cell champion)' },
  'GaAs': { Eg: 1.42, I0: 1e-18, phi_b: 0.9, label: 'GaAs (high-efficiency solar)' },
  'Ge':   { Eg: 0.67, I0: 1e-9,  phi_b: 0.5, label: 'Germanium (low bandgap)' }
};

var METALS = {
  'Au': { phi_m: 5.1, chi: 4.0 },
  'Al': { phi_m: 4.3, chi: 4.0 },
  'Pt': { phi_m: 5.6, chi: 4.0 }
};

function plotDiodeIV() {
  var Vf = [], If = [], Vr = [], Ir = [], kT = kB_eV * jdState.T;
  for (var v = 0; v <= jdState.Vmax; v += 0.01) { Vf.push(v); If.push(idealDiodeI(v, jdState.T, jdState.I0, jdState.n)); }
  for (var v2 = 0; v2 >= jdState.Vmin; v2 -= 0.01) { Vr.push(v2); Ir.push(idealDiodeI(v2, jdState.T, jdState.I0, jdState.n)); }
  var Vsc = Vf.slice(); var Isc = Vsc.map(function(v){ return idealDiodeI(v, jdState.T, jdState.I0, jdState.n) - jdState.lightCurrent; });
  var P = Vsc.map(function(v, i){ return -v * Isc[i]; });
  var maxP = 0, maxV = 0;
  for (var i = 0; i < P.length; i++) { if (P[i] > maxP) { maxP = P[i]; maxV = Vsc[i]; } }

  _plotJD('plot-diode-iv', [
    { x: Vf, y: If, mode: 'lines', name: 'Dark I(V)', line: { color: '#00f0ff', width: 2 } },
    { x: Vr, y: Ir, mode: 'lines', name: 'Reverse I(V)', line: { color: '#ff4ecd', width: 2 } },
    { x: Vsc, y: Isc, mode: 'lines', name: 'Solar cell I(V)', line: { color: '#ffd54f', width: 2, dash: 'dash' } }
  ], jdLayout(null, 'Voltage V (V)', 'Current I (A)', {
    shapes: [ { type: 'line', x0: 0, x1: 0, y0: -1e-6, y1: 1e-6, line: { color: '#8080a0', width: 1, dash: 'dot' } } ],
    annotations: [
      { x: 0.3, y: idealDiodeI(0.3, jdState.T, jdState.I0, jdState.n), text: 'Forward bias', font: { color: '#00f0ff', size: 10 }, showarrow: true, arrowhead: 2, ax: 30, ay: -30 },
      { x: maxV, y: idealDiodeI(maxV, jdState.T, jdState.I0, jdState.n) - jdState.lightCurrent, text: 'MPP', font: { color: '#ffd54f', size: 9 }, showarrow: true, arrowhead: 2, ax: -20, ay: -20 }
    ]
  }), PLOT_CFG);
}

function plotPowerCurve() {
  var V = [], P = [];
  for (var v = 0; v <= jdState.Vmax; v += 0.01) {
    V.push(v);
    P.push(v * (jdState.lightCurrent - idealDiodeI(v, jdState.T, jdState.I0, jdState.n)));
  }
  _plotJD('plot-power', [
    { x: V, y: P, mode: 'lines', name: 'P(V) = V × I_light', line: { color: '#4ade80', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.06)' }
  ], jdLayout(null, 'Voltage V (V)', 'Power P (W)'), PLOT_CFG);
}

function plotBandDiagramJunction() {
  var x = [], Ec = [], Ev = [], Ef = [];
  for (var xi = -100; xi <= 100; xi += 2) {
    x.push(xi);
    var psi = 0.5 * (1 + Math.tanh(xi / 15));
    Ec.push(jdState.Eg + 0.3 * psi);
    Ev.push(0 + 0.3 * psi);
    Ef.push(jdState.Eg * 0.5 + 0.2 * (psi - 0.5));
  }
  _plotJD('plot-band-junction', [
    { x: x, y: Ec, mode: 'lines', name: 'Ec', line: { color: '#ff4ecd', width: 2 } },
    { x: x, y: Ev, mode: 'lines', name: 'Ev', line: { color: '#4ade80', width: 2 } },
    { x: x, y: Ef, mode: 'lines', name: 'EF', line: { color: '#ffd54f', width: 2, dash: 'dot' } }
  ], jdLayout(null, 'Position x (nm)', 'Energy (eV)'), PLOT_CFG);
}

function plotSchottkyIV() {
  var V = [], I = [];
  for (var v = -0.3; v <= 0.5; v += 0.01) {
    V.push(v);
    I.push(schottkyI(v, jdState.T, jdState.phi_b));
  }
  _plotJD('plot-schottky', [
    { x: V, y: I, mode: 'lines', name: 'Schottky J(V)', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' }
  ], jdLayout(null, 'V (V)', 'J (A/cm²)', {
    annotations: [{ x: 0.2, y: schottkyI(0.2, jdState.T, jdState.phi_b), text: 'φb = ' + jdState.phi_b.toFixed(2) + ' eV', font: { color: '#ffd54f', size: 10 }, showarrow: false }]
  }), PLOT_CFG);
}

function updateLiveJD() {
  var kT = kB_eV * jdState.T;
  var I0 = jdState.I0;
  var If = idealDiodeI(0.6, jdState.T, I0, jdState.n);
  var Voc = (jdState.lightCurrent > 0) ? (jdState.n * kT * Math.log(jdState.lightCurrent / I0 + 1)) : 0;
  var Pmax = 0, Vmpp = 0;
  for (var v = 0; v <= jdState.Vmax; v += 0.001) {
    var p = v * (jdState.lightCurrent - idealDiodeI(v, jdState.T, I0, jdState.n));
    if (p > Pmax) { Pmax = p; Vmpp = v; }
  }
  var efficiency = (Pmax / (jdState.lightCurrent * jdState.Eg)) * 100;

  var elIf = document.getElementById('live-If'); if (elIf) elIf.textContent = If.toExponential(2);
  var elVoc = document.getElementById('live-Voc'); if (elVoc) elVoc.textContent = Voc.toFixed(3);
  var elRev = document.getElementById('live-Irev'); if (elRev) elRev.textContent = idealDiodeI(-0.5, jdState.T, I0, jdState.n).toExponential(2);
  var elEff = document.getElementById('live-efficiency'); if (elEff) elEff.textContent = jdState.lightCurrent > 0 ? efficiency.toFixed(1) + '%' : '—';
  var elFF = document.getElementById('live-FF');
  if (elFF) {
    var ff = jdState.lightCurrent > 0 ? (Pmax / (Voc * jdState.lightCurrent)) : 0;
    elFF.textContent = jdState.lightCurrent > 0 ? (ff * 100).toFixed(1) + '%' : '—';
  }
}

function setJunctionMaterial(name) {
  var mat = JD_MATERIALS[name];
  if (!mat) return;
  jdState.Eg = mat.Eg;
  jdState.I0 = mat.I0;
  jdState.phi_b = mat.phi_b;
  jdState.material = name;
  var sEg = document.getElementById('slider-Eg-jd');
  var sI0 = document.getElementById('slider-I0');
  if (sEg) { sEg.value = mat.Eg; var el = document.getElementById('val-Eg-jd'); if (el) el.textContent = mat.Eg.toFixed(2); }
  if (sI0) { sI0.value = Math.log10(mat.I0); var el = document.getElementById('val-I0'); if (el) el.textContent = mat.I0.toExponential(1); }
  plotDiodeIV(); plotPowerCurve(); plotBandDiagramJunction(); plotSchottkyIV(); updateLiveJD();
}

function initJunction() {
  var sT = document.getElementById('slider-T-jd'); var sI0 = document.getElementById('slider-I0'); var sIsc = document.getElementById('slider-Isc');
  var sN = document.getElementById('slider-n-ideality'); var sPhi = document.getElementById('slider-phi'); var sEg = document.getElementById('slider-Eg-jd');
  if (sT) { sT.addEventListener('input', function() { jdState.T = parseFloat(this.value); var el = document.getElementById('val-T-jd'); if (el) el.textContent = jdState.T; plotDiodeIV(); plotPowerCurve(); plotBandDiagramJunction(); plotSchottkyIV(); updateLiveJD(); }); }
  if (sI0) { sI0.addEventListener('input', function() { var v = parseFloat(this.value); jdState.I0 = Math.pow(10, v); var el = document.getElementById('val-I0'); if (el) el.textContent = jdState.I0.toExponential(1); plotDiodeIV(); plotPowerCurve(); updateLiveJD(); }); }
  if (sIsc) { sIsc.addEventListener('input', function() { jdState.lightCurrent = parseFloat(this.value); var el = document.getElementById('val-Isc'); if (el) el.textContent = jdState.lightCurrent.toExponential(1); plotDiodeIV(); plotPowerCurve(); updateLiveJD(); }); }
  if (sN) { sN.addEventListener('input', function() { jdState.n = parseFloat(this.value); var el = document.getElementById('val-n-ideality'); if (el) el.textContent = jdState.n.toFixed(2); plotDiodeIV(); plotPowerCurve(); updateLiveJD(); }); }
  if (sPhi) { sPhi.addEventListener('input', function() { jdState.phi_b = parseFloat(this.value); var el = document.getElementById('val-phi'); if (el) el.textContent = jdState.phi_b.toFixed(2); plotSchottkyIV(); updateLiveJD(); }); }
  if (sEg) { sEg.addEventListener('input', function() { jdState.Eg = parseFloat(this.value); var el = document.getElementById('val-Eg-jd'); if (el) el.textContent = jdState.Eg.toFixed(2); plotBandDiagramJunction(); updateLiveJD(); }); }
  plotDiodeIV(); plotPowerCurve(); plotBandDiagramJunction(); plotSchottkyIV(); updateLiveJD();
}
initJunction();
window.initJunction = initJunction;
window.setJunctionMaterial = setJunctionMaterial;

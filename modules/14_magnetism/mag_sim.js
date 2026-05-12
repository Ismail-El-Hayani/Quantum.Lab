/**
 * Magnetism — Physics Engine (v3)
 * Susceptibility, Curie/Weiss law, ferromagnetism, hysteresis,
 * temperature-dependent M-T curve, material presets with Tc.
 */
'use strict';
function _plotMAG(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}
const PLOT_CFG = { responsive: true, displayModeBar: false };
function magLayout(title, xtitle, ytitle, extra) {
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

let magState = {
  T: 300,
  C: 1.0,
  theta: 0,
  Ms: 1.0,
  Hc: 0.05,
  Tc: 1043,
  material: 'Fe'
};

var MAG_MATERIALS = {
  'Fe':  { Tc: 1043, Ms: 1.7,  Hc: 0.05, label: 'Iron (Tc=1043 K)' },
  'Ni':  { Tc: 627,  Ms: 0.6,  Hc: 0.02, label: 'Nickel (Tc=627 K)' },
  'Co':  { Tc: 1388, Ms: 1.4,  Hc: 0.08, label: 'Cobalt (Tc=1388 K)' },
  'Gd':  { Tc: 293,  Ms: 2.1,  Hc: 0.01, label: 'Gadolinium (Tc=293 K)' },
  'Cu':  { Tc: 0,    Ms: 0,    Hc: 0,    label: 'Copper (paramagnetic)' }
};

function chiCurie(T, C) { return C / T; }
function chiCurieWeiss(T, C, theta) {
  if (theta > 0 && T > theta + 1) return C / (T - theta);
  return null;
}
function magnetization(T, Tc, Ms) {
  // Simplified Brillouin-like M(T)/Ms = (1 - T/Tc)^β, β≈1/3 for 3D Ising
  if (T >= Tc) return 0;
  return Ms * Math.pow(1 - Math.pow(T / Tc, 2), 0.35);
}

function plotSusceptibility() {
  var T = [], chiC = [], chiCW = [], chiDia = [];
  for (var t = 10; t <= 1200; t += 5) {
    T.push(t);
    chiC.push(chiCurie(t, magState.C));
    var cw = chiCurieWeiss(t, magState.C, magState.theta);
    chiCW.push(cw);
    chiDia.push(-0.001);
  }
  _plotMAG('plot-susceptibility', [
    { x: T, y: chiC, mode: 'lines', name: 'χ = C/T (Curie)', line: { color: '#00f0ff', width: 2 } },
    { x: T, y: chiCW, mode: 'lines', name: 'χ = C/(T-θ) (Weiss)', line: { color: '#ff4ecd', width: 2 } },
    { x: T, y: chiDia, mode: 'lines', name: 'Diamagnetism', line: { color: '#ffd54f', width: 1.5, dash: 'dot' } },
    { x: [magState.Tc, magState.Tc], y: [-0.01, 0.1], mode: 'lines', line: { color: '#facc15', width: 1, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' }
  ], magLayout(null, 'Temperature (K)', 'χ', {
    annotations: [{ x: magState.Tc + 20, y: 0.08, text: 'Tc = ' + magState.Tc + ' K', font: { color: '#ffd54f', size: 10 }, showarrow: false }]
  }), PLOT_CFG);
}

function plotMagnetizationCurve() {
  var T = [], M = [];
  for (var t = 0; t <= 1200; t += 5) {
    T.push(t);
    M.push(magnetization(t, magState.Tc, magState.Ms));
  }
  _plotMAG('plot-M-T', [
    { x: T, y: M, mode: 'lines', name: 'M(T)', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: [magState.Tc, magState.Tc], y: [0, magState.Ms], mode: 'lines', line: { color: '#facc15', width: 1.5, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' }
  ], magLayout(null, 'Temperature (K)', 'M / M_s', {
    annotations: [
      { x: magState.Tc + 30, y: magState.Ms * 0.5, text: 'Curie temp Tc', font: { color: '#ffd54f', size: 10 }, showarrow: false },
      { x: 200, y: magState.Ms * 0.9, text: 'Ferromagnetic', font: { color: '#4ade80', size: 9 }, showarrow: false },
      { x: magState.Tc + 100, y: 0.05, text: 'Paramagnetic', font: { color: '#ff4ecd', size: 9 }, showarrow: false }
    ]
  }), PLOT_CFG);
}

function plotHysteresis() {
  var H = [], M = [];
  var Ms = magState.Ms, Hc = magState.Hc;
  // Temperature-dependent Hc: vanishes near Tc
  var t_ratio = Math.min(magState.T / magState.Tc, 1);
  var Hc_eff = Hc * Math.pow(1 - t_ratio, 0.5);
  for (var h = -0.3; h <= 0.3; h += 0.005) {
    H.push(h);
    if (h > Hc_eff) M.push(Ms * Math.tanh((h - Hc_eff) / 0.01));
    else if (h < -Hc_eff) M.push(-Ms * Math.tanh((h + Hc_eff) / -0.01));
    else M.push(Ms * (h / Math.max(Hc_eff, 1e-6)));
  }
  _plotMAG('plot-hysteresis', [
    { x: H, y: M, mode: 'lines', name: 'M(H)', line: { color: '#4ade80', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.06)' }
  ], magLayout(null, 'H (arb.)', 'M (arb.)', {
    annotations: [
      { x: Hc_eff + 0.02, y: Ms * 0.5, text: 'Hc = ' + Hc_eff.toFixed(3), font: { color: '#ffd54f', size: 10 }, showarrow: false },
      { x: 0.15, y: Ms * 0.1, text: Hc_eff < 0.001 ? 'No hysteresis (T ≥ Tc)' : 'Hysteresis loop', font: { color: '#8080a0', size: 9 }, showarrow: false }
    ]
  }), PLOT_CFG);
}

function updateLiveMAG() {
  var el = document.getElementById('live-chi'); if (el) el.textContent = chiCurie(magState.T, magState.C).toFixed(4);
  var el2 = document.getElementById('live-Hc'); if (el2) el2.textContent = (magState.Hc * Math.pow(1 - Math.min(magState.T / magState.Tc, 1), 0.5)).toFixed(3);
  var elM = document.getElementById('live-M'); if (elM) elM.textContent = magnetization(magState.T, magState.Tc, magState.Ms).toFixed(3) + ' M_s';
  var elState = document.getElementById('live-mag-state');
  if (elState) {
    var isFM = magState.T < magState.Tc && magState.Ms > 0;
    elState.innerHTML = isFM ? '<span class="tc-badge">Ferromagnetic</span>' : '<span class="normal-badge">Paramagnetic</span>';
  }
}

function setMagMaterial(name) {
  var mat = MAG_MATERIALS[name];
  if (!mat) return;
  magState.Tc = mat.Tc;
  magState.Ms = mat.Ms;
  magState.Hc = mat.Hc;
  magState.material = name;
  var sTc = document.getElementById('slider-Tc');
  var sMs = document.getElementById('slider-Ms');
  if (sTc) { sTc.value = mat.Tc; var el = document.getElementById('val-Tc'); if (el) el.textContent = mat.Tc; }
  if (sMs) { sMs.value = mat.Ms; var el = document.getElementById('val-Ms'); if (el) el.textContent = mat.Ms.toFixed(2); }
  plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); updateLiveMAG();
}

function initMagnetism() {
  var sT = document.getElementById('slider-T-mag'); var sC = document.getElementById('slider-C'); var sTheta = document.getElementById('slider-theta'); var sMs = document.getElementById('slider-Ms'); var sTc = document.getElementById('slider-Tc');
  if (sT) { sT.addEventListener('input', function() { magState.T = parseFloat(this.value); var el = document.getElementById('val-T-mag'); if (el) el.textContent = magState.T; plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); updateLiveMAG(); }); }
  if (sC) { sC.addEventListener('input', function() { magState.C = parseFloat(this.value); var el = document.getElementById('val-C'); if (el) el.textContent = magState.C.toFixed(2); plotSusceptibility(); updateLiveMAG(); }); }
  if (sTheta) { sTheta.addEventListener('input', function() { magState.theta = parseFloat(this.value); var el = document.getElementById('val-theta'); if (el) el.textContent = magState.theta.toFixed(1); plotSusceptibility(); updateLiveMAG(); }); }
  if (sMs) { sMs.addEventListener('input', function() { magState.Ms = parseFloat(this.value); var el = document.getElementById('val-Ms'); if (el) el.textContent = magState.Ms.toFixed(2); plotMagnetizationCurve(); plotHysteresis(); updateLiveMAG(); }); }
  if (sTc) { sTc.addEventListener('input', function() { magState.Tc = parseFloat(this.value); var el = document.getElementById('val-Tc'); if (el) el.textContent = magState.Tc; plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); updateLiveMAG(); }); }
  plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); updateLiveMAG();
}
initMagnetism();
window.initMagnetism = initMagnetism;
window.setMagMaterial = setMagMaterial;

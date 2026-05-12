/**
 * Laser Physics — Physics Engine (v3)
 * Stimulated emission, population inversion, cavity modes, gain saturation,
 * threshold condition, material presets, telecom annotations.
 */
'use strict';

function _plotLP(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}
const PLOT_CFG = { responsive: true, displayModeBar: false };
function lpLayout(title, xtitle, ytitle, extra) {
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

let lpState = {
  Eg: 1.42,
  L: 500,
  n: 3.5,
  R: 0.3,
  alpha: 10,
  pumping: 1.5,
  material: 'GaAs'
};

var LP_MATERIALS = {
  'GaAs':     { Eg: 1.42, n: 3.5, label: 'GaAs (870 nm, telecom O-band)' },
  'InGaAsP':  { Eg: 0.80, n: 3.4, label: 'InGaAsP (1550 nm, telecom C-band)' },
  'GaN':      { Eg: 3.40, n: 2.4, label: 'GaN (405 nm, blue laser)' },
  'CO2':      { Eg: 0.117,n: 1.0, label: 'CO₂ (10.6 µm, gas laser)' },
  'HeNe':     { Eg: 1.96, n: 1.0, label: 'HeNe (633 nm, gas laser)' }
};

function laserWavelength(Eg_eV) { return 1240 / Eg_eV; }
function cavityModes(L_nm, n) {
  var modes = [], lam = [];
  for (var m = 1; m <= 10; m++) {
    var l = 2 * n * L_nm / m;
    modes.push(m); lam.push(l);
  }
  return { modes: modes, lam: lam };
}
function gainPeak(Eg, sigma) {
  return 0.5 / (sigma * Math.sqrt(2 * Math.PI)); // peak value of Gaussian
}
function thresholdGain(alpha, R, L) {
  return alpha + (1 / (2 * L)) * Math.log(1 / (R * R));
}

function plotCavity() {
  var data = cavityModes(lpState.L, lpState.n);
  var lam_target = laserWavelength(lpState.Eg);
  var thr = thresholdGain(lpState.alpha, lpState.R, lpState.L);
  _plotLP('plot-cavity', [
    { x: data.modes, y: data.lam, mode: 'markers+lines', name: 'Cavity modes λm',
      marker: { color: '#00f0ff', size: 10 }, line: { color: '#00f0ff', width: 2 }
    },
    { x: [0.5, 10.5], y: [lam_target, lam_target], mode: 'lines',
      line: { color: '#ff4ecd', width: 2, dash: 'dash' }, name: 'Gain peak λ = ' + lam_target.toFixed(0) + ' nm' },
    { x: [0.5, 10.5], y: [1240, 1240], mode: 'lines',
      line: { color: '#ffd54f', width: 1, dash: 'dot' }, showlegend: false, hoverinfo: 'skip' }
  ], lpLayout(null, 'Mode index m', 'Wavelength λ (nm)', {
    annotations: [
      { x: 1, y: lam_target + 20, text: 'Gain peak', font: { color: '#ff4ecd', size: 10 }, showarrow: false },
      { x: 1, y: 1270, text: 'Telecom C-band ~1550 nm', font: { color: '#ffd54f', size: 9 }, showarrow: false }
    ]
  }), PLOT_CFG);
}

function plotGainSpectrum() {
  var E = [], g = [], g_sat = [];
  var Eg = lpState.Eg, sigma = 0.05;
  var g0 = lpState.pumping * gainPeak(Eg, sigma);
  var I_sat = 1.0;
  for (var e = Eg - 0.5; e <= Eg + 0.5; e += 0.01) {
    E.push(e);
    var gauss = Math.exp(-Math.pow(e - Eg, 2) / (2 * sigma * sigma));
    g.push(Math.max(0, (e >= Eg - 0.3) ? g0 * gauss : 0));
    // Gain saturation: g = g0 / (1 + I / I_sat)
    g_sat.push(g[g.length - 1] / (1 + 0.5));
  }
  _plotLP('plot-gain', [
    { x: E, y: g, mode: 'lines', name: 'Gain g(E) unsaturated', line: { color: '#4ade80', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.06)' },
    { x: E, y: g_sat, mode: 'lines', name: 'Gain saturated (I=0.5Isat)', line: { color: '#ffd54f', width: 2, dash: 'dash' } },
    { x: [Eg, Eg], y: [0, g0], mode: 'lines', line: { color: '#ff4ecd', width: 1, dash: 'dot' }, showlegend: false, hoverinfo: 'skip' }
  ], lpLayout(null, 'E (eV)', 'Gain g(E) (arb.)', {
    annotations: [{ x: Eg + 0.05, y: g0 * 0.95, text: 'Eg = ' + Eg.toFixed(2) + ' eV', font: { color: '#ff4ecd', size: 10 }, showarrow: false }]
  }), PLOT_CFG);
}

function plotThreshold() {
  var L_range = [], g_thr = [], g_avail = [];
  for (var L = 100; L <= 2000; L += 50) {
    L_range.push(L);
    g_thr.push(thresholdGain(lpState.alpha, lpState.R, L));
    g_avail.push(lpState.pumping * gainPeak(lpState.Eg, 0.05));
  }
  _plotLP('plot-threshold', [
    { x: L_range, y: g_thr, mode: 'lines', name: 'Threshold g_th = α + (1/2L)ln(1/R²)', line: { color: '#ff4ecd', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(255,78,205,0.06)' },
    { x: L_range, y: g_avail, mode: 'lines', name: 'Available gain', line: { color: '#00f0ff', width: 2, dash: 'dash' } }
  ], lpLayout(null, 'Cavity length L (nm)', 'Gain (cm⁻¹)'), PLOT_CFG);
}

function plotPopulationInversion() {
  var pump = [], N2_N1 = [], n_ratio = [];
  for (var p = 0.1; p <= 5; p += 0.1) {
    pump.push(p);
    // Two-level: N2/N1 = pumping_rate / decay_rate
    N2_N1.push(p);
    // Inversion condition: N2 > N1
    n_ratio.push(1.0);
  }
  _plotLP('plot-inversion', [
    { x: pump, y: N2_N1, mode: 'lines', name: 'N₂/N₁', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: pump, y: n_ratio, mode: 'lines', name: 'Inversion threshold', line: { color: '#ff4ecd', width: 2, dash: 'dash' } }
  ], lpLayout(null, 'Pump rate (arb.)', 'Population ratio'), PLOT_CFG);
}

function updateLiveLP() {
  var lam = laserWavelength(lpState.Eg);
  var el = document.getElementById('live-lam'); if (el) el.textContent = lam.toFixed(0);
  var el2 = document.getElementById('live-mode'); if (el2) {
    var data = cavityModes(lpState.L, lpState.n);
    var closestIdx = 0, closestDiff = Infinity;
    for (var i = 0; i < data.lam.length; i++) {
      var diff = Math.abs(data.lam[i] - lam);
      if (diff < closestDiff) { closestDiff = diff; closestIdx = i; }
    }
    el2.textContent = data.lam[closestIdx].toFixed(0) + ' nm (m=' + data.modes[closestIdx] + ')';
  }
  var elThr = document.getElementById('live-threshold');
  if (elThr) elThr.textContent = thresholdGain(lpState.alpha, lpState.R, lpState.L).toFixed(1) + ' cm⁻¹';
  var elLasing = document.getElementById('live-lasing');
  if (elLasing) {
    var g0 = lpState.pumping * gainPeak(lpState.Eg, 0.05);
    var gth = thresholdGain(lpState.alpha, lpState.R, lpState.L);
    elLasing.innerHTML = (g0 > gth) ? '<span class="tc-badge">Lasing ✅</span>' : '<span class="normal-badge">Below threshold</span>';
  }
}

function setLaserMaterial(name) {
  var mat = LP_MATERIALS[name];
  if (!mat) return;
  lpState.Eg = mat.Eg;
  lpState.n = mat.n;
  lpState.material = name;
  var sEg = document.getElementById('slider-Eg');
  var sN = document.getElementById('slider-n-lp');
  if (sEg) { sEg.value = mat.Eg; var el = document.getElementById('val-Eg'); if (el) el.textContent = mat.Eg.toFixed(2); }
  if (sN) { sN.value = mat.n; var el = document.getElementById('val-n-lp'); if (el) el.textContent = mat.n.toFixed(2); }
  plotCavity(); plotGainSpectrum(); plotThreshold(); updateLiveLP();
}

function initLaser() {
  var sEg = document.getElementById('slider-Eg'); var sL = document.getElementById('slider-L'); var sN = document.getElementById('slider-n-lp');
  var sR = document.getElementById('slider-R'); var sAlpha = document.getElementById('slider-alpha'); var sPump = document.getElementById('slider-pumping');
  if (sEg) { sEg.addEventListener('input', function() { lpState.Eg = parseFloat(this.value); var el = document.getElementById('val-Eg'); if (el) el.textContent = lpState.Eg.toFixed(2); plotCavity(); plotGainSpectrum(); plotThreshold(); updateLiveLP(); }); }
  if (sL) { sL.addEventListener('input', function() { lpState.L = parseFloat(this.value); var el = document.getElementById('val-L'); if (el) el.textContent = lpState.L; plotCavity(); plotThreshold(); updateLiveLP(); }); }
  if (sN) { sN.addEventListener('input', function() { lpState.n = parseFloat(this.value); var el = document.getElementById('val-n-lp'); if (el) el.textContent = lpState.n.toFixed(2); plotCavity(); updateLiveLP(); }); }
  if (sR) { sR.addEventListener('input', function() { lpState.R = parseFloat(this.value); var el = document.getElementById('val-R'); if (el) el.textContent = lpState.R.toFixed(2); plotThreshold(); updateLiveLP(); }); }
  if (sAlpha) { sAlpha.addEventListener('input', function() { lpState.alpha = parseFloat(this.value); var el = document.getElementById('val-alpha'); if (el) el.textContent = lpState.alpha.toFixed(1); plotThreshold(); updateLiveLP(); }); }
  if (sPump) { sPump.addEventListener('input', function() { lpState.pumping = parseFloat(this.value); var el = document.getElementById('val-pumping'); if (el) el.textContent = lpState.pumping.toFixed(1); plotGainSpectrum(); plotThreshold(); plotPopulationInversion(); updateLiveLP(); }); }
  plotCavity(); plotGainSpectrum(); plotThreshold(); plotPopulationInversion(); updateLiveLP();
}
initLaser();
window.initLaser = initLaser;
window.setLaserMaterial = setLaserMaterial;

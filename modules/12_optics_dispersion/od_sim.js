/**
 * Optics & Dispersion — Physics Engine (v2)
 * Complex refractive index, reflectivity, Drude & Lorentz models.
 * Units: ω in eV, γ in eV.
 */
'use strict';

function _plotOD(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}

function odLayout(title, xtitle, ytitle, extra) {
  return Object.assign({
    margin: { t: 25, r: 10, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    hovermode: 'x unified'
  }, extra || {});
}

var PLOT_CFG = { responsive: true, displayModeBar: false };

var odState = {
  wp: 2.0, gamma: 0.1,
  material: 'Si'
};

var OD_MATERIALS = {
  'Si':  { wp: 16.6, gamma: 0.05,  label: 'Silicon (semiconductor)' },
  'Au':  { wp: 9.0,  gamma: 0.067, label: 'Gold (metal)' },
  'Ag':  { wp: 9.6,  gamma: 0.022, label: 'Silver (metal)' },
  'Cu':  { wp: 10.8, gamma: 0.03,  label: 'Copper (metal)' },
  'Al':  { wp: 15.3, gamma: 0.08,  label: 'Aluminum (metal)' },
  'GaAs':{ wp: 15.6, gamma: 0.04,  label: 'GaAs (semiconductor)' }
};

function drudeEpsilon(w, wp, gamma) {
  return 1 - (wp * wp) / (w * w + gamma * gamma) - 1j * (wp * wp * gamma) / (w * (w * w + gamma * gamma));
}

function reflectivityN(n, kappa) {
  return ((n - 1) * (n - 1) + kappa * kappa) / ((n + 1) * (n + 1) + kappa * kappa);
}

function epsToNK(e1, e2) {
  var n = Math.sqrt((Math.sqrt(e1 * e1 + e2 * e2) + e1) / 2);
  var k = Math.sqrt((Math.sqrt(e1 * e1 + e2 * e2) - e1) / 2);
  return { n: n, k: k };
}

function plotDrude() {
  var wp = odState.wp, gamma = odState.gamma;
  var w = [], eps1r = [], eps2r = [], n_r = [], k_r = [], R = [], absorptance = [];
  for (var wi = 0.1; wi <= 25.0; wi += 0.05) {
    w.push(wi);
    var e1 = 1 - (wp * wp) / (wi * wi + gamma * gamma);
    var e2 = (wp * wp * gamma) / (wi * (wi * wi + gamma * gamma));
    eps1r.push(e1); eps2r.push(e2);
    var nk = epsToNK(e1, e2);
    n_r.push(nk.n); k_r.push(nk.k);
    R.push(reflectivityN(nk.n, nk.k));
    var alpha = 2 * wi * nk.k / 0.197; // µm⁻¹ (ħc ≈ 197 eV·nm)
    absorptance.push(1 - reflectivityN(nk.n, nk.k) - Math.exp(-alpha * 0.001)); // thin film approx
  }
  _plotOD('plot-drude', [
    { x: w, y: eps1r, mode: 'lines', name: 'ε₁', line: { color: '#00f0ff', width: 2 } },
    { x: w, y: eps2r, mode: 'lines', name: 'ε₂', line: { color: '#ff4ecd', width: 2 } },
    { x: [wp, wp], y: [-30, 10], mode: 'lines', line: { color: '#ffd54f', width: 1, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' }
  ], odLayout(null, 'ħω (eV)', 'ε', {
    annotations: [{ x: wp + 0.3, y: 5, text: 'ωp = ' + wp.toFixed(1) + ' eV', font: { color: '#ffd54f', size: 10 }, showarrow: false }]
  }), PLOT_CFG);

  _plotOD('plot-reflectivity', [
    { x: w, y: R, mode: 'lines', name: 'Reflectivity R', line: { color: '#ffd54f', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(255,213,79,0.06)' },
    { x: [wp, wp], y: [0, 1], mode: 'lines', line: { color: '#facc15', width: 1, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' }
  ], odLayout(null, 'ħω (eV)', 'R', {
    yaxis: { range: [0, 1] },
    annotations: [{ x: wp + 0.5, y: 0.5, text: 'Plasma edge: ω < ωp → reflective', font: { color: '#ffd54f', size: 10 }, showarrow: false }]
  }), PLOT_CFG);
}

function updateLiveOD() {
  var el = document.getElementById('live-n'); if (el) el.textContent = odState.n ? odState.n.toFixed(3) : '—';
  var el2 = document.getElementById('live-k'); if (el2) el2.textContent = odState.kappa ? odState.kappa.toFixed(4) : '—';
}

function setODMaterial(name) {
  var mat = OD_MATERIALS[name];
  if (!mat) return;
  odState.wp = mat.wp;
  odState.gamma = mat.gamma;
  odState.material = name;
  var sWp = document.getElementById('slider-wp');
  var sG = document.getElementById('slider-gamma');
  if (sWp) { sWp.value = mat.wp; var el = document.getElementById('val-wp'); if (el) el.textContent = mat.wp.toFixed(1); }
  if (sG) { sG.value = mat.gamma; var el = document.getElementById('val-gamma'); if (el) el.textContent = mat.gamma.toFixed(3); }
  plotDrude(); updateLiveOD();
}

function initOptics() {
  var sWp = document.getElementById('slider-wp'); var sGamma = document.getElementById('slider-gamma'); var sN = document.getElementById('slider-n-od'); var sK = document.getElementById('slider-kappa-od');
  if (sWp) { sWp.addEventListener('input', function() { odState.wp = parseFloat(this.value); var el = document.getElementById('val-wp'); if (el) el.textContent = odState.wp.toFixed(2); plotDrude(); updateLiveOD(); }); }
  if (sGamma) { sGamma.addEventListener('input', function() { odState.gamma = parseFloat(this.value); var el = document.getElementById('val-gamma'); if (el) el.textContent = odState.gamma.toFixed(3); plotDrude(); updateLiveOD(); }); }
  if (sN) { sN.addEventListener('input', function() { odState.n = parseFloat(this.value); var el = document.getElementById('val-n-od'); if (el) el.textContent = odState.n.toFixed(2); updateLiveOD(); }); }
  if (sK) { sK.addEventListener('input', function() { odState.kappa = parseFloat(this.value); var el = document.getElementById('val-kappa-od'); if (el) el.textContent = odState.kappa.toFixed(4); updateLiveOD(); }); }
  plotDrude(); updateLiveOD();
}

initOptics();
window.initOptics = initOptics;
window.setODMaterial = setODMaterial;

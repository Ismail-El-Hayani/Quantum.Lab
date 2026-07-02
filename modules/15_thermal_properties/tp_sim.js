/**
 * Thermal Properties — Physics Engine (v2)
 * Heat capacity (Debye, Einstein), thermal conductivity, thermal expansion.
 * Units: T in K, Cv in J/mol·K, kappa in W/m·K.
 */
'use strict';

var kB_J = 1.381e-23;
var R_gas = 8.314;
var h = 6.626e-34;


function tpLayout(title, xtitle, ytitle, extra) {
  return Object.assign({
    margin: { t: title ? 40 : 25, r: 10, b: 55, l: 65 },
    title: title ? { text: title, font: { size: 13, color: '#e0e0ff' } } : undefined,
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    hovermode: 'x unified'
  }, extra || {});
}

var PLOT_CFG = { responsive: true, displayModeBar: false };

var tpState = {
  T: 300, thetaD: 400, gammaEl: 0.002,
  type: 'insulator',
  material: 'Quartz'
};

var _tpPlotDirty = { cv: true, kappa: true };
var _tpPlotBuilt = { cv: false, kappa: false };

function getActiveTPSubTab() {
  var active = document.querySelector('#tab-simulation .subtab-content.active');
  return active ? active.id.replace('subtab-', '') : 'cv';
}

function updateVisibleTPPlot(tab) {
  if (!tab) tab = getActiveTPSubTab();
  if (tab === 'cv') {
    if (_tpPlotDirty.cv || !_tpPlotBuilt.cv) {
      if (typeof plotCv === 'function') plotCv();
    } else if (window.Plotly) {
      var el = document.getElementById('plot-cv');
      if (el) Plotly.Plots.resize(el);
    }
    _tpPlotDirty.kappa = true;
  } else if (tab === 'kappa') {
    if (_tpPlotDirty.kappa || !_tpPlotBuilt.kappa) {
      if (typeof plotThermalConductivity === 'function') plotThermalConductivity();
    } else if (window.Plotly) {
      var el = document.getElementById('plot-kappa');
      if (el) Plotly.Plots.resize(el);
    }
    _tpPlotDirty.cv = true;
  }
  updateLiveTP();
}

function markTPPlotsDirty() {
  _tpPlotDirty.cv = true;
  _tpPlotDirty.kappa = true;
}

window.getActiveTPSubTab = getActiveTPSubTab;
window.updateVisibleTPPlot = updateVisibleTPPlot;
window.markTPPlotsDirty = markTPPlotsDirty;

var TP_MATERIALS = {
  'Quartz': { thetaD: 570, gammaEl: 0.0001, type: 'insulator', label: 'Quartz (insulator)' },
  'Cu':    { thetaD: 315, gammaEl: 0.007,  type: 'metal',    label: 'Copper (metal)' },
  'Al':    { thetaD: 394, gammaEl: 0.001,  type: 'metal',    label: 'Aluminum (metal)' },
  'Diamond':{ thetaD: 2220, gammaEl: 0.0001, type: 'insulator', label: 'Diamond (insulator)' },
  'Si':    { thetaD: 640, gammaEl: 0.0005, type: 'insulator', label: 'Silicon (semiconductor)' }
};

function debyeCv(T, thetaD) {
  var x = thetaD / T;
  if (x > 10) return (12 * Math.PI * Math.PI * Math.PI * Math.PI / 5) * R_gas * Math.pow(T / thetaD, 3);
  if (x < 0.5) return 3 * R_gas;
  return 3 * R_gas * (1 - 0.05 * x);
}

function einsteinCv(T, thetaE) {
  var x = thetaE / T;
  return 3 * R_gas * Math.pow(x / (Math.exp(x) - 1), 2) * Math.exp(x);
}

function electronicCv(T, gamma) { return gamma * T; }

function totalCv(T, thetaD, gamma, type) {
  return debyeCv(T, thetaD) + (type === 'metal' ? electronicCv(T, gamma) : 0);
}

function wiedemannFranz(L0, sigma, T) { return L0 * sigma * T; }

function plotCv() {
  var T = [], cvTotal = [], cvLattice = [], cvElectronic = [], cvDulong = [];
  for (var t = 5; t <= 800; t += 5) {
    T.push(t);
    cvLattice.push(debyeCv(t, tpState.thetaD));
    cvTotal.push(totalCv(t, tpState.thetaD, tpState.gammaEl, tpState.type));
    cvElectronic.push(tpState.type === 'metal' ? electronicCv(t, tpState.gammaEl) : 0);
    cvDulong.push(3 * R_gas);
  }
  _plot('plot-cv', [
    { x: T, y: cvTotal, mode: 'lines', name: 'Cv total', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: T, y: cvLattice, mode: 'lines', name: 'Lattice (Debye)', line: { color: '#ff4ecd', width: 2 } },
    { x: T, y: cvElectronic, mode: 'lines', name: 'Electronic (γT)', line: { color: '#ffd54f', width: 2 } },
    { x: T, y: cvDulong, mode: 'lines', name: '3R (Dulong-Petit)', line: { color: '#4ade80', width: 1.5, dash: 'dash' } },
    { x: [tpState.T, tpState.T], y: [0, Math.max.apply(null, cvTotal)], mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' }, showlegend: false, hoverinfo: 'skip' }
  ], tpLayout('Heat Capacity Cv(T)', 'Temperature (K)', 'Cv (J/mol·K)', {
    annotations: [
      { x: tpState.thetaD, y: 3 * R_gas * 0.95, text: 'θD = ' + tpState.thetaD + ' K', font: { color: '#ffd54f', size: 10 }, showarrow: false }
    ]
  }), PLOT_CFG);
  _tpPlotBuilt.cv = true;
  _tpPlotDirty.cv = false;
}

function plotThermalConductivity() {
  var T = [], kappaPh = [], kappaEl = [];
  for (var t = 10; t <= 500; t += 5) {
    T.push(t);
    kappaPh.push(50 / Math.max(1, Math.pow(t / 300, 1.2)));
    var sigma = (tpState.type === 'metal') ? 1e7 : 0;
    kappaEl.push(tpState.type === 'metal' ? 2.44e-8 * sigma * t : 0);
  }
  _plot('plot-kappa', [
    { x: T, y: kappaPh, mode: 'lines', name: 'κphonon', line: { color: '#00f0ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.04)' },
    { x: T, y: kappaEl, mode: 'lines', name: 'κelectron (WF)', line: { color: '#ffd54f', width: 2 } }
  ], tpLayout('Thermal Conductivity κ(T)', 'Temperature (K)', 'κ (W/m·K)'), PLOT_CFG);
  _tpPlotBuilt.kappa = true;
  _tpPlotDirty.kappa = false;
}

function updateLiveTP() {
  var cv = totalCv(tpState.T, tpState.thetaD, tpState.gammaEl, tpState.type);
  var lat = debyeCv(tpState.T, tpState.thetaD);
  var el = tpState.type === 'metal' ? electronicCv(tpState.T, tpState.gammaEl) : 0;
  var elCv = document.getElementById('live-Cv'); if (elCv) elCv.textContent = cv.toFixed(2);
  var elLat = document.getElementById('live-Cv-lat'); if (elLat) elLat.textContent = lat.toFixed(2);
  var elEl = document.getElementById('live-Cv-el'); if (elEl) elEl.textContent = el.toFixed(3);
  var elKappa = document.getElementById('live-kappa');
  if (elKappa) {
    var sigma = (tpState.type === 'metal') ? 1e7 : 0;
    var kwf = (tpState.type === 'metal') ? 2.44e-8 * sigma * tpState.T : (50 / Math.max(1, Math.pow(tpState.T / 300, 1.2)));
    elKappa.textContent = kwf.toFixed(2);
  }
}

function setTPMaterial(name) {
  var mat = TP_MATERIALS[name];
  if (!mat) return;
  tpState.thetaD = mat.thetaD;
  tpState.gammaEl = mat.gammaEl;
  tpState.type = mat.type;
  tpState.material = name;
  var sD = document.getElementById('slider-thetaD');
  var sG = document.getElementById('slider-gamma');
  var sel = document.getElementById('select-type-tp');
  if (sD) { sD.value = mat.thetaD; var el = document.getElementById('val-thetaD'); if (el) el.textContent = mat.thetaD; }
  if (sG) { sG.value = mat.gammaEl; var el = document.getElementById('val-gamma'); if (el) el.textContent = mat.gammaEl.toFixed(4); }
  if (sel) sel.value = mat.type;
  markTPPlotsDirty();
  updateVisibleTPPlot();
}

function resizeTPCanvas() {
  var c = document.getElementById('tp-lattice');
  var d = document.getElementById('debye-sphere');
  if (c && c.parentElement) {
    var w = Math.max(1, c.parentElement.clientWidth);
    var h = Math.max(1, c.parentElement.clientHeight || 220);
    c.width = w; c.height = h;
    TP_CANVAS.width = w; TP_CANVAS.height = h;
    resetLattice();
  }
  if (d && d.parentElement) {
    d.width = Math.max(1, d.parentElement.clientWidth);
    d.height = Math.max(1, d.parentElement.clientHeight || 140);
  }
}
window.resizeTPCanvas = resizeTPCanvas;

function initThermal() {
  var sT = document.getElementById('slider-T-tp');
  var sTheta = document.getElementById('slider-thetaD');
  var sGamma = document.getElementById('slider-gamma');
  var selType = document.getElementById('select-type-tp');

  if (sT) { sT.addEventListener('input', function() { tpState.T = parseFloat(this.value); var el = document.getElementById('val-T-tp'); if (el) el.textContent = tpState.T; setTPCanvasBath(tpState.T); markTPPlotsDirty(); updateVisibleTPPlot(); }); }
  if (sTheta) { sTheta.addEventListener('input', function() { tpState.thetaD = parseFloat(this.value); var el = document.getElementById('val-thetaD'); if (el) el.textContent = tpState.thetaD; markTPPlotsDirty(); updateVisibleTPPlot(); }); }
  if (sGamma) { sGamma.addEventListener('input', function() { tpState.gammaEl = parseFloat(this.value); var el = document.getElementById('val-gamma'); if (el) el.textContent = tpState.gammaEl; markTPPlotsDirty(); updateVisibleTPPlot(); }); }
  if (selType) { selType.addEventListener('change', function() {
    tpState.type = this.value;
    markTPPlotsDirty();
    updateVisibleTPPlot();
    if (typeof setTPCanvasMaterial === 'function') {
      setTPCanvasMaterial(this.value === 'metal' ? 'Cu' : 'Quartz');
    }
  }); }
  markTPPlotsDirty();
}

window.initThermal = initThermal;
window.setTPMaterial = setTPMaterial;
window.plotCv = plotCv;
window.plotThermalConductivity = plotThermalConductivity;
window.updateLiveTP = updateLiveTP;

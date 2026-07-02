/**
 * Doped Semiconductors — Physics Engine (v2)
 * Full charge neutrality, Fermi-level shift, conductivity, band-diagram renderer.
 * Units: T in K, E in eV, concentrations in cm^-3.
 */
'use strict';

const kB_eV = 8.617333262e-5;
const q = 1.602e-19;

const MATS = {
  'Si':   { Eg: 1.12, Nc300: 2.86e19, Nv300: 1.04e19, mu_n: 1400, mu_p: 450 },
  'Ge':   { Eg: 0.67, Nc300: 1.04e19, Nv300: 6.0e18,  mu_n: 3900, mu_p: 1900 },
  'GaAs': { Eg: 1.42, Nc300: 4.7e17,  Nv300: 7.0e18,  mu_n: 8500, mu_p: 400 }
};

function getMat(key) {
  if (key === '1.12') return MATS['Si'];
  if (key === '0.67') return MATS['Ge'];
  if (key === '1.42') return MATS['GaAs'];
  return MATS['Si'];
}

function matName(key) {
  if (key === '1.12') return 'Si';
  if (key === '0.67') return 'Ge';
  if (key === '1.42') return 'GaAs';
  return 'Si';
}

function Nc(T, mat) { return mat.Nc300 * Math.pow(T / 300, 1.5); }
function Nv(T, mat) { return mat.Nv300 * Math.pow(T / 300, 1.5); }
function ni(T, mat) {
  return Math.sqrt(Nc(T, mat) * Nv(T, mat)) * Math.exp(-mat.Eg / (2 * kB_eV * T));
}

/* Charge neutrality: n + Na = p + Nd  (assuming full ionization) */
function solveCarriers(T, Nd, Na, mat) {
  var ni_t = ni(T, mat);
  var net = Nd - Na;
  var n, p;
  if (net >= 0) {
    n = net / 2 + Math.sqrt(Math.pow(net / 2, 2) + ni_t * ni_t);
    p = ni_t * ni_t / n;
  } else {
    p = -net / 2 + Math.sqrt(Math.pow(net / 2, 2) + ni_t * ni_t);
    n = ni_t * ni_t / p;
  }
  return { n: n, p: p, ni: ni_t };
}

/* Fermi level relative to valence band edge Ev=0 */
function fermiIntrinsic(T, mat) {
  return mat.Eg / 2 + (3 * kB_eV * T / 4) * Math.log(Nv(T, mat) / Nc(T, mat));
}
function fermiLevel(T, n, p, ni_t, mat) {
  var Ei = fermiIntrinsic(T, mat);
  if (n > p) return Ei + kB_eV * T * Math.log(n / ni_t);
  if (p > n) return Ei - kB_eV * T * Math.log(p / ni_t);
  return Ei;
}

function conductivity(T, n, p, mat) {
  var muf = Math.pow(300 / T, 1.5);
  return q * (n * mat.mu_n * muf + p * mat.mu_p * muf);
}

/* ---- Plotting helpers ---- */
const PLOT_CFG = { responsive: true, displayModeBar: false };
function dsLayout(title, xtitle, ytitle, extra) {
  const base = {
    margin: { t: 40, r: 10, b: 55, l: 65 },
    title: title ? { text: title, font: { size: 13, color: '#e0e0ff' } } : undefined,
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a', type: ytitle && ytitle.indexOf('log') !== -1 ? 'log' : 'linear' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    hovermode: 'x unified'
  };
  return Object.assign(base, extra || {});
}

let dsState = {
  T: 300,
  matKey: '1.12',
  Nd: 1e15,
  Na: 1e13
};

function getMatFromState() { return getMat(dsState.matKey); }

function plotFermiShift() {
  var mat = getMatFromState();
  var T = [], Ef = [], Ec = [], Ev = [], Ef0 = [];
  for (var t = 50; t <= 700; t += 10) {
    T.push(t);
    var c = solveCarriers(t, dsState.Nd, dsState.Na, mat);
    var ef = fermiLevel(t, c.n, c.p, c.ni, mat);
    Ef.push(ef);
    Ef0.push(fermiIntrinsic(t, mat));
    Ec.push(mat.Eg);
    Ev.push(0);
  }
  _plot('plot-fermi-shift', [
    { x: T, y: Ec, mode: 'lines', name: 'Ec', line: { color: '#ff4ecd', width: 2, dash: 'dash' } },
    { x: T, y: Ev, mode: 'lines', name: 'Ev', line: { color: '#4ade80', width: 2, dash: 'dash' } },
    { x: T, y: Ef, mode: 'lines', name: 'EF (doped)', line: { color: '#00f0ff', width: 2.5 }, fill: 'tonexty', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: T, y: Ef0, mode: 'lines', name: 'EF (intrinsic)', line: { color: '#ffd54f', width: 1.5, dash: 'dot' } }
  ], dsLayout('Fermi Level Shift vs Temperature', 'Temperature (K)', 'Energy above Ev (eV)'), PLOT_CFG);
}

function plotCarrierTemp() {
  var mat = getMatFromState();
  var T = [], n = [], p = [], ni_arr = [];
  for (var t = 50; t <= 700; t += 10) {
    T.push(t);
    var c = solveCarriers(t, dsState.Nd, dsState.Na, mat);
    n.push(c.n);
    p.push(c.p);
    ni_arr.push(c.ni);
  }
  _plot('plot-carrier-temp', [
    { x: T, y: n, mode: 'lines', name: 'n (electrons)', line: { color: '#00f0ff', width: 2 } },
    { x: T, y: p, mode: 'lines', name: 'p (holes)', line: { color: '#ff4ecd', width: 2 } },
    { x: T, y: ni_arr, mode: 'lines', name: 'ni', line: { color: '#ffd54f', width: 1.5, dash: 'dot' } }
  ], dsLayout('Carrier Density vs Temperature', 'Temperature (K)', 'Carrier density (cm⁻³)', { yaxis: { type: 'log', title: 'Carrier density (cm⁻³)' } }), PLOT_CFG);
}

function plotConductivityDoped() {
  var mat = getMatFromState();
  var T = [], sigma = [];
  for (var t = 50; t <= 700; t += 10) {
    T.push(t);
    var c = solveCarriers(t, dsState.Nd, dsState.Na, mat);
    sigma.push(conductivity(t, c.n, c.p, mat));
  }
  _plot('plot-conductivity-doped', [
    { x: T, y: sigma, mode: 'lines', name: '\u03c3(T)', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' }
  ], dsLayout('Doped Conductivity vs Temperature', 'Temperature (K)', 'Conductivity (S/cm)'), PLOT_CFG);
}

/* ---- Animated band diagram on canvas ---- */
var __DS_bandActive = false;
function drawBandDiagram() {
  var canvas = document.getElementById('band-canvas-ds');
  if (!canvas) return;
  // Pause when Simulation tab or the Band sub-tab is hidden
  var pg = document.getElementById('tab-simulation');
  var sub = document.getElementById('sub-band');
  if (!pg || pg.style.display === 'none' || !sub || sub.style.display === 'none') {
    __DS_bandActive = false;
    requestAnimationFrame(drawBandDiagram);
    return;
  }
  __DS_bandActive = true;
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  var mat = getMatFromState();
  var c = solveCarriers(dsState.T, dsState.Nd, dsState.Na, mat);
  var ef = fermiLevel(dsState.T, c.n, c.p, c.ni, mat);
  var Eg = mat.Eg;

  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, w, h);

  // Title + axis labels
  ctx.fillStyle = '#e0e0ff';
  ctx.font = 'bold 13px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Band Diagram — ' + mat.name + '  (T = ' + dsState.T + ' K)', w / 2, 18);
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.fillStyle = '#8080a0';
  ctx.save();
  ctx.translate(14, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Energy (eV)', 0, 0);
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.fillText('Position →', w / 2, h - 6);
  ctx.textAlign = 'left';

  // Bands
  var pad = 40;
  var bandH = (h - 2 * pad) * 0.35;
  var yEv = h - pad - bandH;
  var yEc = pad;

  // Valence band
  ctx.fillStyle = 'rgba(192,132,252,0.10)';
  ctx.fillRect(pad, yEv, w - 2 * pad, bandH);
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2;
  ctx.strokeRect(pad, yEv, w - 2 * pad, bandH);
  ctx.fillStyle = '#c084fc';
  ctx.font = '12px JetBrains Mono';
  ctx.fillText('Ev', pad - 30, yEv + bandH / 2 + 4);

  // Conduction band
  ctx.fillStyle = 'rgba(0,240,255,0.08)';
  ctx.fillRect(pad, yEc, w - 2 * pad, bandH);
  ctx.strokeStyle = '#00f0ff';
  ctx.strokeRect(pad, yEc, w - 2 * pad, bandH);
  ctx.fillStyle = '#00f0ff';
  ctx.fillText('Ec', pad - 30, yEc + bandH / 2 + 4);

  // Impurity levels
  var yDonor = yEv - (0.045 / Eg) * (yEv - yEc);
  var yAcceptor = yEv + (0.045 / Eg) * (yEv - yEc); // shallow acceptor near Ev
  if (dsState.Nd > dsState.Na && dsState.Nd > 1e12) {
    ctx.strokeStyle = '#ff5555';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pad + 20, yDonor); ctx.lineTo(w - pad - 20, yDonor); ctx.stroke();
    ctx.fillStyle = '#ff5555'; ctx.fillText('Donor (Ed)', pad + 25, yDonor - 4);
  }
  if (dsState.Na > dsState.Nd && dsState.Na > 1e12) {
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pad + 20, yAcceptor); ctx.lineTo(w - pad - 20, yAcceptor); ctx.stroke();
    ctx.fillStyle = '#4ade80'; ctx.fillText('Acceptor (Ea)', pad + 25, yAcceptor + 12);
  }

  // Fermi level
  var yEf = yEv - (ef / Eg) * (yEv - yEc);
  ctx.strokeStyle = '#ffd54f';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(pad, yEf); ctx.lineTo(w - pad, yEf); ctx.stroke();
  ctx.fillStyle = '#ffd54f'; ctx.fillText('EF', pad - 28, yEf + 4);

  // Animated particles (electrons in CB, holes in VB)
  var t = Date.now() / 800;
  var nDots = Math.min(20, Math.max(0, Math.round(Math.log10(c.n + 1) - 10)));
  var pDots = Math.min(20, Math.max(0, Math.round(Math.log10(c.p + 1) - 10)));
  ctx.shadowBlur = 6;
  for (var i = 0; i < nDots; i++) {
    var px = pad + 30 + (i * 27 + Math.sin(t + i) * 10) % (w - 2 * pad - 60);
    var py = yEc + bandH / 2 + Math.cos(t * 0.7 + i * 1.3) * (bandH / 3);
    ctx.fillStyle = '#00f0ff'; ctx.shadowColor = '#00f0ff';
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
  }
  for (var j = 0; j < pDots; j++) {
    var px2 = pad + 30 + (j * 27 + Math.cos(t + j * 2) * 10) % (w - 2 * pad - 60);
    var py2 = yEv + bandH / 2 + Math.sin(t * 0.6 + j * 1.1) * (bandH / 3);
    ctx.fillStyle = '#ff4ecd'; ctx.shadowColor = '#ff4ecd';
    ctx.beginPath(); ctx.arc(px2, py2, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowBlur = 0;

  requestAnimationFrame(drawBandDiagram);
}

function updateLiveDS() {
  var mat = getMatFromState();
  var c = solveCarriers(dsState.T, dsState.Nd, dsState.Na, mat);
  var sig = conductivity(dsState.T, c.n, c.p, mat);
  var type = 'intrinsic';
  if (dsState.Nd > dsState.Na * 1.1) type = 'n-type';
  else if (dsState.Na > dsState.Nd * 1.1) type = 'p-type';
  else if (Math.max(dsState.Nd, dsState.Na) > 10 * c.ni) type = 'compensated';

  var eln = document.getElementById('live-n-ds'); if (eln) eln.textContent = c.n.toExponential(2) + ' cm\u207b\u00b3';
  var elp = document.getElementById('live-p-ds'); if (elp) elp.textContent = c.p.toExponential(2) + ' cm\u207b\u00b3';
  var els = document.getElementById('live-sigma-ds'); if (els) els.textContent = sig.toExponential(2) + ' S/cm';
  var eltype = document.getElementById('live-type-ds'); if (eltype) eltype.innerHTML = '<span class="tc-badge">' + type + '</span>';
}

var __DS_ready = false;
function initDoped() {
  if (__DS_ready) return;
  __DS_ready = true;
  var sNd = document.getElementById('slider-Nd');
  var sNa = document.getElementById('slider-Na');
  var sT = document.getElementById('slider-T-ds');
  var selMat = document.getElementById('select-material-ds');
  if (sNd) {
    sNd.addEventListener('input', function () {
      dsState.Nd = Math.pow(10, parseFloat(this.value));
      var el = document.getElementById('val-Nd');
      if (el) el.textContent = dsState.Nd.toExponential(1);
      plotFermiShift(); plotCarrierTemp(); plotConductivityDoped(); updateLiveDS();
    });
  }
  if (sNa) {
    sNa.addEventListener('input', function () {
      dsState.Na = Math.pow(10, parseFloat(this.value));
      var el = document.getElementById('val-Na');
      if (el) el.textContent = dsState.Na.toExponential(1);
      plotFermiShift(); plotCarrierTemp(); plotConductivityDoped(); updateLiveDS();
    });
  }
  if (sT) {
    sT.addEventListener('input', function () {
      dsState.T = parseFloat(this.value);
      var el = document.getElementById('val-T-ds');
      if (el) el.textContent = dsState.T;
      plotFermiShift(); plotCarrierTemp(); plotConductivityDoped(); updateLiveDS();
    });
  }
  if (selMat) {
    selMat.addEventListener('change', function () {
      dsState.matKey = this.value;
      plotFermiShift(); plotCarrierTemp(); plotConductivityDoped(); updateLiveDS();
    });
  }
  plotFermiShift(); plotCarrierTemp(); plotConductivityDoped(); updateLiveDS();
  drawBandDiagram();
}

window.initDoped = initDoped;

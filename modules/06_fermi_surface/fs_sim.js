/**
 * Fermi Surface & Fermi-Dirac Statistics — Physics Engine (v3)
 * Canvas k-space particle cloud + Plotly FD plots + material presets
 * ES5-safe, no template literals, no arrow functions, no ** operator
 */

'use strict';

// ============ CONSTANTS ============
var fs_kB_eV = 8.617333e-5;

// ============ STATE ============
var fsState = {
  T: 300, EF: 5.0, showClassical: false,
  material: 'Free', kF: 3.1623,
  animFrame: 0, time: 0
};

// ============ MATERIAL PRESETS ============
var FS_MATERIALS = {
  'Free':  { EF: 5.0,  label: 'Free electron', struct: 'Free-electron' },
  'Na':    { EF: 3.2,  label: 'Sodium',        struct: 'BCC' },
  'Cu':    { EF: 7.0,  label: 'Copper',        struct: 'FCC' },
  'Ag':    { EF: 5.5,  label: 'Silver',        struct: 'FCC' },
  'Al':    { EF: 11.7, label: 'Aluminium',     struct: 'FCC' },
  'Nb':    { EF: 5.3,  label: 'Niobium',       struct: 'BCC' }
};

function setFSMaterial(name) {
  var mat = FS_MATERIALS[name];
  if (!mat) return;
  fsState.material = name;
  fsState.EF = mat.EF;
  fsState.kF = Math.sqrt(2.0 * mat.EF);

  var sEF = document.getElementById('slider-EF');
  if (sEF) { sEF.value = mat.EF.toFixed(1); var v = document.getElementById('val-EF'); if (v) v.textContent = mat.EF.toFixed(1); }

  var btns = document.querySelectorAll('.preset-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.toggle('active', btns[i].id === 'preset-' + name);
  }

  var elMat = document.getElementById('fs-overlay-mat');
  var elStr = document.getElementById('fs-overlay-struct');
  if (elMat) elMat.textContent = mat.label;
  if (elStr) elStr.textContent = mat.struct;

  fsUpdateAll();
}
window.setFSMaterial = setFSMaterial;

// ============ PHYSICS ============
function fsFermiDirac(E, mu, T) {
  if (T <= 0) return E < mu ? 1 : (E > mu ? 0 : 0.5);
  var x = (E - mu) / (fs_kB_eV * T);
  if (x > 20) return 0;
  if (x < -20) return 1;
  return 1 / (1 + Math.exp(x));
}

function fsMaxwellBoltzmann(E, mu, T) {
  if (T <= 0) return 0;
  return Math.exp(-(E - mu) / (fs_kB_eV * T));
}

function fsChemicalPotential(EF, T) {
  var TF = EF / fs_kB_eV;
  if (T > TF * 0.5) return EF * 0.5;
  var r = fs_kB_eV * T / EF;
  return EF * (1 - (Math.PI * Math.PI / 12) * r * r);
}

function fsFermiWavevector(EF) { return Math.sqrt(2.0 * EF); }

function fsDeBroglie(T) {
  var m = 9.109e-31, kB = 1.381e-23, h = 6.626e-34;
  return (h / Math.sqrt(2.0 * Math.PI * m * kB * T)) * 1e9;
}

// ============ PLOT HELPERS ============
function _plotFS(id, traces, layout, config) {
  if (!document.getElementById(id)) return;
  Plotly.react(id, traces, layout, config);
}

function fsLayout(title, xtitle, ytitle, extra) {
  var base = {
    margin: { t: 25, r: 10, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    hovermode: 'x unified'
  };
  if (extra) { for (var k in extra) base[k] = extra[k]; }
  return base;
}

// ============ A. FERMI-DIRAC PLOT ============
function fsPlotFD() {
  var mu = fsChemicalPotential(fsState.EF, fsState.T);
  var E = [], f_FD = [], f_MB = [];
  var dE = 0.02, Emax = fsState.EF * 2.5;
  for (var e = -fsState.EF * 0.5; e <= Emax; e += dE) { E.push(e); f_FD.push(fsFermiDirac(e, mu, fsState.T)); f_MB.push(fsMaxwellBoltzmann(e, mu, fsState.T)); }
  var traces = [{ x: E, y: f_FD, mode: 'lines', name: 'Fermi-Dirac', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)' }];
  if (fsState.showClassical) traces.push({ x: E, y: f_MB, mode: 'lines', name: 'Maxwell-Boltzmann', line: { color: '#ff4ecd', width: 2, dash: 'dot' } });
  var T0 = E.map(function(e) { return e < fsState.EF ? 1 : 0; });
  traces.push({ x: E, y: T0, mode: 'lines', name: 'T = 0 step', line: { color: 'rgba(255,255,255,0.2)', width: 1.5, dash: 'dash' } });
  traces.push({ x: [mu, mu], y: [0, 1.1], mode: 'lines', name: 'mu(T)', line: { color: '#ffd740', width: 1.5 } });
  _plotFS('plot-fd', traces, fsLayout(null, 'E (eV)', 'f(E)'), { responsive: true, displayModeBar: false });
}

// ============ B. -df/dE PLOT ============
function fsPlotdFdE() {
  var mu = fsChemicalPotential(fsState.EF, fsState.T);
  var E = [], df = [];
  var dE = 0.02, width = 3 * fs_kB_eV * fsState.T || fsState.EF * 0.1;
  for (var e = mu - width; e <= mu + width; e += dE) {
    E.push(e);
    var x = (e - mu) / (fs_kB_eV * Math.max(fsState.T, 1));
    var ex = Math.exp(x);
    df.push(ex / ((1 + ex) * (1 + ex)) / (fs_kB_eV * Math.max(fsState.T, 1)));
  }
  _plotFS('plot-dfdE', [{ x: E, y: df, mode: 'lines', name: '-df/dE', line: { color: '#4ade80', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.08)' }], fsLayout(null, 'E - mu (eV)', '-df/dE (eV^-1)'), { responsive: true, displayModeBar: false });
}

// ============ C. 2D OCCUPATION MAP ============
function fsPlotOccupation() {
  var kF = fsFermiWavevector(fsState.EF);
  var mu = fsChemicalPotential(fsState.EF, fsState.T);
  var kx = [], ky = [], color = [];
  var dk = 0.18;
  for (var i = -3; i <= 3; i += dk) {
    for (var j = -3; j <= 3; j += dk) {
      kx.push(i); ky.push(j);
      var E = (i * i + j * j) / 2;
      color.push(fsFermiDirac(E, mu, fsState.T));
    }
  }
  _plotFS('plot-occ', [{
    type: 'scatter', mode: 'markers', x: kx, y: ky,
    marker: { size: 6, color: color, colorscale: [[0, 'rgba(0,0,0,0)'], [0.5, '#505070'], [1, '#00f0ff']], showscale: false },
    hoverinfo: 'skip'
  }], {
    margin: { t: 20, r: 10, b: 40, l: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { title: 'kx (nm^-1)', color: '#505070', range: [-3, 3] },
    yaxis: { title: 'ky (nm^-1)', color: '#505070', range: [-3, 3] },
    aspectratio: { x: 1, y: 1 }
  }, { responsive: true, displayModeBar: false });
}

// ============ D. CANVAS K-SPACE PARTICLE CLOUD ============
var FS_CANVAS = { canvas: null, ctx: null, width: 0, height: 0,
  particles: [], animId: null, kGrid: 40, kMax: 3.5 };

function fsCondResizeCanvas() {
  var wrap = document.querySelector('.fs-canvas-wrap');
  if (!wrap || !FS_CANVAS.canvas) return;
  var w = Math.max(200, wrap.clientWidth);
  var h = 420;
  FS_CANVAS.canvas.width = w; FS_CANVAS.canvas.height = h;
  FS_CANVAS.width = w; FS_CANVAS.height = h;
  fsInitParticles();
}

function fsInitParticles() {
  FS_CANVAS.particles = [];
  var N = FS_CANVAS.kGrid;
  var kM = FS_CANVAS.kMax;
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      var kx = -kM + (2 * kM * i) / (N - 1);
      var ky = -kM + (2 * kM * j) / (N - 1);
      var E = (kx * kx + ky * ky) / 2;
      FS_CANVAS.particles.push({ kx: kx, ky: ky, E: E });
    }
  }
}

function fsToCanvas(kx, ky) {
  var cx = 0.1 + 0.8 * (kx + FS_CANVAS.kMax) / (2 * FS_CANVAS.kMax);
  var cy = 0.1 + 0.8 * (FS_CANVAS.kMax - ky) / (2 * FS_CANVAS.kMax);
  return { x: cx * FS_CANVAS.width, y: cy * FS_CANVAS.height };
}

function fsCanvasColor(kF, fVal, T) {
  if (fVal > 0.85) return 'rgba(0,240,255,0.9)';
  if (fVal < 0.15) return 'rgba(255,255,255,0.06)';
  var frac = (fVal - 0.15) / 0.7;
  var r = Math.round(0 + frac * 255);
  var g = Math.round(240 - frac * 78);
  var b = Math.round(255);
  var a = 0.15 + frac * 0.55;
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')';
}

function fsDrawFrame() {
  var c = FS_CANVAS;
  if (!c.ctx || !c.canvas) return;
  var ctx = c.ctx;
  var mu = fsChemicalPotential(fsState.EF, fsState.T);
  var kF = fsFermiWavevector(fsState.EF);
  var kT = fs_kB_eV * fsState.T;

  ctx.clearRect(0, 0, c.width, c.height);

  // faint grid
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 0.5;
  var gx, gy;
  for (gx = 0; gx <= c.width; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, c.height); ctx.stroke(); }
  for (gy = 0; gy <= c.height; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(c.width, gy); ctx.stroke(); }

  // BZ boundary
  var bx0 = fsToCanvas(-Math.PI, -Math.PI);
  var bx1 = fsToCanvas(Math.PI, Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(bx0.x, bx0.y, bx1.x - bx0.x, bx1.y - bx0.y);
  ctx.setLineDash([]);

  // sort particles by f (draw empty first, then thermal, then occupied)
  var pts = [];
  for (var i = 0; i < c.particles.length; i++) {
    var p = c.particles[i];
    pts.push({ p: p, f: fsFermiDirac(p.E, mu, fsState.T) });
  }
  pts.sort(function(a, b) { return a.f - b.f; });

  for (i = 0; i < pts.length; i++) {
    var p = pts[i].p, f = pts[i].f;
    var pos = fsToCanvas(p.kx, p.ky);
    var radius = f > 0.8 ? 2.0 : (f > 0.2 ? 2.5 : 1.0);
    ctx.fillStyle = fsCanvasColor(kF, f, fsState.T);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  // kF circle
  var center = fsToCanvas(0, 0);
  var edge = fsToCanvas(kF, 0);
  var rPx = Math.abs(edge.x - center.x);
  ctx.strokeStyle = 'rgba(0,240,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(center.x, center.y, rPx, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);

  // thermal smear ring
  if (fsState.T > 0) {
    var smear = Math.min(rPx * 0.4, rPx * (kT / fsState.EF) * 3);
    if (smear > 2) {
      var grad = ctx.createRadialGradient(center.x, center.y, rPx - smear, center.x, center.y, rPx + smear);
      grad.addColorStop(0, 'rgba(255,78,205,0)');
      grad.addColorStop(0.5, 'rgba(255,78,205,0.12)');
      grad.addColorStop(1, 'rgba(255,78,205,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(center.x, center.y, rPx + smear, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // overlay update
  var elKf = document.getElementById('fs-overlay-kf');
  var elDeg = document.getElementById('fs-overlay-deg');
  if (elKf) elKf.textContent = kF.toFixed(2);
  if (elDeg) {
    var TF = fsState.EF / fs_kB_eV;
    elDeg.textContent = (fsState.T / TF).toFixed(3);
  }

  c.animId = requestAnimationFrame(fsDrawFrame);
}

function destroyFSCanvas() {
  if (FS_CANVAS.animId) { cancelAnimationFrame(FS_CANVAS.animId); FS_CANVAS.animId = null; }
  FS_CANVAS.canvas = null; FS_CANVAS.ctx = null;
}
window.destroyFSCanvas = destroyFSCanvas;

// ============ E. APPLICATION PLOTS ============
function fsPlotPauli() {
  var T = [], chi = [];
  for (var t = 1; t <= 1000; t += 10) { T.push(t); chi.push(Math.sqrt(Math.max(fsChemicalPotential(fsState.EF, t), 0))); }
  _plotFS('plot-pauli', [{ x: T, y: chi, mode: 'lines', name: 'Chi_Pauli', line: { color: '#ff4ecd', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(255,78,205,0.08)' }], fsLayout(null, 'T (K)', 'chi (arb. units)'), { responsive: true, displayModeBar: false });
}

function fsPlotThermionic() {
  var phi = 4.5;
  var T = [], J = [];
  for (var t = 500; t <= 3000; t += 50) { T.push(t); J.push(t * t * Math.exp(-phi / (fs_kB_eV * t))); }
  var Jmax = Math.max.apply(null, J);
  _plotFS('plot-thermionic', [{ x: T, y: J.map(function(j) { return j / Jmax; }), mode: 'lines', name: 'J / J_max', line: { color: '#ffd740', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(255,215,64,0.08)' }], fsLayout(null, 'T (K)', 'Normalized current'), { responsive: true, displayModeBar: false });
}

function fsPlotWhiteDwarf() {
  var n = [], P = [];
  for (var ni = 1e27; ni <= 1e36; ni *= 1.5) { n.push(ni); P.push(Math.pow(ni, 5.0/3.0)); }
  _plotFS('plot-wd', [{ x: n.map(function(x) { return x / 1e30; }), y: P.map(function(x) { return x / 1e50; }), mode: 'lines', name: 'P ~ n^{5/3}', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)' }], fsLayout(null, 'n (10^{30} m^{-3})', 'P (10^{50} arb. units)'), { responsive: true, displayModeBar: false });
}

// ============ LIVE READOUT ============
function fsUpdateLiveTable() {
  var mu = fsChemicalPotential(fsState.EF, fsState.T);
  var kF = fsFermiWavevector(fsState.EF);
  var TF = fsState.EF / fs_kB_eV;
  var lam = fsDeBroglie(fsState.T);
  var sets = {
    'live-T': fsState.T + ' K',
    'live-EF': fsState.EF.toFixed(2) + ' eV',
    'live-mu': mu.toFixed(3) + ' eV',
    'live-kF': kF.toFixed(2) + ' nm^{-1}',
    'live-TF': (TF / 1e4).toFixed(1) + 'x10^4 K',
    'live-debroglie': (lam < 10 ? lam.toFixed(2) : lam.toFixed(1)) + ' nm',
    'live-smear': (fs_kB_eV * fsState.T * 1000).toFixed(1) + ' meV',
    'live-degen': (fsState.T / TF).toFixed(3)
  };
  for (var k in sets) { var el = document.getElementById(k); if (el) el.textContent = sets[k]; }
}

// ============ UPDATE ALL ============
function fsUpdateAll() {
  fsState.kF = fsFermiWavevector(fsState.EF);
  fsPlotFD(); fsPlotdFdE(); fsPlotOccupation();
  fsPlotPauli(); fsPlotThermionic(); fsPlotWhiteDwarf();
  fsUpdateLiveTable();
}

// ============ CLASSICAL TOGGLE ============
function toggleClassical() {
  fsState.showClassical = !fsState.showClassical;
  var btn = document.getElementById('btn-classical');
  if (btn) btn.classList.toggle('active', fsState.showClassical);
  fsPlotFD();
}
window.toggleClassical = toggleClassical;

// ============ INIT ============
function initFS() {
  var c = document.getElementById('fs-canvas');
  if (c) { FS_CANVAS.canvas = c; FS_CANVAS.ctx = c.getContext('2d'); fsCondResizeCanvas(); }

  var sliderT = document.getElementById('slider-T');
  if (sliderT) {
    sliderT.value = fsState.T;
    sliderT.addEventListener('input', function() {
      fsState.T = Number.parseFloat(this.value);
      var v = document.getElementById('val-T');
      if (v) v.textContent = fsState.T;
      fsUpdateAll();
    });
  }

  var sliderEF = document.getElementById('slider-EF');
  if (sliderEF) {
    sliderEF.value = fsState.EF;
    sliderEF.addEventListener('input', function() {
      fsState.EF = Number.parseFloat(this.value);
      var v = document.getElementById('val-EF');
      if (v) v.textContent = fsState.EF.toFixed(1);
      fsUpdateAll();
    });
  }

  var wrap = document.querySelector('.fs-canvas-wrap');
  if (wrap && window.ResizeObserver) {
    var ro = new ResizeObserver(function() { fsCondResizeCanvas(); });
    ro.observe(wrap);
  }

  fsUpdateAll();

  if (FS_CANVAS.canvas && !FS_CANVAS.animId) {
    fsDrawFrame();
  }
}
window.initFS = initFS;

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initFS, 300);
});

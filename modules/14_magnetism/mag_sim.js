/**
 * Magnetism — Physics Engine (v5)
 * Susceptibility, Curie/Weiss law, ferromagnetism, hysteresis,
 * temperature-dependent M-T curve, antiferromagnetic peak,
 * material presets, TN/Mr sliders, AF materials,
 * enriched Ising lattice (bonds, stronger alpha, domain walls),
 * mode-switch destroy lifecycle.
 */
'use strict';

function _plotMAG(id, traces, lay, cfg) {
  var el = document.getElementById(id);
  if (!el || typeof Plotly === 'undefined') return;
  // Plotly may have measured zero size while the container was display:none.
  // Force a layout recalc before plotting, then resize after render.
  var rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    el.style.width = '100%';
    el.style.minHeight = el.style.minHeight || '260px';
  }
  Plotly.react(id, traces, lay, cfg);
  // If the parent was hidden during the first render, Plotly may still have
  // zero dims. Schedule a resize once the tab becomes visible.
  if (window.__MAG_plotResizeQueue && window.__MAG_plotResizeQueue.indexOf(id) === -1) {
    window.__MAG_plotResizeQueue.push(id);
  }
}

const PLOT_CFG = { responsive: true, displayModeBar: false };

function magLayout(title, xtitle, ytitle, extra) {
  var base = {
    margin: { t: title ? 48 : 25, r: 10, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1, font: { size: 10 } },
    hovermode: 'x unified'
  };
  if (title) base.title = { text: title, font: { size: 13, color: '#b0b0d0' }, x: 0.5, xanchor: 'center' };
  if (!extra) return base;
  // Deep-ish merge: preserve nested objects (xaxis, yaxis, title, legend) instead of overwriting them whole
  for (var k in extra) {
    if (extra.hasOwnProperty(k) && typeof extra[k] === 'object' && extra[k] !== null && !Array.isArray(extra[k]) &&
        base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      base[k] = Object.assign({}, base[k], extra[k]);
    } else {
      base[k] = extra[k];
    }
  }
  return base;
}

/* ========== SUB-TAB VISIBILITY ========== */
function isLatticeSubtabVisible() {
  var el = document.getElementById('magsub-lattice');
  return el && el.style.display !== 'none';
}

/* ========== STATE ========== */
var magState = {
  T: 300,
  C: 1.0,
  theta: 0,
  Ms: 1.0,
  Hc: 0.05,
  Tc: 1043,
  TN: 0,
  H: 0,
  Mr: 0.60,
  J: 1.0,
  material: 'Fe'
};

var MAG_MATERIALS = {
  // type: ferro|anti|dia|pauli|ferri|para
  'Fe':      { Tc: 1043, TN: 0,   Ms: 1.70, Hc: 0.05, Mr: 0.65, J:  1.00, type: 'ferro', label: 'Iron (Tc=1043 K)' },
  'Ni':      { Tc: 627,  TN: 0,   Ms: 0.60, Hc: 0.02, Mr: 0.35, J:  0.90, type: 'ferro', label: 'Nickel (Tc=627 K)' },
  'Co':      { Tc: 1388, TN: 0,   Ms: 1.40, Hc: 0.08, Mr: 0.70, J:  1.10, type: 'ferro', label: 'Cobalt (Tc=1388 K)' },
  'Gd':      { Tc: 293,  TN: 0,   Ms: 2.10, Hc: 0.01, Mr: 0.40, J:  0.50, type: 'ferro', label: 'Gadolinium (Tc=293 K)' },
  'Cu':      { Tc: 0,    TN: 0,   Ms: 0,   Hc: 0,    Mr: 0,    J:  0,    type: 'para',  label: 'Copper (paramagnetic)' },
  'Cr':      { Tc: 0,    TN: 311, Ms: 0,   Hc: 0,    Mr: 0,    J: -0.80, type: 'anti',  label: 'Chromium (TN=311 K)' },
  'MnO':     { Tc: 0,    TN: 116, Ms: 0,   Hc: 0,    Mr: 0,    J: -0.60, type: 'anti',  label: 'MnO (TN=116 K)' },
  'Graphite':{ Tc: 0,    TN: 0,   Ms: 0,   Hc: 0,    Mr: 0,    J:  0,    type: 'dia',   label: 'Graphite (diamagnetic)' },
  'Na':      { Tc: 0,    TN: 0,   Ms: 0,   Hc: 0,    Mr: 0,    J:  0,    type: 'pauli', label: 'Na (Pauli paramag)' },
  'Fe3O4':   { Tc: 858,  TN: 0,   Ms: 0.60, Hc: 0.03, Mr: 0.25, J:  0.80, type: 'ferri', label: 'Fe3O4 (ferrimagnetic, Tc=858 K)' }
};

/* ========== PHYSICS FORMULAS ========== */
function chiCurie(T, C) { return C / T; }
function chiCurieWeiss(T, C, theta) {
  if (Math.abs(T - theta) < 0.5) return null; // singularity
  if (theta === 0) return C / T; // same as Curie law
  if (theta > 0 && T < theta) return null; // below Tc, invalid for paramag law
  return C / (T - theta);
}
function chiAntiferro(T, TN, C) {
  // Néel model: peak at TN, then paramagnetic ~ C/(T+TN) for T > TN
  if (TN <= 1) return null;
  if (T < TN) {
    // cusp at TN with moderate curvature below TN
    return (C / TN) * (1.0 + 0.5 * (1.0 - Math.pow(T / TN, 0.5)));
  }
  return C / (T + TN);
}
function chiMeanField(T, Tc, TN, C) {
  // Unified mean-field-like susceptibility:
  //   AFM: peak at TN, then Curie-Weiss-like tail
  //   FM: diverge at Tc in paramag phase (T > Tc)
  //   otherwise Curie law
  if (TN > 0) return chiAntiferro(T, TN, C);
  if (Tc > 0) return chiCurieWeiss(T, C, Tc); // θ = Tc for our simplified model
  return chiCurie(T, C);
}
function magnetization(T, Tc, Ms) {
  // Simplified Brillouin-like M(T)/Ms = tanh-like form, beta~1/3 for 3D Ising
  if (Tc <= 1) return 0;
  if (T >= Tc) return 0;
  var x = (Tc - T) / Tc;
  return Ms * Math.pow(x, 0.35) * Math.tanh(2.0 * x);
}
function meanFieldM(H, T, Tc, Ms) {
  // Mean-field self-consistent M(H,T) using Brillouin-like tanh form.
  // Above Tc: linear paramagnetic response M ≈ χ H with χ = C/(T−Tc).
  // Below Tc: saturate toward Ms with field scale H0 ~ kB(Tc)/μ.
  if (Tc <= 1) {
    // No ordered phase: very weak paramag response
    return 0.2 * H / Math.max(T, 1);
  }
  if (T >= Tc) {
    return Math.max(-Ms, Math.min(Ms, 1.0 * H / Math.max(T - Tc, 1)));
  }
  // Below Tc: Brillouin-like approach to saturation
  var m0 = magnetization(T, Tc, Ms) / Ms; // spontaneous normalized order
  var H0 = 0.05 * (Tc - T) / Tc; // characteristic field scale shrinks near Tc
  var hEff = H / Math.max(H0, 0.001);
  var mField = m0 * Math.tanh(hEff) + 0.15 * H / Math.max(T, 1);
  return Math.max(-Ms, Math.min(Ms, mField));
}

/* ========== PLOTS ========== */
function plotSusceptibility() {
  var T = [], chiC = [], chiCW = [], chiDia = [], chiAF = [];
  var ymax = 0.0;
  for (var t = 10; t <= 1400; t += 5) {
    T.push(t);
    var c = chiCurie(t, magState.C);
    var cw = chiCurieWeiss(t, magState.C, magState.theta);
    var af = chiAntiferro(t, magState.TN, magState.C);
    // Clamp chi values to keep plot readable near singularities
    if (cw && !isFinite(cw)) cw = null;
    if (af && !isFinite(af)) af = null;
    chiC.push(c);
    chiCW.push(cw);
    chiDia.push(-0.001);
    chiAF.push(af);
    if (c > ymax) ymax = c;
    if (cw && cw > ymax) ymax = cw;
    if (af && af > ymax) ymax = af;
  }
  // soft cap for visibility
  ymax = Math.min(ymax, 2.0);
  var traces = [
    { x: T, y: chiC, mode: 'lines', name: 'χ = C/T (Curie)', line: { color: '#00f0ff', width: 2 } },
    { x: T, y: chiCW, mode: 'lines', name: 'χ = C/(T−θ) (Weiss)', line: { color: '#ff4ecd', width: 2 } },
    { x: T, y: chiDia, mode: 'lines', name: 'Diamagnetism', line: { color: '#ffd54f', width: 1.5, dash: 'dot' } },
    { x: T, y: T.map(function(t){ return 0.003; }), mode: 'lines', name: 'Pauli paramag (T-indep)', line: { color: '#a0b8ff', width: 1.5, dash: 'dashdot' } }
  ];
  // Tc vertical marker
  if (magState.Tc > 1) {
    traces.push({ x: [magState.Tc, magState.Tc], y: [-0.005, ymax], mode: 'lines', line: { color: '#facc15', width: 1, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' });
  }
  // AF trace
  if (magState.TN > 1) {
    traces.push({ x: T, y: chiAF, mode: 'lines', name: 'χ AFM', line: { color: '#4ade80', width: 2 } });
    traces.push({ x: [magState.TN, magState.TN], y: [-0.005, ymax], mode: 'lines', line: { color: '#4ade80', width: 1, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' });
  }
  var anns = [];
  if (magState.Tc > 0) {
    anns.push({ x: magState.Tc + 30, y: ymax * 0.9, text: 'Tc = ' + magState.Tc + ' K', font: { color: '#ffd54f', size: 10 }, showarrow: false });
  }
  if (magState.TN > 1) {
    anns.push({ x: magState.TN + 20, y: ymax * 0.75, text: 'TN = ' + magState.TN + ' K', font: { color: '#4ade80', size: 10 }, showarrow: false });
  }
  _plotMAG('plot-susceptibility', traces, magLayout('Magnetic Susceptibility χ(T)', 'Temperature (K)', 'χ', {
    yaxis: { range: [-0.01, ymax] },
    annotations: anns
  }), PLOT_CFG);
}

function plotMagnetizationCurve() {
  var T = [], M = [];
  var tc = magState.Tc || 0;
  var Ms = magState.Ms || 1;
  for (var t = 0; t <= 1400; t += 5) {
    T.push(t);
    // Normalize to M/Ms so the y-axis label is accurate
    M.push(magnetization(t, tc, Ms) / Ms);
  }
  _plotMAG('plot-M-T', [
    { x: T, y: M, mode: 'lines', name: 'M(T)/Ms', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: [tc, tc], y: [0, 1], mode: 'lines', line: { color: '#facc15', width: 1.5, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' }
  ], magLayout('Magnetization M(T)', 'Temperature (K)', 'M / M_s', {
    annotations: [
      { x: tc + 30, y: 0.5, text: 'Curie temp Tc', font: { color: '#ffd54f', size: 10 }, showarrow: false },
      { x: 200, y: 0.92, text: 'Ferromagnetic', font: { color: '#4ade80', size: 9 }, showarrow: false },
      { x: Math.min(tc + 120, 1300), y: 0.02, text: 'Paramagnetic', font: { color: '#ff4ecd', size: 9 }, showarrow: false }
    ]
  }), PLOT_CFG);
}

function plotHysteresis() {
  var H_up = [], M_up = [], H_down = [], M_down = [];
  var Ms = magState.Ms, Hc = magState.Hc, Mr = magState.Mr;
  var Tc = magState.Tc, TN = magState.TN;
  var J = magState.J || 1.0;
  var T = magState.T;
  var t_ratio = Tc > 1 ? Math.min(T / Tc, 1) : 1;
  // Coercivity vanishes at/above Tc and scales with exchange strength |J|
  var Hc_eff = (Tc > 1 && T < Tc) ? (Hc * Math.pow(1 - t_ratio, 0.5) * Math.abs(J)) : 0;
  var Mr_eff = (Tc > 1 && T < Tc) ? (Mr * Math.pow(1 - t_ratio, 0.45)) : 0;
  var alpha = 0.5; // slope parameter

  // Sweep H from -0.3 up to +0.3
  for (var h = -0.3; h <= 0.3 + 1e-9; h += 0.005) {
    H_up.push(h);
    if (Hc_eff > 0.001) {
      if (h < -Hc_eff)      M_up.push(-Ms + (Ms - Mr_eff) * Math.tanh((h + Hc_eff) / alpha));
      else if (h > Hc_eff)  M_up.push( Ms - (Ms - Mr_eff) * Math.tanh((Hc_eff - h) / alpha));
      else                  M_up.push( Mr_eff * (h / Math.max(Hc_eff, 1e-6)));
    } else {
      // Paramagnetic / above Tc: linear response from mean-fieldM
      M_up.push(meanFieldM(h, T, Tc, Ms));
    }
  }
  // Sweep H back down from +0.3 to -0.3
  for (var h = 0.3; h >= -0.3 - 1e-9; h -= 0.005) {
    H_down.push(h);
    if (Hc_eff > 0.001) {
      if (h > Hc_eff)       M_down.push( Ms - (Ms - Mr_eff) * Math.tanh((h - Hc_eff) / alpha));
      else if (h < -Hc_eff) M_down.push(-Ms + (Ms - Mr_eff) * Math.tanh((-Hc_eff - h) / alpha));
      else                  M_down.push(-Mr_eff * (h / Math.max(Hc_eff, 1e-6)));
    } else {
      M_down.push(meanFieldM(h, T, Tc, Ms));
    }
  }

  _plotMAG('plot-hysteresis', [
    { x: H_up,   y: M_up,   mode: 'lines', name: 'M sweep ↑', line: { color: '#4ade80', width: 2.5 } },
    { x: H_down, y: M_down, mode: 'lines', name: 'M sweep ↓', line: { color: '#ff4ecd', width: 2.5 } },
    { x: [-0.3, 0.3], y: [0, 0], mode: 'lines', line: { color: '#505070', width: 1, dash: 'dot' }, showlegend: false, hoverinfo: 'skip' },
    { x: [0, 0], y: [-Ms, Ms], mode: 'lines', line: { color: '#505070', width: 1, dash: 'dot' }, showlegend: false, hoverinfo: 'skip' },
    { x: [Hc_eff, Hc_eff], y: [-0.02, 0.02], mode: 'lines', line: { color: '#ffd54f', width: 2 }, showlegend: false, hoverinfo: 'skip' },
    { x: [-Hc_eff, -Hc_eff], y: [-0.02, 0.02], mode: 'lines', line: { color: '#ffd54f', width: 2 }, showlegend: false, hoverinfo: 'skip' }
  ], magLayout('Hysteresis Loop M(H)', 'H (arb.)', 'M (arb.)', {
    annotations: [
      { x: Hc_eff + 0.02, y: Ms * 0.5, text: 'Hc = ' + Hc_eff.toFixed(3), font: { color: '#ffd54f', size: 10 }, showarrow: false },
      { x: -Hc_eff + 0.02, y: -Ms * 0.5, text: '−Hc', font: { color: '#ffd54f', size: 9 }, showarrow: false },
      { x: 0.15, y: Ms * 0.1, text: Hc_eff < 0.001 ? 'No hysteresis (T ≥ Tc)' : 'Hysteresis loop', font: { color: '#8080a0', size: 9 }, showarrow: false }
    ]
  }), PLOT_CFG);
}

/* ========== ISING LATTICE ========== */
const ISING_SIZE = 20;
var isingSpins = [];

// Spin-wave (magnon) mode: deterministic excitations instead of thermal Metropolis
var spinWaveMode = false;   // false = thermal Metropolis, true = deterministic magnon propagation
var magnonPhase   = [];     // continuous precession angle for each spin (Heisenberg-like overlay)
var isingCanvas = null, isingCtx = null;
var isingCell = 8; // pixels per spin
var isingInterval = null;

var isingCanvasRO = null;

/* ---- draggable bar magnet (dipole field source) ---- */
var barMagnet = {
  active: false,
  x: 0.5,
  y: 0.5,
  strength: 0.15,
  dragging: false
};

function initIsing() {
  isingCanvas = document.getElementById('ising-canvas');
  if (!isingCanvas) return;
  var wrapper = document.getElementById('ising-wrapper');
  if (wrapper) {
    var w = wrapper.clientWidth || wrapper.offsetWidth || 640;
    var h = wrapper.clientHeight || wrapper.offsetHeight || 320;
    isingCanvas.width = w;
    isingCanvas.height = h;
  }
  isingCtx = isingCanvas.getContext('2d');
  var size = ISING_SIZE;
  var w2 = isingCanvas.width;
  var h2 = isingCanvas.height;
  // larger cell for quality: 14-22 px per spin at 20×20
  isingCell = Math.min(22, Math.max(14, Math.min(Math.floor(w2 / size), Math.floor(h2 / size))));

  // Determine material type from presets
  var matType = 'ferro';
  if (MAG_MATERIALS[magState.material]) matType = MAG_MATERIALS[magState.material].type || 'ferro';

  // always reinit on material switch (AF checkerboard / FM random / dia empty / pauli random)
  isingSpins = [];
  magnonPhase = [];
  var isAF = magState.TN > 0 && magState.Tc <= 0;
  var J = magState.J || 1.0;
  for (var i = 0; i < ISING_SIZE; i++) {
    var row = [];
    var prow = []; // for magnon phase overlay
    for (var j = 0; j < ISING_SIZE; j++) {
      var s;
      if (matType === 'dia') {
        // Diamagnets have no local spin moments; faint placeholder only
        s = 0;
      } else if (matType === 'pauli') {
        // Pauli paramagnets: very weak disorder from conduction-electron spins (~10% magnitude)
        s = (Math.random() < 0.5 ? 1 : -1);
      } else if (isAF) {
        // antiferromagnetic checkerboard: opposite on each sublattice
        // J<0 means exchange energy favors anti-parallel neighbors
        var sub = (i + j) % 2;
        s = sub === 0 ? 1 : -1;
      } else {
        s = Math.random() < 0.5 ? 1 : -1;
      }
      row.push(s);
      // initialize magnon phase overlay for spin-wave modes
      prow.push(s * Math.PI / 2);
    }
    isingSpins.push(row);
    magnonPhase.push(prow);
  }

  // Remove stale listeners before re-adding (prevents accumulation on sub-tab switching)
  isingCanvas.removeEventListener('click', onIsingClick);
  isingCanvas.removeEventListener('mousedown', onMagnetMouseDown);
  isingCanvas.removeEventListener('mousemove', onMagnetMouseMove);
  isingCanvas.removeEventListener('mouseup', onMagnetMouseUp);
  isingCanvas.removeEventListener('mouseleave', onMagnetMouseUp);
  isingCanvas.addEventListener('click', onIsingClick);
  isingCanvas.addEventListener('mousedown', onMagnetMouseDown);
  isingCanvas.addEventListener('mousemove', onMagnetMouseMove);
  isingCanvas.addEventListener('mouseup', onMagnetMouseUp);
  isingCanvas.addEventListener('mouseleave', onMagnetMouseUp);
  if (isingInterval) { clearInterval(isingInterval); isingInterval = null; }
  isingInterval = setInterval(stepIsing, 80);
  drawIsing();
  updateAmbientBar();
  updateLatticeM();

  // resize observer: disconnect any existing one before creating a new one
  if (isingCanvasRO) { isingCanvasRO.disconnect(); isingCanvasRO = null; }
  if (wrapper && 'ResizeObserver' in window) {
    isingCanvasRO = new ResizeObserver(function(entries) {
      for (var k = 0; k < entries.length; k++) {
        var entry = entries[k];
        if (entry.contentRect) {
          isingCanvas.width = entry.contentRect.width;
          isingCanvas.height = entry.contentRect.height;
          var size2 = ISING_SIZE;
          isingCell = Math.min(22, Math.max(14, Math.min(Math.floor(isingCanvas.width / size2), Math.floor(isingCanvas.height / size2))));
          drawIsing();
        }
      }
    });
    isingCanvasRO.observe(wrapper);
  }
}

function destroyIsing() {
  if (isingInterval) { clearInterval(isingInterval); isingInterval = null; }
  if (isingCanvasRO) { isingCanvasRO.disconnect(); isingCanvasRO = null; }
  if (isingCanvas) {
    isingCanvas.removeEventListener('click', onIsingClick);
    isingCanvas.removeEventListener('mousedown', onMagnetMouseDown);
    isingCanvas.removeEventListener('mousemove', onMagnetMouseMove);
    isingCanvas.removeEventListener('mouseup', onMagnetMouseUp);
    isingCanvas.removeEventListener('mouseleave', onMagnetMouseUp);
  }
}
/* ---- Spin wave / magnon controls ---- */
// ω(q) = 2J S (1 - cos(q a))  --  nearest-neighbor magnon dispersion, simple cubic
function plotMagnonDispersion() {
  // ω(q) = 2 J S (1 - cos(q a))   --  magnon dispersion, nearest-neighbor Heisenberg model (1D)
  //   At small q: ω ≈ J S q² a²  →  quadratic Goldstone mode.
  //   At zone boundary q = π/a: ω = 4 J S  →  maximum energy gap = 0 (ferromagnet, no anisotropy).
  var q = [], omega = [];
  var J = Math.abs(magState.J || 1);
  var S = 0.5; // spin-1/2 for Fe3O4 / elementary lattice
  // dispersion sampled from 0 to π
  for (var i = 0; i <= Math.PI; i += 0.01) {
    q.push(i);
    omega.push(2 * J * S * (1 - Math.cos(i)));
  }
  _plotMAG('plot-magnon', [
    { x: q, y: omega, mode: 'lines', name: 'ω(q)', line: { color: '#4ade80', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.06)' }
  ], magLayout('Magnon Dispersion ω(q)', 'q a (arb.)', 'ħω (arb.)', {
    annotations: [
      { x: 1.0, y: 2 * J * S * (1 - Math.cos(1.0)) + 0.05, text: 'Low-q: ω ≈ J S q²', font: { color: '#4ade80', size: 9 }, showarrow: false },
      { x: Math.PI, y: 0.03, text: 'Zone boundary', font: { color: '#8080a0', size: 9 }, showarrow: false }
    ]
  }), PLOT_CFG);
}

// G(M) = a (T - Tc) M² + b M⁴ - H M   -- Landau free energy functional for mean-field ferromagnet
function plotLandauGM() {
  // G(M) = a (T - Tc) M^2 + b M^4 - H M
  //   Landau free-energy functional; a,b > 0 (phenomenological parameters).
  //   T < Tc  →  coefficient (T-Tc) < 0  →  double-well potential (spontaneous symmetry breaking).
  //   T > Tc  →  single minimum at M = 0 (paramagnetic phase).
  var M = [], G = [];
  var T  = magState.T;
  var Tc = magState.Tc || 1;
  var H  = magState.H;
  var a  = 1.0, b = 1.0; // Landau coefficients in scaled units
  // scan symmetrically around zero magnetization
  for (var m = -1.2; m <= 1.2; m += 0.005) {
    M.push(m);
    // below Tc the quadratic term is negative => double-well potential
    G.push(a * (T - Tc) * m * m + b * m * m * m * m - H * m);
  }
  _plotMAG('plot-landau', [
    { x: M, y: G, mode: 'lines', name: 'G(M)', line: { color: '#00f0ff', width: 2 } }
  ], magLayout('Landau Free Energy G(M)', 'M (arb.)', 'G(M) (arb.)', {
    yaxis: { range: [-0.6, 1.2] },
    annotations: [
      { x: 0, y: 0.05, text: T < Tc ? 'Unstable max' : 'Global min', font: { color: '#ff4ecd', size: 9 }, showarrow: false }
    ]
  }), PLOT_CFG);
}

function toggleSpinWaveMode() {
  var entering = !spinWaveMode;
  spinWaveMode = !spinWaveMode;
  var btn = document.getElementById('btn-spinwave');
  if (btn) {
    btn.textContent = spinWaveMode ? 'Magnon: ON' : 'Magnon: OFF';
    btn.style.borderColor = spinWaveMode ? '#4ade80' : 'var(--border-subtle)';
    btn.style.color       = spinWaveMode ? '#4ade80' : 'var(--text-main)';
  }
  // Only seed the continuous phase overlay when entering magnon mode from thermal mode.
  // If already in magnon mode, preserve the existing phase field so the user can
  // build up / inject additional wavepackets without resetting the first one.
  if (entering) {
    magnonPhase = [];
    for (var i = 0; i < ISING_SIZE; i++) {
      var prow = [];
      for (var j = 0; j < ISING_SIZE; j++) {
        // map binary Ising spin to angle: +1 -> +π/2, -1 -> -π/2
        prow.push(isingSpins[i][j] * Math.PI / 2);
      }
      magnonPhase.push(prow);
    }
  }
}

// Inject a localized magnon at lattice center
function injectMagnon() {
  if (!spinWaveMode) { toggleSpinWaveMode(); }
  var cx = Math.floor(ISING_SIZE / 2);
  var cy = Math.floor(ISING_SIZE / 2);
  // create a Gaussian wavepacket in the phase field
  var sigma = 2.0;
  for (var i = 0; i < ISING_SIZE; i++) {
    for (var j = 0; j < ISING_SIZE; j++) {
      var di = i - cx, dj = j - cy;
      var dist2 = di * di + dj * dj;
      var amp = Math.exp(-dist2 / (2 * sigma * sigma));
      // kick phase by local amplitude (perturbation from equilibrium)
      magnonPhase[i][j] += amp * 0.6;
      // clamp to avoid runaway
      if (magnonPhase[i][j] >  Math.PI) magnonPhase[i][j] =  Math.PI;
      if (magnonPhase[i][j] < -Math.PI) magnonPhase[i][j] = -Math.PI;
    }
  }
}

// Deterministic precession step for spin-wave mode
// ∂S/∂t ∝ J Σ_neighbors S_n × S (simplified to angle diffusion on lattice)
function stepMagnon() {
  // Deterministic spin-wave propagation via discrete Laplacian of local phase φ(i,j):
  //   dφ/dt = J ∇²φ  (phenomenological diffusion of precession angle).
  //   Real magnons obey ∂S/∂t = (J/ℏ) S × Σ_neighbors S_n.
  if (!magnonPhase.length) return;
  var J = magState.J || 1.0;
  var dt = 0.15; // time step
  var damp = 0.98; // weak damping
  var newPhase = [];
  for (var i = 0; i < ISING_SIZE; i++) {
    var row = [];
    for (var j = 0; j < ISING_SIZE; j++) {
      // discrete Laplacian of phase: neighbor average
      var neigh = 0, n = 0;
      if (i > 0)           { neigh += magnonPhase[i - 1][j]; n++; }
      if (i < ISING_SIZE - 1) { neigh += magnonPhase[i + 1][j]; n++; }
      if (j > 0)           { neigh += magnonPhase[i][j - 1]; n++; }
      if (j < ISING_SIZE - 1) { neigh += magnonPhase[i][j + 1]; n++; }
      var lap = (n > 0) ? (neigh / n - magnonPhase[i][j]) : 0;
      // phase evolves toward neighbor alignment: dφ/dt = + J * laplacian(φ)
      row.push(magnonPhase[i][j] + J * dt * lap);
    }
    newPhase.push(row);
  }
  // apply damping and copy back; simultaneously write back to binary lattice for display
  for (var i = 0; i < ISING_SIZE; i++) {
    for (var j = 0; j < ISING_SIZE; j++) {
      magnonPhase[i][j] = damp * newPhase[i][j];
      // quantize continuous phase back to Ising spin for rendering
      // positive phase => spin up, negative => spin down
      isingSpins[i][j] = (magnonPhase[i][j] >= 0) ? 1 : -1;
    }
  }
}



/* ---- bar magnet drag handlers ---- */
function onMagnetMouseDown(e) {
  if (!barMagnet.active) return;
  var rect = isingCanvas.getBoundingClientRect();
  var mx = (e.clientX - rect.left) / rect.width;
  var my = (e.clientY - rect.top) / rect.height;
  var dx = mx - barMagnet.x, dy = my - barMagnet.y;
  if (dx * dx + dy * dy < 0.02) {
    barMagnet.dragging = true;
    e.preventDefault();
  }
}
function onMagnetMouseMove(e) {
  if (!barMagnet.active || !barMagnet.dragging) return;
  var rect = isingCanvas.getBoundingClientRect();
  barMagnet.x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
  barMagnet.y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
  e.preventDefault();
}
function onMagnetMouseUp(e) {
  if (barMagnet.dragging) { barMagnet.dragging = false; e.preventDefault(); }
}

/* ---- field from bar magnet at lattice cell (i,j) ---- */
function getMagnetFieldAt(i, j) {
  if (!barMagnet.active) return 0;
  var cw = isingCanvas.width, ch = isingCanvas.height;
  var offX = (cw - ISING_SIZE * isingCell) / 2;
  var offY = (ch - ISING_SIZE * isingCell) / 2;
  if (offX < 0) offX = 0;
  if (offY < 0) offY = 0;
  var sx = offX + j * isingCell + isingCell / 2;
  var sy = offY + i * isingCell + isingCell / 2;
  var mx = barMagnet.x * cw, my = barMagnet.y * ch;
  var dx = sx - mx, dy = sy - my;
  var r2 = dx * dx + dy * dy;
  var r = Math.sqrt(r2) + 0.001; // avoid div by zero
  var magLen = Math.min(cw, ch) * 0.12; // half-length of magnet in px
  var dip = barMagnet.strength;
  // dipole along x-axis (N→S), field falls as 1/r^2
  // simplified: N pole attracts spin-down, S pole attracts spin-up
  // H_local ~ dip * (dx / r^2)  ; positive dx = S side = H > 0 favors ↑
  var Hloc = dip * (dx / (r2 + 10)) * 400;
  return Hloc;
}

function onIsingClick(e) {
  if (!isingCanvas) return;
  var rect = isingCanvas.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;
  // ignore click if it landed on the bar magnet
  if (barMagnet.active) {
    var cw = isingCanvas.width, ch = isingCanvas.height;
    var mw = Math.min(cw, ch) * 0.18;
    var mh = mw * 0.35;
    var mx = barMagnet.x * cw - mw / 2;
    var my = barMagnet.y * ch - mh / 2;
    if (x >= mx && x <= mx + mw && y >= my && y <= my + mh) return;
  }
  var j = Math.floor(x / isingCell);
  var i = Math.floor(y / isingCell);
  if (i >= 0 && i < ISING_SIZE && j >= 0 && j < ISING_SIZE) {
    isingSpins[i][j] *= -1;
    drawIsing();
    updateAmbientBar();
    updateLatticeReadout();
  }
}

function stepIsing() {
  if (!isingSpins.length) return;
  // In magnon mode, use deterministic precession instead of thermal Metropolis
  if (spinWaveMode) {
    stepMagnon();
    drawIsing();
    updateAmbientBar();
    updateLatticeReadout();
    return;
  }
  var J = magState.J || 1.0;
  var T = magState.T;
  var N = ISING_SIZE * ISING_SIZE;
  // beta = |J| / (k_B T) in scaled units.  factor 2 sets approximate visibility range.
  var beta = T < 1 ? 100 : Math.abs(J) * 2.0 / (0.001 * T);
  var H = magState.H;
  for (var s = 0; s < N; s++) {
    var i = Math.floor(Math.random() * ISING_SIZE);
    var j = Math.floor(Math.random() * ISING_SIZE);
    var neighbors = 0;
    if (i > 0)           neighbors += isingSpins[i - 1][j];
    if (i < ISING_SIZE - 1) neighbors += isingSpins[i + 1][j];
    if (j > 0)           neighbors += isingSpins[i][j - 1];
    if (j < ISING_SIZE - 1) neighbors += isingSpins[i][j + 1];
    var Hloc = barMagnet.active ? getMagnetFieldAt(i, j) : 0;
    // Metropolis criterion:  dE = 2 J s_i Σ_j s_j  +  2 (H + H_loc) s_i
    var dE = 2 * J * isingSpins[i][j] * neighbors + 2 * (H + Hloc) * isingSpins[i][j];
    if (dE < 0 || Math.random() < Math.exp(-dE * beta)) {
      isingSpins[i][j] *= -1;
    }
  }
  drawIsing();
  updateAmbientBar();
  updateLatticeReadout();
}

function drawIsingClear() {
  var cw = isingCanvas.width, ch = isingCanvas.height;
  isingCtx.fillStyle = '#0a0a12';
  isingCtx.fillRect(0, 0, cw, ch);
}

function computeIsingOffset() {
  var cw = isingCanvas.width, ch = isingCanvas.height;
  var offX = (cw - ISING_SIZE * isingCell) / 2;
  var offY = (ch - ISING_SIZE * isingCell) / 2;
  return { x: Math.max(offX, 0), y: Math.max(offY, 0), cw: cw, ch: ch };
}

function drawIsingGrid(offX, offY) {
  isingCtx.globalAlpha = 0.08;
  isingCtx.strokeStyle = '#303045';
  isingCtx.lineWidth = 1;
  for (var i = 0; i <= ISING_SIZE; i++) {
    isingCtx.beginPath();
    isingCtx.moveTo(offX + i * isingCell, offY);
    isingCtx.lineTo(offX + i * isingCell, offY + ISING_SIZE * isingCell);
    isingCtx.stroke();
    isingCtx.beginPath();
    isingCtx.moveTo(offX, offY + i * isingCell);
    isingCtx.lineTo(offX + ISING_SIZE * isingCell, offY + i * isingCell);
    isingCtx.stroke();
  }
}

function drawIsingBonds(offX, offY, couplingFactor) {
  var sHalf = isingCell / 2;
  var J = magState.J || 1.0;
  var isAF = (magState.TN || 0) > 0 && (magState.Tc || 0) <= 0;
  var AFJ = isAF && J < 0;
  for (var i = 0; i < ISING_SIZE; i++) {
    for (var j = 0; j < ISING_SIZE; j++) {
      var cx = offX + j * isingCell + sHalf;
      var cy = offY + i * isingCell + sHalf;
      var s = isingSpins[i][j];
      var ba, bc;
      if (j < ISING_SIZE - 1) {
        if (s === isingSpins[i][j + 1]) { ba = 0.55 * couplingFactor; bc = s === 1 ? '#00f0ff' : '#ff4ecd'; }
        else { ba = 0.22 * couplingFactor; bc = '#facc15'; }
        isingCtx.globalAlpha = ba;
        isingCtx.strokeStyle = bc;
        isingCtx.lineWidth = ba > 0.2 ? 3.5 : 2;
        isingCtx.beginPath();
        isingCtx.moveTo(cx, cy);
        isingCtx.lineTo(cx + isingCell, cy);
        isingCtx.stroke();
      }
      if (i < ISING_SIZE - 1) {
        if (s === isingSpins[i + 1][j]) { ba = 0.55 * couplingFactor; bc = s === 1 ? '#00f0ff' : '#ff4ecd'; }
        else { ba = 0.22 * couplingFactor; bc = '#facc15'; }
        isingCtx.globalAlpha = ba;
        isingCtx.strokeStyle = bc;
        isingCtx.lineWidth = ba > 0.2 ? 3.5 : 2;
        isingCtx.beginPath();
        isingCtx.moveTo(cx, cy);
        isingCtx.lineTo(cx, cy + isingCell);
        isingCtx.stroke();
      }
    }
  }
}

function drawIsingSpins(offX, offY, spinSize) {
  var sHalf = isingCell / 2;
  var r = spinSize / 2;
  var ar = r * 0.6;
  var matType = 'ferro';
  if (MAG_MATERIALS[magState.material]) matType = MAG_MATERIALS[magState.material].type || 'ferro';

  for (var i = 0; i < ISING_SIZE; i++) {
    for (var j = 0; j < ISING_SIZE; j++) {
      var x = offX + j * isingCell;
      var y = offY + i * isingCell;
      var s = isingSpins[i][j];
      var cx = x + sHalf;
      var cy = y + sHalf;

      // Diamagnet: no local moments → tiny gray dots only
      if (matType === 'dia') {
        isingCtx.globalAlpha = 0.25;
        isingCtx.fillStyle = '#505070';
        isingCtx.beginPath(); isingCtx.arc(cx, cy, r * 0.35, 0, 2 * Math.PI); isingCtx.fill();
        continue;
      }

      // Pauli paramagnet: weak spins, smaller circles, washed-out color
      var effR = r;
      var alphaMul = 1.0;
      if (matType === 'pauli') { effR = r * 0.55; alphaMul = 0.45; }

      // Ferrimagnet: two sublattice sizes (A larger than B)
      if (matType === 'ferri') {
        var sub = (i + j) % 2;
        effR = sub === 0 ? r : r * 0.55; // A-site larger
      }

      // glow
      isingCtx.globalAlpha = 0.55 * alphaMul;
      isingCtx.fillStyle = s === 1 ? 'rgba(0,240,255,0.12)' : 'rgba(255,78,205,0.12)';
      isingCtx.beginPath(); isingCtx.arc(cx, cy, effR + 2.5, 0, 2 * Math.PI); isingCtx.fill();
      // circle
      isingCtx.globalAlpha = 0.95 * alphaMul;
      isingCtx.fillStyle = s === 1 ? '#00f0ff' : '#ff4ecd';
      isingCtx.beginPath(); isingCtx.arc(cx, cy, effR, 0, 2 * Math.PI); isingCtx.fill();
      // arrow
      isingCtx.globalAlpha = 0.75 * alphaMul;
      isingCtx.fillStyle = '#0a0a12';
      isingCtx.beginPath();
      if (s === 1) {
        isingCtx.moveTo(cx, cy - ar);
        isingCtx.lineTo(cx - ar * 0.65, cy + ar * 0.55);
        isingCtx.lineTo(cx + ar * 0.65, cy + ar * 0.55);
      } else {
        isingCtx.moveTo(cx, cy + ar);
        isingCtx.lineTo(cx - ar * 0.65, cy - ar * 0.55);
        isingCtx.lineTo(cx + ar * 0.65, cy - ar * 0.55);
      }
      isingCtx.fill();
      // domain wall tint
      var neighDiff = 0;
      if (i > 0 && isingSpins[i][j] !== isingSpins[i - 1][j]) neighDiff = 1;
      if (i < ISING_SIZE - 1 && isingSpins[i][j] !== isingSpins[i + 1][j]) neighDiff = 1;
      if (j > 0 && isingSpins[i][j] !== isingSpins[i][j - 1]) neighDiff = 1;
      if (j < ISING_SIZE - 1 && isingSpins[i][j] !== isingSpins[i][j + 1]) neighDiff = 1;
      if (neighDiff) {
        isingCtx.globalAlpha = 0.40 * alphaMul;
        isingCtx.fillStyle = 'rgba(250,204,21,0.40)';
        isingCtx.fillRect(x, y, isingCell, isingCell);
      }
    }
  }
}

function drawIsingStateLabel(offX, offY) {
  isingCtx.globalAlpha = 0.90;
  isingCtx.fillStyle = '#0a0a12';
  isingCtx.fillRect(offX, offY, ISING_SIZE * isingCell, 22);
  isingCtx.globalAlpha = 1.0;
  var T = magState.T, Tc = magState.Tc || 1, TN = magState.TN || 0;
  var st = '', stCol = '';
  if (TN > 0 && T < TN) { st = 'Antiferromagnetic'; stCol = '#4ade80'; }
  else if ((TN > 0 && Tc <= 0) && (magState.J || 1) < 0) { st = 'Antiferro — J<0'; stCol = '#4ade80'; }
  else if (Tc > 0 && T < Tc) { st = 'Ferromagnetic'; stCol = '#00f0ff'; }
  else { st = 'Paramagnetic'; stCol = '#8080a0'; }
  isingCtx.font = 'bold 13px JetBrains Mono, monospace';
  isingCtx.fillStyle = stCol;
  isingCtx.fillText(st, offX + 8, offY + 16);
  isingCtx.font = '11px JetBrains Mono, monospace';
  isingCtx.fillStyle = '#505070';
  var info = magState.material + '  |  T=' + T + ' K  |  H=' + magState.H.toFixed(2);
  isingCtx.fillText(info, offX + 120, offY + 16);
}

function drawBarMagnet(cw, ch) {
  var mw = Math.min(cw, ch) * 0.18;
  var mh = mw * 0.35;
  var mx = barMagnet.x * cw - mw / 2;
  var my = barMagnet.y * ch - mh / 2;
  var mHalf = mw / 2;
  var magAlpha = barMagnet.active ? 1.0 : 0.35;
  var magSat = barMagnet.active ? 1.0 : 0.35;
  isingCtx.globalAlpha = magAlpha;
  isingCtx.fillStyle = barMagnet.active ? '#00f0ff' : 'rgba(0,240,255,' + magSat + ')';
  isingCtx.fillRect(mx, my, mHalf, mh);
  isingCtx.fillStyle = barMagnet.active ? '#ff4ecd' : 'rgba(255,78,205,' + magSat + ')';
  isingCtx.fillRect(mx + mHalf, my, mHalf, mh);
  isingCtx.strokeStyle = barMagnet.active ? '#8080a0' : 'rgba(128,128,160,0.4)';
  isingCtx.lineWidth = barMagnet.active ? 1.5 : 1;
  isingCtx.strokeRect(mx, my, mw, mh);
  isingCtx.beginPath();
  isingCtx.moveTo(mx + mHalf, my);
  isingCtx.lineTo(mx + mHalf, my + mh);
  isingCtx.stroke();
  isingCtx.font = 'bold 13px JetBrains Mono, monospace';
  isingCtx.fillStyle = '#0a0a12';
  isingCtx.fillText('N', mx + mHalf * 0.32, my + mh * 0.68);
  isingCtx.fillText('S', mx + mHalf * 1.32, my + mh * 0.68);
  if (barMagnet.dragging) {
    isingCtx.strokeStyle = 'rgba(0,240,255,0.35)';
    isingCtx.lineWidth = 2;
    isingCtx.beginPath();
    isingCtx.arc(mx + mw / 2, my + mh / 2, mw * 0.6, 0, 2 * Math.PI);
    isingCtx.stroke();
  }
  return { mx: mx, my: my, mw: mw, mh: mh };
}

function drawIsing() {
  if (!isingCtx) return;
  var dim = computeIsingOffset();
  var offX = dim.x, offY = dim.y, cw = dim.cw, ch = dim.ch;
  var T = magState.T;
  var Tc = magState.Tc || 1;
  var TN = magState.TN || 0;
  var couplingFactor = Math.max(0.15, 1.0 - Math.min(T / (Tc || TN || 100), 0.90));
  var spinSize = Math.max(7, isingCell * 0.38);

  drawIsingClear();
  drawUniformField(cw, ch, magState.H);
  drawIsingGrid(offX, offY);
  drawIsingBonds(offX, offY, couplingFactor);
  drawIsingSpins(offX, offY, spinSize);
  drawIsingStateLabel(offX, offY);
  isingCtx.globalAlpha = 1.0;
  var m = drawBarMagnet(cw, ch);
  if (barMagnet.active) drawMagnetField(m.mx, m.my, m.mw, m.mh, true);
}

/* ---- draw uniform background H-field arrows ---- */
function drawUniformField(cw, ch, H) {
  if (Math.abs(H) < 0.02) return;
  var dir    = H > 0 ? 1 : -1;
  var alpha  = Math.min(0.55, Math.abs(H) * 1.2);
  var col    = dir > 0 ? '#a0b8ff' : '#6fd7ff';
  var rows   = 5;
  var cols   = 6;
  var pad    = 8;
  var topY   = pad + 4;
  var botY   = ch - pad - 4;
  var leftX  = pad;
  var rightX = cw - pad;
  var dx     = (rightX - leftX) / (cols - 1 || 1);
  var dy     = (botY  - topY)  / (rows - 1 || 1);
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var ax = leftX + c * dx;
      var ay = topY  + r * dy;
      var len = Math.min(dx, dy) * 0.28;
      var ex  = ax + dir * len;
      isingCtx.save();
      isingCtx.globalAlpha = alpha;
      isingCtx.strokeStyle = col;
      isingCtx.lineWidth   = 1.8;
      isingCtx.beginPath();
      isingCtx.moveTo(ax, ay);
      isingCtx.lineTo(ex, ay);
      isingCtx.stroke();
      // arrowhead
      var ah = len * 0.38;
      var hw = len * 0.24;
      var hx = ex;
      var hy = ay;
      var bx = hx - dir * ah;
      var by1 = hy - hw;
      var by2 = hy + hw;
      isingCtx.beginPath();
      isingCtx.moveTo(hx, hy);
      isingCtx.lineTo(bx, by1);
      isingCtx.lineTo(bx, by2);
      isingCtx.closePath();
      isingCtx.fillStyle = col;
      isingCtx.fill();
      isingCtx.restore();
    }
  }
}

/* ---- draw field vectors / pattern around bar magnet ---- */
function drawMagnetField(mx, my, mw, mh, active) {
  var cx = mx + mw / 2, cy = my + mh / 2;
  var poleLen = mw * 0.5;
  var nx = cx - poleLen, ny = cy; // N pole center
  var sx = cx + poleLen, sy = cy; // S pole center
  var step = isingCell * 3;
  var cw = isingCanvas.width, ch = isingCanvas.height;
  var offX = (cw - ISING_SIZE * isingCell) / 2;
  var offY = (ch - ISING_SIZE * isingCell) / 2;
  if (offX < 0) offX = 0;
  if (offY < 0) offY = 0;
  var endX = offX + ISING_SIZE * isingCell;
  var endY = offY + ISING_SIZE * isingCell;
  var alpha = active ? 0.55 : 0.18;

  isingCtx.globalAlpha = alpha;
  isingCtx.lineWidth = 1.2;
  for (var yy = offY + isingCell / 2; yy < endY; yy += step) {
    for (var xx = offX + isingCell / 2; xx < endX; xx += step) {
      // field from N and S poles (dipole approximation)
      var dxN = xx - nx, dyN = yy - ny;
      var r2N = dxN * dxN + dyN * dyN + 8;
      var dxS = xx - sx, dyS = yy - sy;
      var r2S = dxS * dxS + dyS * dyS + 8;
      var fx = (dxN / r2N) * 300 - (dxS / r2S) * 300;
      var fy = (dyN / r2N) * 300 - (dyS / r2S) * 300;
      var flen = Math.sqrt(fx * fx + fy * fy);
      if (flen < 1) continue;
      var maxLen = isingCell * 1.8;
      if (flen > maxLen) { fx *= maxLen / flen; fy *= maxLen / flen; }
      var arrowLen = Math.sqrt(fx * fx + fy * fy);
      if (arrowLen < 2) continue;
      // color: cyan for outward (N), magenta for inward (S)
      var dot = fx; // positive = rightward = toward S
      isingCtx.strokeStyle = dot > 0 ? 'rgba(0,240,255,0.7)' : 'rgba(255,78,205,0.7)';
      isingCtx.beginPath();
      isingCtx.moveTo(xx, yy);
      isingCtx.lineTo(xx + fx, yy + fy);
      isingCtx.stroke();
      // arrow head
      var head = arrowLen * 0.25;
      var ang = Math.atan2(fy, fx);
      isingCtx.beginPath();
      isingCtx.moveTo(xx + fx, yy + fy);
      isingCtx.lineTo(xx + fx - head * Math.cos(ang - 0.5), yy + fy - head * Math.sin(ang - 0.5));
      isingCtx.lineTo(xx + fx - head * Math.cos(ang + 0.5), yy + fy - head * Math.sin(ang + 0.5));
      isingCtx.closePath();
      isingCtx.fillStyle = isingCtx.strokeStyle;
      isingCtx.fill();
    }
  }
  isingCtx.globalAlpha = 1.0;
}

function updateLatticeM() {
  if (!isingSpins.length || !isingSpins[0]) return;
  var sum = 0;
  var n2 = ISING_SIZE * ISING_SIZE;
  for (var i = 0; i < ISING_SIZE; i++)
    for (var j = 0; j < ISING_SIZE; j++) sum += isingSpins[i][j];
  var m = sum / n2;
  var el = document.getElementById('live-lattice-M');
  if (el) el.textContent = m.toFixed(3);
}

function updateAmbientBar() {
  var elAmbMat = document.getElementById('amb-mat');
  if (elAmbMat) elAmbMat.textContent = magState.material;
  var elAmbTemp = document.getElementById('amb-temp');
  if (elAmbTemp) elAmbTemp.textContent = magState.T;
  var elAmbH = document.getElementById('amb-h');
  if (elAmbH) elAmbH.textContent = magState.H.toFixed(2);
  var elAmbM = document.getElementById('amb-m');
  if (elAmbM) {
    var m = 0;
    if (isingSpins.length) {
      var sum = 0;
      for (var i = 0; i < ISING_SIZE; i++)
        for (var j = 0; j < ISING_SIZE; j++) sum += isingSpins[i][j];
      m = sum / (ISING_SIZE * ISING_SIZE);
    }
    elAmbM.textContent = m.toFixed(3);
  }
  var elAmbState = document.getElementById('amb-state');
  if (elAmbState) {
    var st = '';
    if (magState.TN > 0 && magState.T < magState.TN) st = 'Antiferro';
    else if (magState.Tc > 0 && magState.T < magState.Tc) st = 'Ferro';
    else st = 'Paramagnetic';
    elAmbState.textContent = st;
  }
  var elInfo = document.getElementById('lattice-info');
  if (elInfo) elInfo.textContent = '20×20 Ising · ' + magState.material + ' · T=' + magState.T + 'K · H=' + magState.H.toFixed(2);
}

/* ========== LIVE READOUT ========== */
function magComputeState() {
  var label = '', color = '';
  if (magState.TN > 0 && magState.T < magState.TN) { label = 'Antiferromagnetic'; color = '#4ade80'; }
  else if (magState.Tc > 0 && magState.T < magState.Tc) { label = 'Ferromagnetic'; color = '#00f0ff'; }
  else { label = 'Paramagnetic'; color = '#8080a0'; }
  return { label: label, color: color };
}

function updateLatticeReadout() {
  var elT = document.getElementById('live-lattice-T');
  if (elT) elT.textContent = magState.T + ' K';
  var elM = document.getElementById('live-lattice-M');
  if (elM) {
    if (!isingSpins.length || !isingSpins[0]) { elM.textContent = '—'; }
    else {
      var sum = 0;
      for (var i = 0; i < ISING_SIZE; i++)
        for (var j = 0; j < ISING_SIZE; j++) sum += isingSpins[i][j];
      elM.textContent = (sum / (ISING_SIZE * ISING_SIZE)).toFixed(3);
    }
  }
  var elSt = document.getElementById('live-lattice-state');
  if (elSt) {
    var st = magComputeState();
    elSt.innerHTML = '<span style="color:' + st.color + ';font-weight:600;">' + st.label + '</span>';
  }
}

function updateLiveMAG() {
  var elChi = document.getElementById('live-chi');
  if (elChi) {
    var chi;
    var mat = MAG_MATERIALS[magState.material];
    if (mat && mat.type === 'dia') {
      chi = -0.001;
    } else if (magState.TN > 0) {
      chi = chiAntiferro(magState.T, magState.TN, magState.C);
    } else if (magState.Tc > 0) {
      chi = chiCurieWeiss(magState.T, magState.C, magState.theta);
    } else if (mat && mat.type === 'pauli') {
      chi = 0.003;
    } else {
      chi = chiCurie(magState.T, magState.C);
    }
    elChi.textContent = (chi === null || typeof chi === 'undefined') ? '—' : chi.toFixed(4);
  }

  var Tc = magState.Tc, TN = magState.TN, T = magState.T;
  var orderedTc = Tc > 1 && T < Tc;
  var orderedTN = TN > 1 && T < TN;
  var ordered = orderedTc || orderedTN;
  var t_ratio = Tc > 1 ? Math.min(T / Tc, 1) : 1;
  var Hc_eff = ordered ? (magState.Hc * Math.pow(1 - t_ratio, 0.5) * Math.abs(magState.J)) : 0;
  var elHc = document.getElementById('live-Hc');
  if (elHc) elHc.textContent = Hc_eff.toFixed(3);

  var elMr = document.getElementById('live-Mr');
  if (elMr) {
    var Mr_eff = orderedTc ? (magState.Mr * Math.pow(1 - t_ratio, 0.45)) : 0;
    elMr.textContent = Mr_eff.toFixed(3);
  }

  var elM = document.getElementById('live-M');
  if (elM) {
    var Ms = magState.Ms || 1;
    elM.textContent = (magnetization(T, Tc, Ms) / Ms).toFixed(3) + ' M_s';
  }

  var elHf = document.getElementById('live-Hf');
  if (elHf) elHf.textContent = magState.H.toFixed(3);

  var elTN = document.getElementById('live-TN');
  if (elTN) {
    var ratio = magState.Tc > 0 ? (magState.TN / magState.Tc).toFixed(2) : (magState.TN > 0 ? magState.TN + ' K' : '—');
    elTN.textContent = magState.TN > 0 ? magState.TN + ' K / Tc=' + ratio : 'FM / TN=0';
  }

  var elState = document.getElementById('live-mag-state');
  if (elState) {
    var st = magComputeState();
    elState.innerHTML = '<span style="color:' + st.color + ';font-weight:600;">' + st.label + '</span>';
  }

  updateLatticeReadout();
}

/* ========== MATERIAL PRESETS ========== */
function setMagMaterial(name) {
  var mat = MAG_MATERIALS[name];
  if (!mat) return;
  magState.Tc = mat.Tc;
  magState.TN = mat.TN || 0;
  magState.Ms = mat.Ms;
  magState.Hc = mat.Hc;
  magState.Mr = (typeof mat.Mr !== 'undefined') ? mat.Mr : (mat.Ms * 0.4);
  magState.J = (typeof mat.J !== 'undefined') ? mat.J : 1.0;
  magState.material = name;

  // read-only property display (no sliders)
  function setText(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }
  setText('val-Tc', mat.Tc);
  setText('val-TN', (mat.TN || 0));
  setText('val-Ms', (typeof mat.Ms !== 'undefined' ? mat.Ms : 0).toFixed(2));
  setText('val-Hc', (typeof mat.Hc !== 'undefined' ? mat.Hc : 0).toFixed(2));
  setText('val-Mr', ((typeof mat.Mr !== 'undefined' ? mat.Mr : mat.Ms * 0.4)).toFixed(2));
  setText('val-J', ((typeof mat.J !== 'undefined' ? mat.J : 1.0)).toFixed(1));
  setText('val-J-slider', ((typeof mat.J !== 'undefined' ? mat.J : 1.0)).toFixed(2));
  setText('val-C', magState.C.toFixed(2));
  var newTheta = 0;
  if (mat.TN > 0) newTheta = -mat.TN;
  else if (mat.Tc > 0) newTheta = mat.Tc;
  magState.theta = newTheta;
  setText('val-theta', newTheta);

  // active button
  document.querySelectorAll('.mat-btn').forEach(function(btn) { btn.classList.remove('active'); });
  var activeBtn = document.getElementById('btn-' + name);
  if (activeBtn) activeBtn.classList.add('active');

  // Sync J slider to material preset
  var elJ = document.getElementById('slider-J');
  if (elJ) elJ.value = magState.J;

  // material switch clears phonon / resets lattice only if lattice sub-tab is visible
  if (typeof destroyIsing === 'function') destroyIsing();
  if (typeof initIsing === 'function' && isLatticeSubtabVisible()) initIsing();

  plotSusceptibility();
  plotMagnetizationCurve();
  plotHysteresis();
  plotLandauGM();
  plotMagnonDispersion();
  updateLiveMAG();
}

/* ========== INIT & SLIDERS ========== */
function initMagnetism() {
  // Only wire sliders that exist in the DOM.  All material parameters are set via presets.
  var elT = document.getElementById('slider-T-mag');
  var elH = document.getElementById('slider-H');
  var elJ = document.getElementById('slider-J');

  if (elT) {
    elT.addEventListener('input', function() {
      magState.T = parseFloat(this.value);
      var elVal = document.getElementById('val-T-mag');
      if (elVal) elVal.textContent = magState.T;
      // Temperature changes affect every macroscopic plot and the live readout
      plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); plotLandauGM();
      plotMagnonDispersion(); updateLiveMAG();
      // Lattice needs a redraw only if running (state label/color may change)
      if (isingCtx) drawIsing();
    });
  }
  if (elH) {
    elH.addEventListener('input', function() {
      magState.H = parseFloat(this.value);
      var elVal = document.getElementById('val-H');
      if (elVal) elVal.textContent = magState.H.toFixed(3);
      plotHysteresis(); plotLandauGM(); updateLiveMAG();
      if (isingCtx) drawIsing();
    });
  }
  if (elJ) {
    elJ.addEventListener('input', function() {
      magState.J = parseFloat(this.value);
      var mat = MAG_MATERIALS[magState.material] || { Tc: 1043, TN: 0 };
      // Scale transition temperatures with |J| (mean-field Tc ~ z|J|S²/kB)
      if (mat.Tc > 0) magState.Tc = mat.Tc * Math.abs(magState.J);
      if (mat.TN > 0) magState.TN = mat.TN * Math.abs(magState.J);
      // For AFM, theta is negative; for FM, theta = Tc; otherwise 0
      if (mat.TN > 0) magState.theta = -magState.TN;
      else if (mat.Tc > 0) magState.theta = magState.Tc;
      else magState.theta = 0;
      var elVal = document.getElementById('val-J');
      if (elVal) elVal.textContent = magState.J.toFixed(2);
      var elValSlider = document.getElementById('val-J-slider');
      if (elValSlider) elValSlider.textContent = magState.J.toFixed(2);
      // Sync property readouts with scaled transition temperatures
      var setText = function(id, txt){ var e = document.getElementById(id); if (e) e.textContent = txt; };
      setText('val-Tc', magState.Tc.toFixed(0));
      setText('val-TN', magState.TN.toFixed(0));
      setText('val-theta', magState.theta.toFixed(0));
      // Reinitialize lattice only if the lattice sub-tab is visible; otherwise leave it stopped
      if (typeof destroyIsing === 'function') destroyIsing();
      if (typeof initIsing === 'function' && isLatticeSubtabVisible()) initIsing();
      plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); plotLandauGM(); plotMagnonDispersion();
      updateLiveMAG();
      if (isingCtx) drawIsing();
    });
  }

  plotSusceptibility(); plotMagnetizationCurve(); plotHysteresis(); plotLandauGM(); updateLiveMAG();
  plotMagnonDispersion(); // static plot on load

  // magnet toggle checkbox + strength slider
  var elMagChk = document.getElementById('magnet-toggle-check');
  if (elMagChk) elMagChk.addEventListener('change', function() {
    toggleMagnet();
    if (isingCtx) drawIsing();
  });

  var elStr = document.getElementById('slider-magnet-strength');
  if (elStr) {
    elStr.addEventListener('input', function() {
      barMagnet.strength = parseFloat(this.value);
      var elVal = document.getElementById('val-magnet-strength');
      if (elVal) elVal.textContent = barMagnet.strength.toFixed(2);
      if (isingCtx) drawIsing();
    });
  }

  // spin-wave buttons are handled via inline onclick in the HTML
  // (no addEventListener needed to avoid double-firing with onclick)

  // Ising lattice animation is started by magSubTab('lattice') in index.html
  // when the user first enters the Lattice sub-tab.
}

function toggleMagnet() {
  barMagnet.active = !barMagnet.active;
  var chk = document.getElementById('magnet-toggle-check');
  if (chk) chk.checked = barMagnet.active;
  drawIsing();
}

/* ========== EXPORTS ========== */
window.initMagnetism = initMagnetism;
window.setMagMaterial = setMagMaterial;
window.destroyIsing = destroyIsing;
window.initIsing = initIsing;
window.toggleMagnet = toggleMagnet;
window.toggleSpinWaveMode = toggleSpinWaveMode;
window.injectMagnon = injectMagnon;
window.plotLandauGM = plotLandauGM;
window.plotMagnonDispersion = plotMagnonDispersion;

// Init is now called lazily by the deferred init script in index.html
// when the user first visits the Playground tab.

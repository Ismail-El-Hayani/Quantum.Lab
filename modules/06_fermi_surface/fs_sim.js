/**
 * Fermi Surface & Fermi-Dirac Statistics — Physics Engine (v2)
 * Temperature-dependent occupation, 3D wireframe Fermi surface, chemical potential.
 * Units: energy in eV, temperature in K.
 */

'use strict';

// ============ CONSTANTS ============
const kB_eV = 8.617333e-5;

// ============ STATE ============
let state = {
  T: 300,
  EF: 5.0,
  n: 1e28,
  showClassical: false,
  animating: false,
  animFrame: null,
  time: 0
};

// ============ PHYSICS ============
function fermiDirac(E, mu, T) {
  if (T <= 0) return E < mu ? 1 : (E > mu ? 0 : 0.5);
  const x = (E - mu) / (kB_eV * T);
  if (x > 20) return 0;
  if (x < -20) return 1;
  return 1 / (1 + Math.exp(x));
}

function maxwellBoltzmann(E, mu, T) {
  if (T <= 0) return 0;
  return Math.exp(-(E - mu) / (kB_eV * T));
}

function chemicalPotential(EF, T) {
  const TF = EF / kB_eV;
  if (T > TF * 0.5) return EF * 0.5;
  const r = kB_eV * T / EF;
  return EF * (1 - (Math.PI * Math.PI / 12) * r * r);
}

function fermiWavevector(EF) {
  return Math.sqrt(2 * EF);
}

function fermiVelocity(EF) {
  return Math.sqrt(2 * EF);
}

function deBroglie(T) {
  const m = 9.109e-31;
  const kB = 1.381e-23;
  const h = 6.626e-34;
  return (h / Math.sqrt(2 * Math.PI * m * kB * T)) * 1e9;
}

// ============ PLOTTING ============
const PLOT_CFG = { responsive: true, displayModeBar: false };

function layout(title, xtitle, ytitle, extra) {
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

// ===== A. PLAYGROUND =====
function plotFD() {
  const mu = chemicalPotential(state.EF, state.T);
  const E = [];
  const f_FD = [];
  const f_MB = [];
  const dE = 0.02;
  const Emax = state.EF * 2.5;

  for (let e = -state.EF * 0.5; e <= Emax; e += dE) {
    E.push(e);
    f_FD.push(fermiDirac(e, mu, state.T));
    if (state.showClassical) f_MB.push(maxwellBoltzmann(e, mu, state.T));
  }

  const traces = [
    { x: E, y: f_FD, mode: 'lines', name: 'Fermi-Dirac',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    }
  ];
  if (state.showClassical) {
    traces.push({ x: E, y: f_MB, mode: 'lines', name: 'Maxwell-Boltzmann',
      line: { color: '#ff4ecd', width: 2, dash: 'dot' }
    });
  }

  // T=0 reference
  const T0 = E.map(e => e < state.EF ? 1 : 0);
  traces.push({ x: E, y: T0, mode: 'lines', name: 'T = 0 step',
    line: { color: 'rgba(255,255,255,0.2)', width: 1.5, dash: 'dash' }
  });

  // μ marker
  traces.push({ x: [mu, mu], y: [0, 1.1], mode: 'lines', name: 'μ(T)',
    line: { color: '#ffd740', width: 1.5 }
  });

  _plot('plot-fd', traces, layout(null, 'E (eV)', 'f(E)'), PLOT_CFG);
}

function plotdFdE() {
  const mu = chemicalPotential(state.EF, state.T);
  const E = [];
  const df = [];
  const dE = 0.02;
  const width = 3 * kB_eV * state.T;

  for (let e = mu - width; e <= mu + width; e += dE) {
    E.push(e);
    const x = (e - mu) / (kB_eV * state.T);
    const ex = Math.exp(x);
    const val = ex / ((1 + ex) * (1 + ex)) / (kB_eV * state.T);
    df.push(val);
  }

  _plot('plot-dfdE', [
    { x: E, y: df, mode: 'lines', name: '-∂f/∂E',
      line: { color: '#4ade80', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.08)'
    }
  ], layout(null, 'E - μ (eV)', '-∂f/∂E (eV⁻¹)'), PLOT_CFG);
}

function plotFermiSurface() {
  // Wireframe sphere + thermal smearing visualization
  const kF = fermiWavevector(state.EF);
  const mu = chemicalPotential(state.EF, state.T);

  // Create wireframe sphere
  const N = 30;
  const wireframe = [];

  // Latitude lines
  for (let i = 0; i <= N; i += 3) {
    const theta = Math.PI * i / N;
    const x = [], y = [], z = [];
    for (let j = 0; j <= N; j++) {
      const phi = 2 * Math.PI * j / N;
      x.push(kF * Math.sin(theta) * Math.cos(phi));
      y.push(kF * Math.sin(theta) * Math.sin(phi));
      z.push(kF * Math.cos(theta));
    }
    wireframe.push({
      type: 'scatter3d', mode: 'lines',
      x: x, y: y, z: z,
      line: { color: 'rgba(0,240,255,0.4)', width: 1.5 },
      hoverinfo: 'skip', showlegend: false
    });
  }

  // Longitude lines
  for (let j = 0; j <= N; j += 3) {
    const phi = 2 * Math.PI * j / N;
    const x = [], y = [], z = [];
    for (let i = 0; i <= N; i++) {
      const theta = Math.PI * i / N;
      x.push(kF * Math.sin(theta) * Math.cos(phi));
      y.push(kF * Math.sin(theta) * Math.sin(phi));
      z.push(kF * Math.cos(theta));
    }
    wireframe.push({
      type: 'scatter3d', mode: 'lines',
      x: x, y: y, z: z,
      line: { color: 'rgba(0,240,255,0.4)', width: 1.5 },
      hoverinfo: 'skip', showlegend: false
    });
  }

  // Thermal smearing shell (slightly larger sphere, translucent)
  if (state.T > 0) {
    const kT = Math.sqrt(2 * (state.EF + 2 * kB_eV * state.T));
    const xs = [], ys = [], zs = [];
    for (let i = 0; i <= N; i += 2) {
      const theta = Math.PI * i / N;
      for (let j = 0; j <= N; j += 2) {
        const phi = 2 * Math.PI * j / N;
        xs.push(kT * Math.sin(theta) * Math.cos(phi));
        ys.push(kT * Math.sin(theta) * Math.sin(phi));
        zs.push(kT * Math.cos(theta));
      }
    }
    wireframe.push({
      type: 'scatter3d', mode: 'markers',
      x: xs, y: ys, z: zs,
      marker: { size: 2, color: 'rgba(255,78,205,0.15)' },
      hoverinfo: 'skip', showlegend: false
    });
  }

  _plot('plot-sphere', wireframe, {
    margin: { t: 20, r: 10, b: 20, l: 10 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    scene: {
      xaxis: { visible: false, range: [-kF*1.5, kF*1.5] },
      yaxis: { visible: false, range: [-kF*1.5, kF*1.5] },
      zaxis: { visible: false, range: [-kF*1.5, kF*1.5] },
      camera: { eye: { x: 1.5, y: 1.2, z: 1.0 } },
      bgcolor: 'rgba(0,0,0,0)',
      aspectmode: 'cube'
    },
    showlegend: false,
    annotations: [{
      x: 0.5, y: 0.95, xref: 'paper', yref: 'paper',
      text: 'k_F = ' + kF.toFixed(2) + ' nm⁻¹',
      font: { color: '#4ade80', size: 12 },
      showarrow: false
    }]
  }, PLOT_CFG);
}

function plotOccupiedStates() {
  // 2D slice showing occupied (blue) vs empty (dark) states in k-space
  const kx = [], ky = [], color = [];
  const kF = fermiWavevector(state.EF);
  const mu = chemicalPotential(state.EF, state.T);
  const dk = 0.15;

  for (let i = -3; i <= 3; i += dk) {
    for (let j = -3; j <= 3; j += dk) {
      kx.push(i);
      ky.push(j);
      const E = (i*i + j*j) / 2;  // E = k²/2 in natural units
      const f = fermiDirac(E, mu, state.T);
      color.push(f);
    }
  }

  _plot('plot-occ', [{
    type: 'scatter', mode: 'markers',
    x: kx, y: ky,
    marker: {
      size: 6,
      color: color,
      colorscale: [[0, 'rgba(0,0,0,0)'], [0.5, '#505070'], [1, '#00f0ff']],
      showscale: false
    },
    hoverinfo: 'skip'
  }], {
    margin: { t: 20, r: 10, b: 40, l: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { title: 'kx (π/a)', color: '#505070', range: [-3, 3] },
    yaxis: { title: 'ky (π/a)', color: '#505070', range: [-3, 3] },
    aspectratio: { x: 1, y: 1 }
  }, PLOT_CFG);
}

function updateLiveTable() {
  const mu = chemicalPotential(state.EF, state.T);
  const kF = fermiWavevector(state.EF);
  const TF = state.EF / kB_eV;
  const lambda = deBroglie(state.T);

  var elT = document.getElementById('live-T');
  if (elT) elT.textContent = state.T + ' K';
  var elEF = document.getElementById('live-EF');
  if (elEF) elEF.textContent = state.EF.toFixed(2) + ' eV';
  var elMu = document.getElementById('live-mu');
  if (elMu) elMu.textContent = mu.toFixed(3) + ' eV';
  var elKF = document.getElementById('live-kF');
  if (elKF) elKF.textContent = kF.toFixed(2) + ' nm⁻¹';
  var elTF = document.getElementById('live-TF');
  if (elTF) elTF.textContent = (TF / 1e4).toFixed(1) + '×10⁴ K';
  var elL = document.getElementById('live-lambda');
  if (elL) elL.textContent = lambda.toFixed(1) + ' nm';
  var elDeg = document.getElementById('live-degen');
  if (elDeg) elDeg.textContent = (TF / state.T).toFixed(0);
}

// ===== C. APPLICATIONS =====
function plotPauli() {
  const T = [];
  const chi = [];
  for (let t = 1; t <= 1000; t += 10) {
    T.push(t);
    const mu = chemicalPotential(state.EF, t);
    const g_mu = Math.sqrt(Math.max(mu, 0));
    chi.push(g_mu);
  }

  _plot('plot-pauli', [
    { x: T, y: chi, mode: 'lines', name: 'χ_Pauli',
      line: { color: '#ff4ecd', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(255,78,205,0.08)'
    }
  ], layout(null, 'T (K)', 'χ (arb. units)'), PLOT_CFG);
}

function plotThermionic() {
  const phi = 4.5;
  const T = [];
  const J = [];
  for (let t = 500; t <= 3000; t += 50) {
    T.push(t);
    J.push(t * t * Math.exp(-phi / (kB_eV * t)));
  }
  const Jmax = Math.max(...J);

  _plot('plot-thermionic', [
    { x: T, y: J.map(j => j / Jmax), mode: 'lines', name: 'J / J_max',
      line: { color: '#ffd740', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(255,215,64,0.08)'
    }
  ], layout(null, 'T (K)', 'Normalized current'), PLOT_CFG);
}

function plotWhiteDwarf() {
  const n = [];
  const P = [];
  for (let ni = 1e27; ni <= 1e36; ni *= 1.5) {
    n.push(ni);
    P.push(Math.pow(ni, 5/3));
  }

  _plot('plot-wd', [
    { x: n.map(x => x / 1e30), y: P.map(x => x / 1e50), mode: 'lines', name: 'P ∝ n^{5/3}',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    }
  ], layout(null, 'n (10³⁰ m⁻³)', 'P (10⁵⁰ arb. units)'), PLOT_CFG);
}

// ============ INIT ============
function initFS() {
  var sliderT = document.getElementById('slider-T');
  var sliderEF = document.getElementById('slider-EF');
  var btnClassical = document.getElementById('btn-classical');

  if (sliderT) {
    sliderT.addEventListener('input', function() {
      state.T = parseFloat(this.value);
      var el = document.getElementById('val-T');
      if (el) el.textContent = state.T + ' K';
      plotFD(); plotdFdE(); plotFermiSurface(); plotOccupiedStates(); updateLiveTable();
    });
  }

  if (sliderEF) {
    sliderEF.addEventListener('input', function() {
      state.EF = parseFloat(this.value);
      var el = document.getElementById('val-EF');
      if (el) el.textContent = state.EF.toFixed(1) + ' eV';
      plotFD(); plotdFdE(); plotFermiSurface(); plotOccupiedStates(); updateLiveTable();
    });
  }

  if (btnClassical) {
    btnClassical.addEventListener('click', function() {
      state.showClassical = !state.showClassical;
      this.classList.toggle('active', state.showClassical);
      plotFD();
    });
  }

  plotFD(); plotdFdE(); plotFermiSurface(); plotOccupiedStates();
  plotPauli(); plotThermionic(); plotWhiteDwarf();
  updateLiveTable();
}

initFS();
window.initFS = initFS;

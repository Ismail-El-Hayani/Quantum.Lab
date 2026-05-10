/**
 * Energy Bands & Density of States — Physics Engine (v2)
 * Tight-binding band structure, DOS, Brillouin zone, ARPES simulation.
 * Units: ħ = 1, energy in eV, length in lattice constant a.
 */

'use strict';

// ============ STATE ============
let state = {
  dim: '3D',       // '1D', '2D', '3D', 'graphene'
  t: 1.0,          // hopping parameter
  eps: 0.0,        // on-site energy
  Emax: 6,
  showBZ: true,
  kPath: 'GMKG'    // high-symmetry path for 2D hex
};

// ============ PHYSICS ============
// 1D chain: E(k) = ε + 2t cos(ka)
function band1D(k) {
  return state.eps + 2 * state.t * Math.cos(k);
}

// 2D square: E(kx,ky) = ε + 2t[cos(kx a) + cos(ky a)]
function band2D(kx, ky) {
  return state.eps + 2 * state.t * (Math.cos(kx) + Math.cos(ky));
}

// 3D cubic: E = ε + 2t[cos(kx) + cos(ky) + cos(kz)]
function band3D(kx, ky, kz) {
  return state.eps + 2 * state.t * (Math.cos(kx) + Math.cos(ky) + Math.cos(kz));
}

// Graphene (2D hexagonal): using tight-binding on honeycomb lattice
// E±(k) = ±t|f(k)| where f(k) = Σ e^{ik·δj}
// Simplified: use nearest-neighbor sum
function bandGraphene(kx, ky) {
  // Honeycomb lattice vectors (a = 1)
  const delta = [
    [1, 0], [-0.5, Math.sqrt(3)/2], [-0.5, -Math.sqrt(3)/2]
  ];
  let f_re = 0, f_im = 0;
  for (let d of delta) {
    const kdot = kx * d[0] + ky * d[1];
    f_re += Math.cos(kdot);
    f_im += Math.sin(kdot);
  }
  const f_mag = Math.sqrt(f_re * f_re + f_im * f_im);
  return [state.t * f_mag, -state.t * f_mag];  // [conduction, valence]
}

// DOS by sampling
function computeDOS(dim, N) {
  const E = [];
  const dos = [];
  const dE = state.Emax / 200;
  
  for (let e = -state.Emax; e <= state.Emax; e += dE) {
    E.push(e);
    dos.push(0);
  }
  
  // Sample k-points in Brillouin zone
  let count = 0;
  const dk = Math.PI / N;
  
  if (dim === '1D') {
    for (let k = -Math.PI; k <= Math.PI; k += dk) {
      const e = band1D(k);
      const idx = Math.floor((e + state.Emax) / dE);
      if (idx >= 0 && idx < dos.length) dos[idx] += 1;
      count++;
    }
  } else if (dim === '2D') {
    for (let kx = -Math.PI; kx <= Math.PI; kx += dk) {
      for (let ky = -Math.PI; ky <= Math.PI; ky += dk) {
        const e = band2D(kx, ky);
        const idx = Math.floor((e + state.Emax) / dE);
        if (idx >= 0 && idx < dos.length) dos[idx] += 1;
        count++;
      }
    }
  } else if (dim === '3D') {
    for (let kx = -Math.PI; kx <= Math.PI; kx += dk) {
      for (let ky = -Math.PI; ky <= Math.PI; ky += dk) {
        for (let kz = -Math.PI; kz <= Math.PI; kz += dk) {
          const e = band3D(kx, ky, kz);
          const idx = Math.floor((e + state.Emax) / dE);
          if (idx >= 0 && idx < dos.length) dos[idx] += 1;
          count++;
        }
      }
    }
  } else if (dim === 'graphene') {
    for (let kx = -Math.PI; kx <= Math.PI; kx += dk) {
      for (let ky = -Math.PI; ky <= Math.PI; ky += dk) {
        const bands = bandGraphene(kx, ky);
        for (let e of bands) {
          const idx = Math.floor((e + state.Emax) / dE);
          if (idx >= 0 && idx < dos.length) dos[idx] += 1;
        }
        count += 2;
      }
    }
  }
  
  // Normalize
  const norm = dos.map(d => d / (count * dE));
  return { E, dos: norm };
}

// ============ PLOTTING ============
function _plot(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}

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
function plotBandStructure() {
  // High-symmetry path: Γ → M → K → Γ for 2D hex
  // For 1D: just -π to π
  // For 2D square: Γ → X → M → Γ
  // For 3D: show along (100) direction
  
  const k = [];
  const E = [];
  const labels = [];
  const positions = [];
  
  if (state.dim === '1D') {
    for (let ki = -Math.PI; ki <= Math.PI; ki += 0.02) {
      k.push(ki);
      E.push(band1D(ki));
    }
    labels = ['-π/a', '0', 'π/a'];
    positions = [0, Math.PI, 2*Math.PI];
  } else if (state.dim === '2D') {
    // Γ(0,0) → X(π,0) → M(π,π) → Γ(0,0)
    const path = [
      {k: [0,0], label: 'Γ'},
      {k: [Math.PI,0], label: 'X'},
      {k: [Math.PI,Math.PI], label: 'M'},
      {k: [0,0], label: 'Γ'}
    ];
    let s = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const N = 50;
      const k1 = path[i].k, k2 = path[i+1].k;
      for (let j = 0; j < N; j++) {
        const frac = j / N;
        const kx = k1[0] + frac * (k2[0] - k1[0]);
        const ky = k1[1] + frac * (k2[1] - k1[1]);
        k.push(s + frac);
        E.push(band2D(kx, ky));
      }
      labels.push(path[i].label);
      positions.push(s);
      s += 1;
    }
    labels.push('Γ');
    positions.push(s);
  } else if (state.dim === 'graphene') {
    // Γ → M → K → Γ for hexagonal
    const a = 1;
    const M = [Math.PI/a, -Math.PI/(Math.sqrt(3)*a)];
    const K = [4*Math.PI/(3*a), 0];
    const path = [
      {k: [0,0], label: 'Γ'},
      {k: M, label: 'M'},
      {k: K, label: 'K'},
      {k: [0,0], label: 'Γ'}
    ];
    let s = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const N = 60;
      const k1 = path[i].k, k2 = path[i+1].k;
      for (let j = 0; j < N; j++) {
        const frac = j / N;
        const kx = k1[0] + frac * (k2[0] - k1[0]);
        const ky = k1[1] + frac * (k2[1] - k1[1]);
        const bands = bandGraphene(kx, ky);
        k.push(s + frac);
        E.push(bands[0]);  // conduction
        if (!E.valence) E.valence = [];
        E.valence.push(bands[1]);  // valence
      }
      labels.push(path[i].label);
      positions.push(s);
      s += 1;
    }
    labels.push('Γ');
    positions.push(s);
  } else {
    // 3D: show along (111) direction
    for (let ki = 0; ki <= Math.PI * Math.sqrt(3); ki += 0.02) {
      const f = ki / (Math.PI * Math.sqrt(3));
      const kx = f * Math.PI, ky = f * Math.PI, kz = f * Math.PI;
      k.push(ki);
      E.push(band3D(kx, ky, kz));
    }
  }
  
  const traces = [
    { x: k, y: E, mode: 'lines', name: 'E(k)',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.05)'
    }
  ];
  
  if (state.dim === 'graphene') {
    traces.push({
      x: k, y: E.valence || E.map(() => 0),
      mode: 'lines', name: 'Valence',
      line: { color: '#ff4ecd', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(255,78,205,0.05)'
    });
  }
  
  const lay = layout(null, 'k-path', 'E (eV)');
  if (labels.length > 0) {
    lay.xaxis.tickvals = positions;
    lay.xaxis.ticktext = labels;
  }
  
  _plot('plot-bands', traces, lay, PLOT_CFG);
}

function plotDOS() {
  const result = computeDOS(state.dim, state.dim === '3D' ? 20 : 40);
  
  _plot('plot-dos', [
    { x: result.E, y: result.dos, mode: 'lines', name: 'g(E)',
      line: { color: '#c084fc', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(179,136,255,0.08)'
    }
  ], layout(null, 'E (eV)', 'DOS (arb. units)'), PLOT_CFG);
}

function plotBZ() {
  if (state.dim === '1D') {
    // 1D BZ: line from -π to π
    const x = [];
    for (let i = -Math.PI; i <= Math.PI; i += 0.1) x.push(i);
    _plot('plot-bz', [
      { x: x, y: x.map(() => 0), mode: 'lines', line: { color: '#4ade80', width: 3 } }
    ], {
      margin: { t: 20, r: 10, b: 40, l: 40 },
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: { title: 'k (π/a)', color: '#505070', range: [-1.2, 1.2] },
      yaxis: { visible: false, range: [-0.5, 0.5] },
      annotations: [
        { x: -1, y: 0.1, text: '-π/a', showarrow: false, font: { color: '#4ade80' } },
        { x: 1, y: 0.1, text: 'π/a', showarrow: false, font: { color: '#4ade80' } }
      ]
    }, PLOT_CFG);
  } else if (state.dim === '2D') {
    // 2D square BZ
    const square = { type: 'scatter', mode: 'lines',
      x: [-Math.PI, Math.PI, Math.PI, -Math.PI, -Math.PI],
      y: [-Math.PI, -Math.PI, Math.PI, Math.PI, -Math.PI],
      line: { color: '#4ade80', width: 2 },
      fill: 'toself', fillcolor: 'rgba(74,222,128,0.05)'
    };
    _plot('plot-bz', [square], {
      margin: { t: 20, r: 10, b: 40, l: 40 },
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: { title: 'kx (π/a)', color: '#505070', range: [-1.2, 1.2] },
      yaxis: { title: 'ky (π/a)', color: '#505070', range: [-1.2, 1.2] },
      annotations: [
        { x: 0, y: 0, text: 'Γ', showarrow: false, font: { color: '#fff', size: 14 } },
        { x: 1, y: 0, text: 'X', showarrow: false, font: { color: '#4ade80' } },
        { x: 1, y: 1, text: 'M', showarrow: false, font: { color: '#4ade80' } }
      ],
      aspectratio: { x: 1, y: 1 }
    }, PLOT_CFG);
  } else if (state.dim === 'graphene') {
    // Hexagonal BZ
    const hex = [];
    for (let i = 0; i <= 6; i++) {
      const angle = i * Math.PI / 3;
      hex.push(Math.cos(angle) * 4 * Math.PI / 3);
      if (i < 6) hex.push(Math.sin(angle) * 4 * Math.PI / 3);
    }
    // Fix: use proper x,y arrays
    const hx = [], hy = [];
    for (let i = 0; i <= 6; i++) {
      const angle = i * Math.PI / 3;
      hx.push(Math.cos(angle) * 4 * Math.PI / (3 * Math.sqrt(3)));
      hy.push(Math.sin(angle) * 4 * Math.PI / (3 * Math.sqrt(3)));
    }
    _plot('plot-bz', [{
      type: 'scatter', mode: 'lines',
      x: hx, y: hy,
      line: { color: '#4ade80', width: 2 },
      fill: 'toself', fillcolor: 'rgba(74,222,128,0.05)'
    }], {
      margin: { t: 20, r: 10, b: 40, l: 40 },
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: { title: 'kx', color: '#505070' },
      yaxis: { title: 'ky', color: '#505070' },
      annotations: [
        { x: 0, y: 0, text: 'Γ', showarrow: false, font: { color: '#fff', size: 14 } },
        { x: 0, y: -0.8, text: 'M', showarrow: false, font: { color: '#4ade80' } },
        { x: 0.9, y: 0, text: 'K', showarrow: false, font: { color: '#4ade80' } }
      ],
      aspectratio: { x: 1, y: 1 }
    }, PLOT_CFG);
  } else {
    // 3D BZ: show a cube wireframe
    const cubeEdges = [
      {x: [-1,-1,-1,-1,-1,1,1,1,1,-1], y: [-1,-1,1,1,-1,-1,-1,1,1,-1], z: [-1,1,1,-1,-1,-1,1,1,-1,-1]},
      {x: [1,1], y: [-1,1], z: [1,1]},
      {x: [1,1], y: [1,1], z: [-1,1]},
      {x: [-1,1], y: [-1,-1], z: [1,1]}
    ];
    const traces = cubeEdges.map(e => ({
      type: 'scatter3d', mode: 'lines',
      x: e.x, y: e.y, z: e.z,
      line: { color: '#4ade80', width: 3 }
    }));
    _plot('plot-bz', traces, {
      margin: { t: 20, r: 10, b: 20, l: 10 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
      scene: {
        xaxis: { visible: false, range: [-1.2, 1.2] },
        yaxis: { visible: false, range: [-1.2, 1.2] },
        zaxis: { visible: false, range: [-1.2, 1.2] },
        camera: { eye: { x: 1.3, y: 1.3, z: 1.0 } },
        bgcolor: 'rgba(0,0,0,0)'
      },
      showlegend: false
    }, PLOT_CFG);
  }
}

function plotARPES() {
  // Simulate ARPES: intensity ∝ |M(k)|² × f(E) × [1-f(E+ħω)] × resolution broadening
  const kx = [];
  const E = [];
  const intensity = [];
  
  const dE = 0.05;
  const dk = 0.05;
  const T = 300;
  const kB = 8.617e-5;
  const hw = 21.2;  // He-I photon energy in eV
  
  for (let ki = -Math.PI; ki <= Math.PI; ki += dk) {
    for (let ei = -state.Emax; ei <= state.Emax; ei += dE) {
      let e_band;
      if (state.dim === '1D') e_band = band1D(ki);
      else if (state.dim === '2D') e_band = band2D(ki, 0);
      else e_band = band3D(ki, 0, 0);
      
      // Resolution broadening: Gaussian
      const sigma = 0.1;
      const delta = Math.exp(-Math.pow(ei - e_band, 2) / (2 * sigma * sigma));
      
      // Fermi occupation and probe window
      const f = 1 / (1 + Math.exp((ei - 0) / (kB * T)));
      const probe = ei < hw ? 1 : 0;
      
      const I = delta * f * probe;
      if (I > 0.01) {
        kx.push(ki);
        E.push(ei);
        intensity.push(I);
      }
    }
  }
  
  _plot('plot-arpes-main', [{
    type: 'scatter', mode: 'markers',
    x: kx, y: E,
    marker: {
      size: 3,
      color: intensity,
      colorscale: [[0, 'rgba(0,0,0,0)'], [0.5, '#c084fc'], [1, '#00f0ff']],
      showscale: false,
      opacity: 0.7
    },
    hovertemplate: 'k: %{x:.2f}<br>E: %{y:.2f} eV'
  }], layout(null, 'k (π/a)', 'E - E_F (eV)'), PLOT_CFG);
}

function updateLiveTable() {
  var elDim = document.getElementById('live-dim');
  if (elDim) elDim.textContent = state.dim;
  var elT = document.getElementById('live-t');
  if (elT) elT.textContent = state.t.toFixed(2) + ' eV';
  var elEps = document.getElementById('live-eps');
  if (elEps) elEps.textContent = state.eps.toFixed(2) + ' eV';
  var elBW = document.getElementById('live-bw');
  if (elBW) elBW.textContent = (4 * state.t).toFixed(2) + ' eV';
}

// ===== C. APPLICATIONS =====
function plotSolarCell() {
  // Solar cell absorption: α ∝ |M_cv|² × g_v(E) × g_c(E)
  const E = [];
  const alpha = [];
  const dE = 0.02;
  
  for (let e = 0; e <= state.Emax; e += dE) {
    E.push(e);
    // Joint DOS (simplified)
    const g = Math.sqrt(Math.max(e, 0));  // 3D-like
    alpha.push(g * Math.exp(-e/2));  // absorption drops at high E
  }
  
  _plot('plot-solar', [
    { x: E, y: alpha, mode: 'lines', name: 'α(ℏω)',
      line: { color: '#ffd740', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(255,215,64,0.08)'
    }
  ], layout(null, 'Photon energy (eV)', 'Absorption (arb.)'), PLOT_CFG);
}

function plotQuantumWell() {
  // Quantum well: subbands and DOS steps
  const E = [];
  const dos = [];
  const dE = 0.02;
  
  // Subband energies: E_n = (n²π²ℏ²)/(2mL²)
  const L = 5;  // nm
  const subbands = [1, 4, 9].map(n => n * Math.PI * Math.PI / (2 * L * L));
  
  for (let e = 0; e <= state.Emax; e += dE) {
    E.push(e);
    let g = 0;
    for (let Eb of subbands) {
      if (e >= Eb) g += 1;  // step at each subband
    }
    dos.push(g);
  }
  
  _plot('plot-qw', [
    { x: E, y: dos, mode: 'lines', name: 'g_2D(E)',
      line: { color: '#ff4ecd', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(255,78,205,0.08)'
    }
  ], layout(null, 'E (eV)', 'DOS (step function)'), PLOT_CFG);
}

function plotSTM() {
  // STM dI/dV ∝ local DOS at bias voltage
  const V = [];
  const dIdV = [];
  const dE = 0.02;
  
  for (let v = -state.Emax/2; v <= state.Emax/2; v += dE) {
    V.push(v);
    // Surface state (Shockley state): parabolic near Γ
    const g = Math.sqrt(Math.max(Math.abs(v), 0.01));
    dIdV.push(g);
  }
  
  _plot('plot-stm', [
    { x: V, y: dIdV, mode: 'lines', name: 'dI/dV',
      line: { color: '#4ade80', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.08)'
    }
  ], layout(null, 'Bias V (eV)', 'dI/dV (arb.)'), PLOT_CFG);
}

// ============ INIT ============
function initEB() {
  var sliderT = document.getElementById('slider-t');
  var sliderEps = document.getElementById('slider-eps');
  var btn1D = document.getElementById('btn-1d');
  var btn2D = document.getElementById('btn-2d');
  var btn3D = document.getElementById('btn-3d');
  var btnGraphene = document.getElementById('btn-graphene');

  function setDim(dim) {
    state.dim = dim;
    [btn1D, btn2D, btn3D, btnGraphene].forEach(function(b) {
      if (b) b.classList.remove('active');
    });
    if (dim === '1D' && btn1D) btn1D.classList.add('active');
    if (dim === '2D' && btn2D) btn2D.classList.add('active');
    if (dim === '3D' && btn3D) btn3D.classList.add('active');
    if (dim === 'graphene' && btnGraphene) btnGraphene.classList.add('active');
    plotBandStructure(); plotDOS(); plotBZ(); plotARPES();
    updateLiveTable();
  }

  if (sliderT) {
    sliderT.addEventListener('input', function() {
      state.t = parseFloat(this.value);
      var el = document.getElementById('val-t');
      if (el) el.textContent = state.t.toFixed(1);
      plotBandStructure(); plotDOS(); plotARPES();
      updateLiveTable();
    });
  }

  if (sliderEps) {
    sliderEps.addEventListener('input', function() {
      state.eps = parseFloat(this.value);
      var el = document.getElementById('val-eps');
      if (el) el.textContent = state.eps.toFixed(1);
      plotBandStructure(); plotDOS(); plotARPES();
      updateLiveTable();
    });
  }

  if (btn1D) btn1D.addEventListener('click', function() { setDim('1D'); });
  if (btn2D) btn2D.addEventListener('click', function() { setDim('2D'); });
  if (btn3D) btn3D.addEventListener('click', function() { setDim('3D'); });
  if (btnGraphene) btnGraphene.addEventListener('click', function() { setDim('graphene'); });

  plotBandStructure(); plotDOS(); plotBZ(); plotARPES();
  plotSolarCell(); plotQuantumWell(); plotSTM();
  updateLiveTable();
}

initEB();
window.initEB = initEB;

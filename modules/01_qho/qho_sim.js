/**
 * Quantum Harmonic Oscillator & Hydrogen Atom Physics Engine (v4)
 * Integrated 1D QHO and 3D Atomic Orbitals.
 * Natural units: m = omega = hbar = 1
 */
'use strict';

// ── PHYSICS PRIMITIVES ──────────────────────────────────────
function factorial(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function hermiteArray(n, xArr) {
  const N = xArr.length;
  if (n === 0) { const out = new Float64Array(N); for (let i = 0; i < N; i++) out[i] = 1; return out; }
  if (n === 1) { const out = new Float64Array(N); for (let i = 0; i < N; i++) out[i] = 2 * xArr[i]; return out; }
  let H0 = new Float64Array(N), H1 = new Float64Array(N), H2 = new Float64Array(N);
  for (let i = 0; i < N; i++) { H0[i] = 1; H1[i] = 2 * xArr[i]; }
  for (let k = 1; k < n; k++) {
    for (let i = 0; i < N; i++) H2[i] = 2 * xArr[i] * H1[i] - 2 * k * H0[i];
    [H0, H1, H2] = [H1, H2, H0];
  }
  return H1;
}

function psi_n(n, xArr) {
  const N = xArr.length;
  const Hn = hermiteArray(n, xArr);
  const norm = 1 / Math.sqrt(Math.pow(2, n) * factorial(n) * Math.sqrt(Math.PI));
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) out[i] = norm * Hn[i] * Math.exp(-xArr[i] * xArr[i] / 2);
  return out;
}

function energy_n(n) { return n + 0.5; }

function psi_n_time(n, xArr, t) {
  const psi = psi_n(n, xArr);
  const E = energy_n(n);
  const cosEt = Math.cos(E * t);
  const sinEt = Math.sin(E * t);
  const N = xArr.length;
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const prob = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const p = psi[i];
    re[i] = p * cosEt;
    im[i] = -p * sinEt;
    prob[i] = p * p;
  }
  return { re: re, im: im, prob: prob };
}

function psi_superposition(n, m, cn, cm, xArr, t) {
  const psiN = psi_n(n, xArr);
  const psiM = psi_n(m, xArr);
  const EN = energy_n(n), EM = energy_n(m);
  const N = xArr.length;
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const prob = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const reN = psiN[i] * Math.cos(EN * t);
    const imN = -psiN[i] * Math.sin(EN * t);
    const reM = psiM[i] * Math.cos(EM * t);
    const imM = -psiM[i] * Math.sin(EM * t);
    re[i] = cn * reN + cm * reM;
    im[i] = cn * imN + cm * imM;
    prob[i] = re[i] * re[i] + im[i] * im[i];
  }
  return { re: re, im: im, prob: prob };
}

function coherentState(alpha_re, alpha_im, xArr, t) {
  const alpha_t_re = alpha_re * Math.cos(t) + alpha_im * Math.sin(t);
  const alpha_t_im = -alpha_re * Math.sin(t) + alpha_im * Math.cos(t);
  const x0 = Math.SQRT2 * alpha_t_re;
  const p0 = Math.SQRT2 * alpha_t_im;
  const N = xArr.length;
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const prob = new Float64Array(N);
  const pref = 1 / Math.pow(Math.PI, 0.25);
  for (let i = 0; i < N; i++) {
    const dx = xArr[i] - x0;
    const envelope = pref * Math.exp(-dx * dx / 2);
    const phase = p0 * xArr[i] - p0 * x0 / 2;
    re[i] = envelope * Math.cos(phase);
    im[i] = envelope * Math.sin(phase);
    prob[i] = envelope * envelope;
  }
  return { re: re, im: im, prob: prob, x0: x0, p0: p0 };
}

// ── STATE ───────────────────────────────────────────────────
var state = {
  system: 'qho',               // 'qho' | 'atom'
  mode: 'eigenstate',          // 'eigenstate' | 'superposition' | 'coherent'
  n: 0, m: 3,
  cn: 1/Math.SQRT2, cm: 1/Math.SQRT2,
  alpha_re: 2.0, alpha_im: 0,
  time: 0,
  animating: false, animFrame: null,
  showClassical: true,
  speed: 1.0,
  omega: 1.0,
  xRange: 7,
  trajectory: []
};

function makeX() {
  const arr = [];
  for (let i = 0; i < 500; i++) arr.push(-state.xRange + i * 2 * state.xRange / 499);
  return arr;
}

function updateWavePlot() {
  if (state.system !== 'qho') return;
  const xArr = makeX();
  const t = state.time * state.omega;
  let re, im, prob, x0 = 0, p0 = 0;
  if (state.mode === 'eigenstate') {
    const psi = psi_n_time(state.n, xArr, t);
    re = psi.re; im = psi.im; prob = psi.prob;
  } else if (state.mode === 'superposition') {
    const sup = psi_superposition(state.n, state.m, state.cn, state.cm, xArr, t);
    re = sup.re; im = sup.im; prob = sup.prob;
  } else if (state.mode === 'coherent') {
    const cs = coherentState(state.alpha_re, state.alpha_im, xArr, t);
    re = cs.re; im = cs.im; prob = cs.prob; x0 = cs.x0; p0 = cs.p0;
  }
  const traces = [
    { x: xArr, y: re, name: 'Re ψ(x)', mode: 'lines', line: { color: '#00f0ff', width: 2 }, legendgroup: 're' },
    { x: xArr, y: im, name: 'Im ψ(x)', mode: 'lines', line: { color: '#ff4ecd', width: 2 }, legendgroup: 'im' },
    { x: xArr, y: prob, name: '|ψ|²', mode: 'lines', line: { color: '#ffd54f', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(255,213,79,0.15)' }
  ];
  const E = state.mode === 'eigenstate' ? energy_n(state.n) :
            state.mode === 'superposition' ? (state.cn*state.cn*energy_n(state.n) + state.cm*state.cm*energy_n(state.m)) :
            (state.alpha_re*state.alpha_re + state.alpha_im*state.alpha_im + 0.5);
  const xTP = Math.sqrt(2 * E);
  traces.push({ x: [xTP, xTP], y: [-2, 2], mode: 'lines', line: { color: '#4ade80', width: 1.5, dash: 'dot' }, showlegend: false });
  traces.push({ x: [-xTP, -xTP], y: [-2, 2], mode: 'lines', line: { color: '#4ade80', width: 1.5, dash: 'dot' }, showlegend: false });
  if (state.mode === 'coherent') {
    traces.push({ x: [x0], y: [0], mode: 'markers', marker: { size: 16, color: '#ffd54f', symbol: 'diamond', line: { color: '#fff', width: 1 } }, name: '⟨x⟩', showlegend: true });
  }
  const layout = {
    title: { text: state.mode === 'eigenstate' ? 'Eigenstate |' + state.n + '⟩' : state.mode === 'superposition' ? 'Superposition' : 'Coherent State', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x', gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55', range: [-state.xRange, state.xRange] },
    yaxis: { title: 'Amplitude', gridcolor: '#2a2a3a', range: [-1.2, 1.4] },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 20, t: 50, b: 40 }
  };
  _plot('plot-psi', traces, layout);
  updateWigner();
  updateEnergyPlot();
  updateClassicalPlot(E);
  updateReadouts(E, x0, p0, prob, xArr);
}

function updateEnergyPlot() {
  if (state.system !== 'qho') return;
  const n = state.n;
  const maxN = Math.max(10, n + 3);
  const levels = [];
  for (let k = 0; k <= maxN; k++) {
    const active = (state.mode === 'eigenstate' && k === n) || (state.mode === 'superposition' && (k === state.n || k === state.m));
    levels.push({ x: [0, 1], y: [k + 0.5, k + 0.5], mode: 'lines', line: { color: active ? '#00f0ff' : '#2a2a3a', width: active ? 3 : 1 }, showlegend: false });
  }
  _plot('plot-energy', levels, {
    title: { text: 'Energy eigenvalues Eₙ', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { visible: false, range: [0, 1] },
    yaxis: { title: 'E / ħω', gridcolor: '#2a2a3a', dtick: 1, range: [-0.2, maxN + 1] },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 20, t: 40, b: 20 }
  });
}

function updateClassicalPlot(E) {
  if (state.system !== 'qho') return;
  const t = state.time * state.omega;
  const A = Math.sqrt(2 * E / state.omega);
  const period = 2 * Math.PI / state.omega;
  const xCl = A * Math.cos(t);
  const xArr = makeX();
  const xQuantum = xArr.map(xi => {
    const Hn = hermiteArray(state.n, [xi]);
    const norm = 1 / Math.sqrt(Math.pow(2, state.n) * factorial(state.n) * Math.sqrt(Math.PI));
    const psi = norm * Hn[0] * Math.exp(-xi * xi / 2);
    return psi * psi;
  });
  _plot('plot-classical', [
    { x: xArr, y: xQuantum, mode: 'lines', name: '|ψ|² (quantum)', line: { color: '#ffd54f', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(255,213,79,0.1)' },
    { x: [xCl, xCl], y: [-0.5, 1.5], mode: 'lines', name: 'Classical x(t)', line: { color: '#4ade80', width: 2, dash: 'dot' } },
    { x: [A, A], y: [-0.5, 1.5], mode: 'lines', line: { color: '#8080a0', width: 1 }, showlegend: false },
    { x: [-A, -A], y: [-0.5, 1.5], mode: 'lines', line: { color: '#8080a0', width: 1 }, showlegend: false }
  ], {
    title: { text: 'Quantum vs Classical turning points', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x', gridcolor: '#2a2a3a', range: [-state.xRange, state.xRange] },
    yaxis: { title: 'Probability / Position', gridcolor: '#2a2a3a', range: [-0.5, 1.5] },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 20, t: 50, b: 40 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' }
  });
}

function updateWigner() {
  if (state.system !== 'qho') return;
  const n = state.n, m = state.m;
  const xG = [], pG = [];
  for (let i = 0; i < 80; i++) xG.push(-5 + i * 10 / 79);
  for (let j = 0; j < 80; j++) pG.push(-5 + j * 10 / 79);
  let W;
  if (state.mode === 'coherent') {
    const t = state.time * state.omega;
    const x0 = Math.SQRT2 * (state.alpha_re * Math.cos(t) + state.alpha_im * Math.sin(t));
    const p0 = Math.SQRT2 * (-state.alpha_re * Math.sin(t) + state.alpha_im * Math.cos(t));
    state.trajectory.push({x: x0, p: p0});
    if (state.trajectory.length > 100) state.trajectory.shift();
    W = new Array(xG.length);
    for (let i = 0; i < xG.length; i++) {
      W[i] = new Float64Array(pG.length);
      for (let j = 0; j < pG.length; j++) {
        W[i][j] = (1 / Math.PI) * Math.exp(-Math.pow(xG[i] - x0, 2) - Math.pow(pG[j] - p0, 2));
      }
    }
  } else {
    state.trajectory = [];
    W = wignerFunction(n, m, xG, pG);
  }
  const traces = [{ x: xG, y: pG, z: W, type: 'heatmap', colorscale: [[0, '#0a051a'], [0.2, '#1a0a3a'], [0.5, 'rgba(0,0,0,0)'], [0.8, '#00d4ff'], [1, '#fff']], zmid: 0, colorbar: { title: 'W(x,p)' } }];
  if (state.mode === 'coherent' && state.trajectory.length > 1) {
    traces.push({ x: state.trajectory.map(p => p.x), y: state.trajectory.map(p => p.p), mode: 'lines', line: { color: '#ffd54f', width: 2 }, showlegend: false });
  }
  _plot('plot-wigner', traces, {
    title: { text: 'Wigner Phase Space', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x', gridcolor: '#2a2a3a' }, yaxis: { title: 'p', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 80, t: 40, b: 40 }
  });
}

function wignerFunction(n, m, xGrid, pGrid) {
  const Nx = xGrid.length, Np = pGrid.length;
  const W = new Array(Nx);
  for (let i = 0; i < Nx; i++) {
    W[i] = new Float64Array(Np);
    for (let j = 0; j < Np; j++) {
      const x = xGrid[i], p = pGrid[j];
      const r2 = x * x + p * p;
      const Wnn = (Math.pow(-1, n) / Math.PI) * laguerreL(n, 2 * r2) * Math.exp(-r2);
      const Wmm = m === n ? Wnn : (Math.pow(-1, m) / Math.PI) * laguerreL(m, 2 * r2) * Math.exp(-r2);
      let Wcross = 0;
      if (m !== n) {
        const phase = Math.cos((n - m) * Math.atan2(p, x));
        const Lnm = assocLaguerre(Math.min(n,m), Math.abs(n-m), 2 * r2);
        Wcross = (2 / Math.PI) * Math.pow(r2, Math.abs(n-m)/2) * Lnm * Math.exp(-r2) * phase;
        if ((n + m) % 2 === 1) Wcross *= -1;
      }
      W[i][j] = 0.5 * (Wnn + Wmm + Wcross);
    }
  }
  return W;
}

function laguerreL(n, x) {
  if (n === 0) return 1;
  if (n === 1) return 1 - x;
  let L0 = 1, L1 = 1 - x, L2;
  for (let k = 1; k < n; k++) { L2 = ((2 * k + 1 - x) * L1 - k * L0) / (k + 1); L0 = L1; L1 = L2; }
  return L1;
}

function assocLaguerre(n, k, x) {
  if (n === 0) return 1;
  if (n === 1) return -x + k + 1;
  let L0 = 1, L1 = -x + k + 1, L2;
  for (let j = 1; j < n; j++) { L2 = ((2 * j + k + 1 - x) * L1 - (j + k) * L0) / (j + 1); L0 = L1; L1 = L2; }
  return L1;
}

/** ── EXACT HYDROGEN ATOM PHYSICS ───────────────────────────
 *  Radial: R_nl(r) = N · ρ^l · e^{-ρ/2} · L_{n-l-1}^{2l+1}(ρ),   ρ = 2r/n
 *  Angular: Real spherical harmonics Y_lm(θ,φ)
 *  Density: |ψ_nlm(r,θ,φ)|² = |R_nl(r)|² · Y_lm(θ,φ)²
 */

/* Real spherical-harmonic squared Y_lm²(θ,φ) for density plots */
function Y2_lm(l, m, theta, phi) {
  const c = Math.cos(theta), s = Math.sin(theta);
  // l = 0, s
  if (l === 0) return 1 / (4 * Math.PI);

  // l = 1, p
  if (l === 1) {
    if (m === 0) return (3 / (4 * Math.PI)) * c * c;                 // pz
    if (Math.abs(m) === 1) return (3 / (8 * Math.PI)) * s * s;        // px, py  (m=±1 real combo)
  }

  // l = 2, d
  if (l === 2) {
    if (m === 0) return (5 / (16 * Math.PI)) * Math.pow(3 * c * c - 1, 2);                    // dz²
    if (Math.abs(m) === 1) return (15 / (8 * Math.PI)) * s * s * c * c;                       // dxz, dyz
    if (Math.abs(m) === 2) return (15 / (32 * Math.PI)) * Math.pow(s, 4);                       // dx²-y², dxy  (average over φ)
  }

  // l = 3, f (fallback approximation)
  if (l === 3) return (7 / (16 * Math.PI)) * Math.pow(5 * c * c * c - 3 * c, 2);

  return 1 / (4 * Math.PI);
}

/* Exact hydrogen radial wavefunction R_nl(r) in atomic units (a₀=1) */
function R_nl_exact(n, l, r) {
  if (r < 1e-6) return l === 0 ? 2 * Math.pow(1 / n, 1.5) : 0;
  const rho = 2 * r / n;
  const norm = Math.sqrt(
    Math.pow(2 / n, 3) * factorial(n - l - 1) / (2 * n * factorial(n + l))
  );
  const lag = assocLaguerre(n - l - 1, 2 * l + 1, rho);
  return norm * Math.pow(rho, l) * Math.exp(-rho / 2) * lag;
}

/* Orbital label: 1s, 2p, 3d, etc. */
function orbitalLabel(l) {
  return ['s', 'p', 'd', 'f', 'g', 'h'][l] || '?';
}

/* Energy in eV: E_n = -13.6057 / n² */
function energy_Hydrogen_eV(n) {
  return -13.6057 / (n * n);
}

/* Number of radial nodes = n - l - 1, angular nodes = l, total = n - 1 */
function countNodes(n, l) {
  return { radial: n - l - 1, angular: l, total: n - 1 };
}

/* ── 3D ORBITAL DENSITY PLOT ───────────────────────────────── */
function updateAtomPlot() {
  const n = parseInt(document.getElementById('val-atom-n').textContent) || 1;
  const l = parseInt(document.getElementById('val-atom-l').textContent) || 0;
  const m = parseInt(document.getElementById('val-atom-m').textContent) || 0;

  // Adaptive sampling: higher n needs larger grid, smaller step for smoothness
  const gridMax = Math.max(12, 5 * n);
  const step = l >= 3 ? 0.6 : 0.8;

  const x = [], y = [], z = [], val = [];

  for (let i = -gridMax; i <= gridMax; i += step) {
    for (let j = -gridMax; j <= gridMax; j += step) {
      for (let k = -gridMax; k <= gridMax; k += step) {
        const r = Math.sqrt(i * i + j * j + k * k);
        if (r < 0.01) continue;
        const theta = Math.acos(Math.max(-1, Math.min(1, k / r)));
        const phi = Math.atan2(j, i);

        const R = R_nl_exact(n, l, r);
        const Y2 = Y2_lm(l, m, theta, phi);
        const density = R * R * Y2;

        if (density > 0.0005) {
          x.push(i); y.push(j); z.push(k); val.push(density);
        }
      }
    }
  }

  // Auto iso-threshold: pick a fraction of max to get clean surfaces
  const maxVal = Math.max(...val, 1e-6);
  const isoVal = maxVal * 0.15;

  _plot('plot-atom-3d', [{
    type: 'isosurface',
    x: x, y: y, z: z, value: val,
    isomin: isoVal, isomax: maxVal,
    surface: { count: 1, fill: 0.9, pattern: 'odd' },
    opacity: 0.25,
    colorscale: 'Viridis',
    caps: { x: { show: false }, y: { show: false }, z: { show: false } },
    showscale: false
  }], {
    title: {
      text: `Hydrogen |${n}${orbitalLabel(l)}, m=${m}⟩    E_n = ${energy_Hydrogen_eV(n).toFixed(3)} eV`,
      font: { size: 13, color: '#e0e0f0' }
    },
    scene: {
      xaxis: { title: 'x (a₀)', gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55', showbackground: false },
      yaxis: { title: 'y (a₀)', gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55', showbackground: false },
      zaxis: { title: 'z (a₀)', gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55', showbackground: false },
      camera: { eye: { x: 1.4, y: 1.4, z: 1.2 } },
      aspectmode: 'cube'
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 0, r: 0, b: 0, t: 50 }
  });

  // ── Update legend panel ──
  updateAtomLegend(n, l, m);
}

/* ── LEGEND: orbital name, energy, nodes, state info ─────────── */
function updateAtomLegend(n, l, m) {
  const nodes = countNodes(n, l);
  const label = orbitalLabel(l);
  const E = energy_Hydrogen_eV(n);
  const mSign = m > 0 ? '+' : '';

  const legendHTML = `
    <div class="atom-legend-card">
      <div class="atom-legend-row">
        <span class="atom-legend-label">State</span>
        <span class="atom-legend-value">|${n}${label}, m=${mSign}${m}⟩</span>
      </div>
      <div class="atom-legend-row">
        <span class="atom-legend-label">Energy</span>
        <span class="atom-legend-value">${E.toFixed(3)} eV</span>
      </div>
      <div class="atom-legend-row">
        <span class="atom-legend-label">Radial nodes</span>
        <span class="atom-legend-value">${nodes.radial}</span>
      </div>
      <div class="atom-legend-row">
        <span class="atom-legend-label">Angular nodes</span>
        <span class="atom-legend-value">${nodes.angular}</span>
      </div>
      <div class="atom-legend-row">
        <span class="atom-legend-label">Total nodes</span>
        <span class="atom-legend-value">${nodes.total}</span>
      </div>
      <div class="atom-legend-row">
        <span class="atom-legend-label">Degeneracy</span>
        <span class="atom-legend-value">n² = ${n * n}</span>
      </div>
    </div>
  `;

  const legendEl = document.getElementById('atom-legend');
  if (legendEl) legendEl.innerHTML = legendHTML;
}

function validateAtomQuantumNumbers() {
    const nEl = document.getElementById('val-atom-n');
    const lEl = document.getElementById('val-atom-l');
    const mEl = document.getElementById('val-atom-m');
    if (!nEl || !lEl || !mEl) return;
    let n = parseInt(nEl.textContent) || 1;
    let l = parseInt(lEl.textContent) || 0;
    let m = parseInt(mEl.textContent) || 0;
    // Clamp l to [0, n-1]
    if (l >= n) {
        l = n - 1;
        document.getElementById('slider-atom-l').value = l;
        lEl.textContent = l;
    }
    // Clamp m to [-l, l]
    if (m < -l) { m = -l; document.getElementById('slider-atom-m').value = m; mEl.textContent = m; }
    if (m > l)  { m = l;  document.getElementById('slider-atom-m').value = m; mEl.textContent = m; }
    return { n, l, m };
}

function setSystem(sys) {
    state.system = sys;
    document.getElementById('btn-sys-qho').classList.toggle('active', sys === 'qho');
    document.getElementById('btn-sys-atom').classList.toggle('active', sys === 'atom');
    
    document.getElementById('qho-controls-panel').style.display = (sys === 'qho') ? 'block' : 'none';
    document.getElementById('atom-controls-panel').style.display = (sys === 'atom') ? 'block' : 'none';
    
    document.getElementById('plot-psi').style.display = (sys === 'qho') ? 'block' : 'none';
    document.getElementById('plot-wigner').style.display = (sys === 'qho') ? 'block' : 'none';
    document.getElementById('plot-classical').style.display = (sys === 'qho') ? 'block' : 'none';
    document.getElementById('plot-energy').style.display = (sys === 'qho') ? 'block' : 'none';
    document.getElementById('plot-atom-3d').style.display = (sys === 'atom') ? 'block' : 'none';

    const legendEl = document.getElementById('atom-legend');
    if (legendEl) legendEl.style.display = (sys === 'atom') ? 'block' : 'none';
    
    if (sys === 'atom') updateAtomPlot();
    else updateWavePlot();
}

function updateReadouts(E, x0, p0, prob, xArr) {
    let xExpect = 0, x2Expect = 0, norm = 0;
    const dx = xArr[1] - xArr[0];
    for (let i = 0; i < xArr.length; i++) {
        norm += prob[i] * dx;
        xExpect += xArr[i] * prob[i] * dx;
        x2Expect += xArr[i] * xArr[i] * prob[i] * dx;
    }
    xExpect /= norm; x2Expect /= norm;
    const sigmaX = Math.sqrt(Math.max(0, x2Expect - xExpect * xExpect));
    const elE = document.getElementById('live-energy');
    if (elE) elE.textContent = E.toFixed(3) + ' ħω';
    const elX = document.getElementById('live-x');
    if (elX) elX.textContent = xExpect.toFixed(3);
    const elDx = document.getElementById('live-dx');
    if (elDx) elDx.textContent = 'Δx = ' + sigmaX.toFixed(3);
    const elZpe = document.getElementById('live-zpe');
    if (elZpe) elZpe.textContent = (0.5 * state.omega).toFixed(3) + ' ħω';
    const elTurning = document.getElementById('live-turning');
    if (elTurning) {
        const xTP = Math.sqrt(2 * E / state.omega);
        elTurning.textContent = '±' + (isFinite(xTP) ? xTP.toFixed(3) : '∞');
    }
    const elX2 = document.getElementById('live-x2');
    if (elX2) elX2.textContent = x2Expect.toFixed(3);
}

function animateLoop() {
  if (!state.animating) return;
  state.time += 0.03 * state.speed;
  updateWavePlot();
  state.animFrame = requestAnimationFrame(animateLoop);
}

function startAnimation() { if (!state.animating) { state.animating = true; animateLoop(); } }
function stopAnimation() { state.animating = false; if (state.animFrame) cancelAnimationFrame(state.animFrame); }
function resetTime() { state.time = 0; updateWavePlot(); }

function setStateMode(mode) {
  state.mode = mode;
  document.getElementById('btn-eigen').classList.toggle('active', mode === 'eigenstate');
  document.getElementById('btn-super').classList.toggle('active', mode === 'superposition');
  document.getElementById('btn-coherent').classList.toggle('active', mode === 'coherent');
  document.getElementById('m-control').style.display = (mode === 'superposition') ? 'block' : 'none';
  document.getElementById('alpha-controls').style.display = (mode === 'coherent') ? 'block' : 'none';
  updateWavePlot();
}

function initQHO() {
  const sliderN = document.getElementById('slider-n');
  const sliderOmega = document.getElementById('slider-omega');
  if (!sliderN) { setTimeout(initQHO, 100); return; }
  if (sliderOmega) {
    sliderOmega.addEventListener('input', function() {
      state.omega = parseFloat(this.value);
      document.getElementById('val-omega').textContent = state.omega.toFixed(1);
      if (!state.animating) updateWavePlot();
    });
  }
  sliderN.addEventListener('input', function() {
    state.n = parseInt(this.value);
    document.getElementById('val-n').textContent = state.n;
    if (!state.animating) updateWavePlot();
  });
  
  const sliderM = document.getElementById('slider-m');
  if (sliderM) {
    sliderM.addEventListener('input', function() {
      state.m = parseInt(this.value);
      document.getElementById('val-m').textContent = state.m;
      if (!state.animating) updateWavePlot();
    });
  }
  
  const sliderAlphaRe = document.getElementById('slider-alpha-re');
  const sliderAlphaIm = document.getElementById('slider-alpha-im');
  if (sliderAlphaRe) {
    sliderAlphaRe.addEventListener('input', function() {
      state.alpha_re = parseFloat(this.value);
      document.getElementById('val-alpha-re').textContent = state.alpha_re.toFixed(1);
      if (!state.animating) updateWavePlot();
    });
  }
  if (sliderAlphaIm) {
    sliderAlphaIm.addEventListener('input', function() {
      state.alpha_im = parseFloat(this.value);
      document.getElementById('val-alpha-im').textContent = state.alpha_im.toFixed(1);
      if (!state.animating) updateWavePlot();
    });
  }
  
  const sliderSpeed = document.getElementById('slider-speed');
  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', function() {
      state.speed = parseFloat(this.value);
      document.getElementById('val-speed').textContent = state.speed.toFixed(1);
    });
  }
  
  // Atom Sliders
  const sN = document.getElementById('slider-atom-n');
  const sL = document.getElementById('slider-atom-l');
  const sM = document.getElementById('slider-atom-m');
  if (sN) sN.addEventListener('input', function() {
    document.getElementById('val-atom-n').textContent = this.value;
    validateAtomQuantumNumbers();
    updateAtomPlot();
  });
  if (sL) sL.addEventListener('input', function() {
    document.getElementById('val-atom-l').textContent = this.value;
    validateAtomQuantumNumbers();
    updateAtomPlot();
  });
  if (sM) sM.addEventListener('input', function() {
    document.getElementById('val-atom-m').textContent = this.value;
    validateAtomQuantumNumbers();
    updateAtomPlot();
  });

  document.getElementById('btn-play').addEventListener('click', startAnimation);
  document.getElementById('btn-pause').addEventListener('click', stopAnimation);
  document.getElementById('btn-reset').addEventListener('click', resetTime);
  
  updateWavePlot();
}

initQHO();
window.initQHO = initQHO;
window.setSystem = setSystem;
window.setStateMode = setStateMode;
window.startAnimation = startAnimation;
window.stopAnimation = stopAnimation;
window.resetTime = resetTime;

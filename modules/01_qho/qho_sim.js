/**
 * Quantum Harmonic Oscillator — Physics Engine (v3)
 * Hermite wavefunctions, time evolution, coherent states, superpositions.
 * Matches Wikipedia animation: Re(ψ) blue, Im(ψ) red, |ψ|² envelope,
 * classical ball-on-spring comparison, and coherent-state oscillation.
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

function classical_turning(n) { return Math.sqrt(2 * n + 1); }

// ── COMPLEX TIME-EVOLVED EIGENSTATE ─────────────────────────
// ψ_n(x,t) = ψ_n(x) * e^{-i E_n t}  (natural units)
function psi_n_time(n, xArr, t) {
  const psi = psi_n(n, xArr);
  const E = energy_n(n);
  const cosEt = Math.cos(E * t);
  const sinEt = Math.sin(E * t);
  const re = new Float64Array(xArr.length);
  const im = new Float64Array(xArr.length);
  for (let i = 0; i < xArr.length; i++) {
    re[i] = psi[i] * cosEt;
    im[i] = -psi[i] * sinEt;
  }
  return { re: re, im: im, prob: psi }; // |ψ|² is time-independent for eigenstates
}

// ── SUPERPOSITION ───────────────────────────────────────────
// |Ψ⟩ = c0 |n⟩ + c1 |m⟩  with time evolution
// Ψ(x,t) = c0 ψ_n(x) e^{-iE_n t} + c1 ψ_m(x) e^{-iE_m t}
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

// ── COHERENT STATE |α⟩ ──────────────────────────────────────
// α(t) = α(0) e^{-iωt}  → x₀(t)=√2 Re[α(t)], p₀(t)=√2 Im[α(t)]
// Position-space: displaced Gaussian oscillating in the well
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
    const phase = p0 * xArr[i] - p0 * x0 / 2; // kinetic + displacement phase
    re[i] = envelope * Math.cos(phase);
    im[i] = envelope * Math.sin(phase);
    prob[i] = envelope * envelope;
  }
  return { re: re, im: im, prob: prob, x0: x0, p0: p0 };
}

// ── CLASSICAL OSCILLATOR ────────────────────────────────────
// x_cl(t) = A cos(t),  p_cl(t) = -A sin(t)   (unit mass, ω=1)
function classicalOscillator(A, t) {
  return { x: A * Math.cos(t), p: -A * Math.cos(t - Math.PI / 2) };
}

// ── PLOTTING HELPERS ────────────────────────────────────────
function _plot(id, traces, lay, cfg) {
  var el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, lay, cfg || {responsive: true, displayModeBar: false});
}

// ── STATE ───────────────────────────────────────────────────
var state = {
  mode: 'eigenstate',      // 'eigenstate' | 'superposition' | 'coherent'
  n: 0, m: 3,             // for eigenstate and superposition
  cn: 1/Math.SQRT2, cm: 1/Math.SQRT2,
  alpha_re: 2.0, alpha_im: 0,
  time: 0,
  animating: false, animFrame: null,
  showClassical: true,
  speed: 1.0,
  xRange: 7
};

// ── X GRID ──────────────────────────────────────────────────
function makeX() {
  const arr = [];
  for (let i = 0; i < 500; i++) arr.push(-state.xRange + i * 2 * state.xRange / 499);
  return arr;
}

// ── MAIN WAVE PLOT (Re ψ, Im ψ, |ψ|²) ──────────────────────
function updateWavePlot() {
  const xArr = makeX();
  const t = state.time;
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
    { x: xArr, y: re, name: 'Re ψ(x)', mode: 'lines',
      line: { color: '#00f0ff', width: 2 }, legendgroup: 're' },
    { x: xArr, y: im, name: 'Im ψ(x)', mode: 'lines',
      line: { color: '#ff4ecd', width: 2 }, legendgroup: 'im' },
    { x: xArr, y: prob, name: '|ψ|²', mode: 'lines',
      line: { color: '#ffd54f', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(255,213,79,0.15)' }
  ];

  // Classical turning points
  const E = state.mode === 'eigenstate' ? energy_n(state.n) :
            state.mode === 'superposition' ? (state.cn*state.cn*energy_n(state.n) + state.cm*state.cm*energy_n(state.m)) :
            (state.alpha_re*state.alpha_re + state.alpha_im*state.alpha_im + 0.5);
  const xTP = Math.sqrt(2 * E);
  traces.push(
    { x: [xTP, xTP], y: [-2, 2], mode: 'lines',
      line: { color: '#4ade80', width: 1.5, dash: 'dot' }, showlegend: false },
    { x: [-xTP, -xTP], y: [-2, 2], mode: 'lines',
      line: { color: '#4ade80', width: 1.5, dash: 'dot' }, showlegend: false }
  );

  // Coherent-state center marker
  if (state.mode === 'coherent') {
    traces.push({
      x: [x0], y: [0], mode: 'markers',
      marker: { size: 16, color: '#ffd54f', symbol: 'diamond', line: { color: '#fff', width: 1 } },
      name: '⟨x⟩', showlegend: true
    });
  }

  const layout = {
    title: {
      text: state.mode === 'eigenstate' ? 'Eigenstate |' + state.n + '⟩ — Re(ψ) blue, Im(ψ) red, |ψ|² gold' :
            state.mode === 'superposition' ? 'Superposition (' + state.cn.toFixed(2) + '|' + state.n + '⟩ + ' + state.cm.toFixed(2) + '|' + state.m + '⟩)' :
            'Coherent State |α=' + state.alpha_re.toFixed(1) + '+i' + state.alpha_im.toFixed(1) + '⟩ — oscillates like classical particle',
      font: { size: 13, color: '#e0e0f0' }
    },
    xaxis: { title: 'x (ħ/mω)^{1/2}', gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55', range: [-state.xRange, state.xRange] },
    yaxis: { title: 'Amplitude / Probability', gridcolor: '#2a2a3a', range: [-1.2, 1.4] },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    margin: { l: 50, r: 20, t: 50, b: 40 },
    shapes: [
      { type: 'line', x0: 0, x1: 0, y0: -1.2, y1: 1.4,
        line: { color: 'rgba(255,255,255,0.06)', width: 1 } }
    ]
  };

  _plot('plot-psi', traces, layout);

  // Classical comparison plot
  if (state.showClassical) updateClassicalPlot(E, x0);

  // Update energy levels
  updateEnergyPlot();

  // Live readouts
  updateReadouts(E, x0, p0, prob, xArr);
}

// ── CLASSICAL COMPARISON PLOT ────────────────────────────────
function updateClassicalPlot(E, xCenter) {
  const xTP = Math.sqrt(2 * E);
  const xArr = makeX();

  // Classical probability P(x) ∝ 1/√(xTP² - x²)
  const xCl = [], pCl = [];
  for (let i = 0; i < xArr.length; i++) {
    const x = xArr[i];
    if (Math.abs(x) < xTP - 0.01) {
      xCl.push(x);
      pCl.push(1 / (Math.PI * Math.sqrt(xTP * xTP - x * x)));
    }
  }

  // Time trajectory: classical ball position vs time
  const tArr = [], xTraj = [], xQuantum = [];
  for (let i = 0; i <= 200; i++) {
    const t = i * 4 * Math.PI / 200;
    tArr.push(t);
    xTraj.push(xTP * Math.cos(t));
    if (state.mode === 'coherent') {
      const cs = coherentState(state.alpha_re, state.alpha_im, [0], t);
      xQuantum.push(cs.x0);
    } else {
      xQuantum.push(0);
    }
  }

  _plot('plot-classical', [
    { x: xArr, y: psi_n(state.n, xArr).map(v => v * v),
      name: '|ψₙ|² (quantum)', mode: 'lines', line: { color: '#00f0ff', width: 2 },
      xaxis: 'x', yaxis: 'y' },
    { x: xCl, y: pCl,
      name: 'P_classical(x)', mode: 'lines', line: { color: '#ffd54f', width: 2, dash: 'dot' },
      xaxis: 'x', yaxis: 'y' },
    { x: tArr, y: xTraj,
      name: 'x_classical(t)', mode: 'lines', line: { color: '#4ade80', width: 2 },
      xaxis: 'x2', yaxis: 'y2' },
    { x: tArr, y: xQuantum,
      name: '⟨x⟩_quantum(t)', mode: 'lines', line: { color: '#ff4ecd', width: 2, dash: 'dash' },
      xaxis: 'x2', yaxis: 'y2' }
  ], {
    title: { text: 'Quantum vs Classical Oscillator', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x', domain: [0, 0.48], gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55' },
    yaxis: { title: 'Probability density', gridcolor: '#2a2a3a', anchor: 'x' },
    xaxis2: { title: 'time t', domain: [0.52, 1], gridcolor: '#2a2a3a', anchor: 'y2' },
    yaxis2: { title: '⟨x⟩', gridcolor: '#2a2a3a', anchor: 'x2' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    margin: { l: 50, r: 20, t: 50, b: 40 },
    grid: { rows: 1, columns: 2, pattern: 'independent' }
  });
}

// ── ENERGY LEVELS ───────────────────────────────────────────
function updateEnergyPlot() {
  const n = state.n;
  const maxN = Math.max(10, n + 3);
  const levels = [];
  for (let k = 0; k <= maxN; k++) {
    const active = (state.mode === 'eigenstate' && k === n) ||
                   (state.mode === 'superposition' && (k === state.n || k === state.m));
    levels.push({
      x: [0, 1], y: [k + 0.5, k + 0.5], mode: 'lines',
      line: { color: active ? '#00f0ff' : '#2a2a3a', width: active ? 3 : 1 },
      showlegend: false
    });
  }
  levels.push({
    x: [0.45, 0.55], y: [n + 0.5, n + 0.5], mode: 'markers',
    marker: { size: 14, color: '#00f0ff', symbol: 'diamond' }, showlegend: false
  });

  _plot('plot-energy', levels, {
    title: { text: 'Energy eigenvalues Eₙ = (n+½)ħω', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { visible: false, range: [0, 1] },
    yaxis: { title: 'E / ħω', gridcolor: '#2a2a3a', dtick: 1, range: [-0.2, maxN + 1] },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 20, t: 40, b: 20 },
    annotations: [{
      x: 0.7, y: n + 0.5,
      text: 'E_' + n + ' = ' + (n + 0.5).toFixed(2) + 'ħω',
      font: { color: '#00f0ff', size: 12 }, showarrow: false
    }]
  });
}

// ── WIGNER FUNCTION (unchanged) ─────────────────────────────
function laguerreL(n, x) {
  if (n === 0) return 1;
  if (n === 1) return 1 - x;
  let L0 = 1, L1 = 1 - x, L2;
  for (let k = 1; k < n; k++) {
    L2 = ((2 * k + 1 - x) * L1 - k * L0) / (k + 1);
    L0 = L1; L1 = L2;
  }
  return L1;
}
function assocLaguerre(n, k, x) {
  if (n === 0) return 1;
  if (n === 1) return -x + k + 1;
  let L0 = 1, L1 = -x + k + 1, L2;
  for (let j = 1; j < n; j++) {
    L2 = ((2 * j + k + 1 - x) * L1 - (j + k) * L0) / (j + 1);
    L0 = L1; L1 = L2;
  }
  return L1;
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
function updateWigner() {
  const n = state.n, m = state.m;
  const xG = [], pG = [];
  for (let i = 0; i < 80; i++) xG.push(-5 + i * 10 / 79);
  for (let j = 0; j < 80; j++) pG.push(-5 + j * 10 / 79);
  const W = wignerFunction(n, m, xG, pG);
  const zFlat = [];
  for (let i = 0; i < 80; i++) for (let j = 0; j < 80; j++) zFlat.push(W[i][j]);
  const zmin = Math.min(...zFlat), zmax = Math.max(...zFlat);
  const absMax = Math.max(Math.abs(zmin), Math.abs(zmax));
  _plot('plot-wigner', [{
    x: xG, y: pG, z: W, type: 'heatmap',
    colorscale: [[0, '#1a0a2e'], [0.25, '#3a1a5e'], [0.5, 'rgba(0,0,0,0)'], [0.75, '#1a4a5e'], [1, '#00f0ff']],
    zmid: 0, zmin: -absMax, zmax: absMax,
    colorbar: { title: 'W(x,p)', titleside: 'right', titlefont: { color: '#e0e0f0', size: 11 }, tickfont: { color: '#8080a0', size: 10 } }
  }], {
    title: { text: 'Wigner Phase Space W(x,p)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x', gridcolor: '#2a2a3a' },
    yaxis: { title: 'p', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 80, t: 40, b: 40 }
  });
}

// ── IR SPECTRUM ────────────────────────────────────────────
function plotIR() {
  const xe = state.anharm || 0.015;
  const nu = [];
  for (let v = 0; v <= 10; v++) nu.push(v + 0.5 - xe * Math.pow(v + 0.5, 2));
  const transitions = [];
  for (let v = 1; v <= 10; v++) transitions.push({ from: v, to: v - 1, e: nu[v] - nu[v - 1] });
  _plot('app-ir', [
    { x: transitions.map(t => t.e), y: transitions.map((_, i) => i + 1), type: 'bar',
      orientation: 'h', marker: { color: transitions.map((_, i) => i === 0 ? '#00f0ff' : '#4ade80') },
      text: transitions.map(t => 'ΔE=' + t.e.toFixed(3) + 'ħω'), textposition: 'outside',
      hovertemplate: 'v=%{y}: ΔE=%{x:.3f}ħω<extra></extra>'
    }
  ], {
    title: { text: 'IR Transitions (v → v-1) with anharmonicity', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'ΔE / ħω', gridcolor: '#2a2a3a', range: [0.5, 1.2] },
    yaxis: { title: 'Initial v', gridcolor: '#2a2a3a', dtick: 1 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 100, t: 40, b: 40 },
    annotations: [{
      x: 0.95, y: 0.95, xref: 'paper', yref: 'paper',
      text: 'xₑ=' + xe.toFixed(3) + '<br>H₂: xₑ≈0.03<br>CO: xₑ≈0.006',
      font: { size: 10, color: '#8080a0' }, showarrow: false, align: 'left',
      bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1, borderpad: 4
    }]
  });
}

// ── LIVE READOUTS ──────────────────────────────────────────
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
  const elZ = document.getElementById('live-zpe');
  if (elZ) elZ.textContent = '0.500 ħω';
  const elTP = document.getElementById('live-turning');
  if (elTP) elTP.textContent = '±' + Math.sqrt(2 * E).toFixed(3);
  const elX = document.getElementById('live-x');
  if (elX) elX.textContent = xExpect.toFixed(3);
  const elX2 = document.getElementById('live-x2');
  if (elX2) elX2.textContent = x2Expect.toFixed(3);
  const elDx = document.getElementById('live-dx');
  if (elDx) elDx.textContent = 'Δx = ' + sigmaX.toFixed(3) + ' ħ/2';
  const elN = document.getElementById('val-n');
  if (elN) elN.textContent = state.n;
  const elT = document.getElementById('val-time');
  if (elT) elT.textContent = state.time.toFixed(2);
}

// ── ANIMATION LOOP ─────────────────────────────────────────
function animateLoop() {
  if (!state.animating) return;
  state.time += 0.03 * state.speed;
  updateWavePlot();
  state.animFrame = requestAnimationFrame(animateLoop);
}

function startAnimation() { if (!state.animating) { state.animating = true; animateLoop(); } }
function stopAnimation() { state.animating = false; if (state.animFrame) cancelAnimationFrame(state.animFrame); }
function resetTime() { state.time = 0; updateWavePlot(); }

// ── INIT ────────────────────────────────────────────────────
function initQHO() {
  const sliderN = document.getElementById('slider-n');
  const sliderM = document.getElementById('slider-m');
  if (!sliderN) { setTimeout(initQHO, 100); return; }

  sliderN.addEventListener('input', function() {
    state.n = parseInt(this.value);
    const el = document.getElementById('val-n');
    if (el) el.textContent = state.n;
    if (!state.animating) updateWavePlot();
  });
  if (sliderM) {
    sliderM.addEventListener('input', function() {
      state.m = parseInt(this.value);
      const el = document.getElementById('val-m');
      if (el) el.textContent = state.m;
      if (!state.animating) updateWavePlot();
    });
  }

  // Mode buttons
  const btnEigen = document.getElementById('btn-eigen');
  const btnSuper = document.getElementById('btn-super');
  const btnCoherent = document.getElementById('btn-coherent');
  if (btnEigen) btnEigen.addEventListener('click', function() { state.mode = 'eigenstate'; updateWavePlot(); });
  if (btnSuper) btnSuper.addEventListener('click', function() { state.mode = 'superposition'; updateWavePlot(); });
  if (btnCoherent) btnCoherent.addEventListener('click', function() { state.mode = 'coherent'; updateWavePlot(); });

  // Animation controls
  const btnPlay = document.getElementById('btn-play');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');
  const sliderSpeed = document.getElementById('slider-speed');
  if (btnPlay) btnPlay.addEventListener('click', startAnimation);
  if (btnPause) btnPause.addEventListener('click', stopAnimation);
  if (btnReset) btnReset.addEventListener('click', resetTime);
  if (sliderSpeed) sliderSpeed.addEventListener('input', function() { state.speed = parseFloat(this.value); });

  // Coherent state alpha sliders
  const sliderAlphaRe = document.getElementById('slider-alpha-re');
  const sliderAlphaIm = document.getElementById('slider-alpha-im');
  if (sliderAlphaRe) sliderAlphaRe.addEventListener('input', function() {
    state.alpha_re = parseFloat(this.value);
    const el = document.getElementById('val-alpha-re');
    if (el) el.textContent = state.alpha_re.toFixed(1);
    if (state.mode === 'coherent' && !state.animating) updateWavePlot();
  });
  if (sliderAlphaIm) sliderAlphaIm.addEventListener('input', function() {
    state.alpha_im = parseFloat(this.value);
    const el = document.getElementById('val-alpha-im');
    if (el) el.textContent = state.alpha_im.toFixed(1);
    if (state.mode === 'coherent' && !state.animating) updateWavePlot();
  });

  updateWavePlot();
  updateWigner();
  plotIR();
}

initQHO();
window.initQHO = initQHO;

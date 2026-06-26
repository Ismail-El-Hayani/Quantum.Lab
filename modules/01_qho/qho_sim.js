/**
 * Quantum Harmonic Oscillator Physics Engine
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
  trajectory: [],
  _updateLock: false,
  _pendingUpdate: false,
  _lastWignerUpdate: 0
};

function makeX() {
  const arr = [];
  for (let i = 0; i < 500; i++) arr.push(-state.xRange + i * 2 * state.xRange / 499);
  return arr;
}

function updateWavePlot() {
  if (state._updateLock) { state._pendingUpdate = true; return; }
  state._updateLock = true;
  try { _updateWavePlotImpl(); } finally { state._updateLock = false; if (state._pendingUpdate) { state._pendingUpdate = false; setTimeout(updateWavePlot, 0); } }
}

function _updateWavePlotImpl() {
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
  traces.push({ x: [xTP, xTP], y: [-2, 2], mode: 'lines', name: 'Turning point +√(2E)', line: { color: '#4ade80', width: 1.5, dash: 'dot' }, showlegend: true });
  traces.push({ x: [-xTP, -xTP], y: [-2, 2], mode: 'lines', name: 'Turning point −√(2E)', line: { color: '#4ade80', width: 1.5, dash: 'dot' }, showlegend: true });
  if (state.mode === 'coherent') {
    traces.push({ x: [x0], y: [0], mode: 'markers', marker: { size: 16, color: '#ffd54f', symbol: 'diamond', line: { color: '#fff', width: 1 } }, name: '⟨x⟩', showlegend: true });
  }
  const allY = [];
  for (let i = 0; i < xArr.length; i++) {
    allY.push(re[i], im[i], prob[i]);
  }
  const yMax = Math.max(...allY.map(Math.abs));
  const yPad = Math.max(0.2, yMax * 0.15);
  const yRangeMax = Math.max(1.2, yMax + yPad);

  const layout = {
    title: { text: state.mode === 'eigenstate' ? 'Eigenstate |' + state.n + '⟩ — Re ψ, Im ψ, |ψ|²' : state.mode === 'superposition' ? 'Superposition |Ψ⟩ = c₀|n⟩ + c₁|m⟩' : 'Coherent State |α⟩ — displaced Gaussian packet', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x (in units of √(ℏ/mω) )', gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55', range: [-state.xRange, state.xRange] },
    yaxis: { title: 'Amplitude', gridcolor: '#2a2a3a', range: [-yRangeMax, yRangeMax] },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 20, t: 50, b: 40 },
    showlegend: true,
    legend: { x: 0.99, y: 0.99, xanchor: 'right', yanchor: 'top', bgcolor: 'rgba(10,10,15,0.85)', font: { color: '#e0e0e0' }, bordercolor: '#2a2a3a', borderwidth: 1 }
  };
  _plot('plot-psi', traces, layout);
  if (typeof Plotly !== 'undefined') {
    const el = document.getElementById('plot-psi');
    if (el && el.data) { try { Plotly.Plots.resize(el); } catch (e) {} }
  }
  updateWigner();
  updateEnergyPlot();
  updateClassicalPlot(E);
  updateReadouts(E, x0, p0, prob, xArr);
  updateTimeReadout();
}

function updateEnergyPlot() {
  let relevantLevels = [state.n + 0.5];
  if (state.mode === 'superposition') {
    relevantLevels.push(state.m + 0.5);
  } else if (state.mode === 'coherent') {
    const nBar = state.alpha_re*state.alpha_re + state.alpha_im*state.alpha_im;
    relevantLevels.push(nBar + 0.5);
  }
  const minRelevant = Math.min(...relevantLevels);
  const maxRelevant = Math.max(...relevantLevels);
  const spread = state.mode === 'coherent' ? 3 * Math.sqrt(maxRelevant - 0.5) + 1 : 2;
  const maxN = Math.max(10, Math.ceil(maxRelevant + spread));
  const yMax = Math.max(maxRelevant + spread, 4);
  const yMin = -0.5;
  const levels = [];
  for (let k = 0; k <= maxN; k++) {
    const active = (state.mode === 'eigenstate' && k === state.n) ||
                   (state.mode === 'superposition' && (k === state.n || k === state.m)) ||
                   (state.mode === 'coherent' && Math.abs(k + 0.5 - (state.alpha_re*state.alpha_re + state.alpha_im*state.alpha_im + 0.5)) < 0.5);
    levels.push({ x: [0, 1], y: [k + 0.5, k + 0.5], mode: 'lines', line: { color: active ? '#00f0ff' : '#2a2a3a', width: active ? 3 : 1 }, showlegend: false });
  }
  _plot('plot-energy', levels, {
    title: { text: 'Energy eigenvalues Eₙ = ℏω(n + ½) — golden spacing', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { visible: false, range: [0, 1] },
    yaxis: { title: 'E / ħω', gridcolor: '#2a2a3a', dtick: 1, range: [yMin, yMax] },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 20, t: 50, b: 20 },
    showlegend: false,
    legend: { x: 0.02, y: 0.98, xanchor: 'left', yanchor: 'top', bgcolor: 'rgba(10,10,15,0.85)', font: { color: '#e0e0e0' }, bordercolor: '#2a2a3a', borderwidth: 1 }
  });
}

function updateClassicalPlot(E) {
  const t = state.time * state.omega;
  const A = Math.sqrt(2 * E / state.omega);
  const xCl = A * Math.cos(t);
  const xArr = makeX();
  let xQuantum, labelQuantum;
  if (state.mode === 'eigenstate') {
    xQuantum = psi_n(state.n, xArr).map(p => p * p);
    labelQuantum = '|ψₙ|² (quantum)';
  } else if (state.mode === 'superposition') {
    xQuantum = psi_superposition(state.n, state.m, state.cn, state.cm, xArr, 0).prob;
    labelQuantum = '|Ψ|² (superposition)';
  } else {
    xQuantum = coherentState(state.alpha_re, state.alpha_im, xArr, 0).prob;
    labelQuantum = '|ψ_α|² (coherent)';
  }
  const qMax = Math.max(...xQuantum);
  const yTop = Math.max(1.5, qMax * 1.2);
  _plot('plot-classical', [
    { x: xArr, y: xQuantum, mode: 'lines', name: labelQuantum, line: { color: '#ffd54f', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(255,213,79,0.1)' },
    { x: [xCl, xCl], y: [-0.5, yTop], mode: 'lines', name: 'Classical x(t)', line: { color: '#4ade80', width: 2, dash: 'dot' } },
    { x: [A, A], y: [-0.5, yTop], mode: 'lines', name: 'Turning point +A', line: { color: '#8080a0', width: 1 }, showlegend: true },
    { x: [-A, -A], y: [-0.5, yTop], mode: 'lines', name: 'Turning point −A', line: { color: '#8080a0', width: 1 }, showlegend: true }
  ], {
    title: { text: 'Quantum probability vs Classical trajectory', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x (in units of √(ℏ/mω) )', gridcolor: '#2a2a3a', range: [-state.xRange, state.xRange] },
    yaxis: { title: 'Probability / Position', gridcolor: '#2a2a3a', range: [-0.5, yTop] },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 20, t: 50, b: 40 },
    showlegend: true,
    legend: { x: 0.99, y: 0.99, xanchor: 'right', yanchor: 'top', bgcolor: 'rgba(10,10,15,0.85)', font: { color: '#e0e0e0' }, bordercolor: '#2a2a3a', borderwidth: 1 }
  });
  if (typeof Plotly !== 'undefined') {
    const el = document.getElementById('plot-classical');
    if (el && el.data) { try { Plotly.Plots.resize(el); } catch (e) {} }
  }
}

function updateWigner() {
  const now = performance.now();
  if (now - state._lastWignerUpdate < 40) return; // throttle ~25 fps
  state._lastWignerUpdate = now;
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
    title: { text: 'Wigner Phase Space — quasi-probability W(x,p)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x (in units of √(ℏ/mω) )', gridcolor: '#2a2a3a' }, yaxis: { title: 'p (in units of √(mωℏ) )', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 50, r: 30, t: 50, b: 40 },
    showlegend: false,
    legend: { x: 0.99, y: 0.99, xanchor: 'right', yanchor: 'top', bgcolor: 'rgba(10,10,15,0.85)', font: { color: '#e0e0e0' }, bordercolor: '#2a2a3a', borderwidth: 1 },
    annotations: [
      { x: 0.01, y: 0.01, xref: 'paper', yref: 'paper', text: '<b>Negative regions</b> = quantum interference', font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'left' }
    ]
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



function updateTimeReadout() {
  const el = document.getElementById('val-time');
  if (el) el.textContent = state.time.toFixed(2);
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
    if (elDx) elDx.textContent = sigmaX.toFixed(3);
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
  updateTimeReadout();
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
  const capEigen = document.getElementById('caption-eigen');
  const capSuper = document.getElementById('caption-super');
  const capCoh = document.getElementById('caption-coherent');
  if (capEigen) capEigen.style.display = (mode === 'eigenstate') ? 'inline' : 'none';
  if (capSuper) capSuper.style.display = (mode === 'superposition') ? 'inline' : 'none';
  if (capCoh) capCoh.style.display = (mode === 'coherent') ? 'inline' : 'none';
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
      updateWavePlot();
    });
  }
  sliderN.addEventListener('input', function() {
    state.n = Number.parseInt(this.value);
    document.getElementById('val-n').textContent = state.n;
    updateWavePlot();
  });

  const sliderM = document.getElementById('slider-m');
  if (sliderM) {
    sliderM.addEventListener('input', function() {
      state.m = Number.parseInt(this.value);
      document.getElementById('val-m').textContent = state.m;
      updateWavePlot();
    });
  }

  const sliderAlphaRe = document.getElementById('slider-alpha-re');
  const sliderAlphaIm = document.getElementById('slider-alpha-im');
  if (sliderAlphaRe) {
    sliderAlphaRe.addEventListener('input', function() {
      state.alpha_re = parseFloat(this.value);
      document.getElementById('val-alpha-re').textContent = state.alpha_re.toFixed(1);
      updateWavePlot();
    });
  }
  if (sliderAlphaIm) {
    sliderAlphaIm.addEventListener('input', function() {
      state.alpha_im = parseFloat(this.value);
      document.getElementById('val-alpha-im').textContent = state.alpha_im.toFixed(1);
      updateWavePlot();
    });
  }
  
  const sliderSpeed = document.getElementById('slider-speed');
  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', function() {
      state.speed = parseFloat(this.value);
      document.getElementById('val-speed').textContent = state.speed.toFixed(1);
    });
  }

  ['slider-omega','slider-n','slider-m','slider-alpha-re','slider-alpha-im'].forEach(function(id){
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', function() {
      if (!state.animating) updateWavePlot();
    });
  });
  


  document.getElementById('btn-play').addEventListener('click', startAnimation);
  document.getElementById('btn-pause').addEventListener('click', stopAnimation);
  document.getElementById('btn-reset').addEventListener('click', resetTime);
  
  updateWavePlot();
}

initQHO();
window.initQHO = initQHO;
window.setStateMode = setStateMode;
window.startAnimation = startAnimation;
window.stopAnimation = stopAnimation;
window.resetTime = resetTime;
window.updateWavePlot = updateWavePlot;

// ── RESPONSIVE PLOT RESIZE ──────────────────────────────────
const _playPlotIds = ['plot-psi', 'plot-energy', 'plot-classical', 'plot-wigner'];
function _resizePlaygroundPlots() {
  if (typeof Plotly === 'undefined' || !document.getElementById('section-play') || document.getElementById('section-play').style.display === 'none') return;
  _playPlotIds.forEach(function(id) {
    const el = document.getElementById(id);
    if (el && el.data) { try { Plotly.Plots.resize(el); } catch (e) {} }
  });
}
window.addEventListener('resize', _resizePlaygroundPlots);

const _playObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(m) {
    if (m.attributeName === 'style' && m.target.id === 'section-play') {
      if (m.target.style.display !== 'none') setTimeout(_resizePlaygroundPlots, 120);
    }
  });
});
document.addEventListener('DOMContentLoaded', function() {
  const sectionPlay = document.getElementById('section-play');
  if (sectionPlay) _playObserver.observe(sectionPlay, { attributes: true, attributeFilter: ['style'] });
});

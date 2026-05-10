/**
 * Quantum Harmonic Oscillator — Physics Engine (v2)
 * Hermite wavefunctions, Wigner phase space, coherent states, ladder operators.
 * Natural units: m = omega = hbar = 1
 */

'use strict';

// ============ PHYSICS PRIMITIVES ============
function factorial(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// Hermite polynomial recurrence: H_{n+1}(x) = 2x H_n(x) - 2n H_{n-1}(x)
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

// Momentum-space wavefunction: FT of position-space
function phi_n(n, pArr) {
  // φ_n(p) = (-i)ⁿ ψ_n(p)  (since m=ω=1, the momentum-space has same functional form)
  const psi_p = psi_n(n, pArr);
  const phase = n % 4 === 0 ? 1 : n % 4 === 1 ? -1 : n % 4 === 2 ? -1 : 1; // (-i)^n real part
  // Actually for real Hermite, φ_n(p) = (-i)^n ψ_n(p) / √(2π) * √(2π) = same envelope
  // With ħ=m=ω=1, the p-space wavefunction has identical |φ|² = |ψ|²
  return psi_p.map((v, i) => v * ((n % 2 === 0 ? 1 : 0) + (n % 2 === 1 ? -pArr[i] : 0))); // simplified
}

// ============ WIGNER FUNCTION ============
// W(x,p) = (1/πħ) ∫ ψ*(x+y) ψ(x-y) e^{2ipy/ħ} dy
// For pure state |n⟩: W_n(x,p) = (-1)ⁿ / (πħ) L_n(2r²) e^{-r²} where r² = x² + p², L_n = Laguerre
// For superposition |n⟩ + |m⟩: interference terms appear → W can go negative
function wignerFunction(n, m, xGrid, pGrid) {
  // Compute Wigner on a 2D grid for state (|n⟩ + |m⟩)/√2
  // Use the analytical form for number states and cross terms
  const Nx = xGrid.length, Np = pGrid.length;
  const W = new Array(Nx);
  for (let i = 0; i < Nx; i++) {
    W[i] = new Float64Array(Np);
    for (let j = 0; j < Np; j++) {
      const x = xGrid[i], p = pGrid[j];
      const r2 = x * x + p * p;
      // Diagonal terms
      const Wnn = (Math.pow(-1, n) / Math.PI) * laguerreL(n, 2 * r2) * Math.exp(-r2);
      const Wmm = m === n ? Wnn : (Math.pow(-1, m) / Math.PI) * laguerreL(m, 2 * r2) * Math.exp(-r2);
      // Off-diagonal (interference): Re[W_nm] where W_nm involves associated Laguerre
      let Wcross = 0;
      if (m !== n) {
        const phase = Math.cos((n - m) * Math.atan2(p, x)); // angle-dependent interference
        const Lnm = assocLaguerre(Math.min(n,m), Math.abs(n-m), 2 * r2);
        Wcross = (2 / Math.PI) * Math.pow(r2, Math.abs(n-m)/2) * Lnm * Math.exp(-r2) * phase;
        if ((n + m) % 2 === 1) Wcross *= -1;
      }
      W[i][j] = 0.5 * (Wnn + Wmm + Wcross);
    }
  }
  return W;
}

// Laguerre polynomial L_n(x)
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

// Associated Laguerre L_n^k(x)
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

// ============ COHERENT STATE ============
// |α⟩ = e^{-|α|²/2} Σ (αⁿ/√n!) |n⟩  where α = (x₀ + ip₀)/√2
// In phase space: displaced Gaussian centered at (x₀, p₀), minimum uncertainty
function coherentState(alpha_re, alpha_im, xArr, t) {
  // α(t) = α(0) e^{-iωt} = α(0) (cos t - i sin t)
  const alpha_t_re = alpha_re * Math.cos(t) + alpha_im * Math.sin(t);
  const alpha_t_im = -alpha_re * Math.sin(t) + alpha_im * Math.cos(t);
  const x0 = Math.SQRT2 * alpha_t_re;
  const p0 = Math.SQRT2 * alpha_t_im;
  const psi = new Float64Array(xArr.length);
  for (let i = 0; i < xArr.length; i++) {
    const dx = xArr[i] - x0;
    psi[i] = Math.exp(-dx * dx / 2) * Math.cos(p0 * xArr[i]) / Math.pow(Math.PI, 0.25); // real part
  }
  return { psi: psi, x0: x0, p0: p0 };
}

// ============ PLOTTING ============
function _plot(id, traces, lay, cfg) {
  var el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, lay, cfg || {responsive: true, displayModeBar: false});
}

// ============ STATE ============
var state = {
  n: 0, m: 0, time: 0, animating: false, animFrame: null,
  anharm: 0.015, showClassical: false
};

// ============ MAIN PLOTS ============
function updatePlots() {
  var n = state.n, m = state.m;
  var xArr = [];
  for (let i = 0; i < 500; i++) xArr.push(-7 + i * 14 / 499);

  // Position space
  var psiN = psi_n(n, xArr);
  var probN = psiN.map(v => v * v);
  var traces1 = [
    { x: xArr, y: psiN, name: 'ψₙ(x)', mode: 'lines', line: { color: '#00f0ff', width: 2 } },
    { x: xArr, y: probN, name: '|ψₙ|²', mode: 'lines', line: { color: '#ff4ecd', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(255,78,205,0.15)' },
  ];
  if (m > 0 && m !== n) {
    var psiM = psi_n(m, xArr);
    var t = state.time;
    var psiSup = xArr.map((_, i) => (psiN[i] * Math.cos(energy_n(n) * t) + psiM[i] * Math.cos(energy_n(m) * t)) / Math.SQRT2);
    var probSup = psiSup.map(v => v * v);
    traces1.push(
      { x: xArr, y: psiSup, name: 'ψ_super(x)', mode: 'lines', line: { color: '#c084fc', width: 2, dash: 'dash' } },
      { x: xArr, y: probSup, name: '|ψ_super|²', mode: 'lines', line: { color: '#4ade80', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.1)' }
    );
  }
  _plot('plot-psi', traces1, {
    title: { text: 'Wavefunction ψ(x) and |ψ|²', font: { size: 14, color: '#e0e0f0' } },
    xaxis: { title: 'x (ħ/mω)^{1/2}', gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55' },
    yaxis: { title: 'Amplitude', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0', family: 'Inter' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    margin: { l: 50, r: 20, t: 40, b: 40 }
  });

  // Classical probability for comparison
  if (state.showClassical) {
    var E = energy_n(n);
    var xTP = Math.sqrt(2 * E);
    var xCl = [], pCl = [];
    for (let i = 0; i <= 200; i++) {
      var x = -xTP + i * 2 * xTP / 200;
      if (Math.abs(x) < xTP) { xCl.push(x); pCl.push(1 / (Math.PI * Math.sqrt(xTP * xTP - x * x))); }
    }
    _plot('plot-classical', [
      { x: xArr, y: probN, name: '|ψₙ|² (quantum)', mode: 'lines', line: { color: '#ff4ecd', width: 2 } },
      { x: xCl, y: pCl, name: 'P_classical(x)', mode: 'lines', line: { color: '#ffd54f', width: 2, dash: 'dot' } }
    ], {
      title: { text: 'Quantum vs Classical Probability', font: { size: 13, color: '#e0e0f0' } },
      xaxis: { title: 'x', gridcolor: '#2a2a3a' }, yaxis: { title: 'Probability density', gridcolor: '#2a2a3a' },
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
      margin: { l: 50, r: 20, t: 40, b: 40 }
    });
  }

  // Energy levels
  var levels = [];
  for (let k = 0; k <= Math.max(10, n + 3); k++) {
    levels.push({ x: [0, 1], y: [k + 0.5, k + 0.5], mode: 'lines', line: { color: k === n ? '#00f0ff' : '#2a2a3a', width: k === n ? 3 : 1 }, showlegend: false });
  }
  levels.push({ x: [0.45, 0.55], y: [n + 0.5, n + 0.5], mode: 'markers', marker: { size: 14, color: '#00f0ff', symbol: 'diamond' }, showlegend: false });
  _plot('plot-energy', levels, {
    title: { text: 'Energy eigenvalues Eₙ = (n+½)ħω', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { visible: false, range: [0, 1] }, yaxis: { title: 'E / ħω', gridcolor: '#2a2a3a', dtick: 1 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 20 }, annotations: [{ x: 0.7, y: n + 0.5, text: 'E_' + n + ' = ' + (n + 0.5).toFixed(1) + 'ħω', font: { color: '#00f0ff', size: 12 }, showarrow: false }]
  });

  // Wigner function
  plotWigner();

  // Live table
  var elE = document.getElementById('live-energy');
  if (elE) elE.textContent = (n + 0.5).toFixed(3) + ' ħω' + (m > 0 ? ' (avg)' : '');
  var elZ = document.getElementById('live-zpe');
  if (elZ) elZ.textContent = '0.500 ħω';
  var elTP = document.getElementById('live-turning');
  if (elTP) elTP.textContent = '±' + classical_turning(n).toFixed(3) + '';
  var elX = document.getElementById('live-x');
  if (elX) elX.textContent = '0.000';
  var elX2 = document.getElementById('live-x2');
  if (elX2) elX2.textContent = ((n + 0.5)).toFixed(3) + '';
  var elDx = document.getElementById('live-dx');
  if (elDx) elDx.textContent = 'Δx = ' + Math.sqrt(n + 0.5).toFixed(3) + ', Δp = ' + Math.sqrt(n + 0.5).toFixed(3) + ', Δx·Δp = ' + (n + 0.5).toFixed(3) + ' ħ/2';
  var elN = document.getElementById('val-n');
  if (elN) elN.textContent = n;
}

function plotWigner() {
  var n = state.n, m = state.m;
  var xG = [], pG = [];
  for (let i = 0; i < 80; i++) xG.push(-5 + i * 10 / 79);
  for (let j = 0; j < 80; j++) pG.push(-5 + j * 10 / 79);

  var W = wignerFunction(n, m, xG, pG);
  var zFlat = [];
  for (let i = 0; i < 80; i++) for (let j = 0; j < 80; j++) zFlat.push(W[i][j]);

  var zmin = Math.min(...zFlat), zmax = Math.max(...zFlat);
  var absMax = Math.max(Math.abs(zmin), Math.abs(zmax));

  _plot('plot-wigner', [{
    x: xG, y: pG, z: W, type: 'heatmap',
    colorscale: [[0, '#1a0a2e'], [0.25, '#3a1a5e'], [0.5, 'rgba(0,0,0,0)'], [0.75, '#1a4a5e'], [1, '#00f0ff']],
    zmid: 0, zmin: -absMax, zmax: absMax,
    colorbar: { title: 'W(x,p)', titleside: 'right', titlefont: { color: '#e0e0f0', size: 11 }, tickfont: { color: '#8080a0', size: 10 } }
  }], {
    title: { text: 'Wigner Phase Space W(x,p)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x (ħ/mω)^{1/2}', gridcolor: '#2a2a3a' },
    yaxis: { title: 'p (mωħ)^{1/2}', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 80, t: 40, b: 40 },
    annotations: [{
      x: 0.5, y: -0.18, xref: 'paper', yref: 'paper',
      text: m > 0 && m !== n ? 'Blue = positive, Purple = negative ← quantum interference' : 'Gaussian for ground state, ring for excited states',
      font: { size: 10, color: '#8080a0' }, showarrow: false
    }]
  });
}

// ============ IR SPECTRUM ============
function plotIR() {
  var xe = state.anharm;
  var nu = [];
  for (let v = 0; v <= 10; v++) nu.push(v + 0.5 - xe * Math.pow(v + 0.5, 2));
  var transitions = [];
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
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 100, t: 40, b: 40 },
    annotations: [{
      x: 0.95, y: 0.95, xref: 'paper', yref: 'paper',
      text: 'xₑ=' + xe.toFixed(3) + '<br>H₂: xₑ≈0.03<br>CO: xₑ≈0.006',
      font: { size: 10, color: '#8080a0' }, showarrow: false, align: 'left',
      bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1, borderpad: 4
    }]
  });
}

// ============ ANIMATION ============
function animateLoop() {
  if (!state.animating) return;
  state.time += 0.05;
  updatePlots();
  state.animFrame = requestAnimationFrame(animateLoop);
}

// ============ INIT ============
function initQHO() {
  var sliderN = document.getElementById('slider-n');
  var sliderM = document.getElementById('slider-m');
  if (!sliderN) { console.log('QHO: waiting for DOM...'); setTimeout(initQHO, 100); return; }

  sliderN.addEventListener('input', function() {
    state.n = parseInt(this.value);
    updatePlots();
  });
  sliderM.addEventListener('input', function() {
    state.m = parseInt(this.value);
    document.getElementById('val-m').textContent = state.m;
    updatePlots();
  });

  var btnClassical = document.getElementById('btn-classical');
  if (btnClassical) {
    btnClassical.addEventListener('click', function() {
      state.showClassical = !state.showClassical;
      this.textContent = state.showClassical ? 'Hide classical probability' : 'Show classical probability';
      updatePlots();
    });
  }

  var btnAnimate = document.getElementById('btn-animate');
  if (btnAnimate) {
    btnAnimate.addEventListener('click', function() {
      state.animating = !state.animating;
      this.textContent = state.animating ? 'Stop animation' : 'Animate time evolution';
      if (state.animating) {
        if (state.m === 0) { state.m = 1; sliderM.value = '1'; document.getElementById('val-m').textContent = '1'; }
        animateLoop();
      } else { cancelAnimationFrame(state.animFrame); state.time = 0; updatePlots(); }
    });
  }

  var sliderAnharm = document.getElementById('slider-anharm');
  if (sliderAnharm) {
    sliderAnharm.addEventListener('input', function() {
      state.anharm = parseFloat(this.value);
      document.getElementById('val-anharm').textContent = state.anharm.toFixed(3);
      plotIR();
    });
  }

  updatePlots();
  plotIR();
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQHO);
} else {
  initQHO();
}

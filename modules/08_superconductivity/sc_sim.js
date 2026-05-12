/**
 * Superconductivity — Physics Engine (v1)
 * BCS gap, Meissner effect, London penetration, critical field.
 * Units: T in K, H in T, gap in meV, λ in nm.
 */

'use strict';

const kB_meV = 8.617e-2;  // meV/K
const hbar = 1.054e-34;
const mu0 = 4 * Math.PI * 1e-7;
const e_charge = 1.602e-19;
const m_e = 9.109e-31;

let scState = {
  T: 4.0,
  Tc: 9.2,
  H: 0.0,
  H0: 0.2,
  material: 'Nb'
};

function gapRatio(T, Tc) {
  if (T >= Tc) return 0;
  // BCS weak-coupling approximation: Δ(T)/Δ(0) ≈ tanh(π√(Tc/T - 1))
  // Simplified analytic fit used in many textbooks:
  const t = T / Tc;
  if (t < 0.17) return 1.0;
  return Math.tanh(Math.PI * Math.sqrt((Tc / T) - 1) * 1.74);
}

function gapZero(Tc) {
  // Δ(0) ≈ 1.76 k_B Tc
  return 1.76 * kB_meV * Tc;
}

function criticalField(T, Tc, H0) {
  // Hc(T) = H0 * (1 - T²/Tc²)
  if (T >= Tc) return 0;
  return H0 * (1 - (T * T) / (Tc * Tc));
}

function londonPenetration(T, Tc, lambda0) {
  // λ_L(T) = λ_L(0) / √(1 - t⁴)  (two-fluid model approximation)
  if (T >= Tc) return Infinity;
  const t = T / Tc;
  return lambda0 / Math.sqrt(1 - t * t * t * t);
}

function susceptibility(T, Tc, H) {
  // Below Tc and below Hc: perfect diamagnet χ = -1
  const Hc = criticalField(T, Tc, scState.H0);
  if (T < Tc && H < Hc) return -1;
  return 0;  // normal state
}

function _plotSC(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}

const PLOT_CFG = { responsive: true, displayModeBar: false };

function scLayout(title, xtitle, ytitle, extra) {
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
function plotGapVsTemp() {
  const T = [];
  const gap = [];
  const gapRatioArr = [];
  const Tc = scState.Tc;
  const gap0 = gapZero(Tc);

  for (let t = 0.1; t <= 15; t += 0.1) {
    T.push(t);
    const r = gapRatio(t, Tc);
    gap.push(r * gap0);
    gapRatioArr.push(r);
  }

  _plotSC('plot-gap-temp', [
    { x: T, y: gap, mode: 'lines', name: 'Δ(T)',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    },
    { x: [scState.T, scState.T], y: [0, gap0], mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' },
      name: 'Current T = ' + scState.T.toFixed(1) + ' K'
    }
  ], scLayout(null, 'T (K)', 'Δ (meV)', {
    shapes: [{
      type: 'line', x0: Tc, x1: Tc, y0: 0, y1: gap0,
      line: { color: '#ff4ecd', width: 1, dash: 'dash' }
    }],
    annotations: [{
      x: Tc, y: gap0, text: 'Tc = ' + Tc.toFixed(1) + ' K',
      font: { color: '#ff4ecd', size: 10 }, showarrow: true, arrowhead: 2, ax: 40, ay: -30
    }]
  }), PLOT_CFG);
}

function plotMagnetization() {
  const T = [];
  const M = [];
  const Tc = scState.Tc;
  const H0 = scState.H0;
  const H = scState.H;

  for (let t = 0.1; t <= 15; t += 0.1) {
    T.push(t);
    const Hc = criticalField(t, Tc, H0);
    if (t < Tc && H < Hc) {
      M.push(-1);  // perfect diamagnet
    } else {
      M.push(0);   // normal state
    }
  }

  _plotSC('plot-magnetization', [
    { x: T, y: M, mode: 'lines', name: 'χ = M/H',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    },
    { x: [scState.T, scState.T], y: [-1, 0], mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' },
      name: 'Current T = ' + scState.T.toFixed(1) + ' K'
    }
  ], scLayout(null, 'T (K)', 'χ (dimensionless)'), PLOT_CFG);
}

function plotPenetration() {
  const x = [];
  const B = [];
  const Tc = scState.Tc;
  const T = scState.T;
  const lambda0 = 40;  // nm for Nb

  if (T >= Tc) {
    // Normal state: field penetrates freely
    for (let xi = 0; xi <= 200; xi += 2) {
      x.push(xi);
      B.push(1.0);
    }
  } else {
    const lambda = londonPenetration(T, Tc, lambda0);
    for (let xi = 0; xi <= 200; xi += 2) {
      x.push(xi);
      B.push(Math.exp(-xi / lambda));
    }
  }

  _plotSC('plot-penetration', [
    { x: x, y: B, mode: 'lines', name: 'B(x)/B₀',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    }
  ], scLayout(null, 'x (nm)', 'B/B₀', {
    annotations: [{
      x: 100, y: 0.5,
      text: T >= Tc ? 'Normal state: field penetrates' : 'Meissner: B ∝ exp(-x/λ_L)',
      font: { color: '#ffd54f', size: 10 }, showarrow: false,
      xref: 'paper', yref: 'paper', x: 0.6, y: 0.5
    }]
  }), PLOT_CFG);
}

function updateLiveSC() {
  const T = scState.T;
  const Tc = scState.Tc;
  const gap0 = gapZero(Tc);
  const r = gapRatio(T, Tc);
  const gap = r * gap0;
  const Hc = criticalField(T, Tc, scState.H0);
  const lambda = londonPenetration(T, Tc, 40);
  const chi = susceptibility(T, Tc, scState.H);

  const elGap = document.getElementById('live-gap');
  if (elGap) elGap.textContent = gap0.toFixed(2) + ' meV';

  const elRatio = document.getElementById('live-gap-ratio');
  if (elRatio) elRatio.textContent = r.toFixed(2);

  const elState = document.getElementById('live-state');
  if (elState) {
    const isSC = T < Tc && scState.H < Hc;
    elState.innerHTML = isSC ? '<span class="tc-badge">Superconducting</span>' : '<span class="normal-badge">Normal</span>';
  }

  const elLambda = document.getElementById('live-lambda');
  if (elLambda) elLambda.textContent = T >= Tc ? '∞ (normal)' : lambda.toFixed(1) + ' nm';

  const elChi = document.getElementById('live-chi');
  if (elChi) elChi.textContent = chi.toFixed(1);
}

// ===== B. CHALLENGE HELPERS =====
function startSCChallenge() {
  // Stub for challenge init from games file
}

// ===== INIT =====
function initSuperconductivity() {
  var sliderT = document.getElementById('slider-T-sc');
  var sliderH = document.getElementById('slider-H');
  var selectMat = document.getElementById('select-material-sc');

  if (sliderT) {
    sliderT.addEventListener('input', function() {
      scState.T = parseFloat(this.value);
      var el = document.getElementById('val-T-sc');
      if (el) el.textContent = scState.T.toFixed(1);
      plotGapVsTemp(); plotMagnetization(); plotPenetration(); updateLiveSC();
    });
  }

  if (sliderH) {
    sliderH.addEventListener('input', function() {
      scState.H = parseFloat(this.value);
      var el = document.getElementById('val-H');
      if (el) el.textContent = scState.H.toFixed(2);
      plotMagnetization(); updateLiveSC();
    });
  }

  if (selectMat) {
    selectMat.addEventListener('change', function() {
      scState.Tc = parseFloat(this.value);
      scState.material = this.options[this.selectedIndex].text.split('—')[0].trim();
      var el = document.getElementById('val-Tc');
      if (el) el.textContent = scState.Tc.toFixed(1);
      // Update H0 based on material roughly
      scState.H0 = scState.Tc > 20 ? 15 : (scState.Tc > 5 ? 0.2 : 0.05);
      plotGapVsTemp(); plotMagnetization(); plotPenetration(); updateLiveSC();
    });
  }

  plotGapVsTemp(); plotMagnetization(); plotPenetration(); updateLiveSC();
}

initSuperconductivity();
window.initSuperconductivity = initSuperconductivity;

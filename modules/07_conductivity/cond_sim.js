/**
 * Electrical Conductivity — Physics Engine (v2)
 * Multi-electron drift, ρ(T) with Bloch-Grüneisen, mean free path explorer.
 * Units: energy in eV, time in fs, length in nm.
 */

'use strict';

const e_charge = 1.602e-19;
const m_e_kg = 9.109e-31;
const kB_eV = 8.617e-5;
const nm = 1e-9;

let state = {
  Efield: 0.01,
  tau: 30,
  T: 300,
  n: 1e28,
  numElectrons: 50,
  material: 'Cu'
};

function driftVelocity(Ef, tau) {
  const E_SI = Ef * 1e9;
  const tau_SI = tau * 1e-15;
  return e_charge * E_SI * tau_SI / m_e_kg;
}

function conductivity(n, tau) {
  const tau_SI = tau * 1e-15;
  return n * e_charge * e_charge * tau_SI / m_e_kg;
}

function resistivity(n, tau) {
  return 1 / conductivity(n, tau);
}

function meanFreePath(tau, EF) {
  const vF = Math.sqrt(2 * EF * e_charge / m_e_kg);
  const tau_SI = tau * 1e-15;
  return vF * tau_SI * 1e9;
}

function hallCoefficient(n) {
  return -1 / (n * e_charge);
}

// Bloch-Grüneisen temperature dependence of resistivity
function blochGrueneisen(T, thetaD) {
  const x = T / thetaD;
  if (x < 0.1) return 1;  // residual resistivity at low T
  if (x < 1) {
    // Low-T: ρ ∝ T⁵ (Umklapp processes freeze out)
    return 124.4 * Math.pow(x, 5);
  }
  // High-T: ρ ∝ T (linear, all phonon modes excited)
  return 1.6 * x;
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
function plotDrift() {
  // Multi-electron drift trajectories
  const dt = 0.5;
  const steps = 200;
  const a = e_charge * state.Efield * 1e9 / m_e_kg * 1e-15;  // nm/fs²
  const traces = [];

  for (let e = 0; e < Math.min(state.numElectrons, 20); e++) {
    const t = [], x = [];
    let xi = (Math.random() - 0.5) * 10;
    let vxi = (Math.random() - 0.5) * 0.5;
    let timeSinceScatter = Math.random() * state.tau;

    for (let i = 0; i < steps; i++) {
      const ti = i * dt;
      t.push(ti);

      timeSinceScatter += dt;
      if (timeSinceScatter >= state.tau) {
        vxi = (Math.random() - 0.5) * 0.3;  // random thermal velocity
        timeSinceScatter = 0;
      }

      vxi += a * dt;
      xi += vxi * dt;
      x.push(xi);
    }

    traces.push({
      x: t, y: x, mode: 'lines',
      line: { color: 'rgba(0,240,255,0.3)', width: 1 },
      hoverinfo: 'skip', showlegend: false
    });
  }

  // Average drift line
  const tAvg = [];
  const xAvg = [];
  const v_d = a * state.tau;  // average drift velocity
  for (let i = 0; i < steps; i++) {
    tAvg.push(i * dt);
    xAvg.push(v_d * i * dt * 0.8);  // ~0.8 factor from random walk
  }
  traces.push({
    x: tAvg, y: xAvg, mode: 'lines', name: 'Average drift',
    line: { color: '#ffd740', width: 2.5, dash: 'dash' }
  });

  _plot('plot-drift', traces, layout(null, 't (fs)', 'x (nm)'), PLOT_CFG);
}

function plotRhoT() {
  const T = [];
  const rho_Cu = [];
  const rho_Al = [];
  const rho_Si = [];

  for (let t = 10; t <= 600; t += 5) {
    T.push(t);

    // Cu: Bloch-Grüneisen with θ_D = 315 K
    const bg_Cu = blochGrueneisen(t, 315);
    rho_Cu.push(1.7 * bg_Cu);  // μΩ·cm at 300K reference

    // Al: θ_D = 394 K
    const bg_Al = blochGrueneisen(t, 394);
    rho_Al.push(2.7 * bg_Al);

    // Si (semiconductor): ρ ∝ exp(Eg/2kT)
    const sigma = 1e-3 * Math.exp(-1.1 / (2 * kB_eV * t));
    rho_Si.push(1 / sigma * 1e-5);
  }

  _plot('plot-rhoT', [
    { x: T, y: rho_Cu, mode: 'lines', name: 'Cu (θ_D=315K)',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    },
    { x: T, y: rho_Al, mode: 'lines', name: 'Al (θ_D=394K)',
      line: { color: '#c084fc', width: 2 }
    },
    { x: T, y: rho_Si, mode: 'lines', name: 'Si (semiconductor)',
      line: { color: '#4ade80', width: 2.5 },
      yaxis: 'y2'
    }
  ], {
    margin: { t: 25, r: 55, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: 'T (K)', color: '#505070', gridcolor: '#1a1a28' },
    yaxis: { title: 'ρ_metal (μΩ·cm)', color: '#00f0ff', gridcolor: '#1a1a28' },
    yaxis2: { overlaying: 'y', side: 'right', title: 'ρ_Si (Ω·cm)', color: '#4ade80', gridcolor: '#1a1a28', type: 'log' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 }
  }, PLOT_CFG);
}

function plotScattering() {
  // Mean free path vs temperature with different mechanisms
  const T = [];
  const l_ph = [];
  const l_imp = [];
  const l_total = [];

  for (let t = 10; t <= 500; t += 5) {
    T.push(t);

    // Electron-phonon: λ ∝ 1/T at high T, constant at low T
    const l_p = 40 * (300 / Math.max(t, 50));
    l_ph.push(l_p);

    // Impurity scattering: temperature-independent
    const l_i = 200;  // nm, from impurity concentration
    l_imp.push(l_i);

    // Matthiessen's rule: 1/λ_total = 1/λ_ph + 1/λ_imp
    l_total.push(1 / (1/l_p + 1/l_i));
  }

  _plot('plot-scattering', [
    { x: T, y: l_ph, mode: 'lines', name: 'e⁻-phonon',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    },
    { x: T, y: l_imp, mode: 'lines', name: 'e⁻-impurity',
      line: { color: '#ff4ecd', width: 2, dash: 'dash' }
    },
    { x: T, y: l_total, mode: 'lines', name: 'Total (Matthiessen)',
      line: { color: '#ffd740', width: 2.5 }
    }
  ], layout(null, 'T (K)', 'Mean free path λ (nm)'), PLOT_CFG);
}

function updateLiveTable() {
  const vd = driftVelocity(state.Efield, state.tau);
  const sigma = conductivity(state.n, state.tau);
  const rho = resistivity(state.n, state.tau);
  const lambda = meanFreePath(state.tau, 5.0);
  const RH = hallCoefficient(state.n);

  var elE = document.getElementById('live-E');
  if (elE) elE.textContent = state.Efield.toFixed(3) + ' V/nm';
  var elTau = document.getElementById('live-tau');
  if (elTau) elTau.textContent = state.tau + ' fs';
  var elVd = document.getElementById('live-vd');
  if (elVd) elVd.textContent = (vd * 1e-3).toFixed(2) + ' mm/s';
  var elSigma = document.getElementById('live-sigma');
  if (elSigma) elSigma.textContent = (sigma / 1e7).toFixed(1) + '×10⁷ S/m';
  var elRho = document.getElementById('live-rho');
  if (elRho) elRho.textContent = (rho * 1e8).toFixed(2) + ' μΩ·cm';
  var elLambda = document.getElementById('live-lambda');
  if (elLambda) elLambda.textContent = lambda.toFixed(1) + ' nm';
  var elRH = document.getElementById('live-RH');
  if (elRH) elRH.textContent = (RH * 1e9).toFixed(3) + '×10⁻⁹ m³/C';
}

// ===== C. APPLICATIONS =====
function plotHall() {
  const B = [];
  const VH_n = [];
  const VH_p = [];
  const thickness = 100 * nm;
  const I = 1e-3;

  for (let b = 0; b <= 2; b += 0.02) {
    B.push(b);
    const n = 1e28;
    const vh = I * b / (n * e_charge * thickness);
    VH_n.push(vh * 1e6);
    VH_p.push(-vh * 1e6);
  }

  _plot('plot-hall', [
    { x: B, y: VH_n, mode: 'lines', name: 'n-type',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    },
    { x: B, y: VH_p, mode: 'lines', name: 'p-type',
      line: { color: '#ff4ecd', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(255,78,205,0.08)'
    }
  ], layout(null, 'B (T)', 'V_H (μV)'), PLOT_CFG);
}

function plotIoffe() {
  const T = [];
  const kFl = [];
  const limit = [];

  for (let t = 10; t <= 1000; t += 10) {
    T.push(t);
    const tau = 50 * 300 / t;
    const lambda = meanFreePath(tau, 5.0);
    const kF = Math.sqrt(2 * 5.0);
    kFl.push(kF * lambda);
    limit.push(1);
  }

  _plot('plot-ioffe', [
    { x: T, y: kFl, mode: 'lines', name: 'k_F λ',
      line: { color: '#ffd740', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(255,215,64,0.08)'
    },
    { x: T, y: limit, mode: 'lines', name: 'Ioffe-Regel',
      line: { color: '#ff4ecd', width: 2, dash: 'dash' }
    }
  ], layout(null, 'T (K)', 'k_F λ'), PLOT_CFG);
}

function plotWiedemann() {
  const T = [];
  const L = [];

  for (let t = 50; t <= 500; t += 5) {
    T.push(t);
    L.push(2.44e-8);
  }

  _plot('plot-wiedemann', [
    { x: T, y: L, mode: 'lines', name: 'L = κ/σT',
      line: { color: '#4ade80', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.08)'
    }
  ], layout(null, 'T (K)', 'L (WΩ/K²)'), PLOT_CFG);
}

// ============ INIT ============
function initConductivity() {
  var sliderE = document.getElementById('slider-E');
  var sliderTau = document.getElementById('slider-tau');
  var btnRegen = document.getElementById('btn-regenerate');

  if (sliderE) {
    sliderE.addEventListener('input', function() {
      state.Efield = parseFloat(this.value);
      var el = document.getElementById('val-E');
      if (el) el.textContent = state.Efield.toFixed(3);
      plotDrift(); updateLiveTable();
    });
  }

  if (sliderTau) {
    sliderTau.addEventListener('input', function() {
      state.tau = parseFloat(this.value);
      var el = document.getElementById('val-tau');
      if (el) el.textContent = state.tau;
      plotDrift(); plotRhoT(); plotScattering(); updateLiveTable();
    });
  }

  if (btnRegen) {
    btnRegen.addEventListener('click', function() {
      plotDrift();
    });
  }

  plotDrift(); plotRhoT(); plotScattering();
  plotHall(); plotIoffe(); plotWiedemann();
  updateLiveTable();
}

initConductivity();
window.initConductivity = initConductivity;

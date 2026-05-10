/**
 * Kronig-Penney Applications — Interactive Simulations
 * Semiconductor bandgap, superlattice, photonic crystal, Bloch oscillations.
 */

'use strict';

function _plotApp(id, traces, layout, cfg) {
  var el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || {responsive: true, displayModeBar: false});
}

function linspace(a, b, n) { var arr = new Array(n); for (let i = 0; i < n; i++) arr[i] = a + i * (b - a) / (n - 1); return arr; }

// ============ APP 1: SEMICONDUCTOR BANDGAP vs TEMPERATURE ============
function plotBandgapTemp(T_C) {
  // Varshni equation: E_g(T) = E_g(0) - α T² / (T + β)
  var T = linspace(0, 600, 100);
  var materials = [
    { name: 'Si', Eg0: 1.17, alpha: 4.73e-4, beta: 636, color: '#00f0ff' },
    { name: 'GaAs', Eg0: 1.52, alpha: 5.41e-4, beta: 204, color: '#ff4ecd' },
    { name: 'Ge', Eg0: 0.74, alpha: 4.77e-4, beta: 235, color: '#4ade80' }
  ];

  var traces = materials.map(function(m) {
    var Eg = T.map(function(t) { return m.Eg0 - m.alpha * t*t / (t + m.beta); });
    return {
      x: T, y: Eg, mode: 'lines', name: m.name,
      line: { color: m.color, width: 2 }
    };
  });

  // Mark current temperature
  traces.push({
    x: [T_C, T_C], y: [0, 2], mode: 'lines',
    line: { color: '#ffd54f', width: 2, dash: 'dash' }, name: 'T = ' + T_C.toFixed(0) + ' K',
    showlegend: true
  });

  _plotApp('app-bandgap-temp', traces, {
    title: { text: 'Bandgap vs Temperature: Varshni Equation', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'T (K)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'E_g (eV)', gridcolor: '#2a2a3a', range: [0, 1.7] },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.7, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Varshni:</b> E_g(T) = E_g(0) − αT²/(T+β)<br>Red shift with T → more conductivity<br>Si at 300K: E_g = 1.12 eV<br>GaAs at 300K: E_g = 1.42 eV',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 2: SUPERLATTICE — MULTIPLE QUANTUM WELLS ============
function plotSuperlattice(N_wells) {
  // N coupled wells → N minibands
  var N = Math.max(2, Math.min(10, N_wells));
  var E_single = 0.5;  // ground state of single well (eV)
  var t = 0.05;  // tunneling between wells (eV)

  // Tight-binding for N wells: E_k = E₀ + 2t cos(kπ/(N+1))
  var kArr = linspace(0, Math.PI, 50);
  var traces = [];
  for (let band = 0; band < Math.min(N, 5); band++) {
    var Ek = kArr.map(function(k) {
      return E_single + 2 * t * Math.cos((band + 1) * k / (N + 1));
    });
    traces.push({
      x: kArr.map(function(k) { return k / Math.PI; }),
      y: Ek, mode: 'lines',
      name: 'Miniband ' + (band + 1),
      line: { width: 2 }
    });
  }

  _plotApp('app-superlattice', traces, {
    title: { text: 'Superlattice: N=' + N + ' Quantum Wells → ' + N + ' Minibands', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'k/π', gridcolor: '#2a2a3a' },
    yaxis: { title: 'E (eV)', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Real structures:</b><br>GaAs/AlGaAs: 5-20 nm wells<br>InAs/GaSb: type-II alignment<br><br>Applications:<br>· Quantum cascade lasers<br>· Resonant tunneling diodes<br>· Bloch oscillators',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 3: PHOTONIC CRYSTAL — BANDGAP FOR LIGHT ============
function plotPhotonicCrystal(a_nm) {
  // 1D photonic crystal: alternating layers with n1, n2
  var n1 = 1.0, n2 = 2.5;  // air / TiO2
  var a = a_nm;  // lattice constant in nm
  var kArr = linspace(0, Math.PI / a, 100);

  // Simplified dispersion: ω(k) for TE modes in 1D periodic structure
  var omega = kArr.map(function(k) {
    return 3e8 * k / (2 * Math.PI);  // ω = ck/2π in Hz (simplified)
  });
  var lambda = omega.map(function(w) { return 3e8 / w * 1e9; });  // nm

  // Bandgap region (simplified: between Bragg wavelengths)
  var lambdaBragg1 = 2 * a * n1;
  var lambdaBragg2 = 2 * a * n2;

  _plotApp('app-photonic', [
    { x: kArr.map(function(k) { return k * a / Math.PI; }),
      y: lambda, mode: 'lines', name: 'Allowed modes',
      line: { color: '#00f0ff', width: 2 }
    },
    { x: [0, 1], y: [lambdaBragg1, lambdaBragg1], mode: 'lines',
      line: { color: '#ff4ecd', width: 1, dash: 'dash' }, name: 'Band edge', showlegend: false },
    { x: [0, 1], y: [lambdaBragg2, lambdaBragg2], mode: 'lines',
      line: { color: '#ff4ecd', width: 1, dash: 'dash' }, showlegend: false }
  ], {
    title: { text: '1D Photonic Crystal: a = ' + a.toFixed(0) + ' nm, n₁=1.0, n₂=2.5', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'k a / π', gridcolor: '#2a2a3a' },
    yaxis: { title: 'λ (nm)', gridcolor: '#2a2a3a', type: 'log' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.5, y: (lambdaBragg1 + lambdaBragg2) / 2,
        text: 'Photonic bandgap<br>No modes allowed',
        font: { size: 10, color: '#ff4ecd' }, showarrow: false
      },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Applications:</b><br>· Bragg mirrors (VCSELs)<br>· Photonic crystal fibers<br>· Optical filters<br>· Slow-light waveguides<br><br><b>2D/3D PCs:</b><br>Complete bandgap possible',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 4: BLOCH OSCILLATIONS ============
function plotBlochOscillations(E_field) {
  // Electron in periodic potential + electric field → Bloch oscillations
  // x(t) = (Δ/2eE) [1 - cos(ω_B t)] where ω_B = eEa/ℏ
  var a = 0.5e-9;  // lattice constant (m)
  var e = 1.6e-19;
  var hbar = 1.055e-34;
  var omega_B = e * E_field * a / hbar;  // Bloch frequency
  var T_B = 2 * Math.PI / omega_B * 1e12;  // period in ps

  var tArr = linspace(0, 3 * T_B, 200);
  var x = tArr.map(function(t) {
    return 0.5 * a * 1e9 * (1 - Math.cos(omega_B * t * 1e-12));  // in nm
  });
  var v = tArr.map(function(t) {
    return 0.5 * a * 1e9 * omega_B * 1e-12 * Math.sin(omega_B * t * 1e-12);  // in nm/ps
  });

  _plotApp('app-bloch', [
    { x: tArr, y: x, mode: 'lines', name: 'Position x(t) (nm)',
      line: { color: '#00f0ff', width: 2 } },
    { x: tArr, y: v, mode: 'lines', name: 'Velocity v(t) (nm/ps)',
      line: { color: '#ff4ecd', width: 2 }, yaxis: 'y2' }
  ], {
    title: { text: 'Bloch Oscillations: E = ' + E_field.toFixed(1) + ' V/m, T_B = ' + T_B.toFixed(2) + ' ps', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 't (ps)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'x (nm)', gridcolor: '#2a2a3a', side: 'left', color: '#00f0ff' },
    yaxis2: { title: 'v (nm/ps)', overlaying: 'y', side: 'right', color: '#ff4ecd', showgrid: false },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 50, t: 40, b: 40 },
    legend: { x: 0.5, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Bloch frequency:</b> ω_B = eEa/ℏ<br>In solids: scattering destroys<br>oscillations (τ &lt; T_B)<br><br><b>Observed in:</b><br>· Ultracold atoms in lattices<br>· Semiconductor superlattices<br>· Photonic lattices',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 5: TUNNELING PROBABILITY vs BARRIER ============
function plotTunneling(V0_eV) {
  // WKB approximation: T ≈ exp(-2 ∫ κ dx), κ = √(2m(V-E))/ℏ
  var m = 9.11e-31;
  var hbar = 1.055e-34;
  var e = 1.6e-19;
  var E = 0.1 * e;  // electron energy in J (0.1 eV)
  var bArr = linspace(0.1, 5, 100);  // barrier width in nm

  var T = bArr.map(function(b) {
    var b_m = b * 1e-9;
    var kappa = Math.sqrt(2 * m * (V0_eV * e - E)) / hbar;
    return Math.exp(-2 * kappa * b_m);
  });

  _plotApp('app-tunneling', [
    { x: bArr, y: T, mode: 'lines', name: 'Transmission probability',
      line: { color: '#00f0ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)' },
    { x: [bArr[bArr.length-1] * 0.7], y: [Math.exp(-2 * Math.sqrt(2 * m * (V0_eV * e - E)) / hbar * bArr[bArr.length-1] * 1e-9 * 0.7)],
      mode: 'markers', marker: { size: 14, color: '#ff4ecd', symbol: 'star' },
      name: 'T ≈ ' + T[T.length-1].toExponential(1), showlegend: true }
  ], {
    title: { text: 'Quantum Tunneling: T vs width, V₀ = ' + V0_eV.toFixed(1) + ' eV, E = 0.1 eV', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'Barrier width b (nm)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'Transmission T', gridcolor: '#2a2a3a', type: 'log' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>WKB:</b> T ≈ exp(−2κb)<br>κ = √[2m(V₀−E)]/ℏ<br><br><b>Applications:</b><br>· STM (electron tunneling)<br>· Flash memory (Fowler-Nordheim)<br>· Resonant tunneling diodes<br>· Alpha decay (Gamow factor)',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 6: RESONANT TUNNELING DIODE (I-V) ============
function plotRTD(V_applied) {
  // Simplified RTD I-V: peak at resonance, valley at off-resonance
  var V = linspace(0, 1, 100);
  var E_res = 0.15;  // resonant energy (eV)
  var Gamma = 0.02;  // linewidth

  var I = V.map(function(v) {
    var T = Gamma * Gamma / (Math.pow(v - E_res, 2) + Gamma * Gamma);
    return v * T * 100;  // arbitrary current units
  });

  _plotApp('app-rtd', [
    { x: V, y: I, mode: 'lines', name: 'I(V)',
      line: { color: '#00f0ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)' },
    { x: [E_res, E_res], y: [0, Math.max(...I)], mode: 'lines',
      line: { color: '#ff4ecd', width: 2, dash: 'dash' }, name: 'E_res = ' + E_res.toFixed(2) + ' eV' }
  ], {
    title: { text: 'Resonant Tunneling Diode: I-V Characteristic', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'V (V)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'I (arb.)', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.6, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: E_res + 0.05, y: Math.max(...I) * 0.5,
        text: 'Peak current<br>at resonance<br>N DC &gt; 1 possible',
        font: { size: 10, color: '#ff4ecd' }, showarrow: true, arrowhead: 2, ax: 40, ay: -30
      },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>RTD features:</b><br>· Negative differential conductance<br>· Ultra-fast switching (&lt; ps)<br>· Low power<br><br><b>Uses:</b><br>· Oscillators (THz)<br>· Logic circuits<br>· ADCs',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ MASTER INIT ============
function initKPApps() {
  console.log('KP Apps: initializing...');
  plotBandgapTemp(300);
  plotSuperlattice(5);
  plotPhotonicCrystal(200);
  plotBlochOscillations(1e5);
  plotTunneling(1.0);
  plotRTD(0.2);

  var tempSlider = document.getElementById('slider-temp');
  if (tempSlider) tempSlider.addEventListener('input', function(){ var T=parseFloat(this.value); document.getElementById('val-temp').textContent=T.toFixed(0); plotBandgapTemp(T); });

  var wellSlider = document.getElementById('slider-wells');
  if (wellSlider) wellSlider.addEventListener('input', function(){ var N=parseInt(this.value); document.getElementById('val-wells').textContent=N; plotSuperlattice(N); });

  var aSlider = document.getElementById('slider-pc-a');
  if (aSlider) aSlider.addEventListener('input', function(){ var a=parseFloat(this.value); document.getElementById('val-pc-a').textContent=a.toFixed(0); plotPhotonicCrystal(a); });

  var eSlider = document.getElementById('slider-efield');
  if (eSlider) eSlider.addEventListener('input', function(){ var E=parseFloat(this.value); document.getElementById('val-efield').textContent=E.toFixed(1); plotBlochOscillations(E * 1e5); });

  console.log('KP Apps: done');
}

if (document.readyState !== 'loading') setTimeout(initKPApps, 800);
else document.addEventListener('DOMContentLoaded', function(){ setTimeout(initKPApps, 800); });

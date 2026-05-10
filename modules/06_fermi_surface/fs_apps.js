/**
 * Fermi Surface Applications — Interactive Simulations
 * Debye temperature, specific heat, superconducting gap, quantum oscillations.
 */

'use strict';

function _plotApp(id, traces, layout, cfg) {
  var el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || {responsive: true, displayModeBar: false});
}

function linspace(a, b, n) { var arr = new Array(n); for (let i = 0; i < n; i++) arr[i] = a + i * (b - a) / (n - 1); return arr; }

// ============ APP 1: DEBYE MODEL — SPECIFIC HEAT ============
function plotDebye(T_max) {
  var T = linspace(1, T_max, 200);
  var theta_D = 315;  // Cu Debye temperature

  var Cv = T.map(function(t) {
    var x = theta_D / t;
    // Simplified Debye model: Cv ≈ 9R (T/θ_D)³ for T &lt; θ_D, ≈ 3R for T &gt; θ_D
    if (t < theta_D / 3) return 234 * Math.pow(t / theta_D, 3);
    return 24.9;  // 3R in J/mol·K
  });

  _plotApp('app-debye', [
    { x: T, y: Cv, mode: 'lines', name: 'C_v (J/mol·K)',
      line: { color: '#00d4ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' },
    { x: [theta_D, theta_D], y: [0, 30], mode: 'lines',
      line: { color: '#ff4081', width: 2, dash: 'dash' }, name: 'θ_D = 315 K (Cu)' }
  ], {
    title: { text: 'Debye Model: Specific Heat C_v(T) for Copper', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'T (K)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'C_v (J/mol·K)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.5, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: theta_D / 3, y: 5, text: 'T³ law<br>C_v ∝ T³',
        font: { size: 9, color: '#ffd54f' }, showarrow: true, arrowhead: 2, ax: -30, ay: -30 },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Debye θ_D:</b><br>Pb: 105 K · Cu: 315 K<br>Al: 394 K · C: 2230 K<br>Diamond → highest θ_D<br><br><b>At low T:</b><br>C_v = (12π⁴/5) Nk_B (T/θ_D)³<br>Probes phonon DOS',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 2: SUPERCONDUCTING GAP ============
function plotSCGap(T_max) {
  var Tc = 9.2;  // Nb Tc
  var T = linspace(0.1, T_max, 200);

  // BCS gap: Δ(T) ≈ 3.06 k_B T_c √(1 - T/T_c) near T_c
  var gap = T.map(function(t) {
    if (t >= Tc) return 0;
    return 1.76 * 0.0862 * Tc * Math.sqrt(1 - Math.pow(t / Tc, 2));  // meV
  });

  _plotApp('app-sc', [
    { x: T, y: gap, mode: 'lines', name: 'Δ(T) (meV)',
      line: { color: '#00d4ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' },
    { x: [Tc, Tc], y: [0, 2], mode: 'lines',
      line: { color: '#ff4081', width: 2, dash: 'dash' }, name: 'T_c = ' + Tc.toFixed(1) + ' K' }
  ], {
    title: { text: 'BCS Superconducting Gap: Δ(T) for Niobium (T_c = 9.2 K)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'T (K)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'Δ (meV)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.6, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: Tc / 2, y: gap[Math.floor(gap.length / 4)],
        text: 'T = 0: Δ = 1.76 k_B T_c<br>= 1.38 meV for Nb',
        font: { size: 10, color: '#00d4ff' }, showarrow: true, arrowhead: 2, ax: -40, ay: -30
      },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>BCS theory:</b><br>Δ(0) = 2ℏω_D exp(−1/V₀g(E_F))<br>2Δ(0)/k_B T_c = 3.52 (universal)<br><br><b>Materials:</b><br>Nb: 9.2 K · Al: 1.2 K<br>YBCO: 93 K (high-T_c)<br>MgB₂: 39 K',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 3: QUANTUM OSCILLATIONS (dHvA) ============
function plotQuantumOsc(B_inv) {
  // de Haas-van Alphen: M oscillates with 1/B
  // Frequency F = ℏ A_k / (2π e)
  var B = linspace(1, 20, 500);
  var F = 5;  // oscillation frequency (kT)
  var T_damping = 1;  // Dingle temperature

  var M = B.map(function(b) {
    return Math.sin(2 * Math.PI * F / b) * Math.exp(-2 * Math.PI * T_damping / b);
  });

  _plotApp('app-dhva', [
    { x: B, y: M, mode: 'lines', name: 'Magnetization (arb.)',
      line: { color: '#00d4ff', width: 1 } }
  ], {
    title: { text: 'de Haas-van Alphen: Quantum Oscillations in Magnetization', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'B (T)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'M (arb.)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>dHvA:</b><br>Oscillation freq F = ℏ A_k/(2πe)<br>A_k = extremal FS cross-section<br><br><b>Reveals:</b><br>· Fermi surface shape<br>· Effective mass m*<br>· Scattering time τ<br>· Berry phase (π in 2D)',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 4: FERMI LIQUID — QUASIPARTICLE LIFETIME ============
function plotFermiLiquid() {
  var E = linspace(0.001, 0.5, 100);  // energy above E_F in eV
  // τ ∝ 1/(E - E_F)² for e-e scattering
  var tau = E.map(function(e) { return 1 / (e * e); });

  _plotApp('app-fermi-liquid', [
    { x: E, y: tau, mode: 'lines', name: 'τ_e-e (arb.)',
      line: { color: '#00d4ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' }
  ], {
    title: { text: 'Fermi Liquid: Quasiparticle Lifetime τ ∝ 1/(E−E_F)²', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'E − E_F (eV)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'τ (arb.)', gridcolor: '#2a2a3a', type: 'log' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Landau Fermi liquid:</b><br>Quasiparticles: electrons + screening<br>τ ∝ 1/(E−E_F)² → well-defined<br>at low E<br><br><b>Breaks down:</b><br>· High-T_c superconductors<br>· Quantum critical points<br>· 1D (Luttinger liquid)',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 5: THERMAL CONDUCTIVITY WIEDEMANN-FRANZ ============
function plotWiedemannFranz(T_max) {
  var T = linspace(10, T_max, 100);
  var L0 = 2.44e-8;  // Wiedemann-Franz constant (W·Ω/K²)

  // For Cu: κ/σT ≈ L0 (Lorentz number)
  var sigma = 5.8e7;  // S/m for Cu
  var kappa = T.map(function(t) { return L0 * sigma * t; });

  _plotApp('app-wf', [
    { x: T, y: kappa, mode: 'lines', name: 'κ_e (W/m·K)',
      line: { color: '#00d4ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' },
    { x: [300, 300], y: [0, kappa[Math.floor(T.length * 0.7)]], mode: 'lines',
      line: { color: '#ff4081', width: 2, dash: 'dash' }, name: 'Room T' }
  ], {
    title: { text: 'Wiedemann-Franz Law: κ_e/σT = L₀ = 2.44×10⁻⁸ W·Ω/K² (Cu)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'T (K)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'κ_e (W/m·K)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.6, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>W-F law:</b><br>κ_e = L₀ σ T<br>Same carriers carry<br>both charge & heat<br><br><b>At low T:</b><br>Phonons dominate κ<br>κ_ph ∝ T³ (Debye)<br><br><b>Violations:</b><br>Inelastic scattering',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 6: ELECTRONIC SPECIFIC HEAT γT ============
function plotElectronicCv() {
  var T = linspace(0.1, 10, 100);
  var gamma = 0.695;  // mJ/mol·K² for Cu

  var Cel = T.map(function(t) { return gamma * t; });

  _plotApp('app-cel', [
    { x: T, y: Cel, mode: 'lines', name: 'C_el = γT (mJ/mol·K)',
      line: { color: '#00d4ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' }
  ], {
    title: { text: 'Electronic Specific Heat: C_el = γT (Sommerfeld), γ = 0.695 mJ/mol·K² (Cu)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'T (K)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'C_el (mJ/mol·K)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Sommerfeld:</b><br>γ = (π²/3) k_B² g(E_F)<br>= (π²/2) (Nk_B/T_F)<br><br><b>Heavy fermions:</b><br>γ ~ 1 J/mol·K²<br>m* ~ 1000 mₑ<br><br><b>Cu:</b><br>γ = 0.695 mJ/mol·K²<br>T_F = 81,000 K',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ MASTER INIT ============
function initFSApps() {
  console.log('FS Apps: initializing...');
  plotDebye(500);
  plotSCGap(15);
  plotQuantumOsc(10);
  plotFermiLiquid();
  plotWiedemannFranz(400);
  plotElectronicCv();

  console.log('FS Apps: done');
}

if (document.readyState !== 'loading') setTimeout(initFSApps, 800);
else document.addEventListener('DOMContentLoaded', function(){ setTimeout(initFSApps, 800); });

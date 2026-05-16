/**
 * QHO Applications — Interactive Simulations (qho_apps.js)
 * Replaces static application cards with live Plotly visualizations.
 * Units: ħω = 1, T in K, λ in nm.
 */

'use strict';

// ============ HELPERS ============
// ============ APP 1: IR SPECTRUM (already in main engine, enhanced) ============
function plotIRApp(xe) {
  var nu = [];
  for (let v = 0; v <= 10; v++) nu.push(v + 0.5 - xe * Math.pow(v + 0.5, 2));
  var transitions = [];
  for (let v = 1; v <= 10; v++) transitions.push({ from: v, to: v - 1, e: nu[v] - nu[v - 1] });

  _plotApp('app-ir', [
    { x: transitions.map(t => t.e), y: transitions.map((_, i) => i + 1), type: 'bar',
      orientation: 'h', marker: { color: transitions.map((_, i) => i === 0 ? '#00f0ff' : i < 3 ? '#4ade80' : '#2a2a3a') },
      text: transitions.map(t => 'ΔE=' + t.e.toFixed(3) + 'ħω'), textposition: 'outside',
      textfont: { color: '#e0e0f0', size: 10 },
      hovertemplate: 'v=%{y}: ΔE=%{x:.3f}ħω<extra></extra>'
    }
  ], {
    title: { text: 'IR Absorption Spectrum: v → v−1 transitions', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'ΔE / ħω', gridcolor: '#2a2a3a', range: [0.5, 1.1] },
    yaxis: { title: 'Initial vibrational level v', gridcolor: '#2a2a3a', dtick: 1 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 100, t: 40, b: 40 },
    annotations: [
      { x: 0.95, y: 0.95, xref: 'paper', yref: 'paper',
        text: '<b>Anharmonicity:</b><br>xₑ = ' + xe.toFixed(3) + '<br>H₂: xₑ≈0.03<br>CO: xₑ≈0.006',
        font: { size: 10, color: '#8080a0' }, showarrow: false, align: 'left',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderwidth: 1, borderpad: 6
      }
    ]
  });
}

// ============ APP 2: PHONON DISPERSION (1D chain) ============
function plotPhonon() {
  var kArr = linspace(-Math.PI, Math.PI, 200);
  var M_ratio = 2.0;  // M_light / M_heavy for diatomic

  // Monatomic chain: ω = 2√(K/M) |sin(ka/2)|
  var omega_mono = kArr.map(k => 2 * Math.abs(Math.sin(k / 2)));
  // Diatomic chain (optical + acoustic branches)
  var omega_ac = kArr.map(k => Math.sqrt((1 + M_ratio) - Math.sqrt((1 + M_ratio)**2 - 4 * M_ratio * Math.sin(k/2)**2)));
  var omega_op = kArr.map(k => Math.sqrt((1 + M_ratio) + Math.sqrt((1 + M_ratio)**2 - 4 * M_ratio * Math.sin(k/2)**2)));

  _plotApp('app-phonon', [
    { x: kArr.map(k => k / Math.PI), y: omega_mono, mode: 'lines', name: 'Monatomic (acoustic only)',
      line: { color: '#00f0ff', width: 2 } },
    { x: kArr.map(k => k / Math.PI), y: omega_ac, mode: 'lines', name: 'Acoustic branch',
      line: { color: '#4ade80', width: 2 } },
    { x: kArr.map(k => k / Math.PI), y: omega_op, mode: 'lines', name: 'Optical branch',
      line: { color: '#ff4ecd', width: 2 } },
    { x: [0, 0], y: [0, Math.max(...omega_op)], mode: 'lines', line: { color: '#ffd54f', width: 1, dash: 'dash' }, showlegend: false,
      hoverinfo: 'skip' },
    { x: [1, 1], y: [0, Math.max(...omega_op)], mode: 'lines', line: { color: '#ffd54f', width: 1, dash: 'dash' }, showlegend: false,
      hoverinfo: 'skip' }
  ], {
    title: { text: 'Phonon Dispersion: 1D Atomic Chain', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'k / (π/a)', gridcolor: '#2a2a3a', tickvals: [-1, -0.5, 0, 0.5, 1], ticktext: ['-π/a', '-π/2a', 'Γ', 'π/2a', 'π/a'] },
    yaxis: { title: 'ω / √(K/M)', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    annotations: [
      { x: 0, y: 0.5, xref: 'paper', yref: 'paper',
        text: '<b>Key insight:</b> Optical branch = atoms oscillate out-of-phase. Forbidden gap between branches = no phonon modes can propagate.',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'left',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderwidth: 1, borderpad: 4
      }
    ]
  });
}

// ============ APP 3: CAVITY QED (photon number distribution) ============
function plotCavity(alpha_re, alpha_im) {
  var nMax = 20;
  var alpha2 = alpha_re * alpha_re + alpha_im * alpha_im;
  // Coherent state: P(n) = |α|²ⁿ e^{-|α|²} / n!
  var Pn = [];
  for (let n = 0; n <= nMax; n++) {
    Pn.push(Math.pow(alpha2, n) * Math.exp(-alpha2) / factorial(n));
  }
  var nBar = alpha2;
  var deltaN = Math.sqrt(alpha2);

  _plotApp('app-cavity', [
    { x: Array.from({length: nMax+1}, (_, i) => i), y: Pn, type: 'bar',
      marker: { color: Pn.map((_, i) => Math.abs(i - nBar) < deltaN ? '#00f0ff' : '#2a2a3a') },
      text: Pn.map(p => p > 0.01 ? (p * 100).toFixed(1) + '%' : ''),
      textposition: 'outside', textfont: { color: '#e0e0f0', size: 9 }
    },
    { x: [nBar, nBar], y: [0, Math.max(...Pn)], mode: 'lines',
      line: { color: '#ff4ecd', width: 2, dash: 'dash' }, name: '⟨n⟩ = |α|²', showlegend: true }
  ], {
    title: { text: 'Cavity QED: Photon Number Distribution P(n) = |⟨n|α⟩|²', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'Photon number n', gridcolor: '#2a2a3a', dtick: 2 },
    yaxis: { title: 'Probability P(n)', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.65, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.98, y: 0.85, xref: 'paper', yref: 'paper',
        text: '<b>Coherent state |α⟩</b><br>⟨n⟩ = ' + nBar.toFixed(2) + '<br>Δn = √⟨n⟩ = ' + deltaN.toFixed(2) + '<br>Poisson statistics',
        font: { size: 10, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderwidth: 1, borderpad: 6
      }
    ]
  });
}

// ============ APP 4: TRANSMON QUBIT (anharmonic energy levels) ============
function plotTransmon(EjOverEc) {
  var Ec = 1.0;  // charging energy (reference)
  var Ej = EjOverEc * Ec;
  var nMax = 15;
  // Transmon: E_n ≈ √(8EjEc) (n + ½) − Ec (n + ½)² / 2  (in the limit Ej/Ec >> 1)
  var omega_p = Math.sqrt(8 * Ej * Ec);
  var levels = [];
  for (let n = 0; n < nMax; n++) {
    levels.push(omega_p * (n + 0.5) - Ec * Math.pow(n + 0.5, 2) / 2);
  }
  // Anharmonicity α = E_01 − E_12 = Ec
  var alpha_anharm = levels[1] - levels[0] - (levels[2] - levels[1]);

  _plotApp('app-transmon', [
    { x: levels.map((_, i) => i), y: levels, mode: 'markers+lines',
      marker: { size: levels.map((_, i) => i < 2 ? 14 : 8), color: levels.map((_, i) => i < 2 ? '#00f0ff' : '#2a2a3a') },
      line: { color: '#4ade80', width: 2 },
      text: levels.map((e, i) => i < 2 ? 'E_' + i + ' = ' + e.toFixed(2) + ' GHz' : ''),
      textposition: 'top center', textfont: { size: 10, color: '#e0e0f0' }
    }
  ], {
    title: { text: 'Transmon Qubit: Anharmonic Oscillator Levels', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'Level n', gridcolor: '#2a2a3a', dtick: 1 },
    yaxis: { title: 'E / GHz (relative)', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.02, y: 0.98, xref: 'paper', yref: 'paper',
        text: '<b>Qubit condition:</b><br>E₁ − E₀ = ' + (levels[1]-levels[0]).toFixed(2) + ' GHz<br>E₂ − E₁ = ' + (levels[2]-levels[1]).toFixed(2) + ' GHz<br>Anharmonicity α = ' + alpha_anharm.toFixed(3) + ' GHz<br><b>Ej/Ec = ' + EjOverEc.toFixed(1) + '</b><br><span style="color:#4ade80">IBM/Google: Ej/Ec ~ 50</span>',
        font: { size: 10, color: '#8080a0' }, showarrow: false, align: 'left',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderwidth: 1, borderpad: 6
      },
      { x: 1, y: levels[1] + 2, text: '|1⟩', font: { size: 12, color: '#00f0ff' }, showarrow: true, arrowhead: 2, arrowcolor: '#00f0ff' },
      { x: 0, y: levels[0] + 2, text: '|0⟩', font: { size: 12, color: '#00f0ff' }, showarrow: true, arrowhead: 2, arrowcolor: '#00f0ff' }
    ]
  });
}

// ============ APP 5: OPTICAL TWEEZER (harmonic trap potential) ============
function plotTweezer(laserPower, wavelength) {
  var xArr = linspace(-2, 2, 300);
  // Gaussian beam intensity: I(x) = I₀ exp(-2x²/w²)
  // Dipole potential: U(x) = −α I(x) / (2ε₀c) ∝ −P exp(-2x²/w²)
  var w0 = 0.5;  // beam waist in μm
  var U0 = -laserPower;  // potential depth proportional to power
  var potential = xArr.map(x => U0 * Math.exp(-2 * x * x / (w0 * w0)));
  // Harmonic approximation near center: U ≈ U₀ + ½ m ω² x²
  var omega_trap = Math.sqrt(-2 * U0 / (w0 * w0));  // in natural units

  _plotApp('app-tweezer', [
    { x: xArr, y: potential, mode: 'lines', name: 'Dipole potential U(x)',
      line: { color: '#00f0ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)' },
    { x: xArr, y: xArr.map(x => U0 + 0.5 * omega_trap * omega_trap * x * x), mode: 'lines', name: 'Harmonic approx.',
      line: { color: '#ff4ecd', width: 2, dash: 'dash' } }
  ], {
    title: { text: 'Optical Tweezer: Gaussian Dipole Trap', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x (μm)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'U / U₀ (arbitrary)', gridcolor: '#2a2a3a' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.02, y: 0.02, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.98, y: 0.95, xref: 'paper', yref: 'paper',
        text: '<b>Trap parameters</b><br>P = ' + laserPower.toFixed(1) + ' mW<br>λ = ' + wavelength.toFixed(0) + ' nm<br>ω_trap = ' + omega_trap.toFixed(2) + ' kHz<br>Real: ' + (omega_trap * 100).toFixed(0) + ' kHz<br><span style="color:#4ade80">Typical: 10-500 kHz</span>',
        font: { size: 10, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderwidth: 1, borderpad: 6
      }
    ]
  });
}

// ============ APP 6: SPECIFIC HEAT (Einstein vs Debye) ============
function plotSpecificHeat() {
  var TArr = linspace(0.01, 3, 200);  // T in units of θ_E or θ_D
  // Einstein model: C_V = 3N k_B (θ_E/T)² exp(θ_E/T) / (exp(θ_E/T)−1)²
  var C_Einstein = TArr.map(T => {
    var x = 1 / T;
    return 3 * x * x * Math.exp(x) / Math.pow(Math.exp(x) - 1, 2);
  });
  // Debye model: C_V = 9N k_B (T/θ_D)³ ∫₀^{θ_D/T} x⁴ e^x/(e^x−1)² dx
  // Approximate with series or numerical integral
  var C_Debye = TArr.map(T => {
    if (T > 1.5) return 3 * (1 - 0.05 / (T * T));  // high-T limit
    var integral = 0;
    var N = 500, xmax = 1 / T;
    for (let i = 0; i < N; i++) {
      var x = i * xmax / N;
      var dx = xmax / N;
      if (x > 0) integral += x * x * x * x * Math.exp(x) / Math.pow(Math.exp(x) - 1, 2) * dx;
    }
    return 9 * Math.pow(T, 3) * integral;
  });

  _plotApp('app-heat', [
    { x: TArr, y: C_Einstein, mode: 'lines', name: 'Einstein model',
      line: { color: '#00f0ff', width: 2 } },
    { x: TArr, y: C_Debye, mode: 'lines', name: 'Debye model',
      line: { color: '#4ade80', width: 2 } },
    { x: [0, 3], y: [3, 3], mode: 'lines', line: { color: '#ffd54f', width: 1, dash: 'dash' }, name: 'Dulong-Petit 3R', showlegend: true }
  ], {
    title: { text: 'Specific Heat C_V(T): Einstein vs Debye', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'T / θ (θ_E or θ_D)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'C_V / (3Nk_B)', gridcolor: '#2a2a3a', range: [0, 3.5] },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    annotations: [
      { x: 0.5, y: 2.8, text: 'Dulong-Petit<br>classical limit', font: { size: 9, color: '#ffd54f' }, showarrow: false },
      { x: 0.15, y: 0.5, text: 'Einstein:<br>exponential<br>freeze-out', font: { size: 9, color: '#00f0ff' }, showarrow: false },
      { x: 0.4, y: 0.8, text: 'Debye:<br>T³ law<br>(low T)', font: { size: 9, color: '#4ade80' }, showarrow: false }
    ]
  });
}

// ============ MASTER INIT ============
function initQHOApps() {
  console.log('QHO Apps: initializing...');

  // IR spectrum (already wired to anharmonicity slider in main engine)
  // Just ensure the div exists; plotIRApp is called from main engine

  // Phonon dispersion
  plotPhonon();

  // Cavity QED (default α = 3)
  plotCavity(3, 0);
  var cavSlider = document.getElementById('slider-cavity-alpha');
  if (cavSlider) {
    cavSlider.addEventListener('input', function() {
      var a = parseFloat(this.value);
      document.getElementById('val-cavity-alpha').textContent = a.toFixed(1);
      plotCavity(a, 0);
    });
  }

  // Transmon
  plotTransmon(50);
  var transSlider = document.getElementById('slider-transmon');
  if (transSlider) {
    transSlider.addEventListener('input', function() {
      var e = parseFloat(this.value);
      document.getElementById('val-transmon').textContent = e.toFixed(1);
      plotTransmon(e);
    });
  }

  // Optical tweezer
  plotTweezer(100, 1064);
  var tweezerPower = document.getElementById('slider-tweezer-power');
  var tweezerLambda = document.getElementById('slider-tweezer-lambda');
  function updateTweezer() {
    var p = parseFloat(tweezerPower ? tweezerPower.value : 100);
    var l = parseFloat(tweezerLambda ? tweezerLambda.value : 1064);
    if (document.getElementById('val-tweezer-power')) document.getElementById('val-tweezer-power').textContent = p.toFixed(0);
    if (document.getElementById('val-tweezer-lambda')) document.getElementById('val-tweezer-lambda').textContent = l.toFixed(0);
    plotTweezer(p, l);
  }
  if (tweezerPower) tweezerPower.addEventListener('input', updateTweezer);
  if (tweezerLambda) tweezerLambda.addEventListener('input', updateTweezer);

  // Specific heat
  plotSpecificHeat();

  console.log('QHO Apps: all initialized');
}

// Auto-init if called after DOM ready
if (document.readyState !== 'loading') {
  // Wait a moment for main engine plots to render first
  setTimeout(initQHOApps, 500);
} else {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(initQHOApps, 500); });
}

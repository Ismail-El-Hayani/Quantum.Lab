/**
 * Hydrogen Atom Applications — Interactive Simulations
 * Spectral series, Rydberg scaling, fine structure, Zeeman, stellar HR diagram, Rydberg QC.
 * Units: energy in eV, length in a₀, wavelength in nm.
 */

'use strict';

function _plotApp(id, traces, layout, cfg) {
  var el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || {responsive: true, displayModeBar: false});
}

function linspace(a, b, n) {
  var arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = a + i * (b - a) / (n - 1);
  return arr;
}

// ============ APP 1: EMISSION SPECTRUM (all series) ============
function plotSpectralSeries() {
  var series = [
    { name: 'Lyman (UV)',  n_f: 1, color: '#9d4edd', range: [90, 125] },
    { name: 'Balmer (Vis)', n_f: 2, color: '#00d4ff', range: [360, 660] },
    { name: 'Paschen (IR)', n_f: 3, color: '#ff6d00', range: [800, 1900] },
    { name: 'Brackett (IR)',n_f: 4, color: '#ff4081', range: [1500, 4500] }
  ];

  var traces = [];
  series.forEach(function(s) {
    var wavelengths = [], labels = [], colors = [];
    for (let n_i = s.n_f + 1; n_i <= 8; n_i++) {
      var inv_lambda = 1.097e7 * (1/(s.n_f*s.n_f) - 1/(n_i*n_i)); // Rydberg in m⁻¹
      var lambda_nm = 1e9 / inv_lambda;
      if (lambda_nm >= s.range[0] && lambda_nm <= s.range[1]) {
        wavelengths.push(lambda_nm);
        labels.push(n_i + '→' + s.n_f);
        colors.push(s.color);
      }
    }
    if (wavelengths.length > 0) {
      traces.push({
        x: wavelengths, y: wavelengths.map(() => s.n_f),
        mode: 'markers', name: s.name,
        marker: { size: 14, color: colors, line: { color: '#e0e0f0', width: 1 } },
        text: labels, textposition: 'top center', textfont: { size: 10, color: '#e0e0f0' }
      });
    }
  });

  // Add Balmer lines with specific names
  var balmerNamed = [
    { n: 3, name: 'Hα', lambda: 656.3, color: '#ff0000' },
    { n: 4, name: 'Hβ', lambda: 486.1, color: '#00ff00' },
    { n: 5, name: 'Hγ', lambda: 434.0, color: '#4488ff' },
    { n: 6, name: 'Hδ', lambda: 410.2, color: '#aa44ff' }
  ];
  traces.push({
    x: balmerNamed.map(b => b.lambda), y: balmerNamed.map(() => 2.2),
    mode: 'markers+text', name: 'Balmer lines (named)',
    marker: { size: 18, color: balmerNamed.map(b => b.color), symbol: 'diamond', line: { color: '#fff', width: 2 } },
    text: balmerNamed.map(b => b.name + '\n' + b.lambda + ' nm'),
    textposition: 'bottom center', textfont: { size: 9, color: '#e0e0f0' }
  });

  _plotApp('app-spectral', traces, {
    title: { text: 'Hydrogen Spectral Series: λ(nᵢ → nբ)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'Wavelength λ (nm)', gridcolor: '#2a2a3a', type: 'log' },
    yaxis: { title: 'Final level nբ', gridcolor: '#2a2a3a', dtick: 1, visible: false },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' }
  });
}

// ============ APP 2: RYDBERG SCALING ============
function plotRydbergScaling() {
  var nArr = linspace(1, 50, 50);
  var energy = nArr.map(n => -13.6 / (n * n));
  var radius = nArr.map(n => n * n);        // ⟨r⟩ in a₀
  var dipole = nArr.map(n => 0.5 * n * n * 0.0529); // dipole moment in nm·e

  _plotApp('app-rydberg', [
    { x: nArr, y: energy, mode: 'lines', name: 'Eₙ = −13.6/n² (eV)',
      line: { color: '#00d4ff', width: 2 }, yaxis: 'y' },
    { x: nArr, y: radius, mode: 'lines', name: '⟨r⟩ = n² a₀',
      line: { color: '#ff4081', width: 2, dash: 'dash' }, yaxis: 'y2' },
    { x: nArr, y: dipole, mode: 'lines', name: 'Dipole (a.u.)',
      line: { color: '#69f0ae', width: 1, dash: 'dot' }, yaxis: 'y3' }
  ], {
    title: { text: 'Rydberg Scaling Laws: E ∝ 1/n², ⟨r⟩ ∝ n²', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'Principal quantum number n', gridcolor: '#2a2a3a' },
    yaxis: { title: 'Energy (eV)', gridcolor: '#2a2a3a', side: 'left', color: '#00d4ff' },
    yaxis2: { title: '⟨r⟩ (a₀)', overlaying: 'y', side: 'right', color: '#ff4081', showgrid: false },
    yaxis3: { title: 'Dipole (nm·e)', overlaying: 'y', side: 'right', position: 0.95, color: '#69f0ae', showgrid: false },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 120, t: 40, b: 40 },
    legend: { x: 0.5, y: 0.02, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.98, y: 0.95, xref: 'paper', yref: 'paper',
        text: '<b>Real atoms:</b><br>n=1: ⟨r⟩=0.53 Å<br>n=50: ⟨r⟩=132 nm<br>Dipole ~ n²e a₀<br>QuEra uses n~50-70',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 3: FINE STRUCTURE ============
function plotFineStructure() {
  // n=2 levels: 2S₁/₂, 2P₁/₂, 2P₃/₂
  // Relativistic correction shifts S & P; Lamb shift splits 2S₁/₂ − 2P₁/₂ = 1058 MHz
  var levels = [
    { name: '2S₁/₂',    E: 0,        color: '#00d4ff', width: 3 },
    { name: '2P₁/₂',    E: -4.53e-6, color: '#ff4081', width: 2 },  // relativistic shift
    { name: '2P₃/₂',    E: -4.53e-6 + 4.53e-5, color: '#69f0ae', width: 2 },  // spin-orbit
    { name: '2S₁/₂ (Lamb)', E: 4.37e-6, color: '#ffd54f', width: 2 }  // Lamb shift
  ];

  _plotApp('app-fine', levels.map(function(l) {
    return {
      x: [0, 1], y: [l.E, l.E], mode: 'lines',
      line: { color: l.color, width: l.width }, name: l.name, showlegend: true
    };
  }).concat([
    { x: [0.5, 0.5], y: [0, 4.37e-6], mode: 'lines',
      line: { color: '#ffd54f', width: 1, dash: 'dash' }, showlegend: false, hoverinfo: 'skip' }
  ]), {
    title: { text: 'Fine Structure & Lamb Shift (n=2)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { visible: false, range: [0, 1] },
    yaxis: { title: 'ΔE (eV)', gridcolor: '#2a2a3a', tickformat: '.2e' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 70, r: 20, t: 40, b: 20 },
    legend: { x: 0.65, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.45, y: 2.5e-6, text: 'Lamb shift<br>1058 MHz<br>≈ 4.37 μeV',
        font: { size: 10, color: '#ffd54f' }, showarrow: true, arrowhead: 2, arrowcolor: '#ffd54f',
        ax: -40, ay: -30
      },
      { x: 0.98, y: 0.15, xref: 'paper', yref: 'paper',
        text: '<b>Relativistic:</b> −Eₙ (Zα)²/n (1/(j+½) − 3/4n)<br><b>Spin-orbit:</b> (Zα)⁴ mc² / (2n³ j(j+½))<br><b>Lamb:</b> QED vacuum fluctuation',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 4: ZEEMAN EFFECT (interactive B) ============
function plotZeemanApp(B_mT) {
  var B = B_mT / 1000;  // convert to Tesla
  var muB = 5.788e-5;   // eV/T
  var g = 1;  // g_J for simple case

  // n=2 levels with m_j splitting
  var baseLevels = [
    { name: '2S₁/₂', E: -3.4, m: [0.5, -0.5], color: '#00d4ff' },
    { name: '2P₁/₂', E: -3.4 + 4.53e-6, m: [0.5, -0.5], color: '#ff4081' },
    { name: '2P₃/₂', E: -3.4 + 4.53e-5, m: [1.5, 0.5, -0.5, -1.5], color: '#69f0ae' }
  ];

  var traces = [];
  baseLevels.forEach(function(lvl) {
    lvl.m.forEach(function(m) {
      var E_shift = m * g * muB * B;
      traces.push({
        x: [0, 1], y: [lvl.E + E_shift, lvl.E + E_shift], mode: 'lines',
        line: { color: lvl.color, width: Math.abs(m) > 0.6 ? 2 : 1 },
        name: lvl.name + ' (m=' + (m > 0 ? '+' : '') + m + ')',
        showlegend: false, hoverinfo: 'y+name'
      });
    });
  });

  _plotApp('app-zeeman', traces, {
    title: { text: 'Zeeman Effect: ΔE = mⱼ gⱼ μ_B B (n=2, B = ' + B_mT.toFixed(0) + ' mT)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { visible: false, range: [0, 1] },
    yaxis: { title: 'Energy (eV)', gridcolor: '#2a2a3a', range: [-3.401, -3.395] },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 60, r: 20, t: 40, b: 20 },
    annotations: [
      { x: 0.5, y: -3.4005, text: 'μ_B = 5.788×10⁻⁵ eV/T<br>At B=1T: ΔE ≈ 0.058 meV',
        font: { size: 9, color: '#8080a0' }, showarrow: false,
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 5: STELLAR H-R DIAGRAM ============
function plotHRDiagram() {
  // Main sequence: L ∝ T⁴ (Stefan-Boltzmann for fixed R)
  // Spectral types: O(30000K) → M(3000K)
  var T = linspace(3000, 30000, 100);
  var L = T.map(t => Math.pow(t / 5778, 4));  // normalized to Sun

  // Spectral class markers
  var spectral = [
    { type: 'O', T: 30000, L: Math.pow(30000/5778, 4), color: '#9bb0ff' },
    { type: 'B', T: 15000, L: Math.pow(15000/5778, 4), color: '#aabfff' },
    { type: 'A', T: 9000,  L: Math.pow(9000/5778, 4), color: '#cad8ff' },
    { type: 'F', T: 7000,  L: Math.pow(7000/5778, 4), color: '#fff4e8' },
    { type: 'G', T: 5778,  L: 1, color: '#fff9ed' },
    { type: 'K', T: 4500,  L: Math.pow(4500/5778, 4), color: '#ffddb4' },
    { type: 'M', T: 3000,  L: Math.pow(3000/5778, 4), color: '#ffbd8e' }
  ];

  _plotApp('app-hr', [
    { x: T.map(t => 1e4/t), y: L, mode: 'lines', name: 'Main Sequence',
      line: { color: '#e0e0f0', width: 1 }, hovertemplate: 'T=%{x:.0f} K, L/L☉=%{y:.2f}<extra></extra>' },
    { x: spectral.map(s => 1e4/s.T), y: spectral.map(s => s.L), mode: 'markers+text',
      marker: { size: 18, color: spectral.map(s => s.color), line: { color: '#fff', width: 1 } },
      text: spectral.map(s => s.type), textposition: 'top center',
      textfont: { size: 14, color: '#e0e0f0' }, showlegend: false,
      hovertemplate: '%{text}: T=%{x:.0f}×10⁴/100 K, L=%{y:.2f} L☉<extra></extra>'
    }
  ], {
    title: { text: 'Hertzsprung-Russell Diagram: Stellar Classification', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'Temperature (10⁴ K)', gridcolor: '#2a2a3a', autorange: 'reversed' },
    yaxis: { title: 'Luminosity L / L☉ (log scale)', gridcolor: '#2a2a3a', type: 'log' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 60, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.98, y: 0.15, xref: 'paper', yref: 'paper',
        text: '<b>Color = surface T</b><br>O: blue, hottest<br>M: red, coolest<br>Sun = G2V (yellow)',
        font: { size: 10, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 6
      }
    ]
  });
}

// ============ APP 6: RYDBERG BLOCKADE (tweezer array) ============
function plotRydbergBlockade(R_um) {
  // Two atoms separated by R. Rydberg-Rydberg interaction: V ∝ C₆/R⁶
  // Blockade radius: R_b = (C₆ / ℏΩ)^{1/6}
  var C6 = 1.0;  // arbitrary units
  var rArr = linspace(0.5, 10, 100);
  var VvdW = rArr.map(r => C6 / Math.pow(r, 6));
  var Omega = 1.0;  // Rabi frequency
  var blockadeRadius = Math.pow(C6 / Omega, 1/6);

  _plotApp('app-rydberg-qc', [
    { x: rArr, y: VvdW, mode: 'lines', name: 'van der Waals V ∝ C₆/R⁶',
      line: { color: '#00d4ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' },
    { x: [blockadeRadius, blockadeRadius], y: [0, Math.max(...VvdW)], mode: 'lines',
      line: { color: '#ff4081', width: 2, dash: 'dash' }, name: 'Blockade radius R_b',
      showlegend: true }
  ], {
    title: { text: 'Rydberg Blockade: Two-Atom Interaction in Tweezer Array', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'Interatomic distance R (μm)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'Interaction V / ℏΩ (arbitrary)', gridcolor: '#2a2a3a', type: 'log' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 60, r: 20, t: 40, b: 40 },
    legend: { x: 0.6, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: blockadeRadius, y: Math.max(...VvdW) * 0.5,
        text: 'R_b ≈ ' + blockadeRadius.toFixed(2) + ' μm<br>Atoms within R_b<br>cannot both be excited<br>to |r⟩ simultaneously',
        font: { size: 10, color: '#ff4081' }, showarrow: true, arrowhead: 2, arrowcolor: '#ff4081',
        ax: 50, ay: -40
      },
      { x: 0.98, y: 0.25, xref: 'paper', yref: 'paper',
        text: '<b>QuEra / Harvard:</b><br>1000+ atoms in 2D<br>R ≈ 3-5 μm<br>R_b ≈ 5-10 μm<br>Native entangler',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ MASTER INIT ============
function initHydrogenApps() {
  console.log('Hydrogen Apps: initializing...');
  plotSpectralSeries();
  plotRydbergScaling();
  plotFineStructure();
  plotZeemanApp(100);  // default 100 mT
  plotHRDiagram();
  plotRydbergBlockade(5);

  // Zeeman slider
  var zeemanSlider = document.getElementById('slider-zeeman-b');
  if (zeemanSlider) {
    zeemanSlider.addEventListener('input', function() {
      var B = parseFloat(this.value);
      document.getElementById('val-zeeman-b').textContent = B.toFixed(0);
      plotZeemanApp(B);
    });
  }

  // Rydberg distance slider
  var rydSlider = document.getElementById('slider-rydberg-r');
  if (rydSlider) {
    rydSlider.addEventListener('input', function() {
      var R = parseFloat(this.value);
      document.getElementById('val-rydberg-r').textContent = R.toFixed(1);
      plotRydbergBlockade(R);
    });
  }

  console.log('Hydrogen Apps: all initialized');
}

if (document.readyState !== 'loading') {
  setTimeout(initHydrogenApps, 800);
} else {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(initHydrogenApps, 800); });
}

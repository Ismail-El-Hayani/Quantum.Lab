/**
 * Energy Bands & DOS Applications — Interactive Simulations
 * ARPES, effective mass, density of states, solar cell, doping.
 */

'use strict';

function _plotApp(id, traces, layout, cfg) {
  var el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || {responsive: true, displayModeBar: false});
}

function linspace(a, b, n) { var arr = new Array(n); for (let i = 0; i < n; i++) arr[i] = a + i * (b - a) / (n - 1); return arr; }

// ============ APP 1: ARPES SPECTRUM ============
function plotARPES() {
  // Simulated ARPES intensity: I(E,k) ∝ A(k,E) f(E) δ(E - E(k))
  var kArr = linspace(-1, 1, 100);
  var EArr = linspace(-2, 2, 100);

  // Create 2D intensity map
  var z = [];
  for (let i = 0; i < EArr.length; i++) {
    var row = [];
    for (let j = 0; j < kArr.length; j++) {
      var Ek = -0.5 + 0.3 * Math.cos(Math.PI * kArr[j]);  // tight-binding band
      var intensity = Math.exp(-Math.pow(EArr[i] - Ek, 2) / 0.01) * (1 / (1 + Math.exp(EArr[i] / 0.025)));
      row.push(intensity);
    }
    z.push(row);
  }

  _plotApp('app-arpes', [{
    x: kArr, y: EArr, z: z, type: 'heatmap',
    colorscale: [[0, '#0a0a0f'], [0.3, '#1a1a3a'], [0.6, '#00d4ff'], [1, '#ffffff']],
    showscale: false
  }], {
    title: { text: 'ARPES: Angle-Resolved Photoemission Spectrum', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'k (π/a)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'E - E_F (eV)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.98, y: 0.15, xref: 'paper', yref: 'paper',
        text: '<b>ARPES:</b><br>· 21.2 eV He lamp<br>· Energy resolution ~2 meV<br>· k-resolution ~0.01 Å⁻¹<br>· T &lt; 20 K for sharpness<br><br><b>Reveals:</b><br>· Band dispersion<br>· Fermi surface<br>· Superconducting gap',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 2: EFFECTIVE MASS vs K ============
function plotEffectiveMass() {
  // m*(k) = ℏ² / (∂²E/∂k²)
  var kArr = linspace(-1, 1, 200);
  var a = 0.5e-9;  // m
  var t = 1.0;  // eV

  // Tight-binding E(k) = -2t cos(ka)
  var E = kArr.map(function(k) { return -2 * t * Math.cos(Math.PI * k); });
  // d²E/dk² ≈ 2t(πa)² cos(πk) for small k
  var mStar = kArr.map(function(k) {
    var d2E = 2 * t * Math.pow(Math.PI, 2) * Math.cos(Math.PI * k);
    return d2E > 0 ? 1 / d2E : -1 / Math.abs(d2E);  // in units of m_e
  });

  _plotApp('app-mstar', [
    { x: kArr, y: E, mode: 'lines', name: 'E(k) (eV)',
      line: { color: '#00d4ff', width: 2 }, yaxis: 'y' },
    { x: kArr, y: mStar, mode: 'lines', name: 'm*/mₑ',
      line: { color: '#ff4081', width: 2 }, yaxis: 'y2' }
  ], {
    title: { text: 'Effective Mass: m* = ℏ²/(∂²E/∂k²) from Band Curvature', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'k (π/a)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'E (eV)', gridcolor: '#2a2a3a', side: 'left', color: '#00d4ff' },
    yaxis2: { title: 'm*/mₑ', overlaying: 'y', side: 'right', color: '#ff4081', showgrid: false },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 50, t: 40, b: 40 },
    legend: { x: 0.5, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0, y: E[Math.floor(E.length/2)], text: 'Band edge<br>m* large',
        font: { size: 9, color: '#ffd54f' }, showarrow: true, arrowhead: 2, ax: -30, ay: -40
      },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Real values:</b><br>Si: m*_e = 0.98 mₑ<br>GaAs: m*_e = 0.067 mₑ<br>InSb: m*_e = 0.014 mₑ<br><br>Light mass → fast transport<br>Heavy mass → strong confinement',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 3: DENSITY OF STATES (3D, 2D, 1D) ============
function plotDOS() {
  var E = linspace(0, 2, 100);
  // 3D: ∝ √E, 2D: ∝ const (step), 1D: ∝ 1/√E
  var dos3D = E.map(function(e) { return Math.sqrt(Math.max(e, 0.01)); });
  var dos2D = E.map(function(e) { return e > 0.1 ? 0.5 : 0; });
  var dos1D = E.map(function(e) { return 1 / Math.sqrt(Math.max(e, 0.01)); });

  _plotApp('app-dos', [
    { x: E, y: dos3D, mode: 'lines', name: '3D: g(E) ∝ √E',
      line: { color: '#00d4ff', width: 2 } },
    { x: E, y: dos2D, mode: 'lines', name: '2D: g(E) ∝ Θ(E)',
      line: { color: '#ff4081', width: 2 } },
    { x: E, y: dos1D, mode: 'lines', name: '1D: g(E) ∝ 1/√E',
      line: { color: '#69f0ae', width: 2 } }
  ], {
    title: { text: 'Density of States: Dimensionality Dependence', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'E (eV)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'g(E) (arb.)', gridcolor: '#2a2a3a', type: 'log' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.6, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Impact:</b><br>3D: metals, bulk semiconductors<br>2D: quantum wells, graphene<br>1D: quantum wires, nanotubes<br>0D: quantum dots (δ-function)<br><br>2D DOS → lasers, modulators<br>1D DOS → quantum cascade',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 4: SOLAR CELL — BAND DIAGRAM ============
function plotSolarCell() {
  // p-n junction band diagram under illumination
  var x = linspace(-2, 2, 200);  // μm
  var Eg = 1.12;  // Si bandgap
  var V_bi = 0.7;  // built-in potential

  // Simplified band diagram
  var Ec = x.map(function(xi) {
    return xi < 0 ? Eg + 0.1 : Eg - V_bi * (1 - Math.exp(-xi/0.1));
  });
  var Ev = x.map(function(xi) {
    return xi < 0 ? 0.1 : -V_bi * (1 - Math.exp(-xi/0.1));
  });
  var Ef = x.map(function() { return 0; });

  _plotApp('app-solar', [
    { x: x, y: Ec, mode: 'lines', name: 'E_c (conduction)',
      line: { color: '#00d4ff', width: 2 }, fill: 'tonexty', fillcolor: 'rgba(0,212,255,0.05)' },
    { x: x, y: Ev, mode: 'lines', name: 'E_v (valence)',
      line: { color: '#ff4081', width: 2 } },
    { x: x, y: Ef, mode: 'lines', name: 'E_F',
      line: { color: '#ffd54f', width: 2, dash: 'dash' } }
  ], {
    title: { text: 'Solar Cell: p-n Junction Band Diagram (Si, E_g = 1.12 eV)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x (μm)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'E (eV)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.5, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: -1, y: Eg/2, text: 'p-type<br>(acceptors)',
        font: { size: 10, color: '#00d4ff' }, showarrow: false },
      { x: 1, y: Eg/2, text: 'n-type<br>(donors)',
        font: { size: 10, color: '#ff4081' }, showarrow: false },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Si solar cell:</b><br>· V_oc ≈ 0.7 V<br>· J_sc ≈ 40 mA/cm²<br>· η ≈ 20-27%<br>· Eg = 1.12 eV (near optimal)<br><br><b>Tandem cells:</b><br>Perovskite + Si &gt; 33%',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 5: DOPING — FERMI LEVEL SHIFT ============
function plotDoping(Nd_log) {
  var Nd = Math.pow(10, Nd_log);  // doping concentration in cm⁻³
  var T = 300;
  var kT = 0.02585;  // eV at 300K
  var Nc = 2.8e19;  // cm⁻³ for Si

  // n-type: E_F = E_c + kT ln(Nd/Nc)
  var Ef_n = kT * Math.log(Nd / Nc);
  // p-type (same magnitude, opposite sign)
  var Ef_p = -Ef_n;

  var NdArr = linspace(14, 20, 100);
  var EfArr = NdArr.map(function(n) {
    return kT * Math.log(Math.pow(10, n) / Nc);
  });

  _plotApp('app-doping', [
    { x: NdArr, y: EfArr, mode: 'lines', name: 'E_F (eV below E_c)',
      line: { color: '#00d4ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' },
    { x: [Nd_log], y: [Ef_n], mode: 'markers', marker: { size: 16, color: '#ff4081', symbol: 'diamond' },
      name: 'Your doping: ' + Nd.toExponential(1) + ' cm⁻³', showlegend: true }
  ], {
    title: { text: 'Doping: Fermi Level vs Donor Concentration in Si at 300K', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'log₁₀(N_d) (cm⁻³)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'E_c - E_F (eV)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 60, r: 20, t: 40, b: 40 },
    legend: { x: 0.5, y: 0.02, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 16, y: kT * Math.log(1e16/Nc) + 0.05,
        text: 'Degenerate<br>E_F enters band<br>n &gt; N_c',
        font: { size: 9, color: '#ffd54f' }, showarrow: true, arrowhead: 2, ax: 30, ay: -30
      },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Si at 300K:</b><br>N_c = 2.8×10¹⁹ cm⁻³<br>N_v = 1.04×10¹⁹ cm⁻³<br>Intrinsic n_i = 10¹⁰ cm⁻³<br><br><b>Doping levels:</b><br>· Light: 10¹⁴ cm⁻³<br>· Moderate: 10¹⁶ cm⁻³<br>· Heavy: 10¹⁹ cm⁻³ (degenerate)',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 6: BAND OFFSET — HETEROSTRUCTURE ============
function plotHeterostructure() {
  // GaAs/AlGaAs heterostructure band diagram
  var x = linspace(-2, 2, 200);
  var Ec_GaAs = 1.42, Ec_AlGaAs = 1.90;  // conduction band edges
  var delta_Ec = 0.30;  // conduction band offset

  var Ec = x.map(function(xi) {
    if (Math.abs(xi) < 0.5) return Ec_GaAs;  // well
    return Ec_AlGaAs - delta_Ec * Math.exp(-(Math.abs(xi)-0.5)/0.1);  // barrier with smooth interface
  });

  _plotApp('app-hetero', [
    { x: x, y: Ec, mode: 'lines', name: 'E_c(x)',
      line: { color: '#00d4ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' }
  ], {
    title: { text: 'Heterostructure: GaAs/Al₀.₃Ga₀.₇As Quantum Well (ΔE_c = 0.30 eV)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'x (nm)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'E_c (eV)', gridcolor: '#2a2a3a', range: [1.0, 2.0] },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0, y: Ec_GaAs + 0.1, text: 'Quantum well<br>Confined states',
        font: { size: 10, color: '#00d4ff' }, showarrow: true, arrowhead: 2, ax: -40, ay: -30
      },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Applications:</b><br>· Quantum wells: lasers, LEDs<br>· 2DEG: HEMTs, quantum Hall<br>· Superlattices: QCLs<br><br><b>Key parameters:</b><br>· Well width: 5-20 nm<br>· ΔE_c / ΔE_v ratio: ~60/40<br>· Strain for band engineering',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ MASTER INIT ============
function initEBApps() {
  console.log('EB Apps: initializing...');
  plotARPES();
  plotEffectiveMass();
  plotDOS();
  plotSolarCell();
  plotDoping(16);
  plotHeterostructure();

  var dopSlider = document.getElementById('slider-doping');
  if (dopSlider) dopSlider.addEventListener('input', function(){ var N=parseFloat(this.value); document.getElementById('val-doping').textContent=N.toFixed(0); plotDoping(N); });

  console.log('EB Apps: done');
}

if (document.readyState !== 'loading') setTimeout(initEBApps, 800);
else document.addEventListener('DOMContentLoaded', function(){ setTimeout(initEBApps, 800); });

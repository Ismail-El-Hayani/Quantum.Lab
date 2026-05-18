/**
 * Conductivity Applications — Interactive Simulations
 * I-V curves, Hall effect, thermoelectric, superconducting transition, memristor.
 */

'use strict';

function plotWiedemannFranz() {
  // stub: actual implementation lives in cond_apps_games.js
}

// ============ APP 1: I-V CURVES (Ohmic vs Non-Ohmic) ============
function plotIVCurve(T_K) {
  var V = linspace(-5, 5, 200);
  // Semiconductor: I ∝ V at low V, saturates at high V
  var R = 1e-3;  // resistance
  var kT = 8.617e-5 * T_K;  // eV

  var I_ohmic = V.map(function(v) { return v / R; });
  var I_diode = V.map(function(v) {
    return 1e-3 * (Math.exp(v / kT) - 1);  // diode equation
  });
  var I_sc = V.map(function(v) {
    return 1e-6 * Math.pow(Math.abs(v), 2.5) * Math.sign(v);  // space-charge limited
  });

  _plotApp('app-iv', [
    { x: V, y: I_ohmic, mode: 'lines', name: 'Ohmic (Cu)',
      line: { color: '#00d4ff', width: 2 } },
    { x: V, y: I_diode, mode: 'lines', name: 'p-n Diode at T=' + T_K.toFixed(0) + 'K',
      line: { color: '#ff4081', width: 2 } },
    { x: V, y: I_sc, mode: 'lines', name: 'Space-charge limited',
      line: { color: '#69f0ae', width: 2, dash: 'dash' } }
  ], {
    title: { text: 'I-V Characteristics: Ohmic vs Non-Ohmic (T = ' + T_K.toFixed(0) + ' K)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'V (V)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'I (A)', gridcolor: '#2a2a3a', type: 'log' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.5, y: 0.02, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Ohmic:</b> I = V/R (linear)<br><b>Diode:</b> I = I_s(e^(V/nkT)−1)<br><b>SCL:</b> I ∝ V² (Child-Langmuir)<br><br><b>At high T:</b><br>More thermionic emission<br>Reverse leakage increases',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 2: HALL EFFECT — n-type vs p-type ============
function plotHallEffect(B_T) {
  var n = 1e22;  // carrier density m⁻³
  var e = 1.6e-19;
  var I = 1e-3;  // A
  var t = 1e-6;  // thickness m

  // V_H = IB/(net) for n-type, opposite sign for p-type
  var B_arr = linspace(-2, 2, 100);
  var Vh_n = B_arr.map(function(b) { return -I * b / (n * e * t) * 1e6; });  // μV
  var Vh_p = B_arr.map(function(b) { return I * b / (n * e * t) * 1e6; });

  _plotApp('app-hall', [
    { x: B_arr, y: Vh_n, mode: 'lines', name: 'n-type (negative)',
      line: { color: '#00d4ff', width: 2 } },
    { x: B_arr, y: Vh_p, mode: 'lines', name: 'p-type (positive)',
      line: { color: '#ff4081', width: 2 } }
  ], {
    title: { text: 'Hall Effect: V_H vs B at n = 10²² m⁻³, I = 1 mA', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'B (T)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'V_H (μV)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.5, y: 0.02, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: B_T, y: -I * B_T / (n * e * t) * 1e6,
        text: 'R_H = 1/ne = ' + (1/(n*e)*1e9).toFixed(2) + ' m³/C<br>Sign reveals carrier type',
        font: { size: 10, color: '#ffd54f' }, showarrow: true, arrowhead: 2, ax: -50, ay: -30
      },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Hall coefficient:</b><br>R_H = 1/ne (n-type)<br>R_H = 1/pe (p-type)<br><br><b>Applications:</b><br>· Carrier type identification<br>· Carrier density measurement<br>· Magnetic field sensors<br>· Current sensing (contactless)',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 3: THERMOELECTRIC (Seebeck Effect) ============
function plotSeebeck(T_hot) {
  var T_cold = 300;
  var S = 200e-6;  // Seebeck coefficient (V/K) for Bi₂Te₃

  var Th = linspace(300, 600, 100);
  var V_seebeck = Th.map(function(t) { return S * (t - T_cold) * 1e3; });  // mV

  // Efficiency: η = ΔT/T_hot × (√(1+ZT) - 1)/(√(1+ZT) + T_cold/T_hot)
  var ZT = 1.0;  // figure of merit
  var eta = Th.map(function(t) {
    var dT = t - T_cold;
    return (dT / t) * (Math.sqrt(1 + ZT) - 1) / (Math.sqrt(1 + ZT) + T_cold / t) * 100;
  });

  _plotApp('app-seebeck', [
    { x: Th, y: V_seebeck, mode: 'lines', name: 'V_Seebeck (mV)',
      line: { color: '#00d4ff', width: 2 }, yaxis: 'y' },
    { x: Th, y: eta, mode: 'lines', name: 'η (%)',
      line: { color: '#ff4081', width: 2 }, yaxis: 'y2' }
  ], {
    title: { text: 'Thermoelectric: Seebeck Voltage & Efficiency (Bi₂Te₃, S = 200 μV/K)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'T_hot (K)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'V (mV)', gridcolor: '#2a2a3a', side: 'left', color: '#00d4ff' },
    yaxis2: { title: 'η (%)', overlaying: 'y', side: 'right', color: '#ff4081', showgrid: false, range: [0, 15] },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 50, t: 40, b: 40 },
    legend: { x: 0.5, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: T_hot, y: S * (T_hot - T_cold) * 1e3,
        text: 'Your point:<br>ΔT = ' + (T_hot - T_cold).toFixed(0) + ' K<br>V = ' + (S*(T_hot-T_cold)*1e3).toFixed(1) + ' mV',
        font: { size: 9, color: '#ffd54f' }, showarrow: true, arrowhead: 2, ax: 40, ay: -30
      },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Seebeck:</b> V = S ΔT<br>S = −ΔV/ΔT at J=0<br><br><b>ZT = S²σT/κ:</b><br>ZT &gt; 1: useful<br>ZT &gt; 3: competitive<br><br><b>Materials:</b><br>Bi₂Te₃: ZT ~ 1<br>SnSe: ZT ~ 2.6<br>Half-Heusler: ZT ~ 1.5',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 4: SUPERCONDUCTING TRANSITION ============
function plotSCTransition() {
  var T = linspace(1, 15, 100);
  var Tc = 9.2;  // Nb

  // Resistivity: ρ = 0 for T < Tc, ρ = ρ_n for T > Tc (simplified)
  var rho = T.map(function(t) { return t < Tc ? 1e-12 : 5e-8; });

  _plotApp('app-sc-transition', [
    { x: T, y: rho, mode: 'lines', name: 'ρ(T) (Ω·m)',
      line: { color: '#00d4ff', width: 3 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' }
  ], {
    title: { text: 'Superconducting Transition: ρ(T) for Niobium (T_c = 9.2 K)', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'T (K)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'ρ (Ω·m)', gridcolor: '#2a2a3a', type: 'log' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: Tc, y: 5e-8,
        text: 'T_c = 9.2 K<br>Zero resistance below',
        font: { size: 10, color: '#ff4081' }, showarrow: true, arrowhead: 2, ax: 40, ay: -30
      },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Type I:</b><br>Complete Meissner effect<br>Soft superconductors<br><br><b>Type II:</b><br>Vortex state (mixed)<br>Hard superconductors<br>High-field magnets<br><br><b>Critical fields:</b><br>Nb: H_c = 0.2 T<br>NbTi: H_c2 = 15 T<br>Nb₃Sn: H_c2 = 30 T',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 5: MEMRISTOR — pinched hysteresis ============
function plotMemristor() {
  // Memristor I-V: pinched hysteresis loop
  var tArr = linspace(0, 4 * Math.PI, 400);
  var V0 = 1.0;
  var w = 1.0;  // dopant front position (0-1)

  var V = tArr.map(function(t) { return V0 * Math.sin(t); });
  var I = tArr.map(function(t) {
    var R_on = 100, R_off = 10000;
    var w_t = 0.5 + 0.3 * Math.sin(t / 2);  // memristive state
    var R = R_on * w_t + R_off * (1 - w_t);
    return V0 * Math.sin(t) / R;
  });

  _plotApp('app-memristor', [
    { x: V, y: I, mode: 'lines', name: 'I(V)',
      line: { color: '#00d4ff', width: 2 } }
  ], {
    title: { text: 'Memristor: Pinched Hysteresis I-V Loop', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'V (V)', gridcolor: '#2a2a3a', range: [-1.5, 1.5] },
    yaxis: { title: 'I (mA)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0, y: 0,
        text: 'Pinched at origin<br>Memory device',
        font: { size: 9, color: '#ffd54f' }, showarrow: true, arrowhead: 2, ax: -40, ay: -30
      },
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Memristor:</b><br>V = M(x) I<br>M depends on history<br><br><b>Applications:</b><br>· Neuromorphic computing<br>· In-memory computation<br>· Crossbar arrays<br>· Analog AI accelerators<br><br><b>Materials:</b><br>TiO₂, TaOₓ, HfO₂',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 6: SKIN EFFECT ============
function plotSkinEffect(f_MHz) {
  // Skin depth: δ = √(2/ωμσ)
  var f = linspace(1e3, 1e9, 100);  // Hz
  var sigma = 5.8e7;  // Cu
  var mu = 4 * Math.PI * 1e-7;

  var delta = f.map(function(freq) {
    return Math.sqrt(2 / (2 * Math.PI * freq * mu * sigma)) * 1e6;  // μm
  });

  var f_target = f_MHz * 1e6;
  var delta_target = Math.sqrt(2 / (2 * Math.PI * f_target * mu * sigma)) * 1e6;

  _plotApp('app-skin', [
    { x: f.map(function(freq) { return freq / 1e6; }), y: delta, mode: 'lines', name: 'δ (μm)',
      line: { color: '#00d4ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.08)' },
    { x: [f_MHz], y: [delta_target], mode: 'markers',
      marker: { size: 14, color: '#ff4081', symbol: 'diamond' },
      name: f_MHz.toFixed(0) + ' MHz: δ = ' + delta_target.toFixed(2) + ' μm' }
  ], {
    title: { text: 'Skin Effect: Penetration Depth δ(f) in Copper', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'f (MHz)', gridcolor: '#2a2a3a', type: 'log' },
    yaxis: { title: 'δ (μm)', gridcolor: '#2a2a3a', type: 'log' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.5, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: 0.98, y: 0.2, xref: 'paper', yref: 'paper',
        text: '<b>Skin depth:</b> δ = √(2/ωμσ)<br><br><b>Cu values:</b><br>60 Hz: 8.5 mm<br>1 MHz: 66 μm<br>1 GHz: 2.1 μm<br><br><b>Consequences:</b><br>· HF: current on surface<br>· Litz wire for motors<br>· Waveguide design<br>· Surface roughness matters',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ MASTER INIT ============
function initCondApps() {
  plotIVCurve(300);
  plotHallEffect(1);
  plotSeebeck(400);
  plotSCTransition();
  plotMemristor();
  plotSkinEffect(1);

  var TSlider = document.getElementById('slider-iv-t');
  if (TSlider) TSlider.addEventListener('input', function(){ var T=parseFloat(this.value); document.getElementById('val-iv-t').textContent=T.toFixed(0); plotIVCurve(T); });

  var BSlider = document.getElementById('slider-hall-b');
  if (BSlider) BSlider.addEventListener('input', function(){ var b=parseFloat(this.value); document.getElementById('val-hall-b').textContent=b.toFixed(1); plotHallEffect(b); });

  var thSlider = document.getElementById('slider-thot');
  if (thSlider) thSlider.addEventListener('input', function(){ var t=parseFloat(this.value); document.getElementById('val-thot').textContent=t.toFixed(0); plotSeebeck(t); });

  var fSlider = document.getElementById('slider-freq');
  if (fSlider) fSlider.addEventListener('input', function(){ var f=parseFloat(this.value); document.getElementById('val-freq').textContent=f.toFixed(0); plotSkinEffect(f); });

  if (document.readyState !== 'loading') setTimeout(initCondApps, 800);
  else document.addEventListener('DOMContentLoaded', function(){ setTimeout(initCondApps, 800); });
}

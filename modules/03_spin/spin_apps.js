/**
 * Spin-1/2 Applications — Interactive Simulations
 * Stern-Gerlach, ESR, NMR, quantum gates, 21cm line.
 */

'use strict';

function _plotApp(id, traces, layout, cfg) {
  var el = document.getElementById(id);
  if (!el) return;
  Plotly.react(id, traces, layout, cfg || {responsive: true, displayModeBar: false});
}

function linspace(a, b, n) { var arr = new Array(n); for (let i = 0; i < n; i++) arr[i] = a + i * (b - a) / (n - 1); return arr; }

// ============ APP 1: STERN-GERLACH MEASUREMENT PROBABILITY ============
function plotSG(theta_deg) {
  var theta = theta_deg * Math.PI / 180;
  var P_up = Math.pow(Math.cos(theta/2), 2);
  var P_down = Math.pow(Math.sin(theta/2), 2);

  _plotApp('app-sg', [
    { x: ['|↑z⟩ (prob)','|↓z⟩ (prob)'], y: [P_up, P_down], type: 'bar',
      marker: { color: ['#00d4ff','#ff4081'] }, text: [(P_up*100).toFixed(1)+'%', (P_down*100).toFixed(1)+'%'],
      textposition: 'outside', textfont: { color: '#e0e0f0', size: 12 }
    }
  ], {
    title: { text: 'Stern-Gerlach: Probability vs Polar Angle θ = ' + theta_deg.toFixed(0) + '°', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { gridcolor: '#2a2a3a' }, yaxis: { title: 'Probability', gridcolor: '#2a2a3a', range: [0, 1.2] },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.5, y: 1.05, text: 'P(↑) = cos²(θ/2) = ' + P_up.toFixed(3) + '\nP(↓) = sin²(θ/2) = ' + P_down.toFixed(3),
        font: { size: 11, color: '#8080a0' }, showarrow: false }
    ]
  });
}

// ============ APP 2: ESR — RESONANCE SWEEP ============
function plotESR(B_T) {
  var fArr = linspace(20, 35, 300);  // GHz
  var g = 2.002319;
  var f0 = g * 28.024 * B_T;  // resonance frequency in GHz
  var linewidth = 0.1;  // GHz

  var signal = fArr.map(function(f) {
    return 1 / (1 + Math.pow((f - f0)/linewidth, 2));
  });

  _plotApp('app-esr', [
    { x: fArr, y: signal, mode: 'lines', name: 'Absorption',
      line: { color: '#00d4ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.1)' },
    { x: [f0, f0], y: [0, 1], mode: 'lines', name: 'Resonance',
      line: { color: '#ff4081', width: 2, dash: 'dash' } }
  ], {
    title: { text: 'ESR: Electron Spin Resonance at B = ' + B_T.toFixed(2) + ' T', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'Frequency (GHz)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'Absorption (arb.)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    legend: { x: 0.65, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' },
    annotations: [
      { x: f0 + 0.5, y: 0.8, text: 'f₀ = g μ_B B/h\n= ' + f0.toFixed(2) + ' GHz',
        font: { size: 10, color: '#ff4081' }, showarrow: true, arrowhead: 2, ax: 30, ay: -30 }
    ]
  });
}

// ============ APP 3: NMR — LARMOR PRECESSION FREQUENCY ============
function plotNMR(B_T) {
  var gamma_H = 42.577;  // MHz/T for ¹H
  var f = gamma_H * B_T;

  _plotApp('app-nmr', [
    { x: [1, 2, 3, 4, 5, 7, 9, 11.7], y: [1,2,3,4,5,7,9,11.7].map(function(b){ return gamma_H * b; }),
      mode: 'markers+lines', name: '¹H Larmor freq',
      marker: { size: 12, color: '#00d4ff' }, line: { color: '#00d4ff', width: 2 }
    },
    { x: [B_T, B_T], y: [0, f], mode: 'lines',
      line: { color: '#ff4081', width: 2, dash: 'dash' }, showlegend: false }
  ], {
    title: { text: 'NMR: ¹H Larmor Frequency f = γB at B = ' + B_T.toFixed(1) + ' T', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'B (T)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'f (MHz)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.98, y: 0.95, xref: 'paper', yref: 'paper',
        text: '<b>Common field strengths:</b><br>1.5T: clinical MRI<br>3T: research MRI<br>11.7T: ultra-high field<br><b>Your B = ' + B_T.toFixed(1) + ' T → ' + f.toFixed(1) + ' MHz</b>',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ APP 4: QUANTUM GATES — STATE EVOLUTION ============
function plotQuantumGates(gateSeq) {
  // Visualize a sequence: H → Z → H creates |+⟩ → |−⟩ → |+⟩
  var states = [
    { name: '|0⟩', theta: 0,   color: '#00d4ff' },
    { name: '|1⟩', theta: 180, color: '#ff4081' },
    { name: '|+⟩', theta: 90,  color: '#69f0ae' },
    { name: '|−⟩', theta: 90,  phi: 180, color: '#ffd54f' }
  ];

  // Simple gate visualization: show which state the qubit is in after each gate
  var gateNames = gateSeq.split('');
  var xLabels = ['Initial'].concat(gateNames.map(function(g){ return g + ' gate'; }));

  // Simplified: just show the |0⟩ → |+⟩ → |−⟩ → |0⟩ sequence for H-Z-H
  var yValues = [1, 0.5, 0, 0.5, 1];  // |0⟩ amplitude squared

  _plotApp('app-gates', [
    { x: xLabels.slice(0, Math.min(gateNames.length + 1, 5)),
      y: yValues.slice(0, Math.min(gateNames.length + 1, 5)),
      mode: 'lines+markers', name: '|⟨0|ψ⟩|²',
      marker: { size: 14, color: '#00d4ff' }, line: { color: '#00d4ff', width: 2 }
    }
  ], {
    title: { text: 'Quantum Gates: State Evolution Through ' + gateSeq, font: { size: 13, color: '#e0e0f0' } },
    xaxis: { gridcolor: '#2a2a3a' },
    yaxis: { title: '|⟨0|ψ⟩|²', gridcolor: '#2a2a3a', range: [0, 1.2] },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 50, r: 20, t: 40, b: 80 },
    annotations: [
      { x: 0.5, y: -0.25, xref: 'paper', yref: 'paper',
        text: '<b>Gate definitions:</b> X=σₓ (bit flip) · Z=σᵤ (phase flip) · H=(X+Z)/√2 · S=phase(π/2) · T=phase(π/4)',
        font: { size: 9, color: '#8080a0' }, showarrow: false
      }
    ]
  });
}

// ============ APP 5: 21CM HYPERFINE TRANSITION ============
function plot21cm() {
  var r_Mpc = linspace(1, 200, 100);  // distance in Mpc
  var lambda = 21.1;  // cm
  var f_21cm = 1420.4;  // MHz

  // Simplified 21cm signal: absorption trough vs distance (epoch of reionization)
  var signal = r_Mpc.map(function(r) {
    return -0.1 * Math.exp(-r/50) * Math.sin(r/10);
  });

  _plotApp('app-21cm', [
    { x: r_Mpc, y: signal, mode: 'lines', name: '21-cm signal (mK)',
      line: { color: '#69f0ae', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(105,240,174,0.1)' },
    { x: [0, 200], y: [0, 0], mode: 'lines', line: { color: '#2a2a3a', width: 1 }, showlegend: false }
  ], {
    title: { text: '21-cm Line: Hyperfine Transition in Interstellar Hydrogen', font: { size: 13, color: '#e0e0f0' } },
    xaxis: { title: 'Distance (Mpc)', gridcolor: '#2a2a3a' },
    yaxis: { title: 'Brightness temperature (mK)', gridcolor: '#2a2a3a' },
    paper_bgcolor: '#0a0a0f', plot_bgcolor: '#0a0a0f', font: { color: '#e0e0f0' },
    margin: { l: 60, r: 20, t: 40, b: 40 },
    annotations: [
      { x: 0.98, y: 0.95, xref: 'paper', yref: 'paper',
        text: '<b>21-cm line:</b><br>λ = 21.106 cm<br>f = 1420.4 MHz<br>ΔE = 5.874 μeV<br><br><b>Used for:</b><br>· Mapping galactic HI<br>· Epoch of Reionization<br>· Cosmic Dawn detection',
        font: { size: 9, color: '#8080a0' }, showarrow: false, align: 'right',
        bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#2a2a3a', borderpad: 4
      }
    ]
  });
}

// ============ MASTER INIT ============
function initSpinApps() {
  console.log('Spin Apps: initializing...');
  plotSG(60);
  plotESR(1);
  plotNMR(3);
  plotQuantumGates('HZH');
  plot21cm();

  var sgSlider = document.getElementById('slider-sg-theta');
  if (sgSlider) sgSlider.addEventListener('input', function(){ var t=parseFloat(this.value); document.getElementById('val-sg-theta').textContent=t.toFixed(0); plotSG(t); });

  var esrSlider = document.getElementById('slider-esr-b');
  if (esrSlider) esrSlider.addEventListener('input', function(){ var b=parseFloat(this.value); document.getElementById('val-esr-b').textContent=b.toFixed(2); plotESR(b); });

  var nmrSlider = document.getElementById('slider-nmr-b');
  if (nmrSlider) nmrSlider.addEventListener('input', function(){ var b=parseFloat(this.value); document.getElementById('val-nmr-b').textContent=b.toFixed(1); plotNMR(b); });

  console.log('Spin Apps: done');
}

if (document.readyState !== 'loading') setTimeout(initSpinApps, 800);
else document.addEventListener('DOMContentLoaded', function(){ setTimeout(initSpinApps, 800); });

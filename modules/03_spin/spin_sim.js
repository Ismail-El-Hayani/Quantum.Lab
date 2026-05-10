/**
 * Spin-1/2 & Quantum Measurement — Physics Engine
 * Pauli matrices, Bloch sphere, Larmor precession, Stern-Gerlach.
 * Units: ħ = 1, magnetic field in Tesla, energy in eV.
 */

'use strict';

// ============ CONSTANTS ============
const muB_eV = 5.788e-5;    // Bohr magneton in eV/T
const muB_MHz = 13.996;     // Bohr magneton in GHz/T (for ESR) — actually 28.0 GHz/T for g=2
const g_e = 2.002319;       // Electron g-factor
const h = 4.135667696e-15;  // Planck constant in eV·s

// ============ STATE ============
let state = {
  theta: Math.PI / 3,    // polar angle 0..π
  phi: Math.PI / 4,      // azimuthal angle 0..2π
  B: 1.0,                // magnetic field (T)
  gFactor: 2.0023,       // g-factor
  animating: false,
  animFrame: null,
  time: 0,
  sgStage: 0,            // 0 = initial, 1 = after first SG, 2 = after second
  sgAxis1: 'z',          // first SG axis
  sgAxis2: 'x',          // second SG axis
  sgResult1: null,       // +1 or -1
  sgResult2: null
};

// ============ SPIN MATH ============
function stateVector(theta, phi) {
  return {
    up: Math.cos(theta / 2),
    down: Math.sin(theta / 2) * Math.exp(1 * i * phi)  // complex — use separate re/im
  };
}

// Use real representation: [up_re, up_im, down_re, down_im]
// For pure states up_re = cos(θ/2), up_im = 0, down_re = sin(θ/2)cos(φ), down_im = sin(θ/2)sin(φ)
function getAmplitudes(th, ph) {
  const c = Math.cos(th / 2);
  const s = Math.sin(th / 2);
  return {
    up_re: c, up_im: 0,
    down_re: s * Math.cos(ph), down_im: s * Math.sin(ph)
  };
}

function expectationSigmaX(a) {
  // ⟨ψ|σx|ψ⟩ = 2 Re(up* · down)
  return 2 * (a.up_re * a.down_re + a.up_im * a.down_im);
}

function expectationSigmaY(a) {
  // ⟨ψ|σy|ψ⟩ = 2 Im(up* · down)
  return 2 * (a.up_re * a.down_im - a.up_im * a.down_re);
}

function expectationSigmaZ(a) {
  // ⟨ψ|σz|ψ⟩ = |up|² − |down|²
  return (a.up_re*a.up_re + a.up_im*a.up_im) - (a.down_re*a.down_re + a.down_im*a.down_im);
}

function evolveLarmor(a, dt, omega) {
  // Rotation around z: |ψ(t)⟩ = exp(−iωt σz/2)|ψ(0)⟩
  const cos_w = Math.cos(omega * dt / 2);
  const sin_w = Math.sin(omega * dt / 2);

  const up_re_new = cos_w * a.up_re + sin_w * a.up_im;
  const up_im_new = cos_w * a.up_im - sin_w * a.up_re;
  const down_re_new = cos_w * a.down_re - sin_w * a.down_im;
  const down_im_new = cos_w * a.down_im + sin_w * a.down_re;

  return { up_re: up_re_new, up_im: up_im_new, down_re: down_re_new, down_im: down_im_new };
}

function measureProbZ(a) {
  const pUp = a.up_re*a.up_re + a.up_im*a.up_im;
  return { up: pUp, down: 1 - pUp };
}

function measureProbX(a) {
  // Project onto |+x⟩ = (|↑⟩ + |↓⟩)/√2
  const pPlus = 0.5 * ((a.up_re + a.down_re)**2 + (a.up_im + a.down_im)**2);
  return { plus: pPlus, minus: 1 - pPlus };
}

function measureProbY(a) {
  // Project onto |+y⟩ = (|↑⟩ + i|↓⟩)/√2
  const pPlus = 0.5 * ((a.up_re - a.down_im)**2 + (a.up_im + a.down_re)**2);
  return { plus: pPlus, minus: 1 - pPlus };
}

function measureCollapseZ(a, result) {
  // result = +1 for up, -1 for down
  if (result === 1) {
    const norm = Math.sqrt(a.up_re*a.up_re + a.up_im*a.up_im);
    if (norm > 1e-10) {
      return { up_re: a.up_re/norm, up_im: a.up_im/norm, down_re: 0, down_im: 0 };
    }
  } else {
    const norm = Math.sqrt(a.down_re*a.down_re + a.down_im*a.down_im);
    if (norm > 1e-10) {
      return { up_re: 0, up_im: 0, down_re: a.down_re/norm, down_im: a.down_im/norm };
    }
  }
  return a;
}

function measureCollapseX(a, result) {
  // |+x⟩ = (|↑⟩ + |↓⟩)/√2, |−x⟩ = (|↑⟩ − |↓⟩)/√2
  if (result === 1) {
    const up_re = (a.up_re + a.down_re) / Math.SQRT2;
    const up_im = (a.up_im + a.down_im) / Math.SQRT2;
    const norm = Math.sqrt(up_re*up_re + up_im*up_im);
    return { up_re: up_re/norm, up_im: up_im/norm, down_re: up_re/norm, down_im: up_im/norm };
  } else {
    const up_re = (a.up_re - a.down_re) / Math.SQRT2;
    const up_im = (a.up_im - a.down_im) / Math.SQRT2;
    const norm = Math.sqrt(up_re*up_re + up_im*up_im);
    return { up_re: up_re/norm, up_im: up_im/norm, down_re: -up_re/norm, down_im: -up_im/norm };
  }
}

// ============ PLOTTING ============
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

function _plot(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}

// ===== A. PLAYGROUND =====
function plotBlochSphere() {
  const a = getAmplitudes(state.theta, state.phi);
  const sx = expectationSigmaX(a);
  const sy = expectationSigmaY(a);
  const sz = expectationSigmaZ(a);

  // Draw sphere wireframe (latitude/longitude circles)
  const sphereTraces = [];

  // Equator
  const eqX = [], eqY = [], eqZ = [];
  for (let i = 0; i <= 100; i++) {
    const t = 2 * Math.PI * i / 100;
    eqX.push(Math.cos(t)); eqY.push(Math.sin(t)); eqZ.push(0);
  }
  sphereTraces.push({
    x: eqX, y: eqY, z: eqZ, mode: 'lines',
    line: { color: 'rgba(255,255,255,0.1)', width: 1 },
    type: 'scatter3d', showlegend: false, hoverinfo: 'skip'
  });

  // Meridian (xz plane)
  const merX = [], merY = [], merZ = [];
  for (let i = 0; i <= 100; i++) {
    const t = Math.PI * i / 100;
    merX.push(Math.sin(t)); merY.push(0); merZ.push(Math.cos(t));
  }
  sphereTraces.push({
    x: merX, y: merY, z: merZ, mode: 'lines',
    line: { color: 'rgba(255,255,255,0.1)', width: 1 },
    type: 'scatter3d', showlegend: false, hoverinfo: 'skip'
  });

  // State vector arrow
  sphereTraces.push({
    x: [0, sx], y: [0, sy], z: [0, sz],
    mode: 'lines+markers',
    line: { color: '#00f0ff', width: 4 },
    marker: { size: [0, 8], color: ['#00f0ff', '#00f0ff'] },
    type: 'scatter3d',
    name: '|ψ⟩',
    showlegend: true
  });

  // Axes
  sphereTraces.push({
    x: [-1.3, 1.3], y: [0, 0], z: [0, 0], mode: 'lines+text',
    line: { color: '#ff4ecd', width: 2 },
    text: ['', 'Sx'],
    textposition: 'top center',
    textfont: { color: '#ff4ecd', size: 10 },
    type: 'scatter3d', showlegend: false, hoverinfo: 'skip'
  });
  sphereTraces.push({
    x: [0, 0], y: [-1.3, 1.3], z: [0, 0], mode: 'lines+text',
    line: { color: '#4ade80', width: 2 },
    text: ['', 'Sy'],
    textposition: 'top center',
    textfont: { color: '#4ade80', size: 10 },
    type: 'scatter3d', showlegend: false, hoverinfo: 'skip'
  });
  sphereTraces.push({
    x: [0, 0], y: [0, 0], z: [-1.3, 1.3], mode: 'lines+text',
    line: { color: '#c084fc', width: 2 },
    text: ['', 'Sz'],
    textposition: 'top center',
    textfont: { color: '#c084fc', size: 10 },
    type: 'scatter3d', showlegend: false, hoverinfo: 'skip'
  });

  _plot('plot-bloch', sphereTraces, {
    margin: { t: 20, r: 10, b: 20, l: 10 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    scene: {
      xaxis: { visible: false, range: [-1.5, 1.5] },
      yaxis: { visible: false, range: [-1.5, 1.5] },
      zaxis: { visible: false, range: [-1.5, 1.5] },
      camera: { eye: { x: 1.3, y: 1.3, z: 1.0 } },
      bgcolor: 'rgba(0,0,0,0)'
    },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 }
  }, PLOT_CFG);
}

function plotSpinComponents() {
  const a = getAmplitudes(state.theta, state.phi);
  const sx = expectationSigmaX(a);
  const sy = expectationSigmaY(a);
  const sz = expectationSigmaZ(a);

  _plot('plot-components', [
    { x: ['⟨Sx⟩', '⟨Sy⟩', '⟨Sz⟩'], y: [sx, sy, sz],
      type: 'bar',
      marker: { color: ['#ff4ecd', '#4ade80', '#c084fc'] },
      text: [sx.toFixed(3), sy.toFixed(3), sz.toFixed(3)],
      textposition: 'outside',
      textfont: { color: '#e0e0f0', size: 11 }
    }
  ], {
    margin: { t: 20, r: 10, b: 50, l: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { color: '#505070', gridcolor: '#1a1a28' },
    yaxis: { title: 'Expectation value (ħ/2)', color: '#505070', gridcolor: '#1a1a28', range: [-1.2, 1.2] },
    bargap: 0.4
  }, PLOT_CFG);
}

function updateLiveTable() {
  const a = getAmplitudes(state.theta, state.phi);
  const sx = expectationSigmaX(a);
  const sy = expectationSigmaY(a);
  const sz = expectationSigmaZ(a);

  var elTh = document.getElementById('live-theta');
  if (elTh) elTh.textContent = (state.theta * 180 / Math.PI).toFixed(1) + '°';
  var elPh = document.getElementById('live-phi');
  if (elPh) elPh.textContent = (state.phi * 180 / Math.PI).toFixed(1) + '°';
  var elSx = document.getElementById('live-sx');
  if (elSx) elSx.textContent = sx.toFixed(4) + ' ħ/2';
  var elSy = document.getElementById('live-sy');
  if (elSy) elSy.textContent = sy.toFixed(4) + ' ħ/2';
  var elSz = document.getElementById('live-sz');
  if (elSz) elSz.textContent = sz.toFixed(4) + ' ħ/2';

  // Larmor frequency
  const omega = state.gFactor * muB_eV * state.B / h;  // rad/s... actually in eV: E = g μB B
  const f_MHz = state.gFactor * 28.024 * state.B;  // ESR frequency in GHz for g≈2
  var elOm = document.getElementById('live-omega');
  if (elOm) elOm.textContent = f_MHz.toFixed(2) + ' GHz';
}

// ===== STERN-GERLACH SIMULATOR =====
function updateSG() {
  const a = getAmplitudes(state.theta, state.phi);

  // Stage 0: show initial probabilities
  const pz = measureProbZ(a);
  var elPzUp = document.getElementById('sg-pz-up');
  if (elPzUp) elPzUp.textContent = (pz.up * 100).toFixed(1) + '%';
  var elPzDown = document.getElementById('sg-pz-down');
  if (elPzDown) elPzDown.textContent = (pz.down * 100).toFixed(1) + '%';

  const px = measureProbX(a);
  var elPxPlus = document.getElementById('sg-px-plus');
  if (elPxPlus) elPxPlus.textContent = (px.plus * 100).toFixed(1) + '%';
  var elPxMinus = document.getElementById('sg-px-minus');
  if (elPxMinus) elPxMinus.textContent = (px.minus * 100).toFixed(1) + '%';

  // Show stage results
  var elS1 = document.getElementById('sg-stage1-result');
  if (elS1) {
    if (state.sgResult1 === null) elS1.textContent = '—';
    else elS1.textContent = state.sgResult1 === 1 ? '|↑z⟩ (spin up)' : '|↓z⟩ (spin down)';
  }
  var elS2 = document.getElementById('sg-stage2-result');
  if (elS2) {
    if (state.sgResult2 === null) elS2.textContent = '—';
    else elS2.textContent = state.sgResult2 === 1 ? '|+x⟩' : '|−x⟩';
  }
}

function plotSGHistogram() {
  // Show measurement statistics for current state
  const a = getAmplitudes(state.theta, state.phi);
  const pz = measureProbZ(a);
  const px = measureProbX(a);

  _plot('plot-sg-hist', [
    { x: ['|↑z⟩', '|↓z⟩'], y: [pz.up, pz.down],
      type: 'bar', name: 'SG(z)',
      marker: { color: ['#c084fc', '#ff4ecd'] },
      text: [(pz.up*100).toFixed(1)+'%', (pz.down*100).toFixed(1)+'%'],
      textposition: 'outside'
    },
    { x: ['|+x⟩', '|−x⟩'], y: [px.plus, px.minus],
      type: 'bar', name: 'SG(x)',
      marker: { color: ['#4ade80', '#ffd740'] },
      text: [(px.plus*100).toFixed(1)+'%', (px.minus*100).toFixed(1)+'%'],
      textposition: 'outside',
      xaxis: 'x2', yaxis: 'y2'
    }
  ], {
    margin: { t: 20, r: 10, b: 40, l: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { domain: [0, 0.45], title: 'SG(z) basis', color: '#505070' },
    xaxis2: { domain: [0.55, 1], title: 'SG(x) basis', color: '#505070' },
    yaxis: { title: 'Probability', color: '#505070', range: [0, 1.1] },
    yaxis2: { overlaying: 'y', side: 'right', visible: false },
    bargap: 0.3,
    showlegend: false
  }, PLOT_CFG);
}

// ===== ANIMATION =====
let currentAmplitude = null;

function animateLoop() {
  if (!state.animating) return;
  state.time += 0.03;

  const omega = state.gFactor * muB_eV * state.B / h;  // rad/s
  // Simplify: just advance phi
  state.phi += 0.06;
  if (state.phi > 2 * Math.PI) state.phi -= 2 * Math.PI;

  plotBlochSphere();
  plotSpinComponents();
  updateLiveTable();

  state.animFrame = requestAnimationFrame(animateLoop);
}

// ===== C. APPLICATIONS =====
function plotLarmorPrecession() {
  // Time evolution of Sz under B-field
  const dt = 0.01;
  const omega = state.gFactor * 2 * Math.PI * 28.024 * state.B;  // rad/ns for g≈2
  const tmax = 2 * Math.PI / (state.gFactor * 2 * Math.PI * 28.024 * 0.1);  // one period at B=0.1T

  const t = [], sz_t = [];
  const a0 = getAmplitudes(state.theta, state.phi);
  for (let i = 0; i <= 200; i++) {
    const ti = i * tmax / 200;
    t.push(ti);
    const a = evolveLarmor(a0, ti, omega);
    sz_t.push(expectationSigmaZ(a));
  }

  _plot('plot-larmor', [
    { x: t, y: sz_t, mode: 'lines',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)',
      name: '⟨Sz(t)⟩'
    }
  ], layout(null, 'Time t (ns)', '⟨Sz⟩ (ħ/2)'), PLOT_CFG);
}

function plotNMRResonance() {
  // Nuclear spin resonance: proton g-factor ≈ 5.585, resonance at B vs frequency
  const g_p = 5.5857;
  const Bvals = [];
  const fvals = [];
  for (let B = 0.1; B <= 10; B += 0.1) {
    Bvals.push(B);
    fvals.push(g_p * 42.577 * B);  // MHz/T for proton
  }

  _plot('plot-nmr', [
    { x: Bvals, y: fvals, mode: 'lines',
      line: { color: '#4ade80', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.08)',
      name: '¹H resonance'
    }
  ], layout(null, 'Magnetic field B (T)', 'Larmor frequency f (MHz)'), PLOT_CFG);
}

function plotHyperfine() {
  // Hydrogen 21cm line: F=0 and F=1 hyperfine splitting
  const traces = [];
  const E0 = 0;
  const deltaE = 5.874e-6;  // eV, 1420 MHz

  traces.push({
    x: [0, 1], y: [E0, E0],
    mode: 'lines',
    line: { color: '#00f0ff', width: 3 },
    name: 'F = 0  (singlet)'
  });
  traces.push({
    x: [0, 1], y: [E0 + deltaE, E0 + deltaE],
    mode: 'lines',
    line: { color: '#ff4ecd', width: 3 },
    name: 'F = 1  (triplet, m_F = −1, 0, +1)'
  });
  traces.push({
    x: [0.5, 0.5], y: [E0, E0 + deltaE],
    mode: 'lines+markers',
    line: { color: '#ffd740', width: 2 },
    marker: { size: 6, color: '#ffd740' },
    showlegend: false
  });

  _plot('plot-hyperfine', traces, {
    margin: { t: 25, r: 10, b: 40, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { visible: false, range: [-0.2, 1.2] },
    yaxis: { title: 'E (eV)', color: '#505070', gridcolor: '#1a1a28' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 }
  }, PLOT_CFG);
}

// ============ INIT ============
function initSpin() {
  var sliderTh = document.getElementById('slider-theta');
  var sliderPh = document.getElementById('slider-phi');
  var sliderB = document.getElementById('slider-B');
  var btnAnim = document.getElementById('btn-animate');
  var btnSG1Up = document.getElementById('btn-sg1-up');
  var btnSG1Down = document.getElementById('btn-sg1-down');
  var btnSG2Plus = document.getElementById('btn-sg2-plus');
  var btnSG2Minus = document.getElementById('btn-sg2-minus');
  var btnReset = document.getElementById('btn-reset-sg');

  if (sliderTh) {
    sliderTh.addEventListener('input', function() {
      state.theta = parseFloat(this.value) * Math.PI / 180;
      document.getElementById('val-theta').textContent = this.value + '°';
      if (!state.animating) { plotBlochSphere(); plotSpinComponents(); plotLarmorPrecession(); updateLiveTable(); updateSG(); plotSGHistogram(); }
    });
  }

  if (sliderPh) {
    sliderPh.addEventListener('input', function() {
      state.phi = parseFloat(this.value) * Math.PI / 180;
      document.getElementById('val-phi').textContent = this.value + '°';
      if (!state.animating) { plotBlochSphere(); plotSpinComponents(); plotLarmorPrecession(); updateLiveTable(); updateSG(); plotSGHistogram(); }
    });
  }

  if (sliderB) {
    sliderB.addEventListener('input', function() {
      state.B = parseFloat(this.value);
      document.getElementById('val-B').textContent = state.B.toFixed(2);
      plotLarmorPrecession();
      updateLiveTable();
    });
  }

  if (btnAnim) {
    btnAnim.addEventListener('click', function() {
      state.animating = !state.animating;
      this.classList.toggle('active', state.animating);
      if (state.animating) {
        animateLoop();
      } else {
        cancelAnimationFrame(state.animFrame);
        plotBlochSphere(); plotSpinComponents(); updateLiveTable();
      }
    });
  }

  // Stern-Gerlach buttons
  if (btnSG1Up) {
    btnSG1Up.addEventListener('click', function() {
      state.sgStage = 1; state.sgResult1 = 1;
      const a = getAmplitudes(state.theta, state.phi);
      const collapsed = measureCollapseZ(a, 1);
      state.theta = 0; state.phi = 0;  // |↑z⟩
      document.getElementById('slider-theta').value = '0';
      document.getElementById('val-theta').textContent = '0°';
      document.getElementById('slider-phi').value = '0';
      document.getElementById('val-phi').textContent = '0°';
      updateSG(); plotBlochSphere(); plotSpinComponents(); plotSGHistogram(); updateLiveTable();
    });
  }
  if (btnSG1Down) {
    btnSG1Down.addEventListener('click', function() {
      state.sgStage = 1; state.sgResult1 = -1;
      state.theta = Math.PI; state.phi = 0;  // |↓z⟩
      document.getElementById('slider-theta').value = '180';
      document.getElementById('val-theta').textContent = '180°';
      document.getElementById('slider-phi').value = '0';
      document.getElementById('val-phi').textContent = '0°';
      updateSG(); plotBlochSphere(); plotSpinComponents(); plotSGHistogram(); updateLiveTable();
    });
  }
  if (btnSG2Plus) {
    btnSG2Plus.addEventListener('click', function() {
      if (state.sgStage < 1) return;
      state.sgStage = 2; state.sgResult2 = 1;
      state.theta = Math.PI / 2; state.phi = 0;  // |+x⟩
      document.getElementById('slider-theta').value = '90';
      document.getElementById('val-theta').textContent = '90°';
      document.getElementById('slider-phi').value = '0';
      document.getElementById('val-phi').textContent = '0°';
      updateSG(); plotBlochSphere(); plotSpinComponents(); plotSGHistogram(); updateLiveTable();
    });
  }
  if (btnSG2Minus) {
    btnSG2Minus.addEventListener('click', function() {
      if (state.sgStage < 1) return;
      state.sgStage = 2; state.sgResult2 = -1;
      state.theta = Math.PI / 2; state.phi = Math.PI;  // |−x⟩
      document.getElementById('slider-theta').value = '90';
      document.getElementById('val-theta').textContent = '90°';
      document.getElementById('slider-phi').value = '180';
      document.getElementById('val-phi').textContent = '180°';
      updateSG(); plotBlochSphere(); plotSpinComponents(); plotSGHistogram(); updateLiveTable();
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', function() {
      state.sgStage = 0; state.sgResult1 = null; state.sgResult2 = null;
      state.theta = Math.PI / 3; state.phi = Math.PI / 4;
      document.getElementById('slider-theta').value = '60';
      document.getElementById('val-theta').textContent = '60°';
      document.getElementById('slider-phi').value = '45';
      document.getElementById('val-phi').textContent = '45°';
      updateSG(); plotBlochSphere(); plotSpinComponents(); plotSGHistogram(); updateLiveTable();
    });
  }

  plotBlochSphere(); plotSpinComponents(); plotLarmorPrecession();
  plotNMRResonance(); plotHyperfine(); plotSGHistogram();
  updateLiveTable(); updateSG();
}

initSpin();
window.initSpin = initSpin;

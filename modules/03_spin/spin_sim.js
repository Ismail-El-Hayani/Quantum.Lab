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
  phi: Math.PI / 4,       // azimuthal angle 0..2π
  phi0: Math.PI / 4,      // snapshot for reset
  speedFactor: 1.0,       // animation speed multiplier
  animating: false,
  animFrame: null
};

// ============ SPIN MATH ============
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
    line: { color: '#ff3864', width: 4 },
    marker: { size: [0, 8], color: ['#ff3864', '#ff3864'] },
    type: 'scatter3d',
    name: '|ψ⟩',
    showlegend: true
  });

  // Axes with Sx / Sy / Sz labels at positive ends
  sphereTraces.push({
    x: [-1.1, 1.1], y: [0, 0], z: [0, 0], mode: 'lines+text',
    line: { color: '#ff4ecd', width: 2 },
    text: ['', 'Sx'],
    textposition: 'top right',
    textfont: { color: '#ff4ecd', size: 12 },
    type: 'scatter3d', showlegend: false, hoverinfo: 'skip'
  });
  sphereTraces.push({
    x: [0, 0], y: [-1.1, 1.1], z: [0, 0], mode: 'lines+text',
    line: { color: '#4ade80', width: 2 },
    text: ['', 'Sy'],
    textposition: 'top right',
    textfont: { color: '#4ade80', size: 12 },
    type: 'scatter3d', showlegend: false, hoverinfo: 'skip'
  });
  sphereTraces.push({
    x: [0, 0], y: [0, 0], z: [-1.1, 1.1], mode: 'lines+text',
    line: { color: '#c084fc', width: 2 },
    text: ['', 'Sz'],
    textposition: 'top right',
    textfont: { color: '#c084fc', size: 12 },
    type: 'scatter3d', showlegend: false, hoverinfo: 'skip'
  });

  _plot('plot-bloch', sphereTraces, {
    autosize: true,
    margin: { t: 0, r: 0, b: 0, l: 0 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    scene: {
      xaxis: { visible: false, range: [-1.15, 1.15] },
      yaxis: { visible: false, range: [-1.15, 1.15] },
      zaxis: { visible: false, range: [-1.15, 1.15] },
      camera: { eye: { x: 1.2, y: 1.2, z: 0.9 } },
      aspectmode: 'cube',
      bgcolor: 'rgba(0,0,0,0)'
    },
    showlegend: false
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
    autosize: true,
    margin: { t: 20, r: 10, b: 40, l: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { color: '#505070', gridcolor: '#1a1a28', tickfont: { size: 10 } },
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

  // Larmor frequency shown for a fixed 1 T reference field
  const f_GHz = 2.0023 * 28.024 * 1.0;  // ESR frequency in GHz for g≈2 at B=1 T
  var elOm = document.getElementById('live-omega');
  if (elOm) elOm.textContent = f_GHz.toFixed(2) + ' GHz';
}

// ===== ANIMATION =====
function animateLoop() {
  if (!state.animating) return;

  /* Physics-correct precession scaled for comfortable visual speed.
     f = g·28.024·B  (GHz).  One full rotation every ~1.5 s at B = 1 T. */
  const f_GHz = 2.0023 * 28.024 * 1.0;
  const dt = 0.016;                     // ~60 FPS frame time in ns
  const dPhi = 2 * Math.PI * f_GHz * dt * 0.001 * 0.60 * state.speedFactor;  // 0.60 base, × speedFactor
  state.phi += dPhi;
  if (state.phi > 2 * Math.PI) state.phi -= 2 * Math.PI;

  // Sync the φ slider and readout so the user sees continuous motion.
  // Keep state.phi0 unchanged — that is the Reset anchor set on Play.
  const phiDeg = state.phi * 180 / Math.PI;
  const sliderPhi = document.getElementById('slider-phi');
  const valPhi = document.getElementById('val-phi');
  if (sliderPhi) sliderPhi.value = phiDeg.toFixed(0);
  if (valPhi) valPhi.textContent = phiDeg.toFixed(0) + '°';

  const a = getAmplitudes(state.theta, state.phi);
  const sx = expectationSigmaX(a);
  const sy = expectationSigmaY(a);
  const sz = expectationSigmaZ(a);

  /* Fast path: restyle only the arrow trace (index 2) instead of
     rebuilding the entire Bloch sphere with Plotly.react(). */
  if (typeof Plotly !== 'undefined') {
    Plotly.restyle('plot-bloch', {
      x: [[0, sx]],
      y: [[0, sy]],
      z: [[0, sz]]
    }, [2]);
  }

  /* Throttle expensive updates — bar chart + live table every 5th frame. */
  state.frameCount = (state.frameCount || 0) + 1;
  if (state.frameCount % 5 === 0) {
    plotSpinComponents();
    updateLiveTable();
  }

  state.animFrame = requestAnimationFrame(animateLoop);
}

// ===== C. APPLICATIONS (placeholder — none exposed in current HTML) =====
function plotLarmorPrecession() {}
function plotNMRResonance() {}
function plotHyperfine() {}

// ============ INIT ============
function initSpin() {
  var sliderTh = document.getElementById('slider-theta');
  var sliderPh = document.getElementById('slider-phi');
  var btnPlay = document.getElementById('btn-play');
  var btnPause = document.getElementById('btn-pause');
  var btnResetAnim = document.getElementById('btn-reset');
  var sliderSpeed = document.getElementById('slider-speed');

  if (sliderTh) {
    sliderTh.addEventListener('input', function() {
      state.theta = parseFloat(this.value) * Math.PI / 180;
      document.getElementById('val-theta').textContent = this.value + '°';
      if (!state.animating) { plotBlochSphere(); plotSpinComponents(); updateLiveTable(); }
    });
  }

  if (sliderPh) {
    sliderPh.addEventListener('input', function() {
      state.phi = parseFloat(this.value) * Math.PI / 180;
      document.getElementById('val-phi').textContent = this.value + '°';
      if (!state.animating) { plotBlochSphere(); plotSpinComponents(); updateLiveTable(); }
    });
  }

  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', function() {
      state.speedFactor = parseFloat(this.value);
      var vspeed = document.getElementById('val-speed');
      if (vspeed) vspeed.textContent = state.speedFactor.toFixed(1) + '×';
    });
  }

  function setAnimUI(playing) {
    if (btnPlay) btnPlay.disabled = playing;
    if (btnPause) btnPause.disabled = !playing;
    if (btnResetAnim) btnResetAnim.disabled = playing;
  }

  if (btnPlay) {
    btnPlay.addEventListener('click', function() {
      if (state.animating) return;
      state.phi0 = state.phi;   // snapshot start-of-run for Reset
      state.animating = true;
      setAnimUI(true);
      animateLoop();
    });
  }

  if (btnPause) {
    btnPause.addEventListener('click', function() {
      if (!state.animating) return;
      state.animating = false;
      cancelAnimationFrame(state.animFrame);
      setAnimUI(false);
    });
  }

  if (btnResetAnim) {
    btnResetAnim.addEventListener('click', function() {
      state.animating = false;
      cancelAnimationFrame(state.animFrame);
      state.phi = state.phi0;
      setAnimUI(false);
      var phSlider = document.getElementById('slider-phi');
      if (phSlider) phSlider.value = Math.round(state.phi * 180 / Math.PI);
      var vph = document.getElementById('val-phi');
      if (vph) vph.textContent = Math.round(state.phi * 180 / Math.PI) + '°';
      plotBlochSphere(); plotSpinComponents(); updateLiveTable();
    });
  }

  plotBlochSphere(); plotSpinComponents();
  updateLiveTable();
}

initSpin();
window.initSpin = initSpin;

/**
 * Electrical Conductivity — Physics Engine (v4 Canvas)
 * Canvas: px-based visual simulation (tuned for visibility)
 * Plots: real physics formulas
 */

'use strict';

var e_charge = 1.602e-19;
var m_e_kg = 9.109e-31;
var kB_eV = 8.617e-5;
var nm = 1e-9;

var COND_STATE = {
  Efield: 0.01,
  tau: 30,
  T: 300,
  n: 1e28,
  material: 'Cu',
  paused: false,
  showPhonons: true,
  showImpurities: true,
  showMFP: false
};

/* ===== Canvas Engine ===== */
var COND_CANVAS = {
  c: null, ctx: null,
  running: false, raf: null,
  width: 0, height: 0,
  frame: 0,
  electrons: [],
  ions: [],
  impurities: [],
  phonons: [],
  mfpTracks: [],
  collisionCount: 0
};

function condInitLattice() {
  var geo = COND_CANVAS;
  var w = geo.width, h = geo.height;
  var cols = 14, rows = 8;
  var spacingX = (w - 80) / (cols - 1);
  var spacingY = (h - 100) / (rows - 1);
  var offX = 40, offY = 50;

  geo.ions = [];
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      geo.ions.push({
        x: offX + c * spacingX,
        y: offY + r * spacingY,
        baseX: offX + c * spacingX,
        baseY: offY + r * spacingY,
        phase: Math.random() * 6.283
      });
    }
  }

  geo.impurities = [];
  var impCount = Math.max(3, Math.floor(28 - COND_STATE.tau / 4));
  for (var i = 0; i < impCount; i++) {
    geo.impurities.push({
      x: 30 + Math.random() * (w - 60),
      y: 40 + Math.random() * (h - 80)
    });
  }

  geo.phonons = [];
  for (var i = 0; i < geo.ions.length; i++) {
    var ion = geo.ions[i];
    var c = i % cols, r = Math.floor(i / cols);
    if (c < cols - 1) {
      geo.phonons.push({ aIdx: i, bIdx: i + 1, phase: Math.random() * 6.283, type: 'horiz' });
    }
    if (r < rows - 1) {
      geo.phonons.push({ aIdx: i, bIdx: i + cols, phase: Math.random() * 6.283, type: 'vert' });
    }
  }
}

function condInitElectrons() {
  var geo = COND_CANVAS;
  var w = geo.width, h = geo.height;
  var count = 80;

  geo.electrons = [];
  geo.mfpTracks = [];
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * 6.283;
    geo.electrons.push({
      x: 20 + Math.random() * (w - 40),
      y: 30 + Math.random() * (h - 60),
      vx: 0,
      vy: 0,
      flash: 0,
      framesSinceScatter: Math.floor(Math.random() * 30)
    });
    geo.mfpTracks.push(0);
  }
  geo.collisionCount = 0;
}

function condInitCanvas() {
  var c = document.getElementById('cond-canvas');
  if (!c) { console.warn('[COND] canvas not found'); return false; }
  COND_CANVAS.c = c;
  COND_CANVAS.ctx = c.getContext('2d');
  condResizeCanvas();
  window.addEventListener('resize', function() {
    condResizeCanvas();
  });
  return true;
}

function condResizeCanvas() {
  var wrap = document.querySelector('.cond-canvas-wrap');
  if (!wrap || !COND_CANVAS.c) return;
  var w = Math.max(200, wrap.clientWidth);
  var h = 420;
  COND_CANVAS.c.width = w;
  COND_CANVAS.c.height = h;
  COND_CANVAS.width = w;
  COND_CANVAS.height = h;
  condInitLattice();
  condInitElectrons();
}

/* === Physics step (px-based, tuned for visibility) === */
function condPhysicsStep() {
  var geo = COND_CANVAS;
  var st = COND_STATE;
  var w = geo.width, h = geo.height;

  /* Visual parameters tuned for visibility on 800x420 canvas */
  var vThermal = 3.0 + (st.T / 300) * 2.5;  // px/frame thermal speed
  var tauFrames = Math.max(8, Math.round(st.tau / 2.5));  // frames between scatters
  var aE = st.Efield * 0.4;  // px/frame^2 — tuned so drift is visible

  var sumVx = 0;
  var activeMFP = 0, mfpCount = 0;

  for (var i = 0; i < geo.electrons.length; i++) {
    var e = geo.electrons[i];

    /* E-field acceleration */
    e.vx += aE;

    /* Move */
    e.x += e.vx;
    e.y += e.vy;

    /* Periodic boundaries */
    if (e.x < 0) e.x += w;
    if (e.x > w) e.x -= w;
    if (e.y < 0) e.y += h;
    if (e.y > h) e.y -= h;

    /* Scattering */
    e.framesSinceScatter++;
    if (e.framesSinceScatter >= tauFrames) {
      var ang = Math.random() * 6.283;
      e.vx = vThermal * Math.cos(ang);
      e.vy = vThermal * Math.sin(ang);
      e.flash = 6;

      if (geo.mfpTracks[i] > 2) {
        activeMFP += geo.mfpTracks[i];
        mfpCount++;
      }
      geo.mfpTracks[i] = 0;
      e.framesSinceScatter = 0;
      geo.collisionCount++;
    } else {
      var speed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
      geo.mfpTracks[i] += speed;
    }

    sumVx += e.vx;
    if (e.flash > 0) e.flash--;
  }

  geo.avgVx = sumVx / geo.electrons.length;
  if (mfpCount > 0) geo.avgMFP = activeMFP / mfpCount;
}

/* === Draw frame === */
function condDrawFrame() {
  var geo = COND_CANVAS;
  var ctx = geo.ctx;
  var w = geo.width, h = geo.height;
  var st = COND_STATE;
  var t = geo.frame * 0.03;

  /* Background */
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, w, h);

  /* Subtle grid */
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (var gx = 0; gx < w; gx += 40) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
  }
  for (var gy = 0; gy < h; gy += 40) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
  }

  /* Phonon bonds */
  var phononAmp = (st.T / 300) * 2.5;
  if (st.showPhonons && phononAmp > 0.3) {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (var i = 0; i < geo.phonons.length; i++) {
      var ph = geo.phonons[i];
      var a = geo.ions[ph.aIdx];
      var b = geo.ions[ph.bIdx];
      if (!a || !b) continue;
      var segs = 8;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      for (var s = 1; s <= segs; s++) {
        var frac = s / segs;
        var px = a.x + (b.x - a.x) * frac;
        var py = a.y + (b.y - a.y) * frac;
        var off = phononAmp * Math.sin(frac * 12.566 + t + ph.phase);
        if (ph.type === 'horiz') py += off;
        else px += off;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  /* Lattice ions */
  var jiggle = (st.T / 300) * 1.5;
  for (var i = 0; i < geo.ions.length; i++) {
    var ion = geo.ions[i];
    ion.x = ion.baseX + jiggle * Math.sin(t + ion.phase);
    ion.y = ion.baseY + jiggle * Math.cos(t * 0.7 + ion.phase);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(ion.x, ion.y, 3.5, 0, 6.283);
    ctx.fill();
  }

  /* Impurities */
  if (st.showImpurities) {
    for (var i = 0; i < geo.impurities.length; i++) {
      var imp = geo.impurities[i];
      ctx.fillStyle = 'rgba(255,68,68,0.6)';
      ctx.beginPath();
      ctx.arc(imp.x, imp.y, 4.5, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,68,68,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(imp.x, imp.y, 8, 0, 6.283);
      ctx.stroke();
    }
  }

  /* Electrons */
  for (var i = 0; i < geo.electrons.length; i++) {
    var e = geo.electrons[i];
    if (e.flash > 0) {
      var alpha = e.flash / 6;
      ctx.fillStyle = 'rgba(255,215,64,' + (alpha * 0.6) + ')';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 6, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,215,64,' + alpha + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 10, 0, 6.283);
      ctx.stroke();
    }
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(e.x, e.y, 3, 0, 6.283);
    ctx.fill();
  }

  /* E-field arrow (top-right) */
  if (st.Efield > 0.001) {
    var arrowLen = 30 + st.Efield * 150;
    var ax = w - 50, ay = 28;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - arrowLen, ay);
    ctx.stroke();
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - 10, ay - 4);
    ctx.lineTo(ax - 10, ay + 4);
    ctx.fill();
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('E = ' + st.Efield.toFixed(3) + ' V/nm', ax, ay - 10);
  }

  /* Drift velocity arrow (bottom center) */
  var avgVx = geo.avgVx || 0;
  var driftPx = avgVx * 2;
  if (Math.abs(driftPx) > 1) {
    var dx = w / 2, dy = h - 20;
    ctx.strokeStyle = '#ffd740';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx + driftPx * 3, dy);
    ctx.stroke();
    ctx.fillStyle = '#ffd740';
    ctx.beginPath();
    ctx.moveTo(dx + driftPx * 3, dy);
    ctx.lineTo(dx + driftPx * 3 - (driftPx > 0 ? 8 : -8), dy - 4);
    ctx.lineTo(dx + driftPx * 3 - (driftPx > 0 ? 8 : -8), dy + 4);
    ctx.fill();
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd740';
    ctx.fillText('v_d', dx + driftPx * 1.5, dy - 8);
  }

  /* MFP trails for subset */
  if (st.showMFP) {
    ctx.strokeStyle = 'rgba(74,222,128,0.45)';
    ctx.lineWidth = 1.5;
    for (var i = 0; i < Math.min(geo.electrons.length, 20); i++) {
      var e = geo.electrons[i];
      var mfp = geo.mfpTracks[i];
      if (mfp > 5) {
        var speed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
        if (speed > 0.1) {
          var nx = e.vx / speed;
          var ny = e.vy / speed;
          var trailLen = Math.min(mfp, 50);
          ctx.beginPath();
          ctx.moveTo(e.x, e.y);
          ctx.lineTo(e.x - nx * trailLen, e.y - ny * trailLen);
          ctx.stroke();
        }
      }
    }
  }

  /* Legend (top-left) */
  var lx = 12, ly = 12, lh = 18;
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  var items = [
    { c: '#00f0ff', t: 'Electron' },
    { c: 'rgba(255,255,255,0.5)', t: 'Lattice ion' },
    { c: 'rgba(255,68,68,0.7)', t: 'Impurity' },
    { c: '#ffd740', t: 'Scatter flash' },
    { c: '#c084fc', t: 'E-field' }
  ];
  for (var i = 0; i < items.length; i++) {
    ctx.fillStyle = items[i].c;
    ctx.fillRect(lx, ly + i * lh, 10, 10);
    ctx.fillStyle = '#a0a0c0';
    ctx.fillText(items[i].t, lx + 16, ly + i * lh + 9);
  }

  /* Live readout bar (bottom-right) */
  var sigma = st.n * e_charge * e_charge * (st.tau * 1e-15) / m_e_kg;
  var vF = Math.sqrt(2 * 7.0 * e_charge / m_e_kg);
  var mfp = vF * st.tau * 1e-15 * 1e9;
  var mu = e_charge * (st.tau * 1e-15) / m_e_kg;
  var vd_real = (e_charge * st.Efield * 1e9 * st.tau * 1e-15 / m_e_kg) * 1e-3;  // mm/s

  ctx.fillStyle = 'rgba(10,10,20,0.85)';
  ctx.fillRect(w - 240, h - 68, 230, 62);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(w - 240, h - 68, 230, 62);
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#a0a0c0';
  ctx.fillText('v_d = ' + vd_real.toFixed(3) + ' mm/s', w - 234, h - 54);
  ctx.fillText('sigma = ' + (sigma / 1e7).toFixed(1) + 'e7 S/m', w - 234, h - 42);
  ctx.fillText('MFP = ' + mfp.toFixed(1) + ' nm', w - 234, h - 30);
  ctx.fillText('mu = ' + (mu * 1e4).toFixed(1) + ' cm2/Vs  tau=' + st.tau + 'fs', w - 234, h - 18);

  geo.frame++;
}

/* === Animation loop === */
function condAnimate() {
  if (!COND_CANVAS.running || COND_STATE.paused) return;
  condPhysicsStep();
  condDrawFrame();
  COND_CANVAS.raf = requestAnimationFrame(condAnimate);
}

function condStartAnimation() {
  if (COND_CANVAS.running) return;
  COND_CANVAS.running = true;
  COND_STATE.paused = false;
  condAnimate();
}

function condPauseAnimation() {
  COND_STATE.paused = true;
  if (COND_CANVAS.raf) { cancelAnimationFrame(COND_CANVAS.raf); COND_CANVAS.raf = null; }
}

function condResumeAnimation() {
  COND_STATE.paused = false;
  if (!COND_CANVAS.running) { COND_CANVAS.running = true; }
  condAnimate();
}

/* ===== Plotly Supporting Readouts ===== */
var PLOT_CFG = { responsive: true, displayModeBar: false };

function _condLayout(title, xtitle, ytitle, extra) {
  var base = {
    margin: { t: 25, r: 10, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    hovermode: 'x unified'
  };
  if (extra) { for (var k in extra) base[k] = extra[k]; }
  return base;
}

function blochGrueneisen(T, thetaD) {
  var x = T / thetaD;
  if (x < 0.1) return 1;
  if (x < 1) return 124.4 * Math.pow(x, 5);
  return 1.6 * x;
}

function linspace(a, b, n) {
  var arr = [], step = (b - a) / (n - 1);
  for (var i = 0; i < n; i++) arr.push(a + i * step);
  return arr;
}

function condPlotDrift() {
  var Ef = linspace(0, 0.5, 100);
  var tau = COND_STATE.tau;
  var vDrift = Ef.map(function(ef) {
    var a = e_charge * ef * 1e9 / m_e_kg * 1e-15;
    return a * tau * 1e-3;
  });
  Plotly.react('plot-drift', [
    { x: Ef, y: vDrift, mode: 'lines', name: 'v_d = eE' + '\u03c4' + '/m*',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: [COND_STATE.Efield, COND_STATE.Efield], y: [0, Math.max.apply(null, vDrift)],
      mode: 'lines', line: { color: '#facc15', width: 2, dash: 'dot' },
      name: 'E = ' + COND_STATE.Efield.toFixed(3) }
  ], _condLayout(null, 'E (V/nm)', 'v_d (mm/s)'), PLOT_CFG);
}

function condPlotRhoT() {
  var T = linspace(10, 600, 120);
  var rhoCu = T.map(function(t) { return 1.7 * blochGrueneisen(t, 315); });
  var rhoAl = T.map(function(t) { return 2.7 * blochGrueneisen(t, 394); });
  var rhoSi = T.map(function(t) {
    var sigma = 1e-3 * Math.exp(-1.1 / (2 * kB_eV * t));
    return 1 / sigma * 1e-5;
  });
  Plotly.react('plot-rho-T', [
    { x: T, y: rhoCu, mode: 'lines', name: 'Cu (' + '\u03b8' + '_D=315K)',
      line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: T, y: rhoAl, mode: 'lines', name: 'Al (' + '\u03b8' + '_D=394K)',
      line: { color: '#c084fc', width: 2 } },
    { x: T, y: rhoSi, mode: 'lines', name: 'Si (semiconductor)',
      line: { color: '#4ade80', width: 2.5 }, yaxis: 'y2' }
  ], {
    margin: { t: 25, r: 55, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: 'T (K)', color: '#505070', gridcolor: '#1a1a28' },
    yaxis: { title: '\u03c1_metal (\u03bc\u03a9·cm)', color: '#00f0ff', gridcolor: '#1a1a28' },
    yaxis2: { overlaying: 'y', side: 'right', title: '\u03c1_Si (\u03a9·cm)', color: '#4ade80', gridcolor: '#1a1a28', type: 'log' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 }
  }, PLOT_CFG);
}

function condPlotIV() {
  var V = linspace(-5, 5, 200);
  var kT = kB_eV * COND_STATE.T;
  var Iohmic = V.map(function(v) { return v / 1e-3; });
  var Idiode = V.map(function(v) { return 1e-3 * (Math.exp(v / kT) - 1); });
  Plotly.react('plot-iv', [
    { x: V, y: Iohmic, mode: 'lines', name: 'Ohmic (Cu)', line: { color: '#00f0ff', width: 2 } },
    { x: V, y: Idiode, mode: 'lines', name: 'p-n Diode at ' + COND_STATE.T + ' K', line: { color: '#ff4ecd', width: 2 } }
  ], _condLayout(null, 'V (V)', 'I (A)', { yaxis: { type: 'log' } }), PLOT_CFG);
}

function condPlotMFP() {
  var T = linspace(10, 500, 100);
  var lph = T.map(function(t) { return 40 * (300 / Math.max(t, 50)); });
  var limp = T.map(function() { return 200; });
  var ltot = T.map(function(t, i) { return 1 / (1 / lph[i] + 1 / limp[i]); });
  Plotly.react('plot-mfp', [
    { x: T, y: lph, mode: 'lines', name: 'e' + '\u207b' + '-phonon',
      line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: T, y: limp, mode: 'lines', name: 'e' + '\u207b' + '-impurity',
      line: { color: '#ff4ecd', width: 2, dash: 'dash' } },
    { x: T, y: ltot, mode: 'lines', name: 'Total (Matthiessen)',
      line: { color: '#ffd740', width: 2.5 } }
  ], _condLayout(null, 'T (K)', 'Mean free path ' + '\u03bb' + ' (nm)'), PLOT_CFG);
}

function condPlotHall() {
  var B = linspace(-2, 2, 200);
  var thickness = 100 * nm;
  var I = 1e-3;
  var n = 1e28;
  var vh = I / (n * e_charge * thickness);
  var VHn = B.map(function(b) { return vh * b * 1e6; });
  var VHp = B.map(function(b) { return -vh * b * 1e6; });
  Plotly.react('plot-hall', [
    { x: B, y: VHn, mode: 'lines', name: 'n-type',
      line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: B, y: VHp, mode: 'lines', name: 'p-type',
      line: { color: '#ff4ecd', width: 2.5 } }
  ], _condLayout(null, 'B (T)', 'V_H (' + '\u03bc' + 'V)'), PLOT_CFG);
}

function condPlotIoffe() {
  var T = linspace(10, 1000, 100);
  var kFl = T.map(function(t) {
    var tau = 50 * 300 / Math.max(t, 10);
    var vF = Math.sqrt(2 * 7.0 * e_charge / m_e_kg);
    var lambda = vF * tau * 1e-15 * 1e9;
    var kF = Math.sqrt(2 * 7.0) * 1e10;
    return kF * lambda;
  });
  var limit = T.map(function() { return 1; });
  Plotly.react('plot-ioffe', [
    { x: T, y: kFl, mode: 'lines', name: 'k_F ' + '\u03bb',
      line: { color: '#ffd740', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(255,215,64,0.06)' },
    { x: T, y: limit, mode: 'lines', name: 'Ioffe-Regel limit',
      line: { color: '#ff4ecd', width: 2, dash: 'dash' } }
  ], _condLayout(null, 'T (K)', 'k_F ' + '\u03bb'), PLOT_CFG);
}

function condPlotWiedemann() {
  var T = linspace(10, 500, 100);
  var L = T.map(function(t) {
    var tau = 50 * 300 / Math.max(t, 50);
    var vF = Math.sqrt(2 * 7.0 * e_charge / m_e_kg);
    var lambda = vF * tau * 1e-15;
    var c_el = e_charge * Math.PI * Math.PI / 3 * kB_eV * t / 7.0;
    var sigma = 1e28 * e_charge * e_charge * tau * 1e-15 / m_e_kg;
    var kappa = (1 / 3) * c_el * vF * lambda;
    return kappa / (sigma * t);
  });
  var Sommerfeld = T.map(function() { return 2.44e-8; });
  Plotly.react('plot-wf', [
    { x: T, y: L, mode: 'lines', name: 'L = ' + '\u03ba' + '/(' + '\u03c3' + 'T)',
      line: { color: '#4ade80', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.06)' },
    { x: T, y: Sommerfeld, mode: 'lines', name: 'Sommerfeld 2.44e' + '\u207b' + '\u2078',
      line: { color: '#ffd740', width: 2, dash: 'dash' } }
  ], _condLayout(null, 'T (K)', 'L (W' + '\u03a9' + '/K' + '\u00b2' + ')'), PLOT_CFG);
}

function condUpdatePlots() {
  condPlotDrift();
  condPlotRhoT();
  condPlotIV();
  condPlotMFP();
  condPlotHall();
  condPlotIoffe();
  condPlotWiedemann();
}

function condUpdateReadout() {
  var st = COND_STATE;
  var sigma = st.n * e_charge * e_charge * (st.tau * 1e-15) / m_e_kg;
  var vF = Math.sqrt(2 * 7.0 * e_charge / m_e_kg);
  var mfp = vF * st.tau * 1e-15 * 1e9;
  var mu = e_charge * (st.tau * 1e-15) / m_e_kg;
  var vd_real = (e_charge * st.Efield * 1e9 * st.tau * 1e-15 / m_e_kg) * 1e-3;

  var el = document.getElementById('live-vd');
  if (el) el.textContent = vd_real.toFixed(3) + ' mm/s';
  el = document.getElementById('live-sigma');
  if (el) el.textContent = (sigma / 1e7).toFixed(1) + '\u00d710\u2077 S/m';
  el = document.getElementById('live-mfp');
  if (el) el.textContent = mfp.toFixed(1) + ' nm';
  el = document.getElementById('live-mu');
  if (el) el.textContent = (mu * 1e4).toFixed(1) + ' cm\u00b2/Vs';
  el = document.getElementById('live-tau');
  if (el) el.textContent = st.tau + ' fs';
  el = document.getElementById('live-E');
  if (el) el.textContent = st.Efield.toFixed(3) + ' V/nm';
  el = document.getElementById('live-T');
  if (el) el.textContent = st.T + ' K';
  el = document.getElementById('live-n');
  if (el) el.textContent = st.n.toExponential(1) + ' m' + '\u207b' + '\u00b3';
}

/* ===== Slider wiring ===== */
function condWireSliders() {
  var ids = {
    'slider-Efield': function(v) { COND_STATE.Efield = v; document.getElementById('val-Efield').textContent = v.toFixed(3); },
    'slider-tau': function(v) { COND_STATE.tau = v; document.getElementById('val-tau').textContent = v.toFixed(0); condInitLattice(); condInitElectrons(); },
    'slider-T-cond': function(v) { COND_STATE.T = v; document.getElementById('val-T-cond').textContent = v; },
    'slider-n-cond': function(v) { COND_STATE.n = v; document.getElementById('val-n-cond').textContent = v.toExponential(1); }
  };
  for (var id in ids) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function(e) {
        var v = parseFloat(e.target.value);
        ids[e.target.id](v);
        condUpdatePlots();
        condUpdateReadout();
      });
    }
  }
}

/* ===== Material presets ===== */
var COND_MATERIALS = {
  'Cu': { tau: 30, n: 1e28, label: 'Copper' },
  'Al': { tau: 25, n: 1.8e28, label: 'Aluminum' },
  'Ag': { tau: 40, n: 7.4e28, label: 'Silver' },
  'Si_n': { tau: 100, n: 1e21, label: 'n-type Si' },
  'GaAs': { tau: 80, n: 5e23, label: 'GaAs' }
};

function condSetMaterial(name) {
  var mat = COND_MATERIALS[name];
  if (!mat) return;
  COND_STATE.material = name;
  COND_STATE.tau = mat.tau;
  COND_STATE.n = mat.n;

  var sTau = document.getElementById('slider-tau');
  if (sTau) { sTau.value = mat.tau; document.getElementById('val-tau').textContent = mat.tau; }
  var sN = document.getElementById('slider-n-cond');
  if (sN) { sN.value = mat.n; document.getElementById('val-n-cond').textContent = mat.n.toExponential(1); }

  condInitLattice();
  condInitElectrons();
  condUpdatePlots();
  condUpdateReadout();
}

/* ===== Toggles ===== */
function condTogglePhonons() { COND_STATE.showPhonons = !COND_STATE.showPhonons; }
function condToggleImpurities() { COND_STATE.showImpurities = !COND_STATE.showImpurities; }
function condToggleMFP() { COND_STATE.showMFP = !COND_STATE.showMFP; }

/* ===== INIT ===== */
function initConductivity() {
  if (!condInitCanvas()) return;
  condInitLattice();
  condInitElectrons();
  condStartAnimation();
  condWireSliders();

  setTimeout(function() {
    condUpdatePlots();
    condUpdateReadout();
  }, 400);
}

window.initConductivity = initConductivity;
window.condSetMaterial = condSetMaterial;
window.condTogglePhonons = condTogglePhonons;
window.condToggleImpurities = condToggleImpurities;
window.condToggleMFP = condToggleMFP;
window.condPauseAnimation = condPauseAnimation;
window.condResumeAnimation = condResumeAnimation;

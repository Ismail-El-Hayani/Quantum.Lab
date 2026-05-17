/**
 * Electrical Conductivity — Physics Engine (v3 Canvas)
 * Drude electron drift visualization + supporting Plotly readouts.
 * Units: energy in eV, time in fs, length in nm.
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

/* ===== Canvas Engine: Drude Electron Drift ===== */
var COND_CANVAS = {
  c: null, ctx: null,
  running: false, raf: null,
  width: 0, height: 0,
  frame: 0,
  dt: 0.5,          // fs per frame
  electrons: [],
  ions: [],
  impurities: [],
  phonons: [],
  mfpTracks: [],     // distance since last collision per electron
  lastCollTime: [],  // frames since last collision
  totalDrift: 0,     // accumulated x displacement for drift calc
  driftSamples: 0,
  avgMFP: 0,
  collisionCount: 0
};

/* --- Lattice geometry --- */
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
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  /* Impurities: density inversely linked to cleanliness (tau proxy) */
  geo.impurities = [];
  var impCount = Math.max(2, Math.floor(25 - COND_STATE.tau / 4));
  for (var i = 0; i < impCount; i++) {
    geo.impurities.push({
      x: 30 + Math.random() * (w - 60),
      y: 40 + Math.random() * (h - 80)
    });
  }

  /* Phonon wave segments between neighbors */
  geo.phonons = [];
  for (var i = 0; i < geo.ions.length; i++) {
    var ion = geo.ions[i];
    var c = i % cols, r = Math.floor(i / cols);
    if (c < cols - 1) {
      var right = geo.ions[i + 1];
      geo.phonons.push({ a: ion, b: right, phase: Math.random() * Math.PI * 2, type: 'horiz' });
    }
    if (r < rows - 1) {
      var below = geo.ions[i + cols];
      geo.phonons.push({ a: ion, b: below, phase: Math.random() * Math.PI * 2, type: 'vert' });
    }
  }
}

/* --- Electron pool --- */
function condInitElectrons() {
  var geo = COND_CANVAS;
  var w = geo.width, h = geo.height;
  var count = 80;
  var v_th = 2.0;  // nm/fs thermal speed (representative Fermi-like)

  geo.electrons = [];
  geo.mfpTracks = [];
  geo.lastCollTime = [];
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    geo.electrons.push({
      x: 20 + Math.random() * (w - 40),
      y: 30 + Math.random() * (h - 60),
      vx: v_th * Math.cos(angle),
      vy: v_th * Math.sin(angle),
      flash: 0
    });
    geo.mfpTracks.push(0);
    geo.lastCollTime.push(Math.floor(Math.random() * COND_STATE.tau));
  }
  geo.totalDrift = 0;
  geo.driftSamples = 0;
  geo.collisionCount = 0;
  geo.avgMFP = 0;
}

/* --- Canvas init / resize --- */
function condInitCanvas() {
  var c = document.getElementById('cond-canvas');
  if (!c) { console.warn('[COND] canvas not found'); return false; }
  COND_CANVAS.c = c;
  COND_CANVAS.ctx = c.getContext('2d');
  condResizeCanvas();
  window.addEventListener('resize', condResizeCanvas);
  return true;
}

function condResizeCanvas() {
  var wrap = document.querySelector('.cond-canvas-wrap');
  if (!wrap || !COND_CANVAS.c) return;
  var w = wrap.clientWidth;
  var h = 420;
  COND_CANVAS.c.width = w;
  COND_CANVAS.c.height = h;
  COND_CANVAS.width = w;
  COND_CANVAS.height = h;
  condInitLattice();
  condInitElectrons();
}

/* --- Physics step --- */
function condPhysicsStep() {
  var geo = COND_CANVAS;
  var st = COND_STATE;
  var dt = geo.dt;
  var a = (e_charge * st.Efield * 1e9 / m_e_kg) * 1e-15 * dt;  // nm/fs^2 * dt -> delta-vx in nm/fs
  var tau_frames = Math.max(2, st.tau / dt);
  var v_th = 2.0 + (st.T / 300) * 0.3;  // slightly faster at higher T
  var w = geo.width, h = geo.height;

  var sumVx = 0;
  var activeMFP = 0, mfpCount = 0;

  for (var i = 0; i < geo.electrons.length; i++) {
    var e = geo.electrons[i];

    /* Apply E-field acceleration */
    e.vx += a;

    /* Position update */
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    /* Boundary wrap (periodic) */
    if (e.x < 0) e.x += w;
    if (e.x > w) e.x -= w;
    if (e.y < 0) e.y += h;
    if (e.y > h) e.y -= h;

    /* Scattering event? */
    geo.lastCollTime[i] += dt;
    var scatterProb = dt / tau_frames;
    if (Math.random() < scatterProb) {
      /* Collision! Randomize thermal velocity */
      var ang = Math.random() * Math.PI * 2;
      e.vx = v_th * Math.cos(ang);
      e.vy = v_th * Math.sin(ang);
      e.flash = 8;  // frames to flash

      /* Record MFP */
      if (geo.mfpTracks[i] > 0) {
        activeMFP += geo.mfpTracks[i];
        mfpCount++;
      }
      geo.mfpTracks[i] = 0;
      geo.lastCollTime[i] = 0;
      geo.collisionCount++;
    } else {
      geo.mfpTracks[i] += Math.sqrt(e.vx * e.vx + e.vy * e.vy) * dt;
    }

    sumVx += e.vx;
    if (e.flash > 0) e.flash--;
  }

  geo.totalDrift += sumVx * dt;
  geo.driftSamples++;
  if (mfpCount > 0) geo.avgMFP = activeMFP / mfpCount;
}

/* --- Draw frame --- */
function condDrawFrame() {
  var geo = COND_CANVAS;
  var ctx = geo.ctx;
  var w = geo.width, h = geo.height;
  var st = COND_STATE;
  var t = geo.frame * 0.02;

  /* Background */
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, w, h);

  /* Phonon amplitude scales with T */
  var phononAmp = (st.T / 300) * 2.5;
  if (st.showPhonons && phononAmp > 0.3) {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (var i = 0; i < geo.phonons.length; i++) {
      var ph = geo.phonons[i];
      var ax = ph.a.x, ay = ph.a.y;
      var bx = ph.b.x, by = ph.b.y;
      var segs = 8;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      for (var s = 1; s <= segs; s++) {
        var frac = s / segs;
        var px = ax + (bx - ax) * frac;
        var py = ay + (by - ay) * frac;
        var off = phononAmp * Math.sin(frac * Math.PI * 4 + t + ph.phase);
        if (ph.type === 'horiz') py += off;
        else px += off;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  /* Lattice ions */
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (var i = 0; i < geo.ions.length; i++) {
    var ion = geo.ions[i];
    var jiggle = (st.T / 300) * 1.2;
    var jx = ion.baseX + jiggle * Math.sin(t + ion.phase);
    var jy = ion.baseY + jiggle * Math.cos(t + ion.phase * 0.7);
    ion.x = jx; ion.y = jy;
    ctx.beginPath();
    ctx.arc(jx, jy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /* Impurities */
  if (st.showImpurities) {
    ctx.fillStyle = 'rgba(255,68,68,0.55)';
    for (var i = 0; i < geo.impurities.length; i++) {
      var imp = geo.impurities[i];
      ctx.beginPath();
      ctx.arc(imp.x, imp.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* Electrons */
  for (var i = 0; i < geo.electrons.length; i++) {
    var e = geo.electrons[i];
    if (e.flash > 0) {
      ctx.fillStyle = 'rgba(255,215,64,' + (e.flash / 8) + ')';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd740';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(e.x, e.y, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  /* E-field arrow */
  if (st.Efield > 0.001) {
    var arrowLen = 40 + st.Efield * 400;
    var ax = w - 50, ay = 30;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - arrowLen, ay);
    ctx.stroke();
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - 8, ay - 4);
    ctx.lineTo(ax - 8, ay + 4);
    ctx.fill();
    ctx.fillStyle = '#c084fc';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('E = ' + st.Efield.toFixed(3) + ' V/nm', ax, ay - 8);
  }

  /* Drift velocity vector (ensemble average) */
  var avgVx = 0;
  for (var i = 0; i < geo.electrons.length; i++) avgVx += geo.electrons[i].vx;
  avgVx /= geo.electrons.length;
  var driftPx = avgVx * 10;
  if (Math.abs(driftPx) > 1) {
    var dx = w / 2, dy = h - 18;
    ctx.strokeStyle = '#ffd740';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx + driftPx * 3, dy);
    ctx.stroke();
    ctx.fillStyle = '#ffd740';
    ctx.beginPath();
    ctx.moveTo(dx + driftPx * 3, dy);
    ctx.lineTo(dx + driftPx * 3 - (driftPx > 0 ? 6 : -6), dy - 3);
    ctx.lineTo(dx + driftPx * 3 - (driftPx > 0 ? 6 : -6), dy + 3);
    ctx.fill();
    ctx.fillStyle = '#ffd740';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('v_d', dx + driftPx * 1.5, dy - 6);
  }

  /* MFP overlay lines */
  if (st.showMFP) {
    ctx.strokeStyle = 'rgba(74,222,128,0.25)';
    ctx.lineWidth = 1;
    for (var i = 0; i < Math.min(geo.electrons.length, 15); i++) {
      var e = geo.electrons[i];
      var mfp = geo.mfpTracks[i];
      if (mfp > 2) {
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x - e.vx * mfp / 3, e.y - e.vy * mfp / 3);
        ctx.stroke();
      }
    }
  }

  /* Legend overlay */
  var lx = 12, ly = 12, lh = 18;
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  var items = [
    { c: '#00f0ff', t: 'Electron' },
    { c: 'rgba(255,255,255,0.5)', t: 'Lattice ion' },
    { c: 'rgba(255,68,68,0.7)', t: 'Impurity' },
    { c: '#ffd740', t: 'Scattering flash' },
    { c: '#c084fc', t: 'E-field' }
  ];
  for (var i = 0; i < items.length; i++) {
    ctx.fillStyle = items[i].c;
    ctx.fillRect(lx, ly + i * lh, 10, 10);
    ctx.fillStyle = '#a0a0c0';
    ctx.fillText(items[i].t, lx + 16, ly + i * lh + 9);
  }

  /* Live readout bar */
  var avgVd = geo.driftSamples > 0 ? (geo.totalDrift / geo.driftSamples) : 0;
  var sigma = st.n * e_charge * e_charge * (st.tau * 1e-15) / m_e_kg;
  var vF = Math.sqrt(2 * 7.0 * e_charge / m_e_kg);
  var mfp = vF * st.tau * 1e-15 * 1e9;
  var mu = e_charge * (st.tau * 1e-15) / m_e_kg;

  ctx.fillStyle = 'rgba(10,10,20,0.85)';
  ctx.fillRect(w - 230, h - 58, 220, 54);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(w - 230, h - 58, 220, 54);
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#a0a0c0';
  ctx.fillText('v_d = ' + (avgVd * 1e-3).toFixed(3) + ' mm/s', w - 224, h - 44);
  ctx.fillText('sigma = ' + (sigma / 1e7).toFixed(1) + 'e7 S/m', w - 224, h - 32);
  ctx.fillText('MFP = ' + mfp.toFixed(1) + ' nm  mu = ' + (mu * 1e4).toFixed(1) + ' cm2/Vs', w - 224, h - 20);

  geo.frame++;
}

/* --- Animation loop --- */
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
  if (COND_CANVAS.raf) cancelAnimationFrame(COND_CANVAS.raf);
  COND_CANVAS.raf = null;
}

function condResumeAnimation() {
  COND_STATE.paused = false;
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
    return a * tau * 1e-3;  // mm/s
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

/* ===== Update all plots ===== */
function condUpdatePlots() {
  condPlotDrift();
  condPlotRhoT();
  condPlotIV();
  condPlotMFP();
  condPlotHall();
  condPlotIoffe();
  condPlotWiedemann();
}

/* ===== Live readout update ===== */
function condUpdateReadout() {
  var st = COND_STATE;
  var geo = COND_CANVAS;
  var avgVd = geo.driftSamples > 0 ? (geo.totalDrift / geo.driftSamples) : 0;
  var sigma = st.n * e_charge * e_charge * (st.tau * 1e-15) / m_e_kg;
  var vF = Math.sqrt(2 * 7.0 * e_charge / m_e_kg);
  var mfp = vF * st.tau * 1e-15 * 1e9;
  var mu = e_charge * (st.tau * 1e-15) / m_e_kg;

  var el = document.getElementById('live-vd');
  if (el) el.textContent = (avgVd * 1e-3).toFixed(3) + ' mm/s';
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

/* ===== Toggle overlays ===== */
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

  /* Delay Plotly init until DOM ready */
  setTimeout(function() {
    condUpdatePlots();
    condUpdateReadout();
  }, 300);
}

window.initConductivity = initConductivity;
window.condSetMaterial = condSetMaterial;
window.condTogglePhonons = condTogglePhonons;
window.condToggleImpurities = condToggleImpurities;
window.condToggleMFP = condToggleMFP;
window.condPauseAnimation = condPauseAnimation;
window.condResumeAnimation = condResumeAnimation;

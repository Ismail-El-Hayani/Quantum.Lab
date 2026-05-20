
/* ═══════════════════════════════════════════════════════════════
   tf_sim.js  —  Thin Film Interference Engine (Module 16)
   Physics: Fresnel coefficients + Airy multiple-reflection formula
   ═══════════════════════════════════════════════════════════════ */

var TF = { state: {}, pulse: null, canvas: null, ctx: null, animId: null, lastTime: 0 };

/* ── State defaults ── */
TF.state = {
  n1: 1.00, n2: 1.46, n3: 3.50,
  d: 195,           /* film thickness in nm */
  theta1: 30,       /* incident angle in degrees */
  lam: 620,         /* wavelength in nm */
  animating: false
};

/* ═══════════════════════ Physics Core ═══════════════════════ */

/**
 * Snell's law: n_1 sin theta_1 = n_2 sin theta_2 = n_3 sin theta_3
 *   => theta_2 = arcsin( (n_1/n_2) sin theta_1 )
 *   => theta_3 = arcsin( (n_1/n_3) sin theta_1 )
 */
function tfSnell(n1, th1deg, n2) {
  var th1 = th1deg * Math.PI / 180;
  var sin2 = (n1 / n2) * Math.sin(th1);
  if (sin2 > 1)  return { rad: Math.PI / 2, deg: 90, tir: true };
  if (sin2 < -1) return { rad: -Math.PI / 2, deg: -90, tir: true };
  var rad = Math.asin(sin2);
  return { rad: rad, deg: rad * 180 / Math.PI, tir: false };
}

/**
 * Fresnel s-polarisation (TE, perpendicular) coefficients at a single interface:
 *   t_ij = 2 n_i cos theta_i / (n_i cos theta_i + n_j cos theta_j)
 *   r_ij = (n_i cos theta_i - n_j cos theta_j) / (n_i cos theta_i + n_j cos theta_j)
 */
function tfFresnel(ni, tiRad, nj, tjRad) {
  var ci = Math.cos(tiRad), cj = Math.cos(tjRad);
  var den = ni * ci + nj * cj;
  if (Math.abs(den) < 1e-12) den = 1e-12;
  var t = (2 * ni * ci) / den;
  var r = (ni * ci - nj * cj) / den;
  return { t: t, r: r };
}

/**
 * Round-trip phase inside the film:
 *   beta = (2*pi/lambda) * n_2 * d * cos theta_2
 *   lambda and d must share the same unit (nm).
 */
function tfBeta(n2, d, th2Rad, lam) {
  return (2 * Math.PI / lam) * n2 * d * Math.cos(th2Rad);
}

/**
 * Airy total reflection / transmission coefficients (complex):
 *   r = (r_12 + r_23 e^{2i beta}) / (1 + r_12 r_23 e^{2i beta})
 *   t = (t_12 t_23 e^{i beta})   / (1 + r_12 r_23 e^{2i beta})
 *   R = |r|^2
 *   T = (n_3 cos theta_3)/(n_1 cos theta_1) * |t|^2
 */
function tfAiry(fc, beta) {
  var c2b = Math.cos(2 * beta), s2b = Math.sin(2 * beta);
  var cb  = Math.cos(beta),    sb  = Math.sin(beta);

  /* denominator: 1 + r12*r23*e^{2i beta} */
  var d_re = 1 + fc.r12 * fc.r23 * c2b;
  var d_im =     fc.r12 * fc.r23 * s2b;
  var d2 = d_re * d_re + d_im * d_im;
  if (d2 < 1e-24) d2 = 1e-24;

  /* numerator of r */
  var nr_re = fc.r12 + fc.r23 * c2b;
  var nr_im =            fc.r23 * s2b;
  var r_re = (nr_re * d_re + nr_im * d_im) / d2;
  var r_im = (nr_im * d_re - nr_re * d_im) / d2;
  var R = r_re * r_re + r_im * r_im;

  /* numerator of t */
  var nt_re = fc.t12 * fc.t23 * cb;
  var nt_im = fc.t12 * fc.t23 * sb;
  var t_re = (nt_re * d_re + nt_im * d_im) / d2;
  var t_im = (nt_im * d_re - nt_re * d_im) / d2;
  var t2 = t_re * t_re + t_im * t_im;

  var n1c1 = TF.state.n1 * Math.cos(fc.th1);
  var n3c3 = TF.state.n3 * Math.cos(fc.th3);
  var T = (n3c3 / n1c1) * t2;

  return { r_re: r_re, r_im: r_im, t_re: t_re, t_im: t_im, R: R, T: T };
}

/* ═══════════════════════ Computed Readouts ═══════════════════════ */

function tfComputeAll() {
  var st = TF.state;
  var s2 = tfSnell(st.n1, st.theta1, st.n2);
  var s3 = tfSnell(st.n1, st.theta1, st.n3);

  var fc = {};
  fc.th1 = st.theta1 * Math.PI / 180;
  fc.th2 = s2.rad;
  fc.th3 = s3.rad;
  fc.tir = s2.tir || s3.tir;

  var f12 = tfFresnel(st.n1, fc.th1, st.n2, fc.th2);
  var f23 = tfFresnel(st.n2, fc.th2, st.n3, fc.th3);
  fc.r12 = f12.r; fc.t12 = f12.t;
  fc.r23 = f23.r; fc.t23 = f23.t;

  var beta = tfBeta(st.n2, st.d, fc.th2, st.lam);
  var airy = tfAiry(fc, beta);

  return {
    th2: s2.deg, th3: s3.deg,
    r12: f12.r, r23: f23.r,
    beta: beta,
    R: airy.R, T: airy.T,
    tir: fc.tir
  };
}

/* ═══════════════════════ Canvas Engine ═══════════════════════ */

function tfResizeCanvas() {
  var c = TF.canvas;
  if (!c) return;
  var wrap = c.parentElement;
  var w = Math.max(360, Math.min(wrap.clientWidth || 720, 820));
  var h = 320;
  c.width = w; c.height = h;
}

function tfInitCanvas() {
  TF.canvas = document.getElementById('tf-canvas');
  if (!TF.canvas) return;
  TF.ctx = TF.canvas.getContext('2d');
  tfResizeCanvas();
  window.addEventListener('resize', tfResizeCanvas);
}

/**
 * Three-layer ray diagram with finite-pulse sinusoidal E-field waves.
 * Layers: n1 (top, pale), n2 (film, green tint), n3 (substrate, dark).
 */
function tfDrawFrame(now) {
  var c = TF.ctx, cv = TF.canvas;
  if (!c || !cv) return;
  var w = cv.width, h = cv.height;
  var st = TF.state;

  c.clearRect(0, 0, w, h);

  /* ── Layer geometry ── */
  var filmTop = h * 0.25;
  var filmBot = h * 0.75;
  var ix = w * 0.22;          /* incident x at top interface */
  var L = w * 0.55;           /* max ray length in px */

  /* ── Background fills ── */
  c.fillStyle = '#0b0f1e'; c.fillRect(0, 0, w, filmTop);           /* n1 */
  c.fillStyle = '#0a1e14'; c.fillRect(0, filmTop, w, filmBot - filmTop); /* n2 */
  c.fillStyle = '#080c18'; c.fillRect(0, filmBot, w, h - filmBot);     /* n3 */

  /* ── Interface lines ── */
  c.strokeStyle = 'rgba(255,255,255,0.25)';
  c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(0, filmTop); c.lineTo(w, filmTop); c.stroke();
  c.beginPath(); c.moveTo(0, filmBot); c.lineTo(w, filmBot); c.stroke();

  /* ── Normal lines at hit points ── */
  c.strokeStyle = 'rgba(255,255,255,0.15)';
  c.setLineDash([4, 4]);
  c.beginPath(); c.moveTo(ix, 0); c.lineTo(ix, h); c.stroke();
  c.setLineDash([]);

  /* ── Physics angles ── */
  var th1r = st.theta1 * Math.PI / 180;
  var s2 = tfSnell(st.n1, st.theta1, st.n2);
  var s3 = tfSnell(st.n1, st.theta1, st.n3);
  var th2r = s2.rad, th3r = s3.rad;

  /* ── True geometric exit from film ── */
  var tan2 = Math.abs(Math.tan(th2r)) < 1e-6 ? 1e-6 : Math.tan(th2r);
  var exitX = ix + (filmBot - filmTop) / tan2;
  if (exitX > w - 10) exitX = w - 10;
  if (exitX < ix) exitX = ix;

  /* ── Draw normal tick at exit point ── */
  c.strokeStyle = 'rgba(255,255,255,0.15)';
  c.setLineDash([4, 4]);
  c.beginPath(); c.moveTo(exitX, filmTop); c.lineTo(exitX, h); c.stroke();
  c.setLineDash([]);

  /* ── Angle arcs ── */
  var arcR = 28;
  c.lineWidth = 1.5;
  /* theta_1 at (ix, filmTop) between upward normal and incident ray */
  c.strokeStyle = 'rgba(255,221,68,0.35)';
  c.beginPath(); c.arc(ix, filmTop, arcR, -Math.PI/2 - th1r, -Math.PI/2); c.stroke();
  /* theta_2 at (ix, filmTop) between downward normal and film ray */
  c.strokeStyle = 'rgba(74,222,128,0.35)';
  c.beginPath(); c.arc(ix, filmTop, arcR - 5, Math.PI/2, Math.PI/2 + th2r); c.stroke();
  /* theta_3 at (exitX, filmBot) between downward normal and substrate ray */
  c.strokeStyle = 'rgba(192,132,252,0.35)';
  c.beginPath(); c.arc(exitX, filmBot, arcR, Math.PI/2, Math.PI/2 + th3r); c.stroke();

  /* ── Wave parameters ── */
  var lam1 = st.lam * 0.15;       /* visual wavelength in px */
  var lam2 = lam1 * (st.n1 / st.n2);
  var lam3 = lam1 * (st.n1 / st.n3);
  var k1 = 2 * Math.PI / lam1;
  var k2 = 2 * Math.PI / lam2;
  var k3 = 2 * Math.PI / lam3;
  var v1 = 55;                    /* px/sec visual speed in n1 */
  var v2 = v1 * (st.n1 / st.n2);
  var v3 = v1 * (st.n1 / st.n3);
  var omega = k1 * v1;

  /* ── Pulse state machine ── */
  if (!TF.pulse) TF.pulse = { phase: 'idle', waves: [], trainLen: 6 };
  var pulse = TF.pulse;
  if (pulse.phase === 'idle') {
    pulse.phase = 'entering';
    pulse.waves = [];
    for (var i = 0; i < pulse.trainLen; i++) {
      pulse.waves.push({ type: 'inc', s: -40 - i * lam1, active: true, hasSplit: false });
    }
  }

  var dt = 0.016;
  if (TF.lastTime > 0) dt = Math.min(0.05, (now - TF.lastTime) / 1000);
  TF.lastTime = now;

  var anyActive = false;
  for (var wi = 0; wi < pulse.waves.length; wi++) {
    var wv = pulse.waves[wi];
    if (!wv.active) continue;
    anyActive = true;
    if (wv.type === 'inc') {
      wv.s += v1 * dt;
      var rayLen = Math.sqrt((ix - (ix - L * Math.sin(th1r))) * (ix - (ix - L * Math.sin(th1r))) +
                             (filmTop - (filmTop - L * Math.cos(th1r))) * (filmTop - (filmTop - L * Math.cos(th1r))));
      if (wv.s >= rayLen && !wv.hasSplit) {
        wv.hasSplit = true;
        pulse.waves.push({ type: 'ref', s: 0, active: true });
        pulse.waves.push({ type: 'film', s: 0, active: true });
      }
      if (wv.s > rayLen + lam1 * 1.5) wv.active = false;
    } else if (wv.type === 'ref') {
      wv.s += v1 * dt;
      if (wv.s > L + lam1) wv.active = false;
    } else if (wv.type === 'film') {
      wv.s += v2 * dt;
      var filmRayLen = Math.sqrt((exitX - ix) * (exitX - ix) + (filmBot - filmTop) * (filmBot - filmTop));
      if (wv.s >= filmRayLen && !wv.hasSplit) {
        wv.hasSplit = true;
        pulse.waves.push({ type: 'sub', s: 0, active: true, phaseAcc: k2 * filmRayLen });
      }
      if (wv.s > filmRayLen + lam2 * 1.5) wv.active = false;
    } else if (wv.type === 'sub') {
      wv.s += v3 * dt;
      if (wv.s > L + lam3) wv.active = false;
    }
  }
  if (!anyActive) { TF.state.animating = false; }

  /* ── Draw each wavefront ── */
  for (var wi = 0; wi < pulse.waves.length; wi++) {
    var wv = pulse.waves[wi];
    if (!wv.active) continue;
    var sx, sy, ex, ey, ang, k, v, col, alpha, phase0;

    if (wv.type === 'inc') {
      sx = ix - L * Math.sin(th1r); sy = filmTop - L * Math.cos(th1r);
      ex = ix; ey = filmTop; ang = th1r; k = k1; col = '#ffdd44'; alpha = 0.85; phase0 = 0;
    } else if (wv.type === 'ref') {
      sx = ix; sy = filmTop;
      ex = ix + L * Math.sin(th1r); ey = filmTop - L * Math.cos(th1r);
      ang = -th1r; k = k1; col = '#00f0ff'; alpha = 0.80; phase0 = 0;
    } else if (wv.type === 'film') {
      sx = ix; sy = filmTop;
      ex = exitX; ey = filmBot; ang = th2r; k = k2; col = '#4ade80'; alpha = 0.80; phase0 = 0;
    } else if (wv.type === 'sub') {
      sx = exitX; sy = filmBot;
      ex = exitX + L * Math.sin(th3r); ey = filmBot + L * Math.cos(th3r);
      ang = th3r; k = k3; col = '#c084fc'; alpha = 0.80;
      phase0 = (wv.phaseAcc || 0);
    }

    var dx = ex - sx, dy = ey - sy;
    var segLen = Math.sqrt(dx * dx + dy * dy);
    var nx = dx / segLen, ny = dy / segLen;
    var px = -ny, py = nx;
    var t = now / 1000;

    /* E-field sinusoid */
    c.strokeStyle = col; c.globalAlpha = alpha; c.lineWidth = 2;
    c.beginPath();
    var step = 3;
    for (var dist = 0; dist <= Math.min(wv.s, segLen); dist += step) {
      var phase = k * dist - omega * t + phase0;
      var amp = 10 * Math.sin(phase);
      var x = sx + nx * dist + px * amp;
      var y = sy + ny * dist + py * amp;
      if (dist === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
    c.globalAlpha = 1.0;

    /* Ray centerline (propagation axis, cuts wave in half) */
    c.strokeStyle = col; c.globalAlpha = 0.55; c.lineWidth = 1;
    c.setLineDash([3, 3]);
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
    c.setLineDash([]); c.globalAlpha = 1.0;
  }

  /* ── Film thickness label ── */
  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.font = '11px ' + (getComputedStyle(document.body).fontFamily || 'monospace');
  var lblX = w - 70;
  c.fillText('d = ' + st.d + ' nm', lblX, (filmTop + filmBot) / 2);
  c.strokeStyle = 'rgba(255,255,255,0.35)';
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(lblX - 8, filmTop + 4); c.lineTo(lblX - 2, filmTop + 4); c.stroke();
  c.beginPath(); c.moveTo(lblX - 8, filmBot - 4); c.lineTo(lblX - 2, filmBot - 4); c.stroke();
  c.beginPath(); c.moveTo(lblX - 5, filmTop + 4); c.lineTo(lblX - 5, filmBot - 4); c.stroke();

  /* ── Canvas legend (bottom-left, safe zone) ── */
  var lx = 10, ly = h - 88, lw = 146, lh = 72;
  c.fillStyle = 'rgba(6,8,16,0.78)';
  c.fillRect(lx, ly, lw, lh);
  c.strokeStyle = 'rgba(255,255,255,0.12)';
  c.lineWidth = 1;
  c.strokeRect(lx, ly, lw, lh);
  var rows = [
    { col: '#ffdd44', txt: 'Incident n1' },
    { col: '#00f0ff', txt: 'Reflected n1' },
    { col: '#4ade80', txt: 'Film n2' },
    { col: '#c084fc', txt: 'Substrate n3' }
  ];
  for (var ri = 0; ri < rows.length; ri++) {
    var ry = ly + 14 + ri * 16;
    c.fillStyle = rows[ri].col; c.beginPath(); c.arc(lx + 10, ry, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.65)';
    c.fillText(rows[ri].txt, lx + 20, ry + 3);
  }

  /* ── Live overlay top-right ── */
  var comp = tfComputeAll();
  c.textAlign = 'right';
  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.fillText('\u211b = ' + (comp.R * 100).toFixed(1) + '%', w - 12, 22);
  c.fillText('\u8476; = ' + (comp.T * 100).toFixed(1) + '%', w - 12, 38);
  c.fillText('\u03b2 = ' + comp.beta.toFixed(2) + ' rad', w - 12, 54);
  c.textAlign = 'left';

  if (TF.state.animating) {
    TF.animId = requestAnimationFrame(tfDrawFrame);
  }
}

function tfStartAnim() {
  if (!TF.state.animating) {
    TF.state.animating = true;
    TF.lastTime = 0;
    TF.animId = requestAnimationFrame(tfDrawFrame);
  }
}
function tfStopAnim() {
  TF.state.animating = false;
  if (TF.animId) { cancelAnimationFrame(TF.animId); TF.animId = null; }
}
function tfResetPulse() {
  if (TF.pulse) TF.pulse.phase = 'idle';
  tfStartAnim();
}

/* ═══════════════════════ Plotly Spectral Plots ═══════════════════════ */

function tfInitPlots() {
  if (typeof Plotly === 'undefined') return;
  var dark = { paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' };

  /* R(lambda) + T(lambda) */
  Plotly.newPlot('plot-RT', [
    { x: [], y: [], mode: 'lines', name: '\u211b', line: { color: '#00f0ff', width: 2 } },
    { x: [], y: [], mode: 'lines', name: '\u8476;', line: { color: '#4ade80', width: 2 } },
    { x: [], y: [], mode: 'lines', name: 'cursor', line: { color: '#ff4ecd', width: 1, dash: 'dash' } }
  ], Object.assign({}, dark, {
    xaxis: { title: '\u03bb (nm)', color: '#8899aa', gridcolor: 'rgba(255,255,255,0.06)' },
    yaxis: { title: 'Intensity', range: [0, 1.05], color: '#8899aa', gridcolor: 'rgba(255,255,255,0.06)' },
    margin: { t: 20, b: 40, l: 50, r: 20 }, showlegend: true,
    legend: { font: { color: '#8899aa' }, x: 0.02, y: 0.98 }
  }), { responsive: true, displayModeBar: false });

  /* Standing wave |E(z)|^2 inside film */
  Plotly.newPlot('plot-standing', [
    { x: [], y: [], mode: 'lines', fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.18)',
      line: { color: '#4ade80', width: 2 }, name: '|E(z)|\u00b2' }
  ], Object.assign({}, dark, {
    xaxis: { title: 'z inside film (nm)', color: '#8899aa', gridcolor: 'rgba(255,255,255,0.06)' },
    yaxis: { title: '|E|', color: '#8899aa', gridcolor: 'rgba(255,255,255,0.06)' },
    margin: { t: 20, b: 40, l: 50, r: 20 }, showlegend: false
  }), { responsive: true, displayModeBar: false });
}

/**
 * Build R(\u03bb) and T(\u03bb) curves over 300-1200 nm.
 */
function tfRefreshSpectral() {
  if (typeof Plotly === 'undefined') return;
  var st = TF.state;
  var xs = [], rys = [], tys = [];
  for (var lam = 300; lam <= 1200; lam += 5) {
    xs.push(lam);
    var s2 = tfSnell(st.n1, st.theta1, st.n2);
    var s3 = tfSnell(st.n1, st.theta1, st.n3);
    var th1 = st.theta1 * Math.PI / 180;
    var f12 = tfFresnel(st.n1, th1, st.n2, s2.rad);
    var f23 = tfFresnel(st.n2, s2.rad, st.n3, s3.rad);
    var beta = tfBeta(st.n2, st.d, s2.rad, lam);
    var a = tfAiry({ r12: f12.r, r23: f23.r, t12: f12.t, t23: f23.t, th1: th1, th3: s3.rad }, beta);
    rys.push(a.R);
    tys.push(a.T);
  }

  Plotly.react('plot-RT', [
    { x: xs, y: rys, mode: 'lines', name: '\u211b', line: { color: '#00f0ff', width: 2 } },
    { x: xs, y: tys, mode: 'lines', name: '\u8476;', line: { color: '#4ade80', width: 2 } },
    { x: [st.lam, st.lam], y: [0, 1.05], mode: 'lines', name: 'cursor',
      line: { color: '#ff4ecd', width: 1, dash: 'dash' } }
  ], Plotly.Plots.getGraphDiv('plot-RT').layout, { displayModeBar: false });
}

/**
 * Standing wave |E(z)|\u00b2 inside the film = |E_+ e^{ikz} + E_- e^{-ikz}|\u00b2.
 */
function tfRefreshStanding() {
  if (typeof Plotly === 'undefined') return;
  var st = TF.state;
  var s2 = tfSnell(st.n1, st.theta1, st.n2);
  var s3 = tfSnell(st.n1, st.theta1, st.n3);
  var th1 = st.theta1 * Math.PI / 180;
  var f12 = tfFresnel(st.n1, th1, st.n2, s2.rad);
  var f23 = tfFresnel(st.n2, s2.rad, st.n3, s3.rad);
  var beta = tfBeta(st.n2, st.d, s2.rad, st.lam);
  var a = tfAiry({ r12: f12.r, r23: f23.r, t12: f12.t, t23: f23.t, th1: th1, th3: s3.rad }, beta);

  /* Forward amplitude inside film (from t12) ≈ t12 * e^{i beta*z/d} */
  /* Backward amplitude ≈ r23 * t12 * e^{i beta*(2 - z/d)} */
  var kz = (2 * Math.PI / st.lam) * st.n2 * Math.cos(s2.rad);
  var N = 120;
  var zs = [], es = [];
  for (var i = 0; i <= N; i++) {
    var z = (i / N) * st.d;
    var phi = kz * z;
    var Ep = f12.t * Math.cos(phi);
    var Em = f12.t * f23.r * Math.cos(2 * beta - phi);
    var e2 = (Ep + Em) * (Ep + Em);
    zs.push(z);
    es.push(Math.min(e2, 5.0));
  }

  Plotly.react('plot-standing', [
    { x: zs, y: es, mode: 'lines', fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.18)',
      line: { color: '#4ade80', width: 2 } }
  ], Plotly.Plots.getGraphDiv('plot-standing').layout, { displayModeBar: false });
}

/* ═══════════════════════ Live Readout DOM ═══════════════════════ */

function tfUpdateReadout() {
  var comp = tfComputeAll();
  var st = TF.state;
  var set = function(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };

  set('live-n1',   st.n1.toFixed(2));
  set('live-n2',   st.n2.toFixed(2));
  set('live-n3',   st.n3.toFixed(2));
  set('live-d',    st.d);
  set('live-lam',  st.lam);
  set('live-th1',  st.theta1 + '\u00b0');
  set('live-th2',  comp.th2.toFixed(1) + '\u00b0');
  set('live-th3',  comp.th3.toFixed(1) + '\u00b0');
  set('live-r12',  comp.r12.toFixed(3));
  set('live-r23',  comp.r23.toFixed(3));
  set('live-beta-t', comp.beta.toFixed(2));
  set('live-R-t',    (comp.R * 100).toFixed(1));
  set('live-T-t',    (comp.T * 100).toFixed(1));

  set('live-R',    '\u211b = ' + (comp.R * 100).toFixed(1) + '%');
  set('live-T',    '\u8476; = ' + (comp.T * 100).toFixed(1) + '%');
  set('live-beta', '\u03b2 = ' + comp.beta.toFixed(2));
  set('live-theta2', '\u03b8\u2082 = ' + comp.th2.toFixed(1) + '\u00b0');
  set('live-theta3', '\u03b8\u2083 = ' + comp.th3.toFixed(1) + '\u00b0');

  if (typeof MathJax !== 'undefined') {
    var hero = document.getElementById('eq-hero-text');
    if (hero) MathJax.typesetPromise([hero]).catch(function(){});
  }
}

/* ═══════════════════════ Slider Handlers ═══════════════════════ */

function tfSliderN1(v) { TF.state.n1 = parseFloat(v); document.getElementById('val-n1').textContent = v; tfResetPulse(); tfRefreshSpectral(); tfRefreshStanding(); tfUpdateReadout(); }
function tfSliderN2(v) { TF.state.n2 = parseFloat(v); document.getElementById('val-n2').textContent = v; tfResetPulse(); tfRefreshSpectral(); tfRefreshStanding(); tfUpdateReadout(); }
function tfSliderN3(v) { TF.state.n3 = parseFloat(v); document.getElementById('val-n3').textContent = v; tfResetPulse(); tfRefreshSpectral(); tfRefreshStanding(); tfUpdateReadout(); }
function tfSliderD(v)  { TF.state.d  = parseFloat(v); document.getElementById('val-d').textContent = v + ' nm'; tfResetPulse(); tfRefreshSpectral(); tfRefreshStanding(); tfUpdateReadout(); }
function tfSliderTheta1(v) { TF.state.theta1 = parseFloat(v); document.getElementById('val-theta1').textContent = v + '\u00b0'; tfResetPulse(); tfRefreshSpectral(); tfRefreshStanding(); tfUpdateReadout(); }
function tfSliderLam(v)    { TF.state.lam = parseFloat(v); document.getElementById('val-lam').textContent = v + ' nm'; tfResetPulse(); tfRefreshSpectral(); tfRefreshStanding(); tfUpdateReadout(); }

/* ═══════════════════════ Presets ═══════════════════════ */

var TF_PRESETS = {
  'air-SiO2-Si':      { n1: 1.00, n2: 1.46, n3: 3.50, d: 195, theta1: 30, lam: 620 },
  'air-MgF2-glass':   { n1: 1.00, n2: 1.38, n3: 1.52, d: 100, theta1: 30, lam: 550 },
  'glass-water-glass': { n1: 1.52, n2: 1.33, n3: 1.52, d: 500, theta1: 20, lam: 620 },
  'water-oil-air':     { n1: 1.33, n2: 1.47, n3: 1.00, d: 800, theta1: 45, lam: 550 }
};

function tfSetPreset(key) {
  var p = TF_PRESETS[key];
  if (!p) return;
  TF.state.n1 = p.n1; TF.state.n2 = p.n2; TF.state.n3 = p.n3;
  TF.state.d = p.d; TF.state.theta1 = p.theta1; TF.state.lam = p.lam;

  var s1 = document.getElementById('slider-n1'); if (s1) s1.value = p.n1;
  var s2 = document.getElementById('slider-n2'); if (s2) s2.value = p.n2;
  var s3 = document.getElementById('slider-n3'); if (s3) s3.value = p.n3;
  var sd = document.getElementById('slider-d');  if (sd) sd.value = p.d;
  var st = document.getElementById('slider-theta1'); if (st) st.value = p.theta1;
  var sl = document.getElementById('slider-lam'); if (sl) sl.value = p.lam;

  document.getElementById('val-n1').textContent = p.n1.toFixed(2);
  document.getElementById('val-n2').textContent = p.n2.toFixed(2);
  document.getElementById('val-n3').textContent = p.n3.toFixed(2);
  document.getElementById('val-d').textContent = p.d + ' nm';
  document.getElementById('val-theta1').textContent = p.theta1 + '\u00b0';
  document.getElementById('val-lam').textContent = p.lam + ' nm';

  document.querySelectorAll('.preset-btn').forEach(function(b) { b.classList.remove('active'); });
  var activeBtn = document.querySelector('.preset-btn[onclick*="' + key + '"]');
  if (activeBtn) activeBtn.classList.add('active');

  tfResetPulse(); tfRefreshSpectral(); tfRefreshStanding(); tfUpdateReadout();
}

/* ═══════════════════════ Init ═══════════════════════ */

function initTF() {
  tfInitCanvas();
  tfInitPlots();
  tfSetPreset('air-SiO2-Si');
  tfStartAnim();
}
window.initTF = initTF;

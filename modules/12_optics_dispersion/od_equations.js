/* ═══════════════════════════════════════════════════════════════
   od_equations.js — Equation-Driven Optics & Dispersion Engine
   Module 12 Equation-First Architecture
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ─── SHARED STATE ─── */
window.eqState = {
  screen: 'snell',   /* snell | damping | fresnel | thinfilm */
  n1: 1.0,           /* incident medium (air/vacuum) */
  n2: 3.5,           /* film / material real index */
  n3: 3.5,           /* substrate index */
  d: 200,            /* film thickness nm */
  lambda: 620,       /* wavelength nm */
  kappa: 0.0,        /* extinction coefficient */
  theta1: 30,        /* incident angle (deg) */
  E: 2.0,            /* photon energy eV */
  mat: 'Si',         /* current material */
  animating: false,
  t: 0               /* animation time */
};

/* ─── DOM REFERENCES ─── */
var canvSnell, ctxSnell, canRunSnell = false;
var canvDamp, ctxDamp, canRunDamp = false;
var canvFresnel, ctxFresnel, canRunFresnel = false;
var canvThinFilm, ctxThinFilm, canRunThinFilm = false;
var animId = null, lastT = 0;

/* ═══════════════════════════════════════════════════════════════
   EQUATION RIBBON UPDATER
   Syncs inline parameter values in the HTML equation ribbon.
   ═══════════════════════════════════════════════════════════════ */
window.eqUpdateRibbon = function() {
  /* n₁, n₂, θ₁ spans */
  var spans = document.querySelectorAll('.eq-param');
  for (var i=0; i<spans.length; i++) {
    var s = spans[i];
    var sym = s.getAttribute('data-symbol');
    if (!sym) continue;
    if (sym === 'n1') s.textContent = eqState.n1.toFixed(2);
    else if (sym === 'n2') s.textContent = eqState.n2.toFixed(2);
    else if (sym === 'theta1') s.textContent = eqState.theta1.toFixed(0);
    else if (sym === 'kappa') s.textContent = eqState.kappa.toFixed(3);
    else if (sym === 'E') s.textContent = eqState.E.toFixed(2);
    else if (sym === 'mat') s.textContent = eqState.mat;
  }
  /* computed values */
  var cspans = document.querySelectorAll('.eq-computed');
  for (var i=0; i<cspans.length; i++) {
    var s = cspans[i];
    var sym = s.getAttribute('data-computed');
    if (!sym) continue;
    if (sym === 'theta2') {
      var th2 = eqComputeTheta2();
      s.textContent = (th2 !== null ? th2.toFixed(1) : 'TIR');
    }
    else if (sym === 'Rnorm') {
      var R = eqComputeRnormal();
      s.textContent = (R*100).toFixed(1);
    }
    else if (sym === 'Rangle') {
      var Ra = eqComputeRangle(eqState.theta1, 's');
      s.textContent = (Ra*100).toFixed(1);
    }
    else if (sym === 'W') {
      var W = eqComputePenetration();
      s.textContent = W.toFixed(0);
    }
    else if (sym === 'alpha') {
      var a = eqComputeAbsorbance();
      s.textContent = a.toFixed(2);
    }
    else if (sym === 'tf-r12') {
      var airy = eqTFComputeAiry();
      s.textContent = airy.r12.toFixed(3);
    }
    else if (sym === 'tf-r23') {
      var airy = eqTFComputeAiry();
      s.textContent = airy.r23.toFixed(3);
    }
    else if (sym === 'tf-beta') {
      var beta = eqTFComputeBeta();
      s.textContent = (beta !== null ? beta.toFixed(2) : 'TIR');
    }
    else if (sym === 'tf-R') {
      var airy = eqTFComputeAiry();
      s.textContent = (airy.R*100).toFixed(1);
    }
    else if (sym === 'tf-T') {
      var airy = eqTFComputeAiry();
      s.textContent = (airy.T*100).toFixed(1);
    }
    else if (sym === 'tf-theta2') {
      var th2 = eqTFComputeTheta2();
      s.textContent = (th2 !== null ? th2.toFixed(1) : 'TIR');
    }
  }
};

/* ═══════════════════════════════════════════════════════════════
   PHYSICS HELPERS (exact Hummel equations)
   ═══════════════════════════════════════════════════════════════ */
function eqComputeTheta2() {
  var th1 = eqState.theta1 * Math.PI / 180;
  var n1 = eqState.n1, n2 = eqState.n2;
  if (Math.sin(th1) > n2/n1) return null; /* TIR */
  return Math.asin(n1 * Math.sin(th1) / n2) * 180 / Math.PI;
}
function eqComputeRnormal() {
  var n = eqState.n2, k = eqState.kappa;
  return ((n-1)*(n-1)+k*k)/((n+1)*(n+1)+k*k);
}
function eqComputeRangle(thetaDeg, pol) {
  var th1 = thetaDeg * Math.PI / 180;
  var th2 = eqComputeTheta2();
  if (th2 === null) return 1.0;
  th2 = th2 * Math.PI / 180;
  var n1 = eqState.n1, n2 = eqState.n2;
  if (pol === 's') {
    var num = n1*Math.cos(th1) - n2*Math.cos(th2);
    var den = n1*Math.cos(th1) + n2*Math.cos(th2);
    return Math.pow(num/den, 2);
  } else {
    var num = n2*Math.cos(th1) - n1*Math.cos(th2);
    var den = n2*Math.cos(th1) + n1*Math.cos(th2);
    return Math.pow(num/den, 2);
  }
}
function eqComputePenetration() {
  /* W = λ / (4πκ)  (Hummel 10.21) */
  var lam = 1240 / Math.max(eqState.E, 0.01); /* nm */
  if (eqState.kappa <= 0) return 1e6;
  return lam / (4 * Math.PI * eqState.kappa);
}
function eqComputeAbsorbance() {
  /* a = 4πκ / λ  (Hummel 10.22) */
  var lam = 1240 / Math.max(eqState.E, 0.01); /* nm */
  if (eqState.kappa <= 0) return 0;
  return 4 * Math.PI * eqState.kappa / lam;
}
function eqIntensityDecay(z_nm) {
  /* I(z) = I₀ exp(-z/W) */
  var W = eqComputePenetration();
  if (W > 1e5) return 1.0;
  return Math.exp(-z_nm / W);
}
function eqAmplitudeEnvelope(z_nm) {
  /* E(z) = E₀ exp(-ωκz/c) = E₀ exp(-z/(2W)) */
  var W = eqComputePenetration();
  if (W > 1e5) return 1.0;
  return Math.exp(-z_nm / (2*W));
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN A — SNELL'S LAW & WAVE REFRACTION (Animated 2D Canvas)
═══════════════════════════════════════════════════════════════ */
window.eqInitSnell = function() {
  canvSnell = document.getElementById('eq-canvas-snell');
  if (!canvSnell) return;
  ctxSnell = canvSnell.getContext('2d');
  canRunSnell = true;
  eqResizeSnell();
};
function eqResizeSnell() {
  var wrap = document.getElementById('eq-wrap-snell');
  if (!wrap || !canvSnell) return;
  var w = Math.max(360, Math.min(wrap.clientWidth, 720)); /* cap width for stability */
  var h = 300;  /* compact height: equivalent to ~0.83× prior 360 px */
  canvSnell.width = w; canvSnell.height = h;
}
window.eqDrawSnell = function() {
  if (!canRunSnell || !ctxSnell) return;
  var c = ctxSnell, w = canvSnell.width, h = canvSnell.height;
  var cx = w/2, cy = h/2;
  var n1 = eqState.n1, n2 = eqState.n2, th1Deg = eqState.theta1;
  var th1 = th1Deg * Math.PI / 180;
  var th2 = eqComputeTheta2();
  var TIR = (th2 === null);
  var t = eqState.t;

  /* ── Geometry ── */
  var L = Math.min(w,h) * 0.38;
  var sx = 30;
  var sy = cy - (cx - sx) / Math.tan(th1);
  var rayLen = Math.sqrt((cx-sx)*(cx-sx) + (cy-sy)*(cy-sy));

  /* Wavelengths */
  var lam1 = 38 / n1, lam2 = 38 / n2;
  var v1 = 45, v2 = v1 * (n1/n2);

  /* ── Pulse state machine ── */
  if (!eqState.snellPulse) {
    eqState.snellPulse = {
      phase: 'idle',    /* idle → entering → splitting → propagating → done */
      waves: [],        /* active wavefront objects */
      trainLen: 5       /* how many wavefronts in the pulse */
    };
  }
  var pulse = eqState.snellPulse;

  /* Start pulse automatically on first call */
  if (pulse.phase === 'idle') {
    pulse.phase = 'entering';
    pulse.waves = [];
    for (var i = 0; i < pulse.trainLen; i++) {
      pulse.waves.push({
        type: 'inc', s: -50 - i * lam1, active: true, hasSplit: false
      });
    }
  }

  /* Advance all wavefronts in the pulse */
  var anyActive = false;
  for (var i = 0; i < pulse.waves.length; i++) {
    var wv = pulse.waves[i];
    if (!wv.active) continue;
    anyActive = true;

    if (wv.type === 'inc') {
      wv.s += v1 * 0.016;
      if (wv.s >= rayLen && !wv.hasSplit) {
        wv.hasSplit = true;
        if (!TIR) {
          pulse.waves.push({type:'ref', s:0, active:true});
          pulse.waves.push({type:'trn', s:0, active:true});
        }
      }
      if (wv.s > rayLen + lam1 * 2) wv.active = false;
    }
    else if (wv.type === 'ref') {
      wv.s += v1 * 0.016;
      if (wv.s > L + lam1) wv.active = false;
    }
    else if (wv.type === 'trn') {
      wv.s += v2 * 0.016;
      if (wv.s > L + lam2) wv.active = false;
    }
  }

  if (!anyActive) {
    pulse.phase = 'done';
    /* Stop global animation when pulse is finished */
    eqState.animating = false;
  }

  /* ── Clear ── */
  c.clearRect(0,0,w,h);
  c.fillStyle = '#060810'; c.fillRect(0,0,w,h);

  /* ── Medium backgrounds ── */
  c.fillStyle = 'rgba(0,240,255,0.03)'; c.fillRect(0, 0, w, cy);
  c.fillStyle = 'rgba(74,222,128,0.03)'; c.fillRect(0, cy, w, h - cy);

  /* ── Interface line ── */
  c.strokeStyle = '#fff'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(0, cy); c.lineTo(w, cy); c.stroke();

  /* ── Normal line ── */
  c.strokeStyle = 'rgba(255,255,255,0.15)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(cx, 10); c.lineTo(cx, h-10); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.font = '11px monospace'; c.textAlign = 'center';
  c.fillText('normal', cx, cy-4);

  /* ── E-FIELD: continuous sinusoid along each ray ── */
  var E0 = 28, omega = 8;
  var k1 = 2*Math.PI/lam1, k2 = 2*Math.PI/lam2;

  /* Incident E-field */
  c.strokeStyle = '#ffdd44'; c.lineWidth = 2.2; c.lineCap = 'round';
  c.beginPath();
  for (var st = 0; st <= 200; st++) {
    var frac = st / 200;
    var px = sx + (cx-sx)*frac;
    var py = sy + (cy-sy)*frac;
    var dist = frac * rayLen;
    var phase = k1 * dist - omega * t;
    var E = E0 * Math.sin(phase);
    var dx = Math.cos(th1) * E;
    var dy = -Math.sin(th1) * E;
    if (st === 0) c.moveTo(px+dx, py+dy); else c.lineTo(px+dx, py+dy);
  }
  c.stroke();

  /* Reflected E-field */
  if (!TIR) {
    var rx2 = cx + L*Math.sin(th1), ry2 = cy - L*Math.cos(th1);
    c.strokeStyle = '#00f0ff'; c.lineWidth = 2; c.lineCap = 'round';
    c.beginPath();
    for (var st = 0; st <= 120; st++) {
      var frac = st / 120;
      var px = cx + (rx2-cx)*frac;
      var py = cy + (ry2-cy)*frac;
      var dist = frac * L;
      var phase = k1 * dist - omega * t;
      var E = E0 * 0.35 * Math.sin(phase);
      var dx = Math.cos(th1) * E;
      var dy = Math.sin(th1) * E;
      if (st === 0) c.moveTo(px+dx, py+dy); else c.lineTo(px+dx, py+dy);
    }
    c.stroke();
  }

  /* Transmitted E-field */
  if (!TIR && th2 !== null) {
    var trTh = th2 * Math.PI / 180;
    var tx2 = cx + L*Math.sin(trTh), ty2 = cy + L*Math.cos(trTh);
    c.strokeStyle = '#4ade80'; c.lineWidth = 2; c.lineCap = 'round';
    c.beginPath();
    for (var st = 0; st <= 120; st++) {
      var frac = st / 120;
      var px = cx + (tx2-cx)*frac;
      var py = cy + (ty2-cy)*frac;
      var dist = frac * L;
      var phase = k2 * dist - omega * t;
      var E = E0 * 0.65 * Math.sin(phase);
      var dx = Math.cos(trTh) * E;
      var dy = -Math.sin(trTh) * E;
      if (st === 0) c.moveTo(px+dx, py+dy); else c.lineTo(px+dx, py+dy);
    }
    c.stroke();
  }

  /* ── MOVING WAVEFRONTS (pulse objects) ── */
  for (var i = 0; i < pulse.waves.length; i++) {
    var wv = pulse.waves[i];
    if (!wv.active) continue;

    if (wv.type === 'inc') {
      var frac = wv.s / rayLen;
      if (frac <= 0.02) continue;  /* still off-screen */
      if (frac > 1) continue;
      var px = sx + (cx-sx)*frac;
      var py = sy + (cy-sy)*frac;
      var perpDx = Math.cos(th1), perpDy = -Math.sin(th1);
      c.globalAlpha = Math.min(1, wv.s / 15);
      c.strokeStyle = '#ffdd44'; c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(px - perpDx*30, py - perpDy*30);
      c.lineTo(px + perpDx*30, py + perpDy*30);
      c.stroke();
    }
    else if (wv.type === 'ref') {
      var frac = wv.s / L;
      if (frac > 1) continue;
      var rx2 = cx + L*Math.sin(th1), ry2 = cy - L*Math.cos(th1);
      var px = cx + (rx2-cx)*frac;
      var py = cy + (ry2-cy)*frac;
      var perpDx = Math.cos(th1), perpDy = Math.sin(th1);
      c.globalAlpha = 0.55;
      c.strokeStyle = '#00f0ff'; c.lineWidth = 2;
      c.beginPath();
      c.moveTo(px - perpDx*26, py - perpDy*26);
      c.lineTo(px + perpDx*26, py + perpDy*26);
      c.stroke();
    }
    else if (wv.type === 'trn') {
      var frac = wv.s / L;
      if (frac > 1) continue;
      var trTh = th2 * Math.PI / 180;
      var tx2 = cx + L*Math.sin(trTh), ty2 = cy + L*Math.cos(trTh);
      var px = cx + (tx2-cx)*frac;
      var py = cy + (ty2-cy)*frac;
      var perpDx = Math.cos(trTh), perpDy = -Math.sin(trTh);
      var wfLen = 26 * (n1/n2);
      c.globalAlpha = 0.55;
      c.strokeStyle = '#4ade80'; c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(px - perpDx*wfLen, py - perpDy*wfLen);
      c.lineTo(px + perpDx*wfLen, py + perpDy*wfLen);
      c.stroke();
    }
  }
  c.globalAlpha = 1.0;

  /* ── Ray centerlines (propagation axis, cuts wave in half) ── */
  c.strokeStyle = 'rgba(255,221,68,0.65)'; c.lineWidth = 1; c.setLineDash([3,3]);
  c.beginPath(); c.moveTo(sx, sy); c.lineTo(cx, cy); c.stroke(); c.setLineDash([]);
  if (!TIR) {
    c.strokeStyle = 'rgba(0,240,255,0.65)'; c.lineWidth = 1; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + L*Math.sin(th1), cy - L*Math.cos(th1)); c.stroke(); c.setLineDash([]);
  }
  if (!TIR && th2 !== null) {
    var trTh = th2 * Math.PI / 180;
    c.strokeStyle = 'rgba(74,222,128,0.65)'; c.lineWidth = 1; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + L*Math.sin(trTh), cy + L*Math.cos(trTh)); c.stroke(); c.setLineDash([]);
  }

  /* ── Interface glow ── */
  c.fillStyle = 'rgba(255,255,255,0.25)';
  c.beginPath(); c.arc(cx, cy, 5, 0, Math.PI*2); c.fill();

  /* ── Angle arcs ── */
  var arcR = 40;
  c.strokeStyle = 'rgba(255,255,255,0.20)'; c.lineWidth = 1.5;
  c.beginPath(); c.arc(cx, cy, arcR, -Math.PI/2 - th1, -Math.PI/2); c.stroke();
  if (!TIR) {
    c.strokeStyle = 'rgba(0,240,255,0.20)';
    c.beginPath(); c.arc(cx, cy, arcR-10, -Math.PI/2, -Math.PI/2 - th1, true); c.stroke();
  }
  if (!TIR && th2 !== null) {
    var trTh = th2 * Math.PI / 180;
    c.strokeStyle = 'rgba(74,222,128,0.20)';
    c.beginPath(); c.arc(cx, cy, arcR, Math.PI/2, Math.PI/2 + trTh); c.stroke();
  }

  /* ── Angle readout: stacked vertical column on right side ── */
  var rx = w - 115, ry = cy - 30;
  var badge = function(y, color, text) {
    var tw = c.measureText(text).width;
    c.fillStyle = 'rgba(6,8,16,0.80)';
    c.beginPath();
    c.roundRect(rx, y - 11, Math.max(tw + 16, 100), 20, 4);
    c.fill();
    c.strokeStyle = color; c.lineWidth = 1;
    c.stroke();
    c.fillStyle = color; c.font = 'bold 11px monospace'; c.textAlign = 'left';
    c.fillText(text, rx + 8, y + 4);
  };
  badge(ry, '#ffdd44', 'theta1 = ' + th1Deg.toFixed(0) + ' deg');
  if (!TIR) {
    badge(ry + 26, '#00f0ff', 'theta_r = ' + th1Deg.toFixed(0) + ' deg');
    if (th2 !== null) badge(ry + 52, '#4ade80', 'theta2 = ' + th2.toFixed(1) + ' deg');
  } else {
    badge(ry + 26, '#ff4ecd', 'TIR');
  }

  /* ── TIR badge ── */
  if (TIR) {
    c.fillStyle = 'rgba(255,78,205,0.85)';
    c.font = 'bold 15px monospace'; c.textAlign = 'center';
    c.fillText('TOTAL INTERNAL REFLECTION', cx, cy - 55);
    c.font = '10px monospace';
    c.fillStyle = 'rgba(255,78,205,0.60)';
    c.fillText('sin theta1 > n2/n1', cx, cy - 38);
  }

  /* ── Bottom equation ── */
  c.fillStyle = '#8899aa'; c.font = '12px monospace'; c.textAlign = 'center';
  if (!TIR && th2 !== null) {
    c.fillText('n1 sin theta1 = n2 sin theta2    |    lambda2/lambda1 = n1/n2 = ' + (n1/n2).toFixed(3) + '    |    v2/v1 = n1/n2', cx, h-16);
  } else {
    c.fillText('n1 sin theta1 = ' + (n1*Math.sin(th1)).toFixed(3) + '    |    TIR: sin theta1 > n2/n1 = ' + (n2/n1).toFixed(3), cx, h-16);
  }

  /* ── Medium labels ── */
  c.fillStyle = 'rgba(255,221,68,0.55)'; c.font = 'bold 12px monospace'; c.textAlign = 'left';
  c.fillText('n1 = ' + n1.toFixed(2) + '    lambda1 = ' + lam1.toFixed(1) + ' px    v1 = c/' + n1.toFixed(2), 10, 18);
  c.fillStyle = TIR ? 'rgba(255,78,205,0.55)' : 'rgba(74,222,128,0.55)';
  c.fillText('n2 = ' + n2.toFixed(2) + '    lambda2 = ' + lam2.toFixed(1) + ' px    v2 = c/' + n2.toFixed(2), 10, h-6);

  /* ── Legend: bottom-left with background pill ── */
  var lx = 10, ly = h - 78, lw = 118, lh = 62;
  c.fillStyle = 'rgba(6,8,16,0.85)';
  c.beginPath();
  c.moveTo(lx + 6, ly);
  c.lineTo(lx + lw - 6, ly);
  c.arc(lx + lw - 6, ly + 6, 6, -Math.PI/2, 0);
  c.lineTo(lx + lw, ly + lh - 6);
  c.arc(lx + lw - 6, ly + lh - 6, 6, 0, Math.PI/2);
  c.lineTo(lx + 6, ly + lh);
  c.arc(lx + 6, ly + lh - 6, 6, Math.PI/2, Math.PI);
  c.lineTo(lx, ly + 6);
  c.arc(lx + 6, ly + 6, 6, Math.PI, -Math.PI/2);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 1;
  c.stroke();

  c.font = '11px monospace'; c.textAlign = 'left';
  c.fillStyle = '#ffdd44'; c.beginPath(); c.arc(lx + 10, ly + 16, 4, 0, Math.PI*2); c.fill();
  c.fillStyle = '#ccc';
  c.fillText('incident E', lx + 20, ly + 20);
  c.fillStyle = '#00f0ff'; c.beginPath(); c.arc(lx + 10, ly + 34, 4, 0, Math.PI*2); c.fill();
  c.fillStyle = '#ccc';
  c.fillText('reflected E', lx + 20, ly + 38);
  c.fillStyle = '#4ade80'; c.beginPath(); c.arc(lx + 10, ly + 52, 4, 0, Math.PI*2); c.fill();
  c.fillStyle = '#ccc';
  c.fillText('transmitted E', lx + 20, ly + 56);
};

/* ═══════════════════════════════════════════════════════════════
   SCREEN B — DAMPED WAVE & INTENSITY DECAY (Animated 2D Canvas)
═══════════════════════════════════════════════════════════════ */
window.eqInitDamping = function() {
  canvDamp = document.getElementById('eq-canvas-damping');
  if (!canvDamp) return;
  ctxDamp = canvDamp.getContext('2d');
  canRunDamp = true;
  eqResizeDamping();
};
function eqResizeDamping() {
  var wrap = document.getElementById('eq-wrap-damping');
  if (!wrap || !canvDamp) return;
  var w = Math.max(360, wrap.clientWidth);
  var h = 340;
  canvDamp.width = w; canvDamp.height = h;
}
window.eqDrawDamping = function() {
  if (!canRunDamp || !ctxDamp) return;
  var c = ctxDamp, w = canvDamp.width, h = canvDamp.height;
  c.clearRect(0,0,w,h);
  c.fillStyle = '#060810'; c.fillRect(0,0,w,h);

  var n = eqState.n2, kappa = eqState.kappa, E = eqState.E;
  var t = eqState.t;
  var omega = 6;
  var lam_nm = 1240 / Math.max(E, 0.01);
  var k0 = 2 * Math.PI / lam_nm;

  /* ── Layout ── */
  var leftW = w * 0.20;   /* vacuum */
  var barW  = w * 0.12;   /* intensity bar gap */
  var rightW = w - leftW - barW - 20;
  var zmax = 200;         /* nm depth shown */
  var topY = 28, botY = h - 24;
  var midY = (topY + botY) / 2;

  /* ── Vacuum region (z < 0) ── */
  c.fillStyle = 'rgba(0,240,255,0.03)';
  c.fillRect(0, topY, leftW, botY-topY);
  c.strokeStyle = 'rgba(0,240,255,0.20)';
  c.lineWidth = 1;
  c.strokeRect(0, topY, leftW, botY-topY);

  /* ── Material region (z > 0) ── */
  c.fillStyle = 'rgba(255,78,205,0.03)';
  c.fillRect(leftW, topY, rightW, botY-topY);
  c.strokeStyle = 'rgba(255,78,205,0.20)';
  c.strokeRect(leftW, topY, rightW, botY-topY);

  /* ── Interface line z = 0 ── */
  c.strokeStyle = '#fff'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(leftW, topY); c.lineTo(leftW, botY); c.stroke();

  /* ── Labels ── */
  c.fillStyle = '#00f0ff'; c.font = 'bold 12px monospace'; c.textAlign = 'center';
  c.fillText('VACUUM  z < 0', leftW/2, 18);
  c.fillStyle = '#ff4ecd';
  c.fillText('MATERIAL  z > 0    n=' + n.toFixed(2) + '  κ=' + kappa.toFixed(3), leftW + rightW/2, 18);

  /* ── E(z,t) = E₀ exp(−κk₀z) · cos(ωt − nk₀z) ── */
  c.strokeStyle = '#ffdd44'; c.lineWidth = 2.2; c.lineCap = 'round';
  c.beginPath();
  for (var px = 0; px < w - barW - 10; px++) {
    var z = (px < leftW) ? -(leftW - px) * (50 / leftW) : (px - leftW) * (zmax / rightW);
    var env = (px < leftW) ? 1.0 : Math.exp(-kappa * k0 * z);
    var phase = (px < leftW) ? (omega * t - 0.18 * px) : (omega * t - n * k0 * z);
    var Ez = env * Math.sin(phase);
    var py = midY - Ez * 50;
    if (px === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.stroke();

  /* ── Envelope: ± E₀ exp(−κk₀z) ── */
  c.strokeStyle = '#ff4ecd'; c.lineWidth = 1.5; c.setLineDash([5,4]);
  /* upper envelope */
  c.beginPath();
  for (var px = leftW; px < w - barW - 10; px++) {
    var z = (px - leftW) * (zmax / rightW);
    var env = Math.exp(-kappa * k0 * z);
    var py = midY - env * 50;
    if (px === leftW) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.stroke();
  /* lower envelope */
  c.beginPath();
  for (var px = leftW; px < w - barW - 10; px++) {
    var z = (px - leftW) * (zmax / rightW);
    var env = Math.exp(-kappa * k0 * z);
    var py = midY + env * 50;
    if (px === leftW) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.stroke();
  c.setLineDash([]);

  /* ── Intensity I(z) = I₀ exp(−2κk₀z) bar ── */
  var barX = w - barW + 4;
  for (var row = 0; row < botY - topY; row += 2) {
    var frac = row / (botY - topY);
    var z = frac * zmax;
    var I = Math.exp(-2 * kappa * k0 * z);
    var rr = Math.round(255 * (1 - I));
    var gg = Math.round(255 * I);
    c.fillStyle = 'rgb(' + rr + ',' + gg + ',68)';
    c.fillRect(barX, botY - row, barW - 8, 2);
  }
  /* bar border */
  c.strokeStyle = 'rgba(255,255,255,0.15)'; c.lineWidth = 1;
  c.strokeRect(barX, topY, barW - 8, botY - topY);

  /* ── Penetration depth W marker ── */
  var W = eqComputePenetration();
  if (W > 0 && W < zmax) {
    var wx = leftW + (W / zmax) * rightW;
    c.strokeStyle = '#ff4ecd'; c.lineWidth = 1; c.setLineDash([4,3]);
    c.beginPath(); c.moveTo(wx, topY); c.lineTo(wx, botY); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#ff4ecd'; c.font = '11px monospace'; c.textAlign = 'center';
    c.fillText('W≈' + W.toFixed(0) + ' nm', wx, topY - 4);
  }

  /* ── Axis labels ── */
  c.fillStyle = '#aaa'; c.font = '11px monospace'; c.textAlign = 'left';
  c.fillText('E(z,t)', 6, midY - 55);
  c.fillText('I(z)/I₀', barX, midY - 55);
  c.fillStyle = '#ffdd44'; c.fillText('z=0', leftW - 18, botY + 14);
  c.fillStyle = '#4ade80'; c.fillText('z=' + zmax + ' nm', leftW + rightW - 60, botY + 14);

  /* ── Equation text ── */
  c.fillStyle = '#ccc'; c.font = '12px monospace'; c.textAlign = 'center';
  if (kappa > 0.001) {
    c.fillText('E = E₀ exp(−κk₀z)·cos(ωt−nk₀z)    |    I = I₀ exp(−z/W)    W = λ/(4πκ) = ' + W.toFixed(0) + ' nm', w/2, h - 6);
  } else {
    c.fillText('E = E₀ cos(ωt − nk₀z)    |    κ ≈ 0  →  no absorption  →  W → ∞', w/2, h - 6);
  }
};

/* ═══════════════════════════════════════════════════════════════
   SCREEN C — FRESNEL REFLECTIVITY vs ANGLE (Polar + Cartesian)
═══════════════════════════════════════════════════════════════ */
window.eqInitFresnel = function() {
  canvFresnel = document.getElementById('eq-canvas-fresnel');
  if (!canvFresnel) return;
  ctxFresnel = canvFresnel.getContext('2d');
  canRunFresnel = true;
  eqResizeFresnel();
};
function eqResizeFresnel() {
  var wrap = document.getElementById('eq-wrap-fresnel');
  if (!wrap || !canvFresnel) return;
  var w = Math.max(360, wrap.clientWidth);
  var h = 340;
  canvFresnel.width = w; canvFresnel.height = h;
}
window.eqDrawFresnel = function() {
  if (!canRunFresnel || !ctxFresnel) return;
  var c = ctxFresnel, w = canvFresnel.width, h = canvFresnel.height;
  c.clearRect(0,0,w,h);
  c.fillStyle = '#060810'; c.fillRect(0,0,w,h);

  var cx = w * 0.5, cy = h * 0.55;
  var Rmax = 80;
  var n1 = eqState.n1, n2 = eqState.n2;

  /* polar grid */
  c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 1;
  for (var r=20; r<=Rmax; r+=20) {
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI*2); c.stroke();
  }
  for (var a=0; a<360; a+=30) {
    var rad = a * Math.PI/180;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Rmax*Math.cos(rad), cy + Rmax*Math.sin(rad)); c.stroke();
  }

  /* R_s curve (polar) */
  c.strokeStyle = '#00f0ff'; c.lineWidth = 2.5;
  c.beginPath();
  for (var ang=0; ang<=89.5; ang+=0.5) {
    var Rs = eqComputeRangle(ang, 's');
    var rad = ang * Math.PI/180;
    var rr = Rs * Rmax;
    var px = cx + rr*Math.cos(rad), py = cy - rr*Math.sin(rad);
    if (ang===0) c.moveTo(px,py); else c.lineTo(px,py);
  }
  c.stroke();

  /* R_p curve (polar) */
  c.strokeStyle = '#ff4ecd'; c.lineWidth = 2.5;
  c.beginPath();
  for (var ang=0; ang<=89.5; ang+=0.5) {
    var Rp = eqComputeRangle(ang, 'p');
    var rad = ang * Math.PI/180;
    var rr = Rp * Rmax;
    var px = cx + rr*Math.cos(rad), py = cy - rr*Math.sin(rad);
    if (ang===0) c.moveTo(px,py); else c.lineTo(px,py);
  }
  c.stroke();

  /* current angle marker */
  var cRad = eqState.theta1 * Math.PI/180;
  var cRs = eqComputeRangle(eqState.theta1, 's');
  var cRp = eqComputeRangle(eqState.theta1, 'p');
  var mxs = cx + cRs*Rmax*Math.cos(cRad);
  var mys = cy - cRs*Rmax*Math.sin(cRad);
  var mxp = cx + cRp*Rmax*Math.cos(cRad);
  var myp = cy - cRp*Rmax*Math.sin(cRad);
  c.fillStyle = '#00f0ff'; c.beginPath(); c.arc(mxs, mys, 5, 0, Math.PI*2); c.fill();
  c.fillStyle = '#ff4ecd'; c.beginPath(); c.arc(mxp, myp, 5, 0, Math.PI*2); c.fill();

  /* Brewster angle marker */
  var thB = Math.atan(n2/n1) * 180/Math.PI;
  if (thB < 90) {
    var bRad = thB * Math.PI/180;
    var bRr = eqComputeRangle(thB, 'p') * Rmax;
    c.strokeStyle = '#4ade80'; c.lineWidth = 1; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Rmax*Math.cos(bRad), cy - Rmax*Math.sin(bRad)); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#4ade80'; c.font = '11px monospace'; c.textAlign = 'left';
    c.fillText('Brewster θ_B≈' + thB.toFixed(1) + '°', cx + 6, cy - Rmax*Math.sin(bRad) - 4);
  }

  /* Legend */
  c.fillStyle = '#00f0ff'; c.beginPath(); c.arc(14, h-54, 5, 0, Math.PI*2); c.fill();
  c.fillStyle = '#aaa'; c.font = '12px monospace'; c.textAlign = 'left';
  c.fillText('R_s (s-polarized)', 26, h-50);
  c.fillStyle = '#ff4ecd'; c.beginPath(); c.arc(14, h-34, 5, 0, Math.PI*2); c.fill();
  c.fillStyle = '#aaa';
  c.fillText('R_p (p-polarized)', 26, h-30);
  c.fillStyle = '#4ade80'; c.beginPath(); c.arc(14, h-14, 5, 0, Math.PI*2); c.fill();
  c.fillStyle = '#aaa';
  c.fillText('Brewster: R_p = 0', 26, h-10);

  /* Values */
  c.fillStyle = '#ccc'; c.font = 'bold 14px monospace'; c.textAlign = 'center';
  c.fillText('R_s=' + (cRs*100).toFixed(1) + '%  R_p=' + (cRp*100).toFixed(1) + '% @ θ=' + eqState.theta1 + '°', cx, 18);
};

/* ═══════════════════════════════════════════════════════════════
   SCREEN D — THIN FILM REFLECTION & TRANSMISSION (Airy)
   Three-layer system: n₁ → n₂ (film, thickness d) → n₃
   Multiple internal reflections interfere → oscillating R(λ), T(λ).
   ═══════════════════════════════════════════════════════════════ */

/**
 * Fresnel reflection coefficient at interface a→b for s-polarization
 *   r_ab^s = (n_a cos θ_a − n_b cos θ_b) / (n_a cos θ_a + n_b cos θ_b)
 * Fresnel transmission coefficient
 *   t_ab^s = (2 n_a cos θ_a) / (n_a cos θ_a + n_b cos θ_b)
 */
function eqTFComputeTheta2() {
  var th1 = eqState.theta1 * Math.PI / 180;
  var n1 = eqState.n1, n2 = eqState.n2;
  var s = n1 * Math.sin(th1) / n2;
  if (Math.abs(s) > 1) return null; /* TIR at first interface */
  return Math.asin(s) * 180 / Math.PI;
}
function eqTFComputeTheta3() {
  var th1 = eqState.theta1 * Math.PI / 180;
  var n1 = eqState.n1, n3 = eqState.n3;
  var s = n1 * Math.sin(th1) / n3;
  if (Math.abs(s) > 1) return null; /* TIR at second interface */
  return Math.asin(s) * 180 / Math.PI;
}
function eqTFComputeBeta() {
  /* Phase accumulated during one round-trip through the film:
   *   β = (2π/λ) · n₂ · d · cos θ₂   [radians]
   * λ, d in nm → result is dimensionless angle */
  var th2 = eqTFComputeTheta2();
  if (th2 === null) return null;
  var lam_nm = eqState.lambda;
  var n2 = eqState.n2, d_nm = eqState.d;
  var cos2 = Math.cos(th2 * Math.PI / 180);
  return (2 * Math.PI / lam_nm) * n2 * d_nm * cos2;
}
function eqTFComputeFresnel() {
  /* Returns {r12, t12, r23, t23} for s-polarization */
  var th1 = eqState.theta1 * Math.PI / 180;
  var n1 = eqState.n1, n2 = eqState.n2, n3 = eqState.n3;
  var th2r = eqTFComputeTheta2();
  if (th2r === null) return {r12:1, t12:0, r23:1, t23:0};
  var th2 = th2r * Math.PI / 180;
  var c1 = Math.cos(th1), c2 = Math.cos(th2);
  var r12 = (n1*c1 - n2*c2) / (n1*c1 + n2*c2);
  var t12 = (2*n1*c1) / (n1*c1 + n2*c2);
  var th3r = eqTFComputeTheta3();
  if (th3r === null) return {r12:r12, t12:t12, r23:1, t23:0};
  var th3 = th3r * Math.PI / 180;
  var c3 = Math.cos(th3);
  var r23 = (n2*c2 - n3*c3) / (n2*c2 + n3*c3);
  var t23 = (2*n2*c2) / (n2*c2 + n3*c3);
  return {r12:r12, t12:t12, r23:r23, t23:t23};
}
function eqTFComputeAiry() {
  /* Total reflection and transmission for thin film (Airy formulas).
   *   r = (r12 + r23·e^{2iβ}) / (1 + r12·r23·e^{2iβ})
   *   t = (t12·t23·e^{iβ})   / (1 + r12·r23·e^{2iβ})
   *   R = |r|² ,  T = (n3 cos θ3 / n1 cos θ1) · |t|²
   */
  var beta = eqTFComputeBeta();
  if (beta === null) return {R:1, T:0, r12:1, r23:1, beta:0, theta2:null, theta3:null};
  var f = eqTFComputeFresnel();
  var e2ib = { re: Math.cos(2*beta), im: Math.sin(2*beta) };
  var numR = { re: f.r12 + f.r23*e2ib.re, im: f.r23*e2ib.im };
  var den  = { re: 1 + f.r12*f.r23*e2ib.re, im: f.r12*f.r23*e2ib.im };
  var denMag2 = den.re*den.re + den.im*den.im;
  var R = (numR.re*numR.re + numR.im*numR.im) / denMag2;
  var numT = { re: f.t12*f.t23*Math.cos(beta), im: f.t12*f.t23*Math.sin(beta) };
  var Tamp2 = (numT.re*numT.re + numT.im*numT.im) / denMag2;
  var th1 = eqState.theta1 * Math.PI / 180;
  var th3r = eqTFComputeTheta3();
  var cos1 = Math.cos(th1), cos3 = (th3r !== null) ? Math.cos(th3r*Math.PI/180) : 1;
  var n1 = eqState.n1, n3 = eqState.n3;
  var T = (n3 * cos3 / (n1 * cos1)) * Tamp2;
  return {R:R, T:T, r12:f.r12, r23:f.r23, beta:beta,
          theta2:eqTFComputeTheta2(), theta3:th3r, t12:f.t12, t23:f.t23};
}

/* ─── Canvas init / resize ─── */
window.eqInitThinFilm = function() {
  canvThinFilm = document.getElementById('eq-canvas-thinfilm');
  if (!canvThinFilm) return;
  ctxThinFilm = canvThinFilm.getContext('2d');
  canRunThinFilm = true;
  eqResizeThinFilm();
};
function eqResizeThinFilm() {
  var wrap = document.getElementById('eq-wrap-thinfilm');
  if (!wrap || !canvThinFilm) return;
  var w = Math.max(360, wrap.clientWidth);
  var h = 340;
  canvThinFilm.width = w; canvThinFilm.height = h;
}

/* ─── Draw ─── */
window.eqDrawThinFilm = function() {
  if (!canRunThinFilm || !ctxThinFilm) return;
  var c = ctxThinFilm, w = canvThinFilm.width, h = canvThinFilm.height;
  var n1 = eqState.n1, n2 = eqState.n2, n3 = eqState.n3;
  var lam_nm = eqState.lambda, d_nm = eqState.d;
  var th1Deg = eqState.theta1;
  var th1 = th1Deg * Math.PI / 180;

  /* Physics */
  var airy = eqTFComputeAiry();
  var th2 = airy.theta2;
  var th3 = airy.theta3;

  /* Clear */
  c.clearRect(0,0,w,h);
  c.fillStyle = '#060810'; c.fillRect(0,0,w,h);

  /* Geometry: horizontal layers */
  var cy = h * 0.5;
  var filmTop = cy - 50;   /* visual thickness 100 px */
  var filmBot = cy + 50;
  var ix = w * 0.20;       /* interface 1-2 x */
  var ox = w * 0.80;       /* interface 2-3 x */

  /* Medium labels */
  c.font = '12px monospace'; c.textAlign = 'left'; c.fillStyle = '#8899aa';
  c.fillText('n₁ = ' + n1.toFixed(2), 8, filmTop - 10);
  c.fillText('n₂ = ' + n2.toFixed(2) + '  ·  d = ' + d_nm + ' nm', 8, cy);
  c.fillText('n₃ = ' + n3.toFixed(2), 8, filmBot + 22);

  /* Layer fills */
  c.fillStyle = 'rgba(0,240,255,0.03)'; c.fillRect(0, 0, w, filmTop);
  c.fillStyle = 'rgba(74,222,128,0.04)'; c.fillRect(0, filmTop, w, filmBot-filmTop);
  c.fillStyle = 'rgba(192,132,252,0.03)'; c.fillRect(0, filmBot, w, h-filmBot);

  /* Interface lines */
  c.strokeStyle = '#fff'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(0, filmTop); c.lineTo(w, filmTop); c.stroke();
  c.beginPath(); c.moveTo(0, filmBot); c.lineTo(w, filmBot); c.stroke();

  /* Normal line at ix and ox */
  c.strokeStyle = 'rgba(255,255,255,0.15)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(ix, 10); c.lineTo(ix, h-10); c.stroke();
  c.beginPath(); c.moveTo(ox, 10); c.lineTo(ox, h-10); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.font = '10px monospace'; c.textAlign = 'center';
  c.fillText('normal', ix, filmTop-4);
  c.fillText('normal', ox, filmBot+16);

  /* Ray geometry */
  var L = Math.min(w,h) * 0.35;
  var sx = 20;
  var sy = filmTop - (ix - sx) / Math.tan(th1);

  /* ── E-FIELD SINE WAVE DRAWING ── */
  var E0 = 26, omega = 8;
  var lam1 = 34 / n1;
  var lam2 = 34 / n2;
  var lam3 = 34 / n3;
  var t = eqState.t;
  var k1 = 2*Math.PI/lam1;
  var k2 = 2*Math.PI/lam2;
  var k3 = 2*Math.PI/lam3;

  /* Incident ray from left to ix */
  c.strokeStyle = '#ffdd44'; c.lineWidth = 2.2; c.lineCap = 'round';
  c.beginPath();
  for (var st = 0; st <= 200; st++) {
    var frac = st / 200;
    var px = sx + (ix-sx)*frac;
    var py = sy + (filmTop-sy)*frac;
    var dist = frac * Math.sqrt((ix-sx)*(ix-sx) + (filmTop-sy)*(filmTop-sy));
    var phase = k1 * dist - omega * t;
    var E = E0 * Math.sin(phase);
    var dx = Math.cos(th1) * E;
    var dy = -Math.sin(th1) * E;
    if (st === 0) c.moveTo(px+dx, py+dy); else c.lineTo(px+dx, py+dy);
  }
  c.stroke();

  /* Reflected back into n1 */
  if (airy.R > 0.01) {
    var rx2 = ix + L*Math.sin(th1);
    var ry2 = filmTop - L*Math.cos(th1);
    c.strokeStyle = '#00f0ff'; c.lineWidth = 2; c.lineCap = 'round';
    c.beginPath();
    for (var st = 0; st <= 120; st++) {
      var frac = st / 120;
      var px = ix + (rx2-ix)*frac;
      var py = filmTop + (ry2-filmTop)*frac;
      var dist = frac * L;
      var phase = k1 * dist - omega * t;
      var E = E0 * Math.sqrt(airy.R) * Math.sin(phase);
      var dx = Math.cos(th1) * E;
      var dy = Math.sin(th1) * E;
      if (st === 0) c.moveTo(px+dx, py+dy); else c.lineTo(px+dx, py+dy);
    }
    c.stroke();
  }

  /* ── Film ray: enters at ix/filmTop, exits where it hits filmBot ── */
  if (th2 !== null && airy.T > 0.01) {
    var th2r = th2 * Math.PI / 180;
    var tan2 = Math.tan(th2r);

    /* Compute actual intersection with bottom interface
     *   filmTop + tan(θ₂)·(exitX - ix) = filmBot
     *   => exitX = ix + (filmBot - filmTop) / tan(θ₂)
     */
    var exitX;
    if (Math.abs(tan2) < 1e-6) {
      exitX = ix; /* horizontal ray */
    } else {
      exitX = ix + (filmBot - filmTop) / tan2;
    }
    if (exitX > w) exitX = w; /* clip to canvas right edge */

    /* Single phase accumulator across film + n3 so waves are continuous */
    var phaseAcc = 0;

    /* Ray inside film: ix → exitX */
    var filmLen = Math.sqrt((exitX-ix)*(exitX-ix) + (filmBot-filmTop)*(filmBot-filmTop));
    c.strokeStyle = '#4ade80'; c.lineWidth = 2; c.lineCap = 'round';
    c.beginPath();
    for (var st = 0; st <= 200; st++) {
      var frac = st / 200;
      var px = ix + (exitX-ix)*frac;
      var py = filmTop + (filmBot-filmTop)*frac;
      var dist = frac * filmLen;
      var phase = k2 * dist - omega * t;
      var E = E0 * Math.pow(airy.T, 0.5) * Math.sin(phase);
      var dx = Math.cos(th2r) * E;
      var dy = -Math.sin(th2r) * E;
      if (st === 0) c.moveTo(px+dx, py+dy); else c.lineTo(px+dx, py+dy);
    }
    c.stroke();
    phaseAcc = k2 * filmLen;

    /* Ray into n3 starting exactly at exitX/filmBot */
    if (th3 !== null) {
      var th3r = th3 * Math.PI / 180;
      var tx3 = exitX + L*Math.sin(th3r);
      var ty3 = filmBot + L*Math.cos(th3r);
      c.strokeStyle = '#c084fc'; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath();
      for (var st = 0; st <= 120; st++) {
        var frac = st / 120;
        var px = exitX + (tx3-exitX)*frac;
        var py = filmBot + (ty3-filmBot)*frac;
        var dist = frac * L;
        var phase = phaseAcc + k3 * dist - omega * t;
        var E = E0 * Math.pow(airy.T, 0.5) * Math.sin(phase);
        var dx = Math.cos(th3r) * E;
        var dy = -Math.sin(th3r) * E;
        if (st === 0) c.moveTo(px+dx, py+dy); else c.lineTo(px+dx, py+dy);
      }
      c.stroke();
    }
  }

  /* ── Ray centerlines (dashed propagation axis, cuts waves in half) ── */
  c.lineWidth = 1; c.setLineDash([3,3]);
  /* Incident */
  c.strokeStyle = 'rgba(255,221,68,0.65)';
  c.beginPath(); c.moveTo(sx, sy); c.lineTo(ix, filmTop); c.stroke();
  /* Reflected */
  if (airy.R > 0.01) {
    c.strokeStyle = 'rgba(0,240,255,0.65)';
    c.beginPath(); c.moveTo(ix, filmTop); c.lineTo(ix + L*Math.sin(th1), filmTop - L*Math.cos(th1)); c.stroke();
  }
  /* Film */
  if (th2 !== null && airy.T > 0.01 && typeof exitX !== 'undefined') {
    c.strokeStyle = 'rgba(74,222,128,0.65)';
    c.beginPath(); c.moveTo(ix, filmTop); c.lineTo(exitX, filmBot); c.stroke();
  }
  /* Substrate */
  if (th3 !== null && typeof exitX !== 'undefined') {
    var th3r = th3 * Math.PI / 180;
    c.strokeStyle = 'rgba(192,132,252,0.65)';
    c.beginPath(); c.moveTo(exitX, filmBot); c.lineTo(exitX + L*Math.sin(th3r), filmBot + L*Math.cos(th3r)); c.stroke();
  }
  c.setLineDash([]);

  /* Multiple internal reflections (faint) inside film */
  if (th2 !== null && Math.abs(airy.r12) > 0.05 && Math.abs(airy.r23) > 0.05) {
    var th2r = th2 * Math.PI / 180;
    var bounceX = ox - ix;
    var bounceY = Math.tan(th2r) * bounceX;
    c.strokeStyle = '#4ade80'; c.lineWidth = 1; c.globalAlpha = 0.25;
    for (var b = 1; b <= 3; b++) {
      var fac = Math.pow(Math.abs(airy.r12*airy.r23), b);
      if (fac < 0.02) break;
      c.globalAlpha = fac * 0.35;
      /* downward bounce from top to bottom */
      var bx1 = ix + b*bounceX;
      var by1 = filmTop + b*bounceY;
      var bx2 = ix + (b+1)*bounceX;
      var by2 = filmTop + (b+1)*bounceY;
      if (bx1 > w || by1 > filmBot) continue;
      c.beginPath(); c.moveTo(bx1, by1); c.lineTo(bx2, by2); c.stroke();
      /* upward bounce reflected back */
      var bx3 = bx2;
      var by3 = by2 - 2*bounceY;
      if (bx3 > w || by3 < filmTop) continue;
      c.beginPath(); c.moveTo(bx2, by2); c.lineTo(bx3, by3); c.stroke();
    }
    c.globalAlpha = 1.0;
  }

  /* Film thickness double-arrow label */
  c.strokeStyle = '#fff'; c.lineWidth = 1; c.globalAlpha = 0.5;
  c.beginPath(); c.moveTo(w-55, filmTop); c.lineTo(w-55, filmBot); c.stroke();
  c.beginPath(); c.moveTo(w-60, filmTop+4); c.lineTo(w-50, filmTop+4); c.stroke();
  c.beginPath(); c.moveTo(w-60, filmBot-4); c.lineTo(w-50, filmBot-4); c.stroke();
  c.fillStyle = '#ccc'; c.font = '11px monospace'; c.textAlign = 'center';
  c.fillText('d', w-46, cy+4);
  c.globalAlpha = 1.0;

  /* ── Angle arcs (geometric frame of refraction) ── */
  var arcR = 32;
  c.lineWidth = 1.5;
  /* θ₁ at ix/filmTop: between upward normal and incident ray */
  c.strokeStyle = 'rgba(255,221,68,0.35)';
  c.beginPath(); c.arc(ix, filmTop, arcR, -Math.PI/2 - th1, -Math.PI/2); c.stroke();
  /* θ₂ at ix/filmTop: between downward normal and film ray */
  if (th2 !== null) {
    var th2r = th2 * Math.PI / 180;
    c.strokeStyle = 'rgba(74,222,128,0.35)';
    c.beginPath(); c.arc(ix, filmTop, arcR-6, Math.PI/2, Math.PI/2 + th2r); c.stroke();
  }
  /* θ₃ at exitX/filmBot: between downward normal and substrate ray */
  if (th3 !== null && typeof exitX !== 'undefined') {
    var th3r = th3 * Math.PI / 180;
    c.strokeStyle = 'rgba(192,132,252,0.35)';
    c.beginPath(); c.arc(exitX, filmBot, arcR, Math.PI/2, Math.PI/2 + th3r); c.stroke();
  }

  /* ── Normal tick marks at interfaces ── */
  c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1;
  /* tick at ix on filmTop */
  c.beginPath(); c.moveTo(ix-5, filmTop); c.lineTo(ix+5, filmTop); c.stroke();
  /* tick at exitX on filmBot */
  if (typeof exitX !== 'undefined') {
    c.beginPath(); c.moveTo(exitX-5, filmBot); c.lineTo(exitX+5, filmBot); c.stroke();
  }

  /* Angle labels positioned at arc centers */
  c.font = 'bold 11px monospace'; c.textAlign = 'center';
  c.fillStyle = '#ffdd44';
  c.fillText('θ₁=' + th1Deg.toFixed(0) + '°', ix - arcR - 14, filmTop - 10);
  if (th2 !== null) {
    c.fillStyle = '#4ade80';
    c.fillText('θ₂=' + th2.toFixed(1) + '°', ix + arcR + 18, filmTop + 22);
  }
  if (th3 !== null && typeof exitX !== 'undefined') {
    c.fillStyle = '#c084fc';
    c.fillText('θ₃=' + th3.toFixed(1) + '°', exitX + arcR + 18, filmBot + 18);
  }

  /* Legend — four rows to match all visible rays */
  var lx = 10, ly = h - 94;
  c.fillStyle = 'rgba(6,8,16,0.80)';
  c.fillRect(lx, ly, 154, 78);
  c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1;
  c.strokeRect(lx, ly, 154, 78);
  c.fillStyle = '#ffdd44'; c.beginPath(); c.arc(lx+10, ly+14, 4, 0, Math.PI*2); c.fill();
  c.fillStyle = '#aaa'; c.font = '11px monospace'; c.textAlign = 'left';
  c.fillText('Incident n₁', lx+20, ly+18);
  c.fillStyle = '#00f0ff'; c.beginPath(); c.arc(lx+10, ly+30, 4, 0, Math.PI*2); c.fill();
  c.fillStyle = '#aaa'; c.fillText('Reflected n₁', lx+20, ly+34);
  c.fillStyle = '#4ade80'; c.beginPath(); c.arc(lx+10, ly+46, 4, 0, Math.PI*2); c.fill();
  c.fillStyle = '#aaa'; c.fillText('Film n₂', lx+20, ly+50);
  c.fillStyle = '#c084fc'; c.beginPath(); c.arc(lx+10, ly+62, 4, 0, Math.PI*2); c.fill();
  c.fillStyle = '#aaa'; c.fillText('Substrate n₃', lx+20, ly+66);

  /* Live readout bar at top-right */
  c.fillStyle = 'rgba(6,8,16,0.80)'; c.fillRect(w-220, 6, 214, 56);
  c.strokeStyle = 'rgba(255,255,255,0.12)'; c.strokeRect(w-220, 6, 214, 56);
  c.fillStyle = '#ccc'; c.font = 'bold 12px monospace'; c.textAlign = 'left';
  c.fillText('R=' + (airy.R*100).toFixed(1) + '%', w-212, 22);
  c.fillText('T=' + (airy.T*100).toFixed(1) + '%', w-212, 38);
  c.fillText('β=' + airy.beta.toFixed(2) + ' rad', w-212, 54);
};

/* ═══════════════════════════════════════════════════════════════
   GLOBAL ANIMATION LOOP
   ═══════════════════════════════════════════════════════════════ */
function eqAnimLoop(now) {
  if (!eqState.animating) return;
  if (lastT === 0) lastT = now;
  var dt = (now - lastT) / 1000;
  lastT = now;
  eqState.t += dt;

  if (eqState.screen === 'snell') eqDrawSnell();
  else if (eqState.screen === 'damping') eqDrawDamping();
  else if (eqState.screen === 'fresnel') eqDrawFresnel();
  else if (eqState.screen === 'thinfilm') eqDrawThinFilm();

  animId = requestAnimationFrame(eqAnimLoop);
}

window.eqSetScreen = function(name) {
  eqState.screen = name;
  /* switch visible canvas */
  ['snell','damping','fresnel','thinfilm'].forEach(function(s){
    var wrap = document.getElementById('eq-wrap-'+s);
    var tab = document.getElementById('eq-tab-'+s);
    if (wrap) wrap.style.display = (s===name)?'block':'none';
    if (tab) tab.classList.toggle('active', s===name);
  });
  eqUpdateRibbon();
  /* restart pulse when entering Snell */
  if (name === 'snell') eqResetSnellPulse();
  if (eqState.animating && animId) {
    return; /* already looping */
  }
  if (eqState.animating) {
    lastT = 0;
    animId = requestAnimationFrame(eqAnimLoop);
  } else if (name === 'snell') {
    /* force a one-shot play if paused */
    eqState.animating = true; lastT = 0;
    animId = requestAnimationFrame(eqAnimLoop);
    var btn = document.getElementById('eq-anim-toggle');
    if (btn) btn.textContent = '⏸ Pause';
  } else {
    if (name === 'damping') eqDrawDamping();
    else if (name === 'fresnel') eqDrawFresnel();
    else if (name === 'thinfilm') eqDrawThinFilm();
  }
};

window.eqToggleAnimation = function() {
  eqState.animating = !eqState.animating;
  if (eqState.animating) {
    lastT = 0;
    animId = requestAnimationFrame(eqAnimLoop);
  } else {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }
  var btn = document.getElementById('eq-anim-toggle');
  if (btn) btn.textContent = eqState.animating ? '⏸ Pause' : '▶ Play Animation';
};

/* ─── SLIDER WIRING (called by HTML + od_sim) ─── */
window.eqSliderN1 = function(v) { eqState.n1 = parseFloat(v); eqUpdateRibbon(); eqDrawActive(); };
window.eqSliderN2 = function(v) { eqState.n2 = parseFloat(v); eqUpdateRibbon(); eqDrawActive(); eqResetSnellPulse(); };
window.eqSliderTheta = function(v) { eqState.theta1 = parseFloat(v); eqUpdateRibbon(); eqDrawActive(); odChangeSliderAngle(v); eqResetSnellPulse(); };
window.eqSliderKappa = function(v) { eqState.kappa = parseFloat(v); eqUpdateRibbon(); eqDrawActive(); };
window.eqSliderE = function(v) { eqState.E = parseFloat(v); eqUpdateRibbon(); eqDrawActive(); odChangeSliderE(v); };

/* ─── THIN FILM SLIDER WIRING ─── */
window.eqSliderTFN1  = function(v) { eqState.n1     = parseFloat(v); eqUpdateRibbon(); eqDrawActive();
  var el = document.getElementById('val-tf-n1'); if (el) el.textContent = eqState.n1.toFixed(2);
  if (typeof _odRefreshThinFilmPlot === 'function') _odRefreshThinFilmPlot(); };
window.eqSliderTFN2  = function(v) { eqState.n2     = parseFloat(v); eqUpdateRibbon(); eqDrawActive();
  var el = document.getElementById('val-tf-n2'); if (el) el.textContent = eqState.n2.toFixed(2);
  if (typeof _odRefreshThinFilmPlot === 'function') _odRefreshThinFilmPlot(); };
window.eqSliderTFN3  = function(v) { eqState.n3     = parseFloat(v); eqUpdateRibbon(); eqDrawActive();
  var el = document.getElementById('val-tf-n3'); if (el) el.textContent = eqState.n3.toFixed(2);
  if (typeof _odRefreshThinFilmPlot === 'function') _odRefreshThinFilmPlot(); };
window.eqSliderTFD   = function(v) { eqState.d      = parseFloat(v); eqUpdateRibbon(); eqDrawActive();
  var el = document.getElementById('val-tf-d');  if (el) el.textContent = eqState.d.toFixed(0);
  if (typeof _odRefreshThinFilmPlot === 'function') _odRefreshThinFilmPlot(); };
window.eqSliderTFTheta = function(v) { eqState.theta1 = parseFloat(v); eqUpdateRibbon(); eqDrawActive();
  var el = document.getElementById('val-tf-theta'); if (el) el.textContent = eqState.theta1.toFixed(0);
  if (typeof _odRefreshThinFilmPlot === 'function') _odRefreshThinFilmPlot(); };
window.eqSliderTFLam = function(v) { eqState.lambda = parseFloat(v); eqUpdateRibbon(); eqDrawActive();
  var el = document.getElementById('val-tf-lam'); if (el) el.textContent = eqState.lambda.toFixed(0);
  if (typeof _odUpdateThinFilmCursor === 'function') _odUpdateThinFilmCursor(); };

window.eqMatSelect = function(name) {
  eqState.mat = name;
  var def = OD_MATERIALS[name];
  if (def) {
    if (def.n0) eqState.n2 = def.n0;
    /* get current optical values from Drude/Lorentz engine */
    var o = _odOptical ? _odOptical(Math.max(eqState.E, 0.01), name) : null;
    if (o) { eqState.n2 = o.n; eqState.kappa = o.k; }
  }
  eqUpdateRibbon(); eqDrawActive();
  odSetMaterial(name);
};

function eqDrawActive() {
  if (eqState.screen === 'snell') eqDrawSnell();
  else if (eqState.screen === 'damping') eqDrawDamping();
  else if (eqState.screen === 'fresnel') eqDrawFresnel();
  else if (eqState.screen === 'thinfilm') eqDrawThinFilm();
}

/* ─── PULSE RESET ─── */
function eqResetSnellPulse() {
  if (eqState.snellPulse) { eqState.snellPulse.phase = 'idle'; }
}

/* ─── RESIZE GUARD ─── */
window.addEventListener('resize', function() { eqResizeSnell(); eqResizeDamping(); eqResizeFresnel(); eqResizeThinFilm(); eqDrawActive(); });

/* ─── INIT ALL EQUATION CANVASES ─── */
window.eqInitAll = function() {
  eqInitSnell(); eqInitDamping(); eqInitFresnel(); eqInitThinFilm();
  eqUpdateRibbon();
  eqSetScreen('thinfilm');
  /* auto-start animation */
  eqState.animating = true; lastT = 0;
  animId = requestAnimationFrame(eqAnimLoop);
};

/* ─── MATERIAL-CHANGE BRIDGE from od_sim.js ─── */
window.eqSyncFromMaterial = function(name, E) {
  eqState.mat = name; eqState.E = E;
  var o = _odOptical ? _odOptical(Math.max(E, 0.01), name) : null;
  if (o) { eqState.n2 = o.n; eqState.kappa = o.k; }
  eqUpdateRibbon(); eqDrawActive();
};

})();

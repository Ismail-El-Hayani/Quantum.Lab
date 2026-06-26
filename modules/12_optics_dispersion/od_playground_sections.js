/* ═══════════════════════════════════════════════════════════════
   od_playground_sections.js — Playground 7 sub-sections
   Step 1: Snell's Law + Fresnel Reflection 2D canvases
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ─── PER-SECTION LOCAL STATE — each section owns its own parameters ─── */
window.odSections = {
  snell:   { n1: 1.00, n2: 1.00, theta1: 30, lambda: 620 },
  fresnel: { n1: 1.00, n2: 1.00, theta1: 30, pol: 'both' }
};

/* ─── HELPER: degrees ↔ radians ─── */
function deg2rad(d) { return d * Math.PI / 180; }
function rad2deg(r) { return r * 180 / Math.PI; }

/* ─── HELPER: format number ─── */
function fmt(x, digits) {
  digits = digits || 2;
  var n = parseFloat(x);
  if (isNaN(n)) return '—';
  if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(2);
  return n.toFixed(digits);
}

/* ─── HELPER: safe getElementById ─── */
function $id(id) { return document.getElementById(id); }

/* ─── HELPER: safe textContent setter ─── */
function setText(id, text) {
  var el = $id(id);
  if (el) el.textContent = text;
}

/* ═══════════════════════════════════════════════════════════════
   1. SNELL'S LAW — 2D Canvas Renderer
   ───────────────────────────────────────────────────────────────
   Physics & governing equations
   ───────────────────────────────────────────────────────────────
     n₁ sinθ₁ = n₂ sinθ₂                                 Snell's law
     v = c/n                                             phase velocity in medium
     v = λ·f                                             wave relation
     k = n·k₀ = 2π/λ = ω/v                             wave vector in medium
     λ_medium = λ_vacuum/n                             wavelength changes across interface
     f = c/λ_vac = constant                            FREQUENCY is conserved across interface
     E = hf = hc/λ                                       photon energy conserved (no absorption)
     rₛ = (n₁cosθ₁ − n₂cosθ₂)/(n₁cosθ₁ + n₂cosθ₂)      Fresnel s-amplitude
     rₚ = (n₂cosθ₁ − n₁cosθ₂)/(n₂cosθ₁ + n₁cosθ₂)      Fresnel p-amplitude
     R = ½(|rₛ|² + |rₚ|²)                             unpolarised reflectance, T = 1−R
     Boundary condition: E-field must be continuous at the interface
   ───────────────────────────────────────────────────────────────
   WAVE COLOURS (pedagogical, fixed by ray type):
     incident  = yellow (#ffdd44)
     reflected = cyan   (#00f0ff)
     refracted = green  (#4ade80)
   ═══════════════════════════════════════════════════════════════ */

window.pgSnellN1 = function(v) {
  window.odSections.snell.n1 = parseFloat(v);
  setText('snell-val-n1', fmt(v));
  renderSnellPg();
};

window.pgSnellN2 = function(v) {
  window.odSections.snell.n2 = parseFloat(v);
  setText('snell-val-n2', fmt(v));
  renderSnellPg();
};

window.pgSnellTheta = function(v) {
  window.odSections.snell.theta1 = parseFloat(v);
  setText('snell-val-theta', v + '\u00b0');
  renderSnellPg();
};

window.pgSnellLambda = function(v) {
  window.odSections.snell.lambda = parseInt(v,10);
  setText('snell-val-lambda', v + ' nm');
  renderSnellPg();
};

/* ─── Core physics helpers ─── */
function snell_physics(n1,n2,th1){
  var s2 = (n1/n2)*Math.sin(th1);
  if(Math.abs(s2)>1) return { TIR:true, th2:Math.PI/2, sin2:1, cos2:0, cos1:Math.cos(th1) };
  var th2 = Math.asin(s2);
  return { TIR:false, th2:th2, sin2:s2, cos2:Math.cos(th2), cos1:Math.cos(th1) };
}

function fresnel_avg(n1,n2,c1,c2){
  var ds = n1*c1 + n2*c2;
  var dp = n2*c1 + n1*c2;
  var rs = (ds===0)? -1 : (n1*c1 - n2*c2)/ds;
  var rp = (dp===0)?  1 : (n2*c1 - n1*c2)/dp;
  var R  = 0.5*(rs*rs + rp*rp);
  return { rs:rs, rp:rp, R:R, T:1-R };
}

/* ─── Transverse wave train ─── */
function waveTrain(ctx, x0,y0, x1,y1, k, ampScale, phi, color, peakPx){
  var dx = x1-x0, dy = y1-y0;
  var L  = Math.sqrt(dx*dx + dy*dy);
  if(L<4) return;
  var nx = dx/L, ny = dy/L;
  var px = -ny, py = nx;
  var amp = peakPx * ampScale;
  var step = 1.5;

  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
  var first = true;
  for(var s=0; s<=L; s+=step){
    var d = amp * Math.sin(k*s - phi);
    ctx[first?'moveTo':'lineTo'](x0 + nx*s + px*d, y0 + ny*s + py*d);
    first = false;
  }
  ctx.stroke();
  ctx.globalAlpha = 0.12; ctx.lineWidth = 7; ctx.stroke();
  ctx.globalAlpha = 1.0;
}

/* ─── Arrow head ─── */
function arrowHead(ctx, x0,y0, x1,y1, col){
  var a  = Math.atan2(y1-y0, x1-x0);
  var L  = 8;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x1 - L*Math.cos(a-Math.PI/6), y1 - L*Math.sin(a-Math.PI/6));
  ctx.lineTo(x1 - L*Math.cos(a+Math.PI/6), y1 - L*Math.sin(a+Math.PI/6));
  ctx.closePath(); ctx.fill();
}

/* ─── Angle arc with outward label ─── */
function angleArc(ctx, cx,cy, r, thStart, thEnd, label, lCol, aCol){
  if(Math.abs(thEnd-thStart) < 0.07) thEnd = thStart + (thEnd>thStart ? 0.07 : -0.07);
  ctx.strokeStyle = aCol; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, r, thStart, thEnd, false); ctx.stroke();
  var mid = (thStart + thEnd) * 0.5;
  var lr = r + 18;
  var lx = cx + lr * Math.cos(mid);
  var ly = cy + lr * Math.sin(mid);
  ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  var tw = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(8,8,21,0.7)';
  ctx.fillRect(lx - tw*0.5 - 3, ly - 7, tw + 6, 14);
  ctx.fillStyle = lCol;
  ctx.fillText(label, lx, ly);
}

/* ─── Animation state ─── */
var snellAnimTime = 0;
var snellAnimId = null;

/* ─── Main render ─── */
function renderSnellPg(){
  var st = window.odSections.snell;
  var cnv = document.getElementById('snell-canvas');
  if(!cnv) return;
  var ctx = cnv.getContext('2d');
  var W = cnv.width, H = cnv.height;
  var cx = W/2, cy = H/2;
  var intY = cy;
  var rayLen = Math.min(W,H)*0.38;

  /* Background */
  ctx.fillStyle = '#080815';
  ctx.fillRect(0,0,W,H);

  /* Physics */
  var th1r = deg2rad(st.theta1);
  var ph   = snell_physics(st.n1, st.n2, th1r);
  var fr   = ph.TIR ? {R:1.0,T:0.0} : fresnel_avg(st.n1,st.n2,ph.cos1,ph.cos2);
  var w    = snellAnimTime * 0.08;

  var eV = 1240.0 / st.lambda;
  var lamInN1 = st.lambda / st.n1;
  var lamInN2 = st.lambda / st.n2;

  /* ═── Medium labels ──═ */
  ctx.font = '11px monospace';
  ctx.fillStyle = '#8899aa'; ctx.textAlign = 'right';
  ctx.fillText('n\u2081='+fmt(st.n1)+'  v\u2081='+(3.0/st.n1).toFixed(2)+'\u00d710\u2078 m/s', W-12, 18);
  ctx.fillText('\u03bb\u2081='+(lamInN1).toFixed(0)+' nm', W-12, 36);
  ctx.textAlign = 'left';
  ctx.fillText('n\u2082='+fmt(st.n2)+'  v\u2082='+(3.0/st.n2).toFixed(2)+'\u00d710\u2078 m/s', 12, H-10);
  ctx.fillText('\u03bb\u2082='+(ph.TIR?'\u2014':lamInN2.toFixed(0))+' nm', 12, H-28);
  ctx.fillStyle = '#ffdd44';
  ctx.fillText('E='+eV.toFixed(2)+' eV  \u03bb_vac='+st.lambda+' nm', 12, H-46);

  /* ═── Interface + Normal ──═ */
  ctx.strokeStyle = 'rgba(255,255,255,0.30)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0,intY); ctx.lineTo(W,intY); ctx.stroke();
  ctx.setLineDash([5,5]); ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();
  ctx.setLineDash([]);

  /* Wave parameters
     Scale factor chosen so λ₀ ≈ 100 px at 620 nm, giving ~6 visible periods in
     the ~380 px ray length.  As n rises, λ medium = λ vac / n shrinks on-canvas.
     This makes the wavelength slider visually obvious.  Equations:
        k medium = 2π / λ medium    = 2π n / λ vac        (nm⁻¹)
        λ medium = λ vac / n                                   */
  var pxPerNm = 0.16;
  var k1 = 2*Math.PI / (lamInN1 * pxPerNm);

  /* Phase at the interface (boundary continuity):
     All waves must share the same temporal phase at the interface.
        φ interface = −ω·t + k₁·s interface   (same for all three rays)
     The reflected wave gets a possible π phase flip from the Fresnel
     coefficient r sign, but at normal incidence both signs are handled
     by the global phase shift.  We keep the incident phase and apply
     consistent phase propagation away from the interface.
        E⊥(s,t) = A⊥ sin( k·s_interface − ω·t )     at s=0
        E reflected(s,t) = √R · sin( k₁·s_reflected − (ω·t + π·H(r)) )
        E transmitted(s,t) = √T · sin( k₂·s_transmitted − ω·t )
     Here we encode time through the animation variable w = 0.08·t.          */
  var phiInterface = w;

  /* Incident (yellow, amplitude = 1.0, phase propagates toward interface) */
  waveTrain(ctx,
            cx - rayLen*Math.sin(th1r), intY - rayLen*Math.cos(th1r),
            cx, intY, k1, 1.0, phiInterface, '#ffdd44', 10);
  arrowHead(ctx, cx-rayLen*Math.sin(th1r), intY-rayLen*Math.cos(th1r), cx, intY, '#ffdd44');

  /* Reflected (cyan, same spatial k₁, amp = √R, opposite propagation) */
  /* Phase continuity: reflected at interface must match incident at interface.
     Away from interface: phase = +k·s − φInterface (propagates s>0)       */
  if(rayLen * Math.sqrt(fr.R) > 5){
    waveTrain(ctx, cx, intY,
              cx + rayLen*Math.sin(th1r), intY - rayLen*Math.cos(th1r),
              k1, Math.sqrt(fr.R), phiInterface, '#00f0ff', 8);
  }
  arrowHead(ctx, cx, intY, cx+rayLen*Math.sin(th1r), intY-rayLen*Math.cos(th1r), '#00f0ff');

  /* Refracted (green, k₂ = k₁·(n₂/n₁), amp = √T, phase continuous at interface)
     Boundary condition: time-varying phase must match at z=0.
     Therefore all three waves share φInterface at the interface point.      */
  if(!ph.TIR){
    var k2 = k1 * (st.n2/st.n1);
    waveTrain(ctx, cx, intY,
              cx + rayLen*Math.sin(ph.th2), intY + rayLen*Math.cos(ph.th2),
              k2, Math.sqrt(fr.T), phiInterface, '#4ade80', 10);
    arrowHead(ctx, cx, intY, cx+rayLen*Math.sin(ph.th2), intY+rayLen*Math.cos(ph.th2), '#4ade80');
  }

  /* ═── Ray guide lines ──═ */
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255,221,68,0.22)';
  ctx.beginPath(); ctx.moveTo(cx-rayLen*Math.sin(th1r),intY-rayLen*Math.cos(th1r)); ctx.lineTo(cx,intY); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,240,255,0.22)';
  ctx.beginPath(); ctx.moveTo(cx,intY); ctx.lineTo(cx+rayLen*Math.sin(th1r),intY-rayLen*Math.cos(th1r)); ctx.stroke();
  if(!ph.TIR){
    ctx.strokeStyle = 'rgba(74,222,128,0.22)';
    ctx.beginPath(); ctx.moveTo(cx,intY); ctx.lineTo(cx+rayLen*Math.sin(ph.th2),intY+rayLen*Math.cos(ph.th2)); ctx.stroke();
  }

  /* ═── Angle arcs ──═ */
  var arcR = 32;
  angleArc(ctx, cx, intY, arcR, -Math.PI/2 - th1r, -Math.PI/2,
           '\u03b8\u2081='+st.theta1+'\u00b0', '#ffdd44', '#ffdd44');
  angleArc(ctx, cx, intY, arcR, -Math.PI/2, -Math.PI/2 + th1r,
           '\u03b8\u1d63='+st.theta1+'\u00b0', '#00f0ff', '#00f0ff');
  if(!ph.TIR){
    angleArc(ctx, cx, intY, arcR, Math.PI/2 - ph.th2, Math.PI/2,
             '\u03b8\u2082='+fmt(rad2deg(ph.th2),2)+'\u00b0', '#4ade80', '#4ade80');
  }

  /* TIR banner */
  if(ph.TIR){
    ctx.fillStyle = 'rgba(255,78,205,0.15)';
    ctx.fillRect(cx-125, intY+45, 250, 30);
    ctx.strokeStyle = '#ff4ecd'; ctx.lineWidth = 1;
    ctx.strokeRect(cx-125, intY+45, 250, 30);
    ctx.fillStyle = '#ff4ecd'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('TOTAL INTERNAL REFLECTION', cx, intY+65);
  }

  /* ═── Stats panel (top-left) ──═ */
  var t2text = ph.TIR ? 'TIR' : fmt(rad2deg(ph.th2),2)+'\u00b0';
  ctx.fillStyle = 'rgba(10,12,24,0.88)';
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1;
  var sx=12, sy=48, sw=176, sh=110;
  ctx.fillRect(sx,sy,sw,sh); ctx.strokeRect(sx,sy,sw,sh);

  ctx.font = '10px monospace'; ctx.textAlign = 'left';
  ctx.fillStyle = '#ffdd44';
  /* f = c/λ_vac = (3e8 m/s)/(λ·1e-9 m) → Hz, display in THz */
  var freqTHz = (299792.458 / st.lambda).toFixed(1);   /* c [nm/s] / λ [nm] → Hz → /1e12 for THz */
  ctx.fillText('\u03bb='+st.lambda+' nm  E='+eV.toFixed(2)+' eV', sx+8, sy+16);
  ctx.fillText('f='+freqTHz+' THz   n\u2081='+fmt(st.n1,2), sx+8, sy+30);
  ctx.fillStyle = '#8899aa';
  ctx.fillText('v\u2081='+fmt(3.0/st.n1,2)+'\u00d710\u2088 m/s', sx+8, sy+42);
  ctx.fillText('v\u2082='+fmt(3.0/st.n2,2)+'\u00d710\u2088 m/s', sx+8, sy+54);
  ctx.fillText('\u03bb\u2081='+lamInN1.toFixed(0)+' nm', sx+8, sy+66);
  ctx.fillText('\u03bb\u2082='+(ph.TIR?'\u2014':lamInN2.toFixed(0)+' nm'), sx+8, sy+78);
  ctx.fillStyle = '#00f0ff';
  ctx.fillText('\u03b8\u1d63='+st.theta1+'\u00b0', sx+92, sy+30);
  ctx.fillStyle = '#4ade80';
  ctx.fillText('\u03b8\u2082='+t2text, sx+92, sy+42);
  if(!ph.TIR){
    ctx.fillStyle = '#8899aa';
    ctx.fillText('sin='+fmt(Math.sin(ph.th2),3), sx+92, sy+54);
    ctx.fillText('cos='+fmt(Math.cos(ph.th2),3), sx+92, sy+66);
  } else {
    ctx.fillStyle = '#ff4ecd';
    ctx.fillText('TIR', sx+92, sy+54);
  }
  ctx.fillStyle = '#00f0ff';
  ctx.fillText('n\u2082/n\u2081='+fmt(st.n2/st.n1,3), sx+8, sy+90);
  ctx.fillText('R='+fmt(fr.R*100,1)+'%', sx+8, sy+102);
  ctx.fillText('T='+fmt(fr.T*100,1)+'%', sx+92, sy+102);
  ctx.fillStyle = '#8899aa'; ctx.font = '9px monospace';
  ctx.fillText('n\u2081sin\u03b8\u2081='+fmt(st.n1*Math.sin(th1r),3), sx+8, sy+114);
  ctx.fillText('n\u2082sin\u03b8\u2082='+fmt(ph.TIR?st.n1*Math.sin(th1r):st.n2*Math.sin(ph.th2),3), sx+92, sy+114);
  ctx.font = '10px monospace';

  /* ═── DOM readouts ──═ */
  var $id = function(id){ var el=document.getElementById(id); if(el) el.textContent = arguments[1]; };
  setText('snell-readout-theta2', t2text);
  setText('snell-readout-thetac', (st.n2<st.n1)? fmt(rad2deg(Math.asin(st.n2/st.n1)),2)+'\u00b0' : '\u2014');
  setText('snell-readout-lamvac', st.lambda+' nm');
  setText('snell-readout-lam1',  lamInN1.toFixed(0)+' nm');
  setText('snell-readout-lam2',  ph.TIR ? '\u2014' : lamInN2.toFixed(0)+' nm');
  setText('snell-readout-R', (fr.R*100).toFixed(1)+'%');
  setText('snell-readout-T', (fr.T*100).toFixed(1)+'%');
}

/* expose to global for re-render hooks */
window.renderSnellPg = renderSnellPg;

function snellLoop(){
  snellAnimTime += 1;
  renderSnellPg();
  snellAnimId = requestAnimationFrame(snellLoop);
}

window.initSnell = function(){
  renderSnellPg();
  if(!snellAnimId) snellLoop();
};
/* ═══════════════════════════════════════════════════════════════
   2. FRESNEL REFLECTION — 2D Canvas Renderer
   Physics
   ──────
   • Snell: n₁ sinθ₁ = n₂ sinθ₂  →  θ₂ = arcsin[(n₁/n₂) sinθ₁]
   • TIR when (n₁/n₂) sinθ₁ > 1  →  θ₂ = π/2, cosθ₂ = 0
   • Fresnel amplitude reflection coefficients:
     r_s = (n₁ cosθ₁ − n₂ cosθ₂) / (n₁ cosθ₁ + n₂ cosθ₂)
     r_p = (n₂ cosθ₁ − n₁ cosθ₂) / (n₂ cosθ₁ + n₁ cosθ₂)
   • Reflectance (intensity): R_s = |r_s|² ,  R_p = |r_p|²
   • Transmittance (no absorption): T = 1 − R_avg = 1 − ½(R_s + R_p)
   • Phase on reflection (non-TIR):
       rs < 0  →  Δφ_s = π    (external reflection, n₂ > n₁)
       rp < 0  →  Δφ_p = π    (depends on angle)
   • Phase on TIR (Goos-Hänchen):
       tan(δ_s/2) = √(sin²θ₁ − (n₂/n₁)²) / cosθ₁
       δ_s = 2 atan[ √(sin²θ₁ − (n₂/n₁)²) / cosθ₁ ]
   ── Canvas draws: incident ray (yellow), reflected ray (cyan, √R amplitude),
      transmitted ray (green, √T amplitude), amplitude bars for R_s, R_p, T.
   ═══════════════════════════════════════════════════════════════ */

window.pgFresnelN1 = function(v) {
  window.odSections.fresnel.n1 = parseFloat(v);
  document.getElementById('fresnel-val-n1').textContent = fmt(v);
  renderFresnel();
};

window.pgFresnelN2 = function(v) {
  window.odSections.fresnel.n2 = parseFloat(v);
  document.getElementById('fresnel-val-n2').textContent = fmt(v);
  renderFresnel();
};

window.pgFresnelTheta = function(v) {
  window.odSections.fresnel.theta1 = parseFloat(v);
  document.getElementById('fresnel-val-theta').textContent = v + '\u00b0';
  renderFresnel();
};

window.pgFresnelPol = function(v) {
  window.odSections.fresnel.pol = v;
  renderFresnel();
};

window.initFresnel = function() {
  renderFresnel();
  plotFresnelCoefficients();
};

/* expose to global for re-render hooks */
window.renderFresnel = renderFresnel;

function renderFresnel() {
  var st = window.odSections.fresnel;
  var canvas = document.getElementById('fresnel-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;

  // Clear
  ctx.fillStyle = '#080815';
  ctx.fillRect(0, 0, W, H);

  var cx = W / 2, cy = H / 2;
  var interfaceY = cy;
  var rayLen = Math.min(W, H) * 0.3;

  // Compute θ₂ from Snell
  var theta1 = deg2rad(st.theta1);
  var sinTheta2 = (st.n1 / st.n2) * Math.sin(theta1);
  var TIR = Math.abs(sinTheta2) > 1;
  var theta2 = TIR ? Math.PI/2 : Math.asin(sinTheta2);

  // Fresnel amplitude coefficients
  var cos1 = Math.cos(theta1);
  var cos2 = TIR ? 0 : Math.cos(theta2);

  // r_s = (n₁ cos θ₁ − n₂ cos θ₂) / (n₁ cos θ₁ + n₂ cos θ₂)
  var rs = (st.n1 * cos1 - st.n2 * cos2) / (st.n1 * cos1 + st.n2 * cos2);
  // r_p = (n₂ cos θ₁ − n₁ cos θ₂) / (n₂ cos θ₁ + n₁ cos θ₂)
  var rp = (st.n2 * cos1 - st.n1 * cos2) / (st.n2 * cos1 + st.n1 * cos2);

  // Handle TIR: both |r| = 1, but we need complex phases
  if (TIR) {
    rs = 1; rp = 1; // magnitude for display
  }

  var Rs = rs * rs;
  var Rp = rp * rp;
  var T = 1 - 0.5 * (Rs + Rp); // average T for display (non-absorbing)
  if (TIR) T = 0;

  // Draw interface
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, interfaceY);
  ctx.lineTo(W, interfaceY);
  ctx.stroke();

  // Normal (dashed)
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, H);
  ctx.stroke();
  ctx.setLineDash([]);

  // Incident ray (yellow)
  var x1i = cx - rayLen * Math.sin(theta1);
  var y1i = interfaceY - rayLen * Math.cos(theta1);
  ctx.strokeStyle = '#ffdd44';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x1i, y1i);
  ctx.lineTo(cx, interfaceY);
  ctx.stroke();
  arrowHead(ctx, x1i, y1i, cx, interfaceY, '#ffdd44');

  // Reflected ray (cyan, amplitude scaled by sqrt(R_avg))
  // R_avg = 0.5*(R_s + R_p);  reflected amplitude ∝ √R_avg
  var reflLen = rayLen * Math.sqrt(0.5 * (Rs + Rp));
  if (TIR) reflLen = rayLen;   // |r| = 1 on TIR → full amplitude
  var x1r = cx + reflLen * Math.sin(theta1);
  var y1r = interfaceY - reflLen * Math.cos(theta1);
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = TIR ? 2.5 : 1.5;   // thicker on TIR
  ctx.beginPath();
  ctx.moveTo(cx, interfaceY);
  ctx.lineTo(x1r, y1r);
  ctx.stroke();
  if (reflLen > 5) arrowHead(ctx, cx, interfaceY, x1r, y1r, '#00f0ff');

  if (!TIR) {
    // Refracted ray (green, amplitude scaled by sqrt(T))
    // T = 1 − R_avg  →  transmitted amplitude ∝ √T
    var transLen = rayLen * Math.sqrt(T);
    var x2r = cx + transLen * Math.sin(theta2);
    var y2r = interfaceY + transLen * Math.cos(theta2);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, interfaceY);
    ctx.lineTo(x2r, y2r);
    ctx.stroke();
    if (transLen > 5) arrowHead(ctx, cx, interfaceY, x2r, y2r, '#4ade80');
  }

  // Draw amplitude bars on the right
  var barX = W - 90;
  var barW = 60;
  var barBaseY = interfaceY - 60;
  var barMaxH = 80;

  // Label
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8899aa';
  ctx.fillText('Reflectance', barX + barW/2, barBaseY - 5);

  // R_s bar (pink)
  var hS = barMaxH * Rs;
  ctx.fillStyle = 'rgba(255,78,205,0.3)';
  ctx.strokeStyle = '#ff4ecd';
  ctx.lineWidth = 1;
  ctx.fillRect(barX, barBaseY - hS, barW/2 - 2, hS);
  ctx.strokeRect(barX, barBaseY - hS, barW/2 - 2, hS);
  ctx.fillStyle = '#ff4ecd';
  ctx.textAlign = 'center';
  ctx.fillText('s', barX + barW/4 - 1, barBaseY + 14);

  // R_p bar (green)
  var hP = barMaxH * Rp;
  ctx.fillStyle = 'rgba(74,222,128,0.3)';
  ctx.strokeStyle = '#4ade80';
  ctx.fillRect(barX + barW/2 + 2, barBaseY - hP, barW/2 - 2, hP);
  ctx.strokeRect(barX + barW/2 + 2, barBaseY - hP, barW/2 - 2, hP);
  ctx.fillStyle = '#4ade80';
  ctx.fillText('p', barX + 3*barW/4 + 1, barBaseY + 14);

  // T bar below (cyan)
  var hT = barMaxH * T;
  ctx.fillStyle = 'rgba(0,240,255,0.2)';
  ctx.strokeStyle = '#00f0ff';
  ctx.fillRect(barX, barBaseY + 25, barW, hT);
  ctx.strokeRect(barX, barBaseY + 25, barW, hT);
  ctx.fillStyle = '#00f0ff';
  ctx.fillText('T = ' + fmt(T, 3), barX + barW/2, barBaseY + 25 + hT + 14);

  // Update readouts
  var elRs = document.getElementById('fresnel-readout-Rs');
  var elRp = document.getElementById('fresnel-readout-Rp');
  var elT  = document.getElementById('fresnel-readout-T');
  var elPh = document.getElementById('fresnel-readout-phase');
  if (elRs) elRs.textContent = TIR ? '1.000' : fmt(Rs, 4);
  if (elRp) elRp.textContent = TIR ? '1.000' : fmt(Rp, 4);
  if (elT)  elT.textContent  = TIR ? '0.000' : fmt(T, 4);
  if (elPh) {
    if (TIR) {
      // Phase shift on TIR: tan(δ_s/2) = sqrt(sin²θ₁ - (n₂/n₁)²) / cosθ₁
      var nRatio = st.n2 / st.n1;
      var tanDelta = Math.sqrt(Math.sin(theta1)*Math.sin(theta1) - nRatio*nRatio) / cos1;
      var delta = 2 * Math.atan(tanDelta);
      elPh.textContent = fmt(rad2deg(delta), 1) + '°';
    } else {
      // Phase is 0 or π depending on sign of r
      var phaseS = rs < 0 ? 'π' : '0';
      var phaseP = rp < 0 ? 'π' : '0';
      elPh.textContent = 's:' + phaseS + ' p:' + phaseP;
    }
  }

  /* Re-plot sweep curve with vertical cursor at current θ₁ */
  plotFresnelCoefficients();
}

/* ═══════════════════════════════════════════════════════════════
   2b. FRESNEL PLOT — Plotly dual-panel (signed amplitude + intensity)
   Physics
   ──────
   Sweep θ₁ from 0° → 90°:
     sinθ₂ = (n₁/n₂) sinθ₁
     TIR if sinθ₂ > 1
     cosθ₁ = cos(θ₁),  cosθ₂ = √(1 − sin²θ₂)  (real for non-TIR, imaginary for TIR)
     r_s(θ₁) = (n₁ cosθ₁ − n₂ cosθ₂) / (n₁ cosθ₁ + n₂ cosθ₂)
     r_p(θ₁) = (n₂ cosθ₁ − n₁ cosθ₂) / (n₂ cosθ₁ + n₁ cosθ₂)
     R_s(θ₁) = |r_s|² ,  R_p(θ₁) = |r_p|²
     T(θ₁) = 1 − ½(R_s + R_p)
   Top panel: signed amplitude coefficients r_s, r_p
   Bottom panel: intensity R_s, R_p, T
   Vertical cursor marks current θ₁.
   ═══════════════════════════════════════════════════════════════ */

function plotFresnelCoefficients() {
  var st = window.odSections.fresnel;
  var N = 181;   // 0.5° steps
  var thDeg = [];
  var rsData = [], rpData = [];
  var RsData = [], RpData = [], Tdata = [];

  for (var i = 0; i <= N; i++) {
    var d = i * 90 / N;
    thDeg.push(d);
    var th1 = deg2rad(d);
    var sin2 = (st.n1 / st.n2) * Math.sin(th1);
    var TIR = Math.abs(sin2) > 1;
    var cos1 = Math.cos(th1);
    var cos2 = TIR ? 0 : Math.sqrt(1 - sin2*sin2);

    // r_s = (n₁ cosθ₁ − n₂ cosθ₂)/(n₁ cosθ₁ + n₂ cosθ₂)
    var rs = (st.n1 * cos1 - st.n2 * cos2) / (st.n1 * cos1 + st.n2 * cos2);
    // r_p = (n₂ cosθ₁ − n₁ cosθ₂)/(n₂ cosθ₁ + n₁ cosθ₂)
    var rp = (st.n2 * cos1 - st.n1 * cos2) / (st.n2 * cos1 + st.n1 * cos2);

    if (TIR) {
      // Complex r on TIR — display magnitude = 1 with sign from real part
      rs = cos1 > 0 ? 1 : -1;
      rp = cos1 > 0 ? 1 : -1;
    }

    var Rs = rs * rs;
    var Rp = rp * rp;
    var Tavg = 1 - 0.5 * (Rs + Rp);
    if (TIR) Tavg = 0;

    rsData.push(rs);
    rpData.push(rp);
    RsData.push(Rs);
    RpData.push(Rp);
    Tdata.push(Tavg);
  }

  var curTheta = st.theta1;

  // ═══════════════════════════════════════════════════════════════
  //  Top panel — Amplitude coefficients
  // ═══════════════════════════════════════════════════════════════
  var traceRS = { x: thDeg, y: rsData, mode: 'lines', name: 'r_s (s-pol)',
                  line: { color: '#ff4ecd', width: 2 } };
  var traceRP = { x: thDeg, y: rpData, mode: 'lines', name: 'r_p (p-pol)',
                  line: { color: '#4ade80', width: 2, dash: 'dash' } };

  var shapesAmp = [
    { type: 'line', x0: curTheta, x1: curTheta, y0: -1.2, y1: 1.2,
      line: { color: '#ffffff', width: 1, dash: 'dash' } }
  ];

  var layoutAmp = {
    title: { text: 'Fresnel Amplitude Coefficients', font: { color: '#fff', size: 14 } },
    xaxis: { title: { text: 'Angle θ₁ (°)', font: { color: '#aaa' } },
             tickfont: { color: '#aaa' }, gridcolor: 'rgba(255,255,255,0.08)',
             range: [0, 90], dtick: 10, tickmode: 'linear',
             tickvals: [0,10,20,30,40,50,60,70,80,90] },
    yaxis: { title: { text: 'Amplitude coefficient r', font: { color: '#aaa' } },
             tickfont: { color: '#aaa' }, gridcolor: 'rgba(255,255,255,0.08)',
             range: [-1.2, 1.2], tickvals: [-1, -0.5, 0, 0.5, 1] },
    paper_bgcolor: '#0c1220',
    plot_bgcolor: '#080815',
    font: { color: '#ccc' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(8,8,21,0.7)',
              bordercolor: 'rgba(255,255,255,0.1)', borderwidth: 1 },
    margin: { l: 60, r: 30, t: 50, b: 50 },
    shapes: shapesAmp,
    hovermode: 'x unified'
  };

  Plotly.newPlot('fresnel-plot-amp', [traceRS, traceRP], layoutAmp,
                 { responsive: true, displayModeBar: false });

  // ═══════════════════════════════════════════════════════════════
  //  Bottom panel — Intensity coefficients
  // ═══════════════════════════════════════════════════════════════
  var traceRsI = { x: thDeg, y: RsData, mode: 'lines', name: 'R_s',
                   line: { color: '#ff4ecd', width: 2 } };
  var traceRpI = { x: thDeg, y: RpData, mode: 'lines', name: 'R_p',
                   line: { color: '#4ade80', width: 2, dash: 'dash' } };
  var traceT   = { x: thDeg, y: Tdata,   mode: 'lines', name: 'T',
                   line: { color: '#00f0ff', width: 2, dash: 'dot' } };

  var shapesInt = [
    { type: 'line', x0: curTheta, x1: curTheta, y0: 0, y1: 1.05,
      line: { color: '#ffffff', width: 1, dash: 'dash' } }
  ];

  var layoutInt = {
    title: { text: 'Reflectance & Transmittance', font: { color: '#fff', size: 14 } },
    xaxis: { title: { text: 'Angle θ₁ (°)', font: { color: '#aaa' } },
             tickfont: { color: '#aaa' }, gridcolor: 'rgba(255,255,255,0.08)',
             range: [0, 90], dtick: 10, tickmode: 'linear',
             tickvals: [0,10,20,30,40,50,60,70,80,90] },
    yaxis: { title: { text: 'Reflectance / Transmittance', font: { color: '#aaa' } },
             tickfont: { color: '#aaa' }, gridcolor: 'rgba(255,255,255,0.08)',
             range: [0, 1.05], tickvals: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    paper_bgcolor: '#0c1220',
    plot_bgcolor: '#080815',
    font: { color: '#ccc' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(8,8,21,0.7)',
              bordercolor: 'rgba(255,255,255,0.1)', borderwidth: 1 },
    margin: { l: 60, r: 30, t: 50, b: 50 },
    shapes: shapesInt,
    hovermode: 'x unified'
  };

  Plotly.newPlot('fresnel-plot-int', [traceRsI, traceRpI, traceT], layoutInt,
                 { responsive: true, displayModeBar: false });
}

/* ═══════════════════════════════════════════════════════════════
   Attenuation section — slider callbacks wired to skin-depth engine
   ═══════════════════════════════════════════════════════════════ */

window.pgAttenuationE = function(v) {
  /* Update shared state: E [eV] drives wavelength λ = hc/E and skin depth δ = λ/(4πκ) */
  odState.E = parseFloat(v);
  document.getElementById('atten-val-E').textContent = fmt(odState.E);
  /* Redraw skin-depth envelope: I(z) = I₀·exp(−2αz) with α = 4πκ/λ; redraw comparison bar plot */
  if (typeof _odDrawSkinAtten === 'function') _odDrawSkinAtten();
  if (typeof _odUpdateSkinReadout === 'function') _odUpdateSkinReadout();
  if (typeof _odUpdateSkinPlot === 'function') _odUpdateSkinPlot();
};

window.pgAttenuationN = function(v) {
  /* Override refractive index n used for skin-depth wave number k = 2π·n/λ.
     Does NOT change material's intrinsic absorbance κ (from database); only lets the
     user see how the real phase velocity v = c/n changes the oscillation frequency
     inside the material while keeping the same envelope e^(−z/δ).  */
  odState.n = parseFloat(v);
  var el = document.getElementById('atten-val-n');
  if (el) el.textContent = fmt(odState.n);
  if (typeof _odUpdateSkinReadout === 'function') _odUpdateSkinReadout();
  if (typeof _odUpdateSkinPlot === 'function') _odUpdateSkinPlot();
};

/* ─── Attenuation init ─── */
function initAttenuation() {
  /* Resolve 2D canvas context for skin-depth drawing; engine lives in od_sim.js */
  var cv = document.getElementById('skin-canvas');
  if (cv && typeof _odSkinCanvas !== 'undefined') { _odSkinCanvas = cv; _odSkinCtx = cv.getContext('2d'); }
  if (typeof _odDrawSkinAtten === 'function') _odDrawSkinAtten(0);
  if (typeof _odUpdateSkinReadout === 'function') _odUpdateSkinReadout();
  if (typeof _odInitSkinPlot === 'function') _odInitSkinPlot();
}

/* ═══════════════════════════════════════════════════════════════
   INITIALISATION — called by index.html on DOMContentLoaded
   ═══════════════════════════════════════════════════════════════ */

window.initPlaygroundSections = function() {
  initSnell();
  initFresnel();
  initAttenuation();
};

})();

/**
 * Laser Physics — Interactive Cavity Engine (v5, PDF-corrected)
 * Real-time Canvas photon animation with correct physics:
 *   semiconductor heterojunctions, gas discharge tubes, Brewster windows,
 *   quantum-well DOS inset, scale bar, and material-specific cavity styles.
 */
'use strict';

var lpState = {
  Eg: 1.42,
  L: 2000,       // nm
  n: 3.5,
  R: 0.30,
  alpha: 100,
  pumping: 1.5,
  material: 'GaAs',
  cavityStyle: 'semiconductor'  // 'semiconductor' | 'gas' | 'dilute_nitride'
};

var LP_MATERIALS = {
  'GaAs':      { Eg: 1.42, n: 3.5, label: 'GaAs (870 nm)',  type: 'semiconductor' },
  'InGaAsP':   { Eg: 0.80, n: 3.4, label: 'InGaAsP (1550 nm)', type: 'semiconductor' },
  'GaN':       { Eg: 3.40, n: 2.4, label: 'GaN (405 nm)',   type: 'semiconductor' },
  'CO2':       { Eg: 0.117,n: 1.0, label: 'CO₂ (10.6 µm)',  type: 'gas' },
  'HeNe':      { Eg: 1.96, n: 1.0, label: 'HeNe (633 nm)',  type: 'gas' },
  'GaInNAsSb': { Eg: 0.95, n: 3.6, label: 'GaInNAs(Sb) (1300 nm)', type: 'dilute_nitride' }
};

/* ---------- Canvas engine ---------- */
var LP_CANVAS = {
  c: null, ctx: null,
  photons: [],
  frame: 0,
  running: false,
  raf: null,
  width: 0, height: 0,
  cavityX: 0, cavityW: 0, cavityY: 0, cavityH: 0,
  mirrorW: 6,
  scaleNmPerPx: 1
};

function lpInitCanvas() {
  var c = document.getElementById('laser-canvas');
  if (!c) { return false; }
  LP_CANVAS.c = c;
  LP_CANVAS.ctx = c.getContext('2d');
  lpResizeCanvas();
  window.addEventListener('resize', lpResizeCanvas);
  return true;
}

function lpResizeCanvas() {
  var wrap = document.querySelector('.cavity-wrap');
  if (!wrap || !LP_CANVAS.c) return;
  var w = wrap.clientWidth;
  var h = 380;
  LP_CANVAS.c.width = w;
  LP_CANVAS.c.height = h;
  LP_CANVAS.width = w;
  LP_CANVAS.height = h;
  lpUpdateGeometry();
}

function lpUpdateGeometry() {
  var w = LP_CANVAS.width;
  var h = LP_CANVAS.height;
  var padX = 70, padY = 55;
  var availW = w - padX * 2;
  var availH = h - padY * 2;
  var maxL = 10000; // nm
  var minL = 500;
  var l = Math.max(minL, Math.min(maxL, lpState.L));
  var pxPerNm = availW / maxL;
  LP_CANVAS.cavityW = l * pxPerNm;
  LP_CANVAS.cavityX = (w - LP_CANVAS.cavityW) / 2;
  LP_CANVAS.cavityH = Math.min(availH, 140);
  LP_CANVAS.cavityY = (h - LP_CANVAS.cavityH) / 2;
  LP_CANVAS.scaleNmPerPx = Math.round(l / LP_CANVAS.cavityW);
}

function laserWavelength(Eg_eV) { return 1240 / Eg_eV; }

function thresholdGain(alpha_cm, R, L_nm) {
  var L_cm = L_nm * 1e-7;
  return alpha_cm + (1 / (2 * L_cm)) * Math.log(1 / (R * R));
}

/* ---------- Photon physics ---------- */
function lpPhotonColor(type) {
  if (type === 'stim') return '#00f0ff';
  if (type === 'output') return '#ffd54f';
  return '#ffffff';
}

function lpPhotonRadius(type) { return type === 'output' ? 2.8 : 2; }

function lpSpawnSpontaneous() {
  var geo = LP_CANVAS;
  var x = geo.cavityX + geo.mirrorW + Math.random() * (geo.cavityW - 2 * geo.mirrorW);
  var y = geo.cavityY + Math.random() * geo.cavityH;
  var speed = 1.5 + Math.random() * 1.0;
  var angle;
  if (lpState.cavityStyle === 'gas') {
    // Gas tube: mostly axial (horizontal) spontaneous, small vertical spread
    angle = (Math.random() - 0.5) * 0.35;
  } else {
    angle = Math.random() * Math.PI * 2;
  }
  geo.photons.push({
    x: x, y: y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    type: 'spont',
    born: geo.frame,
    life: 0,
    pol: (Math.random() > 0.5 ? 'p' : 's')  // polarization: p=parallel, s=perpendicular
  });
}

function lpSpawnStimulated(parent) {
  var geo = LP_CANVAS;
  var spread = (Math.random() - 0.5) * 0.1;
  var angle = Math.atan2(parent.vy, parent.vx) + spread;
  var speed = Math.sqrt(parent.vx * parent.vx + parent.vy * parent.vy);
  geo.photons.push({
    x: parent.x, y: parent.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    type: 'stim',
    born: geo.frame,
    life: 0,
    pol: parent.pol || 'p'
  });
}

function lpIsInsideCavity(px, py) {
  var g = LP_CANVAS;
  return px >= g.cavityX + g.mirrorW && px <= g.cavityX + g.cavityW - g.mirrorW &&
         py >= g.cavityY && py <= g.cavityY + g.cavityH;
}

function lpUpdatePhotons() {
  var geo = LP_CANVAS;
  var g = lpState;
  var photons = geo.photons;
  var newPhotons = [];

  var pump = g.pumping;
  var n2 = Math.min(pump, 3.0);
  var n1 = 1.0;
  var inverted = n2 > n1;
  var excess = Math.max(0, n2 - n1);
  var totalN = n1 + n2;

  // Spontaneous emission rate
  var spontRate = 0.015 + 0.02 * (n2 / totalN);
  if (Math.random() < spontRate) lpSpawnSpontaneous();

  for (var i = 0; i < photons.length; i++) {
    var p = photons[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life++;

    // Top/bottom walls: reflect
    if (p.y <= geo.cavityY || p.y >= geo.cavityY + geo.cavityH) {
      p.vy = -p.vy;
      p.y = Math.max(geo.cavityY, Math.min(p.y, geo.cavityY + geo.cavityH));
    }

    // Left mirror — PARTIAL: this is the polished output facet
    if (p.x <= geo.cavityX + geo.mirrorW) {
      if (Math.random() < g.R) {
        p.vx = Math.abs(p.vx);
        p.x = geo.cavityX + geo.mirrorW + 1;
      } else {
        // Transmit → output beam (emerges from polished end, left)
        p.type = 'output';
        p.vx = -Math.abs(p.vx) * 1.4;
        p.x = geo.cavityX - 2;
      }
    }

    // Lens collimation: output photons passing through the lens zone get vy damped toward 0
    if (p.type === 'output' && p.vx < 0) {
      var lensL = geo.cavityX - 42;
      var lensR = geo.cavityX - 12;
      if (p.x >= lensL && p.x <= lensR) {
        // Gradually straighten the beam as it leaves the lens
        p.vy *= 0.88;
        // Slight boost in forward speed for visual punch
        p.vx *= 1.012;
      }
    }

    // Right mirror — HIGH REFLECTOR: photons recycle back into medium
    if (p.x >= geo.cavityX + geo.cavityW - geo.mirrorW) {
      if (Math.random() < g.R) {
        p.vx = -Math.abs(p.vx);
        p.x = geo.cavityX + geo.cavityW - geo.mirrorW - 1;
      } else {
        // Lost at HR end (small leakage)
        continue;
      }
    }

    // Absorption inside medium
    if (lpIsInsideCavity(p.x, p.y)) {
      var absProb = g.alpha / 5000;
      if (Math.random() < absProb) continue;
    }

    // Stimulated emission: inverted + inside cavity + not already output
    if (inverted && lpIsInsideCavity(p.x, p.y) && p.type !== 'output') {
      var stimProb = 0.03 * excess * (p.type === 'stim' ? 1.3 : 0.6);
      if (Math.random() < stimProb) {
        lpSpawnStimulated(p);
      }
    }

    // Cull far / old
    if (p.x > geo.width + 60 || p.x < -60 || p.y < -60 || p.y > geo.height + 60) continue;
    if (p.life > 600) continue;

    newPhotons.push(p);
  }

  geo.photons = newPhotons;
  if (geo.photons.length > 350) {
    geo.photons = geo.photons.slice(geo.photons.length - 350);
  }
}

/* ---------- Drawing core ---------- */
function lpDraw() {
  var geo = LP_CANVAS;
  var ctx = geo.ctx;
  if (!ctx) return;
  var w = geo.width, h = geo.height;

  // Dark background
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, w, h);

  // Subtle grid
  ctx.strokeStyle = '#13131f';
  ctx.lineWidth = 1;
  for (var gx = 0; gx < w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
  for (var gy = 0; gy < h; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

  var cx = geo.cavityX, cy = geo.cavityY, cw = geo.cavityW, ch = geo.cavityH;
  var style = lpState.cavityStyle;

  if (style === 'gas') {
    lpDrawGasCavity(ctx, cx, cy, cw, ch);
  } else {
    lpDrawSemiconductorCavity(ctx, cx, cy, cw, ch, style === 'dilute_nitride');
  }

  lpDrawPhotons(ctx);
  lpDrawScaleBar(ctx, w, h);
  lpDrawLensFlare(ctx);
}

/* Semiconductor / dilute-nitride cavity — diagrammatic cross-section */
function lpDrawCavityLayers(ctx, innerX, innerW, subY, substrateH, pY, pTypeH, actY, activeH, nY, nTypeH, isQW) {
  // Substrate
  ctx.fillStyle = '#2a2a35';
  ctx.fillRect(innerX, subY, innerW, substrateH);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(innerX, subY, innerW, substrateH);
  ctx.fillStyle = 'rgba(200,200,210,0.4)';
  ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Substrate', innerX + innerW / 2, subY + substrateH / 2 + 3);
  // p-type
  ctx.fillStyle = 'rgba(59,130,246,0.22)';
  ctx.fillRect(innerX, pY, innerW, pTypeH);
  ctx.strokeStyle = 'rgba(59,130,246,0.35)';
  ctx.strokeRect(innerX, pY, innerW, pTypeH);
  ctx.fillStyle = 'rgba(200,220,255,0.7)';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('p-type', innerX + innerW / 2, pY + pTypeH / 2 + 3);
  // Active region
  ctx.fillStyle = isQW ? 'rgba(250,204,21,0.35)' : 'rgba(74,222,128,0.25)';
  ctx.fillRect(innerX, actY, innerW, activeH);
  ctx.strokeStyle = isQW ? 'rgba(250,204,21,0.5)' : 'rgba(74,222,128,0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(innerX, actY, innerW, activeH);
  ctx.fillStyle = 'rgba(255,255,220,0.8)';
  ctx.font = '9px sans-serif';
  var actLabel = isQW ? 'Quantum well (GaInNAs)' : 'Active region';
  ctx.fillText(actLabel, innerX + innerW / 2, actY + activeH / 2 + 3);
  // n-type
  ctx.fillStyle = 'rgba(239,68,68,0.20)';
  ctx.fillRect(innerX, nY, innerW, nTypeH);
  ctx.strokeStyle = 'rgba(239,68,68,0.35)';
  ctx.strokeRect(innerX, nY, innerW, nTypeH);
  ctx.fillStyle = 'rgba(255,220,220,0.8)';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('n-type', innerX + innerW / 2, nY + nTypeH / 2 + 3);
}

function lpDrawZigzagPath(ctx, innerX, innerW, actY, activeH) {
  ctx.strokeStyle = 'rgba(250,204,21,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  var zzX = innerX + innerW * 0.15;
  var zzRight = innerX + innerW * 0.85;
  var zzYmid = actY + activeH / 2;
  var zzAmp = activeH * 1.2;
  ctx.moveTo(zzX, zzYmid);
  var zzStep = (zzRight - zzX) / 8;
  for (var z = 1; z <= 8; z++) {
    ctx.lineTo(zzX + z * zzStep, zzYmid + (z % 2 === 0 ? zzAmp : -zzAmp));
  }
  ctx.stroke();
  for (var z2 = 0; z2 <= 8; z2++) {
    var zx = zzX + z2 * zzStep;
    var zy = zzYmid + (z2 % 2 === 0 ? 0 : (z2 % 2 === 1 ? -zzAmp : zzAmp));
    ctx.beginPath(); ctx.arc(zx, zy, 2, 0, Math.PI * 2); ctx.fillStyle = '#facc15'; ctx.fill();
  }
}

function lpDrawMirrorsAndFacet(ctx, cx, cy, cw, ch, pad) {
  ctx.fillStyle = 'rgba(250,204,21,0.15)';
  ctx.fillRect(cx, cy, pad, ch);
  ctx.fillStyle = 'rgba(255,255,200,0.6)';
  ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Polished facet', cx + pad / 2, cy - 8);
  ctx.fillStyle = 'rgba(255,78,205,0.45)';
  ctx.fillRect(cx, cy, pad, ch);
  ctx.fillRect(cx + cw - pad, cy, pad, ch);
  ctx.fillStyle = '#ff4ecd';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillText('R≈' + lpState.R.toFixed(2), cx + pad / 2, cy + ch + 14);
  ctx.fillText('Facet', cx + cw - pad / 2, cy + ch + 14);
}

function lpDrawContacts(ctx, innerX, innerW, nY, nTypeH, subY, substrateH) {
  var contactR = 5;
  var negX = innerX + innerW + 12;
  var negY = nY + nTypeH / 2;
  ctx.strokeStyle = 'rgba(180,180,200,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerX + innerW, negY); ctx.lineTo(negX, negY); ctx.lineTo(negX, negY + 30); ctx.stroke();
  ctx.beginPath(); ctx.arc(innerX + innerW, negY, contactR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(180,180,200,0.3)'; ctx.fill();
  ctx.strokeStyle = 'rgba(180,180,200,0.5)'; ctx.stroke();
  ctx.fillStyle = 'rgba(200,200,220,0.6)';
  ctx.font = '9px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('−ve', negX + 4, negY + 4);
  var posX = innerX + innerW + 12;
  var posY = subY + substrateH / 2;
  ctx.beginPath();
  ctx.moveTo(innerX + innerW, posY); ctx.lineTo(posX, posY); ctx.lineTo(posX, posY - 30); ctx.stroke();
  ctx.beginPath(); ctx.arc(innerX + innerW, posY, contactR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(180,180,200,0.3)'; ctx.fill();
  ctx.strokeStyle = 'rgba(180,180,200,0.5)'; ctx.stroke();
  ctx.fillStyle = 'rgba(200,200,220,0.6)';
  ctx.fillText('+ve', posX + 4, posY + 4);
}

function lpDrawCollimatingLens(ctx, cx, cy, ch) {
  var lensW = 20, lensH = ch * 0.65;
  var lensX = cx - 38;
  var lensY = cy + (ch - lensH) / 2;
  ctx.fillStyle = 'rgba(80,200,255,0.12)';
  ctx.strokeStyle = 'rgba(100,220,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lensX + lensW / 2, lensY);
  ctx.bezierCurveTo(lensX - 3, lensY + lensH * 0.15, lensX - 3, lensY + lensH * 0.85, lensX + lensW / 2, lensY + lensH);
  ctx.bezierCurveTo(lensX + lensW + 3, lensY + lensH * 0.85, lensX + lensW + 3, lensY + lensH * 0.15, lensX + lensW / 2, lensY);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(lensX + 6, lensY + 8); ctx.lineTo(lensX + 14, lensY + lensH - 8);
  ctx.strokeStyle = 'rgba(180,240,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(160,220,255,0.6)';
  ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Collimating lens', lensX + lensW / 2, lensY - 6);
}

function lpDrawOutputBeam(ctx, cx, cy, ch) {
  var beamY = cy + ch / 2;
  ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2;
  for (var a = -1; a <= 1; a++) {
    ctx.beginPath();
    ctx.moveTo(cx - 8, beamY + a * 6); ctx.lineTo(cx - 40, beamY + a * 6); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 40, beamY + a * 6);
    ctx.lineTo(cx - 32, beamY + a * 6 - 3); ctx.lineTo(cx - 32, beamY + a * 6 + 3);
    ctx.fillStyle = '#facc15'; ctx.fill();
  }
  ctx.fillStyle = '#facc15';
  ctx.font = '9px sans-serif'; ctx.textAlign = 'right';
  ctx.fillText('Coherent light →', cx - 44, beamY + 3);
}

function lpDrawCavityLabels(ctx, cx, cy, ch, actY, activeH, isQW) {
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '9px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Junction', cx + 4, actY - 3);
  ctx.fillStyle = 'rgba(255,255,200,0.5)';
  ctx.fillText('Light emerges from polished end', cx + 4, cy + ch + 28);
  if (isQW) lpDrawDOSInset(ctx, LP_CANVAS.width - 140, 12);
}

function lpDrawSemiconductorCavity(ctx, cx, cy, cw, ch, isQW) {
  var geo = LP_CANVAS;
  var pad = geo.mirrorW;
  var innerX = cx + pad, innerW = cw - 2 * pad;
  var substrateH = ch * 0.20, pTypeH = ch * 0.30;
  var activeH = isQW ? 8 : ch * 0.08;
  var nTypeH = ch - substrateH - pTypeH - activeH;
  var subY = cy + ch - substrateH, pY = cy + nTypeH + activeH;
  var actY = cy + nTypeH, nY = cy;

  lpDrawCavityLayers(ctx, innerX, innerW, subY, substrateH, pY, pTypeH, actY, activeH, nY, nTypeH, isQW);
  lpDrawZigzagPath(ctx, innerX, innerW, actY, activeH);
  lpDrawMirrorsAndFacet(ctx, cx, cy, cw, ch, pad);
  lpDrawContacts(ctx, innerX, innerW, nY, nTypeH, subY, substrateH);
  lpDrawCollimatingLens(ctx, cx, cy, ch);
  lpDrawOutputBeam(ctx, cx, cy, ch);
  lpDrawCavityLabels(ctx, cx, cy, ch, actY, activeH, isQW);
}

/* Gas discharge tube cavity */
function lpDrawGasCavity(ctx, cx, cy, cw, ch) {
  var geo = LP_CANVAS;

  // Tube body
  ctx.fillStyle = 'rgba(180,210,255,0.06)';
  ctx.fillRect(cx + geo.mirrorW, cy, cw - 2 * geo.mirrorW, ch);

  // Cylinder shading (top/bottom)
  var grad = ctx.createLinearGradient(0, cy, 0, cy + ch);
  grad.addColorStop(0, 'rgba(180,210,255,0.15)');
  grad.addColorStop(0.5, 'rgba(180,210,255,0.02)');
  grad.addColorStop(1, 'rgba(180,210,255,0.15)');
  ctx.fillStyle = grad;
  ctx.fillRect(cx + geo.mirrorW, cy, cw - 2 * geo.mirrorW, ch);

  // Tube outline
  ctx.strokeStyle = 'rgba(180,210,255,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx + geo.mirrorW, cy, cw - 2 * geo.mirrorW, ch);

  // Brewster windows (angled facets near mirrors)
  var bwW = 14;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.moveTo(cx + geo.mirrorW, cy);
  ctx.lineTo(cx + geo.mirrorW + bwW, cy + ch);
  ctx.lineTo(cx + geo.mirrorW, cy + ch);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + cw - geo.mirrorW, cy);
  ctx.lineTo(cx + cw - geo.mirrorW - bwW, cy + ch);
  ctx.lineTo(cx + cw - geo.mirrorW, cy + ch);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.moveTo(cx + geo.mirrorW, cy); ctx.lineTo(cx + geo.mirrorW + bwW, cy + ch); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + cw - geo.mirrorW, cy); ctx.lineTo(cx + cw - geo.mirrorW - bwW, cy + ch); ctx.stroke();

  // Labels
  ctx.fillStyle = 'rgba(200,220,255,0.6)';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Brewster', cx + geo.mirrorW + bwW / 2, cy - 8);
  ctx.fillText('Gas discharge', cx + cw / 2, cy + ch + 16);

  // Mirrors
  ctx.fillStyle = 'rgba(255,78,205,0.5)';
  ctx.fillRect(cx, cy, geo.mirrorW, ch);
  ctx.fillRect(cx + cw - geo.mirrorW, cy, geo.mirrorW, ch);
  ctx.fillStyle = '#ff4ecd';
  ctx.fillText('OC', cx + geo.mirrorW / 2, cy - 10);
  ctx.fillText('HR', cx + cw - geo.mirrorW / 2, cy - 10);

  // --- Collimating lens (left of OC) ---
  var glensW = 16, glensH = ch * 0.55;
  var glensX = cx - 34, glensY = cy + (ch - glensH) / 2;
  ctx.fillStyle = 'rgba(80,200,255,0.12)';
  ctx.strokeStyle = 'rgba(100,220,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(glensX + glensW / 2, glensY);
  ctx.bezierCurveTo(glensX - 2, glensY + glensH * 0.18, glensX - 2, glensY + glensH * 0.82, glensX + glensW / 2, glensY + glensH);
  ctx.bezierCurveTo(glensX + glensW + 2, glensY + glensH * 0.82, glensX + glensW + 2, glensY + glensH * 0.18, glensX + glensW / 2, glensY);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(glensX + 5, glensY + 6);
  ctx.lineTo(glensX + 11, glensY + glensH - 6);
  ctx.strokeStyle = 'rgba(180,240,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(160,220,255,0.6)';
  ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Lens', glensX + glensW / 2, glensY - 6);

  // Output arrows (left side, from OC)
  var beamY = cy + ch / 2;
  ctx.strokeStyle = '#ffd54f';
  ctx.lineWidth = 2;
  for (var ag = -1; ag <= 1; ag++) {
    ctx.beginPath();
    ctx.moveTo(cx - 8, beamY + ag * 6);
    ctx.lineTo(cx - 40, beamY + ag * 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 40, beamY + ag * 6);
    ctx.lineTo(cx - 32, beamY + ag * 6 - 3);
    ctx.lineTo(cx - 32, beamY + ag * 6 + 3);
    ctx.fillStyle = '#ffd54f'; ctx.fill();
  }
  ctx.fillStyle = '#ffd54f';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Coherent light →', cx - 44, beamY + 3);
}

/* Photon rendering */
function lpDrawPhotons(ctx) {
  var geo = LP_CANVAS;
  for (var i = 0; i < geo.photons.length; i++) {
    var p = geo.photons[i];
    var color = lpPhotonColor(p.type);
    var r = lpPhotonRadius(p.type);

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (p.type === 'stim') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,240,255,0.10)';
      ctx.fill();
    }

    if (p.type === 'output') {
      // Trail
      ctx.beginPath();
      ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(255,213,79,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Polarization mark for gas laser outputs (p-pol, horizontal)
      if (lpState.cavityStyle === 'gas' && p.pol === 'p') {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 6); ctx.lineTo(p.x, p.y + 6);
        ctx.strokeStyle = 'rgba(255,213,79,0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}

/* Scale bar */
function lpDrawScaleBar(ctx, w, h) {
  var geo = LP_CANVAS;
  var label = (lpState.L >= 1000) ? (lpState.L / 1000).toFixed(1) + ' µm' : lpState.L.toFixed(0) + ' nm';
  var barW = (lpState.L >= 1000) ? 80 : 60;
  var sx = 16, sy = h - 22;

  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(sx - 4, sy - 10, barW + 50, 18);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + barW, sy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx, sy - 4); ctx.lineTo(sx, sy + 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx + barW, sy - 4); ctx.lineTo(sx + barW, sy + 4); ctx.stroke();
  ctx.fillStyle = 'rgba(200,200,220,0.6)';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label + ' cavity', sx + barW + 6, sy + 3);
}

/* Lens flare — glow where output beam passes through the left lens */
function lpDrawLensFlare(ctx) {
  var geo = LP_CANVAS;
  if (!geo || !geo.photons) return;
  // Count output photons near the lens region
  var lensX = geo.cavityX - 30;
  var lensH = geo.cavityH * 0.55;
  var lensY = geo.cavityY + (geo.cavityH - lensH) / 2;
  var count = 0;
  for (var i = 0; i < geo.photons.length; i++) {
    var pp = geo.photons[i];
    if (pp.type === 'output' && pp.x < geo.cavityX - 10 && pp.x > geo.cavityX - 50) count++;
  }
  if (count < 3) return;
  var alpha = Math.min(0.35, count * 0.013);
  var flareW = 10 + count * 0.8;
  var flareH = lensH * 1.05;
  var rad = ctx.createRadialGradient(lensX + 8, lensY + lensH / 2, 2, lensX + 8, lensY + lensH / 2, flareW);
  rad.addColorStop(0, 'rgba(0,230,255,' + alpha + ')');
  rad.addColorStop(0.5, 'rgba(0,200,255,' + (alpha * 0.4) + ')');
  rad.addColorStop(1, 'rgba(0,200,255,0)');
  ctx.fillStyle = rad;
  ctx.fillRect(lensX - flareW, lensY, flareW * 3, flareH);
}

/* Density-of-states inset for quantum wells */
function lpDrawDOSInset(ctx, ix, iy) {
  var iw = 110, ih = 70;
  ctx.fillStyle = 'rgba(10,10,18,0.85)';
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(ix, iy, iw, ih);
  ctx.strokeRect(ix, iy, iw, ih);
  ctx.fillStyle = 'rgba(200,200,220,0.55)';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('DOS: bulk vs QW', ix + 4, iy + 11);

  // Bulk (parabolic, grey)
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  var bx = ix + 10, by = iy + 55;
  ctx.moveTo(bx, by);
  for (var t = 0; t <= 30; t++) {
    ctx.lineTo(bx + t, by - Math.sqrt(t) * 3.5);
  }
  ctx.stroke();

  // QW (steps, cyan)
  ctx.strokeStyle = 'rgba(0,240,255,0.5)';
  ctx.beginPath();
  var qx = bx + 40;
  ctx.moveTo(qx, by);
  for (var s = 0; s < 4; s++) {
    var qy = by - (s + 1) * 7;
    ctx.lineTo(qx + s * 8, by - s * 7);
    ctx.lineTo(qx + (s + 1) * 8, qy);
  }
  ctx.stroke();

  // Legend
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(ix + 58, iy + 22, 8, 3);
  ctx.fillStyle = 'rgba(200,200,220,0.5)';
  ctx.fillText('bulk', ix + 70, iy + 27);

  ctx.fillStyle = 'rgba(0,240,255,0.5)';
  ctx.fillRect(ix + 58, iy + 34, 8, 3);
  ctx.fillStyle = 'rgba(200,200,220,0.5)';
  ctx.fillText('QW', ix + 70, iy + 39);
}

/* ---------- Live readouts ---------- */
var lpReadoutTick = 0;
function lpUpdateReadouts() {
  lpReadoutTick++;
  if (lpReadoutTick % 5 !== 0) return;

  var geo = LP_CANVAS;
  var lam = laserWavelength(lpState.Eg);

  var elLam = document.getElementById('live-lam');
  if (elLam) elLam.textContent = lam.toFixed(0) + ' nm';

  var count = geo.photons.length;
  var outputCount = 0;
  for (var i = 0; i < geo.photons.length; i++) {
    if (geo.photons[i].type === 'output') outputCount++;
  }

  var elPh = document.getElementById('live-photons');
  if (elPh) elPh.textContent = count;
  var elOut = document.getElementById('live-output');
  if (elOut) elOut.textContent = outputCount + '/frame';

  var elCvPh = document.getElementById('cv-photons');
  if (elCvPh) elCvPh.textContent = count;
  var elCvOut = document.getElementById('cv-output');
  if (elCvOut) elCvOut.textContent = outputCount;

  var gth = thresholdGain(lpState.alpha, lpState.R, lpState.L);
  var g0 = lpState.pumping * 0.5 / (0.05 * Math.sqrt(2 * Math.PI));
  var elThr = document.getElementById('live-threshold');
  if (elThr) elThr.textContent = gth.toFixed(1) + ' cm⁻¹';
  var elG0 = document.getElementById('live-g0');
  if (elG0) elG0.textContent = g0.toFixed(1) + ' cm⁻¹';

  var elLasing = document.getElementById('live-lasing');
  if (elLasing) {
    if (g0 > gth) {
      elLasing.innerHTML = '<span class="material-badge lasing-on">Lasing ✅</span>';
    } else {
      elLasing.innerHTML = '<span class="material-badge lasing-off">Below threshold</span>';
    }
  }

  var elCvStatus = document.getElementById('cv-status');
  if (elCvStatus) elCvStatus.textContent = (g0 > gth) ? 'Lasing' : 'Spontaneous';

  var elScale = document.getElementById('cv-scale');
  if (elScale) elScale.textContent = geo.scaleNmPerPx;

  var elMat = document.getElementById('live-material');
  if (elMat) elMat.innerHTML = '<span class="material-badge">' + lpState.material + '</span>';

  // Population inversion bars
  var pump = lpState.pumping;
  var n2 = Math.min(pump, 3.0);
  var n1 = 1.0;
  var total = n1 + n2;
  var n2Pct = (n2 / total) * 100;
  var n1Pct = (n1 / total) * 100;
  var invPct = Math.max(0, (n2 - n1) / total * 100);

  var barN2 = document.getElementById('bar-n2');
  var barN1 = document.getElementById('bar-n1');
  var barInv = document.getElementById('bar-inv');
  var txtN2 = document.getElementById('txt-n2');
  var txtN1 = document.getElementById('txt-n1');
  var txtInv = document.getElementById('txt-inv');
  if (barN2) barN2.style.width = n2Pct + '%';
  if (barN1) barN1.style.width = n1Pct + '%';
  if (barInv) barInv.style.width = invPct + '%';
  if (txtN2) txtN2.textContent = n2Pct.toFixed(0) + '%';
  if (txtN1) txtN1.textContent = n1Pct.toFixed(0) + '%';
  if (txtInv) txtInv.textContent = invPct.toFixed(0) + '%';
}

/* ---------- Animation loop ---------- */
function lpAnimate() {
  if (!LP_CANVAS.running) return;
  LP_CANVAS.frame++;
  lpUpdatePhotons();
  lpDraw();
  lpUpdateReadouts();
  LP_CANVAS.raf = requestAnimationFrame(lpAnimate);
}

function lpStartAnim() {
  if (!LP_CANVAS.c && !lpInitCanvas()) return;
  LP_CANVAS.running = true;
  lpAnimate();
}

function lpStopAnim() {
  LP_CANVAS.running = false;
  if (LP_CANVAS.raf) cancelAnimationFrame(LP_CANVAS.raf);
}

/* ---------- Controls ---------- */
function updatePresetButtons() {
  var btns = document.querySelectorAll('#lp-presets .preset-btn');
  btns.forEach(function(btn) {
    if (btn.dataset.mat === lpState.material) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

function setLaserMaterial(name) {
  var mat = LP_MATERIALS[name];
  if (!mat) return;
  lpState.Eg = mat.Eg;
  lpState.n = mat.n;
  lpState.material = name;
  lpState.cavityStyle = mat.type === 'gas' ? 'gas' : (mat.type === 'dilute_nitride' ? 'dilute_nitride' : 'semiconductor');
  var sEg = document.getElementById('slider-Eg');
  var sN = document.getElementById('slider-n-lp');
  if (sEg) { sEg.value = mat.Eg; var el = document.getElementById('val-Eg'); if (el) el.textContent = mat.Eg.toFixed(2); }
  if (sN) { sN.value = mat.n; var el = document.getElementById('val-n-lp'); if (el) el.textContent = mat.n.toFixed(2); }
  updatePresetButtons();
  lpUpdateGeometry();
}

function initLaser() {
  var sEg = document.getElementById('slider-Eg');
  var sL = document.getElementById('slider-L');
  var sN = document.getElementById('slider-n-lp');
  var sR = document.getElementById('slider-R');
  var sAlpha = document.getElementById('slider-alpha');
  var sPump = document.getElementById('slider-pumping');

  if (sEg) {
    sEg.addEventListener('input', function() {
      lpState.Eg = parseFloat(this.value);
      var el = document.getElementById('val-Eg');
      if (el) el.textContent = lpState.Eg.toFixed(2);
    });
  }
  if (sL) {
    sL.addEventListener('input', function() {
      lpState.L = parseFloat(this.value);
      var el = document.getElementById('val-L');
      if (el) el.textContent = lpState.L;
      lpUpdateGeometry();
    });
  }
  if (sN) {
    sN.addEventListener('input', function() {
      lpState.n = parseFloat(this.value);
      var el = document.getElementById('val-n-lp');
      if (el) el.textContent = lpState.n.toFixed(2);
    });
  }
  if (sR) {
    sR.addEventListener('input', function() {
      lpState.R = parseFloat(this.value);
      var el = document.getElementById('val-R');
      if (el) el.textContent = lpState.R.toFixed(2);
    });
  }
  if (sAlpha) {
    sAlpha.addEventListener('input', function() {
      lpState.alpha = parseFloat(this.value);
      var el = document.getElementById('val-alpha');
      if (el) el.textContent = lpState.alpha.toFixed(1);
    });
  }
  if (sPump) {
    sPump.addEventListener('input', function() {
      lpState.pumping = parseFloat(this.value);
      var el = document.getElementById('val-pumping');
      if (el) el.textContent = lpState.pumping.toFixed(1);
    });
  }

  updatePresetButtons();
  lpInitCanvas();
  lpStartAnim();
}

// Wire mode switch: pause animation when leaving playground
var origSetGameMode = window.setGameMode;
if (origSetGameMode) {
  window.setGameMode = function(mode) {
    origSetGameMode(mode);
    if (mode === 'play') { lpStartAnim(); }
    else { lpStopAnim(); }
  };
} else {
  var obs = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      if (m.target.id === 'section-play') {
        if (m.target.style.display !== 'none') lpStartAnim();
        else lpStopAnim();
      }
    });
  });
  var secPlay = document.getElementById('section-play');
  if (secPlay) obs.observe(secPlay, { attributes: true, attributeFilter: ['style'] });
}

initLaser();
window.initLaser = initLaser;
window.setLaserMaterial = setLaserMaterial;
window.lpState = lpState;
window.LP_MATERIALS = LP_MATERIALS;

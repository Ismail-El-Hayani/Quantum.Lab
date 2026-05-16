/**
 * Thermal Properties — Canvas Lattice Sandbox (v1.2)
 * 2D phonon lattice with heat diffusion, vibration, thermal expansion,
 * phonon wave rings, tool particles, floating tooltips, and live gauges.
 */
'use strict';

var TP_CANVAS = {
  canvas: null, ctx: null,
  width: 0, height: 0,
  NX: 15, NY: 15,
  atoms: [], grid: [],
  bathT: 300,
  materialKey: 'Quartz',
  cursorMode: 'heat',
  heatActive: false, coolActive: false,
  mouseX: 0, mouseY: 0,
  time: 0,
  dt: 0.08,
  dragging: false,
  animId: null,
  phononWaves: [],
  toolParticles: []
};

var TP_CANVAS_MATERIALS = {
  'Quartz':   { thetaD: 570,  gamma: 0.0001, type: 'insulator', D: 0.18, alpha: 2.5e-5, label:'Quartz'    },
  'Cu':       { thetaD: 315,  gamma: 0.007,  type: 'metal',     D: 1.00, alpha: 5.0e-5, label:'Copper'    },
  'Al':       { thetaD: 394,  gamma: 0.001,  type: 'metal',     D: 0.90, alpha: 7.0e-5, label:'Aluminum'  },
  'Diamond':  { thetaD: 2220, gamma: 0.0001, type: 'insulator', D: 0.55, alpha: 1.0e-6, label:'Diamond'   },
  'Si':       { thetaD: 640,  gamma: 0.0005, type: 'insulator', D: 0.35, alpha: 2.6e-6, label:'Silicon'   }
};

function getCanvasMat() {
  var mat = TP_CANVAS_MATERIALS[TP_CANVAS.materialKey];
  if (mat) return mat;
  return {
    thetaD: (typeof tpState !== 'undefined') ? tpState.thetaD : 400,
    gamma:  (typeof tpState !== 'undefined') ? tpState.gammaEl : 0.002,
    type:   (typeof tpState !== 'undefined') ? tpState.type : 'insulator',
    D: 0.3, alpha: 3e-5, label: 'Custom'
  };
}

/* ---------- INIT ---------- */
function initTPCanvas() {
  var c = document.getElementById('tp-lattice');
  if (!c) return;
  TP_CANVAS.canvas = c;
  TP_CANVAS.ctx = c.getContext('2d');

  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        var rect = entries[i].contentRect;
        TP_CANVAS.width = Math.max(1, rect.width);
        TP_CANVAS.height = Math.max(1, rect.height);
        c.width = TP_CANVAS.width;
        c.height = TP_CANVAS.height;
        resetLattice();
      }
    });
    ro.observe(c.parentElement);
  } else {
    var rect = c.parentElement.getBoundingClientRect();
    TP_CANVAS.width = Math.max(1, rect.width);
    TP_CANVAS.height = Math.max(1, rect.height);
    c.width = TP_CANVAS.width;
    c.height = TP_CANVAS.height;
    resetLattice();
  }

  c.addEventListener('mousedown', onTPCanvasDown);
  c.addEventListener('mousemove', onTPCanvasMove);
  c.addEventListener('mouseup',   onTPCanvasUp);
  c.addEventListener('mouseleave',onTPCanvasUp);

  resetLattice();
  loopTPCanvas();
}

function resetLattice() {
  var NX = TP_CANVAS.NX, NY = TP_CANVAS.NY;
  var atoms = TP_CANVAS.atoms = [];
  var grid  = TP_CANVAS.grid  = [];
  var w = TP_CANVAS.width, h = TP_CANVAS.height;
  var margin = 36;
  var availW = Math.max(1, w - 2 * margin);
  var availH = Math.max(1, h - 2 * margin);
  var baseSpacing = Math.min(availW / (NX - 1), availH / (NY - 1));
  var offX = margin + (availW - (NX - 1) * baseSpacing) / 2;
  var offY = margin + (availH - (NY - 1) * baseSpacing) / 2;

  for (var j = 0; j < NY; j++) {
    grid[j] = [];
    for (var i = 0; i < NX; i++) {
      var atom = {
        i: i, j: j,
        bx: offX + i * baseSpacing,
        by: offY + j * baseSpacing,
        x:  offX + i * baseSpacing,
        y:  offY + j * baseSpacing,
        T: TP_CANVAS.bathT,
        phase: Math.random() * Math.PI * 2,
        baseSpacing: baseSpacing
      };
      atoms.push(atom);
      grid[j][i] = atom;
    }
  }
  TP_CANVAS.phononWaves = [];
  TP_CANVAS.toolParticles = [];
}

function atomAt(i, j) {
  var g = TP_CANVAS.grid;
  if (j < 0 || j >= g.length) return null;
  if (i < 0 || i >= g[0].length) return null;
  return g[j][i];
}

function averageLatticeT() {
  var atoms = TP_CANVAS.atoms;
  if (!atoms.length) return TP_CANVAS.bathT;
  var s = 0;
  for (var k = 0; k < atoms.length; k++) s += atoms[k].T;
  return s / atoms.length;
}

/* ---------- PHYSICS ---------- */
function stepPhysics() {
  var mat = getCanvasMat();
  var atoms = TP_CANVAS.atoms;
  var dt = TP_CANVAS.dt;
  var time = TP_CANVAS.time;

  var diffusionCoeff = 0.008 * mat.D;
  var heatRate = 90;
  var coolRate = 80;
  var relaxRate = 0.045;

  var newT = [];
  for (var k = 0; k < atoms.length; k++) {
    var a = atoms[k];
    var sum = 0, nbs = 0;
    var dirs = [{di:-1,dj:0},{di:1,dj:0},{di:0,dj:-1},{di:0,dj:1}];
    for (var n = 0; n < dirs.length; n++) {
      var nb = atomAt(a.i + dirs[n].di, a.j + dirs[n].dj);
      if (nb) { sum += nb.T; nbs++; }
    }
    var lap = (nbs > 0) ? (sum - nbs * a.T) : 0;
    var dT = diffusionCoeff * lap * dt;

    if (TP_CANVAS.heatActive || TP_CANVAS.coolActive) {
      var dist = Math.hypot(a.x - TP_CANVAS.mouseX, a.y - TP_CANVAS.mouseY);
      var influence = Math.exp(-dist * dist / (70 * 70));
      if (TP_CANVAS.heatActive) dT += heatRate * influence * dt;
      if (TP_CANVAS.coolActive) dT -= coolRate * influence * dt;
    }

    dT += (TP_CANVAS.bathT - a.T) * relaxRate * dt;

    newT[k] = a.T + dT;
    if (newT[k] < 0)   newT[k] = 0;
    if (newT[k] > 2500) newT[k] = 2500;
  }
  for (var k = 0; k < atoms.length; k++) atoms[k].T = newT[k];

  // Thermal expansion
  var Tavg = averageLatticeT();
  var expansion = 1 + 3.0 * mat.alpha * (Tavg - 273);
  if (expansion < 0.90)  expansion = 0.90;
  if (expansion > 1.25) expansion = 1.25;

  var w = TP_CANVAS.width, h = TP_CANVAS.height;
  var margin = 36;
  var baseSpacing = atoms[0] ? atoms[0].baseSpacing : 20;
  var availW = Math.max(1, w - 2 * margin);
  var availH = Math.max(1, h - 2 * margin);
  var offX = margin + (availW - (TP_CANVAS.NX - 1) * baseSpacing) / 2;
  var offY = margin + (availH - (TP_CANVAS.NY - 1) * baseSpacing) / 2;
  var centerX = offX + (TP_CANVAS.NX - 1) * baseSpacing * 0.5;
  var centerY = offY + (TP_CANVAS.NY - 1) * baseSpacing * 0.5;

  for (var k = 0; k < atoms.length; k++) {
    var a = atoms[k];
    var rawX = offX + a.i * baseSpacing;
    var rawY = offY + a.j * baseSpacing;
    a.bx = centerX + (rawX - centerX) * expansion;
    a.by = centerY + (rawY - centerY) * expansion;

    var thetaD = mat.thetaD;
    var T_eff = Math.max(1, a.T);
    var amp = 3.5 * Math.sqrt(T_eff) / Math.sqrt(Math.max(50, thetaD));
    if (amp > 7.0) amp = 7.0;
    if (amp < 0.3) amp = 0.3;
    var freq = 0.18 * Math.sqrt(thetaD / 400);
    var speedFactor = 1.0 + 0.4 * (T_eff / Math.max(thetaD, 100));
    a.x = a.bx + amp * Math.sin(freq * time * speedFactor + a.phase);
    a.y = a.by + amp * Math.cos(freq * time * speedFactor + a.phase * 1.3);

    if (a.T > thetaD * 0.4 && Math.random() < 0.003) {
      TP_CANVAS.phononWaves.push({ x: a.x, y: a.y, r: 2, alpha: 0.25, life: 1.0 });
    }
  }

  var waves = TP_CANVAS.phononWaves;
  for (var wk = waves.length - 1; wk >= 0; wk--) {
    waves[wk].r += 1.2;
    waves[wk].alpha *= 0.97;
    waves[wk].life -= 0.015;
    if (waves[wk].life <= 0 || waves[wk].alpha < 0.008) waves.splice(wk, 1);
  }
  if (waves.length > 45) waves.splice(0, waves.length - 45);

  // Tool particles (heat/cool embers & frost)
  var parts = TP_CANVAS.toolParticles;
  if (TP_CANVAS.heatActive || TP_CANVAS.coolActive) {
    var mx = TP_CANVAS.mouseX, my = TP_CANVAS.mouseY;
    var isHeat = TP_CANVAS.heatActive;
    for (var p = 0; p < 3; p++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 0.5 + Math.random() * 1.5;
      parts.push({
        x: mx + (Math.random() - 0.5) * 12,
        y: my + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isHeat ? 0.8 : -0.3),
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        radius: 1.2 + Math.random() * 1.8,
        type: isHeat ? 'heat' : 'cool'
      });
    }
  }
  for (var pk = parts.length - 1; pk >= 0; pk--) {
    var pt = parts[pk];
    pt.x += pt.vx; pt.y += pt.vy;
    pt.life -= pt.decay;
    if (pt.life <= 0) parts.splice(pk, 1);
  }
  if (parts.length > 80) parts.splice(0, parts.length - 80);

  TP_CANVAS.time += dt;
}

/* ---------- RENDER ---------- */
function tempToColor(T, thetaD) {
  var ratio = T / Math.max(thetaD, 50);
  if (ratio < 0.15) return { r: 40, g: 90, b: 210 };
  if (ratio < 0.35) return { r: 80, g: 190, b: 255 };
  if (ratio < 0.65) return { r: 255, g: 255, b: 220 };
  if (ratio < 1.0)  return { r: 255, g: 160, b: 80 };
  return { r: 255, g: 60, b: 60 };
}

function rgbString(c) {
  return 'rgb(' + Math.round(c.r) + ',' + Math.round(c.g) + ',' + Math.round(c.b) + ')';
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFrame() {
  var c = TP_CANVAS.canvas, ctx = TP_CANVAS.ctx;
  if (!ctx) return;
  var w = c.width, h0 = c.height;
  ctx.clearRect(0, 0, w, h0);

  var atoms = TP_CANVAS.atoms;
  var mat = getCanvasMat();

  // Bond springs
  ctx.lineWidth = 1.2;
  for (var k = 0; k < atoms.length; k++) {
    var a = atoms[k];
    var rC = { r: 120, g: 120, b: 160 };
    var tRatio = Math.min(a.T / Math.max(mat.thetaD, 50), 3);
    ctx.strokeStyle = 'rgba(' + Math.round(rC.r + tRatio * 60) + ',' + Math.round(rC.g + tRatio * 40) + ',' + Math.round(rC.b + tRatio * 20) + ',0.25)';
    var right = atomAt(a.i + 1, a.j);
    var down  = atomAt(a.i, a.j + 1);
    if (right) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(right.x, right.y); ctx.stroke(); }
    if (down)  { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(down.x, down.y); ctx.stroke(); }
  }

  // Atoms + thermal clouds
  for (var k = 0; k < atoms.length; k++) {
    var a = atoms[k];
    var col = tempToColor(a.T, mat.thetaD);
    var cloudR = 6 + Math.min((a.T / 300) * 2, 12);

    ctx.globalAlpha = 0.22;
    var g = ctx.createRadialGradient(a.x, a.y, 1, a.x, a.y, cloudR);
    g.addColorStop(0, 'rgba(' + Math.round(col.r) + ',' + Math.round(col.g) + ',' + Math.round(col.b) + ',0.45)');
    g.addColorStop(1, 'rgba(' + Math.round(col.r) + ',' + Math.round(col.g) + ',' + Math.round(col.b) + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(a.x, a.y, cloudR, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(a.x, a.y, 2.2, 0, Math.PI * 2); ctx.fill();
  }

  // Phonon wave rings
  var waves = TP_CANVAS.phononWaves;
  for (var wk = 0; wk < waves.length; wk++) {
    var pw = waves[wk];
    ctx.globalAlpha = pw.alpha;
    ctx.strokeStyle = 'rgba(0,240,255,0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(pw.x, pw.y, pw.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Cursor glow
  if (TP_CANVAS.heatActive || TP_CANVAS.coolActive) {
    var mx = TP_CANVAS.mouseX, my = TP_CANVAS.mouseY;
    var rad = 45;
    var g = ctx.createRadialGradient(mx, my, 2, mx, my, rad);
    if (TP_CANVAS.heatActive) {
      g.addColorStop(0, 'rgba(255,80,80,0.55)');
      g.addColorStop(1, 'rgba(255,80,80,0)');
    } else {
      g.addColorStop(0, 'rgba(80,180,255,0.55)');
      g.addColorStop(1, 'rgba(80,180,255,0)');
    }
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(mx, my, rad, 0, Math.PI * 2); ctx.fill();
  }

  // Tool particles (embers / frost)
  var parts2 = TP_CANVAS.toolParticles;
  for (var pk2 = 0; pk2 < parts2.length; pk2++) {
    var pt2 = parts2[pk2];
    ctx.globalAlpha = pt2.life;
    ctx.beginPath();
    ctx.arc(pt2.x, pt2.y, pt2.radius * pt2.life, 0, Math.PI * 2);
    if (pt2.type === 'heat') {
      ctx.fillStyle = 'rgba(255,120,40,0.8)';
    } else {
      ctx.fillStyle = 'rgba(120,200,255,0.8)';
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Tooltip (probe)
  if (!TP_CANVAS.heatActive && !TP_CANVAS.coolActive && !TP_CANVAS.dragging) {
    var mx = TP_CANVAS.mouseX, my = TP_CANVAS.mouseY;
    var closest = null, minD = 9999;
    for (var k = 0; k < atoms.length; k++) {
      var d = Math.hypot(atoms[k].x - mx, atoms[k].y - my);
      if (d < minD) { minD = d; closest = atoms[k]; }
    }
    if (closest && minD < 22) {
      var tx = closest.x + 14, ty = closest.y - 40;
      if (tx > w - 105) tx = closest.x - 115;
      if (ty < 8) ty = closest.y + 20;
      ctx.fillStyle = 'rgba(10,10,20,0.92)';
      ctx.strokeStyle = 'rgba(0,240,255,0.35)';
      ctx.lineWidth = 1;
      drawRoundRect(ctx, tx, ty, 100, 48, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#00f0ff';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('T = ' + Math.round(closest.T) + ' K', tx + 8, ty + 20);
      ctx.fillStyle = '#a0a0ff';
      ctx.font = '10px JetBrains Mono, monospace';
      var pstate = closest.T > mat.thetaD ? 'optical active' : (closest.T > mat.thetaD * 0.3 ? 'acoustic' : 'frozen');
      ctx.fillText('phonons: ' + pstate, tx + 8, ty + 36);
    }
  }
}

function loopTPCanvas() {
  stepPhysics();
  drawFrame();
  drawGauges();
  drawDebyeSphere();
  TP_CANVAS.animId = requestAnimationFrame(loopTPCanvas);
}

/* ---------- GAUGES ---------- */
function drawGauges() {
  var mat = getCanvasMat();
  var Tavg = averageLatticeT();
  var thetaD = mat.thetaD;

  // Cv bar (0 to ~3R scale)
  var cvMax = 3 * 8.314;
  var cv = (Tavg / Math.max(thetaD, 10)) * cvMax;
  if (cv > cvMax) cv = cvMax;
  var cvPct = (cv / cvMax) * 100;
  var elCv = document.getElementById('gauge-cv');
  if (elCv) elCv.style.width = Math.max(0, Math.min(100, cvPct)) + '%';
  var elCvVal = document.getElementById('gauge-cv-val');
  if (elCvVal) elCvVal.textContent = cv.toFixed(1) + ' J/mol·K';

  // kappa bar (0 to ~400 scale)
  var kappa = (mat.type === 'metal') ? 400 : (50 / Math.max(1, Math.pow(Tavg / 300, 1.2)));
  var kappaPct = (kappa / 400) * 100;
  var elKappa = document.getElementById('gauge-kappa');
  if (elKappa) elKappa.style.width = Math.max(0, Math.min(100, kappaPct)) + '%';
  var elKappaVal = document.getElementById('gauge-kappa-val');
  if (elKappaVal) elKappaVal.textContent = kappa.toFixed(1) + ' W/m·K';
}

/* ---------- DEBYE SPHERE ---------- */
function drawDebyeSphere() {
  var dC = document.getElementById('debye-sphere');
  if (!dC) return;
  var dtx = dC.getContext('2d');
  var W = dC.width, H = dC.height;
  dtx.clearRect(0, 0, W, H);
  var mat = getCanvasMat();
  var Tavg = averageLatticeT();
  var thetaD = mat.thetaD;

  var cx = W / 2, cy = H / 2, r = 48;
  var ratio = Math.min(Tavg / thetaD, 2.5);
  var excited = Math.min(ratio, 1.0);

  // Filled modes (bottom)
  dtx.fillStyle = 'rgba(0,240,255,0.2)';
  dtx.beginPath();
  dtx.arc(cx, cy, r, Math.PI * 0.5, Math.PI * 0.5 + excited * Math.PI * 2);
  dtx.lineTo(cx, cy);
  dtx.closePath();
  dtx.fill();

  // Outline
  dtx.strokeStyle = 'rgba(0,240,255,0.3)';
  dtx.lineWidth = 1.2;
  dtx.beginPath(); dtx.arc(cx, cy, r, 0, Math.PI * 2); dtx.stroke();

  // Sphere center
  dtx.globalAlpha = 0.25;
  var sg = dtx.createRadialGradient(cx, cy, 1, cx, cy, r * 0.8);
  sg.addColorStop(0, 'rgba(0,240,255,0.3)');
  sg.addColorStop(1, 'rgba(0,240,255,0)');
  dtx.fillStyle = sg;
  dtx.beginPath(); dtx.arc(cx, cy, r * 0.8, 0, Math.PI * 2); dtx.fill();
  dtx.globalAlpha = 1;

  // Label
  dtx.fillStyle = '#8080a0';
  dtx.font = '9px JetBrains Mono, monospace';
  dtx.textAlign = 'center';
  dtx.fillText('Debye sphere', cx, cy + r + 14);
  dtx.fillText(Math.round(excited * 100) + '% filled', cx, cy + r + 26);
}

/* ---------- INPUT ---------- */
function onTPCanvasDown(e) {
  TP_CANVAS.dragging = true;
  updateMousePos(e);
  if (TP_CANVAS.cursorMode === 'heat') TP_CANVAS.heatActive = true;
  if (TP_CANVAS.cursorMode === 'cool') TP_CANVAS.coolActive = true;
}
function onTPCanvasMove(e) {
  updateMousePos(e);
}
function onTPCanvasUp() {
  TP_CANVAS.dragging = false;
  TP_CANVAS.heatActive = false;
  TP_CANVAS.coolActive = false;
}
function updateMousePos(e) {
  var c = TP_CANVAS.canvas;
  if (!c) return;
  var rect = c.getBoundingClientRect();
  var x = (e.offsetX !== undefined) ? e.offsetX : (e.clientX - rect.left);
  var y = (e.offsetY !== undefined) ? e.offsetY : (e.clientY - rect.top);
  TP_CANVAS.mouseX = x;
  TP_CANVAS.mouseY = y;
}

function setTPCursor(mode) {
  TP_CANVAS.cursorMode = mode;
  TP_CANVAS.heatActive = false;
  TP_CANVAS.coolActive = false;
  var bH = document.getElementById('btn-heat');
  var bC = document.getElementById('btn-cool');
  var bP = document.getElementById('btn-probe');
  if (bH) bH.className = 'btn tool-btn' + (mode === 'heat' ? ' active-tool' : '');
  if (bC) bC.className = 'btn tool-btn' + (mode === 'cool' ? ' active-tool' : '');
  if (bP) bP.className = 'btn tool-btn' + (mode === 'probe' ? ' active-tool' : '');
}

function setTPCanvasMaterial(name) {
  var mat = TP_CANVAS_MATERIALS[name];
  if (!mat) return;
  TP_CANVAS.materialKey = name;
  if (typeof tpState !== 'undefined') {
    tpState.thetaD = mat.thetaD;
    tpState.gammaEl = mat.gamma;
    tpState.type = mat.type;
  }
}

function setTPCanvasBath(T) {
  TP_CANVAS.bathT = T;
}

window.setTPCursor = setTPCursor;
window.setTPCanvasMaterial = setTPCanvasMaterial;
window.setTPCanvasBath = setTPCanvasBath;
window.initTPCanvas = initTPCanvas;
window.destroyTPCanvas = destroyTPCanvas;

/* ---------- CLEANUP ---------- */
function destroyTPCanvas() {
  if (TP_CANVAS.animId) {
    cancelAnimationFrame(TP_CANVAS.animId);
    TP_CANVAS.animId = null;
  }
  var c = TP_CANVAS.canvas;
  if (c) {
    c.removeEventListener('mousedown', onTPCanvasDown);
    c.removeEventListener('mousemove', onTPCanvasMove);
    c.removeEventListener('mouseup',   onTPCanvasUp);
    c.removeEventListener('mouseleave',onTPCanvasUp);
  }
  TP_CANVAS.canvas = null;
  TP_CANVAS.ctx = null;
}

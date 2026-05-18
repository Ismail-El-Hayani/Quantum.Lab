/**
 * Superconductivity — Physics Engine + Visualisations (v4)
 * BCS gap, Meissner effect, London penetration, critical field.
 * Units: T in K, H in T, gap in meV, λ in nm.
 */

'use strict';

const kB_meV = 8.617e-2;  // meV/K
const hbar = 1.054e-34;
const mu0 = 4 * Math.PI * 1e-7;
const e_charge = 1.602e-19;
const m_e = 9.109e-31;

let scState = {
  T: 4.0,
  Tc: 9.2,
  H: 0.0,
  H0: 0.2,
  material: 'Nb'
};

function gapRatio(T, Tc) {
  if (T >= Tc) return 0;
  const t = T / Tc;
  if (t < 0.01) return 1.0;
  // BCS implicit equation solved iteratively
  let r = 0.85;
  for (let i = 0; i < 10; i++) {
    r = Math.tanh((Tc / T) * r);
  }
  return Math.max(0, Math.min(1, r));
}

function gapZero(Tc) {
  return 1.76 * kB_meV * Tc;
}

function criticalField(T, Tc, H0) {
  if (T >= Tc) return 0;
  return H0 * (1 - (T * T) / (Tc * Tc));
}

function londonPenetration(T, Tc, lambda0) {
  if (T >= Tc) return Infinity;
  const t = T / Tc;
  return lambda0 / Math.sqrt(1 - t * t * t * t);
}

function susceptibility(T, Tc, H) {
  const Hc = criticalField(T, Tc, scState.H0);
  if (T < Tc && H < Hc) return -1;
  return 0;
}


const PLOT_CFG = { responsive: true, displayModeBar: false };

function scLayout(title, xtitle, ytitle, extra) {
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

// ===== A. PLAYGROUND PLOTS =====
function plotGapVsTemp() {
  const T = [];
  const gap = [];
  const Tc = scState.Tc;
  const gap0 = gapZero(Tc);

  for (let t = 0.1; t <= 15; t += 0.1) {
    T.push(t);
    const r = gapRatio(t, Tc);
    gap.push(r * gap0);
  }

  _plot('plot-gap-temp', [
    { x: T, y: gap, mode: 'lines', name: 'Δ(T)',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    },
    { x: [scState.T, scState.T], y: [0, gap0], mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' },
      name: 'Current T = ' + scState.T.toFixed(1) + ' K'
    }
  ], scLayout(null, 'T (K)', 'Δ (meV)', {
    shapes: [{
      type: 'line', x0: Tc, x1: Tc, y0: 0, y1: gap0,
      line: { color: '#ff4ecd', width: 1, dash: 'dash' }
    }],
    annotations: [{
      x: Tc, y: gap0, text: 'Tc = ' + Tc.toFixed(1) + ' K',
      font: { color: '#ff4ecd', size: 10 }, showarrow: true, arrowhead: 2, ax: 40, ay: -30
    }]
  }), PLOT_CFG);
}

function plotMagnetization() {
  const T = [];
  const M = [];
  const Tc = scState.Tc;
  const H0 = scState.H0;
  const H = scState.H;

  for (let t = 0.1; t <= 15; t += 0.1) {
    T.push(t);
    const Hc = criticalField(t, Tc, H0);
    if (t < Tc && H < Hc) {
      M.push(-1);
    } else {
      M.push(0);
    }
  }

  _plot('plot-magnetization', [
    { x: T, y: M, mode: 'lines', name: 'χ = M/H',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    },
    { x: [scState.T, scState.T], y: [-1, 0], mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' },
      name: 'Current T = ' + scState.T.toFixed(1) + ' K'
    }
  ], scLayout(null, 'T (K)', 'χ (dimensionless)'), PLOT_CFG);
}

function plotPenetration() {
  const x = [];
  const B = [];
  const Tc = scState.Tc;
  const T = scState.T;
  const lambda0 = 40;

  if (T >= Tc) {
    for (let xi = 0; xi <= 200; xi += 2) {
      x.push(xi);
      B.push(1.0);
    }
  } else {
    const lambda = londonPenetration(T, Tc, lambda0);
    for (let xi = 0; xi <= 200; xi += 2) {
      x.push(xi);
      B.push(Math.exp(-xi / lambda));
    }
  }

  _plot('plot-penetration', [
    { x: x, y: B, mode: 'lines', name: 'B(x)/B₀',
      line: { color: '#00f0ff', width: 2.5 },
      fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)'
    }
  ], scLayout(null, 'x (nm)', 'B/B₀', {
    annotations: [{
      x: 100, y: 0.5,
      text: T >= Tc ? 'Normal state: field penetrates' : 'Meissner: B ∝ exp(-x/λ_L)',
      font: { color: '#ffd54f', size: 10 }, showarrow: false,
      xref: 'paper', yref: 'paper', x: 0.6, y: 0.5
    }]
  }), PLOT_CFG);
}

function updateLiveSC() {
  const T = scState.T;
  const Tc = scState.Tc;
  const gap0 = gapZero(Tc);
  const r = gapRatio(T, Tc);
  const gap = r * gap0;
  const Hc = criticalField(T, Tc, scState.H0);
  const lambda = londonPenetration(T, Tc, 40);
  const chi = susceptibility(T, Tc, scState.H);

  const elGap = document.getElementById('live-gap');
  if (elGap) elGap.textContent = gap0.toFixed(2) + ' meV';

  const elRatio = document.getElementById('live-gap-ratio');
  if (elRatio) elRatio.textContent = r.toFixed(2);

  const elState = document.getElementById('live-state');
  if (elState) {
    var isSC = T < Tc && scState.H < Hc;
    elState.textContent = isSC ? 'Superconducting' : 'Normal';
    elState.className = isSC ? 'tc-badge' : 'normal-badge';
  }

  const elLambda = document.getElementById('live-lambda');
  if (elLambda) elLambda.textContent = T >= Tc ? '∞ (normal)' : lambda.toFixed(1) + ' nm';

  const elChi = document.getElementById('live-chi');
  if (elChi) elChi.textContent = chi.toFixed(1);
}

// ===== B. CHALLENGE HELPERS =====
function startSCChallenge() {
  // Stub for challenge init from games file
}

// ===== C. CORE INIT =====
function initSuperconductivity() {
  var sliderT = document.getElementById('slider-T-sc');
  var sliderH = document.getElementById('slider-H');
  var selectMat = document.getElementById('select-material-sc');

  if (sliderT) {
    sliderT.addEventListener('input', function() {
      scState.T = parseFloat(this.value);
      var el = document.getElementById('val-T-sc');
      if (el) el.textContent = scState.T.toFixed(1);
      plotGapVsTemp(); plotMagnetization(); plotPenetration(); updateLiveSC();
    });
  }

  if (sliderH) {
    sliderH.addEventListener('input', function() {
      scState.H = parseFloat(this.value);
      var el = document.getElementById('val-H');
      if (el) el.textContent = scState.H.toFixed(2);
      plotMagnetization(); updateLiveSC();
    });
  }

  if (selectMat) {
    selectMat.addEventListener('change', function() {
      scState.Tc = parseFloat(this.value);
      scState.material = this.options[this.selectedIndex].text.split('—')[0].trim();
      var el = document.getElementById('val-Tc');
      if (el) el.textContent = scState.Tc.toFixed(1);
      scState.H0 = scState.Tc > 20 ? 15 : (scState.Tc > 5 ? 0.2 : 0.05);
      plotGapVsTemp(); plotMagnetization(); plotPenetration(); updateLiveSC();
    });
  }

  plotGapVsTemp(); plotMagnetization(); plotPenetration(); updateLiveSC();
}

/* ════════════════════════════════════════════════════════════════════════
   D. ANIMATIONS & ENHANCED VISUALISATION  (v4 — photorealistic + legended)
   ════════════════════════════════════════════════════════════════════════ */

/* ── SHARED HELPERS ── */
function glowCircle(ctx, x, y, r, coreColor, glowColor, glowR) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, glowR || r * 2.5);
  g.addColorStop(0, coreColor);
  g.addColorStop(0.4, glowColor);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, glowR || r * 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = coreColor; ctx.fill();
}

function niceText(ctx, text, x, y, opts = {}) {
  const { color = '#e0e0ff', size = 11, align = 'left', shadow = true, bold = false } = opts;
  ctx.font = `${bold ? 'bold ' : ''}${size}px JetBrains Mono, monospace`;
  ctx.textAlign = align;
  if (shadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(text, x + 1, y + 1);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
}

function drawScaleBar(ctx, x, y, pxLen, label, color = 'rgba(200,200,220,0.5)') {
  ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + pxLen, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x, y + 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + pxLen, y - 3); ctx.lineTo(x + pxLen, y + 3); ctx.stroke();
  niceText(ctx, label, x + pxLen / 2, y - 4, { align: 'center', size: 9, color });
}

/* ════════════════════════════════════════════════════════════════════════
   1. COOPER-PAIR CANVAS  (v4)
   ════════════════════════════════════════════════════════════════════════ */
let cooperAnimId = null;
function initCooperAnimation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Fallback if Three.js not loaded
  if (typeof THREE === 'undefined') {
    container.innerHTML = '<div style="padding:20px;color:#888;font-size:12px;text-align:center;">Three.js not loaded</div>';
    return;
  }

  // ==== THREE.JS SETUP ====
  const W = container.clientWidth || 340;
  const H = container.clientHeight || 180;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x09090f);
  scene.fog = new THREE.Fog(0x09090f, 8, 25);

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 4, 12);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // ==== LIGHTING ====
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 512;
  dirLight.shadow.mapSize.height = 512;
  scene.add(dirLight);

  // Blue rim light from below
  const rimLight = new THREE.DirectionalLight(0x00aaff, 0.3);
  rimLight.position.set(-5, -3, -2);
  scene.add(rimLight);

  // ==== LATTICE (IONS) ====
  const ROWS = 4, COLS = 7, DEPTH = 2;
  const ions = [];
  const ionGeom = new THREE.SphereGeometry(0.18, 16, 16);
  const ionMat = new THREE.MeshPhysicalMaterial({
    color: 0xb8a090,
    metalness: 0.7,
    roughness: 0.35,
    clearcoat: 0.3,
    emissive: 0x332211,
    emissiveIntensity: 0.1
  });

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (let d = 0; d < DEPTH; d++) {
        const mesh = new THREE.Mesh(ionGeom, ionMat.clone());
        const bx = (c - (COLS - 1) / 2) * 1.4;
        const by = (r - (ROWS - 1) / 2) * 0.9;
        const bz = (d - (DEPTH - 1) / 2) * 1.2;
        mesh.position.set(bx, by, bz);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        ions.push({ mesh, bx, by, bz, dx: 0, dy: 0, dz: 0, vx: 0, vy: 0, vz: 0 });
      }
    }
  }

  // faint grid helper
  const gridHelper = new THREE.GridHelper(14, 14, 0x1a1a28, 0x111118);
  gridHelper.position.y = -1.8;
  scene.add(gridHelper);

  // ==== ELECTRONS ====
  const eGeom = new THREE.SphereGeometry(0.28, 24, 24);
  const eMat = new THREE.MeshPhysicalMaterial({
    color: 0x00e5ff,
    emissive: 0x00a0cc,
    emissiveIntensity: 0.6,
    metalness: 0.1,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9
  });

  const e1Mesh = new THREE.Mesh(eGeom, eMat);
  const e2Mesh = new THREE.Mesh(eGeom, eMat.clone());
  e1Mesh.castShadow = true; e2Mesh.castShadow = true;
  scene.add(e1Mesh); scene.add(e2Mesh);

  // electron point lights (glow)
  const e1Light = new THREE.PointLight(0x00f0ff, 1.5, 4);
  const e2Light = new THREE.PointLight(0x00f0ff, 1.5, 4);
  e1Mesh.add(e1Light); e2Mesh.add(e2Light);

  // ==== PHONON WAKE (visualized as a warm point light between electrons) ====
  const wakeLight = new THREE.PointLight(0xffaa44, 0, 6);
  scene.add(wakeLight);

  // pair glow light
  const pairLight = new THREE.PointLight(0xc084fc, 0, 5);
  scene.add(pairLight);

  // trails as arrays of small spheres that fade
  const trailPool = [];
  const trailGeom = new THREE.SphereGeometry(0.06, 8, 8);
  const trailMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.35 });
  for (let i = 0; i < 40; i++) {
    const m = new THREE.Mesh(trailGeom, trailMat.clone());
    m.visible = false;
    scene.add(m);
    trailPool.push({ mesh: m, life: 0 });
  }

  // ==== ANIMATION STATE ====
  let phase = 'approach';
  let phaseT = 0;
  let e1 = { x: -9, y: 0, z: 0, vx: 0.06, vy: 0, vz: 0 };
  let e2 = { x: 9, y: 0, z: 0, vx: -0.06, vy: 0, vz: 0 };
  let wakeStrength = 0;
  let pairGlow = 0;
  let trailIdx = 0;

  function physicsStep() {
    // ions attracted by passing electrons
    for (const ion of ions) {
      const d1 = Math.hypot(ion.mesh.position.x - e1.x, ion.mesh.position.y - e1.y, ion.mesh.position.z - e1.z);
      const d2 = Math.hypot(ion.mesh.position.x - e2.x, ion.mesh.position.y - e2.y, ion.mesh.position.z - e2.z);
      let fx = 0, fy = 0, fz = 0;

      if (d1 < 2.5 && e1.vx > 0) {
        const f = 0.08 * Math.exp(-d1 / 0.8);
        fx += (e1.x - ion.bx) / (d1 || 1) * f;
        fy += (e1.y - ion.by) / (d1 || 1) * f;
        fz += (e1.z - ion.bz) / (d1 || 1) * f;
      }
      if (d2 < 2.5 && e2.vx < 0) {
        const f = 0.08 * Math.exp(-d2 / 0.8);
        fx += (e2.x - ion.bx) / (d2 || 1) * f;
        fy += (e2.y - ion.by) / (d2 || 1) * f;
        fz += (e2.z - ion.bz) / (d2 || 1) * f;
      }

      ion.vx += (fx - 0.08 * ion.dx - 0.06 * ion.vx);
      ion.vy += (fy - 0.08 * ion.dy - 0.06 * ion.vy);
      ion.vz += (fz - 0.08 * ion.dz - 0.06 * ion.vz);
      ion.dx += ion.vx; ion.dy += ion.vy; ion.dz += ion.vz;

      // emissive glow when displaced
      const disp = Math.hypot(ion.dx, ion.dy, ion.dz);
      ion.mesh.material.emissiveIntensity = 0.1 + Math.min(0.5, disp * 0.4);
      ion.mesh.material.emissive.setHSL(0.08, 0.8, 0.35 + Math.min(0.3, disp * 0.2));
      ion.mesh.position.set(ion.bx + ion.dx, ion.by + ion.dy, ion.bz + ion.dz);
    }

    phaseT++;
    const dist = Math.hypot(e1.x - e2.x, e1.y - e2.y);

    if (phase === 'approach') {
      if (dist < 1.8) { phase = 'wake'; phaseT = 0; }
    } else if (phase === 'wake') {
      e1.vx *= 0.97; e2.vx *= 0.97;
      wakeStrength = Math.min(1, wakeStrength + 0.02);
      pairGlow = Math.min(1, pairGlow + 0.012);
      if (phaseT > 55) { phase = 'pair'; phaseT = 0; wakeStrength = 0; }
    } else if (phase === 'pair') {
      const angle = phaseT * 0.025;
      e1.vx = Math.cos(angle) * 0.025;
      e1.vy = Math.sin(angle) * 0.025;
      e2.vx = -Math.cos(angle) * 0.025;
      e2.vy = -Math.sin(angle) * 0.025;
      pairGlow = Math.min(1, pairGlow + 0.006);
      if (phaseT > 90) { phase = 'drift'; phaseT = 0; }
    } else if (phase === 'drift') {
      const drift = 0.045;
      e1.vx += (drift - e1.vx) * 0.03;
      e2.vx += (drift - e2.vx) * 0.03;
      e1.vy += (0 - e1.vy) * 0.03;
      e2.vy += (0 - e2.vy) * 0.03;
      pairGlow = Math.max(0, pairGlow - 0.005);
      if (e1.x > 9 || e2.x > 9) { phase = 'reset'; phaseT = 0; }
    } else if (phase === 'reset') {
      if (phaseT > 40) {
        phase = 'approach'; phaseT = 0;
        e1 = { x: -9, y: 0, z: 0, vx: 0.06, vy: 0, vz: 0 };
        e2 = { x: 9, y: 0, z: 0, vx: -0.06, vy: 0, vz: 0 };
        wakeStrength = 0; pairGlow = 0;
        for (const ion of ions) { ion.dx = ion.dy = ion.dz = 0; ion.vx = ion.vy = ion.vz = 0; }
      }
    }

    e1.x += e1.vx; e1.y += e1.vy; e1.z += e1.vz;
    e2.x += e2.vx; e2.y += e2.vy; e2.z += e2.vz;

    // spawn trail dots
    if (phase !== 'reset') {
      for (const e of [e1, e2]) {
        const t = trailPool[trailIdx % trailPool.length];
        t.mesh.position.set(e.x, e.y, e.z);
        t.mesh.visible = true;
        t.life = 1.0;
        trailIdx++;
      }
    }
    for (const t of trailPool) {
      if (t.life > 0) {
        t.life -= 0.04;
        t.mesh.material.opacity = t.life * 0.35;
        t.mesh.scale.setScalar(0.5 + t.life * 0.5);
        if (t.life <= 0) t.mesh.visible = false;
      }
    }
  }

  function animate() {
    physicsStep();

    e1Mesh.position.set(e1.x, e1.y, e1.z);
    e2Mesh.position.set(e2.x, e2.y, e2.z);

    // wake light between electrons
    wakeLight.position.set((e1.x + e2.x) / 2, (e1.y + e2.y) / 2, 0);
    wakeLight.intensity = wakeStrength * 2.0;

    // pair glow
    pairLight.position.set((e1.x + e2.x) / 2, (e1.y + e2.y) / 2, 0);
    pairLight.intensity = pairGlow * 1.8;
    e1Mesh.material.emissiveIntensity = 0.6 + pairGlow * 0.4;
    e2Mesh.material.emissiveIntensity = 0.6 + pairGlow * 0.4;

    // gentle camera drift
    camera.position.x = Math.sin(Date.now() * 0.0003) * 1.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    cooperAnimId = requestAnimationFrame(animate);
  }

  animate();

  // resize handler
  function onResize() {
    const w = container.clientWidth || 340;
    const h = container.clientHeight || 180;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
}
/* ════════════════════════════════════════════════════════════════════════
   2. MEISSNER EFFECT CANVAS  (v4)
   ════════════════════════════════════════════════════════════════════════ */
let meissnerAnimId = null;
function initMeissnerAnimation(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  function draw() {
    const isSC = scState.T < scState.Tc && scState.H < criticalField(scState.T, scState.Tc, scState.H0);
    const lambda = londonPenetration(scState.T, scState.Tc, 40);
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a0a12'); bg.addColorStop(1, '#06060e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const bx = W / 2 - 70, by = H / 2 - 45, bw = 140, bh = 90, r = 8;
    ctx.beginPath(); ctx.moveTo(bx + r, by); ctx.lineTo(bx + bw - r, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r); ctx.lineTo(bx + bw, by + bh - r);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh); ctx.lineTo(bx + r, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r); ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by); ctx.closePath();

    const bgrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    if (isSC) {
      bgrad.addColorStop(0, 'rgba(0,200,220,0.18)');
      bgrad.addColorStop(0.5, 'rgba(100,100,200,0.10)');
      bgrad.addColorStop(1, 'rgba(180,100,220,0.18)');
    } else {
      bgrad.addColorStop(0, 'rgba(200,60,60,0.10)');
      bgrad.addColorStop(1, 'rgba(160,40,40,0.05)');
    }
    ctx.fillStyle = bgrad; ctx.fill();
    ctx.strokeStyle = isSC ? 'rgba(0,240,255,0.35)' : 'rgba(255,80,80,0.25)';
    ctx.lineWidth = 2; ctx.stroke();

    if (!isSC) {
      ctx.fillStyle = 'rgba(255,200,100,0.06)';
      ctx.fillRect(bx + 4, by + 4, bw - 8, bh - 8);
    }

    const nLines = 11;
    for (let i = 0; i < nLines; i++) {
      const xBase = 12 + i * ((W - 24) / (nLines - 1));
      ctx.beginPath();
      let inside = false;
      const points = [];
      for (let y = 0; y <= H; y += 3) {
        const xOff = Math.sin(y * 0.025 + t * 0.015 + i * 0.7) * 4;
        let x = xBase + xOff;
        if (isSC && x > bx + 2 && x < bx + bw - 2 && y > by + 2 && y < by + bh - 2) {
          const cx = bx + bw / 2, cy = by + bh / 2;
          const dx = x - cx, dy = y - cy;
          const dist = Math.hypot(dx, dy);
          const push = Math.max(0, 1 - dist / 75) * 40 * (1 - Math.exp(-t * 0.008));
          x += (dx / (dist || 1)) * push;
          inside = true;
        }
        points.push({ x, y });
      }
      ctx.beginPath();
      for (let p = 0; p < points.length; p++) {
        p === 0 ? ctx.moveTo(points[p].x, points[p].y) : ctx.lineTo(points[p].x, points[p].y);
      }
      ctx.strokeStyle = inside ? 'rgba(255,200,80,0.25)' : 'rgba(0,240,255,0.18)';
      ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = inside ? 'rgba(255,220,120,0.7)' : 'rgba(0,240,255,0.5)';
      ctx.lineWidth = 1.3; ctx.stroke();
    }

    if (isSC) {
      const curColor = 'rgba(0,240,255,0.35)';
      ctx.strokeStyle = curColor; ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const sx = bx + 15 + i * ((bw - 30) / 4);
        ctx.beginPath(); ctx.arc(sx, by, 8, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx + 8, by - 2); ctx.lineTo(sx + 6, by - 6); ctx.lineTo(sx + 10, by - 6); ctx.closePath();
        ctx.fillStyle = curColor; ctx.fill();
      }
      for (let i = 0; i < 5; i++) {
        const sx = bx + 15 + i * ((bw - 30) / 4);
        ctx.beginPath(); ctx.arc(sx, by + bh, 8, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx - 8, by + bh + 2); ctx.lineTo(sx - 6, by + bh + 6); ctx.lineTo(sx - 10, by + bh + 6); ctx.closePath();
        ctx.fillStyle = curColor; ctx.fill();
      }
    }

    const badgeColor = isSC ? '#00f0ff' : '#ff5555';
    const badgeText = isSC ? 'Meissner state  —  B = 0 inside' : 'Normal state  —  B penetrates freely';
    niceText(ctx, badgeText, 10, 20, { size: 12, color: badgeColor, bold: true });

    if (isSC && isFinite(lambda)) {
      const barX = 10, barY = H - 22;
      ctx.fillStyle = 'rgba(0,240,255,0.15)';
      ctx.fillRect(barX, barY, lambda * 1.5, 4);
      ctx.strokeStyle = 'rgba(0,240,255,0.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, lambda * 1.5, 4);
      niceText(ctx, `λ_L ≈ ${lambda.toFixed(1)} nm`, barX + lambda * 1.5 + 6, barY + 4, { size: 9, color: 'rgba(0,240,255,0.6)' });
    }

    drawScaleBar(ctx, W - 80, H - 14, 50, '50 nm', 'rgba(160,160,190,0.4)');

    const lx = W - 155, ly = 32, lw = 147, lh = 56;
    ctx.fillStyle = 'rgba(8,8,14,0.75)'; ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeStyle = 'rgba(140,140,180,0.18)'; ctx.strokeRect(lx, ly, lw, lh);
    niceText(ctx, 'Legend', lx + 6, ly + 13, { size: 9, color: 'rgba(180,180,210,0.8)', bold: true });
    niceText(ctx, '──  magnetic field B', lx + 6, ly + 30, { size: 8.5, color: 'rgba(0,240,255,0.6)' });
    niceText(ctx, '↻  shielding supercurrent', lx + 6, ly + 46, { size: 8.5, color: 'rgba(0,240,255,0.5)' });

    t++;
    meissnerAnimId = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════════════════════════════════════
   3. ENERGY-GAP / DOS CANVAS  (v4)
   ════════════════════════════════════════════════════════════════════════ */
let gapAnimId = null;
function initGapAnimation(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  const quasiparticles = [];
  for (let i = 0; i < 6; i++) quasiparticles.push({ x: -20 - i * 40, speed: 0.6 + Math.random() * 0.4, side: i % 2 === 0 ? -1 : 1 });

  function draw() {
    const Tc = scState.Tc, T = scState.T;
    const r = gapRatio(T, Tc);
    const gap0 = gapZero(Tc);
    const gap = r * gap0;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0c0c14'); bg.addColorStop(1, '#080810');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2, scaleX = 1.6, gapPx = Math.max(2, gap * 3.5);

    ctx.fillStyle = 'rgba(0,200,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(cx - 110, cy);
    for (let E = -110; E <= -gapPx / 2; E += 2) {
      const DOS = Math.sqrt(Math.max(0, Math.abs(E) - gapPx / 2)) * scaleX;
      ctx.lineTo(cx + E, cy - DOS);
    }
    ctx.lineTo(cx - gapPx / 2, cy);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath();
    ctx.moveTo(cx + gapPx / 2, cy);
    for (let E = gapPx / 2; E <= 110; E += 2) {
      const DOS = Math.sqrt(Math.max(0, Math.abs(E) - gapPx / 2)) * scaleX;
      ctx.lineTo(cx + E, cy - DOS);
    }
    ctx.lineTo(cx + 110, cy);
    ctx.closePath(); ctx.fill();

    ctx.beginPath();
    for (let E = -110; E <= 110; E += 1.5) {
      const DOS = Math.abs(E) < gapPx / 2 ? 0 : Math.sqrt(Math.max(0, Math.abs(Math.abs(E) - gapPx / 2))) * scaleX;
      const x = cx + E;
      const y = cy - DOS;
      E === -110 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2.2; ctx.stroke();

    if (gapPx > 2) {
      const g = ctx.createLinearGradient(cx, cy - 50, cx, cy + 50);
      g.addColorStop(0, 'rgba(180,120,255,0.08)');
      g.addColorStop(0.5, 'rgba(180,120,255,0.15)');
      g.addColorStop(1, 'rgba(180,120,255,0.08)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - gapPx / 2, 8, gapPx, H - 16);
      ctx.strokeStyle = 'rgba(180,120,255,0.5)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(cx - gapPx / 2, 8); ctx.lineTo(cx - gapPx / 2, H - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + gapPx / 2, 8); ctx.lineTo(cx + gapPx / 2, H - 8); ctx.stroke();
    }

    for (const qp of quasiparticles) {
      qp.x += qp.speed;
      if (qp.x > W + 20) qp.x = -20;
      const yOff = qp.side * (gapPx / 2 + 12 + Math.sin(t * 0.05 + qp.x * 0.02) * 6);
      glowCircle(ctx, cx + qp.x - W / 2, cy + yOff, 2.5, qp.side < 0 ? '#00f0ff' : '#ff80ff',
        qp.side < 0 ? 'rgba(0,240,255,0.25)' : 'rgba(255,128,255,0.25)', 8);
    }

    niceText(ctx, 'DOS(E)', cx + 55, cy - 55, { size: 10, color: 'rgba(0,240,255,0.6)' });
    niceText(ctx, 'filled  (E < E_F − Δ)', cx - 105, H - 10, { size: 9, color: 'rgba(0,200,255,0.5)' });
    niceText(ctx, 'empty   (E > E_F + Δ)', cx + 8, 14, { size: 9, color: 'rgba(200,200,220,0.45)' });
    niceText(ctx, `2Δ = ${(2 * gap).toFixed(2)} meV`, cx, cy + 5, { align: 'center', size: 10, color: 'rgba(180,120,255,0.85)', bold: true });
    if (T >= Tc) {
      niceText(ctx, 'gap closed  (T ≥ T_c)', cx, cy - 18, { align: 'center', size: 9, color: 'rgba(255,100,100,0.7)' });
    }

    const lx = 8, ly = 6, lw = 130, lh = 52;
    ctx.fillStyle = 'rgba(8,8,14,0.7)'; ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeStyle = 'rgba(140,140,180,0.15)'; ctx.strokeRect(lx, ly, lw, lh);
    niceText(ctx, 'Legend', lx + 6, ly + 13, { size: 9, color: 'rgba(180,180,210,0.75)', bold: true });
    ctx.fillStyle = 'rgba(0,240,255,0.6)'; ctx.beginPath(); ctx.arc(lx + 10, ly + 28, 3, 0, Math.PI * 2); ctx.fill();
    niceText(ctx, 'occupied states', lx + 18, ly + 31, { size: 8.5, color: 'rgba(160,160,190,0.6)' });
    ctx.fillStyle = 'rgba(180,120,255,0.6)'; ctx.fillRect(lx + 7, ly + 40, 6, 2);
    niceText(ctx, 'superconducting gap', lx + 18, ly + 43, { size: 8.5, color: 'rgba(160,160,190,0.6)' });

    t++;
    gapAnimId = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════════════════════════════════════
   E. PLOT DESCRIPTIONS
   ════════════════════════════════════════════════════════════════════════ */
function injectPlotDescriptions() {
  const descs = [
    { id: 'plot-gap-temp', title: 'Energy Gap Δ(T)', text: 'BCS prediction: the superconducting gap Δ(T) opens below Tc and reaches Δ(0) ≈ 1.76 k_B T_c at T = 0. The yellow dashed line marks the current temperature slider.' },
    { id: 'plot-magnetization', title: 'Magnetic Susceptibility χ(T)', text: 'Below Tc the Meissner effect gives perfect diamagnetism (χ = −1). Above Tc the material is paramagnetic/normal (χ ≈ 0). The critical field Hc(T) also vanishes at Tc.' },
    { id: 'plot-penetration', title: 'Field Penetration B(x)', text: 'In the superconducting state magnetic field decays exponentially inside the material: B(x) = B₀ e^(−x/λ_L). λ_L diverges as T → Tc, restoring full penetration in the normal state.' }
  ];
  for (const d of descs) {
    const container = document.getElementById(d.id);
    if (!container || container.nextElementSibling?.classList?.contains('plot-desc')) continue;
    const div = document.createElement('div');
    div.className = 'plot-desc';
    div.style.cssText = 'margin-top:0.5rem;padding:0.7rem 1rem;background:var(--bg-elevated);border-left:3px solid var(--accent-cyan);border-radius:0 8px 8px 0;font-size:0.85rem;color:var(--text-muted);line-height:1.55;';
    div.innerHTML = `<strong style="color:var(--text-main)">${d.title}</strong><br>${d.text}`;
    container.parentNode.insertBefore(div, container.nextSibling);
  }
}

/* ════════════════════════════════════════════════════════════════════════
   F. LEGEND & INFO PANEL
   ════════════════════════════════════════════════════════════════════════ */
function injectLegendPanel() {
  const livePanel = document.querySelector('.challenge-panel:has(#live-gap)');
  if (!livePanel || document.getElementById('sc-legend')) return;
  const div = document.createElement('div');
  div.id = 'sc-legend';
  div.className = 'challenge-panel';
  div.style.marginTop = '1rem';
  div.innerHTML = `
    <div class="challenge-header"><span class="challenge-icon" style="background:rgba(0,240,255,0.1);">🔑</span><span class="challenge-title">Legend & Physics Guide</span></div>
    <div style="font-size:0.78rem;color:var(--text-muted);line-height:1.6;margin-top:0.4rem;">
      <p style="margin:0.3rem 0;color:var(--text-dim);"><strong style="color:var(--text-main)">What moves:</strong></p>
      <table style="width:100%;font-size:0.75rem;">
        <tr><td style="padding:2px 0;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#00f0ff;margin-right:6px;"></span></td><td>Electron (Cooper pair constituent)</td></tr>
        <tr><td style="padding:2px 0;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#a08060;margin-right:6px;"></span></td><td>Ion lattice site (oscillates when perturbed)</td></tr>
        <tr><td style="padding:2px 0;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ffd54f;margin-right:6px;"></span></td><td>Phonon — lattice vibration quantum</td></tr>
        <tr><td style="padding:2px 0;"><span style="display:inline-block;width:8px;height:2px;background:#c084fc;margin-right:6px;vertical-align:middle;"></span></td><td>Superconducting energy gap 2Δ</td></tr>
        <tr><td style="padding:2px 0;"><span style="display:inline-block;width:8px;height:2px;background:#00f0ff;margin-right:6px;vertical-align:middle;"></span></td><td>Magnetic field line / flux tube</td></tr>
        <tr><td style="padding:2px 0;"><span style="display:inline-block;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:6px solid #00f0ff;margin-right:6px;"></span></td><td>Momentum vector ℏk</td></tr>
      </table>
      <div class="section-divider" style="margin:0.5rem 0;"></div>
      <p style="margin:0.3rem 0;color:var(--text-dim);"><strong style="color:var(--text-main)">Key equations:</strong></p>
      <div style="font-family:var(--font-mono);font-size:0.72rem;background:var(--bg-panel);padding:0.4rem 0.5rem;border-radius:4px;color:var(--text-muted);">
        Δ(0) ≈ 1.76 k_B T_c<br>
        H_c(T) = H_0 [1 − (T/T_c)²]<br>
        λ_L = √(m / μ₀ n_s e²)
      </div>
      <div class="section-divider" style="margin:0.5rem 0;"></div>
      <p style="margin:0.3rem 0;color:var(--text-dim);"><strong style="color:var(--text-main)">Scales:</strong></p>
      <div style="font-size:0.72rem;">
        • Cooper animation: ~1 nm shown per 60 px<br>
        • Meissner sample: 50 nm scale bar<br>
        • Gap axis: ± several meV around E_F
      </div>
    </div>`;
  livePanel.parentNode.appendChild(div);
}

/* ════════════════════════════════════════════════════════════════════════
   G. INIT v4
   ════════════════════════════════════════════════════════════════════════ */
function initSuperconductivityV2() {
  initSuperconductivity();
  injectPlotDescriptions();
  injectLegendPanel();
  initCooperAnimation('cooper-wrap');
  initMeissnerAnimation('canvas-meissner');
  initGapAnimation('canvas-gap');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSuperconductivityV2);
} else {
  initSuperconductivityV2();
}
window.initSuperconductivityV2 = initSuperconductivityV2;
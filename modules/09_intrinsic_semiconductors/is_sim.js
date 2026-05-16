/**
 * Intrinsic Semiconductors — Physics Engine (v2)
 * Three.js 3D band-diagram renderer + Varshini bandgap + doping + field.
 * Materials: Si, GaAs, Ge with realistic parameters.
 */

'use strict';

/* ============ PHYSICS CONSTANTS ============ */
var kB_eV = 8.617333262e-5;   // Boltzmann in eV/K
var kB_J  = 1.380649e-23;      // Boltzmann in J/K
var q_e   = 1.602176634e-19;   // elementary charge in C
var h_eV  = 4.135667696e-15;   // Planck in eV·s
var c_ms  = 2.99792458e8;      // speed of light m/s

/* ============ MATERIAL DATABASE ============ */
var MAT_DB = {
  Si: {
    name: 'Silicon', symbol: 'Si',
    Eg0: 1.17, alpha: 4.73e-4, beta: 636,
    Nc300: 2.8e19, Nv300: 1.04e19,
    mu_e: 1400, mu_h: 450,
    color: '#00f0ff'
  },
  GaAs: {
    name: 'GaAs', symbol: 'GaAs',
    Eg0: 1.52, alpha: 5.41e-4, beta: 204,
    Nc300: 4.7e17, Nv300: 7.0e18,
    mu_e: 8500, mu_h: 400,
    color: '#ff4ecd'
  },
  Ge: {
    name: 'Germanium', symbol: 'Ge',
    Eg0: 0.74, alpha: 4.77e-4, beta: 235,
    Nc300: 1.04e19, Nv300: 6.0e18,
    mu_e: 3900, mu_h: 1900,
    color: '#ffd740'
  }
};

/* ============ STATE ============ */
var isState = {
  material: 'Si',
  T: 300,
  Nd: 0,      // donor concentration cm^-3
  Na: 0,      // acceptor concentration cm^-3
  E_field: 0, // applied electric field V/cm
  // Derived
  Eg: 1.12,
  Nc: 2.8e19,
  Nv: 1.04e19,
  ni: 1.0e10,
  n: 1.0e10,
  p: 1.0e10,
  EF: 0.56,   // EF - Ev  (eV)
  Ei: 0.56,   // Ei - Ev  (eV)
  sigma: 0,
  vd_e: 0,    // electron drift velocity cm/s
  vd_h: 0     // hole drift velocity cm/s
};

/* ============ PHYSICS FUNCTIONS ============ */

function bandgapVarshini(mat, T) {
  var m = MAT_DB[mat];
  return m.Eg0 - m.alpha * T * T / (T + m.beta);
}

function effectiveDensity(N300, T) {
  return N300 * Math.pow(T / 300, 1.5);
}

function intrinsicCarrierDensity(Eg, T, Nc, Nv) {
  var pref = Math.sqrt(Nc * Nv);
  var exponent = -Eg / (2 * kB_eV * T);
  return pref * Math.exp(exponent);
}

// Accurate intrinsic Fermi level: Ei = Ev + Eg/2 + (3/4)kT ln(mh*/me*)
// Using Nc/Nv ratio as proxy for effective mass ratio
function intrinsicFermiLevel(Eg, T, Nc, Nv) {
  var mid = Eg / 2;
  var correction = 0.75 * kB_eV * T * Math.log(Nv / Nc);
  return mid + correction;
}

// Solve charge neutrality for doped semiconductor
// n + Na = p + Nd, with np = ni^2
// n = (Nd - Na)/2 + sqrt( ((Nd-Na)/2)^2 + ni^2 )
function solveDoping(Nd, Na, ni) {
  var delta = Nd - Na;
  var n = delta / 2 + Math.sqrt(delta * delta / 4 + ni * ni);
  var p = ni * ni / n;
  return { n: n, p: p };
}

// Fermi level position relative to valence band edge (Ev = 0)
// For n-type: EF = Ec - kT ln(Nc/n) = Ev + Eg - kT ln(Nc/n)
// For p-type: EF = Ev + kT ln(Nv/p)
function fermiLevelDoped(Eg, T, Nc, Nv, n, p, ni) {
  var mid = intrinsicFermiLevel(Eg, T, Nc, Nv);
  if (n > p) {
    // n-type or intrinsic
    var fn = Eg - kB_eV * T * Math.log(Nc / n);
    if (n > 10 * p) return fn; // strongly n-type
    // interpolate between intrinsic and doped
    var ratio = Math.min(1, (n - p) / (10 * ni));
    return mid * (1 - ratio) + fn * ratio;
  } else if (p > n) {
    var fp = kB_eV * T * Math.log(Nv / p);
    if (p > 10 * n) return fp;
    var ratio = Math.min(1, (p - n) / (10 * ni));
    return mid * (1 - ratio) + fp * ratio;
  }
  return mid;
}

function conductivity(n, p, mu_e, mu_h) {
  return q_e * (n * mu_e + p * mu_h);
}

function driftVelocity(mu, E_field) {
  return mu * E_field; // cm/s when mu in cm^2/Vs and E in V/cm
}

/* ============ 3D BAND DIAGRAM RENDERER (Three.js) ============ */

var IS3D = {
  scene: null,
  camera: null,
  renderer: null,
  animId: null,
  controls: null,
  // Meshes
  cbSurface: null,
  vbSurface: null,
  crystalGrid: null,
  axisGroup: null,
  eFieldArrows: [],
  efLine: null,
  eiLine: null,
  ecLabel: null,
  evLabel: null,
  efLabel: null,
  eiLabel: null,
  // Particles
  electronMesh: null,
  holeMesh: null,
  glowMeshE: null,
  glowMeshH: null,
  dummy: null,
  // Geometry params
  W: 10,  // x width
  D: 6,   // z depth
  scaleY: 2.5, // energy to world-y scale
  // Interaction
  autoRotateSpeed: 0.002,
  lastInteraction: 0,
  // Time
  time: 0
};

function initIS3D() {
  var container = document.getElementById('band-diagram-3d');
  if (!container || typeof THREE === 'undefined') {
    console.warn('Three.js not available or container missing');
    return false;
  }
  if (IS3D.scene) { return true; }

  var w = container.clientWidth || 640;
  var h = container.clientHeight || 400;

  // Scene
  IS3D.scene = new THREE.Scene();
  IS3D.scene.background = new THREE.Color(0x0a0a10);
  IS3D.scene.fog = new THREE.FogExp2(0x0a0a10, 0.04);

  // Camera
  IS3D.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  IS3D.camera.position.set(8, 4, 12);

  // Renderer
  IS3D.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  IS3D.renderer.setSize(w, h);
  IS3D.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  IS3D.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  IS3D.renderer.toneMappingExposure = 1.2;
  container.appendChild(IS3D.renderer.domElement);

  // ---- OrbitControls ----
  if (typeof THREE.OrbitControls !== 'undefined') {
    IS3D.controls = new THREE.OrbitControls(IS3D.camera, IS3D.renderer.domElement);
    IS3D.controls.enableDamping = true;
    IS3D.controls.dampingFactor = 0.08;
    IS3D.controls.minDistance = 6;
    IS3D.controls.maxDistance = 30;
    IS3D.controls.target.set(0, 0, 0);
    IS3D.controls.addEventListener('start', function() {
      IS3D.lastInteraction = performance.now();
    });
  } else {
    IS3D.camera.lookAt(0, 0, 0);
  }

  // ---- Lighting ----
  var hemi = new THREE.HemisphereLight(0x4433aa, 0x111122, 1.0);
  IS3D.scene.add(hemi);
  var dir = new THREE.DirectionalLight(0xffffff, 1.5);
  dir.position.set(6, 12, 8);
  IS3D.scene.add(dir);
  var ptCB = new THREE.PointLight(0x00f0ff, 0.8, 15);
  ptCB.position.set(0, 2, 0);
  IS3D.scene.add(ptCB);
  var ptVB = new THREE.PointLight(0xff4ecd, 0.6, 15);
  ptVB.position.set(0, -2, 0);
  IS3D.scene.add(ptVB);

  // ---- Crystal lattice wireframe grid (back and front faces) ----
  var gridMat = new THREE.LineBasicMaterial({ color: 0x2a2a3a, transparent: true, opacity: 0.35 });
  var gridGroup = new THREE.Group();
  var W = IS3D.W, D = IS3D.D, H = 6;
  for (var i = -W/2; i <= W/2; i += 1.0) {
    var geo1 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -H/2, -D/2), new THREE.Vector3(i, H/2, -D/2)
    ]);
    gridGroup.add(new THREE.Line(geo1, gridMat));
    var geo2 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -H/2, D/2), new THREE.Vector3(i, H/2, D/2)
    ]);
    gridGroup.add(new THREE.Line(geo2, gridMat));
  }
  for (var j = -H/2; j <= H/2; j += 1.0) {
    var geo3 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-W/2, j, -D/2), new THREE.Vector3(W/2, j, -D/2)
    ]);
    gridGroup.add(new THREE.Line(geo3, gridMat));
    var geo4 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-W/2, j, D/2), new THREE.Vector3(W/2, j, D/2)
    ]);
    gridGroup.add(new THREE.Line(geo4, gridMat));
  }
  IS3D.scene.add(gridGroup);
  IS3D.crystalGrid = gridGroup;

  // ---- Parabolic band surfaces ----
  var segsX = 40, segsZ = 30;
  var bandGeo = new THREE.PlaneGeometry(W, D, segsX, segsZ);
  var cbMat = new THREE.MeshPhysicalMaterial({
    color: 0x00f0ff, transparent: true, opacity: 0.22,
    roughness: 0.2, metalness: 0.3, side: THREE.DoubleSide,
    emissive: 0x004444, emissiveIntensity: 0.3,
    clearcoat: 1.0, clearcoatRoughness: 0.1
  });
  IS3D.cbSurface = new THREE.Mesh(bandGeo, cbMat);
  IS3D.cbSurface.rotation.x = -Math.PI / 2;
  IS3D.scene.add(IS3D.cbSurface);

  var vbMat = new THREE.MeshPhysicalMaterial({
    color: 0xc084fc, transparent: true, opacity: 0.22,
    roughness: 0.2, metalness: 0.3, side: THREE.DoubleSide,
    emissive: 0x220044, emissiveIntensity: 0.3,
    clearcoat: 1.0, clearcoatRoughness: 0.1
  });
  IS3D.vbSurface = new THREE.Mesh(bandGeo.clone(), vbMat);
  IS3D.vbSurface.rotation.x = -Math.PI / 2;
  IS3D.scene.add(IS3D.vbSurface);

  // ---- Energy axis ruler ----
  var axisGroup = new THREE.Group();
  var axisMat = new THREE.LineBasicMaterial({ color: 0x606080 });
  var axisLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-W/2 - 0.5, -3, 0), new THREE.Vector3(-W/2 - 0.5, 3, 0)
  ]), axisMat);
  axisGroup.add(axisLine);
  for (var e = 0; e <= 2.0; e += 0.25) {
    var y = (e / 2.0) * 3;
    var tick = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-W/2 - 0.7, y, 0), new THREE.Vector3(-W/2 - 0.5, y, 0)
    ]), axisMat);
    axisGroup.add(tick);
  }
  IS3D.scene.add(axisGroup);
  IS3D.axisGroup = axisGroup;

  // ---- Fermi level line (yellow) ----
  var efGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-W/2, 0, 0), new THREE.Vector3(W/2, 0, 0)
  ]);
  var efMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 });
  IS3D.efLine = new THREE.Line(efGeo, efMat);
  IS3D.scene.add(IS3D.efLine);

  // ---- Intrinsic Fermi level line (green, dashed) ----
  var eiGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-W/2, 0, -0.3), new THREE.Vector3(W/2, 0, -0.3)
  ]);
  var eiMat = new THREE.LineDashedMaterial({
    color: 0x4ade80, dashSize: 0.3, gapSize: 0.15, linewidth: 1
  });
  IS3D.eiLine = new THREE.Line(eiGeo, eiMat);
  IS3D.eiLine.computeLineDistances();
  IS3D.scene.add(IS3D.eiLine);

  // ---- Labels ----
  IS3D.ecLabel = makeLabel('Ec (Conduction)', 0x00f0ff);
  IS3D.scene.add(IS3D.ecLabel);
  IS3D.evLabel = makeLabel('Ev (Valence)', 0xc084fc);
  IS3D.scene.add(IS3D.evLabel);
  IS3D.efLabel = makeLabel('EF (Fermi)', 0xfacc15);
  IS3D.scene.add(IS3D.efLabel);
  IS3D.eiLabel = makeLabel('Ei (Intrinsic)', 0x4ade80);
  IS3D.scene.add(IS3D.eiLabel);

  // ---- E-field arrows ----
  IS3D.eFieldArrows = [];
  var arrowMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
  for (var i = 0; i < 5; i++) {
    var arrowGroup = new THREE.Group();
    var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), arrowMat);
    shaft.rotation.z = -Math.PI / 2;
    var head = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), arrowMat);
    head.rotation.z = -Math.PI / 2;
    head.position.x = 0.4;
    arrowGroup.add(shaft);
    arrowGroup.add(head);
    arrowGroup.position.set((i - 2) * 2, 0, 2.5);
    arrowGroup.visible = false;
    IS3D.scene.add(arrowGroup);
    IS3D.eFieldArrows.push(arrowGroup);
  }

  // ---- Particle meshes (InstancedMesh for performance) ----
  var sphereGeo = new THREE.SphereGeometry(0.10, 16, 16);
  var eMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  var hMat = new THREE.MeshBasicMaterial({ color: 0xff4ecd });

  IS3D.electronMesh = new THREE.InstancedMesh(sphereGeo, eMat, 80);
  IS3D.electronMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  IS3D.scene.add(IS3D.electronMesh);

  IS3D.holeMesh = new THREE.InstancedMesh(sphereGeo, hMat, 80);
  IS3D.holeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  IS3D.scene.add(IS3D.holeMesh);

  // ---- Glow halos ----
  var glowGeo = new THREE.SphereGeometry(0.22, 16, 16);
  var glowEMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.12 });
  var glowHMat = new THREE.MeshBasicMaterial({ color: 0xff4ecd, transparent: true, opacity: 0.12 });

  IS3D.glowMeshE = new THREE.InstancedMesh(glowGeo, glowEMat, 80);
  IS3D.glowMeshE.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  IS3D.scene.add(IS3D.glowMeshE);

  IS3D.glowMeshH = new THREE.InstancedMesh(glowGeo, glowHMat, 80);
  IS3D.glowMeshH.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  IS3D.scene.add(IS3D.glowMeshH);

  // Dummy for matrix updates
  IS3D.dummy = new THREE.Object3D();

  // Start loop
  animateIS3D();

  // Resize handler
  window.addEventListener('resize', onIS3DResize);
  return true;
}

function makeLabel(text, colorHex) {
  var canvas = document.createElement('canvas');
  canvas.width = 320; canvas.height = 80;
  var ctx = canvas.getContext('2d');
  ctx.font = 'bold 28px JetBrains Mono, monospace';
  ctx.fillStyle = '#' + new THREE.Color(colorHex).getHexString();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 160, 40);
  var tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  var spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  var sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(3.5, 0.9, 1);
  return sprite;
}

function onIS3DResize() {
  var container = document.getElementById('band-diagram-3d');
  if (!container || !IS3D.camera || !IS3D.renderer) return;
  var w = container.clientWidth;
  var h = container.clientHeight;
  IS3D.camera.aspect = w / h;
  IS3D.camera.updateProjectionMatrix();
  IS3D.renderer.setSize(w, h);
}

// Update 3D scene from physics state
function updateIS3D() {
  if (!IS3D.scene) return;

  var st = isState;
  var s = IS3D.scaleY;
  var W = IS3D.W;
  var D = IS3D.D;
  var Emax = 2.0; // visual max bandgap at 0K

  // Normalized band positions
  var ecY = (st.Eg / Emax) * s;
  var evY = -ecY;

  // Field-induced band bending (slope in x direction)
  var slope = -0.12 * st.E_field; // visual slope, V/cm scaled

  // Curvature strength (k^2 dispersion along z)
  var curveCB = 0.25; // parabolic curvature for conduction band minimum
  var curveVB = 0.25; // parabolic curvature for valence band maximum

  // Update CB surface position + parabolic curvature + tilt
  var cbPos = IS3D.cbSurface.geometry.attributes.position;
  for (var i = 0; i < cbPos.count; i++) {
    var x = cbPos.getX(i);
    var z = cbPos.getY(i); // in local plane coords before rotation
    // z maps to world z after rotation
    var zWorld = z;
    var parabola = curveCB * zWorld * zWorld;
    // Plane is rotated -90° around X, so local Z is world Y
    cbPos.setZ(i, ecY + parabola + slope * x);
  }
  cbPos.needsUpdate = true;
  IS3D.cbSurface.geometry.computeVertexNormals();

  // Update VB surface (inverted parabola for maximum)
  var vbPos = IS3D.vbSurface.geometry.attributes.position;
  for (var i = 0; i < vbPos.count; i++) {
    var x = vbPos.getX(i);
    var z = vbPos.getY(i);
    var zWorld = z;
    var parabola = -curveVB * zWorld * zWorld;
    vbPos.setZ(i, evY + parabola + slope * x);
  }
  vbPos.needsUpdate = true;
  IS3D.vbSurface.geometry.computeVertexNormals();

  // EF line position
  var efRel = st.EF - st.Eg / 2;
  var efY = efRel * s * 2 / Emax;
  var efPoints = [
    new THREE.Vector3(-W/2, efY + slope * (-W/2), 0),
    new THREE.Vector3(W/2, efY + slope * (W/2), 0)
  ];
  IS3D.efLine.geometry.setFromPoints(efPoints);

  // Ei line position
  var eiRel = st.Ei - st.Eg / 2;
  var eiY = eiRel * s * 2 / Emax;
  var eiPoints = [
    new THREE.Vector3(-W/2, eiY + slope * (-W/2), -0.3),
    new THREE.Vector3(W/2, eiY + slope * (W/2), -0.3)
  ];
  IS3D.eiLine.geometry.setFromPoints(eiPoints);
  IS3D.eiLine.computeLineDistances();

  // Labels
  IS3D.ecLabel.position.set(-W/2 - 1.8, ecY + slope * (-W/2) + 0.3, 0);
  IS3D.evLabel.position.set(-W/2 - 1.8, evY + slope * (-W/2) - 0.3, 0);
  IS3D.efLabel.position.set(W/2 + 1.8, efY + slope * (W/2), 0);
  IS3D.eiLabel.position.set(W/2 + 1.8, eiY + slope * (W/2), 0.5);

  // ---- E-FIELD ARROWS ----
  var showArrows = Math.abs(st.E_field) > 1;
  var arrowScale = Math.min(1.5, Math.abs(st.E_field) / 200);
  var arrowDir = st.E_field >= 0 ? 1 : -1;
  for (var a = 0; a < IS3D.eFieldArrows.length; a++) {
    var ag = IS3D.eFieldArrows[a];
    ag.visible = showArrows;
    if (showArrows) {
      ag.scale.set(arrowDir * arrowScale, arrowScale, arrowScale);
    }
  }

  // ---- PARTICLES ----
  var logN = Math.log10(st.n + 1);
  var logP = Math.log10(st.p + 1);
  var eCount = Math.min(80, Math.max(0, Math.round((logN - 6) * 4)));
  var hCount = Math.min(80, Math.max(0, Math.round((logP - 6) * 4)));

  var time = IS3D.time;
  var jitter = 0.12;
  var orbitAmp = 0.25; // orbital motion amplitude along z

  // Update electrons in CB
  for (var i = 0; i < 80; i++) {
    if (i < eCount) {
      var x = (Math.random() - 0.5) * W;
      var drift = st.vd_e * 0.001;
      var zBase = (Math.sin(i * 3.7) * D * 0.35);
      var zOrb = Math.sin(time * 1.2 + i * 1.1) * orbitAmp;
      var z = zBase + zOrb;
      var parab = curveCB * z * z;
      var yBase = ecY + parab + slope * x - 0.25;
      var y = yBase + Math.sin(time * 2 + i) * jitter + (Math.random() - 0.5) * jitter * 0.5;
      x = ((x + drift * time) % W + W) % W - W/2;

      IS3D.dummy.position.set(x, y, z);
      IS3D.dummy.scale.set(1, 1, 1);
      IS3D.dummy.updateMatrix();
      IS3D.electronMesh.setMatrixAt(i, IS3D.dummy.matrix);
      // Glow halo (slightly larger, same position)
      IS3D.dummy.scale.set(1.1, 1.1, 1.1);
      IS3D.dummy.updateMatrix();
      IS3D.glowMeshE.setMatrixAt(i, IS3D.dummy.matrix);
    } else {
      IS3D.dummy.position.set(0, -100, 0);
      IS3D.dummy.scale.set(0, 0, 0);
      IS3D.dummy.updateMatrix();
      IS3D.electronMesh.setMatrixAt(i, IS3D.dummy.matrix);
      IS3D.glowMeshE.setMatrixAt(i, IS3D.dummy.matrix);
    }
  }
  IS3D.electronMesh.instanceMatrix.needsUpdate = true;
  IS3D.electronMesh.count = eCount;
  IS3D.glowMeshE.instanceMatrix.needsUpdate = true;
  IS3D.glowMeshE.count = eCount;

  // Update holes in VB
  for (var i = 0; i < 80; i++) {
    if (i < hCount) {
      var x = (Math.random() - 0.5) * W;
      var drift = -st.vd_h * 0.001;
      var zBase = (Math.sin(i * 2.3 + 1) * D * 0.35);
      var zOrb = Math.sin(time * 0.9 + i * 1.3) * orbitAmp;
      var z = zBase + zOrb;
      var parab = -curveVB * z * z;
      var yBase = evY + parab + slope * x + 0.25;
      var y = yBase + Math.sin(time * 1.5 + i + 10) * jitter + (Math.random() - 0.5) * jitter * 0.5;
      x = ((x + drift * time) % W + W) % W - W/2;

      IS3D.dummy.position.set(x, y, z);
      IS3D.dummy.scale.set(1, 1, 1);
      IS3D.dummy.updateMatrix();
      IS3D.holeMesh.setMatrixAt(i, IS3D.dummy.matrix);
      IS3D.dummy.scale.set(1.1, 1.1, 1.1);
      IS3D.dummy.updateMatrix();
      IS3D.glowMeshH.setMatrixAt(i, IS3D.dummy.matrix);
    } else {
      IS3D.dummy.position.set(0, -100, 0);
      IS3D.dummy.scale.set(0, 0, 0);
      IS3D.dummy.updateMatrix();
      IS3D.holeMesh.setMatrixAt(i, IS3D.dummy.matrix);
      IS3D.glowMeshH.setMatrixAt(i, IS3D.dummy.matrix);
    }
  }
  IS3D.holeMesh.instanceMatrix.needsUpdate = true;
  IS3D.holeMesh.count = hCount;
  IS3D.glowMeshH.instanceMatrix.needsUpdate = true;
  IS3D.glowMeshH.count = hCount;
}

function animateIS3D() {
  IS3D.animId = requestAnimationFrame(animateIS3D);
  IS3D.time += 0.016;

  // Auto-rotate if no interaction for 3 seconds
  if (IS3D.controls && performance.now() - IS3D.lastInteraction > 3000) {
    IS3D.controls.autoRotate = true;
    IS3D.controls.autoRotateSpeed = 1.0;
  } else if (IS3D.controls) {
    IS3D.controls.autoRotate = false;
  }

  if (IS3D.controls) IS3D.controls.update();

  if (IS3D.renderer && IS3D.scene && IS3D.camera) {
    IS3D.renderer.render(IS3D.scene, IS3D.camera);
  }
}

function disposeIS3D() {
  if (IS3D.animId) cancelAnimationFrame(IS3D.animId);
  if (IS3D.controls) { IS3D.controls.dispose(); IS3D.controls = null; }
  if (IS3D.renderer) {
    IS3D.renderer.dispose();
    var container = document.getElementById('band-diagram-3d');
    if (container && IS3D.renderer.domElement) {
      container.removeChild(IS3D.renderer.domElement);
    }
  }
}

/* ============ PLOTTING ============ */

var IS_PLOT_CFG = { responsive: true, displayModeBar: false };

function isLayout(title, xtitle, ytitle, extra) {
  var base = {
    margin: { t: 25, r: 10, b: 45, l: 60 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 }
  };
  if (title) base.title = { text: title, font: { size: 13 } };
  if (extra) { for (var k in extra) base[k] = extra[k]; }
  return base;
}

function plotCarrierDensity() {
  var mat = isState.material;
  var m = MAT_DB[mat];
  var T = [], n = [], p = [];
  for (var t = 50; t <= 800; t += 10) {
    T.push(t);
    var Eg = bandgapVarshini(mat, t);
    var Nc = effectiveDensity(m.Nc300, t);
    var Nv = effectiveDensity(m.Nv300, t);
    var ni = intrinsicCarrierDensity(Eg, t, Nc, Nv);
    var doped = solveDoping(isState.Nd, isState.Na, ni);
    n.push(doped.n);
    p.push(doped.p);
  }
  var currNi = intrinsicCarrierDensity(
    bandgapVarshini(mat, isState.T),
    isState.T,
    effectiveDensity(m.Nc300, isState.T),
    effectiveDensity(m.Nv300, isState.T)
  );

  _plot('plot-carrier-density', [
    { x: T, y: n, mode: 'lines', name: 'n(T)', line: { color: '#00f0ff', width: 2 } },
    { x: T, y: p, mode: 'lines', name: 'p(T)', line: { color: '#ff4ecd', width: 2 } },
    { x: [isState.T, isState.T], y: [1e5, 1e20], mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' }, name: 'T = ' + isState.T + ' K' }
  ], isLayout('Carrier Density vs Temperature', 'T (K)', 'n, p (cm⁻³)', {
    yaxis: { type: 'log', range: [5, 20] }
  }), IS_PLOT_CFG);
}

function plotConductivity() {
  var mat = isState.material;
  var m = MAT_DB[mat];
  var T = [], sig = [];
  for (var t = 50; t <= 800; t += 10) {
    T.push(t);
    var Eg = bandgapVarshini(mat, t);
    var Nc = effectiveDensity(m.Nc300, t);
    var Nv = effectiveDensity(m.Nv300, t);
    var ni = intrinsicCarrierDensity(Eg, t, Nc, Nv);
    var doped = solveDoping(isState.Nd, isState.Na, ni);
    // Mobility decreases with T roughly as T^(-2.3)
    var mu_e = m.mu_e * Math.pow(300 / t, 2.3);
    var mu_h = m.mu_h * Math.pow(300 / t, 2.3);
    sig.push(conductivity(doped.n, doped.p, mu_e, mu_h));
  }

  _plot('plot-conductivity', [
    { x: T, y: sig, mode: 'lines', name: 'σ(T)',
      line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.08)' }
  ], isLayout('Conductivity vs Temperature', 'T (K)', 'σ (S/cm)', {
    yaxis: { type: 'log' }
  }), IS_PLOT_CFG);
}

function plotBandgapVsT() {
  var mat = isState.material;
  var T = [], Eg = [];
  for (var t = 10; t <= 800; t += 10) {
    T.push(t);
    Eg.push(bandgapVarshini(mat, t));
  }
  _plot('plot-bandgap', [
    { x: T, y: Eg, mode: 'lines', name: 'Eg(T)',
      line: { color: '#ffd740', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(255,215,64,0.08)' }
  ], isLayout('Bandgap vs Temperature (Varshni)', 'T (K)', 'Eg (eV)'), IS_PLOT_CFG);
}

/* ============ LIVE READOUT ============ */
function updatePhysics() {
  var mat = isState.material;
  var m = MAT_DB[mat];
  var T = isState.T;

  // Varshini bandgap
  isState.Eg = bandgapVarshini(mat, T);

  // Effective DOS
  isState.Nc = effectiveDensity(m.Nc300, T);
  isState.Nv = effectiveDensity(m.Nv300, T);

  // Intrinsic carrier density
  isState.ni = intrinsicCarrierDensity(isState.Eg, T, isState.Nc, isState.Nv);

  // Doping
  var doped = solveDoping(isState.Nd, isState.Na, isState.ni);
  isState.n = doped.n;
  isState.p = doped.p;

  // Fermi levels
  isState.Ei = intrinsicFermiLevel(isState.Eg, T, isState.Nc, isState.Nv);
  isState.EF = fermiLevelDoped(isState.Eg, T, isState.Nc, isState.Nv, isState.n, isState.p, isState.ni);

  // Conductivity (mobility T-dependent)
  var mu_e = m.mu_e * Math.pow(300 / T, 2.3);
  var mu_h = m.mu_h * Math.pow(300 / T, 2.3);
  isState.sigma = conductivity(isState.n, isState.p, mu_e, mu_h);

  // Drift velocities
  isState.vd_e = driftVelocity(mu_e, isState.E_field);
  isState.vd_h = driftVelocity(mu_h, isState.E_field);
}

function updateLiveReadouts() {
  updatePhysics();

  var elN = document.getElementById('live-n');
  if (elN) elN.textContent = isState.n.toExponential(2) + ' cm⁻³';

  var elP = document.getElementById('live-p');
  if (elP) elP.textContent = isState.p.toExponential(2) + ' cm⁻³';

  var elNi = document.getElementById('live-ni');
  if (elNi) elNi.textContent = isState.ni.toExponential(2) + ' cm⁻³';

  var elEf = document.getElementById('live-ef');
  if (elEf) elEf.textContent = isState.EF.toFixed(3) + ' eV';

  var elEi = document.getElementById('live-ei');
  if (elEi) elEi.textContent = isState.Ei.toFixed(3) + ' eV';

  var elEg = document.getElementById('live-eg');
  if (elEg) elEg.textContent = isState.Eg.toFixed(3) + ' eV';

  var elSig = document.getElementById('live-sigma');
  if (elSig) elSig.textContent = isState.sigma.toExponential(2) + ' S/cm';

  var elVde = document.getElementById('live-vde');
  if (elVde) elVde.textContent = isState.vd_e.toFixed(1) + ' cm/s';

  var elVdh = document.getElementById('live-vdh');
  if (elVdh) elVdh.textContent = isState.vd_h.toFixed(1) + ' cm/s';

  var elReg = document.getElementById('live-regime');
  if (elReg) {
    var regime = 'Intrinsic';
    if (isState.Nd > 10 * isState.ni) regime = 'n-type';
    else if (isState.Na > 10 * isState.ni) regime = 'p-type';
    var color = (regime === 'Intrinsic') ? 'var(--accent-cyan)' : ((regime === 'n-type') ? 'var(--accent-green)' : 'var(--accent-pink)');
    elReg.innerHTML = '<span style="display:inline-block;padding:0.2rem 0.6rem;border-radius:4px;background:' + color + '22;color:' + color + ';font-size:0.8rem;font-weight:600;">' + regime + '</span>';
  }

  // Update 3D
  updateIS3D();
}

function setMaterialIS(key) {
  isState.material = key;
  var m = MAT_DB[key];
  var el = document.getElementById('val-Eg');
  if (el) el.textContent = bandgapVarshini(key, isState.T).toFixed(3);
  updateLiveReadouts();
  plotCarrierDensity();
  plotConductivity();
  plotBandgapVsT();
}
window.setMaterialIS = setMaterialIS;

function setDopingIS(type, val) {
  if (type === 'n') { isState.Nd = val; }
  else { isState.Na = val; }
  updateLiveReadouts();
  plotCarrierDensity();
  plotConductivity();
}
window.setDopingIS = setDopingIS;

/* ============ INIT ============ */
function initIntrinsicSemi() {
  // Material buttons
  ['Si', 'GaAs', 'Ge'].forEach(function(key) {
    var btn = document.getElementById('btn-mat-' + key.toLowerCase());
    if (btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.mat-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        setMaterialIS(key);
      });
    }
  });

  // Temperature slider
  var sliderT = document.getElementById('slider-T-is');
  if (sliderT) {
    sliderT.addEventListener('input', function() {
      isState.T = parseFloat(this.value);
      var el = document.getElementById('val-T-is');
      if (el) el.textContent = isState.T.toFixed(0);
      updateLiveReadouts();
      plotCarrierDensity();
      plotConductivity();
      plotBandgapVsT();
    });
  }

  // Doping sliders
  var sliderNd = document.getElementById('slider-nd');
  if (sliderNd) {
    sliderNd.addEventListener('input', function() {
      var val = Math.pow(10, parseFloat(this.value));
      isState.Nd = val;
      var el = document.getElementById('val-nd');
      if (el) el.textContent = val.toExponential(1);
      updateLiveReadouts();
      plotCarrierDensity();
      plotConductivity();
    });
  }

  var sliderNa = document.getElementById('slider-na');
  if (sliderNa) {
    sliderNa.addEventListener('input', function() {
      var val = Math.pow(10, parseFloat(this.value));
      isState.Na = val;
      var el = document.getElementById('val-na');
      if (el) el.textContent = val.toExponential(1);
      updateLiveReadouts();
      plotCarrierDensity();
      plotConductivity();
    });
  }

  // Electric field slider
  var sliderEf = document.getElementById('slider-efield');
  if (sliderEf) {
    sliderEf.addEventListener('input', function() {
      isState.E_field = parseFloat(this.value);
      var el = document.getElementById('val-efield');
      if (el) el.textContent = isState.E_field.toFixed(1);
      updateLiveReadouts();
    });
  }

  // Init 3D
  var has3D = initIS3D();
  if (!has3D) {
    console.warn('3D renderer initialization failed');
  }

  // Initial plots and state
  setMaterialIS('Si');
  updateLiveReadouts();
}

window.initIntrinsicSemi = initIntrinsicSemi;

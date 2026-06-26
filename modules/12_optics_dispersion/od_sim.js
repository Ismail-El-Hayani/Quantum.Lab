/* ═══════════════════════════════════════════════════════════════
   od_sim.js — Optics & Dispersion: Enhanced 3D Lattice + Photon Physics
   Ported from lattice_optics.html visual engine:
   • Laser source 3D model + hit marker
   • Phonon excitation, thermal vibration, lattice heating
   • Enhanced photon packet with additive glow
   • Beam trails (incident, reflected, transmitted)
   • Snell refraction, Fresnel, TIR guard
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ─── MATERIAL DB ─── */
var OD_MATERIALS = {
  'Si':   { type:'sc',    Eg:1.12, n0:3.50, color:0x7da4c4, bc:0x556677, label:'Silicon' },
  'GaAs': { type:'sc',    Eg:1.42, n0:3.30, color:0xaabb88, bc:0x667755, label:'GaAs' },
  'NaCl': { type:'ins',   model:'lorentz', Eg:8.50, n0:1.54, color:0xff8844, bc:0x44aaff, label:'NaCl',
             epsInf:2.25, eps0:5.9, omegaTO:0.020, omegaLO:0.026, damp:0.003 },
  'Cu':   { type:'metal', Ep:8.80, damp:0.05, interband:{center:3.5, width:2.0, strength:2.5}, color:0xd4a574, bc:0x665544, label:'Copper' },
  'Ag':   { type:'metal', Ep:9.60, damp:0.05, interband:false, color:0xe8e8f0, bc:0x778899, label:'Silver' },
  'Al':   { type:'metal', Ep:15.0, damp:0.35, interband:false, color:0xc0c8d0, bc:0x556677, label:'Aluminium' }
};

/* ─── STATE ─── */
window.odState = { mat:'Cu', E:2.0, angle:0, n:1.5 };

/* ─── PHONON STATE ─── */
var phonon = {
  energy: 0,        // eV deposited into lattice phonon bath
  T0: 300,          // base temperature (K)
  coupling: 0.35,   // fraction of absorbed photon energy → phonons
  decayRate: 0.6,   // eV/s anharmonic decay
  wavePool: [],     // visual ring meshes
  scatterScale: 0   // 0..1 metric of lattice distortion
};

/* ─── THREE.JS ─── */
var scene, camera, renderer, controls, container;
var atoms=[], bonds=[], freeElectrons=[];
var frameLines, photonPacket, photonGlow;
var absorbEffects = [];
var microEffects = [];
var animId, time=0;
var photonState='idle', photonT=0;
var src, target, reflectDest, transmitDest;
var incidentBeam, reflectedBeam, transmittedBeam;

/* ─── LASER ─── */
var laserGroup, laserBarrel, laserEmitter, laserIndicator;

/* ─── HIT MARKER ─── */
var hitMarker;

/* ─── OVERLAY / LEGEND DOM refs ─── */
var infoOverlay, beamLegend;

/* ─── INIT ─── */
window.initOD = function() {
  container = document.getElementById('macro-canvas-container');
  if (!container) { return; }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05050a);
  scene.fog = new THREE.FogExp2(0x05050a, 0.012);

  camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.01, 100);
  camera.position.set(3, 2.5, 4);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.05;
    controls.minDistance = 0.5; controls.maxDistance = 20;
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  var dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(5,8,6); scene.add(dir);
  var pt = new THREE.PointLight(0x00f0ff, 0.5, 20); pt.position.set(2,3,2); scene.add(pt);

  buildLattice(1.0);
  buildFrame();
  buildLaser();
  buildHitMarker();
  buildPhoton();
  createOverlays();
  odComputeSpectra();
  odUpdateLiveReadouts();
  odInitSpectralEngine();
  _odInitNewSections();

  window.addEventListener('resize', odOnResize);
  animate();
};

/* ─── CREATE OVERLAYS ─── */
function createOverlays() {
  infoOverlay = document.createElement('div');
  infoOverlay.style.cssText = 'position:absolute;top:12px;left:12px;z-index:2;background:rgba(10,12,24,0.72);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 12px;font-family:var(--font-mono,monospace);font-size:0.72rem;color:#00f0ff;pointer-events:none;';
  container.appendChild(infoOverlay);
  updateOverlay();

  beamLegend = document.createElement('div');
  beamLegend.style.cssText = 'position:absolute;bottom:12px;right:12px;z-index:2;background:rgba(10,12,24,0.72);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 12px;font-size:0.72rem;color:#8899aa;display:flex;flex-direction:column;gap:4px;pointer-events:none;';
  [
    {c:'#ffdd44',l:'Incident'},
    {c:'#00f0ff',l:'Reflected'},
    {c:'#4ade80',l:'Refracted'},
    {c:'#ff4ecd',l:'Absorption glow'},
    {c:'#ff6b35',l:'Phonon wave'}
  ].forEach(function(entry) {
    var r = document.createElement('span');
    r.style.display = 'flex'; r.style.alignItems = 'center'; r.style.gap = '6px';
    var d = document.createElement('span');
    d.style.width = '8px'; d.style.height = '8px'; d.style.borderRadius = '50%';
    d.style.background = entry.c; d.style.display = 'inline-block';
    r.appendChild(d);
    var s = document.createElement('span');
    s.textContent = ' ' + entry.l;
    r.appendChild(s);
    beamLegend.appendChild(r);
  });
  container.appendChild(beamLegend);
}

function latticeParam(mat) {
  return { 'Cu':3.61,'Ag':4.09,'Al':4.05,'Si':5.43,'GaAs':5.65,'NaCl':5.64 }[mat] || 5.0;
}
function crystalStruct(mat) {
  if (mat==='NaCl') return 'rocksalt';
  if (mat==='GaAs') return 'zincblende';
  if (mat==='Si')  return 'diamond cubic';
  return 'fcc';
}
function updateOverlay() {
  var def = OD_MATERIALS[odState.mat];
  var tK = phononTempK();
  infoOverlay.textContent = def.label + ' \u00b7 ' + crystalStruct(odState.mat) + ' \u00b7 a = ' + latticeParam(odState.mat) + ' \u00c5 \u00b7 T = ' + tK + ' K';
}

/* ─── LASER SOURCE ─── */
function buildLaser() {
  if (laserGroup) { scene.remove(laserGroup); }
  laserGroup = new THREE.Group();

  var bGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.9, 16);
  var bMat = new THREE.MeshStandardMaterial({ color:0x00aaff, metalness:0.6, roughness:0.3, emissive:0x001133 });
  laserBarrel = new THREE.Mesh(bGeo, bMat);
  laserBarrel.rotation.x = Math.PI / 2;
  laserGroup.add(laserBarrel);

  var eGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 16);
  var eMat = new THREE.MeshBasicMaterial({ color:0x00f0ff, transparent:true, opacity:0.7 });
  laserEmitter = new THREE.Mesh(eGeo, eMat);
  laserEmitter.rotation.x = Math.PI / 2;
  laserEmitter.position.z = 0.48;
  laserGroup.add(laserEmitter);

  var laserLight = new THREE.PointLight(0x00f0ff, 1.0, 10);
  laserLight.position.set(0, 0, 0.5);
  laserGroup.add(laserLight);

  var baseGeo = new THREE.BoxGeometry(0.22, 0.22, 0.35);
  var baseMat = new THREE.MeshStandardMaterial({ color:0x445566, metalness:0.5, roughness:0.4, emissive:0x001122 });
  var base = new THREE.Mesh(baseGeo, baseMat);
  base.position.z = -0.32;
  laserGroup.add(base);

  var iGeo = new THREE.SphereGeometry(0.045, 8, 8);
  var iMat = new THREE.MeshBasicMaterial({ color:0x00ff88 });
  laserIndicator = new THREE.Mesh(iGeo, iMat);
  laserIndicator.position.set(0.09, 0.09, -0.32);
  laserGroup.add(laserIndicator);

  var legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
  var legMat = new THREE.MeshStandardMaterial({ color:0x556677 });
  var leg = new THREE.Mesh(legGeo, legMat);
  leg.position.set(0, -0.41, -0.32);
  laserGroup.add(leg);

  var srcPos = src || new THREE.Vector3(-3.2, 0, 0);
  var tgt = target || new THREE.Vector3(-0.79, 0, 0);
  laserGroup.position.copy(srcPos);
  laserGroup.lookAt(tgt);
  laserGroup.scale.set(0.5, 0.5, 0.5);
  scene.add(laserGroup);
}

function updateLaserPosition() {
  if (!laserGroup) return;
  var theta = odState.angle * Math.PI / 180;
  var d = 3.2;
  var srcPos = new THREE.Vector3(-d*Math.cos(theta), -d*Math.sin(theta), 0);
  laserGroup.position.copy(srcPos);
  laserGroup.lookAt(target || new THREE.Vector3(-0.79, 0, 0));
  laserGroup.scale.set(0.5, 0.5, 0.5);
}

/* ─── HIT MARKER ─── */
function buildHitMarker() {
  if (hitMarker) { scene.remove(hitMarker); hitMarker.geometry.dispose(); hitMarker.material.dispose(); }
  var g = new THREE.RingGeometry(0.08, 0.11, 32);
  var m = new THREE.MeshBasicMaterial({ color:0xffdd44, transparent:true, opacity:0.35, side:THREE.DoubleSide, blending:THREE.AdditiveBlending });
  hitMarker = new THREE.Mesh(g, m);
  var pt = target || new THREE.Vector3(-0.79, 0, 0);
  hitMarker.position.copy(pt);
  hitMarker.lookAt(camera.position);
  scene.add(hitMarker);
}

function updateHitMarker() {
  if (!hitMarker) return;
  var pt = target || new THREE.Vector3(-0.79, 0, 0);
  hitMarker.position.copy(pt);
  hitMarker.lookAt(camera.position);
}

/* ─── LATTICE BUILDER ─── */
function buildLattice(a) {
  atoms.forEach(function(m){ scene.remove(m); });
  bonds.forEach(function(m){ scene.remove(m); });
  freeElectrons.forEach(function(m){ scene.remove(m); });
  atoms=[]; bonds=[]; freeElectrons=[];

  var def = OD_MATERIALS[odState.mat];
  var basis = [
    [0,0,0],[0.5,0.5,0],[0.5,0,0.5],[0,0.5,0.5],
    [0.25,0.25,0.25],[0.75,0.75,0.25],[0.75,0.25,0.75],[0.25,0.75,0.75]
  ];
  var nx=2, ny=2, nz=2;
  var pos=[];
  for (var ix=0; ix<nx; ix++){
    for (var iy=0; iy<ny; iy++){
      for (var iz=0; iz<nz; iz++){
        for (var b=0; b<basis.length; b++){
          var p=basis[b];
          pos.push(new THREE.Vector3((ix+p[0])*a - (nx*a)/2, (iy+p[1])*a - (ny*a)/2, (iz+p[2])*a - (nz*a)/2));
        }
      }
    }
  }

  var aGeo = new THREE.SphereGeometry(0.12, 20, 20);
  var aMat = new THREE.MeshStandardMaterial({ color:def.color, metalness:0.4, roughness:0.4 });
  for (var i=0; i<pos.length; i++){
    var m = new THREE.Mesh(aGeo, aMat.clone()); m.position.copy(pos[i]);
    m.userData = { basePos: pos[i].clone(), idx:i };
    atoms.push(m); scene.add(m);
  }

  var maxBond = 0.45*a;
  var bGeo = new THREE.CylinderGeometry(0.022,0.022,1,8);
  var bMat = new THREE.MeshStandardMaterial({ color:def.bc, metalness:0.3, roughness:0.5 });
  for (var i=0; i<pos.length; i++){
    for (var j=i+1; j<pos.length; j++){
      var d = pos[i].distanceTo(pos[j]);
      if (d < maxBond && d > 0.01){
        var mid = new THREE.Vector3().addVectors(pos[i],pos[j]).multiplyScalar(0.5);
        var bond = new THREE.Mesh(bGeo, bMat.clone());
        bond.position.copy(mid); bond.lookAt(pos[j]); bond.rotateX(Math.PI/2); bond.scale.set(1,d,1);
        bond.userData = { basePos: mid.clone(), baseScaleY: d };
        bonds.push(bond); scene.add(bond);
      }
    }
  }

  if (def.type === 'metal'){
    var eGeo = new THREE.SphereGeometry(0.022,8,8);
    var eMat = new THREE.MeshBasicMaterial({ color:0x00f0ff, transparent:true, opacity:0.35 });
    for (var i=0; i<60; i++){
      var m = new THREE.Mesh(eGeo, eMat.clone());
      var rx=(Math.random()-0.5)*2.6, ry=(Math.random()-0.5)*2.6, rz=(Math.random()-0.5)*2.6;
      m.position.set(rx,ry,rz);
      m.userData = { basePos:new THREE.Vector3(rx,ry,rz), speed:0.6+Math.random()*1.8, phase:Math.random()*Math.PI*2 };
      freeElectrons.push(m); scene.add(m);
    }
  }
}

/* ─── FRAME ─── */
function buildFrame() {
  if (frameLines) { scene.remove(frameLines); if(frameLines.geometry) frameLines.geometry.dispose(); }
  var size = 1.6;
  var geo = new THREE.BoxGeometry(size, size, size);
  var edges = new THREE.EdgesGeometry(geo);
  var mat = new THREE.LineBasicMaterial({ color:0x00f0ff, transparent:true, opacity:0.22 });
  frameLines = new THREE.LineSegments(edges, mat);
  scene.add(frameLines);
}

/* ─── OPTICS ENGINE ─── */
function odComputeOptics(name, E, thetaDeg) {
  var mat = OD_MATERIALS[name];
  var theta = thetaDeg * Math.PI/180;
  var n=1, k=0, R=0, T=0, A=0, outcome='', theta2=0;
  var ep1, ep2;

  if (mat.type === 'metal'){
    var wp=mat.Ep, g=mat.damp;
    ep1 = 1 - wp*wp/(E*E+g*g);
    ep2 = wp*wp*g/(E*(E*E+g*g));
    if (mat.interband && E > 2.0){
      ep2 += 2.5 * Math.exp(-(E-3.5)*(E-3.5)/2.0);
    }
    var mag = Math.sqrt(ep1*ep1 + ep2*ep2);
    n = Math.sqrt((mag+ep1)/2);
    k = Math.sqrt((mag-ep1)/2);
    R = ((n-1)*(n-1)+k*k)/((n+1)*(n+1)+k*k);
    if (E < wp) { outcome='reflect'; T=0; A=Math.max(0,1-R); }
    else {
      T = Math.max(0, 1-R-0.08);
      A = Math.max(0, 1-R-T);
      outcome = (T > 0.15) ? 'transmit' : 'reflect';
    }
  } else {
    n = mat.n0;
    if (E >= mat.Eg){
      k = 0.35 * Math.exp((E-mat.Eg)/0.45);
      n = mat.n0 + 0.18*(E-mat.Eg);
      ep1 = n*n - k*k;
      ep2 = 2*n*k;
      R = ((n-1)*(n-1)+k*k)/((n+1)*(n+1)+k*k);
      T = 0; A = Math.max(0,1-R); outcome='absorb';
    } else {
      ep1 = n*n;
      ep2 = 0;
      R = Math.pow((n-1)/(n+1), 2);
      if (thetaDeg > 0) R = R + (1-R)*Math.pow(Math.sin(theta), 4);
      T = Math.max(0,1-R); A=0; outcome='transmit';
    }
  }

  if (n < 1.0 && Math.sin(theta) > n){
    outcome='reflect'; T=0; A=0; R=1; theta2=90;
  } else {
    var sin2 = Math.sin(theta)/n;
    if (sin2 >= 1) theta2 = 90;
    else theta2 = Math.asin(sin2)*180/Math.PI;
  }
  return { n:n, k:k, R:R, T:T, A:A, outcome:outcome, theta2:theta2, ep1:ep1, ep2:ep2 };
}

window.odComputeSpectra = function() {
  return odComputeOptics(odState.mat, odState.E, odState.angle);
};

window.odUpdateLiveReadouts = function() {
  var res = odComputeOptics(odState.mat, odState.E, odState.angle);
  var el;
  if (el=document.getElementById('live-material')) el.textContent = odState.mat;
  if (el=document.getElementById('live-E')) el.textContent = odState.E.toFixed(2);
  if (el=document.getElementById('live-lam')) el.textContent = wavelengthNm(odState.E);
  if (el=document.getElementById('live-theta')) el.textContent = odState.angle + '\u00b0';
  if (el=document.getElementById('live-R')) el.textContent = (res.R*100).toFixed(1);
  if (el=document.getElementById('live-T')) el.textContent = (res.T*100).toFixed(1);
  if (el=document.getElementById('live-A')) el.textContent = (res.A*100).toFixed(1);
  if (el=document.getElementById('live-n')) el.textContent = res.n.toFixed(2);
  if (el=document.getElementById('live-k')) el.textContent = res.k.toFixed(3);
  if (el=document.getElementById('live-eps1')) el.textContent = res.ep1.toFixed(3);
  if (el=document.getElementById('live-eps2')) el.textContent = res.ep2.toFixed(3);
  if (el=document.getElementById('live-theta2')) el.textContent = res.theta2.toFixed(1);
  if (el=document.getElementById('live-phonon')) el.textContent = phononTempK();
  var outEl = document.getElementById('live-outcome');
  if (outEl){
    outEl.textContent = res.outcome;
    var c = res.outcome==='reflect'?'#00f0ff':res.outcome==='transmit'?'#4ade80':'#ff4ecd';
    outEl.style.color = c; outEl.style.borderColor = c;
    outEl.style.background = c.replace(')','').replace('rgb','rgba')+'0.12)';
  }
};

window.odChangeSliderAngle = function(v){
  odState.angle = parseFloat(v);
  var el = document.getElementById('val-angle');
  if (el) el.textContent = odState.angle.toFixed(0);
  odComputeSpectra(); odUpdateLiveReadouts();
  updateLaserPosition(); updateHitMarker();
  odStartPhotonAnimation();
};

/* ─── PHOTON PACKET ─── */
function buildPhoton() {
  var g = new THREE.SphereGeometry(0.055, 16, 16);
  var m = new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.95, blending:THREE.AdditiveBlending });
  photonPacket = new THREE.Mesh(g, m);
  photonPacket.visible = false;
  scene.add(photonPacket);
  photonGlow = new THREE.PointLight(0xffffff, 0, 5);
  photonGlow.position.copy(photonPacket.position);
  scene.add(photonGlow);
}

function photonColor(E) {
  if (E < 0.5) return 0xff2200;
  if (E < 1.5) return 0xffaa00;
  if (E < 2.5) return 0xaaff00;
  if (E < 3.5) return 0x00aaff;
  if (E < 5.0) return 0xaa00ff;
  return 0x00f0ff;
}

function wavelengthNm(E){ return Math.round(1240/Math.max(E,0.01)); }

function phononTempK() { return Math.round(phonon.T0 + phonon.energy * 1800); }
function phononAmplitudeFactor() { return 1 + phonon.energy * 2.5; }
function phononScatterFactor() { return 1 + phonon.energy * 3.0; }

function spawnPhononWave() {
  var rg = new THREE.RingGeometry(0.15, 0.25, 48);
  var rm = new THREE.MeshBasicMaterial({ color:0xff6b35, transparent:true, opacity:0.55, side:THREE.DoubleSide, blending:THREE.AdditiveBlending });
  var ring = new THREE.Mesh(rg, rm);
  ring.position.set(0, 0, 0);
  ring.lookAt(camera.position);
  scene.add(ring);
  phonon.wavePool.push({ mesh:ring, t:0, life:1.6 });
}

function setupPhotonPath() {
  var theta = odState.angle * Math.PI/180;
  var d = 3.2;
  src = new THREE.Vector3(-d*Math.cos(theta), -d*Math.sin(theta), 0);
  target = new THREE.Vector3(-0.79, 0, 0);
  reflectDest = new THREE.Vector3(-0.79 - d*Math.cos(theta), d*Math.sin(theta), 0);
  updateLaserPosition();
  updateHitMarker();
}

function clearBeams() {
  if (incidentBeam) { scene.remove(incidentBeam); if(incidentBeam.geometry) incidentBeam.geometry.dispose(); if(incidentBeam.material) incidentBeam.material.dispose(); incidentBeam=null; }
  if (reflectedBeam) { scene.remove(reflectedBeam); if(reflectedBeam.geometry) reflectedBeam.geometry.dispose(); if(reflectedBeam.material) reflectedBeam.material.dispose(); reflectedBeam=null; }
  if (transmittedBeam) { scene.remove(transmittedBeam); if(transmittedBeam.geometry) transmittedBeam.geometry.dispose(); if(transmittedBeam.material) transmittedBeam.material.dispose(); transmittedBeam=null; }
}

function drawBeam(a, b, color, opacity) {
  var pts = [a.clone(), b.clone()];
  var geo = new THREE.BufferGeometry().setFromPoints(pts);
  var mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending });
  var line = new THREE.Line(geo, mat);
  scene.add(line);
  return line;
}

function spawnReflectEffect() {
  microEffects.push({ type:'reflect', t0:time, life:0.8 });
  var def = OD_MATERIALS[odState.mat];
  if (def.type === 'metal'){
    var rg = new THREE.RingGeometry(0.08, 0.14, 32);
    var rm = new THREE.MeshBasicMaterial({ color:0x00f0ff, transparent:true, opacity:0.6, side:THREE.DoubleSide });
    var ring = new THREE.Mesh(rg, rm); ring.position.copy(target); ring.lookAt(camera.position); scene.add(ring);
    absorbEffects.push({ mesh:ring, t:0, life:0.7, isRing:true });
  }
}

function spawnTransmitEffect() {
  microEffects.push({ type:'transmit', t0:time, life:1.0 });
}

/* ─── FIRE / RESOLVE ─── */
window.odStartPhotonAnimation = function() {
  if (photonState !== 'idle') return;
  setupPhotonPath();
  clearBeams();
  var col = photonColor(odState.E);
  incidentBeam = drawBeam(src, target, col, 0.35);
  photonPacket.material.color.setHex(col);
  photonGlow.color.setHex(col);
  photonPacket.visible = true;
  photonPacket.position.copy(src);
  photonGlow.position.copy(src);
  photonGlow.intensity = 1.3;
  photonState = 'firing'; photonT = 0;
  if (laserIndicator) laserIndicator.material.color.setHex(col);
};

function resolveHit() {
  var res = odComputeOptics(odState.mat, odState.E, odState.angle);
  if (res.outcome === 'reflect'){
    photonState = 'reflecting'; photonT = 0;
    var col = photonColor(odState.E);
    reflectedBeam = drawBeam(target, reflectDest, col, 0.35);
    spawnReflectEffect();
  } else if (res.outcome === 'transmit'){
    photonState = 'transmitting'; photonT = 0;
    var theta = odState.angle * Math.PI/180;
    var sin2 = Math.sin(theta) / res.n;
    var th2 = (sin2 >= 1) ? (Math.PI/2 - 0.02) : Math.asin(sin2);
    var d = 3.2;
    transmitDest = new THREE.Vector3(-0.79 + d*Math.cos(th2), d*Math.sin(th2), 0);
    var col = photonColor(odState.E);
    transmittedBeam = drawBeam(target, transmitDest, col, 0.35);
    spawnTransmitEffect();
  } else {
    photonState = 'idle';
    photonPacket.visible = false; photonGlow.intensity = 0;
    spawnAbsorb(res);
    var deposit = odState.E * phonon.coupling * res.A;
    phonon.energy += deposit;
    phonon.scatterScale = Math.min(1, phonon.energy * 0.4);
    if (deposit > 0.3) spawnPhononWave();
    odUpdateLiveReadouts();
    updateOverlay();
  }
}

function spawnAbsorb(res) {
  var def = OD_MATERIALS[odState.mat];
  if (def.type === 'metal'){
    var rg = new THREE.RingGeometry(0.1, 0.18, 32);
    var rm = new THREE.MeshBasicMaterial({ color:0xff6600, transparent:true, opacity:0.8, side:THREE.DoubleSide });
    var ring = new THREE.Mesh(rg, rm); ring.position.copy(target); ring.lookAt(camera.position); scene.add(ring);
    absorbEffects.push({ mesh:ring, t:0, life:1.0, isRing:true });
    freeElectrons.forEach(function(e){
      if (e.position.distanceTo(target) < 0.6){
        e.userData.speed *= 3.0;
        setTimeout(function(){ e.userData.speed /= 3.0; }, 600);
      }
    });
  } else if (def.type === 'ins'){
    var rg = new THREE.RingGeometry(0.05, 0.12, 32);
    var rm = new THREE.MeshBasicMaterial({ color:0xffaa00, transparent:true, opacity:0.7, side:THREE.DoubleSide });
    var ring = new THREE.Mesh(rg, rm); ring.position.copy(target); ring.lookAt(camera.position); scene.add(ring);
    absorbEffects.push({ mesh:ring, t:0, life:1.2, isRing:true });
  } else {
    var eGeo = new THREE.SphereGeometry(0.05, 12, 12);
    var eMat = new THREE.MeshBasicMaterial({ color:0x00f0ff, transparent:true, opacity:0.9 });
    var hMat = new THREE.MeshBasicMaterial({ color:0xff4ecd, transparent:true, opacity:0.9 });
    var ePart = new THREE.Mesh(eGeo, eMat); var hPart = new THREE.Mesh(eGeo, hMat);
    ePart.position.copy(target); hPart.position.copy(target); scene.add(ePart); scene.add(hPart);
    absorbEffects.push({ mesh:ePart, t:0, life:1.2, dx:0.35, dy:0.55, dz:0.15 });
    absorbEffects.push({ mesh:hPart, t:0, life:1.2, dx:-0.15, dy:-0.25, dz:-0.1 });
  }
}

function resetPhoton() {
  photonState = 'idle';
  photonPacket.visible = false;
  photonGlow.intensity = 0;
  clearBeams();
  if (laserIndicator) laserIndicator.material.color.setHex(0x00ff88);
}

/* ─── ANIMATION ─── */
function animate() {
  animId = requestAnimationFrame(animate);
  var dt = 0.016; time += dt;

  // ── PHONON DECAY ──
  if (phonon.energy > 0) {
    phonon.energy = Math.max(0, phonon.energy - phonon.decayRate * dt);
    phonon.scatterScale = Math.min(1, phonon.energy * 0.4);
    if (phonon.energy < 0.01) { phonon.energy = 0; phonon.scatterScale = 0; }
  }

  var ampFactor = phononAmplitudeFactor();
  var scatFactor = phononScatterFactor();

  // ── THERMAL LATTICE VIBRATION (phonon-enhanced) ──
  atoms.forEach(function(a, i){
    var bp = a.userData.basePos;
    if (!bp) return;
    var t = time + i*1.3;
    a.position.x = bp.x + Math.sin(t*2.3)*0.018 * ampFactor;
    a.position.y = bp.y + Math.cos(t*1.7)*0.018 * ampFactor;
    a.position.z = bp.z + Math.sin(t*3.1)*0.018 * ampFactor;
  });

  // ── BOND VISUAL RESPONSE TO PHONONS ──
  bonds.forEach(function(b, i){
    var bp = b.userData.basePos;
    if (!bp) return;
    var t = time + i*0.7;
    var stretch = 1 + Math.sin(t*4.2)*0.004 * ampFactor;
    b.position.x = bp.x + Math.sin(t*1.9)*0.008 * ampFactor;
    b.position.y = bp.y + Math.cos(t*2.7)*0.008 * ampFactor;
    b.position.z = bp.z + Math.sin(t*3.3)*0.008 * ampFactor;
    b.scale.y = b.userData.baseScaleY * stretch;
  });

  // ── FREE ELECTRON SEA (phonon scattering) ──
  freeElectrons.forEach(function(e){
    var bp = e.userData.basePos;
    var ph = e.userData.phase;
    var sp = e.userData.speed;
    e.position.x = bp.x + Math.sin(time*sp + ph)*0.14;
    e.position.y = bp.y + Math.cos(time*sp*0.7 + ph)*0.14;
    e.position.z = bp.z + Math.sin(time*sp*1.3 + ph)*0.14;
    if (phonon.scatterScale > 0) {
      e.position.x += (Math.random()-0.5)*0.12 * phonon.scatterScale * scatFactor;
      e.position.y += (Math.random()-0.5)*0.12 * phonon.scatterScale * scatFactor;
      e.position.z += (Math.random()-0.5)*0.12 * phonon.scatterScale * scatFactor;
    }
  });

  // ── FRAME PULSE ──
  if (frameLines) frameLines.material.opacity = 0.18 + Math.sin(time*1.5)*0.07;

  // ── LASER EMITTER PULSE ──
  if (laserEmitter) laserEmitter.material.opacity = 0.4 + Math.sin(time*4)*0.2;

  // ── HIT MARKER PULSE ──
  if (hitMarker) {
    hitMarker.material.opacity = 0.2 + Math.sin(time*3)*0.15;
    hitMarker.lookAt(camera.position);
  }

  var speed = 2.6;
  if (photonState === 'firing'){
    photonT += dt*speed;
    if (photonT >= 1){ photonT=1; resolveHit(); }
    else { photonPacket.position.lerpVectors(src,target,photonT); photonGlow.position.copy(photonPacket.position); }
  } else if (photonState === 'reflecting'){
    photonT += dt*speed;
    if (photonT >= 1){ resetPhoton(); }
    else { photonPacket.position.lerpVectors(target,reflectDest,photonT); photonGlow.position.copy(photonPacket.position); }
  } else if (photonState === 'transmitting'){
    photonT += dt*speed;
    if (photonT >= 1){ resetPhoton(); }
    else { photonPacket.position.lerpVectors(target,transmitDest,photonT); photonGlow.position.copy(photonPacket.position); }
  }

  if (photonPacket.visible) photonGlow.position.copy(photonPacket.position);

  // ── BEAM FADE ──
  [incidentBeam, reflectedBeam, transmittedBeam].forEach(function(beam){
    if (beam && beam.material.opacity > 0){ beam.material.opacity -= dt * 0.25; }
  });

  // ── MICROSCOPIC EFFECTS ──
  for (var i=microEffects.length-1; i>=0; i--){
    var fx = microEffects[i];
    var age = time - fx.t0;
    if (age >= fx.life){ microEffects.splice(i,1); continue; }
    var p = age / fx.life;
    if (fx.type === 'reflect'){
      atoms.forEach(function(a){
        if (a.userData.basePos.x < -0.5){
          var bp = a.userData.basePos;
          var amp = 0.035 * Math.sin(p*Math.PI) * Math.exp(-age*3);
          a.position.y = bp.y + Math.sin(time*9 + a.userData.idx)*amp;
          a.position.z = bp.z + Math.cos(time*7 + a.userData.idx)*amp;
        }
      });
    } else if (fx.type === 'transmit'){
      var waveX = -0.79 + p * 1.6;
      atoms.forEach(function(a){
        var dx = a.userData.basePos.x - waveX;
        if (Math.abs(dx) < 0.35){
          var shift = 0.05 * Math.sin(p*Math.PI) * Math.exp(-dx*dx*12);
          a.position.y += shift * Math.sin(odState.angle * Math.PI/180);
        }
      });
    }
  }

  // ── ABSORB EFFECTS ──
  for (var i=absorbEffects.length-1; i>=0; i--){
    var fx = absorbEffects[i]; fx.t += dt;
    if (fx.t >= fx.life){ scene.remove(fx.mesh); if(fx.mesh.geometry)fx.mesh.geometry.dispose(); if(fx.mesh.material)fx.mesh.material.dispose(); absorbEffects.splice(i,1); continue; }
    var p = fx.t / fx.life;
    if (fx.isRing){
      var s = 1 + p*5; fx.mesh.scale.set(s,s,1);
      fx.mesh.material.opacity = 0.8*(1-p);
    } else {
      fx.mesh.position.x = target.x + fx.dx*p;
      fx.mesh.position.y = target.y + fx.dy*p;
      fx.mesh.position.z = target.z + fx.dz*p;
      fx.mesh.material.opacity = 0.9*(1-p);
    }
  }

  // ── PHONON WAVE RINGS ──
  for (var i=phonon.wavePool.length-1; i>=0; i--){
    var w = phonon.wavePool[i];
    w.t += dt;
    if (w.t >= w.life) {
      scene.remove(w.mesh);
      if (w.mesh.geometry) w.mesh.geometry.dispose();
      if (w.mesh.material) w.mesh.material.dispose();
      phonon.wavePool.splice(i, 1);
      continue;
    }
    var prog = w.t / w.life;
    var s = 1 + prog * 7;
    w.mesh.scale.set(s, s, 1);
    w.mesh.material.opacity = 0.55 * (1 - prog);
    w.mesh.lookAt(camera.position);
  }

  // update readout if phonon decay changed temperature
  if (Math.round(time*10) % 6 === 0) {
    var el = document.getElementById('live-phonon');
    if (el) el.textContent = phononTempK();
    updateOverlay();
  }

  if (controls) controls.update();
  renderer.render(scene, camera);
}

function odOnResize() {
  if (!container || !renderer || !camera) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}
window.odOnResize = odOnResize;

/* ─── UI WIRING ─── */
window.odSetMaterial = function(name){
  if (!OD_MATERIALS[name]) return;
  odState.mat = name;
  document.querySelectorAll('.preset-btn').forEach(function(b){ b.classList.remove('active'); });
  var btns = Array.from(document.querySelectorAll('.preset-btn'));
  for (var i=0; i<btns.length; i++){
    if (btns[i].textContent.trim().toLowerCase() === OD_MATERIALS[name].label.toLowerCase()){
      btns[i].classList.add('active'); break;
    }
  }

  // reset phonon bath on material switch
  phonon.energy = 0;
  phonon.scatterScale = 0;
  phonon.wavePool.forEach(function(w){ scene.remove(w.mesh); if(w.mesh.geometry)w.mesh.geometry.dispose(); if(w.mesh.material)w.mesh.material.dispose(); });
  phonon.wavePool = [];

  buildLattice(1.0);
  buildFrame();
  buildLaser();
  buildHitMarker();
  odComputeSpectra(); odUpdateLiveReadouts();
  odUpdateSpectralPlots();
  updateOverlay();
};

window.odChangeSliderE = function(v){
  odState.E = parseFloat(v);
  var el = document.getElementById('val-E');
  if (el) el.textContent = odState.E.toFixed(2);
  var lamEl = document.getElementById('val-lam');
  if (lamEl) lamEl.textContent = wavelengthNm(odState.E);
  odComputeSpectra(); odUpdateLiveReadouts();
  odUpdateSpectralPlots();
};

/* ═══════════════════════════════════════════════════════════════
   SPECTRAL RESPONSE ENGINE — ε(E), n(E), κ(E), R(E), T(E), A(E)
   + 2D Canvas ray diagram
   ═══════════════════════════════════════════════════════════════ */

/* ─── Lorentz / Drude helpers ─── */
function _odDrude(E, Ep, gamma) {
  var Ep2 = Ep * Ep;
  var E2 = E * E;
  var g2 = gamma * gamma;
  var den = E2 + g2;
  var eps1 = 1.0 - Ep2 / den;
  var eps2 = Ep2 * gamma / (E * den);
  return { eps1: eps1, eps2: eps2 };
}

function _odLorentz(E, mat) {
  var wTO2 = mat.omegaTO * mat.omegaTO;
  var E2 = E * E;
  var diff = mat.eps0 - mat.epsInf;
  var shift = wTO2 - E2;
  var damp = mat.damp * E;
  var den = shift * shift + damp * damp;
  var eps1 = mat.epsInf + diff * wTO2 * shift / den;
  var eps2 = diff * wTO2 * damp / den;
  return { eps1: eps1, eps2: eps2 };
}

function _odOptical(E, matName) {
  var mat = OD_MATERIALS[matName];
  var res;
  if (mat.model === 'lorentz') {
    res = _odLorentz(Math.max(E, 1e-4), mat);
  } else {
    res = _odDrude(Math.max(E, 1e-4), mat.Ep, mat.damp);
    if (mat.interband && E > 2.0) {
      var ib = mat.interband;
      var dE = E - ib.center;
      res.eps2 += ib.strength * Math.exp(-(dE * dE) / ib.width);
    }
  }
  var eps1 = res.eps1;
  var eps2 = res.eps2;
  var absEps = Math.sqrt(eps1 * eps1 + eps2 * eps2);
  var n = Math.sqrt(Math.max(0.0, (absEps + eps1) * 0.5));
  var k = Math.sqrt(Math.max(0.0, (absEps - eps1) * 0.5));
  var R = ((n - 1.0) * (n - 1.0) + k * k) / ((n + 1.0) * (n + 1.0) + k * k);

  /* toy bulk transmission through material-dependent thickness */
  var thick_nm = (mat.model === 'lorentz') ? 5000.0 : 80.0;
  var alpha = 2.0 * E * k / 197.3; /* nm^-1, ħc ≈ 197.3 eV·nm */
  var T = (1.0 - R) * Math.exp(-alpha * thick_nm);
  var A = Math.max(0.0, 1.0 - R - T);
  return { eps1: eps1, eps2: eps2, n: n, k: k, R: R, T: T, A: A };
}

/* ─── Curve generation ─── */
function _odGenerateCurves(matName) {
  var N = 500;
  var logMin = -2.0, logMax = 1.4;
  var Earr = [], eps1 = [], eps2 = [], narr = [], karr = [], Rarr = [], Tarr = [], Aarr = [];
  for (var i = 0; i < N; i++) {
    var f = i / (N - 1);
    var logE = logMin + f * (logMax - logMin);
    var E = Math.pow(10.0, logE);
    Earr.push(E);
    var o = _odOptical(E, matName);
    eps1.push(o.eps1); eps2.push(o.eps2);
    narr.push(o.n); karr.push(o.k);
    Rarr.push(o.R); Tarr.push(o.T); Aarr.push(o.A);
  }
  return { E: Earr, eps1: eps1, eps2: eps2, n: narr, k: karr, R: Rarr, T: Tarr, A: Aarr };
}

var _odSpecData = null;
var _odSpecCanvas = null;
var _odSpecCtx = null;

function _odEnergyToColor(E) {
  if (E < 1.55) return '#ff3333';
  if (E < 1.77) return '#ff8800';
  if (E < 2.1)  return '#ffdd00';
  if (E < 2.5)  return '#33ff66';
  if (E < 2.9)  return '#33ffff';
  if (E < 3.4)  return '#3388ff';
  return '#aa55ff';
}

function _odDrawSpectralScene(o) {
  var c = _odSpecCanvas, ctx = _odSpecCtx;
  if (!c || !ctx) return;
  var w = c.width, h = c.height;
  ctx.clearRect(0, 0, w, h);

  /* grid */
  ctx.strokeStyle = '#111122';
  ctx.lineWidth = 1;
  for (var gx = 0; gx < w; gx += 36) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
  for (var gy = 0; gy < h; gy += 36) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

  var cx = w / 2, cy = h / 2;
  var sw = 90, sh = 110;
  var mat = OD_MATERIALS[odState.mat];
  var pc = _odEnergyToColor(odState.E);

  /* slab */
  ctx.fillStyle = '#' + ('000000' + mat.color.toString(16)).slice(-6);
  ctx.globalAlpha = 0.22;
  ctx.fillRect(cx - sw / 2, cy - sh / 2, sw, sh);
  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = '#' + ('000000' + mat.color.toString(16)).slice(-6);
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - sw / 2, cy - sh / 2, sw, sh);
  if (mat.model === 'lorentz') {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(cx - sw / 2 + 8, cy - sh / 2 + 8);
    ctx.lineTo(cx + sw / 2 - 8, cy + sh / 2 - 8);
    ctx.moveTo(cx + sw / 2 - 8, cy - sh / 2 + 8);
    ctx.lineTo(cx - sw / 2 + 8, cy + sh / 2 - 8);
    ctx.stroke();
  }

  /* labels */
  ctx.fillStyle = '#ccc'; ctx.font = '13px Segoe UI, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(mat.label, cx, cy + sh / 2 + 20);
  ctx.fillStyle = '#888'; ctx.font = '11px monospace';
  ctx.fillText(odState.E.toFixed(3) + ' eV', cx, cy + sh / 2 + 36);

  /* incident */
  ctx.strokeStyle = pc; ctx.lineWidth = 3; ctx.globalAlpha = 1.0;
  ctx.beginPath(); ctx.moveTo(40, cy); ctx.lineTo(cx - sw / 2 - 6, cy); ctx.stroke();
  /* packet */
  ctx.fillStyle = pc; ctx.shadowColor = pc; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(cx - sw / 2 - 6, cy, 5, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  /* reflected */
  if (o.R > 0.03) {
    ctx.strokeStyle = pc; ctx.lineWidth = 2 + o.R * 5;
    ctx.globalAlpha = Math.min(1.0, o.R + 0.15);
    ctx.beginPath(); ctx.moveTo(cx - sw / 2, cy); ctx.lineTo(60, cy - 70); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(60, cy - 70); ctx.lineTo(70, cy - 62); ctx.lineTo(66, cy - 76); ctx.closePath();
    ctx.fillStyle = pc; ctx.fill();
  }
  /* transmitted */
  if (o.T > 0.03) {
    ctx.strokeStyle = pc; ctx.lineWidth = 2 + o.T * 5;
    ctx.globalAlpha = Math.min(1.0, o.T + 0.15);
    ctx.beginPath(); ctx.moveTo(cx + sw / 2, cy); ctx.lineTo(w - 40, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - 40, cy); ctx.lineTo(w - 52, cy - 7); ctx.lineTo(w - 52, cy + 7); ctx.closePath();
    ctx.fillStyle = pc; ctx.fill();
  }
  /* absorption glow */
  if (o.A > 0.05) {
    ctx.globalAlpha = Math.min(0.75, o.A);
    var g = ctx.createRadialGradient(cx, cy, 4, cx, cy, sw * 0.55);
    if (mat.model === 'lorentz') {
      g.addColorStop(0, 'rgba(255,107,53,0.85)'); g.addColorStop(1, 'rgba(255,107,53,0)');
    } else {
      g.addColorStop(0, 'rgba(0,240,255,0.55)'); g.addColorStop(1, 'rgba(0,240,255,0)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(cx - sw / 2 - 10, cy - sh / 2 - 10, sw + 20, sh + 20);

    /* phonon rings for NaCl */
    if (mat.model === 'lorentz') {
      ctx.strokeStyle = '#ff6b35'; ctx.lineWidth = 2;
      var now = Date.now() / 250;
      for (var ri = 8; ri < 42; ri += 10) {
        var pulse = (Math.sin(now + ri * 0.25) + 1.0) * 0.5;
        ctx.globalAlpha = pulse * o.A * 0.9;
        ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI * 2); ctx.stroke();
      }
    }
    /* electron oscillation rings for metals below plasma edge */
    if (mat.type === 'metal' && odState.E < mat.Ep) {
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 1.5;
      var t2 = Date.now() / 200;
      for (var r2 = 8; r2 < 36; r2 += 12) {
        var p2 = (Math.sin(t2 + r2 * 0.3) + 1.0) * 0.5;
        ctx.globalAlpha = p2 * (1.0 - o.R) * 0.7;
        ctx.beginPath(); ctx.arc(cx - sw * 0.22, cy, r2, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1.0;

  /* corner text */
  ctx.fillStyle = '#666'; ctx.font = '11px monospace'; ctx.textAlign = 'left';
  ctx.fillText('R ' + (o.R * 100).toFixed(1) + '%', 8, 16);
  ctx.fillText('T ' + (o.T * 100).toFixed(1) + '%', 8, 32);
  ctx.fillText('A ' + (o.A * 100).toFixed(1) + '%', 8, 48);

  requestAnimationFrame(function() {
    var o2 = _odOptical(odState.E, odState.mat);
    _odDrawSpectralScene(o2);
  });
}

function _odInitSpectralPlots() {
  if (typeof Plotly === 'undefined') return;
  _odSpecData = _odGenerateCurves(odState.mat);

  Plotly.newPlot('plot-eps', [
    { x: _odSpecData.E, y: _odSpecData.eps1, name: 'ε₁ · real part', type: 'scatter', mode: 'lines',
      line: { color: '#00f0ff', width: 2 } },
    { x: _odSpecData.E, y: _odSpecData.eps2, name: 'ε₂ · imag part', type: 'scatter', mode: 'lines',
      line: { color: '#ff4ecd', width: 2 } },
    { x: _odSpecData.E, y: _odSpecData.n, name: 'n · refractive index', type: 'scatter', mode: 'lines', visible: 'legendonly',
      line: { color: '#4ade80', width: 1, dash: 'dot' } },
    { x: _odSpecData.E, y: _odSpecData.k, name: 'κ · extinction coeff', type: 'scatter', mode: 'lines', visible: 'legendonly',
      line: { color: '#ff6b35', width: 1, dash: 'dot' } }
  ], {
    paper_bgcolor: '#0a0a1a', plot_bgcolor: '#0a0a1a',
    font: { color: '#bbb', size: 11 },
    title: { text: 'Dielectric Function ε = ε₁ + iε₂  and  Optical Constants n, κ', font: { color: '#ccc', size: 13 } },
    xaxis: { title: 'Photon Energy E (eV)', type: 'log', gridcolor: '#1a1a2e', color: '#888' },
    yaxis: { title: 'Value', gridcolor: '#1a1a2e', color: '#888' },
    margin: { t: 36, b: 40, l: 52, r: 16 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,26,0.7)', font: { size: 10 } },
    hovermode: 'x unified'
  }, { displayModeBar: false, responsive: true });

  Plotly.newPlot('plot-rt', [
    { x: _odSpecData.E, y: _odSpecData.R, name: 'Reflectivity R', type: 'scatter', mode: 'lines',
      line: { color: '#4ade80', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.08)' },
    { x: _odSpecData.E, y: _odSpecData.T, name: 'Transmission T', type: 'scatter', mode: 'lines',
      line: { color: '#00f0ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' },
    { x: _odSpecData.E, y: _odSpecData.A, name: 'Absorption A', type: 'scatter', mode: 'lines',
      line: { color: '#ff6b35', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(255,107,53,0.06)' }
  ], {
    paper_bgcolor: '#0a0a1a', plot_bgcolor: '#0a0a1a',
    font: { color: '#bbb', size: 11 },
    title: { text: 'Reflectivity · Transmission · Absorption', font: { color: '#ccc', size: 13 } },
    xaxis: { title: 'Photon Energy E (eV)', type: 'log', gridcolor: '#1a1a2e', color: '#888' },
    yaxis: { title: 'Fraction', gridcolor: '#1a1a2e', color: '#888', range: [0, 1.05] },
    margin: { t: 36, b: 40, l: 52, r: 16 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,26,0.7)', font: { size: 10 } },
    hovermode: 'x unified'
  }, { displayModeBar: false, responsive: true });
}

function _odUpdateSpectralCursor() {
  if (typeof Plotly === 'undefined' || !_odSpecData) return;
  var E = odState.E;
  var o = _odOptical(E, odState.mat);

  var shapeLine = {
    type: 'line',
    line: { color: '#ffffff', width: 1.5, dash: 'dash' }
  };

  if (document.getElementById('plot-eps')) {
    Plotly.relayout('plot-eps', {
      shapes: [ Object.assign({}, shapeLine, { x0: E, x1: E, y0: -50, y1: 50 }) ]
    });
  }
  if (document.getElementById('plot-rt')) {
    Plotly.relayout('plot-rt', {
      shapes: [ Object.assign({}, shapeLine, { x0: E, x1: E, y0: 0, y1: 1.05 }) ]
    });
  }

  /* readout bar */
  var rEl = document.getElementById('spec-R');
  if (rEl) rEl.textContent = (o.R * 100).toFixed(1) + '%';
  var tEl = document.getElementById('spec-T');
  if (tEl) tEl.textContent = (o.T * 100).toFixed(1) + '%';
  var aEl = document.getElementById('spec-A');
  if (aEl) aEl.textContent = (o.A * 100).toFixed(1) + '%';
  var nkEl = document.getElementById('spec-nk');
  if (nkEl) nkEl.textContent = o.n.toFixed(3) + ' · ' + o.k.toFixed(3);
  var epsEl = document.getElementById('spec-eps');
  if (epsEl) epsEl.textContent = o.eps1.toFixed(2) + ' · ' + o.eps2.toFixed(2);

  var hintEl = document.getElementById('spec-scene-hint');
  if (hintEl) hintEl.textContent = OD_MATERIALS[odState.mat].label + ' @ ' + E.toFixed(3) + ' eV — ' + OD_MATERIALS[odState.mat].label;

  _odDrawSpectralScene(o);
}

window.odUpdateSpectralPlots = function() {
  if (!_odSpecData || _odSpecData.mat !== odState.mat) {
    _odSpecData = _odGenerateCurves(odState.mat);
    _odSpecData.mat = odState.mat;
    _odInitSpectralPlots();
  }
  _odUpdateSpectralCursor();
};

window.odInitSpectralEngine = function() {
  _odSpecCanvas = document.getElementById('spec-canvas');
  if (_odSpecCanvas) _odSpecCtx = _odSpecCanvas.getContext('2d');
  _odSpecData = null;
  _odInitSpectralPlots();
  _odUpdateSpectralCursor();
  _odInitThinFilmPlot();
};

/* ═══════════════════════════════════════════════════════════════
   THIN FILM SPECTRAL PLOT  R(λ) & T(λ)
   ═══════════════════════════════════════════════════════════════ */
var _tfPlotData = null;

function _tfComputeAiryAtLambda(lam_nm) {
  /* Compute Airy R and T at a given λ using current eqState */
  var th1 = eqState.theta1 * Math.PI / 180;
  var n1 = eqState.n1, n2 = eqState.n2, n3 = eqState.n3;
  var d_nm = eqState.d;
  var s2 = n1 * Math.sin(th1) / n2;
  if (Math.abs(s2) > 1) return {R:1, T:0};
  var th2 = Math.asin(s2);
  var s3 = n1 * Math.sin(th1) / n3;
  if (Math.abs(s3) > 1) return {R:1, T:0};
  var th3 = Math.asin(s3);
  var c1 = Math.cos(th1), c2 = Math.cos(th2), c3 = Math.cos(th3);
  var r12 = (n1*c1 - n2*c2) / (n1*c1 + n2*c2);
  var t12 = (2*n1*c1) / (n1*c1 + n2*c2);
  var r23 = (n2*c2 - n3*c3) / (n2*c2 + n3*c3);
  var t23 = (2*n2*c2) / (n2*c2 + n3*c3);
  var beta = (2 * Math.PI / lam_nm) * n2 * d_nm * c2;
  var e2ib = { re: Math.cos(2*beta), im: Math.sin(2*beta) };
  var numR = { re: r12 + r23*e2ib.re, im: r23*e2ib.im };
  var den  = { re: 1 + r12*r23*e2ib.re, im: r12*r23*e2ib.im };
  var denMag2 = den.re*den.re + den.im*den.im;
  var R = (numR.re*numR.re + numR.im*numR.im) / denMag2;
  var numT = { re: t12*t23*Math.cos(beta), im: t12*t23*Math.sin(beta) };
  var Tamp2 = (numT.re*numT.re + numT.im*numT.im) / denMag2;
  var T = (n3 * c3 / (n1 * c1)) * Tamp2;
  return {R:R, T:T};
}

function _odGenerateThinFilmCurves() {
  var lam = [];
  var R = [], T = [];
  for (var i = 300; i <= 1200; i += 5) {
    var a = _tfComputeAiryAtLambda(i);
    lam.push(i);
    R.push(a.R);
    T.push(a.T);
  }
  return { lam: lam, R: R, T: T };
}

window._odInitThinFilmPlot = function() {
  if (typeof Plotly === 'undefined') return;
  var data = _odGenerateThinFilmCurves();
  _tfPlotData = data;
  Plotly.newPlot('tf-plot-RT', [
    { x: data.lam, y: data.R, name: 'R(λ) · Reflectivity', type: 'scatter', mode: 'lines',
      line: { color: '#4ade80', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.08)' },
    { x: data.lam, y: data.T, name: 'T(λ) · Transmission', type: 'scatter', mode: 'lines',
      line: { color: '#00f0ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' }
  ], {
    paper_bgcolor: '#0a0a1a', plot_bgcolor: '#0a0a1a',
    font: { color: '#bbb', size: 11 },
    title: { text: 'Thin Film Airy Interference  R(λ) & T(λ)', font: { color: '#ccc', size: 13 } },
    xaxis: { title: 'Wavelength λ (nm)', gridcolor: '#1a1a2e', color: '#888' },
    yaxis: { title: 'Fraction', gridcolor: '#1a1a2e', color: '#888', range: [0, 1.05] },
    margin: { t: 36, b: 40, l: 52, r: 16 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,26,0.7)', font: { size: 10 } },
    hovermode: 'x unified',
    shapes: [{
      type: 'line',
      line: { color: '#ffffff', width: 1.5, dash: 'dash' },
      x0: eqState.lambda, x1: eqState.lambda, y0: 0, y1: 1.05
    }]
  }, { displayModeBar: false, responsive: true });
};

window._odUpdateThinFilmCursor = function() {
  if (typeof Plotly === 'undefined' || !document.getElementById('tf-plot-RT')) return;
  Plotly.relayout('tf-plot-RT', {
    shapes: [{
      type: 'line',
      line: { color: '#ffffff', width: 1.5, dash: 'dash' },
      x0: eqState.lambda, x1: eqState.lambda, y0: 0, y1: 1.05
    }]
  });
};

window._odRefreshThinFilmPlot = function() {
  if (typeof Plotly === 'undefined') return;
  var data = _odGenerateThinFilmCurves();
  _tfPlotData = data;
  Plotly.react('tf-plot-RT', [
    { x: data.lam, y: data.R, name: 'R(λ) · Reflectivity', type: 'scatter', mode: 'lines',
      line: { color: '#4ade80', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(74,222,128,0.08)' },
    { x: data.lam, y: data.T, name: 'T(λ) · Transmission', type: 'scatter', mode: 'lines',
      line: { color: '#00f0ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.06)' }
  ], {
    paper_bgcolor: '#0a0a1a', plot_bgcolor: '#0a0a1a',
    font: { color: '#bbb', size: 11 },
    title: { text: 'Thin Film Airy Interference  R(λ) & T(λ)', font: { color: '#ccc', size: 13 } },
    xaxis: { title: 'Wavelength λ (nm)', gridcolor: '#1a1a2e', color: '#888' },
    yaxis: { title: 'Fraction', gridcolor: '#1a1a2e', color: '#888', range: [0, 1.05] },
    margin: { t: 36, b: 40, l: 52, r: 16 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,26,0.7)', font: { size: 10 } },
    hovermode: 'x unified',
    shapes: [{
      type: 'line',
      line: { color: '#ffffff', width: 1.5, dash: 'dash' },
      x0: eqState.lambda, x1: eqState.lambda, y0: 0, y1: 1.05
    }]
  }, { displayModeBar: false, responsive: true });
};

window.initODMacro3D = function(){ /* unified into initOD */ };
window.initODMicro3D = function(){ /* unified into initOD */ };

/* ═══════════════════════════════════════════════════════════════
   NEW SECTIONS: Skin Depth, Brewster Angle, and Colour Rendering
   ═══════════════════════════════════════════════════════════════ */

/* ─── CIE 1931 Standard Observer (x̄, ȳ, z̄) + D65 illuminant,
   sampled every 5 nm from 380–780 nm (81 points).
   Sources: CIE 15:2004 Colorimetry, 3rd Ed. (tabulated)        ─── */
var _CIE_X = [0.001,0.005,0.018,0.038,0.061,0.091,0.131,0.189,0.285,0.431,0.612,0.810,0.991,1.159,1.282,1.337,1.310,1.195,1.006,0.791,0.600,0.431,0.297,0.199,0.132,0.086,0.055,0.034,0.021,0.013,0.008,0.005,0.003,0.002,0.001,0.001,0.001,0.001,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000];
var _CIE_Y = [0.000,0.002,0.007,0.016,0.029,0.043,0.061,0.089,0.140,0.220,0.329,0.460,0.601,0.749,0.890,1.000,1.047,1.023,0.914,0.756,0.594,0.441,0.313,0.217,0.150,0.102,0.068,0.044,0.028,0.017,0.011,0.007,0.004,0.003,0.002,0.001,0.001,0.001,0.001,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000];
var _CIE_Z = [0.007,0.032,0.127,0.295,0.537,0.870,1.319,1.882,2.532,3.187,3.825,4.383,4.779,4.956,4.870,4.580,4.069,3.456,2.780,2.125,1.552,1.088,0.736,0.481,0.315,0.206,0.134,0.087,0.056,0.035,0.022,0.014,0.009,0.006,0.004,0.002,0.001,0.001,0.001,0.001,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000];
var _D65_ILL = [50.0,52.3,54.6,56.9,59.1,60.5,63.0,64.6,65.8,68.6,75.1,82.5,87.8,90.5,90.8,91.2,95.4,96.7,93.4,96.2,99.1,99.1,95.8,86.1,97.8,91.5,99.0,104.0,95.1,95.9,95.8,86.5,109.0,108.0,104.0,107.0,102.0,98.0,96.0,97.0,98.0,99.0,99.0,95.0,93.0,88.0,84.0,85.0,81.0,82.0,80.0,83.0,85.0,87.0,88.0,92.0,91.0,89.0,90.0,91.0,93.0,93.0,89.0,86.0,88.0,89.0,88.0,87.0,84.0,80.0,73.0,71.0,74.0,81.0,86.0,92.0,94.0,91.0,85.0,80.0,76.0,74.0,70.0];

function _odWavelengthNm(E_eV){ /* E = hc/λ, h = 4.1357e-15 eV·s, c = 3e8 m/s */
  if (E_eV <= 0.005) return 250000; /* cap far-IR */
  return Math.round(1240.0 / E_eV);
}

/* ─── 1. SKIN DEPTH & ATTENUATION ENGINE ─── */
var _odSkinCanvas = null, _odSkinCtx = null, _odSkinAnimId = null, _odSkinT0 = null;

/*   α = 4πκ / λ   [nm⁻¹]   -- [Hummel Eq 10.22] absorbance
     δ = 1/α = λ/(4πκ)   [nm]  -- [Hummel Eq 10.21] skin depth
     I(z) = I₀·exp(−2αz)         -- [Hummel Eq 10.19] intensity attenuation
     E(z,t) = E₀·exp(−αz)·cos(ωt − kz)  -- damped travelling wave [Hummel Eq 10.18]   */

function _odComputeSkinParams(name, E){
  var res = odComputeOptics(name, E, 0); /* normal incidence for skin depth */
  var lam = _odWavelengthNm(E);
  var kappa = res.k;
  /* [Hummel Eq 10.21] δ = λ / (4πκ)  [nm] */
  var delta = (kappa > 1e-9) ? (lam / (4 * Math.PI * kappa)) : 1e9;
  /* [Hummel Eq 10.22] α = 4πκ / λ = 1/δ  [nm⁻¹] */
  var alpha = (delta > 1e-9) ? (1.0 / delta) : 0;
  return { lam: lam, kappa: kappa, delta: delta, alpha: alpha, n: res.n };
}

/* ─── Animation control ─── */
window._odStartSkinAnim = function(){
  if (_odSkinAnimId) cancelAnimationFrame(_odSkinAnimId);
  _odSkinT0 = performance.now();
  (function _loop(){
    var t = (performance.now() - _odSkinT0) / 1000; /* elapsed seconds */
    if (typeof _odDrawSkinAtten === 'function') _odDrawSkinAtten(t);
    _odSkinAnimId = requestAnimationFrame(_loop);
  })();
};
window._odStopSkinAnim = function(){
  if (_odSkinAnimId){ cancelAnimationFrame(_odSkinAnimId); _odSkinAnimId = null; }
};

/* ─── Main render: static axes + animated damped wave ─── */
function _odDrawSkinAtten(t){
  if (t === undefined) t = 0; /* static call for screenshots / init */
  var c = _odSkinCtx, cv = _odSkinCanvas;
  if (!c || !cv) return;
  var W = cv.width, H = cv.height;
  var res = odComputeOptics(odState.mat, odState.E, 0);
  var skin = _odComputeSkinParams(odState.mat, odState.E);

  c.clearRect(0, 0, W, H);
  /* material surface at x=60, depth increases to right */
  var x0 = 60, xMax = W - 20, depthPx = xMax - x0;
  var y0 = H * 0.35, yI0 = H * 0.78;

  /* label axis */
  c.fillStyle = '#667';
  c.font = '11px var(--font-mono)';
  c.fillText('surface', x0 - 2, y0 + 38);
  c.fillText('depth z →', x0 + depthPx - 40, y0 + 38);
  c.fillText('0', x0 - 4, y0 + 50);

  /* ── depth scaling: two physical regimes ──
     Absorbing  (δ < 100·λ_mat) : envelope dominates → show 5·δ
     Transparent (δ ≥ 100·λ_mat): propagation dominates → show 20·λ_vac
     In both cases the n-slider changes λ_mat = λ_vac/n:
       • absorbing  : wave density inside fixed 5δ window changes
       • transparent: ~20·n waves across the window          */
  var delta = skin.delta; /* nm */
  var nPhase = (typeof odState.n === 'number') ? odState.n : skin.n;
  var lamMat = (skin.lam > 1e-9) ? (skin.lam / nPhase) : 1e9; /* λ_mat = λ_vac/n  [nm] */
  var showDepth;
  if (delta < lamMat * 100) {
    /* Absorbing: skin depth is the relevant length scale */
    showDepth = delta * 5;
  } else {
    /* Transparent: show fixed vacuum depth so N_waves = 20·n varies with slider */
    showDepth = skin.lam * 20;
    if (showDepth > 200000) showDepth = 200000; /* cap at 200 μm, beyond which skin depth ≈ ∞ */
  }
  if (showDepth < 1) showDepth = 1;
  var nmPerPx = showDepth / depthPx;

  /* mark δ, 2δ, 3δ, 4δ, 5δ (only if they fit; for metals δ << λ they bunch near surface) */
  c.strokeStyle = 'rgba(255,78,205,0.3)';
  c.setLineDash([2, 4]);
  for (var m = 1; m <= 5; m++){
    var xm = x0 + (m * delta) / nmPerPx;
    if (xm > xMax) break;
    c.beginPath(); c.moveTo(xm, 10); c.lineTo(xm, H - 10); c.stroke();
    c.fillStyle = 'rgba(255,78,205,0.7)';
    c.fillText((m === 1 ? 'δ' : m + 'δ'), xm + 2, H - 14);
  }
  c.setLineDash([]);

  /* ── animated travelling damped wave: E(z,t) = E₀·exp(−αz)·cos(ωt − kz) ──
     k = 2π·n/λ  [nm⁻¹]  wave number in material
     If odState.n is set (slider override), use it for phase velocity only;
     envelope δ = λ/(4πκ) stays tied to the material database (absorbance unchanged).
     ω_display = 8π  [rad/s]  reduced frequency for visual smoothness   */
  var omega = 8 * Math.PI; /* ~4 Hz display cycle */
  var nPhase = (typeof odState.n === 'number') ? odState.n : skin.n; /* allow user override of n for k */
  var kMat = (skin.lam > 1e-9) ? (2 * Math.PI * nPhase / skin.lam) : 0; /* nm⁻¹ */
  var kPx = kMat * nmPerPx; /* radians per canvas pixel */

  /* incident wave in vacuum (left of surface): E_inc(t) = cos(ωt) */
  c.beginPath();
  c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1;
  for (var px = 0; px <= x0 - 10; px += 1){
    var Einc = Math.cos(omega * t) * 35;
    var x = px, y = y0 - Einc * (px / (x0 - 10)); /* taper toward surface */
    if (px === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();

  /* field inside material: E(z,t) = E₀·exp(−z/δ)·cos(ωt − kz)  [Hummel Eq 10.18] */
  c.beginPath();
  c.strokeStyle = '#00f0ff'; c.lineWidth = 1.5;
  for (var px = 0; px <= depthPx; px += 1){
    var z = px * nmPerPx;
    var damp = Math.exp(-z / delta);
    var Ewave = damp * Math.cos(omega * t - kPx * px) * 55;
    var x = x0 + px, y = y0 - Ewave;
    if (px === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();

  /* lower envelope mirror (for symmetry visual) */
  c.beginPath();
  c.strokeStyle = 'rgba(0,240,255,0.25)';
  for (var px = 0; px <= depthPx; px += 1){
    var z = px * nmPerPx;
    var damp = Math.exp(-z / delta);
    var Ewave = damp * Math.cos(omega * t - kPx * px) * 55;
    var x = x0 + px, y = y0 + Ewave;
    if (px === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();

  /* animated intensity I(z,t) = I₀·exp(−2αz)·cos²(ωt − kz)  [Hummel Eq 10.19] */
  c.beginPath();
  c.strokeStyle = '#4ade80'; c.lineWidth = 1.5;
  for (var px = 0; px <= depthPx; px += 1){
    var z = px * nmPerPx;
    var damp2 = Math.exp(-2 * z / delta);
    var Iwave = damp2 * Math.pow(Math.cos(omega * t - kPx * px), 2) * 55;
    var x = x0 + px, y = yI0 - Iwave;
    if (px === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();

  /* static envelope overlays (dashed, faded) for reference */
  c.strokeStyle = 'rgba(0,240,255,0.25)'; c.setLineDash([3,3]); c.lineWidth = 1;
  c.beginPath();
  for (var px = 0; px <= depthPx; px += 2){
    var z = px * nmPerPx;
    var env = Math.exp(-z / delta) * 55;
    var x = x0 + px, y = y0 - env;
    if (px === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();
  c.beginPath();
  for (var px = 0; px <= depthPx; px += 2){
    var z = px * nmPerPx;
    var env = Math.exp(-z / delta) * 55;
    var x = x0 + px, y = y0 + env;
    if (px === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();
  c.setLineDash([]);

  /* legend */
  c.fillStyle = '#00f0ff'; c.fillRect(x0 + 8, 12, 10, 3);
  c.fillStyle = '#9ab'; c.fillText('|E(z,t)|  exp(-z/δ) · cos(ωt−kz)', x0 + 22, 18);
  c.fillStyle = '#4ade80'; c.fillRect(x0 + 8, 26, 10, 3);
  c.fillStyle = '#9ab'; c.fillText('I(z,t) = |E|²  exp(-2z/δ) · cos²(ωt−kz)', x0 + 22, 32);
  /* depth window readout */
  var winUnit = showDepth >= 1000 ? (showDepth/1000).toFixed(1)+' μm' : showDepth.toFixed(1)+' nm';
  var regime = (delta < lamMat * 100) ? 'absorbing (5δ)' : 'transparent (20 λ_vac)';
  c.fillStyle = '#f59e0b'; c.fillText('window: '+winUnit+'  |  '+regime, x0 + 8, 44);

  /* incident beam arrow on left */
  c.strokeStyle = '#fff'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(10, y0); c.lineTo(x0 - 10, y0); c.stroke();
  c.beginPath(); c.moveTo(x0 - 14, y0 - 4); c.lineTo(x0 - 10, y0); c.lineTo(x0 - 14, y0 + 4); c.stroke();
  c.fillStyle = '#fff'; c.fillText('incident', 12, y0 - 8);
}

window._odUpdateSkinReadout = function(){
  var s = _odComputeSkinParams(odState.mat, odState.E);
  /* λ_mat = λ_vac / n  [nm]  — shows phase-velocity wavelength in material */
  var nPhase = (typeof odState.n === 'number') ? odState.n : s.n;
  var lamMat = (s.lam > 1e-9) ? (s.lam / nPhase) : 0;
  var el;
  if (el = document.getElementById('skin-alpha')) el.textContent = s.alpha.toExponential(2);
  if (el = document.getElementById('skin-delta'))
    el.textContent = s.delta < 10000 ? s.delta.toFixed(1) : (s.delta < 1e6 ? (s.delta/1000).toFixed(1) + ' μm' : '>1 mm');
  if (el = document.getElementById('skin-lam-mat'))
    el.textContent = lamMat < 10000 ? lamMat.toFixed(1) : (lamMat < 1e6 ? (lamMat/1000).toFixed(1)+' μm' : '>1 mm');
  if (el = document.getElementById('skin-ratio')) el.textContent = (Math.exp(-2) * 100).toFixed(1) + '%';
};

function _odBuildSkinBarsData(){
  /* compute δ for all 6 materials at current E; highlight current material */
  var names = ['Cu','Ag','Al','Si','GaAs','NaCl'];
  var deltas = [], cols = [];
  /* palette + dimmed version for non-selected materials */
  var palette =   { Cu:'#d97706', Ag:'#94a3b8', Al:'#94a3b8', Si:'#6366f1', GaAs:'#8b5cf6', NaCl:'#f472b6' };
  var dimPalette ={ Cu:'#4d3300', Ag:'#334155', Al:'#334155', Si:'#1e1b4b', GaAs:'#3B0764', NaCl:'#4a0432' };
  var isActive = (typeof odState === 'object' && odState.mat) ? odState.mat : 'Cu';
  for (var i = 0; i < names.length; i++){
    var s = _odComputeSkinParams(names[i], odState.E);
    deltas.push(s.delta < 1e7 ? s.delta : 1e7); /* cap for plot */
    cols.push(names[i] === isActive ? palette[names[i]] : dimPalette[names[i]]);
  }
  return { labels: names.slice().reverse(), deltas: deltas.slice().reverse(), colors: cols.slice().reverse() };
}

/* ─── horizontal bar chart: δ on x-axis (log), materials on y-axis ─── */
window._odInitSkinPlot = function(){
  if (typeof Plotly === 'undefined') return;
  var d = _odBuildSkinBarsData();
  var lamAir = 1240.0 / odState.E; /* nm */
  Plotly.newPlot('plot-skin', [{
    y: d.labels, x: d.deltas, type: 'bar', orientation: 'h',
    marker: { color: d.colors, line: { color: '#111', width: 1 } },
    name: 'δ (nm)',
    text: d.deltas.map(function(v){ return v >= 1000 ? (v/1000).toFixed(1)+'k' : v.toFixed(0); }),
    textposition: 'outside', textfont: { color: '#aaa', size: 10 }
  }], {
    paper_bgcolor: '#0a0a1a', plot_bgcolor: '#0a0a1a',
    font: { color: '#bbb', size: 11 },
    title: { text: 'Skin Depth δ(E) by Material at E = ' + odState.E.toFixed(2) + ' eV (λ_air = ' + lamAir.toFixed(0) + ' nm)', font: { color: '#ccc', size: 12 } },
    xaxis: { title: 'δ (nm, log scale)', gridcolor: '#1a1a2e', color: '#888', type: 'log', range: [0, 7], autorange: false },
    yaxis: { title: '', gridcolor: '#1a1a2e', color: '#888', autorange: 'reversed' },
    margin: { t: 45, b: 65, l: 60, r: 80 },
    annotations: [{
      x: lamAir, y: 0.5, xref: 'x', yref: 'paper',
      text: 'λ_air = ' + lamAir.toFixed(0) + ' nm',
      showarrow: true, arrowhead: 2, arrowsize: 1, arrowwidth: 1,
      arrowcolor: '#f59e0b', ax: 40, ay: 0,
      font: { color: '#f59e0b', size: 10 }
    }]
  }, { displayModeBar: false, responsive: true });
};

window._odUpdateSkinPlot = function(){
  if (typeof Plotly === 'undefined' || !document.getElementById('plot-skin')) return;
  var d = _odBuildSkinBarsData();
  var lamAir = 1240.0 / odState.E; /* nm */
  Plotly.react('plot-skin', [{
    y: d.labels, x: d.deltas, type: 'bar', orientation: 'h',
    marker: { color: d.colors, line: { color: '#111', width: 1 } },
    text: d.deltas.map(function(v){ return v >= 1000 ? (v/1000).toFixed(1)+'k' : v.toFixed(0); }),
    textposition: 'outside', textfont: { color: '#aaa', size: 10 }
  }], {
    paper_bgcolor: '#0a0a1a', plot_bgcolor: '#0a0a1a',
    font: { color: '#bbb', size: 11 },
    title: { text: 'Skin Depth δ(E) by Material at E = ' + odState.E.toFixed(2) + ' eV (λ_air = ' + lamAir.toFixed(0) + ' nm)', font: { color: '#ccc', size: 12 } },
    xaxis: { title: 'δ (nm, log scale)', gridcolor: '#1a1a2e', color: '#888', type: 'log', range: [0, 7], autorange: false },
    yaxis: { title: '', gridcolor: '#1a1a2e', color: '#888', autorange: 'reversed' },
    margin: { t: 45, b: 65, l: 60, r: 80 },
    annotations: [{
      x: lamAir, y: 0.5, xref: 'x', yref: 'paper',
      text: 'λ_air = ' + lamAir.toFixed(0) + ' nm',
      showarrow: true, arrowhead: 2, arrowsize: 1, arrowwidth: 1,
      arrowcolor: '#f59e0b', ax: 40, ay: 0,
      font: { color: '#f59e0b', size: 10 }
    }]
  }, { displayModeBar: false, responsive: true });
};

/* ─── 2. BREWSTER / FRESNEL ENGINE ─── */

/* Fresnel amplitude reflection coefficients:
   r_s = (n₁ cos θ₁ − n₂ cos θ₂)/(n₁ cos θ₁ + n₂ cos θ₂)   [s-pol, E ⟂ plane]
   r_p = (n₂ cos θ₁ − n₁ cos θ₂)/(n₂ cos θ₁ + n₁ cos θ₂)   [p-pol, E ∥ plane]
   R_s = |r_s|²,  R_p = |r_p|²
   Brewster angle: tan θ_B = n₂/n₁   →   R_p(θ_B) = 0       */

function _odComputeFresnel(theta1Deg, n1, n2){
  var th1 = theta1Deg * Math.PI / 180;
  var sin2 = (n1 / n2) * Math.sin(th1);
  var th2 = 0, tir = false;
  if (Math.abs(sin2) >= 1) { th2 = Math.PI / 2; tir = true; }
  else th2 = Math.asin(sin2);
  var c1 = Math.cos(th1), s1 = Math.sin(th1);
  var c2 = Math.cos(th2);
  var rs = (n1 * c1 - n2 * c2) / (n1 * c1 + n2 * c2);
  var rp = (n2 * c1 - n1 * c2) / (n2 * c1 + n1 * c2);
  if (tir) { rs = 1; rp = 1; }
  var Rs = rs * rs, Rp = rp * rp;
  /* Brewster angle from real part of n only (complex Brewster exists but too advanced) */
  var thetaB = (n2 > 0) ? (Math.atan(n2 / n1) * 180 / Math.PI) : 0;
  if (n1 > n2) thetaB = (Math.atan(n2 / n1) * 180 / Math.PI); /* still valid */
  return { Rs: Rs, Rp: Rp, rs: rs, rp: rp, theta2: th2 * 180 / Math.PI, thetaB: thetaB, tir: tir };
}

window._odUpdateBrewsterReadout = function(){
  var res = odComputeOptics(odState.mat, odState.E, odState.angle);
  var nMaterial = res.n; /* n of material at current E */
  var fres = _odComputeFresnel(odState.angle, 1.0, nMaterial);
  var el;
  if (el = document.getElementById('br-thetaB')) el.textContent = fres.thetaB.toFixed(1);
  if (el = document.getElementById('br-Rs')) el.textContent = fres.Rs.toFixed(3);
  if (el = document.getElementById('br-Rp')) el.textContent = fres.Rp.toFixed(3);
  /* degree of polarization = (Rs - Rp)/(Rs + Rp), with clip 0→1 */
  var denom = fres.Rs + fres.Rp;
  var pol = (denom > 1e-12) ? Math.max(0, Math.min(1, (fres.Rs - fres.Rp) / denom)) : 0;
  if (el = document.getElementById('br-pol')) el.textContent = (pol * 100).toFixed(1) + '%';
};

function _odDrawBrewsterCanvas(){
  var cv = document.getElementById('brewster-canvas');
  if (!cv) return;
  var c = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  c.clearRect(0, 0, W, H);

  /* current material n(E) */
  var res = odComputeOptics(odState.mat, odState.E, odState.angle);
  var n2 = res.n;

  /* draw R_s(θ) and R_p(θ) vs θ from 0 to 89° */
  var pxPerDeg = (W - 80) / 90;
  var hScale = H * 0.78;
  var y0 = H - 40;

  /* axes */
  c.strokeStyle = '#334'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(40, y0); c.lineTo(W - 20, y0); c.stroke(); /* θ axis */
  c.beginPath(); c.moveTo(40, y0); c.lineTo(40, 20); c.stroke(); /* R axis */
  c.fillStyle = '#667'; c.font = '10px var(--font-mono)';
  c.fillText('0°', 35, y0 + 14); c.fillText('90°', W - 28, y0 + 14);
  c.fillText('R=1', 10, 26); c.fillText('R=0', 10, y0 + 4);

  /* R_s curve in red */
  c.beginPath(); c.strokeStyle = '#ff4d4d'; c.lineWidth = 2;
  for (var d = 0; d <= 89; d += 0.5){
    var f = _odComputeFresnel(d, 1.0, n2);
    var x = 40 + d * pxPerDeg, y = y0 - f.Rs * hScale;
    if (d === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();

  /* R_p curve in cyan */
  c.beginPath(); c.strokeStyle = '#00f0ff'; c.lineWidth = 2;
  for (var d = 0; d <= 89; d += 0.5){
    var f = _odComputeFresnel(d, 1.0, n2);
    var x = 40 + d * pxPerDeg, y = y0 - f.Rp * hScale;
    if (d === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();

  /* Brewster angle — compute from real n only */
  var fres0 = _odComputeFresnel(0, 1.0, n2);
  var thetaB = fres0.thetaB;

  /* Brewster angle dashed line */
  c.strokeStyle = 'rgba(255,78,205,0.6)'; c.setLineDash([3, 4]); c.lineWidth = 1;
  var xB = 40 + thetaB * pxPerDeg;
  c.beginPath(); c.moveTo(xB, 20); c.lineTo(xB, y0); c.stroke();
  c.setLineDash([]);
  c.fillStyle = '#ff4ecd'; c.fillText('θ_B = ' + thetaB.toFixed(1) + '°', xB + 4, 32);

  /* current θ₁ marker (white dot) */
  var cur = _odComputeFresnel(odState.angle, 1.0, n2);
  var xc = 40 + odState.angle * pxPerDeg;
  var yc = y0 - cur.Rs * hScale;
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(xc, yc, 5, 0, Math.PI * 2); c.fill();
}

function _odBuildBrewsterCurves(){
  var th = [], Rs = [], Rp = [];
  var res = odComputeOptics(odState.mat, odState.E, 0);
  var n2 = res.n;
  for (var d = 0; d <= 89; d += 0.5){
    var f = _odComputeFresnel(d, 1.0, n2);
    th.push(d); Rs.push(f.Rs); Rp.push(f.Rp);
  }
  return { theta: th, Rs: Rs, Rp: Rp, thetaB: _odComputeFresnel(0, 1.0, n2).thetaB };
}

window._odInitBrewsterPlot = function(){
  if (typeof Plotly === 'undefined') return;
  if (!document.getElementById('plot-brewster')) return; // element removed from restructured skeleton
  var d = _odBuildBrewsterCurves();
  Plotly.newPlot('plot-brewster', [
    { x: d.theta, y: d.Rs, name: 'R_s(θ) · s-polarized', type: 'scatter', mode: 'lines',
      line: { color: '#ff4d4d', width: 2 } },
    { x: d.theta, y: d.Rp, name: 'R_p(θ) · p-polarized', type: 'scatter', mode: 'lines',
      line: { color: '#00f0ff', width: 2 } }
  ], {
    paper_bgcolor: '#0a0a1a', plot_bgcolor: '#0a0a1a',
    font: { color: '#bbb', size: 11 },
    title: { text: 'Fresnel Reflectivity  ' + odState.mat + ' @ E=' + odState.E.toFixed(2) + ' eV, n=' + odComputeOptics(odState.mat, odState.E, 0).n.toFixed(2), font: { color: '#ccc', size: 12 } },
    xaxis: { title: 'Incident angle θ₁ (°)', gridcolor: '#1a1a2e', color: '#888', range: [0, 90] },
    yaxis: { title: 'Reflectivity R', gridcolor: '#1a1a2e', color: '#888', range: [0, 1.05] },
    margin: { t: 40, b: 40, l: 52, r: 16 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,26,0.7)', font: { size: 10 } },
    shapes: [{
      type: 'line',
      line: { color: '#ff4ecd', width: 1.5, dash: 'dash' },
      x0: d.thetaB, x1: d.thetaB, y0: 0, y1: 1.05
    }, {
      type: 'line',
      line: { color: '#ffffff', width: 1.5, dash: 'dash' },
      x0: odState.angle, x1: odState.angle, y0: 0, y1: 1.05
    }],
    annotations: [{
      x: d.thetaB, y: 0.98, xref: 'x', yref: 'y',
      text: 'θ_B', showarrow: false, font: { color: '#ff4ecd', size: 11 }
    }]
  }, { displayModeBar: false, responsive: true });
};

window._odUpdateBrewsterPlot = function(){
  if (typeof Plotly === 'undefined' || !document.getElementById('plot-brewster')) return;
  var d = _odBuildBrewsterCurves();
  Plotly.react('plot-brewster', [
    { x: d.theta, y: d.Rs, name: 'R_s(θ) · s-polarized', type: 'scatter', mode: 'lines',
      line: { color: '#ff4d4d', width: 2 } },
    { x: d.theta, y: d.Rp, name: 'R_p(θ) · p-polarized', type: 'scatter', mode: 'lines',
      line: { color: '#00f0ff', width: 2 } }
  ], {
    paper_bgcolor: '#0a0a1a', plot_bgcolor: '#0a0a1a',
    font: { color: '#bbb', size: 11 },
    title: { text: 'Fresnel Reflectivity  ' + odState.mat + ' @ E=' + odState.E.toFixed(2) + ' eV, n=' + odComputeOptics(odState.mat, odState.E, 0).n.toFixed(2), font: { color: '#ccc', size: 12 } },
    xaxis: { title: 'Incident angle θ₁ (°)', gridcolor: '#1a1a2e', color: '#888', range: [0, 90] },
    yaxis: { title: 'Reflectivity R', gridcolor: '#1a1a2e', color: '#888', range: [0, 1.05] },
    margin: { t: 40, b: 40, l: 52, r: 16 },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,26,0.7)', font: { size: 10 } },
    shapes: [{
      type: 'line',
      line: { color: '#ff4ecd', width: 1.5, dash: 'dash' },
      x0: d.thetaB, x1: d.thetaB, y0: 0, y1: 1.05
    }, {
      type: 'line',
      line: { color: '#ffffff', width: 1.5, dash: 'dash' },
      x0: odState.angle, x1: odState.angle, y0: 0, y1: 1.05
    }],
    annotations: [{
      x: d.thetaB, y: 0.98, xref: 'x', yref: 'y',
      text: 'θ_B', showarrow: false, font: { color: '#ff4ecd', size: 11 }
    }]
  }, { displayModeBar: false, responsive: true });
};

/* ─── 3. COLOUR RENDERING ENGINE (CIE 1931 XYZ → sRGB) ─── */

/*   X = Σ_λ  R(λ)·I_D65(λ)·x̄(λ)
     Y = Σ_λ  R(λ)·I_D65(λ)·ȳ(λ)       -- luminance [CIE 1931]
     Z = Σ_λ  R(λ)·I_D65(λ)·z̄(λ)

     sRGB linear:
     R_lin =  3.2406·X − 1.5372·Y − 0.4986·Z   [IEC 61966-2-1 matrix]
     G_lin = −0.9689·X + 1.8758·Y + 0.0415·Z
     B_lin =  0.0557·X − 0.2040·Y + 1.0570·Z

     Gamma correction:
     R' = R_lin ≤ 0.0031308 ? 12.92·R_lin : 1.055·R_lin^(1/2.4) − 0.055   */

function _odColorFromReflectivity(matName){
  /* Build R(λ) sampled every 5 nm from 380–780 nm (81 points).
     Use same odComputeOptics for each λ point. */
  var X = 0, Y = 0, Z = 0;
  var lambdaStart = 380, lambdaEnd = 780, step = 5;
  var nPoints = (lambdaEnd - lambdaStart) / step + 1; /* = 81 */

  for (var i = 0; i < nPoints; i++){
    var lam = lambdaStart + i * step;
    var E_eV = 1240.0 / lam;
    if (E_eV < 0.01) continue;
    var res = odComputeOptics(matName, E_eV, 0);
    var Rlam = res.R; /* reflectivity at this λ under normal incidence */
    var I = _D65_ILL[i];
    var xb = _CIE_X[i], yb = _CIE_Y[i], zb = _CIE_Z[i];
    X += Rlam * I * xb;
    Y += Rlam * I * yb;
    Z += Rlam * I * zb;
  }

  /* Normalise by the sum of Y for a perfect white reflector under D65 */
  var Yn = 0;
  for (var i = 0; i < nPoints; i++) Yn += _D65_ILL[i] * _CIE_Y[i];
  if (Yn > 0) { X /= Yn; Y /= Yn; Z /= Yn; }

  /* XYZ → linear sRGB (IEC 61966-2-1)
     [ R_lin ]   [  3.2406  -1.5372  -0.4986 ] [ X ]
     [ G_lin ] = [ -0.9689   1.8758   0.0415 ] [ Y ]
     [ B_lin ]   [  0.0557  -0.2040   1.0570 ] [ Z ]   */
  var Rlin =  3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  var Glin = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  var Blin =  0.0557 * X - 0.2040 * Y + 1.0570 * Z;

  /* Gamma correction (sRGB transfer function) */
  function gamma(v){
    if (v <= 0.0031308) return 12.92 * v;
    return 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055;
  }
  var r = Math.max(0, Math.min(1, gamma(Rlin)));
  var g = Math.max(0, Math.min(1, gamma(Glin)));
  var b = Math.max(0, Math.min(1, gamma(Blin)));

  /* find peak absorbed λ: λ where R(λ) is minimum */
  var minR = 2, peakAbsorbLam = 0;
  for (var i = 0; i < nPoints; i++){
    var lam = lambdaStart + i * step;
    var E_eV = 1240.0 / lam;
    var res = odComputeOptics(matName, E_eV, 0);
    if (res.R < minR) { minR = res.R; peakAbsorbLam = lam; }
  }

  return {
    rgb: [Math.round(r*255), Math.round(g*255), Math.round(b*255)],
    peakAbsorb: peakAbsorbLam
  };
}

window._odUpdateColorSwatches = function(){
  var c = _odColorFromReflectivity(odState.mat);
  var rgbStr = 'rgb(' + c.rgb[0] + ',' + c.rgb[1] + ',' + c.rgb[2] + ')';
  var sw1 = document.getElementById('spec-color-swatch');
  if (sw1) { sw1.style.background = rgbStr; sw1.style.borderColor = 'rgba(255,255,255,0.3)'; }
  var sw2 = document.getElementById('color-big-swatch');
  if (sw2) { sw2.style.background = rgbStr; sw2.style.boxShadow = '0 0 20px ' + rgbStr.replace('rgb','rgba').replace(')',',0.15)'); }
  var txt = document.getElementById('color-rgb-text');
  if (txt) txt.textContent = 'RGB(' + c.rgb[0] + ', ' + c.rgb[1] + ', ' + c.rgb[2] + ')';
  var pk = document.getElementById('color-absorb-peak');
  if (pk) pk.textContent = c.peakAbsorb;
};

/* ═══════════════════════════════════════════════════════════════
   INIT HOOK — call all new initialisers after existing ones
   ═══════════════════════════════════════════════════════════════ */
window._odInitNewSections = function(){
  /* [Attenuation] resolve canvas context for skin-depth drawing then render */
  _odSkinCanvas = document.getElementById('skin-canvas');
  if (_odSkinCanvas) _odSkinCtx = _odSkinCanvas.getContext('2d');
  if (typeof _odDrawSkinAtten === 'function') _odDrawSkinAtten();
  if (typeof _odUpdateSkinReadout === 'function') _odUpdateSkinReadout();
  if (typeof _odInitSkinPlot === 'function') _odInitSkinPlot();

  /* [Color/Dispersion] swatch update — element-guarded inside the function */
  if (typeof _odUpdateColorSwatches === 'function') _odUpdateColorSwatches();
};

window._odRefreshAllNewSections = function(){
  /* Material-sync removed — each section owns its own state. */
};

})();
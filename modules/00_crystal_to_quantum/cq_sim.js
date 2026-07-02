/* ═══════════════════════════════════════════════════════════════
   cq_sim.js — Crystal to Quantum v2
   6-scale journey: Macro → Lattice → Cluster → Bands → Atom → Spin
   Three.js scene + photon interaction + band electrons + spin splitting
   ═══════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  /* ─── PHYSICAL CONSTANTS ─── */
  var A_SI = 5.43;
  var BANDGAP_SI = 1.12;
  var WORKFN_SI = 4.5;
  var PHONON_EV = 0.08;

  function wavelengthFromEnergy(E) {
    // E (eV) → λ (nm)  via  λ = hc/E = 1240 / E  (nm)
    return 1240 / Math.max(E, 0.01);
  }

  function frequencyFromEnergy(E) {
    // E (eV) → ω (rad/frame) scaled for visualisation
    // SLOWED DOWN for educational visibility: waves should oscillate
    // slowly enough that students can read the E/B fields as they travel.
    return 0.008 + E * 0.006;   // ~3× slower than before
  }

  /* ─── MATERIAL PRESETS DATABASE ───
     Only solid-state semiconductors with defined band structure.
     Each entry has the properties needed for the crystal simulator. */
  var MATERIAL_PRESETS = {
    si:    { id:'si',    name:'Silicon',           formula:'Si',    type:'cubic',   bandgap:1.12, workFunction:4.5,  latticeConstant:5.43, n0:3.42, dn:0.08, dk:0.15, atomColorA:0x7da4c4, atomColorB:null,  bondColor:0x556677, simColor:0x8899aa, desc:'The workhorse of microelectronics.', shells:[[8,2,'2s 2p'],[4,3,'3s 3p']], valence:4 },
    ge:    { id:'ge',    name:'Germanium',         formula:'Ge',    type:'cubic',   bandgap:0.67, workFunction:4.3,  latticeConstant:5.66, n0:4.0,  dn:0.12, dk:0.20, atomColorA:0x6b8b9e, atomColorB:null,  bondColor:0x556677, simColor:0x8899aa, desc:'Narrow-gap semiconductor. Used in high-speed electronics.', shells:[[8,2,'2s 2p'],[18,3,'3d 3s 3p'],[4,4,'4s 4p']], valence:4 },
    c_dia: { id:'c_dia', name:'Diamond',           formula:'C',     type:'cubic',   bandgap:5.47, workFunction:5.0,  latticeConstant:3.57, n0:2.42, dn:0.04, dk:0.05, atomColorA:0xccccdd, atomColorB:null,  bondColor:0x8899aa, simColor:0xccccdd, desc:'Wide bandgap. The hardest known natural material.', shells:[[4,2,'2s 2p']], valence:4 },
    sn:    { id:'sn',    name:'α-Tin (Gray Tin)',  formula:'Sn',    type:'cubic',   bandgap:0.00, workFunction:4.42, latticeConstant:6.49, n0:4.5,  dn:0.10, dk:0.20, atomColorA:0x99aabb, atomColorB:null,  bondColor:0x667788, simColor:0x99aabb, desc:'Zero-gap semiconductor. Cubic at low temperature.', shells:[[8,2,'2s 2p'],[18,3,'3d 3s 3p'],[18,4,'4d 4s 4p'],[4,5,'5s 5p']], valence:4 },
    gaas:  { id:'gaas',  name:'Gallium Arsenide',  formula:'GaAs',  type:'cubic', bandgap:1.42, workFunction:4.6,  latticeConstant:5.65, n0:3.3,  dn:0.18, dk:0.40, atomColorA:0x6b8b9e, atomColorB:0x5b7b8e, bondColor:0x556677, simColor:0x8899bb, desc:'III-V compound. Key material for high-frequency electronics.', shells:[[8,2,'2s 2p'],[18,3,'3d 3s 3p'],[4,4,'4s 4p']], valence:4, valenceA:3, valenceB:5 },
    inp:   { id:'inp',   name:'Indium Phosphide',  formula:'InP',   type:'cubic', bandgap:1.34, workFunction:4.38, latticeConstant:5.87, n0:3.1,  dn:0.15, dk:0.35, atomColorA:0x6b7b8e, atomColorB:0xaa6622, bondColor:0x556677, simColor:0x8899aa, desc:'III-V compound. Used in telecom lasers and photonics.', shells:[[8,2,'2s 2p'],[18,3,'3d 3s 3p'],[18,4,'4d 4s 4p'],[4,5,'5s 5p']], valence:4, valenceA:3, valenceB:5 },
    inas:  { id:'inas',  name:'Indium Arsenide',   formula:'InAs',  type:'cubic', bandgap:0.35, workFunction:4.5,  latticeConstant:6.06, n0:3.5,  dn:0.20, dk:0.45, atomColorA:0x6b7b8e, atomColorB:0x5b7b8e, bondColor:0x556677, simColor:0x8899aa, desc:'Narrow-gap III-V. High electron mobility.', shells:[[8,2,'2s 2p'],[18,3,'3d 3s 3p'],[10,4,'4d 4p'],[4,5,'5s 5p']], valence:4, valenceA:3, valenceB:5 },
    insb:  { id:'insb',  name:'Indium Antimonide', formula:'InSb',  type:'cubic', bandgap:0.17, workFunction:4.59, latticeConstant:6.48, n0:4.0,  dn:0.22, dk:0.50, atomColorA:0x6b7b8e, atomColorB:0x889966, bondColor:0x667788, simColor:0x8899aa, desc:'Narrowest-gap III-V. Used in infrared detectors.', shells:[[8,2,'2s 2p'],[18,3,'3d 3s 3p'],[18,4,'4d 4s 4p'],[4,5,'5s 5p']], valence:4, valenceA:3, valenceB:5 },
    gaP:   { id:'gap',   name:'Gallium Phosphide', formula:'GaP',   type:'cubic', bandgap:2.26, workFunction:4.0,  latticeConstant:5.45, n0:3.0,  dn:0.06, dk:0.15, atomColorA:0x6b8b9e, atomColorB:0xaa6622, bondColor:0x556677, simColor:0x8899bb, desc:'III-V compound. Used in LEDs.', shells:[[8,2,'2s 2p'],[8,3,'3s 3p'],[4,4,'4s 4p']], valence:4, valenceA:3, valenceB:5 },
    alas:  { id:'alas',  name:'Aluminium Arsenide',formula:'AlAs',  type:'cubic', bandgap:2.15, workFunction:4.0,  latticeConstant:5.66, n0:3.0,  dn:0.06, dk:0.15, atomColorA:0x7799aa, atomColorB:0x5b7b8e, bondColor:0x556677, simColor:0x99aacc, desc:'III-V compound. Used in heterojunction devices.', shells:[[8,2,'2s 2p'],[8,3,'3s 3p'],[4,4,'4s 4p']], valence:4, valenceA:3, valenceB:5 },
    cdte:  { id:'cdte',  name:'Cadmium Telluride', formula:'CdTe',  type:'cubic', bandgap:1.49, workFunction:4.5,  latticeConstant:6.48, n0:2.7,  dn:0.15, dk:0.35, atomColorA:0x8899aa, atomColorB:0x888877, bondColor:0x667788, simColor:0x8899aa, desc:'II-VI compound. Used in thin-film solar cells.', shells:[[8,2,'2s 2p'],[18,3,'3d 3s 3p'],[18,4,'4d 4s 4p'],[4,5,'5s 5p']], valence:4, valenceA:2, valenceB:6 },
    zns:   { id:'zns',   name:'Zinc Sulfide',      formula:'ZnS',   type:'cubic', bandgap:3.54, workFunction:4.5,  latticeConstant:5.41, n0:2.3,  dn:0.12, dk:0.30, atomColorA:0x99aacc, atomColorB:0xccaa44, bondColor:0x778899, simColor:0x99aacc, desc:'II-VI compound. Used in phosphors and IR optics.', shells:[[8,2,'2s 2p'],[8,3,'3s 3p'],[4,4,'4s 4p']], valence:4, valenceA:2, valenceB:6 },
    zno:   { id:'zno',   name:'Zinc Oxide',        formula:'ZnO',   type:'wurtzite', bandgap:3.37, workFunction:4.5,  latticeConstant:4.50, n0:2.0,  dn:0.12, dk:0.30, atomColorA:0x99aacc, atomColorB:0x4488cc, bondColor:0x778899, simColor:0x99aacc, desc:'Wide-gap II-VI. Transparent conductor, used in LEDs.', shells:[[8,2,'2s 2p'],[8,3,'3s 3p'],[2,4,'4s 4p']], valence:4, valenceA:2, valenceB:6 }
  };
  window.MATERIAL_PRESETS = MATERIAL_PRESETS;

  var currentMatId = 'si';

  /* ─── THREE.JS GLOBALS ─── */
  var scene, camera, renderer;
  var atoms = [], bonds = [], clouds = [];
  var macroCube, focusGroup, nucleus, coreCloud, valenceShells = [], valenceClouds = [];

  // Lattice atoms electrons
  var latticeElectrons = [];
  var clusterAtoms = [], clusterBonds = [], clusterElectrons = [];

  // Energy band objects (for single-atom bands view)
  var bandPlanes = [], bandElectrons = [], bandGapLabel;

  // Spin-split objects
  var spinLevels = [], spinArrows = [], spinElectrons = [];
  var spinRingLevels = []; // for spin band update
  var orbitControls, laserPistol;

  // Photon / interaction
  var photons = [], excitedAtoms = [];
  var time = 0, thermalAmp = 0.02;
  var animId;
  var focusedAtomIndex = 0;

  // Bohr model baseline: v_n = v_1 / n.  Module-scope so both
  // buildEnergyBands() and buildSpinLevels() can read it.
  var LIN_V_REF = 0.012;

  /* ─── SCALE STATE ─── 6 scales */
  var SCALE = {
    macro:   { camZ: 18, fov: 45, vis: ['macro'],                     label: 'Macro — 1 cm',       info: 'Crystal at centimeter scale. A solid block. Classical continuum — no quantum confinement visible.' },
    lattice: { camZ: 6,  fov: 50, vis: ['atoms','bonds'],             label: 'Lattice — 5 Å',      info: 'Tetrahedral lattice. Each atom has 4 nearest neighbors held by covalent bonds. Atoms vibrate thermally. Bulk band gap defined by the material.' },
    cluster: { camZ: 4.5,fov: 45, vis: ['cluster'],                   label: 'Cluster — 2 Å',      info: 'Small atomic cluster in tetrahedral bonding. Valence electrons orbit the cluster — delocalized bonding electrons start feeling finite size.' },
    atom:    { camZ: 2.5,fov: 35, vis: ['focusAtom','bands','shells'], label: 'Atom — 100 pm',    info: 'Electrons orbit the nucleus in shells. Bohr speed law v_n = v₁/n makes inner shells visibly fastest; outer shells glide. Photon with E > gap excites valence → conduction.' },
    spin:    { camZ: 2,  fov: 30, vis: ['focusAtom','spin'],        label: 'Spin — 10 pm',       info: 'Every energy level splits in two: spin-up (cyan ↑) and spin-down (pink ↓). Each orbital holds 2 electrons with opposite spin — the Pauli exclusion principle.' }
  };
  var curScale = 'macro';

  /* ═══════════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════════ */
  window.initCrystalSim = function() {
    var container = document.getElementById('crystal-canvas');
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050a);
    scene.fog = new THREE.FogExp2(0x05050a, 0.02);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 100);
    camera.position.set(0, 0, SCALE.macro.camZ);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    /* OrbitControls */
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.enablePan = true;
    orbitControls.enableZoom = true;
    orbitControls.rotateSpeed = 0.6;
    orbitControls.minDistance = 0.3;
    orbitControls.maxDistance = 28;

    container.appendChild(renderer.domElement);

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    var dirL = new THREE.DirectionalLight(0xffffff, 0.7);
    dirL.position.set(5, 10, 7);
    scene.add(dirL);
    var ptL = new THREE.PointLight(0x00f0ff, 0.4, 25);
    ptL.position.set(3, 3, 3);
    scene.add(ptL);

    /* Build everything */
    var matConfig = MATERIAL_PRESETS.si;
    buildMacroCube();
    buildLattice(2, 2, 2, 1.0, matConfig);
    buildLatticeElectrons();
    buildFocusAtom(matConfig);
    buildCluster(matConfig);
    buildEnergyBands(matConfig);
    buildSpinLevels();
    buildQuantumClouds();
    buildLaserPistol();

    /* Click-to-aim */
    buildAimReticle();
    setupCanvasClickTargeting();

    /* Start */
    setCrystalScale('macro');
    animate();
    window.addEventListener('resize', onResize);
  };

  /* ═══════════════════════════════════════════════════════════════
     BUILDERS
     ═══════════════════════════════════════════════════════════════ */

  function buildMacroCube() {
    var geo = new THREE.BoxGeometry(4, 4, 4);
    var mat = new THREE.MeshPhysicalMaterial({
      color: 0x8899aa, metalness: 0.6, roughness: 0.35,
      transparent: true, opacity: 0.92,
      clearcoat: 0.3, clearcoatRoughness: 0.2
    });
    macroCube = new THREE.Mesh(geo, mat);
    macroCube.userData.type = 'macro';
    scene.add(macroCube);
  }

  function buildLattice(nx, ny, nz, a, matConfig) {
    matConfig = matConfig || MATERIAL_PRESETS.si;
    var isZincblende = matConfig.atomColorB != null && matConfig.atomColorA !== matConfig.atomColorB;
    var colorA = matConfig.atomColorA || 0x7da4c4;
    var colorB = matConfig.atomColorB || colorA;
    var bc = matConfig.bondColor || 0x556677;

    var atomGeo = new THREE.SphereGeometry(0.12, 24, 24);
    var bondGeo = new THREE.CylinderGeometry(0.025, 0.025, 1, 8);
    var bondMat = new THREE.MeshStandardMaterial({ color: bc, metalness: 0.3, roughness: 0.5 });

    var positions = [], atomTypes = [];
    var basis = [
      [0,0,0],[0.5,0.5,0],[0.5,0,0.5],[0,0.5,0.5],
      [0.25,0.25,0.25],[0.75,0.75,0.25],[0.75,0.25,0.75],[0.25,0.75,0.75]
    ];

    for (var ix = 0; ix < nx; ix++) {
      for (var iy = 0; iy < ny; iy++) {
        for (var iz = 0; iz < nz; iz++) {
          for (var b = 0; b < basis.length; b++) {
            var p = basis[b];
            var x = (ix + p[0]) * a - (nx * a) / 2;
            var y = (iy + p[1]) * a - (ny * a) / 2;
            var z = (iz + p[2]) * a - (nz * a) / 2;
            positions.push(new THREE.Vector3(x, y, z));
            var t = (isZincblende && b >= 4) ? 'B' : 'A';
            atomTypes.push(t);
          }
        }
      }
    }

    for (var i = 0; i < positions.length; i++) {
      var c = atomTypes[i] === 'B' ? colorB : colorA;
      var mat = new THREE.MeshStandardMaterial({ color: c, metalness: 0.4, roughness: 0.4 });
      var mesh = new THREE.Mesh(atomGeo, mat);
      mesh.position.copy(positions[i]);
      mesh.userData = { type: 'atom', basePos: positions[i].clone(), idx: i, atomType: atomTypes[i], excited: false };
      atoms.push(mesh);
      scene.add(mesh);
    }

    var maxBond = 0.45 * a;
    for (var i = 0; i < positions.length; i++) {
      for (var j = i + 1; j < positions.length; j++) {
        if (isZincblende && atomTypes[i] === atomTypes[j]) continue;
        var d = positions[i].distanceTo(positions[j]);
        if (d < maxBond && d > 0.01) {
          var mid = new THREE.Vector3().addVectors(positions[i], positions[j]).multiplyScalar(0.5);
          var bond = new THREE.Mesh(bondGeo, bondMat.clone());
          bond.position.copy(mid);
          bond.lookAt(positions[j]);
          bond.rotateX(Math.PI / 2);
          bond.scale.set(1, d, 1);
          bond.userData = { type: 'bond', atomA: i, atomB: j };
          bonds.push(bond);
          scene.add(bond);
        }
      }
    }
    focusedAtomIndex = Math.floor(atoms.length / 2);
  }

  /* ─── LATTICE ELECTRONS: 4 per atom, orbit each atom simultaneously ─── */
  function buildLatticeElectrons() {
    var eGeo = new THREE.SphereGeometry(0.018, 12, 12);
    var eMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7 });
    // 4 orbital configurations per atom: different radii, tilts, speeds
    var orbits = [
      { r: 0.16, tiltX: 0.0,  tiltZ: 0.0,  speed: 1.6 },
      { r: 0.20, tiltX: 0.4,  tiltZ: 0.0,  speed: 1.2 },
      { r: 0.18, tiltX: 0.0,  tiltZ: 0.5,  speed: 0.9 },
      { r: 0.22, tiltX: 0.3,  tiltZ: 0.4,  speed: 0.7 }
    ];
    atoms.forEach(function(atom, aIdx) {
      orbits.forEach(function(orb, oIdx) {
        var electron = new THREE.Mesh(eGeo, eMat.clone());
        var angle = (oIdx / 4) * Math.PI * 2 + aIdx * 0.5;
        // Initial position relative to atom center
        var x = Math.cos(angle) * orb.r;
        var z = Math.sin(angle) * orb.r;
        var y = 0;
        // Apply tilt
        var rx = x * Math.cos(orb.tiltX) - y * Math.sin(orb.tiltX);
        var ry = x * Math.sin(orb.tiltX) + y * Math.cos(orb.tiltX);
        var rz = z * Math.cos(orb.tiltZ) - ry * Math.sin(orb.tiltZ);
        ry = z * Math.sin(orb.tiltZ) + ry * Math.cos(orb.tiltZ);
        electron.position.set(atom.userData.basePos.x + rx,
                              atom.userData.basePos.y + ry,
                              atom.userData.basePos.z + rz);
        electron.userData = {
          type: 'latticeElectron',
          atomIdx: aIdx,
          angle: angle,
          orbitR: orb.r,
          speed: orb.speed,
          tiltX: orb.tiltX,
          tiltZ: orb.tiltZ,
          oIdx: oIdx
        };
        latticeElectrons.push(electron);
        scene.add(electron);
      });
    });
  }

  /* ─── CLUSTER: 5 Si atoms, covalently linked. Free electrons = 4 − bonds. ───
     Si valence = 4. Center atom: 4 bonds → 0 free e⁻.
     Corner atoms: 3 bonds → 1 free e⁻ each. 4 free e⁻ total.
     Free electrons orbit their atom as small cyan spheres. */
  var clusterSprings = []; // { atomA, atomB, restLength, k }

  function buildCluster(matConfig) {
    matConfig = matConfig || MATERIAL_PRESETS.si;
    var s = matConfig.latticeConstant / 5.43;
    var isZincblende = matConfig.atomColorB != null && matConfig.atomColorA !== matConfig.atomColorB;
    var colorA = matConfig.atomColorA || 0x7da4c4;
    var colorB = matConfig.atomColorB || colorA;
    var bc = matConfig.bondColor || 0x8899aa;
    // Atom radii — compound B atom (typically smaller anion) slightly smaller
    var radiusA = 0.14 * s;
    var radiusB = isZincblende ? 0.13 * s : radiusA;
    var atomGeoA = new THREE.SphereGeometry(radiusA, 24, 24);
    var atomGeoB = new THREE.SphereGeometry(radiusB, 24, 24);
    var atomMatA = new THREE.MeshStandardMaterial({ color: colorA, metalness: 0.5, roughness: 0.3 });
    var atomMatB = new THREE.MeshStandardMaterial({ color: colorB, metalness: 0.5, roughness: 0.3 });
    var bondGeo = new THREE.CylinderGeometry(0.025 * s, 0.025 * s, 1, 8);
    var bondMat = new THREE.MeshStandardMaterial({ color: bc, metalness: 0.3, roughness: 0.4 });

    // Tetrahedral directions
    var dirs = [
      new THREE.Vector3(1, 1, 1).normalize(),
      new THREE.Vector3(1, -1, -1).normalize(),
      new THREE.Vector3(-1, 1, -1).normalize(),
      new THREE.Vector3(-1, -1, 1).normalize()
    ];
    var dist = 0.65 * s;

    // Center atom (type A for zincblende)
    var center = new THREE.Mesh(atomGeoA, atomMatA);
    center.position.set(0, 0, 0);
    center.userData = {
      type: 'clusterAtom', basePos: new THREE.Vector3(0,0,0),
      idx: 0, atomType: 'A', vel: new THREE.Vector3(0,0,0), bondCount: 0
    };
    clusterAtoms.push(center);
    scene.add(center);

    // 4 corner atoms (type B for zincblende)
    for (var i = 0; i < 4; i++) {
      var pos = dirs[i].clone().multiplyScalar(dist);
      var a = new THREE.Mesh(atomGeoB, atomMatB.clone());
      a.position.copy(pos);
      a.userData = {
        type: 'clusterAtom', basePos: pos.clone(),
        idx: i + 1, atomType: isZincblende ? 'B' : 'A', vel: new THREE.Vector3(0,0,0), bondCount: 0
      };
      clusterAtoms.push(a);
      scene.add(a);
    }

    // Build spring bonds with restLength
    function addBond(ai, bi) {
      var pa = clusterAtoms[ai].position;
      var pb = clusterAtoms[bi].position;
      var rl = pa.distanceTo(pb);
      var mid = new THREE.Vector3().addVectors(pa, pb).multiplyScalar(0.5);
      var bond = new THREE.Mesh(bondGeo, bondMat.clone());
      bond.position.copy(mid);
      bond.lookAt(pb);
      bond.rotateX(Math.PI / 2);
      bond.scale.set(1, rl, 1);
      bond.userData = { type: 'clusterBond', atomA: ai, atomB: bi };
      clusterBonds.push(bond);
      clusterSprings.push({ atomA: ai, atomB: bi, restLength: rl, k: 0.08 });
      scene.add(bond);
      // increment bond counts
      clusterAtoms[ai].userData.bondCount = (clusterAtoms[ai].userData.bondCount || 0) + 1;
      clusterAtoms[bi].userData.bondCount = (clusterAtoms[bi].userData.bondCount || 0) + 1;
    }

    // Center-to-corners (4 bonds — always correct for tetrahedral)
    for (var i = 1; i < 5; i++) addBond(0, i);
    // Corner-to-corner (tetrahedron edges)
    // For zincblende: same-type B-B bonds don't exist in real crystal,
    // but we show them as faint guide-lines for structural context.
    for (var i = 1; i < 5; i++) {
      for (var j = i + 1; j < 5; j++) {
        if (isZincblende) {
          // Faint guide-line (not a real bond — same-type atoms)
          var pa = clusterAtoms[i].position;
          var pb = clusterAtoms[j].position;
          var rl = pa.distanceTo(pb);
          var mid = new THREE.Vector3().addVectors(pa, pb).multiplyScalar(0.5);
          var gGeo = new THREE.CylinderGeometry(0.012, 0.012, 1, 6);
          var gMat = new THREE.MeshBasicMaterial({ color: bc, transparent: true, opacity: 0.15, depthWrite: false });
          var guide = new THREE.Mesh(gGeo, gMat);
          guide.position.copy(mid);
          guide.lookAt(pb);
          guide.rotateX(Math.PI / 2);
          guide.scale.set(1, rl, 1);
          guide.userData = { type: 'clusterBond', atomA: i, atomB: j, guide: true };
          clusterBonds.push(guide);
          scene.add(guide);
          // No spring for guide bonds
        } else {
          addBond(i, j);
        }
      }
    }

    // ── FREE ELECTRONS: per-atom valence minus bulk coord (4 for tetrahedral) ──
    var eGeo = new THREE.SphereGeometry(0.038 * s, 16, 16);
    var eMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.9 });
    clusterAtoms.forEach(function(atom, idx) {
      var atomType = atom.userData.atomType;
      var valE = (atomType === 'B' && matConfig.valenceB != null) ? matConfig.valenceB :
                 (atomType === 'A' && matConfig.valenceA != null) ? matConfig.valenceA :
                 (matConfig.valence || 4);
      // Bulk coordination = 4 (full tetrahedral). Dangling bonds from truncation ignored.
      var free = Math.max(0, valE - 4);
      for (var e = 0; e < free; e++) {
        var electron = new THREE.Mesh(eGeo, eMat.clone());
        electron.position.copy(atom.position);
        electron.userData = {
          type: 'clusterElectron',
          atomIdx: idx,
          angle: e * 2.4 + idx * 0.7,
          orbitR: 0.22 + e * 0.04,
          speed: 1.5 + Math.random() * 0.6,
          tiltX: (Math.random() - 0.5) * 1.2,
          tiltZ: (Math.random() - 0.5) * 1.0
        };
        clusterElectrons.push(electron);
        scene.add(electron);
      }
    });
  }

  /* ─── FOCUS ATOM: nucleus + shells (diatomic for compounds) ─── */
  function buildFocusAtom(matConfig) {
    matConfig = matConfig || MATERIAL_PRESETS.si;
    var s = matConfig.latticeConstant / 5.43;
    var isCompound = matConfig.atomColorB != null && matConfig.atomColorA !== matConfig.atomColorB;
    focusGroup = new THREE.Group();

    if (isCompound) {
      // Diatomic molecule: two atoms with own core electrons + shared bonding
      var bondLen = 0.35 * s;
      var atomR = 0.04 * s;
      var colorA = matConfig.atomColorA || 0x7da4c4;
      var colorB = matConfig.atomColorB || 0x5b7b8e;
      var bc = matConfig.bondColor || 0x556677;
      var shells = matConfig.shells || [[8,2,'2s 2p'],[4,3,'3s 3p']];
      var valCount = matConfig.valence || 4;

      // Atom A nucleus (e.g. In, Ga)
      var ag = new THREE.SphereGeometry(atomR * 1.8, 24, 24);
      var amA = new THREE.MeshBasicMaterial({ color: colorA });
      var atomA = new THREE.Mesh(ag, amA);
      atomA.position.set(-bondLen / 2, 0, 0);
      atomA.userData = { type: 'nucleus', element: 'A' };
      focusGroup.add(atomA);

      // Atom B nucleus (e.g. P, As)
      var amB = new THREE.MeshBasicMaterial({ color: colorB });
      var atomB = new THREE.Mesh(ag.clone(), amB);
      atomB.position.set(bondLen / 2, 0, 0);
      atomB.userData = { type: 'nucleus', element: 'B' };
      focusGroup.add(atomB);

      // Bond cylinder between them
      var bondGeo = new THREE.CylinderGeometry(0.018, 0.018, 1, 8);
      var bondMat = new THREE.MeshBasicMaterial({ color: bc, transparent: true, opacity: 0.5 });
      var bond = new THREE.Mesh(bondGeo, bondMat);
      bond.position.set(0, 0, 0);
      bond.scale.set(1, bondLen, 1);
      bond.rotation.x = Math.PI / 2;
      bond.userData = { type: 'bond' };
      focusGroup.add(bond);

      // Bonding electron cloud between atoms (shared valence)
      var bondCloudGeo = new THREE.SphereGeometry(0.08 * s, 16, 16);
      var bondCloudMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff, transparent: true, opacity: 0.2,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      var bondCloud = new THREE.Mesh(bondCloudGeo, bondCloudMat);
      bondCloud.position.set(0, 0, 0);
      bondCloud.scale.set(1.8, 0.8, 0.8);
      bondCloud.userData = { type: 'bondingCloud' };
      focusGroup.add(bondCloud);

      // Core electron cloud around each atom (inner shells — radii differ by group)
      var coreRA = 0.065 * s;  // cation (group III, smaller core)
      var coreRB = 0.055 * s;  // anion (group V, larger core — more core electrons)
      var coreColorA = 0x555588;
      var coreColorB = 0x664466;
      [-1, 1].forEach(function(side) {
        var isA = side < 0;
        var r = isA ? coreRA : coreRB;
        var col = isA ? coreColorA : coreColorB;
        var cGeo = new THREE.SphereGeometry(r, 16, 16);
        var cMat = new THREE.MeshBasicMaterial({
          color: col, transparent: true, opacity: 0.18,
          blending: THREE.AdditiveBlending, depthWrite: false
        });
        var cMesh = new THREE.Mesh(cGeo, cMat);
        cMesh.position.set(side * bondLen / 2, 0, 0);
        cMesh.userData = { type: 'coreShell' };
        valenceShells.push(cMesh);
        focusGroup.add(cMesh);
      });

      // Shared valence electron dots orbiting around the bond axis
      var veGeo = new THREE.SphereGeometry(0.025 * s, 8, 8);
      var veMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      for (var e = 0; e < Math.min(valCount, 4); e++) {
        var edot = new THREE.Mesh(veGeo, veMat.clone());
        var angle = (e / Math.min(valCount, 4)) * Math.PI * 2;
        edot.position.set(0, Math.cos(angle) * 0.14 * s, Math.sin(angle) * 0.14 * s);
        edot.userData = { type: 'bandElectron', baseAngle: angle, orbitR: 0.14 * s, n: 3, linV: 0.004, baseOmega: 0.004 / (0.14 * s), speed: 1.0, excited: false, bandIdx: -1 };
        bandElectrons.push(edot);
        focusGroup.add(edot);
      }

      coreCloud = bondCloud;
      nucleus = atomA;
    } else {
      // Single atom for elemental materials
      var nGeo = new THREE.SphereGeometry(0.04 * s, 32, 32);
      var nMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
      nucleus = new THREE.Mesh(nGeo, nMat);
      nucleus.userData.type = 'nucleus';
      focusGroup.add(nucleus);

      var cGeo = new THREE.SphereGeometry(0.18 * s, 32, 32);
      var cMat = new THREE.MeshBasicMaterial({
        color: 0x555588, transparent: true, opacity: 0.22,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      coreCloud = new THREE.Mesh(cGeo, cMat);
      coreCloud.userData.type = 'coreShell';
      focusGroup.add(coreCloud);

      // Valence lobes (4 tetrahedral)
      var valDirs = [
        new THREE.Vector3(1,1,1).normalize(),
        new THREE.Vector3(1,-1,-1).normalize(),
        new THREE.Vector3(-1,1,-1).normalize(),
        new THREE.Vector3(-1,-1,1).normalize()
      ];
      var vGeo = new THREE.SphereGeometry(0.26 * s, 32, 32);
      var vMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff, transparent: true, opacity: 0.15,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      for (var i = 0; i < 4; i++) {
        var lobe = new THREE.Mesh(vGeo, vMat.clone());
        lobe.position.copy(valDirs[i]).multiplyScalar(0.22 * s);
        lobe.scale.set(1, 0.55, 1);
        lobe.lookAt(new THREE.Vector3().addVectors(lobe.position, valDirs[i]));
        lobe.userData = { type: 'valenceShell', dir: valDirs[i] };
        valenceShells.push(lobe);
        focusGroup.add(lobe);
      }
    }

    var fp = atoms[focusedAtomIndex].userData.basePos;
    focusGroup.position.copy(fp);
    focusGroup.userData.type = 'focusGroup';
    scene.add(focusGroup);
  }

  /* ─── ENERGY BANDS: concentric rings around nucleus, electrons orbit ─── */
  function buildEnergyBands(matConfig) {
    matConfig = matConfig || MATERIAL_PRESETS.si;
    var shells = matConfig.shells || [[8,2,'2s 2p'],[4,3,'3s 3p']];
    var valence = matConfig.valence || 4;
    var s = matConfig.latticeConstant / 5.43;

    /* Build ring levels from shell data.
       Base radius starts at 0.25, each shell gets +0.12 spacing, scaled by s.
       Inner 1s² core is always the first ring (r=0.18). */
    var levels = [];
    var baseR = 0.22;
    var rStep = 0.13;
    // Core level (1s-like, always present as first tight ring)
    levels.push({ r: baseR * s, color: 0x555588, opacity: 0.28, label: 'core', count: 2, n: 1 });
    shellLoop:
    for (var si = 0; si < shells.length; si++) {
      var sh = shells[si];
      var count = sh[0], n = sh[1], label = sh[2] || '';
      var r = (baseR + rStep * (si + 1)) * s;
      var hue = 0.6 + si * 0.08;
      // Cycle through colors
      var colors = [0x6666aa, 0x4488cc, 0x00f0ff, 0xaa88ff, 0xff88cc];
      levels.push({ r: r, color: colors[si % colors.length], opacity: 0.18 + si * 0.01, label: label, count: count, n: n });
    }
    // Empty conduction level
    var condR = (baseR + rStep * (shells.length + 1)) * s;
    levels.push({ r: condR, color: 0xc084fc, opacity: 0.15, label: 'cond', count: 0, n: (shells[shells.length-1]||[0,4])[1] + 1 });

    levels.forEach(function(lvl, idx) {
      // Concentric ring
      var tubeGeo = new THREE.TorusGeometry(lvl.r, 0.008, 8, 64);
      var tubeMat = new THREE.MeshBasicMaterial({
        color: lvl.color, transparent: true, opacity: lvl.opacity,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      var ring = new THREE.Mesh(tubeGeo, tubeMat);
      ring.rotation.x = Math.PI / 2;
      ring.userData = { type: 'bandPlane', levelIdx: idx, levelInfo: lvl };
      bandPlanes.push(ring);
      focusGroup.add(ring);

      // Electrons orbiting on this ring
      if (lvl.count > 0) {
        var eGeo = new THREE.SphereGeometry(0.032 * s, 16, 16);
        var eMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        var visCount = Math.min(lvl.count, 8);
        var linV  = LIN_V_REF / lvl.n;
        var baseO = linV / lvl.r;
        for (var e = 0; e < visCount; e++) {
          var electron = new THREE.Mesh(eGeo, eMat.clone());
          var angle = (e / visCount) * Math.PI * 2 + idx * 0.7;
          electron.position.set(Math.cos(angle) * lvl.r, 0, Math.sin(angle) * lvl.r);
          electron.userData = {
            type: 'bandElectron',
            bandIdx: idx,
            baseAngle: angle,
            orbitR: lvl.r,
            n: lvl.n,
            linV: linV,
            baseOmega: baseO,
            speed: 1.0,
            excited: false
          };
          bandElectrons.push(electron);
          focusGroup.add(electron);
        }
      }
    });

    // Conduction band electrons (hidden initially)
    var ceGeo = new THREE.SphereGeometry(0.032 * s, 16, 16);
    var ceMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0 });
    var condLinV  = LIN_V_REF / (shells.length + 1);
    var condBaseO = condLinV / condR;
    for (var e = 0; e < 4; e++) {
      var ce = new THREE.Mesh(ceGeo, ceMat.clone());
      var angle = (e / 4) * Math.PI * 2;
      ce.position.set(Math.cos(angle) * condR, 0, Math.sin(angle) * condR);
      ce.userData = {
        type: 'conductionElectron',
        baseAngle: angle,
        orbitR: condR,
        n: shells.length + 1,
        linV: condLinV,
        baseOmega: condBaseO,
        speed: 1.0,
        active: false
      };
      bandElectrons.push(ce);
      focusGroup.add(ce);
    }
  }

  /* ─── SPIN LEVELS: up & down electrons share SAME orbital ring ───
     Pauli principle: every energy level holds 2 electrons with opposite spin.
     Cyan = spin-up (arrow ↑), Pink = spin-down (arrow ↓).
     Both orbit the SAME radius — the band is one shared ring.
     Bohr speed law  v_n = v_1 / n  applied here too, so the 1s ring
     visibly whizzes and the 3p ring glides. */
  function buildSpinLevels() {
    // Principal quantum numbers for the displayed levels (1s, 2p, 3p)
    var ns = [1, 2, 3];
    var levelData = [
      { r: 0.24, label: '1s' },
      { r: 0.38, label: '2p' },
      { r: 0.55, label: '3p' }
    ];

    levelData.forEach(function(l, idx) {
      // Bohr-derived angular rate for this level
      var linV  = LIN_V_REF / ns[idx];
      var baseO = linV / l.r;

      // ── ONE shared ring per level (white/cyan blend) ──
      var tube = new THREE.TorusGeometry(l.r, 0.007, 8, 64);
      var ringMat = new THREE.MeshBasicMaterial({
        color: 0x88ccff, transparent: true, opacity: 0.16,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      var ring = new THREE.Mesh(tube, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.userData = { type: 'spinRing', levelIdx: idx };
      spinLevels.push(ring);
      focusGroup.add(ring);
      spinRingLevels.push(ring); // ref for update

      var eGeo = new THREE.SphereGeometry(0.028, 16, 16);
      var baseAngle = idx * 1.3;

      // ── Spin-up electron (cyan, arrow ↑) on shared ring ──
      var eUpMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      var eUp = new THREE.Mesh(eGeo, eUpMat);
      eUp.position.set(Math.cos(baseAngle) * l.r, 0, Math.sin(baseAngle) * l.r);
      eUp.userData = {
        type: 'spinElectron', spin: 'up', levelIdx: idx,
        angle: baseAngle, r: l.r,
        n: ns[idx], linV: linV, baseOmega: baseO,
        speed: 1.0            // dynamic multiplier (was hard-coded 1.6+idx*0.35)
      };
      spinElectrons.push(eUp);
      focusGroup.add(eUp);

      var arrowUp = buildSpinArrow(0x00f0ff, 1);
      arrowUp.position.copy(eUp.position);
      arrowUp.userData = { type: 'spinArrow', parent: eUp, spin: 'up', offset: 0.045 };
      spinArrows.push(arrowUp);
      focusGroup.add(arrowUp);

      // ── Spin-down electron (pink, arrow ↓) on SAME ring, π opposite ──
      var eDownMat = new THREE.MeshBasicMaterial({ color: 0xff4ecd });
      var eDown = new THREE.Mesh(eGeo, eDownMat);
      var aDown = baseAngle + Math.PI;
      eDown.position.set(Math.cos(aDown) * l.r, 0, Math.sin(aDown) * l.r);
      eDown.userData = {
        type: 'spinElectron', spin: 'down', levelIdx: idx,
        angle: aDown, r: l.r,
        n: ns[idx], linV: linV, baseOmega: baseO,
        speed: 0.92            // slight tweak so ↑ and ↓ are visually separable
      };
      spinElectrons.push(eDown);
      focusGroup.add(eDown);

      var arrowDown = buildSpinArrow(0xff4ecd, -1);
      arrowDown.position.copy(eDown.position);
      arrowDown.userData = { type: 'spinArrow', parent: eDown, spin: 'down', offset: -0.045 };
      spinArrows.push(arrowDown);
      focusGroup.add(arrowDown);
    });
  }

  // Small arrow cone pointing up (dir=1) or down (dir=-1)
  function buildSpinArrow(color, dir) {
    var group = new THREE.Group();
    var coneGeo = new THREE.ConeGeometry(0.012, 0.04, 8);
    var coneMat = new THREE.MeshBasicMaterial({ color: color });
    var cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = dir > 0 ? 0 : Math.PI; // flip for down
    cone.position.y = dir > 0 ? 0.03 : -0.03;
    group.add(cone);
    return group;
  }

  /* ─── QUANTUM CLOUDS ─── */
  function buildQuantumClouds() {
    var cGeo = new THREE.SphereGeometry(0.15, 20, 20);
    var cMat = new THREE.MeshBasicMaterial({
      color: 0x555588, transparent: true, opacity: 0.10,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    for (var i = 0; i < atoms.length; i++) {
      var cloud = new THREE.Mesh(cGeo, cMat.clone());
      cloud.position.copy(atoms[i].userData.basePos);
      cloud.userData = { type: 'coreCloud', atomIdx: i };
      clouds.push(cloud);
      scene.add(cloud);
    }

    var vGeo = new THREE.SphereGeometry(0.30, 20, 20);
    var vMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff, transparent: true, opacity: 0.07,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    for (var i = 0; i < bonds.length; i++) {
      var b = bonds[i];
      var cloud = new THREE.Mesh(vGeo, vMat.clone());
      cloud.position.copy(b.position);
      cloud.scale.set(1, b.scale.y * 1.5, 1);
      cloud.lookAt(atoms[b.userData.atomB].userData.basePos);
      cloud.rotateX(Math.PI / 2);
      cloud.userData = { type: 'valenceCloud', bondIdx: i };
      valenceClouds.push(cloud);
      scene.add(cloud);
    }
  }

  /* ─── LASER PISTOL: visible source of photons/EM waves ─── */
  function buildLaserPistol() {
    var group = new THREE.Group();
    var greyMat = new THREE.MeshStandardMaterial({
      color: 0x334455, metalness: 0.75, roughness: 0.25
    });
    // Barrel — long cylinder along +X
    var barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.55, 12),
      greyMat
    );
    barrel.rotation.z = Math.PI / 2;
    group.add(barrel);
    // Muzzle cone
    var muzzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.045, 0.10, 12),
      new THREE.MeshBasicMaterial({ color: 0xff3300 })
    );
    muzzle.rotation.z = -Math.PI / 2;
    muzzle.position.set(0.30, 0, 0);
    group.add(muzzle);
    // Grip
    var grip = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.22, 0.04),
      greyMat
    );
    grip.position.set(-0.18, -0.12, 0);
    group.add(grip);
    // Body detail
    var body = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.07, 0.05),
      greyMat
    );
    group.add(body);
    // Cyan status LED
    var led = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    led.position.set(0.0, 0.045, 0.03);
    group.add(led);

    // Position on screen-right, pointing at origin
    group.position.set(4.0, -0.5, 1.0);
    group.lookAt(new THREE.Vector3(0, 0, 0));
    group.userData.type = 'laserPistol';
    scene.add(group);
    laserPistol = group;

    // ── AIM LINE: a faint dashed line from barrel tip to current target ──
    // Updated every frame to follow the energy slider color and the
    // current scale's target.  Visible at all scales — the user can see
    // exactly where the laser is pointing before pulling the trigger.
    var aimMat = new THREE.LineDashedMaterial({
      color: 0x00f0ff,            // updated per-frame to current photon color
      dashSize: 0.15,
      gapSize: 0.10,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });
    var aimGeo = new THREE.BufferGeometry();
    aimGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    var aimLine = new THREE.Line(aimGeo, aimMat);
    aimLine.frustumCulled = false;
    aimLine.renderOrder = 999;
    aimLine.userData = { type: 'aimLine' };
    scene.add(aimLine);
    laserPistol.userData.aimLine = aimLine;

    // Bright impact ring that flashes at the aim-line's endpoint when a
    // photon is fired — tells the user "this is where the wave will hit".
    var impactGeo = new THREE.RingGeometry(0.18, 0.30, 32);
    var impactMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff, transparent: true, opacity: 0,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      depthTest: false
    });
    var impactRing = new THREE.Mesh(impactGeo, impactMat);
    impactRing.frustumCulled = false;
    impactRing.renderOrder = 1000;
    impactRing.userData = { type: 'impactRing' };
    scene.add(impactRing);
    laserPistol.userData.impactRing = impactRing;
  }

  /* ─── Position + aim the laser pistol for the current scale ───
     Each scale has a different focus point and camera distance, so the
     pistol's position, scale, and aim line have to be re-tuned.

     IMPORTANT: the gun's BARREL is along +X (see buildLaserPistol), so we
     must orient the gun so +X points at the aim target — NOT use lookAt
     (which orients -Z at the target and would leave the barrel sticking
     out sideways).  The aim target itself is tilted by θᵢ in a plane
     perpendicular to the gun→cube line, so the wave always enters the
     cube's front face (never flies off into empty space). */
  function getPistolAimTarget() {
    // If user clicked to aim, use that point directly (θᵢ bypassed)
    if (window.customAimTarget) return window.customAimTarget.clone();

    // Centre of the cube/atom we want to aim at (or just origin)
    var center = new THREE.Vector3(0, 0, 0);
    if (['bands','atom','spin'].indexOf(curScale) >= 0 && atoms[focusedAtomIndex]) {
      center.copy(atoms[focusedAtomIndex].position);
    } else if (curScale === 'cluster' && clusterAtoms[0]) {
      center.copy(clusterAtoms[0].position);
    }
    if (!laserPistol) return center;
    var tip = new THREE.Vector3(0.30, 0, 0);
    tip.applyMatrix4(laserPistol.matrixWorld);   // tip in world space (pre-rotation)

    // 1) Line from tip to cube centre — this is the gun's "neutral" aim.
    var toCenter = new THREE.Vector3().subVectors(center, tip);
    var dist = toCenter.length();
    if (dist < 1e-6) return center.clone();

    // 2) Choose a "up" direction for the tilt plane.  Use world +Y by default;
    //    fall back to +Z if the line is too close to vertical.
    var worldUp = new THREE.Vector3(0, 1, 0);
    var along = toCenter.clone().divideScalar(dist);  // unit
    if (Math.abs(along.dot(worldUp)) > 0.95) worldUp.set(0, 0, 1);

    // 3) Build an orthonormal basis (along, right, up) where right ⊥ along ⊥ up.
    var right = new THREE.Vector3().crossVectors(worldUp, along).normalize();
    var up = new THREE.Vector3().crossVectors(along, right).normalize();

    // 4) At θᵢ=0, the target is the cube centre.  At θᵢ>0, the target moves
    //    along the "up" axis by dist*tan(θᵢ), so the gun tilts up.
    //    Clamp at 89° so we never shoot backwards.
    var theta = getIncidentAngleRad();
    var offset = dist * Math.tan(theta);
    if (offset > dist * 50) offset = dist * 50;

    // 5) Aim target = centre + offset * up
    return new THREE.Vector3(
      center.x + up.x * offset,
      center.y + up.y * offset,
      center.z + up.z * offset
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     MOUSE AIM — click on canvas to set photon impact point
     ═══════════════════════════════════════════════════════════════ */
  window.customAimTarget = null;  // Vector3 or null — exposed so UI can read
  window.aimModeActive = false;   // toggle — click-to-aim on/off
  var aimReticle = null;       // small ring marking the aim point
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  function buildAimReticle() {
    if (aimReticle) { scene.remove(aimReticle); aimReticle = null; }
    var ring = new THREE.RingGeometry(0.045, 0.065, 24);
    var ringMat = new THREE.MeshBasicMaterial({
      color: 0xff4444, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
      depthTest: false
    });
    aimReticle = new THREE.Mesh(ring, ringMat);
    aimReticle.visible = false;
    scene.add(aimReticle);
  }

  window.setPhotonAimTarget = function(point) {
    window.customAimTarget = point.clone();
    if (!aimReticle) buildAimReticle();
    aimReticle.position.copy(point);
    aimReticle.lookAt(camera.position);
    aimReticle.visible = true;
  }

  window.clearPhotonAimTarget = function() {
    window.customAimTarget = null;
    if (aimReticle) aimReticle.visible = false;
  }

  window.toggleAimMode = function(active) {
    window.aimModeActive = !!active;
    renderer.domElement.style.cursor = window.aimModeActive ? 'crosshair' : '';
    if (!window.aimModeActive) {
      window.customAimTarget = null;
      if (aimReticle) aimReticle.visible = false;
    }
  };

  function setupCanvasClickTargeting() {
    var canvas = renderer.domElement;
    canvas.addEventListener('click', function(e) {
      if (!window.aimModeActive) return;  // ignore click, let orbit controls work
      var rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Collect all visible meshes in the scene for hit testing
      var meshes = [];
      scene.traverse(function(child) {
        if (child.isMesh && child.visible && child !== aimReticle) {
          meshes.push(child);
        }
      });

      var intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        setPhotonAimTarget(intersects[0].point);
      } else {
        // Click on empty space → fire toward that direction along the ray
        var dir = raycaster.ray.direction.clone();
        var dist = 2.0; // scene-relative depth
        var point = raycaster.ray.origin.clone().add(dir.multiplyScalar(dist));
        setPhotonAimTarget(point);
      }
    });

    // Right-click or Escape to clear manual aim (only in aim mode)
    canvas.addEventListener('contextmenu', function(e) { if (window.aimModeActive) { e.preventDefault(); clearPhotonAimTarget(); } });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && window.aimModeActive) clearPhotonAimTarget(); });
  }

  function positionPistolForScale(mode) {
    if (!laserPistol) return;
    if (mode === 'macro') {
      // Pull the pistol back, scale it up to read at the wide camera.
      laserPistol.position.set(7.5, -2.5, 4.0);
      laserPistol.scale.setScalar(2.4);
    } else if (mode === 'lattice') {
      laserPistol.position.set(4.5, -0.5, 1.5);
      laserPistol.scale.setScalar(1.0);
    } else if (mode === 'cluster') {
      laserPistol.position.set(3.5, -0.4, 1.0);
      laserPistol.scale.setScalar(0.8);
    } else {
      // atom / spin: tight close-up, pistol is small and off to the side
      laserPistol.position.set(2.0, -0.3, 0.8);
      laserPistol.scale.setScalar(0.45);
    }
    // Orient so the BARREL (+X) points at the tilted aim target, not the cube center.
    aimPistolAtTarget();
  }

  // Orient the gun so its local +X (barrel direction) points at the tilted aim target.
  // Use this everywhere we re-aim the gun.
  function aimPistolAtTarget() {
    if (!laserPistol) return;
    // The tip's world position depends on the gun's CURRENT rotation, which
    // we are about to overwrite.  Reset to identity first so the tip we
    // compute is the un-rotated barrel tip, then apply the new rotation.
    // We also temporarily clear the parent's matrixWorldNeedsUpdate.
    var prevQuat = laserPistol.quaternion.clone();
    laserPistol.quaternion.identity();
    laserPistol.updateMatrixWorld(true);
    var tip = new THREE.Vector3(0.30, 0, 0);
    tip.applyMatrix4(laserPistol.matrixWorld);
    var target = getPistolAimTarget();
    var aimDir = new THREE.Vector3().subVectors(target, tip);
    if (aimDir.length() < 0.01) {
      laserPistol.quaternion.copy(prevQuat);  // restore on no-op
      return;
    }
    aimDir.normalize();
    var quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), aimDir);
    laserPistol.setRotationFromQuaternion(quat);
  }

  /* ─── Update aim line geometry + color every frame ───
     The aim line goes from the BARREL TIP (in world coords) to the
     aim TARGET — a point on the cube/atom surface in the direction the
     gun is pointing.  We reuse getPistolAimTarget() so the line is always
     parallel to the gun barrel and shows exactly where the wave will
     enter the surface, even when θᵢ ≠ 0. */
  function updateAimLine() {
    if (!laserPistol || !laserPistol.userData.aimLine) return;
    var aim = laserPistol.userData.aimLine;

    // Barrel tip in world space (local +X = 0.30, then apply group matrix)
    var tip = new THREE.Vector3(0.30, 0, 0);
    tip.applyMatrix4(laserPistol.matrixWorld);

    // Aim line ends at the tilted aim target (parallel to barrel)
    var aimEnd = getPistolAimTarget();

    // Update geometry
    var pos = aim.geometry.attributes.position.array;
    pos[0] = tip.x;    pos[1] = tip.y;    pos[2] = tip.z;
    pos[3] = aimEnd.x; pos[4] = aimEnd.y; pos[5] = aimEnd.z;
    aim.geometry.attributes.position.needsUpdate = true;
    aim.computeLineDistances();   // required for LineDashedMaterial

    // Color from photon-slider energy
    var slider = document.getElementById('photon-slider');
    if (slider) {
      var E = parseFloat(slider.value) || 1.5;
      var c = photonColorFromEnergy(E);
      aim.material.color.setHex(c);
    }

    // Impact ring sits at aim-end and gently pulses
    var ring = laserPistol.userData.impactRing;
    if (ring) {
      ring.position.copy(aimEnd);
      // Face the camera
      ring.lookAt(camera.position);
      // Pulse the opacity slowly
      if (ring.material.opacity < 0.3) {
        ring.material.opacity = 0.18 + 0.10 * Math.sin(performance.now() * 0.003);
      }
    }
  }

  /* ─── Brief flash on the impact ring when a photon is fired ─── */
  function flashImpactRing() {
    if (!laserPistol || !laserPistol.userData.impactRing) return;
    var ring = laserPistol.userData.impactRing;
    ring.material.opacity = 1.0;
    // Quickly fade out
    var start = performance.now();
    function decay() {
      var dt = (performance.now() - start) / 600;
      if (dt >= 1) { ring.material.opacity = 0; return; }
      ring.material.opacity = 1.0 - dt;
      requestAnimationFrame(decay);
    }
    requestAnimationFrame(decay);
  }

  /* ═══════════════════════════════════════════════════════════════
     SCALE / VISIBILITY
     ═══════════════════════════════════════════════════════════════ */
  window.setCrystalScale = function(mode) {
    if (!SCALE[mode]) return;
    curScale = mode;
    var cfg = SCALE[mode];

    targetCamZ = cfg.camZ;
    targetFov = cfg.fov;

    // Look-at: focus atom for close scales, center for far
    if (['bands','atom','spin'].indexOf(mode) >= 0 && atoms[focusedAtomIndex]) {
      var ap = atoms[focusedAtomIndex].position || atoms[focusedAtomIndex].userData.basePos;
      targetLookAt.copy(ap);
    } else if (mode === 'cluster' && clusterAtoms[0]) {
      targetLookAt.copy(clusterAtoms[0].position);
    } else {
      targetLookAt.set(0, 0, 0);
    }
    if (orbitControls) orbitControls.target.copy(targetLookAt);

    // Visibility toggles
    if (macroCube) macroCube.visible = cfg.vis.indexOf('macro') >= 0;
    // Pistol is now visible at ALL scales.  We scale + reposition it per
    // scale so it always sits in the camera's frame and points at the
    // current focus point.
    if (laserPistol) laserPistol.visible = true;

    // Full lattice atoms/bonds
    atoms.forEach(function(a){ a.visible = cfg.vis.indexOf('atoms') >= 0; });
    bonds.forEach(function(b){ b.visible = cfg.vis.indexOf('bonds') >= 0; });
    clouds.forEach(function(c){ c.visible = cfg.vis.indexOf('clouds') >= 0; });
    valenceClouds.forEach(function(c){ c.visible = cfg.vis.indexOf('clouds') >= 0; });

    // Per-atom lattice electrons
    latticeElectrons.forEach(function(e){ e.visible = cfg.vis.indexOf('atoms') >= 0; });

    // Focus atom group
    if (focusGroup) focusGroup.visible = cfg.vis.indexOf('focusAtom') >= 0;
    if (nucleus) nucleus.visible = cfg.vis.indexOf('focusAtom') >= 0;
    if (coreCloud) coreCloud.visible = cfg.vis.indexOf('shells') >= 0 || cfg.vis.indexOf('spin') >= 0;

    // Valence shells
    valenceShells.forEach(function(s){ s.visible = cfg.vis.indexOf('shells') >= 0; });

    // Energy bands: also visible in atom scale (merged view)
    bandPlanes.forEach(function(p){ p.visible = cfg.vis.indexOf('bands') >= 0 || cfg.vis.indexOf('shells') >= 0; });
    bandElectrons.forEach(function(e){
      var showBands = cfg.vis.indexOf('bands') >= 0 || cfg.vis.indexOf('shells') >= 0;
      if (e.userData.type === 'conductionElectron') showBands = showBands && e.userData.active;
      e.visible = showBands;
    });

    // Cluster
    clusterAtoms.forEach(function(a){ a.visible = cfg.vis.indexOf('cluster') >= 0; });
    clusterBonds.forEach(function(b){ b.visible = cfg.vis.indexOf('cluster') >= 0; });
    clusterElectrons.forEach(function(e){ e.visible = cfg.vis.indexOf('cluster') >= 0; });

    // Energy bands (concentric rings + electrons on nucleus)
    bandPlanes.forEach(function(p){ p.visible = cfg.vis.indexOf('bands') >= 0; });
    bandElectrons.forEach(function(e){
      // Only show in 'bands' mode; conduction electrons only if active
      var show = cfg.vis.indexOf('bands') >= 0;
      if (e.userData.type === 'conductionElectron') show = show && e.userData.active;
      e.visible = show;
    });

    // Spin levels (split rings + electrons + arrows)
    spinLevels.forEach(function(s){ s.visible = cfg.vis.indexOf('spin') >= 0; });
    spinElectrons.forEach(function(e){ e.visible = cfg.vis.indexOf('spin') >= 0; });
    spinArrows.forEach(function(a){ a.visible = cfg.vis.indexOf('spin') >= 0; });

    // UI update
    if (typeof window.updateDisplayInfo === 'function') {
      window.currentScale = mode;
      window.updateDisplayInfo();
    } else {
      var labelEl = document.getElementById('scale-label');
      var infoEl = document.getElementById('scale-info');
      if (labelEl) labelEl.textContent = cfg.label;
      if (infoEl) infoEl.textContent = cfg.info;
    }

    updateScaleBar(mode);

    // Re-position the laser pistol for this scale (size + target)
    positionPistolForScale(mode);
  };

  var targetCamZ = SCALE.macro.camZ;
  var targetFov = SCALE.macro.fov;
  var currentCamZ = SCALE.macro.camZ;
  var currentFov = SCALE.macro.fov;
  var targetLookAt = new THREE.Vector3(0, 0, 0);
  var currentLookAt = new THREE.Vector3(0, 0, 0);

  /* ─── WAVE MODE GLOBALS ─── */
  var viewMode = 'particle';   // 'particle' | 'wave'
  var emWaves = [];            // active wave packets
  var waveSpeed = 0.12;        // propagation speed = same as particle (scene units/frame)
  var WAVE_SEGMENTS = 24;      // fewer segments = compact packet
  var WAVE_PACKET_WIDTH = 0.6; // packet envelope: small bullet, not a snake
  /* ─── ANGLE-OF-INCIDENCE STATE (θᵢ, relative to gun→cube line) ─── */
  // UI slider sets θᵢ in degrees.  At θᵢ=0 the gun points at the cube centre.
  // At θᵢ>0 the gun's aim target is offset by dist·tan(θᵢ) in the plane
  // perpendicular to the gun→cube line (see getPistolAimTarget).
  // This is consistent with the classic Snell diagram where the angle is
  // measured from the surface normal — for a wave hitting a flat surface
  // straight on, the surface normal points back at the gun.
  var incidentAngleDeg = 0;
  function getIncidentAngleRad() { return incidentAngleDeg * Math.PI / 180; }
  // Direction from a point toward the current (tilted) aim target.
  // Used by firePhoton / fireEMWave so the wave's travel direction matches
  // the gun's barrel direction.
  function getAimDir(fromPoint) {
    var target = (typeof getPistolAimTarget === 'function')
      ? getPistolAimTarget()
      : new THREE.Vector3(0, 0, 0);
    var d = new THREE.Vector3().subVectors(target, fromPoint);
    if (d.length() < 0.01) d.set(-1, 0, 0);
    return d.normalize();
  }
  // Pre-compute refracted angle θₜ from Snell's law: n₁ sin θᵢ = n₂ sin θₜ
  // Returns {thetaR_deg, thetaT_deg, thetaT_internal_deg} or null if TIR
  function computeSnell(thetaIDeg, n1, n2) {
    var thetaI = thetaIDeg * Math.PI / 180;
    var sinT = (n1 / n2) * Math.sin(thetaI);
    if (sinT > 1.0) return { thetaR_deg: thetaIDeg, thetaT_deg: NaN, TIR: true };
    return { thetaR_deg: thetaIDeg, thetaT_deg: Math.asin(sinT) * 180 / Math.PI, TIR: false };
  }

  window.toggleViewMode = function(mode) {
    viewMode = mode;
  };

  /* ─── Material optical properties ───
     Built dynamically from per-material preset data (n0, Eg, workFn).
     n(E) models:  n ≈ n0  below Eg, slight increase above Eg, then fall-off.
     κ(E) models:  κ ≈ 0  below Eg,  κ ∝ (E − Eg)  above Eg.
     α(E) = 4πκ/λ  (absorption coefficient, scene units).
     R(E) = Fresnel normal-incidence reflectivity. */
  function buildMatOptics(matConfig) {
    var Eg = matConfig.bandgap || 1.12;
    var n0 = matConfig.n0 || 3.42;
    var dn = matConfig.dn || 0.08;  // n increase rate above Eg
    var dk = matConfig.dk || 0.15;  // absorption steepness
    var wf = matConfig.workFunction || 4.5;
    var color = matConfig.simColor || 0x8899aa;
    return {
      name: matConfig.name || 'Material',
      Eg: Eg, dk: dk,
      workFn: wf,
      color: color,
      n: function(E) {
        if (E < 0.08) return n0;
        if (E < Eg) return n0;
        if (E < Eg + 1.5) return n0 + (E - Eg) * dn;
        if (E < 5) return n0 + dn * 1.5 + (E - Eg - 1.5) * dn * 0.5;
        return 1.0 + 2.0 / E;
      },
      kappa: function(E) {
        if (E < 0.08) return 0.001;
        if (E < Eg) return 0.001;
        if (E < 5) return dk * (E - Eg);
        return 2.5;
      },
      alpha: function(E) {
        return this.kappa(E) * E * 2.5;
      },
      R: function(E) {
        var n1 = this.n(E);
        return Math.pow((1 - n1) / (1 + n1), 2);
      }
    };
  }
  var MAT_SI = buildMatOptics(MATERIAL_PRESETS.si);

  function updateScaleBar(mode) {
    var bars = document.querySelectorAll('.scale-step');
    var order = ['macro','lattice','cluster','atom','spin'];
    var idx = order.indexOf(mode);
    bars.forEach(function(bar, i){
      bar.classList.toggle('active', i === idx);
      bar.classList.toggle('passed', i < idx);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     PHOTON SYSTEM
     ═══════════════════════════════════════════════════════════════ */
  /* ─── PHOTON COLOR MAP: real electromagnetic spectrum ───
     E (eV)  →  wavelength (nm)  →  color
     IR <1.12    : deep red → orange (heat)
     Visible 1.6-3.1 : red → violet rainbow
     UV 3.1-4.5  : violet → deep purple
     UV/soft-X >4.5: white/silver
  */
  function photonColorFromEnergy(E) {
    if (E < 0.08)       return 0x330000; // sub-phonon: almost invisible dark red
    if (E < 0.5)        return 0xFF0000; // IR: pure red
    if (E < 1.12)       return 0xFF4400; // near-IR: orange-red
    if (E < 1.6)        return 0xFF0000; // red visible
    if (E < 2.0)        return 0xFF8800; // orange
    if (E < 2.2)        return 0xFFDD00; // yellow
    if (E < 2.5)        return 0x00FF44; // green
    if (E < 2.8)        return 0x00FFFF; // cyan
    if (E < 3.1)        return 0x0088FF; // blue
    if (E < 4.5)        return 0x8800FF; // violet
    if (E < 10.0)       return 0xDDDDFF; // deep UV: silver-white
    return 0xFFFFFF;                        // X-ray: bright white
  }

  window.firePhoton = function(energyEV, angleDeg) {
    energyEV = parseFloat(energyEV);
    if (!scene) return;
    // Sync θᵢ from caller (UI slider drives it, but allow direct override)
    if (typeof angleDeg === 'number' && !isNaN(angleDeg)) {
      incidentAngleDeg = Math.max(0, Math.min(89, angleDeg));
    }

    if (viewMode === 'wave') {
      fireEMWave(energyEV);
      return;
    }

    var color = photonColorFromEnergy(energyEV);

    var geo = new THREE.SphereGeometry(0.06, 16, 16);
    var mat = new THREE.MeshBasicMaterial({ color: color });
    var photon = new THREE.Mesh(geo, mat);

    // ── LASER PISTOL: fire from barrel tip, tilted by θᵢ toward material center ──
    var start, end = new THREE.Vector3(0, 0, 0);
    // For atom/spin: aim directly at the focused atom
    if (['atom','spin'].indexOf(curScale) >= 0 && focusGroup) {
      end.copy(focusGroup.position);
    }
    // For cluster: aim at cluster center
    else if (curScale === 'cluster') {
      end.set(0, 0, 0);
    }

    // If pistol exists, use its tip; otherwise default to right side
    if (laserPistol && laserPistol.visible !== false) {
      // Pistol is oriented along +X, tip at local X≈0.28
      var tip = new THREE.Vector3(0.30, 0, 0);
      tip.applyMatrix4(laserPistol.matrixWorld);
      start = tip.clone();
      // Orient the gun so its +X points at the (tilted) aim target.
      // The wave's actual travel direction comes from getAimDir() below.
      aimPistolAtTarget();
      var aimDir = getAimDir(start);
      // Small recoil kick (along the actual aim direction)
      laserPistol.position.add(aimDir.clone().multiplyScalar(-0.06));
      setTimeout(function(){ laserPistol.position.add(aimDir.clone().multiplyScalar(0.06)); }, 150);
    } else {
      start = new THREE.Vector3(4.5, Math.random()*0.3, Math.random()*0.3);
    }

    photon.position.copy(start);
    flashImpactRing();
    photon.userData = {
      energy: energyEV,
      velocity: getAimDir(start, end).multiplyScalar(0.12),
      life: 180,
      color: color,
      state: 'flying',
      startPos: start.clone()
    };

    var light = new THREE.PointLight(color, 1.2, 4);
    photon.add(light);

    scene.add(photon);
    photons.push(photon);

    var msg = document.getElementById('photon-msg');
    if (msg) {
      var angTxt = incidentAngleDeg === 0 ? ', θᵢ = 0° (normal)' : ', θᵢ = ' + incidentAngleDeg + '°';
      msg.textContent = 'Photon fired: E = ' + energyEV.toFixed(2) + ' eV' + angTxt;
      msg.style.opacity = '1';
      setTimeout(function(){ msg.style.opacity = '0.7'; }, 2000);
    }
    // Refresh Snell readout after fire (uses n(E) for current E)
    if (typeof updateSnellReadout === 'function') updateSnellReadout(energyEV);
  };

  function updatePhotons() {
    for (var i = photons.length - 1; i >= 0; i--) {
      var p = photons[i];
      p.position.add(p.userData.velocity);
      p.userData.life--;

      if (p.userData.state === 'flying') {
        // Scale-aware collision — check multiple targets in order
        var hit = false;
        var hitObj = null;
        var hitType = '';

        // ── LATTICE: photon can hit nucleus OR electrons ──
        if (curScale === 'lattice') {
          // Check electrons first (orbitals — larger cross-section)
          for (var e = 0; e < latticeElectrons.length; e++) {
            var le = latticeElectrons[e];
            if (!le.visible) continue;
            if (p.position.distanceTo(le.position) < 0.12) {
              hit = true; hitObj = le; hitType = 'electron';
              break;
            }
          }
          // Then check atoms (nucleus — smaller, denser)
          if (!hit) {
            for (var a = 0; a < atoms.length; a++) {
              if (!atoms[a].visible) continue;
              if (p.position.distanceTo(atoms[a].position) < 0.18) {
                hit = true; hitObj = atoms[a]; hitType = 'nucleus';
                break;
              }
            }
          }
        }
        // ── CLUSTER: photon can hit hanging electrons OR atoms ──
        else if (curScale === 'cluster') {
          for (var e = 0; e < clusterElectrons.length; e++) {
            var ce = clusterElectrons[e];
            if (!ce.visible) continue;
            if (p.position.distanceTo(ce.position) < 0.10) {
              hit = true; hitObj = ce; hitType = 'electron';
              break;
            }
          }
          if (!hit) {
            for (var a = 0; a < clusterAtoms.length; a++) {
              if (!clusterAtoms[a].visible) continue;
              if (p.position.distanceTo(clusterAtoms[a].position) < 0.22) {
                hit = true; hitObj = clusterAtoms[a]; hitType = 'nucleus';
                break;
              }
            }
          }
        }
        // ── BANDS / ATOM / SPIN: photon hits electrons OR nucleus ──
        else if (['bands','atom','spin'].indexOf(curScale) >= 0) {
          // Check band electrons first (delocalized, larger cross-section)
          if (!hit && bandElectrons.length > 0) {
            for (var e = 0; e < bandElectrons.length; e++) {
              var be = bandElectrons[e];
              if (!be.visible) continue;
              if (p.position.distanceTo(
                new THREE.Vector3(be.position.x + focusGroup.position.x,
                                  be.position.y + focusGroup.position.y,
                                  be.position.z + focusGroup.position.z)) < 0.10) {
                hit = true; hitObj = be; hitType = 'electron';
                break;
              }
            }
          }
          // Check spin electrons
          if (!hit && spinElectrons.length > 0) {
            for (var e = 0; e < spinElectrons.length; e++) {
              var se = spinElectrons[e];
              if (!se.visible) continue;
              if (p.position.distanceTo(
                new THREE.Vector3(se.position.x + focusGroup.position.x,
                                  se.position.y + focusGroup.position.y,
                                  se.position.z + focusGroup.position.z)) < 0.10) {
                hit = true; hitObj = se; hitType = 'electron';
                break;
              }
            }
          }
          // Nucleus (small, dense)
          if (!hit && nucleus && nucleus.visible) {
            if (p.position.distanceTo(focusGroup.position) < 0.12) {
              hit = true; hitObj = nucleus; hitType = 'nucleus';
            }
          }
          // Fallback to center region
          if (!hit) {
            if (p.position.distanceTo(new THREE.Vector3(0,0,0)) < 0.5) {
              hit = true; hitObj = nucleus || focusGroup; hitType = 'atom';
            }
          }
        }
        // ── MACRO: bulk material ──
        else if (curScale === 'macro') {
          if (p.position.distanceTo(new THREE.Vector3(0,0,0)) < 2.2) {
            hit = true; hitObj = macroCube; hitType = 'bulk';
          }
        }

        if (hit && hitObj) {
          handlePhotonInteraction(p, hitObj, i, hitType);
          continue;
        }
      }

      if (p.userData.life <= 0 && p.userData.state === 'flying') {
        scene.remove(p);
        photons.splice(i, 1);
      }
    }
  }



  /* ═══════════════════════════════════════════════════════════════
     ELECTROMAGNETIC WAVE SYSTEM
     Render photon as transverse E + B oscillating wave packet.
     Physics from Maxwell: E(x,t) = E₀ sin(kx-ωt), B perp to E & k.
     ═══════════════════════════════════════════════════════════════ */

  /* ─── WAVE PACKET BUILDER ─── */
  function buildEMWave(startPos, direction, energy, color) {
    direction.normalize();
    // Perpendicular basis vectors for E-field and B-field
    var perp1 = new THREE.Vector3(0, 1, 0);
    if (Math.abs(direction.y) > 0.9) perp1.set(1, 0, 0);
    perp1 = perp1.clone().sub(direction.clone().multiplyScalar(perp1.dot(direction))).normalize();
    var perp2 = new THREE.Vector3().crossVectors(direction, perp1).normalize();

    var segments = WAVE_SEGMENTS;
    var positions = new Float32Array(segments * 3);
    var group = new THREE.Group();

    // E-field oscillation (vertical — perp1)
    var eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    var eMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
    var eLine = new THREE.Line(eGeo, eMat);

    // B-field oscillation (horizontal — perp2, phase-shifted π/2)
    var bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    var bColor = new THREE.Color(color).lerp(new THREE.Color(0xff4ecd), 0.4).getHex();
    var bMat = new THREE.LineBasicMaterial({ color: bColor, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    var bLine = new THREE.Line(bGeo, bMat);

    // Propagation axis (faint white)
    var axisGeo = new THREE.BufferGeometry();
    var axisPositions = new Float32Array([0,0,0, WAVE_PACKET_WIDTH,0,0]);
    axisGeo.setAttribute('position', new THREE.BufferAttribute(axisPositions, 3));
    var axisMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending });
    var axisLine = new THREE.Line(axisGeo, axisMat);

    // Compact trail dots (small bullet-like wave packet, not a glowing snake)
    var trailCount = 4;
    var trail = [];
    var dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
    for (var t = 0; t < trailCount; t++) {
      var dotMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending });
      var dot = new THREE.Mesh(dotGeo, dotMat);
      group.add(dot);
      trail.push(dot);
    }

    // Bright oscillating head sphere (compact, matches photon scale)
    var headGeo = new THREE.SphereGeometry(0.08, 12, 12);
    var headMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });
    var head = new THREE.Mesh(headGeo, headMat);
    group.add(head);

    // Central glow light — same scale as particle photon
    var glow = new THREE.PointLight(color, 1.2, 4);
    group.add(glow);

    group.add(eLine); group.add(bLine); group.add(axisLine);
    group.position.copy(startPos);
    // Orient group so local X aligns with direction
    var alignQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0), direction);
    group.setRotationFromQuaternion(alignQuat);
    scene.add(group);

    var wave = {
      mesh: group,
      eLine: eLine,
      bLine: bLine,
      axisLine: axisLine,
      trail: trail,
      glow: glow,
      head: head,
      direction: direction.clone(),
      perp1: perp1.clone(),
      perp2: perp2.clone(),
      energy: energy,
      color: color,
      phase: 0,
      state: 'flying',
      amplitude: 0.06,
      wavelength: wavelengthFromEnergy(energy),
      frequency: frequencyFromEnergy(energy),
      speed: waveSpeed,
      insideMaterial: false,
      pathLength: 0,
      life: 180,
      maxLife: 180
    };

    emWaves.push(wave);
    return wave;
  }

  /* ─── FIRE EM WAVE ─── */
  function fireEMWave(energyEV) {
    var color = photonColorFromEnergy(energyEV);
    var end = new THREE.Vector3(0, 0, 0);
    if (['atom','spin'].indexOf(curScale) >= 0 && focusGroup) { end.copy(focusGroup.position); }
    else if (curScale === 'cluster') { end.set(0, 0, 0); }

    // Perpendicular EM wave from laser pistol toward material center, tilted by θᵢ
    var start;
    if (laserPistol) {
      var tip = new THREE.Vector3(0.30, 0, 0);
      tip.applyMatrix4(laserPistol.matrixWorld);
      start = tip.clone();
      // Orient the gun so its +X points at the (tilted) aim target.
      aimPistolAtTarget();
      var aimDir = getAimDir(start);
      // Recoil
      laserPistol.position.add(aimDir.clone().multiplyScalar(-0.06));
      setTimeout(function(){ laserPistol.position.add(aimDir.clone().multiplyScalar(0.06)); }, 150);
    } else {
      start = new THREE.Vector3(4.5, Math.random()*0.3, Math.random()*0.3);
    }
    var dir = getAimDir(start, end);
    buildEMWave(start, dir, energyEV, color);
    flashImpactRing();

    var msg = document.getElementById('photon-msg');
    if (msg) {
      var λ = wavelengthFromEnergy(energyEV);
      var angTxt = incidentAngleDeg === 0 ? ' · θᵢ = 0° (normal)' : ' · θᵢ = ' + incidentAngleDeg + '°';
      msg.innerHTML = 'EM wave fired: E = ' + energyEV.toFixed(2) + ' eV, λ = ' + λ.toFixed(0) + ' nm' + angTxt;
      msg.style.opacity = '1';
      setTimeout(function(){ msg.style.opacity = '0.7'; }, 3000);
    }
    updateMaterialPanel(energyEV);
    // Refresh Snell readout after fire (uses n(E) for current E)
    if (typeof updateSnellReadout === 'function') updateSnellReadout(energyEV);
  }

  /* ─── LIVE AIM: re-orient the laser pistol to current θᵢ (called by slider) ─── */
  // The single source of truth for "where is the gun pointing" is
  // positionPistolForScale() → aimPistolAtTarget().  We just update the angle
  // and re-run that.  This keeps the gun barrel, the aim line, and the
  // wave's travel direction all consistent.
  window.aimLaserPistol = function(angleDeg) {
    if (typeof angleDeg === 'number' && !isNaN(angleDeg)) {
      incidentAngleDeg = Math.max(0, Math.min(89, angleDeg));
    }
    if (typeof curScale === 'string' && typeof positionPistolForScale === 'function') {
      positionPistolForScale(curScale);
    } else if (typeof aimPistolAtTarget === 'function') {
      aimPistolAtTarget();
    }
  };

  /* ─── SNELL READOUT: θᵣ = θᵢ (reflection), θₜ from Snell's law ─── */
  // Snell's law: n₁ sin θᵢ = n₂ sin θₜ  →  θₜ = asin( (n₁/n₂) sin θᵢ )
  // n₁ = 1.0 (air/vacuum on +X side of material)
  // n₂ = currentMaterial.n(E)  (dispersion-aware: same function used in spawnRefractedWave)
  // Total internal reflection when (n₁/n₂) sin θᵢ > 1 (can occur for n₂ < n₁ only; here n₂>1 always so no TIR,
  //  but we still check the formula in case future materials have n<1).
  window.updateSnellReadout = function(energyOverrideEV) {
    var readout = document.getElementById('snell-readout');
    if (!readout) return;
    var eEV = (typeof energyOverrideEV === 'number')
      ? energyOverrideEV
      : Number.parseFloat((document.getElementById('photon-slider') || {}).value) || 1.5;
    var n1 = 1.0;                                              // air (n_air ≈ 1)
    var n2 = (typeof MAT_SI !== 'undefined' && MAT_SI && MAT_SI.n)
      ? MAT_SI.n(eEV)                                          // dispersion-aware: same n(E) used by spawnRefractedWave
      : 3.42;                                                 // Si default (visible)
    var s = computeSnell(incidentAngleDeg, n1, n2);
    if (s.TIR) {
      readout.innerHTML = 'θᵢ = ' + incidentAngleDeg + '°  →  θᵣ = ' + s.thetaR_deg.toFixed(1)
        + '°  ·  θₜ = TIR (sin θᵢ · n₁/n₂ = ' + ((n1/n2) * Math.sin(incidentAngleDeg*Math.PI/180)).toFixed(2) + ' > 1)';
      readout.style.color = '#ff8888';
    } else {
      readout.innerHTML = 'θᵢ = ' + incidentAngleDeg + '°  →  θᵣ = ' + s.thetaR_deg.toFixed(1)
        + '°  ·  θₜ = ' + s.thetaT_deg.toFixed(1) + '°   (n₁=1.00, n₂=' + n2.toFixed(2) + ' @ ' + eEV.toFixed(2) + ' eV)';
      readout.style.color = 'var(--accent-cyan)';
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     WAVE ↔ MATTER INTERACTION (Maxwell optical physics)
     ═══════════════════════════════════════════════════════════════ */
  function updateEMWaves() {
    for (var i = emWaves.length - 1; i >= 0; i--) {
      var w = emWaves[i];
      w.life--;
      w.phase += w.frequency;
      // Wrap phase to [0, 2π) every frame — prevents floating-point drift
      // after hundreds of frames of accumulation.  Cheap, numerically safe.
      if (w.phase > 6.2831853) w.phase -= 6.2831853 * Math.floor(w.phase / 6.2831853);
      var speed = w.speed || waveSpeed;
      w.pathLength += speed;

      // Move wave center
      w.mesh.position.add(w.direction.clone().multiplyScalar(speed));

      // Fade near end of life
      var lifeFrac = w.life / w.maxLife;
      var fade = lifeFrac < 0.2 ? lifeFrac / 0.2 : 1.0;
      if (w.eLine && w.eLine.material) w.eLine.material.opacity = 0.85 * fade;
      if (w.bLine && w.bLine.material) w.bLine.material.opacity = 0.6 * fade;

      // Animate sine oscillations
      animateWaveOscillation(w);

      // Collision detection — what's in front?
      if (w.state === 'flying') {
        handleWaveCollision(w, i);
      }

      if (w.life <= 0) {
        scene.remove(w.mesh);
        emWaves.splice(i, 1);
        continue;
      }

      // Fade trail + glow with life
      var lifeFrac = w.life / w.maxLife;
      var fade = lifeFrac < 0.2 ? lifeFrac / 0.2 : 1.0;
      if (w.eLine && w.eLine.material) w.eLine.material.opacity = 0.85 * fade;
      if (w.bLine && w.bLine.material) w.bLine.material.opacity = 0.6 * fade;
      if (w.trail) {
        w.trail.forEach(function(dot){ if(dot.material) dot.material.opacity *= fade; });
      }
      if (w.head && w.head.material) {
        w.head.material.opacity = 0.85 * fade;
      }
      if (w.glow) {
        w.glow.intensity = 3.0 * fade;
      }
    }
  }

  function animateWaveOscillation(w) {
    if (!w.eLine || !w.bLine) return;
    var ePos = w.eLine.geometry.attributes.position.array;
    var bPos = w.bLine.geometry.attributes.position.array;
    var seg = WAVE_SEGMENTS;
    var amp = w.amplitude;
    // FIXED compact packet envelope — bullet-like, same size regardless of λ
    var packetEnv = WAVE_PACKET_WIDTH;     // 0.6 scene units
    w.packetEnv = packetEnv;
    // k is still physical: more oscillations fit in the packet for short-λ (high-E)
    var λVis = w.wavelength / 200;         // scale λ to scene units
    var k = 2 * Math.PI / λVis;

    // Update axis line to match packet length
    if (w.axisLine && w.axisLine.geometry) {
      var ap = w.axisLine.geometry.attributes.position.array;
      ap[3] = packetEnv;
      w.axisLine.geometry.attributes.position.needsUpdate = true;
    }

    for (var s = 0; s < seg; s++) {
      var x = (s / (seg - 1)) * packetEnv;
      var envelope = Math.exp(-Math.pow((x - packetEnv*0.5) / (packetEnv*0.25), 2));
      var phase = k * x - w.phase;
      // E field oscillates in perp1 direction (local Y)
      ePos[s*3 + 0] = x;
      ePos[s*3 + 1] = Math.sin(phase) * amp * envelope;
      ePos[s*3 + 2] = 0;
      // B field oscillates in perp2 direction (local Z), phase-shifted π/2
      bPos[s*3 + 0] = x;
      bPos[s*3 + 1] = 0;
      bPos[s*3 + 2] = Math.sin(phase + Math.PI/2) * amp * envelope * 0.6;
    }
    w.eLine.geometry.attributes.position.needsUpdate = true;
    w.bLine.geometry.attributes.position.needsUpdate = true;

    // Compact trail dots inside the small packet
    if (w.trail) {
      var tCount = w.trail.length;
      for (var t = 0; t < tCount; t++) {
        var tx = (t / (tCount - 1)) * packetEnv;
        var tEnvelope = Math.exp(-Math.pow((tx - packetEnv*0.5) / (packetEnv*0.25), 2));
        var tPhase = k * tx - w.phase;
        var dot = w.trail[t];
        dot.position.set(tx,
          Math.sin(tPhase) * amp * tEnvelope,
          Math.sin(tPhase + Math.PI/2) * amp * tEnvelope * 0.6);
      }
    }
    // Move glow light to center of packet
    if (w.glow) {
      w.glow.position.set(packetEnv * 0.5, 0, 0);
    }
    // ── TRAVELING-WAVE HEAD ──
    if (w.head) {
      var bestX     = packetEnv * 0.5;
      var bestBright = -1;
      var stepX = Math.max(λVis * 0.5, 0.01);
      for (var xc = 0; xc <= packetEnv; xc += stepX) {
        var envC = Math.exp(-Math.pow((xc - packetEnv*0.5) / (packetEnv*0.25), 2));
        var sinC = Math.sin(k * xc - w.phase);
        if (sinC <= 0) continue;
        var bright = sinC * envC;
        if (bright > bestBright) { bestBright = bright; bestX = xc; }
      }
      var headSinE = Math.sin(k * bestX - w.phase);
      var headSinB = Math.sin(k * bestX - w.phase + Math.PI/2);
      var headEnv  = Math.exp(-Math.pow((bestX - packetEnv*0.5) / (packetEnv*0.25), 2));
      w.head.position.set(
        bestX,
        headSinE * amp * headEnv,
        headSinB * amp * headEnv * 0.6
      );
      var crest = 0.6 + 1.4 * headSinE * headEnv;
      w.head.scale.setScalar(crest);
    }
  }

  /* ─── WAVE COLLISION: what does the wave hit (if anything)? ─── */
  function handleWaveCollision(w, idx) {
    var pos = w.mesh.position.clone();
    var E = w.energy;

    // Scale-specific collision targets
    var hit = null;
    var hitType = '';

    if (curScale === 'macro') {
      // Trigger handoff when the wave's LEADING EDGE first touches the
      // cube's front face.  Cube half-width = 2.0; the wave's leading
      // edge is `packetEnv/2` ahead of the center.  We read packetEnv
      // from the wave object so the threshold scales with wavelength.
      // Fallback to 1.5 if the wave hasn't computed it yet.
      var halfPacket = (w.packetEnv || 1.5) * 0.5;
      if (pos.distanceTo(new THREE.Vector3(0,0,0)) < 2.0 + halfPacket) {
        hit = macroCube; hitType = 'bulk';
      }
    }
    else if (curScale === 'lattice') {
      for (var a = 0; a < atoms.length; a++) {
        if (!atoms[a].visible) continue;
        if (pos.distanceTo(atoms[a].position) < 0.15) { hit = atoms[a]; hitType = 'nucleus'; break; }
      }
      if (!hit) {
        for (var e = 0; e < latticeElectrons.length; e++) {
          var le = latticeElectrons[e];
          if (!le.visible) continue;
          if (pos.distanceTo(le.position) < 0.10) { hit = le; hitType = 'electron'; break; }
        }
      }
    }
    else if (curScale === 'cluster') {
      for (var a = 0; a < clusterAtoms.length; a++) {
        if (!clusterAtoms[a].visible) continue;
        if (pos.distanceTo(clusterAtoms[a].position) < 0.18) { hit = clusterAtoms[a]; hitType = 'nucleus'; break; }
      }
      if (!hit) {
        for (var e = 0; e < clusterElectrons.length; e++) {
          var ce = clusterElectrons[e];
          if (!ce.visible) continue;
          if (pos.distanceTo(ce.position) < 0.08) { hit = ce; hitType = 'electron'; break; }
        }
      }
    }
    else if (['atom','spin'].indexOf(curScale) >= 0) {
      if (focusGroup && pos.distanceTo(focusGroup.position) < 0.25) {
        // Wave has entered the "atom zone" — check what exactly
        var fp = focusGroup.position;
        // Check electrons first
        for (var e = 0; e < bandElectrons.length; e++) {
          var be = bandElectrons[e];
          if (!be.visible) continue;
          var wPos = new THREE.Vector3(be.position.x + fp.x, be.position.y + fp.y, be.position.z + fp.z);
          if (pos.distanceTo(wPos) < 0.10) { hit = be; hitType = 'electron'; break; }
        }
        if (!hit && nucleus && pos.distanceTo(fp) < 0.12) {
          hit = nucleus; hitType = 'nucleus';
        }
        if (!hit) { hit = focusGroup; hitType = 'atom'; }
      }
    }

    if (!hit) return; // nothing hit yet, keep flying

    // Already processed this hit? (simple debounce: if w.insideMaterial already reflects processed)
    if (w.state !== 'flying') return;

    // ── Material optical response based on E and hitType (Maxwell physics) ──
    var nMat = MAT_SI.n(E);
    var kMat = MAT_SI.kappa(E);
    var R = MAT_SI.R(E);
    var α = MAT_SI.alpha(E);

    var msg = document.getElementById('interaction-msg');

    // Decide interaction type (same physics rules as particles, now with wave visuals)
    if (curScale === 'macro') {
      // BULK OPTICS: reflection + refraction + absorption
      if (E < BANDGAP_SI) {
        // Transparent Si: transmit + refract (n ≈ 3.4)
        w.state = 'refracted';
        spawnRefractedWave(w, nMat);
        if (msg) msg.innerHTML = 'Wave: <span style="color:#00f0ff">refraction</span> (E &lt; E<sub>g</sub>, Si transparent, n ≈ ' + nMat.toFixed(1) + ')';
      } else {
        // Absorbing: Fresnel reflection + attenuated transmission
        if (Math.random() < R) {
          w.state = 'reflected';
          spawnReflectedWave(w);
          if (msg) msg.innerHTML = 'Wave: <span style="color:#ffaa00">Fresnel reflection</span> (R ≈ ' + (R*100).toFixed(0) + '%) + attenuated penetration';
        } else {
          w.state = 'absorbed';
          w.amplitude *= 0.15; // heavy attenuation
          w.life = Math.min(w.life, 40);
          if (macroCube && macroCube.material) {
            macroCube.material.transparent = true;
            macroCube.material.opacity = Math.max(0.2, macroCube.material.opacity * 0.3);
            macroCube.material.emissive.setHex(0xff8800);
            macroCube.material.emissiveIntensity = Math.min(E * 0.1, 0.5);
            setTimeout(function(){ if(macroCube && macroCube.material){ macroCube.material.opacity = 1; macroCube.material.transparent = false; macroCube.material.emissiveIntensity = 0; } }, 600);
          }
          if (msg) msg.innerHTML = 'Wave: <span style="color:#ff4ecd">absorption</span> (α ≈ ' + α.toFixed(1) + ' /cm, κ ≈ ' + kMat.toFixed(2) + ')';
        }
      }
    }
    else if (curScale === 'lattice' || curScale === 'cluster') {
      // Discrete atoms: scatter or absorb
      if (E < PHONON_EV) {
        // Thomson scatter: elastic, wave bends
        w.state = 'scattered';
        w.direction.add(new THREE.Vector3((Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3)).normalize();
        w.amplitude *= 0.85;
        if (msg) msg.textContent = 'Wave: Thomson scattering (E < phonon, elastic deflection)';
      } else if (E < BANDGAP_SI) {
        // Phonon absorption: vibrate target
        w.state = 'absorbed';
        w.amplitude *= 0.1;
        w.life = 30;
        vibrateTarget(hit, E);
        if (msg) msg.textContent = 'Wave: absorbed → phonon (atom vibrates, E < E_g)';
      } else {
        // Strong absorption → ionize
        w.state = 'absorbed';
        w.amplitude *= 0.05;
        w.life = 20;
        ionizeTarget(hit, E);
        if (msg) msg.innerHTML = 'Wave: <span style="color:#ff4ecd">photoionization</span> (E ≥ E_g, electron ejected)';
      }
    }
    else if (['atom','spin'].indexOf(curScale) >= 0) {
      // Single atom (discrete levels):
      if (E < BANDGAP_SI) {
        // No allowed transition → elastic scatter / reflection
        w.state = 'reflected';
        spawnReflectedWave(w);
        if (msg) msg.innerHTML = 'Wave: <span style="color:#ffaa00">elastic scattering</span> (E &lt; E<sub>g</sub>, no transition)';
      } else if (E < WORKFN_SI) {
        // Excitation → fluorescence (absorb + delayed re-emit = same as particle)
        // Kasha / Stokes: E_emit < E_abs.  Use E_gap + E_phonon shift.
        var Ephonon2 = 0.05;
        var Eemit2 = Math.max(E - BANDGAP_SI - Ephonon2, 0.1);
        w.state = 'absorbed';
        w.amplitude *= 0.1;
        w.life = 25;
        // Re-emitted photon carries the SHIFTED color, not the incident one.
        var reColor = photonColorFromEnergy(Eemit2);
        exciteAndEmit(hit, E, reColor);
        if (msg) msg.innerHTML = 'Wave: <span style="color:#00f0ff">excitation</span> → fluorescence: ' +
          E.toFixed(2) + ' eV in → <strong>' + Eemit2.toFixed(2) + ' eV out</strong> (Stokes, ΔE → phonons)';
      } else {
        // Ionization
        w.state = 'absorbed';
        w.amplitude *= 0.03;
        w.life = 15;
        ionizeTarget(hit, E);
        if (msg) msg.innerHTML = 'Wave: <span style="color:#ff4ecd">photoionization</span> (E > W_f)';
      }
    }
  }

  /* ─── SPAWN REFLECTED WAVE (angle θᵣ = θᵢ, specular about surface normal) ─── */
  function spawnReflectedWave(parent) {
    // Kill the incident ghost — reflected wave takes the remaining energy
    parent.life = Math.min(parent.life, 5);
    parent.maxLife = parent.life;
    parent.amplitude *= 0.05;

    // Surface normal: from cube center toward incoming wave (opposite to propagation)
    var normal = parent.direction.clone().normalize().negate();
    var d = parent.direction.clone().normalize();
    // specular reflection: r = d − 2(d·n)n
    var dot = d.dot(normal);
    var refDir = d.clone().sub(normal.clone().multiplyScalar(2 * dot)).normalize();

    var refPos = parent.mesh.position.clone().add(refDir.clone().multiplyScalar(0.3));
    var w = buildEMWave(refPos, refDir, parent.energy * 0.95, parent.color);
    w.amplitude = parent.amplitude * 14; // restore from *0.05 above ≈ 0.7x original
    w.life = 180;
    w.maxLife = 180;
    w.frequency = parent.frequency; // reflection doesn't change frequency
  }

  /* ─── SPAWN REFRACTED WAVE (Snell's law, wavelength compresses, speed drops) ─── */
  function spawnRefractedWave(parent, nMat) {
    // Kill the incident ghost — transmitted wave takes the remaining energy
    parent.life = Math.min(parent.life, 5);
    parent.maxLife = parent.life;
    parent.amplitude *= 0.05;

    var n1 = 1.0;  // air
    var ratio = n1 / nMat;

    // Surface normal (from cube center toward incoming wave)
    var normal = parent.direction.clone().normalize().negate();
    var d = parent.direction.clone().normalize();
    var cosI = -d.dot(normal);   // cos θᵢ (positive since d points inward, n points outward)
    if (cosI < 0) cosI = -cosI; // clamp safety

    // Snell's law: n₁ sin θᵢ = n₂ sin θₜ
    var sinT2 = ratio * ratio * (1 - cosI * cosI);
    if (sinT2 >= 1) {
      // TIR — fall back to straight-through (shouldn't happen for Si, but safety)
      var slowDir = d.clone();
    } else {
      var cosT = Math.sqrt(1 - sinT2);
      // refracted direction: t = (n₁/n₂)d + ((n₁/n₂)cos θᵢ − cos θₜ)(−n)
      // Standard vector form: t = r·d − (r·cos θᵢ + cos θₜ)·n
      var t = d.clone().multiplyScalar(ratio);
      t.add(normal.clone().multiplyScalar(ratio * cosI - cosT));
      var slowDir = t.normalize();
    }

    var slowPos = parent.mesh.position.clone().add(slowDir.clone().multiplyScalar(0.2));
    var w = buildEMWave(slowPos, slowDir, parent.energy, parent.color);
    // In material: wavelength compressed, amplitude slightly reduced, speed = c/n
    w.wavelength = parent.wavelength * ratio;
    w.frequency = parent.frequency;             // frequency conserved at boundary
    w.speed = (parent.speed || waveSpeed) * ratio;
    w.amplitude = parent.amplitude * 17;         // restore from *0.05 above ≈ 0.85x original
    w.life = 180;
    w.maxLife = 180;
    w.state = 'flying';
    w.insideMaterial = true;

    // Color shift toward material color (greenish for Si)
    var newColor = new THREE.Color(parent.color).lerp(new THREE.Color(0x55aa55), 0.3).getHex();
    if (w.eLine && w.eLine.material) w.eLine.material.color.setHex(newColor);
  }

  /* ═══════════════════════════════════════════════════════════════
     PHOTON-ATOM INTERACTION  (absorption / reflection / transmission)
     Decision tree based on photon energy E_γ vs atomic transitions:
       E_γ < E_phonon   → transmission (no match)
       E_phonon ≤ E_γ < E_gap    → ABSORPTION + VIBRATION (phonon)
       E_gap ≤ E_γ < E_work    → ABSORPTION + EMISSION (electron excited, then relax)
       E_γ ≥ E_work           → ABSORPTION + IONIZATION (electron ejected)
     Also handles REFLECTION when E_γ doesn't match any allowed transition.
     ═══════════════════════════════════════════════════════════════ */
  function handlePhotonInteraction(photon, target, idx, hitType) {
    var E = photon.userData.energy;
    var color = photon.userData.color;
    var msg = document.getElementById('interaction-msg');

    hitType = hitType || 'atom';

    // ── Interaction decision tree (0.1–10+ eV) ──
    var interaction = 'transmission';

    // BULK / LATTICE / CLUSTER: continuous or semi-continuous
    if (['macro','lattice','cluster'].indexOf(curScale) >= 0) {
      if (E < PHONON_EV) {
        interaction = 'transmission';           // sub-phonon: passes through
      } else if (E < BANDGAP_SI) {
        interaction = 'absorb_vibrate';       // phonon absorption → heat
      } else if (E < WORKFN_SI) {
        interaction = 'absorb_emit';           // interband excitation → fluorescence
      } else {
        interaction = 'absorb_ionize';         // photoelectric / photoionization
      }
    }
    // SINGLE ATOM / BANDS / SPIN: discrete levels
    else {
      if (E < PHONON_EV) {
        interaction = 'transmission';         // too weak, misses atom
      } else if (E < BANDGAP_SI) {
        interaction = 'reflect';              // no allowed transition → elastic bounce
      } else if (E < WORKFN_SI) {
        interaction = 'absorb_emit';          // valence → conduction excitation
      } else if (E < 8.0) {
        interaction = 'absorb_ionize';        // valence electron ejected
      } else {
        interaction = 'absorb_ionize';        // deep shell (2p/2s) ionization
      }
    }

    // HIT-TYPE corrections:
    // Electron hit → always interact with that electron
    if (hitType === 'electron') {
      if (E < PHONON_EV) {
        interaction = 'compton';              // Thomson scattering off free e⁻
      } else if (E < WORKFN_SI) {
        interaction = 'absorb_vibrate';       // e⁻ absorbs → orbital wobble
      } else {
        interaction = 'absorb_ionize';        // photoelectric on this electron
      }
    }
    // Nucleus hit → elastic or thermal
    else if (hitType === 'nucleus') {
      if (E < 1.0) {
        interaction = 'reflect';              // Rutherford elastic scattering
      } else if (E < 10.0) {
        interaction = 'absorb_vibrate';       // nucleus-field absorbs → heat
      } else {
        interaction = 'compton';              // nuclear Compton (simplified)
      }
    }
    // Bulk hit
    else if (hitType === 'bulk') {
      if (E < BANDGAP_SI) interaction = 'transmission';
      else if (E < WORKFN_SI) interaction = 'absorb_vibrate';
      else interaction = 'absorb_vibrate';
    }

    // Execute interaction
    switch (interaction) {

    case 'transmission':
      // Photon passes through — for high E, show material transparency (X-ray penetration)
      if (msg) msg.textContent = scaleLabel() + ': E_γ = ' + E.toFixed(2) +
        ' eV — transmission (no matching transition).';
      if (E > 4.5) {
        if (hitType === 'bulk' && macroCube && macroCube.material) {
          macroCube.material.transparent = true;
          var origOp = macroCube.material.opacity;
          macroCube.material.opacity = Math.max(origOp * 0.35, 0.15);
          setTimeout(function(){ if(macroCube && macroCube.material){ macroCube.material.opacity = origOp; macroCube.material.transparent = false; } }, 400 + E*20);
        }
        else if (hitType === 'nucleus' && target && target.material) {
          target.material.transparent = true;
          var origOp2 = target.material.opacity || 1;
          target.material.opacity = Math.max(origOp2 * 0.3, 0.15);
          setTimeout(function(){ if(target && target.material){ target.material.opacity = origOp2; target.material.transparent = false; } }, 400 + E*20);
        }
      }
      // Let photon continue (don't remove)
      break;

    case 'reflect':
      // Photon bounces back — reverse velocity
      if (hitType === 'nucleus') {
        if (msg) msg.textContent = scaleLabel() + ': E_γ = ' + E.toFixed(2) +
          ' eV — elastic scattering off nucleus (Rutherford-like).';
      } else {
        if (msg) msg.textContent = scaleLabel() + ': E_γ = ' + E.toFixed(2) +
          ' eV < E_gap — reflected (no available transition).';
      }
      photon.userData.velocity.negate();
      photon.userData.velocity.multiplyScalar(0.6); // loses energy on reflection
      photon.userData.state = 'reflected';
      break;

    case 'compton':
      // Photon scatters off electron (elastic/inelastic scattering)
      scene.remove(photon);
      photons.splice(idx, 1);
      if (msg) msg.textContent = scaleLabel() + ': Compton scattering! ' +
        'Photon deflects off ' + hitType + ', loses some energy.';
      // Spawn a scattered photon at reduced energy (Compton shift)
      var scatteredE = E * 0.85; // simplified energy loss
      var scColor = photonColorFromEnergy(scatteredE);
      var scGeo = new THREE.SphereGeometry(0.045, 12, 12);
      var scMat = new THREE.MeshBasicMaterial({ color: scColor });
      var scPhoton = new THREE.Mesh(scGeo, scMat);
      var origin = (target.position) ? target.position.clone() : new THREE.Vector3(0,0,0);
      // Random deflection angle (Thomson/Compton scattering)
      var theta = Math.random() * Math.PI;     // 0 to 180°
      var phi = Math.random() * Math.PI * 2; // full azimuth
      var scDir = new THREE.Vector3(
        Math.sin(theta)*Math.cos(phi),
        Math.sin(theta)*Math.sin(phi),
        Math.cos(theta)
      );
      scPhoton.position.copy(origin);
      scPhoton.userData = {
        energy: scatteredE,
        velocity: scDir.multiplyScalar(0.10),
        life: 200,
        color: scColor,
        state: 'flying'
      };
      var scLight = new THREE.PointLight(scColor, 0.7, 3);
      scPhoton.add(scLight);
      scene.add(scPhoton);
      photons.push(scPhoton);
      break;

    case 'absorb_vibrate':
      // Photon absorbed → target vibrates (phonon creation)
      scene.remove(photon);
      photons.splice(idx, 1);
      if (msg) msg.textContent = scaleLabel() + ': E_γ absorbed → phonon! ' +
        'Atom vibrates (' + E.toFixed(2) + ' eV → heat).';
      vibrateTarget(target, E);
      break;

    case 'absorb_emit':
      // Photon absorbed → electron excited → re-emits photon after delay
      scene.remove(photon);
      photons.splice(idx, 1);
      if (msg) msg.textContent = scaleLabel() + ': Absorbed! e⁻ excited → will re-emit ' + E.toFixed(2) + ' eV photon';
      exciteAndEmit(target, E, color);
      break;

    case 'absorb_ionize':
      // Photon absorbed → electron ejected (photoelectric / photoionization)
      scene.remove(photon);
      photons.splice(idx, 1);
      if (msg) msg.textContent = scaleLabel() + ': Photoionization! e⁻ ejected by ' + E.toFixed(2) + ' eV photon';
      ionizeTarget(target, E);
      break;
    }
  }

  function scaleLabel() {
    var labels = { macro:'Macro', lattice:'Lattice', cluster:'Cluster',
                   bands:'Bands', atom:'Atom', spin:'Spin' };
    return labels[curScale] || 'System';
  }

  // ── ABSORB + VIBRATE: phonon absorption → thermal motion ──
  function vibrateTarget(target, E) {
    if (curScale === 'macro') {
      macroCube.material.emissive.setHex(0xff8800);
      macroCube.material.emissiveIntensity = Math.min(E * 0.15, 0.6);
      setTimeout(function(){ macroCube.material.emissiveIntensity = 0; }, 600 + E*80);
    }
    else if (curScale === 'lattice') {
      var boost = Math.min(E * 0.02, 0.06);
      thermalAmp = Math.min(thermalAmp + boost, 0.22);
      flashAtom(target, 0xff8800, 0.5 + E*0.1);
      // Kick nearby electrons
      if (target.userData && target.userData.idx !== undefined) {
        latticeElectrons.forEach(function(e){
          var ai = e.userData.atomIdx;
          if (ai === target.userData.idx || Math.abs(ai - target.userData.idx) < 4) {
            e.userData.speed = Math.min(e.userData.speed * 1.5, 3.0);
            setTimeout(function(){ e.userData.speed /= 1.5; }, 800 + E*60);
          }
        });
      }
    }
    else if (curScale === 'cluster') {
      var cBoost = Math.min(E * 0.02, 0.06);
      clusterSprings.forEach(function(s){ s.k = Math.min(0.12 + E*0.04, 0.35); });
      clusterAtoms.forEach(function(a){
        a.userData.vel.add(new THREE.Vector3(
          (Math.random()-0.5)*cBoost*2,
          (Math.random()-0.5)*cBoost*2,
          (Math.random()-0.5)*cBoost*2
        ));
      });
      setTimeout(function(){ clusterSprings.forEach(function(s){ s.k = 0.08; }); }, 500 + E*80);
      flashAtom(target, 0xff8800, 0.4);
    }
    else if (curScale === 'bands') {
      // All band electrons jitter
      bandElectrons.forEach(function(e){
        if (e.userData.type === 'bandElectron') {
          e.userData.speed *= 1.3;
          setTimeout(function(){ e.userData.speed /= 1.3; }, 700);
        }
      });
      flashAtom(target, 0xff8800, 0.5);
    }
    else if (curScale === 'atom') {
      coreCloud.scale.multiplyScalar(1.0 + E*0.08);
      coreCloud.material.opacity = Math.min(0.22 + E*0.06, 0.6);
      setTimeout(function(){
        coreCloud.scale.multiplyScalar(1/(1.0+E*0.08));
        coreCloud.material.opacity = 0.22;
      }, 600 + E*60);
      flashAtom(target, 0xff8800, 0.5);
    }
    else if (curScale === 'spin') {
      // Zeeman vibration: rings wobble
      spinLevels.forEach(function(s){
        s.rotation.x = Math.PI/2 + Math.sin(time*5)*0.1*E;
      });
      setTimeout(function(){
        spinLevels.forEach(function(s){ s.rotation.x = Math.PI/2; });
      }, 600);
      flashAtom(target, 0xff8800, 0.4);
    }
  }

  // ── ABSORB + EMIT: electron excited → relaxation photon re-emitted ──
  // Stokes shift:  E_emit = E_abs - E_gap - E_phonon
  // The absorbed e⁻ is marked as "excited" (brighter color, larger orbit),
  // then de-excites when the re-emission fires.  This makes it visually
  // obvious WHICH electron was promoted and WHEN it relaxes.
  function exciteAndEmit(target, E, color) {
    // Pick the band electron closest to the hit point as the "excited" one.
    // (For lattice/cluster we use a different electron, see below.)
    var excitedElectron = null;
    var excitedOrbitOld = null;
    var excitedSpeedOld = null;
    var excitedColorOld = null;

    function markExcited(electron) {
      if (!electron || !electron.material) return null;
      excitedElectron  = electron;
      excitedOrbitOld  = electron.userData.orbitR || electron.userData.r;
      excitedSpeedOld  = electron.userData.speed;
      excitedColorOld  = electron.material.color.getHex();
      // Boost visuals: bigger orbit, faster, bright white-cyan
      if (electron.userData.orbitR !== undefined) electron.userData.orbitR *= 1.45;
      if (electron.userData.r      !== undefined) electron.userData.r      *= 1.45;
      electron.userData.speed = (electron.userData.speed || 1.0) * 1.6;
      electron.material.color.setHex(0xffffff);   // hot white
      return electron;
    }

    // Visual excitation (per-scale)
    if (curScale === 'lattice') {
      flashAtom(target, 0x00f0ff, 0.8);
      var localEs = latticeElectrons.filter(function(e){
        return e.userData.atomIdx === target.userData.idx;
      });
      if (localEs.length > 0) {
        var le = localEs[Math.floor(Math.random()*localEs.length)];
        var oldR = le.userData.orbitR;
        le.userData.orbitR *= 1.8;
        le.material.color.setHex(0xffffff);
        setTimeout(function(){
          le.userData.orbitR = oldR;
          le.material.color.setHex(0x00f0ff);
        }, 1200);
      }
    }
    else if (curScale === 'cluster') {
      flashAtom(target, 0x00f0ff, 0.7);
      clusterElectrons.forEach(function(e){
        var h = e.userData.hang;
        h.amp = Math.min(h.amp * 2.0, 0.85);
        h.speed *= 1.8;
        setTimeout(function(){ h.amp /= 2.0; h.speed /= 1.8; }, 1200);
      });
    }
    else if (curScale === 'bands') {
      flashAtom(target, 0x00f0ff, 0.8);
      // Pick ONE band electron to be the excited one — the valence (3p) one
      // closest to the atom, then after delay promote it visibly into conduction.
      var valenceEs = bandElectrons.filter(function(e){ return e.userData.type === 'bandElectron'; });
      if (valenceEs.length > 0) {
        var pick = valenceEs[Math.floor(Math.random() * valenceEs.length)];
        // Show it briefly as excited on its own band, then it joins conduction.
        markExcited(pick);
      }
      // Reveal conduction band
      var ce = bandElectrons.filter(function(e){ return e.userData.type === 'conductionElectron'; });
      ce.forEach(function(c){ c.userData.active = true; c.material.opacity = 1; });
      setTimeout(function(){
        ce.forEach(function(c){ c.userData.active = false; c.material.opacity = 0; });
      }, 1500);
    }
    else if (curScale === 'atom') {
      flashAtom(target, 0x00f0ff, 0.8);
      // Mark the closest 3p (outer) band electron as excited — that one
      // got promoted.
      var atomBandEs = bandElectrons.filter(function(e){
        return e.userData.type === 'bandElectron' && e.userData.n === 3;
      });
      if (atomBandEs.length > 0) {
        markExcited(atomBandEs[Math.floor(Math.random() * atomBandEs.length)]);
      }
      valenceShells.forEach(function(s){
        s.scale.multiplyScalar(1.4);
        s.material.opacity = 0.35;
        setTimeout(function(){ s.scale.multiplyScalar(1/1.4); s.material.opacity = 0.15; }, 1200);
      });
    }
    else if (curScale === 'spin') {
      flashAtom(target, 0x00f0ff, 0.7);
      // Pick the spin-up electron on the OUTERMOST ring (3p) to be the
      // one that gets promoted.
      var upOuter = spinElectrons.filter(function(e){
        return e.userData.spin === 'up' && e.userData.n === 3;
      });
      if (upOuter.length > 0) {
        markExcited(upOuter[Math.floor(Math.random() * upOuter.length)]);
      }
    }

    // Radiation burst at target location
    var burstGeo = new THREE.SphereGeometry(0.25, 16, 16);
    var burstMat = new THREE.MeshBasicMaterial({
      color: color, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var burst = new THREE.Mesh(burstGeo, burstMat);
    var bOrigin = target.position ? target.position.clone() : new THREE.Vector3(0,0,0);
    burst.position.copy(bOrigin);
    scene.add(burst);
    // Animate burst: expand and fade
    var bStart = Date.now();
    function animateBurst() {
      var elapsed = Date.now() - bStart;
      var t = elapsed / 800;
      if (t >= 1) { scene.remove(burst); return; }
      burst.scale.setScalar(1 + t * 4);
      burst.material.opacity = 0.6 * (1 - t);
      requestAnimationFrame(animateBurst);
    }
    animateBurst();

    // Re-emit a photon after delay (fluorescence)
    // ── Kasha / Stokes: emitted E < absorbed E. Energy deficit goes to
    //    phonons.  Use E_gap (bandgap) + ~0.05 eV vibrational loss as
    //    the minimum Stokes shift — emits a DIFFERENT (lower-E, redder)
    //    photon.  Floor at 0.1 eV (sub-phonon = transparent).
    var Ephonon = 0.05;                              // typical Si optical phonon
    var Eemit = Math.max(E - BANDGAP_SI - Ephonon, 0.1);
    var delayMs = 400 + Math.random() * 600;
    setTimeout(function(){
      var reEmitColor = photonColorFromEnergy(Eemit);
      var geo = new THREE.SphereGeometry(0.05, 12, 12);
      var mat = new THREE.MeshBasicMaterial({ color: reEmitColor });
      var newPhoton = new THREE.Mesh(geo, mat);
      var origin = target.position ? target.position.clone() : new THREE.Vector3(0,0,0);
      // Random outward direction
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2*Math.random() - 1);
      var dir = new THREE.Vector3(
        Math.sin(phi)*Math.cos(theta),
        Math.sin(phi)*Math.sin(theta),
        Math.cos(phi)
      );
      newPhoton.position.copy(origin);
      newPhoton.userData = {
        energy: Eemit,
        velocity: dir.multiplyScalar(0.10),
        life: 200,
        color: reEmitColor,
        state: 'flying'
      };
      var light = new THREE.PointLight(reEmitColor, 0.8, 3);
      newPhoton.add(light);
      scene.add(newPhoton);
      photons.push(newPhoton);

      // De-excite the marked electron — it just relaxed by emitting.
      if (excitedElectron && excitedElectron.material) {
        if (excitedOrbitOld !== null && excitedElectron.userData.orbitR !== undefined) {
          excitedElectron.userData.orbitR = excitedOrbitOld;
        }
        if (excitedOrbitOld !== null && excitedElectron.userData.r !== undefined) {
          excitedElectron.userData.r = excitedOrbitOld;
        }
        if (excitedSpeedOld !== null) {
          excitedElectron.userData.speed = excitedSpeedOld;
        }
        if (excitedColorOld !== null) {
          excitedElectron.material.color.setHex(excitedColorOld);
        }
      }

      var msg2 = document.getElementById('interaction-msg');
      msg2.innerHTML = scaleLabel() + ': <strong>Re-emitted!</strong> ' +
        E.toFixed(2) + ' eV in → <strong style="color:' + reEmitColor.toString(16).padStart(6,'0') + '">' +
        Eemit.toFixed(2) + ' eV out</strong> · ΔE = ' + (E - Eemit).toFixed(2) +
        ' eV → phonons (Stokes shift)';
    }, delayMs);
  }

  // ── ABSORB + IONIZE: photoelectric / photoionization ──
  function ionizeTarget(target, E) {
    // Which shell gets ionized?
    var shell = 'valence';
    if (E >= 8.0) shell = 'deep';          // 2p / 2s / 1s
    else if (E >= 4.5) shell = 'valence';  // 3s / 3p

    emitElectron(target, shell);

    if (curScale === 'macro') {
      if (macroCube && macroCube.material && macroCube.material.emissive) {
        macroCube.material.emissive.setHex(0xff4ecd);
        macroCube.material.emissiveIntensity = 0.4;
        setTimeout(function(){ if(macroCube.material) macroCube.material.emissiveIntensity = 0; }, 800);
      }
    }
    else if (curScale === 'lattice') {
      var origScale = target.scale.x;
      target.scale.multiplyScalar(0.85);
      target.material.color.setHex(0xff4ecd);
      setTimeout(function(){ target.scale.setScalar(origScale); target.material.color.setHex(0x7da4c4); }, 1000);
    }
    else if (curScale === 'cluster') {
      clusterAtoms.forEach(function(a){
        a.userData.vel.add(new THREE.Vector3((Math.random()-0.5)*0.05, (Math.random()-0.5)*0.05, (Math.random()-0.5)*0.05));
      });
    }
    else if (curScale === 'bands') {
      // Remove one electron from the band matching the ionized shell
      var bandIdx = (shell === 'valence') ? 2 : 1; // 2=3s3p, 1=2s2p
      var candidates = bandElectrons.filter(function(e){
        return e.userData.type === 'bandElectron' && e.userData.bandIdx === bandIdx && !e.userData.ionized;
      });
      if (candidates.length > 0) {
        var victim = candidates[Math.floor(Math.random() * candidates.length)];
        victim.visible = false;
        victim.userData.ionized = true;
        setTimeout(function(){ victim.visible = true; victim.userData.ionized = false; }, 2000);
      }
      bandPlanes.forEach(function(p){ p.scale.multiplyScalar(0.65); });
      setTimeout(function(){ bandPlanes.forEach(function(p){ p.scale.multiplyScalar(1/0.65); }); }, 700);
    }
    else if (curScale === 'atom') {
      if (shell === 'valence') {
        valenceShells.forEach(function(s){ s.scale.multiplyScalar(0.55); });
        setTimeout(function(){ valenceShells.forEach(function(s){ s.scale.multiplyScalar(1/0.55); }); }, 900);
      } else {
        coreCloud.scale.multiplyScalar(0.55);
        setTimeout(function(){ coreCloud.scale.multiplyScalar(1/0.55); }, 900);
      }
    }
    else if (curScale === 'spin') {
      // Eject outermost spin electron temporarily
      var outer = spinElectrons.filter(function(e){ return e.userData.spin === 'up' && !e.userData.ionized; });
      if (outer.length > 0) {
        var victim = outer[Math.floor(Math.random() * outer.length)];
        victim.visible = false;
        victim.userData.ionized = true;
        setTimeout(function(){ victim.visible = true; victim.userData.ionized = false; }, 1500);
      }
      spinLevels.forEach(function(s){ s.scale.multiplyScalar(0.6); });
      setTimeout(function(){ spinLevels.forEach(function(s){ s.scale.multiplyScalar(1/0.6); }); }, 700);
    }
  }

  function flashAtom(atom, colorHex, durationSec) {
    if (!atom || !atom.material) return;
    var orig = atom.material.color.getHex();
    atom.material.color.setHex(colorHex);
    var hadEmissive = !!(atom.material.emissive);
    if (hadEmissive) {
      atom.material.emissive.setHex(colorHex);
      atom.material.emissiveIntensity = 0.8;
    }
    setTimeout(function(){
      if (!atom || !atom.material) return;
      atom.material.color.setHex(orig);
      if (hadEmissive) {
        atom.material.emissive.setHex(0x000000);
        atom.material.emissiveIntensity = 0;
      }
    }, durationSec * 1000);
  }

  function exciteAtom(atom) {
    if (!atom || !atom.material) return;
    if (atom.material.emissive) {
      atom.material.emissive.setHex(0x00f0ff);
      atom.material.emissiveIntensity = 1.2;
    }
    atom.userData.excited = true;
    excitedAtoms.push({ atom: atom, t0: time });

    // If showing bands (atom or spin view), animate electron jumping to conduction band
    var conductionE = bandElectrons.filter(function(e){ return e.userData.type === 'conductionElectron'; });
    if (conductionE.length > 0 && (curScale === 'bands' || curScale === 'atom')) {
      var ce = conductionE[0];
      ce.userData.active = true;
      ce.material.opacity = 1;
      // Animate a valence electron fading
      var valenceE = bandElectrons.filter(function(e){ return e.userData.type === 'bandElectron' && e.userData.bandIdx === 2; });
      if (valenceE.length > 0) {
        var ve = valenceE[Math.floor(Math.random() * valenceE.length)];
        ve.material.opacity = 0.3;
        setTimeout(function(){ ve.material.opacity = 1; }, 1500);
        setTimeout(function(){ ce.material.opacity = 0; ce.userData.active = false; }, 1500);
      }
    }

    // Expand valence shells
    valenceShells.forEach(function(s){
      s.scale.multiplyScalar(1.3);
      s.material.opacity = Math.min(s.material.opacity * 2, 0.5);
      setTimeout(function(){ s.scale.multiplyScalar(1/1.3); s.material.opacity = 0.15; }, 1200);
    });
  }

  function emitElectron(atom, shell) {
    var geo = new THREE.SphereGeometry(0.07, 16, 16);
    var mat = new THREE.MeshBasicMaterial({ color: 0xff4ecd });
    var e = new THREE.Mesh(geo, mat);
    var origin = (atom && atom.position) ? atom.position.clone() : new THREE.Vector3(0,0,0);
    e.position.copy(origin);
    var dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, 1).normalize();
    e.userData = { velocity: dir.multiplyScalar(0.18), life: 120, type: 'freeElectron', shell: shell || 'valence' };
    scene.add(e);
    photons.push(e);

    if (atom && atom.material) {
      atom.material.transparent = true;
      atom.material.opacity = 0.6;
      setTimeout(function(){ if(atom && atom.material) atom.material.opacity = 0.95; }, 2000);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     ANIMATION LOOP
     ═══════════════════════════════════════════════════════════════ */

  function updateCamera(dt) {
    currentCamZ += (targetCamZ - currentCamZ) * 0.04;
    currentFov += (targetFov - currentFov) * 0.04;
    camera.position.z = currentCamZ;
    camera.fov = currentFov;
    camera.updateProjectionMatrix();
    currentLookAt.lerp(targetLookAt, 0.04);
    camera.lookAt(currentLookAt);
    if (orbitControls) orbitControls.update();
  }

  function updateThermalVibrations(t) {
    var vib = Math.sin(t * 3) * thermalAmp;
    atoms.forEach(function(a){
      if (a.userData.basePos) {
        a.position.copy(a.userData.basePos).add(new THREE.Vector3(
          Math.sin(t * 4 + a.userData.idx) * vib,
          Math.cos(t * 3.7 + a.userData.idx) * vib,
          Math.sin(t * 3.3 + a.userData.idx * 0.5) * vib
        ));
      }
      if (a.userData.excited) {
        a.material.emissiveIntensity *= 0.985;
        if (a.material.emissiveIntensity < 0.05) {
          a.userData.excited = false;
          a.material.emissive.setHex(0x000000);
          a.material.emissiveIntensity = 0;
        }
      }
    });
  }

  function updateLatticeBonds() {
    bonds.forEach(function(b){
      var a = atoms[b.userData.atomA];
      var c = atoms[b.userData.atomB];
      if (a && c) {
        var mid = new THREE.Vector3().addVectors(a.position, c.position).multiplyScalar(0.5);
        var d = a.position.distanceTo(c.position);
        b.position.copy(mid);
        b.lookAt(c.position);
        b.rotateX(Math.PI / 2);
        b.scale.set(1, Math.max(d, 0.05), 1);
      }
    });
  }

  function updateLatticeElectrons() {
    latticeElectrons.forEach(function(e){
      if (!e.visible) return;
      var d = e.userData;
      var atom = atoms[d.atomIdx];
      if (!atom || !atom.visible) return;
      d.angle += 0.012 * d.speed;
      var x = Math.cos(d.angle) * d.orbitR;
      var z = Math.sin(d.angle) * d.orbitR;
      var rx = x * Math.cos(d.tiltX);
      var ry = x * Math.sin(d.tiltX);
      var rz = z * Math.cos(d.tiltZ) - ry * Math.sin(d.tiltZ);
      ry = z * Math.sin(d.tiltZ) + ry * Math.cos(d.tiltZ);
      e.position.set(atom.position.x + rx, atom.position.y + ry, atom.position.z + rz);
    });
  }

  function updateQuantumClouds() {
    clouds.forEach(function(c){
      var a = atoms[c.userData.atomIdx];
      if (a) c.position.copy(a.position);
    });
    valenceClouds.forEach(function(vc){
      var b = bonds[vc.userData.bondIdx];
      if (b) vc.position.copy(b.position);
    });
    if (focusGroup && atoms[focusedAtomIndex]) {
      focusGroup.position.copy(atoms[focusedAtomIndex].position);
    }
  }

  function updateMacroCube(t) {
    if (macroCube && macroCube.visible) {
      macroCube.rotation.y = t * 0.08;
      macroCube.rotation.x = Math.sin(t * 0.04) * 0.08;
    }
  }

  function updateClusterSprings(dt) {
    if (!clusterAtoms[0] || !clusterAtoms[0].visible) return;
    var damping = 0.92;
    var forces = [];
    for (var i = 0; i < clusterAtoms.length; i++) { forces.push(new THREE.Vector3(0,0,0)); }
    clusterSprings.forEach(function(s){
      var a = clusterAtoms[s.atomA];
      var b = clusterAtoms[s.atomB];
      if (!a || !b) return;
      var dir = new THREE.Vector3().subVectors(b.position, a.position);
      var len = dir.length();
      dir.normalize();
      var f = (len - s.restLength) * s.k;
      var fa = dir.clone().multiplyScalar(f);
      forces[s.atomA].add(fa);
      forces[s.atomB].add(dir.clone().multiplyScalar(-f));
    });
    for (var i = 0; i < clusterAtoms.length; i++) {
      var atom = clusterAtoms[i];
      var v = atom.userData.vel;
      v.add(forces[i].multiplyScalar(dt));
      v.multiplyScalar(damping);
      atom.position.add(v.clone().multiplyScalar(dt));
      var drift = new THREE.Vector3().subVectors(atom.position, atom.userData.basePos);
      drift.multiplyScalar(0.005);
      atom.position.sub(drift);
      v.sub(drift.multiplyScalar(0.5));
    }
    clusterBonds.forEach(function(b){
      var a = clusterAtoms[b.userData.atomA];
      var c = clusterAtoms[b.userData.atomB];
      if (!a || !c) return;
      var mid = new THREE.Vector3().addVectors(a.position, c.position).multiplyScalar(0.5);
      var d = a.position.distanceTo(c.position);
      b.position.copy(mid);
      b.lookAt(c.position);
      b.rotateX(Math.PI / 2);
      b.scale.set(1, Math.max(d, 0.02), 1);
    });
  }

  function updateClusterElectrons() {
    clusterElectrons.forEach(function(e){
      if (!e.visible) return;
      var d = e.userData;
      if (d.type !== 'clusterElectron' || d.atomIdx === undefined) return;
      var atom = clusterAtoms[d.atomIdx];
      if (!atom) return;
      d.angle += 0.016 * d.speed;
      var x = Math.cos(d.angle) * d.orbitR;
      var z = Math.sin(d.angle) * d.orbitR;
      var rx = x * Math.cos(d.tiltX);
      var ry = x * Math.sin(d.tiltX);
      var rz = z * Math.cos(d.tiltZ) - ry * Math.sin(d.tiltZ);
      ry = z * Math.sin(d.tiltZ) + ry * Math.cos(d.tiltZ);
      e.position.set(atom.position.x + rx, atom.position.y + ry, atom.position.z + rz);
    });
  }

  function updateBandElectrons() {
    bandElectrons.forEach(function(e){
      if (!e.visible) return;
      var d = e.userData;
      if (d.type === 'bandElectron' || (d.type === 'conductionElectron' && d.active)) {
        // Angular step = baseOmega (Bohr-derived ω) × dynamic speed multiplier
        var omega = (d.baseOmega || 0.012) * d.speed;
        d.baseAngle += omega;
        e.position.x = Math.cos(d.baseAngle) * d.orbitR;
        e.position.z = Math.sin(d.baseAngle) * d.orbitR;
      }
    });
  }

  function updateSpinVisuals() {
    spinElectrons.forEach(function(e){
      if (!e.visible) return;
      var d = e.userData;
      if (d.type === 'spinElectron') {
        var omega = (d.baseOmega || 0.012) * d.speed;
        d.angle += omega;
        e.position.x = Math.cos(d.angle) * d.r;
        e.position.z = Math.sin(d.angle) * d.r;
      }
    });
    spinArrows.forEach(function(arrow){
      if (!arrow.visible) return;
      var d = arrow.userData;
      if (d.type === 'spinArrow' && d.parent) {
        arrow.position.copy(d.parent.position);
        arrow.position.y += d.offset;
      }
    });
  }

  function updateParticlesAndWaves() {
    updatePhotons();
    updateEMWaves();
    photons.forEach(function(p){
      if (p.userData.type === 'freeElectron') {
        p.position.add(p.userData.velocity);
        p.userData.life--;
      }
    });
    photons = photons.filter(function(p){ return p.userData.life > 0; });
  }

  function animate() {
    animId = requestAnimationFrame(animate);
    var dt = 0.016;
    time += dt;
    updateCamera(dt);
    updateThermalVibrations(time);
    updateLatticeBonds();
    updateLatticeElectrons();
    updateQuantumClouds();
    updateMacroCube(time);
    updateClusterSprings(dt);
    updateClusterElectrons();
    updateBandElectrons();
    updateSpinVisuals();
    updateParticlesAndWaves();
    // Keep reticle facing camera
    if (aimReticle && aimReticle.visible) aimReticle.lookAt(camera.position);
    updateAimLine();
    thermalAmp = Math.max(thermalAmp * 0.9995, 0.02);
    renderer.render(scene, camera);
  }

  function onResize() {
    var container = document.getElementById('crystal-canvas');
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  window._cqScene = { setScale: window.setCrystalScale, fire: window.firePhoton };

  /* ─── UI updater: material optical properties readout ─── */
  window.updateMaterialPanel = function(E) {
    var n = MAT_SI.n(E).toFixed(2);
    var kappa = MAT_SI.kappa(E).toFixed(3);
    var R = (MAT_SI.R(E) * 100).toFixed(0);
    var el = document.getElementById('mat-props');
    if (el) {
      var λ = wavelengthFromEnergy(E).toFixed(0);
      el.innerHTML = '<b>' + MAT_SI.name + ' optical constants @ ' + E.toFixed(2) + ' eV</b><br>' +
        'λ = ' + λ + ' nm · n = ' + n + ' · κ = ' + kappa + ' · R = ' + R + '%';
    }
  };

  /* ─── LATTICE TEARDOWN & REBUILD ─── */

  function clearLatticeScene() {
    function removeAll(arr) {
      for (var i = arr.length - 1; i >= 0; i--) {
        var obj = arr[i];
        if (obj.parent) obj.parent.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      }
      arr.length = 0;
    }
    removeAll(atoms);
    removeAll(bonds);
    removeAll(clouds);
    removeAll(latticeElectrons);
    removeAll(clusterAtoms);
    removeAll(clusterBonds);
    removeAll(clusterElectrons);
    clusterSprings.length = 0;
    removeAll(bandPlanes);
    removeAll(bandElectrons);
    removeAll(spinLevels);
    removeAll(spinArrows);
    removeAll(spinElectrons);
    spinRingLevels.length = 0;
    removeAll(valenceShells);
    removeAll(valenceClouds);
    if (focusGroup) {
      if (focusGroup.parent) focusGroup.parent.remove(focusGroup);
      focusGroup = null;
    }
    nucleus = null; coreCloud = null;
  }

  /* ─── Full material switch — rebuilds lattice, cluster, electrons ─── */
  window.switchCrystalMaterial = function(matId) {
    var matConfig = MATERIAL_PRESETS[matId];
    if (!matConfig) { console.warn('[SIM] Unknown material:', matId); return; }
    if (matId === currentMatId) return;
    currentMatId = matId;

    // Update constants
    BANDGAP_SI = matConfig.bandgap !== undefined ? matConfig.bandgap : BANDGAP_SI;
    WORKFN_SI = matConfig.workFunction !== undefined ? matConfig.workFunction : WORKFN_SI;
    if (matConfig.latticeConstant) A_SI = matConfig.latticeConstant;

    // Tear down and rebuild lattice visuals
    clearLatticeScene();

    // Store current scale to restore after rebuild
    var savedScale = curScale;
    setCrystalScale('macro');

    buildLattice(2, 2, 2, 1.0, matConfig);
    buildLatticeElectrons();
    buildFocusAtom(matConfig);
    buildCluster(matConfig);
    buildEnergyBands(matConfig);
    buildSpinLevels();
    buildQuantumClouds();

    // Update focus group position to new middle atom
    if (atoms.length > 0 && focusGroup) {
      var midIdx = Math.floor(atoms.length / 2);
      focusGroup.position.copy(atoms[midIdx].userData.basePos);
    }

    // Restore scale
    setCrystalScale(savedScale);

    // Rebuild material optical constants dynamically
    MAT_SI = buildMatOptics(matConfig);
    MAT_SI.Eg = BANDGAP_SI;
    MAT_SI.workFn = WORKFN_SI;

    // Update macro cube
    if (macroCube && macroCube.material) {
      macroCube.material.color.setHex(matConfig.simColor || 0x8899aa);
    }

    // Update material panel
    var photonSlider = document.getElementById('photon-slider');
    var E = photonSlider ? parseFloat(photonSlider.value) : 1.5;
    if (typeof window.updateMaterialPanel === 'function') window.updateMaterialPanel(E);
    if (typeof window.updateSnellReadout === 'function') window.updateSnellReadout(E);

    // Update bandgap diagram
    var zoomSlider = document.getElementById('zoom-slider');
    if (zoomSlider) {
      var v = parseFloat(zoomSlider.value) || 0;
      var evt = new Event('input');
      zoomSlider.dispatchEvent(evt);
    }

    console.log('[SIM] Switched to', matConfig.name);
  };

  // Legacy API bridge
  window.setCrystalMaterial = function(props) {
    if (!props) return;
    if (props.materialId && MATERIAL_PRESETS[props.materialId]) {
      window.switchCrystalMaterial(props.materialId);
      return;
    }
    // Fallback: just update colors/constants without rebuild
    BANDGAP_SI = props.bandgap !== undefined && props.bandgap !== null ? props.bandgap : BANDGAP_SI;
    WORKFN_SI = props.workFunction !== undefined && props.workFunction !== null ? props.workFunction : WORKFN_SI;
    if (props.latticeConstant !== undefined && props.latticeConstant !== null) A_SI = props.latticeConstant;
    MAT_SI.name = props.name || MAT_SI.name;
    MAT_SI.Eg = BANDGAP_SI;
    MAT_SI.workFn = WORKFN_SI;
    if (props.color !== undefined) MAT_SI.color = props.color;
    if (macroCube && macroCube.material) {
      macroCube.material.color.setHex(props.color || 0x8899aa);
    }
    var atomColor = props.atomColor || 0x7da4c4;
    atoms.forEach(function(a) {
      if (a.material) a.material.color.setHex(atomColor);
    });
    clusterAtoms.forEach(function(a) {
      if (a.material) a.material.color.setHex(atomColor);
    });
    var labelEl = document.getElementById('scale-label');
    var infoEl = document.getElementById('scale-info');
    var labelBadge = document.getElementById('scale-label-badge');
    if (labelEl) labelEl.textContent = 'Macro — 1 cm ' + (props.symbol || '') + ' crystal';
    if (infoEl) infoEl.textContent = props.name + ' crystal. Band gap = ' + BANDGAP_SI.toFixed(2) + ' eV.';
    if (labelBadge) labelBadge.textContent = (props.symbol || 'Si') + ' ' + (props.name || 'crystal');
    var photonSlider = document.getElementById('photon-slider');
    var E = photonSlider ? parseFloat(photonSlider.value) : 1.5;
    if (typeof window.updateMaterialPanel === 'function') window.updateMaterialPanel(E);
    if (typeof window.updateSnellReadout === 'function') window.updateSnellReadout(E);
    var gapText = document.querySelector('.photon-val + span');
    if (gapText) {
      gapText.textContent = (props.symbol || 'Si') + ' gap = ' + BANDGAP_SI.toFixed(2) + ' eV';
    }
    var zoomSlider = document.getElementById('zoom-slider');
    if (zoomSlider) {
      var v = parseFloat(zoomSlider.value) || 0;
      var evt = new Event('input');
      zoomSlider.dispatchEvent(evt);
    }
  };
})();
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
    // E = ℏω_real  → ω_real = E / 0.658 eV·fs
    // Map: 0.1 eV → slow, 12 eV → fast  (proportional to E)
    return 0.02 + E * 0.025;
  }

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

  /* ─── SCALE STATE ─── 6 scales */
  var SCALE = {
    macro:   { camZ: 18, fov: 45, vis: ['macro'],                     label: 'Macro — 1 cm',       info: 'Silicon crystal at centimeter scale. A solid grey block. Classical continuum — no quantum confinement visible.' },
    lattice: { camZ: 6,  fov: 50, vis: ['atoms','bonds'],             label: 'Lattice — 5 Å',      info: 'Diamond-cubic lattice. Each Si has 4 nearest neighbors held by covalent bonds. Atoms vibrate thermally. Bulk band gap = 1.12 eV.' },
    cluster: { camZ: 4.5,fov: 45, vis: ['cluster'],                   label: 'Cluster — 2 Å',      info: '5 Si atoms in tetrahedral bonding. 4 valence electrons orbit the entire cluster — delocalized bonding electrons start feeling finite size.' },
    atom:    { camZ: 2.5,fov: 35, vis: ['focusAtom','bands','shells'], label: 'Atom — 100 pm',    info: 'Single Si atom: 14 electrons orbit the nucleus on 4 energy levels. Inner electrons orbit fastest. Photon with E > gap excites valence → conduction.' },
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
    buildMacroCube();
    buildLattice(2, 2, 2, 1.0);
    buildLatticeElectrons();
    buildFocusAtom();
    buildCluster();
    buildEnergyBands();
    buildSpinLevels();
    buildQuantumClouds();
    buildLaserPistol();

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

  function buildLattice(nx, ny, nz, a) {
    var siColor = 0x7da4c4;
    var bondColor = 0x556677;
    var atomGeo = new THREE.SphereGeometry(0.12, 24, 24);
    var atomMat = new THREE.MeshStandardMaterial({ color: siColor, metalness: 0.4, roughness: 0.4 });
    var bondGeo = new THREE.CylinderGeometry(0.025, 0.025, 1, 8);
    var bondMat = new THREE.MeshStandardMaterial({ color: bondColor, metalness: 0.3, roughness: 0.5 });

    var positions = [];
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
          }
        }
      }
    }

    for (var i = 0; i < positions.length; i++) {
      var mesh = new THREE.Mesh(atomGeo, atomMat.clone());
      mesh.position.copy(positions[i]);
      mesh.userData = { type: 'atom', basePos: positions[i].clone(), idx: i, excited: false };
      atoms.push(mesh);
      scene.add(mesh);
    }

    var maxBond = 0.45 * a;
    for (var i = 0; i < positions.length; i++) {
      for (var j = i + 1; j < positions.length; j++) {
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

  function buildCluster() {
    var siColor = 0x7da4c4;
    var bondColor = 0x8899aa;
    var atomGeo = new THREE.SphereGeometry(0.14, 24, 24);
    var atomMat = new THREE.MeshStandardMaterial({ color: siColor, metalness: 0.5, roughness: 0.3 });
    var bondGeo = new THREE.CylinderGeometry(0.025, 0.025, 1, 8);
    var bondMat = new THREE.MeshStandardMaterial({ color: bondColor, metalness: 0.3, roughness: 0.4 });

    // Tetrahedral directions
    var dirs = [
      new THREE.Vector3(1, 1, 1).normalize(),
      new THREE.Vector3(1, -1, -1).normalize(),
      new THREE.Vector3(-1, 1, -1).normalize(),
      new THREE.Vector3(-1, -1, 1).normalize()
    ];
    var dist = 0.65;

    // Center atom
    var center = new THREE.Mesh(atomGeo, atomMat.clone());
    center.position.set(0, 0, 0);
    center.userData = {
      type: 'clusterAtom', basePos: new THREE.Vector3(0,0,0),
      idx: 0, vel: new THREE.Vector3(0,0,0), bondCount: 0
    };
    clusterAtoms.push(center);
    scene.add(center);

    // 4 corner atoms
    for (var i = 0; i < 4; i++) {
      var pos = dirs[i].clone().multiplyScalar(dist);
      var a = new THREE.Mesh(atomGeo, atomMat.clone());
      a.position.copy(pos);
      a.userData = {
        type: 'clusterAtom', basePos: pos.clone(),
        idx: i + 1, vel: new THREE.Vector3(0,0,0), bondCount: 0
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

    // Center-to-corners (4 bonds)
    for (var i = 1; i < 5; i++) addBond(0, i);
    // Corner-to-corner (tetrahedron edges)
    for (var i = 1; i < 5; i++) {
      for (var j = i + 1; j < 5; j++) {
        addBond(i, j);
      }
    }

    // ── FREE ELECTRONS: one per corner atom (Si valence=4, corners have 3 bonds) ──
    var eGeo = new THREE.SphereGeometry(0.038, 16, 16);
    var eMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.9 });
    clusterAtoms.forEach(function(atom, idx) {
      var bonds = atom.userData.bondCount || 0;
      var free = Math.max(0, 4 - bonds);
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

  /* ─── FOCUS ATOM: nucleus + shells ─── */
  function buildFocusAtom() {
    focusGroup = new THREE.Group();

    // Nucleus
    var nGeo = new THREE.SphereGeometry(0.04, 32, 32);
    var nMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
    nucleus = new THREE.Mesh(nGeo, nMat);
    nucleus.userData.type = 'nucleus';
    focusGroup.add(nucleus);

    // Core shell (tight)
    var cGeo = new THREE.SphereGeometry(0.18, 32, 32);
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
    var vGeo = new THREE.SphereGeometry(0.26, 32, 32);
    var vMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff, transparent: true, opacity: 0.15,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    for (var i = 0; i < 4; i++) {
      var lobe = new THREE.Mesh(vGeo, vMat.clone());
      lobe.position.copy(valDirs[i]).multiplyScalar(0.22);
      lobe.scale.set(1, 0.55, 1);
      lobe.lookAt(new THREE.Vector3().addVectors(lobe.position, valDirs[i]));
      lobe.userData = { type: 'valenceShell', dir: valDirs[i] };
      valenceShells.push(lobe);
      focusGroup.add(lobe);
    }

    var fp = atoms[focusedAtomIndex].userData.basePos;
    focusGroup.position.copy(fp);
    focusGroup.userData.type = 'focusGroup';
    scene.add(focusGroup);
  }

  /* ─── ENERGY BANDS: concentric rings around nucleus, electrons orbit ─── */
  function buildEnergyBands() {
    // 4 energy levels for Si: 1s² 2s² 2p⁶ 3s² 3p²
    // Visual: 4 concentric rings at different radii from nucleus
    var levels = [
      { r: 0.22, color: 0x555588, opacity: 0.25, label: '1s (core)', count: 2, speed: 2.0 },
      { r: 0.32, color: 0x6666aa, opacity: 0.22, label: '2s 2p',    count: 8, speed: 1.6 },
      { r: 0.48, color: 0x00f0ff, opacity: 0.20, label: '3s 3p',    count: 4, speed: 1.0 },
      { r: 0.65, color: 0xc084fc, opacity: 0.15, label: '4s (cond)', count: 0, speed: 0.7 }  // empty at 0K
    ];

    levels.forEach(function(lvl, idx) {
      // Concentric ring (torus-like, represented as thin tube)
      var tubeGeo = new THREE.TorusGeometry(lvl.r, 0.008, 8, 64);
      var tubeMat = new THREE.MeshBasicMaterial({
        color: lvl.color, transparent: true, opacity: lvl.opacity,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      var ring = new THREE.Mesh(tubeGeo, tubeMat);
      ring.rotation.x = Math.PI / 2;
      ring.userData = { type: 'bandPlane', levelIdx: idx, levelInfo: lvl };
      bandPlanes.push(ring);
      focusGroup.add(ring);  // ADD TO FOCUS GROUP so it follows the nucleus

      // Electrons orbiting on this ring
      if (lvl.count > 0) {
        var eGeo = new THREE.SphereGeometry(0.032, 16, 16);
        var eMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        for (var e = 0; e < lvl.count; e++) {
          var electron = new THREE.Mesh(eGeo, eMat.clone());
          var angle = (e / lvl.count) * Math.PI * 2 + idx * 0.7;
          electron.position.set(Math.cos(angle) * lvl.r, 0, Math.sin(angle) * lvl.r);
          electron.userData = {
            type: 'bandElectron',
            bandIdx: idx,
            baseAngle: angle,
            orbitR: lvl.r,
            speed: lvl.speed,
            excited: false
          };
          bandElectrons.push(electron);
          focusGroup.add(electron);  // ADD TO FOCUS GROUP
        }
      }
    });

    // Conduction band electrons (hidden initially, appear on excitation)
    var ceGeo = new THREE.SphereGeometry(0.032, 16, 16);
    var ceMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0 });
    for (var e = 0; e < 4; e++) {
      var ce = new THREE.Mesh(ceGeo, ceMat.clone());
      var angle = (e / 4) * Math.PI * 2;
      ce.position.set(Math.cos(angle) * 0.65, 0, Math.sin(angle) * 0.65);
      ce.userData = {
        type: 'conductionElectron',
        baseAngle: angle,
        orbitR: 0.65,
        speed: 0.7,
        active: false
      };
      bandElectrons.push(ce);
      focusGroup.add(ce);  // ADD TO FOCUS GROUP
    }
  }

  /* ─── SPIN LEVELS: up & down electrons share SAME orbital ring ───
     Pauli principle: every energy level holds 2 electrons with opposite spin.
     Cyan = spin-up (arrow ↑), Pink = spin-down (arrow ↓).
     Both orbit the SAME radius — the band is one shared ring. */
  function buildSpinLevels() {
    var levelData = [
      { r: 0.24, label: '1s' },
      { r: 0.38, label: '2p' },
      { r: 0.55, label: '3p' }
    ];

    levelData.forEach(function(l, idx) {
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
      var speed = 1.6 + idx * 0.35;
      var baseAngle = idx * 1.3;

      // ── Spin-up electron (cyan, arrow ↑) on shared ring ──
      var eUpMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      var eUp = new THREE.Mesh(eGeo, eUpMat);
      eUp.position.set(Math.cos(baseAngle) * l.r, 0, Math.sin(baseAngle) * l.r);
      eUp.userData = {
        type: 'spinElectron', spin: 'up', levelIdx: idx,
        angle: baseAngle, r: l.r, speed: speed
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
        angle: aDown, r: l.r, speed: speed * 0.92 // slightly different speed for visual separation
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
    if (['cluster','bands','atom','spin'].indexOf(mode) >= 0 && atoms[focusedAtomIndex]) {
      var ap = atoms[focusedAtomIndex].position || atoms[focusedAtomIndex].userData.basePos;
      targetLookAt.copy(ap);
    } else {
      targetLookAt.set(0, 0, 0);
    }
    if (orbitControls) orbitControls.target.copy(targetLookAt);

    // Visibility toggles
    if (macroCube) macroCube.visible = cfg.vis.indexOf('macro') >= 0;
    if (laserPistol) laserPistol.visible = curScale !== 'macro';

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
    var labelEl = document.getElementById('scale-label');
    var infoEl = document.getElementById('scale-info');
    if (labelEl) labelEl.textContent = cfg.label;
    if (infoEl) infoEl.textContent = cfg.info;

    updateScaleBar(mode);
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
  var waveSpeed = 0.04;        // propagation speed (scene units/frame) — slower for visibility
  var WAVE_SEGMENTS = 48;      // geometry resolution
  var WAVE_PACKET_WIDTH = 3.0; // packet envelope width (scene units)

  window.toggleViewMode = function(mode) {
    viewMode = mode;
  };

  /* Material optical properties (Si at room temp, simplified)
     ε1 = n² - κ²,  ε2 = σ/(ε0ω) = 2nκ for E > Eg
     Hagen-Rubens: R ≈ 1 - 4√(πε0ω/σ) for metals at low ω
     For Si: n ≈ 3.4 (visible), κ ≈ 0 (transparent < Eg), κ large (absorbing > Eg) */
  var MAT_SI = {
    name: 'Silicon',
    Eg: 1.12,                  // bandgap eV
    workFn: 4.5,               // work function eV
    n: function(E) {           // refractive index (simplified Sellmeier)
      if (E < 0.08) return 3.42;                 // IR
      if (E < 1.12) return 3.45;                 // near-IR transparent
      if (E < 2.5) return 3.4 + (E-1.12)*0.1;   // visible
      if (E < 4.5) return 3.55 + (E-2.5)*0.05; // UV
      return 1.0 + 2.0/E;                        // X-ray: n → 1
    },
    kappa: function(E) {       // extinction coefficient
      if (E < 0.08) return 0.001;                // IR transparent
      if (E < 1.12) return 0.002;                // near-IR
      if (E < 4.5) return 0.15 * (E - 1.12);     // strong absorption
      return 2.5;                                 // deep UV/X-ray
    },
    alpha: function(E) {       // absorption coefficient (1/scene unit)
      return this.kappa(E) * E * 2.5;  // proportional to κ
    },
    R: function(E) {           // reflectivity (Fresnel normal incidence)
      var n0 = 1.0;             // air
      var n1 = this.n(E);
      return Math.pow((n0 - n1)/(n0 + n1), 2);
    }
  };

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

  window.firePhoton = function(energyEV) {
    energyEV = parseFloat(energyEV);
    if (!scene) return;

    if (viewMode === 'wave') {
      fireEMWave(energyEV);
      return;
    }

    var color = photonColorFromEnergy(energyEV);

    var geo = new THREE.SphereGeometry(0.06, 16, 16);
    var mat = new THREE.MeshBasicMaterial({ color: color });
    var photon = new THREE.Mesh(geo, mat);

    // ── LASER PISTOL: fire perpendicularly from barrel tip toward material center ──
    var start, end = new THREE.Vector3(0, 0, 0);
    // For atom/spin: aim directly at the focused atom
    if (['atom','spin'].indexOf(curScale) >= 0 && focusGroup) {
      end.copy(focusGroup.position);
    }
    // For cluster: aim at cluster center
    else if (curScale === 'cluster') {
      end.set(0, 0, 0);
    }

    // Compute start = perpendicular direction from camera right toward end
    // Material is at origin; photon should be fired along -X (from +right toward center)
    var dir = new THREE.Vector3().subVectors(end, new THREE.Vector3(4, 0, 0)).normalize();
    if (dir.length() < 0.01) dir.set(-1, 0, 0);

    // If pistol exists, use its tip; otherwise default to right side
    if (laserPistol && laserPistol.visible !== false) {
      // Pistol is oriented along +X, tip at local X≈0.28
      var tip = new THREE.Vector3(0.30, 0, 0);
      tip.applyMatrix4(laserPistol.matrixWorld);
      start = tip.clone();
      // Re-orient pistol to point at target
      var aimDir = new THREE.Vector3().subVectors(end, start).normalize();
      var quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0), aimDir);
      laserPistol.setRotationFromQuaternion(quat);
      // Small recoil kick
      laserPistol.position.add(aimDir.clone().multiplyScalar(-0.06));
      setTimeout(function(){ laserPistol.position.add(aimDir.clone().multiplyScalar(0.06)); }, 150);
    } else {
      start = new THREE.Vector3(4.5, Math.random()*0.3, Math.random()*0.3);
    }

    photon.position.copy(start);
    photon.userData = {
      energy: energyEV,
      velocity: new THREE.Vector3().subVectors(end, start).normalize().multiplyScalar(0.12),
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
      msg.textContent = 'Photon fired: E = ' + energyEV.toFixed(2) + ' eV';
      msg.style.opacity = '1';
      setTimeout(function(){ msg.style.opacity = '0.7'; }, 2000);
    }
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

    // Glowing trail dots that make the wave visible as a luminous body
    var trailCount = 20;
    var trail = [];
    var dotGeo = new THREE.SphereGeometry(0.18, 16, 16);
    for (var t = 0; t < trailCount; t++) {
      var dotMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending });
      var dot = new THREE.Mesh(dotGeo, dotMat);
      group.add(dot);
      trail.push(dot);
    }

    // Bright oscillating head sphere (follows the peak amplitude)
    var headGeo = new THREE.SphereGeometry(0.28, 24, 24);
    var headMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });
    var head = new THREE.Mesh(headGeo, headMat);
    group.add(head);

    // Central glow light
    var glow = new THREE.PointLight(color, 4.0, 15);
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
      life: 300,
      maxLife: 300,
      state: 'flying',
      amplitude: 0.08,
      wavelength: wavelengthFromEnergy(energy),
      frequency: frequencyFromEnergy(energy),
      speed: waveSpeed,
      insideMaterial: false,
      pathLength: 0
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

    // Perpendicular EM wave from laser pistol toward material center
    var start;
    if (laserPistol) {
      var tip = new THREE.Vector3(0.30, 0, 0);
      tip.applyMatrix4(laserPistol.matrixWorld);
      start = tip.clone();
      var aimDir = new THREE.Vector3().subVectors(end, start).normalize();
      var quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0), aimDir);
      laserPistol.setRotationFromQuaternion(quat);
      laserPistol.position.add(aimDir.clone().multiplyScalar(-0.06));
      setTimeout(function(){ laserPistol.position.add(aimDir.clone().multiplyScalar(0.06)); }, 150);
    } else {
      start = new THREE.Vector3(4.5, Math.random()*0.3, Math.random()*0.3);
    }
    var dir = new THREE.Vector3().subVectors(end, start).normalize();
    if (dir.length() < 0.01) dir.set(-1, 0, 0);
    buildEMWave(start, dir, energyEV, color);

    var msg = document.getElementById('photon-msg');
    if (msg) {
      var λ = wavelengthFromEnergy(energyEV);
      msg.innerHTML = 'EM wave fired: E = ' + energyEV.toFixed(2) + ' eV, λ = ' + λ.toFixed(0) + ' nm';
      msg.style.opacity = '1';
      setTimeout(function(){ msg.style.opacity = '0.7'; }, 3000);
    }
    updateMaterialPanel(energyEV);
  }

  /* ═══════════════════════════════════════════════════════════════
     WAVE ↔ MATTER INTERACTION (Maxwell optical physics)
     ═══════════════════════════════════════════════════════════════ */
  function updateEMWaves() {
    for (var i = emWaves.length - 1; i >= 0; i--) {
      var w = emWaves[i];
      w.life--;
      w.phase += w.frequency;
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
    var λVis = w.wavelength / 200;  // scale λ to scene units
    var k = 2 * Math.PI / λVis;
    // Packet shows ~3 wavelengths, min 1.5 scene units so low-E waves are visible
    var packetEnv = Math.max(λVis * 3, 1.5);

    // Update axis line to match packet length
    if (w.axisLine && w.axisLine.geometry) {
      var ap = w.axisLine.geometry.attributes.position.array;
      ap[3] = packetEnv; // endpoint x
      w.axisLine.geometry.attributes.position.needsUpdate = true;
    }

    for (var s = 0; s < seg; s++) {
      var x = (s / (seg - 1)) * packetEnv;  // 0 → packetEnv
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

    // Animate glowing trail dots to follow the oscillating peak
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
    // Animate bright head sphere at the oscillation peak
    if (w.head) {
      var headX = packetEnv * 0.5;
      var headPhase = k * headX - w.phase;
      var headEnv = Math.exp(-Math.pow((headX - packetEnv*0.5) / (packetEnv*0.25), 2));
      w.head.position.set(headX,
        Math.sin(headPhase) * amp * headEnv,
        Math.sin(headPhase + Math.PI/2) * amp * headEnv * 0.6);
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
      // Check if wave center is inside the macro cube
      if (pos.distanceTo(new THREE.Vector3(0,0,0)) < 2.0) {
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
        w.state = 'absorbed';
        w.amplitude *= 0.1;
        w.life = 25;
        exciteAndEmit(hit, E, w.color);
        if (msg) msg.innerHTML = 'Wave: <span style="color:#00f0ff">excitation</span> → fluorescence (E_g < E < W_f)';
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

  /* ─── SPAWN REFLECTED WAVE (elastic bounce, k reverses) ─── */
  function spawnReflectedWave(parent) {
    // Kill the incident ghost — reflected wave takes the remaining energy
    parent.life = Math.min(parent.life, 5);
    parent.maxLife = parent.life;
    parent.amplitude *= 0.05;

    var refDir = parent.direction.clone().negate();
    var refPos = parent.mesh.position.clone().add(refDir.clone().multiplyScalar(0.3));
    var w = buildEMWave(refPos, refDir, parent.energy * 0.95, parent.color);
    w.amplitude = parent.amplitude * 14; // restore from *0.05 above ≈ 0.7x original
    w.life = parent.life * 16;
    w.maxLife = w.life;
    w.frequency = parent.frequency; // reflection doesn't change frequency
  }

  /* ─── SPAWN REFRACTED WAVE (Snell's law, wavelength compresses, speed drops) ─── */
  function spawnRefractedWave(parent, nMat) {
    // Kill the incident ghost — transmitted wave takes the remaining energy
    parent.life = Math.min(parent.life, 5);
    parent.maxLife = parent.life;
    parent.amplitude *= 0.05;

    var slowDir = parent.direction.clone();
    var slowPos = parent.mesh.position.clone().add(slowDir.clone().multiplyScalar(0.2));
    var ratio = 1.0 / nMat;                     // v_mat / v_vac = 1/n
    var w = buildEMWave(slowPos, slowDir, parent.energy, parent.color);
    // In material: wavelength compressed, amplitude slightly reduced, speed = c/n
    w.wavelength = parent.wavelength * ratio;
    w.frequency = parent.frequency;             // frequency conserved at boundary
    w.speed = (parent.speed || waveSpeed) * ratio;
    w.amplitude = parent.amplitude * 17;         // restore from *0.05 above ≈ 0.85x original
    w.life = parent.life * 16;
    w.maxLife = w.life;
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
  function exciteAndEmit(target, E, color) {
    // Visual excitation
    if (curScale === 'lattice') {
      flashAtom(target, 0x00f0ff, 0.8);
      var localEs = latticeElectrons.filter(function(e){
        return e.userData.atomIdx === target.userData.idx;
      });
      if (localEs.length > 0) {
        var le = localEs[Math.floor(Math.random()*localEs.length)];
        var oldR = le.userData.orbitR;
        le.userData.orbitR *= 1.8;
        setTimeout(function(){ le.userData.orbitR = oldR; }, 1200);
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
      var ce = bandElectrons.filter(function(e){ return e.userData.type === 'conductionElectron'; });
      ce.forEach(function(c){ c.userData.active = true; c.material.opacity = 1; });
      setTimeout(function(){
        ce.forEach(function(c){ c.userData.active = false; c.material.opacity = 0; });
      }, 1500);
    }
    else if (curScale === 'atom') {
      flashAtom(target, 0x00f0ff, 0.8);
      valenceShells.forEach(function(s){
        s.scale.multiplyScalar(1.4);
        s.material.opacity = 0.35;
        setTimeout(function(){ s.scale.multiplyScalar(1/1.4); s.material.opacity = 0.15; }, 1200);
      });
    }
    else if (curScale === 'spin') {
      flashAtom(target, 0x00f0ff, 0.7);
      var upE = spinElectrons.filter(function(e){ return e.userData.spin === 'up'; });
      if (upE.length > 0) {
        var e = upE[Math.floor(Math.random()*upE.length)];
        e.userData.r *= 1.25;
        setTimeout(function(){ e.userData.r /= 1.25; }, 1000);
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
    var delayMs = 400 + Math.random() * 600;
    setTimeout(function(){
      var reEmitColor = photonColorFromEnergy(E * 0.98); // slight Stokes shift
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
        energy: E * 0.98,
        velocity: dir.multiplyScalar(0.10),
        life: 200,
        color: reEmitColor,
        state: 'flying'
      };
      var light = new THREE.PointLight(reEmitColor, 0.8, 3);
      newPhoton.add(light);
      scene.add(newPhoton);
      photons.push(newPhoton);

      var msg2 = document.getElementById('interaction-msg');
      msg2.textContent = scaleLabel() + ': Re-emitted! ' + (E*0.98).toFixed(2) + ' eV photon (fluorescence)';
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
        d.baseAngle += 0.012 * d.speed;
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
        d.angle += 0.012 * d.speed;
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
      el.innerHTML = '<b>Si optical constants @ ' + E.toFixed(2) + ' eV</b><br>' +
        'λ = ' + λ + ' nm · n = ' + n + ' · κ = ' + kappa + ' · R = ' + R + '%';
    }
  };
})();
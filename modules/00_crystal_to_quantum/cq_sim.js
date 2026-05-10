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
    bands:   { camZ: 3.5,fov: 40, vis: ['focusAtom','bands'],       label: 'Bands — 1 Å',        info: 'Single Si atom: 14 electrons orbit the nucleus on 4 energy levels. Inner electrons orbit fastest. Photon with E > gap excites valence → conduction.' },
    atom:    { camZ: 2.5,fov: 35, vis: ['focusAtom','shells'],      label: 'Atom — 100 pm',      info: 'Electron shells: 10 core electrons (tight purple sphere) + 4 valence lobes (delocalized cyan). The wave-like nature of electron orbitals.' },
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

  /* ─── CLUSTER: 5 atoms with spring bonds + hanging electrons ─── */
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
      idx: 0, vel: new THREE.Vector3(0,0,0)
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
        idx: i + 1, vel: new THREE.Vector3(0,0,0)
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
    }

    // Center-to-corners (4 bonds)
    for (var i = 1; i < 5; i++) addBond(0, i);
    // Corner-to-corner (tetrahedron edges: each pair of corners is connected)
    for (var i = 1; i < 5; i++) {
      for (var j = i + 1; j < 5; j++) {
        addBond(i, j);
      }
    }

    // ── HANGING ELECTRONS: 4 electrons shuttle along center-to-corner bonds ──
    var eGeo = new THREE.SphereGeometry(0.038, 16, 16);
    var eMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.9 });
    var hangConfig = [
      { bondIdx: 0, speed: 2.2, amp: 0.18, phase: 0.0,   swing: 0.06 }, // along bond 0-1
      { bondIdx: 1, speed: 1.8, amp: 0.16, phase: 1.57,  swing: 0.05 }, // along bond 0-2
      { bondIdx: 2, speed: 2.5, amp: 0.20, phase: 3.14,  swing: 0.07 }, // along bond 0-3
      { bondIdx: 3, speed: 1.5, amp: 0.14, phase: 4.71,  swing: 0.04 }  // along bond 0-4
    ];

    for (var e = 0; e < 4; e++) {
      var electron = new THREE.Mesh(eGeo, eMat.clone());
      electron.position.set(0, 0, 0);
      electron.userData = {
        type: 'clusterElectron',
        hang: hangConfig[e],
        baseAngle: e * 1.3
      };
      clusterElectrons.push(electron);
      scene.add(electron);
    }
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

  /* ─── SPIN LEVELS: split rings + orbiting electrons with spin arrows ─── */
  function buildSpinLevels() {
    // 3 levels: 1s, 2p, 3p — each splits into spin-up (cyan) and spin-down (pink)
    var levelData = [
      { r: 0.24, label: '1s' },
      { r: 0.38, label: '2p' },
      { r: 0.55, label: '3p' }
    ];

    levelData.forEach(function(l, idx) {
      // Split delta: spin-up ring is slightly larger radius
      var dR = 0.04;

      // ── Spin-up ring (cyan) ──
      var upTube = new THREE.TorusGeometry(l.r + dR, 0.006, 8, 64);
      var upMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff, transparent: true, opacity: 0.18,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      var upRing = new THREE.Mesh(upTube, upMat);
      upRing.rotation.x = Math.PI / 2;
      upRing.userData = { type: 'spinRing', spin: 'up', levelIdx: idx };
      spinLevels.push(upRing);
      focusGroup.add(upRing);

      // ── Spin-down ring (pink) ──
      var downTube = new THREE.TorusGeometry(l.r - dR, 0.006, 8, 64);
      var downMat = new THREE.MeshBasicMaterial({
        color: 0xff4ecd, transparent: true, opacity: 0.18,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      var downRing = new THREE.Mesh(downTube, downMat);
      downRing.rotation.x = Math.PI / 2;
      downRing.userData = { type: 'spinRing', spin: 'down', levelIdx: idx };
      spinLevels.push(downRing);
      focusGroup.add(downRing);

      // ── Spin-up electron + arrow ──
      var eGeo = new THREE.SphereGeometry(0.028, 16, 16);
      var eUpMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      var eUp = new THREE.Mesh(eGeo, eUpMat);
      var aUp = idx * 2.4; // spread angles across levels
      eUp.position.set(Math.cos(aUp) * (l.r + dR), 0, Math.sin(aUp) * (l.r + dR));
      eUp.userData = {
        type: 'spinElectron', spin: 'up', levelIdx: idx,
        angle: aUp, r: l.r + dR, speed: 1.8 + idx * 0.4
      };
      spinElectrons.push(eUp);
      focusGroup.add(eUp);

      // Arrow pointing UP from electron
      var arrowUp = buildSpinArrow(0x00f0ff, 1);
      arrowUp.position.copy(eUp.position);
      arrowUp.userData = { type: 'spinArrow', parent: eUp, spin: 'up', offset: 0.06 };
      spinArrows.push(arrowUp);
      focusGroup.add(arrowUp);

      // ── Spin-down electron + arrow ──
      var eDownMat = new THREE.MeshBasicMaterial({ color: 0xff4ecd });
      var eDown = new THREE.Mesh(eGeo, eDownMat);
      var aDown = aUp + Math.PI; // opposite side
      eDown.position.set(Math.cos(aDown) * (l.r - dR), 0, Math.sin(aDown) * (l.r - dR));
      eDown.userData = {
        type: 'spinElectron', spin: 'down', levelIdx: idx,
        angle: aDown, r: l.r - dR, speed: 1.4 + idx * 0.4
      };
      spinElectrons.push(eDown);
      focusGroup.add(eDown);

      // Arrow pointing DOWN from electron
      var arrowDown = buildSpinArrow(0xff4ecd, -1);
      arrowDown.position.copy(eDown.position);
      arrowDown.userData = { type: 'spinArrow', parent: eDown, spin: 'down', offset: -0.06 };
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

    // Visibility toggles
    if (macroCube) macroCube.visible = cfg.vis.indexOf('macro') >= 0;

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

  function updateScaleBar(mode) {
    var bars = document.querySelectorAll('.scale-step');
    var order = ['macro','lattice','cluster','bands','atom','spin'];
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

    var color = photonColorFromEnergy(energyEV);

    var geo = new THREE.SphereGeometry(0.06, 16, 16);
    var mat = new THREE.MeshBasicMaterial({ color: color });
    var photon = new THREE.Mesh(geo, mat);

    // Launch from right side toward center
    var start = new THREE.Vector3(5, Math.random()*1.5-0.75, Math.random()*1.5-0.75);
    var end   = new THREE.Vector3(0, 0, 0);
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
        // Scale-aware collision targets
        if (curScale === 'macro') {
          // Macro cube: photon must reach center region
          var d = p.position.distanceTo(new THREE.Vector3(0,0,0));
          if (d < 2.2) {
            p.userData.state = 'absorbed';
            handlePhotonAbsorption(p, macroCube);
            scene.remove(p);
            photons.splice(i, 1);
            continue;
          }
        } else if (curScale === 'lattice') {
          for (var a = 0; a < atoms.length; a++) {
            var atom = atoms[a];
            if (!atom.visible) continue;
            var d = p.position.distanceTo(atom.position);
            if (d < 0.35) {
              p.userData.state = 'absorbed';
              handlePhotonAbsorption(p, atom);
              scene.remove(p);
              photons.splice(i, 1);
              break;
            }
          }
        } else if (curScale === 'cluster') {
          for (var a = 0; a < clusterAtoms.length; a++) {
            var cat = clusterAtoms[a];
            if (!cat.visible) continue;
            var d = p.position.distanceTo(cat.position);
            if (d < 0.35) {
              p.userData.state = 'absorbed';
              handlePhotonAbsorption(p, cat);
              scene.remove(p);
              photons.splice(i, 1);
              break;
            }
          }
        } else {
          // bands / atom / spin: photon hits focusGroup/nucleus area
          var d = p.position.distanceTo(new THREE.Vector3(0,0,0));
          if (d < 0.5) {
            p.userData.state = 'absorbed';
            handlePhotonAbsorption(p, nucleus || focusGroup);
            scene.remove(p);
            photons.splice(i, 1);
            continue;
          }
        }
      }

      if (p.userData.life <= 0 && p.userData.state === 'flying') {
        scene.remove(p);
        photons.splice(i, 1);
      }
    }
  }

  function updatePhotons() {
    for (var i = photons.length - 1; i >= 0; i--) {
      var p = photons[i];
      p.position.add(p.userData.velocity);
      p.userData.life--;

      if (p.userData.state === 'flying') {
        // Scale-aware collision
        var hit = false;
        var hitObj = null;

        if (curScale === 'macro') {
          if (p.position.distanceTo(new THREE.Vector3(0,0,0)) < 2.2) {
            hit = true; hitObj = macroCube;
          }
        } else if (curScale === 'lattice') {
          for (var a = 0; a < atoms.length; a++) {
            if (!atoms[a].visible) continue;
            if (p.position.distanceTo(atoms[a].position) < 0.35) {
              hit = true; hitObj = atoms[a]; break;
            }
          }
        } else if (curScale === 'cluster') {
          for (var a = 0; a < clusterAtoms.length; a++) {
            if (!clusterAtoms[a].visible) continue;
            if (p.position.distanceTo(clusterAtoms[a].position) < 0.35) {
              hit = true; hitObj = clusterAtoms[a]; break;
            }
          }
        } else {
          // bands / atom / spin — photon hits the nucleus/focus area
          if (p.position.distanceTo(new THREE.Vector3(0,0,0)) < 0.5) {
            hit = true; hitObj = nucleus || focusGroup;
          }
        }

        if (hit && hitObj) {
          handlePhotonInteraction(p, hitObj, i);
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
     PHOTON-ATOM INTERACTION  (absorption / reflection / transmission)
     Decision tree based on photon energy E_γ vs atomic transitions:
       E_γ < E_phonon   → transmission (no match)
       E_phonon ≤ E_γ < E_gap    → ABSORPTION + VIBRATION (phonon)
       E_gap ≤ E_γ < E_work    → ABSORPTION + EMISSION (electron excited, then relax)
       E_γ ≥ E_work           → ABSORPTION + IONIZATION (electron ejected)
     Also handles REFLECTION when E_γ doesn't match any allowed transition.
     ═══════════════════════════════════════════════════════════════ */
  function handlePhotonInteraction(photon, target, idx) {
    var E = photon.userData.energy;
    var color = photon.userData.color;
    var msg = document.getElementById('interaction-msg');

    // Decide interaction type
    var interaction = 'transmission';
    if (E < PHONON_EV) {
      interaction = 'transmission'; // energy too low for anything
    } else if (E < BANDGAP_SI) {
      interaction = 'absorb_vibrate'; // phonon absorption
    } else if (E < WORKFN_SI) {
      interaction = 'absorb_emit';  // interband excitation, then relax
    } else {
      interaction = 'absorb_ionize'; // photoelectric / photoionization
    }

    // Override by scale-specific physics
    if (curScale === 'macro') {
      // Bulk: transmission for E < E_gap, absorb for E ≥ E_gap
      if (E < BANDGAP_SI) interaction = 'transmission';
      else interaction = 'absorb_vibrate';
    } else if (curScale === 'bands' || curScale === 'atom' || curScale === 'spin') {
      // Atom: discrete levels — reflection if E doesn't match a transition
      // Simplified: E < gap → reflection (no transition available)
      if (E < BANDGAP_SI) interaction = 'reflect';
    }

    // Execute interaction
    switch (interaction) {

    case 'transmission':
      // Photon passes through — no visual change, just keep flying
      if (msg) msg.textContent = scaleLabel() + ': E_γ = ' + E.toFixed(2) +
        ' eV — transmission (no matching transition).';
      // Let photon continue (don't remove)
      break;

    case 'reflect':
      // Photon bounces back — reverse velocity
      if (msg) msg.textContent = scaleLabel() + ': E_γ = ' + E.toFixed(2) +
        ' eV < E_gap — reflected (no available transition).';
      photon.userData.velocity.negate();
      photon.userData.velocity.multiplyScalar(0.6); // loses energy on reflection
      photon.userData.state = 'reflected';
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
      if (msg) msg.innerHTML = scaleLabel() + ': <span style="color:#00f0ff">' +
        'Absorbed! e⁻ excited → will re-emit ' + E.toFixed(2) + ' eV photon</span>';
      exciteAndEmit(target, E, color);
      break;

    case 'absorb_ionize':
      // Photon absorbed → electron ejected (photoelectric / photoionization)
      scene.remove(photon);
      photons.splice(idx, 1);
      if (msg) msg.innerHTML = scaleLabel() + ': <span style="color:#ff4ecd">' +
        'Photoionization! e⁻ ejected by ' + E.toFixed(2) + ' eV photon</span>';
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
      clusterSprings.forEach(function(s){ s.k = Math.min(0.12 + E*0.04, 0.35); });
      clusterAtoms.forEach(function(a){
        a.userData.vel.add(new THREE.Vector3(
          (Math.random()-0.5)*boost*2,
          (Math.random()-0.5)*boost*2,
          (Math.random()-0.5)*boost*2
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
      if (msg2) msg2.innerHTML = scaleLabel() + ': <span style="color:#4ade80">' +
        'Re-emitted! ' + (E*0.98).toFixed(2) + ' eV photon (fluorescence)</span>';
    }, delayMs);
  }

  // ── ABSORB + IONIZE: photoelectric / photoionization ──
  function ionizeTarget(target, E) {
    emitElectron(target);
    if (curScale === 'macro') {
      macroCube.material.emissive.setHex(0xff4ecd);
      macroCube.material.emissiveIntensity = 0.4;
      setTimeout(function(){ macroCube.material.emissiveIntensity = 0; }, 800);
    }
    else if (curScale === 'lattice') {
      // Atom becomes ion (shrinks + turns pink briefly)
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
      bandPlanes.forEach(function(p){ p.scale.multiplyScalar(0.65); });
      setTimeout(function(){ bandPlanes.forEach(function(p){ p.scale.multiplyScalar(1/0.65); }); }, 700);
    }
    else if (curScale === 'atom') {
      valenceShells.forEach(function(s){ s.scale.multiplyScalar(0.55); });
      setTimeout(function(){ valenceShells.forEach(function(s){ s.scale.multiplyScalar(1/0.55); }); }, 900);
    }
    else if (curScale === 'spin') {
      spinLevels.forEach(function(s){ s.scale.multiplyScalar(0.6); });
      setTimeout(function(){ spinLevels.forEach(function(s){ s.scale.multiplyScalar(1/0.6); }); }, 700);
    }
  }

  function flashAtom(atom, colorHex, durationSec) {
    var orig = atom.material.color.getHex();
    atom.material.color.setHex(colorHex);
    atom.material.emissive.setHex(colorHex);
    atom.material.emissiveIntensity = 0.8;
    setTimeout(function(){
      atom.material.color.setHex(orig);
      atom.material.emissive.setHex(0x000000);
      atom.material.emissiveIntensity = 0;
    }, durationSec * 1000);
  }

  function exciteAtom(atom) {
    atom.material.emissive.setHex(0x00f0ff);
    atom.material.emissiveIntensity = 1.2;
    atom.userData.excited = true;
    excitedAtoms.push({ atom: atom, t0: time });

    // If in bands view, animate electron jumping to conduction band
    var conductionE = bandElectrons.filter(function(e){ return e.userData.type === 'conductionElectron'; });
    if (conductionE.length > 0 && curScale === 'bands') {
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

  function emitElectron(atom) {
    var geo = new THREE.SphereGeometry(0.07, 16, 16);
    var mat = new THREE.MeshBasicMaterial({ color: 0xff4ecd });
    var e = new THREE.Mesh(geo, mat);
    e.position.copy(atom.position);
    var dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, 1).normalize();
    e.userData = { velocity: dir.multiplyScalar(0.18), life: 120, type: 'freeElectron' };
    scene.add(e);
    photons.push(e);

    atom.material.transparent = true;
    atom.material.opacity = 0.6;
    setTimeout(function(){ atom.material.opacity = 0.95; }, 2000);
  }

  /* ═══════════════════════════════════════════════════════════════
     ANIMATION LOOP
     ═══════════════════════════════════════════════════════════════ */
  function animate() {
    animId = requestAnimationFrame(animate);
    time += 0.016;

    // Camera lerp
    currentCamZ += (targetCamZ - currentCamZ) * 0.04;
    currentFov += (targetFov - currentFov) * 0.04;
    camera.position.z = currentCamZ;
    camera.fov = currentFov;
    camera.updateProjectionMatrix();
    currentLookAt.lerp(targetLookAt, 0.04);
    camera.lookAt(currentLookAt);

    // Thermal vibration on lattice atoms
    var vib = Math.sin(time * 3) * thermalAmp;
    atoms.forEach(function(a){
      if (a.userData.basePos) {
        a.position.copy(a.userData.basePos).add(new THREE.Vector3(
          Math.sin(time * 4 + a.userData.idx) * vib,
          Math.cos(time * 3.7 + a.userData.idx) * vib,
          Math.sin(time * 3.3 + a.userData.idx * 0.5) * vib
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

    // Update lattice bonds
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

    // Animate lattice electrons (orbit their parent atoms with tilt)
    latticeElectrons.forEach(function(e){
      if (!e.visible) return;
      var d = e.userData;
      var atom = atoms[d.atomIdx];
      if (!atom || !atom.visible) return;
      d.angle += 0.012 * d.speed;
      // Orbit in XZ plane then tilt
      var x = Math.cos(d.angle) * d.orbitR;
      var z = Math.sin(d.angle) * d.orbitR;
      var y = 0;
      // tiltX rotation
      var rx = x * Math.cos(d.tiltX) - y * Math.sin(d.tiltX);
      var ry = x * Math.sin(d.tiltX) + y * Math.cos(d.tiltX);
      // tiltZ rotation
      var rz = z * Math.cos(d.tiltZ) - ry * Math.sin(d.tiltZ);
      ry = z * Math.sin(d.tiltZ) + ry * Math.cos(d.tiltZ);
      e.position.set(atom.position.x + rx,
                     atom.position.y + ry,
                     atom.position.z + rz);
    });

    // Update quantum clouds
    clouds.forEach(function(c){
      var a = atoms[c.userData.atomIdx];
      if (a) c.position.copy(a.position);
    });
    valenceClouds.forEach(function(vc){
      var b = bonds[vc.userData.bondIdx];
      if (b) vc.position.copy(b.position);
    });

    // Focus group follows focused lattice atom
    if (focusGroup && atoms[focusedAtomIndex]) {
      focusGroup.position.copy(atoms[focusedAtomIndex].position);
    }

    // Rotate macro cube
    if (macroCube && macroCube.visible) {
      macroCube.rotation.y = time * 0.08;
      macroCube.rotation.x = Math.sin(time * 0.04) * 0.08;
    }

    // Cluster spring dynamics: atoms pull on bonds, bonds pull back
    if (clusterAtoms[0] && clusterAtoms[0].visible) {
      var dt = 0.016;
      var damping = 0.92;
      // Accumulate spring forces on atoms
      var forces = [];
      for (var i = 0; i < clusterAtoms.length; i++) {
        forces.push(new THREE.Vector3(0, 0, 0));
      }
      clusterSprings.forEach(function(s){
        var a = clusterAtoms[s.atomA];
        var b = clusterAtoms[s.atomB];
        if (!a || !b) return;
        var dir = new THREE.Vector3().subVectors(b.position, a.position);
        var len = dir.length();
        dir.normalize();
        var f = (len - s.restLength) * s.k;
        var fa = dir.clone().multiplyScalar(f);
        var fb = dir.clone().multiplyScalar(-f);
        forces[s.atomA].add(fa);
        forces[s.atomB].add(fb);
      });
      // Apply forces + damping
      for (var i = 0; i < clusterAtoms.length; i++) {
        var atom = clusterAtoms[i];
        var v = atom.userData.vel;
        v.add(forces[i].multiplyScalar(dt));
        v.multiplyScalar(damping);
        atom.position.add(v.clone().multiplyScalar(dt));
        // Soft centering pull toward basePos to prevent drift
        var bp = atom.userData.basePos;
        var drift = new THREE.Vector3().subVectors(atom.position, bp);
        drift.multiplyScalar(0.005); // weak home force
        atom.position.sub(drift);
        v.sub(drift.multiplyScalar(0.5));
      }
      // Update bond meshes to match atom positions
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

    // Hanging electrons shuttle back and forth along center-to-corner bonds
    clusterElectrons.forEach(function(e){
      if (!e.visible) return;
      var d = e.userData;
      var h = d.hang;
      var bond = clusterBonds[h.bondIdx];
      if (!bond) return;
      var a = clusterAtoms[bond.userData.atomA];
      var b = clusterAtoms[bond.userData.atomB];
      if (!a || !b) return;
      d.baseAngle += dt * h.speed;
      var t = (Math.sin(d.baseAngle + h.phase) * h.amp + 1) * 0.5; // 0 → 1 along bond
      e.position.lerpVectors(a.position, b.position, t);
      // Perpendicular swing
      var perp = new THREE.Vector3(
        Math.cos(d.baseAngle * 3) * h.swing,
        Math.sin(d.baseAngle * 2.7) * h.swing,
        Math.cos(d.baseAngle * 2.1) * h.swing
      );
      e.position.add(perp);
    });

    // Band electrons orbit the nucleus (in focusGroup, so local coords)
    bandElectrons.forEach(function(e){
      if (!e.visible) return;
      var d = e.userData;
      if (d.type === 'bandElectron' || (d.type === 'conductionElectron' && d.active)) {
        d.baseAngle += 0.012 * d.speed;
        e.position.x = Math.cos(d.baseAngle) * d.orbitR;
        e.position.z = Math.sin(d.baseAngle) * d.orbitR;
      }
    });

    // Spin electrons orbit the nucleus + arrows follow them
    spinElectrons.forEach(function(e){
      if (!e.visible) return;
      var d = e.userData;
      if (d.type === 'spinElectron') {
        d.angle += 0.012 * d.speed;
        e.position.x = Math.cos(d.angle) * d.r;
        e.position.z = Math.sin(d.angle) * d.r;
      }
    });

    // Spin arrows follow their parent electrons
    spinArrows.forEach(function(arrow){
      if (!arrow.visible) return;
      var d = arrow.userData;
      if (d.type === 'spinArrow' && d.parent) {
        arrow.position.copy(d.parent.position);
        arrow.position.y += d.offset; // slight vertical offset
      }
    });

    // Photons & free electrons
    updatePhotons();
    photons.forEach(function(p){
      if (p.userData.type === 'freeElectron') {
        p.position.add(p.userData.velocity);
        p.userData.life--;
      }
    });
    photons = photons.filter(function(p){ return p.userData.life > 0; });

    // Cool down
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
})();

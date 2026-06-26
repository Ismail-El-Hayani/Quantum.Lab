/**
 * Hydrogen Atom — Physics Engine & 3D Renderer
 * Clean service module: zero dead UI code, zero orphaned DOM references.
 * Units: energy in eV, length in Bohr radii a₀.
 */

'use strict';

window.HydrogenLab = (function() {
  /* ---------- Constants ---------- */
  const Ryd_eV  = 13.6057;
  const a0_nm   = 0.0529;
  const a0_A    = 0.529;
  const hc_eVnm = 1239.84;
  const alpha   = 1 / 137.036;
  const muB_eV  = 5.788e-5;

  /* ---------- Math ---------- */
  function factorial(n) {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function laguerreAssoc(n, k, x) {
    if (n === 0) return 1.0;
    if (n === 1) return -x + k + 1;
    let L0 = 1.0, L1 = -x + k + 1, L2 = 0;
    for (let i = 1; i < n; i++) {
      L2 = ((2 * i + k + 1 - x) * L1 - (i + k) * L0) / (i + 1);
      L0 = L1; L1 = L2;
    }
    return L1;
  }

  /* ---------- Physics ---------- */
  function R_nl(n, l, r) {
    const rho = 2 * r / n;
    const norm = Math.sqrt(
      Math.pow(2 / n, 3) * factorial(n - l - 1) /
      (2 * n * factorial(n + l))
    );
    const L = laguerreAssoc(n - l - 1, 2 * l + 1, rho);
    return norm * Math.pow(rho, l) * Math.exp(-rho / 2) * L;
  }

  function P_radial(n, l, r) {
    const R = R_nl(n, l, r);
    return r * r * R * R;
  }

  function Y2_lm(l, m, theta, phi) {
    /* |Y_l^m(theta,phi)|^2 for real spherical harmonics.
       m is the magnetic quantum number (signed). Result is phi-independent
       in magnitude, but the nodal planes depend on m through P_l^m.
       For visualisation we use the magnitude squared.
       Returns a normalised probability density on the unit sphere. */
    const x = Math.cos(theta);
    const s = Math.sin(theta);
    const absM = Math.abs(m);
    if (absM > l) return 0;

    // Associated Legendre P_l^m(x) up to l=5 via explicit formulae (fast and exact)
    let P = 0;
    if (l === 0) {
      P = 1;
    } else if (l === 1) {
      if (absM === 0) P = x;
      else P = -s;
    } else if (l === 2) {
      if (absM === 0) P = 0.5 * (3 * x * x - 1);
      else if (absM === 1) P = -3 * x * s;
      else P = 3 * (1 - x * x);
    } else if (l === 3) {
      if (absM === 0) P = 0.5 * (5 * x * x * x - 3 * x);
      else if (absM === 1) P = -1.5 * (5 * x * x - 1) * s;
      else if (absM === 2) P = 15 * x * (1 - x * x);
      else P = -15 * Math.pow(1 - x * x, 1.5);
    } else if (l === 4) {
      const x2 = x * x;
      if (absM === 0) P = (35 * x2 * x2 - 30 * x2 + 3) / 8;
      else if (absM === 1) P = -2.5 * (7 * x2 * x - 3 * x) * s;
      else if (absM === 2) P = 7.5 * (7 * x2 - 1) * (1 - x2);
      else if (absM === 3) P = -105 * x * Math.pow(1 - x2, 1.5);
      else P = 105 * (1 - x2) * (1 - x2);
    } else if (l === 5) {
      const x2 = x * x;
      if (absM === 0) P = (63 * x2 * x2 * x - 70 * x2 * x + 15 * x) / 8;
      else if (absM === 1) P = -1.5 * (21 * x2 * x2 - 14 * x2 + 1) * s;
      else if (absM === 2) P = 52.5 * x * (3 * x2 - 1) * (1 - x2);
      else if (absM === 3) P = -52.5 * (9 * x2 - 1) * Math.pow(1 - x2, 1.5);
      else if (absM === 4) P = 945 * x * (1 - x2) * (1 - x2);
      else P = -945 * Math.pow(1 - x2, 2.5);
    }

    // Normalisation factor N_l^m
    const num = (2 * l + 1) * factorial(l - absM);
    const den = 4 * Math.PI * factorial(l + absM);
    const N2 = num / den;
    return N2 * P * P;
  }

  function psiProb(n, l, m, r, theta, phi) {
    const R = R_nl(n, l, r);
    return R * R * Y2_lm(l, m, theta, phi);
  }

  function Y2_l0(l, theta) {
    /* Fallback / m-averaged spherical harmonic: used only by older 2D plots. */
    const c = Math.cos(theta);
    if (l === 0) return 1 / (4 * Math.PI);
    if (l === 1) return (3 / (4 * Math.PI)) * c * c;
    if (l === 2) return (5 / (16 * Math.PI)) * Math.pow(3 * c * c - 1, 2);
    if (l === 3) return (7 / (16 * Math.PI)) * Math.pow(5 * c * c * c - 3 * c, 2);
    return 1 / (4 * Math.PI);
  }

  function rho2_xz(n, l, x, z) {
    const rr = Math.sqrt(x * x + z * z);
    if (rr < 0.001) return 0;
    const theta = Math.atan2(Math.sqrt(x * x), z);
    const R = R_nl(n, l, rr);
    const Y2 = Y2_l0(l, theta);
    return R * R * Y2;
  }

  function energy_eV(n) { return -Ryd_eV / (n * n); }

  function r_expectation(n, l) { return 0.5 * (3 * n * n - l * (l + 1)); }

  /* ---------- 3D Engine (Three.js) ---------- */
  const Hydrogen3D = (function() {
    let scene, camera, renderer, atomGroup, electronMesh, energyRingsGroup;
    let animId = null;
    let cloudMode = false;
    let stateRef = { n: 3, l: 1, m: 0 };
    let containerId = null;

    function init(cid) {
      const container = document.getElementById(cid);
      if (!container || typeof THREE === 'undefined') return false;
      containerId = cid;

      const stage = container.closest('.figure-stage') || container;
      const rect = stage.getBoundingClientRect();
      const w = Math.max(240, Math.round(rect.width));
      const h = Math.max(180, Math.round(rect.height));

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0x404040, 2));
      const point = new THREE.PointLight(0x00f0ff, 2, 100);
      point.position.set(10, 10, 10);
      scene.add(point);

      atomGroup = new THREE.Group();
      scene.add(atomGroup);

      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 32, 32),
        new THREE.MeshPhongMaterial({ color: 0xff4ecd, emissive: 0x330022 })
      );
      atomGroup.add(nucleus);

      energyRingsGroup = new THREE.Group();
      atomGroup.add(energyRingsGroup);

      camera.position.z = 22;

      _animate();

      window.addEventListener('resize', _onResize);
      return true;
    }

    function _onResize() {
      const container = document.getElementById(containerId);
      if (!container || !camera || !renderer) return;
      const stage = container.closest('.figure-stage') || container;
      const rect = stage.getBoundingClientRect();
      const w = Math.max(240, Math.round(rect.width));
      const h = Math.max(180, Math.round(rect.height));
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
    }

    function resize() {
      _onResize();
    }

    function update(state) {
      if (!atomGroup) return;
      stateRef = state || stateRef;
      _buildScene();
    }

    function setCloudMode(enabled) {
      cloudMode = !!enabled;
      if (atomGroup) _buildScene();
    }

    function _clearElectron() {
      if (electronMesh) {
        atomGroup.remove(electronMesh);
        if (electronMesh.geometry) electronMesh.geometry.dispose();
        if (electronMesh.material) electronMesh.material.dispose();
        electronMesh = null;
      }
    }

    function _buildScene() {
      _clearElectron();
      if (energyRingsGroup) energyRingsGroup.clear();

      const n = stateRef.n || 1;
      const l = stateRef.l || 0;
      const m = (typeof stateRef.m === 'number') ? stateRef.m : 0;

      if (cloudMode) {
        _buildQuantumCloud(n, l, m);
      } else {
        _buildRingsAndElectron(n, l);
      }
    }

    function _buildRingsAndElectron(n, l) {
      /* Bohr-orbit rings: legend says yellow, so draw them yellow.
         Active n is highlighted cyan to match the "Electron" legend. */
      for (let i = 1; i <= 6; i++) {
        const r = r_expectation(i, 0) * 0.5;
        const isActive = (i === n);
        const geom = new THREE.TorusGeometry(r, isActive ? 0.025 : 0.015, 16, 100);
        const mat = new THREE.MeshBasicMaterial({
          color: isActive ? 0x00f0ff : 0xfacc15,
          transparent: true,
          opacity: isActive ? 0.9 : 0.45
        });
        const ring = new THREE.Mesh(geom, mat);
        ring.rotation.x = Math.PI / (l + 1);
        ring.rotation.y = (l * Math.PI) / 4;
        energyRingsGroup.add(ring);
      }

      const radius = r_expectation(n, l) * 0.5;
      const geom = new THREE.SphereGeometry(0.18, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      electronMesh = new THREE.Mesh(geom, mat);
      electronMesh.userData = {
        radius: radius,
        speed: 1.0 / n,
        tiltX: Math.PI / (l + 1),
        tiltY: (l * Math.PI) / 4
      };
      atomGroup.add(electronMesh);
    }

    function _buildQuantumCloud(n, l, m) {
      /* Rejection-sampled point cloud from the real hydrogen probability density
         |ψ_nlm(r,θ,φ)|² = |R_nl(r)|² · |Y_l^m(θ,φ)|².
         Points are coloured by radial shell so nodal structure is visible. */
      const count = 5000;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const rMax = Math.max(15, 4 * r_expectation(n, l));

      // Estimate peak probability by scanning a coarse grid.
      let pMax = 0;
      for (let i = 0; i <= 80; i++) {
        const r = (i / 80) * rMax;
        const R2 = P_radial(n, l, r) / (r * r + 1e-9);
        for (let j = 0; j <= 20; j++) {
          const theta = (j / 20) * Math.PI;
          const p = R2 * Y2_lm(l, m, theta, 0);
          if (p > pMax) pMax = p;
        }
      }
      if (pMax <= 0) pMax = 1e-6;

      let accepted = 0;
      let attempts = 0;
      const maxAttempts = count * 80;
      while (accepted < count && attempts < maxAttempts) {
        attempts++;
        const r = Math.pow(Math.random(), 1.0 / 3.0) * rMax;
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * 2 * Math.PI;
        const p = psiProb(n, l, m, r, theta, phi);
        if (Math.random() * pMax > p) continue;

        const idx = accepted * 3;
        positions[idx]     = r * Math.sin(theta) * Math.cos(phi);
        positions[idx + 1] = r * Math.cos(theta);
        positions[idx + 2] = r * Math.sin(theta) * Math.sin(phi);

        // Colour by radius: core = purple, mid = cyan, outer = gold
        const t = r / rMax;
        if (t < 0.33) {
          colors[idx] = 0.75 + 0.25 * t; colors[idx + 1] = 0.2; colors[idx + 2] = 1.0;
        } else if (t < 0.66) {
          colors[idx] = 0.0; colors[idx + 1] = 0.8 + 0.2 * t; colors[idx + 2] = 1.0;
        } else {
          colors[idx] = 1.0; colors[idx + 1] = 0.85 - 0.35 * t; colors[idx + 2] = 0.3;
        }
        accepted++;
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const mat = new THREE.PointsMaterial({
        size: 0.09, transparent: true, opacity: 0.55, vertexColors: true,
        sizeAttenuation: true, blending: THREE.AdditiveBlending
      });
      electronMesh = new THREE.Points(geom, mat);
      atomGroup.add(electronMesh);
    }

    function _animate() {
      animId = requestAnimationFrame(_animate);
      const time = Date.now() * 0.002;

      if (electronMesh && !cloudMode) {
        const ud = electronMesh.userData;
        if (ud && ud.radius) {
          const angle = time * ud.speed;
          const pos = new THREE.Vector3(
            Math.cos(angle) * ud.radius,
            Math.sin(angle) * ud.radius,
            0
          );
          pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), ud.tiltX);
          pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), ud.tiltY);
          electronMesh.position.copy(pos);
        }
      }

      if (atomGroup) atomGroup.rotation.y += 0.002;
      if (renderer && scene && camera) renderer.render(scene, camera);
    }

    function dispose() {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', _onResize);
      if (renderer) renderer.dispose();
    }

    return { init, update, setCloudMode, resize, dispose };
  })();

  /* ================================================================
     Re-export safe public helpers so hydrogen_apps_games.js works.
     ================================================================ */
  return {
    R_nl: R_nl,
    P_radial: P_radial,
    energy_eV: energy_eV,
    r_expectation: r_expectation,
    Hydrogen3D: Hydrogen3D
  };

})();

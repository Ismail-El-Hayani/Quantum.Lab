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

  function Y2_l0(l, theta) {
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
    let stateRef = { n: 3, l: 1 };
    let containerId = null;

    function init(cid) {
      const container = document.getElementById(cid);
      if (!container || typeof THREE === 'undefined') return false;
      containerId = cid;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
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
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function update(state) {
      if (!atomGroup) return;
      stateRef = state || stateRef;
      _buildScene();
    }

    function setCloudMode(enabled) {
      cloudMode = !!enabled;
      _buildScene();
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

      if (cloudMode) {
        _buildCloud(n, l);
      } else {
        _buildRingsAndElectron(n, l);
      }
    }

    function _buildRingsAndElectron(n, l) {
      for (let i = 1; i <= 6; i++) {
        const r = r_expectation(i, 0) * 0.5;
        const isActive = (i === n);
        const geom = new THREE.TorusGeometry(r, 0.02, 16, 100);
        const mat = new THREE.MeshBasicMaterial({
          color: isActive ? 0x00f0ff : 0x222244,
          transparent: true,
          opacity: isActive ? 0.8 : 0.2
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

    function _buildCloud(n, l) {
      const count = 3000;
      const positions = new Float32Array(count * 3);
      const radius = r_expectation(n, l) * 0.4;
      const spread = 0.2 + 0.15 * n;

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const rDist = radius * (1 + (Math.random() - 0.5) * spread);
        positions[i * 3]     = rDist * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = rDist * Math.cos(phi);
        positions[i * 3 + 2] = rDist * Math.sin(phi) * Math.sin(theta);
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: 0x00f0ff, size: 0.05, transparent: true, opacity: 0.6
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

    return { init, update, setCloudMode, dispose };
  })();

  /* ---------- Public API ---------- */
  return {
    Ryd_eV, a0_nm, a0_A, hc_eVnm, alpha, muB_eV,
    factorial, laguerreAssoc,
    R_nl, P_radial, Y2_l0, rho2_xz,
    energy_eV, r_expectation,
    Hydrogen3D
  };
})();
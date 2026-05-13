/**
 * Hydrogen Atom — Physics Engine
 * Exact analytical radial wavefunctions via associated Laguerre recurrence.
 * Units: energy in eV, length in Bohr radii a₀ (labeled explicitly).
 */

'use strict';

// ============ CONSTANTS ============
const Ryd_eV   = 13.6057;
const a0_nm    = 0.0529;
const a0_A     = 0.529;
const hc_eVnm  = 1239.84;
const alpha    = 1/137.036;
const muB_eV   = 5.788e-5;

// ============ MATH PRIMITIVES ============
function factorial(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function laguerreAssoc(n, k, x) {
  if (n === 0) return 1.0;
  if (n === 1) return -x + k + 1;
  let L0 = 1.0;
  let L1 = -x + k + 1;
  let L2 = 0;
  for (let i = 1; i < n; i++) {
    L2 = ((2*i + k + 1 - x) * L1 - (i + k) * L0) / (i + 1);
    L0 = L1; L1 = L2;
  }
  return L1;
}

// ============ PHYSICS FUNCTIONS ============
function R_nl(n, l, r) {
  const rho = 2 * r / n;
  const norm = Math.sqrt(
    Math.pow(2/n, 3) * factorial(n - l - 1) /
    (2 * n * factorial(n + l))
  );
  const L = laguerreAssoc(n - l - 1, 2*l + 1, rho);
  return norm * Math.pow(rho, l) * Math.exp(-rho/2) * L;
}

function P_radial(n, l, r) {
  const R = R_nl(n, l, r);
  return r * r * R * R;
}

function Y2_l0(l, theta) {
  const c = Math.cos(theta);
  if (l === 0) return 1 / (4 * Math.PI);
  if (l === 1) return (3 / (4 * Math.PI)) * c * c;
  if (l === 2) return (5 / (16 * Math.PI)) * Math.pow(3*c*c - 1, 2);
  if (l === 3) return (7 / (16 * Math.PI)) * Math.pow(5*c*c*c - 3*c, 2);
  return 1 / (4 * Math.PI);
}

function rho2_xz(n, l, x, z) {
  const r = Math.sqrt(x*x + z*z);
  if (r < 0.001) return 0;
  const theta = Math.atan2(Math.sqrt(x*x), z);
  const R = R_nl(n, l, r);
  const Y2 = Y2_l0(l, theta);
  return R * R * Y2;
}

function energy_eV(n) {
  return -Ryd_eV / (n * n);
}

function r_expectation(n, l) {
  return 0.5 * (3*n*n - l*(l+1));
}

// ============ STATE ============
let state = {
  n: 3,
  l: 1,
  rMax: 30,
  ni: 3,
  nf: 2,
  Bfield: 0
};

const rArr = [];
for (let v = 0; v <= 600; v++) rArr.push(v * 30 / 600);

// ============ PLOTTING ============
const PLOT_CFG = { responsive: true, displayModeBar: false };

function layout(title, xtitle, ytitle, extra) {
  const base = {
    margin: { t: 25, r: 10, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    hovermode: 'x unified'
  };
  return Object.assign(base, extra || {});
}

function _plot(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}

// ===== A. PLAYGROUND PLOTS =====
function plotRadial() {
  const R = rArr.map(r => R_nl(state.n, state.l, r));
  const P = rArr.map(r => P_radial(state.n, state.l, r));
  const rexp = r_expectation(state.n, state.l);

  _plot('plot-radial', [
    {
      x: rArr,
      y: P,
      mode: 'lines',
      name: 'r²|R|²',
      line: { color: '#ff4ecd', width: 2.5 },
      fill: 'tozeroy',
      fillcolor: 'rgba(255,78,205,0.10)'
    },
    {
      x: [rexp, rexp],
      y: [0, Math.max(...P) * 1.1],
      mode: 'lines',
      name: '⟨r⟩ = ' + rexp.toFixed(2) + ' a₀',
      line: { color: '#00f0ff', width: 1.5, dash: 'dash' }
    }
  ], layout(null, 'r (a₀)', 'Radial probability r²|R|² (a₀⁻¹)', {
    xaxis: { title: 'r (a₀)', range: [0, state.rMax] }
  }), PLOT_CFG);
}

function plotWavefunction() {
  if (!document.getElementById('plot-wave')) return;
  const R = rArr.map(r => R_nl(state.n, state.l, r));
  const V = rArr.map(r => -2/r);

  _plot('plot-wave', [
    { x: rArr, y: R, mode: 'lines', name: 'R_' + state.n + state.lLabel() + '(r)',
      line: { color: '#00f0ff', width: 2 } },
    { x: rArr, y: V, mode: 'lines', name: 'V(r)', yaxis: 'y2',
      line: { color: 'rgba(255,255,255,0.2)', width: 1.5 } }
  ], layout(null, 'r (a₀)', 'R(r)', {
    yaxis2: { title: 'V(r) (Ha)', overlaying: 'y', side: 'right', color: '#505070', gridcolor: '#1a1a28' }
  }), PLOT_CFG);
}

function plotCrossSection() {
  const nx = 80, nz = 80;
  const zMax = 20, xMax = 10;
  const z = [], x = [], psi2 = [];
  for (let i = 0; i < nz; i++) z.push(-zMax + 2*zMax*i/(nz-1));
  for (let j = 0; j < nx; j++) x.push(-xMax + 2*xMax*j/(nx-1));

  for (let i = 0; i < nz; i++) {
    const row = [];
    for (let j = 0; j < nx; j++) {
      const v = rho2_xz(state.n, state.l, x[j], z[i]);
      row.push(v > 0 ? Math.log10(v + 1e-12) : -12);
    }
    psi2.push(row);
  }

  _plot('plot-cross', [{
    x: x, y: z, z: psi2,
    type: 'heatmap',
    colorscale: [
      [0, 'rgba(0,0,0,0)'], [0.15, '#1a0a2e'], [0.35, '#4a0080'],
      [0.55, '#c084fc'], [0.75, '#00f0ff'], [1, '#ffffff']
    ],
    showscale: false,
    zsmooth: false
  }], {
    margin: { t: 20, r: 10, b: 40, l: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: 'x (a₀)', color: '#505070', gridcolor: '#1a1a28' },
    yaxis: { title: 'z (a₀)', color: '#505070', gridcolor: '#1a1a28', scaleanchor: 'x' }
  }, PLOT_CFG);
}

function plotEnergyLevels() {
  const traces = [];
  const Elist = [];
  for (let n = 1; n <= 8; n++) Elist.push(energy_eV(n));

  for (let n = 1; n <= 8; n++) {
    const E = energy_eV(n);
    const degen = n * n;
    traces.push({
      x: [0, 1], y: [E, E],
      mode: 'lines',
      line: { color: n === state.n ? '#00f0ff' : '#3a3a55', width: n === state.n ? 3 : 1.5 },
      showlegend: false,
      hoverinfo: 'y+name',
      name: 'n=' + n + ', E=' + E.toFixed(3) + ' eV'
    });
    traces.push({
      x: [1.05], y: [E],
      mode: 'text',
      text: ['n=' + n + ' (' + degen + ')'],
      textposition: 'middle left',
      textfont: { color: n === state.n ? '#00f0ff' : '#505070', size: 10, family: 'JetBrains Mono, monospace' },
      showlegend: false,
      hoverinfo: 'skip'
    });
  }

  const Ei = energy_eV(state.ni);
  const Ef = energy_eV(state.nf);
  traces.push({
    x: [0.5, 0.5], y: [Ef, Ei],
    mode: 'lines+markers',
    line: { color: '#ffd740', width: 2 },
    marker: { size: 8, color: '#ffd740' },
    showlegend: false,
    hoverinfo: 'skip'
  });

  _plot('plot-levels', traces, {
    margin: { t: 20, r: 80, b: 40, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { visible: false, range: [-0.2, 1.8] },
    yaxis: { title: 'E (eV)', color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    hovermode: 'y'
  }, PLOT_CFG);
}

// ===== C. APPLICATION MINI-SIMS =====
function plotSpectrumSeries() {
  const series = [
    { nf: 1, name: 'Lyman', color: '#c084fc', vis: 'UV' },
    { nf: 2, name: 'Balmer', color: '#4ade80', vis: 'Visible' },
    { nf: 3, name: 'Paschen', color: '#ff4ecd', vis: 'IR' }
  ];
  const traces = [];

  series.forEach((s, idx) => {
    const lam = [];
    const intens = [];
    for (let ni = s.nf + 1; ni <= 8; ni++) {
      const dE = Ryd_eV * (1/(s.nf*s.nf) - 1/(ni*ni));
      const lnm = hc_eVnm / dE;
      lam.push(lnm);
      intens.push(1);
      for (let w = -0.3; w <= 0.3; w += 0.05) {
        lam.push(lnm + w);
        intens.push(0.9 * Math.exp(-w*w/0.02));
      }
    }
    traces.push({
      x: lam, y: intens,
      mode: 'lines',
      name: s.name + ' (' + s.vis + ')',
      line: { color: s.color, width: 2 },
      fill: 'tozeroy',
      fillcolor: s.color + '18'
    });
  });

  _plot('plot-spectrum', traces, {
    margin: { t: 20, r: 10, b: 50, l: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: 'Wavelength λ (nm)', color: '#505070', gridcolor: '#1a1a28' },
    yaxis: { visible: false },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 }
  }, PLOT_CFG);
}

function plotSizeScaling() {
  const nvals = [];
  const rvals = [];
  for (let n = 1; n <= 8; n++) {
    nvals.push(n);
    rvals.push(r_expectation(n, 0));
  }
  _plot('plot-size', [
    { x: nvals, y: rvals, mode: 'lines+markers', name: '⟨r⟩ (l=0)',
      line: { color: '#00f0ff', width: 2 }, marker: { size: 8, color: '#00f0ff' } },
    { x: nvals, y: nvals.map(n => n*n), mode: 'lines', name: 'n² a₀',
      line: { color: 'rgba(255,255,255,0.2)', width: 1.5, dash: 'dot' } }
  ], layout(null, 'Principal quantum number n', '⟨r⟩ (a₀)'), PLOT_CFG);
}

function plotFineStructure() {
  const n = 2;
  const E0 = energy_eV(n);
  const alpha2 = alpha * alpha;
  const shift = E0 * alpha2 / n;

  const levels = [
    { name: '2S₁/₂', E: E0 + shift * (1 - 3/(4*n)) },
    { name: '2P₁/₂', E: E0 + shift * (1/2 - 3/(4*n)) },
    { name: '2P₃/₂', E: E0 + shift * (1 - 3/(4*n)) }
  ];
  levels[0].E += 4.37e-6;

  const traces = [];
  levels.forEach((lv, i) => {
    traces.push({
      x: [0, 1], y: [lv.E, lv.E],
      mode: 'lines',
      line: { color: ['#00f0ff', '#c084fc', '#ff4ecd'][i], width: 3 },
      name: lv.name + '  ' + (lv.E*1000).toFixed(3) + ' meV',
      showlegend: true
    });
  });

  traces.push({
    x: [0.5, 0.5], y: [levels[1].E, levels[0].E],
    mode: 'lines+markers',
    line: { color: '#ffd740', width: 2 },
    marker: { size: 6, color: '#ffd740' },
    showlegend: false,
    hoverinfo: 'skip'
  });

  _plot('plot-fine', traces, {
    margin: { t: 25, r: 10, b: 40, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { visible: false, range: [-0.2, 1.2] },
    yaxis: { title: 'E (eV)', color: '#505070', gridcolor: '#1a1a28' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a3a3a', borderwidth: 1 }
  }, PLOT_CFG);
}

function plotZeeman() {
  const B = state.Bfield;
  const n = 2, l = 1;
  const E0 = energy_eV(n);
  const mvals = [-1, 0, 1];
  const traces = [];

  mvals.forEach((ml, idx) => {
    const E = E0 + ml * muB_eV * B;
    traces.push({
      x: [0, 1], y: [E, E],
      mode: 'lines',
      line: { color: ['#ff4ecd', '#c084fc', '#00f0ff'][idx], width: 3 },
      name: 'm_l = ' + ml + '  ΔE = ' + (ml * muB_eV * B * 1000).toFixed(2) + ' meV',
      showlegend: true
    });
  });

  _plot('plot-zeeman', traces, {
    margin: { t: 25, r: 10, b: 40, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { visible: false, range: [-0.2, 1.2] },
    yaxis: { title: 'E (eV)', color: '#505070', gridcolor: '#1a1a28' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 }
  }, PLOT_CFG);
}

function updateTransitionInfo() {
  const Ei = energy_eV(state.ni);
  const Ef = energy_eV(state.nf);
  const dE = Math.abs(Ef - Ei);
  const lam = hc_eVnm / dE;

  let series = '';
  if (state.nf === 1) series = 'Lyman series (UV)';
  else if (state.nf === 2) series = 'Balmer series (Visible)';
  else if (state.nf === 3) series = 'Paschen series (IR)';
  else if (state.nf === 4) series = 'Brackett series (IR)';
  else series = 'Higher series (Far-IR)';

  var te = document.getElementById('trans-energy');
  if (te) te.textContent = dE.toFixed(4) + ' eV';
  var tl = document.getElementById('trans-lambda');
  if (tl) tl.textContent = lam.toFixed(2) + ' nm';
  var ts = document.getElementById('trans-series');
  if (ts) ts.textContent = series;
  var tt = document.getElementById('trans-type');
  if (tt) tt.textContent = state.ni > state.nf ? 'Emission (photon released)' : 'Absorption (photon absorbed)';
}

function updateLiveTable() {
  const E = energy_eV(state.n);
  const rexp = r_expectation(state.n, state.l);

  var ln = document.getElementById('live-n');
  if (ln) ln.textContent = state.n;
  var ll = document.getElementById('live-l');
  if (ll) ll.textContent = state.l;
  var le = document.getElementById('live-E');
  if (le) le.textContent = E.toFixed(4) + ' eV';
  var lr = document.getElementById('live-r');
  if (lr) lr.textContent = rexp.toFixed(2) + ' a₀ = ' + (rexp * a0_nm).toFixed(4) + ' nm = ' + (rexp * a0_A).toFixed(3) + ' Å';
  var li = document.getElementById('live-ion');
  if (li) li.textContent = Math.abs(E).toFixed(4) + ' eV';
  var ld = document.getElementById('live-degen');
  if (ld) ld.textContent = (state.n * state.n);

  plotEnergyLevels();
  updateTransitionInfo();
}

// String helper
state.lLabel = function() {
  const labels = ['s', 'p', 'd', 'f', 'g'];
  return labels[this.l] || 'l' + this.l;
};

// ============ INIT ============
function initHydrogen() {
  var sliderN = document.getElementById('slider-n');
  var sliderL = document.getElementById('slider-l');
  var sliderNi = document.getElementById('slider-ni');
  var sliderNf = document.getElementById('slider-nf');
  var sliderB = document.getElementById('slider-B');

  if (sliderN) {
    sliderN.addEventListener('input', function() {
      state.n = parseInt(this.value);
      var valn = document.getElementById('val-n');
      if (valn) valn.textContent = state.n;
      if (sliderL) sliderL.max = String(state.n - 1);
      if (state.l >= state.n) {
        state.l = state.n - 1;
        if (sliderL) sliderL.value = String(state.l);
        var vall = document.getElementById('val-l');
        if (vall) vall.textContent = state.l;
      }
      plotRadial(); plotCrossSection(); updateLiveTable();
    });
  }

  if (sliderL) {
    sliderL.addEventListener('input', function() {
      state.l = parseInt(this.value);
      var vall = document.getElementById('val-l');
      if (vall) vall.textContent = state.l;
      plotRadial(); plotCrossSection(); updateLiveTable();
    });
  }

  if (sliderNi) {
    sliderNi.addEventListener('input', function() {
      state.ni = parseInt(this.value);
      var valni = document.getElementById('val-ni');
      if (valni) valni.textContent = state.ni;
      if (state.ni <= state.nf) {
        state.nf = state.ni - 1;
        if (sliderNf) sliderNf.value = String(state.nf);
        var valnf = document.getElementById('val-nf');
        if (valnf) valnf.textContent = state.nf;
      }
      updateLiveTable();
    });
  }

  if (sliderNf) {
    sliderNf.addEventListener('input', function() {
      state.nf = parseInt(this.value);
      var valnf = document.getElementById('val-nf');
      if (valnf) valnf.textContent = state.nf;
      if (state.nf >= state.ni) {
        state.ni = state.nf + 1;
        if (sliderNi) sliderNi.value = String(state.ni);
        var valni = document.getElementById('val-ni');
        if (valni) valni.textContent = state.ni;
      }
      updateLiveTable();
    });
  }

  if (sliderB) {
    sliderB.addEventListener('input', function() {
      state.Bfield = parseFloat(this.value);
      var valB = document.getElementById('val-B');
      if (valB) valB.textContent = state.Bfield.toFixed(2);
      plotZeeman();
    });
  }

  plotRadial(); plotCrossSection(); plotEnergyLevels();
  plotSpectrumSeries(); plotSizeScaling(); plotFineStructure(); plotZeeman();
  updateLiveTable();
}

window.initHydrogen = initHydrogen;








// ============ 3D SIMULATION (Three.js) ============
let scene, camera, renderer, atomGroup;
let electronMesh;
let energyRingsGroup;

function init3DSimulation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0x00f0ff, 2, 100);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  atomGroup = new THREE.Group();
  scene.add(atomGroup);

  // Nucleus
  const nucleusGeom = new THREE.SphereGeometry(0.4, 32, 32);
  const nucleusMat = new THREE.MeshPhongMaterial({ color: 0xff4ecd, emissive: 0x330022 });
  const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
  atomGroup.add(nucleus);

  energyRingsGroup = new THREE.Group();
  atomGroup.add(energyRingsGroup);

  camera.position.z = 22;
  animate3D();
}

function update3DOrbital() {
  if (showWavefunction) { renderCloud(state.n, state.l); return; }
  if (!atomGroup) return;
  
  // Clear electron and rings
  if (electronMesh) atomGroup.remove(electronMesh);
  energyRingsGroup.clear();

  const n = state.n;
  const l = state.l;
  
  // CREATE ENERGY LEVEL PREDICTION RINGS (n=1 to 6)
  for (let i = 1; i <= 6; i++) {
    const r = r_expectation(i, 0) * 0.5; // Base Bohr radius for scaling
    const isActive = (i === n);
    
    const ringGeom = new THREE.TorusGeometry(r, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: isActive ? 0x00f0ff : 0x222244, 
      transparent: true, 
      opacity: isActive ? 0.8 : 0.2
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    
    // Set initial tilt for all rings based on current l
    ring.rotation.x = Math.PI / (l + 1);
    ring.rotation.y = (l * Math.PI) / 4;
    
    energyRingsGroup.add(ring);
  }

  // CREATE MOVING ELECTRON
  const currentRadius = r_expectation(n, l) * 0.5;
  const electronGeom = new THREE.SphereGeometry(0.18, 16, 16);
  const electronMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  electronMesh = new THREE.Mesh(electronGeom, electronMat);
  
  atomGroup.add(electronMesh);
}

function animate3D() {
  requestAnimationFrame(animate3D);
  
  const time = Date.now() * 0.002;
    if (electronMesh) {
      if (!showWavefunction) {
        const n = state.n;
        const l = state.l;
        const radius = r_expectation(n, l) * 0.5;
        const speed = 1.0 / n;
        const angle = time * speed;
        
        const tiltX = Math.PI / (l + 1);
        const tiltY = (l * Math.PI) / 4;
        
        let pos = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), tiltX);
        pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), tiltY);
        
        electronMesh.position.copy(pos);
      } else {
        electronMesh.rotation.y += 0.005;
      }
    }

  if (atomGroup) {
    atomGroup.rotation.y += 0.002;
  }
  if (renderer) renderer.render(scene, camera);
}

function link3DControls() {
    const sliderN = document.getElementById('slider-h2-n');
    const sliderL = document.getElementById('slider-h2-l');
    const valN = document.getElementById('val-h2-n');
    const valL = document.getElementById('val-h2-l');

    if(sliderN) {
        sliderN.oninput = function() {
            state.n = parseInt(this.value);
            if(valN) valN.textContent = state.n;
            update3DOrbital();
            plotRadial(); 
            updateLiveTable();
        };
    }
    if(sliderL) {
        sliderL.oninput = function() {
            state.l = parseInt(this.value);
            if(valL) valL.textContent = state.l;
            update3DOrbital();
            plotRadial(); 
            updateLiveTable();
        };
    }
}

// BOOTSTRAP
setTimeout(() => {
    try {
        initHydrogen(); 
        init3DSimulation('canvas-3d');
        update3DOrbital();
        link3DControls();
    } catch(e) {
        console.error("Hydrogen Lab Boot Error: ", e);
    }
}, 200);


// Wavefunction State
let showWavefunction = false;

function toggleWavefunctionView() {
    showWavefunction = !showWavefunction;
    const btn = document.getElementById('btn-reveal-wf');
    if(btn) {
        btn.textContent = showWavefunction ? '🎯 Back to Bohr' : '🌌 Reveal Wavefunction';
        btn.style.background = showWavefunction ? 'var(--accent-cyan)' : 'var(--accent-purple)';
    }
    update3DOrbital();
}


function renderCloud(n, l) {
    if (electronMesh) atomGroup.remove(electronMesh);
    energyRingsGroup.clear();

    const pointsCount = 3000;
    const positions = new Float32Array(pointsCount * 3);
    const radius = r_expectation(n, l) * 0.4; // Scale for visualization

    for (let i = 0; i < pointsCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        // Probability density approx: more points near the Bohr radius
        const rDist = radius * (1 + (Math.random() - 0.5) * 0.4);
        
        positions[i * 3] = rDist * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = rDist * Math.cos(phi);
        positions[i * 3 + 2] = rDist * Math.sin(phi) * Math.sin(theta);
    }

    const pointsGeom = new THREE.BufferGeometry();
    pointsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({ 
        color: 0x00f0ff, 
        size: 0.05, 
        transparent: true, 
        opacity: 0.6 
    });
    electronMesh = new THREE.Points(pointsGeom, pointsMat);
    atomGroup.add(electronMesh);
}

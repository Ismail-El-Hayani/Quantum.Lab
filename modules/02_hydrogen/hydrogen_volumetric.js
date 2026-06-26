/* ===== Volumetric Isosurface Engine (ported from qho_sim_new.js) ===== */
'use strict';

function factorial(n) {

  let r = 1;

  for (let i = 2; i <= n; i++) r *= i;

  return r;

}


function assocLaguerre(n, k, x) {

  if (n === 0) return 1;

  if (n === 1) return -x + k + 1;

  let L0 = 1, L1 = -x + k + 1, L2;

  for (let j = 1; j < n; j++) { L2 = ((2 * j + k + 1 - x) * L1 - (j + k) * L0) / (j + 1); L0 = L1; L1 = L2; }

  return L1;

}


function R_nl_exact_plotly(n, l, r) {
  if (r < 1e-6) return l === 0 ? 2 * Math.pow(1 / n, 1.5) : 0;
  const rho = 2 * r / n;
  const norm = Math.sqrt(
    Math.pow(2 / n, 3) * factorial(n - l - 1) / (2 * n * factorial(n + l))
  );
  const lag = assocLaguerre(n - l - 1, 2 * l + 1, rho);
  return norm * Math.pow(rho, l) * Math.exp(-rho / 2) * lag;
}



function Y2_lm(l, m, theta, phi) {

  const c = Math.cos(theta), s = Math.sin(theta);

  // l = 0, s

  if (l === 0) return 1 / (4 * Math.PI);



  // l = 1, p

  if (l === 1) {

    if (m === 0) return (3 / (4 * Math.PI)) * c * c;                 // pz

    if (Math.abs(m) === 1) return (3 / (8 * Math.PI)) * s * s;        // px, py  (m=±1 real combo)

  }



  // l = 2, d

  if (l === 2) {

    if (m === 0) return (5 / (16 * Math.PI)) * Math.pow(3 * c * c - 1, 2);                    // dz²

    if (Math.abs(m) === 1) return (15 / (8 * Math.PI)) * s * s * c * c;                       // dxz, dyz

    if (Math.abs(m) === 2) return (15 / (32 * Math.PI)) * Math.pow(s, 4);                       // dx²-y², dxy  (average over φ)

  }



  // l = 3, f

  if (l === 3) {

    if (m === 0)       return (7 / (16 * Math.PI)) * Math.pow(5 * c * c * c - 3 * c, 2);                          // f_z³

    if (Math.abs(m) === 1) return (21 / (64 * Math.PI)) * s * s * Math.pow(5 * c * c - 1, 2) * ((m > 0) ? Math.pow(Math.cos(phi), 2) : Math.pow(Math.sin(phi), 2)); // f_xz², f_yz²

    if (Math.abs(m) === 2) return (105 / (32 * Math.PI)) * Math.pow(s, 4) * c * c * ((m > 0) ? Math.pow(Math.cos(2 * phi), 2) : Math.pow(Math.sin(2 * phi), 2)); // f_z(x²−y²), f_xyz

    if (Math.abs(m) === 3) return (35 / (64 * Math.PI)) * Math.pow(s, 6) * ((m > 0) ? Math.pow(Math.cos(3 * phi), 2) : Math.pow(Math.sin(3 * phi), 2)); // f_x³, f_y³

  }



  // l = 4, g  (approximate real-spherical-harmonic squared, averaged over φ)

  if (l === 4) {

    if (m === 0) return (9 / (256 * Math.PI)) * Math.pow(35 * Math.pow(c,4) - 30 * c * c + 3, 2);

    if (Math.abs(m) === 1) return (45 / (64 * Math.PI)) * s * s * Math.pow(7 * Math.pow(c,3) - 3 * c, 2);

    if (Math.abs(m) === 2) return (45 / (128 * Math.PI)) * Math.pow(s,4) * Math.pow(7 * c * c - 1, 2);

    if (Math.abs(m) === 3) return (315 / (64 * Math.PI)) * Math.pow(s,6) * c * c;

    if (Math.abs(m) === 4) return (315 / (256 * Math.PI)) * Math.pow(s,8);

  }



  return 1 / (4 * Math.PI);

}


function orbitalLabel(l) {

  return ['s', 'p', 'd', 'f', 'g', 'h'][l] || '?';

}


function energy_Hydrogen_eV(n) {

  return -13.6057 / (n * n);

}


function countNodes(n, l) {

  return { radial: n - l - 1, angular: l, total: n - 1 };

}


function updateAtomPlot() {
  const container = document.getElementById('plot-volumetric');
  if (!container) return;
  // Ensure declaration exists (was stripped when comment removed)
  if (typeof __atomPlotRenderScheduled === 'undefined') window.__atomPlotRenderScheduled = false;

  // Guard against zero-dimension WebGL initialization — defer one frame
  const w = container.offsetWidth;
  const h = container.offsetHeight;
  if ((w === 0 || h === 0) && !__atomPlotRenderScheduled) {
    __atomPlotRenderScheduled = true;
    requestAnimationFrame(() => {
      __atomPlotRenderScheduled = false;
      updateAtomPlot();
    });
    return;
  }
  __atomPlotRenderScheduled = false;

  const n = Number.parseInt(document.getElementById('val-atom-n').textContent) || 1;
  const l = Number.parseInt(document.getElementById('val-atom-l').textContent) || 0;
  const m = Number.parseInt(document.getElementById('val-atom-m').textContent) || 0;

  // Grid: explicit integer resolution × range, derive step precisely
  const res = l >= 3 ? 36 : 32;          // number of steps along each axis
  const gridMax = Math.max(12, 5 * n);   // half-width of cube in a₀

  const x = [], y = [], z = [], val = [];
  const dx = (2 * gridMax) / (res - 1);  // exact spacing

  for (let ix = 0; ix < res; ix++) {
    const xx = -gridMax + ix * dx;
    for (let iy = 0; iy < res; iy++) {
      const yy = -gridMax + iy * dx;
      for (let iz = 0; iz < res; iz++) {
        const zz = -gridMax + iz * dx;
        const r2 = xx * xx + yy * yy + zz * zz;
        const r = Math.sqrt(r2);
        if (r < 1e-4) {
          x.push(xx); y.push(yy); z.push(zz); val.push(0);
          continue;
        }
        const theta = Math.acos(Math.max(-1, Math.min(1, zz / r)));
        const phi = Math.atan2(yy, xx);

        const R = R_nl_exact_plotly(n, l, r);
        const Y2 = Y2_lm(l, m, theta, phi);
        const density = R * R * Y2;

        x.push(xx); y.push(yy); z.push(zz); val.push(density);
      }
    }
  }

  // ── Iso-surface data ──
  const maxVal = Math.max(...val.map(v => Number.isFinite(v) ? v : 0), 1e-12);
  const isoVal = maxVal * 0.12;

  // ── Scatter/cloud backup data (density-sampled points) ──
  const sx = [], sy = [], sz = [], sc = [];
  const threshold = maxVal * 0.035;
  for (let i = 0; i < val.length; i++) {
    if (val[i] >= threshold) {
      sx.push(x[i]); sy.push(y[i]); sz.push(z[i]); sc.push(val[i] / maxVal);
    }
  }
  // Subsample if too dense for scatter3d
  if (sx.length > 25000) {
    const step = Math.ceil(sx.length / 25000);
    const tmpX=[], tmpY=[], tmpZ=[], tmpC=[];
    for (let i = 0; i < sx.length; i += step) {
      tmpX.push(sx[i]); tmpY.push(sy[i]); tmpZ.push(sz[i]); tmpC.push(sc[i]);
    }
    sx.length = 0; sy.length = 0; sz.length = 0; sc.length = 0;
    sx.push(...tmpX); sy.push(...tmpY); sz.push(...tmpZ); sc.push(...tmpC);
  }

  const traceIso = {
    type: 'isosurface',
    x: x, y: y, z: z, value: val,
    isomin: isoVal, isomax: maxVal,
    surface: { count: 1 },
    opacity: 0.22,
    colorscale: 'Viridis',
    caps: { x: { show: false }, y: { show: false }, z: { show: false } },
    showscale: false,
    hoverinfo: 'skip',
    name: 'Iso-surface (12% of peak)',
    visible: (typeof window.atomCloudMode === 'undefined' || window.atomCloudMode === 'iso')
  };

  const traceCloud = {
    type: 'scatter3d',
    mode: 'markers',
    x: sx, y: sy, z: sz,
    marker: {
      size: 1.8,
      color: sc,
      colorscale: 'Viridis',
      opacity: 0.45,
      line: { width: 0 },
      colorbar: { title: { text: '|ψ|² / max', font: { size: 10, color: '#e0e0f0' } }, thickness: 15 }
    },
    hoverinfo: 'skip',
    name: 'Probability cloud',
    visible: (window.atomCloudMode === 'cloud')
  };

  _plot('plot-volumetric', [traceCloud, traceIso], {
    title: {
      text: `Hydrogen Atom 3D — |${n}${orbitalLabel(l)}, m=${m}⟩<br><sub>Eₙ = ${energy_Hydrogen_eV(n).toFixed(3)} eV | radial nodes: ${countNodes(n,l).radial} | angular nodes: ${countNodes(n,l).angular}</sub>`,
      font: { size: 13, color: '#e0e0f0' }
    },
    scene: {
      xaxis: { title: 'x (a₀)', gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55', showbackground: false },
      yaxis: { title: 'y (a₀)', gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55', showbackground: false },
      zaxis: { title: 'z (a₀)', gridcolor: '#2a2a3a', zerolinecolor: '#3a3a55', showbackground: false },
      camera: { eye: { x: 1.4, y: 1.2, z: 1.3 } },
      aspectmode: 'cube'
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e0e0f0', family: 'JetBrains Mono, monospace' },
    margin: { l: 0, r: 0, b: 0, t: 50 },
    showlegend: false,
    legend: { x: 0.01, y: 0.99, bgcolor: 'rgba(10,10,15,0.85)', font: { color: '#e0e0e0' }, bordercolor: '#2a2a3a', borderwidth: 1 }
  });

  // ── Update legend panel ──
  updateAtomLegend(n, l, m);
}


function updateAtomLegend(n, l, m) {

  const nodes = countNodes(n, l);

  const label = orbitalLabel(l);

  const E = energy_Hydrogen_eV(n);

  const mSign = m > 0 ? '+' : '';



  const legendHTML = `

    <div class="atom-legend-card">

      <div class="atom-legend-row">

        <span class="atom-legend-label">State</span>

        <span class="atom-legend-value">|${n}${label}, m=${mSign}${m}⟩</span>

      </div>

      <div class="atom-legend-row">

        <span class="atom-legend-label">Energy</span>

        <span class="atom-legend-value">${E.toFixed(3)} eV</span>

      </div>

      <div class="atom-legend-row">

        <span class="atom-legend-label">Radial nodes</span>

        <span class="atom-legend-value">${nodes.radial}</span>

      </div>

      <div class="atom-legend-row">

        <span class="atom-legend-label">Angular nodes</span>

        <span class="atom-legend-value">${nodes.angular}</span>

      </div>

      <div class="atom-legend-row">

        <span class="atom-legend-label">Total nodes</span>

        <span class="atom-legend-value">${nodes.total}</span>

      </div>

      <div class="atom-legend-row">

        <span class="atom-legend-label">Degeneracy</span>

        <span class="atom-legend-value">n² = ${n * n}</span>

      </div>

    </div>

  `;



  const legendEl = document.getElementById('atom-legend');

  if (legendEl) legendEl.innerHTML = legendHTML;

}


function validateAtomQuantumNumbers() {

    const nEl = document.getElementById('val-atom-n');

    const lEl = document.getElementById('val-atom-l');

    const mEl = document.getElementById('val-atom-m');

    if (!nEl || !lEl || !mEl) return;

    let n = Number.parseInt(nEl.textContent) || 1;

    let l = Number.parseInt(lEl.textContent) || 0;

    let m = Number.parseInt(mEl.textContent) || 0;

    // Clamp l to [0, n-1]

    if (l >= n) {

        l = n - 1;

        document.getElementById('slider-atom-l').value = l;

        lEl.textContent = l;

    }

    // Clamp m to [-l, l]

    if (m < -l) { m = -l; document.getElementById('slider-atom-m').value = m; mEl.textContent = m; }

    if (m > l)  { m = l;  document.getElementById('slider-atom-m').value = m; mEl.textContent = m; }

    return { n, l, m };

}


/* Global toggle used by buttons */
window.atomCloudMode = 'iso';

/* Convenience init on DOM ready */
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('plot-volumetric')) updateAtomPlot();
});
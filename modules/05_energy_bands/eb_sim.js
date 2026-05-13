/**
 * Energy Bands & Density of States — Physics Engine (v2.5)
 * Enhanced with Material-Symmetry mapping and Carbon Allotropes.
 */

'use strict';

let state = {
  dim: '3D',
  t: 1.0,
  eps: 0.0,
  Emax: 6,
};

const EB_MATERIALS = {
  'Cu': { dim: '3D', t: 1.2, eps: 0.0, label: 'Copper (Bulk)' },
  'Si': { dim: '3D', t: 0.8, eps: 0.5, label: 'Silicon (SC)' },
  'Diamond': { dim: '3D', t: 2.5, eps: 1.5, label: 'Diamond (Ins)' },
  'Graphene': { dim: 'graphene', t: 2.8, eps: 0.0, label: 'Graphene' },
  'Graphite': { dim: '2D', t: 2.8, eps: 0.0, label: 'Graphite' },
  'CNT': { dim: '1D', t: 3.0, eps: 0.0, label: 'Carbon Nanotube' },
  'Fullerene': { dim: '0D', t: 2.0, eps: 0.0, label: 'C60 Fullerene' }
};

// Physics
function band1D(k) { return state.eps + 2 * state.t * Math.cos(k); }
function band2D(kx, ky) { return state.eps + 2 * state.t * (Math.cos(kx) + Math.cos(ky)); }
function band3D(kx, ky, kz) { return state.eps + 2 * state.t * (Math.cos(kx) + Math.cos(ky) + Math.cos(kz)); }
function bandGraphene(kx, ky) {
  const delta = [[1, 0], [-0.5, Math.sqrt(3)/2], [-0.5, -Math.sqrt(3)/2]];
  let f_re = 0, f_im = 0;
  for (let d of delta) {
    const kdot = kx * d[0] + ky * d[1];
    f_re += Math.cos(kdot); f_im += Math.sin(kdot);
  }
  const f_mag = Math.sqrt(f_re * f_re + f_im * f_im);
  return [state.t * f_mag + state.eps, -state.t * f_mag + state.eps];
}

function computeDOS(dim, N) {
  const E = [], dos = [];
  const dE = state.Emax / 200;
  for (let e = -state.Emax; e <= state.Emax; e += dE) { E.push(e); dos.push(0); }
  
  let count = 0;
  const dk = Math.PI / N;
  
  if (dim === '1D' || dim === 'CNT') {
    for (let k = -Math.PI; k <= Math.PI; k += dk) {
      const e = band1D(k);
      const idx = Math.floor((e + state.Emax) / dE);
      if (idx >= 0 && idx < dos.length) dos[idx] += 1;
      count++;
    }
  } else if (dim === '2D' || dim === 'Graphite') {
    for (let kx = -Math.PI; kx <= Math.PI; kx += dk) {
      for (let ky = -Math.PI; ky <= Math.PI; ky += dk) {
        const e = band2D(kx, ky);
        const idx = Math.floor((e + state.Emax) / dE);
        if (idx >= 0 && idx < dos.length) dos[idx] += 1;
        count++;
      }
    }
  } else if (dim === '3D' || (dim !== 'graphene' && dim !== '0D')) {
    for (let kx = -Math.PI; kx <= Math.PI; kx += dk) {
      for (let ky = -Math.PI; ky <= Math.PI; ky += dk) {
        for (let kz = -Math.PI; kz <= Math.PI; kz += dk) {
          const e = band3D(kx, ky, kz);
          const idx = Math.floor((e + state.Emax) / dE);
          if (idx >= 0 && idx < dos.length) dos[idx] += 1;
          count++;
        }
      }
    }
  } else if (dim === 'graphene') {
    for (let kx = -Math.PI; kx <= Math.PI; kx += dk) {
      for (let ky = -Math.PI; ky <= Math.PI; ky += dk) {
        const bands = bandGraphene(kx, ky);
        for (let e of bands) {
          const idx = Math.floor((e + state.Emax) / dE);
          if (idx >= 0 && idx < dos.length) dos[idx] += 1;
        }
        count += 2;
      }
    }
  } else if (dim === '0D') {
    // Fullerene: Discrete spikes (delta functions)
    for (let e = -state.Emax; e <= state.Emax; e += dE) {
      const spikes = [0.1, -0.1, 0.5, -0.5];
      spikes.forEach(s => {
        if (Math.abs(e - s) < dE/2) dos[Math.floor((e + state.Emax) / dE)] += 5;
      });
    }
    count = 1; 
  }
  
  return { E, dos: dos.map(d => d / (count * dE)) };
}

function _plot(id, traces, lay, cfg) {
  if (document.getElementById(id)) Plotly.react(id, traces, lay, cfg);
}

const PLOT_CFG = { responsive: true, displayModeBar: false };
function layout(title, xtitle, ytitle, extra) {
  return Object.assign({
    margin: { t: 25, r: 10, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: xtitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    yaxis: { title: ytitle, color: '#505070', gridcolor: '#1a1a28', zerolinecolor: '#2a2a3a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    hovermode: 'x unified'
  }, extra || {});
}

function plotBandStructure() {
  const k = [], E_cond = [], E_val = [];
  let labels = [], positions = [];
  
  if (state.dim === '1D' || state.dim === 'CNT') {
    for (let ki = -Math.PI; ki <= Math.PI; ki += 0.02) {
      k.push(ki); E_cond.push(band1D(ki));
    }
    labels = ['-π/a', '0', 'π/a']; positions = [-Math.PI, 0, Math.PI];
  } else if (state.dim === '2D' || state.dim === 'Graphite') {
    const path = [{k: [0,0], label: 'Γ'}, {k: [Math.PI,0], label: 'X'}, {k: [Math.PI,Math.PI], label: 'M'}, {k: [0,0], label: 'Γ'}];
    let s = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const N = 50;
      const k1 = path[i].k, k2 = path[i+1].k;
      for (let j = 0; j < N; j++) {
        const frac = j / N;
        const kx = k1[0] + frac * (k2[0] - k1[0]);
        const ky = k1[1] + frac * (k2[1] - k1[1]);
        k.push(s + frac); E_cond.push(band2D(kx, ky));
      }
      labels.push(path[i].label); positions.push(s); s += 1;
    }
    labels.push('Γ'); positions.push(s);
  } else if (state.dim === 'graphene') {
    const path = [{k: [0,0], label: 'Γ'}, {k: [Math.PI, -Math.PI/Math.sqrt(3)], label: 'M'}, {k: [4*Math.PI/3, 0], label: 'K'}, {k: [0,0], label: 'Γ'}];
    let s = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const N = 60;
      const k1 = path[i].k, k2 = path[i+1].k;
      for (let j = 0; j < N; j++) {
        const frac = j / N;
        const kx = k1[0] + frac * (k2[0] - k1[0]);
        const ky = k1[1] + frac * (k2[1] - k1[1]);
        const bands = bandGraphene(kx, ky);
        k.push(s + frac); E_cond.push(bands[0]); E_val.push(bands[1]);
      }
      labels.push(path[i].label); positions.push(s); s += 1;
    }
    labels.push('Γ'); positions.push(s);
  } else if (state.dim === '0D') {
     // discrete levels for Fullerene
     const levels = [-0.5, -0.1, 0.1, 0.5];
     k.push(0, 0, 0, 0); E_cond.push(...levels);
     labels = ['k=0']; positions = [0];
  } else {
    for (let ki = 0; ki <= Math.PI * Math.sqrt(3); ki += 0.02) {
      const f = ki / (Math.PI * Math.sqrt(3));
      k.push(ki); E_cond.push(band3D(f * Math.PI, f * Math.PI, f * Math.PI));
    }
  }
  
  const traces = [{ x: k, y: E_cond, mode: 'lines', name: 'CB', line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.05)' }];
  if (E_val.length > 0) {
    traces.push({ x: k, y: E_val, mode: 'lines', name: 'VB', line: { color: '#ff4ecd', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(255,78,205,0.05)' });
  }
  
  const lay = layout(null, 'k-path', 'E (eV)');
  if (labels.length > 0) { lay.xaxis.tickvals = positions; lay.xaxis.ticktext = labels; }
  _plot('plot-band-structure', traces, lay, PLOT_CFG);
}

function plotDOS() {
  const result = computeDOS(state.dim, state.dim === '3D' ? 20 : 40);
  _plot('plot-dos-playground', [{ x: result.E, y: result.dos, mode: 'lines', name: 'g(E)', line: { color: '#c084fc', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(179,136,255,0.08)' }], layout(null, 'E (eV)', 'DOS (arb. units)'), PLOT_CFG);
}

function plotARPES() {
  const kx = []; const E = []; const intensity = [];
  const dE = 0.05; const dk = 0.05; const T = 300; const kB = 8.617e-5; const hw = 21.2;
  for (let ki = -Math.PI; ki <= Math.PI; ki += dk) {
    for (let ei = -state.Emax; ei <= state.Emax; ei += dE) {
      let e_band;
      if (state.dim === '1D' || state.dim === 'CNT') e_band = band1D(ki);
      else if (state.dim === '2D' || state.dim === 'Graphite') e_band = band2D(ki, 0);
      else if (state.dim === 'graphene') {
        const b = bandGraphene(ki, 0); e_band = b[0];
      } else e_band = band3D(ki, 0, 0);
      const sigma = 0.1;
      const delta = Math.exp(-Math.pow(ei - e_band, 2) / (2 * sigma * sigma));
      const f = 1 / (1 + Math.exp((ei - 0) / (kB * T)));
      const probe = ei < hw ? 1 : 0;
      const I = delta * f * probe;
      if (I > 0.01) { kx.push(ki); E.push(ei); intensity.push(I); }
    }
  }
  _plot('plot-arpes-main', [{ type: 'scatter', mode: 'markers', x: kx, y: E, marker: { size: 3, color: intensity, colorscale: [[0, 'rgba(0,0,0,0)'], [0.5, '#c084fc'], [1, '#00f0ff']], showscale: false, opacity: 0.7 }, hovertemplate: 'k: %{x:.2f}<br>E: %{y:.2f} eV' }], layout(null, 'k (π/a)', 'E - E_F (eV)'), PLOT_CFG);
}

function updateLiveTable() {
  const dimEl = document.getElementById('live-dim');
  const tEl = document.getElementById('live-t');
  const bwEl = document.getElementById('live-bw');
  if (dimEl) dimEl.textContent = state.dim === '0D' ? '0D (Quantum Dot)' : state.dim;
  if (tEl) tEl.textContent = state.t.toFixed(2) + ' eV';
  if (bwEl) bwEl.textContent = (4 * state.t).toFixed(2) + ' eV';
}

function renderLattice() {
  const canvas = document.getElementById('lattice-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  
  const atomRadius = 4;
  const bondColor = 'rgba(0, 240, 255, 0.3)';
  const atomColor = '#fff';

  if (state.dim === '1D' || state.dim === 'CNT') {
    const spacing = 50;
    const startX = (w - (5 * spacing)) / 2;
    const y = h / 2;
    for (let i = 0; i < 6; i++) {
      const x = startX + i * spacing;
      ctx.beginPath(); ctx.arc(x, y, atomRadius, 0, Math.PI * 2);
      ctx.fillStyle = atomColor; ctx.fill();
      if (i < 5) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(startX + (i+1)*spacing, y);
        ctx.strokeStyle = bondColor; ctx.lineWidth = 2; ctx.stroke();
      }
    }
  } else if (state.dim === '2D' || state.dim === 'Graphite') {
    const spacing = 40;
    const offset = 20;
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 8; j++) {
        const x = offset + i * spacing;
        const y = offset + j * spacing;
        ctx.beginPath(); ctx.arc(x, y, atomRadius, 0, Math.PI * 2);
        ctx.fillStyle = atomColor; ctx.fill();
        if (i < 6) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + spacing, y);
          ctx.strokeStyle = bondColor; ctx.lineWidth = 1; ctx.stroke();
        }
        if (j < 7) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + spacing);
          ctx.strokeStyle = bondColor; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
  } else if (state.dim === 'graphene') {
    const a = 30;
    const offsetX = 50, offsetY = 50;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const x = offsetX + i * a * 1.5;
        const y1 = offsetY + j * a * Math.sqrt(3);
        const y2 = y1 + a * Math.sqrt(3)/2;
        ctx.beginPath(); ctx.arc(x, y1, atomRadius, 0, Math.PI * 2);
        ctx.fillStyle = atomColor; ctx.fill();
        ctx.beginPath(); ctx.arc(x + a*0.75, y2, atomRadius, 0, Math.PI * 2);
        ctx.fillStyle = atomColor; ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x + a*0.75, y2);
        ctx.strokeStyle = bondColor; ctx.stroke();
      }
    }
  } else if (state.dim === '0D') {
    // Fullerene-like cluster
    const cx = w/2, cy = h/2, r = 50;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath(); ctx.arc(x, y, atomRadius, 0, Math.PI * 2);
      ctx.fillStyle = atomColor; ctx.fill();
      // Bonds to neighbors
      const nextA = (i + 1) * Math.PI * 2 / 12;
      ctx.beginPath(); ctx.moveTo(x, y); 
      ctx.lineTo(cx + r * Math.cos(nextA), cy + r * Math.sin(nextA));
      ctx.strokeStyle = bondColor; ctx.stroke();
    }
  } else {
    const s = 40;
    const cx = w/2, cy = h/2;
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        for (let z = -2; z <= 2; z++) {
          const px = cx + (x - y) * s * 0.8;
          const py = cy + (x + y) * s * 0.4 - z * s;
          ctx.beginPath(); ctx.arc(px, py, atomRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill();
        }
      }
    }
  }
}

function setEBMaterial(name) {
  const mat = EB_MATERIALS[name];
  if (!mat) return;
  
  state.dim = mat.dim; 
  state.t = mat.t; 
  state.eps = mat.eps; 
  
  const sliderT = document.getElementById('slider-t');
  const valT = document.getElementById('val-t');
  const sliderEps = document.getElementById('slider-eps');
  const valEps = document.getElementById('val-eps');
  if (sliderT) sliderT.value = state.t;
  if (valT) valT.textContent = state.t.toFixed(1);
  if (sliderEps) sliderEps.value = state.eps;
  if (valEps) valEps.textContent = state.eps.toFixed(1);
  
  document.querySelectorAll('.dim-btn').forEach(b => b.classList.remove('active'));
  const btnId = 'dim-' + (state.dim === 'graphene' ? 'dirac' : (state.dim === '0D' ? '1d' : state.dim.toLowerCase()));
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');

  plotBandStructure(); plotDOS(); plotARPES(); updateLiveTable(); renderLattice();
}

function initEB() {
  const sliderT = document.getElementById('slider-t');
  const sliderEps = document.getElementById('slider-eps');
  if (sliderT) {
    sliderT.addEventListener('input', function() {
      state.t = parseFloat(this.value);
      document.getElementById('val-t').textContent = state.t.toFixed(1);
      plotBandStructure(); plotDOS(); plotARPES(); updateLiveTable();
    });
  }
  if (sliderEps) {
    sliderEps.addEventListener('input', function() {
      state.eps = parseFloat(this.value);
      document.getElementById('val-eps').textContent = state.eps.toFixed(1);
      plotBandStructure(); plotDOS(); plotARPES(); updateLiveTable();
    });
  }
  plotBandStructure(); plotDOS(); plotARPES(); updateLiveTable(); renderLattice();
}

window.setEBDim = function(dim) {
  state.dim = dim;
  document.querySelectorAll('.dim-btn').forEach(b => b.classList.remove('active'));
  const btnId = 'dim-' + (dim === 'graphene' ? 'dirac' : (dim === '0D' ? '1d' : dim.toLowerCase()));
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');
  plotBandStructure(); plotDOS(); plotARPES(); updateLiveTable(); renderLattice();
};

window.setEBMaterial = setEBMaterial;
window.initEB = initEB;
window.state = state; 
initEB();

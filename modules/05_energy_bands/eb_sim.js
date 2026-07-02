/**
 * Energy Bands & Density of States — Physics Engine (v3.0)
 * CB/VB pair model with tunable gap + symmetric Brillouin-zone paths.
 */
'use strict';

let state = {
  dim: '3D',
  t: 1.0,
  eps: 0.0,
  gap: 0.0,
  Emax: 6,
};

const EB_MATERIALS = {
  'Cu':       { dim: '3D',       t: 1.2, eps: 0.0, gap: 0.0,  label: 'Copper (Bulk)' },
  'Si':       { dim: '3D',       t: 0.8, eps: 0.0, gap: 1.12, label: 'Silicon (SC)' },
  'Diamond':  { dim: '3D',       t: 2.5, eps: 0.0, gap: 5.5,  label: 'Diamond (Ins)' },
  'Graphene': { dim: 'graphene', t: 2.8, eps: 0.0, gap: 0.0,  label: 'Graphene' },
  'Graphite': { dim: '2D',       t: 2.8, eps: 0.0, gap: 0.0,  label: 'Graphite' },
  'CNT':      { dim: '1D',       t: 3.0, eps: 0.0, gap: 0.5,  label: 'Carbon Nanotube' },
  'Fullerene':{ dim: '0D',       t: 2.0, eps: 0.0, gap: 1.9,  label: 'C60 Fullerene' }
};

/* ====== CB / VB  tight-binding-like bands ====== */
//  CB : parabolic minimum at Gamma, rises with |k|
function cb1D(k)  { return state.eps + state.gap/2 + 2*state.t*(1 - Math.cos(k)); }
function cb2D(kx, ky) { return state.eps + state.gap/2 + 2*state.t*(2 - Math.cos(kx) - Math.cos(ky)); }
function cb3D(kx, ky, kz) { return state.eps + state.gap/2 + 2*state.t*(3 - Math.cos(kx) - Math.cos(ky) - Math.cos(kz)); }

//  VB : mirror maximum at Gamma, falls with |k|
function vb1D(k)  { return state.eps - state.gap/2 - 2*state.t*(1 - Math.cos(k)); }
function vb2D(kx, ky) { return state.eps - state.gap/2 - 2*state.t*(2 - Math.cos(kx) - Math.cos(ky)); }
function vb3D(kx, ky, kz) { return state.eps - state.gap/2 - 2*state.t*(3 - Math.cos(kx) - Math.cos(ky) - Math.cos(kz)); }

// Graphene Dirac pair (always gapless here)
function bandGraphene(kx, ky) {
  const delta = [[1, 0], [-0.5, Math.sqrt(3)/2], [-0.5, -Math.sqrt(3)/2]];
  let f_re = 0, f_im = 0;
  for (let d of delta) {
    const kdot = kx * d[0] + ky * d[1];
    f_re += Math.cos(kdot); f_im += Math.sin(kdot);
  }
  const f_mag = Math.sqrt(f_re*f_re + f_im*f_im);
  return [state.t * f_mag + state.eps, -state.t * f_mag + state.eps];
}

function getEmax() {
  const t = state.t, eps = state.eps, gap = state.gap;
  if (state.dim === '0D') return Math.max(3, gap + 1);
  let z;
  if (state.dim === '1D' || state.dim === 'CNT') z = 1;
  else if (state.dim === '2D' || state.dim === 'Graphite') z = 2;
  else if (state.dim === '3D') z = 3;
  else if (state.dim === 'graphene') z = 1.5;
  else z = 0;
  return Math.max(6, 2*t*z + Math.abs(eps) + gap/2 + 1);
}

function getViewYRange() {
  let half;
  if (state.dim === '1D' || state.dim === 'CNT') half = state.gap/2 + 4*state.t + 0.5;
  else if (state.dim === '2D' || state.dim === 'Graphite') half = state.gap/2 + 8*state.t + 0.5;
  else if (state.dim === '3D') half = state.gap/2 + 4*state.t + 0.5;
  else if (state.dim === 'graphene') half = state.t + state.gap/2 + 0.5;
  else if (state.dim === '0D') half = state.gap/2 + 1.0;
  else half = 3;
  return Math.min(6, Math.max(half, 1.0));
}

/* ====== DOS ====== */
function computeDOS(dim, N) {
  const E = [], dos = [];
  const Emax = getEmax();
  const dE = Emax / 200;
  for (let e = -Emax; e <= Emax; e += dE) { E.push(e); dos.push(0); }

  let count = 0;
  const dk = Math.PI / N;

  function bin(e) {
    const idx = Math.floor((e + Emax) / dE);
    if (idx >= 0 && idx < dos.length) dos[idx] += 1;
  }

  if (dim === '1D' || dim === 'CNT') {
    for (let k = -Math.PI; k <= Math.PI; k += dk) { bin(cb1D(k)); bin(vb1D(k)); count += 2; }
  } else if (dim === '2D' || dim === 'Graphite') {
    for (let kx = -Math.PI; kx <= Math.PI; kx += dk) {
      for (let ky = -Math.PI; ky <= Math.PI; ky += dk) { bin(cb2D(kx, ky)); bin(vb2D(kx, ky)); count += 2; }
    }
  } else if (dim === '3D' || (dim !== 'graphene' && dim !== '0D')) {
    for (let kx = -Math.PI; kx <= Math.PI; kx += dk)
      for (let ky = -Math.PI; ky <= Math.PI; ky += dk)
        for (let kz = -Math.PI; kz <= Math.PI; kz += dk)
        { bin(cb3D(kx, ky, kz)); bin(vb3D(kx, ky, kz)); count += 2; }
  } else if (dim === 'graphene') {
    for (let kx = -Math.PI; kx <= Math.PI; kx += dk)
      for (let ky = -Math.PI; ky <= Math.PI; ky += dk) {
        const bands = bandGraphene(kx, ky);
        for (let e of bands) bin(e);
        count += 2;
      }
  } else if (dim === '0D') {
    // Fullerene : discrete spikes
    const spikes = [state.eps+0.1, state.eps-0.1, state.eps+0.5, state.eps-0.5];
    for (let e = -Emax; e <= Emax; e += dE)
      for (let s of spikes)
        if (Math.abs(e - s) < dE/2) dos[Math.floor((e + Emax)/dE)] += 5;
    count = 1;
  }

  return { E, dos: dos.map(d => d / (count * dE)) };
}

/* ====== helpers ====== */
const PLOT_CFG = { responsive: true, displayModeBar: true, scrollZoom: true };

function layout(title, xtitle, ytitle, extra) {
  const base = {
    margin: { t: 25, r: 10, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#b0b0d0', size: 11 },
    xaxis: { title: { text: xtitle, font: { color: '#a0a0c0' } },
             color: '#a0a0c0', gridcolor: '#1a1a28', zerolinecolor: '#3a3a5a' },
    yaxis: { title: { text: ytitle, font: { color: '#a0a0c0' } },
             color: '#a0a0c0', gridcolor: '#1a1a28', zerolinecolor: '#3a3a5a' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.9)', bordercolor: '#3a3a5a',
              borderwidth: 1, font: { color: '#d0d0e0', size: 12 } },
    hovermode: 'x unified'
  };
  if (extra) {
    if (extra.xaxis) Object.assign(base.xaxis, extra.xaxis);
    if (extra.yaxis) Object.assign(base.yaxis, extra.yaxis);
    const { xaxis, yaxis, ...rest } = extra;
    Object.assign(base, rest);
  }
  return base;
}

/* ====== Band-structure plot ====== */
function plotBandStructure() {
  const k = [], E_cond = [], E_val = [];
  let labels = [], positions = [];

  if (state.dim === '1D' || state.dim === 'CNT') {
    for (let ki = -2*Math.PI; ki <= 2*Math.PI; ki += 0.02) { k.push(ki); E_cond.push(cb1D(ki)); E_val.push(vb1D(ki)); }
    labels = ['-2π/a', '-π/a', '0', 'π/a', '2π/a']; positions = [-2*Math.PI, -Math.PI, 0, Math.PI, 2*Math.PI];
  } else if (state.dim === '2D' || state.dim === 'Graphite') {
    const path = [{k:[0,0], label:'Γ'}, {k:[Math.PI,0], label:'X'}, {k:[Math.PI,Math.PI], label:'M'}, {k:[0,0], label:'Γ'}];
    let s = 0;
    for (let i = 0; i < path.length-1; i++) {
      const N = 50;
      for (let j = 0; j < N; j++) {
        const f = j/N;
        const kx = path[i].k[0] + f*(path[i+1].k[0]-path[i].k[0]);
        const ky = path[i].k[1] + f*(path[i+1].k[1]-path[i].k[1]);
        k.push(s + f); E_cond.push(cb2D(kx, ky)); E_val.push(vb2D(kx, ky));
      }
      labels.push(path[i].label); positions.push(s); s += 1;
    }
    labels.push('Γ'); positions.push(s);
  } else if (state.dim === 'graphene') {
    const path = [{k:[0,0], label:'Γ'}, {k:[Math.PI,-Math.PI/Math.sqrt(3)], label:'M'}, {k:[4*Math.PI/3,0], label:'K'}, {k:[0,0], label:'Γ'}];
    let s = 0;
    for (let i = 0; i < path.length-1; i++) {
      const N = 60;
      for (let j = 0; j < N; j++) {
        const f = j/N;
        const kx = path[i].k[0] + f*(path[i+1].k[0]-path[i].k[0]);
        const ky = path[i].k[1] + f*(path[i+1].k[1]-path[i].k[1]);
        const bands = bandGraphene(kx, ky);
        k.push(s + f); E_cond.push(bands[0]); E_val.push(bands[1]);
      }
      labels.push(path[i].label); positions.push(s); s += 1;
    }
    labels.push('Γ'); positions.push(s);
  } else if (state.dim === '0D') {
    // discrete levels for Fullerene
    const vbLevels = [state.eps - state.gap/2 - 0.5, state.eps - state.gap/2 - 0.1];
    const cbLevels = [state.eps + state.gap/2 + 0.1, state.eps + state.gap/2 + 0.5];
    for (let v of vbLevels) { k.push(0, 0.05); E_val.push(v, v); }
    for (let v of cbLevels) { k.push(0, 0.05); E_cond.push(v, v); }
    labels = ['k=0']; positions = [0];
  } else { // 3D
    for (let ki = -Math.PI; ki <= Math.PI; ki += 0.02) { k.push(ki); E_cond.push(cb3D(ki,0,0)); E_val.push(vb3D(ki,0,0)); }
    labels = ['-π/a', '0', 'π/a']; positions = [-Math.PI, 0, Math.PI];
  }

  const Emax = getEmax();
  const half = getViewYRange();
  const traces = [
    { x: k, y: E_cond, mode: 'lines', name: 'CB',  line: { color: '#00f0ff', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(0,240,255,0.05)' },
    { x: k, y: E_val, mode: 'lines', name: 'VB',  line: { color: '#ff4ecd', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(255,78,205,0.05)' }
  ];

  const lay = layout(null, 'k-path', 'E (eV)', {
    yaxis: { range: [-half, half], zeroline: true, zerolinecolor: '#5a5a80', zerolinewidth: 2 }
  });
  if (labels.length > 0) { lay.xaxis.tickvals = positions; lay.xaxis.ticktext = labels; }
  _plot('plot-band-structure', traces, lay, PLOT_CFG);
}

/* ====== DOS ====== */
function plotDOS() {
  const result = computeDOS(state.dim, state.dim === '3D' ? 20 : 40);
  const half = getViewYRange();
  _plot('plot-dos-playground',
    [{ x: result.E, y: result.dos, mode: 'lines', name: 'DOS g(E)', showlegend: true, line: { color: '#c084fc', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(179,136,255,0.08)' }],
    layout(null, 'E (eV)', 'DOS (arb. units)', {
      showlegend: true, xaxis: { range: [-half, half], zeroline: true, zerolinecolor: '#5a5a80', zerolinewidth: 2 }
    }), PLOT_CFG);
}

/* ====== ARPES ====== */
function plotARPES() {
  const kx = [], E = [], intensity = [];
  const dE = 0.05, dk = 0.05, T = 300, kB = 8.617e-5, hw = 21.2, sigma = 0.1;

  for (let ki = -Math.PI; ki <= Math.PI; ki += dk) {
    for (let ei = -state.Emax; ei <= state.Emax; ei += dE) {
      let e_cb, e_vb;
      if (state.dim === '1D' || state.dim === 'CNT') { e_cb = cb1D(ki); e_vb = vb1D(ki); }
      else if (state.dim === '2D' || state.dim === 'Graphite') { e_cb = cb2D(ki, 0); e_vb = vb2D(ki, 0); }
      else if (state.dim === 'graphene') { const b = bandGraphene(ki, 0); e_cb = b[0]; e_vb = b[1]; }
      else { e_cb = cb3D(ki, 0, 0); e_vb = vb3D(ki, 0, 0); }

      const f = 1 / (1 + Math.exp((ei - 0) / (kB * T)));
      const probe = ei < hw ? 1 : 0;

      function add(e_band) {
        const delta = Math.exp(-Math.pow(ei - e_band, 2) / (2 * sigma * sigma));
        const I = delta * f * probe;
        if (I > 0.01) { kx.push(ki); E.push(ei); intensity.push(I); }
      }
      add(e_cb); add(e_vb);
    }
  }
  const half = getViewYRange();
  _plot('plot-arpes-main',
    [{ type: 'scatter', mode: 'markers', name: 'ARPES intensity', showlegend: true, x: kx, y: E,
       marker: { size: 3, color: intensity, colorscale: [[0,'rgba(0,0,0,0)'], [0.5,'#c084fc'], [1,'#00f0ff']], showscale: false, opacity: 0.7 },
       hovertemplate: 'k: %{x:.2f}<br>E: %{y:.2f} eV' }],
    layout(null, 'k (π/a)', 'E - E_F (eV)', {
      showlegend: true,
      xaxis: { range: [-Math.PI, Math.PI], zeroline: true, zerolinecolor: '#5a5a80' },
      yaxis: { range: [-half, half], zeroline: true, zerolinecolor: '#5a5a80', zerolinewidth: 2 }
    }), PLOT_CFG);
}

/* ====== Live readout ====== */
function updateLiveTable() {
  const matEl = document.getElementById('live-material');
  const dimEl = document.getElementById('live-dim');
  const tEl   = document.getElementById('live-t');
  const bwEl  = document.getElementById('live-bw');
  const gapEl = document.getElementById('live-gap');

  if (matEl && state.mat && EB_MATERIALS[state.mat]) matEl.textContent = EB_MATERIALS[state.mat].label;
  if (dimEl) {
    const labels = { '3D':'3D Bulk', '2D':'2D Layer', '1D':'1D Wire', '0D':'0D Quantum Dot', 'graphene':'Dirac Cone' };
    dimEl.textContent = labels[state.dim] || state.dim;
  }
  if (tEl)   tEl.textContent   = state.t.toFixed(2) + ' eV';
  if (gapEl) gapEl.textContent = state.gap.toFixed(2) + ' eV';

  let z;
  if (state.dim === '1D' || state.dim === 'CNT') z = 1;
  else if (state.dim === '2D' || state.dim === 'Graphite') z = 2;
  else if (state.dim === '3D') z = 3;
  else if (state.dim === 'graphene') z = 1.5;
  else z = 0;

  let bw;
  if (state.dim === '0D') bw = 1.0;
  else bw = 4 * state.t * z;
  if (bwEl) bwEl.textContent = bw.toFixed(2) + ' eV';
}

/* ====== Lattice canvas ====== */
function renderLattice() {
  const canvas = document.getElementById('lattice-canvas');
  if (!canvas) return;
  let ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx = canvas.getContext('2d');
    if (!ctx) return;
  }
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const R = 4;
  const bondColor = 'rgba(0, 240, 255, 0.3)';
  const atomColor = '#fff';

  if (state.dim === '1D' || state.dim === 'CNT') {
    const sp = 50, startX = (w - 5*sp)/2, y = h/2;
    for (let i = 0; i < 6; i++) {
      const x = startX + i*sp;
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI*2); ctx.fillStyle = atomColor; ctx.fill();
      if (i < 5) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+sp, y); ctx.strokeStyle = bondColor; ctx.lineWidth = 2; ctx.stroke(); }
    }
  } else if (state.dim === '2D' || state.dim === 'Graphite') {
    const sp = 40, ox = 20, oy = 20;
    for (let i = 0; i < 7; i++) for (let j = 0; j < 8; j++) {
      const x = ox + i*sp, y = oy + j*sp;
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI*2); ctx.fillStyle = atomColor; ctx.fill();
      if (i < 6) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+sp, y); ctx.strokeStyle = bondColor; ctx.lineWidth = 1; ctx.stroke(); }
      if (j < 7) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y+sp); ctx.strokeStyle = bondColor; ctx.lineWidth = 1; ctx.stroke(); }
    }
  } else if (state.dim === 'graphene') {
    const a = 30, ox = 50, oy = 50;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      const x = ox + i*a*1.5;
      const y1 = oy + j*a*Math.sqrt(3);
      const y2 = y1 + a*Math.sqrt(3)/2;
      ctx.beginPath(); ctx.arc(x, y1, R, 0, Math.PI*2); ctx.fillStyle = atomColor; ctx.fill();
      ctx.beginPath(); ctx.arc(x + a*0.75, y2, R, 0, Math.PI*2); ctx.fillStyle = atomColor; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x + a*0.75, y2); ctx.strokeStyle = bondColor; ctx.stroke();
    }
  } else if (state.dim === '0D') {
    const cx = w/2, cy = h/2, r = 50;
    for (let i = 0; i < 12; i++) {
      const ang = i*Math.PI*2/12;
      const x = cx + r*Math.cos(ang), y = cy + r*Math.sin(ang);
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI*2); ctx.fillStyle = atomColor; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y); const na = (i+1)*Math.PI*2/12;
      ctx.lineTo(cx + r*Math.cos(na), cy + r*Math.sin(na)); ctx.strokeStyle = bondColor; ctx.stroke();
    }
  } else { // 3D
    const s = 40, cx = w/2, cy = h/2;
    for (let x = -2; x <= 2; x++)
      for (let y = -2; y <= 2; y++)
        for (let z = -2; z <= 2; z++) {
          const px = cx + (x-y)*s*0.8, py = cy + (x+y)*s*0.4 - z*s;
          ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill();
        }
  }
}

/* ====== UI wiring ====== */
function setEBMaterial(name) {
  const mat = EB_MATERIALS[name];
  if (!mat) return;

  state.dim = mat.dim;
  state.t   = mat.t;
  state.eps = mat.eps;
  state.mat = name;
  state.gap = (name === 'CNT' || name === 'Fullerene') ? mat.gap : ((name === 'Graphene' || name === 'Graphite') ? 0.0 : mat.gap);

  const sliderT   = document.getElementById('slider-t');
  const sliderGap = document.getElementById('slider-gap');
  const valT      = document.getElementById('val-t');
  const valGap    = document.getElementById('val-gap');

  if (sliderT)   sliderT.value = state.t;
  if (valT)      valT.textContent = state.t.toFixed(1);
  if (sliderGap) sliderGap.value = state.gap;
  if (valGap)    valGap.textContent = state.gap.toFixed(2);

  // Disable gap slider for carbon allotropes where gap is forced to zero
  const gapLocked = (name === 'Graphene' || name === 'Graphite');
  if (sliderGap) sliderGap.disabled = gapLocked;
  const gapGroup = sliderGap ? sliderGap.closest('.slider-group') : null;
  if (gapGroup) gapGroup.style.opacity = gapLocked ? '0.45' : '1';

  // Show carbon allotropes for any carbon-based material; hide for bulks
  const carbonSub = document.getElementById('carbon-subsection');
  const isCarbon = ['Graphene','Graphite','CNT','Fullerene'].indexOf(name) >= 0;
  if (carbonSub) {
    carbonSub.style.display = isCarbon ? 'block' : 'none';
  }

  // Determine allowed dimension modes from the selected card
  const card = document.querySelector('.material-card[data-mat="' + name + '"]');
  const allowedModes = card && card.dataset.modes ? card.dataset.modes.split(',') : [state.dim];

  // If current dimension is not allowed, switch to the first allowed mode
  if (allowedModes.indexOf(state.dim) === -1) {
    state.dim = allowedModes[0];
  }

  // Map each allowed mode to a contextual label based on the selected material
  const modeLabels = {
    '3D': '3D (Bulk)',
    '2D': name === 'Graphite' ? '2D Graphite sheet' : '2D (Layer)',
    '1D': name === 'CNT' ? '1D Nanotube' : '1D (Wire)',
    '0D': name === 'Fullerene' ? '0D Fullerene' : '0D (Dot)',
    'graphene': 'Dirac (Graphene)'
  };

  // Show/hide dimension buttons according to allowed modes
  document.querySelectorAll('#dim-bar .dim-btn').forEach(b => {
    const mode = b.dataset.mode;
    if (allowedModes.indexOf(mode) >= 0) {
      b.style.display = 'inline-block';
      b.textContent = modeLabels[mode] || b.dataset.defaultLabel;
      b.classList.toggle('active', mode === state.dim);
    } else {
      b.style.display = 'none';
    }
  });

  // Sync material-card selection highlight
  document.querySelectorAll('.material-card').forEach(c => {
    const isSelected = c.dataset.mat === name;
    c.classList.toggle('selected', isSelected);
    c.classList.toggle('active', isSelected);
  });

  plotBandStructure(); plotDOS(); plotARPES(); updateLiveTable(); renderLattice();
}

function initEB() {
  const sliderT   = document.getElementById('slider-t');
  const sliderGap = document.getElementById('slider-gap');

  if (sliderT) {
    sliderT.addEventListener('input', function() {
      state.t = parseFloat(this.value);
      document.getElementById('val-t').textContent = state.t.toFixed(1);
      plotBandStructure(); plotDOS(); plotARPES(); updateLiveTable();
    });
  }
  if (sliderGap) {
    sliderGap.addEventListener('input', function() {
      state.gap = parseFloat(this.value);
      document.getElementById('val-gap').textContent = state.gap.toFixed(2);
      plotBandStructure(); plotDOS(); plotARPES(); updateLiveTable();
    });
  }
  plotBandStructure(); plotDOS(); plotARPES(); updateLiveTable(); renderLattice();
}

window.setEBDim = function(dim) {
  state.dim = dim;
  document.querySelectorAll('#dim-bar .dim-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('#dim-bar .dim-btn[data-mode="' + dim + '"]');
  if (btn) btn.classList.add('active');
  plotBandStructure(); plotDOS(); plotARPES(); updateLiveTable(); renderLattice();
};

window.setEBMaterial    = setEBMaterial;
window.initEB          = initEB;
window.plotBandStructure = plotBandStructure;
window.plotDOS         = plotDOS;
window.plotARPES       = plotARPES;
window.renderLattice   = renderLattice;
window.updateLiveTable = updateLiveTable;
window.state           = state;
initEB();
setEBMaterial('Cu');

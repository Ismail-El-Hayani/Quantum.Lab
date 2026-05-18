/**
 * Hydrogen Apps & Games — Module 02 UI + Gamification
 * Delegates physics to HydrogenLab. No duplicate math.
 */

'use strict';

/* ---------- Shortcuts ---------- */
var H = window.HydrogenLab;

function _ext(base, over) {
  var out = JSON.parse(JSON.stringify(base));
  for (var k in over) {
    if (typeof over[k] === 'object' && over[k] !== null && !Array.isArray(over[k]) && k in out && typeof out[k] === 'object') {
      for (var j in over[k]) out[k][j] = over[k][j];
    } else {
      out[k] = over[k];
    }
  }
  return out;
}

var _dLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#e0e0f0', size: 11 },
  margin: { l: 50, r: 20, t: 40, b: 40 },
  xaxis: { gridcolor: '#2a2a3a', zerolinecolor: '#3a3a5a' },
  yaxis: { gridcolor: '#2a2a3a', zerolinecolor: '#3a3a5a' }
};

/* ---------- Module State ---------- */
var __H = {
  n: 3, l: 1, ni: 3, nf: 2, B: 0,
  cloudMode: false,
  challenge: { active: false, targetN: 0, score: 0, combo: 0, timer: null, timeLeft: 60, streak: 0, round: 0 },
  fine: { givenN: 2 },
  bohr: {},
  aufbauState: {},
  orbitalState: {},
  hundState: {}
};

/* ---------- Playground Plots ---------- */
function plotHydrogen(n, l) {
  var r = linspace(0, 20, 200);
  var R = r.map(function(ri) { return H.R_nl(n, l, ri); });
  var P = r.map(function(ri) { return H.P_radial(n, l, ri); });
  var expR = H.r_expectation(n, l);
  var E = H.energy_eV(n);

  _plotApp('plot-orbitals', [
    {
      x: r, y: R, mode: 'lines', name: 'R_' + n + getLabel(l) + '(r)',
      line: { color: '#00f0ff', width: 2 },
      yaxis: 'y'
    },
    {
      x: r, y: P, mode: 'lines', name: '|R|²r²',
      line: { color: '#c084fc', width: 2, dash: 'dash' },
      fill: 'tozeroy', fillcolor: 'rgba(179,136,255,0.06)',
      yaxis: 'y2'
    },
    {
      x: [expR, expR], y: [0, 1.1], mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' },
      name: '⟨r⟩=' + expR.toFixed(1),
      yaxis: 'y2'
    }
  ], _ext(_dLayout, {
    title: { text: 'Radial: n=' + n + ', l=' + l + ', E=' + E.toFixed(2) + ' eV', font: { size: 13 } },
    xaxis: { title: 'r (a₀)' },
    yaxis: { title: 'R(r)', color: '#00f0ff', side: 'left' },
    yaxis2: { title: 'r²|R|²', color: '#c084fc', overlaying: 'y', side: 'right' },
    legend: { x: 1.02, y: 1, bgcolor: 'rgba(10,10,15,0.8)' }
  }), { responsive: true, displayModeBar: false });
}

function plotSpectrum(ni, nf) {
  var photon = H.energy_eV(ni) - H.energy_eV(nf);
  var series = nf === 1 ? 'Lyman' : nf === 2 ? 'Balmer' : nf === 3 ? 'Paschen' : nf === 4 ? 'Brackett' : 'Pfund';

  var seriesData = [
    { name: 'Lyman (UV)',  n_f: 1, color: '#ff4ecd', range: [10, 13.6] },
    { name: 'Balmer (Vis)', n_f: 2, color: '#facc15', range: [1.9, 3.4] },
    { name: 'Paschen (IR)', n_f: 3, color: '#4ade80', range: [0.6, 1.5] },
    { name: 'Brackett (IR)',n_f: 4, color: '#00f0ff', range: [0.3, 0.75] }
  ];

  var energies = [], names = [], colors = [], yidx = [];
  seriesData.forEach(function(s, idx) {
    for (var n = s.n_f + 1; n <= 8; n++) {
      var de = H.energy_eV(n) - H.energy_eV(s.n_f);
      if (de >= s.range[0] && de <= s.range[1]) {
        energies.push(de);
        names.push(s.name + ': ' + n + '→' + s.n_f);
        colors.push(s.color);
        yidx.push(idx);
      }
    }
  });

  var userColor = photon > 10 ? '#ff4ecd' : photon > 2 ? '#facc15' : photon > 0.5 ? '#4ade80' : '#00f0ff';
  energies.push(photon);
  names.push('YOUR: ' + ni + '→' + nf);
  colors.push(userColor);
  yidx.push(seriesData.length);

  var yLabels = seriesData.map(function(s) { return s.name; });
  yLabels.push('Your transition');

  _plotApp('plot-spectrum', [
    {
      x: energies, y: yidx.map(function(v) { return v + 0.5; }),
      mode: 'markers', type: 'scatter',
      marker: { size: 16, color: colors, line: { color: '#fff', width: 1 } },
      text: names, textposition: 'top center', textfont: { size: 9, color: '#e0e0f0' },
      hovertemplate: '%{text}<br>E = %{x:.2f} eV<extra></extra>'
    },
    {
      x: [photon, photon], y: [0, yLabels.length], mode: 'lines',
      line: { color: userColor, width: 2, dash: 'dash' }, name: 'Selected',
      hoverinfo: 'skip'
    }
  ], _ext(_dLayout, {
    title: { text: series + ' Series · Photon = ' + photon.toFixed(2) + ' eV', font: { size: 13 } },
    xaxis: { title: 'Photon energy (eV)', range: [0, 14] },
    yaxis: {
      tickmode: 'array',
      tickvals: yLabels.map(function(_, i) { return i + 0.5; }),
      ticktext: yLabels,
      range: [0, yLabels.length]
    },
    showlegend: false
  }), { responsive: true, displayModeBar: false });
}

function plotZeeman(n, l, B) {
  var muB = 5.788e-5;
  var base = H.energy_eV(n);
  var split = muB * B;
  var mj = [];
  for (var m = -l; m <= l; m++) mj.push(m);

  var traces = [];
  var colors = ['#ff4ecd', '#c084fc', '#00f0ff', '#4ade80', '#facc15'];

  mj.forEach(function(m, idx) {
    var E = base + m * split;
    traces.push({
      x: [0, 1], y: [E, E], mode: 'lines',
      line: { color: colors[idx % colors.length], width: 3 },
      name: 'm=' + m + '  E=' + E.toFixed(6) + ' eV',
      hoverinfo: 'name'
    });
    traces.push({
      x: [1.05], y: [E], mode: 'text',
      text: ['m=' + (m > 0 ? '+' : '') + m],
      textposition: 'middle left',
      textfont: { color: colors[idx % colors.length], size: 11 },
      showlegend: false, hoverinfo: 'skip'
    });
  });

  _plotApp('plot-zeeman', traces, _ext(_dLayout, {
    title: { text: 'Zeeman Splitting · B=' + B.toFixed(1) + ' T · ΔE=' + (split * 1e6).toFixed(1) + ' μeV', font: { size: 13 } },
    xaxis: { visible: false, range: [-0.2, 1.5] },
    yaxis: { title: 'Energy (eV)', range: [base - l * split * 1.5, base + l * split * 1.5] },
    showlegend: false
  }), { responsive: true, displayModeBar: false });
}

function getLabel(l) {
  var labels = ['s', 'p', 'd', 'f', 'g'];
  return labels[l] || 'l' + l;
}

function updateLiveTable() {
  var n = __H.n, l = __H.l;
  var E = H.energy_eV(n);
  var r = H.r_expectation(n, l);
  var nodes = n - l - 1;

  var elE = document.getElementById('live-E');
  if (elE) elE.textContent = E.toFixed(2) + ' eV';
  var elR = document.getElementById('live-r');
  if (elR) elR.textContent = r.toFixed(1) + ' a₀';
  var elN = document.getElementById('live-nodes');
  if (elN) elN.textContent = nodes;
}

/* ---------- 3D Sync ---------- */
function sync3D() {
  H.Hydrogen3D.update({ n: __H.n, l: __H.l });
}

function toggleWavefunctionView() {
  __H.cloudMode = !__H.cloudMode;
  var btn = document.getElementById('btn-reveal-wf');
  if (btn) {
    btn.textContent = __H.cloudMode ? '🎯 Back to Bohr' : '🌌 Reveal Wavefunction';
    btn.style.background = __H.cloudMode ? 'var(--accent-cyan)' : 'var(--accent-purple)';
  }
  H.Hydrogen3D.setCloudMode(__H.cloudMode);
}

/* ---------- Challenge 1: Spectral Detective ---------- */
var specTargets = [
  { from: 3, to: 2 }, { from: 4, to: 2 }, { from: 5, to: 2 },
  { from: 2, to: 1 }, { from: 3, to: 1 }, { from: 4, to: 1 },
  { from: 4, to: 3 }, { from: 5, to: 3 }, { from: 6, to: 2 }
];

function startSpectralChallenge() {
  var c = __H.challenge;
  c.active = true; c.score = 0; c.combo = 0; c.timeLeft = 60; c.streak = 0; c.round = 0;
  nextSpectralTarget();
  var elS = document.getElementById('spec-score');
  if (elS) elS.textContent = '0';
  var elC = document.getElementById('spec-combo');
  if (elC) elC.textContent = '0';
  if (c.timer) clearInterval(c.timer);
  c.timer = setInterval(function() {
    if (!c.active) return;
    c.timeLeft--;
    var bar = document.getElementById('spec-timer');
    if (bar) {
      bar.style.width = (c.timeLeft / 60 * 100) + '%';
      if (c.timeLeft < 12) bar.classList.add('urgent');
    }
    if (c.timeLeft <= 0) {
      clearInterval(c.timer); c.active = false;
      var fb = document.getElementById('spec-feedback');
      if (fb) { fb.className = 'challenge-feedback'; fb.style.display = 'block'; fb.textContent = "⏰ Time's up! Final score: " + c.score; }
    }
  }, 1000);
}

function nextSpectralTarget() {
  __H.challenge.targetN = specTargets[Math.floor(Math.random() * specTargets.length)];
  var t = __H.challenge.targetN;
  var energy = H.energy_eV(t.from) - H.energy_eV(t.to);
  var fb = document.getElementById('spec-target-text');
  if (fb) fb.innerHTML = '🔎 <strong>Target photon:</strong> ' + energy.toFixed(2) + ' eV · Which transition?';
}

function guessTransition(guessFrom, guessTo) {
  var c = __H.challenge;
  if (!c.active) return;
  var t = c.targetN;
  var fb = document.getElementById('spec-feedback');
  if (!fb) return;
  if (guessFrom === t.from && guessTo === t.to) {
    c.streak++;
    var pts = 50 + c.streak * 5;
    c.score += pts; c.combo++;
    if (typeof __GameState !== 'undefined') __GameState.addXP(pts, 'Spectral line matched!');
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Correct! ' + t.from + '→' + t.to + ' gives ' + (H.energy_eV(t.from) - H.energy_eV(t.to)).toFixed(2) + ' eV. +' + pts + ' XP';
    if (typeof particleBurst === 'function') particleBurst(window.innerWidth / 2, 300);
    if (c.score >= 200 && typeof __GameState !== 'undefined') __GameState.unlock({ id: 'spectral_analyst', title: 'Spectral Analyst', desc: 'Scored 200+ on spectral detective', icon: '🌈', xp: 25 });
    setTimeout(nextSpectralTarget, 1500);
  } else {
    c.streak = 0; c.combo = 0;
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ Not this one. Hint: ΔE = 13.6(1/n_f² − 1/n_i²) eV';
  }
  var elS = document.getElementById('spec-score');
  if (elS) elS.textContent = c.score;
  var elC = document.getElementById('spec-combo');
  if (elC) elC.textContent = c.combo;
}

function showSpecHint() {
  var t = __H.challenge.targetN;
  var fb = document.getElementById('spec-feedback');
  if (!fb) return;
  var series = t.to === 1 ? 'Lyman (UV)' : t.to === 2 ? 'Balmer (visible)' : t.to === 3 ? 'Paschen (IR)' : 'higher series';
  fb.className = 'challenge-feedback hint'; fb.style.display = 'block';
  fb.textContent = '💡 This is in the ' + series + '. n_f = ' + t.to + '. Try different n_i values.';
}

/* ---------- Challenge 2: Fine Structure ---------- */
function plotFineStructure() {
  var n = 2, l = 1;
  var deltaE = 4.53e-5;

  _plotApp('plot-fine-structure', [
    { x: [0, 1], y: [H.energy_eV(n), H.energy_eV(n)], mode: 'lines',
      line: { color: '#8080a0', width: 3 }, name: 'n=2, unperturbed' },
    { x: [1.2, 2.2], y: [H.energy_eV(n) - deltaE / 2, H.energy_eV(n) - deltaE / 2], mode: 'lines',
      line: { color: '#00f0ff', width: 3 }, name: 'j=1/2 (lower, L·S anti)' },
    { x: [2.4, 3.4], y: [H.energy_eV(n) + deltaE / 2, H.energy_eV(n) + deltaE / 2], mode: 'lines',
      line: { color: '#ff4ecd', width: 3 }, name: 'j=3/2 (higher, L·S ∥)' }
  ], _ext(_dLayout, {
    title: { text: 'Fine Structure: n=2 splits into j=1/2 (lower) and j=3/2 (higher)', font: { size: 13 } },
    xaxis: { showticklabels: false, range: [-0.5, 4] },
    yaxis: { title: 'Energy (eV)' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' }
  }), { responsive: true, displayModeBar: false });
}

function checkFineStructure(guess_j) {
  var fb = document.getElementById('fine-feedback');
  if (!fb) return;
  if (guess_j === '1/2') {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '✓ Correct! j = l ± 1/2 = 1/2 and 3/2. The splitting ΔE ≈ α⁴ mc² / n³ ≈ 4.5×10⁻⁵ eV. In hydrogen, the 2P_1/2 state is slightly lower (Dirac theory). The Lamb shift (QED) makes 2S_1/2 higher than 2P_1/2 — discovered in 1947.';
    if (typeof __GameState !== 'undefined') {
      __GameState.addXP(75, 'Fine structure solved!');
      __GameState.unlock({ id: 'fine_analyst', title: 'Fine Structure Analyst', desc: 'Resolved spin-orbit splitting', icon: '⚡', xp: 25 });
    }
    if (typeof particleBurst === 'function') particleBurst(window.innerWidth / 2, 300, '#facc15');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ For l=1, j = l ± s = 1 ± 1/2 = 1/2 or 3/2. Both are possible. Look at the plot again.';
  }
}

/* ---------- Challenge 3: Bohr Radius Scaling ---------- */
function checkBohrAnswer(ans) {
  var fb = document.getElementById('bohr-feedback');
  var anim = document.getElementById('bohr-anim');
  if (!fb) return;

  if (ans === '9') {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '✓ Exactly! ⟨r⟩ ∝ n², so n=3 gives ⟨r⟩ = 9 × ⟨r⟩_ground. But WAIT — the electron is also delocalized quantum mechanically! The probability spreads across all radii. This is why Rydberg atoms (n~50) have radii of ~2500 a₀ and interact strongly with each other.';
    if (typeof __GameState !== 'undefined') {
      __GameState.addXP(100, 'Bohr scaling mastered!');
      __GameState.unlock({ id: 'bohr_master', title: 'Bohr Master', desc: 'Understood quantum orbital scaling', icon: '🌠', xp: 30 });
    }
    if (typeof particleBurst === 'function') particleBurst(window.innerWidth / 2, 400, '#00f0ff');

    if (anim) {
      var canvas = document.createElement('canvas');
      canvas.width = 200; canvas.height = 200;
      anim.innerHTML = ''; anim.appendChild(canvas); anim.style.display = 'flex';
      var ctx = canvas.getContext('2d');
      var frame = 0;
      function drawOrbit() {
        frame++;
        ctx.clearRect(0, 0, 200, 200);
        var r = 10 + (frame % 120) * 1.5;
        ctx.beginPath(); ctx.arc(100, 100, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(100, 100, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15'; ctx.fill();
        if (frame < 180) requestAnimationFrame(drawOrbit);
      }
      drawOrbit();
    }
  } else if (ans === '3') {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ Close! The energy scales as 1/n², but the radius scales differently. Think about ⟨r⟩ = a₀/2 [3n² − l(l+1)]. For large n, this ∝ n².';
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ The Bohr radius a₀ = 0.529 Å. For n=1, ⟨r⟩ = 1.5 a₀. For n=3, l=0: ⟨r⟩ = 13.5 a₀. That is 9 TIMES larger!';
  }
}

/* ---------- Puzzle 1: Aufbau Principle ---------- */
var aufbauLevels = [
  { n: 1, l: 0, name: '1s', capacity: 2, energy: 1 },
  { n: 2, l: 0, name: '2s', capacity: 2, energy: 2 },
  { n: 2, l: 1, name: '2p', capacity: 6, energy: 3 },
  { n: 3, l: 0, name: '3s', capacity: 2, energy: 4 },
  { n: 3, l: 1, name: '3p', capacity: 6, energy: 5 },
  { n: 4, l: 0, name: '4s', capacity: 2, energy: 6 },
  { n: 3, l: 2, name: '3d', capacity: 10, energy: 7 }
];

function initAufbau() {
  var board = document.getElementById('aufbau-board');
  var pool = document.getElementById('aufbau-pool');
  if (!board || !pool) return;
  board.innerHTML = ''; pool.innerHTML = '';

  aufbauLevels.forEach(function(lvl, i) {
    var slot = document.createElement('div');
    slot.className = 'energy-slot';
    slot.dataset.energy = lvl.energy;
    slot.textContent = lvl.name + ' (E=' + lvl.energy + ')';
    slot.ondrop = function(e) {
      e.preventDefault();
      var partId = e.dataTransfer.getData('electron');
      var part = document.getElementById(partId);
      if (part) { part.style.opacity = '0.3'; part.dataset.placed = 'true'; }
      __H.aufbauState[i] = (__H.aufbauState[i] || 0) + 1;
      slot.textContent = lvl.name + ' (' + __H.aufbauState[i] + '/' + lvl.capacity + ')';
      if (__H.aufbauState[i] >= lvl.capacity) slot.style.borderColor = 'var(--accent-green)';
    };
    slot.ondragover = function(e) { e.preventDefault(); };
    board.appendChild(slot);
  });

  for (var i = 0; i < 18; i++) {
    var e = document.createElement('div');
    e.id = 'e-' + i;
    e.className = 'energy-particle';
    e.style.cssText = 'width:28px;height:28px;font-size:0.6rem;';
    e.textContent = 'e⁻';
    e.draggable = true;
    e.ondragstart = function(ev) { ev.dataTransfer.setData('electron', this.id); };
    pool.appendChild(e);
  }
  __H.aufbauState = {};
}

function checkAufbau() {
  var correct = 0, total = 0;
  for (var i in __H.aufbauState) {
    var lvl = aufbauLevels[i];
    var count = __H.aufbauState[i] || 0;
    total += lvl.capacity;
    if (count === lvl.capacity) correct += lvl.capacity;
    else correct += Math.min(count, lvl.capacity);
  }
  var fb = document.getElementById('aufbau-feedback');
  if (!fb) return;
  if (correct === total && total > 0) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Perfect! Aufbau principle: fill lowest energy first. 1s→2s→2p→3s→3p→4s→3d. This is why the periodic table has its shape!';
    if (typeof __GameState !== 'undefined') {
      __GameState.addXP(60, 'Aufbau principle mastered!');
      __GameState.unlock({ id: 'aufbau_sage', title: 'Aufbau Sage', desc: 'Filled electron shells correctly', icon: '🏛', xp: 20 });
    }
    if (typeof particleBurst === 'function') particleBurst(window.innerWidth / 2, 300, '#4ade80');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ ' + (total - correct) + ' electrons misplaced. Remember: fill lowest n first, then within same n, lower l first. The energy ordering is NOT simply by n!';
  }
}

/* ---------- Puzzle 2: Orbital Matching ---------- */
var orbitalPuzzles = [
  { label: 'Y₀₀ (s orbital)', l: 0, m: 0 },
  { label: 'Y₁₀ (p_z)', l: 1, m: 0 },
  { label: 'Y₁,±₁ (p_x, p_y)', l: 1, m: '±1' },
  { label: 'Y₂₀ (d_z²)', l: 2, m: 0 },
  { label: 'Y₂,±₁ (d_xz, d_yz)', l: 2, m: '±1' },
  { label: 'Y₂,±₂ (d_xy, d_x²-y²)', l: 2, m: '±2' }
];

function initOrbitalPuzzle() {
  var c = document.getElementById('orbital-matches');
  if (!c) return;
  c.innerHTML = '';
  orbitalPuzzles.forEach(function(p, i) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:1rem;padding:0.5rem;border-bottom:1px solid var(--border-subtle);';
    var label = document.createElement('div');
    label.style.cssText = 'font-family:var(--mono);font-size:0.85rem;color:var(--text-main);width:180px;';
    label.textContent = p.label;

    var inputL = document.createElement('select');
    inputL.id = 'orb-l-' + i;
    inputL.style.cssText = 'background:var(--bg-elevated);border:1px solid var(--border-subtle);color:var(--text-main);padding:0.3rem;border-radius:4px;font-family:var(--mono);';
    [0, 1, 2, 3].forEach(function(v) { var o = document.createElement('option'); o.value = v; o.textContent = 'l=' + v; inputL.appendChild(o); });

    var inputM = document.createElement('select');
    inputM.id = 'orb-m-' + i;
    inputM.style.cssText = inputL.style.cssText;
    ['0', '±1', '±2', '±3'].forEach(function(v) { var o = document.createElement('option'); o.value = v; o.textContent = 'm=' + v; inputM.appendChild(o); });

    row.appendChild(label); row.appendChild(inputL); row.appendChild(inputM);
    c.appendChild(row);
  });
}

function checkOrbitalPuzzle() {
  var correct = 0;
  orbitalPuzzles.forEach(function(p, i) {
    var gl = Number.parseInt(document.getElementById('orb-l-' + i).value);
    var gm = document.getElementById('orb-m-' + i).value;
    if (gl === p.l && gm === ('' + p.m)) correct++;
  });
  var fb = document.getElementById('orbital-feedback');
  if (!fb) return;
  if (correct === orbitalPuzzles.length) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = '✓ Excellent! l = 0(s), 1(p), 2(d), 3(f). |m| ≤ l. The spherical harmonics Y_lm describe the angular part of the wavefunction. Together with R_nl(r), they form the complete orbital.';
    if (typeof __GameState !== 'undefined') {
      __GameState.addXP(80, 'Orbitals matched!');
      __GameState.unlock({ id: 'orbital_master', title: 'Orbital Master', desc: 'Matched all spherical harmonics', icon: '🌍', xp: 25 });
    }
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = '✗ ' + (orbitalPuzzles.length - correct) + ' wrong. Rule: |m| ≤ l. s: l=0,m=0 · p: l=1,m=0,±1 · d: l=2,m=0,±1,±2.';
  }
}

/* ---------- Puzzle 3: Hund's Rule ---------- */
var hundConfigs = [
  { config: '1s²', order: 1 }, { config: '2s²', order: 2 }, { config: '2p²', order: 3 },
  { config: '3s²', order: 4 }, { config: '3p²', order: 5 }, { config: '4s²', order: 6 },
  { config: '3d²', order: 7 }
];

function initHundPuzzle() {
  var c = document.getElementById('hund-list');
  if (!c) return;
  c.innerHTML = '';
  var shuffled = hundConfigs.slice().sort(function() { return Math.random() - 0.5; });
  shuffled.forEach(function(cfg, i) {
    var item = document.createElement('div');
    item.className = 'draggable-target';
    item.style.cssText = 'padding:0.6rem 1rem;margin:0.3rem 0;cursor:pointer;';
    item.dataset.order = cfg.order;
    item.textContent = cfg.config;
    item.onclick = function() { this.classList.toggle('selected'); };
    c.appendChild(item);
  });
}

function checkHundPuzzle() {
  var selected = document.querySelectorAll('#hund-list .draggable-target');
  if (!selected.length) return;
  var ordered = Array.from(selected).sort(function(a, b) { return Number.parseInt(a.dataset.order) - Number.parseInt(b.dataset.order); });
  var correct = true;
  selected.forEach(function(el, i) { if (el.dataset.order != ordered[i].dataset.order) correct = false; });

  var fb = document.getElementById('hund-feedback');
  if (!fb) return;
  if (correct) {
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.textContent = "✓ Perfect! Energy ordering: 1s < 2s < 2p < 3s < 3p < 4s < 3d. Hund's rule: within a subshell, maximize parallel spins. This gives magnetism in transition metals!";
    if (typeof __GameState !== 'undefined') {
      __GameState.addXP(120, "Hund's rule mastered!");
      __GameState.unlock({ id: 'hund_wizard', title: "Hund's Wizard", desc: 'Ordered electron configurations', icon: '🧲', xp: 30 });
    }
    if (typeof particleBurst === 'function') particleBurst(window.innerWidth / 2, 300, '#facc15');
  } else {
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.textContent = "✗ Order is wrong. Remember: lower (n+l) = lower energy. For same (n+l), lower n wins. 4s (n+l=4) fills before 3d (n+l=5).";
  }
}

/* ---------- Sliders & Boot ---------- */
function setNf(v) {
  v = Number.parseInt(v);
  if (v < 1) v = 1;
  if (v >= __H.n) {
    v = __H.n - 1;
    if (v < 1) v = 1;
  }
  __H.nf = v;
  var el = document.getElementById('val-nf-meta');
  if (el) el.textContent = __H.nf;
  plotSpectrum(__H.n, __H.nf);
}

function attachSliders() {
  var nSlider = document.getElementById('slider-h2-n');
  var lSlider = document.getElementById('slider-h2-l');
  var valN = document.getElementById('val-h2-n');
  var valL = document.getElementById('val-h2-l');

  if (nSlider) {
    nSlider.addEventListener('input', function(e) {
      __H.n = Number.parseInt(e.target.value);
      __H.ni = __H.n;
      if (valN) valN.textContent = __H.n;
      var niMeta = document.getElementById('val-ni-meta');
      if (niMeta) niMeta.textContent = __H.ni;
      if (__H.nf >= __H.n) {
        __H.nf = __H.n - 1;
        if (__H.nf < 1) __H.nf = 1;
      }
      var nfMeta = document.getElementById('val-nf-meta');
      if (nfMeta) nfMeta.textContent = __H.nf;
      if (lSlider) {
        lSlider.max = String(__H.n - 1);
        if (__H.l >= __H.n) {
          __H.l = __H.n - 1;
          lSlider.value = String(__H.l);
          if (valL) valL.textContent = __H.l;
        }
      }
      plotHydrogen(__H.n, __H.l);
      updateLiveTable();
      sync3D();
    });
  }

  if (lSlider) {
    lSlider.addEventListener('input', function(e) {
      __H.l = Number.parseInt(e.target.value);
      if (valL) valL.textContent = __H.l;
      plotHydrogen(__H.n, __H.l);
      updateLiveTable();
      sync3D();
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  __H.ni = __H.n;
  var niMeta = document.getElementById('val-ni-meta');
  var nfMeta = document.getElementById('val-nf-meta');
  if (niMeta) niMeta.textContent = __H.ni;
  if (nfMeta) nfMeta.textContent = __H.nf;

  attachSliders();

  if (H.Hydrogen3D.init('canvas-3d')) {
    sync3D();
  }

  if (document.getElementById('plot-orbitals')) {
    plotHydrogen(3, 1);
    plotSpectrum(3, 2);
    plotZeeman(3, 1, 0);
    updateLiveTable();
  }

  /* Mode switch hook */
  if (typeof setGameMode === 'function') {
    var orig = setGameMode;
    window.setGameMode = function(mode) {
      orig(mode);
      if (mode === 'challenge' && typeof startSpectralChallenge === 'function') {
        startSpectralChallenge(); plotFineStructure();
      }
      if (mode === 'puzzle') { initAufbau(); initOrbitalPuzzle(); initHundPuzzle(); }
    };
  }

  /* Nav */
  var nav = document.getElementById('module-nav');
  if (nav) {
    var modules = [
      { num: '01', name: 'QHO', url: '../01_qho/index.html' },
      { num: '02', name: 'Hydrogen', current: true },
      { num: '03', name: 'Spin-1/2', url: '../03_spin/index.html' },
      { num: '04', name: 'KP Model', url: '../04_kronig_penney/index.html' },
      { num: '05', name: 'Bands', url: '../05_energy_bands/index.html' },
      { num: '06', name: 'Fermi', url: '../06_fermi_surface/index.html' },
      { num: '07', name: 'Conductivity', url: '../07_conductivity/index.html' }
    ];
    modules.forEach(function(m) {
      var el = document.createElement(m.current ? 'div' : 'a');
      if (!m.current) { el.href = m.url; el.style.textDecoration = 'none'; }
      el.style.cssText = 'display:block;padding:0.5rem 0.7rem;border-radius:8px;margin-bottom:0.3rem;font-size:0.85rem;';
      if (m.current) {
        el.style.background = 'rgba(255,64,129,0.08)'; el.style.border = '1px solid rgba(255,64,129,0.3)'; el.style.color = '#ff4ecd';
        el.textContent = m.num + '. ' + m.name + ' (here)';
      } else {
        el.style.background = 'var(--bg-elevated)'; el.style.border = '1px solid var(--border-subtle)'; el.style.color = 'var(--text-dim)';
        el.textContent = m.num + '. ' + m.name;
      }
      nav.appendChild(el);
    });
  }

  /* Stats */
  if (typeof __GameState !== 'undefined') {
    var xpEl = document.getElementById('stat-xp');
    if (xpEl) xpEl.textContent = __GameState.xp();
    var navXp = document.getElementById('nav-xp');
    if (navXp) navXp.textContent = __GameState.xp() + ' XP';
  }
});

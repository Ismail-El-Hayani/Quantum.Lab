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
  n: 3, l: 1, m: 0, ni: 3, nf: 2, B: 0,
  cloudMode: false,
  challenge: { active: false, targetN: 0, score: 0, combo: 0, timer: null, timeLeft: 60, streak: 0, round: 0 },
  fine: { givenN: 2 },
  bohr: {},
  aufbauState: {},
  orbitalState: {},
  hundState: {}
};

/* ---------- Playground Plots ---------- */
function plotHydrogen(n, l, m) {
  var r = linspace(0, 20, 200);
  var R = r.map(function(ri) { return H.R_nl(n, l, ri); });
  var P = r.map(function(ri) { return H.P_radial(n, l, ri); });
  var expR = H.r_expectation(n, l);
  var E = H.energy_eV(n);
  m = (typeof m === 'number') ? m : 0;

  var layout = _ext(_dLayout, {
    title: { text: 'Radial: n=' + n + ', l=' + l + ', m=' + m + ', E=' + E.toFixed(2) + ' eV', font: { size: 13 } },
    xaxis: { title: 'r (a₀)' },
    yaxis: { title: 'R(r)', color: '#00f0ff', side: 'left' },
    yaxis2: { title: 'r²|R|²', color: '#c084fc', overlaying: 'y', side: 'right' },
    legend: { x: 1.02, y: 1, bgcolor: 'rgba(10,10,15,0.8)' }
  });
  layout.autosize = true; delete layout.width; delete layout.height;

  var pMax = Math.max.apply(null, P);
  var pTop = pMax > 0 ? pMax * 1.1 : 1;

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
      x: [expR, expR], y: [0, pTop], mode: 'lines',
      line: { color: '#facc15', width: 2, dash: 'dot' },
      name: '⟨r⟩=' + expR.toFixed(1),
      yaxis: 'y2'
    }
  ], layout, { responsive: true, displayModeBar: false });
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

  var specLayout = _ext(_dLayout, {
    title: { text: series + ' Series · Photon = ' + photon.toFixed(2) + ' eV', font: { size: 12 } },
    margin: { l: 72, r: 20, t: 45, b: 45 },
    xaxis: { title: 'Photon energy (eV)', range: [0, 14], titlefont: { size: 11 } },
    yaxis: {
      tickmode: 'array',
      tickvals: yLabels.map(function(_, i) { return i + 0.5; }),
      ticktext: yLabels,
      range: [0, yLabels.length],
      tickfont: { size: 10 }
    },
    showlegend: false
  });
  specLayout.autosize = true; delete specLayout.width; delete specLayout.height;

  _plotApp('plot-spectrum', [
    {
      x: energies, y: yidx.map(function(v) { return v + 0.5; }),
      mode: 'markers', type: 'scatter',
      marker: { size: 12, color: colors, line: { color: '#fff', width: 1 } },
      text: names, textposition: 'top center', textfont: { size: 8, color: '#e0e0f0' },
      hovertemplate: '%{text}<br>E = %{x:.2f} eV<extra></extra>'
    },
    {
      x: [photon, photon], y: [0, yLabels.length], mode: 'lines',
      line: { color: userColor, width: 2, dash: 'dash' }, name: 'Selected',
      hoverinfo: 'skip'
    }
  ], specLayout, { responsive: true, displayModeBar: false });
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

  var yPad = Math.max(Math.abs(l * split * 1.5), 0.01);

  var zeemanLayout = _ext(_dLayout, {
    title: { text: 'Zeeman Splitting · B=' + B.toFixed(1) + ' T · ΔE=' + (split * 1e6).toFixed(1) + ' μeV', font: { size: 13 } },
    xaxis: { visible: false, range: [-0.2, 1.5] },
    yaxis: { title: 'Energy (eV)', range: [base - yPad, base + yPad] },
    showlegend: false
  });
  zeemanLayout.autosize = true; delete zeemanLayout.width; delete zeemanLayout.height;

  _plotApp('plot-zeeman', traces, zeemanLayout, { responsive: true, displayModeBar: false });
}

function getLabel(l) {
  var labels = ['s', 'p', 'd', 'f', 'g'];
  return labels[l] || 'l' + l;
}

function updateLiveTable() {
  var n = __H.n, l = __H.l, m = __H.m;
  var E = H.energy_eV(n);
  var r = H.r_expectation(n, l);
  var nodes = n - l - 1;
  var photon = H.energy_eV(n) - H.energy_eV(__H.nf);
  var series = __H.nf === 1 ? 'Lyman' : __H.nf === 2 ? 'Balmer' : __H.nf === 3 ? 'Paschen' : __H.nf === 4 ? 'Brackett' : 'Pfund';
  var split = 5.788e-5 * __H.B * 1e6;

  var elE = document.getElementById('live-E');
  if (elE) elE.textContent = E.toFixed(2) + ' eV';
  var elR = document.getElementById('live-r');
  if (elR) elR.textContent = r.toFixed(1) + ' a₀';
  var elN = document.getElementById('live-nodes');
  if (elN) elN.textContent = nodes;
  var elM = document.getElementById('live-m');
  if (elM) elM.textContent = (m > 0 ? '+' : '') + m;

  var elRadialE = document.getElementById('live-radial-E');
  if (elRadialE) elRadialE.textContent = E.toFixed(2) + ' eV';
  var elRadialR = document.getElementById('live-radial-r');
  if (elRadialR) elRadialR.textContent = r.toFixed(1) + ' a₀';
  var elRadialN = document.getElementById('live-radial-nodes');
  if (elRadialN) elRadialN.textContent = nodes;

  var elPhoton = document.getElementById('live-spectrum-photon');
  if (elPhoton) elPhoton.textContent = photon.toFixed(2) + ' eV';
  var elSeries = document.getElementById('live-spectrum-series');
  if (elSeries) elSeries.textContent = series + ' series';

  var elSplit = document.getElementById('live-zeeman-split');
  if (elSplit) elSplit.textContent = split.toFixed(1) + ' μeV';
}

/* ---------- 3D Sync ---------- */
function sync3D() {
  if (H && H.Hydrogen3D) H.Hydrogen3D.update({ n: __H.n, l: __H.l, m: __H.m });
}

function toggleWavefunctionView() {
  __H.cloudMode = !__H.cloudMode;
  var ids = ['btn-reveal-wf', 'btn-orbital-cloud'];
  ids.forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.textContent = __H.cloudMode ? '🎯 Back to Bohr' : '🌌 Reveal Wavefunction';
      btn.style.background = __H.cloudMode ? 'var(--accent-cyan)' : 'var(--accent-purple)';
    }
  });
  if (H && H.Hydrogen3D) H.Hydrogen3D.setCloudMode(__H.cloudMode);
}

/* ---------- Challenge 1: Spectral Detective ---------- */
var specTargets = [
  { from: 3, to: 2 }, { from: 4, to: 2 }, { from: 5, to: 2 },
  { from: 2, to: 1 }, { from: 3, to: 1 }, { from: 4, to: 1 },
  { from: 4, to: 3 }, { from: 5, to: 3 }, { from: 6, to: 2 }
];

/* Series → color. Used both for the strip and the legend. */
var SPEC_COLORS = {
  1: '#ff4ecd', // Lyman  (UV)       pink
  2: '#facc15', // Balmer (visible)  yellow
  3: '#4ade80', // Paschen (IR)      green
  4: '#00f0ff'  // Brackett (far-IR) cyan
};
var SPEC_NAMES = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen', 4: 'Brackett' };

/* Build the clickable spectral line strip. One bar per candidate
   transition, color-coded by series, with a hover tooltip showing the
   photon energy. Called once on init and re-rendered every round. */
function renderSpectralStrip() {
  var strip = document.getElementById('spectrum-strip');
  var legend = document.getElementById('spectrum-legend');
  if (!strip) return;
  strip.innerHTML = '';
  /* Sort by series (n_f) then n_i for a stable, visually grouped strip */
  var sorted = specTargets.slice().sort(function(a, b) {
    return (a.to - b.to) || (a.from - b.from);
  });
  sorted.forEach(function(t) {
    var e = H.energy_eV(t.from) - H.energy_eV(t.to);
    var bar = document.createElement('div');
    bar.className = 'spectrum-line';
    bar.style.color = SPEC_COLORS[t.to] || '#888';
    bar.style.height = (24 + Math.min(40, e * 4)) + 'px';
    bar.dataset.from = t.from;
    bar.dataset.to = t.to;
    bar.setAttribute('role', 'button');
    bar.setAttribute('tabindex', '0');
    bar.setAttribute('aria-label', t.from + ' to ' + t.to + ', ' + e.toFixed(2) + ' electronvolts');
    var tip = document.createElement('span');
    tip.className = 'line-tip';
    tip.textContent = t.from + '→' + t.to + '  ·  ' + e.toFixed(2) + ' eV';
    bar.appendChild(tip);
    bar.addEventListener('click', function() { guessTransition(t.from, t.to); });
    bar.addEventListener('keydown', function(ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        guessTransition(t.from, t.to);
      }
    });
    strip.appendChild(bar);
  });
  if (legend) {
    legend.innerHTML = '';
    Object.keys(SPEC_NAMES).forEach(function(nf) {
      var span = document.createElement('span');
      span.className = 'leg';
      span.innerHTML = '<span class="leg-dot" style="background:' + SPEC_COLORS[nf] + ';"></span>'
        + SPEC_NAMES[nf] + ' (n_f=' + nf + ')';
      legend.appendChild(span);
    });
  }
}

/* Disable the strip (no more clicks) and re-enable on next round */
function setStripEnabled(enabled) {
  var strip = document.getElementById('spectrum-strip');
  if (!strip) return;
  var bars = strip.querySelectorAll('.spectrum-line');
  for (var i = 0; i < bars.length; i++) {
    if (enabled) {
      bars[i].classList.remove('disabled', 'correct', 'wrong');
    } else {
      bars[i].classList.add('disabled');
    }
  }
}

function startSpectralChallenge() {
  var c = __H.challenge;
  c.active = true; c.score = 0; c.combo = 0; c.timeLeft = 60; c.streak = 0; c.round = 1;
  renderSpectralStrip();
  setStripEnabled(true);
  nextSpectralTarget();
  var elS = document.getElementById('spec-score');
  if (elS) elS.textContent = '0';
  var elC = document.getElementById('spec-combo');
  if (elC) elC.textContent = '0';
  var elR = document.getElementById('spec-round');
  if (elR) elR.textContent = '1';
  var elT = document.getElementById('spec-timer');
  if (elT) { elT.classList.remove('urgent'); elT.style.width = '100%'; }
  var fb = document.getElementById('spec-feedback');
  if (fb) { fb.className = 'challenge-feedback'; fb.style.display = 'none'; fb.textContent = ''; }
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
      setStripEnabled(false);
      var fb2 = document.getElementById('spec-feedback');
      if (fb2) {
        fb2.className = 'challenge-feedback error'; fb2.style.display = 'block';
        fb2.innerHTML = "⏰ Time's up! Final score: <strong>" + c.score + '</strong> XP'
          + '<br><span style="font-size:0.8rem;color:var(--text-muted);">Press 🔄 New Round to play again.</span>';
      }
    }
  }, 1000);
}

function nextSpectralTarget() {
  __H.challenge.targetN = specTargets[Math.floor(Math.random() * specTargets.length)];
  var t = __H.challenge.targetN;
  var energy = H.energy_eV(t.from) - H.energy_eV(t.to);
  var targetEl = document.getElementById('spec-target-text');
  if (targetEl) {
    targetEl.innerHTML = '🔎 <strong>Target photon:</strong> '
      + '<span id="spec-energy" style="color:var(--accent-cyan);font-family:var(--font-mono);font-weight:700;">'
      + energy.toFixed(2) + '</span> eV';
  }
  /* Refresh the strip so hover tooltips show up-to-date values and the
     correct/wrong classes from the previous round are cleared. */
  renderSpectralStrip();
  setStripEnabled(true);
}

function guessTransition(guessFrom, guessTo) {
  var c = __H.challenge;
  if (!c.active) return;
  var t = c.targetN;
  var fb = document.getElementById('spec-feedback');
  if (!fb) return;

  var correct = (guessFrom === t.from && guessTo === t.to);
  var energy = H.energy_eV(t.from) - H.energy_eV(t.to);

  /* Disable the strip during the reveal so the user can't double-click */
  setStripEnabled(false);

  /* Highlight the bar the user clicked */
  var strip = document.getElementById('spectrum-strip');
  if (strip) {
    var bars = strip.querySelectorAll('.spectrum-line');
    for (var i = 0; i < bars.length; i++) {
      var b = bars[i];
      if (Number.parseInt(b.dataset.from) === guessFrom && Number.parseInt(b.dataset.to) === guessTo) {
        b.classList.add(correct ? 'correct' : 'wrong');
      }
    }
  }

  if (correct) {
    c.streak++;
    var pts = 50 + c.streak * 5;
    c.score += pts; c.combo++;
    if (typeof __GameState !== 'undefined') {
      __GameState.addXP(pts, 'Spectral line matched!');
      if (typeof celebrateCorrect === 'function') celebrateCorrect();
    }
    fb.className = 'challenge-feedback success'; fb.style.display = 'block';
    fb.innerHTML = '✓ <strong>Correct!</strong> ' + t.from + '→' + t.to
      + ' gives ' + energy.toFixed(2) + ' eV.'
      + ' <span style="color:var(--accent-cyan);font-family:var(--font-mono);">+' + pts + ' XP</span>';
    if (typeof particleBurst === 'function') {
      var rect = strip.getBoundingClientRect();
      particleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#4ade80');
    }
    if (c.score >= 200 && typeof __GameState !== 'undefined') {
      __GameState.unlock({ id: 'spectral_analyst', title: 'Spectral Analyst', desc: 'Scored 200+ on spectral detective', icon: '🌈', xp: 25 });
    }
  } else {
    c.streak = 0; c.combo = 0;
    fb.className = 'challenge-feedback error'; fb.style.display = 'block';
    fb.innerHTML = '✗ Not this one. The target was <strong>' + t.from + '→' + t.to + '</strong> = '
      + energy.toFixed(2) + ' eV. <span style="font-size:0.85rem;">ΔE = 13.6(1/n_f² − 1/n_i²) eV</span>';
  }
  c.round++;
  var elS = document.getElementById('spec-score');
  if (elS) elS.textContent = c.score;
  var elC = document.getElementById('spec-combo');
  if (elC) elC.textContent = c.combo;
  var elR = document.getElementById('spec-round');
  if (elR) elR.textContent = c.round;
  setTimeout(function() {
    if (c.active) nextSpectralTarget();
  }, 1500);
}

function showSpecHint() {
  var t = __H.challenge.targetN;
  var fb = document.getElementById('spec-feedback');
  if (!fb) return;
  var series = SPEC_NAMES[t.to] || ('series n_f=' + t.to);
  /* Energy range of the series in eV — helps the user narrow the answer */
  var eMin = (H.energy_eV(t.to + 1) - H.energy_eV(t.to)).toFixed(2);
  var eMax = (H.energy_eV(99) - H.energy_eV(t.to)).toFixed(2);
  fb.className = 'challenge-feedback hint'; fb.style.display = 'block';
  fb.innerHTML = '💡 This line is in the <strong>' + series + '</strong> series '
    + '(n_f = ' + t.to + '). Photons in this series range from ' + eMax
    + ' eV (n_i → ∞) down to ' + eMin + ' eV (n_i = n_f + 1).';
}

/* ---------- Challenge 2: Fine Structure ---------- */
function plotFineStructure() {
  var n = 2, l = 1;
  var deltaE = 4.53e-5;

  var fineLayout = _ext(_dLayout, {
    title: { text: 'Fine Structure: n=2 splits into j=1/2 (lower) and j=3/2 (higher)', font: { size: 13 } },
    xaxis: { showticklabels: false, range: [-0.5, 4] },
    yaxis: { title: 'Energy (eV)' },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)' }
  });
  fineLayout.autosize = true; delete fineLayout.width; delete fineLayout.height;

  _plotApp('plot-fine-structure', [
    { x: [0, 1], y: [H.energy_eV(n), H.energy_eV(n)], mode: 'lines',
      line: { color: '#8080a0', width: 3 }, name: 'n=2, unperturbed' },
    { x: [1.2, 2.2], y: [H.energy_eV(n) - deltaE / 2, H.energy_eV(n) - deltaE / 2], mode: 'lines',
      line: { color: '#00f0ff', width: 3 }, name: 'j=1/2 (lower, L·S anti)' },
    { x: [2.4, 3.4], y: [H.energy_eV(n) + deltaE / 2, H.energy_eV(n) + deltaE / 2], mode: 'lines',
      line: { color: '#ff4ecd', width: 3 }, name: 'j=3/2 (higher, L·S ∥)' }
  ], fineLayout, { responsive: true, displayModeBar: false });
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
function syncSlidersFromState() {
  var n = __H.n, l = __H.l, m = __H.m, nf = __H.nf, B = __H.B;
  var lMax = Math.max(0, n - 1);

  var nMap = {
    'slider-radial-n': 'val-radial-n',
    'slider-orbital-n': 'val-orbital-n',
    'slider-zeeman-n': 'val-zeeman-n'
  };
  for (var id in nMap) {
    var el = document.getElementById(id);
    var val = document.getElementById(nMap[id]);
    if (el) { el.value = String(n); el.max = '6'; el.min = '1'; }
    if (val) val.textContent = String(n);
  }
  var niSlider = document.getElementById('slider-spectrum-ni');
  var niVal = document.getElementById('val-spectrum-ni');
  if (niSlider) { niSlider.value = String(n); niSlider.max = '8'; niSlider.min = '2'; }
  if (niVal) niVal.textContent = String(n);

  var lMap = {
    'slider-radial-l': 'val-radial-l',
    'slider-orbital-l': 'val-orbital-l',
    'slider-zeeman-l': 'val-zeeman-l'
  };
  for (var id in lMap) {
    var el = document.getElementById(id);
    var val = document.getElementById(lMap[id]);
    if (el) { el.value = String(l); el.max = String(lMax); }
    if (val) val.textContent = String(l);
  }

  var mSlider = document.getElementById('slider-orbital-m');
  var mVal = document.getElementById('val-orbital-m');
  if (mSlider) { mSlider.min = String(-l); mSlider.max = String(l); mSlider.value = String(m); }
  if (mVal) mVal.textContent = (m > 0 ? '+' : '') + m;

  var nfSlider = document.getElementById('slider-spectrum-nf');
  var nfVal = document.getElementById('val-spectrum-nf');
  var nfMax = Math.max(1, n - 1);
  if (nf > nfMax) __H.nf = nfMax;
  if (nf < 1) __H.nf = 1;
  if (nfSlider) { nfSlider.max = String(nfMax); nfSlider.value = String(__H.nf); }
  if (nfVal) nfVal.textContent = String(__H.nf);

  var bSlider = document.getElementById('slider-zeeman-B');
  var bVal = document.getElementById('val-zeeman-B');
  if (bSlider) bSlider.value = String(B);
  if (bVal) bVal.textContent = B.toFixed(1);
}

function setPlaySubMode(sub) {
  document.querySelectorAll('.tabs .tab-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.sub === sub);
  });
  document.querySelectorAll('.tab-content').forEach(function(sec) {
    sec.classList.toggle('active', sec.id === 'tab-' + sub);
  });

  setTimeout(function() {
    if (sub === 'radial') {
      plotHydrogen(__H.n, __H.l, __H.m);
      if (typeof Plotly !== 'undefined') {
        var el = document.getElementById('plot-orbitals');
        if (el && el.data) { try { Plotly.Plots.resize(el); } catch (e) {} }
      }
    } else if (sub === 'orbital') {
      sync3D();
      setTimeout(function() {
        if (H && H.Hydrogen3D && H.Hydrogen3D.resize) H.Hydrogen3D.resize();
      }, 120);
    } else if (sub === 'spectrum') {
      plotSpectrum(__H.n, __H.nf);
      if (typeof Plotly !== 'undefined') {
        var el = document.getElementById('plot-spectrum');
        if (el && el.data) { try { Plotly.Plots.resize(el); } catch (e) {} }
      }
    } else if (sub === 'zeeman') {
      plotZeeman(__H.n, __H.l, __H.B);
      if (typeof Plotly !== 'undefined') {
        var el = document.getElementById('plot-zeeman');
        if (el && el.data) { try { Plotly.Plots.resize(el); } catch (e) {} }
      }
    }
    updateLiveTable();
  }, 50);
}

function setNf(v) {
  v = Number.parseInt(v);
  if (isNaN(v)) return;
  var nfMax = Math.max(1, __H.n - 1);
  if (v > nfMax) v = nfMax;
  if (v < 1) v = 1;
  if (v >= __H.n) v = __H.n - 1;
  __H.nf = v;
  syncSlidersFromState();
  plotSpectrum(__H.n, __H.nf);
  updateLiveTable();
}

function attachSpectrumControls() {
  var nfSlider = document.getElementById('slider-spectrum-nf');
  if (nfSlider) {
    nfSlider.addEventListener('input', function(e) {
      setNf(Number.parseInt(e.target.value));
    });
  }
}

function attachZeemanControls() {
  var bSlider = document.getElementById('slider-zeeman-B');
  if (bSlider) {
    bSlider.addEventListener('input', function(e) {
      __H.B = Number.parseFloat(e.target.value);
      syncSlidersFromState();
      plotZeeman(__H.n, __H.l, __H.B);
      updateLiveTable();
    });
  }
}

function attachSliders() {
  var nIds = ['slider-radial-n', 'slider-orbital-n', 'slider-zeeman-n', 'slider-spectrum-ni'];
  nIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function(e) {
      __H.n = Number.parseInt(e.target.value);
      __H.ni = __H.n;
      if (__H.l >= __H.n) __H.l = __H.n - 1;
      if (__H.m > __H.l) __H.m = __H.l;
      if (__H.m < -__H.l) __H.m = -__H.l;
      if (__H.nf >= __H.n) __H.nf = Math.max(1, __H.n - 1);
      syncSlidersFromState();
      plotHydrogen(__H.n, __H.l, __H.m);
      plotSpectrum(__H.n, __H.nf);
      plotZeeman(__H.n, __H.l, __H.B);
      updateLiveTable();
      sync3D();
    });
  });

  var lIds = ['slider-radial-l', 'slider-orbital-l', 'slider-zeeman-l'];
  lIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function(e) {
      __H.l = Number.parseInt(e.target.value);
      if (__H.m > __H.l) __H.m = __H.l;
      if (__H.m < -__H.l) __H.m = -__H.l;
      syncSlidersFromState();
      plotHydrogen(__H.n, __H.l, __H.m);
      plotZeeman(__H.n, __H.l, __H.B);
      updateLiveTable();
      sync3D();
    });
  });

  var mSlider = document.getElementById('slider-orbital-m');
  if (mSlider) {
    mSlider.min = String(-__H.l);
    mSlider.max = String(__H.l);
    mSlider.addEventListener('input', function(e) {
      __H.m = Number.parseInt(e.target.value);
      syncSlidersFromState();
      plotHydrogen(__H.n, __H.l, __H.m);
      updateLiveTable();
      sync3D();
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  __H.ni = __H.n;
  attachSliders();
  attachSpectrumControls();
  attachZeemanControls();
  syncSlidersFromState();

  if (typeof THREE !== 'undefined' && H.Hydrogen3D.init('canvas-3d')) {
    sync3D();
  }

  if (document.getElementById('plot-orbitals')) {
    plotHydrogen(__H.n, __H.l, __H.m);
    if (typeof Plotly !== 'undefined') {
      var el = document.getElementById('plot-orbitals');
      if (el && el.data) { try { Plotly.Plots.resize(el); } catch (e) {} }
    }
  }
  if (document.getElementById('plot-spectrum')) {
    plotSpectrum(__H.n, __H.nf);
    if (typeof Plotly !== 'undefined') {
      var el = document.getElementById('plot-spectrum');
      if (el && el.data) { try { Plotly.Plots.resize(el); } catch (e) {} }
    }
  }
  if (document.getElementById('plot-zeeman')) {
    plotZeeman(__H.n, __H.l, __H.B);
    if (typeof Plotly !== 'undefined') {
      var el = document.getElementById('plot-zeeman');
      if (el && el.data) { try { Plotly.Plots.resize(el); } catch (e) {} }
    }
  }
  updateLiveTable();

  /* Mode switch hook */
  if (typeof setGameMode === 'function') {
    var orig = setGameMode;
    setGameMode = function(mode) {
      orig(mode);
      if (mode === 'play') {
        /* Default to the radial tab and redraw the active figure */
        if (typeof setPlaySubMode === 'function') setPlaySubMode('radial');
      }
      if (mode === 'challenge' && typeof startSpectralChallenge === 'function') {
        startSpectralChallenge(); plotFineStructure();
      }
      if (mode === 'puzzle') { initAufbau(); initOrbitalPuzzle(); initHundPuzzle(); }
    };
  }

  /* Nav — fill all three navigator slots */
  var modules = [
    { num: '01', name: 'QHO', url: '../01_qho/index.html' },
    { num: '02', name: 'Hydrogen', current: true },
    { num: '03', name: 'Spin-1/2', url: '../03_spin/index.html' },
    { num: '04', name: 'KP Model', url: '../04_kronig_penney/index.html' },
    { num: '05', name: 'Bands', url: '../05_energy_bands/index.html' },
    { num: '06', name: 'Fermi', url: '../06_fermi_surface/index.html' },
    { num: '07', name: 'Conductivity', url: '../07_conductivity/index.html' }
  ];
  ['module-nav', 'module-nav-story', 'module-nav-theory'].forEach(function(navId) {
    var nav = document.getElementById(navId);
    if (!nav) return;
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
  });

  /* Stats — mirror into story/theory/play sidebars */
  if (typeof __GameState !== 'undefined') {
    var xp = __GameState.xp();
    ['stat-xp', 'stat-xp-theory', 'stat-xp-play'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.textContent = xp;
    });
    ['stat-challenges', 'stat-challenges-theory', 'stat-challenges-play'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '0';
    });
    ['stat-puzzles', 'stat-puzzles-theory', 'stat-puzzles-play'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '0';
    });
    ['stat-badges', 'stat-badges-theory', 'stat-badges-play'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '0';
    });
    var navXp = document.getElementById('nav-xp');
    if (navXp) navXp.textContent = xp + ' XP';
  }
});
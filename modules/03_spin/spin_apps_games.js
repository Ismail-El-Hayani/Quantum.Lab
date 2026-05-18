/**
 * Spin-1/2 Gamified Applications — 3 modes, 6 games, XP system
 * Physics: Bloch sphere, Stern-Gerlach, ESR, Bell inequality,
 *          measurement chain, Pauli algebra, quantum gates.
 */

'use strict';

// ============ MATH UTILITIES ============
function deg2rad(d) { return d * Math.PI / 180; }
function rad2deg(r) { return r * 180 / Math.PI; }
function cos2(x) { return Math.pow(Math.cos(x), 2); }
function sin2(x) { return Math.pow(Math.sin(x), 2); }

// ============ MODULE GAME STATE ============
var SpinGame = {
  playgroundReady: false,
  ch1: { active: false, timer: null, timeLeft: 60, targetTheta: 60, attempts: 0, solved: false },
  ch2: { active: false, timer: null, timeLeft: 90, targetB: 1.0, userFreq: 28, solved: false },
  ch3: { active: false, qIndex: 0, score: 0, solved: false },
  pz1: { active: false, stage: 0, solved: false },
  pz2: { active: false, solved: false },
  pz3: { active: false, gates: [], solved: false }
};

// ============ PLAYGROUND ============
function initPlayground() {
  if (SpinGame.playgroundReady) return;
  SpinGame.playgroundReady = true;

  // Sync sliders with spin_sim.js state if elements exist
  var thSlider = document.getElementById('slider-theta');
  var phSlider = document.getElementById('slider-phi');
  if (thSlider && typeof state !== 'undefined') {
    thSlider.value = Math.round(state.theta * 180 / Math.PI);
    var vth = document.getElementById('val-theta');
    if (vth) vth.textContent = thSlider.value + '°';
  }
  if (phSlider && typeof state !== 'undefined') {
    phSlider.value = Math.round(state.phi * 180 / Math.PI);
    var vph = document.getElementById('val-phi');
    if (vph) vph.textContent = phSlider.value + '°';
  }

  // If spin_sim.js initSpin hasn't run yet, trigger it
  if (typeof initSpin === 'function' && document.getElementById('plot-bloch')) {
    try { initSpin(); } catch(e) {}
  }

  // First exploration bonus
  setTimeout(function() {
    if (!__GameState.hasAchievement('spin_explorer')) {
      __GameState.unlock({ id: 'spin_explorer', icon: '🔬', title: 'Bloch Navigator', desc: 'First steps on the Bloch sphere', xp: 10 });
      __GameState.addXP(10, 'First exploration bonus');
    }
  }, 2000);
}

// ============ CHALLENGE 1: STERN-GERLACH PREDICTOR (Easy, 50XP) ============
function initChallenge1() {
  if (SpinGame.ch1.solved) return;
  SpinGame.ch1.attempts = 0;
  SpinGame.ch1.timeLeft = 60;
  SpinGame.ch1.targetTheta = Math.round(20 + Math.random() * 140); // 20-160 deg

  var container = document.getElementById('challenge-1-container');
  if (!container) return;
  container.textContent = '';

  var panel = buildChallengePanel({
    id: 'ch1', icon: '🔬', title: 'Stern-Gerlach Predictor',
    difficulty: 'easy',
    description: 'A spin-1/2 particle is prepared at polar angle θ. The Stern-Gerlach apparatus measures Sz. Set θ so that the spin-up probability P(↑) equals the target. Formula: <strong>P(↑) = cos²(θ/2)</strong>.',
    reward: '⭐ 50 XP'
  });
  container.appendChild(panel);

  var controls = document.getElementById('ch1-controls');
  controls.textContent =
    '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:0.5rem;">' +
      '<div style="font-family:var(--mono);font-size:1.1rem;color:var(--accent-cyan);">Target P(↑) = <span id="ch1-target">' + cos2(deg2rad(SpinGame.ch1.targetTheta)/2).toFixed(3) + '</span></div>' +
      '<div class="hud-badge hud-timer">⏱ <span id="ch1-timer">60</span>s</div>' +
    '</div>' +
    '<div class="timer-bar" style="margin-bottom:0.8rem;"><div class="timer-fill" id="ch1-timer-bar" style="width:100%"></div></div>' +
    '<div style="margin-bottom:0.5rem;">' +
      '<div class="control-row"><span class="control-label">Your θ</span><span class="control-value" id="ch1-val">60°</span></div>' +
      '<input type="range" id="ch1-slider" min="0" max="180" value="60" step="1">' +
    '</div>' +
    '<div class="btn-group">' +
      '<button class="btn" id="ch1-check" onclick="ch1Check()">Check Answer</button>' +
      '<button class="btn" id="ch1-hint" onclick="ch1Hint()">Hint (-5 XP)</button>' +
    '</div>';

  document.getElementById('ch1-slider').addEventListener('input', function() {
    document.getElementById('ch1-val').textContent = this.value + '°';
    ch1Preview(this.value);
  });

  ch1Preview(60);
  startCh1Timer();

  __GameState.setProgress('spin', 10);
}

function ch1Preview(thetaDeg) {
  var pUp = cos2(deg2rad(thetaDeg) / 2);
  var pDown = sin2(deg2rad(thetaDeg) / 2);
  var fb = document.getElementById('ch1-feedback');
  if (fb) {
    fb.innerHTML = '<span style="color:var(--text-muted);">Your P(↑) = ' + pUp.toFixed(4) + ' &nbsp;·&nbsp; P(↓) = ' + pDown.toFixed(4) + '</span>';
    fb.style.display = 'block';
  }
  ch1PlotPreview(pUp, pDown);
}

function ch1PlotPreview(pUp, pDown) {
  var traces = [
    { x: ['|↑z⟩', '|↓z⟩'], y: [pUp, pDown], type: 'bar',
      marker: { color: ['rgba(0,240,255,0.7)', 'rgba(255,78,205,0.7)'] },
      text: [pUp.toFixed(3), pDown.toFixed(3)], textposition: 'auto', hoverinfo: 'y' }
  ];
  Plotly.react('ch1', traces, {
    margin: { t: 20, r: 10, b: 35, l: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { color: '#505070', gridcolor: 'transparent' },
    yaxis: { title: 'Probability', color: '#505070', gridcolor: '#1a1a28', range: [0, 1.05], tickformat: '.1f' },
    showlegend: false
  }, { responsive: true, displayModeBar: false });
}

function startCh1Timer() {
  SpinGame.ch1.timer = setInterval(function() {
    SpinGame.ch1.timeLeft--;
    var el = document.getElementById('ch1-timer');
    if (el) el.textContent = SpinGame.ch1.timeLeft;
    var bar = document.getElementById('ch1-timer-bar');
    if (bar) bar.style.width = (SpinGame.ch1.timeLeft / 60 * 100) + '%';
    if (SpinGame.ch1.timeLeft <= 10 && bar) bar.classList.add('urgent');
    if (SpinGame.ch1.timeLeft <= 0) {
      clearInterval(SpinGame.ch1.timer);
      var fb = document.getElementById('ch1-feedback');
      if (fb) {
        fb.className = 'challenge-feedback error';
        fb.innerHTML = '<strong>Time\'s up!</strong> The correct θ was ' + SpinGame.ch1.targetTheta + '°. Try again!';
      }
    }
  }, 1000);
}

function ch1Check() {
  var thetaDeg = Number.parseInt(document.getElementById('ch1-slider').value);
  var targetP = cos2(deg2rad(SpinGame.ch1.targetTheta) / 2);
  var userP = cos2(deg2rad(thetaDeg) / 2);
  var diff = Math.abs(userP - targetP);
  SpinGame.ch1.attempts++;

  var fb = document.getElementById('ch1-feedback');
  if (diff < 0.02) {
    clearInterval(SpinGame.ch1.timer);
    SpinGame.ch1.solved = true;
    fb.className = 'challenge-feedback success';
    fb.innerHTML = '<strong>Correct!</strong> θ = ' + thetaDeg + '° gives P(↑) = ' + userP.toFixed(4) + '. Resonance locked!';
    var combo = celebrateCorrect();
    __GameState.addXP(50 + combo.bonus, 'Stern-Gerlach Predictor');
    __GameState.unlock({ id: 'sg_predictor', icon: '🔬', title: 'Quantum Crusher', desc: 'Mastered Stern-Gerlach probabilities', xp: 50 });
    __GameState.setProgress('spin', 30);
    particleBurst(window.innerWidth / 2, window.innerHeight / 2);
  } else {
    fb.className = 'challenge-feedback error';
    var hint = userP > targetP ? 'Your probability is too high. Increase θ.' : 'Your probability is too low. Decrease θ.';
    fb.innerHTML = '<strong>Not quite.</strong> ' + hint + ' (Attempt ' + SpinGame.ch1.attempts + ')';
  }
}

function ch1Hint() {
  __GameState.addXP(-5, 'Hint used');
  var fb = document.getElementById('ch1-feedback');
  fb.className = 'challenge-feedback hint';
  fb.textContent = 'Hint: P(↑) = cos²(θ/2). At θ=' + SpinGame.ch1.targetTheta + '°, P(↑) ≈ ' + cos2(deg2rad(SpinGame.ch1.targetTheta)/2).toFixed(3) + '. Try θ around ' + (SpinGame.ch1.targetTheta + (Math.random()<0.5?-5:5)) + '°.';
}

// ============ CHALLENGE 2: ESR RESONANCE (Medium, 75XP) ============
function initChallenge2() {
  if (SpinGame.ch2.solved) return;
  SpinGame.ch2.timeLeft = 90;
  SpinGame.ch2.targetB = 0.3 + Math.random() * 2.7; // 0.3 - 3.0 T
  SpinGame.ch2.userFreq = 10;

  var container = document.getElementById('challenge-2-container');
  if (!container) return;
  container.textContent = '';

  var panel = buildChallengePanel({
    id: 'ch2', icon: '⚡', title: 'ESR Resonance Sweep',
    difficulty: 'medium',
    description: 'An electron spin sits in a magnetic field <strong>B = ' + SpinGame.ch2.targetB.toFixed(2) + ' T</strong>. Tune the microwave frequency to hit the Larmor resonance. Formula: <strong>f = gμ<sub>B</sub>B/h ≈ 28.024 × B GHz</strong> (for g≈2). Match the peak!',
    reward: '⭐ 75 XP'
  });
  container.appendChild(panel);

  var controls = document.getElementById('ch2-controls');
  controls.textContent =
    '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:0.5rem;">' +
      '<div class="hud-badge hud-timer">⏱ <span id="ch2-timer">90</span>s</div>' +
    '</div>' +
    '<div class="timer-bar" style="margin-bottom:0.8rem;"><div class="timer-fill" id="ch2-timer-bar" style="width:100%"></div></div>' +
    '<div style="margin-bottom:0.5rem;">' +
      '<div class="control-row"><span class="control-label">Microwave f</span><span class="control-value" id="ch2-val">10.00</span><span class="unit-tag">GHz</span></div>' +
      '<input type="range" id="ch2-slider" min="5" max="90" value="10" step="0.1">' +
    '</div>' +
    '<div class="btn-group">' +
      '<button class="btn" id="ch2-check" onclick="ch2Check()">Fire Microwave</button>' +
      '<button class="btn" id="ch2-hint" onclick="ch2Hint()">Hint (-5 XP)</button>' +
    '</div>';

  document.getElementById('ch2-slider').addEventListener('input', function() {
    document.getElementById('ch2-val').textContent = Number.parseFloat(this.value).toFixed(2);
    ch2Plot();
  });

  ch2Plot();
  startCh2Timer();
}

function ch2Plot() {
  var B = SpinGame.ch2.targetB;
  var f0 = 28.024 * B;
  var fUser = Number.parseFloat(document.getElementById('ch2-slider').value);
  var fArr = [], sig = [];
  for (var f = 5; f <= 90; f += 0.5) {
    fArr.push(f);
    var lw = 0.8;
    sig.push(1 / (1 + Math.pow((f - f0)/lw, 2)));
  }

  var traces = [
    { x: fArr, y: sig, mode: 'lines', name: 'Absorption',
      line: { color: '#00f0ff', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(0,212,255,0.1)' },
    { x: [f0, f0], y: [0, 1.2], mode: 'lines', name: 'True resonance',
      line: { color: 'rgba(255,64,129,0.4)', width: 2, dash: 'dash' } },
    { x: [fUser, fUser], y: [0, 1.2], mode: 'lines', name: 'Your freq',
      line: { color: '#ffd740', width: 2 } }
  ];

  Plotly.react('ch2', traces, {
    margin: { t: 25, r: 10, b: 45, l: 55 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'JetBrains Mono, monospace', color: '#8080a0', size: 11 },
    xaxis: { title: 'Frequency (GHz)', color: '#505070', gridcolor: '#1a1a28' },
    yaxis: { title: 'Absorption (arb.)', color: '#505070', gridcolor: '#1a1a28', range: [0, 1.2] },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(10,10,15,0.8)', bordercolor: '#2a2a3a', borderwidth: 1 },
    hovermode: 'x unified'
  }, { responsive: true, displayModeBar: false });
}

function startCh2Timer() {
  SpinGame.ch2.timer = setInterval(function() {
    SpinGame.ch2.timeLeft--;
    var el = document.getElementById('ch2-timer');
    if (el) el.textContent = SpinGame.ch2.timeLeft;
    var bar = document.getElementById('ch2-timer-bar');
    if (bar) bar.style.width = (SpinGame.ch2.timeLeft / 90 * 100) + '%';
    if (SpinGame.ch2.timeLeft <= 15 && bar) bar.classList.add('urgent');
    if (SpinGame.ch2.timeLeft <= 0) {
      clearInterval(SpinGame.ch2.timer);
      var fb = document.getElementById('ch2-feedback');
      if (fb) {
        fb.className = 'challenge-feedback error';
        fb.innerHTML = '<strong>Time\'s up!</strong> The resonance was at ' + (28.024 * SpinGame.ch2.targetB).toFixed(2) + ' GHz.';
      }
    }
  }, 1000);
}

function ch2Check() {
  var fUser = Number.parseFloat(document.getElementById('ch2-slider').value);
  var f0 = 28.024 * SpinGame.ch2.targetB;
  var diff = Math.abs(fUser - f0);
  var fb = document.getElementById('ch2-feedback');

  if (diff < 1.0) {
    clearInterval(SpinGame.ch2.timer);
    SpinGame.ch2.solved = true;
    fb.className = 'challenge-feedback success';
    fb.innerHTML = '<strong>Resonance locked!</strong> f₀ = ' + f0.toFixed(2) + ' GHz at B = ' + SpinGame.ch2.targetB.toFixed(2) + ' T.';
    var combo = celebrateCorrect();
    __GameState.addXP(75 + combo.bonus, 'ESR Resonance');
    __GameState.unlock({ id: 'esr_master', icon: '⚡', title: 'Resonance Hunter', desc: 'Tuned microwave to Larmor frequency', xp: 75 });
    __GameState.setProgress('spin', 55);
    particleBurst(window.innerWidth / 2, window.innerHeight / 2);
  } else {
    fb.className = 'challenge-feedback error';
    var dir = fUser > f0 ? 'Too high' : 'Too low';
    fb.innerHTML = '<strong>' + dir + '.</strong> You are ' + diff.toFixed(2) + ' GHz away from resonance. The peak shifts linearly with B!';
  }
}

function ch2Hint() {
  __GameState.addXP(-5, 'Hint used');
  var f0 = 28.024 * SpinGame.ch2.targetB;
  var fb = document.getElementById('ch2-feedback');
  fb.className = 'challenge-feedback hint';
  fb.textContent = 'Hint: f₀ ≈ 28 × B. With B = ' + SpinGame.ch2.targetB.toFixed(2) + ' T, the resonance is near ' + f0.toFixed(1) + ' GHz.';
}

// ============ CHALLENGE 3: BELL INEQUALITY Q&A (Hard, 100XP) ============
var CH3_QUESTIONS = [
  {
    q: 'Bell\'s theorem (1964) proved that no physical theory which is...',
    options: ['...deterministic can reproduce quantum mechanics.',
              '...local and realistic can reproduce all quantum predictions.',
              '...non-relativistic can explain entanglement.',
              '...linear can describe spin-1/2 systems.'],
    correct: 1,
    insight: 'Bell showed that any theory assuming locality + realism (hidden variables) must obey |S| ≤ 2, while quantum mechanics predicts |S| ≤ 2√2.'
  },
  {
    q: 'For a maximally entangled Bell state |Φ⁺⟩ = (|↑↑⟩ + |↓↓⟩)/√2, the CHSH parameter S reaches...',
    options: ['S = 0 (no correlation)', 'S = 2 (classical bound)', 'S = 2√2 ≈ 2.828 (Tsirelson bound)', 'S = 4 (absolute maximum)'],
    correct: 2,
    insight: '2√2 is the Tsirelson bound — the maximum quantum violation of the CHSH inequality. No quantum state can exceed it.'
  },
  {
    q: 'What does experimental violation of Bell\'s inequality demonstrate about nature?',
    options: ['Quantum mechanics is incomplete.', 'Nature is non-local or non-realistic (or both).', 'Information can travel faster than light.', ' spins are classical magnetic dipoles.'],
    correct: 1,
    insight: 'Experiments (Aspect, Zeilinger, Hanson) rule out local hidden-variable theories. Nature does not pre-determine measurement outcomes independently of the measurement setting.'
  }
];

function initChallenge3() {
  if (SpinGame.ch3.solved) return;
  SpinGame.ch3.qIndex = 0;
  SpinGame.ch3.score = 0;

  var container = document.getElementById('challenge-3-container');
  if (!container) return;
  container.textContent = '';

  var panel = buildChallengePanel({
    id: 'ch3', icon: '🔮', title: 'Bell Inequality Paradox',
    difficulty: 'hard',
    description: 'Three conceptual questions about Bell\'s theorem, the CHSH inequality, and what experiments tell us about the nature of reality. No calculator needed — just quantum insight.',
    reward: '⭐ 100 XP'
  });
  container.appendChild(panel);

  ch3RenderQuestion();
}

function ch3RenderQuestion() {
  var q = CH3_QUESTIONS[SpinGame.ch3.qIndex];
  if (!q) { ch3Finish(); return; }

  var controls = document.getElementById('ch3-controls');
  var progressPct = ((SpinGame.ch3.qIndex) / CH3_QUESTIONS.length) * 100;
  controls.textContent =
    '<div style="margin-bottom:0.6rem;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;color:var(--text-dim);margin-bottom:0.3rem;">' +
        '<span>Question ' + (SpinGame.ch3.qIndex + 1) + ' of ' + CH3_QUESTIONS.length + '</span>' +
        '<span>Score: ' + SpinGame.ch3.score + '</span>' +
      '</div>' +
      '<div class="timer-bar" style="height:6px;border-radius:3px;"><div class="timer-fill" style="width:' + progressPct + '%;transition:width 0.3s ease;"></div></div>' +
    '</div>' +
    '<div style="margin-bottom:0.8rem;font-size:0.95rem;color:var(--text-main);line-height:1.5;">' +
      '<strong>Q' + (SpinGame.ch3.qIndex + 1) + '/3:</strong> ' + q.q +
    '</div>' +
    '<div id="ch3-options" style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:0.8rem;">' +
      q.options.map(function(opt, i) {
        return '<button class="btn ch3-opt" style="text-align:left;width:100%;" onclick="ch3Answer(' + i + ')">' + ['A','B','C','D'][i] + '. ' + opt + '</button>';
      }).join('') +
    '</div>';
}

function ch3Answer(idx) {
  var q = CH3_QUESTIONS[SpinGame.ch3.qIndex];
  var fb = document.getElementById('ch3-feedback');
  var opts = document.querySelectorAll('.ch3-opt');
  opts.forEach(function(b, i) { b.disabled = true; });

  if (idx === q.correct) {
    SpinGame.ch3.score++;
    opts[idx].style.borderColor = 'var(--accent-green)';
    opts[idx].style.background = 'rgba(105,240,174,0.1)';
    fb.className = 'challenge-feedback success';
    fb.innerHTML = '<strong>Correct!</strong> ' + q.insight;
    celebrateCorrect();
  } else {
    opts[idx].style.borderColor = 'var(--accent-red)';
    opts[idx].style.background = 'rgba(255,68,68,0.1)';
    fb.className = 'challenge-feedback error';
    fb.innerHTML = '<strong>Not quite.</strong> ' + q.insight;
  }

  setTimeout(function() {
    SpinGame.ch3.qIndex++;
    if (SpinGame.ch3.qIndex < CH3_QUESTIONS.length) {
      ch3RenderQuestion();
    } else {
      ch3Finish();
    }
  }, 2500);
}

function ch3Finish() {
  var fb = document.getElementById('ch3-feedback');
  if (SpinGame.ch3.score >= 2) {
    SpinGame.ch3.solved = true;
    fb.className = 'challenge-feedback success';
    fb.innerHTML = '<strong>Paradox mastered!</strong> You scored ' + SpinGame.ch3.score + '/3. Bell\'s inequality is a cornerstone of quantum foundations.';
    var combo = celebrateCorrect();
    __GameState.addXP(100 + combo.bonus, 'Bell Inequality Paradox');
    __GameState.unlock({ id: 'bell_solver', icon: '🔮', title: 'Bell Solver', desc: 'Conquered the quantum reality paradox', xp: 100 });
    __GameState.setProgress('spin', 80);
    particleBurst(window.innerWidth / 2, window.innerHeight / 2);
  } else {
    fb.className = 'challenge-feedback error';
    fb.innerHTML = '<strong>Room for improvement.</strong> You scored ' + SpinGame.ch3.score + '/3. Review the theory and try again!';
  }
}

// ============ PUZZLE 1: MEASUREMENT CHAIN (Medium, 60XP) ============
function initPuzzle1() {
  if (SpinGame.pz1.solved) return;
  SpinGame.pz1.stage = 0;

  var container = document.getElementById('puzzle-1-container');
  if (!container) return;
  container.textContent = '';

  var panel = buildChallengePanel({
    id: 'pz1', icon: '🧲', title: 'Measurement Chain',
    difficulty: 'medium',
    description: 'Start with a spin in state |↑z⟩. You perform three consecutive Stern-Gerlach measurements: <strong>Sz → Sx → Sz</strong>. Predict the final outcome probabilities after all three measurements.',
    reward: '⭐ 60 XP'
  });
  container.appendChild(panel);

  var controls = document.getElementById('pz1-controls');
  controls.textContent =
    '<div id="pz1-chain" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;font-family:var(--mono);font-size:0.85rem;flex-wrap:wrap;justify-content:center;padding:0.8rem;background:var(--bg-deep);border-radius:8px;border:1px solid var(--glass-border);">' +
      '<span style="background:rgba(0,212,255,0.1);padding:0.4rem 0.8rem;border-radius:6px;border:1px solid rgba(0,212,255,0.3);color:var(--accent-cyan);">|↑z⟩</span>' +
      '<span style="color:var(--text-dim);font-size:1.2rem;">➜</span>' +
      '<span id="pz1-m1" style="padding:0.4rem 0.8rem;border-radius:6px;border:1px dashed var(--border-subtle);color:var(--text-dim);background:var(--bg-elevated);min-width:60px;text-align:center;">Sz ?</span>' +
      '<span style="color:var(--text-dim);font-size:1.2rem;">➜</span>' +
      '<span id="pz1-m2" style="padding:0.4rem 0.8rem;border-radius:6px;border:1px dashed var(--border-subtle);color:var(--text-dim);background:var(--bg-elevated);min-width:60px;text-align:center;">Sx ?</span>' +
      '<span style="color:var(--text-dim);font-size:1.2rem;">➜</span>' +
      '<span id="pz1-m3" style="padding:0.4rem 0.8rem;border-radius:6px;border:1px dashed var(--border-subtle);color:var(--text-dim);background:var(--bg-elevated);min-width:60px;text-align:center;">Sz ?</span>' +
    '</div>' +
    '<div id="pz1-stage-text" style="margin-bottom:0.8rem;font-size:0.9rem;color:var(--text-muted);">After measuring Sz on |↑z⟩, what is the outcome?</div>' +
    '<div class="btn-group" id="pz1-buttons">' +
      '<button class="btn" onclick="pz1Step(0)">|↑z⟩ (certain)</button>' +
    '</div>';

  document.getElementById('pz1-feedback').innerHTML = '<span style="color:var(--text-dim);">Build the chain step by step.</span>';
  document.getElementById('pz1-feedback').style.display = 'block';
}

function pz1Step(choice) {
  var stages = [
    { text: 'After measuring Sz on |↑z⟩, what is the outcome?', next: [
      { label: '|↑z⟩ (certain)', val: 'upz', correct: true }
    ]},
    { text: 'Now measure Sx on |↑z⟩. What are the probabilities for |+x⟩ and |−x⟩?', next: [
      { label: '|+x⟩ 100%', val: 'plus', correct: false },
      { label: '|−x⟩ 100%', val: 'minus', correct: false },
      { label: '50% |+x⟩, 50% |−x⟩', val: 'fifty', correct: true }
    ]},
    { text: 'Finally measure Sz again on the post-Sx state. What is P(|↑z⟩)?', next: [
      { label: '100%', val: 'hundred', correct: false },
      { label: '50%', val: 'fifty2', correct: true },
      { label: '0%', val: 'zero', correct: false }
    ]}
  ];

  var fb = document.getElementById('pz1-feedback');
  var stage = stages[SpinGame.pz1.stage];
  var chosen = stage.next[choice];

  if (!chosen.correct) {
    fb.className = 'challenge-feedback error';
    fb.innerHTML = '<strong>Not correct.</strong> Remember: measuring along a different axis destroys the previous eigenstate information.';
    return;
  }

  // Update chain display
  var labels = { upz: '|↑z⟩', fifty: '50/50', fifty2: '50/50' };
  var el = document.getElementById('pz1-m' + (SpinGame.pz1.stage + 1));
  if (el) {
    el.textContent = labels[chosen.val] || chosen.label;
    el.style.background = 'rgba(105,240,174,0.1)';
    el.style.borderColor = 'var(--accent-green)';
    el.style.color = 'var(--accent-green)';
  }

  SpinGame.pz1.stage++;
  if (SpinGame.pz1.stage >= stages.length) {
    SpinGame.pz1.solved = true;
    fb.className = 'challenge-feedback success';
    fb.innerHTML = '<strong>Chain complete!</strong> The z→x→z measurement sequence demonstrates that spin components are incompatible observables. After Sx, the Sz information is completely lost — you get 50/50 again.';
    var combo = celebrateCorrect();
    __GameState.addXP(60 + combo.bonus, 'Measurement Chain');
    __GameState.unlock({ id: 'chain_builder', icon: '🧲', title: 'Measurement Chain Master', desc: 'Built the z→x→z Stern-Gerlach sequence', xp: 60 });
    __GameState.setProgress('spin', 70);
    particleBurst(window.innerWidth / 2, window.innerHeight / 2);
    return;
  }

  fb.className = 'challenge-feedback success';
  fb.textContent = 'Good! ' + stage.next[choice].label;

  var nextStage = stages[SpinGame.pz1.stage];
  document.getElementById('pz1-stage-text').textContent = nextStage.text;
  var btns = document.getElementById('pz1-buttons');
  btns.textContent = '';
  nextStage.next.forEach(function(opt, i) {
    var b = document.createElement('button');
    b.className = 'btn';
    b.textContent = opt.label;
    b.onclick = function() { pz1Step(i); };
    btns.appendChild(b);
  });
}

// ============ PUZZLE 2: PAULI MATRIX ALGEBRA (Hard, 80XP) ============
function initPuzzle2() {
  if (SpinGame.pz2.solved) return;

  var container = document.getElementById('puzzle-2-container');
  if (!container) return;
  container.textContent = '';

  var panel = buildChallengePanel({
    id: 'pz2', icon: '📐', title: 'Pauli Matrix Algebra',
    difficulty: 'hard',
    description: 'The Pauli matrices σ<sub>x</sub>, σ<sub>y</sub>, σ<sub>z</sub> form the foundation of spin-1/2 algebra. Compute the commutator [σ<sub>x</sub>, σ<sub>y</sub>] = σ<sub>x</sub>σ<sub>y</sub> − σ<sub>y</sub>σ<sub>x</sub> and select the correct result.',
    reward: '⭐ 80 XP'
  });
  container.appendChild(panel);

  var controls = document.getElementById('pz2-controls');
  controls.textContent =
    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.8rem;margin-bottom:0.8rem;">' +
      '<div style="background:var(--bg-deep);padding:0.8rem;border-radius:8px;border:1px solid var(--border-subtle);font-family:var(--mono);font-size:0.85rem;">' +
        '<div style="color:var(--accent-cyan);margin-bottom:0.3rem;">σ<sub>x</sub></div>' +
        '[[0, 1], [1, 0]]' +
      '</div>' +
      '<div style="background:var(--bg-deep);padding:0.8rem;border-radius:8px;border:1px solid var(--border-subtle);font-family:var(--mono);font-size:0.85rem;">' +
        '<div style="color:var(--accent-cyan);margin-bottom:0.3rem;">σ<sub>y</sub></div>' +
        '[[0, −i], [i, 0]]' +
      '</div>' +
    '</div>' +
    '<div style="margin-bottom:0.8rem;font-family:var(--mono);font-size:1rem;color:var(--text-main);">' +
      '[σ<sub>x</sub>, σ<sub>y</sub>] = ?' +
    '</div>' +
    '<div id="pz2-options" style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:0.8rem;">' +
      '<button class="btn pz2-opt" style="text-align:left;" onclick="pz2Check(0)">A. 0 (they commute)</button>' +
      '<button class="btn pz2-opt" style="text-align:left;" onclick="pz2Check(1)">B. iσ<sub>z</sub></button>' +
      '<button class="btn pz2-opt" style="text-align:left;" onclick="pz2Check(2)">C. 2iσ<sub>z</sub></button>' +
      '<button class="btn pz2-opt" style="text-align:left;" onclick="pz2Check(3)">D. −2σ<sub>z</sub></button>' +
    '</div>';
}

function pz2Check(idx) {
  var fb = document.getElementById('pz2-feedback');
  var opts = document.querySelectorAll('.pz2-opt');
  opts.forEach(function(b) { b.disabled = true; });

  if (idx === 2) {
    SpinGame.pz2.solved = true;
    opts[2].style.borderColor = 'var(--accent-green)';
    opts[2].style.background = 'rgba(105,240,174,0.1)';
    fb.className = 'challenge-feedback success';
    fb.innerHTML = '<strong>Exactly!</strong> [σ<sub>x</sub>, σ<sub>y</sub>] = 2iσ<sub>z</sub>. In general [σ<sub>i</sub>, σ<sub>j</sub>] = 2iε<sub>ijk</sub>σ<sub>k</sub>. This non-commutativity is the mathematical root of spin uncertainty.';
    var combo = celebrateCorrect();
    __GameState.addXP(80 + combo.bonus, 'Pauli Matrix Algebra');
    __GameState.unlock({ id: 'pauli_master', icon: '📐', title: 'Pauli Architect', desc: 'Mastered spin-1/2 matrix algebra', xp: 80 });
    __GameState.setProgress('spin', 90);
    particleBurst(window.innerWidth / 2, window.innerHeight / 2);
  } else {
    var msgs = [
      'Incorrect. Pauli matrices do NOT commute. They generate SU(2).',
      'Close! That\'s the result for the commutator of S<sub>x</sub> and S<sub>y</sub> (spin operators with ℏ/2), but here we use the σ matrices themselves.',
      '',
      'Incorrect. The sign and factor of i matter. Work out σ<sub>x</sub>σ<sub>y</sub> and σ<sub>y</sub>σ<sub>x</sub> explicitly.'
    ];
    opts[idx].style.borderColor = 'var(--accent-red)';
    opts[idx].style.background = 'rgba(255,68,68,0.1)';
    fb.className = 'challenge-feedback error';
    fb.innerHTML = '<strong>Not quite.</strong> ' + msgs[idx] + ' Try again by refreshing the puzzle!';
    // Allow retry after delay
    setTimeout(function() { initPuzzle2(); }, 3000);
  }
}

// ============ PUZZLE 3: QUANTUM GATE PUZZLE (Master, 120XP) ============
var GATE_DEFS = {
  H: { name: 'Hadamard', matrix: '1/√2 [[1,1],[1,-1]]', action: '|0⟩↔|+⟩, |1⟩↔|−⟩' },
  Z: { name: 'Pauli-Z', matrix: '[[1,0],[0,-1]]', action: 'Phase flip: |+⟩→|−⟩, |−⟩→|+⟩' },
  X: { name: 'Pauli-X', matrix: '[[0,1],[1,0]]', action: 'Bit flip' },
  S: { name: 'Phase', matrix: '[[1,0],[0,i]]', action: '|1⟩→i|1⟩' }
};

function initPuzzle3() {
  if (SpinGame.pz3.solved) return;
  SpinGame.pz3.gates = [];

  var container = document.getElementById('puzzle-3-container');
  if (!container) return;
  container.textContent = '';

  var panel = buildChallengePanel({
    id: 'pz3', icon: '💻', title: 'Quantum Gate Puzzle',
    difficulty: 'master',
    description: 'Build a <strong>3-gate circuit</strong> that sends |0⟩ back to |0⟩. Available gates: H (Hadamard), Z (phase flip), X (bit flip). Hint: H-Z-H is a famous identity. Verify the state at each step.',
    reward: '⭐ 120 XP'
  });
  container.appendChild(panel);

  var controls = document.getElementById('pz3-controls');
  controls.textContent =
    '<div style="display:flex;gap:0.5rem;margin-bottom:0.8rem;flex-wrap:wrap;">' +
      '<button class="btn" onclick="pz3AddGate(\'H\')">Add H</button>' +
      '<button class="btn" onclick="pz3AddGate(\'Z\')">Add Z</button>' +
      '<button class="btn" onclick="pz3AddGate(\'X\')">Add X</button>' +
      '<button class="btn" onclick="pz3Clear()">Clear</button>' +
    '</div>' +
    '<div id="pz3-circuit" style="background:var(--bg-deep);padding:1rem;border-radius:8px;border:1px solid var(--border-subtle);font-family:var(--mono);margin-bottom:0.8rem;min-height:60px;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">' +
      '<span style="color:var(--text-dim);">Initial:</span>' +
      '<span style="background:rgba(0,212,255,0.1);padding:0.3rem 0.6rem;border-radius:6px;border:1px solid rgba(0,212,255,0.3);">|0⟩</span>' +
    '</div>' +
    '<div id="pz3-state-display" style="font-family:var(--mono);font-size:0.9rem;color:var(--text-muted);margin-bottom:0.8rem;">' +
      'Current state: |0⟩' +
    '</div>' +
    '<div class="btn-group">' +
      '<button class="btn" id="pz3-verify" onclick="pz3Verify()">Verify Circuit</button>' +
    '</div>';
}

function pz3AddGate(gate) {
  if (SpinGame.pz3.gates.length >= 5) return;
  SpinGame.pz3.gates.push(gate);
  pz3UpdateCircuit();
}

function pz3Clear() {
  SpinGame.pz3.gates = [];
  pz3UpdateCircuit();
}

function pz3UpdateCircuit() {
  var el = document.getElementById('pz3-circuit');
  var html = '<span style="color:var(--text-dim);">Initial:</span> <span style="background:rgba(0,212,255,0.1);padding:0.3rem 0.6rem;border-radius:6px;border:1px solid rgba(0,212,255,0.3);">|0⟩</span>';
  var state = { theta: 0, phi: 0, name: '|0⟩' };

  SpinGame.pz3.gates.forEach(function(g) {
    html += '<span style="color:var(--text-dim);">→</span>';
    if (g === 'H') {
      html += '<span style="background:rgba(105,240,174,0.1);padding:0.3rem 0.6rem;border-radius:6px;border:1px solid rgba(105,240,174,0.3);color:var(--accent-green);">H</span>';
      state = { theta: Math.PI/2, phi: 0, name: (state.name === '|0⟩' || state.name === '|+⟩') ? '|+⟩' : '|−⟩' };
    } else if (g === 'Z') {
      html += '<span style="background:rgba(255,64,129,0.1);padding:0.3rem 0.6rem;border-radius:6px;border:1px solid rgba(255,64,129,0.3);color:var(--accent-pink);">Z</span>';
      if (state.name === '|+⟩') state = { theta: Math.PI/2, phi: Math.PI, name: '|−⟩' };
      else if (state.name === '|−⟩') state = { theta: Math.PI/2, phi: 0, name: '|+⟩' };
      else if (state.name === '|0⟩') state.name = '|0⟩';
      else if (state.name === '|1⟩') state.name = '|1⟩';
    } else if (g === 'X') {
      html += '<span style="background:rgba(255,215,64,0.1);padding:0.3rem 0.6rem;border-radius:6px;border:1px solid rgba(255,215,64,0.3);color:var(--accent-yellow);">X</span>';
      if (state.name === '|0⟩') state = { theta: Math.PI, phi: 0, name: '|1⟩' };
      else if (state.name === '|1⟩') state = { theta: 0, phi: 0, name: '|0⟩' };
      else if (state.name === '|+⟩') state = { theta: Math.PI/2, phi: Math.PI, name: '|−⟩' };
      else if (state.name === '|−⟩') state = { theta: Math.PI/2, phi: 0, name: '|+⟩' };
    }
  });

  el.textContent = html;
  document.getElementById('pz3-state-display').textContent = 'Current state: ' + state.name;
}

function pz3Verify() {
  var fb = document.getElementById('pz3-feedback');
  var gates = SpinGame.pz3.gates;

  // Compute final state
  var theta = 0, phi = 0;
  gates.forEach(function(g) {
    if (g === 'H') {
      if (theta === 0) { theta = Math.PI/2; phi = 0; }
      else if (Math.abs(theta - Math.PI) < 0.01) { theta = Math.PI/2; phi = Math.PI; }
      else if (Math.abs(theta - Math.PI/2) < 0.01 && Math.abs(phi) < 0.01) { theta = 0; phi = 0; }
      else if (Math.abs(theta - Math.PI/2) < 0.01 && Math.abs(phi - Math.PI) < 0.01) { theta = Math.PI; phi = 0; }
    } else if (g === 'Z') {
      phi = phi + Math.PI;
    } else if (g === 'X') {
      theta = Math.PI - theta;
    }
  });

  // Normalize phi
  while (phi > 2*Math.PI) phi -= 2*Math.PI;
  while (phi < 0) phi += 2*Math.PI;

  // Check if back to |0⟩
  var isZero = Math.abs(theta) < 0.1;

  if (isZero && gates.length > 0) {
    SpinGame.pz3.solved = true;
    fb.className = 'challenge-feedback success';
    fb.innerHTML = '<strong>Circuit verified!</strong> You built a sequence that returns |0⟩ → |0⟩. H-Z-H is a quantum identity: HZH = X (up to a phase). This demonstrates that quantum gates are reversible and compose unitarily.';
    var combo = celebrateCorrect();
    __GameState.addXP(120 + combo.bonus, 'Quantum Gate Puzzle');
    __GameState.unlock({ id: 'gate_master', icon: '💻', title: 'Quantum Architect', desc: 'Constructed the H-Z-H identity circuit', xp: 120 });
    __GameState.setProgress('spin', 100);
    particleBurst(window.innerWidth / 2, window.innerHeight / 2);
  } else {
    fb.className = 'challenge-feedback error';
    var hint = '';
    if (gates.length === 0) hint = 'You need at least one gate!';
    else if (gates.length === 1) hint = 'One gate is not enough. Try adding more gates.';
    else if (gates.length === 2) hint = 'Two gates: try H followed by Z, then another gate...';
    else hint = 'Almost! Track the state: |0⟩ → H → |+⟩ → Z → |−⟩ → H → ?';
    fb.innerHTML = '<strong>Not back to |0⟩.</strong> ' + hint;
  }
}

// ============ INIT ALL ============
function initChallenges() {
  initChallenge1();
  initChallenge2();
  initChallenge3();
}

function initPuzzles() {
  initPuzzle1();
  initPuzzle2();
  initPuzzle3();
}

function initSpinGames() {
  initPlayground();
  updateNavXP();
  if (document.getElementById('section-challenge').style.display !== 'none') initChallenges();
  if (document.getElementById('section-puzzle').style.display !== 'none') initPuzzles();
}

if (document.readyState !== 'loading') {
  setTimeout(initSpinGames, 1000);
} else {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(initSpinGames, 1000); });
}

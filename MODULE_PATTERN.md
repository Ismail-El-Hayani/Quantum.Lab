# Module Gamification Pattern — Physics Playground

Every module MUST follow this exact structure:

## File Layout
```
modules/XX_name/
  index.html          — Gamified 3-mode layout (replaces old index.html)
  *_apps_games.js     — Gamified simulations (replaces *_apps.js)
  *_sim.js            — Keep existing (physics engine)
```

## index.html Structure

### <head>
- Import Plotly.js (CDN)
- Import MathJax (CDN)
- Import ../../shared_styles.css
- Module-specific inline CSS for game elements (draggable particles, drop zones, timer bars, etc.)

### Top of <body>
```html
<nav class="game-nav">
  <div class="nav-brand"><a href="../../index.html"><span class="nav-logo">⚛</span> Physics Playground</a></div>
  <div class="nav-stats">
    <div class="stat-badge"><span class="stat-icon">📐</span><span class="stat-value">[Module Name]</span></div>
    <div class="stat-badge"><span class="stat-icon">⭐</span><span class="stat-value" id="nav-xp">0 XP</span></div>
  </div>
</nav>
```

### Hero Section
- Level badge: "Module XX · Level N · [Title]"
- h1 with gradient-cyan text
- Short description of the physics mission

### Game Mode Bar
```html
<div class="game-mode-bar">
  <button class="game-mode-btn active" onclick="setGameMode('play')">🔬 Playground</button>
  <button class="game-mode-btn" onclick="setGameMode('challenge')">🎯 Challenges</button>
  <button class="game-mode-btn" onclick="setGameMode('puzzle')">🧩 Puzzles</button>
</div>
```

### Mode Sections
- <div id="section-play"> — Free experiment with sliders (the "aha!" sandbox)
- <div id="section-challenge" style="display:none"> — 3 challenges with scoring, timers, combos
- <div id="section-puzzle" style="display:none"> — 3 puzzles (drag-and-drop, matching, selection)

### Right Sidebar
- Module navigator (all 7 modules, current highlighted)
- Badge list
- Scoreboard (challenges, puzzles, XP, badges)

### Scripts
```html
<script src="../../shared_ui.js"></script>
<script src="../../shared_games.js"></script>
<script src="../../shared_interactive.js"></script>
<script src="XX_sim.js"></script>
<script src="XX_apps_games.js"></script>
```

## *_apps_games.js Pattern

### Top: Math utilities (copy from module-specific equations)
### Middle: Game state object
### Functions:
1. **Playground** — plotXXX() with sliders, live update
2. **Challenge 1** — Timed matching/drag with score + combo + timer
3. **Challenge 2** — Interactive experiment with "fire/run" button
4. **Challenge 3** — Paradox/conceptual question with animated feedback
5. **Puzzle 1** — Drag-and-drop/builder (energy levels, orbitals, states)
6. **Puzzle 2** — Equation builder (drop terms into correct positions)
7. **Puzzle 3** — Selection-rule / parity / matrix element puzzle

### Bottom: init all + buildModuleNav() + update stats

## Game Mechanics Per Module

| Module | Playground | Challenge 1 | Challenge 2 | Challenge 3 | Puzzle 1 | Puzzle 2 | Puzzle 3 |
|--------|-----------|-------------|-------------|-------------|----------|----------|----------|
| 01 QHO | Wave slider + superposition | Match wavefunction (timer) | Laser frequency resonance | Zero-point paradox | Energy ladder | Hamiltonian builder | Selection rules (Δn=±1) |
| 02 Hydrogen | n,l,m orbital viewer | Spectral line match (guess transition) | Fine structure puzzle (j = l±½) | Bohr radius scaling (r ∝ n²) | Aufbau principle (build config) | Orbital angular momentum (Y_lm drag) | Hund's rule ordering |
| 03 Spin | Bloch sphere (θ,φ sliders) | Stern-Gerlach probability | ESR resonance sweep | Bell inequality (conceptual) | Spin-1/2 measurement chain | Pauli matrix algebra (term drop) | Entanglement Bell state |
| 04 KP | Band structure E(k) slider | Crystal designer (V0, b tuners) | Bloch oscillation race | Bandgap estimation | Tight-binding chain builder | K-P equation assembly | Bragg reflection angles |
| 05 DOS | DOS dimensionality toggler | Fermi level hunter (n-type/p-type guess) | Effective mass from curvature | Metal/semiconductor/insulator detector | Doping level slider puzzle | DOS integral equation | Dirac cone vs parabolic |
| 06 Fermi | T slider → FD smearing | Temperature race (match μ at T) | Debye θ_D detector | Heavy fermion γ puzzle | Occupation state counting | Fermi-Dirac vs MB drag | Landau level counting |
| 07 Conductivity | Drude drift animation | I-V curve tracer (match diode) | Hall effect sign detector | Superconducting transition game | Mean free path builder | Conductivity σ = ne²τ/m drag | Wiedemann-Franz vs violation |

## Scoring Rules
- Easy challenge: 50 XP
- Medium challenge: 75 XP
- Hard challenge: 100 XP
- Master puzzle: 120 XP
- Combo streak: +5 XP per consecutive correct
- Hint penalty: -5 XP
- Skip penalty: -10 XP
- First exploration bonus: 10 XP

## Badge Ideas (per module)
1. Wave Master, Hamiltonian Architect, Dipole Master (QHO)
2. Atomic Designer, Spectral Analyst, Aufbau Sage (Hydrogen)
3. Bloch Navigator, Quantum Crusher, Bell Solver (Spin)
4. Crystal Engineer, Bandgap Architect, Bloch Racer (KP)
5. Material Tuner, DOS Explorer, Graphene Disciple (DOS)
6. Temperature Racer, Fermi Hunter, W-F Guardian (Fermi)
7. Circuit Builder, Drift Racer, Superconductor (Conductivity)

## CSS Class Usage (all defined in shared_styles.css)
- .challenge-panel — challenge container
- .challenge-header with .challenge-icon, .challenge-title, .challenge-difficulty
- .challenge-desc, .challenge-reward
- .challenge-plot — Plotly div
- .challenge-controls — slider/button rows
- .challenge-feedback.success / .error / .hint
- .drop-zone — drag targets
- .drop-zone.dragover / .correct / .wrong — states
- .draggable-target — draggable items
- .timer-bar / .timer-fill — countdown
- .scoreboard / .score-cell / .score-num / .score-label
- .insight-card — theory section
- .game-hud / .hud-badge — overlay stats
- .btn / .btn-group — buttons

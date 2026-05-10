# Atomic & Solid State Physics — Physics Playground

## Project Overview
Fully gamified interactive HTML physics laboratory with **modern glassmorphism UI**.
**8 modules** with **Playground → Challenge → Puzzle** architecture, XP/achievement system,
ambient aurora background, 3D tilt cards, cursor glow, and scroll-triggered animations.
Plus a **cinematic 3D intro** (Three.js) zooming from macro crystal to quantum scale.

**Location:** `/mnt/c/Users/dimar/OneDrive/Desktop/Master Nano/NANO SS26/Atomic state of physics/physics-product/`

---

## Architecture (Modern v3 — May 2025)

### Design System
| Feature | Implementation |
|---------|---------------|
| **Glassmorphism** | `backdrop-filter: blur(16px)` on all panels + cards |
| **Aurora background** | CSS `::before` pseudo with 3 radial gradients, 20s drift animation |
| **Floating orbs** | 3 pure-CSS blurred circles (`orb-cyan`, `orb-purple`, `orb-pink`) |
| **Noise texture** | SVG feTurbulence overlay at 2.5% opacity for film grain |
| **Cursor glow** | 300px radial gradient follows mouse via `requestAnimationFrame` |
| **Scroll progress** | 2px gradient bar at top of viewport |
| **3D tilt cards** | `perspective(800px) rotateX/Y` on mousemove (`tilt-card` class) |
| **Spotlight hover** | Radial white gradient tracks cursor position inside card |
| **Magnetic buttons** | Buttons translate 25% toward cursor on hover (`magnetic` class) |
| **Scroll reveal** | IntersectionObserver fades elements up as they enter viewport |
| **Animated counts** | `animateCount()` number roll-up utility |

### Color Palette (Neon v3)
| Role | Hex | Usage |
|------|-----|-------|
| Cyan | `#00f0ff` | Primary accent, XP, active states |
| Purple | `#c084fc` | Secondary accent, badges, glow |
| Pink | `#ff4ecd` | Tertiary accent, challenge highlights |
| Green | `#4ade80` | Success, correct answers, live dot |
| Yellow | `#facc15` | Warnings, streak multipliers |
| Orange | `#fb923c` | Medium difficulty, hints |
| Red | `#ff5555` | Errors, urgency, timer critical |
| Deep BG | `#05050a` | Page background |
| Panel BG | `rgba(16,16,28,0.65)` | Glass panels |
| Elevated | `rgba(24,24,42,0.55)` | Cards, scoreboard cells |

### Typography
| Role | Font | Weights |
|------|------|---------|
| Display / Headlines | **Space Grotesk** | 300–700 |
| Body / UI | **Inter** | 300–700 |
| Monospace / Readouts | **JetBrains Mono** | 400–600 |

### 3-Mode Architecture (per module)
Every module follows the same gameplay loop:

| Mode | What you do | Rewards |
|------|-------------|---------|
| **🔬 Playground** | Free experiment with live sliders, plots, and readouts | 10 XP first exploration |
| **🎯 Challenges** | 3 timed / scored tasks per module | 50–100 XP each |
| **🧩 Puzzles** | 3 drag-and-drop / logic / builder puzzles per module | 60–120 XP each |

### Scoring Rules
- Easy challenge: 50 XP · Medium: 75 XP · Hard: 100 XP · Master puzzle: 120 XP
- Combo streak: +5 XP per consecutive correct
- Hint penalty: –5 XP · Skip penalty: –10 XP
- First exploration bonus: 10 XP

---

## Shared Framework Files

| File | Purpose |
|------|---------|
| `shared_styles.css` | Modern glassmorphism theme, CSS variables, animations, responsive grid |
| `shared_games.js` | XP system, achievements, combo streaks, particle effects, sessionStorage progress |
| `shared_interactive.js` | SliderGroup, drag handlers, experiment builder utilities |
| `shared_ui.js` | Tooltip engine, parameter database, hover explanations |
| `shared_effects.js` | Cursor glow, scroll reveal, 3D tilt, magnetic buttons, count-up, spotlight |

### Module File Layout
```
modules/XX_name/
  index.html          — Gamified 3-mode layout (loads orbs + shared_effects.js)
  *_apps_games.js     — Game logic: playground sims + challenges + puzzles
  *_sim.js            — Original physics engine (preserved, still loaded)
```

### Global Game State
```javascript
__GameState = {
  xp(), addXP(n, reason),
  unlock(achievement), hasAchievement(id),
  getProgress(module), setProgress(module, pct),
  // persisted in sessionStorage across module navigation
}
```

---

## Module Inventory

| # | Module | Lab Card | Playground | Challenges | Puzzles | JS Lines |
|---|--------|----------|------------|------------|---------|----------|
| 01 | QHO | 🔬 Wave Puzzle, 🎯 Energy Ladder, ⚗️ Laser Tuner | Wavefunction sliders + energy ladder | Wave match, ladder ordering, laser tuning | Probability drop zones | 717 |
| 02 | Hydrogen | 🎮 Orbital Builder, 🎯 Spectral Detective, ⚗️ Electron Config | n,l,m orbital explorer | Spectral line ID, fine-structure, Bohr scaling | Aufbau drag-drop, angular-momentum match | 493 |
| 03 | Spin | 🎮 Bloch Navigator, 🎯 Stern-Gerlach, ⚗️ Gate Puzzle | Bloch sphere theta/phi sliders | Measurement predictor, gate sequence, spin race | Bell-state match, operator algebra | 706 |
| 04 | Kronig-Penney | 🎮 Crystal Designer, 🎯 Bandgap Builder, ⚗️ Wave Packet | Potential depth / lattice sliders | Bandgap estimation, Bloch oscillation race, DOS hunter | Tight-binding chain, Bragg reflection, superlattice | 652 |
| 05 | Energy Bands | 🎮 Fermi Hunter, 🎯 Material Designer, ⚗️ Dimension Explorer | DOS / E-k live sliders | Fermi-level precision, dimensionality guesser, material ID | Doping drag-drop, heterostructure builder, tight-binding | 384 |
| 06 | Fermi Surface | 🎮 Temperature Race, 🎯 3D Fermi Explorer, ⚗️ Metal Detector | Fermi-Dirac T-slider + 3D sphere | Temperature precision, metal detector, Fermi energy guess | Debye/BCS match, Wiedemann-Franz drag-drop, heat-capacity timeline | 323 |
| 07 | Conductivity | 🎮 Circuit Builder, 🎯 Drift Race, ⚗️ Superconductor Quest | E-field / τ / T sliders + drift-velocity | σ(T) prediction race, Hall coefficient, Tc finder | Circuit builder, material-property match, memristor IV drag-drop | 400 |

**Total:** 7 modules · 21 challenges · 21 puzzles · 3,675 lines of game JS

---

## Root Dashboard
`index.html` — Gamified landing page with:
- Animated hero with gradient text (`Space Grotesk`)
- Live preview Plotly card (tilt + hover wave preview)
- XP bar with shimmer animation
- Timeline story flow (7 nodes, click-to-scroll)
- 7 lab cards with circular SVG progress rings, chip tags, 3D tilt + spotlight
- Footer with game-mode badge

---

## Modernization Checklist (v2 → v3)
- ✅ Glassmorphism panels with `backdrop-filter: blur(16px)`
- ✅ Ambient aurora background + floating orbs
- ✅ Film-grain noise texture overlay
- ✅ Custom cursor glow follows mouse
- ✅ Scroll progress gradient bar
- ✅ 3D perspective tilt on cards
- ✅ Spotlight gradient tracks cursor inside cards
- ✅ Magnetic button effect
- ✅ Scroll-reveal animations (IntersectionObserver)
- ✅ Animated number count-up
- ✅ Neon color upgrade: `#00d4ff` → `#00f0ff`, `#b388ff` → `#c084fc`, etc.
- ✅ Plotly transparent backgrounds for seamless glass panels
- ✅ `Space Grotesk` display font + `Inter` body font
- ✅ `shared_effects.js` loaded on root + all 7 modules
- ✅ All JS passes `node --check` syntax validation
- ✅ `polyfill.io` references zero across all files
- ✅ File-protocol safe (`file://`) — no external API dependencies

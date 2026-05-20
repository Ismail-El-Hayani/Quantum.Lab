---
tags: [reference, index, docs]
date: 2026-05-19
---

# Reference Index

> What to consult for what. Source-first approach.

---

## Project Files

| File | Purpose | When to Consult |
|------|---------|---------------|
| `MODULE_PATTERN.md` | Module architecture template | Creating new modules or refactoring existing ones |
| `SIMULATION_GUIDE.md` | Physics engine implementation patterns | Writing or porting `_sim.js` engines |
| `SONAR_INVENTORY.md` | Known SonarQube issue mapping | Fixing code quality flags |
| `PROJECT_LOG.md` | High-level project overview and design system | Onboarding or design-system decisions |
| `Hermes_Conversation_Log.md` | Per-session snapshot + TODO handoff | Resume after token limit / new chat |
| `HERMES_MEMORY.md` | Flat canonical registry (legacy) | Fallback if vault is unavailable |

---

## Physics Reference

| File | Source | Coverage | When to Consult |
|------|--------|----------|-----------------|
| `Part_III_Optical_Properties.md` | Hummel, *Electronic Properties of Materials* 4th Ed., Ch 10-13 | Optical constants (n, k), atomistic theory, quantum mechanical treatment (band-to-band, excitons, interband absorption), applications (lasers, LEDs, solar cells, fiber optics, optical storage) | Any optical-related module or feature |

---

## Shared Framework

| File | Purpose |
|------|---------|
| `shared_styles.css` | Glassmorphism theme, variables, animations, responsive grid |
| `shared_games.js` | XP system, achievements, combos, particles, sessionStorage |
| `shared_interactive.js` | SliderGroup, drag handlers, experiment builder |
| `shared_ui.js` | Tooltips, parameter database, hover explanations |
| `shared_effects.js` | Cursor glow, scroll reveal, 3D tilt, magnetic buttons |

---

## Module Structure

```
modules/XX_name/
  index.html          — Gamified 3-mode layout
  *_apps_games.js     — Game logic: playground + challenges + puzzles
  *_sim.js            — Original physics engine (preserved, still loaded)
```

---

_Last reference audit: 2026-05-19_

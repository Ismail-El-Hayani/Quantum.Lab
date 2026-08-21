# Quantum Lab — Project Log

## Project Overview

Interactive physics laboratory with **unified lab UI** — 16 modules covering quantum mechanics,
solid-state physics, and device physics through live simulations and guided exercises.

**16 modules** with **4-tab architecture** (Overview → Theory → Simulation → Exercises),
persistent Lab Navigator, interactive periodic table, and a cinematic 3D intro (Three.js)
zooming from macro crystal to quantum scale.

**Repository:** `https://gitlab.kaneky.dev/Broly/quantum-lab.git`
**Version:** v1.0.0

---

## Architecture (Unified Lab — August 2026)

### Design System

| Feature | Implementation |
|---------|---------------|
| **Glassmorphism** | `backdrop-filter: blur(16px)` on all panels + cards |
| **Universe background** | Canvas particle system with constellation tracking (`assets/universe-bg.js`) |
| **Cursor glow** | 300px radial gradient follows mouse via `requestAnimationFrame` |
| **Scroll progress** | 2px gradient bar at top of viewport |
| **3D tilt cards** | `perspective(800px) rotateX/Y` on mousemove (`.tilt-card` class) |
| **Spotlight hover** | Radial white gradient tracks cursor position inside card |
| **Scroll reveal** | IntersectionObserver fades elements up as they enter viewport |

### Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Cyan | `#00f0ff` | Primary accent, active states |
| Purple | `#c084fc` | Secondary accent, highlights |
| Pink | `#ff4ecd` | Tertiary accent |
| Green | `#4ade80` | Success, correct answers |
| Yellow | `#facc15` | Warnings |
| Orange | `#fb923c` | Medium difficulty, hints |
| Red | `#ff5555` | Errors, urgency |
| Deep BG | `#05050a` | Page background |
| Panel BG | `rgba(16,16,28,0.65)` | Glass panels |

### Typography

| Role | Font | Weights |
|------|------|---------|
| Display / Headlines | **Space Grotesk** | 300–700 |
| Body / UI | **Inter** | 300–700 |
| Monospace / Readouts | **JetBrains Mono** | 400–600 |

### 4-Tab Architecture (per module)

Every module (01–15) follows the same layout:

| Tab | Content |
|-----|---------|
| **Overview** | Module summary, key concepts, learning objectives |
| **Theory** | MathJax-rendered equations, derivations, explanations |
| **Simulation** | Interactive Plotly.js / Canvas / Three.js physics engine |
| **Exercises** | Challenges and puzzles (legacy `*_apps_games.js` via compat shim) |

Module 00 (Crystal → Quantum) uses a full-width Simulation tab (no sidebar) for the
immersive Three.js experience.

### Shared Infrastructure

| File | Lines | Purpose |
|------|-------|---------|
| `shared_styles.css` | 701 | Global design system, lab layout, tab bar, sidebar |
| `shared_lab.js` | 188 | Module bootstrapper: `switchTab()`, `populateNavigator()`, `initLabTabs()` |
| `shared_effects.js` | 176 | Cursor glow, scroll reveal, 3D tilt, spotlight |
| `shared_interactive.js` | 255 | Sliders, drag/drop, matching, experiment recorder |
| `shared_ui.js` | 114 | Tooltips |
| `shared_periodic.js` | 976 | Periodic table renderer + 118-element database + 18 semiconductor materials |
| `assets/universe-bg.js` | — | Canvas particle background engine |

### Module File Pattern

```
modules/XX_name/
├── index.html              # Module page with 4-tab layout
├── XX_sim.js               # Physics simulation engine
├── XX_apps_games.js         # Exercises (challenges + puzzles)
├── XX_equations.js          # MathJax equation definitions (optional)
├── XX_*_embed.js            # Sub-tab embedded content (optional)
└── XX_*_sections.js         # Sub-tab section content (optional)
```

Legacy `setGameMode()` calls in exercise JS are handled by a compatibility shim in
`shared_lab.js` that aliases `setGameMode` → `switchTab` and stubs `__GameState`,
`celebrateCorrect`, etc.

---

## Codebase Statistics

| Metric | Value |
|--------|-------|
| Modules | 16 (00–15) |
| Module JS files | 46 |
| Module JS LOC | 25,729 |
| Shared JS/CSS LOC | 2,410 |
| HTML LOC (all pages) | 16,340 |
| Python engine LOC | 218 |
| Total LOC | ~44,700 |

### Per-Module JS Size

| Module | JS Files | JS LOC |
|--------|----------|--------|
| 00 Crystal → Quantum | 1 | 2,973 |
| 01 QHO | 4 | 1,160 |
| 02 Hydrogen | 3 | 1,753 |
| 03 Spin | 2 | 1,160 |
| 04 Kronig-Penney | 4 | 1,953 |
| 05 Energy Bands | 2 | 843 |
| 06 Fermi Surface | 2 | 785 |
| 07 Conductivity | 2 | 1,338 |
| 08 Superconductivity | 2 | 1,562 |
| 09 Intrinsic Semi. | 2 | 1,310 |
| 10 Doped Semi. | 3 | 834 |
| 11 Junctions & Devices | 3 | 1,539 |
| 12 Optics & Dispersion | 6 | 4,610 |
| 13 Laser Physics | 3 | 1,384 |
| 14 Magnetism | 3 | 1,481 |
| 15 Thermal Properties | 4 | 1,044 |

---

## Development History

### Phase 1–4: Unified UI Migration (2026-06-28)

All phases completed in a single session. See `UNIFIED_UI_PLAN.md` for the full
phase-by-phase log with status checks.

**Summary of changes:**
- Rewrote `shared_styles.css` — removed all game classes, added lab design system (tab-bar, lab-topbar, lab-layout, lab-sidebar)
- Created `shared_lab.js` — unified tab switching + Lab Navigator
- Rewrote `shared_effects.js` — removed game references
- Created `module-template.html` — reference template for module structure
- Migrated all 16 modules (00–15) to unified 4-tab template
- Removed `shared_games.js` (gamification layer) from all modules
- Added compatibility shim for legacy exercise JS
- Created `shared_periodic.js` — periodic table + 118-element solid-state database
- Refactored Module 00 with full-width Three.js Simulation tab
- Rewrote root `index.html` as professional lab hub with 16-module card grid
- All 15 refactored modules verified: 0 console errors, all tabs functional, navigator populated

### Post-Migration (2026-07-02)

- Removed NANO Master / Atomic State branding from UI
- Security audit and cleanup
- Added `shared_lab.js`, `shared_periodic.js`, `module-template.html` to repo
- Added References section (10 citations) to root index.html and module-template.html

### Versioning (2026-08-21)

- Tagged v1.0.0

---

## Optional Follow-ups

1. Clean Module 14's hidden gamification stub elements (`badge-list*` / `nav-xp` in `mag_apps_games.js`)
2. Wire "Load in Simulator" button in `shared_periodic.js` → Module 00 simulation pipeline
3. Add category dividers or search/filter to hub `index.html`
4. Update `SONAR_INVENTORY.md` — some fixes were reverted via `revert-sonar-bulk` branch

---

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview, setup, structure |
| `SIMULATION_GUIDE.md` | Parameter reference for all 16 module simulation engines |
| `UNIFIED_UI_PLAN.md` | UI unification plan (all phases complete, serves as migration log) |
| `SONAR_INVENTORY.md` | SonarQube issue inventory (may be stale — see follow-up #4) |
| `Rules.md` | Agent rules — read before running any subagent in this workspace |
| `module-template.html` | Canonical HTML template for new modules |
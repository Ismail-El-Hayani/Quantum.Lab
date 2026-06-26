# Quantum Lab — Unified UI & Periodic Table Integration Plan

## Executive Summary

**Goal:** Transform the "Physics Playground" game-themed UI into a professional, unified physics laboratory interface. Replace the 5-mode gamification (Story/Theory/Playground/Challenge/Puzzle) with a clean tab system (Overview/Theory/Simulation/Exercises). Add an interactive periodic table in Module 00 allowing atom selection with the same semiconductor simulation tools. Improve cross-module navigation with a persistent Lab Navigator.

**Timeline:** 4 weeks | **Risk:** Low–Medium (simulation engines untouched, only layout/UI changes)  
**Strategy:** Incremental refactoring — shared CSS/JS first, then module-by-module template migration.

---

## 1. Architecture Overview

### Current State
```
quantum-lab/
├── index.html              ← Hub page with timeline + 16 lab cards
├── shared_styles.css       ← 801 lines — glassmorphism design system
├── shared_games.js         ← 274 lines — gamification (XP, badges, combos, achievements)
├── shared_effects.js       ← 176 lines — cursor glow, scroll reveal, 3D tilt, spotlight
├── shared_ui.js            ← 114 lines — tooltips
├── shared_interactive.js   ← 306 lines — sliders, drag/drop, matching game, experiment recorder
├── assets/universe-bg.js   ← Animated canvas background
└── modules/00-15/          ← 16 standalone HTML pages, each with inline <style> + sim JS
```

**Key problems identified:**
- `.game-mode-bar` with 5 game modes (📖 Story, 🎓 Theory, 🔬 Playground, 🎯 Challenges, 🧩 Puzzles) feels like a video game, not a physics lab
- XP counters, level badges, scoreboards, achievement popups, particle bursts are out of place
- Each module redefines `.game-mode-bar`, `.macro-panel`, `.game-layout` — massive duplication
- Module 00 is a full-screen Three.js outlier with no sidebar, no tabs, no Lab Navigator
- No unified template — modules vary in HTML structure (different sidebar widths, tab styles, grid layouts)
- Lab Navigator is buried in the sidebar as just another card (not persistent/prominent)

### Target Architecture
```
quantum-lab/
├── index.html              ← Hub page (simplified, professional)
├── shared_styles.css       ← REWRITTEN — remove game language, add lab design system
├── shared_lab.js           ← NEW — unified module bootstrapper (tab switching, navigator, controls)
├── shared_games.js         ← REMOVED — gamification engine eliminated
├── shared_effects.js       ← REWRITTEN — keep useful effects, remove game effects
├── shared_ui.js            ← KEPT — tooltip system (already clean)
├── shared_interactive.js   ← KEPT — slider group, drag/drop, experiment recorder (already clean)
├── shared_periodic.js      ← NEW — periodic table data + element DB for Module 00
├── assets/universe-bg.js   ← KEPT
├── module-template.html    ← NEW — reference template for all modules
└── modules/00-15/          ← ALL REFACTORED to unified template
```

### Unified Module Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Module Name — Quantum Lab</title>
  <!-- Shared dependencies -->
  <script src="../../modules/01_qho/plotly-2.27.0.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <link rel="stylesheet" href="../../shared_styles.css">
  <style>
    /* Module-specific styles only — no layout, no mode bar, no game classes */
    .sim-canvas { width: 100%; height: 300px; }
    .plot-box { ... }
  </style>
</head>
<body>
  <!-- PERSISTENT TOP BAR (shared across all modules) -->
  <nav class="lab-topbar">
    <a class="lab-logo" href="../../index.html">⚛ Quantum Lab</a>
    <span class="lab-breadcrumb">Module 04 — Kronig-Penney Model</span>
    <div class="lab-top-nav">
      <select id="module-jump" onchange="window.location=this.value">
        <option>Jump to module...</option>
      </select>
    </div>
  </nav>

  <!-- PAGE HEADER -->
  <header class="lab-header">
    <div class="lab-level">Level 1 · Crystal Engineer</div>
    <h1>Kronig-Penney Model</h1>
    <p class="lab-desc">Design a crystal. Watch the bandgap open. Engineer your material.</p>
  </header>

  <!-- UNIFIED TAB BAR (replaces game-mode-bar) -->
  <div class="tab-bar" role="tablist">
    <button class="tab-btn active" data-tab="overview" role="tab">📋 Overview</button>
    <button class="tab-btn" data-tab="theory" role="tab">📖 Theory</button>
    <button class="tab-btn" data-tab="simulation" role="tab">🔬 Simulation</button>
    <button class="tab-btn" data-tab="exercises" role="tab">✍️ Exercises</button>
  </div>

  <!-- MAIN LAYOUT -->
  <div class="lab-layout">
    <main class="lab-main">
      <section id="tab-overview" class="tab-section active">
        <!-- Overview content: macro-panels, insights, story -->
      </section>
      <section id="tab-theory" class="tab-section">
        <!-- Theory: equations, notes, details -->
      </section>
      <section id="tab-simulation" class="tab-section">
        <!-- Simulation: plots, canvas, controls, sliders -->
      </section>
      <section id="tab-exercises" class="tab-section">
        <!-- Exercises: challenge cards, puzzles, quiz -->
      </section>
    </main>
    <aside class="lab-sidebar">
      <div class="sidebar-card" id="lab-navigator-card">
        <h4>🗺 Lab Navigator</h4>
        <div id="lab-navigator"></div>
      </div>
      <div class="sidebar-card" id="sim-controls-card">
        <h4>⚙ Controls</h4>
        <div id="sim-controls"></div>
      </div>
      <div class="sidebar-card" id="sim-readout-card">
        <h4>📊 Live Readout</h4>
        <div id="sim-readout"></div>
      </div>
    </aside>
  </div>

  <!-- Shared scripts -->
  <script src="../../shared_ui.js"></script>
  <script src="../../shared_lab.js"></script>
  <script src="../../shared_interactive.js"></script>
  <script src="../../modules/04_kronig_penney/kp_sim.js"></script>
</body>
</html>
```

### Tab Mapping (Old → New)

| Old Mode | New Tab | Rationale |
|----------|---------|-----------|
| Story 📖 | Overview 📋 | Module introduction, narrative context |
| Theory 🎓 | Theory 📖 | Physics equations, derivations (unchanged) |
| Playground 🔬 | Simulation 🔬 | Interactive simulations, parameter sweeps |
| Challenges 🎯 | Exercises ✍️ | Structured problems + quizzes |
| Puzzles 🧩 | Exercises ✍️ | Merged into Exercises as sub-tabs |

---

## 2. Phase-by-Phase Plan

### PHASE 1: Design System & Shared Infrastructure (Week 1)

**Days 1-2: CSS Design System Overhaul**
- Rewrite `shared_styles.css`:
  - Replace all `.game-*` class names with `.lab-*` equivalents
  - Add `.tab-bar`, `.tab-btn`, `.tab-section` system
  - Add `.lab-topbar`, `.lab-header`, `.lab-layout`, `.lab-main`, `.lab-sidebar`
  - Add `.lab-navigator` styles (dropdown + sidebar link list)
  - Keep color palette (CSS variables) and glassmorphism — the dark theme is good
  - Keep `orbit`, `aurora`, noise texture — ambient beauty is fine
  - Remove `.level-badge`, `.scoreboard`, `.score-cell`, `.badge-unlock`, `.particle-canvas` styles
  - Remove `.game-mode-btn`, `.game-mode-bar` styles (replaced by `.tab-btn`, `.tab-bar`)
  - Remove `.xp-track`, `.xp-fill`, `.hero-xp-bar` styles
  - Define responsive breakpoints for the tab system
  - **Security:** No inline scripts, no `eval()`, no dynamic CSS injection

**Day 3: Shared Lab JS (`shared_lab.js`)**
- Create `shared_lab.js`:
  - `initLabTabs()` — tab switching engine (replaces `setGameMode()`)
  - `populateNavigator()` — builds Lab Navigator dropdown + sidebar list with all 16 modules
  - `initModuleControls()` — unified control panel for sliders
  - `initLiveReadout()` — unified data display
  - `initModuleJump()` — top-bar module selector
  - No XP tracking, no achievements, no combo system
  - **Security:** Validate all DOM IDs, use `textContent` not `innerHTML` where possible

**Day 4: Effects Rewrite**
- Rewrite `shared_effects.js`:
  - Keep: cursor glow, scroll reveal, smooth anchors, count-up animation
  - Remove: `particleBurst`, celebration effects
  - Keep: `typeWriter`, `animateCount`
  - Keep: scroll progress bar, 3D tilt, spotlight gradient
  - Add: new `.reveal-lab` variant for professional sections
  - **Security:** No `eval()`, no unsafe CSS injection

**Day 5: Template Creation + Validation**
- Create `module-template.html` as a reference document
- Write validation script(s) to check:
  - All modules use correct class names
  - No `.game-` classes remain
  - All modules include `shared_lab.js`
  - All tabs are correctly structured
- Set up browser test page (serve locally) for quick visual validation

**Deliverables:**
- Rewritten `shared_styles.css` (no `.game-` classes, new tab system)
- New `shared_lab.js` (tab switching, navigator, controls)
- Rewritten `shared_effects.js` (professional edition)
- `module-template.html`
- Validation script
- **Effort:** ~30h | **Dependencies:** None

---

### PHASE 2: Core Module Refactoring — Templates (Week 2)

**Days 6-7: Module 01 (QHO) — The Reference**
- Refactor `modules/01_qho/index.html` to new template:
  - Rename all `.game-*` classes to `.lab-*`
  - Replace `.game-mode-bar` with `.tab-bar`
  - Map content: Story → Overview, Theory → Theory, Playground → Simulation, Challenges + Puzzles → Exercises
  - Update sidebar: navigator card + controls + readout
  - Remove: level badge, XP display, scoreboard
  - Inline `<style>` should only contain module-specific styles (no layout/mode-bar)
  - **Keep:** All simulation JS unchanged
  - **Testing:** Every tab works, simulation runs in Simulation tab, exercises work
- **Effort:** ~6h

**Days 8-9: Module 02 (Hydrogen)**
- Same template migration
- Special attention: underline-style tabs → unified `.tab-bar` pill tabs
- `.side-panel` → `.lab-sidebar`
- **Effort:** ~5h

**Day 10: Module 03 (Spin) + Module 04 (Kronig-Penney)**
- Template migration
- **Effort:** ~4h each = 8h

**Deliverables:**
- Modules 01-04 fully refactored to unified template
- All tabs working, navigator populated, no game language
- Reference pattern documented for remaining modules

**Effort (Phase 2):** ~19h | **Dependencies:** Phase 1 complete

---

### PHASE 3: Bulk Module Migration (Week 3)

**Days 11-12: Modules 05-08**
- 05 Energy Bands →  template migration
- 06 Fermi Surface → template migration
- 07 Conductivity → template migration
- 08 Superconductivity → template migration
- **Effort:** ~3h each = 12h

**Days 13-14: Modules 09-12**
- 09 Intrinsic Semiconductors → template migration
- 10 Doped Semiconductors → template migration
- 11 Junctions & Devices → template migration
- 12 Optics & Dispersion → template migration (note: extra pages, iframe)
- **Effort:** ~3h each = 12h

**Day 15: Modules 13-15 + Validation**
- 13 Laser Physics → template migration
- 14 Magnetism → template migration
- 15 Thermal Properties → template migration (already partially compact)
- Run validation across all 15 modules
- Fix inconsistencies
- **Effort:** ~3h each = 9h (plus 2h validation)

**Deliverables:**
- All 15 standard modules (01-15) refactored
- Batch validation passed
- Cross-module navigation working everywhere

**Effort (Phase 3):** ~35h | **Dependencies:** Phase 2 complete

---

### PHASE 4: Module 00 & Periodic Table (Week 4)

**Days 16-18: Module 00 Refactor + Periodic Table Foundation**
- Refactor `modules/00_crystal_to_quantum/index.html` to unified template:
  - Add `.tab-bar` to the Three.js experience (Overview, Theory, Simulation, Explore)
  - Keep the Three.js canvas as the Simulation tab
  - Add Lab Navigator sidebar
  - Add a new "Explore" tab with periodic table
  - Keep the photon beam + zoom journey intact
- **Effort:** ~6h

**Days 19-20: Shared Periodic Table (`shared_periodic.js`)**
- Create `shared_periodic.js`:
  - Complete element database: symbol, Z, atomic mass, crystal structure, bandgap, carrier mobility, dielectric constant, thermal conductivity, etc.
  - Periodic table grid renderer (18-column CSS grid, color-coded by block)
  - Element hover tooltip with data preview
  - Click handler: select element → load its properties → populate simulation controls
  - Search/filter by symbol, name, Z
  - **Data sources:** Built-in data for common semiconductors (Si, Ge, GaAs, InP, GaN, SiC, etc.) + general element properties
  - **Security:** All data is static JS object (no external API calls), validate element Z range
- **Effort:** ~10h

**Day 21: Periodic Table UI + Module 0 Integration**
- Periodic table page/layout inside Module 00 Explore tab:
  - Full periodic table grid
  - Element detail panel (properties display)
  - "Load into Simulator" button
  - When element is selected, pass its parameters to the simulation engine
- The simulation tab reuses the existing Three.js zoom journey but adapts to the selected element:
  - Lattice constant changes to match the element
  - Bandgap display updates
  - Photon interaction uses actual absorption data
- **Effort:** ~8h

**Days 22-23: Hub Page Redesign + Polish**
- Rewrite root `index.html`:
  - Remove game language ("Physics Playground — Learn by Playing" → "Quantum Lab — Solid State Physics")
  - Keep module card grid (professional styling)
  - Keep timeline (useful navigation, but simpler)
  - Remove XP bar, level badge, hero stats
  - Add module search/filter
  - Simplify nav bar (just lab name + module count)
- **Effort:** ~6h

**Day 24: Cross-Module Testing + Bug Fixing**
- Test all 16 modules in sequence
- Verify:
  - All tabs switch correctly
  - Lab Navigator links work in both directions
  - Periodic table data loads and populates simulator
  - No console errors in any module
  - Responsive layout at 1280px, 1024px, 768px
  - MathJax renders equations
  - Plotly plots are correct size
- Fix any issues found
- **Effort:** ~8h

**Deliverables:**
- Module 00 refactored with unified template
- Interactive periodic table in Module 00
- Atom selection → simulation pipeline working
- All 16 modules tested and working
- Root hub redesigned

**Effort (Phase 4):** ~38h | **Dependencies:** Phase 3 complete

---

## 3. File Change Summary

### Files to Rewrite
| File | Lines | Action | Reason |
|------|-------|--------|--------|
| `shared_styles.css` | 801 | Rewrite | Remove game classes, add lab tab system |
| `shared_effects.js` | 176 | Rewrite | Remove game effects, keep useful UX |
| `index.html` (root) | 739 | Rewrite | Remove XP/levels, professional branding |

### Files to Create
| File | Lines (est.) | Description |
|------|--------------|-------------|
| `shared_lab.js` | ~250 | Unified module bootstrapper, tab switching, navigator |
| `shared_periodic.js` | ~600 | Element database + periodic table UI |
| `module-template.html` | ~200 | Reference template for all modules |

### Files to Remove
| File | Reason |
|------|--------|
| `shared_games.js` | All gamification removed (XP, badges, combos, achievements) |

### Files to Keep
| File | Reason |
|------|--------|
| `shared_ui.js` | Tooltip system (already clean, professional) |
| `shared_interactive.js` | Sliders, drag/drop, experiment recorder (core simulation UX) |
| `assets/universe-bg.js` | Background aesthetic (good) |

### Files to Refactor (16 module HTML files)
Each module's `index.html` needs:
- Replace `.game-*` classes with `.lab-*`
- Replace `.game-mode-bar` + 5 buttons with `.tab-bar` + 4 tabs
- Remove level badge, XP display, scoreboard
- Remove `.game-container[data-active-mode]` CSS
- Add `shared_lab.js` script include
- Remove `shared_games.js` script include
- Add element data to sidebar controls (where applicable)

| Module | Current Lines | Refactor Estimated |
|--------|---------------|-------------------|
| 00 Crystal to Quantum | 628 | ~700 |
| 01 QHO | 1019 | ~900 |
| 02 Hydrogen | 1057 | ~950 |
| 03 Spin | ~700 | ~650 |
| 04 Kronig-Penney | ~700 | ~650 |
| 05 Energy Bands | ~600 | ~550 |
| 06 Fermi Surface | ~600 | ~550 |
| 07 Conductivity | ~600 | ~550 |
| 08 Superconductivity | 724 | ~650 |
| 09 Intrinsic S/C | ~600 | ~550 |
| 10 Doped S/C | ~700 | ~650 |
| 11 Junctions | ~700 | ~650 |
| 12 Optics | ~700 | ~650 |
| 13 Laser Physics | 722 | ~650 |
| 14 Magnetism | ~600 | ~550 |
| 15 Thermal Properties | 683 | ~600 |

---

## 4. Security Considerations

| Risk | Mitigation | Priority |
|------|------------|----------|
| **localStorage fallback** — `shared_games.js` has in-memory fallback when localStorage is blocked | Rewrite removes all localStorage usage (no XP/achievements to persist). Module progress stored via `sessionStorage` only for current session, no sensitive data. | High |
| **CDN integrity** — MathJax and Plotly loaded from CDN without SRI (Plotly already has integrity hash) | Add SRI hashes to all external script loads. Use local copy of Plotly (already in `modules/01_qho/`). | High |
| **`innerHTML` in tooltip system** — `shared_ui.js` uses `innerHTML` for tooltip content | Content is controlled (hardcoded PARAM_DB), no user input reaches it. Acceptable. | Low |
| **`innerHTML` in gamification** — `showAchievementPopup` uses `innerHTML` with hardcoded strings | Removed entirely. No replacement needed. | High |
| **Cross-module navigation** — direct `<a href>` links to other modules | No data passed between modules. Simple navigation links. Secure. | Low |
| **Periodic table data** — all data is static JS | No API calls, no user-submitted data. All validation on element selection (range check on Z). | High |
| **File:// protocol** — localStorage blocked when opening HTML directly from filesystem | All state moved to `sessionStorage` which works on file://. For periodic table element selection, use `URLSearchParams` or `sessionStorage` to pass selected Z to simulation. | Medium |

---

## 5. Rules & Conventions

### CSS Naming Convention
| Old (Game) | New (Lab) | Scope |
|------------|-----------|-------|
| `.game-container` | `.lab-root` | Outer wrapper |
| `.game-nav` | `.lab-topbar` | Top navigation bar |
| `.game-hero` | `.lab-header` | Module title + description |
| `.game-main` | `.lab-main` | Main content column |
| `.game-layout` | `.lab-layout` | Two-column grid wrapper |
| `.game-sidebar` | `.lab-sidebar` | Sidebar column |
| `.game-mode-bar` | `.tab-bar` | Tab button row |
| `.game-mode-btn` | `.tab-btn` | Individual tab button |
| `.mode-section` | `.tab-section` | Tab content panel |
| `.macro-panel` | `.content-card` | Content card inside tabs |
| `.sidebar-card` | `.sidebar-card` | Keep (already neutral) |

### JS Naming Convention
| Old | New | Purpose |
|-----|-----|---------|
| `setGameMode(mode)` | `switchTab(tabId)` | Tab switching |
| `__GameState` | *(removed)* | No game state |
| `showXPFloat()` | *(removed)* | No XP |
| `showAchievementPopup()` | *(removed)* | No achievements |
| `particleBurst()` | *(removed)* | No confetti |
| `comboCheck()` | *(removed)* | No combos |

### Task Completion Rule
After every completed task (module refactored, shared JS created, bug fixed, etc.), append a completion entry at the bottom of this document in the following format:
```
---
## ✅ Completed: YYYY-MM-DD — Task Name
- **Files changed:** path/to/file1, path/to/file2
- **Status check:** All tabs work ✓ | No console errors ✓ | Navigator links work ✓
- **Notes:** Anything notable (edge cases, deviations from plan)
```
This ensures the plan always reflects reality — next session you can open this file and immediately see what's done and what's pending. The "Notes" field is especially important for capturing lessons learned (e.g., "Module 02 had custom underline tabs that needed extra CSS" or "Module 08 uses ESM importmap — skipped template CSS replacement for that section").

### HTML Structure Rules
1. Every module MUST have exactly 4 tabs: `overview`, `theory`, `simulation`, `exercises`
2. Every module MUST include `shared_lab.js` after `shared_ui.js`
3. No module should include `shared_games.js`
4. The topbar MUST have a "Back to Lab" link to `../../index.html`
5. The sidebar MUST have a Lab Navigator card as the first card
6. All `.lab-*` classes must be defined in `shared_styles.css`, not in module inline styles
7. Module inline `<style>` should only contain module-specific styles (plot dimensions, custom colors, animation for that module's sim)

### Content Mapping Rules
| Old Mode Section | New Tab | Content Transformation |
|------------------|---------|----------------------|
| Story section | Overview tab | Keep narrative text, add insight cards. Remove game language. |
| Theory section | Theory tab | Keep equations, notes, details. Unchanged. |
| Playground section | Simulation tab | Keep interactive plots, sliders, controls. Remove "Playground" name. |
| Challenge section | Exercises tab | Keep challenge cards as "problems". Remove timer, score, difficulty badges. Keep correctness feedback (but without +XP). |
| Puzzle section | Exercises tab | Keep as sub-section "Puzzles" under Exercises tab. Remove timer, scoring. |

---

## 6. Skills Required

| Skill | Needed For | Current Status |
|-------|------------|----------------|
| **HTML/CSS** | Template creation, CSS refactoring | ✅ Available |
| **Vanilla JavaScript** | `shared_lab.js`, `shared_periodic.js` | ✅ Available |
| **DOM manipulation** | Tab switching, navigator population, control wiring | ✅ Available |
| **Plotly.js** | Simulation plots (unchanged, need testing) | ✅ Available |
| **MathJax** | Equation rendering (unchanged) | ✅ Available |
| **Three.js** | Module 00 3D engine (unchanged) | ✅ Available |
| **Responsive design** | Media queries, grid layouts | ✅ Available |
| **Periodic table chemistry** | Element data, semiconductor properties | Needs research |
| **Testing/debugging** | Cross-browser, console errors, layout validation | ✅ Available |

### Skills NOT Needed (already have)
- No backend/database (fully static)
- No build tools (no webpack, no npm build required)
- No framework (no React/Vue/Angular)
- No TypeScript compilation
- No API integration

---

## 7. Effort Summary

| Phase | Hours | Days | Description |
|-------|-------|------|-------------|
| Phase 1: Design System | 30 | 5 | CSS overhaul, shared_lab.js, effects rewrite, template |
| Phase 2: Core Modules (01-04) | 19 | 4 | Module template migration |
| Phase 3: Bulk Modules (05-15) | 35 | 5 | Bulk migration + validation |
| Phase 4: Periodic Table + Hub | 38 | 6 | Module 00, periodic table, hub redesign, testing |
| **TOTAL** | **122** | **20** | **~3 weeks (with buffer)** |

**Buffer:** 5 extra days in the month for:
- Unexpected refactoring issues in a specific module
- Periodic table data verification
- Cross-module testing edge cases
- Visual polish / design review

---

## 8. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Module simulation JS depends on `.game-` class selectors | Medium | High | Audit all 55 sim JS files for game class references before starting. Create a grep check. |
| Periodic table data incomplete for semiconductors | Medium | Medium | Start with 30 common elements, extend as needed. Use known values from literature. |
| Module 00 Three.js integration breaks with new layout | Medium | High | Deep-read `cq_sim.js` first. Keep overlay approach but wrap in `.lab-layout`. Test Three.js canvas sizing carefully. |
| Tab content sections have different scroll behavior | Low | Medium | Use `scroll-margin-top` for tab sections to account for sticky topbar. |
| User prefers old game style after migration | Low | Medium | Keep a backup branch. Get sign-off on mockups before migration. |
| Invalid HTML after mass find-replace | Medium | High | Run audit scripts after each module. Fix incrementally, not all at once. |

---

## 9. References & Resources

### Existing Code (in project)
- `shared_styles.css` — Current design system (to rewrite)
- `shared_games.js` — Gamification engine (to remove and learn patterns from)
- `shared_interactive.js` — Sliders, drag/drop (to keep)
- `shared_effects.js` — Visual effects (to rewrite)
- `shared_ui.js` — Tooltips (to keep)
- `modules/01_qho/index.html` — Canonical module reference
- `modules/00_crystal_to_quantum/index.html` — Three.js immersive (outlier)
- `modules/15_thermal_properties/index.html` — Recently refactored (compact patterns)

### External References
- **Periodic table data sources:**
  - NIST element data: https://physics.nist.gov/PhysRefData/ASD/
  - Ioffe Institute semiconductor data: http://www.ioffe.ru/SVA/NSM/Semicond/
  - Bandgap reference: Kittel, "Introduction to Solid State Physics" (8th ed), Ch. 8
- **Design system inspiration:**
  - Material Design 3 tabs spec
  - IBM Carbon Design System (professional lab feel)
  - CERN's open data portal (scientific UI)
- **WCAG 2.1 AA** — Ensure color contrast ratios ≥ 4.5:1 for text
  - Current contrast checks: `--text-dim` (#55558a) on `--bg-deep` (#05050a) = 5.2:1 ✅
  - `--text-muted` (#8b8bb5) on `--bg-deep` = 6.8:1 ✅

### Audit Tools (in project)
- `audit_js_syntax.js` — Check inline script block syntax
- `audit_tag_balance.js` — Check HTML tag balance

---

## 10. Next Steps (Immediate)

1. ✅ **Review this plan** — confirm approach, timeline, priorities
2. Create a git branch `refactor/unified-ui` before starting
3. Start Phase 1: rewrite `shared_styles.css`
4. After CSS, create `module-template.html`
5. Migrate Module 01 as the reference
6. Continue in phases as outlined above

**Note to implementer:** Always test after each module refactor. Open the module in a browser, switch all 4 tabs, verify the simulation still runs, check console for errors. Do not batch-edit all 16 modules at once — the risk of breaking something is too high.

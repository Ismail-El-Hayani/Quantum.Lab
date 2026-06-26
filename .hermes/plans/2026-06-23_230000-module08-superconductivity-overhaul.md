# Module 08 Superconductivity — Full Overhaul Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Fix weak UI organization, broken Cooper pair canvas, blurry Meissner, add Playground sub-tabs with selective controls, wrap figures in macro-panel frames like modules 04/05, and add Story + Theory tabs.

**Architecture:** Single-file `index.html` with `game-layout > game-main + game-sidebar`. Playground split into 3 sub-tabs (Cooper Pairs, Meissner Effect, Energy Gap). Controls sidebar shows only relevant controls per active sub-tab (same pattern as Module 04 KP). Story/Theory added before Playground. Challenges/Puzzles wrapped in macro-panel + insights grid.

**Tech Stack:** Plotly, Three.js (ESM via importmap), Canvas 2D, MathJax, shared_styles.css

---

## Current Problems

1. **No macro-panel/game-layout structure** — uses old `playground-area` + `playground-header` + inline `grid-template-columns: 1fr 320px` with no sidebar-card wrappers
2. **Cooper pair canvas** — Three.js scene initialized while Playground hidden (0×0 container), renderer gets wrong size; no resize-on-visible
3. **Meissner canvas** — fixed `width=340 height=180` attributes, no responsive resize, appears blurry when stretched by CSS
4. **All controls in one panel** — T, Tc, H all shown at once regardless of which visualization is active
5. **Figures too wide** — gap plot, magnetization plot, penetration plot are full-width with no framing
6. **No Story/Theory tabs**
7. **Challenges/Puzzles unwrapped** — bare `.challenge-panel` divs
8. **Sidebar** — old sticky `challenge-panel` at bottom, not `sidebar-card` pattern
9. **setGameMode in sc_apps_games.js** hardcodes `['play','challenge','puzzle']` — won't handle story/theory

## Files to modify

- `modules/08_superconductivity/index.html` — full HTML restructure
- `modules/08_superconductivity/sc_sim.js` — deferred init, sub-tab plot routing, canvas resize-on-visible
- `modules/08_superconductivity/sc_apps_games.js` — setGameMode fix, nav/badge/scoreboard mirroring

---

## Task 1: Add CSS helpers + mode bar + Story/Theory sections

**Objective:** Add Story/Theory CSS classes, expand mode bar from 3→5 buttons, insert Story and Theory sections before Playground.

**Files:** `modules/08_superconductivity/index.html`

Steps:
1. Add to `<style>` block: theory-content, equation-box, insight-callout + macro-panel, sidebar-card, game-layout, game-mode-bar, game-mode-btn, slider-group, slider-value, slider-desc, insights, insight-card, unit-tag, pg-control-scope, mode-bar (some may already exist — check)
2. Replace mode bar: add `mode-story` (active), `mode-theory`, then existing play/challenge/puzzle
3. Insert `section-story` with game-layout: narrative (BCS discovery, Meissner effect, Cooper pairs, zero resistance) + 3 insight-cards + sidebar (nav/badges/progress with -story suffixes)
4. Insert `section-theory` with game-layout: 5 theory sections (BCS gap equation, Cooper pairing, Meissner effect, London penetration, Type I vs Type II) with MathJax equations + sidebar (with -theory suffixes)
5. Change `section-play` to `display:none`

---

## Task 2: Restructure Playground with sub-tabs + selective controls

**Objective:** Wrap Playground in macro-panel + game-layout, add 3 sub-tabs (Cooper Pairs / Meissner Effect / Energy Gap & Plots), make controls selective per sub-tab.

**Files:** `modules/08_superconductivity/index.html`

Steps:
1. Add Playground header macro-panel with sub-tab buttons: `pg-mode-cooper`, `pg-mode-meissner`, `pg-mode-gap`
2. Wrap content in `game-layout > game-main + game-sidebar`
3. Create 3 pg-view divs:
   - `pg-view-cooper`: Cooper pair canvas in viz-card + legend + caption
   - `pg-view-meissner`: Meissner canvas in viz-card + legend + caption
   - `pg-view-gap`: Energy gap canvas + 3 Plotly plots (gap-temp, magnetization, penetration) in a 2-column grid
4. In sidebar, split controls into `pg-control-scope` classes:
   - `scope-global`: T slider, Tc select (always visible)
   - `scope-meissner`: H slider (only when Meissner sub-tab active)
   - `scope-gap`: (none extra — gap sub-tab uses global controls)
5. Wrap live readout in `sidebar-card` with readout-tile pattern
6. Move nav/badges/progress into `sidebar-card` containers
7. Move the existing insight-card (theory deep-dive) into `section-theory` or keep a shortened version in Playground

---

## Task 3: Fix Cooper pair canvas (Three.js resize-on-visible)

**Objective:** Fix the Cooper pair Three.js scene to initialize with correct dimensions when Playground becomes visible, and resize when the sub-tab is activated.

**Files:** `modules/08_superconductivity/sc_sim.js`

Steps:
1. In `initCooperAnimation`, use `container.clientWidth` / `container.clientHeight` at init time — if 0, defer until visible
2. Add a resize function that updates camera aspect + renderer size when the container changes
3. Add a MutationObserver (or hook into setPlayMode) to call resize when `pg-view-cooper` becomes visible
4. Guard against `THREE === undefined` (Three.js may not be loaded yet)
5. Cancel the animation loop when Playground is not visible (pause/resume)

---

## Task 4: Fix Meissner canvas (responsive resize)

**Objective:** Make the Meissner canvas responsive — remove fixed width/height attributes, use container clientWidth, and redraw on resize.

**Files:** `modules/08_superconductivity/sc_sim.js`

Steps:
1. In `initMeissnerAnimation`, set `canvas.width = container.clientWidth` and `canvas.height = 180` (or container height)
2. Remove the `width=340 height=180` HTML attributes — let JS set them
3. Add a resize handler that updates canvas dimensions and redraws
4. Add guard: if canvas not found or container has 0 width, defer
5. Pause animation when not on Meissner sub-tab

---

## Task 5: Fix Energy Gap canvas + Plotly deferred init

**Objective:** Make the gap canvas responsive and defer Plotly init until Playground is visible.

**Files:** `modules/08_superconductivity/sc_sim.js`

Steps:
1. In `initGapAnimation`, set canvas width from container clientWidth
2. Defer all Plotly plots (`plotGapVsTemp`, `plotMagnetization`, `plotPenetration`) until Playground is visible
3. Add a MutationObserver on `section-play` to trigger init when it becomes `display:block`
4. Add Plotly.Plots.resize calls when sub-tabs switch
5. Guard all canvas ctx access with null checks

---

## Task 6: Add setPlayMode function with selective controls

**Objective:** Create a `setPlayMode` function that switches sub-tabs, shows/hides controls, and resizes/rebuilds the active visualization.

**Files:** `modules/08_superconductivity/sc_sim.js`

Steps:
1. Add `setPlayMode(mode)` function that:
   - Toggles `pg-view-*` divs visibility
   - Toggles `pg-control-scope` elements (global always, meissner only for meissner tab)
   - Resizes the active canvas (Cooper: Three.js resize, Meissner: canvas resize, Gap: canvas resize + Plotly resize)
   - Pauses animations for inactive sub-tabs, resumes for active one
2. Export `setPlayMode` to window
3. Wire sub-tab buttons to call `setPlayMode`

---

## Task 7: Fix setGameMode wrapper for story/theory

**Objective:** Update the setGameMode function in sc_apps_games.js to handle 5 modes and defer Playground init.

**Files:** `modules/08_superconductivity/sc_apps_games.js`

Steps:
1. Replace hardcoded `['play','challenge','puzzle']` with generic section toggle
2. Add `story` and `theory` to the section list (or use dynamic `section-${mode}` lookup)
3. When `mode === 'play'`: call `initSuperconductivityV2()` if not already initialized (deferred init pattern)
4. When leaving play: pause all canvas animations
5. Keep challenge/puzzle init hooks

---

## Task 8: Mirror nav/badges/scoreboard into Story/Theory sidebars

**Objective:** Update buildModuleNavSC, renderBadgesSC, updateScoreboardSC to fill all sidebar variants.

**Files:** `modules/08_superconductivity/sc_apps_games.js`

Steps:
1. `buildModuleNavSC`: mirror into `module-nav`, `module-nav-story`, `module-nav-theory`
2. `renderBadgesSC`: mirror into `badge-list`, `badge-list-story`, `badge-list-theory`
3. `updateScoreboardSC`: mirror into all stat-*-story and stat-*-theory variants
4. Add module 00 to nav list (currently missing)

---

## Task 9: Wrap Challenges and Puzzles in macro-panel + insights

**Objective:** Wrap the bare challenge-panel divs in macro-panel + insights/insight-card structure.

**Files:** `modules/08_superconductivity/index.html`

Steps:
1. Wrap section-challenge: add macro-panel header with h3 + description, wrap each challenge in insight-card inside insights grid
2. Wrap section-puzzle: same pattern
3. Remove the old bottom sticky sidebar (lines 334-358) — its IDs (module-nav, badge-list, stat-*) are now in the Playground sidebar
4. Add challenge/puzzle sidebars with suffixed IDs (module-nav-ch, badge-list-ch, stat-*-ch, module-nav-pz, etc.)

---

## Task 10: Deferred init pattern for Playground

**Objective:** Ensure all Playground visualizations init only when Playground is visible, not on page load.

**Files:** `modules/08_superconductivity/index.html`, `modules/08_superconductivity/sc_sim.js`

Steps:
1. In index.html, remove the auto-init at bottom of sc_sim.js (`if (document.readyState === 'loading')...`)
2. Add a MutationObserver in index.html (or sc_sim.js) that calls `initSuperconductivityV2()` when `section-play` becomes visible
3. Guard with `_scInited` flag to prevent double-init
4. Bump JS cache-bust versions

---

## Task 11: Validate

Steps:
1. div balance check
2. Duplicate ID check
3. Required IDs check (mode-story, mode-theory, section-story, section-theory, etc.)
4. JS brace/paren balance
5. Browser test: load page, verify Story tab active, click through all 5 tabs, verify 0 JS errors
6. Test Playground sub-tabs: Cooper pair renders, Meissner renders, Gap + plots render
7. Test slider changes update live readout + plots
8. Test Story/Theory sidebars have nav/badges/progress
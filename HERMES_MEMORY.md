# HERMES_MEMORY — Quantum Lab Extended Memory
> Append-only log. Each session prepends a new section under the matching category.
> Purpose: Remember problems, fixes, work done, achievements, and how it was done across sessions.

---

## QUICK REFERENCE — Active Conventions (do not repeat elsewhere)

| ID | Rule | Trigger / Rationale |
|----|------|---------------------|
|| C01 | Canvas ABOVE plots | Module 15 (`tp-lattice`), and any new module. Canvas at top of Playground, plots below as supporting readouts. |
|| C02 | UX parity auto-upgrade | Any new feature/visual automatically triggers upgrading old modes' descriptions and legends to match, without being asked. |
|| C03 | `_sim.js` in-place overwrite | When porting a standalone visual engine into a module, overwrite `_sim.js` in-place (no throwaway prototypes) and enhance educational writing/descriptions/legends in the same pass. |
|| C04 | Equation comments on every major physics function | Inline comments with LaTeX-style ASCII formulas. Bare `/* time step */` blocks are incomplete. |
|| C05 | Proactive verification after batch transforms | Check duplicate wrappers, div balance, id uniqueness before saving. Signal phrase: "chuf lqt duplicate". |
|| C06 | Landing page sync | Module card descriptions + chips must match actual module features. Stale descriptions trigger immediate updates without being asked. |
|| C07 | `socratiscode` methodology | Question assumptions, probe edge cases, reason through physics/math accuracy rigorously before implementing. |
|| C08 | Uniform dark UI, no colored tints | Buttons uniformly dark, text legend only. Rejects colored UI tints. |
|| C09 | Visual richness defaults | Thicker bonds, higher opacity, larger clouds, inline legends preferred. |
|| C10 | Git-over-HTTPS + PAT | SSH port 2222 blocked server-side. Use HTTPS + Personal Access Token for pushes. Account: @samael1 on gitlab.kaneky.dev (project Broly/quantum-lab.git). |

---

## BUG REGISTRY

### BUG-2026-05-19-A — Tunneling T=1 at E=V₀ (Module 04)
- **Symptom:** `kp_sim.js` `solveTunneling()` returned `T=1` (100% transmission) when electron energy exactly equaled barrier height.
- **Physical reality:** `T = 1/(1 + V₀·w²/2)` — for V₀=5, w=2, T≈9.1%.
- **Root cause:** `else {T = 1;}` hardcoded branch at E=V₀.
- **Fix:** Replaced with exact limiting formula `T = 1/(1 + 0.5*V0*w*w)`.
- **Verification:** Numerical test confirmed `T=0.090909` vs exact.
- **Files touched:** `modules/04_kronig_penney/kp_sim.js`

### BUG-2026-05-19-B — NFE bandgap formula 2× error (Module 04)
- **Symptom:** Nearly-free-electron gap prediction was 104% off exact K-P solver value.
- **Root cause:** Fourier coefficient formula `V_G = (2V₀/π) sin(πb/a)` had an extra factor of 2. Correct: `V_G = (V₀/π) sin(πb/a)`.
- **Fix:** Corrected formula in `kp_apps_games.js`, challenge feedback strings, and `index.html` visible description/formula.
- **Verification:** Predicted gap went from 1.156 to 0.578 (exact: 0.568 — now 1.8% error).
- **Files touched:** `modules/04_kronig_penney/kp_apps_games.js`, `modules/04_kronig_penney/index.html`

### BUG-2026-05-19-C — Missing probability readout (Module 04)
- **Symptom:** HTML declared `wp-p-left`, `wp-p-mid`, `wp-p-right` but JS never populated them. Displayed "—" permanently.
- **Fix:** Added probability integration in `draw()` — sums `|ψ_i|²·dx` across left, barrier, and right regions, then writes to DOM.
- **Files touched:** `modules/04_kronig_penney/kp_wavepacket_embed.js`

### BUG-2026-05-18 — Duplicate `viz-cards` wrapper in multiple modules
- **Symptom:** Visual regressions where canvas/plot containers were wrapped twice, breaking layout.
- **Root cause:** Batch refactor script injected duplicate `<div class="viz-cards">` wrappers during the glassmorphism modernization pass.
- **Fix:** Deduplicated wrappers, added missing containers, removed remaining green panels.
- **Files touched:** Multiple `modules/*/index.html`.

### BUG-2026-05-* — SonarQube issues (contextual)
- **Symptom:** Code quality flags shared as screenshots.
- **Fix approach:** `sonar-js-cleanup` skill + vision_analyze on screenshots.
- **Files touched:** Variable per scan.

---

## FIX REGISTRY

### FIX-2026-05-19-A — Equation comments added to Module 04 sim engines
- **What:** Every major physics function in `kp_sim.js` and `kp_wavepacket_embed.js` now has inline ASCII equation comments.
- **Why:** Convention C04 (bare `/* time step */` blocks are incomplete).
- **Equations added:**
  - TDSE: `i·∂ψ/∂t = −½·∂²ψ/∂x² + V(x)·ψ`
  - Strang splitting: `ψ → e^{-iV̂Δt/2} → F → e^{-ik²Δt/2} → F⁻¹ → e^{-iV̂Δt/2} ψ`
  - Gaussian packet: `ψ(x,0) = (2πσ²)^{-1/4} exp(-(x-x₀)²/(4σ²)) e^{ik₀x}`
  - Tunneling 3-region matching, exact T formulas (all 3 branches)
  - Decay length `1/(2κ)`, probability integration `P = ∫|ψ|² dx`
- **Files touched:** `modules/04_kronig_penney/kp_sim.js`, `modules/04_kronig_penney/kp_wavepacket_embed.js`

### FIX-2026-05-18 — Plot-desc CSS class normalization kickoff
- **What:** Audited all 16 `index.html` modules for `plot-desc` usage.
- **Why:** Inconsistent plot description styling across modules. Only Module 02 had a proper `.plot-desc` class.
- **How:** Session created a tiered plan (Simple / Medium / Complex / Already done).
- **Files audited:** All `modules/*/index.html`.
- **Status:** Audit complete; normalization NOT YET EXECUTED.
- **Estimated effort:** 2.5 to 3 hours.

### FIX-2026-05-* — Module 14 landing page card description
- **Old:** "Dia/Para/Ferro · Ordering Match · Susceptibility Lab"
- **New:** "Ising Lattice · Hysteresis · Ordering Match"
- **Why:** Stale description did not reflect bar-magnet + Ising lattice features.
- **Trigger:** Convention C06 (landing page sync).

---

## DECISION LOG

### DEC-2026-05-19-A — Qualitative tunneling visualization accepted
- **Topic:** Should `solveTunneling()` be rewritten to do exact complex boundary matching?
- **Decision:** Keep current qualitative real-part sketch (physics is correct in shapes, wrong in fringe phases). Exact matching would require complex B coefficient from `|B|² = R = 1−T` and correct phase from continuity equations — a larger refactor.
- **Rationale:** Current code is pedagogically sufficient. Full matching adds no new visible feature to students. Revisit if user requests.
- **Status:** ACCEPTED / DOCUMENTED

### DEC-2026-05-19-B — FFT reversed sign convention accepted
- **Topic:** `kp_wavepacket_embed.js` uses `exp(+iθ)` for forward FFT instead of standard `exp(−iθ)`.
- **Decision:** Accepted. Convention is self-consistent (forward/inverse swap roles). Free-particle propagation verified exact: COM displacement = k₀·t, norm = 1.000000.
- **Status:** ACCEPTED / DOCUMENTED

### DEC-2026-05-18-A — Plot-desc normalization scope
- **Topic:** Should we normalize `.plot-desc` across all 16 modules now?
- **Decision:** Audit completed; execution deferred to next session if user requests.
- **Rationale:** User may prioritize other modules; we have a ready tiered execution plan.
- **Status:** OPEN / READY TO EXECUTE

### DEC-2026-05-* — Git transport strategy
- **Topic:** How to push to GitLab?
- **Decision:** HTTPS + PAT only.
- **Rationale:** SSH port 2222 blocked server-side.
- **Status:** PERMANENT

---

## ACHIEVEMENT LOG

### ACH-2026-05-19 — Module 04 physics audit complete
- **Done:** Socratiscode rigor audit of `kp_sim.js`, `kp_wavepacket_embed.js`, `kp_apps_games.js`, `index.html`.
- **Done:** Identified and fixed 3 bugs (E=V₀ tunneling T=1, NFE gap 2× error, missing probability readout).
- **Done:** Added inline physics equations to every major function (convention C04 compliance).
- **Verification:** Automated check: all equations present, buggy strings absent, brace balance correct.
- **Uncommitted files at end of session:** Module 04 (4 files), previous WIP (8 files), untracked (5 items).

### ACH-2026-05-18 — Session completion snapshot
- **Done:** Full `plot-desc` audit across 16 modules.
- **Done:** Created tiered execution plan for normalization.
- **Uncommitted files:** `modules/02_hydrogen/index.html`, `modules/03_spin/index.html`, `modules/03_spin/spin_apps_games.js`, `modules/03_spin/spin_sim.js`, `modules/09_intrinsic_semiconductors/index.html`, `modules/09_intrinsic_semiconductors/is_sim.js`, `modules/03_spin/spin_apps.js` (untracked).
- **Commit tip:** `3ffa91b`

### ACH-2026-05-* — 16 modules completed
- **What:** All 16 quantum-lab modules are functional with Playground/Challenge/Puzzle architecture.
- **Visual system:** Glassmorphism v3 with aurora background, 3D tilt cards, cursor glow, scroll reveal.
- **Reference docs:** `Part_III_Optical_Properties.md` (Hummel Ch 10-13) available for optical modules.

---

## REFERENCE MATERIALS INDEX

| File | Purpose | When to consult |
|------|---------|---------------|
|| `Part_III_Optical_Properties.md` | Optical constants, band-to-band absorption, excitons, lasers, LEDs, solar cells, fiber optics | Building Modules 12, 13, or any optical feature |
|| `MODULE_PATTERN.md` | Module architecture template | Creating new modules or refactoring existing ones |
|| `SIMULATION_GUIDE.md` | Physics engine implementation patterns | Writing or porting `_sim.js` engines |
|| `SONAR_INVENTORY.md` | Known SonarQube issue mapping | Fixing code quality flags |
|| `PROJECT_LOG.md` | High-level project overview and design system | Onboarding or design-system decisions |
|| `Hermes_Conversation_Log.md` | Per-session snapshot + TODO handoff | Resume after token limit / new chat |
|| `HERMES_MEMORY.md` (this file) | Canonical bug/fix/convention/achievement registry | Anytime — search for context |

---

## SESSION CONTINUITY — LAST KNOWN STATE

**Date:** 2026-05-19 ~19:15 UTC
**Branch:** main
**Commit tip:** `3ffa91b`
**Uncommitted files:** Modules 02, 03, 04, 09, 12 (tracked changes); plus untracked assets.

**New since last snapshot:**
- Module 04 fully audited and fixed. Ready to commit with message: `fix(module04): correct E=V0 tunneling, NFE gap formula, probability readout, add equation comments`.

**Next likely tasks (prioritized):**
1. Commit Module 04 changes (or batch with other uncommitted work).
2. `plot-desc` normalization across 16 modules (2.5–3h, tiered plan ready).
3. Phase3 sim engine helper decomposition (if requested).
4. SonarQube cleanup (if new screenshots arrive).
5. Landing-page module card description verification against actual features.

**Resume command for next session:**
> "Resume from HERMES_MEMORY.md. Run `git status --short` and `git log --oneline -3`, then proceed with [task name]."

---

## HOW TO APPEND TO THIS FILE

When a new session produces bugs, fixes, or decisions, prepend a new dated section under the matching registry above. Do NOT delete old entries. Keep each entry concise and machine-searchable. If a convention changes, add a new entry with the updated rule and mark the old one `[DEPRECATED YYYY-MM-DD]` rather than editing it in-place.

_Last structured update: 2026-05-19 19:15 UTC_

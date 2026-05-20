---
tags: [convention, rules, reference]
date: 2026-05-19
---

# Active Conventions

> Rules that must be followed automatically, without being asked.

---

## C01 — Canvas Placement

**Rule:** Canvas goes **ABOVE** plots, never below.
**Applies to:** Module 15 (`tp-lattice`), and any new module.
**Rationale:** User considers canvas-below visually degraded.
**Origin:** [[DEC-2026-05-18-B]]
**Status:** Permanent

---

## C02 — UX Parity Auto-Upgrade

**Rule:** Any new feature/visual automatically triggers upgrading old modes' descriptions and legends to match.
**Trigger:** When a new visual engine or UI element is introduced in any mode.
**Action:** In the same PR/session, update descriptions and legends in Playground/Challenge/Puzzle to reflect the new capability.
**Status:** Permanent

---

## C03 — `_sim.js` In-Place Overwrite

**Rule:** When porting a standalone visual engine into a module, overwrite `_sim.js` in-place.
**Anti-pattern:** Creating throwaway prototypes that later get merged.
**Must also do:** Enhance educational writing, descriptions, and legends in the same pass.
**Status:** Permanent

---

## C04 — Equation Comments

**Rule:** Every major physics function must have inline comments with LaTeX-style ASCII formulas.
**Examples:** `ψ(x,0) = ...`, `T = [1 + V₀²sinh²(κw)/(4E(V₀-E))]⁻¹`
**Anti-pattern:** Bare `/* time step */` blocks are incomplete.
**Scope:** Potential builders, damping masks, probability readouts — every significant operation.
**Status:** Permanent

---

## C05 — Proactive Verification After Batch Transforms

**Rule:** After batch transforms across multiple files, verify before saving.
**Checks:** Duplicate wrappers, div balance, id uniqueness.
**Signal phrase:** "chuf lqt duplicate" — user expects verify-before-commit as default behavior.
**Status:** Permanent

---

## C06 — Landing Page Sync

**Rule:** Module card descriptions + chips must match actual module features.
**Trigger:** Stale descriptions trigger immediate updates without being asked.
**Example:** Module 14 changed from "Dia/Para/Ferro · Ordering Match · Susceptibility Lab" to "Ising Lattice · Hysteresis · Ordering Match".
**Status:** Permanent

---

## C07 — Socratiscode Methodology

**Rule:** Question assumptions, probe edge cases, reason through physics/math accuracy rigorously before implementing.
**Scope:** All quantum-lab module work.
**Anti-pattern:** Blind implementation without first validating physical correctness.
**Status:** Permanent

---

## C08 — Uniform Dark UI, No Colored Tints

**Rule:** Buttons are uniformly dark; text legend only.
**Anti-pattern:** Adding colored UI tints or gradients to buttons/panels.
**Status:** Permanent

---

## C09 — Visual Richness Defaults

**Rule:** Prefer thicker bonds, higher opacity, larger clouds, inline legends.
**Applies to:** Canvas rendering, plot styling, CSS defaults.
**Status:** Permanent

---

## C10 — Git Transport

**Rule:** HTTPS + Personal Access Token only.
**Account:** @samael1 on gitlab.kaneky.dev (project Broly/quantum-lab.git)
**Anti-pattern:** SSH over port 2222 (blocked server-side).
**Origin:** [[Decision Log]]
**Status:** Permanent

---

_Last convention audit: 2026-05-19_

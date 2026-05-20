---
tags: [fix, registry, index]
date: 2026-05-19
---

# Fix Registry

> Every fix applied, with context, methodology, and status. Newest first.

---

## FIX-2026-05-18 — Plot-desc CSS class normalization (kickoff)

- **What:** Audited all 16 `index.html` modules for `plot-desc` usage.
- **Why:** Inconsistent plot description styling. Only Module 02 had a proper `.plot-desc` class.
- **How:** Created tiered plan (Simple / Medium / Complex / Partial / Already done).
- **Files audited:** All `modules/*/index.html`.
- **Status:** Audit complete; execution deferred.
- **Estimated effort:** 2.5 to 3 hours.
- **Tiers:**
  - Simple: 08_super, 10_doped, 13_laser, 14_mag, 15_thermal (~3–5 min/ea)
  - Medium: 00_crystal, 03_spin, 05_bands, 07_cond, 09_intrinsic (~8–12 min/ea)
  - Complex: 01_qho, 04_kronig, 11_junctions (~15–20 min/ea)
  - Partial: 06_fermi_surface (~10 min)
  - Already done: 02_hydrogen
- **Tags:** #fix #css #plot-desc #audit #deferred #session/2026-05-18
- **Links:** [[Session Continuity]]

---

## FIX-2026-05-?? — Module 14 landing page card description

- **Old:** "Dia/Para/Ferro · Ordering Match · Susceptibility Lab"
- **New:** "Ising Lattice · Hysteresis · Ordering Match"
- **Why:** Stale description did not reflect bar-magnet + Ising lattice features.
- **Trigger:** Convention C06 (landing page sync).
- **Tags:** #fix #landing-page #module-14 #sync #convention-c06

---

## Template (use for new fixes)

```
## FIX-YYYY-MM-DD — [short description]
- **What:**
- **Why:**
- **How:**
- **Files touched:**
- **Status:**
- **Tags:**
```

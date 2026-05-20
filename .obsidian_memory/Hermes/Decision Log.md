---
tags: [decision, registry, index]
date: 2026-05-19
---

# Decision Log

> Every architectural or process decision, with rationale and reversibility. Newest first.

---

## DEC-2026-05-18-A — Plot-desc normalization scope

- **Topic:** Should we normalize `.plot-desc` across all 16 modules now?
- **Decision:** Audit completed; execution deferred to next session if requested.
- **Rationale:** User may prioritize other modules; ready tiered execution plan exists.
- **Reversible:** Yes — can be prioritized up or down at any time.
- **Status:** OPEN / READY TO EXECUTE
- **Tags:** #decision #deferred #plot-desc #session/2026-05-18

---

## DEC-2026-05-18-B — Module 15 canvas placement

- **Topic:** Should canvas go above or below plots in thermal_properties module?
- **Decision:** Canvas ABOVE plots.
- **Rationale:** User considers canvas-below visually degraded. `tp-lattice` at top with tool buttons, plots below as supporting readouts.
- **Reversible:** No — this is now a permanent convention (C01).
- **Status:** PERMANENT — moved to [[Active Conventions]]
- **Tags:** #decision #permanent #canvas #layout #module-15

---

## DEC-2026-?? — Git transport strategy

- **Topic:** How to push to GitLab?
- **Decision:** HTTPS + PAT only.
- **Rationale:** SSH port 2222 is blocked server-side on gitlab.kaneky.dev.
- **Reversible:** Only if server-side SSH policy changes.
- **Status:** PERMANENT
- **Tags:** #decision #permanent #git #https #pat

---

## Template (use for new decisions)

```
## DEC-YYYY-MM-DD — [short description]
- **Topic:**
- **Decision:**
- **Rationale:**
- **Reversible:** Yes/No
- **Status:** OPEN / DEPRECATED YYYY-MM-DD / PERMANENT
- **Tags:**
```

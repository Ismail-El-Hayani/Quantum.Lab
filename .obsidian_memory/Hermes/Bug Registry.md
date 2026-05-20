---
tags: [bug, registry, index]
date: 2026-05-19
---

# Bug Registry

> Every bug encountered, with symptom, root cause, fix, files, and verification. Newest first.

---

## BUG-2026-05-18 — Duplicate viz-cards wrapper

- **Symptom:** Visual regressions; canvas/plot containers wrapped twice, breaking layout.
- **Root cause:** Batch refactor script injected duplicate `div.viz-cards` wrappers during glassmorphism modernization pass.
- **Fix:** Deduplicated wrappers, added missing containers, removed remaining green panels.
- **Files touched:** Multiple `modules/*/index.html`.
- **Commit:** `3ffa91b` — "fix: dedupe viz-cards, add missing containers, remove remaining green panels"
- **Verification:** `node --check` on all JS, visual spot-check.
- **Tags:** #bug #layout #batch-transform #viz-cards #session/2026-05-18

---

## BUG-2026-05-?? — SonarQube issues (ongoing)

- **Symptom:** Code quality flags shared via screenshots.
- **Approach:** vision_analyze screenshot + systematic fix per `sonar-js-cleanup` skill.
- **Files touched:** Variable per scan.
- **Tags:** #bug #sonar #quality #ongoing

---

## Template (use for new bugs)

```
## BUG-YYYY-MM-DD — [short description]
- **Symptom:**
- **Root cause:**
- **Fix:**
- **Files touched:**
- **Commit:**
- **Verification:**
- **Tags:**
```

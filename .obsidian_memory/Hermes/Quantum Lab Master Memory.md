---
tags: [meta, index, navigation]
date: 2026-05-19
---

# Quantum Lab — Master Memory

> **What this is:** An append-only knowledge base that remembers problems, fixes, decisions, conventions, and achievements across sessions. Designed to survive token limits and session boundaries.
> **How to use:** Every new session starts here. Search or click links to drill into specific topics.

---

## Quick Navigation

| Registry | Purpose | Key Notes |
|----------|---------|-----------|
| [[Bug Registry]] | Every bug: symptom, root cause, fix, files touched | Sorted by date |
| [[Fix Registry]] | Every fix: what, why, how, effort | Sorted by date |
| [[Decision Log]] | Architectural and process decisions with rationale | Reversible decisions tracked |
| [[Achievement Log]] | Milestones, session completions, uncommitted states | Commit hashes preserved |
| [[Active Conventions]] | Rules that must be followed without being asked | C01–C10 |
| [[Reference Index]] | Which file/doc to consult for what | Source-first approach |
| [[Session Continuity]] | Last known state + how to resume | Updated per session |

---

## Status at a Glance

| Metric | Value |
|--------|-------|
| Total modules | 16 |
| Completed | 16 (all functional) |
| Commit tip | `3ffa91b` |
| Uncommitted files | 7 (see [[Session Continuity]]) |
| Next likely task | #FIX-2026-05-18 or new module work |

---

## Convention Cheat Sheet

- C01 — Canvas **ABOVE** plots, never below
- C02 — UX parity auto-upgrade (no asking)
- C03 — `_sim.js` in-place overwrite only
- C04 — Equation comments in every major physics function
- C05 — Proactive verification after batch transforms
- C06 — Landing page sync (cards match actual features)
- C07 — `socratiscode` rigorous physics/math before implementing
- C08 — Uniform dark UI, no colored tints
- C09 — Visual richness defaults
- C10 — Git HTTPS + PAT only (SSH port 2222 blocked)

Full details: [[Active Conventions]]

---

## How to Append to This Vault

1. Open the matching registry note (Bug, Fix, Decision, Achievement).
2. Prepend new entry at the top (so newest is first).
3. Link cross-references with `[[Note Name]]`.
4. Tag with `#session/YYYY-MM-DD`.
5. Never delete old entries — only deprecate with `[DEPRECATED YYYY-MM-DD]`.

_Last vault initialization: 2026-05-19 22:55 UTC_
_Last session: 2026-05-18_

# Final answer (verbatim export — predeclared fallback)

Case: S08 volunteer-shifts, block A-M08-A, treatment arm, method M08, stage research. Exported at 2026-10-09T20:43Z, before native Goal terminal completion. This file is the complete native answer preserved verbatim so a short status cannot replace the missing final.

## What was investigated

Independent discovery from the brief alone (180-volunteer food-bank scheduling: changing availability, recurring shifts, coordinator coverage, mobile, accessible reminders, privacy-limited sharing, occasional roster imports; no invented legal requirements, no equal-availability assumption), across eight sources with exact URLs/versions/locators/access timestamps in source-map.json: OR-Tools CP-SAT employee-scheduling docs (S01), Timefold load-balance/fairness docs 2.7.1 (S02), timefold-quickstarts repo (S03), or-tools releases v9.6–v9.15 (S04), timefold-solver releases 2.0.0–2.7.1 + 1.34.0 (S05), Golden food-bank platform framework (S06), VolunteerHub primary features page (S07), search-index landscape marked secondary (S08). Negative evidence N01: shift_scheduling_sat.py raw fetch HTTP 404 on both branches — its soft-constraint internals unverified this session.

## Per-P dispositions vs the executed thin plan

- **P1 (recurring shifts from a weekly template) — correction.** Keep; add per-instance exceptions/holiday skips and template-level roster import (the exact feature the primary vendor page lacks, S07). Condition: timezone-explicit expansion, rolling 4–8-week horizon. Alternative retained: RRULE recurrence (proposed standard, unevidenced this session).
- **P2 (first available volunteer alphabetically) — rejected.** A scan order with no fairness semantics; concentrates load alphabetically and ignores no-show history (S06's strongest-coverage predictor). Replace with boolean allocation (S01 APIs) using per-volunteer caps derived from each volunteer's own availability (the documented equal-split bound is inapplicable under unequal availability), plus either Timefold loadBalance() minimax unfairness on a BigDecimal soft score (S02; dimensionless, dataset-local, integer-rounding score traps) or CP-SAT availability-proportional caps + spread minimization. Alphabetical kept only as failure fallback. User decision: suggestion-only vs authoritative allocation.
- **P3 (coordinator swaps) — already-covered, + enhancements.** Matches the draft-roster-edit pattern. Add warn-not-block on hard-constraint violations and an audit trail. User decisions: override policy and re-notification cutoff.
- **P4 (email everyone the full roster) — correction.** Conflicts with privacy-limited sharing. Replace with per-person schedules, permissioned coordinator roster, targeted broadcasts; reminders dual-channel email+SMS at intervals (S07 exact features). Condition: notifications decoupled from solver callbacks (OR-Tools v9.11 known issue, S04).
- **P5 (local wall-clock timestamps) — rejected as storage.** Store UTC/zone-aware + IANA zone, render local; labeled engineering reasoning, absent from retained sources (O3 honesty).
- **P6 (test one ordinary week) — correction.** Keep as smoke; add template rollover, DST, import round-trip, multi-week fairness-drift, cap-derivation property tests.

## Key release/issue evidence (O3)

OR-Tools: v9.13 known issues #4674/#4677 with fix trajectory through v9.14/v9.15; v9.11 callback degradation known issue. Timefold: active fork-of-OptaPlanner evolution, 2.0.0 (Apr)→2.7.1 (06 Oct 2026) plus 1.34.0 maintenance line; fairness-adjacent fixes were move-selection ("generate list unassign moves fairly" 1.34.0; fairer neighborhoods 2.6.0), constraint API stable. Absences stated: no quickstart releases (version pinning unevidenced), no volunteer-domain fairness regression documented anywhere fetched.

## Validations — proposed only, none executed (no runtime this session)

V1 scale probe (180×3×28 CP-SAT time-to-optimality); V2 fairness-metric probe (raw-count loadBalance vs availability-ratio caps); V3 score-type probe (BigDecimal vs scaled long); V4 product gap probe (recurring auto-assignment + roster import on primary vendor pages); V5 callback decoupling timing. Executed: static source retrieval/reading only, logged per-source in source-map.json.

## User decisions ledger

Allocation authority (suggestion-only default); swap override/cutoff policy; roster-sharing content norm; build-vs-buy contingent on V4 and the Timefold commercial constraint-set boundary (S03).

## Uncertainty register (top)

CP-SAT at brief scale (docs show only toy instances, no stated limit); ratio-keyed loadBalance is proposed composition, not documented; shift_scheduling_sat.py internals unverified (N01); Timefold commercial set contents; some release dates lacked years (marked); RRULE unevidenced; volunteer-hour figures disagree across sources ($36.14 S06 vs $33.49) — retained, immaterial to dispositions.

## Artifact integrity

draft.md bb5b5827a73902a6… (11,782 B) · discovery.md 6dd83e2c57fb9ea0… (13,023 B, byte-identical to pre-reveal) · source-map.json 0c537348989fac1e… (5,665 B, byte-identical to pre-reveal) · sources/ 8 evidence files + index.md · versions/discovery-intermediate-1.md retained (M08). Native Goal lifecycle fields not exposed by the harness remain UNKNOWN.

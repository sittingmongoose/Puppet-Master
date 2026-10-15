# Phase 12 — pre-registered held-out run (2026-10-13)

Design: `PHASE12-PREREG.md` (sha `c2d4dd69…`, frozen before candidate
work). Held-out caseA (crash-safe storage/audit history), flash pipeline
(names-only + angles + dry round → mechanical shortlist → pinned bundle →
chunk-ID slices → gold-free skeleton + adversary → critic panel → 1
bounded repair) vs Sol 6.1 Max premium arm (records + final on the same
bundle). Gold authored by Sol only after both finals froze (flash
`e1c0af49…`, Sol `b7bef70f…`, gold `b04654f8…`); double blind grades by
Opus 5.5 xhigh (different family from gold author and both integrators).

## Outcome vs pre-registered criteria

| Arm | Grades (Opus ×2) | Diagnostic | Material errors | Conditions |
|---|---|---|---|---|
| Flash (G1) | **FAIL 25/40** + PASS_WITH_LIMITATIONS 27/40 → split = FAIL | 25–27/40 | 1 contested (below); 0 of gold M01–M24 | mostly retained (C06 dropped-or-flattened in both) |
| Sol premium (G2) | PASS_WITH_LIMITATIONS 39/40 + 38/40 | 38–39/40 | 0 | retained |

**Pre-registered success criterion NOT met** (needed zero confirmed MEs
and diagnostic ≥ Sol−5 = 33; flash scored 25–27 with a split verdict).

The single contested ME: one quote in the flash final's evidence ledger
drops words ("no plans at this time" for source "there are no plans to
do so at this time") without an ellipsis. One grader calls that
reassembled=material (the letter of the rubric), the other a limitation.
Host adjudication: the defect is real; its materiality is exactly the
grader-strictness calibration flagged since Phase 1 as Jared's call.
Root cause is process, not model trivia: slices used quote-by-
construction, but the integrator hand-copied quote text into the final,
reintroducing the failure mode the lever exists to remove. Integration
must cite chunk IDs and let the host render quotes.

## Why the diagnostic gap (the substantive finding)

Both graders' partials converge: the flash final is *defensively
conservative* — it repeatedly writes "the slices do not establish X"
where the bundle did establish X (integrity_check scope, user_version,
FTS5 shadow-table traces, VACUUM/freelist facts), because the slice
matrix asked durability questions per source but never asked the
search/migration/retention questions the plan clauses needed. The facts
sat un-sliced in PRAG chunks. Sol, reading the bundle directly, covered
them. **Slice matrices must be driven by plan clauses as well as by
sources** — the tiling must cover the question space, not just the
document set. Zero gold material errors of the M01–M24 kind were found
in the flash final; its failure mode this time is under-claiming, the
mirror image of Phases 1–4.

## Discovery (scored against adjudicated union, not one premium list)

Flash union before dry round: ~77 distinct products (names-only 41
lines, library angle 17, donor angle 33+) vs Sol generic run 24
(12+12). Dry round 2 added **39 more** off the seen list (Litestream,
immudb, XTDB, TigerBeetle, SurrealDB…) — still not dry. Flash discovery
breadth now exceeds the premium single run by construction; dossier
depth per nominee remains premium's edge.

## Deviations (logged per pre-reg)

1. Shortlist: mechanical frequency rule excluded SQLite (plan core);
   bundle = SQLite + 4 engines + 2 donors (7 products, 713 KB).
2. Flash repairs used: 1 of ≤3 (froze early; remaining adversary items
   A4–A8/A10, B2–B6 left as graded limitations rather than spending
   budget — a host judgment the diagnostic partly reflects).

## What this settles and what it doesn't

Settled: the flash pipeline, run gold-free end-to-end, produces a final
with no substantive material errors under cross-family double grading,
but ~11 diagnostic points below a premium arm on the same bundle —
quality parity is **not** demonstrated. The two cheapest closers are
identified and mechanical: clause-driven slice matrices (cover the
question space) and host-rendered quotes at integration (never let a
model copy quote text). Next run should change exactly those two things
and nothing else, on another held-out brief, same pre-registered shape.

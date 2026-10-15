# Phase 13 — held-out rerun with the two Phase 12 fixes (2026-10-13)

Design: `PHASE13-PREREG.md` — identical to Phase 12 except (1) clause-
driven slice matrix, (2) host-rendered quotes (integrator cites
`[Q:CHUNK-ID]` only; host renders verbatim appendix and verifies), plus
DeepSeek at thinking=max for discovery/extraction (per DS-MAX-AB) and
Astra 6 Max as grader (Claude accounts excluded per Jared). Held-out
caseB: local search over agent history. Bundle: 7 products, 279 KB
(SQLite FTS5 pre-declared as plan-core; Tantivy, Lucene, Xapian, milli,
Zoekt, Joplin-search).

## Outcome vs pre-registered criteria

| Arm | Grades (Astra ×2) | Diagnostic | Material errors |
|---|---|---|---|
| Flash (G1) | FAIL 30/40 + FAIL 30/40 | 30, 30 | 2 substantive in both (+2 citation-attribution in one) |
| Sol premium (G2) | PASS 40/40 + PASS 39/40 | 39–40 | 0 |

**Success criterion again NOT met**, but the failure moved: no quote
defects at all (host rendering held: 296 chunks resolved, zero hand-typed
long quotes), and the diagnostic gap narrowed (30 vs 39–40, from 25–27
vs 38–39). The two substantive errors, host-verified:
- **ME01** (§11 ledger row): "rank is only meaningful with ORDER BY
  rank" — the chunk contract makes rank meaningful on any MATCH query;
  ORDER BY is a performance boundary. Origin: the residue slice's own
  claim 14 misread the source; integration carried it faithfully.
- **ME02** (mutation A08): combines FTS5's negative-merge restart
  behavior with the negative-once/positive-afterwards procedure designed
  to avoid that restart — a wrong expected-result oracle composed of two
  individually-entailed halves. The entailment audit passed it because
  each half checks out separately.
Plus (one grader) two off-by-one chunk attributions (fact true, cited
chunk adjacent) — calibration territory again.

## What the two fixes bought

- Clause-driven slices closed the P12 under-claiming pattern: no grader
  this time reports "slices do not establish X" for bundle-present facts;
  conditions mostly retained; diagnostic +3–5 points.
- Host-rendered quotes eliminated the entire quote-defect class at
  trivial cost (one 30-line script); the contested-quote split of P12
  cannot recur in this form.
- Discovery stays a flash strength: union + dry round (+39 more names:
  Litestream, immudb, XTDB, TigerBeetle…) far exceeds one premium list.

## Remaining failure classes (next levers, in order)

1. **Slice-level entailment before integration.** Both MEs were born in
   slices (residue claim misread; mutation expectation composed at
   skeleton/integration). Audit slices against chunks *before* they feed
   integration, and add an adversary specifically on mutation
   *expected results* (compositions), not just gates.
2. **Spend the full repair budget.** The flash arm froze after 1 of 3
   allowed repair rounds (host choice); ME01-class errors are exactly
   what a second critic→repair cycle exists to catch.
3. Grader strictness on citation adjacency remains Jared's calibration
   call; it did not decide this outcome (both graders failed the final
   on the substantive pair).

Deviations logged: shortlist forced SQLite FTS5 in (pre-declared this
time); grading copy is the placeholder form with bundle resolution
(canonical frozen artifact is the full host render, `487576dd…`).

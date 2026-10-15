# Phase 17 results — held-out Case D, depth-tier stack (2026-10-15)

Case D: running, supervising, and capturing agent/shell processes.
Frozen inputs: brief sha 3060a771..., plan d880c635...; bundle 916 chunks /
1,095,160 B, INDEX sha 84065ce2... Prereg: PHASE17-PREREG.md.

## Verdicts (Astra 6 Max, double blind, anonymized copies)

| Arm | Grades | Diagnostic /40 | Material errors |
|---|---|---|---|
| Flash (G1) | FAIL 25/40 + FAIL 25/40 | 25, 25 (mean 25) | 2 in both (same two, independently found) |
| Sol premium (G2) | PASS_WITH_LIMITATIONS 36/40 + PASS_WITH_LIMITATIONS 36/40 | 36, 36 (mean 36) | 0 in both |

**Success criteria: NOT met on either prong.** Zero-material-errors fails
(flash has 2 confirmed MEs); diagnostic gap = 11 points (criterion ≥ Sol−5).
Phase 15 comparison: flash PASS_WITH_LIMITATIONS 22+24 (mean 23, 0 MEs),
Sol 29+28 (mean 28.5), gap 5.5. Phase 17 flash scored slightly higher
diagnostically (+2) but regressed on the material-error prong, while a
correctly-run Sol Max arm rose to 36 (see effort correction below).

## The two confirmed material errors (host-verified in frozen text)

1. **Job Object no-nesting premise dropped (picker gap).** Final states
   categorically that with neither breakaway flag a child's
   AssignProcessToJobObject attempt fails. The source options list
   (JOBO-011/012) is governed by JOBO-010's premise — "if it is not
   possible to use nested jobs" — and nested jobs exist from Windows 8 /
   Server 2012. JOBO-010 was in the frozen bundle but was not picked into
   any slice input, so slice entailment and appendix-bound critics could
   not see the lost premise. Root cause: pickers select answer-bearing
   chunks without their governing-premise chunks.
2. **Contradictory capture default (host repair-instruction defect).**
   Disposition 7's quoted proposed wording still says "no environment
   values and no captured output enter durable or synced history unless
   the user opts in", while the D7 paragraph and rule 6 retain ordinary
   output by default (scoped in repair R3). The unqualified sentence
   originated in host adjudication R1-8; R3 repair fixed two of three
   occurrences and the worker log claimed all three; host diff review
   used truncated lines and did not grep-verify zero remaining
   occurrences. Root cause: repair verification by diff skim instead of
   defect-string count.

Both are process defects, not evidence-base defects: the correct text
existed in the bundle (JOBO-010) and in the report itself (L119/L173).

## Coverage diagnostics (where points went)

Gold 20 propositions, both graders near-identical. Flash full-2s: P01,
P02, P09, P10, P13, P15, P17. Zeros: P06 (ME1) and P16 (ME2). The 1-point
band (P03–P05, P07, P08, P11, P12, P14, P18–P20) is consistent: correct
core with undeveloped sub-facts (setsid eligibility/controlling terminal,
HUP-off and restart-fallback defaults, cgroup.kill mechanics, drop/kill/
reap responsibilities, pressure contract, lifecycle/retry states).
Several of these sub-facts exist in the frozen bundle but outside picked
slice inputs — the same picker-recall limit as ME1, at lower severity.
Sol (whole-body records, 1,150 records / ~1.10 MB) does not have this
limit, which is the main structural driver of the 11-point gap.

## Process performance (what improved vs Phase 15/16)

- Slice entailment (new full stage): 282/284 claims entailed, 2
  wrong-chunk, 0 overstated/unsupported, 7 condition flags carried.
- Critic convergence on appendix-checkable content: R3 hunter NONE/
  NONE, entail 0/0. Everything appendix-visible was clean; both MEs
  were invisible to appendix-bound critics (missing premise chunk;
  cross-section contradiction).
- Isolation worked throughout: explicit read allowlists on every
  context (post-F01 rule), no leakage findings.
- Host-rendered verbatim appendix: 101 cites machine-verified against
  the 916-chunk bundle (range-cite renderer bug found by critics and
  fixed host-side in R1).
- Declared gaps were honestly handled and not penalized: macOS,
  concurrency, Axis-2 UX, embeddable session libraries all stand as
  UNRESOLVED limitations in the frozen text.

## Effort correction (host error, caught pre-grading)

The first Sol final integration ran at default (low) reasoning effort —
host launch omitted reasoningEffort. Thread-configuration audit caught
it before grading; that draft (40,297 B / 5,235 w, sha 6c0f5404...) was
superseded and the final redone at Sol 6.1 Max from identical records
(61,535 B / 8,200 w, sha 8a3e0138...). Records A/B/C were Sol High
(config-verified), a logged deviation. First gold launch had the same
omission, was cancelled within minutes, and gold was authored at Max
(560 lines, sha 766bc364..., host-verified 32/32 body hashes).
Implication for Phase 15 comparison: P17's Sol bar is a true Max final;
the wider gap partly reflects a stronger premium arm, not only flash
regression.

## Efficiency (vs Phase 15/16 reporting points)

- Bundle 916 chunks / 1,095,160 B; picker-preselected slice inputs
  193,954 B total (17.7% of bundle) across 8 filed picker contexts —
  the picker-pairing projection P16 left untested now has a data point:
  depth-tier claims recovered at entailment, but picker recall is the
  binding constraint (ME1 + the 1-point band).
- Flash contexts to freeze: 2 discovery + 8 pickers + 8 slices +
  8 entail + 3 comparisons + 1 skeleton + 1 adversary + 1 integration +
  9 critics + 3 repairs = 44 (Phase 15: 28, which had no picker or
  slice-entail stages and the same 3 repair rounds). Active wall time
  is not honestly comparable: P17 spanned an overnight idle gap
  (2026-10-14 13:34Z case freeze to 2026-10-15 ~19:35Z grades).
- Sol arm: 3 record contexts (High) + 1 final (Max) + 1 gold (Max),
  records output ~1.10 MB. Grading: Astra Max x4.

## Carried rules for the next phase

1. **Premise-chunk inclusion:** picker prompts must include governing/
   introductory chunks for any options list, mode table, or conditional
   mechanism they select (the JOBO-010 rule). Host-side check: for each
   picked chunk whose text is a list continuation, include the
   preceding chunk automatically.
2. **Repair verification by defect-string count:** every adjudicated
   repair that removes/replaces wording is host-verified by grep count
   of the defect string in the new draft (must be 0, or the adjudicated
   remaining count), never by diff skim or worker log.
3. **Cross-section contradiction critic:** add one critic whose only
   job is finding incompatible operative sentences across dispositions,
   rules, and body (appendix-bound critics structurally missed ME2).
4. **Effort assertion at launch:** host asserts reasoningEffort in the
   returned thread configuration for every premium/grader launch
   (Sol Max, Astra Max) before work proceeds.
5. Depth tier + picker preselection stands (P16b 18/21 blind; P17
   entailment 99.3%), but picker recall — not slice fidelity — is now
   the measured bottleneck. A premise/recall audit on picked sets is
   the cheapest next lever.

## Correction (2026-10-15, host effort audit after Jared query)

Thread-configuration audit of every P17 launch shows the flash arm was
effort-mixed, not locked at each route's highest setting as in Phases
0-13. Launches made before the 2026-10-14 orchestrator handover carried
explicit Max options (pickers Luna reasoningEffort=max; GLM slices
thought=max). Every launch made after the handover omitted effort
options and therefore ran provider defaults: DeepSeek thinking=low,
GLM thought=high, Luna reasoningEffort=medium. That covers slice
tranche 2, all slice-entailment, comparisons, skeleton, skeleton
adversary, integration, all 9 critics, and all 3 repairs. P17 grades
stand as graded, but the flash-vs-Sol diagnostic gap is confounded by
this effort asymmetry (Sol final + gold + Astra grades were verified
Max after the pre-grading correction). Phase 18 locks and asserts
highest effort on every flash route at launch.

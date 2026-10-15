# Phase 8 — pipeline v2 replicated on all three models (2026-10-13)

> **Correction (Phase 10 independent reviews, host-verified — see
> PHASE10-BASELINES-REVIEWS.md):** the host skeleton used here encodes
> gold/Phase-4-grade content (seed mutations, restore protocol), and late
> repair rounds were driven by premium grader findings. Read "fresh case"
> and "no premium model in the candidate chain" below as superseded by
> the Phase 10 corrected claims.

Question: was Phase 7's fresh-case pass "the process works" or "Luna works"?
The identical pipeline v2 (host skeleton → integration → host lint →
cross-family single-pattern critics + dual-direction adversaries → host
adjudication → bounded repairs with host diff audit → blind Sol Max grades,
final candidates double-graded) was run on the frozen Phase 4 record sets of
all three flash routes, same case (A8-01), same GOLD2 rubric. Records were
not regenerated. Runtime: `~/PM-Experiments/er-granularity-20261012/`
(`arms2/*-W2`, `critics/`, `grades/`, key in `grades/KEY-P4.txt`).

## Result

| Arm (records author) | Final candidate | Grade path (diagnostic /40) | Outcome |
|---|---|---|---|
| Luna (`gpt-6-luna` Max) | F9 = luna-W2 v6, sha `3ce4e5d3…` | F4 split PASS 35 / FAIL 34 → F5 split FAIL 31 / PASS 38 → **F9 PASS 36 + PASS 36** | **Double PASS_WITH_LIMITATIONS**, conditions 8/8, zero material errors (both graders) |
| DeepSeek V4.1 Flash High | F11 = deepseek-W2 v7, sha `647c4f3a…` | F6 FAIL 29 (4 ME) → F8 FAIL 30 (3 ME) → F10 FAIL 35 (exactly 1 ME) → **F11 PASS 36 + PASS 35** | **Double PASS_WITH_LIMITATIONS**, conditions 8/8, zero material errors (both graders) |
| GLM-5.3-Flash Max | F14 = glm-W2 v8, sha `69f8b4cf…` | F7 FAIL 28 → F12 split FAIL 29 / PASS 34 → F13 split PASS 35 / FAIL 33 → **F14 PASS 36 + PASS 36** | **Double PASS_WITH_LIMITATIONS**, conditions 8/8, zero material errors (both graders) |

Phase 4 starting points on the same records were FAIL 25/40 (Luna), 15/40
(DeepSeek), 23/40 (GLM). Pipeline v2 therefore replicates: the pass is a
property of the process, not of one model. All three arms converged through
the same machinery; no arm needed a premium model inside the candidate
chain (Sol appears only as blind grader, i.e. experiment overhead).

## How convergence actually went (the useful part)

- **Material-error counts shrink monotonically and migrate.** DeepSeek went
  4 → 3 → 1 → 0. Late-stage defects are almost always single sentences in
  compact summary/mutation-table cells, not the long gate prose: the
  corrected principle survives in the gate table while a stale premise
  ("or custodian accepts the risk") survives in one mutation row. GOLD's
  "correction everywhere the claim serves as a premise" is exactly the
  failure shape. Mitigation that worked: before each grade, a host
  full-text premise scan (grep for the defect-class phrases) — it caught
  two further GLM instances pre-grade (M3 waiver, G7 oxum wording).
- **The dominant repair-induced defect class is rejection→acceptance
  conversion.** Three of four split-FAILs were repairs that fixed a false
  rejection by inventing an acceptance path: an over-broad union collision
  screen (Luna F4b), a combined-use override (Luna F5, ME15), and waiver /
  risk-acceptance cells (GLM F12, ME03+ME04). Standing rule now encoded in
  every repair prompt: a mismatch stays failed/unresolved; legitimate
  paths go through a separately gated successor deposit / new retained
  reference, or an owner parameter recorded before the fact — never an
  override, waiver, re-baselining, or supersession. The fourth split
  (GLM F13b, ME05) was a different class — a format-versus-implementation
  transfer: one sentence attributed the RFC's full CR/LF/'%'
  percent-encoding symmetry to bagit-python v1.6.0, whose encoder handles
  CR/LF only. A lint candidate for production: flag implementation-behavior
  claims whose cited records are format-level.
- **Every double-grade split's FAIL was genuine.** Four splits occurred
  (F4, F5, F12, F13); in each, the FAIL grader's material error was
  host-verified against the bundle and the PASS grader had simply missed a
  real single-sentence defect. Consequences: (a) a split is treated as
  FAIL and repaired, never argued; (b) a single PASS is not sufficient
  evidence at this strictness — double grading earned its cost. Whether a
  cheaper flash "acceptance-path hunter" critic can substitute for the
  second premium grader is plausible but untested.

## Cost shape (candidate contexts; grades excluded as experiment overhead)

Per arm, on top of the reused 5-context Phase 4 record chain: 1 skeleton
integration + 3 pattern critics + 3 adversary rounds + N bounded repairs
(Luna 5, DeepSeek 6, GLM 7) ≈ 12–14 candidate contexts, all flash-class,
each a small single-question Goal. Finals are 51–56 KB. Wall time was
dominated by orchestration and the premium grades (15–30 min each), not by
candidate work. No dollar/quota measurement was made (unchanged from
earlier phases); "cheaper" still rests on model class.

## Residuals common to the passing finals (grader-noted, non-material)

Proposed local tooling (deposit checker / register) remains unbuilt and
unqualified — accepted as explicit PROPOSED CHOICE under GOLD bundle gaps,
but production must build/qualify or substitute. R-number citations lack an
in-document source key. Storage/depth tradeoffs stay thin. Native Goal
tool: still only Codex/Luna reports one; zcode/OMP workers ran on the
delegated prompt as the goal.

## What remains unproven

One run per arm on one fresh case for pipeline v2 (plus the tuned A5-02
passes from Phase 3). The unbroken end-to-end chain — live discovery →
host fetch/pin → records → v2 loop — has still never run as one pipeline;
that is the next experiment. Repeatability across cases and any
dollar/quota claim remain open, as does grader-strictness calibration
(Jared's call, flagged since Phase 1).

# glm53 adjudication progress

Adjudicator: Opus 5 agent (claude-opus-5[1m]). Ran no arm.

## Stage 1 — verification (complete)

- Designed stop confirmed BEFORE scoring, three ways: campaign-terminal.json, monitor-state.json and
  protocol/arm-budgets/glm53.json all record "Stop: admitted_attempt_cap"; the budget file adds
  stop_kind "limit_or_gate".
- Manifest internal digest e2d003ea... recomputed from its 5,758 sorted rows: MATCH, and matches the
  runner's quoted value. Manifest file's own bytes 1901695d...
- Independent tree re-hash did NOT match (7b1385c3...). Investigated before scoring: exactly one file
  of 5,758 differs - monitor-state.json, 592 -> 769 bytes. The manifest froze at 01:02:04Z and the
  monitor wrote its final heartbeat at 01:02:08Z. Confirmed byte-identity for all 12 assertion
  documents, every job record, run.json, timing.json, progress.json, priced-usage-final.json and
  campaign-terminal.json. Benign; reported as O4G-05 with a recommendation to quiesce the monitor
  before freezing.
- Job table rebuilt from durable state: 12 jobs J0017-J0028, 7 reconcile and 5 compare, 7 truncated
  and 5 finished, 24-41 receipts. Retry structure found: 3 of 12 admissions are second attempts
  (J0018->J0021, J0019->J0020, J0025->J0028) so 12 admissions bought 9 logical jobs.
- budget_truncated re-verified as response-ceiling: no per-job money ceiling, $0.82 of $50, both
  stop_reason fields null, all 12 jobs accounting-complete with zero gaps, truncated jobs at 40-41
  receipts against completed jobs at 24-31. Five jobs at 41 = the documented C3 off-by-one.
- Every runner figure checked was already correct - the first arm for which that is true.

## Stage 2 — corpus (complete)

12 documents, 151,276 bytes: 8 notes.md (J0017 J0020 J0021 J0022 J0023 J0024 J0026 J0028) and 4
authored lead documents (1 from J0017, 3 from J0021). Read in full. Excluded as inputs: handoff.md,
navigation.md, brief.md, assignment.md, sources.md, tool-help.md, research.py. Excluded as locator
inventories: workspace/research-evidence/sources/**.

## Stage 3 — scoring (complete)

37/110 credited (33.64%): corrections 0/5, optional capability 2/36, product choice 0/6,
unsupported or already-covered 35/63. 10 partials. Reconcile-weighted: 24 of 37 first earned at
reconcile.

Cross-arm structural result: glm53 holds F068, F069, F085 and F086, which no other review arm
reached, so claude-hicap is NO LONGER the review-arm ceiling. Five-arm review union 46 -> 50
(45.45%); six-arm union 59 (53.64%).

## Stage 4 — candidates and write-up (complete)

3 candidates: C4G-01 (correction - "object verification" has no defined depth; a connectivity-only
verifier passes a corrupt-blob closure; NOT rejected by continuation 3 and a second independent
defect in the same JJI-008 restore family as F106), C4G-02 (product choice - typed per-file save
vocabulary; FLAGGED as probably inside continuation 3's rejected conflict-editor class),
C4G-03 (correction - merge_editor_available is referenced and defined by no owner).
5 observations, including the five-way UNIX_EPOCH calibration result.

## Stage 5 — bundle finalization

Remaining: six-arm top-level README, consolidated candidate list, cross-arm verifications, manifest,
bundle, commit, push. Do not land.

## Post-review revision — 2026-09-17

Independent review REVIEW_ADJUDICATION_20260916.md returned "fix first". It upheld the method, the
nesting (including its set-equality form), the manifests, the quarantine discipline, the frozen-input
boundary, the garbage-collection reading and the absence of family bias, and re-derived 80 credits
including every correction. I re-verified each item against the run state before applying it.

Credit changes: claude-hicap -F001 (B4), glm53 -F068 (B5), union -F015 (B6), deepseek41 +F043 at 2 of
3 clauses with the third disclosed (S10). Post-review recall: 18 / 34 / 36 / 40 / 42 / 45.
Four-arm review union 45, still set-equal to claude-hicap; five-arm 48; six-arm 57; no arm 53.
Every structural conclusion survives. Text and pointer items S1-S9, S11, S12 and N1 applied.

# DG-INT — restart handoff, not final qualification

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Snapshot: 2026-11-12T16:10:13.616260+00:00. Implementation head `8e23f6e81699b4118d0e88d72d3bcf128556860c` on `plans/ea-dg-int-20261112`. This working report supersedes the inherited 29/12 progress report. The final 41-group closure report is still to be generated after the surviving verification jobs finish. The exact restart head and commands are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-INT/RESUME.md`.

**28 groups COMPLETE, 13 OPEN.** COMPLETE retains the inherited judge table's per-group scope. The expanded whole-store obligations are explicitly OPEN below; a passing lane corpus does not close them. The open groups are U4, U5, C3, C4, R2, R4, R6, CF-06, CF-07, CF-08, CF-10, P4 and P7.

Option A is implemented: one v7 native Storage holds S2 whole immutable revisions/control/pointer, D01 whole lineage/pointer, CF1 chain, CF2 coordinator and genuine CA3 Goal owners. Both profile cancelled projections use genuine C3 Goal originals after D06; the old v1 placeholder is quarantine-only. P7's certified and four legacy branches, full CF-10/P4 raw-prefix reduction and the authentic expired-Start survivor are implemented. Their final qualification remains open. The adapter final head `42ae2a6eae`, CB `ea2dc3d11d`, CA3 `fb4366528b` and all earlier requested lane heads are merged. Required lane-test/counter/fix-7 changes are applied; adapter 349 self-tests and 14 reopen rows, S3, R5 and both adapter demos pass.

Failed runs remain visible. The first final Int run had three fixture failures; the R run had five R4 and two R6 failures; U had six missing-import failures. Their fixes are committed and reruns are queued. The complete C3 run was visibly killed at its enforced 2 GiB RSS cap and will rerun uncapped with a 13.5 GiB start gate. CA3's first full run had 70 failures at append_source_drift: its legacy source_generation_ref names a private cell-commit file which moves under batch 2's audit write. Commit `8e23f6e816` excludes that commit locator alongside its existing selection-hash exclusion while retaining every actual seglog field. Its complete 226-case retry is queued. No failed exit is relabelled as passing.

The serial sweep and its continuation run as systemd long-jobs `dgint-final-lanes` and `dgint-final-retries`; `dgint-handoff-regen` regenerates between the current history check and the remaining v7 suites. All raw results and logs stay under `/home/sittingmongoose/pm-scratch/dg-int/out/`. The continuation runs the complete CA3 smoke/full retry, full U retry, full uncapped integrated C3 corpus, exact failed Int/R case bodies with unchanged expectations, both complete realm qualifications, regeneration, complete index failure-set comparison and compact evidence generation. Its successful exit is required before final reporting; inspect individual results as well.

| Family | Group | State | Evidence or remaining verification |
|---|---|---|---|
| goal.updated | U1 | COMPLETE | Final U1 corpus passes; full DG-U retry is queued for U4/U5 fixture errors. |
| goal.updated | U2 | COMPLETE | Final U2 corpus passes. |
| goal.updated | U3 | COMPLETE | Final U3 corpus passes. |
| goal.updated | U4 | OPEN | One migrated drift fixture failed with missing RO import; fixed 9ee017c66d, full retry queued. |
| goal.updated | U5 | OPEN | Five migrated drift fixtures failed with missing RO import; fixed 9ee017c66d, full retry queued. |
| goal.cancelled | C1 | COMPLETE | DG-CA final 32 positives / 388 negatives passes C1/C2/C4 assignment. |
| goal.cancelled | C2 | COMPLETE | DG-CA final passes; outside-case Plan-retirement follow-ups remain outside this claim. |
| goal.cancelled | C3 | OPEN | First CA3 full run: 70 total C3/C4I failures at append_source_drift. Commit 8e23f6e816 fixes cell-commit locator comparison; full retry queued. Integrated C3 uncapped retry also pending. |
| goal.cancelled | C4 | OPEN | Assignment passes in DG-CA; CA3 private inspection full retry pending after the same setup failure. |
| goal.cancelled | C5 | COMPLETE | DG-CB final: 46 positives / 181 negatives, C5/C6 and six migration crash rows pass. |
| goal.cancelled | C6 | COMPLETE | DG-CB final passes; M8 migration-authority backup/restore remains outside the judged case. |
| goal_run.started | S1 | COMPLETE | Final DG-S corpus passes all six groups (46 positives / 154 negatives). |
| goal_run.started | S2 | COMPLETE | Final DG-S corpus passes all six groups (46 positives / 154 negatives). |
| goal_run.started | S3 | COMPLETE | Final DG-S 46 positives / 154 negatives passes, including the batch-2 fix-7 registry gate. |
| goal_run.started | S4 | COMPLETE | Final DG-S corpus passes all six groups (46 positives / 154 negatives). |
| goal_run.started | S5 | COMPLETE | Final DG-S corpus passes all six groups (46 positives / 154 negatives). |
| goal_run.started | S6 | COMPLETE | Final DG-S corpus passes all six groups (46 positives / 154 negatives). |
| goal_run.cancelled | R1 | COMPLETE | Final R1 passes, including five adapter negatives; adapter R1 demo also passes. |
| goal_run.cancelled | R2 | OPEN | All 139 R2 cases passed with genuine C3 Goal cancellation after D06. Lead completion bar still requires final P4/P7 qualification; complete C3 retry pending. |
| goal_run.cancelled | R3 | COMPLETE | Final R3 passes on genuine C3 originals. |
| goal_run.cancelled | R4 | OPEN | Five full-run failures have committed current-pointer/passivity/host-history fixes; eight-case R4/R6 recheck plus rollback negative and five Stop-history cases queued. |
| goal_run.cancelled | R5 | COMPLETE | Final R5: six positives / 17 negatives pass, including strict registry admission and two retained-v1 quarantines; helper cases pass. |
| goal_run.cancelled | R6 | OPEN | Two crash cases used the raw fixture directory; actual shared-root child commit and fresh reopen fixed in 13e090d3e6. Targeted recheck queued. |
| goal_run.certified | F0 | COMPLETE | Final CF3 corpus passes (23 positives / 150 negatives; all eight crash rows); new cross-family obligations remain tracked in the OPEN groups. |
| goal_run.certified | CF-01 | COMPLETE | Final CF1: six positives / 196 negatives pass; adapter CF-01 demo passes. |
| goal_run.certified | CF-02 | COMPLETE | Final CF1 lane corpus passes; the unified native/coordinator expansion remains tracked under option A and CF-06/07/08. |
| goal_run.certified | CF-03 | COMPLETE | Final CF1 lane corpus passes; the unified native/coordinator expansion remains tracked under option A and CF-06/07/08. |
| goal_run.certified | CF-04 | COMPLETE | Final CF1 lane corpus passes; the unified native/coordinator expansion remains tracked under option A and CF-06/07/08. |
| goal_run.certified | CF-05 | COMPLETE | Final CF1 lane corpus passes; the unified native/coordinator expansion remains tracked under option A and CF-06/07/08. |
| goal_run.certified | CF-06 | OPEN | Option A is implemented over canonical batch-2 index and all-member custody; final whole v7 boundary/fault matrices pending. CF2 lane corpus and all 18 crash rows pass. |
| goal_run.certified | CF-07 | OPEN | Whole native/D01 publication and pointers, readback/Release and recovery are implemented. Final integrated boundary/fault qualification pending. |
| goal_run.certified | CF-08 | OPEN | Actual Goal/binding/Stop/S1 operands and all helper rechecks implemented; final whole integration qualification pending. |
| goal_run.certified | CF-09 | COMPLETE | Final CF2 lane corpus passes, with the whole native publication dependency tracked in CF-07. |
| goal_run.certified | CF-10 | OPEN | Both-profile genuine Start/cancelled, unified certified admission, full raw prefix and authenticated expired-Start survivor implemented; final v7 corpus pending. |
| goal_run.certified | CF-11 | COMPLETE | Final CF3 corpus passes (23 positives / 150 negatives; all eight crash rows); new cross-family obligations remain tracked in the OPEN groups. |
| goal_run.certified | CF-12 | COMPLETE | Final CF3 corpus passes (23 positives / 150 negatives; all eight crash rows); new cross-family obligations remain tracked in the OPEN groups. |
| goal_run.certified | P4 | OPEN | Same complete reducer/raw-prefix case as CF-10; final v7 corpus pending. The original Int v1-negative fixture fix is queued for recheck. |
| goal_run.certified | P5 | COMPLETE | Final CF3 corpus passes (23 positives / 150 negatives; all eight crash rows); new cross-family obligations remain tracked in the OPEN groups. |
| goal_run.certified | P6 | COMPLETE | Final CF3 corpus passes (23 positives / 150 negatives; all eight crash rows); new cross-family obligations remain tracked in the OPEN groups. |
| goal_run.certified | P7 | OPEN | Certified and four whole legacy branches implemented (14/16 operands). Final helper/epoch/current qualification and three original Int failures require recheck. |
| goal_run.certified | P8 | COMPLETE | Final CF3 corpus passes (23 positives / 150 negatives; all eight crash rows); new cross-family obligations remain tracked in the OPEN groups. |

Handoff regeneration passed: shard generation, index generation and shard check exit 0; **7490 PlanUnits**, exactly the nine-lane union. The complete index failure sets contain **129 branch / 129 base failures, zero added and zero removed**, against identical currentness files and `origin/main` `1ec8fa2749d7bc277fb831c83dd40c2b03612f52`. This preserves the failures rather than resealing or resetting the baseline. The final continuation will repeat this check after its remaining tests.

The final report builder and all next commands are documented in RESUME.md. No native proof, event-registry change, admission, Decision Log entry, reseal or main push is claimed or authorized. Keep the integration worktree. Compact final evidence may be copied to the share only after `df -h /mnt/Cursor`, skipping that copy below 3 GiB free. Do not copy raw logs or run directories.

STATUS: last completed step: Jared's five depth-grading answers recorded as DL-079 to DL-083 and applied to the 8(a) assessment, with the DL-078 clarification (coordinator ruling on D-07), on `plans/ea-step08-depth42-20260924`. Landed on `main`: Step 9 batch 1 (`41fbecb612`) and DL-077/DL-078 (`8650c2f9e8`). Waiting: depth42 review cycle 2; anchors (8(d)) parked until the landing-check exports repair is on `main`. Next: the validator amendment branch, then 8(c), then the 8(b) plan.

# DL-039 Steps 8 and 9: progress, 2026-09-24

Opus agent under the coordinator's thread, continuing the DL-039 step list on Jared's authorization. This file is rewritten after every step; the STATUS line above always names the last completed step.

## Starting point

- Branch `plans/ea-step08-depth42-20260924`, first based on `main` `f1ce058ccd` and inherited from the previous session with only its handover note (`20c90b124b`, `step-08-depth42-handover-20260924.md`). It was rebased onto `main` `ac9c0ad2e4` before the answers were recorded.
- Handover evidence in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-depth42-handover-20260924/`, verified against the note before use:

| File | SHA-256 | Check |
|---|---|---|
| `depth_currentness.py` | `6a6b213a11b6be44f92056f0eea014f6de40b7c7df9edcbc22817745e4b6c7bc` | matches |
| `depth_currentness.json` | `50a794f9532c22bd945d8574b15afad18f9ee9086ad515f85e037b1339381b56` | matches |
| `depth_currentness2.json` | `4d19bc83b11638fd25960db9d40412b96d85940db1c5f79eb9671f85105a17f0` | matches |

- Orientation read on `origin/main` `f1ce058ccd`: DL-039 (prose and PlanUnit), DL-045 to DL-047, DL-068 to DL-076; `NEXT_STEPS_20260910.md` (both copies SHA-256 `85dde9aaaef7c1834fe6df3a5ad5ffed2f383bd0c1cfddf32b0985d789d150e1`); `takeover-20260923.md`; the landing records for `a73cb06d10`, `3d391fd297`, `2da97421a1`, `22e516b456`, `9f0da5c2b1`, `566576ea55`, `d7e26ed537` and `f1ce058ccd`.

## Work list

| Item | What | State |
|---|---|---|
| 8(a) | Current depth assessment of the 42 registered families at checkpoint `2026-09-11.2`, replacing the dated 39-family matrix | Done, and blind-reviewed (G-01 to G-08, one commit each). Totals: 335 PASS, 144 PARTIAL, 13 CONFLICT, 12 ABSENT, with 2,630 quotes verified exactly. Complete families: `goal.created`, `restore_point.deleted` and `run.started`. Jared's answers to its five cards are applied (DL-079 to DL-083; no grade changes). Waiting for review cycle 2. |
| 8(b) | Remaining source work: Replan Stop route; original capture for restore-point corruption; native v8 installation; consumer adoption; compaction depth currentness | Scoped in the assessment's 8(b) section. DL-080 makes the Replan v8 package needed for `goal_run.replanned`. The package work needs Jared's go, and a scoped plan is still owed to the coordinator. Compaction currentness is done. |
| 8(c) | Browser-created PARTIAL criteria after the SP-278 v2 companion (`22e516b456`) | Worktree `plans/ea-browser-created-v2-current-20260924` made and baselines run. Not edited yet. |
| 8(d) | `goal_run.certified` older owner anchors (GRS-084) | Done on `plans/ea-certified-anchors-20260924` (tip `57b54b5623`); review cycle 2 found it landing-ready. It is parked because it adds 132 rows above the landing check's print cap, and it lands after the exports repair, with the A-08 regeneration and the "above" -> "below" slip fixed. |
| 9 | J248 campaign: 252 rows | Batch 1 landed (`41fbecb612`, record `bc1d99c11e`). Count: 0 registered, 7 excluded, 0 carded, 245 remaining. Further batches follow the procedure record. |
| 10 prep | DL-077 validator amendment and admission records | On `plans/ea-validator-post-august-20260924`, uncommitted. It has to be rebased onto `main` with DL-077 and DL-078 and have its receipt regenerated. Its admission records must pin the final depth42 JSON, which is `ff7dbd59...` for now but may change after review cycle 2. Its own blind review follows. |

## Decision Log entries

- **DL-077 and DL-078**, Jared's answers to `EA-S10-VALIDATOR-LIVE-SET-001`. Landed on `main` at `8650c2f9e8`, with the Step 9 procedure record and its open questions.
- **DL-079 to DL-083**, Jared's answers to the five depth-grading cards. On `plans/ea-step08-depth42-20260924` (`78bb448ae6`), with the application record `step-08-depth42-card-answers-20260924.{md,json}`. DL-082 is a deferral, not an approval.
- **DL-078 clarification** (`f412acb581`). A registration landing regenerates the derived plan index only; the implementation-readiness gate report is left to the reseal. This is the coordinator's ruling on D-07, also recorded in the procedure record (`eef61d5dbf`).

## Landings

| Branch | `main` | Record | Landing check |
|---|---|---|---|
| `plans/ea-step09-card-answers-20260924` (Step 9 batch 1) | `41fbecb612` | `bc1d99c11e` | exit 0, nothing to report |
| `plans/ea-seal-check-decisions-20260924` (DL-077/DL-078) | `8650c2f9e8` | `ac9c0ad2e4` | exit 1: 50 new rows, all staleness on `Plans/Decision_Log.md` |

## Open items (running)

1. **Reseal request.** The coordinator's designated agent does one reseal for the whole wave. It covers:
   - the `Plans/Decision_Log.md` rows of the plan-sharding evidence bundle;
   - a currentness edition that includes `Plans/Decision_Log.md`. Until then `test_pm_pnc019_currentness` fails on `main` with one drift row, which is expected;
   - the run-002 `refresh-batch-hashes` and `refresh-final-summary` pair;
   - the implementation-readiness gate report;
   - the migration snapshot;
   - what the anchors branch and this branch add at their landings.
2. **Follow-up for whoever owns the worknode work (DL-082).** Jared wants the Platform capability catalog filled in right before Puppet Master is built, as part of the building process, likely as one of the worknodes. Worknode work has not started. Each entry needs owner-cited evidence, an evaluation contract and tests. Until then `platform.capability_evaluated` stays registered and dormant.
3. **Owner follow-ups from DL-079, DL-080, DL-081 and DL-083.** Listed in `step-08-depth42-card-answers-20260924.md`:
   - the three historical Goal contracts;
   - the three current `goal_run` contracts: stopped and blocked first, replanned after the Replan v8 work;
   - the verification-exception route contract;
   - the application-wide bucket in the SP-291 policy text.

   Those that edit `Plans/Goal_Runtime_System.md` or `Plans/storage-plan.md` wait for the exports repair.
4. **Procedure record open questions** D-05, D-02, D-08 and D-12 (D-07 is ruled). The DL-077 wording points (D-08, D-12) can ride with the next Decision Log edit.
5. **The certified registry anchors** still point at the old sections. Moving them changes the registry hash, so it should ride with the next registry revision that needs a checkpoint approval anyway (8(d) report).
6. **The compaction ledger row** stays `NEEDS_MORE_EVIDENCE` because the frozen disposition schema has no bucket for a registered J248 row. DL-077's admission records are the answer.
7. **Tooling notes.**
   - Running the independent validator rewrites its tracked receipt file, so run it only through `~/PM-Experiments/event-authority-step8-9-20260924/validator-amend/run_validator_harness.py`, or restore the receipt with `git checkout`.
   - `pm-event-authority-currentness.py validate` needs `PM_EVIDENCE_MAP` (`~/PM-Experiments/event-authority-step8-9-20260924/evidence-map.json`) when the currentness audit is symlinked.
   - Regenerate the plan index only with the ignored currentness edition present (symlinked).

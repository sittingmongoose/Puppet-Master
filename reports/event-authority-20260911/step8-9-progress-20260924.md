STATUS: last completed step: Step 9 batch 1 (card answers DL-074/DL-075 applied to 20 rows, branch plans/ea-step09-card-answers-20260924 at 10c3df084e, not landed). Also done: 8(d) (plans/ea-certified-anchors-20260924, a8c5ff6a39). In progress: 8(a) on plans/ea-step08-depth42-20260924.

# DL-039 Steps 8 and 9: progress, 2026-09-24

Opus agent under the coordinator's thread, continuing the DL-039 step list on Jared's authorization. This file is rewritten after every step; the STATUS line above always names the last completed step.

## Starting point

- Branch `plans/ea-step08-depth42-20260924`, based on `main` `f1ce058ccd`, inherited from the previous session with only its handover note (`20c90b124b`, `step-08-depth42-handover-20260924.md`).
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
| 8(a) | Current depth assessment of the 42 registered families at checkpoint `2026-09-11.2`, replacing the dated 39-family matrix | in progress |
| 8(b) | Remaining source work: Replan Stop route; original capture for restore-point corruption; native v8 installation; consumer adoption; compaction depth currentness | not started |
| 8(c) | Browser-created PARTIAL criteria after the SP-278 v2 companion (`22e516b456`) and `terminal.workgroup_moved` (`566576ea55`) | not started |
| 8(d) | `goal_run.certified` older owner anchors (GRS-084) | done on `plans/ea-certified-anchors-20260924` (`b7128bfeac` owner edit, `a8c5ff6a39` report); bounded owner edit, registry and checkpoint unchanged; waiting for review and the landing go |
| 9 | J248 campaign: 252 rows | batch 1 done on `plans/ea-step09-card-answers-20260924` (`10c3df084e`): DL-074 excludes `task.failed`; DL-075 settles retention for the 19 `runtime_artifact.*` rows, which return to technical work. Count now 0 registered, 7 excluded, 0 carded, 245 remaining. Ready for blind review. |

## Landings

None yet. The first landing waits for the coordinator's word that the reseal and its baseline re-record are on `main`.

## Open items (running)

1. Closed: `step-09-interaction-cards.md` says both of its former cards were approved and applied (DL-041, DL-042) and none is pending; `step-09-extensions-cards.md` says no card is justified. Neither holds a pending question.
3. **For Jared (card to be drafted):** the frozen independent validator fails `unexpected_august_set` for every family registered after August (compaction, the Browser pair, and every future Step 9 registration), so DL-039's seal condition "the independent validator passes without modification" cannot be met as written. The compaction ledger row also stays `NEEDS_MORE_EVIDENCE` because the frozen disposition schema has no bucket for a registered J248 row (Step 6 representation limit).
4. Running the independent validator rewrites its tracked receipt file; restore it with `git checkout` before committing.
5. `pm-event-authority-currentness.py validate` refuses the symlinked currentness audit unless `PM_EVIDENCE_MAP` names it; `~/PM-Experiments/event-authority-step8-9-20260924/evidence-map.json` does.
2. The certified registry anchors themselves still point at the old sections; moving them changes the registry hash, so it should ride with the next registry revision that needs a checkpoint approval anyway (8(d) report).

## Commits on this branch

| Commit | What |
|---|---|
| `20c90b124b` | Previous session's handover note |

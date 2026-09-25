STATUS: last completed step: the DL-077 validator amendment landed (`main` `2b73d6b7c0`, pushed 00:24:37Z, record `a7869662e7`), with the validator at `190a86f2...`, the receipt at `dceb7f21...` and the three admission records pinned to assessment `ba9b84f9...`. Landed on `main` before it: Step 9 batch 1 (`41fbecb612`), DL-077 and DL-078 (`8650c2f9e8`), the 8(a) depth assessment with DL-079 to DL-083 (`3ce6eb882c`) and the Step 8 remaining-work plan (`b359936728`). Withdrawn: the compaction PM7 validator branch, because the packet-canon-closure thread already carries a stricter fix of the same hunks (`96ab84f13c`). Next: the Browser pair SP-286 repair round (review cycle 1 found 0 blocking and asks for S-02 to S-10), then its cycle 2; the Browser-created v2-current branch is rebased onto the repaired SP-286 tip after that cycle passes and waits for the exports repair to land. Parked until the exports repair: the 8(d) anchors. Then Step 9 batch 2.

# DL-039 Steps 8 and 9: progress, 2026-09-24

Opus agent under the coordinator's thread, continuing the DL-039 step list on Jared's authorization. This file is rewritten after every step; the STATUS line above always names the last completed step.

## Starting point

- Branch `plans/ea-step08-depth42-20260924`, inherited from the previous session with only its handover note (`20c90b124b`, `step-08-depth42-handover-20260924.md`). It was based on `main` `f1ce058ccd`, rebased onto `ac9c0ad2e4`, and landed at `3ce6eb882c`.
- Handover evidence in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-depth42-handover-20260924/`, verified against the note before use:

| File | SHA-256 | Check |
|---|---|---|
| `depth_currentness.py` | `6a6b213a11b6be44f92056f0eea014f6de40b7c7df9edcbc22817745e4b6c7bc` | matches |
| `depth_currentness.json` | `50a794f9532c22bd945d8574b15afad18f9ee9086ad515f85e037b1339381b56` | matches |
| `depth_currentness2.json` | `4d19bc83b11638fd25960db9d40412b96d85940db1c5f79eb9671f85105a17f0` | matches |

- Orientation read on `origin/main` `f1ce058ccd`:
  - DL-039, both prose and PlanUnit;
  - DL-045 to DL-047 and DL-068 to DL-076;
  - `NEXT_STEPS_20260910.md` (both copies SHA-256 `85dde9aaaef7c1834fe6df3a5ad5ffed2f383bd0c1cfddf32b0985d789d150e1`);
  - `takeover-20260923.md`;
  - the landing records for `a73cb06d10`, `3d391fd297`, `2da97421a1`, `22e516b456`, `9f0da5c2b1`, `566576ea55`, `d7e26ed537` and `f1ce058ccd`.

## Work list

| Item | What | State |
|---|---|---|
| 8(a) | Current depth assessment of the 42 registered families at checkpoint `2026-09-11.2` | Landed at `3ce6eb882c`, after a two-cycle blind review and a DL-066 repair round. Assessment SHA-256 `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd`. Totals: 335 PASS, 144 PARTIAL, 13 CONFLICT, 12 ABSENT. Jared's five answers are applied (DL-079 to DL-083). |
| 8(b) | Remaining source work: the Replan v8 package; original capture for restore-point corruption | Plan written (part 2 of the remaining-work plan). Recommendation: compile Group A (Replan v8) after the exports repair, and hold Group B until its missing roles have sources. The package work needs Jared's go. |
| 8(c) | Browser-created and Browser-reset PARTIAL cells | First half, `plans/ea-browser-pair-sp286-20260924` (`2df56dd8a9`): both producers adopt SP-286/CV-339 by name. Review cycle 1 returned fix-then-land with 0 blocking findings; the repairs S-02 to S-10 are applied one commit each after a rebase onto `main`, then cycle 2. It is Section 15 only. Second half, `plans/ea-browser-created-v2-current-20260924` (`05daf756bc`, built on the first half): the Browser-created storage row, admission binding and validators move to the v2 checkpoint, with report `step-08-browser-created-v2-current-20260925.md`. It also edits SMPFS-167, so its review waits until the first half passes cycle 2; it is then rebased onto the repaired tip and reviewed. It lands after the first half and after the exports repair (it edits `Plans/storage-plan.md` and the sharded storage value registry). |
| 8(c'), compaction | `context.compaction.completed`'s oracle cell | Withdrawn on 2026-09-25 on the coordinator's routing. Its blind review (`~/PM-Experiments/review-ea-compaction-pm7-20260924/`, 2 blocking) found that the packet-canon-closure thread already carries a stricter fix of the same hunks: `96ab84f13c`, on `origin/fix/named-plan-identity-joins-20260924` and `origin/fix/packet-canon-repairs-20260924`, which pins revision, scope and `schema_ref`, with `validate()`-level tests and an independent review. Ours compared only `family_id` and `payload_schema_id`, and whichever fix landed second would conflict in both files, so theirs stands. Our branch is deleted on `origin` (GitHub and the NAS) and its worktree removed; the local ref stays at `a3f68cbaf0`, and its report never landed. The fix is carried by `96ab84f13c`. The oracle cell moves only through a regrade. The authority reading for any PM7 validator edit is ATS-040 (`Plans/Automated_Testing_System.md` line 3701), not DL-040. |
| 8(d) | `goal_run.certified` older owner anchors | `plans/ea-certified-anchors-20260924` (`57b54b5623`) is landing-ready. It is parked until the exports repair: 132 rows over the print cap. |
| 9 | J248 campaign: 252 rows | Batch 1 landed (`41fbecb612`). Count: 0 registered, 7 excluded, 0 carded, 245 remaining. The remaining rows are all TECHNICAL_BLOCKED and need full contracts. Batch 2 is the largest owner group, the 40 rows owned by `Plans/orchestrator-subagent-integration.md`, and its evidence map is being built. The coordinator put it after the amendment and the compaction fix: the amendment has landed and our compaction fix is withdrawn, so batch 2 follows the SP-286 repair round unless the coordinator says otherwise. |
| 10 prep | DL-077 validator amendment and admission records | Landed at `2b73d6b7c0` (record `a7869662e7`) after a two-cycle blind review (V-01 to V-11). Validator `190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20` (CRLF, 1,754 lines), receipt `dceb7f21436cbe126c23822e62caa1b6dedcb45fefae3005c1804576ca34d827`, records pinned to assessment `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd`. All three records fail closed on their non-passing criteria, as they should until those cells pass. The seal is not applied (DL-077 bars this task). |

## Decision Log entries

- **DL-077 and DL-078.** Jared's answers to `EA-S10-VALIDATOR-LIVE-SET-001`, landed at `8650c2f9e8`.
- **DL-079 to DL-083.** Jared's answers to the five depth-grading cards, landed at `3ce6eb882c`. DL-082 is a deferral, not an approval. DL-083 covers the three Storage families only: the card Jared answered did not name Platform.
- **The DL-078 clarification.** The coordinator's ruling on D-07: a registration landing regenerates the derived plan index only. Landed with depth42.

## Landings

| Branch | `main` | Record | Landing check |
|---|---|---|---|
| `plans/ea-step09-card-answers-20260924` (Step 9 batch 1) | `41fbecb612` | `bc1d99c11e` | exit 0 |
| `plans/ea-seal-check-decisions-20260924` (DL-077 and DL-078) | `8650c2f9e8` | `ac9c0ad2e4` | exit 1: 50 staleness rows on `Plans/Decision_Log.md` |
| `plans/ea-step08-depth42-20260924` (8(a) and DL-079 to DL-083) | `3ce6eb882c` | `38b8c1301d` | exit 1: 50 staleness rows on `Plans/Decision_Log.md` |
| `plans/ea-step08-remaining-plan-20260924` (the Step 8 remaining-work plan) | `b359936728` | `2cdd280768` | exit 1: `main`'s Decision Log staleness only |
| `plans/ea-validator-post-august-20260924` (the DL-077 amendment) | `2b73d6b7c0` | `a7869662e7` | exit 1: `main`'s Decision Log staleness only |

## Open items (running)

1. **Reseal request.** The coordinator's designated agent does one reseal for the whole wave. It covers:
   - the `Plans/Decision_Log.md` rows of the plan-sharding evidence bundle;
   - a currentness edition that includes `Plans/Decision_Log.md`; until then `test_pm_pnc019_currentness` fails on `main` with one drift row;
   - the run-002 pair;
   - the implementation-readiness gate report;
   - the migration snapshot;
   - whatever the anchors and later landings add.
2. **Worknode follow-up (DL-082).** The Platform capability catalog is filled in right before Puppet Master is built, as part of the building process, likely as a worknode. This is for whoever owns the worknode work.
3. **DL-083 for Platform.** The application-scoped evaluations of `platform.capability_evaluated` sit on the same seam but were not on the card. The coordinator is asking Jared; an answer would be recorded as an addendum.
4. **Owner follow-ups from DL-079, DL-080, DL-081 and DL-083.** They are listed in `step-08-depth42-card-answers-20260924.md`. Those that edit `Plans/Goal_Runtime_System.md` or `Plans/storage-plan.md` wait for the exports repair.
5. **Procedure record open questions.** D-05, D-02, D-08, D-12 and question 7 (DL-078's clarified wording). The application record's line 40 wording note (the depth42 re-check) is still open.
6. **`.gitignore` line (review V-09).** `tests/test_event_authority_holding_bucket.py` is tracked but not named in `.gitignore`. The coordinator is asking Jared for the line.
   - **Three mutation survivors (amendment review, cycle 2).** No test fails under M9 (the `depth_blocking` entry), M16 (the `..` path check) or M17 (the redundant DL-077 token check). They are recorded in the landing record as low-value; no fix is planned.
7. **Standing rules from the coordinator (2026-09-24).**
   - A card file is frozen at the bytes Jared sees, and its hash is recorded at presentation. A later change to what a card covers is a new card or an addendum, never an edit to the presented file.
   - An evidence directory is never rewritten: a re-run writes a new dated subdirectory.
   - The amendment's pin rule (V-07): any later change to a pinned registry row, the DL-040, DL-046 or DL-077 section, the depth assessment or the receipt re-pins the affected admission records in the same landing. Every Step 9 registration landing under DL-078 adds its family's record in that landing.
   - Currentness is per family (V-10): a record's assessment row is current when its `family_id` and `family_revision` equal the live registry row.
8. **Compaction follow-ups for Jared, for the packet-canon-closure thread** (our compaction review's extra points, `~/PM-Experiments/review-ea-compaction-pm7-20260924/`):
   - **C-04.** A legacy-alias guard, so that an alias mapping `context.compaction.started` or `context.compaction.failed` onto the admitted row fails the PM7 validator.
   - **C-05.** The ATS-037 checker expectation and the fixture `tests/fixtures/pm7_shared/assistant_context_continuity.json` still require zero events for a Compact Now that changes the ring revision (`open_drawer_compact_now_zero_events` under must, `context.compaction.completed` under must_not), contradicting DL-040 and ATS-040. This is ATS-037 owner work, and it may keep the compaction oracle cell PARTIAL even after the fix.
9. **The certified registry anchors** still point at the old sections. Moving them changes the registry hash, so the move should ride with the next registry revision that needs approval anyway.
10. **Tooling notes.**
   - Run the independent validator only through `~/PM-Experiments/event-authority-step8-9-20260924/validator-amend/run_validator_harness.py`, or restore its tracked receipt afterwards.
   - `pm-event-authority-currentness.py validate` needs `PM_EVIDENCE_MAP` when the currentness audit is symlinked.
   - Regenerate the plan index only with the ignored currentness edition present, never hand-merged.

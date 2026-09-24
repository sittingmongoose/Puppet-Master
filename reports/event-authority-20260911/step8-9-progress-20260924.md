STATUS: last completed step: the Step 8 remaining-work plan (`step-08-remaining-source-work-plan-20260924.md`, 8(b) and the second half of 8(c)). Landed on `main`: Step 9 batch 1 (`41fbecb612`), DL-077 and DL-078 (`8650c2f9e8`), and the 8(a) depth assessment with DL-079 to DL-083 (`3ce6eb882c`, record `38b8c1301d`). In review: the validator amendment (cycle 2), the Browser pair SP-286 adoption, and the PM7 GUI validator fix for compaction. Parked until the landing-check exports repair: the 8(d) anchors.

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
| 8(c) | Browser-created and Browser-reset PARTIAL cells | First half, `plans/ea-browser-pair-sp286-20260924` (`2df56dd8a9`, in review): both producers adopt SP-286/CV-339 by name. It is Section 15 only, so it lands without the exports repair. Second half: making the v2 checkpoint current is scoped in part 1 of the plan. It needs the coordinator's go and the exports repair. |
| 8(c'), compaction | `context.compaction.completed`'s oracle cell | `fix/ea-compaction-pm7-validator-20260924` (`a3f68cbaf0`, in review): the PM7 GUI fixture validator accepts the admitted family, which also clears three pre-existing gate failures. |
| 8(d) | `goal_run.certified` older owner anchors | `plans/ea-certified-anchors-20260924` (`57b54b5623`) is landing-ready. It is parked until the exports repair: 132 rows over the print cap. |
| 9 | J248 campaign: 252 rows | Batch 1 landed (`41fbecb612`). Count: 0 registered, 7 excluded, 0 carded, 245 remaining. The remaining rows are all TECHNICAL_BLOCKED and need full contracts. Batch 2 waits for direction. |
| 10 prep | DL-077 validator amendment and admission records | `plans/ea-validator-post-august-20260924` at `c3d5193d98`, rebased onto `38b8c1301d`. Review findings V-01 to V-11 are applied one commit each, with the validator at `190a86f2...` and the receipt at `dceb7f21...`. The records pin assessment `ba9b84f9...` and the receipt. Waiting for review cycle 2; this task lands it (the receipt pins `lander_task`). |

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
7. **Standing rules from the coordinator (2026-09-24).**
   - A card file is frozen at the bytes Jared sees, and its hash is recorded at presentation. A later change to what a card covers is a new card or an addendum, never an edit to the presented file.
   - An evidence directory is never rewritten: a re-run writes a new dated subdirectory.
8. **The certified registry anchors** still point at the old sections. Moving them changes the registry hash, so the move should ride with the next registry revision that needs approval anyway.
9. **Tooling notes.**
   - Run the independent validator only through `~/PM-Experiments/event-authority-step8-9-20260924/validator-amend/run_validator_harness.py`, or restore its tracked receipt afterwards.
   - `pm-event-authority-currentness.py validate` needs `PM_EVIDENCE_MAP` when the currentness audit is symlinked.
   - Regenerate the plan index only with the ignored currentness edition present, never hand-merged.

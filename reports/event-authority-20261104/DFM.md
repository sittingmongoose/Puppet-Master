# DFM — sweep part 1: B4 repaired; part 2 remains open

Branch `plans/ea-w2-filemanager-20261104`; tested implementation `acbb0d2a4aedce8d015b3f31a9748608c8d5dccb`. Incoming reviewed head `68fe8e3479b376d0165a67c18eded0b9e02d7d15`; rebase base `origin/main` at `d5ec2f70c0`. **NOT_READY: shared part-2 work and its reviews remain required.** Membership is ABSENT, event-history retention is PARTIAL / PENDING_RETENTION_DECISION, native execution and native filesystem-alias authentication are NOT_RUN.

## Sweep part 1: findings and responses

- **Cycle-8 B4 — fixed (`acbb0d2a4aedce8d015b3f31a9748608c8d5dccb`).** Where: `Plans/event_record.schema.json:40`, `scripts/pm-filemanager-event-contracts.py:1196`, and `scripts/pm-implementation-readiness.py:793`. Why: removing `schema_id.type` changed the exact bytes pinned by the goal realm, and the DFM family filter hid its 28 unresolved references. Fix: restore the complete original file, SHA-256 `bda87b247d841e058758136731734e515ae947f2261b5f90370015603d3bd353`, and enforce every aggregate registry failure. The removal existed only for redundant assertion accounting; no DFM schema/resource replacement is needed. The two existing goal-realm pins and their owner contracts are unchanged.
- **B4's filtered count diagnostics — fixed in the same commit.** Where: `scripts/pm-implementation-readiness.py:795`. The lane already has exactly two SP-560 companion values, both materialized and later_gui_or_feature_projection. Strict expected counts now match them: families 344 → 346, materialized 320 → 322, later tier 273 → 275. No row is added by this sweep, no check is bypassed, and no Event registry membership is changed. Before: 31 failures (28 reference failures plus these three stale count expectations). After: zero aggregate registry-data failures. The readiness self-tests pass, including census-drift refusal cases.
- **B4 regression — fixed in the same commit.** Where: `scripts/pm-filemanager-registry-regression.py:19`. Verify with `python3 scripts/pm-filemanager-registry-regression.py` in a Python environment containing `blake3` and `jsonschema`. The unchanged full family checker accepts its valid control (1,134 cases). An in-memory byte substitution removes only the original `schema_id.type` line, restoring the exact bad hash `8a744b68f3bb1c1c4235c060fdbf7d906ddbcd5edf47eb7f40dae0d14cdfbf2b`. The actual resolver emits exactly 28 goal_cancel_progress reference failures, and the full checker refuses all 28. Restoration gives zero failures. Resource pins and registry rows stay fixed; every instance validator remains enabled.
- **Restored-schema diagnostic fixtures — fixed in the same commit.** Where: `Plans/filemanager_event_contract_fixtures.json:37028` and the six corresponding wrong-type variants. Seven non-string schema_id fixtures now expect the restored schema's first `type` diagnostic. Their inputs and valid controls are preserved. Const/type assertion proof accounting remains part 2; the historical table is explicitly marked HISTORICAL_PART2_REQUIRED.
- **Astra 2 B1/B2/B3 — already fixed; reverified.** The existing settlement joins, represented-location relation and exact drain-domain/reader fences remain intact. The unmodified cycle-8 driver executes 478 control/refusal/removal/restoration witnesses with zero failures at this implementation. All twelve complete suites pass. No other non-number, non-proof blocker remains listed in cycle 8.
- **Deck-2 items — none assigned to DFM in this task.** No Decision Log answer is extended. The rebase includes the landed DL-400..452 answers. DL-045's existing scope and SP-310's exact hash-pinned reference rule are preserved; the current SP-560 rows still explicitly leave event-history retention pending.

## Family grades before and after

Before is the binding cycle-8 independent grade. Counts are PASS / PARTIAL / ABSENT. Q remains PARTIAL because part 2 is unfinished; B4 closure alone does not make a lane READY. The other 132 statuses retain their current support. The twelve F units and SP-560/CV-560/ATS-280 are byte-identical to the reviewed head; 324 current citations are rechecked and relocated in the self-grade.

| Family | Own unit | Before | After | Passing family cases |
|---|---|---|---|---:|
| file.copied | F-150 | 9 / 2 / 1 | 9 / 2 / 1 | 1134 |
| file.created | F-151 | 9 / 2 / 1 | 9 / 2 / 1 | 549 |
| file.deleted | F-152 | 9 / 2 / 1 | 9 / 2 / 1 | 540 |
| file.exported | F-153 | 9 / 2 / 1 | 9 / 2 / 1 | 554 |
| file.moved | F-154 | 9 / 2 / 1 | 9 / 2 / 1 | 557 |
| file.renamed | F-155 | 9 / 2 / 1 | 9 / 2 / 1 | 549 |
| folder.copied | F-156 | 9 / 2 / 1 | 9 / 2 / 1 | 562 |
| folder.created | F-157 | 9 / 2 / 1 | 9 / 2 / 1 | 548 |
| folder.deleted | F-158 | 9 / 2 / 1 | 9 / 2 / 1 | 555 |
| folder.exported | F-159 | 9 / 2 / 1 | 9 / 2 / 1 | 569 |
| folder.moved | F-160 | 9 / 2 / 1 | 9 / 2 / 1 | 569 |
| folder.renamed | F-161 | 9 / 2 / 1 | 9 / 2 / 1 | 560 |

**108 PASS / 24 PARTIAL / 12 ABSENT → 108 PASS / 24 PARTIAL / 12 ABSENT.** No admission or retention decision is claimed.

## Part 2 items

- **SWEEP-NUM:** `scripts/pm-filemanager-event-contracts.py:228`, `:275`, `:945`, identity `:981`/`:1001`, and historical entrypoints `:876`/`:911`. Adopt shared CV-1100/CV-1101 and SP-1100/SP-1101 plus the shared helper across producer digests, identity inputs and authenticated write-time recipe dispatch. Preserve Storage uint64, physical float bytes and signed zero. Add no lane-local cap or serializer. The prior 2**60 counterexample remains open; it is not retested or claimed repaired here.
- **SWEEP-12:** `scripts/pm-filemanager-event-contracts.py:80`, `Plans/event_payloads/file_manager/file_copied.schema.json:94` and each sibling's ts field; companion formats at `Plans/filemanager_operation_contracts.schema.json:185`, `:254`, `:730`. Enforce the owner's date-time grammar or an asserted available format checker. Cover zone/separator/calendar/LF/fraction/leap-second boundaries and supported authenticated history. No malformed-date repair or PASS is claimed here.
- **SWEEP-GUARD:** `reports/event-authority-20261104/DFM.guard-table.json`, existing lane proof drivers, and especially `Plans/event_record.schema.json#/properties/schema_id/type` / `#/properties/schema_id/const`. Adopt `scripts/pm_guard_isolation.py` and named guard tables after the shared tool passes. The seven restored non-string cases cannot use their old const-only removal witnesses. Their old table is retained as historical evidence, not restamped as current proof. No proof driver or guard-table refactor is implemented in part 1.
- **Review boundary:** Sol and Astra review after part 2, as SWEEP-P1 requires. This report does not downgrade an Astra NOT_READY.

## Verification and integration

| Check | Result |
|---|---|
| Full family checker, serial, all twelve | 12 exits 0; 7,246 cases = 468 positives + 6,778 negatives |
| B4 complete-checker byte regression | Exit 0; 28 bad references refused; restoration zero failures |
| Existing cycle-8 B1/B2/B3 driver | Exit 0; 478 witnesses, zero failures |
| Readiness self-tests | Exit 0; top-level pass, no failures |
| Shard generation / check | Exit 0 / 0; expected DFM owner/schema/registry groups only |
| Plan-index generation / validation | Exit 0 / 0; top-level pass, zero failures |
| Source citations / unchanged reviewed owner units | 324 exact citations / 15 identical units |
| git diff --check | Exit 0 |

The rebase resolved generated-artifact conflicts by deferring their bodies to regeneration; canonical owner text merged without conflict. Regeneration touches only the four DFM Markdown owner groups, restored EventRecord schema and Storage registry group. No unrelated owner is repaired. The first regeneration scope assertion misspelled the expected event_record.schema directory; inspecting the actual source/group mapping cleared that setup error before the checks continued. Currentness edition: 15 files copied from the prescribed shared edition and SHA-256 matched before index generation. Its index result is passing; node readiness still says blocked_runtime_certification_incomplete. No full governance/landing gate or standalone all-profile aggregate was run or claimed.

Initial disk availability was 499 GB; available memory 11 GiB at preflight. Recorded serial-check availability stayed at or above 13 GiB. No memory pause was needed. Heavy jobs ran one at a time. The two briefing memory files were absent from the prescribed Nas1 paths and were not found locally; no ID allocation depended on them because no IDs were minted.

## Scope, IDs and evidence

**IDs retained:** F-150–F-161, SP-560, CV-560, ATS-280. **New IDs / bindings / PlanUnits:** none. No canonical Markdown is changed by the part-1 fix itself; the four existing lane owner additions are preserved through rebase. No event registry append, admission, Decision Log edit, ignore edit, Spec Lock, auto-decision, frozen validator or governance reseal is performed. No pm-mail, subagent, main push, browser or server is used.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/sweep-p1/evidence-manifest.json`, SHA-256 `9ec703a0f62d37fa9329e7a6cf3b92301cdeda9b1c2d82c28238e82321413f69`. It pins the serial commands/results, exact source and currentness hashes, B4 before/after regression, unchanged owner units, fixture diagnostic list and reproduction helpers. The self-grade and historical guard table are report artifacts in this branch; publication copies and final head are pinned separately in publication.json. The worktree and temporary Python environment are removed after publication.

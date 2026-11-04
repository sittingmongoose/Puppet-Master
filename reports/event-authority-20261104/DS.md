# Lane DS (stream E, batch 1): clearing the frozen seal check's blockers

**Branch:** `plans/ea-b1-seal-blockers-20261104`, from `origin/main` `be4766513f`.
**Worktree:** Nas1 `~/pm-worktrees/ea-ds`, kept for the lead. Second pass (DS-P2): VM sparse worktree `~/pm-worktrees/DS-p2` from `600575221d`, removed after the push.
**Inputs:** `BRIEF-DRAFT.md`, `lanes/DS.md`, D1b's `BLOCKERS.md` and `DEPTH.jsonl`. Every D1b claim used here was re-checked on this branch.

## Second pass (DS-P2, VM, 2026-11-04)

The first pass left the frozen seal check at 4 failures. Three depth cells on the two August families remained, all technical work under DL-045. This pass took each in turn.

| Cell | Outcome | Commit |
|---|---|---|
| `workspace.layout_changed` producer | **PASS.** SP-400 writes the v2 slot and receipt schema that SP-330 required ("Home4", 4.0.0). | `2e5801d7df` |
| `workspace.layout_changed` oracles | **PASS.** The suite SP-273 pins is fixed against DL-076, re-frozen as v5 and repinned, with receipts. | `bef4342ecc` |
| `terminal.workgroup_moved` oracles | **Stopped** with an owner question (below). Nothing was written for it. | none |
| Both August rows re-graded | Receipted row update in the step-5 pattern: layout 12/12, terminal 11/12. | `af9bff39ae` |

**Frozen seal check.** The validator was unchanged (SHA-256 `190a86f2…`) and ran on scratch copies.
- **Before (`600575221d`):** 4 failures. The receipt equals the first pass's `43d1ab5555` receipt in every field but the time.
- **After (`af9bff39ae`):** 4 failures. `seal_prerequisites_met` stays false.

| Failure | Before (`600575221d`) | After (`af9bff39ae`) |
|---|---|---|
| `post_august_admission_incomplete` | the DL-300 three have no record | unchanged (waits on cards) |
| `unexpected_august_set` | DL-300 three + the August pair | unchanged: it lists every live family that is neither Known37 nor admitted, whatever its depth |
| `registered_contract_depth_incomplete` | 2: layout (producer, oracles), terminal (oracles) | **1: terminal (oracles)** |
| `fresh_census_denominator_not_closed` | present | present (its `blocked_by` strings are fixed text) |

The count stays 4 because the remaining terminal cell keeps `registered_contract_depth_incomplete` open. The other three failures do not depend on these cells.

### Cell 1: layout producer (SP-400, newly authored owner contract under DL-045)

**Premise check.** SP-330: "The successor slot and receipt schema for v2 writes is not written in this addendum: it must reference `pm.home_workspace_layout.v2` and the CV-361 payload by `$ref` … until it exists no native v2 writer is admitted through those families". SP-273's 2026-10-09 amendment calls it "an open item of SP-330". Both are still current. The registry admits only 2.0.0 appends. The family is one of DL-045's 285 names.

**Search first.** Every `Plans/`, `scripts/` and `tests/` file naming the v2 record, the 2.0.0 payload, the two families or the capture and core codec ids was read (`reports/event-authority-20261104/ds-p2-home4-binding-search.txt`).
- No slot, receipt or capture definition is typed for the v2 record or the 2.0.0 payload.
- No MessagePack capture or core codec id exists.

**What was written:**
- **`Plans/home_layout_v2_slot_receipt.schema.json`.** It references the v2 record and CV-361 by `$ref`. It reuses by `$ref` every Home3 member that is not typed for v1 layouts or the 1.1.0 payload, and replaces only these:
  - the two layouts;
  - event semantics: a 2.0.0 payload, never `migrated_from_v1`, never a null command;
  - `command_id` in the binding and the owner result: the CV-361 set; the owner result moves to 2.0.0;
  - the v2 readback key;
  - the encodings DL-270 retires: binary source bytes, or a BLAKE3 payload reference above 16 KiB, and new canonical MessagePack ids for capture and migration core.
- **Fixtures.** `Plans/home_layout_v2_slot_receipt_fixtures.json` has 5 valid values, 12 schema negatives and 14 joined-value negatives. Each negative was checked to fail for its stated reason.
- **Checker.** `scripts/pm_home_layout_v2_slot_receipt.py` checks the fixtures against the schema and invariants I1–I9; rc 0, pass.
- **Owner text in `Plans/storage-plan.md`:**
  - the SP-400 section and unit;
  - dated amendments in SP-330's transaction paragraph and in SP-273's prose and canonical text.

**What it does not change.** No registry row, family, key, retention policy or hold. The storage registry rows keep naming Home3 until the 4.0.0 edges are registered with their installation, as SP-400 says.

**Newly authored names:**
- schema and slot-producer version `4.0.0` of the existing families;
- owner result `pm.home_layout_owner_result.v1` at `2.0.0`;
- `home_content_free_capture_canonical_msgpack.v1`;
- `home_slot_migration_core_canonical_msgpack.v1`;
- the `layout_source_bytes` shape (`inline` / `payload_ref`).

### Cell 2: layout oracles (DL-076 re-freeze)

The suite at `~/PM-Experiments/event-authority-step08-workspace-layout-20260911` is a symlink into `/mnt/Cursor/archive/PM-Experiments/vm-archive-20260925/`, so it is on the share. v4 was left untouched, and `v5/` was made beside it.

**Proof the change is DL-076 only.** In a scratch copy, v4 first reproduced its own fixtures byte-identically.

**The proposed schema.** v5's proposed schema is byte-identical to canon's DL-076 correction (`fe46283fc5`). v4's copy was byte-identical to that commit's parent content.

**What v5 does:**
- `validate_v5.py` stores the nine-field durable token and joins each read's own live snapshot.
- Converted v2 bundles and synthetic history keep the durable token only.
- The v2 `generic_snapshot` defect moves to the live read.

**Result.**
- Stored `redb_snapshot_id`: 173 → 0. Proposed-schema occurrences: 6 → 0.
- Live-read occurrences (`proof`, `admitted_receipt_store`) are kept: they are live fences.
- All 48 relation, 22 history, 4 cleanup, 32 slot-migration and 12 cleanup-ordinary cases keep their ids, validity and counts. Three negative outcomes now name the DL-076 join.
- `freeze_v5.py` asserts all of this and wrote manifest `62823e0a62173cdd99bc41cc676e1aec9f4b5689122a51bc289ffb951aa70877` (53 members).
- A fresh scratch rerun reproduces every member.

**Repin.**
- `Plans/home_layout_event_contract_fixtures.json` `frozen_joined_subject` names v5. The old pin and the reason sit beside it in `refrozen`, as the Browser pin's reason sits beside its re-frozen value.
- SP-273 records the re-freeze.
- SP-273 also records that the full-value suite (`7ab4fb00…`, pinned by a 2026-09-11 report) stores no reader checkpoint in its own cases, and that its pre-DL-076 checkpoint copies are superseded by the corrected Home3 schema and v5.

That suite was **not** re-frozen. It is 193 MB and 3,658 files, with pinned-source checks against old canon. This is a judgement call a reviewer may reverse.

Receipts: `reports/event-authority-20261104/ds-p2-layout-suite-refreeze.{md,json}`.

### Cell 3: terminal oracles (stopped)

**What canon settles for a withdrawn family:**
- **Withdrawal refusal.** CV-361: "No producer writes terminal.workgroup_moved" (`Contracts_V0.md:23713`); Wiring Matrix: "No entry declares terminal.workgroup_moved" (`:7286`).
- **Historical readability.** "recorded events stay readable at 1.0.0" (CV-361); "the family keeps its registry row for history" (`:23774`).
- **No remint.** A move pending at upgrade "is never reminted" (CV-361).

**What canon leaves open:**
1. **Reader disclosure (two owner documents disagree).**
   - SMPFS-170 says the withdrawal admits "no new producer admission and no new reader disclosure" and "the passive reader admits no new disclosure" (`Section15_MVP_Promoted_Features_Spec.md:12413`, `:12604`).
   - SP-319's DL-181 amendment keeps "this passive reader … only to read 1.0.0 events already written" (`storage-plan.md:26912`).
   - SP-319's canonical text says no consumer operates (`:27073`).
2. **Live-behavior oracles for a feature that never ran.**
   - SP-319 still says "Paired static oracles and closed original/read-result companions remain required" (`:27090`), and "These are required paired oracles for the companion task" (`:27057`).
   - Those oracles are original-move checks: a positive "real-shaped changed move" with original result and append joins; negatives such as fifth-section admission, false rollback after possible append and lost-acknowledgement remint.
   - Writing them needs the original result/custody companion that SP-319 calls "separate unfinished work under SMPFS-170" (`:26991`–`:26992`). SMPFS-170 says no such operation was ever admitted.
   - The DL-181 amendment itself notes that one of these oracles "describes the retired cap of four sections" (`:26912`), but does not retire the list.

**The exact question (for a card; the first two options touch DL-045's reserved "conflict between two owner documents").** For `terminal.workgroup_moved`, withdrawn under SMPFS-170's rule with a producer that never activated, which oracle set does SP-319 require?
- **A.** Withdrawal and historical-readability oracles only. The reader is withdrawn and discloses nothing. SP-319's original-move oracles and both companions become lineage.
  - The withdrawal and readability oracles: any append is refused; a recorded 1.0.0 event validates by its own `payload_schema_id` and is never rewritten or aliased; SP-330's conversion never mints one; a terminal tab move is a `tab_moved`.
- **B.** A, plus the passive reader's closed read-result companion (`verified_historical` | `unresolved_historical_validation` | `unavailable`) and reader oracles. An authentic recorded event can only resolve to `unresolved_historical_validation`, because no operation was ever admitted. The original-move oracles and the original result/custody companion become lineage. This sides with SP-319 over SMPFS-170 on disclosure.
- **C.** Everything SP-319 lists, including the original result/custody companion and the original-move oracles, written for an operation that never existed.

Whichever is chosen, the A-part is needed. With an answer, the fixtures, checker and companion are a short follow-up, using ids from SMPFS-300–309 or SP-401–409.

### Premise checks (second pass)

| Answer or text | Today's text | Result |
|---|---|---|
| DL-045, authoring scope | `workspace.layout_changed` and `terminal.workgroup_moved` are both in its 285 names (first pass) | Holds |
| SP-330/SP-273, "not written … until it exists no native v2 writer is admitted" | Unchanged since 2026-10-09 | Holds; basis of SP-400 |
| DL-270 (SP-337, SP-339, SP-340), JSON/base64 retired for new stored writes | Current | Holds; SP-400 uses binary fields and new MessagePack ids |
| DL-076, stored token without `redb_snapshot_id` | Current; canonical schemas corrected 2026-09-24 | Holds; basis of v5 |
| DL-039 AUG-CP-WLC-001 / AUG-CP-TWM-001 | Unchanged | Holds; owner choices untouched |
| SMPFS-170 withdrawal vs SP-319 reader and oracle list | Disagree (above) | **Open; the terminal cell is stopped** |

### Checks (second pass, VM, exit codes)

| Check | Result |
|---|---|
| `pm-shard-plans.py --generate` / `--check` (after cells 1 and 2) | 0 / 0; only storage-plan shards changed |
| `pm-plan-index.py generate` / `validate` | 0 / 0, top-level `status: pass`; 7422 units (+SP-400) |
| `pm-plans-verify.py lint-path-refs`, `json-syntax`, `lint-contractrefs` | rc 1 on the sparse tree before and after, with the same 14 / 1 / 1 failures (absent `Concepts`, the raw-capture link, an old audit ref); no new failure |
| `pm-plans-verify.py lint-banned-phrases` | rc 0, pass |
| `pm-plans-verify.py validate-plan-graph` | rc 1, 1,438 failures, none naming SP-400 or the new files |
| `scripts/pm_home_layout_v2_slot_receipt.py` | rc 0: 5 positive, 12 schema-negative, 14 invariant-negative cases as declared |
| v5 suite: `check_slot_migration.py`, `validate_v5.py`, `check_slot_migration.py`, `freeze_v5.py`, fresh scratch rerun | rc 0 each; 0 manifest mismatches |
| `pm-validate-pm7-gui-fixtures.py validate` / `pm-plans-verify.py validate-pm7-gui-fixtures` | rc 0, pass / rc 0, pass (7 workspace-event valid fixtures) |
| `pm-projects-refresh-contracts.py` / `pm-shared-runtime-command-contracts.py validate` | rc 0 / rc 0 |
| `tests/test_pm_validate_pm7_gui_fixtures.py` | 13 OK |
| `tests/test_event_authority_holding_bucket.py` | 2 failures, the same two as the first pass and `main` |
| Frozen seal check, scratch copies, validator `190a86f2…` | rc 1 on both: 4 failures before, 4 after (depth sample 2 → 1) |

**Expected governance staleness for the reseal request:** the Spec Lock hash of `Plans/storage-plan.md` (again).

## Result (first pass)

The frozen seal check (`Plans/.audits/event-authority-2026-08-12/independent-validator/`, run unchanged on scratch copies) goes from **6 failures on `main` to 4 on this branch**. `seal_prerequisites_met` stays false.

| Failure | `main` `be4766513f` | This branch |
|---|---|---|
| `post_august_admission_incomplete` | 6 issues: DL-300 three have no record; compaction, created and reset `depth_incomplete` | 3 issues: only the DL-300 three (no record; card CC-D1b-1) |
| `unexpected_august_set` | 8 families | 5: the DL-300 three plus the two August families (it lists every live family that is neither Known37 nor admitted) |
| `individual_dispositions_evidence_gap_blocking` | compaction | **cleared** |
| `individual_dispositions_provisional` | 2 August rows | **cleared** |
| `registered_contract_depth_incomplete` | compaction (11 fields), terminal and layout (`consumers_checkpoints`, provisional) | terminal: `positive_negative_oracles`; layout: `producer`, `positive_negative_oracles` |
| `fresh_census_denominator_not_closed` | present | present (post-seal by the validator's own note; its `blocked_by` text is fixed strings) |

The `main` run's receipt equals `state/independent-validator-diagnostic-be4766513f.json` in every field but `generated_at_utc`.

**Why prerequisites are still not met:**
- **The DL-300 three.** They are untouched, as the lane says; they wait on cards CC-D1b-1 and CC-D1b-2.
- **The August pair (premise failure, step 5).** At today's text they are 10/12 (layout) and 11/12 (terminal), not 12/12. D1b's counterfactual D assumed the ledger's older PASS cells were still true; three of them are not.

## Commits

| # | Commit | Step | What |
|---|---|---|---|
| 1 | `d7e5840240` | 1 | ACD-461 admits `context.compaction.completed` in its Project edition only; the app counterpart emits no EventRecord until Event Authority admits an application payload version. Shards and index regenerated. |
| 2 | `f86b68e982` | 2 | SP-319's canonical text states that no consumer operates on `terminal.workgroup_moved`. Shards and index regenerated. |
| 3 | `62e4f832f0` | 8 (moved earlier) | Re-freeze of the shared Browser admission suite's `upstream40` pin. |
| 4 | `3b7dd7b9f2` | 3 | Fresh depth assessment `depth-b1-seal-families.json` and `.md`. |
| 5 | `66a93f80f3` | 4 | Three DL-077 admission records repointed to it. |
| 6 | `55f68a717e` | 5 | August ledger rows: consumers cited, provisional lifted, citations refreshed, three cells regraded. |
| 7 | `ade1ee3d6c` | 6 | Compaction's July ledger row: superseded note. |
| 8 | `43d1ab5555` | 7 | Exclusions: `dashboard.widget_added`, `coordination.debug_mirror_exported`. |
| 9 | (this report) | 8 | Branch report and self-grade. |

## The eight steps

### 1. Compaction scope (ACD-461)

The 2026-11-03 projects-refresh edit (`7a17526dc2`) wrote "`context.compaction.completed` has explicit original Project and newly admitted application editions". No application edition was ever admitted:

- **Registry row:** `project_only` with no `payload_versions` (`Plans/event_family_registry.json:2874-2917`).
- **SP-259's criterion:** "The sole new family uses project_only scope" (`Plans/storage-plan.md:19531`).
- **DL-300:** "This is the one Event Authority grant of the projects and settings refresh". It gives app editions to eleven Goal families, not this one (`Plans/Decision_Log.md:21055`).
- **CV-366:** "Unknown/missing source, version or family is unavailable/quarantined; a registry or all-true fixture boolean cannot admit native writes". Its event-selection table has no compaction row.

**What changed.** The identity-and-scope paragraph and the canonical text now say three things:
- the family is admitted in its original Project edition only;
- the app counterpart (CV-329, CV-366 `CompactionCompletionApplicationV1`, SP-259) "emits no `context.compaction.completed` EventRecord until Event Authority admits an application payload version of this family";
- the app sibling's replay applies "once that application version is admitted".

`source_lineage` gains DL-300.

**What stays exact.** The Project edition, every binding, and the app counterpart's rules. Nothing is decided about the app thread's compaction operation itself.

**Checks.**
- `pm-plan-index.py generate` rc 0 and `validate` pass; the shard check passes.
- Only ACD files were regenerated.
- `pm-projects-refresh-contracts.py` rc 0 on `main` and on the branch.

### 2. Terminal operating consumer (SP-319)

One sentence was added to SP-319's canonical text:

> "No consumer operates on terminal.workgroup_moved, because its producer never activated and no operation was ever admitted (SMPFS-170's withdrawal rule, applied by DL-181; CV-361); terminal.workgroup_move_history_read.v1@1.0.0 survives only in SMPFS-170's lineage text, and this reader stays only for a 1.0.0 event already recorded, if any."

**Sources.**
- SMPFS-170, superseded: "the producer terminal.workgroup_move_commit.v1 never activates and the passive reader admits no new disclosure; no operation was ever admitted" (`Plans/Section15_MVP_Promoted_Features_Spec.md:12601-12603`).
- CV-361: "No producer writes terminal.workgroup_moved" (`Plans/Contracts_V0.md:23713`).
- SP-319's own 2026-10-09 amendment (`Plans/storage-plan.md:26903`).

I chose the "none operates" form over naming a retained consumer. Naming one would have revived a definition that exists only in superseded lineage text. Nothing was invented.

**A YAML slip, fixed before commit.** The first draft put `: ` inside SP-319's plain-scalar `canonical_text`. `generate` then reported a parse error and 7420 units. The fixed text gives 7421 units, rc 0, and `validate` passes.

### 3. Fresh depth assessment

Files: `reports/event-authority-20261104/depth-b1-seal-families.json` (SHA-256 `4100651156a977284fcf73aca33cede5b4477aef6943d098bd316a004f1a4050`) and `.md`.

**How it was graded.** At `62e4f832f0`, in the 2026-09-24 row format, on the unchanged Step 8 rubric.

**Result.** All 36 cells are PASS with `Plans/` evidence: 31 carried and 5 upgraded. The upgrades are compaction oracles (`64d4567f12`), created producer, consumers and oracles (`a3d6bb616b`, `0ba3ac9019`), and reset producer (`a3d6bb616b`).
- **Compaction scope.** PASS again only because of step 1.
- **Evidence.** 191 items, each an exact single-line quote located by script and hashed like `compile_depth42.py`.

**Static checks at that head:**
- PM7 GUI checker: pass, one compaction family.
- Shared-runtime command contracts, `validate-pm7-gui-fixtures` and JSON syntax: pass. With the PM7 checker and plan-index validate, that is ATS-040's whole required set.
- `pm_browser_workspace_created.py` and `_v2.py` (PASS, 3 positives), `pm_browser_workspace_reset.py`, `pm-browser-event-admission.py`: pass.
- Test suites: PM7 GUI 13 OK, created 65 OK, reset 53 OK, shared admission 38 OK.

### 4. Admission records repointed

`reports/event-authority-20260911/admission-records/{context.compaction.completed,browser.workspace.created,browser.workspace.reset}.json`: only `depth_assessment.path` and `.sha256` change. The script asserts that no other key differs.

**Seal check effect:**
- `post_august_admitted` goes from 1 to 4;
- `individual_dispositions_evidence_gap_blocking` clears;
- compaction leaves the depth sample.

### 5. August ledger rows (deviation: see below)

A receipted row update of the two rows. Records: `ds-step5-august-ledger-application.json` (before and after hashes) and `.md`.

**What changed:**
- `consumers_checkpoints` is PASS, cited from the Plans:
  - **layout:** SP-273's reader/projector `home.workspace_layout_event_reader.v1@1.0.0`, its three 1.0.0 consumers, and checkpoint `home_layout_event_reader_checkpoint.v1:…` with CAS, rebuild and the SP-278 nine-field token;
  - **terminal:** SP-319's reader, no projector, `none_required`, and the step-2 sentence.
- Every citation is re-anchored to exact quotes at `66a93f80f3`.
- `provisional` is false, and the census lines follow.
- `AUG-CP-*` choices, dispositions, buckets and pins are unchanged.

**Line endings.** The ledgers have mixed CRLF/LF endings. My first write normalised them; I restored the files and rewrote preserving each line's ending. Exactly 2 lines change in each ledger.

### 6. Compaction's ledger row

Records: `ds-step6-compaction-ledger-note.json` and `.md`.

**What the note says:**
- the family was registered in Step 6 (`b240dd93e2`);
- the production wiring is repaired (`Plans/Wiring_Matrix.production.json:18191`);
- the DL-077 admission record supersedes this row (`INDIVIDUAL_DISPOSITION_SCHEMA.md:44`).

The disposition `NEEDS_MORE_EVIDENCE` and the evidence cells are kept as the historical July record.

### 7. Exclusions

Records: `ds-step7-exclusions-application.json` and `.md`. Both rows become `RECLASSIFY_TO_EXCLUDED` on the individual row and the census line. Legacy bucket, category and pins are kept, and no denominator removal is claimed.

- **`dashboard.widget_added`.**
  - UCC-202: "No event named dashboard.widget_added is emitted." (`Plans/UI_Command_Catalog.md:16977`).
  - UCC's own DL-180 amendment (`:8589`), which amends the stale table cell at `:8586` on the next line.
  - `Plans/Wiring_Matrix.md:7286`.
- **`coordination.debug_mirror_exported`.**
  - SP-339 and DL-270 card 5: "the live mirror files it described are retired, so no new mirror export attempt is recorded" (`Plans/storage-plan.md:553`), and the event "end[s] with them" (`:570`).
  - An on-request `pm export` failure is reported in its result (`:572`).

**Checks.** The seal check's census counts, partition and exclusion revalidation still pass; `evidence_shape_ok` is true.

### 8. Seal check and the shared Browser suite

**Seal check.** See the Result table. Receipts:
- `drafts/DS/seal-main-be4766513f-receipt.json`
- `drafts/DS/seal-branch-head-43d1ab5555-receipt.json`

**Shared Browser suite.** `tests/test_pm_browser_event_admission.py` is editable (`.gitignore:70`, `!/tests/test_pm_browser_event_admission.py`).
- **Cause.** It failed 30 of 38 in `setUp` on a fingerprint of the 40 pre-Browser registry rows. That fingerprint was last true at `d86090abd9`. It was moved by DL-188's layout 2.0.0 row (`c0d688db9f`, `634412b3ac`) and DL-300's eleven Goal editions (`102a7e99e8`, `5375bfd2a7`).
- **Fix.** I re-froze only the pin to `2fe49c02…` and wrote the reason beside it.
- **Still guarded.** The following check is unchanged. On today's rows, `preexisting_preservation` reports no failures and `current_preexisting_rows_match_reviewed_successors` is true.
- **Result.** 38 OK.

## Deviations from the lane, with reasons

1. **The suite re-freeze (step 8) was committed before step 3.** SP-262, CV-332 and SMPFS-166 name that suite for both Browser families. Grading their oracle cells PASS while it failed 30 of 38 would have rested on D1b's reading that the family-specific units do not name it. Committing the re-freeze first means the assessment is graded on a head where every suite any owner unit names passes.
2. **Step 5 regrades three ledger cells instead of keeping them PASS.**
   - **What the lane asked.** Cite the consumers, refresh layout's citations to 2.0.0, and lift provisional. Counterfactual D shows the seal prerequisites met if the other eleven cells stay PASS.
   - **What today's text says.** Re-reading each cell, three PASS cells written against 1.0.0/1.1.0-era text are false today:
     - **layout `producer` → FAIL.** SP-330: "The successor slot and receipt schema for v2 writes is not written in this addendum … until it exists no native v2 writer is admitted through those families" (`Plans/storage-plan.md:27503`), and SP-273 calls it "an open item of SP-330" (`:21825`).
     - **layout `positive_negative_oracles` → UNKNOWN.** The external suite SP-273 pins (`Plans/home_layout_event_contract_fixtures.json:6`) was found on 2026-09-24 to store `redb_snapshot_id`, contradicting DL-076. It is not reachable from Nas1.
     - **terminal `positive_negative_oracles` → FAIL.** SP-319: "Paired static oracles and closed original/read-result companions remain required" (`:27081`); no fixture, checker or test exists.
   - **Why.** Keeping them PASS would have made the seal check read complete depth that canon does not support.
   - **Agreement.** The 2026-09-24 Step 8 assessment and D1b grade the same cells PARTIAL.
   - **If the lead prefers otherwise.** The alternative is to leave both rows untouched until the three cells are authored.

## Premise checks

| Answer | Today's text | Result |
|---|---|---|
| DL-039 AUG-CP-WLC-001: unknowns "until cited from the Plans" (`Decision_Log.md:413`) | Family now at 2.0.0 (DL-188); SP-273's reader and checkpoint carried to v2 writes by its amendment (`storage-plan.md:21825`) | **Holds** for lifting provisional. **Fails** for the lane's implicit premise that the other eleven cells stay PASS: producer and oracles are not PASS at 2.0.0. |
| DL-039 AUG-CP-TWM-001: "on the same terms" (`:414`) | Feature retired and family withdrawn by DL-181; historical-only | **Holds in its operative terms**: still registered, and consumer, projector and checkpoint now cited. **Premise shifted** from a live family to a withdrawn one; reported to the lead. The oracles cell is not PASS. |
| DL-039 COMPACT-001: wiring repair (`:410`) | Repaired (`Wiring_Matrix.production.json:18191`) | Holds; used in the step-6 note. |
| DL-300 as "the one Event Authority grant" (`:21055`) | Registry 2026-11-04.1; compaction row has no `payload_versions` | Holds; basis of step 1. |
| DL-180, the widget event withdrawn (UCC `:8589`) | UCC-202 current (`:16977`) | Holds; basis of the step-7 exclusion. |
| DL-270 card 5 / SP-339, mirror retired | `storage-plan.md:553`, `:570`, `:28363` current | Holds; basis of the step-7 exclusion. |
| DL-077, a recorded post-August admission supersedes the old row (`INDIVIDUAL_DISPOSITION_SCHEMA.md:44`) | Validator `V:1425-1428` unchanged | Holds; basis of steps 4 and 6. |
| DL-040, compaction bindings and retention (`:429-435`) | ACD-461, SP-259 and SIR-038 unchanged in those parts | Holds. |

## Newly authored bindings

**Second pass:** SP-400, the Home4 v2 slot and receipt contract, newly authored under DL-045 after the search in `ds-p2-home4-binding-search.txt`. Its new names are listed under "Cell 1" above. No consumer, projector, checkpoint, identity recipe or replay mechanic was authored; SP-273's are reused.

**First pass:** none. Step 1 restates the admission state that the registry, SP-259, DL-300 and CV-366 already give. Step 2 states, from existing text, that no consumer operates. No consumer, projector, checkpoint, identity recipe or replay mechanic was authored.

## Ids used

**SP-400** (second pass). It was checked against `Plans/storage-plan.md` on all 505 `origin` branches: SP-400–409 appear nowhere else. The first pass minted none. Unused: SP-401–409, ACD-600–609, SMPFS-300–309, CV-400–409, ATS-200–204.

## Checks run (exit codes)

| Check | Result |
|---|---|
| `pm-shard-plans.py --generate` / `--check` (after steps 1 and 2) | pass / pass |
| `pm-plan-index.py generate` | rc 0 (rc 1 on the first step-2 draft: YAML parse error, fixed before commit) |
| `pm-plan-index.py validate` (after steps 1 and 2) | rc 0, `status: pass` |
| `pm-projects-refresh-contracts.py` | rc 0 on `main` and on the branch |
| `pm-validate-pm7-gui-fixtures.py validate` | rc 0, pass |
| `pm-shared-runtime-command-contracts.py validate` | rc 0 |
| `pm-plans-verify.py validate-pm7-gui-fixtures` | rc 0, pass |
| JSON syntax, `Plans/**/*.json` | pass |
| `pm_browser_workspace_created.py`, `pm_browser_workspace_created_v2.py`, `pm_browser_workspace_reset.py`, `pm-browser-event-admission.py` | rc 0 each |
| `tests/test_pm_validate_pm7_gui_fixtures.py` | 13 OK |
| `tests/test_pm_browser_workspace_created.py` | 65 OK |
| `tests/test_pm_browser_workspace_reset.py` | 53 OK |
| `tests/test_pm_browser_event_admission.py` | 38 OK after re-freeze (30 of 38 failed before it) |
| `tests/test_pm_coordination_events.py` | 14 failures, same set as `main` |
| `tests/test_event_authority_holding_bucket.py` (after steps 2, 5 and 7) | 2 failures, same set as `main` |
| Frozen seal check, scratch copy, validator SHA-256 `190a86f2…` unchanged | rc 1 on both: 6 failures on `main`, 4 on the branch |

`pytest` is not installed on Nas1, so the suites ran under `unittest`.

**Not run:**
- `pm-landing-check.py`, `run-gates` and `audit-governance` are the lead's landing step.
- **Expected governance staleness for the reseal request:** Spec Lock hashes for `Plans/assistant-chat-design.md` and `Plans/storage-plan.md`. The touched audit ledgers carry no Spec Lock or `.evidence` pin.

## Open items

1. **The DL-300 three.** No admission record; they wait on CC-D1b-1 (before-state form) and CC-D1b-2 (DL-045 scope). Untouched here.
2. **Layout producer:** done in the second pass (SP-400, `2e5801d7df`). Native installation of the 4.0.0 edges is NOT_RUN.
3. **Layout oracles:** done in the second pass. The workspace suite was re-frozen as v5 and repinned (`bef4342ecc`). The full-value suite (`7ab4fb00…`) is **not** re-frozen; SP-273 records its stored-token copies as superseded. Re-freeze it if a reviewer prefers that to the note.
4. **Terminal oracles:** **stopped on the owner question** under "Cell 3" above. Nothing was written.
5. **Lead decisions.**
   - Whether to accept step 5's regrade, or revert to untouched rows until items 2–4 land.
   - How to treat the terminal premise shift (a withdrawn family's provisional state ended under DL-039).
6. **Two unrefreshed records.**
   - `individual-disposition/COVERAGE.json` (generated 2026-09-11) still says `provisional_count` 2. The Step 9 batch 1 precedent did not regenerate it either.
   - The validator's `fresh_census_denominator_not_closed.blocked_by` strings are fixed text and still name the cleared items.
7. **Two cleanups not done.** Rewording UCC's stale `:8586` effect cell, and sweeping the residual debug-mirror text in CV-310 and the coordination fixtures. Owner text already overrides both.
8. **Missing memory notes.** `pm-plan-id-allocation.md` and `pm-index-needs-currentness-edition.md` (named in the brief) do not exist on Nas1. The currentness edition was copied and hash-matched as the brief says.

## Files

- `reports/event-authority-20261104/DS.md`: this report.
- `reports/event-authority-20261104/DS.selfgrade.json`: self-grade of the five touched families at `af9bff39ae`: compaction, created, reset and layout 12/12, terminal 11/12 (59 PASS, 1 PARTIAL).
- `reports/event-authority-20261104/ds-p2-home4-binding-search.txt`, `ds-p2-layout-suite-refreeze.{md,json}`, `ds-p2-august-regrade-application.{md,json}` (second pass)
- `reports/event-authority-20261104/depth-b1-seal-families.{json,md}`
- `reports/event-authority-20261104/ds-step{5,6,7}-*.{json,md}`
- **Evidence copy:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS/`: this report, the self-grade, the seal-check receipts and the check outputs.

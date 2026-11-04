# Lane DS (stream E, batch 1): clearing the frozen seal check's blockers

**Branch:** `plans/ea-b1-seal-blockers-20261104`, from `origin/main` `be4766513f`.
**Worktree:** Nas1 `~/pm-worktrees/ea-ds`, kept for the lead.
**Inputs:** `BRIEF-DRAFT.md`, `lanes/DS.md`, D1b's `BLOCKERS.md` and `DEPTH.jsonl`. Every D1b claim used here was re-checked on this branch.

## Result

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

None. Step 1 restates the admission state that the registry, SP-259, DL-300 and CV-366 already give. Step 2 states, from existing text, that no consumer operates. No consumer, projector, checkpoint, identity recipe or replay mechanic was authored.

## Ids used

None. No PlanUnit was minted. The blocks SP-400–409, ACD-600–609, SMPFS-300–309, CV-400–409 and ATS-200–204 are unused.

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
2. **Layout producer (DL-045 authoring).** Author the v2 transaction-slot and operation-receipt schema in SP-330.
3. **Layout oracles.** Re-freeze and repin SP-273's external suites under the nine-field token. This needs the VM's `~/PM-Experiments/event-authority-step08-workspace-layout-20260911/`.
4. **Terminal oracles (DL-045 authoring).** Author SP-319's read-result companion and paired fixtures for the historical read.
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
- `reports/event-authority-20261104/DS.selfgrade.json`: self-grade of the five touched families: compaction, created and reset 12/12, layout 10/12, terminal 11/12.
- `reports/event-authority-20261104/depth-b1-seal-families.{json,md}`
- `reports/event-authority-20261104/ds-step{5,6,7}-*.{json,md}`
- **Evidence copy:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS/`: this report, the self-grade, the seal-check receipts and the check outputs.

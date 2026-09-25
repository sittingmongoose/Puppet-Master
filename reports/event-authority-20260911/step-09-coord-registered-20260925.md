# Step 9: the first registration, `coordination.agent_registered`, 2026-09-25

Branch `plans/ea-s09-coord-registered-20260925`, cut from `origin/main` `63cf2cb97f`: the coordination preparation landing (`main` `4a2135b940`) and its landing record. `origin/main` has not moved since. The branch is pushed and not landed.

It registers one family, `coordination.agent_registered`. This is the first of the seven coordination families and the first Step 9 registration. What the branch does:
- It appends the prepared registry row unchanged, which moves the registry to revision `2026-09-25.1` with 43 families.
- It moves the approved PNC-019 checkpoint with the registry, under DL-078.
- DL-094 records the registration.
- The family's DL-077 admission record pins four things: DL-094, the registry before and after, the row, and a depth assessment in which all twelve criteria pass.
- The family's J248 row cites that record, in R6 form R.

**Status.** Every step of the admission is written and pushed:
- The family's independent re-grade passes twelve of twelve criteria.
- The seal check, run only through the scratch harness, accepts the family through its complete record and reports no new failure.

Still to come before landing:
- This admission's own blind form-driven review, within DL-066's bound.
- The coordinator's landing go.
- The landing check in the shared checkout, under the landing lock.
- The landing record.

**Step 9 count after this landing, of 252:** 1 registered, 15 excluded, 0 carded and 236 remaining.

## 1. What changes

| Step | Commit | Paths | What |
|---|---|---|---|
| Prep residual R4-01 (should fix) | `9d8df6ec3e` | `Plans/Contracts_V0.md`, `Plans/Automated_Testing_System.md`, the payload and projection schemas, `Plans/storage_value_registry.json`, the ledger, fixtures, checker, tests | `platform` admits hyphens (section 2) |
| Prep residual R4-02 (note) | `b9b93aaa9d` | `scripts/pm-browser-event-admission.py`, test | The Browser gate pins each coordination family ID |
| Prep residual R4-03 (note) | `d9cb51c809` | `Plans/storage-plan.md`, checker, test | A home, drive or UNC `path_ref` result produces no claim |
| Prep residual R4-04 (note) | `0fad478e03` | `scripts/pm-implementation-readiness.py`, test | Readiness pins each keyed composition's key shapes |
| Oracle fix, host ruling (a) | `19a89fdc18` | `Plans/storage-plan.md`, checker, fixtures, ledger, test | SP-320's precedence for a repeated registration (section 3) |
| Oracle fix, host ruling (b) | `432834165b` | fixtures, ledger, `Plans/Automated_Testing_System.md`, test | Both repeat-registration rows get a sequence |
| Oracle fix, host ruling (b) | `18ab615917` | fixtures, ledger, `Plans/Automated_Testing_System.md`, checker, test | Each family gets EventRecord join cases of its own |
| Registry part | `3abdf9fe3f` | `Plans/event_family_registry.json`, `Plans/coordination_event_admission.json`, `scripts/pm_pnc019_currentness.py`, the two pinned tests | The append, the new revision, the ledger flip and the DL-078 pins (section 5) |
| Depth assessment | `2f5e164655` | `reports/event-authority-20260911/step-09-depth-coordination.agent_registered.json` | The independent re-grade, copied byte-identically |
| Decision entry | `b69811a76b` | `Plans/Decision_Log.md` | DL-094, the prose entry and its PlanUnit |
| Admission record | `5c4c7c217c` | `reports/event-authority-20260911/admission-records/coordination.agent_registered.json` | The DL-077 record |
| J248 row | `9c97cb14fd` | the row file and both ledgers under `Plans/.audits/event-authority-2026-08-12/`, the application record, the procedure record | Form R (section 4) and the Step 9 count |
| Branch report | this commit | this file | |
| Derived | with each Plans edit | `Plans/_shards/` (Automated Testing 40, Contracts 62, Decision Log 10, storage-plan 85, storage value registry 567) and `Plans/.plan_index/` (6) | Regenerated; no other document's shards changed |

In numbers, against `63cf2cb97f`, the branch changes 797 paths:
- 27 authored files, this report included;
- 764 shard files;
- 6 index files.

PlanUnits go from 6,742 to 6,743 (DL-094), and acceptance units from 26,321 to 26,325.

Untouched, as required:
- `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `Plans/.implementation_readiness/**` and `.gitignore`.
- The independent validator (SHA-256 `190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20`) and its receipts.
- The post-August receipt (`dceb7f21436cbe126c23822e62caa1b6dedcb45fefae3005c1804576ca34d827`).
- The three earlier admission records and the depth42 assessment.
- The registry rows and `registry_row_sha256` values of the six sibling ledger rows. Those rows still read `prepared_not_admitted` and gained only the names of their new event cases.
- Every other J248 row.

`pm-implementation-readiness.py generate` was not run. The validator ran only through the scratch harness.

## 2. The prep residuals

The preparation's blind review, `/mnt/Cursor/PM-Experiments/review-ea-s09-coordination-prep-20260925/`, found the preparation landing-ready after its second cycle (`RECHECK.md`). Its four residuals were carried to this branch, and each is repaired here with the reviewer's suggested repair from `recheck-findings.jsonl`:

- **R4-01 (should fix): hyphenated platform IDs.** The `platform` form `^[a-z][a-z0-9_]*$` rejected the surface and provider-entry IDs that `Plans/Models_System.md` sections 10.4 and 10.4.1 and MS-114 name for day-one surfaces.
  - CV-353 rule 5 now reads: "`platform` is a nonempty string of at most 256 characters of lowercase letters, digits, underscores and hyphens, starting with a letter, so that it admits both the tokens (`antigravity_cli`, `zai_coding_plan`) and the surface and provider-entry IDs (`antigravity-cli`, `zai-coding-plan`, `zhipuai-coding-plan`) that `Plans/Models_System.md` names."
  - The pattern `^[a-z][a-z0-9_-]*$` replaces the old one in the payload envelope, in `agent_projection` and `snapshot_agent` and their copies in both Storage value registry rows, and in the checker's `PLATFORM_ID`.
  - The new positive case `a14_registered_zai_coding_plan` registers a hyphenated ID, and ATS-058's registration positives go from 8 to 9.
  - The onboarding digest is re-pinned. No registry row changes.
- **R4-02 (note): the Browser gate and renamed rows.** The Browser gate now maps each coordination event type to its prepared family ID, so a relabelled row stays `unexpected_central_event_family`. The new test case fails on the old code. The gate report stays byte-identical.
- **R4-03 (note): home, drive and UNC paths.** Step 5 of SP-320's path recipe gains the sentence "A result that begins with `~` or `\`, or with a letter, a colon and `/` or `\`, produces no claim, because CV-353's `path_ref` form rejects it as a home, drive or UNC path." The checker's `normalize_observed_path` returns no claim for such a result. The new unit test fails on the old code. The fixtures are unchanged.
- **R4-04 (note): key shapes in readiness.** Readiness now pins each keyed composition's key shapes (`STORAGE_VALUE_KEYED_COMPOSITION_KEY_SHAPES`) and compares `key_shape`. It gains the self-test `keyed_composition_key_shape_order_drift_rejected`, which `REPRESENTATION_CHECKS` names. All 69 storage self-checks pass. The failing self-test scenario, `case_l_verification_integration`, is the same one that fails on `main`.

## 3. The two grades and the oracle fixes

Both grades use the twelve criteria of the Step 8 depth rubric (`rubric.md`, SHA-256 `81f1d8b25ee407975fea50d14ecf44f94127608b912e08b27edd7f62f9b10221`) and its three clarifications. Each grader was fresh and blind and read only `git show <commit>:<path>`.

**First grade, at `0fad478e03`: 10 of 12.** The file's SHA-256 is `a5245356e35e31b0919c202889b4fd2c58e8bea528790b3f6afa60fcd1169158`. Two cells were PARTIAL:
- **`membership_version`.** The row was not yet registered. This was procedural, and it closes with the append.
- **`positive_negative_oracles`.** Three gaps:
  - The family had no EventRecord join case of its own. Every join negative was built on a status record, a sibling, which DL-039 does not accept as evidence.
  - Two rows of SP-320's transition table had no case: a repeated registration of a registered agent, and one of a terminal agent.
  - For a terminal agent, the checker returned `already_registered` where the table says `already_terminal`.

**The host's rulings:**
- (a) SP-320's table is canon. The fixtures' `admission_order` and the checker follow it, and SP-320 states the precedence in one sentence.
- (b) Every one of the seven families gets EventRecord join cases of its own. Both repeat-registration sequences are added, and ATS-058's counts and wording follow.
- (c) R6 form R is used for the admission record step (section 4).

**The oracle fixes:**
- **`19a89fdc18` (a).** Step 5 of SP-320 now ends: "When more than one applies, the first in this order is returned: `not_registered` for any event but a registration when the agent has no event; for a registration of an agent that already has one, `already_terminal` when the agent is terminal and `already_registered` otherwise, before the revision rule; for any other event, `stale_revision`, then `already_terminal`, then `lineage_mismatch`."
  - The checker's `CoordinationStore` refuses a registration of an existing agent by the agent's state, before the revision rule.
  - The new test `test_repeat_registration_follows_the_transition_table` fails on `0fad478e03`.
  - The fixtures' `admission_order` text and the ledger row's `transition_rule` follow. The `registry_row` is unchanged.
- **`432834165b` (b).** A new payload, `a7_registered_other_recovery_epoch`, carries key epoch 4, and two sequences use it:
  - `repeat_registration_of_registered_agent_refused` returns `already_registered`.
  - `repeat_registration_of_terminal_agent_refused` returns the original event for an exact retry after the terminal event, and `already_terminal` for another epoch.
  - ATS-058's registration positives go from 9 to 10, and it names both sequences.
- **`18ab615917` (b).** Each of the seven families gets a valid EventRecord of its own, built on one of its own positive payloads. The status record stays byte-identical.
  - Every negative names the valid event it is built on.
  - 20 new negatives bring the total from 12 to 32. For each non-status family they cover the `occurred_at` join, a sibling's schema ID and a sibling's event ID. The status family gains a sibling event ID, and the registration family also gains a case with its thread dropped.
  - The checker requires each family's own joins (`FAMILY_EVENT_JOINS`).
  - ATS-058 gains the paragraph "EventRecord joins per family" and its table.

**Re-grade, at `3abdf9fe3f` (the registry commit): 12 of 12.** The grader was new to this family and had not written the contract.
- The row file is `reports/event-authority-20260911/step-09-depth-coordination.agent_registered.json`, SHA-256 `54346d8b231b7080b487ed5a8e7332cc0d6202a8177309a10d772b796266509c`. Commit `2f5e164655` copied it byte-identically, and the SHA-256 was checked on disk and in the commit blob.
- It holds 116 evidence items. Every quote is an exact substring of its cited lines at the tip, and every PASS cell cites text under `Plans/`.
- Native execution is `NOT_RUN`, which lowers no grade under the rubric.

The grader's first item was a landing condition: the admission record did not yet exist, so the holding-bucket module failed closed at import and one test of `tests.test_pm_coordination_events` errored. With the record written, the module passes 50 of 50 with no other failure, as the grader required (section 6). The grader's other items, none of which lowers a grade, are in section 9.

## 4. R6 and form R

**The question.** The frozen `INDIVIDUAL_DISPOSITION_SCHEMA.md` has no registered J248 value. Its DL-077 note says the row of a family with a complete admission record "stays as written". Step 3 of the procedure's "Per registration" says "The row's disposition records are updated in the same landing, with the admission record cited."

**The finding.** On a scratch export of `0fad478e03`, a complete admission was simulated, and twelve row forms were checked against the seal check (through the scratch harness), the currentness tools and the holding-bucket tests. The evidence is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-coord-registered-prep-20260925/r6/`: `analysis.json` has SHA-256 `75e61f98c7095074de689d3d16566f4eb9439e4798a9327cbd9231f844d5701c`, and the evidence directory's `SHA256SUMS`, `step-09-coord-registered-prep-20260925/SHA256SUMS`, has SHA-256 `b4ffbbad73f822cb09a12a002aa07c5fb7c2f3383f551dd387a1b0cbc20dafa3`.
- **Forms the seal check accepts.** Nine of the twelve forms gave the same failure list:
  - Six gave byte-identical validator output: the unchanged row, form R, a rationale note alone, a note with a citation entry, a new field, and rewritten evidence.
  - Three gave the same failures and changed only the bucket and disposition counts: `KEEP_REGISTERED`, the `august` bucket and an exclusion.

  A completely recorded family is excluded from every blocking and depth check, so the check cannot tell these forms apart.
- **Forms it rejects.** The other three each fail: the holding bucket, a `registered_keep` census category and a removed row.
- **The controls.** Two controls kept the row unchanged, one with a PARTIAL depth cell and one with no record. In both the family fell back into `unexpected_august_set` and the depth failures, so the row form never substitutes for the record.
- **The currentness tools** do not read disposition rows.

**Form R** meets procedure step 3 and changes nothing that the seal check or the schema's classification reads:
- **Kept byte for byte.** The row's bucket `confirmed_persisted_unregistered`, its `working_bucket`, its disposition `KEEP_QUARANTINED`, its cohort pins `july248`, its retained evidence, `citations_checked`, `phase1_application` and every other field. Likewise the census line's category `persisted_unregistered_quarantine`, its disposition and its pins.
- **Appended.** One sentence pair to `disposition_rationale`, in the row file and in its identical line 78 of the individual-disposition `LEDGER.jsonl`, and to the census line's `notes` (line 113). The record path is also appended to that line's `evidence_refs`, as batch 1's exclusions cited their application record.
- **Added.** No field. The schema note says DL-077 "adds no bucket and no row field".

Why not one of the other forms the seal check accepts:
- The unchanged row meets the schema note but leaves procedure step 3 unmet.
- The rest contradict the frozen schema:
  - a new field;
  - `KEEP_REGISTERED` on a bucket that means "not admitted to the live registry";
  - the `august` bucket, which is reserved for the two August families;
  - rewritten retained evidence;
  - an exclusion.

The host approved form R (ruling c). The sentence is the simulated one, except that the registry revision stands in for "on `<date>`", so that it stays true whatever day the branch lands:

> Registered at registry revision 2026-09-25.1 in its own Storage admission landing under DL-078 and DL-045 (decision Plans/Decision_Log.md#DL-094); DL-077 admission record reports/event-authority-20260911/admission-records/coordination.agent_registered.json. The seal check judges this family by that record (INDIVIDUAL_DISPOSITION_SCHEMA.md, DL-077 note); the bucket, disposition, cohort pins and retained evidence stay as written, since the frozen schema has no registered J248 value.

The application record is `reports/event-authority-20260911/step-09-coord-registered-application-20260925.json`. The CRLF encodings are kept, and git shows one changed line per file.

| File | Before | After |
|---|---|---|
| `individual-disposition/rows/ROW_coordination.agent_registered.json` | `e990debac213073de4d9a970b1072b807edfe55d8abab5f0547b3326bd1d8da6` | `37dbe02fd0b31fdef9a5269ab64d12fc2480d85a3c66c66c61a8a89d0018959f` |
| `individual-disposition/LEDGER.jsonl` | `abea8410fdeeafcc2bd74b5a3f9b6d1e13602d911475d194230cc983d007623c` | `37ea8147878040e62b6ff76981c440a679e002d055ffb7bc5d256573454b5265` |
| `census-adjudication/LEDGER.jsonl` | `2d35c1e4d69e8f471ac9ba3906bc3c924eb70272ace3302ccc478d6c2ac4183c` | `83a1698ac3dfe2795fec2f10aed3eaabfae6f4074966ed5e6806f756ddf15af0` |
| `reports/event-authority-20260911/step-09-procedure-20260924.md` | `29bf03a35cbe0f580e94b539a813f1aee617dd5303dd70b242b5ca6728c8ecb2` | `46752ec5113bf5a9e7eca3233cdb492df92e3d08695ae511324edf128415de17` |

Two changes are made to the procedure record's count table:
- It gains the row 1 registered, 15 excluded, 0 carded, 236 remaining.
- The batch 2 row no longer says "not yet landed". It now names that branch's landing: `bf2a9e877b`, with landing record `cd46487bf0`.

## 5. The registry, the checkpoint, DL-094 and the admission record

**The registry** (`3abdf9fe3f`, with the record `admission-stage/registry_append.json` in the evidence):
- Ledger row 0's `registry_row` is appended unchanged as `#/families/42`. Its canonical SHA-256, `1602bb6d33b63f79b7dc1daf4502c0aadbb26a4aa871a2963b2510a5d0353b40`, equals the ledger's `registry_row_sha256`.
- Before: revision `2026-09-11.2`, 42 families, SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`.
- After: revision `2026-09-25.1`, 43 families, SHA-256 `4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70`.
- The ledger row flips to `admitted_static_contract`, with `authority_contract_ref` placed as the Browser ledger places it. The ledger's `claim_boundary` is rewritten, because it said that no family is admitted. `prepared_against_registry` keeps `2026-09-11.2`.

**The checkpoint.** Under DL-078:
- `EVENT_FAMILY_REGISTRY_REVISION` and `EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT` in `scripts/pm_pnc019_currentness.py` read `2026-09-25.1` and 43. Their provenance comment names DL-078, the new SHA-256 and the predecessor.
- The pins in `tests/test_pm_testing_session_events.py` and `tests/test_pm_github_project_integration.py` read 43.
- Only the plan index was regenerated. `pm-implementation-readiness.py generate` was not run (DL-078, the D-07 ruling).

**DL-094** (`b69811a76b`) is in both Decision Log sections, the PlanUnit in DL-083's form. DL-093 makes it Jared's decision entry for this family. It records:
- the family by its exact event type, and the registry revision, family count and SHA-256 before and after;
- the checkpoint move;
- the full procedure:
  - the contracts, on `main` since `4a2135b940`;
  - their review, landing-ready after cycle 2, with the residuals and oracle gaps repaired here;
  - this admission's own review, which the landing record will name;
  - its own Storage admission landing;
  - the coordinator's landing go;
- the depth assessment with its SHA-256, and the admission record path;
- that it admits only this family and changes no other checkpoint, validator or seal condition.

Its prose section, as the seal check extracts it, has SHA-256 `e8e2404f028e426c6e69572ab848eae668ea095baf7389b3ae21ba85f151587f` (4,590 bytes).

**For later entries.** The prose entries used to end with two blank lines before `## Owner / Consumer Map`. DL-094 ends with one, the same bytes as an inner entry. The next Decision Log entry (DL-095 or later) goes directly before `## Owner / Consumer Map`, after DL-094's single blank line, so that DL-094's pinned section bytes do not change. Adding a second blank line there would change them and fail the seal check closed for this family, until the record is re-pinned.

**The admission record** (`5c4c7c217c`). A script computed every checked field with the seal check's own rules. The rules were re-implemented in the script, not imported, and the scratch harness confirms the result (section 6).

| Field | Value |
|---|---|
| `schema_id` | `pm.assurance.event_authority.post_august_admission_record.v1` |
| `event_type`, `family_id` | `coordination.agent_registered`, `event-family-coordination-agent-registered` |
| `implementation_receipt_sha256` | `dceb7f21436cbe126c23822e62caa1b6dedcb45fefae3005c1804576ca34d827` (the post-August receipt) |
| `decision_ref`, `decision_section_sha256` | `Plans/Decision_Log.md#DL-094`, `e8e2404f028e426c6e69572ab848eae668ea095baf7389b3ae21ba85f151587f` |
| `registry_before`, `registry_after` | `2026-09-11.2` / `0be54418...c842` / 42, and `2026-09-25.1` / `4227be36...3e70` / 43 |
| `registry_row_sha256` | `1602bb6d33b63f79b7dc1daf4502c0aadbb26a4aa871a2963b2510a5d0353b40` |
| `depth_assessment` | the path above, `54346d8b231b7080b487ed5a8e7332cc0d6202a8177309a10d772b796266509c` |
| `admission_landing` | this branch. `commit` is null because a record cannot name the commit that contains it, so the landing record names it. `record` is this report. |
| `criteria_not_passing_at_recording`, `status_at_recording` | `[]`, `complete_depth` (informational) |

The record's own SHA-256 is `c3bfe5b28ece79a6222fe14cb91ae1b7ae817d0e3a142ab70b8d4baf024c45d7`.

## 6. Checks

The branch tip is `9c97cb14fd` and `main` is `63cf2cb97f`. Both were exported with `git archive` (Plans, scripts, reports and tests) to local disk, and the currentness edition was symlinked into each export, never copied. The suites, checker, gate, readiness validate, shard check and index validate ran in the clean worktree at the tip, which was still clean afterwards.

**The seal check, through the scratch harness** (`run_validator_harness_s09.py`, derived from the Step 8 harness `98ce619b...`):
- The harness imports the validator from the export and points `REPO` at a scratch copy of the reports the validator reads, including every depth file an admission record names. It writes the receipt to a scratch directory, never to the tracked receipt.
- Validator SHA-256: `190a86f2...` on both sides, unchanged.
- Both sides exit 1 with the same six errors: `fresh_census_denominator_not_closed`, `individual_dispositions_evidence_gap_blocking`, `individual_dispositions_provisional`, `post_august_admission_incomplete`, `registered_contract_depth_incomplete` and `unexpected_august_set`.
- Every failure's detail is identical on both sides. The only count that changes is `live_registry_rows`, from 42 to 43.
- `post_august_admitted` is `[coordination.agent_registered]` at the tip and `[]` on `main`.
- The family is named in no failure: not in `unexpected_august_set`, not in `post_august_admission_incomplete`, not in the registered-depth sample and not in the evidence-gap sample.
- The three earlier post-August families fail exactly as on `main`, each through its own depth42 cells.

**`pm-event-authority-currentness.py validate`**, with `PM_EVIDENCE_MAP` pointing at the edition: exit 1 on both sides.
- **On `main`,** `all_live_sources_rehashed` is false, with 8 drifting sources: Automated Testing, Contracts, Decision Log, Goal Runtime, Section 15, the Orchestrator, storage-plan and the storage value registry.
- **At the tip** there are three differences:
  - `exact_live_source_set` is false: the new registry row makes `Plans/coordination_event_payloads.schema.json` a live input that the edition does not list.
  - `live_registry_exactly_matches_status` is false.
  - `Plans/event_family_registry.json` joins the drift, which now has 9 sources.
- These are reseal items (section 8).

**PNC-019 currentness rows.** `main` has 8 rows. The tip has 10: `event_authority_currentness_source_drift` for `Plans/event_family_registry.json`, and `event_authority_currentness_live_registry_drift`. `test_pm_pnc019_currentness` fails one test on both sides, on exactly those drift rows.

**Suites at the tip.** All pass, except the PNC-019 currentness module, which has the one drift failure described above.

| Module | Tests | Result |
|---|---:|---|
| coordination (`test_pm_coordination_events`) | 50 | OK (the holding-bucket import no longer fails closed) |
| Browser admission | 38 | OK |
| testing session | 11 | OK |
| GitHub project | 15 | OK |
| holding bucket (`test_event_authority_holding_bucket`) | 34 | OK |
| emit-only | 13 | OK |
| Browser created / reset | 65 / 53 | OK |
| shared runtime storage | 15 | OK |
| onboarding / runtime vocabulary | 42 / 9 | OK |
| PNC-019 currentness | 9 | 1 failure, drift rows only, as on `main` |

**Other checks at the tip:**
- **The checker** `scripts/pm_coordination_events.py`: pass, 0 failures, with `admitted_rows` `[coordination.agent_registered]`. It covers:
  - 45 positive and 69 negative payload cases;
  - 7 valid and 32 negative EventRecord cases;
  - 7 identity vectors and 9 path vectors;
  - 24 sequences with 91 steps;
  - 11 positive and 20 negative projection cases;
  - 13 native obligations, `NOT_RUN`.

  This family alone has 10 positive and 12 negative payloads, 1 valid and 4 negative events, and 23 sequences.
- **The Browser gate:** pass. Its report differs from `main`'s only in `registry_family_count`, 42 to 43.
- **Readiness validate:** 38 rows, against 36 on `main`, the same set as after the registry commit.
- **Shard check:** pass, 2,738 shards.
- **`pm-plan-index.py validate`:** pass, with 6,743 PlanUnits and 26,325 acceptance units.

## 7. Expected at landing

**Rebase.** None is needed while `origin/main` stays at `63cf2cb97f`. If `main` moves, three cases apply:
- **In general,** take `main`'s derived files and regenerate them, then re-read the passages this branch cites in every file `main` changed.
- **If `main` gains a Decision Log entry,** check DL-094's number again. A renumbered or moved entry changes DL-094's prose bytes. In the same landing, the following are then pinned again (V-07): the admission record's `decision_ref` and `decision_section_sha256`, the J248 row's sentence, the application record and this report.
- **If `main`'s registry changes,** the row is appended again on the new base with a new revision and SHA-256. The following then change with it: DL-094, the DL-078 pins and their comment, and the admission record. The depth assessment names the registry revision and SHA-256 it graded, so it needs a re-grade.

**The landing check, measured.** The three aggregate checks ran on sparse `git archive` exports of `main` `63cf2cb97f` and of the tip `9c97cb14fd`, with the currentness edition symlinked into each. Rows were keyed with `pm-landing-check.py`'s own functions, and only the differences between the two exports are used. The `lint_path_refs` rows name `Concepts/` files that the sparse exports lack. Their total is 111 on both sides, and only their `plan_units.jsonl` line numbers shift, by one row after DL-094's unit. In the shared checkout the files exist and these rows do not occur.

| Check | `main` | Tip | New rows |
|---|---:|---:|---|
| `run-gates` | 3,433 | 3,436 | +3: readiness +2, Spec Lock +1 |
| `audit-governance` | 3,417 | 3,420 | +3: readiness +2, Spec Lock +1 |
| `plan-migration-validate` (current run) | 33,909 | 33,909 | none |

These totals are the sparse exports'. In the shared checkout the absolute totals differ, but the differences should not. The subchecks that do not change include:
- evidence (845) and plan graph (846) `artifact_hash_stale`, because the Decision Log shards were already stale on `main`;
- run-002;
- plan migration.

**The new rows, in each aggregate:**
- **Readiness `event_authority_currentness_source_drift`** for `Plans/event_family_registry.json`. This is staleness, on a file this branch changed.
- **Readiness `event_authority_currentness_live_registry_drift`.** This is not a staleness kind, but the row names no path, so it matches none of this branch's files. The landing check reports it as new and does not stop the landing. It is the expected result of the registration until the next currentness edition. Report it to Jared with the reseal request.
- **Spec Lock `stale_hash`** for `scripts/pm_pnc019_currentness.py`.

**Rows that only change value:**
- `event_denominator_unresolved` and `event_family_contract_depth_unresolved` on `Plans/event_family_registry.json`. Only their `registered_kernel_rows` changes, from 42 to 43. Each bucket still holds 2 rows, the count in the baseline `792d2fb8b1`, so while that baseline is current they are pre-existing (rule 2).
- `event_legacy_fixture_root_mismatch`, which now expects `2026-09-25.1`.
- The `pnc019_source_hash_stale` rows.
- The readiness Spec Lock family rows of `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py`.
- `implementation_readiness_self_tests_failed`, the same scenario as on `main`, and pre-existing.

**Forecast:** exit 1 with 0 blocking items. The readiness subchecks print all 38 rows, so they are not truncated.

**Currentness.** `pm-event-authority-currentness.py validate` has three new items:
- **A new live source.** `exact_live_source_set` turns false because `Plans/coordination_event_payloads.schema.json` is now a live machine input that the edition does not inventory. The new registry row's `payload_schema_ref` names it.
- `live_registry_exactly_matches_status` turns false.
- `Plans/event_family_registry.json` joins the rehash drift.

`test_pm_pnc019_currentness` goes from 8 drift rows to 10.

**After the landing:**
- **The landing record** names the landing commit, since the record's `admission_landing.commit` is null by design, and it names this admission's blind review with its verdict.
- **The procedure record's count row** says "not yet landed" until a follow-up names the landing, as batch 1's did.
- **`.gitignore`:** see section 9.

## 8. Reseal request (for the designated Plans agent, after this landing)

- **Spec Lock:**
  - `scripts/pm_pnc019_currentness.py` is new with this landing.
  - `Plans/Automated_Testing_System.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py` are already on the list from the preparation landing, and their hashes move again.
  - `Plans/Decision_Log.md` has no Spec Lock entry.
- **Plan-sharding bundle:** the rows of Automated Testing (40 shard files), Contracts (62), the Decision Log (10), storage-plan (85) and the storage value registry (567). All are already on the list, and their hashes move again. No shard file is added or removed.
- **The PNC-019 certification receipt:** the source hashes of `Plans/event_family_registry.json` (now `4227be36...3e70`), `scripts/pm_pnc019_currentness.py`, `Plans/Automated_Testing_System.md` and `Plans/storage_value_registry.json`. Their `pnc019_source_hash_stale` rows are already on `main`, and only their values move.
- **The currentness edition.** A new edition has to do three things:
  - cover the live registry at `2026-09-25.1` with 43 families (`live_registry_exactly_matches_status`);
  - list `Plans/coordination_event_payloads.schema.json` as a live source (`exact_live_source_set`), since the new registry row's `payload_schema_ref` makes it a live machine input;
  - rehash `Plans/event_family_registry.json` with the documents already drifting on `main`: Automated Testing, Contracts, the Decision Log, Goal Runtime, Section 15, the Orchestrator, storage-plan and the storage value registry.

  Until then, `test_pm_pnc019_currentness` fails with its 10 drift rows.
- **Run-002:** the batch report rows the check lists, and the final summary's PlanUnit count, now 6,743.
- **Readiness:** the implementation-readiness gate report, `Plans/.implementation_readiness/buildability_gate_report.json` (DL-078, the D-07 ruling). The pre-existing `event_legacy_fixture_root_mismatch` row now expects `2026-09-25.1`; its golden fixture still reads `2026-08-27.1`.
- **Snapshot:** the nightly `snapshot-current`, for the current-run rows.

## 9. Open items

These are the grader's remaining items and observations. None lowers a grade, and none blocks this landing:
1. **Optional hardening (ATS-058, fixtures).**
   - **Envelope joins.** CV-353 rule 8's family-independent joins are negated only on the status family's record, as ATS-058 designs it. These are the scope, inline payload, attempt, project, run and key identity, redaction profile and replay policy joins.
   - **Retry digest.** The fixture producer digest is taken over `{event_type, payload}`, which is narrower than Contracts_V0's `producer_semantic_digest` over the envelope's semantic fields. No case retries with a difference in the envelope alone.
   - **Fresh agent IDs.** SP-320 allocates `agent_id` from fresh entropy after a verified older restore, but that rule has no native obligation of its own.
2. **Editorial (CV-353 or OSI-438).** CV-353 rule 8 lets a registration's `actor_ref` name "the Orchestrator or scheduler path", while OSI-438's producer table names only the Orchestrator as the caller of `register_agent`.
3. **Native, `NOT_RUN`.** `COORD-APPEND-01` and the nine shared obligations are not run. SP-320's activation gate appends nothing natively until all seven families are admitted, so this family is contract-only until the six siblings land.
4. **`.gitignore`.** `tests/test_pm_coordination_events.py` is tracked but force-added, and still lacks its line `!/tests/test_pm_coordination_events.py`. Another thread adds `.gitignore` lines.
5. **The checker's report wording (an observation from this branch).** `pm_coordination_events.py` still prints the fixed `claim_boundary` "No family is admitted, no checkpoint or pin moves", beside `admitted_rows` `[coordination.agent_registered]` and `admission_claimed` false. The sentence describes what the static check claims, but read alone it is now out of date. `test_live_report_passes_without_claiming_admission_or_native_proof` asserts it. A later edit can reword it, for example to "This check admits no family and moves no checkpoint or pin". It is not changed here.
6. **The six sibling admissions** follow one at a time: status, operation, file ownership, unregistered, crashed, aborted. `coordination.agent_crashed` still waits on the heartbeat-expiry card, `EA-S09B2-HEARTBEAT-EXPIRY-001`.
7. **The re-grade's oracle finding (from this admission's review).** The re-grade's `positive_negative_oracles` finding says the family's identity vectors are named in its ledger row. They are not: the row's `validation_case_ids` name 32 cases (10 positive and 12 negative payloads, 1 valid and 4 negative EventRecords and 5 sequences), and `identity_registered_rev1` and `identity_new_recovery_epoch_new_event_id` are fixture cases outside it. The PASS does not rest on that clause. The depth file stays byte-identical to the grader's output, because the admission record pins it.

## 10. Evidence

The directory is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-coord-registered-admit-20260925/`. It holds 167 files, 3.2 MB, and its `SHA256SUMS` has SHA-256 `e09c2cc6c6818a557c404413849b55eeeeba0556f596fd3d96ca249f10f1c0bf`. `README.txt` describes the layout. The prep-stage evidence of this branch (R4-01 to R4-04 and R6) is in `step-09-coord-registered-prep-20260925/`, whose `SHA256SUMS` has SHA-256 `b4ffbbad73f822cb09a12a002aa07c5fb7c2f3383f551dd387a1b0cbc20dafa3`.

The preparation review that DL-094 cites is `/mnt/Cursor/PM-Experiments/review-ea-s09-coordination-prep-20260925/`; its `RECHECK.md` (verdict "Landing-ready: yes") has SHA-256 `4aea2b6a89378eaae0007d8aee84ff6ef831efa724c7f57bce04f130194e44c8`.

| File | SHA-256 |
|---|---|
| `depth/first-grade/step-09-depth-coordination.agent_registered.json` (10 of 12) | `a5245356e35e31b0919c202889b4fd2c58e8bea528790b3f6afa60fcd1169158` |
| `depth/regrade/step-09-depth-coordination.agent_registered.json` (12 of 12, the tracked copy) | `54346d8b231b7080b487ed5a8e7332cc0d6202a8177309a10d772b796266509c` |
| `checks/validator-tip.json` (scratch harness, tip) | `e83c867b06effab76f4287b73f3f2c8d0622a5c39f56233cbaeb13031a6db653` |
| `checks/validator-base.json` (scratch harness, `main`) | `99016ba6385a94434a4d88c53fdce1db5c9d198a322688030836aacb4a035b9a` |
| `aggregates/forecast.json` (landing forecast) | `d327c9a1d47709dafc6ccb93e548f4ebec4752d2da7c86830100b86358387ee7` |
| `log.md` (the stage log at sealing) | `afcd460acfaf94ca3c409a190a5a64000aa888001a493805c7231f200a2b6d49` |

The working directory, `/mnt/Cursor/PM-Experiments/ea-s09-coord-registered-20260925/`, keeps the full log and the R6 simulation. The scratch exports on local disk are deleted after this report.

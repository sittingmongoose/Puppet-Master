# PNC-019 lane s3d: DG-OWN-A fix round and merge, `goal_run.stopped` and `goal_run.blocked` (S3), 2026-11-14

**Native evidence stays NOT_RUN and is a separate claim. A planning PASS must never read as native proof.**

- **Branch:** `plans/ea-pnc-s3d-20261114`, from lane s3a's head `2f44dc23cd` (batch 3 had not landed on `main`).
- **Worktree:** `/home/sittingmongoose/pm-worktrees/pnc-s3d` (sparse: no `Plans/.audits/` except the copied currentness edition, no `Concepts/`). Kept until the lead says the lane has merged.
- **Inputs read:** `lanes/PNC019-RUN.md`, DL-080 and DL-448 in `Plans/Decision_Log.md`, `lanes/DG-OWN.md` (DG-OWN-A), `reviews/DG-OWN-A-sol/REVIEW.md` (NOT_READY, 7/12, F1-F9), `drafts/PNC019/s3a/REPORT.md`.
- **Ids:** none minted. Every unit used is DG-OWN-A's own allocation (EP-1110..1112, GRS-1110, SP-1110..1112, CV-1110, ATS-1110..1112). The s3d blocks SP/CV/ATS-2150..2199 and DL-2925..2949 are untouched.
- **Not done:** no registry, Decision Log, Spec Lock, `.evidence`, `auto_decisions.jsonl` or frozen-validator edit; no landing lock; `main` not pushed; no subagents or browsers.

## Result

| Family | Sol's review (`6345ef8f3d`) | s3a after | **s3d** | Vector (s3d) |
|---|---:|---:|---:|---|
| `goal_run.stopped` | 7/12, consumer **C** | 7/12, consumer p | **11/12** | `P P P P P P P P P P P p` |
| `goal_run.blocked` | 7/12, consumer **C** | 7/12, consumer p | **11/12** | `P P P P P P P P P P P p` |

- **Criterion 12 is left to the Goal oracle sweep (lane s3ao).** The lane-local oracle defects are fixed. The stream E bar still needs gated-tool guard proof, the shared number and date-time calls, and sealed-receipt retained reads.
- **Grade file:** `reports/event-authority-20261114/PNC019-S3D-grades.json`: 89 exact quotes in 13 files.
  - Verify with `python3 scripts/pm-pnc019-s3a-grade-check.py reports/event-authority-20261114/PNC019-S3D-grades.json`, which exits 0.
- **Grading basis (stated in the file):**
  - Criteria 2-12 grade the prepared v3 successor, which is the contract the EA-P3 A switch would register. The 12/12 assessment that the switch requires cannot depend on the switch itself.
  - Criterion 1 grades the registered 2.0.0 row. Membership of 3.0.0 is graded at the S5b switch. S4 uses the same basis for prepared families.
  - **Under s3a's stricter convention these rows are 9/12**, because closed payload and scope stay PARTIAL until the switch (see "For the lead").

## What this lane changed

| Commit | What |
|---|---|
| `ac2b399750` | Merge of DG-OWN-A `6345ef8f3d`, unit by unit, onto `2f44dc23cd`. DG-OWN-A's twelve amendments were applied as patch hunks. GRS-202 keeps s3a's revision relation and takes DG-OWN-A's SP-1112/GRS-1110 adoption sentence. The new blocks sit right after their base anchors. The SP block sits after SP-433's DG-OWN-D adoption paragraph. Shards and index regenerated; the DG-OWN-A suite passed unchanged (258 cases). |
| `581f8e6ec1` | F9 resource graph: `consumer-resource-bank.json` (seven fresh consumer realms) and `scripts/pm_goal_own_a_consumer_realms.py`, plus updates to `resource-map.json`, `additional-imports.json` and `inherited-method-banks.json`. |
| `ebe7e528f3` | F1-F8 and the typed consumer graph. Files: `scripts/pm_goal_own_a_oracles.py` (rebuilt), `contracts.schema.json`, `methods.json`, `oracle-fixtures.json`, `protocol.md`, `profile.json`, and the new `prepared-registry-rows.json`. Owner text: GRS-1110, SP-428, SP-1112, CV-420, CV-421, CV-1110 and ATS-1110..1112. A supersession note in `reports/event-authority-20261105/DG-OWN-A.md`. Shards and index regenerated. |
| (this commit) | Grade file, this report (`reports/event-authority-20261114/PNC019-S3D.md` is the same text). |

## Each review finding and its fix

Line numbers are at `ebe7e528f3`. Run every script from the worktree root.

| Finding | Fix | Where | Verify |
|---|---|---|---|
| **F1** adjacency rule vs native clock; wrongly escalated | GRS-202's relation (s3a, `6b2e70b4dd`) is now stated in the package. The "owner clock conflict" hold and its Jared question are removed. `profile.json` is `PREPARED_WITHOUT_ADMISSION_NATIVE_NOT_RUN` with fresh member pins. GRS-1110 follows the relation, and its stale 7.a sentence now names DL-448. The oracle accepts non-emitting progress before a stop or block. It refuses an unauthenticated gap, an emitting intervening step, a revision below the projected one, a missing D01 update and an unsupported intervening Event. | `Plans/goal_run_stop_block_contracts/protocol.md:5`, `profile.json:5`, `Plans/Goal_Runtime_System.md:8591` (GRS-202), `:9419`, `:9426` (GRS-1110); `scripts/pm_goal_own_a_oracles.py:752` (`reduce`), cases at `:1145` | cases `*/project_after_non_emitting_progress`, `*/project_unauthenticated_gap`, `*/project_emitting_intervening_step`, `*/project_expected_below_projected`, `*/project_missing_d01_update`, `*/project_intervening_unsupported_event` |
| **F2** invalid envelopes and projection inputs accepted; promised paths not exercised | The suite is rebuilt on an owner store. Callers supply only the request and the producer-owned append request; every source comes from the store. The writer checks: the complete EventRecord, exact v3 dispatch, the Goal source's Project and Goal, the cause owner's block receipt, reason and preserved work, and the settlement census. The projector reads Storage's global prefix together with its SP-286 first custody and never takes caller rows. A coherent foreign-Project original is a validated no-op. Recovery and the readers resolve the original from Storage, so a coherent forged first record refuses. The whole SB5 transaction is modelled: nine-field token with 13-field selection, the anchor and frontier recipes, whole-preimage CAS on generic, root and row, atomic commit, three slots, seed collision rejection, rebuild, and cutover coverage. | `scripts/pm_goal_own_a_oracles.py:339` (`admit_static`), `:357` (envelope), `:402` (selector), `:370` (Goal), `:396` (block receipt), `:752` (`reduce`), `:797`/`:830` (generation, candidate), `:855` (`publish_projection`), `:658` (`recover`), `:730` (`inspect`) | cases `*/outer_schema_id`, `*/outer_schema_version`, `*/outer_replay_policy`, `*/dispatch_registered_v2_selector`, `*/goal_source_project`, `*/goal_source_goal`, `goal_run.blocked/forged_block_receipt`, `*/project_foreign_original_not_counted`, `*/project_coherent_storage_forgery`, `*/recover_coherent_forged_first`, `*/cas_*`, `*/generation_slot_limit`, `*/rebuild_stages_and_cuts_over` |
| **F3** closed projection cannot store SP-428's metadata | `Projection` gains a required `lifecycle_metadata`: `StoppedRowMetadata` (`stop_reason_code`, `resumable`, `safe_point_ref`), `BlockedRowMetadata` (`blocked_reason_code`, `block_receipt_ref`), or null. Each shape is tied to `lifecycle_status`. The values are copied from the verified original row, and the oracle checks the enums against the v3 payload. SP-428's value delta, SP-1112 and SB5 now say the row stores them. | `contracts.schema.json:1253`, `:1633`, `:1700`; `Plans/storage-plan.md:27630` (SP-428), `:45759` (SP-1112); `protocol.md:69` | cases `*/project_metadata_from_original`, `*/projection_root_rejects_missing_metadata`, `*/projection_root_rejects_other_family_metadata`, `*/project_metadata_edited_candidate` |
| **F4** receipt Boolean alias; StoredPart branches | A supplied receipt is validated against `AppendReceipt` and then compared by typed `same_json_value`. `resolve_part` validates the closed `StoredPart` branch before reading. | `scripts/pm_goal_own_a_oracles.py:451` (`retry_checks`), `:176` (`resolve_part`) | cases `*/supplied_receipt_boolean_alias` (`receipt/type`), `*/reader_claim_boolean_alias`, `parts/inline_string`, `parts/inline_array`, `parts/inline_number`, `parts/inline_null_without_ref`, `parts/inline_and_ref`, `parts/extra_member` |
| **F5** inline selection measured the body only | Inline only when the complete encoded `StoredPart` wrapper fits 16 KiB. Every enclosing wrapper is measured after externalization, and a compact wrapper still over the limit refuses before any write. The boundaries are searched for ASCII, two-byte and four-byte content. | `scripts/pm_goal_own_a_oracles.py:165` (`store_part`), `wrapper()`; `protocol.md:53` | cases `parts/*_largest_inline`, `parts/*_first_reference`, `parts/*_body_fits_but_wrapper_does_not`, `parts/*_inline_overlimit`, `parts/compact_wrapper_still_over_limit`, `parts/compact_wrapper_writes_nothing` |
| **F6** multi-defect fixtures; masked custody guard | Each scope fixture changes or drops exactly one of the five components (cause and native). The reader now resolves from Storage. Its guards are now separate: at-rest corruption hits `reader/whole_value`, a coherent caller claim hits `reader/claim`, and a split first custody hits `reader/first_custody`. Each case starts from its own valid baseline. `oracle-fixtures.json` (v2.0.0) holds the one-defect writer negatives with paths into the case. | `scripts/pm_goal_own_a_oracles.py:1128`, `:1219`; `oracle-fixtures.json:10` | cases `*/cause_scope_changed/*`, `*/cause_scope_missing/*`, `*/native_scope_*`, `*/reader_at_rest_corruption`, `*/reader_claim_coherent_forgery`, `*/reader_first_custody_split` |
| **F7** timestamp join had no negative | One lawful envelope copy one second apart refuses at `event/join/occurred_at_utc`. | `scripts/pm_goal_own_a_oracles.py:1145` | case `*/timestamp_join_one_second` |
| **F8** trailing-LF identifiers in the token root | Every new 64-hex, `eig_` and `grsbg_` identifier has exact lengths. The token's free strings refuse control characters. A persisted `redb_snapshot_id` refuses. | `contracts.schema.json:1044` (DurableToken) | cases `*/token_lf/{generation_id,generation_anchor_sha256,frontier_sha256,source_selection.current_bytes_sha256,checkpoint_key,checkpoint_ref,index_dataset_name}`, `*/token_persisted_snapshot_id` |
| **F9** fresh consumer rebinding and typed method graph missing | The seven consumer realms of the certified consumer are re-identified into the stop_block.v1 namespace: 359 resources, 36,410 refs, 195 fresh wrapper ids, 22 import edges. They resolve through realm-local maps and the certified consumer's location-scoped imports; six moved originals come from exact git blobs pinned by SHA-256. `methods.json` declares five typed consumer methods; `read_sources` is new as the Storage source reader. Each has arguments, return variants (success, halt_before, unavailable), SBP0-SBP10 entry and final tuples, and lower calls. Inherited arguments keep their original name, realm and predicates; the oracle checks each against `resource-map.json`. New own roots: `ConsumerRequest`, `PrefixFrame`, `GlobalPrefix`, `StopBlockOriginal`, `StopBlockSources`, `ProjectionState`, `ProjectionCandidate`, `ConsumerResult`, `Halt`. | `consumer-resource-bank.json`; `scripts/pm_goal_own_a_consumer_realms.py:168`; `methods.json:191`; `contracts.schema.json:1752`; `protocol.md:61` (SBP0-SBP10); `Plans/storage-plan.md:45752` (SP-1112); `Plans/Goal_Runtime_System.md:9419` (GRS-1110); `Plans/Contracts_V0.md:41104` (CV-1110) | `python3 scripts/pm_goal_own_a_consumer_realms.py` (`status: pass`); the own suite's eager resolution: 638 resources, 66,219 refs, 78 consumer argument roots, and `consumer_graph_checks` |

**Criteria 4 and 5 (prepared v3 rows).** `Plans/goal_run_stop_block_contracts/prepared-registry-rows.json:6` holds the 3.0.0 successor rows:
- Each row validates against the registry family schema.
- Each pins the closed v3 root.
- Each fixes the envelope joins, including `run_id` at `/payload/payload/goal_run_id`, the gap s3a named.
- `goal_run.blocked` carries its dormant application edition unchanged. `goal_run.stopped` stays `project_only`.

CV-420/421 (`Plans/Contracts_V0.md:40751`) point at the rows. The registry is unchanged; the switch is S5b's.

## Verification at `ebe7e528f3`

All checks ran under `systemd-run --user --scope -p MemoryMax=2G` (3G for regeneration), one at a time, starting with at least 12 GB available. Two quick checks ran at 8-9 GB available; each used under 130 MB. The 15-file currentness edition was copied in and its SHA-256 checked before both index generations.

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_goal_own_a_oracles.py` (ATS-1110..1112) | 0 | pass. 536 cases: 134 positive, 402 negative. 138 guard codes, each with at least one named one-defect negative. 638 resources, 66,219 refs and 78 consumer argument roots resolved. |
| `python3 scripts/pm_goal_own_a_consumer_realms.py` (check mode) | 0 | pass; rebuilds the seven realms byte-identically from their pinned originals |
| `python3 scripts/pm-pnc019-s3a-grade-check.py reports/event-authority-20261114/PNC019-S3D-grades.json` | 0 | 2 rows, 89 quotes, 13 files |
| `scripts/pm_goal_run_stop_block_oracles.py` (ATS-212) | 0 | 494 cases, 440 negatives; equals s3a |
| `scripts/pm_goal_current_writer_oracles.py` (ATS-210) | 0 | 931 / 861; equals s3a |
| `scripts/pm_goal_lifecycle_successor_oracles.py` (ATS-213) | 0 | 539 / 510. s3a's report says 514/487, but none of this suite's inputs differ from `2f44dc23cd` (`git diff` empty), so the difference is in s3a's report, not this branch. |
| `scripts/pm_goal_own_b_oracles.py` (ATS-1113..1115) | 0 | 571 / 503; equals s3a |
| `scripts/pm_goal_own_d_oracles.py` (ATS-1119), long-job | 0 | 51,670 cases / 49,420 negatives; equals s3a |
| `scripts/pm_goal_history_reader_fixtures.py` (ATS-211), long-job | 0 | 6,187 cases / 6,072 negatives, 0 unproved guards (24 min 46 s); equals s3a |
| `scripts/pm_event_datetime_inventory.py` | 1 | 290 nodes, 0 unclassified, the same 4 failures s3a has (citations under the sparse-excluded `Plans/.audits/stage-a-…`) |
| shard generate / index generate / shard check | 0 / 0 / 0 | after the merge and after the fixes; only the five merged documents changed, then only the four edited ones |

Not run: the landing check, run-gates, audit-governance and `pm-plan-index.py validate`; those belong to landing.

## For the lead (not Jared)

1. **One grading convention for switching families.** These rows grade criteria 4 and 5 on the prepared successor. s3a grades `goal.blocked` and `goal.completed` (`P P P p p …`, 9/12) on the registry's current selection.
   - On s3a's convention, these two rows are 9/12.
   - On this one, s3a's two rows would gain 4 and 5 once their prepared rows exist.
   - Recommended: the successor basis, because the S5b switch needs 12/12 first. Either way, apply one convention to all switching families.
2. **S5b writer hook.** `scripts/pm-ea-admission-writer.py` needs a lane entry that reads `Plans/goal_run_stop_block_contracts/prepared-registry-rows.json` (`rows[].registry_row`) as the prepared row, and replaces the registered row rather than appending one.
3. **DL-448.** The distinct application edition of `goal_run.stopped` is approved but not authored by any lane. A search over every origin ref ran out of time; the current tree has none. It touches `Plans/application_workflow_contracts.schema.json` and the CV-366 table, which other threads own. It is outside this Project row's criteria and is listed in its remaining gaps.
4. **Size.** `consumer-resource-bank.json` is 28.9 MB (1.7 MB gzip). DG-OWN-A's `resource-bank.json` is 21.8 MB. Both are whole re-identified schema copies, by design. They add token occurrences, but no new tokens, to the S6 edition scan.
5. **Merge order with DG-OWN-C.** This branch has DG-OWN-B, D and A. DG-OWN-C is in batch 3 already (s3a's note). The A blocks sit before the B, C and D blocks in every owner document.

## Questions for Jared

**None.** F1 was ruled technical (classification (c), DL-045). 7.a is answered by DL-448. Nothing found here needs a new product choice.

## Run notes

- The ATS-211 long-job `s3d-history` finished `done (exit 0)` after 24 min 46 s. The session then stopped on the claude_me weekly limit at 4:34 PM EST, before this report was committed, and was resumed after the reset. Nothing on the branch changed in between; lane rv8b had already merged the pushed head `ebe7e528f3`.
- Every check above ran against the tree at `ebe7e528f3`. The commit after it adds only the grade file and this report.

## Evidence

Folder: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s3d/`. `SHA256SUMS` lists every file.

# DG shared TEST_ONLY owner adapters — batch 2 (stream E, 2026-11-12)

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Everything in this report is TEST_ONLY. Branch `plans/ea-goal-adapter-b2-20261112`, based on batch 1 `62e61fe59a`; the initial six adapter fixes are commit `783caeaf5faf380caf09a33a8a070964e066b88b`. Initial completion runs use that code on Nas1 and the Python venv `/home/sittingmongoose/pm-scratch/dg-adapter-b2/venv/bin/python`. The four completion negatives are a tests-only follow-up in `3e20ffded403e19e2120053dcba7b9d3dc6b2b37`; the runtime modules remain byte-identical to the smoke-tested fix commit (`smoke-runtime-equivalence.json`). This report is a separate documentation commit. No family grade, native implementation, admission, registry or governance seal is asserted.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-ADAPTER-B2/`. Relative evidence paths below refer there. `SHA256SUMS` binds the report and evidence; hashes of code and principal results are also listed below.

**Fix 7 continuation:** implementation/test head `a3696a6e69` adds the registry gate below. Earlier check and smoke tables preserve the initial delivery at `eb903f8d1c`; the fix-7 section records current validation and lane changes. Evidence for this continuation is under `fix7/`. Historical section line numbers and hashes refer to their stated initial source heads.

## Fixes, APIs and tests

### 1. Canonical SP-278 Storage images

`scripts/pm_goal_test_storage.py` persists canonical images in its commit record and exports them beneath `<storage root>/storage/`: `pm.storage.seglog_current.v1`, `pm.storage.seglog_manifest.v1`, `pm.storage.seglog_sequence_lease.v1`, `event_record_index_checkpoint.v1:{storage_instance_id}`, and the current `event_record_index.v2@{generation_id}` dataset of `GenericIndexRow`s. They are checked against the pinned current/manifest/lease, checkpoint and consumer row schemas.

**API:** `storage.canonical_images()`, `storage.index_checkpoint()`, `storage.index_rows(generation_id=None)`, and `storage.acquire_source()['canonical']`; segments additionally carry `raw_sha256`. Module helpers: `build_seglog_images`, `source_selection_of`, `index_digest`, `retained_prefix_digest`, `row_set_digest`, `generation_id_of`, `index_row_base`, `index_row`, `durable_group_value`.

**Tests:** self-test `images:*` validates schemas, every GenericIndexRow, token/checkpoint joins, export bytes, sealing namespace bindings, SP-278 binding vectors and checkpoint-fixture recipes. Coherently substituted canonical current/manifest, generation, commit generation, checkpoint and row-set images refuse on reopen. Missing exports regenerate from the retained commit.

**Model choices:** CURRENT has selection `initial` and selected segment generation 1: this adapter never compacts. Per-segment generations remain on frames. Segments begin as `seg-NNNNNN-<first>.active`; sealing renames them to `…-<last>.seglog`, recording `namespace_bindings` while rows keep their original locator. Generation ids bind the birth source selection and seed through SP-278's `eig_` recipe. A recovery-epoch change or loss of the anchored retained prefix mints an index generation. At most three nodes remain; protected slots produce `rebuild_required` instead of eviction. A retired dataset no longer derivable on reopen is quarantined with its node.

### 2. Stable seglog manifest under redb transactions

`manifest_generation` now describes the canonical seglog manifest and advances only when its body changes. `commit_generation` advances on every TEST_ONLY durable commit; `observe()` includes both. The persisted canonical generation neutralizes DG-CA's legacy subclass decrement. TEST_ONLY CURRENT includes `commit_generation`; commit files are named `manifest.<commit_generation>.msgpack` and retain the old keys for compatibility with the DG-CF3 backup reader.

**Token:** `source_selection` derives from canonical bytes. `checkpoint_key`, `checkpoint_ref` (`…#/generations/{gid}`), `index_dataset_name`, generation anchor and `frontier_sha256` bind the canonical index. Redb-only transactions, seed/pack writes, reserve/release and first custody leave the seglog token unchanged. Seglog changes still move its source selection/frontier.

**Tests:** self-test `stable:redb_transactions_leave_seglog_token`, `first_custody_leaves_seglog_token`, `append_moves_generation_and_frontier_once`, `subclass_adjustment_neutralized`, `observe_reports_commit_generation`; reopen negatives include `open/commit_generation`, `open/canonical_generation`, `open/canonical_current`, `open/canonical_manifest`, `open/index_checkpoint`, `open/index_row_set`. The fault matrix requires both generation counters unchanged at second re-entry.

### 3. Sequence lease and exclusive append fence

**API:** `reserve_assignment`, `reservation_record`, `abandon`, `lease`, `lease_key`, `ensure_lease`, `next_sequence`, `Fence`, `storage.fence`, `storage.boot_session`. Names and refusal codes follow DG-CA. The lease allocates 4096 ids at birth. A held fence fixes the next sequence, sink segment, offset and manifest generation; unrelated appends and retention cannot cross it. Abandoned ids become `allocator_lease_abandoned` excluded ranges and never return to allocation. Reopen abandons a lost boot-session fence with recovery note `fence_lost_abandoned`.

**Tests:** self-test `fence:*` covers assigned sequence/offset, redb writes under the reservation, lease rollover, abandonment gaps, dedupe abandonment and reopen. Negatives cover `assignment/fence_held`, `reservation_abandoned`, `fence_lost`, `selected_offset`, `selected_segment`, `selected_manifest`, `sequence_reused`, `active_segment`, `reservation_absent`, `operation_state`, and `fence/not_copyable|not_serializable`.

### 4. SP-278 Event Record Index read source

`scripts/pm_goal_test_source.py` adds `EventRecordIndexSource(storage).read(snapshot=None)`, returning `IndexRead` with the checkpoint, current generation, rows and ten-field `read_token` (including transient `redb_snapshot_id`). `lookup(read, scope_partition=…, sequence_id=…, event_id=…)` returns the row, frame bytes, Event, first receipt, full-value result and custody. `native_current_event_source(original_native_read_id, read=None)` returns a `NativeCurrentEventSource` validated against the whole pinned native-v7 v4 bank, for CF-06's input root.

`GenericSource` checks all durable token fields against canonical bytes. New refusal families cover canonical current/manifest, manifest hash, excluded ranges, survivor prefix and the checkpoint/generation/anchor/frontier/dataset joins. Existing lane behavior remains: corrupted bytes at rest halt at `source/frame/payload_crc`; substituted snapshot bytes refuse `source/retained_inventory`.

**Tests:** self-test `index:*` covers complete reads and lookup, canonical NativeCurrentEventSource, retention removing rows, recovery generation slots and explicit rebuild disclosure. Exact-code negatives cover row fields/locators/digest/count/coverage/key/duplicates, checkpoint schema/storage/generation/dataset/frontier/coverage/anchor, complete-source/read-token joins, forged read type, missing row, altered frame, missing first custody, token substitutions and coherent canonical-image substitutions.

### 5. Recorder digests for hostile text

`pm_goal_test_owner_adapters.observation_digest` encodes the JSON fallback with UTF-8 `surrogatepass`, preserving valid-text bytes and distinguishing lone surrogates. A structural fallback handles cycles and non-string keys; the cycle check precedes physical encoding. The recorder observes and never refuses, so these are recording positives.

**Tests:** `recorder:lone_surrogate_recorded`, `lone_surrogate_deterministic_distinct`, `valid_text_digest_unchanged`, `cycle_and_non_string_keys`, `observer_lone_surrogate_snapshot`.

### 6. Previously uncovered guard entries

The batch-1 report listed 62 entries without an exact-code negative. Batch 2 adds negatives for 49 of those entries; the other 13 have explicit reasons below. The source inventory records literal call sites, so two sites with the same code are separately counted there. Exact-code coverage is not per-predicate guard-removal proof; that remains the shared guard-isolation tool's work. NUMRULE and guard-tool sources were not edited.

`DG-ADAPTER-B2-guards.json` maps every scanned literal site to exact-code negatives. The same scanner finds 191 sites at batch 1 and 257 now (66 additional literal sites); 241 current sites have a matching negative and 16 have the reasons below. The earlier report counted 180 guard-code entries, so that total is not a literal-site count. Parameterized and repeated codes are not per-predicate execution proof.

| File | Literal sites | With exact-code negative |
|---|---:|---:|
| `scripts/pm_goal_test_demo_cf01.py` | 21 | 19 |
| `scripts/pm_goal_test_demo_r1.py` | 35 | 31 |
| `scripts/pm_goal_test_owner_adapters.py` | 37 | 36 |
| `scripts/pm_goal_test_source.py` | 59 | 59 |
| `scripts/pm_goal_test_storage.py` | 105 | 96 |

### All 62 batch-1 uncovered entries

| Adapter path and final line(s) | Batch-1 uncovered code | Exact-code negative or reason |
|---|---|---|
| `scripts/pm_goal_test_demo_cf01.py:252` | `producer/cause_appended` | Storage refuses read/event_unavailable first; the cause_not_appended case documents that earlier refusal. |
| `scripts/pm_goal_test_demo_cf01.py:339` | `producer/inner_outer_key_bytes` | Named duplicate of producer/field/idempotency_key over the same inner/outer key bytes; no per-predicate removal claim is made. |
| `scripts/pm_goal_test_demo_cf01.py:297` | `producer/payload_type` | `cf01:payload_not_object` |
| `scripts/pm_goal_test_demo_r1.py:386` | `method/qualified` | `r1:method_unqualified_bank` |
| `scripts/pm_goal_test_demo_r1.py:385` | `method/selection` | `r1:method_other_selection` |
| `scripts/pm_goal_test_demo_r1.py:367` | `qualify/route_site_unused` | `r1:route_site_never_crosses` |
| `scripts/pm_goal_test_demo_r1.py:328` | `qualify/unsupported_dynamic_reference` | The pinned realm banks have no $dynamicRef or $recursiveRef; this compatibility guard is not reachable with these banks. |
| `scripts/pm_goal_test_demo_r1.py:156` | `realm/no_merge` | `r1:realm_merge_declared` |
| `scripts/pm_goal_test_demo_r1.py:163` | `realm/resource_hash` | The retained content index is keyed by the hash of those same bytes; the pinned resource cannot mismatch that key. |
| `scripts/pm_goal_test_demo_r1.py:209` | `route/one_source_resource` | Reaching it requires a second pinned source document referencing the target; this realm has only one. |
| `scripts/pm_goal_test_demo_r1.py:213` | `route/same_literal_per_alias` | The two aliases resolve to the same single pinned source document and literal bytes. |
| `scripts/pm_goal_test_demo_r1.py:215` | `route/target_unique` | `r1:target_absent_from_target_realm` |
| `scripts/pm_goal_test_owner_adapters.py:493` | `activation/cause_type` | `selftest:guards:activation_cause_empty` |
| `scripts/pm_goal_test_owner_adapters.py:474` | `activation/subject_type` | `selftest:guards:activation_subject_empty` |
| `scripts/pm_goal_test_owner_adapters.py:486` | `activation/unborn_subject` | `selftest:guards:activation_unborn_subject` |
| `scripts/pm_goal_test_owner_adapters.py:517` | `append_owner/storage` | `selftest:guards:append_owner_not_storage` |
| `scripts/pm_goal_test_owner_adapters.py:190` | `bank/no_rebinding/` | `selftest:guards:bank_uri_rebound` |
| `scripts/pm_goal_test_owner_adapters.py:189` | `bank/uri/` | `selftest:guards:bank_document_without_uri` |
| `scripts/pm_goal_test_owner_adapters.py:186` | `bank/whole_hash/` | `selftest:guards:bank_whole_hash_mismatch` |
| `scripts/pm_goal_test_owner_adapters.py:432` | `custody/type` | `selftest:guards:custody_not_dict` |
| `scripts/pm_goal_test_owner_adapters.py:434` | `custody/unissued` | `selftest:guards:custody_unissued_ref` |
| `scripts/pm_goal_test_owner_adapters.py:542,548` | `event/handle_type` | `selftest:guards:event_dict_handle`; `selftest:guards:first_receipt_dict_handle` |
| `scripts/pm_goal_test_owner_adapters.py:414` | `original/ref_type` | `selftest:guards:authenticate_ref_not_string` |
| `scripts/pm_goal_test_owner_adapters.py:570` | `publish/replay_tx` | Storage transact refuses tx/cas_absent before this downstream replay check can see that defect. |
| `scripts/pm_goal_test_owner_adapters.py:239` | `registry/duplicate_id` | `selftest:guards:registry_duplicate_owner_id` |
| `scripts/pm_goal_test_owner_adapters.py:251` | `registry/owner_type` | `selftest:guards:registry_owner_not_test_owner` |
| `scripts/pm_goal_test_owner_adapters.py:238` | `registry/role_type` | `selftest:guards:registry_role_empty` |
| `scripts/pm_goal_test_source.py:309` | `project/snapshot_type` | `selftest:guards:project_snapshot_not_issued` |
| `scripts/pm_goal_test_source.py:242` | `source/gap_order` | `selftest:guards:retention_gap_out_of_order` |
| `scripts/pm_goal_test_source.py:157` | `source/manifest_hash` | `selftest:index:source_token_manifest_hash` |
| `scripts/pm_goal_test_source.py:180` | `source/retired_inputs` | `selftest:index:source_token_retired_inputs` |
| `scripts/pm_goal_test_source.py:213` | `source/storage_type` | `selftest:guards:source_storage_not_storage` |
| `scripts/pm_goal_test_storage.py:1534` | `append/readback` | Self-check of frames just encoded and written by append; the supported fault hooks cut the process, not replace its readback bytes. |
| `scripts/pm_goal_test_storage.py:1611` | `custody/full_value_schema` | Self-check of the adapter-generated full-value result; callers cannot supply its fields. |
| `scripts/pm_goal_test_storage.py:1564` | `custody/schema` | Self-check of the adapter-generated custody record; callers cannot supply its fields. |
| `scripts/pm_goal_test_storage.py:719` | `fault/cut` | `selftest:guards:fault_unknown_cut` |
| `scripts/pm_goal_test_storage.py:720` | `fault/mode` | `selftest:guards:fault_unknown_mode` |
| `scripts/pm_goal_test_storage.py:440` | `frame/header_cap` | `selftest:guards:frame_header_over_4096` |
| `scripts/pm_goal_test_storage.py:441` | `frame/payload_cap` | `selftest:guards:frame_payload_over_16mib` |
| `scripts/pm_goal_test_storage.py:1618` | `group/schema` | Self-check of the durable-group value derived from the scanned commit and frames. |
| `scripts/pm_goal_test_storage.py:1261` | `handle/kind` | Every entry issued into _handles is a reservation; copied, forged and foreign handles are refused earlier. |
| `scripts/pm_goal_test_storage.py:1259` | `handle/type` | `selftest:guards:append_dict_handle` |
| `scripts/pm_goal_test_storage.py:1056` | `index/duplicate_event_id` | `selftest:guards:recovered_duplicate_event_id` |
| `scripts/pm_goal_test_storage.py:1057` | `index/duplicate_scoped_identity` | `selftest:guards:recovered_duplicate_scoped_identity` |
| `scripts/pm_goal_test_storage.py:1040` | `index/durable_prefix` | `selftest:guards:durable_prefix_changed_at_rest` |
| `scripts/pm_goal_test_storage.py:936` | `open/instance` | `selftest:guards:current_instance_substituted` |
| `scripts/pm_goal_test_storage.py:934` | `open/manifest_generation` | `selftest:guards:current_generation_substituted` |
| `scripts/pm_goal_test_storage.py:930` | `open/qualification` | `selftest:guards:current_qualification_missing` |
| `scripts/pm_goal_test_storage.py:1712` | `pack/bytes` | `selftest:guards:pack_bytes_type` |
| `scripts/pm_goal_test_storage.py:1713` | `pack/media_type` | `selftest:guards:pack_media_type_empty` |
| `scripts/pm_goal_test_storage.py:1728` | `pack/present` | `selftest:guards:pack_file_missing_at_rest` |
| `scripts/pm_goal_test_storage.py:1571` | `receipt/state` | `selftest:guards:receipt_before_append` |
| `scripts/pm_goal_test_storage.py:1292` | `release/state` | `selftest:guards:release_after_append` |
| `scripts/pm_goal_test_storage.py:1266` | `reserve/operation_type` | `selftest:guards:reserve_empty_operation` |
| `scripts/pm_goal_test_storage.py:1754` | `retire/nonempty` | Rotation seals only a segment with a committed group; every publicly reachable sealed segment is nonempty. |
| `scripts/pm_goal_test_storage.py:798` | `storage/create_empty` | `selftest:guards:create_over_existing` |
| `scripts/pm_goal_test_storage.py:1694` | `terminal/replay_target` | `selftest:guards:terminal_replay_other_key` |
| `scripts/pm_goal_test_storage.py:1659` | `tx/delete_present` | `selftest:guards:tx_delete_absent` |
| `scripts/pm_goal_test_storage.py:1650` | `tx/key` | `selftest:guards:tx_empty_key` |
| `scripts/pm_goal_test_storage.py:1649` | `tx/table` | `selftest:guards:tx_empty_table` |
| `scripts/pm_goal_test_storage.py:1647` | `tx/write_shape` | `selftest:guards:tx_write_extra_member` |
| `scripts/pm_goal_test_storage.py:1644` | `tx/writes` | `selftest:guards:tx_no_writes` |

### New sites and completion negatives

Only these three new literal writer self-checks lack a dedicated negative; the other 13 unhit sites are the reasoned batch-1 entries above. They assert schemas over output built by the checked Storage writer, rather than a caller-supplied image.

| Final path:line | Code | Reason |
|---|---|---|
| `scripts/pm_goal_test_storage.py:907` | `images/current_schema` | CURRENT is built from Storage-issued instance/birth/selection values; no public write API accepts a candidate CURRENT object. Coherent external substitutions are tested at reopen and source acquisition instead. |
| `scripts/pm_goal_test_storage.py:908` | `images/manifest_schema` | Manifest is constructed from the checked segment/sequence/source facts; callers cannot provide a manifest body to commit. Reopen and source-image substitutions have their own negatives. |
| `scripts/pm_goal_test_storage.py:909` | `images/lease_schema` | The writer constructs the lease from checked allocator state and uint64 inputs; no public write API accepts an arbitrary lease object. Rollover and abandonment positives validate this output. |

The completion follow-up adds exact-code negatives for the reachable `index/dataset_unavailable` (`scripts/pm_goal_test_storage.py:1797`) and `index/native_source_schema` (`scripts/pm_goal_test_source.py:527`) sites. It also covers the decoder labels at `scripts/pm_goal_test_source.py:155,192`, which are delegated NUMRULE calls outside the literal require/refuse scanner:

| Self-test id (`index` component) | Expected code |
|---|---|
| `storage_dataset_absent` | `index/dataset_unavailable` |
| `native_current_source_read_id_type` | `index/native_source_schema` |
| `source_canonical_manifest_malformed` | `source/canonical_manifest_codec/numrule/physical_decode` |
| `source_checkpoint_malformed` | `source/checkpoint_codec/numrule/physical_decode` |

The native read-id negative uses the same read already validated by the positive; only its read id changes. The malformed-manifest negative updates the observed byte digest alongside the malformed bytes. No local guard-removal engine or full check-11 proof is asserted.

### 7. Exact Event family registration before projection selection

**Where:** `scripts/pm_goal_test_source.py`, `event_family_registration` and `GenericSource.project`. **Cause:** frame/custody validation alone allowed an off-run unregistered type or mismatched payload schema to be ignored by `select`, so a consumer could advance over it. DG-INT found this with S1 Start and R2 cancellation in one Storage. **Fix:** every retained row must match an exact `(event_type, scope_kind, payload_schema_id)` registration before `select` or `reducer.step`.

The loader reads `Plans/event_family_registry.json` unchanged. Explicit `payload_versions` follow `exact_scope_and_schema_id_no_fallback`; other families use their declared project/application availability and exact top-level schema id. This gate does not add referenced-event inheritance joins. No prefix/alias coercion or TEST_ONLY exemption is introduced. Compiled registrations are an immutable cached set. Registration is not native producer admission.

On a miss, `project` returns `complete=false`, `halt=('reducer/unregistered_record', position, event_id)` and `quarantine` with the registry's `quarantine_without_checkpoint_advance` disposition and the offending type/scope/schema. It stops before that row: first-row failure leaves frontier `None`; a later failure retains only the valid prefix. The reducer and selector never receive the bad row or its suffix. Reporting quarantine does not write to Storage. Successful return shapes are unchanged.

The sample `LifecycleReducer` and source fixtures now use registered `goal_run.*` types and matching schema ids; registered unrelated `run.started`/platform rows still count toward global coverage. Its first supported type is the sample start transition. This preserves the source tests' intended lifecycle and off-run/retention/frame cases without registering synthetic `goal_test.*` families.

**Tests:** the `registration` component adds three positives and five negatives:

| Case | Expected result |
|---|---|
| `registered_record_reaches_reducer` | Registered row is reduced and advances the frontier |
| `registered_application_payload_version` | Explicit application variant is accepted |
| `registered_off_run_advances_global_prefix` | Registered off-run row counts without reducer dispatch |
| `unregistered_type_quarantined` | `reducer/unregistered_record`; no frontier/Storage change |
| `registered_type_wrong_schema_quarantined` | Same halt for another family's otherwise registered schema id |
| `unregistered_off_run_halts_before_filter` | Global gate stops before off-run filtering and the suffix |
| `wrong_schema_off_run_halts_before_filter` | Same gate for mismatched schema on an off-run row |
| `application_schema_has_no_project_fallback` | Explicit scope selector has no fallback |

Every case uses real TEST_ONLY Storage frames and first custody. Negatives verify exact quarantine metadata, processed count, prior frontier, state, absence of reducer/selector calls for the bad row, and unchanged `storage.observe()`.

`fix7/registration-witness.json` compares the unchanged predecessor `GenericSource.project` extracted from `eb903f8d1c` with the fixed method, using the same current unchanged Storage/frame/custody APIs and these real-input cases. The predecessor ACCEPTS all five bad-record cases; the fix passes all eight. This is a predecessor regression comparison, not a local guard-isolation engine or a native evidence claim.

**Current component validation:** all **349 self-tests pass (97 positive, 252 negative)**, including the eight registration cases and 14 fault-matrix rows. R1 passes 1 positive/36 negatives; CF-01 passes 2 positives/41 negatives; the separate reopen run passes 14 rows. NUMRULE loader, guard inventory, Python compilation and whitespace checks exit 0. Exact commands and resource gates are in `fix7/completion-checks.json`; exact registry/source hashes are in `fix7/registration-inputs.json` and each smoke record. The new gate is at `scripts/pm_goal_test_source.py:347–355`; its cases are in `scripts/pm_goal_test_selftest_b2.py:836–918`. `fix7/DG-ADAPTER-B2-guards.json` retains the literal require/refuse inventory; the new if/Halt path is covered by the explicit registration cases and is outside that scanner. The first run caught a missing default in the migrated test helper; it was corrected in `a3696a6e69` and the complete evidence run passed on attempt 2. Failed-attempt logs are retained.

#### Fix-7 compatibility smoke

Eight raw lane runners completed with source commit `a3696a6e69` pinned. The driver recorded the source module and registry SHA-256 in every worktree; all use source `7fa4b81a87853724310ac0a27290b97bbf0cd894262245384a29b4f7f3211b4e` and registry `443ae71d7e6326c3673a409f63950b9f33713c67f43c256fed6efa1c0d03a653`. Full heads/measurements are in `fix7/smoke-summary.json`.

| Lane / lane head | Scratch merged head | Exit | Process seconds | Max RSS (KiB) | Pos / neg attempted | Result |
|---|---|---:|---:|---:|---:|---|
| DG-S `3ec6fd928c` | `92acee6687` | 1 | 467.44 | 382500 | 46 / 154 | 5 fix-7 fixture changes |
| DG-R `70bd7d7f45` | `57b7eb567c` | 1 | 486.18 | 541600 | 46 / 271 | 79 source/fixture cascades from unregistered inputs |
| DG-CF3 `0dfde7bc02` | `e97d276dda` | 1 | 318.44 | 457944 | 23 / 150 | Only prior fix-2 P5-N15 mismatch |
| DG-INT `cd49470d9c` | `cd49470d9c` | 1 | 278.13 | 1153988 | 9 / 33 | 2 mixed-Storage positives blocked by v1 Goal source |
| DG-CF1 `3058f80fb3` | `24eb848de6` | 0 | 171.81 | 332068 | 6 / 196 | PASS |
| DG-CA `f87dbe1f30` | `159086b669` | 0 | 386.11 | 203864 | 32 / 388 | PASS |
| DG-U `bc03430ed2` | `635b0393e2` | 1 | 0.65 | 53428 | 0 / 0 | 4 old support pins refuse before cases; external-selection run below |
| DG-CF2 `2637ad20ff` | `d4e2b4cdc0` | 0 | 982.89 | 678500 | 11 / 90 | PASS |

The first smoke attempt lost its runner without an exit status before DG-S completed. Its partial log is retained in `fix7/interrupted-attempt1/`; the same pinned inputs completed on attempt 2. Every oracle ran under `MemoryMax=2G`, `MemorySwapMax=0`; the guard pauses its child below 6 GiB available and resumes at 7 GiB. Raw individual exits are reported above; the serial driver itself exits 0 after recording them.

**Current DG-U functional diagnostic:** the untouched lane, selected through `fix7/smoke/dg-u-b2-selection.json` with only the four adapter support hashes updated, ran all **21 positives/480 negatives and 29 matrix rows**. All matrix rows pass. Exit 1 contains exactly the same seven fix-2 fixture/counter failures as the initial delivery: U1 pack ordering, U4 stale-checkpoint injection and five U5 checkpoint injections. There are no new fix-7 DG-U failures. `verify_selection` still verifies every hash and the edition; the historical selection and lane files remain untouched. The current external selection SHA-256 is `7b09b1c4095064594662bf1035dbb3592ed5b9ea260932e08b089b8382b54c16`.

The diagnostic took 519.18 process seconds, max RSS 105816 KiB (520.46 wrapper seconds). It started at 8.108 GiB, paused at 5.968 GiB at 07:50:09Z and resumed at 7 GiB at 07:51:46Z. Exact cases, expected/observed results and proposed fixes are in `fix7/DG-U-failure-classifications.json`; complete results are in `fix7/smoke/dg-u-compat.json` and `fix7/dgu-completion-checks.json`.

#### Fix-7 lane/source changes (lane files remain unchanged)

**DG-S:** five affected cases use `scripts/pm_goal_dg_s_oracles.py:630,638` (`extra_event`). The default `goal_test.off_run` is unregistered, and the explicit `goal_run.blocked` fixture uses `TEST_ONLY:other.v1`. Create new candidates with registered pairs before Storage appends them. `DG-S-registered-fixtures.patch` changes the default to `run.started` and selects its exact URI or the blocked-v2 schema as appropriate. Keep the existing frame, retention, frontier and unsupported-reducer expectations.

| Case | Old expected | Observed with gate |
|---|---|---|
| `S3/unique_start_projection_over_whole_global_prefix` | `PASS` | `s3/complete` |
| `S3/authenticated_retention_gap_continues` | `PASS` | `s3/gap_continues` |
| `S3/frontier_stops_before_defect` | `PASS` | `s3/halt_before_defect` |
| `S3/unsupported_same_run_row_halts` | `reducer/unsupported_same_run:goal_run.blocked` | `reducer/unregistered_record` |
| `S5/replay_halts_on_unsupported_row` | `projector/reducer/unsupported_same_run:goal_run.blocked` | `projector/reducer/unregistered_record` |

Exact old/new candidate construction (`fix7/DG-S-registered-fixtures.patch`):

```diff
--- a/scripts/pm_goal_dg_s_oracles.py
+++ b/scripts/pm_goal_dg_s_oracles.py
@@ -627,7 +627,7 @@

 # ------------------------------------------------------------------ S3

-def extra_event(world, tag, *, run=None, project=None, event_type='goal_test.off_run', append_receipt=True):
+def extra_event(world, tag, *, run=None, project=None, event_type='run.started', append_receipt=True):
     c = world.ctx
     event = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
                  event_id='TEST_ONLY:%s:%s' % (event_type, tag), event_type=event_type,
@@ -635,7 +635,10 @@
                  node_id=None, attempt_id=None, actor_ref='TEST_ONLY:actor:other', requested_account_ref=None,
                  effective_account_ref=None, occurred_at_utc='2026-11-11T12:00:00Z', producer_sequence_id=None,
                  correlation_id='TEST_ONLY:correlation:' + tag, causation_event_id=None, parent_event_id=None,
-                 idempotency_key='TEST_ONLY:key:' + tag, payload_schema_id='TEST_ONLY:other.v1',
+                 idempotency_key='TEST_ONLY:key:' + tag, payload_schema_id={
+                     'run.started': 'https://puppetmaster.local/schemas/event_payloads/run_started/2.0.0',
+                     'goal_run.blocked': 'pm.goal_runtime_event.goal_run_blocked.schema.v2',
+                 }[event_type],
                  payload=dict(qualification=QUALIFICATION, tag=tag), payload_ref=None, redaction_profile='no_secrets',
                  replay_policy='dedupe_by_idempotency_key',
                  migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,

```

**DG-R:** 79 affected cases share source prerequisites. `scripts/pm_goal_dg_r_world.py:997–1012`, especially line 1008, emits `goal.cancelled` with `pm.goal_runtime_event.goal_cancelled.schema.v1`. The unchanged registry registers project `goal.cancelled` as `pm.goal_runtime_event.goal_cancelled.schema.v3`. That existing v1 record is quarantined even when R5 would filter it off-run. R2 has 1 affected case, R4 27, R5 15 and R6 36. The complete case-by-case expected/observed table and classification is `fix7/DG-R-failure-classifications.json`.

For intentional v1 inputs, the new expected behavior is `unavailable/UNSUPPORTED_RELEVANT_EVENT/reducer/unregistered_record`, rather than successful projection. `fix7/DG-R-v1-quarantine-regressions.patch` adds explicit started/no-start checks for that behavior using the existing world. Positive projection, historical-row setup and later-guard/crash tests need a fresh, fully constructed registered current Goal event and matching owner originals. Preserve retained v1 bytes; replacing only their schema-id label does not construct a valid v3 source. This is a lane/source-owner adoption dependency, not an adapter exception or a registry edit performed here.

A second fixture issue is `scripts/pm_goal_dg_r_oracles.py:672`: old `payload_schema_id='pm.goal_runtime_event.%s.schema.v3' % kind.split('.')[1]` fabricates IDs such as `pm.goal_runtime_event.started.schema.v3`. The current exact IDs include `goal_run_`, and stopped/blocked/replanned use v2. `fix7/DG-R-registered-offrun-fixtures.patch` replaces that expression with the explicit type-to-schema map for newly built fixture events. This is also required before downstream negatives can isolate their intended defect.

The 79 observations are 63 early project-unavailable results, 8 explicit wrapped unregistered-record halts, 5 exception-oracle `ACCEPTED` labels, 2 missing `child_exit` errors and 1 missing-checkpoint error. In the latter cases, quarantine prevented the publication/crash step from being reached. The `ACCEPTED` labels mean the exception-oriented test returned without its expected exception after the projector returned unavailable; they do not show publication of an unregistered row. Rebuild those test bases from registered source before testing their later guards.

**DG-INT:** at `cd49470d9c`, these two positives use the same R2 v1 Goal source:

| Case | Observed | Location |
|---|---|---|
| `INT/s1_start_r2_cancel_one_storage_r2_consumer_and_projector` | `int/published` | `scripts/pm_goal_dg_int_oracles.py:148–149` |
| `P4/native_v7_s2_start_r2_cancel_one_storage_r2_v7_consumer` | `cutover/no_checkpoint` | `scripts/pm_goal_dg_int_oracles.py:383–388` |

Keep the existing `P4/r2_goal_cancelled_v1_event_is_unregistered` negative (it passes). Replace the two positive source graphs with a genuine registered current Goal source and require projection success before cutover. With retained v1 source, assert quarantine and no checkpoint instead. `fix7/DG-INT-failure-classifications.json` records the exact cases and dependency.

**DG-CF3:** only the earlier fix-2 P5-N15 mismatch remains; its existing exact patch is still required. **DG-U:** the old support-pin preflight and fix-2 checkpoint/pack-log changes remain; its current compatibility diagnostic is recorded in the smoke table. All proposed lane patches are unapplied, and patched complete lane runs remain NOT_RUN here. The adapter gate stays strict.

#### Fix-7 source and evidence hashes

| Path | SHA-256 |
|---|---|
| `scripts/pm_goal_test_source.py` at `a3696a6e69` | `7fa4b81a87853724310ac0a27290b97bbf0cd894262245384a29b4f7f3211b4e` |
| `scripts/pm_goal_test_adapters_selftest.py` at `a3696a6e69` | `de6fed49ada57575a6acebc333b4109f14a0e49bf13e712be6a13f2c7e8e56d5` |
| `scripts/pm_goal_test_selftest_b2.py` at `a3696a6e69` | `7301183686959fad4dc7956f76daecbf9f6a67a4bb8ab728d69cfd478e3d3144` |
| `Plans/event_family_registry.json` at `a3696a6e69` | `443ae71d7e6326c3673a409f63950b9f33713c67f43c256fed6efa1c0d03a653` |
| `fix7/selftest.json` | `b4f6abd7ba977c3c1da747268d2f788075591aa7d5e5aa5f5b4776df3dbc59f5` |
| `fix7/r1.json` | `92004d758783a993d438ae76f3280205a97631b2deca1ef0a46b001d535efa28` |
| `fix7/cf01.json` | `0b43f4a9ca3adb03a20e87339599ad9698bf5f279220551955e0b7c26732725f` |
| `fix7/reopen.json` | `c2099373baeccc7d5cd807d2d85c27f27e3bef0f1a111090f0ad3073b3474e4b` |
| `fix7/registration-witness.json` | `bda7febf8c7858e5586dd75c7e4c54d65734a9d3d281cd7f6e9dfdc6ceb93619` |
| `fix7/registration-inputs.json` | `3822cbecbd7ec0e17cf1f004bcc3d18136b60aab8663f70703406a56472c039a` |
| `fix7/smoke-summary.json` | `38c4034daaca2a302350c10ff40f8ac9dd6f9c093d979a2084b198d50ca402e3` |
| `fix7/all-raw-failure-classifications.json` | `62d6005c7be86d39a180034ff0a932f3c6006eab1038878cdd48eef18bf32e2e` |
| `fix7/DG-S-failures.json` | `06e2024c1f2a8a0704d9bd9108048ae240cb66b22534850f0c98d19f329d3df8` |
| `fix7/DG-R-failure-classifications.json` | `d73cd9a47a10d01975d3dbb090330f756a71cfb24c0a49dff3002c95a8c5449c` |
| `fix7/DG-INT-failure-classifications.json` | `84bb77fbb92d0d0c636870bf84c852145fcd0fba23ad19bcbafcd8c76c3cd25d` |
| `fix7/adapter-fix7.patch` | `3bfa258433b4094304ba27e2868c1e02b3ef88ee09fbf281f0c7f517d862b86c` |
| `fix7/smoke/dg-u-compat.json` | `116a4b20ddb4194d8e7f743f4b239ff0ee52b3587fe9131da2e5775dbd00deb8` |
| `fix7/smoke/dg-u-b2-selection.json` | `7b09b1c4095064594662bf1035dbb3592ed5b9ea260932e08b089b8382b54c16` |
| `fix7/DG-U-failure-classifications.json` | `abdef1af8f70974ea0f6974d8f0a2aea3de6da0771bf0dd4d338287599544b4f` |
| `fix7/dgu-completion-checks.json` | `30444840c4f1a03fc46e6e01d7fdc4707d13574ab75589e4a25f0e1e614ed4ec` |

The final `fix7/SHA256SUMS` and root `SHA256SUMS` bind all new logs, patches, complete row results and delivery metadata. Earlier hashes/tables below remain the initial fixes 1–6 snapshot; no earlier captured bytes are rewritten.


## Compatibility smoke (initial fixes 1–6 delivery)

Seven required lane runners execute serially from their pinned lane heads with the adapter branch merged locally (`--no-ff`). Scratch merges are never pushed. Each process runs under `MemoryMax=2G`, `MemorySwapMax=0`, after the existing driver sees at least 7 GB available. The foreground waiter is `long-job wait dg-adapter-b2-smoke --timeout 1500`, rearmed on 124. Rows below distinguish checker failures from adapter API compatibility.

| Lane / lane head | Scratch merged head | Exit | Seconds | Max RSS (KiB) | Pos / neg | Result |
|---|---|---:|---:|---:|---:|---|
| DG-CF3 `0dfde7bc02` | `48f174d715` | 1 | 819.49 | 457968 | 23 / 150 | P5-N15: expected stage/seed_reused, actual stage/anchor_collision; fix-2 lane test change |
| DG-CF1 `3058f80fb3` | `3e13a1818e` | 0 | 348.1 | 332184 | 6 / 196 | PASS; no failures |
| DG-CA `f87dbe1f30` | `8663e269f0` | 0 | 559.04 | 203536 | 32 / 388 | PASS; no failures |
| DG-U `bc03430ed2` | `bf14abc425` | 1 | 0.64 | 53336 | 0 / 0 | Preflight selection_pin_mismatch for four adapter support files; no cases executed; diagnostic below |
| DG-CF2 `2637ad20ff` | `3a379ae305` | 0 | 854.31 | 679024 | 11 / 90 | PASS; no failures |
| DG-S `3ec6fd928c` | `4c889adf82` | 0 | 913.9 | 382908 | 46 / 154 | PASS; no failures |
| DG-R `70bd7d7f45` | `c580190af0` | 0 | 1210.15 | 549516 | 46 / 271 | PASS; no failures |

All raw failure records are preserved. Full heads, classifications and resource measurements are in `raw-smoke-summary.json`; raw logs/JSON are under `smoke/`. Five raw lane runners pass. DG-U requires an explicit compatible support selection before its functional smoke can run. The DG-CF3 negative requires the exact setup change below.

### DG-U baseline and external-selection diagnostic

These runs use the untouched lane source at `bc03430ed2`; the compatibility worktree includes adapter runtime `783caeaf5f`. `dgu-diagnostic-checks.json` records the wrapper commands, memory gates and exits. Both runs started above 8 GiB under the 2 GiB cap, with no pause.

| Run | Exit | Process seconds | Max RSS (KiB) | Cases attempted (pos / neg) | Matrix | Result |
|---|---:|---:|---:|---:|---:|---|
| Original lane baseline | 0 | 316.18 | 113008 | 21 / 480 | 29 pass | All cases pass; original support pins verified |
| Batch 2, external compatibility selection | 1 | 250.36 | 104632 | 21 / 480 | 29 pass | 7 expected fix-2 lane changes: 1 ordering assertion, 6 checkpoint-drift setups |

The compatibility run passes 20 positive and 474 negative cases, plus all 29 matrix rows. Its failures are preserved in `smoke/dg-u-compat.json`; `compatibility-failure-classifications.json` classifies every raw/diagnostic failure with the source location and exact patch. It uses the original checker and all original expectations. This is not a run of the patched lane.

## Exact lane-test changes for fix 2

No lane file was edited here. The integration applies the following changes to the pinned lane versions, then reruns their complete runners.

### DG-CF3 P5-N15

**Where:** `scripts/pm_goal_dg_cf3_oracles.py:880–887`, lane `0dfde7bc02`. **Cause:** the first stage writes a redb checkpoint. Before fix 2 that changed the token, so a reused seed produced a different anchor and reached `stage/seed_reused`. Now the token stays stable; the same seed and token hit `stage/anchor_collision` in `pm_goal_dg_cf3_projector.py:668–670` before the publisher's seed guard at 824. The required stable token changes the refusal order; no adapter API call broke.

**Fix:** import the existing reopen helper after line 40, and append a separate valid off-scope probe after line 885 so the second stage has a different seglog token while retaining the reused seed. Keep the expected `stage/seed_reused`. Exact old/new source is in `DG-CF3-stable-token-test.patch`:

```diff
--- a/scripts/pm_goal_dg_cf3_oracles.py
+++ b/scripts/pm_goal_dg_cf3_oracles.py
@@ -38,6 +38,7 @@

 import pm_goal_test_numrule as NR
 import pm_goal_test_storage as S
+import pm_goal_test_reopen as RO
 import pm_goal_test_owner_adapters as A
 from pm_goal_test_source import SourceRefusal
 import pm_goal_dg_cf3_world as W
@@ -883,6 +884,7 @@
         scope = sc['r1']
         g1 = stage(c, scope)
         seed = c.checkpoint(scope)['generations'][g1]['seed_hex']
+        RO.run_protocol(st, RO.probe_spec('p5-n15'))
         c.projector.project_prefix(scope, 'stage', request_edit=lambda r: dict(r, seed_hex=seed))
     cpu.negative('P5-N15', 'P5', 'stage/seed_reused', seed_reused, 'seed reused from an existing generation')

```

This patch is proposed integration source, not an applied lane change or a passing patched-run claim. The probe changes one legitimate source fact between the two stages; the defect remains reuse of the issued seed.

### DG-U support-file pins

**Where:** `Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json:33,37,41,45`, checked by `scripts/pm_goal_dg_u_oracles.py:2886–2897`. **Cause:** the unmodified lane selects batch-1 adapter bytes, so its CLI refuses `selection_pin_mismatch` before running a single oracle against batch 2. **Fix:** at integration, select an explicit compatibility successor with these batch-2 support hashes, preserving the historical selection's bytes. This is support-pin integration work, not a callable API break. It is caused by the intentional adapter update as a whole, rather than solely the stable-token semantic change.

| Selection path / line at `bc03430ed2` | Adapter member | Old SHA-256 | New SHA-256 |
|---|---|---|---|
| `Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json:33` | `scripts/pm_goal_test_storage.py` | `51bbe652c9a5cb40aa689e832ec9bc4adb29bf78abeeae4bbd0fc8c4423fd175` | `b5b90ebb4af5d443134a9b3340f7978f924dff64609e3e5097f79371a086ec2b` |
| `Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json:37` | `scripts/pm_goal_test_owner_adapters.py` | `d58ae4ea06153a03101cca76af5eb985e0277e5c468103f01e46530e58893222` | `f8f5b342be1629e14b21aef2f8818752ee358fea51e506e33c578eb74895fb40` |
| `Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json:41` | `scripts/pm_goal_test_source.py` | `919eeb6f70d7f132012c49c8e304824d34cba6193d6a862db3df5017a4142657` | `dffba4e22821236b4d2336d19d150718a13fd8994a577689378fe6b5c0a7f20e` |
| `Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json:45` | `scripts/pm_goal_test_reopen.py` | `acec5fe8cf83792506c3a4411f546353db30141f170e39cf342c7b48fd5be927` | `43cf15b9fc61b614440568fb528379671f079bc395d07c4646e4ab0e92f0d4c0` |

`smoke/dg-u-b2-selection.json` is an external TEST_ONLY compatibility copy with only those four hash changes. `dgu_compat.py` points the untouched lane module's `SELECTION` at that copy and invokes its original `main`; `verify_selection` still verifies every member/support hash and the edition. No hash check is disabled, and no repository selection or lane file is edited. These four rows suffice only for the untouched diagnostic runner; when the lane applies test/counter changes, its new explicit selection must also pin the exact updated oracle/owner bytes. The wrapper and its output qualify the experiment explicitly; they do not admit or restamp a historical selection.

The original lane baseline passes 21 positives, 480 negatives and all 29 matrix rows. With the external support-pin copy (SHA-256 `0b4f78d0d742c97cdaafc51d47cb62c63ec5871914cb016f0d192ec05d52372d`), the untouched batch-2 runner reaches every case and has seven fix-2 fixture/observation failures, detailed below. The 29 matrix rows all pass. The four pin differences are recorded in `smoke/dg-u-selection-changes.json`; no lane or historical selection file changed.

### DG-U U4/N/stale_checkpoint_at_release

**Where:** `scripts/pm_goal_dg_u_oracles.py:906–911` at `bc03430ed2`. **Cause:** `storage.new_seed()` is a redb-only write and intentionally leaves the canonical seglog token unchanged under fix 2. **Fix:** replace the injected seed write at line 910 with a valid seglog append. Keep expected `dgu/inspect/final_checkpoint`. Exact old/new source is in `DG-U-stable-token-test.patch`:

```diff
--- a/scripts/pm_goal_dg_u_oracles.py
+++ b/scripts/pm_goal_dg_u_oracles.py
@@ -907,7 +907,8 @@
 def u4n_checkpoint(d):
     w, g, adm, r = _inspect_setup(d)
     holder = {}
-    inject(w, 'inspect', 'before_release', lambda w_, ctx: w_.storage.new_seed(), holder)
+    inject(w, 'inspect', 'before_release',
+           lambda w_, ctx: RO.run_protocol(w_.storage, RO.probe_spec('dgu-stale')), holder)
     return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission']), holder


@@ -2310,7 +2311,7 @@


 def _m_checkpoint(w, g, ag, ctx):
-    w.storage.new_seed()
+    RO.run_protocol(w.storage, RO.probe_spec('dgu-fence-stale'))


 def _m_candidate(path):
```

The patch is supplied for the lane; it was not applied to its files. Its complete patched runner remains NOT_RUN here.


### DG-U generated U5 checkpoint cases

**Where:** `scripts/pm_goal_dg_u_oracles.py:2312–2313` (`_m_checkpoint`), registered for inspection at 2472. **Cause:** the shared mutator calls `storage.new_seed()`, so five more generated negatives make no checkpoint change under fix 2. Each was ACCEPTED with effects preserved, where the old fixture expected `dgu/inspect/final_checkpoint`:

- `U5/F/inspect/after:generic_source/checkpoint`
- `U5/F/inspect/after:source_audit/checkpoint`
- `U5/F/inspect/after:progress/checkpoint`
- `U5/F/inspect/after:body_receipt/checkpoint`
- `U5/F/inspect/before_release/checkpoint`

**Fix:** at line 2313, old `w.storage.new_seed()` → new `RO.run_protocol(w.storage, RO.probe_spec('dgu-fence-stale'))`. The combined `DG-U-stable-token-test.patch` above includes this helper change and U4's change. Keep every expected refusal code.

### DG-U U1/P/agent_large_reference_route

**Where:** `scripts/pm_goal_dg_u_oracles.py:244–253`, fed by generation logs in `scripts/pm_goal_dg_u_owners.py:393,661`. **Cause:** `u1/pack_before_reference` requires `pack_gen[ref['id']] < tx_gen[v['tx']]`, but both logs record seglog `manifest_generation`. The pack and its referencing row are redb writes, so fix 2 gives them the same seglog generation. The code still puts and reads back the pack before publishing its reference (`pm_goal_dg_u_owners.py:659–662`). This assertion's counter no longer measures that ordering; no adapter API change is needed.

**Fix:** retain the strict `<` assertion and record `commit_generation` in both logs. Exact old/new source (`DG-U-commit-generation-logs.patch`):

```diff
--- a/scripts/pm_goal_dg_u_owners.py
+++ b/scripts/pm_goal_dg_u_owners.py
@@ -390,7 +390,7 @@

     def transact(self, writes, **kwargs):
         tx = self.storage.transact(writes, **kwargs)
-        self.tx_log.append(dict(tx_id=tx['tx_id'], generation=self.storage.manifest_generation,
+        self.tx_log.append(dict(tx_id=tx['tx_id'], generation=self.storage.commit_generation,
                                 keys=[[x['table'], x['key']] for x in writes]))
         return tx

@@ -658,7 +658,7 @@
         if len(msgpack(row, 'dgu/physical/row')) > CAP:
             ref = w.storage.put_pack(raw, MEDIA)            # durable before any reference is returned
             w.storage.read_pack(ref, expected_media_type=MEDIA)  # verified before the referencing row publishes
-            w.pack_log.append(dict(blake3=ref['blake3'], generation=w.storage.manifest_generation, family=family, key=key))
+            w.pack_log.append(dict(blake3=ref['blake3'], generation=w.storage.commit_generation, family=family, key=key))
             row = dict(row, record=None, payload_ref=dict(id=ref['blake3'], size=ref['byte_size'], media_type=MEDIA))
             require('dgu/physical/compact_row_oversize', len(msgpack(row, 'dgu/physical/row')) <= CAP)
         w.update_bank.validate(PHYS_URI, row, 'dgu/physical/row')
```

All seven functional DG-U failures are therefore lane-test changes caused by fix 2: one ordering assertion and six checkpoint-drift setups. The lane's original baseline passes all 501 cases and 29 matrix rows. No adapter API break was found across the seven required lanes. The lane patches remain unapplied here; complete runs after integration remain required.

## Write detectors: manifest_generation → commit_generation

A no-durable-write assertion must observe `commit_generation` (or the whole `storage.observe()`), since `manifest_generation` now intentionally ignores redb-only writes. Keep manifest generation in canonical source selections, first receipts, reservation-selected manifests and their semantic joins. The following locations are pinned by full lane head in `lane-generation-sites.json`.

| Lane / pinned head | File and lines | Exact migration |
|---|---|---|
| DG-U `bc03430ed2` | `scripts/pm_goal_dg_u_oracles.py:221,223,225,768,770,1023,1025` | Replace `.manifest_generation` with `.commit_generation` at each snapshot/comparison. |
| DG-U | `scripts/pm_goal_dg_u_oracles.py:2530,2695` | Retain `manifest_generation=w.storage.manifest_generation` and add `commit_generation=w.storage.commit_generation` to the summary; compare both `again['manifest_generation'] == after['manifest_generation']` and `again['commit_generation'] == after['commit_generation']` at second re-entry. |
| DG-U | `scripts/pm_goal_dg_u_owners.py:393,661` | Durable transaction/pack logs currently record `generation=…manifest_generation`; record `generation=…commit_generation` so the log sees redb/pack writes. |
| DG-S `3ec6fd928c` | `scripts/pm_goal_dg_s_oracles.py:183,188,395,398,427,434,814,817` | Replace `.manifest_generation` with `.commit_generation` in the no-write detector snapshots/comparisons. Rename `manifest_unchanged` to `commit_unchanged` at 434 and in its two consumers at 511 and 513. |
| DG-S | `scripts/pm_goal_dg_s_readers.py:766,768,783,792` | Replace `storage.manifest_generation` with `storage.commit_generation`, including the passive-read effect delta; keep `cell_generation` checks. |
| DG-S | `scripts/pm_goal_dg_s_start.py:1337,1355` | Replace `storage.manifest_generation` with `storage.commit_generation` in recovery's no-write check. |
| DG-CF1 `3058f80fb3` | `scripts/pm_goal_dg_cf1_oracles.py:251,255` | Replace `w.storage.manifest_generation` with `w.storage.commit_generation` for lost-ack replay. |
| DG-CF3 `0dfde7bc02` | `scripts/pm_goal_dg_cf3_oracles.py:1262,1266` | Replace `st.manifest_generation` with `st.commit_generation` in the before/after no-effect tuple. |
| DG-CF3 | `scripts/pm_goal_dg_cf3_oracles.py:1710` | Retain `manifest_generation=st.manifest_generation` and add `commit_generation=st.commit_generation` to the child read summary. At 1779 (the non-stage second-re-entry branch), additionally check `back2['manifest_generation'] == back1['manifest_generation']` and `back2['commit_generation'] == back1['commit_generation']`; the current matrix compares checkpoint/rows/events/custody only. |
| DG-CA `f87dbe1f30` | `scripts/pm_goal_dg_ca_crash.py:88,152` | Retain the manifest field and add `commit_generation=storage.commit_generation` to the summary; retain the manifest equality and add `assert second['commit_generation'] == first['commit_generation'], 'second re-entry changed state'`. |
| DG-CB `ea2dc3d11d` | `scripts/pm_goal_dg_cb_crash.py:104,196` | Retain the manifest field and add `commit_generation=w.storage.commit_generation` to the summary; retain the manifest equality and add the same second-re-entry `commit_generation` assertion. |
| DG-R `70bd7d7f45` | No direct manifest-counter write detector | Remove the token-exclusion workaround described below; no counter assertion to replace. |
| DG-CF2 `2637ad20ff` | No direct manifest-counter write detector | Remove the token-exclusion workaround described below; no counter assertion to replace. |
| DG-CA3 `425d193e77` (read-only inventory only) | No direct manifest-counter write detector | Manifest occurrences describe canonical selection, reservation or publication locators and retain their meaning. |

`lane-generation-sites.json` also includes legitimate manifest-generation occurrences that must stay: DG-S's first-receipt locator, DG-CA's assignment-selected manifest joins, DG-CF3 backup/restore coherence and canonical selections. These are not durable-write counters.

## Adoption by each DG lane

- **DG-CF2:** retire `seglog_frontier`'s token exclusions in `scripts/pm_goal_dg_cf2_consumer.py:84–92` and compare the entire durable token. For CF-06, take `complete_preappend_storage_source` and `OriginalEventPrerequisite.complete_current_source` from `EventRecordIndexSource(storage).native_current_event_source(read_id)`, rather than building a root from lane-owned TEST_ONLY Storage bytes.
- **DG-R:** retire `log_token`'s exclusions in `scripts/pm_goal_dg_r_projector.py:63–80` and compare the entire durable token.
- **DG-CF3:** retire `SEGLOG_FENCE_EXCLUDED` and the filtering at `scripts/pm_goal_dg_cf3_projector.py:67,224–226`; compare the entire durable token. Apply P5-N15's exact test update above.
- **DG-CA:** replace `scripts/pm_goal_dg_ca_assignment.py:83` (`LeasedStorage`) with `class LeasedStorage(S.TestOwnerStorage): pass`. The base raises `S.StorageRefusal`, so the harness catches that alongside `A.AdapterRefusal`. `SeglogControlOwner.records()` at `scripts/pm_goal_dg_ca_assignment.py:234` reads `storage.canonical_images()` and `storage.lease()` rather than the cell `seglog_sequence_allocator`: the base lease is not a redb cell. Keep names and refusal codes.
- **DG-CA3:** C4 inspection can replace the lane's `pm_goal_dg_ca3_index.py` source with `EventRecordIndexSource.read`, `lookup` and `read_token`. This is an integration item, separate from the seven required compatibility runners.
- **DG-U:** select an explicit batch-2-compatible successor support-pin set (retain the historical selection unchanged), remove the digest-safe recorder workaround and pass hostile text directly to the recorder. Apply the U4/U5 checkpoint-mutator updates and the pack-order/write-detector counter changes above.
- **DG-S / DG-CF1 / DG-CB:** apply their write-detector changes above; existing public adapter APIs remain available.
- **Shared adapter protocol:** the integration updates `Plans/goal_own_c_contracts/protocol.md` to state that second re-entry leaves both seglog `manifest_generation` and `commit_generation` unchanged, and that the shared adapter holds canonical images, the lease/fence and index read source. This branch does not edit that Plans document.

After adoption, rerun each affected lane. A compatibility pass with old lane workarounds does not prove the new source paths have been adopted.

## Checks and exits

Runs at tests-only head `3e20ffded403e19e2120053dcba7b9d3dc6b2b37`; runtime/demo/NUMRULE bytes equal smoke head `783caeaf5f`. Python/package versions are in `python-environment.json`. `completion-checks.json` records exact commands, timing, memory gates and exits. Initial runs were serial under `MemoryMax=2G`, `MemorySwapMax=0`, start at 8 GiB, pause below 6 GiB and resume at 7 GiB. No pause occurred.

| Check | Exit | Measured wrapper seconds | Result |
|---|---:|---:|---|
| `selftest` | 0 | 24.01 | 341 pass: 94 positive, 247 negative; all 204 baseline case ids retained plus 137 new; includes 14 fault-matrix rows |
| `r1` | 0 | 88.03 | 1 positive, 36 negatives; whole scoped-routing qualification |
| `cf01` | 0 | 4.0 | 2 positives, 41 negatives; complete original producer paths |
| `numrule` | 0 | 2.0 | Pinned NUMRULE loader imports/describes unchanged blobs |
| `reopen` | 0 | 22.01 | 14 fresh-process fault/re-entry rows pass; both generation counters checked |
| `guard-inventory` | 0 | 2.0 | 257 literal sites, 241 with exact-code negatives; 62-entry closure table verified |
| `py_compile` | 0 | 2.01 | Eight adapter/test files compile |
| `diff-check` | 0 | 2.0 | No whitespace errors in the tracked worktree |

`selftest.log`, `r1.log`, `cf01.log`, `reopen.log` and the other named logs contain the process measurements; wrapper seconds include monitoring overhead. The guard closure formatter ran with exit 0. A final staged `git diff --check` is performed before the report commit. No Plans/shards/index or governance artifact changed, so no governance regeneration or reseal is performed.

## SHA-256

| Code file at tests head `3e20ffded4` | SHA-256 |
|---|---|
| `scripts/pm_goal_test_storage.py` | `b5b90ebb4af5d443134a9b3340f7978f924dff64609e3e5097f79371a086ec2b` |
| `scripts/pm_goal_test_source.py` | `dffba4e22821236b4d2336d19d150718a13fd8994a577689378fe6b5c0a7f20e` |
| `scripts/pm_goal_test_owner_adapters.py` | `f8f5b342be1629e14b21aef2f8818752ee358fea51e506e33c578eb74895fb40` |
| `scripts/pm_goal_test_reopen.py` | `43cf15b9fc61b614440568fb528379671f079bc395d07c4646e4ab0e92f0d4c0` |
| `scripts/pm_goal_test_demo_r1.py` | `6fffa474339dff3def2931463fb17b6c3b794a9f1e137f97c40357fac06c4f51` |
| `scripts/pm_goal_test_demo_cf01.py` | `ec3f8dd3e7df579235f300958a750894106e8f06a3f351b9f6a7b3990f1994e8` |
| `scripts/pm_goal_test_adapters_selftest.py` | `f051e394afdd83f25317a754efcd0db1a8e6c5797913dc0127e6698ca5995309` |
| `scripts/pm_goal_test_selftest_b2.py` | `51c118c780637e25bba1cadcc4b9274529d2a6edc8761e0f58b6fa682e296e9c` |
| `scripts/pm_goal_test_numrule.py` | `14909c75db33e23137e76abd24893fa80ca247184a150ffa81907f483df06368` |

| Principal evidence path (under the evidence root) | SHA-256 |
|---|---|
| `selftest.json` | `05215b71bb8b2c2f29e09d366620ab2907abe85db81bfd2742ae10b4c7973b2b` |
| `baseline-selftest.json` | `1c381dd6a23f9c8d2d8917412a7a5a9b2ec4110dab2c61192458075afe97a17c` |
| `r1.json` | `bdf102966fb3ef5857c5f9c2bc8e81dc9ca058f4150ce61a25e642758bd129be` |
| `cf01.json` | `5c6c4fcbec7162540778d286b8e946132d51d4c81b480a42b1c05a43c5761d65` |
| `reopen.json` | `c2099373baeccc7d5cd807d2d85c27f27e3bef0f1a111090f0ad3073b3474e4b` |
| `DG-ADAPTER-B2-guards.json` | `e5aff572c8f69a7638e6c53985655b3ef315d654643aa1b722f0344ae7bfbeb1` |
| `batch1-guard-closure.json` | `5f4511cf5e57ec6d42ae6c5d0e1e6b747c21b4464dbe31d3f23e795a4df723b3` |
| `guard-site-counts.json` | `7511be0a241913a36b39c14b5061e6ec3c3e5dc21cbe5292c5ed0333d14d0e18` |
| `raw-smoke-summary.json` | `d7490c5ea2a33bd3ecf2f2330b1b2a6215f6be942b33fe1161f0fe7edcd42fd3` |
| `compatibility-failure-classifications.json` | `e20386b97fea96a4950acfac636847825b9c71fb6d796842717fd55e3a177c32` |
| `completion-checks.json` | `bc0d9a81156ec0852002453448b00fa12837a5187e6c596b108c5bab18725a31` |
| `dgu-diagnostic-checks.json` | `f9ea2f793a66d473e385e79904a0810e803a70cb90a5b2543fb112df66a91e8a` |
| `smoke/dg-u-baseline.json` | `0e19e49ad2de200919e0fe25de844afe39d5af03e89942758663e2c0c20a5b0a` |
| `smoke/dg-u-compat.json` | `56c9a202d3e2d0faedb8609cf15e5b75d622226e02590def68c2fe523a7ffb6e` |
| `smoke/dg-u-b2-selection.json` | `0b4f78d0d742c97cdaafc51d47cb62c63ec5871914cb016f0d192ec05d52372d` |

`SHA256SUMS` supplies path plus SHA-256 for every delivered evidence file, including this report, all raw smoke results/logs, compatibility selection, exact patches and run drivers. The report does not embed its own hash; it is bound by that manifest. `smoke-runtime-equivalence.json` records the byte equality of the runtime modules between `783caeaf5f` and the completion tests head.

**Everything stays TEST_ONLY. Native evidence stays NOT_RUN and is a separate claim.**

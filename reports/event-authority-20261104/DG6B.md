## Whole-branch authority audit restored in round 6

The complete nineteen-family search, current-source hashes and matching lines, negative evidence, newly authored bindings, 26 existing IDs, and DL-045/DL-076 premise/application pairs are in [DG6B.authority-audit.json](DG6B.authority-audit.json), SHA-256 `a257be4cc03ffa9fc291f0938c5fc755886c254ecd3c45521793b995a8903a9e`. It searches fetched origin/main `c76d1cf756d504a91655a978dcee9f3ead7562d3`; the later origin/main maintenance changes preserve DG6B behavior and all consumed selected definitions; the audit records that recheck. Repair-round history below is separate from this whole-branch inventory.

# DG6B — review round 5, prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Input: `dd694fd1fd24e3317c24e9297d6fafed41439c2c`. Fixed contract commit: **`51aff0e2358dc21bb2a822556b7b745315c6d567`**. Worker: DG6B-FIX5, VM. First of the two authorized technical rounds after the extra round. Native execution: **NOT_RUN**.

Both cycle-5 blockers are fixed for all nineteen families. The oracle cell returns PARTIAL → PASS; all other cells remain unchanged: **171 PASS / 38 PARTIAL / 19 ABSENT → 190 PASS / 19 PARTIAL / 19 ABSENT**, zero CONFLICT. Membership is ABSENT, retention remains PENDING_RETENTION_DECISION/PARTIAL, and every disposition remains UNDISPOSITIONED. This is static contract preparation.

## Review round 5: findings and responses

**C5-B1 — fixed (`51aff0e2358dc21bb2a822556b7b745315c6d567`).** Where: `scripts/pm-dg6b-event-contracts.py:123` (`history_contract`), `:481` (`append_contract`), `:498` (`record_contract`), and every family’s `history_cases`. Why: history called the normal append path, whose valid current-writer replay policy excludes retained compatibility/replay-only records. Fix: share immutable envelope/payload/identity/frozen-source validation through `record_contract`; keep current append/retry policy exclusively in `append_contract`. History retains original at-write admission plus current reader/access/withdrawal checks and ignores later live state. All four supported envelope policies and a normalized compatibility/replay-only record have independent retained positives. This tests the supported normalized envelope, without claiming a new legacy decoder.

**C5-B2 — fixed (`51aff0e2358dc21bb2a822556b7b745315c6d567`).** Where: `scripts/pm-dg6b-event-contracts.py:142` (`historical_storage_contract`) and every family’s independent `storage_record`. Why: the producer digest excludes Storage metadata and no independently authenticated source record was compared. Fix: compare the complete exact canonical MessagePack EventRecord bytes from Storage’s own verified selected-source adapter, plus its independent Storage UUID/partition, with the historical original. This covers sequence, observed/persisted timestamps, identity, migration and all payload/receipt fields. The source bytes are not reconstructed from the candidate by the checker; fixture construction freezes them independently before mutations. Storage-only source authentication is required separately from owner provenance. This adds no receipt/disk format and does not change the producer digest.

Verification for both findings: `python3 scripts/pm-dg6b-event-contracts.py`, the complete guard proof, independent line-target audit and full CLI controls below. Before fixes: 19/19 retained replay-only records refused; 57/57 independent sequence/time substitutions accepted. After fixes: the full checker accepts all required retained positives, rejects all metadata substitutions, and continues to accept metadata-only caller retries. An envelope policy substitution alone now fails Storage-byte agreement unless the authentic stored original actually used that policy. No finding is disputed or stopped for Jared.

## Guard-removal table

**2,647 negatives × 54 groups = 142,938 evaluations**, zero unexpected flips/survivors. Every target accepts with only its own guard or named duplicate set removed; every unrelated negative retains its exact refusal. All 55 refusal classifications have controls. A fresh restored complete checker passes. Production source files are never patched or bypassed.

The complete flip/stay IDs and exact complements are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix5/guard-removal.json`, SHA-256 `b671106779621413bda703371f9e5b15e08a4036ec2d5c75850b8cab6dcf83f8`. The compact committed summary contains all source locations and label selectors. Each row below names the complete target set through those selectors; the stay set is its verified exact complement in the 2,647-ID universe.

| Guard / invariant | Negatives that flip | Negatives that stay rejected |
|---|---|---|
| `access` | 25: `append_invalid/source_access_revoked`; `semantic_invalid/source_access_revoked` | All other 2622 IDs; same refusal |
| `cadence` | 1: `semantic/cadence` | All other 2646 IDs; same refusal |
| `cas` | 3: `semantic_invalid/stale_cas` | All other 2644 IDs; same refusal |
| `checkpoint_schema` | 76: `append_invalid/checkpoint_trailing_lf_frontier_sha256`; `append_invalid/checkpoint_trailing_lf_generation_anchor_sha256`; `append_invalid/checkpoint_trailing_lf_generation_id`; `append_invalid/persisted_snapshot_forbidden` | All other 2571 IDs; same refusal |
| `checkpoint_storage_join` | 57: `append_invalid/wrong_checkpoint_key`; `append_invalid/wrong_checkpoint_source_storage`; `append_invalid/wrong_checkpoint_storage` | All other 2590 IDs; same refusal |
| `confirmation` | 1: `semantic_invalid/unconfirmed_delete` | All other 2646 IDs; same refusal |
| `creation_source` | 1: `extra/creation_source` | All other 2646 IDs; same refusal |
| `current_writer_policy` | 38: `append_invalid/replay_only_append`; `append_invalid/wrong_current_replay_policy` | All other 2609 IDs; same refusal |
| `definition_writer` | 5: `extra/definition_writer` | All other 2642 IDs; same refusal |
| `envelope_source_join` | 76: `append_invalid/wrong_actor`; `append_invalid/wrong_schema_route`; `append_invalid/wrong_time`; `history_cases/history_event_type_substitution` | All other 2571 IDs; same refusal |
| `event_record_schema` | 19: `extra/event_record_schema` | All other 2628 IDs; same refusal |
| `failure_error_reason` | 1: `wrong_reason_cannot_prove_failure` | All other 2646 IDs; same refusal |
| `failure_oracle` | 1: `success_cannot_prove_failure` | All other 2646 IDs; same refusal |
| `fixture_family_coverage` | 19: `preparation/fixture_family_coverage` | All other 2628 IDs; same refusal |
| `grade_family_coverage` | 19: `preparation/grade_family_coverage` | All other 2628 IDs; same refusal |
| `historical_access` | 76: `history_cases/history_access_current`; `history_cases/history_body_deleted`; `history_cases/replay_only_history_access_current`; `history_cases/replay_only_history_body_deleted` | All other 2571 IDs; same refusal |
| `historical_provenance` | 114: `history_cases/history_admitted_when_written`; `history_cases/history_authentic`; `history_cases/history_retained`; `history_cases/replay_only_history_admitted_when_written`; `history_cases/replay_only_history_authentic`; `history_cases/replay_only_history_retained` | All other 2533 IDs; same refusal |
| `historical_storage_join` | 38: `history_cases/history_storage_scope_partition`; `history_cases/history_storage_storage_instance_id` | All other 2609 IDs; same refusal |
| `historical_storage_record` | 57: `history_cases/history_storage_observed_at_utc_substitution`; `history_cases/history_storage_persisted_at_utc_substitution`; `history_cases/history_storage_sequence_id_substitution` | All other 2590 IDs; same refusal |
| `historical_storage_source` | 19: `history_cases/history_storage_authenticated` | All other 2628 IDs; same refusal |
| `historical_withdrawn` | 76: `history_cases/history_family_withdrawn`; `history_cases/history_reader_current`; `history_cases/replay_only_history_family_withdrawn`; `history_cases/replay_only_history_reader_current` | All other 2571 IDs; same refusal |
| `home_scope` | 1: `semantic_invalid/project_home_in_no_project` | All other 2646 IDs; same refusal |
| `idempotency_conflict` | 162: `caller_semantic_change/actual_actor_override`; `caller_semantic_change/actual_attempt_override`; `caller_semantic_change/actual_node_override`; `caller_semantic_change/actual_project_receipt`; `caller_semantic_change/actual_project_whole_version`; `caller_semantic_change/actual_run_override`; `caller_semantic_change/actual_thread_override`; `caller_semantic_change/application_original`; `caller_semantic_change/authenticated_reference_transport`; `caller_semantic_change/blocking_pre_attempt_start`; `caller_semantic_change/blocking_pre_node_dispatch`; `caller_semantic_change/blocking_pre_tool_invoke`; `caller_semantic_change/distinct_id_duplicate`; `caller_semantic_change/library_no_project`; `caller_semantic_change/max_utf8_server_and_operation`; `caller_semantic_change/operation_16383_bytes`; `caller_semantic_change/operation_16384_bytes`; `caller_semantic_change/operation_16385_bytes`; `caller_semantic_change/project_selection_of_library`; `caller_semantic_change/read_only_source_with_current_event_writer`; `caller_semantic_change/schema_valid_16385_byte_reference`; `retry_cases/caller_causation_event_id`; `retry_cases/caller_correlation_id`; `retry_cases/caller_parent_event_id`; `retry_cases/caller_producer_sequence_id` | All other 2485 IDs; same refusal |
| `idempotency_key` | 95: `append_invalid/actual_server_application_key`; `append_invalid/application_key_odd_hex`; `append_invalid/application_key_trailing_lf`; `append_invalid/application_key_uppercase_hex`; `append_invalid/legacy_application_key` | All other 2552 IDs; same refusal |
| `identity` | 40: `history_cases/history_event_id_substitution`; `semantic/identity`; `semantic/scope` | All other 2607 IDs; same refusal |
| `inline_body_too_large` | 20: `append_invalid/schema_valid_16385_byte_inline`; `transport/16k_plus_one` | All other 2627 IDs; same refusal |
| `mirror` | 4: `semantic_invalid/mirror_write` | All other 2643 IDs; same refusal |
| `observation_only_hook` | 2: `semantic/post_attempt_complete`; `semantic/post_tool_invoke` | All other 2645 IDs; same refusal |
| `operation_schema` | 344: `operation_schema/actual_actor_override/LF/actor_ref`; `operation_schema/actual_actor_override/LF/idempotency_key`; `operation_schema/actual_actor_override/replay_only`; `operation_schema/actual_actor_override/wrong_scope_key`; `operation_schema/actual_attempt_override/LF/actor_ref`; `operation_schema/actual_attempt_override/LF/idempotency_key`; `operation_schema/actual_attempt_override/replay_only`; `operation_schema/actual_attempt_override/wrong_scope_key`; `operation_schema/actual_node_override/LF/actor_ref`; `operation_schema/actual_node_override/LF/idempotency_key`; `operation_schema/actual_node_override/replay_only`; `operation_schema/actual_node_override/wrong_scope_key`; `operation_schema/actual_project_receipt/LF/actor_ref`; `operation_schema/actual_project_receipt/LF/idempotency_key`; `operation_schema/actual_project_receipt/replay_only`; `operation_schema/actual_project_receipt/wrong_scope_key`; `operation_schema/actual_project_whole_version/LF/actor_ref`; `operation_schema/actual_project_whole_version/LF/idempotency_key`; `operation_schema/actual_project_whole_version/replay_only`; `operation_schema/actual_project_whole_version/wrong_scope_key`; `operation_schema/actual_run_override/LF/actor_ref`; `operation_schema/actual_run_override/LF/idempotency_key`; `operation_schema/actual_run_override/replay_only`; `operation_schema/actual_run_override/wrong_scope_key`; `operation_schema/actual_thread_override/LF/actor_ref`; `operation_schema/actual_thread_override/LF/idempotency_key`; `operation_schema/actual_thread_override/replay_only`; `operation_schema/actual_thread_override/wrong_scope_key`; `operation_schema/application_original/LF/actor_ref`; `operation_schema/application_original/LF/idempotency_key`; `operation_schema/application_original/replay_only`; `operation_schema/application_original/wrong_scope_key`; `operation_schema/authenticated_reference_transport/LF/actor_ref`; `operation_schema/authenticated_reference_transport/LF/idempotency_key`; `operation_schema/authenticated_reference_transport/replay_only`; `operation_schema/authenticated_reference_transport/wrong_scope_key`; `operation_schema/blocking_pre_attempt_start/LF/actor_ref`; `operation_schema/blocking_pre_attempt_start/LF/idempotency_key`; `operation_schema/blocking_pre_attempt_start/replay_only`; `operation_schema/blocking_pre_attempt_start/wrong_scope_key`; `operation_schema/blocking_pre_node_dispatch/LF/actor_ref`; `operation_schema/blocking_pre_node_dispatch/LF/idempotency_key`; `operation_schema/blocking_pre_node_dispatch/replay_only`; `operation_schema/blocking_pre_node_dispatch/wrong_scope_key`; `operation_schema/blocking_pre_tool_invoke/LF/actor_ref`; `operation_schema/blocking_pre_tool_invoke/LF/idempotency_key`; `operation_schema/blocking_pre_tool_invoke/replay_only`; `operation_schema/blocking_pre_tool_invoke/wrong_scope_key`; `operation_schema/distinct_id_duplicate/LF/actor_ref`; `operation_schema/distinct_id_duplicate/LF/idempotency_key`; `operation_schema/distinct_id_duplicate/replay_only`; `operation_schema/distinct_id_duplicate/wrong_scope_key`; `operation_schema/library_no_project/LF/actor_ref`; `operation_schema/library_no_project/LF/idempotency_key`; `operation_schema/library_no_project/replay_only`; `operation_schema/library_no_project/wrong_scope_key`; `operation_schema/max_utf8_server_and_operation/LF/actor_ref`; `operation_schema/max_utf8_server_and_operation/LF/idempotency_key`; `operation_schema/max_utf8_server_and_operation/replay_only`; `operation_schema/max_utf8_server_and_operation/wrong_scope_key`; `operation_schema/operation_16383_bytes/LF/actor_ref`; `operation_schema/operation_16383_bytes/LF/idempotency_key`; `operation_schema/operation_16383_bytes/replay_only`; `operation_schema/operation_16383_bytes/wrong_scope_key`; `operation_schema/operation_16384_bytes/LF/actor_ref`; `operation_schema/operation_16384_bytes/LF/idempotency_key`; `operation_schema/operation_16384_bytes/replay_only`; `operation_schema/operation_16384_bytes/wrong_scope_key`; `operation_schema/operation_16385_bytes/LF/actor_ref`; `operation_schema/operation_16385_bytes/LF/idempotency_key`; `operation_schema/operation_16385_bytes/replay_only`; `operation_schema/operation_16385_bytes/wrong_scope_key`; `operation_schema/project_selection_of_library/LF/actor_ref`; `operation_schema/project_selection_of_library/LF/idempotency_key`; `operation_schema/project_selection_of_library/replay_only`; `operation_schema/project_selection_of_library/wrong_scope_key`; `operation_schema/read_only_source_with_current_event_writer/LF/actor_ref`; `operation_schema/read_only_source_with_current_event_writer/LF/idempotency_key`; `operation_schema/read_only_source_with_current_event_writer/replay_only`; `operation_schema/read_only_source_with_current_event_writer/wrong_scope_key`; `operation_schema/schema_valid_16385_byte_reference/LF/actor_ref`; `operation_schema/schema_valid_16385_byte_reference/LF/idempotency_key`; `operation_schema/schema_valid_16385_byte_reference/replay_only`; `operation_schema/schema_valid_16385_byte_reference/wrong_scope_key` | All other 2303 IDs; same refusal |
| `operation_schema_binding` | 19: `preparation/operation_schema_binding` | All other 2628 IDs; same refusal |
| `operation_source_join` | 38: `operation_cases/authenticated_but_wrong_effect_receipt_ref`; `operation_cases/authenticated_but_wrong_payload` | All other 2609 IDs; same refusal |
| `operation_value_too_large` | 21: `operation_cases/oversized_inline_operation`; `operation_cases/review_exact_16898_byte_inline_operation`; `stage_cases/physical_byte_stage_16385` | All other 2626 IDs; same refusal |
| `original_payload_conflict` | 13: `semantic/original_payload` | All other 2634 IDs; same refusal |
| `original_server_required` | 1: `original_server_required` | All other 2646 IDs; same refusal |
| `original_source_join` | 91: `append_invalid/receipt_substitution`; `append_invalid/unrelated_original_source`; `history_cases/history_forged_original`; `history_cases/replay_only_history_forged_original`; `semantic_invalid/changed_runtime_snapshot`; `semantic_invalid/frozen_timestamp_changed`; `semantic_invalid/recomputed_effective_identity`; `semantic_invalid/result_substitution`; `semantic_invalid/revision_substitution`; `semantic_invalid/subject_substitution` | All other 2556 IDs; same refusal |
| `override_lineage` | 1: `semantic_invalid/coherent_wrong_lineage_owner` | All other 2646 IDs; same refusal |
| `partition` | 48: `semantic_invalid/project_partition_wrong`; `stage_cases/invalid_project_partition_'project-one'`; `stage_cases/invalid_project_partition_'project:project-one'`; `stage_cases/invalid_project_partition_'project~cHJvamVjdC1vbmU\n'` | All other 2599 IDs; same refusal |
| `payload_ref_integrity` | 342: `append_invalid/reference_hash_wrong`; `operation_cases/operation_noncanonical_encoding`; `operation_cases/operation_reference_blake3_id`; `operation_cases/operation_reference_byte_size`; `operation_cases/operation_reference_bytes_hex`; `operation_cases/operation_reference_media_type`; `transport/*/blake3_id`; `transport/*/byte_size`; `transport/*/bytes_hex`; `transport/*/media_type` | All other 2305 IDs; same refusal |
| `payload_ref_unavailable` | 190: `append_invalid/reference_not_durable`; `operation_cases/operation_reference_access_current`; `operation_cases/operation_reference_durable`; `stage_cases/operation_reference_missing`; `transport/*/access_current`; `transport/*/durable` | All other 2457 IDs; same refusal |
| `payload_schema` | 266: `append_invalid/inline_base64_body`; `payload_schema/*`; `stage_cases/coherent_retired_tier` | All other 2381 IDs; same refusal |
| `payload_transport_join` | 19: `extra/payload_transport_join` | All other 2628 IDs; same refusal |
| `prepared_membership` | 19: `preparation/prepared_membership` | All other 2628 IDs; same refusal |
| `protected` | 4: `semantic_invalid/protected_id_mutation` | All other 2643 IDs; same refusal |
| `reach` | 1: `semantic_invalid/only_projects_in_no_project` | All other 2646 IDs; same refusal |
| `resolution_schema` | 6: `resolution/effective_persona_id`; `resolution/missing/effective_persona`; `resolution/missing/requested_persona`; `resolution/missing/runtime_snapshot_ref`; `resolution/missing/runtime_snapshot_sha256`; `resolution/requested_persona_id` | All other 2641 IDs; same refusal |
| `retention_pending` | 19: `preparation/retention_pending` | All other 2628 IDs; same refusal |
| `retry_identity` | 19: `extra/retry_identity` | All other 2628 IDs; same refusal |
| `scope` | 16: `append_invalid/project_auth_forbidden`; `semantic/scope`; `semantic_invalid/server_substitution` | All other 2631 IDs; same refusal |
| `selected_result_schema` | 2: `selected_result/effective_persona_id`; `selected_result/requested_persona_id` | All other 2645 IDs; same refusal |
| `source_trust` | 1: `semantic_invalid/unverified_import` | All other 2646 IDs; same refusal |
| `unadmitted_disposition` | 19: `preparation/unadmitted_disposition` | All other 2628 IDs; same refusal |
| `unknown_oracle_stage` | 1: `unknown_oracle_stage` | All other 2646 IDs; same refusal |
| `unresolved_schema_ref` | 57: `schema_graph/dormant_ref`; `schema_graph/unused/$dynamicRef`; `schema_graph/unused/$ref` | All other 2590 IDs; same refusal |
| `writer` | 44: `append_invalid/withdrawn_event_writer`; `history_cases/history_original_not_admitted_writer`; `semantic_invalid/withdrawn_event_writer`; `semantic_invalid/writer_stale` | All other 2603 IDs; same refusal |

### Named duplicate sites

The separate exact-line AST audit inventories production raises itself, removes each repeated site alone, then removes its named duplicate set together. Single-site outcomes are retained; no unrelated pair is excused. Both current-writer policy predicates remain byte-identical to the reviewed input.

| Invariant | Production lines removed together | Targets accepting |
|---|---|---|
| `access` | 224, 513 | 25 |
| `cas` | 238, 268, 272 | 3 |
| `current_writer_policy` | 485, 487 | 38 |
| `envelope_source_join` | 538, 542 | 76 |
| `home_scope` | 220, 222 | 1 |
| `identity` | 181, 529 | 40 |
| `operation_schema` | 98, 112, 425 | 344 |
| `operation_source_join` | 119, 114 | 38 |
| `original_source_join` | 245, 257, 259, 249, 255, 286, 290, 293, 515 | 91 |
| `override_lineage` | 281, 284 | 1 |
| `partition` | 217, 398 | 48 |
| `payload_ref_integrity` | 105, 108, 110, 472 | 342 |
| `payload_schema` | 420, 508 | 266 |
| `scope` | 179, 213, 517, 521 | 16 |
| `source_trust` | 240, 274 | 1 |
| `writer` | 227, 511 | 44 |

Existing forged-history negatives now carry a Storage snapshot coherent with the deliberately forged envelope while retaining genuine independent owner-source custody. Removing owner custody therefore exposes only that defect. New sequence/time substitutions keep the independent genuine Storage bytes unchanged. The paired representations of a single intended semantic mutation are synchronized; there is no stale copy masking a refusal.

## All eleven standing checks

| Check | All-family result |
|---|---|
| 1 Writer policy | PASS: original predicates unchanged; full CLI append and retry replay-only refusals for all nineteen. |
| 2 CV-366 | PASS: original UTF-8 Server/operation vectors, maximum keys, wrong-Server/legacy/odd/uppercase/LF refusals preserved and rerun by the full checker/matrix. |
| 3 Project partition | PASS: fourteen encoded Project positives and five coherent auth Project refusals remain; partition guards independently flip. |
| 4 SP-337 | PASS: complete body/physical-operation byte gates, authenticated recovery and exact 16,383/16,384/16,385 boundaries; original 16,898-byte operation and reference successor remain. |
| 5 Trailing LF | PASS: schema/token/operation LF negatives and exact-pattern guards remain in the full checker/matrix. Pattern/schema definitions are unchanged; the cycle-5 review’s wider 2,373-pattern result is prior evidence, not claimed as rerun. |
| 6 Retry semantics | PASS: each of three Storage metadata fields changed independently preserves the caller digest; caller correlation/causality/producer-sequence changes still conflict. |
| 7 Checkpoint identity | PASS: Storage UUID, source-selection UUID and key mismatches refuse; persisted snapshot/schema negatives remain. |
| 8 Failure oracles | PASS: success and wrong-error helper guards independently flip; actual CLI refusals exit 1 with their exact intended ValueError. |
| 9 References | PASS: 408 refs resolve eagerly; unused/dormant $ref and $dynamicRef refuse; eager resolver guard independently flips. |
| 10 History | PASS: retained current-policy, prior-policy, normalized compatibility and replay-only positives survive later live-state change. Withdrawn/forged/foreign/unavailable originals and altered Storage metadata refuse. |
| 11 Isolation | PASS: every whole-lane guard and named duplicate set is proved; independent exact-line audit agrees with the complete matrix. |

## All nine Astra classes, every family

| Class | Own mutation and how it is ruled out |
|---|---|
| 1 Forged/contradictory inputs | Recomputed identity guard refuses a well-formed forged Event ID; a contradictory frozen owner subject refuses original_source_join; an arbitrary authenticated operation digest refuses payload_ref_integrity, in all nineteen. |
| 2 Storage metadata | Three independent historical sequence/time substitutions refuse historical_storage_record. Changing the authentic Storage source to a different valid original passes, proving source agreement rather than hardcoded metadata. Metadata-only caller retries pass. |
| 3 Historical readers | Every supported policy and normalized replay-only compatibility positive passes; independently changed retained/authentic/admitted/reader/access/deleted/withdrawn inputs and foreign families refuse. Original admission remains frozen; live state grants no access. |
| 4 Representation disagreement | Boolean revision, numeric operation ID, uppercased key, numeric 64-digit digest and leading-space digest refuse. Exact encoded source bytes also preserve types. |
| 5 Dormant references | Own unused $ref and $dynamicRef mutations for each family fail eager resolution before fixture traversal. The whole-matrix resolver removal proves the guard. |
| 6 Partial size limits | Independently measure every actual positive complete operation and its physical form; recover the entire logical operation. Real physical byte stages pass 16,383/16,384 and refuse 16,385. Per-family SP-670/671/672 clauses separately bound body and operation/reference; no payload_ref-null clause was added or retained alongside a contradictory rule. |
| 7 Custody on every path | Complete family retry paths refuse contradictory original source, foreign event family, foreign Storage and absent original writer admission. Recovery refuses unavailable original bytes and authenticated foreign receipts. The low-level retry comparator intentionally excludes Storage metadata; the full caller validates the original operand, as confirmed in cycle 5. |
| 8 Masked negatives | Every history negative has its exact stock reason; complete matrix and independent direct-line removal prove its intended guard. Original 171 history cases persist, with coherent Storage evidence; all non-history fixtures are unchanged parsed values. |
| 9 Overstated grades | Each family’s PASS is checked against its own classes 1–8, the full process controls and guard matrix. All 370 current citations resolve exactly. Membership stays ABSENT, retention PARTIAL and native NOT_RUN. |

Own mutations: **1,359 probes, zero failures**. The table gives the passing probe count for every class per family; the class-specific mutation/refusal above applies to every row. Class 8 also has the independent whole-lane removal proof.

| Family | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | Grade before → after |
|---|---|---|---|---|---|---|---|---|---|---|
| `auth.github.authenticated` | P 3 | P 9 | P 13 | P 5 | P 2 | P 10 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `auth.github.device_code.issued` | P 3 | P 9 | P 13 | P 5 | P 2 | P 6 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `auth.github.disconnected` | P 3 | P 9 | P 13 | P 5 | P 2 | P 6 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `auth.github.failed` | P 3 | P 9 | P 13 | P 5 | P 2 | P 6 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `auth.github.token.polling` | P 3 | P 9 | P 13 | P 5 | P 2 | P 6 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `plugin.hook.blocked` | P 3 | P 9 | P 13 | P 5 | P 2 | P 10 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `plugin.hook.error` | P 3 | P 9 | P 13 | P 5 | P 2 | P 7 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `plugin.hook.invoked` | P 3 | P 9 | P 13 | P 5 | P 2 | P 7 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `plugin.load_failed` | P 3 | P 9 | P 13 | P 5 | P 2 | P 7 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `plugin.loaded` | P 3 | P 9 | P 13 | P 5 | P 2 | P 7 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `plugin.permission.override` | P 3 | P 9 | P 13 | P 5 | P 2 | P 7 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `plugin.tool.collision` | P 3 | P 9 | P 13 | P 5 | P 2 | P 7 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `plugin.tool.registered` | P 3 | P 9 | P 13 | P 5 | P 2 | P 7 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `persona.created` | P 3 | P 9 | P 13 | P 5 | P 2 | P 8 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `persona.deleted` | P 3 | P 9 | P 13 | P 5 | P 2 | P 7 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `persona.exported` | P 3 | P 9 | P 13 | P 5 | P 2 | P 8 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `persona.imported` | P 3 | P 9 | P 13 | P 5 | P 2 | P 7 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `persona.selected` | P 3 | P 9 | P 13 | P 5 | P 2 | P 13 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |
| `persona.updated` | P 3 | P 9 | P 13 | P 5 | P 2 | P 7 | P 6 | P 25 | P 1 | 9 P / 2 p / 1 A → 10 P / 1 p / 1 A |

P=PASS; p=PARTIAL; A=ABSENT. All nineteen oracle cells are PARTIAL → PASS against the cycle-5 independent regrade; the other 209 cells agree. Prepared gate: **0/19 → 19/19**, with the two permitted open cells remaining explicit.

## Earlier findings and boundaries

| Confirmed review item | Preserved result |
|---|---|
| C4-B1 | Resolved: coherent forbidden-body, forged-history, plugin-receipt and auth Project controls remain isolated; physical-size controls remain at the real pre-dispatch byte gate. |
| Cycle 1 Persona owners/names | Current library/No-project and Project routes, home/mirror/protected/CAS/reach and canonical requested_persona/effective_persona remain unchanged. |
| Cycle 1 writer admission / hooks | UNDISPOSITIONED and membership fences remain; pre-hook Block positives and post-hook negatives remain. |
| Astra 1 keys/source/tier/export | CV-366 exact recipes, independent source custody, actual lineage and current writer lease for export remain. Read-only mirror export still has its positive. |
| Astra 2 refs/oversized operation | Eager complete-graph resolution and complete physical-operation externalization remain; exact previous size cases are part of the unmodified complete fixture suite. |
| Generator timestamps | No Plans Markdown edited; no derived regeneration or new timestamp churn. Existing shards and index validate. |
| Storage profiles | Same ordered 41 pre-existing errors as fix 4 and cycle 5; no registry/profile/schema change. |
| Unpatterned dataset name / native prerequisites | Earlier generic-publication/native boundary remains; no claim that static fixture dictionaries authenticate actual frames, execute redb or admit a writer. |

## Commands, evidence and scope

| Check | Exit / result |
|---|---|
| Complete checker | 0; parsed top-level pass, 19 families, 408 refs, 95 historical positives / 475 historical negatives |
| Full CLI controls | 172 processes: 20 positive processes exit 0; 152 expected exact refusals exit 1; zero mismatches |
| Whole-lane matrix | 0; 2,647 negatives / 54 groups / 142,938 evaluations; zero unexpected results; restored full checker pass |
| Separate line-target audit | 0; 54 groups / 55 classifications; all targets flip; each named repeated site separately checked |
| Own nine-class probes | 0; 1,359 probes across all nineteen; zero failures |
| Independent byte/owner audit | 0; 86 actual operation encodings, 95 retained source encodings and 19 individual Storage clauses |
| Preservation/current citations | 0; 171 old history cases and every non-history value preserved; 370 exact citations; writer policy predicates unchanged |
| Projects refresh; GitHub integration | 0 each; parsed top-level pass |
| Primary command catalog | 0; 19 tests OK |
| Shard check | 0; 99 sources, 3,131 bodies, zero failures |
| Plan-index validate | 0; top-level pass; 7,447 PlanUnits / 29,958 acceptance units; native certification remains blocked |
| Storage profile checker | 1; same ordered 41 pre-existing errors |
| Whitespace / scope audit | 0; only lane checker, fixture pack, grade, report and guard summary changed |

The first sequential CLI-control attempt was deliberately interrupted to use a bounded three-process runner; its harness exit 130 is not a product result. The final runner saves every process outcome. No positive/negative guard or fixture suite was bypassed. All guards are weakened only in in-memory mutation controls and then restored. No subagent was started.

No owner prose, payload/operation schema, registry, profile, event-family admission, Decision Log, Spec Lock, auto-decisions, frozen validator or governance evidence changed. No new product or technical binding, retention/deletion choice, ID, admission or exclusion is authored. Existing GAAAF-077..081, PLUG-131..138, P-120..125, SP-670..672, CV-690..691 and ATS-335..336 are the unchanged 26 lane IDs. **IDs minted this round: zero.**

No Plans Markdown changed, so no derived generation was needed. The fifteen ignored currentness files were copied and SHA-256 matched before index validation. Initial resource checks passed (108 GB root free, 14 GiB memory available); the sparse detached worktree is removed after pushes. No landing lock, main push, governance refresh or delegation was used. Initial pre-brief mailbox inbox/directory reads occurred; after reading the fix brief no mailbox was used, registered or messaged.

Raw evidence and reproduction aids: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix5/`. The compact manifest pins retained files by absolute path and SHA-256. Report and self-grade are copied to the DG6B drafts root. Current source hashes are in the committed grade and guard summary. Integration still owns retention assignment, per-family admission and native proof.

Evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix5/checks-manifest.json` — SHA-256 `7bfc4f574dcf3e1b4835756a344be737e1ce89c81b5dc5a3e619b8b69c8a84c1`.

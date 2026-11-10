# DO guard tables: per-row result (sweep part 2A; recipe rows sweep part 2B)

Head `4220875d8eb2eac5c98d5ddd0566c8a1119eba8a`. One row per guard. **Matrix**: single-defect negatives in the whole-table matrix that only this row refuses (`scripts/pm-orchestrator-guard-proof.py check-all`). **Tool**: the gated guard tool (`004bdedd63`) on the row's suite: proved, or the suite's failure kind; **own/flips**: the row's own negatives in the suite and how many its cut accepted; **stays**: the suite's other cases that kept their exact result under the cut; **masked/unrelated**: always 0 when proved.

_Sweep part 2B (2026-11-10): the six `recipe_*` rows are SP-1101's (custody resolution, the disclosed label, the four evidence joins); rerun with the gated tool in `drafts/DO/sweep-p2b/guard-tool-p2b.tar.gz` with 11 other suites whose verdicts or views part 2B changed (12 suites, 37/37 rows proved, 68 flips, 216 stays, 0 masked, 0 unrelated). Every other row's result is part 2A's, unchanged._

## checkpoint (99 rows, 98 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `recipe_supported` | `historical_original_recipe` | `scripts/do-guards/do_recipe_1.py:13` | 2 | proved | 2/2 | 10 | 0/0 |
| `recipe_disclosed` | `historical_original_recipe` | `scripts/do-guards/do_recipe_1.py:19` | 2 | proved | 2/2 | 10 | 0/0 |
| `recipe_evidence_verified` | `historical_original_recipe` | `scripts/do-guards/do_recipe_1.py:27` | 2 | proved | 2/2 | 10 | 0/0 |
| `recipe_evidence_value` | `historical_original_recipe` | `scripts/do-guards/do_recipe_1.py:32` | 2 | proved | 2/2 | 10 | 0/0 |
| `recipe_evidence_source_ref` | `historical_original_recipe` | `scripts/do-guards/do_recipe_1.py:39` | 2 | proved | 2/2 | 10 | 0/0 |
| `recipe_evidence_source_sha256` | `historical_original_recipe` | `scripts/do-guards/do_recipe_1.py:46` | 2 | proved | 2/2 | 10 | 0/0 |
| `checkpoint_value_schema` | `checkpoint_schema` | `scripts/do-guards/do_checkpoint_schema_1.py:10` | 6 | proved | 2/2 | 2 | 0/0 |
| `read_token_value_schema` | `checkpoint_schema` | `scripts/do-guards/do_checkpoint_schema_1.py:14` | 2 | proved | 2/2 | 2 | 0/0 |
| `checkpoint_storage_identity` | `checkpoint_storage_identity` | `scripts/do-guards/do_checkpoint_identity_1.py:10` | 2 | proved | 2/2 | 2 | 0/0 |
| `read_token_storage_identity` | `checkpoint_storage_identity` | `scripts/do-guards/do_checkpoint_identity_1.py:15` | 2 | proved | 2/2 | 2 | 0/0 |
| `current_generation_present` | `checkpoint_not_current` | `scripts/do-guards/do_checkpoint_current_1.py:10` | 2 | proved | 2/2 | 4 | 0/0 |
| `current_generation_state` | `checkpoint_not_current` | `scripts/do-guards/do_checkpoint_current_1.py:14` | 2 | proved | 2/2 | 4 | 0/0 |
| `at_most_one_current_generation` | `checkpoint_not_current` | `scripts/do-guards/do_checkpoint_current_1.py:22` | 2 | proved | 2/2 | 4 | 0/0 |
| `read_token_checkpoint_key` | `checkpoint_read_token_join` | `scripts/do-guards/do_checkpoint_join_1.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `read_token_checkpoint_ref` | `checkpoint_read_token_join` | `scripts/do-guards/do_checkpoint_join_1.py:15` | 2 | proved | 2/2 | 8 | 0/0 |
| `read_token_generation_id` | `checkpoint_read_token_join` | `scripts/do-guards/do_checkpoint_join_1.py:20` | 2 | proved | 2/2 | 8 | 0/0 |
| `read_token_generation_anchor_sha256` | `checkpoint_read_token_join` | `scripts/do-guards/do_checkpoint_join_1.py:25` | 2 | proved | 2/2 | 8 | 0/0 |
| `read_token_frontier_revision` | `checkpoint_read_token_join` | `scripts/do-guards/do_checkpoint_join_1.py:30` | 2 | proved | 2/2 | 8 | 0/0 |
| `read_token_frontier_sha256` | `checkpoint_read_token_join` | `scripts/do-guards/do_checkpoint_join_2.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `read_token_index_dataset_name` | `checkpoint_read_token_join` | `scripts/do-guards/do_checkpoint_join_2.py:15` | 2 | proved | 2/2 | 8 | 0/0 |
| `read_token_source_selection` | `checkpoint_read_token_join` | `scripts/do-guards/do_checkpoint_join_2.py:20` | 22 | proved | 2/2 | 8 | 0/0 |
| `read_token_redb_snapshot_id` | `checkpoint_read_token_join` | `scripts/do-guards/do_checkpoint_join_2.py:25` | 2 | proved | 2/2 | 8 | 0/0 |
| `read_current_source_selection` | `checkpoint_read_token_join` | `scripts/do-guards/do_checkpoint_join_2.py:30` | 26 | proved | 2/2 | 8 | 0/0 |
| `anchor_source_storage_identity` | `checkpoint_source_storage_identity` | `scripts/do-guards/do_checkpoint_join_3.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `frontier_source_storage_identity` | `checkpoint_source_storage_identity` | `scripts/do-guards/do_checkpoint_join_3.py:15` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_scope_kind` | `index_row_scope_kind` | `scripts/do-guards/do_checkpoint_join_3.py:20` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_project_id` | `index_row_project_id` | `scripts/do-guards/do_checkpoint_join_3.py:25` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_scope_partition` | `index_row_scope_partition` | `scripts/do-guards/do_checkpoint_join_3.py:30` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_sequence_id` | `index_row_sequence_id` | `scripts/do-guards/do_checkpoint_join_4.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_event_id` | `index_row_event_id` | `scripts/do-guards/do_checkpoint_join_4.py:15` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_event_type` | `index_row_event_type` | `scripts/do-guards/do_checkpoint_join_4.py:20` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_producer_semantic_digest` | `index_row_producer_semantic_digest` | `scripts/do-guards/do_checkpoint_join_4.py:25` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_idempotency_key` | `index_row_idempotency_key` | `scripts/do-guards/do_checkpoint_join_4.py:30` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_payload_sha256` | `index_row_payload_sha256` | `scripts/do-guards/do_checkpoint_join_5.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_correlation_id` | `index_row_correlation_id` | `scripts/do-guards/do_checkpoint_join_5.py:15` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_causation_event_id` | `index_row_causation_event_id` | `scripts/do-guards/do_checkpoint_join_5.py:20` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_persisted_at_utc` | `index_row_persisted_at_utc` | `scripts/do-guards/do_checkpoint_join_5.py:25` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_redaction_profile` | `index_row_redaction_profile` | `scripts/do-guards/do_checkpoint_join_5.py:30` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_source_schema_id` | `index_row_source_schema_id` | `scripts/do-guards/do_checkpoint_join_6.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_source_schema_version` | `index_row_source_schema_version` | `scripts/do-guards/do_checkpoint_join_6.py:15` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_projector_replay_only` | `index_row_projector_replay_only` | `scripts/do-guards/do_checkpoint_join_6.py:20` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_key` | `index_row_locator_join` | `scripts/do-guards/do_checkpoint_join_6.py:25` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_checkpoint_ref` | `index_row_locator_join` | `scripts/do-guards/do_checkpoint_join_6.py:30` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_source_event` | `index_original_source_join` | `scripts/do-guards/do_checkpoint_join_7.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_source_value_sha256` | `index_original_source_join` | `scripts/do-guards/do_checkpoint_join_7.py:14` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_value_schema` | `index_row_schema` | `scripts/do-guards/do_checkpoint_join_7.py:19` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_count` | `index_complete_row_set` | `scripts/do-guards/do_checkpoint_join_7.py:23` | 2 | proved | 2/2 | 8 | 0/0 |
| `index_row_set_sha256` | `index_complete_row_set` | `scripts/do-guards/do_checkpoint_join_7.py:28` | 2 | proved | 2/2 | 8 | 0/0 |
| `anchor_retained_event_prefix` | `index_source_prefix` | `scripts/do-guards/do_checkpoint_join_8.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_retained_event_prefix` | `index_source_prefix` | `scripts/do-guards/do_checkpoint_join_8.py:15` | 2 | proved | 2/2 | 8 | 0/0 |
| `anchor_survivor_prefix` | `index_source_prefix` | `scripts/do-guards/do_checkpoint_join_8.py:20` | 2 | proved | 2/2 | 8 | 0/0 |
| `frontier_survivor_prefix` | `index_source_prefix` | `scripts/do-guards/do_checkpoint_join_8.py:25` | 2 | proved | 2/2 | 8 | 0/0 |
| `row_birth_manifest_generation` | `index_birth_anchor_join` | `scripts/do-guards/do_checkpoint_join_8.py:30` | 2 | proved | 2/2 | 8 | 0/0 |
| `row_birth_recovery_epoch` | `index_birth_anchor_join` | `scripts/do-guards/do_checkpoint_join_9.py:10` | 2 | proved | 2/2 | 2 | 0/0 |
| `row_birth_survivor_prefix` | `index_birth_anchor_join` | `scripts/do-guards/do_checkpoint_join_9.py:19` | 2 | proved | 2/2 | 2 | 0/0 |
| `coverage_last_frame_present` | `index_coverage_last_frame_null` | `scripts/do-guards/do_checkpoint_frame_1.py:10` | 2 | proved | 2/2 | 0 | 0/0 |
| `coverage_complete` | `index_complete_source_coverage` | `scripts/do-guards/do_checkpoint_coverage_1.py:10` | 0 | unproved: runtime duplicate of the checkpoint schema's const `complete_to_captured_boundary: true` (… | 0/0 | 0 | 0/0 |
| `coverage_frame_last_event_id` | `index_coverage_frame_last_event_id` | `scripts/do-guards/do_checkpoint_coverage_2.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_segment_count` | `index_coverage_segment_count` | `scripts/do-guards/do_checkpoint_coverage_2.py:18` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_segment_generation` | `index_coverage_segment_generation` | `scripts/do-guards/do_checkpoint_coverage_2.py:22` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_segment_name` | `index_coverage_segment_name` | `scripts/do-guards/do_checkpoint_coverage_2.py:30` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_frame_byte_offset` | `index_coverage_frame_byte_offset` | `scripts/do-guards/do_checkpoint_coverage_2.py:38` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_frame_end_offset` | `index_coverage_frame_end_offset` | `scripts/do-guards/do_checkpoint_coverage_3.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_scanned_through_offset` | `index_coverage_scanned_through_offset` | `scripts/do-guards/do_checkpoint_coverage_3.py:18` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_source_durable_end_offset` | `index_coverage_source_durable_end_offset` | `scripts/do-guards/do_checkpoint_coverage_3.py:26` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_source_durable_bytes_sha256` | `index_coverage_source_durable_bytes_sha256` | `scripts/do-guards/do_checkpoint_coverage_3.py:34` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_first_retained_sequence_id` | `index_coverage_first_retained_sequence_id` | `scripts/do-guards/do_checkpoint_coverage_3.py:42` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_through_sequence_id` | `index_coverage_through_sequence_id` | `scripts/do-guards/do_checkpoint_coverage_4.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_retained_event_count` | `index_coverage_retained_event_count` | `scripts/do-guards/do_checkpoint_coverage_4.py:17` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_frame_last_sequence_id` | `index_coverage_frame_last_sequence_id` | `scripts/do-guards/do_checkpoint_coverage_4.py:24` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_segment_first_sequence_id` | `index_coverage_segment_first_sequence_id` | `scripts/do-guards/do_checkpoint_coverage_4.py:32` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_segment_last_sequence_id` | `index_coverage_segment_last_sequence_id` | `scripts/do-guards/do_checkpoint_coverage_4.py:40` | 2 | proved | 2/2 | 8 | 0/0 |
| `coverage_segment_retained_event_count` | `index_coverage_segment_retained_event_count` | `scripts/do-guards/do_checkpoint_coverage_5.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `segment_name_first_sequence` | `index_coverage_segment_name_first_sequence` | `scripts/do-guards/do_checkpoint_coverage_5.py:18` | 2 | proved | 2/2 | 8 | 0/0 |
| `segment_name_last_sequence` | `index_coverage_segment_name_last_sequence` | `scripts/do-guards/do_checkpoint_coverage_5.py:27` | 2 | proved | 2/2 | 8 | 0/0 |
| `anchor_first_retained_sequence_id` | `index_anchor_first_retained_sequence_id` | `scripts/do-guards/do_checkpoint_coverage_5.py:34` | 2 | proved | 2/2 | 8 | 0/0 |
| `anchor_through_sequence_id` | `index_anchor_through_sequence_id` | `scripts/do-guards/do_checkpoint_coverage_5.py:39` | 2 | proved | 2/2 | 8 | 0/0 |
| `anchor_retained_event_count` | `index_anchor_retained_event_count` | `scripts/do-guards/do_checkpoint_coverage_6.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `segment_name_generation` | `index_coverage_segment_name_generation` | `scripts/do-guards/do_checkpoint_coverage_6.py:15` | 2 | proved | 2/2 | 8 | 0/0 |
| `segment_name_state` | `index_coverage_segment_name_state` | `scripts/do-guards/do_checkpoint_coverage_6.py:24` | 2 | proved | 2/2 | 8 | 0/0 |
| `anchor_selected_segment_generation` | `index_anchor_selected_segment_generation` | `scripts/do-guards/do_checkpoint_coverage_6.py:33` | 2 | proved | 2/2 | 8 | 0/0 |
| `frontier_selected_segment_generation` | `index_frontier_selected_segment_generation` | `scripts/do-guards/do_checkpoint_coverage_6.py:41` | 2 | proved | 2/2 | 8 | 0/0 |
| `frontier_current_bytes_sha256` | `index_frontier_current_bytes_sha256` | `scripts/do-guards/do_checkpoint_coverage_7.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `frontier_recovery_epoch` | `index_frontier_recovery_epoch` | `scripts/do-guards/do_checkpoint_coverage_7.py:16` | 2 | proved | 2/2 | 8 | 0/0 |
| `frontier_excluded_ranges_sha256` | `index_frontier_excluded_ranges_sha256` | `scripts/do-guards/do_checkpoint_coverage_7.py:21` | 2 | proved | 2/2 | 8 | 0/0 |
| `frontier_retired_inputs_sha256` | `index_frontier_retired_inputs_sha256` | `scripts/do-guards/do_checkpoint_coverage_7.py:27` | 2 | proved | 2/2 | 8 | 0/0 |
| `anchor_sequence_gaps_sha256` | `index_anchor_sequence_gaps_sha256` | `scripts/do-guards/do_checkpoint_coverage_7.py:33` | 2 | proved | 2/2 | 8 | 0/0 |
| `sequence_gap_retained` | `index_coverage_sequence_gap_retained` | `scripts/do-guards/do_checkpoint_coverage_8.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `sequence_gap_order` | `index_coverage_sequence_gap_order` | `scripts/do-guards/do_checkpoint_coverage_8.py:19` | 2 | proved | 2/2 | 8 | 0/0 |
| `row_source_segment_generation` | `index_row_source_segment_generation` | `scripts/do-guards/do_checkpoint_coverage_8.py:27` | 2 | proved | 2/2 | 8 | 0/0 |
| `row_source_segment_name` | `index_row_source_segment_name` | `scripts/do-guards/do_checkpoint_coverage_8.py:40` | 2 | proved | 2/2 | 8 | 0/0 |
| `row_source_byte_offset` | `index_row_source_byte_offset` | `scripts/do-guards/do_checkpoint_coverage_8.py:53` | 2 | proved | 2/2 | 8 | 0/0 |
| `row_source_sequence_id` | `index_row_source_sequence_id` | `scripts/do-guards/do_checkpoint_coverage_9.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `row_translation_ref` | `index_row_translation_ref` | `scripts/do-guards/do_checkpoint_coverage_9.py:20` | 2 | proved | 2/2 | 8 | 0/0 |
| `generation_id_copy` | `index_generation_id` | `scripts/do-guards/do_checkpoint_coverage_9.py:36` | 2 | proved | 2/2 | 8 | 0/0 |
| `generation_dataset_name` | `index_generation_dataset_name` | `scripts/do-guards/do_checkpoint_coverage_9.py:43` | 2 | proved | 2/2 | 8 | 0/0 |
| `generation_id_recipe` | `index_generation_id_recipe` | `scripts/do-guards/do_checkpoint_coverage_9.py:51` | 2 | proved | 2/2 | 8 | 0/0 |
| `generation_translation_origin` | `index_generation_translation_origin` | `scripts/do-guards/do_checkpoint_coverage_10.py:10` | 2 | proved | 2/2 | 2 | 0/0 |
| `translation_target_selection` | `index_translation_target_selection` | `scripts/do-guards/do_checkpoint_coverage_10.py:17` | 2 | proved | 2/2 | 2 | 0/0 |

## append (33 rows, 31 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `append_number_domain` | `number_domain` | `scripts/do-guards/do_append_number_1.py:10` | 106 | proved | 2/2 | 0 | 0/0 |
| `append_schema_references` | `unresolved_schema_reference` | `scripts/do-guards/do_append_references_1.py:10` | 50 | proved | 2/2 | 0 | 0/0 |
| `event_record_schema` | `event_schema` | `scripts/do-guards/do_append_shape_1.py:10` | 184 | proved | 2/2 | 8 | 0/0 |
| `event_storage_sequence` | `event_schema` | `scripts/do-guards/do_append_shape_1.py:14` | 106 | proved | 2/2 | 8 | 0/0 |
| `replay_only_not_appendable` | `replay_only_not_appendable` | `scripts/do-guards/do_append_shape_1.py:18` | 25 | proved | 2/2 | 8 | 0/0 |
| `family_current_replay_policy` | `family_current_replay_policy` | `scripts/do-guards/do_append_shape_1.py:25` | 47 | proved | 2/2 | 8 | 0/0 |
| `logical_payload_schema` | `logical_payload_schema` | `scripts/do-guards/do_append_shape_1.py:32` | 63 | proved | 2/2 | 8 | 0/0 |
| `event_type_pattern` | `event_type_join` | `scripts/do-guards/do_append_join_1.py:10` | 0 | unproved: runtime duplicate of the EventRecord schema's `event_type` pattern (same field, same patte… | 0/0 | 0 | 0/0 |
| `event_type_family` | `event_type_join` | `scripts/do-guards/do_append_join_2.py:10` | 47 | proved | 2/2 | 4 | 0/0 |
| `event_join_idempotency_key` | `event_join_idempotency_key` | `scripts/do-guards/do_append_join_2.py:19` | 22 | proved | 2/2 | 4 | 0/0 |
| `event_join_event_id` | `event_join_event_id` | `scripts/do-guards/do_append_join_2.py:25` | 47 | proved | 2/2 | 4 | 0/0 |
| `event_join_scope_kind` | `event_join_scope_kind` | `scripts/do-guards/do_append_join_3.py:10` | 0 | unproved: the EventRecord schema's if/then ties scope_kind to project_id, so a scope_kind other than… | 0/0 | 0 | 0/0 |
| `event_join_project_id` | `event_join_project_id` | `scripts/do-guards/do_append_join_4.py:10` | 25 | proved | 2/2 | 8 | 0/0 |
| `event_join_thread_id` | `event_join_thread_id` | `scripts/do-guards/do_append_join_4.py:16` | 47 | proved | 2/2 | 8 | 0/0 |
| `event_join_run_id` | `event_join_run_id` | `scripts/do-guards/do_append_join_4.py:22` | 47 | proved | 2/2 | 8 | 0/0 |
| `event_join_occurred_at_utc` | `event_join_occurred_at_utc` | `scripts/do-guards/do_append_join_4.py:28` | 47 | proved | 2/2 | 8 | 0/0 |
| `event_join_payload_schema_id` | `event_join_payload_schema_id` | `scripts/do-guards/do_append_join_4.py:35` | 47 | proved | 2/2 | 8 | 0/0 |
| `event_scope_partition` | `scope_partition` | `scripts/do-guards/do_append_join_5.py:10` | 25 | proved | 2/2 | 0 | 0/0 |
| `phase_context_object` | `phase_context_type` | `scripts/do-guards/do_append_phase_context_1.py:10` | 1 | proved | 1/1 | 6 | 0/0 |
| `phase_context_max_questions` | `phase_context_type` | `scripts/do-guards/do_append_phase_context_1.py:18` | 6 | proved | 2/2 | 5 | 0/0 |
| `phase_context_completion_signal` | `phase_context_type` | `scripts/do-guards/do_append_phase_context_1.py:29` | 5 | proved | 2/2 | 5 | 0/0 |
| `phase_context_phase_state` | `phase_context_type` | `scripts/do-guards/do_append_phase_context_1.py:38` | 3 | proved | 2/2 | 5 | 0/0 |
| `phase_force_state_active` | `phase_force_predicate` | `scripts/do-guards/do_append_predicate_1.py:10` | 1 | proved | 1/1 | 5 | 0/0 |
| `phase_force_completion_signal` | `phase_force_predicate` | `scripts/do-guards/do_append_predicate_1.py:19` | 1 | proved | 1/1 | 5 | 0/0 |
| `phase_force_question_count` | `phase_force_predicate` | `scripts/do-guards/do_append_predicate_1.py:28` | 1 | proved | 1/1 | 5 | 0/0 |
| `phase_force_max_questions` | `phase_force_predicate` | `scripts/do-guards/do_append_predicate_1.py:37` | 1 | proved | 1/1 | 5 | 0/0 |
| `truncation_grows_output` | `truncation_grows_output` | `scripts/do-guards/do_append_predicate_1.py:49` | 2 | proved | 2/2 | 4 | 0/0 |
| `retry_source_retry_cause` | `retry_payload_source_predicate` | `scripts/do-guards/do_append_retry_source_1.py:10` | 6 | proved | 2/2 | 8 | 0/0 |
| `retry_source_prior_attempt_number` | `retry_payload_source_predicate` | `scripts/do-guards/do_append_retry_source_1.py:19` | 6 | proved | 2/2 | 8 | 0/0 |
| `retry_source_attempt_number` | `retry_payload_source_predicate` | `scripts/do-guards/do_append_retry_source_1.py:29` | 6 | proved | 2/2 | 8 | 0/0 |
| `retry_source_child_run_id` | `retry_payload_source_predicate` | `scripts/do-guards/do_append_retry_source_1.py:38` | 6 | proved | 2/2 | 8 | 0/0 |
| `retry_source_parent_run_id` | `retry_payload_source_predicate` | `scripts/do-guards/do_append_retry_source_1.py:47` | 6 | proved | 2/2 | 8 | 0/0 |
| `retry_transition_allowed` | `retry_current_transition` | `scripts/do-guards/do_append_retry_transition_1.py:10` | 6 | proved | 2/2 | 0 | 0/0 |

## transport (15 rows, 15 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `transport_event_object` | `payload_types` | `scripts/do-guards/do_transport_types_1.py:10` | 47 | proved | 2/2 | 6 | 0/0 |
| `transport_logical_object` | `payload_types` | `scripts/do-guards/do_transport_types_1.py:14` | 47 | proved | 2/2 | 6 | 0/0 |
| `transport_packs_object` | `payload_types` | `scripts/do-guards/do_transport_types_1.py:18` | 47 | proved | 2/2 | 6 | 0/0 |
| `transport_inline_payload_object` | `payload_types` | `scripts/do-guards/do_transport_types_1.py:22` | 47 | proved | 2/2 | 6 | 0/0 |
| `inline_payload_size` | `inline_payload_over_16k` | `scripts/do-guards/do_transport_inline_1.py:12` | 50 | proved | 2/2 | 2 | 0/0 |
| `inline_payload_join` | `inline_payload_join` | `scripts/do-guards/do_transport_inline_1.py:16` | 47 | proved | 2/2 | 2 | 0/0 |
| `external_payload_empty` | `external_payload_join` | `scripts/do-guards/do_transport_external_1.py:10` | 47 | proved | 2/2 | 8 | 0/0 |
| `external_entry_present` | `external_payload_join` | `scripts/do-guards/do_transport_external_1.py:17` | 25 | proved | 2/2 | 8 | 0/0 |
| `external_entry_value` | `external_payload_join` | `scripts/do-guards/do_transport_external_1.py:24` | 47 | proved | 2/2 | 8 | 0/0 |
| `external_entry_id` | `external_payload_join` | `scripts/do-guards/do_transport_external_1.py:32` | 47 | proved | 2/2 | 8 | 0/0 |
| `external_entry_media` | `external_payload_join` | `scripts/do-guards/do_transport_external_1.py:40` | 47 | proved | 2/2 | 8 | 0/0 |
| `content_entry_present` | `content_reference_join` | `scripts/do-guards/do_transport_content_1.py:10` | 1 | proved | 1/1 | 1 | 0/0 |
| `content_entry_fields` | `content_reference_join` | `scripts/do-guards/do_transport_content_1.py:17` | 1 | proved | 1/1 | 1 | 0/0 |
| `inline_base64_body` | `inline_base64_body` | `scripts/do-guards/do_transport_ingest_1.py:10` | 25 | proved | 2/2 | 0 | 0/0 |
| `payload_encoding` | `payload_encoding` | `scripts/do-guards/do_transport_encoding_1.py:10` | 47 | proved | 2/2 | 0 | 0/0 |

## pack (16 rows, 16 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `pack_shape_object` | `payload_pack_shape` | `scripts/do-guards/do_pack_shape_1.py:12` | 1 | proved | 1/1 | 1 | 0/0 |
| `pack_shape_members` | `payload_pack_shape` | `scripts/do-guards/do_pack_shape_1.py:16` | 1 | proved | 1/1 | 1 | 0/0 |
| `pack_type_byte_size` | `payload_pack_types` | `scripts/do-guards/do_pack_types_1.py:12` | 8 | proved | 2/2 | 7 | 0/0 |
| `pack_type_bytes_durable` | `payload_pack_types` | `scripts/do-guards/do_pack_types_1.py:20` | 8 | proved | 2/2 | 7 | 0/0 |
| `pack_type_index_durable` | `payload_pack_types` | `scripts/do-guards/do_pack_types_1.py:27` | 8 | proved | 2/2 | 7 | 0/0 |
| `pack_type_msgpack_value` | `payload_pack_types` | `scripts/do-guards/do_pack_types_1.py:34` | 8 | proved | 2/2 | 7 | 0/0 |
| `pack_type_text_value` | `payload_pack_types` | `scripts/do-guards/do_pack_types_1.py:41` | 1 | proved | 1/1 | 8 | 0/0 |
| `pack_media_type` | `payload_pack_identifier` | `scripts/do-guards/do_pack_identifier_1.py:14` | 1 | proved | 1/1 | 2 | 0/0 |
| `pack_identifier_string` | `payload_pack_identifier` | `scripts/do-guards/do_pack_identifier_1.py:23` | 1 | proved | 1/1 | 2 | 0/0 |
| `pack_identifier_form` | `payload_pack_identifier` | `scripts/do-guards/do_pack_identifier_1.py:30` | 1 | proved | 1/1 | 2 | 0/0 |
| `pack_encoding` | `payload_pack_encoding` | `scripts/do-guards/do_pack_encoding_1.py:10` | 1 | proved | 1/1 | 0 | 0/0 |
| `pack_identifier_recomputed` | `payload_pack_integrity_or_durability` | `scripts/do-guards/do_pack_integrity_1.py:16` | 1 | proved | 1/1 | 4 | 0/0 |
| `pack_size_recomputed` | `payload_pack_integrity_or_durability` | `scripts/do-guards/do_pack_integrity_1.py:27` | 1 | proved | 1/1 | 4 | 0/0 |
| `pack_bytes_durable` | `payload_pack_integrity_or_durability` | `scripts/do-guards/do_pack_integrity_1.py:37` | 1 | proved | 1/1 | 4 | 0/0 |
| `pack_index_durable` | `payload_pack_integrity_or_durability` | `scripts/do-guards/do_pack_integrity_1.py:43` | 1 | proved | 1/1 | 4 | 0/0 |
| `pack_large_size` | `payload_pack_integrity_or_durability` | `scripts/do-guards/do_pack_integrity_1.py:49` | 1 | proved | 1/1 | 4 | 0/0 |

## retry_context (13 rows, 13 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `retry_context_object` | `retry_context_type` | `scripts/do-guards/do_retry_context_1.py:10` | 1 | proved | 1/1 | 8 | 0/0 |
| `retry_context_interruption_fence` | `retry_context_type` | `scripts/do-guards/do_retry_context_1.py:14` | 25 | proved | 2/2 | 7 | 0/0 |
| `retry_context_permission_current` | `retry_context_type` | `scripts/do-guards/do_retry_context_1.py:21` | 25 | proved | 2/2 | 7 | 0/0 |
| `retry_context_parent_ceiling_current` | `retry_context_type` | `scripts/do-guards/do_retry_context_1.py:28` | 25 | proved | 2/2 | 7 | 0/0 |
| `retry_context_stop_latched` | `retry_context_type` | `scripts/do-guards/do_retry_context_1.py:35` | 25 | proved | 2/2 | 7 | 0/0 |
| `retry_context_deadline_expired` | `retry_context_type` | `scripts/do-guards/do_retry_context_2.py:10` | 25 | proved | 2/2 | 7 | 0/0 |
| `retry_context_same_child_lineage` | `retry_context_type` | `scripts/do-guards/do_retry_context_2.py:17` | 25 | proved | 2/2 | 7 | 0/0 |
| `retry_context_attempt_number` | `retry_context_type` | `scripts/do-guards/do_retry_context_2.py:24` | 30 | proved | 2/2 | 7 | 0/0 |
| `retry_context_prior_attempt_number` | `retry_context_type` | `scripts/do-guards/do_retry_context_2.py:33` | 30 | proved | 2/2 | 7 | 0/0 |
| `retry_context_retry_cause` | `retry_context_type` | `scripts/do-guards/do_retry_context_2.py:42` | 1 | proved | 1/1 | 8 | 0/0 |
| `retry_context_prior_state` | `retry_context_type` | `scripts/do-guards/do_retry_context_3.py:10` | 1 | proved | 1/1 | 2 | 0/0 |
| `retry_context_operation_kind` | `retry_context_type` | `scripts/do-guards/do_retry_context_3.py:17` | 1 | proved | 1/1 | 2 | 0/0 |
| `retry_context_prior_terminal_reason` | `retry_context_type` | `scripts/do-guards/do_retry_context_3.py:24` | 1 | proved | 1/1 | 2 | 0/0 |

## retry_transition (11 rows, 11 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `transition_context_types` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_1.py:10` | 1 | proved | 1/1 | 6 | 0/0 |
| `transition_source_pair` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_1.py:14` | 2 | proved | 2/2 | 5 | 0/0 |
| `transition_interruption_fence` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_1.py:24` | 2 | proved | 2/2 | 5 | 0/0 |
| `transition_not_superseded` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_1.py:33` | 1 | proved | 1/1 | 6 | 0/0 |
| `transition_permission_current` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_1.py:39` | 1 | proved | 1/1 | 6 | 0/0 |
| `transition_parent_ceiling_current` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_2.py:10` | 1 | proved | 1/1 | 5 | 0/0 |
| `transition_stop_not_latched` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_2.py:16` | 1 | proved | 1/1 | 5 | 0/0 |
| `transition_deadline_not_expired` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_2.py:22` | 1 | proved | 1/1 | 5 | 0/0 |
| `transition_same_child_lineage` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_2.py:28` | 1 | proved | 1/1 | 5 | 0/0 |
| `transition_operation_retry` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_2.py:34` | 2 | proved | 2/2 | 4 | 0/0 |
| `transition_attempt_increment` | `retry_current_transition` | `scripts/do-guards/do_retry_transition_3.py:10` | 2 | proved | 2/2 | 0 | 0/0 |

## historical (19 rows, 19 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `historical_state_schema` | `historical_state_schema` | `scripts/do-guards/do_history_state_1.py:10` | 1484 | proved | 2/2 | 0 | 0/0 |
| `historical_reader_event_type` | `historical_reader_identity` | `scripts/do-guards/do_history_reader_1.py:10` | 47 | proved | 2/2 | 8 | 0/0 |
| `historical_reader_id` | `historical_reader_identity` | `scripts/do-guards/do_history_reader_1.py:16` | 72 | proved | 2/2 | 8 | 0/0 |
| `historical_reader_not_withdrawn` | `historical_reader_withdrawn` | `scripts/do-guards/do_history_reader_1.py:22` | 25 | proved | 2/2 | 8 | 0/0 |
| `historical_reader_published` | `historical_reader_withdrawn` | `scripts/do-guards/do_history_reader_1.py:28` | 25 | proved | 2/2 | 8 | 0/0 |
| `historical_schema_supported` | `historical_schema_unsupported` | `scripts/do-guards/do_history_reader_1.py:34` | 72 | proved | 2/2 | 8 | 0/0 |
| `admission_written` | `historical_original_admission` | `scripts/do-guards/do_history_reader_2.py:10` | 72 | proved | 2/2 | 8 | 0/0 |
| `admission_event_type` | `historical_original_admission` | `scripts/do-guards/do_history_reader_2.py:16` | 72 | proved | 2/2 | 8 | 0/0 |
| `admission_family_revision` | `historical_original_admission` | `scripts/do-guards/do_history_reader_2.py:23` | 47 | proved | 2/2 | 8 | 0/0 |
| `admission_payload_schema_id` | `historical_original_admission` | `scripts/do-guards/do_history_reader_2.py:30` | 47 | proved | 2/2 | 8 | 0/0 |
| `admission_event_id` | `historical_original_admission` | `scripts/do-guards/do_history_reader_2.py:37` | 47 | proved | 2/2 | 8 | 0/0 |
| `admission_scope_partition` | `historical_original_admission` | `scripts/do-guards/do_history_reader_3.py:10` | 47 | proved | 2/2 | 8 | 0/0 |
| `admission_storage_instance_id` | `historical_original_admission` | `scripts/do-guards/do_history_reader_3.py:17` | 47 | proved | 2/2 | 8 | 0/0 |
| `original_source_sha256` | `historical_original_source` | `scripts/do-guards/do_history_reader_3.py:24` | 72 | proved | 2/2 | 8 | 0/0 |
| `original_source_ref` | `historical_original_source` | `scripts/do-guards/do_history_reader_3.py:31` | 47 | proved | 2/2 | 8 | 0/0 |
| `original_source_verified` | `historical_original_source` | `scripts/do-guards/do_history_reader_3.py:37` | 72 | proved | 2/2 | 8 | 0/0 |
| `disclosure_access_allowed` | `historical_disclosure_fence` | `scripts/do-guards/do_history_disclosure_1.py:10` | 72 | proved | 2/2 | 4 | 0/0 |
| `disclosure_source_present` | `historical_disclosure_fence` | `scripts/do-guards/do_history_disclosure_1.py:16` | 72 | proved | 2/2 | 4 | 0/0 |
| `disclosure_hold_allows` | `historical_disclosure_fence` | `scripts/do-guards/do_history_disclosure_1.py:22` | 72 | proved | 2/2 | 4 | 0/0 |

## retry (10 rows, 9 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `retry_number_domain` | `number_domain` | `scripts/do-guards/do_retry_number_1.py:10` | 106 | proved | 2/2 | 0 | 0/0 |
| `retry_original_shape` | `retry_value_schema` | `scripts/do-guards/do_retry_shape_1.py:10` | 47 | proved | 2/2 | 2 | 0/0 |
| `retry_candidate_shape` | `retry_value_schema` | `scripts/do-guards/do_retry_shape_1.py:14` | 212 | proved | 2/2 | 2 | 0/0 |
| `retry_replay_only` | `replay_only_not_appendable` | `scripts/do-guards/do_retry_replay_1.py:10` | 53 | proved | 2/2 | 0 | 0/0 |
| `retry_same_scope_kind` | `different_identity` | `scripts/do-guards/do_retry_identity_1.py:10` | 0 | unproved: the same EventRecord if/then: a candidate with another scope_kind also has another project… | 0/0 | 0 | 0/0 |
| `retry_same_project_id` | `different_identity` | `scripts/do-guards/do_retry_identity_2.py:10` | 25 | proved | 2/2 | 6 | 0/0 |
| `retry_same_event_type` | `different_identity` | `scripts/do-guards/do_retry_identity_2.py:16` | 47 | proved | 2/2 | 6 | 0/0 |
| `retry_same_idempotency_key` | `different_identity` | `scripts/do-guards/do_retry_identity_2.py:22` | 47 | proved | 2/2 | 6 | 0/0 |
| `retry_same_event_id` | `different_identity` | `scripts/do-guards/do_retry_identity_2.py:28` | 47 | proved | 2/2 | 6 | 0/0 |
| `retry_same_semantics` | `idempotency_conflict` | `scripts/do-guards/do_retry_semantics_1.py:10` | 53 | proved | 2/2 | 0 | 0/0 |

## board (102 rows, 79 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `board_payload_number_domain` | `number_domain` | `scripts/do-guards/do_board_number_1.py:10` | 10 | proved | 2/2 | 2 | 0/0 |
| `board_envelope_number_domain` | `number_domain` | `scripts/do-guards/do_board_number_1.py:14` | 10 | proved | 2/2 | 2 | 0/0 |
| `board_family_member` | `board_family_payload_join` | `scripts/do-guards/do_board_join_1.py:12` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_payload_schema_id` | `board_family_payload_join` | `scripts/do-guards/do_board_join_1.py:16` | 30 | proved | 2/2 | 8 | 0/0 |
| `board_member_stored_header` | `board_member_stored_header` | `scripts/do-guards/do_board_join_1.py:23` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_scope_partition` | `scope_partition` | `scripts/do-guards/do_board_join_1.py:27` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_envelope_scope` | `envelope_scope` | `scripts/do-guards/do_board_join_1.py:31` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_envelope_run_id` | `envelope_run_id` | `scripts/do-guards/do_board_join_2.py:10` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_envelope_thread_id` | `envelope_thread_id` | `scripts/do-guards/do_board_join_2.py:14` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_envelope_occurred_at_utc` | `envelope_occurred_at_utc` | `scripts/do-guards/do_board_join_2.py:18` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_envelope_project_id` | `envelope_project_id` | `scripts/do-guards/do_board_join_2.py:23` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_replay_only` | `replay_only_not_appendable` | `scripts/do-guards/do_board_join_2.py:27` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_current_replay_policy` | `family_current_replay_policy` | `scripts/do-guards/do_board_join_3.py:10` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_identity_key` | `identity` | `scripts/do-guards/do_board_join_3.py:17` | 10 | proved | 2/2 | 8 | 0/0 |
| `board_identity_event_id` | `identity` | `scripts/do-guards/do_board_join_3.py:21` | 10 | proved | 2/2 | 8 | 0/0 |
| `run_anchor_scope` | `run_anchor_scope` | `scripts/do-guards/do_board_join_3.py:25` | 10 | proved | 2/2 | 8 | 0/0 |
| `run_anchor_storage_instance_id` | `run_anchor_storage_instance_id` | `scripts/do-guards/do_board_join_3.py:32` | 10 | proved | 2/2 | 8 | 0/0 |
| `run_anchor_server_id` | `run_anchor_server_id` | `scripts/do-guards/do_board_join_4.py:10` | 10 | proved | 2/2 | 8 | 0/0 |
| `run_anchor_thread_id` | `run_anchor_thread_id` | `scripts/do-guards/do_board_join_4.py:17` | 10 | proved | 2/2 | 8 | 0/0 |
| `run_anchor_crew_id` | `run_anchor_crew_id` | `scripts/do-guards/do_board_join_4.py:24` | 10 | proved | 2/2 | 8 | 0/0 |
| `run_anchor_run_id` | `run_anchor_run_id` | `scripts/do-guards/do_board_join_4.py:31` | 10 | proved | 2/2 | 8 | 0/0 |
| `run_anchor_project_id` | `run_anchor_project_id` | `scripts/do-guards/do_board_join_4.py:38` | 10 | proved | 2/2 | 8 | 0/0 |
| `run_anchor_kind` | `run_anchor_kind` | `scripts/do-guards/do_board_join_5.py:10` | 10 | proved | 2/2 | 0 | 0/0 |
| `project_source_scope_join` | `source_scope` | `scripts/do-guards/do_board_project_source_1.py:10` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_source_storage_instance_id_join` | `source_storage_instance_id` | `scripts/do-guards/do_board_project_source_1.py:16` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_source_server_id_join` | `source_server_id` | `scripts/do-guards/do_board_project_source_1.py:22` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_source_thread_id_join` | `source_thread_id` | `scripts/do-guards/do_board_project_source_1.py:28` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_source_crew_id_join` | `source_crew_id` | `scripts/do-guards/do_board_project_source_1.py:34` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_source_run_id_join` | `source_run_id` | `scripts/do-guards/do_board_project_source_2.py:10` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_source_operation_id_join` | `source_operation_id` | `scripts/do-guards/do_board_project_source_2.py:16` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_source_project_id_join` | `source_project_id` | `scripts/do-guards/do_board_project_source_2.py:22` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_source_edition` | `source_edition` | `scripts/do-guards/do_board_project_source_2.py:28` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_source_interface` | `source_edition` | `scripts/do-guards/do_board_project_source_2.py:34` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_message_source` | `message_source` | `scripts/do-guards/do_board_project_source_3.py:10` | 4 | proved | 2/2 | 0 | 0/0 |
| `application_source_schema` | `application_source_schema` | `scripts/do-guards/do_board_application_shape_1.py:10` | 10 | proved | 2/2 | 0 | 0/0 |
| `application_input_schema` | `application_input_schema` | `scripts/do-guards/do_board_application_shape_2.py:10` | 0 | unproved: the V1/V2 source schema validates the original input it holds, so an input defect is refus… | 0/0 | 0 | 0/0 |
| `application_wrapper_schema` | `application_wrapper_schema` | `scripts/do-guards/do_board_application_shape_3.py:10` | 2 | proved | 2/2 | 0 | 0/0 |
| `application_wrapper_size` | `application_wrapper_over_16k` | `scripts/do-guards/do_board_application_source_1.py:12` | 5 | proved | 2/2 | 2 | 0/0 |
| `application_body_representation` | `application_message_body_representation` | `scripts/do-guards/do_board_application_source_1.py:18` | 2 | proved | 2/2 | 2 | 0/0 |
| `source_scope_application_scope_identity` | `application_scope_identity` | `scripts/do-guards/do_board_application_source_2.py:10` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `source_scope_outer_project_mismatch` | `outer_project_mismatch` | `scripts/do-guards/do_board_application_source_2.py:16` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `source_scope_project_partition_mismatch` | `project_partition_mismatch` | `scripts/do-guards/do_board_application_source_2.py:22` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `source_scope_server_scope_mismatch` | `server_scope_mismatch` | `scripts/do-guards/do_board_application_source_2.py:28` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `source_scope_application_outer_project` | `application_outer_project` | `scripts/do-guards/do_board_application_source_2.py:34` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `source_scope_application_thread_mismatch` | `application_thread_mismatch` | `scripts/do-guards/do_board_application_source_3.py:10` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `source_scope_wrapper_record_scope_mismatch` | `wrapper_record_scope_mismatch` | `scripts/do-guards/do_board_application_source_3.py:16` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `source_scope_wrapper_record_server_id_mismatch` | `wrapper_record_server_id_mismatch` | `scripts/do-guards/do_board_application_source_3.py:22` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `source_scope_wrapper_record_storage_instance_id_mismatch` | `wrapper_record_storage_instance_id_mismatch` | `scripts/do-guards/do_board_application_source_3.py:28` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `wrapper_scope_application_scope_identity` | `application_scope_identity` | `scripts/do-guards/do_board_application_source_3.py:34` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `wrapper_scope_outer_project_mismatch` | `outer_project_mismatch` | `scripts/do-guards/do_board_application_source_4.py:10` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `wrapper_scope_project_partition_mismatch` | `project_partition_mismatch` | `scripts/do-guards/do_board_application_source_4.py:16` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `wrapper_scope_server_scope_mismatch` | `server_scope_mismatch` | `scripts/do-guards/do_board_application_source_4.py:22` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `wrapper_scope_application_outer_project` | `application_outer_project` | `scripts/do-guards/do_board_application_source_4.py:28` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `wrapper_scope_application_thread_mismatch` | `application_thread_mismatch` | `scripts/do-guards/do_board_application_source_4.py:34` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `wrapper_scope_wrapper_record_scope_mismatch` | `wrapper_record_scope_mismatch` | `scripts/do-guards/do_board_application_source_5.py:10` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `wrapper_scope_wrapper_record_server_id_mismatch` | `wrapper_record_server_id_mismatch` | `scripts/do-guards/do_board_application_source_5.py:16` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `wrapper_scope_wrapper_record_storage_instance_id_mismatch` | `wrapper_record_storage_instance_id_mismatch` | `scripts/do-guards/do_board_application_source_5.py:22` | 0 | unproved: delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_cont… | 0/0 | 0 | 0/0 |
| `application_source_storage_instance_id` | `source_storage_instance_id` | `scripts/do-guards/do_board_application_source_6.py:10` | 6 | proved | 2/2 | 0 | 0/0 |
| `application_source_server_id` | `source_server_id` | `scripts/do-guards/do_board_application_source_7.py:10` | 0 | unproved: the source's server_id must equal its scope's (scope_failures server_scope_mismatch), so a… | 0/0 | 0 | 0/0 |
| `application_wrapper_storage_instance_id` | `source_storage_instance_id` | `scripts/do-guards/do_board_application_source_8.py:10` | 6 | proved | 2/2 | 0 | 0/0 |
| `application_wrapper_server_id` | `source_server_id` | `scripts/do-guards/do_board_application_source_9.py:10` | 0 | unproved: the wrapper's server_id is bound to its scope the same way… | 0/0 | 0 | 0/0 |
| `source_operation_join` | `source_original_join` | `scripts/do-guards/do_board_application_source_10.py:10` | 6 | proved | 2/2 | 2 | 0/0 |
| `source_thread_join` | `source_original_join` | `scripts/do-guards/do_board_application_source_10.py:16` | 2 | proved | 2/2 | 2 | 0/0 |
| `source_scope_join` | `source_original_join` | `scripts/do-guards/do_board_application_source_11.py:10` | 0 | unproved: every scope member is fixed by WorkflowScopeV2 and by scope_failures for an application so… | 0/0 | 0 | 0/0 |
| `wrapper_scope_join` | `source_original_join` | `scripts/do-guards/do_board_application_source_11.py:16` | 0 | unproved: the wrapper's scope is bound the same way… | 0/0 | 0 | 0/0 |
| `wrapper_record_join` | `source_original_join` | `scripts/do-guards/do_board_application_source_12.py:10` | 12 | proved | 2/2 | 8 | 0/0 |
| `source_input_digest` | `source_input_digest` | `scripts/do-guards/do_board_application_source_12.py:16` | 2 | proved | 2/2 | 8 | 0/0 |
| `source_output_digest` | `source_output_digest` | `scripts/do-guards/do_board_application_source_12.py:22` | 6 | proved | 2/2 | 8 | 0/0 |
| `source_digest` | `source_digest` | `scripts/do-guards/do_board_application_source_12.py:28` | 2 | proved | 2/2 | 8 | 0/0 |
| `source_stage_operation` | `source_stage_operation` | `scripts/do-guards/do_board_application_source_12.py:34` | 32 | proved | 2/2 | 8 | 0/0 |
| `source_stage_method` | `source_stage_method` | `scripts/do-guards/do_board_application_source_13.py:10` | 32 | proved | 2/2 | 8 | 0/0 |
| `accepted_source_witness_ref` | `accepted_original_source_join` | `scripts/do-guards/do_board_application_source_13.py:20` | 14 | proved | 2/2 | 8 | 0/0 |
| `accepted_source_witness_value` | `accepted_original_source_join` | `scripts/do-guards/do_board_application_source_13.py:26` | 12 | proved | 2/2 | 8 | 0/0 |
| `accepted_source_sha256` | `accepted_original_source_join` | `scripts/do-guards/do_board_application_source_13.py:36` | 6 | proved | 2/2 | 8 | 0/0 |
| `wrapper_physical_digest` | `wrapper_physical_digest` | `scripts/do-guards/do_board_application_source_13.py:44` | 14 | proved | 2/2 | 8 | 0/0 |
| `source_stage_status` | `source_stage_status` | `scripts/do-guards/do_board_application_source_14.py:13` | 90 | proved | 2/2 | 8 | 0/0 |
| `stage_evidence_present` | `source_stage_evidence` | `scripts/do-guards/do_board_application_source_14.py:23` | 30 | proved | 2/2 | 8 | 0/0 |
| `stage_request_ref` | `source_stage_evidence` | `scripts/do-guards/do_board_application_source_14.py:33` | 30 | proved | 2/2 | 8 | 0/0 |
| `stage_result_ref` | `source_stage_evidence` | `scripts/do-guards/do_board_application_source_14.py:45` | 30 | proved | 2/2 | 8 | 0/0 |
| `stage_witness_ref` | `source_stage_evidence` | `scripts/do-guards/do_board_application_source_14.py:56` | 60 | proved | 2/2 | 8 | 0/0 |
| `stage_witness_value` | `source_stage_evidence` | `scripts/do-guards/do_board_application_source_15.py:13` | 180 | proved | 2/2 | 8 | 0/0 |
| `stage_witness_sha256` | `source_stage_evidence` | `scripts/do-guards/do_board_application_source_15.py:32` | 30 | proved | 2/2 | 8 | 0/0 |
| `message_thread_id` | `message_thread_id` | `scripts/do-guards/do_board_application_source_15.py:51` | 6 | proved | 2/2 | 8 | 0/0 |
| `message_crew_id` | `message_crew_id` | `scripts/do-guards/do_board_application_source_15.py:57` | 6 | proved | 2/2 | 8 | 0/0 |
| `message_run_id` | `message_run_id` | `scripts/do-guards/do_board_application_source_15.py:63` | 6 | proved | 2/2 | 8 | 0/0 |
| `application_message_source` | `message_source` | `scripts/do-guards/do_board_application_source_16.py:10` | 6 | proved | 2/2 | 2 | 0/0 |
| `wrapper_key_join` | `wrapper_key_join` | `scripts/do-guards/do_board_application_source_16.py:16` | 6 | proved | 2/2 | 2 | 0/0 |
| `posted_application_subject` | `message_subject` | `scripts/do-guards/do_board_posted_1.py:10` | 2 | proved | 2/2 | 8 | 0/0 |
| `posted_application_priority` | `message_priority` | `scripts/do-guards/do_board_posted_1.py:18` | 2 | proved | 2/2 | 8 | 0/0 |
| `posted_application_target_type` | `message_target_type` | `scripts/do-guards/do_board_posted_1.py:26` | 2 | proved | 2/2 | 8 | 0/0 |
| `posted_application_sender` | `message_sender` | `scripts/do-guards/do_board_posted_1.py:34` | 2 | proved | 2/2 | 8 | 0/0 |
| `posted_application_target` | `message_target` | `scripts/do-guards/do_board_posted_1.py:42` | 2 | proved | 2/2 | 8 | 0/0 |
| `posted_application_inline_text` | `message_content_join` | `scripts/do-guards/do_board_posted_2.py:10` | 1 | proved | 1/1 | 7 | 0/0 |
| `posted_application_payload_ref` | `message_content_join` | `scripts/do-guards/do_board_posted_2.py:18` | 1 | proved | 1/1 | 7 | 0/0 |
| `posted_project_message_id` | `message_message_id` | `scripts/do-guards/do_board_posted_2.py:30` | 2 | proved | 2/2 | 6 | 0/0 |
| `posted_project_from_agent_id` | `message_from_agent_id` | `scripts/do-guards/do_board_posted_2.py:38` | 2 | proved | 2/2 | 6 | 0/0 |
| `posted_project_subject` | `message_subject` | `scripts/do-guards/do_board_posted_2.py:46` | 2 | proved | 2/2 | 6 | 0/0 |
| `posted_project_priority` | `message_priority` | `scripts/do-guards/do_board_posted_3.py:10` | 2 | proved | 2/2 | 7 | 0/0 |
| `posted_project_to_agent_id` | `message_to_agent_id` | `scripts/do-guards/do_board_posted_3.py:18` | 2 | proved | 2/2 | 7 | 0/0 |
| `posted_project_to_agent_type` | `message_to_agent_type` | `scripts/do-guards/do_board_posted_3.py:26` | 2 | proved | 2/2 | 7 | 0/0 |
| `posted_project_content` | `message_content_join` | `scripts/do-guards/do_board_posted_3.py:34` | 1 | proved | 1/1 | 8 | 0/0 |
| `posted_project_content_ref` | `message_content_join` | `scripts/do-guards/do_board_posted_3.py:42` | 2 | proved | 2/2 | 7 | 0/0 |

## project_input (57 rows, 57 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `project_source_object` | `project_original_input_shape` | `scripts/do-guards/do_project_input_shape_1.py:13` | 1 | proved | 1/1 | 3 | 0/0 |
| `project_source_members` | `project_original_input_shape` | `scripts/do-guards/do_project_input_shape_1.py:17` | 1 | proved | 1/1 | 3 | 0/0 |
| `project_message_object` | `project_original_input_shape` | `scripts/do-guards/do_project_input_shape_1.py:24` | 1 | proved | 1/1 | 3 | 0/0 |
| `project_message_members` | `project_original_input_shape` | `scripts/do-guards/do_project_input_shape_1.py:30` | 1 | proved | 1/1 | 3 | 0/0 |
| `project_source_scope_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_1.py:10` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_storage_instance_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_1.py:16` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_server_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_1.py:22` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_thread_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_1.py:28` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_crew_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_1.py:34` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_run_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_2.py:10` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_operation_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_2.py:16` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_project_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_2.py:22` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_edition_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_2.py:28` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_interface_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_2.py:34` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_message_schema_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_3.py:10` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_source_message_ids_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_3.py:16` | 28 | proved | 2/2 | 8 | 0/0 |
| `project_source_message_ids_items` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_3.py:22` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_message_message_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_3.py:34` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_message_from_agent_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_3.py:40` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_message_from_platform_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_4.py:10` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_message_to_agent_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_4.py:16` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_message_to_agent_type_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_4.py:22` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_message_to_node_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_4.py:28` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_message_to_lane_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_4.py:34` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_message_message_type_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_5.py:10` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_message_priority_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_5.py:16` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_message_subject_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_5.py:22` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_message_content_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_5.py:28` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_message_content_ref_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_5.py:34` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_message_context_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_6.py:10` | 28 | proved | 2/2 | 8 | 0/0 |
| `project_message_thread_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_6.py:16` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_message_in_reply_to_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_6.py:22` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_message_created_at_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_6.py:28` | 24 | proved | 2/2 | 8 | 0/0 |
| `project_message_read_by_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_6.py:34` | 28 | proved | 2/2 | 8 | 0/0 |
| `project_message_resolved_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_7.py:12` | 28 | proved | 2/2 | 8 | 0/0 |
| `project_message_read_by_items` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_7.py:18` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_context_members` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_7.py:30` | 4 | proved | 2/2 | 8 | 0/0 |
| `project_context_sender_node` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_7.py:39` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_context_files_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_7.py:49` | 28 | proved | 2/2 | 8 | 0/0 |
| `project_context_files_items` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_8.py:12` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_context_operations_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_8.py:24` | 28 | proved | 2/2 | 8 | 0/0 |
| `project_context_operations_items` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_8.py:33` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_context_related_message_ids_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_8.py:45` | 28 | proved | 2/2 | 8 | 0/0 |
| `project_context_related_message_ids_items` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_8.py:54` | 20 | proved | 2/2 | 8 | 0/0 |
| `project_content_ref_members` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_9.py:12` | 4 | proved | 2/2 | 6 | 0/0 |
| `project_content_ref_blake3_id_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_9.py:21` | 6 | proved | 2/2 | 6 | 0/0 |
| `project_content_ref_media_type_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_9.py:30` | 6 | proved | 2/2 | 6 | 0/0 |
| `project_content_ref_byte_size_type` | `project_original_input_type` | `scripts/do-guards/do_project_input_type_9.py:39` | 6 | proved | 2/2 | 6 | 0/0 |
| `project_message_type_value` | `project_original_input_value` | `scripts/do-guards/do_project_input_value_1.py:10` | 12 | proved | 2/2 | 8 | 0/0 |
| `project_priority_value` | `project_original_input_value` | `scripts/do-guards/do_project_input_value_1.py:16` | 12 | proved | 2/2 | 8 | 0/0 |
| `project_message_schema_value` | `project_original_input_value` | `scripts/do-guards/do_project_input_value_1.py:22` | 8 | proved | 2/2 | 8 | 0/0 |
| `project_created_at_value` | `project_original_input_value` | `scripts/do-guards/do_project_input_value_1.py:28` | 12 | proved | 2/2 | 8 | 0/0 |
| `project_body_representation` | `project_original_input_value` | `scripts/do-guards/do_project_input_value_1.py:34` | 6 | proved | 2/2 | 8 | 0/0 |
| `project_inline_body_value` | `project_original_input_value` | `scripts/do-guards/do_project_input_value_2.py:13` | 1 | proved | 1/1 | 6 | 0/0 |
| `project_ref_identifier_value` | `project_original_input_value` | `scripts/do-guards/do_project_input_value_2.py:21` | 2 | proved | 2/2 | 5 | 0/0 |
| `project_ref_size_value` | `project_original_input_value` | `scripts/do-guards/do_project_input_value_2.py:32` | 2 | proved | 2/2 | 5 | 0/0 |
| `project_ref_media_value` | `project_original_input_value` | `scripts/do-guards/do_project_input_value_2.py:41` | 2 | proved | 2/2 | 5 | 0/0 |

## board_member (5 rows, 5 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `member_definition_present` | `board_member_definition_missing` | `scripts/do-guards/do_board_member_1.py:10` | 3 | proved | 2/2 | 8 | 0/0 |
| `member_stored_header_property` | `board_member_stored_header` | `scripts/do-guards/do_board_member_1.py:14` | 3 | proved | 2/2 | 8 | 0/0 |
| `member_stored_header_required` | `board_member_stored_header` | `scripts/do-guards/do_board_member_1.py:21` | 3 | proved | 2/2 | 8 | 0/0 |
| `member_schema_id` | `board_member_schema_id` | `scripts/do-guards/do_board_member_1.py:28` | 3 | proved | 2/2 | 8 | 0/0 |
| `member_copy` | `board_member_copy_drift` | `scripts/do-guards/do_board_member_1.py:35` | 3 | proved | 2/2 | 8 | 0/0 |

## selected (2 rows, 2 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `selected_workflow_contracts` | `successor_selected_definitions` | `scripts/do-guards/do_selected_definitions_1.py:10` | 6 | proved | 2/2 | 2 | 0/0 |
| `selected_shared_runtime` | `successor_selected_definitions` | `scripts/do-guards/do_selected_definitions_1.py:16` | 8 | proved | 2/2 | 2 | 0/0 |

## coordination_storage (1 rows, 1 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `coordination_storage_member` | `actual_coordination_storage_member_drift` | `scripts/do-guards/do_coordination_storage_1.py:10` | 2 | proved | 2/2 | 0 | 0/0 |

## successor (32 rows, 32 proved)

| Row | Code | Where | Matrix | Tool | own/flips | stays | masked/unrelated |
|---|---|---|---:|---|---:|---:|---:|
| `successor_schema_references` | `unresolved_schema_reference` | `scripts/do-guards/do_successor_1.py:10` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_graph_digest` | `successor_graph_digest` | `scripts/do-guards/do_successor_1.py:14` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_resource_paths` | `successor_resource_selection` | `scripts/do-guards/do_successor_1.py:18` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_resource_count` | `successor_resource_selection` | `scripts/do-guards/do_successor_1.py:22` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_resource_hashes` | `successor_resource_selection` | `scripts/do-guards/do_successor_1.py:26` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_method` | `successor_method_selection` | `scripts/do-guards/do_successor_graph_1.py:13` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_method_count` | `successor_method_selection` | `scripts/do-guards/do_successor_graph_1.py:21` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_graph_id` | `successor_complete_graph` | `scripts/do-guards/do_successor_graph_1.py:25` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_graph_edges` | `successor_complete_graph` | `scripts/do-guards/do_successor_graph_1.py:29` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_graph_methods` | `successor_complete_graph` | `scripts/do-guards/do_successor_graph_1.py:33` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_graph_physical_ids` | `successor_complete_graph` | `scripts/do-guards/do_successor_graph_2.py:12` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_graph_selectors` | `successor_complete_graph` | `scripts/do-guards/do_successor_graph_2.py:17` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_graph_readers` | `successor_complete_graph` | `scripts/do-guards/do_successor_graph_2.py:22` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_physical_wrapper` | `successor_physical_selection` | `scripts/do-guards/do_successor_graph_2.py:27` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_physical_codec` | `successor_physical_selection` | `scripts/do-guards/do_successor_graph_2.py:31` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_physical_algorithm` | `successor_physical_selection` | `scripts/do-guards/do_successor_graph_3.py:10` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_physical_key_prefix` | `successor_physical_selection` | `scripts/do-guards/do_successor_graph_3.py:15` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_rbr_reader` | `successor_read_backup_restore` | `scripts/do-guards/do_successor_graph_3.py:20` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_rbr_backup` | `successor_read_backup_restore` | `scripts/do-guards/do_successor_graph_3.py:25` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_rbr_restore` | `successor_read_backup_restore` | `scripts/do-guards/do_successor_graph_3.py:30` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_rbr_wrapper` | `successor_read_backup_restore` | `scripts/do-guards/do_successor_graph_4.py:10` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_rbr_source` | `successor_read_backup_restore` | `scripts/do-guards/do_successor_graph_4.py:16` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_rbr_owner` | `successor_read_backup_restore` | `scripts/do-guards/do_successor_graph_4.py:22` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_rbr_backup_owner` | `successor_read_backup_restore` | `scripts/do-guards/do_successor_graph_4.py:27` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_rbr_fences` | `successor_read_backup_restore` | `scripts/do-guards/do_successor_graph_4.py:32` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_storage_member` | `successor_storage_member` | `scripts/do-guards/do_successor_storage_count_1.py:10` | 1 | proved | 1/1 | 0 | 0/0 |
| `successor_storage_value_schema` | `successor_storage_selection` | `scripts/do-guards/do_successor_storage_1.py:10` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_storage_schema_version` | `successor_storage_selection` | `scripts/do-guards/do_successor_storage_1.py:16` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_storage_value_schema_id` | `successor_storage_selection` | `scripts/do-guards/do_successor_storage_1.py:22` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_storage_value_schema_ref` | `successor_storage_selection` | `scripts/do-guards/do_successor_storage_1.py:29` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_storage_profile` | `successor_storage_selection` | `scripts/do-guards/do_successor_storage_1.py:36` | 1 | proved | 1/1 | 4 | 0/0 |
| `successor_storage_key_shape` | `successor_storage_selection` | `scripts/do-guards/do_successor_storage_2.py:10` | 1 | proved | 1/1 | 0 | 0/0 |


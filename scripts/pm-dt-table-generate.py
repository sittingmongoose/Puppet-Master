#!/usr/bin/env python3
"""Write the DT Method B phase-table modules (scripts/pm_dt_table_*.py) from one row spec.

Usage: python3 scripts/pm-dt-table-generate.py scripts [--check]
Spec rows: (name, field, words, code, condition). The condition is the refusal test over the
phase observation `value`; FIELDS is every `value['...']` key the rows of the phase read.
One module per phase table, at most seven rows each, so the shared tool certifies small modules.
The generated modules are the checked-in source of truth; regenerate and diff after editing a row.
--check exits 1 when a module is stale, missing or extra.
"""
import re
import sys
from pathlib import Path

TRANSITION = 'transition_refused'
UNAVAILABLE = 'unavailable'
PHASES = {}


def phase(name, doc, rows):
    assert name not in PHASES and 1 <= len(rows) <= 7, name
    PHASES[name] = (doc, rows)


# ------------------------------------------------------------------ source_valid
phase('src_envelope', 'source_valid: historical mode type and the complete EventRecord envelope.', [
    ('SV01_historical_mode_type', '/historical', 'the historical-reader flag is exactly a bool', 'schema_refused',
     "value['historical_type'] != 'bool'"),
    ('SV02_event_schema', '/event', 'the EventRecord schema reports no error', 'schema_refused',
     "value['event_schema_errors'] != 0"),
])
phase('src_replay', 'source_valid: current-writer replay policy (standing check 1).', [
    ('SV03_replay_only_refused', '/event/replay_policy', 'a current writer never appends projector_replay_only', 'replay_only_not_appendable',
     "value['historical'] is False and value['replay_policy'] == 'projector_replay_only'"),
    ('SV04_writer_replay_policy', '/event/replay_policy', 'a current writer appends only dedupe_by_idempotency_key', 'join_refused',
     "value['historical'] is False and value['replay_policy'] not in ('dedupe_by_idempotency_key', 'projector_replay_only')"),
])
phase('src_inline', 'source_valid: SP-337 inline body route (standing check 4).', [
    ('SV05_inline_encodable', '/event/payload', 'an inline body has a CV-366 MessagePack encoding', 'schema_refused',
     "value['inline'] is True and value['inline_size'] is None"),
    ('SV06_inline_limit', '/event/payload', 'an inline body encodes to at most 16384 bytes', 'payload_ref_required',
     "value['inline'] is True and value['inline_size'] is not None and value['inline_size'] > 16384"),
])
phase('src_definition', 'source_valid: the captured scope has a source definition.', [
    ('SV07_source_definition', '/completed/envelope_context/scope_kind', 'the captured scope has a declared source schema', 'scope_refused',
     "value['definition_present'] is not True"),
])
phase('src_schema', 'source_valid: both original stages satisfy their source schema.', [
    ('SV08_prepared_schema', '/prepared', 'the prepared stage satisfies the source schema', 'schema_refused',
     "value['prepared_errors'] != 0"),
    ('SV09_completed_schema', '/completed', 'the completed stage satisfies the source schema', 'schema_refused',
     "value['completed_errors'] != 0"),
])
phase('src_size', 'source_valid: each original stage is at most 1 MiB in its source codec.', [
    ('SV10_prepared_size', '/prepared', 'the prepared stage encodes to at most 1048576 bytes', 'source_stage_too_large',
     "value['prepared_size'] > 1048576"),
    ('SV11_completed_size', '/completed', 'the completed stage encodes to at most 1048576 bytes', 'source_stage_too_large',
     "value['completed_size'] > 1048576"),
])
phase('src_stage', 'source_valid: original stage order (the source schema stage clause decides the same fact first).', [
    ('SV12_prepared_stage', '/prepared/stage', 'is prepared', 'original_source_refused', "value['prepared_stage'] != 'prepared'"),
    ('SV13_completed_stage', '/completed/stage', 'is completed', 'original_source_refused', "value['completed_stage'] != 'completed'"),
])
phase('src_original', 'source_valid: prepare commitment and immutable closure.', [
    ('SV14_prepare_commitment', '/completed/prepared_sha256', 'equals SHA-256 of the prepared stage source bytes', 'original_source_refused',
     "value['prepared_commitment'] != value['recomputed_commitment']"),
    ('SV15_immutable_closure', '/completed', 'every immutable field equals its prepared copy', 'original_source_refused',
     "value['immutable_mismatches'] != []"),
    ('SV16_envelope_closure', '/completed/envelope_context', 'every envelope field but occurred_at_utc equals its prepared copy', 'original_source_refused',
     "value['envelope_mismatches'] != []"),
])
phase('src_scope', 'source_valid: event scope and encoded partition (standing checks 2 and 3).', [
    ('SV17_scope_kind', '/event/scope_kind', 'equals the captured envelope scope kind', 'scope_refused',
     "value['event_scope_kind'] != value['captured_scope_kind']"),
    ('SV18_scope_partition', '/completed/scope_partition', 'equals the encoded partition of the event (scope kinds agreeing)', 'scope_refused',
     "value['event_scope_kind'] == value['captured_scope_kind'] and value['event_partition'] != value['captured_partition']"),
])
phase('src_project_only', 'source_valid: project-only scope (SV07 and SV17 decide the same fact first).', [
    ('SV19_project_only_scope', '/event/scope_kind', 'is project for a project-only family', 'scope_refused',
     "value['scope_policy'] == 'project_only' and value['event_scope_kind'] != 'project'"),
])
phase('src_payload', 'source_valid: inline body join or verified SP-337 pack body.', [
    ('SV20_ref_verified', '/payload_ref_verified', 'a referenced body is verified exactly True', 'payload_unavailable',
     "value['route'] == 'ref' and value['payload_ref_verified'] is not True"),
    ('SV21_ref_body', '/resolved_payload', 'the resolved body equals the captured payload bytes', 'payload_unavailable',
     "value['route'] == 'ref' and value['resolved_digest'] != value['captured_payload_digest']"),
    ('SV22_inline_body', '/event/payload', 'the inline body equals the captured payload bytes', 'join_refused',
     "value['route'] == 'inline' and value['event_payload_digest'] != value['captured_payload_digest']"),
])
phase('src_join', 'source_valid: envelope, family and subject joins.', [
    ('SV23_envelope_copies', '/event', 'every captured envelope field but scope_kind equals the event field', 'join_refused',
     "value['envelope_copy_mismatches'] != []"),
    ('SV24_event_type', '/event/event_type', 'equals the contract event type', 'join_refused',
     "value['event_type'] != value['contract_event_type']"),
    ('SV25_payload_schema', '/event/payload_schema_id', 'equals the contract payload schema id', 'join_refused',
     "value['payload_schema_id'] != value['contract_payload_schema_id']"),
    ('SV26_subject_copies', '/completed/subject', 'every identity field equals its captured subject copy', 'join_refused',
     "value['subject_mismatches'] != []"),
])
phase('src_identity', 'source_valid: recomputed identity copies.', [
    ('SV27_event_key', '/event/idempotency_key', 'equals the recomputed idempotency key', 'identity_refused',
     "value['event_key'] != value['key']"),
    ('SV28_event_id', '/event/event_id', 'equals the recomputed event id', 'identity_refused',
     "value['event_id'] != value['eid']"),
    ('SV29_captured_key', '/completed/idempotency_key', 'equals the recomputed idempotency key', 'identity_refused',
     "value['captured_key'] != value['key']"),
    ('SV30_captured_id', '/completed/event_id', 'equals the recomputed event id', 'identity_refused',
     "value['captured_event_id'] != value['eid']"),
])
phase('src_context', 'source_valid: payload, occurrence, runtime, Usage and web-parent joins.', [
    ('SV31_payload_envelope_ids', '/completed/payload', 'every payload envelope id equals the event field', 'join_refused',
     "value['payload_envelope_mismatches'] != []"),
    ('SV32_occurrence_time', '/event/occurred_at_utc', 'equals the payload occurrence time', 'join_refused',
     "value['occurred_at_utc'] != value['payload_time']"),
    ('SV33_runtime_context', '/completed/runtime_context', 'every runtime context value equals its payload copy', 'join_refused',
     "value['runtime_mismatches'] != []"),
    ('SV34_usage_event_ref', '/completed/payload/usage_event_ref', 'a Usage payload names the event id', 'join_refused',
     "value['family'] == 'usage.event' and value['usage_event_ref'] != value['event_id']"),
    ('SV35_web_parent', '/event/parent_event_id', 'a web tool event names the web request parent', 'join_refused',
     "value['web_parent_applies'] is True and value['event_parent_event_id'] != value['web_parent_event_id']"),
])

# ------------------------------------------------------------------ identity
phase('id_inputs', 'identity: exact integer subject and original application operation.', [
    ('ID01_blocked_sequence', '/payload/blocked_sequence', 'an identity blocked_sequence is an unsigned JSON Schema integer', 'schema_refused',
     "value['blocked_in_identity'] is True and value['blocked_valid'] is False"),
    ('ID02_application_present', '/application', 'an application partition carries its original application identity', 'missing original application identity',
     "value['application_partition'] is True and value['application_present'] is False"),
    ('ID03_application_operation', '/application/owner_operation_id', 'equals the recomputed original application operation', 'wrong original application operation',
     "value['application_partition'] is True and value['application_present'] is True and value['recomputed_operation'] != value['owner_operation_id']"),
])

# ------------------------------------------------------------------ append / retry
phase('append_types', 'append_model: exact string retry key and digest.', [
    ('AM01_key_type', '/key', 'the idempotency key is exactly a str', 'schema_refused', "value['key_type'] != 'str'"),
    ('AM02_digest_type', '/digest', 'the caller semantic digest is exactly a str', 'schema_refused', "value['digest_type'] != 'str'"),
])
phase('append_retry', 'append_model: a retry of a stored key returns the original only on the same digest.', [
    ('AM03_same_digest', '/digest', 'equals the stored digest string exactly', 'idempotency_conflict',
     "value['stored_digest_type'] != 'str' or value['stored_digest'] != value['digest']"),
])

# ------------------------------------------------------------------ recovery
phase('rec_gate', 'recovery: replay policy and admission.', [
    ('RC01_replay_only', '/replay_policy', 'retry never selects projector_replay_only', 'replay_only_not_appendable',
     "value['replay_policy'] == 'projector_replay_only'"),
    ('RC02_admitted_type', '/admitted', 'is exactly a bool', 'admission_refused', "value['admitted_type'] != 'bool'"),
    ('RC03_admitted', '/admitted', 'is True', 'admission_refused', "value['admitted'] is False"),
])
phase('rec_custody', 'recovery: original-owner custody adapter flags.', [
    ('RC04_custody_types', '/case', 'source_present, owner_proven, backup_coherent, permission and deleted are exactly bools', UNAVAILABLE,
     "value['nonbool_flags'] != []"),
    ('RC05_source_present', '/source_present', 'is True', UNAVAILABLE, "value['source_present'] is False"),
    ('RC06_owner_proven', '/owner_proven', 'is True', UNAVAILABLE, "value['owner_proven'] is False"),
    ('RC07_backup_coherent', '/backup_coherent', 'is True', UNAVAILABLE, "value['backup_coherent'] is False"),
    ('RC08_permission', '/permission', 'is True', UNAVAILABLE, "value['permission'] is False"),
    ('RC09_not_deleted', '/deleted', 'is False', UNAVAILABLE, "value['deleted'] is True"),
])
phase('rec_commit', 'recovery: committed owner outcome and the complete envelope.', [
    ('RC10_committed_type', '/outcome_committed', 'is exactly a bool', 'fenced', "value['committed_type'] != 'bool'"),
    ('RC11_committed', '/outcome_committed', 'is True', 'fenced', "value['outcome_committed'] is False"),
    ('RC12_event_schema', '/event', 'the EventRecord schema reports no error', UNAVAILABLE, "value['event_schema_errors'] != 0"),
])
phase('rec_original', 'recovery: the frozen Storage/owner adapter originals.', [
    ('RC13_original_prepared', '/recovery_original/prepared', 'source bytes equal the prepared stage bytes', UNAVAILABLE,
     "value['prepared_digest'] != value['original_prepared_digest']"),
    ('RC14_original_completed', '/recovery_original/completed', 'source bytes equal the completed stage bytes', UNAVAILABLE,
     "value['completed_digest'] != value['original_completed_digest']"),
    ('RC15_original_event', '/recovery_original/event', 'canonical bytes equal the event', UNAVAILABLE,
     "value['event_digest'] != value['original_event_digest']"),
    ('RC16_stage_flag_types', '/case', 'completed_present and append_issued are exactly bools', UNAVAILABLE,
     "value['nonbool_stage_flags'] != []"),
])
phase('rec_receipt', 'recovery: receipt custody and full flush.', [
    ('RC17_receipt_flag_types', '/case', 'receipt_custody and full_flush are exactly bools', 'fenced', "value['nonbool_receipt_flags'] != []"),
    ('RC18_receipt_custody', '/receipt_custody', 'is True', 'fenced', "value['receipt_custody'] is False"),
    ('RC19_full_flush', '/full_flush', 'is True', 'fenced', "value['full_flush'] is False"),
])
phase('rec_receipt_join', 'recovery: first append receipt joins.', [
    ('RC20_receipt_event_id', '/first_append_receipt/event_id', 'canonical bytes equal the event id', UNAVAILABLE,
     "value['receipt_event_id'] != value['event_event_id']"),
    ('RC21_receipt_sequence', '/first_append_receipt/sequence_id', 'canonical bytes equal the Storage sequence id', UNAVAILABLE,
     "value['receipt_sequence_id'] != value['event_sequence_id']"),
    ('RC22_original_receipt', '/recovery_original/receipt', 'canonical bytes equal the first append receipt', UNAVAILABLE,
     "value['receipt_digest'] != value['original_receipt_digest']"),
])

# ------------------------------------------------------------------ checkpoint
phase('cp_schema', 'checkpoint_result: prior and proposed checkpoint schemas, rebuild flag type.', [
    ('CP01_previous_schema', '/previous', 'a prior checkpoint satisfies the checkpoint schema', 'schema_refused',
     "value['previous_present'] is True and value['previous_errors'] != 0"),
    ('CP02_rebuild_type', '/context/governed_rebuild', 'is exactly a bool', UNAVAILABLE, "value['governed_type'] != 'bool'"),
    ('CP03_proposed_schema', '/proposed', 'the proposed checkpoint satisfies the checkpoint schema', 'schema_refused',
     "value['proposed_errors'] != 0"),
])
phase('cp_lifecycle', 'checkpoint_result: admission, reader, withdrawal, permission and deletion.', [
    ('CP04_lifecycle_types', '/context', 'admitted, reader_installed, withdrawn, permission and deleted are exactly bools', UNAVAILABLE,
     "value['nonbool_flags'] != []"),
    ('CP05_admitted', '/context/admitted', 'is True', UNAVAILABLE, "value['admitted'] is False"),
    ('CP06_reader_installed', '/context/reader_installed', 'is True', UNAVAILABLE, "value['reader_installed'] is False"),
    ('CP07_not_withdrawn', '/context/withdrawn', 'is False', UNAVAILABLE, "value['withdrawn'] is True"),
    ('CP08_permission', '/context/permission', 'is True', UNAVAILABLE, "value['permission'] is False"),
    ('CP09_not_deleted', '/context/deleted', 'is False', UNAVAILABLE, "value['deleted'] is True"),
])
phase('cp_cas', 'checkpoint_result: lease and compare-and-swap previous value.', [
    ('CP10_lease_type', '/context/lease_current', 'is exactly a bool', 'cas_lost', "value['lease_type'] != 'bool'"),
    ('CP11_expected_previous', '/context/expected_previous', 'canonical bytes equal the prior checkpoint', 'cas_lost',
     "value['expected_previous_digest'] != value['previous_digest']"),
    ('CP12_lease_current', '/context/lease_current', 'is True', 'cas_lost', "value['lease_current'] is False"),
])
phase('cp_token', 'checkpoint_result: read token, Storage identity and token bindings (standing check 7).', [
    ('CP13_current_token', '/proposed/index_read_token', 'canonical bytes equal the current token', 'source_changed',
     "value['token_digest'] != value['current_token_digest']"),
    ('CP14_token_storage', '/proposed/index_read_token/storage_instance_id', 'equals the verified source Storage instance', 'source_changed',
     "value['token_storage'] != value['source_storage']"),
    ('CP15_checkpoint_storage', '/proposed/storage_instance_id', 'equals the token Storage instance', 'source_changed',
     "value['proposed_storage'] != value['token_storage']"),
    ('CP16_selection_storage', '/proposed/index_read_token/source_selection/storage_instance_id', 'equals the token Storage instance', 'source_changed',
     "value['selection_storage'] != value['token_storage']"),
    ('CP17_checkpoint_key', '/proposed/index_read_token/checkpoint_key', 'is event_record_index_checkpoint.v1 of the token Storage instance', 'source_changed',
     "value['checkpoint_key'] != value['expected_key']"),
    ('CP18_checkpoint_ref', '/proposed/index_read_token/checkpoint_ref', 'is the key plus the generation pointer', 'source_changed',
     "value['checkpoint_ref'] != value['expected_ref']"),
    ('CP19_dataset_name', '/proposed/index_read_token/index_dataset_name', 'is event_record_index.v2 at the generation', 'source_changed',
     "value['dataset_name'] != value['expected_dataset']"),
])
phase('cp_source', 'checkpoint_result: verified source coverage flags and partition.', [
    ('CP20_source_types', '/context', 'source_verified, coverage_complete and versions_supported are exactly bools', UNAVAILABLE,
     "value['nonbool_flags'] != []"),
    ('CP21_partition', '/proposed/scope_partition', 'equals the verified source partition', UNAVAILABLE,
     "value['proposed_partition'] != value['context_partition']"),
    ('CP22_source_verified', '/context/source_verified', 'is True', UNAVAILABLE, "value['source_verified'] is False"),
    ('CP23_coverage_complete', '/context/coverage_complete', 'is True', UNAVAILABLE, "value['coverage_complete'] is False"),
    ('CP24_versions_supported', '/context/versions_supported', 'is True', UNAVAILABLE, "value['versions_supported'] is False"),
])
phase('cp_rows', 'checkpoint_result: the verified global source rows are well formed.', [
    ('CP25_rows_list', '/context/source_rows', 'is exactly a list', UNAVAILABLE, "value['rows_type'] != 'list'"),
    ('CP26_rows_objects', '/context/source_rows', 'every row is exactly an object', UNAVAILABLE, "value['non_object_rows'] != 0"),
    ('CP27_rows_sequence', '/context/source_rows/sequence_id', 'every row sequence_id is an unsigned JSON Schema integer', UNAVAILABLE,
     "value['bad_sequence_rows'] != 0"),
    ('CP28_rows_strings', '/context/source_rows', 'every row event_type, event_id and scope_partition is a nonempty str', UNAVAILABLE,
     "value['bad_string_rows'] != 0"),
])
phase('cp_prefix', 'checkpoint_result: the verified prefix commitment.', [
    ('CP29_verified_prefix', '/context/verified_prefix', 'canonical bytes equal the token, row-set digest, count and range', UNAVAILABLE,
     "value['prefix_digest'] != value['expected_prefix_digest']"),
])
phase('cp_coverage', 'checkpoint_result: examined cursor, last applied event and filter.', [
    ('CP30_examined_through', '/proposed/examined_through_sequence_id', 'canonical bytes equal the global row cursor', 'coverage_refused',
     "value['examined_through'] != value['through']"),
    ('CP31_last_applied', '/proposed/last_applied_event_id', 'equals the last matching row event id', 'coverage_refused',
     "value['last_applied_event_id'] != value['last_matching_event_id']"),
    ('CP32_filter_complete', '/proposed/filter_complete', 'is truthy', 'coverage_refused', "value['filter_complete_truthy'] is False"),
])
phase('cp_state', 'checkpoint_result: publication state, withdrawn and rollback cursors.', [
    ('CP33_state_current', '/proposed/state', 'is current', UNAVAILABLE, "value['state'] != 'current'"),
    ('CP34_health', '/proposed/health', 'is healthy', UNAVAILABLE, "value['health'] != 'healthy'"),
    ('CP35_not_withdrawn_at', '/proposed/withdrawn_at_utc', 'is null', UNAVAILABLE, "value['withdrawn_at_utc'] is not None"),
    ('CP36_withdrawn_resume', '/previous/state', 'a withdrawn prior resumes only by governed rebuild', UNAVAILABLE,
     "value['previous_truthy'] is True and value['previous_state'] == 'withdrawn' and value['governed_rebuild'] is False"),
    ('CP37_rollback', '/previous/examined_through_sequence_id', 'the cursor never moves back without governed rebuild', 'coverage_refused',
     "value['previous_truthy'] is True and value['previous_examined'] is not None and (value['global_through'] is None or value['global_through'] < value['previous_examined']) and value['governed_rebuild'] is False"),
])

# ------------------------------------------------------------------ historical reader
phase('hr_flags_a', 'historical_read: reader adapter flag types and disclosure gates.', [
    ('HR01_flag_types', '/context', 'every reader adapter flag is exactly a bool', UNAVAILABLE, "value['nonbool_flags'] != []"),
    ('HR02_reader_installed', '/context/reader_installed', 'is True', UNAVAILABLE, "value['reader_installed'] is False"),
    ('HR03_not_withdrawn', '/context/withdrawn', 'is False', UNAVAILABLE, "value['withdrawn'] is True"),
    ('HR04_permission', '/context/permission', 'is True', UNAVAILABLE, "value['permission'] is False"),
    ('HR05_not_deleted', '/context/deleted', 'is False', UNAVAILABLE, "value['deleted'] is True"),
])
phase('hr_flags_b', 'historical_read: original custody and version support.', [
    ('HR06_source_present', '/context/source_present', 'is True', UNAVAILABLE, "value['source_present'] is False"),
    ('HR07_owner_proven', '/context/owner_proven', 'is True', UNAVAILABLE, "value['owner_proven'] is False"),
    ('HR08_versions_supported', '/context/versions_supported', 'is True', UNAVAILABLE, "value['versions_supported'] is False"),
])
phase('hr_original', 'historical_read: the authenticated retained original and its envelope.', [
    ('HR09_original_prepared', '/context/authenticated_original/prepared', 'source bytes equal the prepared stage bytes', UNAVAILABLE,
     "value['prepared_digest'] != value['original_prepared_digest']"),
    ('HR10_original_completed', '/context/authenticated_original/completed', 'source bytes equal the completed stage bytes', UNAVAILABLE,
     "value['completed_digest'] != value['original_completed_digest']"),
    ('HR11_original_event', '/context/authenticated_original/event', 'canonical bytes equal the event', UNAVAILABLE,
     "value['event_digest'] != value['original_event_digest']"),
    ('HR12_event_schema', '/event', 'the EventRecord schema reports no error', UNAVAILABLE, "value['event_schema_errors'] != 0"),
])

# ------------------------------------------------------------------ transitions and owner helpers
phase('tool_request', 'tool_request_join: tool requests carry the exact tool_use_id; node requests omit it.', [
    ('TJ1_tool_use_present', '/payload/tool_use_id', 'a tool request payload carries a non-null tool_use_id', TRANSITION,
     "value['request_kind'] == 'tool' and value['payload_tool_use_id'] is None"),
    ('TJ2_tool_use_copy', '/payload/tool_use_id', 'a tool request payload tool_use_id equals the blocked request', TRANSITION,
     "value['request_kind'] == 'tool' and value['payload_tool_use_id'] is not None and value['payload_tool_use_id'] != value['before_tool_use_id']"),
    ('TJ3_node_omits_tool', '/payload/tool_use_id', 'a node request payload omits tool_use_id', TRANSITION,
     "value['request_kind'] != 'tool' and value['payload_has_tool_use_id'] is True"),
    ('TJ4_node_before_tool', '/before/tool_use_id', 'a node request has a null blocked tool_use_id', TRANSITION,
     "value['request_kind'] != 'tool' and value['before_tool_use_id'] is not None"),
])
phase('tr_approval_requested', 'transition approval.requested.', [
    ('AR1_blocked', '/before/episode_state', 'is blocked', TRANSITION, "value['episode_state'] != 'blocked'"),
    ('AR2_actions_present', '/payload/allowed_action_ids', 'is nonempty', TRANSITION, "value['actions_truthy'] is False"),
    ('AR3_actions_copy', '/payload/allowed_action_ids', 'equals the blocked episode actions', TRANSITION,
     "value['payload_actions'] != value['before_actions']"),
])
phase('tr_approval_granted', 'transition approval.granted.', [
    ('AG1_requested', '/before/episode_state', 'is requested', TRANSITION, "value['episode_state'] != 'requested'"),
    ('AG2_human', '/before/human_authenticated', 'is True', TRANSITION, "value['human_authenticated'] is not True"),
    ('AG3_not_paused', '/before/paused', 'is False', TRANSITION, "value['paused'] is not False"),
    ('AG4_not_revoked', '/before/revoked', 'is False', TRANSITION, "value['revoked'] is not False"),
    ('AG5_listed_action', '/payload/allowed_action_id', 'is a member of the requested actions', TRANSITION, "value['action_listed'] is False"),
])
phase('tr_approval_denied', 'transition approval.denied.', [
    ('AD1_requested', '/before/episode_state', 'is requested', TRANSITION, "value['episode_state'] != 'requested'"),
])
phase('tr_approval_timeout', 'transition approval.timeout.', [
    ('AT1_requested', '/before/episode_state', 'is requested', TRANSITION, "value['episode_state'] != 'requested'"),
    ('AT2_expired', '/payload/ts', 'is at or after the requested deadline', TRANSITION, "value['ts_micros'] < value['deadline_micros']"),
])
phase('tr_config_migrated', 'transition config.migrated.', [
    ('CM1_first_load', '/before/first_load', 'is True', TRANSITION, "value['first_load'] is not True"),
    ('CM2_legacy_value', '/payload/legacy_value', 'equals the loaded legacy value', TRANSITION, "value['payload_legacy'] != value['before_legacy']"),
    ('CM3_source_ref', '/payload/source_ref', 'equals the loaded source ref', TRANSITION, "value['payload_source_ref'] != value['before_source_ref']"),
    ('CM4_source_sha256', '/payload/source_sha256', 'equals the loaded source digest', TRANSITION,
     "value['payload_source_sha256'] != value['before_source_sha256']"),
    ('CM5_result_ref', '/payload/result_ref', 'equals the committed Settings ref', TRANSITION, "value['result_ref'] != value['committed_settings_ref']"),
    ('CM6_enum_mapping', '/payload/enum_value', 'is the decided mapping of the legacy value', TRANSITION, "value['mapped_enum'] != value['enum_value']"),
])
phase('gate_score', 'gate_score_join: numeric gate results keep the dispatch score context.', [
    ('GS1_score_copy', '/payload/score', 'canonical bytes equal the evaluator score', TRANSITION, "value['payload_score'] != value['outcome_score']"),
    ('GS2_threshold_copy', '/payload/score_threshold', 'canonical bytes equal the dispatch threshold', TRANSITION,
     "value['payload_threshold'] != value['before_threshold']"),
    ('GS3_dispatch_ref_copy', '/payload/dispatch_score_ref', 'canonical bytes equal the dispatch ref', TRANSITION,
     "value['payload_dispatch_ref'] != value['before_dispatch_ref']"),
    ('GS4_dispatch_tuple_copy', '/payload/dispatch_score_tuple', 'canonical bytes equal the dispatch tuple', TRANSITION,
     "value['payload_dispatch_tuple'] != value['before_dispatch_tuple']"),
    ('GS5_scored_tuple', '/payload/dispatch_score_tuple', 'a scored result carries a dispatch tuple', TRANSITION,
     "value['scored'] is True and value['tuple_present'] is False"),
    ('GS6_scored_node', '/payload/node_id', 'a scored result names the dispatch tuple node', TRANSITION,
     "value['scored'] is True and value['tuple_present'] is True and value['payload_node_id'] != value['tuple_node_id']"),
    ('GS7_scored_ref', '/payload/dispatch_score_ref', 'a scored result carries a nonempty dispatch ref', TRANSITION,
     "value['scored'] is True and value['dispatch_ref_truthy'] is False"),
])
phase('tr_gate_started', 'transition gate.evaluation_started.', [
    ('GE1_allocated', '/before/evaluation_state', 'is allocated', TRANSITION, "value['evaluation_state'] != 'allocated'"),
    ('GE2_evaluation_id', '/payload/evaluation_id', 'equals the allocated evaluation', TRANSITION,
     "value['payload_evaluation_id'] != value['before_evaluation_id']"),
])
for gate, status in [('failed', 'FAIL'), ('passed', 'PASS')]:
    prefix = 'GF' if gate == 'failed' else 'GP'
    phase('tr_gate_' + gate + '_a', 'transition gate.' + gate + ': evaluation and report status.', [
        (prefix + '1_started', '/before/evaluation_state', 'is started', TRANSITION, "value['evaluation_state'] != 'started'"),
        (prefix + '2_evaluation_id', '/payload/evaluation_id', 'equals the started evaluation', TRANSITION,
         "value['payload_evaluation_id'] != value['before_evaluation_id']"),
        (prefix + '3_gate_id', '/payload/gate_id', 'equals the started gate', TRANSITION, "value['payload_gate_id'] != value['before_gate_id']"),
        (prefix + '4_report_status', '/owner_result/report_status', 'is ' + status, TRANSITION, "value['report_status'] != " + repr(status)),
    ])
phase('tr_gate_failed_b', 'transition gate.failed: questions, evidence and failure code.', [
    ('GF5_no_questions', '/owner_result/question_ids', 'is empty', TRANSITION, "value['questions_truthy'] is True"),
    ('GF6_evidence_present', '/payload/evidence_refs', 'is nonempty', TRANSITION, "value['evidence_truthy'] is False"),
    ('GF7_evidence_copy', '/payload/evidence_refs', 'equals the report evidence', TRANSITION, "value['payload_evidence'] != value['outcome_evidence']"),
    ('GF8_failure_code', '/payload/failure_reason_code', 'equals the report failure code', TRANSITION,
     "value['payload_failure_code'] != value['outcome_failure_code']"),
])
phase('tr_gate_passed_b', 'transition gate.passed: questions, predicates and evidence.', [
    ('GP5_no_questions', '/owner_result/question_ids', 'is empty', TRANSITION, "value['questions_truthy'] is True"),
    ('GP6_all_predicates', '/owner_result/all_predicates_pass', 'is True', TRANSITION, "value['all_predicates_pass'] is not True"),
    ('GP7_evidence_present', '/payload/evidence_refs', 'is nonempty', TRANSITION, "value['evidence_truthy'] is False"),
    ('GP8_evidence_copy', '/payload/evidence_refs', 'equals the report evidence', TRANSITION, "value['payload_evidence'] != value['outcome_evidence']"),
])
phase('tr_requirements', 'transition requirements.clarification_requested.', [
    ('RQ1_blocked', '/before/report_status', 'is BLOCKED', TRANSITION, "value['report_status'] != 'BLOCKED'"),
    ('RQ2_questions', '/before/question_ids', 'is nonempty', TRANSITION, "value['questions_truthy'] is False"),
    ('RQ3_copies', '/payload', 'question_ids, report_ref, wizard_id and thread_id equal the blocked report', TRANSITION,
     "value['copy_mismatches'] != []"),
])
phase('tr_background', 'transition run.background_enqueued.', [
    ('RB1_committed', '/before/queue_state', 'is committed', TRANSITION, "value['queue_state'] != 'committed'"),
    ('RB2_copies', '/payload', 'enqueue, queue record, scope, Host and root refs equal the durable intent', TRANSITION,
     "value['copy_mismatches'] != []"),
])
phase('denial', 'denial_emission: only a policy or user denial before dispatch emits tool.denied (DL-430).', [
    ('DE1_origin', '/before/denial_origin', 'is policy or user', 'no_emission', "value['denial_origin'] not in ('policy', 'user')"),
    ('DE2_decision', '/before/policy_decision', 'is deny', 'no_emission', "value['policy_decision'] != 'deny'"),
    ('DE3_not_dispatched', '/before/dispatch_state', 'is not_dispatched', 'no_emission', "value['dispatch_state'] != 'not_dispatched'"),
])
phase('tr_tool_denied', 'transition tool.denied.', [
    ('TD1_copies', '/payload', 'every denial field equals the policy decision copy', TRANSITION, "value['copy_mismatches'] != []"),
    ('TD2_not_executed', '/payload/executed_at_all', 'is False', TRANSITION, "value['executed_at_all'] is not False"),
    ('TD3_headless', '/payload/headless_denied', 'is exactly whether the block reason is headless_ask_denied', TRANSITION,
     "value['headless_denied'] is not value['headless_reason']"),
    ('TD4_no_failure_class', '/payload/failure_class', 'is null', TRANSITION, "value['failure_class'] is not None"),
])
phase('tr_tool_completed', 'transition tool.execution_completed.', [
    ('TC1_started', '/before/execution_state', 'is started', TRANSITION, "value['execution_state'] != 'started'"),
    ('TC2_copies', '/payload', 'result_ref, outcome and duration_ms equal the owner result', TRANSITION, "value['copy_mismatches'] != []"),
])
phase('tr_tool_started', 'transition tool.execution_started.', [
    ('TS1_admitted', '/before/execution_state', 'is admitted', TRANSITION, "value['execution_state'] != 'admitted'"),
    ('TS2_allowed', '/before/policy_decision', 'is allow', TRANSITION, "value['policy_decision'] != 'allow'"),
    ('TS3_schema_valid', '/before/schema_valid', 'is True', TRANSITION, "value['schema_valid'] is not True"),
    ('TS4_hooks_pass', '/before/hooks_pass', 'is True', TRANSITION, "value['hooks_pass'] is not True"),
])
phase('tr_tool_invoked', 'transition tool.invoked, including the web request join.', [
    ('TI1_web_presence', '/payload/meta', 'is present exactly when a web request was dispatched', TRANSITION,
     "value['request_present'] is not value['meta_present']"),
    ('TI2_web_tool', '/payload/tool_name', 'equals the web meta tool_id', TRANSITION,
     "value['request_present'] is True and value['meta_present'] is True and value['tool_name'] != value['meta_tool_id']"),
    ('TI3_web_copies', '/payload/meta', 'every web request field but parent_event_id equals its meta copy', TRANSITION,
     "value['web_mismatches'] != []"),
    ('TI4_dispatch_started', '/before/dispatch_state', 'is started', TRANSITION, "value['dispatch_state'] != 'started'"),
    ('TI5_attempted', '/owner_result/dispatch_state', 'is attempted_completed', TRANSITION,
     "value['outcome_dispatch_state'] != 'attempted_completed'"),
    ('TI6_copies', '/payload', 'success, latency_ms, index_used and meta equal the owner result', TRANSITION, "value['copy_mismatches'] != []"),
])
phase('tr_usage_a', 'transition usage.event: settlement order and settlement times.', [
    ('UE1_settled_not_reopened', '/payload/settlement_status', 'a settled, adjusted or failed record never returns to observed, partial or unknown', TRANSITION,
     "value['previous'] in ('settled', 'adjusted', 'failed') and value['state'] in ('observed', 'streaming_partial', 'unknown')"),
    ('UE2_adjusted_after_settled', '/payload/settlement_status', 'adjusted follows settled or adjusted only', TRANSITION,
     "value['state'] == 'adjusted' and value['previous'] not in ('settled', 'adjusted')"),
    ('UE3_prior_ref', '/before/prior_usage_event_ref', 'a revision names its prior Usage event', TRANSITION,
     "value['previous'] is not None and value['prior_ref_truthy'] is False"),
    ('UE4_settled_at', '/payload/settled_at_utc', 'a settled record carries settled_at_utc', TRANSITION,
     "value['state'] == 'settled' and value['settled_at_truthy'] is False"),
    ('UE5_adjusted_at', '/payload/adjusted_at_utc', 'an adjusted record carries adjusted_at_utc', TRANSITION,
     "value['state'] == 'adjusted' and value['adjusted_at_truthy'] is False"),
])
phase('tr_usage_b', 'transition usage.event: parent run, record copies and provider observation.', [
    ('UE6_parent_run', '/payload/parent_run_id', 'equals the observed parent run', TRANSITION,
     "value['payload_parent_run_id'] != value['before_parent_run_id']"),
    ('UE7_record_copies', '/payload', 'every Usage record field equals the observed copy', TRANSITION, "value['copy_mismatches'] != []"),
    ('UE8_raw_payload_ref', '/payload/raw_payload_ref', 'equals the observation ref', TRANSITION, "value['raw_payload_ref'] != value['observation_ref']"),
    ('UE9_provider_hash', '/payload/provider_payload_hash', 'equals the observation digest', TRANSITION,
     "value['provider_payload_hash'] != value['observation_sha256']"),
])
phase('usage_values_a', 'usage_values_valid: cost copies and cost visibility.', [
    ('UV1_cost_amount_copy', '/payload/cost_microdollars', 'canonical bytes equal the cost record amount', TRANSITION,
     "value['payload_cost'] != value['record_cost']"),
    ('UV2_cost_copies', '/payload', 'currency, status and pricing fields equal the cost record', TRANSITION, "value['cost_mismatches'] != []"),
    ('UV3_unknown_cost', '/payload/cost', 'an unknown cost has no amount', TRANSITION,
     "value['cost_status'] == 'unknown' and value['amount_present'] is True"),
    ('UV4_hidden_cost', '/payload/display_cost_policy', 'a hidden cost is never shown', TRANSITION,
     "value['cost_status'] in ('hidden_subscription', 'hidden_byok') and value['display_cost_policy'] == 'show'"),
])
phase('usage_values_b', 'usage_values_valid: pricing evidence and quota visibility.', [
    ('UV5_pricing_present', '/payload/cost', 'a priced or estimated cost carries every pricing field', TRANSITION,
     "value['cost_status'] in ('priced', 'estimated') and value['pricing_missing'] != []"),
    ('UV6_hidden_quota', '/payload/quota', 'an unknown, disabled or unexposed quota has no values', TRANSITION,
     "value['quota_status'] in ('unknown', 'disabled', 'not_exposed') and value['quota_values_present'] != []"),
    ('UV7_hidden_credits', '/payload/quota/credits_remaining', 'unknown, disabled or unexposed credits have no remaining value', TRANSITION,
     "value['credits_status'] in ('unknown', 'disabled', 'not_exposed') and value['credits_remaining_present'] is True"),
    ('UV8_unknown_window', '/payload/quota', 'an unknown window has no reset or cooldown', TRANSITION,
     "value['window_kind'] == 'unknown' and value['window_times_present'] is True"),
])
phase('tr_worktree_created', 'transition worktree.created.', [
    ('WC1_allocated', '/before/allocation_state', 'is allocated', TRANSITION, "value['before_state'] != 'allocated'"),
    ('WC2_created', '/owner_result/allocation_state', 'is created', TRANSITION, "value['outcome_state'] != 'created'"),
    ('WC3_copies', '/payload', 'branch, path, repo, run, lane and package equal the allocation', TRANSITION, "value['copy_mismatches'] != []"),
])
phase('tr_worktree_deleted_a', 'transition worktree.deleted: state and grace period.', [
    ('WD1_cleanup_eligible', '/before/allocation_state', 'is cleanup_eligible', TRANSITION, "value['before_state'] != 'cleanup_eligible'"),
    ('WD2_deleted', '/owner_result/allocation_state', 'is deleted', TRANSITION, "value['outcome_state'] != 'deleted'"),
    ('WD3_elapsed_unsigned', '/before/elapsed_grace_ms', 'is an unsigned JSON Schema integer', TRANSITION, "value['elapsed_unsigned'] is False"),
    ('WD4_grace_unsigned', '/payload/grace_period_ms', 'is an unsigned JSON Schema integer', TRANSITION, "value['grace_unsigned'] is False"),
    ('WD5_grace_elapsed', '/before/elapsed_grace_ms', 'is at least the grace period', TRANSITION,
     "value['elapsed_unsigned'] is True and value['grace_unsigned'] is True and value['elapsed'] < value['grace']"),
])
phase('tr_worktree_deleted_b', 'transition worktree.deleted: locks, sessions and copies.', [
    ('WD6_before_lock_checked', '/before/file_lock_checked', 'is True', TRANSITION, "value['before_file_lock_checked'] is not True"),
    ('WD7_payload_lock_checked', '/payload/file_lock_checked', 'is True', TRANSITION, "value['payload_file_lock_checked'] is not True"),
    ('WD8_no_blockers', '/before', 'no lock, safe point, terminal, editor or blocked recovery ref remains', TRANSITION, "value['before_blockers'] != []"),
    ('WD9_no_active_locks', '/payload/active_lock_refs', 'is empty or absent', TRANSITION, "value['active_locks_truthy'] is True"),
    ('WD10_no_safe_points', '/payload/safe_point_refs', 'is empty or absent', TRANSITION, "value['safe_points_truthy'] is True"),
    ('WD11_copies', '/payload', 'repo, run, lane and package equal the allocation', TRANSITION, "value['copy_mismatches'] != []"),
])

# ------------------------------------------------------------------ batch, codec, accounting, schema, retention
phase('batch_parent', 'batch_join: parent role, child list and child success types.', [
    ('BJ01_parent_role', '/parent/payload/meta/batch_role', 'is parent', 'batch_refused', "value['parent_role'] != 'parent'"),
    ('BJ02_children', '/children', 'is nonempty', 'batch_refused', "value['child_count'] == 0"),
    ('BJ03_child_ids', '/parent/payload/meta/child_tool_use_ids', 'equals the child tool_use_ids in order', 'batch_refused',
     "value['declared_child_ids'] != value['child_ids']"),
    ('BJ04_unique_children', '/parent/payload/meta/child_tool_use_ids', 'names each child once', 'batch_refused',
     "value['distinct_declared'] != value['child_count']"),
    ('BJ05_success_types', '/children/payload/success', 'every child success is exactly a bool', 'batch_refused', "value['nonbool_success'] != []"),
])
phase('batch_child', 'batch_join: every child joins its parent.', [
    ('BJ06_child_role', '/children/payload/meta/batch_role', 'is child', 'batch_refused', "value['role_bad'] != []"),
    ('BJ07_batch_id', '/children/payload/meta/batch_id', 'equals the parent batch id', 'batch_refused', "value['batch_id_bad'] != []"),
    ('BJ08_parent_tool', '/children/payload/meta/parent_tool_use_id', 'equals the parent tool_use_id', 'batch_refused', "value['parent_tool_bad'] != []"),
    ('BJ09_parent_event', '/children/parent_event_id', 'equals the parent event id', 'batch_refused', "value['parent_event_bad'] != []"),
    ('BJ10_attempt_ref', '/children/payload/provider_attempt_ref', 'is nonempty', 'batch_refused', "value['attempt_ref_missing'] != []"),
    ('BJ11_distinct_tool', '/children/payload/tool_use_id', 'differs from the parent tool_use_id', 'batch_refused', "value['tool_reused'] != []"),
    ('BJ12_envelope', '/children', 'run, attempt, Project and scope equal the parent', 'batch_refused', "value['envelope_bad'] != []"),
])
phase('batch_success', 'batch_join: the parent succeeds exactly when every child succeeds.', [
    ('BJ13_parent_success', '/parent/payload/success', 'is all child successes', 'batch_refused',
     "value['parent_success'] is not value['children_succeeded']"),
])
phase('source_codec', 'decode_source: pm.dt.source.json.v1 strict decode.', [
    ('DS01_size', '/raw', 'is at most 1048576 bytes', 'source stage exceeds 1048576 encoded bytes', "value['size'] > 1048576"),
    ('DS02_utf8', '/raw', 'is strict UTF-8', 'invalid UTF-8', "value['utf8'] is False"),
    ('DS03_json', '/raw', 'is JSON text', 'invalid JSON', "value['utf8'] is True and value['json'] is False"),
    ('DS04_unique_keys', '/raw', 'has no duplicate object key', 'duplicate key', "value['duplicate_keys'] != 0"),
    ('DS05_finite', '/raw', 'has no nonfinite constant', 'nonfinite number', "value['nonfinite_constants'] != 0"),
    ('DS06_canonical', '/raw', 'equals the canonical encoding of its value', 'noncanonical source bytes',
     "value['json'] is True and value['duplicate_keys'] == 0 and value['nonfinite_constants'] == 0 and value['canonical'] is False"),
])
phase('accounting', 'accounting_totals: exact counting flags and Usage token fields.', [
    ('AC01_counting_flags', '/counting_semantics', 'cache_is_input_subset and reasoning_is_output_subset are exactly bools', 'schema_refused',
     "value['nonbool_flags'] != []"),
    ('AC02_token_fields', '/payload', 'every token and cost field satisfies its payload schema', 'schema_refused', "value['invalid_fields'] != []"),
])
phase('schema_verdict', 'A fixture value against one complete schema occurrence (oracle checks in main).', [
    ('SC01_schema', '/value', 'the Draft 2020-12 schema reports no error', 'schema_refused', "value['errors'] != 0"),
])
phase('references', 'Whole-bundle schema reference preflight (standing check 9).', [
    ('RF01_references', '/bundle', 'every $ref and $dynamicRef resolves, including unused branches', 'unresolved_schema_reference',
     "value['unresolved'] != 0"),
])
phase('retention', 'Retention eligibility of one retained record.', [
    ('RT01_anchor', '/input', 'the policy anchor time is present', 'retention_ineligible', "value['anchor_present'] is False"),
    ('RT02_age', '/input/now', 'the anchor is at least the policy days old', 'retention_ineligible',
     "value['anchor_present'] is True and value['age_days'] < value['required_days']"),
    ('RT03_not_held', '/input/held', 'is falsy', 'retention_ineligible', "value['held_truthy'] is True"),
    ('RT04_not_dependent', '/input/dependent', 'is falsy', 'retention_ineligible', "value['dependent_truthy'] is True"),
])
phase('projection_retention', 'Derived projection retirement capacity.', [
    ('PR01_unheld_generation', '/held_generations', 'at least one existing generation is unheld', 'capacity_fenced',
     "value['held_count'] == value['existing_generations']"),
])


HEADER = '''"""DT guard table {phase}: {doc}

Method B guard rows for scripts/pm-dt-event-contracts.py, generated by
scripts/pm-dt-table-generate.py (edit the row spec there, then regenerate).
Each predicate reads one observation record that the lane checker derives from
the complete boundary input (canonical bytes, digests, recomputed identities,
type names, presence); predicates never recompute, repair or call helpers. The
checker refuses only through these rows, in this order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = {fields}
'''


def render(name, doc, rows):
    fields = []
    for _, _, _, _, condition in rows:
        for key in re.findall(r"value\['([a-z_0-9]+)'\]", condition):
            if key not in fields:
                fields.append(key)
    out = [HEADER.format(phase=name, doc=doc, fields=repr(tuple(fields)))]
    for row, _, _, code, condition in rows:
        out.append(f'\n\ndef {row}(value, context):\n    return {code!r} if {condition} else None\n')
    guards = ''.join(f"        g.Guard({row!r}, g.Invariant({field!r}, {words!r}), {code!r}, {row}),\n"
                     for row, field, words, code, _ in rows)
    requires = ''.join(f"        table.require({row!r}, value, context)\n" for row, *_ in rows)
    out.append(f'\n\ndef case(value):\n    context = None\n    table = g.GuardTable([\n{guards}    ])\n\n'
               f'    def check(value):\n{requires}        return True\n    return g.Case(table, check, context)\n')
    return ''.join(out)


def main():
    out = Path(sys.argv[1])
    check = '--check' in sys.argv[2:]
    expected = {f'pm_dt_table_{name}.py': render(name, *spec) for name, spec in PHASES.items()}
    problems = []
    for path in sorted(out.glob('pm_dt_table_*.py')):
        if path.name not in expected:
            problems.append('extra ' + path.name)
    for filename, text in expected.items():
        path = out / filename
        if check:
            if not path.exists() or path.read_text() != text:
                problems.append('stale ' + filename)
        else:
            path.write_text(text)
    if check:
        print('\n'.join(problems) or f'{len(expected)} DT table modules current')
        return 1 if problems else 0
    print(f'wrote {len(expected)} DT table modules')
    return 0


if __name__ == '__main__':
    sys.exit(main())

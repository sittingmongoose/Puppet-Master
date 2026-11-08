#!/usr/bin/env python3
"""Write the DCH Method B phase-table modules (scripts/pm_dch_table_*.py) from one row spec.

Usage: python3 scripts/pm-dch-table-generate.py scripts [--check]

Spec rows: (name, field, words, code, condition). The condition is the refusal
test over the phase observation `value`; FIELDS is every `value['...']` key the
rows of the phase read. One module per phase table, at most seven rows each, so
the shared tool certifies small modules. The generated modules are the checked-in
source of truth; regenerate and diff after editing a row. --check exits 1 when a
module is stale, missing or extra.

Conditions use only comparisons, identity tests, literal tuples and boolean
operators on observation values: the checker (scripts/pm_dch_events.py and
scripts/pm_dch_stop.py) derives every byte string, digest, recomputed identity,
type name, presence fact and mismatch list, and decides nothing itself.
"""
import re
import sys
from pathlib import Path

PHASES = {}
LIMIT = 16384


def phase(name, doc, rows):
    assert name not in PHASES and 1 <= len(rows) <= 7, name
    for row in rows:
        assert len(row) == 5, row
    PHASES[name] = (doc, rows)


TYPE = 'type_refused'
BODY = 'body_unavailable'
SCOPE = 'scope_refused'
JOIN = 'join_refused'
HISTORY = 'history_refused'
TEST = 'test_join_refused'
CHECKPOINT = 'checkpoint_refused'
STORAGE = 'checkpoint_storage_refused'
ARCHIVE = 'archive_refused'
RECIPE = 'recipe_refused'
INVALID = 'invalid_input_type'
CONFLICT = 'conflict'

# --------------------------------------------------------------- recipe selector
phase('rn_recipe', 'record_number_rule: retained-original recipe selection from independent write receipts.', [
    ('RN01_provenance_object', '/provenance', 'a supplied provenance is exactly a JSON object', RECIPE,
     "value['provenance_type'] != 'dict'"),
    ('RN02_store_type', '/provenance/storage_instance_id', 'the provenance Store is exactly a string', RECIPE,
     "value['provenance_type'] == 'dict' and value['store_type'] != 'str'"),
    ('RN03_digest_type', '/provenance/source_value_sha256', 'the provenance source digest is exactly a string', RECIPE,
     "value['provenance_type'] == 'dict' and value['digest_type'] != 'str'"),
    ('RN04_recipe_claim', '/provenance/recipe_id', 'a claimed recipe equals the receipt-selected recipe; it never selects one', RECIPE,
     "value['store_type'] == 'str' and value['digest_type'] == 'str' and value['claim_present'] is True "
     "and value['claim'] != value['receipt_recipe']"),
])

# --------------------------------------------------------------- input types
phase('ty_a', 'input_types_valid: map keys, Storage descriptors and integer slots (strict recipes).', [
    ('TY01_key_type', '/**', 'every map key is exactly a string', TYPE, "value['nonstring_keys'] != []"),
    ('TY02_store_descriptor', '/**/storage_instance_id', 'every Storage instance id satisfies the Storage descriptor', TYPE,
     "value['store_descriptors'] != []"),
    ('TY03_integer_type', '/**/<integer slot>', 'every integer slot holds an exact integer (producer_sequence_id may be null)', TYPE,
     "value['integer_types'] != []"),
    ('TY04_uint64_range', '/**/<Storage uint64 slot>', 'every current Storage uint64 slot is within 0..2^64-1', TYPE,
     "value['uint64_ranges'] != []"),
])
phase('ty_b', 'input_types_valid: object, array and string slots and untyped leaves (strict recipes).', [
    ('TY05_object_type', '/**/<object slot>', 'every object slot holds a JSON object', TYPE, "value['object_types'] != []"),
    ('TY06_array_type', '/**/<array slot>', 'every array slot holds a JSON array', TYPE, "value['array_types'] != []"),
    ('TY07_string_type', '/**/<string slot>', 'every string slot holds a string', TYPE, "value['string_types'] != []"),
    ('TY08_leaf_type', '/**/<untyped leaf>', 'every untyped leaf is a string, boolean, integer or null', TYPE,
     "value['leaf_types'] != []"),
])

# --------------------------------------------------------------- SP-337 body
phase('rb_route', 'resolve_body: selected body encoding, inline limit and reference route shape.', [
    ('RB01_body_encodable', '/payload | source/body', 'the selected body encodes under the selected recipe', BODY,
     "value['encoding_error'] is not None"),
    ('RB02_inline_limit', '/payload', 'an inline body encodes to at most 16384 bytes', BODY,
     f"value['route'] == 'inline' and value['encoding_error'] is None and value['inline_size'] > {LIMIT}"),
    ('RB03_ref_payload_empty', '/payload', 'a referenced record carries the empty inline payload', BODY,
     "value['route'] == 'ref' and value['payload_empty'] is not True"),
    ('RB04_ref_source_present', '/source', 'a referenced record has a nonempty pack source', BODY,
     "value['route'] == 'ref' and value['source_truthy'] is not True"),
])
phase('rb_pack_a', 'resolve_body: SP-337 reference, pack key, size, media, Store and body copies.', [
    ('RB05_payload_ref', '/payload_ref', 'equals the reference recomputed from the pack body bytes', BODY,
     "value['payload_ref'] != value['expected_payload_ref']"),
    ('RB06_pack_key', '/source/key', 'equals payload:v1: plus BLAKE3 of the pack body bytes', BODY,
     "value['pack_key'] != value['expected_pack_key']"),
    ('RB07_byte_size', '/source/byte_size', 'equals the encoded pack body length', BODY,
     "value['byte_size'] != value['raw_size']"),
    ('RB08_media_type', '/source/media_type', 'is application/msgpack', BODY,
     "value['media_type'] != 'application/msgpack'"),
    ('RB09_pack_store', '/source/storage_instance_id', 'equals the reading Storage instance', BODY,
     "value['pack_store'] != value['store']"),
    ('RB10_scope_copy', '/source/scope', 'equals the pack body scope', BODY,
     "value['pack_scope'] != value['body_scope']"),
    ('RB11_computer_copy', '/source/computer_id', 'equals the pack body computer_id', BODY,
     "value['pack_computer_id'] != value['body_computer_id']"),
])
phase('rb_pack_b', 'resolve_body: pack thread copy, custody flags and deletion.', [
    ('RB12_thread_copy', '/source/thread_id', 'equals the pack body thread_id', BODY,
     "value['pack_thread_id'] != value['body_thread_id']"),
    ('RB13_authorized', '/source/authorized', 'is exactly true', BODY, "value['authorized'] is not True"),
    ('RB14_hold_access', '/source/hold_access_allowed', 'is exactly true', BODY, "value['hold_access_allowed'] is not True"),
    ('RB15_bytes_durable', '/source/bytes_durable', 'is exactly true', BODY, "value['bytes_durable'] is not True"),
    ('RB16_index_durable', '/source/index_durable', 'is exactly true', BODY, "value['index_durable'] is not True"),
    ('RB17_readback_verified', '/source/readback_verified', 'is exactly true', BODY, "value['readback_verified'] is not True"),
    ('RB18_not_deleted', '/source/deleted', 'is exactly false', BODY, "value['deleted'] is not False"),
])

# --------------------------------------------------------------- CV-365 scope
phase('sc_app', 'valid_scope_partition: application scope partition and null Project fields.', [
    ('SC01_app_partition', '/scope/scope_partition', 'an application scope uses partition app', SCOPE,
     "value['scope_partition'] != 'app'"),
    ('SC02_app_project_id', '/scope/project_id', 'is null for application scope', SCOPE, "value['project_id'] is not None"),
    ('SC03_app_home_server', '/scope/project_home_server_id', 'is null for application scope', SCOPE,
     "value['project_home_server_id'] is not None"),
    ('SC04_app_named_plan', '/scope/named_plan_id', 'is null for application scope', SCOPE, "value['named_plan_id'] is not None"),
])
phase('sc_project_a', 'valid_scope_partition: Project scope kind and Project id.', [
    ('SC05_scope_kind', '/scope/scope_kind', 'is application or project', SCOPE, "value['scope_kind'] != 'project'"),
    ('SC06_project_id_string', '/scope/project_id', 'a Project scope names a string project id', SCOPE,
     "value['project_id_is_str'] is not True"),
    ('SC07_project_id_nonempty', '/scope/project_id', 'a Project scope names a nonempty project id', SCOPE,
     "value['project_id_is_str'] is True and value['project_id_empty'] is True"),
])
phase('sc_project_b', 'valid_scope_partition: encoded project~ partition (CV-365, standing check 3).', [
    ('SC08_partition_prefix', '/scope/scope_partition', 'starts with project~', SCOPE, "value['prefixed'] is not True"),
    ('SC09_partition_alphabet', '/scope/scope_partition', 'the encoded part is nonempty base64url alphabet', SCOPE,
     "value['prefixed'] is True and value['alphabet'] is not True"),
    ('SC10_partition_decodes', '/scope/scope_partition', 'the encoded part decodes as padded base64url', SCOPE,
     "value['prefixed'] is True and value['alphabet'] is True and value['decodes'] is not True"),
    ('SC11_project_id_utf8', '/scope/project_id', 'the project id has a UTF-8 encoding', SCOPE,
     "value['project_id_encodable'] is not True"),
    ('SC12_decoded_text', '/scope/scope_partition', 'the decoded bytes are UTF-8 text equal to the project id', SCOPE,
     "value['decodes'] is True and value['project_id_encodable'] is True and value['decoded_text_equal'] is not True"),
    ('SC14_canonical_encoding', '/scope/scope_partition', 'equals the unpadded base64url encoding of the project id', SCOPE,
     "value['project_id_encodable'] is True and value['decodes'] is True and value['decoded_text_equal'] is True "
     "and value['canonical'] is not True"),
])
phase('sc_project_bytes', 'valid_scope_partition: decoded bytes equal the UTF-8 project id (entailed by SC12; defence in depth).', [
    ('SC13_decoded_bytes', '/scope/scope_partition', 'the decoded bytes equal the UTF-8 bytes of the project id', SCOPE,
     "value['decoded_bytes_equal'] is not True"),
])

# --------------------------------------------------------------- record joins
phase('jn_policy', 'joins: current writer replay policy (standing check 1).', [
    ('JN01_replay_policy', '/replay_policy', 'a current writer record is exactly dedupe_by_idempotency_key', JOIN,
     "value['replay_policy'] != 'dedupe_by_idempotency_key'"),
])
phase('jn_envelope_a', 'joins: recomputed identity and envelope copies of the resolved body.', [
    ('JN02_event_type', '/event_type', 'equals the family', JOIN, "value['event_type'] != value['expected_event_type']"),
    ('JN03_event_id', '/event_id', 'equals the recomputed DCH identity', JOIN, "value['event_id'] != value['expected_event_id']"),
    ('JN04_idempotency_key', '/idempotency_key', 'equals the recomputed scope key (CV-366 for application)', JOIN,
     "value['idempotency_key'] != value['expected_idempotency_key']"),
    ('JN05_payload_schema_id', '/payload_schema_id', 'equals the body schema_id', JOIN,
     "value['payload_schema_id'] != value['body_schema_id']"),
    ('JN06_scope_kind', '/scope_kind', 'equals the body scope kind', JOIN, "value['scope_kind'] != value['body_scope_kind']"),
    ('JN07_project_id', '/project_id', 'equals the body scope project id', JOIN, "value['project_id'] != value['body_project_id']"),
])
phase('jn_envelope_b', 'joins: thread, actor, occurrence and null runtime ids.', [
    ('JN08_thread_id', '/thread_id', 'equals the body thread_id', JOIN, "value['thread_id'] != value['body_thread_id']"),
    ('JN09_actor_ref', '/actor_ref', 'equals the body actor_ref', JOIN, "value['actor_ref'] != value['body_actor_ref']"),
    ('JN10_occurred_at', '/occurred_at_utc', 'equals the body ts', JOIN, "value['occurred_at_utc'] != value['body_ts']"),
    ('JN11_run_id', '/run_id', 'is null', JOIN, "value['run_id'] is not None"),
    ('JN12_node_id', '/node_id', 'is null', JOIN, "value['node_id'] is not None"),
    ('JN13_attempt_id', '/attempt_id', 'is null', JOIN, "value['attempt_id'] is not None"),
])

# --------------------------------------------------------------- CV-366 retry
phase('rt_inputs', 'retry_outcome: dedupe availability flag type.', [
    ('RT01_available_type', '/available', 'the dedupe availability observation is exactly a bool', INVALID,
     "value['available_type'] != 'bool'"),
])
phase('rt_policy', 'retry_outcome: current append policy of both records (standing check 1).', [
    ('RT02_original_replay_only', '/original/replay_policy', 'the original is not projector_replay_only', 'replay_only_not_appendable',
     "value['original_policy'] == 'projector_replay_only'"),
    ('RT03_retry_replay_only', '/retry/replay_policy', 'the retry is not projector_replay_only', 'replay_only_not_appendable',
     "value['retry_policy'] == 'projector_replay_only'"),
    ('RT04_original_policy', '/original/replay_policy', 'the original is dedupe_by_idempotency_key', 'invalid_append_policy',
     "value['original_policy'] not in ('dedupe_by_idempotency_key', 'projector_replay_only')"),
    ('RT05_retry_policy', '/retry/replay_policy', 'the retry is dedupe_by_idempotency_key', 'invalid_append_policy',
     "value['retry_policy'] not in ('dedupe_by_idempotency_key', 'projector_replay_only')"),
])
phase('rt_schema_file', 'retry_outcome: the retained original family has a payload schema resource.', [
    ('RT06_original_schema', '/original/event_type', 'the original family names a readable payload schema', INVALID,
     "value['schemas_loaded'] is not True"),
])
phase('rt_original', 'retry_outcome: the incoming retry satisfies the original edition schemas.', [
    ('RT07_retry_envelope', '/retry', 'the incoming retry satisfies the EventRecord schema', INVALID,
     "value['retry_envelope_valid'] is not True"),
    ('RT08_retry_payload', '/retry/payload', 'the incoming retry body satisfies the payload schema', INVALID,
     "value['retry_payload_valid'] is not True"),
])
phase('rt_dedupe', 'retry_outcome: dedupe store availability.', [
    ('RT09_dedupe_available', '/available', 'the dedupe store is available', 'dedupe_unavailable', "value['available'] is False"),
])
phase('rt_identity', 'retry_outcome: idempotency lifetime and global event id integrity.', [
    ('RT10_reused_event_id', '/retry/event_id', 'an event id is never reused for another idempotency lifetime', CONFLICT,
     "value['original_lifetime'] != value['retry_lifetime'] and value['original_event_id'] == value['retry_event_id']"),
    ('RT11_event_id', '/retry/event_id', 'a retry in the same lifetime carries the original event id', CONFLICT,
     "value['original_lifetime'] == value['retry_lifetime'] and value['original_event_id'] != value['retry_event_id']"),
])
phase('rt_semantic', 'retry_outcome: caller-semantic commitment (CV-317 projection, Storage metadata excluded).', [
    ('RT12_retained_semantic_fields', '/retry/<semantic fields>', 'a retained-recipe original and the retry agree on every semantic field', CONFLICT,
     "value['retained_differences'] != []"),
    ('RT13_commitment_encodable', '/retry/<semantic fields>', 'both semantic projections have a JCS encoding', INVALID,
     "value['retained_differences'] == [] and value['commitment_error'] is not None"),
    ('RT14_semantic_commitment', '/retry/<semantic fields>', 'the retry semantic commitment equals the original', CONFLICT,
     "value['retained_differences'] == [] and value['commitment_error'] is None and value['commitments_equal'] is not True"),
])

# --------------------------------------------------------------- retained history
phase('hr_encode', 'historical_read_valid: the retained record encodes under its recipe.', [
    ('HR01_record_encodable', '/record', 'the retained record encodes under its selected recipe', HISTORY,
     "value['record_encoding_error'] is not None"),
])
phase('hr_flags', 'historical_read_valid: original edition schemas and current access custody.', [
    ('HR02_envelope_schema', '/record', 'satisfies the original EventRecord edition', HISTORY, "value['envelope_valid'] is not True"),
    ('HR03_payload_schema', '/record/payload', 'the resolved body satisfies the original payload edition', HISTORY,
     "value['payload_valid'] is not True"),
    ('HR04_retained', '/witness/retained', 'is exactly true', HISTORY, "value['retained'] is not True"),
    ('HR05_authorized', '/witness/authorized', 'is exactly true', HISTORY, "value['authorized'] is not True"),
    ('HR06_hold_access', '/witness/hold_access_allowed', 'is exactly true', HISTORY, "value['hold_access_allowed'] is not True"),
    ('HR07_not_deleted', '/witness/deleted', 'is exactly false', HISTORY, "value['deleted'] is not False"),
    ('HR08_not_withdrawn', '/witness/event_withdrawn', 'is exactly false', HISTORY, "value['event_withdrawn'] is not False"),
])
phase('hr_source', 'historical_read_valid: original byte commitment and retained replay policies.', [
    ('HR09_source_commitment', '/witness/source_value_sha256', 'equals SHA-256 of the retained record bytes', HISTORY,
     "value['source_commitment'] != value['witness_commitment']"),
    ('HR10_replay_policy', '/record/replay_policy', 'is dedupe_by_idempotency_key or the compatibility projector_replay_only', HISTORY,
     "value['replay_policy'] not in ('dedupe_by_idempotency_key', 'projector_replay_only')"),
])

# --------------------------------------------------------------- terminal test joins
phase('tj_start', 'test_joins: retained start identity and copies (W.9.2/W.9.3).', [
    ('TJ01_payload_started_id', '/payload/started_event_id', 'names the retained start event', TEST,
     "value['payload_started_event_id'] != value['started_event_id']"),
    ('TJ02_outcome_started_id', '/source/outcome/started_event_id', 'names the retained start event', TEST,
     "value['outcome_started_event_id'] != value['started_event_id']"),
    ('TJ03_payload_start_copies', '/payload', 'every operation/scope/thread/worktree/command/strategy field equals the start body', TEST,
     "value['payload_copy_mismatches'] != []"),
    ('TJ04_outcome_copies', '/source/outcome', 'every operation/scope/thread/worktree/command/strategy field equals the terminal payload', TEST,
     "value['outcome_copy_mismatches'] != []"),
    ('TJ05_duration_copy', '/payload/duration_ms', 'equals the actual outcome duration', TEST,
     "value['payload_duration_ms'] != value['outcome_duration_ms']"),
])
phase('tj_passed', 'test_joins: a passed terminal is an exact zero exit.', [
    ('TJ06_passed_exit_kind', '/source/outcome/kind', 'a passed test outcome is an exit', TEST, "value['kind'] != 'exit'"),
    ('TJ07_passed_exit_type', '/source/outcome/exit_code', 'a passed exit code is exactly an integer', TEST,
     "value['kind'] == 'exit' and value['exit_code_type'] != 'int'"),
    ('TJ08_passed_exit_zero', '/source/outcome/exit_code', 'a passed exit code is zero', TEST,
     "value['kind'] == 'exit' and value['exit_code_type'] == 'int' and value['exit_code'] != 0"),
])
phase('tj_failed_a', 'test_joins: failed terminal copies of the actual outcome.', [
    ('TJ09_outcome_kind_copy', '/payload/test_outcome', 'equals the actual outcome kind', TEST,
     "value['payload_test_outcome'] != value['kind']"),
    ('TJ10_exit_code_copy', '/payload/exit_code', 'equals the actual outcome exit code', TEST,
     "value['payload_exit_code'] != value['exit_code']"),
    ('TJ11_error_ref_copy', '/payload/error_ref', 'equals the actual outcome error_ref', TEST,
     "value['payload_error_ref'] != value['outcome_error_ref']"),
])
phase('tj_failed_b', 'test_joins: failed terminal outcome kinds (success is never a failure).', [
    ('TJ12_exit_type', '/source/outcome/exit_code', 'a failed exit code is exactly an integer', TEST,
     "value['kind'] == 'exit' and value['exit_code_type'] != 'int'"),
    ('TJ13_exit_nonzero', '/source/outcome/exit_code', 'a failed exit code is nonzero', TEST,
     "value['kind'] == 'exit' and value['exit_code_type'] == 'int' and value['exit_code'] == 0"),
    ('TJ14_exit_no_error_ref', '/payload/error_ref', 'a failed exit carries no error_ref', TEST,
     "value['kind'] == 'exit' and value['payload_error_ref'] is not None"),
    ('TJ15_terminal_kind', '/source/outcome/kind', 'is exit, timeout or process_error', TEST,
     "value['kind'] not in ('exit', 'timeout', 'process_error')"),
    ('TJ16_nonexit_no_code', '/source/outcome/exit_code', 'a timeout or process error has no exit code', TEST,
     "value['kind'] in ('timeout', 'process_error') and value['exit_code'] is not None"),
    ('TJ17_process_error_ref', '/payload/error_ref', 'a process error names its error_ref', TEST,
     "value['kind'] == 'process_error' and value['payload_error_ref'] is None"),
])

# --------------------------------------------------------------- SP-278 checkpoint joins
phase('cp_schema', 'checkpoint_joins: the checkpoint value satisfies its (recipe-selected) schema.', [
    ('CP01_checkpoint_schema', '/value', 'satisfies the selected checkpoint schema edition', CHECKPOINT,
     "value['checkpoint_schema_valid'] is not True"),
])
phase('cp_node', 'checkpoint_joins: current generation node and index sequence type.', [
    ('CP02_generation_node', '/source/checkpoint/generations', 'names the token generation', CHECKPOINT,
     "value['node_present'] is not True"),
    ('CP03_sequence_type', '/source/index_row/sequence_id', 'has exactly the retained event sequence type', CHECKPOINT,
     "value['index_sequence_type'] != value['event_sequence_type']"),
])
phase('cp_store', 'checkpoint_joins: every Storage instance copy equals the actual Store.', [
    ('CP04_value_store', '/value/storage_instance_id', 'equals the actual Store', CHECKPOINT, "value['value_store'] != value['store']"),
    ('CP05_token_store', '/value/source_token/storage_instance_id', 'equals the actual Store', CHECKPOINT,
     "value['token_store'] != value['store']"),
    ('CP06_selection_store', '/value/source_token/source_selection/storage_instance_id', 'equals the actual Store', CHECKPOINT,
     "value['selection_store'] != value['store']"),
    ('CP07_root_store', '/source/checkpoint/storage_instance_id', 'equals the actual Store', CHECKPOINT,
     "value['root_store'] != value['store']"),
])
phase('cp_generation', 'checkpoint_joins: current generation, checkpoint key and reference.', [
    ('CP08_current_generation', '/source/checkpoint/current_generation_id', 'equals the token generation', CHECKPOINT,
     "value['current_generation'] != value['generation']"),
    ('CP09_node_current', '/source/checkpoint/generations/<g>/state', 'is current', CHECKPOINT, "value['node_state'] != 'current'"),
    ('CP10_token_key', '/value/source_token/checkpoint_key', 'equals the generic SP-278 checkpoint key', CHECKPOINT,
     "value['token_key'] != value['generic_key']"),
    ('CP11_source_key', '/source/checkpoint_key', 'equals the generic SP-278 checkpoint key', CHECKPOINT,
     "value['source_key'] != value['generic_key']"),
    ('CP12_token_ref', '/value/source_token/checkpoint_ref', 'equals the generic key plus the generation pointer', CHECKPOINT,
     "value['token_ref'] != value['expected_ref']"),
])
phase('cp_frontier', 'checkpoint_joins: token anchor, frontier and source selection equal the current node.', [
    ('CP13_anchor', '/value/source_token/generation_anchor_sha256', 'equals the node anchor', CHECKPOINT,
     "value['token_anchor'] != value['node_anchor']"),
    ('CP14_frontier_revision', '/value/source_token/frontier_revision', 'equals the node frontier revision', CHECKPOINT,
     "value['token_frontier_revision'] != value['node_frontier_revision']"),
    ('CP15_frontier_sha256', '/value/source_token/frontier_sha256', 'equals the node frontier digest', CHECKPOINT,
     "value['token_frontier_sha256'] != value['node_frontier_sha256']"),
    ('CP16_token_selection', '/value/source_token/source_selection', 'equals the node source selection', CHECKPOINT,
     "value['token_selection'] != value['node_selection']"),
    ('CP17_current_selection', '/source/current_source_selection', 'equals the node source selection', CHECKPOINT,
     "value['current_selection'] != value['node_selection']"),
])
phase('cp_dataset', 'checkpoint_joins: index dataset names and the index row checkpoint reference.', [
    ('CP18_token_dataset', '/value/source_token/index_dataset_name', 'is event_record_index.v2@<generation>', CHECKPOINT,
     "value['token_dataset'] != value['expected_dataset']"),
    ('CP19_node_dataset', '/source/checkpoint/generations/<g>/index_dataset_name', 'is event_record_index.v2@<generation>', CHECKPOINT,
     "value['node_dataset'] != value['expected_dataset']"),
    ('CP20_source_dataset', '/source/dataset_name', 'is event_record_index.v2@<generation>', CHECKPOINT,
     "value['source_dataset'] != value['expected_dataset']"),
    ('CP21_index_ref', '/source/index_row/checkpoint_ref', 'equals the generic key plus the generation pointer', CHECKPOINT,
     "value['index_ref'] != value['expected_ref']"),
])
phase('cp_event', 'checkpoint_joins: index row and checkpoint value name the retained event.', [
    ('CP22_index_event_id', '/source/index_row/event_id', 'equals the retained event id', CHECKPOINT,
     "value['index_event_id'] != value['event_id']"),
    ('CP23_last_event_id', '/value/last_event_id', 'equals the retained event id', CHECKPOINT,
     "value['last_event_id'] != value['event_id']"),
    ('CP24_index_sequence', '/source/index_row/sequence_id', 'equals the retained event sequence', CHECKPOINT,
     "value['index_sequence_id'] != value['event_sequence_id']"),
    ('CP25_last_sequence', '/value/last_sequence_id', 'equals the retained event sequence', CHECKPOINT,
     "value['last_sequence_id'] != value['event_sequence_id']"),
    ('CP26_index_partition', '/source/index_row/scope_partition', 'equals the retained body partition', CHECKPOINT,
     "value['index_partition'] != value['body_partition']"),
    ('CP27_value_partition', '/value/scope_partition', 'equals the retained body partition', CHECKPOINT,
     "value['value_partition'] != value['body_partition']"),
])
phase('cp_family', 'checkpoint_joins: family, domain key, reader and projector.', [
    ('CP28_index_event_type', '/source/index_row/event_type', 'equals the family', CHECKPOINT,
     "value['index_event_type'] != value['family']"),
    ('CP31_domain_key', '/key', 'equals the family domain checkpoint key for the Store and body partition', CHECKPOINT,
     "value['key'] != value['expected_key']"),
])
phase('cp_family_entailed', 'checkpoint_joins: value family, reader and projector (the checkpoint schema consts decide first, CP01) and the retained event family (JN02 decides first); defence in depth.', [
    ('CP29_value_event_type', '/value/event_type', 'equals the family', CHECKPOINT, "value['value_event_type'] != value['family']"),
    ('CP30_event_event_type', '/source/event_record/event_type', 'equals the family', CHECKPOINT,
     "value['event_event_type'] != value['family']"),
    ('CP32_consumer', '/value/consumer_id', 'equals the family reader', CHECKPOINT, "value['consumer_id'] != value['reader']"),
    ('CP33_projector', '/value/projector_id', 'equals the family domain projector', CHECKPOINT,
     "value['projector_id'] != value['domain_projector']"),
])
phase('cp_publication', 'checkpoint_joins: publication copies and the source token.', [
    ('CP34_projection_refs', '/value/projection_refs', 'equals the publication projection refs', CHECKPOINT,
     "value['projection_refs'] != value['publication_projection_refs']"),
    ('CP35_publication_id', '/value/publication_id', 'equals the publication id', CHECKPOINT,
     "value['publication_id'] != value['publication_publication_id']"),
    ('CP36_revision', '/value/revision', 'equals the publication revision', CHECKPOINT,
     "value['revision'] != value['publication_revision']"),
    ('CP37_publication_token', '/source/publication/source_token', 'equals the checkpoint source token', CHECKPOINT,
     "value['publication_token'] != value['token']"),
    ('CP38_publication_thread', '/source/publication/thread_id', 'equals the retained body thread_id', CHECKPOINT,
     "value['publication_thread_id'] != value['body_thread_id']"),
    ('CP39_publication_computer', '/source/publication/computer_id', 'equals the retained body computer_id', CHECKPOINT,
     "value['publication_computer_id'] != value['body_computer_id']"),
    ('CP40_publication_scope', '/source/publication/scope', 'equals the retained body scope', CHECKPOINT,
     "value['publication_scope'] != value['body_scope']"),
])
phase('cp_state', 'checkpoint_joins: the checkpoint value is current.', [
    ('CP41_value_current', '/value/state', 'is current', CHECKPOINT, "value['state'] != 'current'"),
])

# --------------------------------------------------------------- SP-337 checkpoint storage
phase('cs_value', 'checkpoint_storage_valid: value bytes and retained checkpoint provenance.', [
    ('CS01_value_encodable', '/value', 'the checkpoint value encodes under its recipe', STORAGE,
     "value['value_encoding_error'] is not None"),
    ('CS02_provenance_commitment', '/source/checkpoint_access/source_value_sha256', 'equals SHA-256 of the checkpoint value bytes', STORAGE,
     "value['value_encoding_error'] is None and value['provenance_present'] is True "
     "and value['value_sha256'] != value['provenance_sha256']"),
])
phase('cs_inline', 'checkpoint_storage_valid: an inline checkpoint value is at most 16384 bytes.', [
    ('CS03_inline_limit', '/value', 'an inline checkpoint value encodes to at most 16384 bytes', STORAGE,
     f"value['inline_size'] > {LIMIT}"),
])
phase('cs_pointer', 'checkpoint_storage_valid: exact SP-337 pointer and pack body bytes.', [
    ('CS06_pointer_exact', '/source/checkpoint_storage/pointer', 'is exactly {payload_ref: reference of the value bytes}', STORAGE,
     "value['pointer'] != value['expected_pointer']"),
    ('CS07_pack_body_encodable', '/source/checkpoint_storage/pack/body', 'encodes under the value recipe', STORAGE,
     "value['pack_body_encoding_error'] is not None"),
    ('CS08_pack_body_bytes', '/source/checkpoint_storage/pack/body', 'has exactly the checkpoint value bytes', STORAGE,
     "value['pack_body_encoding_error'] is None and value['pack_body_equal'] is not True"),
])
phase('cs_pointer_bounds', 'checkpoint_storage_valid: pointer encodability and size (entailed by CS06: an exact pointer is at most 131 bytes; defence in depth).', [
    ('CS04_pointer_encodable', '/source/checkpoint_storage/pointer', 'the inline pointer encodes', STORAGE,
     "value['pointer_encoding_error'] is not None"),
    ('CS05_pointer_size', '/source/checkpoint_storage/pointer', 'the inline pointer encodes to at most 16384 bytes', STORAGE,
     f"value['pointer_encoding_error'] is None and value['pointer_size'] > {LIMIT}"),
])
phase('cs_pack_a', 'checkpoint_storage_valid: pack key, size, media, Store and domain copies.', [
    ('CS09_pack_key', '/source/checkpoint_storage/pack/key', 'equals payload:v1: plus BLAKE3 of the value bytes', STORAGE,
     "value['pack_key'] != value['expected_pack_key']"),
    ('CS10_pack_size', '/source/checkpoint_storage/pack/byte_size', 'equals the value byte length', STORAGE,
     "value['byte_size'] != value['raw_size']"),
    ('CS11_pack_media', '/source/checkpoint_storage/pack/media_type', 'is application/msgpack', STORAGE,
     "value['media_type'] != 'application/msgpack'"),
    ('CS12_pack_store', '/source/checkpoint_storage/pack/storage_instance_id', 'equals the actual Store', STORAGE,
     "value['pack_store'] != value['store']"),
    ('CS13_pack_domain_key', '/source/checkpoint_storage/pack/domain_key', 'equals the domain checkpoint key', STORAGE,
     "value['pack_domain_key'] != value['key']"),
    ('CS14_pack_partition', '/source/checkpoint_storage/pack/scope_partition', 'equals the value partition', STORAGE,
     "value['pack_partition'] != value['value_partition']"),
    ('CS15_pack_event_type', '/source/checkpoint_storage/pack/event_type', 'equals the family', STORAGE,
     "value['pack_event_type'] != value['family']"),
])
phase('cs_pack_b', 'checkpoint_storage_valid: pack custody flags and deletion.', [
    ('CS16_pack_authorized', '/source/checkpoint_storage/pack/authorized', 'is exactly true', STORAGE, "value['authorized'] is not True"),
    ('CS17_pack_hold_access', '/source/checkpoint_storage/pack/hold_access_allowed', 'is exactly true', STORAGE,
     "value['hold_access_allowed'] is not True"),
    ('CS18_pack_bytes_durable', '/source/checkpoint_storage/pack/bytes_durable', 'is exactly true', STORAGE,
     "value['bytes_durable'] is not True"),
    ('CS19_pack_index_durable', '/source/checkpoint_storage/pack/index_durable', 'is exactly true', STORAGE,
     "value['index_durable'] is not True"),
    ('CS20_pack_readback', '/source/checkpoint_storage/pack/readback_verified', 'is exactly true', STORAGE,
     "value['readback_verified'] is not True"),
    ('CS21_pack_not_deleted', '/source/checkpoint_storage/pack/deleted', 'is exactly false', STORAGE, "value['deleted'] is not False"),
])

# --------------------------------------------------------------- manual archive (DL-287)
phase('ar_request', 'archive_joins: manual origin, command and request authority.', [
    ('AR01_manual_origin', '/payload/archive_origin', 'is manual', ARCHIVE, "value['archive_origin'] != 'manual'"),
    ('AR02_command_id', '/payload/command_id', 'is cmd.chat.archive', ARCHIVE, "value['command_id'] != 'cmd.chat.archive'"),
    ('AR03_request_origin', '/source/request/origin', 'is manual', ARCHIVE, "value['request_origin'] != 'manual'"),
    ('AR04_request_command', '/source/request/command_id', 'is cmd.chat.archive (the payload command)', ARCHIVE,
     "value['request_command_id'] != 'cmd.chat.archive'"),
    ('AR05_permission', '/source/request/permission_allowed', 'is exactly true', ARCHIVE, "value['permission_allowed'] is not True"),
    ('AR06_thread_selected', '/source/request/thread_selected', 'is exactly true', ARCHIVE, "value['thread_selected'] is not True"),
    ('AR07_no_active_run', '/source/before/active_run', 'is exactly false', ARCHIVE, "value['active_run'] is not False"),
])
phase('ar_state', 'archive_joins: lifecycle state and expected revision.', [
    ('AR08_before_state', '/source/before/state', 'is active or suspended', ARCHIVE,
     "value['before_state'] not in ('active', 'suspended')"),
    ('AR09_previous_state', '/payload/previous_state', 'equals the before state', ARCHIVE,
     "value['previous_state'] != value['before_state']"),
    ('AR10_payload_state', '/payload/state', 'is archived', ARCHIVE, "value['payload_state'] != 'archived'"),
    ('AR11_after_state', '/source/after/state', 'is archived', ARCHIVE, "value['after_state'] != 'archived'"),
    ('AR12_readback', '/source/after/readback_available', 'is exactly true', ARCHIVE, "value['readback_available'] is not True"),
    ('AR13_expected_revision', '/payload/expected_thread_revision', 'equals the before revision', ARCHIVE,
     "value['expected_thread_revision'] != value['before_revision']"),
    ('AR14_request_revision', '/source/request/expected_revision', 'equals the before revision', ARCHIVE,
     "value['request_expected_revision'] != value['before_revision']"),
])
phase('ar_commit', 'archive_joins: committed revision, record ref and original identity copies.', [
    ('AR15_committed_revision', '/payload/committed_thread_revision', 'equals the committed after revision', ARCHIVE,
     "value['committed_thread_revision'] != value['after_revision']"),
    ('AR16_after_revision', '/source/after/revision', 'is the before revision plus one', ARCHIVE,
     "value['after_revision'] != value['next_revision']"),
    ('AR17_record_ref', '/payload/thread_record_ref', 'equals the committed record ref', ARCHIVE,
     "value['thread_record_ref'] != value['after_record_ref']"),
    ('AR18_payload_copies', '/payload', 'thread_id, computer_id, scope and operation_id equal the original request', ARCHIVE,
     "value['payload_copy_mismatches'] != []"),
    ('AR19_before_copies', '/source/before', 'thread_id, computer_id, scope and operation_id equal the original request', ARCHIVE,
     "value['before_copy_mismatches'] != []"),
    ('AR20_after_copies', '/source/after', 'thread_id, computer_id, scope and operation_id equal the original request', ARCHIVE,
     "value['after_copy_mismatches'] != []"),
])

# --------------------------------------------------------------- schema reference closure
phase('rf_closure', 'schema_reference_errors: whole-graph $ref/$dynamicRef closure (standing check 9).', [
    ('RF01_references_resolve', '/**/$ref', 'every reference in the schema graph resolves', 'reference_unresolved',
     "value['reference_errors'] != []"),
])

# =============================================================== Stop (DL-406/DL-427)
SBODY = 'stop_value_unavailable'
SREQ = 'stop_request_refused'
SOUT = 'stop_outcome_refused'
SIDX = 'stop_index_refused'
phase('st_value', 'stop resolve_value: record shape and Storage descriptor.', [
    ('SV01_record_object', '/record', 'is exactly a JSON object', SBODY, "value['record_type'] != 'dict'"),
    ('SV02_payload_object', '/record/payload', 'is exactly a JSON object', SBODY,
     "value['record_type'] == 'dict' and value['payload_type'] != 'dict'"),
    ('SV03_store_descriptor', '/storage_instance', 'satisfies the Storage descriptor', SBODY, "value['store_valid'] is not True"),
])
phase('st_inline', 'stop resolve_value: inline body encoding and limit.', [
    ('SV04_inline_encodable', '/record/payload', 'encodes', SBODY, "value['encoding_error'] is not None"),
    ('SV05_inline_limit', '/record/payload', 'encodes to at most 16384 bytes', SBODY,
     f"value['encoding_error'] is None and value['size'] > {LIMIT}"),
])
phase('st_ref', 'stop resolve_value: reference route shape.', [
    ('SV06_reference_string', '/record/payload_ref', 'is exactly a string', SBODY, "value['reference_type'] != 'str'"),
    ('SV07_payload_empty', '/record/payload', 'a referenced record carries the empty inline payload', SBODY,
     "value['payload_empty'] is not True"),
    ('SV08_source_object', '/source', 'is exactly a JSON object', SBODY, "value['source_type'] != 'dict'"),
    ('SV09_source_body_object', '/source/body', 'is exactly a JSON object', SBODY,
     "value['source_type'] == 'dict' and value['body_type'] != 'dict'"),
])
phase('st_ref_bytes', 'stop resolve_value: the pack body encodes.', [
    ('SV10_body_encodable', '/source/body', 'encodes', SBODY, "value['body_encoding_error'] is not None"),
])
phase('st_pack_a', 'stop resolve_value: pack size, exact reference, key, media, Store and scope copy.', [
    ('SV13_byte_size_type', '/source/byte_size', 'is exactly an integer', SBODY, "value['byte_size_type'] != 'int'"),
    ('SV14_byte_size', '/source/byte_size', 'equals the encoded body length', SBODY,
     "value['byte_size_type'] == 'int' and value['byte_size'] != value['raw_size']"),
    ('SV15_reference_exact', '/record/payload_ref', 'equals the reference recomputed from the body bytes', SBODY,
     "value['reference'] != value['expected_reference']"),
    ('SV16_pack_key', '/source/key', 'equals payload:v1: plus BLAKE3 of the body bytes', SBODY,
     "value['key'] != value['expected_key']"),
    ('SV17_media_type', '/source/media_type', 'is application/msgpack', SBODY, "value['media_type'] != 'application/msgpack'"),
    ('SV18_pack_store', '/source/storage_instance_id', 'equals the reading Store', SBODY, "value['pack_store'] != value['store']"),
    ('SV19_scope_copy', '/source/scope', 'equals the body scope', SBODY, "value['pack_scope'] != value['body_scope']"),
])
phase('st_pack_b', 'stop resolve_value: computer/thread copies and pack custody flags.', [
    ('SV20_computer_copy', '/source/computer_id', 'equals the body computer_id', SBODY,
     "value['pack_computer_id'] != value['body_computer_id']"),
    ('SV21_thread_copy', '/source/thread_id', 'equals the body thread_id', SBODY, "value['pack_thread_id'] != value['body_thread_id']"),
    ('SV22_authorized', '/source/authorized', 'is exactly true', SBODY, "value['authorized'] is not True"),
    ('SV23_hold_access', '/source/hold_access_allowed', 'is exactly true', SBODY, "value['hold_access_allowed'] is not True"),
    ('SV24_bytes_durable', '/source/bytes_durable', 'is exactly true', SBODY, "value['bytes_durable'] is not True"),
    ('SV25_index_durable', '/source/index_durable', 'is exactly true', SBODY, "value['index_durable'] is not True"),
    ('SV26_readback', '/source/readback_verified', 'is exactly true', SBODY, "value['readback_verified'] is not True"),
])
phase('st_pack_c', 'stop resolve_value: pack deletion.', [
    ('SV27_not_deleted', '/source/deleted', 'is exactly false', SBODY, "value['deleted'] is not False"),
])
phase('st_pointer_bounds', 'stop resolve_value: inline pointer encodability and size (entailed by SV15: an exact pointer is at most 131 bytes; defence in depth).', [
    ('SV11_pointer_encodable', '/record/payload_ref', 'the inline pointer encodes', SBODY,
     "value['pointer_encoding_error'] is not None"),
    ('SV12_pointer_size', '/record/payload_ref', 'the inline pointer encodes to at most 16384 bytes', SBODY,
     f"value['pointer_encoding_error'] is None and value['pointer_size'] > {LIMIT}"),
])
phase('st_request_mode', 'stop request_valid: reader mode flag.', [
    ('RQ01_historical_type', '/historical', 'the history-reader flag is exactly a bool', SREQ, "value['historical_type'] != 'bool'"),
])
phase('st_request_store', 'stop request_valid: the independently observed Store descriptor.', [
    ('RQ02_store_descriptor', '/context/storage_instance_id', 'satisfies the Storage descriptor', SREQ,
     "value['store_valid'] is not True"),
])
phase('st_request_schema', 'stop request_valid: closed request and EventRecord schemas.', [
    ('RQ03_request_schema', '/record/payload', 'the resolved request satisfies the closed request schema', SREQ,
     "value['request_valid'] is not True"),
    ('RQ04_envelope_schema', '/record', 'satisfies the EventRecord schema', SREQ, "value['envelope_valid'] is not True"),
])
phase('st_request_access', 'stop request_valid: retained access custody and original byte commitment.', [
    ('RQ05_retained', '/context/retained', 'is exactly true', SREQ, "value['retained'] is not True"),
    ('RQ06_authorized', '/context/authorized', 'is exactly true', SREQ, "value['authorized'] is not True"),
    ('RQ07_hold_access', '/context/hold_access_allowed', 'is exactly true', SREQ, "value['hold_access_allowed'] is not True"),
    ('RQ08_not_deleted', '/context/deleted', 'is exactly false', SREQ, "value['deleted'] is not False"),
    ('RQ09_not_withdrawn', '/context/withdrawn', 'is exactly false', SREQ, "value['withdrawn'] is not False"),
    ('RQ10_source_commitment', '/context/source_value_sha256', 'equals SHA-256 of the record bytes', SREQ,
     "value['source_commitment'] != value['record_commitment']"),
])
phase('st_request_writer', 'stop request_valid: current writer admission and replay policy (standing check 1).', [
    ('RQ11_writer_admitted', '/context/writer_admitted', 'a current request is exactly writer-admitted', SREQ,
     "value['historical'] is False and value['writer_admitted'] is not True"),
    ('RQ12_active_reply', '/context/active_reply', 'a current request targets an active reply', SREQ,
     "value['historical'] is False and value['active_reply'] is not True"),
    ('RQ13_dedupe_available', '/context/dedupe_available', 'a current request has dedupe available', SREQ,
     "value['historical'] is False and value['dedupe_available'] is not True"),
    ('RQ14_replay_policy', '/record/replay_policy', 'is dedupe_by_idempotency_key or the compatibility projector_replay_only', SREQ,
     "value['replay_policy'] not in ('dedupe_by_idempotency_key', 'projector_replay_only')"),
    ('RQ15_current_not_replay_only', '/record/replay_policy', 'a current writer never accepts projector_replay_only', SREQ,
     "value['historical'] is False and value['replay_policy'] == 'projector_replay_only'"),
])
phase('st_request_accepted', 'stop request_valid: the original accepted turn/work intent.', [
    ('RQ16_accepted_copies', '/context/accepted', 'every accepted join/operation/actor/time/reason field equals the request', SREQ,
     "value['accepted_mismatches'] != []"),
])
phase('st_outcome_schema', 'stop outcome_valid: closed outcome schema and first-receipt custody flags.', [
    ('OC01_outcome_schema', '/value', 'satisfies the closed outcome schema', SOUT, "value['outcome_valid'] is not True"),
    ('OC02_first_receipt', '/context/first_receipt_verified', 'is exactly true', SOUT, "value['first_receipt_verified'] is not True"),
    ('OC03_intent_durable', '/context/original_intent_durable', 'is exactly true', SOUT,
     "value['original_intent_durable'] is not True"),
    ('OC04_deadline_preserved', '/context/original_deadline_preserved', 'is exactly true', SOUT,
     "value['original_deadline_preserved'] is not True"),
    ('OC05_cancel_after_receipt', '/context/cancel_delivery_after_receipt', 'is exactly true', SOUT,
     "value['cancel_delivery_after_receipt'] is not True"),
])
phase('st_outcome_decision', 'stop outcome_valid: original decision observation (three-second wait).', [
    ('OC06_elapsed_type', '/context/original_decision/elapsed_ms', 'is exactly an integer', SOUT, "value['elapsed_type'] != 'int'"),
    ('OC07_stopped_type', '/context/original_decision/all_targets_stopped', 'is exactly a bool', SOUT,
     "value['stopped_type'] != 'bool'"),
    ('OC08_cancel_window', '/context/original_decision/elapsed_ms', 'a cancellation is decided within 0..3000 ms', SOUT,
     "value['elapsed_type'] == 'int' and value['stopped'] is True and (value['elapsed_ms'] < 0 or value['elapsed_ms'] > 3000)"),
    ('OC09_timeout_deadline', '/context/original_decision/elapsed_ms', 'a timeout is decided at exactly 3000 ms', SOUT,
     "value['elapsed_type'] == 'int' and value['stopped'] is False and value['elapsed_ms'] != 3000"),
])
phase('st_outcome_join', 'stop outcome_valid: saved result joins to the original request and decision.', [
    ('OC10_store', '/value/storage_instance_id', 'equals the request Store', SOUT, "value['value_store'] != value['request_store']"),
    ('OC11_request_event', '/value/stop_request_event_id', 'equals the request event id', SOUT,
     "value['stop_request_event_id'] != value['request_event_id']"),
    ('OC12_join_copies', '/value', 'scope/computer/thread/turn/target work equal the request', SOUT, "value['join_mismatches'] != []"),
    ('OC13_decided_outcome', '/value/outcome', 'equals the decided cancelled/timeout outcome', SOUT,
     "value['outcome'] != value['decided']"),
    ('OC14_outcome_time', '/value/outcome_at_utc', 'equals the observed decision time', SOUT,
     "value['outcome_at_utc'] != value['observed_outcome_at_utc']"),
    ('OC15_outcome_key', '/key', 'equals the outcome key of the saved value Store and request event id', SOUT,
     "value['key'] != value['expected_key']"),
])
phase('st_save', 'stop save_outcome: a repeated save carries exactly the saved bytes.', [
    ('SA01_repeat_bytes', '/value', 'a repeated save has exactly the saved value bytes', CONFLICT,
     "value['original_present'] is True and value['bytes_equal'] is not True"),
])
phase('st_read_present', 'stop read_outcome: a saved value is present.', [
    ('RD01_value_present', '/value', 'a saved outcome value is present', SOUT, "value['value_present'] is not True"),
])
phase('st_read', 'stop read_outcome: committed result and verified readback.', [
    ('RD02_committed', '/context/result_committed', 'is exactly true', SOUT, "value['result_committed'] is not True"),
    ('RD03_readback', '/context/readback_verified', 'is exactly true', SOUT, "value['readback_verified'] is not True"),
    ('RD04_value_commitment', '/context/outcome_value_sha256', 'equals SHA-256 of the saved value bytes', SOUT,
     "value['outcome_value_sha256'] != value['value_commitment']"),
])
phase('st_queue_action', 'stop queue_can_advance: separate explicit user release.', [
    ('QU01_action_type', '/user_action', 'is exactly a bool', SOUT, "value['user_action_type'] != 'bool'"),
    ('QU02_action_given', '/user_action', 'is true', SOUT, "value['user_action_type'] == 'bool' and value['user_action'] is not True"),
])
phase('st_queue_send', 'stop queue_can_advance: the current send is authorized and unheld.', [
    ('QU03_send_authorized', '/context/current_send_authorized', 'is exactly true', SOUT,
     "value['current_send_authorized'] is not True"),
    ('QU04_hold_clear', '/context/current_send_hold_clear', 'is exactly true', SOUT, "value['current_send_hold_clear'] is not True"),
])
phase('st_index_token', 'stop index_read_valid: exact token field set and current node.', [
    ('IX01_token_fields', '/token', 'has exactly the nine SP-278 token fields', SIDX, "value['token_fields'] != value['required_fields']"),
    ('IX02_node_present', '/source/checkpoint/generations', 'names the token generation', SIDX,
     "value['token_fields'] == value['required_fields'] and value['node_present'] is not True"),
])
phase('st_index_store', 'stop index_read_valid: every Store copy equals the request Store.', [
    ('IX03_token_store', '/token/storage_instance_id', 'equals the request Store', SIDX, "value['token_store'] != value['store']"),
    ('IX04_source_store', '/source/storage_instance_id', 'equals the request Store', SIDX, "value['source_store'] != value['store']"),
    ('IX05_root_store', '/source/checkpoint/storage_instance_id', 'equals the request Store', SIDX,
     "value['root_store'] != value['store']"),
    ('IX06_selection_store', '/token/source_selection/storage_instance_id', 'equals the request Store', SIDX,
     "value['selection_store'] != value['store']"),
])
phase('st_index_key', 'stop index_read_valid: checkpoint key, references and current generation.', [
    ('IX07_token_key', '/token/checkpoint_key', 'equals the generic SP-278 key', SIDX, "value['token_key'] != value['key']"),
    ('IX08_source_key', '/source/checkpoint_key', 'equals the generic SP-278 key', SIDX, "value['source_key'] != value['key']"),
    ('IX09_token_ref', '/token/checkpoint_ref', 'equals the key plus the generation pointer', SIDX,
     "value['token_ref'] != value['expected_ref']"),
    ('IX10_row_ref', '/source/index_row/checkpoint_ref', 'equals the key plus the generation pointer', SIDX,
     "value['row_ref'] != value['expected_ref']"),
    ('IX11_current_generation', '/source/checkpoint/current_generation_id', 'equals the token generation', SIDX,
     "value['current_generation'] != value['generation']"),
    ('IX12_node_current', '/source/checkpoint/generations/<g>/state', 'is current', SIDX, "value['node_state'] != 'current'"),
])
phase('st_index_frontier', 'stop index_read_valid: anchor, frontier and selection equal the node.', [
    ('IX13_anchor', '/token/generation_anchor_sha256', 'equals the node anchor', SIDX, "value['token_anchor'] != value['node_anchor']"),
    ('IX14_frontier_revision', '/token/frontier_revision', 'equals the node frontier revision', SIDX,
     "value['token_frontier_revision'] != value['node_frontier_revision']"),
    ('IX15_frontier_sha256', '/token/frontier_sha256', 'equals the node frontier digest', SIDX,
     "value['token_frontier_sha256'] != value['node_frontier_sha256']"),
    ('IX16_token_selection', '/token/source_selection', 'equals the node selection', SIDX,
     "value['token_selection'] != value['node_selection']"),
    ('IX17_current_selection', '/source/current_source_selection', 'equals the node selection', SIDX,
     "value['current_selection'] != value['node_selection']"),
])
phase('st_index_dataset', 'stop index_read_valid: index dataset names.', [
    ('IX18_token_dataset', '/token/index_dataset_name', 'is event_record_index.v2@<generation>', SIDX,
     "value['token_dataset'] != value['expected_dataset']"),
    ('IX19_node_dataset', '/source/checkpoint/generations/<g>/index_dataset_name', 'is event_record_index.v2@<generation>', SIDX,
     "value['node_dataset'] != value['expected_dataset']"),
    ('IX20_source_dataset', '/source/dataset_name', 'is event_record_index.v2@<generation>', SIDX,
     "value['source_dataset'] != value['expected_dataset']"),
])
phase('st_index_event', 'stop index_read_valid: the index row names the retained request.', [
    ('IX21_row_event_type', '/source/index_row/event_type', 'is chat.response_stop_requested', SIDX,
     "value['row_event_type'] != 'chat.response_stop_requested'"),
    ('IX23_row_event_id', '/source/index_row/event_id', 'equals the request event id', SIDX,
     "value['row_event_id'] != value['record_event_id']"),
    ('IX25_row_sequence', '/source/index_row/sequence_id', 'equals the request sequence', SIDX,
     "value['row_sequence_type'] == 'int' and value['row_sequence_id'] != value['record_sequence_id']"),
    ('IX26_row_partition', '/source/index_row/scope_partition', 'equals the request body partition', SIDX,
     "value['row_partition'] != value['body_partition']"),
    ('IX27_row_commitment', '/source/index_row/source_value_sha256', 'equals the request source commitment', SIDX,
     "value['row_commitment'] != value['context_commitment']"),
])
phase('st_index_entailed', 'stop index_read_valid: request family (the request joins decide first, JN02) and index sequence type (the source type walk decides first, TY03); defence in depth.', [
    ('IX22_record_event_type', '/record/event_type', 'is chat.response_stop_requested', SIDX,
     "value['record_event_type'] != 'chat.response_stop_requested'"),
    ('IX24_row_sequence_type', '/source/index_row/sequence_id', 'is exactly an integer', SIDX, "value['row_sequence_type'] != 'int'"),
])
phase('st_retirement', 'stop retirement_ready: SP-628 cutoff conditions.', [
    ('RR01_contract_specified', '/conditions/replacement_contract_specified', 'is exactly true', 'retirement_pending',
     "value['replacement_contract_specified'] is not True"),
    ('RR02_storage_materialized', '/conditions/replacement_storage_materialized', 'is exactly true', 'retirement_pending',
     "value['replacement_storage_materialized'] is not True"),
    ('RR03_restart_verified', '/conditions/native_restart_verified', 'is exactly true', 'retirement_pending',
     "value['native_restart_verified'] is not True"),
    ('RR04_recovery_verified', '/conditions/native_recovery_verified', 'is exactly true', 'retirement_pending',
     "value['native_recovery_verified'] is not True"),
    ('RR05_barriers_preserved', '/conditions/queue_and_three_second_barriers_preserved', 'is exactly true', 'retirement_pending',
     "value['queue_and_three_second_barriers_preserved'] is not True"),
])


HEADER = '''"""DCH guard table {phase}: {doc}

Method B guard rows for scripts/pm_dch_events.py and scripts/pm_dch_stop.py,
generated by scripts/pm-dch-table-generate.py (edit the row spec there, then
regenerate). Each predicate reads one observation record that the lane checker
derives from the complete boundary input (canonical bytes, digests, recomputed
identities, type names, presence, mismatch lists); predicates never recompute,
repair or call helpers. The checker refuses only through these rows, in this
order. FIELDS names every observation the rows read; the checker passes no other.
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
    names = [row[0] for _, rows in PHASES.values() for row in rows]
    assert len(names) == len(set(names)), 'duplicate row name'
    expected = {f'pm_dch_table_{name}.py': render(name, *spec) for name, spec in PHASES.items()}
    problems = []
    for path in sorted(out.glob('pm_dch_table_*.py')):
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
        print('\n'.join(problems) or f'{len(expected)} DCH table modules current ({len(names)} rows)')
        return 1 if problems else 0
    print(f'wrote {len(expected)} DCH table modules ({len(names)} rows)')
    return 0


if __name__ == '__main__':
    sys.exit(main())

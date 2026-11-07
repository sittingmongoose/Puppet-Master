#!/usr/bin/env python3
"""Write the DR Method B phase-table modules (scripts/pm_runtime_artifact_table_*.py) from one row spec.

Usage: python3 scripts/pm-runtime-artifact-table-generate.py scripts
Spec rows: (name, field, words, code, body); body is the refusal condition or a list of statement lines.
One module per phase table, at most seven rows each, so the shared tool certifies small modules.
The generated modules are the checked-in source of truth; regenerate and diff after editing a row here.
"""
import sys
from pathlib import Path

OUT = Path(sys.argv[1])
CW = "'current-writer'"
HIST = "'historical-v1-before-provider-hash'"


def cond(expr, code):
    return [f"return {code!r} if {expr} else None"]


MODULES = {}


def module(name, doc, rows, factories):
    MODULES[name] = (doc, rows, factories)


# ---------------------------------------------------------------- schema
module('schema', 'Exact schema validator: one adopted schema occurrence per call.', [
    ('S07_structural', '/structural_errors', 'the closed Draft 2020-12 schema reports no error', 'schema_structural',
     "value['structural_errors'] != 0"),
    ('S02_identifier_fullmatch', '/lf_rejects', 'anchored identifier patterns match the entire value', 'schema_identifier_fullmatch',
     "value['lf_rejects'] is not False"),
    ('S04_identifier_key_fullmatch', '/key_lf_rejects', 'anchored identifier keys match the entire key', 'schema_identifier_key_fullmatch',
     "value['key_lf_rejects'] is not False"),
    ('N01_canonical_numbers', '/number_errors', 'current numbers use integer form for integral values', 'schema_canonical_numbers',
     "value['number_errors'] != 0"),
    ('S03_provider_hash_overlay', '/overlay_rejects', 'current provider hash is null or sha256 digest text', 'schema_provider_hash',
     "value['overlay_rejects'] is not False"),
], [('case', ['S07_structural', 'S02_identifier_fullmatch', 'S04_identifier_key_fullmatch', 'N01_canonical_numbers']),
    ('overlay_case', ['S03_provider_hash_overlay'])])

# ---------------------------------------------------------------- codec
module('codec', 'Codec, identity, validator-profile, oracle and reference preconditions.', [
    ('I02_finite_float', '/nonfinite_floats', 'every float in the encoded value is finite', 'nonfinite',
     "value['nonfinite_floats'] != 0"),
    ('I03_supported_type', '/unsupported_values', 'every encoded value is dict, list, str, int, float, bool or null', 'unsupported value',
     "value['unsupported_values'] != 0"),
    ('I01a_revision_integer', '/revision_type', 'the restore observation revision is an exact int', 'missing original observation revision',
     "value['revision_type'] != 'int'"),
    ('I01b_revision_nonnegative', '/revision_negative', 'the restore observation revision is not negative', 'missing original observation revision',
     "value['revision_negative'] is not False"),
    ('S06_validation_profile', '/profile', 'the validation profile is the current writer or historical v1', 'unsupported historical decoder',
     f"value['profile'] not in ({CW}, {HIST})"),
    ('N01s_storage_numbers', '/number_errors', 'producer storage input uses integer form for integral values', 'noncanonical producer number',
     "value['number_errors'] != 0"),
    ('S05_failure_oracle', '/raised', 'a failure oracle counts only a raised refusal, never a success', 'success_is_not_failure',
     "value['raised'] is not True"),
    ('S01_references_resolve', '/unresolved_count', 'every schema reference resolves, including unused branches', 'unresolved_schema_reference',
     "value['unresolved_count'] != 0"),
], [('value_case', ['I02_finite_float', 'I03_supported_type']),
    ('identity_case', ['I01a_revision_integer', 'I01b_revision_nonnegative']),
    ('profile_case', ['S06_validation_profile']),
    ('storage_case', ['N01s_storage_numbers']),
    ('oracle_case', ['S05_failure_oracle']),
    ('references_case', ['S01_references_resolve'])])

# ---------------------------------------------------------------- decode
decode_rows = [
    ('D02a_family', '/event_type', 'equals the draft row event type', 'wrong family/schema', "value['event_type'] != value['row_event_type']"),
    ('D02b_payload_schema', '/payload_schema_id', 'equals the draft row payload schema id', 'wrong family/schema',
     "value['payload_schema_id'] != value['row_payload_schema_id']"),
    ('D03a_scope', '/scope_kind', 'is project', 'wrong scope/replay/redaction', "value['scope_kind'] != 'project'"),
    ('D03b_replay', '/replay_policy', 'is dedupe_by_idempotency_key', 'wrong scope/replay/redaction',
     "value['replay_policy'] != 'dedupe_by_idempotency_key'"),
    ('D03c_redaction', '/redaction_profile', 'is no_secrets', 'wrong scope/replay/redaction', "value['redaction_profile'] != 'no_secrets'"),
    ('D04_inline_size', '/inline_size', 'an inline payload has a canonical encoding of at most 16384 bytes', 'oversized inline',
     "value['route'] == 'inline' and (value['inline_size'] is None or value['inline_size'] > 16384)"),
    ('D05_ref_grammar', '/ref_grammar', 'payload_ref is a full-match pm.payload_pack.v1 blake3 application/json reference', 'wrong reference/placeholder',
     "value['ref_grammar'] is not True"),
    ('D06_placeholder', '/placeholder', 'a packed event carries the empty-object payload placeholder', 'wrong reference/placeholder',
     "value['placeholder'] != {}"),
    ('D07a_pack_present', '/pack_present', 'the referenced pack exists', 'pack unavailable', "value['pack_present'] is not True"),
    ('D07b_pack_durable', '/pack_durable', 'a present pack is durable (exactly true)', 'pack unavailable',
     "value['pack_present'] is True and value['pack_durable'] is not True"),
    ('D07c_pack_authorized', '/pack_authorized', 'a present pack is authorized (exactly true)', 'pack unavailable',
     "value['pack_present'] is True and value['pack_authorized'] is not True"),
    ('D08_pack_size', '/body_length', 'a present pack has bytes of the referenced length', 'pack integrity',
     "value['pack_present'] is True and value['body_length'] != value['ref_size']"),
    ('D09_pack_digest', '/body_blake3', 'a present pack has bytes whose blake3 digest equals the reference digest', 'pack integrity',
     "value['pack_present'] is True and value['body_blake3'] != value['ref_digest']"),
    ('D10u_body_utf8', '/body_utf8', 'the pack body is strict UTF-8', 'pack body', "value['body_utf8'] is not True"),
    ('D10j_body_json', '/body_json', 'strict UTF-8 pack text is one JSON value', 'pack body',
     "value['body_utf8'] is True and value['body_json'] is not True"),
    ('D10a_unique_members', '/body_duplicate_member', 'parsed pack JSON has no duplicate member', 'duplicate key',
     "value['body_json'] is True and value['body_duplicate_member'] is not False"),
    ('D10b_canonical_body', '/body_sha256', 'parsed pack JSON without duplicates re-encodes to the exact body (RFC 8785)', 'noncanonical storage route',
     "value['body_duplicate_member'] is False and value['body_sha256'] != value['canonical_sha256']"),
    ('D11_not_small', '/body_length', 'a packed body is larger than the 16384-byte inline limit', 'noncanonical storage route',
     "value['body_length'] <= 16384"),
    ('B02a_provider_source_present', '/provider_source_present', 'the provider source bytes are available (or recorded unknown)', 'provider source unavailable',
     "value['provider_source_present'] is not True"),
    ('B02b_provider_source_bytes', '/provider_source_type', 'an available provider source is exact bytes or null (unknown)', 'provider source unavailable',
     "value['provider_source_present'] is True and value['provider_source_type'] not in ('bytes', 'NoneType')"),
    ('B03_provider_digest', '/provider_payload_hash', 'provider_payload_hash equals sha256 of the source bytes, or null when unknown', 'provider source digest',
     "value['provider_payload_hash'] != value['provider_expected_hash']"),
    ('D13_project', '/payload_project_id', 'equals the event project_id', 'Project join', "value['payload_project_id'] != value['event_project_id']"),
    ('D14_run', '/payload_run_id', 'equals the event run_id', 'run_id join', "value['event_run_id'] != value['payload_run_id']"),
    ('D14_attempt', '/payload_attempt_id', 'equals the event attempt_id', 'attempt_id join', "value['event_attempt_id'] != value['payload_attempt_id']"),
    ('D14_thread', '/payload_thread_id', 'equals the event thread_id', 'thread_id join', "value['event_thread_id'] != value['payload_thread_id']"),
    ('D14_node', '/payload_node_id', 'equals the event node_id', 'node_id join', "value['event_node_id'] != value['payload_node_id']"),
    ('D15_authored_time', '/payload_created_at_utc', 'equals the event occurred_at_utc', 'authored time join',
     "value['event_occurred_at_utc'] != value['payload_created_at_utc']"),
    ('D16_actor', '/payload_actor_ref', 'a present payload actor_ref equals the event actor_ref', 'actor join',
     "value['payload_actor_present'] is True and value['payload_actor_ref'] != value['event_actor_ref']"),
    ('D17_identity', '/idempotency_key', 'equals the recomputed RAP artifact identity', 'identity join',
     "value['idempotency_key'] != value['expected_identity']"),
    ('D18_point_project', '/point_project_id', 'restore point project_id equals the payload project_id', 'point Project join',
     "value['point_project_id'] != value['payload_project_id']"),
]
module('decode', 'Full-envelope decode: dispatch, storage route, provider source and joins.', decode_rows, [
    ('envelope_case', ['D02a_family', 'D02b_payload_schema', 'D03a_scope', 'D03b_replay', 'D03c_redaction', 'D04_inline_size']),
    ('pack_ref_case', ['D05_ref_grammar', 'D06_placeholder']),
    ('pack_source_case', ['D07a_pack_present', 'D07b_pack_durable', 'D07c_pack_authorized', 'D08_pack_size', 'D09_pack_digest']),
    ('pack_body_case', ['D10u_body_utf8', 'D10j_body_json', 'D10a_unique_members', 'D10b_canonical_body', 'D11_not_small']),
    ('provider_source_case', ['B02a_provider_source_present', 'B02b_provider_source_bytes']),
    ('provider_digest_case', ['B03_provider_digest']),
    ('joins_case', ['D13_project', 'D14_run', 'D14_attempt', 'D14_thread', 'D14_node', 'D15_authored_time', 'D16_actor']),
    ('identity_case', ['D17_identity']),
    ('restore_identity_case', ['D17_identity', 'D18_point_project'])])

# ---------------------------------------------------------------- stored
module('stored', 'Lexical validation of a stored original EventRecord copy.', [
    ('V02a_scope', '/scope_kind', 'is project', 'stored_invalid', "value['scope_kind'] != 'project'"),
    ('V02b_replay', '/replay_policy', 'is dedupe_by_idempotency_key', 'stored_invalid', "value['replay_policy'] != 'dedupe_by_idempotency_key'"),
    ('V03_ref_grammar', '/ref_grammar', 'a stored payload_ref is a full-match pack reference', 'stored_invalid',
     "value['route'] == 'packed' and value['ref_grammar'] is not True"),
    ('V04_placeholder', '/placeholder', 'a stored packed event has the empty-object placeholder', 'stored_invalid',
     "value['route'] == 'packed' and value['placeholder'] != {}"),
    ('V07_dispatch', '/dispatch_found', 'a stored inline event dispatches to a draft row by family and schema id', 'stored_invalid',
     "value['route'] == 'inline' and value['dispatch_found'] is not True"),
    ('V05_inline_size', '/inline_size', 'a stored inline payload has a canonical encoding of at most 16384 bytes', 'stored_invalid',
     "value['route'] == 'inline' and (value['inline_size'] is None or value['inline_size'] > 16384)"),
], [('case', ['V02a_scope', 'V02b_replay', 'V03_ref_grammar', 'V04_placeholder', 'V07_dispatch', 'V05_inline_size'])])

# ---------------------------------------------------------------- inspect
module('inspect', 'Authenticated source inspection for retained reads.', [
    ('H01a_withdrawn', '/withdrawn', 'is exactly false', 'unavailable', "value['withdrawn'] is not False"),
    ('H01b_authorized', '/authorized', 'is exactly true', 'unavailable', "value['authorized'] is not True"),
    ('H02a_source_valid', '/source_valid', 'is exactly true', 'unavailable', "value['source_valid'] is not True"),
    ('H02b_receipt_valid', '/receipt_valid', 'is exactly true', 'unavailable', "value['receipt_valid'] is not True"),
    ('H03a_project', '/source_project_id', 'equals the payload project_id', 'identity_conflict', "value['source_project_id'] != value['payload_project_id']"),
    ('H03b_family', '/source_event_type', 'equals the draft row event type', 'identity_conflict', "value['source_event_type'] != value['row_event_type']"),
    ('H04_original_payload', '/original_payload_sha256', 'canonical bytes of the original payload equal the payload bytes', 'identity_conflict',
     "value['original_payload_sha256'] != value['payload_sha256']"),
    ('H07_body_deleted_type', '/body_deleted', 'is an exact boolean', 'unavailable', "type(value['body_deleted']) is not bool"),
], [('flags_case', ['H01a_withdrawn', 'H01b_authorized', 'H02a_source_valid', 'H02b_receipt_valid', 'H03a_project', 'H03b_family']),
    ('payload_case', ['H04_original_payload']),
    ('deleted_case', ['H07_body_deleted_type'])])

# ---------------------------------------------------------------- full value
module('full_value', 'SP-286/CV-339 complete-value retry and retained-original joins.', [
    ('F02_candidate_bytes', '/candidate_sha256', 'candidate canonical bytes equal the stored original event bytes', 'full_value_mismatch',
     "value['candidate_sha256'] != value['stored_sha256']"),
    ('F12_result_bytes', '/result_sha256', 'supplied result bytes equal the original result bytes', 'full_value_mismatch',
     "value['result_sha256'] != value['original_result_sha256']"),
    ('F13_custody_bytes', '/custody_sha256', 'supplied custody bytes equal the original custody bytes', 'full_value_mismatch',
     "value['custody_sha256'] != value['original_custody_sha256']"),
    ('F10_receipt_copy', '/receipt_sha256', 'result first receipt bytes equal the custody first receipt bytes', 'full_value_mismatch',
     "value['receipt_sha256'] != value['custody_receipt_sha256']"),
    ('F11a_receipt_event', '/receipt_event_id', 'equals the candidate event_id', 'full_value_mismatch',
     "value['receipt_event_id'] != value['candidate_event_id']"),
    ('F11b_custody_event', '/custody_event_id', 'equals the candidate event_id', 'full_value_mismatch',
     "value['candidate_event_id'] != value['custody_event_id']"),
    ('F03_partition', '/custody_scope_partition', 'equals the encoded project~ partition of the candidate project', 'full_value_mismatch',
     "value['custody_scope_partition'] != value['expected_scope_partition']"),
    ('F04_custody_family', '/custody_event_type', 'equals the candidate event_type', 'full_value_mismatch',
     "value['custody_event_type'] != value['candidate_event_type']"),
    ('F05_custody_key', '/custody_idempotency_key', 'equals the candidate idempotency_key', 'full_value_mismatch',
     "value['custody_idempotency_key'] != value['candidate_idempotency_key']"),
    ('F06_receipt_sequence', '/receipt_sequence_code', 'receipt sequence_id bytes equal the candidate sequence_id bytes', 'full_value_mismatch',
     "value['receipt_sequence_code'] != value['candidate_sequence_code']"),
    ('F07_segment_ref', '/result_segment_ref', 'equals the custody original_segment_ref', 'full_value_mismatch',
     "value['result_segment_ref'] != value['custody_segment_ref']"),
    ('F08a_custody_commitment', '/custody_commitment', 'equals the recomputed original event value commitment', 'full_value_mismatch',
     "value['expected_commitment'] != value['custody_commitment']"),
    ('F08b_result_commitment', '/result_commitment', 'equals the custody commitment', 'full_value_mismatch',
     "value['custody_commitment'] != value['result_commitment']"),
    ('F09_semantic_digest', '/custody_semantic_digest', 'equals the recomputed producer semantic digest', 'full_value_mismatch',
     "value['expected_semantic_digest'] != value['custody_semantic_digest']"),
], [('bytes_case', ['F02_candidate_bytes', 'F12_result_bytes', 'F13_custody_bytes', 'F10_receipt_copy']),
    ('ids_case', ['F11a_receipt_event', 'F11b_custody_event', 'F03_partition', 'F04_custody_family', 'F05_custody_key',
                  'F06_receipt_sequence', 'F07_segment_ref', 'F08a_custody_commitment', 'F08b_result_commitment', 'F09_semantic_digest'])])

# ---------------------------------------------------------------- history / append / policies
module('history', 'Explicit retained-history decoder selection.', [
    ('H05_decoder', '/decoder', 'is the supported historical v1 decoder', 'unavailable', f"value['decoder'] != {HIST}"),
], [('case', ['H05_decoder'])])

module('append', 'Hypothetical admitted append and retry model.', [
    ('A01_admission', '/admission', 'is exactly true', 'withdrawn', "value['admission'] is not True"),
    ('A02a_source', '/source_valid', 'is exactly true', 'unavailable', "value['source_valid'] is not True"),
    ('A02b_dedupe', '/dedupe_available', 'is exactly true', 'unavailable', "value['dedupe_available'] is not True"),
    ('A03a_replay_only', '/replay_policy', 'is not projector_replay_only', 'replay_only_not_appendable',
     "value['replay_policy'] == 'projector_replay_only'"),
    ('A03b_policy', '/replay_policy', 'is dedupe_by_idempotency_key', 'invalid', "value['replay_policy'] != 'dedupe_by_idempotency_key'"),
    ('A04_global_conflict', '/global_digest', 'a known event_id carries the same semantic digest', 'idempotency_conflict',
     "value['global_digest'] is not None and value['global_digest'] != value['digest']"),
    ('A05_scoped_conflict', '/scoped_digest', 'a known scoped key carries the same semantic digest', 'idempotency_conflict',
     "value['scoped_digest'] is not None and value['scoped_digest'] != value['digest']"),
], [('gate_case', ['A01_admission', 'A02a_source', 'A02b_dedupe']),
    ('replay_case', ['A03a_replay_only']),
    ('policy_case', ['A03b_policy']),
    ('dedupe_case', ['A04_global_conflict', 'A05_scoped_conflict'])])

module('policies', 'Index and checkpoint retention policy assignment.', [
    ('P01_index_policy', '/index_retention_policy_ref', 'equals the Storage event_record_index policy', 'policy_mismatch',
     "value['index_retention_policy_ref'] != value['index_policy']"),
    ('P02_checkpoint_policy', '/checkpoint_retention_policy_ref', 'equals the Storage checkpoint policy', 'policy_mismatch',
     "value['checkpoint_retention_policy_ref'] != value['checkpoint_policy']"),
    ('P03_no_derived_policy', '/derived_retention_policy_ref', 'is absent', 'policy_mismatch', "value['derived_present'] is not False"),
], [('case', ['P01_index_policy', 'P02_checkpoint_policy', 'P03_no_derived_policy'])])

# ---------------------------------------------------------------- checkpoint
CPX = 'checkpoint_mismatch'
def cp(name, field, words, expr):
    return (name, field, words, CPX, expr)
NODE = "value['node_present'] is True and "
SEG = "value['segment_present'] is True and "
module('checkpoint', 'Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).', [
    cp('C01a_route_key', '/row_checkpoint_key', 'equals the SP-278 checkpoint key template', "value['row_checkpoint_key'] != value['key_template']"),
    cp('C01b_schema_ref', '/row_checkpoint_schema_ref', 'equals the checkpoint schema reference', "value['row_checkpoint_schema_ref'] != value['schema_ref']"),
    cp('C03a_bundle_key', '/bundle_checkpoint_key', 'equals the key of the custody storage instance', "value['bundle_checkpoint_key'] != value['key']"),
    cp('C03b_token_key', '/token_checkpoint_key', 'equals the key of the custody storage instance', "value['token_checkpoint_key'] != value['key']"),
    cp('C03c_checkpoint_store', '/checkpoint_storage_instance_id', 'equals the custody storage instance', "value['checkpoint_storage'] != value['storage']"),
    cp('C03d_token_store', '/token_storage_instance_id', 'equals the custody storage instance', "value['token_storage'] != value['storage']"),
    cp('C03e_source_store', '/source_storage_instance_id', 'equals the custody storage instance', "value['source_storage'] != value['storage']"),
    cp('C04x_node_present', '/current_generation_id', 'names a generation present in the map', "value['node_present'] is not True"),
    cp('C04a_node_generation_copy', '/node_generation_id', 'the selected node copy equals the current generation key', NODE + "value['node_generation_id'] != value['generation']"),
    cp('C04b_node_state', '/node_state', 'the selected node is current', NODE + "value['node_state'] != 'current'"),
    cp('C04c_single_current', '/current_count', 'exactly one generation is current', NODE + "value['current_count'] != 1"),
    cp('C04d_selection_store', '/selection_storage_instance_id', 'the live source selection names the custody store', "value['selection_storage'] != value['storage']"),
    cp('C04e_anchor_store', '/anchor_selection_storage_instance_id', 'the anchor selection names the custody store', NODE + "value['anchor_selection_storage'] != value['storage']"),
    cp('C04f_frontier_selection', '/frontier_selection_sha256', 'frontier selection bytes equal the live selection bytes', NODE + "value['frontier_selection_sha256'] != value['selection_sha256']"),
    cp('C04g_token_selection', '/token_selection_sha256', 'token selection bytes equal the live selection bytes', "value['token_selection_sha256'] != value['selection_sha256']"),
    cp('C04h_verified', '/source_verified', 'the selected source is verified (exactly true)', "value['source_verified'] is not True"),
    cp('C04i_snapshot', '/token_redb_snapshot_id', 'equals the selected source redb snapshot', "value['source_redb_snapshot_id'] != value['token_redb_snapshot_id']"),
    cp('C05a_generation_identity', '/generation', 'equals the recomputed SP-278 generation identity', "value['generation'] != value['expected_generation']"),
    cp('C05b_token_ref', '/token_checkpoint_ref', 'token checkpoint_ref bytes equal the recomputed ref', "value['token_checkpoint_ref'] != value['expected_checkpoint_ref']"),
    cp('C05c_token_generation', '/token_generation_id', 'token generation_id bytes equal the current generation', "value['token_generation_id'] != value['expected_generation_id']"),
    cp('C05d_token_anchor', '/token_generation_anchor_sha256', 'token anchor digest bytes equal the recomputed anchor digest', "value['token_anchor_sha256'] != value['expected_anchor_sha256']"),
    cp('C05e_token_revision', '/token_frontier_revision', 'token frontier_revision bytes equal the frontier publication revision', "value['token_frontier_revision'] != value['expected_frontier_revision']"),
    cp('C05f_token_frontier', '/token_frontier_sha256', 'token frontier digest bytes equal the recomputed frontier digest', "value['token_frontier_sha256'] != value['expected_frontier_sha256']"),
    cp('C05g_token_dataset', '/token_index_dataset_name', 'token dataset name bytes equal the generation dataset name', "value['token_dataset_name'] != value['expected_dataset_name']"),
    cp('C05j_node_dataset', '/node_index_dataset_name', 'the node dataset name equals the token dataset name', "value['node_dataset_name'] != value['token_dataset_name_text']"),
    cp('C06b_source_event', '/source_event_sha256', 'the selected source event bytes equal the event bytes', "value['source_event_sha256'] != value['event_sha256']"),
    cp('C07a_source_partition', '/source_scope_partition', 'equals the encoded project~ partition', "value['source_partition'] != value['partition']"),
    cp('C07c_source_event_digest', '/source_event_value_sha256', 'equals sha256 of the event value bytes', "value['source_event_value_sha256'] != value['event_value_sha256']"),
    cp('C07d_source_locator', '/source_locator_sha256', 'locator bytes equal the first receipt segment/name/offset/sequence', "value['source_locator_sha256'] != value['expected_locator_sha256']"),
    cp('C07e_selection_segment', '/selection_segment_generation', 'equals the first receipt segment generation', "value['selection_segment_generation'] != value['receipt_segment_generation']"),
    cp('C08a_current_generation_type', '/current_selected_segment_generation', 'is an exact int', "value['current_generation_type'] != 'int'"),
    cp('C08b_manifest_segment_type', '/manifest_selected_segment_generation', 'is an exact int', "value['manifest_segment_type'] != 'int'"),
    cp('C08c_manifest_generation_type', '/manifest_generation', 'is an exact int', "value['manifest_generation_type'] != 'int'"),
    cp('C08d_recovery_epoch_type', '/manifest_recovery_epoch', 'is an exact int', "value['recovery_epoch_type'] != 'int'"),
    cp('C08e_current_bytes', '/selection_current_bytes_sha256', 'equals sha256 of the CURRENT bytes', "value['selection_current_sha256'] != value['current_sha256']"),
    cp('C08f_manifest_bytes', '/selection_manifest_bytes_sha256', 'equals sha256 of the manifest bytes', "value['selection_manifest_sha256'] != value['manifest_sha256']"),
    cp('C08g_current_generation', '/current_selected_segment_generation', 'equals the selection segment generation', "value['current_generation'] != value['selection_segment_generation']"),
    cp('C08h_manifest_segment', '/manifest_selected_segment_generation', 'equals the selection segment generation', "value['manifest_segment'] != value['selection_segment_generation']"),
    cp('C08i_manifest_generation', '/manifest_generation', 'equals the selection manifest generation', "value['manifest_generation'] != value['selection_manifest_generation']"),
    cp('C08j_recovery_epoch', '/manifest_recovery_epoch', 'equals the selection recovery epoch', "value['recovery_epoch'] != value['selection_recovery_epoch']"),
    cp('C08k_survivor_prefix', '/manifest_survivor_prefix_sha256', 'equals the selection survivor prefix digest', "value['survivor_prefix'] != value['selection_survivor_prefix']"),
    cp('C08l_inventory_bytes', '/manifest_retained_inventory', 'inventory bytes equal the selected source segments bytes', "value['inventory_sha256'] != value['segments_sha256']"),
    cp('C08m_inventory_digest', '/selection_retained_inventory_sha256', 'equals the binding digest of the inventory', "value['selection_inventory_digest'] != value['inventory_digest']"),
    cp('C08n_watermarks_digest', '/selection_durable_watermarks_sha256', 'equals the binding digest of the durable watermarks', "value['selection_watermarks_digest'] != value['watermarks_digest']"),
    cp('C08o_excluded_digest', '/selection_excluded_ranges_sha256', 'equals the binding digest of the excluded ranges', "value['selection_excluded_digest'] != value['excluded_digest']"),
    cp('C08p_retired_digest', '/selection_retired_inputs_sha256', 'equals the binding digest of the retired inputs', "value['selection_retired_digest'] != value['retired_digest']"),
    cp('C09a_anchor_selection', '/anchor_source_selection', 'anchor selection bytes equal the live selection bytes', "value['anchor_selection_sha256'] != value['selection_sha256']"),
    cp('C09b_translation', '/node_translation', 'is null in this initial edition', "value['translation'] is not None"),
    cp('C09c_anchor_count', '/anchor_retained_event_count', 'equals the verified one-event source count', "value['anchor_count'] != 1"),
    cp('C09d_anchor_first', '/anchor_first_retained_sequence_id', 'equals the event sequence_id', "value['anchor_first'] != value['event_sequence_id']"),
    cp('C09e_anchor_through', '/anchor_through_sequence_id', 'equals the event sequence_id', "value['anchor_through'] != value['event_sequence_id']"),
    cp('C09f_anchor_prefix', '/anchor_retained_event_prefix_sha256', 'equals the recomputed retained prefix digest', "value['anchor_prefix'] != value['prefix']"),
    cp('C09g_anchor_gaps', '/anchor_sequence_gaps_sha256', 'equals the binding digest of no gaps', "value['anchor_gaps'] != value['no_gaps_digest']"),
    cp('C09h_coverage_count', '/coverage_retained_event_count', 'equals the verified one-event source count', "value['coverage_count'] != 1"),
    cp('C09k_coverage_gaps', '/coverage_sequence_gaps', 'is the empty list', "value['coverage_gaps'] != []"),
    cp('C09l_coverage_prefix', '/coverage_retained_event_prefix_sha256', 'equals the recomputed retained prefix digest', "value['coverage_prefix'] != value['prefix']"),
    cp('C09m_coverage_first', '/coverage_first_retained_sequence_id', 'equals the event sequence_id', "value['coverage_first'] != value['event_sequence_id']"),
    cp('C09n_coverage_through', '/coverage_through_sequence_id', 'equals the event sequence_id', "value['coverage_through'] != value['event_sequence_id']"),
    cp('C10a_last_frame', '/coverage_last_frame', 'bytes equal the receipt frame and event identity', "value['last_frame_sha256'] != value['expected_last_frame_sha256']"),
    cp('C10b_coverage_segments', '/coverage_segments', 'bytes equal the selected source segments bytes', "value['coverage_segments_sha256'] != value['segments_sha256']"),
    cp('C10c_single_segment', '/source_segments', 'holds exactly one segment', "value['segment_count'] != 1"),
    cp('C11a_segment_generation', '/segment_generation', 'equals the receipt segment generation', SEG + "value['segment_generation'] != value['receipt_segment_generation']"),
    cp('C11b_segment_name', '/segment_name', 'equals the receipt segment name', SEG + "value['segment_name'] != value['receipt_segment_name']"),
    cp('C11d_scanned_through', '/scanned_through_offset', 'equals the frame end offset', SEG + "value['scanned_through'] != value['frame_end']"),
    cp('C11e_durable_end', '/source_durable_end_offset', 'equals the receipt durable end offset', SEG + "value['segment_durable_end'] != value['receipt_durable_end']"),
    cp('C11f_durable_bytes', '/source_durable_bytes_sha256', 'equals the source event value digest', SEG + "value['segment_durable_sha256'] != value['source_event_value_sha256']"),
    cp('C11g_frame_end', '/frame_end_offset', 'equals the length of the event value bytes', "value['frame_end'] != value['event_value_length']"),
    cp('C11h_frame_within_durable', '/frame_end_offset', 'is at most the receipt durable end offset', "value['frame_beyond_durable'] is not False"),
    cp('C11i_segment_count', '/segment_retained_event_count', 'is 1', SEG + "value['segment_count_events'] != 1"),
    cp('C11j_segment_first', '/segment_first_sequence_id', 'equals the event sequence_id', SEG + "value['segment_first'] != value['event_sequence_id']"),
    cp('C11k_segment_last', '/segment_last_sequence_id', 'equals the event sequence_id', SEG + "value['segment_last'] != value['event_sequence_id']"),
    cp('C12_dataset', '/datasets', 'bytes equal the expected one-row dataset', "value['datasets_sha256'] != value['expected_datasets_sha256']"),
    cp('C13_row_count', '/frontier_index_row_count', 'is 1', "value['row_count'] != 1"),
    cp('C14_row_set_digest', '/frontier_index_row_set_sha256', 'equals the recomputed row-set digest', "value['row_set_digest'] != value['expected_row_set_digest']"),
], [('route_case', ['C01a_route_key', 'C01b_schema_ref']),
    ('store_case', ['C03a_bundle_key', 'C03b_token_key', 'C03c_checkpoint_store', 'C03d_token_store', 'C03e_source_store']),
    ('node_case', ['C04x_node_present', 'C04a_node_generation_copy', 'C04b_node_state', 'C04c_single_current', 'C04d_selection_store',
                   'C04e_anchor_store', 'C04f_frontier_selection', 'C04g_token_selection', 'C04h_verified', 'C04i_snapshot']),
    ('token_case', ['C05a_generation_identity', 'C05b_token_ref', 'C05c_token_generation', 'C05d_token_anchor',
                    'C05e_token_revision', 'C05f_token_frontier', 'C05g_token_dataset', 'C05j_node_dataset']),
    ('source_event_case', ['C06b_source_event']),
    ('source_case', ['C07a_source_partition', 'C07c_source_event_digest', 'C07d_source_locator', 'C07e_selection_segment']),
    ('manifest_type_case', ['C08a_current_generation_type', 'C08b_manifest_segment_type', 'C08c_manifest_generation_type', 'C08d_recovery_epoch_type']),
    ('manifest_case', ['C08e_current_bytes', 'C08f_manifest_bytes', 'C08g_current_generation', 'C08h_manifest_segment', 'C08i_manifest_generation',
                       'C08j_recovery_epoch', 'C08k_survivor_prefix', 'C08l_inventory_bytes', 'C08m_inventory_digest', 'C08n_watermarks_digest',
                       'C08o_excluded_digest', 'C08p_retired_digest']),
    ('anchor_case', ['C09a_anchor_selection', 'C09b_translation', 'C09c_anchor_count', 'C09d_anchor_first', 'C09e_anchor_through',
                     'C09f_anchor_prefix', 'C09g_anchor_gaps']),
    ('coverage_case', ['C09h_coverage_count', 'C09k_coverage_gaps',
                       'C09l_coverage_prefix', 'C09m_coverage_first', 'C09n_coverage_through']),
    ('frame_case', ['C10a_last_frame', 'C10b_coverage_segments', 'C10c_single_segment']),
    ('segment_case', ['C11a_segment_generation', 'C11b_segment_name', 'C11d_scanned_through', 'C11e_durable_end',
                      'C11f_durable_bytes', 'C11g_frame_end', 'C11h_frame_within_durable', 'C11i_segment_count', 'C11j_segment_first',
                      'C11k_segment_last']),
    ('dataset_case', ['C12_dataset', 'C13_row_count', 'C14_row_set_digest'])])

# ---------------------------------------------------------------- observation (RAP-113 restore point)
OBS = 'observation_refused'
def ob(name, field, words, expr):
    return (name, field, words, OBS, expr)
module('observation', 'RAP-113 restore-point observation ordinal, predecessor and owner-snapshot model.', [
    ob('O01a_proof_valid', '/proof_valid', 'is exactly true', "value['proof_valid'] is not True"),
    ob('O01b_predecessor_complete', '/predecessor_complete', 'is exactly true', "value['predecessor_complete'] is not True"),
    ob('O01c_snapshot_current', '/snapshot_current', 'is exactly true', "value['snapshot_current'] is not True"),
    ob('O02_grouping', '/correlation_id', 'equals the four-member RAP-113 grouping identity', "value['correlation_id'] != value['grouping_identity']"),
    ob('O03b_owner_snapshot', '/canonical_point', 'canonical bytes of the owner snapshot equal the candidate restore point bytes', "value['point_sha256'] != value['snapshot_sha256']"),
    ob('O04a_first_ordinal', '/producer_sequence_id', 'a first observation has ordinal 0', "value['producer_sequence_id'] != 0"),
    ob('O04b_first_parent', '/parent_event_id', 'a first observation has no parent', "value['parent_event_id'] is not None"),
    ob('O12_recorded_recipe', '/recorded_decoder', 'the authenticated write-time recipe is supported', "value['decoder'] not in ('current-writer', 'historical-v1-before-provider-hash')"),
    ob('O05_artifact', '/artifact_id', 'equals the predecessor artifact_id', "value['artifact_id'] != value['old_artifact_id']"),
    ob('O05_restore_point_id', '/type_payload/restore_point_id', 'equals the predecessor value', "value['restore_point_id'] != value['old_restore_point_id']"),
    ob('O05_project_id', '/type_payload/project_id', 'equals the predecessor value', "value['point_project_id'] != value['old_point_project_id']"),
    ob('O05_record_ref', '/type_payload/record_ref', 'equals the predecessor value', "value['record_ref'] != value['old_record_ref']"),
    ob('O05_record_sha256', '/type_payload/record_sha256', 'equals the predecessor value', "value['record_sha256'] != value['old_record_sha256']"),
    ob('O05_source_thread_id', '/type_payload/source_thread_id', 'equals the predecessor value', "value['source_thread_id'] != value['old_source_thread_id']"),
    ob('O05_source_branch_id', '/type_payload/source_branch_id', 'equals the predecessor value', "value['source_branch_id'] != value['old_source_branch_id']"),
    ob('O05_source_message_id', '/type_payload/source_message_id', 'equals the predecessor value', "value['source_message_id'] != value['old_source_message_id']"),
    ob('O06_changed', '/type_payload', 'differs from the predecessor restore point', "value['point'] == value['old_point']"),
    ob('O07_terminal', '/type_payload/status', 'a terminal predecessor status is never reopened or changed', "value['old_status'] != 'available' and value['status'] != value['old_status']"),
    ob('O08_ordinal', '/producer_sequence_id', 'equals the predecessor ordinal plus one', "value['producer_sequence_id'] != value['expected_ordinal']"),
    ob('O09_parent', '/parent_event_id', 'equals the predecessor event_id', "value['parent_event_id'] != value['previous_event_id']"),
    ob('O10_prior_group', '/correlation_id', 'equals the predecessor correlation_id', "value['correlation_id'] != value['previous_correlation_id']"),
], [('source_case', ['O01a_proof_valid', 'O01b_predecessor_complete', 'O01c_snapshot_current']),
    ('group_case', ['O02_grouping']),
    ('snapshot_case', ['O03b_owner_snapshot']),
    ('first_case', ['O04a_first_ordinal', 'O04b_first_parent']),
    ('recipe_case', ['O12_recorded_recipe']),
    ('lineage_case', ['O05_artifact', 'O05_restore_point_id', 'O05_project_id', 'O05_record_ref', 'O05_record_sha256',
                      'O05_source_thread_id', 'O05_source_branch_id', 'O05_source_message_id']),
    ('advance_case', ['O06_changed', 'O07_terminal', 'O08_ordinal', 'O09_parent', 'O10_prior_group'])])

# ---------------------------------------------------------------- source agreement (CV-526/CV-537 current writer)
def ag(name, rule, words):
    return (name, '/' + name, words, rule + ': source/copy disagreement', [
        f"for pair in value[{name!r}]:",
        "    if pair[0] != pair[1]:",
        f"        return {rule + ': source/copy disagreement'!r}",
        "return None"])
BROWSER = [ag('browser_action_session', 'browser_session', 'every action browser_session_id equals the recording session'),
           ag('browser_page_ref', 'browser_page', 'page_representation_ref equals the page representation id'),
           ag('browser_page_screenshot', 'browser_page', 'a copied screenshot ref equals the page representation'),
           ag('browser_page_pdf', 'browser_page', 'a copied pdf ref equals the page representation'),
           ag('browser_page_console', 'browser_page', 'a copied console ref equals the page representation'),
           ag('browser_page_network', 'browser_page', 'a copied network ref equals the page representation'),
           ag('browser_page_redaction', 'browser_page', 'the page redaction profile equals the recording profile')]
def root_refs(rule):
    return [ag(rule + '_root_' + f, rule, 'a root ' + f + ' copy equals refs.' + f) for f in
            ('provider_attempt_ref', 'usage_event_ref', 'usage_record_id', 'receipt_refs')]
COST = root_refs('usage_refs') + [
    ag('usage_refs_body_usage_event_ref', 'usage_refs', 'refs.usage_event_ref equals the body value'),
    ag('usage_refs_body_usage_record_id', 'usage_refs', 'refs.usage_record_id equals the body value'),
    ag('usage_refs_run_id', 'usage_refs', 'refs.run_id equals the payload run_id'),
    ag('usage_refs_attempt_id', 'usage_refs', 'refs.attempt_id equals the payload attempt_id'),
    ag('usage_refs_thread_id', 'usage_refs', 'refs.thread_id equals the payload thread_id'),
    ag('usage_refs_node_id', 'usage_refs', 'refs.node_id equals the payload node_id'),
    ag('usage_refs_raw_payload_ref', 'usage_refs', 'refs.raw_payload_ref equals the authority raw_payload_ref'),
    ag('usage_alias_reasoning', 'usage_aliases', 'reasoning_tokens equals usage.reasoning_tokens'),
    ag('usage_alias_total', 'usage_aliases', 'total_tokens equals usage.provider_total'),
    ag('usage_input', 'usage_input', 'input_non_cached equals input_total minus cache buckets when inclusive'),
    ag('usage_output', 'usage_output', 'output_visible equals output_total minus reasoning when inclusive'),
    ag('usage_total', 'usage_total', 'a derived provider_total equals input_total plus output_total'),
    ag('usage_cost', 'usage_cost', 'cost_microdollars equals the sum of integer bucket costs'),
    ag('usage_flag_provider_reported', 'usage_flags', 'is_provider_reported matches the authority source class'),
    ag('usage_flag_cli_reported', 'usage_flags', 'is_cli_reported matches the authority source class'),
    ag('usage_flag_local_context_estimate', 'usage_flags', 'is_local_context_estimate matches the authority source class'),
    ag('usage_flag_estimated', 'usage_flags', 'is_estimated matches the authority source class')]
TRACE = root_refs('trace_refs') + [
    ag('trace_refs_body_provider_attempt_ref', 'trace_refs', 'refs.provider_attempt_ref equals the body value'),
    ag('trace_refs_body_usage_event_ref', 'trace_refs', 'refs.usage_event_ref equals the body value'),
    ag('trace_refs_body_usage_record_id', 'trace_refs', 'refs.usage_record_id equals the body value'),
    ag('trace_refs_raw_payload_ref', 'trace_refs', 'refs.raw_payload_ref equals raw_payload.raw_payload_ref'),
    ag('trace_settlement_usage_event_ref', 'trace_settlement', 'settlement usage_event_ref equals the body value'),
    ag('trace_settlement_usage_record_id', 'trace_settlement', 'settlement usage_record_id equals the body value'),
    ag('trace_flag_redacted', 'trace_flags', 'flags.redacted matches a decided redaction status'),
    ag('trace_flag_usage_observed', 'trace_flags', 'flags.usage_observed is true when any usage source exists'),
    ag('trace_flag_quota_observed', 'trace_flags', 'flags.quota_observed is true when any quota source exists'),
    ag('trace_retry_none', 'trace_retry', 'relation none has no parent_trace_ref'),
    ag('trace_retry_parent', 'trace_retry', 'a retry, escalation or resume relation has a parent_trace_ref')]
module('agreement', 'CV-526/CV-537 current-writer copied source agreement, one row per copy site.', BROWSER + COST + TRACE, [
    ('browser_case', [r[0] for r in BROWSER]),
    ('cost_refs_case', [r[0] for r in COST[:11]]),
    ('cost_usage_case', [r[0] for r in COST[11:]]),
    ('trace_refs_case', [r[0] for r in TRACE[:10]]),
    ('trace_flags_case', [r[0] for r in TRACE[10:]])])


# ---------------------------------------------------------------- emit
# One module per phase (small modules keep the engine's per-evaluation
# certification cheap). PHASES: module suffix -> [(factory, rows)].
SPLIT = {
    'schema': {'schema': ['case'], 'schema_overlay': ['overlay_case']},
    'codec': {'codec_value': ['value_case'], 'codec_identity': ['identity_case'],
              'codec_profile': ['profile_case'], 'codec_storage': ['storage_case'],
              'codec_oracle': ['oracle_case'], 'codec_references': ['references_case']},
    'decode': {'decode_envelope': ['envelope_case'], 'decode_pack_ref': ['pack_ref_case'],
               'decode_pack_source': ['pack_source_case'], 'decode_pack_body': ['pack_body_case'],
               'decode_provider_source': ['provider_source_case'], 'decode_provider_digest': ['provider_digest_case'],
               'decode_joins': ['joins_case'], 'decode_identity': ['identity_case'],
               'decode_identity_restore': ['restore_identity_case']},
    'stored': {'stored': ['case']},
    'inspect': {'inspect_flags': ['flags_case'], 'inspect_payload': ['payload_case'], 'inspect_deleted': ['deleted_case']},
    'full_value': {'full_value_bytes': ['bytes_case'], 'full_value_ids_a': ['ids_a_case'], 'full_value_ids_b': ['ids_b_case']},
    'history': {'history': ['case']},
    'append': {'append_gate': ['gate_case'], 'append_replay': ['replay_case'], 'append_policy': ['policy_case'],
               'append_dedupe': ['dedupe_case']},
    'policies': {'policies': ['case']},
    'checkpoint': {'checkpoint_' + k: [k + '_case'] for k in (
        'route', 'store', 'node_a', 'node_b', 'token_a', 'token_b', 'source_event', 'source', 'manifest_type',
        'manifest_a', 'manifest_b', 'anchor', 'coverage', 'frame', 'segment_a', 'segment_b', 'dataset')},
    'observation': {'observation_' + k: [k + '_case'] for k in (
        'source', 'group', 'snapshot', 'first', 'recipe', 'lineage_a', 'lineage_b', 'advance')},
    'agreement': {'agreement_' + k: [k + '_case'] for k in (
        'browser', 'cost_refs_a', 'cost_refs_b', 'cost_usage_a', 'cost_usage_b', 'trace_refs_a', 'trace_refs_b', 'trace_flags')},
}
RESPLIT = {  # factory -> (new factories with row counts) for factories over seven rows
    ('full_value', 'ids_case'): [('ids_a_case', 5), ('ids_b_case', 5)],
    ('checkpoint', 'node_case'): [('node_a_case', 4), ('node_b_case', 6)],
    ('checkpoint', 'token_case'): [('token_a_case', 4), ('token_b_case', 4)],
    ('checkpoint', 'manifest_case'): [('manifest_a_case', 6), ('manifest_b_case', 6)],
    ('checkpoint', 'segment_case'): [('segment_a_case', 5), ('segment_b_case', 5)],
    ('observation', 'lineage_case'): [('lineage_a_case', 4), ('lineage_b_case', 4)],
    ('agreement', 'cost_refs_case'): [('cost_refs_a_case', 6), ('cost_refs_b_case', 5)],
    ('agreement', 'cost_usage_case'): [('cost_usage_a_case', 5), ('cost_usage_b_case', 5)],
    ('agreement', 'trace_refs_case'): [('trace_refs_a_case', 5), ('trace_refs_b_case', 5)],
}

HEADER = """\"\"\"DR guard table {name}: {doc}

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
\"\"\"
import pm_guard_isolation as g
"""
import re


def emit(name, doc, rows, factories):
    by = {r[0]: r for r in rows}
    used = [n for _, names in factories for n in names]
    fields = []
    for n in dict.fromkeys(used):
        body = by[n][4]
        text = body if isinstance(body, str) else '\n'.join(body)
        for f in re.findall(r"value\['(\w+)'\]", text):
            if f not in fields:
                fields.append(f)
    out = [HEADER.format(name=name, doc=doc), '\nFIELDS = ' + repr(tuple(fields)) + '\n']
    for n in dict.fromkeys(used):
        rname, field, words, code, body = by[n]
        lines = cond(body, code) if isinstance(body, str) else body
        out.append(f'\n\ndef {rname}(value, context):\n' + ''.join('    ' + l + '\n' for l in lines))
    for fname, names in factories:
        out.append(f'\n\ndef {fname}(value):\n    context = None\n    table = g.GuardTable([\n')
        for n in names:
            _, field, words, code, _ = by[n]
            out.append(f'        g.Guard({n!r}, g.Invariant({field!r}, {words!r}), {code!r}, {n}),\n')
        out.append('    ])\n\n    def check(value):\n')
        for n in names:
            out.append(f'        table.require({n!r}, value, context)\n')
        out.append('        return True\n    return g.Case(table, check, context)\n')
    return ''.join(out)


total = 0
for group, (doc, rows, factories) in MODULES.items():
    facts = dict(factories)
    for (g_, old), parts in RESPLIT.items():
        if g_ == group:
            names = facts.pop(old)
            assert sum(c for _, c in parts) == len(names), (group, old)
            i = 0
            for new, c in parts:
                facts[new] = names[i:i + c]; i += c
    covered = set()
    for module_name, fnames in SPLIT[group].items():
        fs = [(f, facts[f]) for f in fnames]
        covered |= set(fnames)
        (OUT / f'pm_runtime_artifact_table_{module_name}.py').write_text(emit(module_name, doc, rows, fs))
        total += 1
        print(module_name, [(f, len(n)) for f, n in fs])
    assert covered == set(facts), (group, set(facts) - covered)
print('modules', total)

#!/usr/bin/env python3
"""Generate the DF (FileSafe) Method B guard-table modules from one row spec.

Usage: python3 scripts/pm-filesafe-table-generate.py [--check]

Each phase becomes scripts/pm_filesafe_table_<phase>.py: one predicate per row,
reading only the observation fields the row names (FIELDS), and a fresh
GuardTable per case whose check() requires every row in table order. The DF
checkers (pm_filesafe_event_authority, pm_filesafe_event_contracts,
pm_filesafe_schema_graph, pm_filesafe_retention) derive each observation from
the complete boundary input and refuse only through these rows
(pm_filesafe_tables.refusals). --check exits 1 when a module is stale, missing
or extra; scripts/pm_filesafe_table_index.py lists the phases in spec order.
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / 'scripts'


def R(name, field, words, code, expr):
    return dict(name=name, field=field, words=words, code=code, expr=expr)


def P(phase, title, rows):
    return dict(phase=phase, title=title, rows=rows)


SPEC = [
    # ---------------------------------------------------------------- schema graph
    P('date_time_grammar', 'Selected date-time format: full-string RFC 3339 grammar (interim; CV-1101 is part 2B)', [
        R('DT01_grammar', '/match', 'the whole string matches the selected date-time grammar', 'date_time_grammar', "value['match'] is not True"),
    ]),
    P('date_time_fields', 'Selected date-time format: calendar and offset ranges (interim; CV-1101 is part 2B)', [
        R('DT02_calendar', '/calendar_valid', 'year, month, day, hour, minute and second form a real calendar instant (no leap second)', 'date_time_calendar', "value['calendar_valid'] is not True"),
        R('DT03_offset_hour', '/offset_hour', 'a numeric offset hour is at most 23', 'date_time_offset_hour', "value['offset_hour'] is not None and value['offset_hour'] > 23"),
        R('DT04_offset_minute', '/offset_minute', 'a numeric offset minute is at most 59', 'date_time_offset_minute', "value['offset_minute'] is not None and value['offset_minute'] > 59"),
    ]),
    P('schema_references', 'Eager schema reference closure over every selected resource', [
        R('SR01_resolved', '/unresolved', 'every $ref and $dynamicRef in every selected resource resolves offline', 'unresolved_schema_ref', "len(value['unresolved']) != 0"),
    ]),
    P('schema_meta', 'A selected schema document or root is a valid Draft 2020-12 schema', [
        R('SM01_meta_schema', '/meta_errors', 'the Draft 2020-12 meta-schema reports no error', 'schema_document_invalid', "value['meta_errors'] != 0"),
    ]),
    # ---------------------------------------------------------------- payload owner (semantic)
    P('payload_jcs', 'Payload owner: CV-1100 qualified RFC 8785 encoding of the inline semantic body', [
        R('PJ01_binary64', '/', 'the CV-1100 qualified RFC 8785 route preserves every integer through binary64', 'payload_unencodable', "value['binary64'] is True"),
        R('PJ02_decimal', '/', 'the emitted RFC 8785 decimal equals every original number', 'payload_unencodable', "value['decimal'] is True"),
    ]),
    P('payload_jcs_other', 'Payload owner: remaining CV-1100 qualified RFC 8785 refusals (behind the closed schema domains)', [
        R('PJ03_other', '/', 'the qualified RFC 8785 route has no other refusal (non-finite, key or string domain)', 'payload_unencodable', "value['other'] is True"),
    ]),
    P('payload_inline', 'Payload owner: SP-337 inline byte budget of the complete canonical JSON semantic body', [
        R('PI01_inline_limit', '/inline_bytes', 'the inline semantic body is at most 16,384 bytes', 'payload_inline_too_large', "value['inline_bytes'] > 16384"),
    ]),
    P('payload_scope', 'Payload owner: scope partition and subject copies', [
        R('PS01_partition', '/scope_partition', 'equals the partition derived from the scope', 'payload_scope_partition', "value['scope_partition'] != value['expected_partition']"),
        R('PS02_project_copy', '/payload_project_id', 'a payload project_id equals the scope project_id', 'payload_project_copy', "value['project_id_present'] is True and value['payload_project_id'] != value['scope_project_id']"),
        R('PS03_run_copy', '/payload_run_id', 'a payload run_id equals the execution-context run_id', 'payload_run_copy', "value['run_id_present'] is True and value['payload_run_id'] != value['ctx_run_id']"),
        R('PS04_node_id', '/node_id', 'a Project payload that names node_id gives a nonempty node_id', 'payload_orchestrator_ids', "value['scope_kind'] == 'project' and value['node_present'] is True and not value['node_id']"),
        R('PS05_attempt_id', '/attempt_id', 'a Project payload that names node_id gives a nonempty attempt_id', 'payload_orchestrator_ids', "value['scope_kind'] == 'project' and value['node_present'] is True and not value['attempt_id']"),
    ]),
    P('override_scope_kind', 'Override grant scope: kind (behind the grant schema)', [
        R('OS01_kind', '/grant_scope_kind', 'equals the payload scope kind', 'override_scope', "value['grant_scope_kind'] != value['scope_kind']"),
    ]),
    P('override_scope_root', 'Override grant scope: kind and Project', [
        R('OS02_project', '/grant_project_id', 'equals the payload scope project_id', 'override_scope', "value['grant_project_id'] != value['scope_project_id']"),
    ]),
    P('override_scope_project', 'Override grant scope: Project run and worktree', [
        R('OS03_run', '/grant_run_id', 'a named run equals the execution-context run_id', 'override_scope', "value['grant_run_id'] is not None and value['grant_run_id'] != value['ctx_run_id']"),
        R('OS04_worktree', '/grant_worktree_id', 'a named worktree equals the payload worktree_id', 'override_scope', "value['grant_worktree_id'] is not None and value['grant_worktree_id'] != value['payload_worktree_id']"),
    ]),
    P('override_scope_application', 'Override grant scope: application Server, Computer, thread, run, Host, environment and root', [
        R('OS05_server', '/grant_server_id', 'equals the scope server_id', 'override_scope', "value['grant_server_id'] != value['scope_server_id']"),
        R('OS06_computer', '/grant_computer_id', 'equals the execution-context computer_id', 'override_scope', "value['grant_computer_id'] != value['ctx_computer_id']"),
        R('OS07_thread', '/grant_thread_id', 'equals the execution-context thread_id', 'override_scope', "value['grant_thread_id'] != value['ctx_thread_id']"),
        R('OS08_run', '/grant_run_id', 'equals the execution-context run_id', 'override_scope', "value['grant_run_id'] != value['ctx_run_id']"),
        R('OS09_host', '/grant_host_id', 'equals the execution-context host_id', 'override_scope', "value['grant_host_id'] != value['ctx_host_id']"),
        R('OS10_environment', '/grant_environment_id', 'equals the execution-context environment_id', 'override_scope', "value['grant_environment_id'] != value['ctx_environment_id']"),
        R('OS11_root', '/recorded_pairs', 'records the execution-context root and generation', 'override_scope', "value['ctx_pair'] not in value['recorded_pairs']"),
    ]),
    P('override_scope_command', 'Override grant scope: command identity', [
        R('OS12_command', '/grant_command', 'a named command identity equals the payload command identity', 'override_scope', "value['grant_command'] is not None and value['command_present'] is True and value['grant_command'] != value['payload_command']"),
    ]),
    P('override_subset_root', 'Granted override scope inside the requested scope: kind and Project', [
        R('SU01_kind', '/granted_scope_kind', 'equals the requested scope kind', 'grant_subset', "value['granted_scope_kind'] != value['requested_scope_kind']"),
        R('SU02_project', '/granted_project_id', 'equals the requested project_id', 'grant_subset', "value['granted_project_id'] != value['requested_project_id']"),
    ]),
    P('override_subset_project', 'Granted override scope inside the requested scope: Project narrowing', [
        R('SU03_run', '/granted_run_id', 'equals a requested run_id', 'grant_subset', "value['requested_run_id'] is not None and value['granted_run_id'] != value['requested_run_id']"),
        R('SU04_worktree', '/granted_worktree_id', 'equals a requested worktree_id', 'grant_subset', "value['requested_worktree_id'] is not None and value['granted_worktree_id'] != value['requested_worktree_id']"),
        R('SU05_command', '/granted_command', 'equals a requested command identity', 'grant_subset', "value['requested_command'] is not None and value['granted_command'] != value['requested_command']"),
    ]),
    P('override_subset_application', 'Granted override scope inside the requested scope: application identity', [
        R('SU06_server', '/granted_server_id', 'equals the requested server_id', 'grant_subset', "value['granted_server_id'] != value['requested_server_id']"),
        R('SU07_computer', '/granted_computer_id', 'equals the requested computer_id', 'grant_subset', "value['granted_computer_id'] != value['requested_computer_id']"),
        R('SU08_thread', '/granted_thread_id', 'equals the requested thread_id', 'grant_subset', "value['granted_thread_id'] != value['requested_thread_id']"),
        R('SU09_run', '/granted_run_id', 'equals the requested run_id', 'grant_subset', "value['granted_run_id'] != value['requested_run_id']"),
        R('SU10_host', '/granted_host_id', 'equals the requested host_id', 'grant_subset', "value['granted_host_id'] != value['requested_host_id']"),
        R('SU11_environment', '/granted_environment_id', 'equals the requested environment_id', 'grant_subset', "value['granted_environment_id'] != value['requested_environment_id']"),
    ]),
    P('override_subset_scope', 'Granted override scope inside the requested scope: roots and command', [
        R('SU12_roots', '/granted_roots', 'every granted root is a requested root', 'grant_subset', "len([root for root in value['granted_roots'] if root not in value['requested_roots']]) != 0"),
        R('SU13_command', '/granted_command', 'equals a requested command identity', 'grant_subset', "value['requested_command'] is not None and value['granted_command'] != value['requested_command']"),
    ]),
    P('payload_grant_window', 'Payload owner: grant expiry follows issue', [
        R('PG01_window', '/expires_us', 'expires_at is after issued_at', 'payload_grant_window', "value['issued_present'] is True and value['expires_us'] <= value['issued_us']"),
    ]),
    P('payload_restore', 'Payload owner: restore outcome state digests', [
        R('PR01_clean_target', '/post_restore_state_sha256', 'restored_clean ends at the target state', 'payload_restore_outcome', "value['outcome'] == 'restored_clean' and value['target'] != value['after']"),
        R('PR02_unchanged', '/post_restore_state_sha256', 'restore_failed and restore_refused end at the pre-restore state', 'payload_restore_outcome', "value['outcome'] in ('restore_failed', 'restore_refused') and value['before'] != value['after']"),
        R('PR03_skipped_target', '/pre_restore_state_sha256', 'restore_skipped starts at the target state', 'payload_restore_outcome', "value['outcome'] == 'restore_skipped' and value['target'] != value['before']"),
        R('PR04_skipped_after', '/post_restore_state_sha256', 'restore_skipped ends at the pre-restore state', 'payload_restore_outcome', "value['outcome'] == 'restore_skipped' and value['before'] != value['after']"),
    ]),
    P('payload_worktree', 'Payload owner: a worktree snapshot names its path, branch and HEAD', [
        R('PW01_path', '/worktree_path', 'is nonempty', 'payload_worktree_fields', "not value['worktree_path']"),
        R('PW02_branch', '/branch_name', 'is nonempty', 'payload_worktree_fields', "not value['branch_name']"),
        R('PW03_head', '/HEAD_sha', 'is nonempty', 'payload_worktree_fields', "not value['HEAD_sha']"),
    ]),
    # ---------------------------------------------------------------- payload contract CLI
    P('contract_payload_schema', 'Payload contract CLI: closed payload schema', [
        R('CS01_payload_schema', '/errors', 'the closed payload schema with the selected format checker reports no structural error', 'payload_schema', "value['errors'] != 0"),
        R('CS02a_slot_type', '/', 'every integer slot holds an exact integer (CV-1100 current admission)', 'payload_schema', "value['slot_type'] != 0"),
    ]),
    P('contract_identity_vector', 'Payload contract CLI: recorded identity vectors', [
        R('CI01_vector', '/computed', 'the recomputed (idempotency_key, event_id) equals the recorded vector', 'identity_vector', "value['computed'] != value['expected']"),
    ]),
    P('contract_identity_selfcheck', 'Payload contract CLI: identity recipe self-checks (a pure function; no input refuses them)', [
        R('CI02_retry_stable', '/retry', 'a deep-copied retry recomputes the same identity', 'unstable_retry', "value['first'] != value['retry']"),
        R('CI03_family_distinct', '/other_family_event_id', 'another family name gives another event_id', 'family_collision', "value['other_family_event_id'] == value['event_id']"),
        R('CI04_operation_distinct', '/other_operation', 'another operation_id gives another identity', 'operation_collision', "value['other_operation'] == value['first']"),
    ]),
    # ---------------------------------------------------------------- retention (Card 2 and G28)
    P('retention_binding_runyear', 'Safe-point graph retention binding (DL-401 G28 Run year)', [
        R('RB01_runyear_policy', '/retention_policy_ref', 'is RP-RUNTIME-365D', 'g28_scope_binding', "value['policy_ref'] != 'RP-RUNTIME-365D'"),
        R('RB02_runyear_decision', '/retention_decision_ref', 'is DL-401', 'g28_scope_binding', "value['decision_ref'] != 'DL-401'"),
    ]),
    P('retention_binding_card2', 'Card 2 graph retention binding by scope', [
        R('RB03_card2_by_scope', '/retention_policy_by_scope', 'equals the Project policy and the pending application decision', 'card2_scope_binding', "value['policy_by_scope'] != value['expected_by_scope']"),
        R('RB04_card2_decision', '/retention_decision_ref', 'equals the landed Card 2 decision', 'card2_scope_binding', "value['decision_ref'] != value['expected_decision']"),
        R('RB05_card2_pending_root', '/retention_policy_ref', 'stays PENDING_RETENTION_DECISION', 'card2_scope_binding', "value['policy_ref'] != 'PENDING_RETENTION_DECISION'"),
    ]),
    P('retention_assignment', 'Graph retention policy assignment', [
        R('RA01_assignment', '/policy', 'equals the family assignment', 'retention_changed', "value['policy'] != value['expected']"),
    ]),
    P('retention_policy_lookup', 'Storage registry policy lookup', [
        R('RP01_single_policy', '/match_count', 'exactly one registry policy has the bound id', 'card2_policy_missing_or_ambiguous', "value['match_count'] != 1"),
    ]),
    P('retention_policy_value', 'Storage registry policy object', [
        R('RP02_policy_unchanged', '/policy', 'equals the adopted exact policy object', 'card2_existing_policy_changed', "value['policy'] != value['expected']"),
    ]),
    P('retention_fixture_binding', 'Retention fixture binding', [
        R('RF01_fixture_policy', '/project_policy_ref', 'equals the bound policy', 'card2_fixture_binding', "value['project_policy_ref'] != value['policy_id']"),
        R('RF02_fixture_decision', '/decision_ref', 'equals the bound decision', 'card2_fixture_binding', "value['decision_ref'] != value['decision']"),
    ]),
    P('retention_scope', 'Card 2 retention oracle: application scope stays pending', [
        R('RS01_project_scope', '/scope_kind', 'is project', 'pending_retention_decision', "value['scope_kind'] == 'application'"),
    ]),
    P('retention_delete', 'Card 2 retention oracle: explicit Delete Puppet Master project data', [
        R('RD01_authorized', '/project_delete_authorized', 'is exactly true', 'retain', "value['project_delete_authorized'] is not True"),
        R('RD02_unprotected', '/protection_refs', 'is empty', 'retain', "len(value['protection_refs']) != 0"),
    ]),
    P('retention_capacity', 'Card 2 retention oracle: capacity before append', [
        R('RC01_storage', '/storage_full', 'is false', 'capacity_full', "value['storage_full'] is not False"),
        R('RC02_count', '/project_record_count', 'is below a bounded max_cardinality while storage has room', 'capacity_full', "value['storage_full'] is False and value['max_cardinality'] is not None and value['project_record_count'] >= value['max_cardinality']"),
    ]),
    P('retention_overflow', 'Card 2 retention oracle: overflow compaction', [
        R('RO01_not_permanent', '/retain_indefinitely', 'is false', 'refuse_new', "value['retain_indefinitely'] is not False"),
        R('RO02_expired_available', '/expired_unprotected_available', 'is exactly true for an expiring policy', 'refuse_new', "value['retain_indefinitely'] is False and value['expired_unprotected_available'] is not True"),
    ]),
    P('retention_compact_hold', 'Card 2 retention oracle: compaction eligibility', [
        R('RX01_not_permanent', '/retain_indefinitely', 'is false', 'retain', "value['retain_indefinitely'] is not False"),
        R('RX02_unprotected', '/protection_refs', 'is empty for an expiring policy', 'retain', "value['retain_indefinitely'] is False and len(value['protection_refs']) != 0"),
    ]),
    P('retention_compact_age', 'Card 2 retention oracle: expiry from the original durable save', [
        R('RX03_expired', '/now_us', 'is at or after the original save plus ttl_seconds', 'retain', "value['now_us'] < value['expiry_us']"),
    ]),
    P('runyear_run', 'G28 Run year oracle: a real run', [
        R('RY01_real_run', '/run_id', 'is nonempty', 'missing_real_run', "not value['run_id']"),
    ]),
    P('runyear_capacity', 'G28 Run year oracle: per-run and per-Project limits', [
        R('RY02_run_count', '/run_record_count', 'is below the per-run limit', 'linked_successor', "value['run_record_count'] >= value['max_cardinality']"),
        R('RY03_project_count', '/project_record_count', 'is below the per-Project limit for Project entries', 'linked_successor', "value['scope_kind'] == 'project' and value['project_record_count'] >= value['project_limit']"),
    ]),
    P('runyear_compact_hold', 'G28 Run year oracle: compaction eligibility', [
        R('RY04_unprotected', '/protection_refs', 'is empty', 'retain', "len(value['protection_refs']) != 0"),
        R('RY05_completed', '/run_completed_at_utc', 'the run has completed', 'retain', "value['run_completed_present'] is not True"),
    ]),
    P('runyear_compact_age', 'G28 Run year oracle: one year after run completion', [
        R('RY06_expired', '/now_us', 'is at or after run completion plus ttl_seconds', 'retain', "value['now_us'] < value['expiry_us']"),
    ]),
    # ---------------------------------------------------------------- authority: graph and fixture integrity
    P('graph_identity', 'Source graph: family and graph hash', [
        R('GR01_family', '/event_type', 'equals the checked family', 'graph_family', "value['event_type'] != value['family']"),
        R('GR02_hash', '/graph_sha256', 'equals the CV-366 source_graph hash of the graph without graph_sha256', 'graph_hash', "value['graph_sha256'] != value['computed_sha256']"),
    ]),
    P('graph_stages', 'Source graph: ordered stages', [
        R('GR03_stage_order', '/ordered_stages/role', 'lists the ten stage roles in order', 'stage_order', "value['roles'] != ['original_intent', 'body_commit', 'prepared_event', 'append', 'first_receipt', 'terminal_publication', 'history_read', 'backup_restore', 'withdrawal', 'retention_release']"),
        R('GR04_ordinal_type', '/ordered_stages/ordinal', 'every ordinal is an exact integer', 'stage_ordinals', "len([name for name in value['ordinal_types'] if name != 'int']) != 0"),
        R('GR05_ordinal_value', '/ordered_stages/ordinal', 'ordinals are 0..9 in order', 'stage_ordinals', "value['ordinals'] != [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"),
    ]),
    P('graph_method_count', 'Source graph: one Project and one application method', [
        R('GR06_method_count', '/methods', 'has exactly two methods', 'method_count', "value['method_count'] != 2"),
    ]),
    P('graph_method', 'Source graph: method binding', [
        R('GR07_interface', '/methods/interface_id', 'equals the scope-specific original-source interface', 'method_binding', "value['interface_id'] != value['expected_interface']"),
        R('GR08_component', '/methods/component', 'equals the graph producer', 'method_binding', "value['component'] != value['producer']"),
        R('GR09_adoption', '/methods/adoption_disposition', 'is specified_unimplemented', 'native_adoption_overclaim', "value['adoption'] != 'specified_unimplemented'"),
    ]),
    P('graph_resource_hash', 'Source graph: selected and preserved resource bytes', [
        R('GH01_resource_hash', '/resources/sha256', 'equals the SHA-256 of the resource file', 'resource_hash', "value['computed_sha256'] != value['recorded_sha256']"),
    ]),
    P('graph_resource_uri', 'Source graph: selected resource identity', [
        R('GD01_resource_uri', '/resources/uri', 'equals the document $id (or the row URI when none)', 'resource_uri', "value['document_id'] != value['uri']"),
    ]),
    P('graph_admission', 'Source graph: native admission stays unavailable', [
        R('GA01_admission', '/native_admission', 'is unavailable_until_complete_owner_adoption', 'admission_overclaim', "value['native_admission'] != 'unavailable_until_complete_owner_adoption'"),
    ]),
    P('membership', 'Registry membership stays absent before admission', [
        R('MM01_unregistered', '/registered_matches', 'no registry family has this event_type', 'membership_changed', "value['registered_matches'] != 0"),
    ]),
    P('fixture_census', 'Authority fixture family census', [
        R('FC01_census', '/families', 'lists the nine DF families in order', 'fixture_family_census', "value['families'] != ['filesafe.command_denied', 'filesafe.destructive_override_denied', 'filesafe.destructive_override_granted', 'filesafe.destructive_override_requested', 'filesafe.guard_init_failed', 'filesafe.path_denied', 'filesafe.policy_degraded', 'safe_point.created', 'safe_point.restored']"),
    ]),
    # ---------------------------------------------------------------- authority: selected original source
    P('selected_source_present', 'Selected original source: the bank holds the referenced source', [
        R('SS01_present', '/source_ref', 'names an independently selected source', 'selected_source_missing', "value['present'] is not True"),
    ]),
    P('selected_source_schema', 'Selected original source: retained source schema', [
        R('SS02_schema', '/errors', 'the retained source schema reports no error', 'selected_source_schema', "value['errors'] != 0"),
    ]),
    P('selected_source_commitment', 'Selected original source: retained commitment recipe', [
        R('SS03_commitment', '/accepted_source_sha256', 'equals the recomputed original commitment', 'selected_source_commitment', "value['computed'] != value['recorded']"),
    ]),
    P('selected_source_join', 'Selected original source: exact complete-value join', [
        R('SS04_join', '/source', 'the caller source equals the selected source exactly (type-sensitive)', 'selected_source_join', "value['exact_equal'] is not True"),
    ]),
    # ---------------------------------------------------------------- authority: SP-337 payload resolution
    P('payload_inline_size', 'SP-337: inline EventRecord payload byte budget', [
        R('EP01_inline_size', '/payload', 'the inline semantic body is at most 16,384 bytes', 'inline_payload_too_large', "value['inline_bytes'] > 16384"),
    ]),
    P('payload_ref_parse', 'SP-337: payload_ref parses as JSON', [
        R('EP02_parse', '/payload_ref', 'is a JSON text', 'payload_reference_unavailable', "value['parse_error'] is not None"),
    ]),
    P('payload_ref_descriptor', 'SP-337: closed payload descriptor', [
        R('EP04_schema', '/payload_ref', 'the payload_reference schema reports no structural error', 'payload_reference_schema', "value['errors'] != 0"),
        R('EP03a_slot_type', '/payload_ref/byte_size', 'every integer slot holds an exact integer (CV-1100 current admission)', 'payload_reference_schema', "value['slot_type'] != 0"),
    ]),
    P('descriptor_jcs', 'SP-337: CV-1100 qualified RFC 8785 encoding of the descriptor', [
        R('DJ01_binary64', '/', 'the CV-1100 qualified RFC 8785 route preserves every integer through binary64', 'payload_reference_shape', "value['binary64'] is True"),
        R('DJ02_decimal', '/', 'the emitted RFC 8785 decimal equals every original number', 'payload_reference_shape', "value['decimal'] is True"),
    ]),
    P('descriptor_jcs_other', 'SP-337: remaining CV-1100 qualified RFC 8785 descriptor refusals (behind the closed descriptor schema)', [
        R('DJ03_other', '/', 'the qualified RFC 8785 route has no other refusal (non-finite, key or string domain)', 'payload_reference_shape', "value['other'] is True"),
    ]),
    P('payload_ref_shape', 'SP-337: canonical descriptor text and empty inline body', [
        R('EP05_canonical', '/payload_ref', 'is the canonical JSON text of the descriptor', 'payload_reference_shape', "value['canonical_text'] != value['ref']"),
        R('EP06_inline_empty', '/payload', 'is the empty object', 'payload_reference_shape', "value['inline'] != {}"),
    ]),
    P('payload_ref_store', 'SP-337: selected pack bytes', [
        R('EP07_present', '/payload_id', 'the synthetic pack store holds the payload_id', 'payload_reference_unavailable', "value['stored'] is not True"),
        R('EP08_hex', '/payload_id', 'stored bytes decode from hex', 'payload_reference_unavailable', "value['stored'] is True and value['hex_valid'] is not True"),
    ]),
    P('payload_ref_custody', 'SP-337: byte size, BLAKE3 address and durability', [
        R('EP09_size', '/byte_size', 'equals the stored byte length', 'payload_reference_custody', "value['raw_length'] != value['byte_size']"),
        R('EP10_address', '/payload_id', 'equals blake3: plus the BLAKE3 of the stored bytes', 'payload_reference_custody', "value['computed_id'] != value['payload_id']"),
        R('EP11_durable', '/payload_id', 'is durable before acknowledgement', 'payload_reference_custody', "value['payload_id'] not in value['durable_ids']"),
    ]),
    P('payload_ref_decode', 'SP-337: canonical RFC 8785 body decode', [
        R('EP12_decode', '/payload_ref', 'the stored bytes decode as canonical RFC 8785 JSON with unique keys', 'payload_reference_unavailable', "value['decode_error'] is not None"),
    ]),
    # ---------------------------------------------------------------- authority: materialization
    P('mat_schema', 'Materialization: closed source/EventRecord/custody schema', [
        R('MS01_schema', '/', 'the materialization schema reports no structural error', 'materialization_schema', "value['errors'] != 0"),
    ]),
    P('mat_integer_slots', 'Materialization: CV-1100 current integer admission at every schema integer slot', [
        R('MN01a_slot_type', '/', 'every integer slot holds an exact integer (CV-1100 current admission)', 'numeric_representation', "value['slot_type'] != 0"),
    ]),
    P('mat_numbers', 'Materialization: selected writer epoch type', [
        R('MN02_bank_epoch', '/writer_epoch', 'the selected writer epoch is an exact integer', 'numeric_representation', "value['bank_epoch_type'] != 'int'"),
    ]),
    P('mat_replay', 'Materialization: current writer replay policy', [
        R('MR01_replay_only', '/event/replay_policy', 'is not projector_replay_only', 'replay_only_not_appendable', "value['replay_policy'] == 'projector_replay_only'"),
    ]),
    P('mat_payload_schema', 'Materialization: resolved payload against the closed Result schema', [
        R('MP01_payload_schema', '/payload', 'the Result schema reports no structural error', 'payload_schema', "value['errors'] != 0"),
        R('MP02a_slot_type', '/payload', 'every integer slot holds an exact integer (CV-1100 current admission)', 'payload_schema', "value['slot_type'] != 0"),
    ]),
    P('mat_source_owner', 'Materialization: original owner, epoch, commitment and result', [
        R('MO01_storage', '/source/storage_instance_id', 'equals the selected Storage instance', 'original_owner_epoch', "value['source_storage'] != value['bank_storage']"),
        R('MO02_epoch', '/source/writer_epoch', 'equals the selected writer epoch', 'original_owner_epoch', "value['source_epoch'] != value['bank_epoch']"),
        R('MO04_result', '/source/original_result', 'equals the resolved payload', 'original_result_join', "value['result_equal'] is not True"),
    ]),
    P('mat_source_commitment', 'Materialization: caller source commitment (behind the selected-source join)', [
        R('MO03_commitment', '/source/accepted_source_sha256', 'equals the recomputed source commitment', 'source_commitment', "value['computed_commitment'] != value['recorded_commitment']"),
    ]),
    P('mat_selectors', 'Materialization: family and payload schema selector', [
        R('MF01_family', '/event/event_type', 'equals the checked family', 'family_join', "value['event_type'] != value['family']"),
        R('MF02_selector', '/event/payload_schema_id', 'equals the family payload schema $id', 'payload_selector', "value['payload_schema_id'] != value['expected_schema_id']"),
    ]),
    P('mat_request_context', 'Materialization: original request context', [
        R('MC01_scope', '/source/original_request/scope', 'equals the payload scope', 'request_context_join', "value['request_scope'] != value['payload_scope']"),
        R('MC02_context', '/source/original_request/execution_context', 'equals the payload execution context', 'request_context_join', "value['request_context'] != value['payload_context']"),
        R('MC03_operation', '/source/original_request/operation_id', 'equals the payload operation_id', 'request_context_join', "value['request_operation'] != value['payload_operation']"),
    ]),
    P('mat_request_subject', 'Materialization: graph-declared request subject joins', [
        R('MQ01_subject', '/source/original_request', 'the request value equals the payload value', 'request_subject_join', "value['request_value'] != value['payload_value']"),
    ]),
    P('mat_envelope_kind', 'Materialization: EventRecord scope kind', [
        R('ME01_scope_kind', '/event/scope_kind', 'equals the request scope kind', 'envelope_scope', "value['event_scope_kind'] != value['scope_kind']"),
    ]),
    P('mat_envelope_subject', 'Materialization: EventRecord subject copies', [
        R('ME02_project', '/event/project_id', 'equals the request scope project_id', 'envelope_scope', "value['event_project_id'] != value['scope_project_id']"),
        R('ME03_thread', '/event/thread_id', 'equals the execution-context thread_id', 'envelope_thread_id', "value['event_thread_id'] != value['ctx_thread_id']"),
        R('ME04_run', '/event/run_id', 'equals the execution-context run_id', 'envelope_run_id', "value['event_run_id'] != value['ctx_run_id']"),
        R('ME05_node', '/event/node_id', 'equals the payload node_id', 'envelope_node_id', "value['event_node_id'] != value['payload_node_id']"),
        R('ME06_attempt', '/event/attempt_id', 'equals the payload attempt_id', 'envelope_attempt_id', "value['event_attempt_id'] != value['payload_attempt_id']"),
        R('ME07_actor', '/event/actor_ref', 'equals the request actor_ref', 'envelope_actor', "value['event_actor'] != value['request_actor']"),
    ]),
    P('mat_envelope_meta', 'Materialization: EventRecord time, operation, read policy and identity', [
        R('ME08_timestamp', '/event/occurred_at_utc', 'equals the original result ts', 'envelope_original_timestamp', "value['occurred_at_utc'] != value['payload_ts']"),
        R('ME09_operation', '/event/correlation_id', 'equals the request operation_id', 'envelope_operation', "value['correlation_id'] != value['request_operation']"),
        R('ME10_redaction', '/event/redaction_profile', 'is no_secrets', 'envelope_read_policy', "value['redaction_profile'] != 'no_secrets'"),
        R('ME11_replay_policy', '/event/replay_policy', 'is dedupe_by_idempotency_key', 'envelope_read_policy', "value['replay_policy'] != 'dedupe_by_idempotency_key'"),
        R('ME12_idempotency_key', '/event/idempotency_key', 'equals the recomputed idempotency key', 'envelope_identity', "value['idempotency_key'] != value['computed_key']"),
        R('ME13_event_id', '/event/event_id', 'equals the recomputed event_id', 'envelope_identity', "value['event_id'] != value['computed_event_id']"),
    ]),
    P('mat_body_roles', 'Materialization: original body role set', [
        R('MB01_roles', '/source/body_members', 'the body roles equal the required roles for the scope', 'body_role_set', "value['roles'] != value['required']"),
    ]),
    P('mat_body_member', 'Materialization: original body bytes', [
        R('MB02_present', '/source/body_members/ref', 'the bank holds the body as a string', 'original_body_missing_or_changed', "value['raw_type'] != 'str'"),
        R('MB03_hash', '/source/body_members/sha256', 'equals the SHA-256 of the body bytes', 'original_body_missing_or_changed', "value['raw_type'] == 'str' and value['computed_sha256'] != value['recorded_sha256']"),
    ]),
    P('mat_effect_run', 'Materialization: effect-capable run (behind the closed schema run requirement)', [
        R('MX02_run', '/execution_context/run_id', 'is nonempty', 'effect_context_required', "not value['run_id']"),
    ]),
    P('mat_effect_context', 'Materialization: effect-capable execution context', [
        R('MX01_thread', '/execution_context/thread_id', 'is nonempty', 'effect_context_required', "not value['thread_id']"),
        R('MX03_root', '/execution_context/root_id', 'is nonempty', 'effect_context_required', "not value['root_id']"),
        R('MX04_generation', '/execution_context/root_generation', 'is nonempty', 'effect_context_required', "not value['root_generation']"),
        R('MX05_directory', '/execution_context/working_directory', 'is nonempty', 'effect_context_required', "not value['working_directory']"),
    ]),
    P('mat_application_ids', 'Materialization: application safe points carry no orchestrator ids', [
        R('MA01_node', '/payload/node_id', 'is null', 'application_orchestrator_ids', "value['node_id'] is not None"),
        R('MA02_attempt', '/payload/attempt_id', 'is null', 'application_orchestrator_ids', "value['attempt_id'] is not None"),
    ]),
    P('mat_grant_order', 'Materialization: granted override issued before expiry', [
        R('MG01_issued_before_expiry', '/payload/expires_at', 'issued_at is before expires_at', 'grant_expiry', "value['issued_us'] >= value['expires_us']"),
    ]),
    P('mat_grant_window', 'Materialization: granted override window', [
        R('MG02_requested_maximum', '/payload/expires_at', 'expires_at is at most the requested maximum', 'grant_expiry', "value['expires_us'] > value['maximum_us']"),
        R('MG03_live_at_issue', '/payload/ts', 'ts is at or before expires_at', 'grant_expired_at_issue', "value['ts_us'] > value['expires_us']"),
    ]),
    P('mat_project_body_present', 'Materialization: native Project original body present', [
        R('MJ02_body_present', '/source/body_members', 'the bank holds the original Project body as a string', 'original_project_body_value', "value['raw_type'] != 'str'"),
    ]),
    P('mat_project_original', 'Materialization: native Project original record', [
        R('MJ01_project', '/source/native_project_record/project_id', 'equals the scope project_id', 'original_project_scope', "value['original_project_id'] != value['scope_project_id']"),
        R('MJ03_body_bytes', '/source/native_project_record', 'the body bytes equal the canonical MessagePack of the record', 'original_project_body_value', "value['raw_type'] == 'str' and value['body_equal'] is not True"),
    ]),
    P('mat_project_subject', 'Materialization: graph-declared native Project subject joins', [
        R('MJ04_subject', '/source/native_project_record', 'the original value equals the expected value', 'original_project_subject', "value['original_value'] != value['expected_value']"),
    ]),
    P('mat_capture_origin', 'Materialization: safe_point.created native capture origin', [
        R('MK01_created_at', '/source/native_project_record/created_at_utc', 'equals the payload ts', 'original_capture_actor_time', "value['created_at'] != value['payload_ts']"),
        R('MK02_actor', '/source/native_project_record/created_by_actor_ref', 'equals the request actor_ref', 'original_capture_actor_time', "value['created_by'] != value['request_actor']"),
    ]),
    P('mat_manifest_identity', 'Materialization: safe_point.created independent manifest identity', [
        R('MK07_manifest_identity', '/source/source_ref', 'the independent bank manifest equals the payload manifest fields', 'manifest_identity', "value['bank_manifest'] != value['payload_manifest']"),
    ]),
    P('mat_capture_worktree', 'Materialization: safe_point.created worktree fields are all or none', [
        R('MK03_worktree_id', '/payload/worktree_id', 'is nonempty when any worktree field is present', 'partial_worktree', "value['any_present'] is True and not value['worktree_id']"),
        R('MK04_worktree_path', '/payload/worktree_path', 'is nonempty when any worktree field is present', 'partial_worktree', "value['any_present'] is True and not value['worktree_path']"),
        R('MK05_branch', '/payload/branch_name', 'is nonempty when any worktree field is present', 'partial_worktree', "value['any_present'] is True and not value['branch_name']"),
        R('MK06_head', '/payload/HEAD_sha', 'is nonempty when any worktree field is present', 'partial_worktree', "value['any_present'] is True and not value['HEAD_sha']"),
    ]),
    P('mat_policy_degraded', 'Materialization: policy_degraded keeps authoritative enforcement', [
        R('MD01_enforcement', '/payload/authoritative_enforcement_intact', 'is exactly true', 'enforcement_not_intact', "value['intact'] is not True"),
    ]),
    P('mat_receipt_ids', 'Materialization: first-receipt custody identity joins', [
        R('MT01_storage', '/custody/storage_instance_id', 'equals the source Storage instance', 'receipt_storage', "value['custody_storage'] != value['source_storage']"),
        R('MT02_event_id', '/custody/event_id', 'equals the EventRecord event_id', 'receipt_event_id', "value['custody_event_id'] != value['event_id']"),
        R('MT03_event_type', '/custody/event_type', 'equals the EventRecord event_type', 'receipt_event_type', "value['custody_event_type'] != value['event_type']"),
        R('MT04_idempotency_key', '/custody/idempotency_key', 'equals the EventRecord idempotency_key', 'receipt_idempotency_key', "value['custody_key'] != value['idempotency_key']"),
        R('MT05_partition', '/custody/scope_partition', 'equals the request scope partition', 'receipt_partition', "value['custody_partition'] != value['scope_partition']"),
    ]),
    P('producer_jcs', 'CV-317 producer projection: CV-1100 qualified RFC 8785 encoding', [
        R('QJ01_binary64', '/', 'the CV-1100 qualified RFC 8785 route preserves every integer through binary64', 'producer_digest_unavailable', "value['binary64'] is True"),
        R('QJ02_decimal', '/', 'the emitted RFC 8785 decimal equals every original number', 'producer_digest_unavailable', "value['decimal'] is True"),
        R('QJ03_other', '/', 'the qualified RFC 8785 route has no other refusal (non-finite, key or string domain)', 'producer_digest_unavailable', "value['other'] is True"),
    ]),
    P('full_value_bytes', 'CV-339 full value: SP-1100 EVENT_VALUE physical bytes', [
        R('FV01_integer_range', '/', 'every integer is inside the SP-1100 physical range', 'full_value_unavailable', "value['reason'] == 'physical_integer_range'"),
    ]),
    P('full_value_bytes_other', 'CV-339 full value: remaining SP-1100 EVENT_VALUE refusals (behind the schema-admitted value domains)', [
        R('FV02_other', '/', 'the EVENT_VALUE profile and CV-339 edition have no other refusal', 'full_value_unavailable', "value['reason'] is not None and value['reason'] != 'physical_integer_range'"),
    ]),
    P('mat_semantic_digest', 'Materialization: first-receipt producer semantic digest', [
        R('MT06_semantic_digest', '/custody/producer_semantic_digest', 'equals the recomputed CV-317 producer semantic digest', 'receipt_semantic_digest', "value['custody_digest'] != value['computed_digest']"),
    ]),
    P('mat_full_value', 'Materialization: first-receipt full-value commitment', [
        R('MT07_full_value', '/custody/original_event_value_commitment/sha256', 'equals the recomputed CV-339 full-value commitment', 'receipt_full_value', "value['custody_commitment'] != value['computed_commitment']"),
    ]),
    P('mat_receipt_state', 'Materialization: first-receipt durability state (behind the receipt schema const)', [
        R('MT11_durability_state', '/custody/first_append_receipt/durability_state', 'is synced', 'receipt_durability', "value['durability_state'] != 'synced'"),
    ]),
    P('mat_receipt_values', 'Materialization: first-receipt digests, receipt and issued custody', [
        R('MT08_receipt_event', '/custody/first_append_receipt/event_id', 'equals the EventRecord event_id', 'receipt_sequence', "value['receipt_event_id'] != value['event_id']"),
        R('MT09_receipt_sequence', '/custody/first_append_receipt/sequence_id', 'equals the EventRecord sequence_id', 'receipt_sequence', "value['receipt_sequence_id'] != value['sequence_id']"),
        R('MT10_durability_class', '/custody/first_append_receipt/durability_class', 'is barrier', 'receipt_durability', "value['durability_class'] != 'barrier'"),
        R('MT12_issued', '/event/event_id', 'the bank issued map holds exactly this event and custody', 'original_issued_custody', "value['issued_equal'] is not True"),
    ]),
    # ---------------------------------------------------------------- authority: application safe-point originals
    P('app_body_role', 'Application original: body member for each declared root', [
        R('AB01_role', '/source/body_members', 'has a member for the declared root', 'application_body_role', "value['member_present'] is not True"),
    ]),
    P('app_body_decode', 'Application original: body bytes decode with the selected codec', [
        R('AB02_decode', '/source/body_members', 'decodes canonically with the selected codec', 'application_body_decode', "value['decode_error'] is not None"),
    ]),
    P('app_body_schema', 'Application original: decoded body against its declared root (behind the materialization schema)', [
        R('AB03_schema', '/source/body_members', 'the declared root schema reports no error', 'application_body_schema', "value['errors'] != 0"),
    ]),
    P('app_body_check', 'Application original: decoded body schema and value', [
        R('AB04_value', '/source/body_members', 'equals the source record (or the request without addressing fields)', 'application_body_value', "value['value_equal'] is not True"),
    ]),
    P('app_inventory', 'Application original: snapshot blob inventory', [
        R('AI01_unique', '/source/application_records/snapshot_blobs/blobs', 'blob payload ids are unique', 'application_blob_inventory_unique', "len(value['payload_ids']) != value['distinct_count']"),
    ]),
    P('app_record_context', 'Application original: record scope and context', [
        R('AR01_scope', '/source/application_records/scope', 'equals the request scope', 'application_record_context', "value['record_scope'] != value['request_scope']"),
        R('AR02_context', '/source/application_records/execution_context', 'equals the request execution context', 'application_record_context', "value['record_context'] != value['request_context']"),
    ]),
    P('app_manifest', 'Application original: manifest order, counts and SCM', [
        R('AM01_path_order', '/entries/identity/canonical_absolute_path', 'paths are unique and sorted by UTF-8 bytes', 'application_manifest_path_order', "value['paths'] != value['sorted_unique_paths']"),
        R('AM02_entry_count', '/entry_count', 'equals the number of entries', 'application_manifest_entry_count', "value['entry_count'] != value['entries_length']"),
        R('AM03_total_bytes', '/total_bytes', 'equals the sum of present entry lengths', 'application_manifest_total_bytes', "value['total_bytes'] != value['present_length_sum']"),
        R('AM04_scm_worktree', '/scm/worktree_path', 'equals the request working directory', 'application_manifest_scm', "value['scm_present'] is True and value['scm_worktree_path'] != value['working_directory']"),
        R('AM05_scm_index', '/scm/index_state_sha256', 'equals the RFC 8785 SHA-256 of the index entries', 'application_manifest_scm', "value['scm_present'] is True and value['index_state_sha256'] != value['computed_index_sha256']"),
    ]),
    P('app_entry_context', 'Application original: manifest entry root context', [
        R('AE01_root_id', '/entries/identity/root_id', 'equals the execution-context root_id', 'application_entry_context', "value['root_id'] != value['ctx_root_id']"),
        R('AE02_generation', '/entries/identity/root_generation', 'equals the execution-context root_generation', 'application_entry_context', "value['root_generation'] != value['ctx_root_generation']"),
        R('AE03_host', '/entries/identity/host_id', 'equals the execution-context host_id', 'application_entry_context', "value['host_id'] != value['ctx_host_id']"),
        R('AE04_environment', '/entries/identity/environment_id', 'equals the execution-context environment_id', 'application_entry_context', "value['environment_id'] != value['ctx_environment_id']"),
    ]),
    P('app_entry_path', 'Application original: manifest entry lexical root boundary', [
        R('AE05_under_root', '/entries/identity/canonical_absolute_path', 'starts with the (present) working directory and a slash', 'application_entry_root', "value['root'] is None or not value['path'].startswith(value['root'] + '/')"),
        R('AE06_no_parent', '/entries/identity/canonical_absolute_path', 'has no .. segment', 'application_entry_root', "'..' in value['path'].split('/')"),
        R('AE07_no_git', '/entries/identity/canonical_absolute_path', 'does not enter /.git/', 'application_entry_root', "'/.git/' in value['path']"),
        R('AE08_ignored_scope', '/entries/ignored', 'an ignored entry is in the authorized write set', 'application_ignored_scope', "value['ignored'] and not value['authorized_write_set']"),
    ]),
    P('app_entry_blob_match', 'Application original: one inventory blob per present file entry', [
        R('AF01_one_blob', '/entries/payload_id', 'exactly one inventory blob has the entry payload_id', 'application_manifest_blob_inventory', "value['match_count'] != 1"),
    ]),
    P('app_entry_blob_bytes', 'Application original: blob bytes decode from hex', [
        R('AF02_bytes', '/snapshot_blobs/blobs/ref', 'the bank body decodes from hex', 'application_blob_value', "value['body_valid'] is not True"),
    ]),
    P('app_entry_blob_value', 'Application original: blob length and SHA-256', [
        R('AF03_body_length', '/snapshot_blobs/blobs/length', 'equals the body byte length', 'application_blob_value', "value['body_length'] != value['blob_length']"),
        R('AF04_entry_length', '/entries/length', 'equals the blob length', 'application_blob_value', "value['blob_length'] != value['entry_length']"),
        R('AF05_body_sha256', '/snapshot_blobs/blobs/sha256', 'equals the SHA-256 of the body', 'application_blob_value', "value['body_sha256'] != value['blob_sha256']"),
        R('AF06_entry_sha256', '/entries/blob_sha256', 'equals the blob SHA-256', 'application_blob_value', "value['blob_sha256'] != value['entry_sha256']"),
    ]),
    P('app_entry_blob_join', 'Application original: the matched blob carries the entry payload_id (selected by it)', [
        R('AF08_entry_address', '/entries/payload_id', 'equals the blob payload_id', 'application_blob_address', "value['blob_payload_id'] != value['entry_payload_id']"),
    ]),
    P('app_entry_blob_address', 'Application original: blob BLAKE3 address', [
        R('AF07_body_address', '/snapshot_blobs/blobs/payload_id', 'equals blake3: plus the BLAKE3 of the body', 'application_blob_address', "value['body_address'] != value['blob_payload_id']"),
    ]),
    P('app_entry_blob_store', 'Application original: pack store selection of the blob bytes', [
        R('AF09_store_selection', '/snapshot_blobs/blobs/payload_id', 'the pack store holds the same bytes under the payload_id', 'application_payload_store_selection', "value['store_raw'] != value['raw']"),
    ]),
    P('app_entry_symlink', 'Application original: symlink and non-file entries', [
        R('AS01_symlink_target', '/entries/symlink_target_hex', 'a present symlink names its target', 'application_symlink_value', "value['present_symlink'] is True and value['symlink_target_present'] is not True"),
        R('AS02_symlink_payload', '/entries/payload_id', 'a present symlink has no payload_id', 'application_symlink_value', "value['present_symlink'] is True and value['payload_id_present'] is not False"),
        R('AS03_nonfile_payload', '/entries/payload_id', 'an absent or non-file, non-symlink entry has no payload_id', 'application_nonfile_payload', "value['present_symlink'] is not True and value['payload_id_present'] is not False"),
    ]),
    P('app_blob_inventory_complete', 'Application original: the inventory holds exactly the referenced blobs', [
        R('AC01_complete', '/snapshot_blobs/blobs', 'the referenced payload ids equal the inventory payload ids', 'application_complete_blob_inventory', "value['referenced'] != value['inventory']"),
    ]),
    P('app_safe_point_ids', 'Application original: safe-point record orchestrator ids (behind the record schema null type)', [
        R('SP03_node_id', '/safe_point_record/node_id', 'is null', 'application_safe_point_subject', "value['record_node_id'] is not None"),
        R('SP04_attempt_id', '/safe_point_record/attempt_id', 'is null', 'application_safe_point_subject', "value['record_attempt_id'] is not None"),
    ]),
    P('app_safe_point_subject', 'Application original: safe-point record subject', [
        R('SP01_safe_point_id', '/safe_point_record/safe_point_id', 'equals the result safe_point_id', 'application_safe_point_subject', "value['record_safe_point_id'] != value['result_safe_point_id']"),
        R('SP02_run_id', '/safe_point_record/run_id', 'equals the result run_id', 'application_safe_point_subject', "value['record_run_id'] != value['result_run_id']"),
        R('SP05_worktree_path', '/safe_point_record/worktree_path', 'equals the request working directory', 'application_safe_point_subject', "value['record_worktree_path'] != value['working_directory']"),
    ]),
    P('app_safe_point_manifest_a', 'Application original: safe-point record manifest reference and digests', [
        R('SM02_manifest_ref', '/safe_point_record/snapshot_manifest_ref', 'equals the snapshot manifest member ref', 'application_safe_point_manifest', "value['manifest_ref'] != value['member_ref']"),
        R('SM03_manifest_sha256', '/safe_point_record/snapshot_manifest_sha256', 'equals the RFC 8785 SHA-256 of the manifest', 'application_safe_point_manifest', "value['manifest_sha256'] != value['computed_manifest_sha256']"),
        R('SM04_content_state', '/safe_point_record/content_state_sha256', 'equals the RFC 8785 SHA-256 of the manifest', 'application_safe_point_manifest', "value['content_state_sha256'] != value['computed_manifest_sha256']"),
        R('SM05_entry_count', '/safe_point_record/entry_count', 'equals the manifest entry_count', 'application_safe_point_manifest', "value['record_entry_count'] != value['manifest_entry_count']"),
    ]),
    P('app_safe_point_manifest_b', 'Application original: safe-point record manifest copies', [
        R('SM06_total_bytes', '/safe_point_record/total_bytes', 'equals the manifest total_bytes', 'application_safe_point_manifest', "value['record_total_bytes'] != value['manifest_total_bytes']"),
        R('SM07_format_version', '/safe_point_record/snapshot_format_version', 'equals the manifest snapshot_format_version', 'application_safe_point_manifest', "value['record_format_version'] != value['manifest_format_version']"),
        R('SM08_scope_version', '/safe_point_record/content_scope_version', 'equals the manifest content_scope_version', 'application_safe_point_manifest', "value['record_scope_version'] != value['manifest_scope_version']"),
        R('SM09_scm', '/safe_point_record/scm', 'equals the manifest scm', 'application_safe_point_manifest', "value['record_scm'] != value['manifest_scm']"),
    ]),
    P('app_capture_result_a', 'Application original: safe_point.created record equals the result (references and version)', [
        R('CR01_baseline_ref', '/safe_point_record/baseline_ref', 'equals the result baseline_ref', 'application_capture_result', "value['record_baseline_ref'] != value['result_baseline_ref']"),
        R('CR02_replan_generation', '/safe_point_record/replan_generation', 'equals the result replan_generation', 'application_capture_result', "value['record_replan_generation'] != value['result_replan_generation']"),
        R('CR03_format_version', '/safe_point_record/snapshot_format_version', 'equals the result snapshot_format_version', 'application_capture_result', "value['record_snapshot_format_version'] != value['result_snapshot_format_version']"),
        R('CR04_scope_version', '/safe_point_record/content_scope_version', 'equals the result content_scope_version', 'application_capture_result', "value['record_content_scope_version'] != value['result_content_scope_version']"),
    ]),
    P('app_capture_result_b', 'Application original: safe_point.created record equals the result (manifest and status)', [
        R('CR05_manifest_ref', '/safe_point_record/snapshot_manifest_ref', 'equals the result snapshot_manifest_ref', 'application_capture_result', "value['record_snapshot_manifest_ref'] != value['result_snapshot_manifest_ref']"),
        R('CR06_manifest_sha256', '/safe_point_record/snapshot_manifest_sha256', 'equals the result snapshot_manifest_sha256', 'application_capture_result', "value['record_snapshot_manifest_sha256'] != value['result_snapshot_manifest_sha256']"),
        R('CR07_content_state', '/safe_point_record/content_state_sha256', 'equals the result content_state_sha256', 'application_capture_result', "value['record_content_state_sha256'] != value['result_content_state_sha256']"),
        R('CR08_capture_status', '/safe_point_record/capture_status', 'equals the result capture_status', 'application_capture_result', "value['record_capture_status'] != value['result_capture_status']"),
    ]),
    P('app_capture_origin', 'Application original: safe_point.created capture origin', [
        R('CO01_operation', '/safe_point_record/capture_operation_id', 'equals the request operation_id', 'application_capture_origin', "value['capture_operation_id'] != value['request_operation_id']"),
        R('CO02_created_at', '/safe_point_record/created_at_utc', 'equals the result ts', 'application_capture_origin', "value['created_at_utc'] != value['result_ts']"),
        R('CO03_actor', '/safe_point_record/created_by_actor_ref', 'equals the request actor_ref', 'application_capture_origin', "value['created_by_actor_ref'] != value['request_actor_ref']"),
    ]),
    P('app_capture_scm_absent', 'Application original: a manifest without SCM gives no worktree result fields', [
        R('CS03_no_worktree_path', '/payload/worktree_path', 'is absent', 'application_capture_scm', "value['worktree_path_present'] is not False"),
        R('CS04_no_branch', '/payload/branch_name', 'is absent', 'application_capture_scm', "value['branch_name_present'] is not False"),
        R('CS05_no_head', '/payload/HEAD_sha', 'is absent', 'application_capture_scm', "value['HEAD_sha_present'] is not False"),
    ]),
    P('app_capture_scm_absent_id', 'Application original: a manifest without SCM gives no worktree id (behind the payload worktree rows)', [
        R('CS02_no_worktree_id', '/payload/worktree_id', 'is absent', 'application_capture_scm', "value['worktree_id_present'] is not False"),
    ]),
    P('app_capture_scm_present', 'Application original: a manifest with SCM gives equal worktree result fields', [
        R('CS06_worktree_id', '/scm/worktree_id', 'equals the result worktree_id', 'application_capture_scm', "value['scm_worktree_id'] != value['result_worktree_id']"),
        R('CS07_worktree_path', '/scm/worktree_path', 'equals the result worktree_path', 'application_capture_scm', "value['scm_worktree_path'] != value['result_worktree_path']"),
        R('CS08_branch', '/scm/branch_name', 'equals the result branch_name', 'application_capture_scm', "value['scm_branch_name'] != value['result_branch_name']"),
        R('CS09_head', '/scm/HEAD_sha', 'equals the result HEAD_sha', 'application_capture_scm', "value['scm_HEAD_sha'] != value['result_HEAD_sha']"),
    ]),
    P('app_result_event', 'Application original: restore transaction result-event pointer', [
        R('RE01_result_event', '/restore_transaction/result_event_ref', 'is null or this original event_id', 'application_result_event_join', "value['result_event_ref'] is not None and value['result_event_ref'] != value['event_id']"),
    ]),
    P('app_transaction_ids', 'Application original: restore transaction orchestrator ids (behind the transaction schema null type)', [
        R('TR04_node_id', '/restore_transaction/node_id', 'equals the result node_id', 'application_transaction_result', "value['tx_node_id'] != value['result_node_id']"),
        R('TR05_attempt_id', '/restore_transaction/attempt_id', 'equals the result attempt_id', 'application_transaction_result', "value['tx_attempt_id'] != value['result_attempt_id']"),
    ]),
    P('app_transaction_result_a', 'Application original: restore transaction equals the result (subject)', [
        R('TR01_safe_point_id', '/restore_transaction/safe_point_id', 'equals the result safe_point_id', 'application_transaction_result', "value['tx_safe_point_id'] != value['result_safe_point_id']"),
        R('TR02_transaction_id', '/restore_transaction/restore_transaction_id', 'equals the result restore_transaction_id', 'application_transaction_result', "value['tx_restore_transaction_id'] != value['result_restore_transaction_id']"),
        R('TR03_run_id', '/restore_transaction/run_id', 'equals the result run_id', 'application_transaction_result', "value['tx_run_id'] != value['result_run_id']"),
        R('TR06_outcome', '/restore_transaction/restore_outcome', 'equals the result restore_outcome', 'application_transaction_result', "value['tx_restore_outcome'] != value['result_restore_outcome']"),
    ]),
    P('app_transaction_result_b', 'Application original: restore transaction equals the result (states and recovery)', [
        R('TR07_target_state', '/restore_transaction/target_state_sha256', 'equals the result target_state_sha256', 'application_transaction_result', "value['tx_target_state_sha256'] != value['result_target_state_sha256']"),
        R('TR08_pre_state', '/restore_transaction/pre_restore_state_sha256', 'equals the result pre_restore_state_sha256', 'application_transaction_result', "value['tx_pre_restore_state_sha256'] != value['result_pre_restore_state_sha256']"),
        R('TR09_post_state', '/restore_transaction/post_restore_state_sha256', 'equals the result post_restore_state_sha256', 'application_transaction_result', "value['tx_post_restore_state_sha256'] != value['result_post_restore_state_sha256']"),
        R('TR10_conflict', '/restore_transaction/conflict_reason_code', 'equals the result conflict_reason_code', 'application_transaction_result', "value['tx_conflict_reason_code'] != value['result_conflict_reason_code']"),
        R('TR11_recovered', '/restore_transaction/recovered_after_restart', 'equals the result recovered_after_restart', 'application_transaction_result', "value['tx_recovered_after_restart'] != value['result_recovered_after_restart']"),
    ]),
    P('app_safe_point_key', 'Application original: canonical application safe-point key', [
        R('SK01_key', '/restore_transaction/canonical_safe_point_key', 'equals application@1:<hex server_id>:<hex safe_point_id>', 'application_safe_point_key', "value['key'] != value['expected_key']"),
    ]),
    P('app_transaction_manifest', 'Application original: restore transaction manifest references and states', [
        R('TM01_target_ref', '/restore_transaction/target_manifest_ref', 'equals the snapshot manifest member ref', 'application_transaction_manifest', "value['target_manifest_ref'] != value['target_member_ref']"),
        R('TM02_pre_ref', '/restore_transaction/pre_restore_manifest_ref', 'equals the pre-restore manifest member ref', 'application_transaction_manifest', "value['pre_manifest_ref'] != value['pre_member_ref']"),
        R('TM03_target_sha256', '/restore_transaction/target_manifest_sha256', 'equals the target_state_sha256', 'application_transaction_manifest', "value['target_manifest_sha256'] != value['target_state_sha256']"),
        R('TM04_target_state', '/restore_transaction/target_state_sha256', 'equals the RFC 8785 SHA-256 of the target manifest', 'application_transaction_manifest', "value['target_state_sha256'] != value['computed_target_sha256']"),
        R('TM05_pre_sha256', '/restore_transaction/pre_restore_manifest_sha256', 'equals the pre_restore_state_sha256', 'application_transaction_manifest', "value['pre_manifest_sha256'] != value['pre_state_sha256']"),
        R('TM06_pre_state', '/restore_transaction/pre_restore_state_sha256', 'equals the RFC 8785 SHA-256 of the pre-restore manifest', 'application_transaction_manifest', "value['pre_state_sha256'] != value['computed_pre_sha256']"),
        R('TM07_post_state', '/restore_transaction/post_restore_state_sha256', 'equals the RFC 8785 SHA-256 of the post-restore manifest (null when none)', 'application_transaction_manifest', "value['post_state_sha256'] != value['computed_post_sha256']"),
    ]),
    P('app_equality_subject', 'Application original: equality result subject', [
        R('EQ01_transaction', '/equality_result/restore_transaction_id', 'equals the transaction restore_transaction_id', 'application_equality_subject', "value['eq_transaction_id'] != value['tx_transaction_id']"),
        R('EQ02_safe_point', '/equality_result/safe_point_id', 'equals the transaction safe_point_id', 'application_equality_subject', "value['eq_safe_point_id'] != value['tx_safe_point_id']"),
        R('EQ03_target', '/equality_result/target_manifest_sha256', 'equals the RFC 8785 SHA-256 of the target manifest', 'application_equality_subject', "value['eq_target_sha256'] != value['computed_target_sha256']"),
        R('EQ04_pre', '/equality_result/pre_restore_manifest_sha256', 'equals the RFC 8785 SHA-256 of the pre-restore manifest', 'application_equality_subject', "value['eq_pre_sha256'] != value['computed_pre_sha256']"),
        R('EQ05_post', '/equality_result/post_restore_manifest_sha256', 'equals the RFC 8785 SHA-256 of the post-restore manifest (null when none)', 'application_equality_subject', "value['eq_post_sha256'] != value['computed_post_sha256']"),
    ]),
    P('app_equality_scm', 'Application original: equality result SCM flags', [
        R('EQ06_scm_target', '/equality_result/scm_equal_target', 'is true exactly when a post manifest exists with the target scm', 'application_equality_scm', "value['scm_equal_target'] != (value['post_present'] and value['post_scm'] == value['target_scm'])"),
        R('EQ07_scm_pre', '/equality_result/scm_equal_pre_restore', 'is true exactly when a post manifest exists with the pre-restore scm', 'application_equality_scm', "value['scm_equal_pre_restore'] != (value['post_present'] and value['post_scm'] == value['pre_scm'])"),
    ]),
    P('app_hold_join', 'Application original: holds, fence and mutation count', [
        R('HJ01_safe_point_holds', '/safe_point_record/hold_refs', 'every safe-point hold is a transaction hold', 'application_hold_join', "len([ref for ref in value['sp_hold_refs'] if ref not in value['tx_hold_refs']]) != 0"),
        R('HJ02_equality_holds', '/equality_result/hold_refs', 'equals the transaction hold_refs', 'application_hold_join', "value['eq_hold_refs'] != value['tx_hold_refs']"),
        R('HJ03_fence', '/equality_result/fence_active', 'equals the transaction fence_active', 'application_hold_join', "value['eq_fence_active'] != value['tx_fence_active']"),
        R('HJ04_mutation_count', '/equality_result/path_mutation_count', 'equals the transaction path_mutation_count', 'application_hold_join', "value['eq_path_mutation_count'] != value['tx_path_mutation_count']"),
    ]),
    P('app_operation_order', 'Application original: restore operations order', [
        R('OO01_unique_ids', '/restore_transaction/operations/operation_id', 'operation ids are unique', 'application_operation_order', "len(value['operation_ids']) != value['distinct_operation_ids']"),
        R('OO02_unique_paths', '/restore_transaction/operations/identity/canonical_absolute_path', 'operation paths are unique', 'application_operation_order', "len(value['paths']) != value['distinct_paths']"),
        R('OO03_sorted_paths', '/restore_transaction/operations/identity/canonical_absolute_path', 'operation paths are sorted by UTF-8 bytes', 'application_operation_order', "value['paths'] != value['sorted_paths']"),
    ]),
    P('app_operation_coverage', 'Application original: every changed path has an operation', [
        R('OC01_coverage', '/restore_transaction/operations', 'every path whose pre-restore and target entries differ has an operation', 'application_operation_coverage', "len([path for path in value['changed_paths'] if path not in value['operation_paths']]) != 0"),
    ]),
    P('app_operation_present', 'Application original: an operation names a pre-restore or target entry', [
        R('OP01_subject_present', '/restore_transaction/operations/identity', 'a present pre-restore or target entry exists for the path', 'application_operation_subject', "value['subject_present'] is not True"),
    ]),
    P('app_operation_subject', 'Application original: operation subject equals its entries', [
        R('OP02_identity', '/restore_transaction/operations/identity', 'equals the target (else pre-restore) entry identity', 'application_operation_subject', "value['identity'] != value['subject_identity']"),
        R('OP03_before_sha256', '/restore_transaction/operations/expected_before_sha256', 'equals the pre-restore blob SHA-256 (null when absent)', 'application_operation_subject', "value['expected_before_sha256'] != value['before_sha256']"),
        R('OP04_target_sha256', '/restore_transaction/operations/target_sha256', 'equals the target blob SHA-256 (null when absent)', 'application_operation_subject', "value['target_sha256'] != value['target_blob_sha256']"),
        R('OP05_before_type', '/restore_transaction/operations/expected_before_type', 'equals the pre-restore kind (null when absent)', 'application_operation_subject', "value['expected_before_type'] != value['before_kind']"),
        R('OP06_target_type', '/restore_transaction/operations/target_type', 'equals the target kind (null when absent)', 'application_operation_subject', "value['target_type'] != value['target_kind']"),
    ]),
    P('app_operation_presence', 'Application original: operation kind against entry presence (behind the operation schema and subject rows)', [
        R('OK02_before_presence', '/restore_transaction/operations/operation_kind', 'create has no pre-restore entry; replace, delete and metadata have one', 'application_operation_kind', "(value['kind'] == 'create') == value['before_present']"),
        R('OK03_target_presence', '/restore_transaction/operations/operation_kind', 'delete has no target entry; create, replace and metadata have one', 'application_operation_kind', "(value['kind'] == 'delete') == value['target_present']"),
    ]),
    P('app_operation_kind', 'Application original: operation kind agrees with its entries', [
        R('OK04_metadata_content', '/restore_transaction/operations/operation_kind', 'metadata keeps kind, payload, digest, length, symlink target and gitlink', 'application_operation_kind', "value['kind'] == 'metadata' and value['before_present'] is True and value['target_present'] is True and value['before_content'] != value['target_content']"),
    ]),
    P('app_operation_staging', 'Application original: operation staging and tombstones', [
        R('ST01_stage', '/restore_transaction/operations/stage_ref', 'create and replace name a stage', 'application_operation_staging', "value['kind'] in ('create', 'replace') and not value['stage_ref']"),
        R('ST02_create_tombstone', '/restore_transaction/operations/tombstone_ref', 'create has no tombstone', 'application_operation_staging', "value['kind'] == 'create' and value['tombstone_ref'] is not None"),
        R('ST03_delete_stage', '/restore_transaction/operations/stage_ref', 'delete has no stage', 'application_operation_staging', "value['kind'] == 'delete' and value['stage_ref'] is not None"),
        R('ST04_delete_tombstone', '/restore_transaction/operations/tombstone_ref', 'delete names a tombstone', 'application_operation_staging', "value['kind'] == 'delete' and not value['tombstone_ref']"),
    ]),
    P('app_journal_lease', 'Application original: journal mutation lease (behind the transaction schema minLength)', [
        R('JC03_lease', '/restore_transaction/mutation_lease_ref', 'is nonempty', 'application_journal_cursor_lease', "not value['mutation_lease_ref']"),
    ]),
    P('app_journal', 'Application original: journal cursor, lease and restart', [
        R('JC01_cursor', '/restore_transaction/operation_cursor', 'is at most the operation count', 'application_journal_cursor_lease', "value['operation_cursor'] > value['operation_count']"),
        R('JC02_mutations', '/restore_transaction/path_mutation_count', 'is at most the operation count', 'application_journal_cursor_lease', "value['path_mutation_count'] > value['operation_count']"),
        R('JC04_updated_at', '/restore_transaction/updated_at_utc', 'equals the result ts', 'application_journal_cursor_lease', "value['updated_at_utc'] != value['result_ts']"),
        R('JC05_restart', '/restore_transaction/restart_count', 'is positive exactly when the result says recovered_after_restart', 'application_journal_cursor_lease', "(value['restart_count'] > 0) != value['recovered_after_restart']"),
    ]),
    P('app_outcome_clean_state', 'Application original: restored_clean end state (behind the payload restore rows)', [
        R('OQ02_post_is_target', '/restore_transaction/post_restore_state_sha256', 'the post manifest digest equals the target manifest digest', 'application_outcome_equality', "value['post_sha256'] != value['target_sha256']"),
        R('OQ03_scm_target', '/equality_result/scm_equal_target', 'is true', 'application_outcome_equality', "not value['scm_equal_target']"),
    ]),
    P('app_outcome_clean', 'Application original: restored_clean equality', [
        R('OQ01_committed', '/restore_transaction/phase', 'is committed', 'application_outcome_equality', "value['phase'] != 'committed'"),
        R('OQ04_cursor_complete', '/restore_transaction/operation_cursor', 'equals the operation count', 'application_outcome_equality', "value['operation_cursor'] != value['operation_count']"),
    ]),
    P('app_outcome_failed_state', 'Application original: restore_failed end state (behind the payload restore rows)', [
        R('OQ06_post_is_pre', '/restore_transaction/post_restore_state_sha256', 'the post manifest digest equals the pre-restore manifest digest', 'application_outcome_equality', "value['post_sha256'] != value['pre_sha256']"),
        R('OQ07_scm_pre', '/equality_result/scm_equal_pre_restore', 'is true', 'application_outcome_equality', "not value['scm_equal_pre_restore']"),
    ]),
    P('app_outcome_failed', 'Application original: restore_failed equality', [
        R('OQ05_rolled_back', '/restore_transaction/phase', 'is rolled_back', 'application_outcome_equality', "value['phase'] != 'rolled_back'"),
    ]),
    P('app_outcome_skipped_state', 'Application original: restore_skipped states (behind the payload restore rows)', [
        R('OQ09_target_is_pre', '/restore_transaction/target_state_sha256', 'the target manifest digest equals the pre-restore manifest digest', 'application_outcome_equality', "value['target_sha256'] != value['pre_sha256']"),
        R('OQ10_pre_is_post', '/restore_transaction/post_restore_state_sha256', 'the pre-restore manifest digest equals the post manifest digest', 'application_outcome_equality', "value['pre_sha256'] != value['post_sha256']"),
    ]),
    P('app_outcome_skipped', 'Application original: restore_skipped equality', [
        R('OQ08_committed', '/restore_transaction/phase', 'is committed', 'application_outcome_equality', "value['phase'] != 'committed'"),
        R('OQ11_no_mutation', '/restore_transaction/path_mutation_count', 'is zero', 'application_outcome_equality', "value['path_mutation_count'] != 0"),
    ]),
    P('app_outcome_refused_state', 'Application original: restore_refused end state (behind the payload restore rows)', [
        R('OQ13_post_is_pre', '/restore_transaction/post_restore_state_sha256', 'the post manifest digest equals the pre-restore manifest digest', 'application_outcome_equality', "value['post_sha256'] != value['pre_sha256']"),
    ]),
    P('app_outcome_refused', 'Application original: restore_refused equality', [
        R('OQ12_rolled_back', '/restore_transaction/phase', 'is rolled_back', 'application_outcome_equality', "value['phase'] != 'rolled_back'"),
        R('OQ14_no_mutation', '/restore_transaction/path_mutation_count', 'is zero', 'application_outcome_equality', "value['path_mutation_count'] != 0"),
    ]),
    P('app_outcome_recovery_holds', 'Application original: restore_recovery_required holds (behind the transaction schema minItems)', [
        R('OQ17_holds', '/restore_transaction/hold_refs', 'is nonempty', 'application_outcome_equality', "not value['hold_refs']"),
    ]),
    P('app_outcome_recovery', 'Application original: restore_recovery_required equality', [
        R('OQ15_recovery_phase', '/restore_transaction/phase', 'is recovery_required', 'application_outcome_equality', "value['phase'] != 'recovery_required'"),
        R('OQ16_fence', '/restore_transaction/fence_active', 'is true', 'application_outcome_equality', "not value['fence_active']"),
        R('OQ18_post_not_target', '/restore_transaction/post_restore_state_sha256', 'differs from the target manifest digest', 'application_outcome_equality', "value['post_sha256'] == value['target_sha256']"),
        R('OQ19_post_not_pre', '/restore_transaction/post_restore_state_sha256', 'differs from the pre-restore manifest digest', 'application_outcome_equality', "value['post_sha256'] == value['pre_sha256']"),
    ]),
    P('app_outcome_fence', 'Application original: the fence is active only for recovery_required', [
        R('OF01_fence', '/restore_transaction/fence_active', 'is true exactly for restore_recovery_required', 'application_outcome_fence', "value['fence_active'] != (value['outcome'] == 'restore_recovery_required')"),
    ]),
    P('app_outcome_operations', 'Application original: restored_clean and restore_failed operation states', [
        R('OU01_states', '/restore_transaction/operations/state', 'every operation has the outcome state', 'application_outcome_operations', "len([state for state in value['states'] if state != value['expected_state']]) != 0"),
        R('OU02_cursor', '/restore_transaction/operation_cursor', 'equals the operation count', 'application_outcome_operations', "value['operation_cursor'] != value['operation_count']"),
    ]),
    P('app_no_mutation', 'Application original: restore_skipped and restore_refused leave operations pending', [
        R('NM01_cursor', '/restore_transaction/operation_cursor', 'is zero', 'application_no_mutation_operations', "value['operation_cursor'] != 0"),
        R('NM02_pending', '/restore_transaction/operations/state', 'every operation is pending', 'application_no_mutation_operations', "len([state for state in value['states'] if state != 'pending']) != 0"),
    ]),
    # ---------------------------------------------------------------- authority: retained issued custody
    P('issued_shape', 'Retained issued custody: complete event and custody pair', [
        R('IS01_object', '/', 'is an object', 'issued_custody_missing', "value['value_type'] != 'dict'"),
        R('IS02_members', '/', 'has exactly event and custody', 'issued_custody_missing', "value['value_type'] == 'dict' and value['keys'] != ['custody', 'event']"),
    ]),
    P('issued_original', 'Retained issued custody: unchanged original', [
        R('IS03_unchanged', '/', 'equals the retained original event and custody', 'issued_original_changed', "value['equal'] is not True"),
    ]),
    P('issued_schema', 'Retained issued custody: imported EventRecord and custody roots', [
        R('IS04a_slot_type', '/', 'every integer slot holds an exact integer (CV-1100 current admission)', 'issued_numeric_representation', "value['slot_type'] != 0"),
        R('IS05_schema', '/', 'the imported root reports no structural error', 'issued_schema', "value['errors'] != 0"),
    ]),
    P('issued_payload_schema', 'Retained issued custody: resolved payload against the closed Result schema', [
        R('IS06_payload_schema', '/event/payload', 'the Result schema reports no structural error', 'issued_payload', "value['errors'] != 0"),
        R('IS07a_slot_type', '/event/payload', 'every integer slot holds an exact integer (CV-1100 current admission)', 'issued_payload', "value['slot_type'] != 0"),
    ]),
    P('issued_receipt_ids', 'Retained issued custody: custody identity joins', [
        R('IR01_event_id', '/custody/event_id', 'equals the issued event_id', 'issued_full_value_receipt', "value['custody_event_id'] != value['event_id']"),
        R('IR02_event_type', '/custody/event_type', 'equals the checked family', 'issued_full_value_receipt', "value['custody_event_type'] != value['family']"),
        R('IR03_idempotency_key', '/custody/idempotency_key', 'equals the issued idempotency_key', 'issued_full_value_receipt', "value['custody_key'] != value['idempotency_key']"),
    ]),
    P('issued_semantic_digest', 'Retained issued custody: producer semantic digest', [
        R('IR04_semantic_digest', '/custody/producer_semantic_digest', 'equals the recomputed CV-317 producer semantic digest', 'issued_full_value_receipt', "value['custody_digest'] != value['computed_digest']"),
    ]),
    P('issued_full_value', 'Retained issued custody: full-value commitment', [
        R('IR05_full_value', '/custody/original_event_value_commitment/sha256', 'equals the recomputed CV-339 full-value commitment', 'issued_full_value_receipt', "value['custody_commitment'] != value['computed_commitment']"),
    ]),
    P('issued_receipt_state', 'Retained issued custody: first-receipt durability state (behind the receipt schema const)', [
        R('IR08_durability_state', '/custody/first_append_receipt/durability_state', 'is synced', 'issued_full_value_receipt', "value['durability_state'] != 'synced'"),
    ]),
    P('issued_receipt_values', 'Retained issued custody: digests and first receipt', [
        R('IR06_receipt_event', '/custody/first_append_receipt/event_id', 'equals the issued event_id', 'issued_full_value_receipt', "value['receipt_event_id'] != value['event_id']"),
        R('IR07_receipt_sequence', '/custody/first_append_receipt/sequence_id', 'equals the issued sequence_id', 'issued_full_value_receipt', "value['receipt_sequence_id'] != value['sequence_id']"),
        R('IR09_durability_class', '/custody/first_append_receipt/durability_class', 'is barrier', 'issued_full_value_receipt', "value['durability_class'] != 'barrier'"),
    ]),
    P('retained_dispatch', 'SP-1101 retained original: one authenticated recipe selection (shared RetainedDispatcher)', [
        R('DD01_binding', '/', 'the authenticated original binding equals the retained expectation', 'retained_original_unavailable', "value['reason'] in ('original_binding', 'original_scope')"),
        R('DD02_recipe', '/', 'the recorded write-time recipe tuple selects an installed frozen verifier', 'retained_original_unavailable', "value['reason'] in ('recipe_unknown', 'recipe_selection', 'recipe_tuple', 'recipe_resource_hash')"),
        R('DD03_authority', '/', 'the original owner holds authenticated custody for the original', 'retained_original_unavailable', "value['reason'] in ('original_missing', 'original_authority', 'original_bytes_type')"),
    ]),
    P('retained_dispatch_other', 'SP-1101 retained original: remaining dispatcher refusals', [
        R('DD04_other', '/', 'the dispatcher has no other refusal', 'retained_original_unavailable', "value['reason'] is not None and value['reason'] not in ('original_binding', 'original_scope', 'recipe_unknown', 'recipe_selection', 'recipe_tuple', 'recipe_resource_hash', 'original_missing', 'original_authority', 'original_bytes_type')"),
    ]),
    P('app_codec_pin', 'Application original: body codecs selected by the authenticated write-time edition (SP-1101)', [
        R('CP01_custody', '/source/source_ref', 'Storage custody records the original source edition', 'application_body_codec_unpinned', "value['entry_present'] is not True"),
        R('CP02_manifest', '/source/source_ref', 'the recorded frozen-resource manifest selects an installed codec map', 'application_body_codec_unpinned', "value['entry_present'] is True and value['recorded_manifest'] != value['installed_manifest']"),
    ]),
    P('manifest_jcs', 'Application original: CV-1100 qualified RFC 8785 encoding of manifests', [
        R('AJ01_binary64', '/', 'the CV-1100 qualified RFC 8785 route preserves every integer through binary64', 'application_manifest_unencodable', "value['binary64'] is True"),
        R('AJ02_decimal', '/', 'the emitted RFC 8785 decimal equals every original number', 'application_manifest_unencodable', "value['decimal'] is True"),
        R('AJ03_other', '/', 'the qualified RFC 8785 route has no other refusal (non-finite, key or string domain)', 'application_manifest_unencodable', "value['other'] is True"),
    ]),
    P('current_raw_json', 'CV-1100 current raw JSON grammar of a current candidate', [
        R('CR01_integer_token', '/', 'every integer token is 0 or -?[1-9][0-9]* (no -0, no plus)', 'current_raw_number', "value['reason'] == 'integer_token'"),
        R('CR02_json_syntax', '/', 'the text is JSON (no leading zero, no bare word)', 'current_raw_number', "value['reason'] == 'json_syntax'"),
        R('CR03_other', '/', 'no non-finite number, duplicate key or lone surrogate', 'current_raw_number', "value['reason'] is not None and value['reason'] not in ('integer_token', 'json_syntax')"),
    ]),
    # ---------------------------------------------------------------- authority: protocol oracle
    P('proto_replay', 'Protocol: current writer actions refuse projector_replay_only', [
        R('PX01_replay_only', '/event/replay_policy', 'is not projector_replay_only', 'replay_only_not_appendable', "value['replay_policy'] == 'projector_replay_only'"),
    ]),
    P('proto_crashed', 'Protocol: actions after a crash need recovery', [
        R('PX02_not_crashed', '/crashed', 'is false', 'recovery_required', "value['crashed'] is not False"),
    ]),
    P('proto_commit_fence', 'Protocol owner_commit: writer fence', [
        R('PC01_writer', '/writer_fenced', 'is false', 'writer_fenced', "value['writer_fenced'] is not False"),
    ]),
    P('proto_commit_source', 'Protocol owner_commit: complete materialization', [
        R('PC02_source', '/materialization_failures', 'the complete materialization reports no failure', 'source_unavailable', "value['failure_count'] != 0"),
    ]),
    P('proto_commit_phase', 'Protocol owner_commit: first commit only', [
        R('PC03_phase', '/phase', 'is empty', 'already_committed', "value['phase'] != 'empty'"),
    ]),
    P('proto_prepare_gate', 'Protocol prepare: committed body and no refused recovery', [
        R('PP01_phase', '/phase', 'is owner_committed', 'body_commit_required', "value['phase'] != 'owner_committed'"),
        R('PP02_recovery', '/recovery_refused', 'is false once the body is committed', 'recovery_fenced', "value['phase'] == 'owner_committed' and value['recovery_refused'] is not False"),
    ]),
    P('proto_prepare_payload', 'Protocol prepare: durable original payload resolves', [
        R('PP03_payload', '/payload_errors', 'the durable original payload resolves', 'payload_unavailable', "value['payload_error_count'] != 0"),
    ]),
    P('proto_append_gate', 'Protocol append: prepared event and no refused recovery', [
        R('PA01_phase', '/phase', 'is prepared', 'prepared_event_required', "value['phase'] != 'prepared'"),
        R('PA02_recovery', '/recovery_refused', 'is false once the event is prepared', 'recovery_fenced', "value['phase'] == 'prepared' and value['recovery_refused'] is not False"),
    ]),
    P('proto_append_payload', 'Protocol append: prepared payload resolves', [
        R('PA03_payload', '/payload_errors', 'the prepared payload resolves', 'payload_unavailable', "value['payload_error_count'] != 0"),
    ]),
    P('proto_receipt_phase', 'Protocol receipt: appended event', [
        R('PR01_phase', '/phase', 'is appended', 'append_required', "value['phase'] != 'appended'"),
    ]),
    P('proto_receipt_recovery', 'Protocol receipt: no refused recovery', [
        R('PR02_recovery', '/recovery_refused', 'is false', 'receipt_unavailable', "value['recovery_refused'] is not False"),
    ]),
    P('proto_receipt_source', 'Protocol receipt: complete materialization', [
        R('PR03_source', '/materialization_failures', 'the complete materialization reports no failure', 'receipt_unavailable', "value['failure_count'] != 0"),
    ]),
    P('proto_receipt_issued', 'Protocol receipt: retained issued custody resolves', [
        R('PR04_issued', '/issued', 'the retained issued custody resolves', 'receipt_unavailable', "value['issued_resolved'] is not True"),
    ]),
    P('proto_terminal_gate', 'Protocol terminal: no refused recovery and a first receipt', [
        R('PT01_recovery', '/recovery_refused', 'is false', 'recovery_fenced', "value['recovery_refused'] is not False"),
        R('PT02_receipt', '/receipt', 'a first receipt is held when recovery is not refused', 'first_receipt_required', "value['recovery_refused'] is False and value['receipt_present'] is not True"),
    ]),
    P('proto_terminal_issued', 'Protocol terminal: retained issued custody resolves', [
        R('PT03_issued', '/issued', 'the retained issued custody resolves', 'recovery_fenced', "value['issued_resolved'] is not True"),
    ]),
    P('proto_recover_issued', 'Protocol recover after receipt: retained issued custody resolves', [
        R('RV01_issued', '/issued', 'the retained issued custody resolves', 'recovery_fenced', "value['issued_resolved'] is not True"),
    ]),
    P('proto_recover_source', 'Protocol recover before receipt: durable original materializes', [
        R('RV02_source', '/materialization_failures', 'the durable original materialization reports no failure', 'recovery_fenced', "value['failure_count'] != 0"),
    ]),
    P('proto_retry_gate', 'Protocol retry: no refused recovery and an appended original', [
        R('RT01_recovery', '/recovery_refused', 'is false', 'dedupe_unavailable', "value['recovery_refused'] is not False"),
        R('RT02_appended', '/durable/phase', 'is appended, receipted or terminal when recovery is not refused', 'original_pending', "value['recovery_refused'] is False and value['durable_phase'] not in ('appended', 'receipted', 'terminal')"),
    ]),
    P('proto_retry_semantic', 'Protocol retry: same producer semantic digest', [
        R('RT03_semantic', '/event', 'the retry producer semantic digest equals the original', 'semantic_conflict', "value['retry_digest'] != value['original_digest']"),
    ]),
    P('proto_retry_result', 'Protocol retry: retained original and first receipt', [
        R('RT04_issued', '/issued', 'the retained issued custody resolves', 'dedupe_unavailable', "value['issued_resolved'] is not True"),
        R('RT05_receipt', '/receipt', 'the original first receipt is held once the original resolves', 'resolve_original_first_receipt', "value['issued_resolved'] is True and value['receipt_present'] is not True"),
    ]),
    P('proto_withdraw_reader', 'Protocol withdraw_reader: writer cut off and nothing pending', [
        R('WR01_writer', '/writer_fenced', 'is true', 'writer_cutoff_required', "value['writer_fenced'] is not True"),
        R('WR02_pending', '/durable/pending', 'is false', 'pending_reconciliation_required', "value['writer_fenced'] is True and value['pending'] is not False"),
    ]),
    P('proto_rebuild_gate', 'Protocol rebuild: reader fenced', [
        R('RB01_reader_fence', '/reader_fenced', 'is true', 'reader_fence_required', "value['reader_fenced'] is not True"),
    ]),
    P('proto_rebuild_pending', 'Protocol rebuild: nothing pending', [
        R('RB02_pending', '/durable/pending', 'is false', 'survivor_verification_failed', "value['pending'] is not False"),
    ]),
    P('proto_coverage_generation', 'Protocol survivor coverage: source generation', [
        R('CG01_bank_type', '/source_generation', 'the bank source generation is an exact integer', 'coverage_invalid', "value['bank_type'] != 'int'"),
        R('CG02_oracle_type', '/source_generation', 'the oracle source generation is an exact integer', 'coverage_invalid', "value['oracle_type'] != 'int'"),
        R('CG03_equal', '/source_generation', 'the bank source generation equals the oracle generation', 'coverage_invalid', "value['bank_type'] == 'int' and value['oracle_type'] == 'int' and value['bank_generation'] != value['oracle_generation']"),
    ]),
    P('proto_coverage_keys', 'Protocol survivor coverage: retained boundary keys', [
        R('CG04_keys', '/retained_boundary', 'the issued keys equal the retained boundary keys', 'coverage_invalid', "value['issued_keys'] != value['boundary_keys']"),
    ]),
    P('proto_coverage_verified', 'Protocol survivor coverage: retained boundary originals verify', [
        R('CG05_verified', '/retained_boundary', 'every retained boundary original verifies', 'coverage_invalid', "value['unverified_count'] != 0"),
    ]),
    P('proto_publish_gate', 'Protocol publish_reader: fenced reader and verified rebuild', [
        R('PB01_reader_fence', '/reader_fenced', 'is true', 'verified_rebuild_required', "value['reader_fenced'] is not True"),
        R('PB02_rebuilt', '/rebuilt', 'a rebuild is held for the fenced reader', 'verified_rebuild_required', "value['reader_fenced'] is True and value['rebuilt_present'] is not True"),
        R('PB03_rebuilt_current', '/rebuilt', 'the held rebuild equals the bank issued map', 'verified_rebuild_required', "value['reader_fenced'] is True and value['rebuilt_present'] is True and value['rebuilt_equal'] is not True"),
    ]),
    P('proto_reader_generation', 'Protocol reader generation compare-and-set', [
        R('RG01_bank_type', '/reader_generation', 'the bank reader generation is an exact integer', 'reader_generation_invalid', "value['bank_type'] != 'int'"),
        R('RG02_oracle_type', '/reader_generation', 'the oracle reader generation is an exact integer', 'reader_generation_invalid', "value['oracle_type'] != 'int'"),
        R('RG03_equal', '/reader_generation', 'the bank reader generation equals the oracle generation', 'reader_generation_invalid', "value['bank_type'] == 'int' and value['oracle_type'] == 'int' and value['bank_generation'] != value['oracle_generation']"),
    ]),
    P('proto_read_fence', 'Protocol read: reader not fenced', [
        R('RD01_reader', '/reader_fenced', 'is false', 'reader_unavailable', "value['reader_fenced'] is not False"),
    ]),
    P('proto_read_boundary', 'Protocol read: retained boundary entry', [
        R('RD02_boundary', '/retained_boundary', 'the oracle boundary holds the event', 'read_unavailable', "value['boundary_present'] is not True"),
    ]),
    P('proto_read_custody', 'Protocol read: retained boundary, candidate and Storage', [
        R('RD03_bank_boundary', '/retained_boundary', 'the bank retained boundary entry equals the oracle entry', 'read_unavailable', "value['bank_boundary_equal'] is not True"),
        R('RD04_candidate', '/event', 'the requested event and custody equal the retained entry', 'read_unavailable', "value['candidate_equal'] is not True"),
        R('RD05_storage', '/storage_instance_id', 'the bank Storage instance equals the retained custody Storage instance', 'read_unavailable', "value['bank_storage'] != value['custody_storage']"),
    ]),
    P('proto_resolve_storage', 'Protocol issued resolution: Storage instance', [
        R('RS01_storage', '/storage_instance_id', 'the bank Storage instance equals the original custody Storage instance', 'issued_unavailable', "value['bank_storage'] != value['custody_storage']"),
    ]),
    P('proto_body_schema', 'Protocol read_body: retained source schema', [
        R('BD01_schema', '/source', 'the retained source schema reports no error', 'read_unavailable', "value['errors'] != 0"),
    ]),
    P('proto_body_commitment', 'Protocol read_body: retained source commitment', [
        R('BD02_commitment', '/source/accepted_source_sha256', 'equals the recomputed source commitment', 'read_unavailable', "value['computed'] != value['recorded']"),
    ]),
    P('proto_body_result', 'Protocol read_body: original result equals the resolved payload', [
        R('BD03_result', '/source/original_result', 'equals the resolved original payload', 'read_unavailable', "value['result_equal'] is not True"),
    ]),
    P('proto_body_member', 'Protocol read_body: original body bytes', [
        R('BD04_present', '/source/body_members/ref', 'the bank holds the body as a string', 'read_unavailable', "value['raw_type'] != 'str'"),
        R('BD05_hash', '/source/body_members/sha256', 'equals the SHA-256 of the body bytes', 'read_unavailable', "value['raw_type'] == 'str' and value['computed_sha256'] != value['recorded_sha256']"),
    ]),
]


HEADER = '''"""DF guard table {phase}: {title}.

Method B guard rows for the DF FileSafe checkers. Each predicate reads one
observation record that the lane checker derives from the complete boundary
input (recomputed digests, decoded values, resolved routes, presence);
predicates never recompute, repair or call helpers. The checkers refuse only
through these rows (pm_filesafe_tables.refusals), in this order.
FIELDS names every observation the rows read; the checker passes no other.
Generated by scripts/pm-filesafe-table-generate.py; do not edit by hand.
"""
import pm_guard_isolation as g

FIELDS = {fields!r}
'''


def fields_of(rows):
    seen = []
    for row in rows:
        for name in re.findall(r"value\['([^']+)'\]", row['expr']):
            if name not in seen:
                seen.append(name)
    return tuple(seen)


def module_text(phase):
    rows = phase['rows']
    out = [HEADER.format(phase=phase['phase'], title=phase['title'], fields=fields_of(rows))]
    for row in rows:
        out.append(f"\n\ndef {row['name']}(value, context):\n    return {row['code']!r} if {row['expr']} else None\n")
    guards = ''.join(f"        g.Guard({row['name']!r}, g.Invariant({row['field']!r}, {row['words']!r}), {row['code']!r}, {row['name']}),\n" for row in rows)
    requires = ''.join(f"        table.require({row['name']!r}, value, context)\n" for row in rows)
    out.append(f"\n\ndef case(value):\n    context = None\n    table = g.GuardTable([\n{guards}    ])\n\n"
               f"    def check(value):\n{requires}        return True\n    return g.Case(table, check, context)\n")
    return ''.join(out)


def index_text():
    phases = ''.join(f'    {p["phase"]!r},\n' for p in SPEC)
    return ('"""DF guard-table phases in spec order (generated by scripts/pm-filesafe-table-generate.py)."""\n\n'
            f'PHASES = (\n{phases})\n')


def outputs():
    names = [p['phase'] for p in SPEC]
    assert len(names) == len(set(names)), 'duplicate phase'
    rows = [r['name'] for p in SPEC for r in p['rows']]
    assert len(rows) == len(set(rows)), 'duplicate row name'
    files = {SCRIPTS / f"pm_filesafe_table_{p['phase']}.py": module_text(p) for p in SPEC}
    files[SCRIPTS / 'pm_filesafe_table_index.py'] = index_text()
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    files = outputs()
    existing = set(SCRIPTS.glob('pm_filesafe_table_*.py'))
    stale = [str(p.relative_to(ROOT)) for p, text in files.items() if not p.exists() or p.read_text() != text]
    extra = [str(p.relative_to(ROOT)) for p in existing - set(files)]
    if args.check:
        rows = sum(len(p['rows']) for p in SPEC)
        print(f'{len(SPEC)} tables, {rows} rows; stale {len(stale)}, extra {len(extra)}')
        for name in stale + extra:
            print('  ' + name)
        return 1 if stale or extra else 0
    for path, text in files.items():
        if not path.exists() or path.read_text() != text:
            path.write_text(text)
    for path in existing - set(files):
        path.unlink()
    print(f'wrote {len(files)} files')
    return 0


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""Write the DFM Method B guard-table modules (scripts/pm_filemanager_table_*.py) from one row spec.

Usage: python3 scripts/pm-filemanager-table-generate.py [--check]

Each spec row is (name, field, words, code, body); body is one refusal-condition
expression over the phase observation ``value``. One module per phase table, at
most eight rows each, so the shared guard tool (scripts/pm_guard_isolation.py,
gated at 004bdedd63) certifies small modules. The generated modules are the
checked-in source of truth for every product refusal of
scripts/pm-filemanager-event-contracts.py: the checker derives the observation
of the phase it is about to evaluate (recomputed keys, identities and digests,
exact types, resolved rows, presence) and refuses only through its rows, in
table order. An observation fact that is not applicable is None; rows refuse
only on an applicable fact. --check fails when a module is stale, missing or
extra.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'scripts'
PREFIX = 'pm_filemanager_table_'
PHASES = {}
FAMILIES = tuple(k + '.' + a for k in ('file', 'folder')
                 for a in ('copied', 'created', 'deleted', 'exported', 'moved', 'renamed'))


def phase(name, doc, rows):
    assert name not in PHASES and 1 <= len(rows) <= 8, name
    names = [row[0] for row in rows]
    assert len(set(names)) == len(names), name
    PHASES[name] = (doc, rows)


def false(fact):
    """Refuse when an applicable boolean fact is False (None means not applicable)."""
    return f"value['{fact}'] is False"


def not_true(fact):
    """Refuse unless the always-computed boolean fact is exactly True."""
    return f"value['{fact}'] is not True"


def schema(name, row, field, words):
    phase(name, f'Schema verdict: {words}.', [
        (row, field, words, 'schema', not_true('schema_valid')),
    ])


# ===================================================================== schema verdict rows (one per occurrence)
for i, family in enumerate(FAMILIES, start=1):
    token = family.replace('.', '_')
    schema(f'schema_payload_{token}', f'PY{i:02d}_{token}_payload', '/payload',
           f'conforms to event_payloads/file_manager/{token}.schema.json (closed {family} payload)')
schema('schema_operation_custody', 'OC01_operation_custody', '/operation_custody',
       'conforms to filemanager_operation_contracts.schema.json#/$defs/operation_custody')
schema('schema_family_control', 'FC01_family_control', '/family_control',
       'conforms to filemanager_operation_contracts.schema.json#/$defs/family_control')
schema('schema_operation_reference', 'OR01_operation_reference', '/operation_custody_reference',
       'conforms to filemanager_operation_contracts.schema.json#/$defs/operation_custody_reference')
schema('schema_control_reference', 'CR01_control_reference', '/family_control_reference',
       'conforms to filemanager_operation_contracts.schema.json#/$defs/family_control_reference')
schema('schema_full_value_request', 'FQ01_full_value_request', '/custody_model/request',
       'conforms to event_append_receipt_contracts.schema.json#/$defs/full_value_request')
schema('schema_full_value_result', 'FR01_full_value_result', '/custody_model/result',
       'conforms to event_append_receipt_contracts.schema.json#/$defs/full_value_result')
schema('schema_custody_v2', 'CV01_custody_v2', '/custody_model/append_rows/*',
       'conforms to event_append_receipt_contracts.schema.json#/$defs/custody_v2')
schema('schema_event_record', 'ER01_event_record', '/custody_model/retry_event',
       'conforms to event_record.schema.json (complete EventRecord)')
schema('schema_storage_registry', 'RG01_storage_registry', '/storage_value_registry',
       'conforms to storage_value_registry.schema.json')
schema('rule_payload', 'RP01_payload_definition', '/<named payload definition>',
       'conforms to the named definition of a family payload schema (isolated schema-rule witness)')
schema('rule_receipt', 'RR01_receipt_definition', '/<named receipt definition>',
       'conforms to the named definition of event_append_receipt_contracts.schema.json (isolated schema-rule witness)')
schema('rule_event_record', 'RE01_event_record_definition', '/<named EventRecord definition>',
       'conforms to the named definition of event_record.schema.json (isolated schema-rule witness)')
schema('rule_operation', 'RO01_operation_definition', '/<named operation definition>',
       'conforms to the named definition of filemanager_operation_contracts.schema.json (isolated schema-rule witness)')
schema('rule_registry', 'RY01_registry_definition', '/<named registry definition>',
       'conforms to the named definition of storage_value_registry.schema.json (isolated schema-rule witness)')
phase('schema_meta', 'Schema document admission: the 2020-12 meta-schema (validate_schema_graph).', [
    ('SM01_meta_schema', '/', 'the document is a valid 2020-12 schema', 'schema meta-validation', not_true('meta_valid')),
])
phase('schema_ref', 'Schema document admission: every $ref, including dormant definitions, resolves offline.', [
    ('SR01_ref_resolves', '/**/$ref', 'the reference resolves in the closed registry', 'unresolved schema reference',
     not_true('ref_resolves')),
])

# ===================================================================== SP-337 transport and SP-340 values
phase('redb_value_encoding', 'SP-339 canonical MessagePack of a redb value (closed integer/string fixture domain).', [
    ('RV01_redb_encodable', '/<redb value>', 'is in the closed SP-339 canonical MessagePack domain (no float, int64/uint64 range)',
     'redb value encoding', not_true('encodable')),
])
phase('event_value_encoding', 'SP-1100 EVENT_VALUE bytes of an EventRecord body (shared storage_value_bytes).', [
    ('EV01_integer_range', '/payload/**', 'every integer is within -2^63..2^64-1', 'physical_integer_range',
     "value['physical_refusal'] == 'physical_integer_range'"),
    ('EV02_event_value_other', '/payload/**', 'has no other EVENT_VALUE refusal (Unicode scalar strings, supported types)',
     'physical_value', "value['physical_refusal'] not in (None, 'physical_integer_range')"),
])
phase('payload_reference', 'SP-337 payload reference grammar (validate_payload_reference).', [
    ('PR01_reference_type', '/value_ref', 'is a string', 'invalid SP-337 reference', "value['reference_type'] != 'str'"),
    ('PR02_reference_grammar', '/value_ref', 'a string reference full-matches the v1 blake3/size/media grammar',
     'invalid SP-337 reference', false('reference_grammar')),
])
phase('payload_referent', 'SP-337 referent lookup (resolve_payload).', [
    ('PV01_referent_present', '/payload_rows/{ref}', 'the referenced pack bytes are present', 'payload referent missing',
     not_true('referent_present')),
])
phase('payload_bytes', 'SP-337 referent bytes (resolve_payload).', [
    ('PV02_referent_matches', '/payload_rows/{ref}', 'the referent bytes recompute to the same hash, size and media',
     'SP-337 bytes/hash/size mismatch', not_true('referent_matches')),
])
phase('value_physical_size', 'SP-340 redb value limit on the physical value (resolve_value).', [
    ('VS01_physical_within_limit', '/<redb value>', 'the physical redb value is at most 16 KiB', 'redb value exceeds 16 KiB',
     not_true('physical_within_limit')),
])
phase('value_reference_size', 'SP-337 large-value route only (resolve_value).', [
    ('VS02_referent_above_limit', '/<redb value>/value_ref', 'a referenced logical value is above 16 KiB',
     'noncanonical small value reference', not_true('referent_above_limit')),
])
phase('event_inline_body', 'EventRecord inline body (event_body).', [
    ('EB01_inline_type', '/payload', 'the inline payload is an object', 'event inline body exceeds 16 KiB',
     "value['inline_type'] != 'dict'"),
    ('EB02_inline_size', '/payload', 'an object inline payload is at most 16 KiB', 'event inline body exceeds 16 KiB',
     "value['inline_oversize'] is True"),
])
phase('event_reference_inline', 'EventRecord referenced body (event_body).', [
    ('EB03_referenced_inline_empty', '/payload', 'a referenced event keeps an empty inline payload',
     'referenced event retains inline body', not_true('referenced_inline_empty')),
])
phase('event_reference_size', 'EventRecord referenced body (event_body).', [
    ('EB04_referenced_above_limit', '/payload_ref', 'a referenced event body is above 16 KiB',
     'noncanonical small event reference', not_true('referenced_above_limit')),
])
phase('writer_policy', 'Current writer replay policy (validate_writer; standing check 1).', [
    ('WR01_replay_only', '/replay_policy', 'a current writer never uses projector_replay_only', 'replay_only_not_appendable',
     "value['policy'] == 'projector_replay_only'"),
    ('WR02_family_policy', '/replay_policy', 'otherwise equals dedupe_by_idempotency_key', 'filemanager writer replay policy',
     "value['policy'] != 'projector_replay_only' and value['policy'] != 'dedupe_by_idempotency_key'"),
])
phase('storage_profile_present', 'SP-340 family profile lookup (validate_profile).', [
    ('SF01_profile_present', '/storage_profile/family_profiles/{family}', 'the family has a storage profile',
     'storage profile missing', not_true('profile_present')),
])
phase('storage_profile', 'SP-340 family profile fields (validate_profile).', [
    ('SF02_redb_file', '/storage_profile/family_profiles/{family}/redb_file', 'is canonical', 'wrong SP-340 profile',
     "value['redb_file'] != 'canonical'"),
    ('SF03_storage_group', '/storage_profile/family_profiles/{family}/storage_group', 'is coordination_and_storage',
     'wrong SP-340 profile', "value['storage_group'] != 'coordination_and_storage'"),
    ('SF04_max_value_bytes', '/storage_profile/family_profiles/{family}/max_value_bytes', 'is exactly the integer 16384',
     'wrong SP-340 profile', not_true('max_value_bytes_exact')),
    ('SF05_encoding_target', '/storage_profile/family_profiles/{family}/encoding_target', 'is messagepack_canonical',
     'wrong SP-340 profile', "value['encoding_target'] != 'messagepack_canonical'"),
    ('SF06_group_budget', '/storage_profile/groups/{group}/canonical_budget_bytes', 'the selected group budget is exactly 2147483648',
     'wrong existing advisory canonical budget', false('budget_exact')),
    ('SF07_schema_header', '/families/{family}/value_schema/properties/schema_id/const',
     'the stored schema header const equals value_schema_id', 'wrong stored schema header', not_true('header_exact')),
])

# ===================================================================== path custody (SP-560 operation custody)
phase('path_coverage', 'Accepted and settled snapshot coverage (validate_path_coverage).', [
    ('PC01_coverage_count', '/path_snapshots', 'has exactly one entry per required path', 'path coverage',
     not_true('count_matches')),
    ('PC02_coverage_members', '/path_snapshots/*/path_ref', 'with the right count, covers exactly the required path set',
     'path coverage', false('members_match')),
])
phase('path_join', 'Settled path snapshot joins (validate_path_custody).', [
    ('PJ01_path_project', '/settlement/path_snapshots/*/project_id', 'equals the payload Project', 'original path join',
     not_true('project_equal')),
    ('PJ02_path_revision', '/settlement/path_snapshots/*/path_snapshot_revision', 'equals the payload revision',
     'original path join', not_true('revision_equal')),
    ('PJ03_node_absence', '/settlement/path_snapshots/*/node_ref', 'is null exactly when node_kind is absent',
     'original path join', not_true('absence_consistent')),
])
phase('path_location', 'Settled snapshot versus its accepted original (validate_path_custody).', [
    ('PL01_project', '/settlement/path_snapshots/*/project_id', 'equals the accepted snapshot', 'changed accepted location',
     not_true('project_equal')),
    ('PL02_revision', '/settlement/path_snapshots/*/path_snapshot_revision', 'equals the accepted snapshot',
     'changed accepted location', not_true('revision_equal')),
    ('PL03_computer', '/settlement/path_snapshots/*/computer_id', 'equals the accepted snapshot', 'changed accepted location',
     not_true('computer_equal')),
    ('PL04_root', '/settlement/path_snapshots/*/root_identity_ref', 'equals the accepted snapshot', 'changed accepted location',
     not_true('root_equal')),
    ('PL05_components', '/settlement/path_snapshots/*/relative_components', 'equals the accepted snapshot',
     'changed accepted location', not_true('components_equal')),
])

# ===================================================================== represented subjects (validate_snapshot_subjects)
phase('subject_kind', 'A represented snapshot names the subject and kind (validate_snapshot_subjects.subject).', [
    ('SK01_subject_ref', '/path_snapshots/*/node_ref', 'equals the payload subject ref', 'snapshot subject/kind',
     not_true('node_equal')),
    ('SK02_subject_kind', '/path_snapshots/*/node_kind', 'equals the family kind', 'snapshot subject/kind',
     not_true('kind_equal')),
])
phase('creation_original', 'Creation: no selected root and an absent original destination.', [
    ('CO01_no_selected_root', '/accepted_command/selected_root_ref', 'is null for creation', 'creation selected root',
     not_true('selected_root_null')),
    ('CO02_destination_node_null', '/accepted_path_snapshots/{destination}/node_ref', 'is null', 'creation original absence',
     not_true('destination_node_null')),
    ('CO03_destination_absent', '/accepted_path_snapshots/{destination}/node_kind', 'is absent', 'creation original absence',
     not_true('destination_absent')),
])
phase('creation_container', 'Creation: the exact original container (validate_snapshot_subjects).', [
    ('CC01_container_unique', '/accepted_path_snapshots', 'exactly one accepted snapshot is the destination container',
     'creation exact container', "value['container_count'] != 1"),
    ('CC02_container_folder', '/accepted_path_snapshots/{container}/node_kind', 'the unique container is a folder',
     'creation exact container', false('container_folder')),
    ('CC03_settled_container_ref', '/settlement/path_snapshots/{container}/node_ref', 'still names the container',
     'creation settled container', false('settled_ref_equal')),
    ('CC04_settled_container_folder', '/settlement/path_snapshots/{container}/node_kind', 'is still a folder',
     'creation settled container', false('settled_folder')),
    ('CC05_container_computer', '/accepted_path_snapshots/{destination}/computer_id', 'equals the container computer',
     'creation container location', false('computer_equal')),
    ('CC06_container_root', '/accepted_path_snapshots/{destination}/root_identity_ref', 'equals the container root',
     'creation container location', false('root_equal')),
    ('CC07_container_parent', '/accepted_path_snapshots/{destination}/relative_components', 'parent equals the container components',
     'creation container location', false('parent_equal')),
])
phase('subject_selection', 'Non-creation: the selected original root is the payload subject.', [
    ('SS01_selected_subject', '/accepted_command/selected_root_ref', 'equals the payload subject ref', 'selected original subject',
     not_true('selected_equal')),
])
phase('export_destination', 'Export: the settled destination has the family kind.', [
    ('XD01_destination_kind', '/settlement/path_snapshots/{destination}/node_kind', 'equals the family kind',
     'export destination kind', not_true('kind_equal')),
])
phase('location_change', 'Copy, move and export change the represented original location.', [
    ('LC01_location_changed', '/settlement/path_snapshots/{destination}', 'computer/root/components differ from the source',
     'unchanged represented original location', not_true('location_changed')),
])
phase('rename_relation', 'Rename keeps computer, root and parent and changes the basename.', [
    ('RN01_same_computer', '/settlement/path_snapshots/{destination}/computer_id', 'equals the source computer',
     'rename original parent/basename', not_true('computer_equal')),
    ('RN02_same_root', '/settlement/path_snapshots/{destination}/root_identity_ref', 'equals the source root',
     'rename original parent/basename', not_true('root_equal')),
    ('RN03_same_parent', '/settlement/path_snapshots/{destination}/relative_components', 'parent equals the source parent',
     'rename original parent/basename', not_true('parent_equal')),
    ('RN04_new_basename', '/settlement/path_snapshots/{destination}/relative_components', 'basename differs from the source',
     'rename original parent/basename', not_true('basename_changed')),
])

# ===================================================================== complete original EventRecord joins
phase('body_mode', 'Complete-event join mode input (validate_complete_event).', [
    ('BM01_body_mode', '/include_body', 'is an exact boolean', 'invalid body-validation mode', "value['mode_type'] != 'bool'"),
])
phase('complete_event', 'Complete original EventRecord joins (validate_complete_event).', [
    ('CE01_body', '/payload | /payload_ref', 'the resolved body equals the payload (typed)', 'complete event join',
     false('body_equal')),
    ('CE02_event_type', '/event_type', 'equals the family', 'complete event join', not_true('event_type_equal')),
    ('CE03_project', '/project_id', 'equals the payload Project', 'complete event join', not_true('project_equal')),
    ('CE04_scope_kind', '/scope_kind', 'is project', 'complete event join', not_true('scope_project')),
    ('CE05_correlation', '/correlation_id', 'equals the payload correlation', 'complete event join',
     not_true('correlation_equal')),
    ('CE06_occurred_at', '/occurred_at_utc', 'equals the payload ts', 'complete event join', not_true('occurred_equal')),
    ('CE07_payload_schema', '/payload_schema_id', 'equals the payload schema_id', 'complete event join',
     not_true('schema_id_equal')),
])
phase('complete_event_identity', 'Complete original EventRecord identity (validate_complete_event).', [
    ('CE08_identity', '/event_id | /idempotency_key', 'equal the recomputed family identity', 'complete event join',
     not_true('identity_equal')),
])

# ===================================================================== operation custody transitions (SP-560)
phase('operation_edge', 'Operation CAS edge (validate_operation_edge).', [
    ('OE01_phase_edge', '/phase', 'accepted->effect_settled|no_event_settled or effect_settled->history_settled',
     'operation CAS/phase', not_true('edge_permitted')),
    ('OE02_revision_step', '/revision', 'is the before revision + 1', 'operation CAS/phase', not_true('revision_next')),
])
phase('operation_edge_terminal', 'Terminal operation CAS edge (validate_operation_edge, terminal).', [
    ('OT01_terminal_edge', '/phase', 'effect_settled->history_settled only', 'operation CAS/phase', not_true('edge_permitted')),
    ('OT02_terminal_revision', '/revision', 'is the before revision + 1', 'operation CAS/phase', not_true('revision_next')),
])
phase('operation_immutables', 'Operation custody immutability (validate_operation_immutables).', [
    ('OI01_accepted_unchanged', '/<accepted fields>', 'every accepted-original field is unchanged (typed)',
     'changed accepted original', not_true('accepted_unchanged')),
    ('OI02_settled_unchanged', '/settlement', 'a settled original is unchanged (typed)', 'changed settled original',
     false('settled_unchanged')),
])
phase('transition_storage', 'Transition physical storage input (validate_transition_storage).', [
    ('TS01_storage_input', '/storage', 'is absent or an object', 'invalid physical storage input', not_true('storage_valid')),
])
phase('operation_resolution', 'Operation physical value resolves to the logical row (validate_operation_transition).', [
    ('OP01_resolution_equal', '/storage/{before|after}', 'the resolved value equals the logical row (typed)',
     'operation physical resolution differs', not_true('resolution_equal')),
])
phase('acceptance_join', 'Settlement payload acceptance joins (validate_operation_transition).', [
    ('AJ01_schema_id', '/settlement/payload/schema_id', 'equals the family payload schema id', 'settlement acceptance join',
     not_true('schema_id_equal')),
    ('AJ02_project', '/settlement/payload/project_id', 'equals the operation Project', 'settlement acceptance join',
     not_true('project_equal')),
    ('AJ03_operation', '/settlement/payload/operation_id', 'equals the operation id', 'settlement acceptance join',
     not_true('operation_equal')),
    ('AJ04_receipt', '/settlement/payload/receipt_ref', 'equals the recomputed operation receipt ref', 'settlement acceptance join',
     not_true('receipt_equal')),
])
phase('terminal_proof', 'Terminal publication full-value proof (validate_operation_transition).', [
    ('TP01_proof_present', '/proof', 'a history_settled CAS carries the strict full-value proof',
     'terminal strict full-value proof missing', not_true('proof_present')),
])
phase('family_identity', 'Family identity relations (validate_family_identity).', [
    ('FI01_copy_distinct', '/result_*_ref', 'a copy result differs from its source', 'copy result equals source',
     "value['copy_distinct'] is False"),
    ('FI02_create_distinct', '/result_*_ref', 'a created result differs from its destination container',
     'create result equals destination container', "value['create_distinct'] is False"),
])
phase('settlement_command', 'Accepted command joins (validate_settlement_inputs).', [
    ('SC01_command_id', '/accepted_command/command_id', 'equals the payload', 'command join', not_true('command_id_equal')),
    ('SC02_handler_target', '/accepted_command/handler_target', 'equals the payload', 'command join',
     not_true('handler_target_equal')),
    ('SC03_correlation', '/accepted_command/correlation_id', 'equals the payload', 'command join',
     not_true('correlation_equal')),
    ('SC04_origin', '/accepted_command/origin', 'equals the payload', 'command join', not_true('origin_equal')),
])
phase('settlement_inputs', 'Accepted input and completion joins (validate_settlement_inputs).', [
    ('SI01_source_path', '/accepted_command/source_path_ref', 'equals the payload (or both absent)', 'original accepted input join',
     not_true('source_equal')),
    ('SI02_destination_path', '/accepted_command/destination_path_ref', 'equals the payload (or both absent)',
     'original accepted input join', not_true('destination_equal')),
    ('SI03_container', '/accepted_command/destination_container_ref', 'equals the payload (or both absent)',
     'original accepted input join', not_true('container_equal')),
    ('SI04_deletion_mode', '/accepted_command/deletion_mode', 'equals the payload (or both absent)',
     'original accepted input join', not_true('deletion_mode_equal')),
    ('SI05_completion_time', '/settlement/settled_at_utc', 'equals the payload ts', 'original completion time',
     not_true('completion_equal')),
])

# ===================================================================== family control transitions (SP-560)
phase('drain_input', 'Control drain-key input (validate_control_transition).', [
    ('DI01_drain_list', '/drain_keys', 'is an exact list', 'drain keys must be an exact list', "value['drain_type'] != 'list'"),
])
phase('drain_key', 'Each drain key (validate_control_transition).', [
    ('DK01_key_type', '/drain_keys/*', 'is a string', 'invalid drain operation reference', "value['key_type'] != 'str'"),
    ('DK02_key_grammar', '/drain_keys/*', 'a string key full-matches the operation custody key grammar',
     'invalid drain operation reference', false('key_grammar')),
])
phase('control_resolution', 'Control physical value resolves to the logical row (validate_control_transition).', [
    ('CQ01_resolution_equal', '/storage/{before|after}', 'the resolved value equals the logical row (typed)',
     'control physical resolution differs', not_true('resolution_equal')),
])
phase('control_cas', 'Control CAS identity (validate_control_transition).', [
    ('CK01_key_unchanged', '/control_key', 'the recomputed control key is unchanged', 'control CAS/identity',
     not_true('key_unchanged')),
    ('CK02_revision_step', '/control_revision', 'is the before revision + 1', 'control CAS/identity', not_true('revision_next')),
])
phase('control_edge', 'Control state edge and admission (validate_control_transition).', [
    ('CT01_state_edge', '/state', 'is one of the six permitted state edges', 'control transition', not_true('edge_permitted')),
    ('CT02_admission_unchanged', '/admission_revision', 'a set admission revision is unchanged', 'changed original admission',
     false('admission_unchanged')),
])
phase('control_issued', 'Control issued-sequence boundary (validate_control_transition; CV-1100 current_integer).', [
    ('CI01_issued_type', '/issued_sequence', 'is an exact integer', 'control issued boundary',
     "value['issued_refusal'] == 'integer_type'"),
    ('CI02_issued_range', '/issued_sequence', 'is at least 0', 'control issued boundary',
     "value['issued_refusal'] == 'integer_range'"),
    ('CI03_issued_admitted', '/last_admitted_sequence', 'the after row admits exactly the issued sequence',
     'control issued boundary', false('after_admits_issued')),
    ('CI04_issued_monotonic', '/issued_sequence', 'is not below the before admitted sequence', 'control issued boundary',
     false('issued_monotonic')),
])
phase('control_authority', 'Control reader and drain authority (validate_control_transition).', [
    ('CA01_issuance_reader', '/reader_enabled', 'an issuance edge keeps reader authority', 'issuance changed control authority',
     false('issuance_reader_kept')),
    ('CA02_issuance_drain', '/drain_operation_keys', 'an issuance edge keeps the drain set', 'issuance changed control authority',
     false('issuance_drain_kept')),
    ('CA03_drain_membership', '/drain_operation_keys', 'the drain edge records exactly the given drain keys', 'drain membership',
     false('drain_members_equal')),
    ('CA04_drain_reader', '/reader_enabled', 'the drain edge keeps reader authority', 'drain changed reader authority',
     false('drain_reader_kept')),
    ('CA05_withdraw_drained', '/drain_keys', 'withdrawal has no open drain key', 'cutoff before original drain',
     false('withdraw_drained')),
    ('CA06_withdraw_cutoff', '/writer_cutoff_sequence', 'withdrawal cuts off at the issued sequence', 'cutoff before original drain',
     false('withdraw_cutoff_equal')),
])
phase('control_withdrawn', 'Withdrawn control stays withdrawn (validate_control_transition).', [
    ('CW01_cutoff_kept', '/writer_cutoff_sequence', 'is unchanged', 'withdrawn authority rewritten', false('cutoff_kept')),
    ('CW02_admitted_kept', '/last_admitted_sequence', 'is unchanged', 'withdrawn authority rewritten', false('admitted_kept')),
    ('CW03_reader_before', '/reader_enabled', 'the before row still had reader authority', 'withdrawn authority rewritten',
     false('reader_before_true')),
    ('CW04_reader_after', '/reader_enabled', 'the after row disables the reader', 'withdrawn authority rewritten',
     false('reader_after_false')),
])

# ===================================================================== original operation custody (validate_original_models)
phase('historical_mode', 'Reader mode input (validate_original_models).', [
    ('HM01_mode_bool', '/historical', 'is an exact boolean', 'invalid historical mode', "value['mode_type'] != 'bool'"),
])
phase('operation_row', 'Selected operation custody row lookup (validate_original_models).', [
    ('OW01_operation_present', '/custody_model/operation_rows/{operation_key}', 'the selected operation custody row is present',
     'operation custody row missing', not_true('row_present')),
])
phase('terminal_selection', 'Terminal publication reads the actual pre-CAS original (validate_original_models).', [
    ('TL01_selected_is_before', '/custody_model/operation_rows/{key}', 'the selected original equals the CAS before row (typed)',
     'terminal selected original differs from before', not_true('selected_equal')),
])
phase('operation_identity', 'Operation physical identity (validate_original_models).', [
    ('OK01_operation_key', '/custody_model/operation_key', 'equals the recomputed operation custody key',
     'operation physical identity', not_true('key_equal')),
    ('OK02_receipt_ref', '/payload/receipt_ref', 'equals the recomputed operation receipt ref', 'operation physical identity',
     not_true('receipt_equal')),
])
phase('operation_scope', 'Operation original epoch and scope (validate_original_models).', [
    ('OS01_project', '/operation/project_id', 'equals the trace Project', 'operation original epoch/scope',
     not_true('project_equal')),
    ('OS02_storage_instance', '/operation/storage_instance_id', 'equals the trace Storage instance',
     'operation original epoch/scope', not_true('storage_equal')),
    ('OS03_recovery_epoch', '/operation/recovery_epoch', 'equals the trace recovery epoch', 'operation original epoch/scope',
     not_true('epoch_equal')),
])
phase('operation_family', 'Operation family, identity and phase (validate_original_models).', [
    ('OF01_event_type', '/operation/event_type', 'equals the family', 'operation family/identity', not_true('event_type_equal')),
    ('OF02_operation_id', '/operation/operation_id', 'equals the payload operation id', 'operation family/identity',
     not_true('operation_equal')),
    ('OF03_history_settled', '/operation/phase', 'is history_settled', 'unsettled or changed original payload',
     not_true('history_settled')),
])

# ===================================================================== retained original custody (validate_historical_operation)
phase('settled_original_payload', 'The payload equals the settled original (validate_historical_operation).', [
    ('SO01_settled_payload', '/settlement/payload', 'equals the payload (typed)', 'unsettled or changed original payload',
     not_true('payload_equal')),
])
phase('full_value_resolver', 'Full-value proof resolver (validate_historical_operation).', [
    ('FV01_full_value_resolver', '/custody_model/resolver', 'is storage.first_append_receipt.resolve_full_value.v1',
     'semantic proof is not full-value proof', not_true('resolver_full_value')),
])
phase('full_value_request', 'Full-value request carries the complete original (validate_historical_operation).', [
    ('RQ01_request_event', '/custody_model/request/event', 'equals the complete original EventRecord (typed)',
     'changed original full-value request', not_true('request_equal')),
])
phase('retry_original', 'Retry against the original (validate_historical_operation; standing check 6).', [
    ('RT01_retry_event_id', '/custody_model/retry_event/event_id', 'equals the original event id', 'retry original event identity',
     not_true('event_id_equal')),
    ('RT02_retry_semantic', '/custody_model/retry_event', 'the caller semantic body equals the original (typed)',
     'unequal caller semantic retry', not_true('semantic_equal')),
])
phase('append_row', 'Selected v2 append custody row lookup (validate_historical_operation).', [
    ('AR01_append_present', '/custody_model/append_rows/{append_key}', 'the selected append custody row is present',
     'append custody row missing', not_true('row_present')),
])
phase('custody_identity', 'Original v2 custody identity (validate_historical_operation).', [
    ('CU01_append_key', '/custody_model/append_key', 'equals the recomputed custody key', 'original v2 custody identity',
     not_true('key_equal')),
    ('CU02_storage_instance', '/custody_v2/storage_instance_id', 'equals the operation Storage instance',
     'original v2 custody identity', not_true('storage_equal')),
    ('CU03_event_id', '/custody_v2/event_id', 'equals the original event id', 'original v2 custody identity',
     not_true('event_id_equal')),
    ('CU04_scope_partition', '/custody_v2/scope_partition', 'equals the encoded project~ partition',
     'original v2 custody identity', not_true('scope_equal')),
    ('CU05_event_type', '/custody_v2/event_type', 'equals the family', 'original v2 custody identity',
     not_true('event_type_equal')),
    ('CU06_idempotency_key', '/custody_v2/idempotency_key', 'equals the original idempotency key',
     'original v2 custody identity', not_true('idempotency_equal')),
])
phase('producer_jcs', 'CV-317/CV-1100 qualified JCS of the producer projection (shared producer_semantic_digest).', [
    ('QJ01_jcs_binary64', '/<producer projection>/**', 'every integer has an exact finite binary64 value', 'jcs_binary64',
     "value['jcs_refusal'] == 'jcs_binary64'"),
    ('QJ02_jcs_decimal', '/<producer projection>/**', 'every emitted JCS decimal equals the original integer', 'jcs_decimal',
     "value['jcs_refusal'] == 'jcs_decimal'"),
    ('QJ03_jcs_other', '/<producer projection>', 'has no other qualified-JCS refusal (Unicode scalar strings, supported kinds)',
     'producer_jcs', "value['jcs_refusal'] not in (None, 'jcs_binary64', 'jcs_decimal')"),
])
phase('full_value_result', 'Full-value result and commitments (validate_historical_operation).', [
    ('VR01_result_selected', '/custody_model/result', 'equals the selected custody row fields (typed)',
     'full-value result differs from selected original', not_true('result_equal')),
    ('VR02_value_commitment', '/custody_model/result/original_event_value_commitment', 'equals the recomputed CV-339 commitment',
     'unequal complete-value commitment', not_true('commitment_equal')),
    ('VR03_producer_digest', '/custody_v2/producer_semantic_digest', 'equals the recomputed CV-317 producer digest',
     'producer semantic digest mismatch', not_true('digest_equal')),
])
phase('issued_receipt', 'Original issued receipt join (validate_historical_operation).', [
    ('IR01_receipt_operation', '/result/first_append_receipt', 'equals the operation custody receipt (typed)',
     'original issued receipt join', not_true('receipt_equal')),
    ('IR02_receipt_event_id', '/result/first_append_receipt/event_id', 'equals the original event id',
     'original issued receipt join', not_true('event_id_equal')),
    ('IR03_receipt_sequence', '/result/first_append_receipt/sequence_id', 'equals the original Storage sequence',
     'original issued receipt join', not_true('sequence_equal')),
    ('IR04_receipt_barrier', '/result/first_append_receipt/durability_class', 'is barrier', 'original issued receipt join',
     not_true('barrier')),
])
phase('checkpoint_binding', 'SP-278 checkpoint storage identity (validate_historical_operation; standing check 7).', [
    ('CB01_binding_fields', '/custody_model/checkpoint_binding', 'has exactly the four identity fields',
     'checkpoint original storage identity mismatch', not_true('fields_exact')),
    ('CB02_storage_instance', '/custody_model/checkpoint_binding/storage_instance_id', 'equals the operation Storage instance',
     'checkpoint original storage identity mismatch', false('storage_equal')),
    ('CB03_recovery_epoch', '/custody_model/checkpoint_binding/recovery_epoch', 'equals the operation recovery epoch (typed)',
     'checkpoint original storage identity mismatch', false('epoch_equal')),
    ('CB04_event_id', '/custody_model/checkpoint_binding/event_id', 'equals the original event id',
     'checkpoint original storage identity mismatch', false('event_id_equal')),
    ('CB05_scope_partition', '/custody_model/checkpoint_binding/scope_partition', 'equals the encoded project~ partition',
     'checkpoint original storage identity mismatch', false('scope_equal')),
])
phase('control_row', 'Family control row lookup (validate_historical_operation).', [
    ('CL01_control_present', '/custody_model/control_rows/{control_key}', 'the family control row is present',
     'family control row missing', not_true('row_present')),
])
phase('control_identity', 'Family control physical identity (validate_historical_operation).', [
    ('CN01_control_key', '/custody_model/control_key', 'equals the recomputed control key', 'control physical identity',
     not_true('key_equal')),
    ('CN02_event_type', '/family_control/event_type', 'equals the family', 'control physical identity',
     not_true('event_type_equal')),
    ('CN03_storage_instance', '/family_control/storage_instance_id', 'equals the operation Storage instance',
     'control physical identity', not_true('storage_equal')),
])
phase('control_reader', 'Family control reader availability (validate_historical_operation).', [
    ('CD01_not_prepared', '/family_control/state', 'is not prepared', 'control reader unavailable', not_true('not_prepared')),
    ('CD02_reader_enabled', '/family_control/reader_enabled', 'is enabled', 'control reader unavailable',
     not_true('reader_enabled')),
])
phase('control_cutoff', 'Family control cutoff and original sequence (validate_historical_operation).', [
    ('CX01_withdrawn_ceiling', '/family_control/writer_cutoff_sequence', 'a withdrawn cutoff equals the last admitted sequence',
     'control cutoff/sequence', false('withdrawn_ceiling_equal')),
    ('CX02_sequence_ceiling', '/complete_event/sequence_id', 'is not above the control ceiling', 'control cutoff/sequence',
     not_true('within_ceiling')),
])
phase('late_change', 'Final revalidation of the selected rows (validate_historical_operation).', [
    ('LT01_final_operation', '/custody_model/final_operation', 'equals the selected logical operation (typed)',
     'late original/control change', not_true('operation_equal')),
    ('LT02_final_control', '/custody_model/final_control', 'equals the selected logical control (typed)',
     'late original/control change', not_true('control_equal')),
    ('LT03_final_append', '/custody_model/final_append', 'equals the selected append custody row (typed)',
     'late original/control change', not_true('append_equal')),
    ('LT04_final_operation_value', '/custody_model/final_operation_value', 'equals the physical operation value (typed)',
     'late physical value/referent change', not_true('operation_value_equal')),
    ('LT05_final_control_value', '/custody_model/final_control_value', 'equals the physical control value (typed)',
     'late physical value/referent change', not_true('control_value_equal')),
    ('LT06_final_payload_rows', '/custody_model/final_payload_rows', 'equal the referent rows (typed)',
     'late physical value/referent change', not_true('payload_rows_equal')),
])
phase('backup_binding', 'Backup binding of the selected set (validate_historical_operation).', [
    ('BK01_backup_equal', '/custody_model/backup_binding', 'equals the complete selected physical set (typed)',
     'backup original/control skew', not_true('backup_equal')),
])

# ===================================================================== family identity recipe (F-150..F-161)
phase('identity_epoch', 'Identity recovery epoch (identity; CV-1100 current_integer, minimum 0).', [
    ('IE01_epoch_type', '/recovery_epoch', 'is an exact integer', 'noncanonical recovery epoch',
     "value['epoch_refusal'] == 'integer_type'"),
    ('IE02_epoch_range', '/recovery_epoch', 'is at least 0', 'noncanonical recovery epoch',
     "value['epoch_refusal'] == 'integer_range'"),
])
phase('identity_tuple', 'Identity tuple strings and RFC 8785 conformance (identity).', [
    ('IT01_storage_string', '/storage_instance_id', 'is a string', 'noncanonical identity tuple',
     "value['storage_type'] != 'str'"),
    ('IT02_project_string', '/project_id', 'is a string', 'noncanonical identity tuple', "value['project_type'] != 'str'"),
    ('IT03_operation_string', '/operation_id', 'is a string', 'noncanonical identity tuple', "value['operation_type'] != 'str'"),
    ('IT04_subject_string', '/<family subject ref>', 'is a string', 'noncanonical identity tuple',
     "value['subject_type'] != 'str'"),
    ('IT05_rfc8785_preimage', '/<identity tuple>', 'the compact string-array preimage is the RFC 8785 (qualified JCS) bytes',
     'identity preimage is not RFC 8785', false('preimage_is_jcs')),
])

# ===================================================================== current boundary (validate_case)
phase('payload_scope', 'Payload Project scope (validate_case).', [
    ('PS01_payload_project', '/project_id', 'equals the trace Project', 'scope mismatch', not_true('project_equal')),
])
phase('path_scope', 'Path refs are Project-scoped (validate_case).', [
    ('PA01_source_scope', '/source_path_ref', 'is a project path ref when present', 'foreign path scope', false('source_scoped')),
    ('PA02_destination_scope', '/destination_path_ref', 'is a project path ref when present', 'foreign path scope',
     false('destination_scoped')),
    ('PA03_affected_scope', '/affected_path_refs/*', 'every affected ref is a project path ref', 'foreign affected path scope',
     not_true('affected_scoped')),
])
phase('trace_original_payload', 'The payload equals the frozen original (validate_case).', [
    ('TO01_original_payload', '/original_payload', 'equals the payload (typed)', 'unequal original custody',
     not_true('payload_equal')),
])
phase('trace_fences', 'Ordering, first receipt, replay and source fences (validate_case).', [
    ('TF01_ordering', '/stages', 'is exactly effect, receipt, append, first ack, terminal', 'invalid ordering',
     not_true('stages_exact')),
    ('TF02_first_receipt', '/original_first_receipt_resolved', 'is exactly true', 'unresolved first receipt',
     not_true('first_receipt_true')),
    ('TF03_replay_effects', '/replay_effect_count', 'is exactly the integer 0', 'replay/duplicate effect',
     not_true('replay_zero')),
    ('TF04_retry_appends', '/retry_append_count', 'is exactly the integer 0', 'replay/duplicate effect',
     not_true('retry_zero')),
    ('TF05_source_verified', '/current_source_verified', 'is exactly true', 'source/access/restore fence',
     not_true('source_true')),
    ('TF06_access_allowed', '/access_allowed', 'is exactly true', 'source/access/restore fence', not_true('access_true')),
    ('TF07_restore_coherent', '/restore_coherent', 'is exactly true', 'source/access/restore fence', not_true('restore_true')),
])
phase('trace_reader', 'Reader and event revisions and reader authority (validate_case).', [
    ('TR01_reader_revision', '/reader_revision', 'is 1.0.0', 'unsupported revision', not_true('reader_revision_ok')),
    ('TR02_event_revision', '/event_revision', 'is 1.0.0', 'unsupported revision', not_true('event_revision_ok')),
    ('TR03_reader_enabled', '/reader_enabled', 'is exactly true', 'reader withdrawn', not_true('reader_true')),
])
phase('trace_sequence', 'Event sequence within the writer cutoff (validate_case; CV-1100 current_integer, minimum 0).', [
    ('TQ01_sequence_type', '/event_sequence', 'is an exact integer', 'past writer cutoff',
     "value['sequence_refusal'] == 'integer_type'"),
    ('TQ02_sequence_range', '/event_sequence', 'is at least 0', 'past writer cutoff',
     "value['sequence_refusal'] == 'integer_range'"),
    ('TQ03_cutoff_type', '/writer_cutoff_sequence', 'is an exact integer', 'past writer cutoff',
     "value['cutoff_refusal'] == 'integer_type'"),
    ('TQ04_cutoff_range', '/writer_cutoff_sequence', 'is at least 0', 'past writer cutoff',
     "value['cutoff_refusal'] == 'integer_range'"),
    ('TQ05_within_cutoff', '/event_sequence', 'is not above the writer cutoff', 'past writer cutoff', false('within_cutoff')),
])
phase('semantic_checks', 'Family semantic booleans (validate_case).', [
    ('SE01_semantic_exact', '/semantic_checks', 'equals the family semantic set (exact booleans)', 'family semantic boundary',
     not_true('semantics_exact')),
])
phase('descendant_count', 'Folder descendant receipt (validate_case).', [
    ('DS01_descendant_equal', '/descendant_count', 'equals the original descendant count (typed)', 'descendant receipt mismatch',
     false('descendant_equal')),
])
phase('retry_identity', 'Retry preserves the original identity (validate_case).', [
    ('RI01_retry_list', '/retry_identity', 'is an exact list', 'retry identity changed', "value['retry_type'] != 'list'"),
    ('RI02_retry_equal', '/retry_identity', 'equals the recomputed identity', 'retry identity changed', false('retry_equal')),
])
phase('integer_slot', 'CV-1100 current_integer at each declared schema integer slot of a current write.', [
    ('IS01_integer_type', '/{schema integer slot}', 'is an exact integer (never bool, float or decimal)', 'integer_type',
     "value['slot_refusal'] == 'integer_type'"),
    ('IS02_integer_range', '/{schema integer slot}', 'is within the schema minimum/maximum', 'integer_range',
     "value['slot_refusal'] == 'integer_range'"),
])

# ===================================================================== checker integrity (main)
phase('fixture_set', 'Checker fixture set integrity (main).', [
    ('FX01_family_known', '/--family', 'a selected family is one of the twelve', 'incomplete twelve-family fixture set',
     not_true('family_known')),
    ('FX02_twelve_rows', '/rows', 'has exactly twelve rows', 'incomplete twelve-family fixture set', not_true('twelve_rows')),
    ('FX03_family_set', '/rows/*/event_type', 'is exactly the twelve FileManager families', 'incomplete twelve-family fixture set',
     not_true('family_set_exact')),
])
phase('owner_unit', 'Owner unit section lookup (main).', [
    ('OU01_owner_unit_present', '/Plans/FileManager.md', 'has the family owner unit section', 'missing owner unit',
     not_true('unit_present')),
])
phase('owner_adoption', 'Owner unit adoption tokens (main).', [
    ('OA01_owner_token', '/Plans/FileManager.md/{owner unit}', 'the owner unit section contains the adoption token',
     'missing owner adoption', not_true('token_present')),
])
phase('registry_drift', 'Registered value schema equals the companion schema (main).', [
    ('RD01_properties', '/families/{family}/value_schema/properties', 'equals the companion definition',
     'registry/schema drift', not_true('properties_equal')),
    ('RD02_required', '/families/{family}/value_schema/required', 'equals the companion definition', 'registry/schema drift',
     not_true('required_equal')),
    ('RD03_additional', '/families/{family}/value_schema/additionalProperties', 'equals the companion definition',
     'registry/schema drift', not_true('additional_equal')),
    ('RD04_one_of', '/families/{family}/value_schema/oneOf', 'equals the companion definition', 'registry/schema drift',
     not_true('one_of_equal')),
])
phase('registry_custody', 'Registered custody dispositions (main).', [
    ('RC01_required_fields', '/families/{family}/required_fields', 'equals the companion required list',
     'incomplete registered custody', not_true('required_fields_equal')),
    ('RC02_backup_required', '/families/{family}/recovery_disposition/backup_required', 'is set',
     'incomplete registered custody', not_true('backup_required')),
    ('RC03_mutation_fence', '/families/{family}/restore_disposition/mutation_fence_on_unresolved', 'is set',
     'incomplete registered custody', not_true('mutation_fence')),
])
phase('registry_defs', 'Registered embedded definitions equal the companion schema (main).', [
    ('RX01_embedded_defs', '/families/{family}/value_schema/$defs', 'equal the companion $defs', 'embedded logical schema drift',
     not_true('defs_equal')),
])
phase('registry_failures', 'Aggregate Storage registry data contract (main).', [
    ('RF01_registry_data', '/Plans/storage_value_registry.json', 'has no aggregate registry data failure',
     'Storage registry contract failures', not_true('no_failures')),
])


HEADER = '''"""DFM guard table {name}: {doc}

Method B guard rows for scripts/pm-filemanager-event-contracts.py, generated by
scripts/pm-filemanager-table-generate.py. Each predicate reads one observation
record that the lane checker derives from the complete boundary input
(recomputed keys, identities and digests, exact types, resolved rows); a
predicate never recomputes, repairs or calls helpers. The checker refuses
only through these rows, in this order (table_refusals in the checker).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g
'''


def emit(name, doc, rows):
    fields = []
    for row in rows:
        for f in re.findall(r"value\['(\w+)'\]", row[4]):
            if f not in fields:
                fields.append(f)
    out = [HEADER.format(name=name, doc=doc), '\nFIELDS = ' + repr(tuple(fields)) + '\n']
    for rname, field, words, code, body in rows:
        out.append(f'\n\ndef {rname}(value, context):\n    return {code!r} if {body} else None\n')
    out.append('\n\ndef case(value):\n    context = None\n    table = g.GuardTable([\n')
    for rname, field, words, code, _ in rows:
        out.append(f'        g.Guard({rname!r}, g.Invariant({field!r}, {words!r}), {code!r}, {rname}),\n')
    out.append('    ])\n\n    def check(value):\n')
    for rname, *_ in rows:
        out.append(f'        table.require({rname!r}, value, context)\n')
    out.append('        return True\n    return g.Case(table, check, context)\n')
    return ''.join(out)


def main():
    check = '--check' in sys.argv[1:]
    names = [r[0] for _, rows in PHASES.values() for r in rows]
    assert len(names) == len(set(names)), 'duplicate row name'
    wanted = {OUT / f'{PREFIX}{name}.py': emit(name, doc, rows) for name, (doc, rows) in PHASES.items()}
    present = set(OUT.glob(f'{PREFIX}*.py'))
    problems = sorted(str(p.relative_to(ROOT)) for p in present - set(wanted))
    for path, text in wanted.items():
        if check:
            if not path.exists() or path.read_text() != text:
                problems.append(str(path.relative_to(ROOT)))
        else:
            path.write_text(text)
    if not check:
        for path in present - set(wanted):
            path.unlink()
    print(f'{len(wanted)} tables, {len(names)} rows' + (f'; stale or extra: {problems}' if problems else ''))
    return 1 if check and problems else 0


if __name__ == '__main__':
    sys.exit(main())

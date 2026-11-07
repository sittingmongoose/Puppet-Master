#!/usr/bin/env python3
"""Write the DG6B Method B phase-table modules (scripts/pm_dg6b_table_*.py) from one row spec.

Usage: python3 scripts/pm-dg6b-table-generate.py scripts [--check]
Spec rows: (name, field, words, code, condition). The condition is the exact refusal
predicate over the phase observation; the row returns its code when it holds.
One module per phase table, at most seven rows each, so the shared tool certifies
small modules. The generated modules are the checked-in source of truth: regenerate
and diff (or pass --check) after editing a row here.

Splitting rule. A sequential or-chain refusal (``if a or b: refuse``) becomes one
row per predicate in the same order. When a later predicate would also hold for an
input that an earlier row already refuses, the later row carries the earlier rows'
pass condition as its applicability, so every defect is refused by exactly one row
and the rows together refuse exactly what the original chain refused.
"""
import re
import sys
from pathlib import Path

PROTECTED = ('assistant', 'general-purpose', 'overseer', 'bash', 'teacher', 'collaborator',
             'researcher', 'deep-researcher', 'explorer')

PHASES = []


def phase(name, doc, rows, constants=''):
    assert len(rows) <= 7, name
    PHASES.append((name, doc, rows, constants))


def schema_row(name, field, words, code):
    return (name, field, words, code, "value['errors'] != 0")


def join(name, field, words, left, right, code):
    assert left != right, name  # a join never compares a field with itself
    return (name, field, words, code, f"value[{left!r}] != value[{right!r}]")


# ------------------------------------------------------------- shared fences
phase('json', 'Strict JSON text: unique object keys and valid JSON.', [
    ('J01_unique_keys', '/duplicate_keys', 'no JSON object repeats a key', 'duplicate_json_key', "value['duplicate_keys'] != 0"),
    ('J02_valid_json', '/invalid', 'the text parses as strict JSON', 'invalid_json', "value['invalid'] is not False"),
])
phase('references', 'Selected schema documents: metaschema validity and eager reference resolution.', [
    ('R01_metaschema', '/metaschema_errors', 'every selected schema document is a valid Draft 2020-12 schema', 'invalid_schema',
     "value['metaschema_errors'] != 0"),
    ('R02_references_resolve', '/unresolved', 'every $ref and $dynamicRef resolves, including unused definitions and branches',
     'unresolved_schema_ref', "value['unresolved'] != 0"),
])
phase('preparation_a', 'Prepared-oracle fences: fixture and grade coverage, disposition.', [
    join('PR01_fixture_families', '/fixture_families', 'equals the nineteen DG6B families', 'fixture_families', 'expected_families',
         'fixture_family_coverage'),
    ('PR02_fixture_rows', '/fixture_rows', 'is one fixture row per DG6B family (family set equal)', 'fixture_family_coverage',
     "value['fixture_families'] == value['expected_families'] and value['fixture_rows'] != len(value['expected_families'])"),
    join('PR03_grade_families', '/grade_families', 'equals the nineteen DG6B families', 'grade_families', 'expected_families',
         'grade_family_coverage'),
    ('PR04_undispositioned', '/dispositions', 'every graded row is UNDISPOSITIONED', 'unadmitted_disposition',
     "value['dispositions'].count('UNDISPOSITIONED') != len(value['dispositions'])"),
])
phase('preparation_b', 'Prepared-oracle fences: no admission, pending retention, operation schema binding.', [
    ('PR05_unregistered', '/registered', 'no DG6B family is on the live registry', 'prepared_membership',
     "value['registered'] != []"),
    ('PR06_retention_pending', '/retention_refs', 'every operation value family has PENDING_RETENTION_DECISION', 'retention_pending',
     "value['retention_refs'].count('PENDING_RETENTION_DECISION') != len(value['retention_refs'])"),
    ('PR07_value_schema_valid', '/value_schema_errors', 'every registered operation value schema is a valid schema', 'invalid_schema',
     "value['value_schema_errors'] != 0"),
    ('PR08_operation_binding', '/value_schema_digests', 'equals the DG6B operation definitions (value schemas valid)',
     'operation_schema_binding',
     "value['value_schema_errors'] == 0 and value['value_schema_digests'] != value['operation_definition_digests']"),
])

# ------------------------------------------------------------- schema occurrences
for kind, words in [('record', 'the closed record adapter'), ('source', 'the closed family source adapter'),
                    ('history', 'the closed retained-history adapter'), ('storage', 'the closed Storage record adapter'),
                    ('resolved', 'the closed resolved payload adapter')]:
    phase('adapter_' + kind, 'Schema occurrence: ' + words + '.', [
        schema_row('A' + kind[0].upper() + '01_' + kind + '_adapter', '/errors', words + ' reports no error', 'adapter_schema')])
phase('event_record', 'Schema occurrence: the canonical EventRecord envelope.', [
    schema_row('ER01_event_record', '/errors', 'Plans/event_record.schema.json reports no error', 'event_record_schema')])
phase('payload_schema', 'Schema occurrence: the exact family payload.', [
    schema_row('PS01_payload', '/errors', 'the exact family payload schema reports no error', 'payload_schema')])
phase('envelope_payload_schema', 'Schema occurrence: the inline EventRecord payload body.', [
    schema_row('EP01_envelope_payload', '/errors', 'the inline envelope payload passes the family payload schema', 'payload_schema')])
phase('payload_types', 'Schema occurrence: the family payload type shape at relational helpers.', [
    schema_row('PT01_payload_types', '/errors', 'the family payload type shape reports no error', 'payload_types')])
phase('source_scope', 'Schema occurrence: the source WorkflowScopeV2 with strict identifier ends.', [
    schema_row('SC01_source_scope', '/errors', 'the source scope passes WorkflowScopeV2 with formats', 'scope')])
phase('persona_scope_schema', 'Schema occurrence: the Persona payload WorkflowScopeV2 key input.', [
    schema_row('PSS01_payload_scope', '/errors', 'the payload scope passes strict WorkflowScopeV2', 'scope')])
phase('checkpoint_schema', 'Schema occurrence: the durable read token.', [
    schema_row('CK01_read_token', '/errors', 'the durable read token passes the live-only-free read_token schema', 'checkpoint_schema')])
phase('owner_io_request', 'Schema occurrence: the Persona owner request.', [
    schema_row('OQ01_owner_request', '/errors', 'the owner request passes its persona_<verb>_request_v2 schema', 'source_io_schema')])
phase('owner_io_result', 'Schema occurrence: the Persona owner result.', [
    schema_row('OR01_owner_result', '/errors', 'the owner result passes its persona_<verb>_result_v2 schema', 'source_io_schema')])
phase('selected_result_schema', 'Schema occurrence: the persona.select owner result.', [
    schema_row('SR01_selected_result', '/errors', 'the selection result passes persona_select_result_v2', 'selected_result_schema')])
phase('resolution_schema', 'Schema occurrence: the frozen selection resolution.', [
    schema_row('RS01_resolution', '/errors', 'the resolution passes persona_selected_resolution', 'resolution_schema')])
phase('resolution_storage_schema', 'Schema occurrence: the stored resolution carrier.', [
    schema_row('RT01_resolution_carrier', '/errors', 'the resolution carrier passes persona_selected_resolution_storage',
               'resolution_storage_schema')])
phase('operation_schema', 'Schema occurrence: the physical operation value.', [
    schema_row('OP01_operation', '/errors', 'the physical operation value passes <family>_operation', 'operation_schema')])
phase('operation_logical_schema', 'Schema occurrence: the decoded logical operation.', [
    schema_row('OG01_logical_operation', '/errors', 'the decoded operation passes the logical <family>_operation branch',
               'operation_schema')])

# ------------------------------------------------------------- append policy and retry
phase('append_policy', 'Current-writer replay policy.', [
    ('AP01_not_replay_only', '/replay_policy', 'is not projector_replay_only for a current append', 'replay_only_not_appendable',
     "value['replay_policy'] == 'projector_replay_only'"),
    ('AP02_dedupe', '/replay_policy', 'is dedupe_by_idempotency_key (any other non-replay-only policy)', 'writer_replay_policy',
     "value['replay_policy'] not in ('dedupe_by_idempotency_key', 'projector_replay_only')"),
])
phase('retry', 'Retry against the verified original append.', [
    join('RY01_event_id', '/event_id', 'equals the original event_id', 'event_id', 'original_event_id', 'retry_identity'),
    ('RY02_idempotency_key', '/idempotency_key', 'equals the original idempotency_key (event_id equal)', 'retry_identity',
     "value['event_id'] == value['original_event_id'] and value['idempotency_key'] != value['original_idempotency_key']"),
    ('RY03_semantic_body', '/semantic_digest', 'the caller semantic EventRecord body equals the original (identity equal)',
     'idempotency_conflict',
     "value['event_id'] == value['original_event_id'] and value['idempotency_key'] == value['original_idempotency_key'] "
     "and value['semantic_digest'] != value['original_semantic_digest']"),
])

# ------------------------------------------------------------- source, scope and identity
phase('source_grants', 'Event-writer admission and source access.', [
    ('SG01_writer', '/writer_current', 'is exactly True', 'writer', "value['writer_current'] is not True"),
    ('SG02_access', '/access_current', 'is exactly True', 'access', "value['access_current'] is not True"),
])
phase('frozen_source', 'Frozen at-write source custody.', [
    join('FS01_frozen_payload', '/payload', 'equals the frozen source payload (exact typed bytes)', 'payload_digest',
         'frozen_payload_digest', 'original_source_join'),
    join('FS02_storage_instance', '/payload/storage_instance_id', 'equals the source storage_instance_id (exact typed bytes)',
         'payload_storage_digest', 'source_storage_digest', 'original_source_join'),
])
phase('auth_scope', 'GitHub auth families are application scoped.', [
    ('AU01_application', '/scope/scope_kind', 'is application', 'scope', "value['scope_kind'] != 'application'"),
])
phase('partition', 'Encoded scope partition of the source scope and the record.', [
    join('PA01_scope_partition', '/scope/scope_partition', 'equals app or project~ base64url(project_id)', 'scope_partition',
         'expected_partition', 'partition'),
    join('PA02_record_partition', '/scope_partition', 'equals app or project~ base64url(project_id)', 'envelope_partition',
         'expected_partition', 'partition'),
])
phase('identity_event', 'Event ID recomputed from the family identity recipe.', [
    join('ID01_event_id', '/event_id', 'equals the recomputed family event_id', 'event_id', 'expected_event_id', 'identity'),
])
phase('identity_key', 'Idempotency key recomputed from the family recipe (CV-366 for application scope).', [
    join('IK01_idempotency_key', '/idempotency_key', 'equals the recomputed idempotency key', 'idempotency_key',
         'expected_idempotency_key', 'idempotency_key'),
])
phase('original_server', 'Application-scope key input: the original Server.', [
    ('OS01_server_string', '/server_id', 'is a str', 'original_server_required', "type(value['server_id']) is not str"),
    ('OS02_server_nonempty', '/server_id', 'is not empty', 'original_server_required', "value['server_id'] == ''"),
])
phase('semantic_scope', 'Auth identity input scope key.', [
    ('SS01_application_key', '/scope_key', 'is application', 'scope', "value['scope_key'] != 'application'"),
])
phase('semantic_original', 'Retry semantic payload against the original payload.', [
    join('SO01_original_payload', '/payload', 'equals the original payload (exact typed bytes)', 'payload_digest',
         'original_payload_digest', 'original_payload_conflict'),
])
phase('hook_block', 'Only execution-flow hooks may block.', [
    ('HB01_execution_hook', '/hook_name', 'is pre_tool_invoke, pre_attempt_start or pre_node_dispatch', 'observation_only_hook',
     "value['hook_name'] not in ('pre_tool_invoke', 'pre_attempt_start', 'pre_node_dispatch')"),
])
phase('cadence', 'Device-flow poll cadence.', [
    join('CD01_poll_interval', '/poll_interval_seconds', 'is previous+5 after slow_down, otherwise previous',
         'poll_interval_seconds', 'expected_interval_seconds', 'cadence'),
])
phase('envelope_a', 'EventRecord fields joined to the family, payload and source (part a).', [
    join('EJ01_event_type', '/event_record/event_type', 'equals the family', 'event_type', 'family', 'envelope_source_join'),
    join('EJ02_payload_schema_id', '/event_record/payload_schema_id', 'equals the family payload schema id',
         'payload_schema_id', 'expected_payload_schema_id', 'envelope_source_join'),
    join('EJ03_occurred_at', '/event_record/occurred_at_utc', 'equals payload ts', 'occurred_at_utc', 'ts', 'envelope_source_join'),
    join('EJ04_actor_ref', '/event_record/actor_ref', 'equals the source actor_ref', 'actor_ref', 'source_actor_ref',
         'envelope_source_join'),
    ('EJ05_redaction_profile', '/event_record/redaction_profile', 'is secret_refs_only', 'envelope_source_join',
     "value['redaction_profile'] != 'secret_refs_only'"),
    join('EJ06_scope_kind', '/event_record/scope_kind', 'equals the source scope kind', 'scope_kind', 'source_scope_kind',
         'envelope_source_join'),
    ('EJ07_project_id', '/event_record/project_id', 'equals the source scope project_id (scope kinds equal)',
     'envelope_source_join',
     "value['scope_kind'] == value['source_scope_kind'] and value['project_id'] != value['source_project_id']"),
])
phase('envelope_b', 'EventRecord fields joined to the source accounts and runtime lineage (part b).', [
    join('EJ08_requested_account', '/event_record/requested_account_ref', 'equals the source requested account',
         'requested_account_ref', 'source_requested_account_ref', 'envelope_source_join'),
    join('EJ09_effective_account', '/event_record/effective_account_ref', 'equals the source effective account',
         'effective_account_ref', 'source_effective_account_ref', 'envelope_source_join'),
    join('EJ10_thread_id', '/event_record/thread_id', 'equals payload runtime_lineage thread_id', 'thread_id', 'lineage_thread_id',
         'envelope_source_join'),
    join('EJ11_run_id', '/event_record/run_id', 'equals payload runtime_lineage run_id', 'run_id', 'lineage_run_id',
         'envelope_source_join'),
    join('EJ12_node_id', '/event_record/node_id', 'equals payload runtime_lineage node_id', 'node_id', 'lineage_node_id',
         'envelope_source_join'),
    join('EJ13_attempt_id', '/event_record/attempt_id', 'equals payload runtime_lineage attempt_id', 'attempt_id',
         'lineage_attempt_id', 'envelope_source_join'),
])
phase('payload_transport', 'Inline envelope body equals the payload; a referenced body is the empty object.', [
    join('PJ01_body_copy', '/event_record/payload', 'equals the payload inline, or {} with payload_ref', 'envelope_payload_digest',
         'expected_payload_digest', 'payload_transport_join'),
])
phase('checkpoint_join', 'Durable read token joined to the payload Storage instance.', [
    join('CJ01_token_storage', '/durable_read_token/storage_instance_id', 'equals the payload storage_instance_id',
         'token_storage_instance_id', 'payload_storage_instance_id', 'checkpoint_storage_join'),
    join('CJ02_selection_storage', '/durable_read_token/source_selection/storage_instance_id',
         'equals the payload storage_instance_id', 'selection_storage_instance_id', 'payload_storage_instance_id',
         'checkpoint_storage_join'),
    join('CJ03_checkpoint_key', '/durable_read_token/checkpoint_key', 'is event_record_index_checkpoint.v1:<storage_instance_id>',
         'checkpoint_key', 'expected_checkpoint_key', 'checkpoint_storage_join'),
])

# ------------------------------------------------------------- SP-337 byte stages
phase('inline_size', 'SP-337 inline body limit.', [
    ('IS01_inline_limit', '/body_size', 'an inline body is at most 16384 canonical bytes', 'inline_body_too_large',
     "value['body_size'] > 16384"),
])
phase('reference', 'SP-337 payload reference availability.', [
    ('RA01_resolved_present', '/resolved', 'the referenced body was resolved', 'payload_ref_unavailable',
     "value['resolved_present'] is not True"),
    ('RA02_resolved_ref', '/resolved/ref', 'equals the payload reference (resolved)', 'payload_ref_unavailable',
     "value['resolved_present'] is True and value['resolved_ref'] != value['payload_ref']"),
    ('RA03_durable', '/resolved/durable', 'is exactly True (resolved)', 'payload_ref_unavailable',
     "value['resolved_present'] is True and value['durable'] is not True"),
    ('RA04_access_current', '/resolved/access_current', 'is exactly True (resolved)', 'payload_ref_unavailable',
     "value['resolved_present'] is True and value['access_current'] is not True"),
])
phase('transport_integrity', 'SP-337 resolved body integrity.', [
    join('TI01_blake3', '/resolved/blake3_id', 'equals BLAKE3 of the body bytes', 'resolved_blake3', 'body_blake3',
         'payload_ref_integrity'),
    join('TI02_byte_size', '/resolved/byte_size', 'equals the body length', 'resolved_size', 'body_size', 'payload_ref_integrity'),
    ('TI03_media_type', '/resolved/media_type', 'is application/msgpack', 'payload_ref_integrity',
     "value['media_type'] != 'application/msgpack'"),
    join('TI04_bytes', '/resolved/bytes_hex', 'decodes to exactly the body bytes', 'resolved_bytes_digest', 'body_bytes_digest',
         'payload_ref_integrity'),
])
phase('operation_size', 'SP-337 physical operation value limit.', [
    ('OV01_operation_limit', '/value', 'the physical operation value is at most 16384 canonical bytes', 'operation_value_too_large',
     "value['size'] > 16384"),
])
phase('operation_ref', 'Operation carrier reference integrity.', [
    join('OF01_ref_blake3', '/value/payload_ref/blake3_id', 'equals the resolved blake3_id', 'ref_blake3', 'resolved_blake3',
         'payload_ref_integrity'),
    join('OF02_ref_size', '/value/payload_ref/byte_size', 'equals the resolved byte_size', 'ref_size', 'resolved_size',
         'payload_ref_integrity'),
    # media_type: decided by OP01 (const application/msgpack) and TI03 (resolved media).
    ('OF04_decodes', '/resolved/bytes_hex', 'the referenced body decodes as MessagePack', 'payload_ref_integrity',
     "value['decoded'] is not True"),
    ('OF05_canonical', '/resolved/bytes_hex', 'the decoded body re-encodes to exactly the same canonical bytes (decoded)',
     'payload_ref_integrity', "value['decoded'] is True and value['reencoded_digest'] != value['body_digest']"),
])
# The former carrier-header join (schema_id, schema_version, event_type of the
# reference carrier against the decoded operation) is decided by two schema rows:
# OP01 and OG01 bind both copies to the same per-family constants.
phase('operation_source', 'Recovered operation equals the operation built from the verified append.', [
    join('OJ01_operation_source', '/logical', 'equals the expected operation (exact typed bytes)', 'logical_digest',
         'expected_digest', 'operation_source_join'),
])
phase('resolution_size', 'SP-337 resolution value limit.', [
    ('RZ01_resolution_limit', '/value', 'the physical resolution value is at most 16384 canonical bytes',
     'resolution_value_too_large', "value['size'] > 16384"),
])
phase('resolution_ref', 'Resolution carrier reference integrity.', [
    join('RF01_ref_blake3', '/value/payload_ref/blake3_id', 'equals the resolved blake3_id (exact typed bytes)', 'ref_blake3',
         'resolved_blake3', 'payload_ref_integrity'),
    join('RF02_ref_size', '/value/payload_ref/byte_size', 'equals the resolved byte_size (exact typed bytes)', 'ref_size',
         'resolved_size', 'payload_ref_integrity'),
    # media_type: decided by RT01 (const application/msgpack) and TI03 (resolved media).
    ('RF04_decodes', '/resolved/bytes_hex', 'the referenced body decodes as MessagePack', 'payload_ref_integrity',
     "value['decoded'] is not True"),
    ('RF05_canonical', '/resolved/bytes_hex', 'the decoded body re-encodes to exactly the same canonical bytes (decoded)',
     'payload_ref_integrity', "value['decoded'] is True and value['reencoded_digest'] != value['body_digest']"),
])
phase('resolution_source', 'Recovered resolution equals the frozen source resolution.', [
    join('RJ01_resolution_source', '/logical', 'equals the source resolution (exact typed bytes)', 'logical_digest',
         'expected_digest', 'resolution_source_join'),
])

# ------------------------------------------------------------- retained history
phase('history_flags', 'Retained-history provenance, withdrawal and access flags.', [
    ('HF01_retained', '/retained', 'is exactly True', 'historical_provenance', "value['retained'] is not True"),
    ('HF02_authentic', '/authentic', 'is exactly True', 'historical_provenance', "value['authentic'] is not True"),
    ('HF03_admitted_when_written', '/admitted_when_written', 'is exactly True', 'historical_provenance',
     "value['admitted_when_written'] is not True"),
    ('HF04_family_withdrawn', '/family_withdrawn', 'is exactly False', 'historical_withdrawn',
     "value['family_withdrawn'] is not False"),
    ('HF05_reader_current', '/reader_current', 'is exactly True', 'historical_withdrawn', "value['reader_current'] is not True"),
    ('HF06_access_current', '/access_current', 'is exactly True', 'historical_access', "value['access_current'] is not True"),
    ('HF07_body_deleted', '/body_deleted', 'is exactly False', 'historical_access', "value['body_deleted'] is not False"),
])
phase('history_storage', 'Retained original joined to the authenticated Storage record.', [
    ('HS01_authenticated', '/storage_record/authenticated', 'is exactly True', 'historical_storage_source',
     "value['authenticated'] is not True"),
    join('HS02_storage_instance', '/storage_record/storage_instance_id', 'equals the original read token storage_instance_id',
         'storage_instance_id', 'token_storage_instance_id', 'historical_storage_join'),
    join('HS03_scope_partition', '/storage_record/scope_partition', 'equals the original scope_partition', 'scope_partition',
         'original_scope_partition', 'historical_storage_join'),
    join('HS04_record_bytes', '/storage_record/event_record_bytes_hex', 'equals the hex of the original canonical EventRecord bytes',
         'storage_hex_digest', 'record_hex_digest', 'historical_storage_record'),
])

# ------------------------------------------------------------- Persona relational rules
phase('persona_scope', 'Persona scope key and request scope.', [
    join('PC01_scope_key', '/scope', 'the payload scope key equals the supplied scope key', 'scope_key', 'expected_scope_key',
         'scope'),
    join('PC02_request_scope', '/scope', 'equals the owner request scope (exact typed bytes)', 'scope_digest',
         'request_scope_digest', 'scope'),
])
phase('persona_partition', 'Persona Project scope partition.', [
    join('PP01_project_partition', '/scope/scope_partition', 'equals project~ base64url(project_id)', 'scope_partition',
         'expected_partition', 'partition'),
])
phase('persona_home', 'A Project home lives in its Project scope.', [
    ('PH01_project_home_scope', '/home_kind', 'a Project home has Project scope', 'home_scope',
     "value['home_kind'] == 'project' and value['scope_kind'] != 'project'"),
    ('PH02_project_home_id', '/home_project_id', 'a Project home names the scope Project (Project scope)', 'home_scope',
     "value['home_kind'] == 'project' and value['scope_kind'] == 'project' and value['home_project_id'] != value['project_id']"),
])
phase('persona_library_home', 'A library home is written in application scope.', [
    ('PL01_library_home_scope', '/home_kind', 'a library home has application scope', 'home_scope',
     "value['home_kind'] == 'library' and value['scope_kind'] != 'application'"),
])
phase('definition_writer', 'Persona definition-write lease.', [
    ('DW01_definition_writer', '/definition_writer_current', 'is exactly True', 'definition_writer',
     "value['definition_writer_current'] is not True"),
])
phase('persona_mutation', 'Persona mutations: no Computer mirror and no protected core target.', [
    ('PM01_not_mirror', '/computer_mirror', 'is exactly False', 'mirror', "value['computer_mirror'] is not False"),
    ('PM02_not_protected', '/protected_id', 'is exactly False', 'protected', "value['protected_id'] is not False"),
    ('PM03_target_not_protected', '/persona_id', 'is not one of the nine protected core Persona IDs (Personas section 6)',
     'protected_identity', "value['persona_id'] in PROTECTED_PERSONA_IDS"),
], constants='PROTECTED_PERSONA_IDS = ' + repr(PROTECTED) + '\n')
phase('persona_confirmation', 'Persona delete confirmation.', [
    ('PF01_confirmation', '/confirmation_current', 'is exactly True', 'confirmation', "value['confirmation_current'] is not True"),
])
phase('persona_cas_lease', 'Persona compare-and-set lease.', [
    ('PK01_cas_current', '/cas_current', 'is exactly True', 'cas', "value['cas_current'] is not True"),
])
phase('persona_source_trust', 'Persona import source verification.', [
    ('PV01_source_verified', '/source_verified', 'is exactly True', 'source_trust', "value['source_verified'] is not True"),
])
phase('persona_reach', 'Application-scope selection reach.', [
    ('PX01_reach', '/reach_allows_no_project', 'is exactly True', 'reach', "value['reach_allows_no_project'] is not True"),
])
phase('persona_request_ref', 'Owner request reference custody.', [
    join('RQ01_owner_request_ref', '/owner_request_ref', 'equals the source owner_request_ref (exact typed bytes)',
         'owner_request_ref_digest', 'source_owner_request_ref_digest', 'original_source_join'),
])
REQUEST_KEYS = ('command_id', 'client_id', 'persona_id', 'source_id', 'source_revision', 'source_sha256',
                'project_version_id', 'reach_ref', 'expected_owner_revision', 'return_context_ref')
RESULT_KEYS = (('command_id', 'command_id'), ('operation_id', 'operation_id'), ('persona_id', 'persona_id'),
               ('revision', 'owner_revision'), ('content_sha256', 'content_sha256'), ('result_status', 'status'),
               ('owner_result_ref', 'owner_result_ref'), ('owner_readback_ref', 'readback_ref'),
               ('return_context_ref', 'return_context_ref'))


def copy_rows(prefix, pairs, source, code='original_source_join'):
    rows = []
    for i, (pk, sk) in enumerate(pairs, 1):
        rows.append(join(f'{prefix}{i:02}_{pk}', '/' + pk, f'equals the {source} {sk} (exact typed bytes)',
                         'payload_' + pk + '_digest', source + '_' + sk + '_digest', code))
    return rows


request_rows = copy_rows('QK', [(k, k) for k in REQUEST_KEYS], 'request')
phase('persona_request_a', 'Payload fields equal the owner request (part a).', request_rows[:5])
phase('persona_request_b', 'Payload fields equal the owner request (part b).', request_rows[5:])
result_rows = copy_rows('RR', RESULT_KEYS, 'result')
phase('persona_result_a', 'Payload fields equal the owner result (part a).', result_rows[:5])
phase('persona_result_b', 'Payload fields equal the owner result (part b).', result_rows[5:])
phase('persona_home_copy', 'Payload home and content digest equal the owner request.', [
    join('HC01_home_ref', '/home_ref', 'equals the request destination_home_ref (exact typed bytes)', 'payload_home_ref_digest',
         'request_destination_home_ref_digest', 'original_source_join'),
    join('HC02_content_sha256', '/content_sha256', 'equals the request whole_record_sha256 (exact typed bytes)',
         'payload_content_sha256_digest', 'request_whole_record_sha256_digest', 'original_source_join'),
])
DUP = "value['command_id'] == 'cmd.persona.duplicate'"
NOT_DUP = "value['command_id'] != 'cmd.persona.duplicate'"
phase('persona_creation', 'Create and duplicate source rules.', [
    ('CR01_duplicate_source_id', '/source_id', 'a duplicate names its source_id', 'creation_source',
     f"{DUP} and value['source_id'] is None"),
    ('CR02_duplicate_source_revision', '/source_revision', 'a duplicate names its source_revision', 'creation_source',
     f"{DUP} and value['source_revision'] is None"),
    ('CR03_duplicate_source_sha256', '/source_sha256', 'a duplicate names its source_sha256', 'creation_source',
     f"{DUP} and value['source_sha256'] is None"),
    ('CR04_duplicate_distinct_target', '/source_id', 'a duplicate source differs from the new persona_id (source named)',
     'creation_source', f"{DUP} and value['source_id'] is not None and value['source_id'] == value['persona_id']"),
    ('CR05_duplicate_status', '/result_status', 'a duplicate reports duplicated', 'creation_source',
     f"{DUP} and value['result_status'] != 'duplicated'"),
    ('CR06_create_source_all_or_none', '/source_id', 'a plain create names all three source fields or none', 'creation_source',
     f"{NOT_DUP} and [value['source_id'] is None, value['source_revision'] is None, value['source_sha256'] is None].count(True) not in (0, 3)"),
    ('CR07_create_status', '/result_status', 'a plain create reports created', 'creation_source',
     f"{NOT_DUP} and value['result_status'] != 'created'"),
])
phase('persona_delete_cas', 'Delete compares against the removed revision.', [
    join('DC01_expected_revision', '/expected_owner_revision', 'equals the removed revision', 'expected_owner_revision',
         'revision', 'cas'),
])
phase('persona_update_cas', 'Update source identity, revision and order.', [
    ('UC01_expected_is_source_revision', '/expected_owner_revision', 'equals source_revision (source_revision named)', 'cas',
     "value['source_revision'] is not None and value['expected_owner_revision'] != value['source_revision']"),
    ('UC02_source_is_target', '/source_id', 'equals persona_id (source_id named)', 'cas',
     "value['source_id'] is not None and value['source_id'] != value['persona_id']"),
    ('UC03_source_id_named', '/source_id', 'is not null', 'cas', "value['source_id'] is None"),
    ('UC04_source_revision_named', '/source_revision', 'is not null', 'cas', "value['source_revision'] is None"),
    ('UC05_source_sha256_named', '/source_sha256', 'is not null', 'cas', "value['source_sha256'] is None"),
    ('UC06_revision_order', '/revision', 'is greater than expected_owner_revision (both integers)', 'cas',
     "type(value['expected_owner_revision']) is int and type(value['revision']) is int "
     "and value['expected_owner_revision'] >= value['revision']"),
])
phase('persona_import_source', 'An import names its verified source.', [
    ('IM01_source_id', '/source_id', 'is not null', 'source_trust', "value['source_id'] is None"),
    ('IM02_source_revision', '/source_revision', 'is not null', 'source_trust', "value['source_revision'] is None"),
    ('IM03_source_sha256', '/source_sha256', 'is not null', 'source_trust', "value['source_sha256'] is None"),
])
NO_OVERRIDE = "value['override_scope'] is None"
# Owner presence is decided by the persona.selected payload schema (override null
# makes the owner const null; an override makes it a nonempty string): no rows here.
phase('persona_override_empty', 'No override: an empty runtime lineage.', [(f'OE{i:02}_{k}', '/runtime_lineage/' + k, 'is null without an override', 'override_lineage',
      f"{NO_OVERRIDE} and value['lineage_{k}'] is not None")
     for i, k in enumerate(('thread_id', 'run_id', 'node_id', 'attempt_id', 'actor_id'), 1)])
SET = "value['override_scope'] is not None"
phase('persona_override_set', 'An override names its lineage owner.', [
    ('OO02_owner_not_tier', '/persona_override_owner_id', 'is not the literal tier_id', 'override_lineage',
     f"{SET} and value['override_owner'] == 'tier_id'"),
    ('OO03_owner_is_lineage', '/persona_override_owner_id', 'equals runtime_lineage <scope>_id (named, not tier_id)',
     'override_lineage',
     f"{SET} and value['override_owner'] is not None and value['override_owner'] != 'tier_id' "
     "and value['override_owner'] != value['lineage_owner']"),
])
phase('persona_lineage_copy', 'Runtime lineage equals the frozen resolution.', [
    join('LC01_runtime_lineage', '/runtime_lineage', 'equals the resolution runtime_lineage (exact typed bytes)',
         'lineage_digest', 'resolution_lineage_digest', 'original_source_join'),
])
RESOLUTION_KEYS = ('requested_persona', 'effective_persona', 'persona_selection_source', 'selection_reason',
                   'persona_override_scope', 'persona_override_owner_id', 'runtime_snapshot_ref', 'runtime_snapshot_sha256',
                   'operation_id', 'persona_id', 'owner_result_ref', 'selection_target_ref')
resolution_rows = copy_rows('SL', [(k, k) for k in RESOLUTION_KEYS], 'resolution')
phase('persona_resolution_a', 'Selection payload equals the frozen resolution (part a).', resolution_rows[:6])
phase('persona_resolution_b', 'Selection payload equals the frozen resolution (part b).', resolution_rows[6:])

HEADER = '''"""DG6B guard table {name}: {doc}

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g
'''


def emit(name, doc, rows, constants):
    fields = []
    for row in rows:
        for f in re.findall(r"value\['(\w+)'\]", row[4]):
            if f not in fields:
                fields.append(f)
    out = [HEADER.format(name=name, doc=doc)]
    if constants:
        out.append('\n' + constants)
    out.append('\nFIELDS = ' + repr(tuple(fields)) + '\n')
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
    out = Path(sys.argv[1])
    check = '--check' in sys.argv[2:]
    names = [p[0] for p in PHASES]
    assert len(names) == len(set(names))
    rows = [r[0] for p in PHASES for r in p[2]]
    stale = []
    for name, doc, phase_rows, constants in PHASES:
        assert len({r[0] for r in phase_rows}) == len(phase_rows), name
        path = out / f'pm_dg6b_table_{name}.py'
        text = emit(name, doc, phase_rows, constants)
        if check:
            if not path.exists() or path.read_text() != text:
                stale.append(path.name)
        else:
            path.write_text(text)
    known = {f'pm_dg6b_table_{n}.py' for n in names}
    extra = sorted(p.name for p in out.glob('pm_dg6b_table_*.py') if p.name not in known)
    print(f'phases {len(PHASES)} rows {len(rows)} distinct_row_names {len(set(rows))}'
          + (f' stale {stale} extra {extra}' if check else ''))
    return 1 if check and (stale or extra) else 0


if __name__ == '__main__':
    sys.exit(main())

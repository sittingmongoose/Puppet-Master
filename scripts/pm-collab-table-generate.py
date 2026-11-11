#!/usr/bin/env python3
"""Write the DC Method B guard-table modules (scripts/pm_collab_table_*.py) from one row spec.

Usage: python3 scripts/pm-collab-table-generate.py [--check]
Each spec row is (name, field, words, code, body); body is the refusal condition (one expression)
or a list of statement lines. One module per phase table, at most seven rows each, so the shared
tool (scripts/pm_guard_isolation.py) certifies small modules. The generated modules are the
checked-in source of truth; regenerate and diff after editing a row here. --check fails when a
module is stale, missing or extra.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'scripts'
FAMILIES = ('collaboration.created', 'collaboration.started', 'collaboration.paused', 'collaboration.resumed',
            'collaboration.cancelled', 'collaboration.completed', 'collaboration.failed',
            'collaboration.participant_started', 'collaboration.participant_completed',
            'collaboration.message_added', 'collaboration.artifact_added', 'collaboration.configuration_changed',
            'brainstorm.proposal_added', 'brainstorm.vote_added', 'brainstorm.plan_synthesized',
            'review.finding_added', 'review.finding_dispositioned', 'review.artifact_finalized')
DEDUPE = "'dedupe_by_idempotency_key'"
PHASES = {}


def phase(name, doc, rows):
    assert name not in PHASES and 1 <= len(rows) <= 7, name
    PHASES[name] = (doc, rows)


def same(a, b):
    """Canonical-byte join: either side unencodable or the two digests differ."""
    return f"value['{a}'] is None or value['{a}'] != value['{b}']"


# ================================================================ decision layer: payload (CV-460)
phase('payload_object', 'CV-460 payload layer 1: the payload is a JSON object.', [
    ('PO01_payload_object', '/payload', 'is a JSON object', 'schema', "value['payload_is_object'] is not True"),
])
phase('payload_schema', 'CV-460 payload layer 1: the closed family/edition schema occurrence.', [
    ('PS01_payload_schema', '/payload', 'conforms to the closed family edition schema', 'schema', "value['payload_schema_valid'] is not True"),
])
phase('payload_numbers', 'CV-1100 current input (sweep part 2B): every payload integer slot holds an exact current integer.', [
    ('PN01_integer_slots', '/<integer slots>', 'every schema integer slot (type integer, integer const or enum) is an exact current integer: shared current_integer with the slot bounds',
     'number_domain', "value['integer_slots_exact'] is not True"),
])
phase('payload_rules', 'CV-460 payload layers 2-6: epoch, timestamp, identity recipe and family arithmetic.', [
    ('PR01_epoch_integer', '/recovery_epoch', 'is an exact int', 'epoch_type', "value['epoch_type'] != 'int'"),
    ('PR02_epoch_nonnegative', '/recovery_epoch', 'an int epoch is not negative', 'epoch_type', "value['epoch_negative'] is True"),
    ('PR03_family_timestamp', '/<family timestamp>', 'passes the shared CV-1101 date_time predicate, STORAGE_UTC_Z profile (UTC ending in uppercase Z)', 'valid_utc_datetime',
     "value['family_timestamp_valid'] is not True"),
    ('PR04_idempotency_recipe', '/idempotency_key', 'equals the SP-460/CV-366 recipe for the payload and epoch', 'identity_recipe',
     "value['idempotency_key'] != value['expected_idempotency_key']"),
    ('PR05_revision_rule', '/previous_definition_revision', 'configuration_changed: equals definition_revision - 1', 'revision_rule',
     "value['previous_definition_revision'] != value['expected_previous_definition_revision']"),
    ('PR06_review_counts', '/requested_reviewer_count', 'artifact_finalized: completed + failed equals requested', 'review_counts',
     "value['reviewer_sum'] != value['requested_reviewer_count']"),
])

# ================================================================ decision layer: EventRecord joins (CV-460 rule 7)
phase('envelope_schema', 'CV-460 rule 7: the EventRecord schema occurrence.', [
    ('EV01_record_schema', '/', 'conforms to the EventRecord schema', 'event_record_schema', "value['record_schema_valid'] is not True"),
])
phase('envelope_datetime', 'CV-1101 (sweep part 2B): EventRecord timestamps through the shared date_time predicate, one profile per field.', [
    ('EV15_occurred_at_format', '/occurred_at_utc', 'passes the shared date_time predicate, EVENT_RECORD profile (CV-317/CV-1101)', 'event_record_schema',
     "value['occurred_at_valid'] is not True"),
    ('EV16_observed_at_format', '/observed_at_utc', 'passes the shared date_time predicate, STORAGE_UTC_Z profile (CV-253)', 'event_record_schema',
     "value['observed_at_valid'] is not True"),
    ('EV17_persisted_at_format', '/persisted_at_utc', 'passes the shared date_time predicate, STORAGE_UTC_Z profile (CV-253)', 'event_record_schema',
     "value['persisted_at_valid'] is not True"),
])
phase('envelope_numbers', 'CV-1100/SP-1100 (sweep part 2B): EventRecord integer slots of a current record.', [
    ('EV18_sequence_id', '/sequence_id', 'is a Storage uint64: shared storage_uint64', 'event_record_schema', "value['sequence_id_exact'] is not True"),
    ('EV19_producer_sequence_id', '/producer_sequence_id', 'is null or an exact current integer of at least 0: shared current_integer', 'event_record_schema',
     "value['producer_sequence_exact'] is not True"),
])
phase('envelope_family', 'CV-460 rule 7: the record names the boundary family.', [
    ('EV02_event_type', '/event_type', 'equals the boundary event family', 'event_type', "value['record_event_type'] != value['boundary_event_type']"),
])
phase('envelope_scope', 'CV-460 rule 7: scope and redaction joins.', [
    ('EV03_scope_kind', '/scope_kind', 'equals the payload scope_kind', 'scope_kind', "value['record_scope_kind'] != value['payload_scope_kind']"),
    ('EV04_project_id', '/project_id', 'with the same scope kind, equals the payload project_id', 'scope_kind',
     "value['record_scope_kind'] == value['payload_scope_kind'] and value['record_project_id'] != value['payload_project_id']"),
    ('EV05_redaction', '/redaction_profile', 'is no_secrets', 'redaction_profile', "value['redaction_profile'] != 'no_secrets'"),
])
phase('envelope_replay', 'CV-460 rule 7 / Contracts_V0 replay rule: current writers only (never historical originals).', [
    ('EV06_replay_policy', '/replay_policy', 'a current writer uses dedupe_by_idempotency_key', 'replay_policy', f"value['replay_policy'] != {DEDUPE}"),
])
phase('envelope_joins', 'CV-460 rule 7: node, attempt, thread, run, key, schema id and time joins.', [
    ('EV07_node', '/node_id', 'is null', 'node_join', "value['record_node_id'] is not None"),
    ('EV08_attempt', '/attempt_id', 'equals the payload attempt for attempt families, else null', 'attempt_join',
     "value['record_attempt_id'] != value['expected_attempt_id']"),
    ('EV09_thread', '/thread_id', 'equals the payload thread_id', 'payload_envelope_identity', "value['record_thread_id'] != value['payload_thread_id']"),
    ('EV10_run', '/run_id', 'equals the payload collaboration_run_id', 'payload_envelope_identity', "value['record_run_id'] != value['payload_run_id']"),
    ('EV11_idempotency', '/idempotency_key', 'equals the payload idempotency_key', 'payload_envelope_identity',
     "value['record_idempotency_key'] != value['payload_idempotency_key']"),
    ('EV12_schema_id', '/payload_schema_id', 'equals the family edition schema id', 'payload_schema_id',
     "value['record_payload_schema_id'] != value['expected_payload_schema_id']"),
    ('EV13_occurred_at', '/occurred_at_utc', 'equals the payload family timestamp', 'occurred_at_join',
     "value['record_occurred_at_utc'] != value['payload_family_timestamp']"),
])
phase('envelope_identity', 'CV-460 rule 7: the event id recipe.', [
    ('EV14_event_id', '/event_id', 'equals the SP-460 event id recipe', 'identity_recipe', "value['record_event_id'] != value['expected_event_id']"),
])
phase('representation', 'SP-337 representation: inline limit and reference route.', [
    ('RP01_inline_limit', '/payload', 'an inline body encodes in at most 16384 UTF-8 bytes', 'inline_limit',
     "value['inline_size'] is not None and value['inline_size'] > 16384"),
    ('RP02_reference_body', '/payload', 'a referenced body leaves payload empty', 'reference_inline_body', "value['reference_body_empty'] is False"),
    ('RP03_event_value', '/', 'the stored record encodes under the SP-236/SP-1100 EVENT_VALUE profile: shared storage_value_bytes', 'event_value_encoding',
     "value['event_value_encodable'] is not True"),
])
phase('reference_format', 'SP-337 reference: grammar and presence.', [
    ('RF01_format', '/payload_ref', 'is a full-match payload:blake3 application/json reference', 'reference_format', "value['reference_format_valid'] is not True"),
    ('RF02_present', '/payload_ref', 'names a body in the payload store', 'reference_missing', "value['body_present'] is not True"),
])
phase('reference_body', 'SP-337 reference: size, hash, JSON object and canonical bytes.', [
    ('RF03_size', '/payload_ref', 'declared size equals the body byte length', 'reference_size', "value['declared_size'] != value['body_size']"),
    ('RF04_hash', '/payload_ref', 'declared BLAKE3 equals the body hash', 'reference_hash', "value['declared_blake3'] != value['body_blake3']"),
    ('RF05_json_object', '/payload_ref', 'the body decodes to a JSON object', 'reference_json', "value['body_is_object'] is not True"),
    ('RF06_canonical', '/payload_ref', 'the body is its own canonical JSON (a body with no lossless canonical form has none)', 'reference_canonical',
     "value['body_is_object'] is True and value['canonical_sha256'] != value['body_sha256']"),
])

# ================================================================ retention (DL-092, RP-CHAT-THREAD-LIFETIME)
phase('retention_presence', 'DL-092 retention object presence.', [
    ('RT01_present', '/retention_policies/RP-CHAT-THREAD-LIFETIME', 'is present', 'retention_missing', "value['policy_present'] is not True"),
])
phase('retention_shape', 'DL-092 retention object shape.', [
    ('RT02_object', '/retention_policy', 'is an object', 'retention_values', "value['policy_type'] != 'dict'"),
])
RETENTION = [('retention_mode', 'str', "'indefinite'"), ('anchor_kind', 'str', "'explicit_delete'"), ('max_cardinality', 'int', '250000'),
             ('cardinality_scope', 'str', "'thread'"), ('overflow_action', 'str', "'roll_successor'"), ('hold_eligible', 'bool', 'True'),
             ('policy_version', 'str', "'1.0.0'")]
retention_rows = []
for i, (field, typ, literal) in enumerate(RETENTION):
    retention_rows.append((f'RT{3 + 2 * i:02}_{field}_type', '/' + field, f'is exactly {typ}', 'retention_values', f"value['{field}_type'] != '{typ}'"))
    retention_rows.append((f'RT{4 + 2 * i:02}_{field}_value', '/' + field, f'a {typ} {field} equals {literal}', 'retention_values',
                           f"value['{field}_type'] == '{typ}' and value['{field}'] != {literal}"))
phase('retention_values_a', 'DL-092 retention values (mode, anchor, cardinality).', retention_rows[0:6])
phase('retention_values_b', 'DL-092 retention values (scope, overflow, hold).', retention_rows[6:12])
phase('retention_values_c', 'DL-092 retention values (version).', retention_rows[12:14])

# ================================================================ checkpoint (SP-278 adoption)
phase('checkpoint_schema', 'Projection checkpoint schema occurrence.', [
    ('CK01_schema', '/', 'conforms to the checkpoint schema', 'checkpoint_schema', "value['checkpoint_schema_valid'] is not True"),
])
phase('checkpoint_values', 'CV-1101 and CV-1100/SP-1100 (sweep part 2B): checkpoint timestamps and integer slots.', [
    ('CK20_times', '/<checkpoint timestamps>', 'every checkpoint timestamp passes the shared date_time predicate, STORAGE_UTC_Z profile', 'checkpoint_schema',
     "value['checkpoint_times_valid'] is not True"),
    ('CK21_integers', '/<checkpoint integer slots>', 'every integer slot is an exact current integer; the SP-278/SP-460 Storage fields are uint64', 'checkpoint_schema',
     "value['checkpoint_integers_exact'] is not True"),
])
phase('checkpoint_instance', 'Checkpoint storage instance copies and partition.', [
    ('CK02_checkpoint_instance', '/storage_instance_id', 'equals the live storage instance', 'checkpoint_instance', "value['checkpoint_instance'] != value['storage_instance_id']"),
    ('CK03_token_instance', '/index_read_token/storage_instance_id', 'equals the live storage instance', 'checkpoint_instance', "value['token_instance'] != value['storage_instance_id']"),
    ('CK04_selection_instance', '/index_read_token/source_selection/storage_instance_id', 'equals the live storage instance', 'checkpoint_instance',
     "value['token_selection_instance'] != value['storage_instance_id']"),
    ('CK05_context_token_instance', '/<context>/index_read_token/storage_instance_id', 'equals the live storage instance', 'checkpoint_instance',
     "value['context_token_instance'] != value['storage_instance_id']"),
    ('CK06_context_selection_instance', '/<context>/index_read_token/source_selection/storage_instance_id', 'equals the live storage instance', 'checkpoint_instance',
     "value['context_selection_instance'] != value['storage_instance_id']"),
    ('CK07_partition', '/scope_partition', 'equals the Storage scope_partition of the checkpoint scope', 'checkpoint_partition',
     "value['scope_partition'] != value['expected_scope_partition']"),
])
phase('checkpoint_join', 'Checkpoint durable token, admitted set and coverage joins.', [
    ('CK08_token', '/index_read_token', 'equals the context read token apart from instance copies', 'checkpoint_token', same('token_sha256', 'context_token_sha256')),
    ('CK09_admitted', '/admitted_event_types', 'equals the context admitted set', 'checkpoint_admitted', same('admitted_sha256', 'context_admitted_sha256')),
    ('CK10_coverage', '/first_retained_sequence_id', 'retained range equals the context range', 'checkpoint_coverage', same('coverage_sha256', 'context_coverage_sha256')),
    ('CK11_cursor_through', '/source_cursor/last_sequence_id', 'a cursor ends at index_through_sequence_id', 'checkpoint_coverage',
     "value['cursor_present'] is True and value['cursor_last_sequence_id'] != value['index_through_sequence_id']"),
])
phase('checkpoint_cursor', 'Checkpoint source cursor joins.', [
    ('CK12_cursor_context', '/source_cursor', 'equals the context cursor', 'checkpoint_cursor', same('cursor_sha256', 'context_cursor_sha256')),
    ('CK13_cursor_generation', '/source_cursor/segment_generation', 'equals the token selected segment generation', 'checkpoint_cursor',
     "value['cursor_segment_generation'] != value['selected_segment_generation']"),
    ('CK14_cursor_frame', '/source_cursor/frame_end_offset', 'is after byte_offset', 'checkpoint_cursor', "value['frame_end_offset'] <= value['byte_offset']"),
    ('CK15_cursor_event_id', '/source_cursor/last_event_id', 'names the last event', 'checkpoint_cursor', "value['cursor_last_event_id'] != value['last_event_id']"),
    ('CK16_cursor_sequence', '/source_cursor/last_sequence_id', 'equals the last event sequence', 'checkpoint_cursor', same('cursor_sequence_sha256', 'event_sequence_sha256')),
])
phase('checkpoint_event', 'Checkpoint last-event scope joins (the event then passes the historical envelope).', [
    ('CK17_event_scope', '/<last_event>/scope_kind', 'equals the checkpoint scope_kind', 'checkpoint_event', "value['event_scope_kind'] != value['checkpoint_scope_kind']"),
    ('CK18_event_project', '/<last_event>/project_id', 'equals the checkpoint project_id', 'checkpoint_event', "value['event_project_id'] != value['checkpoint_project_id']"),
])
phase('checkpoint_recipe', 'SP-1101 (sweep part 2B): the checkpoint last event is resolved once from sealed custody and verified by its frozen recipe.', [
    ('CK22_last_event_custody', '/<last_event>', 'the shared RetainedDispatcher resolves the last event from sealed custody and its frozen recipe verifies it', 'checkpoint_event',
     "value['dispatch_refusal'] is not None"),
])
phase('checkpoint_empty_cursor', 'An empty checkpoint cursor matches an empty context cursor.', [
    ('CK19_empty_cursor', '/source_cursor', 'a null cursor has a null context cursor', 'checkpoint_cursor', "value['context_cursor_is_null'] is not True"),
])

# ================================================================ historical reads
phase('historical_context', 'Retained-history controls are an object.', [
    ('HI01_context_object', '/<context>', 'is an object', 'historical_withdrawn', "value['context_type'] != 'dict'"),
])
phase('historical_flags', 'Retained-history controls and the original record join.', [
    ('HI02_withdrawn_type', '/<context>/withdrawn', 'is exactly bool', 'historical_withdrawn', "value['withdrawn_type'] != 'bool'"),
    ('HI03_not_withdrawn', '/<context>/withdrawn', 'is not true', 'historical_withdrawn', "value['withdrawn'] is True"),
    ('HI04_retained_type', '/<context>/retained', 'is exactly bool', 'historical_not_retained', "value['retained_type'] != 'bool'"),
    ('HI05_retained', '/<context>/retained', 'is not false', 'historical_not_retained', "value['retained'] is False"),
    ('HI06_epoch_type', '/<context>/write_epoch', 'is an exact int', 'historical_epoch_type', "value['write_epoch_type'] != 'int'"),
    ('HI07_epoch_nonnegative', '/<context>/write_epoch', 'an int write epoch is not negative', 'historical_epoch_type', "value['write_epoch_negative'] is True"),
    ('HI08_original', '/', 'equals the captured original record', 'historical_forged', same('record_sha256', 'original_record_sha256')),
])

phase('historical_recipe', 'SP-1101 (sweep part 2B): the retained original is resolved once from sealed custody and verified by its frozen recipe.', [
    ('HR01_recipe_custody', '/', 'the shared RetainedDispatcher resolves this original from sealed custody and its frozen recipe verifies it', 'historical_original_recipe',
     "value['dispatch_refusal'] is not None"),
    ('HR02_write_epoch', '/<context>/write_epoch', 'equals the write epoch of the authenticated original', 'historical_original_recipe',
     "value['dispatch_refusal'] is None and value['context_write_epoch'] != value['custody_write_epoch']"),
])

# ================================================================ prepared source custody (SP-460..478)
FAM = repr(FAMILIES)
phase('source_object', 'Prepared source holder is an object.', [
    ('SO01_object', '/', 'is an object', 'source_schema', "value['source_type'] != 'dict'"),
])
phase('source_family', 'Prepared source names one of the 18 families.', [
    ('SO02_family', '/event_type', 'is one of the 18 collaborative families', 'source_family', f"value['source_event_type'] not in {FAM}"),
])
phase('source_schema', 'Prepared source schema occurrence for its family.', [
    ('SO03_schema', '/', 'conforms to the family prepared-source schema', 'source_schema', "value['source_schema_valid'] is not True"),
])
phase('source_times', 'CV-1101 (sweep part 2B): Collaborative Workflows owner timestamps in the prepared source.', [
    ('SO06_owner_times', '/owner_record/**, /review_target_pack/** (utc_timestamp)', 'every owner timestamp passes the shared date_time predicate, EVENT_RECORD profile; the owner pattern is unchanged',
     'source_schema', "value['owner_times_valid'] is not True"),
])
phase('source_numbers', 'CV-1100/SP-1100 (sweep part 2B): prepared-source integer slots outside the semantic body.', [
    ('SO07_integer_slots', '/<integer slots outside semantic_body>', 'every integer slot is an exact current integer; recovery_epoch is a Storage uint64', 'source_schema',
     "value['integer_slots_exact'] is not True"),
])
phase('source_context_type', 'Independently read source controls are an object.', [
    ('SO04_context_object', '/<context>', 'is an object', 'source_context_missing', "value['context_type'] != 'dict'"),
])
phase('source_context_keys', 'Independently read source controls carry every required slot.', [
    ('SO05_context_slots', '/<context>', 'has every required control slot', 'source_context_missing', "value['context_missing_slots'] != []"),
])
phase('source_identity', 'Source custody: instance, epoch, key and identity recomputation.', [
    ('SF01_instance', '/storage_instance_id', 'equals the captured storage instance', 'source_instance', "value['value_instance'] != value['context_instance']"),
    ('SF02_epoch_type', '/<context>/write_epoch', 'is an exact int', 'source_epoch', "value['write_epoch_type'] != 'int'"),
    ('SF03_epoch', '/recovery_epoch', 'equals the captured write epoch', 'source_epoch',
     "value['write_epoch_type'] == 'int' and value['recovery_epoch'] != value['write_epoch']"),
    ('SF04_key', '/<physical key>', 'equals the recomputed prepared-source key', 'source_key', "value['physical_key'] != value['expected_physical_key']"),
    ('SF05_partition', '/scope_partition', 'equals the Storage scope_partition of the body', 'source_partition', "value['scope_partition'] != value['expected_scope_partition']"),
    ('SF06_operation', '/owner_operation_id', 'equals the recomputed owner operation id', 'source_operation', "value['owner_operation_id'] != value['expected_owner_operation_id']"),
    ('SF07_event_id', '/event_id', 'equals the recomputed event id', 'source_event_id', "value['event_id'] != value['expected_event_id']"),
])
phase('source_digests', 'Source custody: semantic and record digests and the record reference.', [
    ('SF08_semantic_digest', '/semantic_sha256', 'equals the producer digest of the body', 'source_digest', "value['semantic_sha256'] != value['expected_semantic_sha256']"),
    ('SF09_record_digest', '/owner_record_sha256', 'equals the canonical digest of owner_record', 'source_record_digest',
     "value['owner_record_sha256'] != value['actual_record_sha256']"),
    ('SF10_context_record_digest', '/<context>/owner_record_sha256', 'equals the canonical digest of owner_record', 'source_record_digest',
     "value['context_record_sha256'] != value['actual_record_sha256']"),
    ('SF11_record_ref', '/owner_record_ref', 'equals the family record reference of the body', 'source_record_ref', "value['owner_record_ref'] != value['expected_record_ref']"),
    ('SF12_context_record_ref', '/<context>/owner_record_ref', 'equals the source owner_record_ref', 'source_record_ref', "value['owner_record_ref'] != value['context_record_ref']"),
])
phase('source_record_identity', 'Source custody: record identity joins.', [
    ('SF13_binding', '/<context>/binding', 'equals the body binding projection', 'source_record_identity', same('binding_sha256', 'context_binding_sha256')),
    ('SF14_shared_fields', '/owner_record', 'every field shared with the body has the same value', 'source_record_identity', same('record_shared_sha256', 'body_shared_sha256')),
    ('SF15_joined_fields', '/owner_record', 'every renamed identity join (run_id, slot_id, review_run_id, revision) has the same value', 'source_record_identity', same('record_join_sha256', 'body_join_sha256')),
    ('SF16_coordinator', '/semantic_body/coordinator_kind', 'equals the record coordinator_spec kind', 'source_record_identity',
     "value['body_coordinator_kind'] != value['record_coordinator_kind']"),
])
phase('source_record_state', 'Source custody: record state and time, metadata, outputs and attempt.', [
    ('SF17_started_time', '/owner_record/created_at', 'started: equals started_at_utc', 'source_record_state', "value['started_record_time'] != value['started_body_time']"),
    ('SF18_message_time', '/owner_record/created_at', 'message_added: equals written_at_utc', 'source_record_state', "value['message_record_time'] != value['message_body_time']"),
    ('SF19_state', '/owner_record/state', 'equals the lifecycle state the family writes', 'source_record_state', "value['record_state'] != value['expected_state']"),
    ('SF20_terminal_time', '/owner_record/completed_at', 'a terminal family: equals its timestamp', 'source_record_state', "value['terminal_record_time'] != value['terminal_body_time']"),
    ('SF21_envelope_metadata', '/envelope_metadata', 'equals the captured envelope metadata', 'source_envelope_metadata', "value['envelope_metadata'] != value['context_envelope_metadata']"),
    ('SF22_output_refs', '/semantic_body/output_refs', 'completed: equals the captured output refs', 'source_output_refs', "value['body_output_refs'] != value['context_output_refs']"),
    ('SF23_attempt', '/owner_record/attempt_id', 'participant_completed: equals the body attempt', 'source_attempt', "value['record_attempt_id'] != value['body_attempt_id']"),
])
phase('source_participant', 'Source custody: waiver and participant identity.', [
    ('SF24_waiver_currentness', '/owner_record/waiver/currentness_hash', 'equals waiver_currentness_hash', 'source_waiver',
     "value['waiver_currentness'] != value['body_waiver_currentness']"),
    ('SF25_waiver_actor', '/owner_record/waiver/actor_identity', 'equals the captured waiver actor', 'source_waiver', "value['waiver_actor'] != value['context_waiver_actor']"),
    ('SF26_waiver_actor_ref', '/semantic_body/waiver_actor_ref', 'equals the captured waiver actor ref', 'source_waiver', "value['body_waiver_actor_ref'] != value['context_waiver_actor_ref']"),
    ('SF27_identity_slot', '/participant_identity/participant_slot_id', 'equals the body slot', 'source_participant_identity', "value['identity_slot'] != value['body_slot']"),
    ('SF28_identity_participant', '/participant_identity/participant_id', 'equals the record participant', 'source_participant_identity',
     "value['identity_participant'] != value['record_participant']"),
    ('SF29_identity_context', '/participant_identity', 'equals the captured participant identity', 'source_participant_identity',
     "value['participant_identity'] != value['context_participant_identity']"),
])
phase('source_review_pack', 'Source custody: Review target pack and nested application contexts.', [
    ('SF30_pack_run', '/review_target_pack/review_run_id', 'equals the body run', 'source_review_pack', "value['pack_run'] != value['body_run']"),
    ('SF31_pack_targets', '/review_target_pack/target_hashes', 'equals the body target hashes', 'source_review_pack', "value['pack_targets'] != value['body_targets']"),
    ('SF32_pack_context', '/review_target_pack', 'equals the captured target pack', 'source_review_pack', "value['review_pack'] != value['context_review_pack']"),
    ('SF33_app_instance', '/owner_record/**/application_context/storage_instance_id', 'every nested context names the source instance', 'source_application_context',
     "set(value['application_instances']) - {value['value_instance']}"),
    ('SF34_app_server', '/owner_record/**/application_context/scope/server_id', 'every nested context names the body Server', 'source_application_context',
     "set(value['application_servers']) - {value['body_server']}"),
    ('SF35_app_thread', '/owner_record/**/application_context/thread_id', 'every nested context names the body thread', 'source_application_context',
     "set(value['application_threads']) - {value['body_thread']}"),
])
phase('source_requirements', 'Source custody: owner-derived required slots and currentness.', [
    ('SF36_required_control', '/<context>/required_slot_ids', 'is a list of distinct strings', 'source_required_slots', "value['context_required_is_list'] is not True"),
    ('SF37_required_snapshot', '/slot_requirements', 'required slots equal the captured required set', 'source_required_slots',
     "value['context_required_slot_ids'] is not None and value['required_snapshot'] != value['context_required_slot_ids']"),
    ('SF38_required_body', '/semantic_body/required_slot_ids', 'created/configuration_changed/completed: equals the required snapshot', 'source_required_slots',
     "value['body_required_slot_ids'] is not None and value['body_required_slot_ids'] != value['required_snapshot']"),
    ('SF39_required_flag', '/semantic_body/required', 'equals the slot requiredness in the snapshot', 'source_required_slots',
     "value['body_required_flag'] != value['expected_required_flag']"),
    ('SF40_currentness', '/semantic_body/currentness_hash', 'equals the captured currentness', 'source_currentness', "value['body_currentness'] != value['context_currentness']"),
    ('SF41_record_currentness', '/owner_record/currentness', 'equals the body currentness', 'source_currentness', "value['record_currentness'] != value['body_currentness_for_record']"),
])
phase('source_roster', 'Source custody: participant slot roster.', [
    ('SF42_roster_control', '/<context>/participant_slot_ids', 'is a list of distinct strings', 'source_slot_roster', "value['context_roster_is_list'] is not True"),
    ('SF43_roster_unique', '/slot_requirements', 'slot ids are distinct', 'source_slot_roster', "value['snapshot_slot_count'] != value['snapshot_distinct_slot_count']"),
    ('SF44_record_unique', '/owner_record/participant_specs', 'slot ids are distinct', 'source_slot_roster', "value['record_slot_count'] != value['record_distinct_slot_count']"),
    ('SF45_roster_context', '/slot_requirements', 'distinct slot order equals the captured roster', 'source_slot_roster',
     "value['context_slot_ids'] is not None and value['snapshot_slot_count'] == value['snapshot_distinct_slot_count'] and value['snapshot_slot_ids'] != value['context_slot_ids']"),
    ('SF46_roster_record', '/owner_record/participant_specs', 'distinct slot order equals the distinct snapshot', 'source_slot_roster',
     "value['record_slot_ids'] is not None and value['snapshot_slot_count'] == value['snapshot_distinct_slot_count'] and value['record_slot_count'] == value['record_distinct_slot_count'] and value['record_slot_ids'] != value['snapshot_slot_ids']"),
    ('SF47_roster_body', '/semantic_body/participant_slot_ids', 'equals the distinct snapshot order', 'source_slot_roster',
     "value['body_slot_ids'] is not None and value['snapshot_slot_count'] == value['snapshot_distinct_slot_count'] and value['body_slot_ids'] != value['snapshot_slot_ids']"),
])
phase('source_outputs', 'Source custody: producer attempt, vote constraints, Plan result and artifact custody.', [
    ('SF48_producer_attempt', '/semantic_body/attempt_id', 'proposal/vote: equals the captured producer attempt', 'source_producer_attempt',
     "value['body_producer_attempt'] != value['context_producer_attempt']"),
    ('SF49_vote_constraints', '/semantic_body/hard_constraint_conflict_ids', 'vote: equals the record conflicts', 'source_vote_constraints',
     "value['record_conflicts'] != value['body_conflicts']"),
    ('SF50_plan_result', '/semantic_body/plan_hash', 'plan_synthesized: equals the captured Plan-create result', 'source_plan_result', same('plan_result_sha256', 'context_plan_result_sha256')),
    ('SF51_artifact_custody', '/semantic_body/artifact_ref', 'is one of the record artifact refs', 'source_artifact_custody',
     "value['artifact_ref'] is not None and value['artifact_ref'] not in value['record_artifact_refs']"),
])
phase('source_review', 'Source custody: Review targets, reviewers and counts.', [
    ('SF52_review_targets', '/semantic_body/target_hashes', 'equals the captured Review targets', 'source_review_targets', "value['body_review_targets'] != value['context_review_targets']"),
    ('SF53_reviewer_control', '/<context>/reviewer_ids', 'is a list of distinct strings', 'source_review_targets', "value['reviewer_ids_is_list'] is False"),
    ('SF54_vote_targets', '/owner_record/reviewer_votes/target_hash', 'every vote target is a body target', 'source_review_targets',
     "value['vote_targets'] != [] and set(value['vote_targets']) - set(value['body_review_targets'])"),
    ('SF55_vote_reviewers', '/owner_record/reviewer_votes/reviewer_id', 'every vote reviewer is a captured reviewer', 'source_review_targets',
     "value['context_reviewer_ids'] is not None and set(value['vote_reviewers']) - set(value['context_reviewer_ids'])"),
    ('SF56_counted_votes', '/semantic_body/counted_vote_count', 'dispositioned: equals the distinct reviewers', 'source_review_counts',
     "value['counted_vote_count'] != value['distinct_reviewer_count']"),
    ('SF57_votes_unique', '/owner_record/reviewer_votes', 'dispositioned: one vote per reviewer', 'source_review_counts', "value['vote_count'] != value['distinct_reviewer_count_for_votes']"),
    ('SF58_dissent', '/semantic_body/dissent_count', 'dispositioned: equals the record dissent count', 'source_review_counts', "value['dissent_count'] != value['record_dissent_count']"),
])
phase('source_owner_facts', 'Source custody: remaining facts equal the independently captured owner facts.', [
    ('SF59_owner_facts', '/semantic_body', 'facts outside the joined fields equal the captured owner facts', 'source_owner_facts', same('fact_projection_sha256', 'context_owner_facts_sha256')),
])

# ================================================================ prepared event and application wrapper
phase('prepared_join', 'Prepared event: body and envelope metadata copies.', [
    ('QP01_body', '/payload', 'resolves to the prepared semantic body', 'prepared_body', same('resolved_body_sha256', 'semantic_body_sha256')),
    ('QP02_metadata', '/<envelope metadata fields>', 'equal the prepared envelope metadata', 'prepared_envelope_metadata', "value['record_metadata'] != value['envelope_metadata']"),
])
phase('wrapper_shape', 'SP-351 application wrapper schema and complete MessagePack size.', [
    ('WR01_schema', '/<application_wrapper>', 'conforms to the StorageApplicationV2 wrapper schema', 'application_wrapper_schema', "value['wrapper_schema_valid'] is not True"),
    ('WR02_limit', '/<application_wrapper>', 'the complete MessagePack wrapper is at most 16384 bytes', 'application_wrapper_limit',
     "value['wrapper_packed_size'] is not None and value['wrapper_packed_size'] > 16384"),
    ('WR07_physical', '/<application_wrapper>', 'encodes under the CV-366 APP_PHYSICAL profile: shared storage_value_bytes', 'application_wrapper_encoding',
     "value['wrapper_packed_size'] is None"),
    ('WR08_integers', '/<application_wrapper integer slots>', 'every integer slot, including the inline record, is an exact current integer', 'application_wrapper_schema',
     "value['wrapper_integers_exact'] is not True"),
])
phase('wrapper_join', 'SP-351 application wrapper record and header joins.', [
    ('WR03_record', '/<application_wrapper>/record', 'the inline or referenced record equals owner_record', 'application_wrapper_record',
     "value['wrapper_record_sha256'] is not None and value['wrapper_record_sha256'] != value['owner_record_sha256']"),
    ('WR04_instance', '/<application_wrapper>/storage_instance_id', 'equals the source storage instance', 'application_wrapper_identity', "value['wrapper_instance'] != value['value_instance']"),
    ('WR05_server', '/<application_wrapper>/server_id', 'equals the body Server', 'application_wrapper_identity', "value['wrapper_server'] != value['body_server']"),
    ('WR06_scope', '/<application_wrapper>/scope', 'equals the record application scope', 'application_wrapper_identity', same('wrapper_scope_sha256', 'record_scope_sha256')),
])
phase('projection_value_schema', 'A projection row value conforms to its definition.', [
    ('PV01_schema', '/', 'conforms to its projection definition', 'projection_value', "value['projection_schema_valid'] is not True"),
])
phase('projection_value_times', 'CV-1101 (sweep part 2B): projection row timestamps.', [
    ('PV02_times', '/<projection timestamps>', 'every projection timestamp passes the shared date_time predicate, STORAGE_UTC_Z profile', 'projection_value',
     "value['projection_times_valid'] is not True"),
])
phase('read_token', 'SP-278 durable read token exemption is the canonical token only.', [
    ('TK01_canonical_token', '/<storage value>', 'is the canonical nine-field durable read token', 'read_token_exemption', "value['canonical_read_token'] is not True"),
])
phase('shape_schema', 'Schema occurrence of a component or full-schema probe.', [
    ('SH01_schema', '/', 'conforms to its named schema definition', 'schema', "value['shape_schema_valid'] is not True"),
])

# ================================================================ transition admission (SP-460..478 reducer)
phase('transition_dedupe', 'SP-460 dedupe: a repeated key must carry the same producer digest.', [
    ('TR01_idempotency_conflict', '/idempotency_key', 'a recorded key has the same producer digest', 'idempotency_conflict',
     "value['recorded_digest'] is not None and value['recorded_digest'] != value['producer_digest']"),
])
phase('transition_admitted', 'SP-460 quarantine: only admitted families append.', [
    ('TR02_admitted', '/event_type', 'is an admitted family', 'quarantined', "value['family_admitted'] is not True"),
])
phase('transition_created', 'collaboration.created: one definition per collaboration.', [
    ('TR03_already_created', '/collaboration_id', 'has no recorded definition', 'conflict:already_created', "value['definition_exists'] is True"),
])
phase('transition_definition', 'started/configuration_changed: the definition revision is recorded.', [
    ('TR04_definition_recorded', '/collaboration_id', 'has a recorded definition', 'conflict:definition_not_recorded', "value['definition_exists'] is not True"),
    ('TR05_started_revision', '/definition_revision', 'started: is a recorded revision', 'conflict:definition_not_recorded', "value['started_revision_recorded'] is False"),
])
phase('transition_definition_lineage', 'started/configuration_changed: definition kind and thread lineage.', [
    ('TR06_definition_kind', '/kind', 'equals the definition kind', 'conflict:lineage_mismatch', "value['definition_kind'] != value['kind']"),
    ('TR07_definition_thread', '/thread_id', 'equals the definition thread', 'conflict:lineage_mismatch', "value['definition_thread'] != value['thread_id']"),
])
phase('transition_start', 'started or start_commit: no run yet and the expected revision is current.', [
    ('TR08_already_started', '/collaboration_run_id', 'has no started run', 'conflict:already_started', "value['run_exists'] is True"),
    ('TR09_start_commit_revision', '/previous_definition_revision', 'start_commit: equals the latest revision', 'conflict:stale_definition_revision',
     "value['start_previous_revision'] != value['start_latest_revision']"),
])
phase('transition_run_presence', 'Run families: the run is started.', [
    ('TR10_run_started', '/collaboration_run_id', 'names a started run', 'conflict:run_not_started', "value['run_exists'] is not True"),
])
phase('transition_run', 'Run families: run lineage, terminal state and definition revision.', [
    ('TR11_run_thread', '/thread_id', 'equals the run thread', 'conflict:lineage_mismatch', "value['run_thread'] != value['thread_id']"),
    ('TR12_run_kind', '/kind', 'equals the run kind', 'conflict:lineage_mismatch', "value['run_kind'] != value['kind']"),
    ('TR13_run_collaboration', '/collaboration_id', 'equals the run collaboration', 'conflict:lineage_mismatch', "value['run_collaboration'] != value['collaboration_id']"),
    ('TR14_not_terminal', '/collaboration_run_id', 'the run is not terminal', 'conflict:already_terminal', "value['run_status'] in ('completed', 'cancelled', 'failed')"),
    ('TR15_run_revision', '/definition_revision', 'the expected revision equals the run definition revision', 'conflict:stale_definition_revision',
     "value['expected_revision'] != value['run_definition_revision']"),
    ('TR16_latest_revision', '/previous_definition_revision', 'configuration_changed: equals the latest definition revision', 'conflict:stale_definition_revision',
     "value['config_previous_revision'] != value['config_latest_revision']"),
])
phase('transition_lifecycle', 'Lifecycle families: state machine, sequence and open attempts.', [
    ('TR17_lifecycle_state', '/state_before', 'the run state allows the lifecycle family', 'conflict:run_state_invalid',
     ["allowed = ('paused',) if value['short'] == 'resumed' else ('active',) if value['short'] == 'paused' or (value['short'] == 'completed' and value['completion_trigger'] != 'chat_room_end') else ('active', 'paused')",
      "return 'conflict:run_state_invalid' if value['run_status'] not in allowed else None"]),
    ('TR18_lifecycle_seq', '/lifecycle_seq', 'is the run sequence plus one', 'conflict:stale_lifecycle_seq', "value['lifecycle_seq'] != value['expected_lifecycle_seq']"),
    ('TR19_open_attempts', '/collaboration_run_id', 'cancelled/failed/completed: no attempt is open', 'conflict:open_attempts', "value['open_attempts'] is True"),
])
phase('transition_completed', 'collaboration.completed: owner-derived requiredness, waivers and outputs (CWR-031).', [
    ('TR20_required_set', '/required_slot_ids', 'equals the run required set', 'conflict:required_slot_set_mismatch', "value['required_slot_ids'] != value['run_required_slot_ids']"),
    ('TR21_waived_set', '/waived_slot_ids', 'equals the recorded waived slots', 'conflict:waived_slot_set_mismatch', "value['waived_slot_ids'] != value['run_waived_slot_ids']"),
    ('TR22_required_resolved', '/required_slot_ids', 'every required slot is completed or waived unless Chat Room End', 'conflict:unresolved_required_slots',
     "not (value['run_kind'] == 'chat_room' and value['completion_trigger'] == 'chat_room_end') and set(value['required_outcomes']) - {'completed', 'explicitly_waived'}"),
    ('TR23_brainstorm_output', '/output_refs', 'BrainStorm: a Plan is synthesized', 'conflict:missing_output', "value['run_kind'] == 'brainstorm' and value['synthesized'] is not True"),
    ('TR24_review_output', '/output_refs', 'Review: an artifact is finalized', 'conflict:missing_output', "value['run_kind'] == 'review' and value['finalized_ref'] is None"),
    ('TR25_brainstorm_refs', '/output_refs', 'BrainStorm: names the synthesized Plan', 'conflict:output_refs_mismatch',
     "value['run_kind'] == 'brainstorm' and value['synthesized'] is True and value['output_refs'] != [value['synthesized_plan_ref']]"),
    ('TR26_review_refs', '/output_refs', 'Review: names the finalized artifact', 'conflict:output_refs_mismatch',
     "value['run_kind'] == 'review' and value['finalized_ref'] is not None and value['output_refs'] != [value['finalized_ref']]"),
])
phase('transition_active', 'Participant and contribution families: the run is active.', [
    ('TR27_run_active', '/collaboration_run_id', 'the run is active', 'conflict:run_state_invalid', "value['run_status'] != 'active'"),
])
phase('transition_participant_started', 'participant_started: roster, attempt and assignment revision.', [
    ('TR28_slot_in_roster', '/participant_slot_id', 'is in the run roster', 'conflict:slot_not_in_roster', "value['slot_in_roster'] is not True"),
    ('TR29_slot_not_removed', '/participant_slot_id', 'is not removed', 'conflict:slot_not_in_roster', "value['slot_removed'] is True"),
    ('TR30_new_attempt', '/attempt_id', 'is not already started', 'conflict:attempt_already_started', "value['attempt_known'] is True"),
    ('TR31_assignment_revision', '/assignment_revision', 'is not below the slot revision', 'conflict:stale_assignment_revision',
     "value['assignment_revision'] < value['slot_revision']"),
])
phase('transition_participant_completed', 'participant_completed: the attempt or slot outcome is open and waivers are recorded.', [
    ('TR32_attempt_known', '/attempt_id', 'names a started attempt', 'conflict:unknown_attempt', "value['has_attempt'] is True and value['attempt_known'] is not True"),
    ('TR33_attempt_slot', '/participant_slot_id', 'equals the attempt slot', 'conflict:unknown_attempt',
     "value['attempt_known'] is True and value['attempt_slot'] != value['slot']"),
    ('TR34_attempt_revision', '/assignment_revision', 'equals the attempt revision', 'conflict:unknown_attempt',
     "value['attempt_known'] is True and value['attempt_revision'] != value['assignment_revision']"),
    ('TR35_attempt_open', '/attempt_id', 'the matching attempt has no outcome', 'conflict:attempt_already_closed',
     "value['attempt_known'] is True and value['attempt_slot'] == value['slot'] and value['attempt_revision'] == value['assignment_revision'] and value['attempt_outcome'] is not None"),
    ('TR36_slot_in_roster', '/participant_slot_id', 'without an attempt: is in the roster', 'conflict:slot_not_in_roster',
     "value['has_attempt'] is False and value['slot_in_roster'] is not True"),
    ('TR37_revision_open', '/assignment_revision', 'without an attempt: no outcome is recorded for the revision', 'conflict:attempt_already_closed',
     "value['has_attempt'] is False and value['revision_closed'] is True"),
    ('TR38_waiver_recorded', '/outcome', 'explicitly_waived: the slot waiver is recorded', 'conflict:waiver_not_recorded',
     "value['outcome'] == 'explicitly_waived' and value['slot_waived'] is not True"),
])
phase('transition_message', 'message_added: unique message, next sequence and participant sender.', [
    ('TR39_message_new', '/collaboration_message_id', 'is not already written', 'conflict:message_already_written', "value['message_known'] is True"),
    ('TR40_sequence_next', '/sequence', 'a new message is the next sequence', 'conflict:sequence_gap', "value['message_known'] is False and value['sequence'] != value['expected_sequence']"),
    ('TR41_sender_roster', '/sender_id', 'a participant sender is in the roster', 'conflict:slot_not_in_roster',
     "value['participant_sender'] is True and value['sender_in_roster'] is not True"),
    ('TR42_sender_attempt', '/attempt_id', 'a participant attempt is started', 'conflict:unknown_attempt',
     "value['participant_sender'] is True and value['has_attempt'] is True and value['attempt_known'] is not True"),
    ('TR43_sender_attempt_slot', '/attempt_id', 'a participant attempt belongs to the sender', 'conflict:unknown_attempt',
     "value['participant_sender'] is True and value['attempt_known'] is True and value['attempt_slot'] != value['sender_id']"),
])
phase('transition_artifact_added', 'artifact_added: one event per artifact version.', [
    ('TR44_artifact_new', '/artifact_version_ref', 'is not already added', 'conflict:artifact_already_added', "value['artifact_known'] is True"),
])
phase('transition_contribution', 'proposal_added/vote_added: proposal, attempt and role.', [
    ('TR45_vote_proposal', '/proposal_id', 'vote: names a recorded proposal', 'conflict:unknown_proposal', "value['short'] == 'vote_added' and value['proposal_known'] is not True"),
    ('TR46_attempt_known', '/attempt_id', 'names a started attempt', 'conflict:unknown_attempt', "value['attempt_known'] is not True"),
    ('TR47_attempt_slot', '/participant_slot_id', 'equals the attempt slot', 'conflict:unknown_attempt', "value['attempt_known'] is True and value['attempt_slot'] != value['slot']"),
    ('TR48_core_proposer', '/attempt_id', 'proposal: a core attempt', 'conflict:not_core_participant',
     "value['short'] == 'proposal_added' and value['attempt_matches'] is True and value['attempt_role'] != 'none'"),
    ('TR49_proposal_new', '/proposal_id', 'proposal: not already added', 'conflict:proposal_already_added',
     "value['short'] == 'proposal_added' and value['attempt_matches'] is True and value['proposal_known'] is True"),
    ('TR50_not_wonderer', '/attempt_id', 'vote: not a Wonderer attempt', 'conflict:wonderer_cannot_vote',
     "value['short'] == 'vote_added' and value['attempt_matches'] is True and value['attempt_role'] == 'wonderer'"),
    ('TR51_current_attempt', '/attempt_id', 'vote: the slot current attempt', 'conflict:attempt_not_current',
     "value['short'] == 'vote_added' and value['attempt_matches'] is True and value['slot_current_attempt'] != value['attempt_id']"),
])
phase('transition_vote', 'vote_added: open or completed attempt, unique vote.', [
    ('TR52_attempt_outcome', '/attempt_id', 'the attempt outcome is open or completed', 'conflict:attempt_not_current', "value['attempt_outcome'] not in (None, 'completed')"),
    ('TR53_vote_new', '/vote_id', 'is not already added', 'conflict:vote_already_added', "value['vote_known'] is True"),
])
phase('transition_synthesized', 'plan_synthesized: once per run.', [
    ('TR54_not_synthesized', '/collaboration_run_id', 'has no synthesized Plan', 'conflict:already_synthesized', "value['synthesized'] is True"),
])
phase('transition_finding_added', 'finding_added: targets, reviewers and unique finding.', [
    ('TR55_targets', '/target_hashes', 'equal the run target hashes', 'conflict:target_hash_mismatch', "value['target_hashes'] != value['run_target_hashes']"),
    ('TR56_reviewers', '/originating_reviewer_ids', 'every reviewer is in the roster', 'conflict:slot_not_in_roster',
     "set(value['originating_reviewer_ids']) - set(value['roster'])"),
    ('TR57_finding_new', '/finding_id', 'is not already added', 'conflict:finding_already_added', "value['finding_known'] is True"),
])
phase('transition_finding_dispositioned', 'finding_dispositioned: a recorded open finding with its targets.', [
    ('TR58_finding_known', '/finding_id', 'names a recorded finding', 'conflict:unknown_finding', "value['finding_known'] is not True"),
    ('TR59_finding_open', '/finding_id', 'is not dispositioned', 'conflict:already_dispositioned', "value['finding_known'] is True and value['finding_disposition'] is not None"),
    ('TR60_finding_targets', '/target_hashes', 'equal the finding targets', 'conflict:target_hash_mismatch',
     "value['finding_known'] is True and value['target_hashes'] != value['finding_target_hashes']"),
])
phase('transition_finalized', 'artifact_finalized: findings, artifact, targets, partial coverage and stale targets.', [
    ('TR61_not_finalized', '/collaboration_run_id', 'has no finalized artifact', 'conflict:already_finalized', "value['finalized_ref'] is not None"),
    ('TR62_findings_dispositioned', '/collaboration_run_id', 'every finding is dispositioned', 'conflict:findings_not_dispositioned', "value['open_findings'] != 0"),
    ('TR63_artifact_added', '/artifact_version_ref', 'is an added artifact', 'conflict:artifact_not_added', "value['artifact_known'] is not True"),
    ('TR64_targets', '/target_hashes', 'equal the run target hashes', 'conflict:target_hash_mismatch', "value['target_hashes'] != value['run_target_hashes']"),
    ('TR65_partial_accepted', '/partial_coverage_accepted', 'partial coverage is accepted', 'conflict:partial_not_accepted',
     "value['completed_reviewer_count'] < value['requested_reviewer_count'] and not value['partial_coverage_accepted']"),
    ('TR66_partial_waivers', '/partial_coverage_accepted', 'accepted partial coverage has a recorded waiver', 'conflict:partial_not_accepted',
     "value['completed_reviewer_count'] < value['requested_reviewer_count'] and value['partial_coverage_accepted'] and value['run_waiver_count'] == 0"),
    ('TR67_stale_accepted', '/stale_target_accepted', 'a stale target is accepted by the run', 'conflict:stale_not_accepted',
     "value['stale_target_accepted'] and not value['run_stale_accepted']"),
])

# ================================================================ integrity layer (Plans documents, ledger, registry, fixtures)
phase('int_payload_defs', 'Payload schema: exactly the expected definitions.', [
    ('IP01_payload_defs', '/$defs', 'names exactly the shared and family edition definitions', 'payload_defs', "value['def_names'] != value['expected_def_names']"),
])
phase('int_payload_def', 'Payload schema: each family edition definition.', [
    ('IP02_schema_id', '/$defs/<edition>/$id', 'is the family edition schema id', 'payload_schema_id', "value['schema_id'] != value['expected_schema_id']"),
    ('IP03_closed', '/$defs/<edition>/additionalProperties', 'is false', 'payload_closed', "value['additional_properties'] is not False"),
    ('IP04_object', '/$defs/<edition>/type', 'is object', 'payload_closed', "value['def_type'] != 'object'"),
    ('IP05_required_properties', '/$defs/<edition>/required', 'every required name is a property', 'required_without_property',
     "set(value['required']) - set(value['property_names'])"),
    ('IP06_null_nodes', '/$defs/<edition>', 'admits null only at the application project_id', 'null_admitted', "set(value['null_nodes']) != set(value['allowed_null_nodes'])"),
    ('IP07_family_timestamp', '/$defs/<edition>/required', 'requires the family timestamp', 'family_timestamp_required', "value['family_timestamp'] not in value['required']"),
    ('IP08_subject_fields', '/$defs/<edition>/properties', 'has every identity subject field', 'subject_field_missing',
     "set(value['subject_fields']) - set(value['property_names'])"),
])
phase('int_payload_kind', 'Payload schema: BrainStorm/Review kind constants.', [
    ('IP09_kind_constant', '/$defs/<edition>/properties/kind', 'is the family kind constant', 'kind_constant',
     "value['kind_only'] is not None and value['kind_property'] != {'const': value['kind_only']}"),
])
phase('int_payload_reconfigure', 'Payload schema: reconfigure change kinds copy the owner enum.', [
    ('IP10_reconfigure_kinds', '/$defs/reconfigure_change_kind/enum', 'equals the Collaborative Workflows change kinds', 'reconfigure_change_kind_copy',
     "value['change_kinds'] != value['owner_change_kinds']"),
])
phase('int_payload_reason', 'Payload schema: failure reasons are section 11 without cancelled.', [
    ('IP11_reason_enum', '/$defs/<failed or participant_completed>/properties/<reason>/enum', 'is section 11 collaboration_error without cancelled',
     'reason_enum_is_section_11_without_cancelled', "set(value['reasons']) != set(value['owner_reasons'])"),
])
phase('int_payload_state', 'Payload schema: lifecycle states are run states.', [
    ('IP12_state_subset', '/$defs/<def>/properties/<state field>/enum', 'is a subset of run_state', 'state_subset_of_run_state',
     "set(value['states']) - set(value['run_states'])"),
])
phase('int_projection_a', 'Projection schema: durable token, stored names and checkpoint families.', [
    ('IJ01_token_copy', '/$defs/durable_read_token', 'equals the hardened coordination token', 'durable_read_token_copy_differs_from_coordination',
     same('token_sha256', 'hardened_coordination_token_sha256')),
    ('IJ02_redb_snapshot', '/$defs', 'no stored definition has redb_snapshot_id', 'redb_snapshot_id_storable', "value['redb_snapshot_sites'] != 0"),
    ('IJ03_nine_fields', '/$defs/durable_read_token/required', 'is the index token required set without redb_snapshot_id', 'durable_token_not_nine_field_projection',
     "set(value['index_token_required']) - {'redb_snapshot_id'} != set(value['token_required'])"),
    ('IJ04_admitted_types', '/$defs/checkpoint/properties/admitted_event_types/items/enum', 'is the 18 families', 'checkpoint_admitted_types',
     "value['admitted_enum_sorted'] != value['families_sorted']"),
    ('IJ05_binding_families', '/x-pm-event-authority-binding/families', 'list the 18 families in order', 'binding_families', "value['binding_families'] != value['families']"),
])
phase('int_projection_family', 'Projection binding: each family row.', [
    ('IJ06_units', '/x-pm-event-authority-binding/families/<i>', 'names the family CWR/CV/SP/ATS units', 'binding_units', "value['units'] != value['expected_units']"),
    ('IJ07_source_family', '/x-pm-event-authority-binding/families/<i>/prepared_source_family_id', 'is collaboration_prepared_source', 'binding_source',
     "value['prepared_source_family_id'] != 'collaboration_prepared_source'"),
    ('IJ08_source_schema', '/x-pm-event-authority-binding/families/<i>/prepared_source_schema_ref', 'is the family prepared-source definition', 'binding_source',
     "value['prepared_source_schema_ref'] != value['expected_source_schema_ref']"),
    ('IJ09_owner_schemas', '/x-pm-event-authority-binding/families/<i>/source_owner_schemas', 'are the editions owner_record refs', 'binding_source',
     "value['source_owner_schemas'] != value['expected_owner_schemas']"),
])
phase('int_projection_def', 'Projection schema: object definitions are closed.', [
    ('IJ10_closed', '/$defs/<def>/additionalProperties', 'an object definition other than durable_read_token is closed', 'projection_closed',
     "value['def_type'] == 'object' and value['additional_properties'] is not False and value['def_name'] != 'durable_read_token'"),
])
phase('int_projection_adoptions', 'Projection binding adoptions.', [
    ('IJ11_checkpoint_adopts', '/x-pm-event-authority-binding/checkpoint/adopts', 'is SP-278', 'binding_adoptions', "value['checkpoint_adopts'] != 'SP-278'"),
    ('IJ12_receipt_resolver', '/x-pm-event-authority-binding/first_receipt_resolver', 'is storage.first_append_receipt.resolve.v2', 'binding_adoptions',
     "value['first_receipt_resolver'] != 'storage.first_append_receipt.resolve.v2'"),
])
phase('int_owner_unit', 'Owner documents carry every lane unit.', [
    ('IU01_unit_present', '/<owner doc>', 'has the plan_unit_id', 'owner_unit_missing', "value['unit_present'] is not True"),
])
phase('int_owner_family', 'Each family unit names its family.', [
    ('IU02_unit_names_family', '/<owner unit>', 'names the event family', 'owner_unit_does_not_name_family', "value['family_named'] is not True"),
])
phase('int_owner_section', 'Collaborative Workflows section 13 names every family.', [
    ('IU03_section_13', '/Plans/Collaborative_Workflows.md#13', 'names the event family', 'section_13_name_missing', "value['family_named'] is not True"),
])
phase('int_ledger', 'Admission ledger schema and order.', [
    ('IL01_ledger_schema', '/', 'conforms to the ledger schema', 'ledger_schema', "value['ledger_schema_errors'] != 0"),
    ('IL02_ledger_order', '/rows', 'are in family order', 'ledger_order', "value['row_event_types'] != value['families']"),
])
phase('int_ledger_row_a', 'Ledger row: registry row schema, digest, identity and owner anchors.', [
    ('IL03_row_schema', '/rows/<i>/registry_row', 'conforms to the registry family schema', 'registry_row_schema', "value['row_schema_errors'] != 0"),
    ('IL04_row_sha256', '/rows/<i>/registry_row_sha256', 'equals the canonical row digest', 'registry_row_sha256', "value['registry_row_sha256'] != value['actual_row_sha256']"),
    ('IL05_row_event_type', '/rows/<i>/registry_row/event_type', 'equals the ledger event type', 'row_identity', "value['row_event_type'] != value['event_type']"),
    ('IL06_row_family_id', '/rows/<i>/registry_row/family_id', 'equals the ledger family_id', 'row_identity', "value['row_family_id'] != value['ledger_family_id']"),
    ('IL07_family_id_form', '/rows/<i>/registry_row/family_id', 'is event-family- plus the dashed event type', 'row_identity', "value['row_family_id'] != value['expected_family_id']"),
    ('IL08_semantic_anchor', '/rows/<i>/registry_row/semantic_owner_doc', 'is the family CWR unit', 'owner_anchors', "value['semantic_owner_doc'] != value['expected_semantic_owner_doc']"),
    ('IL09_payload_anchor', '/rows/<i>/registry_row/payload_owner_doc', 'is the family CV unit', 'owner_anchors', "value['payload_owner_doc'] != value['expected_payload_owner_doc']"),
])
phase('int_ledger_ref', 'Ledger row: each payload schema reference resolves.', [
    ('IL10_ref_path', '/rows/<i>/registry_row/**/payload_schema_ref/path', 'is the payload schema path', 'payload_schema_ref_resolves', "value['ref_path'] != value['payload_path']"),
    ('IL11_ref_def', '/rows/<i>/registry_row/**/payload_schema_ref/json_pointer', 'names a payload definition', 'payload_schema_ref_resolves', "value['ref_def_present'] is not True"),
    ('IL12_ref_schema_id', '/rows/<i>/registry_row/**/payload_schema_ref/schema_id', 'equals that definition $id', 'payload_schema_ref_resolves',
     "value['ref_def_present'] is True and value['ref_schema_id'] != value['def_schema_id']"),
])
phase('int_ledger_scope', 'Ledger row: scope policy and editions.', [
    ('IL13_scope_policy', '/rows/<i>/registry_row/scope_policy', 'is application_or_project', 'scope_editions', "value['scope_policy'] != 'application_or_project'"),
    ('IL14_editions', '/rows/<i>/registry_row/payload_versions', 'are project then application', 'scope_editions', "value['edition_kinds'] != ['project', 'application']"),
])
phase('int_ledger_edition', 'Ledger row: each payload edition admission and retention.', [
    ('IL15_producer_admission', '/rows/<i>/registry_row/payload_versions/<j>/producer_admission', 'project: existing_project_policy; application: requires_owner_adoption',
     'producer_admission', "value['producer_admission'] != value['expected_producer_admission']"),
    ('IL16_edition_retention', '/rows/<i>/registry_row/payload_versions/<j>/retention_policy_ref', 'equals the row retention policy', 'edition_retention_differs',
     "value['edition_retention'] != value['row_retention']"),
])
phase('int_ledger_row_b', 'Ledger row: retention, aliases, source refs, case ids and admission.', [
    ('IL17_retention_policy', '/rows/<i>/registry_row/retention_policy_ref/policy_id', 'is RP-CHAT-THREAD-LIFETIME', 'retention_policy_ref', "value['retention_policy_id'] != 'RP-CHAT-THREAD-LIFETIME'"),
    ('IL18_no_alias', '/rows/<i>/registry_row/legacy/aliases', 'is empty', 'no_alias', "value['aliases'] != []"),
    ('IL19_source_ref', '/rows/<i>/registry_row/source_refs', 'cites the ledger row', 'row_source_ref_to_ledger', "value['ledger_source_ref_present'] is not True"),
    ('IL20_case_ids', '/rows/<i>/validation_case_ids', 'are fixture case or oracle ids', 'validation_case_ids_unknown', "value['unknown_case_ids'] != []"),
    ('IL21_authority_ref', '/rows/<i>/authority_contract_ref', 'an admitted row has an authority contract ref', 'admitted_without_authority_ref',
     "value['admission_status'] == 'admitted_static_contract' and not value['authority_contract_ref']"),
])
phase('int_membership_row', 'Registry membership: prepared rows stay out; admitted rows equal their prepared row.', [
    ('IM01_prepared_absent', '/families/<row>', 'a prepared ledger family is not in the registry', 'prepared_family_in_registry',
     "value['admission_status'] != 'admitted_static_contract'"),
    ('IM02_admitted_equal', '/families/<row>', 'an admitted row equals its prepared row', 'admitted_row_differs_from_prepared',
     "value['admission_status'] == 'admitted_static_contract' and value['registry_row_sha256'] != value['prepared_row_sha256']"),
])
phase('int_membership_ledger', 'Registry membership: admitted ledger rows are present.', [
    ('IM03_admitted_present', '/rows/<row>', 'an admitted ledger row is in the registry', 'admitted_ledger_row_missing_from_registry',
     "value['admission_status'] == 'admitted_static_contract' and value['in_registry'] is not True"),
])
phase('int_references', 'Every schema reference resolves, including unused branches.', [
    ('IX01_references', '/<schema document>', 'every $ref resolves', 'unresolved_ref', "value['unresolved_count'] != 0"),
])
PHYS = [('key_shape', 'key_shape'), ('encoding', 'encoding'), ('owner_doc', 'owner_doc'), ('producer', 'producer'),
        ('retention_policy_ref', 'retention_policy_ref'), ('value_schema_ref', 'value_schema_ref'), ('value_schema', 'value_schema'),
        ('schema_version', 'schema_version'), ('value_schema_id', 'value_schema_id')]
phys_rows = [(f'IB{2 + i:02}_{name}', '/families/<projection>/' + name, 'equals the binding record', 'physical_binding',
              same(f'row_{name}_sha256', f'want_{name}_sha256') if name == 'value_schema' else f"value['row_{name}'] != value['want_{name}']")
             for i, (name, _) in enumerate(PHYS)]
phase('int_physical_presence', 'Storage value registry: each projection/checkpoint family is present.', [
    ('IB01_present', '/families/<projection>', 'is registered', 'physical_binding', "value['row_present'] is not True"),
])
phase('int_physical_a', 'Storage value registry: projection/checkpoint binding fields.', phys_rows[:7])
phase('int_physical_b', 'Storage value registry: schema version/id and derived recovery.', phys_rows[7:] + [
    ('IB11_not_backed_up', '/families/<projection>/recovery_disposition/backup_required', 'is not set', 'physical_recovery', "value['backup_required']"),
    ('IB12_derived', '/families/<projection>/recovery_disposition/authority_class', 'is derived_rebuildable', 'physical_recovery', "value['authority_class'] != 'derived_rebuildable'"),
])
phase('int_physical_composition', 'Projection keyed composition copies the expected rows.', [
    ('IB13_composition', '/x-pm-keyed-composition', 'equals the expected unstored composition', 'physical_keyed_composition', same('composition_sha256', 'expected_composition_sha256')),
])
SRC = [('value_schema_ref', "value['value_schema_ref'] != value['source_path']"), ('encoding', "value['encoding'] != 'messagepack_canonical'"),
       ('producer', "value['producer'] != ['CollaborationRuntime']"), ('backup_required', "not value['backup_required']"),
       ('value_schema', same('value_schema_sha256', 'expected_value_schema_sha256')), ('value_schema_id', "value['value_schema_id'] != 'pm.collaboration.prepared_source.v1'"),
       ('key_shape', "value['key_shape'] != value['expected_key_shape']"), ('retention_policy_ref', "value['retention_policy_ref'] != 'RP-CHAT-THREAD-LIFETIME'"),
       ('authority_class', "value['authority_class'] != 'canonical_non_rebuildable'")]
src_rows = [(f'IS{2 + i:02}_{name}', '/families/collaboration_prepared_source/' + name, 'equals the prepared-source binding', 'source_physical_binding', body)
            for i, (name, body) in enumerate(SRC)]
phase('int_source_physical_presence', 'Storage value registry: the prepared source family is present.', [
    ('IS01_present', '/families/collaboration_prepared_source', 'is registered', 'source_physical_binding', "value['row_present'] is not True"),
])
phase('int_source_physical_a', 'Storage value registry: prepared source binding (schema, codec, writer, backup).', src_rows[:5])
phase('int_source_physical_b', 'Storage value registry: prepared source binding (id, key, retention, authority).', src_rows[5:])
phase('int_ats', 'ATS family units cite every validation case id.', [
    ('IA01_cited', '/rows/<i>/validation_case_ids', 'are each cited in the family ATS unit', 'ats_case_ids', "value['uncited_case_ids'] != []"),
])
phase('int_probe', 'Every contract probe returns its expected first refusal.', [
    ('IQ01_probe', '/<probe>', 'returns the expected result', 'contract_probe', "value['result'] != value['expected']"),
])
# fixture oracle comparisons (fixture_report)
phase('fix_numeric', 'Fixture: numeric vectors and family numeric identity.', [
    ('IF01_numeric_canonical', '/numeric_vectors/<i>', 'decodes to its canonical text', 'numeric_canonical', "value['actual_canonical'] != value['canonical']"),
])
phase('fix_numeric_family', 'Fixture: an alternate numeric spelling keeps every v1 identity and is refused as a current input (CV-1100).', [
    ('IF02_numeric_identity', '/numeric_family_cases/<i>', 'alternate spelling gives the same v1 identities', 'numeric_identity', "value['original_identities'] != value['alternate_identities']"),
    ('IF03_numeric_current', '/numeric_family_cases/<i>/current_rejection', 'the alternate spelling as a current input refuses exactly as the case records (CV-1100)', 'numeric_identity',
     "value['alternate_rejection'] != value['expected_current_rejection']"),
])
phase('fix_payload', 'Fixture: positive payloads accept in their edition; negatives refuse at their layer.', [
    ('IF04_positive_payload', '/payloads/<i>', 'accepts', 'positive_payload', "value['positive_rejection'] is not None"),
    ('IF05_positive_edition', '/payloads/<i>', 'is in its declared edition', 'positive_payload', "value['positive_edition'] != value['declared_edition']"),
    ('IF06_negative_layer', '/invalid_payloads/<i>', 'refuses at its first failing layer', 'negative_payload_layer', "value['negative_rejection'] != value['expected_layer']"),
])
phase('fix_event', 'Fixture: valid events accept with their payload case; invalid events refuse at their join.', [
    ('IF07_valid_event', '/valid_events/<i>', 'accepts', 'valid_event', "value['event_rejection'] is not None"),
    ('IF08_valid_event_payload', '/valid_events/<i>/record/payload', 'equals its payload case', 'valid_event', same('record_payload_sha256', 'payload_case_sha256')),
    ('IF09_invalid_event', '/invalid_events/<i>', 'refuses at its join', 'invalid_event_join', "value['join_rejection'] != value['expected_join']"),
])
phase('fix_identity', 'Fixture: identity vectors.', [
    ('IF10_identity_vector', '/identity_vectors/<i>/expected', 'equals the recomputed identities', 'identity_vector', "value['identities'] != value['expected_identities']"),
    ('IF11_identity_partition', '/identity_vectors/<i>/scope_partition', 'equals the recomputed partition', 'identity_vector', "value['partition'] != value['expected_partition']"),
    ('IF12_new_epoch_key', '/identity_vectors/<i>/prior_epoch_idempotency_key', 'differs from the new-epoch key', 'new_epoch_reuses_key',
     "value['prior_epoch_key'] is not None and value['prior_epoch_key'] == value['idempotency_key']"),
])
phase('fix_sequence', 'Fixture: transition sequences.', [
    ('IF13_step_payload', '/transition_sequences/<i>/steps/<j>/payload', 'is a valid payload', 'sequence_payload_invalid', "value['step_payload_rejection'] is not None"),
    ('IF14_step_result', '/transition_sequences/<i>/steps/<j>/expected', 'equals the reducer result', 'transition', "value['step_result'] != value['step_expected']"),
])
phase('fix_final_state', 'Fixture: sequence final state.', [
    ('IF15_final_state', '/transition_sequences/<i>/final_state/<key>', 'equals the reducer final state', 'final_state', "value['state_value'] != value['expected_value']"),
])
phase('fix_transition_case', 'Fixture: isolated transition cases and their valid counterparts.', [
    ('IF16_transition_case', '/transition_cases/<i>', 'returns its expected refusal', 'transition_case', "value['case_result'] != value['case_expected']"),
    ('IF17_transition_counterpart', '/transition_cases/<i>/valid_value', 'accepts', 'transition_valid_counterpart', "value['counterpart_result'] is not None"),
])
phase('fix_prepared', 'Fixture: prepared sources and their events accept.', [
    ('IF18_prepared_source', '/prepared_sources/<i>', 'accepts', 'prepared_source', "value['source_rejection'] is not None"),
    ('IF19_prepared_event', '/prepared_sources/<i>/event', 'accepts', 'prepared_event', "value['source_rejection'] is None and value['event_rejection'] is not None"),
])
phase('fix_projection', 'Fixture: projection values and checkpoint semantics.', [
    ('IF20_projection_value', '/projection_values/<i>', 'conforms to its definition', 'projection_value', "value['projection_valid'] is not True"),
    ('IF21_checkpoint', '/projection_values/<i>', 'a checkpoint passes its context joins', 'checkpoint_semantics',
     "value['projection_valid'] is True and value['checkpoint_rejection'] is not None"),
    ('IF22_invalid_projection', '/invalid_projection_values/<i>', 'is refused by its definition', 'invalid_projection_value_accepted', "value['invalid_valid'] is True"),
])
FLOOR = [('positive', 3), ('negative', 7), ('vectors', 3), ('sequences_appended', 1), ('sequences_refused', 1)]
floor_rows = [(f'IF{23 + i:02}_floor_{name}', f'/<family>/{name}', f'has at least {n}', 'family_case_floor', f"value['{name}'] < {n}")
              for i, (name, n) in enumerate(FLOOR)]
phase('fix_floor', 'Fixture: per-family case floors.', floor_rows + [
    ('IF28_floor_editions', '/<family>/valid_events', 'cover both scopes', 'family_case_floor', "value['valid_event_scopes'] != ['application', 'project']"),
    ('IF29_floor_joins', '/<family>/invalid_events', 'cover at least four joins', 'family_case_floor', "len(value['joins']) < 4"),
])
phase('fix_native', 'Fixture: native obligations stay NOT_RUN.', [
    ('IF30_native_status', '/required_native_oracles/<i>/status', 'is NOT_RUN', 'native_status', "value['status'] != 'NOT_RUN'"),
])
phase('shared_table_order', 'Every table factory requires its rows in table order.', [
    ('TO01_require_order', '/<table module>', 'check() requires every row in table order', 'table_require_order', "value['require_order'] != value['table_order']"),
])

HEADER = '''"""DC guard table {name}: {doc}

Method B guard rows for scripts/pm_collaboration_events.py, generated by
scripts/pm-collab-table-generate.py. Each predicate reads one observation
record that the lane checker derives from the complete boundary input
(canonical digests, recomputed identities, resolved routes); predicates never
recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm_collaboration_events.py:table_refusals), and asserts
that the factory requires its rows in table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g
'''


def emit(name, doc, rows):
    fields = []
    for row in rows:
        text = row[4] if isinstance(row[4], str) else '\n'.join(row[4])
        for f in re.findall(r"value\['(\w+)'\]", text):
            if f not in fields:
                fields.append(f)
    out = [HEADER.format(name=name, doc=doc), '\nFIELDS = ' + repr(tuple(fields)) + '\n']
    for rname, field, words, code, body in rows:
        lines = [f"return {code!r} if {body} else None"] if isinstance(body, str) else body
        out.append(f'\n\ndef {rname}(value, context):\n' + ''.join('    ' + line + '\n' for line in lines))
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
    wanted = {OUT / f'pm_collab_table_{name}.py': emit(name, doc, rows) for name, (doc, rows) in PHASES.items()}
    present = set(OUT.glob('pm_collab_table_*.py'))
    problems = sorted(str(p) for p in present - set(wanted))
    for path, text in wanted.items():
        if check:
            if not path.exists() or path.read_text() != text:
                problems.append(str(path))
        else:
            path.write_text(text)
    if not check:
        for path in present - set(wanted):
            path.unlink()
    print(f'{len(wanted)} tables, {len(names)} rows' + (f'; stale or extra: {problems}' if problems else ''))
    return 1 if check and problems else 0


if __name__ == '__main__':
    sys.exit(main())

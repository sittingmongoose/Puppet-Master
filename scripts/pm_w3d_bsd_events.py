#!/usr/bin/env python3
"""W3D Back Seat Driver phase-2 oracles: 15 families, complete checker over guard tables.

Static synthetic oracles for BSD/CV/SP-1350..1364 (+SP-1365) and ATS-1230. No
native execution: native owner results, Storage records and receipts are fixture
authorities built here, never provider or Storage proof (native NOT_RUN).

Every refusal is decided only by the rows of scripts/pm_w3d_bsd_table_<phase>.py
(generated from scripts/pm_w3d_bsd_rows.py), evaluated in row order on an
observation dict the checker derives from the complete boundary input. The
derivation code below computes observations; it never decides acceptance.
Shared calls: pm_event_numbers (CV-1100/SP-1100/SP-1101) at every integer slot,
producer digest, physical bytes, CV-339 commitment and the retained dispatcher;
pm_event_datetime.date_time (CV-1101) at every timestamp field with its owner
profile. Retained reads select their recipe only from the one independently
sealed receipt for that exact original (SP-1101, batch 2 fix 1). RECORDER is set
only by the guard-table suite builder.
"""
import base64
import copy
import hashlib
import importlib
import json
import re
import sys
import unicodedata
from contextlib import contextmanager
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))

import blake3  # noqa: E402
import msgpack  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402
from referencing import Registry, Resource  # noqa: E402
from referencing.jsonschema import DRAFT202012  # noqa: E402

from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time  # noqa: E402
from pm_event_numbers import (  # noqa: E402
    EVENT_VALUE, INDEX_BINDING, PRODUCER_FIELDS, FrozenRecipe, OriginalBinding, OriginalCustody,
    RecipeTuple, Refusal, RetainedDispatcher, current_integer, decode_storage_value,
    full_value_commitment, producer_semantic_digest, qualified_jcs, storage_uint64, storage_value_bytes,
)
import pm_w3d_bsd_rows as rows_spec  # noqa: E402
import pm_w3d_bsd_spec as spec  # noqa: E402

STORAGE = '11111111-1111-4111-8111-111111111111'
OTHER_STORAGE = '22222222-2222-4222-8222-222222222222'
SERVER = 'server-A'
PROJECT = 'project-A'
INLINE_LIMIT = 16 * 1024
PACK_MEDIA = 'application/msgpack'
TABLE_PREFIX = 'pm_w3d_bsd_table_'
RECORDER = None

# --- schemas (closed preloaded registry; no retrieval) ----------------------
SCHEMA_FILES = ('bsd_event_storage_contracts', 'bsd_event_payloads', 'back_seat_driver_contracts',
                'event_record', 'event_append_receipt_contracts')


def _load(path):
    return json.loads((ROOT / path).read_text())


SCHEMAS = {name: _load(f'Plans/{name}.schema.json') for name in SCHEMA_FILES}
BSD_ID = SCHEMAS['bsd_event_storage_contracts']['$id']
PAYLOAD_ID = SCHEMAS['bsd_event_payloads']['$id']
LOGICAL_ID = SCHEMAS['back_seat_driver_contracts']['$id']
RECEIPT_ID = SCHEMAS['event_append_receipt_contracts']['$id']


def _registry():
    pairs = []
    for name, schema in SCHEMAS.items():
        resource = Resource.from_contents(schema, default_specification=DRAFT202012)
        pairs.append((schema['$id'], resource))
        pairs.append((f'https://puppetmaster.local/Plans/{name}.schema.json', resource))
    return Registry().with_resources(pairs)


REGISTRY = _registry()
ENVELOPE_VALIDATOR = Draft202012Validator(SCHEMAS['event_record'], registry=REGISTRY)
CUSTODY_VALIDATOR = Draft202012Validator({'$ref': RECEIPT_ID + '#/$defs/custody_v2'}, registry=REGISTRY)
RECEIPT_VALIDATOR = Draft202012Validator({'$ref': RECEIPT_ID + '#/$defs/AppendReceipt'}, registry=REGISTRY)
PAYLOAD_VALIDATORS = {f['slug']: Draft202012Validator({'$ref': f'{PAYLOAD_ID}#/$defs/{f["slug"]}'}, registry=REGISTRY)
                      for f in spec.FAMILIES}
OPERATION_VALIDATORS = {f['slug']: Draft202012Validator({'$ref': f'{BSD_ID}#/$defs/{f["slug"]}_operation'}, registry=REGISTRY)
                        for f in spec.FAMILIES}
CHECKPOINT_VALIDATORS = {f['slug']: Draft202012Validator({'$ref': f'{BSD_ID}#/$defs/{f["slug"]}_checkpoint'}, registry=REGISTRY)
                         for f in spec.FAMILIES}
WRAPPER_VALIDATORS = {f['slug']: Draft202012Validator({'$ref': f'{BSD_ID}#/$defs/source_{f["source_kind"]}'}, registry=REGISTRY)
                      for f in spec.FAMILIES}
HEAD_VALIDATORS = {f['slug']: Draft202012Validator({'$ref': f'{BSD_ID}#/$defs/head_{f["source_kind"]}'}, registry=REGISTRY)
                   for f in spec.FAMILIES if f['source_kind'] != 'review_start'}
LOGICAL_VALIDATORS = {kind: Draft202012Validator({'$ref': f'{LOGICAL_ID}#/$defs/bsd_{kind}'}, registry=REGISTRY)
                      for kind in ('policy', 'workflow_binding', 'assignment', 'review_cycle', 'finding', 'quarantine')}
START_BODY_VALIDATOR = Draft202012Validator({'$ref': f'{BSD_ID}#/$defs/review_start'}, registry=REGISTRY)
IDENTITY_INPUTS_VALIDATOR = Draft202012Validator({'$ref': f'{BSD_ID}#/$defs/finding_identity_inputs'}, registry=REGISTRY)
JOIN_FIELD_VALIDATORS = {
    f['slug']: {field: Draft202012Validator({'$ref': f'{PAYLOAD_ID}#/$defs/{f["slug"]}/properties/{field}'},
                                            registry=REGISTRY)
                for field in ('policy_revision', 'binding_id', 'bsd_assignment_id', 'primary_run_id', 'epoch',
                              'primary_generation', 'review_cycle_id')}
    for f in spec.FAMILIES}


def resolve_every_ref():
    """Standing check 9: every $ref in the lane schemas resolves (eagerly, all branches)."""
    missing = []

    def walk(node, base, where):
        if isinstance(node, dict):
            ref = node.get('$ref')
            if isinstance(ref, str):
                try:
                    REGISTRY.resolver(base_uri=base).lookup(ref)
                except Exception as error:  # noqa: BLE001 - a dangling ref is the reported defect
                    missing.append((where, ref, type(error).__name__))
            for k, v in node.items():
                walk(v, base, f'{where}/{k}')
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, base, f'{where}/{i}')
    for name in ('bsd_event_storage_contracts', 'bsd_event_payloads'):
        walk(SCHEMAS[name], SCHEMAS[name]['$id'], name)
    return missing


# --- exact helpers -----------------------------------------------------------
def same(a, b):
    """Exact typed JSON equality: bool is never an integer, 1.0 is never 1."""
    if type(a) is not type(b):
        return False
    if type(a) is dict:
        return set(a) == set(b) and all(same(a[k], b[k]) for k in a)
    if type(a) is list:
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    return a == b


def ok(fn, *args, **kwargs):
    """True when a shared call accepts; a Refusal is the shared refusal, any other error propagates."""
    try:
        fn(*args, **kwargs)
        return True
    except Refusal:
        return False


def uint64_ok(value):
    return ok(storage_uint64, value)


def clock_ok(value, profile):
    """date_time accepts the string under the owner profile and returns it unchanged."""
    if type(value) is not str:
        return False
    try:
        return date_time(value, profile=profile) == value
    except Refusal:
        return False


def sha(data):
    return hashlib.sha256(data).hexdigest()


def hexs(text):
    return text.encode('utf-8').hex()


def is_hex(text):
    return type(text) is str and len(text) % 2 == 0 and len(text) > 0 and all(c in '0123456789abcdef' for c in text)


def digest_or_none(event):
    try:
        return producer_semantic_digest(event)
    except Refusal:
        return None


def value_hash(record):
    try:
        return sha(storage_value_bytes(record, profile=EVENT_VALUE))
    except Refusal:
        return None


def binding_hash(value):
    try:
        return sha(storage_value_bytes(value, profile=INDEX_BINDING))
    except Refusal:
        return None


def encoded_len(value, profile):
    try:
        return len(storage_value_bytes(value, profile=profile))
    except Refusal:
        return None


@contextmanager
def exact_integer_digits():
    """Integers render exactly; a 4,400-digit integer must reach a refusal row, never crash."""
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        yield
    finally:
        sys.set_int_max_str_digits(previous)


# --- identity recipes (CV-135x, Storage project~) ----------------------------
def partition_for(project_id):
    return 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')


def operation_for(original_source_id, transition, subject_id):
    return f'bsd-op@1:{hexs(original_source_id)}:{hexs(transition)}:{hexs(subject_id)}'


def event_id_for(storage, event_type, project_id, operation):
    return f'bsd-event@1:{hexs(storage)}:{hexs(event_type)}:{hexs(project_id)}:{hexs(operation)}'


def key_for(project_id, operation):
    return f'bsd-key@1:{hexs(project_id)}:{hexs(operation)}'


def finding_key_normalized(inputs):
    """CV-1350/CV-1355..1358 string-only finding-key recipe over the authenticated operands.

    The RFC8785 preimage uses the shared qualified_jcs call (CV-1100), not a
    lane-local serializer. Normalization follows the owner recipe exactly.
    """
    family = unicodedata.normalize('NFKC', inputs['finding_family']).lower()
    collapsed = []
    for ch in family:
        if ch.isalnum():
            collapsed.append(ch)
        elif not collapsed or collapsed[-1] != '_':
            collapsed.append('_')
    normalized = ''.join(collapsed).strip('_')
    affected = sorted(set(inputs['affected_object_refs']), key=lambda s: s.encode('utf-8'))
    rules = sorted(set(inputs['rule_or_constraint_refs']), key=lambda s: s.encode('utf-8'))
    preimage = qualified_jcs([normalized, affected, rules, inputs['evidence_fingerprint']])
    return 'bsd-finding@1:' + sha(preimage)

# --- world construction --------------------------------------------------------
SUBJECTS = {'finding': 'finding-0001', 'assignment': 'assignment-0001', 'quarantine': 'quarantine-0001',
            'policy': 'policy-0001', 'review_cycle': 'cycle-0001', 'review_start': 'cycle-0001',
            'workflow_binding': 'binding-0001'}


def make_scope():
    return {'schema_id': 'pm.workflow_scope.v2', 'schema_version': '2.0.0', 'scope_kind': 'project',
            'scope_partition': partition_for(PROJECT), 'project_id': PROJECT,
            'project_home_server_id': SERVER, 'named_plan_id': None, 'server_id': SERVER}


def base_native(fam):
    slug = fam['slug']
    backed = fam['assignment_backed']
    native = {
        'owner': fam['producer'], 'accepted': True, 'event_type': fam['event_type'], 'scope': make_scope(),
        'original_source_id': ('admission-0001' if slug == 'review_started' else f'pmref:source.{slug}.0001'),
        'subject_id': SUBJECTS[fam['source_kind']],
        'actor_ref': 'pmref:actor.alpha', 'thread_id': 'thread-1',
        'requested_account_ref': 'pmref:account.alpha', 'effective_account_ref': 'pmref:account.alpha',
        'correlation_id': f'corr-{slug}-0001', 'causation_event_id': None, 'parent_event_id': None,
        'node_id': None, 'attempt_id': None,
        'occurred_at_utc': '2026-11-01T10:00:00.5+02:00',
        'policy_revision': 3, 'binding_id': 'binding-0001',
        'bsd_assignment_id': 'assignment-0001' if backed else None,
        'primary_run_id': 'run-1' if backed else None,
        'epoch': 2 if backed else None, 'primary_generation': 4 if backed else None,
        'review_cycle_id': 'cycle-0001' if slug in rows_spec.REVIEW_CHAIN else None,
        'writer_generation': 3, 'redaction_profile': 'secret_refs_only',
        'facts': copy.deepcopy(fam['positive_facts']),
    }
    return native


def make_payload(fam, cap, W):
    slug = fam['slug']
    f = cap['facts']
    op = W['operation_id']
    payload = {'schema_id': fam['payload_schema_id'], 'schema_version': '1.0.0',
               'project_id': PROJECT, 'owner_operation_id': op, 'source_state_ref': W['wrapper_ref'],
               'policy_revision': cap['policy_revision'], 'binding_id': cap['binding_id'],
               'bsd_assignment_id': cap['bsd_assignment_id'], 'primary_run_id': cap['primary_run_id'],
               'epoch': cap['epoch'], 'primary_generation': cap['primary_generation'],
               'review_cycle_id': cap['review_cycle_id'], 'primary_run_mutated': False, 'authority_granted': False}
    finding = {'bsd_finding_id': 'finding-0001', 'finding_key': W['finding_key'],
               'finding_ref': 'pmref:finding.body.0001'}
    if slug == 'advice_emitted':
        payload.update(finding, severity=f['finding_severity'], delivery_basis=f['delivery_basis'],
                       presentation_weight='aside' if (f['finding_severity'] == 'nit' or f['cooldown_routed']) else 'note',
                       raised_against_generation=3, latest_checked_generation=5,
                       emission_boundary_ref='pmref:boundary.0001', stale=f['stale_decision'],
                       unreconfirmed=f['unreconfirmed_decision'])
    elif slug == 'assignment_paused':
        payload.update(previous_state=f['prior_assignment_state'] if f['prior_assignment_state'] != 'paused' else 'reviewing',
                       state='paused', pause_cause=f['pause_cause'], pause_source_ref='pmref:pause.source.0001')
    elif slug == 'assignment_resumed':
        payload.update(previous_state='paused', previous_pause_cause='user',
                       resume_source_ref='pmref:resume.source.0001', cursor_ref='pmref:cursor.0007')
    elif slug == 'assignment_started':
        payload.update(stage_id='stage-0001', effective_mode=f['resolved_mode'] if f['resolved_mode'] in ('Auto', 'On') else 'Auto',
                       assignment_ref='pmref:assignment.body.0001', cursor_ref='pmref:cursor.0004',
                       stable_prefix_hash=sha(b'W3D stable prefix'), requested_effective_snapshot_ref=f['snapshot_ref'],
                       read_only_tool_profile_id='profile-bsd-read-only')
    elif slug == 'assignment_stopped':
        payload.update(previous_state=f['prior_assignment_state'] if f['prior_assignment_state'] != 'stopped' else 'reviewing',
                       state='stopped', stop_source_ref='pmref:stop.source.0001', cursor_ref='pmref:cursor.0007')
    elif slug == 'finding_cleared':
        payload.update(finding, previous_state=f['prior_finding_state'] if f['prior_finding_state'] in ('held', 'reconfirming') else 'held',
                       clear_basis=f['clear_basis'], raised_against_generation=3, latest_checked_generation=5,
                       clear_source_ref='pmref:clear.source.0001')
    elif slug == 'finding_held':
        payload.update(finding, severity=f['finding_severity'], raised_against_generation=3,
                       hold_basis='asynchronous_high_severity' if f['hold_basis'] == 'async_high' else 'terminal_nit',
                       evidence_fingerprint=W['evidence_fingerprint'])
    elif slug == 'finding_reconfirmed':
        payload.update(finding, previous_state='held', previous_severity=f['prior_severity'],
                       severity=f['finding_severity'], raised_against_generation=f['raised_against_generation'],
                       latest_checked_generation=f['latest_checked_generation'],
                       reconfirmation_count=f['reconfirmation_count'],
                       reconfirmation_source_ref='pmref:reconfirm.source.0001')
    elif slug == 'finding_suppressed':
        payload.update(finding, suppression_reason='duplicate_suppressed' if f['suppression_kind'] == 'duplicate' else 'content_free_suppressed',
                       severity='concern', evidence_fingerprint=W['evidence_fingerprint'],
                       suppression_source_ref='pmref:suppress.source.0001')
    elif slug == 'output_quarantined':
        payload.update(quarantine_id='quarantine-0001', quarantine_ref='pmref:quarantine.body.0001',
                       reason='malformed_output', payload_hash=sha(b'W3D quarantined output'),
                       retained_payload_ref='pmref:quarantine.retained.0001',
                       consecutive_quarantine_count=f['consecutive_quarantine_count'],
                       reset_attempted=False, terminal_action=f['terminal_action'])
    elif slug == 'policy_changed':
        payload.update(policy_id='policy-0001', previous_policy_revision=f['actual_prior_revision'],
                       changed_fields=list(f['claimed_changed_fields']), policy_ref='pmref:policy.body.0001',
                       policy_change_source_ref='pmref:policy.change.0001')
    elif slug == 'review_failed':
        payload.update(result='failed', review_ref='pmref:review.body.0001',
                       failure_source_ref='pmref:failure.source.0001', failure_reason_ref='pmref:failure.reason.0001',
                       usage_attempt_ref=None)
    elif slug == 'review_started':
        payload.update(review_start_ref=W['wrapper_ref'], trigger_kind=f['trigger_kind'],
                       input_manifest_ref='pmref:manifest.0001', redaction_receipt_ref='pmref:redaction.0001',
                       frozen_boundary=f['frozen_boundary'], usage_attempt_ref=None)
    elif slug == 'review_timed_out':
        payload.update(result='timed_out', review_ref='pmref:review.body.0001',
                       timeout_source_ref='pmref:timeout.source.0001', deadline_ref='pmref:deadline.0001',
                       usage_attempt_ref=None)
    elif slug == 'workflow_binding_created':
        payload.update(workflow_kind='assistant', workflow_id='workflow-0001', binding_revision=2,
                       previous_binding_ref=f['previous_binding_ref'], binding_ref='pmref:binding.body.0001',
                       binding_source_ref='pmref:binding.source.0001')
    return payload


def make_envelope(fam, cap, payload, meta):
    op = operation_for(cap['original_source_id'], fam['event_type'], cap['subject_id'])
    return {
        'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': 'project',
        'event_id': event_id_for(STORAGE, fam['event_type'], PROJECT, op),
        'event_type': fam['event_type'], 'project_id': PROJECT,
        'thread_id': cap['thread_id'], 'run_id': cap['primary_run_id'], 'node_id': cap['node_id'],
        'attempt_id': cap['attempt_id'], 'actor_ref': cap['actor_ref'],
        'requested_account_ref': cap['requested_account_ref'], 'effective_account_ref': cap['effective_account_ref'],
        'occurred_at_utc': cap['occurred_at_utc'], 'observed_at_utc': meta['observed_at_utc'],
        'persisted_at_utc': meta['persisted_at_utc'], 'sequence_id': meta['sequence_id'], 'producer_sequence_id': None,
        'correlation_id': cap['correlation_id'], 'causation_event_id': cap['causation_event_id'],
        'parent_event_id': cap['parent_event_id'], 'idempotency_key': key_for(PROJECT, op),
        'payload_schema_id': fam['payload_schema_id'], 'payload': payload, 'payload_ref': None,
        'redaction_profile': cap['redaction_profile'], 'replay_policy': 'dedupe_by_idempotency_key',
        'migration': {'migrated_from_schema_id': None, 'migrated_from_schema_version': None, 'migration_id': None,
                      'compatibility_event_type': None},
    }


def pack_for(value):
    try:
        raw = storage_value_bytes(value, profile=EVENT_VALUE)
    except Refusal:
        raw = b'\xc0'
    return raw, f'pm-payload-ref:v1:blake3:{blake3.blake3(raw).hexdigest()}:{len(raw)}:{PACK_MEDIA}'


def logical_body(fam, cap, W):
    """A valid complete logical BSD record of the wrapper's kind (existing schema)."""
    kind = fam['source_kind']
    f = cap['facts']
    ts = '2026-11-01T09:00:00Z'
    if kind == 'policy':
        return {'schema_id': 'pm.bsd.policy.v1', 'schema_version': '1.0.0', 'project_id': PROJECT,
                'mode': 'Auto', 'model_selection': 'provider_default', 'requested_model_id': None,
                'requested_persona_id': None, 'trigger_sensitivity': 'balanced',
                'read_only_tool_profile_id': 'profile-bsd-read-only', 'catch_up_seconds': 30,
                'interruption_cooldown_turns': 2, 'per_thread_cost_limit': 100, 'per_stage_review_limit': 3,
                'retain_transcript': True, 'project_watch_instructions_ref': None, 'stage_defaults_ref': None,
                'revision': cap['policy_revision']}
    if kind == 'workflow_binding':
        return {'schema_id': 'pm.bsd.workflow_binding.v1', 'schema_version': '1.0.0', 'binding_id': 'binding-0001',
                'workflow_kind': 'assistant', 'workflow_id': 'workflow-0001', 'policy_revision': cap['policy_revision'],
                'stage_bindings': [{'stage_id': 'stage-0001', 'stage_mode': 'auto'}], 'created_at': ts}
    if kind == 'assignment':
        return {'schema_id': 'pm.bsd.assignment.v1', 'schema_version': '1.0.0', 'bsd_assignment_id': 'assignment-0001',
                'binding_id': 'binding-0001', 'stage_id': 'stage-0001', 'primary_run_id': 'run-1',
                'advisor_attempt_id': 'attempt-0001', 'epoch': cap['epoch'], 'cursor': 'cursor-0007',
                'stable_prefix_hash': sha(b'W3D stable prefix'),
                'requested_effective_snapshot_ref': 'pmref:snapshot.frozen.0001', 'state': 'reviewing'}
    if kind == 'finding':
        body = {'schema_id': 'pm.bsd.finding.v1', 'schema_version': '1.0.0', 'bsd_finding_id': 'finding-0001',
                'finding_key': W['finding_key'], 'assignment_id': 'assignment-0001',
                'raised_against_generation': 3, 'latest_checked_generation': 5, 'severity': 'concern',
                'claim': 'redacted claim ref', 'affected_object_refs': ['pmref:object.a'],
                'rule_or_constraint_refs': ['pmref:rule.a'], 'evidence_refs': ['pmref:evidence.newer.0001'],
                'state': 'held', 'reconfirmation_count': 1, 'closed_reason': None,
                'created_at': ts, 'updated_at': ts}
        return body
    if kind == 'quarantine':
        return {'schema_id': 'pm.bsd.quarantine.v1', 'schema_version': '1.0.0', 'quarantine_id': 'quarantine-0001',
                'assignment_id': 'assignment-0001', 'review_cycle_id': 'cycle-0001', 'reason': 'malformed_output',
                'payload_hash': sha(b'W3D quarantined output'), 'retained_payload_ref': 'pmref:quarantine.retained.0001',
                'reset_attempted': False, 'terminal_action': f['terminal_action'], 'created_at': ts}
    if kind == 'review_cycle':
        return {'schema_id': 'pm.bsd.review_cycle.v1', 'schema_version': '1.0.0', 'review_cycle_id': 'cycle-0001',
                'bsd_assignment_id': 'assignment-0001', 'trigger_kind': 'pre_first_material_mutation',
                'trigger_reason': 'reason-0001', 'primary_generation': 4, 'input_manifest_ref': 'pmref:manifest.0001',
                'result': 'failed' if fam['slug'] == 'review_failed' else 'timed_out',
                'usage_attempt_ref': None, 'latency_ms': None, 'created_at': ts,
                'frozen_boundary': False, 'no_call_reason': None}
    if kind == 'review_start':
        return start_body(cap, W)
    raise KeyError(kind)


def start_body(cap, W):
    f = cap['facts']
    return {'schema_id': 'pm.bsd.review_start.v1', 'schema_version': '1.0.0',
            'review_admission_id': cap['original_source_id'], 'project_id': PROJECT,
            'policy_revision': cap['policy_revision'], 'binding_id': cap['binding_id'],
            'bsd_assignment_id': cap['bsd_assignment_id'], 'primary_run_id': cap['primary_run_id'],
            'epoch': cap['epoch'], 'primary_generation': cap['primary_generation'],
            'review_cycle_id': 'cycle-0001', 'trigger_kind': f.get('trigger_kind', 'pre_first_material_mutation'),
            'input_manifest_ref': 'pmref:manifest.0001', 'redaction_receipt_ref': 'pmref:redaction.0001',
            'frozen_boundary': f.get('frozen_boundary', False), 'assignment_ref': 'pmref:assignment.body.0001',
            'binding_ref': 'pmref:binding.body.0001', 'admission_ref': 'pmref:admission.accepted.0001',
            'origin_context_ref': 'pmref:origin.context.0001', 'cursor_ref': 'pmref:cursor.0004',
            'requested_effective_snapshot_ref': 'pmref:snapshot.frozen.0001',
            'stable_prefix_hash': sha(b'W3D stable prefix'), 'trigger_reason': 'reason-0001'}


def identity_inputs(cap, W):
    return {'schema_id': 'pm.bsd.finding_identity_inputs.v1', 'schema_version': '1.0.0',
            'original_source_ref': 'pmref:finding.decision.0001', 'finding_family': 'Advisor.Concern!v1',
            'affected_object_refs': ['pmref:object.a'], 'rule_or_constraint_refs': ['pmref:rule.a'],
            'evidence_fingerprint': W['evidence_fingerprint'], 'evidence_source_ref': 'pmref:evidence.owner.0001'}


def wrapper_for(fam, kind, subject, op, body, W, m):
    raw, ref = pack_for(body)
    wrapper = {'schema_id': f'pm.bsd.source_wrapper.{kind}.v1', 'schema_version': '1.0.0',
               'project_id': PROJECT, 'subject_id': subject, 'owner_operation_id': op,
               'logical_schema_id': f'pm.bsd.{kind}.v1', 'logical_schema_version': '1.0.0',
               'logical_payload_ref': ref, 'logical_payload_byte_size': len(raw),
               'logical_payload_media_type': PACK_MEDIA,
               'original_source_ref': 'pmref:original.accepted.0001'}
    if kind == 'finding':
        wrapper['identity_inputs_ref'] = W['identity_inputs_ref']
    wrapper = hook(m, 'wrapper', wrapper, W)
    return wrapper, {'store': {ref.split(':')[3]: raw}, 'ref': ref, 'body': body}


def hook(muts, name, obj, W):
    fn = muts.get(name)
    if fn is None:
        return obj
    if not callable(fn):
        return fn
    result = fn(obj, W)
    # A hook replaces the object only by returning one of the same type; side-effect hooks return None or a tuple.
    return result if type(result) is type(obj) else obj


def unrelated_record(seq):
    return {'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': 'project',
            'event_id': f'run-started-{seq}', 'event_type': 'run.started', 'project_id': PROJECT,
            'thread_id': 'thread-1', 'run_id': 'run-1', 'node_id': None, 'attempt_id': None,
            'actor_ref': 'pmref:actor.beta', 'requested_account_ref': None, 'effective_account_ref': None,
            'occurred_at_utc': '2026-11-01T09:00:00Z', 'observed_at_utc': '2026-11-01T09:00:00Z',
            'persisted_at_utc': '2026-11-01T09:00:01Z', 'sequence_id': seq, 'producer_sequence_id': None,
            'correlation_id': 'corr-run', 'causation_event_id': None, 'parent_event_id': None,
            'idempotency_key': f'run@1:{seq}', 'payload_schema_id': 'pm.event_payload.run_started.v2',
            'payload': {'run_id': 'run-1'}, 'payload_ref': None, 'redaction_profile': 'no_secrets',
            'replay_policy': 'dedupe_by_idempotency_key',
            'migration': {'migrated_from_schema_id': None, 'migrated_from_schema_version': None,
                          'migration_id': None, 'compatibility_event_type': None}}


RECIPE = RecipeTuple('pm.event.v0', '2.0.0', 'bsd-w3d-payload', '1.0.0', 'Back_Seat_Driver', 'W3D-1.0.0',
                     'pm.event_family_registry', 'bsd-key@1 (CV-1350..1364)', 'CV-317 producer_semantic_digest (CV-1100)',
                     EVENT_VALUE, 'CV-339 full value v2', 'SP-1365 source identity row', 'SP-337 pending pack',
                     sha(b'W3D bsd-w3d-v1 frozen resources: payload schemas, bsd_event_storage_contracts, event_record 2.0.0'))
UNKNOWN_RECIPE = RecipeTuple(RECIPE.envelope_schema_id, RECIPE.envelope_schema_version, RECIPE.payload_schema_id,
                             RECIPE.payload_schema_version, RECIPE.owner_source_id, RECIPE.owner_edition,
                             RECIPE.registry_revision, RECIPE.identity_recipe, 'unknown-producer-recipe',
                             RECIPE.physical_profile, RECIPE.full_value_profile, RECIPE.local_source_profile,
                             RECIPE.payload_profile, sha(b'unknown'))


def build(fam, muts=None, variant=None, empty=False, external=False):
    """Complete world for one family. muts: {hook: fn(obj, W)}; derived copies follow substituted claims."""
    m = dict(muts or {})
    slug = fam['slug']
    W = {'fam': fam, 'empty': empty}
    facts = dict(fam['positive_facts'])
    facts.update(variant or {})
    native = base_native(fam)
    native['facts'] = facts
    native = hook(m, 'native', native, W)
    W['native'] = native
    cap = hook(m, 'capture', copy.deepcopy(native), W)
    W['capture'] = cap
    W['operation_id'] = operation_for(cap['original_source_id'], fam['event_type'], cap['subject_id'])
    W['wrapper_ref'] = f'pmref:wrapper.{slug}.0001'
    W['evidence_fingerprint'] = sha(b'W3D evidence owner commitment')
    W['identity_inputs_ref'] = 'pmref:identity.inputs.0001'
    authentic_inputs = identity_inputs(cap, W)
    W['finding_key'] = finding_key_normalized(authentic_inputs)
    W['identity_inputs'] = hook(m, 'identity_inputs', authentic_inputs, W)
    if IDENTITY_INPUTS_VALIDATOR.is_valid(W['identity_inputs']):
        W['finding_key'] = finding_key_normalized(W['identity_inputs'])
    payload = hook(m, 'payload', make_payload(fam, cap, W), W)
    W['payload_view'] = payload
    meta = hook(m, 'meta', {'sequence_id': 7, 'observed_at_utc': '2026-11-01T08:00:01.250Z',
                            'persisted_at_utc': '2026-11-01T08:00:02Z'}, W)
    W['meta'] = meta
    env = hook(m, 'envelope', make_envelope(fam, cap, payload, meta), W)
    W['env'] = env
    W['admission'] = hook(m, 'admission', {
        'cutoff': False, 'physical': True, 'registry': {(fam['event_type'], fam['payload_schema_id'], '1.0.0')},
        'dedupe_available': True, 'permission': True, 'registered_owner': fam['producer'],
        'live_owner': fam['producer'], 'writer_generation': 3, 'live_writer_generation': 3,
        'stop': 'allow', 'live_epoch': 2, 'resolved_mode': facts.get('resolved_mode', 'Auto')}, W)
    intent = hook(m, 'intent', {k: env[k] for k in PRODUCER_FIELDS if k in env}, W)
    W['intent'] = intent
    raw, ref = pack_for(intent)
    W['pack'] = hook(m, 'pack', {'store': {ref.split(':')[3]: raw}, 'ref': ref}, W)
    digest = digest_or_none(env) or '0' * 64
    W['digest'] = digest
    body = hook(m, 'logical_body', logical_body(fam, cap, W), W)
    wrapper, logical_pack = wrapper_for(fam, fam['source_kind'], cap['subject_id'], W['operation_id'], body, W, m)
    W['wrapper'] = wrapper
    W['logical_pack'] = hook(m, 'logical_pack', logical_pack, W)
    W['wrapper_key'] = hook(m, 'wrapper_key',
                            f'bsd_source_{fam["source_kind"]}.v1:{partition_for(PROJECT)}:{hexs(cap["subject_id"])}:{hexs(W["operation_id"])}', W)
    W['originals'] = {'pmref:original.accepted.0001': native}
    W['committed_wrappers'] = {W['wrapper_ref']: wrapper}
    other_wrapper, _other_pack = wrapper_for(fam, fam['source_kind'], cap['subject_id'] + '-other',
                                             W['operation_id'], logical_body(fam, cap, W), W, {})
    W['other_wrapper_ref'] = f'pmref:wrapper.{slug}.0002'
    W['committed_wrappers'][W['other_wrapper_ref']] = other_wrapper
    W['committed_wrappers'] = hook(m, 'committed_wrappers', W['committed_wrappers'], W)
    W['operation_committed'] = hook(m, 'operation_committed', True, W)
    build_review_chain(fam, cap, W, m)
    operation = {'schema_id': f'pm.bsd.event_operation.{slug}.v1', 'schema_version': '1.0.0',
                 'event_type': fam['event_type'], 'storage_instance_id': STORAGE, 'project_id': PROJECT,
                 'owner_operation_id': W['operation_id'], 'source_state_ref': W['wrapper_ref'],
                 'event_id': env['event_id'], 'idempotency_key': env['idempotency_key'],
                 'producer_semantic_digest': digest, 'state': 'pending_event', 'payload_ref': W['pack']['ref'],
                 'first_append_receipt': None, 'payload_byte_size': len(raw), 'payload_media_type': PACK_MEDIA}
    W['operation'] = hook(m, 'operation', operation, W)
    W['operation_key'] = hook(m, 'operation_key',
                              f'bsd_{slug}_operation.v1:{partition_for(PROJECT)}:{hexs(W["operation_id"])}', W)
    W['uniqueness'] = hook(m, 'uniqueness', {(STORAGE, partition_for(PROJECT), W['operation_id']): cap['original_source_id']}, W)
    build_custody(fam, env, digest, W, m)
    build_retry(fam, env, digest, W, m)
    build_publication(fam, env, W, m, empty)
    build_read(fam, env, W, m)
    W['replay'] = hook(m, 'replay', {e: [] for e in rows_spec.EFFECTS}, W)
    W['withdraw'] = hook(m, 'withdraw', {'cutoff_recorded': True, 'pending_drained': True,
                                         'selector_withdrawn': True, 'advanced': 0, 'appended': 0}, W)
    hook(m, 'authentic_source', W['native'], W)
    return W


def build_review_chain(fam, cap, W, m):
    """Immutable pre-dispatch start and the later genuine terminal wrapper (SP-1365)."""
    slug = fam['slug']
    W['review_chain'] = slug in rows_spec.REVIEW_CHAIN
    if not W['review_chain']:
        return
    authentic_start = start_body(cap, W)
    W['admission_facts'] = copy.deepcopy(authentic_start)
    start = hook(m, 'start_body', authentic_start, W)
    W['start_body'] = start
    W['start_source_kind'] = hook(m, 'start_source_kind', 'review_start', W)
    start_wrapper, start_pack = wrapper_for(fam, 'review_start', 'cycle-0001', W['operation_id'], start, W, m)
    W['start_wrapper'] = start_wrapper
    W['start_pack'] = hook(m, 'start_pack', start_pack, W)
    W['start_wrapper_ref'] = 'pmref:wrapper.review_start.0001'
    terminal = dict(logical_body(fam, cap, W)) if fam['source_kind'] == 'review_cycle' else {
        'schema_id': 'pm.bsd.review_cycle.v1', 'schema_version': '1.0.0', 'review_cycle_id': 'cycle-0001',
        'bsd_assignment_id': 'assignment-0001', 'trigger_kind': start.get('trigger_kind'),
        'trigger_reason': start.get('trigger_reason'), 'primary_generation': start.get('primary_generation'),
        'input_manifest_ref': start.get('input_manifest_ref'), 'result': 'emitted', 'usage_attempt_ref': None,
        'latency_ms': 120, 'created_at': '2026-11-01T09:05:00Z', 'frozen_boundary': start.get('frozen_boundary'),
        'no_call_reason': None}
    terminal = hook(m, 'terminal_body', terminal, W)
    W['terminal_body'] = terminal
    term_wrapper, term_pack = wrapper_for(fam, 'review_cycle', 'cycle-0001', W['operation_id'], terminal, W, m)
    term_wrapper['review_start_ref'] = W['start_wrapper_ref']
    W['terminal_wrapper'] = hook(m, 'terminal_wrapper', term_wrapper, W)
    W['terminal_pack'] = hook(m, 'terminal_pack', term_pack, W)
    W['terminal_wrapper_ref'] = 'pmref:wrapper.review_cycle.0001'
    if fam['source_kind'] == 'review_cycle':
        W['wrapper']['review_start_ref'] = W['start_wrapper_ref']
    W['start_custody_available'] = True
    W['start_custody_available'] = hook(m, 'start_custody', W['start_custody_available'], W)


def head_kind(fam):
    return 'review_cycle' if fam['source_kind'] == 'review_start' else fam['source_kind']


def build_custody(fam, env, digest, W, m):
    slug = fam['slug']
    receipt = {'event_id': env['event_id'], 'sequence_id': W['meta']['sequence_id'], 'segment_generation': 3,
               'segment_name': 'seg-000003', 'byte_offset': 4096, 'commit_group_id': f'cg-{slug}',
               'durability_class': 'barrier', 'durable_end_offset': 8192, 'durability_state': 'synced',
               'manifest_generation': 5, 'acknowledged_at_utc': '2026-11-01T08:00:02.5Z'}
    try:
        commitment = full_value_commitment(env)
    except Refusal:
        commitment = '0' * 64
    custody = {'schema_id': 'pm.storage_value.event_append_receipt_custody.v2', 'schema_version': '2.0.0',
               'storage_instance_id': STORAGE, 'event_id': env['event_id'], 'scope_partition': partition_for(PROJECT),
               'event_type': fam['event_type'], 'idempotency_key': env['idempotency_key'],
               'producer_semantic_digest': digest, 'group_digest': sha(b'group:' + slug.encode()),
               'first_append_receipt': hook(m, 'receipt', receipt, W), 'redaction_profile': 'no_secrets',
               'original_segment_ref': 'storage/seglog/seg-000003',
               'original_event_value_commitment': {'schema_id': 'pm.storage.original_event_value_commitment.v1',
                                                   'schema_version': '1.0.0', 'codec': EVENT_VALUE,
                                                   'domain': 'pm.storage.original_event_value_commitment.v1',
                                                   'event_schema_id': 'pm.event.v0', 'event_schema_version': '2.0.0',
                                                   'sha256': commitment}}
    W['custody'] = hook(m, 'custody', custody, W)
    receipt_ref = f'pmref:receipt.{slug}.project'
    W['receipt_ref'] = receipt_ref
    W['receipt_index'] = hook(m, 'receipt_index', {receipt_ref: W['custody']}, W)
    settled = {'phase': 'history_committed', 'first_append_receipt_ref': receipt_ref, 'pending_intent_ref': None,
               'source_state_ref': W['wrapper_ref'], 'owner_operation_id': W['operation_id']}
    pack_digest = W['pack']['ref'].split(':')[3]
    W['settle'] = hook(m, 'settle', {
        'row': settled, 'pins_before': {pack_digest: [f'pending:{W["operation_key"]}', 'hold:protected-backup']},
        'pins_after': {pack_digest: ['hold:protected-backup']}, 'receipts_before': 1, 'receipts_after': 1}, W)
    hk = head_kind(fam)
    prior = {'schema_id': f'pm.bsd.source_head.{hk}.v1', 'schema_version': '1.0.0', 'project_id': PROJECT,
             'subject_id': W['capture']['subject_id'], 'current_source_ref': f'pmref:wrapper.{slug}.0000',
             'current_owner_operation_id': W['operation_id'] + '00',
             'first_append_receipt': copy.deepcopy(W['custody']['first_append_receipt'])}
    W['head_prior'] = hook(m, 'head_prior', prior, W)
    head = dict(copy.deepcopy(prior), current_source_ref=W['wrapper_ref'],
                current_owner_operation_id=W['operation_id'],
                first_append_receipt=copy.deepcopy(W['custody']['first_append_receipt']))
    W['head'] = hook(m, 'head', head, W)
    W['head_expected'] = hook(m, 'head_expected', copy.deepcopy(W['head_prior']), W)
    W['head_key'] = hook(m, 'head_key', f'bsd_head_{hk}.v1:{partition_for(PROJECT)}:{hexs(W["capture"]["subject_id"])}', W)
    W['head_published'] = hook(m, 'head_published', False, W)


def build_retry(fam, env, digest, W, m):
    retry_env = copy.deepcopy(env)
    retry_env['observed_at_utc'] = '2026-11-01T08:05:00Z'
    retry_env['sequence_id'] = 99
    W['retry'] = hook(m, 'retry', {
        'env': retry_env, 'registry': W['admission']['registry'], 'dedupe_available': True,
        'dedupe': {(partition_for(PROJECT), fam['event_type'], env['idempotency_key']):
                   {'digest': digest, 'receipt': W['receipt_ref']}},
        'result': {'receipt': copy.deepcopy(W['custody']['first_append_receipt']), 'remote_operations': 0},
        'original_custody_available': True}, W)
    if 'retry_original_digest' in m:
        # An independently sealed original with the same semantic number spelling.
        # Useful for isolating exact integer validation from idempotency comparison.
        key = (partition_for(PROJECT), fam['event_type'], env['idempotency_key'])
        W['retry']['dedupe'][key]['digest'] = digest_or_none(W['retry']['env'])


def build_publication(fam, env, W, m, empty):
    slug = fam['slug']
    partition = partition_for(PROJECT)
    record_m = env
    record_u = unrelated_record(8)
    log = [] if empty else [record_m, record_u]
    W['log'] = hook(m, 'log', log, W)
    selection = {'storage_instance_id': STORAGE, 'current_ref': 'storage/seglog/CURRENT',
                 'current_bytes_sha256': sha(b'CURRENT'), 'selected_segment_generation': 3,
                 'manifest_ref': 'storage/seglog/manifest.v1.msgpack', 'manifest_bytes_sha256': sha(b'manifest'),
                 'manifest_generation': 5, 'recovery_epoch': 1, 'manifest_survivor_prefix_sha256': sha(b'survivor'),
                 'retained_inventory_sha256': sha(b'inventory'), 'durable_watermarks_sha256': sha(b'watermarks'),
                 'excluded_ranges_sha256': sha(b'excluded'), 'retired_inputs_sha256': sha(b'retired')}
    live = {'storage_instance_id': STORAGE, 'checkpoint_key': f'event_record_index.v1:{STORAGE}:{partition}',
            'checkpoint_ref': f'checkpoints/event_record_index/{partition}', 'generation_id': 'eig_' + sha(b'index-gen'),
            'generation_anchor_sha256': sha(b'anchor'), 'frontier_revision': 0 if empty else 8,
            'frontier_sha256': sha(b'frontier'), 'index_dataset_name': 'event_record_index.g1',
            'source_selection': selection, 'redb_snapshot_id': 'snap-0042'}
    W['live'] = hook(m, 'live', copy.deepcopy(live), W)
    durable = {k: v for k, v in live.items() if k != 'redb_snapshot_id'}
    old_token = dict(copy.deepcopy(durable), frontier_revision=0 if empty else 7)

    def checkpoint(token, last_seq, last_event):
        return {'schema_id': f'pm.bsd.event_checkpoint.{slug}.v1', 'schema_version': '1.0.0',
                'storage_instance_id': STORAGE, 'project_id': PROJECT, 'selected_event_type': fam['event_type'],
                'consumer_id': f'projector.bsd.{slug}@1.0.0', 'publication_state': 'current',
                'last_scanned_sequence': last_seq, 'last_matched_event_id': last_event,
                'index_read_token': token}

    pred = checkpoint(copy.deepcopy(old_token), None if empty else 6, None)
    W['pred'] = hook(m, 'pred', pred, W)
    cand = checkpoint(copy.deepcopy(durable), None if empty else 8, None if empty else env['event_id'])
    W['cand'] = hook(m, 'cand', cand, W)
    W['actual_prior'] = hook(m, 'actual_prior', copy.deepcopy(W['pred']), W)
    W['checkpoint_key'] = hook(m, 'checkpoint_key', f'bsd_{slug}_checkpoint.v1:{partition}:{STORAGE}', W)
    W['siblings_before'] = hook(m, 'siblings_before', {'projection_rows': 1, 'other_consumers': 2}, W)
    W['siblings_after'] = hook(m, 'siblings_after', {'projection_rows': 1, 'other_consumers': 2}, W)
    W['request'] = hook(m, 'request', {
        'expected_revision': W['pred']['index_read_token']['frontier_revision'],
        'expected_hash': binding_hash(W['pred']), 'fence': 'fence-0042', 'live_token': copy.deepcopy(live),
        'scanned': [] if empty else [r['sequence_id'] for r in log], 'disclosed': [],
        'empty_proof': empty}, W)
    W['storage_fence'] = 'fence-0042'
    W['generic_index_complete'] = hook(m, 'generic_index', True, W)


def build_read(fam, env, W, m):
    partition = partition_for(PROJECT)
    original_ref = f'{STORAGE}:{partition}:{env["event_id"]}'
    binding = {'storage_instance_id': STORAGE, 'scope_kind': 'project', 'server_id': SERVER, 'project_id': PROJECT,
               'event_type': fam['event_type'], 'event_id': env['event_id'], 'idempotency_key': env['idempotency_key'],
               'owner_operation_id': W['operation_id'], 'source_commitment': W['digest']}
    try:
        record_bytes = storage_value_bytes(env, profile=EVENT_VALUE)
    except Refusal:
        record_bytes = b''
    W['read'] = hook(m, 'read', {
        'original_ref': original_ref, 'expected': copy.deepcopy(binding),
        'sealed': [{'original_ref': original_ref, 'binding': copy.deepcopy(binding), 'recipe': RECIPE}],
        'stored': {original_ref: {'record': record_bytes, 'source_row': W['settle']['row'], 'custody': W['custody'],
                                  'pack': W['pack']}},
        'reader_writes_receipt': False, 'reader_alters_bytes': False, 'withdrawn': False, 'permission': True,
        'deleted': False, 'ref_available': True, 'live_capability': True, 'caller_override': False,
        'backup_coherent': True}, W)


# --- observations -----------------------------------------------------------
def obs_admission(W):
    a, env, native = W['admission'], W['env'], W['native']
    fam = W['fam']
    out = {'AD01_cutoff': a['cutoff'] is False,
           'AD01_registration': (
               fam['event_type'], fam['payload_schema_id'], '1.0.0') in a['registry'],
           'AD02_physical_admission': a['physical'] is True,
           'AD03_replay_writer': env.get('replay_policy') != 'projector_replay_only',
           'AD04_scope_kind': native['scope']['scope_kind'] == 'project',
           'AD04_project_scope': same(native['scope']['project_id'], PROJECT),
           'AD05_actor': same(W['capture'].get('actor_ref'), native['actor_ref']),
           'AD06_dedupe_available': a['dedupe_available'] is True,
           'AD07_current_write_permission': a['permission'] is True,
           'AD08_current_owner': same(a['live_owner'], native['owner']),
           'AD09_current_writer_generation': same(a['live_writer_generation'], native['writer_generation']),
           'AD10_current_stop': a['stop'] == 'allow'}
    if fam['assignment_backed']:
        out['AD11_current_epoch'] = same(a['live_epoch'], native['epoch'])
    return out


def obs_eligibility(W):
    return {'EL01_not_off': W['admission']['resolved_mode'] in ('Auto', 'On')}


def _identity_parts(value, count):
    if type(value) is not str:
        return []
    parts = value.split(':')
    return parts if len(parts) == count else []


def obs_envelope(W):
    env, meta, native = W['env'], W['meta'], W['native']
    fam = W['fam']
    payload = env.get('payload')
    inline_ok = True
    if type(payload) is dict and env.get('payload_ref') is None:
        size = encoded_len(payload, EVENT_VALUE)
        inline_ok = size is not None and size <= INLINE_LIMIT
    string_parts = {k: v for k, v in env.items() if type(v) is str} if type(env) is dict else {}
    meta_size = encoded_len(string_parts, EVENT_VALUE)
    migration = env.get('migration')
    pseq = env.get('producer_sequence_id')
    return {
        'EN01_envelope_schema': type(env) is dict and ENVELOPE_VALIDATOR.is_valid(env),
        'EN02_occurred_clock': clock_ok(env.get('occurred_at_utc'), EVENT_RECORD),
        'EN03_observed_clock': clock_ok(env.get('observed_at_utc'), STORAGE_UTC_Z),
        'EN04_persisted_clock': clock_ok(env.get('persisted_at_utc'), STORAGE_UTC_Z),
        'EN05_sequence_uint64': uint64_ok(env.get('sequence_id')),
        'EN06_producer_sequence': pseq is None or (type(pseq) is int and ok(current_integer, pseq, minimum=0)),
        'EN07_producer_qualified': digest_or_none(env) is not None,
        'EN08_family': env.get('event_type') == fam['event_type'],
        'EN09_payload_schema': env.get('payload_schema_id') == fam['payload_schema_id'],
        'EN10_redaction_join': same(env.get('redaction_profile'), native['redaction_profile']),
        'EN11_inline_size': inline_ok,
        'EN12_payload_route': (payload is None) != (env.get('payload_ref') is None),
        'EN13_migration_null': type(migration) is dict and migration.get('migration_id') is None,
        **{f'EN13_migration_{k}': type(migration) is dict and migration.get(k) is None
           for k in rows_spec.MIGRATION_FIELDS},
        'EN14_sequence_join': same(env.get('sequence_id'), meta['sequence_id']),
        'EN15_observed_join': same(env.get('observed_at_utc'), meta['observed_at_utc']),
        'EN16_persisted_join': same(env.get('persisted_at_utc'), meta['persisted_at_utc']),
        'EN17_metadata_size': meta_size is not None and meta_size <= INLINE_LIMIT,
        'EN18_replay_policy': env.get('replay_policy') == 'dedupe_by_idempotency_key',
    }


def obs_joins(W):
    env, native = W['env'], W['native']
    fam = W['fam']
    out = {}
    if fam['assignment_backed']:
        out['JN01_run_join'] = same(env.get('run_id'), native['primary_run_id'])
    else:
        out['JN01_run_null'] = env.get('run_id') is None
    out['JN02_project_join'] = type(env.get('project_id')) is str and env.get('project_id') == PROJECT
    for i, field in enumerate(rows_spec.ENVELOPE_JOINS, 3):
        out[f'JN{i:02d}_{field}_join'] = same(env.get(field), native[field])
    return out


def obs_identity(W):
    env, native = W['env'], W['native']
    fam = W['fam']
    eid = env.get('event_id')
    key = env.get('idempotency_key')
    ep = _identity_parts(eid, 5)
    kp = _identity_parts(key, 3)
    op = W['operation_id']
    authentic_op = operation_for(native['original_source_id'], fam['event_type'], native['subject_id'])
    return {
        'ID01_event_prefix': type(eid) is str and eid.startswith('bsd-event@1:'),
        'ID03_event_storage': len(ep) == 5 and ep[1] == hexs(STORAGE),
        'ID04_event_type': len(ep) == 5 and ep[2] == hexs(fam['event_type']),
        'ID05_event_project': len(ep) == 5 and ep[3] == hexs(PROJECT),
        'ID06_event_operation': len(ep) == 5 and ep[4] == hexs(op),
        'ID07_operation_recipe': op == authentic_op,
        'ID08_key_prefix': type(key) is str and key.startswith('bsd-key@1:'),
        'ID10_key_project': len(kp) == 3 and kp[1] == hexs(PROJECT),
        'ID11_key_operation': len(kp) == 3 and kp[2] == hexs(op),
        'ID12_partition_recipe': native['scope']['scope_partition'] == partition_for(PROJECT),
    }


def obs_event_arity(W):
    ep = _identity_parts(W['env'].get('event_id'), 5)
    return {'ID02_event_components': len(ep) == 5 and all(is_hex(p) for p in ep[1:])}


def obs_key_arity(W):
    kp = _identity_parts(W['env'].get('idempotency_key'), 3)
    return {'ID09_key_components': len(kp) == 3 and all(is_hex(p) for p in kp[1:])}


def _payload_field_spec(fam, field):
    schema = SCHEMAS['bsd_event_payloads']['$defs'][fam['slug']]['properties'][field]
    if '$ref' in schema:
        return SCHEMAS['bsd_event_payloads']['$defs'][schema['$ref'].split('/')[-1]]
    return schema


def obs_payload(W):
    fam = W['fam']
    payload = W['payload_view']
    native = W['native']
    out = {}
    if type(payload) is not dict:
        payload = {}
    schema_props = SCHEMAS['bsd_event_payloads']['$defs'][fam['slug']]['properties']
    for name, _field, _inv, _code in rows_spec.payload_rows(fam):
        if name == 'payload.closed':
            out[name] = set(payload) <= set(schema_props)
            continue
        if name.endswith('_source_join'):
            field = name[len('payload_'):-len('_source_join')]
            nv = native[field]
            pv = payload.get(field)
            if field not in payload or not JOIN_FIELD_VALIDATORS[fam['slug']][field].is_valid(pv):
                out[name] = True  # absence/schema-invalid value is the schema row's defect
            else:
                out[name] = same(pv, nv)
            continue
        _, field, kw = name.split('.', 2)
        present = field in payload
        if kw == 'required':
            out[name] = present
            continue
        if not present:
            out[name] = True
            continue
        value = payload.get(field)
        spec_ = _payload_field_spec(fam, field)
        if kw == 'const':
            out[name] = present and type(value) is type(spec_['const']) and value == spec_['const']
        elif kw == 'enum':
            out[name] = present and type(value) is str and value in spec_['enum']
        elif kw == 'type':
            if 'oneOf' in spec_:
                out[name] = present and JOIN_FIELD_VALIDATORS.get(fam['slug'], {}).get(field, Draft202012Validator(
                    {'$ref': f'{PAYLOAD_ID}#/$defs/{fam["slug"]}/properties/{field}'}, registry=REGISTRY)).is_valid(value)
            elif spec_.get('type') == 'array':
                out[name] = present and type(value) is list
            elif spec_.get('type') == 'null':
                out[name] = present and value is None
            else:
                want = {'string': str, 'integer': int, 'boolean': bool}.get(spec_.get('type'))
                out[name] = present and want is not None and type(value) is want
        elif kw in ('minimum', 'maximum'):
            if type(value) is not int:
                out[name] = True
            else:
                out[name] = value >= spec_['minimum'] if kw == 'minimum' else value <= spec_['maximum']
        elif kw in ('minLength', 'maxLength'):
            if type(value) is not str:
                out[name] = True
            else:
                out[name] = len(value) >= spec_['minLength'] if kw == 'minLength' else len(value) <= spec_['maxLength']
        elif kw == 'pattern':
            out[name] = type(value) is not str or re.search(spec_['pattern'], value) is not None
        elif kw == 'no_linebreak':
            out[name] = type(value) is not str or ('\n' not in value and '\r' not in value)
        elif kw == 'minItems':
            out[name] = type(value) is not list or len(value) >= spec_['minItems']
        elif kw == 'uniqueItems':
            out[name] = type(value) is not list or len({json.dumps(v, sort_keys=True) for v in value}) == len(value)
        elif kw == 'items_enum':
            enum = spec_['items']['enum']
            out[name] = type(value) is not list or all(type(v) is str and v in enum for v in value)
        else:
            raise KeyError(name)
    return out


def obs_source(W):
    fam = W['fam']
    wrapper, native = W['wrapper'], W['native']
    payload = W['payload_view']
    out = {
        'SR01_wrapper_schema': WRAPPER_VALIDATORS[fam['slug']].is_valid(wrapper),
        'SR02_wrapper_subject': same(wrapper.get('subject_id'), payload.get(fam['subject_field'])),
        'SR04_wrapper_operation': same(wrapper.get('owner_operation_id'), W['operation_id']),
        'SR05_wrapper_original': wrapper.get('original_source_ref') in W['originals'],
        'SR06_source_commitment': same(payload.get('source_state_ref'), W['wrapper_ref']),
        'SR06_committed_wrapper': payload.get('source_state_ref') in W['committed_wrappers'],
        'SR07_operation_source': W['operation_committed'] is True,
        'SR07_operation_identity': same(W['operation'].get('owner_operation_id'), W['operation_id']),
    }
    for i, (name, _inv, fn, _target, _neg, _variant) in enumerate(fam['semantic'], 8):
        out[f'SR{i:02d}_sem_{name}'] = fn(native['facts'], payload) is True
    nxt = 8 + len(fam['semantic'])
    if fam['source_kind'] == 'finding':
        inputs = W['identity_inputs']
        body = W['logical_pack']['body']
        ok_inputs = IDENTITY_INPUTS_VALIDATOR.is_valid(inputs)
        # Schema readiness gates the comparisons; each independent equality has its own row.
        prefix = f'SR{nxt:02d}_finding_identity_operands'
        out[prefix] = ok_inputs
        refs = {
            'family': (inputs.get('finding_family'), 'Advisor.Concern!v1'),
            'affected': (sorted(inputs.get('affected_object_refs', [])), sorted(body.get('affected_object_refs', []))),
            'rules': (sorted(inputs.get('rule_or_constraint_refs', [])), sorted(body.get('rule_or_constraint_refs', []))),
            'evidence': (inputs.get('evidence_fingerprint'), W['evidence_fingerprint']),
            'original': (inputs.get('original_source_ref'), 'pmref:finding.decision.0001'),
        } if ok_inputs else {}
        for suffix in rows_spec.FINDING_OPERANDS:
            out[prefix + '_' + suffix] = not ok_inputs or same(*refs[suffix])
        out[prefix + '_key'] = not ok_inputs or same(payload.get('finding_key'), finding_key_normalized(inputs))
        nxt += 1
    if W['review_chain']:
        start, terminal = W['start_body'], W['terminal_body']
        out[f'SR{nxt:02d}_terminal_start_custody'] = W['start_custody_available'] is True
        out[f'SR{nxt:02d}_terminal_start_custody_ref'] = same(
            W['terminal_wrapper'].get('review_start_ref'), W['start_wrapper_ref'])
        nxt += 1
        for field in rows_spec.TERMINAL_START_FIELDS:
            out[f'SR{nxt:02d}_terminal_start_{field}_join'] = same(terminal.get(field), start.get(field))
            nxt += 1
    if fam['slug'] == 'review_started':
        start, admission = W['start_body'], W['admission_facts']
        out[f'SR{nxt:02d}_start_source_kind'] = W['start_source_kind'] == 'review_start'
        nxt += 1
        out[f'SR{nxt:02d}_start_admission_identity'] = same(start.get('review_admission_id'), native['original_source_id'])
        nxt += 1
        out[f'SR{nxt:02d}_start_ref_join'] = same(payload.get('review_start_ref'), payload.get('source_state_ref'))
        nxt += 1
        for field in rows_spec.START_JOIN_FIELDS:
            out[f'SR{nxt:02d}_start_{field}_source_join'] = same(start.get(field), admission.get(field))
            nxt += 1
    return out


def obs_source_logical_schema_entailed(W):
    wrapper = W['wrapper']
    return {'SR03_wrapper_logical_schema': wrapper.get('logical_schema_id') == W['fam']['logical_schema_id']
            and wrapper.get('logical_schema_version') == '1.0.0'}


def obs_start_premature_result_entailed(W):
    start = W['start_body']
    return {'SR26_start_no_premature_result': not any(
        k in start for k in ('result', 'latency_ms', 'no_call_reason', 'usage_attempt_ref'))}

def obs_start_body(W):
    start = W['start_body']
    out = {}
    if type(start) is not dict:
        start = {}
    schema = SCHEMAS['bsd_event_storage_contracts']['$defs']['review_start']
    for name, _field, _inv, _code in rows_spec.start_body_rows():
        if name == 'start_body.closed':
            out[name] = set(start) <= set(schema['properties'])
            continue
        _, field, kw = name.split('.', 2)
        if kw == 'required':
            out[name] = field in start
        else:
            out[name] = field not in start or Draft202012Validator(
                {'$ref': f'{BSD_ID}#/$defs/review_start/properties/{field}'}, registry=REGISTRY).is_valid(start[field])
    return out


def obs_operation(W):
    fam, op, env = W['fam'], W['operation'], W['env']
    return {
        'OP01_operation_schema': OPERATION_VALIDATORS[fam['slug']].is_valid(op),
        'OP02_operation_key': W['operation_key'] == (
            f'bsd_{fam["slug"]}_operation.v1:{partition_for(PROJECT)}:{hexs(W["operation_id"])}'),
        'OP03_operation_storage': op.get('storage_instance_id') == STORAGE,
        'OP04_operation_project': op.get('project_id') == PROJECT,
        'OP05_operation_event': same(op.get('event_id'), env.get('event_id')),
        'OP06_operation_key_join': same(op.get('idempotency_key'), env.get('idempotency_key')),
        'OP07_operation_digest': same(op.get('producer_semantic_digest'), digest_or_none(env)),
        'OP08_operation_state': op.get('state') == 'pending_event',
        'OP09_pending_not_current': W['head_published'] is False,
        'OP10_operation_source_ref': same(op.get('source_state_ref'), W['wrapper_ref']),
    }


def obs_operation_size(W):
    size = encoded_len(W['operation'], EVENT_VALUE)
    return {'OZ01_operation_size': size is not None and size <= INLINE_LIMIT}


def _pack_parts(ref):
    if type(ref) is not str:
        return None
    parts = ref.split(':')
    if len(parts) != 6 or parts[0] != 'pm-payload-ref' or parts[1] != 'v1' or parts[2] != 'blake3':
        return None
    return parts


def obs_pack(W):
    pack, env = W['pack'], W['env']
    parts = _pack_parts(pack.get('ref'))
    raw = pack['store'].get(parts[3]) if parts else None
    digest_ok = size_ok = media_ok = decodes = intent_ok = True
    decoded = None
    if raw is not None and parts:
        digest_ok = blake3.blake3(raw).hexdigest() == parts[3]
        size_ok = str(len(raw)) == parts[4]
        media_ok = parts[5] == PACK_MEDIA
        try:
            decoded = decode_storage_value(raw, profile=EVENT_VALUE)
            decodes = storage_value_bytes(decoded, profile=EVENT_VALUE) == raw
        except Refusal:
            decodes = False
        intent_ok = (not decodes) or same(decoded, W['intent'])
    lp = W['logical_pack']
    lparts = _pack_parts(lp.get('ref'))
    lraw = lp['store'].get(lparts[3]) if lparts else None
    wrapper = W['wrapper']
    body_ok = clock_okay = updated_okay = True
    if lraw is not None:
        try:
            body = decode_storage_value(lraw, profile=EVENT_VALUE)
            kind = W['fam']['source_kind']
            validator = START_BODY_VALIDATOR if kind == 'review_start' else LOGICAL_VALIDATORS[kind]
            body_ok = validator.is_valid(body)
            clock_okay = 'created_at' not in body or clock_ok(body['created_at'], EVENT_RECORD)
            updated_okay = 'updated_at' not in body or clock_ok(body['updated_at'], EVENT_RECORD)
        except Refusal:
            body_ok = False
            clock_okay = False
    return {
        'PK01_pack_present': raw is not None,
        'PK02_pack_digest': digest_ok,
        'PK03_pack_size': size_ok,
        'PK04_pack_media': media_ok,
        'PK05_pack_decodes': decodes,
        'PK06_pack_intent': intent_ok,
        'PK07_source_pack_present': lraw is not None,
        'PK08_source_pack_size': lraw is None or wrapper.get('logical_payload_byte_size') == len(lraw),
        'PK09_source_body_schema': body_ok,
        'PK10_source_body_clocks': clock_okay,
        'PK10_source_updated_clock': updated_okay,
    }


def obs_receipt(W):
    fam, env, custody = W['fam'], W['env'], W['custody']
    receipt = custody.get('first_append_receipt')
    receipt = receipt if type(receipt) is dict else {}
    settle = W['settle']
    row = settle['row']
    pack_digest = W['pack']['ref'].split(':')[3]
    pins_after = settle['pins_after'].get(pack_digest, [])
    try:
        commitment = full_value_commitment(env)
    except Refusal:
        commitment = None
    head, prior = W['head'], W['head_prior']
    out = {
        'RC01_custody_schema': CUSTODY_VALIDATOR.is_valid(custody),
        'RC02_custody_event': same(custody.get('event_id'), env.get('event_id')),
        'RC03_custody_partition': custody.get('scope_partition') == partition_for(PROJECT),
        'RC04_custody_type': custody.get('event_type') == fam['event_type'],
        'RC05_custody_key': same(custody.get('idempotency_key'), env.get('idempotency_key')),
        'RC06_custody_digest': same(custody.get('producer_semantic_digest'), digest_or_none(env)),
        'RC07_custody_storage': custody.get('storage_instance_id') == STORAGE,
        'RC08_full_value': commitment is not None and same(
            custody.get('original_event_value_commitment', {}).get('sha256'), commitment),
        'RC09_receipt_event': same(receipt.get('event_id'), env.get('event_id')),
        'RC10_receipt_sequence': same(receipt.get('sequence_id'), W['meta']['sequence_id']),
        'RC11_receipt_sequence_uint64': uint64_ok(receipt.get('sequence_id')),
    }
    for i, slot in enumerate(rows_spec.RECEIPT_UINT[1:], 12):
        out[f'RC{i:02d}_receipt_{slot}_uint64'] = uint64_ok(receipt.get(slot))
    out.update({
        'RC16_ack_clock': clock_ok(receipt.get('acknowledged_at_utc'), EVENT_RECORD),
        'RC17_receipt_durability': (type(receipt.get('durable_end_offset')) is not int
                                    or type(receipt.get('byte_offset')) is not int
                                    or receipt.get('durable_end_offset') >= receipt.get('byte_offset')),
        'RC18_barrier_receipt': receipt.get('durability_class') == 'barrier',
        'RC19_settlement_ref': same(row.get('first_append_receipt_ref'), W['receipt_ref']),
        'RC20_settlement_phase': row.get('phase') == 'history_committed',
        'RC21_settlement_release': row.get('pending_intent_ref') is None,
        'RC22_pin_released': f'pending:{W["operation_key"]}' not in pins_after,
        'RC23_other_holds_kept': 'hold:protected-backup' in pins_after,
        'RC24_no_new_receipt': same(settle['receipts_after'], settle['receipts_before']),
        'RC24_one_original_receipt': same(settle['receipts_before'], 1),
        'RC25_head_cas': same(W['head_expected'], prior),
        'RC25_head_operation': same(head.get('current_owner_operation_id'), W['operation_id']),
        'RC26_head_source_join': same(head.get('current_source_ref'), W['wrapper_ref']),
        'RC26_head_committed': W['wrapper_ref'] in W['committed_wrappers'],
        'RC26_head_subject': same(head.get('subject_id'), W['native']['subject_id']),
    })
    return out


def obs_retry(W):
    fam, R = W['fam'], W['retry']
    env = R['env']
    entry = R['dedupe'].get((partition_for(PROJECT), fam['event_type'], W['env']['idempotency_key']))
    return {
        'RT01_retry_not_replay_only': env.get('replay_policy') != 'projector_replay_only',
        'RT02_retry_membership': (fam['event_type'], fam['payload_schema_id'], '1.0.0') in R['registry'],
        'RT03_retry_dedupe_available': R['dedupe_available'] is True,
        'RT04_retry_original_found': entry is not None,
        'RT05_retry_digest_equal': entry is None or same(entry.get('digest'), digest_or_none(env)),
        'RT06_retry_receipt_original': same(R['result']['receipt'], W['custody']['first_append_receipt']),
        'RT07_retry_no_remote': R['result']['remote_operations'] == 0 and type(R['result']['remote_operations']) is int,
        'RT08_original_retry_custody': R['original_custody_available'] is True,
        'RT09_retry_envelope_schema': ENVELOPE_VALIDATOR.is_valid(env),
        'RT10_retry_producer_sequence': env.get('producer_sequence_id') is None or ok(
            current_integer, env.get('producer_sequence_id'), minimum=0),
    }


def obs_checkpoint(W):
    fam, cand, live = W['fam'], W['cand'], W['live']
    token = cand.get('index_read_token')
    token = token if type(token) is dict else {}
    selection = token.get('source_selection')
    selection = selection if type(selection) is dict else {}
    live_selection = live.get('source_selection', {})
    out = {
        'CP01_root_schema': CHECKPOINT_VALIDATORS[fam['slug']].is_valid(cand),
        'CP02_checkpoint_storage': cand.get('storage_instance_id') == STORAGE,
        'CP04_checkpoint_project': cand.get('project_id') == PROJECT,
    }
    for i, field in enumerate(rows_spec.TOKEN_FIELDS, 7):
        out[f'CP{i:02d}_token_{field}'] = same(token.get(field), live.get(field))
    base = 7 + len(rows_spec.TOKEN_FIELDS)
    for i, field in enumerate(rows_spec.SELECTION_FIELDS):
        out[f'CP{base + i:02d}_selection_{field}'] = same(selection.get(field), live_selection.get(field))
    nxt = base + len(rows_spec.SELECTION_FIELDS)
    uint_slots = [token.get('frontier_revision'), selection.get('selected_segment_generation'),
                  selection.get('manifest_generation'), selection.get('recovery_epoch')]
    out[f'CP{nxt:02d}_token_uint64'] = uint64_ok(uint_slots[0])
    for field, value in zip(rows_spec.CHECKPOINT_INTEGERS, uint_slots[1:]):
        out[f'CP{nxt:02d}_uint64_' + field] = uint64_ok(value)
    return out


def obs_checkpoint_size(W):
    size = encoded_len(W['cand'], INDEX_BINDING)
    return {'CZ01_checkpoint_size': size is not None and size <= INLINE_LIMIT}


def obs_checkpoint_type(W):
    return {'CP03_checkpoint_type': W['cand'].get('selected_event_type') == W['fam']['event_type']}


def obs_checkpoint_consumer(W):
    return {'CP05_checkpoint_consumer': W['cand'].get('consumer_id') == f'projector.bsd.{W["fam"]["slug"]}@1.0.0'}


def obs_checkpoint_snapshot(W):
    token = W['cand'].get('index_read_token')
    token = token if type(token) is dict else {}
    return {'CP06_token_snapshot': set(token) == set(rows_spec.TOKEN_FIELDS) | {'source_selection'}}


def obs_scan(W):
    cand, request, log = W['cand'], W['request'], W['log']
    matched = [r for r in log if r.get('event_id') == cand.get('last_matched_event_id')]
    last_seq = log[-1]['sequence_id'] if log else None
    pred_seq = W['pred'].get('last_scanned_sequence')
    no_regress = last_seq is None or pred_seq is None or last_seq >= pred_seq
    cursor_ok = same(cand.get('last_matched_event_id'), W['env']['event_id'] if log else None)
    return {
        'SC01_generic_source': W['generic_index_complete'] is True,
        'SC02_coverage_complete': same(request.get('scanned'), [r['sequence_id'] for r in log]),
        'SC03_cursor_event': cursor_ok,
        'SC04_cursor_sequence': same(cand.get('last_scanned_sequence'), last_seq),
        'SC04_no_regression': no_regress,
        'SC05_cursor_unique': not log or not cursor_ok or len(matched) == 1,
        'SC05_cursor_value': not log or not cursor_ok or len(matched) != 1 or same(value_hash(matched[0]), value_hash(W['env'])),
        'SC06_matched_verified': bool(W['receipt_index']),
        'SC06_custody_event': same(W['custody'].get('event_id'), W['env'].get('event_id')),
        'SC07_no_second_disclosure': W['env']['event_id'] not in request.get('disclosed', []),
        'SC08_empty_proof': bool(log) or request.get('empty_proof') is True,
    }


def obs_cas(W):
    pred, cand, request = W['pred'], W['cand'], W['request']
    pred_rev = pred['index_read_token']['frontier_revision']
    return {
        'CS01_expected_revision': same(request.get('expected_revision'), pred_rev),
        'CS02_revision_step': cand['index_read_token']['frontier_revision'] == pred_rev + (0 if W['empty'] else 1),
        'CS03_expected_hash': same(request.get('expected_hash'), binding_hash(pred)),
        'CS04_prior_unchanged': same(W['actual_prior'], pred),
        'CS05_siblings_preserved': same(W['siblings_after'], W['siblings_before']),
        'CS06_fence_current': request.get('fence') == W['storage_fence'],
    }


def frozen_verify(original, pack_store=None):
    """bsd-w3d-v1 frozen verifier: recompute identity, digest, full value and clocks from the original bytes."""
    try:
        record = decode_storage_value(original.record_bytes, profile=EVENT_VALUE)
        source_row = decode_storage_value(original.result_bytes, profile=EVENT_VALUE)
        custody = decode_storage_value(original.receipt_bytes, profile=EVENT_VALUE)
    except Refusal:
        return False
    b = original.binding
    if type(record) is not dict:
        return False
    digest = digest_or_none(record)
    try:
        commitment = full_value_commitment(record)
    except Refusal:
        return False
    fam = spec.BY_SLUG.get(b.event_type.split('.', 1)[1]) if type(b.event_type) is str else None
    if fam is None:
        return False
    payload = record.get('payload')
    if payload is None and record.get('payload_ref') is not None:
        parts = _pack_parts(record.get('payload_ref'))
        raw = (pack_store or {}).get(parts[3]) if parts else None
        if raw is None:
            return False
        try:
            resolved = decode_storage_value(raw, profile=EVENT_VALUE)
        except Refusal:
            return False
        payload = resolved.get('payload') if type(resolved) is dict else None
    payload = payload if type(payload) is dict else {}
    envelope_ok = ENVELOPE_VALIDATOR.is_valid(record)
    payload_ok = PAYLOAD_VALIDATORS[fam['slug']].is_valid(payload)
    clocks_ok = (clock_ok(record.get('occurred_at_utc'), EVENT_RECORD)
                 and clock_ok(record.get('observed_at_utc'), STORAGE_UTC_Z)
                 and clock_ok(record.get('persisted_at_utc'), STORAGE_UTC_Z))
    identity_ok = (record.get('event_id') == event_id_for(b.storage_instance_id, b.event_type, b.project_id,
                                                          b.owner_operation_id)
                   and record.get('idempotency_key') == key_for(b.project_id, b.owner_operation_id)
                   and payload.get('owner_operation_id') == b.owner_operation_id)
    # This frozen edition's integer domains are enforced independently of jsonschema,
    # whose integer checker admits integral floats. No current writer gate is called.
    numbers_ok = (uint64_ok(record.get('sequence_id'))
                  and (record.get('producer_sequence_id') is None or ok(
                      current_integer, record.get('producer_sequence_id'), minimum=0))
                  and all(ok(current_integer, payload[k], minimum=0)
                          for k in ('policy_revision', 'epoch', 'primary_generation') if payload.get(k) is not None))
    return (envelope_ok and payload_ok and clocks_ok and identity_ok and numbers_ok
            and record.get('event_id') == b.event_id and record.get('idempotency_key') == b.idempotency_key
            and record.get('event_type') == b.event_type and digest is not None and digest == b.source_commitment
            and source_row.get('owner_operation_id') == b.owner_operation_id
            and custody.get('original_event_value_commitment', {}).get('sha256') == commitment
            and custody.get('event_id') == b.event_id)


FROZEN = {RECIPE: FrozenRecipe(frozen_verify)}


def world_recipes(R):
    """Frozen recipe map whose verifier resolves referenced pack bodies from this world's durable store."""
    ref = R['original_ref']
    pack = R['stored'].get(ref, {}).get('pack', {})
    store = pack.get('store', {})
    return {RECIPE: FrozenRecipe(lambda original: frozen_verify(original, store))}


class SealedOwner:
    """Selects only from the one sealed per-original receipt; never creates one (SP-1101, batch 2 fix 1)."""

    def __init__(self, R):
        self.R = R

    def authenticated_original(self, original_ref):
        sealed = [s for s in self.R['sealed'] if s['original_ref'] == original_ref]
        if not sealed:
            raise Refusal('original_unavailable')
        if len(sealed) > 1:
            raise Refusal('recipe_ambiguous')
        stored = self.R['stored'].get(original_ref)
        if stored is None:
            raise Refusal('original_unavailable')
        b = sealed[0]['binding']
        return OriginalCustody(OriginalBinding(**b), sealed[0]['recipe'], stored['record'],
                               storage_value_bytes(stored['source_row'], profile=EVENT_VALUE),
                               storage_value_bytes(stored['custody'], profile=EVENT_VALUE))


def perform_retained_read(R):
    """Perform the actual retained read on a private copy, snapshotting the sealed store and bytes
    before and after. Verification uses the authentic before-read selection; the reader (correct or
    misbehaving) is then run and any receipt/byte mutation is detected by the snapshot, not a flag.
    Returns (selection_ok, verified, bytes_preserved, no_receipt_created).
    """
    Rc = copy.deepcopy(R)
    ref = Rc['original_ref']
    sealed_before = copy.deepcopy(Rc['sealed'])
    bytes_before = Rc['stored'].get(ref, {}).get('record')
    recipes = world_recipes(Rc)
    sel = [s for s in sealed_before if s['original_ref'] == ref]
    selection_ok = (len(sel) == 1 and same(sel[0]['binding'], Rc['expected']) and sel[0]['recipe'] in recipes)
    verified = True
    if selection_ok:
        stored = Rc['stored'].get(ref)
        if stored is None:
            verified = False
        else:
            try:
                original = OriginalCustody(OriginalBinding(**sel[0]['binding']), sel[0]['recipe'], stored['record'],
                                           storage_value_bytes(stored['source_row'], profile=EVENT_VALUE),
                                           storage_value_bytes(stored['custody'], profile=EVENT_VALUE))
                verified = recipes[sel[0]['recipe']].verify_original(original) is True
            except Refusal:
                verified = False
    kind = Rc.get('reader_kind')
    try:
        if kind == 'writes_receipt':
            Rc['sealed'].append({'original_ref': ref, 'binding': copy.deepcopy(Rc['expected']), 'recipe': RECIPE})
            SealedOwner(Rc).authenticated_original(ref)
        elif kind == 'alters_bytes':
            original = SealedOwner(Rc).authenticated_original(ref)
            Rc['stored'][ref]['record'] = original.record_bytes + b'\x00'
        else:
            SealedOwner(Rc).authenticated_original(ref)
    except Refusal:
        pass
    bytes_after = Rc['stored'].get(ref, {}).get('record')
    bytes_preserved = bytes_after == bytes_before
    no_receipt_created = Rc['sealed'] == sealed_before
    return selection_ok, verified, bytes_preserved, no_receipt_created


def obs_history(W):
    R = W['read']
    ref = R['original_ref']
    sealed = [s for s in R['sealed'] if s['original_ref'] == ref]
    out = {'HI01_receipt_present': len(sealed) >= 1, 'HI02_receipt_unique': len(sealed) <= 1}
    one = sealed[0] if len(sealed) == 1 else None
    out['HI03_receipt_original'] = one is None or same(one['binding'], R['expected'])
    recipes = world_recipes(R)
    out['HI04_recipe_known'] = all(s['recipe'] in recipes for s in sealed)
    selection_ok, verified, bytes_preserved, no_receipt_created = perform_retained_read(R)
    out['HI05_original_verifies'] = (not selection_ok) or verified
    out['HI06_bytes_preserved'] = bytes_preserved
    out['HI07_no_receipt_created'] = no_receipt_created
    out['HI09_reader_enabled'] = R['withdrawn'] is False
    out['HI10_permission'] = R['permission'] is True
    out['HI11_not_deleted'] = R['deleted'] is False
    out['HI12_ref_available'] = R['ref_available'] is True
    out['HI13_retained_recipe'] = R['caller_override'] is False
    out['HI14_backup_coherent'] = R['backup_coherent'] is True
    return out


def obs_foreign_entailed(W):
    return {'HI08_not_foreign': W['read']['expected'].get('storage_instance_id') == STORAGE}


def dispatcher_agrees(W):
    """Cross-check: the shared RetainedDispatcher accepts exactly when HI01-HI05 and HI13 hold."""
    R = W['read']
    o = obs_history(W)
    selection_ok = all(o[k] for k in ('HI01_receipt_present', 'HI02_receipt_unique', 'HI03_receipt_original',
                                      'HI04_recipe_known', 'HI05_original_verifies', 'HI13_retained_recipe'))
    dispatcher = RetainedDispatcher(SealedOwner(R), world_recipes(R))
    try:
        expected = OriginalBinding(**R['expected'])
        dispatcher.resolve(R['original_ref'], expected, disclose=lambda b: True,
                           recipe_override=('caller' if R['caller_override'] else None))
        accepted = True
    except Refusal:
        accepted = False
    return accepted == selection_ok


def obs_replay(W):
    return {f'RP{i:02d}_no_{e}': W['replay'][e] == [] for i, e in enumerate(rows_spec.EFFECTS, 1)}


def obs_withdrawal(W):
    D = W['withdraw']
    return {'WD01_cutoff_recorded': D['cutoff_recorded'] is True,
            'WD02_pending_drained': D['pending_drained'] is True,
            'WD03_selector_withdrawn': D['selector_withdrawn'] is True,
            'WD04_no_advance': D['advanced'] == 0 and type(D['advanced']) is int,
            'WD05_no_event_created': D['appended'] == 0 and type(D['appended']) is int}


def observe(phase, W):
    phase = rows_spec.base_phase(phase)
    if phase in ('admission', 'admission_config'):
        return obs_admission(W)
    if phase == 'eligibility':
        return obs_eligibility(W)
    if phase == 'envelope':
        return obs_envelope(W)
    if phase in ('joins', 'joins_config'):
        return obs_joins(W)
    if phase == 'identity':
        return obs_identity(W)
    if phase.startswith('payload_'):
        return obs_payload(W)
    if phase.startswith('source_logical_schema_entailed_'):
        return obs_source_logical_schema_entailed(W)
    if phase.startswith('source_'):
        return obs_source(W)
    if phase == 'start_body_review_started':
        return obs_start_body(W)
    if phase == 'start_premature_result_entailed':
        return obs_start_premature_result_entailed(W)
    if phase == 'operation':
        return obs_operation(W)
    if phase == 'operation_size_entailed':
        return obs_operation_size(W)
    if phase == 'pack':
        return obs_pack(W)
    if phase == 'receipt':
        return obs_receipt(W)
    if phase == 'retry':
        return obs_retry(W)
    if phase == 'checkpoint':
        return obs_checkpoint(W)
    if phase == 'checkpoint_size_entailed':
        return obs_checkpoint_size(W)
    if phase == 'scan':
        return obs_scan(W)
    if phase == 'cas':
        return obs_cas(W)
    if phase == 'history':
        return obs_history(W)
    if phase == 'replay':
        return obs_replay(W)
    if phase == 'withdrawal':
        return obs_withdrawal(W)
    if phase == 'event_arity_entailed':
        return obs_event_arity(W)
    if phase == 'key_arity_entailed':
        return obs_key_arity(W)
    if phase == 'checkpoint_type_entailed':
        return obs_checkpoint_type(W)
    if phase == 'checkpoint_consumer_entailed':
        return obs_checkpoint_consumer(W)
    if phase == 'checkpoint_snapshot_entailed':
        return obs_checkpoint_snapshot(W)
    if phase == 'foreign_original_entailed':
        return obs_foreign_entailed(W)
    raise KeyError(phase)


# --- guard-table evaluation ---------------------------------------------------
_TABLES = {}


def table(phase_name):
    t = _TABLES.get(phase_name)
    if t is None:
        module = importlib.import_module(TABLE_PREFIX + phase_name)
        case = module.case(None)
        rows = [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]
        t = _TABLES[phase_name] = (module.FIELDS, rows)
    return t


class UnattributedObservation(Exception):
    pass


def refusal(phase_name, facts):
    """First refusing row of one table as (row, code), or None; records the evaluation for the suites."""
    fields, rows = table(phase_name)
    missing = sorted(k for k in fields if k not in facts)
    if missing:
        raise UnattributedObservation(f'{phase_name}: missing {missing}')
    observed = {k: facts[k] is True for k in fields}
    first = None
    for name, predicate, context in rows:
        code = predicate(observed, context)
        if code is not None:
            first = (name, code)
            break
    if RECORDER is not None:
        RECORDER.append((phase_name, dict(observed), first))
    return first, observed


def run_path(path, W):
    """Evaluate a path's phases in order; return (base_phase, row, code, failing_rows) or None."""
    fam = W['fam']
    for name in rows_spec.path_phases(path, fam):
        facts = observe(name, W)
        first, observed = refusal(name, facts)
        if first is not None:
            base = rows_spec.base_phase(name)
            failing = [r[0] for r in rows_spec.all_phases()[base][1] if facts.get(r[1]) is not True]
            return (base, first[0], first[1], failing)
    return None


# --- case catalog -------------------------------------------------------------
def setp(*path_value):
    """Hook that sets obj[path...] = value (deep-copied)."""
    *path, value = path_value

    def fn(obj, W):
        target = obj
        for k in path[:-1]:
            target = target[k]
        target[path[-1]] = copy.deepcopy(value)
    return fn


def delp(*path):
    def fn(obj, W):
        target = obj
        for k in path[:-1]:
            target = target[k]
        del target[path[-1]]
    return fn


BIG = None  # 4,400-digit integer, built under exact_integer_digits()


def big_integer():
    global BIG
    if BIG is None:
        with exact_integer_digits():
            BIG = int('9' * 4400)
    return BIG


def _expand_body(body, W):
    """Externalize an oversized logical body via SP-337: expand one unbounded string field."""
    for k in ('claim', 'cursor', 'model_selection', 'trigger_reason', 'reason', 'workflow_id'):
        if k in body and type(body[k]) is str:
            body[k] = 'c' * 17000
            return


def positives(fam):
    slug = fam['slug']
    out = [
        dict(id='append/fresh-after-separate-admission', path='append', muts={}),
        dict(id='append/broad-occurred-profile', path='append',
             muts={'native': setp('occurred_at_utc', '2026-11-01t10:00:00.123456789-05:00')}),
        dict(id='append/external-payload-route', path='append', muts={'logical_body': _expand_body}),
        dict(id='settle/first-receipt-history-committed', path='settle', muts={}),
        dict(id='settle/receipt-clock-offset-accepted', path='settle',
             muts={'receipt': setp('acknowledged_at_utc', '2026-11-01T08:00:02.5+00:00')}),
        dict(id='settle/receipt-clock-lowercase-z-accepted', path='settle',
             muts={'receipt': setp('acknowledged_at_utc', '2026-11-01T08:00:02.5z')}),
        dict(id='settle/receipt-clock-nonzero-offset-accepted', path='settle',
             muts={'receipt': setp('acknowledged_at_utc', '2026-11-01T10:00:02.5+02:00')}),
        dict(id='retry/same-body-other-storage-metadata', path='retry', muts={}),
        dict(id='publish/mixed-scan-unrelated-final', path='publish', muts={}),
        dict(id='publish/actual-empty-source', path='publish', muts={}, empty=True),
        dict(id='read/retained-original', path='read', muts={}),
        dict(id='read/retained-after-live-epoch-and-writer-change', path='read',
             muts={'admission': lambda a, W: a.update(live_epoch=9, live_writer_generation=9, stop='refuse')}),
        dict(id='read/retained-projector-replay-only-original', path='read',
             muts={'envelope': setp('replay_policy', 'projector_replay_only')}),
        dict(id='replay/no-effect', path='replay', muts={}),
        dict(id='withdraw/consumer-withdrawn', path='withdraw', muts={}),
    ]
    # Named valid variants that activate each conditional semantic basis.
    seen = set()
    for name, _inv, _fn, _target, _neg, variant in fam['semantic']:
        if variant and tuple(sorted(variant.items())) not in seen:
            seen.add(tuple(sorted(variant.items())))
            out.append(dict(id=f'append/variant-{name}', path='append', muts={}, variant=variant))
    return out


def _sub_event_component(index, value):
    def fn(env, W):
        parts = env['event_id'].split(':')
        parts[index] = hexs(value)
        env['event_id'] = ':'.join(parts)
    return fn


def _sub_key_component(index, value):
    def fn(env, W):
        parts = env['idempotency_key'].split(':')
        parts[index] = hexs(value)
        env['idempotency_key'] = ':'.join(parts)
    return fn


def shared_negatives(fam):
    """(row, path, muts) single-defect witnesses for the shared phases."""
    backed = fam['assignment_backed']
    big = big_integer()
    N = []

    def add(row, path, muts, label='', multi=False, variant=None, empty=False, external=False):
        N.append(dict(row=row, path=path, muts=muts, label=label, multi=multi, variant=variant,
                      empty=empty, external=external))

    # admission
    add('AD01_cutoff', 'append', {'admission': setp('cutoff', True)}, 'cutoff with registry retained')
    add('AD04_scope_kind', 'append', {'native': setp('scope', 'scope_kind', 'application')}, 'scope kind differs')
    add('AD01_registration', 'append', {'admission': setp('registry', set())}, 'membership absent')
    add('AD02_physical_admission', 'append', {'admission': setp('physical', False)}, 'SP-318 still pending')
    add('AD03_replay_writer', 'append', {'envelope': setp('replay_policy', 'projector_replay_only')})
    add('AD04_project_scope', 'append', {'native': setp('scope', 'project_id', 'project-B')}, 'scope project differs')
    add('AD05_actor', 'append', {'capture': setp('actor_ref', 'pmref:actor.other')}, 'captured actor differs from owner')
    add('AD06_dedupe_available', 'append', {'admission': setp('dedupe_available', False)})
    add('AD07_current_write_permission', 'append', {'admission': setp('permission', False)}, 'reader access stays valid')
    add('AD08_current_owner', 'append', {'admission': setp('live_owner', 'OtherOwner.service@1.0.0')})
    add('AD09_current_writer_generation', 'append', {'admission': setp('live_writer_generation', 4)})
    add('AD10_current_stop', 'append', {'admission': setp('stop', 'refuse')}, 'effective Stop for this operation class')
    if backed:
        add('AD11_current_epoch', 'append', {'admission': setp('live_epoch', 3)}, 'live epoch advanced after capture')
    if fam['slug'] == 'assignment_started':
        add('EL01_not_off', 'append', {'admission': setp('resolved_mode', 'Off')}, 'genuine frozen Off resolution')
    # envelope
    add('EN01_envelope_schema', 'append', {'envelope': setp('extension', 1)}, 'closed envelope extra member')
    add('EN01_envelope_schema', 'append', {'envelope': setp('sequence_id', '7'), 'meta': setp('sequence_id', '7')},
        'string number', multi=True)
    for label, value in (('missing zone', '2026-11-01T10:00:00'), ('hour 24', '2026-11-01T24:00:00Z'),
                         ('trailing LF', '2026-11-01T10:00:00Z\n'), ('Feb 30', '2026-02-30T10:00:00Z'),
                         ('space separator', '2026-11-01 10:00:00Z'), ('invalid leap second', '2026-11-01T10:00:60Z')):
        add('EN02_occurred_clock', 'append', {'native': setp('occurred_at_utc', value)}, label)
    for row, field in (('EN03_observed_clock', 'observed_at_utc'), ('EN04_persisted_clock', 'persisted_at_utc')):
        for label, value in (('+00:00 zone', '2026-11-01T08:00:02+00:00'), ('lowercase z', '2026-11-01T08:00:02z'),
                             ('-00:00 zone', '2026-11-01T08:00:02-00:00'), ('nonzero offset', '2026-11-01T10:00:02+02:00')):
            add(row, 'append', {'meta': setp(field, value)}, label)
    for label, value in (('float spelling 7.0', 7.0), ('2^64', 2 ** 64), ('4,400-digit integer', big)):
        add('EN05_sequence_uint64', 'append', {'meta': setp('sequence_id', value)}, label)
    add('EN06_producer_sequence', 'append', {'envelope': setp('producer_sequence_id', 3.0)}, 'float spelling 3.0')
    for label, value in (('2^53+1 binary64', 2 ** 53 + 1), ('2^60 decimal', 2 ** 60), ('4,400-digit integer', big)):
        add('EN07_producer_qualified', 'append', {'envelope': setp('producer_sequence_id', value)}, label)
    add('EN08_family', 'append', {'envelope': setp('event_type', 'bsd.other.event')})
    add('EN09_payload_schema', 'append', {'envelope': setp('payload_schema_id', 'pm.event_payload.other.v1')})
    add('EN10_redaction_join', 'append', {'envelope': setp('redaction_profile', 'no_secrets')})
    add('EN11_inline_size', 'append', {'envelope': setp('payload', 'extra_body', 'x' * 17000)}, 'inline body above 16 KiB')
    add('EN12_payload_route', 'append', {'envelope': setp('payload_ref', 'pm-payload-ref:v1:blake3:' + '0' * 64 + ':10:application/msgpack')},
        'both inline body and reference present')
    add('EN13_migration_null', 'append', {'envelope': setp('migration', 'migration_id', 'migration-1')})
    for field in rows_spec.MIGRATION_FIELDS:
        add('EN13_migration_' + field, 'append', {'envelope': setp('migration', field, 'old-edition')}, field)
    add('EN14_sequence_join', 'append', {'envelope': setp('sequence_id', 8)}, 'caller-supplied sequence')
    add('EN15_observed_join', 'append', {'envelope': setp('observed_at_utc', '2026-11-01T08:00:09Z')})
    add('EN16_persisted_join', 'append', {'envelope': setp('persisted_at_utc', '2026-11-01T08:00:09Z')})
    add('EN17_metadata_size', 'append', {'native': setp('actor_ref', 'h' * 17000)}, 'identity length expansion above 16 KiB')
    add('EN18_replay_policy', 'append', {'envelope': setp('replay_policy', 'append_once')})
    # joins
    if backed:
        add('JN01_run_join', 'append', {'envelope': setp('run_id', 'run-2')}, 'envelope run differs from assignment')
    else:
        add('JN01_run_null', 'append', {'envelope': setp('run_id', 'run-1')}, 'configuration event invents a run')
    add('JN02_project_join', 'append', {'envelope': setp('project_id', 'project-B')})
    for i, field in enumerate(rows_spec.ENVELOPE_JOINS, 3):
        value = {'thread_id': 'thread-2', 'requested_account_ref': 'pmref:account.other',
                 'effective_account_ref': 'pmref:account.other', 'actor_ref': 'pmref:actor.other',
                 'correlation_id': 'corr-other', 'causation_event_id': 'evt-other', 'parent_event_id': 'evt-parent',
                 'node_id': 'node-1', 'attempt_id': 'attempt-1'}[field]
        add(f'JN{i:02d}_{field}_join', 'append', {'envelope': setp(field, value)})
    # identity
    add('ID01_event_prefix', 'append', {'envelope': lambda e, W: e.__setitem__('event_id', 'bsd-event@2:' + e['event_id'].split(':', 1)[1])})
    for row, index, value in (('ID03_event_storage', 1, OTHER_STORAGE), ('ID04_event_type', 2, 'bsd.other.event'),
                              ('ID05_event_project', 3, 'project-B'), ('ID06_event_operation', 4, 'bsd-op@1:00:00:00')):
        add(row, 'append', {'envelope': _sub_event_component(index, value)})
    add('ID07_operation_recipe', 'append', {'authentic_source': setp('original_source_id', 'pmref:source.other')},
        'operation not recomputed from the authentic original source')
    add('ID08_key_prefix', 'append', {'envelope': lambda e, W: e.__setitem__('idempotency_key', 'bsd-key@2:' + e['idempotency_key'].split(':', 1)[1])})
    add('ID10_key_project', 'append', {'envelope': _sub_key_component(1, 'project-B')})
    add('ID11_key_operation', 'append', {'envelope': _sub_key_component(2, 'bsd-op@1:00:00:00')})
    add('ID12_partition_recipe', 'append', {'native': setp('scope', 'scope_partition', PROJECT)}, 'raw project id, no project~')
    return N



def _pack_raw(pack, raw):
    """Replace pack bytes and regenerate the BLAKE3/size reference (one coherent defect)."""
    digest = blake3.blake3(raw).hexdigest()
    pack['store'] = {digest: raw}
    pack['ref'] = f'pm-payload-ref:v1:blake3:{digest}:{len(raw)}:{PACK_MEDIA}'

def retained_original_record(R, record):
    """Seal a historical fixture at write time, before its independently installed frozen verifier runs.

    The supplied record may have one historical defect. Re-derive the receipt and binding copies
    from it, but retain the independent operation identity and source row from authentic custody.
    This models authentic custody of invalid bytes, not a caller choosing a recipe while reading.
    """
    ref = R['original_ref']
    stored = R['stored'][ref]
    record = copy.deepcopy(record)
    stored['record'] = storage_value_bytes(record, profile=EVENT_VALUE)
    digest = digest_or_none(record) or '0' * 64
    for binding in (R['expected'], R['sealed'][0]['binding']):
        binding.update(event_id=record['event_id'], idempotency_key=record['idempotency_key'], source_commitment=digest)
    custody = stored['custody'] = copy.deepcopy(stored['custody'])
    custody.update(event_id=record['event_id'], idempotency_key=record['idempotency_key'], producer_semantic_digest=digest)
    custody['first_append_receipt']['event_id'] = record['event_id']
    custody['original_event_value_commitment']['sha256'] = full_value_commitment(record)


def frozen_defect(field, value, payload=False):
    def mutate(R, W):
        record = copy.deepcopy(W['env'])
        target = record['payload'] if payload else record
        target[field] = value
        retained_original_record(R, record)
    return mutate


def shared_negatives_storage(fam):
    big = big_integer()
    N = []

    def add(row, path, muts, label='', multi=False, variant=None, empty=False):
        N.append(dict(row=row, path=path, muts=muts, label=label, multi=multi, variant=variant, empty=empty))

    # operation
    add('OP01_operation_schema', 'append', {'operation': setp('extension', 1)}, 'closed operation extra member')
    add('OP02_operation_key', 'append', {'operation_key': lambda k, W: k.replace(partition_for(PROJECT), 'raw-partition')})
    add('OP03_operation_storage', 'append', {'operation': setp('storage_instance_id', OTHER_STORAGE)})
    add('OP04_operation_project', 'append', {'operation': setp('project_id', 'project-B')})
    add('OP05_operation_event', 'append', {'operation': setp('event_id', 'bsd-event@1:00')})
    add('OP06_operation_key_join', 'append', {'operation': setp('idempotency_key', 'bsd-key@1:00')})
    add('OP07_operation_digest', 'append', {'operation': setp('producer_semantic_digest', sha(b'other'))})
    add('OP08_operation_state', 'append', {'operation': lambda op, W: op.update(state='complete', first_append_receipt={
        'event_id': W['env']['event_id'], 'sequence_id': W['meta']['sequence_id'], 'segment_generation': 3,
        'segment_name': 'seg-000003', 'byte_offset': 4096, 'commit_group_id': 'cg-append', 'durability_class': 'barrier',
        'durable_end_offset': 8192, 'durability_state': 'synced', 'manifest_generation': 5,
        'acknowledged_at_utc': '2026-11-01T08:00:02.5Z'})}, 'complete state on a fresh append')
    add('OP09_pending_not_current', 'append', {'head_published': True}, 'head published before barrier receipt')
    add('OP10_operation_source_ref', 'append', {'operation': setp('source_state_ref', 'pmref:wrapper.other.0001')})
    # pack
    add('PK01_pack_present', 'append', {'pack': setp('store', {})})
    add('PK02_pack_digest', 'append', {'pack': lambda p, W: p.update(ref=p['ref'].replace(p['ref'].split(':')[3], sha(b'substituted-digest')),
                                                                      store={sha(b'substituted-digest'): next(iter(p['store'].values()))})})
    add('PK03_pack_size', 'append', {'pack': lambda p, W: p.update(ref=':'.join(p['ref'].split(':')[:4] + [str(int(p['ref'].split(':')[4]) + 1), PACK_MEDIA]))})
    add('PK04_pack_media', 'append', {'pack': lambda p, W: p.update(ref=':'.join(p['ref'].split(':')[:5] + ['application/json']))})
    add('PK05_pack_decodes', 'append', {'pack': lambda p, W: _pack_raw(p, b'\x82\xc0\xc0')}, 'non-canonical bytes, reference coherent')
    add('PK06_pack_intent', 'append', {'pack': lambda p, W: _pack_raw(
        p, storage_value_bytes(dict(W['intent'], actor_ref='pmref:actor.other'), profile=EVENT_VALUE))},
        'pack bytes differ from the authentic producer intent')
    add('PK07_source_pack_present', 'append', {'logical_pack': setp('store', {})})
    add('PK08_source_pack_size', 'append', {'wrapper': setp('logical_payload_byte_size', 999999)})
    add('PK09_source_body_schema', 'append', {'logical_body': setp('extension', 1)}, 'closed logical body extra member')
    if fam['source_kind'] in ('finding', 'review_cycle', 'quarantine', 'workflow_binding'):
        add('PK10_source_body_clocks', 'append', {'logical_body': setp('created_at', '2026-11-01T09:00:00')}, 'logical body clock missing zone')
    if fam['source_kind'] == 'finding':
        add('PK10_source_updated_clock', 'append', {'logical_body': setp('updated_at', '2026-11-01T09:00:00')}, 'updated clock missing zone')
    # receipt / settlement
    add('RC01_custody_schema', 'settle', {'custody': setp('extension', 1)})
    for row, field, value in (('RC02_custody_event', 'event_id', 'bsd-event@1:00'),
                              ('RC03_custody_partition', 'scope_partition', 'other'),
                              ('RC04_custody_type', 'event_type', 'bsd.other.event'),
                              ('RC05_custody_key', 'idempotency_key', 'bsd-key@1:00'),
                              ('RC06_custody_digest', 'producer_semantic_digest', sha(b'other')),
                              ('RC07_custody_storage', 'storage_instance_id', OTHER_STORAGE)):
        add(row, 'settle', {'custody': setp(field, value)})
    add('RC08_full_value', 'settle', {'custody': setp('original_event_value_commitment', 'sha256', sha(b'other'))})
    add('RC09_receipt_event', 'settle', {'receipt': setp('event_id', 'bsd-event@1:00')})
    add('RC10_receipt_sequence', 'settle', {'receipt': setp('sequence_id', 8)})
    add('RC11_receipt_sequence_uint64', 'settle', {'meta': setp('sequence_id', 7.0)}, 'float spelling, Storage copy coherent')
    for i, slot in enumerate(rows_spec.RECEIPT_UINT[1:], 12):
        add(f'RC{i:02d}_receipt_{slot}_uint64', 'settle', {'receipt': setp(slot, 3.0)}, 'float spelling')
    add('RC16_ack_clock', 'settle', {'receipt': setp('acknowledged_at_utc', '2026-11-01T08:00:02.5')}, 'missing zone')
    add('RC16_ack_clock', 'settle', {'receipt': setp('acknowledged_at_utc', '2026-11-01T08:00:02.5Z\n')}, 'trailing LF')
    add('RC17_receipt_durability', 'settle', {'receipt': setp('durable_end_offset', 0)}, 'durable end does not cover the appended range')
    add('RC18_barrier_receipt', 'settle', {'receipt': setp('durability_class', 'ordinary')})
    add('RC19_settlement_ref', 'settle', {'settle': setp('row', 'first_append_receipt_ref', 'pmref:receipt.other')})
    add('RC20_settlement_phase', 'settle', {'settle': setp('row', 'phase', 'source_committed')})
    add('RC21_settlement_release', 'settle', {'settle': lambda s, W: s['row'].__setitem__('pending_intent_ref', W['pack']['ref'])})
    add('RC22_pin_released', 'settle', {'settle': lambda s, W: s.__setitem__('pins_after', copy.deepcopy(s['pins_before']))})
    add('RC23_other_holds_kept', 'settle', {'settle': lambda s, W: s.__setitem__('pins_after', {k: [] for k in s['pins_after']})})
    add('RC24_no_new_receipt', 'settle', {'settle': setp('receipts_after', 2)}, 'restart minted a second receipt')
    add('RC24_one_original_receipt', 'settle', {'settle': lambda r, W: r.update(receipts_before=2, receipts_after=2)},
        'two original receipts; count preserved')
    add('RC25_head_operation', 'settle', {'head': setp('current_owner_operation_id', 'bsd-op@1:00:00:00')})
    add('RC26_head_committed', 'settle', {'committed_wrappers': lambda r, W: (r.pop(W['wrapper_ref']), None)},
        'correct head source absent from committed store')
    add('RC26_head_subject', 'settle', {'head': setp('subject_id', 'subject-other')}, 'head subject differs')
    add('RC25_head_cas', 'settle', {'head_expected': lambda h, W: h.__setitem__('current_source_ref', 'pmref:wrapper.stale')})
    add('RC26_head_source_join', 'settle', {'head': setp('current_source_ref', 'pmref:wrapper.other.0001')},
        'coherent wrapper for a different subject')
    # retry
    add('RT01_retry_not_replay_only', 'retry', {'retry': setp('env', 'replay_policy', 'projector_replay_only')})
    add('RT02_retry_membership', 'retry', {'retry': setp('registry', set())})
    add('RT03_retry_dedupe_available', 'retry', {'retry': setp('dedupe_available', False)})
    add('RT04_retry_original_found', 'retry', {'retry': setp('dedupe', {})})
    add('RT05_retry_digest_equal', 'retry', {'retry': setp('env', 'payload', 'extra_body', 'changed')}, 'same key, different body')
    add('RT06_retry_receipt_original', 'retry', {'retry': setp('result', 'receipt', 'sequence_id', 9)}, 'a new receipt minted')
    add('RT07_retry_no_remote', 'retry', {'retry': setp('result', 'remote_operations', 1)})
    add('RT08_original_retry_custody', 'retry', {'retry': setp('original_custody_available', False)})
    add('RT09_retry_envelope_schema', 'retry', {'retry': setp('env', 'extension', 1)}, 'retry envelope extra member')
    add('RT10_retry_producer_sequence', 'retry', {'retry': setp('env', 'producer_sequence_id', 1.0),
        'retry_original_digest': None}, 'retry float integer with coherent dedupe digest')
    # checkpoint
    add('CP01_root_schema', 'publish', {'cand': setp('extension', 1)})
    add('CP02_checkpoint_storage', 'publish', {'cand': setp('storage_instance_id', OTHER_STORAGE)})
    add('CP04_checkpoint_project', 'publish', {'cand': setp('project_id', 'project-B')})
    for i, field in enumerate(rows_spec.TOKEN_FIELDS, 7):
        stale = {'storage_instance_id': OTHER_STORAGE, 'checkpoint_key': 'event_record_index.v1:stale',
                 'checkpoint_ref': 'checkpoints/stale', 'generation_id': 'eig_' + sha(b'stale'),
                 'generation_anchor_sha256': sha(b'stale-anchor'), 'frontier_revision': 7,
                 'frontier_sha256': sha(b'stale-frontier'), 'index_dataset_name': 'event_record_index.g0'}
        add(f'CP{i:02d}_token_{field}', 'publish', {'cand': setp('index_read_token', field, stale[field])})
    base = 7 + len(rows_spec.TOKEN_FIELDS)
    for i, field in enumerate(rows_spec.SELECTION_FIELDS):
        sel_stale = {'storage_instance_id': OTHER_STORAGE, 'selected_segment_generation': 2, 'manifest_generation': 4,
                     'recovery_epoch': 0}
        value = sel_stale.get(field, sha(f'stale-{field}'.encode()))
        add(f'CP{base + i:02d}_selection_{field}', 'publish', {'cand': setp('index_read_token', 'source_selection', field, value)})
    nxt = base + len(rows_spec.SELECTION_FIELDS)
    add(f'CP{nxt:02d}_token_uint64', 'publish', {'cand': setp('index_read_token', 'frontier_revision', 8.0),
                                                 'live': setp('frontier_revision', 8.0)}, 'float spelling in candidate and live control')
    for field in rows_spec.CHECKPOINT_INTEGERS:
        add('CP26_uint64_' + field, 'publish',
            {'cand': setp('index_read_token', 'source_selection', field, 3.0),
             'live': setp('source_selection', field, 3.0)}, 'float spelling in candidate and live')
    # scan
    add('SC01_generic_source', 'publish', {'generic_index': False}, 'incomplete generic index')
    add('SC02_coverage_complete', 'publish', {'request': setp('scanned', [7])}, 'filtered maximum presented as coverage')
    add('SC03_cursor_event', 'publish', {'cand': setp('last_matched_event_id', 'other-event')})
    add('SC04_cursor_sequence', 'publish', {'cand': setp('last_scanned_sequence', 9)})
    add('SC05_cursor_value', 'publish', {'log': lambda log, W: [dict(W['env'], actor_ref='pmref:actor.other'), log[1]]},
        'stored match bytes differ from the original')
    add('SC06_matched_verified', 'publish', {'receipt_index': lambda i, W: {}})
    add('SC07_no_second_disclosure', 'publish', {'request': lambda r, W: r.__setitem__('disclosed', [W['env']['event_id']])})
    add('SC08_empty_proof', 'publish', {'request': setp('empty_proof', False)}, 'empty claim without inventory proof', empty=True)
    add('SC04_no_regression', 'publish', {'pred': setp('last_scanned_sequence', 9)}, 'cursor regresses behind prior')
    add('SC05_cursor_unique', 'publish',
        {'log': lambda log, W: [log[0], log[0], log[1]], 'request': setp('scanned', [7, 7, 8])},
        'two stored matches for one selected event')
    add('SC06_custody_event', 'publish', {'custody': setp('event_id', 'bsd-event@1:00')}, 'receipt index present but other event')
    # cas
    add('CS01_expected_revision', 'publish', {'request': setp('expected_revision', 6)})
    add('CS02_revision_step', 'publish', {'cand': setp('index_read_token', 'frontier_revision', 9),
                                          'live': setp('frontier_revision', 9)}, 'candidate skips a revision step')
    add('CS03_expected_hash', 'publish', {'request': setp('expected_hash', sha(b'x'))})
    add('CS04_prior_unchanged', 'publish', {'actual_prior': lambda p, W: p.__setitem__('last_scanned_sequence', 5)},
        'actual old checkpoint changed before commit')
    add('CS05_siblings_preserved', 'publish', {'siblings_after': setp('projection_rows', 2)})
    add('CS06_fence_current', 'publish', {'request': setp('fence', 'fence-0041')})
    # history (SP-1101 retained read)
    add('HI01_receipt_present', 'read', {'read': setp('sealed', [])}, 'missing receipt')
    add('HI02_receipt_unique', 'read', {'read': lambda r, W: r['sealed'].append(copy.deepcopy(r['sealed'][0]))}, 'ambiguous: sealed twice')
    add('HI03_receipt_original', 'read', {'read': setp('sealed', 0, 'binding', 'event_id', 'bsd-event@1:00')}, 'receipt for another original')
    add('HI04_recipe_known', 'read', {'read': lambda r, W: r['sealed'][0].__setitem__('recipe', UNKNOWN_RECIPE)})
    add('HI05_original_verifies', 'read', {'read': lambda r, W: r['stored'][r['original_ref']].__setitem__(
        'record', storage_value_bytes(dict(W['env'], actor_ref='pmref:actor.other'), profile=EVENT_VALUE))},
        'stored bytes differ from the sealed original')
    for label, mutate in (
        ('frozen occurred clock', frozen_defect('occurred_at_utc', '2026-11-01T10:00:00')),
        ('frozen observed clock', frozen_defect('observed_at_utc', '2026-11-01T08:00:01+00:00')),
        ('frozen persisted clock', frozen_defect('persisted_at_utc', '2026-11-01T08:00:02+00:00')),
        ('frozen payload schema', frozen_defect('schema_version', 'invalid', payload=True)),
        ('frozen payload identifier', frozen_defect('source_state_ref', 'invalid reference', payload=True)),
        ('frozen event identity', frozen_defect('event_id', 'bsd-event@1:00')),
        ('frozen key identity', frozen_defect('idempotency_key', 'bsd-key@1:00')),
        ('frozen operation identity', frozen_defect('owner_operation_id', 'bsd-op@1:00:00:00', payload=True)),
        ('frozen producer integer', frozen_defect('producer_sequence_id', 1.0)),
        ('frozen storage integer', frozen_defect('sequence_id', 7.0)),
        ('frozen payload integer', frozen_defect('policy_revision', 3.0, payload=True)),
    ):
        add('HI05_original_verifies', 'read', {'read': mutate}, label)
    if fam['assignment_backed']:
        for field, value in (('epoch', 2.0), ('primary_generation', 4.0)):
            add('HI05_original_verifies', 'read', {'read': frozen_defect(field, value, payload=True)},
                'frozen payload integer ' + field)
    add('HI06_bytes_preserved', 'read', {'read': setp('reader_kind', 'alters_bytes')}, 'reader alters stored bytes')
    add('HI07_no_receipt_created', 'read', {'read': setp('reader_kind', 'writes_receipt')}, 'reader mints a receipt while reading')
    add('HI09_reader_enabled', 'read', {'read': setp('withdrawn', True)})
    add('HI10_permission', 'read', {'read': setp('permission', False)})
    add('HI11_not_deleted', 'read', {'read': setp('deleted', True)})
    add('HI12_ref_available', 'read', {'read': setp('ref_available', False)})
    add('HI13_retained_recipe', 'read', {'read': setp('caller_override', True)}, 'caller-chosen recipe override')
    add('HI14_backup_coherent', 'read', {'read': setp('backup_coherent', False)}, 'one required source missing from the backup cut')
    # replay
    for i, e in enumerate(rows_spec.EFFECTS, 1):
        add(f'RP{i:02d}_no_{e}', 'replay', {'replay': setp(e, [f'{e}:1'])})
    # withdrawal
    add('WD01_cutoff_recorded', 'withdraw', {'withdraw': setp('cutoff_recorded', False)})
    add('WD02_pending_drained', 'withdraw', {'withdraw': setp('pending_drained', False)})
    add('WD03_selector_withdrawn', 'withdraw', {'withdraw': setp('selector_withdrawn', False)})
    add('WD04_no_advance', 'withdraw', {'withdraw': setp('advanced', 1)})
    add('WD05_no_event_created', 'withdraw', {'withdraw': setp('appended', 1)})
    return N


def _payload_witness(fam, field, kw, spec_):
    """One single-defect payload mutation for a schema keyword row."""
    if '$ref' in spec_:
        spec_ = SCHEMAS['bsd_event_payloads']['$defs'][spec_['$ref'].split('/')[-1]]
    if kw == 'required':
        return delp(field)
    if kw == 'const':
        return setp(field, 'other')
    if kw == 'enum':
        return setp(field, 'unknown_enum_value')
    if kw == 'type':
        if 'oneOf' in spec_:
            return setp(field, 7)
        if spec_.get('type') == 'array':
            return setp(field, 'not-an-array')
        if spec_.get('type') == 'string':
            return setp(field, 12345)
        if spec_.get('type') == 'integer':
            return setp(field, '7')
        if spec_.get('type') == 'boolean':
            return setp(field, 'true')
        if spec_.get('type') == 'null':
            return setp(field, 'not-null')
        return setp(field, None)
    if kw == 'minimum':
        return setp(field, spec_['minimum'] - 1)
    if kw == 'maximum':
        return setp(field, spec_['maximum'] + 1)
    if kw == 'minLength':
        return setp(field, 'a' * (spec_['minLength'] - 1))
    if kw == 'maxLength':
        return setp(field, 'a' * (spec_['maxLength'] + 1))
    if kw == 'pattern':
        return setp(field, '1bad value')
    if kw == 'no_linebreak':
        return setp(field, 'pmref:body.0001\n')
    if kw == 'minItems':
        return setp(field, [])
    if kw == 'uniqueItems':
        return setp(field, ['mode', 'mode'])
    if kw == 'items_enum':
        return setp(field, ['not_a_policy_field'])
    raise KeyError(kw)


def family_negatives(fam):
    N = []
    slug = fam['slug']
    schema = SCHEMAS['bsd_event_payloads']['$defs'][slug]

    def add(phase, row, path, muts, label='', multi=False, variant=None):
        N.append(dict(phase=phase, row=row, path=path, muts=muts, label=label, multi=multi, variant=variant))

    # payload schema rows
    for name, _field, _inv, _code in rows_spec.payload_rows(fam):
        if name == 'payload.closed':
            add('payload', name, 'append', {'payload': setp('extra_ref', 'pmref:extra.0001')}, 'closed root extra member')
            continue
        if name.endswith('_source_join'):
            field = name[len('payload_'):-len('_source_join')]
            wrong = 999 if field in ('policy_revision', 'epoch', 'primary_generation') else 'pmref:forged.' + field
            if field in ('bsd_assignment_id', 'primary_run_id', 'review_cycle_id', 'binding_id') and not fam['assignment_backed']:
                wrong = 'invented-value'
            add('payload', name, 'append', {'payload': setp(field, wrong)}, 'payload field differs from authentic source')
            continue
        _, field, kw = name.split('.', 2)
        add('payload', name, 'append', {'payload': _payload_witness(fam, field, kw, schema['properties'][field])}, kw)
    # wrong-type forms for const/enum/boolean field values (type confusion, standing item 11)
    for field, spec_ in schema['properties'].items():
        if 'const' in spec_ and spec_['const'] is False:
            add('payload', f'payload.{field}.const', 'append', {'payload': setp(field, 'false')}, 'string boolean', multi=False)
        if 'enum' in spec_:
            add('payload', f'payload.{field}.enum', 'append', {'payload': setp(field, 7)}, 'wrong type number')
    # wrapper custody rows SR01-SR07
    add('source', 'SR01_wrapper_schema', 'append', {'wrapper': setp('extension', 1)}, 'closed wrapper extra member')
    add('source', 'SR02_wrapper_subject', 'append', {'wrapper': setp('subject_id', 'subject-other')}, 'wrapper subject differs')
    add('source', 'SR04_wrapper_operation', 'append', {'wrapper': setp('owner_operation_id', 'bsd-op@1:00:00:00')},
        'wrapper operation differs')
    add('source', 'SR05_wrapper_original', 'append', {'wrapper': setp('original_source_ref', 'pmref:original.unknown')},
        'original source does not resolve')
    if slug == 'review_started':
        add('source', 'SR06_source_commitment', 'append',
            {'payload': lambda p, W: p.update(source_state_ref=f'pmref:wrapper.{slug}.0002',
                                              review_start_ref=f'pmref:wrapper.{slug}.0002')},
            'source-state reference names a different committed wrapper')
    else:
        add('source', 'SR06_source_commitment', 'append', {'payload': setp('source_state_ref', f'pmref:wrapper.{slug}.0002')},
            'source-state reference names a different committed wrapper')
    add('source', 'SR06_committed_wrapper', 'append',
        {'committed_wrappers': lambda r, W: (r.pop(W['wrapper_ref']), None)}, 'exact source absent from committed store')
    add('source', 'SR07_operation_identity', 'append',
        {'operation': setp('owner_operation_id', 'bsd-op@1:00:00:00')}, 'operation identity differs')
    add('source', 'SR07_operation_source', 'append', {'operation_committed': False}, 'operation not owner-committed')
    # semantic witnesses
    for i, (name, _inv, _fn, target, neg, variant) in enumerate(fam['semantic'], 8):
        row = f'SR{i:02d}_sem_{name}'
        kind, key = target
        hook_name = 'native' if kind == 'fact' else 'payload'
        if kind == 'fact':
            muts = {'native': lambda obj, W, key=key, neg=neg: obj['facts'].__setitem__(key, copy.deepcopy(neg))}
        else:
            muts = {'payload': setp(key, neg)}
        add('source', row, 'append', muts, 'single semantic defect', variant=variant)
    # finding identity operands
    if fam['source_kind'] == 'finding':
        nxt = 8 + len(fam['semantic'])
        prefix = f'SR{nxt:02d}_finding_identity_operands'
        add('source', prefix, 'append', {'identity_inputs': setp('extension', 1)}, 'identity manifest schema')
        values = {
            'family': ('finding_family', 'Substituted.Family!v1'),
            'affected': ('affected_object_refs', ['pmref:affected.other']),
            'rules': ('rule_or_constraint_refs', ['pmref:rule.other']),
            'evidence': ('evidence_fingerprint', sha(b'other evidence')),
            'original': ('original_source_ref', 'pmref:finding.decision.other'),
        }
        for suffix, (field, value) in values.items():
            add('source', prefix + '_' + suffix, 'append', {'identity_inputs': setp(field, value)},
                'single operand differs; derived key and packs coherent')
        add('source', prefix + '_key', 'append', {'payload': setp('finding_key', 'bsd-finding@1:' + sha(b'wrong key'))},
            'key differs from authentic identity manifest')
    # review chain
    if slug in rows_spec.REVIEW_CHAIN:
        nxt = 8 + len(fam['semantic']) + (1 if fam['source_kind'] == 'finding' else 0)
        add('source', f'SR{nxt:02d}_terminal_start_custody', 'append', {'start_custody': False},
            'original start custody unavailable')
        add('source', f'SR{nxt:02d}_terminal_start_custody_ref', 'append',
            {'terminal_wrapper': setp('review_start_ref', 'pmref:wrapper.review_start.other')},
            'terminal names another original start')
        nxt += 1
        for field in rows_spec.TERMINAL_START_FIELDS:
            wrong = 999 if field == 'primary_generation' else ('substituted-' + field)
            if field == 'frozen_boundary':
                wrong = True
            add('source', f'SR{nxt:02d}_terminal_start_{field}_join', 'append',
                {'terminal_body': setp(field, wrong)}, 'terminal field differs from original start')
            nxt += 1
    if slug == 'review_started':
        add('source', f'SR{nxt:02d}_start_source_kind', 'append', {'start_source_kind': 'review_cycle'},
            'terminal source selected as start')
        nxt += 1
        add('source', f'SR{nxt:02d}_start_admission_identity', 'append',
            {'start_body': setp('review_admission_id', 'admission-other')}, 'start admission identity substituted')
        nxt += 1
        add('source', f'SR{nxt:02d}_start_ref_join', 'append',
            {'payload': setp('review_start_ref', 'pmref:wrapper.review_start.0002')}, 'start ref names another admission')
        nxt += 1
        for field in rows_spec.START_JOIN_FIELDS:
            if field == 'frozen_boundary':
                wrong = True
            elif field == 'trigger_kind':
                wrong = 'pre_high_risk_action'
            elif field == 'stable_prefix_hash':
                wrong = sha(b'substituted prefix')
            else:
                wrong = 'pmref:substituted.' + field
            add('source', f'SR{nxt:02d}_start_{field}_source_join', 'append',
                {'start_body': setp(field, wrong)}, 'start field differs from accepted admission')
            nxt += 1
        # start body schema rows
        start_schema = SCHEMAS['bsd_event_storage_contracts']['$defs']['review_start']
        for name, _f, _inv, _code in rows_spec.start_body_rows():
            if name == 'start_body.closed':
                add('start_body_review_started', name, 'append', {'start_body': setp('result', 'silent')}, 'closed start extra member')
                continue
            _, field, kw = name.split('.', 2)
            if kw == 'required':
                add('start_body_review_started', name, 'append', {'start_body': delp(field)}, 'required')
            else:
                spec_ = start_schema['properties'][field]
                if 'const' in spec_:
                    mut = setp(field, 'other')
                elif 'enum' in spec_:
                    mut = setp(field, 'unknown_trigger')
                elif '$ref' in spec_ and spec_['$ref'].endswith('sha256'):
                    mut = setp(field, '0' * 63)
                elif '$ref' in spec_ and spec_['$ref'].endswith('identifier'):
                    mut = setp(field, '')
                else:
                    mut = setp(field, -1)
                add('start_body_review_started', name, 'append', {'start_body': mut}, 'value')
    return N


def all_cases(fam):
    out = []
    for p in positives(fam):
        out.append(dict(p, kind='positive'))
    for n in shared_negatives(fam) + shared_negatives_storage(fam):
        phase = rows_spec.phase_name(_phase_of(n['row']), fam)
        out.append(dict(n, kind='negative', phase=phase, id=f"{n['row']}/{n['label'] or 'single defect'}"))
    for n in family_negatives(fam):
        phase = rows_spec.phase_name(n['phase'], fam) if n['phase'] in ('payload', 'source') else n['phase']
        out.append(dict(n, kind='negative', phase=phase, id=f"{n['row']}/{n['label'] or 'single defect'}"))
    return out


_ROW_PHASE = {}


def _phase_of(row):
    if not _ROW_PHASE:
        for phase, (_t, rows) in rows_spec.SHARED.items():
            if phase.endswith('_config') or phase.endswith('_entailed'):
                continue
            for r in rows:
                _ROW_PHASE.setdefault(r[0], phase)
    _ROW_PHASE.setdefault('JN01_run_null', 'joins')
    return _ROW_PHASE[row]


def code_of(phase_name, row):
    phases = rows_spec.all_phases()
    for r in phases[phase_name][1]:
        if r[0] == row:
            return r[3]
    raise KeyError((phase_name, row))


def judge(case, result):
    """None when the case met its expectation, else a mismatch string."""
    if case['kind'] == 'positive':
        return None if result is None else f'positive refused at {result[:3]}'
    if result is None:
        return 'negative accepted'
    phase, row, code, failing = result
    want = (case['phase'], case['row'], code_of(case['phase'], case['row']))
    if (phase, row, code) != want:
        return f'refused at {(phase, row, code)} instead of {want}'
    if not case.get('multi') and len(failing) != 1:
        return f'not single-row: {failing}'
    return None


def run_case(fam, case):
    W = build(fam, case['muts'], variant=case.get('variant'), empty=case.get('empty', False),
              external=case.get('external', False))
    result = run_path(case['path'], W)
    extra = None
    if case['path'] == 'read' and not dispatcher_agrees(W):
        extra = 'RetainedDispatcher disagrees with HI01-HI05/HI13'
    return result, extra


def main(argv=None):
    args = list(sys.argv[1:] if argv is None else argv)
    only = None
    if '--family' in args:
        only = args[args.index('--family') + 1]
    out_path = Path(args[args.index('--json') + 1]) if '--json' in args else None
    summary = dict(families=0, positives=0, negatives=0, single_row=0, multi_row=0, mismatches=[], unresolved_refs=[])
    coverage = {}
    with exact_integer_digits():
        summary['unresolved_refs'] = resolve_every_ref()
        for fam in spec.FAMILIES:
            if only and fam['event_type'] != only:
                continue
            summary['families'] += 1
            witnessed = coverage.setdefault(fam['event_type'], {})
            for case in all_cases(fam):
                result, extra = run_case(fam, case)
                mismatch = judge(case, result) or extra
                if mismatch:
                    summary['mismatches'].append(dict(family=fam['event_type'], case=case['id'], why=mismatch))
                    continue
                if case['kind'] == 'positive':
                    summary['positives'] += 1
                    continue
                summary['negatives'] += 1
                single = len(result[3]) == 1
                summary['single_row' if single else 'multi_row'] += 1
                if single:
                    witnessed.setdefault(f"{case['phase']}/{case['row']}", []).append(case['id'])
            for phase_name, (_t, rows) in rows_spec.all_phases().items():
                if phase_name.startswith(('payload_', 'source_')) and not phase_name.endswith(fam['slug']):
                    continue
                if phase_name == 'start_body_review_started' and fam['slug'] != 'review_started':
                    continue
                if '_entailed' in phase_name:
                    continue
                if phase_name == 'eligibility' and fam['slug'] != 'assignment_started':
                    continue
                if phase_name == 'admission_config' and fam['assignment_backed']:
                    continue
                if phase_name == 'admission' and not fam['assignment_backed']:
                    continue
                if phase_name == 'joins_config' and fam['assignment_backed']:
                    continue
                if phase_name == 'joins' and not fam['assignment_backed']:
                    continue
                for r in rows:
                    if r[0] == 'PK10_source_updated_clock' and fam['source_kind'] != 'finding':
                        continue  # only finding has updated_at
                    if r[0] == 'PK10_source_body_clocks' and fam['source_kind'] not in (
                            'finding', 'review_cycle', 'quarantine', 'workflow_binding'):
                        continue  # no source-body timestamp field exists for this kind; derived from the schema
                    if f'{phase_name}/{r[0]}' not in witnessed:
                        summary['mismatches'].append(dict(family=fam['event_type'], case=f'{phase_name}/{r[0]}',
                                                          why='row without a single-row witness'))
    summary['rows_witnessed'] = {k: len(v) for k, v in coverage.items()}
    summary['status'] = 'pass' if not summary['mismatches'] and not summary['unresolved_refs'] else 'fail'
    text = json.dumps(summary, indent=1, sort_keys=True, default=str)
    if out_path:
        out_path.write_text(text + '\n')
    print(json.dumps({k: (v if k != 'mismatches' else v[:40]) for k, v in summary.items() if k != 'rows_witnessed'},
                     indent=1, default=str))
    return 0 if summary['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())

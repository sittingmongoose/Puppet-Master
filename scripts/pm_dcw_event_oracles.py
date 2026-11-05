#!/usr/bin/env python3
"""Relational static oracles for six unadmitted DCW contracts; no native proof.

Synthetic authority inputs stand for independently authenticated owner/store adapters.
They test composition, never establish that those native adapters exist or ran.
"""
import base64
import copy
import hashlib
import json
import re
import struct
from blake3 import blake3
from pathlib import Path
from functools import lru_cache
from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import ValidationError
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]
FORMAT = FormatChecker()
SCHEMAS = [ROOT / 'Plans/event_record.schema.json', ROOT / 'Plans/event_append_receipt_contracts.schema.json',
           ROOT / 'Plans/event_record_index_checkpoint.schema.json', *sorted((ROOT / 'Plans/dcw').glob('*.schema.json')),
           *sorted((ROOT / 'Plans/event_payloads/bundle_revision').glob('*.schema.json')),
           *sorted((ROOT / 'Plans/event_payloads/planning_wizard').glob('*.schema.json'))]
RESOURCES = Registry().with_resources((json.loads(p.read_text())['$id'], Resource.from_contents(json.loads(p.read_text()))) for p in SCHEMAS)


class Refusal(Exception):
    pass


def require(condition, code):
    if not condition:
        raise Refusal(code)


@lru_cache(maxsize=None)
def load(path):
    return json.loads((ROOT / path).read_text())


def check_schema(path, value, definition=None):
    schema = load(path)
    if definition:
        schema = {'$ref': schema['$id'] + '#/$defs/' + definition}
    try:
        Draft202012Validator(schema, registry=RESOURCES, format_checker=FORMAT).validate(value)
    except ValidationError as exc:
        raise Refusal('schema') from exc


def schema_references(schema, resolver=None):
    """Resolve even unused definitions; schema-shape validation is insufficient."""
    if resolver is None:
        resolver = RESOURCES.resolver(schema['$id'])
    if isinstance(schema, dict):
        resolver = resolver.in_subresource(Resource.from_contents(schema, default_specification=DRAFT202012))
        if '$ref' in schema:
            try:
                resolver.lookup(schema['$ref'])
            except Unresolvable as exc:
                raise Refusal('unresolved_schema_ref') from exc
        for value in schema.values():
            schema_references(value, resolver)
    elif isinstance(schema, list):
        for value in schema:
            schema_references(value, resolver)


def writer_policy(policy):
    # Admission is independent of the producer semantic digest and still runs
    # when a caller retries an already receipted event.
    require(policy != 'projector_replay_only', 'replay_only_not_appendable')
    require(policy == 'dedupe_by_idempotency_key', 'writer_policy')


def secret_free(value):
    if isinstance(value,str):
        require(not re.search(r'^(?:/|[A-Za-z]:[\\/]|file://|sk-[A-Za-z0-9]{8,}|Bearer\s)|://[^/]*@',value),'secret_or_path')
    elif isinstance(value,dict):
        for item in value.values():secret_free(item)
    elif isinstance(value,list):
        for item in value:secret_free(item)


def digest(value):
    return hashlib.sha256(canonical_json(value, sort_keys=True)).hexdigest()


def compact_digest(value):
    return hashlib.sha256(canonical_json(value)).hexdigest()


def canonical_msgpack(value):
    """SP-026 canonical encoding of the schema-bound nil/bool/int/string/list/map domain.

    These six closed payload/source contracts contain no floats or binary values.
    Other value types are refused; this is not a replacement general Storage codec.
    """
    def size(n, fix, threshold, small, medium, large):
        if n < threshold:
            return bytes([fix + n])
        if small is not None and n < 256:
            return bytes([small, n])
        if n < 65536:
            return bytes([medium]) + struct.pack('>H', n)
        return bytes([large]) + struct.pack('>I', n)
    if value is None:
        return b'\xc0'
    if type(value) is bool:
        return b'\xc3' if value else b'\xc2'
    if type(value) is int:
        require(0 <= value <= 2**64 - 1, 'codec_integer')
        if value < 128:
            return bytes([value])
        for limit, prefix, fmt in [(256, 0xcc, '>B'), (65536, 0xcd, '>H'), (2**32, 0xce, '>I'), (2**64, 0xcf, '>Q')]:
            if value < limit:
                return bytes([prefix]) + struct.pack(fmt, value)
    if isinstance(value, str):
        data = value.encode('utf-8')
        return size(len(data), 0xa0, 32, 0xd9, 0xda, 0xdb) + data
    if isinstance(value, list):
        return size(len(value), 0x90, 16, None, 0xdc, 0xdd) + b''.join(canonical_msgpack(v) for v in value)
    if isinstance(value, dict):
        require(all(isinstance(k, str) for k in value), 'codec_key')
        return size(len(value), 0x80, 16, None, 0xde, 0xdf) + b''.join(canonical_msgpack(k) + canonical_msgpack(value[k]) for k in sorted(value, key=lambda s: s.encode('utf-8')))
    raise Refusal('codec_type')


def commitment(event):
    domain = 'pm.storage.original_event_value_commitment.v1'
    codec = 'pm.seglog_frame_v2.event_value.canonical_msgpack.v1'
    preimage = [domain, '1.0.0', codec, event['schema_id'], event['schema_version'], event]
    return dict(schema_id=domain, schema_version='1.0.0', codec=codec, domain=domain,
                event_schema_id=event['schema_id'], event_schema_version=event['schema_version'],
                sha256=hashlib.sha256(canonical_msgpack(preimage)).hexdigest())


SEMANTIC_FIELDS = ('event_type scope_kind project_id thread_id run_id node_id attempt_id actor_ref requested_account_ref '
                   'effective_account_ref occurred_at_utc producer_sequence_id correlation_id causation_event_id parent_event_id '
                   'idempotency_key payload_schema_id payload payload_ref redaction_profile migration').split()


def semantic_digest(event):
    # This closed domain has only fixed ASCII property keys and exact integers.
    return digest({k: event[k] for k in SEMANTIC_FIELDS})


def event_identity(payload):
    name = payload['event_type']
    if name.startswith('bundle.'):
        fields = ['project_id', 'thread_id', 'bundle_id', 'revision_id', 'phase_sequence']
        prefix = 'evt_bundle_revision_'
    else:
        fields = ['project_id', 'planning_run_id', 'thread_id', 'request_id']
        prefix = 'evt_' + name.replace('.', '_') + '_'
    h = compact_digest([name] + [payload[k] for k in fields])
    return prefix + h, name + ':' + h


def event_reference(row, event):
    """A compact JSON descriptor fits the existing nullable-string envelope slot."""
    try:
        ref = json.loads(event['payload_ref'])
    except (TypeError, ValueError) as exc:
        raise Refusal('event_payload_reference_encoding') from exc
    check_schema(row['schema'], ref, 'payload_reference')
    require(event['payload_ref'] == canonical_json(ref, sort_keys=True).decode('utf-8'),
            'event_payload_reference_encoding')
    return ref


def event_body(row, event, authority=None):
    """Validate the actual SP-026 bytes, or resolve a verified SP-337 body.

    The supplied adapter observations are synthetic; pack/index durability and
    original custody still need independent native evidence before admission.
    """
    if event['payload_ref'] is None:
        check_schema(row['schema'], event['payload'])
        require(len(canonical_msgpack(event['payload'])) <= 16384, 'inline_limit')
        return event['payload']
    check_schema(row['schema'], event['payload'], 'referenced_stub')
    ref = event_reference(row, event)
    payload = (authority or {}).get('event_payloads', {}).get(ref['blake3'])
    require(payload is not None, 'event_payload_missing')
    require(payload['readable'] is True, 'event_payload_unavailable')
    require(payload['durable'] is True and payload['index_durable'] is True, 'event_payload_not_durable')
    try:
        raw = bytes.fromhex(payload['bytes_hex'])
    except (KeyError, TypeError, ValueError) as exc:
        raise Refusal('event_payload_encoding') from exc
    require(len(raw) == ref['byte_size'], 'event_payload_size')
    require(blake3(raw).hexdigest() == ref['blake3'], 'event_payload_digest')
    check_schema(row['schema'], payload['body'])
    require(raw == canonical_msgpack(payload['body']), 'event_payload_encoding')
    secret_free(payload['body'])
    return payload['body']


def envelope(row, event, compatibility=False, authority=None):
    check_schema('Plans/event_record.schema.json', event)
    payload = event_body(row, event, authority)
    require(event['event_type'] == payload['event_type'] == row['event_type'], 'family')
    require(event['payload_schema_id'] == payload['schema_id'], 'dispatch')
    require((event['event_id'], event['idempotency_key']) == event_identity(payload), 'identity')
    require(event['scope_kind'] == 'project' and all(event[k] == payload[k] for k in ('project_id', 'thread_id')), 'scope')
    require(all(event[k] is None for k in ('run_id', 'node_id', 'attempt_id', 'requested_account_ref', 'effective_account_ref')), 'runtime_scope')
    require(event['causation_event_id'] == event['parent_event_id'] == payload['predecessor_event_id'], 'causation')
    require(event['occurred_at_utc'] == payload['ts'], 'original_time')
    require(event['correlation_id'] == payload['revision_id' if row['event_type'].startswith('bundle.') else 'request_id'], 'correlation')
    require(exact_equal(event['producer_sequence_id'], payload.get('phase_sequence')), 'producer_sequence')
    require(event['redaction_profile'] == 'secret_refs_only', 'redaction')
    if compatibility:
        require(event['replay_policy'] == 'projector_replay_only', 'writer_policy')
    else:
        writer_policy(event['replay_policy'])
    require(all(v is None for v in event['migration'].values()), 'native_migration')
    def no_secret(value):
        if isinstance(value, str):
            require(not re.search(r'^(?:/|[A-Za-z]:[\\/]|file://|sk-[A-Za-z0-9]{8,}|Bearer\s)|://[^/]*@', value), 'secret_or_path')
        elif isinstance(value, dict):
            for v in value.values():
                no_secret(v)
        elif isinstance(value, list):
            for v in value:
                no_secret(v)
    no_secret(event)
    return payload


def original_receipt(event, slot, authority):
    require(slot['publication'] == 'receipted', 'not_receipted')
    custody = authority['custody'].get(event['event_id'])
    require(custody is not None, 'original_custody_missing')
    check_schema('Plans/event_append_receipt_contracts.schema.json', custody, 'custody_v2')
    require(custody['storage_instance_id'] == authority['storage_instance_id'], 'receipt_instance')
    require(custody['event_id'] == event['event_id'] and custody['event_type'] == event['event_type'] and
            custody['idempotency_key'] == event['idempotency_key'], 'receipt_identity')
    require(custody['scope_partition'] == 'project~' + base64.urlsafe_b64encode(event['project_id'].encode()).decode().rstrip('='), 'receipt_scope')
    require(custody['producer_semantic_digest'] == semantic_digest(event), 'idempotency_conflict')
    require(exact_equal(authority['events'].get(event['event_id']), event), 'original_full_value')
    require(exact_equal(custody['original_event_value_commitment'], commitment(event)), 'original_commitment')
    receipt = custody['first_append_receipt']
    require(exact_equal(receipt['event_id'], event['event_id']) and exact_equal(receipt['sequence_id'], event['sequence_id']), 'receipt_event_sequence')
    require(receipt['durability_state'] == 'synced' and receipt['durable_end_offset'] > receipt['byte_offset'], 'receipt_durability')
    for key in ('first_append_receipt', 'original_event_value_commitment', 'original_segment_ref'):
        require(exact_equal(slot[key], custody[key]), 'original_receipt_equality')
    group = authority['durable_groups'].get(receipt['commit_group_id'])
    require(group is not None and all(exact_equal(group[k], receipt[k]) for k in
            ('segment_generation', 'segment_name', 'durable_end_offset', 'manifest_generation')), 'receipt_group')
    require(group['group_digest'] == custody['group_digest'] and type(group['event_ids']) is list and event['event_id'] in group['event_ids'], 'receipt_group')
    require(group['durability_class'] == receipt['durability_class'] and (receipt['durability_class']!='barrier' or group['sync']=='full_flush'), 'receipt_durability')


def bundle_source(row, scenario, legacy_validate, historical=False):
    source, authority, event = scenario['source'], scenario['authority'], scenario['event']
    check_schema('Plans/dcw/revision_run.schema.json', source, 'inline')
    payload = event_body(row, event, authority)
    fields = ('project_id', 'thread_id', 'bundle_id', 'revision_id', 'annotation_ids',
              'requested_revision_capability', 'effective_revision_capability', 'permission_snapshot_id')
    require(all(source[k] == payload[k] for k in fields), 'source_identity')
    require(source['trigger'] == 'resubmit', 'source_trigger')
    intent=source['intent']
    require(all(intent[k]==source[k] for k in (*fields,'trigger')), 'intent_identity')
    require(exact_equal(intent,authority['intents'].get(intent['intent_ref'])), 'original_intent')
    require(exact_equal(authority['documents'].get(intent['source_document_ref']),{'version':intent['source_document_version'],'sha256':intent['source_document_sha256']}), 'original_document')
    require(scenario['source_key'] == ['revision_run.v1', source['bundle_id'], source['revision_id']], 'source_key')
    previous = None
    settled = set()
    for slot in source['phases']:
        e = slot['prepared_event'];name = e['event_type']
        phase_row = dict(row, event_type=name, phase=name.split('_')[-1], schema='Plans/event_payloads/bundle_revision/revision_' + name.split('_')[-1] + '.schema.json')
        p = envelope(phase_row, e, authority=authority)
        if name in ('bundle.revision_completed','bundle.revision_interrupted'):
            require(p['predecessor_event_id'] not in settled, 'exclusive_terminal')
        try:
            legacy_validate(phase_row, p, e, previous)
        except (AssertionError, ValidationError) as exc:
            raise Refusal('phase_order') from exc
        require(all(p[k] == source[k] for k in fields), 'source_phase_identity')
        require(exact_equal(slot['phase_sequence'], p['phase_sequence']) and slot['event_type'] == name and slot['predecessor_event_id'] == p['predecessor_event_id'], 'source_phase_identity')
        require(slot['source_ref'] == p['source_ref'] == 'revision_run_phase:' + compact_digest([p['bundle_id'], p['revision_id'], p['phase_sequence']]), 'source_ref')
        result = slot['result'];kind = dict(requested='accepted_request', started='start_authorized', completed='completed', interrupted='interrupted')[phase_row['phase']]
        require(result['kind'] == kind and result['intent_ref'] == slot['intent_ref'], 'result_kind')
        require(exact_equal(result, authority['results'].get(result['result_ref'])), 'original_result')
        require(slot['intent_ref']==intent['intent_ref'], 'intent_identity')
        document = authority['documents'].get(result['source_document_ref'])
        require(exact_equal(document, {'version': result['source_document_version'], 'sha256': result['source_document_sha256']}), 'original_document')
        require(result['safe_point_id'] == p['safe_point_id'] and result['occurred_at_utc'] == p['ts'], 'result_join')
        require(type(authority['outputs']) is list and type(authority['outcomes']) is list and all(ref in authority['outputs'] for ref in result['output_document_refs']) and all(ref in authority['outcomes'] for ref in result['annotation_outcome_refs']), 'result_outputs')
        if kind == 'completed':
            require(bool(result['output_document_refs']) and bool(result['annotation_outcome_refs']), 'completion_outputs')
        if kind in ('completed', 'interrupted'):
            require(p['predecessor_event_id'] not in settled, 'exclusive_terminal')
            settled.add(p['predecessor_event_id'])
        if slot is not source['phases'][-1]:
            original_receipt(e, slot, authority)
        previous = dict(p, event_id=e['event_id'])
    matching=[slot for slot in source['phases'] if exact_equal(slot['prepared_event'],event)]
    require(bool(matching), 'latest_source_event')
    slot=matching[0]
    if not historical:
        require(slot is source['phases'][-1], 'latest_source_event')
        require(source['status'] == dict(requested='pending', started='running', completed='completed', interrupted='failed')[row['phase']], 'source_status')
    require(event['actor_ref'] == authority['original_actor_ref'], 'source_actor')
    return slot


def wizard_source(row, scenario):
    source, authority, event = scenario['source'], scenario['authority'], scenario['event']
    check_schema(row['source_schema'], source, 'inline')
    # EventRecord leaves payload dispatch to its exact family schema, including
    # the frozen stored copy; equality alone does not validate its hash shape.
    event_body(row, source['prepared_event'], authority)
    p=event_body(row, event, authority);req=source['request'];child=source['child'];seed=source['seed'];result=source['result']
    require(scenario['source_key'] == [row['source_family'] + '.v1', p['project_id'], p['planning_run_id'], p['request_id']], 'source_key')
    require(source['source_ref'] == p['source_ref'] == row['source_family'] + ':' + event['idempotency_key'].split(':')[-1], 'source_ref')
    for key in ('project_id', 'planning_run_id', 'named_plan_id', 'thread_group_id', 'thread_id'):
        require(p[key] == req[key] == child[key], 'current_child_join')
    require(exact_equal(req, authority['requests'].get(req['request_ref'])), 'original_request')
    require(exact_equal(child, authority['children'].get(result['child_ref'])), 'original_child')
    require(exact_equal(result, authority['results'].get(result['result_ref'])), 'original_result')
    require(p['result_ref'] == result['result_ref'] and result['request_ref'] == req['request_ref'], 'result_join')
    require(p['permission_snapshot_id'] == req['permission_snapshot_id'] and req['request_id'] == p['request_id'], 'request_identity')
    require(event['actor_ref'] == req['actor_ref'] == authority['original_actor_ref'], 'source_actor')
    require(exact_equal(req['expected_child_revision'], result['child_revision']) and exact_equal(result['child_revision'], child['revision']) and req['expected_child_sha256'] == result['child_sha256'] == child['sha256'], 'child_currentness')
    require(exact_equal(seed, authority['seeds'].get(seed['seed_ref'])), 'original_seed')
    for dst,src in [('seed_ref','seed_ref'),('seed_kind','seed_kind'),('seed_version','version'),('seed_sha256','sha256'),('named_plan_id','named_plan_id'),('project_context_snapshot_ref','project_context_snapshot_ref'),('project_context_snapshot_hash','project_context_snapshot_hash')]:
        require(p[dst] == seed[src], 'seed_join')
    require(result['seed_ref'] == seed['seed_ref'] and result['seed_sha256'] == seed['sha256'] and
            result['project_context_snapshot_ref'] == seed['project_context_snapshot_ref'] and result['project_context_snapshot_hash'] == seed['project_context_snapshot_hash'], 'seed_result')
    require(authority['contexts'].get(seed['project_context_snapshot_ref']) == seed['project_context_snapshot_hash'], 'context_currentness')
    require(p['ts'] == result['occurred_at_utc'], 'original_time')
    if row['event_type'] == 'wizard.opened':
        require(result['status'] == 'opened' and p['predecessor_event_id'] is None, 'open_boundary')
    else:
        require(result['status'] == 'seed_loaded', 'load_boundary')
        opened = authority['events'].get(p['predecessor_event_id'])
        require(opened is not None and opened['event_type'] == 'wizard.opened', 'opened_original')
        opened_row = dict(row, event_type='wizard.opened', schema='Plans/event_payloads/planning_wizard/wizard_opened.schema.json')
        opened_payload = envelope(opened_row, opened, authority=authority)
        for key in ('project_id','planning_run_id','named_plan_id','thread_group_id','thread_id','request_id','seed_ref','seed_kind','seed_version','seed_sha256','project_context_snapshot_ref','project_context_snapshot_hash'):
            require(opened_payload[key] == p[key], 'opened_join')
        opened_source_custody(opened_row, scenario, opened, opened_payload)
    require(exact_equal(source['prepared_event'], event), 'latest_source_event')
    return source


def index_read(index, reader, authority=None):
    checkpoint=index['checkpoint'];generation=checkpoint['generations'][checkpoint['current_generation_id']];frontier=generation['frontier']
    check_schema('Plans/event_record_index_checkpoint.schema.json', checkpoint, 'checkpoint')
    check_schema('Plans/event_record_index_checkpoint.schema.json', reader['live_token'], 'read_token')
    require(generation['state'] == 'current' and frontier['source_selection'] == index['current_source']['source_selection'], 'index_currentness')
    require(frontier['coverage']['complete_to_captured_boundary'] is True, 'index_coverage')
    rows=index['datasets'][generation['index_dataset_name']]
    require(len(rows) == frontier['index_row_count'] == frontier['coverage']['retained_event_count'], 'index_coverage')
    require(reader['expected_predecessor'] == frontier['predecessor_frontier_sha256'], 'index_CAS')
    require(any(t['transaction_id'] == frontier['redb_transaction_id'] and t['generation_id'] == generation['generation_id'] and t['index_row_set_sha256'] == frontier['index_row_set_sha256'] for t in index['committed_transactions']), 'index_atomicity')
    require('redb_snapshot_id' not in reader['durable_token'], 'durable_snapshot_forbidden')
    require(exact_equal(reader['durable_token'], {k:v for k,v in reader['live_token'].items() if k != 'redb_snapshot_id'}), 'durable_token')
    require(len(reader['durable_token']) == 9 and len(reader['live_token']) == 10, 'token_shape')
    token=reader['live_token']
    require(token['generation_anchor_sha256'] == index_binding(generation['anchor']), 'index_currentness')
    require(token['generation_id'] == generation['generation_id'] and token['storage_instance_id'] == checkpoint['storage_instance_id'] and token['source_selection'] == frontier['source_selection'] and token['frontier_revision'] == frontier['publication_revision'] and token['index_dataset_name'] == generation['index_dataset_name'] and token['checkpoint_key'] == index['checkpoint_key'] == 'event_record_index_checkpoint.v1:' + checkpoint['storage_instance_id'] and token['checkpoint_ref'] == index['checkpoint_key'] + '#/generations/' + generation['generation_id'] and token['redb_snapshot_id'] == index['captured_redb_snapshot_id'], 'index_currentness')
    require(any(t['transaction_id']==frontier['redb_transaction_id'] and t['frontier_sha256']==token['frontier_sha256'] for t in index['committed_transactions']), 'index_currentness')
    index_content(index, reader, authority)

def source_storage(row, scenario):
    """Validate the physical redb row and its SP-337 original payload, if selected.

    `source` is the independently decoded logical original. Synthetic payload
    authority is an adapter input, never native durability/authentication proof.
    """
    source = scenario['source']
    stored = scenario.get('stored_source', source)
    profile = load('Plans/storage_value_registry.json')['storage_profile']['family_profiles'][row['source_family']]
    require(profile['redb_file'] == 'canonical' and profile['storage_group'] == 'runs_and_goals' and
            exact_equal(profile['max_value_bytes'], 16384), 'source_storage_profile')
    require(len(canonical_msgpack(stored)) <= profile['max_value_bytes'], 'refuse_oversized_source')
    check_schema(row['source_schema'], stored)
    if 'source_payload_ref' not in stored:
        require(exact_equal(stored, source), 'source_storage_value')
        return
    require(stored['source_key'] == scenario['source_key'] and all(exact_equal(stored[k], source[k]) for k in
            ('schema_id', 'schema_version', 'storage_instance_id', 'recovery_epoch', 'value_revision')), 'source_reference_identity')
    ref = stored['source_payload_ref']
    payload = scenario['authority'].get('payloads', {}).get(ref['blake3'])
    require(payload is not None, 'source_payload_missing')
    require(payload['readable'] is True, 'source_payload_unavailable')
    require(payload['durable'] is True and payload['index_durable'] is True, 'source_payload_not_durable')
    raw = canonical_msgpack(payload['body'])
    require(len(raw) == ref['byte_size'], 'source_payload_size')
    require(blake3(raw).hexdigest() == ref['blake3'], 'source_payload_digest')
    check_schema(row['source_schema'], payload['body'], 'inline')
    require(raw == canonical_msgpack(source), 'source_payload_substitution')


def verify(row, scenario, operation, legacy_validate):
    event=scenario['event'];authority=scenario['authority'];control=scenario['control']
    if operation == 'compatibility_append':
        envelope(row,event, authority=authority)  # Explicit replay_only_not_appendable regression.
    payload = envelope(row,event, compatibility=operation=='compatibility_read', authority=authority)
    require(type(control['admitted_families']) is list and row['event_type'] in control['admitted_families'], 'family_not_admitted')
    require(control['selected_storage_instance_id'] == authority['storage_instance_id'] == scenario['source']['storage_instance_id'], 'storage_instance')
    require(type(control['selected_recovery_epoch']) is int and exact_equal(control['selected_recovery_epoch'], authority['recovery_epoch']), 'restore_epoch')
    if control['selected_recovery_epoch'] != scenario['source']['recovery_epoch']:
        admission=authority.get('restore_admission')
        require(admission is not None and scenario['source']['recovery_epoch'] < control['selected_recovery_epoch'], 'restore_epoch')
        check_schema('Plans/event_append_receipt_contracts.schema.json',admission,'restore_admission')
        require(exact_equal(admission['recovery_epoch'],control['selected_recovery_epoch']) and admission['storage_instance_id']==authority['storage_instance_id'] and admission['restored_boundary_sha256']==control['restored_boundary_sha256'], 'restore_admission')
        source_sha=hashlib.sha256(canonical_msgpack(scenario.get('stored_source', scenario['source']))).hexdigest()
        require(authority.get('restored_sources',{}).get(compact_digest(scenario['source_key']))==source_sha, 'restore_source_inventory')
        stored = scenario.get('stored_source', scenario['source'])
        if 'source_payload_ref' in stored:
            ref = stored['source_payload_ref']
            require(exact_equal(authority.get('restored_payloads', {}).get(ref['blake3']),
                    {k: ref[k] for k in ('byte_size', 'media_type')}), 'restore_payload_inventory')
        ids={slot['prepared_event']['event_id'] for slot in scenario['source']['phases']} if row['event_type'].startswith('bundle.') else {event['event_id']}
        if row['event_type']=='wizard.deferred_payload.loaded':ids.add(payload['predecessor_event_id'])
        for event_id in ids:
            original = authority['events'].get(event_id)
            if original is not None and original['payload_ref'] is not None:
                original_row = dict(row, schema=next(r['schema'] for r in load('Plans/dcw_event_contract_fixtures.json')['families'] if r['event_type']==original['event_type']))
                ref = event_reference(original_row, original)
                require(exact_equal(authority.get('restored_event_payloads', {}).get(ref['blake3']),
                        {k: ref[k] for k in ('byte_size', 'media_type')}), 'restore_event_payload_inventory')
        require(ids <= {m['event_id'] for m in admission['members']}, 'restore_members')
        for member in admission['members']:
            c=authority['custody'].get(member['event_id'])
            require(c is not None and all(member[k]==c[k] for k in ('event_id','scope_partition','event_type','idempotency_key','producer_semantic_digest')), 'restore_members')
    require(control['restored_boundary_sha256'] == authority['restored_boundary_sha256'], 'restore_boundary')
    if operation in ('append','publish','retry'):
        require(exact_equal(control['expected_value_revision'], scenario['source']['value_revision']), 'source_CAS')
        require(control['effect_state'] == 'known', 'effect_unknown')
    require(type(authority['readable_projects']) is list and payload['project_id'] in authority['readable_projects'], 'permission_or_deleted_source')
    require(type(authority['permission_snapshots']) is list and payload['permission_snapshot_id'] in authority['permission_snapshots'], 'permission_or_deleted_source')
    if operation in ('append','publish','retry'):
        require(type(authority['writable_projects']) is list and payload['project_id'] in authority['writable_projects'], 'permission_or_deleted_source')
        require(control['writer_cutoff'] is False or (control['writer_cutoff'] is True and operation != 'append' and control['pending_disposition']=='drain_original'), 'writer_cutoff')
    if operation == 'retry':
        # A caller retries semantic inputs; Storage-assigned observed/persisted
        # times and sequence are resolved from the original, never compared as
        # caller body. Full-value receipt authentication still checks that original.
        if 'retry_request' in scenario:
            if 'replay_policy' in scenario['retry_request']:
                writer_policy(scenario['retry_request']['replay_policy'])
            require(semantic_digest(scenario['retry_request']) == semantic_digest(event), 'idempotency_conflict')
        # Current retry must resolve original full value independently of semantic dedupe.
        original_receipt(event,scenario['source']['phases'][-1] if row['event_type'].startswith('bundle.') else scenario['source'],authority)
    if operation in ('read','rebuild','compatibility_read'):
        require(control['reader_withdrawn'] is False, 'reader_withdrawn')
        require(control['reader_schema_version'] == payload['schema_version'], 'unsupported_reader')
        if operation=='rebuild':
            require(control['replacement_reader_admitted'] is True and control['rebuild_complete'] is True, 'rebuild_not_current')
        index=copy.deepcopy(scenario['index'])
        for mutation in scenario.get('index_mutations',[]):
            patch(index,mutation)
        require(scenario['reader']['live_token']['storage_instance_id'] == authority['storage_instance_id'], 'checkpoint_storage_instance')
        # Validate after original custody, before disclosing the retained event.
    # Compatibility is a transient view of the original; no source or custody bytes change.
    original_event=authority['events'].get(event['event_id'])
    if operation=='compatibility_read':
        require(original_event is not None, 'original_custody_missing')
        # Only replay_policy is a transient compatibility projection. Authenticate
        # every supplied value before resolving the receipt-backed original; never
        # turn a forged view into an authentic one by silently replacing it.
        supplied_original = dict(event, replay_policy=original_event['replay_policy'])
        require(exact_equal(supplied_original, original_event), 'original_full_value')
        scenario=copy.deepcopy(scenario);scenario['event']=original_event;event=original_event
    source_storage(row, scenario)
    secret_free(scenario['source'])
    slot=bundle_source(row,scenario,legacy_validate,historical=operation in ('read','rebuild','compatibility_read')) if row['event_type'].startswith('bundle.') else wizard_source(row,scenario)
    if operation != 'append':
        original_receipt(event,slot,authority)
    if operation in ('read','rebuild','compatibility_read'):
        index_read(index,scenario['reader'],authority); index_event(index, event, authority)
    require(control['requested_effects']==[], 'reader_effect_forbidden' if operation in ('read','rebuild','compatibility_read') else 'effect_not_authorized')
    return 'accept'


def patch(value, mutation):
    if mutation.get('op') == 'copy':
        source = value
        for part in mutation['from'].strip('/').split('/'):
            source = source[int(part)] if isinstance(source, list) else source[part]
        mutation = dict(mutation, op='replace', value=copy.deepcopy(source))
    parts=mutation['path'].strip('/').split('/');target=value
    for key in parts[:-1]:
        target=target[int(key)] if isinstance(target,list) else target[key]
    key=int(parts[-1]) if isinstance(target,list) else parts[-1]
    if mutation.get('op')=='remove':
        del target[key]
    elif mutation.get('op')=='append':
        target[key].append(copy.deepcopy(mutation['value']))
    else:
        target[key]=copy.deepcopy(mutation['value'])


def source_size_fixture(row, scenario, target, referenced, payload_body_mutations=()):
    """Build exact canonical-byte boundary inputs using bounded evidence refs."""
    source = scenario['source']
    refs = source['changes'] if row['event_type'].startswith('bundle.') else source['seed']['warning_refs']
    refs.clear()
    # Leave one final ref to tune byte length without crossing a MessagePack
    # string/array header boundary unnoticed. Every ref remains <=512 chars.
    while target - len(canonical_msgpack(source)) > 520:
        refs.append('evidence:' + str(len(refs)) + ':' + 'a' * 480)
    refs.append('evidence:boundary:')
    for length in range(1, 513):
        refs[-1] = ('evidence:boundary:' + 'b' * 512)[:length]
        if len(canonical_msgpack(source)) == target:
            break
    else:
        raise AssertionError(('unreachable source boundary', row['event_type'], target))
    if row['event_type'].startswith('wizard.'):
        scenario['authority']['seeds'][source['seed']['seed_ref']] = copy.deepcopy(source['seed'])
        if row['event_type'] == 'wizard.deferred_payload.loaded':
            scenario['authority']['opened_source']['seed'] = copy.deepcopy(source['seed'])
            from pm_dcw_event_fixtures import opened_source_reference
            opened_source_reference(scenario)
    if referenced:
        body = copy.deepcopy(source)
        for mutation in payload_body_mutations:
            patch(body, mutation)
        raw = canonical_msgpack(body)
        payload_id = blake3(raw).hexdigest()
        scenario['stored_source'] = {k: source[k] for k in
            ('schema_id', 'schema_version', 'storage_instance_id', 'recovery_epoch', 'value_revision')}
        scenario['stored_source'].update(source_key=copy.deepcopy(scenario['source_key']), source_payload_ref=dict(
            blake3=payload_id, byte_size=len(raw),
            media_type='application/vnd.puppetmaster.' + row['source_family'].replace('_', '-') + '+msgpack'))
        scenario['authority'].setdefault('payloads', {})[payload_id] = dict(body=body, readable=True, durable=True, index_durable=True)
    if source['recovery_epoch'] != scenario['control']['selected_recovery_epoch']:
        stored = scenario.get('stored_source', source)
        scenario['authority']['restored_sources'][compact_digest(scenario['source_key'])] = hashlib.sha256(canonical_msgpack(stored)).hexdigest()
        if referenced:
            ref = stored['source_payload_ref']
            scenario['authority']['restored_payloads'] = {ref['blake3']: {k: ref[k] for k in ('byte_size', 'media_type')}}
        from pm_dcw_event_fixtures import refresh_restore
        refresh_restore(scenario)


def run(legacy_validate, family=None):
    from pm_dcw_event_numeric_cases import cases as numeric_cases; fixtures=load('Plans/dcw_event_contract_fixtures.json');checks=0
    require({r['event_type'] for r in fixtures['families']}=={'bundle.revision_requested','bundle.revision_started','bundle.revision_completed','bundle.revision_interrupted','wizard.opened','wizard.deferred_payload.loaded'} and len(fixtures['families'])==6 and (family is None or family in {r['event_type'] for r in fixtures['families']}),'family_inventory')
    for schema_path in SCHEMAS:
        schema = load(str(schema_path.relative_to(ROOT)))
        Draft202012Validator.check_schema(schema)
        schema_references(schema)
    registry=load('Plans/storage_value_registry.json')
    for row in (r for r in fixtures['families'] if family is None or r['event_type'] == family):
        source=next(f for f in registry['families'] if f['family_id']==row['source_family'])
        require(source['status']=='materialized' and source['value_schema_ref']==row['source_schema'] and source['value_schema']==load(row['source_schema']), 'materialized_source')
        require(source['recovery_disposition']['backup_required'] is True and source['restore_disposition']['mutation_fence_on_unresolved'] is True and source['restore_disposition']['mode']=='mandatory_backup', 'original_backup_contract')
        for case in [*row['cases'], *numeric_cases(row)]:
            scenario=copy.deepcopy(case.get('_value', row['positive']))
            if 'base_case' in case:
                base = next(c for c in row['cases'] if c['case_id'] == case['base_case'])
                for mutation in base.get('mutations', ()):
                    patch(scenario, mutation)
            if 'event_bytes' in case:
                from pm_dcw_event_fixtures import event_case_fixture
                event_case_fixture(row, scenario, case)
            if 'source_bytes' in case:
                source_size_fixture(row, scenario, case['source_bytes'], case['source_representation'] == 'payload_reference',
                                    case.get('payload_body_mutations', ()))
            for mutation in case.get('mutations',[]):
                patch(scenario,mutation)
            if case.get('refresh_index'):
                from pm_dcw_index_fixtures import issue
                issue(scenario)
            try:
                outcome=verify(row,scenario,case['operation'],legacy_validate)
            except Refusal as exc:
                outcome=str(exc)
            assert outcome==case['expected'], (row['event_type'],case['case_id'],case['expected'],outcome)
            checks+=1
            if outcome == 'accept' and case['operation'] in ('append', 'publish', 'retry'):
                if case['operation'] == 'retry':
                    retry_scenario = copy.deepcopy(scenario)
                    retry_scenario.setdefault('retry_request', copy.deepcopy(scenario['event']))
                    retry_scenario['retry_request']['replay_policy'] = 'projector_replay_only'
                    try:
                        verify(row, retry_scenario, 'retry', legacy_validate)
                    except Refusal as exc:
                        assert str(exc) == 'replay_only_not_appendable', (row['event_type'], case['case_id'], str(exc))
                    else:
                        raise AssertionError('reader-only caller retry accepted: ' + case['case_id'])
                    checks += 1
                from pm_dcw_event_fixtures import writer_policy_fixture
                writer_policy_fixture(row, scenario)
                try:
                    verify(row, scenario, case['operation'], legacy_validate)
                except Refusal as exc:
                    assert str(exc) == 'replay_only_not_appendable', (row['event_type'], case['case_id'], str(exc))
                else:
                    raise AssertionError('reader-only policy accepted on current writer: ' + case['case_id'])
                checks += 1
        for field in row['positive']['event']['payload']:
            scenario=copy.deepcopy(row['positive']);del scenario['event']['payload'][field]
            try:
                verify(row,scenario,'publish',legacy_validate)
            except Refusal as exc:
                assert str(exc)=='schema'
            else:
                raise AssertionError('missing payload field accepted: '+field)
            checks+=1
        # Every required full-envelope property is independently refused when absent.
        for field in row['positive']['event']:
            scenario=copy.deepcopy(row['positive']);del scenario['event'][field]
            try:
                verify(row,scenario,'publish',legacy_validate)
            except Refusal as exc:
                assert str(exc)=='schema'
            else:
                raise AssertionError('missing full-envelope field accepted: '+field)
            checks+=1
        print(row['event_type']+': PASS (full static envelope/source/receipt/transition/withdrawal composition)')
    assert all(x['execution_status']=='NOT_RUN' for x in fixtures['native_oracles'])
    print(json.dumps({'status':'PASS','full_contract_cases':checks,'native':'NOT_RUN','admission':'ABSENT'}))
    return checks


# JSON Schema's mathematical integer includes 1.0. These closed contracts use
# integer-only JSON: decimal/exponent floats refuse; parsed -0 normalizes to 0.
# Format validation is mandatory in both the full and local validators.
FORMAT.checks('pm-uint')(lambda value: value is None or type(value) is int)


def canonical_json(value, sort_keys=False):
    def domain(item):
        require(type(item) in (type(None), bool, int, str, list, dict), 'integer_json_domain')
        if type(item) is dict:
            for key, child in item.items():
                domain(key); domain(child)
        elif type(item) is list:
            for child in item:
                domain(child)
    domain(value)
    return json.dumps(value, ensure_ascii=False, sort_keys=sort_keys, separators=(',', ':'), allow_nan=False).encode('utf-8')


def exact_equal(left, right):
    """Authenticate exact types and bytes, including all nested original fields."""
    def same_types(a, b):
        if type(a) is not type(b):
            return False
        if type(a) is dict:
            return a.keys() == b.keys() and all(same_types(a[k], b[k]) for k in a)
        if type(a) is list:
            return len(a) == len(b) and all(same_types(a, b) for a, b in zip(a, b))
        return True
    if not same_types(left, right):
        return False
    try:
        return canonical_msgpack(left) == canonical_msgpack(right)
    except Refusal:
        return False


def opened_source_custody(row, scenario, opened, payload):
    """Resolve the separately owned predecessor through the full historical path.

    Its physical source, immutable owner observations, full event and receipt
    must authenticate independently of the loaded event. Current writer CAS,
    effects, cutoff and write permission never apply to this retained original.
    """
    authority = scenario['authority']
    source = authority.get('opened_source')
    require(type(source) is dict, 'opened_source_missing')
    check_schema('Plans/dcw/wizard_open_evidence.schema.json', source, 'inline')
    predecessor = dict(scenario, event=opened, source=source,
                       source_key=authority.get('opened_source_key', [
                           'wizard_open_evidence.v1', payload['project_id'],
                           payload['planning_run_id'], payload['request_id']]),
                       stored_source=authority.get('opened_stored_source', source),
                       control=dict(scenario['control'],
                           reader_withdrawn=authority.get('opened_reader_withdrawn'), requested_effects=[]))
    opened_row = dict(row, source_family='wizard_open_evidence',
                      source_schema='Plans/dcw/wizard_open_evidence.schema.json')
    verify(opened_row, predecessor, 'read', None)


def valid_date_time(value):
    """RFC3339 shape and calendar checks, independent of optional packages.

    Fractions have one or more decimal digits; numeric zones and t/z follow
    RFC3339. Family UTC-Z constraints remain in their schemas. Seconds are
    00..59, matching the existing Python calendar validator (no leap seconds).
    These prepared families have no admitted older timestamp recipe.
    """
    from datetime import datetime
    if not isinstance(value, str):
        return True  # JSON Schema's type keyword owns non-string values.
    match = re.fullmatch(r'([0-9]{4})-([0-9]{2})-([0-9]{2})[Tt]([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]+)?(?:[Zz]|([+-])([0-9]{2}):([0-9]{2}))', value)
    if match is None:
        return False
    try:
        datetime(*(int(match[i]) for i in range(1, 7)))
        return match[8] is None or (int(match[8]) <= 23 and int(match[9]) <= 59)
    except ValueError:
        return False


FORMAT.checks('date-time')(valid_date_time)


def index_binding(value):
    from pm_event_index_binding import binding_digest
    return binding_digest(value)


def index_partition(event):
    return ('app' if event['scope_kind'] == 'application' else
            'project~' + base64.urlsafe_b64encode(event['project_id'].encode('utf-8')).decode('ascii').rstrip('='))


def index_key(event):
    return 'event_record_index.v2:' + index_partition(event) + ':' + str(event['sequence_id']).zfill(20) + ':' + event['event_id']


def index_prefix(frames):
    return index_binding(dict(domain='pm.event_index.retained_prefix.v1', entries=[dict(
        sequence_id=f['event']['sequence_id'], event_id=f['event']['event_id'],
        scope_partition=index_partition(f['event']),
        source_value_bytes_sha256=hashlib.sha256(base64.b64decode(f['source_value_bytes_base64'], validate=True)).hexdigest()) for f in frames]))


def index_selection(source, storage_instance_id):
    manifest = source['manifest']
    return dict(storage_instance_id=storage_instance_id, current_ref='storage/seglog/CURRENT',
        current_bytes_sha256=hashlib.sha256(canonical_msgpack(source['current'])).hexdigest(),
        selected_segment_generation=source['current']['selected_segment_generation'],
        manifest_ref='storage/seglog/manifest.v1.msgpack',
        manifest_bytes_sha256=hashlib.sha256(canonical_msgpack(manifest)).hexdigest(),
        manifest_generation=manifest['manifest_generation'], recovery_epoch=manifest['recovery_epoch'],
        manifest_survivor_prefix_sha256=index_prefix(source['frames']),
        **{field + '_sha256': index_binding(manifest[field]) for field in
           ('retained_inventory', 'durable_watermarks', 'excluded_ranges', 'retired_inputs')})


def index_coverage(source):
    frames = source['frames']; last = frames[-1] if frames else None
    return dict(scope='all_application_and_project_partitions', complete_to_captured_boundary=True,
        empty_retained_source=not frames, first_retained_sequence_id=frames[0]['event']['sequence_id'] if frames else None,
        through_sequence_id=last['event']['sequence_id'] if last else None, last_frame=None if last is None else dict(
            **{k: last[k] for k in ('segment_generation', 'segment_name', 'byte_offset', 'frame_end_offset')},
            last_sequence_id=last['event']['sequence_id'], last_event_id=last['event']['event_id']),
        retained_event_count=len(frames), retained_event_prefix_sha256=index_prefix(frames),
        segments=source['segments'], sequence_gaps=source['sequence_gaps'],
        health='degraded' if any(g['reason'] == 'corruption_loss' for g in source['sequence_gaps']) else 'healthy')


def index_generation(storage_instance_id, anchor):
    return 'eig_' + index_binding(dict(domain='pm.event_index.generation.v1', storage_instance_id=storage_instance_id,
        projector_version='1.0.0', birth_source_selection=anchor['source_selection'],
        generation_seed_sha256=anchor['generation_seed_sha256']))


def index_row(frame, generation, checkpoint_key):
    event = frame['event']; birth = generation['anchor']['source_selection']
    return dict(schema_id='pm.storage_value.event_record_index.v2', schema_version='2.0.0',
        **{k: event[k] for k in ('scope_kind', 'project_id', 'sequence_id', 'event_id', 'event_type', 'idempotency_key',
                                'correlation_id', 'causation_event_id', 'persisted_at_utc', 'redaction_profile')},
        scope_partition=index_partition(event), source_locator=dict(
            **{k: frame[k] for k in ('segment_generation', 'segment_name', 'byte_offset')}, sequence_id=event['sequence_id']),
        publication_locator=dict(manifest_generation=birth['manifest_generation'], recovery_epoch=birth['recovery_epoch'],
            survivor_prefix_sha256=birth['manifest_survivor_prefix_sha256'],
            checkpoint_ref=checkpoint_key + '#/generations/' + generation['generation_id'],
            compaction_translation_manifest_ref=None),
        payload_sha256=hashlib.sha256(canonical_msgpack(event['payload'])).hexdigest(),
        producer_semantic_digest=semantic_digest(event), source_schema_id=event['schema_id'],
        source_schema_version=event['schema_version'], projector_replay_only=event['replay_policy'] == 'projector_replay_only')


def index_rows_digest(rows):
    return index_binding(dict(domain='pm.event_index.row_set.v1', entries=[dict(key=k, value=v)
        for k, v in sorted(rows.items(), key=lambda pair: (pair[1]['sequence_id'], pair[1]['event_id']))]))


def index_content(index, reader, authority=None):
    """SP-278 joins over captured source/rows, never the fixed example token.

    Captured controls, frame extents and transaction observations are synthetic
    trusted-adapter inputs. Native CRC/redb/fence proof remains NOT_RUN. This
    oracle covers direct-source rebuild/append snapshots; translation snapshots
    must use their separate owner validator, never an opaque translation ref.
    """
    cp = index['checkpoint']; gid = cp['current_generation_id']; generation = cp['generations'][gid]
    source = index['current_source']; frontier = generation['frontier']; anchor = generation['anchor']
    frames = source['frames']; rows = index['datasets'][generation['index_dataset_name']]
    canonical_msgpack(cp)  # Exact integer-only owner domain, before indexing or slicing.
    prepared = {r['event_type']: r for r in load('Plans/dcw_event_contract_fixtures.json')['families']}
    registered = {r['event_type']: r for r in load('Plans/event_family_registry.json')['families']}
    for frame in frames:
        event = frame['event']
        check_schema('Plans/event_record.schema.json', event)
        if event['event_type'] in prepared:
            envelope(prepared[event['event_type']], event, compatibility=event['replay_policy'] == 'projector_replay_only', authority=authority)
        else:
            owner = registered.get(event['event_type'])
            require(owner is not None and event['payload_schema_id'] == owner['payload_schema_id'] and
                    Draft202012Validator(owner['payload_schema'], format_checker=FORMAT).is_valid(event['payload']), 'index_source_dispatch')
    require(exact_equal(source['source_selection'], index_selection(source, cp['storage_instance_id'])) and
            source['manifest']['selected_segment_generation'] == source['current']['selected_segment_generation'] and
            source['manifest']['survivor_prefix_sha256'] == index_prefix(frames), 'index_source_binding')
    blobs = []; segments = []; frame_bytes_valid = True
    for segment in source['segments']:
        members = [f for f in frames if (f['segment_generation'], f['segment_name']) ==
                   (segment['segment_generation'], segment['segment_name'])]
        blob = b''
        for frame in members:
            raw = canonical_msgpack(frame['event'])
            frame_bytes_valid &= (base64.b64decode(frame['source_value_bytes_base64'], validate=True) == raw and
                exact_equal(frame['byte_offset'], len(blob)) and exact_equal(frame['frame_end_offset'], len(blob) + len(raw)) and
                frame['source_schema_id'] == frame['event']['schema_id'] and
                frame['source_schema_version'] == frame['event']['schema_version'])
            blob += raw
        blobs.append(blob)
        segments.append(dict(segment_generation=segment['segment_generation'], segment_name=segment['segment_name'],
            state=segment['state'], scan_start_offset=0, scanned_through_offset=len(blob), source_durable_end_offset=len(blob),
            source_durable_bytes_sha256=hashlib.sha256(blob).hexdigest(), retained_event_count=len(members),
            first_sequence_id=members[0]['event']['sequence_id'] if members else None,
            last_sequence_id=members[-1]['event']['sequence_id'] if members else None))
    sequences = [f['event']['sequence_id'] for f in frames]
    require(frame_bytes_valid and sum(s['retained_event_count'] for s in segments) == len(frames) and
            base64.b64decode(source['source_bytes_base64'], validate=True) == b''.join(blobs) and
            exact_equal(source['segments'], segments) and exact_equal(source['manifest']['retained_inventory'], segments) and
            exact_equal(source['manifest']['durable_watermarks'], [dict(segment_name=s['segment_name'],
                durable_end_offset=s['source_durable_end_offset']) for s in segments]) and
            sequences == sorted(set(sequences)) and len({f['event']['event_id'] for f in frames}) == len(frames), 'index_source_bytes')
    holes = [(a + 1, b - 1) for a, b in zip(sequences, sequences[1:]) if b != a + 1]
    gaps = source['sequence_gaps']
    require(exact_equal(gaps, source['manifest']['excluded_ranges']) and
            [(g['first_sequence_id'], g['last_sequence_id']) for g in gaps] == holes and
            all(g['reason'] in ('allocator_lease_abandoned', 'corruption_loss', 'retention_compaction') and
                exact_equal(source.get('gap_evidence', {}).get(g['manifest_evidence_ref']), g) for g in gaps), 'index_source_gaps')
    require(exact_equal(frontier['coverage'], index_coverage(source)), 'index_source_coverage')
    require(gid == generation['generation_id'] == index_generation(cp['storage_instance_id'], anchor) and
            all(k == g['generation_id'] == index_generation(cp['storage_instance_id'], g['anchor']) and
                g['index_dataset_name'] == 'event_record_index.v2@' + k for k, g in cp['generations'].items()) and
            [k for k, g in cp['generations'].items() if g['state'] == 'current'] == [gid] and
            anchor['source_selection']['storage_instance_id'] == cp['storage_instance_id'], 'index_generation_identity')
    prefix = frames[:anchor['retained_event_count']]
    birth_gaps = [g for g in gaps if prefix and prefix[0]['event']['sequence_id'] <= g['first_sequence_id'] and
                  g['last_sequence_id'] <= prefix[-1]['event']['sequence_id']]
    require(anchor['retained_event_count'] <= len(frames) and anchor['retained_event_prefix_sha256'] == index_prefix(prefix) and
            anchor['first_retained_sequence_id'] == (prefix[0]['event']['sequence_id'] if prefix else None) and
            anchor['through_sequence_id'] == (prefix[-1]['event']['sequence_id'] if prefix else None) and
            anchor['sequence_gaps_sha256'] == index_binding(birth_gaps) and
            all(exact_equal(anchor['source_selection'][k], source['source_selection'][k]) for k in
                ('current_bytes_sha256', 'selected_segment_generation', 'recovery_epoch')), 'index_anchor_prefix')
    expected_rows = {index_key(f['event']): index_row(f, generation, 'event_record_index_checkpoint.v1:' + cp['storage_instance_id']) for f in frames}
    require(rows.keys() == expected_rows.keys(), 'index_row_membership')
    require(all(exact_equal(rows[k], expected_rows[k]) for k in rows.keys() & expected_rows.keys()), 'index_row_source')
    require(frontier['index_row_set_sha256'] == index_rows_digest(rows), 'index_row_digest')
    require(reader['live_token']['frontier_sha256'] == index_binding(frontier), 'index_frontier_digest')


def index_event(index, event, authority):
    """Join the returned original and receipt to this captured complete source."""
    frames = index['current_source']['frames']
    selected = [f for f in frames if f['event']['event_id'] == event['event_id']]
    require(exact_equal(index['current_source']['source_selection']['recovery_epoch'], authority['recovery_epoch']), 'index_recovery_epoch')
    # original_receipt has already authenticated this exact event's Storage
    # original, encoded scope, semantic digest, commitment and first receipt.
    # Exact frame equality joins that verified custody to the captured source.
    require(len(selected) == 1 and exact_equal(selected[0]['event'], event), 'index_event_join')

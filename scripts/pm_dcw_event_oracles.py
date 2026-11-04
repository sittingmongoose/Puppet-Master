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
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def compact_digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


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
    require(event['payload_ref'] == json.dumps(ref, sort_keys=True, separators=(',', ':')),
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
    require(payload['readable'], 'event_payload_unavailable')
    require(payload['durable'] and payload['index_durable'], 'event_payload_not_durable')
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
    require(event['producer_sequence_id'] == payload.get('phase_sequence'), 'producer_sequence')
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
    require(authority['events'].get(event['event_id']) == event, 'original_full_value')
    require(custody['original_event_value_commitment'] == commitment(event), 'original_commitment')
    receipt = custody['first_append_receipt']
    require(receipt['event_id'] == event['event_id'] and receipt['sequence_id'] == event['sequence_id'], 'receipt_event_sequence')
    require(receipt['durability_state'] == 'synced' and receipt['durable_end_offset'] > receipt['byte_offset'], 'receipt_durability')
    for key in ('first_append_receipt', 'original_event_value_commitment', 'original_segment_ref'):
        require(slot[key] == custody[key], 'original_receipt_equality')
    group = authority['durable_groups'].get(receipt['commit_group_id'])
    require(group is not None and all(group[k] == receipt[k] for k in
            ('segment_generation', 'segment_name', 'durable_end_offset', 'manifest_generation')), 'receipt_group')
    require(group['group_digest'] == custody['group_digest'] and event['event_id'] in group['event_ids'], 'receipt_group')
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
    require(intent==authority['intents'].get(intent['intent_ref']), 'original_intent')
    require(authority['documents'].get(intent['source_document_ref'])=={'version':intent['source_document_version'],'sha256':intent['source_document_sha256']}, 'original_document')
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
        require(slot['phase_sequence'] == p['phase_sequence'] and slot['event_type'] == name and slot['predecessor_event_id'] == p['predecessor_event_id'], 'source_phase_identity')
        require(slot['source_ref'] == p['source_ref'] == 'revision_run_phase:' + compact_digest([p['bundle_id'], p['revision_id'], p['phase_sequence']]), 'source_ref')
        result = slot['result'];kind = dict(requested='accepted_request', started='start_authorized', completed='completed', interrupted='interrupted')[phase_row['phase']]
        require(result['kind'] == kind and result['intent_ref'] == slot['intent_ref'], 'result_kind')
        require(result == authority['results'].get(result['result_ref']), 'original_result')
        require(slot['intent_ref']==intent['intent_ref'], 'intent_identity')
        document = authority['documents'].get(result['source_document_ref'])
        require(document == {'version': result['source_document_version'], 'sha256': result['source_document_sha256']}, 'original_document')
        require(result['safe_point_id'] == p['safe_point_id'] and result['occurred_at_utc'] == p['ts'], 'result_join')
        require(all(ref in authority['outputs'] for ref in result['output_document_refs']) and all(ref in authority['outcomes'] for ref in result['annotation_outcome_refs']), 'result_outputs')
        if kind == 'completed':
            require(bool(result['output_document_refs']) and bool(result['annotation_outcome_refs']), 'completion_outputs')
        if kind in ('completed', 'interrupted'):
            require(p['predecessor_event_id'] not in settled, 'exclusive_terminal')
            settled.add(p['predecessor_event_id'])
        if slot is not source['phases'][-1]:
            original_receipt(e, slot, authority)
        previous = dict(p, event_id=e['event_id'])
    matching=[slot for slot in source['phases'] if slot['prepared_event']==event]
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
    require(req == authority['requests'].get(req['request_ref']), 'original_request')
    require(child == authority['children'].get(result['child_ref']), 'original_child')
    require(result == authority['results'].get(result['result_ref']), 'original_result')
    require(p['result_ref'] == result['result_ref'] and result['request_ref'] == req['request_ref'], 'result_join')
    require(p['permission_snapshot_id'] == req['permission_snapshot_id'] and req['request_id'] == p['request_id'], 'request_identity')
    require(event['actor_ref'] == req['actor_ref'] == authority['original_actor_ref'], 'source_actor')
    require(req['expected_child_revision'] == result['child_revision'] == child['revision'] and req['expected_child_sha256'] == result['child_sha256'] == child['sha256'], 'child_currentness')
    require(seed == authority['seeds'].get(seed['seed_ref']), 'original_seed')
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
        original_receipt(opened, authority['opened_source'], authority)
    require(source['prepared_event'] == event, 'latest_source_event')
    return source


def index_read(index, reader):
    checkpoint=index['checkpoint'];generation=checkpoint['generations'][checkpoint['current_generation_id']];frontier=generation['frontier']
    check_schema('Plans/event_record_index_checkpoint.schema.json', checkpoint, 'checkpoint')
    check_schema('Plans/event_record_index_checkpoint.schema.json', reader['live_token'], 'read_token')
    require(generation['state'] == 'current' and frontier['source_selection'] == index['current_source']['source_selection'], 'index_currentness')
    require(frontier['coverage']['complete_to_captured_boundary'], 'index_coverage')
    rows=index['datasets'][generation['index_dataset_name']]
    require(len(rows) == frontier['index_row_count'] == frontier['coverage']['retained_event_count'], 'index_coverage')
    require(reader['expected_predecessor'] == frontier['predecessor_frontier_sha256'], 'index_CAS')
    require(any(t['transaction_id'] == frontier['redb_transaction_id'] and t['index_row_set_sha256'] == frontier['index_row_set_sha256'] for t in index['committed_transactions']), 'index_atomicity')
    require('redb_snapshot_id' not in reader['durable_token'], 'durable_snapshot_forbidden')
    require(reader['durable_token'] == {k:v for k,v in reader['live_token'].items() if k != 'redb_snapshot_id'}, 'durable_token')
    require(len(reader['durable_token']) == 9 and len(reader['live_token']) == 10, 'token_shape')
    token=reader['live_token']
    require(token==load('Plans/event_index_consumer_adoption_fixtures.json')['positive']['both_full_owner_joins']['read_token'], 'index_currentness')
    require(token['generation_id'] == generation['generation_id'] and token['storage_instance_id'] == checkpoint['storage_instance_id'] and token['source_selection'] == frontier['source_selection'] and token['frontier_revision'] == frontier['publication_revision'] and token['index_dataset_name'] == generation['index_dataset_name'] and token['checkpoint_key'] == index['checkpoint_key'], 'index_currentness')
    require(any(t['transaction_id']==frontier['redb_transaction_id'] and t['frontier_sha256']==token['frontier_sha256'] for t in index['committed_transactions']), 'index_currentness')


def source_storage(row, scenario):
    """Validate the physical redb row and its SP-337 original payload, if selected.

    `source` is the independently decoded logical original. Synthetic payload
    authority is an adapter input, never native durability/authentication proof.
    """
    source = scenario['source']
    stored = scenario.get('stored_source', source)
    profile = load('Plans/storage_value_registry.json')['storage_profile']['family_profiles'][row['source_family']]
    require(profile['redb_file'] == 'canonical' and profile['storage_group'] == 'runs_and_goals' and
            profile['max_value_bytes'] == 16384, 'source_storage_profile')
    require(len(canonical_msgpack(stored)) <= profile['max_value_bytes'], 'refuse_oversized_source')
    check_schema(row['source_schema'], stored)
    if 'source_payload_ref' not in stored:
        require(stored == source, 'source_storage_value')
        return
    require(stored['source_key'] == scenario['source_key'] and all(stored[k] == source[k] for k in
            ('schema_id', 'schema_version', 'storage_instance_id', 'recovery_epoch', 'value_revision')), 'source_reference_identity')
    ref = stored['source_payload_ref']
    payload = scenario['authority'].get('payloads', {}).get(ref['blake3'])
    require(payload is not None, 'source_payload_missing')
    require(payload['readable'], 'source_payload_unavailable')
    require(payload['durable'] and payload['index_durable'], 'source_payload_not_durable')
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
    require(row['event_type'] in control['admitted_families'], 'family_not_admitted')
    require(control['selected_storage_instance_id'] == authority['storage_instance_id'] == scenario['source']['storage_instance_id'], 'storage_instance')
    require(control['selected_recovery_epoch'] == authority['recovery_epoch'], 'restore_epoch')
    if control['selected_recovery_epoch'] != scenario['source']['recovery_epoch']:
        admission=authority.get('restore_admission')
        require(admission is not None and scenario['source']['recovery_epoch'] < control['selected_recovery_epoch'], 'restore_epoch')
        check_schema('Plans/event_append_receipt_contracts.schema.json',admission,'restore_admission')
        require(admission['recovery_epoch']==control['selected_recovery_epoch'] and admission['storage_instance_id']==authority['storage_instance_id'] and admission['restored_boundary_sha256']==control['restored_boundary_sha256'], 'restore_admission')
        source_sha=hashlib.sha256(canonical_msgpack(scenario.get('stored_source', scenario['source']))).hexdigest()
        require(authority.get('restored_sources',{}).get(compact_digest(scenario['source_key']))==source_sha, 'restore_source_inventory')
        stored = scenario.get('stored_source', scenario['source'])
        if 'source_payload_ref' in stored:
            ref = stored['source_payload_ref']
            require(authority.get('restored_payloads', {}).get(ref['blake3']) ==
                    {k: ref[k] for k in ('byte_size', 'media_type')}, 'restore_payload_inventory')
        ids={slot['prepared_event']['event_id'] for slot in scenario['source']['phases']} if row['event_type'].startswith('bundle.') else {event['event_id']}
        if row['event_type']=='wizard.deferred_payload.loaded':ids.add(payload['predecessor_event_id'])
        for event_id in ids:
            original = authority['events'].get(event_id)
            if original is not None and original['payload_ref'] is not None:
                original_row = dict(row, schema=next(r['schema'] for r in load('Plans/dcw_event_contract_fixtures.json')['families'] if r['event_type']==original['event_type']))
                ref = event_reference(original_row, original)
                require(authority.get('restored_event_payloads', {}).get(ref['blake3']) ==
                        {k: ref[k] for k in ('byte_size', 'media_type')}, 'restore_event_payload_inventory')
        require(ids <= {m['event_id'] for m in admission['members']}, 'restore_members')
        for member in admission['members']:
            c=authority['custody'].get(member['event_id'])
            require(c is not None and all(member[k]==c[k] for k in ('event_id','scope_partition','event_type','idempotency_key','producer_semantic_digest')), 'restore_members')
    require(control['restored_boundary_sha256'] == authority['restored_boundary_sha256'], 'restore_boundary')
    if operation in ('append','publish','retry'):
        require(control['expected_value_revision'] == scenario['source']['value_revision'], 'source_CAS')
        require(control['effect_state'] != 'unknown', 'effect_unknown')
    require(payload['project_id'] in authority['readable_projects'], 'permission_or_deleted_source')
    require(payload['permission_snapshot_id'] in authority['permission_snapshots'], 'permission_or_deleted_source')
    if operation in ('append','publish','retry'):
        require(payload['project_id'] in authority['writable_projects'], 'permission_or_deleted_source')
        require(not control['writer_cutoff'] or (operation != 'append' and control['pending_disposition']=='drain_original'), 'writer_cutoff')
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
        require(not control['reader_withdrawn'], 'reader_withdrawn')
        require(control['reader_schema_version'] == payload['schema_version'], 'unsupported_reader')
        if operation=='rebuild':
            require(control['replacement_reader_admitted'] and control['rebuild_complete'], 'rebuild_not_current')
        index=copy.deepcopy(load('Plans/event_index_consumer_adoption_fixtures.json')['positive']['both_full_owner_joins']['generic'])
        for mutation in scenario.get('index_mutations',[]):
            patch(index,mutation)
        require(scenario['reader']['live_token']['storage_instance_id'] == authority['storage_instance_id'], 'checkpoint_storage_instance')
        index_read(index,scenario['reader'])
    # Compatibility is a transient view of the original; no source or custody bytes change.
    original_event=authority['events'].get(event['event_id'])
    if operation=='compatibility_read':
        require(original_event is not None, 'original_custody_missing')
        # Only replay_policy is a transient compatibility projection. Authenticate
        # every supplied value before resolving the receipt-backed original; never
        # turn a forged view into an authentic one by silently replacing it.
        supplied_original = dict(event, replay_policy=original_event['replay_policy'])
        require(supplied_original == original_event, 'original_full_value')
        scenario=copy.deepcopy(scenario);scenario['event']=original_event;event=original_event
    source_storage(row, scenario)
    secret_free(scenario['source'])
    slot=bundle_source(row,scenario,legacy_validate,historical=operation in ('read','rebuild','compatibility_read')) if row['event_type'].startswith('bundle.') else wizard_source(row,scenario)
    if operation != 'append':
        original_receipt(event,slot,authority)
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
        scenario['authority']['payloads'] = {payload_id: dict(body=body, readable=True, durable=True, index_durable=True)}
    if source['recovery_epoch'] != scenario['control']['selected_recovery_epoch']:
        stored = scenario.get('stored_source', source)
        scenario['authority']['restored_sources'][compact_digest(scenario['source_key'])] = hashlib.sha256(canonical_msgpack(stored)).hexdigest()
        if referenced:
            ref = stored['source_payload_ref']
            scenario['authority']['restored_payloads'] = {ref['blake3']: {k: ref[k] for k in ('byte_size', 'media_type')}}


def run(legacy_validate):
    fixtures=load('Plans/dcw_event_contract_fixtures.json');checks=0
    require({r['event_type'] for r in fixtures['families']}=={'bundle.revision_requested','bundle.revision_started','bundle.revision_completed','bundle.revision_interrupted','wizard.opened','wizard.deferred_payload.loaded'} and len(fixtures['families'])==6,'family_inventory')
    for schema_path in SCHEMAS:
        schema = load(str(schema_path.relative_to(ROOT)))
        Draft202012Validator.check_schema(schema)
        schema_references(schema)
    registry=load('Plans/storage_value_registry.json')
    for row in fixtures['families']:
        source=next(f for f in registry['families'] if f['family_id']==row['source_family'])
        require(source['status']=='materialized' and source['value_schema_ref']==row['source_schema'] and source['value_schema']==load(row['source_schema']), 'materialized_source')
        require(source['recovery_disposition']['backup_required'] and source['restore_disposition']['mutation_fence_on_unresolved'] and source['restore_disposition']['mode']=='mandatory_backup', 'original_backup_contract')
        for case in row['cases']:
            scenario=copy.deepcopy(row['positive'])
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
                scenario['event']['replay_policy'] = 'projector_replay_only'
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

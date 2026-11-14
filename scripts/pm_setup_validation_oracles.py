"""PNC-019 s6v: deterministic setup-history contracts; no admission or native proof.

The checker projects actual source values, independent copies, or a named shared
helper's result into source-backed Method B predicates. It never projects a row
verdict. Payload assertions retain one row per schema site/required member.
OriginalOwner below is an explicit fixture custody seam, not native authentication.
"""
import base64
import copy
from dataclasses import asdict
import hashlib
import importlib
import json
from pathlib import Path
import re

import blake3
from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time, format_checker
from pm_event_numbers import (
    EVENT_VALUE, FrozenRecipe, OriginalBinding, OriginalCustody, RecipeTuple,
    Refusal, RetainedDispatcher, current_integer, decode_storage_value,
    full_value_commitment, loads_current_json, producer_semantic_digest,
    qualified_jcs, storage_uint64, storage_value_bytes,
)
import pm_orchestrator_event_oracles as generic

ROOT = Path(__file__).resolve().parents[1]
PLAN_PATH = ROOT / 'Plans/setup_validation_event_families.json'
SCHEMA_PATH = ROOT / 'Plans/setup_validation_event_contracts.schema.json'
PLAN = json.loads(PLAN_PATH.read_text())
FAMILIES = {f['event_type']: f for f in PLAN['families']}
SCHEMA = json.loads(SCHEMA_PATH.read_text())
EVENT_SCHEMA = json.loads((ROOT / 'Plans/event_record.schema.json').read_text())
RECEIPT_SCHEMA = json.loads((ROOT / 'Plans/event_append_receipt_contracts.schema.json').read_text())
TEMPLATE_PATH = ROOT / 'tests/fixtures/setup_validation_history/generic_checkpoint_template.json'
FROZEN_PATH = ROOT / 'tests/fixtures/setup_validation_history/frozen_resources.json'
CONTROLS_PATH = ROOT / 'tests/fixtures/setup_validation_history/controls.json'
TABLE_PREFIX = 'pm_s6v_table_'
RECEIPT_FIELDS = (
    'event_id', 'sequence_id', 'segment_generation', 'segment_name', 'byte_offset',
    'commit_group_id', 'durability_class', 'durable_end_offset', 'durability_state',
    'manifest_generation', 'acknowledged_at_utc',
)
SOURCE_FIELDS = (
    'project_id', 'storage_instance_id', 'server_id', 'run_id', 'thread_id',
    'operation_id', 'node_id', 'occurrence', 'occurred_at_utc', 'tier_type',
    'status', 'findings',
)
LINKS = ('actor_ref', 'attempt_id', 'requested_account_ref', 'effective_account_ref')
ENVELOPE_FIELDS = ('project_id', 'run_id', 'thread_id', 'node_id', 'occurred_at_utc') + LINKS
EXTRA_ENVELOPE_FIELDS = ('producer_sequence_id', 'causation_event_id', 'parent_event_id', 'redaction_profile')
MIGRATION_FIELDS = ('migrated_from_schema_id', 'migrated_from_schema_version', 'migration_id', 'compatibility_event_type')
STORAGE_FIELDS = ('event_id', 'sequence_id', 'observed_at_utc', 'persisted_at_utc')
UINT_FIELDS = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')
CURRENT_RECIPE = 'ea-do-rfc8785-v2'
STATUS = {'config.validation.passed': 'Pass', 'config.validation.warning': 'Warning'}


def load_resources():
    return {'payload': copy.deepcopy(SCHEMA), 'event': copy.deepcopy(EVENT_SCHEMA),
            'receipt': copy.deepcopy(RECEIPT_SCHEMA)}


def registry(resources):
    return Registry().with_resources((s['$id'], Resource.from_contents(s, default_specification=DRAFT202012))
                                     for s in resources.values())


def validator(schema, resources):
    return Draft202012Validator(schema, registry=registry(resources), format_checker=format_checker(profile=EVENT_RECORD))


def eager_refs(resources):
    """Resolve every reference, including dormant optional branches, without I/O."""
    errors = []
    for name, document in resources.items():
        # Use the existing scoped resource traversal: nested $id changes the
        # reference base, and schema data/annotations are not subschemas.
        errors.extend([name, error] for error in generic.reference_errors(document, documents=resources))
    return errors


def pack(value):
    return storage_value_bytes(value, profile=EVENT_VALUE)


def digest_bytes(value):
    return hashlib.sha256(value).hexdigest()


def partition(payload):
    return 'project~' + base64.urlsafe_b64encode(payload['project_id'].encode()).decode().rstrip('=')


def identity(family, payload):
    preimage = ['ea-do-v1', partition(payload), payload['server_id'], payload['thread_id'],
                payload['run_id'], family, payload['operation_id'], payload['occurrence']]
    digest = digest_bytes(qualified_jcs(preimage))
    return 'do1:' + digest, 'evt_do_' + digest


def reason(function, *args, **kwargs):
    try:
        function(*args, **kwargs)
        return None
    except Refusal as refusal:
        return refusal.reason


def payload_schema(family, resources=None):
    return (resources or load_resources())['payload']['$defs'][FAMILIES[family]['definition']]


def schema_sites(node, schema_path=(), instance_path=()):
    """Every assertion site of the new closed payload (no removed keywords)."""
    for keyword in ('type', 'const', 'enum', 'pattern', 'format', 'minimum', 'additionalProperties'):
        if keyword in node:
            yield {'schema_path': schema_path + (keyword,), 'instance_path': instance_path,
                   'keyword': keyword, 'constraint': node[keyword]}
    for field in node.get('required', []):
        yield {'schema_path': schema_path + ('required',), 'instance_path': instance_path,
               'keyword': 'required', 'constraint': field}
    for key, child in node.get('properties', {}).items():
        yield from schema_sites(child, schema_path + ('properties', key), instance_path + (key,))
    if 'items' in node:
        yield from schema_sites(node['items'], schema_path + ('items',), instance_path + (0,))


SITES = tuple(schema_sites(payload_schema('config.validation.passed')))


def site_id(site):
    parts = [str(x) for x in site['schema_path'] if x not in ('properties',)]
    if site['keyword'] == 'required':
        parts.append(site['constraint'])
    return 'payload_' + '_'.join(parts)


def schema_errors_by_site(family, payload, resources):
    errors = list(validator(payload_schema(family, resources), resources).iter_errors(payload))
    result = {}
    for site in SITES:
        selected = []
        for error in errors:
            if tuple(error.absolute_schema_path) != site['schema_path']:
                continue
            if site['keyword'] == 'required' and site['constraint'] in error.instance:
                continue
            selected.append(error.message)
        result[site_id(site)] = selected
    return result


ROWS = []


def add(name, kind, field, words):
    ROWS.append({'id': name, 'kind': kind, 'field': field, 'words': words, 'code': name})


add('schema_reference_closure', 'empty', '/resources', 'all selected and dormant references resolve offline')
for _site in SITES:
    add(site_id(_site), 'empty', '/payload/' + '/'.join(map(str, _site['instance_path'])),
        'owner payload schema ' + '/'.join(map(str, _site['schema_path'])) + ' is kept')
add('occurrence_number', 'none', '/payload/occurrence', 'shared current_integer and qualified_jcs admit the occurrence')
add('event_schema', 'empty', '/event', 'the complete unchanged EventRecord owner schema accepts')
add('event_storage_uint64', 'empty', '/event/sequence_id', 'Storage sequence metadata is exact uint64')
add('event_storage_time', 'empty', '/event', 'observed and persisted timestamps use storage_utc_z')
for _field in SOURCE_FIELDS:
    add('source_' + _field, 'equal', '/payload/' + _field, 'equals the independently stored settled result field')
for _field in ENVELOPE_FIELDS:
    add('envelope_' + _field, 'equal', '/event/' + _field, 'equals the independent original owner fact')
for _field in ('event_type', 'payload_schema_id', 'correlation_id', 'event_id', 'idempotency_key'):
    add('envelope_' + _field, 'equal', '/event/' + _field, 'equals the exact family/partition/identity recipe')
add('scope_partition', 'equal', '/scope_partition', 'equals the reversible original Project encoding')
add('source_stage', 'equal', '/source/stage', 'the canonical verification result is settled before history')
add('source_outcome_critical', 'absent', '/source/findings/severity', 'no Critical finding can be passed or warning')
add('source_outcome_major', 'major', '/source/findings/severity', 'Major determines Warning, otherwise Pass')
add('source_store', 'equal', '/source', 'source copy equals the independent immutable operation-store bytes')
add('producer_digest', 'equal', '/producer_semantic_digest', 'shared CV-317 digest is recomputed')
add('append_policy', 'equal', '/event/replay_policy', 'replay-only history cannot be appended')
add('payload_transport', 'empty', '/event/payload', 'SP-337 whole-value bytes/hash/length/durability join')
add('receipt_schema', 'empty', '/receipt', 'the unchanged CV-339 AppendReceipt schema accepts')
add('receipt_number', 'empty', '/receipt', 'all receipt metadata integers are exact uint64')
add('storage_value', 'equal', '/storage_record/value_hex', 'complete EventRecord bytes equal independently stored bytes')
for _field in STORAGE_FIELDS:
    add('storage_' + _field, 'equal', '/event/' + _field, 'equals independently issued Storage metadata')
for _field in RECEIPT_FIELDS:
    add('receipt_' + _field, 'equal', '/receipt/' + _field, 'equals Storage first-receipt custody, not event metadata')
add('custody_schema', 'empty', '/custody', 'the unchanged CV-339 full-value custody v2 schema accepts')
for _field in ('storage_instance_id', 'event_id', 'scope_partition', 'event_type', 'idempotency_key',
               'producer_semantic_digest', 'first_append_receipt', 'original_event_value_commitment'):
    add('custody_' + _field, 'equal', '/custody/' + _field, 'joins the independently recomputed original')
add('retained_receipt_count', 'equal', '/sealed_store', 'exactly one sealed receipt exists for this original reference')
add('retained_dispatch', 'none', '/sealed_store', 'SP-1101 resolves one frozen original, preserving bytes on refusal')
add('generic_checkpoint', 'empty', '/read', 'the SP-278 all-scope checkpoint/token/source join accepts')
add('read_publication_epoch', 'equal', '/read/captured_publication_epoch', 'publication epoch is unchanged at disclosure')
add('read_supported_reader', 'member', '/read/reader_id', 'exact active or compatibility reader is currently published')
add('read_supported_schema', 'member', '/event/payload_schema_id', 'reader explicitly supports the original payload schema')
add('read_access', 'member', '/read/principal', 'current original Project disclosure grants include the caller')
add('read_deleted', 'absent', '/event/event_id', 'source has no current deletion tombstone')
add('read_hold', 'absent', '/event/event_id', 'a hold blocking disclosure grants no read exception')
# Append new inventory rows so unchanged proof tables retain their exact source.
add('event_producer_sequence', 'empty', '/event/producer_sequence_id', 'nullable producer sequence uses current_integer and qualified_jcs')
for _field in EXTRA_ENVELOPE_FIELDS:
    add('envelope_' + _field, 'equal', '/event/' + _field, 'equals the independently captured original producer fact')
for _field in MIGRATION_FIELDS:
    add('migration_' + _field, 'equal', '/event/migration/' + _field, 'is null: this new family has no admitted legacy migration')
add('storage_instance_binding', 'equal', '/storage_record/storage_instance_id', 'the independently issued Storage context matches the source partition')
for _field in ('group_digest', 'original_segment_ref'):
    add('custody_' + _field, 'equal', '/custody/' + _field, 'equals the independently issued Storage custody field')

TABLES = tuple(f'{i:03d}' for i in range((len(ROWS) + 7) // 8))
TABLE_ROWS = {table: ROWS[int(table) * 8:(int(table) + 1) * 8] for table in TABLES}
ROW_BY_ID = {row['id']: row for row in ROWS}
ROW_TABLE = {row['id']: table for table in TABLES for row in TABLE_ROWS[table]}


def table_module(table):
    return importlib.import_module(TABLE_PREFIX + table)


def slot(source):
    return [source[k] for k in ('storage_instance_id', 'project_id', 'run_id', 'node_id', 'operation_id', 'occurrence')]


def make_source(family):
    return {
        'project_id': 'project:setup-alpha', 'storage_instance_id': '11111111-1111-4111-8111-111111111111',
        'server_id': 'server:setup-host', 'run_id': 'run:setup-7', 'thread_id': 'thread:setup-8',
        'node_id': 'node:setup-9', 'operation_id': 'op:setup-10', 'occurrence': 1,
        'occurred_at_utc': '2026-11-14T20:25:00Z', 'tier_type': 'Task', 'status': STATUS[family],
        'findings': [{'category': 'ConfigWiring', 'severity': 'Major' if family.endswith('warning') else 'Info',
                      'message': 'Sanitized setup finding.', 'suggestion': None}],
        'actor_ref': 'actor:setup-validator', 'attempt_id': 'attempt:setup-11',
        'requested_account_ref': 'account:requested-12', 'effective_account_ref': 'account:effective-13',
        'producer_sequence_id': 17, 'causation_event_id': 'evt:setup-cause-14',
        'parent_event_id': 'evt:setup-parent-15', 'redaction_profile': 'no_secrets',
        'stage': 'result_settled',
    }


def seal_source(case):
    """Fixture writer only. Never called in retained() or an evaluating reader."""
    case['operation_store'] = [{'slot': slot(case['source']), 'value_hex': pack(case['source']).hex()}]


def refresh_event(case, *, rewrite_identity=True, source=False):
    """Fixture writer: repair DERIVED copies before constructing single-defect negatives."""
    event, payload = case['event'], case['payload']
    if rewrite_identity:
        event['idempotency_key'], event['event_id'] = identity(case['family'], payload)
    case['scope_partition'] = partition(payload)
    body = pack(payload)
    case['packs'] = {}
    if len(body) <= 16384:
        event['payload'], event['payload_ref'] = copy.deepcopy(payload), None
    else:
        ref = 'blake3:' + blake3.blake3(body).hexdigest()
        event['payload'], event['payload_ref'] = {}, ref
        case['packs'][ref] = {'bytes_hex': body.hex(), 'byte_size': len(body), 'media_type': 'application/msgpack',
                             'durable_bytes_hex': body.hex(), 'index_ref': ref}
    case['producer_semantic_digest'] = producer_semantic_digest(event)
    if source:
        seal_source(case)
    return case


def make_case(family):
    source = make_source(family)
    payload = {key: copy.deepcopy(source[key]) for key in SOURCE_FIELDS}
    payload.update(schema_id='pm.event_payload.' + FAMILIES[family]['definition'] + '.v1',
                   schema_version='1.0.0', scope='project')
    event = copy.deepcopy(json.loads(TEMPLATE_PATH.read_text())['event'])
    event.update(event_type=family, payload_schema_id=FAMILIES[family]['payload_schema_id'],
                 actor_ref=source['actor_ref'], correlation_id=source['operation_id'], sequence_id=41,
                 observed_at_utc='2026-11-14T20:25:01Z', persisted_at_utc='2026-11-14T20:25:02Z')
    for key in ENVELOPE_FIELDS + EXTRA_ENVELOPE_FIELDS:
        event[key] = source[key]
    case = {'family': family, 'payload': payload, 'event': event, 'source': source, 'boundary': 'append',
            'resources': load_resources()}
    refresh_event(case, source=True)
    issue_storage(case)
    issue_original(case)
    issue_read(case)
    return case


def fixture_case(family):
    """File-backed original and sealed receipt/store snapshot, never manufactured by a reader."""
    return json.loads(CONTROLS_PATH.read_text())['cases'][family]


def issue_storage(case):
    """Independent fixture Storage issuer, run only when creating a new original."""
    event = case['event']
    record = {key: event[key] for key in STORAGE_FIELDS}
    record.update(segment_generation=1, segment_name='seg-000001-00000000000000000041.active',
                  byte_offset=0, commit_group_id='group:setup-41', durability_class='ordinary',
                  durable_end_offset=len(pack(event)), durability_state='synced', manifest_generation=11,
                  acknowledged_at_utc='2026-11-14t15:25:03-05:00')
    record.update(storage_instance_id=case['payload']['storage_instance_id'],
                  group_digest=digest_bytes(b'fixture-storage-commit-group'),
                  original_segment_ref='segment:setup-original-1')
    record['value_hex'] = pack(event).hex()
    case['storage_record'] = record
    case['receipt'] = {key: record[key] for key in RECEIPT_FIELDS}
    case['custody'] = expected_custody(case)


def expected_custody(case):
    event, payload = case['event'], case['payload']
    return {
        'schema_id': 'pm.storage_value.event_append_receipt_custody.v2', 'schema_version': '2.0.0',
        'storage_instance_id': payload['storage_instance_id'], 'event_id': event['event_id'],
        'scope_partition': case['scope_partition'], 'event_type': case['family'],
        'idempotency_key': event['idempotency_key'], 'producer_semantic_digest': producer_semantic_digest(event),
        'group_digest': case['storage_record']['group_digest'], 'first_append_receipt': copy.deepcopy(case['receipt']),
        'redaction_profile': 'no_secrets', 'original_segment_ref': case['storage_record']['original_segment_ref'],
        'original_event_value_commitment': {
            'schema_id': 'pm.storage.original_event_value_commitment.v1', 'schema_version': '1.0.0',
            'codec': EVENT_VALUE, 'domain': 'pm.storage.original_event_value_commitment.v1',
            'event_schema_id': event['schema_id'], 'event_schema_version': event['schema_version'],
            'sha256': full_value_commitment(event),
        },
    }


def binding(case):
    event, payload = case['event'], case['payload']
    return OriginalBinding(payload['storage_instance_id'], 'project', payload['server_id'], payload['project_id'],
                           case['family'], event['event_id'], event['idempotency_key'], payload['operation_id'],
                           full_value_commitment(event))


def resource_digest(resources):
    # Resource snapshots contain large schema bounds; this is byte custody, not producer JCS.
    return digest_bytes(pack(resources))


def frozen_resources():
    """Composition-installed archived edition, independent of the reader request."""
    return json.loads(FROZEN_PATH.read_text())


def recipe(case, resources):
    return RecipeTuple('pm.event.v0', '2.0.0', case['event']['payload_schema_id'], '1.0.0',
                       'Plans/Contracts_V0.md#' + ('CV-3200' if case['family'].endswith('passed') else 'CV-3201'),
                       '1.0.0', 'fixture-original-admission', CURRENT_RECIPE, 'cv317-qualified-jcs',
                       EVENT_VALUE, 'cv339-full-value-v1', 'settled-verification-result-v1', 'sp337-msgpack-v1',
                       resource_digest(resources))


def issue_original(case):
    resources = case['resources']
    case['original_ref'] = 'seglog:' + case['event']['event_id']
    case['sealed_store'] = [{
        'ref': case['original_ref'], 'binding': asdict(binding(case)), 'recipe': asdict(recipe(case, resources)),
        'record_hex': pack(case['event']).hex(), 'result_hex': pack(case['payload']).hex(),
        'receipt_hex': pack(case['custody']).hex(), 'source_hex': pack(case['source']).hex(), 'resources': resources,
        'storage_record_hex': pack(case['storage_record']).hex(),
        'original_admission': {'event_type':case['family'], 'family_revision':'1.0.0',
            'payload_schema_id':case['event']['payload_schema_id'], 'scope_policy':'project_only',
            'registry_revision':'fixture-original-admission'},
    }]


def issue_read(case):
    """Use DO's independently specified SP-278 complete checkpoint builder, not a success flag."""
    model = json.loads(TEMPLATE_PATH.read_text())
    model.update(event_type=case['family'], definition=FAMILIES[case['family']]['definition'],
                 event=copy.deepcopy(case['event']), logical_payload=copy.deepcopy(case['payload']),
                 scope_partition=case['scope_partition'])
    generic.recapture_history(model)
    # The adopted boundary is SP-278's dataset/checkpoint/token. DO's family
    # reader/admission/recipe witnesses are outside it; our sealed_store owns
    # those facts. Do not retain unused failed-family template witnesses.
    case['generic_read'] = {key: model[key] for key in (
        'event_type', 'definition', 'event', 'logical_payload', 'scope_partition',
        'read', 'producer_semantic_digest',
    )}
    case['generic_read']['case_id'] = case['family'] + ':generic-index-fixture'
    case['read'] = {'principal': 'principal:history-viewer', 'reader_id': FAMILIES[case['family']]['reader_id'],
                    'captured_publication_epoch': 7}
    case['disclosure_snapshot'] = {'publication_epoch': 7, 'readers': [FAMILIES[case['family']]['reader_id']],
        'supported_schemas': [FAMILIES[case['family']]['payload_schema_id']],
        'project_grants': {case['payload']['project_id']: ['principal:history-viewer']},
        'tombstones': [], 'blocked_by_hold': []}


def generic_errors(model):
    """SP-278 complete dataset/checkpoint/token join; recipe selection is owned separately below."""
    view = generic.checkpoint_schema_view(model, ROOT, generic.UTC_FORMAT)
    errors = generic.run_rows(generic.guards.CHECKPOINT_SCHEMA_ROWS, view)
    if errors:
        return errors
    view.update(generic.checkpoint_identity_view(model))
    errors = generic.run_rows(generic.guards.CHECKPOINT_IDENTITY_ROWS, view)
    view.update(generic.checkpoint_current_view(model))
    current = generic.run_rows(generic.guards.CHECKPOINT_CURRENT_ROWS, view)
    if current:
        return errors + current
    view.update(generic.checkpoint_join_view(model, ROOT, generic.UTC_FORMAT))
    errors += generic.run_rows(generic.guards.CHECKPOINT_JOIN_ROWS, view)
    frame = generic.run_rows(generic.guards.CHECKPOINT_FRAME_ROWS, view)
    if frame:
        return errors + frame
    view.update(generic.checkpoint_coverage_view(model))
    return errors + generic.run_rows(generic.guards.CHECKPOINT_COVERAGE_ROWS, view)


class SnapshotOwner:
    """Read-only exact-original fixture store; reading neither seals nor installs anything."""
    def __init__(self, rows):
        self.rows = copy.deepcopy(rows)

    def authenticated_original(self, original_ref):
        matches = [row for row in self.rows if row['ref'] == original_ref]
        if len(matches) != 1:
            raise Refusal('sealed_receipt_missing' if not matches else 'sealed_receipt_ambiguous')
        row = matches[0]
        try:
            return OriginalCustody(OriginalBinding(**row['binding']), RecipeTuple(**row['recipe']),
                bytes.fromhex(row['record_hex']), bytes.fromhex(row['result_hex']), bytes.fromhex(row['receipt_hex']))
        except (TypeError, KeyError, ValueError, Refusal) as error:
            raise Refusal('sealed_receipt_malformed') from error


def frozen_verify(original, row):
    """Frozen resources and exact original bytes; no current writer or live-result gate."""
    try:
        event = decode_storage_value(original.record_bytes, profile=EVENT_VALUE)
        payload = decode_storage_value(original.result_bytes, profile=EVENT_VALUE)
        custody = decode_storage_value(original.receipt_bytes, profile=EVENT_VALUE)
        source = decode_storage_value(bytes.fromhex(row['source_hex']), profile=EVENT_VALUE)
        storage = decode_storage_value(bytes.fromhex(row['storage_record_hex']), profile=EVENT_VALUE)
        resources = row['resources']
        family = original.binding.event_type
        admission=row['original_admission']
        if admission != {'event_type':family, 'family_revision':'1.0.0',
                'payload_schema_id':original.recipe.payload_schema_id, 'scope_policy':'project_only',
                'registry_revision':original.recipe.registry_revision}:
            return False
        if original.recipe.identity_recipe != CURRENT_RECIPE or resource_digest(resources) != original.recipe.resource_manifest_sha256:
            return False
        if eager_refs(resources):
            return False
        if not validator(payload_schema(family, resources), resources).is_valid(payload):
            return False
        if not validator(resources['event'], resources).is_valid(event):
            return False
        if not validator({'$ref': resources['receipt']['$id'] + '#/$defs/custody_v2'}, resources).is_valid(custody):
            return False
        # These are this exact frozen v1 recipe's numeric/time rules, not a
        # current-writer or live-state gate on an older record.
        if reason(storage_uint64,event['sequence_id']) or producer_sequence_errors(event):
            return False
        if reason(current_integer,payload['occurrence'],minimum=1):
            return False
        if any(reason(date_time,event[k],profile=STORAGE_UTC_Z) for k in ('observed_at_utc','persisted_at_utc')):
            return False
        if any(reason(storage_uint64,custody['first_append_receipt'][k]) for k in UINT_FIELDS):
            return False
        if any(event['migration'][k] is not None for k in MIGRATION_FIELDS):
            return False
        key, event_id = identity(family, payload)
        if event_id != event['event_id'] or key != event['idempotency_key']:
            return False
        expected_binding = OriginalBinding(payload['storage_instance_id'], 'project', payload['server_id'], payload['project_id'],
            family, event_id, key, payload['operation_id'], full_value_commitment(event))
        if expected_binding != original.binding:
            return False
        if event['schema_id'] != original.recipe.envelope_schema_id or event['schema_version'] != original.recipe.envelope_schema_version:
            return False
        if event['event_type'] != family or event['scope_kind'] != 'project' or event['payload_schema_id'] != original.recipe.payload_schema_id:
            return False
        if event['payload_ref'] is None and event['payload'] != payload:
            return False
        if event['payload_ref'] is not None and (event['payload'] != {} or
                event['payload_ref'] != 'blake3:' + blake3.blake3(original.result_bytes).hexdigest()):
            return False
        if any(type(payload[k]) is not type(source[k]) or payload[k] != source[k] for k in SOURCE_FIELDS):
            return False
        if any(type(event[k]) is not type(source[k]) or event[k] != source[k] for k in ENVELOPE_FIELDS + EXTRA_ENVELOPE_FIELDS):
            return False
        severities = [f['severity'] for f in source['findings']]
        if source['stage'] != 'result_settled' or 'Critical' in severities or (('Major' in severities) != (STATUS[family] == 'Warning')):
            return False
        if source['status'] != STATUS[family]:
            return False
        if storage['value_hex'] != original.record_bytes.hex() or any(type(storage[k]) is not type(event[k]) or storage[k] != event[k] for k in STORAGE_FIELDS):
            return False
        if any(type(custody['first_append_receipt'][k]) is not type(storage[k]) or custody['first_append_receipt'][k] != storage[k] for k in RECEIPT_FIELDS):
            return False
        if storage['storage_instance_id'] != payload['storage_instance_id']:
            return False
        if any(custody[k] != storage[k] for k in ('group_digest','original_segment_ref')):
            return False
        if any(custody[k] != value for k, value in {
                'storage_instance_id':payload['storage_instance_id'], 'event_id':event_id,
                'event_type':family, 'scope_partition':partition(payload), 'idempotency_key':key}.items()):
            return False
        if custody['producer_semantic_digest'] != producer_semantic_digest(event):
            return False
        if custody['original_event_value_commitment']['sha256'] != full_value_commitment(event):
            return False
        if full_value_commitment(event) != original.binding.source_commitment:
            return False
        return True
    except (KeyError, TypeError, ValueError, Refusal):
        return False


def retained(case):
    """Only the sealed store selects the recipe; preserve the store on all refusal paths."""
    owner = SnapshotOwner(case['sealed_store'])
    # Composition supports exactly this frozen original recipe. A caller cannot install a recipe by changing its label.
    resources = frozen_resources()
    selected = recipe(case, resources)
    rows = [r for r in case['sealed_store'] if r['ref'] == case['original_ref']]
    frozen = FrozenRecipe(lambda original: frozen_verify(original, rows[0]))
    try:
        return RetainedDispatcher(owner, {selected: frozen}).resolve(case['original_ref'], binding(case), disclose=lambda _: True), None
    except Refusal as refusal:
        return None, refusal.reason


def payload_transport(case):
    event, payload = case['event'], case['payload']
    body = pack(payload)
    if event['payload_ref'] is None:
        return [] if len(body) <= 16384 and event['payload'] == payload else ['inline_payload']
    ref = event['payload_ref']
    entry = case['packs'].get(ref)
    if entry is None:
        return ['payload_pack_missing']
    try:
        expected_ref = 'blake3:' + blake3.blake3(body).hexdigest()
        if event['payload'] != {} or ref != expected_ref or entry['index_ref'] != ref:
            return ['payload_pack_reference']
        if entry['bytes_hex'] != body.hex() or storage_uint64(entry['byte_size']) != len(body):
            return ['payload_pack_bytes']
        if entry['media_type'] != 'application/msgpack' or entry['durable_bytes_hex'] != body.hex():
            return ['payload_pack_custody']
        return []
    except (KeyError, Refusal):
        return ['payload_pack_shape']


def producer_sequence_errors(event):
    value=event['producer_sequence_id']
    if value is None:
        return []
    refusal=reason(lambda: qualified_jcs([current_integer(value,minimum=0)]))
    return [refusal] if refusal else []


def views(case, boundary=None):
    boundary = boundary or case['boundary']
    family, payload, event, source = case['family'], case['payload'], case['event'], case['source']
    resources = frozen_resources() if boundary == 'retained' else case['resources']
    result = {r['id']: {'applies': False} for r in ROWS}
    def put(name, **value):
        result[name] = dict(applies=True, **value)
    put('schema_reference_closure', value=eager_refs(resources))
    errors = schema_errors_by_site(family, payload, resources)
    for name, value in errors.items():
        put(name, value=value)
    payload_ok = not any(errors.values())
    number_reason = reason(lambda: qualified_jcs([current_integer(payload['occurrence'], minimum=1)])) if payload_ok else None
    if payload_ok:
        put('occurrence_number', value=number_reason)
    if not payload_ok or number_reason is not None:
        return result
    event_errors = [e.message for e in validator(EVENT_SCHEMA, resources).iter_errors(event)]
    put('event_schema', value=event_errors)
    if event_errors:
        return result
    uint_errors = [r for r in [reason(storage_uint64, event['sequence_id'])] if r]
    put('event_storage_uint64', value=uint_errors)
    producer_numbers=producer_sequence_errors(event)
    put('event_producer_sequence',value=producer_numbers)
    time_errors = [r for k in ('observed_at_utc', 'persisted_at_utc')
                   if (r := reason(date_time, event[k], profile=STORAGE_UTC_Z))]
    put('event_storage_time', value=time_errors)
    if uint_errors or producer_numbers or time_errors:
        return result
    for field in SOURCE_FIELDS:
        put('source_' + field, presented=payload[field], expected=source[field])
    for field in ENVELOPE_FIELDS:
        put('envelope_' + field, presented=event[field], expected=source[field])
    for field in EXTRA_ENVELOPE_FIELDS:
        put('envelope_' + field,presented=event[field],expected=source[field])
    for field in MIGRATION_FIELDS:
        put('migration_'+field,presented=event['migration'][field],expected=None)
    key, event_id = identity(family, payload)
    expected = {'event_type': family, 'payload_schema_id': FAMILIES[family]['payload_schema_id'],
                'correlation_id': source['operation_id'], 'event_id': event_id, 'idempotency_key': key}
    for field, value in expected.items():
        put('envelope_' + field, presented=event[field], expected=value)
    put('scope_partition', presented=case['scope_partition'], expected=partition(payload))
    put('source_stage', presented=source['stage'], expected='result_settled')
    severities = [f['severity'] for f in source['findings']]
    put('source_outcome_critical', value='Critical', collection=severities)
    put('source_outcome_major', status=STATUS[family], collection=severities)
    sources = [r for r in case['operation_store'] if r['slot'] == slot(source)]
    source_bytes = sources[0]['value_hex'] if len(sources) == 1 else None
    put('source_store', presented=pack(source).hex(), expected=source_bytes)
    put('producer_digest', presented=case['producer_semantic_digest'], expected=producer_semantic_digest(event))
    if boundary in ('append', 'retry'):
        put('append_policy', presented=event['replay_policy'], expected='dedupe_by_idempotency_key')
    put('payload_transport', value=payload_transport(case))
    receipt, record = case['receipt'], case['storage_record']
    receipt_errors = [e.message for e in validator({'$ref': RECEIPT_SCHEMA['$id'] + '#/$defs/AppendReceipt'}, resources).iter_errors(receipt)]
    put('receipt_schema', value=receipt_errors)
    if receipt_errors:
        return result
    receipt_numbers = [r for k in UINT_FIELDS if (r := reason(storage_uint64, receipt[k]))]
    put('receipt_number', value=receipt_numbers)
    if receipt_numbers:
        return result
    put('storage_value', presented=pack(event).hex(), expected=record['value_hex'])
    put('storage_instance_binding',presented=record['storage_instance_id'],expected=payload['storage_instance_id'])
    for field in STORAGE_FIELDS:
        put('storage_' + field, presented=event[field], expected=record[field])
    for field in RECEIPT_FIELDS:
        put('receipt_' + field, presented=receipt[field], expected=record[field])
    custody_errors = [e.message for e in validator({'$ref': RECEIPT_SCHEMA['$id'] + '#/$defs/custody_v2'}, resources).iter_errors(case['custody'])]
    put('custody_schema', value=custody_errors)
    if custody_errors:
        return result
    expected = expected_custody(case)
    for field in ('storage_instance_id', 'event_id', 'scope_partition', 'event_type', 'idempotency_key',
                  'producer_semantic_digest', 'first_append_receipt', 'original_event_value_commitment'):
        put('custody_' + field, presented=case['custody'][field], expected=expected[field])
    for field in ('group_digest','original_segment_ref'):
        put('custody_'+field,presented=case['custody'][field],expected=record[field])
    if boundary == 'retained':
        count = len([r for r in case['sealed_store'] if r['ref'] == case['original_ref']])
        put('retained_receipt_count', presented=count, expected=1)
        # A missing/ambiguous receipt is owned by its count row; no guessed dispatcher fallback.
        if count == 1:
            put('retained_dispatch', value=retained(case)[1])
        put('generic_checkpoint', value=generic_errors(case['generic_read']))
        read, fences = case['read'], case['disclosure_snapshot']
        put('read_publication_epoch', presented=read['captured_publication_epoch'], expected=fences['publication_epoch'])
        put('read_supported_reader', value=read['reader_id'], collection=fences['readers'])
        put('read_supported_schema', value=event['payload_schema_id'], collection=fences['supported_schemas'])
        put('read_access', value=read['principal'], collection=fences['project_grants'].get(payload['project_id'], []))
        put('read_deleted', value=event['event_id'], collection=fences['tombstones'])
        put('read_hold', value=event['event_id'], collection=fences['blocked_by_hold'])
    return result


def evaluate(case, boundary=None):
    projected = views(case, boundary)
    refusals = []
    for table in TABLES:
        module = table_module(table)
        for row in TABLE_ROWS[table]:
            code = getattr(module, row['id'])(projected, None)
            if code is not None:
                refusals.append((row['id'], code))
    return refusals, projected


def retry(original, candidate):
    """Return the exact full original result, independent of new Storage metadata."""
    held,refusal=retained(original)
    if refusal:
        return {'status':'original_unavailable','reason':refusal,'appended':False,'receipt':None}
    event=decode_storage_value(held.record_bytes,profile=EVENT_VALUE)
    custody=decode_storage_value(held.receipt_bytes,profile=EVENT_VALUE)
    value=candidate['event']
    resources=load_resources()
    def shape_valid():
        if eager_refs(resources) or not validator(EVENT_SCHEMA,resources).is_valid(value):
            return False
        if reason(storage_uint64,value['sequence_id']) or producer_sequence_errors(value):
            return False
        if any(reason(date_time,value[k],profile=STORAGE_UTC_Z) for k in ('observed_at_utc','persisted_at_utc')):
            return False
        logical=value['payload'] if value['payload_ref'] is None else candidate['payload']
        if not validator(payload_schema(event['event_type']),resources).is_valid(logical):
            return False
        if reason(current_integer,logical['occurrence'],minimum=1):
            return False
        return not payload_transport(dict(candidate,payload=logical))
    # Reuse DO's real retry predicates, with this family's closed schema and
    # the actual frozen-dispatch result replacing DO's family-specific shape
    # loader. No recipe or verified flag comes from the caller.
    view={'original':event,'candidate':value,
          'candidate_number_errors':generic.record_number_errors({k:v for k,v in value.items() if k in generic.SEMANTIC_FIELDS})}
    errors=generic.run_rows(generic.guards.RETRY_NUMBER_ROWS,view)
    if errors:
        return {'status':errors[0],'appended':False,'receipt':None}
    view.update(original_shape_valid=True,candidate_shape_valid=shape_valid())
    for table in (generic.guards.RETRY_SHAPE_ROWS,generic.guards.RETRY_REPLAY_ROWS,generic.guards.RETRY_IDENTITY_ROWS):
        errors=generic.run_rows(table,view)
        if errors:
            return {'status':errors[0],'appended':False,'receipt':None}
    view.update(original_semantic_digest=producer_semantic_digest(event),candidate_semantic_digest=producer_semantic_digest(value))
    errors=generic.run_rows(generic.guards.RETRY_SEMANTIC_ROWS,view)
    if errors:
        return {'status':errors[0],'appended':False,'receipt':None}
    return {'status':'original_result','appended':False,'receipt':custody['first_append_receipt'],'event':event}


def recover(case, candidate=None):
    original, refusal = retained(case)
    if refusal:
        return {'status': 'original_unavailable', 'reason': refusal, 'appended': False}
    event = decode_storage_value(original.record_bytes, profile=EVENT_VALUE)
    custody = decode_storage_value(original.receipt_bytes, profile=EVENT_VALUE)
    if candidate is not None:
        return retry(case, candidate)
    return {'status':'original_result','appended':False,'event':event,'receipt':custody['first_append_receipt']}


def write_admission(family, rows, retention):
    """Snapshot lookup, not an admitted=true flag. Actual repo remains unadmitted."""
    selected = [r for r in rows if r.get('event_type') == family and r.get('family_revision') == '1.0.0'
                and r.get('payload_schema_id') == FAMILIES[family]['payload_schema_id']]
    if len(selected) != 1:
        return 'writer_admission_missing'
    policy = retention.get(family)
    if policy is None or policy == 'PENDING_RETENTION_DECISION':
        return 'writer_retention_pending'
    return None


def holder(value, path):
    for key in path[:-1]:
        value = value[key]
    return value, path[-1] if path else None


def schema_negative(control, site):
    result = copy.deepcopy(control)
    path = site['instance_path']
    node = result['payload']
    for key in path:
        node = node[key]
    keyword, constraint = site['keyword'], site['constraint']
    if keyword == 'required':
        del node[constraint]
    elif keyword == 'additionalProperties':
        node['unknown_field'] = 'extra'
    else:
        if keyword == 'type':
            value = {'object': None, 'array': {}, 'string': 7, 'integer': 1.5}.get(str(constraint), [])
            if isinstance(constraint, list):
                value = []
        elif keyword == 'const':
            value = 'wrong-constant'
        elif keyword == 'enum':
            value = 'NotAnOwnerEnum'
        elif keyword == 'pattern':
            value = ''
        elif keyword == 'format':
            value = '2026-11-14T20:25:00'
        elif keyword == 'minimum':
            value = 0
        else:
            raise AssertionError(keyword)
        if not path:
            result['payload'] = value
        else:
            parent, key = holder(result['payload'], path)
            parent[key] = value
    # Schema-invalid payloads stop before any derived copies are inspected.
    return result


def all_cases():
    controls, negatives = [], []
    for family in FAMILIES:
        base = fixture_case(family)
        for boundary in ('append', 'retained'):
            c = copy.deepcopy(base); c['boundary'] = boundary
            controls.append((boundary + ':' + family, c))
        def add_negative(label, target, change, boundary='append', repair=None):
            c = copy.deepcopy(base); c['boundary'] = boundary
            change(c)
            if repair:
                repair(c)
            negatives.append({'id': family + ':' + label, 'family': family, 'target': target,
                              'code': target, 'case': c, 'defect': label})
        for site in SITES:
            c = schema_negative(base, site)
            negatives.append({'id': family + ':' + site_id(site), 'family': family, 'target': site_id(site),
                              'code': site_id(site), 'case': c, 'defect': 'one owner schema assertion'})
        def bad_ref(c):
            c['resources']['payload']['$defs']['unvisited_optional'] = {'$ref': '#/$defs/does_not_exist'}
        add_negative('dormant-dangling-ref', 'schema_reference_closure', bad_ref)
        def scoped_ref(c):
            c['resources']['payload']['$defs']['unvisited_optional'] = {
                '$id':'https://puppetmaster.invalid/s6v/optional', '$ref':'#/$defs/config_validation_passed'}
        add_negative('dormant-scoped-ref','schema_reference_closure',scoped_ref)
        add_negative('missing-event-member', 'event_schema', lambda c: c['event'].pop('migration'))
        add_negative('storage-float-sequence', 'event_storage_uint64', lambda c: c['event'].update(sequence_id=41.0))
        add_negative('storage-offset-time', 'event_storage_time',
                     lambda c: c['event'].update(observed_at_utc='2026-11-14T15:25:01-05:00'))
        add_negative('producer-sequence-float','event_producer_sequence',
                     lambda c:c['event'].update(producer_sequence_id=17.0))
        def current_float(c):
            c['payload']['occurrence'] = 1.0
        add_negative('integral-float', 'occurrence_number', current_float)
        for field in SOURCE_FIELDS:
            # Mutate the payload copy, retaining a valid schema and repairing only its derived event/identity facts.
            if field in ('status',):
                continue  # status is a const; its source disagreement is exercised below.
            def change(c, field=field):
                old = c['payload'][field]
                if field == 'findings':
                    c['payload'][field][0]['message'] += ' different'
                elif field == 'occurrence':
                    c['payload'][field] += 1
                elif field == 'tier_type':
                    c['payload'][field] = 'Phase'
                elif field == 'occurred_at_utc':
                    c['payload'][field] = '2026-11-14T20:25:09Z'
                else:
                    c['payload'][field] = old + ':foreign'
                # An envelope copy has an independently issued source join; leave it at the source.
                refresh_event(c)
                issue_storage(c)
            add_negative('payload-copy-' + field, 'source_' + field, change)
        def source_status(c):
            c['source']['status'] = 'Warning' if family.endswith('passed') else 'Pass'
            seal_source(c)
        add_negative('source-status', 'source_status', source_status)
        for field in ENVELOPE_FIELDS:
            def change(c, field=field):
                c['event'][field] = (c['source']['thread_id'] if field == 'node_id' else
                                     '2026-11-14T20:25:09Z' if field == 'occurred_at_utc' else 'foreign:' + field)
                refresh_event(c, rewrite_identity=False)
                issue_storage(c)
            add_negative('envelope-copy-' + field, 'envelope_' + field, change)
        for field in EXTRA_ENVELOPE_FIELDS:
            def change(c,field=field):
                value=(18 if field=='producer_sequence_id' else c['source']['parent_event_id'] if field=='causation_event_id'
                       else c['source']['causation_event_id'] if field=='parent_event_id' else 'redacted')
                c['event'][field]=value;refresh_event(c,rewrite_identity=False);issue_storage(c)
            add_negative('producer-copy-'+field,'envelope_'+field,change)
        for field in MIGRATION_FIELDS:
            def change(c,field=field):
                c['event']['migration'][field]='foreign:'+field
                refresh_event(c,rewrite_identity=False);issue_storage(c)
            add_negative('unsupported-migration-'+field,'migration_'+field,change)
        for field in ('scope_kind', 'event_type', 'payload_schema_id', 'correlation_id', 'event_id', 'idempotency_key'):
            if field == 'scope_kind':
                continue  # EventRecord's project branch entails this row; documented below.
            def change(c, field=field):
                c['event'][field] = ('config.validation.other' if field == 'event_type' else
                                     'pm.event_payload.other.v1@1.0.0' if field == 'payload_schema_id' else 'foreign:' + field)
                refresh_event(c, rewrite_identity=False)
                issue_storage(c)
            add_negative('envelope-' + field, 'envelope_' + field, change)
        add_negative('foreign-partition', 'scope_partition', lambda c: c.update(scope_partition='project~Zm9yZWlnbg'),
                     repair=lambda c: c.update(custody=expected_custody(c)))
        def change_source(c, key, value):
            c['source'][key] = value; seal_source(c)
        add_negative('unsettled-source', 'source_stage', lambda c: change_source(c, 'stage', 'checking'))
        def critical(c):
            # The canonical owner issued this contradictory result; keep all disclosed copies synchronized.
            c['source']['findings'].append({'category':'KnownGaps','severity':'Critical','message':'critical','suggestion':None})
            c['payload']['findings'] = copy.deepcopy(c['source']['findings'])
            refresh_event(c, source=True); issue_storage(c)
        add_negative('critical-result', 'source_outcome_critical', critical)
        def major(c):
            c['source']['findings'][0]['severity'] = 'Major' if family.endswith('passed') else 'Info'
            c['payload']['findings'] = copy.deepcopy(c['source']['findings'])
            refresh_event(c, source=True); issue_storage(c)
        add_negative('outcome-precedence', 'source_outcome_major', major)
        add_negative('foreign-operation-store', 'source_store', lambda c: c.update(operation_store=[]))
        other_family=next(f for f in FAMILIES if f!=family)
        add_negative('conflicting-outcome-slot','source_store',
                     lambda c:c.update(operation_store=copy.deepcopy(fixture_case(other_family)['operation_store'])))
        add_negative('forged-digest', 'producer_digest', lambda c: c.update(producer_semantic_digest='0'*64))
        def replay_only(c):
            c['event']['replay_policy'] = 'projector_replay_only'; issue_storage(c)
        add_negative('replay-only-write', 'append_policy', replay_only)
        def transport(c):
            c['event']['payload']['findings'][0]['message'] = 'wrong inline copy'
            c['producer_semantic_digest'] = producer_semantic_digest(c['event']); issue_storage(c)
        add_negative('inline-transport-copy', 'payload_transport', transport)
        add_negative('receipt-unknown-field', 'receipt_schema', lambda c: c['receipt'].update(unknown_field=True))
        add_negative('receipt-integral-float', 'receipt_number', lambda c: c['receipt'].update(sequence_id=41.0))
        add_negative('custody-unknown-field', 'custody_schema', lambda c: c['custody'].update(unknown_field=True))
        add_negative('foreign-storage-bytes', 'storage_value', lambda c: c['storage_record'].update(value_hex='00'))
        add_negative('foreign-storage-instance','storage_instance_binding',
                     lambda c:c['storage_record'].update(storage_instance_id='22222222-2222-4222-8222-222222222222'))
        add_negative('forged-custody-group','custody_group_digest',lambda c:c['custody'].update(group_digest='f'*64))
        add_negative('foreign-custody-segment','custody_original_segment_ref',
                     lambda c:c['custody'].update(original_segment_ref='segment:foreign-original'))
        for field in STORAGE_FIELDS:
            # For event_id the recomputed identity row also owns the mismatch; mutate Storage's own assignment.
            def change(c, field=field):
                if field == 'sequence_id':
                    c['storage_record'][field] += 1
                elif field.endswith('_at_utc'):
                    c['storage_record'][field] = '2026-11-14T20:25:09Z'
                else:
                    c['storage_record'][field] = 'storage:foreign-event'
                if field in c['receipt']:
                    c['receipt'][field] = c['storage_record'][field]
                    c['custody']['first_append_receipt'] = copy.deepcopy(c['receipt'])
            add_negative('storage-assignment-' + field, 'storage_' + field, change)
        for field in RECEIPT_FIELDS:
            def change(c, field=field):
                if type(c['receipt'][field]) is int:
                    c['receipt'][field] += 1
                elif field == 'durability_class':
                    c['receipt'][field] = 'barrier'
                elif field == 'durability_state':
                    return
                elif field == 'acknowledged_at_utc':
                    c['receipt'][field] = '2026-11-14T20:25:09Z'
                else:
                    c['receipt'][field] = 'foreign:' + field
                c['custody']['first_append_receipt'] = copy.deepcopy(c['receipt'])
            if field != 'durability_state':
                add_negative('receipt-copy-' + field, 'receipt_' + field, change)
        add_negative('unsynced-storage-receipt', 'receipt_durability_state',
                     lambda c: c['storage_record'].update(durability_state='pending'))
        for field in ('storage_instance_id', 'event_id', 'scope_partition', 'event_type', 'idempotency_key',
                      'producer_semantic_digest', 'first_append_receipt', 'original_event_value_commitment'):
            def change(c, field=field):
                if field == 'first_append_receipt':
                    c['custody'][field]['commit_group_id'] = 'foreign-custody-group'
                elif field == 'original_event_value_commitment':
                    c['custody'][field]['sha256'] = '1'*64
                elif field == 'producer_semantic_digest':
                    c['custody'][field] = '1'*64
                elif field == 'event_type':
                    c['custody'][field] = 'config.validation.other'
                elif field == 'scope_partition':
                    c['custody'][field] = 'project~Zm9yZWlnbg'
                else:
                    c['custody'][field] = 'foreign:' + field
            add_negative('custody-copy-' + field, 'custody_' + field, change)
        add_negative('missing-sealed-receipt', 'retained_receipt_count', lambda c: c.update(sealed_store=[]), 'retained')
        add_negative('ambiguous-sealed-receipt', 'retained_receipt_count',
                     lambda c: c['sealed_store'].append(copy.deepcopy(c['sealed_store'][0])), 'retained')
        def foreign_receipt(c):
            c['sealed_store'][0]['binding']['event_id'] = 'evt:foreign-original'
        add_negative('foreign-sealed-original', 'retained_dispatch', foreign_receipt, 'retained')
        def tamper(c):
            c['sealed_store'][0]['record_hex'] = pack(dict(c['event'], actor_ref='actor:forged')).hex()
        add_negative('tampered-original-bytes', 'retained_dispatch', tamper, 'retained')
        def unknown_recipe(c):
            c['sealed_store'][0]['recipe']['identity_recipe'] = 'ea-do-json-v1'
        add_negative('unsupported-original-recipe', 'retained_dispatch', unknown_recipe, 'retained')
        def missing_admission(c):
            del c['sealed_store'][0]['original_admission']
        add_negative('unproven-original-admission','retained_dispatch',missing_admission,'retained')
        def foreign_admission(c):
            c['sealed_store'][0]['original_admission']['event_type']='config.validation.other'
        add_negative('foreign-original-admission','retained_dispatch',foreign_admission,'retained')
        def checkpoint(c):
            c['generic_read']['read']['read_token']['redb_snapshot_id'] = 'snapshot:foreign'
        add_negative('foreign-snapshot-token', 'generic_checkpoint', checkpoint, 'retained')
        add_negative('publication-epoch-race', 'read_publication_epoch',
                     lambda c: c['disclosure_snapshot'].update(publication_epoch=8), 'retained')
        add_negative('withdrawn-reader', 'read_supported_reader',
                     lambda c: c['disclosure_snapshot'].update(readers=[]), 'retained')
        add_negative('unsupported-reader-schema', 'read_supported_schema',
                     lambda c: c['disclosure_snapshot'].update(supported_schemas=[]), 'retained')
        add_negative('access-revoked', 'read_access',
                     lambda c: c['disclosure_snapshot'].update(project_grants={}), 'retained')
        add_negative('deleted-source', 'read_deleted',
                     lambda c: c['disclosure_snapshot']['tombstones'].append(c['event']['event_id']), 'retained')
        add_negative('held-disclosure', 'read_hold',
                     lambda c: c['disclosure_snapshot']['blocked_by_hold'].append(c['event']['event_id']), 'retained')
    return controls, negatives

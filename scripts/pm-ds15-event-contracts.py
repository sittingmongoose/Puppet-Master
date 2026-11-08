#!/usr/bin/env python3
"""Execute DS15 static contract oracles. No production effects or native proof."""
import copy
import hashlib
import json, yaml
import re
import sys
from decimal import Decimal
from pathlib import Path
import jsonschema
import importlib.util
from functools import lru_cache
from jsonschema.validators import extend
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
from pm_event_numbers import (EVENT_VALUE, Refusal, current_integer, exact_boolean,  # noqa: E402
                              full_value_commitment, loads_current_json, producer_semantic_bytes,
                              producer_semantic_digest,
                              storage_uint64, storage_value_bytes)
FORMAT = jsonschema.FormatChecker()

# Sweep part 2B numbers (CV-1100, SP-1100). Current inputs are admitted at every
# schema integer slot by the shared current_integer, with the slot's own schema
# bounds; Storage-assigned sequence/generation/offset metadata uses storage_uint64.
# Raw JSON is parsed by loads_current_json, physical bytes are
# storage_value_bytes(EVENT_VALUE) and the CV-339 commitment is
# full_value_commitment. There is no blanket integer walk over a current input.
CURRENT = 'current'
STORAGE_UINT64_FIELDS = frozenset({
    'sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation',
    'through_sequence_id', 'frontier_revision', 'selected_segment_generation', 'recovery_epoch',
    'sequence', 'first_sequence', 'last_sequence', 'scan_low', 'scan_high', 'selected_high',
    'admitted_sequence', 'withdrawal_frontier'})

# Frozen DS15 write-time recipe 'ds15-v1'. Every modelled retained original
# (original event and payload, original context, first receipt, custody and
# issued result) was written under it, so retained verification keeps its exact
# integer domain and its producer JCS digits; no current number guard runs on a
# retained original. Selecting this recipe through SP-1101's authenticated
# dispatcher is a part 2B item: SP-1101 selects the frozen CV-1101 date-time
# profile in the same authenticated tuple.
V1 = 'ds15-v1'


def v1_numeric_atom_ok(value):
    """ds15-v1: the canonical MessagePack integer domain; floats were never written."""
    return (not isinstance(value, (int, float)) or isinstance(value, bool)
            or type(value) is int and -(2 ** 63) <= value <= 2 ** 64 - 1)


def v1_numbers_ok(value):
    if isinstance(value, dict):
        return all(v1_numbers_ok(child) for child in value.values())
    if isinstance(value, (list, tuple)):
        return all(v1_numbers_ok(child) for child in value)
    return v1_numeric_atom_ok(value)


def v1_producer_digest(event):
    """ds15-v1 producer-semantic digest (exact JCS integer digits), or None."""
    if not v1_numbers_ok(event):
        return None
    try:
        return _codec.event_producer_semantic_digest(event)
    except (KeyError, TypeError, ValueError, UnicodeError):
        return None


def producer_type_sensitive_paths(event):
    """CV-1100: projection paths whose owners declare integers keep their numeric kind.

    EventRecord declares producer_sequence_id an integer; each family payload schema
    declares its own top-level integer fields.
    """
    paths = {('producer_sequence_id',)}
    schema_id = event.get('payload_schema_id') if type(event) is dict else None
    for path in PAYLOAD_SCHEMA_REFS.get(schema_id, ()):
        props = read(path).get('properties', {})
        for key, sub in props.items():
            kinds = sub.get('type')
            if 'integer' in (kinds if isinstance(kinds, list) else [kinds]):
                paths.add(('payload', key))
    return frozenset(paths)


def current_producer_qualified(event):
    """CV-1100: the current CV-317 projection has an exact qualified JCS encoding."""
    try:
        producer_semantic_bytes(event, type_sensitive_paths=producer_type_sensitive_paths(event))
    except Refusal:
        return False
    return True


def physical_size(value):
    """SP-1100 EVENT_VALUE canonical bytes length, or None when no exact encoding exists."""
    try:
        return len(storage_value_bytes(value, profile=EVENT_VALUE))
    except Refusal:
        return None


def typed(value):
    """Exact typed value for joins (SP-1100): 1, 1.0, True and Decimal('1') are distinct."""
    if type(value) is dict:
        return ('dict', tuple(sorted((k, typed(v)) for k, v in value.items())))
    if type(value) is list:
        return ('list', tuple(typed(v) for v in value))
    if type(value) is float:
        return ('float', value.hex())
    if isinstance(value, Decimal):
        return (type(value).__name__, str(value))
    return (type(value).__name__, value)


def same(left, right):
    """Typed join of two copies of one value; Python == would equate 1 and 1.0."""
    return typed(left) == typed(right)


def parse_owner_json(encoded):
    """CV-1100 raw ingress: refuses -0, 01, nonfinite, duplicate keys, lone surrogates."""
    return loads_current_json(encoded)


def v1_numeric_keyword(validator, enabled, instance, schema):
    if enabled and not v1_numbers_ok(instance):
        yield jsonschema.ValidationError('ds15-v1 requires canonical-range integers; floats were never written')


def exact_pattern(validator, pattern, instance, schema):
    if isinstance(instance, str) and re.fullmatch(pattern, instance) is None:
        yield jsonschema.ValidationError('String does not fully match identifier pattern')

StrictValidator = extend(jsonschema.Draft202012Validator, {'pattern': exact_pattern})
V1Validator = extend(StrictValidator, {'ds15IntegerDomain': v1_numeric_keyword})


def integer_slot_errors(validator, instance):
    """CV-1100 current admission at every integer slot the schema declares.

    Schema-directed, after the stock schema accepted the instance: follows
    $ref, properties, patternProperties, additionalProperties, items,
    prefixItems, allOf, the anyOf/oneOf branches the instance satisfies and
    if/then/else. Python's jsonschema accepts 1.0 as an integer; this does not.
    """
    errors = []

    def walk(v, schema, value, path):
        if not isinstance(schema, dict):
            return
        if '$ref' in schema:
            resolved = v._resolver.lookup(schema['$ref'])
            walk(v.evolve(schema=resolved.contents, _resolver=resolved.resolver), resolved.contents, value, path)
        kinds = schema.get('type')
        kinds = kinds if isinstance(kinds, list) else [kinds]
        if 'integer' in kinds and type(value) is not bool and isinstance(value, (int, float, Decimal)):
            try:
                if path and path[-1] in STORAGE_UINT64_FIELDS:
                    storage_uint64(value)
                else:
                    current_integer(value, minimum=schema.get('minimum'), maximum=schema.get('maximum'))
            except Refusal as exc:
                errors.append(jsonschema.ValidationError('CV-1100 ' + exc.reason + ' at /' + '/'.join(map(str, path)),
                                                         validator='current_integer'))
        if isinstance(value, dict):
            props = schema.get('properties', {})
            patterns = schema.get('patternProperties', {})
            for key, sub in props.items():
                if key in value:
                    walk(v, sub, value[key], path + (key,))
            for pattern, sub in patterns.items():
                for key in value:
                    if re.search(pattern, key):
                        walk(v, sub, value[key], path + (key,))
            extra = schema.get('additionalProperties')
            if isinstance(extra, dict):
                for key in value:
                    if key not in props and not any(re.search(p, key) for p in patterns):
                        walk(v, extra, value[key], path + (key,))
            for key, sub in schema.get('dependentSchemas', {}).items():
                if key in value:
                    walk(v, sub, value, path)
        if isinstance(value, list):
            prefix = schema.get('prefixItems', [])
            items = schema.get('items')
            for index, item in enumerate(value):
                if index < len(prefix):
                    walk(v, prefix[index], item, path + (index,))
                elif isinstance(items, dict):
                    walk(v, items, item, path + (index,))
        for sub in schema.get('allOf', []):
            walk(v, sub, value, path)
        for keyword in ('anyOf', 'oneOf'):
            for sub in schema.get(keyword, []):
                if v.evolve(schema=sub).is_valid(value):
                    walk(v, sub, value, path)
        if 'if' in schema:
            branch = 'then' if v.evolve(schema=schema['if']).is_valid(value) else 'else'
            if branch in schema:
                walk(v, schema[branch], value, path)

    walk(validator, validator.schema, instance, ())
    return errors
_codec_spec = importlib.util.spec_from_file_location('pm_ds15_readiness_codec', ROOT / 'scripts/pm-implementation-readiness.py')
_codec = importlib.util.module_from_spec(_codec_spec)
_codec_spec.loader.exec_module(_codec)
_debug_spec = importlib.util.spec_from_file_location('pm_ds15_debug_semantics', ROOT / 'scripts/pm-shared-runtime-contracts.py')
_debug = importlib.util.module_from_spec(_debug_spec)
_debug_spec.loader.exec_module(_debug)
_app_spec = importlib.util.spec_from_file_location('pm_ds15_app_hash', ROOT / 'scripts/pm_projects_refresh_contracts.py')
_app = importlib.util.module_from_spec(_app_spec)
_app_spec.loader.exec_module(_app)

@lru_cache(maxsize=None)
def read(path):
    return json.loads((ROOT / path).read_text())


def _payload_schema_refs():
    refs = {}
    for manifest in ('Plans/ds15_event_contracts.json', 'Plans/ds15_deck2_contracts.json'):
        if (ROOT / manifest).exists():
            for row in read(manifest):
                refs.setdefault(read(row['payload_schema_ref'])['$id'], []).append(row['payload_schema_ref'])
    return refs


PAYLOAD_SCHEMA_REFS = _payload_schema_refs()

class exact_integer_text:
    """CV-1100 sets no global integer cap: render long integers exactly while validating.

    Scoped and restored; jsonschema renders an instance in its error messages, and the
    memo key spells the instance, so a valid 4400-digit integer must not raise there.
    """
    def __enter__(self):
        self.limit = sys.get_int_max_str_digits()
        sys.set_int_max_str_digits(0)

    def __exit__(self, *exc):
        sys.set_int_max_str_digits(self.limit)
        return False


def _memo_default(value):
    # Exact typed key for carriers JSON cannot spell (ParsedDecimal from loads_current_json).
    return '\x00' + type(value).__name__ + ':' + repr(value)


class MemoizedValidation:
    """Cache exact validator errors by JSON value, never by mutable object id.

    A current validator adds CV-1100 integer-slot admission after the stock
    schema accepts; a ds15-v1 validator carries the frozen v1 integer domain.
    """
    def __init__(self, original, slots):
        self.original = original
        self.slots = slots
        self.errors = {}

    def iter_errors(self, instance):
        with exact_integer_text():
            key = json.dumps(instance, sort_keys=True, ensure_ascii=True, default=_memo_default)
            if key not in self.errors:
                errors = tuple(self.original.iter_errors(instance))
                if not errors and self.slots:
                    errors = tuple(integer_slot_errors(self.original, instance))
                self.errors[key] = errors
        return iter(self.errors[key])

    def validate(self, instance):
        self.original.validate(instance)
        if self.slots:
            for error in integer_slot_errors(self.original, instance):
                raise error


def validator(schema, recipe=CURRENT):
    return cached_validator(json.dumps(schema, sort_keys=True), recipe)


def check_reference_closure(schema, registry):
    """Resolve every schema reference, including unused definitions/branches.

    Resource.subresources follows schema positions, preserves nested $id bases,
    and excludes instance data such as examples. The registry has no retriever:
    a reference outside the explicitly retained local resources fails closed.
    """
    root = Resource.from_contents(schema, default_specification=DRAFT202012)
    registry = registry.with_resource(root.id() or '', root).crawl()

    seen = set()

    def walk(resource, resolver):
        # The same schema may recur through $ref, or appear under another base.
        identity = (id(resource.contents), resolver._base_uri)
        if identity in seen:
            return
        seen.add(identity)
        if isinstance(resource.contents, dict):
            for keyword in ('$ref', '$dynamicRef'):
                if keyword in resource.contents:
                    target = resolver.lookup(resource.contents[keyword])
                    walk(Resource.from_contents(target.contents, default_specification=DRAFT202012), target.resolver)
        for child in resource.subresources():
            walk(child, resolver.in_subresource(child))

    walk(root, registry.resolver_with_root(root))

@lru_cache(maxsize=1)
def schema_registry():
    # Allowed local resources for the adopted application-source and full-value
    # receipt contracts. Validate the complete referenced subschema closures,
    # without importing unrelated sibling contracts or ambient retrieval.
    names = (
        'application_workflow_contracts', 'application_workflow_sources',
        'assistant_chat_contracts', 'assistant_memory_contracts',
        'automation_authority_contracts', 'collaborative_workflows_contracts',
        'coordination_projection_contracts', 'cross_project_access_contracts',
        'developer_session_application_contracts', 'event_append_receipt_contracts',
        'event_record', 'event_record_index_checkpoint', 'goal_body_custody',
        'multi_account_contracts', 'projects_refresh_fix_contracts',
        'section15_browser_program_contracts', 'settings_system_contracts',
        'shared_integration_runtime', 'shared_integration_runtime_expansion_contracts',
        'shared_runtime_command_contracts', 'source_control_contracts',
        'working_notebook_contracts',
    )
    registry = Registry()
    schemas = [read('Plans/' + name + '.schema.json') for name in names]
    for name, schema in zip(names, schemas):
        resource = Resource.from_contents(schema, default_specification=DRAFT202012)
        for uri in (schema['$id'], 'https://puppetmaster.local/Plans/' + name + '.schema.json'):
            registry = registry.with_resource(uri, resource)
    registry = registry.crawl()
    return registry

@lru_cache(maxsize=None)
def cached_validator(encoded, recipe=CURRENT):
    schema = json.loads(encoded)
    if recipe == V1:
        # The frozen ds15-v1 boundary profile, applied only to retained originals.
        schema.update(read('Plans/ds15_integer_domain.schema.json')['boundary_keywords'])
    elif recipe != CURRENT:
        raise AssertionError('unknown DS15 number recipe: ' + str(recipe))
    jsonschema.Draft202012Validator.check_schema(schema)
    registry = schema_registry()
    check_reference_closure(schema, registry)
    kind = V1Validator if recipe == V1 else StrictValidator
    return MemoizedValidation(kind(schema, registry=registry, format_checker=FORMAT), slots=recipe == CURRENT)

@lru_cache(maxsize=1)
def application_source_validator():
    schema = read('Plans/application_workflow_sources.schema.json')
    return validator({'$ref': schema['$id'] + '#/$defs/OriginalBrowserTransitionSource'})

def identity_fields_types_ok(c, payload, recipe=CURRENT):
    props = read(c['payload_schema_ref'])['properties']
    fields = [*c['identity_fields'], 'project_id' if c['scope_policy'] == 'project_only' else 'scope']
    return all(not list(validator(props[k], recipe).iter_errors(payload.get(k))) for k in fields)


def identity(c, payload, source=None, recipe=CURRENT):
    if recipe == V1 and not v1_numbers_ok((payload, source)):
        return None
    if not object_input_present(payload) or not identity_fields_types_ok(c, payload, recipe):
        return None
    if c['scope_policy'] != 'project_only':
        if not object_input_present(payload.get('scope')):
            return None
    if c['scope_policy'] != 'project_only' and payload['scope'].get('kind') == 'app':
        if not source:
            raise ValueError('Application identity requires original Server/owner-operation custody')
        return 'application@1:{}:{}'.format(source['server_id'].encode().hex(),
                                           source['original_operation_id'].encode().hex())
    scope = [payload['project_id']] if c['scope_policy'] == 'project_only' else [payload['scope']]
    parts = [c['event_type'], c['family_revision'], *scope] + [payload[k] for k in c['identity_fields']]
    # The DS15 identity recipe's canonical MessagePack array, through SP-1100's EVENT_VALUE profile
    # (byte-identical to the ds15-v1 codec on every ds15-v1 value).
    try:
        return hashlib.sha256(storage_value_bytes(parts, profile=EVENT_VALUE)).hexdigest()
    except Refusal:
        return None

def commitment(event):
    """CV-339 original_event_value_commitment of a retained original (ds15-v1)."""
    if not v1_numbers_ok(event) or not authority_types_ok(event):
        return None
    domain = 'pm.storage.original_event_value_commitment.v1'
    try:
        sha256 = full_value_commitment(event)
    except Refusal:
        return None
    return {'schema_id': domain, 'schema_version': '1.0.0', 'codec': EVENT_VALUE, 'domain': domain,
            'event_schema_id': event['schema_id'], 'event_schema_version': event['schema_version'],
            'sha256': sha256}

def shared_valid(kind, value, recipe=V1):
    """First receipt, custody and issued result: Storage's records of a retained original."""
    schema = read('Plans/event_append_receipt_contracts.schema.json')
    return not list(validator({'$defs': schema['$defs'], '$ref': '#/$defs/' + kind}, recipe).iter_errors(value))

def object_input_present(value):
    return isinstance(value, dict)


def browser_record_bytes_present(value):
    return type(value) is str


def application_source_present(value):
    return bool(value)


def original_output_present(value):
    return value is not None


def outcome_present(value):
    return value is not None


def admission_present(value):
    return value is not None


def shared_boolean(value):
    try:
        exact_boolean(value)
    except Refusal:
        return False
    return True


def shared_nonnegative_integer(value):
    """CV-1100 current_integer: exact int type, then minimum 0."""
    try:
        current_integer(value, minimum=0)
    except Refusal:
        return False
    return True


def authority_types_ok(value):
    """Exact types precede every boolean/numeric authority interpretation."""
    booleans = {'owner_command_authorized', 'config_inspected', 'committed',
                'visible_dependency_available', 'thread_writable', 'auto_send',
                'managed_outcome_committed', 'managed_resources_settled', 'dap_owner_verified',
                'rewrite_terminal_history', 'runtime_verified', 'restored_live_claim',
                'refreshable', 'refresh_committed', 'backup_closure_verified', 'permission_now',
                'source_deleted_now', 'share_current', 'reader_withdrawn', 'receipt_retained',
                'retained_prefix_complete', 'verified', 'backup_verified', 'protected_auth'}
    integers = {'previous_revision', 'admitted_sequence', 'withdrawal_frontier', 'sequence',
                'sequence_id', 'producer_sequence_id', 'first_sequence', 'last_sequence',
                'scan_low', 'scan_high', 'selected_high', 'through_sequence_id', 'generation',
                'revision', 'frontier_revision', 'manifest_generation', 'recovery_epoch',
                'selected_segment_generation', 'byte_offset', 'durable_end_offset'}
    if isinstance(value, dict):
        return all((shared_boolean(v) if k in booleans else
                    (k == 'admitted_sequence' and v is None or shared_nonnegative_integer(v)) if k in integers else True)
                   and authority_types_ok(v) for k, v in value.items())
    if isinstance(value, list):
        return all(authority_types_ok(v) for v in value)
    return True


def context_types_ok(c, value, retained=False, recipe=CURRENT):
    complete = read('Plans/ds15_authority_context.schema.json')
    validator(complete)
    schema = complete['$defs'][c['event_type']]
    if retained:
        schema = dict(schema, required=['scope', 'owner_command_authorized'])
    return not list(validator(schema, recipe).iter_errors(value))


def app_hash(record):
    """CV-366 closed accepted-source preimage; physical bytes are separate."""
    return _app.semantic_hash('accepted_source', {
        'schema_id': record['schema_id'], 'schema_version': record['schema_version'],
        'scope': record['scope'], 'record': record,
        'identity': {'server_id': record['scope']['server_id'],
                     'original_operation_id': record.get('original_operation_id'),
                     'workspace_id': record.get('workspace_id')}})


def browser_source_ok(d, source):
    # The bank represents the existing owner's retained record bytes, resolved
    # by accepted_source_ref, independently of either observation of the source.
    raw = d['browser_owner_records'].get(source['accepted_source_ref'])
    if not browser_record_bytes_present(raw):
        return False
    try:
        record = parse_owner_json(raw)
    except (ValueError, UnicodeError):
        return False
    if list(validator(read('Plans/ds15_browser_owner_record.schema.json')).iter_errors(record)):
        return False
    if source['accepted_source_sha256'] != app_hash(record):
        return False
    unsigned = {k: v for k, v in source.items() if k != 'source_sha256'}
    if source['source_sha256'] != app_hash(unsigned):
        return False
    if (source['original_input_semantic_sha256'] != app_hash(source['original_input'])
            or source['original_output_semantic_sha256'] != app_hash(source['original_output'])):
        return False
    evidence = {'schema_id': 'pm.fixture.owner_evidence.v1', 'schema_version': '1.0.0',
                'owner_ref': record['interface_id'], 'source_ref': source['accepted_source_ref'],
                'source_sha256': app_hash(record), 'revision': 1, 'generation': 1}
    p = d['payload']
    if (record['scope'] != source['scope']
            or record['storage_instance_id'] != source['storage_instance_id']
            or record['original_operation_id'] != source['original_operation_id']
            or record['interface_id'] != source['interface_id']
            or record['thread_id'] != source['thread_id']
            or not same(record['capture'], p)):
        return False
    for key in ('original_input', 'original_output'):
        original = source[key]
        if {k: v for k, v in original.items() if k != 'controller_evidence'} != record[key + '_body']:
            return False
        if (original['scope'] != record['scope'] or original['profile_id'] != record['profile_id']
                or original['workspace_id'] != record['workspace_id']
                or p['browser_session_id'] not in original['session_refs']
                or original['transition_source_ref'] != source['accepted_source_ref']
                or original['controller_evidence'] != evidence):
            return False
    return all(stage['status'] == 'accepted'
               and stage['original_operation_id'] == record['original_operation_id']
               and stage['owner_method_id'] == record['interface_id']
               and stage['request_ref'] == record['request_ref']
               and stage['result_ref'] == record['result_ref']
               and stage['custody_evidence'] == evidence
               for stage in source['stage_custody'].values())


def envelope_ok(c, d, retry=True, historical=False, append=False):
    e, original = d['envelope'], d['original']['event']
    scope = d['context']['scope']
    # A historical read sees the retained original itself (ds15-v1); the original is always retained.
    recipe = V1 if historical else CURRENT
    if recipe == V1 and not v1_numbers_ok((e, d['payload'])):
        return False
    if not v1_numbers_ok(original):
        return False
    if (list(validator(read('Plans/event_record.schema.json'), recipe).iter_errors(e))
            or list(validator(read('Plans/event_record.schema.json'), V1).iter_errors(original))
            or e['event_type'] != c['event_type'] or not re.fullmatch(r'[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+', e['event_type'])
            or (not historical and e['replay_policy'] != 'dedupe_by_idempotency_key')
            or (not historical and original['replay_policy'] != 'dedupe_by_idempotency_key')
            or e['scope_kind'] != ('application' if scope['kind'] == 'app' else 'project')
            or e['project_id'] != scope['project_id'] or not same(e['payload'], d['payload'])
            or scope != d['payload'].get('scope', {'kind': 'project', 'project_id': d['payload'].get('project_id')})
            or e['run_id'] != d['payload'].get('run_id') or e['thread_id'] != d['payload'].get('thread_id')
            or e['payload_schema_id'] != read(c['payload_schema_ref'])['$id']
            or d['scope_partition'] != _codec.scope_partition(e['scope_kind'], e['project_id'])
            or physical_size(e['payload']) is None or physical_size(e['payload']) > 16384):
        return False
    # CV-1100 producer route: a new append qualifies its full CV-317 projection before effects.
    if append and not current_producer_qualified(e):
        return False
    # The retry equality domain excludes only Storage-assigned metadata. Full original
    # value custody below independently commits those original metadata fields too.
    if retry and (e['event_id'] != original['event_id']
            or v1_producer_digest(e) is None or v1_producer_digest(e) != v1_producer_digest(original)):
        return False
    source = d.get('application_source')
    if scope['kind'] == 'app' and c['event_type'].startswith('catalog.install.'):
        if (not object_input_present(source) or set(source) != {'server_id', 'original_operation_id'}
                or any(type(source[k]) is not str or not 0 < len(source[k]) <= 256 or '\n' in source[k] for k in source)
                or source != d['original']['application_source']
                or source['original_operation_id'] != d['payload']['operation_id']):
            return False
    elif scope['kind'] == 'app':
        if (not application_source_present(source) or source != d['original']['application_source']
                or list(application_source_validator().iter_errors(source))
                or source['schema_id'] != 'pm.application_source.browser_transition.v1'
                or source['interface_id'] != 'owner.browser.transition.application@1.0.0'
                or source['storage_instance_id'] != d['storage_instance_id']
                or source['thread_id'] != e['thread_id']
                or source['scope']['scope_kind'] != 'application' or source['scope']['project_id'] is not None
                or source['scope']['server_id'] != source['server_id']
                or not original_output_present(source['original_output'])
                or not browser_source_ok(d, source)
                or source['original_output']['profile_id'] != scope['profile_id']
                or d['payload']['browser_session_id'] not in source['original_output']['session_refs']
                or any(stage['original_operation_id'] != source['original_operation_id']
                       for stage in source['stage_custody'].values())
                or not all(isinstance(source.get(k), str) and 0 < len(source[k]) <= 256 and '\n' not in source[k]
                           for k in ('server_id', 'original_operation_id'))):
            return False
    return e['idempotency_key'] == identity(c, e['payload'], source, recipe)

def receipt_ok(d):
    r, custody, result, event = d['receipt'], d['custody'], d['issued_result'], d['original']['event']
    if not (shared_valid('AppendReceipt', r) and shared_valid('custody_v2', custody)
            and shared_valid('full_value_result', result)):
        return False
    return (r == custody['first_append_receipt'] == result['first_append_receipt']
            and r['event_id'] == event['event_id'] and r['sequence_id'] == event['sequence_id']
            and r['byte_offset'] < r['durable_end_offset']
            and custody['original_event_value_commitment'] == result['original_event_value_commitment'] == commitment(event)
            and custody['original_segment_ref'] == result['original_segment_ref']
            and custody['storage_instance_id'] == d['storage_instance_id']
            and custody['scope_partition'] == d['scope_partition']
            and custody['event_id'] == event['event_id'] and custody['event_type'] == event['event_type']
            and custody['idempotency_key'] == event['idempotency_key']
            and v1_producer_digest(event) is not None
            and custody['producer_semantic_digest'] == v1_producer_digest(event))

def original_evidence_ok(op, d):
    required = ['original', 'envelope', 'storage_instance_id', 'scope_partition']
    if op == 'receipt_boundary':
        required += ['receipt', 'custody', 'issued_result']
    if op in ('recover', 'publish', 'read', 'checkpoint', 'rebuild'):
        required += ['outcome', 'original_context', 'receipt', 'backup_closure_verified']
        if d.get('receipt') is not None:
            required += ['custody', 'issued_result', 'receipt_ref']
    if op in ('publish', 'read', 'checkpoint', 'rebuild') or op == 'recover' and d.get('receipt') is None:
        required += ['permission_now', 'source_deleted_now', 'share_current']
    if op in ('read', 'checkpoint', 'rebuild'):
        required += ['reader_withdrawn', 'reader_installed']
    if op == 'publish':
        required += ['receipt_retained']
    if op in ('checkpoint', 'rebuild'):
        required += ['checkpoint', 'selected_token', 'expected_previous', 'stored_previous',
                     'live_snapshot_id', 'current_live_snapshot_id', 'selected_source',
                     'index_rows', 'scan_low', 'scan_high', 'selected_high', 'selected_matches']
    if op == 'rebuild':
        required += ['retained_prefix_complete']
    if op == 'withdraw_writer':
        required += ['admitted_sequence', 'withdrawal_frontier']
    schema = dict(read('Plans/ds15_original_evidence.schema.json'), required=required)
    return not list(validator(schema).iter_errors(d))


def admission_numbers_ok(admitted, frontier):
    """SP-1100 Storage sequences: storage_uint64 on both."""
    try:
        storage_uint64(admitted)
        storage_uint64(frontier)
    except Refusal:
        return False
    return True


def index_inputs_ok(d):
    return not list(validator(read('Plans/ds15_index_inputs.schema.json')).iter_errors(
        {'source': d['selected_source'], 'rows': d['index_rows']}))


def checkpoint_value_ok(c, cp):
    if (list(validator(read(c['checkpoint_schema_ref'])).iter_errors(cp))
            or physical_size(cp) is None or physical_size(cp) > 16384):
        return False
    return True


def token_matches_storage(token, storage_instance_id):
    key = 'event_record_index_checkpoint.v1:' + storage_instance_id
    return (token['storage_instance_id'] == storage_instance_id
            and token['source_selection']['storage_instance_id'] == storage_instance_id
            and token['checkpoint_key'] == key
            and token['checkpoint_ref'] == key + '#/generations/' + token['generation_id']
            and token['index_dataset_name'] == 'event_record_index.v2@' + token['generation_id'])

def owner_text(c):
    path, uid = c['semantic_owner'].split('#')
    text = (ROOT / path).read_text()
    start = text.index('### ' + uid + ' ')
    end = text.find('\n### ', start + 1)
    unit = text[start:end if end != -1 else len(text)]
    return yaml.safe_load(unit.split('```yaml\n', 1)[1].split('\n```', 1)[0])['canonical_text']

def payload_ok(c, p, x, payload_recipe=CURRENT, context_recipe=CURRENT):
    if context_recipe == V1 and not v1_numbers_ok(x):
        return False
    if payload_recipe == V1 and not v1_numbers_ok(p):
        return False
    if not context_types_ok(c, x, recipe=context_recipe) or not authority_types_ok(x):
        return False
    if list(validator(read(c['payload_schema_ref']), payload_recipe).iter_errors(p)):
        return False
    if not x['owner_command_authorized']:
        return False
    def safe_refs(value):
        if isinstance(value, str):
            return not (_debug.ABSOLUTE_PATH_RE.search(value) or _debug.TOKEN_SHAPED_RE.search(value)
                        or _debug.FORBIDDEN_REF_RE.search(value))
        if isinstance(value, dict):
            return all(safe_refs(v) for v in value.values())
        return True
    if not safe_refs(p):
        return False
    scope = p.get('scope', {'kind': 'project', 'project_id': p.get('project_id')})
    if x['scope'] != scope or x['envelope_project_id'] != scope.get('project_id'):
        return False
    if p.get('run_id') != x['envelope_run_id']:
        return False
    if p.get('browser_session_id') and x['session_security_class'] != 'ordinary':
        return False
    n = c['event_type']
    if n in ('catalog.install.started', 'catalog.install.completed'):
        return (x['catalog_outcome_committed'] and same(x['catalog_owner_payload'], p)
                and x['catalog_phase'] == p['phase'] == n.rsplit('.', 1)[1])
    if n == 'doctor.custom_headless.checked':
        return x['config_inspected'] and x['doctor_invocation_id'] == p['doctor_invocation_id']
    if n == 'live.session.started':
        return x['launch_outcome'] == 'launched' and x['driver_session_id'] == p['session_id']
    if n == 'live.step.updated':
        return x['session_state'] == 'running' and p['step_revision'] > x['previous_revision']
    if n == 'live.artifact.created':
        return (x['artifact']['id'] == p['artifact_id'] and x['artifact']['ref'] == p['artifact_ref']
                and x['artifact']['receipt_ref'] == p['artifact_receipt_ref'] and x['artifact']['committed'])
    if n == 'live.session.completed':
        return (x['session_state'] == 'running' and x['finalization']['committed']
                and all(x['finalization'][k] == p[k] for k in ('manifest_ref', 'summary_ref', 'checks_ref')))
    if n == 'live.session.degraded':
        return (p['degradation_revision'] > x['previous_revision'] and not x['visible_dependency_available']
                and x['launch_outcome'] == ('refused' if p['requested_visual_mode'] == 'forced_visible' else 'headless'))
    if n == 'browser.context_captured':
        return (x['target_resolution'] in ('explicit', 'owning_surface', 'explicit_new_thread')
                and p['target_resolution'] == x['target_resolution']
                and x['resolved_thread_id'] == p['thread_id'] and x['thread_writable']
                and x['chip']['chip_id'] == p['chip_id'] and x['chip']['thread_id'] == p['thread_id']
                and x['chip']['attachment_type'] == p['attachment_type']
                and x['chip']['source_ref'] == p['source_ref'] and x['chip']['committed']
                and x['chip']['status'] == p['capture_status'] and x['chip']['provenance_ref'] == p['provenance_ref'] and x['thread_scope'] == scope and not x['auto_send'])
    if n.startswith('dev.session.'):
        transitions = {'dev.session.started': ({'created', 'restarting'}, 'running'),
                       'dev.session.restarting': ({'running', 'stopped'}, 'restarting'),
                       'dev.session.stopping': ({'running', 'restarting'}, 'stopping'),
                       'dev.session.stopped': ({'running', 'restarting', 'stopping'}, 'stopped')}
        before, after = transitions[n]
        return (p['previous_state'] in before and p['workflow_state'] == after
                and x['workflow_state'] == p['previous_state'] and p['workflow_revision'] == x['previous_revision'] + 1
                and x['dev_session_id'] == p['dev_session_id'] and x['managed_outcome_committed']
                and x['operation_id'] == p['operation_id']
                and (n != 'dev.session.started' or x['launch_outcome'] == 'launched')
                and (n != 'dev.session.stopped' or x['managed_resources_settled'])
                and (x['dap_state_after'] == x['dap_state_before'] or (x['dap_transition_ref'] is not None and x['dap_owner_verified']))
                and all(p.get(k) == x['links'].get(k) for k in ('run_id','thread_id','workspace_tab_id','terminal_session_id','dap_session_id'))
                and not x['rewrite_terminal_history'])
    if n.startswith('preview.session.'):
        return (x['preview_subject_id'] == p['preview_subject_id']
                and x['preview_session_id'] == p['preview_session_id']
                and x['source_revision'] == p['source_revision'] and x['runtime_verified']
                and not x['restored_live_claim']
                and (n != 'preview.session.started' or (x['session_state'] == 'created' and p['runtime_state'] == 'loading'))
                and (n != 'preview.session.stopped' or (x['session_state'] != 'closed' and p['runtime_state'] == 'closed' and x['managed_resources_settled']))
                and (n != 'preview.session.refreshed' or (x['session_state'] in ('ready', 'stale', 'degraded', 'error')
                     and x['refreshable'] and x['refresh_committed'] and p['preview_revision'] > x['previous_revision']
                     and ((p['refresh_origin'] == 'cmd.browser.reload' and bool(p.get('browser_session_id')) and p['browser_session_id'] == x['browser_session_id'])
                          or (p['refresh_origin'] == 'filemanager.preview_refresh' and not p.get('browser_session_id'))))))
    raise AssertionError('Missing per-family transition oracle: ' + n)

def evaluate(c, op, d):
    """Normative reference model over concrete source/receipt/index values."""
    if not object_input_present(d):
        return {'result': 'REFUSE', 'effects': 0}
    if not object_input_present(d.get('context')) or not object_input_present(d.get('payload')):
        return {'result': 'REFUSE', 'effects': 0}
    p, x = d['payload'], d['context']
    if not authority_types_ok(d):
        return {'result': 'REFUSE', 'effects': 0}
    # Boundary oracles deliberately exercise the adopted EventRecord contract
    # separately from the stricter, bounded family metadata schemas. They do
    # not authorize a family append or introduce a large-inline payload field.
    if op == 'envelope_boundary':
        if not original_evidence_ok(op, d):
            return {'result': 'REFUSE', 'effects': 0}
        return {'result': 'ACCEPT' if envelope_ok(c, d, retry=False, append=True) else 'REFUSE', 'effects': 0}
    if op == 'checkpoint_boundary':
        return {'result': 'ACCEPT' if checkpoint_value_ok(c, d.get('checkpoint')) else 'REFUSE', 'effects': 0}
    if op == 'receipt_boundary':
        if not original_evidence_ok(op, d):
            return {'result': 'REFUSE', 'effects': 0}
        if (not v1_numbers_ok(d['original']['event'])
                or list(validator(read('Plans/event_record.schema.json'), V1).iter_errors(d['original']['event']))):
            return {'result': 'REFUSE', 'effects': 0}
        return {'result': 'ACCEPT' if receipt_ok(d) else 'REFUSE', 'effects': 0}
    if op == 'event_schema':
        valid = not list(validator(read('Plans/event_record.schema.json')).iter_errors(d.get('envelope')))
        return {'result': 'ACCEPT' if valid else 'REFUSE', 'effects': 0}
    if not original_evidence_ok(op, d):
        return {'result': 'REFUSE', 'effects': 0}
    if op in ('payload', 'recover', 'publish', 'withdraw_writer'):
        policies = [d['envelope'].get('replay_policy'), d['original']['event'].get('replay_policy'),
                    d.get('replay_policy'), x.get('replay_policy'), x.get('envelope_replay_policy')]
        if 'projector_replay_only' in policies:
            return {'result': 'REFUSE', 'effects': 0, 'error': 'replay_only_not_appendable'}
    if op == 'payload':
        return {'result': 'ACCEPT' if payload_ok(c, p, x) and envelope_ok(c, d, retry=False, append=True) else 'REFUSE', 'effects': 0}
    if op in ('recover', 'publish', 'read', 'checkpoint', 'rebuild'):
        o, r, out = d['original'], d['receipt'], d['outcome']
        if not outcome_present(out) or not out['committed'] or not d['backup_closure_verified']:
            return {'result': 'UNAVAILABLE', 'effects': 0}
        if (not v1_numbers_ok(out) or not payload_ok(c, o['payload'], d['original_context'], V1, V1)
                or not same(p, o['payload']) or not same(out['payload'], o['payload'])
                or not envelope_ok(c, d, historical=op in ('read', 'checkpoint', 'rebuild'),
                                   append=op == 'recover' and r is None)
                or out['event_id'] != o['event_id'] or not same(o['event']['payload'], o['payload'])
                or o['event']['event_id'] != o['event_id'] or o['idempotency_key'] != o['event']['idempotency_key']):
            return {'result': 'REFUSE', 'effects': 0}
        if p.get('outcome_ref', out['source_ref']) != out['source_ref']:
            return {'result': 'REFUSE', 'effects': 0}
        # Original transition/source validity was checked against original_context
        # above. Retained reads and receipt recovery survive later state changes.
        # New append recovery and publication still require the current joins.
        if (op == 'publish' or (op == 'recover' and r is None)) and not payload_ok(c, o['payload'], x, V1, CURRENT):
            return {'result': 'REFUSE', 'effects': 0}
        if op in ('read', 'checkpoint', 'rebuild') and (d['reader_withdrawn'] or d['reader_installed'] != c['consumer']):
            return {'result': 'UNAVAILABLE' if op == 'read' else 'REFUSE', 'effects': 0}
        if op in ('publish', 'read', 'checkpoint', 'rebuild') and (not d['permission_now'] or d['source_deleted_now'] or not d['share_current']
                                         or not context_types_ok(c, x, retained=op in ('read', 'checkpoint', 'rebuild')) or not x['owner_command_authorized']):
            return {'result': 'UNAVAILABLE' if op == 'read' else 'REFUSE', 'effects': 0}
        if r is None:
            if op == 'recover' and (not d['permission_now'] or d['source_deleted_now'] or not d['share_current']):
                return {'result': 'REFUSE', 'effects': 0}
            return {'result': 'APPEND_ORIGINAL' if op == 'recover' else 'PENDING', 'effects': 0, 'event_id': o['event_id']}
        if not receipt_ok(d):
            return {'result': 'REFUSE', 'effects': 0}
        if op == 'publish' and not d['receipt_retained']:
            return {'result': 'PENDING', 'effects': 0, 'event_id': o['event_id']}
        if op in ('recover', 'publish', 'read'):
            return {'result': 'ORIGINAL', 'effects': 0, 'event_id': o['event_id'], 'receipt_ref': d['receipt_ref']}
    if op in ('checkpoint', 'rebuild'):
        cp = d['checkpoint']
        if not checkpoint_value_ok(c, cp):
            return {'result': 'REFUSE', 'effects': 0}
        if op == 'rebuild' and not d['retained_prefix_complete']:
            return {'result': 'UNAVAILABLE', 'effects': 0}
        token = cp['index_read_token']
        if (d['expected_previous'] != d['stored_previous'] or d['reader_installed'] != c['consumer']
                or d['reader_withdrawn'] or not d['permission_now'] or d['source_deleted_now']
                or cp['state'] != 'current' or token != d['selected_token']
                or d['live_snapshot_id'] != d['current_live_snapshot_id']
                or not token_matches_storage(token, d['storage_instance_id'])
                or not d['share_current'] or not envelope_ok(c, d, historical=True) or not receipt_ok(d)
                or cp.get('project_id') != p.get('project_id') or cp.get('scope') != p.get('scope')):
            return {'result': 'REFUSE', 'effects': 0}
        if not index_inputs_ok(d):
            return {'result': 'REFUSE', 'effects': 0}
        rows, low, high, source = d['index_rows'], d['scan_low'], d['scan_high'], d['selected_source']
        prior = d['stored_previous']
        source_rows = source['rows']
        if (source['storage_instance_id'] != d['storage_instance_id']
                or source['index_read_token'] != token or source['last_sequence'] != d['selected_high']
                or [r['sequence'] for r in source_rows] != list(range(source['first_sequence'], source['last_sequence'] + 1))
                or any(r['scope_partition'] != _codec.scope_partition('application' if r['scope']['kind'] == 'app' else 'project', r['scope']['project_id']) for r in source_rows)):
            return {'result': 'REFUSE', 'effects': 0}
        # Every matching row resolves its own original record, not the last
        # supplied receipt. Join ALL row fields to that independent source.
        for row in source_rows:
            if row['event_type'] == c['event_type'] and row['scope'] == x['scope']:
                original = d if row['event_id'] == d['original']['event_id'] else d.get('retained_events', {}).get(row['event_id'])
                if not object_input_present(original):
                    return {'result': 'REFUSE', 'effects': 0}
                event = original['original']['event']
                if (row != {'event_id': event['event_id'], 'event_type': event['event_type'],
                            'scope': original['original_context']['scope'],
                            'scope_partition': original['scope_partition'], 'sequence': event['sequence_id']}
                        or (original is not d and evaluate(c, 'read', original).get('result') != 'ORIGINAL')):
                    return {'result': 'REFUSE', 'effects': 0}
        if cp == d['stored_previous']:
            return {'result': 'UNCHANGED', 'effects': 0}
        start = source['first_sequence'] if prior is None else prior['through_sequence_id'] + 1
        if (low != start or rows != [r for r in source_rows if low <= r['sequence'] <= high]
                or [r['sequence'] for r in rows] != list(range(low, high + 1))
                or cp['through_sequence_id'] != high or high != d['selected_high']
                or (prior is not None and (list(validator(read(c['checkpoint_schema_ref'])).iter_errors(prior))
                    or not token_matches_storage(prior['index_read_token'], d['storage_instance_id'])
                    or any(prior['index_read_token'][key] != token[key]
                           for key in ('storage_instance_id', 'generation_id', 'generation_anchor_sha256'))
                    or prior.get('project_id') != cp.get('project_id') or prior.get('scope') != cp.get('scope')
                    or prior['state'] != 'current'))):
            return {'result': 'REFUSE', 'effects': 0}
        matches = [r['event_id'] for r in rows if r['event_type'] == c['event_type'] and r['scope'] == x['scope']]
        earlier = [r['event_id'] for r in source_rows if r['sequence'] < low and r['event_type'] == c['event_type'] and r['scope'] == x['scope']]
        if prior is not None and (not earlier or prior['last_event_id'] != earlier[-1]):
            return {'result': 'REFUSE', 'effects': 0}
        last = matches[-1] if matches else (prior['last_event_id'] if prior is not None else None)
        if last is None or matches != d['selected_matches'] or cp['last_event_id'] != last:
            return {'result': 'REFUSE', 'effects': 0}
        return {'result': 'ADVANCE', 'effects': 0, 'through_sequence_id': high, 'last_event_id': last}
    if op == 'withdraw_writer':
        admitted = d['admitted_sequence']
        if (not admission_present(admitted) or not admission_numbers_ok(admitted, d['withdrawal_frontier'])
                or admitted > d['withdrawal_frontier']):
            return {'result': 'REFUSE', 'effects': 0}
        return evaluate(c, 'publish', d)
    raise AssertionError(op)


def evaluate_json(c, op, encoded):
    """Raw JSON ingress preserves the lexical fences before typed evaluation."""
    try:
        data = parse_owner_json(encoded)
    except ValueError:
        return {'result': 'REFUSE', 'effects': 0}
    return evaluate(c, op, data)

def patch(data, changes):
    for path, value in changes.items():
        keys = path.split('/')
        parent = data
        for key in keys[:-1]:
            parent = parent[int(key)] if isinstance(parent, list) else parent[key]
        key = int(keys[-1]) if isinstance(parent, list) else keys[-1]
        if value == {'$delete': True}:
            del parent[key]
        else:
            parent[key] = copy.deepcopy(value)


def refresh_browser_owner(data):
    source = data['application_source']
    if source is None:
        return
    record = json.loads(data['browser_owner_records'][source['accepted_source_ref']])
    record['capture'] = copy.deepcopy(data['payload'])
    data['browser_owner_records'][source['accepted_source_ref']] = json.dumps(record, sort_keys=True, separators=(',', ':'))
    h = app_hash(record)
    for key in ('original_input', 'original_output'):
        source[key]['controller_evidence']['source_sha256'] = h
        source[key + '_semantic_sha256'] = app_hash(source[key])
    for stage in source['stage_custody'].values():
        stage['custody_evidence']['source_sha256'] = h
    source['accepted_source_sha256'] = h
    source['source_sha256'] = app_hash({k: v for k, v in source.items() if k != 'source_sha256'})
    data['original']['application_source'] = copy.deepcopy(source)


def semantic_input(c, fixture, case, active=()):
    """Build one defect from a valid operation-specific parent.

    Reserializing the candidate body and recomputing its derived identity is
    observation maintenance, not another semantic mutation. Retained original
    event/receipt custody is never rewritten by this fixture helper.
    """
    assert case['id'] not in active, 'Cyclic fixture parent'
    if 'parent_case' in case:
        parent_case = next(z for z in fixture['semantic_cases'] if z['id'] == case['parent_case'])
        assert parent_case['operation'] == case['operation'], 'Wrong operation-specific parent'
        data = semantic_input(c, fixture, parent_case, (*active, case['id']))
    else:
        data = copy.deepcopy(fixture['semantic_base'])
    patch(data, case['changes'])
    if case.get('refresh_envelope'):
        data['envelope']['payload'] = copy.deepcopy(data['payload'])
        data['envelope']['idempotency_key'] = identity(c, data['payload'], data.get('application_source'))
    if case.get('refresh_browser_owner'):
        refresh_browser_owner(data)
    return data


def semantic_parent(c, fixture, case):
    parent = dict(case, changes={})
    parent.pop('refresh_envelope', None)
    return semantic_input(c, fixture, parent)


def predicate_ok(c, target, data):
    """Exercise a real validation boundary without a caller's other guards.

    These are static guard controls, never publication/append operations. A
    fixture must first validate its parent at this same boundary, then change
    one leaf. End-to-end semantic cases remain independently required below.
    """
    if target == 'original_evidence_ok':
        return original_evidence_ok('read', data)
    if target == 'admission_numbers_ok':
        return admission_numbers_ok(data['admitted_sequence'], data['withdrawal_frontier'])
    if target == 'index_inputs_ok':
        return index_inputs_ok(data)
    if target == 'object_input_present':
        return object_input_present(data['payload'])
    if target == 'browser_record_bytes_present':
        return browser_record_bytes_present(data['browser_owner_records'].get(data['application_source']['accepted_source_ref']))
    if target == 'identity_fields_types_ok':
        return identity_fields_types_ok(c, data['payload'])
    if target == 'identity':
        return identity(c, data['payload'], data.get('application_source'))
    if target == 'commitment':
        return commitment(data['original']['event'])
    if target == 'context_types_ok':
        return context_types_ok(c, data['context'])
    if target == 'authority_types_ok':
        return authority_types_ok(data)
    if target == 'browser_source_ok':
        return browser_source_ok(data, data['application_source'])
    if target == 'payload_ok':
        return payload_ok(c, data['payload'], data['context'])
    if target == 'envelope_ok':
        return envelope_ok(c, data, retry=False)
    if target == 'receipt_ok':
        return receipt_ok(data)
    if target == 'token_matches_storage':
        return token_matches_storage(data['selected_token'], data['storage_instance_id'])
    if target == 'application_source_present':
        return application_source_present(data['application_source'])
    if target == 'original_output_present':
        return original_output_present(data['application_source']['original_output'])
    if target == 'outcome_present':
        return outcome_present(data['outcome'])
    if target == 'admission_present':
        return admission_present(data['admitted_sequence'])
    raise AssertionError('Unknown guard boundary: ' + target)

REQUIRED = {'valid-transition', 'invalid-transition', 'envelope-mismatch', 'original-retry', 'lost-ack',
            'append-recovery', 'missing-outcome', 'corrupt-outcome', 'corrupt-receipt', 'changed-bytes',
            'backup-loss', 'publish-before-receipt', 'read-deleted', 'read-denied', 'valid-checkpoint',
            'coverage-gap', 'filtered-omission', 'cas-race', 'token-change', 'snapshot-change',
            'source-instance-mismatch', 'withdrawn-reader', 'withdrawn-writer', 'drain-admitted',
            'rebuild-valid', 'rebuild-missing-prefix', 'stale-reader-version', 'unknown-checkpoint-field',
            'persisted-snapshot', 'terminal-before-receipt', 'replay-only-payload',
            'replay-only-recover', 'replay-only-publish', 'replay-only-context-recovery',
            'publish-guard-permission_now', 'publish-guard-source_deleted_now',
            'publish-guard-share_current', 'publish-guard-context-owner_command_authorized',
            'initial-global-row-drop-and-low-change', 'wrong-partition-envelope',
            'token-storage-disagrees-with-event', 'full-value-commitment-corrupt',
            'zero-match-suffix-after-first-match', 'zero-match-suffix-cannot-invent-match',
            'no-checkpoint-before-first-match', 'retry-ignores-storage-sequence_id',
            'retry-ignores-storage-observed_at_utc', 'retry-ignores-storage-persisted_at_utc',
            'retry-compares-semantic-actor', 'trailing-LF-envelope-event-type', 'oversize-inline-body-refused',
            'publish-current-source-join-refused', 'append-recovery-current-source-join-refused',
            'append-recovery-guard-permission_now', 'append-recovery-guard-source_deleted_now',
            'append-recovery-guard-share_current'}
REQUIRED |= {'checkpoint-foreign-root-key-and-ref', 'checkpoint-foreign-root-key',
             'checkpoint-foreign-root-ref', 'checkpoint-ref-generation-mismatch',
             'checkpoint-dataset-generation-mismatch', 'prior-checkpoint-foreign-root',
             'rebuild-foreign-root-key-and-ref', 'history-after-live-state-advances',
             'history-after-live-state-advances-denied', 'history-after-live-state-advances-deleted',
             'history-after-live-state-advances-share-withdrawn',
             'history-after-live-state-advances-reader-withdrawn',
             'history-after-live-state-advances-reader-version-mismatch',
             'history-after-live-state-advances-forged-original',
             'history-after-live-state-advances-invalid-original-transition'}

SCHEMA_REQUIRED = {'unresolved-optional-payload-ref', 'unresolved-unused-payload-definition',
                   'unresolved-optional-checkpoint-ref', 'unresolved-unused-checkpoint-definition',
                   'unresolved-allowed-resource-pointer', 'unresolved-unregistered-resource'}

PREPARED_FAMILIES = {'doctor.custom_headless.checked', 'live.session.started', 'live.step.updated',
                     'live.artifact.created', 'live.session.completed', 'live.session.degraded',
                     'browser.context_captured', 'dev.session.started', 'dev.session.stopping',
                     'dev.session.stopped', 'dev.session.restarting', 'preview.session.started',
                     'preview.session.refreshed', 'preview.session.stopped', 'catalog.install.started', 'catalog.install.completed'}

def value_valid(schema_ref, value):
    if list(validator(read(schema_ref)).iter_errors(value)):
        return False
    if physical_size(value) is None or physical_size(value) > 16384:
        return False
    if schema_ref.endswith('dev_session_record_v2.schema.json') and value['dap'] is not None:
        dap = value['dap']
        if (value['project_id'] != dap['project_id'] or value['dev_session_id'] != dap['dev_session_id']
                or value['project_id'] != dap['topology']['project_id']
                or _debug.validate(dap, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json'))):
            return False
    return True


def migrate(kind, source, evidence):
    """Static migration oracle only. It neither opens a store nor authorizes writes."""
    if list(validator(read('Plans/ds15_migration_inputs.schema.json')['$defs'][kind]).iter_errors({'source': source, 'evidence': evidence})):
        return None
    if not authority_types_ok(evidence) or not evidence.get('verified') or not evidence.get('backup_verified'):
        return None
    if kind == 'dap_v1':
        if _debug.validate(source, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json')):
            return None
        if source['project_id'] != evidence['project_id'] or source['dev_session_id'] != evidence['dev_session_id']:
            return None
        result = {'schema_id': 'pm.storage_value.dev_session_record.v2', 'schema_version': '2.0.0',
                  'project_id': source['project_id'], 'dev_session_id': source['dev_session_id'],
                  'workflow': None, 'dap': copy.deepcopy(source)}
        return result if value_valid('Plans/ds15_dev_session_record_v2.schema.json', result) else None
    if kind == 'preview_v1':
        mappings = evidence.get('mappings', [])
        if (len(mappings) != 1 or mappings[0]['preview_id'] != source['preview_id']
                or mappings[0]['source_file'] != source['source_file'] or source['status'] not in ('starting', 'running', 'stopped', 'error')):
            return None
        result = copy.deepcopy(mappings[0]['saved_subject_ui'])
        result.update(runtime_verification='unverified', legacy_status=source['status'])
        return result if value_valid('Plans/ds15_preview_state_v2.schema.json', result) else None
    if kind == 'capture_chip':
        if (source.get('thread_id') != evidence.get('thread_id') or source.get('scope') != evidence.get('scope')):
            return None
        result = copy.deepcopy(source)
        result.update(schema_id='pm.ds15.browser_capture_chip.v2', schema_version='2.0.0')
        return result if value_valid('Plans/ds15_browser_capture_chip_v2.schema.json', result) else None
    raise AssertionError(kind)


def check_value_contracts():
    count = 0
    for f in read('Plans/ds15_value_contract_fixtures.json'):
        for case in f['cases']:
            data = copy.deepcopy(f['positive'])
            patch(data, case['changes'])
            assert value_valid(f['schema_ref'], data) == case['valid'], (f['schema_ref'], case['id'])
            count += 1
        for case in f.get('migration_cases', []):
            data = copy.deepcopy(f['migration_base'])
            patch(data, case['changes'])
            got = migrate(data['kind'], data['source'], data['evidence'])
            assert got == case['expected'], (f['schema_ref'], case['id'], got, case['expected'])
            count += 1
    return count

def guard_proof_input(proof, negative=True):
    """Materialize the named guard proof without changing immutable originals."""
    if proof.get('event_type'):
        fixture = next(f for f in read('Plans/ds15_event_contract_fixtures.json') if f['event_type'] == proof['event_type'])
        data = copy.deepcopy(fixture['semantic_base'])
    else:
        fixture = next(f for f in read('Plans/ds15_value_contract_fixtures.json') if f['schema_ref'] == proof['schema_ref'])
        data = (copy.deepcopy(fixture['migration_base']) if proof['target'] == 'migrate'
                else {'schema_ref': fixture['schema_ref'], 'value': copy.deepcopy(fixture['positive'])})
    patch(data, proof.get('parent_changes', {}))
    if negative:
        assert len(proof['changes']) == 1, (proof['id'], 'not one source change')
        patch(data, proof['changes'])
        patch(data, proof.get('derived_changes', {}))
    return data


def guard_proof_result(proof, data):
    target = proof['target']
    if target == 'migrate':
        return migrate(data['kind'], data['source'], data['evidence'])
    if target == 'value_valid':
        return value_valid(data['schema_ref'], data['value'])
    c = next(c for c in read('Plans/ds15_event_contracts.json') if c['event_type'] == proof['event_type'])
    if target in ('payload_ok', 'envelope_ok', 'context_types_ok', 'authority_types_ok', 'browser_source_ok', 'identity_fields_types_ok', 'identity', 'commitment', 'object_input_present', 'browser_record_bytes_present', 'index_inputs_ok', 'admission_numbers_ok', 'original_evidence_ok'):
        return predicate_ok(c, target, data)
    return evaluate(c, target, data)


def proof_success(result):
    return result is not None and result is not False and (not isinstance(result, dict)
            or result.get('result') not in ('REFUSE', 'UNAVAILABLE', 'PENDING'))


def numeric_input(case, negative=True):
    """One numeric leaf at its real boundary; observations stay value-equal."""
    fixtures = read('Plans/ds15_event_contract_fixtures.json')
    f = next(f for f in fixtures if f['event_type'] == case['event_type'])
    c = next(c for c in read('Plans/ds15_event_contracts.json') if c['event_type'] == case['event_type'])
    if case['target'] == 'atom':
        parent = case['parent']
    elif case['target'] in ('identity', 'payload_schema'):
        parent = copy.deepcopy(f['positive'])
    elif case['target'] in ('value', 'migration'):
        fixture = next(f for f in read('Plans/ds15_value_contract_fixtures.json')
                       if f['schema_ref'] == case['schema_ref'])
        parent = copy.deepcopy(fixture['migration_base' if case['target'] == 'migration' else 'positive'])
    else:
        parent = copy.deepcopy(f['semantic_base'])
        if case.get('parent_case'):
            parent = semantic_input(c, f, next(z for z in f['semantic_cases'] if z['id'] == case['parent_case']))
    if not negative:
        return c, parent
    if case['target'] == 'atom':
        return c, json.loads(case['token'])
    patch(parent, {case['path']: json.loads(case['token'])})
    return c, parent


def current_producer_digest(envelope):
    """CV-1100 producer route of a current envelope: schema and integer slots, then qualified JCS."""
    if list(validator(read('Plans/event_record.schema.json')).iter_errors(envelope)):
        return None
    try:
        return producer_semantic_digest(envelope, type_sensitive_paths=producer_type_sensitive_paths(envelope))
    except Refusal:
        return None


def numeric_operation(case, data):
    c = next(c for c in read('Plans/ds15_event_contracts.json') if c['event_type'] == case['event_type'])
    target = case['target']
    if target == 'atom':
        # CV-1100 current integer at a slot with no owner bound.
        try:
            current_integer(data)
        except Refusal:
            return False
        return True
    if target == 'identity':
        return identity(c, data)
    if target == 'payload_schema':
        return not list(validator(read(c['payload_schema_ref'])).iter_errors(data))
    if target == 'value':
        return value_valid(case['schema_ref'], data)
    if target == 'migration':
        return migrate(data['kind'], data['source'], data['evidence'])
    if target == 'commitment':
        return commitment(data['original']['event'])
    if target == 'digest':
        return current_producer_digest(data['envelope'])
    return evaluate(c, case['operation'], data)


def numeric_wire(case):
    if case['target'] == 'atom':
        return case['token']
    _, data = numeric_input(case, False)
    marker = '__DS15_numeric_lexeme__'
    patch(data, {case['path']: marker})
    encoded = json.dumps(data)
    assert encoded.count(json.dumps(marker)) == 1, case['id']
    return encoded.replace(json.dumps(marker), case['token'])


# Spellings Python's json would silently normalize, so only the raw CV-1100 parser sees them.
RAW_ONLY_TOKENS = ('-0', '01', '00', '-01')


def numeric_case_results(case):
    """(parent ok, raw-wire result, evaluate_json result or None, typed result or None) under CV-1100."""
    c, parent = numeric_input(case, False)
    parent_ok = proof_success(numeric_operation(case, parent))
    encoded = numeric_wire(case)
    try:
        decoded = parse_owner_json(encoded)
    except ValueError:
        wire = False
    else:
        wire = proof_success(numeric_operation(case, decoded))
    whole = proof_success(evaluate_json(c, case['operation'], encoded)) if case['target'] == 'evaluate' else None
    if case['token'] in RAW_ONLY_TOKENS:
        try:
            parse_owner_json(case['token'])
        except ValueError:
            typed_result = None
        else:
            raise AssertionError((case['id'], 'noncanonical JSON spelling accepted'))
        return parent_ok, wire, whole, typed_result, None
    _, data = numeric_input(case)
    got = numeric_operation(case, data)
    return parent_ok, wire, whole, proof_success(got), (data, got)


def check_numeric_contracts():
    cases = read('Plans/ds15_numeric_contract_fixtures.json')
    assert len({z['id'] for z in cases}) == len(cases), 'Duplicate numeric case id'
    for family in PREPARED_FAMILIES:
        own = [z for z in cases if z['event_type'] == family]
        assert {'1', '1.0', '1e0', '0', '-0', '01', '2.0', '0.0'} <= {z['token'] for z in own}
    for case in cases:
        c = next(c for c in read('Plans/ds15_event_contracts.json') if c['event_type'] == case['event_type'])
        parent_ok, wire, whole, typed_ok, typed_run = numeric_case_results(case)
        assert parent_ok, (case['id'], 'invalid numeric parent')
        assert wire == case['valid'], (case['id'], 'raw wire through loads_current_json')
        assert whole in (None, case['valid']), (case['id'], 'raw evaluate_json')
        if typed_run is None:
            continue
        assert typed_ok == case['valid'], (case['id'], typed_run[1])
        data, got = typed_run
        if case.get('operation') == 'event_schema':
            valid = not list(validator(read('Plans/event_record.schema.json')).iter_errors(data['envelope']))
            assert valid == case['valid'], (case['id'], 'adopted EventRecord schema profile')
        if case.get('path', '').startswith('receipt/'):
            assert shared_valid('AppendReceipt', data['receipt']) == case['valid'], (case['id'], 'receipt schema profile')
        if case.get('path', '').startswith('checkpoint/'):
            valid = not list(validator(read(c['checkpoint_schema_ref'])).iter_errors(data['checkpoint']))
            assert valid == case['valid'], (case['id'], 'checkpoint schema profile')
        # The same token at the complete operation input, through the current raw parser.
        try:
            decoded = parse_owner_json(json.dumps(data))
        except ValueError:
            assert not case['valid'], case['id']
        else:
            assert proof_success(numeric_operation(case, decoded)) == proof_success(got), case['id']
    return len(cases)


def check_guard_proofs():
    proofs = read('Plans/ds15_guard_proof_fixtures.json')
    assert len({p['id'] for p in proofs}) == len(proofs), 'Duplicate guard proof id'
    for proof in proofs:
        assert proof_success(guard_proof_result(proof, guard_proof_input(proof, False))), (proof['id'], 'invalid parent')
        assert not proof_success(guard_proof_result(proof, guard_proof_input(proof))), (proof['id'], 'negative accepted')
    return len(proofs)


def main():
    for schema_ref in ('Plans/ds15_authority_context.schema.json', 'Plans/ds15_migration_inputs.schema.json', 'Plans/ds15_browser_owner_record.schema.json', 'Plans/ds15_original_evidence.schema.json'):
        validator(read(schema_ref))
    shared = read('Plans/event_append_receipt_full_value_fixtures.json')
    assert commitment(shared['base_original_event'])['sha256'] == shared['commitment_sha256']
    contracts = read('Plans/ds15_event_contracts.json')
    fixtures = read('Plans/ds15_event_contract_fixtures.json')
    assert len(contracts) == len(fixtures) == len(PREPARED_FAMILIES), 'DS15 preparation manifest cardinality changed'
    assert {c['event_type'] for c in contracts} == {f['event_type'] for f in fixtures} == PREPARED_FAMILIES, 'DS15 prepared-family set changed'
    registry = read('Plans/event_family_registry.json')
    value_registry = read('Plans/storage_value_registry.json')
    count = semantic_count = schema_count = predicate_count = 0
    for c in contracts:
        name = c['event_type']
        assert c['numeric_schema_profile_ref'] == 'Plans/ds15_integer_domain.schema.json'
        assert name not in json.dumps(registry), name + ' unexpectedly admitted'
        v = validator(read(c['payload_schema_ref']))
        f = next(f for f in fixtures if f['event_type'] == name)
        v.validate(f['positive']); count += 1
        for case in f['negative']:
            bad = copy.deepcopy(f['positive'])
            if case['mutation'] == 'missing_field': bad.pop(case['field'])
            else: bad[case['field']] = case['value']
            assert list(v.iter_errors(bad)), (name, case)
            count += 1
        cp = read(c['checkpoint_schema_ref'])
        validator(cp).validate(f['semantic_base']['checkpoint'])
        token = cp['$defs']['read_token']
        assert len(token['required']) == 9 and 'redb_snapshot_id' not in token['properties']
        assert cp['additionalProperties'] is False and cp['properties']['consumer_id']['const'] == c['consumer']
        row = next(v for v in value_registry['families'] if v['value_schema_ref'] == c['checkpoint_schema_ref'])
        assert row['key_shape'] == c['checkpoint_key'] and row['value_schema'] == cp
        assert row['retention_policy_ref'] == c['checkpoint_retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        profile = value_registry['storage_profile']['family_profiles'][row['family_id']]
        assert profile['redb_file'] == 'derived' and profile['encoding_target'] == 'messagepack_canonical'
        assert 1 <= profile['max_value_bytes'] <= 16384
        for key in ('semantic_owner', 'storage_owner', 'payload_owner', 'oracle_owner'):
            path, unit = c[key].split('#'); assert unit in (ROOT / path).read_text()
        own = owner_text(c)
        for word in (name, c['consumer'], c['checkpoint_key'], c['idempotency_recipe'], 'SP-278', 'SP-286', 'CV-339', 'withdrawal', 'NOT_RUN'):
            assert word in own, (name, word)
        ids = [case['id'] for case in f['semantic_cases']]
        assert len(ids) == len(set(ids)) and REQUIRED <= set(ids), (name, REQUIRED - set(ids))
        assert any(i.startswith('trailing-LF-checkpoint-') for i in ids), name
        if name == 'browser.context_captured':
            assert {'application-exact-cv366-key', 'application-raw-hash-key',
                    'application-wrong-server_id', 'application-wrong-original_operation_id',
                    'project-capture-original-retry'} <= set(ids)
        for case in f['semantic_cases']:
            if case.get('single_defect'):
                assert len(case['changes']) == 1, (name, case['id'], 'not one semantic change')
                parent = semantic_parent(c, f, case)
                assert evaluate(c, case['operation'], parent) == case['parent_expected'], (name, case['id'], 'invalid parent')
            data = semantic_input(c, f, case)
            got = evaluate(c, case['operation'], data)
            assert got == case['expected'], (name, case['id'], got, case['expected'])
            semantic_count += 1
        for case in f.get('predicate_cases', []):
            data = copy.deepcopy(f['semantic_base'])
            assert predicate_ok(c, case['target'], data), (name, case['id'], 'invalid parent')
            assert len(case['changes']) == 1, (name, case['id'], 'not one leaf')
            patch(data, case['changes'])
            assert not predicate_ok(c, case['target'], data), (name, case['id'], 'guard accepted')
            predicate_count += 1
        schema_ids = [case['id'] for case in f['schema_cases']]
        assert len(schema_ids) == len(set(schema_ids)) and SCHEMA_REQUIRED <= set(schema_ids), name
        for case in f['schema_cases']:
            schema = copy.deepcopy(read(c[case['schema']]))
            patch(schema, case['changes'])
            try:
                validator(schema)
            except Unresolvable:
                pass
            else:
                raise AssertionError((name, case['id'], 'unresolved schema reference accepted'))
            schema_count += 1
    value_cases = check_value_contracts() if (ROOT / 'Plans/ds15_value_contract_fixtures.json').exists() else 0
    guard_proofs = check_guard_proofs()
    numeric_cases = check_numeric_contracts()
    print(json.dumps({'status':'pass','families':len(contracts),'payload_oracles':count,'semantic_oracles':semantic_count,'reference_closure_oracles':schema_count,'predicate_oracles':predicate_count,'value_oracles':value_cases,'guard_proof_oracles':guard_proofs,'numeric_oracles':numeric_cases,'native_execution':'NOT_RUN'}))

if __name__ == '__main__': main()

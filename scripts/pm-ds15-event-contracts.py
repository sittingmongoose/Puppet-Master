#!/usr/bin/env python3
"""Execute DS15 static contract oracles. No production effects or native proof."""
import ast
import copy
import hashlib
import importlib
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
from pm_event_numbers import (EVENT_VALUE, FrozenRecipe, OriginalBinding, OriginalCustody,  # noqa: E402
                              RecipeTuple, Refusal, RetainedDispatcher, current_integer,
                              decode_storage_value, exact_boolean, full_value_commitment, loads_current_json,
                              producer_semantic_bytes, producer_semantic_digest, storage_uint64,
                              storage_value_bytes)
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time  # noqa: E402
from pm_event_datetime import format_checker as datetime_format_checker  # noqa: E402

# Sweep part 2B (S-FMT1, CV-1101). Every `format: date-time` a DS15 validator meets is checked by the
# shared predicate `pm_event_datetime.date_time`, installed through the shared explicitly registered
# checker (`pm_event_datetime.format_checker`), with the broad EventRecord profile (RFC 3339 5.6/5.7:
# EventRecord occurred_at_utc, the AppendReceipt acknowledged_at_utc and the DS15 dev session record v2
# timestamps, whose owners declare format: date-time and name no stricter profile). CV-253's strict
# storage_utc_z profile is added on the Storage-assigned observed_at_utc and persisted_at_utc of every
# EventRecord this lane validates (STORAGE_DATETIME_FIELDS). The stock jsonschema.FormatChecker() of the
# pinned environment has no date-time checker at all, so before this the format was never enforced.
# datetime_validator and the inventory gate run at batch-2 integration (SWEEP-P2B addendum 2): the gate
# fails closed on a lane tree whose Plans content changed, so this lane calls neither.
STORAGE_DATETIME_FIELDS = ('observed_at_utc', 'persisted_at_utc')

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
# retained original. Since sweep part 2B (S-N2) the recipe is never implicit: a
# retained reader takes it from Storage's sealed write custody through SP-1101
# (select_original_recipe, then resolve_original through the shared
# RetainedDispatcher); the frozen recipe carries its CV-1101 date-time profiles.
V1 = 'ds15-v1'

# CV-1101 date-time profiles per DS15 recipe. The current writer and the frozen
# ds15-v1 recipe select the same owner profiles: CV-1101 binds existing envelope
# behaviour, and ds15-v1's stock checker merely skipped date-time, which is not an
# owner-valid legacy grammar ("a skipped format check never authenticates invalid
# history", SP-1101). Owner-valid lowercase, offset and long-fraction source
# timestamps stay readable; Storage-assigned fields keep storage_utc_z.
DATETIME_PROFILES = {CURRENT: {'format': EVENT_RECORD, 'storage': STORAGE_UTC_Z},
                     V1: {'format': EVENT_RECORD, 'storage': STORAGE_UTC_Z}}
FORMATS = {recipe: datetime_format_checker(profile=profiles['format']) for recipe, profiles in DATETIME_PROFILES.items()}


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


# The frozen number rules of each installed write recipe (S-N2): a retained original is read with the
# rules of the recipe its sealed custody selected, never with an implicit default.
FROZEN_NUMBERS = {V1: (v1_numbers_ok, v1_producer_digest)}


def recipe_numbers_ok(recipe, value):
    return FROZEN_NUMBERS[recipe][0](value)


def recipe_producer_digest(recipe, event):
    return FROZEN_NUMBERS[recipe][1](event)


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


def producer_refusal(event):
    """CV-1100: the qualified-JCS refusal reason of the current CV-317 projection, or None."""
    try:
        producer_semantic_bytes(event, type_sensitive_paths=producer_type_sensitive_paths(event))
    except Refusal as exc:
        return exc.reason
    return None


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


def storage_datetime_errors(instance, fields, profile):
    """CV-253 on one record's own Storage-assigned timestamp members (sweep part 2B, S-FMT1).

    The shared predicate date_time with the strict storage_utc_z profile (terminal uppercase Z only),
    on top of the record schema's own format: date-time. Every value the validator treats as a string
    reaches it, so a str subclass refuses (date_time_type); a non-string is left to the schema type.
    Each refusal is a format error of the record's schema verdict, with the shared Refusal as cause.
    """
    if not fields or not isinstance(instance, dict):
        return []
    errors = []
    for field in fields:
        if field in instance and isinstance(instance[field], str):
            try:
                date_time(instance[field], profile=profile)
            except Refusal as refusal:
                errors.append(jsonschema.ValidationError(
                    'CV-253 %s refuses %r: %s' % (profile, instance[field], refusal.reason), validator='format',
                    validator_value='date-time', instance=instance[field], path=(field,), cause=refusal))
    return errors


def _inventory_digest(value):
    # The shared inventory's structural fingerprint of a resource (pm_event_datetime_inventory.digest).
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=True, separators=(',', ':')).encode()).hexdigest()


@lru_cache(maxsize=1)
def inventory_storage_sites():
    """{resource fingerprint: Storage fields} of the EventRecord resource roots the shared inventory classifies.

    Read as data (Plans/event_datetime_inventory.json), never as the gate: selection is by the exact
    resource-content fingerprint and the reviewed root path, not by a schema discriminator or a field-name
    guess. Only resource roots with classification EventRecord and profile storage_utc_z are taken.
    """
    sites = {}
    for row in read('Plans/event_datetime_inventory.json')['nodes']:
        if (row['classification'] == 'EventRecord' and row['profile'] == STORAGE_UTC_Z
                and row['pointer'] == row['resource_pointer']):
            sites.setdefault(row['resource_sha256'], set()).update(row['fields'])
    return {k: tuple(f for f in STORAGE_DATETIME_FIELDS if f in v) for k, v in sites.items()}


def storage_datetime_fields(schema):
    """The Storage-assigned timestamp members of a schema that is an inventoried EventRecord resource root."""
    return inventory_storage_sites().get(_inventory_digest(schema), ())


class MemoizedValidation:
    """Cache exact validator errors by JSON value, never by mutable object id.

    A current validator adds CV-1100 integer-slot admission after the stock
    schema accepts; a ds15-v1 validator carries the frozen v1 integer domain.
    Both run the shared CV-1101 date-time predicate through their format checker,
    and an EventRecord validator adds CV-253's storage_utc_z on its Storage fields.
    """
    def __init__(self, original, slots, storage_fields=(), storage_profile=STORAGE_UTC_Z):
        self.original = original
        self.slots = slots
        self.storage_fields = storage_fields
        self.storage_profile = storage_profile
        self.errors = {}

    def _stock(self, instance):
        return (*self.original.iter_errors(instance),
                *storage_datetime_errors(instance, self.storage_fields, self.storage_profile))

    def iter_errors(self, instance):
        with exact_integer_text():
            key = json.dumps(instance, sort_keys=True, ensure_ascii=True, default=_memo_default)
            if key not in self.errors:
                errors = self._stock(instance)
                if not errors and self.slots:
                    errors = tuple(integer_slot_errors(self.original, instance))
                self.errors[key] = errors
        return iter(self.errors[key])

    def validate(self, instance):
        self.original.validate(instance)
        for error in storage_datetime_errors(instance, self.storage_fields, self.storage_profile):
            raise error
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
    try:
        check_reference_closure(schema, registry)
    except Unresolvable as exc:
        unresolved = exc
    else:
        unresolved = None
    if refused('schema_references', unresolved=unresolved is not None):
        raise unresolved
    chosen = V1Validator if recipe == V1 else StrictValidator
    # The recipe's CV-1101 profiles: the shared date-time checker at every format: date-time, and
    # storage_utc_z on the Storage fields when the schema is an inventoried EventRecord resource root.
    profiles = DATETIME_PROFILES[recipe]
    return MemoizedValidation(chosen(schema, registry=registry, format_checker=FORMATS[recipe]), slots=recipe == CURRENT,
                              storage_fields=storage_datetime_fields(json.loads(encoded)),
                              storage_profile=profiles['storage'])

@lru_cache(maxsize=1)
def application_source_validator():
    schema = read('Plans/application_workflow_sources.schema.json')
    return validator({'$ref': schema['$id'] + '#/$defs/OriginalBrowserTransitionSource'})

# ---------------------------------------------------------------------------
# Method B guard tables (sweep part 2A). Every refusal of this checker (and of
# pm-ds15-deck2-contracts.py, which reuses this model) is one named row of one
# phase table, generated by scripts/pm-ds15-table-generate.py and evaluated in
# the table's declared order. Derivation code below only computes observations
# (schema error counts, recomputed hashes and identities, canonical-byte sizes,
# resolved records, typed copies, presence); it never decides acceptance. A
# boundary is an ordered chain of phases; reused boundaries are phases of their
# callers. RECORDER is set only by the guard-table suite builder.
# ---------------------------------------------------------------------------
TABLE_PREFIX = 'pm_ds15_table_'
RECORDER = None
_TABLE_ROWS = {}
_TABLE_FIELDS = {}


def table_rows(phase):
    """The phase's (row, predicate, context) list in declared table order."""
    rows = _TABLE_ROWS.get(phase)
    if rows is None:
        module = importlib.import_module(TABLE_PREFIX + phase)
        case = module.case(None)
        rows = _TABLE_ROWS[phase] = [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]
        _TABLE_FIELDS[phase] = module.FIELDS
    return rows


def refusal(phase, facts):
    """First refusing row of one phase as (row, code), or None.

    The observation passed to the rows holds exactly the table's FIELDS.
    """
    rows = table_rows(phase)
    observed = {k: facts[k] for k in _TABLE_FIELDS[phase]}
    first = None
    for name, predicate, context in rows:
        code = predicate(observed, context)
        if code is not None:
            first = (name, code)
            break
    if RECORDER is not None:
        RECORDER.append((phase, copy.deepcopy(observed), first))
    return first


# A table of rows entailed by the phase before it (a schema const, enum or bound, or earlier
# rows) runs right after that phase with the same observation, so the entailed rows stay in
# the checker without withholding the credit of the rows that can be proved.
FOLLOWERS = {'env_scope': 'env_scope_entailed', 'tr_browser_a': 'tr_browser_a_entailed', 'env_app_browser_b': 'env_app_browser_b_entailed', 'tr_catalog_install': 'tr_catalog_install_entailed',
             'tr_dev_a': 'tr_dev_a_entailed', 'tr_preview_b': 'tr_preview_b_entailed',
             'tr_preview_origin': 'tr_preview_origin_entailed', 'd2_env_b': 'd2_env_b_entailed',
             'd2_env_storage': 'd2_env_storage_entailed', 'd2_env_c': 'd2_env_c_entailed',
             'd2_pl_gate': 'd2_pl_gate_entailed', 'rd_resolve': 'rd_resolve_entailed'}


def refused(phase, **facts):
    if refusal(phase, facts) is not None:
        return True
    follower = FOLLOWERS.get(phase)
    return follower is not None and refusal(follower, facts) is not None


def table_order_errors():
    """Each factory's check() requires its rows in exactly the table order."""
    errors = []
    for path in sorted((ROOT / 'scripts').glob(TABLE_PREFIX + '*.py')):
        phase = path.stem[len(TABLE_PREFIX):]
        tree = ast.parse(path.read_text())
        factory = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'case')
        check = next(n for n in factory.body if isinstance(n, ast.FunctionDef) and n.name == 'check')
        required = [c.args[0].value for c in ast.walk(check) if isinstance(c, ast.Call)
                    and ast.unparse(c.func) == 'table.require']
        if required != [name for name, _, _ in table_rows(phase)]:
            errors.append(phase)
    return errors


def tx(value):
    """Exact typed text of a value for a typed join row (see typed)."""
    with exact_integer_text():
        return json.dumps(typed(value))


def kind(value):
    return type(value).__name__


@lru_cache(maxsize=1)
def number_tables():
    return frozenset(p.stem[len(TABLE_PREFIX):] for p in (ROOT / 'scripts').glob(TABLE_PREFIX + 'sch_*_n.py'))


def schema_refused(phase, schema_validator, instance):
    """One schema occurrence: the stock verdict, then (if it accepts) its number rule.

    A schema that declares no integer slot has one table whose verdict row also counts
    the (necessarily zero) number errors; otherwise the number rule is the next table.
    """
    errors = list(schema_validator.iter_errors(instance))
    numbers = ('current_integer', 'ds15IntegerDomain')
    stock = len([e for e in errors if e.validator not in numbers])
    numbered = len([e for e in errors if e.validator in numbers]) if not stock else 0
    if phase + '_n' in number_tables():
        return refused(phase, schema_errors=stock) or refused(phase + '_n', number_errors=numbered)
    return refused(phase, schema_errors=stock, number_errors=numbered)


def refusal_reason(call, *args):
    try:
        call(*args)
    except Refusal as exc:
        return exc.reason
    return None


def identity_fields_refused(c, payload, recipe=CURRENT):
    props = read(c['payload_schema_ref'])['properties']
    fields = [*c['identity_fields'], 'project_id' if c['scope_policy'] == 'project_only' else 'scope']
    numbers = ('current_integer', 'ds15IntegerDomain')
    stock = numbered = 0
    for k in fields:
        errors = list(validator(props[k], recipe).iter_errors(payload.get(k)))
        own = [e for e in errors if e.validator not in numbers]
        stock += len(own)
        numbered += 0 if own else len([e for e in errors if e.validator in numbers])
    phase = 'sch_id_fields_v1' if recipe == V1 else 'sch_id_fields'
    return refused(phase, schema_errors=stock) or refused(phase + '_n', number_errors=0 if stock else numbered)


def identity_fields_types_ok(c, payload, recipe=CURRENT):
    return not identity_fields_refused(c, payload, recipe)


def identity(c, payload, source=None, recipe=CURRENT):
    if refused('id_input', payload_object=isinstance(payload, dict)):
        return None
    if identity_fields_refused(c, payload, recipe):
        return None
    scoped = c['scope_policy'] != 'project_only'
    scope_object = isinstance(payload.get('scope'), dict) if scoped else None
    application = bool(scoped and scope_object and payload['scope'].get('kind') == 'app')
    if refused('id_scope_entailed', scoped=scoped, scope_object=scope_object):
        return None
    if refused('id_scope', application=application, source_present=bool(source) if application else None):
        return None
    if application:
        return 'application@1:{}:{}'.format(source['server_id'].encode().hex(),
                                           source['original_operation_id'].encode().hex())
    scope = [payload['project_id']] if c['scope_policy'] == 'project_only' else [payload['scope']]
    parts = [c['event_type'], c['family_revision'], *scope] + [payload[k] for k in c['identity_fields']]
    # The DS15 identity recipe's canonical MessagePack array, through SP-1100's EVENT_VALUE profile
    # (byte-identical to the ds15-v1 codec on every ds15-v1 value).
    if refused('id_preimage', preimage_size=physical_size(parts)):
        return None
    return hashlib.sha256(storage_value_bytes(parts, profile=EVENT_VALUE)).hexdigest()


def commitment(event, recipe):
    """CV-339 original_event_value_commitment of a retained original, under its selected frozen recipe."""
    if refused('cm_domain', v1_domain=recipe_numbers_ok(recipe, event)):
        return None
    if not authority_types_ok(event):
        return None
    if refused('cm_value', commitment_refusal=refusal_reason(full_value_commitment, event)):
        return None
    domain = 'pm.storage.original_event_value_commitment.v1'
    return {'schema_id': domain, 'schema_version': '1.0.0', 'codec': EVENT_VALUE, 'domain': domain,
            'event_schema_id': event['schema_id'], 'event_schema_version': event['schema_version'],
            'sha256': full_value_commitment(event)}


RECEIPT_PHASES = {'AppendReceipt': 'sch_receipt', 'custody_v2': 'sch_custody', 'full_value_result': 'sch_result'}


def shared_valid(kind_name, value, recipe):
    """First receipt, custody and issued result: Storage's records of a retained original (its selected recipe)."""
    schema = read('Plans/event_append_receipt_contracts.schema.json')
    v = validator({'$defs': schema['$defs'], '$ref': '#/$defs/' + kind_name}, recipe)
    return not schema_refused(RECEIPT_PHASES[kind_name], v, value)


# ---------------------------------------------------------------------------
# SP-1101 retained-original dispatch (sweep part 2B, S-N2). A retained reader or
# retry resolver never picks the original's recipe itself:
#   1. select_original_recipe (table rd_recipe) makes one selection from Storage's
#      sealed write custody for the original's Storage instance and family, before
#      any retained read; no custody means the existing unavailable contract, an
#      uninstalled tuple means unsupported, and neither falls back to the current
#      or another recipe. The selection fixes the frozen number rules and the
#      CV-1101 date-time profiles (DATETIME_PROFILES) every later retained check uses.
#   2. the frozen-recipe checks run in their existing order (schema, identity,
#      copies, receipt, commitment), parameterized by that selection.
#   3. resolve_original (table rd_resolve) then resolves the original once through
#      the shared RetainedDispatcher: the sealed original owner (DS15OriginalOwner)
#      authenticates the fetched bytes against what was sealed at the original ref,
#      the binding is compared field by field, the per-original recipe tuple selects
#      exactly one installed FrozenRecipe, whose verifier recomputes the original.
#      No override, no current-then-legacy probing. A coherent forgery (every copy
#      rewritten consistently) passes the copy joins and refuses here.
# The static stand-in for Storage's sealed custody is Plans/ds15_original_custody.json,
# installed at composition (load_original_custody); the case under check never adds to
# it, and no request field selects a recipe (the original-evidence carrier is closed).
# Native custody, installation and durability are NOT_RUN.
# ---------------------------------------------------------------------------
DS15_SERVER = 'ds15-static-oracle'
INSTALLED_RECIPES = (V1,)
RECIPE_FULL_VALUE = 'pm.storage.original_event_value_commitment.v1'
RECIPE_PRODUCER = 'cv317-producer-semantic-jcs-exact-integer-digits'
RECIPE_LOCAL_SOURCE = ('ds15 project identity: canonical MessagePack [event_type, family_revision, scope, identity fields]; '
                       'application scope: application@1 from owner.browser.transition.application@1.0.0')
RECIPE_PAYLOAD = 'ds15 inline EVENT_VALUE payload; SP-337 payload reference over 16384 bytes'
FROZEN_RESOURCES = ('Plans/event_record.schema.json', 'Plans/event_append_receipt_contracts.schema.json',
                    'Plans/application_workflow_sources.schema.json', 'Plans/ds15_integer_domain.schema.json')


@lru_cache(maxsize=None)
def recipe_resource_manifest(payload_schema_ref, context_schema_ref):
    """SHA-256 of the frozen resources a DS15 recipe tuple pins (exact file bytes, in order)."""
    rows = [[path, hashlib.sha256((ROOT / path).read_bytes()).hexdigest()]
            for path in (*FROZEN_RESOURCES, payload_schema_ref, context_schema_ref)]
    return hashlib.sha256(json.dumps(rows, separators=(',', ':')).encode('ascii')).hexdigest()


def context_schema_ref(c):
    deck2 = c['event_type'] in {r['event_type'] for r in read('Plans/ds15_deck2_contracts.json')}
    return 'Plans/ds15_deck2_context.schema.json' if deck2 else 'Plans/ds15_authority_context.schema.json'


def recipe_tuple(c, write_recipe, manifest):
    """The write-time recipe tuple of a DS15 original of family c."""
    payload_schema = read(c['payload_schema_ref'])
    return RecipeTuple(
        envelope_schema_id='pm.event.v0', envelope_schema_version='2.0.0',
        payload_schema_id=payload_schema['$id'], payload_schema_version=c['family_revision'],
        owner_source_id=c['semantic_owner'], owner_edition=c['family_revision'],
        registry_revision='prepared_without_admission', identity_recipe=write_recipe, producer_recipe=RECIPE_PRODUCER,
        physical_profile=EVENT_VALUE, full_value_profile=RECIPE_FULL_VALUE, local_source_profile=RECIPE_LOCAL_SOURCE,
        payload_profile=RECIPE_PAYLOAD, resource_manifest_sha256=manifest)


@lru_cache(maxsize=1)
def original_custody():
    """Composition: Storage's sealed write custody (static stand-in), loaded once, never from request data."""
    raw = read('Plans/ds15_original_custody.json')
    sealed = {}
    for entry in raw['sealed_originals']:
        binding = OriginalBinding(**entry['binding'])
        sealed.setdefault((binding.storage_instance_id, entry['original_ref']), []).append(
            (binding, entry['event_type'], entry['write_recipe']))
    return {'stores': raw['stores'], 'manifests': raw['resource_manifests'], 'sealed': sealed}


@lru_cache(maxsize=None)
def contract_of(event_type):
    for manifest in ('Plans/ds15_event_contracts.json', 'Plans/ds15_deck2_contracts.json'):
        for c in read(manifest):
            if c['event_type'] == event_type:
                return c
    return None


def frozen_verifier(c, write_recipe):
    """The frozen verifier of one installed DS15 recipe tuple: recompute the original from its sealed bytes
    under that recipe (editions, family, payload join, commitment, producer digest, identity); no current
    writer gate and no live state."""
    def verify(custody):
        event = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
        result = decode_storage_value(custody.result_bytes, profile=EVENT_VALUE)
        binding, frozen = custody.binding, custody.recipe
        if type(event) is not dict or type(result) is not dict or set(result) != {'payload', 'application_source'}:
            return False
        if (event.get('schema_id'), event.get('schema_version'), event.get('payload_schema_id'), event.get('event_type')) != (
                frozen.envelope_schema_id, frozen.envelope_schema_version, frozen.payload_schema_id, c['event_type']):
            return False
        if not (same(event.get('payload'), result['payload']) or (event.get('payload_ref') is not None and event.get('payload') == {})):
            return False
        if not recipe_numbers_ok(write_recipe, event) or refusal_reason(full_value_commitment, event) is not None:
            return False
        if full_value_commitment(event) != binding.source_commitment or recipe_producer_digest(write_recipe, event) is None:
            return False
        source = result['application_source']
        if event.get('scope_kind') == 'application':
            if type(source) is not dict or type(source.get('server_id')) is not str or type(source.get('original_operation_id')) is not str:
                return False
            key = 'application@1:{}:{}'.format(source['server_id'].encode().hex(), source['original_operation_id'].encode().hex())
        else:
            payload = result['payload']
            scope = [payload.get('project_id')] if c['scope_policy'] == 'project_only' else [payload.get('scope')]
            parts = [c['event_type'], c['family_revision'], *scope] + [payload.get(k) for k in c['identity_fields']]
            if physical_size(parts) is None:
                return False
            key = hashlib.sha256(storage_value_bytes(parts, profile=EVENT_VALUE)).hexdigest()
        return key == event.get('idempotency_key') == binding.idempotency_key
    return FrozenRecipe(verify)


@lru_cache(maxsize=1)
def installed_recipes():
    """Composition: the exact tuple -> FrozenRecipe map, built from this head's resources outside request data."""
    out = {}
    for manifest in ('Plans/ds15_event_contracts.json', 'Plans/ds15_deck2_contracts.json'):
        for c in read(manifest):
            for write_recipe in INSTALLED_RECIPES:
                tuple_ = recipe_tuple(c, write_recipe, recipe_resource_manifest(c['payload_schema_ref'], context_schema_ref(c)))
                out[tuple_] = frozen_verifier(c, write_recipe)
    return out


class DS15OriginalOwner:
    """The sealed original custody of the Storage instance read (static stand-in). At one original ref it
    authenticates the bytes the reader fetched against what that instance sealed at write time (the sealed
    CV-339 commitment) and returns them with the sealed binding and write-time recipe tuple."""

    def __init__(self, storage_instance_id, record_bytes, result_bytes, receipt_bytes, commitment_sha256):
        self.storage_instance_id = storage_instance_id
        self.record_bytes, self.result_bytes, self.receipt_bytes = record_bytes, result_bytes, receipt_bytes
        self.commitment_sha256 = commitment_sha256

    def authenticated_original(self, original_ref):
        custody = original_custody()
        sealed = custody['sealed'].get((self.storage_instance_id, original_ref))
        if not sealed:
            raise Refusal('original_query')
        matches = [entry for entry in sealed if entry[0].source_commitment == self.commitment_sha256]
        if not matches:
            raise Refusal('original_authority')
        if len(matches) != 1:
            raise Refusal('original_ambiguous')
        binding, event_type, write_recipe = matches[0]
        c = contract_of(event_type)
        if c is None:
            raise Refusal('original_authority')
        tuple_ = recipe_tuple(c, write_recipe, custody['manifests'][event_type])
        return OriginalCustody(binding, tuple_, self.record_bytes, self.result_bytes, self.receipt_bytes)


def select_original_recipe(c, d):
    """Table rd_recipe: (frozen recipe, None) or (None, refusing row). One selection, from sealed custody."""
    custody = original_custody()
    store = custody['stores'].get(d['storage_instance_id'])
    sealed = isinstance(store, dict) and c['event_type'] in store['families']
    tuple_ = (recipe_tuple(c, store['write_recipe'], custody['manifests'][c['event_type']])
              if sealed and c['event_type'] in custody['manifests'] else None)
    installed = (tuple_ in installed_recipes()) if sealed else None
    first = refusal('rd_recipe', {'custody_store': sealed, 'recipe_installed': installed})
    if first is not None:
        return None, first[0]
    return tuple_.identity_recipe, None


def original_bytes(d):
    """The original as the reader fetched it: record, owner result (payload and accepted source) and receipt."""
    original = d['original']
    source = original.get('application_source')
    record = storage_value_bytes(original['event'], profile=EVENT_VALUE)
    result = storage_value_bytes({'payload': original['payload'], 'application_source': source}, profile=EVENT_VALUE)
    receipt = storage_value_bytes(d['receipt'], profile=EVENT_VALUE) if d.get('receipt') is not None else b''
    return record, result, receipt


def resolve_refusal(d):
    """The RetainedDispatcher resolution of the retained original: its refusal reason, or None. Never raises."""
    try:
        event = d['original']['event']
        record, result, receipt = original_bytes(d)
        sha = full_value_commitment(event)
        expected = OriginalBinding(
            storage_instance_id=d['storage_instance_id'], scope_kind=event['scope_kind'], server_id=DS15_SERVER,
            project_id=event['project_id'], event_type=event['event_type'], event_id=event['event_id'],
            idempotency_key=event['idempotency_key'], owner_operation_id=event['correlation_id'], source_commitment=sha)
        RetainedDispatcher(DS15OriginalOwner(d['storage_instance_id'], record, result, receipt, sha),
                           installed_recipes()).resolve(
            event['event_id'], expected, disclose=lambda binding: True)
    except Refusal as exc:
        return exc.reason
    except (KeyError, TypeError, AttributeError, ValueError):
        return 'original_binding'
    return None


def resolve_original(d):
    """Table rd_resolve (and its entailed follower): True when the retained original resolves."""
    return not refused('rd_resolve', dispatch_refusal=resolve_refusal(d))


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


AUTHORITY_BOOLEANS = frozenset({
    'owner_command_authorized', 'config_inspected', 'committed', 'visible_dependency_available', 'thread_writable',
    'auto_send', 'managed_outcome_committed', 'managed_resources_settled', 'dap_owner_verified',
    'rewrite_terminal_history', 'runtime_verified', 'restored_live_claim', 'refreshable', 'refresh_committed',
    'backup_closure_verified', 'permission_now', 'source_deleted_now', 'share_current', 'reader_withdrawn',
    'receipt_retained', 'retained_prefix_complete', 'verified', 'backup_verified', 'protected_auth'})
AUTHORITY_INTEGERS = frozenset({
    'previous_revision', 'admitted_sequence', 'withdrawal_frontier', 'sequence', 'sequence_id',
    'producer_sequence_id', 'first_sequence', 'last_sequence', 'scan_low', 'scan_high', 'selected_high',
    'through_sequence_id', 'generation', 'revision', 'frontier_revision', 'manifest_generation', 'recovery_epoch',
    'selected_segment_generation', 'byte_offset', 'durable_end_offset'})


def authority_facts(value):
    """Counts of named authority keys whose value has the wrong exact type, anywhere in value."""
    facts = {'boolean_violations': 0, 'integer_type_violations': 0, 'integer_range_violations': 0}
    stack = [value]
    while stack:
        node = stack.pop()
        if isinstance(node, dict):
            for k, v in node.items():
                if k in AUTHORITY_BOOLEANS:
                    if refusal_reason(exact_boolean, v) is not None:
                        facts['boolean_violations'] += 1
                elif k in AUTHORITY_INTEGERS and not (k == 'admitted_sequence' and v is None):
                    reason = refusal_reason(lambda x: current_integer(x, minimum=0), v)
                    if reason == 'integer_type':
                        facts['integer_type_violations'] += 1
                    elif reason is not None:
                        facts['integer_range_violations'] += 1
                stack.append(v)
        elif isinstance(node, list):
            stack.extend(node)
    return facts


def authority_types_ok(value):
    """Exact types precede every boolean/numeric authority interpretation."""
    return not refused('authority_types', **authority_facts(value))


def context_types_ok(c, value, retained=False, recipe=CURRENT):
    complete = read('Plans/ds15_authority_context.schema.json')
    validator(complete)
    schema = complete['$defs'][c['event_type']]
    if retained:
        schema = dict(schema, required=['scope', 'owner_command_authorized'])
    phase = 'sch_context_v1' if recipe == V1 else 'sch_context_retained' if retained else 'sch_context'
    return not schema_refused(phase, validator(schema, recipe), value)


def app_hash(record):
    """CV-366 closed accepted-source preimage; physical bytes are separate."""
    return _app.semantic_hash('accepted_source', {
        'schema_id': record['schema_id'], 'schema_version': record['schema_version'],
        'scope': record['scope'], 'record': record,
        'identity': {'server_id': record['scope']['server_id'],
                     'original_operation_id': record.get('original_operation_id'),
                     'workspace_id': record.get('workspace_id')}})


def owner_record_text(d, source):
    """(refused, record): the owner bank text for accepted_source_ref, parsed (bs_bytes rows)."""
    raw = d['browser_owner_records'].get(source['accepted_source_ref'])
    parse_refusal = record = None
    if type(raw) is str:
        try:
            record = parse_owner_json(raw)
        except (ValueError, UnicodeError) as exc:
            parse_refusal = getattr(exc, 'reason', type(exc).__name__)
    return refused('bs_bytes', raw_type=kind(raw), parse_refusal=parse_refusal), record


def browser_source_ok(d, source):
    # The bank represents the existing owner's retained record bytes, resolved
    # by accepted_source_ref, independently of either observation of the source.
    refusal_found, record = owner_record_text(d, source)
    if refusal_found:
        return False
    if schema_refused('sch_owner_record', validator(read('Plans/ds15_browser_owner_record.schema.json')), record):
        return False
    unsigned = {k: v for k, v in source.items() if k != 'source_sha256'}
    if refused('bs_digests', accepted_source_sha256=source['accepted_source_sha256'], record_hash=app_hash(record),
               source_sha256=source['source_sha256'], unsigned_hash=app_hash(unsigned),
               original_input_semantic_sha256=source['original_input_semantic_sha256'],
               input_hash=app_hash(source['original_input']),
               original_output_semantic_sha256=source['original_output_semantic_sha256'],
               output_hash=app_hash(source['original_output'])):
        return False
    evidence = {'schema_id': 'pm.fixture.owner_evidence.v1', 'schema_version': '1.0.0',
                'owner_ref': record['interface_id'], 'source_ref': source['accepted_source_ref'],
                'source_sha256': app_hash(record), 'revision': 1, 'generation': 1}
    p = d['payload']
    if refused('bs_joins', record_scope=record['scope'], source_scope=source['scope'],
               record_storage_instance_id=record['storage_instance_id'],
               source_storage_instance_id=source['storage_instance_id'],
               record_original_operation_id=record['original_operation_id'],
               source_original_operation_id=source['original_operation_id'],
               record_interface_id=record['interface_id'], source_interface_id=source['interface_id'],
               record_thread_id=record['thread_id'], source_thread_id=source['thread_id'],
               record_capture=tx(record['capture']), payload=tx(p)):
        return False
    for key in ('original_input', 'original_output'):
        original = source[key]
        side = key.split('_', 1)[1]
        if refused('bs_' + side + '_body', body={k: v for k, v in original.items() if k != 'controller_evidence'},
                   record_body=record[key + '_body']):
            return False
        if refused('bs_' + side, scope=original['scope'], record_scope=record['scope'],
                   profile_id=original['profile_id'], record_profile_id=record['profile_id'],
                   workspace_id=original['workspace_id'], record_workspace_id=record['workspace_id'],
                   browser_session_id=p['browser_session_id'], session_refs=original['session_refs'],
                   transition_source_ref=original['transition_source_ref'],
                   accepted_source_ref=source['accepted_source_ref'],
                   controller_evidence=original['controller_evidence'], expected_evidence=evidence):
            return False
    stages = list(source['stage_custody'].values())
    return not refused('bs_stages', stage_statuses=[s['status'] for s in stages],
                       stage_operations=[s['original_operation_id'] for s in stages],
                       record_original_operation_id=record['original_operation_id'],
                       stage_methods=[s['owner_method_id'] for s in stages], record_interface_id=record['interface_id'],
                       stage_requests=[s['request_ref'] for s in stages], record_request_ref=record['request_ref'],
                       stage_results=[s['result_ref'] for s in stages], record_result_ref=record['result_ref'],
                       stage_evidence=[s['custody_evidence'] for s in stages], expected_evidence=evidence)


def partition_of(scope_kind, project_id):
    try:
        return _codec.scope_partition(scope_kind, project_id)
    except AssertionError:
        return None


def application_source_refused(d, source):
    return refused('env_app_browser_a', source_present=application_source_present(source), source=source,
                   original_source=d['original']['application_source'])


def original_output_refused(source):
    return refused('env_app_browser_c', output_present=original_output_present(source['original_output']))


def envelope_ok(c, d, original_recipe, retry=True, historical=False, append=False):
    e, original = d['envelope'], d['original']['event']
    scope = d['context']['scope']
    # A historical read sees the retained original itself; the original is always retained. Both are read
    # with the frozen recipe the sealed custody selected (select_original_recipe), never an implicit one.
    recipe = original_recipe if historical else CURRENT
    if schema_refused('sch_envelope_v1' if historical else 'sch_envelope',
                      validator(read('Plans/event_record.schema.json'), recipe), e):
        return False
    if schema_refused('sch_original_event', validator(read('Plans/event_record.schema.json'), original_recipe), original):
        return False
    if refused('env_dispatch', event_type=e['event_type'], family_event_type=c['event_type'],
               historical=historical, envelope_policy=e['replay_policy'], original_policy=original['replay_policy']):
        return False
    if refused('env_dispatch_entailed',
               event_type_fullmatch=re.fullmatch(r'[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+', e['event_type']) is not None):
        return False
    p = d['payload']
    if refused('env_scope', scope_kind=e['scope_kind'],
               expected_scope_kind='application' if scope['kind'] == 'app' else 'project',
               project_id=e['project_id'], scope_project_id=scope['project_id'],
               envelope_payload=tx(e['payload']), payload=tx(p),
               scope=scope, payload_scope=p.get('scope', {'kind': 'project', 'project_id': p.get('project_id')}),
               run_id=e['run_id'], payload_run_id=p.get('run_id'), thread_id=e['thread_id'],
               payload_thread_id=p.get('thread_id'), payload_schema_id=e['payload_schema_id'],
               family_payload_schema_id=read(c['payload_schema_ref'])['$id']):
        return False
    if refused('env_storage', scope_partition=d['scope_partition'],
               expected_partition=partition_of(e['scope_kind'], e['project_id']), payload_size=physical_size(e['payload'])):
        return False
    # CV-1100 producer route: a new append qualifies its full CV-317 projection before effects.
    if append and refused('env_producer', producer_refusal=producer_refusal(e)):
        return False
    # The retry equality domain excludes only Storage-assigned metadata. Full original
    # value custody below independently commits those original metadata fields too.
    if retry and refused('env_retry', event_id=e['event_id'], original_event_id=original['event_id'],
                         candidate_digest=recipe_producer_digest(original_recipe, e),
                         original_digest=recipe_producer_digest(original_recipe, original)):
        return False
    source = d.get('application_source')
    if scope['kind'] == 'app' and c['event_type'].startswith('catalog.install.'):
        source_object = isinstance(source, dict)
        keys = sorted(source) if source_object else None
        exact = keys == ['original_operation_id', 'server_id']
        types = [kind(source[k]) for k in keys] if exact else None
        texts = types == ['str', 'str']
        if refused('env_app_install_a', source_object=source_object, source_keys=keys, source_types=types,
                   source_lengths=[len(source[k]) for k in keys] if texts else None,
                   source_lf=['\n' in source[k] for k in keys] if texts else None):
            return False
        if refused('env_app_install_b', source=source, original_source=d['original']['application_source'],
                   source_operation=source['original_operation_id'], payload_operation=d['payload'].get('operation_id')):
            return False
    elif scope['kind'] == 'app':
        if application_source_refused(d, source):
            return False
        if schema_refused('sch_app_source', application_source_validator(), source):
            return False
        if refused('env_app_browser_b', schema_id=source['schema_id'], interface_id=source['interface_id'],
                   storage_instance_id=source['storage_instance_id'], expected_storage_instance_id=d['storage_instance_id'],
                   thread_id=source['thread_id'], envelope_thread_id=e['thread_id'],
                   scope_kind=source['scope']['scope_kind'], scope_project_id=source['scope']['project_id'],
                   scope_server_id=source['scope']['server_id'], server_id=source['server_id']):
            return False
        if original_output_refused(source):
            return False
        if not browser_source_ok(d, source):
            return False
        # The payload BrowserSession in original_output.session_refs is BS24 (bs_output), on this same path.
        if refused('env_app_browser_d', profile_id=source['original_output']['profile_id'],
                   scope_profile_id=scope['profile_id']):
            return False
        if refused('env_app_browser_entailed',
                   stage_operations=[s['original_operation_id'] for s in source['stage_custody'].values()],
                   original_operation_id=source['original_operation_id']):
            return False
        if refused('env_app_browser_e',
                   identity_text_ok=all([isinstance(source.get(k), str) and 0 < len(source[k]) <= 256 and '\n' not in source[k]
                                         for k in ('server_id', 'original_operation_id')])):
            return False
    return not refused('env_identity', idempotency_key=e['idempotency_key'],
                       expected_key=identity(c, e['payload'], source, recipe))


def receipt_ok(d, recipe):
    r, custody, result, event = d['receipt'], d['custody'], d['issued_result'], d['original']['event']
    if not (shared_valid('AppendReceipt', r, recipe) and shared_valid('custody_v2', custody, recipe)
            and shared_valid('full_value_result', result, recipe)):
        return False
    if refused('rc_copies', receipt=r, custody_receipt=custody['first_append_receipt'],
               result_receipt=result['first_append_receipt'], receipt_event_id=r['event_id'], event_id=event['event_id'],
               receipt_sequence_id=r['sequence_id'], event_sequence_id=event['sequence_id'],
               byte_offset=r['byte_offset'], durable_end_offset=r['durable_end_offset']):
        return False
    if refused('rc_commitment_copies', custody_commitment=custody['original_event_value_commitment'],
               result_commitment=result['original_event_value_commitment']):
        return False
    if refused('rc_commitment', result_commitment=result['original_event_value_commitment'],
               expected_commitment=commitment(event, recipe)):
        return False
    return not refused('rc_custody', custody_segment_ref=custody['original_segment_ref'],
                       result_segment_ref=result['original_segment_ref'],
                       custody_storage_instance_id=custody['storage_instance_id'], storage_instance_id=d['storage_instance_id'],
                       custody_scope_partition=custody['scope_partition'], scope_partition=d['scope_partition'],
                       custody_event_id=custody['event_id'], event_id=event['event_id'],
                       custody_event_type=custody['event_type'], event_type=event['event_type'],
                       custody_idempotency_key=custody['idempotency_key'], idempotency_key=event['idempotency_key'],
                       custody_producer_digest=custody['producer_semantic_digest'],
                       original_producer_digest=recipe_producer_digest(recipe, event))


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
    return not schema_refused('sch_evidence', validator(schema), d)


def admission_refused(d):
    admitted = d['admitted_sequence']
    present = admission_present(admitted)
    return refused('wd_gate', admitted_present=present,
                   admitted_refusal=refusal_reason(storage_uint64, admitted) if present else None,
                   frontier_refusal=refusal_reason(storage_uint64, d['withdrawal_frontier']) if present else None,
                   admitted_sequence=admitted, withdrawal_frontier=d['withdrawal_frontier'])


def admission_numbers_ok(admitted, frontier):
    """SP-1100 Storage sequences: storage_uint64 on both (the wd_gate rows)."""
    return not admission_refused({'admitted_sequence': admitted, 'withdrawal_frontier': frontier})


def index_inputs_ok(d):
    return not schema_refused('sch_index_inputs', validator(read('Plans/ds15_index_inputs.schema.json')),
                              {'source': d['selected_source'], 'rows': d['index_rows']})


def checkpoint_value_ok(c, cp):
    if schema_refused('sch_checkpoint', validator(read(c['checkpoint_schema_ref'])), cp):
        return False
    return not refused('cp_size', size=physical_size(cp))


def token_matches_storage(token, storage_instance_id):
    key = 'event_record_index_checkpoint.v1:' + storage_instance_id
    return not refused('tk_storage', token_storage_instance_id=token['storage_instance_id'],
                       selection_storage_instance_id=token['source_selection']['storage_instance_id'],
                       storage_instance_id=storage_instance_id, checkpoint_key=token['checkpoint_key'], expected_key=key,
                       checkpoint_ref=token['checkpoint_ref'], expected_ref=key + '#/generations/' + token['generation_id'],
                       index_dataset_name=token['index_dataset_name'],
                       expected_dataset='event_record_index.v2@' + token['generation_id'])


def owner_text(c):
    path, uid = c['semantic_owner'].split('#')
    text = (ROOT / path).read_text()
    start = text.index('### ' + uid + ' ')
    end = text.find('\n### ', start + 1)
    unit = text[start:end if end != -1 else len(text)]
    return yaml.safe_load(unit.split('```yaml\n', 1)[1].split('\n```', 1)[0])['canonical_text']


def unsafe_refs(value):
    """Payload strings that are absolute paths, token-shaped or forbidden refs (lane debug owner patterns)."""
    found = []
    stack = [value]
    while stack:
        node = stack.pop()
        if isinstance(node, str):
            if (_debug.ABSOLUTE_PATH_RE.search(node) or _debug.TOKEN_SHAPED_RE.search(node)
                    or _debug.FORBIDDEN_REF_RE.search(node)):
                found.append(node)
        elif isinstance(node, dict):
            stack.extend(node.values())
    return sorted(found)


DEV_TRANSITIONS = {'dev.session.started': (['created', 'restarting'], 'running'),
                   'dev.session.restarting': (['running', 'stopped'], 'restarting'),
                   'dev.session.stopping': (['running', 'restarting'], 'stopping'),
                   'dev.session.stopped': (['running', 'restarting', 'stopping'], 'stopped')}


def transition_refused(n, p, x, scope):
    """The family transition rows of the sixteen DS15 families."""
    if n in ('catalog.install.started', 'catalog.install.completed'):
        return refused('tr_catalog_install', catalog_outcome_committed=x['catalog_outcome_committed'],
                       catalog_owner_payload=tx(x['catalog_owner_payload']), payload=tx(p),
                       catalog_phase=x['catalog_phase'], payload_phase=p['phase'], family_phase=n.rsplit('.', 1)[1])
    if n == 'doctor.custom_headless.checked':
        return refused('tr_doctor', config_inspected=x['config_inspected'], doctor_invocation_id=x['doctor_invocation_id'],
                       payload_doctor_invocation_id=p['doctor_invocation_id'])
    if n == 'live.session.started':
        return refused('tr_live_started', launch_outcome=x['launch_outcome'], driver_session_id=x['driver_session_id'],
                       payload_session_id=p['session_id'])
    if n == 'live.step.updated':
        return refused('tr_live_step', session_state=x['session_state'], step_revision=p['step_revision'],
                       previous_revision=x['previous_revision'])
    if n == 'live.artifact.created':
        artifact = x['artifact']
        return refused('tr_live_artifact', artifact_id=artifact['id'], payload_artifact_id=p['artifact_id'],
                       artifact_ref=artifact['ref'], payload_artifact_ref=p['artifact_ref'],
                       artifact_receipt_ref=artifact['receipt_ref'], payload_artifact_receipt_ref=p['artifact_receipt_ref'],
                       artifact_committed=artifact['committed'])
    if n == 'live.session.completed':
        final = x['finalization']
        return refused('tr_live_completed', session_state=x['session_state'], finalization_committed=final['committed'],
                       manifest_ref=final['manifest_ref'], payload_manifest_ref=p['manifest_ref'],
                       summary_ref=final['summary_ref'], payload_summary_ref=p['summary_ref'],
                       checks_ref=final['checks_ref'], payload_checks_ref=p['checks_ref'])
    if n == 'live.session.degraded':
        return refused('tr_live_degraded', degradation_revision=p['degradation_revision'],
                       previous_revision=x['previous_revision'],
                       visible_dependency_available=x['visible_dependency_available'], launch_outcome=x['launch_outcome'],
                       expected_launch_outcome='refused' if p['requested_visual_mode'] == 'forced_visible' else 'headless')
    if n == 'browser.context_captured':
        chip = x['chip']
        return (refused('tr_browser_a', target_resolution=x['target_resolution'],
                        payload_target_resolution=p['target_resolution'], resolved_thread_id=x['resolved_thread_id'],
                        payload_thread_id=p['thread_id'], thread_writable=x['thread_writable'],
                        thread_scope=x['thread_scope'], scope=scope, auto_send=x['auto_send'])
                or refused('tr_browser_b', chip_id=chip['chip_id'], payload_chip_id=p['chip_id'],
                           chip_thread_id=chip['thread_id'], payload_thread_id=p['thread_id'],
                           attachment_type=chip['attachment_type'], payload_attachment_type=p['attachment_type'],
                           source_ref=chip['source_ref'], payload_source_ref=p['source_ref'], chip_committed=chip['committed'],
                           chip_status=chip['status'], payload_capture_status=p['capture_status'],
                           provenance_ref=chip['provenance_ref'], payload_provenance_ref=p['provenance_ref']))
    if n.startswith('dev.session.'):
        before, after = DEV_TRANSITIONS[n]
        links = x['links']
        return (refused('tr_dev_a', previous_state=p['previous_state'], permitted_before=before,
                        workflow_state=p['workflow_state'], family_state=after,
                        context_workflow_state=x['workflow_state'], workflow_revision=p['workflow_revision'],
                        previous_revision=x['previous_revision'], dev_session_id=x['dev_session_id'],
                        payload_dev_session_id=p['dev_session_id'], managed_outcome_committed=x['managed_outcome_committed'],
                        operation_id=x['operation_id'], payload_operation_id=p['operation_id'])
                or refused('tr_dev_b', family=n, launch_outcome=x.get('launch_outcome'),
                           managed_resources_settled=x.get('managed_resources_settled'),
                           dap_state_after=x['dap_state_after'], dap_state_before=x['dap_state_before'],
                           dap_transition_ref=x['dap_transition_ref'], dap_owner_verified=x['dap_owner_verified'],
                           rewrite_terminal_history=x['rewrite_terminal_history'])
                or refused('tr_dev_links', **{k: p.get(k) for k in
                                              ('run_id', 'thread_id', 'workspace_tab_id', 'terminal_session_id', 'dap_session_id')},
                           **{'link_' + k: links.get(k) for k in
                              ('run_id', 'thread_id', 'workspace_tab_id', 'terminal_session_id', 'dap_session_id')}))
    if n.startswith('preview.session.'):
        if refused('tr_preview_a', preview_subject_id=x['preview_subject_id'],
                   payload_preview_subject_id=p['preview_subject_id'], preview_session_id=x['preview_session_id'],
                   payload_preview_session_id=p['preview_session_id'], source_revision=x['source_revision'],
                   payload_source_revision=p['source_revision'], runtime_verified=x['runtime_verified'],
                   restored_live_claim=x['restored_live_claim']):
            return True
        if n != 'preview.session.refreshed':
            return refused('tr_preview_b', family=n, session_state=x['session_state'], runtime_state=p['runtime_state'],
                           managed_resources_settled=x.get('managed_resources_settled')
                           if n == 'preview.session.stopped' else None)
        return (refused('tr_preview_c', session_state=x['session_state'], refreshable=x['refreshable'],
                        refresh_committed=x['refresh_committed'], preview_revision=p['preview_revision'],
                        previous_revision=x['previous_revision'])
                or refused('tr_preview_origin', refresh_origin=p['refresh_origin'],
                           payload_browser_session_id=p.get('browser_session_id'),
                           browser_session_id=x['browser_session_id']
                           if p['refresh_origin'] == 'cmd.browser.reload' and p.get('browser_session_id') else None))
    raise AssertionError('Missing per-family transition oracle: ' + n)


def payload_ok(c, p, x, payload_recipe=CURRENT, context_recipe=CURRENT):
    if not context_types_ok(c, x, recipe=context_recipe) or not authority_types_ok(x):
        return False
    if schema_refused('sch_payload_v1' if payload_recipe == V1 else 'sch_payload',
                      validator(read(c['payload_schema_ref']), payload_recipe), p):
        return False
    scope = p.get('scope', {'kind': 'project', 'project_id': p.get('project_id')})
    if refused('pl_gate', owner_command_authorized=x['owner_command_authorized'], unsafe_refs=unsafe_refs(p),
               context_scope=x['scope'], payload_scope=scope, envelope_project_id=x['envelope_project_id'],
               scope_project_id=scope.get('project_id'), payload_run_id=p.get('run_id'), envelope_run_id=x['envelope_run_id'],
               has_browser_session=bool(p.get('browser_session_id')),
               session_security_class=x['session_security_class'] if p.get('browser_session_id') else None):
        return False
    return not transition_refused(c['event_type'], p, x, scope)


UNAVAILABLE = {'result': 'UNAVAILABLE', 'effects': 0}


def refuse():
    return {'result': 'REFUSE', 'effects': 0}


def selected_recipe(c, op, d):
    """(frozen recipe, None) or (None, result): SP-1101 selection before the original is read (rd_recipe).

    Missing sealed custody is the existing unavailable contract (UNAVAILABLE for a read, as for the reader
    rows; a refusal elsewhere); an uninstalled recipe tuple refuses. Neither falls back to another recipe.
    """
    recipe, row = select_original_recipe(c, d)
    if recipe is None:
        return None, (dict(UNAVAILABLE) if op == 'read' and row == 'SX01_custody_store' else refuse())
    return recipe, None


def outcome_refused(d):
    out = d['outcome']
    present = outcome_present(out)
    return refused('ev_outcome', outcome_present=present, outcome_committed=out['committed'] if present else None,
                   backup_closure_verified=d['backup_closure_verified'])


def evaluate(c, op, d):
    """Normative reference model over concrete source/receipt/index values."""
    input_object = isinstance(d, dict)
    if refused('ev_input', input_object=input_object,
               context_object=isinstance(d.get('context'), dict) if input_object else None,
               payload_object=isinstance(d.get('payload'), dict) if input_object else None):
        return refuse()
    p, x = d['payload'], d['context']
    if not authority_types_ok(d):
        return refuse()
    # Boundary oracles deliberately exercise the adopted EventRecord contract
    # separately from the stricter, bounded family metadata schemas. They do
    # not authorize a family append or introduce a large-inline payload field.
    if op == 'envelope_boundary':
        if not original_evidence_ok(op, d):
            return refuse()
        recipe, result = selected_recipe(c, op, d)
        if result is not None:
            return result
        return {'result': 'ACCEPT' if envelope_ok(c, d, recipe, retry=False, append=True) else 'REFUSE', 'effects': 0}
    if op == 'checkpoint_boundary':
        return {'result': 'ACCEPT' if checkpoint_value_ok(c, d.get('checkpoint')) else 'REFUSE', 'effects': 0}
    if op == 'receipt_boundary':
        if not original_evidence_ok(op, d):
            return refuse()
        recipe, result = selected_recipe(c, op, d)
        if result is not None:
            return result
        if schema_refused('sch_original_event', validator(read('Plans/event_record.schema.json'), recipe),
                          d['original']['event']):
            return refuse()
        return {'result': 'ACCEPT' if receipt_ok(d, recipe) and resolve_original(d) else 'REFUSE', 'effects': 0}
    if op == 'event_schema':
        valid = not schema_refused('sch_envelope', validator(read('Plans/event_record.schema.json')), d.get('envelope'))
        return {'result': 'ACCEPT' if valid else 'REFUSE', 'effects': 0}
    if not original_evidence_ok(op, d):
        return refuse()
    if op in ('payload', 'recover', 'publish', 'withdraw_writer'):
        if refused('replay_only', envelope_policy=d['envelope'].get('replay_policy'),
                   original_policy=d['original']['event'].get('replay_policy'), carrier_policy=d.get('replay_policy'),
                   context_policy=x.get('replay_policy'), context_envelope_policy=x.get('envelope_replay_policy')):
            return {'result': 'REFUSE', 'effects': 0, 'error': 'replay_only_not_appendable'}
    if op == 'payload':
        if not payload_ok(c, p, x):
            return refuse()
        recipe, result = selected_recipe(c, op, d)
        if result is not None:
            return result
        return {'result': 'ACCEPT' if envelope_ok(c, d, recipe, retry=False, append=True) else 'REFUSE', 'effects': 0}
    if op in ('recover', 'publish', 'read', 'checkpoint', 'rebuild'):
        o, r, out = d['original'], d['receipt'], d['outcome']
        if outcome_refused(d):
            return dict(UNAVAILABLE)
        # SP-1101: one selection from the sealed write custody before the original is read.
        recipe, result = selected_recipe(c, op, d)
        if result is not None:
            return result
        if refused('ev_outcome_domain', outcome_v1_domain=recipe_numbers_ok(recipe, out)):
            return refuse()
        if not payload_ok(c, o['payload'], d['original_context'], recipe, recipe):
            return refuse()
        if refused('ev_original_copies', payload=tx(p), original_payload=tx(o['payload']), outcome_payload=tx(out['payload'])):
            return refuse()
        if not envelope_ok(c, d, recipe, historical=op in ('read', 'checkpoint', 'rebuild'), append=op == 'recover' and r is None):
            return refuse()
        if (refused('ev_original_ids', outcome_event_id=out['event_id'], original_event_id=o['event_id'],
                    event_event_id=o['event']['event_id'], original_key=o['idempotency_key'],
                    event_key=o['event']['idempotency_key'])
                or refused('ev_original_ids_entailed', event_payload=tx(o['event']['payload']),
                           original_payload=tx(o['payload']))):
            return refuse()
        if refused('ev_outcome_ref', payload_outcome_ref=p.get('outcome_ref', out['source_ref']),
                   outcome_source_ref=out['source_ref']):
            return refuse()
        # Original transition/source validity was checked against original_context
        # above. Retained reads and receipt recovery survive later state changes.
        # New append recovery and publication still require the current joins.
        if (op == 'publish' or (op == 'recover' and r is None)) and not payload_ok(c, o['payload'], x, recipe, CURRENT):
            return refuse()
        if op in ('read', 'checkpoint', 'rebuild') and refused('ev_reader', reader_withdrawn=d['reader_withdrawn'],
                                                                reader_installed=d['reader_installed'],
                                                                consumer=c['consumer']):
            return dict(UNAVAILABLE) if op == 'read' else refuse()
        if op in ('publish', 'read', 'checkpoint', 'rebuild') and (
                refused('ev_disclosure', permission_now=d['permission_now'], source_deleted_now=d['source_deleted_now'],
                        share_current=d['share_current'])
                or not context_types_ok(c, x, retained=op in ('read', 'checkpoint', 'rebuild'))
                or refused('ev_disclosure_owner', owner_command_authorized=x['owner_command_authorized'])):
            return dict(UNAVAILABLE) if op == 'read' else refuse()
        if r is None:
            # SP-1101: the original resolves through the sealed original owner before any outcome.
            if not resolve_original(d):
                return refuse()
            if op == 'recover':
                if refused('ev_append_recovery', permission_now=d['permission_now'],
                           source_deleted_now=d['source_deleted_now'], share_current=d['share_current']):
                    return refuse()
                return {'result': 'APPEND_ORIGINAL', 'effects': 0, 'event_id': o['event_id']}
            refused('ev_receipt_pending', receipt_present=False)
            return {'result': 'PENDING', 'effects': 0, 'event_id': o['event_id']}
        if op != 'recover':
            refused('ev_receipt_pending', receipt_present=True)
        if not receipt_ok(d, recipe):
            return refuse()
        # SP-1101: after the frozen-recipe checks, the original resolves once through the sealed owner.
        if not resolve_original(d):
            return refuse()
        if op == 'publish' and refused('ev_publish', receipt_retained=d['receipt_retained']):
            return {'result': 'PENDING', 'effects': 0, 'event_id': o['event_id']}
        if op in ('recover', 'publish', 'read'):
            return {'result': 'ORIGINAL', 'effects': 0, 'event_id': o['event_id'], 'receipt_ref': d['receipt_ref']}
    if op in ('checkpoint', 'rebuild'):
        cp = d['checkpoint']
        if not checkpoint_value_ok(c, cp):
            return refuse()
        if op == 'rebuild' and refused('ev_rebuild', retained_prefix_complete=d['retained_prefix_complete']):
            return dict(UNAVAILABLE)
        token = cp['index_read_token']
        # The reader, disclosure, envelope and receipt rows of this same evaluation ran
        # above for checkpoint and rebuild; re-running them here is the original
        # boundary order and always passes at this point.
        if (refused('cp_guard', expected_previous=d['expected_previous'], stored_previous=d['stored_previous'],
                    state=cp['state'], token=token, selected_token=d['selected_token'],
                    live_snapshot_id=d['live_snapshot_id'], current_live_snapshot_id=d['current_live_snapshot_id'])
                or refused('ev_reader', reader_withdrawn=d['reader_withdrawn'], reader_installed=d['reader_installed'],
                           consumer=c['consumer'])
                or refused('ev_disclosure', permission_now=d['permission_now'], source_deleted_now=d['source_deleted_now'],
                           share_current=d['share_current'])
                or not token_matches_storage(token, d['storage_instance_id'])
                or not envelope_ok(c, d, recipe, historical=True) or not receipt_ok(d, recipe)
                or refused('cp_scope', checkpoint_project_id=cp.get('project_id'), payload_project_id=p.get('project_id'),
                           checkpoint_scope=cp.get('scope'), payload_scope=p.get('scope'))):
            return refuse()
        if not index_inputs_ok(d):
            return refuse()
        rows, low, high, source = d['index_rows'], d['scan_low'], d['scan_high'], d['selected_source']
        prior = d['stored_previous']
        source_rows = source['rows']
        if refused('cp_source', source_storage_instance_id=source['storage_instance_id'],
                   storage_instance_id=d['storage_instance_id'], source_token=source['index_read_token'], token=token,
                   source_last_sequence=source['last_sequence'], selected_high=d['selected_high'],
                   source_sequences=[r['sequence'] for r in source_rows],
                   expected_source_sequences=list(range(source['first_sequence'], source['last_sequence'] + 1)),
                   row_partitions=[r['scope_partition'] for r in source_rows],
                   expected_row_partitions=[partition_of('application' if r['scope']['kind'] == 'app' else 'project',
                                                         r['scope']['project_id']) for r in source_rows]):
            return refuse()
        # Every matching row resolves its own original record, not the last
        # supplied receipt. Join ALL row fields to that independent source.
        for row in source_rows:
            if row['event_type'] == c['event_type'] and row['scope'] == x['scope']:
                original = d if row['event_id'] == d['original']['event_id'] else d.get('retained_events', {}).get(row['event_id'])
                found = isinstance(original, dict)
                event = original['original']['event'] if found else None
                expected = ({'event_id': event['event_id'], 'event_type': event['event_type'],
                             'scope': original['original_context']['scope'],
                             'scope_partition': original['scope_partition'], 'sequence': event['sequence_id']}
                            if found else None)
                if refused('cp_row', original_object=found, row=row, expected_row=expected):
                    return refuse()
                nested = evaluate(c, 'read', original).get('result') if original is not d else None
                if refused('cp_row_entailed', nested_result=nested):
                    return refuse()
        if cp == d['stored_previous']:
            return {'result': 'UNCHANGED', 'effects': 0}
        start = source['first_sequence'] if prior is None else prior['through_sequence_id'] + 1
        if (refused('cp_range', scan_low=low, expected_low=start, index_rows=rows,
                    expected_rows=[r for r in source_rows if low <= r['sequence'] <= high],
                    through_sequence_id=cp['through_sequence_id'], scan_high=high, selected_high=d['selected_high'])
                or refused('cp_range_entailed', row_sequences=[r['sequence'] for r in rows],
                           expected_row_sequences=list(range(low, high + 1)))):
            return refuse()
        if prior is not None and (
                schema_refused('sch_prior_checkpoint', validator(read(c['checkpoint_schema_ref'])), prior)
                or not token_matches_storage(prior['index_read_token'], d['storage_instance_id'])
                or refused('cp_prior_entailed', prior_storage_instance_id=prior['index_read_token']['storage_instance_id'],
                           storage_instance_id=token['storage_instance_id'])
                or refused('cp_prior', prior_generation_id=prior['index_read_token']['generation_id'], generation_id=token['generation_id'],
                           prior_anchor=prior['index_read_token']['generation_anchor_sha256'],
                           anchor=token['generation_anchor_sha256'], prior_project_id=prior.get('project_id'),
                           checkpoint_project_id=cp.get('project_id'), prior_scope=prior.get('scope'),
                           checkpoint_scope=cp.get('scope'), prior_state=prior['state'])):
            return refuse()
        matches = [r['event_id'] for r in rows if r['event_type'] == c['event_type'] and r['scope'] == x['scope']]
        earlier = [r['event_id'] for r in source_rows if r['sequence'] < low and r['event_type'] == c['event_type'] and r['scope'] == x['scope']]
        last = matches[-1] if matches else (prior['last_event_id'] if prior is not None else None)
        if refused('cp_matches', prior_present=prior is not None, earlier=earlier,
                   prior_last_event_id=prior['last_event_id'] if prior is not None else None, last=last,
                   matches=matches, selected_matches=d['selected_matches'], checkpoint_last_event_id=cp['last_event_id']):
            return refuse()
        return {'result': 'ADVANCE', 'effects': 0, 'through_sequence_id': high, 'last_event_id': last}
    if op == 'withdraw_writer':
        if admission_refused(d):
            return refuse()
        return evaluate(c, 'publish', d)
    raise AssertionError(op)


def parse_operation_json(encoded):
    """(True, value) when operation text parses under CV-1100, else (False, None) through RI01."""
    value = reason = None
    try:
        value = parse_owner_json(encoded)
    except ValueError as exc:
        reason = getattr(exc, 'reason', type(exc).__name__)
    if refused('raw_ingress', parse_refusal=reason):
        return False, None
    return True, value


def evaluate_json(c, op, encoded):
    """Raw JSON ingress preserves the lexical fences before typed evaluation."""
    ok, data = parse_operation_json(encoded)
    if not ok:
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


def harness_recipe(c, data):
    """The frozen recipe a direct boundary call reads the original with: the same SP-1101 selection (rd_recipe)."""
    return select_original_recipe(c, data)[0]


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
        return not refused('id_input', payload_object=object_input_present(data['payload']))
    if target == 'browser_record_bytes_present':
        return not owner_record_text(data, data['application_source'])[0]
    if target == 'identity_fields_types_ok':
        return identity_fields_types_ok(c, data['payload'])
    if target == 'identity':
        return identity(c, data['payload'], data.get('application_source'))
    if target == 'commitment':
        recipe = harness_recipe(c, data)
        return recipe is not None and commitment(data['original']['event'], recipe)
    if target == 'context_types_ok':
        return context_types_ok(c, data['context'])
    if target == 'authority_types_ok':
        return authority_types_ok(data)
    if target == 'browser_source_ok':
        return browser_source_ok(data, data['application_source'])
    if target == 'payload_ok':
        return payload_ok(c, data['payload'], data['context'])
    if target == 'envelope_ok':
        recipe = harness_recipe(c, data)
        return recipe is not None and envelope_ok(c, data, recipe, retry=False)
    if target == 'receipt_ok':
        recipe = harness_recipe(c, data)
        return recipe is not None and receipt_ok(data, recipe)
    if target == 'token_matches_storage':
        return token_matches_storage(data['selected_token'], data['storage_instance_id'])
    # Presence boundaries are the model phases that hold them.
    if target == 'application_source_present':
        return not application_source_refused(data, data['application_source'])
    if target == 'original_output_present':
        return not original_output_refused(data['application_source'])
    if target == 'outcome_present':
        return not outcome_refused(data)
    if target == 'admission_present':
        return not admission_refused(data)
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
    if schema_refused('sch_value', validator(read(schema_ref)), value):
        return False
    if refused('vv_size', size=physical_size(value)):
        return False
    if schema_ref.endswith('dev_session_record_v2.schema.json') and value['dap'] is not None:
        dap = value['dap']
        if refused('vv_dap', dap_project_id=dap['project_id'], project_id=value['project_id'],
                   dap_dev_session_id=dap['dev_session_id'], dev_session_id=value['dev_session_id'],
                   topology_project_id=dap['topology']['project_id'],
                   dap_errors=len(_debug.validate(dap, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json')))):
            return False
    return True


def migrate(kind_name, source, evidence):
    """Static migration oracle only. It neither opens a store nor authorizes writes."""
    if schema_refused('sch_migration_inputs', validator(read('Plans/ds15_migration_inputs.schema.json')['$defs'][kind_name]),
                      {'source': source, 'evidence': evidence}):
        return None
    if not authority_types_ok(evidence) or refused('mg_evidence', verified=evidence.get('verified'),
                                                   backup_verified=evidence.get('backup_verified')):
        return None
    if kind_name == 'dap_v1':
        if refused('mg_dap', source_errors=len(_debug.validate(source, 'dev_session_record',
                                                               read('Plans/shared_runtime_contracts.schema.json'))),
                   source_project_id=source['project_id'], evidence_project_id=evidence['project_id'],
                   source_dev_session_id=source['dev_session_id'], evidence_dev_session_id=evidence['dev_session_id']):
            return None
        result = {'schema_id': 'pm.storage_value.dev_session_record.v2', 'schema_version': '2.0.0',
                  'project_id': source['project_id'], 'dev_session_id': source['dev_session_id'],
                  'workflow': None, 'dap': copy.deepcopy(source)}
        return result if value_valid('Plans/ds15_dev_session_record_v2.schema.json', result) else None
    if kind_name == 'preview_v1':
        mappings = evidence.get('mappings', [])
        one = len(mappings) == 1
        if refused('mg_preview', mapping_count=len(mappings), mapping_preview_id=mappings[0]['preview_id'] if one else None,
                   source_preview_id=source['preview_id'], mapping_source_file=mappings[0]['source_file'] if one else None,
                   source_file=source['source_file'], source_status=source['status']):
            return None
        result = copy.deepcopy(mappings[0]['saved_subject_ui'])
        result.update(runtime_verification='unverified', legacy_status=source['status'])
        return result if value_valid('Plans/ds15_preview_state_v2.schema.json', result) else None
    if kind_name == 'capture_chip':
        if refused('mg_chip', source_thread_id=source.get('thread_id'), evidence_thread_id=evidence.get('thread_id'),
                   source_scope=source.get('scope'), evidence_scope=evidence.get('scope')):
            return None
        result = copy.deepcopy(source)
        result.update(schema_id='pm.ds15.browser_capture_chip.v2', schema_version='2.0.0')
        return result if value_valid('Plans/ds15_browser_capture_chip_v2.schema.json', result) else None
    raise AssertionError(kind_name)


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
    if schema_refused('sch_envelope', validator(read('Plans/event_record.schema.json')), envelope):
        return None
    paths = producer_type_sensitive_paths(envelope)
    if refused('pr_digest', refusal=refusal_reason(lambda e: producer_semantic_digest(e, type_sensitive_paths=paths), envelope)):
        return None
    return producer_semantic_digest(envelope, type_sensitive_paths=paths)


def numeric_operation(case, data):
    c = next(c for c in read('Plans/ds15_event_contracts.json') if c['event_type'] == case['event_type'])
    target = case['target']
    if target == 'atom':
        # CV-1100 current integer at a slot with no owner bound.
        return not refused('nm_atom', refusal=refusal_reason(current_integer, data))
    if target == 'identity':
        return identity(c, data)
    if target == 'payload_schema':
        return not schema_refused('sch_payload', validator(read(c['payload_schema_ref'])), data)
    if target == 'value':
        return value_valid(case['schema_ref'], data)
    if target == 'migration':
        return migrate(data['kind'], data['source'], data['evidence'])
    if target == 'commitment':
        recipe = harness_recipe(c, data)
        return recipe is not None and commitment(data['original']['event'], recipe)
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
    ok, decoded = parse_operation_json(encoded)
    wire = proof_success(numeric_operation(case, decoded)) if ok else False
    whole = proof_success(evaluate_json(c, case['operation'], encoded)) if case['target'] == 'evaluate' else None
    if case['token'] in RAW_ONLY_TOKENS:
        if parse_operation_json(case['token'])[0]:
            raise AssertionError((case['id'], 'noncanonical JSON spelling accepted'))
        return parent_ok, wire, whole, None, None
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
            assert shared_valid('AppendReceipt', data['receipt'], harness_recipe(c, data)) == case['valid'], (case['id'], 'receipt schema profile')
        if case.get('path', '').startswith('checkpoint/'):
            valid = not list(validator(read(c['checkpoint_schema_ref'])).iter_errors(data['checkpoint']))
            assert valid == case['valid'], (case['id'], 'checkpoint schema profile')
        # The same token at the complete operation input, through the current raw parser.
        with exact_integer_text():
            ok, decoded = parse_operation_json(json.dumps(data))
        if not ok:
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
    # Codec self-check of the shared CV-339 fixture (a ds15-v1-domain value), not a retained read.
    assert commitment(shared['base_original_event'], V1)['sha256'] == shared['commitment_sha256']
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
            assert schema_refused('sch_payload', v, bad), (name, case)
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
    assert not table_order_errors(), ('table require order', table_order_errors())
    # Sweep part 2A witnesses: each refused at exactly its own row (Plans/ds15_p2a_cases.json).
    import pm_ds15_p2a_cases as p2a
    _, deck2 = p2a.load_models()
    p2a_cases = p2a.fixture_cases()
    problems = p2a.check(sys.modules[__name__], deck2, p2a_cases)
    assert not problems, ('sweep part 2A witnesses', problems)
    # Sweep part 2B witnesses (Plans/ds15_p2b_cases.json): CV-1101 date-time through the validators, SP-1101
    # selection and resolution; each negative refused first at its own row, each positive exactly as stated.
    import pm_ds15_p2b_cases as p2b
    p2b_cases = p2b.fixture_cases()
    problems = p2b.check(sys.modules[__name__], deck2, p2b_cases)
    assert not problems, ('sweep part 2B witnesses', problems)
    sealed = original_custody()
    print(json.dumps({'status':'pass','families':len(contracts),'payload_oracles':count,'semantic_oracles':semantic_count,'reference_closure_oracles':schema_count,'predicate_oracles':predicate_count,'value_oracles':value_cases,'guard_proof_oracles':guard_proofs,'numeric_oracles':numeric_cases,'sweep_p2a_witnesses':len(p2a_cases),'sweep_p2b_witnesses':len(p2b_cases),'sealed_originals':sum(len(v) for v in sealed['sealed'].values()),'custody_stores':len(sealed['stores']),'native_execution':'NOT_RUN'}))

if __name__ == '__main__': main()

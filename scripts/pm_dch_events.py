#!/usr/bin/env python3
"""DCH static contract checks. No admission, frozen validator or runtime simulation."""
import ast
import copy
import argparse
import base64
import binascii
import hashlib
import importlib
import json
import math
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlparse
import blake3
import msgpack
from jsonschema import Draft202012Validator
from pm_dch_formats import FormatChecker, legacy_format_checker
# CV-1100 / SP-1100 shared number recipes (gated number scope a16f67c1ef).
# The date-time scope (pm_event_datetime, CV-1101) is deliberately not imported.
from pm_event_numbers import (EVENT_VALUE, Refusal, current_integer, producer_semantic_digest, qualified_jcs,
                              storage_uint64, storage_value_bytes)
from jsonschema.exceptions import SchemaError
from referencing import Registry, Resource
from referencing.exceptions import NoSuchResource, Unresolvable
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]
STORAGE_INSTANCE = '00000000-0000-4000-8000-000000000001'
INLINE_LIMIT = 16 * 1024
UINT64_MAX = (1 << 64) - 1
SELECTED_FAMILY = None
# Reuse Storage's own instance descriptor, including its UUID format.
STORAGE_INSTANCE_DESCRIPTOR = json.loads((ROOT/'Plans/event_record_index_checkpoint.schema.json').read_text())['$defs']['checkpoint']['properties']['storage_instance_id']
STORAGE_INSTANCE_VALIDATOR = Draft202012Validator(STORAGE_INSTANCE_DESCRIPTOR, format_checker=FormatChecker())
# Exact EventRecord owner commitment. event_id has a separate integrity check.
SEMANTIC_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload',
    'payload_ref', 'redaction_profile', 'migration')

def schema_reference_errors(schema, path):
    """Resolve the entire schema graph, even branches no positive traverses.

    Use JSON Schema resource scopes/anchors, not an instance-driven walk. File
    references are confined to the checkout; ambient network retrieval is refused.
    """
    retrieved_resources = {}
    def retrieve(uri):
        if uri in retrieved_resources:
            return retrieved_resources[uri]
        parsed = urlparse(uri)
        if parsed.scheme != 'file' or parsed.netloc:
            raise NoSuchResource(ref=uri)
        target = Path(unquote(parsed.path)).resolve()
        if not target.is_relative_to(ROOT):
            raise NoSuchResource(ref=uri)
        data = json.loads(target.read_text())
        Draft202012Validator.check_schema(data)
        resource = Resource.from_contents(data, default_specification=DRAFT202012)
        retrieved_resources[uri] = resource
        return resource

    errors = []
    seen = set()
    try:
        Draft202012Validator.check_schema(schema)
        resource = Resource.from_contents(schema, default_specification=DRAFT202012)
        registry = Registry(retrieve=retrieve).with_resource(path.resolve().as_uri(), resource).crawl()
        def visit(current, resolver):
            # Resolved recursive refs share the same parsed object. Each distinct
            # resource is checked once, including every sibling/optional branch.
            marker = id(current.contents)
            if marker in seen:
                return
            seen.add(marker)
            if isinstance(current.contents, dict):
                for keyword in ['$ref', '$dynamicRef']:
                    if keyword not in current.contents:
                        continue
                    ref = current.contents[keyword]
                    try:
                        resolved = resolver.lookup(ref)
                        Draft202012Validator.check_schema(resolved.contents)
                        child = Resource.from_contents(resolved.contents, default_specification=DRAFT202012)
                        visit(child, resolved.resolver)
                    except (Unresolvable, OSError, ValueError, SchemaError) as exc:
                        errors.append(f'{keyword} {ref}: {type(exc).__name__}')
            for child in current.subresources():
                visit(child, resolver.in_subresource(child))
        visit(resource, registry.resolver(path.resolve().as_uri()).in_subresource(resource))
        # A file ref may select a fragment. Its other optional/history branches
        # still belong to a loaded schema document and need complete closure.
        visited_files = set()
        while pending := set(retrieved_resources) - visited_files:
            registry = registry.with_resources(retrieved_resources.items()).crawl()
            for uri in sorted(pending):
                loaded = retrieved_resources[uri]
                visit(loaded, registry.resolver(uri).in_subresource(loaded))
                visited_files.add(uri)
    except (Unresolvable, OSError, ValueError, SchemaError) as exc:
        errors.append(f'schema: {type(exc).__name__}: {exc}')
    return errors

CURRENT_RULE = 'strict-v4'
RETAINED_RECIPES = json.loads((ROOT/'Plans/dch_retained_recipes.json').read_text())['recipes']
# This is the static adapter's independent Storage write-receipt catalogue,
# never an input accepted from an event, caller, pack or checkpoint candidate.
RECIPE_RECEIPTS = {(r['storage_instance_id'], r['source_value_sha256']): r['recipe_id']
                  for r in json.loads((ROOT/'Plans/dch_write_recipe_receipts.json').read_text())['receipts']}

# Method B guard tables (sweep part 2A). Every product refusal of this checker
# and of pm_dch_stop.py is one named row of one phase table (scripts/
# pm_dch_table_<phase>.py, generated by scripts/pm-dch-table-generate.py),
# evaluated in the table's declared order. Derivation code below computes
# observations only (encoded bytes, digests, recomputed identities, type names,
# presence, mismatch lists); a refusal is issued only by a row. A boundary is an
# ordered chain of phases; reused boundaries (types, body, scope, joins,
# history) are phases of their callers.
TABLE_PHASES = (
    'rn_recipe', 'ty_a', 'ty_b', 'rb_route', 'rb_pack_a', 'rb_pack_b',
    'sc_app', 'sc_project_a', 'sc_project_b', 'sc_project_bytes',
    'jn_policy', 'jn_envelope_a', 'jn_envelope_b',
    'rt_inputs', 'rt_policy', 'rt_schema_file', 'rt_original', 'rt_dedupe', 'rt_identity', 'rt_semantic',
    'hr_encode', 'hr_flags', 'hr_source',
    'tj_start', 'tj_passed', 'tj_failed_a', 'tj_failed_b',
    'cp_schema', 'cp_node', 'cp_store', 'cp_generation', 'cp_frontier', 'cp_dataset', 'cp_event', 'cp_family',
    'cp_family_entailed', 'cp_publication', 'cp_state',
    'cs_value', 'cs_inline', 'cs_pointer', 'cs_pointer_bounds', 'cs_pack_a', 'cs_pack_b',
    'ar_request', 'ar_state', 'ar_commit', 'rf_closure',
    'st_value', 'st_inline', 'st_ref', 'st_ref_bytes', 'st_pack_a', 'st_pack_b', 'st_pack_c', 'st_pointer_bounds',
    'st_request_mode', 'st_request_store', 'st_request_schema', 'st_request_access', 'st_request_writer',
    'st_request_accepted', 'st_outcome_schema', 'st_outcome_decision', 'st_outcome_join', 'st_save',
    'st_read_present', 'st_read', 'st_queue_action', 'st_queue_send', 'st_index_token', 'st_index_store',
    'st_index_key', 'st_index_frontier', 'st_index_dataset', 'st_index_event', 'st_index_entailed', 'st_retirement',
)
_TABLE_ROWS = {}
_TABLE_FIELDS = {}
# Set to a list only by the guard-table suite builder (scripts/pm_dch_guard_suites.py).
RECORDER = None
# Standing-check trials only (scripts/pm_dch_event_regressions.py and
# scripts/pm_dch_round5_regressions.py): (phase, row) pairs swapped to
# always-pass for one trial. No checker path sets it.
CUT_ROWS = frozenset()


class TableRefusal(ValueError):
    """A refusal issued by one named table row (phase, row, code)."""
    def __init__(self, phase, row, code):
        self.phase, self.row, self.code = phase, row, code
        super().__init__(code)


def table_module(phase):
    return importlib.import_module('pm_dch_table_' + phase)


def table_rows(phase):
    """The phase's (row, predicate, context) list in declared table order."""
    rows = _TABLE_ROWS.get(phase)
    if rows is None:
        case = table_module(phase).case(None)
        rows = _TABLE_ROWS[phase] = [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]
        _TABLE_FIELDS[phase] = table_module(phase).FIELDS
    return rows


def table_refusal(phase, facts):
    """First refusing row of one phase, as (row, code), or None.

    The observation holds exactly the table's FIELDS; any other key set is a
    derivation fault, never a refusal.
    """
    rows = table_rows(phase)
    fields = _TABLE_FIELDS[phase]
    if set(facts) != set(fields):
        raise KeyError('observation fields differ from table FIELDS: ' + phase)
    observed = {k: facts[k] for k in fields}
    refusal = None
    for name, predicate, context in rows:
        if (phase, name) in CUT_ROWS:
            continue
        code = predicate(observed, context)
        if code is not None:
            refusal = (name, code)
            break
    if RECORDER is not None:
        RECORDER.append((phase, copy.deepcopy(observed), refusal))
    return refusal


def require(phase, facts):
    refusal = table_refusal(phase, facts)
    if refusal is not None:
        raise TableRefusal(phase, *refusal)


def table_order_errors():
    """Each factory's check() requires its rows in exactly the table order, and every phase is declared."""
    errors = []
    found = sorted(p.name[len('pm_dch_table_'):-3] for p in (ROOT / 'scripts').glob('pm_dch_table_*.py'))
    if found != sorted(TABLE_PHASES):
        errors.append('declared phases differ from table modules')
    for phase in TABLE_PHASES:
        tree = ast.parse((ROOT / ('scripts/pm_dch_table_' + phase + '.py')).read_text())
        factory = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'case')
        check = next(n for n in factory.body if isinstance(n, ast.FunctionDef) and n.name == 'check')
        required = [c.args[0].value for c in ast.walk(check) if isinstance(c, ast.Call) and ast.unparse(c.func) == 'table.require']
        if required != [name for name, _, _ in table_rows(phase)]:
            errors.append(phase)
    return errors


def type_name(value):
    """Exact builtin type name; an observation, never a coercion."""
    return type(value).__name__


def encoded(value, rule=CURRENT_RULE):
    """(refusal reason or None, encoded bytes or None) under the selected recipe."""
    try:
        return None, body_bytes(value, rule)
    except (ValueError, OverflowError) as exc:
        return type(exc).__name__ + ': ' + str(exc), None


def record_number_rule(provenance=None):
    """Sole recipe selector for numbers, physical bytes and schema formats.

    No provenance means a new write/current identity input: strict-v4. A retained
    source uses the recipe bound to its independently read Store + exact source
    commitment. Missing legacy provenance fails closed to the current recipe.
    A claimed recipe is only checked against that authority; it never selects it.
    Production must read this mapping from protected original write receipts;
    this catalogue models those observations, not receipt authenticity execution.
    """
    try:
        return _record_number_rule(provenance)
    except TableRefusal:
        return None


def _record_number_rule(provenance):
    if provenance is None:
        return CURRENT_RULE
    is_dict = type(provenance) is dict
    store = provenance.get('storage_instance_id') if is_dict else None
    digest = provenance.get('source_value_sha256') if is_dict else None
    keyed = type(store) is str and type(digest) is str
    recipe = RECIPE_RECEIPTS.get((store, digest), CURRENT_RULE) if keyed else None
    claim_present = is_dict and 'recipe_id' in provenance
    require('rn_recipe', dict(provenance_type=type_name(provenance), store_type=type_name(store),
                              digest_type=type_name(digest), claim_present=claim_present,
                              claim=provenance['recipe_id'] if claim_present else None, receipt_recipe=recipe))
    return recipe


def stored_validator(current, path, rule):
    """Use the entire original schema/format edition, not relaxed current prose."""
    if rule == CURRENT_RULE:
        return current
    return Draft202012Validator(RETAINED_RECIPES[rule]['schemas'][path],
                                format_checker=legacy_format_checker())


def historical_read_valid(record, row, witness, envelope, payload_validator):
    """Static retained-original lookup; current live state grants no authority.

    The witness models independently read canonical bytes and current access,
    not an admission or a replacement for native source/custody verification.
    """
    try:
        _historical_read(record, row, witness, envelope, payload_validator)
    except TableRefusal:
        return False
    return True


def _historical_read(record, row, witness, envelope, payload_validator):
    rule = _record_number_rule(witness)
    _input_types({'record': record, 'witness': witness}, rule)
    envelope = stored_validator(envelope, 'Plans/event_record.schema.json', rule)
    path = row.get('payload_schema_ref', 'Plans/dch_event_payloads/'+row['event_type'].replace('.', '_')+'.schema.json')
    payload_validator = stored_validator(payload_validator, path, rule)
    error, raw = encoded(record, rule)
    require('hr_encode', dict(record_encoding_error=error))
    source_commitment = hashlib.sha256(raw).hexdigest()
    body = _resolve_body(record, witness.get('payload_source'), witness['storage_instance_id'], rule)
    require('hr_flags', dict(envelope_valid=envelope.is_valid(record), payload_valid=payload_validator.is_valid(body),
                             retained=witness['retained'], authorized=witness['authorized'],
                             hold_access_allowed=witness['hold_access_allowed'], deleted=witness['deleted'],
                             event_withdrawn=witness['event_withdrawn']))
    require('hr_source', dict(source_commitment=source_commitment, witness_commitment=witness['source_value_sha256'],
                              replay_policy=record['replay_policy']))
    # Compatibility-reader policy never calls the current append/retry oracle.
    original = {**record, 'replay_policy': 'dedupe_by_idempotency_key'}
    _joins(original, row['event_type'], witness.get('payload_source'), witness['storage_instance_id'], rule)


def body_bytes(value, rule=CURRENT_RULE):
    """Physical bytes of a value under its selected write recipe.

    Current writes and current identity inputs (strict-v4) use SP-236 through
    the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE): shortest
    MessagePack, sorted exact UTF-8 map keys, float type, minimal exact float
    width and signed zero preserved (CV-1100/SP-1100). A retained original keeps
    the encoder its recipe recorded (retained_body_bytes); its bytes are never
    restamped.
    """
    if rule == CURRENT_RULE:
        return storage_value_bytes(value, profile=EVENT_VALUE)
    return retained_body_bytes(value, rule)


def retained_body_bytes(value, rule):
    """Frozen pre-SP-1100 DCH encoder of the retained recipes (raw-v1, normalized-v2, strict-v3)."""
    def ordered(v):
        # The retained normalized-v2/strict-v3 recipes wrote integral finite
        # floats and either signed zero with the bytes of their integer value;
        # raw-v1 wrote them verbatim. Current writes no longer do (SP-1100).
        if type(v) is float and RETAINED_RECIPES[rule]['normalize_integral_floats']:
            if not math.isfinite(v):
                raise ValueError('non-finite number')
            if not v.is_integer():
                return v
            v = int(v)
        if isinstance(v, dict):
            return {k: ordered(v[k]) for k in sorted(v, key=lambda k: k.encode('utf-8'))}
        if isinstance(v, list):
            return [ordered(x) for x in v]
        return v
    try:
        return msgpack.packb(ordered(value), use_bin_type=True, strict_types=True)
    except OverflowError as exc:
        raise ValueError('integer outside DCH MessagePack domain') from exc


INTEGER_SLOTS = frozenset({'sequence_id', 'producer_sequence_id', 'revision', 'frontier_revision',
                           'last_sequence_id', 'selected_segment_generation', 'manifest_generation',
                           'recovery_epoch', 'expected_thread_revision', 'committed_thread_revision',
                           'expected_revision', 'duration_ms', 'pr_number', 'byte_size'})
# Storage metadata retains the owner's exact uint64 range. Producer integers
# keep their own schema domain; RFC8785 route work is separate.
UINT64_SLOTS = frozenset({'sequence_id', 'last_sequence_id', 'frontier_revision', 'selected_segment_generation',
                          'manifest_generation', 'recovery_epoch', 'byte_size'})
OBJECT_SLOTS = frozenset({'payload', 'body', 'scope', 'source_token', 'source_selection', 'migration', 'record', 'witness',
                          'source', 'value', 'retry', 'pointer', 'pack', 'checkpoint_storage', 'event_record',
                          'event_access', 'checkpoint', 'index_row', 'publication', 'before', 'after', 'request',
                          'started', 'outcome', 'live_state', 'generations'})
ARRAY_SLOTS = frozenset({'projection_refs', 'history', 'attachment_refs', 'provenance_refs'})
STRING_SLOTS = frozenset({'operation_id', 'computer_id', 'actor_ref', 'schema_id', 'schema_version',
                          'scope_kind', 'scope_partition', 'server_id', 'event_type'})
TYPE_A = ('nonstring_keys', 'store_descriptors', 'integer_types', 'uint64_ranges')
TYPE_B = ('object_types', 'array_types', 'string_types', 'leaf_types')


def integer_refusal(value, **bounds):
    """CV-1100 current integer slot: the shared current_integer refusal reason, or None."""
    try:
        current_integer(value, **bounds)
    except Refusal as refusal:
        return refusal.reason
    return None


def uint64_refusal(value):
    """SP-1100 Storage uint64 metadata: the shared storage_uint64 refusal reason, or None."""
    try:
        storage_uint64(value)
    except Refusal as refusal:
        return refusal.reason
    return None


def type_facts(value, rule):
    """Paths of every slot whose exact type (or Storage uint64 range) is wrong.

    Each node is attributed to its first failing slot predicate, in the
    original order (key, Storage descriptor, integer, uint64, object, array,
    string); the walk does not descend below a node whose own slot failed. A
    leaf at a passing slot is always str/int/None, so the leaf row reads only
    untyped leaves.
    """
    facts = {k: [] for k in TYPE_A + TYPE_B}

    def at(path):
        return '/' + '/'.join(map(str, path))

    def walk(v, path):
        if type(v) is list:
            for index, item in enumerate(v):
                walk(item, path + (index,))
            return
        if type(v) is not dict:
            if type(v) not in [str, bool, int, type(None)]:
                facts['leaf_types'].append(at(path))
            return
        for key, item in v.items():
            if type(key) is not str:
                facts['nonstring_keys'].append(at(path) + '/' + repr(key))
                continue
            here = path + (key,)
            if key == 'storage_instance_id' and not STORAGE_INSTANCE_VALIDATOR.is_valid(item):
                facts['store_descriptors'].append(at(here))
                continue
            if key in INTEGER_SLOTS and not (key == 'producer_sequence_id' and item is None) and integer_refusal(item):
                facts['integer_types'].append(at(here))
                continue
            if rule == CURRENT_RULE and key in UINT64_SLOTS and uint64_refusal(item):
                facts['uint64_ranges'].append(at(here))
                continue
            if key in OBJECT_SLOTS and type(item) is not dict:
                facts['object_types'].append(at(here))
                continue
            if key in ARRAY_SLOTS and type(item) is not list:
                facts['array_types'].append(at(here))
                continue
            if key in STRING_SLOTS and type(item) is not str:
                facts['string_types'].append(at(here))
                continue
            walk(item, here)
    walk(value, ())
    return facts


def input_types_valid(value, rule=CURRENT_RULE):
    """Exact witness types before truth/equality/arithmetic, including bool/int.

    DCH declares integer slots, no floating point slots. Physical encoding still
    canonicalizes numeric aliases, so a rejected alternate cannot mint a digest.
    Schema validation owns field presence, strings, enums and logical bounds.
    """
    try:
        _input_types(value, rule)
    except TableRefusal:
        return False
    return True


def _input_types(value, rule=CURRENT_RULE):
    if rule == 'raw-v1':
        # Original schema validators own numeric slots; the raw encoder keeps
        # integer-valued floats verbatim. Do not coerce their committed bytes.
        return
    facts = type_facts(value, rule)
    require('ty_a', {k: facts[k] for k in TYPE_A})
    require('ty_b', {k: facts[k] for k in TYPE_B})


def payload_reference(body, rule=CURRENT_RULE):
    raw = body_bytes(body, rule)
    return f'payload:v1:{blake3.blake3(raw).hexdigest()}:{len(raw)}:application/msgpack'


def resolve_body(record, source=None, storage_instance=STORAGE_INSTANCE, rule=CURRENT_RULE):
    """Static SP-337 pack/readback/access fixture; not native durability proof."""
    try:
        return _resolve_body(record, source, storage_instance, rule)
    except TableRefusal:
        return None


def _resolve_body(record, source, storage_instance, rule):
    _input_types({'record': record, 'storage_instance_id': storage_instance,
                  **({'source': source} if source is not None else {})}, rule)
    inline = record['payload_ref'] is None
    error, raw = encoded(record['payload'] if inline else source['body'] if source else {}, rule)
    require('rb_route', dict(route='inline' if inline else 'ref', encoding_error=error,
                             inline_size=len(raw) if inline and raw is not None else None,
                             payload_empty=None if inline else record['payload'] == {},
                             source_truthy=None if inline else bool(source)))
    if inline:
        return record['payload']
    body = source['body']
    require('rb_pack_a', dict(payload_ref=record['payload_ref'],
                              expected_payload_ref=f'payload:v1:{blake3.blake3(raw).hexdigest()}:{len(raw)}:application/msgpack',
                              pack_key=source['key'], expected_pack_key='payload:v1:' + blake3.blake3(raw).hexdigest(),
                              byte_size=source['byte_size'], raw_size=len(raw), media_type=source['media_type'],
                              pack_store=source['storage_instance_id'], store=storage_instance,
                              pack_scope=source['scope'], body_scope=body['scope'],
                              pack_computer_id=source['computer_id'], body_computer_id=body['computer_id']))
    require('rb_pack_b', dict(pack_thread_id=source['thread_id'], body_thread_id=body['thread_id'],
                              **{k: source[k] for k in ['authorized', 'hold_access_allowed', 'bytes_durable',
                                                        'index_durable', 'readback_verified', 'deleted']}))
    return body


def identity(event, payload, storage_instance=STORAGE_INSTANCE):
    parts = [event, '1.0.0', storage_instance, payload['scope'], payload['computer_id'], payload['thread_id'], payload['operation_id']]
    # CV-1100 qualified JCS. The identity parts are strings and the scope
    # object (strings/null); DCH owners declare no type- or sign-sensitive path.
    value = qualified_jcs(parts)
    return 'evt_dch_' + hashlib.sha256(value).hexdigest()


def valid_scope_partition(scope):
    """CV-365 semantic join, independent of schema shape/envelope equality."""
    try:
        _scope_partition(scope)
    except TableRefusal:
        return False
    return True


def _scope_partition(scope):
    if scope['scope_kind'] == 'application':
        require('sc_app', {k: scope[k] for k in ['scope_partition', 'project_id', 'project_home_server_id', 'named_plan_id']})
        return
    project_id = scope['project_id']
    is_str = isinstance(project_id, str)
    require('sc_project_a', dict(scope_kind=scope['scope_kind'], project_id_is_str=is_str,
                                 project_id_empty=not project_id if is_str else None))
    partition = scope['scope_partition']
    prefixed = partition.startswith('project~')
    encoded_part = partition[len('project~'):] if prefixed else None
    alphabet = prefixed and re.fullmatch(r'[A-Za-z0-9_-]+', encoded_part) is not None
    decoded = None
    if alphabet:
        try:
            decoded = base64.b64decode(encoded_part + '=' * (-len(encoded_part) % 4), altchars=b'-_', validate=True)
        except (ValueError, binascii.Error):
            decoded = None
    try:
        exact = project_id.encode('utf-8')
    except UnicodeError:
        exact = None
    text_equal = None
    if decoded is not None and exact is not None:
        try:
            text_equal = decoded.decode('utf-8') == project_id
        except UnicodeError:
            text_equal = False
    require('sc_project_b', dict(prefixed=prefixed, alphabet=alphabet, decodes=decoded is not None,
                                 project_id_encodable=exact is not None, decoded_text_equal=text_equal,
                                 canonical=(base64.urlsafe_b64encode(exact).decode('ascii').rstrip('=') == encoded_part)
                                 if exact is not None and decoded is not None else None))
    require('sc_project_bytes', dict(decoded_bytes_equal=decoded == exact))


def idempotency_key(event, payload, storage_instance=STORAGE_INSTANCE):
    if payload['scope']['scope_kind'] == 'application':
        return ('application@1:' + payload['scope']['server_id'].encode('utf-8').hex()
                + ':' + payload['operation_id'].encode('utf-8').hex())
    return 'dch:' + identity(event, payload, storage_instance)[len('evt_dch_'):]


def joins(record, event, source=None, storage_instance=STORAGE_INSTANCE, rule=CURRENT_RULE):
    try:
        _joins(record, event, source, storage_instance, rule)
    except TableRefusal:
        return False
    return True


def _joins(record, event, source, storage_instance, rule):
    p = _resolve_body(record, source, storage_instance, rule)
    require('jn_policy', dict(replay_policy=record['replay_policy']))
    _scope_partition(p['scope'])
    require('jn_envelope_a', dict(event_type=record['event_type'], expected_event_type=event,
                                  event_id=record['event_id'], expected_event_id=identity(event, p, storage_instance),
                                  idempotency_key=record['idempotency_key'],
                                  expected_idempotency_key=idempotency_key(event, p, storage_instance),
                                  payload_schema_id=record['payload_schema_id'], body_schema_id=p['schema_id'],
                                  scope_kind=record['scope_kind'], body_scope_kind=p['scope']['scope_kind'],
                                  project_id=record['project_id'], body_project_id=p['scope']['project_id']))
    require('jn_envelope_b', dict(thread_id=record['thread_id'], body_thread_id=p['thread_id'],
                                  actor_ref=record['actor_ref'], body_actor_ref=p['actor_ref'],
                                  occurred_at_utc=record['occurred_at_utc'], body_ts=p['ts'],
                                  run_id=record['run_id'], node_id=record['node_id'], attempt_id=record['attempt_id']))


def retry_outcome(original, retry, available=True, original_provenance=None):
    """Static CV-366 oracle; does not exercise a writer, receipt or real dedupe store.

    A refusal by a reused input boundary (recipe, types, body, history) is an
    invalid_input_type outcome; an rt_* row returns its own outcome code.
    """
    try:
        return _retry_outcome(original, retry, available, original_provenance)
    except TableRefusal as refusal:
        return refusal.code if refusal.phase.startswith('rt_') else 'invalid_input_type'


def _retry_outcome(original, retry, available, original_provenance):
    rule = _record_number_rule(original_provenance)
    _input_types({'record': original}, rule)
    _input_types({'retry': retry})
    require('rt_inputs', dict(available_type=type_name(available)))
    require('rt_policy', dict(original_policy=original['replay_policy'], retry_policy=retry['replay_policy']))
    if original_provenance is not None:
        # Stored original and incoming retry are different trust/type domains.
        # The same history reader owns original bytes, schema and current custody.
        row = {'event_type': original['event_type']}
        path = 'Plans/dch_event_payloads/'+original['event_type'].replace('.', '_')+'.schema.json'
        try:
            envelope = Draft202012Validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()), format_checker=FormatChecker())
            payload_validator = Draft202012Validator(json.loads((ROOT/path).read_text()), format_checker=FormatChecker())
        except (OSError, ValueError):
            envelope = payload_validator = None
        require('rt_schema_file', dict(schemas_loaded=payload_validator is not None))
        incoming_body = _resolve_body(retry, original_provenance.get('payload_source'), original_provenance['storage_instance_id'],
                                      CURRENT_RULE)
        require('rt_original', dict(retry_envelope_valid=envelope.is_valid(retry),
                                    retry_payload_valid=payload_validator.is_valid(incoming_body)))
        _historical_read(original, row, original_provenance, envelope, payload_validator)
    require('rt_dedupe', dict(available=available))

    def lifetime(r):
        # Exact scope identities are equivalent to their validated reversible
        # partition. Keep malformed cross-scope mutations comparable as well.
        return [r['scope_kind'], r['project_id'], r['event_type'], r['idempotency_key']]
    require('rt_identity', dict(original_lifetime=lifetime(original), retry_lifetime=lifetime(retry),
                                original_event_id=original['event_id'], retry_event_id=retry['event_id']))
    if lifetime(original) != lifetime(retry):
        return 'distinct_operation'
    # An earlier out-of-current-domain semantic value cannot equal a valid
    # current retry. Compare that difference without sending it to today's
    # RFC8785 safe-domain encoder or changing its original stored recipe.
    differences = [k for k in SEMANTIC_FIELDS if original[k] != retry[k]] if rule != CURRENT_RULE else []
    error = equal = None
    if not differences:
        try:
            equal = semantic_commitment(original) == semantic_commitment(retry)
        except Refusal as refusal:
            # CV-1100 route qualification: a projection with no exact JCS
            # encoding is a structured refusal; no rounding, substitution or crash.
            error = refusal.reason
    require('rt_semantic', dict(retained_differences=differences, commitment_error=error, commitments_equal=equal))
    return 'original_result'


def semantic_commitment(r):
    """CV-317 caller-semantic commitment: the shared producer projection digest (CV-1100)."""
    return producer_semantic_digest(r)


TEST_COMMON = ['operation_id', 'scope', 'computer_id', 'thread_id', 'worktree_id', 'command', 'strategy']


def test_joins(payload, source, event):
    """Original started operation and actual terminal outcome, W.9.2/W.9.3."""
    try:
        _test_joins(payload, source, event)
    except TableRefusal:
        return False
    return True


def _test_joins(payload, source, event):
    _input_types({'payload': payload, 'source': {k:v for k,v in source.items() if k not in ['started', 'started_access']}})
    started, outcome = source['started'], source['outcome']
    schema = json.loads((ROOT/'Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_started.schema.json').read_text())
    envelope = json.loads((ROOT/'Plans/event_record.schema.json').read_text())
    witness = source['started_access']
    started_row = {'event_type': 'chat.thread_worktree_pre_merge_test_started'}
    _historical_read(started, started_row, witness,
                     Draft202012Validator(envelope, format_checker=FormatChecker()),
                     Draft202012Validator(schema, format_checker=FormatChecker()))
    # The retained start has just been read and verified with these exact
    # inputs, so this resolution cannot refuse (it is the same table path).
    p = _resolve_body(started, witness.get('payload_source'), witness['storage_instance_id'], _record_number_rule(witness))
    require('tj_start', dict(payload_started_event_id=payload['started_event_id'], started_event_id=started['event_id'],
                             outcome_started_event_id=outcome['started_event_id'],
                             payload_copy_mismatches=[k for k in TEST_COMMON if payload[k] != p[k]],
                             outcome_copy_mismatches=[k for k in TEST_COMMON if outcome[k] != payload[k]],
                             payload_duration_ms=payload['duration_ms'], outcome_duration_ms=outcome['duration_ms']))
    if event.endswith('_passed'):
        require('tj_passed', dict(kind=outcome['kind'], exit_code_refusal=integer_refusal(outcome['exit_code']),
                                  exit_code=outcome['exit_code']))
        return
    require('tj_failed_a', dict(payload_test_outcome=payload['test_outcome'], kind=outcome['kind'],
                                payload_exit_code=payload['exit_code'], exit_code=outcome['exit_code'],
                                payload_error_ref=payload['error_ref'], outcome_error_ref=outcome['error_ref']))
    require('tj_failed_b', dict(kind=outcome['kind'], exit_code_refusal=integer_refusal(outcome['exit_code']),
                                exit_code=outcome['exit_code'], payload_error_ref=payload['error_ref']))


def checkpoint_joins(value, source, row, key):
    """Independent synthetic source/root/dataset/publication joins under SP-278."""
    try:
        _checkpoint_joins(value, source, row, key)
    except TableRefusal:
        return False
    return True


def _checkpoint_joins(value, source, row, key):
    rule = _record_number_rule(source.get('checkpoint_access'))
    current_source = {k:v for k,v in source.items() if k not in ['event_record','event_access','payload_source','index_row','checkpoint_storage']}
    index_metadata = {k:v for k,v in source['index_row'].items() if k != 'sequence_id'}
    _input_types(value, rule)
    _input_types({'source': current_source, 'index_row': index_metadata})
    schema_path = 'Plans/dch_event_payloads/dch_'+row['event_type'].replace('.', '_')+'_checkpoint.schema.json'
    schema = Draft202012Validator(json.loads((ROOT/schema_path).read_text()), format_checker=FormatChecker())
    require('cp_schema', dict(checkpoint_schema_valid=stored_validator(schema, schema_path, rule).is_valid(value)))
    token = value['source_token']
    store = source['storage_instance_id']
    generation = token['generation_id']
    root = source['checkpoint']
    node = root['generations'].get(generation)
    event = source['event_record']
    envelope = Draft202012Validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()), format_checker=FormatChecker())
    payload_validator = Draft202012Validator(json.loads((ROOT/row['payload_schema_ref']).read_text()), format_checker=FormatChecker())
    witness = {**source['event_access'], 'storage_instance_id': store,
               'source_value_sha256': source['index_row']['source_value_sha256'],
               'payload_source': source.get('payload_source')}
    _historical_read(event, row, witness, envelope, payload_validator)
    p = _resolve_body(event, source.get('payload_source'), store, _record_number_rule(witness))
    generic_key = 'event_record_index_checkpoint.v1:' + store
    index = source['index_row']
    require('cp_node', dict(node_present=bool(node), index_sequence_type=type_name(index['sequence_id']),
                            event_sequence_type=type_name(event['sequence_id'])))
    expected_ref = generic_key + '#/generations/' + generation
    expected_dataset = 'event_record_index.v2@' + generation
    require('cp_store', dict(value_store=value['storage_instance_id'], token_store=token['storage_instance_id'],
                             selection_store=token['source_selection']['storage_instance_id'],
                             root_store=root['storage_instance_id'], store=store))
    require('cp_generation', dict(current_generation=root['current_generation_id'], generation=generation,
                                  node_state=node['state'], token_key=token['checkpoint_key'],
                                  source_key=source['checkpoint_key'], generic_key=generic_key,
                                  token_ref=token['checkpoint_ref'], expected_ref=expected_ref))
    require('cp_frontier', dict(token_anchor=token['generation_anchor_sha256'], node_anchor=node['anchor_sha256'],
                                token_frontier_revision=token['frontier_revision'],
                                node_frontier_revision=node['frontier_revision'],
                                token_frontier_sha256=token['frontier_sha256'], node_frontier_sha256=node['frontier_sha256'],
                                token_selection=token['source_selection'], node_selection=node['source_selection'],
                                current_selection=source['current_source_selection']))
    require('cp_dataset', dict(token_dataset=token['index_dataset_name'], node_dataset=node['index_dataset_name'],
                               source_dataset=source['dataset_name'], expected_dataset=expected_dataset,
                               index_ref=index['checkpoint_ref'], expected_ref=expected_ref))
    require('cp_event', dict(index_event_id=index['event_id'], last_event_id=value['last_event_id'],
                             event_id=event['event_id'], index_sequence_id=index['sequence_id'],
                             last_sequence_id=value['last_sequence_id'], event_sequence_id=event['sequence_id'],
                             index_partition=index['scope_partition'], value_partition=value['scope_partition'],
                             body_partition=p['scope']['scope_partition']))
    require('cp_family', dict(index_event_type=index['event_type'], family=row['event_type'], key=key,
                              expected_key=row['domain_checkpoint_key'].format(
                                  storage_instance_id=store, scope_partition=p['scope']['scope_partition'])))
    require('cp_family_entailed', dict(value_event_type=value['event_type'], event_event_type=event['event_type'],
                                       family=row['event_type'], consumer_id=value['consumer_id'], reader=row['reader'],
                                       projector_id=value['projector_id'], domain_projector=row['domain_projector']))
    publication = source['publication']
    require('cp_publication', dict(projection_refs=value['projection_refs'],
                                   publication_projection_refs=publication['projection_refs'],
                                   publication_id=value['publication_id'],
                                   publication_publication_id=publication['publication_id'],
                                   revision=value['revision'], publication_revision=publication['revision'],
                                   publication_token=publication['source_token'], token=token,
                                   publication_thread_id=publication['thread_id'], body_thread_id=p['thread_id'],
                                   publication_computer_id=publication['computer_id'], body_computer_id=p['computer_id'],
                                   publication_scope=publication['scope'], body_scope=p['scope']))
    require('cp_state', dict(state=value['state']))
    _checkpoint_storage(value, source, row, key)


def checkpoint_storage_valid(value, source, row, key):
    """Actual inline value, or SP-337 pointer plus independent pack/index read.

    Logical schema validation applies to the resolved complete checkpoint.
    Every physically inline part, including the pointer, is byte measured.
    """
    try:
        _checkpoint_storage(value, source, row, key)
    except TableRefusal:
        return False
    return True


def _checkpoint_storage(value, source, row, key):
    rule = _record_number_rule(source.get('checkpoint_access'))
    _input_types(value, rule)
    # Owner-valid logical integers can exceed this physical codec's range.
    # Contain its refusal before any provenance hash uses the encoded bytes.
    error, raw = encoded(value, rule)
    provenance = source.get('checkpoint_access')
    require('cs_value', dict(value_encoding_error=error, provenance_present=provenance is not None,
                             value_sha256=hashlib.sha256(raw).hexdigest() if raw is not None else None,
                             provenance_sha256=provenance['source_value_sha256'] if provenance is not None else None))
    physical = source.get('checkpoint_storage')
    if physical is not None:
        _input_types({'pointer': physical['pointer'], 'pack': {k:v for k,v in physical['pack'].items() if k != 'body'}})
        _input_types(physical['pack']['body'], rule)
    if physical is None:
        require('cs_inline', dict(inline_size=len(raw)))
        return
    packed = physical['pack']
    pointer = physical['pointer']
    digest = blake3.blake3(raw).hexdigest()
    body_error, body_raw = encoded(packed['body'], rule)
    require('cs_pointer', dict(pointer=pointer, expected_pointer={'payload_ref': f'payload:v1:{digest}:{len(raw)}:application/msgpack'},
                               pack_body_encoding_error=body_error,
                               pack_body_equal=body_raw == raw if body_error is None else None))
    # Entailed by the exact pointer above (at most 131 bytes); kept as defence in depth.
    pointer_error, pointer_raw = encoded(pointer)
    require('cs_pointer_bounds', dict(pointer_encoding_error=pointer_error,
                                      pointer_size=len(pointer_raw) if pointer_raw is not None else None))
    require('cs_pack_a', dict(pack_key=packed['key'], expected_pack_key='payload:v1:' + digest,
                              byte_size=packed['byte_size'], raw_size=len(raw), media_type=packed['media_type'],
                              pack_store=packed['storage_instance_id'], store=source['storage_instance_id'],
                              pack_domain_key=packed['domain_key'], key=key,
                              pack_partition=packed['scope_partition'], value_partition=value['scope_partition'],
                              pack_event_type=packed['event_type'], family=row['event_type']))
    require('cs_pack_b', {k: packed[k] for k in ['authorized', 'hold_access_allowed', 'bytes_durable', 'index_durable',
                                                 'readback_verified', 'deleted']})


ARCHIVE_COPIES = ['thread_id', 'computer_id', 'scope', 'operation_id']


def archive_joins(payload, source):
    """Static original request/commit fixture joins; never an authorization receipt."""
    try:
        _archive_joins(payload, source)
    except TableRefusal:
        return False
    return True


def _archive_joins(payload, source):
    _input_types({'payload': payload, 'source': source})
    before, after, request = source['before'], source['after'], source['request']
    require('ar_request', dict(archive_origin=payload['archive_origin'], command_id=payload['command_id'],
                               request_origin=request['origin'], request_command_id=request['command_id'],
                               permission_allowed=request['permission_allowed'], thread_selected=request['thread_selected'],
                               active_run=before['active_run']))
    require('ar_state', dict(before_state=before['state'], previous_state=payload['previous_state'],
                             payload_state=payload['state'], after_state=after['state'],
                             readback_available=after['readback_available'],
                             expected_thread_revision=payload['expected_thread_revision'], before_revision=before['revision'],
                             request_expected_revision=request['expected_revision']))
    # Chain payload committed == after revision == before revision + 1, read pairwise as written.
    require('ar_commit', dict(committed_thread_revision=payload['committed_thread_revision'],
                              after_revision=after['revision'], next_revision=before['revision'] + 1,
                              thread_record_ref=payload['thread_record_ref'], after_record_ref=after['record_ref'],
                              payload_copy_mismatches=[k for k in ARCHIVE_COPIES if payload[k] != request[k]],
                              before_copy_mismatches=[k for k in ARCHIVE_COPIES if before[k] != request[k]],
                              after_copy_mismatches=[k for k in ARCHIVE_COPIES if after[k] != request[k]]))


def reference_closure_refusal(errors):
    """Standing check 9 over already computed closure errors: (row, code) or None."""
    return table_refusal('rf_closure', dict(reference_errors=errors))


def references_valid(schema, path):
    """Standing check 9: the whole schema graph resolves (rf_closure)."""
    return reference_closure_refusal(schema_reference_errors(schema, path)) is None


def semantic_body_mutation(record, event):
    """One schema-valid result fact, preserving all envelope identity copies."""
    schema = json.loads((ROOT/'Plans/dch_event_payloads'/
                         (event.replace('.', '_')+'.schema.json')).read_text())
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    p = record['payload']
    baseline_valid = validator.is_valid(p)
    fields = schema['$defs'][p['scope']['scope_kind']]['properties']
    identity_fields = {'schema_id','schema_version','scope','operation_id','thread_id',
                       'computer_id','actor_ref','ts'}
    for key, old in p.items():
        if key in identity_fields or not isinstance(old, str):
            continue
        definition = fields[key]
        choices = definition.get('enum', [old+':changed'])
        for value in choices:
            if value == old:
                continue
            candidate = copy.deepcopy(p); candidate[key] = value
            # A regression campaign may deliberately invalidate the positive.
            # Preserve that defect for the ordinary positive check; the helper
            # still changes exactly one independently valid result field.
            if (Draft202012Validator(definition, format_checker=FormatChecker()).is_valid(value)
                    and (not baseline_valid or validator.is_valid(candidate))):
                return candidate
    raise AssertionError('No independent semantic-body fixture for '+event)

def main():
    contracts = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    fixtures = json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    checkpoints = json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    stored = json.loads((ROOT/'Plans/storage_value_registry.json').read_text())['families']
    registry = json.loads((ROOT/'Plans/event_family_registry.json').read_text())
    if SELECTED_FAMILY is not None:
        contracts = [r for r in contracts if r['event_type'] == SELECTED_FAMILY]
        fixtures = [f for f in fixtures if f['event_type'] == SELECTED_FAMILY]
        checkpoints = [c for c in checkpoints if c['event_type'] == SELECTED_FAMILY]
        if len(contracts) != 1:
            raise ValueError('Unknown DCH family: '+SELECTED_FAMILY)
    failures = []
    checks = 0
    per_family = {}
    reference_results = {}
    def reference_errors(schema, path):
        # Per-run only: equal selected/embedded definitions have the same graph.
        # A new main() call always re-reads and rechecks mutated inputs.
        key = (str(path), json.dumps(schema,sort_keys=True))
        if key not in reference_results:
            reference_results[key] = schema_reference_errors(schema,path)
        return reference_results[key]
    def check(ok, label):
        nonlocal checks
        checks += 1
        family = label.split(':', 1)[0]
        stats = per_family.setdefault(family, {'checks': 0, 'failures': 0})
        stats['checks'] += 1
        if not ok:
            failures.append(label)
            stats['failures'] += 1
    def finish():
        print(json.dumps({'status':'pass' if not failures else 'fail','checks':checks,'failures':failures,
                          'per_family':per_family,'native_execution':'NOT_RUN',
                          'coverage':'Static standing checks 1-10; every product refusal is a named row of a phase table (scripts/pm_dch_table_*.py), and check 11 is the shared pm_guard_isolation.py run over those tables (scripts/pm-dch-guard-tables.py): append, transport, retry, registry parity, complete schema-reference closure, populated histories, retained-original lookup and checkpoint relations. Source/access adapters are synthetic. Native process, receipt, CRC, full-source coverage, redb CAS, durability, custody and withdrawal are NOT_RUN.'},indent=2))
        return bool(failures)
    # Every phase table's factory requires its rows in exactly the table order.
    order_errors = table_order_errors()
    check(not order_errors, 'shared: every table factory requires its rows in table order ' + '; '.join(order_errors))
    # Preflight every selected schema before validating a single instance. In
    # particular an empty history must not conceal an unresolved reference.
    for row in contracts:
        check(row['outcome'] == 'register_prepared', row['event_type'] + ': prepared candidate remains prepared')
        if row['outcome'] == 'blocked_on_Jared':
            continue
        event = row['event_type']
        schemas = [(row['payload_schema_ref'].split('#')[0], 'payload')]
        cases = [c for c in checkpoints if c['event_type'] == event]
        check(len(cases) == 1, event + ': one checkpoint fixture')
        for case in cases:
            path = case['schema_ref'].split('#')[0]
            schema = json.loads((ROOT/path).read_text())
            schemas.append((path, 'selected checkpoint'))
            entries = [s for s in stored if s['value_schema_id'] == schema['$id']]
            check(len(entries) == 1, event + ': one registered checkpoint schema')
            for entry in entries:
                check(entry['value_schema_ref'] == case['schema_ref']
                      and entry['schema_version'] == schema['properties']['schema_version']['const']
                      and entry['value_schema'] == schema,
                      event + ': registered checkpoint exactly equals selected schema')
                errors = reference_errors(entry['value_schema'], ROOT/path)
                check(reference_closure_refusal(errors) is None,
                      event + ': registered checkpoint reference closure ' + '; '.join(errors))
        for recipe, original in RETAINED_RECIPES.items():
            for path in ['Plans/event_record.schema.json', row['payload_schema_ref'].split('#')[0], cases[0]['schema_ref'].split('#')[0]]:
                errors = reference_errors(original['schemas'][path], ROOT/path)
                check(reference_closure_refusal(errors) is None,
                      event + ': retained '+recipe+' reference closure '+path+'; '.join(errors))
        schemas.append(('Plans/event_record.schema.json', 'envelope'))
        for path, kind in schemas:
            errors = reference_errors(json.loads((ROOT/path).read_text()), ROOT/path)
            check(reference_closure_refusal(errors) is None,
                  event + ': ' + kind + ' reference closure ' + '; '.join(errors))
    if failures:
        return finish()
    def leaf_paths(value, path=()):
        if isinstance(value, dict):
            for k, v in value.items():
                yield from leaf_paths(v, path + (k,))
        elif isinstance(value, list):
            for k, v in enumerate(value):
                yield from leaf_paths(v, path + (k,))
        else:
            yield path, value
    def changed(value, path, replacement):
        result = copy.deepcopy(value)
        target = result
        for k in path[:-1]:
            target = target[k]
        target[path[-1]] = replacement
        return result
    def trailing_lf_checks(value, schema, validator, label):
        patterns = []
        def collect(s):
            if isinstance(s, dict):
                if 'pattern' in s:
                    patterns.append(s['pattern'])
                    check(s['pattern'].endswith(r'$(?![\s\S])'), label + ': exact regex guard ' + s['pattern'])
                for v in s.values(): collect(v)
            elif isinstance(s, list):
                for v in s: collect(v)
        collect(schema)
        for path, value_at_path in leaf_paths(value):
            if isinstance(value_at_path, str) and any(re.search(p, value_at_path) for p in patterns):
                check(not validator.is_valid(changed(value, path, value_at_path + '\n')),
                      label + ': trailing LF ' + '.'.join(map(str, path)))
    for row in contracts:
        event = row['event_type']
        check(row['append_policy'] == 'dedupe_by_idempotency_key', event + ': selected current append policy')
        check(event not in [f['event_type'] for f in registry['families']], event+': absent registry')
        if row['outcome']=='blocked_on_Jared':
            continue
        schema = json.loads((ROOT/row['payload_schema_ref']).read_text())
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        cases = [f for f in fixtures if f['event_type']==event]
        check(len(cases)==2, event+': two editions')
        ids = []
        for case in cases:
            p = case['valid']
            check(validator.is_valid(p) and valid_scope_partition(p['scope']), event+': '+case['edition']+' positive')
            trailing_lf_checks(p, schema, validator, event + ':' + case['edition'])
            if 'exit_code' not in p:
                invalid=copy.deepcopy(p);invalid['exit_code']=0
                check(not validator.is_valid(invalid),event+': no fabricated exit-code outcome')
            ids.append(identity(event, p))
            for field in case['missing_fields']:
                invalid=copy.deepcopy(case.get('missing_field_bases',{}).get(field,p)); del invalid[field]
                check(not validator.is_valid(invalid), event+': missing '+field)
            for name in ['extra_field','wrong_version','scope_mismatch']:
                invalid=copy.deepcopy(p)
                if name=='extra_field': invalid['unexpected']=True
                if name=='wrong_version': invalid['schema_version']='9.0.0'
                if name=='scope_mismatch': invalid['scope']['project_id']='alien' if case['edition']=='application' else None
                check(not validator.is_valid(invalid),event+': '+name)
            # Operation identity is independent of payload result: changed content
            # must be compared using the persisted semantic digest, never re-keyed.
            invalid=copy.deepcopy(p); invalid['actor_ref']='pmref:fixture:other_actor'
            check(identity(event,p)==identity(event,invalid),event+': stable retry key')
            check(hashlib.sha256(json.dumps(p,sort_keys=True).encode()).digest()!=hashlib.sha256(json.dumps(invalid,sort_keys=True).encode()).digest(), event+': changed semantics digest')
            for oracle in case.get('partition_oracles', []):
                scope=copy.deepcopy(p['scope']); scope.update(project_id=oracle['project_id'], scope_partition=oracle['scope_partition'])
                check(valid_scope_partition(scope)==oracle['expected_valid'],event+': partition '+oracle['name'])
                if oracle['expected_valid']:
                    # Also validate complete non-ASCII/punctuation payloads and their records.
                    sample=copy.deepcopy(case['record']); sample['payload']['scope']=scope
                    sample['project_id']=scope['project_id']; sample['event_id']=identity(event,sample['payload'])
                    sample['idempotency_key']=idempotency_key(event,sample['payload'])
                    check(validator.is_valid(sample['payload']) and joins(sample,event),event+': partition record '+oracle['name'])
        check(len(set(ids))==2,event+': separated scope identities')
        for doc, unit_key in [('assistant-chat-design.md','owner_unit'),('Contracts_V0.md','payload_unit'),('storage-plan.md','storage_unit')]:
            text=(ROOT/'Plans'/doc).read_text()
            check('plan_unit_id: '+row[unit_key] in text,event+': owner '+unit_key)
        storage=(ROOT/'Plans/storage-plan.md').read_text().split('### '+row['storage_unit']+' — ',1)[1].split('```yaml',1)[0]
        for token in ['SP-278','SP-286','PENDING_RETENTION_DECISION',row['reader'],row['projector'],'Withdrawal']:
            check(token in storage,event+': adoption '+token)
    envelope=Draft202012Validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()), format_checker=FormatChecker())
    for case in fixtures:
        record=case['record']; event=case['event_type']
        check(case['storage_instance_id']==STORAGE_INSTANCE,event+': actual Storage fixture instance')
        check(envelope.is_valid(record) and joins(record,event) and record['payload']==case['valid'], event+': envelope and source joins')
        for key in ['event_type','event_id','idempotency_key','payload_schema_id','scope_kind','project_id','thread_id','actor_ref','occurred_at_utc','payload_ref','run_id','node_id','attempt_id']:
            if key=='payload_ref':
                reference=next(o for o in case['transport_oracles'] if o['name']=='authorized_payload_reference')
                invalid=copy.deepcopy(reference['record']);parts=invalid['payload_ref'].split(':');parts[2]='c'*64
                invalid['payload_ref']=':'.join(parts)
                check(not joins(invalid,event,reference['source']),event+': envelope mismatch '+key)
            else:
                invalid=copy.deepcopy(record);invalid[key]='wrong'
                check(not joins(invalid,event),event+': envelope mismatch '+key)
        for key in ['event_id','idempotency_key']:
            invalid=copy.deepcopy(record);invalid[key]+='\n'
            check(not joins(invalid,event),event+': identifier trailing LF '+key)
        for oracle in case['retry_oracles']:
            retry=copy.deepcopy(record)
            retry.update(oracle.get('record_changes', {}))
            for key,value in oracle.get('payload_changes',{}).items():
                retry['payload'][key]=value
            if 'actor_ref' in oracle.get('payload_changes',{}): retry['actor_ref']=retry['payload']['actor_ref']
            check(retry_outcome(record,retry,oracle.get('dedupe_available',True))==oracle['expected'],event+': retry '+oracle['name'])
            if oracle['expected'] in ['conflict','original_result']:
                check(joins(retry,event),event+': retry preserves key '+oracle['name'])
        for policy in ['projector_replay_only', 'append_once', 'dedupe_by_event_id']:
            invalid=copy.deepcopy(record); invalid['replay_policy']=policy
            check(envelope.is_valid(invalid) and not joins(invalid,event),event+': forbidden append '+policy)
            expected='replay_only_not_appendable' if policy=='projector_replay_only' else 'invalid_append_policy'
            for first, second in [(record,invalid),(invalid,record),(invalid,invalid)]:
                check(retry_outcome(first,second)==expected,event+': forbidden retry '+policy)
        # Every owner-included semantic field must affect the result, independently.
        for key in SEMANTIC_FIELDS:
            retry=copy.deepcopy(record)
            old=retry[key]
            if key=='payload': retry[key]=semantic_body_mutation(record,event)
            elif key=='migration': retry[key]['migration_id']='changed'
            elif key=='producer_sequence_id': retry[key]=7
            elif key=='scope_kind': retry[key]='application' if old=='project' else 'project'
            elif key=='project_id': retry[key]='other_project'
            else: retry[key]='changed' if old is None else str(old)+':changed'
            if key=='actor_ref': retry['payload']['actor_ref']=retry['actor_ref']
            check(retry_outcome(record,retry)=='conflict',event+': semantic commitment '+key)
        retry=copy.deepcopy(record);retry['event_id']+='changed'
        check(retry_outcome(record,retry)=='conflict',event+': global event-ID integrity')
        for key, value in [('sequence_id',2),('observed_at_utc','2026-11-04T00:00:01Z'),('persisted_at_utc','2026-11-04T00:00:02Z')]:
            retry=copy.deepcopy(record);retry[key]=value
            check(retry_outcome(record,retry)=='original_result',event+': excluded Storage metadata '+key)
        schema=json.loads((ROOT/next(r['payload_schema_ref'] for r in contracts if r['event_type']==event)).read_text())
        validator=Draft202012Validator(schema,format_checker=FormatChecker())
        row=next(r for r in contracts if r['event_type']==event)
        for oracle in case['historical_oracles']:
            combined={'record':record,'witness':case['historical_source']}
            for path,value in oracle['changes'].items():
                combined=changed(combined,tuple(path.split('.')),value)
            check(historical_read_valid(combined['record'],row,combined['witness'],envelope,validator)
                  ==oracle['expected_valid'],event+': historical '+oracle['name'])
        for transport in case['transport_oracles']:
            candidate=transport['record']; source=transport.get('source')
            body=resolve_body(candidate,source)
            accepted=(envelope.is_valid(candidate) and joins(candidate,event,source)
                      and body is not None and validator.is_valid(body))
            check(accepted==transport['expected_valid'],event+': transport '+transport['name'])
        # Exact physical boundary independent of the family's maximum logical body.
        for size in [INLINE_LIMIT, INLINE_LIMIT+1]:
            probe={'probe':'x'*(size-10)}
            while len(body_bytes(probe)) != size:
                probe['probe']+='x' if len(body_bytes(probe))<size else ''
                if len(body_bytes(probe))>size: probe['probe']=probe['probe'][:-1]
            candidate=copy.deepcopy(record);candidate['payload']=probe
            check((resolve_body(candidate) is not None)==(size<=INLINE_LIMIT),event+': encoded inline boundary '+str(size))
        if 'test_source' in case:
            source=case['test_source']
            started_schema=json.loads((ROOT/'Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_started.schema.json').read_text())
            check(Draft202012Validator(started_schema,format_checker=FormatChecker()).is_valid(source['started']['payload'])
                  and envelope.is_valid(source['started']) and test_joins(record['payload'],source,event),event+': original test outcome join')
            for oracle in case['test_oracles']:
                combined={'payload':record['payload'],'source':source}
                for path,value in oracle['changes'].items():
                    combined=changed(combined,tuple(path.split('.')),value)
                check((validator.is_valid(combined['payload']) and test_joins(combined['payload'],combined['source'],event))
                      ==oracle['expected_valid'],event+': test outcome '+oracle['name'])
        if case['edition']=='application':
            invalid=copy.deepcopy(record);invalid['idempotency_key']='dch:'+identity(event,invalid['payload'])[len('evt_dch_'):]
            check(not joins(invalid,event),event+': reject incompatible application dch key')
            for key in ['server_id','operation_id']:
                changed_payload=copy.deepcopy(record['payload'])
                if key=='server_id': changed_payload['scope'][key]+=':other'
                else: changed_payload[key]+=':other'
                check(idempotency_key(event,changed_payload)!=record['idempotency_key'],event+': application original '+key)
        else:
            for oracle in case['partition_oracles']:
                if oracle['expected_valid']: continue
                # Keep envelope/identity internally consistent: the scope encoding alone must fail.
                invalid=copy.deepcopy(record);invalid['payload']['scope'].update(project_id=oracle['project_id'],scope_partition=oracle['scope_partition'])
                invalid['project_id']=oracle['project_id'];invalid['event_id']=identity(event,invalid['payload']);invalid['idempotency_key']=idempotency_key(event,invalid['payload'])
                check(not joins(invalid,event),event+': reject self-consistent wrong partition '+oracle['name'])
        if event=='chat.thread_archived':
            check(archive_joins(record['payload'],case['archive_source']),event+': archive original source joins')
            validator=Draft202012Validator(json.loads((ROOT/'Plans/dch_event_payloads/chat_thread_archived.schema.json').read_text()),format_checker=FormatChecker())
            for oracle in case['archive_oracles']:
                p=copy.deepcopy(record['payload']); source=copy.deepcopy(case['archive_source'])
                for path,value in oracle['changes'].items():
                    target={'payload':p,'source':source};parts=path.split('.')
                    for part in parts[:-1]: target=target[part]
                    target[parts[-1]]=value
                check((validator.is_valid(p) and archive_joins(p,source))==oracle['expected_valid'],event+': archive '+oracle['name'])
    for case in checkpoints:
        schema=json.loads((ROOT/case['schema_ref'].split('#')[0]).read_text())
        validator=Draft202012Validator(schema, format_checker=FormatChecker())
        row=next(r for r in contracts if r['event_type']==case['event_type'])
        check(validator.is_valid(case['valid']) and checkpoint_joins(case['valid'],case['source'],row,case['key']), case['event_type']+': checkpoint positive')
        entry=next(s for s in stored if s['value_schema_id']==schema['$id'])
        # Both real definitions, and both empty and populated histories, are
        # exercised independently even though preflight also requires equality.
        for kind, definition in [('selected',schema),('registered',entry['value_schema'])]:
            actual=Draft202012Validator(definition,format_checker=FormatChecker())
            for name,value in [('current',case['valid']),('populated history',case['with_history']),('maximum history',case['maximum_history'])]:
                check(actual.is_valid(value) and checkpoint_joins(value,case['source'],row,case['key']),
                      case['event_type']+': '+kind+' checkpoint '+name+' positive')
                trailing_lf_checks(value,definition,actual,case['event_type']+': '+kind+' checkpoint '+name)
        for name in case['negative_cases']:
            invalid=copy.deepcopy(case['valid'])
            if name=='persisted_redb_snapshot_id': invalid['source_token']['redb_snapshot_id']='forbidden'
            if name=='wrong_consumer': invalid['consumer_id']='sibling'
            if name=='wrong_projector': invalid['projector_id']='sibling'
            if name=='missing_source_token': del invalid['source_token']
            if name=='four_generations': invalid=copy.deepcopy(case['negative_values'][name])
            check(not validator.is_valid(invalid), case['event_type']+': '+name)
        for oracle in case['join_oracles']:
            combined={'value':case['valid'],'source':case['source'],'key':case['key']}
            for path,value in oracle['changes'].items():
                combined=changed(combined,tuple(path.split('.')),value)
            check((validator.is_valid(combined['value']) and checkpoint_joins(combined['value'],combined['source'],row,combined['key']))
                  ==oracle['expected_valid'],case['event_type']+': checkpoint join '+oracle['name'])
    # The same independent acceptance cases feed the guard-removal corpus.
    from types import SimpleNamespace
    from pm_dch_round5_oracles import cases as round5_cases, evaluate
    subject = SimpleNamespace(**globals())
    for oracle in round5_cases(subject):
        check(evaluate(subject, oracle, envelope) == oracle.expected, oracle.name.split('/')[0]+': '+oracle.name)
    from pm_dch_round6_oracles import cases as round6_cases, evaluate as evaluate6
    for oracle in round6_cases(subject):
        check(evaluate6(subject, oracle, envelope) == oracle.expected, oracle.name.split('/')[0]+': '+oracle.name)
    from pm_dch_round7_oracles import cases as round7_cases, evaluate as evaluate7
    for oracle in round7_cases(subject):
        check(evaluate7(subject, oracle, envelope) == oracle.expected, oracle.name.split('/')[0]+': '+oracle.name)
    from pm_dch_round8_oracles import cases as round8_cases, evaluate as evaluate8
    for oracle in round8_cases(subject):
        check(evaluate8(subject, oracle, envelope) == oracle.expected, oracle.name.split('/')[0]+': '+oracle.name)
    # Shared NUMRULE number corpus through DCH's own number boundaries (part 2B numbers).
    from pm_dch_number_corpus import run as number_corpus
    for case_id, ok, detail in number_corpus(subject):
        check(ok, 'shared: number corpus ' + case_id + ' ' + detail)
    # Sweep part 2A single-row witnesses for guard-table rows no earlier negative reached first.
    from pm_dch_guard_witnesses import cases as table_cases, evaluate as evaluate_table
    for oracle in table_cases(subject):
        check(evaluate_table(subject, oracle, envelope) == oracle.expected, oracle.name.split('/')[0]+': '+oracle.name)
    return finish()

if __name__=='__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', help='Run one complete family, both editions and its checkpoint, serially.')
    SELECTED_FAMILY = parser.parse_args().family
    sys.exit(main())

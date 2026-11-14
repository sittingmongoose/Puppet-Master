#!/usr/bin/env python3
"""W3F synthetic contract oracles (wave 3 phase 2). No native execution or writer admission.

Fifteen prepared families (CV-1450..CV-1464, SP-1450..SP-1464): autonomy.ceiling_checked, eight
discovery.* receipts, planning.question_budget_exhausted, run.graph_canonical_locked and four
session_prompt.* inbox facts. Membership stays ABSENT; every scenario models a hypothetical future
admission only to exercise the owner predicates.

Method B guard tables. Every refusal is decided by one named row of a generated table module
``scripts/pm_w3f_table_<table>.py`` (generator ``scripts/pm-w3f-table-generate.py``; the row
specification is ``ROWS`` below). ``observe`` computes one boolean per row from the complete scenario:
True when the row's single predicate holds or the row does not apply (other path, other family, or a
precondition an earlier row owns). It never decides acceptance. ``evaluate`` runs the table predicates
in table order and returns the first refusing row. Check 11 is proved by the gated
``scripts/pm_guard_isolation.py`` through ``scripts/pm-w3f-guard-tables.py``.

Numbers (CV-1100/SP-1100): fixture text is parsed with the shared ``loads_exact`` and every integer
token becomes an exact integer through ``current_integer``; every schema integer slot the stock
validator admits must then pass ``current_integer``; Storage uint64 fields pass ``storage_uint64``; the
producer projection is qualified with ``producer_semantic_bytes``/``producer_semantic_digest``; the W3F
identity preimages use ``qualified_jcs``; inline size and pack bytes use ``storage_value_bytes`` and
``verify_payload_bytes``. No lane serializer, cap or normalization.

Timestamps (CV-1101): every timestamp field goes through the shared ``pm_event_datetime.date_time``
with the profile its owner names (``TIMESTAMP_PROFILES``). Schema verdicts use the shared
``format_checker(profile=EVENT_RECORD)``; the CV-253 Storage restriction is its own row per field.

Retained originals (SP-1101): a retry original and a retained history read resolve once through the
shared ``RetainedDispatcher``. ``W3FOriginalOwner`` answers only from Storage's sealed write custody
(``Plans/w3f_original_custody.json``), from the one sealed receipt for that exact original; no
receipt, a receipt bound to another original, or several receipts never select a recipe. No receipt is
created while reading. New writes take the writer's own recipe and read no receipt.
"""
from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import importlib
import json
import re
import sys
from contextlib import contextmanager
from functools import lru_cache
from pathlib import Path

from jsonschema import Draft202012Validator, validators

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pm_event_numbers import (  # noqa: E402
    EVENT_VALUE, FrozenRecipe, JsonNumber, OriginalBinding, OriginalCustody, RecipeTuple, Refusal,
    RetainedDispatcher, current_append_policy, current_integer, decode_storage_value, full_value_commitment,
    loads_exact, producer_semantic_bytes, producer_semantic_digest, qualified_jcs, storage_uint64,
    storage_value_bytes, verify_payload_bytes,
)
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time, format_checker  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
TABLE_PREFIX = 'pm_w3f_table_'
SCHEMA_DIR = 'Plans/event_payloads/w3f'
FIXTURES = 'w3f_event_fixtures.json'
CUSTODY_FILE = 'w3f_original_custody.json'
PATHS = ('append', 'retry', 'history', 'install', 'checkpoint')
AR = 'append retry'
CAUGHT = (KeyError, TypeError, ValueError, IndexError, AttributeError, OverflowError, StopIteration)
INLINE_LIMIT = 16384
PACK_MEDIA = 'application/vnd.puppetmaster.event-payload+msgpack'
PROMPT_RECIPE = 'pm.w3f.session_prompt.normalization.v1@1.0.0'
U32_MAX = 4294967295
BOTH = ('application', 'project')

# event_type -> (kind, CV unit, SP unit, scopes, producer, subject field)
FAMILY_SPECS = {
    'autonomy.ceiling_checked': ('autonomy', 'CV-1450', 'SP-1450', BOTH, 'RuntimeAutonomyCeiling.check_after_parse@1.0.0', 'receipt_id'),
    'discovery.backpressure': ('discovery', 'CV-1451', 'SP-1451', BOTH, 'DiscoveryService resource scheduler@1.0.0', 'receipt_id'),
    'discovery.candidates_returned': ('discovery', 'CV-1452', 'SP-1452', BOTH, 'DiscoveryService post-policy result publisher@1.0.0', 'receipt_id'),
    'discovery.disabled': ('discovery', 'CV-1453', 'SP-1453', BOTH, 'DiscoveryService enable/kill-switch gate@1.0.0', 'receipt_id'),
    'discovery.fallback': ('discovery', 'CV-1454', 'SP-1454', BOTH, 'DiscoveryService fallback resolver@1.0.0', 'receipt_id'),
    'discovery.invoked': ('discovery', 'CV-1455', 'SP-1455', BOTH, 'DiscoveryService discover_paths admission@1.0.0', 'receipt_id'),
    'discovery.selected': ('discovery', 'CV-1456', 'SP-1456', BOTH, 'DiscoveryService opaque-result selection handler@1.0.0', 'receipt_id'),
    'discovery.unsupported': ('discovery', 'CV-1457', 'SP-1457', BOTH, 'DiscoveryService capability gate@1.0.0', 'receipt_id'),
    'discovery.verified': ('discovery', 'CV-1458', 'SP-1458', BOTH, 'DiscoveryService exact-verification receipt bridge@1.0.0', 'receipt_id'),
    'planning.question_budget_exhausted': ('budget', 'CV-1459', 'SP-1459', BOTH, 'PlanningQuestionAdmissionCoordinator.exhaustion_result@1.0.0', 'exhaustion_id'),
    'run.graph_canonical_locked': ('graph', 'CV-1460', 'SP-1460', ('project',), 'ExecutorCanonicalGraph.commit_lock@1.0.0', 'lock_id'),
    'session_prompt.admitted': ('prompt', 'CV-1461', 'SP-1461', BOTH, 'SessionPromptInbox.admitted@1.0.0', 'admission_id'),
    'session_prompt.cancelled': ('prompt', 'CV-1462', 'SP-1462', BOTH, 'SessionPromptInbox.cancelled@1.0.0', 'admission_id'),
    'session_prompt.expired': ('prompt', 'CV-1463', 'SP-1463', BOTH, 'SessionPromptInbox.expired@1.0.0', 'admission_id'),
    'session_prompt.rejected': ('prompt', 'CV-1464', 'SP-1464', BOTH, 'SessionPromptInbox.rejected@1.0.0', 'admission_id'),
}
FAMILIES = tuple(FAMILY_SPECS)
CONTEXT_FIELDS = ('scope_kind', 'project_id', 'server_id', 'thread_id', 'host_id', 'working_root_ref', 'worktree_id',
                  'remote_identity_ref')
# CV-1451..CV-1458 paragraph 2: the actual owner outcome each discovery receipt records.
DISCOVERY_OUTCOME = {
    'discovery.backpressure': 'resource_cap_reached', 'discovery.candidates_returned': 'post_policy_results_published',
    'discovery.disabled': 'discovery_disabled', 'discovery.fallback': 'fallback_selected',
    'discovery.invoked': 'request_accepted', 'discovery.selected': 'opaque_result_selected',
    'discovery.unsupported': 'capability_unsupported', 'discovery.verified': 'exact_verification_linked'}
NO_QUERY_FAMILIES = ('discovery.disabled', 'discovery.unsupported')
CACHE_FIELDS = ('cache_schema_version', 'ranking_policy_version', 'policy_hash', 'ignore_hash', 'identity_hash')
# QMAX backend mapping (CV-1459 paragraph 2): Plan -> questionnaire, Deep Plan -> ledger, others -> QuestionBank.
BUDGET_BACKEND = {'plan': 'questionnaire', 'deep_plan': 'deep_ledger_session', 'brainstorm': 'question_bank',
                  'crew': 'question_bank', 'chat_room': 'question_bank'}
BUDGET_EFFECTS = ('question_items_added', 'counter_changed', 'run_failed', 'grill_auto_confirmed', 'build_disabled_by_budget')
# CV-1461..CV-1464 paragraph 2: the only predecessor inbox states of each lifecycle fact.
PROMPT_PREDECESSORS = {'session_prompt.admitted': ('queued',), 'session_prompt.cancelled': ('queued', 'admitted'),
                       'session_prompt.expired': ('queued', 'admitted'), 'session_prompt.rejected': ('received',)}
PROMPT_STATE = {'session_prompt.admitted': 'admitted', 'session_prompt.cancelled': 'cancelled_before_execution',
                'session_prompt.expired': 'expired', 'session_prompt.rejected': 'rejected'}
MODE_RANK = {'ask': 0, 'plan': 0, 'regular': 1, 'yolo': 2}
READ_ONLY = ('ask', 'plan')
AUTONOMY_STEPS = ('parse', 'schema', 'ceiling', 'ceiling_receipt_synced', 'permissions', 'filesafe', 'dispatch')
READER_SINKS_COMMON = ('append', 'notification', 'network', 'usage')
READER_SINKS = {'discovery': ('search',), 'autonomy': ('dispatch', 'tool'), 'budget': ('question', 'charge', 'grill_confirm', 'build'),
                'prompt': ('execution',), 'graph': ('dispatch',)}

# CV-1101 profile per owned timestamp field. The predicate is the shared date_time; nothing here is a grammar.
#   EventRecord occurred_at_utc and the autonomy payload created_at_utc (format date-time): event_record.
#   CV-253 Storage-assigned observed_at_utc/persisted_at_utc: storage_utc_z, on top of the envelope verdict.
#   CV-339 AppendReceipt acknowledged_at_utc (its owner schema says format date-time): event_record.
#   SP-1450 checkpoint published_at_utc/retired_at_utc ("the existing Storage timestamp authority"): the
#   schema verdict's event_record plus storage_utc_z rows.
TIMESTAMP_PROFILES = {
    'envelope/occurred_at_utc': EVENT_RECORD,
    'envelope/observed_at_utc': STORAGE_UTC_Z,
    'envelope/persisted_at_utc': STORAGE_UTC_Z,
    'payload/created_at_utc': EVENT_RECORD,
    'receipt/acknowledged_at_utc': EVENT_RECORD,
    'checkpoint/published_at_utc': STORAGE_UTC_Z,
    'checkpoint/retired_at_utc': STORAGE_UTC_Z,
}
DATETIME_FORMATS = format_checker(profile=EVENT_RECORD)


def date_time_ok(value, field):
    try:
        return date_time(value, profile=TIMESTAMP_PROFILES[field]) == value
    except Refusal:
        return False


# ---------------------------------------------------------------------------------------------
# Loading (CV-1100 exact numbers) and schemas
# ---------------------------------------------------------------------------------------------
def materialize(value):
    if type(value) is JsonNumber:
        return current_integer(value) if value.integer else float(value.token)
    if type(value) is list:
        return [materialize(v) for v in value]
    if type(value) is dict:
        return {k: materialize(v) for k, v in value.items()}
    return value


def loads_fixture(text):
    return materialize(loads_exact(text))


@lru_cache(maxsize=None)
def load(name):
    path = ROOT / 'Plans' / name
    if name == FIXTURES:
        return loads_fixture(path.read_text())
    return json.loads(path.read_text())


def kind(family):
    return FAMILY_SPECS[family][0]


def schema_file(family):
    return SCHEMA_DIR + '/' + family.replace('.', '_') + '.schema.json'


@lru_cache(maxsize=None)
def payload_schema(family):
    return json.loads((ROOT / schema_file(family)).read_text())


def payload_schema_id(family):
    return 'pm.event_payload.' + family + '.v1'


def local_refs_resolve(schema):
    """Every $ref resolves inside the resource, including unvisited branches; no retrieval."""
    def visit(node):
        if isinstance(node, dict):
            if '$ref' in node:
                ref = node['$ref']
                if type(ref) is not str or not ref.startswith('#'):
                    return False
                target = schema
                for part in [p for p in ref[1:].split('/') if p]:
                    part = part.replace('~1', '/').replace('~0', '~')
                    if not isinstance(target, dict) or part not in target:
                        return False
                    target = target[part]
            return all([visit(v) for v in node.values()])
        if isinstance(node, list):
            return all([visit(v) for v in node])
        return True
    return visit(schema)


def metaschema_ok(schema):
    try:
        Draft202012Validator.check_schema(schema)
        return True
    except Exception:  # noqa: BLE001 - any metaschema failure is a refusal of this row
        return False


@lru_cache(maxsize=None)
def payload_validator(family):
    schema = payload_schema(family)
    if not local_refs_resolve(schema) or not metaschema_ok(schema):
        raise RuntimeError('installed payload schema refused: ' + family)
    return Draft202012Validator(schema, format_checker=DATETIME_FORMATS)


@lru_cache(maxsize=None)
def event_schema():
    return load('event_record.schema.json')


@lru_cache(maxsize=None)
def event_validator():
    return Draft202012Validator(event_schema(), format_checker=DATETIME_FORMATS)


@lru_cache(maxsize=None)
def receipt_schema():
    return load('event_append_receipt_contracts.schema.json')['$defs']['AppendReceipt']


@lru_cache(maxsize=None)
def receipt_validator():
    return Draft202012Validator(receipt_schema(), format_checker=DATETIME_FORMATS)


@lru_cache(maxsize=None)
def token_schema():
    """SP-278 durable nine-field read token: the read_token def without the in-memory redb_snapshot_id."""
    s = copy.deepcopy(load('event_record_index_checkpoint.schema.json')['$defs']['read_token'])
    s['required'].remove('redb_snapshot_id')
    del s['properties']['redb_snapshot_id']
    return s


@lru_cache(maxsize=None)
def token_validator():
    return Draft202012Validator(token_schema(), format_checker=DATETIME_FORMATS)


# CV-1100 integer slots: the stock 'integer' type also admits an integral float. A recording type checker
# collects every instance the stock check admitted as an integer; each must be an exact current integer.
_SLOTS = []
_STOCK_TYPES = Draft202012Validator.TYPE_CHECKER


def _recording_integer(checker, instance):
    admitted = _STOCK_TYPES.is_type(instance, 'integer')
    if admitted:
        _SLOTS.append(instance)
    return admitted


SlotValidator = validators.extend(Draft202012Validator, type_checker=_STOCK_TYPES.redefine('integer', _recording_integer))


@lru_cache(maxsize=None)
def slot_validator(subject, family=None):
    schema = {'envelope': event_schema, 'receipt': receipt_schema, 'token': token_schema,
              'payload': lambda: payload_schema(family)}[subject]()
    return SlotValidator(schema)


def integer_slots_exact(subject, instance, family=None):
    del _SLOTS[:]
    slot_validator(subject, family).is_valid(instance)
    found = list(_SLOTS)
    del _SLOTS[:]
    try:
        for value in found:
            current_integer(value)
    except Refusal:
        return False
    return True


UUID = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')


def pattern_failures(value, schema):
    """A pattern or uuid format that does not match in full (Python's $ admits a trailing LF)."""
    if 'anyOf' in schema:
        selected = [s for s in schema['anyOf'] if Draft202012Validator(s).is_valid(value)]
        return bool(selected) and all([pattern_failures(value, s) for s in selected])
    if isinstance(value, str):
        if 'pattern' in schema and re.fullmatch(schema['pattern'], value) is None:
            return True
        if schema.get('format') == 'uuid' and UUID.fullmatch(value) is None:
            return True
        return False
    if isinstance(value, dict):
        return any([pattern_failures(v, schema.get('properties', {}).get(k, {})) for k, v in value.items()])
    if isinstance(value, list):
        return any([pattern_failures(v, schema.get('items', {})) for v in value])
    return False


def patterns_line_guarded(schema):
    """Static proof input for the entailed payload_fullmatch row: every pattern string schema also refuses
    CR/LF (not pattern [\\r\\n]) or fixes its length exactly, so a stock-valid value matches in full."""
    def visit(node):
        if isinstance(node, dict):
            if 'pattern' in node and node.get('type') == 'string':
                guarded = (node.get('not', {}).get('pattern') in ('[\r\n]', '[\u0000\r\n]') or
                           (node.get('minLength') is not None and node.get('minLength') == node.get('maxLength')))
                if not guarded:
                    return False
            return all([visit(v) for k, v in node.items() if k != 'not'])
        if isinstance(node, list):
            return all([visit(v) for v in node])
        return True
    return visit(schema)


for _family in FAMILIES:
    if not patterns_line_guarded(payload_schema(_family)):
        raise RuntimeError('payload_fullmatch entailment proof no longer holds for ' + _family)


def strict_equal(a, b):
    """Exact typed equality: bool is never int, int never float (SP-1100)."""
    if type(a) is not type(b):
        return False
    if isinstance(a, dict):
        return a.keys() == b.keys() and all([strict_equal(a[k], b[k]) for k in a])
    if isinstance(a, list):
        return len(a) == len(b) and all([strict_equal(x, y) for x, y in zip(a, b)])
    if type(a) is float:
        return a.hex() == b.hex()
    return a == b


@contextmanager
def exact_digits():
    """Scoped: no process-global digit-limit change outlives one observation (4,400-digit integers)."""
    before = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        yield
    finally:
        sys.set_int_max_str_digits(before)


# ---------------------------------------------------------------------------------------------
# Owner recipes (W3F CV-1450..CV-1464 paragraph 5; CV-366; Storage project~ partition)
# ---------------------------------------------------------------------------------------------
def partition(scope_kind, project_id):
    if scope_kind == 'application':
        return 'app'
    return 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')


def event_partition(e):
    return partition(e['scope_kind'], e['project_id'])


def event_id_recipe(storage_instance_id, recovery_epoch, scope_partition, event_type, operation):
    preimage = qualified_jcs([storage_instance_id, str(current_integer(recovery_epoch, minimum=0)), scope_partition,
                              event_type, operation])
    return 'evt_w3f_' + hashlib.sha256(preimage).hexdigest()


def key_recipe(scope_kind, event_type, server_id, operation):
    if scope_kind == 'application':
        return 'application@1:' + server_id.encode('utf-8').hex() + ':' + operation.encode('utf-8').hex()
    return 'w3f:' + event_type + ':' + operation.encode('utf-8').hex()


def normalize_prompt(text):
    return text.replace('\r\n', '\n').replace('\r', '\n')


def prompt_hash(text):
    return hashlib.sha256(normalize_prompt(text).encode('utf-8')).hexdigest()


def prompt_operation(p):
    return qualified_jcs([p['source_session_id'], p['prompt_id'], p['target_thread_id'], p['prompt_hash'],
                          p['admission_state']]).decode('utf-8')


def operation_of(family, p):
    if kind(family) == 'prompt':
        return prompt_operation(p)
    return p[FAMILY_SPECS[family][5]]


def query_digest(request_id, query_text):
    return hashlib.sha256(qualified_jcs([request_id, query_text])).hexdigest()


def self_receipt_ref(storage_instance_id, event_id):
    """The event's own SP-286 first-receipt custody ref: never an independent source result receipt."""
    return 'sp286:first_receipt:' + storage_instance_id + ':' + event_id


# ---------------------------------------------------------------------------------------------
# SP-1101 retained originals
# ---------------------------------------------------------------------------------------------
RECIPE_ID = 'w3f@1'
FROZEN_ORDER = ['decodes', 'envelope', 'payload', 'storage_times', 'operation', 'event_identity', 'key', 'full_value', 'producer',
                'custody_event']


def custody():
    return load(CUSTODY_FILE)


def resource_manifest(resources, profiles):
    return hashlib.sha256(json.dumps({'resources': resources, 'timestamp_profiles': profiles}, sort_keys=True,
                                     separators=(',', ':')).encode('ascii')).hexdigest()


def recipe_tuple(recipe_id, family, scope, manifest):
    r = custody()['recipes'][recipe_id]
    return RecipeTuple(
        envelope_schema_id=r['envelope_schema_id'], envelope_schema_version=r['envelope_schema_version'],
        payload_schema_id=payload_schema_id(family), payload_schema_version=r['payload_schema_version'],
        owner_source_id='Plans/Contracts_V0.md#' + FAMILY_SPECS[family][1], owner_edition=r['owner_edition'],
        registry_revision=r['registry_revision'], identity_recipe=r['identity_recipe'][scope],
        producer_recipe=r['producer_recipe'], physical_profile=r['physical_profile'],
        full_value_profile=r['full_value_profile'], local_source_profile=r['local_source_profile'],
        payload_profile=r['payload_profile'], resource_manifest_sha256=manifest)


def file_bytes(name):
    return (ROOT / name).read_bytes()


RECIPE_PROFILE_FIELDS = ('envelope/occurred_at_utc', 'envelope/observed_at_utc', 'envelope/persisted_at_utc',
                         'payload/created_at_utc')


def frozen_components(original, family):
    """The w3f@1 frozen verifier's checks over Storage's original, each its own fact (SP-1101 frozen recipe).
    Record and custody bytes are the original's; the recipe's own resources validate them; no current gate."""
    try:
        record = decode_storage_value(original.record_bytes, profile=EVENT_VALUE)
        held = decode_storage_value(original.receipt_bytes, profile=EVENT_VALUE)
    except Refusal:
        return {'decodes': False}
    out = {'decodes': type(record) is dict and type(held) is dict}
    if not out['decodes']:
        return out
    with exact_digits():
        out['envelope'] = (event_validator().is_valid(record) and integer_slots_exact('envelope', record) and
                           type(record.get('payload')) is dict)
        out['payload'] = out['envelope'] and payload_validator(family).is_valid(record['payload']) and \
            integer_slots_exact('payload', record['payload'], family)
        out['storage_times'] = out['envelope'] and all([date_time_ok(record[k], 'envelope/' + k)
                                                         for k in ('observed_at_utc', 'persisted_at_utc')])
        if out['payload']:
            p = record['payload']
            op = operation_of(family, p)
            out['operation'] = p['owner_operation_id'] == op
            out['event_identity'] = record['event_id'] == event_id_recipe(
                original.binding.storage_instance_id, held['recovery_epoch'], event_partition(record), family, p['owner_operation_id'])
            out['key'] = record['idempotency_key'] == key_recipe(record['scope_kind'], family, p['context']['server_id'],
                                                                 p['owner_operation_id'])
            out['full_value'] = held['full_value_sha256'] == full_value_commitment(record)
            out['producer'] = held['producer_semantic_sha256'] == producer_semantic_digest(record)
            out['custody_event'] = held['event_id'] == record['event_id'] and held['receipt']['event_id'] == record['event_id']
    return out


def frozen_verifier(expected_tuple, family):
    def verify(original):
        if original.recipe != expected_tuple:
            return False
        comps = frozen_components(original, family)
        return all([comps.get(k) is True for k in FROZEN_ORDER])
    return FrozenRecipe(verify)


def install_frozen_recipes(read=file_bytes, profiles=None):
    installed = {}
    profiles = profiles if profiles is not None else {k: TIMESTAMP_PROFILES[k] for k in RECIPE_PROFILE_FIELDS}
    for recipe_id in custody()['recipes']:
        names = sorted(custody()['recipes'][recipe_id]['resources'])
        manifest = resource_manifest({n: hashlib.sha256(read(n)).hexdigest() for n in names}, profiles)
        for family in FAMILIES:
            for scope in FAMILY_SPECS[family][3]:
                key = recipe_tuple(recipe_id, family, scope, manifest)
                installed[key] = frozen_verifier(key, family)
    return installed


@lru_cache(maxsize=None)
def frozen_recipes():
    return install_frozen_recipes()


def hexed(*parts):
    return ':'.join([str(x).encode('utf-8').hex() for x in parts])


def original_ref(storage_instance_id, e):
    return 'seglog:' + hexed(storage_instance_id, e['scope_kind'], e['event_type'], e['event_id'])


def binding_of(storage_instance_id, e, record_bytes):
    p = e['payload']
    return OriginalBinding(storage_instance_id=storage_instance_id, scope_kind=e['scope_kind'],
                           server_id=p['context']['server_id'], project_id=e['project_id'], event_type=e['event_type'],
                           event_id=e['event_id'], idempotency_key=e['idempotency_key'],
                           owner_operation_id=p['owner_operation_id'],
                           source_commitment=hashlib.sha256(record_bytes).hexdigest())


class W3FOriginalOwner:
    """Storage's sealed write custody at the requested Store (static stand-in for native custody).

    It answers only from CUSTODY: the Store must be sealed, and the write-time recipe comes only from the one
    sealed receipt Storage wrote for that exact original (Store, scope, event type, event id) whose source
    commitment is the record Storage holds. None for that id is original_unavailable; receipts for that id that
    bind other record bytes are original_unavailable (another original); several binding receipts are
    recipe_ambiguous; a receipt whose admission is not this family's at-write admission is original_admission.
    It never creates a receipt and never falls back to a Store default."""

    def __init__(self, record, held):
        self.record, self.held = record, held

    def authenticated_original(self, ref):
        try:
            store, scope, event_type, event_id = [bytes.fromhex(x).decode('utf-8') for x in ref[len('seglog:'):].split(':')]
        except (ValueError, UnicodeDecodeError):
            raise Refusal('original_query')
        if store not in custody()['stores']:
            raise Refusal('original_unavailable')
        at_id = [r for r in custody()['sealed_receipts'] if r['storage_instance_id'] == store and r['event_id'] == event_id
                 and r['event_type'] == event_type and r['scope_kind'] == scope]
        if not at_id:
            raise Refusal('original_unavailable')
        record_bytes = storage_value_bytes(self.record, profile=EVENT_VALUE)
        commitment = hashlib.sha256(record_bytes).hexdigest()
        binding = [r for r in at_id if r['source_commitment'] == commitment]
        if not binding:
            raise Refusal('original_other_receipt')
        if len(binding) != 1:
            raise Refusal('recipe_ambiguous')
        receipt = binding[0]
        recipe = custody()['recipes'].get(receipt['recipe'])
        if recipe is None:
            raise Refusal('recipe_unknown')
        if receipt.get('admission') != {'family': event_type, 'version': '1.0.0', 'registry_revision': recipe['registry_revision']}:
            raise Refusal('original_admission')
        return OriginalCustody(binding_of(store, self.record, record_bytes),
                               recipe_tuple(receipt['recipe'], event_type, scope, receipt['resource_manifest_sha256']),
                               record_bytes, storage_value_bytes(self.held['result'], profile=EVENT_VALUE),
                               storage_value_bytes(self.held, profile=EVENT_VALUE))


def dispatch(c, recipes=None):
    """One SP-1101 resolution of the original this retry or retained read asks for: 'ok' or the reason."""
    try:
        request, original = c['event'], c['storage']['event']
        sid = c['owner']['storage_instance_id']
        owner = W3FOriginalOwner(original, c['storage']['custody'])
        expected = binding_of(sid, request, storage_value_bytes(original, profile=EVENT_VALUE))
        selector = (c.get('reader') or c.get('retry') or {}).get('recipe_selector')
        RetainedDispatcher(owner, frozen_recipes() if recipes is None else recipes).resolve(
            original_ref(sid, request), expected, disclose=lambda binding: True, recipe_override=selector)
        return 'ok'
    except Refusal as refusal:
        return refusal.reason
    except CAUGHT:
        return 'original_query'


def resolved_original(c):
    """The authenticated original after a successful dispatch (for the frozen-component facts)."""
    sid = c['owner']['storage_instance_id']
    owner = W3FOriginalOwner(c['storage']['event'], c['storage']['custody'])
    return owner.authenticated_original(original_ref(sid, c['event']))


# ---------------------------------------------------------------------------------------------
# Per-case memo of derived values. Derivation decides nothing; rows read it.
# ---------------------------------------------------------------------------------------------
class Memo:
    def __init__(self, c):
        self.c, self.v = c, {}

    def get(self, name):
        if name not in self.v:
            self.v[name] = DERIVED[name](self.c, self)
        return self.v[name]


DERIVED = {}


def derived(fn):
    DERIVED[fn.__name__] = fn
    return fn


@derived
def event_dict(c, m):
    return type(c.get('event')) is dict


@derived
def family_ok(c, m):
    return c.get('family') in FAMILIES


@derived
def r0(c, m):
    """Scenario readable: known family, an event object of that family."""
    return m.get('family_ok') and m.get('event_dict') and c['event'].get('event_type') == c['family']


@derived
def env_valid(c, m):
    return m.get('r0') and event_validator().is_valid(c['event'])


@derived
def env_numbers(c, m):
    return integer_slots_exact('envelope', c['event'])


@derived
def r1(c, m):
    """Envelope ready: stock verdict, exact integers, uint64 sequence, Storage UTC times, payload schema id."""
    if not (m.get('env_valid') and m.get('env_numbers')):
        return False
    e = c['event']
    try:
        storage_uint64(e['sequence_id'])
    except Refusal:
        return False
    return (all([date_time_ok(e[k], 'envelope/' + k) for k in ('observed_at_utc', 'persisted_at_utc')]) and
            e['payload_schema_id'] == payload_schema_id(c['family']))


@derived
def payload_valid(c, m):
    return payload_validator(c['family']).is_valid(c['event']['payload'])


@derived
def payload_numbers(c, m):
    return integer_slots_exact('payload', c['event']['payload'], c['family'])


@derived
def r2(c, m):
    """Payload ready: r1, payload stock verdict and exact integers (later rows assume a valid payload)."""
    return m.get('r1') and m.get('payload_valid') and m.get('payload_numbers')


@derived
def inline_bytes(c, m):
    return len(storage_value_bytes(c['event']['payload'], profile=EVENT_VALUE))


@derived
def producer_ok(c, m):
    try:
        producer_semantic_bytes(c['event'])
        return True
    except Refusal:
        return False


@derived
def r3(c, m):
    """Body ready: r2, the size/pack route holds and the producer projection qualifies."""
    if not m.get('r2') or not m.get('producer_ok'):
        return False
    e = c['event']
    if e['payload_ref'] is None:
        return m.get('inline_bytes') <= INLINE_LIMIT
    return pack_route(c, m) and pack_bytes(c, m) and pack_body(c, m)


@derived
def disp(c, m):
    return dispatch(c)


@derived
def frozen(c, m):
    if m.get('disp') not in ('ok', 'original_verification'):
        return {}
    return frozen_components(resolved_original(c), c['family'])


# ---------------------------------------------------------------------------------------------
# Row specification. Every row: one predicate over one subject; ``fn(c, m)`` is True when the
# predicate holds or does not apply. ``kinds``/``families`` restrict a row to those families.
# ---------------------------------------------------------------------------------------------
ROWS = []
ENTAILED = {}   # row id -> (rows that always refuse first, proof)
GROUP_ORDER = []


def row(group, rid, code, field, words, fn, paths, kinds=None, families=None):
    if any([r['id'] == rid for r in ROWS]):
        raise ValueError('duplicate row ' + rid)
    if group not in GROUP_ORDER:
        GROUP_ORDER.append(group)
    frame = sys._getframe(1)
    while frame is not None and not (frame.f_code.co_filename == __file__ and frame.f_code.co_name == '<module>'):
        frame = frame.f_back
    ROWS.append({'group': group, 'id': rid, 'code': code, 'field': field, 'words': words, 'fn': fn,
                 'paths': frozenset(paths.split()), 'kinds': None if kinds is None else frozenset(kinds.split()),
                 'families': None if families is None else frozenset(families),
                 'line': frame.f_lineno if frame else None})


def entailed(rid, code, field, words, fn, paths, first, proof, kinds=None, families=None):
    """An unprovable row: alone in its own table, with the proof that earlier rows always refuse first."""
    row('entailed_' + rid, rid, code, field, words, fn, paths, kinds, families)
    ENTAILED[rid] = (tuple(first), proof)


def applies(r, c):
    if '*' not in r['paths'] and c.get('path') not in r['paths']:
        return False
    if r['families'] is not None and c.get('family') not in r['families']:
        return False
    if r['kinds'] is not None and (c.get('family') not in FAMILIES or kind(c['family']) not in r['kinds']):
        return False
    return True


def E(c):
    return c['event']


def P(c):
    return c['event']['payload']


def S(c):
    return c['owner']['source']


def gate(*names):
    """Run fn only when every named readiness level holds (an earlier row owns its failure)."""
    def wrap(fn):
        def held(c, m):
            for n in names:          # in order: a later level is computed only when the earlier holds
                if not m.get(n):
                    return True
            return fn(c, m)
        held.__name__ = fn.__name__
        return held
    return wrap


ALL = 'append retry history install checkpoint'
EVENT_PATHS = 'append retry history'

# scenario ----------------------------------------------------------------------------------
row('scenario', 'scenario_path', 'scenario_path', '/path', 'the path is append, retry, history, install or checkpoint',
    lambda c, m: c.get('path') in PATHS, '*')
row('scenario', 'scenario_family', 'scenario_family', '/family', 'the family is one of the fifteen W3F families',
    lambda c, m: c.get('family') in FAMILIES, '*')
row('scenario', 'event_family', 'event_family', '/event/event_type',
    'the event (candidate or presented retained record) is an object of the scenario family',
    lambda c, m: not m.get('family_ok') or (m.get('event_dict') and c['event'].get('event_type') == c['family']), EVENT_PATHS)

# install (eager resource admission, CV-1450..1464 paragraph 4) ---------------------------------
row('install', 'install_metaschema', 'schema_install', '/resources', 'every installed family resource is a valid 2020-12 schema',
    lambda c, m: all([metaschema_ok(s) for s in c['resources'].values()]), 'install')
row('install', 'install_refs', 'schema_install', '/resources',
    'every $ref in every installed family resource resolves, including unvisited branches (eager, no retrieval)',
    lambda c, m: all([local_refs_resolve(s) for s in c['resources'].values()]), 'install')

# envelope (current writer and retry candidate) ---------------------------------------------------
row('envelope', 'envelope_schema', 'envelope_schema', '/event',
    'the EventRecord stock verdict (shared CV-1101 event_record date-time checker) accepts the event',
    lambda c, m: not m.get('r0') or m.get('env_valid'), AR)
row('envelope', 'envelope_numbers', 'current_integer', '/event', 'every EventRecord integer slot is an exact current integer (CV-1100)',
    gate('env_valid')(lambda c, m: m.get('env_numbers')), AR)
row('envelope', 'sequence_u64', 'storage_uint64', '/event/sequence_id', 'sequence_id is a Storage uint64 (SP-1100)',
    gate('env_valid', 'env_numbers')(lambda c, m: _uint64_ok(E(c)['sequence_id'])), AR)
for _k in ('observed_at_utc', 'persisted_at_utc'):
    row('envelope', 'storage_utc_z_' + _k, 'storage_utc_z', '/event/' + _k,
        'the Storage-assigned ' + _k + ' passes the shared date_time with the CV-253 storage_utc_z profile',
        gate('env_valid', 'env_numbers')(lambda c, m, k=_k: date_time_ok(E(c)[k], 'envelope/' + k)), AR)
row('envelope', 'payload_schema_id', 'payload_schema_id', '/event/payload_schema_id',
    'payload_schema_id names the family payload schema', gate('env_valid')(lambda c, m: E(c)['payload_schema_id'] == payload_schema_id(c['family'])), AR)


def _uint64_ok(value):
    try:
        storage_uint64(value)
        return True
    except Refusal:
        return False


# payload ----------------------------------------------------------------------------------------
row('payload', 'payload_schema', 'payload_schema', '/event/payload',
    'the family payload stock verdict (closed, required, types, enums, patterns; shared date-time checker) accepts it',
    gate('r1')(lambda c, m: m.get('payload_valid')), AR)
row('payload', 'payload_numbers', 'current_integer', '/event/payload', 'every payload integer slot is an exact current integer (CV-1100)',
    gate('r1', 'payload_valid')(lambda c, m: m.get('payload_numbers')), AR)
row('payload', 'producer_route', 'producer_route', '/event',
    'the CV-317 producer projection qualifies under CV-1100 (shared producer_semantic_bytes) before any effect',
    gate('r2')(lambda c, m: m.get('producer_ok')), AR)
row('payload', 'inline_size', 'inline_size', '/event/payload',
    'an inline body (payload_ref null) is at most 16 KiB of canonical SP-236 bytes (SP-337)',
    gate('r2', 'producer_ok')(lambda c, m: E(c)['payload_ref'] is not None or m.get('inline_bytes') <= INLINE_LIMIT), AR)


def pack_route(c, m):
    e, pack = E(c), c.get('pack')
    return type(pack) is dict and type(pack.get('payload_id')) is str and e['payload_ref'] == 'sp337:blake3:' + pack['payload_id']


def pack_bytes(c, m):
    pack = c['pack']
    try:
        verify_payload_bytes(bytes.fromhex(pack['bytes_hex']), byte_size=pack['byte_size'], payload_id=pack['payload_id'],
                             media_type=pack['media_type'], expected_media_type=PACK_MEDIA)
        return True
    except (Refusal, ValueError, TypeError, KeyError):
        return False


def pack_body(c, m):
    try:
        return strict_equal(decode_storage_value(bytes.fromhex(c['pack']['bytes_hex']), profile=EVENT_VALUE), P(c))
    except (Refusal, ValueError):
        return False


row('payload', 'pack_route', 'payload_ref', '/event/payload_ref',
    'a referenced body names its durable SP-337 pack (payload_ref = sp337:blake3:<payload_id>)',
    gate('r2', 'producer_ok')(lambda c, m: E(c)['payload_ref'] is None or pack_route(c, m)), AR)
row('payload', 'pack_bytes', 'payload_pack', '/pack',
    'the pack bytes match their BLAKE3 id, size and media type (shared verify_payload_bytes)',
    gate('r2', 'producer_ok')(lambda c, m: E(c)['payload_ref'] is None or not pack_route(c, m) or pack_bytes(c, m)), AR)
row('payload', 'pack_body', 'payload_pack', '/pack/bytes_hex',
    'the pack decodes (SP-236) to exactly the resolved payload body',
    gate('r2', 'producer_ok')(lambda c, m: E(c)['payload_ref'] is None or not pack_route(c, m) or not pack_bytes(c, m) or pack_body(c, m)), AR)
entailed('payload_fullmatch', 'payload_fullmatch', '/event/payload', 'every payload pattern matches in full (no trailing LF)',
         gate('r1', 'payload_valid')(lambda c, m: not pattern_failures(P(c), payload_schema(c['family']))), AR,
         ['payload_schema'],
         'Every pattern-bearing string schema in the fifteen Plans/event_payloads/w3f/*.schema.json resources either carries '
         'not:{pattern:"[\\r\\n]"} (or [\\u0000\\r\\n]) or fixes minLength == maxLength (the 64-hex digests). A value the stock '
         'verdict accepts therefore contains no LF (so Python $ is end of string) or has exactly the pattern length (a trailing '
         'LF would exceed maxLength); either way it matches in full. patterns_line_guarded() re-proves this at import and the '
         'module refuses to load if any resource changes. payload_schema (earlier table) refuses every other value.')

# scope and context joins -------------------------------------------------------------------------
R3 = gate('r3')
row('scope', 'scope_kind_copy', 'scope_copy', '/event/payload/context/scope_kind', 'context.scope_kind equals the envelope scope_kind',
    R3(lambda c, m: P(c)['context']['scope_kind'] == E(c)['scope_kind']), AR)
entailed('scope_supported', 'scope_unsupported', '/event/scope_kind', 'the family supports this scope (graph lock: Project only)',
         R3(lambda c, m: E(c)['scope_kind'] in FAMILY_SPECS[c['family']][3]), AR, ['payload_schema', 'scope_kind_copy'],
         'Only run.graph_canonical_locked restricts its scopes (FAMILY_SPECS: project only; every other family supports both). '
         'Its payload schema fixes context.scope_kind const "project" (Plans/event_payloads/w3f/run_graph_canonical_locked.schema.json '
         'properties.context.properties.scope_kind), so an application-scope context is refused by payload_schema; a project '
         'context under an application envelope differs from the envelope scope_kind and scope_kind_copy (scope table, earlier) '
         'refuses it.')
row('scope', 'scope_project_copy', 'scope_copy', '/event/payload/context/project_id', 'context.project_id equals the envelope project_id',
    R3(lambda c, m: P(c)['context']['scope_kind'] != E(c)['scope_kind'] or strict_equal(P(c)['context']['project_id'], E(c)['project_id'])), AR)
row('scope', 'scope_thread_copy', 'scope_copy', '/event/payload/context/thread_id', 'context.thread_id equals the envelope thread_id',
    R3(lambda c, m: strict_equal(P(c)['context']['thread_id'], E(c)['thread_id'])), AR)
row('scope', 'target_partition', 'scope_partition', '/target/scope_partition',
    'the Storage partition appended to is the exact app / project~base64url partition of the event',
    R3(lambda c, m: c['target']['scope_partition'] == event_partition(E(c))), AR)
@derived
def scope_ok(c, m):
    ctx, e = c['event']['payload']['context'], c['event']
    return (ctx['scope_kind'] == e['scope_kind'] and strict_equal(ctx['project_id'], e['project_id']) and
            strict_equal(ctx['thread_id'], e['thread_id']))


SCOPED = gate('r3', 'scope_ok')
for _f in CONTEXT_FIELDS:
    row('context', 'context_' + _f, 'context_' + _f, '/event/payload/context/' + _f,
        'context.' + _f + ' equals the genuine accepted owner context (no focus fallback or substitution)',
        SCOPED(lambda c, m, f=_f: strict_equal(P(c)['context'][f], c['owner'][f])), AR)
for _f in ('run_id', 'attempt_id', 'node_id'):
    row('context', 'lineage_' + _f, 'lineage', '/event/' + _f, 'the envelope ' + _f + ' equals the owner lineage',
        R3(lambda c, m, f=_f: strict_equal(E(c)[f], c['owner'][f])), AR)
row('context', 'app_thread_admitted', 'discovery_root', '/owner/source/thread_admitted',
    'application discovery runs in its real admitted thread (T-161)',
    R3(lambda c, m: E(c)['scope_kind'] != 'application' or S(c)['thread_admitted'] is True), AR, kinds='discovery')
row('context', 'app_root_admitted', 'discovery_root', '/owner/source/root_admitted',
    'application discovery runs under its explicitly admitted working root (T-161)',
    R3(lambda c, m: E(c)['scope_kind'] != 'application' or S(c)['root_admitted'] is True), AR, kinds='discovery')

# identity ------------------------------------------------------------------------------------------
row('identity', 'source_identity', 'source_identity', '/event/payload',
    'the family subject (receipt_id, exhaustion_id, lock_id or admission_id) is the actual owner operation subject',
    R3(lambda c, m: P(c)[FAMILY_SPECS[c['family']][5]] == S(c)[FAMILY_SPECS[c['family']][5]]), AR)
row('identity', 'operation_field', 'operation_identity', '/event/payload/owner_operation_id',
    'owner_operation_id is exactly the family operation identity (subject field, or the CV-314 prompt tuple)',
    R3(lambda c, m: P(c)['owner_operation_id'] == operation_of(c['family'], P(c))), AR)
row('identity', 'event_identity', 'event_identity', '/event/event_id',
    'event_id is evt_w3f_ + SHA-256 of JCS [storage_instance_id, original recovery_epoch, partition, event_type, operation]',
    R3(lambda c, m: E(c)['event_id'] == event_id_recipe(c['owner']['storage_instance_id'], c['owner']['recovery_epoch'],
                                                       event_partition(E(c)), c['family'], P(c)['owner_operation_id'])), AR)
row('identity', 'key_recipe_application', 'idempotency_key', '/event/idempotency_key',
    'an application key is CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}',
    R3(lambda c, m: E(c)['scope_kind'] != 'application' or E(c)['idempotency_key'] == key_recipe(
        'application', c['family'], P(c)['context']['server_id'], P(c)['owner_operation_id'])), AR)
row('identity', 'key_recipe_project', 'idempotency_key', '/event/idempotency_key',
    'a Project key is w3f:{event_type}:{hex(owner_operation_id)}',
    R3(lambda c, m: E(c)['scope_kind'] != 'project' or E(c)['idempotency_key'] == key_recipe(
        'project', c['family'], P(c)['context']['server_id'], P(c)['owner_operation_id'])), AR)
row('identity', 'prompt_key_copy', 'idempotency_key', '/event/payload/idempotency_key',
    'the prompt payload idempotency_key equals the EventRecord idempotency_key',
    R3(lambda c, m: P(c)['idempotency_key'] == E(c)['idempotency_key']), AR, kinds='prompt')

# producer and admission -----------------------------------------------------------------------------
row('writer', 'producer_identity', 'producer', '/producer', 'only the family producer prepares this fact',
    R3(lambda c, m: c['producer'] == FAMILY_SPECS[c['family']][4]), AR)
row('writer', 'admission_grant', 'family_unavailable', '/admission/writer_granted', 'the exact family writer grant is present',
    R3(lambda c, m: c['admission']['writer_granted'] is True), AR)
row('writer', 'admission_family', 'family_unavailable', '/admission/family', 'the admitted family is the event family',
    R3(lambda c, m: c['admission']['family'] == c['family']), AR)
row('writer', 'admission_version', 'family_unavailable', '/admission/version', 'the admitted version is 1.0.0 (unknown versions unavailable)',
    R3(lambda c, m: c['admission']['version'] == '1.0.0'), AR)
row('writer', 'writer_withdrawn', 'withdrawn', '/admission/writer_withdrawn', 'the producer is not fenced by a withdrawal cutoff',
    R3(lambda c, m: c['admission']['writer_withdrawn'] is False), AR)


def _policy(value):
    try:
        return current_append_policy(value)
    except Refusal as refusal:
        return refusal.reason


row('writer', 'replay_only', 'replay_only_not_appendable', '/event/replay_policy',
    'a current append refuses projector_replay_only (shared current_append_policy)',
    R3(lambda c, m: _policy(E(c)['replay_policy']) != 'replay_only_not_appendable'), AR)
row('writer', 'replay_policy_family', 'replay_policy', '/event/replay_policy',
    'the writer uses the family policy dedupe_by_idempotency_key',
    R3(lambda c, m: E(c)['replay_policy'] == 'projector_replay_only' or E(c)['replay_policy'] == 'dedupe_by_idempotency_key'), AR)

# publication (SP-286 / CV-339 first-receipt custody on a fresh append) -------------------------------
PUB = gate('r3')


def order(c, step):
    steps = c['publication']['order']
    return steps.index(step) if step in steps else None


for _k in ('sequence_id', 'observed_at_utc', 'persisted_at_utc'):
    row('publication', 'storage_' + _k, 'storage_metadata', '/event/' + _k,
        'the Storage-assigned ' + _k + ' is Storage\'s issued value, never the caller\'s',
        PUB(lambda c, m, k=_k: strict_equal(E(c)[k], c['storage_issued'][k])), 'append')
row('publication', 'custody_storage', 'receipt_custody', '/publication/custody/storage_instance_id',
    'first-receipt custody is in the same Storage instance', PUB(lambda c, m: c['publication']['custody']['storage_instance_id'] ==
                                                                 c['owner']['storage_instance_id']), 'append')
row('publication', 'custody_event', 'receipt_custody', '/publication/custody/event_id', 'custody names this event',
    PUB(lambda c, m: c['publication']['custody']['event_id'] == E(c)['event_id']), 'append')
row('publication', 'custody_receipt_schema', 'receipt_custody', '/publication/custody/receipt',
    'the receipt is the exact closed eleven-field AppendReceipt (CV-339) with exact integers',
    PUB(lambda c, m: receipt_validator().is_valid(c['publication']['custody']['receipt']) and
        integer_slots_exact('receipt', c['publication']['custody']['receipt'])), 'append')


def _receipt_ready(c, m):
    return receipt_validator().is_valid(c['publication']['custody']['receipt']) and \
        integer_slots_exact('receipt', c['publication']['custody']['receipt'])


row('publication', 'custody_receipt_event', 'receipt_custody', '/publication/custody/receipt/event_id', 'the receipt names this event',
    PUB(lambda c, m: not _receipt_ready(c, m) or c['publication']['custody']['receipt']['event_id'] == E(c)['event_id']), 'append')
row('publication', 'custody_receipt_sequence', 'receipt_custody', '/publication/custody/receipt/sequence_id',
    'the receipt sequence is Storage\'s issued sequence',
    PUB(lambda c, m: not _receipt_ready(c, m) or strict_equal(c['publication']['custody']['receipt']['sequence_id'],
                                                               c['storage_issued']['sequence_id'])), 'append')
row('publication', 'custody_full_value', 'receipt_custody', '/publication/custody/full_value_sha256',
    'custody commits the complete original value (CV-339 full_value_commitment)',
    PUB(lambda c, m: c['publication']['custody']['full_value_sha256'] == full_value_commitment(E(c))), 'append')
row('publication', 'custody_producer', 'receipt_custody', '/publication/custody/producer_semantic_sha256',
    'custody commits the producer-semantic digest (CV-317/CV-1100), never a supplied digest',
    PUB(lambda c, m: c['publication']['custody']['producer_semantic_sha256'] == producer_semantic_digest(E(c))), 'append')
row('publication', 'custody_epoch', 'receipt_custody', '/publication/custody/recovery_epoch',
    'custody records the original recovery epoch the identity used',
    PUB(lambda c, m: strict_equal(c['publication']['custody']['recovery_epoch'], c['owner']['recovery_epoch'])), 'append')
row('publication', 'order_body_before_append', 'publication_order', '/publication/order', 'body/pack durability precedes the family append',
    PUB(lambda c, m: order(c, 'body_durable') is not None and order(c, 'append') is not None and order(c, 'body_durable') < order(c, 'append')), 'append')
row('publication', 'order_source_before_append', 'publication_order', '/publication/order',
    'an independently committed owner source commits before the append',
    PUB(lambda c, m: order(c, 'source_commit') is None or (order(c, 'append') is not None and order(c, 'source_commit') < order(c, 'append'))), 'append')
row('publication', 'order_append_before_receipt', 'publication_order', '/publication/order', 'the synced first receipt follows the append',
    PUB(lambda c, m: order(c, 'receipt_synced') is not None and order(c, 'append') is not None and order(c, 'append') < order(c, 'receipt_synced')), 'append')
row('publication', 'order_receipt_before_publication', 'publication_order', '/publication/order',
    'publication (and any downstream acceptance) follows the synced first receipt',
    PUB(lambda c, m: all([order(c, s) is None or (order(c, 'receipt_synced') is not None and order(c, 'receipt_synced') < order(c, s))
                          for s in ('publication', 'dispatch_accepted', 'search_published')])), 'append')

# source_receipt_ref (B4; CV-1459 paragraphs 3 and 8, CV-1451..1458 paragraph 3) ----------------------
row('source_receipt', 'source_receipt_not_self', 'source_receipt_ref', '/event/payload/source_receipt_ref',
    'source_receipt_ref never names this event\'s own SP-286 first-receipt custody (no self-reference)',
    R3(lambda c, m: P(c)['source_receipt_ref'] != self_receipt_ref(c['owner']['storage_instance_id'], E(c)['event_id'])),
    AR, kinds='budget discovery')
row('source_receipt', 'source_receipt_independent', 'source_receipt_ref', '/event/payload/source_receipt_ref',
    'source_receipt_ref is null unless an independently existing original result receipt exists, and then exactly that '
    'receipt (strict equality with the owner-captured independent receipt, null when none)',
    R3(lambda c, m: P(c)['source_receipt_ref'] == self_receipt_ref(c['owner']['storage_instance_id'], E(c)['event_id']) or
       strict_equal(P(c)['source_receipt_ref'], S(c)['independent_result_receipt_ref'])), AR, kinds='budget discovery')

# discovery (CV-1451..CV-1458 paragraph 2) -------------------------------------------------------------
row('discovery', 'disc_outcome', 'semantic_fact', '/owner/source/outcome', 'the actual owner outcome is this family\'s fact',
    R3(lambda c, m: S(c)['outcome'] == DISCOVERY_OUTCOME[c['family']]), AR, kinds='discovery')
for _f, _src, _words in [('request_id', 'request_id', 'the original request'), ('consumer_id', 'consumer_id', 'the consumer'),
                         ('permission_snapshot_id', 'permission_snapshot_id', 'the permission snapshot'),
                         ('approval_scope_key', 'approval_scope_key', 'the approval scope'),
                         ('redaction_profile', 'redaction_profile', 'the redaction profile'),
                         ('budget_ms', 'budget_ms', 'the scheduler budget'), ('elapsed_ms', 'elapsed_ms', 'the scheduler elapsed time'),
                         ('freshness_state', 'freshness_state', 'the freshness'), ('fallback_state', 'fallback_state', 'the fallback state'),
                         ('error_code', 'error_code', 'the error code'), ('policy_decision', 'policy_decision', 'the policy decision'),
                         ('source_index_generation', 'index_generation', 'the source index generation'),
                         ('verification_receipt_ref', 'verifier_receipt_ref', 'the existing exact verifier receipt')]:
    row('discovery', 'disc_' + _f, 'discovery_' + _f, '/event/payload/' + _f, _f + ' is ' + _words + ' of the original owner observation',
        R3(lambda c, m, f=_f, s=_src: strict_equal(P(c)[f], S(c)[s])), AR, kinds='discovery')
row('discovery', 'disc_query_commitment', 'query_commitment', '/event/payload/query_digest',
    'query_digest is SHA-256 of JCS [request_id, exact original authorized query_text]',
    R3(lambda c, m: P(c)['query_digest'] == query_digest(S(c)['request_id'], S(c)['query_text'])), AR, kinds='discovery')
row('discovery', 'disc_visible_count', 'visible_count', '/event/payload/candidate_count',
    'candidate_count is the size of the actual permitted post-policy result set',
    R3(lambda c, m: P(c)['candidate_count'] == len(S(c)['permitted_result_ids'])), AR, kinds='discovery')
row('discovery', 'disc_opaque_selection', 'opaque_selection', '/event/payload/selected_result_ids',
    'every selected opaque id belongs to the original request\'s permitted results',
    R3(lambda c, m: all([i in S(c)['permitted_result_ids'] for i in P(c)['selected_result_ids']])), AR, kinds='discovery')
row('discovery', 'disc_cache_presence', 'cache_identity', '/event/payload/cache_versions',
    'cache_versions is present-null exactly when no cache was used',
    R3(lambda c, m: (P(c)['cache_versions'] is None) == (S(c)['cache_versions'] is None)), AR, kinds='discovery')
for _f in CACHE_FIELDS:
    row('discovery', 'disc_cache_' + _f, 'cache_identity', '/event/payload/cache_versions/' + _f,
        'a used cache joins its actual ' + _f,
        R3(lambda c, m, f=_f: P(c)['cache_versions'] is None or S(c)['cache_versions'] is None or
           P(c)['cache_versions'][f] == S(c)['cache_versions'][f]), AR, kinds='discovery')
row('discovery', 'disc_ssh_presence', 'ssh_trust', '/event/payload/ssh_trust', 'ssh_trust is present-null exactly for a non-SSH request',
    R3(lambda c, m: (P(c)['ssh_trust'] is None) == (S(c)['ssh'] is None)), AR, kinds='discovery')
row('discovery', 'disc_ssh_host_identity', 'ssh_trust', '/event/payload/ssh_trust/host_identity_ref', 'SSH joins the actual host identity',
    R3(lambda c, m: P(c)['ssh_trust'] is None or S(c)['ssh'] is None or
       P(c)['ssh_trust']['host_identity_ref'] == S(c)['ssh']['host_identity_ref']), AR, kinds='discovery')
row('discovery', 'disc_ssh_host_trust', 'ssh_trust', '/event/payload/ssh_trust/host_trust_ref', 'SSH joins the current host trust',
    R3(lambda c, m: P(c)['ssh_trust'] is None or S(c)['ssh'] is None or
       P(c)['ssh_trust']['host_trust_ref'] == S(c)['ssh']['current_trust_ref']), AR, kinds='discovery')
row('discovery', 'disc_ssh_permission', 'ssh_trust', '/event/payload/ssh_trust/permission_snapshot_id',
    'SSH uses the same permission snapshot as the request',
    R3(lambda c, m: P(c)['ssh_trust'] is None or P(c)['ssh_trust']['permission_snapshot_id'] == P(c)['permission_snapshot_id']),
    AR, kinds='discovery')
row('discovery', 'disc_no_index_query', 'semantic_fact', '/effects/index_query', 'no index query executes after a disabled/unsupported refusal',
    R3(lambda c, m: c['effects']['index_query'] is False), AR, families=NO_QUERY_FAMILIES)

# budget (CV-1459 paragraph 2) -------------------------------------------------------------------------
row('budget', 'bud_typed_attempt', 'typed_attempt', '/owner/source/attempted_admission',
    'the fact records an actual refused question admission at zero remaining (not the last charge)',
    R3(lambda c, m: S(c)['attempted_admission'] is True), AR, kinds='budget')
for _f in ('workflow_kind', 'budget_run_id', 'question_records_ref', 'assistant_plan_id', 'strategy'):
    row('budget', 'bud_' + _f, 'budget_' + _f, '/event/payload/' + _f, _f + ' is the actual owner binding',
        R3(lambda c, m, f=_f: strict_equal(P(c)[f], S(c)[f])), AR, kinds='budget')
row('budget', 'bud_backend_map', 'backend_join', '/event/payload/backend', 'the backend is the QMAX backend of the workflow kind',
    R3(lambda c, m: P(c)['backend'] == BUDGET_BACKEND[P(c)['workflow_kind']]), AR, kinds='budget')
row('budget', 'bud_crew_plan_null', 'plan_binding', '/event/payload/assistant_plan_id', 'Crew and Chat Room carry no Plan binding',
    R3(lambda c, m: P(c)['workflow_kind'] not in ('crew', 'chat_room') or P(c)['assistant_plan_id'] is None), AR, kinds='budget')
row('budget', 'bud_crew_strategy_null', 'plan_binding', '/event/payload/strategy', 'Crew and Chat Room carry no Plan strategy',
    R3(lambda c, m: P(c)['workflow_kind'] not in ('crew', 'chat_room') or P(c)['strategy'] is None), AR, kinds='budget')
row('budget', 'bud_crew_base_zero', 'budget_policy', '/event/payload/base_limit', 'Crew and Chat Room have base_limit 0',
    R3(lambda c, m: P(c)['workflow_kind'] not in ('crew', 'chat_room') or P(c)['base_limit'] == 0), AR, kinds='budget')
row('budget', 'bud_crew_grill', 'budget_policy', '/event/payload/grill_me_enabled', 'Crew and Chat Room have an enabled Grill bank',
    R3(lambda c, m: P(c)['workflow_kind'] not in ('crew', 'chat_room') or P(c)['grill_me_enabled'] is True), AR, kinds='budget')
for _f in ('policy_ref', 'base_limit', 'grill_me_enabled', 'grill_me_extension'):
    row('budget', 'bud_' + _f, 'budget_policy', '/event/payload/' + _f, _f + ' equals the captured owner decision snapshot',
        R3(lambda c, m, f=_f: strict_equal(P(c)[f], S(c)['policy'][f])), AR, kinds='budget')
row('budget', 'bud_effective_limit', 'effective_limit', '/event/payload/effective_limit',
    'effective_limit = base_limit + (grill_me_enabled ? grill_me_extension : 0)',
    R3(lambda c, m: P(c)['effective_limit'] == P(c)['base_limit'] + (P(c)['grill_me_extension'] if P(c)['grill_me_enabled'] else 0)),
    AR, kinds='budget')
row('budget', 'bud_charged_count', 'charged_count', '/event/payload/questions_asked',
    'questions_asked is the count of distinct first durably presented QuestionItems of the shared run',
    R3(lambda c, m: P(c)['questions_asked'] == len(set(S(c)['charged_question_ids']))), AR, kinds='budget')
row('budget', 'bud_remaining', 'remaining', '/event/payload/questions_remaining',
    'questions_remaining = max(0, effective_limit - questions_asked) (zero at exhaustion)',
    R3(lambda c, m: P(c)['questions_remaining'] == max(0, P(c)['effective_limit'] - P(c)['questions_asked'])), AR, kinds='budget')
row('budget', 'bud_continuation', 'continuation', '/event/payload/continuation',
    'continuation is await_grill_confirmation with Grill Me on, otherwise synthesis',
    R3(lambda c, m: P(c)['continuation'] == ('await_grill_confirmation' if P(c)['grill_me_enabled'] else 'synthesis')), AR, kinds='budget')
for _f, _words in [('question_items_added', 'persists no extra QuestionItem'), ('counter_changed', 'creates or changes no counter'),
                   ('run_failed', 'does not fail the run'), ('grill_auto_confirmed', 'never confirms Grill Me automatically'),
                   ('build_disabled_by_budget', 'never disables Build because of the budget alone')]:
    row('budget', 'bud_no_' + _f, 'budget_effect', '/effects/' + _f, 'exhaustion ' + _words,
        R3(lambda c, m, f=_f: c['effects'][f] is False or (f == 'question_items_added' and type(c['effects'][f]) is int and
                                                            c['effects'][f] == 0)), AR, kinds='budget')

# graph (CV-1460 paragraph 2) ------------------------------------------------------------------------------
for _f, _src in [('run_id', 'run_id'), ('canonical_graph_ref', 'graph_ref'), ('graph_sha256', 'graph_sha256'),
                 ('source_approval_ref', 'approval_ref'), ('graph_commit_receipt_ref', 'commit_receipt_ref')]:
    row('graph', 'graph_' + _f, 'graph_source', '/event/payload/' + _f, _f + ' joins the actual approved canonical graph commit',
        R3(lambda c, m, f=_f, s=_src: P(c)[f] == S(c)[s]), AR, kinds='graph')
row('graph', 'graph_no_wrap', 'generation', '/owner/source/prior_generation', 'a replan never wraps the u32 generation',
    R3(lambda c, m: S(c)['prior_generation'] is None or S(c)['prior_generation'] < U32_MAX), AR, kinds='graph')
row('graph', 'graph_generation_step', 'generation', '/event/payload/replan_generation',
    'initial generation is 0; an applied replan is exactly the prior generation + 1',
    R3(lambda c, m: (S(c)['prior_generation'] is not None and S(c)['prior_generation'] >= U32_MAX) or
       P(c)['replan_generation'] == (0 if S(c)['prior_generation'] is None else S(c)['prior_generation'] + 1)), AR, kinds='graph')
row('graph', 'graph_previous_generation', 'generation', '/event/payload/previous_generation', 'previous_generation is the actual prior generation',
    R3(lambda c, m: strict_equal(P(c)['previous_generation'], S(c)['prior_generation'])), AR, kinds='graph')
row('graph', 'graph_previous_lock', 'generation', '/event/payload/previous_lock_event_id', 'previous_lock_event_id is the actual prior lock event',
    R3(lambda c, m: strict_equal(P(c)['previous_lock_event_id'], S(c)['prior_lock_event_id'])), AR, kinds='graph')
row('graph', 'graph_unique_digest', 'generation', '/owner/source/existing_locks',
    'the same (run_id, replan_generation) never names two canonical graph digests',
    R3(lambda c, m: all([not (l['run_id'] == P(c)['run_id'] and l['replan_generation'] == P(c)['replan_generation'] and
                              l['graph_sha256'] != P(c)['graph_sha256']) for l in S(c)['existing_locks']])), AR, kinds='graph')
row('graph', 'graph_no_stale_resume', 'stale_attempt', '/effects/stale_attempt_resumed', 'an attempt of a prior generation never resumes',
    R3(lambda c, m: c['effects']['stale_attempt_resumed'] is False), AR, kinds='graph')
row('graph', 'graph_no_flatten', 'graph_integrity', '/effects/dispatch_accepted', 'an invalid post-lock graph fences new dispatch (no flattening)',
    R3(lambda c, m: S(c)['post_lock_graph_valid'] is True or c['effects']['dispatch_accepted'] is False), AR, kinds='graph')

# prompts (CV-1461..CV-1464 paragraph 2) -------------------------------------------------------------------
for _f, _src in [('prompt_id', 'prompt_id'), ('source_session_id', 'source_session_id'), ('target_thread_id', 'target_thread_id'),
                 ('client_sequence', 'client_sequence'), ('submitted_at_ms', 'submitted_at_ms'), ('admitted_at_ms', 'admitted_at_ms'),
                 ('state_source_ref', 'state_source_ref'), ('redacted_prompt_ref', 'redacted_prompt_ref')]:
    row('prompt', 'prompt_' + _f, 'prompt_' + _f, '/event/payload/' + _f, _f + ' is the actual inbox value',
        R3(lambda c, m, f=_f, s=_src: strict_equal(P(c)[f], S(c)[s])), AR, kinds='prompt')
row('prompt', 'prompt_thread_copy', 'thread_join', '/event/payload/thread_id', 'thread_id equals target_thread_id',
    R3(lambda c, m: P(c)['thread_id'] == P(c)['target_thread_id']), AR, kinds='prompt')
row('prompt', 'prompt_context_thread', 'thread_join', '/event/payload/context/thread_id',
    'the owning context thread is the inbox thread (context.thread_id equals the payload thread_id)',
    SCOPED(lambda c, m: P(c)['thread_id'] != P(c)['target_thread_id'] or P(c)['context']['thread_id'] == P(c)['thread_id']),
    AR, kinds='prompt')
row('prompt', 'prompt_hash', 'prompt_hash', '/event/payload/prompt_hash',
    'prompt_hash is SHA-256 of the UTF-8 original prompt with only CRLF/CR normalized to LF',
    R3(lambda c, m: P(c)['prompt_hash'] == prompt_hash(S(c)['prompt_text'])), AR, kinds='prompt')
row('prompt', 'prompt_recipe', 'prompt_hash', '/event/payload/normalization_recipe_ref',
    'normalization_recipe_ref is the immutable W3F 1.0.0 recipe, never caller-selected',
    R3(lambda c, m: P(c)['normalization_recipe_ref'] == PROMPT_RECIPE), AR, kinds='prompt')
row('prompt', 'prompt_predecessor', 'lifecycle', '/owner/source/predecessor_state', 'only the declared predecessor inbox state leads to this fact',
    R3(lambda c, m: S(c)['predecessor_state'] in PROMPT_PREDECESSORS[c['family']]), AR, kinds='prompt')
row('prompt', 'prompt_execution_unbound', 'lifecycle', '/owner/source/execution_bound', 'no execution is bound before cancel/expiry',
    R3(lambda c, m: S(c)['execution_bound'] is False), AR, families=('session_prompt.cancelled', 'session_prompt.expired'))
row('prompt', 'prompt_expiry_source', 'lifecycle', '/owner/source/expiry_source', 'expiry comes from an actual existing expiry source',
    R3(lambda c, m: type(S(c)['expiry_source']) is str and S(c)['expiry_source'] != ''), AR, families=('session_prompt.expired',))
row('prompt', 'prompt_rejection_reason', 'lifecycle', '/event/payload/rejection_reason_code', 'the rejection reason is the actual refusal reason',
    R3(lambda c, m: P(c)['rejection_reason_code'] == S(c)['rejection_reason_code']), AR, families=('session_prompt.rejected',))
row('prompt', 'prompt_no_execution', 'no_execution', '/effects/execution_started', 'an inbox fact never starts or repeats execution',
    R3(lambda c, m: c['effects']['execution_started'] is False), AR, kinds='prompt')

# autonomy (CV-1450 paragraph 2) ----------------------------------------------------------------------------
for _f, _src in [('requested_mode', 'requested_mode'), ('effective_mode', 'effective_mode'), ('mutation_class', 'classifier_output'),
                 ('decision', 'decision'), ('blocked_reason_code', 'blocked_reason_code'),
                 ('permission_snapshot_id', 'permission_snapshot_id'), ('ceiling_source_ref', 'ceiling_source_ref'),
                 ('decision_source_ref', 'decision_source_ref')]:
    row('autonomy', 'auto_' + _f, 'autonomy_' + ('classifier' if _f == 'mutation_class' else _f), '/event/payload/' + _f,
        _f + ' is the runtime-computed original value', R3(lambda c, m, f=_f, s=_src: strict_equal(P(c)[f], S(c)[s])), AR, kinds='autonomy')
row('autonomy', 'auto_ceiling', 'ceiling', '/event/payload/effective_mode', 'effective authority never exceeds the genuine inherited ceiling',
    R3(lambda c, m: MODE_RANK[P(c)['effective_mode']] <= MODE_RANK[S(c)['ceiling']]), AR, kinds='autonomy')
row('autonomy', 'auto_readonly', 'ceiling', '/event/payload/decision', 'Ask/Plan read-only never allows a mutating invocation',
    R3(lambda c, m: P(c)['effective_mode'] not in READ_ONLY or not S(c)['mutating'] or P(c)['decision'] != 'allow'), AR, kinds='autonomy')
row('autonomy', 'auto_attempt_join', 'lineage', '/event/payload/attempt_id', 'the payload attempt is the envelope attempt',
    R3(lambda c, m: P(c)['attempt_id'] == E(c)['attempt_id']), AR, kinds='autonomy')
row('autonomy', 'auto_run_join', 'lineage', '/event/payload/run_id', 'the payload run is the envelope run',
    R3(lambda c, m: strict_equal(P(c)['run_id'], E(c)['run_id'])), AR, kinds='autonomy')
row('autonomy', 'auto_created_at', 'lineage', '/event/payload/created_at_utc', 'created_at_utc equals occurred_at_utc',
    R3(lambda c, m: P(c)['created_at_utc'] == E(c)['occurred_at_utc']), AR, kinds='autonomy')
row('autonomy', 'auto_invocation_link', 'invocation_ref', '/event/payload/tool_call_ref',
    'at least one genuine tool_call_ref or provider_message_ref resolves this parsed invocation',
    R3(lambda c, m: any([r is not None and r in S(c)['invocation_refs'] for r in (P(c)['tool_call_ref'], P(c)['provider_message_ref'])])),
    AR, kinds='autonomy')


def step(c, name):
    steps = c['autonomy']['order']
    return steps.index(name) if name in steps else None


for _a, _b in [('parse', 'schema'), ('schema', 'ceiling'), ('ceiling', 'ceiling_receipt_synced'),
               ('ceiling_receipt_synced', 'permissions'), ('permissions', 'filesafe')]:
    row('autonomy_order', 'auto_order_' + _a + '_' + _b, 'enforcement_order', '/autonomy/order', _a + ' precedes ' + _b,
        R3(lambda c, m, a=_a, b=_b: step(c, a) is not None and step(c, b) is not None and step(c, a) < step(c, b)), AR, kinds='autonomy')
row('autonomy_order', 'auto_order_dispatch', 'enforcement_order', '/autonomy/order',
    'dispatch, when it happens, follows the synced ceiling receipt and both later gates',
    R3(lambda c, m: step(c, 'dispatch') is None or all([step(c, s) is not None and step(c, s) < step(c, 'dispatch')
                                                         for s in ('ceiling_receipt_synced', 'permissions', 'filesafe')])), AR, kinds='autonomy')
row('autonomy_order', 'auto_dispatch_block', 'dispatch', '/autonomy/order', 'a block decision never dispatches',
    R3(lambda c, m: P(c)['decision'] != 'block' or step(c, 'dispatch') is None), AR, kinds='autonomy')
row('autonomy_order', 'auto_dispatch_require_approval', 'dispatch', '/autonomy/order', 'a require_approval decision never dispatches',
    R3(lambda c, m: P(c)['decision'] != 'require_approval' or step(c, 'dispatch') is None), AR, kinds='autonomy')
row('autonomy_order', 'auto_dispatch_allow_permissions', 'dispatch', '/autonomy/permissions_outcome',
    'allow cannot bypass a later Permissions refusal',
    R3(lambda c, m: c['autonomy']['permissions_outcome'] != 'refused' or step(c, 'dispatch') is None), AR, kinds='autonomy')
row('autonomy_order', 'auto_dispatch_allow_filesafe', 'dispatch', '/autonomy/filesafe_outcome',
    'allow cannot bypass a later FileSafe refusal',
    R3(lambda c, m: c['autonomy']['filesafe_outcome'] != 'refused' or step(c, 'dispatch') is None), AR, kinds='autonomy')

# retained originals (SP-1101) ---------------------------------------------------------------------------------
def readable_request(c, m):
    if c['path'] == 'retry':
        return (m.get('r3') and m.get('retry_same') and
                strict_equal(c['owner']['recovery_epoch'], c['storage']['custody']['recovery_epoch']))
    return m.get('r0') and type(c['event'].get('payload')) is dict and type(c['event']['payload'].get('context')) is dict


def rq(fn):
    def held(c, m):
        return not readable_request(c, m) or fn(c, m)
    return held


row('recipe', 'storage_authentic', 'original_unavailable', '/storage/authentic', 'Storage authenticates the held original',
    rq(lambda c, m: c['storage']['authentic'] is True), 'retry history')
row('recipe', 'original_withdrawn', 'withdrawn', '/storage/withdrawn', 'the original is not withdrawn or forged',
    rq(lambda c, m: c['storage']['withdrawn'] is False), 'retry history')
row('recipe', 'recipe_override', 'caller_recipe_override', '/reader/recipe_selector',
    'a caller-controlled recipe/version never selects history (shared dispatcher refuses an override)',
    rq(lambda c, m: m.get('disp') != 'caller_recipe_override'), 'retry history')
row('recipe', 'recipe_custody', 'original_unavailable', '/storage/event',
    'Storage\'s sealed write custody holds a receipt for that exact original (no Store default, no receipt created on read)',
    rq(lambda c, m: m.get('disp') not in ('original_unavailable', 'original_query')), 'retry history')
row('recipe', 'recipe_receipt_binding', 'original_unavailable', '/storage/event',
    'the sealed receipt binds the bytes Storage holds (a receipt for another original never selects a recipe)',
    rq(lambda c, m: m.get('disp') != 'original_other_receipt'), 'retry history')
row('recipe', 'recipe_unique', 'recipe_unsupported', '/storage/event', 'exactly one sealed receipt binds the original (ambiguous is unsupported)',
    rq(lambda c, m: m.get('disp') != 'recipe_ambiguous'), 'retry history')
row('recipe', 'original_admission', 'original_unavailable', '/storage/event',
    'the sealed receipt carries the family\'s genuine at-write admission (family, version, registry revision)',
    rq(lambda c, m: m.get('disp') != 'original_admission'), 'retry history')
row('recipe', 'recipe_installed', 'recipe_unsupported', '/storage/event',
    'the receipt\'s recipe tuple has an installed frozen verifier (no fallback, no probing)',
    rq(lambda c, m: m.get('disp') not in ('recipe_unknown', 'recipe_selection')), 'retry history')
row('recipe', 'original_binding', 'original_binding', '/event',
    'the authenticated original binding equals the binding of the requested original (Store, scope, server, project, type, id, '
    'key, operation, source commitment)',
    rq(lambda c, m: m.get('disp') != 'original_binding'), 'retry history')
def frozen_row(k):
    def fn(c, m):
        if m.get('disp') != 'original_verification':
            return True
        comps = m.get('frozen')
        if not all([comps.get(x) is True for x in FROZEN_ORDER[:FROZEN_ORDER.index(k)]]):
            return True          # an earlier frozen component owns this original's refusal
        return comps.get(k) is True
    return fn


for _k, _words in [('envelope', 'the original EventRecord passes its frozen envelope schema with exact integers'),
                   ('payload', 'the original payload passes its frozen family schema with exact integers'),
                   ('storage_times', 'the original Storage times pass the CV-253 storage_utc_z profile'),
                   ('operation', 'the original operation identity recomputes'),
                   ('event_identity', 'the original event_id recomputes with its frozen original recovery epoch'),
                   ('key', 'the original idempotency key recomputes'),
                   ('full_value', 'the original custody commits the complete original value (CV-339)'),
                   ('producer', 'the original custody commits its producer-semantic digest'),
                   ('custody_event', 'the original custody and receipt name the original event')]:
    row('original', 'original_' + _k, 'original_verification', '/storage/event', 'frozen w3f@1 verifier: ' + _words,
        rq(frozen_row(_k)), 'retry history')
OWNED_REASONS = ('ok', 'caller_recipe_override', 'original_unavailable', 'original_query', 'original_other_receipt', 'recipe_ambiguous',
                 'original_admission', 'recipe_unknown', 'recipe_selection', 'original_binding', 'original_verification')
row('original', 'original_resolved', 'original_unavailable', '/storage/event',
    'the shared dispatcher resolves the original or refuses for a reason an earlier row owns (an original Storage cannot hand '
    'out as canonical SP-236 bytes is unavailable, never accepted)',
    rq(lambda c, m: m.get('disp') in OWNED_REASONS), 'retry history')

# retry (CV-1450..1464 paragraph 6) ---------------------------------------------------------------------------
RTY = gate('r3')


@derived
def retry_same(c, m):
    return c['event']['idempotency_key'] == c['storage']['event']['idempotency_key']


RTS = gate('r3', 'retry_same')
RTO = gate('r3', 'retry_same', 'candidate_ok', 'original_ok')


@derived
def candidate_ok(c, m):
    """Every current-writer row before the retained-original tables held on this candidate."""
    return all([m.v.get('fact:' + r['id'], True) for r in ROWS if r['group'] in CANDIDATE_GROUPS])


@derived
def original_ok(c, m):
    return m.get('disp') == 'ok'


def dedupe_behind(c):
    return c['retry']['frontier'] > c['retry']['dedupe_through']


row('retry', 'retry_identity', 'retry_identity', '/event/idempotency_key', 'the retry carries the original scoped key (same identity)',
    RTY(lambda c, m: E(c)['idempotency_key'] == c['storage']['event']['idempotency_key']), 'retry')
row('retry', 'retry_dedupe_behind', 'dedupe_unavailable', '/retry/result', 'dedupe behind the verified tail returns dedupe_unavailable',
    RTO(lambda c, m: not dedupe_behind(c) or c['retry']['result'] == 'dedupe_unavailable'), 'retry')
row('retry', 'retry_dedupe_claim', 'dedupe_unavailable', '/retry/result', 'dedupe_unavailable is returned only when dedupe is behind',
    RTO(lambda c, m: c['retry']['result'] != 'dedupe_unavailable' or dedupe_behind(c)), 'retry')
row('retry', 'retry_conflict', 'idempotency_conflict', '/retry/result',
    'with current dedupe, the same producer-semantic digest returns the original and a different one is idempotency_conflict',
    RTO(lambda c, m: dedupe_behind(c) or c['retry']['result'] == 'dedupe_unavailable' or
        c['retry']['result'] == ('original' if producer_semantic_digest(E(c)) == producer_semantic_digest(c['storage']['event'])
                                 else 'idempotency_conflict')), 'retry')
row('retry', 'retry_effects', 'retry_effect', '/retry/effects', 'a retry has zero new events or effects',
    RTS(lambda c, m: type(c['retry']['effects']) is int and c['retry']['effects'] == 0), 'retry')
row('retry', 'retry_returned_receipt', 'retry_original', '/retry/returned_receipt', 'an original result returns the original first receipt',
    RTO(lambda c, m: c['retry']['result'] != 'original' or strict_equal(c['retry']['returned_receipt'], c['storage']['custody']['receipt'])),
    'retry')
row('retry', 'retry_epoch', 'retry_original', '/owner/recovery_epoch',
    'a retry keeps the original recovery epoch frozen at first preparation (never the current epoch)',
    RTS(lambda c, m: strict_equal(c['owner']['recovery_epoch'], c['storage']['custody']['recovery_epoch'])), 'retry')

# retained reader (SP-1450..SP-1464 with SP-278) -----------------------------------------------------------------
def reader_ready(c, m):
    return readable_request(c, m) and m.get('disp') == 'ok'


def rd(fn):
    def held(c, m):
        return not reader_ready(c, m) or fn(c, m)
    return held


def tok(c):
    return c['reader']['token']


row('history', 'historical_record', 'historical_record', '/event', 'the presented retained event is Storage\'s original record',
    rd(lambda c, m: strict_equal(c['event'], c['storage']['event'])), 'history')
row('history', 'reader_id', 'reader_version', '/reader/reader_id', 'the reader is the family\'s exact versioned operating consumer',
    rd(lambda c, m: c['reader']['reader_id'] == 'reader.' + c['family'] + '@1.0.0'), 'history')
row('history', 'reader_withdrawn', 'withdrawn', '/reader/withdrawn', 'the reader version is not withdrawn',
    rd(lambda c, m: c['reader']['withdrawn'] is False), 'history')
row('history', 'token_schema', 'token_schema', '/reader/token', 'the durable SP-278 nine-field token passes its schema (no redb_snapshot_id)',
    rd(lambda c, m: token_validator().is_valid(tok(c))), 'history')


def token_ok(c):
    return token_validator().is_valid(tok(c))


row('history', 'token_numbers', 'current_integer', '/reader/token', 'every token integer slot is an exact current integer (CV-1100)',
    rd(lambda c, m: not token_ok(c) or integer_slots_exact('token', tok(c))), 'history')
row('history', 'token_fullmatch', 'token_schema', '/reader/token', 'every token pattern and uuid matches in full (no trailing LF)',
    rd(lambda c, m: not token_ok(c) or not integer_slots_exact('token', tok(c)) or not pattern_failures(tok(c), token_schema())), 'history')


def token_clean(c):
    return token_ok(c) and integer_slots_exact('token', tok(c)) and not pattern_failures(tok(c), token_schema())


TK = lambda fn: rd(lambda c, m: not token_clean(c) or fn(c, m))  # noqa: E731
row('reader_source', 'token_storage', 'token_scope', '/reader/token/storage_instance_id', 'the token Storage is the original Storage',
    TK(lambda c, m: tok(c)['storage_instance_id'] == c['owner']['storage_instance_id']), 'history')
row('reader_source', 'token_dataset_storage', 'token_scope', '/reader/dataset_storage_instance_id',
    'the same-database dataset metadata names the token Storage',
    TK(lambda c, m: c['reader']['dataset_storage_instance_id'] == tok(c)['storage_instance_id']), 'history')
row('reader_source', 'token_current', 'token_frontier', '/reader/token',
    'the token equals the actual current complete frontier token (same-generation append invalidates it)',
    TK(lambda c, m: strict_equal(tok(c), c['reader']['current_token'])), 'history')
row('reader_source', 'coverage_global', 'coverage', '/reader/coverage/kind', 'coverage is a global scan, never a matching-family maximum',
    rd(lambda c, m: c['reader']['coverage']['kind'] == 'global'), 'history')
row('reader_source', 'coverage_complete', 'coverage', '/reader/coverage/intervals',
    'the covered intervals are exactly every source interval through the frontier, including nonmatching scopes and families',
    rd(lambda c, m: sorted([tuple(i) for i in c['reader']['coverage']['intervals']]) ==
       sorted([tuple(i) for i in c['reader']['coverage']['required']])), 'history')
row('reader_source', 'translation_custody', 'translation', '/reader/translation_ref',
    'a compacted original is read only through its owner-admitted identity-preserving translation',
    rd(lambda c, m: c['storage']['compacted'] is False or c['reader']['translation_ref'] == c['storage']['translation_ref']), 'history')
row('reader_access', 'access', 'access', '/reader/grant_current', 'the actual current read grant allows this observation at final disclosure',
    rd(lambda c, m: c['reader']['grant_current'] is True or c['reader']['disclosed'] is False), 'history')
row('reader_access', 'deleted_hidden', 'deleted', '/reader/source_deleted', 'current deletion hides the body whatever the retention or hold',
    rd(lambda c, m: c['reader']['source_deleted'] is False or c['reader']['disclosed'] is False), 'history')
row('reader_access', 'final_output', 'final_output', '/reader/output',
    'the disclosed output equals the independently decoded original after the last helper',
    rd(lambda c, m: c['reader']['disclosed'] is False or strict_equal(c['reader']['output'], c['storage']['event']['payload'])), 'history')
row('reader_access', 'family_checkpoint_none', 'family_checkpoint', '/reader/family_checkpoint',
    'a stateless reader owns no family checkpoint (none_required)',
    rd(lambda c, m: c['reader']['family_checkpoint'] is None), 'history', kinds='discovery budget graph prompt')
row('reader_access', 'auto_reader_checkpoint_current', 'family_checkpoint', '/reader/family_checkpoint/state',
    'the autonomy reader requires the exact published current projection checkpoint (SP-1450)',
    rd(lambda c, m: type(c['reader']['family_checkpoint']) is dict and c['reader']['family_checkpoint'].get('state') == 'current'),
    'history', kinds='autonomy')
row('reader_access', 'auto_reader_checkpoint_covers', 'family_checkpoint', '/reader/family_checkpoint/index_through_sequence_id',
    'the published checkpoint covers the requested event',
    rd(lambda c, m: type(c['reader']['family_checkpoint']) is not dict or c['reader']['family_checkpoint'].get('state') != 'current' or
       (type(c['reader']['family_checkpoint'].get('index_through_sequence_id')) is int and
        c['reader']['family_checkpoint']['index_through_sequence_id'] >= c['storage']['event']['sequence_id'])),
    'history', kinds='autonomy')
for _sink in sorted(set(READER_SINKS_COMMON) | {s for v in READER_SINKS.values() for s in v}):
    _kinds = ' '.join(sorted({k for k, v in READER_SINKS.items() if _sink in v} if _sink not in READER_SINKS_COMMON else
                             {'discovery', 'autonomy', 'budget', 'prompt', 'graph'}))
    row('reader_effects', 'reader_effect_' + _sink, 'replay_effect', '/reader/effects/' + _sink,
        'a historical read performs no ' + _sink + ' effect', rd(lambda c, m, s=_sink: c['reader']['effects'][s] is False), 'history',
        kinds=_kinds)


# autonomy projection and checkpoint (SP-1450; RP-PROJECTION-3GEN@1.0.0 unchanged) ---------------------------
CKPT_TTL_SECONDS = 604800
REF_KINDS = ('live', 'maintenance', 'backup', 'rollback')


@lru_cache(maxsize=None)
def storage_defs():
    return load('w3f_autonomy_storage.schema.json')['$defs']


@lru_cache(maxsize=None)
def checkpoint_validator():
    return Draft202012Validator(storage_defs()['checkpoint'], format_checker=DATETIME_FORMATS)


@lru_cache(maxsize=None)
def projection_validator():
    return Draft202012Validator(storage_defs()['projection'], format_checker=DATETIME_FORMATS)


@lru_cache(maxsize=None)
def storage_slot_validator(name):
    return SlotValidator(storage_defs()[name])


def storage_slots_exact(name, instance):
    del _SLOTS[:]
    storage_slot_validator(name).is_valid(instance)
    found = list(_SLOTS)
    del _SLOTS[:]
    try:
        for value in found:
            current_integer(value)
    except Refusal:
        return False
    return True


def instant(text):
    """A shared-predicate-validated UTC Z string as an exact comparable instant (no lane timestamp grammar)."""
    from datetime import datetime
    return datetime.fromisoformat(text)


def K(c):
    return c['checkpoint']


def nxt(c):
    return c['checkpoint']['next']


def stored_root(c):
    return c['checkpoint']['stored']['root']


def ck_key(c):
    return 'autonomy_ceiling_checkpoint.v1:' + c['owner']['storage_instance_id'] + ':' + partition(c['owner']['scope_kind'],
                                                                                                    c['owner']['project_id'])


def core_of(root):
    return {k: v for k, v in root.items() if k != 'retired_generations'}


def cores(root):
    return [root] + [e['checkpoint'] for e in root['retired_generations']]


@derived
def ck_valid(c, m):
    return checkpoint_validator().is_valid(nxt(c))


@derived
def ck_clean(c, m):
    """The candidate root is schema-valid, exact-integer, full-match and its times pass storage_utc_z."""
    n = nxt(c)
    return (m.get('ck_valid') and storage_slots_exact('checkpoint', n) and not pattern_failures(n, storage_defs()['checkpoint']) and
            all([date_time_ok(x['published_at_utc'], 'checkpoint/published_at_utc') and
                 (x['retired_at_utc'] is None or date_time_ok(x['retired_at_utc'], 'checkpoint/retired_at_utc')) for x in cores(n)]))


@derived
def rows_clean(c, m):
    return all([projection_validator().is_valid(r['value']) and storage_slots_exact('projection', r['value'])
                for r in K(c)['rows']])


CK = gate('ck_clean')
CKR = gate('ck_clean', 'rows_clean')
OPS_PRESERVE = ('advance', 'withdraw')
row('ck_value', 'ck_next_schema', 'checkpoint_schema', '/checkpoint/next',
    'the candidate root passes the closed checkpoint schema (shared event_record date-time checker, maxItems 2, nonrecursive cores)',
    lambda c, m: m.get('ck_valid'), 'checkpoint')
row('ck_value', 'ck_next_numbers', 'current_integer', '/checkpoint/next', 'every checkpoint integer slot is an exact current integer',
    gate('ck_valid')(lambda c, m: storage_slots_exact('checkpoint', nxt(c))), 'checkpoint')
row('ck_value', 'ck_next_fullmatch', 'checkpoint_schema', '/checkpoint/next',
    'every checkpoint pattern and uuid matches in full (a trailing LF the stock $ admits is refused)',
    gate('ck_valid')(lambda c, m: not storage_slots_exact('checkpoint', nxt(c)) or not pattern_failures(nxt(c), storage_defs()['checkpoint'])),
    'checkpoint')
row('ck_value', 'ck_utc_root', 'storage_utc_z', '/checkpoint/next/published_at_utc',
    'the root publication and retirement times pass the shared date_time with the storage_utc_z profile',
    gate('ck_valid')(lambda c, m: not storage_slots_exact('checkpoint', nxt(c)) or pattern_failures(nxt(c), storage_defs()['checkpoint']) or
                     (date_time_ok(nxt(c)['published_at_utc'], 'checkpoint/published_at_utc') and
                      (nxt(c)['retired_at_utc'] is None or date_time_ok(nxt(c)['retired_at_utc'], 'checkpoint/retired_at_utc')))), 'checkpoint')
row('ck_value', 'ck_utc_history', 'storage_utc_z', '/checkpoint/next/retired_generations',
    'every retained core\'s times pass the shared date_time with the storage_utc_z profile',
    gate('ck_valid')(lambda c, m: not storage_slots_exact('checkpoint', nxt(c)) or pattern_failures(nxt(c), storage_defs()['checkpoint']) or
                     all([date_time_ok(x['published_at_utc'], 'checkpoint/published_at_utc') and date_time_ok(x['retired_at_utc'], 'checkpoint/retired_at_utc')
                          for x in cores(nxt(c))[1:]])), 'checkpoint')
row('ck_value', 'ck_rows_schema', 'projection_schema', '/checkpoint/rows',
    'every projection value passes the closed projection schema with exact integers',
    CK(lambda c, m: m.get('rows_clean')), 'checkpoint')
row('ck_value', 'ck_root_size', 'value_size', '/checkpoint/next',
    'the complete encoded root including history and hold refs is at most 16384 bytes (SP-236); oversize fails the advance',
    CKR(lambda c, m: len(storage_value_bytes(nxt(c), profile=EVENT_VALUE)) <= INLINE_LIMIT), 'checkpoint')
entailed('ck_row_size', 'value_size', '/checkpoint/rows', 'every complete encoded projection value is at most 16384 bytes',
         CKR(lambda c, m: all([len(storage_value_bytes(r['value'], profile=EVENT_VALUE)) <= INLINE_LIMIT for r in K(c)['rows']])), 'checkpoint',
         ['ck_rows_schema', 'ck_row_key', 'ck_row_storage', 'ck_row_partition', 'ck_row_ref', 'ck_rows_cover', 'ck_row_attempt',
          'ck_row_sequence', 'ck_row_digest'],
         'Every projection field is either a schema constant, an exact uint64 (ck_rows_schema) or joined exactly to a bounded '
         'value by an earlier row: storage_instance_id to the owner Store (a uuid), scope_partition to the owner partition '
         '(app or project~base64url of a project id of at most 256 characters), checkpoint_ref to the checkpoint key, '
         'event_id/attempt_id/sequence/digest to an admitted original event (evt_w3f_ + 64 hex; attempt_id at most 256 characters by '
         'the CV-1450 payload schema; 64 hex). The largest such value encodes far below 16384 bytes, so any value over the limit '
         'differs from its join and that earlier row refuses it.', kinds='autonomy')

CKI = gate('ck_clean', 'rows_clean')
row('ck_identity', 'ck_key', 'checkpoint_key', '/checkpoint/key', 'the checkpoint key is autonomy_ceiling_checkpoint.v1:{storage}:{partition}',
    CKI(lambda c, m: K(c)['key'] == ck_key(c)), 'checkpoint')
row('ck_identity', 'ck_storage', 'checkpoint_identity', '/checkpoint/next/storage_instance_id', 'the root names the owner Store',
    CKI(lambda c, m: nxt(c)['storage_instance_id'] == c['owner']['storage_instance_id']), 'checkpoint')
row('ck_identity', 'ck_partition', 'checkpoint_identity', '/checkpoint/next/scope_partition', 'the root names the exact owner partition',
    CKI(lambda c, m: nxt(c)['scope_partition'] == partition(c['owner']['scope_kind'], c['owner']['project_id'])), 'checkpoint')
row('ck_identity', 'ck_history_storage', 'checkpoint_history', '/checkpoint/next/retired_generations',
    'every retained core belongs to the owner Store', CKI(lambda c, m: all([x['storage_instance_id'] == c['owner']['storage_instance_id']
                                                                          for x in cores(nxt(c))[1:]])), 'checkpoint')
row('ck_identity', 'ck_history_partition', 'checkpoint_history', '/checkpoint/next/retired_generations',
    'every retained core belongs to the owner partition', CKI(lambda c, m: all([x['scope_partition'] == partition(
        c['owner']['scope_kind'], c['owner']['project_id']) for x in cores(nxt(c))[1:]])), 'checkpoint')
row('ck_identity', 'ck_unique_ids', 'checkpoint_history', '/checkpoint/next/retired_generations',
    'publication ids of the root and every retained core are unique', CKI(lambda c, m: len({x['publication_id'] for x in cores(nxt(c))}) ==
                                                                           len(cores(nxt(c)))), 'checkpoint')


def rows_by_event(c):
    return {r['value']['event_id']: r for r in K(c)['rows']}


def scanned(c):
    return {e['event_id']: e for e in K(c)['events']}


row('ck_projection', 'ck_rows_cover', 'projection_join', '/checkpoint/rows',
    'exactly one row per admitted original event in the scanned range (multiple checks of one attempt never collapse)',
    CKI(lambda c, m: len(K(c)['rows']) == len(rows_by_event(c)) and set(rows_by_event(c)) == set(scanned(c))), 'checkpoint')


def row_join(field, src):
    def fn(c, m):
        events, rows = scanned(c), rows_by_event(c)
        if len(K(c)['rows']) != len(rows) or set(rows) != set(events):
            return True        # ck_rows_cover owns a row set defect
        return all([strict_equal(rows[i]['value'][field], events[i][src]) for i in rows])
    return fn


for _f, _src in [('attempt_id', 'attempt_id'), ('sequence_id', 'sequence_id'), ('producer_semantic_digest', 'producer_semantic_digest')]:
    row('ck_projection', 'ck_row_' + _f.split('_')[0] if _f != 'producer_semantic_digest' else 'ck_row_digest', 'projection_join',
        '/checkpoint/rows/value/' + _f, 'each row\'s ' + _f + ' joins its original admitted event', CKI(row_join(_f, _src)), 'checkpoint')
row('ck_projection', 'ck_row_storage', 'projection_join', '/checkpoint/rows/value/storage_instance_id', 'each row names the owner Store',
    CKI(lambda c, m: all([r['value']['storage_instance_id'] == c['owner']['storage_instance_id'] for r in K(c)['rows']])), 'checkpoint')
row('ck_projection', 'ck_row_partition', 'projection_join', '/checkpoint/rows/value/scope_partition', 'each row names the owner partition',
    CKI(lambda c, m: all([r['value']['scope_partition'] == partition(c['owner']['scope_kind'], c['owner']['project_id']) for r in K(c)['rows']])),
    'checkpoint')
row('ck_projection', 'ck_row_ref', 'projection_join', '/checkpoint/rows/value/checkpoint_ref',
    'each row\'s checkpoint_ref is the owner checkpoint logical key',
    CKI(lambda c, m: all([r['value']['checkpoint_ref'] == ck_key(c) for r in K(c)['rows']])), 'checkpoint')
row('ck_projection', 'ck_row_key', 'projection_join', '/checkpoint/rows/key',
    'each row key is autonomy_ceiling_projection.v1:{partition}:{attempt_id}:{event_id}',
    CKI(lambda c, m: all([r['key'] == 'autonomy_ceiling_projection.v1:' + r['value']['scope_partition'] + ':' + r['value']['attempt_id'] + ':' +
                          r['value']['event_id'] for r in K(c)['rows']])), 'checkpoint')

STORED = lambda fn: CKI(lambda c, m: K(c)['stored'] is None or fn(c, m))  # noqa: E731
row('ck_cas', 'ck_cas_revision', 'cas', '/checkpoint/expected/revision', 'the captured expected revision is the stored revision',
    STORED(lambda c, m: strict_equal(K(c)['expected']['revision'], K(c)['stored']['revision'])), 'checkpoint')
row('ck_cas', 'ck_cas_preimage', 'cas', '/checkpoint/expected/root',
    'the captured preimage is every byte of the stored root (full-value CAS, independent of an equal revision)',
    STORED(lambda c, m: not strict_equal(K(c)['expected']['revision'], K(c)['stored']['revision']) or
           strict_equal(K(c)['expected']['root'], stored_root(c))), 'checkpoint')


def cas_holds(c):
    return K(c)['stored'] is None or (strict_equal(K(c)['expected']['revision'], K(c)['stored']['revision']) and
                                      strict_equal(K(c)['expected']['root'], stored_root(c)))


row('ck_cas', 'ck_revision_step', 'cas', '/checkpoint/next/revision',
    'a committed change is exactly the stored revision + 1 (an initial publication is revision 0)',
    CKI(lambda c, m: not cas_holds(c) or K(c)['op'] in ('read', 'retry') or
        nxt(c)['revision'] == (0 if K(c)['stored'] is None else K(c)['stored']['revision'] + 1)), 'checkpoint')
row('ck_cas', 'ck_atomic', 'atomic_advance', '/checkpoint/commit', 'rows, root, history and cleanup commit together or not at all',
    CKI(lambda c, m: len({K(c)['commit'][x] for x in ('rows', 'root', 'history', 'cleanup')}) == 1), 'checkpoint')
row('ck_cas', 'ck_token_current', 'token_frontier', '/checkpoint/next/index_read_token',
    'an advance stores the actual complete current nine-field token of its one source snapshot',
    CKI(lambda c, m: K(c)['op'] not in ('advance', 'initial', 'successor') or strict_equal(nxt(c)['index_read_token'], K(c)['source']['token'])),
    'checkpoint')
row('ck_cas', 'ck_through', 'token_frontier', '/checkpoint/next/index_through_sequence_id', 'the stored coverage is the scanned frontier',
    CKI(lambda c, m: K(c)['op'] not in ('advance', 'initial', 'successor') or
        strict_equal(nxt(c)['index_through_sequence_id'], K(c)['source']['through_sequence_id'])), 'checkpoint')
row('ck_cas', 'ck_no_staging', 'slot_unavailable', '/checkpoint/staging_keys',
    'no fourth staged generation, alias key or hidden history table is persisted', CKI(lambda c, m: K(c)['staging_keys'] == []), 'checkpoint')

OP = lambda ops, fn: CKI(lambda c, m: K(c)['op'] not in ops or fn(c, m))  # noqa: E731
row('ck_publication', 'ck_coordinator_admitted', 'publication_custody', '/checkpoint/coordinator/admitted',
    'an initial or successor publication is authenticated by the actual StorageMigrationCoordinator operation',
    OP(('initial', 'successor'), lambda c, m: K(c)['coordinator']['admitted'] is True), 'checkpoint')
row('ck_publication', 'ck_publication_from_coordinator', 'publication_custody', '/checkpoint/next/publication_id',
    'a new publication id is the one the coordinator allocated', OP(('initial', 'successor'), lambda c, m:
                                                                      nxt(c)['publication_id'] == K(c)['coordinator']['publication_id']), 'checkpoint')
row('ck_publication', 'ck_birth_from_storage', 'publication_custody', '/checkpoint/next/published_at_utc',
    'a first committed selection fixes published_at_utc from the Storage timestamp authority',
    OP(('initial', 'successor'), lambda c, m: nxt(c)['published_at_utc'] == K(c)['coordinator']['publication_time']), 'checkpoint')
for _f, _words in [('publication_id', 'publication_id (no family generation on an ordinary advance)'),
                   ('published_at_utc', 'first published_at_utc'), ('hold_refs', 'hold_refs'),
                   ('retired_generations', 'complete history')]:
    row('ck_publication', 'ck_preserve_' + _f, 'checkpoint_preserved', '/checkpoint/next/' + _f,
        'an ordinary refresh or withdrawal preserves ' + _words + ' byte for byte',
        OP(OPS_PRESERVE, lambda c, m, f=_f: strict_equal(nxt(c)[f], stored_root(c)[f])), 'checkpoint')
row('ck_publication', 'ck_preserve_state', 'checkpoint_preserved', '/checkpoint/next/state',
    'an ordinary advance keeps the state and retirement (a withdrawn root never refreshes itself into current)',
    OP(('advance',), lambda c, m: nxt(c)['state'] == stored_root(c)['state'] and strict_equal(nxt(c)['retired_at_utc'], stored_root(c)['retired_at_utc'])),
    'checkpoint')
row('ck_publication', 'ck_withdraw_state', 'withdrawal', '/checkpoint/next/state', 'a withdrawal leaves the root withdrawn',
    OP(('withdraw',), lambda c, m: nxt(c)['state'] == 'withdrawn'), 'checkpoint')
row('ck_publication', 'ck_first_retirement', 'withdrawal', '/checkpoint/next/retired_at_utc',
    'a first current|rebuilding -> withdrawn freezes retired_at_utc at the actual Storage-authorized terminal time',
    OP(('withdraw',), lambda c, m: nxt(c)['state'] != 'withdrawn' or stored_root(c)['state'] == 'withdrawn' or
       nxt(c)['retired_at_utc'] == K(c)['coordinator']['terminal_time']),
    'checkpoint')
row('ck_publication', 'ck_withdrawal_anchor', 'withdrawal', '/checkpoint/next/retired_at_utc',
    'a repeated withdrawal preserves the first retirement time',
    OP(('withdraw',), lambda c, m: nxt(c)['state'] != 'withdrawn' or stored_root(c)['state'] != 'withdrawn' or
       nxt(c)['retired_at_utc'] == stored_root(c)['retired_at_utc']),
    'checkpoint')
row('ck_publication', 'ck_no_future_birth', 'temporal', '/checkpoint/next/published_at_utc',
    'the selected root\'s birth is not in the future at the authoritative observation instant',
    CKI(lambda c, m: instant(nxt(c)['published_at_utc']) <= instant(K(c)['now_utc'])), 'checkpoint')


def archived(stored, new_birth):
    core = core_of(stored)
    core = dict(core, state='withdrawn', retired_at_utc=stored['retired_at_utc'] if stored['state'] == 'withdrawn' else new_birth)
    return core


def successor_of(c, pub):
    n = nxt(c)
    if n['retired_generations'] and n['retired_generations'][0]['checkpoint']['publication_id'] == pub:
        return n
    for i, e in enumerate(n['retired_generations'][1:], start=1):
        if e['checkpoint']['publication_id'] == pub:
            return n['retired_generations'][i - 1]['checkpoint']
    return None


row('ck_history', 'ck_archive_exact', 'checkpoint_history', '/checkpoint/next/retired_generations/0/checkpoint',
    'a successor archives the exact final old core (retired at the new birth, or its earlier first retirement when already withdrawn)',
    OP(('successor',), lambda c, m: bool(nxt(c)['retired_generations']) and
       strict_equal(nxt(c)['retired_generations'][0]['checkpoint'], archived(stored_root(c), nxt(c)['published_at_utc']))), 'checkpoint')
row('ck_history', 'ck_archive_carry', 'checkpoint_history', '/checkpoint/next/retired_generations',
    'a successor carries every still-retained older entry unchanged, after the oldest cleaned prefix',
    OP(('successor',), lambda c, m: strict_equal(nxt(c)['retired_generations'][1:],
                                                 [e for e in stored_root(c)['retired_generations']
                                                  if e['checkpoint']['publication_id'] not in K(c)['cleanup']])), 'checkpoint')
row('ck_history', 'ck_cleanup_history', 'checkpoint_history', '/checkpoint/next/retired_generations',
    'a cleanup removes only the cleaned entries and keeps every other byte',
    OP(('cleanup',), lambda c, m: strict_equal(nxt(c)['retired_generations'], [e for e in stored_root(c)['retired_generations']
                                                                              if e['checkpoint']['publication_id'] not in K(c)['cleanup']])
       and strict_equal(core_of(nxt(c)), dict(core_of(stored_root(c)), revision=nxt(c)['revision']))), 'checkpoint')
row('ck_history', 'ck_successor_links', 'checkpoint_history', '/checkpoint/next/retired_generations',
    'each successor_publication_id is the immediate successor the committed coordinator handoff recorded',
    CKI(lambda c, m: all([e['successor_publication_id'] == K(c)['coordinator']['handoffs'].get(e['checkpoint']['publication_id'])
                          for e in nxt(c)['retired_generations']])), 'checkpoint')
row('ck_history', 'ck_birth_before_retirement', 'temporal', '/checkpoint/next/retired_generations',
    'each retained core\'s birth is no later than its first retirement',
    CKI(lambda c, m: all([instant(x['published_at_utc']) <= instant(x['retired_at_utc']) for x in cores(nxt(c))[1:]])), 'checkpoint')
row('ck_history', 'ck_retirement_before_successor', 'temporal', '/checkpoint/next/retired_generations',
    'each retirement is no later than its immediate successor\'s birth',
    CKI(lambda c, m: all([successor_of(c, x['publication_id']) is None or
                          instant(x['retired_at_utc']) <= instant(successor_of(c, x['publication_id'])['published_at_utc'])
                          for x in cores(nxt(c))[1:]])), 'checkpoint')
row('ck_history', 'ck_read_current', 'currentness', '/checkpoint/read/authority_publication_id',
    'only the selected current root certifies currentness; a retired core never does',
    OP(('read',), lambda c, m: K(c)['read']['authority_publication_id'] == nxt(c)['publication_id'] and nxt(c)['state'] == 'current'), 'checkpoint')
row('ck_history', 'ck_settled_unchanged', 'settled_retry', '/checkpoint/next',
    'a retry of a settled publication returns the committed root unchanged and commits nothing',
    OP(('retry',), lambda c, m: strict_equal(nxt(c), stored_root(c)) and not any([K(c)['commit'][x] for x in ('rows', 'root', 'history', 'cleanup')])),
    'checkpoint')


def cleaned(c):
    return [e for e in stored_root(c)['retired_generations'] if e['checkpoint']['publication_id'] in K(c)['cleanup']]


CLN = lambda fn: CKI(lambda c, m: not K(c)['cleanup'] or fn(c, m))  # noqa: E731
row('ck_cleanup', 'ck_cleanup_not_current', 'cleanup', '/checkpoint/cleanup', 'the selected root is never a cleanup target',
    CLN(lambda c, m: stored_root(c)['publication_id'] not in K(c)['cleanup'] and nxt(c)['publication_id'] not in K(c)['cleanup']), 'checkpoint')
row('ck_cleanup', 'ck_cleanup_oldest', 'cleanup', '/checkpoint/cleanup', 'cleanup removes only an oldest retained prefix',
    CLN(lambda c, m: stored_root(c)['publication_id'] in K(c)['cleanup'] or nxt(c)['publication_id'] in K(c)['cleanup'] or
        [e['checkpoint']['publication_id'] for e in stored_root(c)['retired_generations']][-len(K(c)['cleanup']):] == list(K(c)['cleanup'])),
    'checkpoint')
row('ck_cleanup', 'ck_cleanup_age', 'cleanup', '/checkpoint/now_utc',
    'cleanup requires age >= first retired_at_utc + 604800 seconds, inclusive',
    CLN(lambda c, m: all([(instant(K(c)['now_utc']) - instant(e['checkpoint']['retired_at_utc'])).total_seconds() >= CKPT_TTL_SECONDS
                          for e in cleaned(c)])), 'checkpoint')
row('ck_cleanup', 'ck_cleanup_frozen_resolved', 'cleanup', '/checkpoint/holds',
    'every frozen hold_ref of a cleaned core resolves (missing custody blocks cleanup)',
    CLN(lambda c, m: all([K(c)['holds'].get(h, {}).get('resolved') is True for e in cleaned(c) for h in e['checkpoint']['hold_refs']])),
    'checkpoint')
row('ck_cleanup', 'ck_cleanup_frozen_inactive', 'cleanup', '/checkpoint/holds', 'no frozen hold of a cleaned core is still active',
    CLN(lambda c, m: all([K(c)['holds'].get(h, {}).get('active') is False for e in cleaned(c) for h in e['checkpoint']['hold_refs']
                          if K(c)['holds'].get(h, {}).get('resolved') is True])), 'checkpoint')
row('ck_cleanup', 'ck_cleanup_dynamic_hold', 'cleanup', '/checkpoint/dynamic_holds',
    'no currently applicable hold added after retirement protects a cleaned core',
    CLN(lambda c, m: not any([d['active'] is True and d['publication_id'] in K(c)['cleanup'] for d in K(c)['dynamic_holds']])), 'checkpoint')
for _kind in REF_KINDS:
    row('ck_cleanup', 'ck_cleanup_ref_' + _kind, 'cleanup', '/checkpoint/refs', 'no ' + _kind + ' ref names a cleaned core',
        CLN(lambda c, m, k=_kind: not any([r['kind'] == k and r['publication_id'] in K(c)['cleanup'] for r in K(c)['refs']])), 'checkpoint')
row('ck_cleanup', 'ck_cleanup_fence', 'cleanup', '/checkpoint/fence',
    'the hold/ref admission fence captured at validation is unchanged at commit',
    CLN(lambda c, m: strict_equal(K(c)['fence']['captured'], K(c)['fence']['actual'])), 'checkpoint')

ROW_SPEC = {r['id']: r for r in ROWS}
CANDIDATE_GROUPS = frozenset(['scenario', 'envelope', 'payload', 'entailed_payload_fullmatch', 'scope', 'entailed_scope_supported',
                              'context', 'identity', 'writer', 'publication', 'source_receipt', 'discovery', 'budget', 'graph',
                              'prompt', 'autonomy', 'autonomy_order'])


# ---------------------------------------------------------------------------------------------
# Tables: groups in order, at most eight rows per table; entailed rows alone.
# ---------------------------------------------------------------------------------------------
def build_tables():
    tables, order = {}, []
    for group in GROUP_ORDER:
        rows = [r for r in ROWS if r['group'] == group]
        if group.startswith('entailed_'):
            tables[group] = rows
            order.append(group)
            continue
        for n in range(0, len(rows), 8):
            name = group + '_' + str(n // 8 + 1)
            tables[name] = rows[n:n + 8]
            order.append(name)
    for name, rows in tables.items():
        for r in rows:
            r['table'] = name
    return tables, order


TABLE_ROWS, TABLES = build_tables()


def observe(c):
    """One boolean per row (True: holds or does not apply). Exceptions are checker findings, never refusals."""
    facts, errors = {}, []
    m = Memo(c)
    with exact_digits():
        for r in ROWS:
            if not applies(r, c):
                facts[r['id']] = True
                continue
            try:
                value = r['fn'](c, m)
            except CAUGHT as exc:
                errors.append((r['id'], type(exc).__name__ + ': ' + str(exc)[:200]))
                value = False
            facts[r['id']] = value is True
            m.v['fact:' + r['id']] = value is True
    return facts, errors


@lru_cache(maxsize=None)
def table_module(table):
    return importlib.import_module(TABLE_PREFIX + table)


def table_refusals(table, facts):
    """The table's predicates evaluated directly, in table order: (observation, [(row, code), ...])."""
    module = table_module(table)
    observed = {name: facts[name] for name in module.FIELDS}
    refused = []
    for name in module.FIELDS:
        code = getattr(module, name)(observed, None)
        if code is not None:
            refused.append((name, code))
    return observed, refused


def evaluate(c):
    """(first refusal (row, code) or None, every refusing row, errors)."""
    facts, errors = observe(c)
    first, failing = None, []
    for table in TABLES:
        _, refused = table_refusals(table, facts)
        for name, code in refused:
            failing.append(name)
            if first is None:
                first = (name, code)
    return first, failing, errors


def judge(case, first, failing, errors):
    """A positive refuses nowhere; a negative refuses first at exactly its row, and every other refusing
    row is entailed with a proof naming that first row."""
    if errors:
        return 'checker_error: ' + json.dumps(errors)[:300]
    if case.get('expect') == 'accept':
        return None if first is None else 'refused_positive: ' + str(first)
    want = case['expect']
    if first is None:
        return 'accepted_negative'
    if first[0] != want['row'] or first[1] != want['code']:
        return 'wrong_first_row: ' + str(first) + ' expected ' + want['row']
    extra = [r for r in failing if r != first[0] and not (r in ENTAILED and first[0] in ENTAILED[r][0])]
    if extra:
        return 'additional_rows: ' + ','.join(extra)
    if first[0] in ENTAILED:
        return 'entailed_row_first'
    return None


# ---------------------------------------------------------------------------------------------
# Cases
# ---------------------------------------------------------------------------------------------
def apply_change(target, pointer, op, value=None):
    parts = [p.replace('~1', '/').replace('~0', '~') for p in pointer.split('/')[1:]]
    node = target
    for part in parts[:-1]:
        node = node[int(part)] if type(node) is list else node[part]
    last = parts[-1]
    if op == 'set':
        if type(node) is list:
            node[int(last)] = value
        else:
            node[last] = value
    elif op == 'delete':
        if type(node) is list:
            del node[int(last)]
        else:
            del node[last]
    elif op == 'append':
        (node[int(last)] if type(node) is list else node[last]).append(value)
    else:
        raise ValueError('unknown change op ' + op)


def mutate(base, changes):
    out = copy.deepcopy(base)
    for ch in changes:
        apply_change(out, ch[0], ch[1], ch[2] if len(ch) > 2 else None)
    return out


def cases():
    """(case id, complete scenario, case record) for every positive and negative, in a fixed order."""
    fx = load(FIXTURES)
    bases = {c['id']: c for c in fx['positives']}
    for c in fx['positives']:
        yield c['id'], c['scenario'], c
    for n in fx['negatives']:
        yield n['id'], mutate(bases[n['base']]['scenario'], n['changes']), n


def run_all(progress=None):
    counts = dict(cases=0, positives=0, negatives=0, errors=0)
    findings, firsts = [], {}
    for number, (cid, scenario, case) in enumerate(cases()):
        counts['cases'] += 1
        counts['positives' if case.get('expect') == 'accept' else 'negatives'] += 1
        first, failing, errors = evaluate(scenario)
        verdict = judge(case, first, failing, errors)
        if verdict:
            counts['errors'] += 1
            findings.append({'case': cid, 'verdict': verdict})
        if first:
            firsts[first[0]] = firsts.get(first[0], 0) + 1
        if progress and number % 500 == 0:
            progress(number)
    return counts, findings, firsts


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--json', type=Path)
    parser.add_argument('--limit-findings', type=int, default=40)
    args = parser.parse_args(argv)
    counts, findings, firsts = run_all()
    unwitnessed = sorted([r['id'] for r in ROWS if r['id'] not in firsts and r['id'] not in ENTAILED])
    status = 'pass' if not findings and not unwitnessed else 'fail'
    report = {'status': status, 'counts': counts, 'rows': len(ROWS), 'tables': len(TABLES), 'entailed': sorted(ENTAILED),
              'unwitnessed_rows': unwitnessed, 'first_refusals': dict(sorted(firsts.items())),
              'findings': findings[:args.limit_findings], 'finding_count': len(findings)}
    if args.json:
        args.json.write_text(json.dumps(report, indent=2, sort_keys=True) + '\n')
    print(json.dumps({k: report[k] for k in ('status', 'counts', 'rows', 'tables', 'unwitnessed_rows', 'finding_count')},
                     indent=2, sort_keys=True))
    for f in findings[:args.limit_findings]:
        print(json.dumps(f))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())

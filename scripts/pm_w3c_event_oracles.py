#!/usr/bin/env python3
"""W3C synthetic contract oracles (wave 3 phase 2). No native execution, capture or writer admission.

Twenty-one prepared families (TCME-1300..TCME-1319, ATS-1220; payloads CV-1300..CV-1320; Storage SP-1300..SP-1320):
twenty test-capture families in Project and application editions and the Project-only readiness family.
Membership stays ABSENT; every scenario models a hypothetical future admission only to exercise owner predicates.

Method B guard tables. ``ROWS`` below is the row specification: each row is one predicate with one refusal code.
``obs`` collects the raw facts the row compares (the supplied copy and its independently recomputed authority,
a raw owner fact, or the verdict of a shared helper: a schema validator, ``date_time``, ``storage_uint64``,
``current_integer``, ``current_append_policy`` or the shared ``RetainedDispatcher``). The comparison itself
is the predicate in the generated table module ``scripts/pm_w3c_table_<table>.py`` (generator
``scripts/pm-w3c-table-generate.py``): ``evaluate`` reaches a refusal only through those predicates, in table
order, and the gated tool (``scripts/pm_guard_isolation.py``) analyses exactly that code. A row whose
precondition an earlier row owns observes ``True`` (not applicable). A checker exception is a finding, never a
refusal.

Numbers (CV-1100/SP-1100): fixture text is parsed with the shared ``loads_exact`` and every integer token
becomes an exact integer through ``current_integer``; every schema integer slot the stock validator admits
must then pass ``current_integer``; Storage uint64 slots pass ``storage_uint64``; the producer projection is
``producer_semantic_bytes``/``producer_semantic_digest``; the CV-339 commitment is ``full_value_commitment``;
sizes and pack bytes use ``storage_value_bytes`` and ``verify_payload_bytes``. No lane serializer, cap or
normalization.

Timestamps (CV-1101): every timestamp field goes through the shared ``pm_event_datetime``: schema verdicts use
``format_checker(profile=EVENT_RECORD)`` and the CV-253 Storage-assigned EventRecord times have their own
``date_time(..., profile=STORAGE_UTC_Z)`` rows (``TIMESTAMP_FIELDS``).

Retained originals (SP-1101): a committed retry original and a retained history read resolve once through the
shared ``RetainedDispatcher``. ``W3COriginalOwner`` answers only from Storage's sealed write custody in the
scenario's Store, from the one sealed receipt for that exact original; no receipt, a receipt bound to another
original, or several receipts never select a recipe. The sealed store is snapshotted before and after every read.
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
from referencing import Resource

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time, format_checker  # noqa: E402
from pm_event_numbers import (  # noqa: E402
    EVENT_VALUE, FrozenRecipe, JsonNumber, OriginalBinding, OriginalCustody, RecipeTuple, Refusal, RetainedDispatcher,
    current_append_policy, current_integer, decode_storage_value, full_value_commitment, loads_exact,
    producer_semantic_bytes, producer_semantic_digest, storage_uint64, storage_value_bytes, verify_payload_bytes,
)
from pm_projects_refresh_contracts import Corpus  # noqa: E402
from pm_w3c_families import CLAUSES, FAMILIES, SUBJECT_ORDER  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
TABLE_PREFIX = 'pm_w3c_table_'
FIXTURES = 'w3c_event_fixtures.json'
CUSTODY_FILE = 'w3c_original_custody.json'
CONTRACTS = 'Plans/w3c_test_capture_event_contracts.schema.json'
RECORDS = 'Plans/test_capture_application_records.schema.json'
PATHS = ('install', 'append', 'retry', 'history', 'operation', 'checkpoint', 'records')
CAUGHT = (KeyError, TypeError, ValueError, IndexError, AttributeError, OverflowError, StopIteration)
INLINE_LIMIT = 16384
PACK_MEDIA = 'application/vnd.puppetmaster.event-payload+msgpack'
NA = True
UUID = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
HEX64 = re.compile(r'[0-9a-f]{64}')
GENERATION = re.compile(r'eig_[0-9a-f]{64}')
PHASES = ('pending', 'outcome_committed', 'event_committed', 'terminal', 'withdrawn')
BOUND = ('outcome_committed', 'event_committed', 'terminal')
COMMITTED = ('event_committed', 'terminal')
TRANSITIONS = ('>pending', 'pending>outcome_committed', 'outcome_committed>event_committed', 'event_committed>terminal',
               'pending>withdrawn', 'outcome_committed>withdrawn', 'event_committed>withdrawn')
SELECTION_HASHES = ('current_bytes_sha256', 'manifest_bytes_sha256', 'manifest_survivor_prefix_sha256', 'retained_inventory_sha256',
                    'durable_watermarks_sha256', 'excluded_ranges_sha256', 'retired_inputs_sha256')
RECEIPT_UINT64 = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')

# Every timestamp field the lane owns or adopts, the owner profile, and the shared check that covers it.
TIMESTAMP_FIELDS = (
    ('EventRecord occurred_at_utc (candidate, formed input, retained original)', EVENT_RECORD, 'format_checker(EVENT_RECORD) in envelope_schema / op_schema / frozen_envelope'),
    ('EventRecord observed_at_utc', STORAGE_UTC_Z, 'date_time(STORAGE_UTC_Z): rows storage_utc_observed_at_utc, frozen_storage_times'),
    ('EventRecord persisted_at_utc', STORAGE_UTC_Z, 'date_time(STORAGE_UTC_Z): rows storage_utc_persisted_at_utc, frozen_storage_times'),
    ('AppendReceipt acknowledged_at_utc (first_append and Storage issuance)', EVENT_RECORD, 'format_checker(EVENT_RECORD) in receipt_schema / op_schema'),
    ('CV-1320 payload enabled_at_utc (Project payload, inline projection)', EVENT_RECORD, 'format_checker(EVENT_RECORD) in payload_schema / ck_schema'),
    ('adapter_readiness_source enabled_at_utc', EVENT_RECORD, 'format_checker(EVENT_RECORD) in rdy_source_schema'),
    ('checkpoint first_retired_at_utc', EVENT_RECORD, 'format_checker(EVENT_RECORD) in ck_schema'),
    ('test_capture_application_records $defs/timestamp (every created/started/ended/observed time of the 11 record definitions)',
     EVENT_RECORD, 'format_checker(EVENT_RECORD) in records_schema'),
)
RECORDS_ID = 'https://puppetmaster.local/schemas/test_capture_application_records/1.0.0/schema.json'


def date_time_ok(value, profile):
    try:
        return date_time(value, profile=profile) == value
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


FIXTURE_PATH = []   # development override of the fixture file (--fixtures)


@lru_cache(maxsize=None)
def load(name):
    path = ROOT / 'Plans' / name
    if name == FIXTURES and FIXTURE_PATH:
        path = FIXTURE_PATH[0]
    if name == FIXTURES:
        return loads_fixture(path.read_text())
    return json.loads(path.read_text())


@contextmanager
def exact_digits():
    """Scoped: no process-global digit-limit change outlives one observation (4,400-digit integers)."""
    before = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        yield
    finally:
        sys.set_int_max_str_digits(before)


def canon(value):
    """Typed canonical text for comparison: true, 1 and 1.0 stay distinct; object key order is not semantic."""
    with exact_digits():
        return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=True, allow_nan=False)


def sha(value):
    """SHA-256 over exact SP-236 canonical bytes of an immutable stored record."""
    return hashlib.sha256(storage_value_bytes(value, profile=EVENT_VALUE)).hexdigest()


def sha_or_none(value):
    try:
        return sha(value)
    except (Refusal, *CAUGHT):
        return None


def family_def(family):
    return FAMILIES[family][1]


def edition(family, scope, kind=''):
    """Definition name of a family root in the selected scope edition (kind '', '_request', '_operation', '_checkpoint')."""
    return family_def(family) + kind + ('ApplicationV1' if scope == 'application' else '')


def payload_schema_id(family, scope):
    return 'pm.event_payload.' + family + ('.application.v1' if scope == 'application' else '.v1')


@lru_cache(maxsize=None)
def corpus():
    return Corpus(ROOT)


@lru_cache(maxsize=None)
def contracts_doc():
    return corpus().document(CONTRACTS)


def stripped_doc():
    """The contracts document with exactly the restored allOf clauses removed (each restored at a named row):
    the operation phase/custody oneOf (rows op_phase_*) and the checkpoint cursor if/then pairs (rows ck_cursor_*).
    Every other keyword (pattern, format, not, the scope allOf) stays in validation."""
    doc = copy.deepcopy(contracts_doc())
    doc['$id'] = doc['$id'].replace('/schema.json', '/schema.restored-rows.json')
    for name, node in doc['$defs'].items():
        if re.fullmatch(r'.+_operation(ApplicationV1)?', name):
            kept = [a for a in node['allOf'] if 'oneOf' not in a]
            if len(node['allOf']) - len(kept) != 1 or [list(a) for a in kept] != [['properties']]:
                raise RuntimeError('operation allOf changed: ' + name)
            node['allOf'] = kept
        elif re.fullmatch(r'.+_checkpoint(ApplicationV1)?', name):
            kept = [a for a in node['allOf'] if 'if' not in a]
            removed = [a for a in node['allOf'] if 'if' in a]
            if [sorted(a['then']['properties']) for a in removed] != [['last_event_id'], ['last_sequence_id']]:
                raise RuntimeError('checkpoint cursor allOf changed: ' + name)
            node['allOf'] = kept
    return doc


@lru_cache(maxsize=None)
def registry():
    doc = stripped_doc()
    return corpus().registry.with_resource(doc['$id'], Resource.from_contents(doc))


DATETIME_FORMATS = format_checker(profile=EVENT_RECORD)


def uri(name, restored=False):
    base = stripped_doc()['$id'] if restored else contracts_doc()['$id']
    return base + '#/$defs/' + name


EVENT_URI = 'https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json'
RESULT_URI = 'https://puppetmaster.local/schemas/event_append_receipt_contracts/2.0.0#/$defs/full_value_result'


@lru_cache(maxsize=None)
def validator(ref):
    return Draft202012Validator({'$ref': ref}, registry=registry(), format_checker=DATETIME_FORMATS)


def valid(ref, instance):
    with exact_digits():
        return validator(ref).is_valid(instance)


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
def slot_registry():
    """The same resources without their $schema keyword: jsonschema's evolve() re-selects the validator class from a
    referenced resource's $schema, which would drop the recording type checker inside an embedded EventRecord or
    receipt. Contents are otherwise identical (slot recording only; verdicts use registry())."""
    from referencing.jsonschema import DRAFT202012
    resources = []
    docs = {uri_: corpus().document(path.relative_to(ROOT).as_posix()) for uri_, path in corpus().uri_paths.items()}
    docs[stripped_doc()['$id']] = stripped_doc()
    for uri_, doc in docs.items():
        if isinstance(doc, dict):
            bare = {k: v for k, v in doc.items() if k != '$schema'}
            resources.append((uri_, DRAFT202012.create_resource(bare)))
    return registry().with_resources(resources)


@lru_cache(maxsize=None)
def slot_validator(ref):
    return SlotValidator({'$ref': ref}, registry=slot_registry())


def slots_exact(ref, instance):
    del _SLOTS[:]
    with exact_digits():
        slot_validator(ref).is_valid(instance)
    found = list(_SLOTS)
    del _SLOTS[:]
    try:
        for value in found:
            current_integer(value)
    except Refusal:
        return False
    return True


def u64_ok(value):
    try:
        storage_uint64(value)
        return True
    except Refusal:
        return False


def install_refs_resolve(resources):
    """Every $ref in every installed resource resolves eagerly with its declared $id through the unchanged Corpus
    offline registry, including unvisited branches; no retrieval, alias or filename fallback."""
    reg = corpus().registry
    for doc in resources.values():
        ok = [True]

        def walk(node, base):
            if isinstance(node, dict):
                if '$id' in node and type(node['$id']) is str:
                    base = node['$id'] if '://' in node['$id'] else base
                if '$ref' in node:
                    try:
                        reg.resolver(base).lookup(node['$ref'])
                    except Exception:  # noqa: BLE001 - any resolution failure is this row's refusal
                        ok[0] = False
                for child in node.values():
                    walk(child, base)
            elif isinstance(node, list):
                for child in node:
                    walk(child, base)
        walk(doc, doc.get('$id', ''))
        if not ok[0]:
            return False
    return True


def metaschema_ok(resources):
    try:
        for doc in resources.values():
            Draft202012Validator.check_schema(doc)
        return True
    except Exception:  # noqa: BLE001 - any metaschema failure is a refusal of this row
        return False


# ---------------------------------------------------------------------------------------------
# Owner recipes (TCME-1300..1319/ATS-1220 "Identity and replay"; CV-366; Storage project~ partition; SP-13xx keys)
# ---------------------------------------------------------------------------------------------
def hexed(text):
    return text.encode('utf-8').hex()


def partition(scope, project_id):
    if scope == 'application':
        return 'app'
    return 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')


def event_id_recipe(storage_instance_id, operation_id, event_type):
    return 'w3c@1:' + hexed(storage_instance_id) + ':' + hexed(operation_id) + ':' + hexed(event_type)


def key_recipe(scope, event_type, server_id, operation_id):
    if scope == 'application':
        return 'application@1:' + hexed(server_id) + ':' + hexed(operation_id)
    return event_type + '@1:' + hexed(operation_id)


def operation_key(family, scope, storage_instance_id, project_id, operation_id):
    stem = family_def(family) + '_operation' + ('.application.v1' if scope == 'application' else '.v1')
    return stem + ':' + storage_instance_id + ':' + partition(scope, project_id) + ':' + operation_id


def checkpoint_key(family, scope, storage_instance_id, project_id, subject_id, generation_id):
    stem = family_def(family) + '_checkpoint' + ('.application.v1' if scope == 'application' else '.v1')
    return stem + ':' + storage_instance_id + ':' + partition(scope, project_id) + ':' + subject_id + ':' + generation_id


def subject_of(payload):
    return [payload[k] for k in SUBJECT_ORDER if k in payload][0]


def owner_scope(o, scope):
    return {'schema_id': 'pm.workflow_scope.v2', 'schema_version': '2.0.0', 'scope_kind': scope,
            'scope_partition': partition(scope, o['project_id']), 'project_id': o['project_id'],
            'project_home_server_id': o['project_home_server_id'], 'named_plan_id': o['named_plan_id'], 'server_id': o['server_id']}


# ---------------------------------------------------------------------------------------------
# SP-1101 retained originals
# ---------------------------------------------------------------------------------------------
RECIPE_ID = 'w3c@1'
FROZEN = ('decodes', 'envelope', 'payload', 'storage_times', 'event_identity', 'key', 'full_value', 'producer', 'custody_event')


def custody():
    return load(CUSTODY_FILE)


def resource_manifest(read=None):
    read = read or (lambda n: (ROOT / n).read_bytes())
    names = sorted(custody()['recipes'][RECIPE_ID]['resources'])
    return hashlib.sha256(json.dumps({n: hashlib.sha256(read(n)).hexdigest() for n in names}, sort_keys=True,
                                     separators=(',', ':')).encode('ascii')).hexdigest()


def recipe_tuple(recipe_id, family, scope, manifest):
    r = custody()['recipes'][recipe_id]
    return RecipeTuple(
        envelope_schema_id=r['envelope_schema_id'], envelope_schema_version=r['envelope_schema_version'],
        payload_schema_id=payload_schema_id(family, scope), payload_schema_version=r['payload_schema_version'],
        owner_source_id='Plans/Contracts_V0.md#' + FAMILIES[family][3], owner_edition=r['owner_edition'],
        registry_revision=r['registry_revision'], identity_recipe=r['identity_recipe'][scope],
        producer_recipe=r['producer_recipe'], physical_profile=r['physical_profile'],
        full_value_profile=r['full_value_profile'], local_source_profile=r['local_source_profile'],
        payload_profile=r['payload_profile'], resource_manifest_sha256=manifest)


def frozen_components(original, family, scope):
    """The w3c@1 frozen verifier over Storage's original; each component is its own fact. No current gate."""
    try:
        record = decode_storage_value(original.record_bytes, profile=EVENT_VALUE)
        held = decode_storage_value(original.receipt_bytes, profile=EVENT_VALUE)
    except Refusal:
        return {'decodes': False}
    out = {'decodes': type(record) is dict and type(held) is dict}
    if not out['decodes']:
        return out
    out['envelope'] = valid(EVENT_URI, record) and slots_exact(EVENT_URI, record) and type(record.get('payload')) is dict
    out['payload'] = out['envelope'] and valid(uri(edition(family, scope)), record['payload'])
    out['storage_times'] = out['envelope'] and all([date_time_ok(record[k], STORAGE_UTC_Z) for k in ('observed_at_utc', 'persisted_at_utc')])
    if out['payload']:
        for k, pair in frozen_pairs(original, family, scope).items():   # one computation for the verifier and the rows
            out[k] = pair[0] == pair[1]
    return out


FROZEN_EQ = ('event_identity', 'key', 'full_value', 'producer', 'custody_event')


def frozen_pairs(original, family, scope):
    """The raw [held or supplied, recomputed] pair each comparison component of the frozen verifier compares."""
    record = decode_storage_value(original.record_bytes, profile=EVENT_VALUE)
    held = decode_storage_value(original.receipt_bytes, profile=EVENT_VALUE)
    p = record['payload']
    return {'event_identity': [record['event_id'], event_id_recipe(original.binding.storage_instance_id, p['owner_operation_id'], family)],
            'key': [record['idempotency_key'], key_recipe(scope, family, p['scope']['server_id'], p['owner_operation_id'])],
            'full_value': [canon(held.get('full_value_sha256')), canon(full_value_commitment(record))],
            'producer': [canon(held.get('producer_semantic_sha256')), canon(producer_semantic_digest(record))],
            'custody_event': [canon(held.get('event_id')), canon(record['event_id'])]}


def frozen_verifier(expected_tuple, family, scope):
    def verify(original):
        if original.recipe != expected_tuple:
            return False
        comps = frozen_components(original, family, scope)
        return all([comps.get(k) is True for k in FROZEN])
    return FrozenRecipe(verify)


def install_frozen_recipes(read=None):
    installed = {}
    manifest = resource_manifest(read)
    for family, spec in FAMILIES.items():
        for scope in spec[5]:
            key = recipe_tuple(RECIPE_ID, family, scope, manifest)
            installed[key] = frozen_verifier(key, family, scope)
    return installed


@lru_cache(maxsize=None)
def frozen_recipes():
    return install_frozen_recipes()


def original_ref(storage_instance_id, e):
    return 'seglog:' + ':'.join([hexed(x) for x in (storage_instance_id, e['scope_kind'], e['event_type'], e['event_id'])])


def binding_of(storage_instance_id, e, record_bytes):
    p = e['payload']
    return OriginalBinding(storage_instance_id=storage_instance_id, scope_kind=e['scope_kind'], server_id=p['scope']['server_id'],
                           project_id=e['project_id'], event_type=e['event_type'], event_id=e['event_id'],
                           idempotency_key=e['idempotency_key'], owner_operation_id=p['owner_operation_id'],
                           source_commitment=hashlib.sha256(record_bytes).hexdigest())


class W3COriginalOwner:
    """Storage's sealed write custody in the scenario's Store (a stand-in for native custody).

    It reads Storage's sealed receipts; the write-time recipe comes only from the one sealed receipt for that exact
    original (Store, scope, event type, event id) whose source commitment is the record Storage holds. None for
    that id is original_unavailable; receipts for that id that bind other bytes are original_other_receipt; several
    binding receipts are recipe_ambiguous; a receipt without this family's at-write admission is original_admission.
    A sealed store whose service is ``write_through`` is a Storage backend that mints a receipt on every read;
    the reader detects that by snapshotting the sealed store, never by trusting the backend."""

    def __init__(self, store):
        self.store = store

    def authenticated_original(self, ref):
        try:
            store, scope, event_type, event_id = [bytes.fromhex(x).decode('utf-8') for x in ref[len('seglog:'):].split(':')]
        except (ValueError, UnicodeDecodeError):
            raise Refusal('original_query')
        if store != self.store['storage_instance_id'] or store not in custody()['stores']:
            raise Refusal('original_unavailable')
        sealed = self.store['sealed_receipts']
        at_id = [r for r in sealed if r['storage_instance_id'] == store and r['event_id'] == event_id
                 and r['event_type'] == event_type and r['scope_kind'] == scope]
        record_bytes = storage_value_bytes(self.store['original'], profile=EVENT_VALUE)
        commitment = hashlib.sha256(record_bytes).hexdigest()
        if not at_id:
            raise Refusal('original_unavailable')
        binding = [r for r in at_id if r['source_commitment'] == commitment]
        if not binding:
            raise Refusal('original_other_receipt')
        if len(binding) != 1:
            raise Refusal('recipe_ambiguous')
        receipt = binding[0]
        if self.store.get('service') == 'write_through':
            sealed.append(dict(receipt, kind='read'))   # a backend that mints a receipt on every read
        recipe = custody()['recipes'].get(receipt['recipe'])
        if recipe is None:
            raise Refusal('recipe_unknown')
        if receipt.get('admission') != {'family': event_type, 'version': '1.0.0', 'registry_revision': recipe['registry_revision']}:
            raise Refusal('original_admission')
        held = self.store['held']
        return OriginalCustody(binding_of(store, self.store['original'], record_bytes),
                               recipe_tuple(receipt['recipe'], event_type, scope, receipt['resource_manifest_sha256']),
                               record_bytes, storage_value_bytes(held['result'], profile=EVENT_VALUE),
                               storage_value_bytes(held, profile=EVENT_VALUE))


def dispatch(c):
    """One SP-1101 resolution of the original this retry or retained read asks for, on a working copy of the
    scenario's sealed store: (reason, sealed store before, sealed store after, original or None)."""
    store = copy.deepcopy(c['storage']['custody'])
    before = canon(store['sealed_receipts'])
    request = c['event']
    try:
        owner = W3COriginalOwner(store)
        sid = c['owner']['storage_instance_id']
        expected = binding_of(sid, request, storage_value_bytes(store['original'], profile=EVENT_VALUE))
        selector = (c.get('reader') or c.get('retry') or {}).get('recipe_selector')
        original = RetainedDispatcher(owner, frozen_recipes()).resolve(original_ref(sid, request), expected,
                                                                       disclose=lambda binding: True, recipe_override=selector)
        return 'ok', before, canon(store['sealed_receipts']), original
    except Refusal as refusal:
        return refusal.reason, before, canon(store['sealed_receipts']), None
    except CAUGHT:
        return 'original_query', before, canon(store['sealed_receipts']), None


def resolved_original(c):
    """The authenticated original for the frozen-component facts, when only the frozen verifier refused it."""
    store = copy.deepcopy(c['storage']['custody'])
    request = c['event']
    return W3COriginalOwner(store).authenticated_original(original_ref(c['owner']['storage_instance_id'], request))


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


def E(c):
    return c['event']


def P(c):
    return c['event']['payload']


def O(c):
    return c['owner']


def REC(c, ref):
    return c['owner']['records'][ref]


def SRC(c):
    return REC(c, c['owner']['source_ref'])


def REQ(c):
    return c['owner']['request']


def RQR(c):
    return REC(c, REQ(c)['request_record']['record_ref'])


def BEF(c):
    ref = c['owner']['predecessor_ref']
    return None if ref is None else REC(c, ref)


def OP(c):
    return c['operation'] if c['path'] == 'append' else c['operation']['successor']


def CK(c):
    return c['checkpoint']['row']


def genuine_outcome(c):
    """The genuine committed owner result as a source_ref (the authority every outcome copy joins)."""
    return {'record_ref': O(c)['source_ref'], 'record_sha256': sha(SRC(c))}


def media_sha(c, ref):
    return hashlib.sha256(bytes.fromhex(c['owner']['media'][ref])).hexdigest()


def index_of(steps, name):
    return steps.index(name) if type(steps) is list and name in steps else -1


@derived
def effectful(c, m):
    """Current-writer admission applies to every effectful step; a governance withdrawal is not one."""
    return not (c.get('path') == 'operation' and type(c.get('operation')) is dict and
                type(c['operation'].get('successor')) is dict and c['operation']['successor'].get('phase') == 'withdrawn')


@derived
def r0(c, m):
    """Scenario readable: known path, family and supported scope; event paths carry an event object of the family."""
    if c.get('path') not in PATHS or c.get('family') not in FAMILIES or c.get('scope') not in FAMILIES[c['family']][5]:
        return False
    if c['path'] in ('append', 'history') or (c['path'] == 'retry' and c.get('event') is not None):
        return type(c.get('event')) is dict and c['event'].get('event_type') == c['family']
    return True


@derived
def env_valid(c, m):
    return valid(EVENT_URI, E(c))


@derived
def env_numbers(c, m):
    return slots_exact(EVENT_URI, E(c))


@derived
def r1(c, m):
    """Envelope ready: stock verdict, exact integers, uint64 sequence, Storage UTC times, edition payload schema id."""
    if not (m.get('r0') and m.get('env_valid') and m.get('env_numbers')):
        return False
    e = E(c)
    return (u64_ok(e['sequence_id']) and all([date_time_ok(e[k], STORAGE_UTC_Z) for k in ('observed_at_utc', 'persisted_at_utc')])
            and e['payload_schema_id'] == payload_schema_id(c['family'], c['scope']))


@derived
def payload_valid(c, m):
    return valid(uri(edition(c['family'], c['scope'])), P(c))


@derived
def r2(c, m):
    return m.get('r1') and m.get('payload_valid')


@derived
def producer_ok(c, m):
    try:
        with exact_digits():
            producer_semantic_bytes(E(c))
        return True
    except Refusal:
        return False


@derived
def inline_bytes(c, m):
    return len(storage_value_bytes(P(c), profile=EVENT_VALUE))


def pack_of(c, ref):
    packs = c.get('packs')
    return packs.get(ref) if type(packs) is dict and type(ref) is str else None


def pack_bytes_ok(pack):
    try:
        verify_payload_bytes(bytes.fromhex(pack['bytes_hex']), byte_size=pack['byte_size'], payload_id=pack['payload_id'],
                             media_type=pack['media_type'], expected_media_type=PACK_MEDIA)
        return True
    except (Refusal, ValueError, TypeError, KeyError):
        return False


def pack_body(pack):
    try:
        return decode_storage_value(bytes.fromhex(pack['bytes_hex']), profile=EVENT_VALUE)
    except (Refusal, ValueError):
        return None


def pack_ready(c, ref):
    pack = pack_of(c, ref)
    return pack is not None and ref == 'sp337:blake3:' + str(pack.get('payload_id')) and pack_bytes_ok(pack) and pack_body(pack) is not None


@derived
def r3(c, m):
    """Body ready: r2, the producer projection qualifies and the size/pack route holds."""
    if not m.get('r2') or not m.get('producer_ok'):
        return False
    ref = E(c)['payload_ref']
    if ref is None:
        return m.get('inline_bytes') <= INLINE_LIMIT
    return pack_ready(c, ref) and canon(pack_body(pack_of(c, ref))) == canon(P(c))


@derived
def disp(c, m):
    return dispatch(c)


@derived
def frozen(c, m):
    reason = m.get('disp')[0]
    if reason not in ('ok', 'original_verification'):
        return {}
    return frozen_components(resolved_original(c), c['family'], c['scope'])


@derived
def frozen_pair(c, m):
    return frozen_pairs(resolved_original(c), c['family'], c['scope'])


# ---------------------------------------------------------------------------------------------
# Row specification. Each row: one predicate with one refusal code. ``fn(c, m)`` returns NA (True) when the row
# does not apply or an earlier row owns its precondition, else the template's observation.
# ---------------------------------------------------------------------------------------------
TEMPLATES = {
    # observation -> predicate body (the row refuses with its code when the condition holds)
    'ok': ('v is not True', 'True, or False when the shared helper/validator refuses'),
    'eq': ('v[0] != v[1]', '[supplied, authority] as typed canonical text or exact scalars'),
    'ne': ('v[0] == v[1]', '[value, value it must differ from]'),
    'true': ('v[0] is not True', '[raw fact]'),
    'false': ('v[0] is not False', '[raw fact]'),
    'null': ('v[0] is not None', '[raw fact]'),
    'nonnull': ('v[0] is None', '[raw fact]'),
    'in': ('v[0] not in LIT', '[raw fact]'),
    'notin': ('v[0] in LIT', '[raw fact]'),
    'member': ('v[0] not in v[1]', '[value, list]'),
    'notmember': ('v[0] in v[1]', '[value, list]'),
    'subset': ('not set(v[0]) <= set(v[1])', '[list, list]'),
    'single': ('len(set(v[0])) != 1', '[list]'),
    'implies': ('v[0] is True and v[1] is not True', '[premise, consequence]'),
    'le': ('v[0] > v[1]', '[integer, integer]'),
    'lt': ('v[0] < 0 or v[1] < 0 or v[0] >= v[1]', '[index, index] (-1 when absent)'),
    'empty': ('len(v[0]) != 0', '[list]'),
    'nonempty': ('len(v[0]) == 0', '[list]'),
    'reason': ('v == LIT', 'the shared helper\'s reason string'),
}

ROWS = []
ENTAILED = {}   # row id -> (rows that always refuse first, proof)
GROUP_ORDER = []


def row(group, rid, code, field, words, template, fn, paths, families=None, lit=None):
    if any([r['id'] == rid for r in ROWS]):
        raise ValueError('duplicate row ' + rid)
    if template not in TEMPLATES:
        raise ValueError('unknown template ' + template)
    if group not in GROUP_ORDER:
        GROUP_ORDER.append(group)
    ROWS.append({'group': group, 'id': rid, 'code': code, 'field': field, 'words': words, 'template': template, 'fn': fn,
                 'paths': frozenset(paths.split()), 'families': None if families is None else frozenset(families), 'lit': lit})


def applies(r, c):
    if c.get('path') not in r['paths'] and '*' not in r['paths']:
        return False
    if r['paths'] == frozenset(AR.split()) and c.get('path') == 'retry' and c.get('event') is None:
        return False   # a retry before outcome binding has no candidate EventRecord (its request rows apply)
    return r['families'] is None or c.get('family') in r['families']


def gate(*names):
    """Run fn only when every named readiness level holds (an earlier row owns its failure)."""
    def wrap(fn):
        def held(c, m):
            for n in names:
                if not m.get(n):
                    return NA
            return fn(c, m)
        return held
    return wrap


def when(test):
    """Run fn only when test(c, m) holds (the row's own applicability, not a verdict)."""
    def wrap(fn):
        def held(c, m):
            return fn(c, m) if test(c, m) else NA
        return held
    return wrap


def ok(value):
    return value is True


AR = 'append retry'
R3 = gate('r3')

# scenario ----------------------------------------------------------------------------------------
row('scenario', 'scenario_path', 'scenario_path', '/path', 'the path is install, append, retry, history, operation or checkpoint',
    'in', lambda c, m: [c.get('path')], '*', lit=PATHS)
row('scenario', 'scenario_family', 'scenario_family', '/family', 'the family is one of the twenty-one W3C families',
    'in', lambda c, m: [c.get('family')], '*', lit=tuple(FAMILIES))
row('scenario', 'scenario_scope', 'scope_unsupported', '/scope',
    'the family supports the selected scope edition (readiness is Project-only: ATS-1220)',
    'member', lambda c, m: NA if c.get('family') not in FAMILIES else [c.get('scope'), list(FAMILIES[c['family']][5])], '*')
row('scenario', 'event_family', 'event_family', '/event/event_type',
    'the event (candidate, formed input or presented retained record) is an object of the scenario family',
    'eq', lambda c, m: NA if c.get('family') not in FAMILIES or c.get('scope') not in FAMILIES[c['family']][5] or c.get('path') not in PATHS
    or (c['path'] == 'retry' and c.get('event') is None)
    else [canon(c['event'].get('event_type') if type(c.get('event')) is dict else '<not an EventRecord object>'), canon(c['family'])], 'append retry history')

# install (eager resource admission, CV-13xx "every referenced schema, even unvisited branches") -------------------
row('install', 'install_metaschema', 'schema_install', '/resources', 'every installed W3C resource is a valid 2020-12 schema',
    'ok', lambda c, m: metaschema_ok(c['resources']), 'install')
row('install', 'install_refs', 'schema_reference', '/resources',
    'every $ref in every installed resource resolves eagerly through the unchanged Corpus registry, including unvisited branches',
    'ok', lambda c, m: install_refs_resolve(c['resources']) if metaschema_ok(c['resources']) else NA, 'install')

# application capture source records (the lane's application sibling records schema) ------------------------------
row('records', 'records_schema', 'record_schema', '/record',
    'the application source record validates its exact test_capture_application_records definition (shared date-time checker at every timestamp)',
    'ok', gate('r0')(lambda c, m: valid(RECORDS_ID + '#/$defs/' + c['record_def'], c['record'])), 'records')

# admission and writer (current writer only: append and effectful operation transitions) -----------------------
EFFECT = 'append operation'
row('admission', 'admission_family', 'family_not_admitted', '/owner/admission/family',
    'the current writer holds an exact admission of this family (phase-1 absence refuses with zero effects)',
    'eq', gate('r0', 'effectful')(lambda c, m: [O(c)['admission']['family'], c['family']]), EFFECT)
row('admission', 'admission_version', 'family_version', '/owner/admission/version', 'the admitted version is 1.0.0',
    'in', gate('r0', 'effectful')(lambda c, m: [O(c)['admission']['version']]), EFFECT, lit=('1.0.0',))
row('admission', 'admission_installed', 'schema_not_installed', '/owner/admission/schema_installed',
    'the physical schema and its dependencies are installed', 'true', gate('r0', 'effectful')(lambda c, m: [O(c)['admission']['schema_installed']]), EFFECT)
row('admission', 'writer_live', 'writer_withdrawn', '/owner/writer/withdrawn', 'writer admission is not withdrawn (cutoff fences new effects)',
    'false', gate('r0', 'effectful')(lambda c, m: [O(c)['writer']['withdrawn']]), EFFECT)
row('admission', 'writer_generation', 'writer_generation', '/commit_check/writer_generation',
    'the writer generation rechecked before effect and commit is the live owner generation',
    'eq', gate('r0', 'effectful')(lambda c, m: [c['commit_check']['writer_generation'], O(c)['writer']['generation']]), EFFECT)
row('admission', 'stop_generation', 'stop_generation', '/commit_check/stop_generation',
    'the Stop generation rechecked before effect and commit is the live one',
    'eq', gate('r0', 'effectful')(lambda c, m: [c['commit_check']['stop_generation'], O(c)['writer']['stop_generation']]), EFFECT)
row('admission', 'permission_granted', 'permission_denied', '/owner/permission/granted',
    'the actual capability/permission is granted now (not a caller flag)', 'true', gate('r0', 'effectful')(lambda c, m: [O(c)['permission']['granted']]), EFFECT)
row('admission', 'permission_generation', 'permission_generation', '/commit_check/permission_generation',
    'the permission generation rechecked before effect and commit is the live one',
    'eq', gate('r0', 'effectful')(lambda c, m: [c['commit_check']['permission_generation'], O(c)['permission']['generation']]), EFFECT)
row('admission', 'target_class', 'target_class', '/owner/target/security_class',
    'the exact target security class is permitted; protected authentication is excluded',
    'in', gate('r0', 'effectful')(lambda c, m: [O(c)['target']['security_class']]), EFFECT, lit=('ordinary', 'test_fixture'))
row('admission', 'target_generation', 'target_generation', '/commit_check/target_generation',
    'the target generation rechecked before effect and commit is the live target generation',
    'eq', gate('r0', 'effectful')(lambda c, m: [c['commit_check']['target_generation'], O(c)['target']['generation']]), EFFECT)
row('admission', 'target_host', 'target_host', '/owner/target/host_id', 'the target is on the owner Host',
    'eq', gate('r0', 'effectful')(lambda c, m: [O(c)['target']['host_id'], O(c)['host_id']]), EFFECT)
row('admission', 'target_environment', 'target_environment', '/owner/target/environment_id', 'the target is in the owner Environment',
    'eq', gate('r0', 'effectful')(lambda c, m: [O(c)['target']['environment_id'], O(c)['environment_id']]), EFFECT)

# envelope (current writer and retry candidate) ---------------------------------------------------------------
row('envelope', 'envelope_schema', 'envelope_schema', '/event',
    'the EventRecord stock verdict (shared CV-1101 event_record date-time checker) accepts the event',
    'ok', gate('r0')(lambda c, m: m.get('env_valid')), AR)
row('envelope', 'envelope_numbers', 'current_integer', '/event', 'every EventRecord integer slot is an exact current integer (CV-1100)',
    'ok', gate('r0', 'env_valid')(lambda c, m: m.get('env_numbers')), AR)
row('envelope', 'sequence_u64', 'storage_uint64', '/event/sequence_id', 'sequence_id is a Storage uint64 (SP-1100)',
    'ok', gate('r0', 'env_valid', 'env_numbers')(lambda c, m: u64_ok(E(c)['sequence_id'])), AR)
for _k in ('observed_at_utc', 'persisted_at_utc'):
    row('envelope', 'storage_utc_' + _k, 'storage_utc_z', '/event/' + _k,
        'the Storage-assigned ' + _k + ' passes the shared date_time with the CV-253 storage_utc_z profile',
        'ok', gate('r0', 'env_valid', 'env_numbers')(lambda c, m, k=_k: date_time_ok(E(c)[k], STORAGE_UTC_Z)), AR)
row('envelope', 'payload_schema_id', 'payload_schema_id', '/event/payload_schema_id',
    'payload_schema_id names the selected scope edition of the family payload',
    'eq', gate('r0', 'env_valid')(lambda c, m: [E(c)['payload_schema_id'], payload_schema_id(c['family'], c['scope'])]), AR)


def _policy(value):
    try:
        current_append_policy(value)
        return True
    except Refusal:
        return False


row('envelope', 'replay_policy_current', 'replay_only_not_appendable', '/event/replay_policy',
    'the current writer and retry never select projector_replay_only (shared current_append_policy; Contracts_V0 EventRecord)',
    'ok', gate('r1')(lambda c, m: _policy(E(c)['replay_policy'])), AR)

# payload --------------------------------------------------------------------------------------------------
row('payload', 'payload_schema', 'payload_schema', '/event/payload',
    'the edition payload verdict (closed, required, types, consts, patterns, not, scope allOf; shared date-time checker) accepts it',
    'ok', gate('r1')(lambda c, m: m.get('payload_valid')), AR)
row('payload', 'producer_route', 'producer_route', '/event',
    'the CV-317 producer projection qualifies under CV-1100 (shared producer_semantic_bytes) before any effect',
    'ok', gate('r2')(lambda c, m: m.get('producer_ok')), AR)
row('payload', 'inline_size', 'inline_size', '/event/payload',
    'an inline body (payload_ref null) is at most 16384 canonical SP-236 bytes (SP-337)',
    'le', gate('r2', 'producer_ok')(lambda c, m: NA if E(c)['payload_ref'] is not None else [m.get('inline_bytes'), INLINE_LIMIT]), AR)


def pack_rows(group, site, ref_fn, body_fn, paths, ready):
    """SP-337 rows for one externalized part: the named pack exists, its id names it, its bytes verify, and its
    body is canonical (and, where an inline copy exists, equals it)."""
    def ref_of(c, m):
        return ref_fn(c)

    row(group, site + '_pack_present', 'payload_ref_unresolved', '/' + site + '/payload_ref', 'the referenced ' + site + ' part names a durable pack',
        'member', ready(lambda c, m: NA if ref_of(c, m) is None else [ref_of(c, m), sorted((c.get('packs') or {}).keys())]), paths)
    def named(c, m):
        pack = pack_of(c, ref_of(c, m))
        return pack is not None and ref_of(c, m) == 'sp337:blake3:' + str(pack.get('payload_id'))

    row(group, site + '_pack_id', 'payload_ref', '/' + site + '/payload_ref', 'the reference is sp337:blake3:<payload_id> of that pack',
        'eq', ready(lambda c, m: NA if pack_of(c, ref_of(c, m)) is None else [ref_of(c, m), 'sp337:blake3:' + str(pack_of(c, ref_of(c, m)).get('payload_id'))]), paths)
    row(group, site + '_pack_bytes', 'payload_pack', '/packs', 'the pack bytes match their BLAKE3 id, size and media type (shared verify_payload_bytes)',
        'ok', ready(lambda c, m: NA if not named(c, m) else pack_bytes_ok(pack_of(c, ref_of(c, m)))), paths)
    row(group, site + '_pack_body', 'payload_pack', '/packs', 'the pack decodes (SP-236) to ' + ('exactly the inline copy' if body_fn else 'a canonical body'),
        'eq' if body_fn else 'ok',
        ready(lambda c, m: NA if not named(c, m) or not pack_bytes_ok(pack_of(c, ref_of(c, m)))
              else ([canon(pack_body(pack_of(c, ref_of(c, m)))), canon(body_fn(c))] if body_fn else pack_body(pack_of(c, ref_of(c, m))) is not None)), paths)


pack_rows('payload', 'event', lambda c: E(c)['payload_ref'], P, AR, gate('r2', 'producer_ok'))

# scope ----------------------------------------------------------------------------------------------------
row('scope', 'scope_kind_copy', 'scope_copy', '/event/payload/scope/scope_kind', 'payload scope_kind equals the envelope scope_kind',
    'eq', R3(lambda c, m: [P(c)['scope']['scope_kind'], E(c)['scope_kind']]), AR)
row('scope', 'scope_partition_recipe', 'scope_partition', '/event/payload/scope/scope_partition',
    'scope_partition is app or the reversible project~base64url(UTF-8 project_id) of the owner Project',
    'eq', R3(lambda c, m: [P(c)['scope']['scope_partition'], partition(c['scope'], O(c)['project_id'])]), AR)
row('scope', 'scope_project_join', 'scope_join', '/event/payload/scope/project_id', 'payload scope project_id is the owner Project (null for application)',
    'eq', R3(lambda c, m: [canon(P(c)['scope']['project_id']), canon(O(c)['project_id'])]), AR)
row('scope', 'scope_home_server_join', 'scope_join', '/event/payload/scope/project_home_server_id', 'payload scope project_home_server_id is the owner value',
    'eq', R3(lambda c, m: [canon(P(c)['scope']['project_home_server_id']), canon(O(c)['project_home_server_id'])]), AR)
row('scope', 'scope_server_join', 'scope_join', '/event/payload/scope/server_id', 'payload scope server_id is the actual Server (CV-366)',
    'eq', R3(lambda c, m: [P(c)['scope']['server_id'], O(c)['server_id']]), AR)
row('scope', 'scope_named_plan_join', 'scope_join', '/event/payload/scope/named_plan_id', 'payload scope named_plan_id is the owner value',
    'eq', R3(lambda c, m: [canon(P(c)['scope']['named_plan_id']), canon(O(c)['named_plan_id'])]), AR)
row('scope', 'event_project_join', 'scope_join', '/event/project_id', 'the envelope project_id is the owner Project',
    'eq', R3(lambda c, m: NA if P(c)['scope']['scope_kind'] != E(c)['scope_kind'] else [canon(E(c)['project_id']), canon(O(c)['project_id'])]), AR)

# identity -------------------------------------------------------------------------------------------------
row('identity', 'owner_operation_join', 'operation_join', '/event/payload/owner_operation_id', 'owner_operation_id is the immutable intent operation',
    'eq', R3(lambda c, m: [P(c)['owner_operation_id'], O(c)['owner_operation_id']]), AR)
row('identity', 'event_id_recipe', 'event_identity', '/event/event_id',
    'event_id is w3c@1:hex(storage_instance_id):hex(owner_operation_id):hex(event_type) of the owner values',
    'eq', R3(lambda c, m: [E(c)['event_id'], event_id_recipe(O(c)['storage_instance_id'], O(c)['owner_operation_id'], c['family'])]), AR)
row('identity', 'idempotency_key_recipe', 'idempotency_key', '/event/idempotency_key',
    'the key is <event_type>@1:hex(operation) (Project) or application@1:hex(server_id):hex(operation) (CV-366)',
    'eq', R3(lambda c, m: [E(c)['idempotency_key'], key_recipe(c['scope'], c['family'], O(c)['server_id'], O(c)['owner_operation_id'])]), AR)

# source identity and joins (append) ------------------------------------------------------------------------
row('source', 'source_record_owner', 'source_record', '/event/payload/source_record/record_ref', 'source_record names the genuine committed owner result',
    'eq', R3(lambda c, m: [P(c)['source_record']['record_ref'], O(c)['source_ref']]), 'append')
row('source', 'source_record_hash', 'source_hash', '/event/payload/source_record/record_sha256',
    'source_record.record_sha256 is SHA-256 of the exact immutable stored source bytes',
    'eq', R3(lambda c, m: NA if P(c)['source_record']['record_ref'] != O(c)['source_ref'] else [P(c)['source_record']['record_sha256'], sha(SRC(c))]), 'append')
row('source', 'before_record_join', 'before_record', '/event/payload/before_record', 'before_record is the owner predecessor snapshot (null only without one)',
    'eq', R3(lambda c, m: [canon(None if P(c)['before_record'] is None else P(c)['before_record']['record_ref']), canon(O(c)['predecessor_ref'])]), 'append')
row('source', 'before_record_hash', 'source_hash', '/event/payload/before_record/record_sha256', 'before_record.record_sha256 is SHA-256 of the stored predecessor bytes',
    'eq', R3(lambda c, m: NA if P(c)['before_record'] is None or O(c)['predecessor_ref'] is None or P(c)['before_record']['record_ref'] != O(c)['predecessor_ref']
             else [P(c)['before_record']['record_sha256'], sha(BEF(c))]), 'append')
row('source', 'permission_snapshot_join', 'permission_join', '/event/payload/permission_snapshot_ref', 'permission_snapshot_ref is the captured operation permission',
    'eq', R3(lambda c, m: [P(c)['permission_snapshot_ref'], O(c)['permission']['snapshot_ref']]), 'append')


def source_key(c, key):
    if key == '@permission_snapshot_id':
        return O(c)['permission']['snapshot_id']
    node = SRC(c)
    for part in (key if type(key) is list else [key]):
        node = node[part]
    return node


_JOIN_FIELDS = {}
for _fam, _spec in FAMILIES.items():
    for _field, _key in _spec[7]:
        _JOIN_FIELDS.setdefault(_field, []).append(_fam)
for _field, _fams in _JOIN_FIELDS.items():
    row('joins', 'join_' + _field, 'source_join', '/event/payload/' + _field,
        'payload ' + _field + ' equals the dereferenced committed source record field by field',
        'eq', R3(lambda c, m, f=_field: [canon(P(c)[f]), canon(source_key(c, dict(FAMILIES[c['family']][7])[f]))]), 'append', families=_fams)

# Storage-assigned metadata and owner-input copies (append) -------------------------------------------------------
for _k in ('sequence_id', 'observed_at_utc', 'persisted_at_utc'):
    row('metadata', _k + '_issued', 'storage_metadata', '/event/' + _k, 'the event ' + _k + ' is the value Storage issued, never a caller claim',
        'eq', gate('r1')(lambda c, m, k=_k: [canon(E(c)[k]), canon(c['storage']['issued'][k])]), 'append')
row('metadata', 'occurred_from_owner', 'owner_input_copy', '/event/occurred_at_utc', 'occurred_at_utc is copied from the immutable original owner input',
    'eq', gate('r1')(lambda c, m: [E(c)['occurred_at_utc'], O(c)['occurred_at_utc']]), 'append')
row('metadata', 'producer_sequence_from_owner', 'owner_input_copy', '/event/producer_sequence_id', 'producer_sequence_id is copied from the immutable original owner input',
    'eq', gate('r1')(lambda c, m: [canon(E(c)['producer_sequence_id']), canon(O(c)['producer_sequence_id'])]), 'append')

# frozen outcome and preimage, first receipt custody (append: the event_committed row) --------------------------------
row('custody', 'op_preimage_frozen', 'producer_preimage', '/operation/producer_semantics/record_sha256',
    'the appended event is exactly the frozen EventRecord caller preimage bound at outcome commitment (CV-317 digest)',
    'eq', R3(lambda c, m: [OP(c)['producer_semantics']['record_sha256'], producer_semantic_digest(E(c))]), 'append')
row('custody', 'op_outcome_frozen', 'outcome_binding', '/operation/outcome_record', 'the bound outcome is the payload source_record',
    'eq', R3(lambda c, m: NA if canon(P(c)['source_record']) != canon(genuine_outcome(c)) else [canon(OP(c)['outcome_record']), canon(P(c)['source_record'])]), 'append')
row('custody', 'op_original_event', 'original_event', '/operation/original_event', 'the committed original_event is the appended event (inline)',
    'eq', R3(lambda c, m: [canon(OP(c)['original_event']), canon({'mode': 'inline', 'value': E(c)})]), 'append')
row('custody', 'op_first_append', 'first_append', '/operation/first_append', 'first_append is Storage\'s issued full-value result, byte for byte',
    'eq', R3(lambda c, m: [canon(OP(c)['first_append']), canon(c['storage']['issued']['result'])]), 'append')

RESULT = lambda c: c['storage']['issued']['result']  # noqa: E731
RECEIPT = lambda c: c['storage']['issued']['result']['first_append_receipt']  # noqa: E731
row('receipt', 'receipt_schema', 'receipt_schema', '/storage/issued/result', 'the CV-339 full_value_result verdict (shared date-time checker) accepts the issuance',
    'ok', R3(lambda c, m: valid(RESULT_URI, RESULT(c))), 'append')
row('receipt', 'receipt_numbers', 'current_integer', '/storage/issued/result', 'every receipt integer slot is an exact current integer (CV-1100)',
    'ok', R3(lambda c, m: NA if not valid(RESULT_URI, RESULT(c)) else slots_exact(RESULT_URI, RESULT(c))), 'append')
for _k in RECEIPT_UINT64:
    row('receipt', 'receipt_u64_' + _k, 'storage_uint64', '/storage/issued/result/first_append_receipt/' + _k, 'receipt ' + _k + ' is a Storage uint64 (SP-1100)',
        'ok', R3(lambda c, m, k=_k: NA if not (valid(RESULT_URI, RESULT(c)) and slots_exact(RESULT_URI, RESULT(c))) else u64_ok(RECEIPT(c)[k])), 'append')
RV = lambda fn: R3(lambda c, m: NA if not (valid(RESULT_URI, RESULT(c)) and slots_exact(RESULT_URI, RESULT(c)) and
                                         all([u64_ok(RECEIPT(c)[k]) for k in RECEIPT_UINT64])) else fn(c, m))  # noqa: E731
row('receipt', 'receipt_event_join', 'receipt_join', '/storage/issued/result/first_append_receipt/event_id', 'the first receipt names this event',
    'eq', RV(lambda c, m: [RECEIPT(c)['event_id'], E(c)['event_id']]), 'append')
row('receipt', 'receipt_sequence_join', 'receipt_join', '/storage/issued/result/first_append_receipt/sequence_id', 'the first receipt names the issued sequence',
    'eq', RV(lambda c, m: [canon(RECEIPT(c)['sequence_id']), canon(c['storage']['issued']['sequence_id'])]), 'append')
row('receipt', 'receipt_ack_issued', 'receipt_join', '/storage/issued/result/first_append_receipt/acknowledged_at_utc', 'the acknowledgement time is the issued one',
    'eq', RV(lambda c, m: [RECEIPT(c)['acknowledged_at_utc'], c['storage']['issued']['acknowledged_at_utc']]), 'append')
row('receipt', 'receipt_barrier', 'durability_class', '/storage/issued/result/first_append_receipt/durability_class', 'the append used durability_class=barrier',
    'in', RV(lambda c, m: [RECEIPT(c)['durability_class']]), 'append', lit=('barrier',))
row('receipt', 'receipt_commitment', 'full_value_commitment', '/storage/issued/result/original_event_value_commitment/sha256',
    'the strict v2 commitment recomputes over the appended event (shared full_value_commitment)',
    'eq', RV(lambda c, m: [RESULT(c)['original_event_value_commitment']['sha256'], full_value_commitment(E(c))]), 'append')
row('receipt', 'receipt_segment', 'receipt_join', '/storage/issued/result/original_segment_ref', 'original_segment_ref is the issued segment',
    'eq', RV(lambda c, m: [RESULT(c)['original_segment_ref'], c['storage']['issued']['segment_ref']]), 'append')

PUBLICATION_ORDER = (('flush', 'receipt'), ('receipt', 'event_committed'), ('event_committed', 'terminal'), ('terminal', 'publish'))
for _a, _b in PUBLICATION_ORDER:
    row('publication', 'order_' + _a + '_' + _b, 'publication_order', '/publication',
        _a + ' precedes ' + _b + ' (barrier flush, first receipt custody, phase CAS, terminal, then dependent publication)',
        'lt', R3(lambda c, m, a=_a, b=_b: [index_of(c['publication'], a), index_of(c['publication'], b)]), 'append')
row('joins', 'rdy_enabled_at_owner', 'time_join', '/owner/source/enabled_at_utc',
    'the readiness source enabled_at_utc is the owner input instant the event occurred_at_utc copies (one value, joined at each copy)',
    'eq', gate('r3', 'rdy_source_valid')(lambda c, m: [SRC(c)['enabled_at_utc'], O(c)['occurred_at_utc']]), 'append', families=['testing.runtime_enabled_for_adapter'])


# family clauses (append) ------------------------------------------------------------------------------------
def _bef_field(c, k):
    b = BEF(c)
    return None if b is None else b.get(k)


def _complement(spans, duration):
    out, at = [], 0
    for a, b in sorted(spans):
        if a > at:
            out.append([at, a])
        at = max(at, b)
    if at < duration:
        out.append([at, duration])
    return out


CLAUSE_FACTS = {
    'cpi': {'request_subject': lambda c: [SRC(c)['subject_ref'], RQR(c)['subject_ref']],
            'request_candidates': lambda c: [canon(SRC(c)['candidate_capture_ids']), canon(RQR(c)['candidate_capture_ids'])],
            'disposition_preserved': lambda c: [SRC(c)['disposition'], O(c)['evaluated_disposition']]},
    'dvc': {'raw_admitted': lambda c: [SRC(c)['raw_capture_ids'], O(c)['admitted_raw_ids']],
            'span_subject_single': lambda c: [[s['subject_ref'] for s in SRC(c)['spans']]],
            'span_original': lambda c: [canon([s['original'] for s in SRC(c)['spans']]), canon([True] * len(SRC(c)['spans']))],
            'spans_cover_raw': lambda c: [canon(sorted(set([s['raw_capture_id'] for s in SRC(c)['spans']]))), canon(sorted(SRC(c)['raw_capture_ids']))],
            'manifest_uncaptured': lambda c: [SRC(c)['manifest']['uncaptured_state_introduced']],
            'manifest_overwrites': lambda c: [SRC(c)['manifest']['overwrites_raw']],
            'manifest_immutable': lambda c: [SRC(c)['manifest']['immutable']],
            'privacy_accepted': lambda c: [SRC(c)['manifest']['privacy_review']],
            'output_hash': lambda c: [SRC(c)['manifest']['output_sha256'], media_sha(c, SRC(c)['media_ref'])],
            'identity_distinct': lambda c: [SRC(c)['demonstration_video_id'], SRC(c)['raw_capture_ids']],
            'publish_after_final': lambda c: [index_of(SRC(c)['steps'], 'finalized'), index_of(SRC(c)['steps'], 'published')]},
    'dvf': {'command': lambda c: [SRC(c)['command_id']],
            'command_instance': lambda c: [SRC(c)['command_instance_id'], RQR(c)['command_instance_id']],
            'failure_outcome': lambda c: [SRC(c)['outcome']],
            'exit_nonzero': lambda c: [SRC(c)['encoder_exit_code']],
            'partial_quarantined': lambda c: [SRC(c)['partial_media']['disposition']],
            'partial_hidden': lambda c: [SRC(c)['partial_media']['exposed_as_demonstration']]},
    'bkm': {'command': lambda c: [SRC(c)['command_id']],
            'position': lambda c: [canon(SRC(c)['position_ns']), canon(RQR(c)['bookmark_monotonic_ns'])],
            'clock_domain': lambda c: [SRC(c)['clock_domain'], O(c)['session']['clock_domain']],
            'gap_labeled': lambda c: [SRC(c)['in_gap'], SRC(c)['gap_labeled']]},
    'clp': {'command': lambda c: [SRC(c)['command_id']],
            'request_raw': lambda c: [SRC(c)['raw_capture_id'], RQR(c)['raw_capture_id']],
            'request_span': lambda c: [canon(SRC(c)['span']), canon(RQR(c)['span'])],
            'privacy': lambda c: [SRC(c)['privacy_review']],
            'manifest_span': lambda c: [canon(SRC(c)['manifest']['span']), canon(SRC(c)['span'])],
            'output_distinct': lambda c: [SRC(c)['clip_id'], SRC(c)['raw_capture_id']],
            'no_overwrite': lambda c: [SRC(c)['manifest']['overwrites_raw']],
            'no_uncaptured': lambda c: [SRC(c)['manifest']['uncaptured_state_introduced']]},
    'eqc': {'flag': lambda c: [SRC(c)['effective_quality_changed']],
            'differs': lambda c: [canon(_bef_field(c, 'quality')), canon(SRC(c)['after_quality'])],
            'permit': lambda c: [SRC(c)['governor_permit_ref'], O(c)['governor']['permit_ref']],
            'reason': lambda c: [SRC(c)['adaptation_reason'], O(c)['governor']['reason']],
            'evidence_kept': lambda c: [SRC(c)['retained_evidence_degraded']]},
    'hdg': {'transition': lambda c: [str(SRC(c)['previous_state']) + '>' + str(SRC(c)['current_state'])],
            'interval_clock': lambda c: [canon(SRC(c)['receipt']['interval_clock']), canon(SRC(c)['observation']['interval_clock'])],
            'stream': lambda c: [canon(SRC(c)['receipt']['stream_id']), canon(SRC(c)['observation']['stream_id'])],
            'counters': lambda c: [canon(SRC(c)['receipt']['frame_counters']), canon(SRC(c)['observation']['frame_counters'])],
            'finding': lambda c: [canon(SRC(c)['receipt']['finding_ref']), canon(SRC(c)['observation']['finding_ref'])],
            'session': lambda c: [canon(SRC(c)['receipt']['session_id']), canon(SRC(c)['observation']['session_id'])]},
    'hrc': {'transition': lambda c: [str(SRC(c)['previous_state']) + '>' + str(SRC(c)['current_state'])],
            'fresh': lambda c: [SRC(c)['observation_fresh']],
            'prior_finding': lambda c: [SRC(c)['prior_finding_ref'], O(c)['prior_finding_ref']],
            'interval_kept': lambda c: [SRC(c)['erases_degraded']],
            'no_invented': lambda c: [canon(SRC(c)['invented_frames']), canon(0)]},
    'int': {'cause': lambda c: [SRC(c)['cause']],
            'gap_disposition': lambda c: [SRC(c)['gap_disposition']],
            'gap_unfilled': lambda c: [SRC(c)['gap_filled_by']]},
    'pau': {'command': lambda c: [SRC(c)['command_id']],
            'prior': lambda c: [SRC(c)['prior_state']],
            'successor': lambda c: [SRC(c)['successor_state']],
            'target_same': lambda c: [canon(SRC(c)['target_ref']), canon(_bef_field(c, 'target_ref'))],
            'stream_same': lambda c: [canon(SRC(c)['stream_lineage']), canon(_bef_field(c, 'stream_lineage'))],
            'trigger': lambda c: [SRC(c)['trigger']]},
    'prj': {'nonselected': lambda c: [SRC(c)['disposition']],
            'evidence': lambda c: [SRC(c)['disposition'], O(c)['evaluated_disposition']],
            'not_exposed': lambda c: [SRC(c)['exposed_as']]},
    'prv': {'selected': lambda c: [SRC(c)['disposition']],
            'identity': lambda c: [SRC(c)['identity_verified']],
            'continuity': lambda c: [SRC(c)['continuity_verified']],
            'original': lambda c: [SRC(c)['original_available']],
            'no_reenactment': lambda c: [SRC(c)['reenactment_substituted']],
            'in_candidates': lambda c: [SRC(c)['selected_capture_id'], RQR(c)['candidate_capture_ids']],
            'subject_hash': lambda c: [SRC(c)['subject_sha256'], O(c)['subject_sha256']],
            'content_hash': lambda c: [SRC(c)['content_sha256'], media_sha(c, SRC(c)['media_ref'])]},
    'red': {'stage': lambda c: [SRC(c)['stage']],
            'policy': lambda c: [SRC(c)['policy_ref'], O(c)['redaction_policy_ref']],
            'privacy': lambda c: [SRC(c)['privacy_review']],
            'spans_output': lambda c: [canon(SRC(c)['output']['masked_spans']), canon(SRC(c)['masked_spans'])],
            'unmasked_disclosed': lambda c: [canon(SRC(c)['output']['unmasked_disclosed']), canon(_complement(SRC(c)['masked_spans'], SRC(c)['duration']))],
            'raw_immutable': lambda c: [SRC(c)['raw_overwritten']],
            'derivative_distinct': lambda c: [SRC(c)['capture_artifact_id'], SRC(c)['raw_id']]},
    'res': {'command': lambda c: [SRC(c)['command_id']],
            'prior': lambda c: [SRC(c)['prior_state']],
            'successor': lambda c: [SRC(c)['successor_state']],
            'target': lambda c: [canon(SRC(c)['target_ref']), canon(_bef_field(c, 'target_ref'))],
            'clock': lambda c: [canon(SRC(c)['clock_lineage']), canon(_bef_field(c, 'clock_lineage'))],
            'gap': lambda c: [SRC(c)['discontinuity'], SRC(c)['gap_labeled']]},
    'sgc': {'detected': lambda c: [SRC(c)['corruption_detected']],
            'disposition': lambda c: [SRC(c)['disposition']],
            'stream': lambda c: [SRC(c)['stream_id'], O(c)['session']['stream_id']],
            'sequence': lambda c: [canon(SRC(c)['sequence']), canon(O(c)['journal']['sequence'])],
            'chain': lambda c: [SRC(c)['previous_sha256'], O(c)['journal']['previous_sha256']],
            'media_absent': lambda c: [SRC(c)['media_invented']]},
    'sgf': {'container': lambda c: [SRC(c)['container']],
            'keyframe': lambda c: [SRC(c)['starts_with_keyframe']],
            'immutable': lambda c: [SRC(c)['immutable']],
            'state': lambda c: [SRC(c)['finalization_state']],
            'not_recovered': lambda c: [SRC(c)['recovery_disposition']],
            'media_hash': lambda c: [SRC(c)['media_sha256'], media_sha(c, SRC(c)['media_ref'])],
            'byte_size': lambda c: [canon(SRC(c)['byte_size']), canon(len(bytes.fromhex(O(c)['media'][SRC(c)['media_ref']])))],
            'sequence': lambda c: [canon(SRC(c)['sequence']), canon(O(c)['journal']['sequence'])],
            'previous_hash': lambda c: [SRC(c)['previous_sha256'], O(c)['journal']['previous_sha256']],
            'target_generation': lambda c: [canon(SRC(c)['target_generation']), canon(O(c)['journal']['target_generation'])]},
    'sgr': {'disposition': lambda c: [SRC(c)['recovery_disposition']],
            'evidence': lambda c: [SRC(c)['finalization_evidence_ref']],
            'journal_interrupted': lambda c: [O(c)['journal']['state']],
            'chain': lambda c: [SRC(c)['previous_sha256'], O(c)['journal']['previous_sha256']],
            'bytes': lambda c: [SRC(c)['media_sha256'], media_sha(c, SRC(c)['media_ref'])],
            'no_fill': lambda c: [SRC(c)['gap_filled']]},
    'sta': {'command': lambda c: [SRC(c)['command_id']],
            'intent_first': lambda c: [index_of(SRC(c)['steps'], 'intent'), index_of(SRC(c)['steps'], 'recording')],
            'target_ordinary': lambda c: [SRC(c)['target_class']],
            'generation': lambda c: [canon(SRC(c)['target_generation']), canon(O(c)['target']['generation'])],
            'policy': lambda c: [SRC(c)['policy_ref'], O(c)['capture_policy_ref']],
            'permit': lambda c: [SRC(c)['permit_ref'], O(c)['resource_permit_ref']],
            'single_encoder': lambda c: [canon(SRC(c)['encoders']), canon(1)],
            'audio': lambda c: [SRC(c)['audio_on'], SRC(c)['audio_grant_current']]},
    'sto': {'command': lambda c: [SRC(c)['command_id']],
            'prior_nonterminal': lambda c: [SRC(c)['prior_state']],
            'finalize_first': lambda c: [index_of(SRC(c)['steps'], 'finalizing'), index_of(SRC(c)['steps'], 'terminal')],
            'segments': lambda c: [canon(sorted(SRC(c)['segments_accounted'])), canon(sorted(O(c)['segments']))],
            'complete_claim': lambda c: [SRC(c)['outcome'] == 'complete', SRC(c)['media_complete']],
            'no_test_pass': lambda c: [SRC(c)['implies_test_passed']],
            'no_motion': lambda c: [SRC(c)['implies_motion_verified']],
            'no_provenance': lambda c: [SRC(c)['implies_provenance_accepted']]},
    'tgc': {'kind': lambda c: [SRC(c)['switch_kind']],
            'focus': lambda c: [SRC(c)['focus_triggered']],
            'old_target': lambda c: [canon(SRC(c)['old_target']), canon(_bef_field(c, 'target_ref'))],
            'new_target': lambda c: [SRC(c)['new_target'], RQR(c)['target_ref']],
            'monotonic': lambda c: [SRC(c)['switch_ns'], SRC(c)['first_frame_ns']],
            'no_widen': lambda c: [SRC(c)['widened']]},
    'rdy': {'source_schema': lambda c: valid(uri('adapter_readiness_source'), SRC(c)),
            'configured': lambda c: [SRC(c)['configured_adapter_ref']['record_sha256'], sha(REC(c, SRC(c)['configured_adapter_ref']['record_ref']))],
            'probe_available': lambda c: [REC(c, SRC(c)['capability_probe_ref']['record_ref'])['available']],
            'permission_current': lambda c: [canon(REC(c, SRC(c)['permission_snapshot_ref']['record_ref'])['generation']), canon(O(c)['permission']['generation'])],
            'permission_project': lambda c: [REC(c, SRC(c)['permission_snapshot_ref']['record_ref'])['project_id'], O(c)['project_id']],
            'fixtures_complete': lambda c: [canon(sorted(REC(c, SRC(c)['required_fixture_set_ref']['record_ref'])['fixture_ids'])), canon(sorted(O(c)['required_fixture_ids']))],
            'receipt_probe': lambda c: [REC(c, SRC(c)['receipt_production_probe_ref']['record_ref'])['complete_merged_receipt']]},
}

for _fam, _clauses in CLAUSES.items():
    _abbr = FAMILIES[_fam][0]
    for _suffix, _code, _words, _template, _lit, _witness in _clauses:
        _fn = CLAUSE_FACTS[_abbr][_suffix]
        _gate = R3 if not (_abbr == 'rdy' and _suffix != 'source_schema') else gate('r3', 'rdy_source_valid')
        row('clause_' + _abbr, _abbr + '_' + _suffix, _code, '/owner/source', _words, _template,
            _gate(lambda c, m, f=_fn: f(c)), 'append', families=[_fam], lit=_lit)


@derived
def rdy_source_valid(c, m):
    return valid(uri('adapter_readiness_source'), SRC(c))


# retry (CV-317 phase-aware, SP-13xx "Phase-aware recovery") --------------------------------------------------------
def EX(c):
    return c['storage']['existing']


def ex_phase(c):
    return EX(c)['phase']


RT = gate('r0')
row('retry', 'retry_dedupe', 'dedupe_unavailable', '/storage/dedupe', 'authoritative dedupe is available (unavailable refuses)',
    'in', RT(lambda c, m: [c['storage']['dedupe']]), 'retry', lit=('available',))
row('retry', 'retry_request_schema', 'request_schema', '/retry/request', 'the retry request validates against the selected closed request edition',
    'ok', RT(lambda c, m: valid(uri(edition(c['family'], c['scope'], '_request')), c['retry']['request'])), 'retry')
row('retry', 'retry_request_same', 'retry_conflict', '/retry/request',
    'the retry request equals the complete immutable original request (Storage metadata excluded); a different request conflicts',
    'eq', RT(lambda c, m: NA if not valid(uri(edition(c['family'], c['scope'], '_request')), c['retry']['request'])
             else [canon(c['retry']['request']), canon(EX(c)['intent']['value'])]), 'retry')
row('retry', 'retry_preimage_same', 'retry_conflict', '/event',
    'after outcome binding the retry\'s EventRecord caller preimage equals the frozen one (CV-317 digest)',
    'eq', gate('r3')(lambda c, m: NA if ex_phase(c) not in BOUND else [producer_semantic_digest(E(c)), EX(c)['producer_semantics']['record_sha256']]), 'retry')
row('retry', 'retry_pending_result', 'retry_pending', '/retry/result/kind',
    'a same-request retry while pending returns pending recovery; it never repeats an uncertain action',
    'in', RT(lambda c, m: NA if ex_phase(c) != 'pending' else [c['retry']['result']['kind']]), 'retry', lit=('pending_recovery',))
row('retry', 'retry_bound_result', 'retry_result', '/retry/result/kind',
    'a retry after outcome binding appends only the frozen input', 'in',
    RT(lambda c, m: NA if ex_phase(c) != 'outcome_committed' else [c['retry']['result']['kind']]), 'retry', lit=('append_frozen',))
row('retry', 'retry_original_result', 'retry_result', '/retry/result/value',
    'a retry after append returns exactly the original first receipt and full value',
    'eq', RT(lambda c, m: NA if ex_phase(c) not in COMMITTED else [canon(c['retry']['result']), canon({'kind': 'original', 'value': EX(c)['first_append']})]), 'retry')
row('retry', 'retry_no_effects', 'retry_effects', '/retry/effects', 'a retry performs no capture, encode, bookmark, notification or event effect',
    'empty', RT(lambda c, m: [c['retry']['effects']]), 'retry')

# SP-1101 retained originals (committed retry and history) ---------------------------------------------------------


def _committed_retry(c):
    return c['path'] == 'history' or (c['path'] == 'retry' and ex_phase(c) in COMMITTED)


DQ = lambda fn: gate('r0')(lambda c, m: fn(c, m) if _committed_retry(c) else NA)  # noqa: E731
DISPATCH_REASONS = (
    ('recipe_override', 'caller_recipe_override', 'a caller-supplied recipe selector is refused by the shared dispatcher'),
    ('original_query', 'original_query', 'the original reference decodes to exactly one Store, scope, family and event id'),
    ('original_custody', 'original_unavailable', 'Storage holds a sealed receipt for this exact original (none: unavailable)'),
    ('original_other_receipt', 'original_other_receipt', 'a sealed receipt binds the bytes Storage holds (another original\'s receipt is refused)'),
    ('recipe_unique', 'recipe_ambiguous', 'exactly one sealed receipt binds the original (ambiguous: unsupported)'),
    ('recipe_installed', 'recipe_unknown', 'the sealed recipe is an installed frozen recipe'),
    ('original_admission', 'original_admission', 'the sealed receipt carries this family\'s at-write admission'),
    ('original_binding', 'original_binding', 'the original binding equals the requested one field by field'),
)
for _rid, _reason, _words in DISPATCH_REASONS:
    row('recipe', _rid, _reason, '/storage/custody', _words + ' (shared RetainedDispatcher)', 'reason',
        DQ(lambda c, m: m.get('disp')[0]), 'retry history', lit=_reason)
row('recipe', 'original_resolution', 'original_unavailable', '/storage/custody',
    'any other resolution refusal (for example an original Storage cannot hand out as canonical SP-236 bytes) is unavailable, never accepted',
    'in', DQ(lambda c, m: [m.get('disp')[0]]), 'retry history', lit=('ok', 'original_verification') + tuple(r for _, r, _ in DISPATCH_REASONS))
row('recipe', 'read_no_receipt_created', 'receipt_created_on_read', '/storage/custody/sealed_receipts',
    'the sealed store is byte-identical before and after the read (no receipt is created while reading)',
    'eq', DQ(lambda c, m: [m.get('disp')[1], m.get('disp')[2]]), 'retry history')
for _k in FROZEN[1:]:   # 'decodes' cannot fail: Storage hands out bytes of its own SP-236 encoding
    row('frozen', 'frozen_' + _k, 'original_verification', '/storage/custody/original',
        'the w3c@1 frozen verifier\'s ' + _k + ' component holds for Storage\'s original (no current writer or live-state gate)',
        'eq' if _k in FROZEN_EQ else 'ok',
        DQ(lambda c, m, k=_k: NA if m.get('disp')[0] not in ('ok', 'original_verification') or
           any([m.get('frozen').get(j) is not True for j in FROZEN[:FROZEN.index(k)]])
           else (m.get('frozen_pair')[k] if k in FROZEN_EQ else m.get('frozen').get(k) is True)), 'retry history')
HX = lambda fn: gate('r0')(lambda c, m: fn(c, m) if c['path'] == 'history' and m.get('disp')[0] == 'ok' else NA)  # noqa: E731
row('disclosure', 'disclosure_access', 'current_disclosure', '/reader/access/allowed', 'present access is allowed for this disclosure',
    'true', HX(lambda c, m: [c['reader']['access']['allowed']]), 'history')
row('disclosure', 'disclosure_not_deleted', 'current_disclosure', '/reader/access/deleted', 'the source is not deleted now',
    'false', HX(lambda c, m: [c['reader']['access']['deleted']]), 'history')
row('disclosure', 'disclosure_not_restricted', 'current_disclosure', '/reader/access/restricted', 'the source is not restricted now',
    'false', HX(lambda c, m: [c['reader']['access']['restricted']]), 'history')
row('disclosure', 'reader_not_withdrawn', 'reader_withdrawn', '/reader/withdrawn', 'this family\'s reader generation is not withdrawn (a successor rebuild is required)',
    'false', HX(lambda c, m: [c['reader']['withdrawn']]), 'history')
row('disclosure', 'history_no_effects', 'reader_effects', '/reader/effects', 'a retained read runs no tool, encoder, command, network, notification, charge or event',
    'empty', HX(lambda c, m: [c['reader']['effects']]), 'history')


# canonical operation row (operation path) ---------------------------------------------------------------------
def OPS(c):
    return c['operation']['successor']


def OPP(c):
    return c['operation']['predecessor']


OPREF = lambda c: uri(edition(c['family'], c['scope'], '_operation'), restored=True)  # noqa: E731


@derived
def op_valid(c, m):
    return valid(OPREF(c), OPS(c))


@derived
def op_numbers(c, m):
    return slots_exact(OPREF(c), OPS(c))


def resolved(c, part):
    """An inline or SP-337-resolved part body, or None when it does not resolve (its pack rows refuse)."""
    if part is None:
        return None
    if part['mode'] == 'inline':
        return part['value']
    pack = pack_of(c, part.get('payload_ref'))
    return pack_body(pack) if pack is not None and pack_ready(c, part['payload_ref']) else None


@derived
def o1(c, m):
    """Operation ready: r0, restored-row schema verdict, exact integers, uuid, packs resolve."""
    if not (m.get('r0') and m.get('op_valid') and m.get('op_numbers') and UUID.fullmatch(OPS(c)['storage_instance_id'])):
        return False
    s = OPS(c)
    if s['first_append'] is not None and not all([u64_ok(s['first_append']['first_append_receipt'][k]) for k in RECEIPT_UINT64]):
        return False
    if s['intent']['mode'] == 'external' and resolved(c, s['intent']) is None:
        return False
    if s['original_event'] is not None and s['original_event']['mode'] == 'external' and resolved(c, s['original_event']) is None:
        return False
    return True


O1 = gate('o1')
OPATH = 'operation'
row('operation', 'op_schema', 'operation_schema', '/operation/successor',
    'the operation edition verdict (all keywords but the phase oneOf, restored below) accepts the row',
    'ok', gate('r0')(lambda c, m: m.get('op_valid')), OPATH)
row('operation', 'op_numbers', 'current_integer', '/operation/successor', 'every operation integer slot is an exact current integer (CV-1100)',
    'ok', gate('r0', 'op_valid')(lambda c, m: m.get('op_numbers')), OPATH)
row('operation', 'op_uuid', 'uuid_format', '/operation/successor/storage_instance_id', 'storage_instance_id is a full-match lowercase UUID (format uuid restored)',
    'ok', gate('r0', 'op_valid', 'op_numbers')(lambda c, m: UUID.fullmatch(OPS(c)['storage_instance_id']) is not None), OPATH)
pack_rows('operation', 'intent', lambda c: OPS(c)['intent'].get('payload_ref') if OPS(c)['intent']['mode'] == 'external' else None, None, OPATH,
          gate('r0', 'op_valid', 'op_numbers'))
pack_rows('operation', 'original_event', lambda c: (OPS(c)['original_event'] or {}).get('payload_ref') if (OPS(c)['original_event'] or {}).get('mode') == 'external' else None,
          None, OPATH, gate('r0', 'op_valid', 'op_numbers'))
for _k in RECEIPT_UINT64:
    row('operation', 'op_receipt_u64_' + _k, 'storage_uint64', '/operation/successor/first_append/first_append_receipt/' + _k,
        'the stored first receipt ' + _k + ' is a Storage uint64 (SP-1100)',
        'ok', gate('r0', 'op_valid', 'op_numbers')(lambda c, m, k=_k: NA if OPS(c)['first_append'] is None
                                                   else u64_ok(OPS(c)['first_append']['first_append_receipt'][k])), OPATH)
row('operation', 'op_intent_external_schema', 'request_schema', '/operation/successor/intent', 'an external intent resolves the selected closed request edition',
    'ok', O1(lambda c, m: NA if OPS(c)['intent']['mode'] != 'external' else valid(uri(edition(c['family'], c['scope'], '_request')), resolved(c, OPS(c)['intent']))), OPATH)
row('operation', 'op_event_external_schema', 'original_event_schema', '/operation/successor/original_event',
    'an external original_event resolves to a valid EventRecord', 'ok',
    O1(lambda c, m: NA if (OPS(c)['original_event'] or {}).get('mode') != 'external' else valid(EVENT_URI, resolved(c, OPS(c)['original_event']))), OPATH)
row('operation', 'op_inline_size', 'inline_size', '/operation/successor', 'the complete operation row is at most 16384 encoded bytes (SP-337 externalizes larger parts)',
    'le', O1(lambda c, m: [len(storage_value_bytes(OPS(c), profile=EVENT_VALUE)), INLINE_LIMIT]), OPATH)

# phase custody (the restored phase oneOf, one predicate per field and phase)
PH = lambda fn: O1(lambda c, m: fn(c, OPS(c)['phase'], OPS(c)))  # noqa: E731
for _f in ('outcome_record', 'producer_semantics', 'first_append', 'original_event'):
    row('phase', 'op_pending_' + _f + '_null', 'phase_custody', '/operation/successor/' + _f, 'a pending row has null ' + _f + ' (encodable before any effect)',
        'null', PH(lambda c, p, s, f=_f: NA if p != 'pending' else [s[f]]), OPATH)
for _f in ('outcome_record', 'producer_semantics'):
    row('phase', 'op_bound_' + _f, 'phase_custody', '/operation/successor/' + _f, 'outcome_committed, event_committed and terminal rows carry ' + _f,
        'nonnull', PH(lambda c, p, s, f=_f: NA if p not in BOUND else [s[f]]), OPATH)
for _f in ('first_append', 'original_event'):
    row('phase', 'op_outcome_no_' + _f, 'phase_custody', '/operation/successor/' + _f, 'an outcome_committed row has no ' + _f + ' yet',
        'null', PH(lambda c, p, s, f=_f: NA if p != 'outcome_committed' else [s[f]]), OPATH)
    row('phase', 'op_committed_' + _f, 'phase_custody', '/operation/successor/' + _f, 'event_committed and terminal rows carry ' + _f,
        'nonnull', PH(lambda c, p, s, f=_f: NA if p not in COMMITTED else [s[f]]), OPATH)
row('phase', 'op_withdrawn_outcome_pair', 'phase_custody', '/operation/successor', 'a withdrawn row keeps outcome_record and producer_semantics bound together',
    'eq', PH(lambda c, p, s: NA if p != 'withdrawn' else [s['outcome_record'] is None, s['producer_semantics'] is None]), OPATH)
row('phase', 'op_withdrawn_event_pair', 'phase_custody', '/operation/successor', 'a withdrawn row keeps first_append and original_event bound together',
    'eq', PH(lambda c, p, s: NA if p != 'withdrawn' else [s['first_append'] is None, s['original_event'] is None]), OPATH)
row('phase', 'op_withdrawn_event_after_outcome', 'phase_custody', '/operation/successor', 'a withdrawn row with an event also has its outcome binding',
    'implies', PH(lambda c, p, s: NA if p != 'withdrawn' else [s['original_event'] is not None, s['outcome_record'] is not None]), OPATH)

# joins, key and CAS
row('operation', 'op_storage_join', 'storage_join', '/operation/successor/storage_instance_id', 'the row is in the owner Storage instance',
    'eq', O1(lambda c, m: [OPS(c)['storage_instance_id'], O(c)['storage_instance_id']]), OPATH)
row('operation', 'op_operation_join', 'operation_join', '/operation/successor/owner_operation_id', 'the row names the owner operation',
    'eq', O1(lambda c, m: [OPS(c)['owner_operation_id'], O(c)['owner_operation_id']]), OPATH)
row('operation', 'op_scope_join', 'scope_join', '/operation/successor/scope', 'the row scope is the owner WorkflowScopeV2 (reversible project~ partition or app)',
    'eq', O1(lambda c, m: [canon(OPS(c)['scope']), canon(owner_scope(O(c), c['scope']))]), OPATH)
row('operation', 'op_key_recipe', 'operation_key', '/operation/key', 'the physical key is the recomputed SP-13xx operation key',
    'eq', O1(lambda c, m: [c['operation']['key'], operation_key(c['family'], c['scope'], O(c)['storage_instance_id'], O(c)['project_id'], O(c)['owner_operation_id'])]), OPATH)
row('operation', 'op_transition', 'phase_transition', '/operation/successor/phase', 'the phase transition is a lawful CAS step (pending first; withdrawal only from a nonterminal phase)',
    'in', O1(lambda c, m: [('' if OPP(c) is None else str(OPP(c)['phase'])) + '>' + OPS(c)['phase']]), OPATH, lit=TRANSITIONS)
row('operation', 'op_cas', 'cas_predecessor', '/operation/cas_expected', 'the CAS names the complete stored predecessor row (null only for the first write)',
    'eq', O1(lambda c, m: [canon(c['operation']['cas_expected']), canon(None if OPP(c) is None else sha(OPP(c)))]), OPATH)
for _f in ('intent', 'outcome_record', 'producer_semantics', 'first_append', 'original_event'):
    row('immutability', 'op_' + _f + '_immutable', 'binding_changed', '/operation/successor/' + _f,
        'a bound ' + _f + ' never changes after its boundary (withdrawal preserves it)',
        'eq', O1(lambda c, m, f=_f: NA if OPP(c) is None or OPP(c)[f] is None else [canon(OPS(c)[f]), canon(OPP(c)[f])]), OPATH)

# the original request (intent)
IQ = lambda fn: O1(lambda c, m: NA if not valid(uri(edition(c['family'], c['scope'], '_request')), resolved(c, OPS(c)['intent'])) else fn(c, resolved(c, OPS(c)['intent'])))  # noqa: E731
row('request', 'op_intent_request', 'request_custody', '/operation/successor/intent',
    'the first write binds the intent to the immutable original owner request (later rows keep it: op_intent_immutable)',
    'eq', IQ(lambda c, q: NA if OPP(c) is not None else [canon(q), canon(REQ(c))]), OPATH)
row('request', 'request_record_hash', 'source_hash', '/owner/request/request_record/record_sha256', 'request_record.record_sha256 is SHA-256 of the stored original request bytes',
    'eq', O1(lambda c, m: [REQ(c)['request_record']['record_sha256'], sha(RQR(c))]), OPATH)
row('request', 'request_operation_join', 'operation_join', '/owner/request/owner_operation_id', 'the request names the owner operation',
    'eq', O1(lambda c, m: [REQ(c)['owner_operation_id'], O(c)['owner_operation_id']]), OPATH)
row('request', 'request_scope_join', 'scope_join', '/owner/request/scope', 'the request scope is the owner scope',
    'eq', O1(lambda c, m: [canon(REQ(c)['scope']), canon(owner_scope(O(c), c['scope']))]), OPATH)
row('request', 'request_before_join', 'before_record', '/owner/request/before_record', 'the request pre-state is the owner predecessor snapshot (with its stored hash)',
    'eq', O1(lambda c, m: [canon(REQ(c)['before_record']), canon(None if O(c)['predecessor_ref'] is None else
                                                                    {'record_ref': O(c)['predecessor_ref'], 'record_sha256': sha(BEF(c))})]), OPATH)
row('request', 'request_permission_join', 'permission_join', '/owner/request/permission_snapshot_ref', 'the request permission is the captured operation permission',
    'eq', O1(lambda c, m: [REQ(c)['permission_snapshot_ref'], O(c)['permission']['snapshot_ref']]), OPATH)


# binding the genuine outcome (pending -> outcome_committed), the uncertain-action fence, and commit custody
def _binding(c):
    s = OPS(c)
    return (s['phase'] in BOUND and (OPP(c) is None or OPP(c)['outcome_record'] is None)
            and s['outcome_record'] is not None and s['producer_semantics'] is not None)


def _committing(c):
    s = OPS(c)
    return (s['phase'] in COMMITTED and (OPP(c) is None or OPP(c)['first_append'] is None)
            and s['first_append'] is not None and s['original_event'] is not None and s['producer_semantics'] is not None
            and valid(EVENT_URI, resolved(c, s['original_event'])))


BD = lambda fn: O1(lambda c, m: fn(c) if _binding(c) else NA)  # noqa: E731
row('binding', 'op_outcome_owner', 'outcome_binding', '/operation/successor/outcome_record/record_ref', 'the bound outcome is the genuine committed owner result',
    'eq', BD(lambda c: [OPS(c)['outcome_record']['record_ref'], O(c)['source_ref']]), OPATH)
row('binding', 'op_outcome_hash', 'outcome_binding', '/operation/successor/outcome_record/record_sha256', 'the bound outcome hash is SHA-256 of the stored result bytes',
    'eq', BD(lambda c: NA if OPS(c)['outcome_record']['record_ref'] != O(c)['source_ref'] else [OPS(c)['outcome_record']['record_sha256'], sha(SRC(c))]), OPATH)
row('binding', 'op_preimage_owner', 'producer_preimage', '/operation/successor/producer_semantics/record_sha256',
    'the frozen preimage is the EventRecord caller input formed from the actual outcome and original request (CV-317 digest)',
    'eq', BD(lambda c: [OPS(c)['producer_semantics']['record_sha256'], producer_semantic_digest(c['event'])]), OPATH)
row('binding', 'op_formed_event_outcome', 'outcome_binding', '/event/payload/source_record', 'the formed EventRecord carries the bound outcome as its source_record',
    'eq', BD(lambda c: [canon(c['event']['payload']['source_record']), canon(genuine_outcome(c))]), OPATH)
AC = lambda fn: O1(lambda c, m: fn(c, c['operation']['action']) if _binding(c) and c['operation'].get('action') is not None else NA)  # noqa: E731
row('fence', 'fence_action_identity', 'uncertain_action', '/operation/action/action_id', 'recovery binds only the original action identity',
    'eq', AC(lambda c, a: [a['action_id'], O(c)['action_id']]), OPATH)
row('fence', 'fence_single_execution', 'uncertain_action_repeated', '/operation/action/executions', 'an uncertain action is never repeated',
    'le', AC(lambda c, a: [a['executions'], 1]), OPATH)
row('fence', 'fence_evidence', 'uncertain_action', '/operation/action/evidence_ref', 'binding reads genuine original action evidence (missing evidence stays fenced)',
    'member', AC(lambda c, a: [a['evidence_ref'], sorted(O(c)['records'])]), OPATH)
CM = lambda fn: O1(lambda c, m: fn(c) if _committing(c) else NA)  # noqa: E731
row('commit', 'op_event_frozen', 'producer_preimage', '/operation/successor/original_event', 'the appended original_event is the frozen preimage input',
    'eq', CM(lambda c: [producer_semantic_digest(resolved(c, OPS(c)['original_event'])),
                        (OPS(c) if OPP(c) is None or OPP(c)['producer_semantics'] is None else OPP(c))['producer_semantics']['record_sha256']]), OPATH)
row('commit', 'op_event_issued', 'original_event', '/operation/successor/original_event', 'the original_event is the record Storage holds',
    'eq', CM(lambda c: [canon(resolved(c, OPS(c)['original_event'])), canon(c['storage']['issued']['event'])]), OPATH)
row('commit', 'op_first_append_issued', 'first_append', '/operation/successor/first_append', 'first_append is Storage\'s issued full-value result',
    'eq', CM(lambda c: [canon(OPS(c)['first_append']), canon(c['storage']['issued']['result'])]), OPATH)
row('commit', 'op_commitment', 'full_value_commitment', '/operation/successor/first_append/original_event_value_commitment/sha256',
    'resolve_full_value.v1: the strict v2 commitment recomputes over the original_event before the dependent transition',
    'eq', CM(lambda c: [OPS(c)['first_append']['original_event_value_commitment']['sha256'], full_value_commitment(resolved(c, OPS(c)['original_event']))]), OPATH)
row('commit', 'op_custody_before_terminal', 'publication_order', '/operation/steps', 'original full-value custody resolves before terminal publication',
    'lt', O1(lambda c, m: NA if OPS(c)['phase'] != 'terminal' else [index_of(c['operation']['steps'], 'custody_resolved'), index_of(c['operation']['steps'], 'terminal')]), OPATH)
RS = lambda fn: O1(lambda c, m: fn(c, c['operation']['restore']) if c['operation'].get('restore') is not None else NA)  # noqa: E731
row('restore', 'restore_instance', 'restore_custody', '/operation/restore/storage_instance_id', 'restore keeps the same Storage instance (BRS-031)',
    'eq', RS(lambda c, r: [r['storage_instance_id'], O(c)['storage_instance_id']]), OPATH)
row('restore', 'restore_packs', 'restore_custody', '/operation/restore/packs', 'every referenced SP-337 pack restores at the same boundary',
    'subset', RS(lambda c, r: [sorted([p['payload_ref'] for p in (OPS(c)['intent'], OPS(c)['original_event']) if p is not None and p['mode'] == 'external']), r['packs']]), OPATH)
row('restore', 'restore_receipt', 'restore_custody', '/operation/restore/receipt_custody', 'original receipt custody restores at the same boundary (missing proof fences mutation)',
    'true', RS(lambda c, r: [r['receipt_custody']]), OPATH)


# derived checkpoint (checkpoint path) ------------------------------------------------------------------------
CKREF = lambda c: uri(edition(c['family'], c['scope'], '_checkpoint'), restored=True)  # noqa: E731
TOKEN = lambda c: CK(c)['index_read_token']  # noqa: E731
SELECTION = lambda c: CK(c)['index_read_token']['source_selection']  # noqa: E731


@derived
def ck_valid(c, m):
    return valid(CKREF(c), CK(c))


@derived
def ck_numbers(c, m):
    return slots_exact(CKREF(c), CK(c))


def _full_matches(c):
    t, s = TOKEN(c), SELECTION(c)
    return (UUID.fullmatch(CK(c)['storage_instance_id']) and UUID.fullmatch(t['storage_instance_id']) and UUID.fullmatch(s['storage_instance_id'])
            and GENERATION.fullmatch(t['generation_id']) and HEX64.fullmatch(t['generation_anchor_sha256']) and HEX64.fullmatch(t['frontier_sha256'])
            and all([HEX64.fullmatch(s[k]) for k in SELECTION_HASHES]))


@derived
def k1(c, m):
    """Checkpoint ready: r0, restored-row schema verdict, exact integers, every full-match site, projection resolves."""
    if not (m.get('r0') and m.get('ck_valid') and m.get('ck_numbers') and _full_matches(c)):
        return False
    if CK(c)['last_sequence_id'] is not None and not u64_ok(CK(c)['last_sequence_id']):
        return False
    proj = CK(c)['projection']
    return proj['mode'] != 'external' or resolved(c, proj) is not None


K1 = gate('k1')


def token_storage_joined(c):
    sid = O(c)['storage_instance_id']
    return TOKEN(c)['storage_instance_id'] == sid and SELECTION(c)['storage_instance_id'] == sid
KPATH = 'checkpoint'
KS = gate('r0', 'ck_valid', 'ck_numbers')
row('checkpoint', 'ck_schema', 'checkpoint_schema', '/checkpoint/row', 'the checkpoint edition verdict (all keywords but the cursor if/then pairs, restored below) accepts the row',
    'ok', gate('r0')(lambda c, m: m.get('ck_valid')), KPATH)
row('checkpoint', 'ck_numbers', 'current_integer', '/checkpoint/row', 'every checkpoint integer slot is an exact current integer (CV-1100)',
    'ok', gate('r0', 'ck_valid')(lambda c, m: m.get('ck_numbers')), KPATH)
for _rid, _get, _pattern in (
        ('ck_uuid_storage_instance', lambda c: CK(c)['storage_instance_id'], UUID),
        ('ck_uuid_token_storage', lambda c: TOKEN(c)['storage_instance_id'], UUID),
        ('ck_uuid_selection_storage', lambda c: SELECTION(c)['storage_instance_id'], UUID),
        ('ck_full_generation_id', lambda c: TOKEN(c)['generation_id'], GENERATION),
        ('ck_full_generation_anchor', lambda c: TOKEN(c)['generation_anchor_sha256'], HEX64),
        ('ck_full_frontier', lambda c: TOKEN(c)['frontier_sha256'], HEX64)):
    row('fullmatch', _rid, 'full_match', '/checkpoint/row/index_read_token', 'the field matches its pattern/format in full (Python $ admits a trailing LF; format uuid restored)',
        'ok', KS(lambda c, m, g=_get, p=_pattern: p.fullmatch(g(c)) is not None), KPATH)
for _k in SELECTION_HASHES:
    row('fullmatch', 'ck_full_' + _k, 'full_match', '/checkpoint/row/index_read_token/source_selection/' + _k, _k + ' matches 64 lowercase hex in full',
        'ok', KS(lambda c, m, k=_k: HEX64.fullmatch(SELECTION(c)[k]) is not None), KPATH)
pack_rows('checkpoint', 'projection', lambda c: CK(c)['projection'].get('payload_ref') if CK(c)['projection']['mode'] == 'external' else None, None, KPATH,
          lambda fn: KS(lambda c, m: fn(c, m) if _full_matches(c) else NA))
row('checkpoint', 'ck_projection_schema', 'projection_schema', '/checkpoint/row/projection', 'an external projection resolves the selected completed payload edition, never the empty branch',
    'ok', K1(lambda c, m: NA if CK(c)['projection']['mode'] != 'external' else valid(uri(edition(c['family'], c['scope'])), resolved(c, CK(c)['projection']))), KPATH)
row('checkpoint', 'ck_inline_size', 'inline_size', '/checkpoint/row', 'the checkpoint value is at most 16384 encoded bytes (SP-337 externalizes the projection)',
    'le', K1(lambda c, m: [len(storage_value_bytes(CK(c), profile=EVENT_VALUE)), INLINE_LIMIT]), KPATH)
# cursors (the restored if/then pairs)
MODE = lambda c: CK(c)['projection']['mode']  # noqa: E731
for _f in ('last_event_id', 'last_sequence_id'):
    row('cursor', 'ck_cursor_empty_' + _f, 'cursor_shape', '/checkpoint/row/' + _f, 'projection mode empty pairs with a null ' + _f,
        'null', K1(lambda c, m, f=_f: NA if MODE(c) != 'empty' else [CK(c)[f]]), KPATH)
    row('cursor', 'ck_cursor_body_' + _f, 'cursor_shape', '/checkpoint/row/' + _f, 'an inline or external projection pairs with a nonnull ' + _f,
        'nonnull', K1(lambda c, m, f=_f: NA if MODE(c) == 'empty' else [CK(c)[f]]), KPATH)
# joins and key
row('ckjoin', 'ck_storage_join', 'storage_join', '/checkpoint/row/storage_instance_id', 'the checkpoint is in the owner Storage instance',
    'eq', K1(lambda c, m: [CK(c)['storage_instance_id'], O(c)['storage_instance_id']]), KPATH)
row('ckjoin', 'ck_token_storage_join', 'storage_join', '/checkpoint/row/index_read_token/storage_instance_id', 'the token is from the same Storage instance',
    'eq', K1(lambda c, m: [TOKEN(c)['storage_instance_id'], O(c)['storage_instance_id']]), KPATH)
row('ckjoin', 'ck_selection_storage_join', 'storage_join', '/checkpoint/row/index_read_token/source_selection/storage_instance_id', 'the CURRENT selection is from the same Storage instance',
    'eq', K1(lambda c, m: [SELECTION(c)['storage_instance_id'], O(c)['storage_instance_id']]), KPATH)
row('ckjoin', 'ck_scope_join', 'scope_join', '/checkpoint/row/scope', 'the checkpoint scope is the owner scope',
    'eq', K1(lambda c, m: [canon(CK(c)['scope']), canon(owner_scope(O(c), c['scope']))]), KPATH)
row('ckjoin', 'ck_subject_query', 'checkpoint_subject', '/checkpoint/row/subject_id', 'the subject comes from the explicit original reader query',
    'eq', K1(lambda c, m: [CK(c)['subject_id'], c['checkpoint']['query_subject']]), KPATH)
row('ckjoin', 'ck_key_recipe', 'checkpoint_key', '/checkpoint/key', 'the physical key is the recomputed SP-13xx checkpoint key',
    'eq', K1(lambda c, m: [c['checkpoint']['key'], checkpoint_key(c['family'], c['scope'], O(c)['storage_instance_id'], O(c)['project_id'],
                                                                  CK(c)['subject_id'], CK(c)['generation_id'])]), KPATH)
row('ckjoin', 'ck_token_authentic', 'token_unauthenticated', '/checkpoint/row/index_read_token', 'the nine-field token is Storage\'s authenticated CURRENT token (SP-278, DL-076)',
    'eq', K1(lambda c, m: NA if not token_storage_joined(c) else [canon(TOKEN(c)), canon(c['checkpoint']['storage_token'])]), KPATH)
# coverage (empty and nonempty)
COV = lambda c: c['checkpoint']['coverage']  # noqa: E731
row('coverage', 'cov_complete', 'coverage_incomplete', '/checkpoint/coverage/complete', 'retained-source coverage is complete through the boundary (lag is unavailable)',
    'true', K1(lambda c, m: [COV(c)['complete']]), KPATH)
row('coverage', 'cov_token', 'coverage_boundary', '/checkpoint/coverage/token', 'coverage was verified at the exact same-Storage token boundary',
    'eq', K1(lambda c, m: NA if not token_storage_joined(c) else [canon(COV(c)['token']), canon(TOKEN(c))]), KPATH)
row('coverage', 'cov_family', 'coverage_filter', '/checkpoint/coverage/event_type', 'coverage filters this exact family',
    'eq', K1(lambda c, m: [COV(c)['event_type'], c['family']]), KPATH)
row('coverage', 'cov_version', 'coverage_filter', '/checkpoint/coverage/version', 'coverage filters this exact family version', 'in',
    K1(lambda c, m: [COV(c)['version']]), KPATH, lit=('1.0.0',))
row('coverage', 'cov_scope', 'coverage_filter', '/checkpoint/coverage/scope_partition', 'coverage filters this exact scope partition',
    'eq', K1(lambda c, m: [COV(c)['scope_partition'], partition(c['scope'], O(c)['project_id'])]), KPATH)
row('coverage', 'cov_subject', 'coverage_filter', '/checkpoint/coverage/subject_id', 'coverage filters this exact subject',
    'eq', K1(lambda c, m: NA if CK(c)['subject_id'] != c['checkpoint']['query_subject'] else [COV(c)['subject_id'], CK(c)['subject_id']]), KPATH)
row('coverage', 'cov_no_gaps', 'coverage_gap', '/checkpoint/coverage/gaps', 'no missing page, damaged range or unresolved pack/custody becomes absence',
    'empty', K1(lambda c, m: [COV(c)['gaps']]), KPATH)
row('coverage', 'cov_nonmatching_counted', 'coverage_incomplete', '/checkpoint/coverage/scanned', 'nonmatching events count toward completeness: every indexed event was scanned',
    'eq', K1(lambda c, m: [canon(COV(c)['scanned']), canon(COV(c)['index_count'])]), KPATH)
row('coverage', 'ck_empty_no_match', 'empty_projection', '/checkpoint/row/projection', 'an empty projection is published only when coverage matched nothing',
    'empty', K1(lambda c, m: NA if MODE(c) != 'empty' else [COV(c)['matching']]), KPATH)
row('coverage', 'ck_body_has_match', 'nonempty_projection', '/checkpoint/row/projection', 'a projection body is published only for an actual matching event',
    'nonempty', K1(lambda c, m: NA if MODE(c) == 'empty' else [COV(c)['matching']]), KPATH)
LAST = lambda c: COV(c)['matching'][-1]  # noqa: E731
LE = lambda fn: K1(lambda c, m: NA if MODE(c) == 'empty' or not COV(c)['matching'] or CK(c)['last_event_id'] is None
                   or CK(c)['last_sequence_id'] is None else fn(c))  # noqa: E731
row('lastevent', 'ck_last_sequence_u64', 'storage_uint64', '/checkpoint/row/last_sequence_id', 'a nonnull last_sequence_id is a Storage uint64 (SP-1100)',
    'ok', KS(lambda c, m: NA if CK(c)['last_sequence_id'] is None or not _full_matches(c) else u64_ok(CK(c)['last_sequence_id'])), KPATH)
row('lastevent', 'ck_last_event_join', 'last_event', '/checkpoint/row/last_event_id', 'last_event_id is the last matching authenticated original',
    'eq', LE(lambda c: [canon(CK(c)['last_event_id']), canon(LAST(c)['event_id'])]), KPATH)
row('lastevent', 'ck_last_sequence_join', 'last_event', '/checkpoint/row/last_sequence_id', 'last_sequence_id is that original\'s Storage sequence',
    'eq', LE(lambda c: NA if not u64_ok(CK(c)['last_sequence_id']) else [canon(CK(c)['last_sequence_id']), canon(LAST(c)['sequence_id'])]), KPATH)
row('lastevent', 'ck_projection_body', 'last_event', '/checkpoint/row/projection', 'the projection is that original\'s actual completed payload',
    'eq', LE(lambda c: NA if not valid(uri(edition(c['family'], c['scope'])), resolved(c, CK(c)['projection']))
             else [canon(resolved(c, CK(c)['projection'])), canon(LAST(c)['payload'])]), KPATH)
# CAS, atomic publication, generations, rebuild, withdrawal
row('advance', 'ck_predecessor_cas', 'cas_predecessor', '/checkpoint/row/predecessor_sha256', 'predecessor_sha256 is the stored predecessor row (null only for the first)',
    'eq', K1(lambda c, m: [canon(CK(c)['predecessor_sha256']), canon(None if c['checkpoint']['predecessor'] is None else sha(c['checkpoint']['predecessor']))]), KPATH)
row('advance', 'ck_publish_atomic', 'publication_atomic', '/checkpoint/transactions', 'projection and cursors publish in one derived transaction',
    'eq', K1(lambda c, m: [canon(c['checkpoint']['transactions']), canon(1)]), KPATH)
row('advance', 'ck_coverage_before_publish', 'publication_order', '/checkpoint/steps', 'complete source proof precedes publication',
    'lt', K1(lambda c, m: [index_of(c['checkpoint']['steps'], 'verify_coverage'), index_of(c['checkpoint']['steps'], 'publish')]), KPATH)
GENS = lambda c: c['checkpoint']['generations'] + [{'generation_id': CK(c)['generation_id'], 'state': CK(c)['generation_state']}]  # noqa: E731
row('generations', 'ck_slots', 'generation_slots', '/checkpoint/generations', 'RP-PROJECTION-3GEN: at most three generations (one current plus two staged/retired)',
    'le', K1(lambda c, m: [len(GENS(c)), 3]), KPATH)
row('generations', 'ck_single_current', 'generation_slots', '/checkpoint/generations', 'at most one current generation',
    'le', K1(lambda c, m: [len([g for g in GENS(c) if g['state'] == 'current']), 1]), KPATH)
row('generations', 'ck_retired_anchor', 'retirement_anchor', '/checkpoint/row/first_retired_at_utc', 'a retired generation carries its first retirement anchor',
    'implies', K1(lambda c, m: [CK(c)['generation_state'] == 'retired', CK(c)['first_retired_at_utc'] is not None]), KPATH)
row('generations', 'ck_live_anchor_null', 'retirement_anchor', '/checkpoint/row/first_retired_at_utc', 'a staged or current generation has no retirement anchor',
    'implies', K1(lambda c, m: [CK(c)['generation_state'] != 'retired', CK(c)['first_retired_at_utc'] is None]), KPATH)
row('generations', 'ck_anchor_fixed', 'retirement_anchor', '/checkpoint/row/first_retired_at_utc', 'the first retirement anchor is fixed (a retry never resets it)',
    'eq', K1(lambda c, m: NA if c['checkpoint']['predecessor'] is None or c['checkpoint']['predecessor']['first_retired_at_utc'] is None
             else [canon(CK(c)['first_retired_at_utc']), canon(c['checkpoint']['predecessor']['first_retired_at_utc'])]), KPATH)
row('generations', 'ck_rebuild_no_effects', 'rebuild_effects', '/checkpoint/effects', 'read, advance, replay and rebuild record no media, run no command and send nothing',
    'empty', K1(lambda c, m: [c['checkpoint']['effects']]), KPATH)
row('generations', 'ck_reader_live', 'reader_withdrawn', '/checkpoint/reader_withdrawn', 'this family\'s reader generation is not withdrawn',
    'false', K1(lambda c, m: [c['checkpoint']['reader_withdrawn']]), KPATH)


# ---------------------------------------------------------------------------------------------
# Tables (at most eight rows each, in group order) and evaluation
# ---------------------------------------------------------------------------------------------
def build_tables():
    tables, table_rows = [], {}
    for group in GROUP_ORDER:
        rows = [r for r in ROWS if r['group'] == group]
        if group.startswith('entailed_'):
            name = group
            tables.append(name)
            table_rows[name] = rows
            continue
        for start in range(0, len(rows), 8):
            name = group + '_' + str(start // 8 + 1)
            tables.append(name)
            table_rows[name] = rows[start:start + 8]
    return tables, table_rows


TABLES, TABLE_ROWS = build_tables()
ROW_BY_ID = {r['id']: r for r in ROWS}


# ---------------------------------------------------------------------------------------------
# Table sources: the generated modules must be byte-identical to these (the checker refuses to run otherwise),
# so each module's check() requires exactly its rows, in FIELDS order, with exactly these predicates.
# ---------------------------------------------------------------------------------------------
def lit(text):
    return json.dumps(text, ensure_ascii=True)


def literal(value):
    """A Python literal tuple for an 'in'/'notin' row (strings and integers only) or a 'reason' string."""
    if type(value) is str:
        return lit(value)
    items = []
    for v in value:
        if type(v) is str:
            items.append(lit(v))
        elif type(v) is int:
            items.append(str(v))
        else:
            raise ValueError('unsupported literal ' + repr(v))
    return '(' + ', '.join(items) + (',)' if len(items) == 1 else ')')


def predicate_lines(r):
    condition, _ = TEMPLATES[r['template']]
    if 'LIT' in condition:
        condition = condition.replace('LIT', literal(r['lit']))
    lines = ['def ' + r['id'] + '(value, context):', '    v = value[' + lit(r['id']) + ']']
    if r['template'] not in ('ok', 'reason'):
        lines.append('    if v is True:')
        lines.append('        return None')
    lines.append('    return ' + lit(r['code']) + ' if ' + condition + ' else None')
    return lines


def module_text(table, rows):
    lines = ['"""W3C guard table ' + table + '.', '',
             'Method B guard rows (scripts/pm_guard_isolation.py) for scripts/pm_w3c_event_oracles.py. Each predicate is the',
             'row\'s comparison over the raw facts the checker observed for it (True: the row does not apply). The checker',
             'refuses only through these rows, in this order.',
             'Generated by scripts/pm-w3c-table-generate.py from pm_w3c_event_oracles.ROWS; edit the spec there.', '"""',
             'import pm_guard_isolation as g',
             'FIELDS = (' + ''.join([lit(r['id']) + ', ' for r in rows]) + ')', '']
    for r in rows:
        lines += [''] + predicate_lines(r) + ['']
    lines += ['', 'def case(value):', '    context = None', '    table = g.GuardTable([']
    for r in rows:
        lines.append('        g.Guard(' + lit(r['id']) + ', g.Invariant(' + lit(r['field']) + ', ' + lit(r['words']) + '), ' +
                     lit(r['code']) + ', ' + r['id'] + '),')
    lines += ['    ])', '', '    def check(value):']
    for r in rows:
        lines.append('        table.require(' + lit(r['id']) + ', value, context)')
    lines += ['        return True', '    return g.Case(table, check, context)', '']
    return '\n'.join(lines)


def table_source(table):
    return module_text(table, TABLE_ROWS[table])


def stale_tables():
    """Table modules that are missing, differ from their generated source, or are extra."""
    scripts = ROOT / 'scripts'
    want = {TABLE_PREFIX + t + '.py': table_source(t) for t in TABLES}
    stale = sorted([n for n, text in want.items() if not (scripts / n).exists() or (scripts / n).read_text() != text])
    extra = sorted([p.name for p in scripts.glob(TABLE_PREFIX + '*.py') if p.name not in want])
    return stale + extra


def observe(c):
    """One observation per row (NA when it does not apply). Exceptions are checker findings, never refusals."""
    facts, errors = {}, []
    m = Memo(c)
    with exact_digits():
        for r in ROWS:
            if not applies(r, c):
                facts[r['id']] = NA
                continue
            try:
                value = r['fn'](c, m)
            except (Refusal, *CAUGHT) as exc:
                errors.append((r['id'], type(exc).__name__ + ': ' + str(exc)[:200]))
                value = NA
            facts[r['id']] = value
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
    with exact_digits():
        for table in TABLES:
            _, refused = table_refusals(table, facts)
            for name, code in refused:
                failing.append(name)
                if first is None:
                    first = (name, code)
    return first, failing, errors


def judge(case, first, failing, errors):
    """A positive refuses nowhere; a negative refuses first at exactly its row, and every other refusing row is
    entailed with a proof naming that first row."""
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
    else:
        raise ValueError('unknown change op ' + op)


def mutate(base, changes):
    out = copy.deepcopy(base)
    for ch in changes:
        apply_change(out, ch[0], ch[1], ch[2] if len(ch) > 2 else None)
    return out


def install_resources():
    return {CONTRACTS: json.loads((ROOT / CONTRACTS).read_text()), RECORDS: json.loads((ROOT / RECORDS).read_text())}


def cases(selected=None):
    """(case id, complete scenario, case record) for every positive and negative, in a fixed order."""
    fx = load(FIXTURES)
    bases = {c['id']: c for c in fx['positives']}
    for c in fx['positives']:
        if selected is None or selected(c):
            yield c['id'], hydrate(c['scenario']), c
    for n in fx['negatives']:
        if selected is None or selected(n):
            yield n['id'], hydrate(mutate(bases[n['base']]['scenario'], n['changes'])), n


def hydrate(scenario):
    """Install scenarios name the repository resources instead of embedding them."""
    if scenario.get('path') == 'install' and scenario.get('resources') == 'repository':
        scenario = dict(scenario)
        scenario['resources'] = install_resources()
    elif scenario.get('path') == 'install' and type(scenario.get('resources')) is dict and scenario['resources'].get('$overlay'):
        overlay = scenario['resources']['$overlay']
        res = install_resources()
        for path, pointer, value in overlay:
            apply_change(res[path], pointer, 'set', value)
        scenario = dict(scenario)
        scenario['resources'] = res
    return scenario


def run_all(progress=None, selected=None):
    counts = dict(cases=0, positives=0, negatives=0, errors=0)
    findings, firsts = [], {}
    for number, (cid, scenario, case) in enumerate(cases(selected)):
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
    parser.add_argument('--family')
    parser.add_argument('--path')
    parser.add_argument('--fixtures', type=Path, help='development fixture file (never the evidence run)')
    parser.add_argument('--skip-table-check', action='store_true', help='mutation proof only: run with edited table modules')
    args = parser.parse_args(argv)
    if not args.skip_table_check and stale_tables():
        print(json.dumps({'status': 'fail', 'stale_table_modules': stale_tables()}))
        return 1
    if args.fixtures:
        FIXTURE_PATH.append(args.fixtures)

    def selected(case):
        sc = case.get('scenario') or {}
        fam = sc.get('family') or case.get('family')
        path = sc.get('path') or case.get('path')
        return (args.family is None or fam == args.family) and (args.path is None or path == args.path)
    sel = selected if (args.family or args.path or args.fixtures) else None
    counts, findings, firsts = run_all(progress=lambda n: print('case', n, file=sys.stderr, flush=True), selected=sel)
    reachable = [r['id'] for r in ROWS if r['id'] not in ENTAILED]
    unwitnessed = [r for r in reachable if r not in firsts] if sel is None else []
    result = {'status': 'pass' if not findings and not unwitnessed else 'fail', 'counts': counts, 'rows': len(ROWS),
              'tables': len(TABLES), 'entailed': sorted(ENTAILED), 'unwitnessed_rows': unwitnessed,
              'findings': findings[:200], 'first_rows': firsts}
    text = json.dumps(result, indent=1, sort_keys=True)
    if args.json:
        args.json.write_text(text + '\n')
    print(json.dumps({k: result[k] for k in ('status', 'counts', 'rows', 'tables', 'unwitnessed_rows')}, sort_keys=True)[:3000])
    if findings:
        print(json.dumps(findings[:30], indent=1)[:6000], file=sys.stderr)
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())

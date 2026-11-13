#!/usr/bin/env python3
"""W3B synthetic contract oracles (wave 3 phase 2). No native execution or writer admission.

Nineteen prepared Source Control families (SCS-1250..SCS-1268, CV-1250..CV-1268, SP-1250..SP-1268,
ATS-1210..ATS-1219). Membership stays ABSENT; every scenario models a hypothetical future admission
only to exercise the owner predicates.

Method B guard tables. Every refusal is one named row of a generated table module
``scripts/pm_w3b_table_<table>.py`` (generator ``scripts/pm-w3b-table-generate.py``; the row
specification is ``ROWS`` below). A row's predicate is the refusal test itself: it compares the
candidate's own values with independently derived or owner-held values (``derive`` computes recipes,
shared-helper outcomes and readiness gates; it decides nothing). ``evaluate`` runs every table's
predicates in table order and returns the first refusing row. Check 11 is proved by the gated
``scripts/pm_guard_isolation.py`` through ``scripts/pm-w3b-guard-tables.py``.

Numbers (CV-1100/SP-1100): fixture text is parsed with the shared ``loads_exact`` and every integer token
becomes an exact integer through ``current_integer``; every schema integer slot the stock validator admits
must then pass ``current_integer``; Storage uint64 fields pass ``storage_uint64``; the producer projection is
qualified with ``producer_semantic_bytes``/``producer_semantic_digest``; inline sizes, packs and the
retained bytes use ``storage_value_bytes``/``decode_storage_value``/``verify_payload_bytes``. No lane
serializer, cap or normalization. Event and key recipes are the owner's hex-concatenation templates
(SCS-1250..SCS-1268 C4/C5), not JCS.

Timestamps (CV-1101): every timestamp field goes through the shared ``pm_event_datetime``: schema verdicts use
``format_checker(profile=EVENT_RECORD)`` (EventRecord ``occurred_at_utc``, the CV-339 AppendReceipt
``acknowledged_at_utc``, the Source Control request ``requested_at_utc`` and the v2 sync target
``preview_expires_at``, current and retained); the CV-253 Storage fields ``observed_at_utc`` and
``persisted_at_utc`` are their own ``date_time(..., STORAGE_UTC_Z)`` rows, on the candidate and in the frozen
verifier of every retained original.

Retained originals (SP-1101): a retry original, a retained history read and a recovery of a source_committed
fact resolve through the shared ``RetainedDispatcher``. ``W3BOriginalOwner`` answers only from Storage's
sealed write custody (``Plans/w3b_original_custody.json``), from the one sealed receipt for that exact
original; no receipt, a receipt bound to another original, or several receipts never select a recipe. Every
resolve is wrapped by a snapshot of the sealed store; a change is a checker error (no receipt is created
while reading). A caller selector is passed to ``resolve(recipe_override=...)`` and refused there.
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

import blake3
from jsonschema import Draft202012Validator, validators
from jsonschema.exceptions import ValidationError
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pm_event_numbers as N  # noqa: E402
from pm_event_numbers import (  # noqa: E402
    EVENT_VALUE, FrozenRecipe, JsonNumber, OriginalBinding, OriginalCustody, RecipeTuple, Refusal,
    RetainedDispatcher, current_integer, decode_storage_value, full_value_commitment, loads_exact,
    producer_semantic_bytes, producer_semantic_digest, storage_uint64, storage_value_bytes, verify_payload_bytes,
)
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time, format_checker  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
TABLE_PREFIX = 'pm_w3b_table_'
FIXTURES = 'w3b_event_fixtures.json'
CUSTODY_FILE = 'w3b_original_custody.json'
EVENT_SCHEMA_FILE = 'source_control_event_contracts.schema.json'
PATHS = ('append', 'retry', 'history', 'recovery', 'backup', 'checkpoint', 'install')
CAUGHT = (KeyError, TypeError, ValueError, IndexError, AttributeError, OverflowError, StopIteration)
INLINE_LIMIT = 16384
PACK_MEDIA = 'application/vnd.puppetmaster.event-payload+msgpack'
SOURCE_MEDIA = 'application/vnd.puppetmaster.source-control-source-body+msgpack'
ENVELOPE_ID, ENVELOPE_VERSION = 'pm.event.v0', '2.0.0'
PRODUCER_RECIPE = 'cv317.producer_semantic.cv1100'
APPEND_POLICY = 'dedupe_by_idempotency_key'

PREP = json.loads((ROOT / 'Plans' / 'source_control_event_preparation.json').read_text())

# Retention bindings decided on main (E-CARDS-3 Appendix A; storage-plan "Third-sitting retention assignments").
RETENTION = {}
for _f in ('backend.selected', 'checkpoint.created', 'checkpoint.restored', 'repository.bound', 'repository.unbound',
           'workspace.created', 'workspace.removed', 'writer_lease.granted', 'writer_lease.lost'):
    RETENTION['source_control.' + _f] = ('DL-453', 'RP-AUTHORITY-INDEFINITE@1.0.0')
for _f in ('backend.detected', 'status.refreshed', 'workspace.opened', 'workspace.switched'):
    RETENTION['source_control.' + _f] = ('DL-454', 'RP-TELEMETRY-90D@1.0.0')
for _f in ('remote.fetch_completed', 'remote.fetch_started', 'remote.publish_completed', 'remote.publish_started',
           'remote.sync_completed', 'remote.sync_started'):
    RETENTION['source_control.' + _f] = ('DL-455', 'RP-OPERATIONAL-2555D@1.0.0')

COMMANDS = {
    'backend.detected': 'cmd.source_control.backend.detect', 'backend.selected': 'cmd.source_control.backend.select',
    'checkpoint.created': 'cmd.source_control.checkpoint.create', 'checkpoint.restored': 'cmd.source_control.checkpoint.restore',
    'remote.fetch_completed': 'cmd.source_control.remote.fetch', 'remote.fetch_started': 'cmd.source_control.remote.fetch',
    'remote.publish_completed': 'cmd.source_control.remote.publish', 'remote.publish_started': 'cmd.source_control.remote.publish',
    'remote.sync_completed': 'cmd.source_control.remote.sync', 'remote.sync_started': 'cmd.source_control.remote.sync',
    'repository.bound': 'cmd.source_control.repository.bind', 'repository.unbound': 'cmd.source_control.repository.unbind',
    'status.refreshed': 'cmd.source_control.status.refresh', 'workspace.created': 'cmd.source_control.workspace.create',
    'workspace.opened': 'cmd.source_control.workspace.open', 'workspace.removed': 'cmd.source_control.workspace.remove',
    'workspace.switched': 'cmd.source_control.workspace.switch', 'writer_lease.granted': None, 'writer_lease.lost': None,
}
REMOTE = ('remote.fetch_completed', 'remote.fetch_started', 'remote.publish_completed', 'remote.publish_started',
          'remote.sync_completed', 'remote.sync_started')
STARTED = ('remote.fetch_started', 'remote.publish_started', 'remote.sync_started')
COMPLETED = ('remote.fetch_completed', 'remote.publish_completed', 'remote.sync_completed', 'checkpoint.restored',
             'workspace.created', 'workspace.removed', 'workspace.switched')
LEASES = ('writer_lease.granted', 'writer_lease.lost')
# SCS-1250..1268 C2/C3: permission/FileSafe and the applicable capability/topology/revision/lease/credential
# evidence, frozen before effect. Applicability follows the existing command scope requirements.
AUTHORITY_KINDS = ('permission', 'filesafe', 'capability', 'topology', 'revision', 'writer_lease', 'credential')
_REVISION = ('checkpoint.created', 'checkpoint.restored', 'repository.bound', 'repository.unbound', 'status.refreshed',
             'workspace.created', 'workspace.opened', 'workspace.removed', 'workspace.switched') + REMOTE
_WRITER = ('checkpoint.created', 'checkpoint.restored', 'repository.unbound', 'workspace.created', 'workspace.removed',
           'workspace.switched') + REMOTE


def authority_kinds(short):
    kinds = ['permission', 'capability', 'topology']
    if short not in LEASES:
        kinds.insert(1, 'filesafe')
    if short in _REVISION:
        kinds.append('revision')
    if short in _WRITER:
        kinds.append('writer_lease')
    if short in REMOTE:
        kinds.append('credential')
    return tuple(kinds)


def family_specs():
    out = {}
    for f in PREP['families']:
        et = f['event_type']
        short = et.split('.', 1)[1]
        key = short.replace('.', '_')
        out[et] = {
            'event_type': et, 'short': short, 'key': key, 'scs': f['semantic_owner'].split('#')[1],
            'cv': f['payload_owner'].split('#')[1], 'sp': f['storage_owner'].split('#')[1],
            'payload_schema_id': f['payload_schema_id'], 'producer': f['producer'], 'append_binding': f['append_binding'],
            'consumer': f['consumer'], 'reader': f['historical_reader'], 'command_id': COMMANDS[short],
            'authorities': authority_kinds(short), 'retention': RETENTION[et],
        }
    return out


FAMILY = family_specs()
FAMILIES = tuple(FAMILY)


def spec(family):
    return FAMILY[family]


# ---------------------------------------------------------------------------------------------
# Loading (CV-1100 exact numbers)
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


@contextmanager
def exact_digits():
    """Scoped: no process-global digit-limit change outlives one evaluation (4,400-digit integers)."""
    before = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        yield
    finally:
        sys.set_int_max_str_digits(before)


# ---------------------------------------------------------------------------------------------
# Schema resources: a closed, preloaded registry (no retrieval) and eager reference resolution
# ---------------------------------------------------------------------------------------------
RESOURCE_FILES = (
    'source_control_event_contracts.schema.json', 'source_control_contracts.schema.json', 'event_record.schema.json',
    'event_append_receipt_contracts.schema.json', 'event_record_index_checkpoint.schema.json',
    'shared_integration_runtime.schema.json', 'section15_browser_program_contracts.schema.json',
    'settings_system_contracts.schema.json', 'multi_account_contracts.schema.json', 'assistant_chat_contracts.schema.json',
    'shared_runtime_command_contracts.schema.json', 'application_workflow_contracts.schema.json',
    'automation_authority_contracts.schema.json', 'working_notebook_contracts.schema.json',
    'projects_refresh_fix_contracts.schema.json', 'assistant_memory_contracts.schema.json',
    'collaborative_workflows_contracts.schema.json', 'coordination_projection_contracts.schema.json',
    'cross_project_access_contracts.schema.json', 'goal_body_custody.schema.json',
)
PLANS_URI = 'https://puppetmaster.local/Plans/'


def resource_uris(name, doc):
    uris = [PLANS_URI + name]
    if isinstance(doc.get('$id'), str) and doc['$id'] not in uris:
        uris.append(doc['$id'])
    return uris


@lru_cache(maxsize=None)
def resources():
    return {name: load(name) for name in RESOURCE_FILES}


def build_registry(docs):
    pairs = []
    for name, doc in docs.items():
        res = Resource.from_contents(doc, default_specification=DRAFT202012)
        for uri in resource_uris(name, doc):
            pairs.append((uri, res))
    return Registry().with_resources(pairs)


def _refs(node, acc):
    if isinstance(node, dict):
        for k, v in node.items():
            if k == '$ref' and isinstance(v, str):
                acc.append(v)
            else:
                _refs(v, acc)
    elif isinstance(node, list):
        for v in node:
            _refs(v, acc)


ROOT_RESOURCES = (EVENT_SCHEMA_FILE, 'event_record.schema.json', 'event_append_receipt_contracts.schema.json')


def dangling_refs(docs):
    """Every $ref reachable from the W3B roots (the whole W3B event-contract resource with every $def, the
    EventRecord and the CV-339 receipt resource) resolves inside the closed registry, following each reference
    transitively, including branches no case visits (eager; a missing resource or pointer is listed, nothing is
    retrieved)."""
    registry = build_registry(docs)
    bad, seen = [], set()
    todo = []
    for name in ROOT_RESOURCES:
        if name not in docs:
            bad.append(name + ' missing')
            continue
        base = resource_uris(name, docs[name])[-1]
        todo.append((name, docs[name], registry.resolver(base_uri=base)))
    while todo:
        where, node, resolver = todo.pop()
        if isinstance(node, list):
            todo.extend([(where, v, resolver) for v in node])
            continue
        if not isinstance(node, dict) or id(node) in seen:
            continue
        seen.add(id(node))
        for k, v in node.items():
            if k == '$ref' and isinstance(v, str):
                try:
                    resolved = resolver.lookup(v)
                except Exception:  # noqa: BLE001 - any unresolvable reference is a refusal of the install row
                    bad.append(where + ' ' + v)
                    continue
                todo.append((v, resolved.contents, resolved.resolver))
            elif k not in ('const', 'enum', 'examples', 'default'):
                todo.append((where, v, resolver))
    return sorted(set(bad))


def metaschema_failures(docs):
    bad = []
    for name, doc in sorted(docs.items()):
        if name not in ROOT_RESOURCES + ('source_control_contracts.schema.json', 'event_record_index_checkpoint.schema.json'):
            continue
        try:
            Draft202012Validator.check_schema(doc)
        except Exception:  # noqa: BLE001 - any metaschema failure is a refusal of the install row
            bad.append(name)
    return bad


INSTALL_REFUSALS = dangling_refs(resources()) + metaschema_failures(resources())
if INSTALL_REFUSALS:
    raise RuntimeError('installed W3B schema resources refused at startup: ' + '; '.join(INSTALL_REFUSALS[:5]))

REGISTRY = build_registry(resources())


def _without_dialect(docs):
    """Copies of the same resources without the root $schema keyword (all are 2020-12). jsonschema's evolve() picks the
    validator class from a referenced resource's $schema, which would silently drop the slot-recording and full-match
    validator classes at a resource root; without the keyword the class is kept through every $ref."""
    out = {}
    for name, doc in docs.items():
        d = dict(doc)
        d.pop('$schema', None)
        out[name] = d
    return out


SUBCLASS_REGISTRY = build_registry(_without_dialect(resources()))
DATETIME_FORMATS = format_checker(profile=EVENT_RECORD)
EVENT_DEFS = PLANS_URI + EVENT_SCHEMA_FILE + '#/$defs/'


def _ref_schema(uri):
    return {'$schema': 'https://json-schema.org/draft/2020-12/schema', '$ref': uri}


def _fullmatch_pattern(validator, pattern, instance, schema):
    """CV-1250..1268: identifiers and hashes match their pattern in full (a trailing LF/CR never passes)."""
    if validator.is_type(instance, 'string') and re.fullmatch(pattern, instance) is None:
        yield ValidationError('%r does not match %r in full' % (instance[:80], pattern))


FullMatchValidator = validators.extend(Draft202012Validator, {'pattern': _fullmatch_pattern})


@lru_cache(maxsize=None)
def validator_for(uri):
    return Draft202012Validator(_ref_schema(uri), registry=REGISTRY, format_checker=DATETIME_FORMATS)


@lru_cache(maxsize=None)
def fullmatch_validator_for(uri):
    return FullMatchValidator({'$ref': uri}, registry=SUBCLASS_REGISTRY, format_checker=DATETIME_FORMATS)


ENVELOPE_URI = 'https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json'
RECEIPT_URI = 'https://puppetmaster.local/schemas/event_append_receipt_contracts/2.0.0#/$defs/AppendReceipt'


def subject_uri(family, subject):
    return EVENT_DEFS + spec(family)['key'] + '_' + subject


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
def slot_validator_for(uri):
    return SlotValidator({'$ref': uri}, registry=SUBCLASS_REGISTRY)


def schema_errors(uri, instance):
    """Count of owner-schema errors (every keyword kept: pattern, format, not, allOf/if/then, oneOf)."""
    with exact_digits():
        return len(list(validator_for(uri).iter_errors(instance)))


def fullmatch_errors(uri, instance):
    with exact_digits():
        return len(list(fullmatch_validator_for(uri).iter_errors(instance)))


def integer_slots_exact(uri, instance):
    del _SLOTS[:]
    with exact_digits():
        slot_validator_for(uri).is_valid(instance)
    found = list(_SLOTS)
    del _SLOTS[:]
    try:
        for value in found:
            current_integer(value)
    except Refusal:
        return False
    return True


def uint64_refusal(value):
    try:
        storage_uint64(value)
        return None
    except Refusal as refusal:
        return refusal.reason


def utc_z_refusal(value):
    try:
        date_time(value, profile=STORAGE_UTC_Z)
        return None
    except Refusal as refusal:
        return refusal.reason


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


def bytes_or_none(value):
    try:
        return storage_value_bytes(value, profile=EVENT_VALUE)
    except Refusal:
        return None


def hex_or_none(value):
    raw = bytes_or_none(value)
    return None if raw is None else raw.hex()


def sha_or_none(value):
    raw = bytes_or_none(value)
    return None if raw is None else hashlib.sha256(raw).hexdigest()


def view(d, drop):
    """A shallow view of a dict without bulky members (rows never read them); each dropped member that was present is
    replaced by a marker so presence tests still hold."""
    if type(d) is not dict:
        return d
    return {k: ('<present>' if v is not None else None) if k in drop else v for k, v in d.items()}


# ---------------------------------------------------------------------------------------------
# Owner recipes (SCS-1250..1268 C4/C5, SP-1250..1268 keys, Storage project~ partition)
# ---------------------------------------------------------------------------------------------
def hx(text):
    """hex = lowercase complete strict UTF-8 byte encoding, no normalization or truncation."""
    return text.encode('utf-8').hex()


def event_id_recipe(family, sid, project_id, operation):
    return 'evt_scs_' + spec(family)['key'] + '_' + hx(sid) + '_' + hx(project_id) + '_' + hx(operation)


def key_recipe(family, sid, project_id, operation):
    return 'scs:' + spec(family)['key'] + ':' + hx(sid) + ':' + hx(project_id) + ':' + hx(operation)


def fact_key_recipe(family, sid, project_id, operation):
    return 'source_control_event.' + spec(family)['key'] + '.fact.v1:' + hx(sid) + ':' + hx(project_id) + ':' + hx(operation)


def checkpoint_key_recipe(family, sid, project_id):
    return 'source_control_event.' + spec(family)['key'] + '.checkpoint.v1:' + hx(sid) + ':' + hx(project_id)


def partition(project_id):
    return 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')


def first_receipt_ref(sid, event_id):
    return 'sp286:first_receipt:' + sid + ':' + event_id


def _strings(value):
    return type(value) is str


def recipe_inputs_ok(sid, project_id, operation):
    return _strings(sid) and _strings(project_id) and _strings(operation)


# ---------------------------------------------------------------------------------------------
# SP-1101 retained originals
# ---------------------------------------------------------------------------------------------
RECIPE_ID = 'w3b@1'
FROZEN_ORDER = ('decodes', 'envelope', 'payload', 'storage_times', 'event_identity', 'key', 'full_value', 'producer',
                'custody_event', 'receipt', 'fact_event', 'fact_payload')


def custody():
    return load(CUSTODY_FILE)


def resource_manifest(resources_hashes, profiles):
    return hashlib.sha256(json.dumps({'resources': resources_hashes, 'timestamp_profiles': profiles}, sort_keys=True,
                                     separators=(',', ':')).encode('ascii')).hexdigest()


def recipe_tuple(recipe_id, family, manifest):
    r = custody()['recipes'][recipe_id]
    return RecipeTuple(
        envelope_schema_id=r['envelope_schema_id'], envelope_schema_version=r['envelope_schema_version'],
        payload_schema_id=spec(family)['payload_schema_id'], payload_schema_version=r['payload_schema_version'],
        owner_source_id='Plans/Contracts_V0.md#' + spec(family)['cv'], owner_edition=r['owner_edition'],
        registry_revision=r['registry_revision'], identity_recipe=r['identity_recipe'],
        producer_recipe=r['producer_recipe'], physical_profile=r['physical_profile'],
        full_value_profile=r['full_value_profile'], local_source_profile=r['local_source_profile'],
        payload_profile=r['payload_profile'], resource_manifest_sha256=manifest)


RECIPE_PROFILES = {'envelope/occurred_at_utc': EVENT_RECORD, 'envelope/observed_at_utc': STORAGE_UTC_Z,
                   'envelope/persisted_at_utc': STORAGE_UTC_Z, 'receipt/acknowledged_at_utc': EVENT_RECORD,
                   'source/requested_at_utc': EVENT_RECORD, 'source/preview_expires_at': EVENT_RECORD}


def file_bytes(name):
    return (ROOT / name).read_bytes()


def frozen_components(original, family):
    """The w3b@1 frozen verifier's checks over Storage's original, each its own fact (SP-1101 frozen recipe).
    Record, fact and custody bytes are the original's; the recipe's own resources validate them; no current gate,
    no live state, no current admission."""
    try:
        record = decode_storage_value(original.record_bytes, profile=EVENT_VALUE)
        fact = decode_storage_value(original.result_bytes, profile=EVENT_VALUE)
        held = decode_storage_value(original.receipt_bytes, profile=EVENT_VALUE)
    except Refusal:
        return {'decodes': False}
    out = {'decodes': type(record) is dict and type(fact) is dict and type(held) is dict}
    if not out['decodes']:
        return out
    with exact_digits():
        out['envelope'] = (schema_errors(ENVELOPE_URI, record) == 0 and integer_slots_exact(ENVELOPE_URI, record) and
                           type(record.get('payload')) is dict)
        out['payload'] = (out['envelope'] and schema_errors(subject_uri(family, 'payload'), record['payload']) == 0 and
                          fullmatch_errors(subject_uri(family, 'payload'), record['payload']) == 0 and
                          integer_slots_exact(subject_uri(family, 'payload'), record['payload']))
        out['storage_times'] = out['envelope'] and all([utc_z_refusal(record[k]) is None
                                                         for k in ('observed_at_utc', 'persisted_at_utc')])
        if out['payload']:
            p = record['payload']
            sid = original.binding.storage_instance_id
            out['event_identity'] = record['event_id'] == event_id_recipe(family, sid, p['project_id'], p['owner_operation_id'])
            out['key'] = record['idempotency_key'] == key_recipe(family, sid, p['project_id'], p['owner_operation_id'])
            out['full_value'] = held.get('full_value_sha256') == full_value_commitment(record)
            try:
                out['producer'] = held.get('producer_semantic_sha256') == producer_semantic_digest(record)
            except Refusal:
                out['producer'] = False
            out['custody_event'] = (held.get('event_id') == record['event_id'] and type(held.get('receipt')) is dict and
                                    held['receipt'].get('event_id') == record['event_id'])
            out['receipt'] = schema_errors(RECEIPT_URI, held.get('receipt')) == 0
            fact_ok = schema_errors(subject_uri(family, 'fact'), fact) == 0
            out['fact_event'] = (fact_ok and fact.get('event_id') == record['event_id'] and
                                 (fact.get('phase') != 'issued' or
                                  fact.get('first_append_receipt_ref') == first_receipt_ref(sid, record['event_id'])))
            body = fact.get('source_body') if fact_ok else None
            out['fact_payload'] = type(body) is dict and strict_equal(body.get('payload'), p)
    return out


def frozen_verifier(expected_tuple, family):
    def verify(original):
        if original.recipe != expected_tuple:
            return False
        comps = frozen_components(original, family)
        return all([comps.get(k) is True for k in FROZEN_ORDER])
    return FrozenRecipe(verify)


def install_frozen_recipes(read=file_bytes):
    installed = {}
    for recipe_id, r in custody()['recipes'].items():
        if r.get('installed') is not True:
            continue
        names = sorted(r['resources'])
        manifest = resource_manifest({n: hashlib.sha256(read(n)).hexdigest() for n in names}, r['timestamp_profiles'])
        for family in FAMILIES:
            key = recipe_tuple(recipe_id, family, manifest)
            installed[key] = frozen_verifier(key, family)
    return installed


@lru_cache(maxsize=None)
def frozen_recipes():
    return install_frozen_recipes()


def original_ref(sid, e):
    return 'seglog:' + ':'.join([hx(x) for x in (sid, 'project', e['event_type'], e['event_id'])])


def binding_of(sid, server_id, e, record_bytes):
    p = e['payload']
    return OriginalBinding(storage_instance_id=sid, scope_kind=e['scope_kind'], server_id=server_id,
                           project_id=e['project_id'], event_type=e['event_type'], event_id=e['event_id'],
                           idempotency_key=e['idempotency_key'], owner_operation_id=p['owner_operation_id'],
                           source_commitment=hashlib.sha256(record_bytes).hexdigest())


def store_digest(store):
    return hashlib.sha256(json.dumps(store, sort_keys=True, separators=(',', ':')).encode('utf-8')).hexdigest()


class W3BOriginalOwner:
    """Storage's sealed write custody at the requested Store (static stand-in for native custody).

    It answers only from the sealed store: the Store must be sealed, and the write-time recipe comes only from the one
    sealed receipt Storage wrote for that exact original (Store, event type, event id) whose source commitment is the
    record Storage holds. None for that id is original_unavailable; receipts for that id that bind other record bytes
    are original_other_receipt (another original); several binding receipts are recipe_ambiguous; a receipt whose
    admission is not this family's at-write admission is original_admission. It only reads the store: it never seals a
    receipt and never falls back to a Store default."""

    def __init__(self, store, record, fact, held):
        self.store, self.record, self.fact, self.held = store, record, fact, held

    def authenticated_original(self, ref):
        try:
            sid, scope, event_type, event_id = [bytes.fromhex(x).decode('utf-8') for x in ref[len('seglog:'):].split(':')]
        except (ValueError, UnicodeDecodeError):
            raise Refusal('original_query')
        if sid not in self.store['stores'] or scope != 'project':
            raise Refusal('original_unavailable')
        at_id = [r for r in self.store['sealed_receipts'] if r['storage_instance_id'] == sid and r['event_id'] == event_id
                 and r['event_type'] == event_type]
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
        recipe = self.store['recipes'].get(receipt['recipe'])
        if recipe is None or recipe.get('installed') is not True:
            raise Refusal('recipe_unknown')
        if receipt.get('admission') != {'family': event_type, 'version': '1.0.0', 'registry_revision': recipe['registry_revision']}:
            raise Refusal('original_admission')
        return OriginalCustody(binding_of(sid, receipt['server_id'], self.record, record_bytes),
                               recipe_tuple(receipt['recipe'], event_type, receipt['resource_manifest_sha256']),
                               record_bytes, storage_value_bytes(self.fact, profile=EVENT_VALUE),
                               storage_value_bytes(self.held, profile=EVENT_VALUE))


STORE_CHECKS = {'reads': 0, 'changed': 0}


def dispatch(request, held_record, held_fact, held_custody, sid, server_id, selector=None, recipes=None):
    """One SP-1101 resolution of the original a retry, retained read or recovery asks for: ('ok'|reason, original).
    The sealed store is snapshotted before and after; a change is recorded and fails the checker run."""
    store = custody()
    before = store_digest(store)
    original = None
    try:
        owner = W3BOriginalOwner(store, held_record, held_fact, held_custody)
        expected = binding_of(sid, server_id, request, storage_value_bytes(held_record, profile=EVENT_VALUE))
        original = RetainedDispatcher(owner, frozen_recipes() if recipes is None else recipes).resolve(
            original_ref(sid, request), expected, disclose=lambda binding: True, recipe_override=selector)
        reason = 'ok'
    except Refusal as refusal:
        reason = refusal.reason
    except CAUGHT:
        reason = 'original_query'
    STORE_CHECKS['reads'] += 1
    if store_digest(store) != before:
        STORE_CHECKS['changed'] += 1
    return reason, original


def owned_original(c, request_key='event'):
    """The original Storage holds for this request, authenticated only through the sealed custody (for the
    frozen component rows after the dispatcher refused at original_verification)."""
    held = c['storage']
    owner = W3BOriginalOwner(custody(), held['event'], held['fact'], held['custody'])
    try:
        return owner.authenticated_original(original_ref(c['owner']['storage_instance_id'], c[request_key]))
    except Refusal:
        return None


# ---------------------------------------------------------------------------------------------
# derive: per scenario, the values the rows compare. Derivation recomputes recipes and runs the shared
# helpers; it decides nothing. Keys a path does not use are None; readiness gates are booleans.
# ---------------------------------------------------------------------------------------------
EVENT_PATHS = ('append', 'retry', 'history')
CANDIDATE_PATHS = ('append', 'retry')
EFFECT_KINDS = ('command', 'native', 'network', 'lease', 'outbox', 'notification', 'charge')
LINEAGE_FIELDS = ('thread_id', 'run_id', 'node_id', 'attempt_id', 'actor_ref', 'requested_account_ref',
                  'effective_account_ref', 'correlation_id', 'causation_event_id', 'parent_event_id')
RECEIPT_U64 = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')
CK_U64 = ('through_sequence_id', 'frontier_revision', 'selected_segment_generation', 'manifest_generation', 'recovery_epoch')
TOKEN_FIELDS = ('storage_instance_id', 'checkpoint_key', 'checkpoint_ref', 'generation_id', 'generation_anchor_sha256',
                'frontier_revision', 'frontier_sha256', 'index_dataset_name', 'source_selection')


def _d(x):
    return x if type(x) is dict else {}


def flat(d, prefix='', out=None):
    """Every node of a nested dict under its dotted path (dicts included as values), so a predicate reads any depth
    with one dict lookup (the gated tool certifies a single .get on a data value, never a chained call)."""
    out = {} if out is None else out
    for k, v in _d(d).items():
        path = prefix + str(k)
        out[path] = v
        if type(v) is dict:
            flat(v, path + '.', out)
    return out


def _l(x):
    return x if type(x) is list else []


def payload_fields(family):
    return tuple(resources()[EVENT_SCHEMA_FILE]['$defs'][spec(family)['key'] + '_payload']['properties'])


def request_view(req):
    """The accepted original request as the joins read it: variant, legacy scope and lineage, or the v2 sync target."""
    req = _d(req)
    if req.get('variant') == 'legacy_exact':
        legacy = _d(req.get('legacy_request'))
        scope = _d(legacy.get('scope'))
        return {'variant': 'legacy_exact', 'command_id': scope.get('command_id'), 'instance': legacy.get('command_instance_id'),
                'idempotency_key': legacy.get('idempotency_key'), 'scope': scope, 'lineage': _d(scope.get('lineage')),
                'permission_ref': legacy.get('permission_snapshot_ref'), 'filesafe_ref': legacy.get('file_safe_decision_ref'),
                'target': {}}
    if req.get('command_id') == 'cmd.source_control.remote.sync':
        target = _d(req.get('target'))
        scope = _d(_d(req.get('scope')).get('scope'))
        return {'variant': 'local_reconcile_only', 'command_id': req.get('command_id'), 'instance': target.get('command_instance_id'),
                'idempotency_key': req.get('idempotency_key'), 'scope': scope, 'lineage': _d(scope.get('lineage')),
                'permission_ref': _d(target.get('permission_evidence')).get('source_ref'),
                'filesafe_ref': _d(target.get('filesafe_evidence')).get('source_ref'), 'target': target}
    return {'variant': None, 'command_id': None, 'instance': None, 'idempotency_key': None, 'scope': {}, 'lineage': {},
            'permission_ref': None, 'filesafe_ref': None, 'target': {}}


def pack_facts(pack, media):
    """Actual bytes of an SP-337 pack: length, BLAKE3 and the shared decoder's canonical value."""
    out = {'len': None, 'blake3': None, 'decoded': None, 'media_ok': None, 'verify': None}
    if type(pack) is not dict or type(pack.get('bytes_hex')) is not str:
        return out
    try:
        raw = bytes.fromhex(pack['bytes_hex'])
    except ValueError:
        return out
    out['len'] = len(raw)
    out['blake3'] = blake3.blake3(raw).hexdigest()
    try:
        out['decoded'] = decode_storage_value(raw, profile=EVENT_VALUE)
    except Refusal:
        out['decoded'] = None
    try:
        verify_payload_bytes(raw, byte_size=pack.get('byte_size'), payload_id=pack.get('payload_id'),
                             media_type=pack.get('media_type'), expected_media_type=media)
    except Refusal as refusal:
        out['verify'] = refusal.reason
    return out


def derive(c):
    with exact_digits():
        return _derive(c)


def _derive(c):
    f = {}
    path, family = c.get('path'), c.get('family')
    f['path'], f['family'] = path, family
    known = family in FAMILIES
    f['known_family'] = known
    owner = _d(c.get('owner'))
    sid = owner.get('storage_instance_id')
    f['owner_sid'], f['owner_project'] = sid, owner.get('project_id')
    f['native'], f['world'], f['lineage'] = _d(owner.get('native')), _d(owner.get('world')), _d(owner.get('lineage'))
    f['authority'] = {k: _d(_d(owner.get('authority')).get(k)) for k in AUTHORITY_KINDS}
    f['current_generation'] = _d(owner.get('current_generation'))
    f['op_full'] = _d(owner.get('operation'))
    f['op'] = view(f['op_full'], ('native_evidence_refs',))
    f['wf'], f['nf'] = flat(f['world']), flat(f['native'])
    f['fields'] = payload_fields(family) if known else ()
    f['x_authorities'] = spec(family)['authorities'] if known else ()
    f['x_command'] = spec(family)['command_id'] if known else None
    f['x_producer'] = spec(family)['producer'] if known else None
    f['x_payload_schema_id'] = spec(family)['payload_schema_id'] if known else None
    f['x_retention'] = spec(family)['retention'][1] if known else None
    e = c.get('event')
    f['ev'] = e if type(e) is dict else {}
    f['g_event'] = known and path in EVENT_PATHS and type(e) is dict and e.get('event_type') == family
    f['g_cand'] = f['g_event'] and path in CANDIDATE_PATHS
    _derive_candidate(c, f)
    _derive_fact(c, f)
    _derive_publication(c, f)
    _derive_original(c, f)
    _derive_reader(c, f)
    _derive_recovery(c, f)
    _derive_backup(c, f)
    _derive_checkpoint(c, f)
    _derive_install(c, f)
    # predicates read small views; bodies are compared through the digests above
    f['ev'] = view(f['ev'], ('payload',))
    for k in ('fact', 'orig_fact'):
        f[k] = view(f[k], ('source_body',))
    f['orig'] = view(f['orig'], ('payload',))
    f['ck'] = view(f['ck'], ('stored', 'next', 'publication', 'scanned', 'cas', 'live_current', 'effects'))
    f['ck_pub'] = view(f['ck_pub'], ('rows',))
    f['pf'] = {k: v for k, v in f['pf'].items() if k != 'rows'}
    return f


def _derive_candidate(c, f):
    e, fam, sid = f['ev'], f['family'], f['owner_sid']
    for k in ('env_errors', 'env_int_ok', 'seq_u64', 'observed_utc', 'persisted_utc', 'payload_errors', 'payload_full_errors',
              'payload_int_ok', 'producer_reason', 'inline_bytes', 'payload_sha', 'pack', 'pack_len', 'pack_blake3',
              'pack_decoded_sha', 'x_event_id', 'x_key', 'x_partition', 'x_fact_key', 'policy_reason', 'x_producer_digest',
              'x_full_value', 'durable_packs', 'target', 'admission', 'producer', 'ev_payload'):
        f[k] = None
    f['g_env'] = f['g_envnum'] = f['g_l1'] = f['g_payload'] = f['g_payload_full'] = f['g_l2'] = f['g_producer'] = False
    f['g_body'] = f['g_pack_route'] = f['g_pack_bytes'] = False
    if not f['g_cand']:
        return
    f['env_errors'] = schema_errors(ENVELOPE_URI, e)
    f['g_env'] = f['env_errors'] == 0
    if f['g_env']:
        f['env_int_ok'] = integer_slots_exact(ENVELOPE_URI, e)
        f['g_envnum'] = f['env_int_ok'] is True
    if f['g_envnum']:
        f['seq_u64'] = uint64_refusal(e['sequence_id'])
        f['observed_utc'] = utc_z_refusal(e['observed_at_utc'])
        f['persisted_utc'] = utc_z_refusal(e['persisted_at_utc'])
        f['g_l1'] = (f['seq_u64'] is None and f['observed_utc'] is None and f['persisted_utc'] is None and
                     e['payload_schema_id'] == f['x_payload_schema_id'] and e['scope_kind'] == 'project')
    if f['g_l1']:
        uri = subject_uri(fam, 'payload')
        f['ev_payload'] = e['payload']
        f['payload_errors'] = schema_errors(uri, e['payload'])
        f['g_payload'] = f['payload_errors'] == 0
        if f['g_payload']:
            f['payload_full_errors'] = fullmatch_errors(uri, e['payload'])
            f['g_payload_full'] = f['payload_full_errors'] == 0
        if f['g_payload_full']:
            f['payload_int_ok'] = integer_slots_exact(uri, e['payload'])
            f['g_l2'] = f['payload_int_ok'] is True
    if f['g_l2']:
        try:
            producer_semantic_bytes(e)
        except Refusal as refusal:
            f['producer_reason'] = refusal.reason
        f['g_producer'] = f['producer_reason'] is None
    if f['g_producer']:
        raw = bytes_or_none(e['payload'])
        f['payload_sha'] = None if raw is None else hashlib.sha256(raw).hexdigest()
        f['inline_bytes'] = None if raw is None else len(raw)
        pack = c.get('pack')
        f['pack'] = view(pack, ('bytes_hex',)) if type(pack) is dict else None
        f['durable_packs'] = _l(c.get('durable_packs'))
        p = pack_facts(pack if type(pack) is dict else None, PACK_MEDIA)
        f['pack_len'], f['pack_blake3'] = p['len'], p['blake3']
        f['pack_decoded_sha'] = None if p['decoded'] is None else sha_or_none(p['decoded'])
        if e['payload_ref'] is None:
            f['g_body'] = f['inline_bytes'] is not None and f['inline_bytes'] <= INLINE_LIMIT
        else:
            pk = _d(pack)
            f['g_pack_route'] = type(pk.get('payload_id')) is str and e['payload_ref'] == 'sp337:blake3:' + pk['payload_id']
            f['g_pack_bytes'] = f['g_pack_route'] and p['verify'] is None
            f['g_body'] = (f['g_pack_bytes'] and f['pack_decoded_sha'] is not None and f['pack_decoded_sha'] == f['payload_sha'] and
                           pk.get('payload_id') in f['durable_packs'] and f['inline_bytes'] is not None and f['inline_bytes'] > INLINE_LIMIT)
        p0 = e['payload']
        if recipe_inputs_ok(f['owner_sid'], p0.get('project_id'), p0.get('owner_operation_id')):
            f['x_event_id'] = event_id_recipe(fam, f['owner_sid'], p0['project_id'], p0['owner_operation_id'])
            f['x_key'] = key_recipe(fam, f['owner_sid'], p0['project_id'], p0['owner_operation_id'])
            f['x_fact_key'] = fact_key_recipe(fam, f['owner_sid'], p0['project_id'], p0['owner_operation_id'])
        if type(e.get('project_id')) is str:
            f['x_partition'] = partition(e['project_id'])
        try:
            f['policy_reason'] = None if N.current_append_policy(e['replay_policy']) else 'policy'
        except Refusal as refusal:
            f['policy_reason'] = refusal.reason
        f['x_producer_digest'] = producer_semantic_digest(e)
        f['x_full_value'] = full_value_commitment(e)
    f['target'] = _d(c.get('target'))
    f['admission'] = _d(c.get('admission'))
    f['producer'] = c.get('producer')


def _derive_fact(c, f):
    """The canonical source fact (append CAS predecessor, recovery input) and its resolved source body."""
    fam = f['family']
    f['fact_full'] = None
    for k in ('fact', 'fact_key', 'fact_errors', 'fact_full_errors', 'fact_int_ok', 'fact_bytes', 'src_ref', 'src_pack',
              'src_pack_len', 'src_pack_blake3', 'src_body', 'src_body_errors', 'src_body_full_errors', 'src', 'req',
              'src_commitment', 'src_strings', 'x_fact_key_of_fact', 'src_body_view', 'src_body_int_ok', 'src_payload_sha',
              'fact_rest_sha', 'fact_after_rest_sha', 'src_inline_fact_bytes', 'source_durable_packs', 'src_native_refs_sha',
              'op_native_refs_sha'):
        f[k] = None
    f['rf'] = {}
    for g in ('g_fact', 'g_fact_full', 'g_fact_num', 'g_fact_size', 'g_src_route', 'g_src_bytes', 'g_source'):
        f[g] = False
    applies = (f['path'] == 'append' and f['g_body']) or (f['path'] == 'recovery' and f['known_family'])
    f['g_fact_applies'] = applies
    f['src_body_decoded'] = False
    fact = c.get('fact')
    if not applies or fact is None:
        return
    f['fact'], f['fact_full'], f['fact_key'] = fact, fact, c.get('fact_key')
    uri = subject_uri(fam, 'fact')
    f['fact_errors'] = schema_errors(uri, fact)
    f['g_fact'] = f['fact_errors'] == 0
    if f['g_fact']:
        f['fact_full_errors'] = fullmatch_errors(uri, fact)
        f['g_fact_full'] = f['fact_full_errors'] == 0
    if f['g_fact_full']:
        f['fact_int_ok'] = integer_slots_exact(uri, fact)
        f['g_fact_num'] = f['fact_int_ok'] is True
    if f['g_fact_num']:
        raw = bytes_or_none(fact)
        f['fact_bytes'] = None if raw is None else len(raw)
        f['g_fact_size'] = f['fact_bytes'] is not None and f['fact_bytes'] <= INLINE_LIMIT
        if recipe_inputs_ok(fact.get('storage_instance_id'), fact.get('project_id'), fact.get('owner_operation_id')):
            f['x_fact_key_of_fact'] = fact_key_recipe(fam, fact['storage_instance_id'], fact['project_id'], fact['owner_operation_id'])
    if not f['g_fact_size']:
        return
    body = None
    if fact['source_body'] is not None:
        body = fact['source_body']
        f['g_src_route'] = f['g_src_bytes'] = True
    else:
        ref = fact['source_body_ref']
        f['src_ref'] = ref
        pk = c.get('source_pack')
        f['src_pack'] = pk if type(pk) is dict else None
        p = pack_facts({'bytes_hex': _d(pk).get('bytes_hex'), 'byte_size': ref['byte_size'], 'payload_id': ref['blake3_id'],
                        'media_type': ref['media_type']}, SOURCE_MEDIA)
        f['src_pack_len'], f['src_pack_blake3'] = p['len'], p['blake3']
        f['g_src_route'] = f['src_pack'] is not None and p['len'] is not None
        f['g_src_bytes'] = f['g_src_route'] and p['verify'] is None
        body = p['decoded'] if f['g_src_bytes'] else None
    if body is not None:
        buri = subject_uri(fam, 'source_body')
        f['src_body'] = body
        f['src_body_decoded'] = True
        f['src_body_errors'] = schema_errors(buri, body)
        f['src_body_full_errors'] = fullmatch_errors(buri, body) if f['src_body_errors'] == 0 else None
        f['src_body_int_ok'] = integer_slots_exact(buri, body) if f['src_body_full_errors'] == 0 else None
        f['source_durable_packs'] = _l(c.get('durable_packs'))
        routed = True
        if f['src_body_int_ok'] is True and f['src_ref'] is not None:
            inline = bytes_or_none(dict(fact, source_body=body, source_body_ref=None))
            f['src_inline_fact_bytes'] = None if inline is None else len(inline)
            routed = (f['src_inline_fact_bytes'] is not None and f['src_inline_fact_bytes'] > INLINE_LIMIT and
                      f['src_ref'].get('blake3_id') in f['source_durable_packs'])
        if f['src_body_int_ok'] is True and routed:
            f['src'] = body['payload']
            f['src_payload_sha'] = sha_or_none(body['payload'])
            f['src_body_view'] = {'original_owner_result_ref': body['original_owner_result_ref']}
            f['src_native_refs_sha'] = sha_or_none(body['native_evidence_refs'])
            f['op_native_refs_sha'] = sha_or_none(f['op_full'].get('native_evidence_refs'))
            f['req'] = request_view(body['original_request'])
            f['rf'] = flat(f['req'])
            f['src_commitment'] = sha_or_none(body)
            acc = []
            _collect_strings(body, acc)
            f['src_strings'] = [x.lower() for x in acc]
            f['g_source'] = True


def _collect_strings(node, acc):
    if type(node) is str:
        acc.append(node)
    elif type(node) is dict:
        for v in node.values():
            _collect_strings(v, acc)
    elif type(node) is list:
        for v in node:
            _collect_strings(v, acc)


ORDER_BASE = ('source_commit', 'append', 'receipt_resolved', 'fact_cas', 'expose')


def _derive_publication(c, f):
    for k in ('issued', 'custody', 'fact_after', 'cas_expected', 'order', 'receipt_errors', 'receipt_int_ok', 'receipt_u64',
              'x_receipt_ref', 'receipt', 'order_required'):
        f[k] = None
    f['order_ok'] = False
    f['g_receipt'] = False
    if f['path'] != 'append' or not f['g_source']:
        return
    pub = _d(c.get('publication'))
    f['issued'] = _d(c.get('storage_issued'))
    f['custody'] = _d(pub.get('custody'))
    f['fact_after'] = _d(pub.get('fact_after'))
    f['cas_expected'] = _d(pub.get('cas_expected'))
    steps = _l(pub.get('order'))
    f['order'] = {s: steps.index(s) for s in steps if type(s) is str}
    short = f['family'].split('.', 1)[1]
    f['order_required'] = list(ORDER_BASE) + (['native_dispatch'] if short in STARTED else []) + \
        (['native_outcome', 'terminal_publication'] if short in COMPLETED else [])
    f['order_ok'] = all([x in f['order'] for x in f['order_required']])
    rest = ('phase', 'first_append_receipt_ref')
    f['fact_rest_sha'] = sha_or_none({k: x for k, x in f['fact_full'].items() if k not in rest})
    f['fact_after_rest_sha'] = sha_or_none({k: x for k, x in f['fact_after'].items() if k not in rest})
    f['fact_after'] = view(f['fact_after'], ('source_body',))
    receipt = f['custody'].get('receipt')
    f['receipt'] = _d(receipt)
    f['receipt_errors'] = schema_errors(RECEIPT_URI, receipt)
    if f['receipt_errors'] == 0:
        f['receipt_int_ok'] = integer_slots_exact(RECEIPT_URI, receipt)
        if f['receipt_int_ok']:
            f['receipt_u64'] = [k for k in RECEIPT_U64 if uint64_refusal(receipt[k]) is not None]
            f['g_receipt'] = f['receipt_u64'] == []
    if type(f['ev'].get('event_id')) is str and type(f['owner_sid']) is str:
        f['x_receipt_ref'] = first_receipt_ref(f['owner_sid'], f['ev']['event_id'])


def _derive_original(c, f):
    """SP-1101: retry, history and recovery resolve the original through the shared dispatcher."""
    for k in ('dispatch', 'orig', 'orig_fact', 'orig_held', 'orig_env_errors', 'orig_env_int_ok', 'orig_payload_errors',
              'orig_payload_full_errors', 'orig_payload_int_ok', 'orig_observed_utc', 'orig_persisted_utc', 'orig_x_event_id',
              'orig_x_key', 'orig_x_full_value', 'orig_x_producer', 'orig_x_receipt_ref', 'orig_fact_errors', 'orig_sha',
              'retry', 'cand_producer_digest', 'request_hex', 'orig_receipt', 'orig_payload_sha', 'orig_fact_payload_sha',
              'orig_receipt_errors'):
        f[k] = None
    f['g_dispatch'] = f['g_orig'] = f['g_orig_env'] = f['g_orig_payload'] = f['g_resolved'] = False
    f['dispatch_verifiable'] = False
    path = f['path']
    ev, fact = _d(c.get('event')), _d(c.get('fact'))
    ready = ((path == 'retry' and f['g_body'] and ev.get('event_id') == f['x_event_id'] and ev.get('idempotency_key') == f['x_key']) or
             (path == 'history' and f['g_event']) or
             (path == 'recovery' and f['g_source'] and fact.get('phase') == 'source_committed' and ev.get('event_id') == fact.get('event_id')))
    held = _d(c.get('storage'))
    if not ready:
        return
    f['g_dispatch'] = True
    if type(held.get('event')) is not dict:
        f['dispatch'] = 'original_unavailable' if path == 'recovery' else 'original_query'
        return
    selector = _d(c.get({'history': 'reader', 'retry': 'retry', 'recovery': 'recovery'}[path])).get('recipe_selector')
    reason, _ = dispatch(c['event'], held['event'], held.get('fact'), held.get('custody'), f['owner_sid'],
                         _d(c.get('owner')).get('server_id'), selector=selector)
    f['dispatch'] = reason
    f['retry'] = _d(c.get('retry'))
    f['dispatch_verifiable'] = reason in ('ok', 'original_verification')
    f['g_resolved'] = reason == 'ok'
    if path == 'retry' and f['g_resolved']:
        f['cand_producer_digest'] = f['x_producer_digest']
    if reason not in ('ok', 'original_verification'):
        return
    original = owned_original(c)
    if original is None:
        return
    record = decode_storage_value(original.record_bytes, profile=EVENT_VALUE)
    fact = decode_storage_value(original.result_bytes, profile=EVENT_VALUE)
    held_v = decode_storage_value(original.receipt_bytes, profile=EVENT_VALUE)
    f['g_orig'] = type(record) is dict and type(fact) is dict and type(held_v) is dict
    if not f['g_orig']:
        return
    f['orig'], f['orig_fact'], f['orig_held'] = record, fact, held_v
    f['orig_receipt'] = _d(held_v.get('receipt'))
    f['orig_sha'] = hashlib.sha256(original.record_bytes).hexdigest()
    f['orig_env_errors'] = schema_errors(ENVELOPE_URI, record)
    if f['orig_env_errors'] == 0:
        f['orig_env_int_ok'] = integer_slots_exact(ENVELOPE_URI, record)
        f['g_orig_env'] = f['orig_env_int_ok'] is True and type(record.get('payload')) is dict
    if f['g_orig_env']:
        sidb = original.binding.storage_instance_id
        f['orig_observed_utc'] = utc_z_refusal(record['observed_at_utc'])
        f['orig_persisted_utc'] = utc_z_refusal(record['persisted_at_utc'])
        uri = subject_uri(f['family'], 'payload')
        f['orig_payload_errors'] = schema_errors(uri, record['payload'])
        if f['orig_payload_errors'] == 0:
            f['orig_payload_full_errors'] = fullmatch_errors(uri, record['payload'])
            f['orig_payload_int_ok'] = integer_slots_exact(uri, record['payload'])
            f['g_orig_payload'] = f['orig_payload_full_errors'] == 0 and f['orig_payload_int_ok'] is True
        if f['g_orig_payload']:
            p = record['payload']
            f['orig_x_event_id'] = event_id_recipe(f['family'], sidb, p['project_id'], p['owner_operation_id'])
            f['orig_x_key'] = key_recipe(f['family'], sidb, p['project_id'], p['owner_operation_id'])
            f['orig_x_full_value'] = full_value_commitment(record)
            try:
                f['orig_x_producer'] = producer_semantic_digest(record)
            except Refusal:
                f['orig_x_producer'] = None
            f['orig_x_receipt_ref'] = first_receipt_ref(sidb, record['event_id'])
            f['orig_receipt_errors'] = schema_errors(RECEIPT_URI, held_v.get('receipt'))
            f['orig_fact_errors'] = schema_errors(subject_uri(f['family'], 'fact'), fact)
            f['orig_payload_sha'] = sha_or_none(p)
            if f['orig_fact_errors'] == 0 and type(fact.get('source_body')) is dict:
                f['orig_fact_payload_sha'] = sha_or_none(fact['source_body'].get('payload'))
    f['request_hex'] = None


def _derive_reader(c, f):
    f['reader'] = _d(c.get('reader')) if f['path'] == 'history' else None
    f['reader_holds'] = _l(_d(c.get('reader')).get('holds'))
    out = _d(c.get('reader')).get('output_hex')
    try:
        f['reader_output_sha'] = hashlib.sha256(bytes.fromhex(out)).hexdigest() if type(out) is str else None
    except ValueError:
        f['reader_output_sha'] = None
    f['effects'] = None
    if f['path'] == 'history':
        f['effects'] = _d(_d(c.get('reader')).get('effects'))
    elif f['path'] == 'checkpoint':
        f['effects'] = _d(_d(c.get('checkpoint')).get('effects'))


def _derive_recovery(c, f):
    f['recovery'] = _d(c.get('recovery')) if f['path'] == 'recovery' else None


def _derive_backup(c, f):
    f['closure'] = f['x_closure'] = None
    if f['path'] != 'backup' or not f['known_family']:
        return
    b = _d(c.get('backup'))
    f['closure'] = _d(b.get('closure'))
    fact, event = _d(b.get('fact')), _d(b.get('event'))
    body = _d(fact.get('source_body'))
    packs = [x for x in (_d(b.get('event_pack')).get('payload_id'), _d(fact.get('source_body_ref')).get('blake3_id')) if x]
    f['x_closure'] = {'fact_key': b.get('fact_key'), 'event_id': event.get('event_id'), 'packs': packs,
                      'receipt_ref': fact.get('first_append_receipt_ref'),
                      'native_refs': _l(body.get('native_evidence_refs')) + [x for x in [body.get('original_owner_result_ref')] if x]}


def _derive_checkpoint(c, f):
    for k in ('ck', 'ck_next', 'ck_stored', 'ck_pub', 'ck_errors', 'ck_full_errors', 'ck_int_ok', 'ck_u64', 'x_ck_key',
              'ck_index_seqs', 'ck_scanned', 'x_last_event_id', 'x_last_fact_ref', 'ck_token', 'ck_live', 'ck_cas',
              'ck_stored_errors', 'ck_successor'):
        f[k] = None
    f['tf'], f['pf'] = {}, {}
    f['g_ck'] = f['g_ck_schema'] = f['g_ck_full'] = f['g_ckr'] = False
    if f['path'] != 'checkpoint' or not f['known_family']:
        return
    ck = _d(c.get('checkpoint'))
    nxt = ck.get('next')
    f['ck'] = ck
    f['g_ck'] = nxt is not None
    if not f['g_ck']:
        return
    uri = subject_uri(f['family'], 'checkpoint')
    f['ck_next'], f['ck_stored'], f['ck_pub'] = nxt, ck.get('stored'), _d(ck.get('publication'))
    f['ck_live'], f['ck_cas'] = _d(ck.get('live_current')), _d(ck.get('cas'))
    f['ck_successor'] = ck.get('successor') if type(ck.get('successor')) is dict else (None if ck.get('successor') is None else {})
    if f['ck_stored'] is not None:
        f['ck_stored_errors'] = schema_errors(uri, f['ck_stored']) if type(f['ck_stored']) is dict else 1
    f['ck_errors'] = schema_errors(uri, nxt)
    f['g_ck_schema'] = f['ck_errors'] == 0
    if f['g_ck_schema']:
        f['ck_full_errors'] = fullmatch_errors(uri, nxt)
        f['g_ck_full'] = f['ck_full_errors'] == 0
    if f['g_ck_full']:
        f['ck_int_ok'] = integer_slots_exact(uri, nxt)
        tok = nxt['generic_token']
        sel = tok['source_selection']
        f['ck_u64'] = [k for k, v in (('through_sequence_id', nxt['through_sequence_id']), ('frontier_revision', tok['frontier_revision']),
                                      ('selected_segment_generation', sel['selected_segment_generation']),
                                      ('manifest_generation', sel['manifest_generation']), ('recovery_epoch', sel['recovery_epoch']))
                       if uint64_refusal(v) is not None]
        f['g_ckr'] = f['ck_int_ok'] is True
        f['ck_token'] = tok
        f['tf'] = flat(tok)
    f['pf'] = flat(f['ck_pub'])
    if type(f['owner_sid']) is str and type(f['owner_project']) is str:
        f['x_ck_key'] = checkpoint_key_recipe(f['family'], f['owner_sid'], f['owner_project'])
    rows = [r for r in _l(f['ck_pub'].get('rows')) if type(r) is dict]
    f['ck_index_seqs'] = [r.get('sequence_id') for r in rows]
    f['ck_scanned'] = _l(ck.get('scanned'))
    matching = [r for r in rows if not r.get('gap') and r.get('event_type') == f['family'] and
                r.get('payload_schema_id') == f['x_payload_schema_id'] and r.get('project_id') == f['owner_project']]
    f['x_last_event_id'] = matching[-1].get('event_id') if matching else None
    f['x_last_fact_ref'] = matching[-1].get('source_fact_ref') if matching else None


def _derive_install(c, f):
    f['install_refs_bad'] = f['install_meta_bad'] = None
    if f['path'] != 'install' or not f['known_family']:
        return
    docs = copy.deepcopy(resources())
    for change in _l(c.get('resource_changes')):
        apply_change(docs, change[0], change[1], change[2] if len(change) > 2 else None)
    f['install_refs_bad'] = dangling_refs(docs)
    f['install_meta_bad'] = metaschema_failures(docs)


# ---------------------------------------------------------------------------------------------
# Row specification. Each row is one predicate: ``bad`` (a Python expression over the row value ``v``) is the
# refusal test; ``when`` lists the readiness conditions an earlier row owns (the row passes when one is false);
# ``paths``/``families`` restrict where it applies. The generator writes each row as a predicate function into
# its table module; the checker and the gated tool both run that generated code.
# ---------------------------------------------------------------------------------------------
ROWS = []
ENTAILED = {}   # row id -> (rows that always refuse first, proof)
GROUP_ORDER = []
_KEY = re.compile(r"v\['([a-z0-9_]+)'\]")


def row(group, rid, code, field, words, bad, when=(), paths=None, families=None, max_rows=8):
    if any([r['id'] == rid for r in ROWS]):
        raise ValueError('duplicate row ' + rid)
    if group not in GROUP_ORDER:
        GROUP_ORDER.append(group)
    when = (when,) if isinstance(when, str) else tuple(when)
    reads = sorted(set(_KEY.findall(bad + ' '.join(when))) | {'path', 'family'})
    ROWS.append({'group': group, 'id': rid, 'code': code, 'field': field, 'words': words, 'bad': bad, 'when': when,
                 'paths': None if paths is None else tuple(paths.split()), 'families': None if families is None else
                 tuple(['source_control.' + x for x in families]), 'reads': tuple(reads), 'max_rows': max_rows})


def entailed(rid, code, field, words, bad, when, paths, first, proof, families=None):
    """An unprovable row: alone in its own table, with the proof that earlier rows always refuse first."""
    row('entailed_' + rid, rid, code, field, words, bad, when, paths, families)
    ENTAILED[rid] = (tuple(first), proof)


def sh(family_short):
    return family_short


AR = 'append retry'
G_BODY = "v['g_body'] is True"
G_SRC = "v['g_source'] is True"

# scenario ----------------------------------------------------------------------------------------
row('scenario', 'scenario_path', 'scenario_path', '/path', 'the path is append, retry, history, recovery, backup, checkpoint or install',
    "v['path'] not in ('append', 'retry', 'history', 'recovery', 'backup', 'checkpoint', 'install')")
row('scenario', 'scenario_family', 'scenario_family', '/family', 'the family is one of the nineteen W3B Source Control families',
    "v['known_family'] is not True")
row('scenario', 'event_family', 'event_family', '/event/event_type',
    'the event (candidate or presented retained record) is an object of the scenario family',
    "v['g_event'] is not True", when="v['known_family'] is True", paths='append retry history')

# install (eager resource admission) ------------------------------------------------------------------
row('install', 'install_refs', 'schema_install', '/resources',
    'every $ref reachable from the W3B roots resolves inside the closed registry, including unvisited branches',
    "len(v['install_refs_bad']) != 0", when="v['install_refs_bad'] is not None", paths='install')
row('install', 'install_metaschema', 'schema_install', '/resources', 'every installed W3B/Source Control resource is a valid 2020-12 schema',
    "len(v['install_meta_bad']) != 0", when="v['install_meta_bad'] is not None", paths='install')

# envelope ------------------------------------------------------------------------------------------
row('envelope', 'envelope_schema', 'envelope_schema', '/event',
    'the EventRecord 2.0.0 owner verdict (every keyword; shared CV-1101 event_record date-time checker) accepts the event',
    "v['env_errors'] != 0", when="v['g_cand'] is True", paths=AR)
row('envelope', 'envelope_numbers', 'current_integer', '/event', 'every EventRecord integer slot is an exact current integer (CV-1100)',
    "v['env_int_ok'] is not True", when="v['g_env'] is True", paths=AR)
row('envelope', 'sequence_u64', 'storage_uint64', '/event/sequence_id', 'sequence_id is a Storage uint64 (shared storage_uint64, SP-1100)',
    "v['seq_u64'] is not None", when="v['g_envnum'] is True", paths=AR)
row('envelope', 'storage_utc_z_observed_at_utc', 'storage_utc_z', '/event/observed_at_utc',
    'the Storage-assigned observed_at_utc passes the shared date_time with the CV-253 storage_utc_z profile',
    "v['observed_utc'] is not None", when="v['g_envnum'] is True", paths=AR)
row('envelope', 'storage_utc_z_persisted_at_utc', 'storage_utc_z', '/event/persisted_at_utc',
    'the Storage-assigned persisted_at_utc passes the shared date_time with the CV-253 storage_utc_z profile',
    "v['persisted_utc'] is not None", when="v['g_envnum'] is True", paths=AR)
row('envelope', 'payload_schema_id', 'payload_schema_id', '/event/payload_schema_id',
    'payload_schema_id selects exactly this family payload schema (schema dispatch)',
    "v['ev'].get('payload_schema_id') != v['x_payload_schema_id']", when="v['g_envnum'] is True", paths=AR)
row('envelope', 'scope_project_only', 'scope_unsupported', '/event/scope_kind',
    'the family is project_only: an application-scope event (null Project) is refused, never given a fabricated Project',
    "v['ev'].get('scope_kind') != 'project'", when="v['g_envnum'] is True", paths=AR)

# payload ---------------------------------------------------------------------------------------------
row('payload', 'payload_schema', 'payload_schema', '/event/payload',
    'the family payload owner verdict (closed, required, types, consts, enums, patterns, uniqueness, revisions) accepts it',
    "v['payload_errors'] != 0", when="v['g_l1'] is True", paths=AR)
row('payload', 'payload_fullmatch', 'payload_fullmatch', '/event/payload',
    'every payload identifier, ref and hash matches its owner pattern in full (no trailing LF/CR)',
    "v['payload_full_errors'] != 0", when="v['g_payload'] is True", paths=AR)
row('payload', 'payload_numbers', 'current_integer', '/event/payload', 'every payload integer slot is an exact current integer (CV-1100)',
    "v['payload_int_ok'] is not True", when="v['g_payload_full'] is True", paths=AR)
row('payload', 'producer_route', 'producer_route', '/event',
    'the CV-317 producer projection qualifies under CV-1100 (shared producer_semantic_bytes) before any effect',
    "v['producer_reason'] is not None", when="v['g_l2'] is True", paths=AR)
row('payload', 'inline_size', 'inline_size', '/event/payload',
    'an inline body (payload_ref null) is at most 16 KiB of canonical SP-236 bytes (SP-337)',
    "v['inline_bytes'] is None or v['inline_bytes'] > 16384", when=("v['g_producer'] is True", "v['ev'].get('payload_ref') is None"),
    paths=AR)
row('payload', 'pack_route', 'payload_ref', '/event/payload_ref',
    'a referenced body names its SP-337 pack (payload_ref = sp337:blake3:<payload_id>)',
    "v['pack'] is None or v['ev'].get('payload_ref') != 'sp337:blake3:' + str(v['pack'].get('payload_id'))",
    when=("v['g_producer'] is True", "v['ev'].get('payload_ref') is not None"), paths=AR)
row('payload', 'pack_size', 'payload_pack', '/pack/byte_size', 'the pack byte_size is the actual byte length',
    "v['pack'].get('byte_size') != v['pack_len']", when=("v['g_producer'] is True", "v['ev'].get('payload_ref') is not None",
                                                       "v['g_pack_route'] is True"), paths=AR)
row('payload', 'pack_blake3', 'payload_pack', '/pack/payload_id', 'the pack id is the BLAKE3 of the actual bytes',
    "v['pack'].get('payload_id') != v['pack_blake3']", when=("v['g_producer'] is True", "v['ev'].get('payload_ref') is not None",
                                                           "v['g_pack_route'] is True"), paths=AR)
row('payload', 'pack_media', 'payload_pack', '/pack/media_type', 'the pack media type is the event-payload msgpack media type',
    "v['pack'].get('media_type') != 'application/vnd.puppetmaster.event-payload+msgpack'",
    when=("v['g_producer'] is True", "v['ev'].get('payload_ref') is not None", "v['g_pack_route'] is True"), paths=AR)
row('payload', 'pack_body', 'payload_pack', '/pack/bytes_hex', 'the pack bytes are exactly the canonical SP-236 bytes of the payload',
    "v['pack_decoded_sha'] != v['payload_sha']", when=("v['g_producer'] is True", "v['g_pack_bytes'] is True"), paths=AR)
row('payload', 'pack_durable', 'payload_pack_durable', '/pack', 'the referenced pack is durable at the reference barrier (no dangling ref)',
    "v['pack'].get('payload_id') not in v['durable_packs']", when=("v['g_producer'] is True", "v['g_pack_bytes'] is True"), paths=AR)
row('payload', 'pack_needed', 'inline_size', '/event/payload_ref',
    'a body of at most 16 KiB stays inline (Storage\'s exact inline rule): a reference is used only above the limit',
    "v['inline_bytes'] is not None and v['inline_bytes'] <= 16384", when=("v['g_producer'] is True", "v['g_pack_bytes'] is True"), paths=AR)

# identity, admission and writer (CV-317, SCS C4-C6) ---------------------------------------------------
row('identity', 'event_identity', 'event_identity', '/event/event_id',
    'event_id is evt_scs_<family>_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)} from the payload identity',
    "v['ev'].get('event_id') != v['x_event_id']", when=G_BODY, paths=AR)
row('identity', 'key_recipe', 'idempotency_key', '/event/idempotency_key',
    'idempotency_key is scs:<family>:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}',
    "v['ev'].get('idempotency_key') != v['x_key']", when=G_BODY, paths=AR)
row('identity', 'target_partition', 'scope_partition', '/target/scope_partition',
    'the Storage partition appended to is the exact project~base64url-no-pad partition of the event Project (never a raw id)',
    "v['target'].get('scope_partition') != v['x_partition']", when=G_BODY, paths='append')
row('identity', 'target_storage', 'storage_identity', '/target/storage_instance_id',
    'the append targets the owner\'s actual Storage instance', "v['target'].get('storage_instance_id') != v['owner_sid']",
    when=G_BODY, paths='append')
row('writer', 'producer_identity', 'producer', '/producer', 'only the family producer prepares this fact',
    "v['producer'] != v['x_producer']", when=G_BODY, paths='append')
row('writer', 'admission_grant', 'family_unavailable', '/admission/writer_granted', 'the exact family writer grant is present',
    "v['admission'].get('writer_granted') is not True", when=G_BODY, paths='append')
row('writer', 'admission_family', 'family_unavailable', '/admission/family', 'the admitted family is the event family',
    "v['admission'].get('family') != v['family']", when=G_BODY, paths='append')
row('writer', 'admission_version', 'family_unavailable', '/admission/version', 'the admitted version is 1.0.0 (unknown versions unavailable)',
    "v['admission'].get('version') != '1.0.0'", when=G_BODY, paths='append')
row('writer', 'writer_withdrawn', 'withdrawn', '/admission/writer_withdrawn',
    'the append adapter is not fenced by this family\'s recorded withdrawal cutoff', "v['admission'].get('writer_withdrawn') is not False",
    when=G_BODY, paths='append')
row('writer', 'retention_bound', 'retention_unbound', '/admission/retention_policy_ref',
    'activation names exactly the retention policy landed for this family (DL-453/DL-454/DL-455), never a pending or inherited one',
    "v['admission'].get('retention_policy_ref') != v['x_retention']", when=G_BODY, paths='append')
row('writer', 'replay_only', 'replay_only_not_appendable', '/event/replay_policy',
    'a current append or retry refuses projector_replay_only (shared current_append_policy)',
    "v['policy_reason'] == 'replay_only_not_appendable'", when=G_BODY, paths=AR)
row('writer', 'replay_policy_family', 'replay_policy', '/event/replay_policy', 'the writer uses dedupe_by_idempotency_key only',
    "v['ev'].get('replay_policy') != 'dedupe_by_idempotency_key'",
    when=(G_BODY, "v['ev'].get('replay_policy') != 'projector_replay_only'"), paths=AR)
for _k in LINEAGE_FIELDS:
    row('lineage', 'lineage_' + _k, 'lineage', '/event/' + _k,
        'the EventRecord ' + _k + ' is the actual original source lineage value (null where the source has none)',
        "v['ev'].get('" + _k + "') != v['lineage'].get('" + _k + "')", when=G_BODY, paths='append')
row('lineage', 'occurred_source', 'source_time', '/event/occurred_at_utc',
    'occurred_at_utc is the original source occurrence time the native owner committed (same string)',
    "v['ev'].get('occurred_at_utc') != v['op'].get('occurred_at_utc')", when=G_BODY, paths='append')
row('lineage', 'envelope_redaction', 'redaction', '/event/redaction_profile', 'the event stores IDs and non-secret refs only (no_secrets)',
    "v['ev'].get('redaction_profile') != 'no_secrets'", when=G_BODY, paths='append')
row('lineage', 'envelope_migration', 'migration', '/event/migration', 'a current 1.0.0 append carries no migration lineage',
    "v['ev'].get('migration') != {'migrated_from_schema_id': None, 'migrated_from_schema_version': None, 'migration_id': None, "
    "'compatibility_event_type': None}", when=G_BODY, paths='append')

# source fact (SP-1250..1268 source custody) ---------------------------------------------------------
G_FACT = "v['g_fact_applies'] is True"
row('fact', 'fact_present', 'source_custody_missing', '/fact', 'the original source fact is held in canonical custody (missing custody fences)',
    "v['fact'] is None", when=G_FACT, paths='append recovery')
row('fact', 'fact_schema', 'fact_schema', '/fact',
    'the source fact owner verdict (closed, phase/receipt allOf, inline-or-ref oneOf, embedded source body and request) accepts it',
    "v['fact_errors'] != 0", when=(G_FACT, "v['fact'] is not None"), paths='append recovery')
row('fact', 'fact_fullmatch', 'fact_fullmatch', '/fact', 'every identifier, ref and hash in the fact and its embedded copies matches in full',
    "v['fact_full_errors'] != 0", when="v['g_fact'] is True", paths='append recovery')
row('fact', 'fact_numbers', 'current_integer', '/fact', 'every fact integer slot is an exact current integer (CV-1100)',
    "v['fact_int_ok'] is not True", when="v['g_fact_full'] is True", paths='append recovery')
row('fact', 'fact_wrapper_size', 'stored_wrapper_size', '/fact', 'the stored fact wrapper is at most 16 KiB of canonical bytes (SP-337)',
    "v['fact_bytes'] is None or v['fact_bytes'] > 16384", when="v['g_fact_num'] is True", paths='append recovery')
row('fact', 'fact_key_recipe', 'fact_key', '/fact_key',
    'the fact is stored at source_control_event.<family>.fact.v1:{hex(sid)}:{hex(project)}:{hex(operation)} of its own identity',
    "v['fact_key'] != v['x_fact_key_of_fact']", when="v['g_fact_size'] is True", paths='append recovery')
row('fact', 'src_pack_present', 'source_body_ref', '/source_pack', 'a referenced source body names a held SP-337 pack',
    "v['src_pack'] is None or v['src_pack_len'] is None", when=("v['g_fact_size'] is True", "v['fact'].get('source_body') is None"),
    paths='append recovery')
row('fact', 'src_pack_size', 'source_body_pack', '/fact/source_body_ref/byte_size', 'the source pack byte_size is the actual byte length',
    "v['src_ref'].get('byte_size') != v['src_pack_len']", when="v['g_src_route'] is True and v['src_ref'] is not None",
    paths='append recovery')
row('fact', 'src_pack_blake3', 'source_body_pack', '/fact/source_body_ref/blake3_id', 'the source pack id is the BLAKE3 of the actual bytes',
    "v['src_ref'].get('blake3_id') != v['src_pack_blake3']", when="v['g_src_route'] is True and v['src_ref'] is not None",
    paths='append recovery')
row('fact', 'src_pack_media', 'source_body_pack', '/fact/source_body_ref/media_type', 'the source pack media type is the source-body msgpack type',
    "v['src_ref'].get('media_type') != 'application/vnd.puppetmaster.source-control-source-body+msgpack'",
    when="v['g_src_route'] is True and v['src_ref'] is not None", paths='append recovery')
row('fact', 'src_pack_decodes', 'source_body_pack', '/source_pack/bytes_hex', 'the verified source pack decodes as canonical SP-236 bytes',
    "v['src_body_decoded'] is not True", when="v['g_src_bytes'] is True and v['src_ref'] is not None", paths='append recovery')
row('fact', 'src_body_schema', 'source_body_schema', '/source_pack', 'a decoded source body validates against the family source-body definition',
    "v['src_body_errors'] != 0", when="v['src_body_decoded'] is True and v['src_ref'] is not None", paths='append recovery')
row('fact', 'src_body_fullmatch', 'source_body_schema', '/source_pack', 'every identifier in a decoded source body matches in full',
    "v['src_body_full_errors'] != 0", when="v['src_body_errors'] == 0 and v['src_ref'] is not None", paths='append recovery')
row('fact', 'src_body_numbers', 'current_integer', '/source_pack', 'every integer slot of a decoded source body is an exact current integer',
    "v['src_body_int_ok'] is not True", when="v['src_body_full_errors'] == 0 and v['src_ref'] is not None", paths='append recovery')
row('fact', 'src_pack_needed', 'stored_wrapper_size', '/fact/source_body_ref',
    'a source body that fits the 16 KiB fact wrapper inline stays inline; a reference is used only above the limit',
    "v['src_inline_fact_bytes'] is not None and v['src_inline_fact_bytes'] <= 16384",
    when="v['src_body_int_ok'] is True and v['src_ref'] is not None", paths='append recovery')
row('fact', 'src_pack_durable', 'payload_pack_durable', '/fact/source_body_ref',
    'the referenced source pack is durable at the reference barrier (no dangling ref)',
    "v['src_ref'].get('blake3_id') not in v['source_durable_packs']", when="v['src_body_int_ok'] is True and v['src_ref'] is not None",
    paths='append recovery')

# copies of the same value: one join row per copy (event <- source fact <- native owner) -------------------
row('copies', 'payload_copy', 'source_join', '/event/payload',
    'the event payload is exactly the source body payload committed in the fact (canonical bytes)',
    "v['payload_sha'] != v['src_payload_sha']", when=G_SRC, paths='append')
row('copies', 'envelope_project_copy', 'scope_copy', '/event/project_id', 'the EventRecord project_id equals the source payload project_id',
    "v['ev'].get('project_id') != v['src'].get('project_id')", when=G_SRC, paths='append')
row('copies', 'fact_storage', 'storage_identity', '/fact/storage_instance_id', 'the fact is in the owner\'s actual Storage instance',
    "v['fact'].get('storage_instance_id') != v['owner_sid']", when=G_SRC, paths='append')
row('copies', 'fact_project_copy', 'fact_join', '/fact/project_id', 'the fact project_id equals its source payload project_id',
    "v['fact'].get('project_id') != v['src'].get('project_id')", when=G_SRC, paths='append')
row('copies', 'fact_operation_copy', 'fact_join', '/fact/owner_operation_id', 'the fact owner_operation_id equals its source payload operation',
    "v['fact'].get('owner_operation_id') != v['src'].get('owner_operation_id')", when=G_SRC, paths='append')
row('copies', 'fact_event_copy', 'fact_join', '/fact/event_id', 'the fact event_id is the appended event_id',
    "v['fact'].get('event_id') != v['ev'].get('event_id')", when=G_SRC, paths='append')
row('copies', 'fact_key_copy', 'fact_join', '/fact/idempotency_key', 'the fact idempotency_key is the appended idempotency_key',
    "v['fact'].get('idempotency_key') != v['ev'].get('idempotency_key')", when=G_SRC, paths='append')
row('copies', 'source_fact_ref', 'source_fact_ref', '/event/payload/source_fact_ref',
    'source_fact_ref is exactly the canonical key the fact is held at',
    "v['src'].get('source_fact_ref') != v['fact_key']", when=(G_SRC, "v['fact_key'] == v['x_fact_key_of_fact']"), paths='append')

# original acceptance and the original request (SCS C2/C3) ------------------------------------------------
row('acceptance', 'acceptance_present', 'original_acceptance', '/owner/operation/accepted',
    'the native owner accepted this operation (a caller-built source with matching hashes is not acceptance)',
    "v['op'].get('accepted') is not True", when=G_SRC, paths='append')
row('acceptance', 'acceptance_commitment', 'original_acceptance', '/owner/operation/source_commitment',
    'the native owner acceptance commits exactly this source body (SHA-256 of its canonical SP-236 bytes)',
    "v['op'].get('source_commitment') != v['src_commitment']", when=G_SRC, paths='append')
row('acceptance', 'source_join_owner_operation_id', 'source_join', '/source_body/payload/owner_operation_id',
    'the source payload operation is the operation the native owner accepted',
    "v['src'].get('owner_operation_id') != v['op'].get('owner_operation_id')", when=G_SRC, paths='append')
row('acceptance', 'owner_result_ref', 'source_join', '/source_body/original_owner_result_ref',
    'the original owner result ref is the actual admitted start result or terminal receipt of the accepted operation',
    "v['src_body_view'].get('original_owner_result_ref') != v['op'].get('result_ref')", when=G_SRC, paths='append')
row('acceptance', 'native_evidence', 'source_join', '/source_body/native_evidence_refs',
    'the native evidence refs are exactly the native owner\'s evidence refs for the operation',
    "v['src_native_refs_sha'] != v['op_native_refs_sha']", when=G_SRC, paths='append')
row('acceptance', 'no_secret', 'secret_material', '/source_body',
    'the source body holds IDs and authorized refs only: no credential, token, key, password or protected-auth material '
    '(every source string, lower-cased by derive, is scanned for the SCS non_secret_ref markers)',
    "any([m in s for s in v['src_strings'] for m in ('password', 'passwd', 'secret', 'apikey', 'api_key', 'api-key', "
    "'access_token', 'access-token', 'refresh_token', 'refresh-token', 'bearer', 'private_key', '-----begin')])",
    when=G_SRC, paths='append')
REQUEST_FAMILIES = tuple([s for s in COMMANDS if COMMANDS[s]])
REPO_REQUEST = tuple([s for s in REQUEST_FAMILIES if not s.startswith('backend.')])
row('request', 'request_command', 'request_join', '/source_body/original_request',
    'the original request is the family command (cmd.source_control.*), exactly as accepted',
    "v['req'].get('command_id') != v['x_command']", when=G_SRC, paths='append', families=REQUEST_FAMILIES)
row('request', 'request_instance', 'request_join', '/source_body/original_request',
    'the request command_instance_id is the accepted command instance', "v['req'].get('instance') != v['op'].get('command_instance_id')",
    when=G_SRC, paths='append', families=REQUEST_FAMILIES)
row('request', 'request_idempotency', 'request_join', '/source_body/original_request',
    'the request idempotency_key is the accepted command idempotency key',
    "v['req'].get('idempotency_key') != v['op'].get('request_idempotency_key')", when=G_SRC, paths='append', families=REQUEST_FAMILIES)
for _f, _w in (('project_id', 'project_id'), ('execution_host_id', 'execution_host_id'),
               ('execution_environment_id', 'execution_environment_id'), ('source_location_id', 'source_location_id')):
    row('request', 'request_lineage_' + _f, 'request_join', '/source_body/original_request/scope/lineage/' + _f,
        'the request scope lineage ' + _f + ' equals the source payload ' + _w,
        "v['rf'].get('lineage." + _f + "') != v['src'].get('" + _w + "')", when=G_SRC, paths='append', families=REQUEST_FAMILIES)
for _f in ('repo_id', 'scm_backend', 'workspace_id', 'repository_context_ref'):
    row('request', 'request_scope_' + _f, 'request_join', '/source_body/original_request/scope/' + _f,
        'the request scope ' + _f + ' equals the source payload ' + _f,
        "v['rf'].get('scope." + _f + "') != v['src'].get('" + _f + "')",
        when=(G_SRC, "'" + _f + "' in v['fields']"), paths='append', families=REPO_REQUEST)
row('request', 'request_permission_ref', 'request_join', '/source_body/original_request/permission_snapshot_ref',
    'the request permission snapshot ref is the frozen permission evidence ref',
    "v['req'].get('permission_ref') != v['authority']['permission'].get('evidence_ref')", when=G_SRC, paths='append',
    families=REQUEST_FAMILIES)
row('request', 'request_filesafe_ref', 'request_join', '/source_body/original_request/file_safe_decision_ref',
    'the request FileSafe decision ref is the frozen FileSafe evidence ref',
    "v['req'].get('filesafe_ref') != v['authority']['filesafe'].get('evidence_ref')", when=G_SRC, paths='append',
    families=REQUEST_FAMILIES)
row('request', 'request_writer_lease_ref', 'request_join', '/source_body/original_request/scope/writer_lease_ref',
    'the request writer lease ref is the frozen writer-lease evidence ref',
    "v['rf'].get('scope.writer_lease_ref') != v['authority']['writer_lease'].get('evidence_ref')",
    when=(G_SRC, "v['req'].get('variant') == 'legacy_exact'", "'writer_lease' in v['x_authorities']"), paths='append',
    families=REQUEST_FAMILIES)
row('request', 'request_credential_ref', 'request_join', '/source_body/original_request/scope/credential_lease_ref',
    'the request credential lease ref is the frozen credential evidence ref',
    "v['rf'].get('scope.credential_lease_ref') != v['authority']['credential'].get('evidence_ref')",
    when=(G_SRC, "v['req'].get('variant') == 'legacy_exact'", "'credential' in v['x_authorities']"), paths='append',
    families=REQUEST_FAMILIES)
row('request', 'request_target_project', 'request_join', '/source_body/original_request/target/project_id',
    'the v2 local_reconcile_only target project_id equals the source payload project_id',
    "v['rf'].get('target.project_id') != v['src'].get('project_id')",
    when=(G_SRC, "v['req'].get('variant') == 'local_reconcile_only'"), paths='append', families=('remote.sync_started', 'remote.sync_completed'))
row('request', 'request_target_backend', 'request_join', '/source_body/original_request/target/backend',
    'the v2 local_reconcile_only target backend equals the source payload scm_backend',
    "v['rf'].get('target.backend') != v['src'].get('scm_backend')",
    when=(G_SRC, "v['req'].get('variant') == 'local_reconcile_only'"), paths='append', families=('remote.sync_started', 'remote.sync_completed'))
row('request', 'request_target_operation', 'request_join', '/source_body/original_request/target/operation_id',
    'the v2 local_reconcile_only target operation_id is the accepted operation',
    "v['rf'].get('target.operation_id') != v['op'].get('owner_operation_id')",
    when=(G_SRC, "v['req'].get('variant') == 'local_reconcile_only'"), paths='append', families=('remote.sync_started', 'remote.sync_completed'))
row('request', 'request_variant', 'request_join', '/source_body/payload/sync_variant',
    'the payload sync_variant names the accepted request variant (legacy_exact remote_effect, v2 local_reconcile_only)',
    "v['src'].get('sync_variant') != ('local_reconcile_only' if v['req'].get('variant') == 'local_reconcile_only' else 'remote_effect')",
    when=G_SRC, paths='append', families=('remote.sync_started', 'remote.sync_completed'))

# source joins: each source payload field equals the native owner's committed source value ---------------------------
SOURCE_JOIN_SKIP = ('schema_id', 'schema_version', 'source_fact_ref', 'owner_operation_id')
_JOIN_FIELDS = []
for _fam in FAMILIES:
    for _f in payload_fields(_fam):
        if _f not in SOURCE_JOIN_SKIP and _f not in _JOIN_FIELDS:
            _JOIN_FIELDS.append(_f)
for _f in _JOIN_FIELDS:
    row('source_join', 'source_join_' + _f, 'source_join', '/source_body/payload/' + _f,
        'the source payload ' + _f + ' equals the native owner\'s committed source value (never a caller or fixture value)',
        "v['src'].get('" + _f + "') != v['native'].get('" + _f + "')", when=(G_SRC, "'" + _f + "' in v['fields']"), paths='append')

# before-effect authority (SCS C2/C3): one allow row and one currentness row per applicable kind ----------------------
for _k in AUTHORITY_KINDS:
    row('authority', 'auth_' + _k + '_allow', 'authority_' + _k, '/owner/authority/' + _k + '/decision',
        'the frozen ' + _k + ' evidence admits the operation before any effect', "v['authority']['" + _k + "'].get('decision') != 'allow'",
        when=(G_SRC, "'" + _k + "' in v['x_authorities']"), paths='append')
    row('authority', 'auth_' + _k + '_current', 'authority_' + _k, '/owner/authority/' + _k + '/generation',
        'the frozen ' + _k + ' evidence is the current generation at effect (never stale)',
        "v['authority']['" + _k + "'].get('generation') != v['current_generation'].get('" + _k + "')",
        when=(G_SRC, "'" + _k + "' in v['x_authorities']"), paths='append')

# publication (SP-286 / CV-339 first-receipt custody; SP-1250..1268 source phase CAS) ----------------------------
for _k in ('sequence_id', 'observed_at_utc', 'persisted_at_utc'):
    row('publication', 'storage_' + _k, 'storage_metadata', '/event/' + _k,
        'the Storage-assigned ' + _k + ' is Storage\'s issued value, never the caller\'s',
        "v['ev'].get('" + _k + "') != v['issued'].get('" + _k + "')", when=G_SRC, paths='append')
row('publication', 'custody_storage', 'receipt_custody', '/publication/custody/storage_instance_id', 'first-receipt custody is in the same Storage instance',
    "v['custody'].get('storage_instance_id') != v['owner_sid']", when=G_SRC, paths='append')
row('publication', 'custody_event', 'receipt_custody', '/publication/custody/event_id', 'first-receipt custody names this event',
    "v['custody'].get('event_id') != v['ev'].get('event_id')", when=G_SRC, paths='append')
row('publication', 'receipt_schema', 'receipt_custody', '/publication/custody/receipt',
    'the receipt is the exact closed eleven-field CV-339 AppendReceipt (shared event_record date-time checker for acknowledged_at_utc)',
    "v['receipt_errors'] != 0", when=G_SRC, paths='append')
row('publication', 'receipt_numbers', 'current_integer', '/publication/custody/receipt', 'every receipt integer slot is an exact current integer',
    "v['receipt_int_ok'] is not True", when=(G_SRC, "v['receipt_errors'] == 0"), paths='append')
row('publication', 'receipt_u64', 'storage_uint64', '/publication/custody/receipt',
    'every receipt sequence/segment/offset/manifest slot is a Storage uint64 (shared storage_uint64)',
    "len(v['receipt_u64']) != 0", when=(G_SRC, "v['receipt_int_ok'] is True"), paths='append')
row('publication', 'receipt_storage', 'receipt_custody', '/publication/custody/receipt',
    'the receipt is exactly the receipt Storage issued (Storage-assigned metadata is never taken from the caller)',
    "v['receipt'] != v['issued'].get('receipt')", when="v['g_receipt'] is True", paths='append')
row('publication', 'receipt_event', 'receipt_custody', '/publication/custody/receipt/event_id', 'the issued receipt names this event',
    "v['receipt'].get('event_id') != v['ev'].get('event_id')", when="v['g_receipt'] is True", paths='append')
row('publication', 'custody_full_value', 'receipt_custody', '/publication/custody/full_value_sha256',
    'custody commits the complete original EventRecord (shared CV-339 full_value_commitment), never a supplied digest',
    "v['custody'].get('full_value_sha256') != v['x_full_value']", when=G_SRC, paths='append')
row('publication', 'custody_producer', 'receipt_custody', '/publication/custody/producer_semantic_sha256',
    'custody commits the CV-317 producer-semantic digest (shared producer_semantic_digest), never a supplied digest',
    "v['custody'].get('producer_semantic_sha256') != v['x_producer_digest']", when=G_SRC, paths='append')
row('cas', 'cas_fact_committed', 'source_phase', '/fact/phase', 'the stored fact is still source_committed (an issued fact never changes)',
    "v['fact'].get('phase') != 'source_committed'", when=G_SRC, paths='append')
row('cas', 'cas_expected_phase', 'source_phase_cas', '/publication/cas_expected/phase',
    'the CAS predecessor phase is the stored fact phase (a stale predecessor publishes nothing)',
    "v['cas_expected'].get('phase') != v['fact'].get('phase')", when=G_SRC, paths='append')
row('cas', 'cas_expected_receipt', 'source_phase_cas', '/publication/cas_expected/first_append_receipt_ref',
    'the CAS predecessor receipt ref is the stored fact receipt ref', "v['cas_expected'].get('first_append_receipt_ref') != "
    "v['fact'].get('first_append_receipt_ref')", when=G_SRC, paths='append')
row('cas', 'cas_after_phase', 'source_phase_cas', '/publication/fact_after/phase', 'the CAS publishes exactly the issued phase',
    "v['fact_after'].get('phase') != 'issued'", when=G_SRC, paths='append')
row('cas', 'cas_after_receipt', 'source_phase_cas', '/publication/fact_after/first_append_receipt_ref',
    'the issued fact records exactly the resolved first receipt of this event', "v['fact_after'].get('first_append_receipt_ref') != v['x_receipt_ref']",
    when=G_SRC, paths='append')
row('cas', 'cas_after_unchanged', 'source_phase_cas', '/publication/fact_after',
    'issuance never changes the semantic body or identity of the fact (only phase and receipt ref move)',
    "v['fact_after_rest_sha'] != v['fact_rest_sha']", when=G_SRC, paths='append')
G_ORD = (G_SRC, "v['order_ok'] is True")
row('order', 'order_steps_present', 'publication_order', '/publication/order',
    'the publication records every step the family requires (source commit, append, receipt resolution, fact CAS, exposure, '
    'and native dispatch for a started fact, native outcome and terminal publication for a completion fact)',
    "any([x not in v['order'] for x in v['order_required']])", when=G_SRC, paths='append')
row('order', 'order_source_before_append', 'publication_order', '/publication/order',
    'the original source fact is committed before this family\'s append is attempted',
    "v['order'].get('source_commit') > v['order'].get('append')", when=G_ORD, paths='append')
row('order', 'order_receipt_before_expose', 'publication_order', '/publication/order',
    'the event is not exposed before its first issued receipt is resolved and joined',
    "v['order'].get('receipt_resolved') > v['order'].get('expose')", when=G_ORD, paths='append')
row('order', 'order_receipt_before_cas', 'publication_order', '/publication/order',
    'the fact moves to issued only after the first receipt is resolved',
    "v['order'].get('receipt_resolved') > v['order'].get('fact_cas')", when=G_ORD, paths='append')
row('order', 'order_append_before_dispatch', 'publication_order', '/publication/order',
    'for a started fact, append and receipt resolution precede native dispatch',
    "v['order'].get('receipt_resolved') > v['order'].get('native_dispatch')", when=G_ORD, paths='append', families=STARTED)
row('order', 'order_source_before_dispatch', 'publication_order', '/publication/order',
    'the start source is durable before the first native effect',
    "v['order'].get('source_commit') > v['order'].get('native_dispatch')", when=G_ORD, paths='append', families=STARTED)
row('order', 'order_outcome_before_append', 'publication_order', '/publication/order',
    'for a completion fact, the native outcome source precedes append',
    "v['order'].get('native_outcome') > v['order'].get('append')", when=G_ORD, paths='append', families=COMPLETED)
row('order', 'order_terminal_after_receipt', 'publication_order', '/publication/order',
    'dependent terminal publication follows the resolved first receipt',
    "v['order'].get('receipt_resolved') > v['order'].get('terminal_publication')", when=G_ORD, paths='append', families=COMPLETED)

# SP-1101 retained originals (retry, history, recovery): the shared dispatcher's refusals -----------------------
G_DISP = "v['g_dispatch'] is True"
DISP_PATHS = 'retry history recovery'
row('dispatch', 'recipe_override', 'recipe_override', '/reader/recipe_selector',
    'a caller recipe selector is refused by the shared dispatcher (resolve(recipe_override=...): caller_recipe_override)',
    "v['dispatch'] == 'caller_recipe_override'", when=G_DISP, paths=DISP_PATHS)
row('dispatch', 'original_query', 'original_unavailable', '/event', 'the original reference and expected binding are well formed',
    "v['dispatch'] == 'original_query'", when=G_DISP, paths=DISP_PATHS)
row('dispatch', 'recipe_custody', 'original_unavailable', '/storage',
    'a sealed receipt exists for this exact original; without one the bytes stay unread and the original is unavailable',
    "v['dispatch'] == 'original_unavailable'", when=G_DISP, paths='retry history')
row('dispatch', 'recipe_receipt_binding', 'original_unavailable', '/storage',
    'the sealed receipt binds the bytes Storage holds (a receipt for another original never selects a recipe)',
    "v['dispatch'] == 'original_other_receipt'", when=G_DISP, paths=DISP_PATHS)
row('dispatch', 'recipe_unique', 'recipe_unsupported', '/storage', 'exactly one sealed receipt binds this original (ambiguous custody is unsupported)',
    "v['dispatch'] == 'recipe_ambiguous'", when=G_DISP, paths=DISP_PATHS)
row('dispatch', 'recipe_installed', 'quarantine', '/storage',
    'the sealed recipe edition is installed (an unknown edition is quarantined, never reinterpreted)',
    "v['dispatch'] == 'recipe_unknown'", when=G_DISP, paths=DISP_PATHS)
row('dispatch', 'original_admission', 'original_admission', '/storage', 'the sealed receipt carries this family\'s at-write admission',
    "v['dispatch'] == 'original_admission'", when=G_DISP, paths=DISP_PATHS)
row('dispatch', 'original_binding', 'original_binding', '/event',
    'the requested identity is exactly the original Storage holds (presented or retried copies never substitute)',
    "v['dispatch'] == 'original_binding'", when=G_DISP, paths=DISP_PATHS)
row('dispatch', 'original_scope', 'original_binding', '/event/scope_kind',
    'the requested original is a Project original with its Project (an application-scope request has no edition)',
    "v['dispatch'] == 'original_scope'", when=G_DISP, paths=DISP_PATHS)
row('dispatch', 'dispatch_resolved', 'original_unavailable', '/storage',
    'any other shared-dispatcher or Storage-codec refusal (for example bytes Storage cannot hand out canonically) leaves the original unread',
    "v['dispatch'] not in ('ok', 'original_verification', 'caller_recipe_override', 'original_query', 'original_unavailable', "
    "'original_other_receipt', 'recipe_ambiguous', 'recipe_unknown', 'original_admission', 'original_binding', 'original_scope')",
    when=G_DISP, paths=DISP_PATHS)
G_VER = "v['dispatch_verifiable'] is True"
row('frozen', 'frozen_decodes', 'original_verification', '/storage',
    'the original record, fact and custody decode as objects (SP-236 canonical bytes)', "v['g_orig'] is not True", when=G_VER, paths=DISP_PATHS)
row('frozen', 'frozen_envelope_schema', 'original_verification', '/storage/event',
    'the original passes the frozen EventRecord verdict (shared event_record date-time checker)', "v['orig_env_errors'] != 0",
    when="v['g_orig'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_envelope_numbers', 'original_verification', '/storage/event', 'the original integer slots are exact current integers',
    "v['orig_env_int_ok'] is not True", when=("v['g_orig'] is True", "v['orig_env_errors'] == 0"), paths=DISP_PATHS)
row('frozen', 'frozen_observed_utc', 'original_verification', '/storage/event/observed_at_utc',
    'the original Storage observed_at_utc passes the shared storage_utc_z date_time', "v['orig_observed_utc'] is not None",
    when="v['g_orig_env'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_persisted_utc', 'original_verification', '/storage/event/persisted_at_utc',
    'the original Storage persisted_at_utc passes the shared storage_utc_z date_time', "v['orig_persisted_utc'] is not None",
    when="v['g_orig_env'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_payload_schema', 'original_verification', '/storage/event/payload', 'the original payload passes the frozen family verdict',
    "v['orig_payload_errors'] != 0", when="v['g_orig_env'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_payload_fullmatch', 'original_verification', '/storage/event/payload', 'the original payload identifiers match in full',
    "v['orig_payload_full_errors'] != 0", when=("v['g_orig_env'] is True", "v['orig_payload_errors'] == 0"), paths=DISP_PATHS)
row('frozen', 'frozen_payload_numbers', 'original_verification', '/storage/event/payload', 'the original payload integers are exact',
    "v['orig_payload_int_ok'] is not True", when=("v['g_orig_env'] is True", "v['orig_payload_errors'] == 0",
                                                  "v['orig_payload_full_errors'] == 0"), paths=DISP_PATHS)
row('frozen', 'frozen_event_identity', 'original_verification', '/storage/event/event_id',
    'the original event_id is the owner recipe of its own payload identity (recomputed, never trusted)',
    "v['orig'].get('event_id') != v['orig_x_event_id']", when="v['g_orig_payload'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_key', 'original_verification', '/storage/event/idempotency_key', 'the original idempotency_key is the owner key recipe',
    "v['orig'].get('idempotency_key') != v['orig_x_key']", when="v['g_orig_payload'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_full_value', 'original_verification', '/storage/custody/full_value_sha256',
    'held custody commits the original full value (CV-339)', "v['orig_held'].get('full_value_sha256') != v['orig_x_full_value']",
    when="v['g_orig_payload'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_producer', 'original_verification', '/storage/custody/producer_semantic_sha256',
    'held custody commits the original producer-semantic digest (CV-317)', "v['orig_held'].get('producer_semantic_sha256') != v['orig_x_producer']",
    when="v['g_orig_payload'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_custody_event', 'original_verification', '/storage/custody/event_id', 'held custody names the original event',
    "v['orig_held'].get('event_id') != v['orig'].get('event_id')", when="v['g_orig_payload'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_receipt_event', 'original_verification', '/storage/custody/receipt/event_id', 'the held first receipt names the original event',
    "v['orig_receipt'].get('event_id') != v['orig'].get('event_id')", when="v['g_orig_payload'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_receipt_schema', 'original_verification', '/storage/custody/receipt',
    'the held first receipt is the closed CV-339 AppendReceipt (shared event_record date-time checker for acknowledged_at_utc)',
    "v['orig_receipt_errors'] != 0", when="v['g_orig_payload'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_fact_schema', 'original_verification', '/storage/fact', 'the original issued fact passes its frozen verdict',
    "v['orig_fact_errors'] != 0", when="v['g_orig_payload'] is True", paths=DISP_PATHS)
row('frozen', 'frozen_fact_issued', 'original_verification', '/storage/fact/phase', 'a retried or retained original fact is issued',
    "v['orig_fact'].get('phase') != 'issued'", when=("v['g_orig_payload'] is True", "v['orig_fact_errors'] == 0"), paths='retry history')
row('frozen', 'frozen_fact_event', 'original_verification', '/storage/fact/event_id', 'the original fact names the original event',
    "v['orig_fact'].get('event_id') != v['orig'].get('event_id')", when=("v['g_orig_payload'] is True", "v['orig_fact_errors'] == 0"),
    paths=DISP_PATHS)
row('frozen', 'frozen_fact_receipt', 'original_verification', '/storage/fact/first_append_receipt_ref',
    'an issued original fact records the original first receipt', "v['orig_fact'].get('first_append_receipt_ref') != v['orig_x_receipt_ref']",
    when=("v['g_orig_payload'] is True", "v['orig_fact_errors'] == 0", "v['orig_fact'].get('phase') == 'issued'"), paths=DISP_PATHS)
row('frozen', 'frozen_fact_payload', 'original_verification', '/storage/fact/source_body/payload',
    'the original event payload is exactly the original fact source payload', "v['orig_payload_sha'] != v['orig_fact_payload_sha']",
    when=("v['g_orig_payload'] is True", "v['orig_fact_errors'] == 0"), paths=DISP_PATHS)
entailed('original_verified', 'original_verification', '/storage',
         'the shared dispatcher\'s frozen verifier accepts the authenticated original', "v['dispatch'] == 'original_verification'",
         G_DISP, DISP_PATHS,
         ['frozen_decodes', 'frozen_envelope_schema', 'frozen_envelope_numbers', 'frozen_observed_utc', 'frozen_persisted_utc',
          'frozen_payload_schema', 'frozen_payload_fullmatch', 'frozen_payload_numbers', 'frozen_event_identity', 'frozen_key',
          'frozen_full_value', 'frozen_producer', 'frozen_custody_event', 'frozen_receipt_event', 'frozen_receipt_schema', 'frozen_fact_schema',
          'frozen_fact_issued', 'frozen_fact_event', 'frozen_fact_receipt', 'frozen_fact_payload'],
         'The dispatcher reaches original_verification only through FrozenRecipe.verify_original (frozen_verifier). Its recipe '
         'key is the exact RecipeTuple the owner built from the sealed receipt and the installed map is keyed by that tuple, so '
         'original.recipe != expected_tuple never holds; it then returns False only when a FROZEN_ORDER component of '
         'frozen_components is not True. Each component is one or more frozen_* rows computed from the same authenticated bytes '
         '(decodes: frozen_decodes; envelope: frozen_envelope_schema/numbers; payload: frozen_payload_schema/fullmatch/numbers; '
         'storage_times: frozen_observed_utc/persisted_utc; event_identity; key; full_value; producer; custody_event: '
         'frozen_custody_event/receipt_event; receipt: frozen_receipt_schema; fact_event: frozen_fact_schema/event and, for an '
         'issued fact, frozen_fact_receipt; '
         'fact_payload: frozen_fact_payload), and those rows '
         'sit in earlier tables, so one of them always refuses first.')

# retry (CV-317 / SCS C6) -----------------------------------------------------------------------------------------------
G_RES = "v['g_resolved'] is True"
row('retry', 'retry_conflict', 'idempotency_conflict', '/event',
    'a retry of the same identity has the same CV-317 producer-semantic digest as the original (else idempotency_conflict)',
    "v['cand_producer_digest'] != v['orig_held'].get('producer_semantic_sha256')", when=G_RES, paths='retry')
row('retry', 'retry_comparison_recipe', 'retry_recipe', '/retry/comparison_recipe',
    'the retry comparison uses the CV-317 producer projection, which excludes Storage-assigned sequence and times',
    "v['retry'].get('comparison_recipe') != 'cv317.producer_semantic.cv1100'", when=G_RES, paths='retry')
row('retry', 'retry_returns_original', 'retry_result', '/retry/returned_receipt',
    'a retry returns the exact original first receipt without effect', "v['retry'].get('returned_receipt') != v['orig_receipt']",
    when=G_RES, paths='retry')
row('retry', 'retry_no_effect', 'retry_effect', '/retry/effects', 'a deduplicated retry performs no native or publication effect',
    "len(v['retry'].get('effects', [])) != 0", when=G_RES, paths='retry')

# retained history reader (passive) -----------------------------------------------------------------------------------
row('reader', 'reader_permission', 'read_permission', '/reader/permission', 'current read permission is revalidated on every read',
    "v['reader'].get('permission') != 'allow'", when=G_RES, paths='history')
row('reader', 'reader_deleted', 'project_deleted', '/reader/project_state', 'a deleted Project discloses nothing',
    "v['reader'].get('project_state') == 'deleted'", when=G_RES, paths='history')
row('reader', 'reader_hidden', 'project_hidden', '/reader/project_state', 'a hidden Project discloses nothing',
    "v['reader'].get('project_state') == 'hidden'", when=G_RES, paths='history')
row('reader', 'reader_hold', 'hold_protected', '/reader/disposition', 'a purge never bypasses a protecting hold',
    "v['reader'].get('disposition') == 'purge' and len(v['reader_holds']) != 0", when=G_RES, paths='history')
row('reader', 'reader_output', 'reader_output', '/reader/output_hex',
    'the reader returns exactly the authenticated original bytes (no reinterpretation under current rules)',
    "v['reader_output_sha'] != v['orig_sha']", when=G_RES, paths='history')
for _k in EFFECT_KINDS:
    row('effects', 'no_effect_' + _k, 'replay_effect', '/effects/' + _k,
        'a passive read, replay or rebuild performs no ' + _k + ' effect', "v['effects'].get('" + _k + "', 0) != 0",
        when="v['effects'] is not None and (v['g_resolved'] is True or v['g_ckr'] is True)", paths='history checkpoint')

# recovery of a source_committed fact (SP-1250..1268 source custody; SP-286 missing-original fence) ----------------------
G_REC = "v['g_source'] is True and v['recovery'] is not None"
row('recovery', 'recovery_fact_committed', 'source_phase', '/fact/phase', 'only a source_committed fact is recovered (an issued fact never changes)',
    "v['fact'].get('phase') != 'source_committed'", when=G_REC, paths='recovery')
row('recovery', 'recovery_identity', 'recovery_identity', '/event/event_id',
    'recovery resolves the original append identity recorded in this fact before any publication',
    "v['ev'].get('event_id') != v['fact'].get('event_id')", when=G_REC, paths='recovery')
row('recovery', 'recovery_cas_phase', 'source_phase_cas', '/recovery/proposed_phase', 'an issued original is published by CAS to issued',
    "v['recovery'].get('proposed_phase') != 'issued'", when=(G_REC, "v['g_resolved'] is True"), paths='recovery')
row('recovery', 'recovery_cas_receipt', 'source_phase_cas', '/recovery/proposed_receipt_ref',
    'the CAS uses exactly the resolved original first receipt ref', "v['recovery'].get('proposed_receipt_ref') != v['orig_x_receipt_ref']",
    when=(G_REC, "v['g_resolved'] is True"), paths='recovery')
row('recovery', 'recovery_fenced', 'original_unavailable', '/recovery/proposed_phase',
    'an unavailable original fences the fact (no restamp, no publication)', "v['recovery'].get('proposed_phase') != 'fenced'",
    when=(G_REC, "v['dispatch'] == 'original_unavailable'"), paths='recovery')
row('recovery', 'recovery_no_mint', 'original_unavailable', '/recovery/minted_receipt',
    'an unavailable original never mints a replacement first receipt', "v['recovery'].get('minted_receipt') is not None",
    when=(G_REC, "v['dispatch'] == 'original_unavailable'"), paths='recovery')
row('recovery', 'recovery_no_replacement_ack', 'older_restore', '/recovery/replacement_ack',
    'after an older backup restore, lost old work never gets a replacement acknowledgement',
    "v['recovery'].get('replacement_ack') is not None", when=G_REC, paths='recovery')
row('recovery', 'recovery_fresh_admitted', 'fresh_operation', '/recovery/fresh_operation_admission_ref',
    'a genuinely new post-restore operation needs its SP-286 fresh-operation admission',
    "v['recovery'].get('fresh_operation_admission_ref') is None", when=(G_REC, "v['recovery'].get('fresh_operation') is not None"),
    paths='recovery')
row('recovery', 'recovery_fresh_distinct', 'fresh_operation', '/recovery/fresh_operation',
    'a restored pending operation is never presented as fresh acceptance (the fresh operation is a new identity)',
    "v['recovery'].get('fresh_operation') == v['fact'].get('owner_operation_id')",
    when=(G_REC, "v['recovery'].get('fresh_operation') is not None"), paths='recovery')

# backup closure (SCS-014 / SP-286) -------------------------------------------------------------------------------------
G_BAK = "v['closure'] is not None"
row('backup', 'closure_fact', 'backup_closure', '/backup/closure/facts', 'the canonical source fact is in the backup closure',
    "v['x_closure'].get('fact_key') not in v['closure'].get('facts', [])", when=G_BAK, paths='backup')
row('backup', 'closure_event', 'backup_closure', '/backup/closure/events', 'the selected event bytes are in the backup closure',
    "v['x_closure'].get('event_id') not in v['closure'].get('events', [])", when=G_BAK, paths='backup')
row('backup', 'closure_packs', 'backup_closure', '/backup/closure/packs', 'every SP-337 pack the event or fact references is in the closure',
    "any([p not in v['closure'].get('packs', []) for p in v['x_closure'].get('packs', [])])", when=G_BAK, paths='backup')
row('backup', 'closure_receipt', 'backup_closure', '/backup/closure/receipts', 'the SP-286 first receipt is in the closure',
    "v['x_closure'].get('receipt_ref') not in v['closure'].get('receipts', [])", when=G_BAK, paths='backup')
row('backup', 'closure_native', 'backup_closure', '/backup/closure/native_refs',
    'every original native evidence ref and the owner result ref are in the closure',
    "any([r not in v['closure'].get('native_refs', []) for r in v['x_closure'].get('native_refs', [])])", when=G_BAK, paths='backup')

# filtered checkpoint (SP-278 / DL-076) ---------------------------------------------------------------------------------
G_CK = "v['g_ckr'] is True"
CK = 'checkpoint'
row('checkpoint', 'ck_present', 'checkpoint_schema', '/checkpoint/next', 'the checkpoint advance proposes one next checkpoint value',
    "v['g_ck'] is not True", when="v['known_family'] is True", paths=CK)
row('checkpoint', 'ck_schema', 'checkpoint_schema', '/checkpoint/next',
    'the next checkpoint passes the closed family checkpoint verdict (nine-field durable token; no persisted redb_snapshot_id)',
    "v['ck_errors'] != 0", when="v['g_ck'] is True", paths=CK)
row('checkpoint', 'ck_fullmatch', 'checkpoint_schema', '/checkpoint/next', 'every checkpoint identifier and hash matches in full',
    "v['ck_full_errors'] != 0", when="v['g_ck_schema'] is True", paths=CK)
row('checkpoint', 'ck_numbers', 'current_integer', '/checkpoint/next', 'every checkpoint integer slot is an exact current integer',
    "v['ck_int_ok'] is not True", when="v['g_ck_full'] is True", paths=CK)
row('checkpoint', 'ck_stored_schema', 'quarantine', '/checkpoint/stored', 'a malformed stored predecessor is quarantined, never advanced',
    "v['ck_stored_errors'] != 0", when=(G_CK, "v['ck_stored'] is not None"), paths=CK)
row('checkpoint', 'ck_key', 'checkpoint_key', '/checkpoint/key',
    'the checkpoint key is source_control_event.<family>.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}',
    "v['ck'].get('key') != v['x_ck_key']", when=G_CK, paths=CK)
row('checkpoint', 'ck_storage', 'checkpoint_identity', '/checkpoint/next/storage_instance_id', 'the checkpoint is in the actual Storage instance',
    "v['ck_next'].get('storage_instance_id') != v['owner_sid']", when=G_CK, paths=CK)
row('checkpoint', 'ck_project', 'checkpoint_identity', '/checkpoint/next/project_id', 'the checkpoint filters this Project',
    "v['ck_next'].get('project_id') != v['owner_project']", when=G_CK, paths=CK)
row('ck_token', 'ck_token_storage_instance_id', 'checkpoint_token', '/checkpoint/next/generic_token/storage_instance_id',
    'the durable token names the actual Storage instance', "v['ck_token'].get('storage_instance_id') != v['owner_sid']", when=G_CK, paths=CK)
row('ck_token', 'ck_token_checkpoint_key', 'checkpoint_token', '/checkpoint/next/generic_token/checkpoint_key',
    'the durable token names this family checkpoint key', "v['ck_token'].get('checkpoint_key') != v['x_ck_key']", when=G_CK, paths=CK)
for _f in TOKEN_FIELDS[2:]:
    row('ck_token', 'ck_token_' + _f, 'checkpoint_token', '/checkpoint/next/generic_token/' + _f,
        'the durable token ' + _f + ' is the actual current SP-278 publication value pinned at capture',
        "v['ck_token'].get('" + _f + "') != v['ck_pub'].get('" + _f + "')", when=G_CK, paths=CK)
row('ck_token', 'ck_selection_storage', 'checkpoint_token', '/checkpoint/next/generic_token/source_selection/storage_instance_id',
    'the token source selection names the actual Storage instance', "v['tf'].get('source_selection.storage_instance_id') != v['owner_sid']",
    when=G_CK, paths=CK)
entailed('ck_uint64', 'storage_uint64', '/checkpoint/next',
         'every Storage uint64 checkpoint slot (through_sequence_id, frontier_revision, segment/manifest generations, recovery_epoch) '
         'passes the shared storage_uint64', "len(v['ck_u64']) != 0", G_CK, CK, ['ck_schema', 'ck_numbers'],
         'Each of the five slots is declared in Plans/source_control_event_contracts.schema.json (or by its $ref to the SP-278 '
         'read_token frontier_revision) as type integer with minimum 0 and maximum 18446744073709551615, so ck_schema refuses '
         'every negative, oversized or non-integer value; ck_numbers (current_integer) refuses an integral float the stock '
         'integer type admits. storage_uint64 accepts exactly the exact integers 0..2^64-1, so after both rows hold it never refuses.')
row('ck_cover', 'ck_through', 'checkpoint_coverage', '/checkpoint/next/through_sequence_id',
    'through_sequence_id is the verified global source boundary (the publication frontier), never the maximum matching sequence',
    "v['ck_next'].get('through_sequence_id') != v['ck_pub'].get('frontier_revision')", when=G_CK, paths=CK)
row('ck_cover', 'ck_coverage', 'checkpoint_coverage', '/checkpoint/scanned',
    'the advance scanned every global index row through the frontier, including nonmatching rows and legal gaps',
    "v['ck_scanned'] != v['ck_index_seqs']", when=G_CK, paths=CK)
row('ck_cover', 'ck_last_event', 'checkpoint_coverage', '/checkpoint/next/last_event_id',
    'last_event_id is the last matching original (family, payload schema, Project), null for an empty filter',
    "v['ck_next'].get('last_event_id') != v['x_last_event_id']", when=G_CK, paths=CK)
row('ck_cover', 'ck_last_fact', 'checkpoint_coverage', '/checkpoint/next/last_source_fact_ref',
    'last_source_fact_ref is the last matching original fact ref, null for an empty filter',
    "v['ck_next'].get('last_source_fact_ref') != v['x_last_fact_ref']", when=G_CK, paths=CK)
G_PRED = (G_CK, "v['ck_stored'] is not None", "v['ck_stored_errors'] == 0")
row('ck_cas', 'ck_cas_token', 'checkpoint_cas', '/checkpoint/cas/token', 'the CAS predecessor token is the stored durable token',
    "v['ck_stored'].get('generic_token') != v['ck_cas'].get('token')", when=G_PRED, paths=CK)
for _f in ('through_sequence_id', 'last_event_id', 'last_source_fact_ref'):
    row('ck_cas', 'ck_cas_' + _f, 'checkpoint_cas', '/checkpoint/cas/' + _f, 'the CAS predecessor cursor ' + _f + ' is the stored value',
        "v['ck_stored'].get('" + _f + "') != v['ck_cas'].get('" + _f + "')", when=G_PRED, paths=CK)
row('ck_cas', 'ck_monotonic', 'checkpoint_cas', '/checkpoint/next/through_sequence_id', 'a cursor never moves backward or silently resets',
    "v['ck_next'].get('through_sequence_id') < v['ck_stored'].get('through_sequence_id')", when=G_PRED, paths=CK)
row('ck_commit', 'ck_current_bytes', 'checkpoint_current', '/checkpoint/live_current/current_bytes_sha256',
    'CURRENT is unchanged at commit (stale capture refuses)', "v['ck_live'].get('current_bytes_sha256') != "
    "v['pf'].get('source_selection.current_bytes_sha256')", when=G_CK, paths=CK)
row('ck_commit', 'ck_current_frontier', 'checkpoint_current', '/checkpoint/live_current/frontier_revision',
    'the live frontier is the captured frontier at commit', "v['ck_live'].get('frontier_revision') != v['ck_pub'].get('frontier_revision')",
    when=G_CK, paths=CK)
row('ck_commit', 'ck_atomic', 'checkpoint_atomic', '/checkpoint/single_transaction',
    'rows, cursor and token advance in one derived-redb transaction (no row-only or cursor-only publication)',
    "v['ck'].get('single_transaction') is not True", when=G_CK, paths=CK)
row('ck_commit', 'ck_read_authority', 'checkpoint_authority', '/checkpoint/read_authority', 'read authority is revalidated before commit',
    "v['ck'].get('read_authority') is not True", when=G_CK, paths=CK)
row('ck_commit', 'ck_rebuild_source', 'checkpoint_rebuild', '/checkpoint/rebuild_source',
    'rebuild reads retained canonical evidence only, never an unverified derived checkpoint as source authority',
    "v['ck'].get('rebuild_source') != 'canonical_retained'", when=G_CK, paths=CK)
row('ck_commit', 'ck_successor', 'withdrawal', '/checkpoint/successor', 'a successor reader publishes only after its full governed rebuild verified',
    "v['ck_successor'].get('verified') is not True", when=(G_CK, "v['ck_successor'] is not None"), paths=CK)

# native transitions (SCS C9): each conjunct of each family predicate is its own row over the native world ----------
# TRANSITION_PLAN maps a row to its family and plan transition index (reports/event-authority-20261105/W3B-oracle-plan.json).
TRANSITION_PLAN = {}
W_ = "v['world']"


def w(*keys):
    """Expression reading a world value at any depth through the flattened view (one lookup)."""
    return "v['wf'].get('" + '.'.join(keys) + "')"


def nat(k):
    return "v['native'].get('" + k + "')"


def req(*keys):
    return "v['rf'].get('" + '.'.join(keys) + "')"


def T(families, rid, idx, words, bad, when=()):
    fams = (families,) if isinstance(families, str) else tuple(families)
    when = (G_SRC,) + ((when,) if isinstance(when, str) else tuple(when))
    row('transition_' + fams[0].replace('.', '_'), rid, 'transition', '/owner/world', words, bad, when, 'append', fams)
    TRANSITION_PLAN[rid] = (fams, idx)


F = 'backend.detected'
_avail = w('setup_state', 'available')
T(F, 't_detect_set', 0, 'detected_backends is exactly the Git/Jujutsu set observed in the actual setup-state source',
  "set(v['native'].get('detected_backends', [])) != set(v['wf'].get('setup_state.observed_backends', []))",
  _avail + ' is True')
T(F, 't_detect_complete', 1, 'a complete setup-state observation is recorded as complete', nat('observation_state') + " != 'complete'",
  (_avail + ' is True', w('setup_state', 'complete') + ' is True'))
T(F, 't_detect_partial', 1, 'an incomplete setup-state observation is recorded as partial (never complete)', nat('observation_state') + " != 'partial'",
  (_avail + ' is True', w('setup_state', 'complete') + ' is False'))
T(F, 't_detect_unavailable', 2, 'an unavailable setup state is recorded as unavailable (an empty set is never substituted)',
  nat('observation_state') + " != 'unavailable'", _avail + ' is False')
T(F, 't_detect_host', 3, 'the observed setup-state Host is the committed (and accepted, by the request copy rows) execution Host',
  w('setup_state', 'host_id') + ' != ' + nat('execution_host_id'))
T(F, 't_detect_environment', 3, 'the observed setup-state Environment is the committed (and accepted) execution Environment',
  w('setup_state', 'environment_id') + ' != ' + nat('execution_environment_id'))
T(F, 't_detect_topology', 3, 'the observed topology generation is the accepted backend.detect topology generation',
  w('setup_state', 'topology_generation') + ' != ' + req('lineage', 'topology_generation'))

F = 'backend.selected'
T(F, 't_select_request', 0, 'selected_backend is the accepted request backend', nat('selected_backend') + ' != ' + req('scope', 'scm_backend'))
T(F, 't_select_effective', 0, 'selected_backend is the verified effective setup backend', nat('selected_backend') + ' != ' + w('selection', 'effective_backend'))
T(F, 't_select_result', 0, 'selected_backend is the original result backend', nat('selected_backend') + ' != ' + w('selection', 'result_backend'))
T(F, 't_select_previous', 1, 'previous_backend is the saved pre-selection value', nat('previous_backend') + ' != ' + w('selection', 'saved_previous_backend'))
T(F, 't_select_committed', 2, 'the selection is committed, never a presentation-only profile preview', w('selection', 'kind') + " != 'committed'")

F = 'checkpoint.created'
T(F, 't_ckc_id_request', 0, 'checkpoint_id is the create request checkpoint_id', nat('checkpoint_id') + ' != ' + req('scope', 'checkpoint_id'))
T(F, 't_ckc_id_saved', 0, 'checkpoint_id is the saved checkpoint id', nat('checkpoint_id') + ' != ' + w('checkpoint', 'checkpoint_id'))
T(F, 't_ckc_purpose', 0, 'the saved checkpoint purpose is the requested purpose', w('checkpoint', 'purpose') + ' != ' + req('scope', 'checkpoint_purpose'))
T(F, 't_ckc_generation_request', 0, 'checkpoint_generation is the request expected generation',
  nat('checkpoint_generation') + ' != ' + req('scope', 'expected_checkpoint_generation'))
T(F, 't_ckc_generation_saved', 0, 'checkpoint_generation is the saved checkpoint generation',
  nat('checkpoint_generation') + ' != ' + w('checkpoint', 'generation'))
T(F, 't_ckc_revision', 1, 'checkpoint_revision is the actual native saved revision', nat('checkpoint_revision') + ' != ' + w('checkpoint', 'native_revision'))
T(F, 't_ckc_backend_tag', 1, 'the saved revision carries the exact backend tag of scm_backend',
  "v['nf'].get('checkpoint_revision.kind') != " + nat('scm_backend'))
T(F, 't_ckc_durable', 2, 'the checkpoint exists durably before the created fact is published', w('checkpoint', 'durable') + ' is not True')

F = 'checkpoint.restored'
T(F, 't_ckr_ref_request', 0, 'checkpoint_ref is the accepted restore request checkpoint_ref', nat('checkpoint_ref') + ' != ' + req('scope', 'checkpoint_ref'))
T(F, 't_ckr_selected_id', 0, 'checkpoint_id is the selected checkpoint id', nat('checkpoint_id') + ' != ' + w('selected_checkpoint', 'checkpoint_id'))
T(F, 't_ckr_selected_ref', 0, 'checkpoint_ref resolves the selected checkpoint', nat('checkpoint_ref') + ' != ' + w('selected_checkpoint', 'checkpoint_ref'))
T(F, 't_ckr_generation_request', 0, 'checkpoint_generation is the request expected generation',
  nat('checkpoint_generation') + ' != ' + req('scope', 'expected_checkpoint_generation'))
T(F, 't_ckr_generation_saved', 0, 'checkpoint_generation is the selected checkpoint generation',
  nat('checkpoint_generation') + ' != ' + w('selected_checkpoint', 'generation'))
T(F, 't_ckr_after_observed', 2, 'after_revision is the independently observed restored revision, not an exit code',
  nat('after_revision') + ' != ' + w('observed_after_revision'))
T(F, 't_ckr_success', 2, 'the original receipt records a known successful restore', w('receipt', 'outcome') + " != 'succeeded'")
T(F, 't_ckr_receipt_ref', 2, 'operation_receipt_ref is the original restore receipt', nat('operation_receipt_ref') + ' != ' + w('receipt', 'receipt_ref'))

for _fam in REMOTE:
    _n = _fam.replace('.', '_')
    T(_fam, 't_rt_resolves_' + _n, 0, 'remote_target_ref resolves the original captured remote target',
      nat('remote_target_ref') + ' != ' + w('captured_target', 'target_ref'))
    T(_fam, 't_rt_repo_' + _n, 0, 'the captured target repository is the payload repository', w('captured_target', 'repo_id') + ' != ' + nat('repo_id'))
    T(_fam, 't_rt_revision_' + _n, 0, 'the captured target native revision is before_revision',
      w('captured_target', 'native_revision') + ' != ' + nat('before_revision'))
    T(_fam, 't_rt_captured_' + _n, 0, 'the target is the captured remote target record, never remote display text',
      w('captured_target', 'source') + " != 'captured_remote_target'")
    T(_fam, 't_dispatch_target_' + _n, 1, 'the actual dispatch target is the captured remote target',
      w('dispatch', 'target_ref') + ' != ' + nat('remote_target_ref'))
    T(_fam, 't_dispatch_writer_' + _n, 1, 'the dispatch writer lease is the frozen writer-lease evidence',
      w('dispatch', 'writer_lease_ref') + " != v['authority']['writer_lease'].get('evidence_ref')")
    T(_fam, 't_dispatch_credential_' + _n, 1, 'the dispatch credential lease is the frozen credential evidence',
      w('dispatch', 'credential_lease_ref') + " != v['authority']['credential'].get('evidence_ref')")
for _fam in ('remote.fetch_completed', 'remote.publish_completed', 'remote.sync_completed'):
    _n = _fam.replace('.', '_')
    T(_fam, 't_done_success_' + _n, 2, 'the original receipt records known success', w('receipt', 'outcome') + " != 'succeeded'")
    T(_fam, 't_done_receipt_ref_' + _n, 2, 'operation_receipt_ref is the original successful receipt',
      nat('operation_receipt_ref') + ' != ' + w('receipt', 'receipt_ref'))
    T(_fam, 't_done_after_receipt_' + _n, 2, 'the receipt proves the exact after revision', w('receipt', 'after_revision') + ' != ' + nat('after_revision'))
    T(_fam, 't_done_after_observed_' + _n, 2, 'native observation proves the exact after revision',
      w('observed_after_revision') + ' != ' + nat('after_revision'))
    T(_fam, 't_done_no_unresolved_' + _n, 2, 'no effect remains unresolved', "len(v['world'].get('unresolved_effects', [])) != 0")
T('remote.publish_completed', 't_fanout_all', 3, 'completion is all-target success; partial fan-out is never presented as success',
  "set(v['wf'].get('fanout.succeeded', [])) != set(v['wf'].get('fanout.targets', []))")
for _fam in ('remote.publish_started', 'remote.publish_completed'):
    T(_fam, 't_fanout_no_retry_' + _fam.replace('.', '_'), 3, 'partial fan-out is never automatically retried',
      w('fanout', 'auto_retry') + ' is not False')
for _fam in ('remote.sync_started', 'remote.sync_completed'):
    _n = _fam.replace('.', '_')
    _local = "v['src'].get('sync_variant') == 'local_reconcile_only'"
    _ti = 3 if _fam == 'remote.sync_started' else 3
    T(_fam, 't_sync_no_publish_' + _n, 3, 'local_reconcile_only performs no publication', w('publish_performed') + ' is not False', _local)
    T(_fam, 't_sync_no_push_' + _n, 3, 'local_reconcile_only has an empty push-target set', "len(v['world'].get('push_targets', [])) != 0", _local)
    T(_fam, 't_sync_strategy_' + _n, 4, 'the resolved strategy is the accepted v2 request strategy',
      w('resolved_strategy') + ' != ' + req('target', 'reconciliation_strategy'), _local)
    T(_fam, 't_sync_original_revision_' + _n, 4, 'the original revision is the accepted v2 original fetched revision',
      w('original_revision') + ' != ' + req('target', 'original_fetched_revision'), _local)
    T(_fam, 't_sync_fork_revision_' + _n, 4, 'the fork revision is the accepted v2 expected native revision',
      w('fork_revision') + ' != ' + req('target', 'expected_native_revision'), _local)

F = 'repository.bound'
for _f in ('project_id', 'repo_id', 'scm_backend', 'workspace_id'):
    T(F, 't_bind_' + _f, 0, 'the binding resolves the requested ' + _f, w('binding', _f) + ' != ' + nat(_f))
T(F, 't_bind_ref', 0, 'binding_ref is the actual binding record', nat('binding_ref') + ' != ' + w('binding', 'binding_ref'))
T(F, 't_bind_generation', 0, 'binding_generation is the actual binding generation', nat('binding_generation') + ' != ' + w('binding', 'generation'))
T(F, 't_bind_forge', 0, 'the independent forge binding is the requested forge binding', w('binding', 'forge_binding') + ' != ' + req('scope', 'forge_binding'))
T(F, 't_bind_revision', 1, 'native_revision is the verified existing checkout, never a path or remote-name guess',
  nat('native_revision') + ' != ' + w('verified_checkout_revision'))
T(F, 't_bind_no_conflict', 2, 'a conflicting existing binding refuses without overwrite',
  w('existing_binding_ref') + ' is not None and ' + w('existing_binding_ref') + ' != ' + nat('binding_ref'))

F = 'repository.unbound'
for _f, _n in (('binding_ref', 'binding_ref'), ('project_id', 'project_id'), ('repo_id', 'repo_id'), ('workspace_id', 'workspace_id'),
               ('generation', 'binding_generation')):
    T(F, 't_unbind_' + _f, 0, 'the removed binding is the captured pre-removal binding (' + _f + ')',
      w('captured_binding', _f) + ' != ' + nat(_n))
T(F, 't_unbind_settled', 1, 'dependency and active-work disposition is actually settled', w('disposition', 'settled') + ' is not True')
T(F, 't_unbind_disposition_ref', 1, 'disposition_receipt_ref is the original disposition receipt',
  nat('disposition_receipt_ref') + ' != ' + w('disposition', 'receipt_ref'))
T(F, 't_unbind_only_selected', 2, 'only the selected binding is removed', w('removed_bindings') + " != [" + nat('binding_ref') + "]")
T(F, 't_unbind_no_native_deletion', 2, 'native repository bytes are never inferred deleted', w('inferred_native_deletion') + ' is not False')

F = 'status.refreshed'
T(F, 't_status_snapshot', 0, 'status_snapshot_ref is the original bounded native status result', nat('status_snapshot_ref') + ' != ' + w('status_result', 'snapshot_ref'))
T(F, 't_status_repo', 0, 'the status result is for this repository', w('status_result', 'repo_id') + ' != ' + nat('repo_id'))
T(F, 't_status_workspace', 0, 'the status result is for this workspace', w('status_result', 'workspace_id') + ' != ' + nat('workspace_id'))
T(F, 't_status_state', 1, 'observation_state is the actual observation completeness', nat('observation_state') + ' != ' + w('status_result', 'observation_state'))
T(F, 't_status_revision', 1, 'native_revision is the actual observed revision', nat('native_revision') + ' != ' + w('status_result', 'native_revision'))
for _f in ('executed_hooks', 'executed_filters', 'jj_snapshot'):
    T(F, 't_status_no_' + _f, 2, 'a read-only observation did not run ' + _f.replace('_', ' '), w('status_result', _f) + ' is not False')

F = 'workspace.created'
T(F, 't_wc_requested', 0, 'created_workspace_id is the requested_workspace_id', nat('created_workspace_id') + ' != ' + req('scope', 'requested_workspace_id'))
T(F, 't_wc_observed', 0, 'created_workspace_id is the observed native workspace', nat('created_workspace_id') + ' != ' + w('observed_workspace_id'))
T(F, 't_wc_plan_destination', 1, 'the conflict plan admits that exact destination', w('conflict_plan', 'destination') + ' != ' + nat('created_workspace_id'))
T(F, 't_wc_plan_admitted', 1, 'the conflict plan was admitted', w('conflict_plan', 'admitted') + ' is not True')
T(F, 't_wc_success', 2, 'the original receipt proves known successful creation', w('receipt', 'outcome') + " != 'succeeded'")
T(F, 't_wc_receipt_ref', 2, 'operation_receipt_ref is the original creation receipt', nat('operation_receipt_ref') + ' != ' + w('receipt', 'receipt_ref'))

F = 'workspace.opened'
T(F, 't_wo_requested', 0, 'opened_workspace_id is the existing requested workspace (the request copy row joins workspace_id to the request)',
  nat('opened_workspace_id') + ' != ' + nat('workspace_id'))
T(F, 't_wo_result', 0, 'opened_workspace_id is the original open result workspace', nat('opened_workspace_id') + ' != ' + w('open_result', 'workspace_id'))
T(F, 't_wo_result_ref', 0, 'open_result_ref is the original open result', nat('open_result_ref') + ' != ' + w('open_result', 'result_ref'))
T(F, 't_wo_revision', 1, 'native_revision is actual read evidence', nat('native_revision') + ' != ' + w('read', 'native_revision'))
T(F, 't_wo_backend', 1, 'the backend is actual read evidence', nat('scm_backend') + ' != ' + w('read', 'backend'))
T(F, 't_wo_current', 1, 'currentness is actual read evidence', w('read', 'current') + ' is not True')
T(F, 't_wo_kind', 2, 'open is never substituted for workspace.switch or creation', w('open_result', 'operation_kind') + " != 'open'")

F = 'workspace.removed'
T(F, 't_wr_requested', 0, 'removed_workspace_id is the exact original requested workspace (joined to the request by its copy row)',
  nat('removed_workspace_id') + ' != ' + nat('workspace_id'))
T(F, 't_wr_result', 0, 'removed_workspace_id is the native removal result', nat('removed_workspace_id') + ' != ' + w('removal_result', 'workspace_id'))
for _f in ('ownership', 'dependency', 'active_work', 'data_disposition'):
    T(F, 't_wr_' + _f, 1, 'the ' + _f.replace('_', ' ') + ' check is independently settled', w('checks', _f) + " != 'settled'")
T(F, 't_wr_native', 2, 'the receipt records native removal, not merely unbinding', w('removal_result', 'kind') + " != 'native_removal'")
T(F, 't_wr_no_expiry_cleanup', 2, 'cleanup is never inferred from expiry', w('removal_result', 'cleanup_inferred_from_expiry') + ' is not False')
T(F, 't_wr_receipt_ref', 2, 'operation_receipt_ref is the original removal receipt', nat('operation_receipt_ref') + ' != ' + w('receipt', 'receipt_ref'))
T(F, 't_wr_disposition_ref', 1, 'disposition_receipt_ref is the original disposition receipt',
  nat('disposition_receipt_ref') + ' != ' + w('disposition_receipt_ref'))

F = 'workspace.switched'
T(F, 't_ws_requested', 0, 'selected_workspace_id is the original requested workspace (joined to the request by its copy row)',
  nat('selected_workspace_id') + ' != ' + nat('workspace_id'))
T(F, 't_ws_observed', 0, 'selected_workspace_id is the observed switch result', nat('selected_workspace_id') + ' != ' + w('switch_result', 'selected_workspace_id'))
T(F, 't_ws_previous', 1, 'previous_workspace_id is the captured actual selection', nat('previous_workspace_id') + ' != ' + w('captured_selection', 'workspace_id'))
T(F, 't_ws_previous_captured', 1, 'the previous selection is captured, never current UI focus', w('captured_selection', 'source') + " != 'captured_selection'")
T(F, 't_ws_dispatch', 2, 'compatibility select_worktree normalizes before exactly one canonical workspace.switch dispatch',
  w('dispatch_log') + " != ['cmd.source_control.workspace.switch']")
T(F, 't_ws_receipt_ref', 2, 'operation_receipt_ref is the original switch receipt', nat('operation_receipt_ref') + ' != ' + w('receipt', 'receipt_ref'))

F = 'writer_lease.granted'
for _f, _n in (('repo_id', 'repo_id'), ('workspace_id', 'workspace_id'), ('scm_backend', 'scm_backend'), ('holder_ref', 'holder_ref'),
               ('generation', 'lease_generation'), ('epoch', 'lease_epoch'), ('lease_id', 'lease_id'), ('lease_ref', 'lease_ref')):
    T(F, 't_lg_' + _f, 0, 'the actual writer lease ' + _f + ' is the fact ' + _n, w('lease', _f) + ' != ' + nat(_n))
T(F, 't_lg_no_competitor', 1, 'no competing active writer exists', "len(v['world'].get('competing_active_writers', [])) != 0")
T(F, 't_lg_reconciled', 1, 'a grant after reconciliation requires clean previous reconciliation',
  nat('prior_state') + " == 'reconciled' and " + w('previous_reconciliation') + " != 'clean'")
T(F, 't_lg_owner_verified', 2, 'acquired/expiry times and currentness are verified by the lease owner, not payload authority',
  w('lease', 'verified_by') + " != 'lease_owner'")
T(F, 't_lg_current', 2, 'the lease owner verified the grant is current', w('lease', 'current') + ' is not True')

F = 'writer_lease.lost'
for _f, _n in (('holder_ref', 'holder_ref'), ('generation', 'lease_generation'), ('epoch', 'lease_epoch'), ('lease_id', 'lease_id')):
    T(F, 't_ll_' + _f, 0, 'the prior active lease ' + _f + ' is the fact ' + _n, w('prior_lease', _f) + ' != ' + nat(_n))
T(F, 't_ll_prior_active', 0, 'the prior lease was active', w('prior_lease', 'state') + " != 'active'")
T(F, 't_ll_after_state', 0, 'the resulting non-authorizing state is the lease owner\'s state', w('lease_after', 'state') + ' != ' + nat('state'))
T(F, 't_ll_fenced', 1, 'further mutation is fenced before effect after loss', w('mutation_fenced') + ' is not True')
T(F, 't_ll_no_clean_on_expiry', 2, 'expiry or revocation never becomes clean reconciliation',
  nat('state') + " in ('expired_pending_reconciliation', 'revoked') and " + nat('reconciliation_state') + " == 'clean'")
T(F, 't_ll_no_removal_proof', 2, 'expiry or revocation is never proof of removed resources', w('removal_proven_by_expiry') + ' is not False')


# ---------------------------------------------------------------------------------------------
# Tables: rows grouped in specification order, at most eight per table; an entailed row sits alone.
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
ROW_BY_ID = {r['id']: r for r in ROWS}


def table_inputs(table):
    keys = set()
    for r in TABLE_ROWS[table]:
        keys.update(r['reads'])
    return tuple(sorted(keys))


@lru_cache(maxsize=None)
def table_module(table):
    return importlib.import_module(TABLE_PREFIX + table)


def project(facts, table):
    """The table's value: exactly the derived keys its predicates read (a missing key is a checker error)."""
    return {k: facts[k] for k in table_module(table).INPUTS}


def table_refusals(table, facts):
    """The table's generated predicates evaluated directly, in table order: (value, [(row, code), ...])."""
    module = table_module(table)
    value = project(facts, table)
    refused = []
    for name in module.FIELDS:
        code = getattr(module, name)(value, None)
        if code is not None:
            refused.append((name, code))
    return value, refused


def evaluate(c):
    """(first refusal (row, code) or None, every refusing row, errors). Exceptions are checker errors."""
    errors = []
    with exact_digits():
        try:
            facts = derive(c)
        except CAUGHT + (Refusal,) as exc:
            return None, [], [('derive', type(exc).__name__ + ': ' + str(exc)[:200])]
        first, failing = None, []
        for table in TABLES:
            try:
                _, refused = table_refusals(table, facts)
            except CAUGHT as exc:
                errors.append((table, type(exc).__name__ + ': ' + str(exc)[:200]))
                continue
            for name, code in refused:
                failing.append(name)
                if first is None:
                    first = (name, code)
    return first, failing, errors


def judge(case, first, failing, errors):
    """A positive refuses nowhere; a negative refuses first at exactly its row, and every other refusing row is
    entailed with a proof naming that first row."""
    if errors:
        return 'checker_error: ' + json.dumps(errors)[:400]
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
def _part(p):
    return p.replace('~1', '/').replace('~0', '~')


def apply_change(target, pointer, op, value=None):
    parts = [_part(p) for p in pointer.split('/')[1:]]
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


def cases():
    """(case id, complete scenario, case record) for every positive and negative, in a fixed order."""
    fx = load(FIXTURES)
    bases = {c['id']: c for c in fx['positives']}
    for c in fx['positives']:
        yield c['id'], c['scenario'], c
    for n in fx['negatives']:
        yield n['id'], mutate(bases[n['base']]['scenario'], n['changes']), n


def run_all(progress=None, extra=(), fail_fast=False):
    counts = dict(cases=0, positives=0, negatives=0, errors=0)
    findings, firsts = [], {}
    STORE_CHECKS['reads'] = STORE_CHECKS['changed'] = 0
    stream = list(cases()) + list(extra)
    for number, (cid, scenario, case) in enumerate(stream):
        counts['cases'] += 1
        counts['positives' if case.get('expect') == 'accept' else 'negatives'] += 1
        first, failing, errors = evaluate(scenario)
        verdict = judge(case, first, failing, errors)
        if verdict:
            counts['errors'] += 1
            findings.append({'case': cid, 'verdict': verdict})
            if fail_fast:
                break
        if first:
            firsts[first[0]] = firsts.get(first[0], 0) + 1
        if progress and number % 1000 == 0:
            progress(number)
    return counts, findings, firsts


def long_integer_cases():
    """In-memory cases (a JSON text with a 4,400-digit integer is unreadable to Python's default parser, which
    the shared date-time inventory gate uses): 2**64 and 10**4399 at payload slots, as an extra member and at a
    wrongly typed field, at sequence_id, and at a checkpoint uint64 slot. Each must refuse with a code."""
    fx = load(FIXTURES)
    out = []
    for c in fx['positives']:
        s = c['scenario']
        if c.get('long_integer_base') is not True:
            continue
        int_slot = c.get('payload_int_slot')
        for label, big in (('2p64', 2 ** 64), ('10p4399', 10 ** 4399)):
            if s['path'] in ('append', 'retry'):
                if int_slot:
                    out.append(_long(c, label + '-payload-slot-' + int_slot, [('/event/payload/' + int_slot, 'set', big)],
                                     'producer_route', 'producer_route'))
                out.append(_long(c, label + '-payload-extra-member', [('/event/payload/x_extra', 'set', big)],
                                 'payload_schema', 'payload_schema'))
                out.append(_long(c, label + '-payload-wrong-type', [('/event/payload/source_location_id', 'set', big)],
                                 'payload_schema', 'payload_schema'))
                out.append(_long(c, label + '-sequence-id', [('/event/sequence_id', 'set', big)], 'sequence_u64', 'storage_uint64'))
            if s['path'] == 'checkpoint':
                out.append(_long(c, label + '-through-sequence', [('/checkpoint/next/through_sequence_id', 'set', big)],
                                 'ck_schema', 'checkpoint_schema'))
                out.append(_long(c, label + '-frontier-revision', [('/checkpoint/next/generic_token/frontier_revision', 'set', big)],
                                 'ck_schema', 'checkpoint_schema'))
    return out


def _long(c, label, changes, rowid, code):
    case = {'id': c['id'] + '/neg/long-' + label, 'base': c['id'], 'changes': changes, 'expect': {'row': rowid, 'code': code}}
    return case['id'], mutate(c['scenario'], changes), case


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--json', type=Path)
    parser.add_argument('--limit-findings', type=int, default=40)
    parser.add_argument('--fail-fast', action='store_true', help='stop at the first judged error (mutation proof)')
    args = parser.parse_args(argv)
    extra = long_integer_cases()
    counts, findings, firsts = run_all(extra=extra, fail_fast=args.fail_fast)
    if STORE_CHECKS['changed']:
        findings.append({'case': '*', 'verdict': 'sealed store changed while reading: ' + str(STORE_CHECKS['changed'])})
    unwitnessed = sorted([r['id'] for r in ROWS if r['id'] not in firsts and r['id'] not in ENTAILED])
    store_ok = STORE_CHECKS['changed'] == 0 and STORE_CHECKS['reads'] > 0
    status = 'pass' if not findings and not unwitnessed and store_ok else 'fail'
    report = {'status': status, 'counts': counts, 'rows': len(ROWS), 'tables': len(TABLES), 'entailed': sorted(ENTAILED),
              'unwitnessed_rows': unwitnessed, 'first_refusals': dict(sorted(firsts.items())),
              'long_integer_cases': len(extra), 'sealed_store_reads': STORE_CHECKS['reads'],
              'sealed_store_changed_by_read': STORE_CHECKS['changed'],
              'findings': findings[:args.limit_findings], 'finding_count': len(findings)}
    if args.json:
        args.json.write_text(json.dumps(report, indent=2, sort_keys=True) + '\n')
    print(json.dumps({k: report[k] for k in ('status', 'counts', 'rows', 'tables', 'unwitnessed_rows', 'finding_count',
                                             'long_integer_cases', 'sealed_store_reads', 'sealed_store_changed_by_read')},
                     indent=2, sort_keys=True))
    for f in findings[:args.limit_findings]:
        print(json.dumps(f))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())

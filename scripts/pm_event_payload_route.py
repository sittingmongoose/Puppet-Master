"""DL-270 governed EventRecord 3.0.0 body route; synthetic contract oracle only."""
from __future__ import annotations
import copy
import json
from functools import lru_cache
from pathlib import Path
from urllib.parse import urljoin
from jsonschema import Draft202012Validator
from pm_contract_formats import FormatChecker
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
from pm_ds_tables import Facts, entry as _ds_entry
from pm_home_layout_v2_slot_receipt import (
    Home4Validator as StrictValidator, blake3_hex, producer_jcs_ok, ref_closure, refuse_remote,
    storage_uint64_fields_ok,
)
from pm_event_numbers import EVENT_VALUE, Refusal, decode_storage_value, storage_value_bytes


def canonical_msgpack(value):
    """SP-236/SP-1100 EventRecord physical bytes (the shared EVENT_VALUE profile); raises Refusal."""
    return storage_value_bytes(value, profile=EVENT_VALUE)


def physical_size(value):
    """Encoded EVENT_VALUE size, or None when the physical route is unavailable for this value."""
    try:
        return len(canonical_msgpack(value))
    except Refusal:
        return None

INLINE_LIMIT = 16384
MEDIA = 'application/msgpack'
ADOPTED = {'browser.workspace.created', 'browser.workspace.reset', 'workspace.layout_changed'}
ROOT = Path(__file__).resolve().parents[1]

@lru_cache(maxsize=4)
def schema_registry(root=ROOT):
    resources = []
    for path in (root / 'Plans').rglob('*.schema.json'):
        doc = json.loads(path.read_text())
        if '$id' not in doc:
            continue
        res = Resource(contents=doc, specification=DRAFT202012)
        for uri in (doc['$id'], 'https://puppetmaster.local/' + str(path.relative_to(root))):
            resources.append((uri, res))
    return Registry(retrieve=refuse_remote).with_resources(resources).crawl()

_eager_done = set()

@_ds_entry
def eager(registry, *schemas):
    for schema in schemas:
        key = json.dumps(schema, sort_keys=True)
        if key in _eager_done:
            continue
        Draft202012Validator.check_schema(schema)
        reg = registry.with_resource(schema['$id'], Resource(contents=schema, specification=DRAFT202012)).crawl()
        _, _, unresolved = ref_closure(reg, schema['$id'])
        closure = Facts('route_schema_closure', chain=True)
        if closure.stop('RS01_refs_resolved', lambda: not unresolved):
            raise ValueError('unresolved_schema_ref: ' + '; '.join(unresolved))
        closure.done()
        _eager_done.add(key)

def validator(schema, root=ROOT):
    return _validator(json.dumps(schema, sort_keys=True), root)

@lru_cache(maxsize=32)
def _validator(encoded, root):
    schema = json.loads(encoded)
    reg = schema_registry(root)
    eager(reg, schema)
    return StrictValidator(schema, registry=reg, format_checker=FormatChecker())

def encode(event, store):
    """Freeze one exact representation before append; store maps BLAKE3 to (media, bytes)."""
    event = copy.deepcopy(event)
    event['schema_version'] = '3.0.0'
    # Integer slots are admitted by the schema's CV-1100 integer rule before append;
    # EVENT_VALUE keeps a float's type and bytes (SP-1100). An unencodable body raises Refusal.
    data = canonical_msgpack(event['payload'])
    if len(data) > INLINE_LIMIT:
        ident = blake3_hex(data)
        store[ident] = (MEDIA, data)
        event['payload_ref'] = {'blake3_id': ident, 'byte_size': len(data), 'media_type': MEDIA}
        event['payload'] = None
    else:
        event['payload_ref'] = None
    return event


@_ds_entry
def resolved_body(event, store=None, *, historical=False):
    """No reference text is evidence of object resolution. Does not mutate retained bytes."""
    entry_facts = Facts('route_entry', chain=True)
    if entry_facts.stop('RE01_historical_bool', lambda: type(historical) is bool):
        return None, [entry_facts.first_code()]
    if entry_facts.stop('RE02_event_object', lambda: isinstance(event, dict)):
        return None, [entry_facts.first_code()]
    entry_facts.done()
    version = event.get('schema_version')
    if version != '3.0.0':
        body = event.get('payload')
        legacy = Facts('route_legacy', chain=True)
        for row, check in (
                ('RL01_successor_not_required', lambda: historical or event.get('event_type') not in ADOPTED),
                ('RL02_no_legacy_ref', lambda: event.get('payload_ref') is None),
                ('RL03_body_object', lambda: isinstance(body, dict)),
                ('RL03A_body_encodable', lambda: historical or physical_size(body) is not None)):
            if legacy.stop(row, check):
                return None, [legacy.first_code()]
        if legacy.stop('RL04_inline_limit', lambda: historical or physical_size(body) <= INLINE_LIMIT):
            return body, [legacy.first_code()]
        legacy.done()
        return body, []
    body, ref = event.get('payload'), event.get('payload_ref')
    if ref is None:
        inline = Facts('route_inline', chain=True)
        if inline.stop('RI01_body_object', lambda: isinstance(body, dict)):
            return None, [inline.first_code()]
        if inline.stop('RI01A_body_encodable', lambda: physical_size(body) is not None):
            return None, [inline.first_code()]
        if inline.stop('RI02_inline_limit', lambda: physical_size(body) <= INLINE_LIMIT):
            return body, [inline.first_code()]
        inline.done()
        return body, []
    ref_schema = json.loads((ROOT / 'Plans/event_record_v3.schema.json').read_text())['$defs']['payload_store_ref']
    found = {}

    def present():
        found['entry'] = (store or {}).get(ref['blake3_id'])
        return found['entry'] is not None

    reference = Facts('route_reference', chain=True)
    for row, check in (
            ('RF01_body_null', lambda: body is None),
            ('RF02_ref_object', lambda: isinstance(ref, dict)),
            ('RF03_ref_schema', lambda: StrictValidator(ref_schema).is_valid(ref)),
            ('RF04_store_mapping', lambda: store is None or isinstance(store, dict)),
            ('RF05_object_present', present),
            ('RF06_entry_pair', lambda: isinstance(found['entry'], (tuple, list)) and len(found['entry']) == 2),
            ('RF07_entry_media_type', lambda: type(found['entry'][0]) is str),
            ('RF08_entry_bytes_type', lambda: type(found['entry'][1]) is bytes)):
        if reference.stop(row, check):
            return None, [reference.first_code()]
    reference.done()
    media, data = found['entry']
    claims = Facts('route_reference_claims')
    claims['RC01_media'] = media == ref['media_type']
    claims['RC02_size'] = len(data) == ref['byte_size']
    claims['RC03_hash'] = blake3_hex(data) == ref['blake3_id']
    errors = claims.codes()
    decoded = {}

    def canonical():
        try:
            decoded['body'] = decode_storage_value(data, profile=EVENT_VALUE)
        except Refusal:
            return False
        return True

    decoding = Facts('route_reference_decode', chain=True)
    if decoding.stop('RD01_canonical_encoding', canonical):
        return None, errors + [decoding.first_code()]
    if decoding.stop('RD02_body_object', lambda: isinstance(decoded['body'], dict)):
        return None, errors + [decoding.first_code()]
    decoding.done()
    return decoded['body'], errors

def resolved_event(event, store=None, *, historical=False):
    body, errors = resolved_body(event, store, historical=historical)
    return {**event, 'payload': body}, errors

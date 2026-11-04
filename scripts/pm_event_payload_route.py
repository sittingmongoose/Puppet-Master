"""DL-270 governed EventRecord 3.0.0 body route; synthetic contract oracle only."""
from __future__ import annotations
import copy
import json
from functools import lru_cache
from pathlib import Path
from urllib.parse import urljoin
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
from pm_home_layout_v2_slot_receipt import (
    Home4Validator as StrictValidator, canonical_msgpack, decode_canonical_msgpack,
    blake3_hex, ref_closure, refuse_remote,
)

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

def eager(registry, *schemas):
    for schema in schemas:
        key = json.dumps(schema, sort_keys=True)
        if key in _eager_done:
            continue
        Draft202012Validator.check_schema(schema)
        reg = registry.with_resource(schema['$id'], Resource(contents=schema, specification=DRAFT202012)).crawl()
        _, _, unresolved = ref_closure(reg, schema['$id'])
        if unresolved:
            raise ValueError('unresolved_schema_ref: ' + '; '.join(unresolved))
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
    data = canonical_msgpack(event['payload'])
    if len(data) > INLINE_LIMIT:
        ident = blake3_hex(data)
        store[ident] = (MEDIA, data)
        event['payload_ref'] = {'blake3_id': ident, 'byte_size': len(data), 'media_type': MEDIA}
        event['payload'] = None
    else:
        event['payload_ref'] = None
    return event

def resolved_body(event, store=None, *, historical=False):
    """No reference text is evidence of object resolution. Does not mutate retained bytes."""
    errors = []
    version = event.get('schema_version')
    if version != '3.0.0':
        if not historical and event.get('event_type') in ADOPTED:
            return None, ['envelope_successor_required']
        body = event.get('payload')
        if event.get('payload_ref') is not None:
            return None, ['legacy_payload_ref_not_reinterpreted']
        if not isinstance(body, dict):
            return None, ['payload_schema']
        if not historical and len(canonical_msgpack(body)) > INLINE_LIMIT:
            errors.append('payload_byte_limit')
        return body, errors
    body, ref = event.get('payload'), event.get('payload_ref')
    if ref is None:
        if not isinstance(body, dict):
            return None, ['payload_representation']
        if len(canonical_msgpack(body)) > INLINE_LIMIT:
            errors.append('payload_byte_limit')
        return body, errors
    if body is not None or not isinstance(ref, dict):
        return None, ['payload_representation']
    ref_schema = json.loads((ROOT / 'Plans/event_record_v3.schema.json').read_text())['$defs']['payload_store_ref']
    if not StrictValidator(ref_schema).is_valid(ref):
        return None, ['payload_reference_schema']
    entry = (store or {}).get(ref['blake3_id'])
    if entry is None:
        return None, ['payload_reference_missing']
    media, data = entry
    if media != ref['media_type']:
        errors.append('payload_reference_media')
    if len(data) != ref['byte_size']:
        errors.append('payload_reference_size')
    if blake3_hex(data) != ref['blake3_id']:
        errors.append('payload_reference_hash')
    try:
        body = decode_canonical_msgpack(data)
    except (ValueError, UnicodeError):
        return None, errors + ['payload_reference_encoding']
    if not isinstance(body, dict):
        return None, errors + ['payload_schema']
    return body, errors

def resolved_event(event, store=None, *, historical=False):
    body, errors = resolved_body(event, store, historical=historical)
    return {**event, 'payload': body}, errors

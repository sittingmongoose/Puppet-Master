"""Offline registered-payload dispatch for complete SP-278 source scans.

This validates retained originals, not an upgraded consumer view or admission.
The historical pointers below are the exact Storage event-specific v1 reader
table (storage-plan.md, "Event-specific v1 reader to v2 writer bindings").
Merely finding a $defs member never makes it a supported historical reader.
"""
from functools import lru_cache
import re
from urllib.parse import unquote
from jsonschema import Draft202012Validator
from jsonschema.exceptions import SchemaError, ValidationError
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012
import pm_dcw_event_oracles as m
HISTORICAL = {name: dict(path='Plans/event_payload_' + name.replace('.', '_') + '.schema.json', json_pointer='#/$defs/' + name.replace('.', '_') + '_1_0_0_compatibility_reader', schema_id='https://puppetmaster.local/schemas/event_payloads/' + name.replace('.', '_') + '/1.0.0') for name in ('platform.capability_evaluated', 'restore_point.corrupt', 'run.started', 'safe_point.recovery_unavailable', 'storage.boot_recovery', 'storage.integrity_detected', 'storage.recovery_applied')}

def pointer(document, fragment):
    m.guard_rows.enforce('R001', {'site': 'R001', 'code': 'registered_schema_pointer', 'v0': fragment})
    m.guard_rows.enforce('R002', {'site': 'R002', 'code': 'registered_schema_pointer', 'v0': fragment, 'v1': fragment.startswith('#/')})
    try:
        value = document
        for token in unquote(fragment[2:]).split('/') if fragment != '#' else ():
            m.guard_rows.enforce('R003', {'site': 'R003', 'code': 'registered_schema_pointer', 'v0': 'matched' if re.search('~(?![01])', token) is not None else None})
            token = token.replace('~1', '/').replace('~0', '~')
            if isinstance(value, list):
                if re.fullmatch('0|[1-9][0-9]*', token) is None:
                    raise ValueError('invalid array index')
                value = value[int(token)]
            else:
                value = value[token]
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        m.guard_rows.enforce('RE001', {'site': 'RE001', 'code': 'registered_schema_pointer', 'v0': 'refused'})
    else:
        m.guard_rows.enforce('RE001', {'site': 'RE001', 'code': 'registered_schema_pointer', 'v0': None})
    return value

def document_at(path):
    try:
        result = m.load(path)
    except (OSError, TypeError, ValueError) as exc:
        m.guard_rows.enforce('RE002', {'site': 'RE002', 'code': 'registered_schema_path', 'v0': 'refused'})
    else:
        m.guard_rows.enforce('RE002', {'site': 'RE002', 'code': 'registered_schema_path', 'v0': None})
    return result

@lru_cache(maxsize=8)
def catalog(loader):
    """Local schema resources only; referencing's network retrieval stays disabled.

    The loader is part of the cache key so full-checker input mutations cannot
    reuse a previously validated closure. Cataloguing does not validate unrelated
    documents. Only the selected document and its reference closure are checked.
    """
    resources = []
    for path in sorted((m.ROOT / 'Plans').rglob('*.schema.json')):
        schema = loader(str(path.relative_to(m.ROOT)))
        if isinstance(schema, dict) and '$id' in schema:
            resources.append((schema['$id'], Resource.from_contents(schema, default_specification=DRAFT202012)))
    return Registry().with_resources(resources).crawl()

def reference_closure(document, registry):
    """Eagerly check every branch, including full external documents and cycles."""
    seen = set()

    def visit(value, resolver):
        if not isinstance(value, (dict, list)) or id(value) in seen:
            return
        seen.add(id(value))
        if isinstance(value, dict):
            resolver = resolver.in_subresource(Resource.from_contents(value, default_specification=DRAFT202012))
            if '$ref' in value:
                try:
                    target = resolver.lookup(value['$ref'])
                    if not value['$ref'].startswith('#'):
                        root = resolver.lookup(value['$ref'].split('#', 1)[0])
                        Draft202012Validator.check_schema(root.contents)
                        visit(root.contents, root.resolver)
                    visit(target.contents, target.resolver)
                except (Unresolvable, SchemaError) as exc:
                    m.guard_rows.enforce('RE003', {'site': 'RE003', 'code': 'registered_schema_ref', 'v0': 'refused'})
                else:
                    m.guard_rows.enforce('RE003', {'site': 'RE003', 'code': 'registered_schema_ref', 'v0': None})
            for child in value.values():
                visit(child, resolver)
        else:
            for child in value:
                visit(child, resolver)
    visit(document, registry.resolver(document['$id']))

def validate_registered(owner, event):
    m.guard_rows.enforce('R004', {'site': 'R004', 'code': 'index_source_dispatch', 'v0': owner})
    editions = owner.get('payload_versions')
    if editions:
        edition = next((v for v in editions if v['scope_kind'] == event['scope_kind'] and v['payload_schema_id'] == event['payload_schema_id']), None)
        m.guard_rows.enforce('R005', {'site': 'R005', 'code': 'index_source_dispatch', 'v0': edition})
    else:
        edition = owner
    ref = edition.get('payload_schema_ref')
    expected_id = edition['payload_schema_id']
    historical = HISTORICAL.get(owner['event_type'])
    if historical and event['payload_schema_id'] == historical['schema_id']:
        ref = historical
        expected_id = historical['schema_id']
    m.guard_rows.enforce('R006', {'site': 'R006', 'code': 'index_source_dispatch', 'v0': event['payload_schema_id'], 'v1': expected_id})
    if ref is None:
        document = edition['payload_schema']
        schema = document
    else:
        m.guard_rows.enforce('R007', {'site': 'R007', 'code': 'registered_schema_id', 'v0': ref['schema_id'], 'v1': expected_id})
        document = document_at(ref['path'])
        schema = pointer(document, ref['json_pointer'])
    identity = schema.get('$id', schema.get('properties', {}).get('schema_id', {}).get('const')) if isinstance(schema, dict) else None
    m.guard_rows.enforce('R008', {'site': 'R008', 'code': 'registered_schema_identity', 'v0': identity, 'v1': expected_id})
    try:
        Draft202012Validator.check_schema(document)
        registry = catalog(m.load).with_resource(document['$id'], Resource.from_contents(document, default_specification=DRAFT202012)).crawl()
        reference_closure(document, registry)
        target = document['$id'] + (ref['json_pointer'] if ref else '#')
        Draft202012Validator({'$ref': target}, registry=registry, format_checker=m.FORMAT).validate(event['payload'])
    except ValidationError as exc:
        m.guard_rows.enforce('RE004', {'site': 'RE004', 'code': 'index_source_payload', 'v0': 'refused'})
    except (Unresolvable, SchemaError) as exc:
        m.guard_rows.enforce('RE005', {'site': 'RE005', 'code': 'registered_schema_ref', 'v0': 'refused'})
    else:
        m.guard_rows.enforce('RE004', {'site': 'RE004', 'code': 'index_source_payload', 'v0': None})
        m.guard_rows.enforce('RE005', {'site': 'RE005', 'code': 'registered_schema_ref', 'v0': None})

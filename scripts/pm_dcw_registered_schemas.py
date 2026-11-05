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


HISTORICAL = {
    name: dict(path='Plans/event_payload_' + name.replace('.', '_') + '.schema.json',
               json_pointer='#/$defs/' + name.replace('.', '_') + '_1_0_0_compatibility_reader',
               schema_id='https://puppetmaster.local/schemas/event_payloads/' + name.replace('.', '_') + '/1.0.0')
    for name in ('platform.capability_evaluated', 'restore_point.corrupt', 'run.started',
                 'safe_point.recovery_unavailable', 'storage.boot_recovery',
                 'storage.integrity_detected', 'storage.recovery_applied')
}


def pointer(document, fragment):
    m.require(isinstance(fragment, str) and (fragment == '#' or fragment.startswith('#/')),
              'registered_schema_pointer')
    try:
        value = document
        for token in unquote(fragment[2:]).split('/') if fragment != '#' else ():
            # Reject malformed RFC6901 escapes instead of selecting a different key.
            m.require(re.search(r'~(?![01])', token) is None, 'registered_schema_pointer')
            token = token.replace('~1', '/').replace('~0', '~')
            if isinstance(value, list):
                # RFC6901 array indices have no sign or leading zeroes.
                if re.fullmatch(r'0|[1-9][0-9]*', token) is None:
                    raise ValueError('invalid array index')
                value = value[int(token)]
            else:
                value = value[token]
        return value
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise m.Refusal('registered_schema_pointer') from exc


def document_at(path):
    # The path comes from the canonical owner registry, never from an event or
    # caller. Load precisely that local document; reference retrieval is offline.
    try:
        return m.load(path)
    except (OSError, TypeError, ValueError) as exc:
        raise m.Refusal('registered_schema_path') from exc


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
                    # An external reference pulls in the entire document, not
                    # just the definition reached by the positive instance.
                    if not value['$ref'].startswith('#'):
                        root = resolver.lookup(value['$ref'].split('#', 1)[0])
                        Draft202012Validator.check_schema(root.contents)
                        visit(root.contents, root.resolver)
                    visit(target.contents, target.resolver)
                except (Unresolvable, SchemaError) as exc:
                    raise m.Refusal('registered_schema_ref') from exc
            for child in value.values():
                visit(child, resolver)
        else:
            for child in value:
                visit(child, resolver)

    visit(document, registry.resolver(document['$id']))


def validate_registered(owner, event):
    m.require(owner is not None, 'index_source_dispatch')
    # Scope/version editions are selected exactly, never by lexical version or
    # a try-any-schema fallback. Historical originals retain their stored policy.
    editions = owner.get('payload_versions')
    if editions:
        edition = next((v for v in editions if v['scope_kind'] == event['scope_kind'] and
                        v['payload_schema_id'] == event['payload_schema_id']), None)
        m.require(edition is not None, 'index_source_dispatch')
    else:
        edition = owner
    ref = edition.get('payload_schema_ref')
    expected_id = edition['payload_schema_id']
    historical = HISTORICAL.get(owner['event_type'])
    if historical and event['payload_schema_id'] == historical['schema_id']:
        ref = historical
        expected_id = historical['schema_id']
    m.require(event['payload_schema_id'] == expected_id, 'index_source_dispatch')
    if ref is None:
        document = edition['payload_schema']
        schema = document
    else:
        m.require(ref['schema_id'] == expected_id, 'registered_schema_id')
        document = document_at(ref['path'])
        schema = pointer(document, ref['json_pointer'])
    # Some registered non-root definitions (Goal application, Settings and chat
    # approvals) carry their identity as a required payload schema_id constant.
    # A present $id still must match; its mismatch cannot use the alternate form.
    identity = schema.get('$id', schema.get('properties', {}).get('schema_id', {}).get('const')) if isinstance(schema, dict) else None
    m.require(identity == expected_id, 'registered_schema_identity')
    try:
        Draft202012Validator.check_schema(document)
        registry = catalog(m.load).with_resource(document['$id'],
            Resource.from_contents(document, default_specification=DRAFT202012)).crawl()
        reference_closure(document, registry)
        # Resolve the original pointer in its document context, preserving local
        # definitions and nested $id scopes rather than detaching its contents.
        target = document['$id'] + (ref['json_pointer'] if ref else '#')
        Draft202012Validator({'$ref': target}, registry=registry,
                            format_checker=m.FORMAT).validate(event['payload'])
    except ValidationError as exc:
        raise m.Refusal('index_source_payload') from exc
    except (Unresolvable, SchemaError) as exc:
        raise m.Refusal('registered_schema_ref') from exc

#!/usr/bin/env python3
"""Offline whole-document reference admission for the DX schema oracles."""
import copy
import json
from pathlib import Path
from functools import lru_cache
from urllib.parse import unquote, urlsplit

import jsonschema
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable, NoSuchResource
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]


def check_document(schema):
    """Meta-validate one whole schema document; the 2020-12 meta-schema occurrence is one table row."""
    from pm_executor_event_semantics import refuse
    try:
        jsonschema.Draft202012Validator.check_schema(schema)
        error = None
    except jsonschema.SchemaError as exc:
        error = exc
    refuse('schema_document', {'meta_valid': error is None}, '' if error is None else ': ' + error.message)


@lru_cache(maxsize=128)
def _check_schema_text(text):
    check_document(json.loads(text))


def _references(value):
    if isinstance(value, dict):
        if '$ref' in value:
            yield value['$ref']
        for child in value.values():
            yield from _references(child)
    elif isinstance(value, list):
        for child in value:
            yield from _references(child)


def check_references(schema, schema_path):
    """Resolve every reference, including dormant definitions and local resources.

    Complete retrieved documents are walked too. Registry resolves JSON pointers,
    anchors and nested resource IDs; no network retrieval is allowed. Local-only
    reference checks cache the complete root bytes. External graphs are resolved
    afresh so an on-disk dependency mutation cannot reuse a prior resolution.
    """
    text = json.dumps(schema, sort_keys=True)
    if any(isinstance(ref, str) and not ref.startswith('#') for ref in _references(schema)):
        return _check_reference_graph(text, schema_path)
    return _check_local_references_cached(text, schema_path)


@lru_cache(maxsize=128)
def _check_local_references_cached(text, schema_path):
    return _check_reference_graph(text, schema_path)


def _check_reference_graph(text, schema_path):
    from pm_executor_event_semantics import refuse
    schema = json.loads(text)
    _check_schema_text(text)
    if not list(_references(schema)):
        return 0
    pending = [(schema, (ROOT / schema_path).resolve().as_uri())]
    loaded = {pending[0][1]}
    by_id = None
    retrieved = {}

    def retrieve(uri):
        nonlocal by_id
        if uri in retrieved:
            return retrieved[uri]
        parts = urlsplit(uri)
        path = Path(unquote(parts.path)) if parts.scheme == 'file' and not parts.netloc else None
        if parts.scheme == 'https' and parts.netloc == 'puppetmaster.local' and parts.path.startswith('/Plans/'):
            path = ROOT / unquote(parts.path.lstrip('/'))
        if path is None:
            if by_id is None:
                by_id = {}
                for candidate in sorted((ROOT / 'Plans').glob('*.schema.json')):
                    document = json.loads(candidate.read_text())
                    if isinstance(document, dict) and isinstance(document.get('$id'), str):
                        by_id[document['$id'].rstrip('#')] = candidate
            path = by_id.get(uri)
        if path is None or not path.resolve().is_relative_to(ROOT / 'Plans') or not path.is_file():
            raise NoSuchResource(ref=uri)
        document = json.loads(path.read_text())
        jsonschema.Draft202012Validator.check_schema(document)
        if uri not in loaded:
            loaded.add(uri)
            pending.append((document, uri))
        retrieved[uri] = Resource.from_contents(document, default_specification=DRAFT202012)
        return retrieved[uri]

    resource = Resource.from_contents(schema, default_specification=DRAFT202012)
    registry = Registry(retrieve=retrieve).with_resource(pending[0][1], resource).crawl()
    count = 0
    while pending:
        document, uri = pending.pop()
        resource = Resource.from_contents(document, default_specification=DRAFT202012)
        registry = registry.with_resource(uri, resource).crawl()

        def walk(value, resolver, location):
            nonlocal count
            if isinstance(value, dict):
                if isinstance(value.get('$id'), str):
                    resolver = resolver.in_subresource(
                        Resource.from_contents(value, default_specification=DRAFT202012))
                if '$ref' in value:
                    ref = value['$ref']
                    try:
                        target, resolves = resolver.lookup(ref).contents, True
                    except Unresolvable:
                        target, resolves = None, False
                    refuse('schema_reference', {'resolves': resolves, 'target_type': type(target).__name__ if resolves else None},
                           message={'SR02_ref_resolves': f'unresolved schema $ref at {schema_path}{location}: {ref}',
                                    'SR03_ref_target': f'non-schema $ref target at {schema_path}{location}: {ref}'})
                    count += 1
                for key, child in value.items():
                    walk(child, resolver, location + '/' + key.replace('~', '~0').replace('/', '~1'))
            elif isinstance(value, list):
                for index, child in enumerate(value):
                    walk(child, resolver, location + '/' + str(index))

        walk(document, registry.resolver(uri), '')
    return count


def check_lane_schemas(contracts):
    """Schema defects fail the complete CLI before expected-negative fixtures run."""
    paths = [contract['schema_ref'] for contract in contracts]
    paths.append('Plans/executor_event_source_proofs.schema.json')
    failures = []
    for path in paths:
        try:
            check_references(json.loads((ROOT / path).read_text()), path)
        except (ValueError, jsonschema.SchemaError) as error:
            failures.append([path, str(error)])
    return failures


def reference_cases(contract, cases):
    """Run authored positive/negative schema mutations without changing disk bytes."""
    from pm_executor_event_semantics import mutate
    original = json.loads((ROOT / contract['schema_ref']).read_text())
    failures = []
    for case in cases:
        changes = copy.deepcopy(case['changes'])
        for change in changes:
            if change['path'] == '$defs':
                change['value'] = {**original.get('$defs', {}), **change['value']}
        schema = mutate(original, changes)
        try:
            check_references(schema, contract['schema_ref'])
            result = 'accept'
        except (ValueError, jsonschema.SchemaError):
            result = 'reject'
        if result != case['expected']:
            failures.append([contract['event_type'], case['case'], result])
    return failures

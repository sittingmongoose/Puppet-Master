"""Pinned, offline schema closure shared by both DF checker entry points."""
from __future__ import annotations

import copy
import json
from functools import lru_cache
from pathlib import Path
from urllib.parse import urljoin

from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]


def registry_for(graph, documents):
    # No retrieval callback: dependencies must be explicitly selected by the graph.
    registry = Registry()
    for row in graph['resources']:
        resource = Resource.from_contents(documents[row['path']],
                                          default_specification=DRAFT202012)
        registry = registry.with_resource(row['uri'], resource)
        registry = registry.with_resource('https://puppetmaster.local/' + row['path'], resource)
    # The legacy shared $id is opaque; payload schemas also import it relatively.
    shared = documents['Plans/shared_integration_runtime.schema.json']
    for row in graph['resources']:
        registry = registry.with_resource(urljoin(row['uri'], shared['$id']),
                                          Resource.from_contents(shared))
    return registry


@lru_cache(maxsize=None)
def context(family):
    slug = family.replace('.', '_')
    graph = json.loads((ROOT / f'Plans/filesafe_event_sources/{slug}.contract.json').read_text())
    documents = {row['path']: json.loads((ROOT / row['path']).read_text())
                 for row in graph['resources']}
    return graph, documents, registry_for(graph, documents)


def reference_failures(graph, documents, registry=None):
    """Resolve every reference, including unused definitions and nested $id scopes."""
    if registry is None:
        registry = registry_for(graph, documents)
    failures = []

    def walk(node, resolver, path):
        if isinstance(node, dict):
            if '$id' in node:
                resolver = resolver.in_subresource(Resource.from_contents(
                    node, default_specification=DRAFT202012))
            for key, value in node.items():
                if key in ('$ref', '$dynamicRef'):
                    try:
                        resolver.lookup(value)
                    except Unresolvable:
                        failures.append(f'unresolved_schema_ref:{path}/{key}:{value}')
                else:
                    walk(value, resolver, path + '/' + key)
        elif isinstance(node, list):
            for index, value in enumerate(node):
                walk(value, resolver, path + '/' + str(index))

    for row in graph['resources']:
        walk(documents[row['path']], registry.resolver(row['uri']), row['path'])
    return failures


def negative_case_failures(family, graph, documents):
    """Own-family unexercised-reference mutations, run by both complete checkers."""
    pack = json.loads((ROOT / 'Plans/filesafe_schema_graph_fixtures.json').read_text())
    cases = next(row['negative'] for row in pack['families'] if row['event_type'] == family)
    failures = []
    for case in cases:
        mutated_graph = copy.deepcopy(graph)
        mutated_documents = dict(documents)
        path = case['resource_path']
        if case.get('remove_resource'):
            mutated_graph['resources'] = [row for row in graph['resources']
                                           if row['path'] != path]
            del mutated_documents[path]
        else:
            document = copy.deepcopy(documents[path])
            definition = {'$ref': case['unresolved_ref']}
            if 'nested_id' in case:
                definition['$id'] = case['nested_id']
            document.setdefault('$defs', {})['df_unexercised_negative'] = definition
            mutated_documents[path] = document
        if not reference_failures(mutated_graph, mutated_documents):
            failures.append(case['id'] + ':dangling_reference_accepted')
    return failures

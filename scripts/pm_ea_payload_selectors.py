#!/usr/bin/env python3
"""Resolve EventRecord selectors independently from schema resource locations.

Resource identity comes from the schema resolver. The reviewed envelope bindings
come from the actual owners' originals and producer plan, never from a claimed
registry selector or from an unrelated stored payload's schema_id.
"""
from functools import lru_cache
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@lru_cache(maxsize=8)
def owner_selector_bindings(root):
    root = Path(root)
    def load(path):
        return json.loads((root / path).read_text(), parse_int=str)
    selected = {}
    def add(event_type, scope, value, source, *, versioned=False):
        key = (event_type, scope)
        item = dict(selector=value, source=source, versioned=versioned)
        if not isinstance(value, str) or not value:
            raise ValueError('Owner original has no envelope selector')
        if key in selected and selected[key]['selector'] != value:
            raise ValueError('Owner originals disagree on selector: ' + str(key))
        selected.setdefault(key, item)
    path = 'Plans/orchestrator_event_contract_fixtures.json'
    for index, case in enumerate(load(path)['event_cases']):
        event = case['event']
        add(event['event_type'], event['scope_kind'], event['payload_schema_id'],
            path + '#/event_cases/' + str(index) + '/event/payload_schema_id', versioned=True)
    for path in ['Plans/dcw_event_contract_fixtures.json', 'Plans/dcw_blockage_event_fixtures.json']:
        for index, family in enumerate(load(path)['families']):
            event = family['positive']['event']
            add(event['event_type'], event['scope_kind'], event['payload_schema_id'],
                path + '#/families/' + str(index) + '/positive/event/payload_schema_id')
    for family in load('Plans/event_authority_w3e_oracle_plan.json')['families']:
        path = family['payload_schema']
        schema = load(path)
        scopes = schema['properties']['scope_kind']
        for scope in scopes.get('enum') or [scopes['const']]:
            add(family['event_type'], scope, schema['properties']['schema_id']['const'],
                path + '#/properties/schema_id/const')
    for family in load('Plans/panel_event_contracts/manifest.json')['families']:
        path = 'Plans/panel_event_contracts/' + family['slug'] + '.fixtures.json'
        for index, case in enumerate(load(path)['payload_cases']):
            if case['valid']:
                value = case['value']
                add(family['event_type'], 'application' if value['project_id'] is None else 'project',
                    value['schema_id'], path + '#/payload_cases/' + str(index) + '/value/schema_id')
    return selected


def selector_id(event_type, scope, schema, resource_id, *, root=ROOT):
    """The exact owner selector for a resolved payload and actual scope.

    The 55 reviewed families have explicit owner-positive envelope bindings.
    Orchestrator versions those IDs even when its Crew payload has no stored
    schema_id. Unreviewed legacy resource/body-ID distinctions retain their
    existing resource binding; they receive no new semantic admission grade.
"""
    if not isinstance(schema, dict) or not isinstance(resource_id, str):
        raise ValueError('Unresolved payload resource')
    bindings = owner_selector_bindings(str(Path(root).resolve()))
    binding = bindings.get((event_type, scope))
    if binding is None:
        if event_type in {key[0] for key in bindings}:
            raise ValueError('Owner declares no envelope selector for this scope: ' + str((event_type, scope)))
        return resource_id
    properties = schema.get('properties', {})
    logical = properties.get('schema_id', {}).get('const') or schema.get('x-schema-id') or resource_id
    expected = binding['selector']
    if binding['versioned']:
        version = properties.get('schema_version', {}).get('const')
        if not isinstance(version, str) or expected != logical + '@' + version:
            raise ValueError('Orchestrator original and underlying payload definition disagree: ' + event_type)
    elif expected != logical:
        raise ValueError('Owner original and closed payload selector disagree: ' + str(event_type))
    return expected


def selector_source(event_type, scope, schema, resource_id, path, pointer, *, root=ROOT):
    """An exact canonical source for a selector that differs from its resource."""
    binding = owner_selector_bindings(str(Path(root).resolve())).get((event_type, scope))
    if binding:
        return binding['source']
    return path + pointer

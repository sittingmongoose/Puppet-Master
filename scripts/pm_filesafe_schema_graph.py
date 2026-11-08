"""Pinned, offline schema closure shared by both DF checker entry points."""
from __future__ import annotations

import copy
import json
import re
import sys
from datetime import datetime
from functools import lru_cache
from pathlib import Path
from urllib.parse import urljoin

from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012
from jsonschema import Draft202012Validator, FormatChecker, validators, _keywords
from pm_event_numbers import Refusal, current_integer

import pm_filesafe_tables as tables

ROOT = Path(__file__).resolve().parents[1]


def date_time(value):
    """Enforce the selected date-time format even without optional packages.

    Keep fractional precision and offset spellings intact. Calendar validation
    uses integral fields only; no timestamp is normalized or reserialized.
    Like the existing datetime consumers, seconds are 00..59 (no leap second).
    Interim lane format (CV-1101 adoption is part 2B); refusals come only from
    the date_time_grammar and date_time_fields guard tables.
    """
    if not isinstance(value, str):
        return True  # JSON Schema's type keyword owns non-string inputs.
    match = re.fullmatch(
        r'([0-9]{4})-([0-9]{2})-([0-9]{2})[Tt]'
        r'([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]+)?'
        r'(?:[Zz]|([+-])([0-9]{2}):([0-9]{2}))', value)
    if tables.refused('date_time_grammar', {'match': match is not None}):
        return False
    year, month, day, hour, minute, second = map(int, match.groups()[:6])
    try:
        datetime(year, month, day, hour, minute, second)
        calendar_valid = True
    except ValueError:
        calendar_valid = False
    facts = {'calendar_valid': calendar_valid,
             'offset_hour': None if match[7] is None else int(match[8]),
             'offset_minute': None if match[7] is None else int(match[9])}
    return not tables.refused('date_time_fields', facts)


_SLOTS = []


def _integer_slot_type(validator, types, instance, schema):
    """JSON Schema type, recording every value checked at an integer slot.

    The mathematical integer check of JSON Schema admits 1.0; current typed
    integer inputs require the exact integer primitive (CV-1100). Recording
    keeps slot admission out of the schema's own result, so a slot inside a
    oneOf/anyOf branch never turns into a structural combinator error; the
    caller then runs pm_event_numbers.current_integer on each recorded value.
    Range stays with the schema's minimum/maximum keywords.
    """
    yield from _keywords.type(validator, types, instance, schema)
    names = [types] if isinstance(types, str) else types
    if 'integer' in names and type(instance) is not bool and validator.is_type(instance, 'number'):
        _SLOTS.append(instance)


SlotValidator = validators.extend(Draft202012Validator, {'type': _integer_slot_type})


def _slot_evolve(self, **changes):
    """Keep slot admission installed across references into resources declaring $schema.

    jsonschema's own evolve switches to the stock class of a resource's declared
    dialect. Every DF resource declares Draft 2020-12; any other dialect fails closed.
    """
    from attrs import fields
    schema = changes.setdefault('schema', self.schema)
    if validators.validator_for(schema, default=Draft202012Validator) is not Draft202012Validator:
        raise ValueError('DF slot admission supports Draft 2020-12 resources only')
    for field in fields(type(self)):
        if field.init and field.alias not in changes:
            changes[field.alias] = getattr(self, field.name)
    return type(self)(**changes)


SlotValidator.evolve = _slot_evolve


def split_errors(validator, instance):
    """Observation: (structural error count, CV-1100 integer-slot refusal reasons)."""
    previous = list(_SLOTS)
    _SLOTS.clear()
    try:
        with exact_integer_text():
            structural = sum(1 for _ in validator.iter_errors(instance))
        reasons = []
        for value in _SLOTS:
            try:
                current_integer(value)
            except Refusal as error:
                reasons.append(error.reason)
    finally:
        _SLOTS[:] = previous
    return structural, reasons


class exact_integer_text:
    """Render integers exactly while schema errors are formatted (no value changes).

    CV-1100 sets no global integer ceiling; Python's default 4,300-digit
    str() limit would otherwise make a valid long integer crash an error message.
    The previous limit is restored on exit.
    """
    def __enter__(self):
        self.previous = sys.get_int_max_str_digits()
        sys.set_int_max_str_digits(0)

    def __exit__(self, *exc):
        sys.set_int_max_str_digits(self.previous)
        return False


def format_checker():
    checker = FormatChecker()
    # Register per instance: do not depend on, or mutate, global optional handlers.
    checker.checks('date-time')(date_time)
    return checker


def format_case_failures():
    pack = json.loads((ROOT / 'Plans/filesafe_event_format_fixtures.json').read_text())
    validator = Draft202012Validator({'type': 'string', 'format': 'date-time'},
                                    format_checker=format_checker())
    return [case['id'] + ':date_time_outcome' for case in pack['cases']
            if (not list(validator.iter_errors(case['value']))) != case['accepted']]


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
    # The observation is the complete unresolved list; SR01 decides the refusal.
    return failures if tables.refused('schema_references', {'unresolved': failures}) else []


def meta_schema_errors(schema):
    """Count Draft 2020-12 meta-schema errors of one schema document or root."""
    meta = Draft202012Validator(Draft202012Validator.META_SCHEMA,
                                format_checker=Draft202012Validator.FORMAT_CHECKER)
    return sum(1 for _ in meta.iter_errors(schema))


def schema_document_refused(schema):
    return tables.refused('schema_meta', {'meta_errors': meta_schema_errors(schema)})


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

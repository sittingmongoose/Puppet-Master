#!/usr/bin/env python3
"""DT F16/S1/S2: sweep every numeric/boolean schema leaf, one family per run.

Leaf guards use their real JSON Schema evaluator. Each removal changes only one
keyword, or an explicitly named type/const/enum duplicate set. Model guard
removals and all source joins are independently covered by pm-dt-guard-isolation.
"""
import argparse
import copy
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('dt_types', ROOT / 'scripts/pm-dt-event-contracts.py')
dt = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dt)


def leaves(value, path=()):
    if isinstance(value, dict):
        if dt.schema_value_kind(value) is not None:
            yield path, value
        for key, child in value.items():
            yield from leaves(child, path + (key,))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from leaves(child, path + (index,))


def sweep(name):
    schemas = dt.load('Plans/dt_event_contracts.schema.json')['$defs']
    contract = next(c for c in dt.load('Plans/dt_event_contracts.json')['families'] if c['event_type'] == name)
    fixture = next(f for f in dt.load('Plans/dt_event_contract_fixtures.json')['families'] if f['event_type'] == name)
    slug = name.replace('.', '_')
    rows = []; failures = []; numeric = boolean = checks = 0
    for definition, schema in schemas.items():
        if definition != slug and not definition.startswith(slug + '_'):
            continue
        for path, rule in leaves(schema):
            validator = dt.Draft202012Validator(rule)
            kind = dt.schema_value_kind(rule); numeric += kind != 'boolean'; boolean += kind == 'boolean'
            base = rule.get('const', rule.get('enum', [False if kind == 'boolean' else max(0, rule.get('minimum', 0))])[0])
            checks += 1
            if not validator.is_valid(base):
                failures.append(definition + '/' + str(path) + ': invalid positive leaf base')
            values = ['false', '0', 'true', '1', None, [], {}, [False], {'value': False}, 1 if kind == 'boolean' else True]
            if kind != 'boolean':
                if rule.get('minimum', -(2**53)) < -(2**53-1) or rule.get('maximum', 2**53) > 2**53-1:
                    failures.append(definition + '/' + str(path) + ': unbounded current numeric domain')
                values += [2**53, -(2**53), 2**60, -(2**60), float(2**53), float(-(2**53)), 2**64-1]
            if isinstance(rule.get('type'), list) and 'null' in rule['type']:
                values = [value for value in values if value is not None]
            negatives = {str(i) + '/' + repr(value): value for i, value in enumerate(values)}
            for label, value in negatives.items():
                checks += 1
                if validator.is_valid(value):
                    failures.append(definition + '/' + str(path) + ': accepted wrong type/domain ' + label)
            removals = [['type']]
            if kind == 'boolean':
                # JSON Schema's const/enum deliberately distinguishes 1 from
                # true too. Name those redundant type/value guards precisely.
                duplicates = [k for k in ['type', 'const', 'enum'] if k in rule]
                if len(duplicates) > 1:
                    removals = [duplicates]
            else:
                removals += [[key] for key in ['minimum', 'maximum'] if key in rule]
            for keywords in removals:
                weakened = copy.deepcopy(rule)
                for keyword in keywords:
                    del weakened[keyword]
                altered = dt.Draft202012Validator(weakened)
                flips = [label for label, value in negatives.items() if altered.is_valid(value)]
                stays = [label for label in negatives if label not in flips]
                if not flips:
                    # A stricter owner bound such as minimum=0 needs its own
                    # isolated adjacent witness, not an unrelated safe bound.
                    keyword = keywords[0]
                    if keyword in ['minimum', 'maximum']:
                        value = rule[keyword] + (-1 if keyword == 'minimum' else 1)
                        label = 'adjacent/' + str(value)
                        if not validator.is_valid(value) and altered.is_valid(value):
                            flips.append(label)
                    if not flips:
                        failures.append(definition + '/' + str(path) + ': unproved guard ' + repr(keywords))
                rows.append({'guard': definition + '/' + '/'.join(map(str, path)) + '/' + '+'.join(keywords),
                             'duplicate_set': keywords if len(keywords) > 1 else None,
                             'negatives_that_flip': flips, 'negatives_that_stay_rejected': stays})
    # The recursive shared schema is checked independently of the optimized
    # model predicate, so neither implementation can silently drift.
    domain = dt.load('Plans/dt_number_domain.schema.json')
    domain_cases = {}
    for number in [2**53-1, -(2**53-1), 2**53, -(2**53), 2**60, -(2**60)]:
        for value in [number, float(number), {'nested': [number]}]:
            label = repr(value); domain_cases[label] = value
            checks += 1
            expected = abs(number) <= 2**53-1
            if dt.Draft202012Validator(domain).is_valid(value) != expected or dt.current_numbers_valid(value) != expected:
                failures.append('recursive numeric schema/model disagree: ' + label)
    negatives = {label: value for label, value in domain_cases.items() if not dt.Draft202012Validator(domain).is_valid(value)}
    for keyword in ['minimum', 'maximum']:
        weakened = copy.deepcopy(domain); del weakened['anyOf'][1][keyword]
        validator = dt.Draft202012Validator(weakened)
        flips = [label for label, value in negatives.items() if validator.is_valid(value)]
        stays = [label for label in negatives if label not in flips]
        if not flips:
            failures.append('recursive domain guard unproved: ' + keyword)
        rows.append({'guard': 'Plans/dt_number_domain.schema.json/anyOf/1/' + keyword,
                     'duplicate_set': None, 'negatives_that_flip': flips, 'negatives_that_stay_rejected': stays})
    populated = 0
    for definition, label, value in dt.schema_type_cases(contract, fixture, schemas):
        populated += 1
        if dt.Draft202012Validator(schemas[definition], format_checker=dt.FormatChecker()).is_valid(value):
            failures.append('populated schema accepted ' + label)
    return {'status': 'pass' if not failures else 'fail', 'family': name,
            'numeric_schema_leaves': numeric, 'boolean_schema_leaves': boolean,
            'wrong_type_domain_controls': checks, 'populated_schema_controls': populated,
            'guard_removal_table': rows, 'failures': failures, 'native_execution': 'NOT_RUN'}


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--family', required=True)
    args = parser.parse_args(); result = sweep(args.family)
    print(json.dumps(result, indent=2))
    return int(result['status'] != 'pass')


if __name__ == '__main__':
    raise SystemExit(main())

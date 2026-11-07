#!/usr/bin/env python3
"""DT S1/S2: sweep every numeric/boolean schema leaf, one family per run.

Leaf guards use their real JSON Schema evaluator. Each removal changes only one
keyword, or an explicitly named type/const/enum duplicate set. This is lane
evidence for schema keywords only and earns no Method B credit: the model rows
and every source join are guard-table rows proved by the shared guard tool
(scripts/pm-dt-guard-tables.py).
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


def leaves(value, path=(), selector=False):
    if isinstance(value, dict):
        if dt.schema_value_kind(value) is not None:
            yield path, value, selector
        for key, child in value.items():
            yield from leaves(child, path + (key,), selector or key == 'if')
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from leaves(child, path + (index,), selector)


def sweep(name):
    schemas = dt.load('Plans/dt_event_contracts.schema.json')['$defs']
    contract = next(c for c in dt.load('Plans/dt_event_contracts.json')['families'] if c['event_type'] == name)
    fixture = next(f for f in dt.load('Plans/dt_event_contract_fixtures.json')['families'] if f['event_type'] == name)
    slug = name.replace('.', '_')
    rows = []; failures = []; selectors = []; numeric = boolean = checks = 0
    for definition, schema in schemas.items():
        if definition != slug and not definition.startswith(slug + '_'):
            continue
        for path, rule, selector in leaves(schema):
            validator = dt.Draft202012Validator(rule)
            kind = dt.schema_value_kind(rule); numeric += kind != 'boolean'; boolean += kind == 'boolean'
            base = rule.get('const', rule.get('enum', [False if kind == 'boolean' else max(0, rule.get('minimum', 0))])[0])
            checks += 1
            if not validator.is_valid(base):
                failures.append(definition + '/' + str(path) + ': invalid positive leaf base')
            values = ['false', '0', 'true', '1', None, [], {}, [False], {'value': False}, *([0, 1] if kind == 'boolean' else [False, True])]
            if isinstance(rule.get('type'), list) and 'null' in rule['type'] or None in rule.get('enum', []):
                values = [value for value in values if value is not None]
            negatives = {str(i) + '/' + repr(value): value for i, value in enumerate(values)}
            for label, value in negatives.items():
                checks += 1
                if validator.is_valid(value):
                    failures.append(definition + '/' + str(path) + ': accepted wrong type ' + label)
            if selector:
                selectors.append({'path': definition + '/' + '/'.join(map(str, path)), 'kind': kind, 'controls': len(negatives), 'status': 'pass' if all(not validator.is_valid(value) for value in negatives.values()) else 'fail'})
                continue  # A conditional selector is not a rejecting guard.
            removals = [[next(key for key in ['type', 'const', 'enum'] if key in rule)]]
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
    populated = 0
    for definition, label, value in dt.schema_type_cases(contract, fixture, schemas):
        populated += 1
        if dt.Draft202012Validator(schemas[definition], format_checker=dt.FormatChecker()).is_valid(value):
            failures.append('populated schema accepted ' + label)
    return {'status': 'pass' if not failures else 'fail', 'family': name,
            'numeric_schema_leaves': numeric, 'boolean_schema_leaves': boolean,
            'wrong_type_domain_controls': checks, 'populated_schema_controls': populated,
            'selector_controls': selectors, 'guard_removal_table': rows, 'failures': failures, 'native_execution': 'NOT_RUN'}


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--family', required=True)
    args = parser.parse_args(); result = sweep(args.family)
    print(json.dumps(result, indent=2))
    return int(result['status'] != 'pass')


if __name__ == '__main__':
    raise SystemExit(main())

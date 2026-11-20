#!/usr/bin/env python3
"""DG6A isolated fixture vectors (case generation only).

Sweep part 2A retired this file's proof machinery (rejection_mutants,
install/restore, duplicate_proofs, executed_cases, history_matrix and
checkpoint_schema_matrix: in-memory AST mutants and whole-keyword removal).
Check 11 is now the gated guard tool's per-row cut over the DG6A guard tables
(scripts/pm-dg6a-guard-tables.py). What stays is the fixture vector runner the
complete checkers call (`vectors`, via their isolated_cases): every executable
fixture collection runs through the complete checker functions with its exact
expected messages. No guard-removal or proof credit is claimed here.
"""
import argparse
import copy
import importlib.util
import json
import sys
from pathlib import Path
from jsonschema.exceptions import SchemaError

ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = {}


def module(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / file)
    result = importlib.util.module_from_spec(spec)
    sys.modules[name] = result
    spec.loader.exec_module(result)
    return result


def messages(errors):
    return sorted(str(e) if isinstance(e, str) else 'schema:' + '/'.join(map(str, e.absolute_path)) + ':' + e.validator
                  for e in errors)


def run_case(kind, m, family, fixture, case):
    shared = m if kind == 'alert' else m.shared
    folder = {'alert': 'alert_event_contracts', 'panel': 'panel_event_contracts', 'concern': 'concern_created_contracts'}[kind]
    def schema(path):
        key = (id(m), path)
        if key not in SCHEMAS:
            SCHEMAS[key] = m.load(path)
        return SCHEMAS[key]
    payload_schema = schema(family['payload_schema'])
    op_schema = schema(f'Plans/{folder}/{family["operation"]}.schema.json')
    cp_schema = schema(f'Plans/{folder}/{family["checkpoint"]}.schema.json')
    original = fixture['operation_cases'][0]['value'] if kind == 'alert' else fixture['settled_operation']
    value = copy.deepcopy(case['value'])
    target = case['target']
    if target == 'observed':
        source, function, args = case['call']
        return messages(getattr(source, function)(*copy.deepcopy(args)))
    if target == 'operation':
        args = (value, op_schema) if kind == 'alert' else ((value, op_schema, payload_schema, family['event_type']) if kind == 'panel' else (value, op_schema, payload_schema))
        return messages(m.operation_errors(*args))
    if target == 'payload':
        return messages(m.errors(value, payload_schema, case['guard']) if kind == 'alert' else m.payload_errors(value, payload_schema))
    if target == 'protocol':
        return messages(m.protocol_errors(value, case.get('original', original)))
    if target == 'append':
        return messages(shared.append_result_errors(value['operation'], value['resolved'], value['expected'], family['event_type']))
    if target == 'cursor':
        return messages(shared.cursor_errors(value['after'], value['frontier']))
    if target == 'checkpoint':
        return messages(m.checkpoint_errors(value, cp_schema, case.get('original', original)))
    if target == 'profile':
        return messages(shared.profile_errors(value, family['operation'], 'redb', 'settings_and_layout' if kind == 'panel' else 'coordination_and_storage'))
    if target == 'policy':
        return messages(shared.writer_policy_errors(value))
    if target == 'refs':
        return messages(shared.schema_ref_errors(value))
    if target == 'comparison':
        return [] if shared.exact_value(value['candidate'], value['source']) else ['immutable source mismatch']
    if target == 'schema':
        try:
            shared.check_schema(value)
        except (AssertionError, SchemaError):
            return ['invalid schema contract']
        return []
    if target == 'pager':
        try:
            result = shared.history_page(**value)
        except ValueError:
            return case['errors']
        mode = case['mode']
        safe = {'scan': result['after_sequence_id'] <= 256,
                'matches': len(result['event_refs']) <= 64,
                'bytes': len(shared.packed(result)) <= 16384,
                'past': 'past' not in result['event_refs'],
                'future': result['after_sequence_id'] <= value['frontier'],
                'family': 'foreign' not in result['event_refs'],
                'project': 'foreign' not in result['event_refs']}.get(mode, False)
        return case['errors'] if safe else []
    raise AssertionError(target)


def vectors(kind, m, family, fixture):
    rows = []
    for case in fixture_cases(kind, fixture):
        if 'errors' not in case:
            continue  # Legacy collections retain their own expected-valid assertions.
        actual = run_case(kind, m, family, fixture, case)
        assert actual == sorted(case['errors']), (family['event_type'], case['name'], actual, case['errors'])
        rows.append(case)
    return len(rows)


def fixture_cases(kind, fixture):
    """Every executable fixture collection participates, not just isolated_cases."""
    cases = copy.deepcopy(fixture['isolated_cases'])
    for case in fixture.get('append_cases', []):
        value = dict(operation=copy.deepcopy(fixture['append_operations'][case['state']]),
                     resolved=copy.deepcopy(fixture['append_resolution']),
                     expected=copy.deepcopy(fixture['history']['expected']['event']))
        for patch in case.get('patches', []):
            parent = value
            for key in patch['path'][:-1]:
                parent = parent[key]
            parent[patch['path'][-1]] = copy.deepcopy(patch['value'])
        cases.append(dict(name=case['name'], target='append', value=value, errors=case['errors']))
    for collection, target, field in [('payload_cases', 'payload', 'payload' if kind == 'alert' else 'value'),
                                       ('operation_cases', 'operation', 'value'),
                                       ('checkpoint_cases', 'checkpoint', 'value')]:
        for case in fixture.get(collection, []):
            if case['valid']:
                continue
            vector = dict(name=collection + '/' + case['name'], target=target, value=case[field])
            if 'guard' in case:
                vector['guard'] = case['guard']
            cases.append(vector)
    return cases


def main():
    """Run every family's fixture vectors through its complete checker (case generation)."""
    parser = argparse.ArgumentParser()
    parser.add_argument('--family', help='Run exactly one family')
    parser.add_argument('--output')
    args = parser.parse_args()
    counts = {}
    for kind, script, folder in [('alert', 'pm-alert-event-contracts-check.py', 'alert_event_contracts'),
                                 ('panel', 'pm-panel-event-contracts-check.py', 'panel_event_contracts'),
                                 ('concern', 'pm-concern-created-contracts-check.py', 'concern_created_contracts')]:
        m = module('guard_' + kind, script)
        for family in m.load(f'Plans/{folder}/manifest.json')['families']:
            if args.family and family['event_type'] != args.family:
                continue
            fixture = m.load(f'Plans/{folder}/{family["slug"]}.fixtures.json')
            counts[family['event_type']] = vectors(kind, m, family, fixture)
    output = dict(status='pass', vectors=counts, proof='none: check 11 is scripts/pm-dg6a-guard-tables.py')
    if args.output:
        Path(args.output).write_text(json.dumps(output, indent=2) + '\n')
    print(json.dumps(output))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

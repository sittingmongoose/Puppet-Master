#!/usr/bin/env python3
"""Fault-inject all eleven standing checks into the complete DT checker.

Each fault affects one family. Checks 1..7 and 10 call the complete main with
an in-memory model fault; check 8 uses a real failing subprocess and check 9
injects invalid schemas. Nothing is written to the repository. Authentication
adapters remain assumed.
"""
import argparse
import ast
import inspect
import contextlib
import copy
import importlib.util
import io
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('dt_standing', ROOT / 'scripts/pm-dt-event-contracts.py')
dt = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dt)

CASES = {
    '1': 'current writer accepts projector_replay_only',
    '2': 'writer accepts malformed CV-366 application key or forbidden application scope',
    '3': 'writer accepts raw Project ID as partition',
    '4': 'writer accepts an oversized inline payload',
    '5': 'checkpoint publishes a coherent trailing-LF hash',
    '6': 'retry digest includes Storage metadata',
    '7': 'checkpoint publishes a coherent foreign storage identity',
    '8': 'pinned family identity oracle is wrong; process must exit 1',
    '9': 'unvisited timestamp alternative contains an unresolved schema reference',
    '10': 'historical reader rechecks the live operation instead of its retained original',
    '11': 'each negative is admitted by removing only its own predicate or schema rule',
}


def failure_probe(name):
    """Exercise the real main return/SystemExit path with one bad fixture."""
    original_load = dt.load
    fixtures = copy.deepcopy(original_load('Plans/dt_event_contract_fixtures.json'))
    next(f for f in fixtures['families'] if f['event_type'] == name)['identity_oracle']['idempotency_key'] += '-wrong'
    dt.load = lambda path: fixtures if path == 'Plans/dt_event_contract_fixtures.json' else original_load(path)
    return dt.main()


def run_fault(name, number, ref_location='timestamp', reader_fault='live_state'):
    source = dt.source_valid; checkpoint = dt.checkpoint_result; digest = dt.producer_semantic_digest
    historical = dt.historical_read
    original_load = dt.load
    if number == '9':
        document = copy.deepcopy(original_load('Plans/dt_event_contracts.schema.json'))
        definition = document['$defs'][name.replace('.', '_')]
        field = 'observed_at_utc' if name == 'usage.event' else 'ts'
        missing = {'$ref': '#/$defs/standing_missing_' + name.replace('.', '_')}
        storage = None
        if ref_location == 'timestamp':
            definition['properties'][field] = {'anyOf': [definition['properties'][field], missing]}
        elif ref_location == 'optional':
            definition['properties']['standing_unused'] = missing
        elif ref_location == 'unused_definition':
            document['$defs']['standing_unused_' + name.replace('.', '_')] = missing
        elif ref_location == 'mirror':
            storage = copy.deepcopy(original_load('Plans/storage_value_registry.json'))
            ref = 'Plans/dt_event_contracts.schema.json#/$defs/' + name.replace('.', '_') + '_checkpoint'
            next(row for row in storage['families'] if row['value_schema_ref'] == ref)['value_schema']['properties']['standing_unused'] = missing
        else:
            raise ValueError(ref_location)
        def changed_load(path):
            if path == 'Plans/dt_event_contracts.schema.json':
                return document
            if path == 'Plans/storage_value_registry.json' and storage is not None:
                return storage
            return original_load(path)
        dt.load = changed_load

    def relaxed(function, fragment):
        tree = ast.parse(inspect.getsource(function)); changed = 0
        for node in ast.walk(tree):
            if isinstance(node, ast.If) and fragment in ast.unparse(node.test):
                node.test = ast.Constant(False); changed += 1
        assert changed == 1, (function.__name__, fragment, changed)
        namespace = {}
        exec(compile(ast.fix_missing_locations(tree), '<one actual DT predicate>', 'exec'), dt.__dict__, namespace)
        return namespace[function.__name__]
    def schema_fault(document, definition):
        storage = copy.deepcopy(original_load('Plans/storage_value_registry.json'))
        ref = 'Plans/dt_event_contracts.schema.json#/$defs/' + definition
        next(row for row in storage['families'] if row['value_schema_ref'] == ref)['value_schema'] = copy.deepcopy(document['$defs'][definition])
        def changed(path):
            if path == 'Plans/dt_event_contracts.schema.json':
                return document
            if path == 'Plans/storage_value_registry.json':
                return storage
            return original_load(path)
        dt.load = changed
    weakened_source = source
    if number == '1':
        weakened_source = relaxed(source, "event['replay_policy'] != 'dedupe_by_idempotency_key'")
    elif number == '2':
        if any(v['event']['scope_kind'] == 'application' for fixture in dt.load('Plans/dt_event_contract_fixtures.json')['families'] if fixture['event_type'] == name for v in fixture['positive_variants']):
            weakened_source = relaxed(source, "key != event['idempotency_key']")
        else:
            # The Project-only prohibition is a source-schema rule. Remove only
            # that const for the explicit validator-boundary control.
            document = copy.deepcopy(original_load('Plans/dt_event_contracts.schema.json'))
            definition = name.replace('.', '_') + '_source'
            del document['$defs'][definition]['properties']['envelope_context']['properties']['scope_kind']['const']
            schema_fault(document, definition)
    elif number == '3':
        weakened_source = relaxed(source, "partition != completed['scope_partition']")
    elif number == '4':
        # Change only the size comparison; every downstream check still runs.
        tree = ast.parse(inspect.getsource(source)); changed = 0
        for node in ast.walk(tree):
            if isinstance(node, ast.Constant) and type(node.value) is int and node.value == 16384:
                node.value = 100000000; changed += 1
        assert changed == 1
        namespace = {}
        exec(compile(ast.fix_missing_locations(tree), '<only SP-337 limit>', 'exec'), dt.__dict__, namespace)
        weakened_source = namespace['source_valid']
    def changed_source(c, *args, **kwargs):
        return (weakened_source if c['event_type'] == name else source)(c, *args, **kwargs)
    dt.source_valid = changed_source
    weakened_checkpoint = checkpoint
    if number == '5':
        document = copy.deepcopy(original_load('Plans/dt_event_contracts.schema.json'))
        definition = name.replace('.', '_') + '_checkpoint'
        del document['$defs'][definition]['properties']['index_read_token']['properties']['generation_anchor_sha256']['maxLength']
        schema_fault(document, definition)
    elif number == '7':
        weakened_checkpoint = relaxed(checkpoint, "t['storage_instance_id'] != context['source_storage_instance_id']")
    def changed_checkpoint(c, *args, **kwargs):
        return (weakened_checkpoint if c['event_type'] == name else checkpoint)(c, *args, **kwargs)
    dt.checkpoint_result = changed_checkpoint
    if number == '10':
        weakened_historical = historical
        if reader_fault == 'withdrawn':
            tree = ast.parse(inspect.getsource(historical)); changed = 0
            for node in ast.walk(tree):
                if isinstance(node, ast.BoolOp) and isinstance(node.op, ast.Or):
                    for index, clause in enumerate(node.values):
                        if ast.unparse(clause) == "context['withdrawn']":
                            node.values[index] = ast.Constant(False); changed += 1
            assert changed == 1
            namespace = {}
            exec(compile(ast.fix_missing_locations(tree), '<only historical withdrawal guard>', 'exec'), dt.__dict__, namespace)
            weakened_historical = namespace['historical_read']
        elif reader_fault == 'forged':
            weakened_historical = relaxed(historical, "source_bytes(prepared) != source_bytes(context['authenticated_original']['prepared'])")
        def changed_historical(c, a, b, e, schemas, context):
            if c['event_type'] == name:
                if reader_fault == 'replay_history' and e['replay_policy'] == 'projector_replay_only':
                    return {'result': 'unavailable', 'value': None, 'external_effects': 0, 'append_count': 0}
                if reader_fault == 'compatibility_history' and e['replay_policy'] in ['append_once', 'dedupe_by_event_id']:
                    return {'result': 'unavailable', 'value': None, 'external_effects': 0, 'append_count': 0}
                if reader_fault == 'live_state' and context['live_before'] is not None and not dt.transition(name, b['payload'], context['live_before'], b['owner_result']):
                    return {'result': 'unavailable', 'value': None, 'external_effects': 0, 'append_count': 0}
                return weakened_historical(c, a, b, e, schemas, context)
            return historical(c, a, b, e, schemas, context)
        dt.historical_read = changed_historical
    if number == '6':
        dt.producer_semantic_digest = lambda event: dt.sha(event) if event['event_type'] == name else digest(event)
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            code = dt.main()
        result = json.loads(out.getvalue())
    finally:
        dt.source_valid = source; dt.checkpoint_result = checkpoint; dt.producer_semantic_digest = digest
        dt.load = original_load
        dt.historical_read = historical
    return code, result


def reference_controls():
    """Positive and negative controls for roots, nested IDs and external bundles."""
    base = 'https://puppetmaster.local/standing-ref-controls/'
    root = {'$id': base + 'root.json', '$defs': {
        'unused_external': {'$ref': 'external.json#entry'},
        'nested': {'$id': 'nested/child.json', '$defs': {'target': {'type': 'string'}}, '$ref': '#/$defs/target'},
        'local': {'$anchor': 'here', 'type': 'string'}, 'unused_local': {'$ref': '#here'}}}
    external = {'$id': base + 'external.json', '$defs': {'good': {'$anchor': 'entry', 'type': 'string'}}}
    documents = {'Plans/standing-root.json': root, 'Plans/standing-external.json': external}
    results = {'resolved_local_external_anchor_nested_id': not dt.schema_reference_errors(documents)}
    for location in ['unused_definition', 'optional', 'alternative', 'external_unused']:
        changed = copy.deepcopy(documents)
        bad = {'$ref': '#/$defs/missing_control'}
        if location == 'unused_definition':
            changed['Plans/standing-root.json']['$defs']['unused'] = bad
        elif location == 'optional':
            changed['Plans/standing-root.json']['properties'] = {'unused': bad}
        elif location == 'alternative':
            changed['Plans/standing-root.json']['anyOf'] = [True, bad]
        else:
            changed['Plans/standing-external.json']['$defs']['unused'] = bad
        results[location + '_refused'] = bool(dt.schema_reference_errors(changed))
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--failure-probe', help=argparse.SUPPRESS)
    parser.add_argument('--family', action='append', help='Target this family (repeatable); every checker run still validates all families')
    args = parser.parse_args()
    if args.failure_probe:
        return failure_probe(args.failure_probe)
    # Cache reads, not validation: every fault runs all families and assertions.
    original_load = dt.load
    cache = {}
    def cached_load(path):
        if path not in cache:
            cache[path] = original_load(path)
        return cache[path]
    dt.load = cached_load
    baseline = io.StringIO()
    with contextlib.redirect_stdout(baseline):
        baseline_code = dt.main()
    baseline_result = json.loads(baseline.getvalue())
    if baseline_code or baseline_result['status'] != 'pass':
        print(baseline.getvalue())
        return 1
    families = [c['event_type'] for c in dt.load('Plans/dt_event_contracts.json')['families']]
    targets = families if not args.family else args.family
    if len(set(targets)) != len(targets) or any(name not in families for name in targets):
        parser.error('--family must name distinct drafted DT families')
    isolation_spec = importlib.util.spec_from_file_location('dt_isolation', ROOT / 'scripts/pm-dt-guard-isolation.py')
    isolation = importlib.util.module_from_spec(isolation_spec); isolation_spec.loader.exec_module(isolation)
    results = {}; failures = []
    controls = reference_controls()
    failures.extend('schema reference control: ' + name for name, passed in controls.items() if not passed)
    for name in targets:
        row = {}
        for number in map(str, range(1, 11)):
            if number == '8':
                process = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--failure-probe', name],
                                         cwd=ROOT, capture_output=True, text=True, timeout=120)
                code = process.returncode; result = json.loads(process.stdout)
            else:
                code, result = run_fault(name, number)
            messages = result.get('failures', [])
            rejected = (code == 1 and result['status'] == 'fail' and result['families'] == len(families)
                        and any(message.startswith(name + ':') for message in messages)
                        and (result['checks'] == baseline_result['checks'] if number != '9' else
                             result['checks'] == len(families) and any(
                                 'standing_missing_' + name.replace('.', '_') in error
                                 for error in result.get('schema_reference_errors', []))))
            row[number] = {'case': CASES[number], 'status': 'pass' if rejected else 'fail',
                           'full_checker_status': result['status'], 'exit_code': code,
                           'families_checked': result['families'], 'assertions': result['checks'],
                           'failures': messages}
            if number == '9':
                locations = {}
                for location in ['optional', 'unused_definition', 'mirror']:
                    child_code, child = run_fault(name, number, location)
                    passed = child_code == 1 and child['status'] == 'fail' and any(
                        'standing_missing_' + name.replace('.', '_') in error
                        for error in child.get('schema_reference_errors', []))
                    locations[location] = {'status': 'pass' if passed else 'fail', 'exit_code': child_code,
                                           'schema_reference_errors': child.get('schema_reference_errors', [])}
                row[number]['additional_locations'] = locations
                if any(value['status'] != 'pass' for value in locations.values()):
                    rejected = False
                    row[number]['status'] = 'fail'
            if number == '10':
                reader_faults = {}
                for reader_fault in ['withdrawn', 'forged', 'replay_history', 'compatibility_history']:
                    child_code, child = run_fault(name, number, reader_fault=reader_fault)
                    passed = (child_code == 1 and child['status'] == 'fail'
                              and child['checks'] == baseline_result['checks']
                              and name + ': standing check 10' in child['failures'])
                    reader_faults[reader_fault] = {'status': 'pass' if passed else 'fail', 'exit_code': child_code,
                                                   'failures': child['failures']}
                row[number]['additional_faults'] = reader_faults
                if any(value['status'] != 'pass' for value in reader_faults.values()):
                    rejected = False
                    row[number]['status'] = 'fail'
            if not rejected:
                failures.append(name + ': standing check ' + number + ' failed to reject fault')
        contract = next(c for c in dt.load('Plans/dt_event_contracts.json')['families'] if c['event_type'] == name)
        fixture = next(f for f in dt.load('Plans/dt_event_contract_fixtures.json')['families'] if f['event_type'] == name)
        row['11'] = isolation.prove_family(dt, contract, fixture, dt.load('Plans/dt_event_contracts.schema.json')['$defs'])
        if row['11']['status'] != 'pass':
            failures.append(name + ': standing check 11 negative isolation failed')
        results[name] = row
        print(name + ': ' + ', '.join(k + '=' + v['status'] for k, v in row.items()), file=sys.stderr, flush=True)
    print(json.dumps({'status': 'pass' if not failures else 'fail', 'families': len(targets),
                      'checker_families': len(families),
                      'full_checker_runs': 1 + 17 * len(targets), 'per_family': results,
                      'reference_controls': controls,
                      'failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
    return int(bool(failures))


if __name__ == '__main__':
    raise SystemExit(main())

#!/usr/bin/env python3
"""Fault-inject all ten standing checks into the complete DT checker.

Each fault affects one family. Checks 1..7 and 10 call the complete main with
an in-memory model fault; check 8 uses a real failing subprocess and check 9
injects invalid schemas. Nothing is written to the repository. Authentication
adapters remain assumed.
"""
import argparse
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

    def bad_source(c, a, b, e, schemas, *args, **kwargs):
        if c['event_type'] == name:
            if number == '1' and e['replay_policy'] == 'projector_replay_only':
                return 'accepted'
            if number == '2' and e['scope_kind'] == 'application':
                # Only bypass the exact negative boundary, preserving valid joins.
                if c['scope_policy'] == 'project_only' or e['idempotency_key'].startswith('application:'):
                    return 'accepted'
            if number == '3' and e['scope_kind'] == 'project' and b['scope_partition'] == e['project_id']:
                return 'accepted'
            if number == '4' and e['payload_ref'] is None and len(dt.application_bytes(e['payload'])) > 16384:
                return 'accepted'
        return source(c, a, b, e, schemas, *args, **kwargs)

    def bad_checkpoint(c, old, proposed, context, schema):
        if c['event_type'] == name:
            token = proposed['index_read_token']
            if number == '5' and token['generation_anchor_sha256'].endswith('\n'):
                return 'published'
            if number == '7' and proposed['storage_instance_id'] == token['storage_instance_id'] == token['source_selection']['storage_instance_id'] != context['source_storage_instance_id']:
                return 'published'
        return checkpoint(c, old, proposed, context, schema)

    dt.source_valid = bad_source
    dt.checkpoint_result = bad_checkpoint
    if number == '10':
        def bad_historical(c, a, b, e, schemas, context):
            if c['event_type'] == name:
                if reader_fault == 'live_state' and context['live_before'] is not None and not dt.transition(name, b['payload'], context['live_before'], b['owner_result']):
                    return {'result': 'unavailable', 'value': None, 'external_effects': 0, 'append_count': 0}
                if ((reader_fault == 'withdrawn' and context['withdrawn']) or
                        (reader_fault == 'forged' and e != context['authenticated_original']['event'])):
                    return {'result': 'retained', 'value': e, 'external_effects': 0, 'append_count': 0}
            return historical(c, a, b, e, schemas, context)
        dt.historical_read = bad_historical
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
    results = {}; failures = []
    controls = reference_controls()
    failures.extend('schema reference control: ' + name for name, passed in controls.items() if not passed)
    for name in families:
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
                for reader_fault in ['withdrawn', 'forged']:
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
        results[name] = row
        print(name + ': ' + ', '.join(k + '=' + v['status'] for k, v in row.items()), file=sys.stderr, flush=True)
    print(json.dumps({'status': 'pass' if not failures else 'fail', 'families': len(families),
                      'full_checker_runs': 1 + 15 * len(families), 'per_family': results,
                      'reference_controls': controls,
                      'failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
    return int(bool(failures))


if __name__ == '__main__':
    raise SystemExit(main())

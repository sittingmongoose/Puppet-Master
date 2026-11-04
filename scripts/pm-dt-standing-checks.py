#!/usr/bin/env python3
"""Fault-inject all eight standing checks into the complete DT checker.

Each fault affects one family. Checks 1..7 call the unmodified complete main
with an in-memory model fault; check 8 uses a real failing subprocess. Nothing
is written to the repository. Authentication adapters remain assumed.
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
}


def failure_probe(name):
    """Exercise the real main return/SystemExit path with one bad fixture."""
    original_load = dt.load
    fixtures = copy.deepcopy(original_load('Plans/dt_event_contract_fixtures.json'))
    next(f for f in fixtures['families'] if f['event_type'] == name)['identity_oracle']['idempotency_key'] += '-wrong'
    dt.load = lambda path: fixtures if path == 'Plans/dt_event_contract_fixtures.json' else original_load(path)
    return dt.main()


def run_fault(name, number):
    source = dt.source_valid; checkpoint = dt.checkpoint_result; digest = dt.producer_semantic_digest

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
    if number == '6':
        dt.producer_semantic_digest = lambda event: dt.sha(event) if event['event_type'] == name else digest(event)
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            code = dt.main()
        result = json.loads(out.getvalue())
    finally:
        dt.source_valid = source; dt.checkpoint_result = checkpoint; dt.producer_semantic_digest = digest
    return code, result


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
    for name in families:
        row = {}
        for number in map(str, range(1, 9)):
            if number == '8':
                process = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--failure-probe', name],
                                         cwd=ROOT, capture_output=True, text=True, timeout=120)
                code = process.returncode; result = json.loads(process.stdout)
            else:
                code, result = run_fault(name, number)
            messages = result.get('failures', [])
            rejected = (code == 1 and result['status'] == 'fail' and result['families'] == len(families)
                        and any(message.startswith(name + ':') for message in messages)
                        and result['checks'] == baseline_result['checks'])
            row[number] = {'case': CASES[number], 'status': 'pass' if rejected else 'fail',
                           'full_checker_status': result['status'], 'exit_code': code,
                           'families_checked': result['families'], 'assertions': result['checks'],
                           'failures': messages}
            if not rejected:
                failures.append(name + ': standing check ' + number + ' failed to reject fault')
        results[name] = row
        print(name + ': ' + ', '.join(k + '=' + v['status'] for k, v in row.items()), file=sys.stderr, flush=True)
    print(json.dumps({'status': 'pass' if not failures else 'fail', 'families': len(families),
                      'full_checker_runs': 1 + 8 * len(families), 'per_family': results,
                      'failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
    return int(bool(failures))


if __name__ == '__main__':
    raise SystemExit(main())

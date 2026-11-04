#!/usr/bin/env python3
"""DG6A final-round full-CLI mutations. Run in an exclusive lane worktree.

Every changed input is restored byte-for-byte in finally. No native execution,
admission, governance change, or external service is implied by these oracles.
"""
import argparse
import copy
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVIEWED = 'de28e8be91b347e209f8b75e25838ef3bf686f73'
GRADE = 'reports/event-authority-20261104/DG6A.self-grade.json'


def load(path):
    return json.loads((ROOT / path).read_text())


def module(name, script):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / script)
    value = importlib.util.module_from_spec(spec)
    sys.modules[name] = value
    spec.loader.exec_module(value)
    return value


def audit_grade():
    grade = load(GRADE)
    before = json.loads(subprocess.check_output(['git', 'show', REVIEWED + ':' + GRADE], cwd=ROOT))
    old = {row['event_type']: row for row in before['families']}
    citations = 0
    for row in grade['families']:
        if row['outcome'] == 'blocked on Jared':
            assert row == old[row['event_type']], ('stopped family changed', row['event_type'])
        else:
            for criterion, cell in row['cells'].items():
                expected = {'membership_version': 'ABSENT', 'retention': 'PARTIAL'}.get(criterion, 'PASS')
                assert cell['status'] == expected, (row['event_type'], criterion, cell['status'])
        refs = row['disposition_evidence'] + [ref for cell in row['cells'].values() for ref in cell['evidence']]
        for ref in refs:
            lines = (ROOT / ref['path']).read_text().splitlines()
            assert 1 <= ref['line_start'] <= ref['line_end'] <= len(lines), ref
            assert ref['quote'] in '\n'.join(lines[ref['line_start'] - 1:ref['line_end']]), ref
            if ref['path'] == 'Plans/Contracts_V0.md' and ref['line_start'] in (907, 951):
                assert ref['unit'].startswith('CV-077'), ('annotation owner must be CV-077', ref)
            citations += 1
    print(json.dumps(dict(status='pass', families=len(grade['families']), citations=citations)))


def operation(fixture, kind):
    return fixture['operation_cases'][0]['value'] if kind == 'alert' else fixture['settled_operation']


def checkpoint(fixture, kind):
    return fixture['checkpoint_cases'][0]['value'] if kind == 'alert' else fixture['checkpoint']


def resize_checkpoint(value, size, packed):
    for _ in range(4):
        ref = value['index_read_token']['checkpoint_ref']
        delta = size - len(packed(value))
        value['index_read_token']['checkpoint_ref'] = ref + 'x' * delta if delta >= 0 else ref[:delta]
    assert len(packed(value)) == size


def run_suite(output):
    panel = module('dg6a_final_panel', 'pm-panel-event-contracts-check.py')
    concern = module('dg6a_final_concern', 'pm-concern-created-contracts-check.py')
    shared = panel.shared
    results = []
    restored = {}

    def cli(family, check, name, script, path=None, change=None, expected=1, args=()):
        target = ROOT / path if path else None
        original = target.read_bytes() if target else None
        if target:
            restored[str(target.relative_to(ROOT))] = hashlib.sha256(original).hexdigest()
        try:
            if target:
                value = json.loads(original)
                change(value)
                target.write_text(json.dumps(value, indent=2) + '\n')
            command = [sys.executable, 'scripts/' + script, *args]
            proc = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
            passed = proc.returncode == expected
            if expected == 0:
                passed = passed and json.loads(proc.stdout)['status'] == 'pass'
            results.append(dict(family=family, check=check, name=name, command=command,
                                expected_exit=expected, actual_exit=proc.returncode, passed=passed,
                                stdout=proc.stdout, stderr=proc.stderr))
            print(f"{family}: {check} {name}: {'PASS' if passed else 'FAIL'} (exit {proc.returncode})", file=sys.stderr, flush=True)
        finally:
            if target:
                target.write_bytes(original)

    for kind, folder, script in (
            ('alert', 'alert_event_contracts', 'pm-alert-event-contracts-check.py'),
            ('panel', 'panel_event_contracts', 'pm-panel-event-contracts-check.py'),
            ('concern', 'concern_created_contracts', 'pm-concern-created-contracts-check.py')):
        cli(kind, 'baseline', 'unmodified full checker', script, expected=0)
        for family in load('Plans/' + folder + '/manifest.json')['families']:
            event = family['event_type']
            path = 'Plans/' + folder + '/' + family['slug'] + '.fixtures.json'
            fixture = load(path)
            op_schema_path = 'Plans/' + folder + '/' + family['operation'] + '.schema.json'
            cp_schema_path = 'Plans/' + folder + '/' + family['checkpoint'] + '.schema.json'

            def fixture_case(check, name, change, expected=1):
                cli(event, check, name, script, path, change, expected)

            fixture_case('1', 'current writer replay-only', lambda v: v['writer_policy_cases'][0].update(policy='projector_replay_only'))
            if kind == 'panel':
                app_index = next(i for i, c in enumerate(fixture['payload_cases']) if c['valid'] and c['value']['project_id'] is None)
                app = fixture['payload_cases'][app_index]['value']
                correct = 'application@1:' + app['server_id'].encode().hex() + ':' + app['interaction_transaction_id'].encode().hex()
                assert app['idempotency_key'] == correct
                for bad in ('fixture', correct + 'x', correct.upper(), 'application@1:server:fixture'):
                    fixture_case('2', 'CV-366 malformed/unequal ' + bad,
                                 lambda v, bad=bad: v['payload_cases'][app_index]['value'].update(idempotency_key=bad))
            else:
                fixture_case('2', 'application attempt on Project-only family',
                             lambda v: operation(v, kind)['payload'].update(project_id=None))
            fixture_case('3', 'raw Project partition positive', lambda v: v['partition_cases'][0].update(value='fixture'))
            if kind != 'alert':
                fixture_case('3', 'raw original-operation Project partition', lambda v: operation(v, kind).update(scope_partition='fixture'))

            def oversize(v):
                op = operation(v, kind)
                if kind == 'alert':
                    for field in ('prior_owner_state', 'candidate_owner_state'):
                        op[field]['source_record_ref'] = 'pmref:source:' + 'x' * 17000
                elif kind == 'panel':
                    op['original_command']['actor_ref'] = op['payload']['actor_ref'] = 'a' * 17000
                    op['request_digest'] = panel.request_digest(op['original_command'], op['payload'])
                else:
                    refs = ['pmref:source:' + str(i).zfill(2) + 'x' * 305 for i in range(32)]
                    for field in ('original_command', 'payload', 'candidate_record'):
                        op[field]['evidence_refs'] = refs
                        op[field]['source_event_refs' if field == 'candidate_record' else 'source_refs'] = refs
                    op['request_digest'] = concern.digest(op)
                assert not list(shared.Draft202012Validator(load(op_schema_path)).iter_errors(op)), 'oversize must retain schema-valid shape'
                assert len(shared.packed(op)) > 16384

            fixture_case('4', 'schema-valid oversized complete operation', oversize)
            if kind == 'alert':
                fixture_case('4', '16385-byte operation cannot be positive', lambda v: v['operation_size_cases'][1].update(valid=True))
            fixture_case('5', 'payload identifier trailing LF', lambda v: operation(v, kind)['payload'].update(actor_ref=operation(v, kind)['payload']['actor_ref'] + '\n'))
            fixture_case('5', 'nested token hash trailing LF', lambda v: checkpoint(v, kind)['index_read_token'].update(frontier_sha256='a' * 64 + '\n'))
            fixture_case('6', 'altered caller body claimed equal', lambda v: v['semantic_digest_cases'][-1].update(same_digest=True))
            for index in range(3):
                fixture_case('6', 'Storage-assigned metadata claimed semantic ' + str(index),
                             lambda v, index=index: v['semantic_digest_cases'][index].update(same_digest=False))

            for coherent in (False, True):
                def foreign(v, coherent=coherent):
                    cp = checkpoint(v, kind)
                    cp['index_read_token']['storage_instance_id'] = '00000000-0000-4000-8000-000000000002'
                    if coherent:
                        cp['storage_instance_id'] = cp['index_read_token']['storage_instance_id']
                        cp['index_read_token']['source_selection']['storage_instance_id'] = cp['storage_instance_id']
                fixture_case('7', 'foreign ' + ('coherent triple' if coherent else 'single token'), foreign)
            fixture_case('8', 'negative policy expectation changed to success', lambda v: v['writer_policy_cases'][1].update(valid=True))
            cli(event, '8', 'failure oracle rejects process exit zero', Path(__file__).name,
                args=('--failure-exit-probe', '0'))

            for schema_path in (family['payload_schema'], op_schema_path, cp_schema_path):
                cli(event, '9', 'unused unresolved reference ' + schema_path, script, schema_path,
                    lambda v: v.setdefault('$defs', {}).update(final_round_unresolved={'$ref': '#/$defs/does_not_exist'}))
            def broken_embedded(v):
                row = next(row for row in v['families'] if row['family_id'] == family['operation'])
                row['value_schema'].setdefault('$defs', {})['unused_broken'] = {'$ref': '#/$defs/does_not_exist'}
            cli(event, '9', 'unresolved embedded registry reference', script, 'Plans/storage_value_registry.json', broken_embedded)
            if kind == 'alert':
                for field in ('source_refs', 'evidence_refs'):
                    fixture_case('9', 'valid nonempty optional ' + field,
                                 lambda v, field=field: operation(v, kind)['payload'].update({field: ['pmref:source:fixture']}), 0)

            # Mutate the actual traversed checkpoint or candidate original, keeping
            # independently expected publication/payload/receipt/source untouched.
            for case in fixture['history']['cases']:
                if case['valid']:
                    continue
                def history_defect(v, case=case):
                    request = dict(checkpoint=checkpoint(v, kind), event=v['history']['event'],
                                   disclosure=v['history']['disclosure'])
                    shared.history_patch(request, case)
                fixture_case('10', case['name'], history_defect)
            payload_schema, cp_schema = load(family['payload_schema']), load(cp_schema_path)
            if kind == 'alert':
                reader = lambda request, expected: shared.historical_alert_page(request, expected, family, payload_schema, cp_schema)
                history_shared = shared
            elif kind == 'panel':
                historical_schema = load('Plans/event_payloads/' + family['slug'] + '.schema.json')
                reader = lambda request, expected: panel.historical_panel_page(request, expected, family, payload_schema, historical_schema, cp_schema)
                history_shared = panel.shared
            else:
                reader = lambda request, expected: concern.historical_concern_page(request, expected, payload_schema, cp_schema)
                history_shared = concern.shared
            datasets = [('current-schema', fixture, checkpoint(fixture, kind))]
            if kind == 'panel':
                legacy = dict(history=fixture['historical_history'])
                datasets.append(('historical-v1', legacy, legacy['history']['expected']['checkpoint']))
            for version, dataset, cp in datasets:
                observations = []
                history_shared.historical_reader_cases(dataset, cp, reader, observations)
                for observation in observations:
                    results.append(dict(family=event, check='11' if not observation['valid'] else '10',
                                        version=version, **observation))

            for fid in (family['operation'], family['checkpoint']):
                cli(event, 'A1', 'missing mandatory profile ' + fid, script, 'Plans/storage_value_registry.json',
                    lambda v, fid=fid: v['storage_profile']['family_profiles'].pop(fid))
            fixture_case('A2', 'unbounded 1000-ref checkpoint', lambda v: checkpoint(v, kind).update(event_refs=['event_' + str(i) + '_' + 'a' * 64 for i in range(1000)]))
            fixture_case('A2', 'persisted live snapshot in durable token', lambda v: checkpoint(v, kind)['index_read_token'].update(redb_snapshot_id='forbidden'))
            for size in (16384, 16385):
                def checkpoint_boundary(v, size=size):
                    if kind == 'alert' and size == 16384:
                        # Alert read-through uses a deliberately compact baseline;
                        # exercise its complete-value maximum via the dedicated
                        # boundary vector, retaining the compact-baseline assertion.
                        v['checkpoint_size_cases'].append(dict(name='final_exact_16384', encoded_bytes=size, valid=True))
                    else:
                        resize_checkpoint(checkpoint(v, kind), size, shared.packed)
                        if size == 16384:
                            # A legitimate new token ref has its own independent
                            # publication witness; do not forge the old witness.
                            v['history']['expected']['checkpoint']['index_read_token']['checkpoint_ref'] = checkpoint(v, kind)['index_read_token']['checkpoint_ref']
                fixture_case('A2', 'complete checkpoint boundary ' + str(size),
                             checkpoint_boundary, 0 if size == 16384 else 1)
            if kind == 'panel':
                for field, bad in (('panel_id', 'work'), ('host_state_persisted', True), ('workspace_layout_changed_coemitted', True)):
                    fixture_case('A3', 'current panel semantics ' + field,
                                 lambda v, field=field, bad=bad: operation(v, kind)['payload'].update({field: bad}))
                fixture_case('A3', 'historical v1 cannot become current writer',
                             lambda v: v['payload_cases'][0].update(value=copy.deepcopy(v['historical_v1'])))
                for field, bad in (('settled_at_utc', '2026-11-04T19:00:00Z'), ('interaction_transaction_id', 'foreign-transaction')):
                    fixture_case('panel-digest', 'unchanged digest with altered ' + field,
                                 lambda v, field=field, bad=bad: operation(v, kind)['payload'].update({field: bad}))
            if kind == 'concern':
                for creator in ('Worker', 'User', 'External Resource', 'Recovery', 'Observer'):
                    def bad_creator(v, creator=creator):
                        op = operation(v, kind)
                        op['original_command']['creator_kind'] = creator
                        op['candidate_record']['created_by_kind'] = creator
                        op['request_digest'] = concern.digest(op)
                    fixture_case('A4', 'coherent unauthorized creator ' + creator, bad_creator)
            cli(event, 'A5', 'overstated retention grade', Path(__file__).name, GRADE,
                lambda v: next(r for r in v['families'] if r['event_type'] == event)['cells']['retention'].update(status='PASS'),
                args=('--audit-grade-only',))

    for fid in ('shared_alert_state', 'shared_alert_rule_state'):
        cli('alerts', 'A1', 'missing shared-state profile ' + fid, 'pm-alert-event-contracts-check.py',
            'Plans/storage_value_registry.json', lambda v, fid=fid: v['storage_profile']['family_profiles'].pop(fid))
    cli('concern.created', 'A1', 'missing original concern record profile', 'pm-concern-created-contracts-check.py',
        'Plans/storage_value_registry.json', lambda v: v['storage_profile']['family_profiles'].pop('concern_record'))
    cli('all', 'A5', 'unmodified grade/citation/hold audit', Path(__file__).name, expected=0, args=('--audit-grade-only',))
    def wrong_annotation(v):
        row = next(r for r in v['families'] if r['event_type'] == 'bundle.annotation_state_changed')
        row['disposition_evidence'][0]['unit'] = 'CV-049'
    cli('bundle.annotation_state_changed', 'A5', 'wrong annotation unit CV-049', Path(__file__).name,
        GRADE, wrong_annotation, args=('--audit-grade-only',))
    for path, digest in restored.items():
        assert hashlib.sha256((ROOT / path).read_bytes()).hexdigest() == digest, ('input not restored', path)
    data = dict(status='pass' if all(r['passed'] for r in results) else 'fail', reviewed_head=REVIEWED,
                executed_head=subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
                cases=len(results), results=results, restored_sha256=restored)
    if output:
        Path(output).write_text(json.dumps(data, indent=2) + '\n')
    print(json.dumps({key: value for key, value in data.items() if key not in ('results', 'restored_sha256')}))
    return 0 if data['status'] == 'pass' else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', help='Evidence output outside the repository')
    parser.add_argument('--audit-grade-only', action='store_true')
    parser.add_argument('--failure-exit-probe', type=int)
    args = parser.parse_args()
    if args.failure_exit_probe is not None:
        assert args.failure_exit_probe == 1, 'failure oracle rejected success exit code'
        print(json.dumps(dict(status='pass')))
        return 0
    if args.audit_grade_only:
        audit_grade()
        return 0
    return run_suite(args.output)


if __name__ == '__main__':
    raise SystemExit(main())

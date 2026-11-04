#!/usr/bin/env python3
"""DCH final-round mutations through the complete, unfiltered checker.

Only in-memory input substitutions and explicit defect restorations are used.
No checkout, fixture or schema file is modified. Exceptions do not count as a
successful rejection. --workers controls ordinary test processes, not agents.
"""
import argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
import contextlib
import copy
import importlib.util
import io
import json
from pathlib import Path
import time
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]


def run(job):
    family, name, expected = job
    spec = importlib.util.spec_from_file_location('dch_regression_subject', ROOT/'scripts/pm_dch_events.py')
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    contracts = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())
    fixtures = json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    checkpoints = json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    stored = json.loads((ROOT/'Plans/storage_value_registry.json').read_text())
    row = next(r for r in contracts['rows'] if r['event_type'] == family)
    cases = [f for f in fixtures if f['event_type'] == family]
    checkpoint = next(c for c in checkpoints if c['event_type'] == family)
    cp_path = checkpoint['schema_ref'].split('#')[0]
    schema = json.loads((ROOT/cp_path).read_text())
    entry = next(s for s in stored['families'] if s['value_schema_id'] == schema['$id'])
    overrides = {}
    original_retry, original_resolve, original_history = m.retry_outcome, m.resolve_body, m.historical_read_valid
    if name == '1_replay_only':
        for f in cases:
            f['record']['replay_policy'] = 'projector_replay_only'
    elif name == '2_old_application_key':
        f = next(f for f in cases if f['edition'] == 'application')
        f['record']['idempotency_key'] = 'dch:' + m.identity(family, f['valid'])[8:]
    elif name == '3_raw_project_partition':
        f = next(f for f in cases if f['edition'] == 'project')
        f['valid']['scope']['scope_partition'] = 'project~' + f['valid']['scope']['project_id']
        f['record']['payload'] = copy.deepcopy(f['valid'])
        f['record']['event_id'] = m.identity(family, f['valid'])
        f['record']['idempotency_key'] = m.idempotency_key(family, f['valid'])
    elif name == '4_inline_size_guard_removed':
        def resolve(record, source=None, storage_instance=m.STORAGE_INSTANCE):
            if record['event_type'] == family and record['payload_ref'] is None:
                return record['payload']
            return original_resolve(record, source, storage_instance)
        m.resolve_body = resolve
    elif name == '5_payload_identifier_lf':
        for f in cases:
            for p in [f['valid'], f['record']['payload']]:
                p['actor_ref'] += '\n'
            f['record']['actor_ref'] += '\n'
    elif name == '5_registry_pattern_regression':
        def unguard(value):
            if isinstance(value, dict):
                if 'pattern' in value:
                    value['pattern'] = value['pattern'].removesuffix(r'(?![\s\S])')
                for v in value.values():
                    unguard(v)
            elif isinstance(value, list):
                for v in value:
                    unguard(v)
        unguard(entry['value_schema'])
    elif name == '5_history_identifier_lf':
        checkpoint['with_history']['history'][0]['source_token']['generation_anchor_sha256'] += '\n'
    elif name == '6_whole_record_retry':
        def retry(a, b, available=True):
            result = original_retry(a, b, available)
            if a['event_type'] == family and result == 'original_result' and a != b:
                return 'conflict'
            return result
        m.retry_outcome = retry
    elif name in ['7_checkpoint_storage_mismatch', '7_current_frontier_mismatch']:
        if name == '7_checkpoint_storage_mismatch':
            for v in [checkpoint['valid'], checkpoint['valid']['source_token'],
                      checkpoint['valid']['source_token']['source_selection']]:
                v['storage_instance_id'] = '00000000-0000-4000-8000-000000000099'
        else:
            generation = checkpoint['source']['checkpoint']['current_generation_id']
            checkpoint['source']['checkpoint']['generations'][generation]['frontier_revision'] += 1
    elif name == '8_success_as_failure_or_fabricated_exit':
        for f in cases:
            if family.endswith('pre_merge_test_failed'):
                f['valid']['exit_code'] = 0
                f['record']['payload']['exit_code'] = 0
                f['test_source']['outcome']['exit_code'] = 0
            elif family.endswith('pre_merge_test_passed'):
                f['test_source']['outcome']['exit_code'] = 1
            else:
                f['valid']['exit_code'] = 0
                f['record']['payload']['exit_code'] = 0
    elif name.startswith('9_'):
        ref = '#/$defs/DCH_MISSING'
        if name == '9_payload_ref_missing':
            path = row['payload_schema_ref'].split('#')[0]
            payload = json.loads((ROOT/path).read_text())
            payload['oneOf'][0]['$ref'] = ref
            overrides[path] = payload
        else:
            if name == '9_history_file_ref_missing':
                ref = 'DCH_DOES_NOT_EXIST.schema.json#/$defs/source_token'
            if name in ['9_external_document_hidden_ref_missing', '9_external_document_cycle_valid']:
                file_name = 'DCH_REFERENCE_PROBE.schema.json'
                ref = file_name + '#/$defs/token'
                external = {'$schema': 'https://json-schema.org/draft/2020-12/schema',
                            '$defs': {'token': copy.deepcopy(schema['properties']['source_token']),
                                      'unused': {'$ref': '#/$defs/DCH_MISSING' if expected else '#/$defs/unused'}}}
                overrides[str(Path(cp_path).parent/file_name)] = external
                schema.setdefault('$defs', {})['external_probe'] = {'$ref': ref}
            elif name == '9_dynamic_anchor_missing':
                schema['properties']['optional_probe'] = {'$dynamicRef': '#DCH_MISSING_ANCHOR'}
            elif name == '9_valid_file_ref':
                ref = row['payload_schema_ref'].split('/')[-1] + '#/$defs/project'
                schema.setdefault('$defs', {})['file_probe'] = {'$ref': ref}
            elif name == '9_optional_ref_missing':
                schema['properties']['optional_probe'] = {'$ref': ref}
            elif name == '9_conditional_ref_missing':
                schema['allOf'] = [{'if': {'const': 'unreachable'}, 'then': {'$ref': ref}}]
            else:
                if name == '9_valid_history_ref':
                    ref = '#/properties/source_token'
                schema['properties']['history']['items']['properties']['source_token'] = {'$ref': ref}
            # Equal copies prove that reference closure, rather than schema
            # equality alone, catches unexercised defects in either definition.
            if name != '9_registry_only_history_ref_missing':
                overrides[cp_path] = schema
            if name != '9_selected_only_history_ref_missing':
                entry['value_schema'] = copy.deepcopy(schema)
    elif name == '10_live_state_required_for_history':
        def historical(record, selected, witness, envelope, validator):
            return (witness['live_state']['revision'] == 1
                    and original_history(record, selected, witness, envelope, validator))
        m.historical_read_valid = historical
    elif name in ['10_withdrawn_history_claimed_valid', '10_forged_history_claimed_valid']:
        oracle_name = 'withdrawn_event' if name == '10_withdrawn_history_claimed_valid' else 'forged_original'
        for f in cases:
            next(o for o in f['historical_oracles'] if o['name'] == oracle_name)['expected_valid'] = True
    elif name == 'F3_archive_stopped_again':
        row['outcome'] = 'blocked_on_Jared'
    elif name == 'F3_automatic_archive':
        for f in cases:
            f['valid']['archive_origin'] = 'automatic'
            f['record']['payload']['archive_origin'] = 'automatic'
            f['archive_source']['request']['origin'] = 'automatic'
    elif name in ['B2_legal_large_inline_body','B2_original_review_maximum_arrays_inline']:
        for f in cases:
            large_cases = [o for o in f['transport_oracles'] if o['expected_valid'] and o.get('source')
                           and len(m.body_bytes(o['source']['body'])) > m.INLINE_LIMIT]
            large = (max(large_cases,key=lambda o:len(m.body_bytes(o['source']['body'])))
                     if name == 'B2_original_review_maximum_arrays_inline' else large_cases[0])
            f['valid'] = copy.deepcopy(large['source']['body'])
            f['record']['payload'] = copy.deepcopy(f['valid'])
            f['record']['payload_ref'] = None
    elif name == 'B2_payload_reference_support_removed':
        def resolve(record, source=None, storage_instance=m.STORAGE_INSTANCE):
            if record['event_type'] == family and record['payload_ref'] is not None:
                return None
            return original_resolve(record, source, storage_instance)
        m.resolve_body = resolve
    else:
        raise ValueError(name)
    overrides.update({'Plans/dch_event_contracts.json': contracts,
                      'Plans/dch_event_contract_fixtures.json': fixtures,
                      'Plans/dch_checkpoint_fixtures.json': checkpoints,
                      'Plans/storage_value_registry.json': stored})
    inputs = {str(ROOT/k): json.dumps(v) for k,v in overrides.items()}
    original_read = Path.read_text
    def read(path, *args, **kwargs):
        return inputs[str(path)] if str(path) in inputs else original_read(path,*args,**kwargs)
    buffer = io.StringIO()
    started = time.monotonic()
    try:
        with patch.object(Path, 'read_text', read), contextlib.redirect_stdout(buffer):
            code = int(m.main())
        report = json.loads(buffer.getvalue())
        failure_rows = report['failures']
        ok = (code == expected and report['status'] == ('pass' if expected == 0 else 'fail')
              and (not expected or any(x.startswith(family+':') for x in failure_rows)))
        if name.startswith('9_') and expected:
            ok = ok and any('reference closure' in x and family+':' in x for x in failure_rows)
        return {'family': family, 'mutation': name, 'expected_exit': expected, 'exit': code,
                'status': report['status'], 'checks': report['checks'], 'pass': ok,
                'failure_count': len(failure_rows), 'failures': failure_rows,
                'family_counters': report['per_family'], 'seconds': round(time.monotonic()-started,2)}
    except Exception as exc:
        return {'family':family,'mutation':name,'pass':False,'exception':type(exc).__name__+': '+str(exc)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workers',type=int,default=1)
    parser.add_argument('--out',type=Path,required=True)
    args = parser.parse_args()
    rows = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    negative = ['1_replay_only','2_old_application_key','3_raw_project_partition',
                '4_inline_size_guard_removed','5_payload_identifier_lf','5_registry_pattern_regression',
                '5_history_identifier_lf','6_whole_record_retry','7_checkpoint_storage_mismatch',
                '7_current_frontier_mismatch','8_success_as_failure_or_fabricated_exit',
                '9_payload_ref_missing','9_history_ref_missing','9_history_file_ref_missing',
                '9_optional_ref_missing','9_conditional_ref_missing','9_selected_only_history_ref_missing',
                '9_registry_only_history_ref_missing','9_external_document_hidden_ref_missing',
                '9_dynamic_anchor_missing','10_live_state_required_for_history',
                '10_withdrawn_history_claimed_valid','10_forged_history_claimed_valid',
                'B2_payload_reference_support_removed']
    jobs = [(r['event_type'],name,1) for r in rows for name in negative]
    jobs += [(r['event_type'],name,0) for r in rows for name in ['9_valid_history_ref','9_valid_file_ref','9_external_document_cycle_valid']]
    jobs += [('chat.thread_archived',name,1) for name in ['F3_archive_stopped_again','F3_automatic_archive']]
    jobs += [(family,'B2_legal_large_inline_body',1) for family in ['chat.message','bundle.selection_sent_to_chat']]
    jobs += [(family,'B2_original_review_maximum_arrays_inline',1)
             for family in ['chat.message','bundle.selection_sent_to_chat']]
    results = []
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        for future in as_completed([pool.submit(run,job) for job in jobs]):
            result = future.result()
            results.append(result)
            print(json.dumps({k:v for k,v in result.items() if k in ['family','mutation','pass','exit','seconds','exception']}),flush=True)
    report = {'status':'pass' if all(r['pass'] for r in results) else 'fail',
              'method':'Every mutation invokes the entire unfiltered main checker with all seventeen families. In-memory substitutions only; exceptions are failures, never accepted rejections.',
              'jobs':len(jobs),'unexpected':[r for r in results if not r['pass']],
              'results':sorted(results,key=lambda r:(r['family'],r['mutation']))}
    args.out.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k != 'results'}))
    return report['status'] != 'pass'


if __name__ == '__main__':
    raise SystemExit(main())

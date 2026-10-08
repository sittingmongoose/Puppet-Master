#!/usr/bin/env python3
"""Validate an explicit final T3 metadata capture; do not capture or poll."""
from pathlib import Path
import argparse
import datetime
import hashlib
import json

ROOT_ID = '5a126dd5-9c71-4cc2-83d6-9ad1985bacad'
FUTURE = ['D-M06-A', 'D-M06-B', 'D-M07-B', 'D-M09-A']
QUIET = {'idle', 'completed', 'interrupted', 'failed', 'cancelled', 'rolled_back'}


def parse_result(raw):
    if raw.get('isError'):
        raise ValueError('Actual metadata tool error remains unresolved')
    return raw.get('structuredContent') or json.loads(next(x['text'] for x in raw['content'] if x['type'] == 'text'))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('capture', type=Path)
    p.add_argument('case_registry', type=Path)
    p.add_argument('--output', type=Path, required=True)
    a = p.parse_args()
    assert not a.output.exists()
    cap_raw, reg_raw = a.capture.read_bytes(), a.case_registry.read_bytes()
    cap, registry = json.loads(cap_raw), json.loads(reg_raw)
    assert cap['root_thread_id'] == ROOT_ID
    pages = [parse_result(v['response']) for v in cap['project_list_pages']]
    assert pages and pages[-1]['nextCursor'] is None
    assert len({v['projectId'] for v in pages}) == 1
    rows = [v for page in pages for v in page['threads']]
    assert len({v['threadId'] for v in rows}) == len(rows)
    byid = {v['threadId']: v for v in rows}
    owned = {ROOT_ID}
    while True:
        additions = {v['threadId'] for v in rows if v['parentThreadId'] in owned} - owned
        if not additions:
            break
        owned |= additions
    # Registered app-owned task IDs bind the case to actual backing threads;
    # names and task statuses are not substitutes for native Goal identities.
    expected = set(cap['registered_root_child_thread_ids'])
    assert expected <= owned, 'A registered root-owned thread is absent from the completed project census'
    metadata = {}
    for rec in cap['owned_thread_reads']:
        v = parse_result(rec['response'])['thread']
        assert v['threadId'] == rec['thread_id'] and v['threadId'] not in metadata
        metadata[v['threadId']] = v
    assert set(metadata) == owned - {ROOT_ID}, 'Every owned descendant requires its actual final metadata read'
    violations = []
    for tid, v in metadata.items():
        if v['status'] not in QUIET or v['activeRunId'] is not None or v['pendingRequestCount'] != 0 or v['settled'] is not True:
            violations.append({'threadId': tid, 'status': v['status'], 'activeRunId': v['activeRunId'],
                               'pendingRequestCount': v['pendingRequestCount'], 'settled': v['settled']})
    assert not violations, violations
    direct = [parse_result(x['response']) for x in cap['root_owned_task_status_reads']]
    assert len({x['taskId'] for x in direct}) == len(direct)
    for t in direct:
        assert t['childThreadId'] in expected
        assert t['status'] in QUIET - {'idle'} and t['workState'] == 'result_available'
        assert t['hasPendingChildRuns'] is False
    assert {x['childThreadId'] for x in direct} == expected
    cases = {}
    for sid in FUTURE:
        refs = registry['cases'][sid]
        assert refs, 'The exact case task registry is empty'
        seeds = set()
        for ref in refs:
            path = Path(ref['authority_path'])
            body = path.read_bytes()
            assert hashlib.sha256(body).hexdigest() == ref['authority_sha256']
            doc = json.loads(body)
            for token in ref['child_thread_pointer'].split('/')[1:]:
                token = token.replace('~1', '/').replace('~0', '~')
                doc = doc[int(token)] if isinstance(doc, list) else doc[token]
            assert doc == ref['child_thread_id'] and doc in metadata
            seeds.add(doc)
        descendants = set(seeds)
        while True:
            more = {v['threadId'] for v in rows if v['parentThreadId'] in descendants} - descendants
            if not more:
                break
            descendants |= more
        assert descendants <= set(metadata)
        cases[sid] = {'scope': 'ALL_ORIGINAL_CANDIDATE_REVIEW_TASK_TREES_AND_DESCENDANTS_QUIET',
                      'actual_registered_case_thread_ids': sorted(seeds),
                      'actual_descendant_thread_ids': sorted(descendants - seeds),
                      'all_task_trees_and_descendants_actual_quiet': True,
                      'actual_settlement_verified': True,
                      'native_complete_or_scientific_quality_inferred': False}
    out = {'schema': 'ER10_ROOT_FINAL_OWNED_T3_TREE_QUIET_VALIDATION_V1',
           'recorded_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'capture': {'path': str(a.capture), 'sha256': hashlib.sha256(cap_raw).hexdigest()},
           'case_registry': {'path': str(a.case_registry), 'sha256': hashlib.sha256(reg_raw).hexdigest()},
           'owned_descendant_threads': len(metadata), 'root_direct_tasks': len(direct),
           'complete_project_paginated_census': True,
           'all_owned_candidate_review_helper_coordinator_task_trees_actual_quiet': True,
           'all_owned_backing_threads_settled': True, 'cases': cases,
           'root_closeout_thread_intentionally_active': ROOT_ID,
           'historical_native_disposition_holds_unchanged': True,
           'limits': 'Actual T3 task/thread queue and descendant quiet only. Historical missing native receipts stay missing; paused/blocked Goals are not relabeled complete. Root closeout and its partial usage remain separate.'}
    with a.output.open('x') as stream:
        json.dump(out, stream, indent=2)
        stream.write('\n')
    print(json.dumps({'owned_descendants': len(metadata), 'direct_tasks': len(direct), 'future_cases': list(cases), 'passed': True}))


if __name__ == '__main__':
    main()

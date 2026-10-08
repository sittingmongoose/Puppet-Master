#!/usr/bin/env python3
"""Bind case task IDs to actual persisted dispatch responses; no liveness inference."""
import argparse
import hashlib
import json
from pathlib import Path

CASES = ['D-M06-A', 'D-M06-B', 'D-M07-B', 'D-M09-A']
NAMES = ['dispatch_original_tool_response.json', 'dispatch-receipt.json', 'dispatch.json']


def walk(obj, pointer=''):
    if isinstance(obj, dict):
        if all(isinstance(obj.get(k), str) for k in ['taskId', 'childThreadId', 'childRunId']):
            if obj['taskId'].startswith('node:delegated-task:') and obj['childThreadId'].startswith('thread:delegated-task:'):
                yield pointer, obj
        for key, value in obj.items():
            yield from walk(value, pointer + '/' + key.replace('~', '~0').replace('/', '~1'))
    elif isinstance(obj, list):
        for i, value in enumerate(obj):
            yield from walk(value, pointer + '/' + str(i))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--root', type=Path, required=True)
    ap.add_argument('--output', type=Path, required=True)
    a = ap.parse_args()
    assert not a.output.exists()
    out = {'schema': 'ER10_EXACT_ORIGINAL_CASE_TASK_AUTHORITY_REGISTRY_V1',
           'cases': {}, 'liveness_or_native_or_scientific_quality_inferred': False}
    for sid in CASES:
        dirs = [a.root / 'jobs' / sid]
        for parent in [a.root / 'reviews/targeted-cohort2', a.root / 'reviews/targeted-cohort3', a.root / 'helpers/targeted-cohort2']:
            if parent.exists():
                dirs.extend(p for p in parent.glob(sid + '*') if p.is_dir())
        refs = {}
        for name in NAMES:
            for base in dirs:
                if not base.exists():
                    continue
                for path in sorted(base.rglob(name)):
                    raw = path.read_bytes()
                    doc = json.loads(raw)
                    for pointer, value in walk(doc):
                        tid = value['childThreadId']
                        record = {'authority_path': str(path), 'authority_sha256': hashlib.sha256(raw).hexdigest(),
                                  'child_thread_pointer': pointer + '/childThreadId', 'child_thread_id': tid,
                                  'task_id_pointer': pointer + '/taskId', 'task_id': value['taskId'],
                                  'original_child_run_id': value['childRunId']}
                        if tid not in refs:
                            refs[tid] = record
                        else:
                            assert refs[tid]['task_id'] == record['task_id']
        assert refs, 'No actual persisted dispatch task authority for ' + sid
        out['cases'][sid] = list(refs.values())
    a.output.parent.mkdir(parents=True, exist_ok=True)
    with a.output.open('x') as f:
        json.dump(out, f, indent=2)
        f.write('\n')
    print(json.dumps({'case_registered_task_counts': {k: len(v) for k, v in out['cases'].items()},
                      'sha256': hashlib.sha256(a.output.read_bytes()).hexdigest(),
                      'queue_closure_attested': False}))


if __name__ == '__main__':
    main()

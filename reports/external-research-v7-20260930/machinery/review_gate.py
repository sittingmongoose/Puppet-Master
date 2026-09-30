#!/usr/bin/env python3
"""Pin exact reviewed launch dependencies; never manufacture independent approval."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
from workspaces import sha, write_json, no_symlink_chain, OPERATOR_CODE

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
FREEZE = HERE / 'FREEZE.json'


def snapshot():
    names = ['workspaces.py', 'run_attempt.py', 'review_gate.py']
    values = {'dev/harness-v1/' + name: sha(HERE / name) for name in names}
    values.update({'dev/harness-v1/native/' + p.name: sha(p) for p in (HERE / 'native').glob('*.py')})
    values.update({'ops/' + name: sha(OPERATOR_CODE / name) for name in ['isolation.py', 'slot_ledger.py', 'mz_dispatch.py']})
    return dict(sorted(values.items()))


def seal(review_path):
    review_path = no_symlink_chain(review_path).resolve(strict=True)
    review = json.loads(review_path.read_text())
    if review.get('status') != 'accepted' or review.get('blocking_findings') != []:
        raise ValueError('independent review has not accepted this exact version')
    if review.get('reviewer') in (None, '', '/root/development2', '/root/dispatch_mz', '/root/dispatch_l'):
        raise ValueError('approval must identify an independent reviewer')
    files = snapshot()
    if review.get('reviewed_files') != files:
        raise ValueError('reviewed dependency hashes differ from current version')
    record = {'schema': 'er7.launch_freeze.v1', 'version': 'harness-v1-repair1',
              'frozen_utc': datetime.now(timezone.utc).isoformat(), 'files': files,
              'review_path': str(review_path), 'review_sha256': sha(review_path),
              'reviewer': review['reviewer'], 'status': 'accepted'}
    with FREEZE.open('x') as f:
        json.dump(record, f, indent=2); f.write('\n')
    return record


def verify_freeze():
    freeze = json.loads(FREEZE.read_text())
    if freeze.get('status') != 'accepted' or freeze['files'] != snapshot():
        raise ValueError('launch dependency differs from accepted freeze; version rather than hot-patch')
    path = no_symlink_chain(freeze['review_path']).resolve(strict=True)
    if sha(path) != freeze['review_sha256']:
        raise ValueError('independent acceptance receipt changed')
    return freeze


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('command', choices=['snapshot', 'seal', 'verify'])
    ap.add_argument('--review', type=Path)
    args = ap.parse_args()
    value = snapshot() if args.command == 'snapshot' else seal(args.review) if args.command == 'seal' else verify_freeze()
    print(json.dumps(value, indent=2))

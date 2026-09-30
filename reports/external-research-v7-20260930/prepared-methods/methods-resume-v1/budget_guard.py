#!/usr/bin/env python3
"""Read-only whole-case admission guard; does not dispatch, reserve slots, or change caps."""
import argparse
import json
from pathlib import Path
import time


def check(contract, registry, next_attempt, now=None):
    contract = json.loads(Path(contract).read_text())
    registry = json.loads(Path(registry).read_text())
    meta = json.loads((Path(next_attempt) / 'attempt.json').read_text())
    spec = meta['spec']
    prefix = contract['pair_id'] + '-'
    if not spec['job_id'].startswith(prefix) or spec['family'] != contract['family']:
        raise ValueError('next attempt outside exact whole-case identity/family')
    now = time.time() if now is None else now
    jobs = [x for name, x in registry['jobs'].items() if name.startswith(prefix)]
    if spec['job_id'] in registry['jobs']:
        raise ValueError('job already admitted; no reuse or reset')
    times = [x['admitted_epoch'] for x in jobs]
    elapsed = max(0, now - min(times)) if times else 0
    occupied = sum(max(0, (x.get('released_epoch') or now) - x['admitted_epoch']) for x in jobs)
    # Retain full remaining allowance of active jobs when checking aggregate future admission.
    active_reserved = sum(max(0, x['admitted_epoch'] + x['cap_seconds'] - now)
                          for x in jobs if x.get('released_epoch') is None)
    cap = spec['caps']['seconds']
    limits = contract['whole_case_caps']
    violations = []
    if elapsed + cap > limits['seconds']:
        violations.append('Remaining whole-case wall clock is shorter than fixed next-stage cap; do not silently shrink/reset.')
    if occupied + active_reserved + cap > limits['aggregate_slot_seconds']:
        violations.append('Whole-case occupied plus active reserved plus fixed next-stage allowance exceeds slot-time cap.')
    return {'schema': 'er7.whole_case_budget_check.v1', 'pair_id': contract['pair_id'],
            'next_job_id': spec['job_id'], 'case_started_epoch': min(times) if times else None,
            'elapsed_seconds': elapsed, 'occupied_slot_seconds': occupied,
            'active_reserved_seconds': active_reserved, 'next_fixed_cap_seconds': cap,
            'whole_case_caps': limits, 'violations': violations, 'admit': not violations,
            'race_policy': 'Sole dispatcher checks immediately before its lease admission; candidate family cap still independently enforced by slot ledger.'}


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    for key in ('contract', 'registry', 'next-attempt'):
        p.add_argument('--' + key, type=Path, required=True)
    a = p.parse_args()
    r = check(a.contract, a.registry, a.next_attempt)
    print(json.dumps(r, indent=2))
    raise SystemExit(0 if r['admit'] else 2)

#!/usr/bin/env python3
"""Re-judge one W2 later-refusal row's complete-call trials with the fixed stock judge (DG5 addendum 6).

    PYTHONHASHSEED=<seed> python3 -B scripts/pm_goal_dg5_methodb_w2_rejudge.py --case DECLARATION.json \
        --reference REFERENCE.json.gz [--native-bindings NATIVE.json.gz] [--root dg5:...] --out DIR

The trial part of pm_goal_dg5_methodb_w2_forwarded.check_root, and nothing else: the same fixture, the same
ForwardedCall / HistoricalOriginalCall, the same check_calls (or prove for a directly accepted projector row),
the same later code, with pm_goal_guard_sweep.Collector judging. The per-rule replay (replay_root and the
historical clause examples) is not run: it does not decide the row's kill class, and its historical report
paths are VM scratch that no longer exists. Writes DIR/<root>/proof/ (pilot.run_gates: ledger, signatures,
source-bindings) and DIR/<root>/rejudge.json (the row's judged record: kill class, killed_code_check,
covered_later_check, cannot_decide_reason, refusal code and origin, after-state, the trial codes).
A root whose fixture is declared for another hash seed or whose installed registry differs is skipped and
listed (run it under the declared PYTHONHASHSEED). Exit 0 when every selected root was judged.
"""
import argparse
import json
import os
from pathlib import Path
import sys
import time

import pm_goal_dg5_methodb_w2_forwarded as forwarded

worker = forwarded.worker
KEYS = ('id', 'label', 'target', 'outcome', 'kill', 'errors', 'cut_errors', 'restoration_errors',
        'restoration_repeat_errors', 'joint_cut', 'refusal_code', 'refusal_origin', 'refusing_sites', 'after_state',
        'killed_code_check', 'covered_later_check', 'cannot_decide_reason')


def later_code_for(name, specification):
    if name in forwarded.ORIGINAL_SCHEMAS:
        return forwarded.original_later_code(name, specification)
    if name in forwarded.ISSUER_FORWARDING:
        return forwarded.ISSUER_FORWARDING[name] + '/schema/:additionalProperties'
    if name in forwarded.CURRENT_GOAL_CHECKS:
        return 'read_current/final_current_goal'
    if name in forwarded.CURRENT_START_CHECKS:
        return 'read_current/final_current_start'
    if name in forwarded.RETAINED_READ:
        return 'read_retained_native/final_fence'
    late, _, _, _, defect = forwarded.DEPENDENCIES[name]
    return f'{late}/schema/{defect}:additionalProperties' if defect else late


def judge_root(out, name, specification, sites):
    started = time.monotonic()
    worker.pilot.PREFIX = worker.TABLE_PREFIX
    worker.pilot.SITES.clear()
    worker.pilot.SITES[name] = min(sites)
    worker.pilot.configure_tables()
    out.mkdir(parents=True)
    suite = worker.stage.original.Suite(out / 'stores')
    fixture = worker.Fixture(suite, specification['route'], specification['edition'])
    original = name in forwarded.ORIGINAL_SCHEMAS
    experiment = (forwarded.HistoricalOriginalCall if original else forwarded.ForwardedCall)(
        fixture, name, sites, specification)
    collector = worker.stage.sweep.Collector()
    later = later_code_for(name, specification)
    direct = name in forwarded.PROJECTOR_ORIGINAL and specification['validation_site'] == [forwarded.READERS, 256]
    error = None
    try:
        if direct:
            experiment.prove(collector, None)
        else:
            forwarded.check_calls(experiment, collector, specification['root'], later)
    except ValueError as exc:   # the harness's own premise checks; the judged record is still reported
        error = str(exc)[:600]
    proof = worker.pilot.run_gates(collector, out, [name])
    judged = [{k: r.get(k) for k in KEYS} for r in collector.ledger if r.get('target') == name]
    report = dict(row=name, root=specification['root'], later=later, direct=direct,
                  seed=int(os.environ.get('PYTHONHASHSEED', '-1')), harness_error=error,
                  kill=[r['kill'] for r in judged], judged=judged, proof=str(proof),
                  trial_codes=[run.get('code') for run in experiment.runs],
                  seconds=round(time.monotonic() - started, 3), collector_failures=collector.failures)
    worker.write(out / 'rejudge.json', report)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--case', type=Path, required=True)
    parser.add_argument('--reference', type=Path, required=True)
    parser.add_argument('--native-bindings', type=Path)
    parser.add_argument('--root')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    case = json.loads(args.case.read_bytes())
    reference = worker.load_reference(args.reference, [case], args.native_bindings)
    name = case['row']
    mapped = reference['rows'][name]
    sites = {(item['path'], item['line']) for item in mapped['current_sites']}
    worker.require(all(worker.sha(worker.ROOT / item['path']) == item['sha256'] for item in mapped['current_sites']),
                   f'{name}: current validator source changed')
    v3 = worker.world.v3_edition()
    banks = {'v3': v3.bank.original, 'goal-v3': v3.goal_bank.original}
    if any(spec['edition'] == 'v7' for spec in case['fixtures']):
        banks['v7'] = worker.world.v7_edition().bank.original
    seed = int(os.environ.get('PYTHONHASHSEED', '-1'))
    summary = dict(row=name, case=str(args.case), judged=[], skipped=[])
    for spec in case['fixtures']:
        ident = spec['root']
        if args.root and args.root != ident:
            continue
        if 'hash_seed' in spec and spec['hash_seed'] != seed:
            summary['skipped'].append(dict(root=ident, reason=f"declared for PYTHONHASHSEED={spec['hash_seed']}"))
            continue
        exact = reference['roots'][ident]
        plain = banks[spec.get('bank', spec['edition'])].validator(json.loads(exact['schema'])['$ref'])
        if worker.closure._registry_digest(plain) != exact['registry_sha256']:
            summary['skipped'].append(dict(root=ident, reason='installed registry digest differs under this seed'))
            continue
        report = judge_root(args.out / ident.removeprefix('dg5:'), name, spec, sites)
        summary['judged'].append(dict(root=ident, kill=report['kill'], harness_error=report['harness_error']))
    worker.write(args.out / 'summary.json', summary)
    print(json.dumps(summary))
    return 0 if summary['judged'] and not summary['skipped'] else 1


if __name__ == '__main__':
    sys.exit(main())

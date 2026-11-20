#!/usr/bin/env python3
"""Assemble reports/event-authority-20261105/W3D-pnc019-s4d-summary.json from the PNC-019 s4d run outputs.

Each input is a run output file (checker, guard summary, derivation mutations, slot corpus, plan coverage, number
runner, strict mutation proof); its SHA-256 is recorded with the counts taken from it. The summary's status is pass
only when every input reports pass.

Usage: python3 scripts/pm_w3d_bsd_pnc019_summary.py --checker F --guard F --mutations F --slots F --coverage F \
           --numbers F --proof F --head SHA
"""
import argparse
import collections
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3d_bsd_rows as rows_spec  # noqa: E402

OUT = ROOT / 'reports/event-authority-20261105/W3D-pnc019-s4d-summary.json'


def load(path):
    data = Path(path).read_bytes()
    return json.loads(data), hashlib.sha256(data).hexdigest()


def rows_with(prefix):
    return sorted({r[0] for _ph, (_t, rows) in rows_spec.all_phases().items() for r in rows if r[0].startswith(prefix)})


def main(argv=None):
    ap = argparse.ArgumentParser()
    for name in ('checker', 'guard', 'mutations', 'slots', 'coverage', 'numbers', 'proof'):
        ap.add_argument('--' + name, required=True)
    ap.add_argument('--head', required=True)
    args = ap.parse_args(argv)
    checker, checker_sha = load(args.checker)
    guard, guard_sha = load(args.guard)
    mutations, mutations_sha = load(args.mutations)
    slots, slots_sha = load(args.slots)
    coverage, coverage_sha = load(args.coverage)
    numbers, numbers_sha = load(args.numbers)
    proof, proof_sha = load(args.proof)
    phases = rows_spec.all_phases()
    entailed = sorted(ph for ph in phases if ph.endswith('_entailed') or '_entailed_' in ph)
    statuses = collections.Counter(guard['status_counts'] if 'status_counts' in guard else {})
    mut_counts = mutations.get('counts', {})
    ok = (checker.get('status') == 'pass' and set(guard.get('status_counts', {})) == {'PASS'}
          and mutations.get('status') == 'pass' and slots.get('status') == 'pass' and coverage.get('status') == 'pass'
          and numbers.get('status') == 'pass' and proof.get('status') == 'pass')
    summary = {
        'schema_id': 'pm.w3d.bsd.pnc019_s4d_summary.v1',
        'lane': 'PNC-019 s4d (stream E)',
        'head_before_report': args.head,
        'status': 'pass' if ok else 'fail',
        'criterion_12': 'PASS' if ok else 'PARTIAL',
        'native_execution': 'NOT_RUN',
        'membership': 'ABSENT',
        'checker': {'path': 'scripts/pm_w3d_bsd_events.py', 'output_sha256': checker_sha, 'status': checker.get('status'),
                    'families': checker.get('families'), 'positives': checker.get('positives'),
                    'negatives': checker.get('negatives'), 'single_row': checker.get('single_row'),
                    'declared_multi_row': checker.get('multi_row'), 'mismatches': len(checker.get('mismatches', [])),
                    'unresolved_refs': len(checker.get('unresolved_refs', []))},
        'guard_tool': {'path': 'scripts/pm_w3d_bsd_guard_chunked.py (gated scripts/pm_guard_isolation.py, unedited)',
                       'output_sha256': guard_sha, 'suites': sum(statuses.values()), 'status_counts': dict(statuses),
                       'reused': len(guard.get('reused', [])), 'tables_total': len(rows_spec.chunked_phases()),
                       'entailed_tables': len([p for p in rows_spec.chunked_phases() if '_entailed' in p]),
                       'max_rows_per_table': max(len(r) for _t, r in rows_spec.chunked_phases().values())},
        'derivation_mutations': {'path': 'scripts/pm_w3d_bsd_derivation_mutations.py', 'output_sha256': mutations_sha,
                                 'status': mutations.get('status'), 'mutations': mutations.get('mutations'),
                                 'counts': mut_counts, 'model_functions_listed_not_mutated': mutations.get('model_functions')},
        'strict_mutation_proof': {'path': 'scripts/pm_w3d_bsd_mutation_proof.py', 'output_sha256': proof_sha,
                                  'status': proof.get('status'), 'groups': proof.get('groups')},
        'slot_corpus': {'path': 'scripts/pm_w3d_bsd_slot_corpus.py', 'output_sha256': slots_sha, 'status': slots.get('status'),
                        'number_values': slots.get('number_values'), 'date_time_values': slots.get('date_time_values'),
                        'totals': slots.get('totals'), 'slots': sorted(slots.get('per_slot', {}))},
        'number_routes': {'path': 'scripts/pm_w3d_bsd_numbers.py', 'output_sha256': numbers_sha, 'status': numbers.get('status'),
                          'complete_checker_routes': numbers.get('complete_checker_routes')},
        'plan_coverage': {'path': 'scripts/pm_w3d_bsd_plan_coverage.py', 'output': 'reports/event-authority-20261105/W3D-plan-coverage.json',
                          'output_sha256': coverage_sha, 'status': coverage.get('status'), 'totals': coverage.get('totals')},
        'crash_model': {'rows': rows_with('CR') + rows_with('CD'), 'note': 'run_producer / recover: every cut and recovery'},
        'retry_model': {'rows': rows_with('RT'), 'note': 'run_retry on a Storage store snapshot'},
        'replay_model': {'rows': rows_with('RP'), 'note': 'run_replay with instrumented effect sinks'},
        'withdrawal_model': {'rows': rows_with('WD') + ['HI09_reader_enabled', 'CS07_publication_not_withdrawn'] + rows_with('RB'),
                             'note': 'run_withdrawal on governance state; run_rebuild under an admitted successor'},
        'restore_model': {'rows': rows_with('RS_') + ['HI14_backup_coherent'], 'note': 'backup cut and restore'},
        'retention_model': {'rows': rows_with('RN'), 'note': 'retention_decision against the Storage retention catalog'},
        'owner_joins': {'rows': len(rows_with('OW_')) , 'body_joins': rows_with('BJ_'), 'redaction': rows_with('RD')},
        'entailed_tables': entailed,
    }
    OUT.write_text(json.dumps(summary, indent=1) + '\n')
    print(json.dumps({k: summary[k] for k in ('status', 'criterion_12')}, indent=1))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

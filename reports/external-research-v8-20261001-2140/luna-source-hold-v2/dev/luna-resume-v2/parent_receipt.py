"""Persist globally observed actual case end; subsequent reporting is global."""
import argparse
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import *


def finalize(args):
    armed(args.deadline_ns)
    home = Path(args.run_root)/args.case
    complete = read_json(home/'CASE_DEFERRED_CLOSE.json')
    settlement = read_json(home/'CASE_SETTLEMENT_DEFERRED.json')
    if args.finalizer_returncode != 0 or not group_absent(args.finalizer_pid):
        raise ValueError('held case finalizer actual exit/PGID absence required')
    if not args.case_ns <= args.finalizer_exit_ns < args.deadline_ns or complete.get('original_case_start_monotonic_ns') != args.case_ns or settlement.get('original_case_deadline_monotonic_ns') != args.deadline_ns:
        raise ValueError('actual whole-case end under original cutoff required')
    native_intervals = [(s['native_wrapper_launch_monotonic_ns'], s['native_quiescence_observed_monotonic_ns']) for s in complete['stage_receipts']]
    if any(not args.case_ns <= a <= b <= args.finalizer_exit_ns for a, b in native_intervals) or any(b > native_intervals[i+1][0] for i, (_, b) in enumerate(native_intervals[:-1])):
        raise ValueError('ordered nonoverlapping native-owned intervals required')
    actual_outside = (args.finalizer_exit_ns-args.case_ns-sum(b-a for a,b in native_intervals))/10**9
    status = charge(args.case, args.case+'-final-correction', settlement['last_charged_host_monotonic_ns'],
        args.finalizer_exit_ns, 'global-observed-case-finalizer-tail')
    counted = status['outside_native_seconds_by_case'][args.case]
    if abs(counted-actual_outside) > 0.00001 or actual_outside >= 300:
        raise ValueError('all case host gaps must be accounted exactly within300')
    module = ledger_module()
    with module.transaction() as state:
        jobs = [v for v in state['jobs'].values() if v['case'] == args.case]
        occupied = sum(v['released_epoch']-v['birth_epoch'] for v in jobs)
        if len(jobs) != 3 or occupied > 5400:
            raise ValueError('original whole-case occupied cap required')
    record = {'schema': 'er8.integrated.global-parent-final-receipt.v1', 'case': args.case,
        'held_finalizer_pid': args.finalizer_pid, 'held_finalizer_returncode': args.finalizer_returncode,
        'actual_case_end_monotonic_ns': args.finalizer_exit_ns, 'original_case_start_monotonic_ns': args.case_ns,
        'original_case_deadline_monotonic_ns': args.deadline_ns,
        'actual_case_wall_seconds': (args.finalizer_exit_ns-args.case_ns)/10**9,
        'actual_occupied_stage_lease_seconds': occupied, 'whole_case_occupied_cap_seconds': 5400,
        'actual_nonoverlapping_outside_native_seconds': actual_outside,
        'native_owned_intervals_monotonic_ns': native_intervals,
        'all_case_execution_closed_before_cutoff': True, 'actual_final_proposal': complete['actual_final_proposal'],
        'subsequent_global_metadata_and_publication_cost': 'SEPARATE_ROOT_MANAGEMENT',
        'semantic_quality': 'PENDING_INDEPENDENT_EVALUATION', 'source_semantic_acquisition': 'UNKNOWN',
        'generated_usage': 'UNKNOWN except observed monotonic lower bounds'}
    atomic(home/'GLOBAL_PARENT_FINAL_RECEIPT.json', record)
    ledger('case-complete', {'case': args.case, 'root_authority': True,
        'disposition': 'OPERATIVE_THREE_GOAL_PIPELINE_PENDING_EVALUATION',
        'proof_path': str(home/'GLOBAL_PARENT_FINAL_RECEIPT.json'),
        'original_deadline_monotonic_ns': args.deadline_ns})


def main():
    p = argparse.ArgumentParser()
    for n in ('run-root', 'case'):
        p.add_argument('--'+n, required=True)
    for n in ('case-ns', 'deadline-ns', 'finalizer-pid', 'finalizer-returncode', 'finalizer-exit-ns'):
        p.add_argument('--'+n, type=int, required=True)
    try:
        finalize(p.parse_args())
    except Exception as error:
        print(json.dumps({'outcome': 'HOLD', 'error_class': type(error).__name__, 'case_reserve': 'HELD'}), flush=True)
        raise SystemExit(126)

if __name__ == '__main__':
    main()

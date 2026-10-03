"""Generic parent final case settlement, only after HOSTMANAGEMENT exits."""
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
    if not re.fullmatch(r'V8-[A-Z0-9-]+',args.case) or complete.get('case') != args.case or complete.get('original_case_start_monotonic_ns') != args.case_ns or complete.get('original_case_deadline_monotonic_ns') != args.deadline_ns:
        raise ValueError('original whole-case ancestry required')
    if args.supervisor_returncode != 0 or not args.case_ns <= args.supervisor_exit_ns <= time.monotonic_ns() < args.deadline_ns or not group_absent(args.supervisor_pid):
        raise ValueError('actual case supervisor exit and process group absence required')
    if complete.get('all_three_stage_leases_released_externally') is not True or complete.get('three_fresh_actual_goal_chain') is not True:
        raise ValueError('original three-stage pipeline closure required')
    module = ledger_module()
    with module.transaction() as state:
        jobs = [v for v in state['jobs'].values() if v['case'] == args.case]
        if len(jobs) != 3 or any(v['released_epoch'] is None or v.get('launch_pending') or len(v['goal_starts']) != 1 for v in jobs):
            raise ValueError('all actual stage starts and released leases required')
    observed = time.monotonic_ns()
    proof = {'schema': 'er8.integrated.external-case-close.v1', 'case': args.case,
        'hostmanagement_supervisor_pid': args.supervisor_pid, 'hostmanagement_supervisor_pgid': args.supervisor_pid,
        'held_Popen_wait_returncode': args.supervisor_returncode, 'case_supervisor_exited': True,
        'case_supervisor_group_absent': True, 'case_supervisor_exit_observed_monotonic_ns': args.supervisor_exit_ns,
        'original_case_start_monotonic_ns': args.case_ns, 'original_case_deadline_monotonic_ns': args.deadline_ns,
        'external_case_observed_monotonic_ns': observed, 'actual_final_proposal': complete['actual_final_proposal'],
        'operational_pipeline': 'THREE_FRESH_GOALS_AND_ACTUAL_FINAL_PROPOSAL',
        'semantic_quality': 'PENDING_INDEPENDENT_EVALUATION', 'source_semantic_acquisition': 'UNKNOWN'}
    atomic(home/'EXTERNAL_CASE_CLOSE.json', proof)
    charged_to = time.monotonic_ns()
    status = charge(args.case, args.case+'-final-correction', complete['last_charged_host_monotonic_ns'],
        charged_to, 'case-parent-final-settlement')
    if status['outside_native_seconds_by_case'][args.case] >= 300:
        raise ValueError('actual host budget exhausted; case reserve held')
    atomic(home/'CASE_SETTLEMENT_DEFERRED.json', {'case': args.case,
        'original_case_deadline_monotonic_ns': args.deadline_ns,
        'last_charged_host_monotonic_ns': charged_to,
        'case_complete': False, 'finalizer_actual_exit': 'PENDING_HELD_GLOBAL_POPEN'})


def main():
    p = argparse.ArgumentParser()
    for n in ('run-root', 'case'):
        p.add_argument('--'+n, required=True)
    for n in ('case-ns', 'deadline-ns', 'supervisor-pid', 'supervisor-returncode', 'supervisor-exit-ns'):
        p.add_argument('--'+n, type=int, required=True)
    try:
        finalize(p.parse_args())
    except Exception as error:
        print(json.dumps({'outcome': 'HOLD', 'error_class': type(error).__name__, 'case_reserve': 'HELD'}), flush=True)
        raise SystemExit(126)

if __name__ == '__main__':
    main()

"""External stage observer after exact held actor Popen has exited."""
import argparse
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import *


def finalize(args):
    armed(args.deadline_ns)
    home = Path(args.run_root)/args.case/args.job
    complete = read_json(home/'COMPLETE.json')
    plan = read_json(home/'PLAN.json')
    if plan['stage_start_monotonic_ns'] != args.stage_ns or plan['deadline_monotonic_ns'] != args.deadline_ns:
        raise ValueError('exact original stage plan required')
    observer = load('er8_integrated_external_observe', EXECUTION/'observe.py')
    quiet = observer.observe(plan['enrollment_path'], plan['owned_unit'], args.deadline_ns)
    absent = group_absent(args.actor_pid)
    now = time.monotonic_ns()
    validate_stage_close(complete, quiet, case=args.case, job=args.job, start=args.stage_ns,
        cutoff=args.deadline_ns, pid=args.actor_pid, rc=args.actor_returncode,
        exited=args.actor_exit_ns, now=now, absent=absent)
    proof = {'schema': 'er8.integrated.external-stage-close.v1', 'case': args.case, 'job': args.job,
        'stage_actor_pid': args.actor_pid, 'stage_actor_pgid': args.actor_pid,
        'held_Popen_wait_returncode': args.actor_returncode, 'stage_actor_exited': True,
        'stage_actor_group_absent': absent, 'stage_actor_exit_observed_monotonic_ns': args.actor_exit_ns,
        'case_supervisor_role': 'HOSTMANAGEMENT_STILL_ALIVE_NOT_STAGE_ACTOR',
        'original_deadline_monotonic_ns': args.deadline_ns, 'inner_quiescence': quiet}
    atomic(home/'EXTERNAL_STAGE_CLOSE.json', proof)
    charged_to = time.monotonic_ns()
    status = charge(args.case, args.job, complete['last_charged_host_monotonic_ns'], charged_to, 'external-stage-settlement')
    if status['outside_native_seconds_by_case'][args.case] >= 300:
        raise ValueError('actual outside-native cap exhausted; held')
    validate_stage_close(complete, quiet, case=args.case, job=args.job, start=args.stage_ns,
        cutoff=args.deadline_ns, pid=args.actor_pid, rc=args.actor_returncode,
        exited=args.actor_exit_ns, now=time.monotonic_ns(), absent=absent)
    ledger('release', {'job': args.job, 'quiescence': {'native_quiescent': True,
        'own_process_group_absent': True, 'outer_parent_exited': True,
        'outer_scope': 'THIS_STAGE_ACTOR_ONLY', 'outer_returncode': args.actor_returncode,
        'outer_exit_observed_monotonic_ns': args.actor_exit_ns,
        'original_deadline_monotonic_ns': args.deadline_ns,
        'receipt_id': args.job+'-external-stage-all-owned-quiet',
        'proof_path': str(home/'EXTERNAL_STAGE_CLOSE.json')}})
    atomic(home/'EXTERNAL_SETTLEMENT.json', {'job': args.job, 'lease_released': True,
        'released_after_actual_stage_actor_exit': True, 'whole_case_complete': False,
        'last_charged_host_monotonic_ns': charged_to,
        'original_deadline_monotonic_ns': args.deadline_ns})


def main():
    p = argparse.ArgumentParser()
    for n in ('run-root', 'case', 'job'):
        p.add_argument('--'+n, required=True)
    for n in ('stage-ns', 'deadline-ns', 'actor-pid', 'actor-returncode', 'actor-exit-ns'):
        p.add_argument('--'+n, type=int, required=True)
    try:
        finalize(p.parse_args())
    except Exception as error:
        print(json.dumps({'outcome': 'HOLD', 'error_class': type(error).__name__, 'occupancy': 'held'}), flush=True)
        raise SystemExit(126)

if __name__ == '__main__':
    main()

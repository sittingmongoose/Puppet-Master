"""Whole-case HOSTMANAGEMENT under its immutable original absolute gate."""
import argparse
import subprocess
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import *


def run(args):
    armed(args.case_deadline_ns)
    release = read_json(args.root_release)
    check_release(release)
    if args.case not in QUEUE or args.case_deadline_ns != min(args.case_ns+3600*10**9, args.campaign_ns):
        raise ValueError('original whole-case clock required')
    case_home = Path(args.run_root)/args.case
    if case_home.exists():
        raise ValueError('fresh original case namespace required')
    exports, stages = [], []
    anchor = args.case_ns
    for index, (role, cap, artifact) in enumerate(ROLES):
        # Birth precedes the first stage-specific blocking preparation call.
        stage_epoch = args.case_epoch if index == 0 else time.time()
        stage_ns = args.case_ns if index == 0 else time.monotonic_ns()
        cutoff = deadline(stage_ns, cap, args.case_ns, args.campaign_ns)
        job = args.case+'-'+role
        argv = ['--root-release', args.root_release, '--run-root', args.run_root,
            '--case', args.case, '--role', role, '--cap', cap, '--artifact', artifact,
            '--case-ns', args.case_ns, '--case-epoch', args.case_epoch,
            '--stage-ns', stage_ns, '--stage-epoch', stage_epoch,
            '--campaign-ns', args.campaign_ns, '--deadline-ns', cutoff, '--host-anchor-ns', anchor]
        if index:
            # Transfer is host metadata containing only frozen same-case public paths.
            transfer = case_home/('TRANSFER-'+role+'.json')
            atomic(transfer, {'case': args.case, 'exports': exports})
            argv += ['--transfer', transfer]
        actor = subprocess.Popen(gate_command(cutoff, 'stage_actor.py', argv),
            start_new_session=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        # Receipt directory is outside the actor's one-shot stage namespace.
        identity_home = case_home/'HOST_LAUNCHES'/job
        atomic(identity_home/'STAGE_LAUNCHED.json', {
            'case': args.case, 'job': job, 'stage_actor_pid': actor.pid, 'stage_actor_pgid': actor.pid,
            'original_stage_start_monotonic_ns': stage_ns, 'original_stage_birth_epoch': stage_epoch,
            'original_stage_deadline_monotonic_ns': cutoff})
        rc = actor.wait()
        exited = time.monotonic_ns()
        atomic(identity_home/'STAGE_HELD_WAIT.json', {
            'case': args.case, 'job': job, 'stage_actor_pid': actor.pid, 'stage_actor_pgid': actor.pid,
            'original_stage_start_monotonic_ns': stage_ns, 'original_stage_birth_epoch': stage_epoch,
            'original_stage_deadline_monotonic_ns': cutoff,
            'held_Popen_returncode': rc, 'actual_exit_observed_monotonic_ns': exited})
        if rc != 0 or exited >= cutoff:
            atomic(case_home/'CASE_HOLD.json', {'case': args.case, 'stage': job,
                'stage_actor_pid': actor.pid, 'held_Popen_returncode': rc,
                'actor_exit_observed_monotonic_ns': exited, 'original_stage_deadline_ns': cutoff,
                'lease_disposition': 'HELD', 'complete': False, 'retry': 'NONE'})
            return 126
        close = gate_command(cutoff, 'external_stage_close.py', [
            '--run-root', args.run_root, '--case', args.case, '--job', job,
            '--stage-ns', stage_ns, '--deadline-ns', cutoff, '--actor-pid', actor.pid,
            '--actor-returncode', rc, '--actor-exit-ns', exited])
        finalizer = subprocess.Popen(close, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        result = finalizer.wait()
        if result != 0 or time.monotonic_ns() >= cutoff:
            return 126
        home = case_home/job
        settlement = read_json(home/'EXTERNAL_SETTLEMENT.json')
        if settlement.get('lease_released') is not True or settlement.get('released_after_actual_stage_actor_exit') is not True:
            raise ValueError('external original stage close proof missing')
        # The uncharged settlement tail and all next-stage gaps start here.
        anchor = settlement['last_charged_host_monotonic_ns']
        export = read_json(home/'PUBLIC_ARTIFACT_FREEZE.json')
        complete = read_json(home/'COMPLETE.json')
        exports.append(export)
        stages.append(complete)
    targets = [s.get('native_goal_target_id') for s in stages]
    chain = all(s.get('native_goal_activation_observed') is True and s.get('fresh_session') is True
                and type(s.get('native_responses')) is int and 0 < s['native_responses'] <= 160
                for s in stages) and all(isinstance(t, str) and t for t in targets) and len(set(targets)) == 3
    final = next((r for r in exports[-1]['artifacts'] if Path(r['path']).name == 'FINAL_PROPOSAL.md' and r['bytes'] > 0), None)
    if not chain or final is None:
        raise ValueError('three distinct fresh actual Goal artifacts required')
    atomic(case_home/'CASE_DEFERRED_CLOSE.json', {'schema': 'er8.integrated.case-deferred-close.v1',
        'case': args.case, 'original_case_start_monotonic_ns': args.case_ns,
        'original_case_birth_epoch': args.case_epoch, 'original_case_deadline_monotonic_ns': args.case_deadline_ns,
        'hostmanagement_supervisor_still_alive': True, 'whole_case_complete': False,
        'all_three_stage_leases_released_externally': True, 'three_fresh_actual_goal_chain': chain,
        'last_charged_host_monotonic_ns': anchor, 'stage_receipts': stages, 'exports': exports,
        'actual_final_proposal': final, 'source_semantic_acquisition': 'UNKNOWN',
        'semantic_quality': 'PENDING_INDEPENDENT_EVALUATION', 'generated_usage': 'UNKNOWN except observed lower bounds'})
    return 0


def main():
    p = argparse.ArgumentParser()
    for n in ('root-release', 'run-root', 'case'):
        p.add_argument('--'+n, required=True)
    for n in ('case-ns', 'case-deadline-ns', 'campaign-ns'):
        p.add_argument('--'+n, type=int, required=True)
    p.add_argument('--case-epoch', type=float, required=True)
    try:
        raise SystemExit(run(p.parse_args()))
    except Exception as error:
        print(json.dumps({'outcome': 'HOLD', 'error_class': type(error).__name__, 'whole_case_disposition': 'PENDING_EXTERNAL'}), flush=True)
        raise SystemExit(126)

if __name__ == '__main__':
    main()

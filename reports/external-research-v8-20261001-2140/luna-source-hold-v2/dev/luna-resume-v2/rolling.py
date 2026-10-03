"""Generic two-slot rolling launcher. Root/operator only, never author-run."""
import argparse
import subprocess
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import *


def settle_failed_case(run_root,case,item,rc,exited):
    """Held rolling parent records failed whole-case host tail, keeps reserve.
    Unknown stage leases never become a completed or absent pipeline.
    """
    from failure_settlement import validate_quiet,uncovered_intervals
    proc=item['proc'];home=Path(run_root)/case
    if rc==0 or proc.returncode!=rc or not group_absent(proc.pid) or not item['start']<=exited<item['deadline']:raise ValueError('exact held failed supervisor exit under original cutoff required')
    hold=read_json(home/'CASE_HOLD.json');job=hold['stage']
    if hold.get('case')!=case or hold.get('complete') is not False or hold.get('protected_final_correction')!='RETAINED':raise ValueError('failed stage disposition and correction reserve required')
    settlement=read_json(home/job/'EXTERNAL_SETTLEMENT.json')
    if settlement.get('lease_released') is not True or settlement.get('whole_case_complete') is not False:raise ValueError('positive failed stage lease closure required')
    module=ledger_module()
    with module.transaction() as ledger_state:
        jobs=[v for v in ledger_state['jobs'].values() if v['case']==case]
        if not jobs or any(v['released_epoch'] is None or v.get('launch_pending') for v in jobs):raise ValueError('unknown or unreleased failed stage remains HOLD')
        for owned in jobs:
            owned_home=home/owned['job'];proof=read_json(owned_home/'EXTERNAL_STAGE_CLOSE.json')
            if not group_absent(proof['stage_actor_pid']) or not group_absent(proof['settlement_pid']):raise ValueError('current own failed-stage parents not absent')
            if proof['activation_disposition']=='OBSERVED_AND_COUNTED':
                plan=read_json(owned_home/'PLAN.json');observer=load('er8_luna_failed_case_current_quiet',EXECUTION/'observe.py')
                validate_quiet(proof['inner_quiescence'],plan,plan['stage_start_monotonic_ns'],plan['deadline_monotonic_ns'])
                current=observer.observe(plan['enrollment_path'],plan['owned_unit'],plan['deadline_monotonic_ns'])
                if current.get('owned_native_quiescent') is not True or current.get('owned_unit')!=plan['owned_unit'] or current.get('enrollment')!=proof['inner_quiescence']['enrollment'] or current.get('owned_cgroup')!=proof['inner_quiescence']['owned_cgroup'] or not exited<=current.get('quiescence_observed_monotonic_ns',0)<item['deadline']:raise ValueError('exact current owned case quiet required; old timely lifetime remains separate')
        now=time.monotonic_ns()
        if now>=item['deadline']:raise ValueError('original case cutoff exhausted; retain incomplete disposition')
        targets=[(settlement['last_charged_host_monotonic_ns'],now)]
        for index,(a,b) in enumerate(uncovered_intervals(targets,ledger_state['events'],case)):
            module.apply(ledger_state,'event',{'case':case,'job':job,'category':'cleanup','seconds':(b-a)/10**9,'outside_native_seconds':(b-a)/10**9,'interval_begin_monotonic_ns':a,'interval_end_monotonic_ns':b,'interval_receipt_id':job+'-failed-case-held-parent-'+str(index)})
    atomic(home/'FAILED_CASE_PARENT_RECEIPT.json',{'case':case,'held_case_supervisor_pid':proc.pid,'held_returncode':rc,'held_exit_monotonic_ns':exited,'original_case_birth_monotonic_ns':item['start'],'original_case_deadline_monotonic_ns':item['deadline'],'last_charged_host_monotonic_ns':now,'whole_case_complete':False,'protected_final_correction':'RETAINED','disposition':'FAILED_POSITIVELY_QUIET_RESERVE_RETAINED','outside_native_cap_exceeded':ledger_state['cases'][case]['observed_outside_native_seconds']>=300})
    return 126


def run(root_release, run_root):
    release = read_json(root_release)
    check_release(release)
    run_root = Path(run_root)
    if not run_root.is_absolute() or any(p.is_symlink() for p in (run_root, *run_root.parents)) or run_root.exists():
        raise ValueError('fresh operator-owned runtime root required')
    if run_root.is_relative_to(HERE) or not run_root.is_relative_to(Path(CONTROL['operator_root'])):
        raise ValueError('actual runtime paths belong only to operator dispatcher')
    pending, active = list(QUEUE), {}
    outcomes = {}
    while pending or active:
        status = ledger('status')
        # Campaign-wide occupied leases, plus our HOSTMANAGEMENT case slots,
        # enforce ours L2. Never use, stop or borrow sibling slots.
        available = min(2-len(active), 2-status['active_by_family']['L'])
        if status['overdue_jobs'] or status['candidate_output_stop']:
            available = 0
        while pending and available > 0 and time.time() + 3300 < STOP_EPOCH:
            case = pending.pop(0)
            # Capture before the first blocking case-specific operation; the
            # accepted static gate arms before case Python/import/prep/locking.
            epoch, start = time.time(), time.monotonic_ns()
            campaign_ns = start + int((STOP_EPOCH-epoch)*10**9)
            cutoff = min(start+3600*10**9, campaign_ns)
            argv = ['--root-release', root_release, '--run-root', run_root,
                '--case', case, '--case-epoch', epoch, '--case-ns', start,
                '--case-deadline-ns', cutoff, '--campaign-ns', campaign_ns]
            proc = subprocess.Popen(gate_command(cutoff, 'case_supervisor.py', argv),
                start_new_session=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            active[case] = {'proc': proc, 'start': start, 'epoch': epoch, 'deadline': cutoff}
            available -= 1
        finished = []
        for case, item in active.items():
            proc = item['proc']
            if proc.poll() is None:
                continue
            rc = proc.wait()
            exited = time.monotonic_ns()
            result = 126
            if rc == 0 and exited < item['deadline']:
                closer = subprocess.Popen(gate_command(item['deadline'], 'external_case_close.py', [
                    '--run-root', run_root, '--case', case, '--case-ns', item['start'],
                    '--deadline-ns', item['deadline'], '--supervisor-pid', proc.pid,
                    '--supervisor-returncode', rc, '--supervisor-exit-ns', exited]),
                    start_new_session=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                close_result = closer.wait()
                actual_end = time.monotonic_ns()
                if close_result == 0 and actual_end < item['deadline']:
                    # The case-specific supervisor and finalizer have ACTUALLY
                    # exited. Record their last tail before reporting/metadata.
                    recorder = subprocess.Popen(gate_command(item['deadline'], 'parent_receipt.py', [
                        '--run-root', run_root, '--case', case, '--case-ns', item['start'],
                        '--deadline-ns', item['deadline'], '--finalizer-pid', closer.pid,
                        '--finalizer-returncode', close_result, '--finalizer-exit-ns', actual_end]),
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    result = recorder.wait()
            if rc!=0 and exited<item['deadline']:
                try:settle_failed_case(run_root,case,item,rc,exited)
                except Exception as error:
                    atomic(Path(run_root)/case/'FAILED_CASE_PARENT_HOLD.json',{'case':case,'error_class':type(error).__name__,'whole_case_complete':False,'protected_final_correction':'RETAINED','disposition':'UNKNOWN_OR_UNCLOSED'})
            outcomes[case] = {'case_supervisor_pid': proc.pid, 'held_Popen_returncode': rc,
                'observed_exit_monotonic_ns': exited, 'original_deadline_monotonic_ns': item['deadline'],
                'external_case_settlement_returncode': result, 'operational_close': result == 0,
                'semantic_quality': 'PENDING_INDEPENDENT_EVALUATION' if result == 0 else 'INCOMPLETE_OR_UNKNOWN'}
            finished.append(case)
        for case in finished:
            del active[case]
        # No wave barrier: one completed case immediately makes its slot ready.
        if not active and pending and (time.time()+3300 >= STOP_EPOCH or available == 0):
            break
        if not finished:
            time.sleep(0.25)
    print(json.dumps({'schema': 'er8.integrated.rolling-close.v1', 'cases': outcomes,
        'unstarted': pending, 'no_retries_or_relabeling': True, 'usage': 'UNKNOWN except ledger lower bounds'}), flush=True)
    return 0 if len(outcomes) == len(QUEUE) and all(v['operational_close'] for v in outcomes.values()) else 126


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--root-release', required=True)
    p.add_argument('--run-root', required=True)
    a = p.parse_args()
    raise SystemExit(run(a.root_release, a.run_root))

if __name__ == '__main__':
    main()

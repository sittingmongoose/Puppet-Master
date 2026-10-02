"""Root observer settlement only after outer runner exit; never native launch."""
import argparse, errno, importlib.util, json, os, sys, time
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from dispatcher import ROOT,CAMPAIGN,CANARY,atomic_json,ledger,verify_positive_pins,CONTROL

def validate_close(*,start,deadline,pid,returncode,exit_ns,now_ns,group_absent,quiet,complete):
    if type(pid) is not int or pid<=1 or type(returncode) is not int:
        raise ValueError('held Popen identity and observed returncode required')
    if deadline!=start+480*10**9 or not start<=exit_ns<=now_ns<=deadline:
        raise ValueError('original parent exit/cutoff exhausted or mismatch')
    if not group_absent or quiet.get('owned_native_quiescent') is not True or quiet.get('inclusive_native_lifetime_established') is not True:
        raise ValueError('outer process group and inner owned cgroup must be quiet on time')
    if quiet.get('original_deadline_monotonic_ns')!=deadline or quiet.get('quiescence_observed_monotonic_ns',deadline+1)>deadline:
        raise ValueError('inner original quiet/cutoff mismatch')
    if complete.get('job')!=CANARY or complete.get('lease_release_deferred') is not True or complete.get('lease_released_by_caller') is not False:
        raise ValueError('exact deferred lease and caller state required')
    if complete.get('original_case_start_monotonic_ns')!=start or complete.get('original_deadline_monotonic_ns')!=deadline:
        raise ValueError('deferred original ancestry mismatch')
    if returncode!=0 or complete.get('whole_case_status')=='HOLD_LATE_OR_OUTSIDE':
        raise ValueError('caller failure/wholecase HOLD cannot be qualified or released here')
    outside=(now_ns-start-(complete['native_quiescence_observed_monotonic_ns']-complete['native_wrapper_launch_monotonic_ns']))/10**9
    if outside<0 or outside>=300:raise ValueError('actual inclusive outside-native cap exhausted')
    return outside

def finalize(args):
    start,deadline=args.original_start_ns,args.original_deadline_ns
    if os.environ.get('PM_BOUND_DEADLINE_NS')!=str(deadline):
        raise ValueError('unchanged absolute gate required for external settlement')
    release=json.loads(args.root_release.read_text())
    verify_positive_pins(release)
    if release.get('caller_version')!='caller-repair2':raise ValueError('current caller2 root release required')
    home=ROOT/'jobs'/CANARY/CANARY
    complete=json.loads((home/'COMPLETE.json').read_text())
    plan=json.loads((home/'PLAN.json').read_text())
    if plan['deadline_monotonic_ns']!=deadline or plan['stage_start_monotonic_ns']!=start:
        raise ValueError('original plan ancestry mismatch')
    try:
        os.killpg(args.outer_pid,0) # existence probe only, never sends a signal
        group_absent=False
    except ProcessLookupError:group_absent=True
    except PermissionError:group_absent=False
    spec=importlib.util.spec_from_file_location('er8_external_observe',Path(CONTROL['execution'])/'observe.py')
    observer=importlib.util.module_from_spec(spec);spec.loader.exec_module(observer)
    quiet=observer.observe(plan['enrollment_path'],plan['owned_unit'],deadline)
    checked=time.monotonic_ns()
    outside=validate_close(start=start,deadline=deadline,pid=args.outer_pid,
        returncode=args.outer_returncode,exit_ns=args.outer_exit_ns,now_ns=checked,
        group_absent=group_absent,quiet=quiet,complete=complete)
    proof={'schema':'er8.dispatcher.external-parent-close.v1','case':CANARY,'job':CANARY,
        'outer_process_identity':{'pid':args.outer_pid,'pgid':args.outer_pid,'held_Popen_wait_returncode':args.outer_returncode},
        'outer_parent_exited':True,'outer_process_group_absent':group_absent,
        'outer_exit_observed_monotonic_ns':args.outer_exit_ns,
        'external_full_quiet_observed_monotonic_ns':quiet['quiescence_observed_monotonic_ns'],
        'original_case_start_monotonic_ns':start,'original_deadline_monotonic_ns':deadline,
        'inner_quiescence':quiet,'actual_outside_native_seconds_at_observation':outside,
        'native_or_semantic_qualification':'PENDING_INDEPENDENT_ACTUAL_REVIEW'}
    atomic_json(home/'EXTERNAL_PARENT_CLOSE.json',proof)
    settlement_end=time.monotonic_ns()
    ledger('event',{'case':CANARY,'job':CANARY,'category':'cleanup',
        'seconds':(settlement_end-complete['caller_observed_end_monotonic_ns'])/10**9,
        'outside_native_seconds':(settlement_end-complete['caller_observed_end_monotonic_ns'])/10**9,
        'interval_receipt_id':CANARY+'-external-parent-close-settlement'})
    now=time.monotonic_ns()
    validate_close(start=start,deadline=deadline,pid=args.outer_pid,
        returncode=args.outer_returncode,exit_ns=args.outer_exit_ns,now_ns=now,
        group_absent=group_absent,quiet=quiet,complete=complete)
    ledger('release',{'job':CANARY,'quiescence':{'native_quiescent':True,'own_process_group_absent':True,
        'outer_parent_exited':True,'outer_returncode':args.outer_returncode,
        'outer_exit_observed_monotonic_ns':args.outer_exit_ns,'original_deadline_monotonic_ns':deadline,
        'receipt_id':CANARY+'-external-all-owned-quiet','proof_path':str(home/'EXTERNAL_PARENT_CLOSE.json')}})
    atomic_json(home/'EXTERNAL_SETTLEMENT.json',{'schema':'er8.dispatcher.external-settlement.v1',
        'job':CANARY,'lease_released':True,'released_after_outer_exit':True,
        'whole_case_actual_review':'PENDING','original_deadline_monotonic_ns':deadline,
        'settlement_observed_monotonic_ns':time.monotonic_ns()})

def main():
    p=argparse.ArgumentParser();p.add_argument('--root-release',type=Path,required=True)
    for n in ('original-start-ns','original-deadline-ns','outer-pid','outer-returncode','outer-exit-ns'):
        p.add_argument('--'+n,type=int,required=True)
    args=p.parse_args()
    try:finalize(args)
    except Exception as error:
        # Keep occupancy on unknown/late/mismatched proof; no silent settlement.
        print(json.dumps({'schema':'er8.dispatcher.external-hold.v1','outcome':'HOLD','error_class':type(error).__name__}),flush=True)
        raise SystemExit(126)
if __name__=='__main__':main()

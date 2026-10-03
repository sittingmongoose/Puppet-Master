"""Once-only operator parent, original birth before prep and arm before imports.

No author invokes this against a real release. Parent holds both outer actor and
settlement Popen objects, then releases only positive exact current-time closure.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import time

HERE=Path(__file__).resolve().parent

def main():
    p=argparse.ArgumentParser()
    for n in ('root-release','run-root'):p.add_argument('--'+n,required=True)
    p.add_argument('--armed',action='store_true')
    for n in ('birth-ns','campaign-ns','deadline-ns'):p.add_argument('--'+n,type=int)
    p.add_argument('--birth-epoch',type=float);a=p.parse_args()
    if not a.armed:
        epoch,start=time.time(),time.monotonic_ns()
        control=json.loads((HERE/'recovery-control.json').read_text())
        campaign=start+int((control['deadline_epoch']-epoch)*10**9)
        cutoff=min(start+480*10**9,campaign)
        if cutoff!=start+480*10**9:raise ValueError('whole original canary cap must fit campaign')
        gate=Path(control['execution'])/'deadline_gate'
        os.execv(str(gate),[str(gate),'--absolute-ns',str(cutoff),'--','/usr/bin/python3','-I','-B',str(HERE/'canary_parent.py'),
            '--armed','--root-release',a.root_release,'--run-root',a.run_root,'--birth-epoch',str(epoch),
            '--birth-ns',str(start),'--campaign-ns',str(campaign),'--deadline-ns',str(cutoff)])
    sys.path.insert(0,str(HERE))
    from common import armed,read_json,atomic,CONTROL,gate_command,group_absent
    from release_binding import check_parent_release
    from failure_settlement import release_after_settlement
    armed(a.deadline_ns)
    release=read_json(a.root_release);check_parent_release(release,'canary')
    root=Path(a.run_root)
    if not root.is_absolute() or root.exists() or any(q.is_symlink() for q in (root,*root.parents)) or not root.is_relative_to(Path(CONTROL['operator_root'])):raise ValueError('fresh nonexistent exact operator-owned canary root required')
    if release.get('run_root')!=str(root):raise ValueError('root release selects exact runtime namespace')
    root.mkdir(mode=0o700,parents=True,exist_ok=False)
    atomic(root/'PARENT_BIRTH.json',{'original_birth_epoch':a.birth_epoch,'original_birth_monotonic_ns':a.birth_ns,
        'original_deadline_monotonic_ns':a.deadline_ns,'original_campaign_cutoff_monotonic_ns':a.campaign_ns,
        'once_only':True,'component_cap_seconds':480,'cleanup_reserve_seconds':30})
    case=release['selected_stage_scope']['canary_id'];home=root/case/case
    argv=['--root-release',a.root_release,'--run-root',root,'--birth-epoch',a.birth_epoch,
        '--birth-ns',a.birth_ns,'--campaign-ns',a.campaign_ns,'--deadline-ns',a.deadline_ns]
    actor=subprocess.Popen(gate_command(a.deadline_ns,'canary_actor.py',argv),start_new_session=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    # Inner cgroup stops at birth+450. Reserve the last 15 seconds for settlement.
    stop_actor=a.deadline_ns-15*10**9
    while actor.poll() is None and time.monotonic_ns()<stop_actor:time.sleep(.1)
    if actor.poll() is None:
        # Exact held live Popen session only. No PID discovery or sibling cleanup.
        import signal
        os.killpg(actor.pid,signal.SIGKILL)
    rc=actor.wait();exited=time.monotonic_ns()
    atomic(root/'HELD_ACTOR_EXIT.json',{'pid':actor.pid,'pgid':actor.pid,'held_Popen_returncode':rc,'exit_monotonic_ns':exited})
    birth_path=home/'BIRTH.json'
    if not birth_path.is_file():birth_path=home.parent/(case+'.BIRTH.json')
    birth=read_json(birth_path)
    closer=subprocess.Popen(gate_command(a.deadline_ns,'external_stage_close.py',[
        '--run-root',root,'--case',case,'--job',case,'--stage-ns',a.birth_ns,'--deadline-ns',a.deadline_ns,
        '--actor-pid',actor.pid,'--actor-returncode',rc,'--actor-exit-ns',exited]),start_new_session=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    close_rc=closer.wait();close_exit=time.monotonic_ns()
    atomic(root/'HELD_SETTLEMENT_EXIT.json',{'pid':closer.pid,'pgid':closer.pid,'held_Popen_returncode':close_rc,'exit_monotonic_ns':close_exit})
    if close_rc!=0:raise ValueError('external settlement HOLD; lease retained')
    proof=release_after_settlement(home,birth,actor,closer,settlement_exit_ns=close_exit)
    result={'schema':'er8.luna.once-only-canary-parent.v1','case':case,'actor_pid':actor.pid,'actor_pgid':actor.pid,
        'actor_returncode':rc,'actor_exit_monotonic_ns':exited,'settlement_pid':closer.pid,'settlement_pgid':closer.pid,
        'settlement_returncode':close_rc,'settlement_exit_monotonic_ns':close_exit,
        'lease_released':True,'disposition':proof['disposition'],'independent_canary_qualification':'PENDING',
        'original_birth_monotonic_ns':a.birth_ns,'original_deadline_monotonic_ns':a.deadline_ns,
        'actual_inference_tool_payload':'UNOBSERVED','model_HTTP_attempts':'UNKNOWN','cost':'UNKNOWN','automatic_retry':False}
    atomic(root/'PARENT_RECEIPT.json',result);print(json.dumps(result),flush=True)
    return 0 if rc==0 else 126
if __name__=='__main__':
    try:raise SystemExit(main())
    except Exception as e:
        print(json.dumps({'outcome':'HOLD','error_class':type(e).__name__,'no_invented_absence':True}),flush=True);raise SystemExit(126)

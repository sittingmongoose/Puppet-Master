"""Hold exact outer Popen handle, then settle under the same original deadline."""
import argparse,json,subprocess,time
from pathlib import Path
ROOT=Path(__file__).resolve().parent
CONTROL=json.loads((ROOT.parent/'recovery-control.json').read_text())
GATE=Path(CONTROL['execution'])/'deadline_gate'
PYTHON='/usr/bin/python3'

def run(root_release):
    # Capture original birth before the first case-specific blocking operation.
    birth_epoch=time.time();start=time.monotonic_ns();deadline=start+480*10**9
    command=[str(GATE),'--absolute-ns',str(deadline),'--',PYTHON,'-I','-B',
        str(ROOT/'canary_runner.py'),'--root-release',str(root_release),
        '--original-start-ns',str(start),'--original-birth-epoch',str(birth_epoch),
        '--outer-deadline-ns',str(deadline)]
    outer=subprocess.Popen(command,start_new_session=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    print(json.dumps({'schema':'er8.dispatcher.parent-launch-positive.v1','original_start_monotonic_ns':start,
        'original_birth_epoch':birth_epoch,'original_deadline_monotonic_ns':deadline,
        'held_outer_pid':outer.pid,'held_outer_pgid':outer.pid}),flush=True)
    returned=outer.wait();exited=time.monotonic_ns()
    print(json.dumps({'schema':'er8.dispatcher.parent-exit-positive.v1','held_outer_pid':outer.pid,
        'held_Popen_wait_returncode':returned,'outer_exit_observed_monotonic_ns':exited,
        'original_deadline_monotonic_ns':deadline}),flush=True)
    if returned!=0 or exited>=deadline:
        print(json.dumps({'outcome':'HOLD','reason':'outer failed or late; lease not released'}),flush=True)
        return 126
    # All blocking external evidence/ledger settlement is again protected by the
    # SAME original absolute cutoff, never a new case/component clock.
    close=[str(GATE),'--absolute-ns',str(deadline),'--',PYTHON,'-I','-B',
        str(ROOT/'external_close.py'),'--root-release',str(root_release),
        '--original-start-ns',str(start),'--original-deadline-ns',str(deadline),
        '--outer-pid',str(outer.pid),'--outer-returncode',str(returned),'--outer-exit-ns',str(exited)]
    finalizer=subprocess.Popen(close,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    result=finalizer.wait();closed=time.monotonic_ns()
    print(json.dumps({'schema':'er8.dispatcher.parent-settlement-positive.v1',
        'settlement_returncode':result,'parent_observed_settlement_close_monotonic_ns':closed,
        'original_deadline_monotonic_ns':deadline,'all_required_close_on_time':result==0 and closed<=deadline,
        'native_semantic_qualification':'PENDING_INDEPENDENT_REVIEW'}),flush=True)
    return 0 if result==0 and closed<=deadline else 126

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--root-release',type=Path,required=True)
    args=parser.parse_args();raise SystemExit(run(args.root_release))
if __name__=='__main__':main()

"""Owned synthetic processes only. No native SDK, model, provider or client reads."""
import hashlib, json, os, signal, subprocess, sys, time, uuid
from pathlib import Path
BASE=Path(__file__).resolve().parent
AUTH=BASE.parents[1]/'dev/execution-path-v1'
GATE=str(AUTH/'deadline_gate')

def run(argv, timeout=5):
    p=subprocess.run(argv,capture_output=True,text=True,timeout=timeout)
    return {'rc':p.returncode,'stdout':p.stdout,'stderr':p.stderr}

def show(unit):
    v=run(['/usr/bin/systemctl','--user','show',unit,'--property=ControlGroup','--property=ActiveState','--property=SubState','--property=MainPID'])
    fields={}
    for line in v['stdout'].splitlines():
        if '=' in line:
            k,x=line.split('=',1);fields[k]=x
    return fields

def procs(path):
    if not path: return None
    p=Path('/sys/fs/cgroup')/path.lstrip('/')/'cgroup.procs'
    try:return [int(x) for x in p.read_text().split()]
    except FileNotFoundError:return []

def main():
    rows=[]
    # The exact production supervisor refuses late entry before fork/exec.
    marker=BASE/'late-marker'
    argv=[GATE,'--absolute-ns',str(time.monotonic_ns()-1),'--','/usr/bin/python3','-I','-c',f"from pathlib import Path;Path({str(marker)!r}).write_text('wrong')"]
    late=run(argv)
    rows.append({'test':'late-entry-rejects-before-launch','result':late,'marker_absent':not marker.exists(),'pass':late['rc']==124 and not marker.exists()})
    # A separate owned sibling must survive every service-scoped cleanup below.
    sibling=subprocess.Popen(['/usr/bin/python3','-I','-c','import time;time.sleep(30)'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
      for mode in ['ordinary-exit','ignored-signals-setsid','bootstrap-stall','outer-cancellation']:
        unit='er8-check-'+uuid.uuid4().hex[:16]+'.service'
        start=time.monotonic_ns();stop=start+2_000_000_000;deadline=start+3_000_000_000
        if mode=='ordinary-exit':
          code='import time;time.sleep(.5);print("synthetic-complete",flush=True)'
        else:
          code="import os,signal,time;signal.signal(signal.SIGINT,signal.SIG_IGN);signal.signal(signal.SIGTERM,signal.SIG_IGN);p=os.fork();\nif p==0: os.setsid();print('synthetic-descendant',flush=True);time.sleep(30)\nelse: print('synthetic-parent',flush=True);time.sleep(30)"
        payload=[GATE,'--absolute-ns',str(stop),'--','/usr/bin/python3','-I','-c',code]
        namespace=['/usr/bin/bwrap','--unshare-user','--unshare-pid','--as-pid-1','--die-with-parent','--cap-drop','ALL','--bind','/','/','--proc','/proc','--dev-bind','/dev','/dev','--',*payload]
        if mode=='bootstrap-stall':
          # Stall the bootstrap child before namespace entry under the same exact service gate.
          namespace=['/usr/bin/python3','-I','-c','import time;time.sleep(30)']
        service=[GATE,'--absolute-ns',str(stop),'--',*namespace]
        cmd=[GATE,'--absolute-ns',str(deadline),'--','/usr/bin/systemd-run','--user','--wait','--pipe','--collect','--unit='+unit,'--property=Type=exec','--property=KillMode=control-group','--property=KillSignal=SIGKILL','--property=SendSIGKILL=yes','--property=TimeoutStopSec=1s','--property=RuntimeMaxSec=3s','--property=Restart=no','--',*service]
        p=subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,start_new_session=True)
        time.sleep(.25)
        initial=show(unit); cg=initial.get('ControlGroup'); owned=procs(cg)
        if mode=='outer-cancellation': p.kill()
        try:out,err=p.communicate(timeout=4)
        except subprocess.TimeoutExpired:
          # These are exact owned control handles, never inferred PID/group identities.
          p.kill();run(['/usr/bin/systemctl','--user','stop',unit]);out,err=p.communicate(timeout=2)
        finished=time.monotonic_ns()
        final=show(unit);remaining=procs(cg)
        absent_ns=time.monotonic_ns()
        # Cancellation may end the client before the independent service cutoff.
        if mode=='outer-cancellation' and remaining:
          time.sleep(max(0,(stop-time.monotonic_ns())/1e9)+.15)
          remaining=procs(cg);absent_ns=time.monotonic_ns();final=show(unit)
        reached=bool(owned)
        if mode=='ordinary-exit': reached='synthetic-complete' in out
        good=reached and remaining==[] and absent_ns<=deadline and sibling.poll() is None
        rows.append({'test':mode,'unit':unit,'start_ns':start,'stop_ns':stop,'deadline_ns':deadline,'initial_unit':initial,'owned_pid_count':len(owned) if owned is not None else None,'returncode':p.returncode,'synthetic_stdout':out,'synthetic_stderr':err,'client_finished_ns':finished,'absence_observed_ns':absent_ns,'final_unit':final,'owned_cgroup_remaining':remaining,'unrelated_owned_sibling_alive':sibling.poll() is None,'pass':good})
        if remaining:run(['/usr/bin/systemctl','--user','stop',unit])
    finally:
      sibling.terminate()
      try:sibling.wait(timeout=2)
      except subprocess.TimeoutExpired:sibling.kill();sibling.wait(timeout=2)
    report={'schema':'er8.independent.execution.offline.v1','native_calls':0,'provider_calls':0,'private_client_reads':0,'synthetic_owned_processes_only':True,'gate_sha256':hashlib.sha256(Path(GATE).read_bytes()).hexdigest(),'rows':rows,'all_pass':all(x['pass'] for x in rows)}
    (BASE/'checker-offline-results-final.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
if __name__=='__main__':main()

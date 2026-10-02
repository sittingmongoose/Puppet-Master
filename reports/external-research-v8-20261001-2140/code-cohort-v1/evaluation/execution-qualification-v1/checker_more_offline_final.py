"""Supplemental independent startup/read stalls; owned synthetic processes only."""
import importlib.util,json,os,subprocess,time,uuid
from pathlib import Path
BASE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('checks',BASE/'checker_offline_final.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
rows=[]
fifo=BASE/'own-metadata.fifo'
os.mkfifo(fifo,0o600)
sibling=subprocess.Popen(['/usr/bin/python3','-I','-c','import time;time.sleep(30)'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 for mode in ['blocked-before-enrollment','blocked-active-metadata','late-service-entry']:
  unit='er8-check-'+uuid.uuid4().hex[:16]+'.service';start=time.monotonic_ns();stop=start+2_000_000_000;deadline=start+3_000_000_000
  marker=BASE/(mode+'-marker')
  code=f"import os;print('synthetic-fifo-stall',flush=True);os.open({str(fifo)!r},os.O_RDONLY)"
  payload=[m.GATE,'--absolute-ns',str(stop),'--','/usr/bin/python3','-I','-c',code]
  namespace=['/usr/bin/bwrap','--unshare-user','--unshare-pid','--as-pid-1','--die-with-parent','--cap-drop','ALL','--bind','/','/','--proc','/proc','--dev-bind','/dev','/dev','--',*payload]
  service=[m.GATE,'--absolute-ns',str(stop),'--',*namespace]
  if mode=='blocked-before-enrollment':service=[m.GATE,'--absolute-ns',str(stop),'--','/usr/bin/python3','-I','-c',code]
  if mode=='late-service-entry':
   late=[m.GATE,'--absolute-ns',str(stop),'--','/usr/bin/python3','-I','-c',f"from pathlib import Path;Path({str(marker)!r}).write_text('late child wrongly launched')"]
   code=f"import os,time;print('synthetic-late-service',flush=True);time.sleep(2.25);os.execv({m.GATE!r},{late!r})"
   service=['/usr/bin/python3','-I','-c',code]
  cmd=[m.GATE,'--absolute-ns',str(deadline),'--','/usr/bin/systemd-run','--user','--wait','--pipe','--collect','--unit='+unit,'--property=Type=exec','--property=KillMode=control-group','--property=KillSignal=SIGKILL','--property=SendSIGKILL=yes','--property=TimeoutStopSec=1s','--property=RuntimeMaxSec=3s','--property=Restart=no','--',*service]
  p=subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,start_new_session=True)
  time.sleep(.25);initial=m.show(unit);cg=initial.get('ControlGroup');owned=m.procs(cg)
  out,err=p.communicate(timeout=4);remaining=m.procs(cg);absent_ns=time.monotonic_ns();final=m.show(unit)
  good=bool(owned) and remaining==[] and absent_ns<deadline and sibling.poll() is None
  if mode=='late-service-entry':good=good and p.returncode==124 and not marker.exists()
  rows.append({'test':mode,'unit':unit,'start_ns':start,'stop_ns':stop,'deadline_ns':deadline,'own_initial_unit':initial,'own_pid_count':len(owned) if owned is not None else None,'synthetic_stdout':out,'synthetic_stderr':err,'returncode':p.returncode,'own_remaining_cgroup':remaining,'absence_observed_ns':absent_ns,'final_unit':final,'late_marker_absent':not marker.exists(),'unrelated_owned_sibling_alive':sibling.poll() is None,'pass':good})
  if remaining:m.run(['/usr/bin/systemctl','--user','stop',unit])
finally:
 sibling.terminate();sibling.wait(timeout=2);fifo.unlink()
report={'schema':'er8.independent.execution.more-offline.v1','native_calls':0,'provider_calls':0,'private_client_reads':0,'all_pass':all(x['pass'] for x in rows),'rows':rows}
(BASE/'checker-more-offline-results-final.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))

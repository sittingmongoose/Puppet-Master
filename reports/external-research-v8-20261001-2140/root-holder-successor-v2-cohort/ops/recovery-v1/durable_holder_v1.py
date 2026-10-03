import fcntl,json,os,time
from pathlib import Path
p=Path(__file__).resolve().parent
lock=(p/'supervisor.lock').open('a+')
fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
claim={'schema':'pm.er8.durable-supervisor.v1','root_authority':True,'pid':os.getpid(),'unit':'er8-v8-root-durable-20261002-2348.service','deadline_epoch':1791013030.8303788,'acquired_epoch':time.time(),'owner':'codex-er8-recovery','original_costs_and_births_preserved':True}
(p/'SUPERVISOR_DURABLE.json').write_text(json.dumps(claim,indent=2)+'\n')
while time.time()<claim['deadline_epoch']:time.sleep(min(10,max(.01,claim['deadline_epoch']-time.time())))

import subprocess,time,json,sys
from pathlib import Path
from datetime import datetime,timezone
P=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
stage,event=sys.argv[1:3];j=P/'jobs'/stage;target=j/('passive-'+event+'.json');assert not target.exists(),'one capture per event'
t=time.monotonic();start=datetime.now(timezone.utc).isoformat();cmd=['python3',str(P/'helpers/passive-receipts/export.py'),'--stage',stage];r=subprocess.run(cmd,capture_output=True,text=True);cost=time.monotonic()-t
out=dict(event=event,stage=stage,command=cmd,start=start,end=datetime.now(timezone.utc).isoformat(),elapsed_seconds=cost,exit_code=r.returncode,stderr=r.stderr)
if r.returncode==0:
 index=json.loads(r.stdout);out['index']=index
 for e in index['entries']:
  raw=Path(e['path']).read_bytes();target.write_bytes(raw);x=json.loads(raw)
  print(json.dumps(dict(stage=stage,thread_metadata=x['thread_metadata'],states=[dict(type=v['source']['type'],tool=v['tool'],state=v['native_response']) for v in x['observations']],capture=x['capture'],binding=x['binding']),separators=(',',':')))
(j/('passive-'+event+'-capture-cost.json')).write_text(json.dumps(out,indent=2)+'\n');print('HOST_CAPTURE_SECONDS',cost,'EXIT',r.returncode)

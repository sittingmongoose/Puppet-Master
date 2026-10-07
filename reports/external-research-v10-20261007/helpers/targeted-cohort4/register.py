import json,sys
from pathlib import Path
from datetime import datetime,timezone
P=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
cid,arm,stage,version=sys.argv[1:5];j=P/'jobs'/cid/arm/(stage+'-'+version);r=json.loads((j/'dispatch-receipt.json').read_text());q=json.loads((j/'dispatch-request.json').read_text());d=dict(directory=str(j),case_id=cid,arm=arm,stage=stage+'-'+version,target=q['target'],**r)
(j/'dispatch.json').write_text(json.dumps(d,indent=2)+'\n');sf=P/'state/targeted-cohort4.json';s=json.loads(sf.read_text());s['tasks'].append(dict(case_id=cid,arm=arm,stage=stage,version=version,job=str(j),directory=str(j),**r));s['cases'][cid]['arms'][arm+'-'+version]['status']='ACTIVE';s['cases'][cid]['status']='ACTIVE'
sf.write_text(json.dumps(s,indent=2)+'\n')
with (P/'state/targeted-cohort4-dispatches.jsonl').open('a') as h:h.write(json.dumps(dict(event='after_dispatch',at=datetime.now(timezone.utc).isoformat(),**d))+'\n')

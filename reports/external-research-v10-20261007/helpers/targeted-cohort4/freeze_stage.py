import json,hashlib,sys
from pathlib import Path
from datetime import datetime,timezone
P=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5');stage=sys.argv[1];cid,arm,sv=stage.split('/');name,version=sv.rsplit('-',1);j=P/'jobs'/stage;t=json.loads((j/'task-terminal.json').read_text());assert t['status'] in ['completed','interrupted','failed','cancelled'] and not t['hasPendingChildRuns']
native=json.loads((j/'passive-terminal.json').read_text()) if (j/'passive-terminal.json').exists() else {};states=[o['native_response'].get('goal',o['native_response']) for o in native.get('observations',[])];terminal=[x for x in states if x.get('status') in ['complete','blocked','paused','failed','cancelled']];disposition=terminal[-1]['status'] if terminal else 'UNKNOWN_ACTUAL_TERMINAL_ABSENT'
f=json.loads((P/'helpers/targeted-cohort4'/cid/'execution-overlay-v2.json').read_text());carrier=[x['carrier'] for x in f['stages'][arm] if x['stage']==name][0];assert Path(carrier).exists(),carrier
snapshot=dict(stage=stage,at=datetime.now(timezone.utc).isoformat(),native_disposition=disposition,T3_status=t['status'],T3_children_quiet=True,carrier=carrier,files={str(x.relative_to(j)):dict(sha256=hashlib.sha256(x.read_bytes()).hexdigest(),bytes=x.stat().st_size,mtime_utc=datetime.fromtimestamp(x.stat().st_mtime,timezone.utc).isoformat()) for x in j.rglob('*') if x.is_file() and x.name!='freeze.json'})
(j/'freeze.json').write_text(json.dumps(snapshot,indent=2)+'\n');sf=P/'state/targeted-cohort4.json';s=json.loads(sf.read_text())
for x in s['tasks']:
 if x['case_id']==cid and x['arm']==arm and x['stage']==name and x.get('version')==version:x.update(status=t['status'],hasPendingChildRuns=False,settled=True,native_status=disposition,freeze=str(j/'freeze.json'))
s['cases'][cid]['arms'][arm+'-'+version].setdefault('frozen_stages',{})[name]=dict(carrier=carrier,native_status=disposition,freeze=str(j/'freeze.json'))
if carrier==f['final_by_arm'][arm]:s['cases'][cid]['arms'][arm+'-'+version]['status']='FINAL_FROZEN_UNASSESSED'
sf.write_text(json.dumps(s,indent=2)+'\n');print(json.dumps({k:v for k,v in snapshot.items() if k!='files'}))

#!/usr/bin/env python3
"""One finite capture of permitted CLOSED metadata; never polls or captures answers."""
import hashlib,json
from pathlib import Path
from datetime import datetime,timezone,timedelta
HERE=Path(__file__).resolve().parent
CFG=json.loads((HERE/'config.json').read_bytes()); ROOT=Path(CFG['campaign_root'])
CUTOFF=datetime.fromisoformat(CFG['deadline'].replace('Z','+00:00'))-timedelta(seconds=CFG['writing_reserve_seconds'])
BASE=ROOT/'helpers/final-report/closed-slot-ledger-v1'
INDEX_SHA='45670c83f4bbc54a8d030ae488acc87de22a946f3113ec6d6a14148745c156a9'
def sha(b):return hashlib.sha256(b).hexdigest()
def put(rel,b):
 p=HERE/rel
 if not p.resolve().is_relative_to(HERE):raise ValueError('write boundary')
 p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b);return rel
files=[]
def frozen(source,path,kind,expected=None,linked_from=None):
 if datetime.now(timezone.utc)>=CUTOFF:raise RuntimeError('fixed reading cutoff reached')
 dest=HERE/('inputs/'+source)
 raw=dest.read_bytes() if dest.exists() else Path(path).read_bytes()
 if expected and sha(raw)!=expected:raise ValueError('hash mismatch '+source)
 rel='inputs/'+source
 put(rel,raw)
 row={'source':source,'original_path':str(path),'bundle_path':rel,'sha256':sha(raw),'bytes':len(raw),'kind':kind,'captured_at':datetime.now(timezone.utc).isoformat()}
 if linked_from:row['linked_from']=linked_from
 files.append(row);return raw
if (HERE/'INPUT_IDENTITIES.json').exists():raise SystemExit('one-shot capture already exists; no recapture')
raw=frozen('historical/INPUT_IDENTITIES.json',BASE/'INPUT_IDENTITIES.json','historical_control')
ids=json.loads(raw)
for f in ids['files']:
 path=Path(f['snapshot_path'])
 frozen('historical/'+f['relative_path'],path,'inherited_frozen_metadata',f['sha256'])
for name in ['CLOSED_SLOT_LEDGER.json','FIELD_MAP.json','INPUTS.json','CAPTURE_MANIFEST.json','ledger.py','REPORTING_NOTES.md','README.md']:
 frozen('historical/'+name,BASE/name,'historical_adapter')
frozen('control/config.json',HERE/'config.json','fixed_control')
for rel in ['state/logical-slot-index-v1.json','helpers/targeted-supervisor/COMPARISONS.json','helpers/targeted-cohort2/COMPARISONS.json','reviews/targeted-cohort3/COMPARISONS.json','helpers/targeted-cohort4/COMPARISONS.json','reviews/anchors/COMPARISONS.json','helpers/integrated-execution/COMPARISONS.json','helpers/integrated-execution/FINAL_TRACK_DISPOSITION.json','reviews/confirmation/COMPARISONS.json']:
 frozen('closed_owner/'+rel,ROOT/rel,'additional_closed_owner',INDEX_SHA if rel.startswith('state/') else None)
manifest={'schema':'ER10_SUPPLEMENT_BYTEEXACT_INPUTS_V2','fixed_deadline':CFG['deadline'],'read_cutoff':CUTOFF.isoformat(),'immutable_snapshot_nonatomic':True,'additional_limit_files':180,'additional_limit_bytes':33554432,'files':files,'unavailable':[],'capture_closed':False,'requested_path_unavailable':[{'path':'helpers/targeted-cohort3/COMPARISONS.json','reason':'exact requested helper path absent; original review owner path used'}]}
put('INPUT_IDENTITIES.json',(json.dumps(manifest,indent=2)+'\n').encode())
print(json.dumps({'frozen_files':len(files),'inherited_metadata':len(ids['files']),'additional_files':sum(f['kind']=='additional_closed_owner' for f in files)}))
for f in files:
 if f['kind']=='additional_closed_owner':
  d=json.loads((HERE/f['bundle_path']).read_bytes());print(f['source'], list(d) if isinstance(d,dict) else 'LIST')
  for k,v in d.items():
   if isinstance(v,list):print(' ',k,len(v), [('record',i,list(x)[:30]) for i,x in enumerate(v) if isinstance(x,dict)][:8])

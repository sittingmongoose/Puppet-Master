#!/usr/bin/env python3
"""Bounded one-shot CLOSED linked JSON metadata capture, no live science."""
import json,hashlib,re
from pathlib import Path
from datetime import datetime,timezone,timedelta
HERE=Path(__file__).resolve().parent
m=json.loads((HERE/'INPUT_IDENTITIES.json').read_bytes()); cfg=json.loads((HERE/'config.json').read_bytes());ROOT=Path(cfg['campaign_root'])
cutoff=datetime.fromisoformat(cfg['deadline'].replace('Z','+00:00'))-timedelta(seconds=cfg['writing_reserve_seconds'])
held=set(cfg['live_science_excluded'])
if m['capture_closed']:raise SystemExit('capture sealed; no recapture')
files={f['source']:f for f in m['files']};docs={}
def read(s):
 if s not in docs:
  raw=(HERE/files[s]['bundle_path']).read_bytes()
  if hashlib.sha256(raw).hexdigest()!=files[s]['sha256']:raise ValueError('frozen identity mismatch')
  docs[s]=json.loads(raw)
 return docs[s]
def esc(x):return str(x).replace('~','~0').replace('/','~1')
def walk(x,p=''):
 if isinstance(x,dict):
  for k,v in x.items():
   if k in {'native_goal_raw','native_first_update_response','raw_api_bodies','goal_tokens_raw','native_goal_usage_by_stage','native_goal_raw_counters','shared_native_goal_raw_counters'}:continue
   yield from walk(v,p+'/'+esc(k))
 elif isinstance(x,list):
  for i,v in enumerate(x):yield from walk(v,p+'/'+str(i))
 else:yield p,x
names={'COMPARISON.json','REVIEW.json','review.json','judgment.json','coverage.json','freeze_disposition.json','REVIEW_FREEZE.json','HOST_INCOMPLETE_REVIEW_FREEZE.json','HOST_REVIEW_FREEZE.json','pair-freeze.json','frozen-review.json','frozen-standalone-review.json','FINAL_QUIET.json','V3_PAIR_FREEZE.json','FAILURE_INCLUSIVE_RUN_TIMES.json'}
queue=[]
for s in files:
 if not s.startswith('closed_owner/') or s.endswith('logical-slot-index-v1.json'):continue
 d=read(s)
 if 'targeted-cohort3/' in s:
  for i,x in enumerate(d['comparisons']):
   if x.get('case') in {'D-M07-A','D-M08-A','D-M08-B','D-M10-A'} and x.get('version')=='v3':queue.append((s,'/comparisons/'+str(i),x))
 elif 'targeted-cohort2/' in s:
  for i,x in enumerate(d['cases']):
   if x.get('case_id') in {'D-M04-A','D-M04-B','D-M05-A','D-M05-B'}:queue.append((s,'/cases/'+str(i),x))
 else:queue.append((s,'',d))
seen=set();links=[]
while queue:
 s,p,d=queue.pop(0)
 for ptr,v in walk(d,p):
  if not isinstance(v,str) or not v.endswith('.json'):continue
  rel=v[len(str(ROOT))+1:] if v.startswith(str(ROOT)+'/') else v
  if not rel.startswith(('reviews/','helpers/','jobs/')) or any(c in rel for c in held):continue
  if '..' in Path(rel).parts:continue
  if Path(rel).name not in names and not re.fullmatch(r'.*pair-disposition-v[0-9]+\.json',Path(rel).name):continue
  historical='historical/'+rel; fresh='closed_link/'+rel
  target=historical if historical in files else fresh
  links.append({'source':s,'pointer':ptr,'target':target,'original_relative_path':rel})
  if target in seen:continue
  seen.add(target)
  if target not in files:
   if datetime.now(timezone.utc)>=cutoff:raise RuntimeError('read reserve reached')
   path=ROOT/rel
   if not path.is_file():m['unavailable'].append({'source':s,'pointer':ptr,'target':rel,'reason':'linked original metadata absent'});continue
   size=path.stat().st_size
   additional=[f for f in files.values() if f['kind'].startswith('additional')]
   if len(additional)+1>180 or sum(f['bytes'] for f in additional)+size>33554432:raise RuntimeError('metadata cap')
   raw=path.read_bytes();dest=HERE/'inputs'/target;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw)
   f={'source':target,'original_path':str(path),'bundle_path':str(dest.relative_to(HERE)),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'kind':'additional_closed_link','captured_at':datetime.now(timezone.utc).isoformat(),'linked_from':{'source':s,'pointer':ptr}}
   files[target]=f
  dd=read(target);queue.append((target,'',dd))
m['files']=list(files.values());m['links']=links;m['capture_closed']=True
m['additional_metadata_files']=sum(f['kind'].startswith('additional') for f in files.values());m['additional_metadata_bytes']=sum(f['bytes'] for f in files.values() if f['kind'].startswith('additional'))
(HERE/'INPUT_IDENTITIES.json').write_text(json.dumps(m,indent=2)+'\n')
print(json.dumps({'additional_files':m['additional_metadata_files'],'additional_bytes':m['additional_metadata_bytes'],'unavailable':m['unavailable']}))
for s in files:
 if 'D-M07-A' in s:
  d=read(s);print(s,list(d))
  for k in ['scope','grade','coverage','full_scientific_scope_assessed','full_declared_source_coverage','delivery','review_delivery','native_provenance_comparative_disposition']:
   if k in d:print(k,json.dumps(d[k])[:3500])

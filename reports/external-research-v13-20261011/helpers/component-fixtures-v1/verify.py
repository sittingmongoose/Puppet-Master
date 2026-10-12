#!/usr/bin/env python3
"""Mechanical package freeze/access/coverage identity checks; no source-quality grade."""
import pathlib,json,hashlib,re,datetime
ROOT=pathlib.Path(__file__).resolve().parent;RUN=ROOT.parent.parent
names=['B01-P01','B01-P02','B04-P01','B04-P02','B05-P01','B05-P02','B08-P01','B08-P02']
errors=[];cases=[]
def check(ok,msg):
 if not ok:errors.append(msg)
for name in names:
 p=RUN/'inputs'/name;m=json.loads((p/'MANIFEST.json').read_text());meta=json.loads((p/'metadata.json').read_text());ready=json.loads((p/'READY.json').read_text())
 for rel,want in m['files'].items():
  f=p/rel;check(f.is_file(),name+' missing '+rel)
  if f.is_file():check(hashlib.sha256(f.read_bytes()).hexdigest()==want,name+' modified '+rel)
 check(set(m['files'])=={str(f.relative_to(p)) for f in p.rglob('*') if f.is_file() and f.name not in ['MANIFEST.json','READY.json']},name+' unmanifested or missing files')
 check(hashlib.sha256((p/'MANIFEST.json').read_bytes()).hexdigest()==ready['manifest_sha256'],name+' manifest hash mismatch')
 for rel,want in meta['matched_raw_base'].items():check(hashlib.sha256((p/rel).read_bytes()).hexdigest()==want,name+' raw base mismatch '+rel)
 check(meta['component_max_minutes']==25 and meta['component_min_minutes']==0,name+' time contract')
 index=json.loads((p/'source-index.json').read_text());nav=json.loads((p/'treatment-cache/navigation.json').read_text()) if name.startswith('B05') else index
 if name.startswith('B05'):
  check(all('cached_body' not in x and 'neighborhoods' not in x for x in index['sources']),name+' cache leaked into shared index')
  check(not (p/'critique.md').exists(),name+' shared critique contaminates independent review')
 if name.startswith('B08'):check(not (p/'critique.md').exists(),name+' answer critique injected')
 for row in nav['sources']:
  data=(p/row['cached_body']).read_bytes();check(hashlib.sha256(data).hexdigest()==row['sha256'],name+' primary cache hash '+row['id'])
  lines=data.decode('utf-8',errors='replace').splitlines(keepends=True)
  for loc in row['neighborhoods']:
   lo,hi=loc['range_1based'];b=(p/loc['path']).read_bytes()
   check(b==''.join(lines[lo-1:hi]).encode(),name+' neighborhood differs '+loc['id'])
   check(hashlib.sha256(b).hexdigest()==loc['sha256'],name+' neighborhood hash '+loc['id'])
   check(all(loc['literal_needle'].lower() in lines[i-1].lower() for i in loc['matching_lines_1based']),name+' incorrect locator '+loc['id'])
 if name.startswith('B04'):
  findings=json.loads((p/'findings.json').read_text());ids={x['id'] for x in findings['findings']}
  for f in ['critique.md','critique-compact.md']:
   text=(p/f).read_text();check(ids<=set(re.findall(r'\bF\d+\b',text)),name+' missing finding IDs in '+f)
  obligations={x['id'] for x in json.loads((p/'rubric.json').read_text())['obligations']}
  check(obligations==set(findings['coverage']),name+' incomplete immutable coverage refs')
 cases.append({'case':name,'files':len(m['files']),'source_bodies':len(nav['sources']),'shared_raw_identity_sha256':ready['pair_raw_base_sha256'],'frozen_utc':m['frozen_utc']})
result={'checked_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS' if not errors else 'FAIL','checks':'Exact manifests/raw identity/time contracts/cache gate/primary bytes/line neighborhoods/immutable finding ID and obligation coverage. Does not independently grade scientific truth or prove critique semantic equivalence.','cases':cases,'errors':errors}
(ROOT/'VERIFICATION.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2));raise SystemExit(bool(errors))

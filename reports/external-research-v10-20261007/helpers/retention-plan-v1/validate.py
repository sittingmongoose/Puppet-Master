#!/usr/bin/env python3
"""Validate own frozen plan and replay it offline; no external source reads."""
import contextlib, datetime, hashlib, io, json, runpy
from pathlib import Path
OUT=Path(__file__).resolve().parent
mod=runpy.run_path(str(OUT/'classify.py'))
s=json.loads((OUT/'snapshot.json').read_bytes())
d=json.loads((OUT/'retention-plan.json').read_bytes())
outputs=('retention-plan.json','archive-candidates.json','summary.json')
hashes=lambda:{n:hashlib.sha256((OUT/n).read_bytes()).hexdigest() for n in outputs}
before=hashes();original_open=Path.open;access=[]
def guarded(self,*a,**kw):
 resolved=self.resolve()
 assert resolved.is_relative_to(OUT),f'Offline replay external access: {self}'
 access.append(str(resolved));return original_open(self,*a,**kw)
Path.open=guarded
try:
 with contextlib.redirect_stdout(io.StringIO()):mod['classify'](s)
finally:Path.open=original_open
after=hashes();assert before==after,'Replay differs'
assert len(d['inventory_rows'])==2851 and len(d['objects'])==1151
assert len({o['sha256'] for o in d['objects']})==1151
assert sum(o['bytes'] for o in d['objects'])==116857910
assert sum(len(o['paths']) for o in d['objects'])==2304
assert sum(len(o['inventory_row_indexes']) for o in d['objects'])==2851
assert sum(d['totals']['disposition_objects'].values())==1151
assert d['archive']['candidates']==[] and d['cleanup']['eligible_delete_paths']==[]
assert not d['archive']['created'] and not d['cleanup']['executed']
records={(r['original_path'],r['original_sha256']):r['document'] for r in s['records']}
for r in s['raw_manifests']:records[(r['identity']['path'],r['identity']['sha256'])]=r['document']
def resolve(doc,pointer):
 for part in pointer.split('/')[1:]:
  part=part.replace('~1','/').replace('~0','~')
  doc=doc[int(part)] if isinstance(doc,list) else doc[part]
 return doc
checked=0
for table in ('locators','record_references'):
 for r in d[table].values():
  ident=d['records'][r['record_id']]
  resolve(records[(ident['record'],ident['record_sha256'])],r['pointer']);checked+=1
w=json.loads((OUT/'public-witness-candidates.json').read_bytes())
for c in w['public_witness_candidates']:
 source=next(o for o in d['objects'] if o['sha256']==c['raw_source']['sha256'])
 assert source['bytes']==c['raw_source']['bytes']
 assertion=c['frozen_assertion'];node=resolve(records[(assertion['record'],assertion['sha256'])],assertion['pointer'])
 for k,v in assertion['original_fields'].items():assert node[k]==v
 for witness in c['witnesses']:
  data=witness['exact_utf8_raw_json_slice'].encode()
  assert hashlib.sha256(data).hexdigest()==witness['sha256']
  assert len(data)==witness['bytes']==witness['byte_range_half_open'][1]-witness['byte_range_half_open'][0]
result={'schema':'er10.retention.classifier-validation.v1','completed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'deterministic_offline_replay_identical':True,'offline_replay_reads_writes_confined_to_helper':True,'accessed_paths':sorted(set(access)),'pointer_references_resolved':checked,'inventory_rows':2851,'unique_paths':2304,'unique_objects':1151,'unique_object_bytes':116857910,'public_witness_candidate_fields_hashes_ranges_validated':True,'archive_created':False,'source_files_deleted':False,'remote_verification_performed':False,'plan_sha256':after['retention-plan.json'],'source_body_witness_limit':'Only one previously inventoried public source object (7232 bytes) inspected for a declared witness; no candidate/vendor execution.'}
(OUT/'validation.json').write_text(json.dumps(result,sort_keys=True,indent=2)+'\n')
print(json.dumps(result,indent=2))

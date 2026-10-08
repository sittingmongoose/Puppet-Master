#!/usr/bin/env python3
"""Verify identities, lexical ranges and fragment integrity without source quotes."""
import argparse, datetime, hashlib, json, sys
from pathlib import Path
from html.parser import HTMLParser

def digest(b):return hashlib.sha256(b).hexdigest()
def timestamp():return datetime.datetime.now(datetime.timezone.utc)
class Visible(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.parts=[]
 def handle_data(self,s):self.parts.append(s)
 def normalized(self):return ''.join(c for s in self.parts for c in s if not c.isspace()).encode()
def resolve(o,p):
 for k in p.split('/')[1:]:o=o[int(k)] if isinstance(o,list) else o[k.replace('~1','/').replace('~0','~')]
 return o

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--directory',type=Path,default=Path(__file__).resolve().parent);ap.add_argument('--write-receipt',action='store_true');ap.add_argument('--respect-helper-read-reserve',action='store_true');args=ap.parse_args();out=args.directory.resolve()
 cfg=json.loads((out/'config.json').read_bytes());reserve=datetime.datetime.fromisoformat(cfg['deadline'].replace('Z','+00:00'))-datetime.timedelta(seconds=cfg['writing_reserve_seconds'])
 selected=json.loads((out/'SELECTED_SUPPLEMENT.json').read_bytes());coverage=json.loads((out/'ORIGINAL_ASSERTION_COVERAGE.json').read_bytes());gap=json.loads((out/'GAP_OBJECTS.json').read_bytes());ledger=json.loads((out/'READ_IDENTITIES.json').read_bytes());errors=[];reads=[];cache={};rawbytes=0
 def read_exact(path,expected,kind):
  nonlocal rawbytes
  key=(path,expected)
  if key in cache:return cache[key]
  if args.respect_helper_read_reserve and timestamp()>=reserve:raise TimeoutError('source reading reserve reached')
  p=Path(path);st=p.stat()
  if st.st_size>cfg['maximum_source_object_bytes'] and kind!='METADATA':raise ValueError('Source-object size cap')
  if p.suffix.lower() in ['.pdf','.crate','.gz','.zip','.tar','.map'] and kind!='METADATA':raise ValueError('Excluded body format')
  b=p.read_bytes();st2=p.stat();h=digest(b)
  if h!=expected:raise ValueError('SHA mismatch')
  if (st.st_size,st.st_mtime_ns)!=(st2.st_size,st2.st_mtime_ns):raise ValueError('Changed during read')
  if kind!='METADATA':
   rawbytes+=len(b)
   if rawbytes+ledger['raw_source_bytes']>cfg['maximum_raw_source_bytes_read']:raise ValueError('Aggregate source-read cap')
  reads.append({'path':str(p),'sha256':h,'bytes':len(b),'kind':kind,'read_at':timestamp().isoformat(),'identity_match':True,'stable_during_read':True});cache[key]=b;return b
 def fail(kind,identifier):errors.append({'kind':kind,'identifier':identifier})
 payloads={};source_shas=set();selection_ids=set()
 for f in selected['selections']:
  sid=f['selection_id'];selection_ids.add(sid);source_shas.add(f['source_sha256'])
  try:
   parent=read_exact(f['source_path'],f['source_sha256'],'RAW_SOURCE');p=Path(f['private_path']).resolve()
   if p.parent!=out/'private/fragments':raise ValueError('Fragment path outside scoped private directory')
   raw=read_exact(f.get('range_source_path',f['source_path']),f.get('range_source_sha256',f['source_sha256']),'RAW_SOURCE');a,z=f['start_byte'],f['end_byte'];fragment=p.read_bytes()
   if not 0<=a<z<=len(raw) or (a==0 and z==len(raw)):raise ValueError('Whole source or bad range')
   if len(fragment)!=f['bytes'] or digest(fragment)!=f['fragment_sha256'] or fragment!=raw[a:z]:raise ValueError('Fragment bytes or SHA mismatch')
   if p.name!=f['fragment_sha256']+'.bin':raise ValueError('Fragment filename identity mismatch')
   payloads[f['fragment_sha256']]=len(fragment)
   dm=f.get('derived_mapping')
   if dm:
    db=read_exact(dm['filename'],dm['sha256'],'DERIVED_EXISTING');da,dz=dm['start_byte'],dm['end_byte']
    if digest(db[da:dz])!=dm['selected_derived_bytes_sha256']:raise ValueError('Derived selected bytes SHA mismatch')
    lines=db.decode('utf-8').splitlines()
    for lm in dm.get('line_mapping',[]):
     aa,zz=lm['raw_start_byte'],lm['raw_end_byte'];parser=Visible();parser.feed(parent[aa:zz].decode('utf-8'));norm=parser.normalized();line=lines[lm['derived_line']-1];expected=''.join(c for c in line if not c.isspace()).encode()
     if digest(expected)!=lm['normalized_line_sha256'] or norm!=expected:raise ValueError('Derived-line raw-envelope mapping mismatch')
  except Exception as ex:fail(type(ex).__name__,sid)
 for pi,f in enumerate(selected.get('located_not_materialized_components',[])):
  try:
   raw=read_exact(f['source_path'],f['source_sha256'],'RAW_SOURCE');a,z=f['start_byte'],f['end_byte']
   if not 0<=a<z<=len(raw) or digest(raw[a:z])!=f['fragment_sha256'] or z-a!=f['bytes']:raise ValueError('Proposed range identity mismatch')
  except Exception as ex:fail(type(ex).__name__,'proposed/'+str(pi))
 for ci,c in enumerate(selected.get('derived_compaction_alternatives',[])):
  try:
   raw=read_exact(c['derived_path'],c['derived_source_sha256'],'DERIVED_EXISTING');a,z=c['start_byte'],c['end_byte']
   if not 0<=a<z<=len(raw) or digest(raw[a:z])!=c['fragment_sha256'] or z-a!=c['bytes']:raise ValueError('Compaction alternative mismatch')
   if not set(c['replace_selection_ids']).issubset(selection_ids):raise ValueError('Compaction replacement selection missing')
  except Exception as ex:fail(type(ex).__name__,'compaction/'+str(ci))
 for x in selected['existing_root_private_transform_references']:
  try:read_exact(x['path'],x['sha256'],'METADATA')
  except Exception as ex:fail(type(ex).__name__,'existing_transform/'+x['role'])
 snapshot_path=Path(cfg['campaign_root'])/'helpers/retention-working-scope-v2/snapshot.json';snapshot=json.loads(snapshot_path.read_bytes());snap={r['original_path']:r for r in snapshot['records']};cwd=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
 bysha={r['source_sha256']:r for r in gap['objects']}
 for i,c in enumerate(coverage['coverage']):
  try:
   ref=c['frozen_reviewer_ref'];r=bysha[c['source_sha256']]
   if ref not in r['frozen_reviewer_refs']:raise ValueError('Coverage original reference differs')
   if not set(c['supplement_selection_ids']).issubset(selection_ids):raise ValueError('Coverage selection missing')
   if ref['record_path'] in snap:
    sr=snap[ref['record_path']]
    if sr['original_sha256']!=ref['record_sha256']:raise ValueError('Frozen original record identity mismatch')
    resolve(sr['document'],ref['pointer'])
   elif ref.get('published_path'):
    doc=json.loads(read_exact(str(cwd/ref['published_path']),ref['record_sha256'],'METADATA'));resolve(doc,ref['pointer'])
   else:raise ValueError('Unresolved frozen original record')
  except Exception as ex:fail(type(ex).__name__,'coverage/'+str(i))
 private=list((out/'private/fragments').glob('*.bin'));listed={h+'.bin' for h in payloads};unlisted=[p.name for p in private if p.name not in listed]
 if unlisted:fail('UNLISTED_PRIVATE_FRAGMENT','scoped_directory')
 if len(source_shas)>cfg['maximum_additional_source_objects']:fail('SOURCE_OBJECT_CAP','selected')
 if sum(payloads.values())>cfg['maximum_private_fragment_bytes']:fail('PRIVATE_PAYLOAD_CAP','selected')
 unique_read_sources={x['sha256'] for x in reads if x['kind']=='RAW_SOURCE'}
 if len(unique_read_sources)>cfg['maximum_additional_source_objects']:fail('LOCATED_SOURCE_OBJECT_CAP','selected_and_proposed')
 result={'schema':'ER10_SUPPLEMENT_IDENTITY_VALIDATION_V1','status':'PASS' if not errors else 'FAIL','scientific_or_necessity_review':False,'source_deletion_authorization':False,'checks':['source_sha256','fragment_sha256','source_byte_range_equivalence','range_bounds_and_no_full_source_copy','derived_selection_hash_and_raw_visible_line_mapping','proposed_unmaterialized_range_hash','derived_compaction_identity','frozen_original_reviewer_pointer','private_directory_selection_membership','configured_bounds'],'errors':errors,'selections':len(selection_ids),'source_objects':len(source_shas),'located_source_objects_read':len(unique_read_sources),'unique_fragments':len(payloads),'private_bytes':sum(payloads.values()),'private_files_not_in_manifest':unlisted,'validator_source_and_derived_bytes_read':rawbytes,'aggregate_source_and_derived_bytes_recorded':ledger['raw_source_bytes']+rawbytes,'finished_at':timestamp().isoformat()}
 if args.write_receipt:
  (out/'VALIDATION.json').write_text(json.dumps(result,indent=2,sort_keys=True)+'\n');ledger.setdefault('previous_validation_reads',[]).append(ledger.get('validation_reads',[]));ledger['validation_reads']=reads;ledger['raw_source_bytes']=ledger['raw_source_bytes']+rawbytes;ledger['validation_raw_and_derived_bytes']=rawbytes;(out/'READ_IDENTITIES.json').write_text(json.dumps(ledger,indent=2,sort_keys=True)+'\n')
  for name in ['SUMMARY.json','RESULT.json']:
   obj=json.loads((out/name).read_bytes());obj['validation_path']=str(out/'VALIDATION.json');obj['validation_status']=result['status'];obj['raw_source_bytes_read_including_parser_probe_and_validation']=ledger['raw_source_bytes'];(out/name).write_text(json.dumps(obj,indent=2,sort_keys=True)+'\n')
 print(json.dumps({k:result[k] for k in ['status','selections','source_objects','located_source_objects_read','unique_fragments','private_bytes','aggregate_source_and_derived_bytes_recorded','errors']}))
 return 0 if not errors else 1
if __name__=='__main__':sys.exit(main())

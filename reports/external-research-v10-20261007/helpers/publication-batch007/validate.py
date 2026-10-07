#!/usr/bin/env python3
"""Validate BATCH007 exact bytes and append-only coverage; no Git or grading.

References are read in a checkout of the manifest's pinned reference commit.
After root publishes this tranche, a later checkout can supply both sets of bytes.
No raw source or excluded usage rollout file is opened.
"""
import argparse, collections, hashlib, json
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);p.add_argument('manifest',type=Path);p.add_argument('--repo',type=Path,required=True);p.add_argument('--staging',type=Path);a=p.parse_args()
b=a.manifest.read_bytes();m=json.loads(b);bad=[];counts=collections.Counter();limits=[];by_target={};root=a.repo.resolve();staging=a.staging.resolve() if a.staging else None
for e in m['entries']:
 counts[e['disposition']]+=1;target=e['target_path'];path=(root/target).resolve()
 if root not in path.parents:bad.append({'target':target,'error':'path_escape'});continue
 identity=(e['target_sha256'],e['target_bytes'])
 if target in by_target and by_target[target]!=identity:bad.append({'target':target,'error':'conflicting_manifest_identity'})
 by_target[target]=identity
 if e['original_sha256']!=e['target_sha256'] or e['original_bytes']!=e['target_bytes']:bad.append({'target':target,'error':'original_target_not_exact'})
 if e['source_kind']=='RAW_BODY_EXCLUDED':bad.append({'target':target,'error':'raw_body_in_payload'})
 try:
  if e['disposition']=='EXISTING_EXACT_COMMIT_REFERENCE':
   if e['reference_commit']!=m['verified_reference_commit']:bad.append({'target':target,'error':'incorrect_reference_pin'})
   source=path
  else:
   source=staging/target if staging else path
   if staging and path.exists():bad.append({'target':target,'error':'new_target_would_overwrite_existing_repo_file'})
  data=source.read_bytes();actual=(hashlib.sha256(data).hexdigest(),len(data))
  if actual!=identity:bad.append({'target':target,'error':'hash_or_byte_mismatch','actual_sha256':actual[0],'actual_bytes':actual[1]})
  if target.endswith('.json'):
   try:json.loads(data)
   except (ValueError,UnicodeError):
    if e.get('json_parse_status','').startswith(('PREFIX_JSON','ORIGINAL_JSON','PRIOR_ORIGINAL')):limits.append({'target':target,'status':e['json_parse_status'],'exact_identity_verified':True})
    else:bad.append({'target':target,'error':'unrecorded_json_parse_limit'})
 except Exception as ex:bad.append({'target':target,'error':type(ex).__name__})
files=[];unmanifested=[];missing=[]
if staging:
 files=[q for q in staging.rglob('*') if q.is_file()]
 manifest_rel=str(a.manifest.resolve().relative_to(staging))
 expected={e['target_path'] for e in m['entries'] if e['disposition']!='EXISTING_EXACT_COMMIT_REFERENCE'}|{manifest_rel}
 actual={str(q.relative_to(staging)) for q in files}
 unmanifested=sorted(actual-expected);missing=sorted(expected-actual)
 if unmanifested:bad.append({'error':'unmanifested_staged_files','paths':unmanifested})
 if missing:bad.append({'error':'missing_staged_files','paths':missing})
 total=sum(q.stat().st_size for q in files)
 if total>512*1024*1024:bad.append({'error':'staging_size_exceeded','bytes':total})
else:total=None
result={'schema':'ER10-batch007-validator-result-v1','manifest_path':str(a.manifest.resolve()),'manifest_sha256':hashlib.sha256(b).hexdigest(),'manifest_bytes':len(b),'reference_commit':m['verified_reference_commit'],'reference_pin_origin':'independently verified by root; supplied in task/config; no new curator GitHub verification','entry_count':len(m['entries']),'entry_dispositions':dict(counts),'unique_targets':len(by_target),'staged_files':len(files) if staging else None,'staged_bytes':total,'unmanifested':unmanifested,'missing':missing,'failures':bad,'original_json_parse_limits':limits,'scientific_grades_changed':False,'raw_rollout_bytes_opened':False,'git_commands_or_writes':False}
print(json.dumps(result,indent=2));raise SystemExit(bool(bad))

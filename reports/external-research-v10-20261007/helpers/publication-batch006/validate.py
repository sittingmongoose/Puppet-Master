#!/usr/bin/env python3
"""Verify every exact BATCH006 payload/reference byte; no scientific grading."""
import argparse, hashlib, json, subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('manifest',type=Path);p.add_argument('--repo',type=Path,required=True);p.add_argument('--staging',type=Path);a=p.parse_args()
m=json.loads(a.manifest.read_bytes());bad=[];counts={};original_parse_limits=[]
for e in m['entries']:
    disposition=e['disposition'];counts[disposition]=counts.get(disposition,0)+1
    target=e['target_path'];path=(a.repo/target).resolve()
    if a.repo.resolve() not in path.parents:bad.append({'target':target,'error':'path_escape'});continue
    staged=a.staging/target if a.staging else None
    try:
        if disposition=='EXISTING_EXACT_COMMIT_REFERENCE':
            b=subprocess.check_output(['git','-C',str(a.repo),'show',e['reference_commit']+':'+target])
        else:b=(staged if staged and staged.is_file() else path).read_bytes()
        if hashlib.sha256(b).hexdigest()!=e['target_sha256'] or len(b)!=e['target_bytes']:bad.append({'target':target,'error':'identity_mismatch'})
        if target.endswith('.json'):
            try:json.loads(b)
            except ValueError:
                if e.get('original_path') and e.get('json_parse_status','').startswith(('PREFIX_JSON','ORIGINAL_JSON')):original_parse_limits.append({'target':target,'status':e['json_parse_status'],'exact_identity_verified':True})
                else:raise
    except Exception as ex:bad.append({'target':target,'error':type(ex).__name__})
print(json.dumps({'entries':len(m['entries']),'counts':counts,'failures':bad,'original_parse_limits':original_parse_limits,'science_regraded':False},indent=2));raise SystemExit(bool(bad))

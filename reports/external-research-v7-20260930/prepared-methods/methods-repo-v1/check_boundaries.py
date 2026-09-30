#!/usr/bin/env python3
"""Read-only paired-binding/integrity and isolated map mechanics checks, never model scoring."""
import hashlib,importlib.util,json,tempfile,time
from pathlib import Path
HERE=Path(__file__).resolve().parent;LAB=HERE.parent;CASE=LAB/'evaluation/exports/jj-repo-dev-v1'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def load(name,path):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
start=time.monotonic();h=load('workspaces',LAB/'dev/harness-v1-frozen/workspaces.py');maptool=load('repo_map_tool',HERE/'repo_map_tool.py');pairs=[]
for dest in sorted((HERE/'pairs').glob('*')):
 a,b=[json.loads((dest/(x+'.spec.json')).read_text()) for x in ['control','treatment']]
 for field in ['inputs','admitted_inputs','caps','output_files','source_access','plan_visibility','evaluation_obligations','scope','zcode_tools','feedback_contract']:
  assert a[field]==b[field],(dest.name,field)
 for arm in ['control','treatment']:h.verify(dest/arm)
 pairs.append({'pair':dest.name,'pair_sha256':sha(dest/'pair.json'),'equal_bindings':True,'attempt_verification':'passed'})
with tempfile.TemporaryDirectory(prefix='jj-map-offline-',dir=HERE) as td:
 p=Path(td);maptool.build(CASE/'repository',CASE/'PIN.json',p/'map1.json');maptool.build(CASE/'repository',CASE/'PIN.json',p/'map2.json')
 a,b=[json.loads((p/x).read_text()) for x in ['map1.json','map2.json']]
 elapsed=[a.pop('index_seconds'),b.pop('index_seconds')];assert a==b
 pin=json.loads((CASE/'PIN.json').read_text());expected_text=sum(b'\0' not in (CASE/'repository'/n).read_bytes() for n in pin['files']);assert len(a['files'])==expected_text and any(x['test_path'] for x in a['files'])
 # Reject wrong frozen input bytes instead of silently indexing mutable source.
 (p/'tree').mkdir();(p/'tree'/'wrong.rs').write_text('fn changed() {}\n')
 (p/'pin.json').write_text(json.dumps({'commit':'a'*40,'repository_url':'https://github.com/jj-vcs/jj','files':{'wrong.rs':'b'*64}}))
 try:maptool.build(p/'tree',p/'pin.json',p/'bad.json')
 except ValueError:wrong_hash_rejected=True
 else:raise AssertionError('wrong hash admitted')
 receipt={'schema':'er7.repo_mechanics_check.v1','status':'passed','pairs':pairs,'map_files':len(a['files']),'map_structural_determinism':'identical excluding measured indexing_seconds','test_paths':sum(x['test_path'] for x in a['files']),'symbol_records':sum(len(x['symbols']) for x in a['files']),'offline_map_seconds':elapsed,'wrong_hash_rejected':wrong_hash_rejected,'elapsed_seconds':time.monotonic()-start,'third_party_execution':False,'candidate_starts':0,'comparison_count':0,'scope':'Experiment mechanics only; no semantic grading or repository tests executed.'}
 (HERE/'boundary-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))

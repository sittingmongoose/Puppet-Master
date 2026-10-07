#!/usr/bin/env python3
"""Append actual validation/report and mechanical locator supplements; no source reads.

Preserves the preliminary manifest unchanged outside staging, then exclusively
creates the final control manifest. Every payload copy is exclusive and exact.
No prior campaign, report, science or repository byte is changed.
"""
import collections,datetime,hashlib,json
from pathlib import Path
H=Path(__file__).resolve().parent;C=json.loads((H/'config.json').read_bytes());R=Path(C['root']);W=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f');S=H/'staging';B='reports/external-research-v10-20261007';P=S/B;MP=P/'BATCH010_MANIFEST.json'
sha=lambda b:hashlib.sha256(b).hexdigest()
def enc(o):return (json.dumps(o,indent=2,ensure_ascii=False)+'\n').encode()
def exclusive(p,b):
 assert p.resolve().is_relative_to(H);p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(b)
def identity(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
original=MP.read_bytes();m=json.loads(original);E=m['entries'];cut=datetime.datetime.fromisoformat(C['fixed_cutoff']).timestamp();deadline=datetime.datetime.fromisoformat(C['deadline']).timestamp()
assert datetime.datetime.now(datetime.timezone.utc).timestamp()<deadline
validation=json.loads((H/'validation-results.json').read_bytes());assert validation['all_passed'] and not validation['failures'] and not validation['coverage_failures']
remote=json.loads((R/'state/publication-batch009-remote-tree-v1.json').read_bytes());blob={B+'/'+x['path']:x for x in remote['tree'] if x['type']=='blob'}
def copied(src,target,kind='CURATOR_ADMINISTRATIVE_NO_GRADING',why='exact original curator report/validation/code administrative artifact'):
 b=src.read_bytes();assert not (W/target).exists();exclusive(S/target,b)
 E.append({'original_path':str(src),'original_sha256':sha(b),'original_bytes':len(b),'target_path':target,'target_sha256':sha(b),'target_bytes':len(b),'source_kind':kind,'disposition':'GENERATED_ADMINISTRATIVE','reference_commit':None,'json_parse_status':'PARSEABLE' if src.suffix=='.json' else 'NOT_JSON','why':why})
def generated(name,o):
 src=H/'generated'/name;exclusive(src,enc(o));copied(src,B+'/'+name)
# Byte-equivalent alias search is confined to already-published manifest identities.
absences=json.loads((P/'BATCH010_ABSENCES_AND_DEFERRALS.json').read_bytes());resolved=[];unresolved=[];published=[]
for i in range(1,10):
 q=json.loads((W/B/f'BATCH{i:03d}_MANIFEST.json').read_bytes())
 for e in q.get('entries',q.get('files',[])):
  op=e.get('original_path') or e.get('source_original_path') or e.get('source_runtime_relative_path')
  t=e.get('target_path') or e.get('target_repo_relative_path') or (B+'/'+e['public_path'] if e.get('public_path') else None)
  if t:
   t=str((W/t).resolve().relative_to(W));published.append((op,t,e.get('target_sha256',e.get('sha256')),e.get('target_bytes',e.get('bytes',e.get('original_bytes'))),f'BATCH{i:03d}_MANIFEST.json'))
for q in absences['unresolved_old_authority_exact_pins']:
 matches=[]
 for op,t,h,n,mn in published:
  if (h,n)!=(q['sha256'],q['bytes']):continue
  b=(W/t).read_bytes();r=blob.get(t);git=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
  if r and (sha(b),len(b),git,r['size'])==(h,n,r['sha'],n):matches.append((op,t,h,n,mn))
 if not matches:unresolved.append(q);continue
 op,t,h,n,mn=sorted(matches,key=lambda x:x[1])[0]
 resolved.append({'requested_original_path':q['original_path'],'requested_sha256':h,'requested_bytes':n,'published_snapshot_original_path':op,'canonical_target_path':t,'reference_commit':m['verified_reference_commit'],'prior_manifest':mn,'status':'EXACT_BYTE_EQUIVALENT_PUBLISHED_ALIAS','provenance_limit':'Byte equivalence is verified. Snapshot path is distinct provenance; original capture identity record remains unchanged. No source/current-state recapture or scientific regrade.'})
 E.append({'original_path':q['original_path'],'original_sha256':h,'original_bytes':n,'target_path':t,'target_sha256':h,'target_bytes':n,'source_kind':'HISTORICAL_BYTE_EQUIVALENT_AUTHORITY_ALIAS_REFERENCE','disposition':'EXISTING_EXACT_COMMIT_REFERENCE','reference_commit':m['verified_reference_commit'],'prior_manifest':mn,'json_parse_status':'PRIOR_ORIGINAL_PARSE_STATUS_UNCHANGED','why':'expected authority exact bytes verified in distinct published snapshot; provenance distinction retained','same_byte_alias_original_path':op})
# Generic resolver does not carry a stage-map key into nested filename locators.
# A supplement resolves only already-manifested bytes with exact pointer/stage/SHA.
v=json.loads((P/'BATCH010_VERIFICATION.json').read_bytes());nested=[]
for q in v['source_identity_checks']:
 if q['status']!='ABSENT_OR_DEFERRED_AT_CUTOFF' or '/stage_freezes/' not in q['identity_pointer']:continue
 stage=q['identity_pointer'].split('/stage_freezes/',1)[1].split('/scientific_files/',1)[0];name=q['identity_pointer'].split('/scientific_files/',1)[1];actual=str(R/'jobs'/stage/name)
 matches=[e for e in E if e['original_path']==actual and (e['original_sha256'],e['original_bytes'])==(q['expected_sha256'],q['expected_bytes'])]
 assert len(matches)==1,(actual,matches)
 e=matches[0];nested.append({'record':q['record'],'identity_pointer':q['identity_pointer'],'preflight_inferred_locator':q['locator'],'actual_authored_nested_stage_locator':actual,'sha256':e['original_sha256'],'bytes':e['original_bytes'],'target_path':e['target_path'],'status':'MATCH_AUTHORED_NESTED_STAGE_LOCATOR','limit':'Preflight generic locator ignored nested stage-map context. Every scientific file was already exact manifested; no scientific absence, original byte repair or grade change.'})
assert len(nested)==5
supplement={'schema':'ER10-batch010-mechanical-locator-supplement-v1','fixed_cutoff':C['fixed_cutoff'],'exact_published_old_authority_byte_aliases':resolved,'unresolved_old_authority_exact_identities':unresolved,'resolved_nested_M07A_stage_locators':nested,'initial_preflight_records_preserved':True,'science_or_original_authority_records_rewritten':False,'no_new_source_research_or_recapture':True,'remaining_limit':'Fourteen old raw authority editions lack exact public bytes at their captured identities; original selected metadata authority manifest remains exact. Do not substitute current state or infer perfect old whole-authority replay.'}
generated('BATCH010_LOCATOR_SUPPLEMENT.json',supplement)
# Actual full mechanical validation/report from the completed preflight are payload.
for name in ['curation-report.json','validation-results.json','finalize.py']:
 copied(H/name,B+'/helpers/publication-batch010/'+name)
# Preserve the exact first control-manifest bytes as an administrative edition.
pre=H/'attempts/BATCH010_MANIFEST-preflight-v1.json';exclusive(pre,original)
m['preflight_manifest_identity']=identity(pre);m['finalization']={'performed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actual_preflight_validation':identity(H/'validation-results.json'),'preflight_manifest_preserved_unchanged':True,'payload_report_and_validation_added_after_actual_checks':True,'locator_supplement':'BATCH010_LOCATOR_SUPPLEMENT.json','no_scientific_changes':True}
# Only the curator-created control manifest moves; no payload/source is overwritten.
archived=H/'attempts/original-staged-control-manifest-v1.json';assert not archived.exists();MP.rename(archived);assert archived.read_bytes()==original;exclusive(MP,enc(m))
files=[p for p in S.rglob('*') if p.is_file()];size=sum(p.stat().st_size for p in files);assert size<=C['max_staging_bytes']
report={'schema':'ER10-batch010-final-delivery-v1','finished_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fixed_cutoff':C['fixed_cutoff'],'deadline':C['deadline'],'staging_root':str(S),'manifest':identity(MP),'index':identity(P/'INDEX_BATCH010.md'),'source_identity_record':identity(P/'BATCH010_SOURCE_IDENTITIES.json'),'tranche':identity(P/'BATCH010_COMPARISON_TRANCHE.json'),'verification':identity(P/'BATCH010_VERIFICATION.json'),'locator_supplement':identity(P/'BATCH010_LOCATOR_SUPPLEMENT.json'),'actual_preflight_validation':identity(H/'validation-results.json'),'curation_report':identity(H/'curation-report.json'),'entry_count':len(E),'entry_dispositions':dict(collections.Counter(e['disposition'] for e in E)),'staged_files':len(files),'staged_bytes':size,'old_authority_byte_equivalent_aliases_resolved':len(resolved),'old_authority_exact_bytes_still_unresolved':len(unresolved),'nested_stage_locator_preflight_limits_resolved':len(nested),'campaign_complete':False,'native_method_comparative_credit':False,'root_final_allquiet_observation_pending':True,'Git_repo_cleanup_server_account_changes':False,'next':'Run final own byte/scope validator; root publishes/verifies GitHub then root cleans.'}
exclusive(H/'delivery.json',enc(report));print(json.dumps(report,indent=2))

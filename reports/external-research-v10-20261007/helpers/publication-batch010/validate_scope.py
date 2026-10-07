#!/usr/bin/env python3
"""Independent finite BATCH010 byte, scope and numeric verification. No live sources.

Writes only the explicit result file within this helper. Does not execute SDK
readers, native Goals, candidate checks, Git, network requests or cleanup.
"""
import argparse,collections,datetime,hashlib,json,subprocess,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--repo',required=True,type=Path);ap.add_argument('--out',required=True,type=Path);a=ap.parse_args()
assert a.out.resolve().is_relative_to(HERE)
S=HERE/'staging';B='reports/external-research-v10-20261007';P=S/B;mp=P/'BATCH010_MANIFEST.json';m=json.loads(mp.read_bytes());bad=[];checks=[]
run=subprocess.run([sys.executable,'-B',str(HERE/'validate.py'),str(mp),'--repo',str(a.repo),'--staging',str(S)],capture_output=True,timeout=60)
result=json.loads(run.stdout);result['validator_exit_code']=run.returncode
R=Path(json.loads((HERE/'config.json').read_bytes())['root']);cut=datetime.datetime.fromisoformat(m['fixed_cutoff']).timestamp()
entries=m['entries'];by_original=collections.defaultdict(list)
for e in entries:by_original[e['original_path']].append(e)
def exact(rel):
 ee=by_original[str(R/rel)];assert len(ee)==1,(rel,len(ee));e=ee[0]
 return (a.repo if e['disposition']=='EXISTING_EXACT_COMMIT_REFERENCE' else S)/e['target_path']
def load(rel):return json.loads(exact(rel).read_bytes())
def check(name,condition,details=None):
 checks.append({'name':name,'passed':bool(condition),'details':details})
 if not condition:bad.append({'error':name,'details':details})
source=json.loads((P/'BATCH010_SOURCE_IDENTITIES.json').read_bytes());rawpaths={x['path'] for x in source['identities']};absences=json.loads((P/'BATCH010_ABSENCES_AND_DEFERRALS.json').read_bytes());omitted={x['path']:x['status'] for x in absences['omissions'] if 'path' in x}
coverage=[]
for scope in ['jobs/D-M07-A','reviews/targeted-cohort3/D-M07-A-v3','cases/D-M07-A','helpers/recorded-usage-v2','helpers/targeted-cohort3/D-M07-A/administrative-prebinding-originals']:
 rows=[];missing=[]
 for p in sorted((R/scope).rglob('*')):
  if not p.is_file() or p.stat().st_mtime>cut:continue
  reason='EXACT_MANIFESTED' if str(p) in by_original else 'RAW_SOURCE_IDENTITY_ONLY_BODY_EXCLUDED' if str(p) in rawpaths else omitted.get(str(p))
  if reason is None:missing.append(str(p))
  else:rows.append({'path':str(p),'disposition':reason})
 check('closed_scope_all_authored_pre_cut_files_accounted_'+scope,not missing,missing)
 coverage.append({'scope':scope,'accounted':rows,'unexpected_missing':missing})
# Published SOURCE bodies and private/liveness evidence are not admissible.
private=[];held_science=[];noncanonical=[]
for e in entries:
 p=Path(e['original_path']);t=Path(e['target_path'])
 if '..' in t.parts or not (a.repo/t).resolve().is_relative_to((a.repo/B).resolve()):noncanonical.append(str(t))
 if p.name in ['DECISIONS.json','write_decisions.py'] or '/retention-root-witnesses-v1/' in str(p) or p.suffix in ['.sqlite','.db','.pdf','.patch','.html','.c','.rs','.rst'] or any(v in p.parts for v in ['rollouts','sessions','profiles']):private.append(str(p))
 if any(v in str(p) for v in ['/jobs/D-M07-B/','/jobs/D-M09-A/','/jobs/D-M06-A/','/jobs/D-M06-B/','/reviews/targeted-cohort3/D-M07-B']):held_science.append(str(p))
check('all_targets_canonical_report_paths',not noncanonical,noncanonical);check('no_raw_source_private_or_session_bodies',not private,private);check('no_live_held_scientific_original_entries',not held_science,held_science)
v=json.loads((P/'BATCH010_VERIFICATION.json').read_bytes())
for q in v['prior_manifest_checks']:
 b=Path(q['path']).read_bytes();check('unchanged_'+Path(q['path']).name,hashlib.sha256(b).hexdigest()==q['sha256'] and len(b)==q['bytes'])
check('six_old_aliases_canonicalized_lookup_only',len(v['prior_canonical_aliases'])==6)
remote=load('state/publication-batch009-remote-tree-v1.json');remote_blobs={B+'/'+x['path']:x for x in remote['tree'] if x['type']=='blob'}
ref_bad=[]
for e in entries:
 if e['disposition']!='EXISTING_EXACT_COMMIT_REFERENCE':continue
 b=(a.repo/e['target_path']).read_bytes();git=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest();row=remote_blobs.get(e['target_path'])
 if not row or (row['sha'],row['size'])!=(git,len(b)):ref_bad.append(e['target_path'])
check('all_existing_refs_match_actual_B9_recorded_remote_Git_blob_identity',not ref_bad,ref_bad)
# Five task quiet/settle receipts, without current status polling.
quiet=[]
for rel in ['jobs/D-M07-A/common/fresh-untrusted-seed-v3','jobs/D-M07-A/control/document-order-review-final-v3','jobs/D-M07-A/treatment/critical-first-protected-breadth-final-v3','reviews/targeted-cohort3/D-M07-A-v3/J1','reviews/targeted-cohort3/D-M07-A-v3/J2']:
 f=load(rel+'/freeze_disposition.json');q=load(rel+'/quiet_task_receipt.json');settle=exact(rel+'/settle_receipt.json');quiet.append({'scope':rel,'quiet':f.get('quiet'),'settle_bytes':settle.stat().st_size})
 check('original_quiet_settle_'+rel,f.get('quiet') is True and settle.stat().st_size>0)
pair=load('reviews/targeted-cohort3/D-M07-A-v3/PAIR_COMPARISON.json');check('original_diagnostic_FAIL_HOLD_no_method',pair['control']==pair['treatment']=='FullSourceFAIL' and pair['is_method_comparison'] is False and 'HOLD' in pair['native_provenance_comparative_disposition'])
for arm,stage in [('control','document-order-review-final-v3'),('treatment','critical-first-protected-breadth-final-v3')]:
 f=load('jobs/D-M07-A/'+arm+'/'+stage+'/freeze_disposition.json');check('original_missing_ACTIVE_'+arm,f['native_active_observed'] is False)
# Same capture and independent arithmetic only; no SDK sources reopened.
u='helpers/recorded-usage-v2/';initial=load(u+'observation-20261007T231635Z-eb490bede0eae84b.json');final=load(u+'final/observation-20261007T231625Z-9eea80abc27c8de8.json')
before={s['native_id']:{k:v for k,v in s.items() if k!='role_mapping'} for s in initial['sessions']};after={s['native_id']:{k:v for k,v in s.items() if k!='role_mapping'} for s in final['sessions']}
check('one_capture_identity_telemetry_liveness_unchanged',before==after)
check('same_campaign_partition_and_counters',set(initial['campaign_selected_quiet_SDK_work']['native_ids'])==set(final['campaign_selected_quiet_SDK_work']['native_ids']) and initial['campaign_selected_quiet_SDK_work']['field_sums']==final['campaign_selected_quiet_SDK_work']['field_sums'])
fields=['input_tokens','cached_input_tokens','cache_write_input_tokens','output_tokens','reasoning_output_tokens','total_tokens'];idx={s['native_id']:s for s in final['sessions']};members=[];roles=collections.Counter();sums={f:0 for f in fields};group_fail=[]
for g in final['groups']:
 ns=g['native_ids'];members+=ns
 for n in ns:
  s=idx[n];roles[s['role_mapping']['category']]+=1
  if s['measurement_status']!='QUIET_SESSION_OBSERVED':group_fail.append(n)
  for f in fields:sums[f]+=s['reported_total_token_usage'][f]
 expected={f:sum(idx[n]['reported_total_token_usage'][f] for n in ns) for f in fields}
 # Original group field name remains recorded; root aggregate sums checked independently.
 quantities=g.get('field_sums',g.get('reported_total_token_usage'))
 if quantities is not None and quantities!=expected:group_fail.append(str(g.get('key',g.get('group'))))
check('quiet_unique_228_once',len(members)==len(set(members))==228 and not group_fail,group_fail)
check('independent_campaign_final_cumulative_sums',sums==final['campaign_selected_quiet_SDK_work']['field_sums'],sums)
check('independent_quiet_role_partition',dict(roles)=={'candidate':126,'independent_source_review':62,'coordination':1,'operational_helper':20,'unattributed':19},dict(roles))
common=final['common_seed_ledger'];check('common10_reference_only_once',len(common)==10 and all(x['ledger_is_reference_not_an_additional_sum'] for x in common))
check('otherprovider_NULL',all(i['SDK_quantities'] is None for i in final['inventory'] if i['disposition']=='INVENTORY_non_Codex_Gmail_SDK_quantities_null'))
check('initial_and_corrected_editions_distinct',hashlib.sha256(exact(u+'authority-manifest.json').read_bytes()).hexdigest()!=hashlib.sha256(exact(u+'final/authority-manifest.json').read_bytes()).hexdigest())
cleanup=load('state/cleanup-verified-staging-B2-B9-total-v1.json');check('actual_B2to9_cleanup_numbers',cleanup['files_removed_B2_to_B9']==5558 and cleanup['logical_bytes_removed_B2_to_B9']==142570900)
replay=load('state/cleanup-publication-batch009-replay-executed-v1.json');check('actual_B9_replay_cleanup_numbers',replay['files_removed']==925 and replay['logical_bytes_removed']==60343176 and replay['all_removals_actual_absent_verified'])
all_pass=run.returncode==0 and not bad
result.update({'schema':'ER10-batch010-independent-byte-scope-numeric-validation-v1','completed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'scope_coverage':coverage,'coverage_failures':bad,'all_passed':all_pass,'passed_checks':sum(x['passed'] for x in checks),'total_checks':len(checks),'canonical_prior_aliases':v['prior_canonical_aliases'],'preserved_scientific_identity_limit_counts':v['identity_check_counts'],'unresolved_old_authority_exact_pins':absences['unresolved_old_authority_exact_pins'],'live_source_or_SQL_or_native_session_recaptured':False,'scientific_regrading':False,'final_root_allquiet_observation_still_pending':True,'before_deadline':datetime.datetime.now(datetime.timezone.utc).timestamp()<=datetime.datetime.fromisoformat(m['deadline']).timestamp()})
assert not a.out.exists(),'append-only validation output required';a.out.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['checks','scope_coverage','original_json_parse_limits','canonical_prior_aliases']},indent=2));raise SystemExit(not all_pass)

"""Freeze compact permitted campaign evidence. Run only against the original isolated lab."""
from pathlib import Path
import hashlib,json,re,time,datetime,sys
LAB=Path('/home/sittingmongoose/PM-Experiments/external-research-v7-20260930')
OUT=Path(__file__).resolve().parents[1]
FREEZE={};COPIES=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 p=LAB/p if not Path(p).is_absolute() else Path(p);b=p.read_bytes();FREEZE[str(p)]={'sha256':sha(b),'bytes':len(b)};return b
def jread(p):return json.loads(read(p))
def put(p,obj):
 p=OUT/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')
def copy(src,dst,expected=None):
 b=read(src)
 if expected:assert sha(b)==expected,(src,sha(b),expected)
 p=OUT/dst;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b);COPIES.append({'source':str(LAB/src),'published':dst,'sha256':sha(b),'bytes':len(b)})
def excerpt(src,dst,keys):
 obj=jread(src)
 if 'cleanup_actions' in obj:
  for action in obj['cleanup_actions']:
   if len(json.dumps(action.get('result',{})))>1000:
    result=action.pop('result');action['result_omitted']='native thread/read projection excluded; original hash-bound receipt remains private';action['omitted_result_sha256']=sha(json.dumps(result,sort_keys=True).encode())
 put(dst,{'source':str(LAB/src),'source_sha256':FREEZE[str(LAB/src)]['sha256'],'projection':'exact selected fields; omitted fields remain private',**{k:obj[k] for k in keys if k in obj}})
now=time.time();stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
# Stager hash bindings verified for every source actually consumed; private corpora stay private.
stager=jread('evaluation/staging-resume-v1/MANIFEST.sha256.json')
for name in ['accounting.json','verification.json','pair-mechanics.json','pairs.json','resume-boundary-accounting.json']:
 src='evaluation/staging-resume-v1/'+name;copy(src,'cohort-evidence/staging/'+name,stager[str(LAB/src)])
copy('evaluation/staging-resume-v1/MANIFEST.sha256.json','cohort-evidence/staging/MANIFEST.sha256.json')
receiptkeys=['schema','label','app','native_goal_entry','prompt_bytes','prompt_sha256','objective_sha256','caps','start_utc','fresh_session','session_id','model_id','provider_id','effort_ack','effort_effective','goal_submitted_utc','goal_ack','stop_reason','goal_status_final','end_utc','elapsed_seconds','native_responses','counters','cleanup_actions','native_process_returncode','own_process_group_absent','native_quiescent','startup_cleanup_elapsed_seconds','caps_include_setup_and_cleanup','receipt_written_utc','namespace_process_returncode','namespace_exited','quiescence_basis']
allrows=[]
for pair,arms in [('t01-m-ome-batching-screen-v1',['control-opening','control-display','treatment']),('t09-m-azure-discovery-screen-v1',['control','treatment']),('t03-z-ome-render-screen-v2',['control','treatment']),('t13-m-ome-amendments-screen-v1',['control','treatment'])]:
 base='methods-v1/pairs/'+pair;copy(base+'/pair.json','cohort-evidence/pairs/'+pair+'.json')
 for arm in arms:
  src=base+'/'+arm;dst='candidate-outputs/'+pair+'-'+arm
  attempt=jread(src+'/attempt.json');copy(src+'/goal.txt',dst+'/goal.txt');copy(src+'/workspace/TASK.md',dst+'/TASK.md')
  # Attempt config has no provider credentials; retains exact prospective specification and input hashes.
  put(dst+'/config.json',{'source':str(LAB/(src+'/attempt.json')),'source_sha256':FREEZE[str(LAB/(src+'/attempt.json'))]['sha256'],'spec':attempt['spec'],'input_manifest':attempt.get('input_manifest'),'prepared_status':attempt.get('status'),'status_note':'prepared status is creation-time only; native receipt is terminal authority'})
  integ=jread(src+'/output-integrity.json');copy(src+'/output-integrity.json',dst+'/output-integrity.json')
  receipt=jread(src+'/native/receipt.json');assert sha(read(src+'/native/receipt.json'))==integ['native_receipt_sha256']
  excerpt(src+'/native/receipt.json',dst+'/native-receipt-excerpt.json',receiptkeys)
  for item in integ['files']:
   name=Path(item['target']).name
   if name in ['report.md','acquisition.json','observations.md','history.json','versions_manifest.json','verification.json','decisions.json']:
    copy(item['source'],dst+'/'+name,item['sha256'])
  row={'job_id':receipt['label'],'method':pair[:3].upper(),'arm':arm,'family':attempt['spec']['family'],'native_goal_status':receipt.get('goal_status_final'),'stop_reason':receipt.get('stop_reason'),'model_effective':receipt.get('model_id'),'effort_effective':receipt.get('effort_effective'),'structural_complete':integ['structural_complete'],'missing_required_outputs':integ['missing_required_outputs'],'semantic_quality':'unassessed','native_receipt':dst+'/native-receipt-excerpt.json','metrics':{'source_supported_acquisition':'unassessed; candidate acquisition records are self-reports','source_exposure':'deferred history staging; no semantic judgment','temporal_preservation':'unassessed; current-first stage required','exact_rendering':'not tested' if pair.startswith('t03') else 'byte hashes verified for copied artifacts; no semantic equivalence inference','native_completion_seconds_including_waits':receipt.get('elapsed_seconds'),'total_seconds_including_setup_waits_cleanup':receipt.get('startup_cleanup_elapsed_seconds'),'cleanup_seconds_only':None,'cleanup_note':'startup+cleanup aggregate exposed; separate cleanup not exposed','native_responses':receipt.get('native_responses'),'reported_usage':receipt.get('counters'),'generated_completeness':'unknown; native children/cancelled output may be omitted'}}
  put(dst+'/metrics.json',row['metrics']);allrows.append(row)
 if pair.startswith('t01'):
  copy(base+'/aggregate-control-report.md','candidate-outputs/'+pair+'-aggregate-control/report.md');copy(base+'/aggregate-control-integrity.json','candidate-outputs/'+pair+'-aggregate-control/output-integrity.json')
copy('ops/t03-restart-finalization/receipt.json','cohort-evidence/t03-finalization.json')
# Relevant accepted implementation; no live mutation of machinery.
impl=jread('methods-v1/implementation-manifest.json')
for name in ['aggregate_t01.py','cards.py','mechanics.py','prepare_methods.py','test_mechanics.py','test_methods.py','dependency_tool.py','repo_map_tool.py','seed_report.py']:
 copy('methods-v1/'+name,'machinery/methods-v1/'+name,impl['files'][name])
copy('methods-v1/implementation-manifest.json','machinery/methods-v1/implementation-manifest.json')
copy('evaluation/reviews/root-t13-t14-card-acceptance.json','reviews/root-t13-t14-card-acceptance.json')
# Single immutable accounting observation. Active jobs are state, never implied finished results.
slots=jread('ops/slots.json');jobs=slots['jobs'];active=[];rows=[]
for job_id,row in jobs.items():
 out={k:row.get(k) for k in ['family','status','admitted_epoch','released_epoch','cap_seconds','hard_release_deadline_epoch','reported_output_tokens','usage_completeness','model_requested','effort_requested','effective_model','effective_effort','quiescence']};out['job_id']=job_id
 if row.get('released_epoch') is None:active.append(out)
 rows.append(out)
(OUT/'attempts.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows))
put('cohort-evidence/terminal-attempts.json',allrows)
put('schedule.json',{'as_of_utc':stamp,'status':'resumed ongoing partial campaign','deadline_epoch':1790820406,'deadline_utc':'2026-10-01T02:06:46+00:00','max_simultaneous_helpers':24,'helper_start_ceiling':72,'family_caps':{'M':2,'Z':2,'L':2},'active_owned_candidates':active,'sibling_occupancy':'unknown; untouched','snapshot_source_sha256':FREEZE[str(LAB/'ops/slots.json')]['sha256']})
econ=json.loads((OUT/'economics.json').read_text());econ.update({'as_of_utc':stamp,'counted_launch_admissions':len(jobs),'known_native_goal_starts':len(jobs)-2,'pre_goal_failures':2,'occupied_slot_seconds_as_of_snapshot':sum((v.get('released_epoch') or now)-v['admitted_epoch'] for v in jobs.values()),'reported_candidate_output_tokens_lower_bound':sum(v.get('reported_output_tokens') or 0 for v in jobs.values()),'generated_output_completeness':'unknown; all figures partial, native children/cancellation/unexposed fields retained unknown','helper_generated_tokens':None,'parent_sol_usage':'includes input; generated component unknown','candidate_fees':None,'same_quality_efficiency_claim':False,'new_terminal_attempt_metrics':'cohort-evidence/terminal-attempts.json'});put('economics.json',econ)
methods=json.loads((OUT/'methods.json').read_text())
for m in methods:
 if m['id'] in ['T01','T02','T03','T06','T08','T09','T13','T14']:
  m['status']={'T01':'frozen pending independent current review','T02':'current reviewed; preservation unassessed','T03':'structural output failure; no final reports','T06':'frozen pending independent current review','T08':'L quarantined; finite repairs exhausted','T09':'frozen pending independent current review','T13':'native blocked; all required outputs missing','T14':'active at snapshot; unassessed'}[m['id']]
  m['terminal_assessment']='quality failure' if m['id']=='T02' else 'infrastructure-limited' if m['id'] in ['T08','T13'] else 'unassessed'
put('methods.json',methods)
comparisons=json.loads((OUT/'comparisons.json').read_text());comparisons=[x for x in comparisons if x['method'] not in ['T03','T09','T13']]
for mid in ['T03','T09','T13']:comparisons.append({'method':mid,'family':'Z' if mid=='T03' else 'M','assessment':'infrastructure-limited' if mid=='T13' else 'unassessed','current_outputs_frozen':True,'semantic_review':'pending; no efficiency win claimed','structural_status':'complete' if mid=='T09' else 'required outputs missing'})
put('comparisons.json',comparisons)
manifest=json.loads((OUT/'manifest.json').read_text());manifest['ceilings']['simultaneous_helpers']=24;manifest['publication_status']='resumed ongoing partial cohort';manifest['publication_as_of_utc']=stamp;put('manifest.json',manifest)
put('cohort-evidence/source-freeze.json',{'as_of_utc':stamp,'files':FREEZE,'copies':COPIES,'staging_contract':'Verify consumed stager-manifest entries; do not publish sealed keys/raw sources/full native conversations','semantic_assessments':'Only final notified independent assessments may be added; no unfinished grader files copied'})
print(json.dumps({'as_of_utc':stamp,'terminal_attempts':len(allrows),'admissions':len(jobs),'active_jobs':len(active),'copied_artifacts':len(COPIES)}))

"""Hash-bound publication of final independent readouts and prepared, held methods."""
from pathlib import Path
import json,hashlib,datetime
LAB=Path('/home/sittingmongoose/PM-Experiments/external-research-v7-20260930')
OUT=Path(__file__).resolve().parents[1];FILES={};COPIES=[]
def digest(b):return hashlib.sha256(b).hexdigest()
def read(src,expected=None):
 p=Path(src);p=p if p.is_absolute() else LAB/p;b=p.read_bytes();h=digest(b)
 if expected:assert h==expected,(str(p),h,expected)
 FILES[str(p)]={'sha256':h,'bytes':len(b)};return b
def load(src,expected=None):return json.loads(read(src,expected))
def put(dst,obj):
 p=OUT/dst;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')
def copy(src,dst,expected=None):
 b=read(src,expected);p=OUT/dst;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b);COPIES.append({'source':str(src if Path(src).is_absolute() else LAB/src),'published':dst,'sha256':digest(b),'bytes':len(b)})
summaries={'R003-R004-current-only-summary.json':'8c338976a1b72165ec62e4839ee38e277ebd14d496efbabbd6747935104bb093','C017-current-summary.json':'ed6441575be171c830f846f0630cb7e8b96427e212d7f1403b68917ed1430c2e','C028-current-summary.json':'ef6c60f843fd7b57838671441d01e7b19fafcb7b0b902b5a85a779d4500ecfe0','first-pair-preservation-summary.json':'7284e9fcc81e6492b90067875afa3a56752052fb30a27a7647fe2eff3ecf93da'}
for name,h in summaries.items():copy('grading/'+name,'reviews/'+name,h)
a=load('grading/R003-R004-current-only-summary.json',summaries['R003-R004-current-only-summary.json'])
for row in a['reviews']:
 rid=row['review_id'];copy(row['report_path'],'reviews/'+rid+'/current-report.md',row['report_sha256'])
 for kind in ['json','md']:copy(row['assessment_'+kind+'_path'],'reviews/'+rid+'/current-assessment.'+kind,row['assessment_'+kind+'_sha256'])
b=load('grading/C017-current-summary.json',summaries['C017-current-summary.json'])
for row in b['reports']:
 rid=row['report_id'];copy('grading/'+rid+'/current-report.md','reviews/'+rid+'/current-report.md',row['report_sha256'])
 for kind in ['json','md']:copy(row['current_assessment_'+kind],'reviews/'+rid+'/current-assessment.'+kind,row['current_assessment_'+kind+'_sha256'])
c=load('grading/C028-current-summary.json',summaries['C028-current-summary.json'])
for rid,hashes in c['assessment_hashes'].items():
 assessment=load('grading/'+rid+'/current-assessment.json',hashes['json'])
 for kind,h in hashes.items():copy('grading/'+rid+'/current-assessment.'+kind,'reviews/'+rid+'/current-assessment.'+kind,h)
 # The grade carries report hash under source binding; native report is already present.
 copy('grading/'+rid+'/current-report.md','reviews/'+rid+'/current-report.md')
d=load('grading/first-pair-preservation-summary.json',summaries['first-pair-preservation-summary.json'])
for row in d['assessment_artifacts']:copy(row['path'],'reviews/'+row['review_id']+'/'+Path(row['path']).name,row['sha256'])
for rid,bindings in d['frozen_phase1_hashes'].items():
 for name,h in bindings.items():
  read('grading/'+rid+'/'+name,h)
  if name.startswith('current-assessment'):assert digest((OUT/'reviews'/rid/name).read_bytes())==h
# Complete frozen T14 outputs, exact cards/config projections and native lifecycle fields.
keys=['schema','label','app','native_goal_entry','prompt_bytes','prompt_sha256','objective_sha256','caps','start_utc','fresh_session','session_id','model_id','provider_id','effort_ack','effort_effective','goal_submitted_utc','goal_ack','stop_reason','goal_status_final','end_utc','elapsed_seconds','native_responses','counters','native_process_returncode','own_process_group_absent','native_quiescent','startup_cleanup_elapsed_seconds','caps_include_setup_and_cleanup','receipt_written_utc','namespace_process_returncode','namespace_exited','quiescence_basis']
terminal=[];pair='methods-v1/pairs/t14-m-ome-negative-screen-v1';copy(pair+'/pair.json','cohort-grading/pairs/t14-m-ome-negative-screen-v1.json')
for arm in ['control','treatment']:
 src=pair+'/'+arm;dst='candidate-outputs/t14-m-ome-negative-screen-v1-'+arm;attempt=load(src+'/attempt.json');integ=load(src+'/output-integrity.json');receipt=load(src+'/native/receipt.json',integ['native_receipt_sha256']);assert receipt['native_quiescent'] and integ['structural_complete']
 copy(src+'/goal.txt',dst+'/goal.txt');copy(src+'/workspace/TASK.md',dst+'/TASK.md');copy(src+'/output-integrity.json',dst+'/output-integrity.json')
 put(dst+'/config.json',{'source':str(LAB/(src+'/attempt.json')),'source_sha256':FILES[str(LAB/(src+'/attempt.json'))]['sha256'],'spec':attempt['spec'],'input_manifest':attempt.get('input_manifest'),'prepared_status':attempt.get('status'),'status_note':'creation-time prepared status; terminal native receipt is lifecycle authority'})
 put(dst+'/native-receipt-excerpt.json',{'source':str(LAB/(src+'/native/receipt.json')),'source_sha256':integ['native_receipt_sha256'],'projection':'selected exact lifecycle/model/usage fields; native conversations remain private',**{k:receipt[k] for k in keys if k in receipt}})
 for item in integ['files']:copy(item['source'],dst+'/'+Path(item['target']).name,item['sha256'])
 metrics={'source_supported_acquisition':'unassessed; candidate records are self-reports','source_exposure':'unassessed','temporal_preservation':'unassessed; current review must freeze first','exact_rendering':'copied output bytes hash verified; no semantic equivalence inferred','native_completion_seconds_including_waits':receipt.get('elapsed_seconds'),'total_seconds_including_setup_waits_cleanup':receipt.get('startup_cleanup_elapsed_seconds'),'cleanup_seconds_only':None,'reported_usage':receipt.get('counters'),'generated_completeness':'unknown; native children/cancelled work may be omitted','quality':'unassessed; independent R011/R012 pending','runtime_safety':'inherited v1 qualification withdrawn; auth-readable boundary proved without content reads'}
 put(dst+'/metrics.json',metrics);terminal.append({'job_id':receipt['label'],'arm':arm,'receipt':dst+'/native-receipt-excerpt.json','structural_complete':True,'semantic_quality':'unassessed','metrics':metrics})
put('cohort-grading/t14-terminal-attempts.json',terminal)
# Accepted preparation inventory. Copy cards/code and compact metadata only, never source trees/corpora.
inventory=[];seen=set()
for mid in ['t07','t08','t10','t11','t12']:
 name='resume-method-gate-'+mid+'-v1';review=load('evaluation/reviews/resume-gates/'+name+'.json');copy('evaluation/reviews/resume-gates/'+name+'.json','reviews/'+name+'.json');copy('evaluation/reviews/resume-gates/'+name+'.md','reviews/'+name+'.md')
 items=[]
 for src,h in review['reviewed_files'].items():
  # Full source blobs, repository clones and evaluator store are excluded.
  # Oversized duplicated repository attempt/spec manifests in the historical export are
  # projected to compact exact non-input fields; see source-freeze projections.
  # Do not rerun this importer to overwrite an existing cohort without that projection step. Their pins remain in review.
  excluded=('/sources/' in src or '/repository/' in src or '/plan/' in src or '/private/' in src or '/workspace/inputs/' in src)
  if excluded:items.append({'source':str(LAB/src),'sha256':h,'publication':'private source/input; metadata pin only'});continue
  dst='prepared-methods/'+src
  if src not in seen:copy(src,dst,h);seen.add(src)
  items.append({'source':str(LAB/src),'sha256':h,'published':dst})
 inventory.append({'method':mid.upper(),'review_status':review['status'],'acceptance_scope':review['acceptance_scope'],'candidate_executions':0,'native_launch':'held: inherited runtime credential boundary unqualified; new accepted runtime and prospective rebind required','items':items})
put('cohort-grading/prepared-method-inventory.json',inventory)
put('cohort-grading/source-freeze.json',{'as_of_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':FILES,'copies':COPIES,'scope':'final independent current/preservation readouts; T14 terminal cohort; preparation not execution; no new native starts'})
print(json.dumps({'copied':len(COPIES),'source_bindings':len(FILES),'prepared_inventory_methods':len(inventory)}))

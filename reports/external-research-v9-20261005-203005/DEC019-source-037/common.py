"""Pinned metadata and opaque byte transfer only; no interpretation of candidate content."""
import hashlib,importlib.util,json,pathlib,shutil
LAB=pathlib.Path('/home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005')
ROOT=pathlib.Path(__file__).resolve().parent
PAIR='I-01-FAILED-PARENT-WARM-CONTINUATION-R001'
RJOB='I-01-FRESH-DELIVERY-R001-treatment-research-a001'
CJOB=PAIR+'-treatment-critique-a001';FJOB=PAIR+'-treatment-revision-a001'
DONOR={'path':str(LAB/'ops/dispatcher/I01_ORIGINAL_T_FAILED_R_AUTHENTIC_DONOR_001/SELECTION.json'),'sha256':'ff0087a716b7935a80b4ed2e88f8195caf02dd9b5c14f0970d8bb8c41eb6f51b'}
MODEL={'providerId':'builtin:zai-coding-plan','modelId':'GLM-5.3-Flash'}
def sha(path):
 h=hashlib.sha256()
 with pathlib.Path(path).open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()
def ref(path):return {'path':str(pathlib.Path(path).absolute()),'sha256':sha(path)}
def checked(r):
 p=pathlib.Path(r['path']).absolute()
 if any(x.is_symlink() for x in (p,*p.parents)) or not p.is_file() or sha(p)!=r['sha256']:raise ValueError('Pinned regular administrative file required')
 return json.loads(p.read_bytes())
def put(path,value):
 p=pathlib.Path(path);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(value,indent=2,sort_keys=True)+'\n')
def clone(row,target):
 source=pathlib.Path(row['path']);target=pathlib.Path(target)
 if any(x.is_symlink() for x in (source,*source.parents)) or not source.is_file() or sha(source)!=row['sha256'] or ('bytes' in row and source.stat().st_size!=row['bytes']):raise ValueError('Opaque original SHA/length mismatch')
 target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists():raise ValueError('Existing destination cannot be overwritten')
 shutil.copyfile(source,target)
 if sha(target)!=row['sha256']:raise ValueError('Opaque transferred bytes differ')
 return {'path':str(target),'sha256':row['sha256'],'bytes':target.stat().st_size}
def module(path):
 s=importlib.util.spec_from_file_location('warm_'+pathlib.Path(path).stem,str(path));m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

def validate_failed_parent(selection_ref=DONOR):
 s=checked(selection_ref)
 if s.get('job_id')!=RJOB or s.get('status')!='FAILED' or s.get('operational_complete') is not False or s.get('native_goal_starts')!=1 or s.get('semantic_bodies_or_evaluator_findings_included') is not False:raise ValueError('Only named original failed research donor permitted')
 stage=checked(s['actual_stage_ref']);freeze=checked(s['freeze_ref']);release=checked(s['release_ref']);context=checked(s['closed_context_ref']);capsules=checked(s['capsule_ref']);reg=checked(s['owner_registration_ref'])
 cap=next((r for r in capsules['rows'] if r.get('job_id')==RJOB),None)
 if cap is None or cap.get('observed_family')!='Z' or cap.get('observed_model')!=MODEL or cap.get('observed_effort')!='max' or cap.get('native_goal_state')!='paused':raise ValueError('Actual original GLM Flash/max/paused Goal proof required')
 if stage.get('job_id')!=RJOB or stage.get('arm')!='treatment' or stage.get('stage')!='research' or reg.get('family')!='Z' or reg.get('requested_model')!='GLM 5.3 Flash' or reg.get('requested_effort')!='Max':raise ValueError('Exact original actor/stage/arm authority required')
 if freeze.get('operational_complete') is not False or freeze.get('native_quiescent') is not True or freeze.get('missing_required_artifacts') or freeze.get('invalid_json_artifacts'):raise ValueError('Failed parent must have valid complete required bytes and positive owned quiet')
 if cap['output_freeze']!=s['freeze_ref'] or cap['native_receipt']!=context['native_receipt'] or context.get('job_id')!=RJOB or context.get('arm')!='treatment' or context.get('output_freeze')!=s['freeze_ref'] or context.get('owned_quiet_positive') is not True or context.get('native_model_io_or_candidate_semantics_included') is not False:raise ValueError('Exact authenticated failed donor/source joins required')
 # The saved native object is accessed by exact declared JSON pointers only.
 obj=checked(cap['goal_identity_evidence'])
 def pointer(x,p):
  for token in p.split('/')[1:]:x=x[token]
  return x
 proof=cap['goal_identity_evidence']
 if pointer(obj,proof['goal_id_selector'])!=cap['origin_goal_id'] or pointer(obj,proof['status_selector'])!='paused':raise ValueError('Direct original native paused Goal identity mismatch')
 receipt=checked(cap['native_receipt'])
 if receipt.get('goal_activated') is not True or receipt.get('goal_target_id')!=cap['origin_goal_id'] or receipt.get('observed_model')!=MODEL or receipt.get('observed_effort')!='max' or receipt.get('resource_components_quiet') is not True or receipt.get('resource_oom_observed') is not False:raise ValueError('Positive actual Goal/actor/kernel settlement required')
 # Release schema is pinned; positive recursive quiet joins below are selected generically only from known fields.
 if release.get('all_private_slice_descendants_quiet') is not True or release.get('stop_returncode')!=0 or release.get('after',{}).get('ActiveState')!='inactive' or release.get('after',{}).get('ControlGroup')!='':raise ValueError('Positive private recursive release required')
 required={'research/proposal.md','research/sources.json','research/witnesses.json','research/leads.json'}
 if {a['relative_path'] for a in s['required_research4']}!=required:raise ValueError('Exactly required original authored research4 required')
 for a in s['required_research4']:
  if sha(a['path'])!=a['sha256'] or pathlib.Path(a['path']).stat().st_size!=a['bytes']:raise ValueError('Required original research4 drift')
 for item in context['sources']:
  if not item.get('origin_operation_proofs') or sha(item['metadata']['path'])!=item['metadata']['sha256'] or sha(item['body']['path'])!=item['body']['sha256'] or pathlib.Path(item['body']['path']).stat().st_size!=item['body']['bytes']:raise ValueError('Actual stage-private source capture provenance/hash required')
 return s,context,cap

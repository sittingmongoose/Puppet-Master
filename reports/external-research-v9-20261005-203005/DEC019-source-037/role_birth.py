"""Named failed-R exception only; fresh final imports only this new authentic critic."""
import argparse,copy,json,pathlib
import common as p

def import_origin(ws,pins,origin,artifacts,captures):
 imported=[]
 for a in artifacts:
  rel=pathlib.PurePosixPath(a['relative_path'])
  if rel.is_absolute() or '..' in rel.parts:raise ValueError('Confined own-prior relative path required')
  path='inputs/prior/'+origin+'/'+str(rel);r=p.clone(a,ws/path);pins[r['path']]=r['sha256'];imported.append({'path':path,'sha256':r['sha256'],'bytes':r['bytes'],'origin_job_id':origin,'origin_role':'research' if origin==p.RJOB else 'critique'})
 source_index=[]
 for i,item in enumerate(captures):
  body=item['body'];path='inputs/source_context/'+origin+'/'+str(i).zfill(4)+'.body';r=p.clone(body,ws/path);pins[r['path']]=r['sha256'];imported.append({'path':path,'sha256':r['sha256'],'bytes':r['bytes'],'origin_job_id':origin,'origin_role':'research' if origin==p.RJOB else 'critique'})
  source_index.append({k:item.get(k) for k in ('capture_id','requested_url','actual_url','status','body_complete','source_version') }|{'candidate_path':path,'sha256':r['sha256'],'bytes':r['bytes'],'original_native_source_semantics':'UNASSESSED'})
 if captures:
  path='inputs/source_context/'+origin+'/index.json';p.put(ws/path,{'schema':'er9.candidate-source-index.v1','sources':source_index});pins[str(ws/path)]=p.sha(ws/path);imported.append({'path':path,'sha256':p.sha(ws/path),'bytes':(ws/path).stat().st_size,'origin_job_id':origin,'origin_role':'research' if origin==p.RJOB else 'critique'})
 return imported

def fresh_critic(parent):
 if parent.get('job_id')!=p.CJOB:raise ValueError('Only this new named critic may feed final')
 freeze=p.checked(parent['freeze_ref']);stage=p.checked(parent['actual_stage_ref']);context=p.checked(parent['closed_context_ref']);caps=p.checked(parent['capsule_ref']);cap=next((r for r in caps['rows'] if r.get('job_id')==p.CJOB),None)
 if cap is None or cap.get('observed_family')!='Z' or cap.get('observed_model')!=p.MODEL or cap.get('observed_effort')!='max' or cap.get('native_goal_state')!='complete':raise ValueError('Fresh genuine GLM critic COMPLETE proof required')
 if stage.get('job_id')!=p.CJOB or stage.get('pair_id')!=p.PAIR or stage.get('arm')!='treatment' or freeze.get('job_id')!=p.CJOB or freeze.get('operational_complete') is not True or freeze.get('native_quiescent') is not True or freeze.get('missing_required_artifacts') or freeze.get('invalid_json_artifacts'):raise ValueError('Fresh valid quiet current critic required')
 if context.get('job_id')!=p.CJOB or context.get('arm')!='treatment' or context.get('output_freeze')!=parent['freeze_ref'] or context.get('owned_quiet_positive') is not True or context.get('native_model_io_or_candidate_semantics_included') is not False:raise ValueError('Exact closed current critic captures required')
 if cap.get('output_freeze')!=parent['freeze_ref'] or cap.get('native_receipt')!=context.get('native_receipt'):raise ValueError('Current critic capsule/source joins differ')
 receipt=p.checked(cap['native_receipt']);direct=p.checked(cap['goal_identity_evidence'])
 def pointer(obj,path):
  for token in path.split('/')[1:]:obj=obj[token]
  return obj
 proof=cap['goal_identity_evidence']
 if receipt.get('goal_activated') is not True or receipt.get('goal_target_id')!=cap.get('origin_goal_id') or receipt.get('observed_model')!=p.MODEL or receipt.get('observed_effort')!='max' or receipt.get('resource_components_quiet') is not True or receipt.get('resource_oom_observed') is not False or pointer(direct,proof['goal_id_selector'])!=cap.get('origin_goal_id') or pointer(direct,proof['status_selector'])!='complete':raise ValueError('Direct complete current critic Goal/actor/quiet proof required')
 for item in context['sources']:
  if not item.get('origin_operation_proofs') or p.sha(item['metadata']['path'])!=item['metadata']['sha256']:raise ValueError('Current critic closed capture provenance required')
 release=p.checked(parent['release_ref'])
 if release.get('all_private_slice_descendants_quiet') is not True:raise ValueError('Current critic private recursive quiet required')
 artifacts=[a for a in freeze['artifacts'] if a.get('relative_path','').startswith('critique/')]
 if not any(a['relative_path']=='critique/review.md' and a['bytes']>0 for a in artifacts):raise ValueError('Current authenticated critic review required')
 return artifacts,context['sources']

def bind(plan_ref):
 plan=p.checked(plan_ref)
 if plan.get('schema')!='er9.actual-role-birth-binding-plan.v1':raise ValueError('Pinned ordinary birth plan ABI required')
 reg=p.checked(plan['registration_ref']);job=plan['job_id'];row=next((r for r in reg['stage_jobs'] if r['job_id']==job),None)
 expected=[p.RJOB] if job==p.CJOB else [p.RJOB,p.CJOB] if job==p.FJOB else None
 if row is None or expected is None or plan.get('arm')!='treatment' or plan.get('origin_job_ids')!=expected or reg.get('pair_id')!=p.PAIR or reg.get('family')!='Z' or reg.get('requested_model')!='GLM 5.3 Flash' or reg.get('requested_effort')!='Max':raise ValueError('Only exact two named warm GLM roles and authentic parent order allowed')
 selection,context,cap=p.validate_failed_parent(reg['source_owned_failed_parent_exception']);source_ref={'path':row['stage_json'],'sha256':row['stage_sha256']};source=p.checked(source_ref)
 if source['job_id']!=job or source['max_seconds']!=(900 if job==p.CJOB else 600) or source['max_responses']!=(90 if job==p.CJOB else 60):raise ValueError('Original role caps must remain exact')
 critic_data=None
 if job==p.FJOB:
  current=plan.get('new_critic_parent')
  if not isinstance(current,dict):raise ValueError('Final waits for this new actual critic; no invented future hashes')
  critic_data=fresh_critic(current)
 destination=pathlib.Path(plan['destination_root']).absolute()
 if not any(root in destination.parents for root in (p.ROOT,p.LAB/'ops/dispatcher/role-birth')) or destination.exists():raise ValueError('Fresh owned immutable birth destination required')
 ws=destination/'workspace';(ws/'out').mkdir(parents=True);p.clone({'path':source['prompt_file'],'sha256':source['prompt_sha256']},ws/'TASK.md');pins={}
 for path,digest in source['input_pins'].items():
  rel=pathlib.Path(path).relative_to(source['workspace']);r=p.clone({'path':path,'sha256':digest},ws/rel);pins[r['path']]=r['sha256']
 imports=import_origin(ws,pins,p.RJOB,selection['required_research4'],context['sources'])
 if job==p.FJOB:
  artifacts,captures=critic_data;imports+=import_origin(ws,pins,p.CJOB,artifacts,captures)
 index={'schema':'er9.own-prior-file-index.v1','job_id':job,'pair_id':p.PAIR,'arm':'treatment','files':imports};p.put(ws/'inputs/prior_file_index.json',index);pins[str(ws/'inputs/prior_file_index.json')]=p.sha(ws/'inputs/prior_file_index.json')
 provenance={'schema':'er9.failed-parent-warm-provenance.v1','original_research_job_id':p.RJOB,'original_operational_status':'FAILED','original_native_Goal_state':'paused','original_Goal_id':cap['origin_goal_id'],'original_freeze':selection['freeze_ref'],'original_costs_retained':True,'source_fact_or_quality_grade':'UNASSESSED','new_stage_id':job,'no_old_critic_final_or_other_arm_evaluator_import':True};p.put(ws/'inputs/FAILED_PARENT_PROVENANCE.json',provenance);pins[str(ws/'inputs/FAILED_PARENT_PROVENANCE.json')]=p.sha(ws/'inputs/FAILED_PARENT_PROVENANCE.json')
 selected=copy.deepcopy(source);selected.update(workspace=str(ws),prompt_file=str(ws/'TASK.md'),input_pins=pins,out=str(destination/'native'),freeze_out=str(destination/'OUTPUT_FREEZE.json'),actual_prior_index_ref=p.ref(ws/'inputs/prior_file_index.json'),actual_role_birth_binding=plan_ref);selected['glm_resource'].update(capture_dir=str(destination/'public_captures'),evidence_dir=str(destination/'tool-evidence'))
 p.put(destination/'role-bound-stage.json',selected);p.put(destination/'ACCEPTED_OWN_PRIOR_IMPORTS.json',{'schema':'er9.accepted-own-prior-imports.v1','job_id':job,'pair_id':p.PAIR,'arm':'treatment','authenticated_same_arm':True,'named_failed_parent_exception_only':p.RJOB,'imports':imports})
 receipt={'schema':'er9.actual-role-birth-binding-receipt.v1','job_id':job,'pair_id':p.PAIR,'arm':'treatment','plan_ref':plan_ref,'stage_ref':p.ref(destination/'role-bound-stage.json'),'index_ref':p.ref(ws/'inputs/prior_file_index.json'),'accepted_imports_ref':p.ref(destination/'ACCEPTED_OWN_PRIOR_IMPORTS.json'),'original_failed_parent_selection_ref':reg['source_owned_failed_parent_exception'],'new_critic_parent':plan.get('new_critic_parent'),'Task_tool_model_caps_choice_unchanged_at_binding':True,'actual_clocks':'not allocated by this constructor; original new-role birth and limits computed by dispatch/worker before Goal','model_or_native_calls':0,'extra_logical_target_credit':False}
 p.put(destination/'ROLE_BIRTH_RECEIPT.json',receipt);return p.ref(destination/'ROLE_BIRTH_RECEIPT.json')
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--plan',required=True);parser.add_argument('--plan-sha256',required=True);a=parser.parse_args();print(json.dumps(bind({'path':str(pathlib.Path(a.plan).absolute()),'sha256':a.plan_sha256})))

"""Apply exact source navigation version only after original authenticated import."""
import json,subprocess
from pathlib import Path
import dispatch
NEUTRAL={'brief.md','source_access.json','source_separation.md','delivery_objective.md','output_contract.md','common_criteria.json','delivery_role_manifest.json'}
def checked(ref):
 assert dispatch.sha(ref['path'])==ref['sha256'];return json.loads(Path(ref['path']).read_text())
def bind_ready(lab,state):
 changed=[];dirty=False
 for row in state['jobs']:
  selected=row.get('own_prior_navigation_selection')
  if not selected or not row.get('own_prior_navigation_index_pending') or row.get('own_prior_navigation_binding_blocker') or row['status']!='SEALED_READY':continue
  assert not row.get('native_goal_starts') and not row.get('start_utc') and not row.get('original_birth_monotonic_ns')
  try:
   pin=checked(selected['source_pin']);
   for path,digest in pin['source_pins'].items():assert dispatch.sha(path)==digest
   template=checked(selected['navigation_template_ref']);source=checked(template['source_original_stage_ref']);boundref={'path':row['stage_json'],'sha256':row['stage_sha256']};bound=checked(boundref)
   oldws=Path(bound['workspace']);neutral={Path(path).relative_to(source['workspace']).as_posix():digest for path,digest in source['input_pins'].items() if Path(path).relative_to(source['workspace']).parent==Path('inputs') and Path(path).name in NEUTRAL}
   # The original binder/strict ancestor checks ran before SEALED_READY. Keep
   # every imported byte; this DTO does not pick files by content or relevance.
   imports=[]
   for path,digest in bound['input_pins'].items():
    file=Path(path);rel=file.relative_to(oldws).as_posix()
    if rel in neutral:
     assert neutral[rel]==digest;continue
    assert dispatch.sha(file)==digest
    imports.append({'path':rel,'sha256':digest,'bytes':file.stat().st_size,'origin_arm_id':row['arm']})
   home=lab/'ops/dispatcher/role-birth'/row['job_id']/'navigation-index-ops';home.mkdir(parents=True,exist_ok=True)
   auth=home/'ACCEPTED_IMPORTS.json';dispatch.atomic(auth,{'schema':'er9.accepted-own-prior-imports.v1','authenticated_same_arm':True,'job_id':row['job_id'],'pair_id':row['pair_id'],'arm':row['arm'],'imports':imports})
   plan={'schema':'er9.unentered-own-prior-navigation-binding-plan.v1','native_goal_starts':0,'launch_intents':0,'navigation_template_ref':selected['navigation_template_ref'],'already_authenticated_bound_stage_ref':boundref,'authorized_imports_ref':{'path':str(auth),'sha256':dispatch.sha(auth)},'destination_root':str(home/'actual-source-bound')}
   planpath=home/'PLAN.json';dispatch.atomic(planpath,plan);receiptpointer=home/'BINDING_RESULT.json'
   if receiptpointer.exists():receiptref=json.loads(receiptpointer.read_text())
   else:
    entry=pin['existing_bound_entrypoint'];result=subprocess.run(['/usr/bin/python3','-B',entry['path'],'--plan',str(planpath),'--plan-sha256',dispatch.sha(planpath)],capture_output=True,text=True,timeout=30)
    if result.returncode:raise ValueError(result.stderr[-1800:])
    receiptref=json.loads(result.stdout);dispatch.atomic(receiptpointer,receiptref)
   receipt=checked(receiptref);stage=receipt['stage_ref'];newstage=checked(stage);assert receipt['job_id']==row['job_id'] and receipt['arm']==row['arm']
   original_profile=bound.get('glm_resource',{}).get('bundle_profile')
   if row.get('bundle_binding_required'):
    assert original_profile and newstage['glm_resource']['bundle_profile']==original_profile
    profile=checked(original_profile);oldmanifest=oldws/profile['import_manifest']['path'];newmanifest=Path(newstage['workspace'])/profile['import_manifest']['path'];assert dispatch.sha(oldmanifest)==dispatch.sha(newmanifest)==profile['import_manifest']['sha256']
   for key in ['job_id','pair_id','arm','stage','max_seconds','max_responses','required_artifacts']:assert newstage[key]==bound[key]
   runtime_override=dict(row.get('glm_resource_override') or newstage['glm_resource'])
   runtime_override['bundle_profile']=newstage['glm_resource'].get('bundle_profile')
   row.update(status='WAITING_RUNTIME_BINDING',prepared_stage_json=stage['path'],prepared_stage_sha256=stage['sha256'],binding_run_name=row['job_id']+'-navigation-index-r001',own_prior_navigation_index_pending=False,own_prior_navigation_binding=receiptref,original_pre_navigation_stage_ref=boundref,glm_resource_override=runtime_override)
   changed.append(row['job_id']);dispatch.event(lab,'AUTHENTICATED_OWN_PRIOR_INDEX_BOUND',job_id=row['job_id'],receipt_ref=receiptref,new_native_starts=0,original_carrier_profile_preserved=original_profile)
  except Exception as error:
   dirty=True;row['own_prior_navigation_binding_blocker']=str(error)[-1800:];dispatch.event(lab,'OWN_PRIOR_INDEX_PREPARATION_BLOCKED',job_id=row['job_id'],error_class=type(error).__name__,native_starts=0,other_research_continue=True)
 if changed or dirty:dispatch.atomic(lab/'state/jobs.json',state)
 return changed

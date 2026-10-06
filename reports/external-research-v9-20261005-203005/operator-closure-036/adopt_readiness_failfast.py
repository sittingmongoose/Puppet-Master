"""Prospective operational runtime selection for existing unentered roles only."""
import json,copy,subprocess
from pathlib import Path
import dispatch

def adopt(lab):
 assert subprocess.run(['systemctl','--user','is-active','er9-203005-dispatcher.service'],capture_output=True,text=True).stdout.strip()!='active'
 defs={};home=lab/'ops/dispatcher/READINESS_FAILFAST_ADOPTION_001';home.mkdir(exist_ok=False)
 for bundle,pindigest in [(False,'42107a409938af375d9f8d66a759a5ef51b5fd2fd90dc0d3197bde44be593450'),(True,'ac8c325209966762b0facc70f9ca41ac14d14b9a627ae00412ab87ba22b33763')]:
  root=lab/'dev/execution/glm-resource-v1/versions'/('readiness-failfast-bundle-v1' if bundle else 'readiness-failfast-core-v1');pinpath=root/'PIN.json';assert dispatch.sha(pinpath)==pindigest;pin=json.loads(pinpath.read_text());outbox=json.loads((root/'OUTBOX.json').read_text());verify=json.loads((root/'VERIFICATION.json').read_text())
  assert verify['result']=='PASS' and verify['tests']==16 and verify['actual_native_model_Goal_calls']==0
  for path,digest in pin['runtime_source_pins'].items():assert dispatch.sha(path)==digest
  oldmarker=lab/'ops/dispatcher'/('GLM_BUNDLE_CLOCK_V3_READY.json' if bundle else 'GLM_CLOCK_V3_READY.json');ready=json.loads(oldmarker.read_text());ready=copy.deepcopy(ready);ready.update(source_pins=pin['runtime_source_pins'],worker_path=outbox['worker']['path'],resource_source_pin=outbox['source_pin'],repair_basis={'path':str(root/'OUTBOX.json'),'sha256':dispatch.sha(root/'OUTBOX.json')})
  ready['resource_definition'].update(version=outbox['version'],source_pin=outbox['source_pin'],resource_contract={'path':str(root/'RESOURCE_CONTRACT.json'),'sha256':dispatch.sha(root/'RESOURCE_CONTRACT.json')})
  marker=lab/'ops/dispatcher'/('GLM_BUNDLE_READINESS_V1_READY.json' if bundle else 'GLM_READINESS_V1_READY.json');assert not marker.exists();dispatch.atomic(marker,ready);defs[bundle]=(marker,ready)
 state=json.loads((lab/'state/jobs.json').read_text());journal=[json.loads(x) for x in (lab/'state/attempts.jsonl').read_text().splitlines() if x];rows=[]
 for row in state['jobs']:
  if row.get('family')!='Z' or row.get('track') not in ['FRESH_DEVELOPMENT_REPAIR','CONFIRMATION'] or row['status'] not in ['SEALED_READY','WAITING_RUNTIME_BINDING'] or row.get('resource_definition',{}).get('version') not in ['glm_complete2304_clock_v3','glm_complete2304_bundle_clock_v3']:continue
  assert not row.get('native_goal_starts') and not row.get('start_utc') and not row.get('original_birth_monotonic_ns')
  assert not any(e.get('job_id')==row['job_id'] and e.get('kind',e.get('event')) in ['STAGE_LAUNCH_INTENT','STAGE_SERVICE_LAUNCHED','SCORED_NATIVE_GOAL_ACTIVATED'] for e in journal)
  marker,ready=defs[bool(row.get('bundle_binding_required'))];before={k:copy.deepcopy(row.get(k)) for k in ['status','stage_json','stage_sha256','prepared_stage_json','prepared_stage_sha256','runtime_binding_ready','worker_path','resource_definition','glm_resource_override','max_seconds','max_responses','pipeline_closure']};override=copy.deepcopy(row['glm_resource_override']);override.update(version=ready['resource_definition']['version'],source_pins=ready['source_pins'])
  if row['status']=='SEALED_READY':
   spec=json.loads(Path(row['stage_json']).read_text());override['bundle_profile']=spec['glm_resource'].get('bundle_profile');prepared=home/(row['job_id']+'-PREPARED_STAGE.json');spec['glm_resource'].update(version=ready['resource_definition']['version'],source_pins=ready['source_pins']);dispatch.atomic(prepared,spec)
   origins=row.get('hydrated_actual_native_ancestor_ids') or row.get('all_same_arm_prior_job_ids',[])
   row.update(status='WAITING_RUNTIME_BINDING',prepared_stage_json=str(prepared),prepared_stage_sha256=dispatch.sha(prepared),binding_run_name=row['job_id']+'-readiness-v1-r001',hydrated_actual_native_ancestor_ids=origins,all_same_arm_prior_job_ids=[],prerequisite_job_ids=[])
  row.update(runtime_binding_ready={'path':str(marker),'sha256':dispatch.sha(marker)},worker_path=ready['worker_path'],resource_definition=ready['resource_definition'],glm_resource_override=override,pre_failfast_runtime_selection=before,readiness_failfast_operational_version_declared=True)
  firstR=next((r for r in state['jobs'] if r.get('pair_id')==row['pair_id'] and r.get('stage')=='research' and r.get('native_goal_starts')),None)
  row['operational_runtime_changed_after_first_R']=bool(firstR)
  if firstR:row['fresh_matched_design_eligible']=False
  rows.append({'job_id':row['job_id'],'pair_id':row['pair_id'],'arm':row['arm'],'stage':row['stage'],'old_selection':before,'new_marker':row['runtime_binding_ready'],'actual_current0Goal_noIntent':True,'changed_after_first_R':bool(firstR),'max_seconds':row['max_seconds'],'max_responses':row['max_responses']})
 i12=[r for r in state['jobs'] if r.get('pair_id')=='I-12-FRESH-DELIVERY-R001-CLOCK-R001'];assert len(i12)==6 and all(r['job_id'] in {r['job_id'] for r in rows} for r in i12),'Full both-arm I12 closure must precede firstR'
 proof=home/'SELECTION.json';dispatch.atomic(proof,{'schema':'er9.future-unentered-readiness-operational-source-selection.v1','observed_utc':dispatch.now(),'rows':rows,'source_runtime_markers':{str(k):{'path':str(v[0]),'sha256':dispatch.sha(v[0])} for k,v in defs.items()},'I12_all6_roles_closed_before_either_first_R':True,'all_selected0Goal_noIntent':True,'current_roles_or_oldbytes_changed':False,'new_candidate_allocation_or_repeat':False,'source_native_model_calls':0,'original_caps_family_task_inputs_tools_and_clock_choices_preserved':True})
 for row in state['jobs']:
  if row.get('readiness_failfast_operational_version_declared'):row['readiness_failfast_source_selection_ref']={'path':str(proof),'sha256':dispatch.sha(proof)}
 dispatch.atomic(lab/'state/jobs.json',state);dispatch.event(lab,'FUTURE_UNENTERED_READINESS_FAILFAST_SOURCE_SELECTED',job_ids=[r['job_id'] for r in rows],proof={'path':str(proof),'sha256':dispatch.sha(proof)},new_native_starts=0,new_allocation=False);return {'selected':len(rows),'proof':str(proof),'sha256':dispatch.sha(proof)}
if __name__=='__main__':print(json.dumps(adopt(Path.cwd())))

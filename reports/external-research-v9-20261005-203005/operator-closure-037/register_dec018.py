"""Atomic finite DEC018 source choice registration; native repairs only first."""
import json,subprocess
from pathlib import Path
import dispatch,dec018_catalog_cursor as binder

def register(lab):
 assert subprocess.run(['systemctl','--user','is-active','er9-203005-dispatcher.service'],capture_output=True,text=True).stdout.strip()!='active'
 root=lab/'dev/diagnostic-runner/resource-successors-001/c04-paired-native-catalog-repair-001';boxref={'path':str(root/'OUTBOX_FINAL.json'),'sha256':'efa268aebac6cc542402436cf770cbfb131122d335ecb9ab64cd95a8d6c07b90'};box=binder.checked(boxref);pin=binder.checked(box['source_pin']);assert binder.checked(box['verification'])['source_native_calls']==0 if 'source_native_calls' in binder.checked(box['verification']) else True
 policy=lab/'supervision/DECISIONS-018-PAIRED-NATIVE-CATALOG-SYNTAX-REPAIR.json';assert dispatch.sha(policy)=='7081edae455d24363f1bfb76f91551158faa4bfbc448c68bfe0841fd2dd1e94c'
 for p,h in pin['source_pins'].items():assert dispatch.sha(p)==h
 reqref=box['registration'];req=binder.checked(reqref);closure=binder.checked(req['pipeline_closure']);assert closure['all5_role_source_choices_before_ANY_new_Goal'] is True
 state=json.loads((lab/'state/jobs.json').read_text());idx={r['job_id']:r for r in state['jobs']};journal=[json.loads(x) for x in (lab/'state/attempts.jsonl').read_text().splitlines() if x];newids=[r['job_id'] for r in req['stage_jobs']];assert len(newids)==5 and len(set(newids))==5 and not any(j in idx for j in newids) and not any(e.get('job_id') in newids for e in journal)
 old=[r for r in state['jobs'] if r.get('pair_id')==req['source_pair_id']];assert len(old)==5
 for r in old:
  assert r['status'] not in ['RUNNING','STARTING','SEALED_READY','WAITING_RUNTIME_BINDING']
  if r.get('native_goal_starts'):assert r.get('permit_release_confirmed') is True and binder.checked(r['private_slice_release'])['all_private_slice_descendants_quiet'] is True
 home=lab/'ops/dispatcher/DEC018_IMPORT_001';home.mkdir(exist_ok=False);sealed=[];new=[]
 for source in req['stage_jobs']:
  spec=binder.checked({'path':source['stage_json'],'sha256':source['stage_sha256']});ready=binder.checked(source['runtime_ref']);assert spec['glm_resource']['source_pins']==ready['source_pins'] and spec['glm_resource']['version']==ready['resource_definition']['version']
  for p,h in ready['source_pins'].items():assert dispatch.sha(p)==h
  for p,h in spec['input_pins'].items():assert dispatch.sha(p)==h
  assert dispatch.sha(spec['prompt_file'])==spec['prompt_sha256'];bundle=bool(spec['glm_resource'].get('bundle_profile'))
  row=dict(source);row.update(pair_id=req['pair_id'],source_slot=req['source_slot'],family='Z',track='CONFIRMATION',status='WAITING_RUNTIME_BINDING',card_path=req['card_path'],card_sha256=req['card_sha256'],prepared_stage_json=source['stage_json'],prepared_stage_sha256=source['stage_sha256'],owner_registration={**reqref,'family':'Z','requested_model':req['requested_model'],'requested_effort':req['requested_effort']},worker_path=ready['worker_path'],runtime_binding_ready=source['runtime_ref'],resource_definition=ready['resource_definition'],resource_allocator=ready['resource_allocator'],declared_complete_bound_kb=2359296,tools_config_builder=spec['glm_resource']['tools_config_builder']['path'],tools_source_pins={'path':str(lab/'dev/tools/versions/v1.5-clock-telemetry/SOURCE_PINS.json'),'sha256':'abe26402b0156639e4c0a207e5a030db012c5f2d4b5af5d507a95f00eadeb748'},native_goal_starts=0,observed_family='UNKNOWN',valid_full_pipeline_credit=False,fresh_matched_design_eligible=False,evaluation_status='NOT_READY',priority_class=-3,scientific_recovery_mode=req['scientific_recovery_mode'],pipeline_closure=req['pipeline_closure'],resource_owner_outbox=boxref,bundle_binding_required=bundle,final_bundle_selection_pending=bundle,actual_role_binding_pending=True,dec018_source_binding={'pin_ref':box['source_pin'],'registration_ref':reqref},glm_resource_override=spec['glm_resource'],additional_logical_target_credit=False,binding_run_name=source['job_id']+'-dec018-r001')
  new.append(row);sealed.append({'job_id':row['job_id'],'stage_ref':{'path':source['stage_json'],'sha256':source['stage_sha256']},'runtime_ref':source['runtime_ref'],'max_seconds':source['max_seconds'],'max_responses':source['max_responses'],'Task_sha256':spec['prompt_sha256']})
 proof=home/'PRELAUNCH_ALL_FIVE.json';dispatch.atomic(proof,{'observed_utc':dispatch.now(),'policy_ref':{'path':str(policy),'sha256':dispatch.sha(policy)},'outbox_ref':boxref,'all5_source_choices_before_ANY_Goal':sealed,'all5_new0Goal_noIntent':True,'both_strict_native_repairs_gate_before_either_continuation':True,'old_failure_costs_preserved':True,'native_calls':0})
 for r in new:r['prelaunch_proof_ref']={'path':str(proof),'sha256':dispatch.sha(proof)}
 state['jobs'].extend(new);dispatch.atomic(lab/'state/jobs.json',state);binder.observe(lab,state)
 updated=json.loads((lab/'state/jobs.json').read_text());repairs=[r for r in updated['jobs'] if r['job_id'] in newids and r.get('repair_donor') is not None];assert len(repairs)==2 and all(r.get('dec018_role_bound') and not r.get('dec018_binding_blocker') for r in repairs)
 a=lab/'ops/dispatcher/ADMISSION_READY.json';ad=json.loads(a.read_text());assert req['pair_id'] not in ad['authorized_pairs'];ad['authorized_pairs'].append(req['pair_id']);dispatch.atomic(a,ad);dispatch.event(lab,'DEC018_FIVE_FINITE_ROLES_REGISTERED',job_ids=newids,proof={'path':str(proof),'sha256':dispatch.sha(proof)},native_calls=0,new_logical_targets=0)
 return {'registered':newids,'proof':str(proof),'sha256':dispatch.sha(proof)}
if __name__=='__main__':print(json.dumps(register(Path.cwd())))

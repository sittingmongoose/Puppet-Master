#!/usr/bin/env python3
"""Locked four confirmations: new coupled full closure, never a recipe repeat."""
import copy
import json
from pathlib import Path
import shutil
import prepare_successors as p
import prepare_fresh_cohort as fresh
import prepare_bundle_transport as transport
import bind_fresh_runtime as runtime

ROOT=Path(__file__).resolve().parent

def prepare():
    lock={'path':str(p.LAB/'supervision/DECISIONS-007-RECIPE-LOCK.json'),'sha256':p.LOCK_SHA}
    if p.checked(lock)['status']!='LOCKED':raise ValueError('Recipe must be locked before packet work')
    source=p.checked(p.ref(ROOT/'glm-batch001/OUTBOX.json'));destination=ROOT/'confirmation-full-closure002'
    _,base=runtime.integration(False)
    common=p.checked(p.ref(ROOT/'glm-batch001/COMMON_RESOURCE_BINDING.json'))
    common=copy.deepcopy(common)
    common.update(source_pin=runtime.BASE,native_stage_runner=base['worker_path'],resource_contract=base['contract'],
                  glm_stage_options=base['stage_glm_resource'],resource_definition=base['row_resource_definition'],
                  per_role_source_choices={'ordinary':runtime.BASE,'complete_final':runtime.BUNDLE})
    p.put(destination/'COMMON_RESOURCE_BINDING.json',common);common_ref=p.ref(destination/'COMMON_RESOURCE_BINDING.json')
    rules=fresh.linking_rules();rules.update(cohort='four separately released locked confirmations',
                        recipe_lock_ref=lock,new_development_warm_outputs_substituted=False)
    p.put(destination/'ROLE_LINKING_RULES.json',rules);rule_ref=p.ref(destination/'ROLE_LINKING_RULES.json')
    requests=[]
    for source_ref in source['requests']:
        original=p.checked(source_ref)
        if not original['pair_id'].startswith('C-'):continue
        pair=original['pair_id'].replace('RESOURCE-R001','RESOURCE-R002-BUNDLE')
        root=destination/pair;card=p.checked({'path':original['card_path'],'sha256':original['card_sha256']})
        mapping={row['job_id']:row['job_id'].replace('RESOURCE-R001','RESOURCE-R002-BUNDLE') for row in original['stage_jobs']}
        stages=[];closures=[];preservation=[]
        for row in original['stage_jobs']:
            stage_ref={'path':row['stage_json'],'sha256':row['stage_sha256']};old=p.checked(stage_ref)
            complete_final=old['required_artifacts']==transport.FINAL_PATHS
            pin,data=runtime.integration(complete_final)
            job=mapping[row['job_id']];run=root/job;ws=run/'workspace';ws.mkdir(parents=True,exist_ok=False);(ws/'out').mkdir()
            inherited=ws/'TASK.inherited.md';p.clone_bytes(old['prompt_file'],inherited,old['prompt_sha256'],old['workspace'])
            task=ws/'TASK.md';suffix=b'\n\n'+Path(fresh.OVERLAY['path']).read_bytes()
            if complete_final:suffix+=transport.addendum(job).encode()
            task.write_bytes(inherited.read_bytes()+suffix);inputs={}
            for path,digest in old['input_pins'].items():
                relative=Path(path).relative_to(old['workspace'])
                if relative.parent!=Path('inputs') or relative.name not in {'brief.md','delivery_objective.md','output_contract.md'}:
                    raise ValueError('Locked fresh confirmation contains unexpected prior role/source/evaluator input')
                target=ws/relative;p.clone_bytes(path,target,digest,old['workspace']);inputs[str(target)]=digest
            for name,path in [('source_access.json',p.LAB/'cases/source_access.json'),('source_separation.md',Path(fresh.OVERLAY['path']))]:
                target=ws/'inputs'/name;shutil.copyfile(path,target);inputs[str(target)]=p.sha(path)
            new=copy.deepcopy(old)
            new.update(job_id=job,pair_id=pair,workspace=str(ws),prompt_file=str(task),prompt_sha256=p.sha(task),
                       out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),input_pins=inputs,
                       source_stage_ref=stage_ref,declared_native_source_pin=pin,declared_native_runner=data['worker_path'],
                       native_source_binding_status='READY_GLM_COHERENT_V2',required_resource_contract=data['contract'],
                       glm_resource=copy.deepcopy(data['stage_glm_resource']),source_separation_overlay=fresh.OVERLAY,
                       full_pipeline_linking_rules=rule_ref,complete_final_owner_role=complete_final,
                       required_common_resource_binding=common_ref)
            new['glm_resource'].update(capture_dir=str(run/'public_captures'),evidence_dir=str(run/'tool-evidence'),
                         execution_enabled=row['execution_enabled'],public_get=row['public_get'])
            if complete_final:new.update(required_delivery_role_manifest='inputs/delivery_role_manifest.json',
                  dynamic_role_manifest_binding_required=True,bundle_profile_binding_required=True,
                  bundle_profile_role='final_author' if old['stage']=='revision' else old['stage'])
            p.put(run/'prepared-stage.json',new)
            selected=copy.deepcopy(row)
            selected.update(job_id=job,stage_json=str(run/'prepared-stage.json'),stage_sha256=p.sha(run/'prepared-stage.json'),
                   expected_freeze=new['freeze_out'],source_job_id=row['job_id'],resource_definition=data['row_resource_definition'],
                   prerequisite_job_ids=[mapping[x] for x in row['prerequisite_job_ids']],
                   all_same_arm_prior_job_ids=[mapping[x] for x in row['all_same_arm_prior_job_ids']],
                   status='PREPARED_NOT_ADMITTED' if not row['prerequisite_job_ids'] else 'AWAITING_ACTUAL_SAME_ARM_PREDECESSORS')
            stages.append(selected)
            closures.append({'job_id':job,'arm':row['arm'],'stage':row['stage'],'max_seconds':row['max_seconds'],
                  'max_responses':row['max_responses'],'required_artifacts':old['required_artifacts'],
                  'execution_enabled':row['execution_enabled'],'public_get':row['public_get'],
                  'native_source_pin':pin,'runtime_source_pins':p.checked(pin)['runtime_source_pins'],
                  'tool_source_pin':fresh.TOOLS14 if complete_final else p.checked(pin)['tools_source_pins'],
                  'task_ref':p.ref(task),'role_linking_rule_ref':rule_ref,'bundle_role':complete_final})
            preservation.append({'job_id':job,'source_stage_ref':stage_ref,'source_task_ref':{'path':old['prompt_file'],'sha256':old['prompt_sha256']},
                    'source_inputs':old['input_pins'],'old_role_fields':{k:old.get(k) for k in p.INVARIANTS}})
        closure={'schema':'er9.both-arm-full-pipeline-closure.v1','pair_id':pair,'recipe_lock_ref':lock,
                 'source_registration_ref':source_ref,'stages':closures,'source_separation_overlay':fresh.OVERLAY,
                 'actual_runtime_closure_complete':True,'before_either_first_research_required':True,
                 'candidate_hashes_fabricated_before_existence':False,'role_linking_rule_ref':rule_ref,
                 'new_development_warm_role_credit':False,'recipe_task_criteria_semantic_changes':False,'native_starts':0}
        p.put(root/'PIPELINE_CLOSURE.json',closure)
        p.put(root/'PRESERVATION.json',{'schema':'er9.locked-confirmation-prospective-preservation.v1','stages':preservation,'recipe_lock_ref':lock})
        card.update(pair_id=pair,source_pair_id=original['pair_id'],resource_version='coherent-v2-full-pipeline-plus-DEC010-transport',
                    pipeline_closure=p.ref(root/'PIPELINE_CLOSURE.json'),required_resource_binding=common_ref)
        p.put(root/'card.json',card)
        request=copy.deepcopy(original)
        request.update(request_id=pair+'-r001',pair_id=pair,card_path=str(root/'card.json'),card_sha256=p.sha(root/'card.json'),
              stage_jobs=stages,source_registration_ref=source_ref,pipeline_closure=p.ref(root/'PIPELINE_CLOSURE.json'),
              resource_binding=common_ref,
              source_separation_overlay=fresh.OVERLAY,root_scope_required=False,root_or_max_go_required=False,
              supersedes_pending_stage_job_ids=list(mapping),
              dispatch_selection_rule='Verify old source jobs native0 and register this one full paired lineage; never duplicate the locked confirmation',
              additional_admission_gate='Ordinary exact dependency/resource gates only; no all12, source PASS, evaluator or Root/Max Go gate',
              preservation_ref=p.ref(root/'PRESERVATION.json'),native_starts=0)
        p.put(root/'registration.json',request);requests.append(p.ref(root/'registration.json'))
    if len(requests)!=4:raise ValueError('Exact fixed four confirmations required')
    p.put(destination/'OUTBOX.json',{'schema':'er9.locked-confirmation-full-closure-outbox.v1','requests':requests,
          'pair_count':4,'arm_count':8,'native_stage_count':22,'recipe_lock_ref':lock,'source_separation_overlay':fresh.OVERLAY,
          'all_actual_both_arm_full_closures_before_first_research':True,'new_development_warm_outputs_substituted':False,
          'automatic_confirmation_repeat':False,'new_all12_PASS_Go_gate':False,'native_starts':0})
    print(json.dumps(p.ref(destination/'OUTBOX.json')))

if __name__=='__main__':prepare()

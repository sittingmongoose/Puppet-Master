#!/usr/bin/env python3
"""Engineering-only whole paired clock versions; no ops job mutations."""
import copy
import importlib.util
import json
from pathlib import Path
import blueprint as b

p=b.p;ROOT=b.ROOT
ELIGIBILITY={'path':str(p.LAB/'ops/dispatcher/WHOLLY_UNSTARTED_SELECTED_PAIR_METADATA_003.json'),
             'sha256':'272d24ab6f85471f599163b7f035632dfc294c183ed466492b8d7416b0027ebd'}
TOOLS={'path':str(p.LAB/'dev/tools/versions/v1.5-clock-telemetry/SOURCE_PINS.json'),
       'sha256':'abe26402b0156639e4c0a207e5a030db012c5f2d4b5af5d507a95f00eadeb748'}
ENGINE_ROOT=p.LAB/'dev/execution/glm-resource-v1/versions'
CORE={'path':str(ENGINE_ROOT/'v1.3-clock-telemetry/PIN.json'),'sha256':'2c3f23cc9b29ad4c1b49218be34c60de53fce84fe253d2a9e326c76a07c74c57'}
BUNDLE={'path':str(ENGINE_ROOT/'v1.3-bundle-clock-telemetry/PIN.json'),'sha256':'57a8470b12a85f9d252f6670fc2a06395c5637d5e968dce8d2acee2f5eea324b'}
INTEGRATIONS=[{'path':str(Path(CORE['path']).parent/'INTEGRATION_OUTBOX.json'),'sha256':'b9535522b5d7c3a557412add18d8c08b90bf90e0d616fb90d38d01021601f084'},
              {'path':str(Path(BUNDLE['path']).parent/'INTEGRATION_OUTBOX.json'),'sha256':'58ec7ffc791ff345155b5fdeca0ee14eb20afc0dc8ff2bdb33dd0a4143d92b49'}]
MARKERS=[{'path':str(p.LAB/'ops/dispatcher/GLM_CLOCK_V3_READY.json'),'sha256':'82157cb323cf55563794b27150f8e51a3d138fa13f9774bb307f86e08d57a1b8'},
         {'path':str(p.LAB/'ops/dispatcher/GLM_BUNDLE_CLOCK_V3_READY.json'),'sha256':'bb4c9a62092efaee7576cf778cf97edb3dd7f5912046e4080a10df1d878fbd99'}]

def source_choice(bundle):
    i=int(bundle);ref=BUNDLE if bundle else CORE
    native=p.checked(ref);integration=p.checked(INTEGRATIONS[i]);marker=p.checked(MARKERS[i])
    if native['status']!='READY_ZERO_INFERENCE' or integration['engine_pin']!=ref or marker['resource_source_pin']!=ref:
        raise ValueError('Actual positive engine/integration/ops source closure mismatch')
    if native['tools_source_pins']!=TOOLS or marker['source_pins']!=native['runtime_source_pins']:
        raise ValueError('Actual1.5 tool/runtime byte closure missing')
    constructor=integration['task_constructor']['source']
    if constructor!=native['task_fragment_constructor'] or p.sha(constructor['path'])!=constructor['sha256']:
        raise ValueError('Exact common clock Task constructor mismatch')
    spec=importlib.util.spec_from_file_location('actual_clock_task_fragment_'+str(i),constructor['path'])
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return ref,native,integration,marker,module

def identity_suffix(job):
    return (f'\n\n## Prospective transport identity for this runtime version\n'
        f'The current stage_id for the one explicitly native-adopted final bundle is {job}. '
        'This replaces only the earlier inherited transport stage_id label; all original scientific content roles, '
        'method duties, checking/repair functions, source access and budget remain authoritative. '
        'The actual configured GLM writer is mcp__pm_boundary__write_file with path and text arguments; '
        'logical write_text metadata is not an additional tool. Read the current inputs/delivery_role_manifest.json '
        'for exact admitted reference IDs. No observed writer dispatch or native Goal is preclaimed.\n').encode()

def prepare():
    eligibility=p.checked(ELIGIBILITY);p.checked(TOOLS);baseline=p.checked(b.REQUEST)
    baseline_ids={r['pair_id'] for r in baseline['pairs']};source_choice(False);source_choice(True)
    requests=[];supersessions=[];excluded=[]
    for pair in eligibility['pairs']:
        if pair['pair_id'] not in baseline_ids:raise ValueError('New comparison or quality-selected cohort not authorized')
        if pair['native_starts'] or pair['launch_intents']:
            excluded.append({'pair_id':pair['pair_id'],'native_starts':pair['native_starts'],'launch_intents':pair['launch_intents']})
            continue
        owner,old_closure=b.validate_eligible(pair)
        newpair=pair['pair_id']+'-CLOCK-R001';root=ROOT/'versions'/newpair
        mapping={row['job_id']:row['job_id']+'-CLOCK-R001' for row in pair['jobs']}
        common={'schema':'er9.paired-common-clock-source-closure.v1','core_pin':CORE,'bundle_pin':BUNDLE,
                'tool_source_pin':TOOLS,'ops_markers':MARKERS,'private_memory_max_bytes':2304*1024**2,
                'swap_max_bytes':0,'outer_worker_memory_max_bytes':768*1024**2,'host_reserve_bytes':3*1024**3,
                'all_active_retained_G_L_growth_gate_retained':True,'fit':'UNKNOWN',
                'behavioral_intervention':'Explicit common original-action clock awareness; separately versioned/unpooled with old transport claims',
                'actual_admission_or_deployment_authorized':False}
        p.put(root/'COMMON_RUNTIME_CLOSURE.json',common)
        card=p.checked({'path':owner['card_path'],'sha256':owner['card_sha256']});newcard=copy.deepcopy(card)
        newcard.update(pair_id=newpair,source_pair_id=pair['pair_id'],clock_behavior_version='er9.common-original-action-clock-awareness.v1',
                       declared_runtime_closure=p.ref(root/'COMMON_RUNTIME_CLOSURE.json'))
        p.put(root/'card.json',newcard)
        owner_rows={r['job_id']:r for r in owner['stage_jobs']};rows=[];closure=[]
        for row in pair['jobs']:
            old=p.checked(row['prepared_stage_ref']);job=mapping[row['job_id']]
            bundle=bool(old['complete_final_owner_role']);ref,native,integration,marker,fragment_module=source_choice(bundle)
            run=root/job;ws=run/'workspace';ws.mkdir(parents=True,exist_ok=False);(ws/'out').mkdir()
            inherited=ws/'TASK.inherited.md';p.clone_bytes(old['prompt_file'],inherited,old['prompt_sha256'],old['workspace'])
            fragment=run/'clock_fragment.md';fragment.write_bytes(fragment_module.render(old['max_seconds']))
            transition=identity_suffix(job) if bundle else b''
            task=ws/'TASK.md';task.write_bytes(inherited.read_bytes()+transition+fragment.read_bytes())
            inputs={}
            for path,digest in old['input_pins'].items():
                rel=Path(path).relative_to(old['workspace'])
                if rel==Path('inputs/STAGE_CLOCK.json'):raise ValueError('No invented or inherited current-stage clock input')
                target=ws/rel;p.clone_bytes(path,target,digest,old['workspace']);inputs[str(target)]=digest
            selected=copy.deepcopy(old)
            selected.update(job_id=job,pair_id=newpair,workspace=str(ws),prompt_file=str(task),prompt_sha256=p.sha(task),
                    out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),input_pins=inputs,
                    source_stage_ref=row['prepared_stage_ref'],source_task_prefix_ref={'path':old['prompt_file'],'sha256':old['prompt_sha256']},
                    source_task_prefix_bytes=Path(old['prompt_file']).stat().st_size,
                    declared_native_source_pin=ref,declared_native_runner=integration['worker_path'],declared_tool_source_pin=TOOLS,
                    required_resource_contract=marker['resource_definition']['resource_contract'],
                    required_common_resource_binding=p.ref(root/'COMMON_RUNTIME_CLOSURE.json'),
                    glm_resource=copy.deepcopy(integration['glm_resource_template']),
                    native_source_binding_status='READY_CLOCK_V3_ENGINEERING_NOT_SELECTED',
                    clock_behavior_version='er9.common-original-action-clock-awareness.v1',
                    reserved_dynamic_clock_input='inputs/STAGE_CLOCK.json',
                    actual_future_clock_input_sha256=None,original_op_admission_birth_not_reset=True)
            selected['glm_resource'].update(source_pins=native['runtime_source_pins'],capture_dir=str(run/'public_captures'),
                 evidence_dir=str(run/'tool-evidence'),execution_enabled=owner_rows[row['job_id']]['execution_enabled'],
                 public_get=owner_rows[row['job_id']]['public_get'],clock_fragment=p.ref(fragment),bundle_profile=None)
            if bundle:
                selected.update(bundle_profile_binding_required=True,dynamic_role_manifest_binding_required=True,
                    future_actor_metadata={'logical_writer_kind':'write_text','configured_native_tool':'mcp__pm_boundary__write_file',
                       'observed_native_tool':'UNOBSERVED; actual dispatch only','native_goal_id':None})
            else:
                selected.pop('bundle_profile_binding_required',None);selected.pop('dynamic_role_manifest_binding_required',None)
            fragment_module.validate_packet(selected)
            p.put(run/'prepared-stage.json',selected)
            original_row=owner_rows[row['job_id']];newrow=copy.deepcopy(original_row)
            newrow.update(job_id=job,stage_json=str(run/'prepared-stage.json'),stage_sha256=p.sha(run/'prepared-stage.json'),
                    expected_freeze=selected['freeze_out'],source_job_id=row['job_id'],resource_definition=marker['resource_definition'],
                    prerequisite_job_ids=[mapping[x] for x in original_row['prerequisite_job_ids']],
                    all_same_arm_prior_job_ids=[mapping[x] for x in original_row['all_same_arm_prior_job_ids']],
                    status='ENGINEERING_ONLY_NOT_REGISTERED',clock_fragment=p.ref(fragment),runtime_ref=MARKERS[int(bundle)])
            rows.append(newrow)
            closure.append({'job_id':job,'old_selected_job_id':row['job_id'],'arm':row['arm'],'stage':row['stage'],
                'native_source_pin':ref,'runtime_source_pins':native['runtime_source_pins'],'tool_source_pin':TOOLS,
                'ops_source_marker':MARKERS[int(bundle)],'clock_Task_constructor':integration['task_constructor']['source'],
                'clock_fragment':p.ref(fragment),'actual_static_Task_ref':p.ref(task),'scientific_prefix_ref':selected['source_task_prefix_ref'],
                'semantic_input_pins':inputs,'stage_caps_and_roles':{k:old.get(k) for k in p.INVARIANTS},
                'execution_enabled':newrow['execution_enabled'],'public_get':newrow['public_get'],
                'bundle_profile_actual_hash_before_role_birth':None,
                'actual_clock_receipt_profile_config_input_hashes_before_native_Goal_required':True})
            supersessions.append({'logical_source_slot':owner['source_slot'],'old_selected_job_id':row['job_id'],
                                  'prospective_selected_job_id':job,'old_native_starts_at_recheck':0,
                                  'new_native_jobs_admitted':0,'additional_logical_native_jobs':0})
        full={'schema':'er9.both-arm-full-clock-pipeline-closure.v1','pair_id':newpair,'source_pair_id':pair['pair_id'],
             'source_policy_ref':owner['policy_ref'],'source_original_pipeline_closure_ref':pair['whole_pipeline_closure'],
             'source_current_eligibility_ref':ELIGIBILITY,'source_cutoff_utc':eligibility['observed_utc'],
             'source_card_ref':{'path':owner['card_path'],'sha256':owner['card_sha256']},'all_roles':closure,
             'complete_both_arm_source_engine_tool_constructor_static_Task_closure':True,
             'source_scientific_recipe_and_negative_constraints_unchanged':True,
             'explicit_common_behavioral_intervention':True,'invisible_causal_neutrality_guarantee':False,
             'candidate_output_or_actual_future_clock_hashes_fabricated':False,'actual_deployment_or_native_admission':False}
        p.put(root/'PIPELINE_CLOSURE.json',full)
        registration=copy.deepcopy(owner)
        registration.update(request_id=newpair+'-engineering-r001',pair_id=newpair,card_path=str(root/'card.json'),card_sha256=p.sha(root/'card.json'),
                stage_jobs=rows,pipeline_closure=p.ref(root/'PIPELINE_CLOSURE.json'),source_registration_ref=row['owner_registration_ref'],
                supersedes_pending_stage_job_ids=list(mapping),prospective_new_selected_job_ids=list(mapping.values()),
                clock_behavior_version='er9.common-original-action-clock-awareness.v1',
                status='ENGINEERING_ONLY_NOT_REGISTERED',root_scope_required=False,root_or_max_go_required=False,
                actual_ops_registry_mutation_or_deployment_authorized=False,
                actual_adoption_requires_full_proof_ordinary_Root_contract_review=True,
                runtime_binding_required=True,native_starts=0)
        p.put(root/'registration.json',registration);requests.append(p.ref(root/'registration.json'))
    p.put(ROOT/'OUTBOX.json',{'schema':'er9.clock-engineering-prospective-version-outbox.v1',
         'prospective_requests':requests,'pair_count':len(requests),'prospective_native_stage_descriptors':len(supersessions),
         'old_to_new_selected_role_version_ids':supersessions,'eligibility_source_ref':ELIGIBILITY,
         'source_cutoff_utc':eligibility['observed_utc'],'ops_expected_markers':MARKERS,'core_pin':CORE,'bundle_pin':BUNDLE,'tools_source_pin':TOOLS,
         'actual_deployment_or_native_admission_authorized':False,'actual_ops_registry_mutations':0,'additional_native_jobs':0,
         'excluded_entire_entered_pairs':excluded,
         'current_old_usable_queue_continues':True,'current_zeroGoal_noIntent_recheck_before_any_later_selection_required':True,
         'ordinary_Root_contract_review_required_before_actual_adoption':True,'user_or_quality_Go_required':False,
         'source_owner_model_calls':0,'source_owner_native_Goal_calls':0})
    print(json.dumps(p.ref(ROOT/'OUTBOX.json')))

if __name__=='__main__':prepare()

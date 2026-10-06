"""Bounded confirmation feasibility from exact administrative fields and hashes."""
from collections import Counter
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
LAB=HERE.parents[4]
TASK_START='2026-10-06T05:16:48+00:00'
TERMINAL={'COMPLETED','FAILED','BLOCKED_PREDECESSOR_FAILED','BLOCKED_REPAIR_PREDECESSOR','SUPERSEDED_BEFORE_NATIVE',
    'CANCELLED','UNCERTAIN_TERMINAL_NO_FREEZE','UNCERTAIN_LAUNCH_FAILURE'}
COMMON_INPUT_NAMES={'brief.md','delivery_objective.md','output_contract.md','source_access.json','source_separation.md'}

def now():return datetime.now(timezone.utc).isoformat()
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def ref(path):return {'path':str(Path(path).absolute()),'sha256':sha(path)}
def check(value):
    path=Path(value['path']);assert sha(path)==value['sha256'],str(path)
    return path
def save(name,value):
    with (HERE/name).open('x') as file:json.dump(value,file,indent=2);file.write('\n')
def module(path):
    spec=importlib.util.spec_from_file_location('confirmation_saved_goal_status',path)
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result);return result

def main():
    decision=LAB/'supervision/DECISIONS-014-CONFIRMATION-CLOCK-FRESH.json'
    assert sha(decision)=='7157f09e6004d0f65d9d6ff8fbc82e141d169eb105432ab89a4bb7705ff93834'
    old=LAB/'dev/diagnostic-runner/resource-successors-001/confirmation-full-closure002'
    outbox=old/'OUTBOX.json';assert sha(outbox)=='a4b2c1a82dcbda46def1cac647eaa396f2e95391046fdede4e9eca691770f172'
    box=json.loads(outbox.read_text());check(box['recipe_lock_ref'])
    workload_path=LAB/'consolidation/workload-003/WORKLOAD_SCOREBOARD.json'
    workload=json.loads(workload_path.read_text());workload_selector=LAB/'consolidation/workload-003/PUBLICATION_SELECTOR.json'
    workload_selector_value=json.loads(workload_selector.read_text())
    for row in workload_selector_value['files']:check(row)
    # One bounded registry read. Save a whitelist projection, never raw queue.
    registry_path=LAB/'state/jobs.json';registry_raw=registry_path.read_bytes();registry_sha=hashlib.sha256(registry_raw).hexdigest()
    registry_observed=now();value=json.loads(registry_raw);rows=value.get('jobs',value)
    rows=list(rows.values()) if isinstance(rows,dict) else rows
    pair_ids={f'C-{i:02}-RESOURCE-R002-BUNDLE' for i in range(1,5)}
    selected=[row for row in rows if row.get('pair_id') in pair_ids]
    assert len(selected)==22
    indexed={row['job_id']:row for row in selected}
    exporter_path=LAB/'dev/execution/status-projection/export.py';exporter=module(exporter_path)
    pairs=[];role_states=[];direct_goals=[];source_pins={};input_hashes=[]
    for registration_ref in box['requests']:
        registration_path=check(registration_ref);registration=json.loads(registration_path.read_text())
        original_card_ref=registration['source_scientific_card_refs'][0];card_path=check(original_card_ref);card=json.loads(card_path.read_text())
        current_card_path=Path(registration['card_path']);assert sha(current_card_path)==registration['card_sha256']
        closure_path=check(registration['pipeline_closure']);closure=json.loads(closure_path.read_text())
        check(registration['immutable_pair_input_freeze']);check(registration['preservation_ref'])
        assert registration['family']=='Z' and registration['requested_model']=='GLM 5.3 Flash' and registration['requested_effort']=='max'
        assert card['candidate_family']=='GLM' and card['requested_effort']=='max'
        assert card['source_answers_or_prior_development_in_inputs'] is False
        assert card['execute_all_four_after_early_FAILURE'] is True and card['whole_case_or_all_diagnostic_PASS_required'] is False
        schedule=[];perarm=Counter();first_inputs=[]
        locked_input_refs={}
        for field in ('brief_path','coverage_path','source_access_path','common_criteria_path','common_output_contract'):
            path=Path(card[field]);path=path if path.is_absolute() else LAB/'cases'/path
            locked_input_refs[field]=ref(path)  # Hash only; no scientific body decoding.
        closure_roles={row['job_id']:row for row in closure['stages']}
        for descriptor in registration['stage_jobs']:
            job=descriptor['job_id'];row=indexed[job];stage_path=Path(row['stage_json'])
            assert sha(stage_path)==row['stage_sha256']
            stage=json.loads(stage_path.read_text());bound=stage['glm_resource'];pins=bound['source_pins']
            for path,digest in pins.items():source_pins[path]=digest
            assert stage['job_id']==job and bound['model']=='builtin:zai-coding-plan/GLM-5.3-Flash' and bound['effort']=='max'
            assert row['family']=='Z' and stage['max_seconds']==descriptor['max_seconds']==row['max_seconds']
            assert stage['max_responses']==descriptor['max_responses']==row['max_responses']
            assert bound['execution_enabled']==descriptor['execution_enabled'] and bound['public_get']==descriptor['public_get']
            schedule.append({k:descriptor[k] for k in ('job_id','arm','stage','stage_index','max_seconds','max_responses','execution_enabled','public_get','pipeline_final')})
            perarm[descriptor['arm']]+=descriptor['max_seconds']
            state={k:row[k] for k in ('job_id','pair_id','arm','stage','stage_index','family','max_seconds','max_responses','status','native_goal_starts','start_utc','ended_utc','permit_release_confirmed') if k in row}
            state.update(registry_source={'path':str(registry_path),'sha256':registry_sha,'observed_utc':registry_observed},
                stage_ref=ref(stage_path),source_choice=bound['version'],tools_builder=bound['tools_config_builder'],
                task_ref={'path':stage['prompt_file'],'sha256':stage['prompt_sha256']},
                task_hash_birth={'source':ref(closure_path),'before_either_first_research_required':closure['before_either_first_research_required'],
                    'definition':'Frozen prospective Task/reference in owner full closure. Actual physical Task creation UTC is not independently exposed.'},
                registry_terminal=row['status'] in TERMINAL,native_goal_status='UNKNOWN')
            assert sha(stage['prompt_file'])==stage['prompt_sha256']
            assert closure_roles[job]['task_ref']['sha256']==stage['prompt_sha256']
            if descriptor['stage']=='research':
                assert descriptor['stage_index']==0 and descriptor['prerequisite_job_ids']==[] and descriptor['all_same_arm_prior_job_ids']==[]
                metadata=[]
                assert {Path(path).name for path in stage['input_pins']}==COMMON_INPUT_NAMES
                for path,digest in stage['input_pins'].items():
                    assert sha(path)==digest
                    metadata.append({'relative_path':Path(path).relative_to(Path(stage['workspace'])/'inputs').as_posix(),'sha256':digest})
                expected={'brief.md':locked_input_refs['brief_path']['sha256'],
                    'output_contract.md':locked_input_refs['common_output_contract']['sha256'],
                    'source_access.json':locked_input_refs['source_access_path']['sha256']}
                assert all(next(m['sha256'] for m in metadata if m['relative_path']==name)==digest for name,digest in expected.items())
                first_inputs.append({'job_id':job,'arm':descriptor['arm'],'inputs':metadata,'no_prior_role_imports':True,
                    'scientific_body_read':False,'candidate_or_evaluator_body_read':False})
                input_hashes.append({m['relative_path']:m['sha256'] for m in metadata})
            native=stage_path.parent/'native';freeze_path=stage_path.parent/'OUTPUT_FREEZE.json'
            if row.get('native_goal_starts') and row['status'] in TERMINAL:
                assert freeze_path.is_file()
                freeze=json.loads(freeze_path.read_text());native_receipt_path=check(freeze['native_receipt']);receipt=json.loads(native_receipt_path.read_text())
                assert receipt['job_id']==job
                state.update(freeze_ref=ref(freeze_path),operational_complete=freeze['operational_complete'],
                    router_terminal_status=receipt['status'],native_quiescent=freeze['native_quiescent'],
                    resource_components_quiet=receipt['resource_components_quiet'],resource_oom_observed=receipt['resource_oom_observed'],
                    whole_role_elapsed_seconds=freeze['elapsed_seconds'],raw_prompt_sha256=receipt['raw_prompt_sha256'],normalized_goal_objective_sha256=receipt['prompt_sha256'],
                    native_receipt_ref=ref(native_receipt_path))
                activation_path=native/'activation.json';activation=json.loads(activation_path.read_text())
                target=(activation.get('snapshot',{}).get('session') or {}).get('target') or {}
                assert activation.get('startedTurn') is True and target.get('status')=='active'
                assert target['targetId']==receipt['goal_target_id'] and target['sessionId']==receipt['session_id']
                state['actual_native_goal_birth']={'source':ref(activation_path),'startedTurn':True,'session_id':receipt['session_id'],
                    'goal_id':target['targetId'],'native_target_created_at_epoch_ms':target.get('createdAt'),
                    'native_record_created_time_definition':'Saved native Goal record creation time, not physical inference/process start UTC',
                    'controller_activation_receipt_utc':receipt['activation_utc'],'physical_native_start_utc':'UNEXPOSED'}
                projected=exporter.project(row,native_receipt_path);direct_goals.append(projected);state['native_goal_status']=projected['native_goal_status']
                binding_path=stage_path.parent/'RESOURCE_BINDING.json';binding=json.loads(binding_path.read_text())
                state['original_clock']={'source':ref(binding_path),**{key:binding[key] for key in ('original_birth_monotonic_ns','native_stop_monotonic_ns','guard_stop_monotonic_ns','original_total_stop_monotonic_ns')}}
                release_path=stage_path.parent/'PRIVATE_SLICE_RELEASE.json';release=json.loads(release_path.read_text())
                state['saved_owned_quiet']={'source':ref(release_path),'all_private_slice_descendants_quiet':release['all_private_slice_descendants_quiet']}
            else:
                state['operational_complete']=False if row['status'] in TERMINAL else 'UNKNOWN'
                state['native_goal_birth']='NOT_EXPOSED: registry reports no native entry; not a global absence proof'
                state['saved_owned_quiet']='NOT_APPLICABLE_TO_NEVER_STARTED_REGISTERED_ROLE' if row['status'] in TERMINAL else 'NOT_YET_TERMINAL_QUIET'
            role_states.append(state)
        assert perarm=={'control':2700,'treatment':2700}
        assert first_inputs[0]['inputs']==first_inputs[1]['inputs']
        pairs.append({'original_slot':card['pair_id'],'original_locked_card':original_card_ref,'old_selected_pair_id':registration['pair_id'],
            'method_id':card['method_id'],'holdout_case_id':card['case_id'],'candidate_family':'GLM','model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max',
            'locked_method_ref':box['recipe_lock_ref'],'registration_ref':registration_ref,'full_old_closure_ref':ref(closure_path),
            'locked_input_refs':locked_input_refs,'method_factors':card['exact_locked_bundle'],
            'combined_critic_final_treatment':card['method_id']=='CONFIRM-B','schedule':schedule,'per_arm_native_seconds':dict(perarm),
            'first_research_input_hashes':first_inputs,'quality_or_early_PASS_gate':False,
            'original_mislabeled_occupied_per_arm_metadata':card['allocation']['occupied_candidate_seconds_per_arm'],
            'allocation_rule':'Exact per-stage sum2700 per arm/5400 both arms, per DEC014; preserve old5400 label bytes without extending allocation'})
    for path,digest in source_pins.items():assert sha(path)==digest
    # Shared common inputs are equal across all pairs; only brief differs by H1/H2.
    for name in COMMON_INPUT_NAMES-{'brief.md'}:assert len({row[name] for row in input_hashes})==1
    core=LAB/'dev/execution/glm-resource-v1/versions/v1.3-clock-telemetry'
    bundle=LAB/'dev/execution/glm-resource-v1/versions/v1.3-bundle-clock-telemetry'
    patterns={'seven_pair46_role_clock_builder':ref(LAB/'dev/diagnostic-runner/resource-successors-001/clock-telemetry-001/PIN.json'),
        'seven_pair_clock_constructor':ref(LAB/'dev/diagnostic-runner/resource-successors-001/clock-telemetry-001/prepare_versions.py'),
        'DEC012_clean_firstR22_policy':ref(LAB/'supervision/DECISIONS-012-LUNA-CLOCK-FRESH.json'),
        'DEC012_clean_firstR22_source':ref(LAB/'dev/diagnostic-runner/resource-successors-001/luna-clock-fresh-retest-001/SOURCE_PIN.json'),
        'DEC012_case_constructor':ref(LAB/'dev/diagnostic-runner/resource-successors-001/luna-clock-fresh-retest-001/prepare.py'),
        'DEC012_strict_new_role_linker':ref(LAB/'dev/diagnostic-runner/resource-successors-001/luna-clock-fresh-retest-001/role_birth.py'),
        'reuse_scope':'Mechanical closure/input hygiene patterns only. Never reuse L model/runtime or scored candidate/evaluator inputs.'}
    sources={'core_engine_pin':ref(core/'PIN.json'),'bundle_engine_pin':ref(bundle/'PIN.json'),
        'core_integration_outbox':ref(core/'INTEGRATION_OUTBOX.json'),'bundle_integration_outbox':ref(bundle/'INTEGRATION_OUTBOX.json'),
        'tool_source_pin':ref(LAB/'dev/tools/versions/v1.5-clock-telemetry/SOURCE_PINS.json'),
        'clock_fragment_constructor':ref(core/'task_fragment.py'),'production_verification':ref(core/'VERIFICATION.json'),
        'current_ops_core_ready':ref(LAB/'ops/dispatcher/GLM_CLOCK_V3_READY.json'),
        'current_ops_bundle_ready':ref(LAB/'ops/dispatcher/GLM_BUNDLE_CLOCK_V3_READY.json')}
    for kind in ('core_engine_pin','bundle_engine_pin'):
        pin=json.loads(Path(sources[kind]['path']).read_text())
        for path,digest in pin['runtime_source_pins'].items():assert sha(path)==digest
    nonterminal=[r['job_id'] for r in role_states if not r['registry_terminal']]
    born=[r for r in role_states if isinstance(r.get('actual_native_goal_birth'),dict)]
    born_quiet=all(r['native_quiescent'] is True and r['resource_components_quiet'] is True and r.get('permit_release_confirmed') is True and r['saved_owned_quiet']['all_private_slice_descendants_quiet'] is True for r in born)
    observed=now()
    result={'schema':'er9.locked-confirmation-clock-retest-feasibility.v1','task_start_utc':TASK_START,'created_utc':observed,
        'status':'READY_CONDITIONAL_ENGINEERING_FEASIBILITY_NOT_ADMISSION','policy':ref(decision),'old_full_source_outbox':ref(outbox),
        'workload003':{'source':ref(workload_path),'selector':ref(workload_selector),'checkpoint_utc':workload['checkpoint_utc'],
            'selected_C_summary':workload['summary']['C'],'separate_from_fresh_registry_observation':True},
        'registry_observation':{'path':str(registry_path),'sha256_at_read':registry_sha,'observed_utc':registry_observed,
            'single_bounded_read':True,'atomic_with_other_source_files':False,'selected_roles':22,'selected_old_pairs':4},
        'old_registry_status_counts':dict(Counter(r['status'] for r in role_states)),
        'old_nonterminal_stage_ids':nonterminal,'all_old22_terminal_now':not nonterminal,
        'all_observed_terminal_born_roles_owned_quiet':born_quiet,'positive_old_native_activations':len(born),
        'all_old22_terminal_owned_quiet_at_future_admission':'SOLE_OPS_MUST_RECHECK; this feasibility is not a live permit',
        'locked_pairs':pairs,'current_G1_5_actual_source_choices':sources,'mechanical_patterns':patterns,
        'planned_fixed_scope':{'locked_pairs':4,'further_pipelines':8,'new_native_roles':22,'allocated_seconds_per_arm':2700,
            'allocated_seconds_all8_arms':21600,'extra_target_or_hypothesis_credit':0,'quality_selected_subset':False,
            'automatic_further_cohort_repeat':False,'candidate_family':'GLM Flash/max genuine native Goals; max2 active across all stages'},
        'new_source_choice_plan':'Core clock v3 on R/ordinary critics; bundle clock v3 on final authors and MethodB combined critic_final. Exact both-arm all4 choices frozen before ANY first R; source model/factors/stage caps preserved.',
        'firstR_clean_source_rule':'Use only pristine original admitted five common input bytes and exact locked scientific Task prefix; add declared common neutral clock suffix and role-birth scalar STAGE_CLOCK file. Never import old candidate results/source captures/catalogs/critics/failed outputs, evaluator feedback, Sol answers, other-arm artifacts, development12/5/3 obligations or scored scientific inputs.',
        'later_role_rule':'Only newly authenticated current same-arm outputs under a fixed strict role linker, with genuine native Goal/source/clock receipts. Future artifact hashes are born and pinned under the already fixed rule, never invented before existence.',
        'scope_preservation':'H1/H2 brief/coverage and common criteria hashes exactly preserved; H2ten/common8 per DEC014. No body inspection, reinterpretation or supplemental development target-count instruction.',
        'required_owner_work':{'case_source_engineer':'case_resource_successors: new separately pinned all4/22-role constructor, full closure and scientific-prefix byte-preservation proof; do not mutate old descriptors or pretend old pairs had native0',
            'execution_engine':'Existing pinned G clock core/bundle runtime and constructor are READY. No new native/runtime patch is identified by this feasibility.',
            'ops':'Atomic all-old22 terminal/ownedquiet, all-new22 no start intent/native0, full BOTH ALL4 source choices, exact model/family/caps/source guard and original per-role clock/resource birth before Goal; sole admission',
            'source_or_quality_review':'Independent and not a first-stage PASS gate; no engineering answer or grade'},
        'known_version_difference':'Original pipeline selected core1.2/tools1.3 for research/critic and bundle1.2/tools1.4 for final, without this declared trusted original-action telemetry. New common1.5 is an explicit behavioral intervention. Scientific prefix budget visibility is unread/UNKNOWN; no proof that clock absence caused quality or delivery failure.',
        'original_costs_and_holds':'Preserved; finite retest costs additive. No discard, best-output fishing or retroactive pipeline completion.',
        'boundary_note':'Early filename/whole-workload-slot discovery exposed administrative inventories beyond the necessary whitelist. Preserved as a disclosure; no authored/scientific/evaluator bodies or answers were opened or used. The frozen output contains only selected administrative fields, locators and hashes.',
        'new_Goal_model_provider_or_account_calls':0,'candidate_eval_science_bodies_selected':0,'launch_import_patch_or_live_state_mutations':0,
        'no_wait_or_poll_for_old_completion':True}
    save('FEASIBILITY.json',result)
    save('OLD_ROLE_STATUS.safe.json',{'schema':'er9.confirmation-old-role-control-metadata.v1','created_utc':observed,
        'registry_observation':result['registry_observation'],'rows':role_states,
        'definitions':'Statuses and timing source types are separate. Blocked no-entry rows preserve operator declaration; no global absence inference. No artifact inventory/source facts/evaluator answer fields.'})
    save('OLD_DIRECT_NATIVE_GOAL_STATUS.json',{'schema':'er9.direct-native-goal-status.v1','created_utc':observed,'jobs':direct_goals,
        'scope':'Only exact terminal positive native receipt locators in selected old confirmation lineages; active/ready roles excluded. Router status/candidate quality not inferred.'})
    save('VERIFICATION.json',{'schema':'er9.confirmation-clock-feasibility-verification.v1','created_utc':observed,'status':'PASS_METADATA_ONLY',
        'pairs':4,'roles':22,'arms':8,'all_caps_and_original_model_binding_match':True,
        'all_firstR5input_pins_match_and_botharm_common_identity':True,'common4_nonbrief_inputs_same_across_all8_firstR':True,
        'per_arm2700_and_all8_21600':True,'old_source_pin_count':len(source_pins),'old_source_pins_match':True,
        'current_G_core_bundle_tool_closures_match':True,'positive_old_born_and_quiet_count':len(born),
        'native_status_exporter':ref(exporter_path),'all_old22_terminal_asserted':False if nonterminal else True,
        'zero_Goal_model_science_or_import_calls':True,'single_registry_read_no_live_poll':True})
    print(json.dumps({'status':result['status'],'old_nonterminal_stage_ids':nonterminal,'positive_old_born_count':len(born),
        'terminal_born_quiet':born_quiet,'pairs':4,'new_planned_roles':22,'allocated_seconds_per_arm':2700,'new_native_calls':0}))

if __name__=='__main__':main()

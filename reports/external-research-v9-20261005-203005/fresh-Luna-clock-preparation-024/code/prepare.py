#!/usr/bin/env python3
"""DEC012 whole four fresh Luna pairs, source-only finite repair compilation."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
import prepare_successors as p

ROOT=Path(__file__).resolve().parent
POLICY={'path':str(p.LAB/'supervision/DECISIONS-012-LUNA-CLOCK-FRESH.json'),'sha256':'666f0daee123eb96fb58f41a76d3b1a0584120c74f9de73a966a32ce4977ebf5'}
TERMINAL={'path':str(p.LAB/'ops/dispatcher/ORIGINAL_FRESH_LUNA_FOUR_TERMINAL_001.json'),'sha256':'767eb882b9f81073ed8420ff7aad4294ef43890de4ea63a6bd62e7ff4d09eff1'}
LUNA_ROOT=p.LAB/'dev/luna-route/versions/v1.5-clock-telemetry'
NATIVE={'path':str(LUNA_ROOT/'PIN.json'),'sha256':'f4e6a4eae72265211527ac86800ac489d38cc54775e0eaeddd3a73932bc38498'}
MARKER={'path':str(p.LAB/'ops/dispatcher/LUNA_V1_5_READY.json'),'sha256':'ee3abb06177c3d4f3955805fa370abe848062e86c47422e91dd33f3302ef74c1'}
TOOLS={'path':str(p.LAB/'dev/tools/versions/v1.5-clock-telemetry/SOURCE_PINS.json'),'sha256':'abe26402b0156639e4c0a207e5a030db012c5f2d4b5af5d507a95f00eadeb748'}
ALLOWED_INPUTS={'brief.md','output_contract.md','delivery_objective.md','source_access.json','source_separation.md'}
FINAL_PATHS=['out/final/'+name for name in ['proposal.md','sources.json','witnesses.json','leads.json']]

def module(name,path):
    spec=importlib.util.spec_from_file_location('luna_fresh_clock_'+name,path)
    value=importlib.util.module_from_spec(spec);spec.loader.exec_module(value);return value

def bundle_enabled(card,stage):
    return card['method_id']!='V06' and stage['required_artifacts']==FINAL_PATHS

def bundle_identity(job):
    return (f'\n\n## Prospective Luna final delivery identity\n'
         f'The current stage_id for the ONE explicitly native-adopted four-role bundle is {job}. '
         'This replaces only the inherited earlier transport stage_id label. All original scientific content, '
         'source duties, method functions, checking/repair duties and budget above remain authoritative. '
         'Use the actual admitted pm_boundary namespace tool write_file with path and text arguments. '
         'A logical write_text label is not an additional native tool. The unchanged bundle path is '
         'out/final_bundle.json; all four unchanged canonical final paths are committed together only by '
         'your explicit current native adoption. Read the current inputs/delivery_role_manifest.json for '
         'exact compatible reference IDs, when supplied. No absent-slot fallback, host-authored catalog, '
         'extra helper Goal or extra time is authorized. Optional review remains optional; a combined '
         'critic_final stage still performs genuine independent critique AND final authorship in one Goal.\n').encode()

def terminal_proof(data):
    if data.get('all_original_pairs_terminal') is not True or data.get('all_entered_stages_owned_quiet_and_permits_released') is not True:
        raise ValueError('Whole old cohort terminal/owned-quiet proof required')
    for row in data['rows']:
        if row['status'] not in {'COMPLETED','FAILED','BLOCKED_PREDECESSOR_FAILED'}:raise ValueError('Old role still nonterminal')
        if row['native_goal_starts'] and (row['actual_owned_quiet'] is not True or row['permit_release_confirmed'] is not True):
            raise ValueError('Entered old actor is not positively owned quiet/released')
    return True

def prepare():
    policy=p.checked(POLICY);old=p.checked(TERMINAL);terminal_proof(old);native=p.checked(NATIVE);marker=p.checked(MARKER);p.checked(TOOLS)
    if native['tools_source_pins_sha256']!=TOOLS['sha256'] or marker['clock_native_pin']!=NATIVE:
        raise ValueError('Actual native/tool/ops clock source join mismatch')
    declaration_ref={'path':str(LUNA_ROOT/native['clock_declaration_constructor']['path']),
                     'sha256':native['clock_declaration_constructor']['sha256']}
    if p.sha(declaration_ref['path'])!=declaration_ref['sha256']:raise ValueError('Declared actual clock constructor drift')
    declaration=module('declaration',declaration_ref['path'])
    source_owners={r['owner_registration']['path']:{'path':r['owner_registration']['path'],'sha256':r['owner_registration']['sha256']} for r in old['rows']}
    owners=[(ref,p.checked(ref)) for ref in source_owners.values()]
    if {r['source_slot'] for _,r in owners}!=set(policy['scope_slots']) or len(owners)!=4:raise ValueError('Whole exact four source slots, no subset selection')
    linking={'schema':'er9.strict-fresh-luna-clock-role-linking.v1','policy_ref':POLICY,
          'first_research':'Exact original brief/access/common-role inputs only; no previous candidate/catalog/critic/revision/failure/otherarm/evaluator body',
          'later_roles':'Only new samepair/samearm native outputs, full declared original DAG ancestor order; operational_complete=True/native_quiet=True/positiveGoal + allrequired nonempty roles',
          'captures':'All exact owned closed publiccaptures including errors; no grade/content/URLquality selection',
          'bundle_refs':'Pinned tools1.5 operator_binding/API; only actual newlynative same-arm compatible role refs. No unknown hashes/Goal IDs fabricated',
          'role_birth_constructor_ref':p.ref(LUNA_ROOT/'clock_prepare.py'),
          'declaration_constructor_ref':declaration_ref,
          'operator_binding_ref':p.ref(p.LAB/'dev/tools/versions/v1.5-clock-telemetry/operator_binding.py'),
          'api_schema_ref':p.ref(p.LAB/'dev/tools/versions/v1.5-clock-telemetry/API_SCHEMA.json'),
          'initial_input_policy':'Scientific firsttext unchanged, exact builder clock secondtext + inputs/STAGE_CLOCK.json beforeGoal; original objective unchanged',
          'old_goal_deadline_reset':False,'model_or_Goal_calls':0}
    p.put(ROOT/'ROLE_LINKING_RULES.json',linking);linking_ref=p.ref(ROOT/'ROLE_LINKING_RULES.json')
    refs=[];preservation=[]
    for source_ref,source in sorted(owners,key=lambda item:item[1]['source_slot']):
        if source['family']!='L' or source['requested_model']!='GPT-6 Luna' or source['requested_effort'].casefold()!='max':raise ValueError('Exact original Luna Max binding required')
        card_ref={'path':source['card_path'],'sha256':source['card_sha256']};card=p.checked(card_ref)
        pair=source['source_slot']+'-LUNA-CLOCK-FRESH-R001';root=ROOT/'pairs'/pair
        mapping={r['job_id']:r['job_id'].replace(source['pair_id'],pair) for r in source['stage_jobs']}
        newcard=copy.deepcopy(card);newcard.update(pair_id=pair,source_pair_id=source['pair_id'],
                card_version='DEC012-finite-full-fresh-clock-retest-r001',clock_behavior_version='explicit_common_original_action_clock_v1.5')
        p.put(root/'card.json',newcard);jobs=[];closures=[]
        for row in source['stage_jobs']:
            source_stage_ref={'path':row['stage_json'],'sha256':row['stage_sha256']};original=p.checked(source_stage_ref)
            job=mapping[row['job_id']];run=root/job;ws=run/'workspace';ws.mkdir(parents=True,exist_ok=False);(ws/'out').mkdir()
            inherited=ws/'TASK.inherited.md';p.clone_bytes(original['prompt_file'],inherited,original['prompt_sha256'],original['workspace'])
            use_B=bundle_enabled(card,original)
            task=ws/'TASK.md';task.write_bytes(inherited.read_bytes()+(bundle_identity(job) if use_B else b''))
            inputs={}
            for path,digest in original['input_pins'].items():
                rel=Path(path).relative_to(original['workspace'])
                if rel.parent!=Path('inputs') or rel.name not in ALLOWED_INPUTS:
                    raise ValueError('Old candidate/sourcecontext/assessment/failure body excluded from fullfresh template')
                target=ws/rel;p.clone_bytes(path,target,digest,original['workspace']);inputs[str(target)]=digest
            decl_path=run/'CLOCK_DECLARATION.json';p.put(decl_path,declaration.declaration(job))
            spec=copy.deepcopy(original)
            spec.update(job_id=job,pair_id=pair,workspace=str(ws),prompt_file=str(task),prompt_sha256=p.sha(task),
                 out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),input_pins=inputs,
                 source_stage_ref=source_stage_ref,source_scientific_Task_prefix_ref={'path':original['prompt_file'],'sha256':original['prompt_sha256']},
                 declared_native_source_pin=NATIVE,declared_native_runner=str(LUNA_ROOT/'dynamic_stage_runner.py'),
                 declared_tool_source_pin=TOOLS,required_resource_contract=marker['resource_definition'],
                 clock_declaration=p.ref(decl_path),runtime_binding_required=True,
                 full_pipeline_linking_rules=linking_ref,native_source_binding_status='READY_LUNA_CLOCK_FULL_FRESH_PENDING_OPS_BIRTH',
                 clock_behavior_version='explicit_common_original_action_clock_v1.5',
                 first_research_old_candidate_inputs=False,new_role_original_birth_preserved=True,
                 complete_final_owner_role=use_B,reserved_dynamic_clock_input='inputs/STAGE_CLOCK.json')
            if use_B:
                spec.update(bundle_profile_binding_required=True,dynamic_role_manifest_binding_required=True,
                    bundle_profile_role='final_author' if row['stage']=='revision' else row['stage'],
                    future_bundle_profile_ref=None,
                    actual_writer_binding={'namespace':'pm_boundary','tool':'write_file','arguments':['path','text'],
                                            'observed_native_writer':'UNOBSERVED before actual dispatch'})
            else:
                spec.pop('bundle_profile_binding_required',None);spec.pop('dynamic_role_manifest_binding_required',None)
                spec.pop('bundle_profile_role',None);spec.pop('required_delivery_role_manifest',None)
            p.put(run/'prepared-stage.json',spec)
            selected=copy.deepcopy(row)
            selected.update(job_id=job,stage_json=str(run/'prepared-stage.json'),stage_sha256=p.sha(run/'prepared-stage.json'),
                    expected_freeze=spec['freeze_out'],source_job_id=row['job_id'],runtime_ref=MARKER,
                    prerequisite_job_ids=[mapping[x] for x in row['prerequisite_job_ids']],
                    all_same_arm_prior_job_ids=[mapping[x] for x in row['all_same_arm_prior_job_ids']],
                    clock_declaration=p.ref(decl_path),status='PREPARED_NOT_ADMITTED' if not row['prerequisite_job_ids'] else 'AWAITING_NEW_AUTHENTIC_SAME_ARM_ROLES')
            jobs.append(selected)
            closures.append({'job_id':job,'arm':row['arm'],'stage':row['stage'],'max_seconds':row['max_seconds'],
                    'max_responses':row['max_responses'],'required_artifacts':original['required_artifacts'],
                    'execution_enabled':row['execution_enabled'],'public_get':row['public_get'],
                    'core_or_B':'B' if use_B else 'core','native_source_pin':NATIVE,'tool_source_pin':TOOLS,'ops_marker':MARKER,
                    'native_runner_ref':p.ref(LUNA_ROOT/'dynamic_stage_runner.py'),'native_prepare_constructor_ref':p.ref(LUNA_ROOT/'clock_prepare.py'),
                    'clock_declaration_constructor_ref':declaration_ref,'clock_declaration_ref':p.ref(decl_path),'Task_ref':p.ref(task),
                    'scientific_prefix_ref':spec['source_scientific_Task_prefix_ref'],'original_neutral_input_pins':inputs,
                    'strict_new_role_linking_ref':linking_ref,'actual_future_clock_profile_config_input_or_role_hashes':None})
            preservation.append({'new_job_id':job,'source_job_id':row['job_id'],'source_stage_ref':source_stage_ref,
                  'scientific_prefix_ref':spec['source_scientific_Task_prefix_ref'],'source_inputs':original['input_pins'],
                  'old_role_fields':{k:original.get(k) for k in p.INVARIANTS}})
        full={'schema':'er9.fullfresh-luna-clock-both-arm-closure.v1','pair_id':pair,'source_pair_id':source['pair_id'],
          'policy_ref':POLICY,'old_terminal_ownedquiet_ref':TERMINAL,'source_card_ref':card_ref,'all_roles':closures,
          'complete_actual_both_arm_all_role_source_choices_before_first_newResearch':True,
          'source_separation_overlay':source['source_separation_overlay'],'new_scientific_source_or_evaluator_facts':False,
          'fresh_input_exclusions_preserved':True,'new_additional_target_matched_comparison_credit':False,
          'explicit_common_behavior_stratum':'original_action_clock_v1.5 finite engineering retest; old lineages descriptive/fully charged',
          'dynamic_actual_hashes_fabricated':False,'source_owner_native_model_calls':0}
        p.put(root/'PIPELINE_CLOSURE.json',full)
        reg=copy.deepcopy(source)
        reg.update(request_id=pair+'-r001',pair_id=pair,source_pair_id=source['pair_id'],
              card_path=str(root/'card.json'),card_sha256=p.sha(root/'card.json'),stage_jobs=jobs,
              pipeline_closure=p.ref(root/'PIPELINE_CLOSURE.json'),policy_ref=POLICY,old_terminal_ownedquiet_ref=TERMINAL,
              source_registration_ref=source_ref,source_slot=source['source_slot'],track='FINITE_LUNA_CLOCK_FULL_FRESH_ENGINEERING_RETEST',
              native_source_binding_status='READY_LUNA_CLOCK_FULL_FRESH_PENDING_OPS_BIRTH',runtime_ref=MARKER,
              root_scope_required=False,root_or_max_go_required=False,routine_new_phase_approval_required=False,
              first_research_old_candidate_payloads=False,automatic_retry=False,cohort_id='DEC012-LUNA-CLOCK-FRESH-R001',
              native_starts=0,status='PREPARED_NOT_ADMITTED',source_scientific_grade_feedback_supplied=False,
              extra_logical_target_matched_credit=False,prior_lineages_costs_failures_grades_retained=True,
              immutable_pair_input_freeze=p.ref(root/'PIPELINE_CLOSURE.json'))
        p.put(root/'registration.json',reg);refs.append(p.ref(root/'registration.json'))
    p.put(ROOT/'PRESERVATION.json',{'schema':'er9.dec012-fullfresh-byte-preservation.v1','stages':preservation,
                        'no_old_alias_card_Task_packet_profile_or_cost_mutation':True})
    p.put(ROOT/'OUTBOX.json',{'schema':'er9.finite-luna-clock-fullfresh-retest-outbox.v1','requests':refs,'pair_count':4,'arm_count':8,
                'native_stage_count':sum(len(p.checked(r)['stage_jobs']) for r in refs),'policy_ref':POLICY,'old_terminal_ownedquiet_ref':TERMINAL,
                'native_source_pin':NATIVE,'tools_source_pin':TOOLS,'ops_runtime_marker':MARKER,
                'source_only_stage_byte_preservation_ref':p.ref(ROOT/'PRESERVATION.json'),
                'all_four_original_slots_retained':True,'quality_selected_repeat_or_automatic_all12':False,
                'extra_logical_target_matched_credit':False,'actual_native_Goal_or_model_calls':0,
                'deployment_owner':'ops only, fresh standalone native Codex threads/Goals; actual resource/capacity/positive-source gates'})
    print(json.dumps(p.ref(ROOT/'OUTBOX.json')))

if __name__=='__main__':prepare()

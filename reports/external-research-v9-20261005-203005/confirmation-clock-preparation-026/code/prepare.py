#!/usr/bin/env python3
"""DEC014 conditional all-four compilation. Interpret metadata; copy science opaquely.

No native, model, account, runtime process, evaluator or source-answer interface.
The original cohort is not asserted quiet: admission remains solely with ops.
"""
import copy
import importlib.util
import json
from pathlib import Path
import re
import sys
sys.dont_write_bytecode=True
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
import prepare_successors as p
ROOT=Path(__file__).resolve().parent
POLICY={'path':str(p.LAB/'supervision/DECISIONS-014-CONFIRMATION-CLOCK-FRESH.json'),'sha256':'7157f09e6004d0f65d9d6ff8fbc82e141d169eb105432ab89a4bb7705ff93834'}
FEASIBILITY={'path':str(p.LAB/'dev/execution/glm-resource-v1/diagnosis/confirmation-clock-eligibility-001/FEASIBILITY.json'),'sha256':'691ce88a81419fe0556a2ebbcc6bc82fa18699aee31deb79d8cc3ff45c731699'}
FEASIBILITY_PIN={'path':str(Path(FEASIBILITY['path']).parent/'PIN.json'),'sha256':'9d30f9e98d626365f8664110604455cb2c4fecc02fe7aac9ee7787d04e9fda39'}
FEASIBILITY_OUTBOX={'path':str(Path(FEASIBILITY['path']).parent/'OWNER_INTEGRATION_OUTBOX.json'),'sha256':'b2a100b7c12810a0c64623380bfe8b950bcfad1c905c47c0c35eeb0244f22702'}
PATTERN={'path':str(p.LAB/'dev/diagnostic-runner/resource-successors-001/clock-telemetry-001/prepare_versions.py'),'sha256':'8e12e2e6f02050172bf92711933c56510912cc3a345c5a88750dc7a063ebdf77'}
ALLOWED_INPUTS={'brief.md','output_contract.md','delivery_objective.md','source_access.json','source_separation.md'}
FINAL_PATHS=['out/final/'+n for n in ['proposal.md','sources.json','witnesses.json','leads.json']]

def module(name,path):
    spec=importlib.util.spec_from_file_location('confirmation_fresh_'+name,path)
    value=importlib.util.module_from_spec(spec);spec.loader.exec_module(value);return value

def runtime():
    if p.sha(PATTERN['path'])!=PATTERN['sha256']:raise ValueError('Pinned mechanical pattern drift')
    sys.path.insert(0,str(Path(PATTERN['path']).parent))
    return module('source_choice',PATTERN['path'])

def bundle_enabled(card,stage):
    # Actual locked methods are CONFIRM-A/B; native amendment V06 is never overridden.
    return card['method_id']!='V06' and stage['required_artifacts']==FINAL_PATHS

def bundle_identity(job):
    return (f'\n\n## Prospective confirmation final transport identity\n'
        f'The current stage_id for the ONE explicitly native-adopted final bundle is {job}. '
        'This replaces only the earlier inherited transport stage_id label. All scientific Task content, '
        'locked method duties, criteria, checking/repair functions and role budget above remain authoritative. '
        'Use actual mcp__pm_boundary__write_file with path and text arguments; write_text is only a logical label. '
        'The unchanged bundle path is out/final_bundle.json and all four unchanged out/final canonical roles '
        'must be explicitly adopted together. This version uses an empty delivery_role_manifest: author each '
        'of the four current artifact slots explicitly as text_utf8 in that bundle after reading the admitted '
        'new same-arm inputs. No input_id references, automatic fallback, host-written catalog, helper Goal '
        'or additional time is admitted. Scratch stays outside the absent reserved out/final directory. '
        'A combined critic_final role performs genuine independent critique AND final authorship in one Goal; '
        'a three-stage control retains its separate critic and final author. Optional review stays optional.\n').encode()

def carrier_factors(card,arm):
    # Administrative declared prompt locators, never Task/body content or grade inference.
    factors=[]
    for stage in card[arm+'_stages']:
        for path in stage['prompt_paths']:
            match=re.match(r'^(V(?:0[1-9]|1[0-6]))-',Path(path).name)
            if match and match.group(1) not in factors:factors.append(match.group(1))
    return factors

def validate_admission(old_rows,new_rows):
    """Pure metadata gate. Ops must obtain an actual complete, current cohort snapshot."""
    expected_old={s['job_id'] for x in p.checked(FEASIBILITY)['locked_pairs'] for s in x['schedule']}
    expected_new=set(p.checked(p.ref(ROOT/'OUTBOX.json'))['new_role_ids'])
    if len(old_rows)!=22 or {r['job_id'] for r in old_rows}!=expected_old:raise ValueError('All exact original22 roles required')
    for r in old_rows:
        if r['status'] not in {'COMPLETED','FAILED','BLOCKED_PREDECESSOR_FAILED','BLOCKED_RESOURCE'}:raise ValueError('Old role nonterminal')
        if type(r['native_goal_starts']) is not int or r['native_goal_starts']<0:raise ValueError('Known actual nonnegative old native counter required')
        if r.get('owned_quiet_positive') is not True or r.get('permit_release_confirmed') is not True:
            raise ValueError('All old roles need positive owned quiet/release or explicit no-owned-actor absence proof')
    if len(new_rows)!=22 or {r['job_id'] for r in new_rows}!=expected_new:raise ValueError('All exact new22 roles required')
    if any(type(r['native_goal_starts']) is not int or type(r['launch_intents']) is not int or r['native_goal_starts']!=0 or r['launch_intents']!=0 for r in new_rows):raise ValueError('New cohort already entered or counter unknown')
    return True

def prepare():
    policy=p.checked(POLICY);feas=p.checked(FEASIBILITY);p.checked(FEASIBILITY_PIN);p.checked(FEASIBILITY_OUTBOX)
    if [x['original_slot'] for x in feas['locked_pairs']]!=['C-01','C-02','C-03','C-04']:raise ValueError('Whole exact locked four, no subset')
    v=runtime();v.source_choice(False);v.source_choice(True);p.checked(v.TOOLS)
    for ref in feas['mechanical_patterns'].values():
        if isinstance(ref,dict) and 'path' in ref and p.sha(ref['path'])!=ref['sha256']:raise ValueError('Declared pattern drift')
    rules={'schema':'er9.strict-new-confirmation-clock-role-linking.v1','policy_ref':POLICY,
      'validator_ref':p.ref(ROOT/'role_birth.py'),'metadata_prepare_ref':p.ref(ROOT/'production_metadata.py'),
      'first_R':'Exactly original five common inputs, including source separation; no old output, source captures, candidate/catalog/critic/failure/evaluator/otherarm/Sol answers',
      'later':'All declared new samepair samearm ancestors, positive completed native Goal, operational_complete and owned quiet; all original required artifacts, actual hashes and exact closed captures including errors',
      'final_carrier':'INLINE_ONLY empty reference manifest fixed prospectively; native explicitly authors all4 current text_utf8 slots. Same-arm new ancestor files remain admitted input roles. No host fallback',
      'future_hashes':'Actual new native role/clock/resource/config/input hashes at original new role birth before Goal; never fabricate future hashes or reset clocks',
      'operator_binding_ref':p.ref(p.LAB/'dev/tools/versions/v1.5-clock-telemetry/operator_binding.py'),
      'shared_opaque_input_primitives_ref':p.ref(p.ROOT/'prepare_successors.py'),
      'API_schema_ref':p.ref(p.LAB/'dev/tools/versions/v1.5-clock-telemetry/API_SCHEMA.json'),
      'model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max','observed_donor_family':'Z',
      'original_maximum_Goals':2,'additional_logical_target_credit':False,'source_owner_native_calls':0}
    p.put(ROOT/'STRICT_ROLE_BIRTH_CONTRACT.json',rules);rulesref=p.ref(ROOT/'STRICT_ROLE_BIRTH_CONTRACT.json')
    tool=module('operator',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/operator_binding.py')
    requests=[];preservation=[];alljobs=[]
    for locked in feas['locked_pairs']:
        source=p.checked(locked['registration_ref']);card=p.checked(locked['original_locked_card'])
        p.checked(locked['full_old_closure_ref'])
        if source['family']!='Z' or source['requested_model']!='GLM 5.3 Flash' or source['requested_effort'].casefold()!='max':raise ValueError('Original GLM Flash Max must be explicit')
        for ref in locked['locked_input_refs'].values():
            if isinstance(ref,dict) and 'path' in ref and p.sha(ref['path'])!=ref['sha256']:raise ValueError('Locked input/criteria ref drift')
        pair=locked['original_slot']+'-CONFIRMATION-CLOCK-FRESH-R001';root=ROOT/'pairs'/pair
        mapping={row['job_id']:row['job_id'].replace(source['pair_id'],pair) for row in source['stage_jobs']}
        common={'schema':'er9.confirmation-clock-common-runtime.v1','core_pin':v.CORE,'bundle_pin':v.BUNDLE,'tools_source_pin':v.TOOLS,
           'ops_markers':v.MARKERS,'private_memory_max_bytes':2304*1024**2,'swap_max_bytes':0,'outer_memory_max_bytes':768*1024**2,
           'host_reserve_bytes':3*1024**3,'all_active_retained_G_L_growth_gate_retained':True,'fit':'UNKNOWN',
           'behavior':'Explicit common clock-awareness engineering stratum; no invisible causal neutrality or causal failure explanation',
           'locked_scientific_card':locked['original_locked_card'],'criteria_input_refs':locked['locked_input_refs'],
           'authoritative_per_arm_stage_sum_seconds':2700,'original_historical_occupied_label_seconds':5400,'historical_label_adds_allocation':False}
        p.put(root/'COMMON_RUNTIME_CLOSURE.json',common)
        newcard=copy.deepcopy(card);newcard.update(pair_id=pair,source_pair_id=source['pair_id'],card_version='DEC014-fullfresh-clock-r001',
            clock_behavior_version='er9.common-original-action-clock-awareness.v1',declared_runtime_closure=p.ref(root/'COMMON_RUNTIME_CLOSURE.json'))
        p.put(root/'card.json',newcard);jobs=[];closures=[]
        for row in source['stage_jobs']:
            sr={'path':row['stage_json'],'sha256':row['stage_sha256']};old=p.checked(sr);job=mapping[row['job_id']]
            B=bundle_enabled(card,old);pin,native,integration,marker,fragment=v.source_choice(B)
            run=root/job;ws=run/'workspace';ws.mkdir(parents=True,exist_ok=False);(ws/'out').mkdir()
            p.clone_bytes(old['prompt_file'],ws/'TASK.inherited.md',old['prompt_sha256'],old['workspace'])
            fp=run/'clock_fragment.md';fp.write_bytes(fragment.render(old['max_seconds']))
            task=ws/'TASK.md';task.write_bytes((ws/'TASK.inherited.md').read_bytes()+(bundle_identity(job) if B else b'')+fp.read_bytes())
            inputs={}
            for path,digest in old['input_pins'].items():
                rel=Path(path).relative_to(old['workspace'])
                if rel.parent!=Path('inputs') or rel.name not in ALLOWED_INPUTS:raise ValueError('Fresh template excludes every old candidate/closedcapture/evaluator input')
                target=ws/rel;p.clone_bytes(path,target,digest,old['workspace']);inputs[str(target)]=digest
            if {Path(path).name for path in inputs}!=ALLOWED_INPUTS:raise ValueError('Exact original five common inputs required')
            spec=copy.deepcopy(old);spec.update(job_id=job,pair_id=pair,workspace=str(ws),prompt_file=str(task),prompt_sha256=p.sha(task),
                out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),input_pins=inputs,source_stage_ref=sr,
                source_task_prefix_ref={'path':old['prompt_file'],'sha256':old['prompt_sha256']},source_task_prefix_bytes=Path(old['prompt_file']).stat().st_size,
                declared_native_source_pin=pin,declared_native_runner=integration['worker_path'],declared_tool_source_pin=v.TOOLS,
                required_resource_contract=marker['resource_definition']['resource_contract'],required_common_resource_binding=p.ref(root/'COMMON_RUNTIME_CLOSURE.json'),
                pair_freeze=p.ref(root/'COMMON_RUNTIME_CLOSURE.json'),source_original_pair_freeze=old['pair_freeze'],
                glm_resource=copy.deepcopy(integration['glm_resource_template']),full_pipeline_linking_rules=rulesref,
                strict_role_birth_contract=rulesref,native_source_binding_status='SOURCE_READY_CONDITIONAL_DEC014_NO_ADMISSION',
                clock_behavior_version='er9.common-original-action-clock-awareness.v1',reserved_dynamic_clock_input='inputs/STAGE_CLOCK.json',
                actual_future_clock_input_sha256=None,new_role_original_birth_not_reset=True,first_research_old_candidate_payloads=False,
                complete_final_owner_role=B,runtime_binding_required=True)
            spec['glm_resource'].update(source_pins=native['runtime_source_pins'],capture_dir=str(run/'public_captures'),evidence_dir=str(run/'tool-evidence'),
                execution_enabled=row['execution_enabled'],public_get=row['public_get'],clock_fragment=p.ref(fp),bundle_profile=None)
            if B:
                built=tool.binding(stage_id=job,stage_role='final_author' if row['stage']=='revision' else row['stage'],case_id=card['case_id'],arm_id=row['arm'],
                    method_factors=carrier_factors(card,row['arm']),actor_binding={'stage_id':job,'family':'GLM','model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max',
                    'native_goal_id':None,'writer_alias':'mcp__pm_boundary__write_file'},entries=[],complete_final_role=True)
                manifest=ws/'inputs/delivery_role_manifest.json';manifest.write_bytes(built['manifest_bytes']);inputs[str(manifest)]=p.sha(manifest)
                private=run/'operator-profile';private.mkdir(mode=0o700);profile=private/'BUNDLE_PROFILE.json';profile.write_bytes(built['profile_bytes']);profile.chmod(0o600)
                spec['glm_resource']['bundle_profile']=p.ref(profile)
                spec.update(bundle_profile_binding_required=True,bundle_authoring_mode='INLINE_ONLY',required_delivery_role_manifest=p.ref(manifest),
                  future_actor_metadata={'logical_writer_kind':'write_text','configured_native_tool':'mcp__pm_boundary__write_file','observed_native_tool':'UNOBSERVED before dispatch','native_goal_id':None})
            else:
                for key in ['bundle_profile_binding_required','dynamic_role_manifest_binding_required','required_delivery_role_manifest','future_actor_metadata']:spec.pop(key,None)
            fragment.validate_packet(spec);p.put(run/'prepared-stage.json',spec)
            selected=copy.deepcopy(row);selected.update(job_id=job,stage_json=str(run/'prepared-stage.json'),stage_sha256=p.sha(run/'prepared-stage.json'),
                 expected_freeze=spec['freeze_out'],source_job_id=row['job_id'],resource_definition=marker['resource_definition'],runtime_ref=v.MARKERS[int(B)],
                 prerequisite_job_ids=[mapping[x] for x in row['prerequisite_job_ids']],all_same_arm_prior_job_ids=[mapping[x] for x in row['all_same_arm_prior_job_ids']],
                 clock_fragment=p.ref(fp),status='CONDITIONAL_PREPARED_NOT_ADMITTED',source_role_freezes_required=[],supplied_frozen_source_job_ids=[])
            jobs.append(selected);alljobs.append(job)
            closures.append({'job_id':job,'arm':row['arm'],'stage':row['stage'],'source_stage_ref':sr,'native_source_pin':pin,'runtime_source_pins':native['runtime_source_pins'],
                 'tools_source_pin':v.TOOLS,'ops_marker':v.MARKERS[int(B)],'worker_ref':p.ref(integration['worker_path']),
                 'clock_constructor':integration['task_constructor']['source'],'clock_fragment':p.ref(fp),'Task_ref':p.ref(task),'scientific_prefix_ref':spec['source_task_prefix_ref'],
                 'neutral_input_pins':inputs,'strict_role_birth_contract':rulesref,'inline_only_bundle_profile':spec['glm_resource']['bundle_profile'],
                 'stage_caps_and_roles':{k:old.get(k) for k in p.INVARIANTS},'execution_enabled':row['execution_enabled'],'public_get':row['public_get'],
                 'actual_future_role_clock_config_hashes':None})
            preservation.append({'new_job_id':job,'old_job_id':row['job_id'],'source_stage_ref':sr,'original_scientific_prefix_ref':spec['source_task_prefix_ref'],
                'original_input_pins':old['input_pins'],'old_role_fields':{k:old.get(k) for k in p.INVARIANTS}})
        p.put(root/'PRESERVATION.json',{'schema':'er9.dec014-pair-byte-prefix-preservation.v1','stages':[x for x in preservation if x['new_job_id'] in mapping.values()]})
        closure={'schema':'er9.dec014-allrole-botharm-confirmation-closure.v1','pair_id':pair,'source_pair_id':source['pair_id'],'policy_ref':POLICY,
           'source_registration_ref':locked['registration_ref'],'source_original_card_ref':locked['original_locked_card'],'original_full_closure_ref':locked['full_old_closure_ref'],
           'locked_input_criteria_refs':locked['locked_input_refs'],'locked_method_ref':locked['locked_method_ref'],'all_roles':closures,
           'complete_actual_both_arm_all_role_source_choices_before_first_R':True,'strict_role_birth_contract':rulesref,
           'explicit_common_behavior_stratum':'clock-awareness-v1.5 finite all4 engineering retest; originals descriptive/fully charged',
           'invisible_causal_neutrality_guarantee':False,'all_old22_terminal_ownedquiet_already_observed':False,
           'dynamic_actual_hashes_fabricated':False,'source_owner_native_calls':0,'extra_logical_target_matched_credit':False}
        p.put(root/'PIPELINE_CLOSURE.json',closure)
        reg=copy.deepcopy(source);reg.update(request_id=pair+'-r001',pair_id=pair,source_pair_id=source['pair_id'],card_path=str(root/'card.json'),card_sha256=p.sha(root/'card.json'),
            stage_jobs=jobs,pipeline_closure=p.ref(root/'PIPELINE_CLOSURE.json'),immutable_pair_input_freeze=p.ref(root/'PIPELINE_CLOSURE.json'),policy_ref=POLICY,
            source_registration_ref=locked['registration_ref'],source_scientific_card_refs=[locked['original_locked_card']],source_role_imports=[],
            strict_role_birth_contract=rulesref,track='CONFIRMATION_FINITE_FULL_FRESH_CLOCK_ENGINEERING_RETEST',cohort_id='DEC014-CONFIRMATION-CLOCK-FRESH-R001',
            status='SOURCE_READY_CONDITIONAL_NOT_ADMITTED',native_starts=0,automatic_retry=False,first_research_old_candidate_payloads=False,
            root_scope_required=False,root_or_max_go_required=False,routine_new_phase_approval_required=False,
            admission_conditions=['all original22 terminal + positive owned quiet/released','all new22 native0/noIntent atomic cohort check',
              'complete ALL4 BOTH arms all role source closures','actual new role clock/config/resource/input hashes bound before Goal',
              'strict authenticated NEW same-arm prerequisites and original resources/Gcap2/growth/reserve'],
            extra_logical_target_matched_credit=False,prior_lineages_costs_failures_grades_retained=True,
            resource_binding=p.ref(root/'COMMON_RUNTIME_CLOSURE.json'),preservation_ref=p.ref(root/'PRESERVATION.json'),
            scientific_recovery_mode='full_fresh_paired_engineering_retest_common_clock_behavior_stratum',
            dispatch_selection_rule='DEC014 all-original22 terminal ownedquiet/released; all-new22 native0/noIntent; finite new all4 full-fresh cohort, old entered costs retained',
            supersedes_pending_stage_job_ids=[],finite_new_retest_job_ids=[j['job_id'] for j in jobs])
        p.put(root/'registration.json',reg);requests.append(p.ref(root/'registration.json'))
    p.put(ROOT/'PRESERVATION.json',{'schema':'er9.dec014-byte-prefix-preservation.v1','stages':preservation,'scientific_or_evaluator_bodies_read':False})
    p.put(ROOT/'OUTBOX.json',{'schema':'er9.dec014-confirmation-clock-fullfresh-outbox.v1','requests':requests,'pair_count':4,'arm_count':8,'native_stage_count':len(alljobs),
        'per_arm_seconds':2700,'cohort_native_seconds':21600,'new_role_ids':alljobs,'policy_ref':POLICY,'feasibility_ref':FEASIBILITY,'feasibility_PIN':FEASIBILITY_PIN,
        'feasibility_OWNER_INTEGRATION_OUTBOX':FEASIBILITY_OUTBOX,'core_pin':v.CORE,'bundle_pin':v.BUNDLE,'tools_source_pin':v.TOOLS,'ops_expected_markers':v.MARKERS,
        'strict_role_birth_contract':rulesref,'preservation_ref':p.ref(ROOT/'PRESERVATION.json'),'all_old22_terminal_ownedquiet_observed_at_source_cutoff':False,
        'conditional_admission':'Ops current proof of all old22 terminal/ownedquiet/released and all new22 native0/noIntent; no wait here/no queue hold/no routine Go',
        'quality_selected_subset_or_bestof':False,'automatic_further_repeat':False,'additional_logical_target_credit':False,
        'actual_native_model_Goal_provider_calls':0,'actual_ops_mutations':0,'candidate_evaluator_science_answer_bodies_read':False})
    print(json.dumps(p.ref(ROOT/'OUTBOX.json')))

if __name__=='__main__':prepare()

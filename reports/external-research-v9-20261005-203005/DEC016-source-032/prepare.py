#!/usr/bin/env python3
"""DEC016 exactly4 paired stages, immutable science bytes, no model/native IO."""
import copy,importlib.util,json,sys
from pathlib import Path
sys.dont_write_bytecode=True
sys.path.insert(0,str(Path(__file__).resolve().parent.parent));import prepare_successors as p
ROOT=Path(__file__).resolve().parent
POLICY={'path':str(p.LAB/'supervision/DECISIONS-016-C01-PAIRED-INFRASTRUCTURE-STAGE-REPAIR.json'),'sha256':'8958cfdad704dec538226f1b2dc035f282159ad41a751aa4fe080c6937cd03c8'}
SELECTION={'path':str(p.LAB/'ops/dispatcher/DEC016_C01_INFRA_REPAIR_METADATA_001/SELECTION.json'),'sha256':'6079c5d6a4c7052849335e18a10fd76b596e84281bd139cdf5988065022c31a6'}
NORMALIZER={'path':str(p.ROOT/'proof-model-normalizer-001/SOURCE_PIN.json'),'sha256':'04f37c0074e2f98fd1754ef640461e928f2c8be25295f92f035f13d3e1dfa803'}
PATTERN={'path':str(p.ROOT/'clock-telemetry-001/prepare_versions.py'),'sha256':'8e12e2e6f02050172bf92711933c56510912cc3a345c5a88750dc7a063ebdf77'}
ALLOWED={'brief.md','source_access.json','source_separation.md','delivery_objective.md','output_contract.md'}
PAIR='C-01-CONFIRMATION-CLOCK-FRESH-R001-INFRA-STAGE-REPAIR-R001'

def module(name,path):
    sp=importlib.util.spec_from_file_location('c01_infra_'+name,path);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m

def runtime():
    if p.sha(PATTERN['path'])!=PATTERN['sha256']:raise ValueError('Pinned runtime constructor pattern drift')
    sys.path.insert(0,str(Path(PATTERN['path']).parent));return module('source_choices',PATTERN['path'])

def identity(job):
    return ('\n\n## Additive infrastructure-repair final identity\n'
      f'The current stage_id for the SAME explicitly native-adopted complete final bundle is {job}. '
      'This overrides only earlier inherited transport stage_id labels. All original scientific Tasks, '
      'holdout brief, common criteria, method duties, required final roles, source access and600-second '
      'role allocation remain unchanged. Read the current admitted same-arm research and NEW repair '
      'critic inputs. No previous failed critic, other arm, evaluator finding or Sol answer is admitted. '
      'The existing INLINE_ONLY delivery manifest is empty; explicitly author each current text_utf8 '
      'artifact with the same actual mcp__pm_boundary__write_file(path,text). No fallback or extra Goal '
      'is authorized. Original failed stages/clocks/costs remain historical; this new final is charged separately.\n').encode()

def research_metadata(selection):
    rows=[r for r in selection['rows'] if r['stage']=='research']
    if len(rows)!=2 or {r['arm'] for r in rows}!={'control','treatment'}:raise ValueError('Both exact current research parents required')
    capsule=p.checked(selection['capsule_ref']);normalizer=module('exact_observed_dto',p.ROOT/'proof-model-normalizer-001/normalizer.py')
    for row in rows:
        freeze=p.checked(row['freeze_ref']);stage=p.checked(row['stage_ref'])
        if row['status']!='COMPLETED' or row['native_goal_starts']!=1 or row['permit_release_confirmed'] is not True or freeze.get('operational_complete') is not True or freeze.get('native_quiescent') is not True or freeze.get('native_goal_starts')!=1:
            raise ValueError('Both actual research Goals COMPLETE/full/ownedquiet/released before READY')
        actual=[r for r in capsule['rows'] if r['job_id']==row['job_id']]
        if len(actual)!=1:raise ValueError('Unique actual positive current research capsule required')
        actual=actual[0]
        if actual.get('native_goal_starts')!=1 or actual['observed_family']!='Z' or normalizer.observed_model(actual['observed_model'])!='builtin:zai-coding-plan/GLM-5.3-Flash' or actual['observed_effort']!='max' or actual['native_goal_state'] not in {'complete','COMPLETED'}:
            raise ValueError('Exact actual GLMFlashMax completed research proof required')
        if actual['origin_goal_id'] is None or actual['origin_goal_id']!=freeze['goal_target_id']:raise ValueError('Actual separate native Goal target required')
        if actual['output_freeze']!=row['freeze_ref'] or any(freeze[k]!=row[k] or stage[k]!=row[k] or actual[k]!=row[k] for k in ['job_id','pair_id','arm','stage']):raise ValueError('Current research native identity joins required')
        required=[n.removeprefix('out/') for n in stage['required_artifacts']];inventory={a['relative_path']:a for a in row['artifact_inventory']}
        if row['artifact_inventory']!=freeze['artifacts'] or any(n not in inventory or inventory[n]['bytes']<=0 for n in required):raise ValueError('Exact full current R4 artifact metadata required')
        context=p.checked(row['closed_source_context_ref'])
        if context.get('schema')!='er9.closed-native-source-context.v1' or context['job_id']!=row['job_id'] or context['arm']!=row['arm'] or context['output_freeze']!=row['freeze_ref'] or context['owned_quiet_positive'] is not True or context.get('native_goal_starts')!=1 or context.get('native_model_io_or_candidate_semantics_included') is not False:raise ValueError('Exact current owned research closed captures required')
    return rows

def prepare():
    policy=p.checked(POLICY);selection=p.checked(SELECTION);p.checked(NORMALIZER);research=research_metadata(selection);v=runtime()
    for B in [False,True]:v.source_choice(B)
    owner_ref=research[0]['owner_registration_ref'];source=p.checked(owner_ref)
    if any(r['owner_registration_ref']!=owner_ref for r in selection['rows']):raise ValueError('One original actual C01 scientific pair required')
    original_card_ref=research[0]['card_ref'];card=p.checked(original_card_ref);original_closure=p.checked(source['pipeline_closure'])
    if source['source_slot']!='C-01' or card['case_id']!='H1-v1' or card['recipe']!='A':raise ValueError('Exact original C01 H1 locked recipeA required')
    contract={'schema':'er9.c01-paired-infrastructure-parent-binding.v1','policy_ref':POLICY,'selection_ref':SELECTION,
      'validator_ref':p.ref(ROOT/'role_birth.py'),'model_proof_normalizer_pin':NORMALIZER,'fixed_research_parent_rows':research,
      'critique_rule':'ONLY exact current same-arm DEC014 COMPLETE/quiet R role namespace and exact ownedcaptures; no old critics or source answers',
      'final_rule':'That exact current R plus ONLY actual NEW same-arm repair critic COMPLETE/quiet/review, with genuine native Goal and exact hashes/closedcaptures',
      'source_card_ref':original_card_ref,'source_registration_ref':owner_ref,'source_original_closure':source['pipeline_closure'],
      'metadata_repair_after_first_research_disclosed':True,'no_research_rerun':True,'no_old_clock_reset':True,'native_calls':0}
    p.put(ROOT/'ROLE_BINDING_CONTRACT.json',contract);contract_ref=p.ref(ROOT/'ROLE_BINDING_CONTRACT.json')
    updated_card=copy.deepcopy(card);updated_card.update(pair_id=PAIR,source_pair_id=source['pair_id'],card_version='DEC016-additive-infrastructure-stage-repair-r001',
      scientific_stage_topology_is_original_reference=True,new_native_role_scope='Only critique900 then final600 per arm, reuse declared actual R',
      new_research_roles=0,new_stage_seconds_per_arm=1500,measurement='Paired delivery-repaired continuation, repeated-stage cumulative costs; not clean unrepaired/new target')
    p.put(ROOT/'card.json',updated_card)
    common={'schema':'er9.dec016-c01-common-runtime-source-closure.v1','policy_ref':POLICY,'source_card_ref':original_card_ref,
      'core_pin':v.CORE,'bundle_pin':v.BUNDLE,'tools_source_pin':v.TOOLS,'ops_markers':v.MARKERS,
      'private_memory_max_bytes':2304*1024**2,'swap_max_bytes':0,'outer_memory_max_bytes':768*1024**2,'host_reserve_bytes':3*1024**3,
      'all_active_retained_growth_gate_retained':True,'maximum_G_owned_all_stages':2,'fit':'UNKNOWN'}
    p.put(ROOT/'COMMON_RUNTIME_CLOSURE.json',common)
    carrier=module('operator',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/operator_binding.py');rows=[];closures=[]
    for arm in ['control','treatment']:
        for stage_name in ['critique','revision']:
            oldrow=next(r for r in source['stage_jobs'] if r['arm']==arm and r['stage']==stage_name)
            sr={'path':oldrow['stage_json'],'sha256':oldrow['stage_sha256']};old=p.checked(sr);B=bool(old['complete_final_owner_role'])
            pin,native,integration,marker,fragment=v.source_choice(B);job=PAIR+'-'+arm+'-'+stage_name+'-a001';run=ROOT/job;ws=run/'workspace';ws.mkdir(parents=True,exist_ok=False);(ws/'out').mkdir()
            fp=run/'clock_fragment.md';rawfragment=fragment.render(old['max_seconds']);fp.write_bytes(rawfragment)
            p.clone_bytes(old['prompt_file'],ws/'TASK.inherited.md',old['prompt_sha256'],old['workspace']);raw=(ws/'TASK.inherited.md').read_bytes()
            if not raw.endswith(rawfragment):raise ValueError('Exact original declared clock suffix required')
            science_prefix=raw[:-len(rawfragment)]
            task=ws/'TASK.md';task.write_bytes(science_prefix+(identity(job) if B else b'')+rawfragment)
            inputs={}
            for path,digest in old['input_pins'].items():
                rel=Path(path).relative_to(old['workspace'])
                if rel.parent!=Path('inputs') or rel.name not in ALLOWED|{'delivery_role_manifest.json'}:raise ValueError('No born/failed critic artifacts or oldcaptured body in prepared template')
                if rel.name=='delivery_role_manifest.json':continue
                target=ws/rel;p.clone_bytes(path,target,digest,old['workspace']);inputs[str(target)]=digest
            if {Path(x).name for x in inputs}!=ALLOWED:raise ValueError('Exact unchanged original five common neutral inputs required')
            spec=copy.deepcopy(old);spec.update(job_id=job,pair_id=PAIR,workspace=str(ws),prompt_file=str(task),prompt_sha256=p.sha(task),
              out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),input_pins=inputs,pair_freeze=p.ref(ROOT/'COMMON_RUNTIME_CLOSURE.json'),
              source_original_stage_ref=sr,source_original_Task_ref={'path':old['prompt_file'],'sha256':old['prompt_sha256']},
              source_original_scientific_prefix_bytes=len(science_prefix),source_original_stage_clock_suffix_ref=old['glm_resource']['clock_fragment'],
              declared_native_source_pin=pin,declared_native_runner=integration['worker_path'],declared_tool_source_pin=v.TOOLS,
              required_resource_contract=marker['resource_definition']['resource_contract'],required_common_resource_binding=p.ref(ROOT/'COMMON_RUNTIME_CLOSURE.json'),
              glm_resource=copy.deepcopy(integration['glm_resource_template']),strict_repair_role_birth_contract=contract_ref,
              full_pipeline_linking_rules=contract_ref,new_research_roles=0,old_clock_reset=False,
              native_source_binding_status='SOURCE_READY_DEC016_C01_PAIRED_STAGE_REPAIR_PENDING_OPS_BIRTH',
              reserved_dynamic_clock_input='inputs/STAGE_CLOCK.json',actual_future_clock_input_sha256=None,original_attempt_status_or_costs_rewritten=False)
            spec['glm_resource'].update(source_pins=native['runtime_source_pins'],capture_dir=str(run/'public_captures'),evidence_dir=str(run/'tool-evidence'),
              execution_enabled=oldrow['execution_enabled'],public_get=oldrow['public_get'],clock_fragment=p.ref(fp),bundle_profile=None)
            if B:
                oldprofile=p.checked(old['glm_resource']['bundle_profile'])
                built=carrier.binding(stage_id=job,stage_role='final_author',case_id=card['case_id'],arm_id=arm,method_factors=oldprofile['method_factors'],
                  actor_binding={'stage_id':job,'family':'GLM','model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max','native_goal_id':None,
                    'writer_alias':'mcp__pm_boundary__write_file'},entries=[],complete_final_role=True)
                manifest=ws/'inputs/delivery_role_manifest.json';manifest.write_bytes(built['manifest_bytes']);inputs[str(manifest)]=p.sha(manifest)
                private=run/'operator-profile';private.mkdir(mode=0o700);profile=private/'BUNDLE_PROFILE.json';profile.write_bytes(built['profile_bytes']);profile.chmod(0o600)
                spec['glm_resource']['bundle_profile']=p.ref(profile);spec.update(required_delivery_role_manifest=p.ref(manifest),bundle_profile_binding_required=True,bundle_authoring_mode='INLINE_ONLY')
            fragment.validate_packet(spec);p.put(run/'prepared-stage.json',spec)
            critic=PAIR+'-'+arm+'-critique-a001';research_row=next(r for r in research if r['arm']==arm)
            selected=copy.deepcopy(oldrow);selected.update(job_id=job,stage_json=str(run/'prepared-stage.json'),stage_sha256=p.sha(run/'prepared-stage.json'),expected_freeze=spec['freeze_out'],
              source_job_id=oldrow['job_id'],prerequisite_job_ids=[] if stage_name=='critique' else [critic],
              all_same_arm_prior_job_ids=[research_row['job_id']]+([] if stage_name=='critique' else [critic]),
              fixed_current_research_parent_job_id=research_row['job_id'],resource_definition=marker['resource_definition'],runtime_ref=v.MARKERS[int(B)],
              strict_repair_role_birth_contract=contract_ref,status='SOURCE_PREPARED_NOT_ADMITTED',source_role_freezes_required=[research_row['freeze_ref']],
              supplied_frozen_source_job_ids=[],source_original_native_stage_attempt_ref=next(r for r in selection['rows'] if r['arm']==arm and r['stage']==stage_name)['stage_ref'])
            rows.append(selected);closures.append({'job_id':job,'arm':arm,'stage':stage_name,'native_source_pin':pin,'runtime_source_pins':native['runtime_source_pins'],
              'tools_source_pin':v.TOOLS,'ops_marker':v.MARKERS[int(B)],'source_original_stage_ref':sr,'Task_ref':p.ref(task),
              'clock_constructor_ref':integration['task_constructor']['source'],'clock_fragment':p.ref(fp),'neutral_input_pins':inputs,
              'source_scientific_prefix_bytes':len(science_prefix),'source_cap_role_fields':{k:old.get(k) for k in p.INVARIANTS},
              'inline_only_profile':spec['glm_resource']['bundle_profile'],'role_binding_contract':contract_ref,'actual_future_role_profile_input_hashes':None})
    full={'schema':'er9.dec016-c01-both-arm-all-four-stage-closure.v1','pair_id':PAIR,'policy_ref':POLICY,'selection_ref':SELECTION,
      'source_original_full_closure':source['pipeline_closure'],'source_card_ref':original_card_ref,'locked_input_criteria_refs':original_closure['locked_input_criteria_refs'],
      'locked_method_ref':original_closure['locked_method_ref'],'fixed_research_parents':research,'all_roles':closures,
      'all4_actual_source_choices_frozen_before_either_new_critic':True,'source_parent_R_complete_quiet_proved':True,'new_R_stages':0,
      'old_failed_critics_and_blocked_unspent_finals':[{k:v for k,v in r.items() if k not in {'neutral_and_input_pins','source_grade'}} for r in selection['rows'] if r['stage']!='research'],
      'new_stage_allocation_sum_seconds':3000,'actual_cumulative_costs':'retain exact original receipts plus new native usage, do not infer spent duration from cap',
      'measurement':'Paired same-research delivery-repaired continuation with repeated-stage costs; no extra logical target or clean unrepaired pair claim',
      'automatic_further_repeat':False,'source_owner_native_calls':0}
    p.put(ROOT/'PIPELINE_CLOSURE.json',full)
    reg=copy.deepcopy(source);reg.update(request_id=PAIR+'-r001',pair_id=PAIR,source_pair_id=source['pair_id'],card_path=str(ROOT/'card.json'),card_sha256=p.sha(ROOT/'card.json'),
      stage_jobs=rows,pipeline_closure=p.ref(ROOT/'PIPELINE_CLOSURE.json'),immutable_pair_input_freeze=p.ref(ROOT/'PIPELINE_CLOSURE.json'),policy_ref=POLICY,
      source_registration_ref=owner_ref,source_role_imports=research,source_research_parent_selection_ref=SELECTION,strict_repair_role_birth_contract=contract_ref,
      scientific_recovery_mode='paired_same_research_infrastructure_stage_repair_with_repeated_costs',track='C01_PAIRED_INFRASTRUCTURE_STAGE_REPAIR',
      native_starts=0,automatic_retry=False,root_scope_required=False,root_or_max_go_required=False,new_research_roles=0,
      extra_logical_target_matched_credit=False,clean_unrepaired_comparison_claim=False,prior_lineages_costs_failures_grades_retained=True,
      status='SOURCE_READY_PENDING_OPS_ACTUAL_BIRTH',supersedes_pending_stage_job_ids=[],resource_binding=p.ref(ROOT/'COMMON_RUNTIME_CLOSURE.json'),
      native_source_binding_status='SOURCE_READY_DEC016_C01_PAIRED_STAGE_REPAIR_PENDING_OPS_BIRTH',
      dispatch_selection_rule='DEC016 exactly4 new roles, same-R parents only; all4 source choices/currentauth/oldquiet/new0GoalNoIntent/resource gates, no Go',
      finite_new_repair_job_ids=[r['job_id'] for r in rows],cohort_id='DEC016-C01-PAIRED-INFRASTRUCTURE-STAGE-REPAIR-R001')
    p.put(ROOT/'registration.json',reg)
    p.put(ROOT/'OUTBOX.json',{'schema':'er9.dec016-c01-paired-infra-stage-repair-outbox.v1','requests':[p.ref(ROOT/'registration.json')],
      'policy_ref':POLICY,'selection_ref':SELECTION,'source_parent_R_complete_quiet_proved':True,'pair_count':1,'native_stage_count':4,
      'new_stage_seconds_per_arm':1500,'total_new_stage_seconds':3000,'new_research_roles':0,'all4_source_closure':p.ref(ROOT/'PIPELINE_CLOSURE.json'),
      'role_binding_contract':contract_ref,'model_proof_normalizer_pin':NORMALIZER,'core_pin':v.CORE,'bundle_pin':v.BUNDLE,'tools_source_pin':v.TOOLS,
      'ops_markers':v.MARKERS,'extra_logical_target_matched_credit':False,'clean_unrepaired_pair_claim':False,'old_clocks_reset':False,
      'source_native_model_Goal_calls':0,'actual_ops_mutations':0,'automatic_repeat':False,
      'admission':'Sole ops validates current fixed R complete/quiet, old uncertain actors quiet, all4 new0Goal/noIntent/allsourceclosure, actual original birth hashes and ordinary Gcap2/private/growth/reserve gates'})
    print(json.dumps(p.ref(ROOT/'OUTBOX.json')))

if __name__=='__main__':prepare()

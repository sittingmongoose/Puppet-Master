#!/usr/bin/env python3
"""DEC017 prospectively closed19 existing descendant versions +exact4 new finals."""
import copy,importlib.util,json,sys
from pathlib import Path
sys.dont_write_bytecode=True;sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
import prepare_successors as p
import locator
ROOT=Path(__file__).resolve().parent
POLICY={'path':str(p.LAB/'supervision/DECISIONS-017-OWN-PRIOR-NAVIGATION-INDEX.json'),'sha256':'79f594f8fe9d1bb0e9b262108ef74c37696450068402b1624af5d56ef1d90f81'}
RECOMMENDATION={'path':str(p.LAB/'dev/execution/glm-resource-v1/diagnosis/final-delivery-002/PATH_CONTRACT_RECOMMENDATION.json'),'sha256':'9af696b2f2b138aded2d0a13a1b74f0d1719746c1a8d2123c12ba068364fa12e'}
ELIGIBILITY={'path':str(p.LAB/'ops/dispatcher/DEC017_UNENTERED_G_SUCCESSOR_ELIGIBILITY_001.json'),'sha256':'afa78caa3ef8e34961e1330e949c58fe182bf3a71d7c4854ce1fda7677026310'}
CURRENT={'path':str(p.LAB/'ops/dispatcher/DEC017_CURRENT_SUCCESSOR_ELIGIBILITY_002.json'),'sha256':'a19134f94ee48a3cd7cb998806dcb662226844f3bd977f732d4832ee07a5e863'}
PARENTS={'path':str(p.LAB/'ops/dispatcher/DEC017_FOUR_FINAL_PARENT_METADATA_001/SELECTION.json'),'sha256':'127036cc501fb9a17562c1763ce4445f09fd581d701004bb6f293cfc05ab783f'}
PATTERN={'path':str(p.ROOT/'clock-telemetry-001/prepare_versions.py'),'sha256':'8e12e2e6f02050172bf92711933c56510912cc3a345c5a88750dc7a063ebdf77'}
NORMALIZER={'path':str(p.ROOT/'proof-model-normalizer-001/SOURCE_PIN.json'),'sha256':'04f37c0074e2f98fd1754ef640461e928f2c8be25295f92f035f13d3e1dfa803'}
CARRIER_QUALIFICATION={'path':str(p.LAB/'supervision/DEC017-CARRIER-PRESERVATION-QUALIFICATION-001.json'),'sha256':'2c9793f1fee5d09d492929aa55b7b6e9bbc295789e694d95eace06d9729bc91f'}
CARRIER_PROOF={'path':str(p.LAB/'ops/dispatcher/DEC017_EXISTING_CARRIER_PRESERVATION_CORRECTION_002.json'),'sha256':'c6277539f0fc230dc221771770472c75d6c18f6b191ca77855a7f7b64fe589c5'}
NEUTRAL={'brief.md','source_access.json','source_separation.md','delivery_objective.md','output_contract.md','common_criteria.json','delivery_role_manifest.json'}

def module(name,path):
    sp=importlib.util.spec_from_file_location('navigation_'+name,path);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m

def runtime():
    if p.sha(PATTERN['path'])!=PATTERN['sha256']:raise ValueError('Frozen source constructor drift')
    sys.path.insert(0,str(Path(PATTERN['path']).parent));return module('source_choices',PATTERN['path'])

def positive_four_parents(selection):
    if len(selection['rows'])!=4 or {(r['source_slot'],r['arm']) for r in selection['rows']}!={('C-01','control'),('C-01','treatment'),('C-02','control'),('C-02','treatment')}:
        raise ValueError('All four fixed final-role parent sets required')
    capsules=p.checked(selection['capsule_ref']);normal=module('dto',p.ROOT/'proof-model-normalizer-001/normalizer.py')
    for target in selection['rows']:
        if target['max_seconds']!=600 or target['max_responses']!=60 or target['family']!='Z':raise ValueError('Exact final600/60 original GLM family required')
        if len(target['parents'])!=2 or {r['stage'] for r in target['parents']}!={'research','critique'}:raise ValueError('Exact current R+critic parents required, no substitutes')
        for parent in target['parents']:
            freeze=p.checked(parent['freeze_ref']);stage=p.checked(parent['actual_stage_ref']);actual=[r for r in capsules['rows'] if r['job_id']==parent['job_id']]
            if len(actual)!=1:raise ValueError('Unique actual positive current parent capsule required')
            actual=actual[0]
            if parent['status']!='COMPLETED' or parent['native_goal_starts']!=1 or freeze.get('operational_complete') is not True or freeze.get('native_quiescent') is not True or freeze.get('native_goal_starts')!=1:
                raise ValueError('Full completed/ownedquiet native parents required before READY')
            if actual.get('observed_family')!='Z' or normal.observed_model(actual.get('observed_model'))!='builtin:zai-coding-plan/GLM-5.3-Flash' or actual.get('observed_effort')!='max' or actual.get('native_goal_state') not in {'complete','COMPLETED'}:
                raise ValueError('Exact actual native GLMFlashMax parents required')
            if actual.get('origin_goal_id') is None or actual['origin_goal_id']!=freeze['goal_target_id'] or actual['output_freeze']!=parent['freeze_ref']:
                raise ValueError('Distinct actual native Goal target/freeze join required')
            if any(parent[k]!=actual[k] or parent[k]!=freeze[k] or parent[k]!=stage[k] for k in ['job_id','pair_id','arm','stage']) or parent['arm']!=target['arm']:
                raise ValueError('Actual same-arm parent identity joins required')
            required=[x.removeprefix('out/') for x in stage['required_artifacts']];inventory={a['relative_path']:a for a in parent['artifacts']}
            if parent['artifacts']!=freeze['artifacts'] or any(x not in inventory or inventory[x]['bytes']<=0 for x in required):raise ValueError('Every full required parent artifact required')
            release=p.checked(parent['release_ref'])
            if release.get('all_private_slice_descendants_quiet') is not True or release.get('after',{}).get('ActiveState') not in {'inactive','failed'} or release.get('stop_returncode')!=0:
                raise ValueError('Positive exact actual parent private release required')
    return True

def identity(job):
    return (f'\n\n## Prospective final-only navigation diagnostic identity\n'
      f'The current stage_id for the SAME explicitly native-adopted final bundle is {job}. '
      'This overrides only earlier inherited stage_id labels. All original scientific duties, current '
      'same-arm authenticated R+critic inputs, method/criteria/brief/artifact obligations, INLINE_ONLY '
      'empty adoption semantics and600-second total/570-second action clock remain unchanged. '
      'Use the same actual mcp__pm_boundary__write_file(path,text); no fallback, helper Goal, research '
      'rerun, critic rerun or extra time is authorized. Prior failed versions and charges remain retained.\n').encode()

def configure(old_ref,card_ref,folder,job,pair,new_final=False):
    old=p.checked(old_ref);card=p.checked(card_ref);v=runtime();B=bool(old['complete_final_owner_role']);pin,native,integration,marker,fragment=v.source_choice(B)
    ws=folder/'workspace';ws.mkdir(parents=True,exist_ok=False);(ws/'out').mkdir();raw=Path(old['prompt_file']).read_bytes();suffix=fragment.render(old['max_seconds'])
    if p.sha(old['prompt_file'])!=old['prompt_sha256'] or not raw.endswith(suffix):raise ValueError('Exact frozen Task/clock prefix required')
    inherited=ws/'TASK.inherited.md';inherited.write_bytes(raw);prefix=raw[:-len(suffix)]
    task=ws/'TASK.md';task.write_bytes(prefix+(identity(job) if new_final else b'')+locator.render()+suffix)
    clock=folder/'clock_fragment.md';clock.write_bytes(suffix);inputs={}
    for path,digest in old['input_pins'].items():
        rel=Path(path).relative_to(old['workspace'])
        if rel.parent==Path('inputs') and rel.name in NEUTRAL:
            if rel.name=='delivery_role_manifest.json':continue
            target=ws/rel;p.clone_bytes(path,target,digest,old['workspace']);inputs[str(target)]=digest
        # Every bound own-prior import is retained by the actual original donor
        # rule and opaque binder later, never read/corrected by source compiler.
    spec=copy.deepcopy(old);spec.update(job_id=job,pair_id=pair,workspace=str(ws),prompt_file=str(task),prompt_sha256=p.sha(task),
      input_pins=inputs,out=str(folder/'native'),freeze_out=str(folder/'OUTPUT_FREEZE.json'),source_original_stage_ref=old_ref,
      source_original_Task_ref={'path':old['prompt_file'],'sha256':old['prompt_sha256']},source_original_scientific_prefix_bytes=len(prefix),
      own_prior_navigation_source_version='DEC017-prospective-own-prior-index-v1',own_prior_index_constructor=p.ref(ROOT/'prior_index.py'),
      own_prior_index_finalizer=p.ref(ROOT/'finalize_index.py'),own_prior_locator_ref=p.ref(ROOT/'locator.py'),
      reserved_dynamic_prior_index='inputs/prior_file_index.json',actual_future_prior_index_sha256=None,
      prior_index_original_role_birth_required=True,declared_native_source_pin=pin,declared_native_runner=integration['worker_path'],declared_tool_source_pin=v.TOOLS,
      glm_resource=copy.deepcopy(integration['glm_resource_template']),navigation_Task_changed_prospectively_only=True,entered_clock_reset=False)
    spec['glm_resource'].update(source_pins=native['runtime_source_pins'],capture_dir=str(folder/'public_captures'),evidence_dir=str(folder/'tool-evidence'),
      execution_enabled=old['glm_resource']['execution_enabled'],public_get=old['glm_resource']['public_get'],clock_fragment=p.ref(clock),bundle_profile=None)
    if B and not new_final:
        # Existing sealed profile/manifest remain byte-identical. Future/null
        # is not empty intent: original authenticated h.hydrate runs first.
        spec['glm_resource']['bundle_profile']=old['glm_resource'].get('bundle_profile')
        for path,digest in old['input_pins'].items():
            rel=Path(path).relative_to(old['workspace'])
            if rel==Path('inputs/delivery_role_manifest.json'):
                target=ws/rel;p.clone_bytes(path,target,digest,old['workspace']);inputs[str(target)]=digest
        spec.update(preserve_original_actual_carrier_profile_manifest_SHA=True,
          carrier_binding_state='EXACT_ORIGINAL_SEALED' if spec['glm_resource']['bundle_profile'] else 'ORIGINAL_DYNAMIC_AUTHENTICATED_h_hydrate_BEFORE_INDEX',
          original_carrier_qualification_ref=CARRIER_QUALIFICATION)
    if B and new_final:
        if old['glm_resource'].get('bundle_profile'):factors=p.checked(old['glm_resource']['bundle_profile'])['method_factors']
        elif card['method_id'].startswith('V'):factors=[card['method_id']]
        else:raise ValueError('No invented compound method factor mapper')
        operator=module('operator',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/operator_binding.py')
        built=operator.binding(stage_id=job,stage_role='final_author' if old['stage']=='revision' else old['stage'],case_id=card['case_id'],arm_id=old['arm'],method_factors=factors,
          actor_binding={'stage_id':job,'family':'GLM','model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max','native_goal_id':None,'writer_alias':'mcp__pm_boundary__write_file'},entries=[],complete_final_role=True)
        mp=ws/'inputs/delivery_role_manifest.json';mp.write_bytes(built['manifest_bytes']);inputs[str(mp)]=p.sha(mp)
        private=folder/'operator-profile';private.mkdir(mode=0o700);pp=private/'BUNDLE_PROFILE.json';pp.write_bytes(built['profile_bytes']);pp.chmod(0o600)
        spec['glm_resource']['bundle_profile']=p.ref(pp);spec.update(bundle_authoring_mode='INLINE_ONLY',required_delivery_role_manifest=p.ref(mp),bundle_profile_binding_required=True)
    fragment.validate_packet(spec);p.put(folder/'prepared-stage.json',spec)
    return p.ref(folder/'prepared-stage.json'),{'job_id':job,'arm':spec['arm'],'stage':spec['stage'],'source_original_stage_ref':old_ref,
      'Task_ref':p.ref(task),'native_source_pin':pin,'runtime_source_pins':native['runtime_source_pins'],'tools_source_pin':v.TOOLS,'ops_marker':v.MARKERS[int(B)],
      'source_cap_role_fields':{k:old.get(k) for k in p.INVARIANTS},'clock_constructor':integration['task_constructor']['source'],
      'clock_fragment':p.ref(clock),'inline_only_profile':spec['glm_resource']['bundle_profile'],'reserved_dynamic_index':'inputs/prior_file_index.json',
      'future_actual_import_index_clock_profile_hashes':None,'no_new_tool_or_permission':True}

def prepare():
    p.checked(POLICY);p.checked(RECOMMENDATION);p.checked(CARRIER_QUALIFICATION);p.checked(CARRIER_PROOF);original=p.checked(ELIGIBILITY);current=p.checked(CURRENT);parents=p.checked(PARENTS);p.checked(NORMALIZER);positive_four_parents(parents)
    if len(original['rows'])!=19 or any(r['native_goal_starts']!=0 for r in original['rows']):raise ValueError('Exact frozen19 unentered source descriptors required')
    current_rows=current.get('rows',current.get('eligible_rows',[]));current_by={r['job_id']:r for r in current_rows}
    blocked_by={r['job_id']:r for r in current.get('excluded_blocked_rows',[])}
    groups={};overlays=[]
    for row in original['rows']:
        source_ref={'path':row['prepared_stage_json'],'sha256':row['prepared_stage_sha256']};old=p.checked(source_ref)
        ref,closure=configure(source_ref,{'path':row['card_path'],'sha256':row['card_sha256']},ROOT/'existing'/row['pair_id']/row['job_id'],row['job_id'],row['pair_id'])
        owner=p.checked(row['owner_registration']);registered=next(r for r in owner['stage_jobs'] if r['job_id']==row['job_id'])
        entry={'job_id':row['job_id'],'pair_id':row['pair_id'],'arm':row['arm'],'stage':row['stage'],'source_slot':row['source_slot'],
          'navigation_template_ref':ref,'source_original_descriptor_ref':source_ref,'source_registration_ref':row['owner_registration'],
          'source_original_registered_donor_rule':registered,'source_runtime_ref':row['runtime_binding_ready'],
          'source_original_role_constructor_pin':row['role_birth_constructor_pin'],'original_birth_authenticated_input_rule_retained':True,
          'metadata_navigation_changed_after_first_R_disclosed':True,'wholepair_firstR_unentered_claim':False,
          'current_eligibility_recheck_before_selection':True,'initial_native0':True,'new_native_jobs':0,
          'source_current_bound_metadata_ref':current_by.get(row['job_id']),
          'current_parent_blocked':row['job_id'] in blocked_by,'blocked_metadata':blocked_by.get(row['job_id']),
          'birth_condition':'Actual sourceparent complete/quiet and native0NoIntent; C04T blocked parent never starts by this version'}
        overlays.append(entry);groups.setdefault(row['pair_id'],[]).append(closure)
    pair_closures=[]
    for pair,roles in groups.items():
        path=ROOT/'existing'/pair/'DESCENDANT_CLOSURE.json';p.put(path,{'schema':'er9.dec017-paired-descendant-index-closure.v1','pair_id':pair,
          'all_changed_descendant_roles':roles,'all_source_choices_closed_before_either_changed_descendant_Goal':True,
          'source_first_R_already_entered_possible':True,'index_metadata_behavior_effect':'UNKNOWN; prospective disclosed mechanical navigation version',
          'old_source_science_model_runtime_caps_clocks_preserved':True,'new_jobs':0});pair_closures.append(p.ref(path))
    contract={'schema':'er9.dec017-fixed-four-final-parent-binding.v1','policy_ref':POLICY,'fixed_parent_selection_ref':PARENTS,
      'validator_ref':p.ref(ROOT/'four_final_binder.py'),'index_constructor':p.ref(ROOT/'prior_index.py'),'index_finalizer':p.ref(ROOT/'finalize_index.py'),
      'fixed_current_eight_parent_roles':parents['rows'],'model_proof_normalizer_pin':NORMALIZER,'no_research_or_critic_rerun':True,'no_evaluator_or_otherarm_inputs':True}
    p.put(ROOT/'FOUR_FINAL_ROLE_CONTRACT.json',contract);cref=p.ref(ROOT/'FOUR_FINAL_ROLE_CONTRACT.json');requests=[];four=[]
    for slot in ['C-01','C-02']:
        source_targets=[r for r in parents['rows'] if r['source_slot']==slot];newpair=slot+'-OWN-PRIOR-INDEX-FINAL-R001';rows=[];cls=[]
        source=p.checked(source_targets[0]['source_registration_ref']);card=p.checked(source_targets[0]['card_ref']);newcard=copy.deepcopy(card)
        newcard.update(pair_id=newpair,source_pair_id=source['pair_id'],card_version='DEC017-final-only-navigation-diagnostic-r001',new_research_roles=0,new_critic_roles=0,
          new_native_role_scope='Exactly one600 final perarm from own current COMPLETE R+critic, repeated final costs retained')
        cardpath=ROOT/'four-finals'/newpair/'card.json';p.put(cardpath,newcard)
        for target in source_targets:
            job=newpair+'-'+target['arm']+'-revision-a001';ref,closure=configure(target['source_prepared_final_ref'],target['card_ref'],ROOT/'four-finals'/newpair/job,job,newpair,True)
            spec=p.checked(ref);spec.update(fixed_final_parent_contract=cref,fixed_final_parent_origin_job_ids=[r['job_id'] for r in target['parents']],
              no_research_or_critic_rerun=True,source_new_final_diagnostic=True,extra_logical_target_or_clean_unrepaired_credit=False)
            # New owned descriptor update before any final source seal/admission.
            path=Path(ref['path']);path.write_text(json.dumps(spec,indent=2,sort_keys=True)+'\n');ref=p.ref(path)
            cls.append(closure);four.append(job)
            rows.append({'job_id':job,'arm':target['arm'],'stage':'revision','stage_index':2,'max_seconds':600,'max_responses':60,'pipeline_final':True,
              'stage_json':ref['path'],'stage_sha256':ref['sha256'],'expected_freeze':spec['freeze_out'],'execution_enabled':spec['glm_resource']['execution_enabled'],
              'public_get':spec['glm_resource']['public_get'],'prerequisite_job_ids':[],'all_same_arm_prior_job_ids':spec['fixed_final_parent_origin_job_ids'],
              'source_role_freezes_required':[r['freeze_ref'] for r in target['parents']],'fixed_final_parent_contract':cref,
              'runtime_ref':closure['ops_marker'],'status':'SOURCE_PREPARED_NATIVE0_AWAITING_EXACT_PARENT_INDEX_BIRTH'})
        path=cardpath.parent/'PIPELINE_CLOSURE.json';p.put(path,{'schema':'er9.dec017-both-final-only-navigation-closure.v1','pair_id':newpair,'policy_ref':POLICY,
          'fixed_parents':source_targets,'all_roles':cls,'all_four_extra_final_choices_frozen_together_required':True,'new_R_or_critic_roles':0,
          'repeated_final_costs_retained':True,'no_clean_unrepaired_or_extra_target_credit':True,'metadata_navigation_effect':'UNKNOWN'})
        reg=copy.deepcopy(source);reg.update(request_id=newpair+'-r001',pair_id=newpair,source_pair_id=source['pair_id'],source_slot=slot,card_path=str(cardpath),card_sha256=p.sha(cardpath),
          stage_jobs=rows,pipeline_closure=p.ref(path),immutable_pair_input_freeze=p.ref(path),policy_ref=POLICY,fixed_final_parent_contract=cref,
          track='DEC017_FOUR_FINAL_ONLY_NAVIGATION_DIAGNOSTIC',scientific_recovery_mode='same_current_R_critic_final_only_repeated_cost_diagnostic',
          source_role_imports=source_targets,native_starts=0,automatic_retry=False,new_research_roles=0,new_critic_roles=0,
          extra_logical_target_matched_credit=False,clean_unrepaired_comparison_claim=False,prior_lineages_costs_failures_grades_retained=True,
          root_or_max_go_required=False,root_scope_required=False,supersedes_pending_stage_job_ids=[],status='SOURCE_READY_PENDING_OPS_EXACT_INDEX_BIRTH')
        p.put(cardpath.parent/'registration.json',reg);requests.append(p.ref(cardpath.parent/'registration.json'))
    p.put(ROOT/'ALL_SOURCE_CLOSURE.json',{'schema':'er9.dec017-all-navigation-source-closure.v1','policy_ref':POLICY,
      'existing_pair_descendant_closures':pair_closures,'new_four_final_registrations':requests,'all_four_new_final_source_choices_before_ANY_one_Goal':True,
      'exact_existing_descriptor_count':19,'current_parent_blocked_rows_not_admitted':True,'new_native_role_count':4,'source_native_calls':0})
    p.put(ROOT/'OUTBOX.json',{'schema':'er9.dec017-own-prior-navigation-source-outbox.v1','policy_ref':POLICY,'recommendation_ref':RECOMMENDATION,
      'eligibility_ref':ELIGIBILITY,'current_eligibility_ref':CURRENT,'existing_descendant_overlays':overlays,'existing_descriptor_count':19,
      'current_eligible_existing_count':len(current_rows),'current_blocked_existing_count':len(blocked_by),
      'existing_overlay_additional_jobs':0,'four_final_requests':requests,'four_new_final_job_ids':four,'new_native_role_count':4,
      'new_final_seconds_each':600,'new_final_native_action_seconds':570,'new_final_max_responses':60,'new_total_seconds':2400,
      'all_source_closure':p.ref(ROOT/'ALL_SOURCE_CLOSURE.json'),'fixed_final_parent_contract':cref,
      'index_constructor_ref':p.ref(ROOT/'prior_index.py'),'index_finalizer_ref':p.ref(ROOT/'finalize_index.py'),'source_locator_ref':p.ref(ROOT/'locator.py'),
      'existing_bound_adapter_ref':p.ref(ROOT/'existing_bound_binder.py'),'existing_carrier_qualification':CARRIER_QUALIFICATION,'existing_carrier_proof':CARRIER_PROOF,
      'existing_original_dynamic_h_hydrate_then_exact_actual_profile_manifest_SHA_preserved':True,
      'actual_future_index_input_sha256':None,'index_only_after_actual_authorized_imports_before_original_native_Goal':True,
      'native_model_Goal_calls':0,'new_research_or_critic_runs':0,'extra_logical_target_or_clean_unrepaired_credit':False,
      'automatic_repeat':False,'no_invisible_causal_neutrality_guarantee':True,'tool_schema_permissions_and_INLINE_ONLY_unchanged':True,
      'admission':'Sole ops current native0NoIntent/parent complete+quiet/sourceclosure/private/capacity/growth/reserve checks; C04T blocked remains blocked; no Go'})
    print(json.dumps(p.ref(ROOT/'OUTBOX.json')))

if __name__=='__main__':prepare()

#!/usr/bin/env python3
"""Freeze six genuine diagnostic DAGs and five finite input-role successors.

No native start, dispatcher/state mutation, source judgment, or candidate-body
decoding. Exact source/card bytes and approved generic role constructors only.
"""
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
LAB = ROOT.parents[2]
RUNNER = ROOT.parent
sys.path[:0] = [str(RUNNER), str(RUNNER/'seed-recovery'), str(RUNNER/'resource-successors-001')]
import prepare as p
import plan_seeded as source_plan
import bind_imported_v4 as imported
import prepare_continuations as continuation
import prepare_successors as resources
import prepare_bundle_transport as transport
import build_imports as captures

SELECTED = {
 'path': str(LAB/'ops/dispatcher/DEFERRED_SIX_SELECTED_FAMILY_BINDINGS_001.json'),
 'sha256': '8cc99adb71e8764c1d4e2fe2c8e4511b2fa217d86a4246b2e1b4030acf0717a8'}
SEED_STATUS = {
 'path': str(LAB/'ops/dispatcher/SEED_ROLE_STATUS_METADATA_20261006T0240.json'),
 'sha256': 'cef65177178d7fa452aa2b62a22075cdd082c3a957212e9167afb83fd3a62f8a'}
FAMILY_CERTIFICATE = {
 'path': str(RUNNER/'resource-successors-001/DEFERRED_SIX_FAMILY_SOURCE_CERTIFICATE_001.json'),
 'sha256': '288c5fd00c7cd160f6731f02d9ebdd68ec2a2c290f50f9430083cc9f8736dbdd'}
LUNA_CORE = {'path': str(LAB/'dev/luna-route/versions/v1.3/PIN.json'),
 'sha256': '721c86a4d742d821ae05d5d910158372f1beb22e65abcee1565ff9c0e1b54227'}
LUNA_BUNDLE = {'path': str(LAB/'dev/luna-route/versions/v1.4-bundle/PIN.json'),
 'sha256': 'f1f0ad061b347ac24a4b8e678f60a6d697e35b98cabcb63c1018817b0372edfa'}
TOOLS_CORE = {'path': str(LAB/'dev/tools/versions/v1.3/SOURCE_PINS.json'),
 'sha256': 'c5f30811d2883e430da963cf8cd539f84a267e3ae19127e791e6c19bde0de621'}
TOOLS_BUNDLE = {'path': str(LAB/'dev/tools/versions/v1.4-bundle/SOURCE_PINS.json'),
 'sha256': '8562c561882e546bb8ecb85c56744c3aae8c81b68cb4897921f851f0515ca7e2'}
OPS_WORKER = {'path': str(LAB/'ops/dispatcher/luna_worker_v6.py'),
 'sha256': 'd3b0ffe7665017116bf2febbb03e7a493ab7b28e6ea53c148ce6e5d6e5349524'}
OPS_READY = {'path': str(LAB/'ops/dispatcher/LUNA_V1_4_READY.json'),
 'sha256': 'dc5c5ccc61f59067bf67fb5f52002a5ee5257181efdf58f69da1feea37e083d0'}
B_EXISTING_STAGE = {'path': str(LAB/'ops/dispatcher/runs/SEED-DEV-B-FIXED-BASE-enrichment-s002/stage.json'),
 'sha256': '156841c11c2470351cb3359b9eaec30875dd23d4d60367da565ce10d7c2e6fe8'}
SLOTS = ['D-V05-A','D-V05-B','D-V06-A','D-V06-B','D-V13-A','D-V13-B']
CATALOGS = ('source_catalog','witness_catalog','lead_inventory')
SOURCE_STAGES = [('A','critique',600), ('A','revision',450),
                 ('A','enrichment',900), ('B','critique',600), ('B','revision',450)]
FINAL = transport.FINAL_PATHS

def ref(path): return {'path': str(Path(path).absolute()), 'sha256': p.sha(path)}
def checked(r):
    path=p.regular(r['path'])
    if p.sha(path)!=r['sha256']: raise ValueError('Pinned bytes changed: '+str(path))
    return json.loads(path.read_text())
def put(path, value): p.put(path,value)
def load_module(path,name):
    spec=importlib.util.spec_from_file_location(name,path)
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result);return result
def clone(source, destination, expected=None):
    source=p.regular(source)
    if expected and p.sha(source)!=expected: raise ValueError('Opaque input drift')
    destination=Path(destination)
    if destination.exists(): raise ValueError('Immutable destination exists: '+str(destination))
    destination.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,destination)
    return p.sha(destination)
def source_job(domain,stage): return f'SEED-DEV-{domain}-DEFERRED-R001-seed-{stage}-a001'

def validate_source_versions():
    for r in [SELECTED,SEED_STATUS,FAMILY_CERTIFICATE,LUNA_CORE,LUNA_BUNDLE,
              TOOLS_CORE,TOOLS_BUNDLE,OPS_READY]: checked(r)
    if p.sha(p.regular(OPS_WORKER['path']))!=OPS_WORKER['sha256']: raise ValueError('Ops worker changed')
    for pin_ref, tools_ref in [(LUNA_CORE,TOOLS_CORE),(LUNA_BUNDLE,TOOLS_BUNDLE)]:
        pin=checked(pin_ref);tools=checked(tools_ref)
        if pin['tools_source_pins_sha256']!=tools_ref['sha256']: raise ValueError('Source/tool pair mismatch')
        for name,digest in pin['version_files'].items():
            if p.sha(p.regular(LAB/'dev/luna-route'/name))!=digest: raise ValueError('Native source drift: '+name)
        for name,digest in tools['files'].items():
            if p.sha(p.regular(Path(tools_ref['path']).parent/name))!=digest: raise ValueError('Tool source drift: '+name)
    return checked(SELECTED),checked(SEED_STATUS)

def binding(bundle=False):
    result=resources.binding('L')
    result['source_pin']=LUNA_BUNDLE if bundle else LUNA_CORE
    result['tools_source_pins']=TOOLS_BUNDLE if bundle else TOOLS_CORE
    result['native_stage_runner']=str(LAB/'dev/luna-route/versions'/('v1.4-bundle' if bundle else 'v1.3')/'dynamic_stage_runner.py')
    result['native_runner_ref']=ref(result['native_stage_runner'])
    result['tools_config_constructor']=ref(Path(result['tools_source_pins']['path']).parent/'config.py')
    result['ops_worker_ref']=OPS_WORKER
    result['ops_ready_ref']=OPS_READY
    result['fresh_native_family_model_effort']={'family':'Luna','model':'gpt-6-luna','effort':'max'}
    result['source_birth_rule']='Ops birth clock before allocation/preparation; native stop=total stop-15s; original total stop/caps unchanged.'
    result['tool_allowlist']=['mcp__pm_boundary__read_file','mcp__pm_boundary__write_file',
                             'mcp__pm_boundary__mechanical','mcp__pm_boundary__public_https_get',
                             'mcp__pm_execution__python_execute']
    result['actual_private_resource_profile']='Allocated by ops at actual stage birth, outside inputs/out, with private aggregate/member proof before inference.'
    result['inline_only_bundle']=bundle
    return result

def initial_base_inputs(base, ws, include_roles=None):
    raw,index=imported.source_copies(base)
    names={'source_context/'+Path(k).name: v for k,v in raw.items()}
    for role in (include_roles if include_roles is not None else base['candidate_files']):
        item=base['candidate_files'][role]
        names['seed/'+role+Path(item['path']).suffix]=Path(item['path'])
    pins={}
    for name,original in names.items():
        dst=ws/'inputs'/name; pins[str(dst)]=clone(original,dst)
    index_path=ws/'inputs/source_context/index.json'
    put(index_path,{'schema':'er9.candidate-source-index.v1','sources':index})
    pins[str(index_path)]=p.sha(index_path)
    return pins

def existing_b_dependency(base_ref, status):
    base=checked(base_ref);imported.verify(base)
    observed=next(x for x in status['rows'] if x['job_id']=='SEED-DEV-B-FIXED-BASE-enrichment-s002')
    freeze=checked(observed['freeze_ref']);spec=checked(B_EXISTING_STAGE)
    if observed['status']!='COMPLETED' or freeze['operational_complete'] is not True or freeze['native_quiescent'] is not True:
        raise ValueError('B native completed dependency prerequisite absent')
    if not {x['sha256'] for x in base['candidate_files'].values()} <= set(spec['input_pins'].values()):
        raise ValueError('B source role lacked exact fixed base')
    item=next(x for x in freeze['artifacts'] if x['relative_path']=='seed/dependencies.json')
    result=copy.deepcopy(base)
    result['candidate_files']['dependencies']={'path':item['path'],'sha256':item['sha256'],
        'origin_job_id':freeze['job_id'],'original_relative_path':item['relative_path'],'bytes':item['bytes']}
    receipt=checked(observed['native_receipt'])
    identity=receipt['identity']
    result['origin_freezes'].append({**observed['freeze_ref'],'actual_family':'Luna',
        'actual_model':identity['model'],'actual_effort':identity['effort'],'native_receipt':observed['native_receipt']})
    result['cold_cost_references'].append({'job_id':freeze['job_id'],'native_receipt':observed['native_receipt'],
        'original_native_goal_starts':freeze['native_goal_starts'],'original_elapsed_seconds':freeze['elapsed_seconds'],
        'reuse_new_native_starts':0,'accounting_rule':'Exact completed cold role charged once; all failed predecessors retain separate original costs.'})
    # Reuse this approved generic opaque capture constructor confined to this lane.
    captures.ROOT=ROOT/'opaque-imports'
    result['public_source_files'].extend(captures.snapshot_captures(freeze['job_id'],spec))
    result.update(base_origin_ref=base_ref,roles_available=list(result['candidate_files']),
                  roles_missing=sorted(imported.ALLOWED-set(result['candidate_files'])),
                  added_authentic_role_origins=[freeze['job_id']],mechanical_extension_new_native_starts=0,
                  source_grade_used_for_selection=False)
    imported.verify(result)
    path=ROOT/'inputs/B_DEPENDENCY_NATIVE_IMPORT.json';put(path,result)
    put(ROOT/'B_DEPENDENCY_IMPORT_CHECK.json',{'schema':'er9.native-role-import-check.v1',
        'base_ref':base_ref,'origin_freeze_ref':observed['freeze_ref'],
        'native_receipt_ref':observed['native_receipt'],'actual_stage_ref':B_EXISTING_STAGE,
        'actual_required_role':'seed/dependencies.json','role_sha256':item['sha256'],
        'status':'EXACT_NATIVE_COMPLETE_QUIET_PROVENANCE_VERIFIED',
        'semantic_suitability':'UNASSESSED_PER_FACET','quality_selection':False,'new_native_starts':0})
    return ref(path)

def source_tasks(bases, common_ref, status):
    jobs=[];requests=[];source_card=ROOT/'SOURCE_PREREQUISITE_CARD.json'
    put(source_card,{'schema':'er9.finite-fixed-base-role-continuations.v3',
        'case_id':'ER9-DEFERRED-SHARED-SEED-001','candidate_family':'Luna','requested_family':'Luna',
        'requested_model':'GPT-6 Luna','requested_effort':'Max','requested_route':'fresh standalone native Codex /goal',
        'stages':[{'domain':d,'stage':s,'max_seconds':t,'job_id':source_job(d,s)} for d,s,t in SOURCE_STAGES],
        'source_roles_only':True,'scored_comparison':False,'count_in_diagnostic_denominator':False,
        'old_seed_status_metadata_ref':SEED_STATUS,'bases':bases,
        'maximum_occupied_candidate_seconds':3000,'automatic_expansion':False,
        'reason':'Both old critics produced no role; revision never started. A dependencies origin failed native completion; B exact completed dependencies reused separately.'})
    for domain,stage,seconds in SOURCE_STAGES:
        base=checked(bases[domain]);imported.verify(base)
        job_id=source_job(domain,stage);pair=f'SEED-DEV-{domain}-DEFERRED-R001'
        run=ROOT/'source-prerequisites'/job_id;ws=run/'workspace';(ws/'out').mkdir(parents=True)
        pins=initial_base_inputs(base,ws)
        brief=LAB/'cases/briefs'/('development-A-biomedical.md' if domain=='A' else 'development-B-notebook.md')
        pins[str(ws/'inputs/brief.md')]=clone(brief,ws/'inputs/brief.md')
        required=source_plan.artifact_paths(stage)
        deps=[source_job(domain,'critique')] if stage=='revision' else []
        instruction=next(x[3] for x in source_plan.steps if x[0]==stage)
        if stage=='enrichment': instruction=instruction.replace('Investigate additional source-backed mechanism questions','Within the fixed base/source context, investigate additional source-backed mechanism questions')
        text=continuation.CONTRACT+'\n\n'+brief.read_text()+'\n\n# Assigned current role\n\n'+instruction
        text+='\n\nThe original immutable proposal is inputs/seed/proposal.md; all complete original catalogs and public captures are attached. Read inputs/source_context/index.json for exact source navigation. No other source selection, fact, or expected answer is supplied.\n'
        if deps: text+='\nBefore this revision starts the exact genuine completed critic '+deps[0]+' is attached under inputs/prior/ with its frozen artifacts and all its public captures. No missing predecessor is invented.\n'
        text+='\n# Current stage output scope\n\n'+'\n'.join('- '+x for x in required)+'\n\nThis unscored role retains all original finite clocks and failure costs. All case interpretation and bytes are your native candidate work. No later role is awaited.\n'
        task=ws/'TASK.md';put(task,text)
        freeze=run/'FIXED_BASE_INPUT_FREEZE.json'
        old_rows=[x for x in status['rows'] if x['pair_id'].startswith('SEED-DEV-'+domain)]
        put(freeze,{'schema':'er9.fixed-base-role-continuation-inputs.v2','domain':domain,
            'base_manifest':bases[domain],'base_content_digest':imported.digest(base),'old_seed_status_metadata':SEED_STATUS,
            'old_job_ids_and_statuses':[{'job_id':x['job_id'],'status':x['status'],'freeze_ref':x.get('freeze_ref'),
                                       'native_receipt':x.get('native_receipt'),'economic_metadata':x['economic_metadata']} for x in old_rows],
            'candidate_card_ref':ref(source_card),'resource_binding':common_ref,
            'original_failed_and_blocked_bytes_costs_unchanged':True,'quality_cherry_picking':False})
        spec={'job_id':job_id,'pair_id':pair,'arm':'seed','stage':stage,'native_family':'L',
            'workspace':str(ws),'prompt_file':str(task),'prompt_sha256':p.sha(task),
            'out':str(run/'native'),'freeze_out':str(run/'OUTPUT_FREEZE.json'),
            'max_seconds':seconds,'max_responses':None,'requested_parent_response_cap':None,
            'response_cap_enforcement':'UNSUPPORTED_ROOT_PROSPECTIVE_WALL_BUDGET_RULING',
            'input_pins':pins,'required_artifacts':required,'pair_freeze':ref(freeze),
            'tools_config':None,'tools_config_sha256':None,'runtime_binding_required':True,
            'candidate_seed_development':True,'scored_research':False,
            'execution_enabled':True,'public_get':True,'required_common_resource_binding':common_ref,
            'required_resource_contract':checked(common_ref)['resource_contract'],
            'prior_binding_required':bool(deps),'source_role_binding_required':False,
            'birth_binding_constructor_ref':ref(ROOT/'bind_at_birth.py')}
        sp=run/'prepared-stage.json';put(sp,spec)
        row={'job_id':job_id,'arm':'seed','stage':stage,'stage_index':{'critique':0,'revision':1,'enrichment':2}[stage],
            'native_goal':True,'fresh_standalone_thread':True,'candidate_family':'Luna','requested_family':'Luna',
            'requested_model':'GPT-6 Luna','requested_effort':'Max','max_seconds':seconds,'max_responses':None,
            'prerequisite_job_ids':deps,'all_same_arm_prior_job_ids':deps,
            'stage_json':str(sp),'stage_sha256':p.sha(sp),'expected_freeze':spec['freeze_out'],
            'required_artifacts':required,'execution_enabled':True,'public_get':True,'pipeline_final':False,
            'candidate_seed_development':True,'scored_comparison':False,'count_in_diagnostic_denominator':False,
            'runtime_binding_required':True,'prior_binding_required':bool(deps),'source_role_binding_required':False,
            'birth_binding_constructor_ref':ref(ROOT/'bind_at_birth.py'),
            'status':'AWAITING_GENUINE_CRITIQUE_AT_BIRTH' if deps else 'PREPARED_NOT_ADMITTED',
            'resource_binding':common_ref,'base_manifest_ref':bases[domain],
            'original_source_role_lineage':f'SEED-DEV-{domain}-FIXED-BASE-{stage}-s002','automatic_retry':False}
        jobs.append(row)
    for domain in 'AB':
        rows=[r for r in jobs if f'SEED-DEV-{domain}-' in r['job_id']]
        reg={'schema':'er9.dispatch-registration.v1','request_id':f'SEED-DEV-{domain}-DEFERRED-R001-r001',
            'pair_id':f'SEED-DEV-{domain}-DEFERRED-R001','source_slot':f'SEED-DEV-{domain}',
            'family':'L','candidate_family':'Luna','requested_family':'Luna','requested_model':'GPT-6 Luna','requested_effort':'Max',
            'card_path':str(source_card),'card_sha256':p.sha(source_card),'resource_binding':common_ref,
            'stage_jobs':rows,'candidate_seed_development':True,'scored_comparison':False,
            'count_in_diagnostic_denominator':False,'root_scope_required':True,'admission_owner':'codex-er9-ops',
            'automatic_retry':False,'cold_cost_charged_separately':True,'base_manifest':bases[domain],
            'old_seed_status_metadata_ref':SEED_STATUS,'original_failed_status_and_costs_unchanged':True,
            'status':'PREPARED_NOT_ADMITTED','native_starts':0}
        path=ROOT/'registration'/(reg['request_id']+'.json');put(path,reg);requests.append(ref(path))
    return jobs,requests

def bundle_profile(spec,card):
    module=load_module(LAB/'dev/tools/versions/v1.4-bundle/operator_binding.py','deferred_operator_binding')
    result=module.binding(stage_id=spec['job_id'],stage_role=spec['stage'],case_id=card['case_id'],
        arm_id=spec['arm'],method_factors=[card['method_id']],
        actor_binding={'stage_id':spec['job_id'],'family':'Luna','model':'gpt-6-luna','effort':'max',
                       'native_goal_id':None,'writer_alias':'write_text'},entries=[],complete_final_role=True)
    manifest=Path(spec['workspace'])/'inputs/delivery_role_manifest.json';manifest.write_bytes(result['manifest_bytes'])
    profile=Path(spec['workspace']).parent/'operator-profile/bundle_profile.json'
    profile.parent.mkdir(parents=True);profile.write_bytes(result['profile_bytes']);profile.chmod(0o600)
    module.carrier.load_profile(profile,p.sha(profile))
    if module.carrier.reference_closure(result['profile'],lambda rel:(Path(spec['workspace'])/rel).read_bytes())!={}: raise ValueError('Inline-only closure not empty')
    spec['input_pins'][str(manifest)]=p.sha(manifest)
    spec.update(bundle_profile=ref(profile),additional_native_runner_argv=['--bundle-profile',str(profile)],
        inline_only_bundle=True,dynamic_role_manifest_binding_required=False,bundle_profile_binding_required=False,
        reference_closure_mode='INLINE_ONLY; all four roles explicit text_utf8; no input_id, fallback, host fill or absent-slot adoption')

def pair_tasks(selected,bases,b_dependency_ref,common_core,common_bundle):
    requests=[];pairs=[]
    for chosen in selected['rows']:
        slot=chosen['source_slot'];original=checked(chosen['card'])
        dag_path=RUNNER/'seed-recovery/corrected-dags'/(chosen['selected_pair_id']+'.json')
        dag=checked(ref(dag_path))
        if dag['card_sha256']!=chosen['card']['sha256'] or dag['family']!='L': raise ValueError('Selected source/DAG mismatch')
        resources.model_guard(dag['family'],dag['requested_model'])
        if original['requested_family']!='Luna' or original['requested_effort']!='Max': raise ValueError('Explicit standing identity mismatch')
        pair=chosen['selected_pair_id']+'-DEFERRED-R001';root=ROOT/'pairs'/pair
        card=copy.deepcopy(original);card.update(pair_id=pair,source_pair_id=chosen['selected_pair_id'],
            source_slot=slot,candidate_family='Luna',source_card_ref=chosen['card'],
            prospective_version='deferred-roles-and-frozen-carrier-001',
            selected_family_certificate_ref=SELECTED,
            source_roles_native_only=True,both_v06_bundle_excluded=original['method_id']=='V06')
        cp=root/'card.json';put(cp,card)
        base_ref=bases[original['domain']];base=checked(base_ref);imported.verify(base)
        roles={'V05':['critique','revision'],'V06':['critique'],'V13':['dependencies']}[original['method_id']]
        bindings=[]
        for role in roles:
            if role=='dependencies' and original['domain']=='B':
                bindings.append({'role':role,'existing_native_seed_ref':b_dependency_ref,
                    'required_artifact':'seed/dependencies.json','selection':'exact standing completed provenance, no meaning/grade selection'})
            else:
                stage='enrichment' if role=='dependencies' else role
                bindings.append({'role':role,'job_id':source_job(original['domain'],stage),
                    'required_artifact':'seed/'+({'critique':'critique.md','revision':'revision.md','dependencies':'dependencies.json'}[role]),
                    'actual_output_freeze_ref':None,'status':'PENDING_GENUINE_NATIVE_COMPLETE_QUIET_PROVENANCE'})
        common_inputs={name:ref(LAB/'cases'/name) for name in [original['brief_path'],original['neutral_task_prompt_path'],
            original['common_criteria_path'],original['source_access_path'],'prompts/output_contract.md',*original['arm_modifier_paths'].values()]}
        pf=root/'PAIR_PROSPECTIVE_FREEZE.json'
        native_steps=[x for x in dag['stage_jobs'] if x.get('native_goal')]
        put(pf,{'schema':'er9.deferred-full-pair-prospective-freeze.v1','pair_id':pair,'source_slot':slot,
            'source_card_ref':chosen['card'],'versioned_card_ref':ref(cp),'corrected_dag_ref':ref(dag_path),
            'selected_family_certificate_ref':SELECTED,'source_owner_certificate_ref':FAMILY_CERTIFICATE,
            'common_brief_task_contract_access_criteria_pins':common_inputs,'base_seed_ref':base_ref,
            'source_role_bindings':bindings,'allocation':dag['allocation'],
            'requested_identity':{'family':'Luna','model':'GPT-6 Luna','effort':'Max','route':'fresh standalone native Codex /goal'},
            'core_resource_binding':common_core,'final_resource_binding':common_core if original['method_id']=='V06' else common_bundle,
            'both_v06_bundle_excluded':original['method_id']=='V06',
            'entire_source_and_both_arm_role_DAG_choice_frozen_before_first_native_stage':True,
            'actual_role_bytes_bound_before_first_target_stage':'One immutable pair actual-input seal after complete genuine native prerequisites; same exact seed bytes for both arms.',
            'all_source_capture_policy':'All base and all assigned native source-role captures, no quality/content selection.',
            'source_suitability':'UNASSESSED_PER_FACET; no automatic PASS or fabricated required truth mix.',
            'old_failed_and_held_status_costs_bytes_unchanged':True,'native_starts':0})
        jobs=[];mechanical=[];mapping={r['job_id']:r['job_id'].replace(chosen['selected_pair_id'],pair,1) for r in dag['stage_jobs']}
        for step in dag['stage_jobs']:
            job_id=mapping[step['job_id']]
            if not step.get('native_goal'):
                m=copy.deepcopy(step);m.update(job_id=job_id,prerequisite_job_ids=[mapping[x] for x in step['prerequisite_job_ids']],
                    original_source_step=step,mechanical_constructor_ref=ref(RUNNER/'exact_assembly.py'),
                    original_seed_proposal_ref=base['candidate_files']['proposal'],native_amendment_authorship_required=True,
                    status='PENDING_EXACT_ACTUAL_NATIVE_AMENDMENT',zero_fuzz=True,premium_semantic_rewrite=False)
                mechanical.append(m);continue
            is_bundle=original['method_id']!='V06' and step['required_artifacts']==FINAL
            if step['pipeline_final'] and original['method_id']!='V06' and not is_bundle: raise ValueError('Wrong final role contract')
            sources={}
            raw,index=imported.source_copies(base);sources.update(raw)
            for role in ['proposal',*CATALOGS]:
                item=base['candidate_files'][role];sources['seed/'+role+Path(item['path']).suffix]=Path(item['path'])
            idx=root/'SOURCE_INDEX.json'
            if not idx.exists():put(idx,{'schema':'er9.candidate-source-index.v1','sources':index})
            sources['source_context/index.json']=idx
            instruction=imported.scope(card,step['arm'],step,dag.get('brief_amendment'))
            instruction+='\n\n# Frozen genuine input-role binding\n\nAll '+', '.join(roles)+' roles required by this source card are supplied as exact authentic native bytes before this Goal starts. Do not invent missing roles. All governing captures from the base and those roles remain available. No private suitability/truth map is supplied.\n'
            deps=[mapping[x] for x in step['prerequisite_job_ids']]
            job=p.stage_packet(LAB,ROOT/'pairs',card,cp,step['arm'],step['stage_index'],
                {'stage':step['stage'],'max_native_seconds':step['max_seconds'],'max_parent_responses':step['requested_parent_response_cap']},
                ref(pf),sources=sources,extra_instruction=instruction,required=step['required_artifacts'],prerequisites=deps)
            run=Path(job['stage_json']).parent;spec=checked({'path':job['stage_json'],'sha256':job['stage_sha256']})
            # The original prepared template remains immutable; this adds a new exact prospective closure version.
            current_task=run/'workspace/TASK.current.md'
            suffix=transport.addendum(job_id) if is_bundle else ''
            put(current_task,Path(spec['prompt_file']).read_text()+suffix)
            spec.update(prompt_file=str(current_task),prompt_sha256=p.sha(current_task),native_family='L',
                execution_enabled=True,public_get=True,required_common_resource_binding=common_bundle if is_bundle else common_core,
                required_resource_contract=checked(common_core)['resource_contract'],
                source_role_binding_required=True,source_role_bindings=bindings,base_seed_manifest_ref=base_ref,
                source_card_ref=chosen['card'],versioned_card_ref=ref(cp),
                prior_binding_required=bool(deps),prerequisite_job_ids=deps,
                all_same_arm_prior_job_ids=deps,birth_binding_constructor_ref=ref(ROOT/'bind_at_birth.py'),
                pair_actual_inputs_required=True,source_suitability_status='UNASSESSED_PER_FACET')
            if is_bundle:bundle_profile(spec,card)
            sp=run/'prospective-stage.json';put(sp,spec)
            job.update(stage_json=str(sp),stage_sha256=p.sha(sp),native_goal=True,fresh_standalone_thread=True,
                candidate_family='Luna',requested_family='Luna',requested_model='GPT-6 Luna',requested_effort='Max',
                required_artifacts=step['required_artifacts'],source_job_id=step['job_id'],
                all_same_arm_prior_job_ids=deps,source_role_binding_required=True,source_role_bindings=bindings,
                prior_binding_required=bool(deps),birth_binding_constructor_ref=ref(ROOT/'bind_at_birth.py'),
                resource_binding=common_bundle if is_bundle else common_core,inline_only_bundle=is_bundle,
                both_v06_bundle_excluded=original['method_id']=='V06',
                pipeline_final=step['pipeline_final'],status='AWAITING_EXACT_GENUINE_NATIVE_SOURCE_ROLES',
                original_source_step=step)
            jobs.append(job)
        reg={'schema':'er9.dispatch-registration.v1','request_id':pair+'-r001','pair_id':pair,'source_slot':slot,
            'family':'L','candidate_family':'Luna','requested_family':'Luna','requested_model':'GPT-6 Luna','requested_effort':'Max',
            'card_path':str(cp),'card_sha256':p.sha(cp),'source_scientific_card_refs':[chosen['card']],
            'resource_binding':common_core,'stage_resource_bindings_frozen':True,
            'stage_jobs':jobs,'mechanical_stages':mechanical,'source_role_bindings':bindings,
            'immutable_pair_input_freeze':ref(pf),'pair_actual_inputs_required':True,
            'pair_actual_input_constructor_ref':ref(ROOT/'bind_at_birth.py'),
            'root_scope_required':True,'admission_owner':'codex-er9-ops','automatic_retry':False,
            'scientific_recovery_mode':'wholly_unstarted_pair','status':'AWAITING_GENUINE_NATIVE_SOURCE_ROLES',
            'original_attempts_and_costs_preserved':True,'no_candidate_answers_or_evaluation_supplied':True,
            'fixture_suitability':'UNASSESSED_PER_FACET; genuine required roles remain runtime prerequisites',
            'cold_cost_metadata_ref':SEED_STATUS,'native_starts':0}
        rp=root/'registration.json';put(rp,reg);requests.append(ref(rp))
        pairs.append({'source_slot':slot,'pair_id':pair,'registration_ref':ref(rp),
                      'native_target_stages':len(jobs),'mechanical_stages':len(mechanical)})
    return pairs,requests

def prepare():
    selected,status=validate_source_versions()
    if [x['source_slot'] for x in selected['rows']]!=SLOTS: raise ValueError('Exact six source slots required')
    bases=checked(ref(RUNNER/'seed-recovery/BASE_IMPORT_OUTBOX.json'))['bases']
    put(ROOT/'CORE_RESOURCE_BINDING.json',binding(False));core=ref(ROOT/'CORE_RESOURCE_BINDING.json')
    put(ROOT/'FINAL_RESOURCE_BINDING.json',binding(True));bundle=ref(ROOT/'FINAL_RESOURCE_BINDING.json')
    b_dependency=existing_b_dependency(bases['B'],status)
    source_jobs,source_requests=source_tasks(bases,core,status)
    pairs,pair_requests=pair_tasks(selected,bases,b_dependency,core,bundle)
    put(ROOT/'FULL_QUEUE_FREEZE.json',{'schema':'er9.six-deferred-targets-full-queue-freeze.v1',
        'authority_handoff_ref':ref(LAB/'input/ER9/ER9_EXECUTE_HANDOFF.md'),
        'selected_family_ref':SELECTED,'source_seed_status_ref':SEED_STATUS,'source_owner_certificate_ref':FAMILY_CERTIFICATE,
        'source_prerequisite_jobs':source_jobs,'matched_pairs':pairs,'new_native_prerequisite_jobs':5,
        'native_target_stages':14,'mechanical_assembly_stages':2,'matched_comparisons':6,
        'maximum_new_source_occupied_seconds':3000,'target_occupied_seconds_per_arm':600,
        'target_occupied_seconds_all_arms':7200,'automatic_queue_expansion':False,
        'all_source_runtime_provenance_and_method_choices_frozen_before_either_first_native_stage':True,
        'prepared_descriptors_not_execution_credit':True,'all_original_32_target_denominator_preserved_by_parent':True,
        'actual_future_source_bytes_hashes_and_goal_ids_not_invented':True,'old_failed_held_costs_bytes_grades_unchanged':True,
        'native_starts':0,'scored_source_facts_or_expected_answers_from_Sol':False})
    put(ROOT/'OUTBOX.json',{'schema':'er9.deferred-target-source-and-dispatch-outbox.v1',
        'requests':source_requests+pair_requests,'source_prerequisite_requests':source_requests,
        'matched_pair_requests':pair_requests,'full_queue_freeze_ref':ref(ROOT/'FULL_QUEUE_FREEZE.json'),
        'native_starts':0,'new_source_prerequisite_jobs':5,'matched_pairs':6,
        'native_target_stages':14,'mechanical_stages':2,'all_future_input_roles_pending_are_explicit':True,
        'status':'PREPARED_NOT_ADMITTED; genuine inputs bound at actual birth before target inference'})
    return ref(ROOT/'OUTBOX.json')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--prepare',action='store_true',required=True)
    args=parser.parse_args();print(json.dumps(prepare()))

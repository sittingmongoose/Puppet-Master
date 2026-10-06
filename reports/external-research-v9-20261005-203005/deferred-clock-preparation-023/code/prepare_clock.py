#!/usr/bin/env python3
"""One finite clock-aware cohort over five unentered original diagnostic pairs.

No failure-output body, source judgment, state scan, model, Goal, native process,
old-file mutation or dispatch. Route/ops must positively pin the actual L1.5
runtime first; exact source/card/Task/input bytes remain opaque and immutable.
"""
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parent
OLD=ROOT.parent
sys.path.insert(0,str(OLD))
import prepare_deferred as d

ELIGIBILITY={'path':str(d.LAB/'ops/dispatcher/DEFERRED_CLOCK_REPAIR_ELIGIBILITY_001.json'),
 'sha256':'41f4057bc7f1b3067070453dca3b702e195c2e4340759525969ae7ac6f941682'}
TOOLS={'path':str(d.LAB/'dev/tools/versions/v1.5-clock-telemetry/SOURCE_PINS.json'),
 'sha256':'abe26402b0156639e4c0a207e5a030db012c5f2d4b5af5d507a95f00eadeb748'}
TOOLS_PIN={'path':str(d.LAB/'dev/tools/versions/v1.5-clock-telemetry/PIN.json'),
 'sha256':'24a65ca50ecd7af66dc0972f059e55c3bfacc40acc5c2c5ca21e44d5445b53fd'}
TOOLS_OUTBOX={'path':str(d.LAB/'dev/tools/versions/v1.5-clock-telemetry/OUTBOX.json'),
 'sha256':'cf7262ae7b6936c004c1f0b5aaaca5cac63a43a47bf125cc365ecf31910f631d'}
DECLARATION={'path':str(d.LAB/'dev/luna-route/versions/v1.5-clock-telemetry/clock_declaration.py'),
 'sha256':'064ce0e114dbe12c7b02bde7d47361f5322c36aeed4cb640b6151a3695546241'}
ELIGIBLE=['D-V05-A','D-V05-B','D-V06-A','D-V06-B','D-V13-A']
SUFFIX='-CLOCK-R002'

def ref(path):return d.ref(path)
def checked(r):return d.checked(r)
def put(path,value):return d.put(path,value)
def load(path,name):return d.load_module(path,name)
def clone(path,target,sha):return d.clone(path,target,sha)

def check_frozen_sources():
    checked(ELIGIBILITY);tool=checked(TOOLS);checked(TOOLS_PIN);checked(TOOLS_OUTBOX)
    if d.p.sha(d.p.regular(DECLARATION['path']))!=DECLARATION['sha256']:raise ValueError('Clock declaration constructor changed')
    for name,sha in tool['files'].items():
        if d.p.sha(d.p.regular(Path(TOOLS['path']).parent/name))!=sha:raise ValueError('Clock tool source drift: '+name)
    route=checked(ref(ROOT/'ACTUAL_ROUTE_BINDING.json'))
    pin=checked(route['native_source_pin_ref']);checked(route['native_outbox_ref'])
    if pin.get('tools_source_pins_sha256')!=TOOLS['sha256']:
        raise ValueError('Actual native runtime does not admit exact clock tools')
    if pin.get('status')!='MECHANICALLY_READY_FOR_ELIGIBLE_FULL_CLOSURE_ONLY':
        raise ValueError('Positive frozen actual native source readiness required')
    if checked(route['native_outbox_ref'])['runtime_pin']!=route['native_source_pin_ref']:
        raise ValueError('Actual source PIN/outbox mismatch')
    for name,sha in pin['source_files'].items():
        path=d.LAB/'dev/luna-route'/name
        if d.p.sha(d.p.regular(path))!=sha:raise ValueError('Actual native source drift: '+name)
    for key in ['ops_worker_ref','ops_ready_ref']:
        r=route[key]
        if d.p.sha(d.p.regular(r['path']))!=r['sha256']:raise ValueError('Ops clock selector drift')
    return route,pin

def original_bytes_unchanged():
    identity=checked(ref(ROOT/'OLD_BYTE_IDENTITY_FREEZE.json'))
    for row in identity['files']:
        if d.p.sha(d.p.regular(row['path']))!=row['sha256']:raise ValueError('Old frozen bytes changed: '+row['path'])
    return len(identity['files'])

def common_binding(bundle):
    route,pin=check_frozen_sources()
    result=copy.deepcopy(checked(ref(OLD/'CORE_RESOURCE_BINDING.json')))
    result.update(source_pin=route['native_source_pin_ref'],tools_source_pins=TOOLS,
        native_stage_runner=str(d.LAB/'dev/luna-route'/pin['entrypoint']),
        native_runner_ref=ref(d.LAB/'dev/luna-route'/pin['entrypoint']),
        tools_config_constructor=ref(Path(TOOLS['path']).parent/'config.py'),
        ops_worker_ref=route['ops_worker_ref'],ops_ready_ref=route['ops_ready_ref'],
        clock_declaration_constructor_ref=DECLARATION,clock_tools_release_pin_ref=TOOLS_PIN,
        clock_field_contract_ref=checked(TOOLS_OUTBOX)['clock_field_contract'],
        initial_native_input_policy='unchanged-scientific-first-text/exact-builder-neutral-clock-second-text/no-goal-objective-append-v1',
        goal_objective_policy='unchanged',clock_behavioral_version='v1.5-clock-telemetry',
        clock_interpretation='Explicit common behavioral intervention; no proven past failure cause/fix or invisible causal neutrality claimed.',
        actual_clock_binding='Original birth/allocation/native action/totalcleanup scalars from actual selected original controller at stage birth; profiles/Task/file/native input hashes before Goal.',
        inline_only_bundle=bundle,bundle_mode='explicit_empty_reference_final4' if bundle else 'off')
    return result

def stage_clone(old_row,old_reg,new_card,new_card_ref,root,mapping,common_ref,pair_ref,
                eligible_row=None,source_roles=None):
    old_spec=checked({'path':old_row['stage_json'],'sha256':old_row['stage_sha256']})
    # Donor actual R4 metadata verifies the old prepared Task and entire input
    # set. No old failure output or fresh source-selection input is used.
    actual_original_ref=None
    if eligible_row is not None and old_row['arm']=='seed':
        actual_original_ref=eligible_row['stage_json_ref'];actual=checked(actual_original_ref)
        if actual['prompt_sha256']!=old_spec['prompt_sha256'] or set(actual['input_pins'].values())!=set(old_spec['input_pins'].values()):
            raise ValueError('Original authenticR4 donor inputs/Task differ')
    job_id=mapping[old_row['job_id']];run=root/job_id;ws=run/'workspace';(ws/'out').mkdir(parents=True)
    pins={}
    for path,sha in old_spec['input_pins'].items():
        relative=Path(path).relative_to(old_spec['workspace'])
        # The old per-stage manifest is mechanically rebound below for a new
        # current stage id, preserving the empty reference selection policy.
        if relative.as_posix()=='inputs/delivery_role_manifest.json':continue
        pins[str(ws/relative)]=clone(path,ws/relative,sha)
    original_task=Path(old_spec['workspace'])/'TASK.md'
    # Old target TASK.md is the immutable scientific prefix; TASK.current.md
    # added only the formerly selected final-transport suffix.
    if old_row['arm']=='seed':original_task=Path(old_spec['prompt_file'])
    scientific=ws/'TASK.scientific.md';clone(original_task,scientific,d.p.sha(original_task))
    predecessors=[mapping[x] for x in old_row['prerequisite_job_ids']]
    aliases={mapping[x]:x for x in old_row['all_same_arm_prior_job_ids']}
    task=ws/'TASK.md';raw=scientific.read_bytes()
    if aliases:
        raw+=('\n\n# Current prospective role-directory identities\n\n'
              'The earlier scientific Task remains authoritative. Its predecessor identifiers are logical input-directory tokens. '
              'The explicit current binding in inputs/role_aliases.json supplies the newly declared genuine completed same-arm/native source role bytes under those logical directories. '
              'The exact current native job identity and original failure remain distinct; no failed old output is supplied or claimed complete.\n').encode()
    is_bundle=bool(old_row.get('inline_only_bundle',False))
    if is_bundle:raw+=d.transport.addendum(job_id).encode()
    put(task,raw.decode('utf-8'))
    decl=load(DECLARATION['path'],'clock_declaration_'+job_id.replace('-','_')).declaration(job_id)
    declaration=run/'clock_declaration.json';put(declaration,decl)
    if (ws/decl['visible_clock_path']).exists():raise ValueError('Runtime STAGE_CLOCK snapshot must not exist at preparation')
    spec=copy.deepcopy(old_spec)
    spec.update(job_id=job_id,pair_id=new_card.get('pair_id',old_reg['pair_id']),workspace=str(ws),
        prompt_file=str(task),prompt_sha256=d.p.sha(task),input_pins=pins,
        out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),
        pair_freeze=pair_ref,versioned_card_ref=new_card_ref,tools_config=None,tools_config_sha256=None,
        runtime_binding_required=True,required_common_resource_binding=common_ref,
        clock_declaration=ref(declaration),clock_declaration_ref=ref(declaration),
        scientific_task_prefix_ref=ref(scientific),original_scientific_task_ref=ref(original_task),
        original_stage_ref={'path':old_row['stage_json'],'sha256':old_row['stage_sha256']},
        original_authentic_r4_actual_stage_ref=actual_original_ref,
        clock_behavioral_version='v1.5-clock-telemetry',
        runtime_generated_clock_file='inputs/STAGE_CLOCK.json',actual_clock_profile_hash_before_birth=None,
        actual_initial_native_clock_text_hash_before_birth=None,actual_new_native_goal_id_before_birth=None,
        initial_native_input_policy=decl['initial_native_input_policy'],goal_objective_policy=decl['goal_objective_policy'],
        birth_binding_constructor_ref=ref(ROOT/'input_binding.py'),
        prerequisite_job_ids=predecessors,all_same_arm_prior_job_ids=predecessors,
        predecessor_aliases=aliases,prior_binding_required=bool(predecessors),
        additional_native_runner_argv=['--clock-declaration',str(declaration),'--clock-declaration-sha256',d.p.sha(declaration)])
    if source_roles is not None:spec['source_role_bindings']=source_roles
    spec.pop('bundle_profile',None)
    if is_bundle:
        operator=load(Path(TOOLS['path']).parent/'operator_binding.py','clock_bundle_operator_'+job_id.replace('-','_'))
        result=operator.binding(stage_id=job_id,stage_role=spec['stage'],case_id=new_card['case_id'],
            arm_id=spec['arm'],method_factors=[new_card['method_id']],
            actor_binding={'stage_id':job_id,'family':'Luna','model':'gpt-6-luna','effort':'max',
                'native_goal_id':None,'writer_alias':'write_text'},entries=[],complete_final_role=True)
        manifest=ws/'inputs/delivery_role_manifest.json';manifest.write_bytes(result['manifest_bytes']);pins[str(manifest)]=d.p.sha(manifest)
        profile=run/'operator-profile/bundle_profile.json';profile.parent.mkdir(parents=True)
        profile.write_bytes(result['profile_bytes']);profile.chmod(0o600)
        operator.carrier.load_profile(profile,d.p.sha(profile))
        spec.update(bundle_profile=ref(profile),inline_only_bundle=True,
            additional_native_runner_argv=spec['additional_native_runner_argv']+['--bundle-profile',str(profile)])
    else:spec['inline_only_bundle']=False
    sp=run/'prepared-stage.json';put(sp,spec)
    row=copy.deepcopy(old_row)
    row.update(job_id=job_id,source_job_id=old_row['job_id'],stage_json=str(sp),stage_sha256=d.p.sha(sp),
        expected_freeze=spec['freeze_out'],resource_binding=common_ref,
        prerequisite_job_ids=predecessors,all_same_arm_prior_job_ids=predecessors,predecessor_aliases=aliases,
        birth_binding_constructor_ref=ref(ROOT/'input_binding.py'),clock_declaration_ref=ref(declaration),
        scientific_task_prefix_ref=ref(scientific),original_scientific_task_ref=ref(original_task),
        original_authentic_r4_actual_stage_ref=actual_original_ref,inline_only_bundle=is_bundle,
        clock_behavioral_version='v1.5-clock-telemetry',
        original_execution_cutoff_metadata_ref=ELIGIBILITY,
        status='PREPARED_NOT_ADMITTED' if not predecessors and old_row['arm']=='seed' else 'AWAITING_GENUINE_CURRENT_NATIVE_INPUTS',
        automatic_retry=False,old_failed_goal_or_blocked_attempt_rewritten=False)
    if source_roles is not None:row['source_role_bindings']=source_roles
    put(run/'PRESERVATION.json',{'schema':'er9.clock-stage-scientific-preservation.v1',
        'source_stage_ref':row['original_stage_ref'] if 'original_stage_ref' in row else {'path':old_row['stage_json'],'sha256':old_row['stage_sha256']},
        'scientific_original_task_ref':ref(original_task),'new_scientific_prefix_ref':ref(scientific),
        'prefix_bytes':scientific.stat().st_size,'original_input_pins':old_spec['input_pins'],
        'all_source_and_seed_input_bytes_retained':True,'new_logical_aliases':aliases,
        'old_native_budget_fields':{k:old_spec[k] for k in ['max_seconds','max_responses','requested_parent_response_cap','required_artifacts']},
        'old_candidate_failure_output_used':False,'source_evaluator_facts_supplied':False,
        'clock_semantics':'Separate neutral initial native text only; original action/cleanup clocks unchanged.'})
    return row

def prepare():
    route,pin=check_frozen_sources();original_bytes_unchanged()
    scope=checked(ref(ROOT/'ELIGIBILITY_SCOPE.json'));elig=checked(ELIGIBILITY)
    proof={r['job_id']:r for r in elig['jobs']}
    old=checked(ref(OLD/'OUTBOX.json'))
    source_regs=[(r,checked(r)) for r in old['source_prerequisite_requests']]
    target_regs=[(r,checked(r)) for r in old['matched_pair_requests']]
    targets=[(r,a) for r,a in target_regs if a['source_slot'] in ELIGIBLE]
    if len(targets)!=5:raise ValueError('Only five exact eligible paired slots')
    for _,reg in targets:
        for row in reg['stage_jobs']:
            observed=proof[row['job_id']]
            if observed['native_goal_starts']!=0 or observed['launch_intent_events']:
                raise ValueError('Entered target cannot change clock/runtime')
    all_rows=[r for _,reg in source_regs+targets for r in reg['stage_jobs']]
    mapping={r['job_id']:r['job_id']+SUFFIX for r in all_rows}
    put(ROOT/'CORE_RESOURCE_BINDING.json',common_binding(False));core=ref(ROOT/'CORE_RESOURCE_BINDING.json')
    put(ROOT/'FINAL_RESOURCE_BINDING.json',common_binding(True));bundle=ref(ROOT/'FINAL_RESOURCE_BINDING.json')
    source_card=copy.deepcopy(checked(ref(OLD/'SOURCE_PREREQUISITE_CARD.json')))
    source_card.update(clock_behavioral_version='v1.5-clock-telemetry',
        clock_source_scope='Three failed native source roles receive one declared clock-aware successor each; two blocked revisions wait for genuine completed new critics.',
        old_source_jobs_preserved_ref=ELIGIBILITY,source_retests=3,previously_blocked_revisions=2,
        active_clock_job_ids=[mapping[x] for x in scope['source_stage_ids']],
        root_authorized_shared_seed_exception=True,failed_source_outputs_supplied=False)
    cp=ROOT/'SOURCE_PREREQUISITE_CARD.json';put(cp,source_card)
    source_requests=[];source_rows=[]
    for old_ref,reg in source_regs:
        domain='A' if reg['source_slot']=='SEED-DEV-A' else 'B'
        root=ROOT/'source-prerequisites'/domain
        pf=root/'SOURCE_INPUT_FREEZE.json';put(pf,{'schema':'er9.clock-source-input-prospective-freeze.v2',
            'card_ref':ref(cp),'original_registration_ref':old_ref,'original_cutoff_ref':ELIGIBILITY,
            'original_base_manifest_ref':reg['base_manifest'],'resource_binding':core,
            'native_job_ids':[mapping[r['job_id']] for r in reg['stage_jobs']],
            'clock_declaration_constructor_ref':DECLARATION,
            'scope':'One finite declared authenticR4 clock-aware source-role version; genuine completion/nativequiet required; no old failure output.'})
        card={**source_card,'pair_id':reg['pair_id']}
        rows=[stage_clone(r,reg,card,ref(cp),root,mapping,core,ref(pf),proof[r['job_id']]) for r in reg['stage_jobs']]
        new=copy.deepcopy(reg);new.update(request_id=reg['request_id']+SUFFIX,
            card_path=str(cp),card_sha256=d.p.sha(cp),stage_jobs=rows,resource_binding=core,
            clock_behavioral_version='v1.5-clock-telemetry',source_registration_ref=old_ref,
            source_exception_scope='Root-authorized shared unscored seed prerequisite role version, finite5/3000s; no clock retrofit or failed native output re-label.',
            supersedes_failed_or_blocked_job_ids=[r['job_id'] for r in reg['stage_jobs']],
            original_execution_cutoff_ref=ELIGIBILITY,original_failed_status_and_costs_unchanged=True,
            no_old_candidate_failure_outputs_or_source_answers_supplied=True,status='PREPARED_NOT_ADMITTED',native_starts=0)
        rp=ROOT/'registration'/(new['request_id']+'.json');put(rp,new)
        source_requests.append(ref(rp));source_rows+=rows
    target_requests=[];target_rows=[];mechanical=[]
    for old_ref,reg in targets:
        old_card=checked({'path':reg['card_path'],'sha256':reg['card_sha256']})
        pair=reg['pair_id']+SUFFIX;root=ROOT/'pairs'/pair
        card=copy.deepcopy(old_card);card.update(pair_id=pair,clock_source_pair_id=reg['pair_id'],
            clock_behavioral_version='v1.5-clock-telemetry',clock_eligibility_ref=ELIGIBILITY,
            old_counterpart_and_failures_preserved=True,clock_factor_note='Common behavioral version across both matched arms; no established cause/fix or causal-neutral guarantee.')
        cp=root/'card.json';put(cp,card)
        roles=copy.deepcopy(reg['source_role_bindings'])
        for role in roles:
            if 'job_id' in role:role['job_id']=mapping[role['job_id']]
        pf=root/'PAIR_PROSPECTIVE_FREEZE.json';old_pf=checked(reg['immutable_pair_input_freeze'])
        updated=copy.deepcopy(old_pf);updated.update(pair_id=pair,versioned_card_ref=ref(cp),
            original_pair_freeze_ref=reg['immutable_pair_input_freeze'],original_registration_ref=old_ref,
            original_cutoff_ref=ELIGIBILITY,source_role_bindings=roles,
            core_resource_binding=core,final_resource_binding=core if card['method_id']=='V06' else bundle,
            clock_declaration_constructor_ref=DECLARATION,clock_behavioral_version='v1.5-clock-telemetry',
            common_clock_native_input_policy='unchanged-scientific-first-text/exact-builder-neutral-clock-second-text/no-goal-objective-append-v1',
            coupled_original_goal_starts=0,coupled_original_launch_intents=0,
            root_source_phase_exception_ref=ref(ROOT/'ELIGIBILITY_SCOPE.json'))
        put(pf,updated)
        rows=[stage_clone(r,reg,card,ref(cp),root,mapping,
            bundle if r.get('inline_only_bundle') else core,ref(pf),proof[r['job_id']],roles) for r in reg['stage_jobs']]
        assemblies=[]
        for step in reg['mechanical_stages']:
            item=copy.deepcopy(step);item.update(job_id=step['job_id']+SUFFIX,
                prerequisite_job_ids=[mapping[x] for x in step['prerequisite_job_ids']],
                original_mechanical_stage=step,premium_semantic_rewrite=False,zero_fuzz=True)
            assemblies.append(item)
        new=copy.deepcopy(reg);new.update(request_id=reg['request_id']+SUFFIX,pair_id=pair,
            card_path=str(cp),card_sha256=d.p.sha(cp),resource_binding=core,stage_jobs=rows,
            mechanical_stages=assemblies,source_role_bindings=roles,immutable_pair_input_freeze=ref(pf),
            pair_actual_input_constructor_ref=ref(ROOT/'input_binding.py'),original_registration_ref=old_ref,
            original_execution_cutoff_ref=ELIGIBILITY,clock_behavioral_version='v1.5-clock-telemetry',
            supersedes_wholly_unentered_job_ids=[r['job_id'] for r in reg['stage_jobs']],
            no_new_hypothesis_or_extra32_credit=True,original_attempts_and_costs_preserved=True,
            status='AWAITING_EXACT_GENUINE_CLOCK_VERSION_SOURCE_ROLES',native_starts=0)
        rp=root/'registration.json';put(rp,new);target_requests.append(ref(rp));target_rows+=rows;mechanical+=assemblies
    if len(source_rows)!=5 or len(target_rows)!=12 or len(mechanical)!=2:raise ValueError('Finite source/target/assembly count changed')
    freeze=ROOT/'FULL_COHORT_FREEZE.json';put(freeze,{'schema':'er9.finite-deferred-clock-full-cohort-freeze.v2',
        'eligibility_scope_ref':ref(ROOT/'ELIGIBILITY_SCOPE.json'),'old_byte_identity_ref':ref(ROOT/'OLD_BYTE_IDENTITY_FREEZE.json'),
        'original_outbox_ref':ref(OLD/'OUTBOX.json'),'actual_route_binding_ref':ref(ROOT/'ACTUAL_ROUTE_BINDING.json'),
        'clock_tools_source_ref':TOOLS,'clock_tools_release_ref':TOOLS_PIN,'clock_declaration_constructor_ref':DECLARATION,
        'eligible_original_source_slots':ELIGIBLE,'source_registration_refs':source_requests,
        'target_registration_refs':target_requests,'allowed_original_stage_ids':[r['job_id'] for r in all_rows],
        'source_stage_jobs':source_rows,'target_stage_jobs':target_rows,'mechanical_stages':mechanical,
        'source_native_jobs':5,'source_retests':3,'previously_blocked_revisions':2,'source_occupied_max_seconds':3000,
        'target_pairs':5,'target_native_jobs':12,'target_occupied_max_seconds':6000,
        'excluded_entered_pair':'D-V13-B-DEFERRED-R001; bothGoal1FAILED; no new successor/native job',
        'full_both_arm_source_runtime_tools_Task_input_and_clock_constructor_choices_frozen_before_any_repair_donor_or_target_goal':True,
        'actual_dynamic_clock_Profile_STAGCLOCK_native_input_Task_hashes':'Only actual original stage birth/preGoal selected constructor; future hashes/Goal ids not invented.',
        'clock_interpretation':'Explicit common behavioral intervention; no proven past failure cause/fix or invisible causal neutrality claimed.',
        'native_model_calls':0,'native_goals':0,'automatic_cohort_expansion':False,'new_hypothesis_or_extra32_credit':False})
    put(ROOT/'OUTBOX.json',{'schema':'er9.deferred-clock-repair-dispatch-outbox.v2',
        'requests':source_requests+target_requests,'source_prerequisite_requests':source_requests,'matched_pair_requests':target_requests,
        'full_cohort_freeze_ref':ref(freeze),'eligibility_scope_ref':ref(ROOT/'ELIGIBILITY_SCOPE.json'),
        'source_jobs':5,'target_pairs':5,'target_native_stages':12,'mechanical_stages':2,
        'clock_behavioral_version':'v1.5-clock-telemetry','native_model_calls':0,'native_goals':0,
        'ops_before_donor_admission':'Recheck exact original coupled Goal0/noIntent plus full frozen native/tool/Task/input/declaration constructor closure; source role retests only within explicit finite shared-seed exception.',
        'old_queue_or_entered_D13B_changed':False,'status':'PREPARED_NOT_ADMITTED'})
    return ref(ROOT/'OUTBOX.json')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--prepare',action='store_true',required=True)
    parser.parse_args();print(json.dumps(prepare()))

#!/usr/bin/env python3
"""One DEC013 source-only new3000 revision over original R4/current A critic.

No old failed revision body, evaluator facts, source interpretation, native
process, model, Goal, state scan or old packet mutation. Opaque byte/provenance
work through the unchanged strict imported-v4/native role guards only.
"""
import copy
import importlib.util
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parent
PARENT=ROOT.parent
OLD=PARENT/'clock-repair-002'
sys.path[:0]=[str(PARENT),str(OLD)]
import prepare_deferred as d
import prepare_clock as clock
birth=d.load_module(PARENT/'bind_at_birth.py','unchanged_dec013_native_byte_guard')

POLICY={'path':str(d.LAB/'supervision/DECISIONS-013-A-SEED-REVISION-RETEST.json'),
 'sha256':'44f8534145cd85af64594ee55e024d23bcd08bd9dc8e6f8569827fe4c568a56c'}
SELECTION={'path':str(d.LAB/'ops/dispatcher/A_REVISION_RETEST_METADATA_003/SELECTION.json'),
 'sha256':'53b140fa5cec7deb4d8ec5841cfbbc8bb534343ce72029f579c6e2702f0d8346'}
NEW_JOB='SEED-DEV-A-DEFERRED-R001-seed-revision-a001-CLOCK-R003-A3000'
SOURCE_PAIR='SEED-DEV-A-DEFERRED-R001'
NEW_SECONDS=3000

def ref(p):return d.ref(p)
def checked(r):return d.checked(r)
def put(p,x):return d.put(p,x)

def controls():
    policy=checked(POLICY);selected=checked(SELECTION)
    if policy['new_native_role_count']!=1 or policy['new_allocation_seconds']!=3000 or policy['old_allocation_seconds']!=450:
        raise ValueError('Exactly one NEW3000 role policy required')
    if policy['response_cap_change'] or policy['automatic_followup_retests_or_campaign']:
        raise ValueError('No cap change or automatic extra role')
    if selected['failed_revision']['owned_quiet_permit_released'] is not True or selected['failed_revision']['outputs_not_supplied_for_new_native_inputs'] is not True:
        raise ValueError('Ended old revision must be quiet and excluded from input')
    if selected['botharm_alltargetGoal0_noIntent_at_observation'] is not True:
        raise ValueError('Both pending target arms must be unentered')
    if len(selected['pending_D05A'])!=3 or {r['arm'] for r in selected['pending_D05A']}!={'control','treatment'} or any(r['native_goal_starts']!=0 for r in selected['pending_D05A']):
        raise ValueError('Exact all-three-stage paired D05A Goal0 metadata required')
    critic=selected['actual_critic']
    if critic['operational_complete'] is not True or critic['owned_quiet_permit_released'] is not True:
        raise ValueError('Exact allowed critic must be complete/owned quiet')
    reg=checked(selected['source_registration_ref'])
    critic_row=next(r for r in reg['stage_jobs'] if r['job_id']==critic['job_id'])
    revision_row=next(r for r in reg['stage_jobs'] if r['stage']=='revision')
    freeze,receipt,identity=birth.native(critic['freeze_ref'],critic['job_id'],SOURCE_PAIR,'seed','critique',critic_row['required_artifacts'])
    base=checked(reg['base_manifest']);d.imported.verify(base)
    actual_spec=birth.actual_spec(critic['stage_ref'],critic['job_id'],base)
    capsule=checked(critic['capsule_ref'])
    rows=[r for r in capsule['rows'] if r['job_id']==critic['job_id']]
    if len(rows)!=1 or rows[0]['output_freeze']!=critic['freeze_ref'] or rows[0]['native_goal_starts']<1:
        raise ValueError('One exact positive native critic capsule required')
    context=checked(critic['closed_source_context_ref'])
    if context['job_id']!=critic['job_id'] or context['output_freeze']!=critic['freeze_ref'] or context['owned_quiet_positive'] is not True:
        raise ValueError('Complete closed critic source context must join this exact native freeze')
    clock.check_frozen_sources()
    marker=checked(checked(ref(OLD/'READY_OUTBOX_002.json'))['actual_operator_marker_ref'])
    route=checked(ref(OLD/'ACTUAL_ROUTE_BINDING.json'))
    if marker['clock_native_pin']!=route['native_source_pin_ref']:
        raise ValueError('Actual L1.5/ops marker mismatch')
    return policy,selected,reg,critic_row,revision_row,base,freeze,receipt,identity,actual_spec

def prepare():
    policy,selected,source_reg,critic_row,old_row,base,freeze,receipt,identity,actual_critic_spec=controls()
    old_spec=checked({'path':old_row['stage_json'],'sha256':old_row['stage_sha256']})
    if old_spec['max_seconds']!=450 or old_spec['max_responses'] is not None:
        raise ValueError('Old450/null response identity must remain')
    # Pin all old002 positive packet bytes. Native/failure bodies are never in
    # that positive selector and are not read, copied or semantically examined.
    old_selector=checked(ref(OLD/'PUBLICATION_SELECTOR_002.json'))
    old_files=[]
    for row in old_selector['files']:
        if d.p.sha(d.p.regular(row['path']))!=row['sha256']:raise ValueError('Old002 packet drift')
        old_files.append({'path':row['path'],'sha256':row['sha256']})
    put(ROOT/'OLD002_BYTE_IDENTITY.json',{'schema':'er9.dec013-old002-byte-identity.v1','files':old_files,
        'original_ready_outbox_ref':ref(OLD/'READY_OUTBOX_002.json'),'failed_revision_output_bodies_read':False})
    common=copy.deepcopy(checked(old_row['resource_binding']))
    common.update(ops_ready_ref=checked(ref(OLD/'READY_OUTBOX_002.json'))['actual_operator_marker_ref'],
        new_source_role_allocation_seconds=3000,old_ended_role_allocation_seconds=450,
        allocation_rule='New original3000-second role birth; no extension/reset/reuse of old450 deadline.',
        root_prospective_scope_policy_ref=POLICY)
    put(ROOT/'RESOURCE_BINDING.json',common);common_ref=ref(ROOT/'RESOURCE_BINDING.json')
    card_path=ROOT/'SOURCE_CARD.json'
    put(card_path,{'schema':'er9.single-unscored-A-revision-retest-card.v1','case_id':'ER9-DEC013-A-REVISION-3000',
        'pair_id':SOURCE_PAIR,'source_slot':'SEED-DEV-A','candidate_family':'Luna','requested_family':'Luna',
        'requested_model':'GPT-6 Luna','requested_effort':'Max','requested_route':'fresh standalone native Codex /goal',
        'native_role_count':1,'stage':'revision','new_original_stage_allocation_seconds':3000,
        'old_ended_allocation_seconds':450,'max_responses':None,'response_cap_unchanged':True,
        'required_artifacts':old_row['required_artifacts'],'original_scientific_task_ref':old_spec['original_scientific_task_ref'],
        'base_manifest_ref':source_reg['base_manifest'],'allowed_current_native_critic_ref':selected['actual_critic'],
        'policy_ref':POLICY,'selection_metadata_ref':SELECTION,'source_quality_or_clock_efficacy':'UNASSESSED',
        'scientific_duties_and_negative_constraints_unchanged':True,'old_revision_outputs_not_supplied':True,
        'scored_comparison':False,'count_in_target_diagnostic_denominator':False,'extra_hypothesis_or_target_credit':False,
        'automatic_repetition':False,'resource_binding_ref':common_ref})
    run=ROOT/NEW_JOB;ws=run/'workspace';(ws/'out').mkdir(parents=True)
    pins={}
    # Exact39 original R4-only inputs from the old frozen pre-critic template.
    for path,sha in old_spec['input_pins'].items():
        target=ws/Path(path).relative_to(old_spec['workspace'])
        pins[str(target)]=d.clone(path,target,sha)
    if len(old_spec['input_pins'])!=39:raise ValueError('Exact original39 input closure required')
    alias=next(iter(old_row['predecessor_aliases'].values()))
    for item in freeze['artifacts']:
        # The full current native critic role is duplicated under the previously
        # frozen logical path, without claiming the old failed job authored it.
        for directory in [selected['actual_critic']['job_id'],alias]:
            target=ws/'inputs/prior'/directory/item['relative_path']
            pins[str(target)]=d.clone(item['path'],target,item['sha256'])
    d.captures.ROOT=ROOT/'opaque-current-critic-captures'
    capture_rows=d.captures.snapshot_captures(selected['actual_critic']['job_id'],actual_critic_spec)
    navigation=[]
    for n,item in enumerate(capture_rows):
        target=ws/'inputs/prior_sources'/selected['actual_critic']['job_id']/(str(n).zfill(4)+'.body')
        pins[str(target)]=d.clone(item['path'],target,item['sha256'])
        navigation.append({'candidate_path':str(target.relative_to(ws)),'url':item['url'],
            'version_or_commit':item['version_or_commit'],'sha256':item['sha256'],
            'capture_limitations':item.get('capture_limitations')})
    nav=ws/'inputs/prior_sources'/selected['actual_critic']['job_id']/'index.json'
    put(nav,{'schema':'er9.candidate-source-index.v1','sources':navigation});pins[str(nav)]=d.p.sha(nav)
    alias_path=ws/'inputs/role_aliases.json'
    put(alias_path,{'schema':'er9.explicit-native-role-directory-aliases.v1','aliases':[
        {'legacy_logical_input_directory_token':alias,'actual_genuine_current_native_job_id':selected['actual_critic']['job_id'],
         'actual_output_freeze_ref':selected['actual_critic']['freeze_ref'],'old_failed_job_output_supplied':False}],
        'selection':'Only the exact authenticated operationally complete current A critic; no source quality selection.'})
    pins[str(alias_path)]=d.p.sha(alias_path)
    scientific=ws/'TASK.scientific.md';d.clone(old_spec['scientific_task_prefix_ref']['path'],scientific,old_spec['scientific_task_prefix_ref']['sha256'])
    task=ws/'TASK.md'
    suffix='''\n\n# NEW prospectively allocated source revision attempt — DEC013\n\nThis is ONE NEW unscored source-role revision attempt with a total allocation of 3000 seconds from its own NEW original role birth. It does not resume, reset or extend the ended 450-second attempt. The fixed original-clock constructor supplies this new role's native action stop and separate cleanup stop in inputs/STAGE_CLOCK.json and the separate initial neutral clock text. No missing action proof is inferred from cleanup. The original scientific duties, source scope, required five output paths, candidate family/effort, private resource caps and response-cap policy remain unchanged.\n\nThe sole allowed predecessor is the exact genuinely completed current A critic, identified by inputs/role_aliases.json. Earlier predecessor names in the unchanged scientific prefix are logical input-directory tokens for those same current native bytes. No old failed revision/output, other candidate result, private evaluator answer, premium dependencies or stub is supplied. Deliver the entire required native-authored revision and catalogs/dependency record honestly within this NEW finite allocation; successful serialization does not imply source correctness.\n'''
    put(task,scientific.read_text()+suffix)
    declaration=d.load_module(clock.DECLARATION['path'],'dec013_clock_declaration').declaration(NEW_JOB)
    decl=run/'clock_declaration.json';put(decl,declaration)
    if (ws/'inputs/STAGE_CLOCK.json').exists():raise ValueError('Actual new birth clock must remain absent before runtime')
    input_freeze=ROOT/'SOURCE_INPUT_FREEZE.json'
    put(input_freeze,{'schema':'er9.dec013-authentic-source-input-freeze.v1','policy_ref':POLICY,'selection_metadata_ref':SELECTION,
        'new_job_id':NEW_JOB,'base_manifest_ref':source_reg['base_manifest'],'base_content_digest':d.imported.digest(base),
        'original_R4_input_pins':old_spec['input_pins'],'actual_current_critic_freeze_ref':selected['actual_critic']['freeze_ref'],
        'actual_current_critic_native_receipt_ref':receipt,'actual_current_critic_stage_ref':selected['actual_critic']['stage_ref'],
        'actual_current_critic_capsule_ref':selected['actual_critic']['capsule_ref'],
        'actual_current_critic_closed_source_context_ref':selected['actual_critic']['closed_source_context_ref'],
        'actual_current_critic_artifacts':freeze['artifacts'],'all_actual_critic_captures_normalized':capture_rows,
        'all_candidate_input_pins':pins,'new_original_allocation_seconds':3000,'old_ended_allocation_seconds':450,
        'card_ref':ref(card_path),'resource_binding_ref':common_ref,'failed_revision_output_bodies_supplied':False,
        'source_interpretation_or_quality_selection_by_preparer':False})
    spec=copy.deepcopy(old_spec)
    spec.update(job_id=NEW_JOB,workspace=str(ws),prompt_file=str(task),prompt_sha256=d.p.sha(task),
        out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),max_seconds=3000,
        input_pins=pins,pair_freeze=ref(input_freeze),versioned_card_ref=ref(card_path),
        clock_declaration=ref(decl),clock_declaration_ref=ref(decl),required_common_resource_binding=common_ref,
        prior_binding_required=False,source_role_binding_required=False,
        current_critic_already_opaque_byte_bound=True,current_critic_ref=selected['actual_critic'],
        actual_current_critic_native_identity=identity,
        original_scientific_task_ref=old_spec['original_scientific_task_ref'],scientific_task_prefix_ref=ref(scientific),
        old_ended_revision_stage_ref={'path':old_row['stage_json'],'sha256':old_row['stage_sha256']},
        root_policy_ref=POLICY,new_original_allocation_seconds=3000,old_ended_allocation_seconds=450,
        additional_native_runner_argv=['--clock-declaration',str(decl),'--clock-declaration-sha256',d.p.sha(decl)])
    spec.pop('birth_binding_constructor_ref',None)
    sp=run/'prepared-stage.json';put(sp,spec)
    row=copy.deepcopy(old_row)
    row.update(job_id=NEW_JOB,source_job_id=old_row['job_id'],stage_json=str(sp),stage_sha256=d.p.sha(sp),
        expected_freeze=spec['freeze_out'],max_seconds=3000,resource_binding=common_ref,
        prior_binding_required=False,source_role_binding_required=False,clock_declaration_ref=ref(decl),
        current_critic_already_opaque_byte_bound=True,current_critic_ref=selected['actual_critic'],
        original_scientific_task_ref=old_spec['original_scientific_task_ref'],scientific_task_prefix_ref=ref(scientific),
        policy_ref=POLICY,status='PREPARED_NOT_ADMITTED',new_original_allocation_seconds=3000,
        old_ended_allocation_seconds=450,automatic_retry=False)
    row.pop('birth_binding_constructor_ref',None)
    source_request={'schema':'er9.dispatch-registration.v1','request_id':NEW_JOB+'-DEC013-r001',
        'pair_id':SOURCE_PAIR,'source_slot':'SEED-DEV-A','family':'L','candidate_family':'Luna',
        'requested_family':'Luna','requested_model':'GPT-6 Luna','requested_effort':'Max',
        'card_path':str(card_path),'card_sha256':d.p.sha(card_path),'resource_binding':common_ref,
        'stage_jobs':[row],'candidate_seed_development':True,'scored_comparison':False,
        'count_in_diagnostic_denominator':False,'root_scope_required':True,'admission_owner':'codex-er9-ops',
        'policy_ref':POLICY,'source_selection_ref':SELECTION,'original_source_registration_ref':selected['source_registration_ref'],
        'base_manifest':source_reg['base_manifest'],'old_ended_450_revision_metadata':selected['failed_revision'],
        'new_native_role_count':1,'new_original_allocation_seconds':3000,'response_cap_change':False,
        'cold_cost_charged_separately':True,'original_failed_status_and_costs_unchanged':True,
        'no_old_revision_output_or_evaluator_or_source_answer_supplied':True,'automatic_retry':False,
        'status':'PREPARED_NOT_ADMITTED','native_starts':0}
    request=ROOT/'SOURCE_REGISTRATION.json';put(request,source_request)
    # Binding-only views are never imported/admitted as native registrations.
    # The unchanged strict binder can see the existing positive critic row and
    # the one pending new revision, without mutating old target descriptors.
    source_view=copy.deepcopy(source_request)
    source_view.update(stage_jobs=[critic_row,row],binding_view_only=True,native_admission_forbidden=True,
        existing_critic_import_ref=selected['actual_critic'])
    source_view_path=ROOT/'SOURCE_BINDING_VIEW.json';put(source_view_path,source_view)
    target_ref=selected['pending_D05A'][0]['owner_registration']
    target=copy.deepcopy(checked(target_ref));original_target=copy.deepcopy(target)
    for role in target['source_role_bindings']:
        if role['role']=='revision':role['old_failed_donor_job_id']=role['job_id'];role['job_id']=NEW_JOB
    for target_row in target['stage_jobs']:target_row['source_role_bindings']=copy.deepcopy(target['source_role_bindings'])
    target.update(binding_view_only=True,native_admission_forbidden=True,original_unchanged_target_registration_ref=target_ref,
        donor_policy_ref=POLICY,donor_selection_ref=SELECTION,
        pair_actual_input_constructor_ref=ref(ROOT/'bind_D05A_inputs.py'))
    target_view=ROOT/'D05A_BINDING_VIEW.json';put(target_view,target)
    rule=ROOT/'D05A_DONOR_RULE_003.json'
    put(rule,{'schema':'er9.dec013-pending-D05A-exact-donor-rule.v1','policy_ref':POLICY,'selection_ref':SELECTION,
        'original_unchanged_target_registration_ref':target_ref,'target_binding_view_ref':ref(target_view),
        'source_binding_view_ref':ref(source_view_path),'new_native_source_registration_ref':ref(request),
        'existing_native_critic_ref':selected['actual_critic'],'sole_future_revision_job_id':NEW_JOB,
        'old_failed_revision_not_a_donor':selected['failed_revision']['job_id'],
        'exact_pending_target_stages':[{'job_id':r['job_id'],'arm':r['arm'],
            'stage_ref':{'path':r['stage_json'],'sha256':r['stage_sha256']}} for r in original_target['stage_jobs']],
        'source_runtime_tool_Task_clock_and_current_botharm_donor_choices_frozen_before_newGoal':True,
        'new_revision_freeze_ref':None,'new_revision_Goal_id':None,
        'release_condition':'Only strict genuine completed/quiet/native identity and full five required files/imported-v4 authentic R4/current-critic lineage; no status or file-only promotion.',
        'ops_before_any_new_source_Goal':'Atomic ALL3 D05A BOTHarmGoal0/noIntent and old450 terminalquiet; deny entire substitution if any target entered.',
        'new_target_jobs_or_Task_budget_family_method_changes':False,'no_extra32_hypothesis_or_credit':True})
    put(ROOT/'OUTBOX.json',{'schema':'er9.dec013-single-source-retest-ready-outbox.v1','requests':[ref(request)],
        'source_registration_ref':ref(request),'source_input_freeze_ref':ref(input_freeze),'donor_rule_ref':ref(rule),
        'D05A_binding_view_ref':ref(target_view),'source_binding_view_ref':ref(source_view_path),
        'policy_ref':POLICY,'selection_ref':SELECTION,'old002_byte_identity_ref':ref(ROOT/'OLD002_BYTE_IDENTITY.json'),
        'native_source_roles':1,'new_original_allocation_seconds':3000,'old_ended_allocation_seconds':450,
        'new_target_native_jobs':0,'matched_comparisons_added':0,'native_or_model_calls':0,
        'status':'PREPARED_NOT_ADMITTED; soleops current atomic eligibility/capacity/source-proof checks required',
        'binding_views_never_admitted_as_new_native_jobs':True})
    return ref(ROOT/'OUTBOX.json')

if __name__=='__main__':print(json.dumps(prepare()))

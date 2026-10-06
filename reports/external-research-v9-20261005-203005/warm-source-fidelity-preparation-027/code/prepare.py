#!/usr/bin/env python3
"""DEC015 fixed five WARM roles. Frozen metadata only, zero native calls."""
import copy,importlib.util,json,sys
from pathlib import Path
sys.dont_write_bytecode=True
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
import prepare_successors as p
ROOT=Path(__file__).resolve().parent
POLICY={'path':str(p.LAB/'supervision/DECISIONS-015-BLIND-SOURCE-FIDELITY-RECOVERY.json'),'sha256':'728ef7201e05678f5da2b9c053d85907e0770be8a71c44caf222bc33eed3ae59'}
SELECTION={'path':str(p.LAB/'ops/dispatcher/DEC015_WARM_FIVE_METADATA_001/SELECTION.json'),'sha256':'4ee5176ddc9abd7e876d75d3c4d456cd11af3371291a364342f5d0448c2e5830'}
LUNA=p.LAB/'dev/luna-route/versions/v1.5-clock-telemetry'
NATIVE={'path':str(LUNA/'PIN.json'),'sha256':'f4e6a4eae72265211527ac86800ac489d38cc54775e0eaeddd3a73932bc38498'}
TOOLS={'path':str(p.LAB/'dev/tools/versions/v1.5-clock-telemetry/SOURCE_PINS.json'),'sha256':'abe26402b0156639e4c0a207e5a030db012c5f2d4b5af5d507a95f00eadeb748'}
MARKER={'path':str(p.LAB/'ops/dispatcher/LUNA_V1_5_READY.json'),'sha256':'ee3abb06177c3d4f3955805fa370abe848062e86c47422e91dd33f3302ef74c1'}
CRITERIA={'path':str(p.LAB/'cases/common_criteria.json'),'sha256':'344135779883060be49d7e389f9dd160e30267247d90269710cb283877602f44'}
ALLOWED={'brief.md','source_access.json','source_separation.md','output_contract.md','delivery_objective.md'}
EXPECTED={('I-05','treatment'),('I-06','control'),('I-06','treatment'),('I-07','control'),('I-07','treatment')}
FINAL=['out/final/'+n for n in ['proposal.md','sources.json','witnesses.json','leads.json']]

def module(name,path):
    spec=importlib.util.spec_from_file_location('warm_fidelity_'+name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def task(job):
    # Explicit neutral candidate_task only. Never copy policy reason/evaluation fields.
    approved=p.checked(POLICY)['candidate_task']
    return ('# Independent native critique and source-fidelity recovery\n\n'+approved+'\n\n'
      'Read inputs/brief.md, inputs/common_criteria.json, inputs/source_access.json, inputs/source_separation.md, '
      'inputs/output_contract.md and inputs/delivery_objective.md as the unchanged scientific authority. '
      'The admitted inputs/prior/<origin-job>/ namespaces are exclusively the current authenticated SAME ARM '
      'research, critic and final roles of this existing pipeline. inputs/source_context/<origin-job>/ contains '
      'every exact owned closed public capture, including errors and limitations. Treat the current final as '
      'the proposal to audit and preserve its supported content while making your own corrections. '
      'Do not use another arm, previous cohort, failed output, public campaign/evaluator report or assessment '
      'as an answer source. No evaluator reason, grade, hidden correction, numerical value or Sol solution '
      'has been supplied. Derive checks and any correction yourself from eligible primary sources and real '
      'bounded execution. Preserve useful explicit unknowns when evidence remains insufficient.\n\n'
      'This is one WARM derivative critique+repair role. Its original new allocation is 1500 seconds, including '
      'normal lifecycle cleanup. Read inputs/STAGE_CLOCK.json and tool clock metadata for the separately '
      'proved original action deadline and remaining action time. Cleanup stop is not action time. Missing '
      'proof remains UNKNOWN; no reset, extra Goal, continuation budget or extra time is authorized. '
      'Native response caps are unsupported/null; any historical requested cap is not an enforced ceiling.\n\n'
      'Write a genuine independent critic/recovery report to out/critique/review.md, distinguishing checks, '
      'changes and remaining unknowns. You must also author all four COMPLETE current final artifacts. '
      f'The current stage_id is {job}. Use actual pm_boundary/write_file(path,text). Write ONE explicitly '
      'native-adopted bundle at out/final_bundle.json with schema er9.native_endorsed_delivery.v1, '
      'stage_id equal to that exact current ID, adopt_current:true, and artifacts containing proposal.md, '
      'sources.json, witnesses.json and leads.json, each explicitly {text_utf8:CURRENT_NATIVE_AUTHORED_TEXT}. '
      'The fixed delivery_role_manifest has no reference entries: input_id is unavailable. The carrier commits '
      'the unchanged four out/final canonical paths together. Keep scratch and the report outside absent '
      'reserved out/final. No automatic fallback or host-authored output is authorized. Bundle commit is '
      'separate from Goal completion and source quality. Complete the original role before its action clock; '
      'all prior outputs, failures, costs and grades remain separately retained.\n').encode()

def positive_metadata(rows):
    if len(rows)!=14 or {(r['source_slot'],r['arm']) for r in rows}!=EXPECTED:raise ValueError('All fixed earlier OP-selected five/14 origins required')
    for row in rows:
        if row['status']!='COMPLETED' or row['native_goal_starts']!=1 or row['operational_complete'] is not True or row['native_quiescent'] is not True or row['permit_release_confirmed'] is not True:
            raise ValueError('Actual completed/quiet/released current origin required')
    return True

def prepare():
    policy=p.checked(POLICY);selection=p.checked(SELECTION);positive_metadata(selection['rows']);native=p.checked(NATIVE);marker=p.checked(MARKER);p.checked(TOOLS)
    if marker['clock_native_pin']!=NATIVE or native['tools_source_pins_sha256']!=TOOLS['sha256']:raise ValueError('Actual Luna1.5/marker/tools source join required')
    declaration=module('declaration',LUNA/'clock_declaration.py');carrier=module('operator',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/operator_binding.py')
    contract={'schema':'er9.dec015-fixed-warm-origin-binding.v1','policy_ref':POLICY,'selection_ref':SELECTION,
      'validator_ref':p.ref(ROOT/'role_birth.py'),'native_source_pin':NATIVE,'tools_source_pin':TOOLS,'ops_marker':MARKER,
      'fixed_original_arms':[{'source_slot':s,'arm':a} for s,a in sorted(EXPECTED)],
      'origin_rule':'Every exact current completed/operational-complete/ownedquiet native same-arm R/C/final role, exact SHA metadata and closed captures. No grade/quality/bestof selection',
      'candidate_exclusion':'No evaluator/grade/private policy reason/Sol correction/failed historical output/otherarm or othercase input',
      'bundle_mode':'Explicit INLINE_ONLY current native-authored final4; empty B reference manifest; independent report mandatory',
      'warm_derivative':True,'extra_fresh_or_matched_target_credit':False,'native_model_calls':0}
    p.put(ROOT/'ROLE_BINDING_CONTRACT.json',contract);contractref=p.ref(ROOT/'ROLE_BINDING_CONTRACT.json')
    requests=[];closures=[]
    for slot,arm in sorted(EXPECTED):
        origins=[r for r in selection['rows'] if (r['source_slot'],r['arm'])==(slot,arm)]
        finals=[r for r in origins if r['pipeline_final']]
        if len(finals)!=1:raise ValueError('Exactly current one authentic complete final required')
        final=finals[0];source=p.checked(final['owner_registration_ref']);card=p.checked(final['card_ref'])
        if source['family']!='L' or source['requested_model']!='GPT-6 Luna' or source['requested_effort'].casefold()!='max':raise ValueError('Explicit original actual LunaMax required')
        pair=slot+'-'+arm+'-BLIND-SOURCE-FIDELITY-R001';job=pair+'-critic_final-a001';run=ROOT/'versions'/pair/job;ws=run/'workspace';ws.mkdir(parents=True,exist_ok=False);(ws/'out').mkdir()
        current_task=ws/'TASK.md';current_task.write_bytes(task(job));inputs={}
        research=next(r for r in origins if r['stage']=='research')
        for path,digest in research['admitted_input_pins'].items():
            name=Path(path).name
            if name not in ALLOWED:raise ValueError('Only original neutral first-R inputs admitted during source compilation')
            target=ws/'inputs'/name;p.clone_bytes(path,target,digest,Path(path).parent);inputs[str(target)]=digest
        if {Path(path).name for path in inputs}!=ALLOWED:raise ValueError('Exact original five common inputs required')
        criteria=p.LAB/'cases'/card['common_criteria_path']
        if str(criteria)!=CRITERIA['path'] or p.sha(criteria)!=CRITERIA['sha256']:raise ValueError('Exact original frozen common criteria required, never replacement rubric')
        target=ws/'inputs/common_criteria.json';p.clone_bytes(criteria,target,CRITERIA['sha256'],p.LAB/'cases');inputs[str(target)]=CRITERIA['sha256']
        built=carrier.binding(stage_id=job,stage_role='critic_final',case_id=card['case_id'],arm_id=arm,method_factors=[card['method_id']],
            actor_binding={'stage_id':job,'family':'Luna','model':'gpt-6-luna','effort':'max','native_goal_id':None,'writer_alias':'pm_boundary/write_file'},entries=[],complete_final_role=True)
        manifest=ws/'inputs/delivery_role_manifest.json';manifest.write_bytes(built['manifest_bytes']);inputs[str(manifest)]=p.sha(manifest)
        private=run/'operator-profile';private.mkdir(mode=0o700);profile=private/'BUNDLE_PROFILE.json';profile.write_bytes(built['profile_bytes']);profile.chmod(0o600)
        clock=run/'CLOCK_DECLARATION.json';p.put(clock,declaration.declaration(job))
        common={'schema':'er9.dec015-current-arm-warm-source-card.v1','pair_id':pair,'source_slot':slot,'arm':arm,'case_id':card['case_id'],
          'method_id':card['method_id'],'candidate_family':'Luna','requested_model':'GPT-6 Luna','requested_effort':'max','source_pair_id':source['pair_id'],
          'source_card_ref':final['card_ref'],'source_registration_ref':final['owner_registration_ref'],'common_criteria_ref':p.ref(criteria),
          'original_common_input_pins':{str(Path(path).name):digest for path,digest in research['admitted_input_pins'].items()},
          'warm_derivative_only':True,'role':'critic_final','max_seconds':1500,'max_responses':None,'historical_requested_response_cap':150,
          'no_enforced_response_cap_invented':True,'role_outputs':FINAL+['out/critique/review.md'],'extra_target_credit':False}
        cardpath=run.parent/'card.json';p.put(cardpath,common)
        spec={'job_id':job,'pair_id':pair,'arm':arm,'stage':'critic_final','native_family':'L','workspace':str(ws),'prompt_file':str(current_task),
          'prompt_sha256':p.sha(current_task),'input_pins':inputs,'out':str(run/'native'),'freeze_out':str(run/'OUTPUT_FREEZE.json'),
          'max_seconds':1500,'max_responses':None,'requested_parent_response_cap':150,'response_cap_enforcement':'UNSUPPORTED_NATIVE_LUNA_NULL_NOT_ENFORCED',
          'required_artifacts':FINAL+['out/critique/review.md'],'complete_final_owner_role':True,'bundle_profile':p.ref(profile),
          'bundle_authoring_mode':'INLINE_ONLY','required_delivery_role_manifest':p.ref(manifest),'clock_declaration':p.ref(clock),
          'declared_native_source_pin':NATIVE,'declared_native_runner':str(LUNA/'dynamic_stage_runner.py'),'declared_tool_source_pin':TOOLS,
          'required_resource_contract':marker['resource_definition'],'runtime_binding_required':True,'execution_enabled':True,'public_get':True,
          'pair_freeze':p.ref(cardpath),'warm_origin_selection_ref':SELECTION,'warm_origin_job_ids':[r['job_id'] for r in origins],
          'warm_current_final_job_id':final['job_id'],'warm_original_pair_id':source['pair_id'],'strict_warm_role_birth_contract':contractref,
          'warm_derivative':True,'extra_fresh_or_matched_target_credit':False,'source_scientific_grade_feedback_supplied':False,
          'reserved_dynamic_clock_input':'inputs/STAGE_CLOCK.json','actual_future_clock_input_sha256':None,'old_deadlines_reset':False,
          'additional_native_runner_argv':['--bundle-profile',str(profile)]}
        p.put(run/'prepared-stage.json',spec)
        row={'job_id':job,'arm':arm,'stage':'critic_final','stage_index':0,'max_seconds':1500,'max_responses':None,'pipeline_final':True,
          'execution_enabled':True,'public_get':True,'stage_json':str(run/'prepared-stage.json'),'stage_sha256':p.sha(run/'prepared-stage.json'),
          'expected_freeze':spec['freeze_out'],'prerequisite_job_ids':[],'all_same_arm_prior_job_ids':spec['warm_origin_job_ids'],
          'warm_origin_job_ids':spec['warm_origin_job_ids'],'source_role_freezes_required':[r['freeze_ref'] for r in origins],
          'runtime_ref':MARKER,'resource_definition':marker['resource_definition'],'status':'SOURCE_PREPARED_AWAITING_AUTHENTIC_WARM_INPUT_BINDING'}
        full={'schema':'er9.dec015-warm-role-full-source-closure.v1','pair_id':pair,'arm':arm,'policy_ref':POLICY,'selection_ref':SELECTION,
          'native_source_pin':NATIVE,'tools_source_pin':TOOLS,'ops_marker':MARKER,'native_prepare_ref':p.ref(LUNA/'clock_prepare.py'),
          'clock_constructor_ref':p.ref(LUNA/'clock_declaration.py'),'clock_declaration_ref':p.ref(clock),'Task_ref':p.ref(current_task),
          'original_neutral_input_pins':inputs,'source_common_criteria_ref':p.ref(criteria),'source_card_ref':final['card_ref'],
          'actual_complete_native_origin_rows':origins,'strict_warm_role_birth_contract':contractref,'inline_only_profile_ref':p.ref(profile),
          'complete_actual_source_choices':True,'warm_derivative':True,'old_results_costs_grades_preserved':True,
          'extra_fresh_or_matched_target_credit':False,'dynamic_future_hashes_fabricated':False,'source_owner_native_calls':0}
        p.put(run.parent/'PIPELINE_CLOSURE.json',full);closures.append(p.ref(run.parent/'PIPELINE_CLOSURE.json'))
        reg={'schema':'er9.dispatch-registration.v1','request_id':pair+'-r001','pair_id':pair,'source_slot':slot,'source_pair_id':source['pair_id'],
          'family':'L','requested_model':'GPT-6 Luna','requested_effort':'max','track':'FINITE_BLIND_SOURCE_FIDELITY_WARM_RECOVERY',
          'scientific_recovery_mode':'unpaired_warm_native_critique_source_fidelity_derivative','card_path':str(cardpath),'card_sha256':p.sha(cardpath),
          'stage_jobs':[row],'policy_ref':POLICY,'source_registration_ref':final['owner_registration_ref'],'warm_origin_selection_ref':SELECTION,
          'pipeline_closure':p.ref(run.parent/'PIPELINE_CLOSURE.json'),'immutable_pair_input_freeze':p.ref(run.parent/'PIPELINE_CLOSURE.json'),
          'strict_warm_role_birth_contract':contractref,'native_source_binding_status':'READY_LUNA1_5_SOURCE_PENDING_AUTHENTIC_WARM_BIRTH',
          'runtime_ref':MARKER,'source_separation_overlay':source['source_separation_overlay'],'source_role_imports':origins,'deferred_stages':[],
          'native_starts':0,'automatic_retry':False,'root_scope_required':False,'root_or_max_go_required':False,
          'extra_fresh_or_matched_target_credit':False,'source_scientific_grade_feedback_supplied':False,'original_outputs_costs_failures_grades_retained':True,
          'cohort_id':'DEC015-FIXED-FIVE-WARM-SOURCE-FIDELITY-R001','admission_owner':'ops only','status':'SOURCE_PREPARED_NOT_ADMITTED'}
        p.put(run.parent/'registration.json',reg);requests.append(p.ref(run.parent/'registration.json'))
    p.put(ROOT/'ALL_FIVE_SOURCE_CLOSURE.json',{'schema':'er9.dec015-all-five-preGoal-closure.v1','policy_ref':POLICY,'selection_ref':SELECTION,
      'five_warm_role_closures':closures,'all_five_actual_sources_closed_before_ANY_recoveryGoal':True,'native_calls':0,'extra_target_credit':False})
    p.put(ROOT/'OUTBOX.json',{'schema':'er9.dec015-fixed-five-warm-recovery-outbox.v1','requests':requests,'policy_ref':POLICY,'selection_ref':SELECTION,
      'native_role_count':5,'allocation_seconds_per_role':1500,'total_new_native_seconds':7500,'arm_count':5,
      'all_five_source_closure':p.ref(ROOT/'ALL_FIVE_SOURCE_CLOSURE.json'),'role_binding_contract':contractref,'native_source_pin':NATIVE,
      'tools_source_pin':TOOLS,'ops_marker':MARKER,'warm_derivatives_only':True,'extra_fresh_or_matched_target_credit':False,
      'scientific_grade_or_hidden_answer_supplied':False,'candidate_model_native_Goal_calls':0,'ops_registry_mutations':0,
      'admission':'Atomic current fixed-origin authenticity/ownedquiet and new5native0/noIntent/all5sourceclosure + ordinary actual capacity/resource gates; no quality/userGo',
      'automatic_further_repeat':False})
    print(json.dumps(p.ref(ROOT/'OUTBOX.json')))

if __name__=='__main__':prepare()

#!/usr/bin/env python3
"""Release exact sealed tasks after DEC007 lock and prepare all four pipelines; no launch."""
import copy
import json
from pathlib import Path
import shutil
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import prepare as p
import bind_seeded as pins

LAB=Path(__file__).resolve().parents[3]
CASES=LAB/'cases'
RECOVERY=Path(__file__).resolve().parent
ROOT=RECOVERY.parent/'confirmation-preparation'
LOCK={'path':str(LAB/'supervision/DECISIONS-007-RECIPE-LOCK.json'),
      'sha256':'2e6a79f793474aa238c5d8e896fbb08e19f4e31a6277aa81095a5338671957db'}
POLICY={'path':str(LAB/'supervision/DECISIONS-007.json'),
        'sha256':'3b5e9c649047166970d48cdd262c6d80ea9d1ec014039da031ea9fdf866e9778'}


def artifacts(folder):
    return ['out/'+folder+'/'+x for x in ('proposal.md','sources.json','witnesses.json','leads.json')]


def main():
    lock=pins.checked_json(LOCK); policy=pins.checked_json(POLICY)
    if lock['status']!='LOCKED' or lock['preparation_and_brief_opening_after_this_lock_authorized'] is not True:
        raise ValueError('Exact recipe lock required before any holdout detail access')
    release=RECOVERY/'CONFIRMATION_RELEASE_RECEIPT.json'
    evidence=json.loads(release.read_text())
    if evidence['lock_ref']!=LOCK or evidence['semantic_brief_read_before_this_receipt'] is not False:
        raise ValueError('Lock-before-read provenance required')
    for ref in evidence['verified_sealed_files']:
        if p.sha(p.regular(ref['path']))!=ref['sha256']:raise ValueError('Exact sealed input drift')
    for name in ('common_criteria','source_access'):pins.checked_json(lock[name])
    delivery=p.regular(policy['carrier']['path'])
    if p.sha(delivery)!=policy['carrier']['sha256']:raise ValueError('Frozen delivery carrier drift')
    # Copy only released exact neutral brief/coverage, never the sealed generator.
    for code in ('H1','H2'):
        for suffix in ('.md','-coverage.json'):
            source=CASES/'confirmation/sealed'/(code+suffix);target=ROOT/'released'/(code+suffix)
            target.parent.mkdir(parents=True,exist_ok=True)
            if target.exists():raise ValueError('Preserve frozen release')
            shutil.copyfile(p.regular(source),target)
    base_prompts={'research':CASES/'prompts/research.md','critique':CASES/'prompts/critique-common.md',
                  'revision':CASES/'prompts/revision.md'}
    v14=RECOVERY.parent/'integrated-defaults/prompts/V14-protected-discovery.md'
    v10=RECOVERY.parent/'integrated-final-selections/prompts/V10-release-binding.md'
    v16=RECOVERY.parent/'integrated-final-selections/prompts/V16-complete-decision-delivery.md'
    v08=RECOVERY.parent/'integrated-defaults/prompts/V08-critic-final.md'
    requests=[]
    for chosen in lock['pairs']:
        pair=chosen['pair'];code=chosen['holdout'];recipe=chosen['recipe'];runroot=ROOT/pair
        reservation=CASES/'confirmation'/(pair+'.json');reserve=json.loads(reservation.read_text())
        if reserve['holdout_code']!=code or reserve['recipe_slot']!={'A':1,'B':2}[recipe]:
            raise ValueError('Locked pair/reservation mismatch')
        brief=ROOT/'released'/(code+'.md');coverage=ROOT/'released'/(code+'-coverage.json')
        def stage(role,seconds,mods=()):
            paths=[base_prompts['critique' if role=='critic_final' else role],*mods]
            return {'stage':role,'max_native_seconds':seconds,'max_parent_responses':seconds//10,
                    'native_goal':True,'fresh_same_family':True,'prompt_paths':[str(x) for x in paths],
                    'required_artifacts':artifacts('research') if role=='research' else ['out/critique/review.md'] if role=='critique' else artifacts('final'),
                    'execution_enabled':True,'public_get':True}
        control=[stage('research',1200),stage('critique',900),stage('revision',600)]
        treatment=[stage('research',1200,[v14,v10])]
        treatment += ([stage('critique',900),stage('revision',600,[v16])] if recipe=='A' else [stage('critic_final',1500,[v08,v16])])
        card={'schema':'er9.locked-confirmation-case.v1','pair_id':pair,'source_slot':pair,'track':'C','status':'NOT_RUN',
              'recipe':recipe,'method_id':'CONFIRM-'+recipe,'candidate_family':lock['actual_family'],
              'requested_model':lock['requested_model'],'requested_effort':lock['effort'],
              'holdout_code':code,'case_id':code+'-v1','brief_path':str(brief),'coverage_path':str(coverage),
              'common_criteria_path':'common_criteria.json','source_access_path':'source_access.json',
              'common_output_contract':'prompts/output_contract.md','control_stages':control,'treatment_stages':treatment,
              'allocation':{'critical_path_candidate_seconds_per_arm':2700,'occupied_candidate_seconds_per_arm':5400,'per_stage_allocations_sum':2700},
              'artifacts':{'designated_final':'out/final/proposal.md','source_catalog':'out/final/sources.json',
                           'witness_catalog':'out/final/witnesses.json','lead_inventory':'out/final/leads.json'},
              'selection_lock_ref':LOCK,'policy_ref':POLICY,'reservation_ref':{'path':str(reservation),'sha256':p.sha(reservation)},
              'release_receipt_ref':{'path':str(release),'sha256':p.sha(release)},
              'exact_locked_bundle':lock['common_treatment_bundle'],'control_competent_and_contemporaneous':True,
              'initial_input':'BRIEF_ONLY_CANDIDATE_SOURCE_DISCOVERY','source_answers_or_prior_development_in_inputs':False,
              'no_feedback_between_confirmation_comparisons':True,'execute_all_four_after_early_FAILURE':True,
              'execution_gate':lock['execution_gate'],'whole_case_or_all_diagnostic_PASS_required':False,
              'critical_source_and_delivery_duties':{'independent_implementation_precedents_min':2,'real_issue_fix_regression_chain_required':True,'complete_actual_final4_required':True},
              'actual_runtime_tools_resource_pins_required_before_outputs':True,'observed_model':None,'quality':'NOT_RUN'}
        card_path=ROOT/'cards'/(pair+'.json');p.put(card_path,card)
        input_files={brief,coverage,delivery,reservation,card_path,Path(LOCK['path']),Path(POLICY['path']),release,
                     CASES/'common_criteria.json',CASES/'source_access.json',CASES/'prompts/output_contract.md'}
        for arm in ('control','treatment'):
            for st in card[arm+'_stages']:input_files.update(Path(x) for x in st['prompt_paths'])
        freeze_path=runroot/'PAIR_INPUT_FREEZE.json'
        p.put(freeze_path,{'schema':'er9.locked-confirmation-input-freeze.v1','pair_id':pair,'recipe':recipe,
                           'selection_lock_ref':LOCK,'policy_ref':POLICY,'release_receipt_ref':card['release_receipt_ref'],
                           'host_input_pins':{str(x):p.sha(x) for x in sorted(input_files)},'allocation':card['allocation'],
                           'designated_final':card['artifacts'],'actual_source_pins_initial':[],
                           'source_discovery':'Fresh neutral brief only; no repository hints or development findings',
                           'execution_gate':lock['execution_gate'],'quality_gate_required':False,
                           'actual_tool_model_resource_seal_required':True,'native_starts':0,'created_utc':p.now()})
        freeze_ref={'path':str(freeze_path),'sha256':p.sha(freeze_path)};rows=[]
        for arm in ('control','treatment'):
            prior=[]
            for index,st in enumerate(card[arm+'_stages']):
                job_id=f'{pair}-{arm}-{st["stage"]}-a001';run=runroot/job_id;ws=run/'workspace';incoming=ws/'inputs'
                incoming.mkdir(parents=True,exist_ok=False);(ws/'out').mkdir()
                shutil.copyfile(brief,incoming/'brief.md');shutil.copyfile(CASES/'prompts/output_contract.md',incoming/'output_contract.md')
                shutil.copyfile(delivery,incoming/'delivery_objective.md')
                task=ws/'TASK.md';text=['# Assigned fresh native confirmation stage',(incoming/'brief.md').read_text(),
                    (incoming/'output_contract.md').read_text(),*[Path(x).read_text() for x in st['prompt_paths']]]
                if prior:text.append('Before this stage, ops attaches exact full same-arm native predecessor artifacts and navigation under inputs/prior/. Do not invent missing predecessors or inspect another arm, prior development, or confirmation output.')
                text += [delivery.read_text(),'# Exact current native role\n\nRole: '+st['stage']+'\nRequired exact deliverables:\n'+
                         '\n'.join('- '+x for x in st['required_artifacts'])]
                if st['stage']=='critic_final':text.append('Perform both full genuine independent criticism and complete final authorship in this one Goal. Four final files are required; review.md is optional. There is no later final-author Goal.')
                text.append('All full brief duties, independently useful precedents, real issue/fix/regression investigation, source qualifications and useful current content remain. Complete scheduled delivery honestly within this exact role budget; do not add time or helpers outside the locked allocation.')
                task.write_text('\n\n'.join(text)+'\n')
                spec={'job_id':job_id,'pair_id':pair,'arm':arm,'stage':st['stage'],'workspace':str(ws),
                      'prompt_file':str(task),'prompt_sha256':p.sha(task),'out':str(run/'native'),
                      'max_seconds':st['max_native_seconds'],'max_responses':st['max_parent_responses'],
                      'tools_config':None,'tools_config_sha256':None,'required_artifacts':st['required_artifacts'],
                      'input_pins':{str(x):p.sha(x) for x in incoming.iterdir()},'pair_freeze':freeze_ref,
                      'freeze_out':str(run/'OUTPUT_FREEZE.json'),'runtime_binding_required':True,
                      'predecessor_binding_required':bool(prior),'response_cap_enforcement':'SUPPORTED_NATIVE_LIMIT'}
                sp=run/'prepared-stage.json';p.put(sp,spec)
                rows.append({'job_id':job_id,'arm':arm,'stage':st['stage'],'stage_index':index,
                             'max_seconds':st['max_native_seconds'],'max_responses':st['max_parent_responses'],
                             'prerequisite_job_ids':prior[-1:],'all_same_arm_prior_job_ids':prior[:],
                             'stage_json':str(sp),'stage_sha256':p.sha(sp),'expected_freeze':spec['freeze_out'],
                             'pipeline_final':st['required_artifacts'][0]=='out/final/proposal.md',
                             'execution_enabled':True,'public_get':True,'status':'QUEUED_EXECUTION_GATE_PENDING',
                             'runtime_binding_required':True});prior.append(job_id)
        request={'schema':'er9.dispatch-registration.v1','request_id':pair+'-DEC007-locked-r001','pair_id':pair,
                 'source_slot':pair,'family':'Z','requested_model':card['requested_model'],'requested_effort':card['requested_effort'],
                 'card_path':str(card_path),'card_sha256':p.sha(card_path),'stage_jobs':rows,'root_scope_required':True,
                 'status':'QUEUED_EXECUTION_GATE_PENDING','admission_owner':'codex-er9-ops','automatic_retry':False,
                 'immutable_pair_input_freeze':freeze_ref,'selection_lock_ref':LOCK,'policy_ref':POLICY,
                 'execution_gate':lock['execution_gate'],'confirmation_feedback_forbidden':True,
                 'actual_runtime_model_tools_resource_seal_required_before_outputs':True}
        rp=ROOT/'registration'/(request['request_id']+'.json');p.put(rp,request)
        ref={'path':str(rp),'sha256':p.sha(rp),'request_id':request['request_id']};requests.append(ref)
        p.put(runroot/'OUTBOX.json',{'schema':'er9.locked-confirmation-registration-outbox.v1','requests':[ref],
                                   'execution_gate':lock['execution_gate'],'native_starts':0})
    p.put(ROOT/'OUTBOX.json',{'schema':'er9.locked-confirmation-registration-outbox.v1','requests':requests,
                             'pairs':4,'full_pipeline_arms':8,'planned_native_stages':22,'native_starts':0,
                             'execution_gate':lock['execution_gate'],'selection_lock_ref':LOCK,'no_quality_or_rootGo_gate':True})
    print(json.dumps({'pairs':4,'full_pipeline_arms':8,'native_stage_packets':22,'outbox':str(ROOT/'OUTBOX.json'),'native_starts':0}))


if __name__=='__main__':main()

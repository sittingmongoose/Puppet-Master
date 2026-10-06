#!/usr/bin/env python3
"""G-only prospective clock behavior source metadata; no admission or inference."""
import json
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
import prepare_successors as p

ROOT=Path(__file__).resolve().parent
REQUEST={'path':str(p.LAB/'ops/dispatcher/WHOLLY_UNSTARTED_SELECTED_PAIR_METADATA_001.json'),
         'sha256':'6c3cbcb0f7e0bb546e5c27f6f26474771adef8cd8d075c656e526bd66a6002e9'}

def metadata(ref):return p.checked(ref)

def validate_eligible(pair):
    if pair['family']!='Z':raise ValueError('Actual L clock binding not authorized by eligible metadata')
    if pair['native_starts']!=0 or pair['launch_intents']!=0:
        raise ValueError('Already-entered pair cannot receive this common prospective intervention')
    if {r['arm'] for r in pair['jobs']}!={'control','treatment'}:
        raise ValueError('Complete both-arm pipeline must be preclosed together')
    ids=[r['job_id'] for r in pair['jobs']]
    if len(ids)!=len(set(ids)):raise ValueError('Duplicate native job admission forbidden')
    owners={r['owner_registration_ref']['path']:r['owner_registration_ref'] for r in pair['jobs']}
    if len(owners)!=1:raise ValueError('One exact source-owner paired registration required')
    owner=metadata(next(iter(owners.values())))
    if owner['pair_id']!=pair['pair_id'] or {r['job_id'] for r in owner['stage_jobs']}!=set(ids):
        raise ValueError('Source registry does not cover every exact paired role')
    closure=metadata(pair['whole_pipeline_closure'])
    if not closure['actual_runtime_closure_complete']:
        raise ValueError('Existing source full-pipeline choices are not positively frozen')
    if {r['job_id'] for r in closure['stages']}!=set(ids):raise ValueError('Source whole-pipeline role omission')
    return owner,closure

def prepare():
    request=metadata(REQUEST);pairs=[];snapshot={}
    for pair in request['pairs']:
        owner,closure=validate_eligible(pair)
        card_ref={'path':owner['card_path'],'sha256':owner['card_sha256']};card=metadata(card_ref)
        if owner['requested_model']!='GLM 5.3 Flash' or owner['requested_effort'].casefold()!='max':
            raise ValueError('Declared native family/model/effort unchanged')
        stages=[]
        for row in pair['jobs']:
            source=metadata(row['prepared_stage_ref'])
            if any(source[k]!=row[k] for k in ['job_id','arm','stage']):raise ValueError('Source stage identity mismatch')
            task_ref={'path':source['prompt_file'],'sha256':source['prompt_sha256']}
            if p.sha(task_ref['path'])!=task_ref['sha256']:raise ValueError('Source Task changed')
            snapshot[task_ref['path']]=task_ref['sha256']
            snapshot[row['prepared_stage_ref']['path']]=row['prepared_stage_ref']['sha256']
            for path,digest in source['input_pins'].items():
                p.allowed_input(path,source['workspace'])
                if p.sha(path)!=digest:raise ValueError('Source scientific/negative-constraint input drift')
                snapshot[path]=digest
            stages.append({'job_id':row['job_id'],'arm':row['arm'],'stage':row['stage'],
                 'source_stage_ref':row['prepared_stage_ref'],'source_Task_ref':task_ref,
                 'source_input_pins':source['input_pins'],'original_role_fields':{k:source.get(k) for k in p.INVARIANTS},
                 'source_runtime_ref':row['runtime_ref'],
                 'candidate_action_clock_source':'Actual RESOURCE_BINDING.native_stop_monotonic_ns at role birth',
                 'total_cleanup_clock_not_candidate_action':True,
                 'actual_future_action_deadline_ns':None,'actual_future_remaining_seconds':None,
                 'future_Task_profile_hash_fabricated':False})
        snapshot[card_ref['path']]=card_ref['sha256']
        for ref in [pair['whole_pipeline_closure'],*{r['owner_registration_ref']['path']:r['owner_registration_ref'] for r in pair['jobs']}.values()]:
            snapshot[ref['path']]=ref['sha256']
        pairs.append({'pair_id':pair['pair_id'],'source_slot':pair['source_slot'],'family':'Z',
              'source_card_ref':card_ref,'source_whole_pipeline_closure_ref':pair['whole_pipeline_closure'],
              'source_owner_registration_ref':pair['jobs'][0]['owner_registration_ref'],
              'prospective_pair_version_id':pair['pair_id']+'-CLOCK-AWARE-R001',
              'analysis_cohort_behavior_stratum':'common_clock_awareness_v1.5; explicitly separate from prior nonclock transport claims',
              'confirmation_original_recipe_lock_ref':{'path':str(p.LAB/'supervision/DECISIONS-007-RECIPE-LOCK.json'),'sha256':p.LOCK_SHA} if pair['pair_id'].startswith('C-') else None,
              'native0_at_source_cutoff':True,'eligibility_recheck_before_prospective_seal_required':True,
              'all_roles':stages,'native_stage_count':len(stages),'scientific_recipe_changes':False})
    p.put(ROOT/'SOURCE_BYTE_SNAPSHOT.json',{'schema':'er9.clock-overlay-original-byte-snapshot.v1','files':snapshot})
    p.put(ROOT/'BLUEPRINT.json',{'schema':'er9.prospective-common-clock-behavior-blueprint.v1',
           'eligibility_source_ref':REQUEST,'source_cutoff_utc':request['observed_utc'],'source_cursor_sha256':request['source_cursor_sha256'],
           'pairs':pairs,'pair_count':len(pairs),'native_stage_count':sum(r['native_stage_count'] for r in pairs),
           'authorization':'Engineering only; no actual deployment/native admission/new jobs/quality-selected repeat',
           'actual_G1_5_tool_core_bundle_pins_ready':False,'runtime_source_refs':None,
           'current_old_usable_queue_continues':True,'new_global_first_stage_hold':False,
           'source_task_semantic_prefix_common_criteria_negative_constraints_model_effort_factors_caps_unchanged':True,
           'complete_both_arm_all_role_source_runtime_tool_clock_constructor_closure_before_first_research':True,
           'dynamic_clock_Task_profile_input_hashes_bind_before_current_Goal_under_preclosed_constructor':True,
           'clock_awareness_is_explicit_behavioral_intervention':True,'invisible_causal_neutrality_guarantee':False,
           'writer_metadata':'logical_writer_kind=write_text; Gconfigured_native_tool=mcp__pm_boundary__write_file; observed_native_tool=UNOBSERVED until actualdispatch',
           'actual_L_clock_binding_authorized':False,'old_bytes_untouched':True,'source_owner_model_calls':0,'source_owner_native_Goal_calls':0})
    print(json.dumps(p.ref(ROOT/'BLUEPRINT.json')))

if __name__=='__main__':prepare()

#!/usr/bin/env python3
"""Finite exact positive ops26 selector: both-arm INLINE_ONLY final versions.

Seed/native input bytes preserved opaquely; every final role is authored/adopted
inline by its genuine native Goal. No reference IDs, host fill or source repair.
"""
import copy
import importlib.util
import json
from pathlib import Path
import prepare_successors as p
import prepare_bundle_transport as transport
import prepare_fresh_cohort as fresh
import hydrate_role_proofs as hydration

ROOT=Path(__file__).resolve().parent
REQUEST={'path':str(p.LAB/'ops/dispatcher/ORDINARY_DIAGNOSTIC_BUNDLE_SUCCESSOR_REQUEST_001.json'),
         'sha256':'21cc3a4dbb91bf384aff411e5475a1a9cd0f80b70c1ccc494cd392231ec68e3e'}

def prepare():
    request=p.checked(REQUEST);groups={}
    transport.pins(fresh.TOOLS14);native=p.checked(fresh.LUNA14)
    if native['tools_source_pins_sha256']!=fresh.TOOLS14['sha256']:raise ValueError('Actual Luna bundle tools source mismatch')
    for row in request['rows']:
        if row['native_goal_starts_operator_declaration']!=0 or row['launch_intent_observed'] or row['unit'] is not None:
            raise ValueError('Only exact native0/noLaunchIntent prospective selection')
        if row['family']!='L':raise ValueError('Selector current actual supported family must be explicit Luna')
        groups.setdefault(row['pair_id'],[]).append(row)
    destination=ROOT/'ordinary-bundle001';requests=[];preservations=[]
    for original_pair,rows in sorted(groups.items()):
        if len(rows)!=2 or {r['arm'] for r in rows}!={'control','treatment'}:raise ValueError('One exact coupled pair required')
        if len({r['card_ref']['sha256'] for r in rows})!=1:raise ValueError('Both arms must share exact scientific card pin')
        original_card=p.checked(rows[0]['card_ref'])
        if original_card['method_id']=='V06':raise ValueError('Both V06 arms exclude generic carrier')
        original_regs=[p.checked(r['owner_registration_ref']) for r in rows]
        if any(r['requested_model']!='GPT-6 Luna' or r['requested_effort']!='Max' or r['family']!='L' for r in original_regs):
            raise ValueError('No family/model/effort substitution allowed')
        pair=original_pair+'-BUNDLE-R001';root=destination/pair
        common=p.binding('L')
        common.update(source_pin=fresh.LUNA14,tools_source_pins=fresh.TOOLS14,
                      native_stage_runner=str(p.LAB/'dev/luna-route/versions/v1.4-bundle/dynamic_stage_runner.py'),
                      delivery_policy_ref=p.ref(p.LAB/'supervision/DECISIONS-010.json'),
                      final_reference_choice='INLINE_ONLY explicit native full text_utf8 for every final role',
                      final_reference_entries=0,source_semantic_model_effort_factor_budget_change=False)
        p.put(root/'COMMON_RESOURCE_BINDING.json',common);common_ref=p.ref(root/'COMMON_RESOURCE_BINDING.json')
        card=copy.deepcopy(original_card)
        card.update(pair_id=pair,source_pair_id=original_pair,resource_version='prospective common DEC010 INLINE_ONLY transport',
                    requested_family='Luna',candidate_family='Luna',required_resource_binding=common_ref)
        p.put(root/'card.json',card)
        jobs=[];closures=[]
        for row,owner in zip(rows,original_regs):
            old=p.checked(row['prepared_stage_ref']);sealed=p.checked(row['sealed_stage_ref'])
            for field in ['prompt_sha256','required_artifacts','max_seconds','max_responses','arm','stage']:
                if old.get(field)!=sealed.get(field):raise ValueError('Actual sealed/source semantic mismatch '+row['job_id']+' '+field)
            if old['required_artifacts']!=transport.FINAL_PATHS:raise ValueError('Exact four-role final contract required')
            declared=[s for s in owner['stage_jobs'] if s['arm']==row['arm'] and s['stage']==row['stage']]
            if len(declared)!=1:raise ValueError('Source owner role declaration ambiguity')
            base=declared[0];job=row['job_id']+'-BUNDLE-R001';run=root/job;ws=run/'workspace'
            ws.mkdir(parents=True,exist_ok=False);(ws/'out').mkdir()
            inherited=ws/'TASK.inherited.md';p.clone_bytes(old['prompt_file'],inherited,old['prompt_sha256'],old['workspace'])
            task=ws/'TASK.md';task.write_bytes(inherited.read_bytes()+transport.addendum(job).encode())
            inputs={}
            for path,digest in old['input_pins'].items():
                rel=Path(path).relative_to(old['workspace']);target=ws/rel
                p.clone_bytes(path,target,digest,old['workspace']);inputs[str(target)]=digest
            spec=copy.deepcopy(old)
            spec.update(job_id=job,pair_id=pair,workspace=str(ws),prompt_file=str(task),prompt_sha256=p.sha(task),
                        out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),input_pins=inputs,
                        tools_config=None,tools_config_sha256=None,source_stage_ref=row['prepared_stage_ref'],
                        original_sealed_native0_stage_ref=row['sealed_stage_ref'],required_common_resource_binding=common_ref,
                        declared_native_source_pin=fresh.LUNA14,declared_native_runner=common['native_stage_runner'],
                        final_reference_policy='INLINE_ONLY no input_id, absence fallback, catalog host fill or semantic repair',
                        complete_final_owner_role=True,bundle_profile_role='final_author' if row['stage']=='revision' else row['stage'])
            module=hydration.tool_module()
            result=module.binding(stage_id=job,stage_role=spec['bundle_profile_role'],case_id=card['case_id'],arm_id=row['arm'],
                      method_factors=[card['method_id']],actor_binding={'stage_id':job,'family':'Luna','model':'gpt-6-luna',
                      'effort':'max','native_goal_id':None,'writer_alias':'write_text'},entries=[],complete_final_role=True)
            manifest=ws/'inputs/delivery_role_manifest.json';manifest.write_bytes(result['manifest_bytes']);inputs[str(manifest)]=p.sha(manifest)
            profile=run/'operator-profile/bundle_profile.json';profile.parent.mkdir();profile.write_bytes(result['profile_bytes']);profile.chmod(0o600)
            module.carrier.load_profile(profile,p.sha(profile));module.carrier.reference_closure(result['profile'],lambda rel:(ws/rel).read_bytes())
            spec.update(input_pins=inputs,bundle_profile=p.ref(profile),required_delivery_role_manifest='inputs/delivery_role_manifest.json',
                        additional_native_runner_argv=['--bundle-profile',str(profile)],
                        dynamic_role_manifest_binding_required=False,bundle_profile_binding_required=False)
            p.put(run/'prepared-stage.json',spec)
            jobrow=copy.deepcopy(base)
            jobrow.update(job_id=job,stage_json=str(run/'prepared-stage.json'),stage_sha256=p.sha(run/'prepared-stage.json'),
                      expected_freeze=spec['freeze_out'],source_job_id=row['job_id'],bundle_profile=p.ref(profile),
                      status='PREPARED_NOT_ADMITTED',prerequisite_job_ids=base.get('prerequisite_job_ids',[]),
                      all_same_arm_prior_job_ids=row['all_same_arm_prior_job_ids'],reference_closure_binding_required=False)
            jobs.append(jobrow)
            closures.append({'job_id':job,'arm':row['arm'],'stage':row['stage'],'max_seconds':row['max_seconds'],
                 'max_responses':row['max_responses'],'native_source_pin':fresh.LUNA14,'tools_source_pin':fresh.TOOLS14,
                 'bundle_profile_ref':p.ref(profile),'manifest_ref':p.ref(manifest),'task_ref':p.ref(task),
                 'input_pins':inputs,'explicit_final_reference_policy':'INLINE_ONLY','case_id':card['case_id'],
                 'execution_enabled':base['execution_enabled'],'public_get':base['public_get']})
            preservations.append({'new_job_id':job,'original_pending_job_id':row['job_id'],'source_stage_ref':row['prepared_stage_ref'],
                      'original_sealed_stage_ref':row['sealed_stage_ref'],'source_owner_registration_ref':row['owner_registration_ref'],
                      'source_task_ref':{'path':old['prompt_file'],'sha256':old['prompt_sha256']},'source_inputs':old['input_pins'],
                      'unchanged_role_fields':{k:old.get(k) for k in p.INVARIANTS}})
        p.put(root/'PIPELINE_CLOSURE.json',{'schema':'er9.both-arm-complete-target-role-closure.v1','pair_id':pair,
                     'stages':closures,'source_pair_id':original_pair,'source_card_ref':rows[0]['card_ref'],
                     'common_final_reference_policy':'INLINE_ONLY','both_arms_complete_before_either_native_target':True,
                     'old_seed_shared_auth_and_same_arm_inputs_preserved':True,'native_starts':0,
                     'full_research_pipeline_or_fresh_discovery_claimed':False})
        reg={'schema':'er9.dispatch-registration.v1','request_id':pair+'-r001','pair_id':pair,'source_slot':rows[0]['source_slot'],
             'family':'L','requested_model':'GPT-6 Luna','requested_effort':'Max','card_path':str(root/'card.json'),
             'card_sha256':p.sha(root/'card.json'),'stage_jobs':jobs,'resource_binding':common_ref,
             'pipeline_closure':p.ref(root/'PIPELINE_CLOSURE.json'),'scientific_recovery_mode':'coupled_targeted_diagnostic_transport_version',
             'source_successor_request_ref':REQUEST,'root_scope_required':False,'root_or_max_go_required':False,
             'admission_owner':'codex-er9-ops','automatic_retry':False,'status':'PREPARED_NOT_ADMITTED','native_starts':0,
             'supersedes_pending_stage_job_ids':[r['job_id'] for r in rows],
             'dispatch_selection_rule':'Exact source requested rows native0/noLaunchIntent, one BOTH-arm B lineage; do not admit superseded v1.3 finals',
             'original_clocks_costs_failure_flags_preserved':True,'no_new_premium_authored_answers_or_evaluator_feedback_supplied':True,
             'explicit_INLINE_ONLY_all_four_native_authorship':True}
        p.put(root/'registration.json',reg);requests.append(p.ref(root/'registration.json'))
    p.put(destination/'PRESERVATION.json',{'schema':'er9.ordinary-diagnostic-transport-preservation.v1','stages':preservations,
                       'original_sealed_source_bytes_rewritten':False,'new_premium_authored_source_claims':False})
    p.put(destination/'OUTBOX.json',{'schema':'er9.ordinary-diagnostic-bundle-outbox.v1','requests':requests,'pair_count':len(requests),
              'native_stage_count':len(preservations),'source_selector_ref':REQUEST,'preservation_ref':p.ref(destination/'PRESERVATION.json'),
              'explicit_common_INLINE_ONLY_native_final4':True,'old_seed_roles_source_inputs_preserved':True,
              'V06_both_arms_excluded':True,'new_quality_or_approval_gate':False,'native_starts':0})
    print(json.dumps(p.ref(destination/'OUTBOX.json')))

if __name__=='__main__':prepare()

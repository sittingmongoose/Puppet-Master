#!/usr/bin/env python3
"""Actual explicitly admitted role metadata only; candidate bytes remain opaque.

No directory scan, grade selection, Goal ID invention, source correction or
native IO decoding. Caller supplies exact actual origin jobs and frozen card.
"""
import copy
import importlib.util
import json
from pathlib import Path
import prepare_successors as p

ROOT=Path(__file__).resolve().parent
CAPSULE={'path':str(p.LAB/'ops/dispatcher/ROLE_GOAL_IDENTITY_CAPSULES_002.json'),
         'sha256':'5e65eb930861dc3739eea8d0af930081efbe4702ebd564984c471551c62eb673'}

def tool_module():
    path=p.LAB/'dev/tools/versions/v1.4-bundle/operator_binding.py'
    spec=importlib.util.spec_from_file_location('actual_bundle_operator_binding',path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module

def source_card(freeze,binding_ref=None):
    launch=p.checked(freeze['pair_freeze'])
    card_ref=launch.get('card') or launch.get('card_ref')
    if not card_ref and 'source_card_ref' in launch:card_ref=launch['source_card_ref']
    if not card_ref and binding_ref:
        binding=p.checked(binding_ref)
        if binding.get('schema')!='er9.launched-stage-source-card-binding.v1':raise ValueError('Explicit launched-stage source card sidecar required')
        if any(binding.get(k)!=freeze.get(k) for k in ['job_id','pair_id','arm','stage']):raise ValueError('Foreign launched source card identity')
        if binding['launch_seal_ref']!=freeze['pair_freeze']:raise ValueError('Source card sidecar belongs to a different launch seal')
        stage=p.checked(binding['launched_stage_ref'])
        if stage['pair_freeze']!=binding['launch_seal_ref'] or stage['prompt_sha256']!=launch['prompt_sha256']:
            raise ValueError('Actual launched runtime is not bound to this exact source launch seal')
        if any(stage.get(k)!=freeze.get(k) for k in ['job_id','pair_id','arm','stage']):raise ValueError('Launched stage is another source actor')
        owner=p.checked(binding['owner_registration_ref'])
        card_ref=binding['card_ref']
        if owner['card_path']!=card_ref['path'] or owner['card_sha256']!=card_ref['sha256'] or owner['pair_id']!=freeze['pair_id']:
            raise ValueError('Source card not bound to actual launched owner registration')
        declared=[r for r in owner['stage_jobs'] if r['job_id']==freeze['job_id'] and r['arm']==freeze['arm'] and r['stage']==freeze['stage']]
        if len(declared)!=1:
            raise ValueError('Source native job missing from actual owner declaration')
        if {'path':declared[0]['stage_json'],'sha256':declared[0]['stage_sha256']}!=launch['prepared_stage']:
            raise ValueError('Source owner stage pin differs from actual prelaunch prepared seal')
    if not card_ref:raise ValueError('Actual native freeze lacks explicit original card binding')
    return card_ref,p.checked(card_ref)

def hydrate(spec,card,origin_job_ids,operator_profile,capsule_ref=CAPSULE,source_card_binding_refs=None):
    capsule=p.checked(capsule_ref);module=tool_module();ws=Path(spec['workspace']);entries=[];pins={}
    if (ws/'out/final').exists():raise ValueError('Canonical commit directory must remain absent')
    case=card['case_id'];arm=spec['arm']
    for job in origin_job_ids:
        matches=[r for r in capsule['rows'] if r['job_id']==job]
        if len(matches)!=1:raise ValueError('Exact actual positive source identity capsule required')
        observed=matches[0];freeze=p.checked(observed['output_freeze'])
        if (observed['arm']!=arm or freeze['arm']!=arm or freeze['job_id']!=job or
            observed['native_goal_starts']<1 or freeze.get('native_quiescent') is not True):
            raise ValueError('Wrong-arm or nonquiescent unactivated source')
        binding_ref=(source_card_binding_refs or {}).get(job) or observed.get('source_card_binding_ref')
        card_ref,origin_card=source_card(freeze,binding_ref)
        if origin_card['case_id']!=case:raise ValueError('Foreign case cannot become a same-arm role')
        model=observed.get('observed_model')
        if isinstance(model,dict):model=model.get('modelId')
        actor={'family':observed['observed_family'],'model':model,'effort':observed.get('observed_effort')}
        identity={'origin_job_id':job,'origin_case_id':origin_card['case_id'],'origin_arm_id':arm,
                  'origin_role':observed['stage'],'origin_goal_id':observed['origin_goal_id'],
                  'origin_session_id':observed.get('native_session_id') or observed.get('native_thread_id'),
                  'origin_actor':actor,
                  'origin_status':{'native_goal_state':observed['native_goal_state'],
                     'output_freeze_state':'immutable_owned_quiet; operational_complete='+str(observed['output_freeze_state']['operational_complete']).lower()}}
        meta={'schema':'er9.accepted-neutral-native-role-provenance.v1',**identity,
              'origin_actor_family':actor['family'],'source_capsule_ref':capsule_ref,
              'source_capsule_record_selector':'/rows/'+str(capsule['rows'].index(observed)),
              'original_capsule':observed,'source_card_ref':card_ref,'source_card_binding_ref':binding_ref,
              'native_goal_starts':observed['native_goal_starts'],
              'immutable_freeze_observations':[observed['output_freeze']],
              'frozen_artifact_inventory':freeze['artifacts'],
              'source_semantics_or_quality_assessed':False}
        activation=observed['activation_time_observation'];end=observed['freeze_time_observation']
        start=end['saved_birth_epoch_seconds']
        meta.update(window_start_epoch_seconds=start,window_end_epoch_seconds=end['filesystem_mtime_epoch_seconds'])
        if 'epoch_seconds' in activation:
            meta['activation_epoch_seconds']=activation['epoch_seconds'];clock='unix_epoch_seconds';value=activation['epoch_seconds'];selector='/activation_epoch_seconds'
        elif 'utc' in activation:
            meta['activation_utc']=activation['utc'];clock='utc';value=activation['utc'];selector='/activation_utc'
        else:raise ValueError('Actual positive activation time absent; no invented timestamp')
        relative='inputs/native_role_proofs/'+job+'/provenance.json';meta_path=ws/relative;p.put(meta_path,meta);pins[str(meta_path)]=p.sha(meta_path)
        selectors={k:'/'+k for k in ['origin_job_id','origin_case_id','origin_arm_id','origin_role','origin_actor_family']}
        receipt={'path':relative,'sha256':p.sha(meta_path),'record_selector':'','binding_selectors':selectors}
        proof={**identity,'schema':'er9.native-source-role-proof.v1',
               'native_goal_activation_count':observed['native_goal_starts'],'immutable_freeze_observation_count':1,
               'activation_receipt':{**receipt,'count_selector':'/native_goal_starts','observed_count':observed['native_goal_starts']},
               'freeze_receipt':{**receipt,'count_selector':'/immutable_freeze_observations','observed_count':1},
               'activation_time':{'clock':clock,'value':value,'basis':'actual_native_start','receipt':receipt,'selector':selector},
               'freeze_time':None,'activation_time_nonexposure_reason':None,
               'freeze_time_nonexposure_reason':'Original source exposes immutable freeze file mtime window, not a distinct exact native freeze transition',
               'goal_id_nonexposure_reason':observed['goal_identity_kind'] if observed['origin_goal_id'] is None else None,
               'activation_window_start':{'clock':'unix_epoch_seconds','value':start,'basis':'saved_worker_birth','receipt':receipt,'selector':'/window_start_epoch_seconds'},
               'freeze_window_end':{'clock':'unix_epoch_seconds','value':end['filesystem_mtime_epoch_seconds'],'basis':'immutable_freeze_receipt_filesystem_mtime','receipt':receipt,'selector':'/window_end_epoch_seconds'}}
        proof_rel='inputs/native_role_proofs/'+job+'/native_proof.json';proof_path=ws/proof_rel;p.put(proof_path,proof);pins[str(proof_path)]=p.sha(proof_path)
        # Exact frozen namespace/filenames, all compatible roles. No body inspection.
        for artifact in freeze['artifacts']:
            name=Path(artifact['relative_path']).name
            if name not in module.carrier.NAMES:continue
            if Path(artifact['relative_path']).parent not in {Path('research'),Path('final'),Path('revision')}:continue
            rel='inputs/prior/'+job+'/'+artifact['relative_path'];path=ws/rel
            if str(path) not in spec['input_pins'] or spec['input_pins'][str(path)]!=artifact['sha256']:
                raise ValueError('Compatible reference must already be an explicitly admitted same-arm input')
            if p.sha(path)!=artifact['sha256'] or path.stat().st_size!=artifact['bytes']:
                raise ValueError('Actual imported source bytes drifted')
            entries.append({**identity,'input_id':job+'-'+name.replace('.','-'),'path':rel,
                    'sha256':artifact['sha256'],'bytes':artifact['bytes'],'artifact_role':name,
                    'case_id':case,'arm_id':arm,'native_proof':{'path':proof_rel,'sha256':p.sha(proof_path)},
                    'admission_kind':'same_arm_role','shared_seed_authorization':None})
    result=module.binding(stage_id=spec['job_id'],stage_role='final_author' if spec['stage']=='revision' else spec['stage'],
              case_id=case,arm_id=arm,method_factors=[card['method_id']],
              actor_binding={'stage_id':spec['job_id'],'family':card['candidate_family'],'model':'gpt-6-luna' if card['candidate_family']=='Luna' else 'builtin:zai-coding-plan/GLM-5.3-Flash',
                             'effort':'max','native_goal_id':None,'writer_alias':'write_text'},
              entries=entries,complete_final_role=True)
    manifest=ws/'inputs/delivery_role_manifest.json';manifest.write_bytes(result['manifest_bytes']);pins[str(manifest)]=p.sha(manifest)
    profile=Path(operator_profile);profile.parent.mkdir(parents=True,exist_ok=True)
    if profile.exists():raise ValueError('Private operator profile already sealed')
    profile.write_bytes(result['profile_bytes']);profile.chmod(0o600)
    module.carrier.load_profile(profile,p.sha(profile))
    closure=module.carrier.reference_closure(result['profile'],lambda rel:(ws/rel).read_bytes())
    if len(closure)!=len(entries):raise ValueError('Actual reference closure incomplete')
    return {'profile_ref':p.ref(profile),'manifest_ref':p.ref(manifest),'new_input_pins':pins,
            'actual_reference_count':len(entries),'actual_origin_jobs':list(origin_job_ids),'native_starts':0}

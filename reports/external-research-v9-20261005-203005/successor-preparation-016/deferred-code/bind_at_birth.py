#!/usr/bin/env python3
"""One pinned mechanical binding plan; no scan, inference, selection or launch.

Operations: pair_inputs freezes every required authentic input role once for
both arms; stage copies the frozen seed and exact listed same-arm predecessors
into a new immutable role-birth workspace. Missing or failed roles are errors.
"""
import argparse
import copy
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
import prepare_deferred as d

def confined(destination):
    destination=Path(destination).absolute()
    if ROOT not in destination.parents or destination.exists():
        raise ValueError('One new destination in the owned lane required')
    if any(p.is_symlink() for p in (destination,*destination.parents)):
        raise ValueError('Aliased birth path denied')
    return destination

def native(freeze_ref, job_id, pair_id, arm, expected_stage, required):
    freeze=d.checked(freeze_ref)
    if (freeze['job_id']!=job_id or freeze['pair_id']!=pair_id or freeze['arm']!=arm or
        freeze['stage']!=expected_stage or freeze.get('operational_complete') is not True or
        freeze.get('native_quiescent') is not True or (freeze.get('native_goal_starts') or 0)<1):
        raise ValueError('Exact completed quiet native role required: '+job_id)
    receipt_ref=freeze['native_receipt'];receipt=d.checked(receipt_ref)
    identity=receipt.get('identity',{})
    active=receipt.get('native_goal_set_receipt',{}).get('goal',{})
    terminal=receipt.get('native_goal_terminal_receipt',{}).get('goal',{})
    if (active.get('status')!='active' or terminal.get('status')!='complete' or
        not active.get('threadId') or active['threadId']!=terminal.get('threadId') or
        identity.get('model')!='gpt-6-luna' or identity.get('effort')!='max' or
        receipt.get('model_fallback_allowed') is not False):
        raise ValueError('Positive genuine standalone Luna/max activation and terminal identity required')
    inventory={a['relative_path']:a for a in freeze['artifacts']}
    for path in required:
        path=path.removeprefix('out/')
        if path not in inventory or inventory[path]['bytes']<=0:
            raise ValueError('Actual required role absent: '+path)
    for artifact in freeze['artifacts']:
        relative=Path(artifact['relative_path'])
        if relative.is_absolute() or '..' in relative.parts:
            raise ValueError('Native artifact path traversal denied')
        original=d.p.regular(artifact['path'])
        if original.stat().st_size!=artifact['bytes'] or d.p.sha(original)!=artifact['sha256']:
            raise ValueError('Immutable native role bytes changed')
    return freeze,receipt_ref,identity

def actual_spec(ref,job,base=None):
    spec=d.checked(ref)
    if spec['job_id']!=job: raise ValueError('Wrong actual origin descriptor')
    for path,digest in spec['input_pins'].items():
        if d.p.sha(d.p.regular(path))!=digest: raise ValueError('Original supplied input drift')
    if base is not None and not {x['sha256'] for x in base['candidate_files'].values()} <= set(spec['input_pins'].values()):
        raise ValueError('Origin role did not receive exact complete original fixed base')
    return spec

def extend_role(seed,assignment,declared,source_rows,source_pair,output_root):
    role=declared['role'];job=declared['job_id']
    row=source_rows[job]
    if role in seed['candidate_files']: raise ValueError('An existing genuine role cannot be replaced')
    freeze,receipt_ref,identity=native(assignment['freeze_ref'],job,source_pair,'seed',row['stage'],row['required_artifacts'])
    spec=actual_spec(assignment['actual_stage_ref'],job,seed)
    item=next(a for a in freeze['artifacts'] if a['relative_path']==declared['required_artifact'])
    if item['relative_path'] not in d.imported.ROLE_PATHS[role]:
        raise ValueError('Other-role alias cannot supply missing role')
    seed['candidate_files'][role]={'path':item['path'],'sha256':item['sha256'],'origin_job_id':job,
        'original_relative_path':item['relative_path'],'bytes':item['bytes']}
    seed['origin_freezes'].append({**assignment['freeze_ref'],'actual_family':'Luna',
        'actual_model':identity['model'],'actual_effort':identity['effort'],'native_receipt':receipt_ref})
    seed['cold_cost_references'].append({'job_id':job,'native_receipt':receipt_ref,
        'original_native_goal_starts':freeze['native_goal_starts'],'original_elapsed_seconds':freeze['elapsed_seconds'],
        'reuse_new_native_starts':0,'accounting_rule':'Actual authentic source role charged once; failed/held original costs stay separately retained.'})
    d.captures.ROOT=output_root
    seed['public_source_files'].extend(d.captures.snapshot_captures(job,spec))

def bind_pair_inputs(plan,plan_ref):
    registration=d.checked(plan['registration_ref'])
    if registration.get('pair_actual_inputs_required') is not True: raise ValueError('Target pair contract required')
    card=d.checked({'path':registration['card_path'],'sha256':registration['card_sha256']})
    freeze=d.checked(registration['immutable_pair_input_freeze'])
    base=d.checked(freeze['base_seed_ref']);d.imported.verify(base)
    destination=confined(ROOT/'actual-inputs'/registration['pair_id'])
    supplied=plan['source_role_assignments']
    required={x['role'] for x in registration['source_role_bindings'] if 'job_id' in x}
    if set(supplied)!=required: raise ValueError('Exactly all source-card roles required, no best-of/extra role')
    source_registration=d.checked(plan['source_registration_ref'])
    if source_registration['pair_id']!=f"SEED-DEV-{card['domain']}-DEFERRED-R001":
        raise ValueError('Wrong shared source-domain registration')
    source_rows={r['job_id']:r for r in source_registration['stage_jobs']}
    seed=copy.deepcopy(base)
    # Each role validates against the original fixed base, before another role is appended.
    for declared in registration['source_role_bindings']:
        if 'existing_native_seed_ref' in declared:
            existing=d.checked(declared['existing_native_seed_ref']);d.imported.verify(existing)
            if existing['base_origin_ref']!=freeze['base_seed_ref']: raise ValueError('Existing dependency belongs to other base')
            if declared['role'] in seed['candidate_files']: raise ValueError('Cannot overwrite frozen native role')
            role=declared['role'];seed['candidate_files'][role]=copy.deepcopy(existing['candidate_files'][role])
            seed['origin_freezes']=copy.deepcopy(existing['origin_freezes'])
            seed['public_source_files']=copy.deepcopy(existing['public_source_files'])
            seed['cold_cost_references']=copy.deepcopy(existing['cold_cost_references'])
        else:
            assignment=supplied[declared['role']]
            # Validate origin's fixed-base receipt without requiring other future roles in its input.
            native_freeze=d.checked(assignment['freeze_ref'])
            row=source_rows[declared['job_id']]
            native(assignment['freeze_ref'],declared['job_id'],source_registration['pair_id'],'seed',row['stage'],row['required_artifacts'])
            actual_spec(assignment['actual_stage_ref'],declared['job_id'],base)
            # extend_role performs identical native checks and body-opaque capture normalization.
            prior_roles=copy.deepcopy(seed['candidate_files'])
            validation_base=copy.deepcopy(seed);validation_base['candidate_files']=copy.deepcopy(base['candidate_files'])
            extend_role(validation_base,assignment,declared,source_rows,source_registration['pair_id'],destination/'opaque-imports')
            validation_base['candidate_files']={**prior_roles,declared['role']:validation_base['candidate_files'][declared['role']]}
            seed=validation_base
    seed.update(base_origin_ref=freeze['base_seed_ref'],roles_available=list(seed['candidate_files']),
                roles_missing=sorted(d.imported.ALLOWED-set(seed['candidate_files'])),
                added_authentic_role_origins=[x.get('job_id') for x in registration['source_role_bindings'] if 'job_id' in x],
                source_grade_used_for_selection=False,mechanical_extension_new_native_starts=0)
    d.imported.verify(seed)
    manifest=destination/'SEED_MANIFEST.json';d.put(manifest,seed)
    seal=destination/'PAIR_ACTUAL_INPUT_SEAL.json'
    d.put(seal,{'schema':'er9.deferred-pair-actual-input-seal.v1','pair_id':registration['pair_id'],
        'source_slot':registration['source_slot'],'registration_ref':plan['registration_ref'],
        'prospective_pair_freeze_ref':registration['immutable_pair_input_freeze'],
        'versioned_card_ref':{'path':registration['card_path'],'sha256':registration['card_sha256']},
        'base_seed_ref':freeze['base_seed_ref'],'seed_manifest_ref':d.ref(manifest),
        'source_registration_ref':plan['source_registration_ref'],'actual_source_role_assignments':supplied,
        'plan_ref':plan_ref,'both_arm_same_seed_content_digest':d.imported.digest(seed),
        'all_source_roles_native_complete_quiet_verified':True,
        'source_suitability':'UNASSESSED_PER_FACET; no automatic PASS/mix inference',
        'model_or_native_calls':0,'all_original_failure_cost_refs_preserved':True})
    return d.ref(seal)

def copy_seed_roles(seed,policy,ws,input_pins):
    for role in [*policy,*d.CATALOGS]:
        if role not in seed['candidate_files']: raise ValueError('Genuine required source role absent: '+role)
        item=seed['candidate_files'][role];target=ws/'inputs/seed'/(role+Path(item['path']).suffix)
        if target.exists():
            if d.p.sha(target)!=item['sha256']: raise ValueError('Frozen original seed role changed')
        else:d.clone(item['path'],target,item['sha256'])
        input_pins[str(target)]=item['sha256']
    # All sources are carried, including honest incomplete returned captures; no semantic filtering.
    index=[]
    for n,item in enumerate(seed['public_source_files']):
        target=ws/'inputs/source_context/actual'/(str(n).zfill(4)+'.body')
        input_pins[str(target)]=d.clone(item['path'],target,item['sha256'])
        index.append({'candidate_path':str(target.relative_to(ws)),'url':item['url'],
            'version_or_commit':item['version_or_commit'],'sha256':item['sha256'],
            'capture_id':item['origin_capture_id'],'capture_limitations':item.get('capture_limitations')})
    target=ws/'inputs/source_context/actual_index.json'
    d.put(target,{'schema':'er9.candidate-source-index.v1','sources':index});input_pins[str(target)]=d.p.sha(target)

def bind_stage(plan,plan_ref):
    registration=d.checked(plan['registration_ref'])
    row=next(x for x in registration['stage_jobs'] if x['job_id']==plan['job_id'])
    if plan['arm']!=row['arm']:raise ValueError('Wrong target arm')
    original=d.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
    destination=confined(plan['destination_root']);ws=destination/'workspace';(ws/'out').mkdir(parents=True)
    task=ws/'TASK.md';d.clone(original['prompt_file'],task,original['prompt_sha256'])
    pins={}
    for path,digest in original['input_pins'].items():
        relative=Path(path).relative_to(original['workspace'])
        pins[str(ws/relative)]=d.clone(path,ws/relative,digest)
    if row.get('source_role_binding_required'):
        seal=d.checked(plan['pair_actual_input_seal_ref'])
        if seal['registration_ref']!=plan['registration_ref'] or seal['pair_id']!=registration['pair_id']:
            raise ValueError('Both-arm immutable actual input seal belongs to another pair')
        seed=d.checked(seal['seed_manifest_ref']);d.imported.verify(seed)
        if d.imported.digest(seed)!=seal['both_arm_same_seed_content_digest']:raise ValueError('Sealed actual pair seed changed')
        copy_seed_roles(seed,row['original_source_step']['seed_input_policy']['candidate_roles'],ws,pins)
    predecessors=plan['predecessor_assignments']
    if list(predecessors)!=row['all_same_arm_prior_job_ids']: raise ValueError('Exact ordered same-arm predecessor closure required')
    rows={r['job_id']:r for r in registration['stage_jobs']}
    ancestry=[]
    for job,assignment in predecessors.items():
        prior=rows[job]
        if prior['arm']!=row['arm']:raise ValueError('Cross-arm or unregistered predecessor denied')
        freeze,receipt_ref,identity=native(assignment['freeze_ref'],job,registration['pair_id'],row['arm'],prior['stage'],prior['required_artifacts'])
        spec=actual_spec(assignment['actual_stage_ref'],job)
        for item in freeze['artifacts']:
            target=ws/'inputs/prior'/job/item['relative_path']
            pins[str(target)]=d.clone(item['path'],target,item['sha256'])
        d.captures.ROOT=destination/'opaque-prior-captures'
        captured=d.captures.snapshot_captures(job,spec)
        nav=[]
        for n,item in enumerate(captured):
            target=ws/'inputs/prior_sources'/job/(str(n).zfill(4)+'.body')
            pins[str(target)]=d.clone(item['path'],target,item['sha256'])
            nav.append({'candidate_path':str(target.relative_to(ws)),'url':item['url'],
                'version_or_commit':item['version_or_commit'],'sha256':item['sha256'],
                'capture_limitations':item.get('capture_limitations')})
        navigation=ws/'inputs/prior_sources'/job/'index.json'
        d.put(navigation,{'schema':'er9.candidate-source-index.v1','sources':nav});pins[str(navigation)]=d.p.sha(navigation)
        ancestry.append({'job_id':job,'freeze_ref':assignment['freeze_ref'],'actual_stage_ref':assignment['actual_stage_ref'],
                         'native_receipt_ref':receipt_ref,'all_actual_frozen_artifacts_carried':True,
                         'all_actual_origin_public_captures_carried':True})
    result=copy.deepcopy(original)
    result.update(workspace=str(ws),prompt_file=str(task),prompt_sha256=d.p.sha(task),input_pins=pins,
        out=str(destination/'native'),freeze_out=str(destination/'OUTPUT_FREEZE.json'),
        source_stage_ref={'path':row['stage_json'],'sha256':row['stage_sha256']},
        prior_binding_required=False,source_role_binding_required=False,
        pair_actual_input_seal_ref=plan.get('pair_actual_input_seal_ref'),role_birth_binding_plan_ref=plan_ref,
        actual_role_birth_closure_complete=True,actual_native_runtime_and_resource_binding_still_required=True)
    if result.get('inline_only_bundle'):
        profile=d.checked(result['bundle_profile'])
        if profile['stage_id']!=row['job_id'] or profile['arm_id']!=row['arm']:raise ValueError('Wrong frozen current-stage bundle profile')
        carrier=d.load_module(d.LAB/'dev/tools/versions/v1.4-bundle/bundle_carrier.py','birth_carrier')
        if carrier.reference_closure(profile,lambda rel:(ws/rel).read_bytes())!={}:raise ValueError('Inline-only reference closure changed')
        if (ws/'out/final').exists():raise ValueError('Canonical final directory must remain absent')
    path=destination/'role-bound-stage.json';d.put(path,result)
    receipt=destination/'ROLE_BIRTH_RECEIPT.json'
    d.put(receipt,{'schema':'er9.deferred-native-role-birth-receipt.v1','plan_ref':plan_ref,
        'job_id':row['job_id'],'pair_id':registration['pair_id'],'arm':row['arm'],'stage_ref':d.ref(path),
        'source_stage_ref':result['source_stage_ref'],'unchanged_task_sha256':original['prompt_sha256'],
        'actual_pair_input_seal_ref':plan.get('pair_actual_input_seal_ref'),'actual_predecessors':ancestry,
        'same_models_semantic_duties_method_factor_budgets_retained':True,
        'source_quality_or_native_goal_outcome_inferred':False,'old_attempts_rewritten':False,'model_or_native_calls':0,
        'dispatch_condition':'Ops pins actual profile+resource placement, original birth clock, selected runtime/tool constructor, native identity and ownership/service/growth gates before inference.'})
    return d.ref(receipt)

def bind(plan_ref):
    plan=d.checked(plan_ref)
    if plan.get('schema')!='er9.deferred-role-binding-plan.v1':raise ValueError('Exact deferred binding plan required')
    d.validate_source_versions()
    if plan['operation']=='pair_inputs':return bind_pair_inputs(plan,plan_ref)
    if plan['operation']=='stage':return bind_stage(plan,plan_ref)
    raise ValueError('Only pair_inputs or stage mechanical binding operation')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan',type=Path,required=True);parser.add_argument('--plan-sha256',required=True)
    args=parser.parse_args();print(json.dumps(bind({'path':str(args.plan.absolute()),'sha256':args.plan_sha256})))

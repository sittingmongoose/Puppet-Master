"""Strict NEW same-arm confirmation ancestry, no scan, grade or quality choice."""
from pathlib import Path
import argparse
import copy
import json
import prepare as owner
p=owner.p
MODEL='builtin:zai-coding-plan/GLM-5.3-Flash'

def observed_model(value):
    # Only explicit observed capsule fields, never requested card or suffix inference.
    return value.get('modelId') if isinstance(value,dict) else value

def validated_ancestry(registration_ref,current_job_id,capsule_ref,closed_context_refs):
    registration=p.checked(registration_ref);rows={r['job_id']:r for r in registration['stage_jobs']};target=rows[current_job_id]
    ids=target['all_same_arm_prior_job_ids'];capsule=p.checked(capsule_ref);contexts={}
    for ref in closed_context_refs:
        context=p.checked(ref)
        if context['job_id'] in contexts:raise ValueError('Duplicate closed context')
        if (context.get('schema')!='er9.closed-native-source-context.v1' or context.get('native_goal_starts',0)<1 or
            context.get('native_model_io_or_candidate_semantics_included') is not False):raise ValueError('Actual closed native capture DTO required')
        contexts[context['job_id']]=(ref,context)
    if set(contexts)!=set(ids):raise ValueError('All exact new ancestors need owned closed context exports, including empty')
    selected=[]
    for job in ids:
        row=rows[job];matches=[r for r in capsule['rows'] if r['job_id']==job]
        if len(matches)!=1:raise ValueError('Unique positive new native origin capsule required')
        actual=matches[0];freeze=p.checked(actual['output_freeze'])
        if actual['pair_id']!=registration['pair_id'] or actual['arm']!=target['arm'] or row['arm']!=target['arm']:
            raise ValueError('Old cohort or other-arm role denied')
        if actual.get('observed_family') not in {'Z','GLM'} or observed_model(actual.get('observed_model'))!=MODEL or actual.get('observed_effort')!='max':
            raise ValueError('Actual observed GLM Flash Max origin required')
        if actual['stage']!=row['stage'] or any(freeze.get(k)!=actual[k] for k in ['job_id','pair_id','arm','stage']):raise ValueError('Exact declared native origin identity required')
        if freeze.get('operational_complete') is not True or freeze.get('native_quiescent') is not True or freeze.get('native_goal_starts')!=1 or actual.get('native_goal_starts')!=1:
            raise ValueError('Operational complete, positive native, owned quiet required')
        if actual['native_goal_state'] not in {'complete','COMPLETED'}:raise ValueError('Actual completed native Goal required')
        if actual.get('origin_goal_id') is None:raise ValueError('GLM actual distinct native Goal ID required, not a session relabel')
        if freeze.get('goal_target_id')!=actual['origin_goal_id']:raise ValueError('Distinct Goal ID must match actual frozen native target, never session alias')
        stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
        required=[n.removeprefix('out/') for n in stage['required_artifacts']]
        inventory={a['relative_path']:a for a in freeze['artifacts']}
        if len(inventory)!=len(freeze['artifacts']):raise ValueError('Duplicate frozen artifact paths denied')
        if any(n not in inventory or inventory[n]['bytes']<=0 for n in required):raise ValueError('All original expected artifact roles required')
        context_ref,context=contexts[job]
        if context['output_freeze']!=actual['output_freeze'] or context['owned_quiet_positive'] is not True or context['arm']!=target['arm']:
            raise ValueError('Exact same owned quiet origin context required')
        namespaces={str(Path(n).parent) for n in required}
        artifacts=[a for a in freeze['artifacts'] if str(Path(a['relative_path']).parent) in namespaces]
        for artifact in artifacts:
            path=Path(artifact['path'])
            if path.is_symlink() or p.sha(path)!=artifact['sha256'] or path.stat().st_size!=artifact['bytes']:raise ValueError('Frozen native role bytes drift')
        selected.append({'origin_job_id':job,'freeze_ref':actual['output_freeze'],'origin_goal_id':actual['origin_goal_id'],
            'source_identity_capsule_ref':capsule_ref,'closed_context_ref':context_ref,'required_role_paths':required,
            'all_role_namespace_artifacts':artifacts,'all_captures':context['sources'],
            'selection':'Every declared new native ancestor namespace and owned capture; no grade/content/bestof selection'})
    return selected

def import_ancestry(registration_ref,current_job_id,capsule_ref,closed_context_refs,workspace):
    """Ops-only role birth opaque copying into a NEW runtime workspace, before Goal."""
    registration=p.checked(registration_ref);target=next(r for r in registration['stage_jobs'] if r['job_id']==current_job_id)
    prepared=p.checked({'path':target['stage_json'],'sha256':target['stage_sha256']})
    ws=Path(workspace).absolute()
    if ws==Path(prepared['workspace']).absolute():raise ValueError('Never mutate a frozen prepared source workspace')
    if any(x.is_symlink() for x in (ws,*ws.parents)) or not (ws/'inputs').is_dir():raise ValueError('Fresh confined runtime workspace required')
    selected=validated_ancestry(registration_ref,current_job_id,capsule_ref,closed_context_refs);pins={}
    for origin in selected:
        for artifact in origin['all_role_namespace_artifacts']:
            relative=Path(artifact['relative_path'])
            if relative.is_absolute() or '..' in relative.parts:raise ValueError('Confined original role namespace required')
            target=ws/'inputs/prior'/origin['origin_job_id']/relative
            if target.exists():raise ValueError('Never overwrite current admitted input')
            p.clone_bytes(artifact['path'],target,artifact['sha256'],Path(artifact['path']).parent)
            pins[str(target)]=artifact['sha256']
        contexts=[]
        for index,item in enumerate(origin['all_captures']):
            # Preserve every exact original HTTP result, including error/incomplete,
            # without reading source bodies or choosing for content/quality.
            body=item['body'];source=Path(body['path'])
            if 'public_captures' not in source.parts or p.p_private(source):raise ValueError('Only authentic owned public-capture bytes admitted')
            if p.sha(source)!=body['sha256'] or source.stat().st_size!=body['bytes'] or p.sha(item['metadata']['path'])!=item['metadata']['sha256']:
                raise ValueError('Exact native capture body/provenance pins required')
            relative='inputs/source_context/'+origin['origin_job_id']+'/'+str(index).zfill(4)+'.body';target=ws/relative
            if target.exists():raise ValueError('Current source capture already imported')
            p.clone_bytes(source,target,body['sha256'],source.parent);pins[str(target)]=body['sha256']
            contexts.append({'candidate_path':relative,'url':item['requested_url'],'actual_url':item['actual_url'],'sha256':body['sha256'],
                'status':item['status'],'body_complete':item['body_complete'],'version_or_commit':item['source_version'],'capture_id':item['capture_id'],
                'capture_limitations':'Original capture retained; source meaning and validity UNASSESSED'})
        context=ws/'inputs/source_context'/origin['origin_job_id']/'index.json'
        p.put(context,{'schema':'er9.candidate-source-index.v1','sources':contexts});pins[str(context)]=p.sha(context)
    return {'input_pins':pins,'authenticated_new_origins':selected,'native_calls':0}

def bind(plan_ref):
    """Original explicit operator plan ABI, usable for research/critic/final roles.

    Called only by sole ops at actual birth. Emits a NEW packet, never launches.
    Actual action clock/config remain the pinned production worker's preGoal duty.
    """
    plan=p.checked(plan_ref)
    if plan.get('schema')!='er9.actual-role-birth-binding-plan.v1':raise ValueError('Explicit pinned operator birth plan required')
    registration=p.checked(plan['registration_ref']);target=next(r for r in registration['stage_jobs'] if r['job_id']==plan['job_id'])
    if plan['arm']!=target['arm'] or plan['origin_job_ids']!=target['all_same_arm_prior_job_ids']:raise ValueError('Exact new target/declared ancestor order required')
    source_ref={'path':target['stage_json'],'sha256':target['stage_sha256']};source=p.checked(source_ref)
    destination=Path(plan['destination_root']).absolute()
    approved=[owner.ROOT,p.LAB/'ops/dispatcher/role-birth']
    if not any(root in destination.parents for root in approved):raise ValueError('Operator birth directory outside declared source/ops lane')
    if destination.exists():raise ValueError('New immutable runtime birth directory required')
    ws=destination/'workspace';ws.mkdir(parents=True);(ws/'out').mkdir()
    task=ws/'TASK.md';p.clone_bytes(source['prompt_file'],task,source['prompt_sha256'],source['workspace']);pins={}
    for path,digest in source['input_pins'].items():
        relative=Path(path).relative_to(source['workspace']);target_path=ws/relative
        p.clone_bytes(path,target_path,digest,source['workspace']);pins[str(target_path)]=digest
    imports=import_ancestry(plan['registration_ref'],plan['job_id'],plan['capsule_ref'],plan['closed_source_context_refs'],ws)
    selected=copy.deepcopy(source);selected.update(workspace=str(ws),prompt_file=str(task),input_pins={**pins,**imports['input_pins']},
        out=str(destination/'native'),freeze_out=str(destination/'OUTPUT_FREEZE.json'),role_birth_binding_plan_ref=plan_ref,
        authenticated_new_ancestry=imports['authenticated_new_origins'],source_stage_ref=source_ref)
    selected['glm_resource'].update(capture_dir=str(destination/'public_captures'),evidence_dir=str(destination/'tool-evidence'))
    # Preserve the prospectively fixed empty INLINE_ONLY carrier profile. Never
    # hydrate an input_id reference or silently select an old donor profile.
    p.put(destination/'role-bound-stage.json',selected)
    receipt={'schema':'er9.actual-role-birth-binding-receipt.v1','plan_ref':plan_ref,'job_id':selected['job_id'],'pair_id':selected['pair_id'],
        'arm':selected['arm'],'stage_ref':p.ref(destination/'role-bound-stage.json'),'original_task_ref':p.ref(task),
        'actual_role_ancestry':imports['authenticated_new_origins'],'fixed_inline_only_profile':selected['glm_resource']['bundle_profile'],
        'all_semantic_fields_caps_and_static_Task_unchanged':True,'old_descriptor_rewritten':False,'model_or_native_calls':0,
        'dispatch_condition':'Actual worker original role clock/config/resource proof + exact both/all cohort source and admission/resource gates before native Goal'}
    p.put(destination/'ROLE_BIRTH_RECEIPT.json',receipt);return p.ref(destination/'ROLE_BIRTH_RECEIPT.json')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--plan',required=True);parser.add_argument('--plan-sha256',required=True)
    args=parser.parse_args();print(json.dumps(bind({'path':str(Path(args.plan).absolute()),'sha256':args.plan_sha256})))

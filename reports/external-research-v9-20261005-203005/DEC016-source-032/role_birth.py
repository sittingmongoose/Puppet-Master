"""Strict fixed current R plus NEW same-arm repair critic; no old critic fallback."""
import argparse,copy,json
from pathlib import Path
import prepare as owner
p=owner.p

def normalizer():
    pin=p.checked(owner.NORMALIZER);path=p.ROOT/'proof-model-normalizer-001/normalizer.py'
    if p.sha(path)!=pin['source_pins'][str(path)]:raise ValueError('Pinned exact native model DTO normalizer drift')
    return owner.module('actual_observed_model',path)

def validated_ancestry(registration_ref,current_job_id,capsule_ref,closed_context_refs):
    reg=p.checked(registration_ref);rows={r['job_id']:r for r in reg['stage_jobs']};target=rows[current_job_id]
    contract=p.checked(reg['strict_repair_role_birth_contract']);fixed=next(r for r in contract['fixed_research_parent_rows'] if r['arm']==target['arm'])
    expected=target['all_same_arm_prior_job_ids'];capsule=p.checked(capsule_ref);contexts={}
    for ref in closed_context_refs:
        ctx=p.checked(ref)
        if ctx['job_id'] in contexts:raise ValueError('Duplicate source context')
        contexts[ctx['job_id']]=(ref,ctx)
    if set(contexts)!=set(expected):raise ValueError('Every exact declared R/new-critic parent needs actual closed context, including empty')
    if expected[0]!=fixed['job_id'] or any(j!=fixed['job_id'] and (j not in rows or rows[j]['arm']!=target['arm'] or rows[j]['stage']!='critique') for j in expected):
        raise ValueError('Only exact current R and NEW same-arm repair critic declared')
    result=[];model=normalizer()
    for job in expected:
        source_ref=fixed['stage_ref'] if job==fixed['job_id'] else {'path':rows[job]['stage_json'],'sha256':rows[job]['stage_sha256']}
        source=p.checked(source_ref);matches=[r for r in capsule['rows'] if r['job_id']==job]
        if len(matches)!=1:raise ValueError('Unique actual native origin capsule required')
        actual=matches[0];freeze=p.checked(actual['output_freeze'])
        expected_pair=fixed['pair_id'] if job==fixed['job_id'] else reg['pair_id']
        if actual['pair_id']!=expected_pair or actual['arm']!=target['arm'] or actual['stage']!=source['stage'] or any(freeze.get(k)!=actual[k] for k in ['job_id','pair_id','arm','stage']):
            raise ValueError('Wrong current parent/arm/stage/cohort rejected')
        if job==fixed['job_id'] and actual['output_freeze']!=fixed['freeze_ref']:raise ValueError('Only exact authenticated current research freeze, no alternate R')
        if actual.get('observed_family')!='Z' or model.observed_model(actual.get('observed_model'))!='builtin:zai-coding-plan/GLM-5.3-Flash' or actual.get('observed_effort')!='max':
            raise ValueError('Actual explicit original GLMFlashMax required')
        if actual.get('native_goal_starts')!=1 or actual.get('native_goal_state') not in {'complete','COMPLETED'} or actual.get('origin_goal_id') is None or actual['origin_goal_id']!=freeze.get('goal_target_id'):
            raise ValueError('Actual distinct completed native Goal target required')
        if freeze.get('native_goal_starts')!=1 or freeze.get('operational_complete') is not True or freeze.get('native_quiescent') is not True:
            raise ValueError('Full operational-complete/ownedquiet source required, failed old critics denied')
        required=[n.removeprefix('out/') for n in source['required_artifacts']];inventory={a['relative_path']:a for a in freeze['artifacts']}
        if len(inventory)!=len(freeze['artifacts']) or any(n not in inventory or inventory[n]['bytes']<=0 for n in required):raise ValueError('Complete expected R4 or new critic review required')
        context_ref,ctx=contexts[job]
        if ctx.get('schema')!='er9.closed-native-source-context.v1' or ctx.get('arm')!=target['arm'] or ctx.get('output_freeze')!=actual['output_freeze'] or ctx.get('owned_quiet_positive') is not True or ctx.get('native_goal_starts')!=1 or ctx.get('native_model_io_or_candidate_semantics_included') is not False:
            raise ValueError('Exact current owned closed captures required')
        namespaces={Path(n).parts[0] for n in required};artifacts=[]
        for artifact in freeze['artifacts']:
            relative=Path(artifact['relative_path'])
            if relative.is_absolute() or '..' in relative.parts:raise ValueError('Confined artifact path required')
            if relative.parts[0] in namespaces:artifacts.append(artifact)
        # Source author uses metadata only. Actual byte verification/copy occurs
        # solely in bind at ops original role birth, never semantic decoding.
        result.append({'origin_job_id':job,'freeze_ref':actual['output_freeze'],'actual_goal_id':actual['origin_goal_id'],
          'native_capsule_ref':capsule_ref,'closed_context_ref':context_ref,'all_captures':ctx['sources'],'artifacts':artifacts,
          'origin_kind':'fixed_current_research' if job==fixed['job_id'] else 'new_samearm_repair_critic'})
    return result

def bind(plan_ref):
    plan=p.checked(plan_ref)
    if plan.get('schema')!='er9.actual-role-birth-binding-plan.v1':raise ValueError('Pinned exact operator plan required')
    reg=p.checked(plan['registration_ref']);row=next(r for r in reg['stage_jobs'] if r['job_id']==plan['job_id'])
    if row['arm']!=plan['arm'] or row['all_same_arm_prior_job_ids']!=plan['origin_job_ids']:raise ValueError('Exact declared current parent order/target required')
    origins=validated_ancestry(plan['registration_ref'],plan['job_id'],plan['capsule_ref'],plan.get('closed_context_refs',plan.get('closed_source_context_refs',[])))
    source_ref={'path':row['stage_json'],'sha256':row['stage_sha256']};source=p.checked(source_ref);destination=Path(plan['destination_root']).absolute()
    if not any(root in destination.parents for root in [owner.ROOT,p.LAB/'ops/dispatcher/role-birth']):raise ValueError('Declared source/ops role-birth lane required')
    if destination.exists():raise ValueError('New immutable runtime workspace required')
    ws=destination/'workspace';ws.mkdir(parents=True);(ws/'out').mkdir();task=ws/'TASK.md';p.clone_bytes(source['prompt_file'],task,source['prompt_sha256'],source['workspace']);inputs={}
    for path,digest in source['input_pins'].items():
        target=ws/Path(path).relative_to(source['workspace']);p.clone_bytes(path,target,digest,source['workspace']);inputs[str(target)]=digest
    for origin in origins:
        for artifact in origin['artifacts']:
            original=Path(artifact['path']);target=ws/'inputs/prior'/origin['origin_job_id']/artifact['relative_path']
            if p.sha(original)!=artifact['sha256'] or original.stat().st_size!=artifact['bytes']:raise ValueError('Actual current native parent artifact SHA/bytes drift')
            p.clone_bytes(original,target,artifact['sha256'],original.parent);inputs[str(target)]=artifact['sha256']
        index=[]
        for i,item in enumerate(origin['all_captures']):
            body=item['body'];original=Path(body['path'])
            if 'public_captures' not in original.parts or p.p_private(original):raise ValueError('Owned public-capture path required')
            if p.sha(original)!=body['sha256'] or original.stat().st_size!=body['bytes'] or p.sha(item['metadata']['path'])!=item['metadata']['sha256']:raise ValueError('Exact capture/provenance pins required')
            rel='inputs/source_context/'+origin['origin_job_id']+'/'+str(i).zfill(4)+'.body';target=ws/rel
            p.clone_bytes(original,target,body['sha256'],original.parent);inputs[str(target)]=body['sha256']
            index.append({'candidate_path':rel,'url':item['requested_url'],'actual_url':item['actual_url'],'sha256':body['sha256'],'status':item['status'],
              'body_complete':item['body_complete'],'version_or_commit':item['source_version'],'capture_id':item['capture_id'],'limitations':'Exact native capture retained; source meaning/quality unassessed'})
        target=ws/'inputs/source_context'/origin['origin_job_id']/'index.json';p.put(target,{'schema':'er9.candidate-source-index.v1','sources':index});inputs[str(target)]=p.sha(target)
    selected=copy.deepcopy(source);selected.update(workspace=str(ws),prompt_file=str(task),input_pins=inputs,out=str(destination/'native'),freeze_out=str(destination/'OUTPUT_FREEZE.json'),
      source_stage_ref=source_ref,role_birth_binding_plan_ref=plan_ref,actual_current_parent_proofs=origins)
    selected['glm_resource'].update(capture_dir=str(destination/'public_captures'),evidence_dir=str(destination/'tool-evidence'))
    p.put(destination/'role-bound-stage.json',selected)
    receipt={'schema':'er9.actual-role-birth-binding-receipt.v1','plan_ref':plan_ref,'job_id':source['job_id'],'pair_id':source['pair_id'],'arm':source['arm'],
      'stage_ref':p.ref(destination/'role-bound-stage.json'),'original_Task_ref':p.ref(task),'actual_current_parent_proofs':origins,
      'old_failed_critics_or_otherarms_admitted':False,'scientific_instructions_model_caps_unchanged':True,'model_or_native_calls':0,'old_clocks_reset':False}
    p.put(destination/'ROLE_BIRTH_RECEIPT.json',receipt);return p.ref(destination/'ROLE_BIRTH_RECEIPT.json')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--plan',required=True);parser.add_argument('--plan-sha256',required=True);a=parser.parse_args()
    print(json.dumps(bind({'path':str(Path(a.plan).absolute()),'sha256':a.plan_sha256})))

"""Explicit frozen OP-selected WARM same-arm origins; no native calls or answers."""
import argparse,copy,json
from pathlib import Path
import prepare as owner
p=owner.p

def validated_origins(registration_ref,selection_ref=None):
    registration=p.checked(registration_ref);target=registration['stage_jobs'][0]
    declared=registration['warm_origin_selection_ref']
    if selection_ref is not None and selection_ref!=declared:raise ValueError('Selection is fixed, never alternate/bestof')
    selected=p.checked(declared);owner.positive_metadata(selected['rows']);capsule=p.checked(selected['capsule_ref'])
    origins=[r for r in selected['rows'] if (r['source_slot'],r['arm'])==(registration['source_slot'],target['arm'])]
    if [r['job_id'] for r in origins]!=target['warm_origin_job_ids']:raise ValueError('All exact selected same-arm origin order required')
    card=p.checked({'path':registration['card_path'],'sha256':registration['card_sha256']});result=[]
    for row in origins:
        observed=[x for x in capsule['rows'] if x['job_id']==row['job_id']]
        if len(observed)!=1:raise ValueError('Unique actual native identity capsule required')
        actual=observed[0];freeze=p.checked(row['freeze_ref']);stage=p.checked(row['stage_ref']);source_card=p.checked(row['card_ref'])
        for field in ['job_id','pair_id','arm','stage']:
            if row[field]!=actual[field] or row[field]!=freeze[field] or row[field]!=stage[field]:raise ValueError('Exact actual origin joins required')
        if row['pair_id']!=registration['source_pair_id'] or row['arm']!=target['arm'] or source_card['case_id']!=card['case_id']:raise ValueError('Foreign case/arm/cohort source rejected')
        if actual.get('observed_family')!='L' or actual.get('observed_model')!='gpt-6-luna' or actual.get('observed_effort')!='max':raise ValueError('Actual observed original Luna Max required')
        if actual.get('native_goal_state')!='complete' or actual.get('native_goal_starts')!=1 or actual.get('output_freeze')!=row['freeze_ref']:
            raise ValueError('Actual one completed native Goal/freeze required')
        if actual.get('origin_goal_id') is None and (not actual.get('native_thread_id') or not actual.get('goal_identity_kind')):raise ValueError('L thread-attached Goal proof required, no invented separate ID')
        if freeze.get('operational_complete') is not True or freeze.get('native_quiescent') is not True or freeze.get('native_goal_starts')!=1:raise ValueError('Completed positive quiet freeze required')
        required=[n.removeprefix('out/') for n in stage['required_artifacts']];artifacts={a['relative_path']:a for a in row['artifacts']}
        if len(artifacts)!=len(row['artifacts']) or any(n not in artifacts or artifacts[n]['bytes']<=0 for n in required):raise ValueError('Full required original native artifacts required')
        if row['artifacts']!=freeze['artifacts']:raise ValueError('Exact frozen native artifact inventory identity required')
        context=p.checked(row['closed_source_context_ref'])
        if context.get('schema')!='er9.closed-native-source-context.v1' or context.get('job_id')!=row['job_id'] or context.get('arm')!=target['arm'] or context.get('output_freeze')!=row['freeze_ref'] or context.get('owned_quiet_positive') is not True or context.get('native_goal_starts')!=1 or context.get('native_model_io_or_candidate_semantics_included') is not False:
            raise ValueError('Current exact owned native closed captures required')
        admitted=[]
        for artifact in row['artifacts']:
            relative=Path(artifact['relative_path'])
            if relative.is_absolute() or '..' in relative.parts:raise ValueError('Native role namespace confinement required')
            if relative.parts[0] in {'research','critique'} or (relative.parts[0]=='final' and relative.name in {'proposal.md','sources.json','witnesses.json','leads.json'}):admitted.append(artifact)
        result.append({'origin_job_id':row['job_id'],'freeze_ref':row['freeze_ref'],'source_card_ref':row['card_ref'],'native_capsule_ref':selected['capsule_ref'],
            'native_goal_id':actual.get('origin_goal_id'),'native_thread_id':actual.get('native_thread_id'),'goal_identity_kind':actual.get('goal_identity_kind'),
            'artifacts':admitted,'context_ref':row['closed_source_context_ref'],'all_captures':context['sources'],'current_final':row['pipeline_final']})
    if sum(x['current_final'] for x in result)!=1:raise ValueError('Exactly one current native final required')
    return result

def bind(plan_ref):
    plan=p.checked(plan_ref)
    if plan.get('schema')!='er9.actual-role-birth-binding-plan.v1':raise ValueError('Pinned explicit original operator plan ABI required')
    registration=p.checked(plan['registration_ref']);row=registration['stage_jobs'][0]
    if plan['job_id']!=row['job_id'] or plan['arm']!=row['arm'] or plan['origin_job_ids']!=row['warm_origin_job_ids']:raise ValueError('Exact fixed current target/origin IDs required')
    origins=validated_origins(plan['registration_ref'],plan.get('selection_ref'))
    source_ref={'path':row['stage_json'],'sha256':row['stage_sha256']};source=p.checked(source_ref)
    destination=Path(plan['destination_root']).absolute()
    if not any(root in destination.parents for root in [owner.ROOT,p.LAB/'ops/dispatcher/role-birth']):raise ValueError('Declared operator lane confinement required')
    if destination.exists():raise ValueError('New immutable role-birth workspace required')
    ws=destination/'workspace';ws.mkdir(parents=True);(ws/'out').mkdir();task=ws/'TASK.md'
    p.clone_bytes(source['prompt_file'],task,source['prompt_sha256'],source['workspace']);inputs={}
    for path,digest in source['input_pins'].items():
        target=ws/Path(path).relative_to(source['workspace']);p.clone_bytes(path,target,digest,source['workspace']);inputs[str(target)]=digest
    for origin in origins:
        for artifact in origin['artifacts']:
            original=Path(artifact['path']);target=ws/'inputs/prior'/origin['origin_job_id']/artifact['relative_path']
            if p.sha(original)!=artifact['sha256'] or original.stat().st_size!=artifact['bytes']:raise ValueError('Actual frozen native role bytes drift')
            p.clone_bytes(original,target,artifact['sha256'],original.parent);inputs[str(target)]=artifact['sha256']
        index=[]
        for i,item in enumerate(origin['all_captures']):
            body=item['body'];original=Path(body['path'])
            if 'public_captures' not in original.parts or p.p_private(original):raise ValueError('Owned public capture confinement required')
            if p.sha(original)!=body['sha256'] or original.stat().st_size!=body['bytes'] or p.sha(item['metadata']['path'])!=item['metadata']['sha256']:raise ValueError('Native capture/provenance SHA bytes drift')
            rel='inputs/source_context/'+origin['origin_job_id']+'/'+str(i).zfill(4)+'.body';target=ws/rel
            p.clone_bytes(original,target,body['sha256'],original.parent);inputs[str(target)]=body['sha256']
            index.append({'candidate_path':rel,'url':item['requested_url'],'actual_url':item['actual_url'],'sha256':body['sha256'],'status':item['status'],
                'body_complete':item['body_complete'],'version_or_commit':item['source_version'],'capture_id':item['capture_id'],'limitations':'Original native capture retained; source correctness UNASSESSED'})
        target=ws/'inputs/source_context'/origin['origin_job_id']/'index.json';p.put(target,{'schema':'er9.candidate-source-index.v1','sources':index});inputs[str(target)]=p.sha(target)
    selected=copy.deepcopy(source);selected.update(workspace=str(ws),prompt_file=str(task),input_pins=inputs,out=str(destination/'native'),freeze_out=str(destination/'OUTPUT_FREEZE.json'),
        role_birth_binding_plan_ref=plan_ref,authenticated_current_warm_origins=origins,source_stage_ref=source_ref)
    p.put(destination/'role-bound-stage.json',selected)
    receipt={'schema':'er9.actual-role-birth-binding-receipt.v1','plan_ref':plan_ref,'job_id':source['job_id'],'pair_id':source['pair_id'],'arm':source['arm'],
        'stage_ref':p.ref(destination/'role-bound-stage.json'),'original_task_ref':p.ref(task),'native_origin_proof_refs':[x['freeze_ref'] for x in origins],
        'all_current_authentic_samearm_roles_and_captures_retained':True,'candidate_inputs_contain_evaluator_or_supervision_metadata':False,
        'model_or_native_calls':0,'warm_derivative_only':True,'extra_fresh_or_matched_target_credit':False,'old_deadlines_or_source_files_changed':False}
    p.put(destination/'ROLE_BIRTH_RECEIPT.json',receipt);return p.ref(destination/'ROLE_BIRTH_RECEIPT.json')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--plan',required=True);parser.add_argument('--plan-sha256',required=True)
    a=parser.parse_args();print(json.dumps(bind({'path':str(Path(a.plan).absolute()),'sha256':a.plan_sha256})))

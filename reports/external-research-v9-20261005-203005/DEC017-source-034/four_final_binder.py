"""Exactly four fixed current R+critic final-only bindings plus deterministic index."""
import argparse,copy,json
from pathlib import Path
import source_builder as owner
import prior_index
p=owner.p

def validated_parents(registration_ref,current_job_id):
    reg=p.checked(registration_ref);row=next(r for r in reg['stage_jobs'] if r['job_id']==current_job_id)
    contract=p.checked(reg['fixed_final_parent_contract']);selection=p.checked(contract['fixed_parent_selection_ref']);owner.positive_four_parents(selection)
    target=next(r for r in selection['rows'] if r['source_slot']==reg['source_slot'] and r['arm']==row['arm'])
    if row['all_same_arm_prior_job_ids']!=[r['job_id'] for r in target['parents']]:raise ValueError('Only exact current authenticated R+critic pair, no substitutes')
    result=[]
    for parent in target['parents']:
        stage=p.checked(parent['actual_stage_ref']);required={Path(n.removeprefix('out/')).parts[0] for n in stage['required_artifacts']}
        context=p.checked(parent['closed_source_context_ref'])
        if context.get('schema')!='er9.closed-native-source-context.v1' or context.get('job_id')!=parent['job_id'] or context.get('arm')!=row['arm'] or context.get('output_freeze')!=parent['freeze_ref'] or context.get('owned_quiet_positive') is not True or context.get('native_goal_starts')!=1 or context.get('native_model_io_or_candidate_semantics_included') is not False:
            raise ValueError('Exact owned current closed captures required')
        artifacts=[]
        for artifact in parent['artifacts']:
            rel=Path(artifact['relative_path'])
            if rel.is_absolute() or '..' in rel.parts:raise ValueError('Confined current role path required')
            if rel.parts[0] in required:artifacts.append(artifact)
        result.append({'origin_job_id':parent['job_id'],'origin_role':parent['stage'],'origin_arm_id':row['arm'],
          'freeze_ref':parent['freeze_ref'],'closed_context_ref':parent['closed_source_context_ref'],'artifacts':artifacts,'captures':context['sources']})
    return result

def bind(plan_ref):
    plan=p.checked(plan_ref)
    if plan.get('schema')!='er9.actual-role-birth-binding-plan.v1':raise ValueError('Explicit pinned original operator plan required')
    reg=p.checked(plan['registration_ref']);row=next(r for r in reg['stage_jobs'] if r['job_id']==plan['job_id'])
    if plan['arm']!=row['arm'] or plan['origin_job_ids']!=row['all_same_arm_prior_job_ids']:raise ValueError('Exact current target/parent order required')
    origins=validated_parents(plan['registration_ref'],plan['job_id']);source_ref={'path':row['stage_json'],'sha256':row['stage_sha256']};source=p.checked(source_ref)
    destination=Path(plan['destination_root']).absolute()
    if not any(root in destination.parents for root in [owner.ROOT,p.LAB/'ops/dispatcher/role-birth']):raise ValueError('Declared source/ops original birth lane required')
    if destination.exists():raise ValueError('New immutable role-birth directory required')
    ws=destination/'workspace';ws.mkdir(parents=True);(ws/'out').mkdir();task=ws/'TASK.md';p.clone_bytes(source['prompt_file'],task,source['prompt_sha256'],source['workspace']);pins={};neutral={}
    for path,digest in source['input_pins'].items():
        rel=Path(path).relative_to(source['workspace']);target=ws/rel;p.clone_bytes(path,target,digest,source['workspace']);pins[str(target)]=digest;neutral[rel.as_posix()]=digest
    imported=[]
    for origin in origins:
        for artifact in origin['artifacts']:
            original=Path(artifact['path']);rel='inputs/prior/'+origin['origin_job_id']+'/'+artifact['relative_path'];target=ws/rel
            if p.sha(original)!=artifact['sha256'] or original.stat().st_size!=artifact['bytes']:raise ValueError('Actual current parent artifact SHA/bytes drift')
            p.clone_bytes(original,target,artifact['sha256'],original.parent);pins[str(target)]=artifact['sha256']
            imported.append({'path':rel,'sha256':artifact['sha256'],'bytes':artifact['bytes'],'origin_job_id':origin['origin_job_id'],'origin_role':origin['origin_role'],'origin_arm_id':row['arm']})
        index=[]
        for i,item in enumerate(origin['captures']):
            body=item['body'];original=Path(body['path'])
            if 'public_captures' not in original.parts or p.p_private(original):raise ValueError('Owned public-capture path required')
            if p.sha(original)!=body['sha256'] or original.stat().st_size!=body['bytes'] or p.sha(item['metadata']['path'])!=item['metadata']['sha256']:raise ValueError('Exact capture/provenance SHA bytes required')
            rel='inputs/source_context/'+origin['origin_job_id']+'/'+str(i).zfill(4)+'.body';target=ws/rel
            p.clone_bytes(original,target,body['sha256'],original.parent);pins[str(target)]=body['sha256']
            imported.append({'path':rel,'sha256':body['sha256'],'bytes':body['bytes'],'origin_job_id':origin['origin_job_id'],'origin_role':origin['origin_role'],'origin_arm_id':row['arm']})
            index.append({'candidate_path':rel,'url':item['requested_url'],'actual_url':item['actual_url'],'sha256':body['sha256'],'status':item['status'],
              'body_complete':item['body_complete'],'version_or_commit':item['source_version'],'capture_id':item['capture_id'],'limitations':'Original native capture; source meaning/quality unassessed'})
        rel='inputs/source_context/'+origin['origin_job_id']+'/index.json';target=ws/rel;p.put(target,{'schema':'er9.candidate-source-index.v1','sources':index});pins[str(target)]=p.sha(target)
        imported.append({'path':rel,'sha256':pins[str(target)],'bytes':target.stat().st_size,'origin_job_id':origin['origin_job_id'],'origin_role':origin['origin_role'],'origin_arm_id':row['arm']})
    authorization={'schema':'er9.accepted-own-prior-imports.v1','authenticated_same_arm':True,'job_id':source['job_id'],'pair_id':source['pair_id'],'arm':source['arm'],'imports':imported}
    p.put(destination/'ACCEPTED_OWN_PRIOR_IMPORTS.json',authorization)
    indexref=prior_index.freeze(ws,pins,neutral,authorization);pins[indexref['path']]=indexref['sha256']
    selected=copy.deepcopy(source);selected.update(workspace=str(ws),prompt_file=str(task),input_pins=pins,out=str(destination/'native'),freeze_out=str(destination/'OUTPUT_FREEZE.json'),
      role_birth_binding_plan_ref=plan_ref,source_stage_ref=source_ref,actual_prior_index_ref=indexref,authenticated_current_parent_proofs=origins)
    selected['glm_resource'].update(capture_dir=str(destination/'public_captures'),evidence_dir=str(destination/'tool-evidence'))
    p.put(destination/'role-bound-stage.json',selected)
    receipt={'schema':'er9.actual-role-birth-binding-receipt.v1','plan_ref':plan_ref,'job_id':source['job_id'],'pair_id':source['pair_id'],'arm':source['arm'],
      'stage_ref':p.ref(destination/'role-bound-stage.json'),'index_ref':indexref,'accepted_imports_ref':p.ref(destination/'ACCEPTED_OWN_PRIOR_IMPORTS.json'),
      'fixed_authentic_parents':origins,'model_or_native_calls':0,'Task_tools_model_clocks_caps_unchanged_at_birth':True,'extra_target_credit':False}
    p.put(destination/'ROLE_BIRTH_RECEIPT.json',receipt);return p.ref(destination/'ROLE_BIRTH_RECEIPT.json')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--plan',required=True);parser.add_argument('--plan-sha256',required=True);a=parser.parse_args()
    print(json.dumps(bind({'path':str(Path(a.plan).absolute()),'sha256':a.plan_sha256})))

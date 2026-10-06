"""Clone only an already-authenticated unentered own-prior binding; then index.

The original donor/Goal/quiet/hash validation remains sole ops' prerequisite.
This adapter validates its explicit import DTO against the exact bound pin map,
copies opaquely and never discovers paths, selects content or launches a Goal.
"""
import argparse,copy,json
from pathlib import Path
import source_builder as owner
import prior_index
p=owner.p

def bind(plan_ref):
    plan=p.checked(plan_ref)
    if plan.get('schema')!='er9.unentered-own-prior-navigation-binding-plan.v1':raise ValueError('Explicit pinned unentered navigation binding plan required')
    if plan.get('native_goal_starts')!=0 or plan.get('launch_intents')!=0:raise ValueError('Actual current unentered/noIntent proof required')
    template=p.checked(plan['navigation_template_ref']);source=p.checked(template['source_original_stage_ref']);bound=p.checked(plan['already_authenticated_bound_stage_ref']);auth=p.checked(plan['authorized_imports_ref'])
    for key in ['job_id','pair_id','arm','stage','max_seconds','max_responses','required_artifacts']:
        if template.get(key)!=source.get(key) or template.get(key)!=bound.get(key):raise ValueError('Same existing unentered role/model budget/source obligations required')
    for key in ['job_id','pair_id','arm']:
        if auth.get(key)!=template[key]:raise ValueError('Import authorization belongs to another target')
    source_neutral={Path(path).relative_to(source['workspace']).as_posix():digest for path,digest in source['input_pins'].items() if Path(path).relative_to(source['workspace']).parent==Path('inputs') and Path(path).name in owner.NEUTRAL}
    # Validate every admitted own-prior import against the old bound stage. No
    # directory walk or optional preference/grade ordering occurs.
    prior_index.encode(bound['workspace'],bound['input_pins'],source_neutral,auth)
    destination=Path(plan['destination_root']).absolute()
    if not any(root in destination.parents for root in [owner.ROOT,p.LAB/'ops/dispatcher/role-birth']):raise ValueError('Declared source/ops original role birth directory required')
    if destination.exists():raise ValueError('Fresh immutable navigation role workspace required')
    ws=destination/'workspace';ws.mkdir(parents=True);(ws/'out').mkdir();task=ws/'TASK.md';p.clone_bytes(template['prompt_file'],task,template['prompt_sha256'],template['workspace']);pins={};neutral={}
    for path,digest in template['input_pins'].items():
        rel=Path(path).relative_to(template['workspace']);target=ws/rel;p.clone_bytes(path,target,digest,template['workspace']);pins[str(target)]=digest;neutral[rel.as_posix()]=digest
    for item in auth['imports']:
        rel=prior_index.relative(item['path']);original=Path(bound['workspace'])/rel;target=ws/rel
        p.clone_bytes(original,target,item['sha256'],bound['workspace']);pins[str(target)]=item['sha256']
    actual_profile=bound.get('glm_resource',{}).get('bundle_profile')
    if template['complete_final_owner_role']:
        if not isinstance(actual_profile,dict):raise ValueError('Original actual authenticated carrier must bind before navigation index')
        profile=p.checked(actual_profile);manifest_rel=profile['import_manifest']['path'];manifest=ws/manifest_rel
        if manifest_rel not in prior_index.canonical_pins(ws,pins) or p.sha(manifest)!=profile['import_manifest']['sha256']:
            raise ValueError('Original actual carrier manifest exact SHA must survive opaque relocation')
        original_profile=p.checked(actual_profile)
        if original_profile['stage_id']!=template['job_id'] or original_profile['arm_id']!=template['arm']:raise ValueError('Actual original carrier target binding required')
    index=prior_index.freeze(ws,pins,neutral,auth)
    selected=copy.deepcopy(template);selected.update(workspace=str(ws),prompt_file=str(task),input_pins={**pins,index['path']:index['sha256']},
      out=str(destination/'native'),freeze_out=str(destination/'OUTPUT_FREEZE.json'),actual_prior_index_ref=index,
      original_authenticated_bound_stage_ref=plan['already_authenticated_bound_stage_ref'],accepted_imports_ref=plan['authorized_imports_ref'],source_navigation_plan_ref=plan_ref)
    selected['glm_resource'].update(capture_dir=str(destination/'public_captures'),evidence_dir=str(destination/'tool-evidence'))
    if template['complete_final_owner_role']:
        selected['glm_resource']['bundle_profile']=actual_profile
        selected['preserved_original_carrier_profile_ref']=actual_profile
        selected['preserved_original_carrier_manifest_ref']={'path':str(ws/manifest_rel),'sha256':profile['import_manifest']['sha256']}
    p.put(destination/'role-bound-stage.json',selected)
    receipt={'schema':'er9.actual-role-birth-binding-receipt.v1','plan_ref':plan_ref,'job_id':template['job_id'],'pair_id':template['pair_id'],'arm':template['arm'],
      'stage_ref':p.ref(destination/'role-bound-stage.json'),'index_ref':index,'original_authenticated_binding_retained':True,
      'old_source_or_entered_job_modified':False,'model_or_native_calls':0,'new_native_jobs':0,'no_original_role_clock_reset':True}
    if template['complete_final_owner_role']:
        receipt.update(original_carrier_profile_ref=actual_profile,original_carrier_manifest_sha256=profile['import_manifest']['sha256'],populated_or_empty_original_adoption_semantics_unchanged=True)
    p.put(destination/'ROLE_BIRTH_RECEIPT.json',receipt);return p.ref(destination/'ROLE_BIRTH_RECEIPT.json')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--plan',required=True);parser.add_argument('--plan-sha256',required=True);a=parser.parse_args()
    print(json.dumps(bind({'path':str(Path(a.plan).absolute()),'sha256':a.plan_sha256})))

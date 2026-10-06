#!/usr/bin/env python3
"""Exact role-birth hydration under already-frozen scientific/linking rules.

Operator supplies ONE pinned plan with positive actual capsule/context refs.
No scans, source body decoding, corrections, evaluator facts or model calls.
"""
import argparse
import copy
import json
from pathlib import Path
import shutil
import prepare_successors as p
import hydrate_role_proofs_v002 as h
import prepare_bundle_transport as transport

ROOT=Path(__file__).resolve().parent

def bind(plan_ref):
    plan=p.checked(plan_ref)
    if plan.get('schema')!='er9.actual-role-birth-binding-plan.v1':raise ValueError('Exact actual-role plan required')
    registration=p.checked(plan['registration_ref'])
    rows={r['job_id']:r for r in registration['stage_jobs']}
    target=rows[plan['job_id']]
    if target['arm']!=plan['arm']:raise ValueError('Wrong current target arm')
    source_spec_ref={'path':target['stage_json'],'sha256':target['stage_sha256']}
    source=p.checked(source_spec_ref)
    if source['required_artifacts']!=transport.FINAL_PATHS:raise ValueError('Only native complete final-role binder')
    card=p.checked({'path':registration['card_path'],'sha256':registration['card_sha256']})
    if card['method_id']=='V06':raise ValueError('Both V06 arms excluded')
    ancestors=target['all_same_arm_prior_job_ids']
    if plan['origin_job_ids']!=ancestors:raise ValueError('Exact registered ancestor order required; no role selection')
    capsule=p.checked(plan['capsule_ref'])
    context_refs=plan['closed_source_context_refs'];contexts={}
    for ref in context_refs:
        context=p.checked(ref);job=context['job_id']
        if job in contexts or job not in ancestors:raise ValueError('Duplicate or undeclared source context')
        contexts[job]=(ref,context)
    if set(contexts)!=set(ancestors):
        raise ValueError('Every declared ancestor requires actual closed capture export, including honest empty sources')
    destination=Path(plan['destination_root']).absolute()
    if ROOT not in destination.parents:raise ValueError('Binder mutation confined to source-owned lane')
    if destination.exists():raise ValueError('New owned immutable role-birth directory required')
    ws=destination/'workspace';ws.mkdir(parents=True);(ws/'out').mkdir()
    # Preserve the exact current frozen prospective Task, without adding facts.
    task=ws/'TASK.md';p.clone_bytes(source['prompt_file'],task,source['prompt_sha256'],source['workspace'])
    inputs={}
    for path,digest in source['input_pins'].items():
        rel=Path(path).relative_to(source['workspace']);new=ws/rel
        p.clone_bytes(path,new,digest,source['workspace']);inputs[str(new)]=digest
    ancestry=[]
    for job in ancestors:
        row=rows[job]
        if row['arm']!=target['arm']:raise ValueError('Cross-arm registered dependency')
        if job not in target['all_same_arm_prior_job_ids']:raise ValueError('Unregistered native ancestry')
        found=[r for r in capsule['rows'] if r['job_id']==job]
        if len(found)!=1:raise ValueError('One actual positive native identity row required')
        observed=found[0];freeze=p.checked(observed['output_freeze'])
        if observed['pair_id']!=registration['pair_id'] or observed['arm']!=target['arm']:
            raise ValueError('Other cohort/arm role cannot supply this fresh final')
        if freeze['job_id']!=job or freeze['pair_id']!=registration['pair_id'] or freeze['arm']!=target['arm'] or freeze.get('native_quiescent') is not True or freeze.get('native_goal_starts',0)<1:
            raise ValueError('Positive native activation and immutable quiet freeze required')
        predecessor=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
        required=[name.removeprefix('out/') for name in predecessor['required_artifacts']]
        artifacts={a['relative_path']:a for a in freeze['artifacts']}
        if any(name not in artifacts or artifacts[name]['bytes']<=0 for name in required):
            raise ValueError('Actual missing required predecessor role, no completed-pipeline invention')
        namespaces={str(Path(name).parent) for name in required}
        if namespaces-{'research','critique','revision','flash','final'}:raise ValueError('Unregistered artifact namespace')
        # Every frozen artifact in the actual role namespace is carried, no
        # preference for grade, content, apparent relevance or newer proposal.
        for name,artifact in artifacts.items():
            if str(Path(name).parent) not in namespaces:continue
            original=Path(artifact['path']);source_workspace=original
            for _ in Path(name).parts:source_workspace=source_workspace.parent
            new=ws/'inputs/prior'/job/name
            p.clone_bytes(original,new,artifact['sha256'],source_workspace)
            if new.stat().st_size!=artifact['bytes']:raise ValueError('Actual role byte count drift')
            inputs[str(new)]=artifact['sha256']
        context_ref,context=contexts[job]
        if context['output_freeze']!=observed['output_freeze']:raise ValueError('Closed captures belong to another native freeze')
        copies,proof=p.closed_context(context_ref,target['arm'],job)
        for item in copies:
            new=ws/item['destination_relative'];p.clone_bytes(item['path'],new,item['sha256'],item['source_workspace']);inputs[str(new)]=item['sha256']
        ancestry.append({'origin_job_id':job,'output_freeze':observed['output_freeze'],
                         'closed_context_proof':proof,'required_artifact_paths':required,
                         'original_native_goal_state':observed['native_goal_state'],
                         'original_operational_complete':freeze['operational_complete']})
    selected=copy.deepcopy(source)
    selected.update(workspace=str(ws),prompt_file=str(task),input_pins=inputs,
                    source_stage_ref=source_spec_ref,out=str(destination/'native'),freeze_out=str(destination/'OUTPUT_FREEZE.json'))
    closure=h.hydrate(selected,card,ancestors,destination/'operator-profile/bundle_profile.json',
              capsule_ref=plan['capsule_ref'],source_card_binding_refs=plan.get('source_card_binding_refs'))
    selected.update(input_pins={**inputs,**closure['new_input_pins']},bundle_profile=closure['profile_ref'],
               current_role_reference_closure=closure,dynamic_role_manifest_binding_required=False,bundle_profile_binding_required=False,
               role_birth_binding_plan_ref=plan_ref)
    if registration['family']=='Z':
        selected['glm_resource']=copy.deepcopy(source['glm_resource'])
        selected['glm_resource'].update(bundle_profile=closure['profile_ref'],capture_dir=str(destination/'public_captures'),evidence_dir=str(destination/'tool-evidence'))
    else:selected['additional_native_runner_argv']=['--bundle-profile',closure['profile_ref']['path']]
    p.put(destination/'role-bound-stage.json',selected)
    receipt={'schema':'er9.actual-role-birth-binding-receipt.v1','plan_ref':plan_ref,'job_id':target['job_id'],
       'pair_id':registration['pair_id'],'arm':target['arm'],'stage_ref':p.ref(destination/'role-bound-stage.json'),
       'original_task_ref':{'path':source['prompt_file'],'sha256':source['prompt_sha256']},
       'actual_role_ancestry':ancestry,'actual_reference_closure':closure,
       'all_semantic_fields_and_budgets_retained':True,'old_descriptor_rewritten':False,
       'original_predecessor_flags_costs_retained':True,'model_or_native_calls':0,
       'dispatch_condition':'Actual selected runtime config validates full profile/closure and all original ordinary resource gates before this current Goal'}
    p.put(destination/'ROLE_BIRTH_RECEIPT.json',receipt)
    return p.ref(destination/'ROLE_BIRTH_RECEIPT.json')

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--plan',type=Path,required=True);parser.add_argument('--plan-sha256',required=True)
    args=parser.parse_args();print(json.dumps(bind({'path':str(args.plan.absolute()),'sha256':args.plan_sha256})))

if __name__=='__main__':main()

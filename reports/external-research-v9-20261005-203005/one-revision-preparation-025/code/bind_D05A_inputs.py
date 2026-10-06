#!/usr/bin/env python3
"""DEC013 donor-only views invoking unchanged strict native input binders.

No new scientific gate or relaxation, failed output, state scan, source judgment,
model or native launch. One future authentic revision must complete fully before
the original three D05A target roles can receive the same new shared input seal.
"""
import argparse
import copy
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
import prepare_revision as p
p.birth.ROOT=ROOT

def bind(plan_ref):
    plan=p.checked(plan_ref)
    if plan.get('schema')!='er9.dec013-donor-input-binding-plan.v1':raise ValueError('Exact DEC013 donor plan required')
    p.controls()
    rule=p.checked(p.ref(ROOT/'D05A_DONOR_RULE_003.json'))
    target=p.checked(rule['target_binding_view_ref'])
    if plan['registration_ref']!=rule['target_binding_view_ref']:
        raise ValueError('Only frozen donor-only D05A binding view permitted')
    if target.get('binding_view_only') is not True or target.get('native_admission_forbidden') is not True:
        raise ValueError('Binding view must never create/admit target jobs')
    if plan['operation']=='pair_inputs':
        if plan['source_registration_ref']!=rule['source_binding_view_ref']:
            raise ValueError('Exact source view/current critic/new revision required')
        assignments=plan['source_role_assignments']
        if set(assignments)!={'critique','revision'}:
            raise ValueError('Exactly current critic plus sole NEW revision required')
        if assignments['critique']!={'freeze_ref':rule['existing_native_critic_ref']['freeze_ref'],
                                   'actual_stage_ref':rule['existing_native_critic_ref']['stage_ref']}:
            raise ValueError('No alternative or failed current critic selection')
        revision=p.checked(assignments['revision']['freeze_ref'])
        if revision['job_id']!=rule['sole_future_revision_job_id']:
            raise ValueError('Old failed revision cannot supply the new donor')
        # All genuine activation/terminal/identity, complete required paths,
        # quiet, original R4 inputs and capture lineage are checked by the
        # unchanged generic imported-v4/native binder at this exact call.
        return {'receipt_ref':p.birth.bind_pair_inputs(plan,plan_ref),'native_model_calls':0,
                'strict_binder_code_changed':False,'new_target_jobs_created':False}
    if plan['operation']!='stage':raise ValueError('Only pair_inputs or stage')
    row=next(r for r in target['stage_jobs'] if r['job_id']==plan['job_id'])
    if row['job_id'] not in [r['job_id'] for r in rule['exact_pending_target_stages']]:
        raise ValueError('No new or other target role')
    result=p.birth.bind_stage(plan,plan_ref)
    receipt=p.checked(result);spec=p.checked(receipt['stage_ref'])
    # The original target Task and prepared descriptor remain untouched. This
    # new role-birth administrative sidecar records the predeclared actual
    # donor selection, so an old pending donor label is never an authorship claim.
    updated=copy.deepcopy(spec)
    updated.update(source_role_bindings=target['source_role_bindings'],donor_rule_ref=p.ref(ROOT/'D05A_DONOR_RULE_003.json'),
        original_unchanged_target_registration_ref=rule['original_unchanged_target_registration_ref'])
    stage=Path(updated['workspace']).parent/'DEC013-role-bound-stage.json';p.put(stage,updated)
    receipt.update(stage_ref=p.ref(stage),unchanged_strict_binder_receipt_ref=result,
        predeclared_donor_rule_ref=p.ref(ROOT/'D05A_DONOR_RULE_003.json'),
        target_Task_model_budget_method_tools_unchanged=True,new_target_jobs_created=False)
    path=stage.parent/'DEC013_DONOR_BINDING_RECEIPT.json';p.put(path,receipt)
    return {'receipt_ref':p.ref(path),'native_model_calls':0,'strict_binder_code_changed':False,
            'new_target_jobs_created':False}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan',type=Path,required=True);parser.add_argument('--plan-sha256',required=True)
    args=parser.parse_args();print(json.dumps(bind({'path':str(args.plan.absolute()),'sha256':args.plan_sha256})))

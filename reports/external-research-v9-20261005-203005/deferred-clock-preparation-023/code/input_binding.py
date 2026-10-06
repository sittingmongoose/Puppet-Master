#!/usr/bin/env python3
"""Pinned source/prior byte hydration for one finite clock successor cohort.

The original strict imported-v4 native-complete/quiet/provenance binder remains
unchanged. This wrapper confines its new outputs here and records only explicit
legacy logical input-directory aliases, never old failed candidate output.
No Goal, source interpretation, clock creation, evaluator body or state scan.
"""
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parent
OLD=ROOT.parent
sys.path.insert(0,str(OLD))
import prepare_deferred as original
_spec=importlib.util.spec_from_file_location('unchanged_deferred_byte_binder',OLD/'bind_at_birth.py')
original_birth=importlib.util.module_from_spec(_spec);_spec.loader.exec_module(original_birth)
# Output confinement changes only this process's module variable. No old file
# or frozen helper byte is modified, and every old semantic/native gate stays.
original_birth.ROOT=ROOT

def checked(ref):return original.checked(ref)
def ref(path):return original.ref(path)

def check_closure():
    from prepare_clock import check_frozen_sources
    check_frozen_sources()
    closure=checked(ref(ROOT/'FULL_COHORT_FREEZE.json'))
    if closure['eligible_original_source_slots']!=['D-V05-A','D-V05-B','D-V06-A','D-V06-B','D-V13-A']:
        raise ValueError('Only exact five eligible original target slots')
    if closure['source_native_jobs']!=5 or closure['target_native_jobs']!=12:
        raise ValueError('Finite original role count changed')
    return closure

def bind(plan_ref):
    plan=checked(plan_ref)
    if plan.get('schema')!='er9.deferred-clock-input-binding-plan.v2':
        raise ValueError('Exact frozen clock input plan required')
    closure=check_closure()
    registration=checked(plan['registration_ref'])
    declared=closure['source_registration_refs']+closure['target_registration_refs']
    if plan['registration_ref'] not in declared:raise ValueError('Registration outside full frozen cohort')
    if registration.get('source_slot')=='D-V13-B':raise ValueError('Entered D13B has no clock successor')
    if plan['operation']=='pair_inputs':
        # Strict original gate: every required new role must really complete.
        result=original_birth.bind_pair_inputs(plan,plan_ref)
        return {'receipt_ref':result,'native_model_calls':0,'clock_constructor_not_invoked':True}
    if plan['operation']!='stage':raise ValueError('Only pair_inputs or stage')
    row=next(r for r in registration['stage_jobs'] if r['job_id']==plan['job_id'])
    if row['source_job_id'] not in closure['allowed_original_stage_ids']:
        raise ValueError('No undeclared extra native role')
    result=original_birth.bind_stage(plan,plan_ref)
    receipt=checked(result);source=checked(receipt['stage_ref'])
    aliases=row.get('predecessor_aliases',{})
    if aliases:
        ws=Path(source['workspace']);pins=copy.deepcopy(source['input_pins']);rows=[]
        for current,legacy in aliases.items():
            if current not in row['all_same_arm_prior_job_ids']:
                raise ValueError('Alias of unregistered current native predecessor')
            if not legacy or '/' in legacy or '..' in legacy:
                raise ValueError('Only exact declared logical job token aliases')
            actual=checked(plan['predecessor_assignments'][current]['freeze_ref'])
            if actual['job_id']!=current:raise ValueError('No failed old role can supply alias')
            for artifact in actual['artifacts']:
                target=ws/'inputs/prior'/legacy/artifact['relative_path']
                pins[str(target)]=original.clone(artifact['path'],target,artifact['sha256'])
            rows.append({'legacy_logical_input_directory_token':legacy,
                         'actual_genuine_current_native_job_id':current,
                         'actual_output_freeze_ref':plan['predecessor_assignments'][current]['freeze_ref'],
                         'old_failed_job_output_supplied':False})
        manifest=ws/'inputs/role_aliases.json'
        original.put(manifest,{'schema':'er9.explicit-native-role-directory-aliases.v1','aliases':rows,
            'selection':'Exact frozen new-role byte duplication for unchanged Task logical tokens; no old native authorship claim.'})
        pins[str(manifest)]=original.p.sha(manifest)
        source.update(input_pins=pins,legacy_role_aliases_ref=ref(manifest))
        stage=Path(source['workspace']).parent/'aliased-role-bound-stage.json';original.put(stage,source)
        receipt={**receipt,'stage_ref':ref(stage),'original_unmodified_binder_receipt_ref':result,
            'explicit_legacy_directory_aliases':rows,'old_failed_outputs_or_semantic_facts_used':False}
        sidecar=stage.parent/'CLOCK_INPUT_BINDING_RECEIPT.json';original.put(sidecar,receipt);result=ref(sidecar)
    return {'receipt_ref':result,'native_model_calls':0,'clock_constructor_not_invoked':True,
        'dispatch_condition':'Ops selects exact pinned L1.5 runtime/clock declaration and constructs actual original-clock profile/STAGE_CLOCK + second native text before Goal, preserving birth/action/cleanup deadlines.'}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan',type=Path,required=True);parser.add_argument('--plan-sha256',required=True)
    args=parser.parse_args();print(json.dumps(bind({'path':str(args.plan.absolute()),'sha256':args.plan_sha256})))

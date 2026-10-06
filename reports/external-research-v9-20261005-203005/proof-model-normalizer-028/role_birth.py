"""Additive isolated original strict constructor with one observed-DTO adapter.

Only model proof representation changes. All scientific, Goal, source-role,
same-arm, native-complete, ownedquiet and artifact hash guards remain original.
No old source file is edited. Zero native/model/process interfaces added.
"""
import argparse,hashlib,importlib.util,json,sys
from pathlib import Path
sys.dont_write_bytecode=True
from normalizer import observed_model
ROOT=Path(__file__).resolve().parent
BASE=ROOT.parent/'confirmation-clock-fresh-retest-001'
BASE_FILES={'prepare.py':'3b0df6050b5642ac351c8bd49a653203e0f4f4792ea22eecd8cdc3c89b7540ca',
            'role_birth.py':'4870654f74d365f06af651e225407746330b3158f5bd478c2c0f0c25163e4d5f'}

def module(name,path):
    sp=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m

def original_constructor():
    for name,digest in BASE_FILES.items():
        if hashlib.sha256((BASE/name).read_bytes()).hexdigest()!=digest:raise ValueError('Frozen original strict source constructor drift')
    # Load the original owner into a private import instance. Never patch a
    # shared/global constructor or modify its files, Tasks or native packets.
    owner=module('private_original_confirmation_owner',BASE/'prepare.py');previous=sys.modules.get('prepare')
    sys.modules['prepare']=owner
    try:original=module('private_original_confirmation_role_birth',BASE/'role_birth.py')
    finally:
        if previous is None:sys.modules.pop('prepare',None)
        else:sys.modules['prepare']=previous
    original.observed_model=observed_model
    return original

def validated_ancestry(registration_ref,current_job_id,capsule_ref,closed_context_refs):
    return original_constructor().validated_ancestry(registration_ref,current_job_id,capsule_ref,closed_context_refs)

def import_ancestry(registration_ref,current_job_id,capsule_ref,closed_context_refs,workspace):
    return original_constructor().import_ancestry(registration_ref,current_job_id,capsule_ref,closed_context_refs,workspace)

def bind(plan_ref):return original_constructor().bind(plan_ref)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--plan',required=True);p.add_argument('--plan-sha256',required=True);a=p.parse_args()
    print(json.dumps(bind({'path':str(Path(a.plan).absolute()),'sha256':a.plan_sha256})))

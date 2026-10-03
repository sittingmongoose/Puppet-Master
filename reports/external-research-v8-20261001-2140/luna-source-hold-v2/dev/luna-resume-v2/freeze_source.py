"""Source-only freeze/check. Never executes native code or imports ledger."""
import argparse
import ast
import hashlib
import json
from pathlib import Path
import time
HERE=Path(__file__).resolve().parent
LAB=HERE.parents[1]
ORIGINAL='d5a052cfac79a7342f4274c61390f852fc5b935e2b2f40faba821a6e55348a4a'
ORIGINAL_REVIEW='bb6e2e88534b1ba58578fd41124dc33fbcefeb9fc56809bc03e31e311931dad9'

def sha(path):
    p=Path(path)
    if not p.is_absolute() or not p.is_file() or any(q.is_symlink() for q in (p,*p.parents)):raise ValueError('regular public frozen path required')
    return hashlib.sha256(p.read_bytes()).hexdigest()

def write(path,obj):path.write_text(json.dumps(obj,indent=2)+'\n')

def check():
    for path in (HERE/'route-successor/SNAPSHOT.json',HERE/'SNAPSHOT.json'):
        value=json.loads(path.read_text())
        for item,pin in value['closure_sha256'].items():
            if sha(item)!=pin:raise ValueError('frozen closure drift: '+item)
    print(json.dumps({'status':'FROZEN_SOURCE_HOLD','controller_snapshot_sha256':sha(HERE/'SNAPSHOT.json'),'route_snapshot_sha256':sha(HERE/'route-successor/SNAPSHOT.json'),'candidate_or_provider_starts':0}))

def main():
    p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');a=p.parse_args()
    if a.check:return check()
    original=LAB/'dev/luna-route-v1/SNAPSHOT.json';review=LAB/'evaluation/luna-route-v1/review-freeze1.json'
    if sha(original)!=ORIGINAL or sha(review)!=ORIGINAL_REVIEW:raise ValueError('old frozen lineage changed')
    old=json.loads(original.read_text())
    for path,pin in old['closure_sha256'].items():
        if sha(path)!=pin:raise ValueError('old57 drift')
    for path in HERE.rglob('*.py'):ast.parse(path.read_text(),filename=str(path))
    selected=json.loads((HERE/'route-successor/selected-sources.json').read_text())
    reused={path:pin for path,pin in old['closure_sha256'].items() if '/dev/route-recovery-v1/' in path}
    assembly=LAB/'dev/route-recovery-v1/route-assembly-v1/SNAPSHOT.json';assembly_value=json.loads(assembly.read_text())
    for name in ('candidate_inputs.py',):
        source=LAB/'dev/route-recovery-v1'/name;pin=assembly_value['closure_sha256'][str(source)]
        if sha(source)!=pin:raise ValueError('exact accepted public primitive drift')
        reused[str(source)]=pin
    for path,pin in {**selected['sources'],**reused}.items():
        if sha(path)!=pin:raise ValueError('reused selected closure drift')
    route=HERE/'route-successor'
    own_route=[p for p in route.iterdir() if p.is_file() and p.name!='SNAPSHOT.json']
    base={'status':'FROZEN_FOR_INDEPENDENT_SOURCE_REVIEW_EXECUTION_HOLD','frozen_epoch':time.time(),'author_birth_epoch':1790990307.832144,'author_deadline_epoch':1790991507.832144,'model':'gpt-6-luna','effort':'max','native_response_policy':'wall-goal-token-observation-v1','max_responses_abi_sentinel':1,'source_pre_dispatch_create_goal_denial':'UNESTABLISHED_BLOCKING','actual_inference_tool_payload':'UNOBSERVED','http_model_attempts':'UNKNOWN','generated_usage':'UNKNOWN','cost':'UNKNOWN','author_native_goal_starts':0,'author_provider_calls':0,'author_auth_content_reads':0,'author_campaign_ledger_mutations':0,'no_original_birth_or_budget_reset':True,'independent_source_acceptance':'PENDING','native_canary_qualification':'NOT_RUN'}
    route_closure={**selected['sources'],**reused,**{str(p):sha(p) for p in own_route}}
    write(route/'SNAPSHOT.json',{**base,'schema':'er8.luna.route.snapshot.v1','version':'luna-resume-v2-route-freeze1','closure_sha256':dict(sorted(route_closure.items())),'original_freeze1':{'path':str(original),'sha256':ORIGINAL},'original_hold':{'path':str(review),'sha256':ORIGINAL_REVIEW}})
    control=json.loads((HERE/'recovery-control.json').read_text())
    accounting=[Path(control['ledger']['path']),Path(control['authority']['path']),Path(control['resume_authority']['path']),LAB/'ops/recovery-v1/ledger_overlay.py',LAB/'ops/accounting-v1/slot_ledger.py',LAB/'AUTHORIZATION.json',Path(control['planning_map'])]
    own=[p for p in HERE.iterdir() if p.is_file() and p.name not in {'SNAPSHOT.json','FREEZE_RECEIPT.json'}]
    closure={**route_closure,**{str(p):sha(p) for p in [*accounting,*own,route/'SNAPSHOT.json',assembly]}}
    write(HERE/'SNAPSHOT.json',{**base,'schema':'er8.luna.controller.snapshot.v1','version':'luna-resume-v2-controller-freeze1','closure_sha256':dict(sorted(closure.items())),'route_snapshot':{'path':str(route/'SNAPSHOT.json'),'sha256':sha(route/'SNAPSHOT.json')},'tests':json.loads((HERE/'TEST_RESULTS.json').read_text()),'scope':'source plus auth-free tested closure; no accepted preventive Goal contract'})
    check()
    write(HERE/'FREEZE_RECEIPT.json',{'status':'HOLD','end_epoch':time.time(),'route_snapshot_sha256':sha(route/'SNAPSHOT.json'),'controller_snapshot_sha256':sha(HERE/'SNAPSHOT.json'),'original_deadline_epoch':1790991507.832144,'before_original_deadline':time.time()<1790991507.832144,'source_changes_only':True,'next_step':'Independent complete closure review; establish supported same-version create_goal preventive denial before any root release/native canary'})
if __name__=='__main__':main()

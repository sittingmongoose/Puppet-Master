"""Bind a concrete externally authorized release to the four-record ABI; no launch."""
import argparse
import hashlib
import json
from pathlib import Path
import time
import make_plan

HERE=Path(__file__).resolve().parent


def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def record(path):return {'path':str(Path(path).absolute()),'sha256':sha(path)}

def main():
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True)
    p.add_argument('--root-release',type=Path,required=True);a=p.parse_args()
    root=a.root
    prepared=json.loads((root/'PREPARED.json').read_text())
    release=json.loads(a.root_release.read_text())
    binding_path=root/'CASE_BINDING.json';binding=json.loads(binding_path.read_text())
    expected={'schema':'er8.luna.root-native-release.v1','family':'L','model':'gpt-6-luna','effort':'max',
        'native_response_policy':'wall-goal-token-observation-v1','case_binding_sha256':sha(binding_path),
        'route_snapshot_sha256':sha(HERE/'SNAPSHOT.json'),'mode':binding['mode'],'authorization':'EXACT_ROOT_RELEASE'}
    if any(release.get(k)!=v for k,v in expected.items()):raise ValueError('matching exact external root release required')
    lease=json.loads((root/'LEASE.json').read_text())
    if time.monotonic_ns()>=lease['native_stop_monotonic_ns']:raise ValueError('original native deadline exhausted')
    acceptance=root/'ADMISSION_ACCEPTANCE.json'
    if acceptance.exists() or (root/'PLAN.json').exists():raise ValueError('one-shot fresh binding required')
    acceptance.write_text(json.dumps({'verdict':'accepted','snapshot_sha256':sha(HERE/'SNAPSHOT.json'),
        'allowed_modes':[binding['mode']],'source_review':prepared['source_review'],
        'root_native_release':record(a.root_release)},indent=2)+'\n')
    abi={'config':record(root/'CONFIG.json'),'lease':record(root/'LEASE.json'),
        'case_binding':record(binding_path),'acceptance':record(acceptance)}
    authority=lease['case_authority']
    plan=make_plan.construct(stage_id=binding['stage_id'],start_ns=binding['stage_start_monotonic_ns'],
        cap_seconds=int(binding['max_seconds']),response_cap=1,workspace=binding['workspace'],
        prompt=binding['prompt_file'],native_out=binding['native_out'],label=binding['label'],
        admission=str(binding_path),boundary_acceptance=prepared['boundary_acceptance'],
        plan_path=str(root/'PLAN.json'),public_get=True,cleanup_reserve_seconds=30,
        case_authority=authority,route_snapshot=record(HERE/'SNAPSHOT.json'),
        route_acceptance=record(acceptance),assembly_binding=abi,
        private_auth_binding={'source':prepared['auth_source_path'],
            'target':str(root/'private-codex-auth/auth.json')})
    (root/'PLAN.json').write_text(json.dumps(plan,indent=2)+'\n')
    print(json.dumps({'plan_path':str(root/'PLAN.json'),'plan_sha256':sha(root/'PLAN.json'),
        'candidate_goals_started':0,'provider_inference_requests_started':0,
        'launch_status':'not launched; operator original ledger guard/start required'}))

if __name__=='__main__':
    try:main()
    except Exception as e:
        print(json.dumps({'outcome':'HOLD','error_class':type(e).__name__}));raise SystemExit(126)

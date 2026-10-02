"""Host-only admission/setup inside the already armed owned PID namespace."""
import hashlib
import json
import os
from pathlib import Path
import runpy
import sys
import time

HERE = Path(__file__).resolve().parent
OLD = Path('V7_LAB_ROOT')
RUNTIME = OLD / 'dev/runtime-boundary-final-repair2/native_runner.py'
PINS = {
    str(RUNTIME): '9894fa2d82f801cf2d70f1f0a9756e2a14e7bcbd59fe95d69459d6d552d4baa9',
    str(OLD / 'dev/harness-v1-frozen/native/run_goal.py'): 'cf8302f30404128eee32aff128b1f03a5ea26fcfebedeb54ca662a98b2e2ef31',
    str(OLD / 'dev/runtime-boundary-final-repair2/review-snapshot-final.json'): '298f125f395f38d15202a0b1d07ba0753130d547c56db6bfecdb0f509f40c8c4',
}

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def regular(p):
    p = Path(p)
    if not p.is_absolute() or any(q.is_symlink() for q in (p, *p.parents)) or not p.is_file():
        raise ValueError('absolute regular host file with no symlink ancestry required')
    return p

def main():
    if len(sys.argv) != 2:
        return 126
    plan_path = regular(sys.argv[1])
    plan = json.loads(plan_path.read_text())
    if plan['schema'] != 'er8.execution-stage.v1':
        raise ValueError('unsupported plan')
    if os.getppid() != 1 or os.environ.get('PM_BOUND_DEADLINE_NS') != str(plan['native_stop_monotonic_ns']):
        raise ValueError('mandatory already armed PID1 absolute deadline mismatch')
    if time.monotonic_ns() >= plan['native_stop_monotonic_ns']:
        return 124
    # This is a new v8 boundary: an independent code/config acceptance is mandatory.
    acceptance = json.loads(regular(plan['boundary_acceptance']['path']).read_text())
    if sha(plan['boundary_acceptance']['path']) != plan['boundary_acceptance']['sha256']:
        raise ValueError('boundary acceptance drift')
    snapshot = json.loads(regular(HERE / 'SNAPSHOT.json').read_text())
    if acceptance.get('verdict') != 'accepted' or acceptance.get('snapshot_sha256') != sha(HERE / 'SNAPSHOT.json'):
        raise ValueError('new boundary lacks independent acceptance')
    for path, pin in {**PINS, **snapshot['closure_sha256']}.items():
        if sha(regular(path)) != pin:
            raise ValueError('frozen source/executable drift')
    route_record, accepted_record = plan['route_snapshot'], plan['route_acceptance']
    route_path, accepted_path = regular(route_record['path']), regular(accepted_record['path'])
    route = json.loads(route_path.read_text())
    route_acceptance = json.loads(accepted_path.read_text())
    if sha(route_path) != route_record['sha256'] or sha(accepted_path) != accepted_record['sha256'] or route_acceptance.get('verdict') != 'accepted' or route_acceptance.get('snapshot_sha256') != route_record['sha256']:
        raise ValueError('selected v8 integration lacks independent exact acceptance')
    selected = HERE.parent / 'route-assembly-v1/launch.py'
    if plan['runtime_path'] != str(selected) or str(selected) not in route['closure_sha256']:
        raise ValueError('one selected v8 Z assembly only')
    for path, pin in route['closure_sha256'].items():
        if sha(regular(path)) != pin:
            raise ValueError('selected v8 route/capture/config drift')
    authority_record = plan['case_authority']
    authority_path = regular(authority_record['path'])
    if sha(authority_path) != authority_record['sha256'] or json.loads(authority_path.read_text()) != authority_record['clock']:
        raise ValueError('original clock authority drift')
    clock = authority_record['clock']
    stage = clock['stages'][plan['stage_id']]
    if stage != {'stage_start_monotonic_ns':plan['stage_start_monotonic_ns'], 'cap_seconds':plan['cap_seconds'], 'response_cap':plan['response_cap']}:
        raise ValueError('original stage ancestry mismatch')
    deadline_ns = min(stage['stage_start_monotonic_ns'] + stage['cap_seconds'] * 10**9,
                      clock['case_start_monotonic_ns'] + clock['case_elapsed_cap_seconds'] * 10**9,
                      clock['campaign_native_cutoff_monotonic_ns'])
    if plan['deadline_monotonic_ns'] != deadline_ns or plan['native_stop_monotonic_ns'] != deadline_ns - plan['cleanup_reserve_seconds'] * 10**9:
        raise ValueError('inclusive original cutoff mismatch')
    role = plan['v8_stage_role']
    if role == 'lifetime-canary':
        if plan['cap_seconds'] > 480 or plan['response_cap'] > 64:
            raise ValueError('new counted lifetime canary exceeds finite policy')
    elif role == 'integrated':
        record = plan['v8_canary_review']
        review_path = regular(record['path'])
        review = json.loads(review_path.read_text())
        if sha(review_path) != record['sha256'] or review.get('verdict') != 'passed' or review.get('snapshot_sha256') != sha(HERE / 'SNAPSHOT.json') or review.get('route_snapshot_sha256') != route_record['sha256'] or not all(review.get(field) is True for field in ('inclusive_native_lifetime_verified', 'native_goal_activation_continuation_completion_verified', 'privacy_and_actual_tool_inventory_verified')):
            raise ValueError('new SAME-boundary native canary not independently passed')
    else:
        raise ValueError('unadmitted v8 role')
    argv = plan['runtime_argv']
    # The separately accepted v8 assembler owns native admission, fresh HOME,
    # controlled roots and the explicit capture overlay. It reuses pinned v7
    # engine/runtime code; neither an old cap flag nor old canary lifts v8 HOLD.
    if not isinstance(argv, list) or any(not isinstance(x, str) for x in argv):
        raise ValueError('exact native argument vector required')
    for flag, expected in (('--max-seconds',str(plan['cap_seconds'])),('--max-responses',str(plan['response_cap']))):
        if argv.count(flag) != 1 or argv[argv.index(flag)+1] != expected:
            raise ValueError('original native caps altered')
    expected_mode = 'canary' if role == 'lifetime-canary' else 'productive'
    if argv[-2:] != ['--mode', expected_mode]:
        raise ValueError('prospective v8 native admission mode mismatch')
    binding = plan['assembly_binding']
    if set(binding) != {'config','lease','case_binding','acceptance'}:
        raise ValueError('one fixed assembly ABI required')
    records = {}
    for kind, record in binding.items():
        if set(record) != {'path','sha256'}:
            raise ValueError('exact assembly host path/hash binding required')
        path = regular(record['path'])
        if sha(path) != record['sha256']:
            raise ValueError('assembly configuration/clock/admission drift')
        records[kind] = json.loads(path.read_text())
    lease, case = records['lease'], records['case_binding']
    if lease.get('schema') != 'er8.route.lease.v1' or lease.get('owned_unit') != plan['owned_unit'] or lease.get('deadline_monotonic_ns') != deadline_ns or lease.get('native_stop_monotonic_ns') != plan['native_stop_monotonic_ns'] or lease.get('case_authority') != plan['case_authority']:
        raise ValueError('selected assembler cannot reset owned lifetime')
    expected_case = {'schema':'er8.route.case-binding.v1','case_id':clock['case_id'],
                     'case_start_monotonic_ns':clock['case_start_monotonic_ns'],
                     'stage_id':plan['stage_id'],'stage_start_monotonic_ns':stage['stage_start_monotonic_ns'],
                     'max_seconds':plan['cap_seconds'],'max_responses':plan['response_cap'],
                     'mode':expected_mode,'public_get':'--public-get' in argv,
                     'config_sha256':binding['config']['sha256'],'lease_sha256':binding['lease']['sha256']}
    for field, value in expected_case.items():
        if case.get(field) != value:
            raise ValueError('selected assembler original case/stage/config mismatch')
    for field, flag in (('workspace','--workspace'),('prompt_file','--prompt-file'),('native_out','--out'),('label','--label')):
        if argv.count(flag) != 1 or case.get(field) != argv[argv.index(flag)+1]:
            raise ValueError('selected assembler exact method/job mismatch')
    workspace_index = plan['runtime_argv'].index('--workspace') + 1
    workspace = Path(plan['runtime_argv'][workspace_index]).resolve(strict=True)
    if plan_path.is_relative_to(workspace) or Path(plan['enrollment_path']).resolve().is_relative_to(workspace):
        raise ValueError('host clock/plan/enrollment must be outside candidate workspace')
    # The host enrollment is public mechanical process ownership, never native
    # output/model-I/O/auth metadata. The expected unit is positively checked
    # before native launch, including before native admission can stall.
    cgroup = Path('/proc/self/cgroup').read_text().strip()
    if not cgroup.startswith('0::/') or Path(cgroup[3:]).name != plan['owned_unit']:
        raise ValueError('mandatory own service cgroup enrollment absent')
    enrollment_path = Path(plan['enrollment_path'])
    if any(q.is_symlink() for q in (enrollment_path, *enrollment_path.parents)):
        raise ValueError('enrollment path alias')
    with enrollment_path.open('x') as f:
        f.write(json.dumps({'schema':'er8.execution.enrollment.v1', 'owned_unit':plan['owned_unit'], 'cgroup':cgroup[3:], 'enrolled_monotonic_ns':time.monotonic_ns(), 'original_deadline_monotonic_ns':deadline_ns}) + '\n')
    if time.monotonic_ns() >= plan['native_stop_monotonic_ns']:
        return 124
    sys.path.insert(0, str(selected.parent))
    assembly_argv = []
    for field, flag in (('config','--config'),('lease','--lease'),('case_binding','--case-binding'),('acceptance','--acceptance')):
        assembly_argv += [flag, binding[field]['path']]
    sys.argv = [str(selected), *assembly_argv]
    runpy.run_path(str(selected), run_name='__main__')
    return 126

if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as exc:
        # Host keys/native messages must not enter this wrapper's diagnostics.
        print(json.dumps({'boundary_error_class': type(exc).__name__}), flush=True)
        raise SystemExit(126)

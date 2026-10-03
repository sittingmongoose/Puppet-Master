"""One leased fresh Goal. Never releases its own lease."""
import argparse
import subprocess
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import *


def run(args):
    armed(args.deadline_ns)
    release = read_json(args.root_release)
    check_release(release)
    release['_parent_record']={'path':str(args.root_release),'sha256':sha(args.root_release)}
    if args.case not in QUEUE or (args.role, args.cap, args.artifact) not in ROLES:
        raise ValueError('reserved stage required')
    check_planning(release, args.case)
    job = args.case + '-' + args.role
    if args.deadline_ns != deadline(args.stage_ns, args.cap, args.case_ns, args.campaign_ns):
        raise ValueError('original absolute deadline mismatch')
    # No clipping of declared caps to hide lost prep/interstage time.
    if args.stage_ns + args.cap*10**9 > min(args.case_ns+3600*10**9, args.campaign_ns):
        raise ValueError('whole original component cap must fit case/campaign')
    home = Path(args.run_root) / args.case / job
    args.stage_home=home
    if home.exists():
        raise ValueError('one-shot fresh stage root required')
    request = {'job': job, 'case': args.case, 'family': 'L', 'route': release['route'],
        'pins': release['pins'], 'component_seconds': args.cap, 'component_responses': 1,
        'case_wall_seconds': 3600, 'case_occupied_seconds': 5400, 'outside_native_cap_seconds': 300,
        'source_access': read_json(load('assigned_inputs',Path(CONTROL['planning_map']).parent/'candidate_inputs.py').source_access(args.case,release.get('case_sources'))), 'current_stages': [args.role],
        'birth_epoch': args.stage_epoch, 'birth_monotonic': args.stage_ns/10**9}
    module = ledger_module()
    with module.transaction() as state:
        if args.role == 'research-proposal':
            if args.stage_ns != args.case_ns or args.stage_epoch != args.case_epoch:
                raise ValueError('first stage must retain original case birth')
            admitted = module.apply(state, 'prepare-admission', request)
        else:
            original = state['cases'][args.case]
            if original['birth_epoch'] != args.case_epoch or original['birth_monotonic'] != args.case_ns/10**9:
                raise ValueError('original case ledger birth drift')
            admitted = module.admit(state, request, time.time(), component_birth=args.stage_epoch)
    atomic(home/'BIRTH.json', {'case': args.case, 'job': job, 'original_case_epoch': args.case_epoch,
        'original_case_monotonic_ns': args.case_ns, 'stage_epoch': args.stage_epoch,
        'stage_monotonic_ns': args.stage_ns, 'original_deadline_monotonic_ns': args.deadline_ns,
        'admission': admitted,'host_anchor_monotonic_ns':args.host_anchor_ns})
    transfer = read_json(args.transfer) if args.transfer else None
    prior = artifacts_for_next(args.case, transfer['exports'], args.role) if transfer else None
    captures = transfer['exports'][-1]['same_case_capture_store'] if transfer else None
    adapter = load('er8_integrated_adapter', ASSEMBLY/'adapter.py')
    ws, prompt, out = home/'workspace', home/'OBJECTIVE.md', home/'native-public'
    packed = adapter.pack_stage(case_id=args.case, reservation_id=job, workspace=ws,
        prompt_file=prompt, case_birth_ns=args.case_ns, stage_birth_ns=args.stage_ns,
        prior_artifacts=prior, prior_capture_store=captures,assigned_sources=release.get('case_sources'))
    atomic(home/'PACKING.json', packed)
    atomic(home/'ACCOUNT_LOAD.json', {'account_role': ACCOUNT, 'actual_account_id': 'UNKNOWN',
        'external_provider_load': 'UNKNOWN', 'own_occupancy': ledger('status'),
        'qualification': 'AUTHORIZED_ACCOUNT_ROLE_ONLY'})
    stage_id = job.lower()
    clock = {'case_id': args.case, 'case_start_monotonic_ns': args.case_ns,
        'case_elapsed_cap_seconds': 3600, 'case_occupied_cap_seconds': 5400,
        'outside_native_cap_seconds': 300, 'campaign_native_cutoff_monotonic_ns': args.campaign_ns,
        'stages': {stage_id: {'stage_start_monotonic_ns': args.stage_ns,
                            'cap_seconds': args.cap, 'response_cap': 1}}}
    authority = home/'CASE_AUTHORITY.json'
    atomic(authority, clock)
    authority_record = {'path': str(authority), 'sha256': sha(authority), 'clock': clock}
    unit = 'er8-' + stage_id + '.service'
    lease = home/'LEASE.json'
    atomic(lease, {'schema': 'er8.route.lease.v1', 'owned_unit': unit,
        'deadline_monotonic_ns': args.deadline_ns, 'native_stop_monotonic_ns': args.deadline_ns-30*10**9,
        'case_authority': authority_record, 'occupied_seconds_reserved': args.cap,
        'outside_seconds_reserved': 300})
    binding = home/'CASE_BINDING.json'
    capture_pins = {str(p): sha(p) for p in (ws/'public_captures').glob('*')}
    stage_binding = {'schema': 'er8.route.case-binding.v1', 'case_id': args.case,
        'case_start_monotonic_ns': args.case_ns, 'stage_id': stage_id,
        'stage_start_monotonic_ns': args.stage_ns, 'stage_birth_epoch':args.stage_epoch, 'max_seconds': args.cap, 'max_responses': 1,
        'workspace': str(ws), 'prompt_file': str(prompt), 'prompt_sha256': packed['prompt_sha256'],
        'native_out': str(out), 'label': job, 'mode': 'productive', 'public_get': True,
        'immutable_inputs': packed['immutable_inputs'], 'immutable_capture_inputs': capture_pins,
        'capture_origin_case_id': args.case, 'config_sha256': release['config']['sha256'],
        'lease_sha256': sha(lease), 'account_identity': ACCOUNT, 'canary_review': release['canary_review']}
    from release_binding import bind_stage
    abi=bind_stage(release, home, stage_binding)
    plan_path = home/'PLAN.json'
    maker = load('er8_integrated_make_plan', LUNA_ROUTE/'make_plan.py')
    plan = maker.construct(stage_id=stage_id, start_ns=args.stage_ns, cap_seconds=args.cap,
        response_cap=1, workspace=str(ws), prompt=str(prompt), native_out=str(out), label=job,
        admission=str(binding), boundary_acceptance=release['execution_acceptance'], plan_path=str(plan_path),
        public_get=True, cleanup_reserve_seconds=30, case_authority=authority_record,
        v8_stage_role='integrated', v8_canary_review=release['canary_review'],
        route_snapshot=release['route_snapshot'], route_acceptance=abi['acceptance'], assembly_binding=abi,
        private_auth_binding={'source':release['auth_source_path'],'target':str(home/'private-codex-auth/auth.json')})
    atomic(plan_path, plan)
    # Pins are reused mechanically, once per job/version; route also enforces them.
    armed(args.deadline_ns)
    for rec in abi.values():
        if sha(rec['path']) != rec['sha256']:
            raise ValueError('immediate four-record ABI drift')
    before = time.monotonic_ns()
    status = charge(args.case, job, args.host_anchor_ns, before, 'outside-pre-guard', 'setup')
    if status['outside_native_seconds_by_case'][args.case] >= 300:
        raise ValueError('inclusive host budget exhausted before guard')
    permit = job + '-permit-1'
    ledger('guard-start', {'job': job, 'permit_id': permit})
    launch = time.monotonic_ns()
    status = charge(args.case, job, before, launch, 'outside-guard-tail', 'setup')
    # This actual no-launch decision is a positive absence proof, not a timeout.
    prospective_now = time.monotonic_ns()
    if prospective_now >= args.deadline_ns-30*10**9 or status['outside_native_seconds_by_case'][args.case]+(prospective_now-launch)/10**9 >= 300:
        ledger('start-absent', {'job': job, 'permit_id': permit,
            'native_activation_absent': True, 'receipt_id': job+'-never-Popen-deadline'})
        raise ValueError('original work envelope exhausted')
    launched = time.monotonic_ns()
    atomic(home/'LAUNCH_INTENT.json',{'original_deadline_monotonic_ns':args.deadline_ns,'native_wrapper_launch_monotonic_ns':launched})
    args.Popen_attempted=True
    proc = subprocess.Popen(plan['command'], start_new_session=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    # The tail precedes Popen, even though its accounting runs concurrently.
    charge(args.case, job, launch, launched, 'outside-Popen-tail', 'setup')
    atomic(home/'LAUNCHED.json', {'native_wrapper_launch_monotonic_ns': launched,
        'job': job, 'owned_unit': unit, 'wrapper_pid':proc.pid,'wrapper_pgid':os.getpgid(proc.pid), 'original_deadline_monotonic_ns': args.deadline_ns})
    started = False
    while proc.poll() is None:
        if (out/'activation.json').is_file() and not started:
            activation = native_json(home, 'activation.json')
            if activation.get('native_activation_observed') is True:
                ledger('goal-start', {'job': job, 'receipt_id': activation['receipt_id'],
                    'epoch': activation['observed_activation_epoch']})
                started = True
        time.sleep(0.25)
    atomic(home/'WRAPPER_EXIT.json',{'wrapper_pid':proc.pid,'wrapper_returncode':proc.returncode,'wrapper_exit_observed_monotonic_ns':time.monotonic_ns()})
    observer = load('er8_integrated_observe', EXECUTION/'observe.py')
    quiet = observer.observe(plan['enrollment_path'], unit, args.deadline_ns)
    atomic(home/'QUIESCENCE.json', quiet)
    if quiet['owned_native_quiescent'] is not True or quiet['inclusive_native_lifetime_established'] is not True:
        raise ValueError('positive timely native cgroup quiet missing')
    metrics = native_json(home, 'public-metrics.json')
    activation = metrics.get('activation', {})
    if not started and activation.get('native_activation_observed') is True:
        ledger('goal-start', {'job': job, 'receipt_id': activation['receipt_id'],
            'epoch': activation['observed_activation_epoch']})
        started = True
    if not started:
        if activation.get('native_activation_absent_proof') is True:
            ledger('start-absent', {'job': job, 'permit_id': permit,
                'native_activation_absent': True, 'receipt_id': job+'-positive-absent'})
        raise ValueError('actual native Goal missing or UNKNOWN')
    output = metrics.get('usage_totals', {}).get('outputTokens')
    if type(output) is int:
        ledger('usage', {'job': job, 'generated_output_tokens': output})
    if proc.returncode != 0 or metrics.get('component_outcome') != 'passed' or metrics.get('goal_status_final') != 'complete' or metrics.get('goal_started_turn') is not True:
        raise ValueError('failed route or incomplete native Goal cannot complete stage')
    validate_luna_metrics(metrics)
    export = adapter.export_manifest(ws, args.case)
    artifact = next((r for r in export['artifacts'] if Path(r['path']).name == args.artifact and r['bytes'] > 0), None)
    # A file is the stage deliverable; JSON/status alone cannot complete a case.
    if artifact is None:
        raise ValueError('actual required stage artifact missing')
    if metrics.get('host_groups_absent') is not True:
        raise ValueError('native/MCP group quiet missing')
    atomic(home/'PUBLIC_ARTIFACT_FREEZE.json', export)
    atomic(home/'PUBLIC_METRICS_FREEZE.json', {'path': str(out/'public-metrics.json'), 'sha256': sha(out/'public-metrics.json')})
    finished = time.monotonic_ns()
    status = charge(args.case, job, quiet['quiescence_observed_monotonic_ns'], finished, 'outside-post-quiet', 'handoff')
    if status['outside_native_seconds_by_case'][args.case] >= 300 or finished >= args.deadline_ns:
        raise ValueError('original inclusive host/deadline cap exhausted')
    atomic(home/'COMPLETE.json', {'schema': 'er8.integrated.stage-deferred-close.v1',
        'case': args.case, 'job': job, 'stage_start_monotonic_ns': args.stage_ns,
        'original_case_start_monotonic_ns': args.case_ns, 'original_deadline_monotonic_ns': args.deadline_ns,
        'lease_release_deferred': True, 'lease_released_by_actor': False,
        'native_wrapper_launch_monotonic_ns': launched,
        'native_quiescence_observed_monotonic_ns': quiet['quiescence_observed_monotonic_ns'],
        'last_charged_host_monotonic_ns': finished, 'host_groups_absent': True,
        'required_artifact': artifact, 'native_goal_activation_observed': started,
        'native_goal_target_id': metrics.get('goal_target_id'), 'fresh_session': metrics.get('fresh_session'),
        'native_responses': metrics.get('native_responses'),'native_response_policy':POLICY,
        'requested_model':metrics.get('requested_model'),'requested_effort':metrics.get('requested_effort'), 'native_goal_status': metrics.get('goal_status_final'),
        'wrapper_returncode': proc.returncode, 'source_semantic_acquisition': 'UNKNOWN',
        'usage': 'UNKNOWN except reported monotonic output lower bound'})


def main():
    p = argparse.ArgumentParser()
    for n in ('root-release', 'run-root', 'case', 'role', 'artifact'):
        p.add_argument('--'+n, required=True)
    p.add_argument('--transfer')
    for n in ('case-ns', 'stage-ns', 'campaign-ns', 'deadline-ns', 'host-anchor-ns', 'cap'):
        p.add_argument('--'+n, type=int, required=True)
    for n in ('case-epoch', 'stage-epoch'):
        p.add_argument('--'+n, type=float, required=True)
    a = p.parse_args();a.Popen_attempted=False
    try:
        run(a)
    except Exception as error:
        if getattr(a,'stage_home',None) is not None and a.Popen_attempted is False and (a.stage_home/'BIRTH.json').is_file() and not (a.stage_home/'LAUNCH_INTENT.json').exists():
            atomic(a.stage_home/'NO_NATIVE_LAUNCH.json',{'wrapper_Popen_attempted':False,'positive_native_activation_absent':True,'stage_monotonic_ns':a.stage_ns,'original_deadline_monotonic_ns':a.deadline_ns})
        # No automatic retry/rescue, no inferred quiet, and no silent release.
        print(json.dumps({'outcome': 'HOLD', 'error_class': type(error).__name__,
            'lease': 'HELD_UNTIL_EXTERNAL_POSITIVE_CLOSURE'}), flush=True)
        raise SystemExit(126)

if __name__ == '__main__':
    main()

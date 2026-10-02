"""Pure plan construction: no subprocess or native launch. Start is operator-bound."""
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
OLD = Path('V7_LAB_ROOT')
RUNTIME = HERE.parent / 'route-assembly-v1/launch.py'
GATE = HERE / 'deadline_gate'


def construct(*, stage_id, start_ns, cap_seconds, response_cap, workspace, prompt,
              native_out, label, admission, boundary_acceptance, plan_path,
              public_get=False, cleanup_reserve_seconds=3, case_authority=None,
              v8_stage_role="lifetime-canary", v8_canary_review=None,
              route_snapshot=None, route_acceptance=None, assembly_binding=None):
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,55}', stage_id):
        raise ValueError('unique owned service identity required')
    if type(start_ns) is not int or start_ns <= 0:
        raise ValueError('original immutable CLOCK_MONOTONIC stage start required')
    if type(cap_seconds) is not int or not 30 < cap_seconds <= 1800:
        raise ValueError('unchanged original component seconds cap required')
    if type(response_cap) is not int or not 0 < response_cap <= 160:
        raise ValueError('unchanged original response cap required')
    if not 2 <= cleanup_reserve_seconds < cap_seconds:
        raise ValueError('prospective cleanup/proof reserve required')
    for p in (workspace, prompt, native_out, admission, plan_path):
        if not Path(p).is_absolute():
            raise ValueError('absolute host paths required')
    if not isinstance(case_authority, dict) or set(case_authority) != {'path', 'sha256', 'clock'}:
        raise ValueError('immutable original case/stage authority required')
    clock = case_authority['clock']
    required = {'case_id', 'case_start_monotonic_ns', 'case_elapsed_cap_seconds',
                'case_occupied_cap_seconds', 'outside_native_cap_seconds',
                'campaign_native_cutoff_monotonic_ns', 'stages'}
    if set(clock) != required or not 0 < clock['case_elapsed_cap_seconds'] <= 3600 or not 0 < clock['case_occupied_cap_seconds'] <= 5400 or not 0 < clock['outside_native_cap_seconds'] <= 300:
        raise ValueError('original case limits required')
    original_stage = clock['stages'][stage_id]
    if original_stage != {'stage_start_monotonic_ns': start_ns, 'cap_seconds': cap_seconds, 'response_cap': response_cap}:
        raise ValueError('retry cannot reset original stage clock or caps')
    if start_ns < clock['case_start_monotonic_ns']:
        raise ValueError('stage predates original case assignment')
    if v8_stage_role not in ('lifetime-canary', 'integrated'):
        raise ValueError('new v8 stage role required')
    if v8_stage_role == 'lifetime-canary' and (cap_seconds > 480 or response_cap > 64):
        raise ValueError('new v8 canary finite 480s/64 cap')
    if v8_stage_role == 'integrated' and not v8_canary_review:
        raise ValueError('new v8 SAME-boundary native canary review required')
    if not isinstance(assembly_binding, dict) or set(assembly_binding) != {'config','lease','case_binding','acceptance'} or any(set(r) != {'path','sha256'} for r in assembly_binding.values()):
        raise ValueError('exact selected assembly ABI path/hash binding required')
    if not route_snapshot or not route_acceptance:
        raise ValueError('separately frozen/accepted selected v8 route required')
    deadline_ns = min(start_ns + cap_seconds * 10**9,
                      clock['case_start_monotonic_ns'] + clock['case_elapsed_cap_seconds'] * 10**9,
                      clock['campaign_native_cutoff_monotonic_ns'])
    stop_ns = deadline_ns - cleanup_reserve_seconds * 10**9
    if stop_ns <= start_ns:
        raise ValueError('original case/campaign has no admitted lifetime remaining')
    argv = ['--workspace', str(workspace), '--prompt-file', str(prompt),
            '--out', str(native_out), '--label', label, '--max-seconds', str(cap_seconds),
            '--max-responses', str(response_cap), '--admission-file', str(admission)]
    if public_get:
        argv += ['--public-get']
    argv += ['--mode', 'canary' if v8_stage_role == 'lifetime-canary' else 'productive']
    plan = {'schema': 'er8.execution-stage.v1', 'stage_id': stage_id,
            'stage_start_monotonic_ns': start_ns, 'deadline_monotonic_ns': deadline_ns,
            'native_stop_monotonic_ns': stop_ns, 'cleanup_reserve_seconds': cleanup_reserve_seconds,
            'cap_seconds': cap_seconds, 'response_cap': response_cap,
            'runtime_path': str(RUNTIME), 'runtime_argv': argv,
            'route_snapshot':route_snapshot, 'route_acceptance':route_acceptance,
            'assembly_binding':assembly_binding,
            'case_authority':case_authority, 'v8_stage_role':v8_stage_role,
            'v8_canary_review':v8_canary_review,
            'enrollment_path':str(Path(plan_path).with_suffix('.enrollment.json')),
            'occupied_and_outside_cost_enforcement':'mandatory operator case/slot ledger; wrapper proves native lifetime only',
            'boundary_acceptance': boundary_acceptance,
            'native_qualification': 'UNESTABLISHED until actual on-time cgroup quiescence and native receipt review'}
    unit = 'er8-' + stage_id + '.service'
    payload = [str(GATE), '--absolute-ns', str(stop_ns), '--', '/usr/bin/python3', '-I', '-B',
               str(HERE / 'entry.py'), str(plan_path)]
    namespace = ['/usr/bin/bwrap', '--unshare-user', '--unshare-pid', '--as-pid-1',
                 '--die-with-parent', '--cap-drop', 'ALL', '--bind', '/', '/', '--proc', '/proc',
                 '--dev-bind', '/dev', '/dev', '--', *payload]
    # First service supervisor arms before bwrap bootstrap; PID1 supervisor arms
    # before Python import, admission, runtime setup, metadata and every request.
    service = [str(GATE), '--absolute-ns', str(stop_ns), '--', *namespace]
    systemd = ['/usr/bin/systemd-run', '--user', '--wait', '--pipe', '--collect',
               '--unit=' + unit, '--property=Type=exec', '--property=KillMode=control-group',
               '--property=KillSignal=SIGKILL', '--property=SendSIGKILL=yes',
               '--property=TimeoutStopSec=1s', '--property=RuntimeMaxSec=' + str(cap_seconds) + 's',
               '--property=Restart=no', '--', *service]
    command = [str(GATE), '--absolute-ns', str(deadline_ns), '--', *systemd]
    plan['owned_unit'] = unit
    plan['command'] = command
    return plan

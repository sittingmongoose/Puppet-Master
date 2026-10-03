"""One exact V6 -> V7 allocation-successor continuation. Source only until root separately activates it."""
import argparse
import contextlib
import fcntl
import hashlib
import importlib.util
import json
import math
import os
from pathlib import Path
import subprocess
import time

LAB = Path('LAB_ROOT')
HERE = LAB / 'dev/durable-queue-v2'
OPS = LAB / 'ops/execution-resume-v1'
SOURCE = LAB / 'dev/prospective-timing-v3'
GLOBAL_DEADLINE = 1791013030.8303788  # Exact JSON precision; never round it later.
CURRENT_UNIT = 'er8-v8-production-z-tranche-v6.service'
NEXT_UNIT = 'er8-v8-production-z-tranche-v7.service'
ROOT_UNIT = 'er8-v8-root-durable-20261002-2348.service'
ROOT_CLAIM = LAB / 'ops/recovery-v1/SUPERVISOR_DURABLE.json'
CURRENT_RELEASE = OPS / 'root-production-release-v6.json'
CURRENT_SHA = 'e15d0f1d8d7ce7a74dac72111df2848efe296e5fc605ab2e2f76f35c6f4d8aac'
NEXT_RELEASE = OPS / 'root-production-release-v7.json'
NEXT_SHA = '4d6593cff543755bd390c9682cbd9f8e76ff8a13f82451ee6821f96aedab4cf2'
MONITOR = OPS / 'quiet_production_monitor.py'
MONITOR_SHA = '44c3671a2f51d02e412ac5d0df1e719098a80a755ae192a4a07c7fae1d5ae042'
NEXT_RUN = OPS / 'jobs/z-tranche-v7'
LEDGER_STATE = LAB / 'ops/accounting-v1/state.json'
PREFIX = OPS / 'z-tranche-v6-rolling-parent-positive'
ROOT_REQUEST = OPS / 'CONTINUATION_ROOT_AUTHORITY_V2.json'
ROOT_REQUEST_SHA = '5fba8e4858acbdc3b850f1459c751a9a9579bf5c53fea075cf213f7def55c567'
ROOT_CLAIM_SHA = 'e0b37dcddefe3d6fcad80a913701cb69729b467bd0ffbf34b535f54dab3211b9'
CONTINUATION_UNIT = 'er8-v8-queue-continuation-v2.service'
RECEIPTS = OPS / 'continuation-v2'
ROLES = ('research-proposal', 'independent-candidate-critic', 'final-correction')


class Hold(Exception):
    pass


def require(condition, reason):
    if not condition:
        raise Hold(reason)


def unaliased(path):
    p = Path(path)
    require(p.is_absolute() and '..' not in p.parts and
            not any(q.is_symlink() for q in (p, *p.parents)), 'metadata_path_alias')
    return p


def read(path):
    p = unaliased(path)
    require(p.is_file() and p.stat().st_size <= 4 * 1024 * 1024, 'missing_or_unbounded_metadata')
    value = json.loads(p.read_text())
    require(isinstance(value, dict), 'metadata_object_required')
    return value


def sha(path):
    p = unaliased(path)
    require(p.is_file(), 'missing_pinned_source')
    return hashlib.sha256(p.read_bytes()).hexdigest()


def pin(path, digest):
    require(sha(path) == digest, 'pinned_source_drift')


def save(path, value, exclusive=False):
    p = unaliased(path)
    p.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    payload = (json.dumps(value, sort_keys=True, indent=2) + '\n').encode()
    target = p if exclusive else p.with_name(p.name + '.' + str(os.getpid()) + '.' + str(time.monotonic_ns()) + '.tmp')
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW
    fd = os.open(target, flags, 0o600)
    with os.fdopen(fd, 'wb') as stream:
        stream.write(payload)
        stream.flush()
        os.fsync(stream.fileno())
    if not exclusive:
        os.replace(target, p)
    directory = os.open(p.parent, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(directory)
    finally:
        os.close(directory)


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def monitor_argv():
    return ['/usr/bin/python3', '-I', '-B', str(MONITOR), '--root-release',
            str(NEXT_RELEASE), '--release-sha256', NEXT_SHA, '--source-root',
            str(SOURCE), '--run-root', str(NEXT_RUN)]


def identity():
    return {'current_unit': CURRENT_UNIT, 'current_release': str(CURRENT_RELEASE),
            'current_release_sha256': CURRENT_SHA, 'next_unit': NEXT_UNIT,
            'next_release': str(NEXT_RELEASE), 'next_release_sha256': NEXT_SHA,
            'monitor': str(MONITOR), 'monitor_sha256': MONITOR_SHA,
            'source_root': str(SOURCE), 'run_root': str(NEXT_RUN),
            'root_unit': ROOT_UNIT, 'root_claim': str(ROOT_CLAIM),
            'global_deadline_epoch': GLOBAL_DEADLINE}


class NativeMetadata:
    """Only unit/process command metadata and public accounting; no candidate files."""
    def __init__(self):
        self.common = None
        self.accounting = None

    def remaining(self):
        return GLOBAL_DEADLINE - time.time()

    def command(self, argv):
        remain = self.remaining()
        require(remain > 0, 'global_deadline_exhausted')
        try:
            return subprocess.run(argv, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                                  stderr=subprocess.DEVNULL, text=True,
                                  timeout=min(5, remain), check=False)
        except subprocess.TimeoutExpired:
            raise Hold('platform_result_UNKNOWN') from None

    def unit(self, name):
        result = self.command(['systemctl', '--user', 'show', name,
                               '--property=Id,LoadState,ActiveState,SubState,MainPID,ControlGroup,RuntimeMaxUSec,KillMode,Restart'])
        require(result.returncode == 0, 'unit_metadata_UNKNOWN')
        values = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
        require(values.get('Id') == name, 'unit_identity_UNKNOWN')
        return values

    def positive_process(self, unit, pid, argv=None):
        require(type(pid) is int and pid > 1, 'positive_pid_required')
        os.kill(pid, 0)
        proc = Path('/proc') / str(pid)
        groups = (proc / 'cgroup').read_text().splitlines()
        require(any(line.split(':', 2)[-1].rstrip('/').endswith('/' + unit) for line in groups),
                'positive_owned_unit_cgroup_required')
        if argv is not None:
            actual = (proc / 'cmdline').read_bytes().rstrip(b'\0').split(b'\0')
            require(actual == [x.encode() for x in argv], 'positive_exact_monitor_argv_required')

    def root_positive(self):
        pin(ROOT_CLAIM, ROOT_CLAIM_SHA)
        claim = read(ROOT_CLAIM)
        require(claim.get('root_authority') is True and claim.get('owner') == 'codex-er8-recovery'
                and claim.get('unit') == ROOT_UNIT and claim.get('deadline_epoch') == GLOBAL_DEADLINE,
                'exact_root_holder_claim_required')
        unit = self.unit(ROOT_UNIT)
        require(unit.get('LoadState') == 'loaded' and unit.get('ActiveState') == 'active'
                and unit.get('SubState') == 'running' and int(unit.get('MainPID', '0')) == claim.get('pid'),
                'positive_current_root_holder_required')
        self.positive_process(ROOT_UNIT, claim['pid'])

    def terminal(self):
        launch = read(PREFIX.with_suffix('.launch.json'))
        held = read(PREFIX.with_suffix('.held-exit.json'))
        terminal = read(PREFIX.with_suffix('.terminal.json'))
        require(launch.get('root_release_sha256') == CURRENT_SHA
                and held.get('root_release_sha256') == CURRENT_SHA, 'current_release_terminal_binding_required')
        pid = launch.get('held_rolling_pid')
        require(type(pid) is int and pid > 1 and launch.get('held_rolling_pgid') == pid
                and held.get('held_rolling_pid') == pid and held.get('held_rolling_pgid') == pid
                and terminal.get('held_rolling_pid') == pid, 'held_terminal_identity_required')
        rc = held.get('held_Popen_returncode')
        ended = held.get('actual_exit_observed_monotonic_ns')
        require(type(rc) is int and rc in (0, 126) and type(ended) is int
                and 0 < ended <= time.monotonic_ns()
                and terminal.get('held_Popen_returncode') == rc
                and terminal.get('actual_exit_observed_monotonic_ns') == ended
                and held.get('rolling_group_absent') is True
                and terminal.get('rolling_group_absent') is True, 'actual_held_terminal_groups_absent_required')
        try:
            os.killpg(pid, 0)
        except ProcessLookupError:
            return {'held_returncode': rc, 'failures_preserved': True, 'terminal_sha256': sha(PREFIX.with_suffix('.terminal.json'))}
        raise Hold('held_rolling_group_still_present')

    def state(self):
        state = read(LEDGER_STATE)
        require(state.get('deadline_epoch') == GLOBAL_DEADLINE, 'original_ledger_clock_required')
        require(isinstance(state.get('jobs'), dict), 'public_ledger_jobs_required')
        return state

    def quiet(self):
        state = self.state()
        require(state.get('closed') is False, 'campaign_closed_or_UNKNOWN')
        for job in state['jobs'].values():
            require(isinstance(job, dict) and job.get('released_epoch') is not None
                    and not job.get('launch_pending'), 'active_ledger_or_pending_permit')
        next_release = read(NEXT_RELEASE)
        cases = set(next_release['case_queue'])
        require(not any(job.get('case') in cases or name in next_release['allowed_jobs']
                        for name, job in state['jobs'].items()), 'prior_pair_admission')
        require(not any(case in state.get('cases', {}) for case in cases), 'prior_pair_birth')
        current = read(CURRENT_RELEASE)
        for name, job in state['jobs'].items():
            if job.get('case') not in current['case_queue']:
                continue
            q = job.get('quiescence', {})
            require(q.get('native_quiescent') is True and q.get('own_process_group_absent') is True
                    and bool(q.get('receipt_id')), 'current_candidate_lease_quiet_required')
        return state

    def frozen_validation(self):
        pin(CURRENT_RELEASE, CURRENT_SHA)
        pin(NEXT_RELEASE, NEXT_SHA)
        pin(MONITOR, MONITOR_SHA)
        release = read(NEXT_RELEASE)
        require(release.get('campaign_deadline_epoch') == GLOBAL_DEADLINE
                and release.get('operator_monitor') == {'path': str(MONITOR), 'sha256': MONITOR_SHA},
                'exact_release_clock_monitor_required')
        snapshot = release['controller_snapshot']
        pin(snapshot['path'], snapshot['sha256'])
        require(Path(snapshot['path']).parent.parent == SOURCE, 'exact_source_root_required')
        for path, digest in read(snapshot['path'])['closure_sha256'].items():
            pin(path, digest)
        common = load('er8_continuation_readonly_common', SOURCE / 'integrated-controller/common.py')
        accounting = common.ledger_module()
        # Frozen common.check_release uses transaction for reads. Replace only this
        # in-memory dependency with a fresh, validated, nonwriting snapshot context.
        @contextlib.contextmanager
        def readonly():
            state = self.state()
            accounting.validate_state(state)
            yield state
        accounting.transaction = readonly
        common.ledger_module = lambda: accounting
        common.check_release(release)
        status = accounting.accounting(self.quiet())
        require(not status['active_jobs'] and not status['overdue_jobs']
                and status['pending_start_permits'] == 0, 'ledger_not_quiet')
        pair_cases = set()
        state = self.state()
        for binding in release['pair_bindings'].values():
            value = common.record(binding)
            cases = value.get('cases', [])
            require(len(cases) == 2 and len(set(cases)) == 2
                    and value.get('unstarted_pair_verified') is True
                    and value.get('prior_jobs_for_pair') == [], 'whole_unstarted_pair_required')
            pair_cases.update(cases)
        require(pair_cases == set(release['case_queue']), 'exact_whole_pair_queue_required')
        require(not any(job.get('case') in pair_cases or name in release['allowed_jobs']
                        for name, job in state['jobs'].items()), 'prior_pair_admission')
        require(not any(case in state.get('cases', {}) for case in pair_cases), 'prior_pair_birth')
        require(set(release['allowed_jobs']) == {case + '-' + role for case in pair_cases for role in ROLES},
                'exact_stage_names_required')
        for case in release['case_queue']:
            common.check_planning(release, case)
        require(not NEXT_RUN.exists(), 'next_run_must_be_fresh')
        self.common, self.accounting = common, accounting

    def next_positive(self, unit):
        require(unit.get('LoadState') == 'loaded' and unit.get('ActiveState') == 'active'
                and unit.get('SubState') == 'running', 'next_unit_not_positive_active')
        self.positive_process(NEXT_UNIT, int(unit.get('MainPID', '0')), monitor_argv())

    def start(self, argv):
        result = self.command(argv)
        require(result.returncode == 0, 'launch_result_UNKNOWN')


def advance(io, intent_path, request_binding):
    """Single poll; no start until every dependency is positive. Mockable offline."""
    require(io.remaining() > 0, 'global_deadline_exhausted')
    io.root_positive()
    expected = {**identity(), 'root_request': request_binding}
    if intent_path.exists():
        require(read(intent_path).get('binding') == expected, 'existing_intent_binding_UNKNOWN')
        unit = io.unit(NEXT_UNIT)
        io.next_positive(unit)
        return 'ADOPTED_EXACT_ACTIVE', {k: unit.get(k) for k in ('Id', 'MainPID', 'ActiveState', 'SubState', 'ControlGroup')}
    current = io.unit(CURRENT_UNIT)
    require(current.get('LoadState') == 'loaded' and current.get('ActiveState') in ('inactive', 'failed')
            and current.get('SubState') in ('dead', 'failed') and current.get('MainPID') == '0',
            'current_unit_not_inactive')
    terminal = io.terminal()
    io.quiet()
    io.frozen_validation()
    next_unit = io.unit(NEXT_UNIT)
    require(next_unit.get('LoadState') == 'not-found' and next_unit.get('MainPID') == '0',
            'next_unit_already_exists_without_intent')
    # Recheck mutable state immediately before the durable one-shot intent.
    io.root_positive()
    io.quiet()
    current = io.unit(CURRENT_UNIT)
    require(current.get('ActiveState') in ('inactive', 'failed') and current.get('MainPID') == '0',
            'current_unit_changed')
    remaining = io.remaining()
    require(remaining > 15, 'insufficient_global_clock_for_launch')
    runtime = math.floor(remaining - 10)
    argv = ['systemd-run', '--user', '--quiet', '--unit=' + NEXT_UNIT,
            '--working-directory=' + str(LAB), '--property=Type=exec',
            '--property=RuntimeMaxSec=' + str(runtime), '--property=KillMode=control-group',
            '--property=Restart=no', '--property=StandardOutput=null', '--property=StandardError=null',
            *monitor_argv()]
    save(intent_path, {'schema': 'pm.er8.one-shot-launch-intent.v1', 'binding': expected,
                       'created_epoch': time.time(), 'terminal': terminal,
                       'argv': argv, 'launch_outcome': 'UNKNOWN'}, exclusive=True)
    require(io.remaining() > runtime, 'deadline_changed_after_intent_UNKNOWN')
    io.start(argv)
    return 'START_SUBMITTED', {'runtime_max_seconds': runtime}


def run(io, receipt_root, request_binding, sleep=time.sleep):
    intent = receipt_root / 'LAUNCH_INTENT.json'
    receipt = receipt_root / 'CONTINUATION.json'
    while io.remaining() > 0:
        try:
            state, metadata = advance(io, intent, request_binding)
            if state == 'START_SUBMITTED':
                # Poll positive activity; intent suppresses every subsequent start.
                continue
            save(receipt, {'state': state, 'metadata': metadata, 'saved_epoch': time.time(),
                           'global_deadline_epoch': GLOBAL_DEADLINE, 'binding': request_binding,
                           'failures_preserved': True, 'usage': 'UNKNOWN'})
            return 0
        except Exception as error:
            reason = str(error) if isinstance(error, Hold) else type(error).__name__
            save(receipt, {'state': 'HOLD', 'reason': reason, 'saved_epoch': time.time(),
                           'global_deadline_epoch': GLOBAL_DEADLINE, 'usage': 'UNKNOWN',
                           'no_inferred_launch_or_release': True})
            # Existing intent is never retried; only positive exact activity can adopt.
            if intent.exists() and reason != 'next_unit_not_positive_active':
                return 126
            sleep(max(0, min(2, io.remaining())))
    save(receipt, {'state': 'HOLD_GLOBAL_BOUND', 'saved_epoch': time.time(),
                   'global_deadline_epoch': GLOBAL_DEADLINE, 'usage': 'UNKNOWN',
                   'no_clock_reset': True, 'no_inferred_launch_or_release': True})
    return 126


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root-request', required=True)
    parser.add_argument('--root-request-sha256', required=True)
    args = parser.parse_args()
    binding = {'path': args.root_request, 'sha256': args.root_request_sha256}
    require(binding == {'path': str(ROOT_REQUEST), 'sha256': ROOT_REQUEST_SHA},
            'exact_root_request_binding_required')
    pin(ROOT_REQUEST, ROOT_REQUEST_SHA)
    request = read(ROOT_REQUEST)
    expected = {
        'schema': 'pm.er8.durable-queue-continuation-root.v1',
        'root_authority': True, 'accepted': True, 'mode': 'PRODUCTION_CONTINUATION',
        'campaign_root': str(LAB), 'campaign_deadline_epoch': GLOBAL_DEADLINE,
        'no_budget_reset': True, 'root_holder_unit': ROOT_UNIT,
        'root_holder_claim': {'path': str(ROOT_CLAIM), 'sha256': ROOT_CLAIM_SHA},
        'current_unit': CURRENT_UNIT,
        'current_release': {'path': str(CURRENT_RELEASE), 'sha256': CURRENT_SHA},
        'current_run_root': str(OPS / 'jobs/z-tranche-v6'),
        'current_held_exit': str(PREFIX.with_suffix('.held-exit.json')),
        'current_terminal': str(PREFIX.with_suffix('.terminal.json')),
        'next_unit': NEXT_UNIT, 'next_release': {'path': str(NEXT_RELEASE), 'sha256': NEXT_SHA},
        'next_run_root': str(NEXT_RUN), 'source_root': str(SOURCE),
        'monitor': {'path': str(MONITOR), 'sha256': MONITOR_SHA},
        'continuation_unit': CONTINUATION_UNIT, 'continuation_owned_root': str(RECEIPTS),
    }
    require(all(request.get(k) == value for k, value in expected.items()),
            'exact_root_continuation_authority_required')
    for key in ('controller_snapshot', 'ledger', 'authority'):
        pin(request[key]['path'], request[key]['sha256'])
    unit = CONTINUATION_UNIT
    receipts = unaliased(RECEIPTS)
    receipts.mkdir(mode=0o700, exist_ok=True)
    if time.time() >= GLOBAL_DEADLINE:
        save(receipts / 'CONTINUATION.json', {'state': 'HOLD_GLOBAL_BOUND',
             'saved_epoch': time.time(), 'global_deadline_epoch': GLOBAL_DEADLINE,
             'usage': 'UNKNOWN', 'no_clock_reset': True})
        return 126
    io = NativeMetadata()
    try:
        own = io.unit(unit)
        require(own.get('ActiveState') == 'active' and int(own.get('MainPID', '0')) == os.getpid(),
                'root_bounded_service_positive_pid_required')
        require(own.get('RuntimeMaxUSec') not in (None, '', 'infinity', '0', '0us')
                and own.get('KillMode') == 'control-group' and own.get('Restart') == 'no',
                'root_selected_finite_bounded_service_required')
        io.positive_process(unit, os.getpid())
        lockpath = unaliased(receipts / 'chain.lock')
        with lockpath.open('a+') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            return run(io, receipts, binding)
    except Exception as error:
        save(receipts / 'CONTINUATION.json', {'state': 'HOLD',
             'reason': str(error) if isinstance(error, Hold) else type(error).__name__,
             'saved_epoch': time.time(), 'global_deadline_epoch': GLOBAL_DEADLINE,
             'usage': 'UNKNOWN', 'no_inferred_launch_or_release': True})
        return 126


if __name__ == '__main__':
    raise SystemExit(main())

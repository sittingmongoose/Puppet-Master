#!/usr/bin/env python3
"""One custody owner, durable per-stage systemd services, no automatic retries."""
import argparse
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def atomic(path, value):
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(value, indent=2) + '\n')
    os.replace(temp, path)


def event(lab, kind, **data):
    with (lab / 'state/attempts.jsonl').open('a') as file:
        file.write(json.dumps({'utc': now(), 'kind': kind, **data}) + '\n')
        file.flush()
        os.fsync(file.fileno())


def unit_status(unit):
    result = subprocess.run(['systemctl', '--user', 'show', unit, '-p', 'ActiveState',
                            '-p', 'SubState', '-p', 'MainPID', '-p', 'ExecMainStatus',
                            '-p', 'Result', '-p', 'InvocationID', '-p', 'MemoryPeak'],
                            capture_output=True, text=True, timeout=10)
    return dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)


def reconcile(lab, state):
    changed = False
    prior_activation_ids = set()
    journal = lab / 'state/attempts.jsonl'
    if journal.exists():
        prior_activation_ids = {r.get('job_id') for line in journal.read_text().splitlines()
                                if (r := json.loads(line)).get('kind') == 'SCORED_NATIVE_GOAL_ACTIVATED'}
    for row in state['jobs']:
        if row['status'] not in ('STARTING', 'RUNNING'):
            continue
        status = unit_status(row['unit'])
        row['last_unit_observation'] = status
        changed = True
        native = Path(row['stage_json']).parent / 'native'
        activation = native / 'activation.json'
        native_receipt = native / 'receipt.json'
        if row.get('family') == 'L' and not row.get('activation_observed') and (native / 'result.json').exists():
            current = json.loads((native / 'result.json').read_text())
            identity = current.get('identity', {})
            metrics = current.get('metrics', {})
            if (metrics.get('goal_started_turn') is True and identity.get('model') == 'gpt-6-luna'
                    and identity.get('effort') == 'max' and identity.get('fresh_empty_history') is True):
                projection = {'schema': 'er9.luna.activation-positive.v1', 'job_id': row['job_id'],
                              'observed_utc': now(), 'identity': identity,
                              'thread_id': current.get('thread_id'),
                              'activation': metrics.get('activation'),
                              'native_goal_set_receipt': current.get('native_goal_set_receipt'),
                              'positive_goal_started_turn': True,
                              'source_observation_sha256': sha(native / 'result.json')}
                positive = Path(row['stage_json']).parent / 'ACTIVATION_POSITIVE.json'
                atomic(positive, projection)
                row.update(activation_observed=True, native_goal_starts=1,
                           native_goal_target=current.get('thread_id'), native_session_id=current.get('thread_id'))
                event(lab, 'SCORED_NATIVE_GOAL_ACTIVATED', job_id=row['job_id'],
                      actual_native_goal_starts=1, target_id=current.get('thread_id'),
                      observed_model='gpt-6-luna', observed_effort='max',
                      activation_path=str(positive), activation_sha256=sha(positive), track=row.get('track'))
        if not row.get('activation_observed') and activation.exists() and native_receipt.exists():
            proof = json.loads(activation.read_text())
            current = json.loads(native_receipt.read_text())
            if proof.get('startedTurn') is True and current.get('goal_activated') is True:
                row.update(activation_observed=True, native_goal_starts=1,
                           native_goal_target=current.get('goal_target_id'),
                           native_session_id=current.get('session_id'))
                if row['job_id'] not in prior_activation_ids:
                    event(lab, 'SCORED_NATIVE_GOAL_ACTIVATED', job_id=row['job_id'],
                          actual_native_goal_starts=1, target_id=current.get('goal_target_id'),
                          session_id=current.get('session_id'), observed_model=current.get('observed_model'),
                          observed_effort=current.get('observed_effort'),
                          activation_path=str(activation), activation_sha256=sha(activation))
        frozen = Path(row['expected_freeze'])
        if status.get('ActiveState') in ('active', 'activating', 'deactivating'):
            continue
        receipt = json.loads(frozen.read_text()) if frozen.exists() else None
        if receipt:
            row['status'] = 'COMPLETED' if receipt['operational_complete'] else 'FAILED'
            row['freeze_path'] = str(frozen)
            row['native_goal_starts'] = receipt['native_goal_starts']
            row['elapsed_seconds'] = receipt['elapsed_seconds']
            row['permit_release_confirmed'] = receipt.get('native_quiescent') is True and not row.get('resource_profile')
            row['evaluation_status'] = ('FROZEN_PENDING' if row.get('pipeline_final') else 'NOT_DESIGNATED_FINAL') if receipt['operational_complete'] else 'INCOMPLETE_REVIEW'
        else:
            # Never infer no launch from missing receipt, even when the unit vanished.
            row['status'] = 'UNCERTAIN_TERMINAL_NO_FREEZE'
            row['native_goal_starts'] = 1 if row.get('activation_observed') else None
        if row.get('resource_profile'):
            import resource_admission
            resource_admission.release(lab,row)
        row['ended_utc'] = now()
        event(lab, 'STAGE_TERMINAL', job_id=row['job_id'], status=row['status'],
              unit=status, freeze_path=row.get('freeze_path'),
              native_goal_starts=row.get('native_goal_starts'))
        if receipt:
            native_record = json.loads(Path(receipt['native_receipt']['path']).read_text())
            event(lab, 'STAGE_NATIVE_COST_SNAPSHOT', job_id=row['job_id'],
                  native_receipt=receipt['native_receipt'], elapsed_seconds=receipt['elapsed_seconds'],
                  native_responses=native_record.get('native_responses'),
                  native_usage=native_record.get('native_usage'),
                  provider_usage=native_record.get('provider_usage'),
                  usage_counter_semantics=native_record.get('usage_counter_semantics'),
                  dollar_billing='UNKNOWN', unexposed_child_or_cancelled_usage='UNKNOWN')
    for row in state['jobs']:
        if row.get('freeze_path') and 'permit_release_confirmed' not in row:
            frozen_metadata = json.loads(Path(row['freeze_path']).read_text())
            row['permit_release_confirmed'] = frozen_metadata.get('native_quiescent') is True
            changed = True
    by_id = {row['job_id']: row for row in state['jobs']}
    for row in state['jobs']:
        if row['status'] in ('PENDING_READINESS', 'SEALED_READY', 'WAITING_RUNTIME_BINDING'):
            previous = next((n for n in row.get('prerequisite_job_ids', [row.get('prerequisite_job')]) if n and by_id[n]['status'].startswith(('FAILED', 'UNCERTAIN', 'BLOCKED'))), None)
            if previous:
                row.update(status='BLOCKED_PREDECESSOR_FAILED', blocked_by=previous)
                event(lab, 'DEPENDENT_STAGE_BLOCKED', job_id=row['job_id'], predecessor=previous)
                changed = True
    if changed:
        atomic(lab / 'state/jobs.json', state)


def launch(lab, state, row, ready):
    if row.get('runtime_binding_ready'):
        selected = row['runtime_binding_ready']
        if sha(selected['path']) != selected['sha256']:
            raise ValueError('Selected prospective runtime marker drift')
        ready = json.loads(Path(selected['path']).read_text())
    stage = Path(row['stage_json'])
    if sha(stage) != row['stage_sha256']:
        raise ValueError('Sealed stage changed')
    if row.get('owner_registration'):
        pointer = row['owner_registration']
        if sha(pointer['path']) != pointer['sha256']:
            raise ValueError('Original owner registration changed')
        request = json.loads(Path(pointer['path']).read_text())
        card = json.loads(Path(row['card_path']).read_text())
        adapter_path = lab / 'dev/execution/dispatcher-family-adapter-v1/family_adapter.py'
        if sha(adapter_path) != 'c20e1c1c708e9ccda575b4ad1b6cf60bf12899e0ed547cc50428257b9df64a14':
            raise ValueError('Frozen declared-family adapter drift')
        import importlib.util
        adapter_spec = importlib.util.spec_from_file_location('er9_declared_family_adapter', adapter_path)
        adapter = importlib.util.module_from_spec(adapter_spec)
        adapter_spec.loader.exec_module(adapter)
        expected_family = adapter.declared_family(card)
        expected_model = 'glm53flash' if expected_family == 'Z' else 'gpt6luna'
        normalized_model = ''.join(c for c in request['requested_model'].lower() if c.isalnum())
        if (expected_family != row.get('family') or request['family'] != expected_family
                or normalized_model != expected_model or request['requested_effort'].lower() != 'max'):
            raise ValueError('Exact owner model/family/effort mismatch')
        spec = json.loads(stage.read_text())
        if ('L' if spec.get('luna_runtime') else 'Z') != expected_family:
            raise ValueError('Bound actual runtime differs from owner family')
        if expected_family == 'Z' and type(spec['max_responses']) is not int:
            raise ValueError('Supported GLM response bound missing')
        if expected_family == 'L' and spec['max_responses'] is not None:
            raise ValueError('Luna response cap unsupported')
    for path, digest in ready['source_pins'].items():
        if sha(path) != digest:
            raise ValueError('Accepted runner/source pin changed: ' + path)
    if row.get('tools_source_pins'):
        pointer = row['tools_source_pins']
        if sha(pointer['path']) != pointer['sha256']:
            raise ValueError('Selected immutable tool source manifest changed')
        tool_manifest = json.loads(Path(pointer['path']).read_text())
        for relative, digest in tool_manifest['files'].items():
            if sha(Path(pointer['path']).parent / relative) != digest:
                raise ValueError('Selected immutable tool source bytes changed')
    birth_ns = time.monotonic_ns()
    name = 'er9-203005-' + row['job_id'].lower()
    row.update(status='STARTING', unit=name + '.service', start_utc=now(),original_birth_monotonic_ns=birth_ns)
    # Save original intent before external mutation. A crash here leaves an
    # uncertain attempt; restarting never transitions it back to pending.
    atomic(lab / 'state/jobs.json', state)
    event(lab, 'STAGE_LAUNCH_INTENT', job_id=row['job_id'], stage_sha256=row['stage_sha256'],
          unit=row['unit'], max_seconds=row['max_seconds'], max_responses=row['max_responses'])
    run = stage.parent
    profile = None
    if row.get('resource_definition'):
        import resource_admission
        profile = resource_admission.allocate(lab,row,run,birth_ns)
        atomic(lab / 'state/jobs.json', state)
    command = ['systemd-run', '--user', '--unit', name,
               '--property=Type=exec', '--property=KillMode=control-group',
               '--property=RuntimeMaxSec=' + str(row['max_seconds'] + 45),
               '--property=StandardOutput=append:' + str(run / 'worker.stdout.jsonl'),
               '--property=StandardError=append:' + str(run / 'worker.stderr.log'),
               '--working-directory=' + str(lab), '/usr/bin/python3', '-B',
               row.get('worker_path', str(lab / ('ops/dispatcher/luna_worker.py' if row.get('family') == 'L' else 'dev/execution/stage_worker.py'))),
               '--stage-json', str(stage), '--stage-sha256', row['stage_sha256']]
    if profile:
        command[command.index('--property=RuntimeMaxSec=' + str(row['max_seconds']+45))] = '--property=RuntimeMaxSec=' + str(max(0.1,(profile['original_total_stop_monotonic_ns']-time.monotonic_ns())/1e9))
        command[4:4] = ['--slice='+profile['slice_unit'],'--property=MemoryMax=805306368','--property=MemorySwapMax=0']
        command += ['--birth-monotonic-ns',str(birth_ns),'--resource-profile',row['resource_profile']['path'],'--resource-profile-sha256',row['resource_profile']['sha256']]
    result = subprocess.run(command, capture_output=True, text=True, timeout=20)
    row['launch_command_exit'] = result.returncode
    row['launch_command_output'] = result.stdout + result.stderr
    row['status'] = 'RUNNING' if result.returncode == 0 else 'UNCERTAIN_LAUNCH_FAILURE'
    atomic(lab / 'state/jobs.json', state)
    event(lab, 'STAGE_SERVICE_LAUNCHED', job_id=row['job_id'], unit=row['unit'],
          command_exit=result.returncode, output=row['launch_command_output'])


def initial_development_terminal(state):
    for i in range(1,13):
        pair = ('I-%02d-LUNA-S1' % i) if 5 <= i <= 8 else ('I-%02d' % i)
        rows = [r for r in state['jobs'] if r['pair_id'] == pair]
        if not rows or any(not r['status'].startswith(('COMPLETED','FAILED','BLOCKED','UNCERTAIN')) for r in rows):
            return False
    return True


def cycle(lab):
    state = json.loads((lab / 'state/jobs.json').read_text())
    reconcile(lab, state)
    assessment_path = lab / 'evaluation/dispatch/I01_ASSESSMENT_RECEIPT_v1.json'
    if assessment_path.exists():
        if sha(assessment_path) != '8fa2c3cad773ea01340c4047cbd3b845f04c6e50d2d7a50a962bdfc278642b61':
            raise ValueError('Owner-frozen assessment receipt drift')
        assessment = json.loads(assessment_path.read_text())
        if sha(assessment['finished']['path']) != assessment['finished']['sha256']:
            raise ValueError('Assessment finished pin drift')
        assessed_row = next(r for r in state['jobs'] if r['job_id'] == assessment['job_id'])
        if not assessed_row.get('assessment_complete'):
            assessed_row.update(assessment_complete=True, evaluation_status=assessment['evaluation_status'], assessment_receipt={'path':str(assessment_path),'sha256':sha(assessment_path)}, valid_full_pipeline_credit=False)
            atomic(lab / 'state/jobs.json', state)
            event(lab,'ASSESSMENT_METADATA_CONSUMED',job_id=assessed_row['job_id'],evaluation_status=assessment['evaluation_status'],original_operational_status=assessed_row['status'],valid_full_pipeline_credit=False)
    status_path = lab / 'dev/execution/status-projection/cohort-001/NATIVE_GOAL_STATUS.json'
    if status_path.exists():
        if sha(status_path) != 'b290343719c1e0feea8a54d9627dd8c34175e2db8d0d0426efbffea484dc1f7d':
            raise ValueError('Frozen direct native Goal status drift')
        by_id = {r['job_id']:r for r in state['jobs']}
        projected = False
        for fact in json.loads(status_path.read_text())['jobs']:
            row = by_id.get(fact['job_id'])
            if row is None or row.get('direct_native_goal_status_projection'):
                continue
            row.update(direct_native_goal_status=fact['native_goal_status'], direct_native_goal_id=fact.get('goal_id'), direct_native_goal_status_projection={'path':str(status_path),'sha256':sha(status_path)})
            projected = True
        if projected:
            atomic(lab / 'state/jobs.json',state)
            event(lab,'DIRECT_NATIVE_GOAL_STATUS_PROJECTION_CONSUMED',source_sha256=sha(status_path),operational_statuses_unchanged=True)
    absence_path = lab / 'dev/luna-route/diagnosis-I05/CRITIC_QUIESCENCE_OBSERVATION.json'
    if absence_path.exists():
        if sha(absence_path) != 'd4b39d43c00016dce18ee30e84ce8e98ad769304bb3f72726fef6cd1d87aaffd':
            raise ValueError('Pinned supplemental owned-absence drift')
        absence = json.loads(absence_path.read_text())
        process_record = absence['held_process_record']
        observed_unit = process_record['terminal_unit_observation']
        if (any(absence['exact_recorded_pid_existence'].values()) or not process_record['cgroup_absent_or_empty']
                or observed_unit['active_state'] != 'inactive'):
            raise ValueError('No positive exact-owned absence')
        released_row = next(r for r in state['jobs'] if r['job_id'] == absence['job_id'])
        if not released_row.get('supplemental_permit_release'):
            released_row.update(permit_release_confirmed=True,supplemental_permit_release={'path':str(absence_path),'sha256':sha(absence_path)},historical_operational_status_preserved=True)
            atomic(lab / 'state/jobs.json',state)
            event(lab,'OWNED_RESOURCE_PERMIT_RELEASED_BY_PINNED_SUPPLEMENT',job_id=released_row['job_id'],original_operational_status=released_row['status'],original_freeze_unchanged=True)
    ready_file = lab / 'ops/dispatcher/ADMISSION_READY.json'
    if not ready_file.exists():
        return
    ready = json.loads(ready_file.read_text())
    if ready['status'] != 'ACCEPTED_FOR_I01_I04_DISPATCH':
        return
    bind_result = subprocess.run(['/usr/bin/python3', '-B',
                                  str(lab / 'ops/dispatcher/bind_next.py'), '--lab', str(lab)],
                                 capture_output=True, text=True, timeout=20)
    if bind_result.returncode:
        raise ValueError('Prospective binder refused: ' + bind_result.stderr[-2000:])
    state = json.loads((lab / 'state/jobs.json').read_text())
    import sys
    sys.path.insert(0, str(lab / 'ops/dispatcher'))
    import supplementary_metadata
    supplementary_metadata.consume(lab,state)
    import service_error_monitor
    service_error_monitor.observe(lab,state)
    import glm_template_bind
    glm_template_bind.bind_all(lab, state, ready)
    cursor = {'schema': 'er9.queue_cursor.v1', 'updated_utc': now(),
              'admission_owner': 'codex-er9-ops',
              'running_job_ids': [r['job_id'] for r in state['jobs'] if r['status'] in ('STARTING', 'RUNNING')],
              'completed_job_ids': [r['job_id'] for r in state['jobs'] if r['status'] == 'COMPLETED'],
              'failed_or_uncertain_job_ids': [r['job_id'] for r in state['jobs'] if r['status'].startswith(('FAILED', 'UNCERTAIN'))],
              'pending_job_ids': [r['job_id'] for r in state['jobs'] if r['status'] in ('PENDING_READINESS', 'SEALED_READY', 'WAITING_RUNTIME_BINDING')],
              'scored_native_goal_starts_confirmed': sum(r.get('native_goal_starts') or 0 for r in state['jobs']),
              'route_canaries_accounted_separately': 'state/attempts.jsonl',
              'retained_resource_job_ids': [r['job_id'] for r in state['jobs'] if r.get('permit_release_confirmed') is False and r['status'] not in ('RUNNING','STARTING')],
              'active_by_family': {family: sum(r.get('family') == family and r['status'] in ('RUNNING', 'STARTING') for r in state['jobs']) for family in ('M', 'Z', 'L')},
              'automatic_retry': False}
    atomic(lab / 'state/queue_cursor.json', cursor)
    # Current paired native loads fit only when actual available RAM leaves
    # a reserve for evaluators/host. Threshold is a disclosed local admission
    # regulator, never a provider permission or campaign lifetime cap.
    available = next(int(line.split()[1]) for line in Path('/proc/meminfo').read_text().splitlines()
                     if line.startswith('MemAvailable:'))
    glm_host_admission_ok = available >= ready['minimum_available_kb']
    running = sum(row['status'] in ('STARTING', 'RUNNING') and row.get('family') == 'Z' for row in state['jobs'])
    complete_envelope_active = any(r.get('resource_profile') and (r['status'] in ('STARTING','RUNNING') or r.get('permit_release_confirmed') is False) for r in state['jobs'])
    # Legacy GLM outer growth is unbounded; do not introduce it beside a new
    # fully-reserved envelope. Existing jobs remain untouched.
    permits = max(0, 2 - running - ready.get('external_glm_active', 0)) if glm_host_admission_ok and not complete_envelope_active else 0
    rows = {row['job_id']: row for row in state['jobs']}
    for row in sorted(state['jobs'], key=lambda r: (0 if r.get('stage_index',0)>0 else 1, r.get('priority_class',2), r['pair_id'], 0 if r.get('arm')=='treatment' else 1)):
        if permits == 0:
            break
        if row['status'] != 'SEALED_READY' or row['pair_id'] not in ready['authorized_pairs']:
            continue
        if row.get('confirmation_wait_initial_terminal') and not initial_development_terminal(state):
            continue
        previous = row.get('prerequisite_job_ids', [row.get('prerequisite_job')])
        if any(n and rows[n]['status'] != 'COMPLETED' for n in previous):
            continue
        launch(lab, state, row, ready)
        permits -= 1
    luna_file = lab / 'ops/dispatcher/LUNA_ADMISSION_READY.json'
    if not luna_file.exists():
        return
    luna = json.loads(luna_file.read_text())
    if luna['status'] != 'ACCEPTED_LUNA_CONDITIONAL_SCOPE':
        return
    binding = subprocess.run(['/usr/bin/python3', '-B', str(lab / 'ops/dispatcher/luna_bind_next.py'), '--lab', str(lab)], capture_output=True, text=True, timeout=30)
    if binding.returncode:
        raise ValueError('Luna binder refused: ' + binding.stderr[-2000:])
    state = json.loads((lab / 'state/jobs.json').read_text())
    available = next(int(line.split()[1]) for line in Path('/proc/meminfo').read_text().splitlines()
                     if line.startswith('MemAvailable:'))
    # Each dynamic native stage has three 768MiB guarded services plus one
    # serial 256MiB execution service. Regulate rolling starts by this actual
    # configured worst bound and host/evaluator spare; this is no Luna policy cap.
    active_luna = sum(r.get('family') == 'L' and (r['status'] in ('STARTING', 'RUNNING') or r.get('permit_release_confirmed') is False) for r in state['jobs'])
    resource_permits = max(0, (available - luna['host_evaluator_reserve_kb']
                             - active_luna * luna['per_stage_worst_bound_kb']) // luna['per_stage_worst_bound_kb'])
    pending_eval = sum(r.get('pipeline_final') and r.get('evaluation_status') == 'FROZEN_PENDING' for r in state['jobs'])
    if pending_eval >= luna['pending_evaluation_regulator']:
        return
    # Rolling startup batches prevent a sudden request flood; subsequent cycles
    # admit more when actual host margin remains. No lifetime/total-start bound.
    import resource_admission
    growth, legacy_unknown = resource_admission.remaining_growth_kb(state)
    if any(r.get('resource_definition') and r['status']=='SEALED_READY' for r in state['jobs']):
        if not legacy_unknown:
            resource_permits = max(0,(available-luna['host_evaluator_reserve_kb']-growth)//2359296)
    allowance = min(resource_permits, luna['rolling_start_batch'])
    recovery_job = luna.get('bounded_service_recovery_job')
    if recovery_job:
        probe = next(r for r in state['jobs'] if r['job_id'] == recovery_job)
        if probe['status'] == 'COMPLETED':
            luna.pop('bounded_service_recovery_job')
            event(lab, 'LUNA_USEFUL_SERVICE_RECOVERY_SUCCEEDED', job_id=recovery_job)
            atomic(luna_file, luna)
            recovery_job = None
        elif probe['status'].startswith(('FAILED','UNCERTAIN')):
            luna['status'] = 'HELD_REAL_MODEL_SERVICE_CAPACITY'
            luna['backoff_started_utc'] = now()
            atomic(luna_file, luna)
            event(lab, 'LUNA_USEFUL_SERVICE_RECOVERY_TERMINAL_HOLD', job_id=recovery_job)
            return
        else:
            allowance = min(allowance, 1)
    rows = {r['job_id']: r for r in state['jobs']}
    candidates = sorted(state['jobs'], key=lambda r: (r.get('priority_class', 2), 0 if r.get('stage_index', 0) > 0 else 1))
    for row in candidates:
        if allowance <= 0:
            break
        if row.get('family') != 'L' or row['status'] != 'SEALED_READY':
            continue
        if recovery_job and row['job_id'] != recovery_job:
            continue
        if row['pair_id'] not in luna['authorized_pairs']:
            continue
        previous = row.get('prerequisite_job_ids', [])
        if any(rows[name]['status'] != 'COMPLETED' for name in previous):
            continue
        if not row.get('resource_definition') and any(r.get('resource_profile') and (r['status'] in ('STARTING','RUNNING') or r.get('permit_release_confirmed') is False) for r in state['jobs']):
            continue
        if row.get('resource_definition'):
            import resource_admission
            growth, legacy_unknown = resource_admission.remaining_growth_kb(state)
            actual_available = next(int(v.split()[1]) for v in Path('/proc/meminfo').read_text().splitlines() if v.startswith('MemAvailable:'))
            if legacy_unknown or actual_available < luna['host_evaluator_reserve_kb'] + growth + 2359296:
                continue
        launch(lab, state, row, luna)
        allowance -= 1


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--lab', type=Path, required=True)
    parser.add_argument('--once', action='store_true')
    args = parser.parse_args()
    with (args.lab / 'ops/dispatcher/admission.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        while True:
            try:
                cycle(args.lab)
            except Exception as error:
                atomic(args.lab / 'ops/dispatcher/dispatch_error.json',
                       {'utc': now(), 'error': str(error), 'automatic_retry': False})
                if args.once:
                    raise
            if args.once:
                break
            time.sleep(10)

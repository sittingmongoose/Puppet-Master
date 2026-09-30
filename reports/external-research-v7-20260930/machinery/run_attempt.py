#!/usr/bin/env python3
"""One admitted M/Z attempt. The operator alone owns slots and native-quiescence release."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import os
import signal
import sys
import time
from workspaces import verify, write_json, OPERATOR_CODE

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(OPERATOR_CODE))
from isolation import namespace_command


def command(attempt):
    meta = verify(attempt)
    spec = meta['spec']
    app = {'M': 'muse', 'Z': 'zcode'}.get(spec['family'])
    if app is None:
        raise ValueError('L must use the standalone Codex native-Goal operator route')
    cmd = [sys.executable, str(HERE / 'native/run_goal.py'), '--app', app,
           '--workspace', meta['workspace'], '--prompt-file', meta['goal_file'],
           '--out', str(Path(attempt).resolve() / 'native'), '--label', spec['job_id'],
           '--max-seconds', str(spec['caps']['seconds']),
           '--max-responses', str(spec['caps']['responses'])]
    if app == 'zcode':
        # Do not silently restrict discovery tools to the historical fixed-corpus default.
        tools = spec.get('zcode_tools')
        if not tools:
            raise ValueError('Z tool allowlist must be bound explicitly to the declared source access')
        cmd += ['--zcode-tools', *tools]
    return meta, cmd


def run(attempt, lease_id):
    if not lease_id:
        raise ValueError('operator admission lease is required')
    meta, cmd = command(attempt)
    # Read-only binding to the operator's sole registry; this wrapper never creates/releases leases.
    registry = HERE.parents[1] / 'ops/slots.json'
    state = json.loads(registry.read_text())
    lease = state['jobs'].get(lease_id)
    if (lease_id != meta['spec']['job_id'] or not lease or lease.get('released_epoch') is not None
            or lease['family'] != meta['spec']['family']
            or lease['cap_seconds'] < meta['spec']['caps']['seconds']):
        raise ValueError('missing, released, mismatched or undersized operator admission lease')
    attempt = Path(attempt).resolve()
    from review_gate import verify_freeze
    verify_freeze()
    remaining = lease['admitted_epoch'] + meta['spec']['caps']['seconds'] - time.time()
    if remaining <= 0:
        raise ValueError('operator admission whole-job deadline has expired')
    # Exclusive record stops a second launch of the same scored assignment, even after a crash.
    with (attempt / 'dispatch.json').open('x') as f:
        json.dump({'schema': 'er7.dispatch.v1', 'lease_id': lease_id,
                   'job_id': meta['spec']['job_id'], 'family': meta['spec']['family'],
                   'start_utc': datetime.now(timezone.utc).isoformat(), 'argv': cmd}, f)
    cmd = namespace_command(cmd, meta['workspace'], attempt,
                            family=meta['spec']['family'], readonly_code=HERE)
    t0 = time.monotonic()
    with (attempt / 'driver.stdout').open('x') as stdout, (attempt / 'driver.stderr').open('x') as stderr:
        process = subprocess.Popen(cmd, stdout=stdout, stderr=stderr, start_new_session=True)
        try:
            write_json(attempt / 'driver-process.json', {'pid': process.pid, 'process_group': process.pid,
                       'lease_id': lease_id, 'native_driver': cmd[1], 'monitoring_owner': 'operator'})
            try:
                rc = process.wait(timeout=max(0.001, lease['admitted_epoch'] + meta['spec']['caps']['seconds'] - time.time()))
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGTERM)
                try:
                    rc = process.wait(timeout=2)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid, signal.SIGKILL)
                    rc = process.wait(timeout=3)
                write_json(attempt / 'outer-cap.json', {'whole_driver_cap_seconds': meta['spec']['caps']['seconds'],
                           'cap_enforced': True, 'includes_startup_cleanup': True})
        finally:
            # Every post-Popen failure must terminate the isolated namespace; never orphan it.
            if process.poll() is None:
                try: os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError: pass
                process.wait(timeout=3)
    path = attempt / 'native/receipt.json'
    native = json.loads(path.read_text()) if path.exists() else {}
    # Bubblewrap's private PID namespace is gone once its child and all descendants exit.
    namespace_absent = process.poll() is not None
    try:
        os.killpg(process.pid, 0)
        own_group_absent = False
    except ProcessLookupError:
        own_group_absent = True
    except PermissionError:
        own_group_absent = False
    native.update({'namespace_process_pid': process.pid, 'namespace_process_returncode': rc,
                   'namespace_exited': namespace_absent, 'own_process_group_absent': own_group_absent,
                   'native_quiescent': namespace_absent and own_group_absent,
                   'quiescence_basis': 'bubblewrap --unshare-pid --die-with-parent namespace exited',
                   'startup_cleanup_elapsed_seconds': round(time.monotonic() - t0, 3)})
    if not path.parent.exists(): path.parent.mkdir()
    write_json(path, native)
    tokens = native.get('usage_totals') if meta['spec']['family'] == 'Z' else native.get('counters')
    summary = {'schema': 'er7.boundary_receipt.v1', 'job_id': meta['spec']['job_id'],
               'lease_id': lease_id, 'driver_exit_code': rc, 'driver_pid': process.pid,
               'driver_elapsed_seconds_including_setup_and_cleanup': round(time.monotonic() - t0, 3),
               'native_session_id': native.get('session_id'), 'native_stop_reason': native.get('stop_reason'),
               'native_goal_status': native.get('goal_status_final'), 'driver_error': native.get('driver_error'),
               'requested_model': {'M': 'muse-spark-1.3-contributor', 'Z': 'GLM-5.3-Flash'}[meta['spec']['family']],
               'requested_effort': 'max', 'effective_model': native.get('model_id'),
               'effective_effort': native.get('effort_effective'),
               'usage_reported': tokens, 'generated_output_tokens': (tokens or {}).get('outputTokens'),
               'generated_output_completeness': 'unknown; native children/cancellation may be incompletely metered',
               'native_quiescence': 'established isolated PID namespace exit' if namespace_absent else 'unestablished',
               'native_quiescent': namespace_absent and own_group_absent, 'native_receipt_sha256': __import__('hashlib').sha256(path.read_bytes()).hexdigest(),
               'slot_release_authorized_by_wrapper': False, 'output_integrity': 'not frozen',
               'semantic_quality': 'not evaluated'}
    write_json(attempt / 'boundary-receipt.json', summary)
    return summary


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--attempt', type=Path, required=True)
    ap.add_argument('--lease')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    if args.dry_run:
        _, cmd = command(args.attempt)
        print(json.dumps({'would_run': cmd, 'candidate_started': False}))
    else:
        print(json.dumps(run(args.attempt, args.lease), indent=2))


if __name__ == '__main__':
    main()

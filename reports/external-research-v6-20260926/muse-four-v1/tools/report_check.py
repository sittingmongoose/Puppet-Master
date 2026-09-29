#!/usr/bin/env python3
"""Compact, read-only accounting for one closed four-submission run.

The prepare command runs automatically after the operator's audit. Confirm is
invoked only after an operator observes the result push; it never pushes.
"""
import argparse
import hashlib
import json
import time
from pathlib import Path


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path):
    return json.loads(path.read_text()) if path.is_file() else None


def events(path):
    if not path.is_file():
        return []
    result = []
    for line in path.read_text().splitlines():
        if line.strip():
            outer = json.loads(line)
            result.append(outer)
            result.extend(json.loads(c['record_json']) for c in outer.get('children', []) if 'record_json' in c)
    return result


def retry_accounting(journal):
    if not journal.is_file():
        return {'scheduled_count': 'unknown', 'completed_count': 'unknown',
                'completed_wait_seconds': 'unknown', 'interrupted_count': 'unknown',
                'waits': [], 'scope': 'Journal missing; native internal retry evidence unavailable.'}
    by_task = {}
    for row in events(journal):
        event = row.get('payload', {}).get('event', {})
        task = event.get('task_id')
        if not task:
            continue
        kind = event.get('kind')
        phase = event.get('details', {}).get('phase')
        if kind == 'status' and phase == 'retry_scheduled':
            facet = next((x for x in event['details'].get('facets', []) if x.get('kind') == 'external_attempt'), {})
            by_task.setdefault(task, []).append({'scheduled_us': row.get('recorded_at'), 'scheduled_ms': facet.get('retry_delay_ms'), 'http_status': facet.get('http_status'), 'attempt': facet.get('attempt'), 'next_attempt': facet.get('next_attempt'), 'completed_us': None, 'end_kind': None})
        elif kind == 'status' and phase == 'opening_stream':
            facet = next((x for x in event['details'].get('facets', []) if x.get('kind') == 'external_attempt'), {})
            for wait in reversed(by_task.get(task, [])):
                if wait['completed_us'] is None and facet.get('attempt') == wait['next_attempt']:
                    wait.update(completed_us=row.get('recorded_at'), end_kind='next_attempt_opened')
                    break
        elif kind in ('cancelled', 'failed'):
            for wait in reversed(by_task.get(task, [])):
                if wait['completed_us'] is None:
                    wait.update(completed_us=row.get('recorded_at'), end_kind=kind)
                    break
    waits = [{**wait, 'task_id': task,
              'observed_seconds': round((wait['completed_us'] - wait['scheduled_us']) / 1_000_000, 6) if wait['completed_us'] is not None and wait['scheduled_us'] is not None else None}
             for task, items in by_task.items() for wait in items]
    completed = [w for w in waits if w['end_kind'] == 'next_attempt_opened']
    interrupted = [w for w in waits if w['end_kind'] in ('cancelled', 'failed')]
    return {'scheduled_count': len(waits), 'completed_count': len(completed),
            'completed_wait_seconds': round(sum(w['observed_seconds'] for w in completed), 6),
            'interrupted_count': len(interrupted), 'waits': waits,
            'scope': 'Task-ID journal status joins; waits are inside elapsed clocks, never subtracted.'}


def usage_accounting(msp_path, receipt):
    if not msp_path.is_file():
        return {'completed_parent_usage_records': 'unknown', 'reported_completed_parent_tokens': 'unknown',
                'per_component_coverage': 'unknown', 'child_tokens': 'unknown',
                'cancelled_parent_tokens': 'unknown', 'whole_run_total_tokens': 'unknown',
                'scope': 'MSP usage stream unavailable; no zero substituted.'}
    records = [e.get('params', {}) for e in events(msp_path) if e.get('method') == 'session/tokenUsage']
    fields = ('inputTokens', 'outputTokens', 'reasoningTokens', 'cacheReadTokens', 'cacheWriteTokens', 'cachedTokens')
    reported = {field: [p['usage'][field] for p in records if isinstance(p.get('usage'), dict) and isinstance(p['usage'].get(field), int)] for field in fields}
    sums = {field: sum(values) if values else 'unknown' for field, values in reported.items()}
    coverage = {field: {'reported_records': len(values), 'expected_completed_parent_records': receipt.get('native_responses'),
                        'complete': isinstance(receipt.get('native_responses'), int) and len(values) == receipt['native_responses'] and len(records) == receipt['native_responses']}
                for field, values in reported.items()}
    return {'completed_parent_usage_records': len(records), 'reported_completed_parent_tokens': sums,
            'per_component_coverage': coverage,
            'last_cumulative': records[-1].get('cumulative') if records else None,
            'duration_ms': [p.get('durationMs') for p in records],
            'native_responses_counter': receipt.get('native_responses'),
            'child_tokens': 'unknown', 'cancelled_parent_tokens': 'unknown', 'whole_run_total_tokens': 'unknown',
            'scope': 'Only exposed completed parent responses; missing records are not zero usage.'}


def structural_summary(audit, state):
    checks = audit.get('checks', {}) if isinstance(audit.get('checks'), dict) else {}
    safe_fields = {
        'template_snapshots_receipts': ('snapshot_count', 'snapshot_sha256'),
        'current_and_history': ('target_finding_id', 'independent_finding_id', 'current_finding_count'),
        'native_completion_proofs': ('session_id', 'journal_sha256', 'native_calls', 'native_writes'),
        'native_batches': ('groups', 'initial_batches_observed'),
        'marker_overlap': ('overlapping_pairs',),
        'receipt_read_order': ('reads', 'receipt_order_sha256', 'basis'),
        'prescribed_native_order': ('native_sequence_evidence',),
        'unchanged_idle_polls': ('host_observation',),
    }
    clean = {name: {'status': item.get('status'), 'error_count': len(item.get('errors', [])),
                    'blocked_by': item.get('blocked_by', []),
                    **{key: item[key] for key in safe_fields.get(name, ()) if key in item}}
             for name, item in checks.items() if isinstance(item, dict)}
    attempts = state.get('attempts', []) if isinstance(state, dict) else []
    attempts = attempts if isinstance(attempts, list) else []
    valid = sum(a.get('status') == 'VALID_UNVERIFIED' for a in attempts if isinstance(a, dict))
    snapshot_references = sum(bool(a.get('snapshot')) + bool(a.get('marker_snapshot')) for a in attempts if isinstance(a, dict))
    fidelity = checks.get('template_snapshots_receipts', {})
    matching_snapshots = fidelity.get('snapshot_count') if fidelity.get('status') == 'pass' else 'unknown'
    inventory = checks.get('allocation_and_acknowledgements', {})
    return {'audit_status': audit.get('status'), 'checks': clean,
            'attempt_count_including_invalid': len(attempts), 'valid_acknowledgements': valid,
            'snapshot_references': snapshot_references, 'matching_snapshot_count': matching_snapshots,
            'required_acknowledgements': 4, 'required_snapshots': 8,
            'inventory_expected_count': inventory.get('expected_count'),
            'required_count_status': 'pass' if len(attempts) == valid == 4 and snapshot_references == matching_snapshots == 8 and inventory.get('status') == 'pass' else 'fail_or_incomplete',
            'semantic_validation': 'not_performed',
            'scope': 'Sanitized check statuses and structural counts; raw content remains in pinned VM evidence.'}


def prepare(run_root, result_dir):
    terminal = load(run_root / 'phase-terminal.json')
    if not terminal or terminal.get('state') != 'closed':
        raise RuntimeError('run has no closed terminal record')
    host = load(run_root / 'host-receipt.json') or {}
    receipt = load(run_root / 'native/receipt.json') or {}
    identities = load(run_root / 'launch-identities.json') or {}
    state = load(run_root / 'store/state.json') or {}
    audit_path = run_root / 'audit.stdout'
    try:
        audit = json.loads(audit_path.read_text())
    except (OSError, ValueError):
        audit = {'status': 'unavailable', 'reason': 'automatic audit output absent or unreadable'}
    journal = run_root / 'native/muse-session.jsonl'
    msp = run_root / 'native/muse-msp.jsonl'
    raw = [p for p in (run_root / 'launch-identities.json', run_root / 'dispatch.json', run_root / 'store/state.json', run_root / 'receipt-order.jsonl', run_root / 'native/receipt.json', journal, msp, run_root / 'native/usage-events.jsonl', run_root / 'audit.stdout', run_root / 'phase-terminal.json') if p.is_file()]
    evidence = [{'path': str(p.resolve()), 'bytes': p.stat().st_size, 'sha256': digest(p)} for p in raw]
    structural = structural_summary(audit, state)
    structural_pass = audit.get('status') == 'pass' and structural['required_count_status'] == 'pass' and receipt.get('goal_status_final') == 'complete' and receipt.get('stop_reason') not in ('cap_seconds', 'cap_responses') and not host.get('error') and terminal.get('execution_terminal_within_whole_ceiling') is True
    result_dir.mkdir(parents=True, exist_ok=True)
    audit_target = result_dir / 'structural-audit.json'
    if audit_target.exists():
        raise RuntimeError('structural audit already exists; no overwrite')
    audit_target.write_text(json.dumps(structural, indent=2, ensure_ascii=False) + '\n')
    def bounded_account(function, path, *args):
        try:
            return function(path, *args)
        except (OSError, UnicodeError, ValueError, TypeError, KeyError, AttributeError) as exc:
            return {'status': 'unavailable', 'parse_error_type': type(exc).__name__,
                    'completed_parent_tokens': 'unknown', 'waits': 'unknown',
                    'scope': 'Raw source retained by path/hash; partial telemetry was not repaired or inferred.'}

    report = {'schema': 'muse-four-compact-result/v1', 'run_root': str(run_root.resolve()),
              'execution_result': 'PASS' if structural_pass else 'FAIL_OR_INCOMPLETE',
              'whole_check_result': 'PENDING_PUBLICATION' if structural_pass else 'FAIL_OR_INCOMPLETE',
              'audit_status': audit.get('status'), 'audit_path': str(audit_path.resolve()),
              'structural_audit': {'path': str(audit_target.resolve()), 'sha256': digest(audit_target),
                                   'required_count_status': structural['required_count_status']},
              'semantic_validation': 'not_performed',
              'launch': {'authorization_reference': identities.get('authorization_reference'),
                         'authorized_commit': identities.get('authorized_commit'),
                         'successor_source_pins_sha256': identities.get('successor_source_pins_sha256'),
                         'requested_app': identities.get('requested_app'),
                         'requested_model': identities.get('requested_model'),
                         'requested_effort': identities.get('requested_effort'),
                         'observed_model': receipt.get('model_id'),
                         'observed_provider': receipt.get('provider_id'),
                         'observed_effort': receipt.get('effort_effective'),
                         'observed_session_id': receipt.get('session_id')},
              'native_goal_status': receipt.get('goal_status_final'), 'native_stop': receipt.get('stop_reason'),
              'native_elapsed_seconds': receipt.get('elapsed_seconds'),
              'host_driver_receiver_seconds': host.get('driver_and_receiver_seconds'),
              'host_complete_check_seconds_before_audit': host.get('complete_check_seconds_before_audit'),
              'go_to_execution_terminal_seconds': terminal.get('execution_terminal_seconds_from_go'),
              'whole_ceiling_seconds': 390, 'execution_terminal_within_ceiling': terminal.get('execution_terminal_within_whole_ceiling'),
              'publication': 'pending observed confirmation', 'host_error': host.get('error'),
              'valid_received_records_are_not_whole_task_pass': True,
              'usage': bounded_account(usage_accounting, msp, receipt),
              'native_internal_retries': bounded_account(retry_accounting, journal),
              'retry_limitations': 'Only Task-ID journal statuses are joined. Missing journal evidence is unknown; provider attempts without bound IDs are not attributed. Native waits remain inside elapsed time.',
              'no_host_redispatch': (load(run_root / 'dispatch.json') or {}).get('no_host_redispatch'),
              'raw_evidence': evidence}
    target = result_dir / 'compact-result.json'
    if target.exists():
        raise RuntimeError('compact result already exists; no overwrite')
    target.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    return target


def confirm(run_root, result_dir, observed_ref, stage):
    report_path = result_dir / 'compact-result.json'
    if not report_path.is_file():
        raise RuntimeError('prepare result missing')
    report = load(report_path)
    terminal = load(run_root / 'phase-terminal.json')
    if report.get('run_root') != str(run_root.resolve()) or not terminal:
        raise RuntimeError('run/result mismatch')
    if stage not in ('result', 'confirmation_record'):
        raise ValueError('unknown publication stage')
    first = result_dir / 'publication-confirmation.json'
    if stage == 'confirmation_record' and not first.is_file():
        raise RuntimeError('first result publication has not been recorded')
    target = first if stage == 'result' else run_root / 'confirmation-record-publication.json'
    if target.exists():
        raise RuntimeError('publication already recorded; no overwrite')
    observed = time.time()
    record = {'schema': 'muse-four-publication-confirmation/v1', 'stage': stage,
              'observed_confirmation_epoch': observed, 'observed_ref': observed_ref,
              'go_epoch': terminal['start_epoch'], 'deadline_epoch': terminal['start_epoch'] + 390,
              'go_to_confirmed_publication_seconds': observed - terminal['start_epoch'],
              'within_whole_ceiling': observed <= terminal['start_epoch'] + 390,
              'whole_check_result': 'PASS' if report.get('execution_result') == 'PASS' and observed <= terminal['start_epoch'] + 390 and (stage == 'result' or load(first).get('whole_check_result') == 'PASS') else 'FAIL_OR_INCOMPLETE',
              'compact_result_sha256': digest(report_path),
              'first_result_publication': {'path': str(first.resolve()), 'sha256': digest(first),
                                           'observed_confirmation_epoch': load(first)['observed_confirmation_epoch']} if stage == 'confirmation_record' else None,
              'meaning': 'Recorded after the operator observed this stage on the remote; this command performs no push.'}
    target.write_text(json.dumps(record, indent=2) + '\n')
    return target


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    sub = cli.add_subparsers(dest='mode', required=True)
    for name in ('prepare', 'confirm'):
        p = sub.add_parser(name)
        p.add_argument('--run-root', type=Path, required=True)
        p.add_argument('--result-dir', type=Path, required=True)
        if name == 'confirm':
            p.add_argument('--observed-ref', required=True, help='Actually observed pushed commit/ref or publication receipt')
            p.add_argument('--stage', choices=('result', 'confirmation_record'), required=True)
    a = cli.parse_args()
    path = prepare(a.run_root.resolve(), a.result_dir.resolve()) if a.mode == 'prepare' else confirm(a.run_root.resolve(), a.result_dir.resolve(), a.observed_ref, a.stage)
    print(path)


if __name__ == '__main__':
    main()

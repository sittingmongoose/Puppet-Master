#!/usr/bin/env python3
"""Run the complete W3D checker over every positive and single-defect witness (ATS-1230, phase 2).

Usage: python3 scripts/pm-w3d-event-contracts.py [--json out.json] [--skip-numbers] [--skip-inventory]

Each case names its boundary and expectation; a negative passes only when its FIRST refusal is the
target row. Also runs: the eager schema-reference closure, the timestamp-field inventory (every
timestamp field the lane validates, with the shared pm_event_datetime check that covers it), the
retained-read custody invariants (no receipt created, bytes unchanged, recipe only from the sealed
receipt), and the shared scalar-number corpus through five named append/retry/retained routes
(scripts/pm_w3d_bsd_numbers.py). Parser/API coverage is reported separately; this is not a claim
over every integer slot. Exit 0 only when everything agrees.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3d_bsd_events as m  # noqa: E402
import pm_w3d_bsd_spec as spec  # noqa: E402
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z  # noqa: E402

# Every timestamp field this lane validates, with the shared CV-1101 check and owner profile.
TIMESTAMP_FIELDS = [
    {'field': 'envelope.occurred_at_utc', 'check': 'pm_event_datetime.date_time', 'profile': 'event_record',
     'owner': 'CV-317/CV-1101 EventRecord', 'site': 'obs_envelope EN02_occurred_clock'},
    {'field': 'envelope.observed_at_utc', 'check': 'pm_event_datetime.date_time', 'profile': 'storage_utc_z',
     'owner': 'CV-253 Storage-assigned', 'site': 'obs_envelope EN03_observed_clock'},
    {'field': 'envelope.persisted_at_utc', 'check': 'pm_event_datetime.date_time', 'profile': 'storage_utc_z',
     'owner': 'CV-253 Storage-assigned', 'site': 'obs_envelope EN04_persisted_clock'},
    {'field': 'receipt.acknowledged_at_utc', 'check': 'pm_event_datetime.date_time', 'profile': 'event_record',
     'owner': 'CV-1101 EventRecord (AppendReceipt plain format: date-time); CV-253 binds only observed/persisted', 'site': 'obs_receipt RC16_ack_clock'},
    {'field': 'logical_source_body.created_at', 'check': 'pm_event_datetime.date_time', 'profile': 'event_record',
     'owner': 'existing logical BSD schema timestamp', 'site': 'obs_pack PK10_source_body_clocks'},
    {'field': 'logical_source_body.updated_at', 'check': 'pm_event_datetime.date_time', 'profile': 'event_record',
     'owner': 'existing logical BSD schema timestamp', 'site': 'obs_pack PK10_source_body_clocks'},
]


def retained_custody_invariants():
    """Across every family's retained read: no receipt created, bytes unchanged, recipe from the sealed receipt."""
    problems = []
    checks = 0
    for fam in spec.FAMILIES:
        W = m.build(fam)
        R = W['read']
        before_sealed = len(R['sealed'])
        before_bytes = R['stored'][R['original_ref']]['record']
        obs = m.obs_history(W)
        checks += 1
        if not obs['HI07_no_receipt_created']:
            problems.append((fam['event_type'], 'receipt created while reading'))
        if not obs['HI06_bytes_preserved']:
            problems.append((fam['event_type'], 'bytes altered while reading'))
        if len(R['sealed']) != before_sealed:
            problems.append((fam['event_type'], 'sealed receipt count changed'))
        if R['stored'][R['original_ref']]['record'] != before_bytes:
            problems.append((fam['event_type'], 'stored bytes changed'))
        if not m.dispatcher_agrees(W):
            problems.append((fam['event_type'], 'RetainedDispatcher disagrees with sealed-receipt selection'))
        # missing / ambiguous / wrong-original receipts stay unavailable or unsupported
        for label, muts in (('missing', {'read': m.setp('sealed', [])}),
                            ('ambiguous', {'read': lambda r, W: r['sealed'].append(dict(r['sealed'][0]))}),
                            ('wrong-original', {'read': m.setp('sealed', 0, 'binding', 'event_id', 'bsd-event@1:00')})):
            Wn = m.build(fam, muts)
            result = m.run_path('read', Wn)
            checks += 1
            if result is None:
                problems.append((fam['event_type'], f'{label} receipt accepted'))
    return dict(checks=checks, problems=problems)


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--json')
    parser.add_argument('--skip-numbers', action='store_true')
    parser.add_argument('--skip-inventory', action='store_true')
    args = parser.parse_args(argv)
    result = {}
    # complete checker
    result['checker'] = m.main(['--json', str(ROOT / 'reports/event-authority-20261105/W3D-checker.json')])
    result['timestamp_fields'] = TIMESTAMP_FIELDS
    result['retained_custody'] = retained_custody_invariants()
    if not args.skip_numbers:
        import pm_w3d_bsd_numbers as numbers
        number_path = ROOT / 'reports/event-authority-20261105/W3D-numbers-fix1.json'
        result['numbers'] = numbers.main(['--json', str(number_path)])
        number_result = json.loads(number_path.read_text())
        result['number_coverage'] = {k: number_result[k] for k in
            ('corpus_api', 'parser_api_only', 'complete_checker_routes', 'extra_large_integer_smoke')}
    if not args.skip_inventory:
        import subprocess
        proc = subprocess.run([sys.executable, '-B', str(ROOT / 'scripts/pm_event_datetime_inventory.py')],
                              capture_output=True, text=True)
        try:
            inv = json.loads(proc.stdout)
        except Exception:
            inv = {'status': 'unparseable', 'exit': proc.returncode}
        result['datetime_inventory'] = {'exit': proc.returncode, 'status': inv.get('status'),
                                        'failures': len(inv.get('failures', [])),
                                        'note': 'lead addendum 2: the whole-Plans gate fails closed on lane-tree hash drift; '
                                                'datetime_validator and the gate run at batch-3 integration. Recorded, not credited.'}
    ok = (result['checker'] == 0 and not result['retained_custody']['problems']
          and (args.skip_numbers or result.get('numbers') == 0))
    result['status'] = 'pass' if ok else 'fail'
    text = json.dumps(result, indent=1, sort_keys=True, default=str)
    if args.json:
        Path(args.json).write_text(text + '\n')
    print(text)
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())

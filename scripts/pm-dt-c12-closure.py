#!/usr/bin/env python3
"""Replay DT's C12 additions on the original checker; write explicit evidence.

The guard tool remains separate: pm-dt-guard-tables.py. This driver never
credits a refusal with a different expected code, and keeps INVALID separate.
"""
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_dt_c12_schema import fingerprint, nodes, occurrence_values, pointer, schema_witnesses

spec = importlib.util.spec_from_file_location('dt_c12', ROOT / 'scripts/pm-dt-event-contracts.py')
dt = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = dt
spec.loader.exec_module(dt)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--family', action='append')
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    def write(name, value):
        (args.out / name).write_text(json.dumps(value, indent=1, sort_keys=True, default=str) + '\n')
    inputs = dt.checker_inputs()
    if args.family:
        inputs['contracts'] = [c for c in inputs['contracts'] if c['event_type'] in args.family]
    failures, ledger, observations, inventory, usage_checks, source_checks = [], [], [], [], [], []
    counts = {}
    def check(ok, label):
        counts['checks'] = counts.get('checks', 0) + 1
        if not ok:
            failures.append(label)
    schema = schema_witnesses(dt, inputs, write)
    check(schema['invalid'] == 0, 'schema-boundary exact first refusals')
    check(schema['uncontrolled_rules'] == 0, 'every local covering schema has a validated control')
    original_read = dt.historical_read
    def observe(c, a, b, e, schemas, context):
        before = dt.retained_store_snapshot()
        trace, old = [], dt.RECORDER
        dt.RECORDER = trace
        try:
            result = original_read(c, a, b, e, schemas, context)
        finally:
            dt.RECORDER = old
        after = dt.retained_store_snapshot()
        observations.append(dict(family=c['event_type'], result=result['result'],
            before=before, after=after, identical=before == after,
            first_refusal=next(([phase, *r] for phase, _, r in trace if r is not None), None),
            external_effects=result['external_effects'], append_count=result['append_count']))
        return result
    dt.historical_read = observe
    for c in inputs['contracts']:
        name = c['event_type']; f = inputs['fixtures'][name]; slug = name.replace('.', '_')
        print('C12 ' + name, file=sys.stderr, flush=True)
        dt.retained_custody_checks(c, f, inputs['schemas'], check)
        source_checks.extend(dt.complete_source_schema_checks(c, f, inputs['schemas'], check))
        def usage_check(ok, label):
            usage_checks.append(dict(check=label, passed=bool(ok)))
            check(ok, label)
        dt.usage_first_save_checks(c, f, inputs['schemas'], usage_check)
        for case in f['semantic_negatives']:
            base, changed = dt.semantic_case(f, case)
            control = dt.source_valid(c, *base, inputs['schemas'])
            actual = dt.source_valid(c, *changed, inputs['schemas'])
            expected = case['expected']
            status = 'KILLED' if control == 'accepted' and actual == expected else 'INVALID'
            ledger.append(dict(family=name, case='semantic/' + case['case'], expected=expected, actual=actual,
                               control=control, status=status))
            check(status == 'KILLED', name + ': exact semantic ' + case['case'])
        for case in f.get('source_join_negatives', []):
            actual = dt.source_valid(c, case['prepared'], case['completed'], case['event'], inputs['schemas'])
            expected = case['expected']
            status = 'KILLED' if actual == expected else 'INVALID'
            ledger.append(dict(family=name, case='source_join/' + case['case'], expected=expected, actual=actual, status=status))
            check(status == 'KILLED', name + ': exact source join ' + case['case'])
        for case in f['checkpoint_cases']:
            actual = dt.checkpoint_result(c, case['previous'], case['proposed'], case['context'], inputs['schemas'][slug + '_checkpoint'])
            expected = case['expected']
            status = 'CONTROL' if expected == actual == 'published' else 'KILLED' if actual == expected else 'INVALID'
            ledger.append(dict(family=name, case='checkpoint/' + case['case'], expected=expected, actual=actual, status=status))
            check(status != 'INVALID', name + ': exact checkpoint ' + case['case'])
        # Full shared timestamp battery at the envelope writer boundary. Owner
        # occurrence times use EVENT_RECORD; Storage fields keep STORAGE_UTC_Z.
        battery = json.loads((ROOT / 'scripts/pm_event_datetime_timestamp_battery.json').read_text())['samples']
        for field, profile in [('occurred_at_utc', dt.EVENT_RECORD), ('observed_at_utc', dt.STORAGE_UTC_Z), ('persisted_at_utc', dt.STORAGE_UTC_Z)]:
            for sample in battery:
                value = sample['value']
                try:
                    dt.date_time(value, profile=profile)
                    expected = 'accepted'
                except dt.Refusal:
                    expected = 'schema_refused'
                event = dict(f['event_record'], **{field: value})
                if expected == 'accepted' and field == 'occurred_at_utc':
                    # The occurrence must agree with the independent source
                    # copies. Test its schema profile separately from that join.
                    actual = 'accepted' if dt.event_schema_errors(event) == 0 else 'schema_refused'
                    boundary = 'complete_EventRecord'
                else:
                    actual = dt.source_valid(c, f['prepared_source'], f['completed_source'], event, inputs['schemas'])
                    boundary = 'source_valid'
                check(actual == expected, name + ': shared timestamp battery ' + field + '/' + repr(value))
                ledger.append(dict(family=name, case='datetime/' + field + '/' + repr(value), boundary=boundary,
                    expected=expected, actual=actual, status='CONTROL' if expected == actual == 'accepted' else 'KILLED' if expected == actual else 'INVALID'))
        for role, owner, value, profile in occurrence_values(dt, c, f, inputs['schemas'], inputs['event_schema']):
            for path, instance, rule in nodes(dt.checkpoint_source_constraints(owner)):
                if rule.get('format') == 'date-time':
                    inventory.append(dict(family=name, role=role, schema_pointer=pointer(path + ('format',)),
                        instance_pointer=pointer(instance), profile=dt.STORAGE_UTC_Z if profile == 'event' and instance in [('observed_at_utc',), ('persisted_at_utc',)] else dt.EVENT_RECORD,
                        shared_call='EventRecordValidator' if profile == 'event' else 'lane_validator/DATE_TIME_FORMAT'))
        inventory.append(dict(family=name, role='sealed_first_receipt', instance_pointer='/acknowledged_at_utc',
            profile=dt.EVENT_RECORD, shared_call='exact_instant/date_time', predicate='hr_receipt/HR16_ack_date_time'))
    dt.historical_read = original_read
    write('mutation-ledger.json', dict(kills=[r for r in ledger if r['status']=='KILLED'],
          controls=[r for r in ledger if r['status']=='CONTROL'], invalid=[r for r in ledger if r['status']=='INVALID']))
    write('retained-store-observations.json', observations)
    write('datetime-inventory.json', inventory)
    write('usage-first-save-checks.json', usage_checks)
    write('complete-source-required-checks.json', dict(
        kills=[row for row in source_checks if row['control']=='accepted' and row['actual']==row['expected']],
        invalid=[row for row in source_checks if row['control']!='accepted' or row['actual']!=row['expected']]))
    sources = [*ROOT.glob('scripts/pm_dt*.py'), *ROOT.glob('scripts/pm-dt*.py'),
        ROOT/'scripts/pm_guard_isolation.py', ROOT/'scripts/pm_event_numbers.py', ROOT/'scripts/pm_event_datetime.py',
        ROOT/'Plans/dt_event_contracts.schema.json', ROOT/'Plans/dt_event_contracts.json',
        ROOT/'Plans/dt_event_contract_fixtures.json', ROOT/'Plans/event_record.schema.json', ROOT/'Plans/dt_checkpoint_source_constraints.json']
    sources.append(ROOT/'Plans/event_append_receipt_contracts.schema.json')
    write('source-pins.json', {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(sources)})
    result = dict(status='pass' if not failures else 'fail', families=len(inputs['contracts']), schema=schema,
        mutation_kills=sum(r['status']=='KILLED' for r in ledger), controls=sum(r['status']=='CONTROL' for r in ledger),
        invalid=sum(r['status']=='INVALID' for r in ledger), retained_reads=len(observations),
        store_changes=sum(not r['identical'] for r in observations), checks=counts['checks'], failures=failures,
        native_execution='NOT_RUN', admission='ABSENT', boundary='Static original-owner/SP-278 adapters; no native execution or runtime authentication claim')
    write('closure-summary.json', result)
    print(json.dumps(result, indent=1))
    return int(bool(failures))


if __name__ == '__main__':
    raise SystemExit(main())

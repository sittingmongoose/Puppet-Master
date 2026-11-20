#!/usr/bin/env python3
"""Complete-call checker tests for the Goal Update and Goal started coverage tables."""

import argparse
import gzip
import json
from pathlib import Path

import pm_goal_dg5_boundaries as bridge
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables
import pm_goal_dg_u_oracles as updated

ROOT = Path(__file__).resolve().parents[1]
FAMILY = 'goal.updated'
OWNERS = 'scripts/pm_goal_dg_u_owners.py'
STORAGE = 'scripts/pm_goal_test_storage.py'
ADAPTERS = 'scripts/pm_goal_test_owner_adapters.py'
PHASE = 'pm_goal_dg5_methodb_pilot_phase_'


def require(condition, detail):
    if not condition:
        raise ValueError(detail)


def write(path, value):
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + '\n')


def reinstall(directory, negative):
    world = updated.world(directory)
    if not negative:
        world.installation.withdraw()
    return world, world.installation.reinstall, (), {}


def reservation_retry(directory, negative):
    world, goal = updated._goal(directory)
    first = updated.O.direct_request(world, goal, 'first')
    second = updated.O.direct_request(world, goal, 'second')
    first_admission, _ = world.command.admit_and_capture(first)
    second_admission, _ = world.command.admit_and_capture(second)
    world.command.reserve(first_admission)
    scope = goal['scope']
    current = world.body.read_private(scope, 'stage7')
    pending = current['control']['pending']
    if negative:
        source = world.source.read_source(scope, updated.op_of(second_admission), 'stage7')
        pending = world.command._pending(second_admission, source, current, 'stage7')
    return world, world.body.reserve, (scope, pending, lambda control: []), {}


# The explicit lines match the input matrix. Validate the observed location on every run.
CASES = {
    'reservation-retry': (OWNERS, 1173, 'dgu/body/reserve/conflicting_reservation', reservation_retry),
    'reinstall': (OWNERS, 493, 'dgu/installation/not_withdrawn', reinstall),
}


def call(fixture, label, collector, *, valid=None, target=None, cut=()):
    world, method, args, kwargs = fixture
    action = lambda: method(*args, **kwargs)
    saved = tables.COLLECTOR, tables.CUT, tables.NO_CACHE
    tables.COLLECTOR, tables.CUT, tables.NO_CACHE = collector, frozenset(cut), True
    try:
        result, code = bridge.invoke(
            label, FAMILY, action, world.root, world=world,
            arguments=dict(receiver=getattr(method, '__self__', None), args=args, kwargs=kwargs),
            original=getattr(method, '__func__', method), valid=valid, target=target,
        )
    finally:
        tables.COLLECTOR, tables.CUT, tables.NO_CACHE = saved
    require(not collector.failures, collector.failures)
    record = collector.ledger[-1]
    return dict(result, code=code, input_sha256=record['input_sha256'], failing=record['failing'])


def save_proof(output, collector, row, site, table_report, table_path):
    proof = output / 'proof'
    summary = proof / 'tables'
    write(summary / 'summary.json', [table_report])
    write(summary / 'rows.json', [dict(guard=row, table=table_report['table'],
                                      status='PASS', table_status='PASS')])
    write(proof / 'family-rows.json', {FAMILY: [row]})
    write(proof / 'collection.json', dict(calls=collector.calls, failures=collector.failures,
                                        rows={row: {'sites': [site]}}))
    paths = [Path(m.__file__) for m in (bridge, sweep, tables, updated)]
    paths += [ROOT / site[0], table_path, Path(__file__),
              ROOT / 'scripts/pm_guard_isolation.py']
    write(proof / 'source-bindings.json',
          {'files': {str(p.relative_to(ROOT)): bridge._file_sha(p) for p in sorted(set(paths))}})
    for name, value in (('ledger', collector.ledger),
                        ('signatures', [sorted(s) for s in collector.signature_list])):
        with gzip.open(proof / (name + '.json.gz'), 'wt') as stream:
            json.dump(value, stream, sort_keys=True)


def run(name, output, *, leave_enabled=False):
    source, line, expected, make = CASES[name]
    row = bridge.site_name(source, line)
    site = (source, line)
    output.mkdir(parents=True)
    tables.DISCOVERY = True
    collector = sweep.Collector()
    label = FAMILY + '/stage7/' + name
    control = call(make(output / 'valid', False), label + '/valid', collector, valid=True)
    fixture = make(output / 'invalid', True)
    negative_label = label + '/invalid'
    negative = call(fixture, negative_label, collector, valid=False, target=row)
    disabled = call(fixture, negative_label, sweep.Collector(judge=False),
                    cut=() if leave_enabled else (row,))
    restored = call(fixture, negative_label, sweep.Collector(judge=False))
    result = dict(row=row, location=site, expected=expected, control=control,
                  negative=negative, disabled=disabled, restored=restored)
    write(output / 'calls.json', result)
    require(control['errors'] == [] and control['code'] is None and
            collector.rows.get(row, {}).get('controls'), f'{row}: accepted call missed the checker')
    require(collector.rows[row]['sites'] == {site}, f'{row}: checker location changed')
    require(negative['errors'] == restored['errors'] == [row] and
            negative['code'] == restored['code'] == expected, f'{row}: exact refusal did not repeat')
    require(negative['input_sha256'] == disabled['input_sha256'] == restored['input_sha256'],
            f'{row}: refused input changed between calls')
    require(disabled['errors'] == [] and disabled['code'] is None,
            f'{row}: disabling only the checker did not allow the input')
    require(collector.ledger[-1]['kill'] == 'KILLED', f'{row}: stock replay did not pass')

    ident = sweep.table_id([row])
    table_path = ROOT / 'scripts' / (PHASE + ident + '.py')
    summary = output / 'proof' / 'tables'
    summary.mkdir(parents=True)
    report = sweep.prove_table(collector, ident, [row], sweep.table_records(collector),
                               summary, module_name=table_path.stem)
    require(report['status'] == 'PASS' and report['proved'] == [row], report)
    save_proof(output, collector, row, site, report, table_path)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('case', choices=CASES)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--leave-enabled', action='store_true')
    args = parser.parse_args()
    run(args.case, args.out.resolve(), leave_enabled=args.leave_enabled)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Exercise the certified timestamp rule on the original coordinator examples."""
import argparse
import copy
import json
from pathlib import Path

from jsonschema import FormatChecker

from pm_goal_dg_cf2_oracles import Run
from pm_goal_dg_cf2_world import COORD, Refusal


def check(out, disable_fix):
    run = Run(out / 'fixture')
    prepared = run.w.coordinator.prepare(run.ctx)
    bank = run.w.realm
    if disable_fix:
        checker = FormatChecker()
        checker.checkers = {name: check for name, check in bank.scoped.format_checker.checkers.items()
                            if name != 'date-time'}
        bank.scoped.format_checker = checker

    records = []
    for name, accepted, path in (
        ('Intent', prepared['intent'], ['original_occurred_at_utc']),
        ('Prepared', prepared, ['intent', 'original_occurred_at_utc']),
    ):
        uri = COORD + name
        code = 'certified-format/' + name
        for value in (None, '2026-11-20T12:00:00.123456789+00:00',
                      '2026-02-30T12:00:00Z', 'not-a-timestamp'):
            doc = copy.deepcopy(accepted)
            if value is not None:
                field = doc
                for key in path[:-1]:
                    field = field[key]
                field[path[-1]] = value
            errors = bank.errors('coordinator', uri, doc)
            actual = [{'path': list(error.path), 'keyword': error.validator, 'message': error.message,
                       'cause': getattr(error.cause, 'reason', None)} for error in errors]
            record = dict(root=uri, input=doc, messages=actual)
            records.append(record)
            (out / 'cases.json').write_text(json.dumps(records, indent=2, sort_keys=True) + '\n')
            if value in (None, '2026-11-20T12:00:00.123456789+00:00'):
                assert not errors, record
                assert bank.validate('coordinator', uri, doc, code) == doc
                continue
            expected = [{'path': path, 'keyword': 'format', 'message': f"{value!r} is not a 'date-time'",
                         'cause': 'date_time_day' if value.startswith('2026-') else 'date_time_syntax'}]
            assert actual == expected, f'Expected {expected!r}, got {actual!r}'
            try:
                bank.validate('coordinator', uri, doc, code)
            except Refusal as error:
                assert error.code == code + '/schema/' + '/'.join(path), error.code
            else:
                raise AssertionError('The original coordinator accepted the malformed timestamp')
    print(f'{len(records)} timestamp examples passed')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--disable-fix', action='store_true')
    args = parser.parse_args()
    args.out.mkdir(parents=True)
    check(args.out, args.disable_fix)


if __name__ == '__main__':
    main()

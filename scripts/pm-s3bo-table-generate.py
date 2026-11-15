#!/usr/bin/env python3
"""Generate the real s3bo comparison tables, max eight rows per module.

Only the predicates decide refusal. Their inputs are independent raw operands
projected by the complete checker, or a shared validator's returned diagnostics.
This script is not part of the gated tool and does not edit it.
"""
from pathlib import Path
import pm_s3bo_oracles as w

EXPRESSIONS = {
    'equal': "record['left'] != record['right']",
    'not_equal': "record['left'] == record['right']",
    'error': "bool(record['left'])",
    'empty': "record['left'] != []",
    'before': "record['left'] >= record['right']",
    'less': "record['left'] >= record['right']",
    'less_equal': "record['left'] > record['right']",
    'greater': "record['left'] <= record['right']",
    'contains': "record['left'] not in record['right']",
    'not_contains': "record['left'] in record['right']",
}


def code_for(row):
    return w.code_for(row)


def generate():
    for name in w.table_names():
        rows = w.table_rows(name)
        text = ['"""S3bo real predicates, projected from the complete checker; ATS-2206."""',
                'import pm_guard_isolation as g', '']
        for row, _group, kind, invariant in rows:
            code = code_for(row)
            text += [f'def {row}(value, context):', f'    record = value[{row!r}]',
                     "    if record['applies'] is not True:", '        return None',
                     f'    if {EXPRESSIONS[kind]}:', f'        return {code!r}', '    return None', '']
        text += ['def case(value):', '    context = None', '    table = g.GuardTable([']
        for row, _group, kind, invariant in rows:
            code = code_for(row)
            text += [f'        g.Guard({row!r}, g.Invariant({"/"+row!r}, {invariant!r}), {code!r}, {row}),']
        text += ['    ])', '', '    def check(value):']
        for row, *_ in rows:
            text += [f'        table.require({row!r}, value, context)']
        text += ['        return True', '    return g.Case(table, check, context)', '']
        (Path(__file__).parent / ('pm_s3bo_table_' + name + '.py')).write_text('\n'.join(text))


if __name__ == '__main__':
    generate()

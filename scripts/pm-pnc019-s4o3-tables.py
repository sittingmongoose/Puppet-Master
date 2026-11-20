"""Generate the actual S4 reference-store predicates; no verdict adapters."""
import argparse
import json
from pathlib import Path
from pm_pnc019_s4o3_store import TABLES

ROOT = Path(__file__).resolve().parents[1]


def render(table, rows):
    lines = ['"""S4 reference-store ' + table + ' predicates (generated)."""',
             'import pm_guard_isolation as g', '']
    for name, reason, condition in rows:
        lines += ['', 'def ' + name + '(v, context):', '    if ' + condition + ':',
                  '        return ' + repr(reason), '    return None', '']
    lines += ['', 'def case(value):', '    context = None', '    table = g.GuardTable([']
    for name, reason, _condition in rows:
        lines.append('        g.Guard(' + repr(name) + ', g.Invariant(' + repr('/' + name) + ', ' +
                     repr('actual reference-store ' + name + ' invariant') + '), ' + repr(reason) + ', ' + name + '),')
    lines += ['    ])', '', '    def check(value):']
    for name, _reason, _condition in rows:
        lines.append('        table.require(' + repr(name) + ', value, context)')
    lines += ['        return True', '    return g.Case(table, check, context)', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    stale = []
    for table, rows in TABLES.items():
        assert len(rows) <= 8
        path = ROOT / 'scripts' / ('pm_pnc019_s4o3_table_' + table + '.py')
        wanted = render(table, rows)
        if not path.exists() or path.read_text() != wanted:
            stale.append(path.name)
            if not args.check:
                path.write_text(wanted)
    print(json.dumps({'tables': len(TABLES), 'stale': stale, 'check': args.check}))
    return int(args.check and bool(stale))


if __name__ == '__main__':
    raise SystemExit(main())

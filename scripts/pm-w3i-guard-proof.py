#!/usr/bin/env python3
"""Run the gated guard tool (Method B, scripts/pm_guard_isolation.py at 004bdedd63) over every W3I guard table.

  collect --out DIR      evaluate every control and single-defect negative through the complete checker
                         (pm_w3i_continuity_oracles.evaluate, which refuses only through the table predicates), project
                         each case into every table of its boundary, check the lane matrix, and write the suites
  matrix                 the lane matrix only: every table predicate on every collected case (no tool run)
  run --out DIR          one tool run per table, each in its own process, serial, behind the tool's MemoryGate;
                         credit is copied from the tool's own report rows, this driver adds none
  run-table NAME --out DIR

A table's controls are the projections of cases with no refusal in that table (the boundary's valid controls
first); its negatives are the projections of the cases whose single refusal is a row of that table. Entailed rows
(pm_w3i_continuity_oracles.ENTAILED) get no negative and stay unproved with their written proof.
Exit 0 only when every run table PASSes, the lane matrix has no problem, and every row is proved or entailed.
"""
import argparse
import gzip
import hashlib
import json
import pickle
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3i_continuity_oracles as W  # noqa: E402

TOOL_BOUNDARY = {'append': 'append', 'retry': 'retry', 'retained': 'retained_history', 'derived': 'synthetic',
                 'withdrawal': 'synthetic'}
RETURN_SOURCE = 'return g.Case(table, check, context)'


def _key(value):
    return hashlib.sha256(pickle.dumps(value, protocol=4)).hexdigest()


def collect(negative_limit, control_limit):
    controls = W.build_controls()
    negatives = W.build_negatives(controls)
    slots = {t: {'controls': {}, 'negatives': {}, 'all_negatives': 0} for t in W.TABLES}
    findings = []
    ordered = [(cid, case, W.case_boundary(cid), None) for cid, case in controls]
    # Interleave families so each row's first witnesses come from different families.
    by_family = {}
    for index, n in enumerate(negatives):
        by_family.setdefault(n['family'], []).append((index, n))
    width = max(len(v) for v in by_family.values())
    for position in range(width):
        for family in W.FAMILIES:
            if position < len(by_family[family]):
                index, n = by_family[family][position]
                ordered.append(('negative/%d' % index, n['case'], n['boundary'], n))
    for cid, case, boundary, n in ordered:
        refusals, values = W.evaluate(case, boundary)
        if n is None and refusals:
            findings.append({'control': cid, 'refusals': refusals})
        if n is not None and refusals != [(n['row'], W.ROW_BY_ID[n['row']]['code'])]:
            findings.append({'negative': cid, 'row': n['row'], 'refusals': refusals})
        refusing_tables = {W.ROW_TABLE[r] for r, _c in refusals}
        for table, value in values.items():
            slot = slots[table]
            key = _key(value)
            if table not in refusing_tables:
                if key not in slot['controls'] and (n is None or len(slot['controls']) < control_limit):
                    slot['controls'][key] = {'id': 'control/%s/%s' % (table, cid), 'value': value,
                                             'boundary': TOOL_BOUNDARY[boundary], 'source': cid}
            elif n is not None and refusals and W.ROW_TABLE[refusals[0][0]] == table:
                slot['all_negatives'] += 1
                same_target = sum(1 for e in slot['negatives'].values() if e['target'] == n['row'])
                if key not in slot['negatives'] and same_target < negative_limit:
                    slot['negatives'][key] = {'id': 'negative/%s/%s' % (table, cid), 'value': value,
                                              'target': n['row'], 'code': W.ROW_BY_ID[n['row']]['code'],
                                              'source': cid, 'defect': n['defect'], 'family': n['family']}
    for table, slot in slots.items():
        # Keep the boundary's real controls first, then fill from negatives that pass this table.
        real = [c for c in slot['controls'].values() if not c['source'].startswith('negative/')]
        other = [c for c in slot['controls'].values() if c['source'].startswith('negative/')]
        slot['controls'] = (real + other)[:control_limit]
        slot['negatives'] = list(slot['negatives'].values())
    return slots, findings, len(controls), len(negatives)


def table_rows(table):
    module = W.table_module(table)
    case = module.case(None)
    return [(name, guard.predicate) for name, guard in case.table.guards.items()]


def lane_matrix(table, slot):
    rows = table_rows(table)
    problems = []
    for c in slot['controls']:
        failing = [name for name, predicate in rows if predicate(c['value'], None) is not None]
        if failing:
            problems.append({'case': c['id'], 'kind': 'control_refused', 'rows': failing})
    for n in slot['negatives']:
        failing = [name for name, predicate in rows if predicate(n['value'], None) is not None]
        if failing != [n['target']]:
            problems.append({'case': n['id'], 'kind': 'not_single_row', 'target': n['target'], 'rows': failing})
    return problems


def command_collect(args):
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    slots, findings, n_controls, n_negatives = collect(args.negative_limit, args.control_limit)
    tables = []
    for table in W.TABLES:
        slot = slots[table]
        rows = [r['id'] for r in W.TABLE_ROWS[table]]
        targets = sorted({n['target'] for n in slot['negatives']})
        tables.append({'table': table, 'boundary': W.TABLE_ROWS[table][0]['boundary'], 'rows': rows,
                       'controls': len(slot['controls']), 'negatives': len(slot['negatives']),
                       'negatives_collected': slot['all_negatives'], 'targets': targets,
                       'rows_without_negative': [r for r in rows if r not in targets],
                       'lane_matrix': lane_matrix(table, slot)})
    with open(out / 'collected.pkl', 'wb') as handle:
        pickle.dump(slots, handle, protocol=4)
    summary = {'controls': n_controls, 'negatives': n_negatives, 'findings': findings[:50],
               'negative_limit': args.negative_limit, 'control_limit': args.control_limit,
               'seconds': round(time.monotonic() - started, 1), 'tables': tables}
    (out / 'collect-summary.json').write_text(json.dumps(summary, indent=1, default=str) + '\n')
    bad = bool(findings) or any(t['lane_matrix'] for t in tables) or any(
        r not in W.ENTAILED for t in tables for r in t['rows_without_negative'])
    print(json.dumps({'tables': len(tables), 'controls': n_controls, 'negatives': n_negatives,
                      'findings': len(findings), 'matrix_problems': sum(len(t['lane_matrix']) for t in tables),
                      'rows_without_negative': sorted(r for t in tables for r in t['rows_without_negative']),
                      'status': 'fail' if bad else 'pass'}))
    return 1 if bad else 0


def command_matrix(args):
    slots, findings, _c, _n = collect(args.negative_limit, args.control_limit)
    problems = {t: lane_matrix(t, slots[t]) for t in W.TABLES}
    problems = {t: p for t, p in problems.items() if p}
    missing = sorted(r['id'] for t in W.TABLES for r in W.TABLE_ROWS[t]
                     if r['id'] not in W.ENTAILED and not any(n['target'] == r['id'] for n in slots[t]['negatives']))
    status = 'pass' if not (findings or problems or missing) else 'fail'
    print(json.dumps({'status': status, 'findings': findings[:20], 'problems': problems, 'missing': missing},
                     default=str)[:4000])
    return 0 if status == 'pass' else 1


def run_table(table, out):
    import pm_guard_isolation as g
    with open(out / 'collected.pkl', 'rb') as handle:
        slot = pickle.load(handle)[table]
    module_name = W.TABLE_PREFIX + table
    path = 'scripts/%s.py' % module_name
    factory = W.table_module(table).case
    controls = [g.Control(c['id'], c['value'], c['boundary']) for c in slot['controls']]
    first = controls[0].id
    negatives = [g.Negative(n['id'], n['value'], n['target'], n['code'], first,
                            'complete-checker projection of ' + n['source'] + ' (' + n['defect'] + '), whose single '
                            'refusal is this row') for n in slot['negatives']]
    suite = g.Suite('W3I ' + table, factory, controls, negatives, (path,), ROOT,
                    non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                           'Construct the fresh execution Case; this return makes no acceptance or '
                                           'refusal decision.')])
    stops = [e for e in g.prescan_sources(ROOT / path) if e['kind'] in g.STATIC_STOP_KINDS]
    started = time.monotonic()
    report = g.run(suite, memory=g.MemoryGate(1800, 10, 12, 30, 2700)) if not stops else g.prescan_report(stops)
    seconds = round(time.monotonic() - started, 1)
    name = table + '.json.gz'
    with gzip.open(out / name, 'wt') as handle:
        handle.write(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    rows_report = report.get('rows', [])
    entry = {'table': table, 'tool_status': report['status'], 'seconds': seconds,
             'evaluations': report.get('evaluations'), 'tool_controls': len(controls),
             'tool_negatives': len(negatives),
             'proved': sorted(r['id'] for r in rows_report if r.get('proved')),
             'unproved': sorted(report.get('unproved_guards', [])),
             'failure_kinds': sorted({f['kind'] for f in report.get('failures', [])}),
             'own_flips': sum(len(r.get('flips', [])) for r in rows_report),
             'stays': sum(len(r.get('stays', [])) for r in rows_report),
             'masked': report.get('masked_negatives', []),
             'static_files': (report.get('static') or {}).get('files'),
             'source_sha256': hashlib.sha256((ROOT / path).read_bytes()).hexdigest(),
             'report': name, 'report_sha256': hashlib.sha256((out / name).read_bytes()).hexdigest()}
    (out / (table + '.summary.json')).write_text(json.dumps(entry, indent=1, default=str) + '\n')
    print('%s %s proved %d/%d N=%d C=%d %ss' % (table, entry['tool_status'], len(entry['proved']),
                                               len(W.TABLE_ROWS[table]), len(negatives), len(controls), seconds),
          flush=True)
    return 0 if report['status'] == 'PASS' else 1


def command_run_table(args):
    return run_table(args.name, Path(args.out))


def command_run(args):
    out = Path(args.out)
    tool = ROOT / 'scripts/pm_guard_isolation.py'
    status = 0
    for table in W.TABLES:
        if args.table and table not in args.table:
            continue
        if table in W.ENTAILED_TABLES:
            continue
        if args.resume and (out / (table + '.summary.json')).exists():
            continue
        code = subprocess.call([sys.executable, '-B', __file__, 'run-table', table, '--out', str(out)])
        status = status or code
    collected = json.loads((out / 'collect-summary.json').read_text())
    tables = []
    for entry in collected['tables']:
        summary_path = out / (entry['table'] + '.summary.json')
        tool_entry = json.loads(summary_path.read_text()) if summary_path.exists() else None
        tables.append(dict(entry, tool=tool_entry))
    rows = sum(len(t['rows']) for t in tables)
    proved = sorted(r for t in tables if t['tool'] for r in t['tool']['proved'])
    unproved = sorted(r for t in tables for r in t['rows'] if r not in proved)
    summary = {'tool_sha256': hashlib.sha256(tool.read_bytes()).hexdigest(), 'rows': rows, 'tables': len(tables),
               'proved': len(proved), 'unproved': unproved,
               'unproved_with_proof': {r: W.ENTAILED[r] for r in unproved if r in W.ENTAILED},
               'unproved_without_proof': [r for r in unproved if r not in W.ENTAILED],
               'tables_pass': sum(1 for t in tables if t['tool'] and t['tool']['tool_status'] == 'PASS'),
               'tables_run': sum(1 for t in tables if t['tool']),
               'masked': sorted(m for t in tables if t['tool'] for m in t['tool']['masked']),
               'detail': tables}
    (out / 'summary.json').write_text(json.dumps(summary, indent=1, default=str) + '\n')
    print(json.dumps({k: v for k, v in summary.items() if k != 'detail'}, default=str))
    bad = status or summary['unproved_without_proof'] or summary['tables_pass'] != summary['tables_run']
    return 1 if bad else 0


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)
    for name, fn in (('collect', command_collect), ('matrix', command_matrix)):
        p = sub.add_parser(name)
        if name == 'collect':
            p.add_argument('--out', required=True)
        p.add_argument('--negative-limit', type=int, default=4)
        p.add_argument('--control-limit', type=int, default=6)
        p.set_defaults(run=fn)
    p = sub.add_parser('run')
    p.add_argument('--out', required=True)
    p.add_argument('--table', action='append')
    p.add_argument('--resume', action='store_true')
    p.set_defaults(run=command_run)
    p = sub.add_parser('run-table')
    p.add_argument('name')
    p.add_argument('--out', required=True)
    p.set_defaults(run=command_run_table)
    args = parser.parse_args(argv)
    return args.run(args)


if __name__ == '__main__':
    sys.exit(main())

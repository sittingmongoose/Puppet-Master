"""Gated Method B isolation and refusal-specific mutation proof for S4.

Projection suites contain the actual raw arguments observed at Store.require.
Only the gated tool's own proved rows count. Mutation kills require the exact
negative's expected refusal to disappear; unrelated exceptions count INVALID.
"""
import argparse
import copy
import gzip
import hashlib
import importlib
import json
from pathlib import Path

import pm_guard_isolation as g
import pm_pnc019_s4o3_oracles as w
from pm_pnc019_s4o3_store import TABLES

ROOT = Path(__file__).resolve().parents[1]


def collect():
    trace = []
    rows = w.run(trace=trace)
    slots = {name: {'controls': [], 'negatives': []} for name in TABLES}
    seen = set()
    for table, value, refusals in trace:
        key = table + ':' + json.dumps(value, sort_keys=True)
        if key in seen:
            continue
        seen.add(key)
        if not refusals:
            if len(slots[table]['controls']) < 3:
                slots[table]['controls'].append(value)
        else:
            assert len(refusals) == 1, (table, refusals)
            name, reason = refusals[0]
            if sum(n['row'] == name for n in slots[table]['negatives']) < 3:
                slots[table]['negatives'].append({'row': name, 'code': reason, 'value': value})
    return rows, slots


def isolation(out, selected=None, resume=False):
    rows, slots = collect()
    reports = []
    for table, slot in slots.items():
        if selected and table != selected:
            continue
        module = 'pm_pnc019_s4o3_table_' + table
        path = 'scripts/' + module + '.py'
        controls = [g.Control('control/' + str(i), value, 'synthetic')
                    for i, value in enumerate(slot['controls'])]
        negatives = [g.Negative('negative/' + str(i), n['value'], n['row'], n['code'], controls[0].id,
                                'One-defect raw store/request input recorded by the complete stateful checker.')
                     for i, n in enumerate(slot['negatives'])]
        suite = g.Suite('PNC019 s4o3 ' + table, importlib.import_module(module).case,
                        controls, negatives, (path,), ROOT,
                        non_guards=[g.NonGuard(path, 'case', 'return', 'return g.Case(table, check, context)',
                            'Construct a fresh execution Case; this return decides no invariant.')])
        report = None
        reused = False
        if resume and (out / (table + '.summary.json')).exists():
            try:
                prior = json.loads((out / (table + '.summary.json')).read_text())
                cached = json.load(gzip.open(out / (table + '.json.gz'), 'rt'))
                source_sha = hashlib.sha256((ROOT / path).read_bytes()).hexdigest()
                same_controls = [(c['id'], c['sha256']) for c in cached['controls']] == [
                    (c.id, g.digest(c.value)) for c in controls]
                same_negatives = [(n['id'], n['target'], n['code'], n['control'], n['sha256'])
                                  for n in cached['negatives']] == [
                    (n.id, n.target, n.code, n.control, g.digest(n.value)) for n in negatives]
                if (prior['status'] == 'PASS' and prior['source_sha256'] == source_sha and
                    cached['tool_sha256'] == hashlib.sha256((ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest() and
                    same_controls and same_negatives):
                    report, reused = cached, True
            except (OSError, ValueError, KeyError, EOFError):
                pass
        if report is None:
            # The lane requires 12 GiB, including on resume. No extra 1 GiB
            # hysteresis is required by the run contract.
            report = g.run(suite, memory=g.MemoryGate(1800, 12, 12, 30, 2700))
            with gzip.open(out / (table + '.json.gz'), 'wt') as handle:
                json.dump(report, handle, sort_keys=True, default=str)
        summary = {'table': table, 'status': report['status'],
                   'reused_identical_source_and_cases': reused,
                   'proved': [r['id'] for r in report.get('rows', []) if r.get('proved')],
                   'unproved': report.get('unproved_guards', []),
                   'masked': report.get('masked_negatives', []),
                   'failures': report.get('failures', []),
                   'static_files': report.get('static', {}).get('files'),
                   'source_sha256': hashlib.sha256((ROOT / path).read_bytes()).hexdigest()}
        (out / (table + '.summary.json')).write_text(json.dumps(summary, indent=2, default=str) + '\n')
        reports.append(summary)
        print(table, report['status'], len(summary['proved']), flush=True)
    result = {'status': 'pass' if all(r['status'] == 'PASS' for r in reports) else 'fail',
              'tool_sha256': hashlib.sha256((ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest(),
              'families': len({r['family'] for r in rows}), 'scenarios': len(rows),
              'proved': sum(len(r['proved']) for r in reports), 'tables': reports}
    (out / 'guard-summary.json').write_text(json.dumps(result, indent=2, default=str) + '\n')
    return result


def mutations(out):
    # Baseline must pass before any mutation. Work runs in memory; source and
    # generated tables are restored in finally, including on exceptions.
    baseline = w.run()
    result = []
    for table, definitions in TABLES.items():
        module = importlib.import_module('pm_pnc019_s4o3_table_' + table)
        for name, reason, _condition in definitions:
            original = getattr(module, name)
            setattr(module, name, lambda value, context: None)
            # One declared representative runs the entire stateful family
            # scenario. The baseline and table-isolation corpus cover all 41
            # scenarios; a mutation is not credited against unrun families.
            if table.startswith('extra_'):
                from pm_pnc019_s4o3_domain_cases import RULES
                family = next(f for f, short, _p, _v, _d in RULES
                              if name == 'extra_' + short or name.startswith('extra_' + short + '_number_'))
                lane = 'W3E'
            elif table in ('destination', 'expiry', 'connection', 'restore_chain'):
                family = {'destination': 'backup.destination_changed', 'expiry': 'server.discovery_expired',
                          'connection': 'server.connection_state_changed', 'restore_chain': 'restore.state_changed'}[table]
                lane = 'W3E'
            elif table == 'result_0' or name == 'read_shape':
                lane, family = 'W3E', 'backup.destination_changed'
            else:
                lane, family = 'W3D', 'bsd.advice_emitted'
            try:
                try:
                    w.run_family(w.Adapter(lane), family)
                except AssertionError as error:
                    details = error.args[0] if error.args else None
                    killed = (isinstance(details, tuple) and len(details) == 4 and
                              details[:3] == ('expected_refusal_missing', name, reason) and details[3] is None)
                    state = 'killed' if killed else 'INVALID'
                    detail = repr(details)
                except Exception as error:
                    state, detail = 'INVALID', repr(error)
                else:
                    state, detail = 'survived', None
            finally:
                setattr(module, name, original)
            result.append({'row': name, 'code': reason, 'status': state, 'detail': detail,
                           'lane': lane, 'family': family})
            print(name, state, flush=True)
    summary = {'baseline_families': len({r['family'] for r in baseline}), 'baseline_scenarios': len(baseline),
               'mutations': result,
               'killed': sum(r['status'] == 'killed' for r in result),
               'invalid': sum(r['status'] == 'INVALID' for r in result),
               'survived': sum(r['status'] == 'survived' for r in result)}
    # This deliberate diagnostic is not an unsafe-acceptance mutant: removing
    # source availability makes the owner lookup raise KeyError. It must remain
    # INVALID, demonstrating that a nonzero exit is never credited as a kill.
    diagnostic = [r for r in result if r['row'] == 'read_hold']
    shape = [r for r in result if r['row'] == 'read_shape']
    summary['expected_invalid_diagnostics'] = ['read_hold', 'read_shape']
    summary['status'] = 'pass' if (len(diagnostic) == 1 and diagnostic[0]['status'] == 'INVALID' and
        diagnostic[0]['detail'] == "KeyError('original:missing')" and
        len(shape) == 1 and shape[0]['status'] == 'INVALID' and
        'NoneType' in shape[0]['detail'] and
        all(r['status'] == 'killed' for r in result if r['row'] not in ('read_hold', 'read_shape'))) else 'fail'
    (out / 'mutations.json').write_text(json.dumps(summary, indent=2) + '\n')
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['isolation', 'mutations'])
    parser.add_argument('--out', required=True)
    parser.add_argument('--table')
    parser.add_argument('--resume', action='store_true')
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    result = isolation(out, args.table, args.resume) if args.command == 'isolation' else mutations(out)
    return int(result['status'] != 'pass')


if __name__ == '__main__':
    raise SystemExit(main())

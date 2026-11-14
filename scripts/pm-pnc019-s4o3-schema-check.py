"""Inventory and exercise separate W3I schema-field/keyword guards."""
import argparse
import hashlib
import json
import gzip
import importlib
from pathlib import Path

import pm_pnc019_s4o3_schema as s


def generate(check=False):
    stale = []
    for table, ids in s.TABLES.items():
        lines = ['"""W3I schema guard table ' + table + ' (generated).']
        for sid in ids:
            site = s.BY_ID[sid]
            lines.append(sid + ': Plans/continuity_event_contracts.schema.json#' + s.SUBJECTS[site['subject']] +
                         '/' + '/'.join(map(str, site['schema_path'])))
            if sid in s.IMPLIED:
                lines.append('Entailed after ' + s.IMPLIED[sid]['earlier'] + ': ' + s.IMPLIED[sid]['proof'])
        lines += ['"""', 'import pm_guard_isolation as g', '']
        for sid in ids:
            lines += ['', 'def ' + sid + '(value, context):']
            if sid in s.IMPLIED:
                lines += ['    if value[' + repr(s.IMPLIED[sid]['earlier']) + '] != []:', '        return None']
            lines += ['    if value[' + repr(sid) + '] != []:', "        return 'schema_invalid'", '    return None', '']
        lines += ['', 'def case(value):', '    context = None', '    table = g.GuardTable([']
        for sid in ids:
            site = s.BY_ID[sid]
            field = '/' + site['subject'] + '/' + '/'.join(map(str, site['instance_path']))
            words = site['keyword'] + ' at owner schema /' + '/'.join(map(str, site['schema_path']))
            lines.append('        g.Guard(' + repr(sid) + ', g.Invariant(' + repr(field) + ', ' + repr(words) +
                         "), 'schema_invalid', " + sid + '),')
        lines += ['    ])', '', '    def check(value):']
        for sid in ids:
            lines.append('        table.require(' + repr(sid) + ', value, context)')
        lines += ['        return True', '    return g.Case(table, check, context)', '']
        path = s.ROOT / 'scripts' / ('pm_pnc019_s4o3_schema_' + table + '.py')
        wanted = '\n'.join(lines)
        if not path.exists() or path.read_text() != wanted:
            stale.append(path.name)
            if not check:
                path.write_text(wanted)
    return stale


def replay(blob):
    for cid, subject, value in blob['controls']:
        refused = s.require(subject, value)
        if refused:
            raise AssertionError(('schema_control_refused', cid, refused))
    for sid, witness in blob['witnesses'].items():
        refused = s.require(witness['subject'], witness['value'])
        if refused != [(sid, 'schema_invalid')]:
            raise AssertionError(('schema_refusal_mismatch', sid, refused))


def proof(out, blob):
    import pm_guard_isolation as g
    replay(blob)
    results = []
    for table, ids in s.TABLES.items():
        if table.startswith('entailed_'):
            continue
        subject = s.TABLE_SUBJECT[table]
        valid = next(v for _cid, sub, v in blob['controls'] if sub == subject)
        projected = s.projected(subject, valid)
        controls = [g.Control('control', {sid: projected[sid] for sid in ids}, 'synthetic')]
        negatives = []
        for sid in ids:
            witness = blob['witnesses'][sid]
            observed = s.projected(subject, witness['value'])
            value = {key: observed[key] for key in ids}
            negatives.append(g.Negative('negative/' + sid, value, sid, 'schema_invalid', 'control',
                               'One owner field/keyword defect; all other non-entailed schema clauses pass.'))
        module = 'pm_pnc019_s4o3_schema_' + table
        path = 'scripts/' + module + '.py'
        suite = g.Suite('S4 W3I schema ' + table, importlib.import_module(module).case,
                         controls, negatives, (path,), s.ROOT,
                         non_guards=[g.NonGuard(path, 'case', 'return', 'return g.Case(table, check, context)',
                                     'Construct a fresh Case; this return decides no predicate.')])
        report = g.run(suite, memory=g.MemoryGate(1800, 12, 13, 30, 2700))
        with gzip.open(out / (table + '.json.gz'), 'wt') as handle:
            json.dump(report, handle, default=str, sort_keys=True)
        result = {'table': table, 'status': report['status'],
                  'proved': [r['id'] for r in report.get('rows', []) if r.get('proved')],
                  'unproved': report.get('unproved_guards', []), 'failures': report.get('failures', []),
                  'masked': report.get('masked_negatives', []),
                  'static_files': report.get('static', {}).get('files'),
                  'source_sha256': hashlib.sha256((s.ROOT / path).read_bytes()).hexdigest()}
        (out / (table + '.summary.json')).write_text(json.dumps(result, indent=2, default=str) + '\n')
        results.append(result)
        print(table, result['status'], len(result['proved']), flush=True)
    summary = {'status': 'pass' if all(r['status'] == 'PASS' for r in results) else 'fail',
               'sites': len(s.SITES), 'proved': sum(len(r['proved']) for r in results),
               'entailed': s.IMPLIED, 'tables': results,
               'tool_sha256': hashlib.sha256((s.ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest()}
    (out / 'schema-guard-summary.json').write_text(json.dumps(summary, indent=2, default=str) + '\n')
    return int(summary['status'] != 'pass')


def mutations(out, blob):
    replay(blob)
    rows = []
    for sid, witness in blob['witnesses'].items():
        table = s.BY_ID[sid]['table']
        module = importlib.import_module('pm_pnc019_s4o3_schema_' + table)
        original = getattr(module, sid)
        setattr(module, sid, lambda value, context: None)
        try:
            try:
                refused = s.require(witness['subject'], witness['value'])
            except Exception as error:
                status, detail = 'INVALID', repr(error)
            else:
                status, detail = ('killed', None) if refused == [] else ('INVALID', refused)
        finally:
            setattr(module, sid, original)
        rows.append({'site': sid, 'status': status, 'detail': detail})
    result = {'status': 'pass' if all(r['status'] == 'killed' for r in rows) else 'fail',
              'mutations': rows, 'killed': sum(r['status'] == 'killed' for r in rows),
              'invalid': sum(r['status'] == 'INVALID' for r in rows)}
    (out / 'schema-mutations.json').write_text(json.dumps(result, indent=2, default=str) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'mutations'}), flush=True)
    return int(result['status'] != 'pass')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True)
    parser.add_argument('--action', choices=['inventory', 'generate', 'check', 'replay', 'proof', 'mutations'], default='inventory')
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    if args.action in ('generate', 'check'):
        stale = generate(args.action == 'check')
        print(json.dumps({'stale': stale, 'tables': len(s.TABLES)}))
        return int(args.action == 'check' and bool(stale))
    if args.action in ('replay', 'proof', 'mutations'):
        inventory = json.loads((out / 'schema-inventory.json').read_text())
        assert inventory['source_sha256'] == hashlib.sha256((s.ROOT / 'Plans/continuity_event_contracts.schema.json').read_bytes()).hexdigest()
        assert not inventory['unproved']
        blob = json.loads((out / 'schema-fixtures.json').read_text())
        if args.action == 'replay':
            replay(blob)
            print(json.dumps({'status': 'pass', 'controls': len(blob['controls']), 'negatives': len(blob['witnesses'])}))
            return 0
        return proof(out, blob) if args.action == 'proof' else mutations(out, blob)
    valid, witnesses, entailed, missed = s.fixtures()
    summary = {'sites': len(s.SITES), 'witnessed': len(witnesses), 'entailed': entailed,
               'unproved': [s.BY_ID[sid] for sid in missed],
               'source_sha256': hashlib.sha256((s.ROOT / 'Plans/continuity_event_contracts.schema.json').read_bytes()).hexdigest()}
    (out / 'schema-inventory.json').write_text(json.dumps(summary, indent=2) + '\n')
    (out / 'schema-fixtures.json').write_text(json.dumps({'controls': valid, 'witnesses': witnesses}, indent=1) + '\n')
    print(json.dumps({'sites': len(s.SITES), 'witnessed': len(witnesses), 'entailed': len(entailed),
                      'unproved': len(missed)}), flush=True)
    return int(bool(missed))


if __name__ == '__main__':
    raise SystemExit(main())

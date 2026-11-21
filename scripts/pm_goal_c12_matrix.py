#!/usr/bin/env python3
"""Per-family C12 coverage matrix from a pm_goal_guard_sweep proof directory (C12-GH1, G1).

One row per checker row a family's complete calls evaluate:
  owner clause or branch -> predicate -> control -> negative -> cut -> restoration.

* owner clause: for a schema row, the owner schema keyword at its exact
  location (owner text); for a checker row, the owner clauses the family's
  grade cell for that concern cites (path, line, unit, quote), plus the
  predicate's own source line;
* predicate: phase table, gated-tool status (004bdedd63), sites;
* control: the family's accepted complete calls that evaluated the row and the
  gated control vector's witnesses;
* negative: the family's declared-target attempts by outcome class, and the
  best exact witness (label, input SHA-256);
* cut / restoration: the complete-checker replay of that witness.

A row is CLOSED only with a gated PASS and a KILLED (or DUPLICATE_SET_KILLED)
witness of that family; CLOSED_BY_PROOF with a recorded source-bound proof;
otherwise OPEN with its reason. Usage:
  python3 scripts/pm_goal_c12_matrix.py PROOF_DIR --family goal.scheduled [...] --out matrix.json
"""
import argparse
import collections
import gzip
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRADES = ROOT / 'reports/event-authority-20261115/PNC019-S3AO-grades-core.json'
DOCS = {
    'https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json': 'Plans/event_record.schema.json',
    'https://puppetmaster.local/schemas/goal_history_reader_outputs/1.0.0/schema.json': 'Plans/goal_history_reader_outputs.schema.json',
}


def concern(name):
    if name.startswith('schema/'):
        return 'closed_payload_schema'
    if name.startswith('row/'):
        return 'transitions'
    if name.startswith('current_writer/'):
        return 'compatibility_withdrawal'
    if name.startswith(('receipt/', 'retained/', 'frame/', 'translation/')):
        return 'redaction_custody'
    return 'consumers_checkpoints'


def schema_file(location):
    for prefix, path in DOCS.items():
        if location.startswith(prefix):
            return path, location[len(prefix):]
    head = location.split('/', 1)[0]
    if head.startswith('pm.goal_runtime_event.'):
        name = head[len('pm.goal_runtime_event.'):].rsplit('.schema.', 1)[0]
        return 'Plans/event_payloads/goal_runtime/' + name + '.schema.json', location[len(head):]
    for candidate in ('Plans/event_append_receipt_contracts.schema.json', 'Plans/event_record_index_checkpoint.schema.json'):
        try:
            doc = json.loads((ROOT / candidate).read_text())
        except OSError:
            continue
        if location.startswith(doc.get('$id', '\0')):
            return candidate, location[len(doc['$id']):]
    return None, location


def line_text(path, line):
    try:
        return (ROOT / path).read_text().splitlines()[line - 1].strip()
    except (OSError, IndexError):
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('proof', type=Path)
    parser.add_argument('--family', action='append', required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--extra-ledger', type=Path, action='append', default=[],
                        help='ledger.json.gz of a supplement run on the same code and tables; its declared '
                             'attempts and replays join the family columns (gated status stays the main run\'s)')
    args = parser.parse_args()
    proof = args.proof
    ledger = json.load(gzip.open(proof / 'ledger.json.gz', 'rt'))
    for extra in args.extra_ledger:
        for record in json.load(gzip.open(extra, 'rt')):
            if record.get('target') is not None and record.get('valid') is not True:
                ledger.append(dict(record, id=len(ledger), sig=None, label='supplement:' + record['label']))
    signatures = [set(x) for x in json.load(gzip.open(proof / 'signatures.json.gz', 'rt'))]
    family_rows = json.loads((proof / 'family-rows.json').read_text())
    collection = json.loads((proof / 'collection.json').read_text())
    rows = {r['guard']: r for r in json.loads((proof / 'tables/rows.json').read_text())}
    tables = {t['table']: t for t in json.loads((proof / 'tables/summary.json').read_text())}
    inventory = json.loads((proof / 'schema-inventory.json').read_text())
    assertions = inventory.get('assertions', {})
    grades = {r['event_type']: r for r in json.loads(GRADES.read_text())['rows']}
    out = dict(schema_id='pm.pnc019.c12_gh1.coverage_matrix.v1', proof_dir=str(proof), families={},
               rule='CLOSED = gated PASS and a KILLED/DUPLICATE_SET_KILLED witness of this family; '
                    'CLOSED_BY_PROOF = recorded source-bound proof; OPEN otherwise.')
    for family in args.family:
        names = sorted(family_rows.get(family, []))
        records = [r for r in ledger if r['family'] == family]
        controls = collections.Counter()
        for record in records:
            if record.get('outcome') == 'control' and record.get('sig') is not None:
                for name in signatures[record['sig']]:
                    controls[name] += 1
        attempts = collections.defaultdict(list)
        for record in records:
            target = record.get('target')
            if target is None or record.get('valid') is True:
                continue
            for name in ([target] if isinstance(target, str) else target):
                attempts[name].append(record)
        cells = (grades.get(family) or {}).get('cells', {})
        matrix = []
        for name in names:
            row = rows.get(name, {})
            table = tables.get(row.get('table'), {})
            tries = attempts.get(name, [])
            outcomes = collections.Counter(r.get('outcome') for r in tries)
            kills = collections.Counter(r.get('kill') for r in tries if r.get('kill'))
            best = sorted(tries, key=lambda r: (r.get('kill') not in ('KILLED', 'DUPLICATE_SET_KILLED'),
                                                 r.get('outcome') != 'exact_expected', r['id']))[:1]
            killed = any(r.get('kill') in ('KILLED', 'DUPLICATE_SET_KILLED', 'KILLED_CODE') for r in tries)
            gated = row.get('status')
            if gated == 'PASS' and killed:
                status, reason = 'CLOSED', None
            elif row.get('proof'):
                status, reason = 'CLOSED_BY_PROOF', row['proof'].get('kind')
            elif gated != 'PASS':
                status, reason = 'OPEN', 'gated ' + str(gated)
            elif not tries:
                status, reason = 'OPEN', 'no declared-target negative in this family'
            else:
                status, reason = 'OPEN', 'no killed witness in this family: ' + json.dumps(dict(outcomes))
            info = assertions.get(name)
            if info:
                path, pointer = schema_file(info['location'])
                clause = dict(kind='owner_schema_keyword', file=path, pointer=pointer, keyword=info['keyword'],
                              value=info.get('value'), shared_profile=info.get('shared_profile'))
            else:
                cell = cells.get(concern(name), {})
                clause = dict(kind='owner_clause_cited_by_grade_cell', cell=concern(name),
                              citations=[dict(path=e['path'], line=e['line_start'], unit=e['unit'], quote=e['quote'][:200])
                                         for e in cell.get('evidence', [])])
            sites = collection['rows'].get(name, {}).get('sites', [])
            witness = best[0] if best else None
            matrix.append(dict(
                row=name, status=status, reason=reason, owner=clause,
                predicate=dict(table=row.get('table'), gated=gated, table_status=table.get('status'),
                               table_rows=len(table.get('rows', [])),
                               sites=[dict(path=p, line=l, source=line_text(p, l)) for p, l in sites[:4]]),
                control=dict(family_accepted_calls=controls.get(name, 0),
                             gated_control_witnesses=[w['label'] for c in table.get('controls', []) for w in c['witnesses'][:2]]),
                negative=dict(declared_attempts=len(tries), outcomes=dict(outcomes),
                              witness=None if witness is None else dict(label=witness['label'], input_sha256=witness['input_sha256'],
                                  outcome=witness.get('outcome'), errors=witness.get('errors'))),
                cut=None if witness is None else dict(kill=witness.get('kill'), cut_errors=witness.get('cut_errors'),
                                                      site_cuts=witness.get('site_cuts')),
                restoration=None if witness is None else dict(errors=witness.get('restoration_errors'),
                    same_refusal=witness.get('restoration_errors') == witness.get('errors')),
                proof=row.get('proof'), kills=dict(kills)))
        # A proof closes its row only while every row it depends on is closed
        # in this family too.
        status_of = {m['row']: m['status'] for m in matrix}
        for _ in range(3):
            for m in matrix:
                if m['status'] == 'CLOSED_BY_PROOF':
                    deps = (m['proof'] or {}).get('earlier_guards') or [(m['proof'] or {}).get('earlier_guard')]
                    pending = [d for d in deps if d and status_of.get(d, 'OPEN') not in ('CLOSED', 'CLOSED_BY_PROOF')]
                    if pending:
                        m['status'], m['reason'] = 'OPEN', 'proof dependency not closed in this family: ' + ', '.join(pending)
                        status_of[m['row']] = 'OPEN'
        summary = collections.Counter(m['status'] for m in matrix)
        out['families'][family] = dict(rows=len(matrix), status=dict(summary),
            schema_rows=sum(1 for m in matrix if m['row'].startswith('schema/')),
            checker_rows=sum(1 for m in matrix if not m['row'].startswith('schema/')),
            open=[dict(row=m['row'], reason=m['reason']) for m in matrix if m['status'] == 'OPEN'],
            matrix=matrix)
    args.out.write_text(json.dumps(out, indent=1, default=list) + '\n')
    print(json.dumps({f: dict(rows=v['rows'], status=v['status'], open=len(v['open'])) for f, v in out['families'].items()}, indent=1))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

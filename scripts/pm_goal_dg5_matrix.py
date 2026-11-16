#!/usr/bin/env python3
"""C12-DG5 per-family coverage matrix from a DG5 proof directory (GH1's matrix rule, DG5 rows).

One entry per row the family's complete calls evaluate:
  owner clause -> predicate (phase table, gated status on 004bdedd63, sites)
  -> control (accepted complete calls of the family) -> negative (declared-target
  attempts by outcome, best exact witness) -> cut -> restoration.

Status (GH1): CLOSED = gated PASS and a KILLED or DUPLICATE_SET_KILLED witness of
this family; CLOSED_BY_PROOF = a recorded justification (scripts/pm_goal_dg5_justified.py)
whose dependencies are closed in this family; OPEN otherwise, with its reason.
A whole-root schema row is CLOSED only if, in addition, every root it validates
for this family has 0 UNCOVERED clauses in the DG5 clause-closure report(s).

Usage: python3 scripts/pm_goal_dg5_matrix.py PROOF_DIR --family F [--closure REPORT ...] --out matrix.json
"""
import argparse
import collections
import gzip
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def line_text(path, line):
    try:
        return (ROOT / path).read_text().splitlines()[line - 1].strip()[:240]
    except (OSError, IndexError):
        return None


def load_closure(paths):
    """row name -> list of (root id, family list, counts, uncovered clause ids)."""
    by_row = collections.defaultdict(list)
    for path in paths:
        report = json.loads(Path(path).read_text())
        for ident, entry in report['roots'].items():
            uncovered = [c for c, e in entry.get('clauses', {}).items() if e['cls'] == 'UNCOVERED']
            for name in entry.get('rows', []):
                by_row[name].append(dict(root=ident, report=str(path), families=entry.get('families', []),
                                         counts=entry.get('counts', {}), uncovered=len(uncovered),
                                         error=entry.get('error')))
    return by_row


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('proof', type=Path)
    parser.add_argument('--family', action='append', required=True)
    parser.add_argument('--closure', action='append', default=[])
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    import pm_goal_dg5_justified as justified
    proof = args.proof
    ledger = json.load(gzip.open(proof / 'ledger.json.gz', 'rt'))
    signatures = [set(x) for x in json.load(gzip.open(proof / 'signatures.json.gz', 'rt'))]
    family_rows = json.loads((proof / 'family-rows.json').read_text())
    collection = json.loads((proof / 'collection.json').read_text())
    rows = {r['guard']: r for r in json.loads((proof / 'tables/rows.json').read_text())}
    tables = {t['table']: t for t in json.loads((proof / 'tables/summary.json').read_text())}
    closure = load_closure(args.closure)
    out = dict(schema_id='pm.pnc019.c12_dg5.coverage_matrix.v1', proof_dir=str(proof), families={},
               rule=__doc__.split('\n\n')[2])
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
        owners = justified.owner_clauses(family)
        matrix = []
        for name in names:
            row = rows.get(name, {})
            table = tables.get(row.get('table'), {})
            tries = attempts.get(name, [])
            outcomes = collections.Counter(r.get('outcome') for r in tries)
            kills = collections.Counter(r.get('kill') for r in tries if r.get('kill'))
            best = sorted(tries, key=lambda r: (r.get('kill') not in ('KILLED', 'DUPLICATE_SET_KILLED'),
                                                 r.get('outcome') != 'exact_expected', r['id']))[:1]
            killed = any(r.get('kill') in ('KILLED', 'DUPLICATE_SET_KILLED') for r in tries)
            gated = row.get('status')
            proof_record = justified.justification(family, name, tries,
                                                   collection['rows'].get(name, {}).get('sites', []))
            if gated == 'PASS' and killed:
                status, reason = 'CLOSED', None
            elif proof_record and gated in ('PASS', 'NOT_RUN'):
                status, reason = 'CLOSED_BY_PROOF', proof_record['kind']
            elif gated != 'PASS':
                status, reason = 'OPEN', 'gated ' + str(gated)
            elif not tries:
                status, reason = 'OPEN', 'no declared-target negative in this family'
            else:
                status, reason = 'OPEN', 'no killed witness in this family: ' + json.dumps(dict(outcomes))
            schema = None
            if name.endswith('/schema'):
                roots = [r for r in closure.get(name, []) if family in r['families']]
                schema = dict(roots=roots, uncovered=sum(r['uncovered'] for r in roots),
                              errors=[r['root'] for r in roots if r['error']])
                if status != 'OPEN' and (not roots or schema['uncovered'] or schema['errors']):
                    status, reason = 'OPEN', ('no clause-closure report for its roots' if not roots else
                                              'clause closure leaves %d uncovered' % schema['uncovered'])
            sites = collection['rows'].get(name, {}).get('sites', [])
            witness = best[0] if best else None
            matrix.append(dict(
                row=name, status=status, reason=reason,
                owner=justified.owner_for(name, owners),
                predicate=dict(table=row.get('table'), gated=gated, table_status=table.get('status'),
                               table_rows=len(table.get('rows', [])),
                               sites=[dict(path=p, line=l, source=line_text(p, l)) for p, l in sites[:4]]),
                control=dict(family_accepted_calls=controls.get(name, 0)),
                negative=dict(declared_attempts=len(tries), outcomes=dict(outcomes),
                              witness=None if witness is None else dict(label=witness['label'],
                                  input_sha256=witness['input_sha256'], outcome=witness.get('outcome'),
                                  errors=witness.get('errors'))),
                cut=None if witness is None else dict(kill=witness.get('kill'), cut_errors=witness.get('cut_errors'),
                                                      site_cuts=witness.get('site_cuts'),
                                                      cut_exception_site=witness.get('cut_exception_site')),
                restoration=None if witness is None else dict(errors=witness.get('restoration_errors'),
                    same_refusal=witness.get('restoration_errors') == witness.get('errors')),
                justification=proof_record, schema_closure=schema, kills=dict(kills)))
        status_of = {m['row']: m['status'] for m in matrix}
        for _ in range(4):
            for m in matrix:
                if m['status'] == 'CLOSED_BY_PROOF':
                    deps = (m['justification'] or {}).get('depends_on', [])
                    pending = [d for d in deps if status_of.get(d, 'OPEN') not in ('CLOSED', 'CLOSED_BY_PROOF')]
                    if pending:
                        m['status'], m['reason'] = 'OPEN', 'justification dependency not closed: ' + ', '.join(pending)
                        status_of[m['row']] = 'OPEN'
        summary = collections.Counter(m['status'] for m in matrix)
        out['families'][family] = dict(rows=len(matrix), status=dict(summary),
            schema_rows=sum(1 for m in matrix if m['row'].endswith('/schema')),
            checker_rows=sum(1 for m in matrix if not m['row'].endswith('/schema')),
            open=[dict(row=m['row'], reason=m['reason']) for m in matrix if m['status'] == 'OPEN'],
            matrix=matrix)
    args.out.write_text(json.dumps(out, indent=1, default=list) + '\n')
    print(json.dumps({f: dict(rows=v['rows'], status=v['status'], open=len(v['open'])) for f, v in out['families'].items()},
                     indent=1))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

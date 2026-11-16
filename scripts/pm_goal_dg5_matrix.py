#!/usr/bin/env python3
"""C12-DG5 per-family coverage matrix from a DG5 proof directory (GH1's matrix rule, DG5 rows).

One entry per row the family's complete calls evaluate:
  owner clause -> predicate (phase table, gated status on 004bdedd63, sites)
  -> control (accepted complete calls of the family) -> negative (declared-target
  attempts by outcome, best exact witness) -> cut -> restoration.

Status (GH1): CLOSED = gated PASS and a KILLED or DUPLICATE_SET_KILLED witness of
this family (or a byte-identical cited shared witness under --shared-proof);
CLOSED_BY_PROOF = a recorded justification (scripts/pm_goal_dg5_justified.py)
whose dependencies are closed in this family; OPEN otherwise, with its reason.
A whole-root schema row is CLOSED only if, in addition, every root it validates
for this family has 0 UNCOVERED clauses in the DG5 clause-closure report(s).

Several proof directories may be given for one family whose suites or groups had to run in
separate snapshots: family rows, controls and attempts are unioned, a gated PASS in any part
proves the (byte-identical) predicate, and conflicting site lists stay OPEN with the conflict
recorded. ``--shared-proof`` directories supply cited witnesses for shared
``pm_goal_test_*`` rows only when their collection sites and source-bindings for every cited
site file exactly match this family's proof; the citation is recorded separately and never
counts as a family attempt. Duplicate closure roots across reports merge by clause identity:
a clause is uncovered for the merged root only when every report of that root leaves it
uncovered, while any root error still blocks closure.

Usage: python3 scripts/pm_goal_dg5_matrix.py PROOF_DIR... --family F [--closure REPORT ...]
       [--shared-proof SHARED_PROOF_DIR ...] --out matrix.json
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
    """row name -> list of merged (root id, family list, counts, uncovered clause count).

    The same root may be closed in several suite reports. Its merged uncovered set is the
    intersection of the reports' uncovered clause ids (a clause killed from any suite's seeds
    is covered); any root error is retained and blocks closure in the caller.
    """
    grouped = collections.defaultdict(list)
    for path in paths:
        report = json.loads(Path(path).read_text())
        for ident, entry in report['roots'].items():
            uncovered = {c for c, e in entry.get('clauses', {}).items() if e['cls'] == 'UNCOVERED'}
            for name in entry.get('rows', []):
                grouped[(name, ident)].append(dict(report=str(path), families=entry.get('families', []),
                                                   counts=entry.get('counts', {}), uncovered_ids=uncovered,
                                                   error=entry.get('error')))
    by_row = collections.defaultdict(list)
    for (name, ident), entries in grouped.items():
        uncovered = set.intersection(*(e['uncovered_ids'] for e in entries)) if entries else set()
        errors = [e['error'] for e in entries if e['error']]
        by_row[name].append(dict(root=ident, report=entries[0]['report'],
                                 reports=[e['report'] for e in entries],
                                 families=sorted({f for e in entries for f in e['families']}),
                                 counts=entries[0]['counts'], uncovered=len(uncovered),
                                 uncovered_clauses=sorted(uncovered),
                                 error='; '.join(errors) if errors else None))
    return by_row


def load_proof(path, index):
    """One DG5 proof directory, with every ledger record annotated by its origin directory."""
    path = Path(path)
    ledger = []
    for record in json.load(gzip.open(path / 'ledger.json.gz', 'rt')):
        record = dict(record, _dg5_proof_index=index, _dg5_proof_dir=str(path))
        ledger.append(record)
    bindings_path = path / 'source-bindings.json'
    bindings = {}
    if bindings_path.exists():
        bindings = json.loads(bindings_path.read_text()).get('files', {})
    return dict(path=str(path), index=index, ledger=ledger,
                signatures=[set(x) for x in json.load(gzip.open(path / 'signatures.json.gz', 'rt'))],
                family_rows=json.loads((path / 'family-rows.json').read_text()),
                collection=json.loads((path / 'collection.json').read_text()),
                rows={r['guard']: r for r in json.loads((path / 'tables/rows.json').read_text())},
                tables={t['table']: t for t in json.loads((path / 'tables/summary.json').read_text())},
                bindings=bindings)


def _site_key(sites):
    return tuple(sorted(tuple(site) for site in sites))


def _effective_gated(specs):
    statuses = [spec.get('status') for spec in specs if spec.get('status') is not None]
    if 'PASS' in statuses:
        return 'PASS'
    for status in ('UNPROVED', 'REFUSED', 'FAIL', 'NOT_RUN'):
        if status in statuses:
            return status
    return statuses[0] if statuses else None


def _best_attempt(records):
    best = sorted(records, key=lambda r: (r.get('kill') not in ('KILLED', 'DUPLICATE_SET_KILLED'),
                                          r.get('outcome') != 'exact_expected',
                                          r.get('_dg5_proof_index', 0), r['id']))[:1]
    return best[0] if best else None


def _witness(record):
    if record is None:
        return None
    return dict(label=record['label'], input_sha256=record['input_sha256'],
                outcome=record.get('outcome'), errors=record.get('errors'),
                proof_dir=record.get('_dg5_proof_dir'))


def _cut(record):
    if record is None:
        return None
    return dict(kill=record.get('kill'), cut_errors=record.get('cut_errors'),
                site_cuts=record.get('site_cuts'), cut_exception_site=record.get('cut_exception_site'))


def _restoration(record):
    if record is None:
        return None
    return dict(errors=record.get('restoration_errors'),
                same_refusal=record.get('restoration_errors') == record.get('errors'))


def _shared_citation(shared_proofs, family_proofs, name, sites):
    """Cited shared attempts for one shared row, valid only at identical sites and source bytes."""
    if not sites or not all(Path(p).name.startswith('pm_goal_test_') for p, _ in sites):
        return dict(valid=False, reason='not a shared pm_goal_test_* row', records=[], gated=None, specs=[])
    family_bindings = {}
    for proof in family_proofs:
        for path, _line in sites:
            family_bindings.setdefault(path, set()).add(proof['bindings'].get(path))
    records, specs, reasons = [], [], []
    for proof in shared_proofs:
        shared_sites = proof['collection'].get('rows', {}).get(name, {}).get('sites', [])
        if _site_key(shared_sites) != _site_key(sites):
            reasons.append(f"{proof['path']}: collection sites differ")
            continue
        mismatched = [path for path, _line in sites
                      if proof['bindings'].get(path) is None
                      or proof['bindings'].get(path) not in family_bindings.get(path, set())]
        if mismatched:
            reasons.append(f"{proof['path']}: source bindings differ or are missing for {mismatched}")
            continue
        spec = proof['rows'].get(name)
        if spec is not None:
            table = proof['tables'].get(spec.get('table'), {})
            specs.append(dict(spec, proof_dir=proof['path'], table_status=table.get('status'),
                              table_rows=len(table.get('rows', []))))
        for record in proof['ledger']:
            target = record.get('target')
            if target is None or record.get('valid') is True:
                continue
            if name in ([target] if isinstance(target, str) else target):
                records.append(record)
    return dict(valid=bool(specs or records), reason='; '.join(reasons) if reasons else None,
                records=records, gated=_effective_gated(specs), specs=specs)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('proof', type=Path, nargs='+')
    parser.add_argument('--family', action='append', required=True)
    parser.add_argument('--closure', action='append', default=[])
    parser.add_argument('--shared-proof', action='append', type=Path, default=[],
                        help='shared-adapter proof directory whose kills may be cited for shared rows')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    import pm_goal_dg5_justified as justified
    proofs = [load_proof(path, index) for index, path in enumerate(args.proof)]
    shared_proofs = [load_proof(path, index) for index, path in enumerate(args.shared_proof)]
    closure = load_closure(args.closure)
    out = dict(schema_id='pm.pnc019.c12_dg5.coverage_matrix.v1', proof_dir=str(args.proof[0]),
               proof_dirs=[str(path) for path in args.proof],
               shared_proof_dirs=[str(path) for path in args.shared_proof], families={},
               rule=__doc__.split('\n\n')[2])
    for family in args.family:
        names = sorted({name for proof in proofs for name in proof['family_rows'].get(family, [])})
        records = [r for proof in proofs for r in proof['ledger'] if r['family'] == family]
        controls = collections.Counter()
        for proof in proofs:
            for record in proof['ledger']:
                if record['family'] == family and record.get('outcome') == 'control' \
                        and record.get('sig') is not None:
                    for name in proof['signatures'][record['sig']]:
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
            specs = []
            for proof in proofs:
                spec = proof['rows'].get(name)
                if spec is not None:
                    table = proof['tables'].get(spec.get('table'), {})
                    specs.append(dict(spec, proof_dir=proof['path'], table_status=table.get('status'),
                                      table_rows=len(table.get('rows', []))))
            row = next((spec for spec in specs if spec.get('status') == 'PASS'), specs[0] if specs else {})
            table = {'status': row.get('table_status'), 'rows': [None] * row.get('table_rows', 0)} if row else {}
            site_variants = []
            for proof in proofs:
                sites = proof['collection'].get('rows', {}).get(name, {}).get('sites', [])
                if sites and _site_key(sites) not in {_site_key(v) for v in site_variants}:
                    site_variants.append(sites)
            sites = site_variants[0] if site_variants else []
            site_conflict = len(site_variants) > 1
            tries = attempts.get(name, [])
            outcomes = collections.Counter(r.get('outcome') for r in tries)
            kills = collections.Counter(r.get('kill') for r in tries if r.get('kill'))
            witness = _best_attempt(tries)
            killed = any(r.get('kill') in ('KILLED', 'DUPLICATE_SET_KILLED') for r in tries)
            gated = _effective_gated(specs)
            shared = _shared_citation(shared_proofs, proofs, name, sites) if shared_proofs else \
                dict(valid=False, reason=None, records=[], gated=None, specs=[])
            shared_tries = shared['records'] if shared['valid'] else []
            shared_killed = any(r.get('kill') in ('KILLED', 'DUPLICATE_SET_KILLED') for r in shared_tries)
            shared_witness = _best_attempt(shared_tries)
            effective_gated = 'PASS' if gated == 'PASS' or (shared['valid'] and shared['gated'] == 'PASS') else gated
            if site_conflict:
                effective_gated = 'CONFLICT'
            proof_record = justified.justification(family, name, tries, sites)
            if proof_record is None and shared['valid']:
                proof_record = justified.justification(family, name, shared_tries, sites)
                if proof_record is not None and proof_record.get('kind') == 'presence':
                    proof_record = dict(proof_record, shared_cite=True)
            if site_conflict:
                status, reason = 'OPEN', 'conflicting collection sites across proof directories'
            elif effective_gated == 'PASS' and (killed or shared_killed):
                status, reason = 'CLOSED', None
            elif proof_record and effective_gated in ('PASS', 'NOT_RUN'):
                status, reason = 'CLOSED_BY_PROOF', proof_record['kind']
            elif effective_gated != 'PASS':
                status, reason = 'OPEN', 'gated ' + str(effective_gated)
            elif not tries and not shared_tries:
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
            predicate = dict(table=row.get('table'), gated=gated, effective_gated=effective_gated,
                             proof_dir=row.get('proof_dir'), table_status=table.get('status'),
                             table_rows=len(table.get('rows', [])),
                             sites=[dict(path=p, line=l, source=line_text(p, l)) for p, l in sites[:4]])
            if len(proofs) > 1 or shared_proofs:
                predicate['sources'] = [dict(table=spec.get('table'), gated=spec.get('status'),
                                             proof_dir=spec.get('proof_dir'),
                                             table_status=spec.get('table_status'),
                                             table_rows=spec.get('table_rows')) for spec in specs]
                predicate['shared_sources'] = shared['specs']
                predicate['shared_gated'] = shared['gated'] if shared['valid'] else None
                predicate['site_conflict'] = site_conflict
            entry = dict(
                row=name, status=status, reason=reason,
                owner=justified.owner_for(name, owners), predicate=predicate,
                control=dict(family_accepted_calls=controls.get(name, 0)),
                negative=dict(declared_attempts=len(tries), outcomes=dict(outcomes), witness=_witness(witness)),
                cut=_cut(witness), restoration=_restoration(witness),
                justification=proof_record, schema_closure=schema, kills=dict(kills))
            if shared_proofs:
                entry['shared_negative'] = dict(
                    valid_citation=shared['valid'], rejected_reason=shared['reason'],
                    declared_attempts=len(shared_tries),
                    outcomes=dict(collections.Counter(r.get('outcome') for r in shared_tries)),
                    kills=dict(collections.Counter(r.get('kill') for r in shared_tries if r.get('kill'))),
                    witness=_witness(shared_witness), cut=_cut(shared_witness),
                    restoration=_restoration(shared_witness))
            matrix.append(entry)
        # A proof closes its row only once every dependency is already closed: a least fixpoint
        # grounded in CLOSED (killed) rows, so mutually dependent proofs never close each other.
        closed = {m['row'] for m in matrix if m['status'] == 'CLOSED'}
        candidates = [m for m in matrix if m['status'] == 'CLOSED_BY_PROOF']
        changed = True
        while changed:
            changed = False
            for m in candidates:
                if m['row'] in closed:
                    continue
                if all(d in closed for d in (m['justification'] or {}).get('depends_on', [])):
                    closed.add(m['row'])
                    changed = True
        for m in candidates:
            if m['row'] not in closed:
                pending = [d for d in (m['justification'] or {}).get('depends_on', []) if d not in closed]
                m['status'], m['reason'] = 'OPEN', 'justification dependency not closed (or cyclic): ' + ', '.join(pending)
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

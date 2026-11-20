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
A NOT_RUN row (the gated tool found no control vector or no single-row vector;
rows.json status UNPROVED) also closes as CLOSED_BY_PROOF with kind
witness_bound_not_run under the lead ruling of 2026-11-17
(RULING-single-vector-20261117.md,
sha256 6b57a3e42182bdcb76f0e093eea0289ef1493d5324d2538cb50d3b72d5d6cc95) only
when every condition holds: every site
is a bad-branch site (a shared_refuse or refuse call, an except-branch require,
or a __reduce__ handler) bound to the witness proof's exact source bytes; the
row has an exact KILLED witness of this family (or a byte-identical cited
shared witness) whose restoration repeats the refusal -- COVERED_LATER,
CUT_EXCEPTION and duplicate-set kills never qualify; the table summary's
NOT_RUN reason is copied verbatim; the row was never evaluated in an accepted
family call; and the family's whole-source pass-2 replay is cited with
failures 0 and every control exact. A FAIL table never qualifies, and where a
family table has a control and a single-row vector the normal gated rule
applies instead. Per-family counts of the class are reported separately.

Several proof directories may be given for one family whose suites or groups had to run in
separate snapshots: family rows, controls and attempts are unioned, a gated PASS in any part
proves the (byte-identical) predicate, and conflicting site lists stay OPEN with the conflict
recorded. ``--shared-proof`` directories supply cited witnesses for shared
``pm_goal_test_*`` rows only when their collection sites and source-bindings for every cited
site file exactly match this family's proof; the citation is recorded separately and never
counts as a family attempt. Merge closure reports for the same root only when their exact
clause inventories agree and no report has a root or verification error. A checked
witness for the exact clause can discharge an uncovered entry from another report.
Keep all reported uncovered clauses when any report in the group has an error.

Usage: python3 scripts/pm_goal_dg5_matrix.py PROOF_DIR... --family F [--closure REPORT ...]
       [--shared-proof SHARED_PROOF_DIR ...] --out matrix.json
"""
import argparse
import ast
import collections
import gzip
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def line_text(path, line):
    try:
        return (ROOT / path).read_text().splitlines()[line - 1].strip()[:240]
    except (OSError, IndexError):
        return None


def _inventory_pin_matches(pin, ids):
    return (isinstance(pin, dict) and pin.get('identity') == 'dg5-distinct-keywords-v1'
            and pin.get('count') == len(ids)
            and pin.get('sha256') == hashlib.sha256('\n'.join(sorted(ids)).encode()).hexdigest())


def _root_inventories(paths):
    inventories, bindings = {}, collections.defaultdict(set)
    for path in paths:
        report = json.loads(Path(path).read_text())
        if report.get('mode') != 'assertion-inventory' or report.get('collection_failures'):
            raise ValueError(f'invalid assertion inventory report: {path}')
        for ident, entry in report['roots'].items():
            keys = entry.get('clause_ids', [])
            ids = set(keys)
            error = entry.get('error')
            if not error and (len(ids) != len(keys) or not _inventory_pin_matches(entry.get('clause_inventory'), ids)):
                error = 'assertion inventory has a missing or invalid clause pin'
            current = (ids, error)
            if ident in inventories and inventories[ident] != current:
                raise ValueError(f'conflicting assertion inventories for {ident}')
            inventories[ident] = current
            for row in entry.get('rows', ()):
                bindings[row, ident].update(entry.get('families', ()))
    return inventories, bindings


def load_closure(paths, inventory_paths=()):
    """row name -> list of merged (root id, family list, counts, uncovered clause count).

    Reports with matching clause inventories can contribute coverage for the same root.
    Missing or renamed clause keys and failed verification block closure.
    """
    inventories, bindings = _root_inventories(inventory_paths)
    grouped = collections.defaultdict(list)
    for path in paths:
        report = json.loads(Path(path).read_text())
        for ident, entry in report['roots'].items():
            clauses = entry.get('clauses', {})
            uncovered = {c for c, e in clauses.items() if e['cls'] == 'UNCOVERED'}
            errors = [entry['error']] if entry.get('error') else []
            clause_ids = set(clauses)
            census = inventories.get(ident)
            pin = entry.get('clause_inventory')
            if census is not None:
                ids, error = census
                if error:
                    errors.append(error)
                elif clause_ids != ids:
                    errors.append('closure report differs from the exact assertion inventory')
            if pin is not None and not _inventory_pin_matches(pin, clause_ids):
                errors.append('closure report has an invalid clause inventory pin')
            if census is None and pin is None and any(c.endswith('/closed_members') for c in clauses):
                errors.append('legacy closed_members requires an exact assertion inventory')
            verify = entry.get('verify', {})
            failed = verify.get('failed', 0)
            unverifiable = verify.get('unverifiable', 0)
            mismatch = verify.get('sampled', {}).get('mismatch', 0)
            if not errors and (failed or unverifiable or mismatch):
                errors.append(f'{Path(path).name}: clause verification has {failed} failures, '
                              f'{unverifiable} unverifiable, {mismatch} sampled mismatches')
            witnessed = {c for c, e in clauses.items() if e['cls'] in ('KILLED', 'COVERED_LATER')}
            verified_ids = witnessed if verify.get('passed') == len(witnessed) and not errors else set()
            for name in entry.get('rows', []):
                grouped[(name, ident)].append(dict(report=str(path), families=entry.get('families', []),
                                                   counts=entry.get('counts', {}), clause_ids=clause_ids,
                                                   uncovered_ids=uncovered, verified_ids=verified_ids, errors=errors))
    by_row = collections.defaultdict(list)
    for (name, ident), entries in grouped.items():
        errors = [error for e in entries for error in e['errors']]
        if any(e['clause_ids'] != entries[0]['clause_ids'] for e in entries[1:]):
            errors.append('clause inventories differ across reports for this root')
        uncovered = set.union(*(e['uncovered_ids'] for e in entries))
        if not errors:
            uncovered.difference_update(*(e['verified_ids'] for e in entries))
        by_row[name].append(dict(root=ident, report=entries[0]['report'],
                                 reports=[e['report'] for e in entries],
                                 families=sorted({f for e in entries for f in e['families']}),
                                 counts=entries[0]['counts'], uncovered=len(uncovered),
                                 uncovered_clauses=sorted(uncovered),
                                 error='; '.join(errors) if errors else None))
    for (name, ident), families in bindings.items():
        if (name, ident) not in grouped:
            _, error = inventories[ident]
            by_row[name].append(dict(root=ident, report=None, reports=[], families=sorted(families),
                                     counts={}, uncovered=0, uncovered_clauses=[],
                                     error=error or 'no closure report for inventoried root'))
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


NOT_RUN_REASONS = ('no control vector', 'no single-row vector')
_GUARDED_CALLS = ('shared_refuse', 'refuse', 'shared_require', 'require')
_TREE_CACHE = {}


def _classify(tree, line):
    """Bad-branch kind of the guarded call at `line`, or None (ruling condition 1)."""
    parents = {}
    for node in ast.walk(tree):
        for child in ast.iter_child_nodes(node):
            parents[child] = node
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not node.lineno <= line <= (node.end_lineno or node.lineno):
            continue
        fn = node.func.id if isinstance(node.func, ast.Name) else getattr(node.func, 'attr', None)
        if fn not in _GUARDED_CALLS:
            continue
        chain, cursor = [], node
        while cursor in parents:
            cursor = parents[cursor]
            chain.append(cursor)
        funcs = [c.name for c in chain if isinstance(c, (ast.FunctionDef, ast.AsyncFunctionDef))]
        if funcs and funcs[0] in ('__reduce__', '__reduce_ex__'):
            return 'reduce_handler'
        if fn == 'shared_refuse':
            return 'shared_refuse'
        if fn == 'refuse':
            return 'unconditional_refuse'
        if any(isinstance(c, ast.ExceptHandler) for c in chain):
            return 'except_branch_require'
        return None
    return None


def _site_structure(path, line):
    """The site's bad-branch classification bound to the current source bytes, or None."""
    if path not in _TREE_CACHE:
        try:
            raw = (ROOT / path).read_bytes()
        except OSError:
            _TREE_CACHE[path] = None
        else:
            try:
                tree = ast.parse(raw.decode())
            except (SyntaxError, UnicodeDecodeError):
                tree = None
            _TREE_CACHE[path] = (tree, hashlib.sha256(raw).hexdigest(),
                                 raw.decode(errors='replace').splitlines())
    entry = _TREE_CACHE[path]
    if entry is None or entry[0] is None:
        return None
    tree, file_sha256, lines = entry
    kind = _classify(tree, int(line))
    if kind is None:
        return None
    return dict(path=path, line=int(line), kind=kind, file_sha256=file_sha256,
                source=lines[int(line) - 1].strip()[:240] if 0 < int(line) <= len(lines) else None)


def _exact_witness(records, name):
    """An exact KILLED witness for the row alone (ruling condition 2), or None."""
    good = []
    for record in records:
        if record.get('kill') != 'KILLED' or record.get('outcome') != 'exact_expected':
            continue
        if name not in (record.get('errors') or []) or record.get('cut_errors'):
            continue
        if record.get('restoration_errors') != record.get('errors'):
            continue
        cuts = record.get('site_cuts')
        if cuts and cuts != {name: [name]}:
            continue
        good.append(record)
    good.sort(key=lambda r: (r.get('_dg5_proof_index', 0), str(r.get('id'))))
    return good[0] if good else None


def _replay_entry(proof, family):
    """Pass-2 replay citation for one proof directory (ruling condition 4)."""
    controls = [r for r in proof['ledger'] if r.get('family') == family and r.get('outcome') == 'control']
    exact = all(not r.get('errors') for r in controls)
    failures = proof['collection'].get('failures')
    ok = failures == [] and exact
    return ok, dict(proof_dir=proof['path'], calls=proof['collection'].get('calls'),
                    failures=len(failures) if isinstance(failures, list) else failures,
                    controls=len(controls), controls_exact=exact)


def _witness_bound_not_run(name, sites, specs, shared, tries, shared_tries, accepted_calls,
                           proofs, shared_proofs, family):
    """The witness_bound_not_run justification for a NOT_RUN row, or None (ruling 2026-11-17)."""
    if not specs or not sites or accepted_calls:
        return None
    if any(spec.get('status') not in ('UNPROVED', 'NOT_RUN') for spec in specs):
        return None
    if any(spec.get('table_status') != 'NOT_RUN' or spec.get('table_reason') not in NOT_RUN_REASONS
           for spec in specs):
        return None
    if any(spec.get('status') == 'FAIL' or spec.get('table_status') == 'FAIL' for spec in shared['specs']):
        return None
    witness = _exact_witness(tries, name)
    shared_cite = False
    if witness is None and shared['valid']:
        witness = _exact_witness(shared_tries, name)
        shared_cite = witness is not None
    if witness is None:
        return None
    by_dir = {proof['path']: proof for proof in proofs + shared_proofs}
    witness_proof = by_dir.get(witness.get('_dg5_proof_dir'))
    if witness_proof is None:
        return None
    structural = []
    for path, line in sites:
        bound = _site_structure(path, line)
        if bound is None or bound['file_sha256'] != witness_proof['bindings'].get(path):
            return None
        structural.append(bound)
    replay, total_controls = [], 0
    for proof in proofs:
        if name not in proof['family_rows'].get(family, []) and \
                not any(r.get('family') == family for r in proof['ledger']):
            continue
        ok, entry = _replay_entry(proof, family)
        if not ok:
            return None
        replay.append(entry)
        total_controls += entry['controls']
    if not replay or not total_controls:
        return None
    if all(entry['proof_dir'] != witness_proof['path'] for entry in replay):
        ok, entry = _replay_entry(witness_proof, witness.get('family'))
        if not ok:
            return None
        replay.append(entry)
    return dict(
        kind='witness_bound_not_run',
        ruling='RULING-single-vector-20261117.md sha256 '
               '6b57a3e42182bdcb76f0e093eea0289ef1493d5324d2538cb50d3b72d5d6cc95',
        structural=structural,
        witness=dict(_witness(witness), kill='KILLED', cut_errors=witness.get('cut_errors'),
                     restoration=dict(errors=witness.get('restoration_errors'), same_refusal=True),
                     shared_cite=shared_cite),
        table_reasons=[dict(proof_dir=spec.get('proof_dir'), table=spec.get('table'),
                            status=spec.get('table_status'), reason=spec.get('table_reason'))
                       for spec in specs],
        family_accepted_calls=0, replay=replay, depends_on=[],
        claim='Every site is reached only on an already-failing input (bad-branch kind recorded '
              'per site, bound to the witness proof source bytes) and was never evaluated in an '
              'accepted family call; the exact KILLED witness refuses only at this row, its cut '
              'accepts, and its restoration repeats the refusal; the gated table did not run for '
              'the recorded reason, so no gated PASS is claimed.')


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
                              table_reason=table.get('reason'),
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
    parser.add_argument('--row-proof', action='append', type=Path, default=[],
                        help='targeted proof directory for specific rows, without family replay credit')
    parser.add_argument('--shared-proof', action='append', type=Path, default=[],
                        help='shared-adapter proof directory whose kills may be cited for shared rows')
    parser.add_argument('--root-inventory', action='append', type=Path, default=[],
                        help='exact assertion inventory reports that bind legacy closure evidence')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    import pm_goal_dg5_justified as justified
    family_proofs = [load_proof(path, index) for index, path in enumerate(args.proof)]
    proofs = family_proofs + [load_proof(path, index)
                              for index, path in enumerate(args.row_proof, len(family_proofs))]
    shared_proofs = [load_proof(path, index) for index, path in enumerate(args.shared_proof)]
    closure = load_closure(args.closure, args.root_inventory)
    out = dict(schema_id='pm.pnc019.c12_dg5.coverage_matrix.v1', proof_dir=str(args.proof[0]),
               proof_dirs=[str(path) for path in args.proof],
               shared_proof_dirs=[str(path) for path in args.shared_proof], families={},
               rule=__doc__.split('\n\n')[2])
    if args.row_proof:
        out['row_proof_dirs'] = [str(path) for path in args.row_proof]
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
                                      table_reason=table.get('reason'),
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
            bound = None
            if proof_record is None and not site_conflict:
                replay_tries = [r for r in tries if r['_dg5_proof_index'] < len(family_proofs)]
                bound = _witness_bound_not_run(name, sites, specs, shared, replay_tries, shared_tries,
                                               controls.get(name, 0), family_proofs, shared_proofs, family)
            if site_conflict:
                status, reason = 'OPEN', 'conflicting collection sites across proof directories'
            elif effective_gated == 'PASS' and (killed or shared_killed):
                status, reason = 'CLOSED', None
            elif proof_record and (effective_gated in ('PASS', 'NOT_RUN') or
                                   (effective_gated == 'UNPROVED' and specs and
                                    all(spec.get('table_status') in ('NOT_RUN', 'PASS') for spec in specs))):
                # A NOT_RUN table means the gated tool had no control/single-row vector to
                # run on (single-outcome sites), not a disagreement; GH1 rows.json maps it
                # to row status UNPROVED with table_status NOT_RUN. Proofs close such rows
                # as in pm_goal_c12_matrix and pm_goal_go_matrix; FAIL tables never close.
                status, reason = 'CLOSED_BY_PROOF', proof_record['kind']
            elif bound is not None:
                status, reason = 'CLOSED_BY_PROOF', 'witness_bound_not_run'
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
                if status != 'OPEN':
                    if not roots:
                        status, reason = 'OPEN', 'no clause-closure report for its roots'
                    elif schema['errors']:
                        status, reason = 'OPEN', 'clause closure reports have root errors'
                    elif schema['uncovered']:
                        status, reason = 'OPEN', 'clause closure leaves %d uncovered' % schema['uncovered']
            predicate = dict(table=row.get('table'), gated=gated, effective_gated=effective_gated,
                             proof_dir=row.get('proof_dir'), table_status=table.get('status'),
                             table_reason=row.get('table_reason'),
                             table_rows=len(table.get('rows', [])),
                             sites=[dict(path=p, line=l, source=line_text(p, l)) for p, l in sites[:4]])
            if len(proofs) > 1 or shared_proofs:
                predicate['sources'] = [dict(table=spec.get('table'), gated=spec.get('status'),
                                             proof_dir=spec.get('proof_dir'),
                                             table_status=spec.get('table_status'),
                                             table_reason=spec.get('table_reason'),
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
                justification=proof_record if proof_record is not None else bound,
                schema_closure=schema, kills=dict(kills))
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
            witness_bound_not_run=sum(1 for m in matrix if m['status'] == 'CLOSED_BY_PROOF'
                                      and (m['justification'] or {}).get('kind') == 'witness_bound_not_run'),
            schema_rows=sum(1 for m in matrix if m['row'].endswith('/schema')),
            checker_rows=sum(1 for m in matrix if not m['row'].endswith('/schema')),
            open=[dict(row=m['row'], reason=m['reason']) for m in matrix if m['status'] == 'OPEN'],
            matrix=matrix)
    args.out.write_text(json.dumps(out, indent=1, default=list) + '\n')
    print(json.dumps({f: dict(rows=v['rows'], status=v['status'], open=len(v['open']),
                              witness_bound_not_run=v['witness_bound_not_run'])
                      for f, v in out['families'].items()}, indent=1))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

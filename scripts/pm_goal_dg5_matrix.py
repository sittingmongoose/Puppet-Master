#!/usr/bin/env python3
"""C12-DG5 per-family coverage matrix from a DG5 proof directory (GH1's matrix rule, DG5 rows).

One entry per row the family's complete calls evaluate:
  owner clause -> predicate (phase table, gated status on 004bdedd63, sites)
  -> control (accepted complete calls of the family) -> negative (declared-target
  attempts by outcome, best exact witness) -> cut -> restoration.

Status (GH1): CLOSED = gated PASS and a KILLED, DUPLICATE_SET_KILLED or KILLED_CODE witness of
this family (KILLED_CODE, addendum 1 = pm-ea-lead 1121124828-43f4 (1), is counted apart in
`kills`, in the entry's `closed_by` and in the family's `closed_by` tally) (or a byte-identical cited shared witness under --shared-proof);
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
family call; and the family's whole-source pass-2 replay is cited with every
control exact and no failure. A FAIL table never qualifies, and where a
family table has a control and a single-row vector the normal gated rule
applies instead. Per-family counts of the class are reported separately.

Amendment 1 (pm-ea-lead 2026-11-21 9:39 PM EST), for rows of the shared-adapter shape
(a NOT_RUN table with no control vector whose row is a refusal line reached only after
failure), reads conditions 2 and 4 as follows, and nothing wider:
  * Condition 2 also accepts a KILLED_CODE witness when its recorded kill shows
    Addendum J2 in full -- the declared target is the row's own guard with its own
    code, the intact run is exact, with only that guard cut the call refuses with a
    different owner refusal code, and the uncached restoration repeats the intact
    result -- and the row records both codes. COVERED_LATER, CUT_EXCEPTION,
    duplicate-set-only and exception kills still never qualify.
  * Condition 4 also accepts a replay that carries one exact declared known
    failure, recorded as one data entry [source, case id, refusal code] in a
    --known-failure data file and matched exactly in the failed source's details,
    when that failure's case touches none of the row's own site and bytes. Any
    other failure, a second failure, or an undeclared one still fails the
    condition, and every control other than that case's own case must be exact.
    A control is every family record the judge marked valid=True; it is exact
    only when its outcome is `control` with no errors (an exception or any other
    outcome spelling, and a refused control with empty errors, are not exact).
    The one exempt control is the known failure's own case, matched by
    [component, case id] together against the label's
    `adapter/<component>/<case>/<entry>` parts; a case id is matched as a whole
    label sub-path (one or more consecutive whole segments, so a real id
    containing '/' matches), never a substring. "Touches" includes any ledger
    record of that case that evaluated or refused at this row (errors, failing,
    refusing sites, restoration_errors, cut_errors, signatures), any code the
    row's tries or witness recorded (refusal codes and every killed_code_check
    intact, cut and restoration code), a code that case's own ledger records
    emitted, and a suite component or module that maps to a row site file.
  * Both readings apply only when every table of the row -- the family tables
    and every cited shared proof's table included -- is NOT_RUN with reason
    `no control vector`. A `no single-row vector` table keeps the unamended
    condition 2 (an exact KILLED witness) and condition 4 (failures 0).

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
       [--shared-proof SHARED_PROOF_DIR ...] [--known-failure FILE ...] --out matrix.json
"""
import argparse
import ast
import collections
import gzip
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Kill classes that close a row (KILLED_CODE is reported apart: entry `closed_by`, family `closed_by`).
KILL_CLASSES = ('KILLED', 'DUPLICATE_SET_KILLED', 'KILLED_CODE')


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
                                          r.get('kill') != 'KILLED_CODE',
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


def _killed_code_codes(record, name):
    """Amendment 1 condition 2: both codes of a J2-complete KILLED_CODE witness, or None.

    The judge records the check it ran (`killed_code_check`); this re-reads it against
    Addendum J2's four terms, so a bare `kill: KILLED_CODE` label never credits alone.
    """
    if record.get('target') != name:
        return None
    check = record.get('killed_code_check')
    if not isinstance(check, dict) or check.get('verdict') != 'KILLED_CODE':
        return None
    own = check.get('own_guard')
    if not isinstance(own, dict) or own.get('own') is not True or own.get('code_matches') is not True:
        return None
    intact, cut = check.get('intact_code'), check.get('cut_code')
    if check.get('intact_code') != record.get('refusal_code'):
        return None
    if check.get('different_code') is not True or check.get('restoration_code') != intact:
        return None
    if not all(isinstance(code, str) and code and not code.startswith('crash:')
               for code in (intact, cut, check.get('restoration_code'))):
        return None
    if cut == intact:
        return None
    if own.get('row') not in (None, name) or own.get('code') not in (None, intact):
        return None
    if record.get('cut_exception_site'):
        return None
    cut_errors = record.get('cut_errors')
    if not isinstance(cut_errors, list) or not cut_errors or name in cut_errors:
        return None
    return dict(intact_code=intact, cut_code=cut, restoration_code=check.get('restoration_code'))


def _exact_witness(records, name, allow_killed_code=True):
    """The row's exact witness under condition 2 as amended, or None.

    KILLED (the cut accepts) and, under Amendment 1, KILLED_CODE (the cut refuses with a
    different owner refusal code) qualify; a KILLED_CODE record qualifies only when its
    recorded kill shows Addendum J2 in full and both codes are on the record.
    Returns (record, codes-or-None) or None.
    """
    good = []
    for record in records:
        kill = record.get('kill')
        if kill not in ('KILLED', 'KILLED_CODE') or record.get('outcome') != 'exact_expected':
            continue
        if name not in (record.get('errors') or []):
            continue
        if record.get('restoration_errors') != record.get('errors'):
            continue
        cuts = record.get('site_cuts')
        if cuts and cuts != {name: [name]}:
            continue
        if kill == 'KILLED':
            if record.get('cut_errors'):
                continue
            codes = None
        else:
            if not allow_killed_code:
                continue
            codes = _killed_code_codes(record, name)
            if codes is None:
                continue
        good.append((record, codes))
    good.sort(key=lambda pair: (pair[0].get('_dg5_proof_index', 0), str(pair[0].get('id'))))
    return good[0] if good else None


def _closure_source(name, family, killed, witness, shared_killed, shared_witness, specs, shared,
                    proof_reviews, review_registry, closed_rows):
    """G3 (pm-ea-lead 1124043618): the id of the record that closes a CLOSED row.

    A credited kill record of the row's own family (its witness trial), an own probe table with a
    recorded vector and a PASS, or two SOUND same-family live review ids. A shared-adapter citation
    alone is not a source: it is another family's record, and it is what closed the gate-path rows.
    """
    if killed and isinstance(witness, dict) and witness.get('label'):
        return dict(kind='kill-trial', id=witness.get('label'), path=witness.get('proof_dir'),
                    outcome=witness.get('outcome'), input_sha256=witness.get('input_sha256'))
    for spec in specs:
        if spec.get('status') == 'PASS' and spec.get('table_status') == 'PASS' \
                and (spec.get('table_rows') or 0) >= 1:
            return dict(kind='probe-table', id=spec.get('table'), path=spec.get('proof_dir'),
                        table_status=spec.get('table_status'), table_rows=spec.get('table_rows'))
    credit = proof_reviews.row_credit(family, name, review_registry, closed_rows)
    if credit is not None:
        return dict(kind='two-sound-reads', id=credit.get('entry'),
                    readings=credit.get('credit_readings'))
    return None


def _label_parts(label):
    """The slash-separated parts of a ledger label (`adapter/<component>/<case>/<entry>`)."""
    return [part for part in str(label or '').split('/') if part]


def _label_carries(label, case):
    """True when `case` is the whole label or a whole sub-path of it: one or more
    consecutive whole '/'-separated segments, never a substring. A real case id may
    itself contain '/' (`frame_fixture/magic`), and then matches only as that sub-path."""
    if not case:
        return False
    if str(label) == case:
        return True
    parts = _label_parts(label)
    case_parts = [part for part in case.split('/') if part]
    if not case_parts:
        return False
    n = len(case_parts)
    return any(parts[i:i + n] == case_parts for i in range(len(parts) - n + 1))


def _label_case(label):
    """The (component, case id) an `adapter/<component>/<case>/<entry>` label carries,
    or None for any other shape. The case id is every segment between the component
    and the final entry segment, so a multi-segment case id stays one id."""
    parts = _label_parts(label)
    if len(parts) < 4 or parts[0] != 'adapter':
        return None
    return parts[1], '/'.join(parts[2:-1])


def _known_failure_entry(value):
    """One declared known failure's data entry: [source, case id, refusal code]."""
    return (isinstance(value, (list, tuple)) and len(value) == 3
            and all(isinstance(part, str) and part for part in value))


def load_known_failures(paths):
    """Declared known failures from --known-failure files (JSON list of exact triples)."""
    declared = []
    for path in paths:
        try:
            data = json.loads(Path(path).read_text())
        except (OSError, ValueError) as error:
            raise SystemExit(f'--known-failure {path}: {error}')
        if not isinstance(data, list) or not all(_known_failure_entry(entry) for entry in data):
            raise SystemExit(f'--known-failure {path}: expected a JSON list of '
                             '[source, case id, refusal code] triples')
        declared.extend(tuple(entry) for entry in data)
    return declared


def _failure_entries(failure):
    """The exact failure triples a failed source records in its details JSON."""
    details = failure.get('details')
    if isinstance(details, str):
        try:
            details = json.loads(details)
        except ValueError:
            return None
    if not isinstance(details, dict):
        return None
    entries = details.get('failures')
    return entries if isinstance(entries, list) else None


def _replay_entry(proof, family, declared=()):
    """Pass-2 replay citation for one proof directory (ruling condition 4 as amended).

    The replay must have every control exact and either no failure or exactly one
    `source_failed` whose details hold exactly one declared triple (Amendment 1).
    A control is every family record the judge marked valid=True; it is exact only
    when its outcome is 'control' with no errors. The one exempt control is the known
    failure's own case: its label must carry the declared [component, case id]
    together in the `adapter/<component>/<case>/<entry>` parts.
    """
    controls = [r for r in proof['ledger']
                if r.get('family') == family and r.get('valid') is True]
    failures = proof['collection'].get('failures')
    known = None
    if isinstance(failures, list) and len(failures) == 1:
        failure = failures[0]
        entries = _failure_entries(failure)
        if (failure.get('kind') == 'source_failed' and entries is not None and len(entries) == 1
                and _known_failure_entry(entries[0]) and tuple(entries[0]) in set(map(tuple, declared))):
            known = dict(entry=list(entries[0]), kind=failure.get('kind'), source=failure.get('source'))
    known_case = (known['entry'][0], known['entry'][1]) if known else None
    exact = all((r.get('outcome') == 'control' and not r.get('errors'))
                or (known_case is not None and _label_case(r.get('label')) == known_case)
                for r in controls)
    ok = (failures == [] or known is not None) and exact
    return ok, dict(proof_dir=proof['path'], calls=proof['collection'].get('calls'),
                    failures=len(failures) if isinstance(failures, list) else failures,
                    controls=len(controls), controls_exact=exact, known_failure=known)


def _known_failure_touches(entry, name, sites, tries, witness, module=None, proofs=()):
    """Why the declared known failure touches this row's own site/bytes, or None (Amendment 1).

    One data entry has only the source component, case id and refusal code, so "touches"
    is read from everything the row itself records: the case must not be one of its
    attempts, its witness, or any ledger record that evaluated or refused at this row
    (errors, failing, refusing sites, restoration_errors, cut_errors, signatures); its
    code must not be a code the row refused with (any try's or the witness's refusal
    code or killed_code_check intact, cut or restoration code); the case's own ledger
    records must not emit a code recorded at this row; and neither the case nor the
    code may occur in the bytes of a row site file. A suite component or failing module
    that maps to a row site file also touches it.
    """
    source, case, code = entry
    labels = [r.get('label') for r in tries if r.get('label')]
    if witness is not None and witness.get('label'):
        labels.append(witness['label'])
    if any(_label_carries(label, case) for label in labels):
        return 'its case is a recorded attempt at this row'
    if code == name:
        return 'its refusal code names this row'
    codes = {r.get('refusal_code') for r in tries if r.get('refusal_code')}
    if witness is not None and witness.get('refusal_code'):
        codes.add(witness['refusal_code'])
    for record in list(tries) + ([witness] if witness is not None else []):
        check = record.get('killed_code_check')
        if isinstance(check, dict):
            codes.update(code for code in (check.get('intact_code'), check.get('cut_code'),
                                           check.get('restoration_code')) if code)
    if code in codes:
        return 'its refusal code is a code recorded at this row'
    for path, _line in sites:
        names = (Path(path).name, Path(path).stem, Path(path).stem[len('pm_goal_test_'):]
                 if Path(path).stem.startswith('pm_goal_test_') else Path(path).stem)
        if module and module in names:
            return 'its failing module names the row site file'
        if source in names:
            return 'its source names the row site file'
        try:
            text = (ROOT / path).read_text(errors='replace')
        except OSError:
            text = ''
        if case in text or code in text:
            return 'its case or code occurs in the row site file bytes'
    for proof in proofs:
        for record in proof['ledger']:
            if not _label_carries(record.get('label'), case):
                continue
            refusing = [item[0] if isinstance(item, (list, tuple)) and item else item
                        for item in (record.get('refusing_sites') or [])]
            restoration_errors = record.get('restoration_errors')
            cut_errors = record.get('cut_errors')
            if name in (record.get('errors') or []) or name in (record.get('failing') or []) \
                    or name in refusing \
                    or (isinstance(restoration_errors, list) and name in restoration_errors) \
                    or (isinstance(cut_errors, list) and name in cut_errors):
                return 'its case refused at this row in the recorded ledger'
            sig = record.get('sig')
            if isinstance(sig, int) and 0 <= sig < len(proof['signatures']) \
                    and name in proof['signatures'][sig]:
                return 'its case was evaluated at this row in the recorded ledger'
            record_codes = {record.get('refusal_code')} if record.get('refusal_code') else set()
            check = record.get('killed_code_check')
            if isinstance(check, dict):
                record_codes.update(code for code in (check.get('intact_code'), check.get('cut_code'),
                                                      check.get('restoration_code')) if code)
            if record_codes & codes:
                return 'its case emitted a code recorded at this row'
    return None


def _witness_bound_not_run(name, sites, specs, shared, tries, shared_tries, accepted_calls,
                           proofs, shared_proofs, family, declared):
    """The witness_bound_not_run justification for a NOT_RUN row, or None (ruling 2026-11-17
    as amended by Amendment 1)."""
    if not specs or not sites or accepted_calls:
        return None
    if any(spec.get('status') not in ('UNPROVED', 'NOT_RUN') for spec in specs):
        return None
    if any(spec.get('table_status') != 'NOT_RUN' or spec.get('table_reason') not in NOT_RUN_REASONS
           for spec in specs):
        return None
    if any(spec.get('status') == 'FAIL' or spec.get('table_status') == 'FAIL' for spec in shared['specs']):
        return None
    # Amendment 1 is limited to the shape it names: a NOT_RUN table with no control vector.
    # Every table the row uses counts, the cited shared proofs' tables included (F5).
    amended = all(spec.get('table_reason') == 'no control vector' for spec in specs + shared['specs'])
    witness_pair = _exact_witness(tries, name, allow_killed_code=amended)
    shared_cite = False
    if witness_pair is None and shared['valid']:
        witness_pair = _exact_witness(shared_tries, name, allow_killed_code=amended)
        shared_cite = witness_pair is not None
    if witness_pair is None:
        return None
    witness, codes = witness_pair
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
        ok, entry = _replay_entry(proof, family, declared if amended else ())
        if not ok:
            return None
        replay.append(entry)
        total_controls += entry['controls']
    if not replay or not total_controls:
        return None
    if all(entry['proof_dir'] != witness_proof['path'] for entry in replay):
        ok, entry = _replay_entry(witness_proof, witness.get('family'), declared if amended else ())
        if not ok:
            return None
        replay.append(entry)
    known_used = []
    for entry in replay:
        known = entry.get('known_failure')
        if not known:
            continue
        triple = tuple(known['entry'])
        if triple not in known_used:
            known_used.append(triple)
        touches = _known_failure_touches(triple, name, sites, tries + shared_tries, witness,
                                         known.get('source'), proofs + shared_proofs)
        if touches is not None:
            return None
    if len(known_used) > 1:
        return None
    return dict(
        kind='witness_bound_not_run',
        ruling='RULING-single-vector-20261117.md sha256 '
               '6b57a3e42182bdcb76f0e093eea0289ef1493d5324d2538cb50d3b72d5d6cc95',
        amendment='RULING-single-vector-20261117.md Amendment 1 (pm-ea-lead 2026-11-21), '
                  'conditions 2 and 4 as amended',
        structural=structural,
        witness=dict(_witness(witness), kill=witness.get('kill'), codes=codes,
                     cut_errors=witness.get('cut_errors'),
                     restoration=dict(errors=witness.get('restoration_errors'), same_refusal=True),
                     shared_cite=shared_cite),
        table_reasons=[dict(proof_dir=spec.get('proof_dir'), table=spec.get('table'),
                            status=spec.get('table_status'), reason=spec.get('table_reason'))
                       for spec in specs],
        known_failures=[list(triple) for triple in known_used],
        family_accepted_calls=0, replay=replay, depends_on=[],
        claim='Every site is reached only on an already-failing input (bad-branch kind recorded '
              'per site, bound to the witness proof source bytes) and was never evaluated in an '
              'accepted family call; the exact witness refuses only at this row and its '
              'restoration repeats the refusal -- its cut accepts (KILLED) or, under Amendment 1, '
              'its recorded kill shows Addendum J2 in full (KILLED_CODE: with only that guard cut '
              'the call refuses with a different owner code, both codes are recorded, and the '
              'uncached restoration repeats the intact result); the gated table did not run for '
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
    parser.add_argument('--known-failure', action='append', type=Path, default=[],
                        help='JSON list of declared [source, case id, refusal code] failures a '
                             'family replay may carry (Amendment 1, condition 4)')
    parser.add_argument('--check', action='store_true',
                        help='exit 3 when any row is PENDING_READ (G1: no CLOSED_BY_PROOF without '
                             'two SOUND readings; G2: a proof credits only its own family)')
    parser.add_argument('--review-registry', type=Path, default=None,
                        help='review-id registry (default scripts/dg5_proof_reviews/registry.json)')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    import pm_goal_dg5_justified as justified
    import pm_goal_dg5_proof_reviews as proof_reviews
    review_registry = proof_reviews.load(args.review_registry)
    declared = load_known_failures(args.known_failure)
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
    if args.known_failure:
        out['known_failure_files'] = [str(path) for path in args.known_failure]
        out['known_failures'] = [list(entry) for entry in declared]
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
        pending_reads = []
        credited_reads = {}
        closure_sources = {}
        deferred = []
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
            killed = any(r.get('kill') in KILL_CLASSES for r in tries)
            gated = _effective_gated(specs)
            shared = _shared_citation(shared_proofs, proofs, name, sites) if shared_proofs else \
                dict(valid=False, reason=None, records=[], gated=None, specs=[])
            shared_tries = shared['records'] if shared['valid'] else []
            shared_killed = any(r.get('kill') in KILL_CLASSES for r in shared_tries)
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
                                               controls.get(name, 0), family_proofs, shared_proofs, family,
                                               declared)
            if site_conflict:
                status, reason = 'OPEN', 'conflicting collection sites across proof directories'
            elif effective_gated == 'PASS' and (killed or shared_killed):
                # G3: a CLOSED row needs a source id. `killed` is an own-family trial; when only
                # `shared_killed` holds, the gate came from another family's proof directory and the
                # row has no record of its own (the gate-path closure). No id -> PENDING_READ.
                source = _closure_source(name, family, killed, witness, shared_killed, shared_witness,
                                         specs, shared, proof_reviews, review_registry,
                                         {m['row'] for m in matrix if m['status'] == 'CLOSED'})
                if source is None:
                    status, reason = 'PENDING_READ', (
                        'no_closure_source: no own-family kill record id, no own PASS table vector, '
                        'no two SOUND review ids (shared kill only: %s)' % bool(shared_killed))
                    pending_reads.append(dict(row=name, family=family, module=None, reason=reason,
                                              details=dict(killed=bool(killed), shared_killed=bool(shared_killed),
                                                           gated=gated, effective_gated=effective_gated,
                                                           table_status=(specs[0].get('table_status') if specs else None),
                                                           shared_gated=shared.get('gated'))))
                else:
                    closure_sources[name] = source
                    if source.get('kind') == 'two-sound-reads':
                        # (b) v9.1: a row whose closure source is two SOUND reads is a proof
                        # closure, not a kill: CLOSED_BY_PROOF, kind two-sound-reads, review_ids.
                        status, reason = 'CLOSED_BY_PROOF', None
                        closed_by = None
                        credited_reads[name] = source.get('readings')
                    else:
                        status, reason = 'CLOSED', None
                        credited = {r.get('kill') for r in list(tries) + list(shared_tries)} & set(KILL_CLASSES)
                        closed_by = 'KILLED_CODE' if credited == {'KILLED_CODE'} else 'KILLED'

            elif proof_record and (effective_gated in ('PASS', 'NOT_RUN') or
                                   (effective_gated == 'UNPROVED' and specs and
                                    all(spec.get('table_status') in ('NOT_RUN', 'PASS') for spec in specs))):
                # A NOT_RUN table means the gated tool had no control/single-row vector to
                # run on (single-outcome sites), not a disagreement; GH1 rows.json maps it
                # to row status UNPROVED with table_status NOT_RUN. Proofs close such rows
                # as in pm_goal_c12_matrix and pm_goal_go_matrix; FAIL tables never close.
                #
                # G1/G2 (WRONGFAM-GUARDS, 2026-11-24): never self-mark. Credit needs two SOUND
                # readings of THIS entry's live text (rule 1) and those readings must have judged
                # THIS row's family (a proof credits only the family it was written for).
                # B2 (v9): the deferral gate uses the union of the head module list and the
                # registry entry's full depends_on (errata + lead additions + packet additions),
                # the same list credit_decision decides on.
                entry = review_registry['entries'].get(
                    proof_reviews.key(proof_record.get('module'), name)) if proof_record.get('module') else None
                deps = list(dict.fromkeys(list(proof_record.get('depends_on') or []) +
                                          list((entry or {}).get('depends_on') or [])))
                if deps:
                    # Rule 4: decided after the family fixpoint has the final CLOSED set.
                    deferred.append(dict(name=name, proof=proof_record, deps=deps))
                    status, reason = 'PENDING_READ', 'dependency_pending: ' + ', '.join(deps)
                    pending_reads.append(dict(row=name, family=family, module=proof_record.get('module'),
                                              reason=reason, details=dict(depends_on=deps)))
                else:
                    decision = proof_reviews.credit_decision(family, name, proof_record, review_registry,
                                                             closed_rows=set())
                    if decision['credit']:
                        status, reason = 'CLOSED_BY_PROOF', proof_record['kind']
                        credited_reads[name] = decision['details'].get('credit_readings')
                    else:
                        status, reason = 'PENDING_READ', decision['reason']
                        pending_reads.append(dict(row=name, family=family, module=proof_record.get('module'),
                                                  reason=decision['reason'], details=decision['details']))
            elif bound is not None:
                # A witness-bound-not-run row has no written proof entry, so no entry text can
                # carry two SOUND readings: G1 refuses the self-mark. Addendum 8 already says
                # this class is not credit.
                status, reason = 'PENDING_READ', 'witness_bound_not_run: no written proof entry to read'
                pending_reads.append(dict(row=name, family=family, module=None,
                                          reason=reason, details=dict(bound=bool(bound))))
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
                schema_closure=schema, kills=dict(kills),
                closed_by=closed_by if status == 'CLOSED' else None,
                closure_source=closure_sources.get(name) if status in ('CLOSED', 'CLOSED_BY_PROOF') else None,
                review_ids=credited_reads.get(name) if status == 'CLOSED_BY_PROOF' else None)
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
        # Rule 4 for proof rows: every dependency must be CLOSED in the family. The deferred rows
        # are decided here, where the family's final CLOSED set is known.
        by_row = {m['row']: m for m in matrix}
        for item in deferred:
            decision = proof_reviews.credit_decision(family, item['name'], item['proof'], review_registry,
                                                     closed_rows=closed)
            row_record = by_row[item['name']]
            entry = next((p for p in pending_reads if p['row'] == item['name']), None)
            if decision['credit']:
                # (a) v9.1: re-apply the schema clause-closure check before promoting ANY deferred
                # row. The per-row check ran before the rule-4 decision; a deferred promotion must
                # not skip it (a schema row with uncovered clauses or root errors stays OPEN).
                blocked = None
                if item['name'].endswith('/schema'):
                    sc = row_record.get('schema_closure') or dict(roots=[], errors=[], uncovered=0)
                    if not sc['roots']:
                        blocked = 'no clause-closure report for its roots'
                    elif sc['errors']:
                        blocked = 'clause closure reports have root errors'
                    elif sc['uncovered']:
                        blocked = 'clause closure leaves %d uncovered' % sc['uncovered']
                if blocked is not None:
                    row_record['status'], row_record['reason'] = 'OPEN', blocked
                else:
                    row_record['status'], row_record['reason'] = 'CLOSED_BY_PROOF', item['proof']['kind']
                    credited_reads[item['name']] = decision['details'].get('credit_readings')
                    row_record['review_ids'] = credited_reads[item['name']]
                if entry is not None:
                    pending_reads.remove(entry)
            elif str(decision['reason']).startswith('dependency_'):
                # Rule 4 with an unc losed dependency is the edition's OPEN state, not a pending read
                # (head's fixpoint uses the same wording for its candidates).
                row_record['status'] = 'OPEN'
                row_record['reason'] = 'justification dependency not closed: ' + ', '.join(
                    [d for d in item['deps'] if d not in closed])
                if entry is not None:
                    pending_reads.remove(entry)
            else:
                row_record['status'] = 'PENDING_READ'
                row_record['reason'] = decision['reason']
                if entry is not None:
                    entry['reason'] = decision['reason']
                    entry['details'] = decision['details']
        # Rule 4 for G3's two-sound-reads source: re-check with the final CLOSED set.
        for row_name, source in list(closure_sources.items()):
            if source.get('kind') != 'two-sound-reads':
                continue
            credit = proof_reviews.row_credit(family, row_name, review_registry, closed)
            if credit is None:
                row_record = by_row[row_name]
                row_record['status'] = 'PENDING_READ'
                row_record['review_ids'] = None
                row_record['reason'] = 'dependency_not_closed_or_unknown: the two-sound-reads source ' \
                                       'does not hold with the final CLOSED set'
                row_record['closure_source'] = None
                closure_sources.pop(row_name, None)
                pending_reads.append(dict(row=row_name, family=family, module=None,
                                          reason=row_record['reason'], details={}))
            else:
                source = dict(by_row[row_name].get('closure_source') or {})
                source.update(kind='two-sound-reads')
                source['id'] = source.get('id') or credit.get('entry')
                source['readings'] = credit.get('credit_readings')
                by_row[row_name]['closure_source'] = source
        summary = collections.Counter(m['status'] for m in matrix)
        closed_by_tally = dict(collections.Counter(m['closed_by'] for m in matrix if m['status'] == 'CLOSED'))
        out['families'][family] = dict(rows=len(matrix), status=dict(summary), closed_by=closed_by_tally,
            witness_bound_not_run=sum(1 for m in matrix
                                      if (m['justification'] or {}).get('kind') == 'witness_bound_not_run'),
            pending_reads=pending_reads,
            schema_rows=sum(1 for m in matrix if m['row'].endswith('/schema')),
            checker_rows=sum(1 for m in matrix if not m['row'].endswith('/schema')),
            open=[dict(row=m['row'], reason=m['reason']) for m in matrix if m['status'] == 'OPEN'],
            matrix=matrix)
    args.out.write_text(json.dumps(out, indent=1, default=list) + '\n')
    print(json.dumps({f: dict(rows=v['rows'], status=v['status'], closed_by=v['closed_by'], open=len(v['open']),
                              witness_bound_not_run=v['witness_bound_not_run'],
                              pending_read=len(v['pending_reads']))
                      for f, v in out['families'].items()}, indent=1))
    pending = [(family, item) for family, v in out['families'].items() for item in v['pending_reads']]
    if pending:
        for family, item in pending:
            print('PENDING_READ %s %s: %s' % (family, item['row'], item['reason']), file=sys.stderr)
    if args.check and pending:
        print('%d row(s) PENDING_READ: no CLOSED_BY_PROOF without two SOUND readings of the live entry '
              'text in the row family (G1) and a proof family that is the row family (G2); no CLOSED '
              'without a source id — own kill record, own PASS table vector, or two SOUND review ids (G3).'
              % len(pending), file=sys.stderr)
        return 3
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

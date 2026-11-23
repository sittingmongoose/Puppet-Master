#!/usr/bin/env python3
"""goal.cancelled documented-gap edition v1 of the C12-DG5 coverage matrix (Plans/Decision_Log.md#DL-2600).

Jared answered card E-GC-GAP with option B on 2026-11-22. This edition runs LAST: after the current
builder (scripts/pm_goal_dg5_matrix.py), any correction chain and every admission or intake tool, on the
final family matrix they wrote. The goal.cancelled admission tool must never run on its output (it skips
rows that are not OPEN in the prior matrix, so it would freeze this row), and the edition refuses a matrix
it has already been applied to. It changes exactly one row: family goal.cancelled, row dg5/roots/schema.
It never edits the builder, never changes any other row or family, and relaxes nothing else. A
DOCUMENTED_GAP row is a named, reopenable gap, not coverage.

The gap (the signed list's definition, word for word, GAP_DEFINITION): clauses left UNCOVERED by a
completed, search-exhausted walk on this row (section A), and the named slow-root remainder, root 109
(section B). Roots never walked are not in it.

The row becomes DOCUMENTED_GAP only when all four conditions hold:
  1. The signed gap list verifies: the sha256 of its SHA256SUMS equals the pin in GAP_LIST_PINS; every
     file SHA256SUMS lists exists and matches; the list names exactly family goal.cancelled, row
     dg5/roots/schema, the gap definition and the reopen rule word for word; every entry is well formed
     (canonical key, section A, B or T371, an allowed mark, raw ids that are absolute URIs carrying the
     entry's canonical fragment, and sources that each name one of the entry's raw ids and roots); an A
     or B entry's roots are exactly its roots_uncovered plus roots_unsearched; only root 109 is ever
     unsearched; a B entry names root 109 alone; no (raw id, root) occurrence is in two entries; and its
     root census names every root bound to the row once, with a known status, root 109 included, and
     every root an A entry lists as uncovered is EXHAUSTED there. The JSON is parsed from the very bytes
     that were hashed.
  2. The builder's verdict for the row is OPEN with reason exactly 'clause closure leaves N uncovered'
     (written only after the row's checker verdict closed, its roots exist and no root has an error),
     and its schema_closure agrees (N = the roots' uncovered counts = their clause lists' lengths, no
     root error, every root bound to goal.cancelled and carried by a clause-closure report). The row
     carries EVERY root of the signed list's census except root 109, each with a completed walk (a
     clause-closure report and no root error), and no root outside the census. A matrix that leaves a
     census root out (the builder omits a root nobody supplied) or adds a root the census does not
     know stays OPEN, and the note names those roots. Root 109 may be absent: its unsearched remainder
     is then reported as section B, part of the gap and never covered.
  3. The checker verdict closed under every builder edition: effective gated PASS, no site conflict, and
     a KILLED or DUPLICATE_SET_KILLED kill of this family (or of a valid shared citation). A verdict that
     could only have closed by proof is not inferred.
  4. Every UNCOVERED (root, clause) of the row is an occurrence the list records on that same root:
     either a completed walk's report left that raw id UNCOVERED on that root (A), or the raw id is in
     root 109's unsearched remainder on root 109 (B). A canonical match on another root never counts.
A matched entry with a pending mark counts, and the row reports it with its mark. Any other clause or
root keeps the row OPEN with the builder's reason. Root errors, missing reports and open checker verdicts
are untouched. A DOCUMENTED_GAP row grounds no other row's proof: the builder's least fixpoint already ran
without it, and its result is kept for every other row.

Usage:
  python3 scripts/pm_goal_dg5_matrix_gap_v1.py apply --matrix BUILT.json[.gz] --gap-list DIR \\
      [--edition v1.1] --out OUT.json[.gz]
  python3 scripts/pm_goal_dg5_matrix_gap_v1.py build --gap-list DIR [--edition v1.1] [--stock PATH] \\
      -- <pm_goal_dg5_matrix.py arguments, including --out OUT>
Exit 0: output written (the row applied or not, as reported). Exit 2: refused; nothing is written.
Self-test: python3 -B scripts/pm_goal_dg5_matrix_gap_v1_selftest.py
"""
import argparse
import collections
import gzip
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

EDITION = 'pm.pnc019.c12_dg5.documented_gap.goal_cancelled.v1'
DECISION_REF = 'Plans/Decision_Log.md#DL-2600'
FAMILY = 'goal.cancelled'
ROW = 'dg5/roots/schema'
STATUS = 'DOCUMENTED_GAP'
ROOT_109 = 'dg5:87291d8293370997'
GAP_LIST_DIR = ('/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-dg5/'
                'gap-list-v1.1-20261122')
# One reviewed pin per signed gap-list edition; a later edition is added by its own reviewed change.
GAP_LIST_PINS = {
    'v1.1': {'sums_sha256': '3080977bf01fc59d2f4be272f773c9171e4b9528e76d0442b847061fbac8f8fd',
             'json': 'GAP-LIST-v1.1.json', 'schema': 'dg5-gap-list.v1.1'},
}
DEFAULT_EDITION = 'v1.1'
GAP_DEFINITION = ('The gap is (A) clauses left UNCOVERED by a completed, search-exhausted walk on this row, and (B) the '
                  'named slow-root remainder: root 109 (dg5:87291d8293370997) clauses not yet closed by a published, '
                  'verified 109 report. Nothing else is in the gap. Roots never walked are not in it (they are tracked '
                  'in NOT-WALKED-v1.1, unsigned) and join A only when their walks complete and exhaust them.')
REOPEN_RULE = ('Any new search tool, search-tool edition or authored-case batch that could reach a listed clause '
               're-searches the list. Each verified kill, each accepted proof, and each pending mark that clears '
               'removes its entry in the next edition. An entry leaves the list only by such a published, verified '
               'result. The list never grows except by a reviewed correction.')
SECTIONS = ('A', 'B', 'T371')
CENSUS_STATUSES = ('CLOSED', 'EXHAUSTED', 'NOT COMPLETE')
MARKS = ('none', 'T360 re-run pending', 'M proof pending review', 'carry pending review', 'T371 audit pending')
KILLS = ('KILLED', 'DUPLICATE_SET_KILLED')  # the closing kill classes every builder edition shares
SCHEMA_ID = 'pm.pnc019.c12_dg5.coverage_matrix.v1'
SCHEMA_RULE = ('A whole-root schema row is CLOSED only if, in addition, every root it validates for this family '
               'has 0 UNCOVERED clauses in the DG5 clause-closure report(s).')
REASON = re.compile(r'clause closure leaves (\d+) uncovered')
ROOT_ID = re.compile(r'dg5:[0-9a-f]{16}')
HEX64 = re.compile(r'[0-9a-f]{64}')
URI_BASE = re.compile(r'(https://[^#\s]+|file:///[^#\s]+)')
SUMS_LINE = re.compile(r'([0-9a-f]{64}) [ *]([^\n/\\]+)')
EXHAUSTED, REMAINDER = 'exhausted on a completed walk', 'root 109 unsearched remainder'


class Refusal(Exception):
    """The gap list or the matrix fails a check; nothing is written."""


def _sha256(data):
    return hashlib.sha256(data).hexdigest()


def tool_sha256():
    return _sha256(Path(__file__).read_bytes())


# ---------------------------------------------------------------- gap list

def load_gap_list(directory, edition=DEFAULT_EDITION, pin=None):
    """Verify and index one signed gap-list edition. ``pin`` exists only for in-process checks."""
    directory = Path(directory)
    spec = GAP_LIST_PINS.get(edition)
    if spec is None:
        raise Refusal('unknown gap-list edition %r' % edition)
    expected = pin if pin is not None else spec['sums_sha256']
    if not HEX64.fullmatch(expected or ''):
        raise Refusal('gap-list edition %s has no pinned SHA256SUMS sha256' % edition)
    try:
        sums = (directory / 'SHA256SUMS').read_bytes()
    except OSError as error:
        raise Refusal('cannot read SHA256SUMS: %s' % error)
    sums_sha = _sha256(sums)
    if sums_sha != expected:
        raise Refusal('SHA256SUMS sha256 %s differs from the pinned %s' % (sums_sha, expected))
    listed, contents = {}, {}
    for number, line in enumerate(sums.decode('utf-8').splitlines(), 1):
        match = SUMS_LINE.fullmatch(line)
        if not match:
            raise Refusal('SHA256SUMS line %d is malformed' % number)
        digest, name = match.groups()
        if name in listed:
            raise Refusal('SHA256SUMS names %s twice' % name)
        try:
            data = (directory / name).read_bytes()
        except OSError as error:
            raise Refusal('SHA256SUMS names %s, which cannot be read: %s' % (name, error))
        if _sha256(data) != digest:
            raise Refusal('%s sha256 %s differs from SHA256SUMS %s' % (name, _sha256(data), digest))
        listed[name], contents[name] = digest, data
    if spec['json'] not in listed:
        raise Refusal('SHA256SUMS does not list %s' % spec['json'])
    try:
        doc = json.loads(contents[spec['json']])  # the bytes that were hashed, never a second read
    except ValueError as error:
        raise Refusal('%s is not JSON: %s' % (spec['json'], error))
    for key, want in (('schema', spec['schema']), ('family', FAMILY), ('row', ROW),
                      ('definition', GAP_DEFINITION), ('reopen_rule', REOPEN_RULE)):
        if doc.get(key) != want:
            raise Refusal('gap list %s is %r, not %r' % (key, doc.get(key), want))
    census = _load_census(doc.get('root_census'))
    entries = doc.get('entries')
    if not isinstance(entries, list) or not entries:
        raise Refusal('gap list has no entries')
    keys, index = set(), {}
    for number, item in enumerate(entries):
        _check_entry(number, item)
        if any(census.get(root) != 'EXHAUSTED' for root in item['roots_uncovered']):
            raise Refusal('entry %d lists an uncovered root the census does not show EXHAUSTED' % number)
        key = (item['canonical_id'], item['bound_sha256'], item['fragment'])
        if key in keys:
            raise Refusal('entry %d repeats canonical key %r' % (number, key))
        keys.add(key)
        for pair, kind in _occurrences(item):
            if pair in index and index[pair][0] != number:
                raise Refusal('raw id %s on root %s is in entries %d and %d' % (pair[0], pair[1], index[pair][0], number))
            index[pair] = (number, kind)
    section_b = dict(entries=sum(1 for item in entries if item['section'] == 'B'),
                     occurrences=sum(1 for kind in index.values() if kind[1] == REMAINDER))
    return dict(edition=edition, directory=str(directory), sums_sha256=sums_sha, json_sha256=listed[spec['json']],
                files=listed, generated_utc=doc.get('generated_utc'), entries=entries, index=index, census=census,
                section_b=section_b)


def _load_census(census):
    """root -> status for every root the signed list binds to the row; root 109 must be among them."""
    if not isinstance(census, list) or not census:
        raise Refusal('gap list has no root_census')
    statuses = {}
    for number, item in enumerate(census):
        root, status = (item.get('root'), item.get('status')) if isinstance(item, dict) else (None, None)
        if not isinstance(root, str) or not ROOT_ID.fullmatch(root):
            raise Refusal('root_census row %d has no dg5 root id' % number)
        if status not in CENSUS_STATUSES:
            raise Refusal('root_census row %d status %r is not one of %s' % (number, status, CENSUS_STATUSES))
        if root in statuses:
            raise Refusal('root_census names %s twice' % root)
        statuses[root] = status
    if ROOT_109 not in statuses:
        raise Refusal('root_census does not name root 109')
    return statuses


def _check_entry(number, item):
    if not isinstance(item, dict):
        raise Refusal('entry %d is not an object' % number)
    for key in ('canonical_id', 'fragment'):
        if not isinstance(item.get(key), str) or not item[key]:
            raise Refusal('entry %d has no %s' % (number, key))
    if not HEX64.fullmatch(str(item.get('bound_sha256'))):
        raise Refusal('entry %d bound_sha256 is not a sha256' % number)
    section = item.get('section')
    if section not in SECTIONS:
        raise Refusal('entry %d section %r is not one of %s' % (number, section, SECTIONS))
    if item.get('mark') not in MARKS:
        raise Refusal('entry %d mark %r is not one of %s' % (number, item.get('mark'), MARKS))
    roots, ids, sources = item.get('roots'), item.get('ids'), item.get('sources')
    uncovered, unsearched = item.get('roots_uncovered'), item.get('roots_unsearched')
    for name, value in (('roots', roots), ('roots_uncovered', uncovered), ('roots_unsearched', unsearched)):
        if not isinstance(value, list) or not all(isinstance(r, str) and ROOT_ID.fullmatch(r) for r in value):
            raise Refusal('entry %d %s are not dg5 root ids' % (number, name))
    if not roots:
        raise Refusal('entry %d has no roots' % number)
    if not isinstance(ids, list) or not ids:
        raise Refusal('entry %d has no ids' % number)
    for raw_id in ids:
        if not isinstance(raw_id, str) or raw_id.count('#') != 1:
            raise Refusal('entry %d id %r is not one URI with one fragment' % (number, raw_id))
        base, fragment = raw_id.split('#', 1)
        if fragment != item['fragment']:
            raise Refusal('entry %d id %s does not carry its canonical fragment %s' % (number, raw_id, item['fragment']))
        if not URI_BASE.fullmatch(base):
            raise Refusal('entry %d id %s is not an absolute https:// or file:/// URI' % (number, raw_id))
    if set(unsearched) - {ROOT_109}:
        raise Refusal('entry %d lists unsearched roots other than root 109' % number)
    if section in ('A', 'B') and set(roots) != set(uncovered) | set(unsearched):
        raise Refusal('entry %d roots are not exactly its uncovered and unsearched roots' % number)
    if section == 'B' and (set(roots) != {ROOT_109} or uncovered):
        raise Refusal('entry %d is in section B but does not name root 109 alone' % number)
    if section == 'T371' and (uncovered or unsearched):
        raise Refusal('entry %d is a T371 entry with uncovered or unsearched roots' % number)
    if not isinstance(sources, list) or not sources:
        raise Refusal('entry %d has no sources' % number)
    for source in sources:
        if not isinstance(source, dict) or source.get('raw_id') not in ids or source.get('root') not in roots:
            raise Refusal('entry %d has a source outside its own ids and roots' % number)


def _occurrences(item):
    """The (raw id, root) occurrences an entry makes a documented gap, with their kind (condition 4)."""
    for source in item['sources']:
        pair = (source['raw_id'], source['root'])
        if (source.get('kind') == 'report' and source.get('cls') == 'UNCOVERED' and source.get('unsearched') is False
                and source['root'] in item['roots_uncovered']):
            yield pair, EXHAUSTED
        elif (source.get('unsearched') is True and source['root'] == ROOT_109
              and source['root'] in item['roots_unsearched']):
            yield pair, REMAINDER


# ---------------------------------------------------------------- matrix

def _checker_closed(row):
    """True only when the checker verdict closed under every builder edition (condition 3)."""
    predicate = row.get('predicate') or {}
    if predicate.get('effective_gated') != 'PASS' or predicate.get('site_conflict'):
        return False
    if any((row.get('kills') or {}).get(k, 0) > 0 for k in KILLS):
        return True
    shared = row.get('shared_negative') or {}
    return shared.get('valid_citation') is True and any((shared.get('kills') or {}).get(k, 0) > 0 for k in KILLS)


def _not_applicable(row, why, base):
    row['documented_gap'] = dict(edition=EDITION, decision=DECISION_REF, applied=False, why=why, base=base)
    return dict(applied=False, why=why)


def _schema_problem(closure, count):
    roots = closure.get('roots')
    if not isinstance(roots, list) or not roots:
        return 'the row has no clause-closure roots'
    if closure.get('errors'):
        return 'the row has root errors'
    if closure.get('uncovered') != count:
        return 'schema_closure.uncovered %r differs from the reason count %d' % (closure.get('uncovered'), count)
    total = 0
    for root in roots:
        if root.get('error'):
            return 'root %s has an error' % root.get('root')
        if not ROOT_ID.fullmatch(str(root.get('root'))):
            return 'root id %r is not a dg5 root id' % root.get('root')
        if FAMILY not in (root.get('families') or []):
            return 'root %s is not bound to %s' % (root.get('root'), FAMILY)
        if not root.get('report'):
            return 'root %s has no clause-closure report' % root.get('root')
        clauses = root.get('uncovered_clauses')
        if not isinstance(clauses, list) or len(clauses) != root.get('uncovered') or len(set(clauses)) != len(clauses):
            return 'root %s uncovered count and clause list disagree' % root.get('root')
        total += len(clauses)
    if total != count:
        return 'the roots carry %d uncovered, the reason says %d' % (total, count)
    return None


def apply_edition(matrix, gap_list):
    """Apply the edition in place; return the report. Raises Refusal on an inconsistent matrix."""
    if not isinstance(matrix, dict) or matrix.get('schema_id') != SCHEMA_ID:
        raise Refusal('input is not a %s matrix' % SCHEMA_ID)
    if 'documented_gap_edition' in matrix:
        raise Refusal('the matrix already carries a documented-gap edition')
    if ' '.join(SCHEMA_RULE.split()) not in ' '.join(str(matrix.get('rule', '')).split()):
        raise Refusal("the matrix rule does not state the builder's whole-root schema rule")
    before = json.loads(json.dumps(matrix, default=list))
    family = (matrix.get('families') or {}).get(FAMILY)
    report = dict(applied=False, why='family %s is not in the matrix' % FAMILY)
    if family is not None:
        rows = [m for m in family.get('matrix', []) if m.get('row') == ROW]
        if len(rows) > 1:
            raise Refusal('family %s has %d rows named %s' % (FAMILY, len(rows), ROW))
        report = dict(applied=False, why='family %s has no row %s' % (FAMILY, ROW))
        if rows:
            report = _apply_row(family, rows[0], gap_list)
    matrix['documented_gap_edition'] = dict(
        edition=EDITION, decision=DECISION_REF, tool_sha256=tool_sha256(), family=FAMILY, row=ROW,
        gap_list=dict(edition=gap_list['edition'], directory=gap_list['directory'],
                      sums_sha256=gap_list['sums_sha256'], json_sha256=gap_list['json_sha256'],
                      generated_utc=gap_list['generated_utc']),
        applied=report['applied'], why=report.get('why'), definition=GAP_DEFINITION, reopen_rule=REOPEN_RULE,
        final_stage='this matrix is final: never feed it to the goal.cancelled admission tool or any intake tool')
    _assert_only_target_changed(before, matrix)
    return report


def _apply_row(family, row, gap_list):
    base = dict(status=row.get('status'), reason=row.get('reason'))
    match = REASON.fullmatch(str(row.get('reason')))
    if row.get('status') != 'OPEN' or not match:
        return _not_applicable(row, 'the builder verdict is not OPEN for uncovered clauses alone', base)
    count = int(match.group(1))
    problem = _schema_problem(row.get('schema_closure') or {}, count)
    if problem:
        return _not_applicable(row, problem, base)
    if not _checker_closed(row):
        return _not_applicable(row, 'the checker verdict is not provably CLOSED (gated PASS with a KILLED or '
                                    'DUPLICATE_SET_KILLED kill)', base)
    census = gap_list['census']
    present = {root['root'] for root in row['schema_closure']['roots']}
    missing = sorted(set(census) - {ROOT_109} - present)
    extra = sorted(present - set(census))
    if missing or extra:
        why = []
        if missing:
            why.append('%d root(s) the signed list binds to this row have no clause-closure root in the matrix '
                       '(never walked or not supplied): %s' % (len(missing), ', '.join(missing)))
        if extra:
            why.append('%d root(s) are not in the signed list\'s census: %s' % (len(extra), ', '.join(extra)))
        result = _not_applicable(row, '; '.join(why), base)
        row['documented_gap'].update(missing_roots=missing, missing_by_status=dict(sorted(collections.Counter(
            census[r] for r in missing).items())), extra_roots=extra)
        return result
    entries, index = gap_list['entries'], gap_list['index']
    matches, unlisted = [], []
    for root in row['schema_closure']['roots']:
        for clause in root['uncovered_clauses']:
            hit = index.get((clause, root['root']))
            if hit is None:
                unlisted.append([root['root'], clause])
            else:
                matches.append((root['root'], clause) + hit)
    by_section = collections.Counter(entries[n]['section'] for _, _, n, _ in matches)
    by_mark = collections.Counter(entries[n]['mark'] for _, _, n, _ in matches)
    by_kind = collections.Counter(kind for _, _, _, kind in matches)
    detail = [dict(root=r, clause=c, kind=kind, canonical_id=entries[n]['canonical_id'],
                   bound_sha256=entries[n]['bound_sha256'], fragment=entries[n]['fragment'],
                   section=entries[n]['section'], mark=entries[n]['mark'])
              for r, c, n, kind in matches]
    applied = not unlisted
    note = dict(edition=EDITION, decision=DECISION_REF, applied=applied, base=base,
                gap_list=dict(edition=gap_list['edition'], sums_sha256=gap_list['sums_sha256']),
                uncovered=count, listed=len(matches), unlisted=len(unlisted), unlisted_clauses=sorted(unlisted),
                by_kind=dict(sorted(by_kind.items())), by_section=dict(sorted(by_section.items())),
                by_mark=dict(sorted(by_mark.items())), pending=[d for d in detail if d['mark'] != 'none'],
                census=dict(roots=len(census), carried=len(present)),
                section_b=dict(root=ROOT_109, in_matrix=ROOT_109 in present, entries=gap_list['section_b']['entries'],
                               occurrences=gap_list['section_b']['occurrences'],
                               note=('root 109 is in the matrix; its UNCOVERED clauses match section B per root'
                                     if ROOT_109 in present else
                                     'root 109 is not in the matrix; its unsearched remainder (section B) is part of '
                                     'the documented gap, never covered')),
                matches=detail)
    if not applied:
        note['why'] = '%d uncovered clause(s) are not on gap list %s under their own root' % (
            len(unlisted), gap_list['edition'])
        row['documented_gap'] = note
        return dict(applied=False, why=note['why'], listed=len(matches), unlisted=len(unlisted))
    status = family.get('status')
    opened = [o for o in family.get('open', []) if o.get('row') == ROW]
    if not isinstance(status, dict) or status.get('OPEN', 0) < 1 or len(opened) != 1:
        raise Refusal('family %s tallies do not show %s as one OPEN row' % (FAMILY, ROW))
    row['status'] = STATUS
    row['reason'] = ('clause closure leaves %d uncovered, every one on gap list %s under its own root, on every '
                     'census root but root 109, whose unsearched remainder is section B (documented gap, not '
                     'coverage; %s)' % (count, gap_list['edition'], DECISION_REF))
    row['documented_gap'] = note
    status['OPEN'] -= 1
    if not status['OPEN']:
        del status['OPEN']
    status[STATUS] = status.get(STATUS, 0) + 1
    family['open'] = [o for o in family['open'] if o.get('row') != ROW]
    return dict(applied=True, listed=len(matches), unlisted=0, by_kind=dict(by_kind), by_mark=dict(by_mark))


def _assert_only_target_changed(before, after):
    """Self-check: every other row, family field and top-level key is unchanged, and no family is added."""
    if set(before.get('families', {})) != set(after.get('families', {})):
        raise Refusal('the set of families changed')
    for name, data in before.get('families', {}).items():
        new = after['families'][name]
        if set(data) != set(new):
            raise Refusal('family %s keys changed' % name)
        for key in data:
            if key == 'matrix':
                if len(data[key]) != len(new[key]):
                    raise Refusal('family %s row count changed' % name)
                for old_row, new_row in zip(data[key], new[key]):
                    if name == FAMILY and old_row.get('row') == ROW:
                        continue
                    if old_row != new_row:
                        raise Refusal('row %s of %s changed' % (old_row.get('row'), name))
            elif not (name == FAMILY and key in ('status', 'open')) and data[key] != new[key]:
                raise Refusal('family %s field %s changed' % (name, key))
    for key in before:
        if key != 'families' and before[key] != after[key]:
            raise Refusal('top-level %s changed' % key)
    if set(after) - set(before) != {'documented_gap_edition'}:
        raise Refusal('unexpected top-level keys')


# ---------------------------------------------------------------- io

def read_matrix(path):
    path = Path(path)
    data = path.read_bytes()
    if path.suffix == '.gz':
        data = gzip.decompress(data)
    return json.loads(data)


def write_matrix(path, matrix):
    """The builder's serialisation, written atomically so a refusal never leaves a partial file."""
    path = Path(path)
    text = (json.dumps(matrix, indent=1, default=list) + '\n').encode()
    if path.suffix == '.gz':
        text = gzip.compress(text, mtime=0)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix='.' + path.name + '.')
    try:
        with os.fdopen(fd, 'wb') as handle:
            handle.write(text)
        os.replace(tmp, path)
    except BaseException:
        if os.path.exists(tmp):
            os.unlink(tmp)
        raise


def _run_stock(stock, stock_args):
    if '--out' not in stock_args or stock_args.index('--out') + 1 >= len(stock_args):
        raise Refusal('the builder arguments need --out OUT')
    position = stock_args.index('--out') + 1
    final = stock_args[position]
    with tempfile.TemporaryDirectory(prefix='dg5-gap-build-') as tmp:
        built = str(Path(tmp) / 'stock-matrix.json')
        args = list(stock_args)
        args[position] = built
        proc = subprocess.run([sys.executable, '-B', str(stock)] + args)
        if proc.returncode != 0:
            raise Refusal('the builder exited %d' % proc.returncode)
        return final, read_matrix(built)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)
    apply_cmd = sub.add_parser('apply', help='apply the edition to a matrix the builder wrote')
    apply_cmd.add_argument('--matrix', required=True)
    build_cmd = sub.add_parser('build', help='run the builder, then apply the edition')
    build_cmd.add_argument('--stock', default=str(Path(__file__).resolve().with_name('pm_goal_dg5_matrix.py')))
    build_cmd.add_argument('stock_args', nargs=argparse.REMAINDER)
    for cmd in (apply_cmd, build_cmd):
        cmd.add_argument('--gap-list', default=GAP_LIST_DIR)
        cmd.add_argument('--edition', default=DEFAULT_EDITION, choices=sorted(GAP_LIST_PINS))
    apply_cmd.add_argument('--out', required=True)
    args = parser.parse_args(argv)
    try:
        gap_list = load_gap_list(args.gap_list, args.edition)
        if args.command == 'apply':
            out, matrix = args.out, read_matrix(args.matrix)
            source = dict(matrix=str(args.matrix), matrix_sha256=_sha256(Path(args.matrix).read_bytes()))
        else:
            stock_args = args.stock_args[1:] if args.stock_args[:1] == ['--'] else args.stock_args
            out, matrix = _run_stock(args.stock, stock_args)
            source = dict(stock=str(args.stock), stock_sha256=_sha256(Path(args.stock).read_bytes()))
        report = apply_edition(matrix, gap_list)
        matrix['documented_gap_edition']['source'] = source
        write_matrix(out, matrix)
    except Refusal as error:
        print('REFUSED: %s' % error, file=sys.stderr)
        return 2
    print(json.dumps(dict(out=str(out), **report), indent=1, default=list))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

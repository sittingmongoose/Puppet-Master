#!/usr/bin/env python3
"""Self-test of scripts/pm_goal_dg5_matrix_gap_v1.py (goal.cancelled documented-gap edition, DL-2600).

Synthetic fixtures, plus one check that the real signed GAP-LIST v1.1 verifies against the edition's pin
(skipped when the evidence share is not mounted). The brief's five checks are tests 1-6; the rest pin the
gap definition (search-exhausted on a completed walk, plus root 109's named remainder; never-walked roots
are not in it) and the refusals.

Run: python3 -B scripts/pm_goal_dg5_matrix_gap_v1_selftest.py
"""
import copy
import gzip
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import pm_goal_dg5_matrix_gap_v1 as gap  # noqa: E402

EDITION = 'v1.1'
FAMILY, ROW = 'goal.cancelled', 'dg5/roots/schema'
OTHER_ROW = 'dg5/contracts/OwnerMapping/schema'
OTHER_FAMILY = 'goal_run.cancelled'
ROOT_A, ROOT_B = 'dg5:00000000000000aa', 'dg5:00000000000000bb'
ROOT_109 = 'dg5:87291d8293370997'
BASE = 'https://puppetmaster.local/schemas/example/1.0.0/example.schema.json'
C1 = BASE + '#/$defs/A/properties/x/type'
C2 = BASE + '#/$defs/A/properties/y/minLength'
C3 = 'file:///mnt/Cursor/PuppetMaster/Plans/example.schema.json#/$defs/B/const'
DEFINITION = getattr(gap, 'GAP_DEFINITION', '<missing GAP_DEFINITION>')
REOPEN = gap.REOPEN_RULE
RULE = ('Status (GH1): CLOSED = gated PASS and a KILLED or DUPLICATE_SET_KILLED witness of\n'
        'this family (or a byte-identical cited shared witness under --shared-proof);\n'
        'CLOSED_BY_PROOF = a recorded justification (scripts/pm_goal_dg5_justified.py)\n'
        'whose dependencies are closed in this family; OPEN otherwise, with its reason.\n'
        'A whole-root schema row is CLOSED only if, in addition, every root it validates\n'
        'for this family has 0 UNCOVERED clauses in the DG5 clause-closure report(s).')


def stock_dumps(obj):
    """The builder's serialisation (pm_goal_dg5_matrix.py main)."""
    return json.dumps(obj, indent=1, default=list) + '\n'


def source(clause, root, kind):
    if kind == 'uncovered':
        return dict(raw_id=clause, root=root, report='rep-' + root[-2:], report_path='/x/rep.json', sha256='0' * 64,
                    kind='report', cls='UNCOVERED', unsearched=False)
    if kind == 'unsearched':
        return dict(raw_id=clause, root=root, report='ca-root-109-t360 (pending)', report_path='/x/packet.json',
                    sha256='0' * 64, kind='packet', cls=None, unsearched=True)
    return dict(raw_id=clause, root=root, report='rep', report_path='/x/rep.json', sha256='0' * 64,
                kind='report', cls='SELECTOR_OR_NEGATED', unsearched=False)


def entry(clause, uncovered=(), unsearched=(), section='A', mark='none', bound='1' * 64, structural=()):
    frag = clause.split('#', 1)[1]
    canon = clause.split('#', 1)[0] if clause.startswith('https://') else 'https://puppetmaster.local/x.json'
    sources = ([source(clause, r, 'uncovered') for r in uncovered] + [source(clause, r, 'unsearched') for r in unsearched]
               + [source(clause, r, 'structural') for r in structural])
    return dict(canonical_id=canon, bound_sha256=bound, fragment=frag, keyword_kind=frag.rsplit('/', 1)[1],
                document='example.schema.json', path='Plans/example.schema.json', identity_state='resolved',
                section=section, mark=mark, marks=[] if mark == 'none' else [mark], static_class='N',
                roots=sorted(set(uncovered) | set(unsearched) | set(structural)), roots_uncovered=list(uncovered),
                roots_unsearched=list(unsearched), sources=sources, ids=[clause])


def census_of(entries, extra=(), closed=()):
    """The fixture's root census: every uncovered root EXHAUSTED, root 109 NOT COMPLETE, plus extras."""
    rows = {r: 'EXHAUSTED' for e in entries for r in e['roots_uncovered']}
    rows.update({r: 'CLOSED' for r in closed})
    rows.update(dict(extra))
    rows.setdefault(ROOT_109, 'NOT COMPLETE')
    return [dict(root=r, status=st) for r, st in sorted(rows.items())]


def write_gap_list(directory, entries, family=FAMILY, row=ROW, reopen=REOPEN, definition=DEFINITION,
                   schema='dg5-gap-list.v1.1', census=None):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    doc = dict(schema=schema, generated_utc='2026-11-23T00:00:00Z', row=row, family=family,
               decision='E-GC-GAP option B', definition=definition, reopen_rule=reopen,
               root_census=census_of(entries) if census is None else census, entries=entries)
    (directory / 'GAP-LIST-v1.1.json').write_text(json.dumps(doc, indent=1) + '\n')
    (directory / 'GAP-LIST-v1.1.md').write_text('# GAP-LIST v1.1 (fixture)\n')
    lines = ['%s  %s\n' % (hashlib.sha256((directory / n).read_bytes()).hexdigest(), n)
             for n in ('GAP-LIST-v1.1.json', 'GAP-LIST-v1.1.md')]
    (directory / 'SHA256SUMS').write_text(''.join(lines))
    return hashlib.sha256((directory / 'SHA256SUMS').read_bytes()).hexdigest()


def schema_row(name, roots, status='OPEN', reason=None, kills=None, gated='PASS', justification=None):
    roots = [dict(root=r, report='/x/close-%s.json' % r, reports=['/x/close-%s.json' % r], families=[FAMILY],
                  counts={'UNCOVERED': len(c)}, uncovered=len(c), uncovered_clauses=sorted(c), error=None)
             for r, c in roots]
    total = sum(r['uncovered'] for r in roots)
    return dict(row=name, status=status,
                reason=reason if reason is not None else 'clause closure leaves %d uncovered' % total,
                owner=None, predicate=dict(table='t', gated=gated, effective_gated=gated, proof_dir='/p',
                                           table_status='PASS', table_reason=None, table_rows=1, sites=[]),
                control=dict(family_accepted_calls=3),
                negative=dict(declared_attempts=1, outcomes={'exact_expected': 1}, witness=None),
                cut=None, restoration=None, justification=justification,
                schema_closure=dict(roots=roots, uncovered=total, errors=[]),
                kills=kills if kills is not None else {'KILLED': 1})


def checker_row(name, status='CLOSED', reason=None):
    return dict(row=name, status=status, reason=reason, owner=None, predicate=dict(gated='PASS', effective_gated='PASS'),
                control=dict(family_accepted_calls=1), negative=dict(declared_attempts=1, outcomes={}, witness=None),
                cut=None, restoration=None, justification=None, schema_closure=None, kills={'KILLED': 1})


def family(rows):
    status = {}
    for m in rows:
        status[m['status']] = status.get(m['status'], 0) + 1
    return dict(rows=len(rows), status=status, witness_bound_not_run=0,
                schema_rows=sum(1 for m in rows if m['row'].endswith('/schema')),
                checker_rows=sum(1 for m in rows if not m['row'].endswith('/schema')),
                open=[dict(row=m['row'], reason=m['reason']) for m in rows if m['status'] == 'OPEN'], matrix=rows)


def matrix(target_roots=((ROOT_A, [C1, C2]),), target=None):
    target = target or schema_row(ROW, target_roots)
    gc = [checker_row('dg5/site/a.py:1'), schema_row(OTHER_ROW, [(ROOT_A, [C1])]), target,
          checker_row('dg5/site/b.py:2', status='OPEN', reason='gated UNPROVED')]
    rc = [schema_row(ROW, [(ROOT_A, [C1, C2])])]
    rc[0]['schema_closure']['roots'][0]['families'] = [OTHER_FAMILY]
    return dict(schema_id='pm.pnc019.c12_dg5.coverage_matrix.v1', proof_dir='/p', proof_dirs=['/p'],
                shared_proof_dirs=[], families={FAMILY: family(gc), OTHER_FAMILY: family(rc)}, rule=RULE)


def pinned_copy(directory, pin):
    """A copy of the edition whose v1.1 pin is the fixture's (the CLI has no pin override)."""
    src = (HERE / 'pm_goal_dg5_matrix_gap_v1.py').read_text()
    real = gap.GAP_LIST_PINS[EDITION]['sums_sha256']
    assert src.count("'sums_sha256': '%s'" % real) == 1, 'pin not found once'
    dst = Path(directory) / 'pm_goal_dg5_matrix_gap_v1.py'
    dst.write_text(src.replace("'sums_sha256': '%s'" % real, "'sums_sha256': '%s'" % pin))
    return dst


def target_of(m):
    return next(r for r in m['families'][FAMILY]['matrix'] if r['row'] == ROW)


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def gaplist(self, entries, **kw):
        pin = write_gap_list(self.dir / 'gl', entries, **kw)
        return gap.load_gap_list(self.dir / 'gl', EDITION, pin=pin)

    def refuses(self, entries, **kw):
        name = 'gl-%d' % len(list(self.dir.iterdir()))
        pin = write_gap_list(self.dir / name, entries, **kw)
        with self.assertRaises(gap.Refusal):
            gap.load_gap_list(self.dir / name, EDITION, pin=pin)

    def assertOthersUnchanged(self, before, after):
        for fam, data in before['families'].items():
            for i, row in enumerate(data['matrix']):
                if fam == FAMILY and row['row'] == ROW:
                    continue
                self.assertEqual(stock_dumps(row), stock_dumps(after['families'][fam]['matrix'][i]), (fam, row['row']))
            for key in data:
                if key == 'matrix' or (fam == FAMILY and key in ('status', 'open')):
                    continue
                self.assertEqual(data[key], after['families'][fam][key], (fam, key))
        for key in before:
            if key != 'families':
                self.assertEqual(before[key], after[key], key)
        self.assertEqual(set(after) - set(before), {'documented_gap_edition'})


class Edition(Base):
    def test_1_unlisted_uncovered_clause_still_fails_the_row(self):
        g = self.gaplist([entry(C1, [ROOT_A])])
        m = matrix()
        before = copy.deepcopy(m)
        report = gap.apply_edition(m, g)
        row = target_of(m)
        self.assertEqual((row['status'], row['reason']), ('OPEN', 'clause closure leaves 2 uncovered'))
        self.assertFalse(report['applied'])
        self.assertEqual((row['documented_gap']['listed'], row['documented_gap']['unlisted']), (1, 1))
        self.assertEqual(row['documented_gap']['unlisted_clauses'], [[ROOT_A, C2]])
        self.assertEqual(m['families'][FAMILY]['status'], before['families'][FAMILY]['status'])
        self.assertOthersUnchanged(before, m)

    def test_2_listed_clauses_become_documented_gap(self):
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, [ROOT_A])])
        m = matrix()
        before = copy.deepcopy(m)
        report = gap.apply_edition(m, g)
        row = target_of(m)
        self.assertTrue(report['applied'])
        self.assertEqual(row['status'], 'DOCUMENTED_GAP')
        self.assertIn('documented gap, not coverage', row['reason'])
        dg = row['documented_gap']
        self.assertEqual((dg['uncovered'], dg['listed'], dg['unlisted']), (2, 2, 0))
        self.assertEqual(dg['by_kind'], {gap.EXHAUSTED: 2})
        self.assertEqual(dg['base'], {'status': 'OPEN', 'reason': 'clause closure leaves 2 uncovered'})
        self.assertEqual(row['schema_closure'], before['families'][FAMILY]['matrix'][2]['schema_closure'])
        fam = m['families'][FAMILY]
        self.assertEqual(fam['status'].get('OPEN'), before['families'][FAMILY]['status']['OPEN'] - 1)
        self.assertEqual(fam['status'].get('DOCUMENTED_GAP'), 1)
        self.assertNotIn(ROW, [o['row'] for o in fam['open']])
        self.assertOthersUnchanged(before, m)

    def test_2b_pending_mark_counts_as_documented_gap_and_is_reported(self):
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, [ROOT_A], mark='T360 re-run pending')])
        m = matrix()
        gap.apply_edition(m, g)
        row = target_of(m)
        self.assertEqual(row['status'], 'DOCUMENTED_GAP')
        self.assertEqual(row['documented_gap']['by_mark'], {'none': 1, 'T360 re-run pending': 1})
        self.assertEqual([(p['root'], p['clause'], p['mark']) for p in row['documented_gap']['pending']],
                         [(ROOT_A, C2, 'T360 re-run pending')])

    def test_2c_root_109_unsearched_remainder_counts(self):
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, unsearched=[ROOT_109], section='B')])
        m = matrix(target_roots=((ROOT_A, [C1]), (ROOT_109, [C2])))
        gap.apply_edition(m, g)
        row = target_of(m)
        self.assertEqual(row['status'], 'DOCUMENTED_GAP')
        self.assertEqual(row['documented_gap']['by_kind'], {gap.EXHAUSTED: 1, gap.REMAINDER: 1})
        self.assertEqual(row['documented_gap']['by_section'], {'A': 1, 'B': 1})

    def test_2d_the_admission_tools_open_list_of_row_names_is_read(self):
        """admit-goal-cancelled.py rewrites family['open'] as bare row names; the edition runs after it."""
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, [ROOT_A])])
        m = matrix()
        fam = m['families'][FAMILY]
        fam['open'] = sorted(r['row'] for r in fam['matrix'] if r['status'] == 'OPEN')
        self.assertIn(ROW, fam['open'])
        before = copy.deepcopy(m)
        report = gap.apply_edition(m, g)
        self.assertTrue(report['applied'])
        self.assertEqual(target_of(m)['status'], 'DOCUMENTED_GAP')
        after_open = m['families'][FAMILY]['open']
        self.assertEqual(after_open, [n for n in before['families'][FAMILY]['open'] if n != ROW])
        self.assertTrue(after_open and all(isinstance(n, str) for n in after_open))
        self.assertOthersUnchanged(before, m)

    def test_2e_an_open_entry_of_any_other_shape_refuses(self):
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, [ROOT_A])])
        for bad in (7, None, {'reason': 'x'}, {'row': 7}, [ROW]):
            m = matrix()
            m['families'][FAMILY]['open'].append(bad)
            with self.assertRaises(gap.Refusal, msg=repr(bad)):
                gap.apply_edition(m, g)

    def test_3_same_clause_on_another_row_or_family_stays_uncovered(self):
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, [ROOT_A])])
        m = matrix()
        before = copy.deepcopy(m)
        gap.apply_edition(m, g)
        other_row = next(r for r in m['families'][FAMILY]['matrix'] if r['row'] == OTHER_ROW)
        self.assertEqual(other_row['status'], 'OPEN')
        self.assertEqual(other_row['schema_closure']['roots'][0]['uncovered_clauses'], [C1])
        other_family_row = m['families'][OTHER_FAMILY]['matrix'][0]
        self.assertEqual((other_family_row['row'], other_family_row['status']), (ROW, 'OPEN'))
        self.assertNotIn('documented_gap', other_row)
        self.assertNotIn('documented_gap', other_family_row)
        self.assertEqual(m['families'][OTHER_FAMILY], before['families'][OTHER_FAMILY])
        self.assertOthersUnchanged(before, m)

    def test_3b_canonical_match_on_another_root_does_not_count(self):
        es = [entry(C1, [ROOT_A]), entry(C2, [ROOT_A])]
        g = self.gaplist(es, census=census_of(es, closed=[ROOT_B]))
        m = matrix(target_roots=((ROOT_A, [C1]), (ROOT_B, [C2])))
        gap.apply_edition(m, g)
        row = target_of(m)
        self.assertEqual(row['status'], 'OPEN')
        self.assertEqual(row['documented_gap']['unlisted_clauses'], [[ROOT_B, C2]])

    def test_3c_a_t371_entry_does_not_cover_an_uncovered_clause(self):
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, section='T371', mark='T371 audit pending', structural=[ROOT_A])])
        m = matrix()
        gap.apply_edition(m, g)
        self.assertEqual(target_of(m)['status'], 'OPEN')
        self.assertEqual(target_of(m)['documented_gap']['unlisted_clauses'], [[ROOT_A, C2]])

    def test_4_tampered_gap_list_json_refuses(self):
        pin = write_gap_list(self.dir / 'gl', [entry(C1, [ROOT_A])])
        path = self.dir / 'gl' / 'GAP-LIST-v1.1.json'
        doc = json.loads(path.read_text())
        doc['entries'].append(entry(C2, [ROOT_A]))
        path.write_text(json.dumps(doc, indent=1) + '\n')
        with self.assertRaises(gap.Refusal):
            gap.load_gap_list(self.dir / 'gl', EDITION, pin=pin)

    def test_4b_tampered_sums_refuses(self):
        pin = write_gap_list(self.dir / 'gl', [entry(C1, [ROOT_A])])
        sums = self.dir / 'gl' / 'SHA256SUMS'
        sums.write_text(sums.read_text() + '%s  extra.txt\n' % ('0' * 64))
        with self.assertRaises(gap.Refusal):
            gap.load_gap_list(self.dir / 'gl', EDITION, pin=pin)

    def test_4c_the_real_pin_refuses_any_other_list(self):
        write_gap_list(self.dir / 'gl', [entry(C1, [ROOT_A])])
        with self.assertRaises(gap.Refusal):
            gap.load_gap_list(self.dir / 'gl', EDITION)

    def test_4d_wrong_family_row_definition_rule_or_schema_refuses(self):
        for kw in (dict(family=OTHER_FAMILY), dict(row=OTHER_ROW), dict(reopen=REOPEN + ' '),
                   dict(definition=DEFINITION.replace('Roots never walked are not in it', 'Roots never walked are in it')),
                   dict(schema='dg5-gap-list.v1')):
            self.refuses([entry(C1, [ROOT_A])], **kw)

    def test_4e_raw_id_without_its_canonical_fragment_refuses(self):
        bad = entry(C1, [ROOT_A])
        bad['ids'] = [C2]
        bad['sources'][0]['raw_id'] = C2
        self.refuses([bad])

    def test_4f_one_occurrence_in_two_entries_refuses(self):
        self.refuses([entry(C1, [ROOT_A]), entry(C1, [ROOT_A], bound='2' * 64)])

    def test_4g_a_never_walked_root_cannot_be_listed(self):
        self.refuses([entry(C1, [ROOT_A], unsearched=[ROOT_B])])          # only root 109 may be unsearched
        b_other = entry(C2, unsearched=[ROOT_109], section='B')
        b_other['roots'] = [ROOT_109, ROOT_B]
        self.refuses([b_other])                                             # roots beyond uncovered + unsearched
        self.refuses([entry(C2, [ROOT_A], section='B')])                   # section B is root 109 alone
        self.refuses([entry(C1, [ROOT_A], section='B2')])                  # no B2 section
        loose = entry(C1, [ROOT_A])
        loose['sources'].append(source(C1, ROOT_B, 'uncovered'))
        self.refuses([loose])                                               # a source outside the entry's roots

    def test_5_root_errors_are_not_relaxed(self):
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, [ROOT_A])])
        t = schema_row(ROW, [(ROOT_A, [C1, C2])], reason='clause closure reports have root errors')
        t['schema_closure']['roots'][0]['error'] = 'closure report differs from the exact assertion inventory'
        t['schema_closure']['errors'] = [ROOT_A]
        m = matrix(target=t)
        before = copy.deepcopy(m)
        self.assertFalse(gap.apply_edition(m, g)['applied'])
        self.assertEqual((target_of(m)['status'], target_of(m)['reason']), ('OPEN', 'clause closure reports have root errors'))
        self.assertOthersUnchanged(before, m)

    def test_5b_open_checker_verdict_is_not_relaxed(self):
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, [ROOT_A])])
        m = matrix(target=schema_row(ROW, [(ROOT_A, [C1, C2])], reason='gated UNPROVED', gated='UNPROVED'))
        gap.apply_edition(m, g)
        self.assertEqual((target_of(m)['status'], target_of(m)['reason']), ('OPEN', 'gated UNPROVED'))

    def test_5c_proof_only_checker_verdict_is_not_inferred(self):
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, [ROOT_A])])
        t = schema_row(ROW, [(ROOT_A, [C1, C2])], kills={'COVERED_LATER': 2},
                       justification=dict(kind='presence', depends_on=['dg5/site/b.py:2']))
        m = matrix(target=t)
        self.assertFalse(gap.apply_edition(m, g)['applied'])
        self.assertEqual(target_of(m)['status'], 'OPEN')

    def test_5d_double_apply_refuses(self):
        g = self.gaplist([entry(C1, [ROOT_A]), entry(C2, [ROOT_A])])
        m = matrix()
        gap.apply_edition(m, g)
        with self.assertRaises(gap.Refusal):
            gap.apply_edition(m, g)

    def test_6_cli_apply_writes_builder_serialisation_and_only_the_row_differs(self):
        pin = write_gap_list(self.dir / 'gl', [entry(C1, [ROOT_A]), entry(C2, [ROOT_A])])
        m = matrix()
        src = self.dir / 'in.json'
        src.write_text(stock_dumps(m))
        out = self.dir / 'out.json.gz'
        proc = subprocess.run([sys.executable, '-B', str(pinned_copy(self.dir, pin)), 'apply', '--matrix', str(src),
                               '--gap-list', str(self.dir / 'gl'), '--out', str(out)], capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        after = json.loads(gzip.open(out, 'rt').read())
        self.assertEqual(target_of(after)['status'], 'DOCUMENTED_GAP')
        self.assertOthersUnchanged(m, after)
        self.assertEqual(after['documented_gap_edition']['gap_list']['sums_sha256'], pin)

    def test_6b_cli_refusal_writes_nothing(self):
        pin = write_gap_list(self.dir / 'gl', [entry(C1, [ROOT_A])])
        (self.dir / 'gl' / 'GAP-LIST-v1.1.md').write_text('tampered\n')
        src = self.dir / 'in.json'
        src.write_text(stock_dumps(matrix()))
        out = self.dir / 'out.json'
        proc = subprocess.run([sys.executable, '-B', str(pinned_copy(self.dir, pin)), 'apply', '--matrix', str(src),
                               '--gap-list', str(self.dir / 'gl'), '--out', str(out)], capture_output=True, text=True)
        self.assertEqual(proc.returncode, 2, proc.stdout + proc.stderr)
        self.assertFalse(out.exists())

    def test_6c_cli_build_runs_the_builder_then_applies(self):
        pin = write_gap_list(self.dir / 'gl', [entry(C1, [ROOT_A]), entry(C2, [ROOT_A])])
        fixture = self.dir / 'stock-input.json'
        fixture.write_text(stock_dumps(matrix()))
        stock = self.dir / 'fake_stock.py'
        stock.write_text("import sys, shutil\nargs = sys.argv[1:]\nshutil.copy(%r, args[args.index('--out') + 1])\n"
                         % str(fixture))
        out = self.dir / 'built.json'
        proc = subprocess.run([sys.executable, '-B', str(pinned_copy(self.dir, pin)), 'build', '--gap-list',
                               str(self.dir / 'gl'), '--stock', str(stock), '--', 'PROOF', '--family', FAMILY,
                               '--out', str(out)], capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        after = json.loads(out.read_text())
        self.assertEqual(target_of(after)['status'], 'DOCUMENTED_GAP')
        self.assertOthersUnchanged(matrix(), after)
        self.assertEqual(after['documented_gap_edition']['source']['stock'], str(stock))

    def test_8_a_census_root_missing_from_the_matrix_keeps_the_row_open(self):
        es = [entry(C1, [ROOT_A]), entry(C2, [ROOT_A])]
        g = self.gaplist(es, census=census_of(es, extra=[(ROOT_B, 'NOT COMPLETE')]))
        m = matrix()
        before = copy.deepcopy(m)
        report = gap.apply_edition(m, g)
        row = target_of(m)
        self.assertFalse(report['applied'])
        self.assertEqual((row['status'], row['reason']), ('OPEN', 'clause closure leaves 2 uncovered'))
        self.assertEqual(row['documented_gap']['missing_roots'], [ROOT_B])
        self.assertEqual(row['documented_gap']['missing_by_status'], {'NOT COMPLETE': 1})
        self.assertIn(ROOT_B, row['documented_gap']['why'])
        self.assertOthersUnchanged(before, m)

    def test_8b_a_closed_census_root_missing_also_keeps_it_open(self):
        es = [entry(C1, [ROOT_A]), entry(C2, [ROOT_A])]
        g = self.gaplist(es, census=census_of(es, closed=[ROOT_B]))
        m = matrix()
        self.assertFalse(gap.apply_edition(m, g)['applied'])
        self.assertEqual(target_of(m)['documented_gap']['missing_roots'], [ROOT_B])

    def test_8c_only_root_109_missing_is_documented_gap_and_reports_section_b(self):
        es = [entry(C1, [ROOT_A]), entry(C2, [ROOT_A]), entry(C3, unsearched=[ROOT_109], section='B')]
        g = self.gaplist(es)
        m = matrix()
        self.assertTrue(gap.apply_edition(m, g)['applied'])
        row = target_of(m)
        self.assertEqual(row['status'], 'DOCUMENTED_GAP')
        sb = row['documented_gap']['section_b']
        self.assertEqual((sb['root'], sb['in_matrix'], sb['entries'], sb['occurrences']), (ROOT_109, False, 1, 1))
        self.assertIn('never covered', sb['note'])
        self.assertIn('section B', row['reason'])

    def test_8d_a_root_outside_the_census_keeps_the_row_open(self):
        es = [entry(C1, [ROOT_A]), entry(C2, [ROOT_A])]
        g = self.gaplist(es)
        m = matrix(target_roots=((ROOT_A, [C1, C2]), (ROOT_B, [])))
        self.assertFalse(gap.apply_edition(m, g)['applied'])
        row = target_of(m)
        self.assertEqual(row['status'], 'OPEN')
        self.assertEqual(row['documented_gap']['extra_roots'], [ROOT_B])

    def test_8e_a_census_root_carried_without_a_report_keeps_it_open(self):
        es = [entry(C1, [ROOT_A]), entry(C2, [ROOT_A])]
        g = self.gaplist(es, census=census_of(es, extra=[(ROOT_B, 'NOT COMPLETE')]))
        m = matrix(target_roots=((ROOT_A, [C1, C2]), (ROOT_B, [])))
        target_of(m)['schema_closure']['roots'][1]['report'] = None
        self.assertFalse(gap.apply_edition(m, g)['applied'])
        self.assertIn('no clause-closure report', target_of(m)['documented_gap']['why'])

    def test_8f_a_not_complete_root_carried_with_unlisted_clauses_stays_open(self):
        es = [entry(C1, [ROOT_A]), entry(C2, [ROOT_A])]
        g = self.gaplist(es, census=census_of(es, extra=[(ROOT_B, 'NOT COMPLETE')]))
        m = matrix(target_roots=((ROOT_A, [C1, C2]), (ROOT_B, [C3])))
        self.assertFalse(gap.apply_edition(m, g)['applied'])
        self.assertEqual(target_of(m)['documented_gap']['unlisted_clauses'], [[ROOT_B, C3]])

    def test_8g_a_census_that_is_missing_malformed_or_without_root_109_refuses(self):
        es = [entry(C1, [ROOT_A])]
        self.refuses(es, census=[])
        self.refuses(es, census=[dict(root=ROOT_A, status='EXHAUSTED')])                      # no root 109
        self.refuses(es, census=census_of(es) + [dict(root=ROOT_A, status='EXHAUSTED')])     # twice
        self.refuses(es, census=census_of(es, extra=[(ROOT_B, 'WALKING')]))                  # unknown status
        self.refuses(es, census=census_of(es, extra=[('dg5:xyz', 'CLOSED')]))                # bad id
        self.refuses(es, census=[dict(root=ROOT_A, status='CLOSED'), dict(root=ROOT_109, status='NOT COMPLETE')])

    def test_9_the_self_check_refuses_an_added_family(self):
        before = matrix()
        after = copy.deepcopy(before)
        after['families']['goal.updated'] = family([checker_row('x')])
        after['documented_gap_edition'] = {}
        with self.assertRaises(gap.Refusal):
            gap._assert_only_target_changed(before, after)

    def test_7_the_real_signed_gap_list_verifies_against_the_pin(self):
        directory = Path(getattr(gap, 'GAP_LIST_DIR', '/nonexistent'))
        if not (directory / 'SHA256SUMS').exists():
            self.skipTest('evidence share not mounted')
        g = gap.load_gap_list(directory, EDITION)
        sections = {e['section'] for e in g['entries']}
        self.assertLessEqual(sections, {'A', 'B', 'T371'})
        self.assertTrue(all(root == ROOT_109 for (_, root), (_, kind) in g['index'].items() if kind == gap.REMAINDER))
        census = g['census']
        self.assertEqual(census[ROOT_109], 'NOT COMPLETE')
        self.assertTrue(all(census[root] == 'EXHAUSTED' for (_, root), (_, kind) in g['index'].items()
                            if kind == gap.EXHAUSTED))


def main():
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Edition))
    print('pm_goal_dg5_matrix_gap_v1_selftest: %s' % ('PASS' if result.wasSuccessful() else 'FAIL'))
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())

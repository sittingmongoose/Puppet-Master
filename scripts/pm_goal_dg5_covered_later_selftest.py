#!/usr/bin/env python3
"""Red-first trials of the later-refusal rules (DG5 stock judge).

Rulings 1121112536-0b66 (3), 1121115610-7650 and addendum 1 (1121124828-43f4 (1)).
Each trial is one complete call through the real bridge
(`pm_goal_dg5_boundaries.invoke`, a forked child per trial over a real
TestOwnerStorage) and the stock collector and judge
(`pm_goal_guard_sweep.Collector`). Guards are site rows exactly as the owners'
are (`dg5/site/<this file>:<line>`, routed by `require(code, condition)` with a
literal code), so KILLED_CODE's own-guard check reads them as it reads an owner.

Same-code later refusals (the after-state rule):
  write_then_later_refusal  the cut path commits a Storage cell, then refuses: CANNOT_DECIDE (store and owner differ)
  no_write                  nothing between the two checks: COVERED_LATER, equal digests, not KILLED_CODE
  inmem_issuance            the cut path issues an owner original (no store write): CANNOT_DECIDE (owner differs)
  no_hook_family            the no-write call in a family with no owner hook: CANNOT_DECIDE
  clock_only                the cut path ticks the Storage clock only: COVERED_LATER, equal digests
  intact_nondeterministic   the intact trial records a fresh uuid4 each run: CANNOT_DECIDE, for the reason
                            'intact trial is not deterministic' (the verdict alone also follows from the cut)
  repeat_differs_only       only the repeated restoration (the fourth trial process) records a uuid4: the cut
                            equals the first intact run, so only the determinism control can refuse it:
                            CANNOT_DECIDE, 'intact trial is not deterministic: owner_sha256 ...'
  repeat_refuses_differently only the repeated restoration refuses at another row (same code, same state):
                            CANNOT_DECIDE, 'its repeat refused differently'
Different-code later refusals (KILLED_CODE):
  killed_code               own guard and code, exact, different cut code, restoration repeats: KILLED_CODE
  not_own_code              the declared row's guard code is not the code it refuses with: CANNOT_DECIDE
  restoration_not_repeating restoration refuses at the row with another code: CANNOT_DECIDE
  crash_cut                 the cut path crashes (Storage Crash): CANNOT_DECIDE, never KILLED_CODE or cover
  rebuilt_same_code         the guard's refusal is caught and a fresh refusal with the same code is raised
                            at another site (no chained original): the origin frame is not the row's guard,
                            so CANNOT_DECIDE (addendum 11), although the code-matched errors name the row
  computed_code_origin      the guard's code is built at run time (no literal on its line, like a FrameError or
                            template guard): judged by its recorded origin, KILLED_CODE (review (a))
  templated_code_killed     a templated-code guard whose cut accepts: KILLED, and the record carries the intact
                            refusal's origin at the guard (the Started-006 row kinds held on 'origin not recorded')
  rebuilt_chained           the same rebuild inside the handler (`raise ... from None`, as cf3_projector.py:329):
                            the chained original carries the code unchanged from the guard: KILLED_CODE
  templated_killed_code     a %-template guard literal ('selftest/%s/templated_first', as cb_migration.py:424's
                            'M/%s/goal_unavailable') refusing with a code its template matches, origin at the
                            guard: KILLED_CODE with template_matched (addendum 5; the unfixed check read the
                            literal as the code: 'refusal code is not the row guard code')
  templated_not_matching    a %-template guard whose refusal code the template does not match (the placeholder
                            would have to cover 'c/l', across a slash): CANNOT_DECIDE, 'does not match the row
                            guard template'

Prefix-equivalence of root-row codes (lead ruling 1121224233-9f91 (1), the ra-17/21/23 shape):
  prefixeq_cover            one :94-style check serving two named root rows; with the original-root row cut
                            the call refuses at the sibling final-root row: same site, same violation, codes
                            differ only in the root-row prefix: same code for J2, equal after-states:
                            COVERED_LATER, not KILLED_CODE
  prefixeq_write            the same, but the cut path commits a Storage cell before the sibling refusal:
                            CANNOT_DECIDE under the after-state rule (store and owner differ)
  prefixeq_other_site       the same prefix difference at two different guard lines: stays KILLED_CODE
  prefixeq_other_suffix     same site, prefix difference plus a different violation suffix: stays KILLED_CODE

Prefix-equivalence unit checks, no complete call:
  peq_unit_*                the exact normalisation and its refusals (different recorded site or guard site,
                            suffix or area; two 'root' segments; no kind segment; no origin or guard frame;
                            byte-equal codes; a crash), and killed_code_check treating an applicable pair as
                            the same code for J2

Template unit checks (addendum 5), no complete call:
  real_424_row              the real row cb_migration.py:424: its intact code M/capture/goal_unavailable with the
                            origin frame at :424, the cut refusing at :425 (M/capture/goal_body_unavailable):
                            KILLED_CODE; the same code with the origin at :425 is not own
  template_two_sites_no_origin  a template that matches two raise sites, no origin recorded: fails closed
                            (own False, both sites listed); a template match alone never credits

Pin of the static fallback (review (c)), no complete call:
  gate_pin_pinned           the branch's pinned gate module loads and answers, with its pinned sha256
  gate_pin_tampered         a copy with one byte changed is refused: 'not the pinned file', no answer

A trial passes only when the kill class is the expected one and the record
carries the judge's evidence for it (`killed_code_check`, and for same-code
cases `covered_later_check`). The unfixed judge has neither, so every trial
fails on it (red first).

Usage: python3 -m pm_goal_dg5_covered_later_selftest --out RESULT.json [--work DIR]
"""
import argparse
import inspect
import json
from pathlib import Path
import sys
import tempfile
import uuid

import pm_goal_dg5_boundaries as bridge
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables
import pm_goal_test_owner_adapters as A
import pm_goal_test_storage as S

FAMILY = 'shared-adapter'   # a family whose owner hook walks the world it is given
NO_HOOK = 'selftest.no_hook_family'


class Refusal(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def require(code, condition, raise_code=None, row=None):
    """One routed guard at its caller's site (the bridge's guard_wrapper contract).

    `row` routes the refusal to a named row instead of the site row (the s_readers root
    rows: one runtime check serving several named root rows at one line)."""
    frame = inspect.currentframe().f_back
    path = Path(frame.f_code.co_filename)
    try:
        where = str(path.relative_to(bridge.ROOT))
    except ValueError:
        where = path.name
    name = row or bridge.site_name(where, frame.f_lineno)
    if tables.decide(name, condition, site=(where, frame.f_lineno)) is not None:
        raised = raise_code or code
        bridge.LAST_REFUSAL[0] = (name, raised)
        raise Refusal(raised)


def site(marker):
    """The site row of the guard line carrying `# site:<marker>` in this file."""
    path = Path(__file__)
    for number, text in enumerate(path.read_text().splitlines(), 1):
        if text.rstrip().endswith('# site:' + marker):
            try:
                where = str(path.relative_to(bridge.ROOT))
            except ValueError:
                where = path.name
            return bridge.site_name(where, number)
    raise KeyError(marker)


class SyntheticWorld:
    """A TEST_ONLY Storage, a registry with its method recorder, and one issuing owner."""

    def __init__(self, work):
        self.work = Path(work)
        self.recorder = A.MethodRecorder()
        self.registry = A.OwnerRegistry(self.recorder)
        self.storage = S.TestOwnerStorage.create(self.work)
        self.owner = A.TestOwner(self.registry)
        self.notes = []


DIFFERENT = ('killed_code', 'not_own_code', 'restoration_not_repeating', 'crash_cut', 'rebuilt_same_code',
             'rebuilt_chained', 'computed_code_origin', 'templated_killed_code', 'templated_not_matching')
COMPUTED = 'selftest/cl'   # a code built at run time below: no literal code on the guard's line


def action_for(case, world):
    runs = world.work.parent / (world.work.name + '.runs')   # outside the store: counts the trial processes

    def count():
        with runs.open('a') as handle:
            handle.write('x')
        return runs.stat().st_size   # 1 first call, 2 cut, 3 restoration, 4 its repeat

    def action():
        if case == 'intact_nondeterministic':
            world.notes.append(str(uuid.uuid4()))      # differs in every run, cut or not
        if case == 'repeat_differs_only' and count() == 4:
            world.notes.append(str(uuid.uuid4()))      # only the determinism repeat differs
        if case == 'repeat_refuses_differently' and count() == 4:
            require('selftest/cl/shared', True)        # site:repeat_passes
            require('selftest/cl/shared', False)       # site:repeat_refuses
        if case == 'not_own_code':
            require('selftest/cl/literal', False, raise_code='selftest/cl/raised')  # site:not_own
        elif case == 'restoration_not_repeating':
            with runs.open('a') as handle:
                handle.write('x')
            again = runs.stat().st_size >= 3          # the third trial process is the restoration
            require('selftest/cl/flaky', False, raise_code='selftest/cl/flaky-again' if again else None)  # site:flaky
        elif case == 'rebuilt_same_code':
            failed = False
            try:
                require('selftest/cl/rebuilt', False)  # site:rebuilt
            except Refusal:
                failed = True
            if failed:
                raise Refusal('selftest/cl/rebuilt')   # rebuilt fresh at another site, same code
        elif case == 'computed_code_origin':
            require(COMPUTED + '/computed', False)     # site:computed
        elif case == 'templated_code_killed':
            require(COMPUTED + '/templated', False)    # site:templated
            return 'accepted'                          # nothing later: the cut accepts
        elif case == 'rebuilt_chained':
            try:
                require('selftest/cl/chained', False)  # site:chained
            except Refusal as error:
                raise Refusal(error.code) from None    # rebuilt in the handler (the original stays on __context__)
        elif case == 'templated_killed_code':
            require('selftest/%s/templated_first' % 'cl', False)   # site:templ_first
        elif case == 'templated_not_matching':
            require('selftest/%s/templated_other' % 'cl', False, raise_code='selftest/c/l/templated_other')  # site:templ_other
        elif case == 'prefixeq_cover':
            for kind in ('original', 'final'):
                require('peq/%s/root/schema/v:format' % kind, False, row='dg5/peq/%s/root/schema' % kind)  # site:peq_cover
        elif case == 'prefixeq_write':
            for kind in ('original', 'final'):
                require('peq/%s/root/schema/v:format' % kind, False, row='dg5/peq/%s/root/schema' % kind)  # site:peq_write
                if kind == 'original':
                    world.storage.transact([dict(table='selftest_cells', key='k', expected=None, value=dict(n=1))])
        elif case == 'prefixeq_other_site':
            require('peq/original/root/schema/v:format', False)  # site:peq_first
            require('peq/final/root/schema/v:format', False)     # site:peq_second
        elif case == 'prefixeq_other_suffix':
            for kind, suffix in (('original', 'v:format'), ('final', 'w:format')):
                require('peq/%s/root/schema/%s' % (kind, suffix), False, row='dg5/peq/%s/root/schema' % kind)  # site:peq_suffix
        elif case in DIFFERENT:
            require('selftest/cl/first', False)        # site:first
        else:
            require('selftest/cl/shared', False)       # site:shared_first
        if case == 'write_then_later_refusal':
            world.storage.transact([dict(table='selftest_cells', key='k', expected=None, value=dict(n=1))])
        elif case == 'inmem_issuance':
            world.owner.issue(None, dict(n=1), kind='selftest')   # an owner original, in memory only
        elif case == 'clock_only':
            world.storage._tick()                      # the Storage clock moves; nothing else
        elif case == 'crash_cut':
            raise S.Crash('selftest_after_cut')
        if case in DIFFERENT:
            require('selftest/cl/second', False)       # site:second
        else:
            require('selftest/cl/shared', False)       # site:shared_second
        return 'accepted'
    if case in ('prefixeq_cover', 'prefixeq_write', 'prefixeq_other_suffix'):
        return action, 'dg5/peq/original/root/schema'   # the named root row, as the s_readers root rows are
    target = site({'not_own_code': 'not_own', 'restoration_not_repeating': 'flaky', 'rebuilt_same_code': 'rebuilt',
                   'rebuilt_chained': 'chained', 'computed_code_origin': 'computed',
                   'templated_code_killed': 'templated', 'templated_killed_code': 'templ_first',
                   'templated_not_matching': 'templ_other', 'prefixeq_other_site': 'peq_first'}.get(
        case, 'first' if case in DIFFERENT else 'shared_first'))
    return action, target


EXPECTED = {
    'write_then_later_refusal': ('CANNOT_DECIDE', FAMILY),
    'no_write': ('COVERED_LATER', FAMILY),
    'inmem_issuance': ('CANNOT_DECIDE', FAMILY),
    'no_hook_family': ('CANNOT_DECIDE', NO_HOOK),
    'clock_only': ('COVERED_LATER', FAMILY),
    'intact_nondeterministic': ('CANNOT_DECIDE', FAMILY),
    'repeat_differs_only': ('CANNOT_DECIDE', FAMILY),
    'repeat_refuses_differently': ('CANNOT_DECIDE', FAMILY),
    'killed_code': ('KILLED_CODE', FAMILY),
    'not_own_code': ('CANNOT_DECIDE', FAMILY),
    'restoration_not_repeating': ('CANNOT_DECIDE', FAMILY),
    'crash_cut': ('CANNOT_DECIDE', FAMILY),
    'rebuilt_same_code': ('CANNOT_DECIDE', FAMILY),
    'rebuilt_chained': ('KILLED_CODE', FAMILY),
    'computed_code_origin': ('KILLED_CODE', FAMILY),
    'templated_code_killed': ('KILLED', FAMILY),
    'templated_killed_code': ('KILLED_CODE', FAMILY),
    'templated_not_matching': ('CANNOT_DECIDE', FAMILY),
    'prefixeq_cover': ('COVERED_LATER', FAMILY),
    'prefixeq_write': ('CANNOT_DECIDE', FAMILY),
    'prefixeq_other_site': ('KILLED_CODE', FAMILY),
    'prefixeq_other_suffix': ('KILLED_CODE', FAMILY),
}
# Which judge evidence each case must carry (what makes the verdict, not only its name).
EVIDENCE = {
    'write_then_later_refusal': ('after', ['store_sha256', 'owner_sha256']),
    'inmem_issuance': ('after', ['owner_sha256']),
    'no_hook_family': ('reason', 'has no owner_sha256'),
    'intact_nondeterministic': ('reason', 'intact trial is not deterministic'),
    'repeat_differs_only': ('reason', 'intact trial is not deterministic: owner_sha256'),
    'repeat_refuses_differently': ('reason', 'its repeat refused differently'),
    'killed_code': ('code', 'KILLED_CODE'),
    'not_own_code': ('code', 'not the row guard'),
    'restoration_not_repeating': ('code', 'restoration did not repeat'),
    'crash_cut': ('code', 'crash'),
    'rebuilt_same_code': ('code', 'origin not at the row guard'),
    'rebuilt_chained': ('code', 'KILLED_CODE'),
    'computed_code_origin': ('code', 'KILLED_CODE'),
    'templated_code_killed': ('origin', None),
    'templated_killed_code': ('code', 'KILLED_CODE_TEMPLATE'),
    'templated_not_matching': ('code', 'does not match the row guard template'),
    'prefixeq_cover': ('prefixeq', None),
    'prefixeq_write': ('prefixeq_after', ['store_sha256', 'owner_sha256']),
    'prefixeq_other_site': ('code', 'KILLED_CODE'),
    'prefixeq_other_suffix': ('code', 'KILLED_CODE_NAMED'),
}


def run(work):
    saved = (tables.ACTIVE, tables.DISCOVERY, tables.COLLECTOR)
    tables.ACTIVE, tables.DISCOVERY = True, True
    collector = sweep.Collector(judge=True)
    tables.COLLECTOR = collector
    rows = []
    try:
        for case, (expected, family) in EXPECTED.items():
            world = SyntheticWorld(Path(work) / case)
            kind = 'no_write' if case == 'no_hook_family' else case
            action, target = action_for(kind, world)
            bridge.invoke('selftest/covered_later/' + case, family, action, world.work, world=world,
                          arguments=dict(receiver=world, args=(), kwargs={}), valid=False, target=target)
            record = collector.ledger[-1]
            after = record.get('covered_later_check') or {}
            code = record.get('killed_code_check') or {}
            state = {name: (after.get(name) or {}) for name in ('intact', 'restoration', 'cut')}
            kind, want = EVIDENCE.get(case, ('after', None))
            ok = record.get('outcome') == 'exact_expected' and record.get('kill') == expected and \
                (bool(code) or kind == 'origin')
            if kind == 'origin':
                site_row = 'dg5/site/%s:%s' % tuple((record.get('refusal_origin') or {}).get('site') or ('', ''))
                ok = ok and site_row.replace('dg5/site/scripts/', 'dg5/site/') == target
            elif expected == 'COVERED_LATER':
                ok = ok and after.get('verdict') == 'COVERED_LATER' and code.get('verdict') is None \
                    and all(state[n].get('store_sha256') and state[n].get('owner_sha256') for n in state) \
                    and len({state[n]['store_sha256'] for n in state}) == 1 \
                    and len({state[n]['owner_sha256'] for n in state}) == 1 \
                    and (kind != 'prefixeq' or (code.get('prefix_equivalence') or {}).get('applicable') is True)
            elif kind in ('after', 'prefixeq_after'):
                ok = ok and after.get('verdict') == expected and (want is None or after.get('effect') == want) \
                    and (kind != 'prefixeq_after' or (code.get('prefix_equivalence') or {}).get('applicable') is True)
            elif kind == 'reason':
                ok = ok and after.get('verdict') == expected and want in (after.get('reason') or '')
            elif want in ('KILLED_CODE', 'KILLED_CODE_TEMPLATE', 'KILLED_CODE_NAMED'):
                verified_by = 'origin at the row refusing site (only checker frames inside)' \
                    if want == 'KILLED_CODE_NAMED' else 'origin frame at the row guard'
                ok = ok and code.get('verdict') == 'KILLED_CODE' and (code.get('own_guard') or {}).get('own') is True \
                    and (code.get('own_guard') or {}).get('verified_by') == verified_by \
                    and not code.get('prefix_equivalence') \
                    and (want != 'KILLED_CODE_TEMPLATE' or (code.get('own_guard') or {}).get('template_matched') is True)
            else:
                ok = ok and code.get('verdict') is None and want in (code.get('reason') or '') + \
                    (record.get('cannot_decide_reason') or '')
            check_record = after or code
            rows.append(dict(case=case, family=family, expected_kill=expected, actual_kill=record.get('kill'),
                             outcome=record.get('outcome'), errors=record.get('errors'),
                             cut_errors=record.get('cut_errors'), restoration_errors=record.get('restoration_errors'),
                             covered_later_check=record.get('covered_later_check'),
                             killed_code_check=record.get('killed_code_check'),
                             cannot_decide_reason=record.get('cannot_decide_reason'),
                             after_state=record.get('after_state'), passed=bool(ok)))
    finally:
        tables.ACTIVE, tables.DISCOVERY, tables.COLLECTOR = saved
    rows.extend(gate_pin_cases(Path(work)))
    rows.extend(template_unit_cases())
    rows.extend(prefixeq_unit_cases())
    return dict(status='pass' if all(r['passed'] for r in rows) and not collector.failures else 'fail',
                judge=dict(guard_sweep=sweep.__file__, boundaries=bridge.__file__),
                collector_failures=collector.failures, cases=rows)


def _two_template_sites(kind):
    """Never called: two raise sites whose templates match the same code (template_two_sites_no_origin)."""
    require('selftest/%s/twice' % kind, False)         # site:twice_a
    require('selftest/%s/twice' % kind, False)         # site:twice_b


def prefixeq_unit_cases():
    """Prefix-equivalence (lead ruling 1121224233-9f91 (1)) through root_row_code_parts,
    root_row_prefix_equivalent and killed_code_check directly, no complete call. On the
    unfixed judge the functions (and the cut_origin argument) do not exist: red first."""
    rows = []
    # The real origin shape: the recorded site is the bank's shared raise line (s_world.py:110);
    # the owner guard line (s_readers.py:94 in the real case) is the innermost non-checker frame.
    at = lambda line: dict(site=['scripts/pm_goal_dg_s_world.py', 110],
                           frames=[['scripts/pm_goal_dg_s_world.py', 110, 'validate', False, True],
                                   ['scripts/pm_goal_dg_s_readers.py', line, 'retained_native', False, False]])
    intact = 'peq/original/root/schema/v:format'
    cut = 'peq/final/root/schema/v:format'

    def trial(name, expected, fn):
        try:
            result = fn()
        except (AttributeError, TypeError) as error:
            result = dict(missing='%s: %s' % (type(error).__name__, error))
            ok = False
        else:
            ok = result == expected
        rows.append(dict(case=name, expected=expected, result=result, passed=bool(ok)))

    trial('peq_unit_parts', ('peq', 'original', 'schema/v:format'),
          lambda: sweep.root_row_code_parts(intact))
    trial('peq_unit_equivalent', True,
          lambda: sweep.root_row_prefix_equivalent(intact, cut, at(94), at(94))['applicable'])
    trial('peq_unit_other_site', False,
          lambda: sweep.root_row_prefix_equivalent(intact, cut, at(94), at(95))['applicable'])
    trial('peq_unit_other_guard_site', False,
          lambda: sweep.root_row_prefix_equivalent(intact, cut, at(94), at(256))['applicable'])
    trial('peq_unit_other_recorded_site', False,
          lambda: sweep.root_row_prefix_equivalent(intact, cut, at(94),
              dict(site=['scripts/pm_goal_dg_s_world.py', 111], frames=at(94)['frames']))['applicable'])
    trial('peq_unit_no_guard_frame', False,
          lambda: sweep.root_row_prefix_equivalent(intact, cut, at(94),
              dict(site=['scripts/pm_goal_dg_s_world.py', 110],
                   frames=[['scripts/pm_goal_dg_s_world.py', 110, 'validate', False, True]]))['applicable'])
    trial('peq_unit_other_suffix', False,
          lambda: sweep.root_row_prefix_equivalent(intact, 'peq/final/root/schema/w:format', at(94), at(94))['applicable'])
    trial('peq_unit_other_area', False,
          lambda: sweep.root_row_prefix_equivalent(intact, 'other/final/root/schema/v:format', at(94), at(94))['applicable'])
    trial('peq_unit_two_roots', False,
          lambda: sweep.root_row_prefix_equivalent(intact, 'peq/final/root/schema/root/v:format', at(94), at(94))['applicable'])
    trial('peq_unit_no_kind_segment', None,
          lambda: sweep.root_row_code_parts('append/root/schema/v:format'))
    trial('peq_unit_no_origin', False,
          lambda: sweep.root_row_prefix_equivalent(intact, cut, at(94), None)['applicable'])
    trial('peq_unit_byte_equal', False,
          lambda: sweep.root_row_prefix_equivalent(intact, intact, at(94), at(94))['applicable'])
    trial('peq_unit_crash', False,
          lambda: sweep.root_row_prefix_equivalent(intact, 'crash:cut', at(94), at(94))['applicable'])
    trial('peq_unit_killed_check', (None, False, True),
          lambda: (lambda v: (v['verdict'], v['different_code'], bool(v.get('prefix_equivalence'))))(
              sweep.killed_code_check('dg5/peq/original/root/schema', intact, intact, cut, at(94), cut_origin=at(94))))
    for row in rows:
        row.setdefault('expected_kill', row['expected'])
        row.setdefault('actual_kill', row['result'].get('verdict') if isinstance(row['result'], dict) else None)
        row.setdefault('covered_later_check', None)
    return rows


def template_unit_cases():
    """Addendum 5 (pm-ea-lead 1121190253-6a08): templated guard literals through row_code_check and
    killed_code_check directly (the real row :424, and a template with two raise sites and no origin)."""
    rows = []
    real = 'dg5/site/pm_goal_dg_cb_migration.py:424'
    at = lambda line: dict(site=['scripts/pm_goal_dg_cb_migration.py', line], chain_depth=0, chain_length=1,
                           origin_type='Refusal', frames=[])
    intact, cut = 'M/capture/goal_unavailable', 'M/capture/goal_body_unavailable'
    verdict = sweep.killed_code_check(real, intact, intact, cut, at(424))
    elsewhere = bridge.row_code_check(real, intact, at(425))
    own = verdict.get('own_guard') or {}
    ok = verdict.get('verdict') == 'KILLED_CODE' and own.get('own') is True and own.get('template_matched') is True \
        and elsewhere.get('own') is False and 'origin not at the row guard' in (elsewhere.get('why') or '')
    rows.append(dict(case='real_424_row', expected='KILLED_CODE (origin at :424); not own with the origin at :425',
                     result=dict(killed_code_check=verdict, origin_at_425=elsewhere), passed=bool(ok)))
    first, second = site('twice_a'), site('twice_b')
    check = bridge.row_code_check(first, 'selftest/cl/twice', None)
    verdict = sweep.killed_code_check(first, 'selftest/cl/twice', 'selftest/cl/twice', 'selftest/cl/later', None)
    lines = {s.rpartition(':')[2] for s in check.get('template_sites') or []}
    ok = check.get('own') is False and 'templated guard literal and no recorded origin' in (check.get('why') or '') \
        and {first.rpartition(':')[2], second.rpartition(':')[2]} <= lines and verdict.get('verdict') is None
    rows.append(dict(case='template_two_sites_no_origin', expected='fails closed (own False, both sites listed)',
                     result=dict(row_code_check=check, killed_code_check=verdict), passed=bool(ok)))
    for row in rows:
        row.setdefault('expected_kill', row['expected'])
        row.setdefault('actual_kill', (row['result'].get('killed_code_check') or {}).get('verdict'))
        row.setdefault('covered_later_check', None)
    return rows


def gate_pin_cases(work):
    """The static fallback loads only the pinned gate module (review (c))."""
    import hashlib
    import shutil
    rows = []
    pinned_dir = bridge.ROOT / 'scripts' / 'dg5_gate_e2'
    pin = getattr(bridge, 'GATE_E2_PIN', None)
    saved = (bridge.GATE_E2, list(bridge._GATE_SITES))
    try:
        bridge.GATE_E2 = pinned_dir
        bridge._GATE_SITES[:] = []
        result = bridge.static_single_raise_site('append/durability_class') or {}
        sha = hashlib.sha256((pinned_dir / 'code_sites.py').read_bytes()).hexdigest() if pinned_dir.is_dir() else None
        ok = bool(pin) and result.get('gate_sha256') == sha == pin.get('code_sites.py') and 'evidence' in result
        rows.append(dict(case='gate_pin_pinned', expected='pinned module answers', result=result, passed=bool(ok)))
        tampered = work / 'gate-tampered'
        if not tampered.exists():
            shutil.copytree(pinned_dir if pinned_dir.is_dir() else
                            Path('/home/sittingmongoose/pm-scratch/ea-c12-dg5/admission-gate/gate-e2'), tampered)
            with (tampered / 'code_sites.py').open('a') as handle:
                handle.write('# one changed byte\n')
        bridge.GATE_E2 = str(tampered)
        bridge._GATE_SITES[:] = []
        result = bridge.static_single_raise_site('append/durability_class') or {}
        ok = result.get('ok') is False and 'not the pinned file' in (result.get('reason') or '') \
            and 'evidence' not in result
        rows.append(dict(case='gate_pin_tampered', expected="refused: 'not the pinned file'", result=result,
                         passed=bool(ok)))
    finally:
        bridge.GATE_E2, bridge._GATE_SITES[:] = saved[0], saved[1]
    for row in rows:
        row.setdefault('expected_kill', row['expected'])
        row.setdefault('actual_kill', (row['result'] or {}).get('reason'))
        row.setdefault('covered_later_check', None)
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--work', type=Path)
    args = parser.parse_args()
    work = args.work or Path(tempfile.mkdtemp(prefix='dg5-covered-later-'))
    report = run(work)
    args.out.write_text(json.dumps(report, indent=1, default=str) + '\n')
    for row in report['cases']:
        why = row.get('cannot_decide_reason') or (row['covered_later_check'] or {}).get('reason') or \
            (row.get('killed_code_check') or {}).get('verdict')
        print(f"{'PASS' if row['passed'] else 'FAIL'} {row['case']}: expected {row['expected_kill']}, "
              f"got {row['actual_kill']}" + (f" ({why})" if (row['covered_later_check'] or row.get('killed_code_check'))
                                             else ' (no judge evidence)'))
    print(report['status'])
    return 0 if report['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""Focused DG5 collector regressions: whole-case sharding and per-call retention.

Run: python3 -B scripts/pm_goal_dg5_collector_selftest.py
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pm_goal_dg5_entries as entries
import pm_goal_dg5_sweep as dg5
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables


def check_shard_partition():
    ids = [f'C5/case/{i}' for i in range(40)] + ['C5/pos/one', 'C6/neg/two']
    for total in (1, 2, 3, 4, 7):
        parts = [[case_id for case_id in ids if entries.case_shard_selected(case_id, f'{index}/{total}')]
                 for index in range(total)]
        assert sorted(case_id for part in parts for case_id in part) == sorted(ids), (total, parts)
        assert all(not (set(parts[i]) & set(parts[j])) for i in range(total) for j in range(i + 1, total))
    assert entries.case_shard_selected('C5/case/1', '0/2') == entries.case_shard_selected('C5/case/1', '0/2')
    for bad in ('x', '0/0', '2/2', '-1/2', '0/-1'):
        try:
            entries.case_shard_selected('C5/case/1', bad)
        except ValueError:
            pass
        else:
            raise AssertionError('invalid shard accepted: ' + bad)


def check_collector_releases_sealed_values():
    dg5.install(prove=False)
    collector = sweep.Collector(judge=True)
    tables.COLLECTOR = collector
    row = 'dg5/selftest/row'

    def evaluate(value):
        collector.observe(row, False, ('scripts/pm_goal_dg5_collector_selftest.py', 1))
        return dict(errors=[row], store_snapshot_sha256='a' * 64, store_after_sha256='b' * 64)

    value = dict(store={'big': 'x' * 100000})
    collector.invoke('selftest/negative', evaluate, value, False, target=row, family='goal.updated')
    snapshot = collector.store_snapshots[-1]
    assert 'snapshot_pickle_base64' not in snapshot, snapshot
    assert collector.candidates[row][0] is None, collector.candidates[row]
    assert collector.candidates[row][1] is None, 'candidate sealed value retained'
    assert collector.snapshots[row] is None, 'snapshot sealed value retained'


def check_stateless_reducer_not_an_entry():
    import pm_goal_dg5_adapter as adapter
    import pm_goal_test_source as source

    adapter.install()
    reducer = source.LifecycleReducer('run')
    state = reducer.initial()
    state = reducer.step(state, dict(event_type='goal_run.started', event_id='e1', sequence_id=1),
                          dict(group_digest='g'))
    assert state['status'] == 'started'


def check_schema_validate_routing_guard():
    """A schema row's own validate must not let its inner routed refusal replace the row."""
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_dg5_entries as plumbing

    seen = {}

    class Bank:
        def errors(self, root, value):
            return [object()]

        def validate(self, root, value, code='root'):
            seen['routing'] = bridge.ROUTING[0]
            raise RuntimeError('inner routed refusal')

    plumbing.schema_entry(Bank)
    old_decide, old_active = tables.decide, bridge.ACTIVE[0]
    tables.decide = lambda name, holds, site=None: object()
    bridge.ACTIVE[0] = True
    try:
        try:
            Bank().validate('root', {}, 'x/y')
        except RuntimeError:
            pass
    finally:
        tables.decide, bridge.ACTIVE[0] = old_decide, old_active
    assert seen['routing'] is True, seen


def check_boundaries_schema_row_guard():
    """install_schema_rows (the DG-U banks' path) keeps the schema row identity too."""
    import types

    import pm_goal_dg5_boundaries as bridge

    seen = {}
    fake = types.ModuleType('pm_goal_fake_bank')

    class Bank:
        def errors(self, root, value):
            return [object()]

        def validate(self, root, value, code='root'):
            seen['routing'] = bridge.ROUTING[0]
            raise RuntimeError('inner routed refusal')

    fake.Bank = Bank
    old_banks, old_decide, old_active = bridge.SCHEMA_BANKS, tables.decide, bridge.ACTIVE[0]
    sys.modules['pm_goal_fake_bank'] = fake
    bridge.SCHEMA_BANKS = (('pm_goal_fake_bank', 'Bank', 1, lambda a, k: 'x/y'),)
    tables.decide = lambda name, holds, site=None: object()
    bridge.ACTIVE[0] = True
    try:
        bridge.install_schema_rows()
        try:
            Bank().validate('root', {}, 'x/y')
        except RuntimeError:
            pass
    finally:
        bridge.SCHEMA_BANKS, tables.decide, bridge.ACTIVE[0] = old_banks, old_decide, old_active
        del sys.modules['pm_goal_fake_bank']
    assert seen['routing'] is True, seen


def check_u_bank_validate_routing_guard():
    """install_u_entries' own RootBank wrapper (the DG-U path) keeps the schema row too."""
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_dg_u_owners as owners
    import pm_goal_test_owner_adapters as adapters

    bridge.install_u_entries(owners)
    seen = []
    inst = adapters.RootBank.__new__(adapters.RootBank)
    inst.errors = lambda root, value: (seen.append(bridge.ROUTING[0]), [object()])[1]
    old_decide, old_active = tables.decide, bridge.ACTIVE[0]
    tables.decide = lambda name, holds, site=None: object()
    bridge.ACTIVE[0] = True
    try:
        try:
            inst.validate('root', {}, 'x/y')
        except Exception:
            pass
    finally:
        tables.decide, bridge.ACTIVE[0] = old_decide, old_active
    assert seen and seen[-1] is True, seen


def check_frame_error_target_mapping():
    """A FrameError code whose dynamic suffix contains /schema/ still names its site."""
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_test_storage  # noqa: F401 - target_rows only matches loaded modules

    assert bridge.target_rows('Corrupt:event_record:frame/event/schema/') == \
        'dg5/site/pm_goal_test_storage.py:581'


def check_closure_memo_and_dump_recipe():
    """GO2 port: the memo copy agrees with the guarded reference copy (incl. a cut),
    and a create()-class validator round-trips through the dump class recipe."""
    import hashlib
    import pickle

    import jsonschema
    from referencing import Registry, Resource

    import pm_goal_dg5_closure as closure

    schema = {'$id': 'https://example.test/root', '$schema': 'https://json-schema.org/draft/2020-12/schema',
              'type': 'object',
              'properties': {'a': {'type': 'integer', 'minimum': 3}, 'b': {'$ref': '#/$defs/T'}},
              'required': ['a'], '$defs': {'T': {'type': 'string', 'minLength': 2}}}
    registry = Registry().with_resources(
        [('https://example.test/root', Resource.from_contents(schema))]).crawl()
    plain = jsonschema.Draft202012Validator(schema, registry=registry,
                                             _resolver=registry.resolver(base_uri='https://example.test/root'))
    copy_v = closure.closure_validator(plain, 'selftest', None)
    memo_v, note = closure._memoised(copy_v)
    assert note == 'memo' and memo_v is not copy_v, note
    records, seeds = [], [{'a': 5, 'b': 'xy'}]
    for value in ({'a': 5, 'b': 'xy'}, {'a': 1}, {'b': 'x'}, {'a': 'no'}, {}):
        records.append((hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest(),
                        pickle.dumps(value, protocol=5), closure._signature(copy_v.iter_errors(value))))
    assert closure.agree(plain, copy_v, records) == []
    assert closure.memo_agree(copy_v, memo_v, records, seeds) == []
    from types import SimpleNamespace

    agree_meta = closure._agree_one('selftest', plain, None, seeds, records, SimpleNamespace(memo=True))
    assert agree_meta['search_credit'] == 'none-agree-only'
    assert agree_meta['search_validator'] == 'memo'
    assert agree_meta['memo_agreement']['disagreements'] == 0
    # Regression (dg5:c25e0ff944e76a07): a referenced resource declaring $schema made
    # jsonschema's __init_subclass__ stock evolve shadow the guarded evolve on the
    # Memo subclass, so inner errors lost oracle_guard. The memo copy must agree here.
    target = {'$id': 'https://example.test/target', '$schema': 'https://json-schema.org/draft/2020-12/schema',
              'type': 'object', 'required': ['zz'],
              'properties': {'zz': {'type': 'integer', 'minimum': 3}}}
    ref_schema = {'$ref': 'https://example.test/target'}
    registry2 = Registry().with_resources(
        [('https://example.test/target', Resource.from_contents(target))]).crawl()
    plain2 = jsonschema.Draft202012Validator(ref_schema, registry=registry2,
                                              _resolver=registry2.resolver(base_uri='https://example.test/'))
    copy2 = closure.closure_validator(plain2, 'selftest-ref', None)
    memo2, note2 = closure._memoised(copy2)
    assert note2 == 'memo', note2
    assert closure.memo_agree(copy2, memo2, [], [{'zz': 5}, {}, {'zz': 1}]) == []
    created = jsonschema.validators.create(
        meta_schema=jsonschema.Draft202012Validator.META_SCHEMA,
        validators=dict(jsonschema.Draft202012Validator.VALIDATORS),
        type_checker=jsonschema.Draft202012Validator.TYPE_CHECKER)
    recipe = closure._class_recipe(created)
    assert recipe is not None
    # FMT2 owner format checkers may carry a single exception type, not a tuple.
    single = jsonschema.FormatChecker()
    single.checkers = {'date-time': (isinstance, ValueError)}
    fmt = closure._format_recipe(single)
    assert fmt is not None and closure._rebuild_format(fmt).checkers['date-time'][1] == (ValueError,)
    rebuilt = closure._rebuild_class(recipe)
    # GO2 donor stage: a synthetic close records replay-token witnesses and the
    # reference re-judge passes them.
    import tempfile
    from pathlib import Path as _Path

    donor_args = SimpleNamespace(memo=True, donors=True, donor_dump=[], budget=0, per_clause=0,
                                 clause_cap=900, sample_every=0, out=_Path(tempfile.mkdtemp()) / 'close.json')
    entries, meta = closure._close_one('selftest-donor', plain, None, seeds, records, donor_args, None,
                                       [seeds])
    killed = [x for x in entries.values() if x.get('cls') == 'KILLED']
    assert killed and all(x.get('replay') and x.get('control_sha256') for x in killed), entries
    assert meta['verify']['failed'] == 0 and meta['verify']['passed'] >= 1, meta['verify']
    probe_a, probe_b = created(schema), rebuilt(schema)
    for value in ({'a': 5}, {'a': 1}, {'a': 'no'}):
        assert [e.validator for e in probe_a.iter_errors(value)] == \
               [e.validator for e in probe_b.iter_errors(value)]


def check_dynamic_validator_capture():
    """A factory-created validator class (module attribute nowhere, FMT2 OriginalBank
    shape) is patched and captured on its first validation."""
    import jsonschema

    import pm_goal_dg5_closure as closure

    dynamic = jsonschema.validators.extend(jsonschema.Draft202012Validator, {})
    closure.patch_validator_classes(force=True)  # extend() classes inherit from nobody: gc sweep finds them
    assert dynamic in closure.PATCHED_CLASSES
    assert getattr(dynamic.iter_errors, '_dg5_capture', False)

    class FactoryBank:
        def validator(self, schema):
            return dynamic(schema)

    closure._hook_validator_factory(FactoryBank)
    sink = []
    saved = closure.CAPTURE[0]
    closure.CAPTURE[0] = sink
    try:
        built = FactoryBank().validator({'type': 'integer'})
    finally:
        closure.CAPTURE[0] = saved
    assert sink == [built]


def check_dump_inventory_gate():
    """A dump whose root ids differ from the inventory fails loudly (lead 1118011148)."""
    import json
    import tempfile
    from pathlib import Path

    import pm_goal_dg5_closure as closure

    with tempfile.TemporaryDirectory() as td:
        inv = Path(td) / 'inv.json'
        inv.write_text(json.dumps(dict(all_roots={'dg5:a': {}, 'dg5:b': {}})))
        assert closure._check_dump_ids({'dg5:a', 'dg5:b'}, [inv]) == {'dg5:a', 'dg5:b'}
        try:
            closure._check_dump_ids({'dg5:a'}, [inv])
        except SystemExit as exc:
            assert 'dg5:b' in str(exc)
        else:
            raise AssertionError('dump inventory gate did not fail on a missing root')
    closure._check_dump_nonempty(0, set())
    try:
        closure._check_dump_nonempty(4653, set())
    except SystemExit:
        pass
    else:
        raise AssertionError('zero-root dump from 4653 calls did not fail loudly')


def check_witness_capture_pairing():
    """A witness is stored only for the exact uncut/cut pair the kill test judged."""
    import pm_goal_dg5_closure as closure

    class Err:
        def __init__(self, guard):
            self.oracle_guard = guard
            self.context = []

    closure.common._SCHEMA_LOCATIONS['ident-1'] = 'clause/1'
    orig_search, orig_errors = closure.go.search_clause, closure.go.errors_of
    
    def fake_errors(v, value, cut=frozenset()):
        if not cut:
            return [Err('ident-1')]
        return [Err('other')] if value == {'x': 1} else []  # covered pair first, clean kill later

    def fake_search(clause, keyword, location, info, node, ident, *args, **kwargs):
        closure.go.errors_of(None, {'x': 1})                       # uncut, guard present
        closure.go.errors_of(None, {'x': 2})                       # uncut only: never confirmed
        closure.go.errors_of(None, {'x': 1}, frozenset({ident}))  # cut, guard gone but other errors: covered
        closure.go.errors_of(None, {'x': 3})                       # uncut, guard present
        closure.go.errors_of(None, {'x': 3}, frozenset({ident}))  # cut, no errors: the kill pair wins
        return dict(cls='KILLED')

    closure.go.search_clause, closure.go.errors_of = fake_search, fake_errors
    try:
        orig = closure._install_search_wrappers(object(), object(), 0)
        try:
            closure.go.search_clause('clause/1', 'type', 'loc', {}, {}, 'ident-1')
        finally:
            closure._restore_search_wrappers(orig)
    finally:
        closure.go.search_clause, closure.go.errors_of = orig_search, orig_errors
    import pickle
    assert pickle.loads(closure._WIT['store']['clause/1']) == {'x': 3}


def check_pass2_parent_release():
    """--prove-generated releases the pass-1 collector/bridge memos before the
    pass-2 child re-collects, so the scope cap sees one peak, not pass1+pass2."""
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_guard_tables as tables

    class FakeCollector:
        pass

    fake = FakeCollector()
    fake.ledger, fake.signature_list = [dict(id=0)], [frozenset({1, 2})]
    fake.candidates = {'row': (lambda: None, object(), 'case/label')}
    fake.snapshots = {'row': object()}
    fake.schema_seeds = {('schema',): [('v', dict(x=1), 'p')]}
    fake.store_snapshots, fake.rows = [dict(case='case')], {'row': dict(sites=set())}
    bridge.FROZEN['x'], bridge.FROZEN_PARTS['x'] = (object(), 'sha'), {}
    bridge.MEMBERS['y'], bridge.CASE_BANKS['z'] = 'sha', (object(), 'sha', 'case/id')
    tables._SCHEMAS['k'] = frozenset({'row'})
    tables._PREDICATES['t'] = {}
    try:
        dg5._release_pass1_state(fake)
        assert fake.ledger == [] and fake.signature_list == [] and fake.candidates == {}
        assert fake.snapshots == {} and fake.schema_seeds == {} and fake.store_snapshots == []
        assert fake.rows == {} and not bridge.FROZEN and not bridge.FROZEN_PARTS
        assert not bridge.MEMBERS and not bridge.CASE_BANKS
        assert not tables._SCHEMAS and not tables._PREDICATES
    finally:
        tables._SCHEMAS.clear()
        tables._PREDICATES.clear()


def check_named_context_sentinel():
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_dg_cf1_oracles as cf1

    bridge.bind_context_sentinel(cf1, 'DELETE')
    descriptor = bridge.context_value(cf1.DELETE, None)
    assert descriptor[:3] == ('source_sentinel', cf1.__name__, 'DELETE')
    assert len(descriptor[3]) == 64
    digest = bridge.descriptor_sha256(cf1.cand('payload_ref', cf1.DELETE), None)
    assert len(digest) == 64
    assert digest != bridge.descriptor_sha256(cf1.cand('node_id', cf1.DELETE), None)
    for describe in (bridge.context_value, bridge.descriptor_sha256):
        try:
            describe(object(), None)
        except TypeError:
            pass
        else:
            raise AssertionError('arbitrary identity-only object was accepted')


def check_passive_refusal_rule():
    """Lead 1121000124-5847: a returned UnavailableRead counts as the call's refusal only for the four listed passive
    entries, and only with a code that very call set."""
    import tempfile
    from types import SimpleNamespace

    import pm_goal_dg5_boundaries as bridge
    import pm_goal_dg_ca3_inspection as inspection

    listed = inspection.Inspector.read_original_inspection_custody
    unlisted = inspection.Inspector.read_source_audit  # a fifth Inspector method, not a listed passive entry
    assert len(bridge.PASSIVE_ENTRIES) == 4 and bridge.passive_entry(listed) and not bridge.passive_entry(unlisted)
    for module, qualname in bridge.PASSIVE_ENTRIES:
        owner, method = qualname.split('.')
        assert getattr(getattr(sys.modules[module], owner), method).__qualname__ == qualname, qualname
    receiver = SimpleNamespace(last_code=None)

    def unavailable(code):
        def run():
            receiver.last_code = None  # Inspector.passive resets it at its start
            if code:
                receiver.last_code = code
            return dict(kind='unavailable', reason='missing_original', action_authority='none')
        return run

    # Refuse credit: an available result.
    assert bridge.passive_call(listed, receiver, lambda: dict(kind='original_inspection_custody'))[1] is None
    # Refuse credit: a stale code left by an earlier call; this call never set one.
    receiver.last_code = 'C4I/read_original_inspection_custody/missing'
    assert bridge.passive_call(listed, receiver, lambda: dict(kind='unavailable', reason='x'))[1] is None
    # Refuse credit: the same return and code from a fifth, unlisted entry.
    assert bridge.passive_call(unlisted, receiver, unavailable('C4I/x/missing'))[1] is None
    # Grant: the exact code set by this call.
    assert bridge.passive_call(listed, receiver, unavailable('C4I/x/missing'))[1] == 'C4I/x/missing'

    # End to end through entry_call and the kill judge: a passive owner whose one routed predicate refuses.
    dg5.install(prove=False)
    class Refusal(Exception):
        pass

    def require(code, condition):
        if not condition:
            raise Refusal(code)

    routed = bridge.guard_wrapper(require)

    class Owner:
        def __init__(self, present, code):
            self.present, self.code, self.last_code = present, code, None

        def read(self):
            self.last_code = None
            try:
                routed(self.code, self.present)  # the one routed predicate (its row is this file and line)
            except Exception as error:  # the passive owner turns the refusal into a typed result
                self.last_code = str(error)
                return dict(kind='unavailable', reason='missing_original', action_authority='none')
            return dict(kind='original_inspection_custody')
    Owner.read.__module__, Owner.read.__qualname__ = listed.__module__, listed.__qualname__
    line = Owner.read.__code__.co_firstlineno + 3
    row = 'dg5/site/pm_goal_dg5_collector_selftest.py:%d' % line
    outcomes = {}
    saved_discovery = tables.DISCOVERY
    tables.DISCOVERY = True  # the collection's own mode: rows are decided from their conditions, cuts from CUT
    for name, declared, present in (('exact', 'C4I/selftest/missing', False), ('different', 'C4I/selftest/other', False)):
        collector = sweep.Collector(judge=True)
        tables.COLLECTOR = collector
        owner = Owner(present, 'C4I/selftest/missing')
        with tempfile.TemporaryDirectory(prefix='dg5-passive-', dir=os.environ.get('TMPDIR')) as work:
            case = dict(id='selftest/' + name, expected=declared)
            bridge.CASE[0] = case
            try:
                bridge.entry_call(case, case['id'] + '/Inspector.read_original_inspection_custody', 'goal.cancelled',
                                  lambda: owner.read(), Path(work), world=SimpleNamespace(work=work),
                                  arguments=dict(receiver=owner, args=(), kwargs={}), original=Owner.read,
                                  target=row if name == 'exact' else 'dg5/site/pm_goal_dg5_collector_selftest.py:1')
            finally:
                bridge.CASE[0] = None
        record = collector.ledger[-1]
        outcomes[name] = (record.get('outcome'), record.get('errors'), record.get('kill'),
                          record.get('cut_errors'), record.get('restoration_errors'))
    tables.DISCOVERY = saved_discovery
    assert outcomes['exact'][1] == [row], outcomes
    assert outcomes['exact'][0] == 'exact_expected', outcomes
    # Grant: cut gives an available result (no refusal), restore gives the same refusal row, so the judge kills it.
    assert outcomes['exact'][2] == 'KILLED' and outcomes['exact'][3] == [] and outcomes['exact'][4] == [row], outcomes
    assert outcomes['different'][0] != 'exact_expected', outcomes
    assert not bridge.FAILURES, bridge.FAILURES
    print('passive rule outcomes', outcomes)


def check_judge_replay_bound():
    import tempfile
    import time
    from unittest.mock import patch

    import pm_goal_dg5_boundaries as bridge
    import pm_goal_dg5_judge_replay as judge_replay

    class Refusal(Exception):
        pass

    def require(code, condition):
        if not condition:
            raise Refusal(code)

    routed = bridge.guard_wrapper(require)
    dg5.install(prove=False)
    collector = sweep.Collector(judge=True)
    with tempfile.TemporaryDirectory(prefix='dg5-judge-bound-') as tmp:
        work = Path(tmp) / 'store'
        work.mkdir()
        (work / 'original').write_text('intact')
        marker = work.parent / 'replay-pid'

        def action():
            routed('selftest/judge-bound', False)
            (work / 'original').write_text('cut')
            marker.write_text(str(os.getpid()))
            time.sleep(4)

        row = bridge.site_name(__file__, action.__code__.co_firstlineno + 1)
        with patch.object(tables, 'COLLECTOR', collector), patch.object(tables, 'DISCOVERY', True), \
                patch.object(judge_replay, 'WALL_SECONDS', 1):
            result, _ = bridge.invoke('selftest/judge-bound', 'goal.cancelled', action, work,
                                      arguments={}, valid=False, target=row)
        record = collector.ledger[-1]
        assert result['errors'] == [row] and record['outcome'] == 'exact_expected', record
        assert record['kill'] == 'JUDGE_BOUND' and not collector.replays, record
        bound = record['judge_bound']
        assert bound['cut'] == [row] and bound['wall_limit_seconds'] == 1, bound
        assert bound['elapsed_seconds'] >= 1 and 'rss_growth_kib_per_second' in bound, bound
        assert (work / 'original').read_text() == 'intact'
        assert not list(work.parent.glob('fork-*.pkl'))
        pid = int(marker.read_text())
        try:
            os.waitpid(pid, os.WNOHANG)
        except ChildProcessError:
            pass
        else:
            raise AssertionError(f'replay child {pid} was not reaped')


def check_direct_replay_cap_isolation():
    """C9: /direct/ records carry their own REPLAY_CAP/REPLAY_LIMIT key so they cannot exhaust
    registered entries' cap (or vice versa), across single-target, duplicate-set, and ReplayBound rollback."""
    from unittest.mock import patch

    import pm_goal_dg5_judge_replay as judge_replay
    import pm_goal_oracle_common as common

    dg5.install(prove=False)
    fam = 'goal.updated'
    row = 'dg5/selftest/c9_first/schema'
    row_second = 'dg5/selftest/c9_second/schema'

    def killed_code_eval(value):
        gate = common.Gates()
        gate.require(row, value['x'])
        if not gate.errors:
            gate.require(row_second, value['x'])
        errors = sorted(gate.errors)
        which = errors[0].split('/')[-2] if errors else None
        code = None if not errors else f'selftest/{which}/schema/x'
        where = ['scripts/selftest_owner.py', 10 if which == 'c9_first' else 20]
        return dict(errors=errors, refusal_code=code,
                    refusal_origin=dict(site=where, frames=[where + ['check', False, False]]),
                    refusing_sites=[(e, where) for e in errors],
                    store_after_sha256='0' * 64, owner_state_sha256='1' * 64, owner_state=dict(hook='selftest'))

    def single_kill_eval(target_row):
        def evaluate(value):
            gate = common.Gates()
            gate.require(target_row, value['x'])
            return gate.errors
        return evaluate

    def dup_eval(value):
        gate = common.Gates()
        gate.require('dg5/selftest/c9_dup_a', value['x'])
        gate.require('dg5/selftest/c9_dup_b', value['x'])
        return gate.errors

    def cannot_decide_eval(target_row):
        def evaluate(value):
            gate = common.Gates()
            gate.require(target_row, value['x'])
            if gate.errors:
                return gate.errors
            gate.require(target_row + '_late', value['x'])
            return gate.errors
        return evaluate

    collector = sweep.Collector(judge=True)
    with patch.object(tables, 'ACTIVE', True), patch.object(tables, 'DISCOVERY', True), \
            patch.object(tables, 'COLLECTOR', collector):
        # 1. REPLAY_CAP direct KILLED_CODE records saturate the direct bucket only; registered entry still gets KILLED.
        for i in range(sweep.REPLAY_CAP):
            collector.invoke(f'c9/case_{i}/direct/Cmd.run', killed_code_eval, dict(x=False), False,
                             target=row, family=fam, generated=True)
            assert collector.ledger[-1]['kill'] == 'KILLED_CODE', collector.ledger[-1]
        collector.invoke('c9/case_over/direct/Cmd.run', killed_code_eval, dict(x=False), False,
                         target=row, family=fam, generated=True)
        assert collector.ledger[-1]['kill'] == 'NOT_REPLAYED_CAP', collector.ledger[-1]

        # Registered entry on the exact same (row, family) must still be judged KILLED, not NOT_REPLAYED_CAP.
        collector.invoke('c9/witness/Owner.capture', single_kill_eval(row), dict(x=False), False,
                         target=row, family=fam, generated=True)
        assert collector.ledger[-1]['kill'] == 'KILLED', collector.ledger[-1]

        # Registered entries still cap themselves at REPLAY_CAP (3 more kills -> 4 total, 5th caps).
        for i in range(sweep.REPLAY_CAP - 1):
            collector.invoke(f'c9/reg_{i}/Owner.capture', single_kill_eval(row), dict(x=False), False,
                             target=row, family=fam, generated=True)
            assert collector.ledger[-1]['kill'] == 'KILLED', collector.ledger[-1]
        collector.invoke('c9/reg_over/Owner.capture', single_kill_eval(row), dict(x=False), False,
                         target=row, family=fam, generated=True)
        assert collector.ledger[-1]['kill'] == 'NOT_REPLAYED_CAP', collector.ledger[-1]

        # 2. Symmetric: registered kills cannot exhaust the /direct/ cap on another row.
        row2 = 'dg5/selftest/c9_row2'
        for i in range(sweep.REPLAY_CAP):
            collector.invoke(f'c9/r2_reg_{i}/Owner.op', single_kill_eval(row2), dict(x=False), False,
                             target=row2, family=fam, generated=True)
            assert collector.ledger[-1]['kill'] == 'KILLED', collector.ledger[-1]
        collector.invoke('c9/r2_reg_over/Owner.op', single_kill_eval(row2), dict(x=False), False,
                         target=row2, family=fam, generated=True)
        assert collector.ledger[-1]['kill'] == 'NOT_REPLAYED_CAP', collector.ledger[-1]
        collector.invoke('c9/r2_dir/direct/Cmd.op', single_kill_eval(row2), dict(x=False), False,
                         target=row2, family=fam, generated=True)
        assert collector.ledger[-1]['kill'] == 'KILLED', collector.ledger[-1]

        # 3. REPLAY_LIMIT is also partitioned between direct and registered.
        row3 = 'dg5/selftest/c9_limit'
        with patch.object(sweep, 'REPLAY_LIMIT', 2):
            for i in range(2):
                collector.invoke(f'c9/lim_{i}/direct/Cmd.op', cannot_decide_eval(row3), dict(x=False), False,
                                 target=row3, family=fam, generated=True)
                assert collector.ledger[-1]['kill'] == 'CANNOT_DECIDE', collector.ledger[-1]
            collector.invoke('c9/lim_over/direct/Cmd.op', single_kill_eval(row3), dict(x=False), False,
                             target=row3, family=fam, generated=True)
            assert collector.ledger[-1]['kill'] == 'NOT_REPLAYED_CAP', collector.ledger[-1]
            collector.invoke('c9/lim_reg/Owner.op', single_kill_eval(row3), dict(x=False), False,
                             target=row3, family=fam, generated=True)
            assert collector.ledger[-1]['kill'] == 'KILLED', collector.ledger[-1]

        # 4. _site_cuts (duplicate sets) uses the same partitioned key.
        dup_target = ('dg5/selftest/c9_dup_a', 'dg5/selftest/c9_dup_b')
        for i in range(sweep.REPLAY_CAP):
            collector.invoke(f'c9/dup_{i}/direct/Cmd.dup', dup_eval, dict(x=False), False,
                             target=dup_target, family=fam, generated=True)
            assert collector.ledger[-1]['kill'] == 'DUPLICATE_SET_KILLED', collector.ledger[-1]
        collector.invoke('c9/dup_over/direct/Cmd.dup', dup_eval, dict(x=False), False,
                         target=dup_target, family=fam, generated=True)
        assert collector.ledger[-1]['kill'] == 'NOT_REPLAYED_CAP', collector.ledger[-1]
        collector.invoke('c9/dup_reg/Owner.dup', dup_eval, dict(x=False), False,
                         target=dup_target, family=fam, generated=True)
        assert collector.ledger[-1]['kill'] == 'DUPLICATE_SET_KILLED', collector.ledger[-1]

    # 5. ReplayBound rollback in pm_goal_dg5_sweep decrements the exact partitioned key (both registered and direct).
    rb_collector = sweep.Collector(judge=True)

    def bound_on_joint_eval(value):
        if row in tables.CUT and row_second in tables.CUT:
            raise judge_replay.ReplayBound(dict(cut=sorted(tables.CUT), wall_limit_seconds=1, elapsed_seconds=1.1))
        return killed_code_eval(value)

    with patch.object(tables, 'ACTIVE', True), patch.object(tables, 'DISCOVERY', True), \
            patch.object(tables, 'COLLECTOR', rb_collector):
        for label in ('c9/rb_reg/Owner.capture', 'c9/rb_dir/direct/Cmd.run'):
            rb_collector.invoke(label, bound_on_joint_eval, dict(x=False), False,
                                target=row, family=fam, generated=True)
            rec = rb_collector.ledger[-1]
            assert rec['kill'] == 'JUDGE_BOUND', rec
            assert 'killed_code_check' not in rec, rec
        assert not rb_collector.replays, dict(rb_collector.replays)


def main():
    check_named_context_sentinel()
    check_frame_error_target_mapping()
    check_closure_memo_and_dump_recipe()
    check_dynamic_validator_capture()
    check_dump_inventory_gate()
    check_witness_capture_pairing()
    check_pass2_parent_release()
    check_shard_partition()
    check_collector_releases_sealed_values()
    check_stateless_reducer_not_an_entry()
    check_schema_validate_routing_guard()
    check_boundaries_schema_row_guard()
    check_u_bank_validate_routing_guard()
    check_passive_refusal_rule()
    check_judge_replay_bound()
    check_direct_replay_cap_isolation()
    print('pm_goal_dg5_collector_selftest: PASS')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

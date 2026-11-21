#!/usr/bin/env python3
"""Self-test of the forked Method B judge (pm_goal_dg5_methodb_judge.py), one integrated_native world.

  python3 -B scripts/pm_goal_dg5_methodb_judge_selftest.py --source OWNER --out REPORT.json [--only 1,2,3,4]

OWNER is the owner checkout (34f212d3fb, Plans from 3af916f4b6). One CancelWorld is built, projected and cut over;
the request check (dg5/request/schema, read_retained_native) and the current cancelled view
(read_current_cancelled) are judged on it. Each test also shows W3's unmodified behaviour (the harness at
bc76ebc6b8, loaded from git) failing the same assertion where that is meaningful.

  1 fork + cache reset: warm every schema cache of the parent with an accept for the defective call's key; the
    forked verdict equals the cold verdict; the same warm state in-process with no reset changes the verdict.
  2 edit_path: the member lands exactly at the path; the default equals W3's placement byte for byte.
  3 edit_placement: pre records the edited value's key digest, post the unedited one (also through an owner knob).
  4 joint cut: private_sources with private is accepted by rule 2 and KILLED; a different node and, separately, a
    different value are refused (IDENTITY_MISMATCH), and a refused joint set gets no ledger record.
Exit 0 only when every selected test passes.
"""
import argparse
import copy
import importlib.util
import json
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import pm_goal_dg5_methodb_judge as judge  # noqa: E402

W3_HEAD = 'bc76ebc6b83bbdeb8449e5c73c00be0345d33696'
REQUEST = 'dg5/request/schema'
SOURCES = 'dg5/current/private_sources/schema'
PRIVATE = 'dg5/current/private/schema'
SUCCESS = 'dg5/current/success/schema'
GOAL = 'dg5/int/current/actual_goal/schema'
CACHE_SITE = ['scripts/pm_goal_dg_int_schema_cache.py', 31]
ROUTES = {
    REQUEST: dict(call='read_request', edition='integrated_native', root='dg5:b52a0b33e5cbefac', site=CACHE_SITE,
                  refusal='request/schema/',
                  detail=["Additional properties are not allowed ('methodb_extra' was unexpected)"]),
    SOURCES: dict(call='current_cancelled', edition='integrated_native', root='dg5:1304d9a49b222c70', site=CACHE_SITE),
    GOAL: dict(call='current_cancelled', edition='integrated_native', root='dg5:6fa420e28c13ac83', site=CACHE_SITE),
}


def w3_original():
    """W3's harness exactly as committed at its head, as a separate module."""
    text = subprocess.check_output(['git', '-C', str(HERE), 'show', f'{W3_HEAD}:scripts/pm_goal_dg5_methodb_cancelled.py'])
    spec = importlib.util.spec_from_loader('w3_original_bc76eb', loader=None)
    module = importlib.util.module_from_spec(spec)
    module.__file__ = str(HERE / 'pm_goal_dg5_methodb_cancelled.py')
    exec(compile(text, f'{W3_HEAD[:10]}:scripts/pm_goal_dg5_methodb_cancelled.py', 'exec'), module.__dict__)
    return module


def tables_for(source, rows):
    import pm_goal_guard_sweep as sweep
    import pm_goal_guard_tables as tables

    tables.PHASE_PREFIX = 'pm_goal_dg5_cancelled_phase_'
    tables._ROWS = {}
    declared = HERE.parent / 'reports/event-authority-20261114/goal-run-cancelled-methodb/request.json'
    sites = {REQUEST: [tuple(site) for site in json.loads(declared.read_text())['sites']]}
    for row in rows:
        table = sweep.table_id([row])
        text = sweep.table_source(table, [row], {row: sites.get(row, [tuple(CACHE_SITE)])})
        path = source / 'scripts' / (tables.PHASE_PREFIX + table + '.py')
        if not path.exists():
            path.write_text(text)
        judge.require(path.read_text() == text, f'{path.name} differs from the standard generator')
        tables._ROWS[row] = dict(table=table, phase=True)


def ledger_verdict(collector):
    keys = ('outcome', 'kill', 'errors', 'cut_errors', 'restoration_errors', 'target')
    return [{key: record.get(key) for key in keys} for record in collector.ledger]


def example(source, row, collector, **options):
    return judge.ForkedExample(source, row, ROUTES[row], collector, None, options=judge.options_of(options))


def one_trial(ex, world, action, inputs, edit, kind):
    initial = ex.store_state(world)
    result, out = ex.fork_trial(world, action, inputs, edit, initial, kind)
    return result, out, ex.forks[-1]


class Report:
    def __init__(self):
        self.tests = {}

    def check(self, test, name, ok, **evidence):
        self.tests.setdefault(test, dict(checks=[], passed=True))
        self.tests[test]['checks'].append(dict(name=name, ok=bool(ok), **evidence))
        self.tests[test]['passed'] &= bool(ok)
        print(f"  [{'PASS' if ok else 'FAIL'}] {test}: {name}", flush=True)


def test_placement_keys(report, source, world, read_request, request, w3orig):
    """Tests 2 and 3 on the request check (passive read, cached int bank)."""
    import pm_goal_guard_sweep as sweep

    ex = example(source, REQUEST, sweep.Collector())
    control, _, _ = one_trial(ex, world, read_request, request, None, 'control')
    post, _, post_fork = one_trial(ex, world, read_request, request, judge.MARKER, 'defect')
    control_doc = control['observations'][0]['document']
    post_doc = post['observations'][0]['document']
    # W3's own harness, unmodified, in its own fork (W3 resets world.roots itself).
    ex_w3 = w3orig.OwnerExample(source, REQUEST, ROUTES[REQUEST], sweep.Collector(), None)
    _, payload = judge.fork_run(lambda: ex_w3.call(world, read_request, request, judge.MARKER))
    judge.require(payload['ok'], payload)
    w3_trial = payload['value']
    w3_doc = w3_trial['observations'][0]['document']

    # -- test 2: edit_path
    path = ['scope']
    ex_path = example(source, REQUEST, sweep.Collector(), edit_path=path)
    at_path, _, _ = one_trial(ex_path, world, read_request, request, judge.MARKER, 'defect')
    path_doc = at_path['observations'][0]['document']
    report.check(2, 'default placement adds exactly the root member', judge.additions(control_doc, post_doc) == [[judge.MARKER]],
                 additions=judge.additions(control_doc, post_doc))
    report.check(2, "default placement equals W3's unmodified placement (document, refusal, detail)",
                 post_doc == w3_doc and post['refusal'] == w3_trial['refusal'] and post['detail'] == w3_trial['detail'],
                 judge_refusal=post['refusal'], w3_refusal=w3_trial['refusal'])
    report.check(2, f'edit_path {path} lands exactly there and nowhere else',
                 judge.additions(control_doc, path_doc) == [path + [judge.MARKER]] and judge.marker_paths(path_doc) == [path],
                 additions=judge.additions(control_doc, path_doc), refusal=at_path.get('refusal'), detail=at_path.get('detail'))
    report.check(2, 'the path defect is still refused by the selected check', bool(at_path['errors']),
                 errors=at_path['errors'])
    report.check(2, "teeth: W3's unmodified placement fails the edit_path assertion",
                 judge.additions(control_doc, w3_doc) != [path + [judge.MARKER]],
                 w3_additions=judge.additions(control_doc, w3_doc))

    # -- test 3: edit_placement (cache key)
    ex_pre = example(source, REQUEST, sweep.Collector(), edit_placement='pre')
    pre, _, pre_fork = one_trial(ex_pre, world, read_request, request, judge.MARKER, 'defect')
    pre_doc = pre['observations'][0]['document']
    unedited, edited = judge.value_digest(control_doc), judge.value_digest(post_doc)
    post_key = [k['key_sha256'] for k in post_fork['keys']]
    pre_key = [k['key_sha256'] for k in pre_fork['keys']]
    report.check(3, 'post: the key digest seen is the unedited value', post_key == [unedited] and unedited != edited,
                 key=post_key, unedited=unedited, edited=edited)
    report.check(3, 'pre: the key digest seen is the edited value',
                 pre_key == [judge.value_digest(pre_doc)] and pre_doc == post_doc and pre_key != [unedited], key=pre_key)
    report.check(3, 'pre: the same refusal as post', pre['refusal'] == post['refusal'] and pre['detail'] == post['detail'],
                 refusal=pre['refusal'])
    report.check(3, "teeth: W3's placement (post, shown equal to W3 above) fails the pre assertion",
                 post_key != [edited], w3_key=post_key)
    return dict(control_doc=control_doc, post_doc=post_doc, post_key=post_fork['keys'][0])


def test_knob(report, source, world, read_current, current_inputs):
    """Test 3 through the owner knob current_goal_edit (pm_goal_dg_int_cancel.py:905)."""
    import pm_goal_guard_sweep as sweep

    ex = example(source, GOAL, sweep.Collector())
    control, _, _ = one_trial(ex, world, read_current, current_inputs, None, 'control')
    knob = example(source, GOAL, sweep.Collector(), edit_placement='pre', edit_knob='current_goal_edit')
    defect, _, fork = one_trial(knob, world, read_current, current_inputs, judge.MARKER, 'defect')
    post, _, post_fork = one_trial(ex, world, read_current, current_inputs, judge.MARKER, 'defect')
    edited = judge.value_digest(defect['observations'][0]['document'])
    unedited = judge.value_digest(control['observations'][0]['document'])
    report.check(3, 'knob pre: the owner knob ran once and the key digest is the edited value',
                 fork.get('knob_calls') == 1 and [k['key_sha256'] for k in fork['keys']] == [edited] and edited != unedited,
                 key=[k['key_sha256'] for k in fork['keys']], edited=edited, unedited=unedited, knob_calls=fork.get('knob_calls'))
    report.check(3, 'knob pre: refuses at int/current/actual_goal', defect.get('refusal') == 'int/current/actual_goal/schema/',
                 refusal=defect.get('refusal'))
    report.check(3, 'post on the same check: key digest is the unedited value',
                 [k['key_sha256'] for k in post_fork['keys']] == [unedited], key=[k['key_sha256'] for k in post_fork['keys']])


def warm(instances, entries):
    saved = [dict(item.success) for item in instances]
    for item in instances:
        for key in entries:
            item.success[key] = False  # what the cache stores after an accepting validate
    return saved


def unwarm(instances, saved):
    for item, success in zip(instances, saved):
        item.success.clear()
        item.success.update(success)


def warm_entries(keys):
    """The key the cache computes at the selected check of the defective call, and the full defective value's key."""
    key = keys['post_key']
    return [('validate', key['realm'], key['ref'], bytes.fromhex(key['key_sha256'])),
            ('validate', key['realm'], key['ref'], bytes.fromhex(judge.value_digest(keys['post_doc'])))]


def test_fork_reset(report, source, world, read_request, request, keys):
    """Test 1, forked part: the cold verdict, then the same judge on a parent whose schema caches are warm."""
    import pm_goal_guard_sweep as sweep

    entries = warm_entries(keys)
    instances = judge.cache_instances()
    cold = sweep.Collector()
    with patch.object(sweep, 'REPLAY_CAP', 8):
        example(source, REQUEST, cold).prove(world, read_request, request)
    saved = warm(instances, entries)
    try:
        warm_collector = sweep.Collector()
        ex = example(source, REQUEST, warm_collector)
        with patch.object(sweep, 'REPLAY_CAP', 8):
            ex.prove(world, read_request, request)
    finally:
        unwarm(instances, saved)
    inherited = [[c['entries'] for c in f['cache_inherited']] for f in ex.forks]
    expected = [len(set(s) | set(entries)) for s in saved]
    started = [[(c['hits'], c['misses'], c['entries']) for c in f['cache_start']] for f in ex.forks]
    report.check(1, 'cold forked verdict is KILLED', ledger_verdict(cold)[1]['kill'] == 'KILLED',
                 cold=ledger_verdict(cold))
    report.check(1, 'warm parent: every fork inherited the warm entries and started from empty caches',
                 all(f == expected for f in inherited) and all(v == (0, 0, 0) for f in started for v in f),
                 inherited=inherited, expected=expected)
    report.check(1, 'warm forked verdict equals the cold verdict', ledger_verdict(warm_collector) == ledger_verdict(cold),
                 warm=ledger_verdict(warm_collector))
    report.check(1, 'every trial ran in its own child; parent unchanged after each',
                 len({f['pid'] for f in ex.forks}) == len(ex.forks) == 5 and all(f['parent_unchanged'] for f in ex.forks),
                 pids=[f['pid'] for f in ex.forks])
    return ledger_verdict(cold)


def test_fork_reset_in_process(report, source, world, read_request, request, w3orig, keys, cold_verdict):
    """Test 1, comparators (run last: they change the world): W3's harness in-process on the same warm state."""
    import contextlib
    import pm_goal_guard_sweep as sweep

    entries = warm_entries(keys)
    instances = judge.cache_instances()
    outcomes = {}
    for name, reset in (('w3_unmodified_in_process', True), ('w3_in_process_no_reset', False)):
        saved = warm(instances, entries)
        collector = sweep.Collector()
        ex = w3orig.OwnerExample(source, REQUEST, ROUTES[REQUEST], collector, None)
        shim = type(sys)('pm_goal_dg_int_schema_cache')
        shim.Roots = type('NotTheCache', (), {})
        try:
            with (contextlib.nullcontext() if reset else patch.dict(sys.modules, {'pm_goal_dg_int_schema_cache': shim})), \
                    patch.object(sweep, 'REPLAY_CAP', 8):
                ex.prove(world, read_request, request)
            raised = None
        except Exception as error:  # noqa: BLE001 - the verdict under test
            raised = f'{type(error).__name__}: {str(error)[:300]}'
        finally:
            unwarm(instances, saved)
        outcomes[name] = dict(raised=raised, ledger=ledger_verdict(collector))
    no_reset = outcomes['w3_in_process_no_reset']
    report.check(1, 'teeth: the same warm state in-process with no reset changes the verdict',
                 no_reset['raised'] is not None or no_reset['ledger'] != cold_verdict, **outcomes)


def test_joint(report, source, world, read_current, current_inputs):
    import pm_goal_guard_sweep as sweep

    collector = sweep.Collector()
    ex = example(source, SOURCES, collector, joint_cut=[PRIVATE])
    with patch.object(sweep, 'REPLAY_CAP', 8):
        ex.prove(world, read_current, current_inputs)
    joint = ex.joint_report
    identity = joint['identity']
    report.check(4, 'rule 2 accepts private_sources with private (one node, one base, one value)',
                 identity['ok'] and len(identity['members']) == 2 and identity['same_node_object'],
                 identity={k: v for k, v in identity.items() if k != 'members'},
                 members=[{k: m[k] for k in ('row', 'site', 'path', 'nodes', 'value_sha256')} for m in identity['members']])
    report.check(4, 'joint verdict KILLED (refuses at the row; joint cut accepts; each alone refuses; each cut alone '
                    'refuses; restoration refuses at the row)', joint.get('verdict') == 'KILLED',
                 checks=joint.get('checks'), kill=joint.get('kill'), site_cuts=joint.get('site_cuts'),
                 member_cut_alone=joint.get('member_cut_alone'))
    report.check(4, 'every joint trial in its own fork',
                 len({f['pid'] for f in ex.forks}) == len(ex.forks) and all(f['parent_unchanged'] for f in ex.forks),
                 trials=[(f['kind'], f['pid']) for f in ex.forks])

    # Constructed mismatch on the real members: one leaf of the shared value changed in the private member only.
    target = ex.probe['target_identity']
    member = next(m for m in ex.probe['members'] if m['row'] == PRIVATE)
    bank = judge.find_object(*member['bank'])
    plain = bank.validator(member['realm'], member['ref'])
    document = copy.deepcopy(member['document'])
    holder = judge.resolve_path(document, member['identity']['path'])
    leaf = first_string_leaf({k: v for k, v in holder.items() if k != judge.MARKER})
    judge.require(leaf, 'the shared value has no string leaf to change')
    parent = judge.resolve_path(holder, leaf[:-1])
    parent[leaf[-1]] = parent[leaf[-1]] + '-changed'
    changed = judge.member_identity(plain, document)
    real = [dict(row=target['row'], site=target['site'], identity=target['identity']),
            dict(row=PRIVATE, site=member['site'], identity=member['identity'])]
    perturbed = [real[0], dict(real[1], identity=changed)]
    report.check(4, 'real members recomputed in the parent: accepted', judge.identity_verdict(real)['ok'])
    verdict = judge.identity_verdict(perturbed)
    report.check(4, 'constructed mismatch, different value (real private member, one leaf changed): refused',
                 not verdict['ok'] and 'different value' in verdict['reason'] and 'node' not in verdict['reason'],
                 reason=verdict['reason'], leaf=leaf)

    # Constructed mismatch, different node: the same embedding shape in a small registry.
    for name, ok, reason in synthetic_identity():
        report.check(4, name, ok, reason=reason)

    # A refused joint set is never judged: no ledger record targets it.
    refused = sweep.Collector()
    mismatch = example(source, SOURCES, refused, joint_cut=[SUCCESS])
    try:
        mismatch.prove(world, read_current, current_inputs)
        raised = None
    except judge.IdentityMismatch as error:
        raised = str(error)
    report.check(4, 'a real mismatched set (private_sources with success) is IDENTITY_MISMATCH and gets no ledger record',
                 raised is not None and mismatch.joint_report['verdict'] == 'IDENTITY_MISMATCH' and not refused.ledger,
                 reason=raised, trials=[f['kind'] for f in mismatch.forks])


def first_string_leaf(value, here=()):
    if isinstance(value, str):
        return list(here)
    items = value.items() if isinstance(value, dict) else enumerate(value) if isinstance(value, list) else ()
    for key, item in items:
        found = first_string_leaf(item, here + (key,))
        if found:
            return found
    return None


def synthetic_identity():
    import jsonschema
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012

    inner = {'$id': 'https://selftest.local/inner', '$defs': {'Node': {
        'type': 'object', 'properties': {'a': {'type': 'string'}}, 'additionalProperties': False}}}
    other = copy.deepcopy(inner)
    other['$id'] = 'https://selftest.local/other'
    other['$defs']['Node']['properties']['b'] = {'type': 'string'}
    outer = {'$id': 'https://selftest.local/outer', 'type': 'object', 'additionalProperties': False,
             'properties': {'sources': {'$ref': 'https://selftest.local/inner#/$defs/Node'},
                            'shadow': {'$ref': 'https://selftest.local/other#/$defs/Node'}}}
    registry = Registry().with_resources([(r['$id'], Resource.from_contents(r, default_specification=DRAFT202012))
                                          for r in (inner, other, outer)])

    def validator(ref):
        return jsonschema.Draft202012Validator({'$ref': ref}, registry=registry)

    value = {'a': 'x', judge.MARKER: 'example'}
    alone = dict(row='alone', site=None, identity=judge.member_identity(validator('https://selftest.local/inner#/$defs/Node'),
                                                                       copy.deepcopy(value)))
    embedded = dict(row='embedded', site=None, identity=judge.member_identity(validator('https://selftest.local/outer'),
                                                                             {'sources': copy.deepcopy(value)}))
    shadow = dict(row='shadow', site=None, identity=judge.member_identity(validator('https://selftest.local/outer'),
                                                                         {'shadow': copy.deepcopy(value)}))
    changed = dict(row='changed', site=None, identity=judge.member_identity(
        validator('https://selftest.local/outer'), {'sources': {'a': 'y', judge.MARKER: 'example'}}))
    same = judge.identity_verdict([alone, embedded])
    node = judge.identity_verdict([alone, shadow])
    other_value = judge.identity_verdict([alone, changed])
    return [('synthetic: the same node embedded by $ref is accepted', same['ok'], same['reason']),
            ('constructed mismatch, different node (same value, another closed node): refused',
             not node['ok'] and 'node' in node['reason'] and 'value' not in node['reason'], node['reason']),
            ('constructed mismatch, different value (same node): refused',
             not other_value['ok'] and 'different value' in other_value['reason'] and 'node' not in other_value['reason'],
             other_value['reason'])]


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--only', default='1,2,3,4')
    args = parser.parse_args()
    only = {int(x) for x in args.only.split(',')}
    source = args.source.resolve()
    sys.path.insert(0, str(source / 'scripts'))
    started = time.monotonic()
    report = Report()
    w3orig = w3_original()
    tables_for(source, [REQUEST, SOURCES, GOAL])
    import pm_goal_dg_r_oracles as original
    import pm_goal_dg_r_readers as reader

    declare = dict(row=SOURCES)
    work = Path(tempfile.mkdtemp(prefix='mbjudge-selftest-', dir=args.out.parent))
    world, read_current, current_inputs = judge.judge_fixture(declare, ROUTES[SOURCES], work)
    consumer = getattr(world, 'consumer_class', reader.Consumer)(world)
    presentation = reader.Presentation(world)
    request = original.request_of(world)

    def read_request():
        return consumer.read_retained_native(copy.deepcopy(request), presentation)

    built = round(time.monotonic() - started, 1)
    print(f'world built in {built} s', flush=True)
    keys = None
    if only & {1, 2, 3}:
        keys = test_placement_keys(report, source, world, read_request, request, w3orig)
    if 3 in only:
        test_knob(report, source, world, read_current, current_inputs)
    cold = test_fork_reset(report, source, world, read_request, request, keys) if 1 in only else None
    if 4 in only:
        test_joint(report, source, world, read_current, current_inputs)
    if 1 in only:
        test_fork_reset_in_process(report, source, world, read_request, request, w3orig, keys, cold)
    for test in sorted(only):
        report.tests.setdefault(test, dict(checks=[], passed=False))
    result = dict(judge_sha256=judge.JUDGE['module_sha256'], harness_sha256=judge.JUDGE['harness_sha256'],
                  w3_head=W3_HEAD, source=str(source), world_seconds=built, seconds=round(time.monotonic() - started, 1),
                  forks=len(judge.JUDGE['trials']), passed=all(t['passed'] for t in report.tests.values()),
                  tests={str(k): v for k, v in sorted(report.tests.items())},
                  fork_records=[dict(route=t['route'], kind=t['kind'], cut=t['cut'], pid=t['pid'],
                                     credited=t['credited'], parent_unchanged=t['parent_unchanged'],
                                     cache_inherited=[(c['bank'], c['hits'], c['misses'], c['entries'])
                                                      for c in t['cache_inherited']],
                                     cache_start=[(c['hits'], c['misses'], c['entries']) for c in t['cache_start']],
                                     cache_end=[(c['hits'], c['misses']) for c in t['cache_end']],
                                     keys=[(k['occurrence'], k['key_sha256'], k['hit']) for k in t['keys']])
                                for t in judge.JUDGE['trials']])
    judge.write(args.out, result)
    import shutil
    shutil.rmtree(work, ignore_errors=True)
    print(json.dumps({k: v for k, v in result.items() if k != 'tests'}, sort_keys=True), flush=True)
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())

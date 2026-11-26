#!/usr/bin/env python3
"""Direct-call collector trials for round C8 (lead ruling 1126000814-88f1): a recorded direct call
must leave the state the two state gates verify unchanged.

The generic shape of the real R5/positive/off_run_rows_validated_then_noop failure (2x
schema_bank_changed_within_case + 1x load_once_singleton_changed at 3818f4de03): every recorded
direct call computes its complete-call descriptor (bridge.entry_call -> invoke -> descriptor_sha256
over the live argument/world graph), and the descriptor reducer memoizes whatever mutable per-case
objects that walk reaches into the bridge's descriptor memos:

  * an instance held as a class attribute (the per-case-world shape, RW.World.CURRENT = self) freezes
    as a load-once singleton (FROZEN + MEMBERS); the case's own continued execution then mutates it,
    and verify_frozen reports load_once_singleton_changed;
  * a schema-bank-shaped object (vars holding a referencing Registry, bridge._is_bank) reached by the
    same walk binds as a case bank (CASE_BANKS); the singleton freeze then fills MEMBERS with the
    bank's internals, so settle_case_banks' recompute emits load_once_member tokens instead of the
    full bank descriptor and reports schema_bank_changed_within_case although the bank never changed.

With the collector off no descriptor walk ever reaches these objects, so neither gate can fire for
this reason. These trials name the path generically -- any recorded call whose receiver or arguments
reach bank/singleton state must leave the bridge's descriptor memos exactly as they were and must
leave the case lifecycle (continued execution, settle_case_banks, verify_frozen) with neither gate
firing. One trial per recording path (a receiver with a sealed store; a pure no-store call), both
through the REAL bridge.entry_call/invoke over a minimal fake sweep collector, so the descriptor
walks run exactly as they do in a sweep. Both trials fail at 3818f4de03 (memos written through, both
gates fire) and pass after the C8 fix. Each trial runs in its own subprocess, because a pre-fix run
pollutes the process-wide memos for everything after it.

  recorded_store_call_keeps_state     the store path: a receiver over a sealed TestOwnerStorage whose
                                      attributes reach a bank and a class-attribute singleton
  recorded_no_store_call_keeps_state  the no-store path: a pure listed function whose arguments reach
                                      the same bank and singleton

Usage: python3 -B scripts/pm_goal_dg5_direct_calls_c8_selftest.py --out RESULT.json [--only name,...]
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import pickle
import sys
import tempfile
import textwrap
import traceback
import types

ROOT = Path(__file__).resolve().parents[1]
FAMILY = 'c8self.family'
MEMO_NAMES = ('FROZEN', 'FROZEN_PARTS', 'MEMBERS', 'CASE_BANKS')
TRIALS = ['recorded_store_call_keeps_state', 'recorded_no_store_call_keeps_state']

OWNER = textwrap.dedent('''
    from referencing import Registry

    class Bank:
        """The schema-bank shape bridge._is_bank binds: vars holding a referencing Registry."""
        def __init__(self, name):
            self.registry = Registry()
            self.name = name
            self.documents = {}

    class Holder:
        """Mutable per-case state; the trial holds one instance as a class attribute (the
        RW.World.CURRENT = self shape), which the descriptor reducer reads as a load-once singleton."""
        def __init__(self, bank):
            self.counter = 0
            self.bank = bank

    class Thing:
        """The recorded receiver: bank first, then holder, so the walk binds the bank before the
        singleton freeze fills MEMBERS (the order the real R5 case hits)."""
        def __init__(self, bank, holder):
            self.bank = bank
            self.holder = holder

        def listed(self, x):
            return ('listed', self.holder.counter, x)

    def read(holder, bank, x):
        return ('read', holder.counter, x)
    ''')


def load_module(folder, name, text):
    path = folder / (name + '.py')
    path.write_text(text)
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


class FakeCollector:
    """The minimum of pm_goal_guard_sweep.Collector that bridge.entry_call/invoke use: one discovery
    evaluation per complete call, no judging, no replay."""
    replaying = False

    def __init__(self):
        self.records = []
        self.replay_unknown_rows = set()

    def invoke(self, label, evaluate, value, valid=None, target=None, family=None):
        result = evaluate(value)
        self.records.append(dict(label=label, family=family, refusal=result.get('refusal_code')))
        return result

    def declare(self, result, control, target):
        pass

    def observe(self, name, holds, site):
        pass


def setup(folder, methods):
    """Install the collector over a temporary pinned listing of `methods`, with the real bridge."""
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_dg5_direct_calls as dc
    import pm_goal_dg5_owner_state as owner_state
    import pm_goal_guard_tables as tables
    owner = load_module(folder, 'pm_goal_dg_c8self_owner', OWNER)
    listing = folder / 'methods.json'
    listing.write_bytes(json.dumps({FAMILY: dict(
        owner_methods={key: dict(module='pm_goal_dg_c8self_owner', kind='owner') for key in methods},
        excluded_construction=[], runs={})}).encode())
    dc.METHODS, dc._LIST[:], dc.REPORTS = listing, [], {}
    dc.METHODS_SHA256 = hashlib.sha256(listing.read_bytes()).hexdigest()
    owner_state.HOOKS[FAMILY] = owner_state.Hook(FAMILY, ())
    tables.COLLECTOR = FakeCollector()
    report = dc.install(FAMILY)
    return bridge, dc, owner, report


def state_of(bridge, folder, owner):
    """The case's mutable state, the descriptor memos and the bank digest, as one snapshot dict."""
    return dict(
        memos={name: dict(getattr(bridge, name)) for name in MEMO_NAMES},
        bank_sha=bridge._bank_sha(folder['bank']),
        holder_sha=hashlib.sha256(pickle.dumps(
            bridge.context_value(folder['holder'], None, {}, False), protocol=5)).hexdigest(),
        failures=len(bridge.FAILURES),
        cases=bridge.CASE_BANK_STATE[0])


def trial(bridge, dc, owner, folder, call, case_id):
    """Run one recorded direct call, then the case lifecycle; return the list of problems."""
    problems = []
    bank, holder = folder['bank'], folder['holder']
    before = state_of(bridge, folder, owner)
    bridge.CASE[0] = dict(id=case_id, expected=None)
    try:
        returned = call()
    finally:
        bridge.CASE[0] = None
    report = dc.REPORTS[FAMILY]
    # The call itself must still be recorded: a fix that records nothing would pass the gates vacuously.
    if report.get('recorded_calls') != 1:
        problems.append('not recorded: recorded_calls=%r report=%s' % (
            report.get('recorded_calls'),
            {k: v for k, v in report.items() if k.endswith('_calls') or k.endswith('_reasons')}))
    if returned != folder['expected']:
        problems.append('the case got %r, expected %r' % (returned, folder['expected']))
    after = state_of(bridge, folder, owner)
    # (ruling point 3, generic) a recorded call that touches bank/singleton state leaves the memos the
    # two gates verify -- and the bank's own digest -- exactly as they were.
    for name in MEMO_NAMES:
        if after['memos'][name] != before['memos'][name]:
            added = sorted(set(after['memos'][name]) - set(before['memos'][name]), key=repr)
            problems.append('the recorded call wrote to bridge.%s (%d new: %s)' % (
                name, len(added), [type(k).__name__ for k in added][:4]))
    if after['bank_sha'] != before['bank_sha']:
        problems.append('the bank digest changed across the recorded call: %s -> %s' % (
            before['bank_sha'][:12], after['bank_sha'][:12]))
    # The case's own execution continues and mutates its own mutable state, exactly as the real R5
    # case does after off_run_event; then the sweep's two gate checks run.
    holder.counter += 1
    bridge.settle_case_banks(None)
    frozen = bridge.verify_frozen()
    kinds = [f.get('kind') for f in bridge.FAILURES[before['failures']:]]
    if 'schema_bank_changed_within_case' in kinds:
        problems.append('schema_bank_changed_within_case fired: %s' % json.dumps(
            [f for f in bridge.FAILURES[before['failures']:]
             if f.get('kind') == 'schema_bank_changed_within_case'], default=str)[:400])
    if 'load_once_singleton_changed' in kinds or frozen['drift']:
        problems.append('load_once_singleton_changed fired: drift=%s' % json.dumps(
            frozen['drift'], default=str)[:400])
    return problems


def trial_recorded_store_call_keeps_state(folder_root):
    import pm_goal_test_storage as storage
    bridge, dc, owner, report = setup(folder_root, ['Thing.listed'])
    bank = owner.Bank('c8')
    holder = owner.Holder(bank)
    owner.Holder.CURRENT = holder              # the load-once-singleton shape: an instance as a class attribute
    thing = owner.Thing(bank, holder)
    thing.storage = storage.TestOwnerStorage.create(folder_root / 'store')
    thing.recorder = types.SimpleNamespace(snapshot=lambda: {})
    state = dict(bank=bank, holder=holder, expected=('listed', 0, 7))
    problems = trial(bridge, dc, owner, state, lambda: thing.listed(7),
                     'c8self/positive/recorded_store_call')
    if report.get('unsealable_calls') or report.get('unsealed_calls'):
        problems.append('the store-path call was refused: %s' % report)
    return problems


def trial_recorded_no_store_call_keeps_state(folder_root):
    bridge, dc, owner, report = setup(folder_root, ['pm_goal_dg_c8self_owner:read'])
    bank = owner.Bank('c8')
    holder = owner.Holder(bank)
    owner.Holder.CURRENT = holder
    state = dict(bank=bank, holder=holder, expected=('read', 0, 9))
    problems = trial(bridge, dc, owner, state, lambda: owner.read(holder, bank, 9),
                     'c8self/positive/recorded_no_store_call')
    if report.get('unsealed_calls') or report.get('no_store_reasons'):
        problems.append('the no-store call was not shown pure: %s' % report)
    return problems


INNER = {'recorded_store_call_keeps_state': trial_recorded_store_call_keeps_state,
         'recorded_no_store_call_keeps_state': trial_recorded_no_store_call_keeps_state}


def run_inner(name):
    sys.path.insert(0, str(ROOT / 'scripts'))
    folder = Path(tempfile.mkdtemp(prefix='dg5-direct-c8-' + name + '-'))
    try:
        problems = INNER[name](folder)
    except BaseException as caught:  # noqa: BLE001 - a setup error fails the trial, not the suite
        problems = ['trial raised %s: %s' % (type(caught).__name__, caught), traceback.format_exc()[-800:]]
    print('INNER ' + json.dumps(dict(name=name, passed=not problems, problems=problems), default=str))
    return 0 if not problems else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--only', help='comma-separated trial names')
    parser.add_argument('--inner', help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.inner:
        return run_inner(args.inner)
    import subprocess
    names = [n for n in TRIALS if not args.only or n in args.only.split(',')]
    rows = []
    for name in names:
        proc = subprocess.run([sys.executable, '-B', __file__, '--out', '/dev/null', '--inner', name],
                              cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        line = [ln for ln in proc.stdout.splitlines() if ln.startswith('INNER ')]
        if line:
            rows.append(json.loads(line[-1][len('INNER '):]))
        else:
            rows.append(dict(name=name, passed=False,
                             problems=['inner exit %s\n%s' % (proc.returncode, proc.stdout[-1500:])]))
    status = 'pass' if all(r['passed'] for r in rows) else 'fail'
    args.out.write_text(json.dumps(dict(status=status, cases=rows), indent=1) + '\n')
    for r in rows:
        print('PASS' if r['passed'] else 'FAIL', r['name'])
        for p in r['problems']:
            print('   ', str(p)[:500])
    print(status, '%d/%d' % (sum(r['passed'] for r in rows), len(rows)))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""Real-case trials for collector fix round 2 (lead ruling 1124101552-8f55, items C1-C7).

Each trial drives the REAL corpus case the ruling names (the same family source, case, owner and runner the
deep reviews ran) and asserts the exact ledger record / verdict / corpus count. Sweep trials run
pm_goal_dg5_sweep --collect-only in a subprocess on this tree, one narrow slice per family; the two inner
trials run the real adapter/CF1 code in a subprocess of this file with bridge.entry_call replaced by a
recorder that mirrors its child/parent flags. Every trial fails on its own at the round-2 base f2ee5a87ba
(except where the trial also pins an unchanged control inside the same run) and passes after its fix.
Unit-shape mirrors of the same stacks live in pm_goal_dg5_direct_calls_selftest.py.

  c1_adapter_source_step_factory  C1: adapter/dg5-shared/source_step_* (step_case.<locals>.make ->
                                  LifecycleReducer.initial): no direct record; counted as construction x4
  c2_s_runner_code_of             C2: S2 Suite._run -> dg_s_world:code_of verdict reads: no direct record
  c2_ca_runner_refusal_code       C2: DG5 cb Suite.negative -> code_of -> test_owner_adapters:refusal_code:
                                  no direct record (same sweep run as c4_cb_inventory_unavailable)
  c2_r_runner_code_of             C2: R1 run_case -> dg_r_world:code_of: no direct record
  c2_cf1_stale_negatives          C2: CF1 stale CASE through cf1 negatives() -> dg_cf1_world:default_values:
                                  no direct record under the stale case
  c3_cf12_backup_take             C3: CF3 cf12 BackupOwner.take(st, d/'unit'): not recorded (unsealable),
                                  no backup/dest_empty source failure, CF3 source exits 0
  c4_cb_inventory_unavailable     C4: DG5/DG5/cb/inventory_unavailable -> SourceOwnerMixin.inventory
                                  (cb_owners:366): one direct record, exact_expected, its exact code
  c4_cb_image_unavailable         C4: cb/image_unavailable -> SourceOwnerMixin.image (:395): same shape
  c4_cb_image_origin_unavailable  C4: cb/image_origin_unavailable -> SourceOwnerMixin.image (:402)
  c4_u5_expected_revision_float   C4: U5/N/expected_revision_float -> GoalUpdateCommand.run: recorded
  c5_u_direct_inline_route        C5: U1/P/direct_inline_route: nested SirOwner.admit and
                                  UpdateSourceOwner.capture entries record; 143 corpus results
  c5_ca_pre_latch_no_effect       C5: C1/C1/positive/pre_latch_no_effect: nested SIROwner.accept records;
                                  87 corpus results (82 agree, 3 disagree_other_row, 2 disagree)
  c6_s2_commit_start_killed_code  C6: S2/v7_producer_wrong_payload_header/StartOwner.commit_start:
                                  kill KILLED_CODE with collector on (own-guard true)
  c7_s2_cast_bank_validate        C7: S2/cast_* direct Bank.validate: not wrapped (schema_by_rule), no
                                  direct record; the cast cases still run (their other records remain)

Runtimes at the base (2 GiB scope, this machine): u slices ~3 s, ca single-case shards ~40 s each,
ca pre-latch shard ~60 s, cf12 group ~375 s, s S2 group ~497 s, r single case ~1 min, inners seconds.
Run the whole suite under the usual scope and, past 25 minutes, long-job; use --only for one item.

Usage: python3 -B scripts/pm_goal_dg5_direct_calls_r2_selftest.py --out RESULT.json [--only name,...]
"""
import argparse
import gzip
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import traceback

ROOT = Path(__file__).resolve().parents[1]
TRIALS = ['c1_adapter_source_step_factory', 'c2_s_runner_code_of', 'c2_ca_runner_refusal_code',
          'c2_r_runner_code_of', 'c2_cf1_stale_negatives', 'c3_cf12_backup_take',
          'c4_cb_inventory_unavailable', 'c4_cb_image_unavailable', 'c4_cb_image_origin_unavailable',
          'c4_u5_expected_revision_float', 'c5_u_direct_inline_route', 'c5_ca_pre_latch_no_effect',
          'c6_s2_commit_start_killed_code', 'c7_s2_cast_bank_validate']
_RUNS = {}


def shard(case_id, total=1048576):
    """PM_DG5_CASE_SHARD for exactly this authored case id (pm_goal_dg5_entries.case_shard_selected)."""
    return '%d/%d' % (int.from_bytes(hashlib.sha256(case_id.encode()).digest()[:8], 'big') % total, total)


def run_sweep(tag, source, extra_env):
    if tag in _RUNS:
        return _RUNS[tag]
    base = Path(tempfile.mkdtemp(prefix='dg5-direct-r2-' + tag + '-'))
    scratch = base / 'scratch'
    scratch.mkdir(parents=True)
    env = dict(os.environ)
    for key in ('PM_DG5_GROUPS', 'PM_DG5_MATCH', 'PM_DG5_CASE_SHARD', 'PM_DG5_CA_SUITES', 'PM_DG5_CF_SUITES',
                'PM_DG5_SUPPLEMENT'):
        env.pop(key, None)
    env.update(TMPDIR=str(base), PM_DG5_SCRATCH=str(scratch), **extra_env)
    proc = subprocess.run([sys.executable, '-B', 'scripts/pm_goal_dg5_sweep.py', '--collect-only',
                           '--source', source, '--out', str(base / 'out')],
                          cwd=ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    out = base / 'out'
    if not (out / 'ledger.json.gz').is_file():
        raise RuntimeError('sweep %s exit %s\n%s' % (tag, proc.returncode, proc.stdout[-2000:]))
    # A failing family source (C3 at the base: CF3 exits 1 on backup/dest_empty) still writes its ledger;
    # the trial asserts the exact records and failures, so the exit is data, not a harness crash.
    evidence = json.loads((out / 'source-evidence.json').read_text())
    run = dict(base=str(base), exit=proc.returncode,
               ledger=json.loads(gzip.open(out / 'ledger.json.gz', 'rt').read()),
               collection=json.loads((out / 'collection.json').read_text()),
               corpus=json.loads((out / 'number-corpus.json').read_text()),
               evidence=evidence,
               report=(list(evidence.values())[0] or {}).get('direct_calls') or {})
    _RUNS[tag] = run
    return run


def labels(run, needle=None):
    return [r['label'] for r in run['ledger'] if needle is None or needle in r['label']]


def one(run, label):
    return [r for r in run['ledger'] if r['label'] == label]


def run_inner(name):
    proc = subprocess.run([sys.executable, '-B', __file__, '--inner', name], cwd=ROOT,
                          stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    line = [ln for ln in proc.stdout.splitlines() if ln.startswith('INNER ')]
    if proc.returncode != 0 or not line:
        raise RuntimeError('inner %s exit %s\n%s' % (name, proc.returncode, proc.stdout[-2000:]))
    return json.loads(line[-1][len('INNER '):])


def ca_shard(tag, case_id, groups):
    return run_sweep(tag, 'pm_goal_dg5_ca', dict(PM_DG5_CA_SUITES='CA', PM_DG5_GROUPS=groups,
                                                 PM_DG5_CASE_SHARD=shard(case_id)))


def checks():
    def c1():
        got = run_inner('adapter')
        direct = [ln for ln in got['labels'] if '/direct/LifecycleReducer.' in ln]
        counted = (got.get('construction_calls') or {}).get('LifecycleReducer.initial', 0)
        ran = [ln for ln in got['labels'] if 'source_step_' in ln and ln.endswith('/pure')]
        return (not direct and counted == 4 and len(ran) == 4,
                dict(direct=direct, initial_construction_counted=counted, pure_source_step_entries=ran))

    def s2():
        return run_sweep('s2', 'pm_goal_dg5_s', dict(PM_DG5_GROUPS='S2'))

    def c2_s():
        run = s2()
        bogus = labels(run, '/direct/dg_s_world:code_of')
        counted = (run['report'].get('harness_calls') or {}).get('dg_s_world:code_of', 0)
        return not bogus and counted >= 6, dict(bogus=bogus, harness_counted=counted, records=len(run['ledger']))

    def c2_ca():
        run = ca_shard('cb-inv', 'DG5/DG5/cb/inventory_unavailable', 'DG5')
        bogus = labels(run, '/direct/test_owner_adapters:refusal_code')
        counted = (run['report'].get('harness_calls') or {}).get('test_owner_adapters:refusal_code', 0)
        return not bogus and counted >= 1, dict(bogus=bogus, harness_counted=counted)

    def c2_r():
        run = run_sweep('r1-one', 'pm_goal_dg5_r', dict(PM_DG5_GROUPS='R1',
                                                        PM_DG5_MATCH='predecessor_validation_unresolved'))
        bogus = labels(run, '/direct/dg_r_world:code_of')
        counted = (run['report'].get('harness_calls') or {}).get('dg_r_world:code_of', 0)
        ran = labels(run, 'R1/predecessor_validation_unresolved')
        return not bogus and counted >= 1 and bool(ran), dict(bogus=bogus, harness_counted=counted, ran=ran)

    def c2_cf1():
        got = run_inner('cf1')
        bogus = [ln for ln in got['labels'] if ln.endswith('/direct/dg_cf1_world:default_values')]
        return (not bogus and got['corpus'] > 0 and got['case_restored'],
                dict(bogus=bogus, corpus_rows=got['corpus'], case_restored=got['case_restored']))

    def c3():
        run = run_sweep('cf12', 'pm_goal_dg5_cf', dict(PM_DG5_CF_SUITES='CF3', PM_DG5_GROUPS='cf12'))
        direct = labels(run, '/direct/BackupOwner.take')
        counted = (run['report'].get('unsealable_calls') or {}).get('BackupOwner.take', 0)
        failures = run['collection'].get('failures') or []
        dest = [f for f in failures if 'backup/dest_empty' in json.dumps(f, default=str)]
        disagree = [f for f in failures if f.get('kind') == 'child_parent_disagree'
                    and 'BackupOwner.take' in str(f.get('label'))]
        results = (list(run['evidence'].values())[0] or {}).get('results') or []
        return (not direct and counted >= 9 and not dest and not disagree
                and results == [dict(source='CF3', exit=0)],
                dict(direct=direct, unsealable_counted=counted, dest_empty=dest, disagree=disagree,
                     results=results))

    def cb(tag, name, key, code):
        def check():
            run = ca_shard(tag, 'DG5/DG5/' + name, 'DG5')
            label = 'DG5/DG5/%s/direct/%s' % (name, key)
            recs = one(run, label)
            built = (run['report'].get('construction_calls') or {}).get(key, 0)
            exact = (len(recs) == 1 and recs[0].get('outcome') == 'exact_expected'
                     and recs[0].get('refusal_code') == code)
            return exact and built == 0, dict(label=label, records=[(r.get('outcome'), r.get('refusal_code'))
                                                                    for r in recs], construction_counted=built)
        return check

    def c4_u5():
        run = run_sweep('u5', 'pm_goal_dg5_u', dict(PM_DG5_MATCH='expected_revision_float'))
        label = 'U5/N/expected_revision_float/direct/GoalUpdateCommand.run'
        recs = one(run, label)
        built = (run['report'].get('construction_calls') or {}).get('GoalUpdateCommand.run', 0)
        exact = (len(recs) == 1 and recs[0].get('outcome') == 'exact_expected' and recs[0].get('refusal_code')
                 == 'dgu/sir/request/expected_revision/numrule/integer_type')
        return exact and built == 0, dict(label=label, records=[(r.get('outcome'), r.get('refusal_code'))
                                                                for r in recs], construction_counted=built)

    def c5_u():
        run = run_sweep('u1p', 'pm_goal_dg5_u', dict(PM_DG5_MATCH='direct_inline_route'))
        corpus = run['corpus']
        have = labels(run)
        need = ['U1/P/direct_inline_route/SirOwner.admit', 'U1/P/direct_inline_route/UpdateSourceOwner.capture',
                'U1/P/direct_inline_route/direct/GoalUpdateCommand.run']
        exact = (len(corpus.get('results') or []) == 143
                 and corpus.get('summary') == {'goal.updated/admission.accepted_at': {'agree': 56},
                                               'goal.updated/request.expected_revision': {'agree': 87}}
                 and all(n in have for n in need))
        return exact, dict(corpus=len(corpus.get('results') or []), summary=corpus.get('summary'),
                           missing=[n for n in need if n not in have])

    def c5_ca():
        run = ca_shard('prelatch', 'C1/C1/positive/pre_latch_no_effect', 'C1')
        corpus = run['corpus']
        have = labels(run)
        need = ['C1/C1/positive/pre_latch_no_effect/SIROwner.accept',
                'C1/C1/positive/pre_latch_no_effect/direct/NoAssociationCancel.dispatch']
        exact = (len(corpus.get('results') or []) == 87
                 and corpus.get('summary') == {'goal.cancelled/request.expected_revision':
                                               {'agree': 82, 'disagree_other_row': 3, 'disagree': 2}}
                 and all(n in have for n in need))
        return exact, dict(corpus=len(corpus.get('results') or []), summary=corpus.get('summary'),
                           missing=[n for n in need if n not in have])

    def c6():
        recs = one(s2(), 'S2/v7_producer_wrong_payload_header/StartOwner.commit_start')
        rec = recs[0] if recs else {}
        own = ((rec.get('killed_code_check') or {}).get('own_guard') or {}).get('own')
        frames = [f for f in (rec.get('refusal_origin') or {}).get('frames', [])
                  if f[0].endswith('pm_goal_dg5_direct_calls.py')]
        return (len(recs) == 1 and rec.get('kill') == 'KILLED_CODE' and own is True
                and all(f[4] for f in frames),
                dict(kill=rec.get('kill'), own=own, collector_frames=frames))

    def c7():
        run = s2()
        direct = labels(run, '/direct/Bank.validate')
        by_rule = run['report'].get('schema_by_rule') or []
        wrapped = run['report'].get('wrapped') or []
        ran = labels(run, 'S2/cast_')
        return (not direct and 'Bank.validate' in by_rule and 'Bank.validate' not in wrapped and bool(ran),
                dict(direct=direct, schema_by_rule=by_rule, cast_records=len(ran)))

    return {
        'c1_adapter_source_step_factory': c1,
        'c2_s_runner_code_of': c2_s,
        'c2_ca_runner_refusal_code': c2_ca,
        'c2_r_runner_code_of': c2_r,
        'c2_cf1_stale_negatives': c2_cf1,
        'c3_cf12_backup_take': c3,
        'c4_cb_inventory_unavailable': cb('cb-inv', 'cb/inventory_unavailable', 'SourceOwnerMixin.inventory',
                                          'inventory/unavailable/goal_body'),
        'c4_cb_image_unavailable': cb('cb-img', 'cb/image_unavailable', 'SourceOwnerMixin.image',
                                      'image/unavailable/goal_body_record'),
        'c4_cb_image_origin_unavailable': cb('cb-orig', 'cb/image_origin_unavailable', 'SourceOwnerMixin.image',
                                             'image/origin_unavailable/goal_body_record'),
        'c4_u5_expected_revision_float': c4_u5,
        'c5_u_direct_inline_route': c5_u,
        'c5_ca_pre_latch_no_effect': c5_ca,
        'c6_s2_commit_start_killed_code': c6,
        'c7_s2_cast_bank_validate': c7,
    }


def _recorder(bridge, calls):
    """bridge.entry_call stand-in mirroring its flags: sealed child under ACTIVE in a fork, parent under
    PARENT_CALL (as pm_goal_dg5_direct_calls_selftest.Env's recorder)."""
    def recorder(case, label, family, action, work, **kwargs):
        calls.append(label)
        pid = os.fork()
        if pid == 0:
            bridge.ACTIVE[0] = True
            try:
                action()
            except BaseException:  # noqa: BLE001
                pass
            os._exit(0)
        os.waitpid(pid, 0)
        saved = bridge.PARENT_CALL[0]
        bridge.PARENT_CALL[0] = True
        try:
            return action()
        finally:
            bridge.PARENT_CALL[0] = saved
    return recorder


def inner_adapter():
    """C1 real case: the real _pure_supplements step_case factories under the real adapter Suite wrapper."""
    sys.path.insert(0, str(ROOT / 'scripts'))
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_dg5_direct_calls as dc
    import pm_goal_dg5_adapter as adapter
    calls = []
    bridge.entry_call = _recorder(bridge, calls)
    bridge.tables.COLLECTOR = object()   # pure() takes its entry_call path, as under the sweep
    adapter.install()
    suite = adapter.selftest.Suite()
    adapter._pure_supplements(suite, Path(tempfile.mkdtemp(prefix='dg5-r2-adapter-')))
    report = dc.REPORTS.get(adapter.FAMILY) or {}
    print('INNER ' + json.dumps(dict(labels=calls, construction_calls=report.get('construction_calls') or {}),
                                 default=str))
    return 0


def inner_cf1():
    """C2 real case: the real CF1 corpus builder negatives() (which calls dg_cf1_world:default_values)
    run while bridge.CASE still holds the previous case, exactly the leftover install_cf1.run_path leaves."""
    sys.path.insert(0, str(ROOT / 'scripts'))
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_dg5_direct_calls as dc
    import pm_goal_dg5_cf as cf_bridge
    import pm_goal_dg_cf1_oracles as cf1
    calls = []
    bridge.entry_call = _recorder(bridge, calls)
    cf_bridge.install_cf1()
    dc.install(cf_bridge.FAMILY, {})
    stale = dict(id='CF1/positive_three_required_worknodes', expected=None)
    bridge.CASE[0] = stale
    corpus = cf1.negatives()
    print('INNER ' + json.dumps(dict(labels=calls, corpus=len(corpus),
                                     case_restored=bridge.CASE[0] == stale), default=str))
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path)
    parser.add_argument('--only')
    parser.add_argument('--inner', choices=('adapter', 'cf1'))
    args = parser.parse_args()
    if args.inner:
        return inner_adapter() if args.inner == 'adapter' else inner_cf1()
    if args.out is None:
        parser.error('--out is required (except with --inner)')
    selected = [t for t in TRIALS if not args.only or t in args.only.split(',')]
    all_checks = checks()
    rows = []
    for name in selected:
        try:
            passed, detail = all_checks[name]()
            rows.append(dict(case=name, passed=bool(passed), detail=detail))
        except Exception as error:  # noqa: BLE001 - each trial fails on its own
            rows.append(dict(case=name, passed=False, detail='%s: %s' % (type(error).__name__, str(error)[:500]),
                             trace=traceback.format_exc()[-800:]))
    status = 'pass' if all(r['passed'] for r in rows) else 'fail'
    args.out.write_text(json.dumps(dict(status=status, cases=rows), indent=1, default=str) + '\n')
    for r in rows:
        print('PASS' if r['passed'] else 'FAIL', r['case'], str(r.get('detail'))[:220])
    print(status, '%d/%d' % (sum(r['passed'] for r in rows), len(rows)))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())



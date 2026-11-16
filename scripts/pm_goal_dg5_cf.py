"""GH1 extension over the unchanged DG-CF1, DG-CF2 and DG-CF3 goal_run.certified suites.

Captured complete calls:
* CF1 (producer chain): birth enrollment, certified preparation, final decision,
  Standard capture, whole producer prepare/submission/check, native source
  issue/check, whole identity derive/recheck/joins, and the registered append.
* CF2 (coordinator and consumer): every coordinator phase a case drives
  (prepare, arm, held append, F5a-F5d, native commit, readback, release,
  current and retained authority, re-entry, recovery, retry, whole chain) and
  the consumer's retained, original, projection, historical and current reads.
* CF3 (projector): prefix projection, reader, checkpoint and rebuild.

Each authored case keeps its own expected code; the bridge attaches it to the
call that ends the case. A CF1 expectation written as a code prefix (ending in
'/') names no single row: such a case is recorded undeclared and earns no
kill credit. Child-process crash and cut matrices run under the original suites.
"""
import functools
import os
from pathlib import Path
import sys

import pm_goal_dg5_boundaries as bridge
import pm_goal_dg5_entries as plumbing
import pm_goal_test_owner_adapters as A
import pm_goal_dg_cf1_oracles as cf1
import pm_goal_dg_cf1_world as w1
import pm_goal_dg_cf2_oracles as cf2
import pm_goal_dg_cf2_world as w2
import pm_goal_dg_cf2_consumer as c2
import pm_goal_dg_cf3_oracles as cf3
import pm_goal_dg_cf3_projector as p3

DG5_EVIDENCE = {}
FAMILY = 'goal_run.certified'


def _declared(expected):
    return None if expected is None or expected.endswith('/') else expected


def install_cf1():
    expectations = {}
    original_negatives = cf1.negatives

    @functools.wraps(original_negatives)
    def negatives():
        corpus = original_negatives()
        for group, name, kw, expected in corpus:
            expectations[name] = (group, expected)
        return corpus
    cf1.negatives = negatives
    expectations['altered_retry'] = ('CF-01', 'append/conflict/producer25')  # run()'s own corpus row
    original_run_path = cf1.run_path

    @functools.wraps(original_run_path)
    def run_path(work, **kw):
        # A CF1 case is one run_path plus the calls its body makes afterwards
        # (positive checks, the altered retry): the case stays current until
        # the next case starts or the adopted adapter demonstration runs.
        name = Path(work).name
        group, expected = expectations.get(name, ('positive', None))
        bridge.CASE[0] = dict(id='CF1/' + name, expected=_declared(expected), authored_expected=expected)
        return original_run_path(work, **kw)
    cf1.run_path = run_path
    demo_run = cf1.DEMO.run

    @functools.wraps(demo_run)
    def demo(*args, **kwargs):
        bridge.CASE[0] = None
        return demo_run(*args, **kwargs)
    cf1.DEMO.run = demo
    plumbing.entries(w1.BirthCoordinator, ('enroll',), FAMILY)
    plumbing.entries(w1.NativeRunOwner, ('prepare_certified',), FAMILY)
    plumbing.entries(w1.FinalDecisionOwner, ('issue',), FAMILY)
    plumbing.entries(w1.StandardOwner, ('capture',), FAMILY)
    plumbing.entries(w1.WholeProducer, ('prepare', 'submission', 'check'), FAMILY)
    plumbing.entries(w1.NativeSourceIssuer, ('issue_source', 'check_source'), FAMILY)
    plumbing.entries(w1.WholeIdentityOwner, ('derive', 'helper_recheck', 'joins'), FAMILY)
    plumbing.entries(A.AppendOwner, ('append_original',), FAMILY)


def install_cf2():
    original = cf2.run_case
    if getattr(original, '_dg5_case', False):
        return

    @functools.wraps(original)
    def run_case(c, root):
        saved = bridge.CASE[0]
        expected = c['guard'] if c['kind'] == 'negative' else None
        bridge.CASE[0] = dict(id='CF2/' + c['id'], expected=expected)
        try:
            return original(c, root)
        finally:
            bridge.CASE[0] = saved
    run_case._dg5_case = True
    cf2.run_case = run_case
    plumbing.entries(w2.Coordinator, ('prepare', 'arm', 'append_held', 'f5a', 'f5b_readback', 'f5c_readback', 'f5d',
                                      'commit_native', 'readback', 'release', 'read_current', 'retained_authority',
                                      'reenter', 'recover_original', 'held_retry', 'chain'), FAMILY)
    plumbing.entries(c2.Consumer, ('read_retained_native', 'inspect_original', 'publish_projection', 'read_historical',
                                   'read_current', 'reopen'), FAMILY)


def install_cf3():
    for name in ('positive', 'negative'):
        original = getattr(cf3.Corpus, name)
        if getattr(original, '_dg5_case', False):
            continue

        def bind(original=original, name=name):
            @functools.wraps(original)
            def call(self, cid, group, *args, **kwargs):
                saved = bridge.CASE[0]
                expected = (args[0] if args else kwargs.get('expected')) if name == 'negative' else None
                bridge.CASE[0] = dict(id='CF3/' + cid, expected=expected)
                try:
                    return original(self, cid, group, *args, **kwargs)
                finally:
                    bridge.CASE[0] = saved
            call._dg5_case = True
            return call
        setattr(cf3.Corpus, name, bind())
    plumbing.entries(p3.Projector, ('project_prefix',), FAMILY)
    plumbing.entries(p3.Reader, ('read',), FAMILY)
    plumbing.entries(p3.Consumer, ('checkpoint', 'rebuild'), FAMILY)


def closure_banks():
    import pm_goal_dg5_closure as closure
    import pm_goal_own_c3_w5_successor_oracles as w5
    return closure.default_banks() + [(w5.ScopedInstances, 'errors')]


def main():
    scratch = Path(os.environ['PM_DG5_SCRATCH'])
    selected = os.environ.get('PM_DG5_CF_SUITES', 'CF1,CF2,CF3').split(',')
    only = os.environ.get('PM_DG5_GROUPS')
    results = []
    saved = sys.argv
    try:
        if 'CF1' in selected:
            install_cf1()
            result = cf1.run(str(scratch / 'certified-cf1-source.json'), only.split(',') if only else None)
            bridge.CASE[0] = None
            results.append(dict(source='CF1', status=result['status']))
        if 'CF2' in selected:
            install_cf2()
            os.environ['PM_DG_CF2_SCRATCH'] = str(scratch)
            sys.argv = [cf2.__file__, '--output', str(scratch / 'certified-cf2-source.json'), '--no-matrix']
            if only:
                sys.argv += ['--only', only]
            results.append(dict(source='CF2', exit=cf2.main()))
        if 'CF3' in selected:
            install_cf3()
            argv = ['--output', str(scratch / 'certified-cf3-source.json')]
            if only:
                argv += ['--only', *only.split(',')]
            results.append(dict(source='CF3', exit=cf3.main(argv)))
    finally:
        sys.argv = saved
        bridge.CASE[0] = None
    DG5_EVIDENCE.update(family=FAMILY, results=results,
                        scope='CF2 cut matrix and CF3 child rows run separately under the original suites.')
    return int(any(r.get('exit') or r.get('status') == 'fail' for r in results))

"""GH1 extension over the unchanged DG-R goal_run.cancelled suite (R1-R6).

Captured complete calls: the modeled original issuance and D06 publication
(CancelWorld.build / continue_d06 / continue_d06_again / replay_d06), the
combined started/cancelled projector (project, cutover, historical and current
reads) and the consumer (check, preserved, retained-native and original reads).
Each authored case keeps its own expected code; the bridge attaches it to the
call that ends the case. Child-process crash rows run under the original suite.
"""
import functools
import os
import sys

import pm_goal_dg5_boundaries as bridge
import pm_goal_dg5_entries as plumbing
import pm_goal_dg_r_oracles as source
import pm_goal_dg_r_projector as projector
import pm_goal_dg_r_readers as readers
import pm_goal_dg_r_world as world

DG5_EVIDENCE = {}
FAMILY = 'goal_run.cancelled'


def install():
    original = source.run_case
    if getattr(original, '_dg5_case', False):
        return

    @functools.wraps(original)
    def run_case(out, case_id, group, kind, fn, expected=None, detail=None):
        saved = bridge.CASE[0]
        bridge.CASE[0] = dict(id=case_id, expected=expected if kind == 'negative' else None)
        try:
            return original(out, case_id, group, kind, fn, expected, detail)
        finally:
            bridge.CASE[0] = saved
    run_case._dg5_case = True
    source.run_case = run_case
    plumbing.entries(world.CancelWorld, ('build', 'continue_d06', 'continue_d06_again', 'replay_d06'), FAMILY)
    plumbing.entries(projector.Projector, ('project', 'cutover', 'read_historical', 'read_current_cancelled',
                                           'read_current_started'), FAMILY)
    plumbing.entries(readers.Consumer, ('check', 'read_preserved', 'read_retained_native', 'inspect_original'), FAMILY)
    # Addendum 12 point 3: guard decisions inside corpus direct calls to the listed owner methods (pinned list).
    import pm_goal_dg5_direct_calls as direct_calls
    direct_calls.install(FAMILY, DG5_EVIDENCE)


def closure_banks():
    import pm_goal_dg5_closure as closure
    return closure.default_banks() + [(world.Roots, 'errors')]


def main():
    install()
    scratch = os.environ['PM_DG5_SCRATCH']
    os.makedirs(scratch, exist_ok=True)
    output = os.path.join(scratch, 'cancelled-r-source.json')
    from pathlib import Path
    source.BASE = Path(scratch)
    saved = sys.argv
    sys.argv = [source.__file__, '--output', output]
    if os.environ.get('PM_DG5_GROUPS'):
        sys.argv += ['--groups', os.environ['PM_DG5_GROUPS']]
    if os.environ.get('PM_DG5_MATCH'):
        sys.argv += ['--filter', os.environ['PM_DG5_MATCH']]
    try:
        code = source.main()
    finally:
        sys.argv = saved
    DG5_EVIDENCE.update(family=FAMILY, original_suite=output)
    return code

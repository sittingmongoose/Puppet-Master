"""GH1 extension over DG's actual Goal cancellation and migration entries.

The original CA/CA3/CB suites and their expected-code checks remain in charge
of their cases. Shared-source crash matrices are replayed separately.
"""
import functools
import json
import os
from pathlib import Path
import sys

import pm_goal_dg5_boundaries as bridge
import pm_goal_dg5_entries as plumbing
import pm_goal_dg_ca_oracles as ca
import pm_goal_dg_ca3_oracles as ca3
import pm_goal_dg_cb_oracles as cb
import pm_goal_dg_ca_c1 as c1
import pm_goal_dg_ca_c2 as c2
import pm_goal_dg_ca_assignment as assignment
import pm_goal_dg_ca3_route as workflow
import pm_goal_dg_ca3_inspection as inspection
import pm_goal_dg_cb_migration as migration

DG5_EVIDENCE = {}


def cases(cls):
    for name in ('positive', 'negative'):
        original = getattr(cls, name)

        def bind(original=original):
            @functools.wraps(original)
            def call(self, group, name, fn, *args, **kwargs):
                saved = bridge.CASE[0]
                expected = args[0] if args else kwargs.get('expected')
                bridge.CASE[0] = dict(id=group + '/' + name, expected=expected)
                try:
                    return original(self, group, name, fn, *args, **kwargs)
                finally:
                    bridge.CASE[0] = saved
            return call
        setattr(cls, name, bind())


def install():
    cases(ca.Suite)
    family = 'goal.cancelled'
    common = ('capture_source', 'latch_and_reserve', 'commit_receipt', 'settle_owner', 'freeze_event',
              'append_original', 'resolve_original', 'publish_control', 'terminal', 'replay',
              'audit_read', 'read_retained_selection', 'hold_current_read', 'release_held')
    plumbing.entries(c1.NoAssociationCancel, common, family)
    plumbing.entries(assignment.AssignedCancel, ('reserve_append_assignment', 'issue_assignment_audit',
                                                'admit_codec_domain', 'append_original'), family)
    plumbing.entries(c2.BoundPlanCancel, tuple(name for name in common if name in vars(c2.BoundPlanCancel)), family)
    plumbing.entries(workflow.WorkflowCancel, tuple(name for name in common if name in vars(workflow.WorkflowCancel)) +
                      ('prepare', 'run_native', 'terminal_succeeded', 'terminal_unsettled',
                       'read_retained_success', 'read_retained_unsettled'), family)
    plumbing.entries(migration.Coordinator, ('capture', 'commit', 'recover', 'read_result', 'withdraw'), family)


def main():
    install()
    scratch = Path(os.environ['PM_DG5_SCRATCH'])
    scratch.mkdir(parents=True, exist_ok=True)
    # Original suites own their temporary subdirectories, never the DG5 root.
    os.environ['PM_DG_CA_WORK'] = str(scratch)
    os.environ['PM_DG_CB_WORK'] = str(scratch)
    os.environ['PM_DG_CA3_WORK'] = str(scratch)
    selected = os.environ.get('PM_DG5_CA_SUITES', 'CA,CA3,CB').split(',')
    results = []
    for name, module in (('CA', ca), ('CA3', ca3), ('CB', cb)):
        if name not in selected:
            continue
        output = scratch / ('cancelled-' + name.lower() + '-source.json')
        saved = sys.argv
        sys.argv = [module.__file__, '--output', str(output)]
        if os.environ.get('PM_DG5_GROUPS'):
            for group in os.environ['PM_DG5_GROUPS'].split(','):
                sys.argv += ['--group', group]
        try:
            code = module.main()
        finally:
            sys.argv = saved
        results.append(dict(source=name, exit=code, path=str(output)))
        if code:
            DG5_EVIDENCE.update(results=results)
            return code
    DG5_EVIDENCE.update(family='goal.cancelled', results=results)
    return 0

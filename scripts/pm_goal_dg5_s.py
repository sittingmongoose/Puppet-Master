"""GH1 extension over the unchanged DG-S original Start/checkpoint suite."""
import os
from pathlib import Path
import sys
import tempfile

import pm_goal_dg5_entries as plumbing
import pm_goal_dg_s_oracles as source
import pm_goal_dg_s_start as start
import pm_goal_dg_s_readers as readers
import pm_goal_dg_s_world as world

DG5_EVIDENCE = {}


def main():
    plumbing.suite_cases(source.Suite)
    family = 'goal_run.started'
    plumbing.entries(start.StartOwner, ('commit_start', 'recover_start'), family)
    plumbing.entries(readers.StartedProjector, ('install', 'withdraw', 'stage', 'replay', 'cutover'), family)
    plumbing.entries(readers.StartedReaders, ('read_retained_native', 'inspect_original',
                                             'read_historical', 'read_current'), family)
    # Owners that authored S1-S3/S6 negatives call directly (calls nested in another entry stay nested).
    plumbing.entries(readers.GenericStartSource, ('acquire', 'generic_snapshot', 'project'), family)
    plumbing.entries(readers.StartReducer, ('step',), family)
    plumbing.entries(readers.Representation, ('validate', 'encode', 'decode', 'encode_checkpoint', 'decode_checkpoint'),
                     family)
    plumbing.entries(world.WholeSourceOwner, ('issue_whole',), family)
    plumbing.entries(start.DescriptorOwner, ('install',), family)
    scratch = Path(os.environ['PM_DG5_SCRATCH'])
    scratch.mkdir(parents=True, exist_ok=True)
    output = scratch / 'started-source.json'
    work = Path(tempfile.mkdtemp(prefix='started-', dir=scratch))
    saved = sys.argv
    sys.argv = [str(Path(source.__file__)), '--output', str(output), '--work', str(work)]
    if os.environ.get('PM_DG5_GROUPS'):
        sys.argv += ['--groups', *os.environ['PM_DG5_GROUPS'].split(',')]
    try:
        code = source.main()
    finally:
        sys.argv = saved
    DG5_EVIDENCE.update(family=family, original_suite=str(output))
    return code

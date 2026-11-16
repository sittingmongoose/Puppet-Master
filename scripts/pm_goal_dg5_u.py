"""DG5 GH1 extension source: actual DG-U complete positive/negative actions.

The inherited suite retains its entry point and source-selection pin check.
Its own declared expected codes target the uncapped GH1 mutation ledger.
Crash/reopen matrices run separately under the original suite.
"""
import json
import os
from pathlib import Path
import shutil
import tempfile

import pm_goal_dg_u_oracles as original
import pm_goal_dg5_boundaries as bridge

DG5_EVIDENCE = {}


def main():
    selection, bad = original.verify_selection()
    if bad:
        raise ValueError({'selection_pin_mismatch': bad})
    base = Path(os.environ['PM_DG5_SCRATCH'])
    base.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix='u-', dir=base))
    cases = []
    bridge.install_u_entries(original.O)
    try:
        for case in original.CASES:
            if os.environ.get('PM_DG5_MATCH') and os.environ['PM_DG5_MATCH'] not in case['id']:
                continue
            bridge.CASE[0] = case
            try:
                result = original.run_case(case, work)
            finally:
                bridge.CASE[0] = None
            cases.append(result)
            if result['status'] != 'pass':
                raise ValueError(result)
    finally:
        shutil.rmtree(work)
    DG5_EVIDENCE.update(selection=selection['compatibility_selection'], cases=cases,
                        scope='Original complete actions; inherited crash matrix is separate.')
    return 0



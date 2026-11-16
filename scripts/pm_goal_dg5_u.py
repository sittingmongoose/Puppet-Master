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


SLOTS = [
    dict(name='goal.updated/request.expected_revision', family='goal.updated', entry='SirOwner.admit',
         path=('args', 0, 'expected_revision'), kind='integer', minimum=1, where='dgu/sir/request/expected_revision',
         jcs=True, also_rows=('dg5/dgu/sir/request/schema', 'dg5/site/pm_goal_dg_u_owners.py:183')),
    dict(name='goal.updated/read_request.sequence_id', family='goal.updated', entry='EventInspector.inspect',
         path=('args', 0, 'sequence_id'), kind='uint64', where='dgu/inspect/sequence_id',
         join_code='dgu/inspect/sequence', also_rows=('dg5/dgu/inspect/request/schema',)),
    dict(name='goal.updated/admission.accepted_at', family='goal.updated', entry='UpdateSourceOwner.capture',
         path=('args', 0, 'accepted_at'), kind='date-time', profile='EVENT_RECORD',
         where='dgu/source/capture/occurred_at_utc', also_rows=()),
]


def main():
    bridge.SLOTS[:] = SLOTS
    selection, bad = original.verify_selection()
    if bad:
        raise ValueError({'selection_pin_mismatch': bad})
    base = Path(os.environ['PM_DG5_SCRATCH'])
    base.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix='u-', dir=base))
    cases = []
    bridge.install_u_entries(original.O)
    import pm_goal_dg5_supplement_u as supplement
    corpus = list(original.CASES) + (supplement.SUPPLEMENT if os.environ.get('PM_DG5_SUPPLEMENT', '1') == '1' else [])
    try:
        for case in corpus:
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



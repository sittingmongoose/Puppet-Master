"""DG5 supplement negatives for goal.cancelled (lead decision 1116061157-ad82, condition 4).

Registered as the CA suite group 'DG5' (the suite's own negative harness checks each expected code).
Each case is one authored single defect; its declared target is written here before it runs.
"""
import copy

import pm_goal_dg_ca_c1 as C1

C1_SITE = 'dg5/site/pm_goal_dg_ca_c1.py:'
TARGETS = {}


def cases(suite):
    G = 'DG5'

    def stale_revision_only():
        # C1/entry/stale_revision_coherent_hash stales revision and currentness together, so with
        # :305 cut the currentness check :306 refuses; here only the revision is stale.
        w = suite.world()
        route = C1.NoAssociationCancel(w, state='active')
        old = copy.deepcopy(w.goal.body_cell(route.scope)['value']['record'])
        w.goal.mutate_state(route.scope, 'paused')
        current = w.goal.body_cell(route.scope)['value']['record']
        route.dispatch(route.user_request(expected_revision=old['revision'],
                                          expected_currentness_hash=current['currentness_hash']))
        return w, route.capture_source
    TARGETS['DG5/DG5/entry/stale_revision_only'] = C1_SITE + '305'
    suite.negative(G, 'DG5/entry/stale_revision_only', stale_revision_only, 'C1/capture_source/expected_revision',
                   boundary='capture_source/entry')

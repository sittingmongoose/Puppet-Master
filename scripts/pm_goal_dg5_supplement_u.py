"""DG5 supplement negatives for goal.updated (lead decision 1116061157-ad82, condition 4).

One authored single-defect negative for each owner or shared site that no DG-U case targets. Each
case declares its target here, before it runs: one site, or a duplicate set whose members check the
same field with the same predicate (the reason is written beside it). The judge credits a set only
when its joint cut accepts and each member, with the others cut, still refuses alone.
"""
import pm_goal_dg_u_oracles as U

O = U.O
SUPPLEMENT = []
SITE = 'dg5/site/pm_goal_dg_u_owners.py:'


def case(cid, expected, target, why):
    def deco(fn):
        SUPPLEMENT.append(dict(group='U-DG5', id=cid, kind='negative', expected=expected, fn=fn,
                               dg5_target=target, dg5_why=why))
        return fn
    return deco


@case('U-DG5/N/stale_revision_only', 'dgu/source/capture/stale_goal_revision', SITE + '1505',
      'U2/N/stale_revision_coherent stales revision and currentness together, so with 1505 cut the currentness '
      'check (1506) refuses; this single defect keeps the current currentness_hash and stales only the revision.')
def stale_revision_only(d):
    w = U.world(d)
    g = O.birth_goal(w)
    old = w.body.read_private(g['scope'], 'o')['body']
    U.run_direct(w, g, 'moved on')
    cur = w.body.read_private(g['scope'], 'o')['body']
    req = O.direct_request(w, g, 'late', expected=(old['revision'], cur['currentness_hash']))
    return w, U.admitted(w, req)

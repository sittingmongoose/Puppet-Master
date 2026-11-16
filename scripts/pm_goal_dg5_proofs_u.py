"""DG5 written proofs for goal.updated rows that no single-defect negative can kill alone.

Loaded by pm_goal_dg5_justified.written_proofs and re-bound there to the exact source bytes of
every cited site. A proof closes its row only while every dependency row is closed in the same
family (matrix least fixpoint). Nothing here earns kill credit.
"""
U = 'scripts/pm_goal_dg_u_owners.py'
SRC = 'scripts/pm_goal_test_source.py'
SITE = 'dg5/site/pm_goal_dg_u_owners.py:'

PROOFS = {
    SITE + '1860': dict(
        kind='code-selection',
        families=['goal.updated'],
        depends_on=[SITE + '1861'],
        sites=[(U, 1858), (U, 1860), (U, 1861), (SRC, 283)],
        argument=(
            'EventInspector.inspect reaches :1860 only in the row-is-None branch (:1858-1861): the '
            'inspected event has no row in the acquired GenericSource snapshot. In that branch the '
            'checker can never accept: if snap.defect is not None, :1860 refuses with source_defect; '
            'otherwise the unconditional refuse at :1861 fires with event_unavailable. With :1860 '
            'cut, the same complete call still refuses at :1861 (the supplement '
            'U-DG5/N/inspect_source_defect witnesses the defect state: a custody defect halts '
            'GenericSource.acquire before the event, pm_goal_test_source.py:282-286). So :1860 is a '
            'code-selection predicate between two refusals of one branch, not an acceptance gate; '
            'no input is accepted by removing it. It closes by this proof once :1861 is closed.')),
    SITE + '1862': dict(
        kind='entailed-by-source-construction',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1858), (U, 1862), (SRC, 284), (SRC, 295), (SRC, 302)],
        argument=(
            ':1862 requires snap.defect is None or snap.defect[1] > row.position for the row '
            'selected at :1858 from snap.rows. GenericSource.acquire (pm_goal_test_source.py) '
            'constructs snap.rows halt-before-defect on every defect path: a custody defect '
            'records (code, position, event) and returns without appending that row (:282-286); '
            'a frame-tail or watermark defect records the next position, past every appended row '
            '(:293-297); a duplicate identity records the duplicate row position and truncates '
            'rows before it (:301-303). Positions are assigned 0..n-1 in append order (:278-290), '
            'so every row present in snap.rows has position < defect[1] whenever a defect exists. '
            'No complete inspect call can present a row at or after its snapshot defect, so :1862 '
            'can never refuse alone; it restates the acquisition invariant at the consumer.')),
}

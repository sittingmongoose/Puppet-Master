"""DR guard table observation_group: RAP-113 restore-point observation ordinal, predecessor and owner-snapshot model.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('correlation_id', 'grouping_identity')


def O02_grouping(value, context):
    return 'observation_refused' if value['correlation_id'] != value['grouping_identity'] else None


def group_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('O02_grouping', g.Invariant('/correlation_id', 'equals the four-member RAP-113 grouping identity'), 'observation_refused', O02_grouping),
    ])

    def check(value):
        table.require('O02_grouping', value, context)
        return True
    return g.Case(table, check, context)

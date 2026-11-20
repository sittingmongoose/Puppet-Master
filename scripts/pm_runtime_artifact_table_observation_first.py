"""DR guard table observation_first: RAP-113 restore-point observation ordinal, predecessor and owner-snapshot model.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('producer_sequence_id', 'parent_event_id')


def O04a_first_ordinal(value, context):
    return 'observation_refused' if value['producer_sequence_id'] != 0 else None


def O04b_first_parent(value, context):
    return 'observation_refused' if value['parent_event_id'] is not None else None


def first_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('O04a_first_ordinal', g.Invariant('/producer_sequence_id', 'a first observation has ordinal 0'), 'observation_refused', O04a_first_ordinal),
        g.Guard('O04b_first_parent', g.Invariant('/parent_event_id', 'a first observation has no parent'), 'observation_refused', O04b_first_parent),
    ])

    def check(value):
        table.require('O04a_first_ordinal', value, context)
        table.require('O04b_first_parent', value, context)
        return True
    return g.Case(table, check, context)

"""DR guard table inspect_deleted: Authenticated source inspection for retained reads.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('body_deleted',)


def H07_body_deleted_type(value, context):
    return 'unavailable' if type(value['body_deleted']) is not bool else None


def deleted_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('H07_body_deleted_type', g.Invariant('/body_deleted', 'is an exact boolean'), 'unavailable', H07_body_deleted_type),
    ])

    def check(value):
        table.require('H07_body_deleted_type', value, context)
        return True
    return g.Case(table, check, context)

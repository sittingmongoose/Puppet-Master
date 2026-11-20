"""DR guard table observation_snapshot: RAP-113 restore-point observation ordinal, predecessor and owner-snapshot model.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('point_sha256', 'snapshot_sha256')


def O03b_owner_snapshot(value, context):
    return 'observation_refused' if value['point_sha256'] != value['snapshot_sha256'] else None


def snapshot_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('O03b_owner_snapshot', g.Invariant('/canonical_point', 'canonical bytes of the owner snapshot equal the candidate restore point bytes'), 'observation_refused', O03b_owner_snapshot),
    ])

    def check(value):
        table.require('O03b_owner_snapshot', value, context)
        return True
    return g.Case(table, check, context)

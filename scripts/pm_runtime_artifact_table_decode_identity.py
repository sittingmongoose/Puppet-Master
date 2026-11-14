"""DR guard table decode_identity: Full-envelope decode: dispatch, storage route, provider source and joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('idempotency_key', 'expected_identity')


def D17_identity(value, context):
    return 'identity join' if value['idempotency_key'] != value['expected_identity'] else None


def identity_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('D17_identity', g.Invariant('/idempotency_key', 'equals the recomputed RAP artifact identity'), 'identity join', D17_identity),
    ])

    def check(value):
        table.require('D17_identity', value, context)
        return True
    return g.Case(table, check, context)

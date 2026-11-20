"""DR guard table decode_identity_restore: Full-envelope decode: dispatch, storage route, provider source and joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('idempotency_key', 'expected_identity', 'point_project_id', 'payload_project_id')


def D17_identity(value, context):
    return 'identity join' if value['idempotency_key'] != value['expected_identity'] else None


def D18_point_project(value, context):
    return 'point Project join' if value['point_project_id'] != value['payload_project_id'] else None


def restore_identity_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('D17_identity', g.Invariant('/idempotency_key', 'equals the recomputed RAP artifact identity'), 'identity join', D17_identity),
        g.Guard('D18_point_project', g.Invariant('/point_project_id', 'restore point project_id equals the payload project_id'), 'point Project join', D18_point_project),
    ])

    def check(value):
        table.require('D17_identity', value, context)
        table.require('D18_point_project', value, context)
        return True
    return g.Case(table, check, context)

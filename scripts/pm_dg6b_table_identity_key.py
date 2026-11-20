"""DG6B guard table identity_key: Idempotency key recomputed from the family recipe (CV-366 for application scope).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('idempotency_key', 'expected_idempotency_key')


def IK01_idempotency_key(value, context):
    return 'idempotency_key' if value['idempotency_key'] != value['expected_idempotency_key'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('IK01_idempotency_key', g.Invariant('/idempotency_key', 'equals the recomputed idempotency key'), 'idempotency_key', IK01_idempotency_key),
    ])

    def check(value):
        table.require('IK01_idempotency_key', value, context)
        return True
    return g.Case(table, check, context)

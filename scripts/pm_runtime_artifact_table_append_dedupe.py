"""DR guard table append_dedupe: Hypothetical admitted append and retry model.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('global_digest', 'digest', 'scoped_digest')


def A04_global_conflict(value, context):
    return 'idempotency_conflict' if value['global_digest'] is not None and value['global_digest'] != value['digest'] else None


def A05_scoped_conflict(value, context):
    return 'idempotency_conflict' if value['scoped_digest'] is not None and value['scoped_digest'] != value['digest'] else None


def dedupe_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('A04_global_conflict', g.Invariant('/global_digest', 'a known event_id carries the same semantic digest'), 'idempotency_conflict', A04_global_conflict),
        g.Guard('A05_scoped_conflict', g.Invariant('/scoped_digest', 'a known scoped key carries the same semantic digest'), 'idempotency_conflict', A05_scoped_conflict),
    ])

    def check(value):
        table.require('A04_global_conflict', value, context)
        table.require('A05_scoped_conflict', value, context)
        return True
    return g.Case(table, check, context)

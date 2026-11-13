"""DR guard table schema_overlay: Exact schema validator: one adopted schema occurrence per call.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('overlay_rejects',)


def S03_provider_hash_overlay(value, context):
    return 'schema_provider_hash' if value['overlay_rejects'] is not False else None


def overlay_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('S03_provider_hash_overlay', g.Invariant('/overlay_rejects', 'current provider hash is null or sha256 digest text'), 'schema_provider_hash', S03_provider_hash_overlay),
    ])

    def check(value):
        table.require('S03_provider_hash_overlay', value, context)
        return True
    return g.Case(table, check, context)

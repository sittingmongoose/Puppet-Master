"""DR guard table append_gate: Hypothetical admitted append and retry model.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('admission', 'source_valid', 'dedupe_available')


def A01_admission(value, context):
    return 'withdrawn' if value['admission'] is not True else None


def A02a_source(value, context):
    return 'unavailable' if value['source_valid'] is not True else None


def A02b_dedupe(value, context):
    return 'unavailable' if value['dedupe_available'] is not True else None


def gate_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('A01_admission', g.Invariant('/admission', 'is exactly true'), 'withdrawn', A01_admission),
        g.Guard('A02a_source', g.Invariant('/source_valid', 'is exactly true'), 'unavailable', A02a_source),
        g.Guard('A02b_dedupe', g.Invariant('/dedupe_available', 'is exactly true'), 'unavailable', A02b_dedupe),
    ])

    def check(value):
        table.require('A01_admission', value, context)
        table.require('A02a_source', value, context)
        table.require('A02b_dedupe', value, context)
        return True
    return g.Case(table, check, context)

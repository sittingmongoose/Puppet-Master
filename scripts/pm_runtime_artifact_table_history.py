"""DR guard table history: Explicit retained-history decoder selection.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('decoder',)


def H05_decoder(value, context):
    return 'unavailable' if value['decoder'] != 'historical-v1-before-provider-hash' else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('H05_decoder', g.Invariant('/decoder', 'is the supported historical v1 decoder'), 'unavailable', H05_decoder),
    ])

    def check(value):
        table.require('H05_decoder', value, context)
        return True
    return g.Case(table, check, context)

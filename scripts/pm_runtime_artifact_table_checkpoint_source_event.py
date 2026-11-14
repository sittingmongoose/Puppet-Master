"""DR guard table checkpoint_source_event: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('source_event_sha256', 'event_sha256')


def C06b_source_event(value, context):
    return 'checkpoint_mismatch' if value['source_event_sha256'] != value['event_sha256'] else None


def source_event_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C06b_source_event', g.Invariant('/source_event_sha256', 'the selected source event bytes equal the event bytes'), 'checkpoint_mismatch', C06b_source_event),
    ])

    def check(value):
        table.require('C06b_source_event', value, context)
        return True
    return g.Case(table, check, context)

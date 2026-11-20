"""DR guard table inspect_payload: Authenticated source inspection for retained reads.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('original_payload_sha256', 'payload_sha256')


def H04_original_payload(value, context):
    return 'identity_conflict' if value['original_payload_sha256'] != value['payload_sha256'] else None


def payload_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('H04_original_payload', g.Invariant('/original_payload_sha256', 'canonical bytes of the original payload equal the payload bytes'), 'identity_conflict', H04_original_payload),
    ])

    def check(value):
        table.require('H04_original_payload', value, context)
        return True
    return g.Case(table, check, context)

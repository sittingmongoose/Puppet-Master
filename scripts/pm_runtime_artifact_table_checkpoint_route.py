"""DR guard table checkpoint_route: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('row_checkpoint_key', 'key_template', 'row_checkpoint_schema_ref', 'schema_ref')


def C01a_route_key(value, context):
    return 'checkpoint_mismatch' if value['row_checkpoint_key'] != value['key_template'] else None


def C01b_schema_ref(value, context):
    return 'checkpoint_mismatch' if value['row_checkpoint_schema_ref'] != value['schema_ref'] else None


def route_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C01a_route_key', g.Invariant('/row_checkpoint_key', 'equals the SP-278 checkpoint key template'), 'checkpoint_mismatch', C01a_route_key),
        g.Guard('C01b_schema_ref', g.Invariant('/row_checkpoint_schema_ref', 'equals the checkpoint schema reference'), 'checkpoint_mismatch', C01b_schema_ref),
    ])

    def check(value):
        table.require('C01a_route_key', value, context)
        table.require('C01b_schema_ref', value, context)
        return True
    return g.Case(table, check, context)

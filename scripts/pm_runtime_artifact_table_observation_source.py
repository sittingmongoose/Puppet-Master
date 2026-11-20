"""DR guard table observation_source: RAP-113 restore-point observation ordinal, predecessor and owner-snapshot model.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('proof_valid', 'predecessor_complete', 'snapshot_current')


def O01a_proof_valid(value, context):
    return 'observation_refused' if value['proof_valid'] is not True else None


def O01b_predecessor_complete(value, context):
    return 'observation_refused' if value['predecessor_complete'] is not True else None


def O01c_snapshot_current(value, context):
    return 'observation_refused' if value['snapshot_current'] is not True else None


def source_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('O01a_proof_valid', g.Invariant('/proof_valid', 'is exactly true'), 'observation_refused', O01a_proof_valid),
        g.Guard('O01b_predecessor_complete', g.Invariant('/predecessor_complete', 'is exactly true'), 'observation_refused', O01b_predecessor_complete),
        g.Guard('O01c_snapshot_current', g.Invariant('/snapshot_current', 'is exactly true'), 'observation_refused', O01c_snapshot_current),
    ])

    def check(value):
        table.require('O01a_proof_valid', value, context)
        table.require('O01b_predecessor_complete', value, context)
        table.require('O01c_snapshot_current', value, context)
        return True
    return g.Case(table, check, context)

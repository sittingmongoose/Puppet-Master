"""DR guard table checkpoint_manifest_b: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('survivor_prefix', 'selection_survivor_prefix', 'inventory_sha256', 'segments_sha256', 'selection_inventory_digest', 'inventory_digest', 'selection_watermarks_digest', 'watermarks_digest', 'selection_excluded_digest', 'excluded_digest', 'selection_retired_digest', 'retired_digest')


def C08k_survivor_prefix(value, context):
    return 'checkpoint_mismatch' if value['survivor_prefix'] != value['selection_survivor_prefix'] else None


def C08l_inventory_bytes(value, context):
    return 'checkpoint_mismatch' if value['inventory_sha256'] != value['segments_sha256'] else None


def C08m_inventory_digest(value, context):
    return 'checkpoint_mismatch' if value['selection_inventory_digest'] != value['inventory_digest'] else None


def C08n_watermarks_digest(value, context):
    return 'checkpoint_mismatch' if value['selection_watermarks_digest'] != value['watermarks_digest'] else None


def C08o_excluded_digest(value, context):
    return 'checkpoint_mismatch' if value['selection_excluded_digest'] != value['excluded_digest'] else None


def C08p_retired_digest(value, context):
    return 'checkpoint_mismatch' if value['selection_retired_digest'] != value['retired_digest'] else None


def manifest_b_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C08k_survivor_prefix', g.Invariant('/manifest_survivor_prefix_sha256', 'equals the selection survivor prefix digest'), 'checkpoint_mismatch', C08k_survivor_prefix),
        g.Guard('C08l_inventory_bytes', g.Invariant('/manifest_retained_inventory', 'inventory bytes equal the selected source segments bytes'), 'checkpoint_mismatch', C08l_inventory_bytes),
        g.Guard('C08m_inventory_digest', g.Invariant('/selection_retained_inventory_sha256', 'equals the binding digest of the inventory'), 'checkpoint_mismatch', C08m_inventory_digest),
        g.Guard('C08n_watermarks_digest', g.Invariant('/selection_durable_watermarks_sha256', 'equals the binding digest of the durable watermarks'), 'checkpoint_mismatch', C08n_watermarks_digest),
        g.Guard('C08o_excluded_digest', g.Invariant('/selection_excluded_ranges_sha256', 'equals the binding digest of the excluded ranges'), 'checkpoint_mismatch', C08o_excluded_digest),
        g.Guard('C08p_retired_digest', g.Invariant('/selection_retired_inputs_sha256', 'equals the binding digest of the retired inputs'), 'checkpoint_mismatch', C08p_retired_digest),
    ])

    def check(value):
        table.require('C08k_survivor_prefix', value, context)
        table.require('C08l_inventory_bytes', value, context)
        table.require('C08m_inventory_digest', value, context)
        table.require('C08n_watermarks_digest', value, context)
        table.require('C08o_excluded_digest', value, context)
        table.require('C08p_retired_digest', value, context)
        return True
    return g.Case(table, check, context)

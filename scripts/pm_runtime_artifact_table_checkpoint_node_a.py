"""DR guard table checkpoint_node_a: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('node_present', 'node_generation_id', 'generation', 'node_state', 'current_count')


def C04x_node_present(value, context):
    return 'checkpoint_mismatch' if value['node_present'] is not True else None


def C04a_node_generation_copy(value, context):
    return 'checkpoint_mismatch' if value['node_present'] is True and value['node_generation_id'] != value['generation'] else None


def C04b_node_state(value, context):
    return 'checkpoint_mismatch' if value['node_present'] is True and value['node_state'] != 'current' else None


def C04c_single_current(value, context):
    return 'checkpoint_mismatch' if value['node_present'] is True and value['current_count'] != 1 else None


def node_a_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C04x_node_present', g.Invariant('/current_generation_id', 'names a generation present in the map'), 'checkpoint_mismatch', C04x_node_present),
        g.Guard('C04a_node_generation_copy', g.Invariant('/node_generation_id', 'the selected node copy equals the current generation key'), 'checkpoint_mismatch', C04a_node_generation_copy),
        g.Guard('C04b_node_state', g.Invariant('/node_state', 'the selected node is current'), 'checkpoint_mismatch', C04b_node_state),
        g.Guard('C04c_single_current', g.Invariant('/current_count', 'exactly one generation is current'), 'checkpoint_mismatch', C04c_single_current),
    ])

    def check(value):
        table.require('C04x_node_present', value, context)
        table.require('C04a_node_generation_copy', value, context)
        table.require('C04b_node_state', value, context)
        table.require('C04c_single_current', value, context)
        return True
    return g.Case(table, check, context)

"""DR guard table checkpoint_node_b: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('selection_storage', 'storage', 'node_present', 'anchor_selection_storage', 'frontier_selection_sha256', 'selection_sha256', 'token_selection_sha256', 'source_verified', 'source_redb_snapshot_id', 'token_redb_snapshot_id')


def C04d_selection_store(value, context):
    return 'checkpoint_mismatch' if value['selection_storage'] != value['storage'] else None


def C04e_anchor_store(value, context):
    return 'checkpoint_mismatch' if value['node_present'] is True and value['anchor_selection_storage'] != value['storage'] else None


def C04f_frontier_selection(value, context):
    return 'checkpoint_mismatch' if value['node_present'] is True and value['frontier_selection_sha256'] != value['selection_sha256'] else None


def C04g_token_selection(value, context):
    return 'checkpoint_mismatch' if value['token_selection_sha256'] != value['selection_sha256'] else None


def C04h_verified(value, context):
    return 'checkpoint_mismatch' if value['source_verified'] is not True else None


def C04i_snapshot(value, context):
    return 'checkpoint_mismatch' if value['source_redb_snapshot_id'] != value['token_redb_snapshot_id'] else None


def node_b_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C04d_selection_store', g.Invariant('/selection_storage_instance_id', 'the live source selection names the custody store'), 'checkpoint_mismatch', C04d_selection_store),
        g.Guard('C04e_anchor_store', g.Invariant('/anchor_selection_storage_instance_id', 'the anchor selection names the custody store'), 'checkpoint_mismatch', C04e_anchor_store),
        g.Guard('C04f_frontier_selection', g.Invariant('/frontier_selection_sha256', 'frontier selection bytes equal the live selection bytes'), 'checkpoint_mismatch', C04f_frontier_selection),
        g.Guard('C04g_token_selection', g.Invariant('/token_selection_sha256', 'token selection bytes equal the live selection bytes'), 'checkpoint_mismatch', C04g_token_selection),
        g.Guard('C04h_verified', g.Invariant('/source_verified', 'the selected source is verified (exactly true)'), 'checkpoint_mismatch', C04h_verified),
        g.Guard('C04i_snapshot', g.Invariant('/token_redb_snapshot_id', 'equals the selected source redb snapshot'), 'checkpoint_mismatch', C04i_snapshot),
    ])

    def check(value):
        table.require('C04d_selection_store', value, context)
        table.require('C04e_anchor_store', value, context)
        table.require('C04f_frontier_selection', value, context)
        table.require('C04g_token_selection', value, context)
        table.require('C04h_verified', value, context)
        table.require('C04i_snapshot', value, context)
        return True
    return g.Case(table, check, context)

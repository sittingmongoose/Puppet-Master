"""DR guard table checkpoint_token_b: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('token_frontier_revision', 'expected_frontier_revision', 'token_frontier_sha256', 'expected_frontier_sha256', 'token_dataset_name', 'expected_dataset_name', 'node_dataset_name', 'token_dataset_name_text')


def C05e_token_revision(value, context):
    return 'checkpoint_mismatch' if value['token_frontier_revision'] != value['expected_frontier_revision'] else None


def C05f_token_frontier(value, context):
    return 'checkpoint_mismatch' if value['token_frontier_sha256'] != value['expected_frontier_sha256'] else None


def C05g_token_dataset(value, context):
    return 'checkpoint_mismatch' if value['token_dataset_name'] != value['expected_dataset_name'] else None


def C05j_node_dataset(value, context):
    return 'checkpoint_mismatch' if value['node_dataset_name'] != value['token_dataset_name_text'] else None


def token_b_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C05e_token_revision', g.Invariant('/token_frontier_revision', 'token frontier_revision bytes equal the frontier publication revision'), 'checkpoint_mismatch', C05e_token_revision),
        g.Guard('C05f_token_frontier', g.Invariant('/token_frontier_sha256', 'token frontier digest bytes equal the recomputed frontier digest'), 'checkpoint_mismatch', C05f_token_frontier),
        g.Guard('C05g_token_dataset', g.Invariant('/token_index_dataset_name', 'token dataset name bytes equal the generation dataset name'), 'checkpoint_mismatch', C05g_token_dataset),
        g.Guard('C05j_node_dataset', g.Invariant('/node_index_dataset_name', 'the node dataset name equals the token dataset name'), 'checkpoint_mismatch', C05j_node_dataset),
    ])

    def check(value):
        table.require('C05e_token_revision', value, context)
        table.require('C05f_token_frontier', value, context)
        table.require('C05g_token_dataset', value, context)
        table.require('C05j_node_dataset', value, context)
        return True
    return g.Case(table, check, context)

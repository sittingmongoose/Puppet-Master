"""DO guard suite `checkpoint_join_2` (sweep part 2A). Checkpoint read: the read token, row and source joins.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def read_token_frontier_sha256(value, context):
    left, right = value['read_token']['frontier_sha256'], value['expected_read_token']['frontier_sha256']
    return 'checkpoint_read_token_join' if type(left) is not type(right) or left != right else None


def read_token_index_dataset_name(value, context):
    left, right = value['read_token']['index_dataset_name'], value['expected_read_token']['index_dataset_name']
    return 'checkpoint_read_token_join' if type(left) is not type(right) or left != right else None


def read_token_source_selection(value, context):
    return ('checkpoint_read_token_join' if value['typed_read_token_source_selection'] != value['typed_frontier_source_selection']
            else None)


def read_token_redb_snapshot_id(value, context):
    left, right = value['read_token']['redb_snapshot_id'], value['expected_read_token']['redb_snapshot_id']
    return 'checkpoint_read_token_join' if type(left) is not type(right) or left != right else None


def read_current_source_selection(value, context):
    return ('checkpoint_read_token_join' if value['typed_current_source_selection'] != value['typed_frontier_source_selection']
            else None)


ROWS = (
    ('read_token_frontier_sha256', '/read/read_token/frontier_sha256', 'equals the binding digest of the current frontier',
     'checkpoint_read_token_join', read_token_frontier_sha256, ('read_token', 'expected_read_token'), 'token_join'),
    ('read_token_index_dataset_name', '/read/read_token/index_dataset_name', "equals 'event_record_index.v2@' + current id (typed)",
     'checkpoint_read_token_join', read_token_index_dataset_name, ('read_token', 'expected_read_token'), 'token_join'),
    ('read_token_source_selection', '/read/read_token/source_selection', "is a typed copy of the frontier's source selection",
     'checkpoint_read_token_join', read_token_source_selection, ('typed_read_token_source_selection', 'typed_frontier_source_selection'), 'token_join'),
    ('read_token_redb_snapshot_id', '/read/read_token/redb_snapshot_id', "equals the read's redb snapshot id (typed)",
     'checkpoint_read_token_join', read_token_redb_snapshot_id, ('read_token', 'expected_read_token'), 'token_join'),
    ('read_current_source_selection', '/read/current_source_selection', "is a typed copy of the frontier's source selection",
     'checkpoint_read_token_join', read_current_source_selection, ('typed_current_source_selection', 'typed_frontier_source_selection'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('read_token_frontier_sha256', g.Invariant('/read/read_token/frontier_sha256', 'equals the binding digest of the current frontier'), 'checkpoint_read_token_join', read_token_frontier_sha256),
        g.Guard('read_token_index_dataset_name', g.Invariant('/read/read_token/index_dataset_name', "equals 'event_record_index.v2@' + current id (typed)"), 'checkpoint_read_token_join', read_token_index_dataset_name),
        g.Guard('read_token_source_selection', g.Invariant('/read/read_token/source_selection', "is a typed copy of the frontier's source selection"), 'checkpoint_read_token_join', read_token_source_selection),
        g.Guard('read_token_redb_snapshot_id', g.Invariant('/read/read_token/redb_snapshot_id', "equals the read's redb snapshot id (typed)"), 'checkpoint_read_token_join', read_token_redb_snapshot_id),
        g.Guard('read_current_source_selection', g.Invariant('/read/current_source_selection', "is a typed copy of the frontier's source selection"), 'checkpoint_read_token_join', read_current_source_selection),
    ])
    context = None

    def check(complete):
        table.require('read_token_frontier_sha256', complete, context)
        table.require('read_token_index_dataset_name', complete, context)
        table.require('read_token_source_selection', complete, context)
        table.require('read_token_redb_snapshot_id', complete, context)
        table.require('read_current_source_selection', complete, context)
        return True
    return g.Case(table, check, context)

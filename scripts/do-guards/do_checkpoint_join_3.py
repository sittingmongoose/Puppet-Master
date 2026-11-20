"""DO guard suite `checkpoint_join_3` (sweep part 2A). Checkpoint read: the read token, row and source joins.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def anchor_source_storage_identity(value, context):
    left, right = value['anchor_source_selection']['storage_instance_id'], value['storage_instance_id']
    return 'checkpoint_source_storage_identity' if type(left) is not type(right) or left != right else None


def frontier_source_storage_identity(value, context):
    left, right = value['frontier_source_selection']['storage_instance_id'], value['storage_instance_id']
    return 'checkpoint_source_storage_identity' if type(left) is not type(right) or left != right else None


def index_row_scope_kind(value, context):
    left, right = value['row'].get('scope_kind'), value['expected_row']['scope_kind']
    return 'index_row_scope_kind' if type(left) is not type(right) or left != right else None


def index_row_project_id(value, context):
    left, right = value['row'].get('project_id'), value['expected_row']['project_id']
    return 'index_row_project_id' if type(left) is not type(right) or left != right else None


def index_row_scope_partition(value, context):
    left, right = value['row'].get('scope_partition'), value['expected_row']['scope_partition']
    return 'index_row_scope_partition' if type(left) is not type(right) or left != right else None


ROWS = (
    ('anchor_source_storage_identity', '/read/checkpoint/generations/*/anchor/source_selection/storage_instance_id', 'equals the payload storage instance (typed)',
     'checkpoint_source_storage_identity', anchor_source_storage_identity, ('anchor_source_selection', 'storage_instance_id'), None),
    ('frontier_source_storage_identity', '/read/checkpoint/generations/*/frontier/source_selection/storage_instance_id', 'equals the payload storage instance (typed)',
     'checkpoint_source_storage_identity', frontier_source_storage_identity, ('frontier_source_selection', 'storage_instance_id'), None),
    ('index_row_scope_kind', '/read/row/scope_kind', 'equals the copy recomputed from the event (typed)',
     'index_row_scope_kind', index_row_scope_kind, ('row', 'expected_row'), None),
    ('index_row_project_id', '/read/row/project_id', 'equals the copy recomputed from the event (typed)',
     'index_row_project_id', index_row_project_id, ('row', 'expected_row'), None),
    ('index_row_scope_partition', '/read/row/scope_partition', 'equals the copy recomputed from the event (typed)',
     'index_row_scope_partition', index_row_scope_partition, ('row', 'expected_row'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('anchor_source_storage_identity', g.Invariant('/read/checkpoint/generations/*/anchor/source_selection/storage_instance_id', 'equals the payload storage instance (typed)'), 'checkpoint_source_storage_identity', anchor_source_storage_identity),
        g.Guard('frontier_source_storage_identity', g.Invariant('/read/checkpoint/generations/*/frontier/source_selection/storage_instance_id', 'equals the payload storage instance (typed)'), 'checkpoint_source_storage_identity', frontier_source_storage_identity),
        g.Guard('index_row_scope_kind', g.Invariant('/read/row/scope_kind', 'equals the copy recomputed from the event (typed)'), 'index_row_scope_kind', index_row_scope_kind),
        g.Guard('index_row_project_id', g.Invariant('/read/row/project_id', 'equals the copy recomputed from the event (typed)'), 'index_row_project_id', index_row_project_id),
        g.Guard('index_row_scope_partition', g.Invariant('/read/row/scope_partition', 'equals the copy recomputed from the event (typed)'), 'index_row_scope_partition', index_row_scope_partition),
    ])
    context = None

    def check(complete):
        table.require('anchor_source_storage_identity', complete, context)
        table.require('frontier_source_storage_identity', complete, context)
        table.require('index_row_scope_kind', complete, context)
        table.require('index_row_project_id', complete, context)
        table.require('index_row_scope_partition', complete, context)
        return True
    return g.Case(table, check, context)

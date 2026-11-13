"""DO guard suite `checkpoint_join_7` (sweep part 2A). Checkpoint read: the read token, row and source joins.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def index_source_event(value, context):
    return 'index_original_source_join' if value['typed_source_event'] != value['typed_event'] else None


def index_source_value_sha256(value, context):
    left, right = value['source_value_sha256'], value['expected_source_value_sha256']
    return 'index_original_source_join' if type(left) is not type(right) or left != right else None


def index_row_value_schema(value, context):
    return 'index_row_schema' if value['index_row_schema_valid'] is not True else None


def index_row_count(value, context):
    count = value['frontier_index_row_count']
    return 'index_complete_row_set' if type(count) is not int or count != 1 else None


def index_row_set_sha256(value, context):
    left, right = value['frontier_index_row_set_sha256'], value['expected_row_set_sha256']
    return 'index_complete_row_set' if type(left) is not type(right) or left != right else None


ROWS = (
    ('index_source_event', '/read/source_event', 'is a typed copy of the event',
     'index_original_source_join', index_source_event, ('typed_source_event', 'typed_event'), None),
    ('index_source_value_sha256', '/read/source_value_sha256', 'equals the SHA-256 of the packed event (typed)',
     'index_original_source_join', index_source_value_sha256, ('source_value_sha256', 'expected_source_value_sha256'), None),
    ('index_row_value_schema', '/read/row', 'validates against the event_record_index value schema',
     'index_row_schema', index_row_value_schema, ('index_row_schema_valid',), None),
    ('index_row_count', '/read/checkpoint/generations/*/frontier/index_row_count', 'is exactly the integer 1',
     'index_complete_row_set', index_row_count, ('frontier_index_row_count',), None),
    ('index_row_set_sha256', '/read/checkpoint/generations/*/frontier/index_row_set_sha256', 'equals the binding digest of the one-row set',
     'index_complete_row_set', index_row_set_sha256, ('frontier_index_row_set_sha256', 'expected_row_set_sha256'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('index_source_event', g.Invariant('/read/source_event', 'is a typed copy of the event'), 'index_original_source_join', index_source_event),
        g.Guard('index_source_value_sha256', g.Invariant('/read/source_value_sha256', 'equals the SHA-256 of the packed event (typed)'), 'index_original_source_join', index_source_value_sha256),
        g.Guard('index_row_value_schema', g.Invariant('/read/row', 'validates against the event_record_index value schema'), 'index_row_schema', index_row_value_schema),
        g.Guard('index_row_count', g.Invariant('/read/checkpoint/generations/*/frontier/index_row_count', 'is exactly the integer 1'), 'index_complete_row_set', index_row_count),
        g.Guard('index_row_set_sha256', g.Invariant('/read/checkpoint/generations/*/frontier/index_row_set_sha256', 'equals the binding digest of the one-row set'), 'index_complete_row_set', index_row_set_sha256),
    ])
    context = None

    def check(complete):
        table.require('index_source_event', complete, context)
        table.require('index_source_value_sha256', complete, context)
        table.require('index_row_value_schema', complete, context)
        table.require('index_row_count', complete, context)
        table.require('index_row_set_sha256', complete, context)
        return True
    return g.Case(table, check, context)

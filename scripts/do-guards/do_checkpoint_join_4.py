"""DO guard suite `checkpoint_join_4` (sweep part 2A). Checkpoint read: the read token, row and source joins.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def index_row_sequence_id(value, context):
    left, right = value['row'].get('sequence_id'), value['expected_row']['sequence_id']
    return 'index_row_sequence_id' if type(left) is not type(right) or left != right else None


def index_row_event_id(value, context):
    left, right = value['row'].get('event_id'), value['expected_row']['event_id']
    return 'index_row_event_id' if type(left) is not type(right) or left != right else None


def index_row_event_type(value, context):
    left, right = value['row'].get('event_type'), value['expected_row']['event_type']
    return 'index_row_event_type' if type(left) is not type(right) or left != right else None


def index_row_producer_semantic_digest(value, context):
    left, right = value['row'].get('producer_semantic_digest'), value['expected_row']['producer_semantic_digest']
    return 'index_row_producer_semantic_digest' if type(left) is not type(right) or left != right else None


def index_row_idempotency_key(value, context):
    left, right = value['row'].get('idempotency_key'), value['expected_row']['idempotency_key']
    return 'index_row_idempotency_key' if type(left) is not type(right) or left != right else None


ROWS = (
    ('index_row_sequence_id', '/read/row/sequence_id', 'equals the copy recomputed from the event (typed)',
     'index_row_sequence_id', index_row_sequence_id, ('row', 'expected_row'), None),
    ('index_row_event_id', '/read/row/event_id', 'equals the copy recomputed from the event (typed)',
     'index_row_event_id', index_row_event_id, ('row', 'expected_row'), None),
    ('index_row_event_type', '/read/row/event_type', 'equals the copy recomputed from the event (typed)',
     'index_row_event_type', index_row_event_type, ('row', 'expected_row'), None),
    ('index_row_producer_semantic_digest', '/read/row/producer_semantic_digest', 'equals the copy recomputed from the event (typed)',
     'index_row_producer_semantic_digest', index_row_producer_semantic_digest, ('row', 'expected_row'), None),
    ('index_row_idempotency_key', '/read/row/idempotency_key', 'equals the copy recomputed from the event (typed)',
     'index_row_idempotency_key', index_row_idempotency_key, ('row', 'expected_row'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('index_row_sequence_id', g.Invariant('/read/row/sequence_id', 'equals the copy recomputed from the event (typed)'), 'index_row_sequence_id', index_row_sequence_id),
        g.Guard('index_row_event_id', g.Invariant('/read/row/event_id', 'equals the copy recomputed from the event (typed)'), 'index_row_event_id', index_row_event_id),
        g.Guard('index_row_event_type', g.Invariant('/read/row/event_type', 'equals the copy recomputed from the event (typed)'), 'index_row_event_type', index_row_event_type),
        g.Guard('index_row_producer_semantic_digest', g.Invariant('/read/row/producer_semantic_digest', 'equals the copy recomputed from the event (typed)'), 'index_row_producer_semantic_digest', index_row_producer_semantic_digest),
        g.Guard('index_row_idempotency_key', g.Invariant('/read/row/idempotency_key', 'equals the copy recomputed from the event (typed)'), 'index_row_idempotency_key', index_row_idempotency_key),
    ])
    context = None

    def check(complete):
        table.require('index_row_sequence_id', complete, context)
        table.require('index_row_event_id', complete, context)
        table.require('index_row_event_type', complete, context)
        table.require('index_row_producer_semantic_digest', complete, context)
        table.require('index_row_idempotency_key', complete, context)
        return True
    return g.Case(table, check, context)

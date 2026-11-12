"""DO guard suite `checkpoint_join_5` (sweep part 2A). Checkpoint read: the read token, row and source joins.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def index_row_payload_sha256(value, context):
    left, right = value['row'].get('payload_sha256'), value['expected_row']['payload_sha256']
    return 'index_row_payload_sha256' if type(left) is not type(right) or left != right else None


def index_row_correlation_id(value, context):
    left, right = value['row'].get('correlation_id'), value['expected_row']['correlation_id']
    return 'index_row_correlation_id' if type(left) is not type(right) or left != right else None


def index_row_causation_event_id(value, context):
    left, right = value['row'].get('causation_event_id'), value['expected_row']['causation_event_id']
    return 'index_row_causation_event_id' if type(left) is not type(right) or left != right else None


def index_row_persisted_at_utc(value, context):
    left, right = value['row'].get('persisted_at_utc'), value['expected_row']['persisted_at_utc']
    return 'index_row_persisted_at_utc' if type(left) is not type(right) or left != right else None


def index_row_redaction_profile(value, context):
    left, right = value['row'].get('redaction_profile'), value['expected_row']['redaction_profile']
    return 'index_row_redaction_profile' if type(left) is not type(right) or left != right else None


ROWS = (
    ('index_row_payload_sha256', '/read/row/payload_sha256', 'equals the copy recomputed from the event (typed)',
     'index_row_payload_sha256', index_row_payload_sha256, ('row', 'expected_row'), None),
    ('index_row_correlation_id', '/read/row/correlation_id', 'equals the copy recomputed from the event (typed)',
     'index_row_correlation_id', index_row_correlation_id, ('row', 'expected_row'), None),
    ('index_row_causation_event_id', '/read/row/causation_event_id', 'equals the copy recomputed from the event (typed)',
     'index_row_causation_event_id', index_row_causation_event_id, ('row', 'expected_row'), None),
    ('index_row_persisted_at_utc', '/read/row/persisted_at_utc', 'equals the copy recomputed from the event (typed)',
     'index_row_persisted_at_utc', index_row_persisted_at_utc, ('row', 'expected_row'), None),
    ('index_row_redaction_profile', '/read/row/redaction_profile', 'equals the copy recomputed from the event (typed)',
     'index_row_redaction_profile', index_row_redaction_profile, ('row', 'expected_row'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('index_row_payload_sha256', g.Invariant('/read/row/payload_sha256', 'equals the copy recomputed from the event (typed)'), 'index_row_payload_sha256', index_row_payload_sha256),
        g.Guard('index_row_correlation_id', g.Invariant('/read/row/correlation_id', 'equals the copy recomputed from the event (typed)'), 'index_row_correlation_id', index_row_correlation_id),
        g.Guard('index_row_causation_event_id', g.Invariant('/read/row/causation_event_id', 'equals the copy recomputed from the event (typed)'), 'index_row_causation_event_id', index_row_causation_event_id),
        g.Guard('index_row_persisted_at_utc', g.Invariant('/read/row/persisted_at_utc', 'equals the copy recomputed from the event (typed)'), 'index_row_persisted_at_utc', index_row_persisted_at_utc),
        g.Guard('index_row_redaction_profile', g.Invariant('/read/row/redaction_profile', 'equals the copy recomputed from the event (typed)'), 'index_row_redaction_profile', index_row_redaction_profile),
    ])
    context = None

    def check(complete):
        table.require('index_row_payload_sha256', complete, context)
        table.require('index_row_correlation_id', complete, context)
        table.require('index_row_causation_event_id', complete, context)
        table.require('index_row_persisted_at_utc', complete, context)
        table.require('index_row_redaction_profile', complete, context)
        return True
    return g.Case(table, check, context)

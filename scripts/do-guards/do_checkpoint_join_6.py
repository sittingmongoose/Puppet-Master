"""DO guard suite `checkpoint_join_6` (sweep part 2A). Checkpoint read: the read token, row and source joins.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def index_row_source_schema_id(value, context):
    left, right = value['row'].get('source_schema_id'), value['expected_row']['source_schema_id']
    return 'index_row_source_schema_id' if type(left) is not type(right) or left != right else None


def index_row_source_schema_version(value, context):
    left, right = value['row'].get('source_schema_version'), value['expected_row']['source_schema_version']
    return 'index_row_source_schema_version' if type(left) is not type(right) or left != right else None


def index_row_projector_replay_only(value, context):
    left, right = value['row'].get('projector_replay_only'), value['expected_row']['projector_replay_only']
    return 'index_row_projector_replay_only' if type(left) is not type(right) or left != right else None


def index_row_key(value, context):
    left, right = value['row_key'], value['expected_row_key']
    return 'index_row_locator_join' if type(left) is not type(right) or left != right else None


def index_row_checkpoint_ref(value, context):
    row = value['row']
    locator = {}
    if 'publication_locator' in row and type(row['publication_locator']) is dict:
        locator = row['publication_locator']
    left = locator.get('checkpoint_ref')
    right = value['expected_read_token']['checkpoint_ref']
    return 'index_row_locator_join' if type(left) is not type(right) or left != right else None


ROWS = (
    ('index_row_source_schema_id', '/read/row/source_schema_id', 'equals the copy recomputed from the event (typed)',
     'index_row_source_schema_id', index_row_source_schema_id, ('row', 'expected_row'), None),
    ('index_row_source_schema_version', '/read/row/source_schema_version', 'equals the copy recomputed from the event (typed)',
     'index_row_source_schema_version', index_row_source_schema_version, ('row', 'expected_row'), None),
    ('index_row_projector_replay_only', '/read/row/projector_replay_only', 'equals the copy recomputed from the event (typed)',
     'index_row_projector_replay_only', index_row_projector_replay_only, ('row', 'expected_row'), None),
    ('index_row_key', '/read/row_key', 'equals event_record_index.v2:{partition}:{sequence:020}:{event_id} (typed)',
     'index_row_locator_join', index_row_key, ('row_key', 'expected_row_key'), None),
    ('index_row_checkpoint_ref', '/read/row/publication_locator/checkpoint_ref', 'equals the expected checkpoint ref (typed)',
     'index_row_locator_join', index_row_checkpoint_ref, ('row', 'expected_read_token'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('index_row_source_schema_id', g.Invariant('/read/row/source_schema_id', 'equals the copy recomputed from the event (typed)'), 'index_row_source_schema_id', index_row_source_schema_id),
        g.Guard('index_row_source_schema_version', g.Invariant('/read/row/source_schema_version', 'equals the copy recomputed from the event (typed)'), 'index_row_source_schema_version', index_row_source_schema_version),
        g.Guard('index_row_projector_replay_only', g.Invariant('/read/row/projector_replay_only', 'equals the copy recomputed from the event (typed)'), 'index_row_projector_replay_only', index_row_projector_replay_only),
        g.Guard('index_row_key', g.Invariant('/read/row_key', 'equals event_record_index.v2:{partition}:{sequence:020}:{event_id} (typed)'), 'index_row_locator_join', index_row_key),
        g.Guard('index_row_checkpoint_ref', g.Invariant('/read/row/publication_locator/checkpoint_ref', 'equals the expected checkpoint ref (typed)'), 'index_row_locator_join', index_row_checkpoint_ref),
    ])
    context = None

    def check(complete):
        table.require('index_row_source_schema_id', complete, context)
        table.require('index_row_source_schema_version', complete, context)
        table.require('index_row_projector_replay_only', complete, context)
        table.require('index_row_key', complete, context)
        table.require('index_row_checkpoint_ref', complete, context)
        return True
    return g.Case(table, check, context)

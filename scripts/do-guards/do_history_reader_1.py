"""DO guard suite `history_reader_1` (sweep part 2A). Historical read: reader, admission and original-source facts (after the checkpoint rows).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def historical_reader_event_type(value, context):
    return 'historical_reader_identity' if value['state']['event_type'] != value['family'] else None


def historical_reader_id(value, context):
    return 'historical_reader_identity' if value['state']['reader_id'] != value['expected_reader_id'] else None


def historical_reader_not_withdrawn(value, context):
    return 'historical_reader_withdrawn' if value['state']['reader_status'] == 'withdrawn' else None


def historical_reader_published(value, context):
    return 'historical_reader_withdrawn' if value['state']['publication_state'] != 'published' else None


def historical_schema_supported(value, context):
    return ('historical_schema_unsupported' if value['state']['supported_payload_schema'] != value['event_payload_schema_id']
            else None)


ROWS = (
    ('historical_reader_event_type', '/historical_reader_state/event_type', "equals the case's family",
     'historical_reader_identity', historical_reader_event_type, ('state', 'family'), 'reader_identity'),
    ('historical_reader_id', '/historical_reader_state/reader_id', 'equals reader.orchestrator.{family}.history.v1@1.0.0',
     'historical_reader_identity', historical_reader_id, ('state', 'expected_reader_id'), 'reader_identity'),
    ('historical_reader_not_withdrawn', '/historical_reader_state/reader_status', "is not 'withdrawn'",
     'historical_reader_withdrawn', historical_reader_not_withdrawn, ('state',), 'reader_withdrawn'),
    ('historical_reader_published', '/historical_reader_state/publication_state', "is 'published'",
     'historical_reader_withdrawn', historical_reader_published, ('state',), 'reader_withdrawn'),
    ('historical_schema_supported', '/historical_reader_state/supported_payload_schema', "equals the event's payload_schema_id",
     'historical_schema_unsupported', historical_schema_supported, ('state', 'event_payload_schema_id'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('historical_reader_event_type', g.Invariant('/historical_reader_state/event_type', "equals the case's family"), 'historical_reader_identity', historical_reader_event_type),
        g.Guard('historical_reader_id', g.Invariant('/historical_reader_state/reader_id', 'equals reader.orchestrator.{family}.history.v1@1.0.0'), 'historical_reader_identity', historical_reader_id),
        g.Guard('historical_reader_not_withdrawn', g.Invariant('/historical_reader_state/reader_status', "is not 'withdrawn'"), 'historical_reader_withdrawn', historical_reader_not_withdrawn),
        g.Guard('historical_reader_published', g.Invariant('/historical_reader_state/publication_state', "is 'published'"), 'historical_reader_withdrawn', historical_reader_published),
        g.Guard('historical_schema_supported', g.Invariant('/historical_reader_state/supported_payload_schema', "equals the event's payload_schema_id"), 'historical_schema_unsupported', historical_schema_supported),
    ])
    context = None

    def check(complete):
        table.require('historical_reader_event_type', complete, context)
        table.require('historical_reader_id', complete, context)
        table.require('historical_reader_not_withdrawn', complete, context)
        table.require('historical_reader_published', complete, context)
        table.require('historical_schema_supported', complete, context)
        return True
    return g.Case(table, check, context)

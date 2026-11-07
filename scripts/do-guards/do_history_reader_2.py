"""DO guard suite `history_reader_2` (sweep part 2A). Historical read: reader, admission and original-source facts (after the checkpoint rows).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def admission_written(value, context):
    return 'historical_original_admission' if not value['state']['original_admission']['admitted_when_written'] else None


def admission_event_type(value, context):
    return ('historical_original_admission' if value['state']['original_admission']['event_type'] != value['expected_admission']['event_type']
            else None)


def admission_family_revision(value, context):
    return ('historical_original_admission'
            if value['state']['original_admission']['family_revision'] != value['expected_admission']['family_revision'] else None)


def admission_payload_schema_id(value, context):
    return ('historical_original_admission'
            if value['state']['original_admission']['payload_schema_id'] != value['expected_admission']['payload_schema_id'] else None)


def admission_event_id(value, context):
    return ('historical_original_admission' if value['state']['original_admission']['event_id'] != value['expected_admission']['event_id']
            else None)


ROWS = (
    ('admission_written', '/historical_reader_state/original_admission/admitted_when_written', 'is true',
     'historical_original_admission', admission_written, ('state',), 'admission'),
    ('admission_event_type', '/historical_reader_state/original_admission/event_type', "equals the case's family",
     'historical_original_admission', admission_event_type, ('state', 'expected_admission'), 'admission'),
    ('admission_family_revision', '/historical_reader_state/original_admission/family_revision', "equals the payload's schema_version",
     'historical_original_admission', admission_family_revision, ('state', 'expected_admission'), 'admission'),
    ('admission_payload_schema_id', '/historical_reader_state/original_admission/payload_schema_id', "equals the event's payload_schema_id",
     'historical_original_admission', admission_payload_schema_id, ('state', 'expected_admission'), 'admission'),
    ('admission_event_id', '/historical_reader_state/original_admission/event_id', "equals the event's id",
     'historical_original_admission', admission_event_id, ('state', 'expected_admission'), 'admission'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('admission_written', g.Invariant('/historical_reader_state/original_admission/admitted_when_written', 'is true'), 'historical_original_admission', admission_written),
        g.Guard('admission_event_type', g.Invariant('/historical_reader_state/original_admission/event_type', "equals the case's family"), 'historical_original_admission', admission_event_type),
        g.Guard('admission_family_revision', g.Invariant('/historical_reader_state/original_admission/family_revision', "equals the payload's schema_version"), 'historical_original_admission', admission_family_revision),
        g.Guard('admission_payload_schema_id', g.Invariant('/historical_reader_state/original_admission/payload_schema_id', "equals the event's payload_schema_id"), 'historical_original_admission', admission_payload_schema_id),
        g.Guard('admission_event_id', g.Invariant('/historical_reader_state/original_admission/event_id', "equals the event's id"), 'historical_original_admission', admission_event_id),
    ])
    context = None

    def check(complete):
        table.require('admission_written', complete, context)
        table.require('admission_event_type', complete, context)
        table.require('admission_family_revision', complete, context)
        table.require('admission_payload_schema_id', complete, context)
        table.require('admission_event_id', complete, context)
        return True
    return g.Case(table, check, context)

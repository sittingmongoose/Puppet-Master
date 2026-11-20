"""DO guard suite `append_join_4` (sweep part 2A). Append: the envelope joins to the payload and the recomputed identity.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def event_join_project_id(value, context):
    if value['payload_schema_valid'] is not True:
        return None
    return 'event_join_project_id' if value['event'].get('project_id') != value['expected_event']['project_id'] else None


def event_join_thread_id(value, context):
    if value['payload_schema_valid'] is not True:
        return None
    return 'event_join_thread_id' if value['event'].get('thread_id') != value['expected_event']['thread_id'] else None


def event_join_run_id(value, context):
    if value['payload_schema_valid'] is not True:
        return None
    return 'event_join_run_id' if value['event'].get('run_id') != value['expected_event']['run_id'] else None


def event_join_occurred_at_utc(value, context):
    if value['payload_schema_valid'] is not True:
        return None
    return ('event_join_occurred_at_utc' if value['event'].get('occurred_at_utc') != value['expected_event']['occurred_at_utc']
            else None)


def event_join_payload_schema_id(value, context):
    if value['payload_schema_valid'] is not True:
        return None
    return ('event_join_payload_schema_id' if value['event'].get('payload_schema_id') != value['expected_event']['payload_schema_id']
            else None)


ROWS = (
    ('event_join_project_id', '/event/project_id', "equals the payload's project_id (or null)",
     'event_join_project_id', event_join_project_id, ('event', 'expected_event', 'payload_schema_valid'), None),
    ('event_join_thread_id', '/event/thread_id', "equals the payload's thread_id",
     'event_join_thread_id', event_join_thread_id, ('event', 'expected_event', 'payload_schema_valid'), None),
    ('event_join_run_id', '/event/run_id', "equals the payload's run_id",
     'event_join_run_id', event_join_run_id, ('event', 'expected_event', 'payload_schema_valid'), None),
    ('event_join_occurred_at_utc', '/event/occurred_at_utc', "equals the payload's occurred_at_utc",
     'event_join_occurred_at_utc', event_join_occurred_at_utc, ('event', 'expected_event', 'payload_schema_valid'), None),
    ('event_join_payload_schema_id', '/event/payload_schema_id', 'names exactly this family member and version',
     'event_join_payload_schema_id', event_join_payload_schema_id, ('event', 'expected_event', 'payload_schema_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('event_join_project_id', g.Invariant('/event/project_id', "equals the payload's project_id (or null)"), 'event_join_project_id', event_join_project_id),
        g.Guard('event_join_thread_id', g.Invariant('/event/thread_id', "equals the payload's thread_id"), 'event_join_thread_id', event_join_thread_id),
        g.Guard('event_join_run_id', g.Invariant('/event/run_id', "equals the payload's run_id"), 'event_join_run_id', event_join_run_id),
        g.Guard('event_join_occurred_at_utc', g.Invariant('/event/occurred_at_utc', "equals the payload's occurred_at_utc"), 'event_join_occurred_at_utc', event_join_occurred_at_utc),
        g.Guard('event_join_payload_schema_id', g.Invariant('/event/payload_schema_id', 'names exactly this family member and version'), 'event_join_payload_schema_id', event_join_payload_schema_id),
    ])
    context = None

    def check(complete):
        table.require('event_join_project_id', complete, context)
        table.require('event_join_thread_id', complete, context)
        table.require('event_join_run_id', complete, context)
        table.require('event_join_occurred_at_utc', complete, context)
        table.require('event_join_payload_schema_id', complete, context)
        return True
    return g.Case(table, check, context)

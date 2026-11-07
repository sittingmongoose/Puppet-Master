"""DO guard suite `append_join_3` (sweep part 2A). Append: the envelope joins to the payload and the recomputed identity.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def event_join_thread_id(value, context):
    return 'event_join_thread_id' if value['event'].get('thread_id') != value['expected_event']['thread_id'] else None


def event_join_run_id(value, context):
    return 'event_join_run_id' if value['event'].get('run_id') != value['expected_event']['run_id'] else None


def event_join_occurred_at_utc(value, context):
    return ('event_join_occurred_at_utc' if value['event'].get('occurred_at_utc') != value['expected_event']['occurred_at_utc']
            else None)


def event_join_payload_schema_id(value, context):
    return ('event_join_payload_schema_id' if value['event'].get('payload_schema_id') != value['expected_event']['payload_schema_id']
            else None)


def event_scope_partition(value, context):
    return 'scope_partition' if value['scope_partition'] != value['expected_scope_partition'] else None


ROWS = (
    ('event_join_thread_id', '/event/thread_id', "equals the payload's thread_id",
     'event_join_thread_id', event_join_thread_id, ('event', 'expected_event'), None),
    ('event_join_run_id', '/event/run_id', "equals the payload's run_id",
     'event_join_run_id', event_join_run_id, ('event', 'expected_event'), None),
    ('event_join_occurred_at_utc', '/event/occurred_at_utc', "equals the payload's occurred_at_utc",
     'event_join_occurred_at_utc', event_join_occurred_at_utc, ('event', 'expected_event'), None),
    ('event_join_payload_schema_id', '/event/payload_schema_id', 'names exactly this family member and version',
     'event_join_payload_schema_id', event_join_payload_schema_id, ('event', 'expected_event'), None),
    ('event_scope_partition', '/scope_partition', 'equals the partition recomputed from the payload scope',
     'scope_partition', event_scope_partition, ('scope_partition', 'expected_scope_partition'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('event_join_thread_id', g.Invariant('/event/thread_id', "equals the payload's thread_id"), 'event_join_thread_id', event_join_thread_id),
        g.Guard('event_join_run_id', g.Invariant('/event/run_id', "equals the payload's run_id"), 'event_join_run_id', event_join_run_id),
        g.Guard('event_join_occurred_at_utc', g.Invariant('/event/occurred_at_utc', "equals the payload's occurred_at_utc"), 'event_join_occurred_at_utc', event_join_occurred_at_utc),
        g.Guard('event_join_payload_schema_id', g.Invariant('/event/payload_schema_id', 'names exactly this family member and version'), 'event_join_payload_schema_id', event_join_payload_schema_id),
        g.Guard('event_scope_partition', g.Invariant('/scope_partition', 'equals the partition recomputed from the payload scope'), 'scope_partition', event_scope_partition),
    ])
    context = None

    def check(complete):
        table.require('event_join_thread_id', complete, context)
        table.require('event_join_run_id', complete, context)
        table.require('event_join_occurred_at_utc', complete, context)
        table.require('event_join_payload_schema_id', complete, context)
        table.require('event_scope_partition', complete, context)
        return True
    return g.Case(table, check, context)

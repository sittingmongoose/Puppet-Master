"""DR guard table decode_joins: Full-envelope decode: dispatch, storage route, provider source and joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('payload_project_id', 'event_project_id', 'event_run_id', 'payload_run_id', 'event_attempt_id', 'payload_attempt_id', 'event_thread_id', 'payload_thread_id', 'event_node_id', 'payload_node_id', 'event_occurred_at_utc', 'payload_created_at_utc', 'payload_actor_present', 'payload_actor_ref', 'event_actor_ref')


def D13_project(value, context):
    return 'Project join' if value['payload_project_id'] != value['event_project_id'] else None


def D14_run(value, context):
    return 'run_id join' if value['event_run_id'] != value['payload_run_id'] else None


def D14_attempt(value, context):
    return 'attempt_id join' if value['event_attempt_id'] != value['payload_attempt_id'] else None


def D14_thread(value, context):
    return 'thread_id join' if value['event_thread_id'] != value['payload_thread_id'] else None


def D14_node(value, context):
    return 'node_id join' if value['event_node_id'] != value['payload_node_id'] else None


def D15_authored_time(value, context):
    return 'authored time join' if value['event_occurred_at_utc'] != value['payload_created_at_utc'] else None


def D16_actor(value, context):
    return 'actor join' if value['payload_actor_present'] is True and value['payload_actor_ref'] != value['event_actor_ref'] else None


def joins_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('D13_project', g.Invariant('/payload_project_id', 'equals the event project_id'), 'Project join', D13_project),
        g.Guard('D14_run', g.Invariant('/payload_run_id', 'equals the event run_id'), 'run_id join', D14_run),
        g.Guard('D14_attempt', g.Invariant('/payload_attempt_id', 'equals the event attempt_id'), 'attempt_id join', D14_attempt),
        g.Guard('D14_thread', g.Invariant('/payload_thread_id', 'equals the event thread_id'), 'thread_id join', D14_thread),
        g.Guard('D14_node', g.Invariant('/payload_node_id', 'equals the event node_id'), 'node_id join', D14_node),
        g.Guard('D15_authored_time', g.Invariant('/payload_created_at_utc', 'equals the event occurred_at_utc'), 'authored time join', D15_authored_time),
        g.Guard('D16_actor', g.Invariant('/payload_actor_ref', 'a present payload actor_ref equals the event actor_ref'), 'actor join', D16_actor),
    ])

    def check(value):
        table.require('D13_project', value, context)
        table.require('D14_run', value, context)
        table.require('D14_attempt', value, context)
        table.require('D14_thread', value, context)
        table.require('D14_node', value, context)
        table.require('D15_authored_time', value, context)
        table.require('D16_actor', value, context)
        return True
    return g.Case(table, check, context)

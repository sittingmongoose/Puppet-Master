"""DO guard suite `append_shape_1` (sweep part 2A). Append: the EventRecord, replay policy and closed payload (event_errors stops after the payload schema).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def event_record_schema(value, context):
    return 'event_schema' if value['event_schema_valid'] is not True else None


def event_storage_sequence(value, context):
    return 'event_schema' if value['storage_sequence_valid'] is not True else None


def replay_only_not_appendable(value, context):
    policy = value['event'].get('replay_policy')
    if value['historical'] is True:
        return None
    return 'replay_only_not_appendable' if type(policy) is str and policy == 'projector_replay_only' else None


def family_current_replay_policy(value, context):
    policy = value['event'].get('replay_policy')
    if policy == 'projector_replay_only' or policy == 'dedupe_by_idempotency_key':
        return None
    return 'family_current_replay_policy'


def logical_payload_schema(value, context):
    return 'logical_payload_schema' if value['payload_schema_valid'] is not True else None


ROWS = (
    ('event_record_schema', '/event', 'validates against the EventRecord schema',
     'event_schema', event_record_schema, ('event_schema_valid',), 'event_schema'),
    ('event_storage_sequence', '/event/sequence_id', "is Storage's exact uint64 (storage_uint64)",
     'event_schema', event_storage_sequence, ('storage_sequence_valid',), 'event_schema'),
    ('replay_only_not_appendable', '/event/replay_policy', 'is not projector_replay_only on a current append',
     'replay_only_not_appendable', replay_only_not_appendable, ('event', 'historical'), None),
    ('family_current_replay_policy', '/event/replay_policy', 'is dedupe_by_idempotency_key (or, retained, projector_replay_only)',
     'family_current_replay_policy', family_current_replay_policy, ('event',), None),
    ('logical_payload_schema', '/logical_payload', "validates against the family's closed payload schema",
     'logical_payload_schema', logical_payload_schema, ('payload_schema_valid',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('event_record_schema', g.Invariant('/event', 'validates against the EventRecord schema'), 'event_schema', event_record_schema),
        g.Guard('event_storage_sequence', g.Invariant('/event/sequence_id', "is Storage's exact uint64 (storage_uint64)"), 'event_schema', event_storage_sequence),
        g.Guard('replay_only_not_appendable', g.Invariant('/event/replay_policy', 'is not projector_replay_only on a current append'), 'replay_only_not_appendable', replay_only_not_appendable),
        g.Guard('family_current_replay_policy', g.Invariant('/event/replay_policy', 'is dedupe_by_idempotency_key (or, retained, projector_replay_only)'), 'family_current_replay_policy', family_current_replay_policy),
        g.Guard('logical_payload_schema', g.Invariant('/logical_payload', "validates against the family's closed payload schema"), 'logical_payload_schema', logical_payload_schema),
    ])
    context = None

    def check(complete):
        table.require('event_record_schema', complete, context)
        table.require('event_storage_sequence', complete, context)
        table.require('replay_only_not_appendable', complete, context)
        table.require('family_current_replay_policy', complete, context)
        table.require('logical_payload_schema', complete, context)
        return True
    return g.Case(table, check, context)

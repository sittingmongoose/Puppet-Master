"""DO guard suite `board_join_3` (sweep part 2A). Board join: family member, envelope, replay policy, identity and terminal run anchor (DO-P1F-03 among them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def board_current_replay_policy(value, context):
    policy = value['envelope'].get('replay_policy')
    if policy == 'projector_replay_only' or policy == 'dedupe_by_idempotency_key':
        return None
    return 'family_current_replay_policy'


def board_identity_key(value, context):
    return 'identity' if value['envelope'].get('idempotency_key') != value['expected_idempotency_key'] else None


def board_identity_event_id(value, context):
    return 'identity' if value['envelope'].get('event_id') != value['expected_event_id'] else None


def run_anchor_scope(value, context):
    terminal = value['terminal_run']
    if terminal is None:
        return None
    return 'run_anchor_scope' if terminal.get('scope') != value['payload'].get('scope') else None


def run_anchor_storage_instance_id(value, context):
    terminal = value['terminal_run']
    if terminal is None:
        return None
    return ('run_anchor_storage_instance_id' if terminal.get('storage_instance_id') != value['payload'].get('storage_instance_id')
            else None)


ROWS = (
    ('board_current_replay_policy', '/envelope/replay_policy', 'is dedupe_by_idempotency_key',
     'family_current_replay_policy', board_current_replay_policy, ('envelope',), None),
    ('board_identity_key', '/envelope/idempotency_key', 'equals the key recomputed from the payload',
     'identity', board_identity_key, ('envelope', 'expected_idempotency_key'), 'identity'),
    ('board_identity_event_id', '/envelope/event_id', 'equals the id recomputed from the payload',
     'identity', board_identity_event_id, ('envelope', 'expected_event_id'), 'identity'),
    ('run_anchor_scope', '/terminal_run/scope', "equals the payload's",
     'run_anchor_scope', run_anchor_scope, ('terminal_run', 'payload'), None),
    ('run_anchor_storage_instance_id', '/terminal_run/storage_instance_id', "equals the payload's",
     'run_anchor_storage_instance_id', run_anchor_storage_instance_id, ('terminal_run', 'payload'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('board_current_replay_policy', g.Invariant('/envelope/replay_policy', 'is dedupe_by_idempotency_key'), 'family_current_replay_policy', board_current_replay_policy),
        g.Guard('board_identity_key', g.Invariant('/envelope/idempotency_key', 'equals the key recomputed from the payload'), 'identity', board_identity_key),
        g.Guard('board_identity_event_id', g.Invariant('/envelope/event_id', 'equals the id recomputed from the payload'), 'identity', board_identity_event_id),
        g.Guard('run_anchor_scope', g.Invariant('/terminal_run/scope', "equals the payload's"), 'run_anchor_scope', run_anchor_scope),
        g.Guard('run_anchor_storage_instance_id', g.Invariant('/terminal_run/storage_instance_id', "equals the payload's"), 'run_anchor_storage_instance_id', run_anchor_storage_instance_id),
    ])
    context = None

    def check(complete):
        table.require('board_current_replay_policy', complete, context)
        table.require('board_identity_key', complete, context)
        table.require('board_identity_event_id', complete, context)
        table.require('run_anchor_scope', complete, context)
        table.require('run_anchor_storage_instance_id', complete, context)
        return True
    return g.Case(table, check, context)

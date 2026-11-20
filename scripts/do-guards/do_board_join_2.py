"""DO guard suite `board_join_2` (sweep part 2A). Board join: family member, envelope, replay policy, identity and terminal run anchor (DO-P1F-03 among them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def board_envelope_run_id(value, context):
    return 'envelope_run_id' if value['envelope'].get('run_id') != value['payload'].get('run_id') else None


def board_envelope_thread_id(value, context):
    return 'envelope_thread_id' if value['envelope'].get('thread_id') != value['payload'].get('thread_id') else None


def board_envelope_occurred_at_utc(value, context):
    return ('envelope_occurred_at_utc' if value['envelope'].get('occurred_at_utc') != value['payload'].get('occurred_at_utc')
            else None)


def board_envelope_project_id(value, context):
    return 'envelope_project_id' if value['envelope'].get('project_id') != value['payload'].get('project_id') else None


def board_replay_only(value, context):
    return 'replay_only_not_appendable' if value['envelope'].get('replay_policy') == 'projector_replay_only' else None


ROWS = (
    ('board_envelope_run_id', '/envelope/run_id', "equals the payload's",
     'envelope_run_id', board_envelope_run_id, ('envelope', 'payload'), None),
    ('board_envelope_thread_id', '/envelope/thread_id', "equals the payload's",
     'envelope_thread_id', board_envelope_thread_id, ('envelope', 'payload'), None),
    ('board_envelope_occurred_at_utc', '/envelope/occurred_at_utc', "equals the payload's",
     'envelope_occurred_at_utc', board_envelope_occurred_at_utc, ('envelope', 'payload'), None),
    ('board_envelope_project_id', '/envelope/project_id', "equals the payload's (or both absent)",
     'envelope_project_id', board_envelope_project_id, ('envelope', 'payload'), None),
    ('board_replay_only', '/envelope/replay_policy', 'is not projector_replay_only',
     'replay_only_not_appendable', board_replay_only, ('envelope',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('board_envelope_run_id', g.Invariant('/envelope/run_id', "equals the payload's"), 'envelope_run_id', board_envelope_run_id),
        g.Guard('board_envelope_thread_id', g.Invariant('/envelope/thread_id', "equals the payload's"), 'envelope_thread_id', board_envelope_thread_id),
        g.Guard('board_envelope_occurred_at_utc', g.Invariant('/envelope/occurred_at_utc', "equals the payload's"), 'envelope_occurred_at_utc', board_envelope_occurred_at_utc),
        g.Guard('board_envelope_project_id', g.Invariant('/envelope/project_id', "equals the payload's (or both absent)"), 'envelope_project_id', board_envelope_project_id),
        g.Guard('board_replay_only', g.Invariant('/envelope/replay_policy', 'is not projector_replay_only'), 'replay_only_not_appendable', board_replay_only),
    ])
    context = None

    def check(complete):
        table.require('board_envelope_run_id', complete, context)
        table.require('board_envelope_thread_id', complete, context)
        table.require('board_envelope_occurred_at_utc', complete, context)
        table.require('board_envelope_project_id', complete, context)
        table.require('board_replay_only', complete, context)
        return True
    return g.Case(table, check, context)

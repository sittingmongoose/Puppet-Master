"""DO guard suite `board_join_4` (sweep part 2A). Board join: family member, envelope, replay policy, identity and terminal run anchor (DO-P1F-03 among them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def run_anchor_server_id(value, context):
    terminal = value['terminal_run']
    if terminal is None:
        return None
    return 'run_anchor_server_id' if terminal.get('server_id') != value['payload'].get('server_id') else None


def run_anchor_thread_id(value, context):
    terminal = value['terminal_run']
    if terminal is None:
        return None
    return 'run_anchor_thread_id' if terminal.get('thread_id') != value['payload'].get('thread_id') else None


def run_anchor_crew_id(value, context):
    terminal = value['terminal_run']
    if terminal is None:
        return None
    return 'run_anchor_crew_id' if terminal.get('crew_id') != value['payload'].get('crew_id') else None


def run_anchor_run_id(value, context):
    terminal = value['terminal_run']
    if terminal is None:
        return None
    return 'run_anchor_run_id' if terminal.get('run_id') != value['payload'].get('run_id') else None


def run_anchor_project_id(value, context):
    terminal = value['terminal_run']
    if terminal is None:
        return None
    return 'run_anchor_project_id' if terminal.get('project_id') != value['payload'].get('project_id') else None


ROWS = (
    ('run_anchor_server_id', '/terminal_run/server_id', "equals the payload's",
     'run_anchor_server_id', run_anchor_server_id, ('terminal_run', 'payload'), None),
    ('run_anchor_thread_id', '/terminal_run/thread_id', "equals the payload's",
     'run_anchor_thread_id', run_anchor_thread_id, ('terminal_run', 'payload'), None),
    ('run_anchor_crew_id', '/terminal_run/crew_id', "equals the payload's",
     'run_anchor_crew_id', run_anchor_crew_id, ('terminal_run', 'payload'), None),
    ('run_anchor_run_id', '/terminal_run/run_id', "equals the payload's",
     'run_anchor_run_id', run_anchor_run_id, ('terminal_run', 'payload'), None),
    ('run_anchor_project_id', '/terminal_run/project_id', "equals the payload's",
     'run_anchor_project_id', run_anchor_project_id, ('terminal_run', 'payload'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('run_anchor_server_id', g.Invariant('/terminal_run/server_id', "equals the payload's"), 'run_anchor_server_id', run_anchor_server_id),
        g.Guard('run_anchor_thread_id', g.Invariant('/terminal_run/thread_id', "equals the payload's"), 'run_anchor_thread_id', run_anchor_thread_id),
        g.Guard('run_anchor_crew_id', g.Invariant('/terminal_run/crew_id', "equals the payload's"), 'run_anchor_crew_id', run_anchor_crew_id),
        g.Guard('run_anchor_run_id', g.Invariant('/terminal_run/run_id', "equals the payload's"), 'run_anchor_run_id', run_anchor_run_id),
        g.Guard('run_anchor_project_id', g.Invariant('/terminal_run/project_id', "equals the payload's"), 'run_anchor_project_id', run_anchor_project_id),
    ])
    context = None

    def check(complete):
        table.require('run_anchor_server_id', complete, context)
        table.require('run_anchor_thread_id', complete, context)
        table.require('run_anchor_crew_id', complete, context)
        table.require('run_anchor_run_id', complete, context)
        table.require('run_anchor_project_id', complete, context)
        return True
    return g.Case(table, check, context)

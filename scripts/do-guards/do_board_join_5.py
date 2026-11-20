"""DO guard suite `board_join_5` (sweep part 2A). Board join: family member, envelope, replay policy, identity and terminal run anchor (DO-P1F-03 among them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def run_anchor_kind(value, context):
    terminal = value['terminal_run']
    if terminal is None:
        return None
    return 'run_anchor_kind' if terminal.get('kind') != 'first_durable_terminal_canonical_run' else None


ROWS = (
    ('run_anchor_kind', '/terminal_run/kind', "is 'first_durable_terminal_canonical_run'",
     'run_anchor_kind', run_anchor_kind, ('terminal_run',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('run_anchor_kind', g.Invariant('/terminal_run/kind', "is 'first_durable_terminal_canonical_run'"), 'run_anchor_kind', run_anchor_kind),
    ])
    context = None

    def check(complete):
        table.require('run_anchor_kind', complete, context)
        return True
    return g.Case(table, check, context)

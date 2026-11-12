"""DO guard suite `checkpoint_current_1` (sweep part 2A). Checkpoint read: the current generation (checkpoint_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def current_generation_present(value, context):
    return 'checkpoint_not_current' if value['current_generation_id'] not in value['generation_states'] else None


def current_generation_state(value, context):
    states = value['generation_states']
    key = value['current_generation_id']
    if key not in states:
        return None
    return 'checkpoint_not_current' if states[key] != 'current' else None


def at_most_one_current_generation(value, context):
    current = [key for key, state in value['generation_states'].items() if state == 'current']
    return 'checkpoint_not_current' if len(current) > 1 else None


ROWS = (
    ('current_generation_present', '/read/checkpoint/current_generation_id', 'names a generation of the checkpoint',
     'checkpoint_not_current', current_generation_present, ('current_generation_id', 'generation_states'), 'not_current'),
    ('current_generation_state', '/read/checkpoint/generations/*/state', "of the named generation is 'current'",
     'checkpoint_not_current', current_generation_state, ('current_generation_id', 'generation_states'), 'not_current'),
    ('at_most_one_current_generation', '/read/checkpoint/generations/*/state', "is 'current' on at most one generation",
     'checkpoint_not_current', at_most_one_current_generation, ('generation_states',), 'not_current'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('current_generation_present', g.Invariant('/read/checkpoint/current_generation_id', 'names a generation of the checkpoint'), 'checkpoint_not_current', current_generation_present),
        g.Guard('current_generation_state', g.Invariant('/read/checkpoint/generations/*/state', "of the named generation is 'current'"), 'checkpoint_not_current', current_generation_state),
        g.Guard('at_most_one_current_generation', g.Invariant('/read/checkpoint/generations/*/state', "is 'current' on at most one generation"), 'checkpoint_not_current', at_most_one_current_generation),
    ])
    context = None

    def check(complete):
        table.require('current_generation_present', complete, context)
        table.require('current_generation_state', complete, context)
        table.require('at_most_one_current_generation', complete, context)
        return True
    return g.Case(table, check, context)

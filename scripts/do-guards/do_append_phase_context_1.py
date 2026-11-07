"""DO guard suite `append_phase_context_1` (sweep part 2A). Append: phase.force_completed producer context types (predicate_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def phase_context_object(value, context):
    if value['family'] != 'phase.force_completed':
        return None
    return 'phase_context_type' if type(value['producer_context']) is not dict else None


def phase_context_max_questions(value, context):
    producer = value['producer_context']
    if value['family'] != 'phase.force_completed' or type(producer) is not dict:
        return None
    count = producer.get('max_questions')
    integral = type(count) is int or (type(count) is float and count % 1 == 0)
    return 'phase_context_type' if not integral else None


def phase_context_completion_signal(value, context):
    producer = value['producer_context']
    if value['family'] != 'phase.force_completed' or type(producer) is not dict:
        return None
    return 'phase_context_type' if type(producer.get('completion_signal')) is not bool else None


def phase_context_phase_state(value, context):
    producer = value['producer_context']
    if value['family'] != 'phase.force_completed' or type(producer) is not dict:
        return None
    return 'phase_context_type' if type(producer.get('phase_state')) is not str else None


ROWS = (
    ('phase_context_object', '/producer_context', 'is an object (phase.force_completed)',
     'phase_context_type', phase_context_object, ('family', 'producer_context'), 'phase_context_type'),
    ('phase_context_max_questions', '/producer_context/max_questions', 'is a JSON integer (phase.force_completed)',
     'phase_context_type', phase_context_max_questions, ('family', 'producer_context'), 'phase_context_type'),
    ('phase_context_completion_signal', '/producer_context/completion_signal', 'is a boolean (phase.force_completed)',
     'phase_context_type', phase_context_completion_signal, ('family', 'producer_context'), 'phase_context_type'),
    ('phase_context_phase_state', '/producer_context/phase_state', 'is a string (phase.force_completed)',
     'phase_context_type', phase_context_phase_state, ('family', 'producer_context'), 'phase_context_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('phase_context_object', g.Invariant('/producer_context', 'is an object (phase.force_completed)'), 'phase_context_type', phase_context_object),
        g.Guard('phase_context_max_questions', g.Invariant('/producer_context/max_questions', 'is a JSON integer (phase.force_completed)'), 'phase_context_type', phase_context_max_questions),
        g.Guard('phase_context_completion_signal', g.Invariant('/producer_context/completion_signal', 'is a boolean (phase.force_completed)'), 'phase_context_type', phase_context_completion_signal),
        g.Guard('phase_context_phase_state', g.Invariant('/producer_context/phase_state', 'is a string (phase.force_completed)'), 'phase_context_type', phase_context_phase_state),
    ])
    context = None

    def check(complete):
        table.require('phase_context_object', complete, context)
        table.require('phase_context_max_questions', complete, context)
        table.require('phase_context_completion_signal', complete, context)
        table.require('phase_context_phase_state', complete, context)
        return True
    return g.Case(table, check, context)

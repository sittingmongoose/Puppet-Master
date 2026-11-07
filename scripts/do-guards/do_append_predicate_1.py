"""DO guard suite `append_predicate_1` (sweep part 2A). Append: the family producer predicates (OSI-685, OSI-695, OSI-699).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def phase_force_state_active(value, context):
    producer = value['producer_context']
    if value['family'] != 'phase.force_completed' or type(producer) is not dict or type(producer.get('phase_state')) is not str:
        return None
    return 'phase_force_predicate' if producer['phase_state'] != 'active' else None


def phase_force_completion_signal(value, context):
    producer = value['producer_context']
    if value['family'] != 'phase.force_completed' or type(producer) is not dict or type(producer.get('completion_signal')) is not bool:
        return None
    return 'phase_force_predicate' if producer['completion_signal'] is not False else None


def phase_force_question_count(value, context):
    if value['family'] != 'phase.force_completed':
        return None
    payload = value['payload']
    return 'phase_force_predicate' if payload['question_count'] <= payload['max_questions'] + 1 else None


def phase_force_max_questions(value, context):
    producer = value['producer_context']
    if value['family'] != 'phase.force_completed' or type(producer) is not dict:
        return None
    count = producer.get('max_questions')
    if not (type(count) is int or (type(count) is float and count % 1 == 0)):
        return None
    return 'phase_force_predicate' if count != value['payload']['max_questions'] else None


def truncation_grows_output(value, context):
    if value['family'] != 'subagent.output_truncated':
        return None
    payload = value['payload']
    return 'truncation_grows_output' if payload['original_length'] < payload['truncated_length'] else None


ROWS = (
    ('phase_force_state_active', '/producer_context/phase_state', "is 'active' (phase.force_completed)",
     'phase_force_predicate', phase_force_state_active, ('family', 'producer_context'), 'phase_force'),
    ('phase_force_completion_signal', '/producer_context/completion_signal', 'is false (phase.force_completed)',
     'phase_force_predicate', phase_force_completion_signal, ('family', 'producer_context'), 'phase_force'),
    ('phase_force_question_count', '/logical_payload/question_count', 'exceeds max_questions + 1 (phase.force_completed)',
     'phase_force_predicate', phase_force_question_count, ('family', 'payload'), 'phase_force'),
    ('phase_force_max_questions', '/producer_context/max_questions', "equals the payload's max_questions (phase.force_completed)",
     'phase_force_predicate', phase_force_max_questions, ('family', 'producer_context', 'payload'), 'phase_force'),
    ('truncation_grows_output', '/logical_payload/truncated_length', 'is at most original_length (subagent.output_truncated)',
     'truncation_grows_output', truncation_grows_output, ('family', 'payload'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('phase_force_state_active', g.Invariant('/producer_context/phase_state', "is 'active' (phase.force_completed)"), 'phase_force_predicate', phase_force_state_active),
        g.Guard('phase_force_completion_signal', g.Invariant('/producer_context/completion_signal', 'is false (phase.force_completed)'), 'phase_force_predicate', phase_force_completion_signal),
        g.Guard('phase_force_question_count', g.Invariant('/logical_payload/question_count', 'exceeds max_questions + 1 (phase.force_completed)'), 'phase_force_predicate', phase_force_question_count),
        g.Guard('phase_force_max_questions', g.Invariant('/producer_context/max_questions', "equals the payload's max_questions (phase.force_completed)"), 'phase_force_predicate', phase_force_max_questions),
        g.Guard('truncation_grows_output', g.Invariant('/logical_payload/truncated_length', 'is at most original_length (subagent.output_truncated)'), 'truncation_grows_output', truncation_grows_output),
    ])
    context = None

    def check(complete):
        table.require('phase_force_state_active', complete, context)
        table.require('phase_force_completion_signal', complete, context)
        table.require('phase_force_question_count', complete, context)
        table.require('phase_force_max_questions', complete, context)
        table.require('truncation_grows_output', complete, context)
        return True
    return g.Case(table, check, context)

"""DO guard suite `checkpoint_coverage_4` (sweep part 2A). Checkpoint read: the frontier coverage, sequence, segment, selection, gap, locator and generation copies (DO-P1F04/05/06).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def coverage_through_sequence_id(value, context):
    if value['coverage']['last_frame'] is None:
        return None
    left, right = value['coverage']['through_sequence_id'], value['event_sequence_id']
    return 'index_coverage_through_sequence_id' if type(left) is not type(right) or left != right else None


def coverage_retained_event_count(value, context):
    if value['coverage']['last_frame'] is None:
        return None
    count = value['coverage']['retained_event_count']
    return 'index_coverage_retained_event_count' if type(count) is not int or count != 1 else None


def coverage_frame_last_sequence_id(value, context):
    frame = value['coverage']['last_frame']
    if type(frame) is not dict:
        return None
    left, right = frame['last_sequence_id'], value['event_sequence_id']
    return 'index_coverage_frame_last_sequence_id' if type(left) is not type(right) or left != right else None


def coverage_segment_first_sequence_id(value, context):
    segments = value['coverage']['segments']
    if not segments:
        return None
    left, right = segments[0]['first_sequence_id'], value['event_sequence_id']
    return 'index_coverage_segment_first_sequence_id' if type(left) is not type(right) or left != right else None


def coverage_segment_last_sequence_id(value, context):
    segments = value['coverage']['segments']
    if not segments:
        return None
    left, right = segments[0]['last_sequence_id'], value['event_sequence_id']
    return 'index_coverage_segment_last_sequence_id' if type(left) is not type(right) or left != right else None


ROWS = (
    ('coverage_through_sequence_id', '/read/checkpoint/generations/*/frontier/coverage/through_sequence_id', "equals the event's sequence (typed)",
     'index_coverage_through_sequence_id', coverage_through_sequence_id, ('coverage', 'event_sequence_id'), None),
    ('coverage_retained_event_count', '/read/checkpoint/generations/*/frontier/coverage/retained_event_count', 'is exactly the integer 1',
     'index_coverage_retained_event_count', coverage_retained_event_count, ('coverage',), None),
    ('coverage_frame_last_sequence_id', '/read/checkpoint/generations/*/frontier/coverage/last_frame/last_sequence_id', "equals the event's sequence (typed)",
     'index_coverage_frame_last_sequence_id', coverage_frame_last_sequence_id, ('coverage', 'event_sequence_id'), None),
    ('coverage_segment_first_sequence_id', '/read/checkpoint/generations/*/frontier/coverage/segments/0/first_sequence_id', "equals the event's sequence (typed)",
     'index_coverage_segment_first_sequence_id', coverage_segment_first_sequence_id, ('coverage', 'event_sequence_id'), None),
    ('coverage_segment_last_sequence_id', '/read/checkpoint/generations/*/frontier/coverage/segments/0/last_sequence_id', "equals the event's sequence (typed)",
     'index_coverage_segment_last_sequence_id', coverage_segment_last_sequence_id, ('coverage', 'event_sequence_id'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('coverage_through_sequence_id', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/through_sequence_id', "equals the event's sequence (typed)"), 'index_coverage_through_sequence_id', coverage_through_sequence_id),
        g.Guard('coverage_retained_event_count', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/retained_event_count', 'is exactly the integer 1'), 'index_coverage_retained_event_count', coverage_retained_event_count),
        g.Guard('coverage_frame_last_sequence_id', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/last_frame/last_sequence_id', "equals the event's sequence (typed)"), 'index_coverage_frame_last_sequence_id', coverage_frame_last_sequence_id),
        g.Guard('coverage_segment_first_sequence_id', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/segments/0/first_sequence_id', "equals the event's sequence (typed)"), 'index_coverage_segment_first_sequence_id', coverage_segment_first_sequence_id),
        g.Guard('coverage_segment_last_sequence_id', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/segments/0/last_sequence_id', "equals the event's sequence (typed)"), 'index_coverage_segment_last_sequence_id', coverage_segment_last_sequence_id),
    ])
    context = None

    def check(complete):
        table.require('coverage_through_sequence_id', complete, context)
        table.require('coverage_retained_event_count', complete, context)
        table.require('coverage_frame_last_sequence_id', complete, context)
        table.require('coverage_segment_first_sequence_id', complete, context)
        table.require('coverage_segment_last_sequence_id', complete, context)
        return True
    return g.Case(table, check, context)

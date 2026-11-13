"""DO guard suite `checkpoint_coverage_5` (sweep part 2A). Checkpoint read: the frontier coverage, sequence, segment, selection, gap, locator and generation copies (DO-P1F04/05/06).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def coverage_segment_retained_event_count(value, context):
    segments = value['coverage']['segments']
    if not segments:
        return None
    count = segments[0]['retained_event_count']
    return 'index_coverage_segment_retained_event_count' if type(count) is not int or count != 1 else None


def segment_name_first_sequence(value, context):
    if value['coverage']['last_frame'] is None:
        return None
    groups = value['frame_segment_name_groups']
    if groups is None or groups[1] != value['event_sequence_digits']:
        return 'index_coverage_segment_name_first_sequence'
    return None


def segment_name_last_sequence(value, context):
    groups = value['frame_segment_name_groups']
    if groups is None or groups[2] is None:
        return None
    return 'index_coverage_segment_name_last_sequence' if groups[2] != value['event_sequence_digits'] else None


def anchor_first_retained_sequence_id(value, context):
    left, right = value['anchor']['first_retained_sequence_id'], value['event_sequence_id']
    return 'index_anchor_first_retained_sequence_id' if type(left) is not type(right) or left != right else None


def anchor_through_sequence_id(value, context):
    left, right = value['anchor']['through_sequence_id'], value['event_sequence_id']
    return 'index_anchor_through_sequence_id' if type(left) is not type(right) or left != right else None


ROWS = (
    ('coverage_segment_retained_event_count', '/read/checkpoint/generations/*/frontier/coverage/segments/0/retained_event_count', 'is exactly the integer 1',
     'index_coverage_segment_retained_event_count', coverage_segment_retained_event_count, ('coverage',), None),
    ('segment_name_first_sequence', '/read/checkpoint/generations/*/frontier/coverage/last_frame/segment_name', "first-sequence field is the event's sequence in 20 digits",
     'index_coverage_segment_name_first_sequence', segment_name_first_sequence, ('coverage', 'frame_segment_name_groups', 'event_sequence_digits'), None),
    ('segment_name_last_sequence', '/read/checkpoint/generations/*/frontier/coverage/last_frame/segment_name', "closed name's last-sequence field is the event's sequence",
     'index_coverage_segment_name_last_sequence', segment_name_last_sequence, ('frame_segment_name_groups', 'event_sequence_digits'), None),
    ('anchor_first_retained_sequence_id', '/read/checkpoint/generations/*/anchor/first_retained_sequence_id', "equals the event's sequence (typed)",
     'index_anchor_first_retained_sequence_id', anchor_first_retained_sequence_id, ('anchor', 'event_sequence_id'), None),
    ('anchor_through_sequence_id', '/read/checkpoint/generations/*/anchor/through_sequence_id', "equals the event's sequence (typed)",
     'index_anchor_through_sequence_id', anchor_through_sequence_id, ('anchor', 'event_sequence_id'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('coverage_segment_retained_event_count', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/segments/0/retained_event_count', 'is exactly the integer 1'), 'index_coverage_segment_retained_event_count', coverage_segment_retained_event_count),
        g.Guard('segment_name_first_sequence', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/last_frame/segment_name', "first-sequence field is the event's sequence in 20 digits"), 'index_coverage_segment_name_first_sequence', segment_name_first_sequence),
        g.Guard('segment_name_last_sequence', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/last_frame/segment_name', "closed name's last-sequence field is the event's sequence"), 'index_coverage_segment_name_last_sequence', segment_name_last_sequence),
        g.Guard('anchor_first_retained_sequence_id', g.Invariant('/read/checkpoint/generations/*/anchor/first_retained_sequence_id', "equals the event's sequence (typed)"), 'index_anchor_first_retained_sequence_id', anchor_first_retained_sequence_id),
        g.Guard('anchor_through_sequence_id', g.Invariant('/read/checkpoint/generations/*/anchor/through_sequence_id', "equals the event's sequence (typed)"), 'index_anchor_through_sequence_id', anchor_through_sequence_id),
    ])
    context = None

    def check(complete):
        table.require('coverage_segment_retained_event_count', complete, context)
        table.require('segment_name_first_sequence', complete, context)
        table.require('segment_name_last_sequence', complete, context)
        table.require('anchor_first_retained_sequence_id', complete, context)
        table.require('anchor_through_sequence_id', complete, context)
        return True
    return g.Case(table, check, context)

"""DO guard suite `checkpoint_coverage_2` (sweep part 2A). Checkpoint read: the frontier coverage, sequence, segment, selection, gap, locator and generation copies (DO-P1F04/05/06).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def coverage_frame_last_event_id(value, context):
    frame = value['coverage']['last_frame']
    if type(frame) is not dict:
        return None
    left, right = frame['last_event_id'], value['event_id']
    return 'index_coverage_frame_last_event_id' if type(left) is not type(right) or left != right else None


def coverage_segment_count(value, context):
    return 'index_coverage_segment_count' if len(value['coverage']['segments']) != 1 else None


def coverage_segment_generation(value, context):
    frame, segments = value['coverage']['last_frame'], value['coverage']['segments']
    if type(frame) is not dict or not segments:
        return None
    left, right = segments[0]['segment_generation'], frame['segment_generation']
    return 'index_coverage_segment_generation' if type(left) is not type(right) or left != right else None


def coverage_segment_name(value, context):
    frame, segments = value['coverage']['last_frame'], value['coverage']['segments']
    if type(frame) is not dict or not segments:
        return None
    left, right = segments[0]['segment_name'], frame['segment_name']
    return 'index_coverage_segment_name' if type(left) is not type(right) or left != right else None


def coverage_frame_byte_offset(value, context):
    frame, segments = value['coverage']['last_frame'], value['coverage']['segments']
    if type(frame) is not dict or not segments:
        return None
    left, right = frame['byte_offset'], segments[0]['scan_start_offset']
    return 'index_coverage_frame_byte_offset' if type(left) is not type(right) or left != right else None


ROWS = (
    ('coverage_frame_last_event_id', '/read/checkpoint/generations/*/frontier/coverage/last_frame/last_event_id', "equals the event's id (typed)",
     'index_coverage_frame_last_event_id', coverage_frame_last_event_id, ('coverage', 'event_id'), None),
    ('coverage_segment_count', '/read/checkpoint/generations/*/frontier/coverage/segments', 'holds exactly one segment',
     'index_coverage_segment_count', coverage_segment_count, ('coverage',), None),
    ('coverage_segment_generation', '/read/checkpoint/generations/*/frontier/coverage/segments/0/segment_generation', "equals the last frame's (typed)",
     'index_coverage_segment_generation', coverage_segment_generation, ('coverage',), None),
    ('coverage_segment_name', '/read/checkpoint/generations/*/frontier/coverage/segments/0/segment_name', "equals the last frame's (typed)",
     'index_coverage_segment_name', coverage_segment_name, ('coverage',), None),
    ('coverage_frame_byte_offset', '/read/checkpoint/generations/*/frontier/coverage/last_frame/byte_offset', "equals the segment's scan start (typed)",
     'index_coverage_frame_byte_offset', coverage_frame_byte_offset, ('coverage',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('coverage_frame_last_event_id', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/last_frame/last_event_id', "equals the event's id (typed)"), 'index_coverage_frame_last_event_id', coverage_frame_last_event_id),
        g.Guard('coverage_segment_count', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/segments', 'holds exactly one segment'), 'index_coverage_segment_count', coverage_segment_count),
        g.Guard('coverage_segment_generation', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/segments/0/segment_generation', "equals the last frame's (typed)"), 'index_coverage_segment_generation', coverage_segment_generation),
        g.Guard('coverage_segment_name', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/segments/0/segment_name', "equals the last frame's (typed)"), 'index_coverage_segment_name', coverage_segment_name),
        g.Guard('coverage_frame_byte_offset', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/last_frame/byte_offset', "equals the segment's scan start (typed)"), 'index_coverage_frame_byte_offset', coverage_frame_byte_offset),
    ])
    context = None

    def check(complete):
        table.require('coverage_frame_last_event_id', complete, context)
        table.require('coverage_segment_count', complete, context)
        table.require('coverage_segment_generation', complete, context)
        table.require('coverage_segment_name', complete, context)
        table.require('coverage_frame_byte_offset', complete, context)
        return True
    return g.Case(table, check, context)

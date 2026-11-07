"""DO guard suite `checkpoint_coverage_8` (sweep part 2A). Checkpoint read: the frontier coverage, sequence, segment, selection, gap, locator and generation copies (DO-P1F04/05/06).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def sequence_gap_retained(value, context):
    sequence = value['event_sequence_id']
    for gap in value['coverage']['sequence_gaps']:
        first, last = gap['first_sequence_id'], gap['last_sequence_id']
        if type(first) is int and type(last) is int and first <= sequence and sequence <= last:
            return 'index_coverage_sequence_gap_retained'
    return None


def sequence_gap_order(value, context):
    for gap in value['coverage']['sequence_gaps']:
        first, last = gap['first_sequence_id'], gap['last_sequence_id']
        if type(first) is not int or type(last) is not int or first > last:
            return 'index_coverage_sequence_gap_order'
    return None


def row_source_segment_generation(value, context):
    frame = value['coverage']['last_frame']
    if type(frame) is not dict:
        return None
    source = value['row'].get('source_locator')
    left = source.get('segment_generation') if type(source) is dict else None
    right = frame['segment_generation']
    return 'index_row_source_segment_generation' if type(left) is not type(right) or left != right else None


def row_source_segment_name(value, context):
    frame = value['coverage']['last_frame']
    if type(frame) is not dict:
        return None
    source = value['row'].get('source_locator')
    left = source.get('segment_name') if type(source) is dict else None
    right = frame['segment_name']
    return 'index_row_source_segment_name' if type(left) is not type(right) or left != right else None


def row_source_byte_offset(value, context):
    segments = value['coverage']['segments']
    if not segments:
        return None
    source = value['row'].get('source_locator')
    left = source.get('byte_offset') if type(source) is dict else None
    right = segments[0]['scan_start_offset']
    return 'index_row_source_byte_offset' if type(left) is not type(right) or left != right else None


ROWS = (
    ('sequence_gap_retained', '/read/checkpoint/generations/*/frontier/coverage/sequence_gaps', "holds no ordered gap containing the event's sequence",
     'index_coverage_sequence_gap_retained', sequence_gap_retained, ('coverage', 'event_sequence_id'), None),
    ('sequence_gap_order', '/read/checkpoint/generations/*/frontier/coverage/sequence_gaps', 'holds only integer gaps whose first is not after its last',
     'index_coverage_sequence_gap_order', sequence_gap_order, ('coverage',), None),
    ('row_source_segment_generation', '/read/row/source_locator/segment_generation', "equals the last frame's segment generation (typed)",
     'index_row_source_segment_generation', row_source_segment_generation, ('coverage', 'row'), None),
    ('row_source_segment_name', '/read/row/source_locator/segment_name', "equals the last frame's segment name (typed)",
     'index_row_source_segment_name', row_source_segment_name, ('coverage', 'row'), None),
    ('row_source_byte_offset', '/read/row/source_locator/byte_offset', "equals the segment's scan start (typed)",
     'index_row_source_byte_offset', row_source_byte_offset, ('coverage', 'row'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('sequence_gap_retained', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/sequence_gaps', "holds no ordered gap containing the event's sequence"), 'index_coverage_sequence_gap_retained', sequence_gap_retained),
        g.Guard('sequence_gap_order', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/sequence_gaps', 'holds only integer gaps whose first is not after its last'), 'index_coverage_sequence_gap_order', sequence_gap_order),
        g.Guard('row_source_segment_generation', g.Invariant('/read/row/source_locator/segment_generation', "equals the last frame's segment generation (typed)"), 'index_row_source_segment_generation', row_source_segment_generation),
        g.Guard('row_source_segment_name', g.Invariant('/read/row/source_locator/segment_name', "equals the last frame's segment name (typed)"), 'index_row_source_segment_name', row_source_segment_name),
        g.Guard('row_source_byte_offset', g.Invariant('/read/row/source_locator/byte_offset', "equals the segment's scan start (typed)"), 'index_row_source_byte_offset', row_source_byte_offset),
    ])
    context = None

    def check(complete):
        table.require('sequence_gap_retained', complete, context)
        table.require('sequence_gap_order', complete, context)
        table.require('row_source_segment_generation', complete, context)
        table.require('row_source_segment_name', complete, context)
        table.require('row_source_byte_offset', complete, context)
        return True
    return g.Case(table, check, context)

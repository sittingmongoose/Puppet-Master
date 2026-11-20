"""DO guard suite `checkpoint_coverage_3` (sweep part 2A). Checkpoint read: the frontier coverage, sequence, segment, selection, gap, locator and generation copies (DO-P1F04/05/06).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def coverage_frame_end_offset(value, context):
    frame = value['coverage']['last_frame']
    if type(frame) is not dict:
        return None
    left, right = frame['frame_end_offset'], value['event_packed_size']
    return 'index_coverage_frame_end_offset' if type(left) is not type(right) or left != right else None


def coverage_scanned_through_offset(value, context):
    segments = value['coverage']['segments']
    if not segments:
        return None
    left, right = segments[0]['scanned_through_offset'], value['event_packed_size']
    return 'index_coverage_scanned_through_offset' if type(left) is not type(right) or left != right else None


def coverage_source_durable_end_offset(value, context):
    segments = value['coverage']['segments']
    if not segments:
        return None
    left, right = segments[0]['source_durable_end_offset'], value['event_packed_size']
    return 'index_coverage_source_durable_end_offset' if type(left) is not type(right) or left != right else None


def coverage_source_durable_bytes_sha256(value, context):
    segments = value['coverage']['segments']
    if not segments:
        return None
    left, right = segments[0]['source_durable_bytes_sha256'], value['expected_source_value_sha256']
    return 'index_coverage_source_durable_bytes_sha256' if type(left) is not type(right) or left != right else None


def coverage_first_retained_sequence_id(value, context):
    # A null last frame is the schema's empty-retained-source form, whose null first/through and zero count are part
    # of that one defect; `coverage_last_frame_present` owns it (the checker stops there).
    if value['coverage']['last_frame'] is None:
        return None
    left, right = value['coverage']['first_retained_sequence_id'], value['event_sequence_id']
    return 'index_coverage_first_retained_sequence_id' if type(left) is not type(right) or left != right else None


ROWS = (
    ('coverage_frame_end_offset', '/read/checkpoint/generations/*/frontier/coverage/last_frame/frame_end_offset', "equals the packed event's size (typed)",
     'index_coverage_frame_end_offset', coverage_frame_end_offset, ('coverage', 'event_packed_size'), None),
    ('coverage_scanned_through_offset', '/read/checkpoint/generations/*/frontier/coverage/segments/0/scanned_through_offset', "equals the packed event's size (typed)",
     'index_coverage_scanned_through_offset', coverage_scanned_through_offset, ('coverage', 'event_packed_size'), None),
    ('coverage_source_durable_end_offset', '/read/checkpoint/generations/*/frontier/coverage/segments/0/source_durable_end_offset', "equals the packed event's size (typed)",
     'index_coverage_source_durable_end_offset', coverage_source_durable_end_offset, ('coverage', 'event_packed_size'), None),
    ('coverage_source_durable_bytes_sha256', '/read/checkpoint/generations/*/frontier/coverage/segments/0/source_durable_bytes_sha256', 'equals the SHA-256 of the packed event (typed)',
     'index_coverage_source_durable_bytes_sha256', coverage_source_durable_bytes_sha256, ('coverage', 'expected_source_value_sha256'), None),
    ('coverage_first_retained_sequence_id', '/read/checkpoint/generations/*/frontier/coverage/first_retained_sequence_id', "equals the event's sequence (typed)",
     'index_coverage_first_retained_sequence_id', coverage_first_retained_sequence_id, ('coverage', 'event_sequence_id'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('coverage_frame_end_offset', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/last_frame/frame_end_offset', "equals the packed event's size (typed)"), 'index_coverage_frame_end_offset', coverage_frame_end_offset),
        g.Guard('coverage_scanned_through_offset', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/segments/0/scanned_through_offset', "equals the packed event's size (typed)"), 'index_coverage_scanned_through_offset', coverage_scanned_through_offset),
        g.Guard('coverage_source_durable_end_offset', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/segments/0/source_durable_end_offset', "equals the packed event's size (typed)"), 'index_coverage_source_durable_end_offset', coverage_source_durable_end_offset),
        g.Guard('coverage_source_durable_bytes_sha256', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/segments/0/source_durable_bytes_sha256', 'equals the SHA-256 of the packed event (typed)'), 'index_coverage_source_durable_bytes_sha256', coverage_source_durable_bytes_sha256),
        g.Guard('coverage_first_retained_sequence_id', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/first_retained_sequence_id', "equals the event's sequence (typed)"), 'index_coverage_first_retained_sequence_id', coverage_first_retained_sequence_id),
    ])
    context = None

    def check(complete):
        table.require('coverage_frame_end_offset', complete, context)
        table.require('coverage_scanned_through_offset', complete, context)
        table.require('coverage_source_durable_end_offset', complete, context)
        table.require('coverage_source_durable_bytes_sha256', complete, context)
        table.require('coverage_first_retained_sequence_id', complete, context)
        return True
    return g.Case(table, check, context)

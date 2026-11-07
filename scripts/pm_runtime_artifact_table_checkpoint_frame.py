"""DR guard table checkpoint_frame: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('last_frame_sha256', 'expected_last_frame_sha256', 'coverage_segments_sha256', 'segments_sha256', 'segment_count')


def C10a_last_frame(value, context):
    return 'checkpoint_mismatch' if value['last_frame_sha256'] != value['expected_last_frame_sha256'] else None


def C10b_coverage_segments(value, context):
    return 'checkpoint_mismatch' if value['coverage_segments_sha256'] != value['segments_sha256'] else None


def C10c_single_segment(value, context):
    return 'checkpoint_mismatch' if value['segment_count'] != 1 else None


def frame_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C10a_last_frame', g.Invariant('/coverage_last_frame', 'bytes equal the receipt frame and event identity'), 'checkpoint_mismatch', C10a_last_frame),
        g.Guard('C10b_coverage_segments', g.Invariant('/coverage_segments', 'bytes equal the selected source segments bytes'), 'checkpoint_mismatch', C10b_coverage_segments),
        g.Guard('C10c_single_segment', g.Invariant('/source_segments', 'holds exactly one segment'), 'checkpoint_mismatch', C10c_single_segment),
    ])

    def check(value):
        table.require('C10a_last_frame', value, context)
        table.require('C10b_coverage_segments', value, context)
        table.require('C10c_single_segment', value, context)
        return True
    return g.Case(table, check, context)

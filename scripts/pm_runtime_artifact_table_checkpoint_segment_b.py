"""DR guard table checkpoint_segment_b: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('frame_end', 'event_value_length', 'frame_beyond_durable', 'segment_present', 'segment_count_events', 'segment_first', 'event_sequence_id', 'segment_last')


def C11g_frame_end(value, context):
    return 'checkpoint_mismatch' if value['frame_end'] != value['event_value_length'] else None


def C11h_frame_within_durable(value, context):
    return 'checkpoint_mismatch' if value['frame_beyond_durable'] is not False else None


def C11i_segment_count(value, context):
    return 'checkpoint_mismatch' if value['segment_present'] is True and value['segment_count_events'] != 1 else None


def C11j_segment_first(value, context):
    return 'checkpoint_mismatch' if value['segment_present'] is True and value['segment_first'] != value['event_sequence_id'] else None


def C11k_segment_last(value, context):
    return 'checkpoint_mismatch' if value['segment_present'] is True and value['segment_last'] != value['event_sequence_id'] else None


def segment_b_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C11g_frame_end', g.Invariant('/frame_end_offset', 'equals the length of the event value bytes'), 'checkpoint_mismatch', C11g_frame_end),
        g.Guard('C11h_frame_within_durable', g.Invariant('/frame_end_offset', 'is at most the receipt durable end offset'), 'checkpoint_mismatch', C11h_frame_within_durable),
        g.Guard('C11i_segment_count', g.Invariant('/segment_retained_event_count', 'is 1'), 'checkpoint_mismatch', C11i_segment_count),
        g.Guard('C11j_segment_first', g.Invariant('/segment_first_sequence_id', 'equals the event sequence_id'), 'checkpoint_mismatch', C11j_segment_first),
        g.Guard('C11k_segment_last', g.Invariant('/segment_last_sequence_id', 'equals the event sequence_id'), 'checkpoint_mismatch', C11k_segment_last),
    ])

    def check(value):
        table.require('C11g_frame_end', value, context)
        table.require('C11h_frame_within_durable', value, context)
        table.require('C11i_segment_count', value, context)
        table.require('C11j_segment_first', value, context)
        table.require('C11k_segment_last', value, context)
        return True
    return g.Case(table, check, context)

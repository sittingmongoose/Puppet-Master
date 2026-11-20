"""DR guard table checkpoint_segment_a: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('segment_present', 'segment_generation', 'receipt_segment_generation', 'segment_name', 'receipt_segment_name', 'scanned_through', 'frame_end', 'segment_durable_end', 'receipt_durable_end', 'segment_durable_sha256', 'source_event_value_sha256')


def C11a_segment_generation(value, context):
    return 'checkpoint_mismatch' if value['segment_present'] is True and value['segment_generation'] != value['receipt_segment_generation'] else None


def C11b_segment_name(value, context):
    return 'checkpoint_mismatch' if value['segment_present'] is True and value['segment_name'] != value['receipt_segment_name'] else None


def C11d_scanned_through(value, context):
    return 'checkpoint_mismatch' if value['segment_present'] is True and value['scanned_through'] != value['frame_end'] else None


def C11e_durable_end(value, context):
    return 'checkpoint_mismatch' if value['segment_present'] is True and value['segment_durable_end'] != value['receipt_durable_end'] else None


def C11f_durable_bytes(value, context):
    return 'checkpoint_mismatch' if value['segment_present'] is True and value['segment_durable_sha256'] != value['source_event_value_sha256'] else None


def segment_a_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C11a_segment_generation', g.Invariant('/segment_generation', 'equals the receipt segment generation'), 'checkpoint_mismatch', C11a_segment_generation),
        g.Guard('C11b_segment_name', g.Invariant('/segment_name', 'equals the receipt segment name'), 'checkpoint_mismatch', C11b_segment_name),
        g.Guard('C11d_scanned_through', g.Invariant('/scanned_through_offset', 'equals the frame end offset'), 'checkpoint_mismatch', C11d_scanned_through),
        g.Guard('C11e_durable_end', g.Invariant('/source_durable_end_offset', 'equals the receipt durable end offset'), 'checkpoint_mismatch', C11e_durable_end),
        g.Guard('C11f_durable_bytes', g.Invariant('/source_durable_bytes_sha256', 'equals the source event value digest'), 'checkpoint_mismatch', C11f_durable_bytes),
    ])

    def check(value):
        table.require('C11a_segment_generation', value, context)
        table.require('C11b_segment_name', value, context)
        table.require('C11d_scanned_through', value, context)
        table.require('C11e_durable_end', value, context)
        table.require('C11f_durable_bytes', value, context)
        return True
    return g.Case(table, check, context)

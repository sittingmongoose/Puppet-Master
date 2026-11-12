"""DR guard table checkpoint_source: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('source_partition', 'partition', 'source_event_value_sha256', 'event_value_sha256', 'source_locator_sha256', 'expected_locator_sha256', 'selection_segment_generation', 'receipt_segment_generation')


def C07a_source_partition(value, context):
    return 'checkpoint_mismatch' if value['source_partition'] != value['partition'] else None


def C07c_source_event_digest(value, context):
    return 'checkpoint_mismatch' if value['source_event_value_sha256'] != value['event_value_sha256'] else None


def C07d_source_locator(value, context):
    return 'checkpoint_mismatch' if value['source_locator_sha256'] != value['expected_locator_sha256'] else None


def C07e_selection_segment(value, context):
    return 'checkpoint_mismatch' if value['selection_segment_generation'] != value['receipt_segment_generation'] else None


def source_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C07a_source_partition', g.Invariant('/source_scope_partition', 'equals the encoded project~ partition'), 'checkpoint_mismatch', C07a_source_partition),
        g.Guard('C07c_source_event_digest', g.Invariant('/source_event_value_sha256', 'equals sha256 of the event value bytes'), 'checkpoint_mismatch', C07c_source_event_digest),
        g.Guard('C07d_source_locator', g.Invariant('/source_locator_sha256', 'locator bytes equal the first receipt segment/name/offset/sequence'), 'checkpoint_mismatch', C07d_source_locator),
        g.Guard('C07e_selection_segment', g.Invariant('/selection_segment_generation', 'equals the first receipt segment generation'), 'checkpoint_mismatch', C07e_selection_segment),
    ])

    def check(value):
        table.require('C07a_source_partition', value, context)
        table.require('C07c_source_event_digest', value, context)
        table.require('C07d_source_locator', value, context)
        table.require('C07e_selection_segment', value, context)
        return True
    return g.Case(table, check, context)

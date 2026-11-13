"""DR guard table checkpoint_coverage: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('coverage_count', 'coverage_gaps', 'coverage_prefix', 'prefix', 'coverage_first', 'event_sequence_id', 'coverage_through')


def C09h_coverage_count(value, context):
    return 'checkpoint_mismatch' if value['coverage_count'] != 1 else None


def C09k_coverage_gaps(value, context):
    return 'checkpoint_mismatch' if value['coverage_gaps'] != [] else None


def C09l_coverage_prefix(value, context):
    return 'checkpoint_mismatch' if value['coverage_prefix'] != value['prefix'] else None


def C09m_coverage_first(value, context):
    return 'checkpoint_mismatch' if value['coverage_first'] != value['event_sequence_id'] else None


def C09n_coverage_through(value, context):
    return 'checkpoint_mismatch' if value['coverage_through'] != value['event_sequence_id'] else None


def coverage_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C09h_coverage_count', g.Invariant('/coverage_retained_event_count', 'equals the verified one-event source count'), 'checkpoint_mismatch', C09h_coverage_count),
        g.Guard('C09k_coverage_gaps', g.Invariant('/coverage_sequence_gaps', 'is the empty list'), 'checkpoint_mismatch', C09k_coverage_gaps),
        g.Guard('C09l_coverage_prefix', g.Invariant('/coverage_retained_event_prefix_sha256', 'equals the recomputed retained prefix digest'), 'checkpoint_mismatch', C09l_coverage_prefix),
        g.Guard('C09m_coverage_first', g.Invariant('/coverage_first_retained_sequence_id', 'equals the event sequence_id'), 'checkpoint_mismatch', C09m_coverage_first),
        g.Guard('C09n_coverage_through', g.Invariant('/coverage_through_sequence_id', 'equals the event sequence_id'), 'checkpoint_mismatch', C09n_coverage_through),
    ])

    def check(value):
        table.require('C09h_coverage_count', value, context)
        table.require('C09k_coverage_gaps', value, context)
        table.require('C09l_coverage_prefix', value, context)
        table.require('C09m_coverage_first', value, context)
        table.require('C09n_coverage_through', value, context)
        return True
    return g.Case(table, check, context)

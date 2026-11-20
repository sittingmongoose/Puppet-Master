"""DR guard table checkpoint_anchor: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('anchor_selection_sha256', 'selection_sha256', 'translation', 'anchor_count', 'anchor_first', 'event_sequence_id', 'anchor_through', 'anchor_prefix', 'prefix', 'anchor_gaps', 'no_gaps_digest')


def C09a_anchor_selection(value, context):
    return 'checkpoint_mismatch' if value['anchor_selection_sha256'] != value['selection_sha256'] else None


def C09b_translation(value, context):
    return 'checkpoint_mismatch' if value['translation'] is not None else None


def C09c_anchor_count(value, context):
    return 'checkpoint_mismatch' if value['anchor_count'] != 1 else None


def C09d_anchor_first(value, context):
    return 'checkpoint_mismatch' if value['anchor_first'] != value['event_sequence_id'] else None


def C09e_anchor_through(value, context):
    return 'checkpoint_mismatch' if value['anchor_through'] != value['event_sequence_id'] else None


def C09f_anchor_prefix(value, context):
    return 'checkpoint_mismatch' if value['anchor_prefix'] != value['prefix'] else None


def C09g_anchor_gaps(value, context):
    return 'checkpoint_mismatch' if value['anchor_gaps'] != value['no_gaps_digest'] else None


def anchor_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C09a_anchor_selection', g.Invariant('/anchor_source_selection', 'anchor selection bytes equal the live selection bytes'), 'checkpoint_mismatch', C09a_anchor_selection),
        g.Guard('C09b_translation', g.Invariant('/node_translation', 'is null in this initial edition'), 'checkpoint_mismatch', C09b_translation),
        g.Guard('C09c_anchor_count', g.Invariant('/anchor_retained_event_count', 'equals the verified one-event source count'), 'checkpoint_mismatch', C09c_anchor_count),
        g.Guard('C09d_anchor_first', g.Invariant('/anchor_first_retained_sequence_id', 'equals the event sequence_id'), 'checkpoint_mismatch', C09d_anchor_first),
        g.Guard('C09e_anchor_through', g.Invariant('/anchor_through_sequence_id', 'equals the event sequence_id'), 'checkpoint_mismatch', C09e_anchor_through),
        g.Guard('C09f_anchor_prefix', g.Invariant('/anchor_retained_event_prefix_sha256', 'equals the recomputed retained prefix digest'), 'checkpoint_mismatch', C09f_anchor_prefix),
        g.Guard('C09g_anchor_gaps', g.Invariant('/anchor_sequence_gaps_sha256', 'equals the binding digest of no gaps'), 'checkpoint_mismatch', C09g_anchor_gaps),
    ])

    def check(value):
        table.require('C09a_anchor_selection', value, context)
        table.require('C09b_translation', value, context)
        table.require('C09c_anchor_count', value, context)
        table.require('C09d_anchor_first', value, context)
        table.require('C09e_anchor_through', value, context)
        table.require('C09f_anchor_prefix', value, context)
        table.require('C09g_anchor_gaps', value, context)
        return True
    return g.Case(table, check, context)

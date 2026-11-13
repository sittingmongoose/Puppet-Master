"""DR guard table checkpoint_dataset: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('datasets_sha256', 'expected_datasets_sha256', 'row_count', 'row_set_digest', 'expected_row_set_digest')


def C12_dataset(value, context):
    return 'checkpoint_mismatch' if value['datasets_sha256'] != value['expected_datasets_sha256'] else None


def C13_row_count(value, context):
    return 'checkpoint_mismatch' if value['row_count'] != 1 else None


def C14_row_set_digest(value, context):
    return 'checkpoint_mismatch' if value['row_set_digest'] != value['expected_row_set_digest'] else None


def dataset_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C12_dataset', g.Invariant('/datasets', 'bytes equal the expected one-row dataset'), 'checkpoint_mismatch', C12_dataset),
        g.Guard('C13_row_count', g.Invariant('/frontier_index_row_count', 'is 1'), 'checkpoint_mismatch', C13_row_count),
        g.Guard('C14_row_set_digest', g.Invariant('/frontier_index_row_set_sha256', 'equals the recomputed row-set digest'), 'checkpoint_mismatch', C14_row_set_digest),
    ])

    def check(value):
        table.require('C12_dataset', value, context)
        table.require('C13_row_count', value, context)
        table.require('C14_row_set_digest', value, context)
        return True
    return g.Case(table, check, context)

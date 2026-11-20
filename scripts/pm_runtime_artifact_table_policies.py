"""DR guard table policies: Index and checkpoint retention policy assignment.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('index_retention_policy_ref', 'index_policy', 'checkpoint_retention_policy_ref', 'checkpoint_policy', 'derived_present')


def P01_index_policy(value, context):
    return 'policy_mismatch' if value['index_retention_policy_ref'] != value['index_policy'] else None


def P02_checkpoint_policy(value, context):
    return 'policy_mismatch' if value['checkpoint_retention_policy_ref'] != value['checkpoint_policy'] else None


def P03_no_derived_policy(value, context):
    return 'policy_mismatch' if value['derived_present'] is not False else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('P01_index_policy', g.Invariant('/index_retention_policy_ref', 'equals the Storage event_record_index policy'), 'policy_mismatch', P01_index_policy),
        g.Guard('P02_checkpoint_policy', g.Invariant('/checkpoint_retention_policy_ref', 'equals the Storage checkpoint policy'), 'policy_mismatch', P02_checkpoint_policy),
        g.Guard('P03_no_derived_policy', g.Invariant('/derived_retention_policy_ref', 'is absent'), 'policy_mismatch', P03_no_derived_policy),
    ])

    def check(value):
        table.require('P01_index_policy', value, context)
        table.require('P02_checkpoint_policy', value, context)
        table.require('P03_no_derived_policy', value, context)
        return True
    return g.Case(table, check, context)

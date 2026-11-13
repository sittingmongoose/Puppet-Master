"""DG6B guard table history_custody: SP-1101 retained-original custody and frozen recipe selection (sweep part 2B).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('custody_refusal',)


def HR01_original_custody(value, context):
    return 'historical_original_recipe' if value['custody_refusal'] is not None else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('HR01_original_custody', g.Invariant('/original', 'resolves through SP-1101 sealed custody to a frozen recipe that verifies it'), 'historical_original_recipe', HR01_original_custody),
    ])

    def check(value):
        table.require('HR01_original_custody', value, context)
        return True
    return g.Case(table, check, context)

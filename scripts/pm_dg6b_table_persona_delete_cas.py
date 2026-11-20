"""DG6B guard table persona_delete_cas: Delete compares against the removed revision.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('expected_owner_revision', 'revision')


def DC01_expected_revision(value, context):
    return 'cas' if value['expected_owner_revision'] != value['revision'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('DC01_expected_revision', g.Invariant('/expected_owner_revision', 'equals the removed revision'), 'cas', DC01_expected_revision),
    ])

    def check(value):
        table.require('DC01_expected_revision', value, context)
        return True
    return g.Case(table, check, context)

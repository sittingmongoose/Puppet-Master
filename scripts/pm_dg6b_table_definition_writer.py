"""DG6B guard table definition_writer: Persona definition-write lease.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('definition_writer_current',)


def DW01_definition_writer(value, context):
    return 'definition_writer' if value['definition_writer_current'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('DW01_definition_writer', g.Invariant('/definition_writer_current', 'is exactly True'), 'definition_writer', DW01_definition_writer),
    ])

    def check(value):
        table.require('DW01_definition_writer', value, context)
        return True
    return g.Case(table, check, context)

"""DG6B guard table partition: Encoded scope partition of the source scope and the record.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('scope_partition', 'expected_partition', 'envelope_partition')


def PA01_scope_partition(value, context):
    return 'partition' if value['scope_partition'] != value['expected_partition'] else None


def PA02_record_partition(value, context):
    return 'partition' if value['envelope_partition'] != value['expected_partition'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PA01_scope_partition', g.Invariant('/scope/scope_partition', 'equals app or project~ base64url(project_id)'), 'partition', PA01_scope_partition),
        g.Guard('PA02_record_partition', g.Invariant('/scope_partition', 'equals app or project~ base64url(project_id)'), 'partition', PA02_record_partition),
    ])

    def check(value):
        table.require('PA01_scope_partition', value, context)
        table.require('PA02_record_partition', value, context)
        return True
    return g.Case(table, check, context)

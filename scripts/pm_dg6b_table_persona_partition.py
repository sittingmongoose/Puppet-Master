"""DG6B guard table persona_partition: Persona Project scope partition.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('scope_partition', 'expected_partition')


def PP01_project_partition(value, context):
    return 'partition' if value['scope_partition'] != value['expected_partition'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PP01_project_partition', g.Invariant('/scope/scope_partition', 'equals project~ base64url(project_id)'), 'partition', PP01_project_partition),
    ])

    def check(value):
        table.require('PP01_project_partition', value, context)
        return True
    return g.Case(table, check, context)

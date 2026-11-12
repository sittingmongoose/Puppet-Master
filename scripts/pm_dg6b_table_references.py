"""DG6B guard table references: Selected schema documents: metaschema validity and eager reference resolution.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('metaschema_errors', 'unresolved')


def R01_metaschema(value, context):
    return 'invalid_schema' if value['metaschema_errors'] != 0 else None


def R02_references_resolve(value, context):
    return 'unresolved_schema_ref' if value['unresolved'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('R01_metaschema', g.Invariant('/metaschema_errors', 'every selected schema document is a valid Draft 2020-12 schema'), 'invalid_schema', R01_metaschema),
        g.Guard('R02_references_resolve', g.Invariant('/unresolved', 'every $ref and $dynamicRef resolves, including unused definitions and branches'), 'unresolved_schema_ref', R02_references_resolve),
    ])

    def check(value):
        table.require('R01_metaschema', value, context)
        table.require('R02_references_resolve', value, context)
        return True
    return g.Case(table, check, context)

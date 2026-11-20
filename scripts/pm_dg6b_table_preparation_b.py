"""DG6B guard table preparation_b: Prepared-oracle fences: no admission, approved value retention, operation schema binding.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('registered', 'retention_refs', 'value_schema_errors', 'value_schema_digests', 'operation_definition_digests')


def PR05_unregistered(value, context):
    return 'prepared_membership' if value['registered'] != [] else None


def PR06_retention_pending(value, context):
    return 'retention_pending' if value['retention_refs'] != ['RP-OPERATIONAL-SECURITY-APPLICATION-2555D', 'RP-OPERATIONAL-SECURITY-APPLICATION-2555D', 'RP-OPERATIONAL-SECURITY-APPLICATION-2555D', 'RP-OPERATIONAL-SECURITY-APPLICATION-2555D', 'RP-OPERATIONAL-SECURITY-APPLICATION-2555D', 'RP-CONFIG-CURRENT', 'RP-CONFIG-CURRENT', 'RP-CONFIG-CURRENT', 'RP-CONFIG-CURRENT', 'RP-CONFIG-CURRENT', 'RP-CONFIG-CURRENT', 'RP-PLUGIN-HOOK-APPLICATION-90D', 'RP-PLUGIN-HOOK-APPLICATION-90D', 'RP-PLUGIN-HOOK-APPLICATION-90D', 'RP-PLUGIN-OPERATIONS-APPLICATION-2555D', 'RP-PLUGIN-OPERATIONS-APPLICATION-2555D', 'RP-PLUGIN-OPERATIONS-APPLICATION-2555D', 'RP-PLUGIN-OPERATIONS-APPLICATION-2555D', 'RP-PLUGIN-OPERATIONS-APPLICATION-2555D'] else None


def PR07_value_schema_valid(value, context):
    return 'invalid_schema' if value['value_schema_errors'] != 0 else None


def PR08_operation_binding(value, context):
    return 'operation_schema_binding' if value['value_schema_errors'] == 0 and value['value_schema_digests'] != value['operation_definition_digests'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PR05_unregistered', g.Invariant('/registered', 'no DG6B family is on the live registry'), 'prepared_membership', PR05_unregistered),
        g.Guard('PR06_retention_pending', g.Invariant('/retention_refs', 'every operation value family has its exact deck-4 Q3/Q4/Q5 policy'), 'retention_pending', PR06_retention_pending),
        g.Guard('PR07_value_schema_valid', g.Invariant('/value_schema_errors', 'every registered operation value schema is a valid schema'), 'invalid_schema', PR07_value_schema_valid),
        g.Guard('PR08_operation_binding', g.Invariant('/value_schema_digests', 'equals the DG6B operation definitions (value schemas valid)'), 'operation_schema_binding', PR08_operation_binding),
    ])

    def check(value):
        table.require('PR05_unregistered', value, context)
        table.require('PR06_retention_pending', value, context)
        table.require('PR07_value_schema_valid', value, context)
        table.require('PR08_operation_binding', value, context)
        return True
    return g.Case(table, check, context)

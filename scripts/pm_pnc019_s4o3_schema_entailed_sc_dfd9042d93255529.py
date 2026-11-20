"""W3I schema guard table entailed_sc_dfd9042d93255529 (generated).
sc_dfd9042d93255529: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/storage_instance_id/type
Entailed after sc_c21566779e1b65b0: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_dfd9042d93255529(value, context):
    if value['sc_c21566779e1b65b0'] != []:
        return None
    if value['sc_dfd9042d93255529'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_dfd9042d93255529', g.Invariant('/checkpoint/storage_instance_id', 'type at owner schema /properties/storage_instance_id/type'), 'schema_invalid', sc_dfd9042d93255529),
    ])

    def check(value):
        table.require('sc_dfd9042d93255529', value, context)
        return True
    return g.Case(table, check, context)

"""W3I schema guard table entailed_sc_6c65969a56649874 (generated).
sc_6c65969a56649874: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/project_id/type
Entailed after sc_202140c4f1c3427c: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_6c65969a56649874(value, context):
    if value['sc_202140c4f1c3427c'] != []:
        return None
    if value['sc_6c65969a56649874'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_6c65969a56649874', g.Invariant('/checkpoint/project_id', 'type at owner schema /properties/project_id/type'), 'schema_invalid', sc_6c65969a56649874),
    ])

    def check(value):
        table.require('sc_6c65969a56649874', value, context)
        return True
    return g.Case(table, check, context)

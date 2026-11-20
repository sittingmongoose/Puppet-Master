"""W3I schema guard table entailed_sc_c5a79e2295192831 (generated).
sc_c5a79e2295192831: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/project_id/type
Entailed after sc_106efa409546e26c: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_c5a79e2295192831(value, context):
    if value['sc_106efa409546e26c'] != []:
        return None
    if value['sc_c5a79e2295192831'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c5a79e2295192831', g.Invariant('/projection/project_id', 'type at owner schema /properties/project_id/type'), 'schema_invalid', sc_c5a79e2295192831),
    ])

    def check(value):
        table.require('sc_c5a79e2295192831', value, context)
        return True
    return g.Case(table, check, context)

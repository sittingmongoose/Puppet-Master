"""W3I schema guard table entailed_sc_e201b5cf3398e4a4 (generated).
sc_e201b5cf3398e4a4: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/project_id/type
Entailed after sc_6d8759694c37f2bf: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_e201b5cf3398e4a4(value, context):
    if value['sc_6d8759694c37f2bf'] != []:
        return None
    if value['sc_e201b5cf3398e4a4'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_e201b5cf3398e4a4', g.Invariant('/payload_provenance_recorded/project_id', 'type at owner schema /properties/project_id/type'), 'schema_invalid', sc_e201b5cf3398e4a4),
    ])

    def check(value):
        table.require('sc_e201b5cf3398e4a4', value, context)
        return True
    return g.Case(table, check, context)

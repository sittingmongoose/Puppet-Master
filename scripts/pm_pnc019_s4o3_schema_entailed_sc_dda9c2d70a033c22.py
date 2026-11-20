"""W3I schema guard table entailed_sc_dda9c2d70a033c22 (generated).
sc_dda9c2d70a033c22: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/continuity_id/type
Entailed after sc_a6b0d3d75382f102: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_dda9c2d70a033c22(value, context):
    if value['sc_a6b0d3d75382f102'] != []:
        return None
    if value['sc_dda9c2d70a033c22'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_dda9c2d70a033c22', g.Invariant('/payload_provenance_recorded/continuity_id', 'type at owner schema /properties/continuity_id/type'), 'schema_invalid', sc_dda9c2d70a033c22),
    ])

    def check(value):
        table.require('sc_dda9c2d70a033c22', value, context)
        return True
    return g.Case(table, check, context)

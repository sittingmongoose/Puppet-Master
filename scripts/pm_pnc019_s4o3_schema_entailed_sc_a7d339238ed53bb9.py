"""W3I schema guard table entailed_sc_a7d339238ed53bb9 (generated).
sc_a7d339238ed53bb9: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/allOf/0/else/properties/withdrawn_at_utc/format
Entailed after sc_7083d99e45428930: The earlier same-field anyOf(timestamp,null) rejects every string that violates date-time. This conditional else format applies only to strings; null and other types cannot violate format. Both use the same shared date-time profile and the unchanged timestamp definition.
"""
import pm_guard_isolation as g


def sc_a7d339238ed53bb9(value, context):
    if value['sc_7083d99e45428930'] != []:
        return None
    if value['sc_a7d339238ed53bb9'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_a7d339238ed53bb9', g.Invariant('/checkpoint/retired_publications/*/withdrawn_at_utc', 'format at owner schema /properties/retired_publications/items/allOf/0/else/properties/withdrawn_at_utc/format'), 'schema_invalid', sc_a7d339238ed53bb9),
    ])

    def check(value):
        table.require('sc_a7d339238ed53bb9', value, context)
        return True
    return g.Case(table, check, context)

"""W3I schema guard table entailed_sc_2028a1cc9c37cab0 (generated).
sc_2028a1cc9c37cab0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/hold_refs/items/type
Entailed after sc_aaf1acaae67ab81d: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_2028a1cc9c37cab0(value, context):
    if value['sc_aaf1acaae67ab81d'] != []:
        return None
    if value['sc_2028a1cc9c37cab0'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_2028a1cc9c37cab0', g.Invariant('/checkpoint/retired_publications/*/hold_refs/*', 'type at owner schema /properties/retired_publications/items/properties/hold_refs/items/type'), 'schema_invalid', sc_2028a1cc9c37cab0),
    ])

    def check(value):
        table.require('sc_2028a1cc9c37cab0', value, context)
        return True
    return g.Case(table, check, context)

"""W3I schema guard table entailed_sc_724ad3efaca0cdb3 (generated).
sc_724ad3efaca0cdb3: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/stream_id/type
Entailed after sc_7273b59c4d988bb8: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_724ad3efaca0cdb3(value, context):
    if value['sc_7273b59c4d988bb8'] != []:
        return None
    if value['sc_724ad3efaca0cdb3'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_724ad3efaca0cdb3', g.Invariant('/checkpoint/retired_publications/*/stream_id', 'type at owner schema /properties/retired_publications/items/properties/stream_id/type'), 'schema_invalid', sc_724ad3efaca0cdb3),
    ])

    def check(value):
        table.require('sc_724ad3efaca0cdb3', value, context)
        return True
    return g.Case(table, check, context)

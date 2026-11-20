"""W3I schema guard table entailed_sc_b681400c08e3c43f (generated).
sc_b681400c08e3c43f: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/publication_id/type
Entailed after sc_80f11262d652d0fb: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_b681400c08e3c43f(value, context):
    if value['sc_80f11262d652d0fb'] != []:
        return None
    if value['sc_b681400c08e3c43f'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_b681400c08e3c43f', g.Invariant('/checkpoint/retired_publications/*/publication_id', 'type at owner schema /properties/retired_publications/items/properties/publication_id/type'), 'schema_invalid', sc_b681400c08e3c43f),
    ])

    def check(value):
        table.require('sc_b681400c08e3c43f', value, context)
        return True
    return g.Case(table, check, context)

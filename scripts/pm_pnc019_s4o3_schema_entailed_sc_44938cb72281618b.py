"""W3I schema guard table entailed_sc_44938cb72281618b (generated).
sc_44938cb72281618b: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/publication_id/type
Entailed after sc_64396ebfdeca47d3: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_44938cb72281618b(value, context):
    if value['sc_64396ebfdeca47d3'] != []:
        return None
    if value['sc_44938cb72281618b'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_44938cb72281618b', g.Invariant('/checkpoint/publication_id', 'type at owner schema /properties/publication_id/type'), 'schema_invalid', sc_44938cb72281618b),
    ])

    def check(value):
        table.require('sc_44938cb72281618b', value, context)
        return True
    return g.Case(table, check, context)

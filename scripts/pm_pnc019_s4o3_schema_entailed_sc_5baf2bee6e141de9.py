"""W3I schema guard table entailed_sc_5baf2bee6e141de9 (generated).
sc_5baf2bee6e141de9: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/hold_refs/items/type
Entailed after sc_5addcc39ad58daec: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_5baf2bee6e141de9(value, context):
    if value['sc_5addcc39ad58daec'] != []:
        return None
    if value['sc_5baf2bee6e141de9'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_5baf2bee6e141de9', g.Invariant('/checkpoint/hold_refs/*', 'type at owner schema /properties/hold_refs/items/type'), 'schema_invalid', sc_5baf2bee6e141de9),
    ])

    def check(value):
        table.require('sc_5baf2bee6e141de9', value, context)
        return True
    return g.Case(table, check, context)

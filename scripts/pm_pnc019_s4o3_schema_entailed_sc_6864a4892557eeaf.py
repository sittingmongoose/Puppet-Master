"""W3I schema guard table entailed_sc_6864a4892557eeaf (generated).
sc_6864a4892557eeaf: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/continuity_id/type
Entailed after sc_ba58180066b6b7c3: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_6864a4892557eeaf(value, context):
    if value['sc_ba58180066b6b7c3'] != []:
        return None
    if value['sc_6864a4892557eeaf'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_6864a4892557eeaf', g.Invariant('/payload_actor_identified/continuity_id', 'type at owner schema /properties/continuity_id/type'), 'schema_invalid', sc_6864a4892557eeaf),
    ])

    def check(value):
        table.require('sc_6864a4892557eeaf', value, context)
        return True
    return g.Case(table, check, context)

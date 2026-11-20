"""W3I schema guard table entailed_sc_254eac57bd4c1d82 (generated).
sc_254eac57bd4c1d82: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/redaction_decision/type
Entailed after sc_a71c27f8545a4d07: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_254eac57bd4c1d82(value, context):
    if value['sc_a71c27f8545a4d07'] != []:
        return None
    if value['sc_254eac57bd4c1d82'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_254eac57bd4c1d82', g.Invariant('/payload_actor_identified/redaction_decision', 'type at owner schema /properties/redaction_decision/type'), 'schema_invalid', sc_254eac57bd4c1d82),
    ])

    def check(value):
        table.require('sc_254eac57bd4c1d82', value, context)
        return True
    return g.Case(table, check, context)

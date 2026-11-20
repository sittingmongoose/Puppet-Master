"""W3I schema guard table entailed_sc_8b06486e451971d4 (generated).
sc_8b06486e451971d4: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/fact_ref/type
Entailed after sc_8f744c494cfb7247: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_8b06486e451971d4(value, context):
    if value['sc_8f744c494cfb7247'] != []:
        return None
    if value['sc_8b06486e451971d4'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_8b06486e451971d4', g.Invariant('/payload_replay_checkpointed/fact_ref', 'type at owner schema /properties/fact_ref/type'), 'schema_invalid', sc_8b06486e451971d4),
    ])

    def check(value):
        table.require('sc_8b06486e451971d4', value, context)
        return True
    return g.Case(table, check, context)

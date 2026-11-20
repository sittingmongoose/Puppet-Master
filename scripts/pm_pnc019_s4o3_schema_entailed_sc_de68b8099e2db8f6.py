"""W3I schema guard table entailed_sc_de68b8099e2db8f6 (generated).
sc_de68b8099e2db8f6: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/actor_ref/type
Entailed after sc_7f5f47da4f9c7361: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_de68b8099e2db8f6(value, context):
    if value['sc_7f5f47da4f9c7361'] != []:
        return None
    if value['sc_de68b8099e2db8f6'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_de68b8099e2db8f6', g.Invariant('/payload_replay_checkpointed/actor_ref', 'type at owner schema /properties/actor_ref/type'), 'schema_invalid', sc_de68b8099e2db8f6),
    ])

    def check(value):
        table.require('sc_de68b8099e2db8f6', value, context)
        return True
    return g.Case(table, check, context)

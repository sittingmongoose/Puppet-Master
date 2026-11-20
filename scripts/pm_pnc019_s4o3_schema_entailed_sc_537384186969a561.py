"""W3I schema guard table entailed_sc_537384186969a561 (generated).
sc_537384186969a561: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/source_event_id/type
Entailed after sc_7022b85105e7b679: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_537384186969a561(value, context):
    if value['sc_7022b85105e7b679'] != []:
        return None
    if value['sc_537384186969a561'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_537384186969a561', g.Invariant('/payload_replay_checkpointed/source_event_id', 'type at owner schema /properties/source_event_id/type'), 'schema_invalid', sc_537384186969a561),
    ])

    def check(value):
        table.require('sc_537384186969a561', value, context)
        return True
    return g.Case(table, check, context)

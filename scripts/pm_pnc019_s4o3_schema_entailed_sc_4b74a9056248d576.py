"""W3I schema guard table entailed_sc_4b74a9056248d576 (generated).
sc_4b74a9056248d576: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/stream_id/type
Entailed after sc_14214e442657548a: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_4b74a9056248d576(value, context):
    if value['sc_14214e442657548a'] != []:
        return None
    if value['sc_4b74a9056248d576'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_4b74a9056248d576', g.Invariant('/payload_replay_checkpointed/stream_id', 'type at owner schema /properties/stream_id/type'), 'schema_invalid', sc_4b74a9056248d576),
    ])

    def check(value):
        table.require('sc_4b74a9056248d576', value, context)
        return True
    return g.Case(table, check, context)

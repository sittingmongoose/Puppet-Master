"""W3I schema guard table entailed_sc_9b19a8a6deed6719 (generated).
sc_9b19a8a6deed6719: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/stream_id/type
Entailed after sc_0b29ded9c8368263: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_9b19a8a6deed6719(value, context):
    if value['sc_0b29ded9c8368263'] != []:
        return None
    if value['sc_9b19a8a6deed6719'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_9b19a8a6deed6719', g.Invariant('/payload_actor_identified/stream_id', 'type at owner schema /properties/stream_id/type'), 'schema_invalid', sc_9b19a8a6deed6719),
    ])

    def check(value):
        table.require('sc_9b19a8a6deed6719', value, context)
        return True
    return g.Case(table, check, context)

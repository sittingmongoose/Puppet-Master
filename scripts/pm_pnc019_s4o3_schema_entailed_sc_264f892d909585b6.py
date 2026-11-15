"""W3I schema guard table entailed_sc_264f892d909585b6 (generated).
sc_264f892d909585b6: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/continuity_id/type
Entailed after sc_3d850a45a7b23ec6: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_264f892d909585b6(value, context):
    if value['sc_3d850a45a7b23ec6'] != []:
        return None
    if value['sc_264f892d909585b6'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_264f892d909585b6', g.Invariant('/payload_replay_checkpointed/continuity_id', 'type at owner schema /properties/continuity_id/type'), 'schema_invalid', sc_264f892d909585b6),
    ])

    def check(value):
        table.require('sc_264f892d909585b6', value, context)
        return True
    return g.Case(table, check, context)

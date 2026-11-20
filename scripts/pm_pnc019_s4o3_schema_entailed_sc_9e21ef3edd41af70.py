"""W3I schema guard table entailed_sc_9e21ef3edd41af70 (generated).
sc_9e21ef3edd41af70: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/project_id/type
Entailed after sc_96a0f9ec9fb8426c: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_9e21ef3edd41af70(value, context):
    if value['sc_96a0f9ec9fb8426c'] != []:
        return None
    if value['sc_9e21ef3edd41af70'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_9e21ef3edd41af70', g.Invariant('/payload_replay_checkpointed/project_id', 'type at owner schema /properties/project_id/type'), 'schema_invalid', sc_9e21ef3edd41af70),
    ])

    def check(value):
        table.require('sc_9e21ef3edd41af70', value, context)
        return True
    return g.Case(table, check, context)

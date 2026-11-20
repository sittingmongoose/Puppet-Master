"""W3I schema guard table entailed_sc_9b18df4c74f5df6d (generated).
sc_9b18df4c74f5df6d: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/redaction_decision/type
Entailed after sc_63eb343fb9eb8c3d: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_9b18df4c74f5df6d(value, context):
    if value['sc_63eb343fb9eb8c3d'] != []:
        return None
    if value['sc_9b18df4c74f5df6d'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_9b18df4c74f5df6d', g.Invariant('/payload_replay_checkpointed/redaction_decision', 'type at owner schema /properties/redaction_decision/type'), 'schema_invalid', sc_9b18df4c74f5df6d),
    ])

    def check(value):
        table.require('sc_9b18df4c74f5df6d', value, context)
        return True
    return g.Case(table, check, context)

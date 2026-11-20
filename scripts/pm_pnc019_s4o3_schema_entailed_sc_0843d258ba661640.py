"""W3I schema guard table entailed_sc_0843d258ba661640 (generated).
sc_0843d258ba661640: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/actor_kind/type
Entailed after sc_e1fdd5fbe61c41e9: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_0843d258ba661640(value, context):
    if value['sc_e1fdd5fbe61c41e9'] != []:
        return None
    if value['sc_0843d258ba661640'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_0843d258ba661640', g.Invariant('/payload_replay_checkpointed/actor_kind', 'type at owner schema /properties/actor_kind/type'), 'schema_invalid', sc_0843d258ba661640),
    ])

    def check(value):
        table.require('sc_0843d258ba661640', value, context)
        return True
    return g.Case(table, check, context)

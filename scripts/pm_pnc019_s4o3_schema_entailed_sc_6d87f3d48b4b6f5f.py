"""W3I schema guard table entailed_sc_6d87f3d48b4b6f5f (generated).
sc_6d87f3d48b4b6f5f: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/replay_checkpoint_ref/type
Entailed after sc_fc0df172dee39024: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_6d87f3d48b4b6f5f(value, context):
    if value['sc_fc0df172dee39024'] != []:
        return None
    if value['sc_6d87f3d48b4b6f5f'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_6d87f3d48b4b6f5f', g.Invariant('/payload_actor_identified/replay_checkpoint_ref', 'type at owner schema /properties/replay_checkpoint_ref/type'), 'schema_invalid', sc_6d87f3d48b4b6f5f),
    ])

    def check(value):
        table.require('sc_6d87f3d48b4b6f5f', value, context)
        return True
    return g.Case(table, check, context)

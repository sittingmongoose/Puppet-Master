"""W3I schema guard table entailed_sc_2d0c9a91126e99f4 (generated).
sc_2d0c9a91126e99f4: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/replay_checkpoint_ref/type
Entailed after sc_8794f85b8312b3da: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_2d0c9a91126e99f4(value, context):
    if value['sc_8794f85b8312b3da'] != []:
        return None
    if value['sc_2d0c9a91126e99f4'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_2d0c9a91126e99f4', g.Invariant('/payload_redaction_applied/replay_checkpoint_ref', 'type at owner schema /properties/replay_checkpoint_ref/type'), 'schema_invalid', sc_2d0c9a91126e99f4),
    ])

    def check(value):
        table.require('sc_2d0c9a91126e99f4', value, context)
        return True
    return g.Case(table, check, context)

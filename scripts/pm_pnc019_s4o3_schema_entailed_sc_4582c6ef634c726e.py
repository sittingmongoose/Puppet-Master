"""W3I schema guard table entailed_sc_4582c6ef634c726e (generated).
sc_4582c6ef634c726e: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/provenance_ref/type
Entailed after sc_7896d33925b101bc: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_4582c6ef634c726e(value, context):
    if value['sc_7896d33925b101bc'] != []:
        return None
    if value['sc_4582c6ef634c726e'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_4582c6ef634c726e', g.Invariant('/payload_replay_checkpointed/provenance_ref', 'type at owner schema /properties/provenance_ref/type'), 'schema_invalid', sc_4582c6ef634c726e),
    ])

    def check(value):
        table.require('sc_4582c6ef634c726e', value, context)
        return True
    return g.Case(table, check, context)

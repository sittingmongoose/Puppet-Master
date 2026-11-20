"""W3I schema guard table entailed_sc_0b974cf41ed50356 (generated).
sc_0b974cf41ed50356: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/stream_id/type
Entailed after sc_9f2b455e5c48e142: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_0b974cf41ed50356(value, context):
    if value['sc_9f2b455e5c48e142'] != []:
        return None
    if value['sc_0b974cf41ed50356'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_0b974cf41ed50356', g.Invariant('/payload_redaction_applied/stream_id', 'type at owner schema /properties/stream_id/type'), 'schema_invalid', sc_0b974cf41ed50356),
    ])

    def check(value):
        table.require('sc_0b974cf41ed50356', value, context)
        return True
    return g.Case(table, check, context)

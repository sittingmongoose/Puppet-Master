"""W3I schema guard table entailed_sc_e7f703426350d7aa (generated).
sc_e7f703426350d7aa: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/stream_id/type
Entailed after sc_bd7a4348aae8afbf: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_e7f703426350d7aa(value, context):
    if value['sc_bd7a4348aae8afbf'] != []:
        return None
    if value['sc_e7f703426350d7aa'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_e7f703426350d7aa', g.Invariant('/checkpoint/stream_id', 'type at owner schema /properties/stream_id/type'), 'schema_invalid', sc_e7f703426350d7aa),
    ])

    def check(value):
        table.require('sc_e7f703426350d7aa', value, context)
        return True
    return g.Case(table, check, context)

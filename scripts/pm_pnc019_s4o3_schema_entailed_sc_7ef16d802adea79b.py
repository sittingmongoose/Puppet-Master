"""W3I schema guard table entailed_sc_7ef16d802adea79b (generated).
sc_7ef16d802adea79b: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/actor_kind/type
Entailed after sc_ea2e5e8d48372b6c: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_7ef16d802adea79b(value, context):
    if value['sc_ea2e5e8d48372b6c'] != []:
        return None
    if value['sc_7ef16d802adea79b'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_7ef16d802adea79b', g.Invariant('/payload_redaction_applied/actor_kind', 'type at owner schema /properties/actor_kind/type'), 'schema_invalid', sc_7ef16d802adea79b),
    ])

    def check(value):
        table.require('sc_7ef16d802adea79b', value, context)
        return True
    return g.Case(table, check, context)

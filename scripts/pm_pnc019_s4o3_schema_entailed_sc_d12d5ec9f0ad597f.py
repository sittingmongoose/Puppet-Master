"""W3I schema guard table entailed_sc_d12d5ec9f0ad597f (generated).
sc_d12d5ec9f0ad597f: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/actor_ref/type
Entailed after sc_5ab096d3e586f3f9: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_d12d5ec9f0ad597f(value, context):
    if value['sc_5ab096d3e586f3f9'] != []:
        return None
    if value['sc_d12d5ec9f0ad597f'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_d12d5ec9f0ad597f', g.Invariant('/payload_redaction_applied/actor_ref', 'type at owner schema /properties/actor_ref/type'), 'schema_invalid', sc_d12d5ec9f0ad597f),
    ])

    def check(value):
        table.require('sc_d12d5ec9f0ad597f', value, context)
        return True
    return g.Case(table, check, context)

"""W3I schema guard table entailed_sc_b5e622ca7955a65d (generated).
sc_b5e622ca7955a65d: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/fact_ref/type
Entailed after sc_0e7535dc1b4beb80: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_b5e622ca7955a65d(value, context):
    if value['sc_0e7535dc1b4beb80'] != []:
        return None
    if value['sc_b5e622ca7955a65d'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_b5e622ca7955a65d', g.Invariant('/payload_redaction_applied/fact_ref', 'type at owner schema /properties/fact_ref/type'), 'schema_invalid', sc_b5e622ca7955a65d),
    ])

    def check(value):
        table.require('sc_b5e622ca7955a65d', value, context)
        return True
    return g.Case(table, check, context)

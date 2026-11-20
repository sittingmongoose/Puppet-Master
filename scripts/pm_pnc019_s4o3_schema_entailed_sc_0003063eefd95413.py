"""W3I schema guard table entailed_sc_0003063eefd95413 (generated).
sc_0003063eefd95413: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/source_event_id/type
Entailed after sc_f5c9ed63038bdebf: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_0003063eefd95413(value, context):
    if value['sc_f5c9ed63038bdebf'] != []:
        return None
    if value['sc_0003063eefd95413'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_0003063eefd95413', g.Invariant('/payload_redaction_applied/source_event_id', 'type at owner schema /properties/source_event_id/type'), 'schema_invalid', sc_0003063eefd95413),
    ])

    def check(value):
        table.require('sc_0003063eefd95413', value, context)
        return True
    return g.Case(table, check, context)

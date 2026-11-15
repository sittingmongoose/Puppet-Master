"""W3I schema guard table entailed_sc_c824b5f5e4a0dbaf (generated).
sc_c824b5f5e4a0dbaf: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/continuity_id/type
Entailed after sc_6df64ba531430b1d: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_c824b5f5e4a0dbaf(value, context):
    if value['sc_6df64ba531430b1d'] != []:
        return None
    if value['sc_c824b5f5e4a0dbaf'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c824b5f5e4a0dbaf', g.Invariant('/payload_redaction_applied/continuity_id', 'type at owner schema /properties/continuity_id/type'), 'schema_invalid', sc_c824b5f5e4a0dbaf),
    ])

    def check(value):
        table.require('sc_c824b5f5e4a0dbaf', value, context)
        return True
    return g.Case(table, check, context)

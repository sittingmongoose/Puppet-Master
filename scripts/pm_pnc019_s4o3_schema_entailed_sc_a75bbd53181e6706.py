"""W3I schema guard table entailed_sc_a75bbd53181e6706 (generated).
sc_a75bbd53181e6706: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/redaction_decision/type
Entailed after sc_383e27901a976dc5: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_a75bbd53181e6706(value, context):
    if value['sc_383e27901a976dc5'] != []:
        return None
    if value['sc_a75bbd53181e6706'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_a75bbd53181e6706', g.Invariant('/payload_redaction_applied/redaction_decision', 'type at owner schema /properties/redaction_decision/type'), 'schema_invalid', sc_a75bbd53181e6706),
    ])

    def check(value):
        table.require('sc_a75bbd53181e6706', value, context)
        return True
    return g.Case(table, check, context)

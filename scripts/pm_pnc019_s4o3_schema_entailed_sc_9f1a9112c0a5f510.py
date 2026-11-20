"""W3I schema guard table entailed_sc_9f1a9112c0a5f510 (generated).
sc_9f1a9112c0a5f510: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/redaction_decision/type
Entailed after sc_1a7c2c33c9aeb9bc: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_9f1a9112c0a5f510(value, context):
    if value['sc_1a7c2c33c9aeb9bc'] != []:
        return None
    if value['sc_9f1a9112c0a5f510'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_9f1a9112c0a5f510', g.Invariant('/payload_provenance_recorded/redaction_decision', 'type at owner schema /properties/redaction_decision/type'), 'schema_invalid', sc_9f1a9112c0a5f510),
    ])

    def check(value):
        table.require('sc_9f1a9112c0a5f510', value, context)
        return True
    return g.Case(table, check, context)

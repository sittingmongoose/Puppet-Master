"""W3I schema guard table entailed_sc_c386a514d0c343b9 (generated).
sc_c386a514d0c343b9: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/redaction_profile_id/type
Entailed after sc_95a8eedb11428a5a: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_c386a514d0c343b9(value, context):
    if value['sc_95a8eedb11428a5a'] != []:
        return None
    if value['sc_c386a514d0c343b9'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c386a514d0c343b9', g.Invariant('/payload_redaction_applied/redaction_profile_id', 'type at owner schema /properties/redaction_profile_id/type'), 'schema_invalid', sc_c386a514d0c343b9),
    ])

    def check(value):
        table.require('sc_c386a514d0c343b9', value, context)
        return True
    return g.Case(table, check, context)

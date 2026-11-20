"""W3I schema guard table entailed_sc_5abdc45332fbc2e4 (generated).
sc_5abdc45332fbc2e4: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/redaction_profile_id/type
Entailed after sc_3604950d368077eb: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_5abdc45332fbc2e4(value, context):
    if value['sc_3604950d368077eb'] != []:
        return None
    if value['sc_5abdc45332fbc2e4'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_5abdc45332fbc2e4', g.Invariant('/payload_provenance_recorded/redaction_profile_id', 'type at owner schema /properties/redaction_profile_id/type'), 'schema_invalid', sc_5abdc45332fbc2e4),
    ])

    def check(value):
        table.require('sc_5abdc45332fbc2e4', value, context)
        return True
    return g.Case(table, check, context)

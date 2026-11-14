"""W3I schema guard table entailed_sc_587788c818e30ae4 (generated).
sc_587788c818e30ae4: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/redaction_profile_id/minLength
Entailed after sc_736c66a0ccb4d4b5: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_587788c818e30ae4(value, context):
    if value['sc_736c66a0ccb4d4b5'] != []:
        return None
    if value['sc_587788c818e30ae4'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_587788c818e30ae4', g.Invariant('/payload_redaction_applied/redaction_profile_id', 'minLength at owner schema /properties/redaction_profile_id/minLength'), 'schema_invalid', sc_587788c818e30ae4),
    ])

    def check(value):
        table.require('sc_587788c818e30ae4', value, context)
        return True
    return g.Case(table, check, context)

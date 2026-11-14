"""W3I schema guard table entailed_sc_ede17a0e24e7a136 (generated).
sc_ede17a0e24e7a136: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/continuity_id/minLength
Entailed after sc_35a91a88a7094ca5: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_ede17a0e24e7a136(value, context):
    if value['sc_35a91a88a7094ca5'] != []:
        return None
    if value['sc_ede17a0e24e7a136'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_ede17a0e24e7a136', g.Invariant('/payload_redaction_applied/continuity_id', 'minLength at owner schema /properties/continuity_id/minLength'), 'schema_invalid', sc_ede17a0e24e7a136),
    ])

    def check(value):
        table.require('sc_ede17a0e24e7a136', value, context)
        return True
    return g.Case(table, check, context)

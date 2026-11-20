"""W3I schema guard table entailed_sc_315c39de1d5fc9f8 (generated).
sc_315c39de1d5fc9f8: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/redaction_profile_id/minLength
Entailed after sc_8da08450b0081e44: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_315c39de1d5fc9f8(value, context):
    if value['sc_8da08450b0081e44'] != []:
        return None
    if value['sc_315c39de1d5fc9f8'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_315c39de1d5fc9f8', g.Invariant('/payload_provenance_recorded/redaction_profile_id', 'minLength at owner schema /properties/redaction_profile_id/minLength'), 'schema_invalid', sc_315c39de1d5fc9f8),
    ])

    def check(value):
        table.require('sc_315c39de1d5fc9f8', value, context)
        return True
    return g.Case(table, check, context)

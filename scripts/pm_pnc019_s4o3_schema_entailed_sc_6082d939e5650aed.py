"""W3I schema guard table entailed_sc_6082d939e5650aed (generated).
sc_6082d939e5650aed: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/source_event_id/minLength
Entailed after sc_5be8512cff34c17d: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_6082d939e5650aed(value, context):
    if value['sc_5be8512cff34c17d'] != []:
        return None
    if value['sc_6082d939e5650aed'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_6082d939e5650aed', g.Invariant('/payload_redaction_applied/source_event_id', 'minLength at owner schema /properties/source_event_id/minLength'), 'schema_invalid', sc_6082d939e5650aed),
    ])

    def check(value):
        table.require('sc_6082d939e5650aed', value, context)
        return True
    return g.Case(table, check, context)

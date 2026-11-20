"""W3I schema guard table entailed_sc_8b8b63e59c2b0086 (generated).
sc_8b8b63e59c2b0086: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/fact_ref/minLength
Entailed after sc_330c79e44e4e0ffb: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_8b8b63e59c2b0086(value, context):
    if value['sc_330c79e44e4e0ffb'] != []:
        return None
    if value['sc_8b8b63e59c2b0086'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_8b8b63e59c2b0086', g.Invariant('/payload_provenance_recorded/fact_ref', 'minLength at owner schema /properties/fact_ref/minLength'), 'schema_invalid', sc_8b8b63e59c2b0086),
    ])

    def check(value):
        table.require('sc_8b8b63e59c2b0086', value, context)
        return True
    return g.Case(table, check, context)

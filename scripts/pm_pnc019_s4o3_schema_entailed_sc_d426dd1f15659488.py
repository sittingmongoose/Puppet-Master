"""W3I schema guard table entailed_sc_d426dd1f15659488 (generated).
sc_d426dd1f15659488: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/fact_ref/minLength
Entailed after sc_86b90011569d8138: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_d426dd1f15659488(value, context):
    if value['sc_86b90011569d8138'] != []:
        return None
    if value['sc_d426dd1f15659488'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_d426dd1f15659488', g.Invariant('/payload_redaction_applied/fact_ref', 'minLength at owner schema /properties/fact_ref/minLength'), 'schema_invalid', sc_d426dd1f15659488),
    ])

    def check(value):
        table.require('sc_d426dd1f15659488', value, context)
        return True
    return g.Case(table, check, context)

"""W3I schema guard table entailed_sc_d17360eaa9121f15 (generated).
sc_d17360eaa9121f15: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/redaction_decision/minLength
Entailed after sc_77e4d177433d9772: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_d17360eaa9121f15(value, context):
    if value['sc_77e4d177433d9772'] != []:
        return None
    if value['sc_d17360eaa9121f15'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_d17360eaa9121f15', g.Invariant('/payload_provenance_recorded/redaction_decision', 'minLength at owner schema /properties/redaction_decision/minLength'), 'schema_invalid', sc_d17360eaa9121f15),
    ])

    def check(value):
        table.require('sc_d17360eaa9121f15', value, context)
        return True
    return g.Case(table, check, context)

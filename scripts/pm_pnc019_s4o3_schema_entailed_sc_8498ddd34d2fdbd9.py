"""W3I schema guard table entailed_sc_8498ddd34d2fdbd9 (generated).
sc_8498ddd34d2fdbd9: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/redaction_decision/minLength
Entailed after sc_04cb95998676b625: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_8498ddd34d2fdbd9(value, context):
    if value['sc_04cb95998676b625'] != []:
        return None
    if value['sc_8498ddd34d2fdbd9'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_8498ddd34d2fdbd9', g.Invariant('/payload_redaction_applied/redaction_decision', 'minLength at owner schema /properties/redaction_decision/minLength'), 'schema_invalid', sc_8498ddd34d2fdbd9),
    ])

    def check(value):
        table.require('sc_8498ddd34d2fdbd9', value, context)
        return True
    return g.Case(table, check, context)

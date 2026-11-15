"""W3I schema guard table entailed_sc_f02b54e491a8829d (generated).
sc_f02b54e491a8829d: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/event_id/minLength
Entailed after sc_32ae6bdf83f0bb71: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_f02b54e491a8829d(value, context):
    if value['sc_32ae6bdf83f0bb71'] != []:
        return None
    if value['sc_f02b54e491a8829d'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_f02b54e491a8829d', g.Invariant('/projection/event_id', 'minLength at owner schema /properties/event_id/minLength'), 'schema_invalid', sc_f02b54e491a8829d),
    ])

    def check(value):
        table.require('sc_f02b54e491a8829d', value, context)
        return True
    return g.Case(table, check, context)

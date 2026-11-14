"""W3I schema guard table entailed_sc_4896c423a3badc61 (generated).
sc_4896c423a3badc61: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/stream_id/minLength
Entailed after sc_491e941e1e764952: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_4896c423a3badc61(value, context):
    if value['sc_491e941e1e764952'] != []:
        return None
    if value['sc_4896c423a3badc61'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_4896c423a3badc61', g.Invariant('/projection/stream_id', 'minLength at owner schema /properties/stream_id/minLength'), 'schema_invalid', sc_4896c423a3badc61),
    ])

    def check(value):
        table.require('sc_4896c423a3badc61', value, context)
        return True
    return g.Case(table, check, context)

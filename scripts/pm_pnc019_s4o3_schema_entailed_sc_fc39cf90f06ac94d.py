"""W3I schema guard table entailed_sc_fc39cf90f06ac94d (generated).
sc_fc39cf90f06ac94d: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/source_event_id/minLength
Entailed after sc_cd2fba186e731cd2: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_fc39cf90f06ac94d(value, context):
    if value['sc_cd2fba186e731cd2'] != []:
        return None
    if value['sc_fc39cf90f06ac94d'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_fc39cf90f06ac94d', g.Invariant('/payload_provenance_recorded/source_event_id', 'minLength at owner schema /properties/source_event_id/minLength'), 'schema_invalid', sc_fc39cf90f06ac94d),
    ])

    def check(value):
        table.require('sc_fc39cf90f06ac94d', value, context)
        return True
    return g.Case(table, check, context)

"""W3I schema guard table entailed_sc_ccb136999fb2792c (generated).
sc_ccb136999fb2792c: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/continuity_id/minLength
Entailed after sc_d85df49faea64a77: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_ccb136999fb2792c(value, context):
    if value['sc_d85df49faea64a77'] != []:
        return None
    if value['sc_ccb136999fb2792c'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_ccb136999fb2792c', g.Invariant('/projection/continuity_id', 'minLength at owner schema /properties/continuity_id/minLength'), 'schema_invalid', sc_ccb136999fb2792c),
    ])

    def check(value):
        table.require('sc_ccb136999fb2792c', value, context)
        return True
    return g.Case(table, check, context)

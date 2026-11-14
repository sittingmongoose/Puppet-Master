"""W3I schema guard table entailed_sc_fc0e9a99163e9b99 (generated).
sc_fc0e9a99163e9b99: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/project_id/minLength
Entailed after sc_94bb09edc9966994: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_fc0e9a99163e9b99(value, context):
    if value['sc_94bb09edc9966994'] != []:
        return None
    if value['sc_fc0e9a99163e9b99'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_fc0e9a99163e9b99', g.Invariant('/checkpoint/project_id', 'minLength at owner schema /properties/project_id/minLength'), 'schema_invalid', sc_fc0e9a99163e9b99),
    ])

    def check(value):
        table.require('sc_fc0e9a99163e9b99', value, context)
        return True
    return g.Case(table, check, context)

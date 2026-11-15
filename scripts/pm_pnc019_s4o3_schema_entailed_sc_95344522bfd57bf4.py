"""W3I schema guard table entailed_sc_95344522bfd57bf4 (generated).
sc_95344522bfd57bf4: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/project_id/minLength
Entailed after sc_17ccbcab9e965e30: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_95344522bfd57bf4(value, context):
    if value['sc_17ccbcab9e965e30'] != []:
        return None
    if value['sc_95344522bfd57bf4'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_95344522bfd57bf4', g.Invariant('/projection/project_id', 'minLength at owner schema /properties/project_id/minLength'), 'schema_invalid', sc_95344522bfd57bf4),
    ])

    def check(value):
        table.require('sc_95344522bfd57bf4', value, context)
        return True
    return g.Case(table, check, context)

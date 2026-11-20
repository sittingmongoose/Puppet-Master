"""W3I schema guard table entailed_sc_3f64ca7f07b1962c (generated).
sc_3f64ca7f07b1962c: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/hold_refs/items/minLength
Entailed after sc_8e9a6bd353ab1910: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_3f64ca7f07b1962c(value, context):
    if value['sc_8e9a6bd353ab1910'] != []:
        return None
    if value['sc_3f64ca7f07b1962c'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_3f64ca7f07b1962c', g.Invariant('/checkpoint/hold_refs/*', 'minLength at owner schema /properties/hold_refs/items/minLength'), 'schema_invalid', sc_3f64ca7f07b1962c),
    ])

    def check(value):
        table.require('sc_3f64ca7f07b1962c', value, context)
        return True
    return g.Case(table, check, context)

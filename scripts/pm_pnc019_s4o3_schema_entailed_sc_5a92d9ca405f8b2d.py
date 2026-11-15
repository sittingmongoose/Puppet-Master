"""W3I schema guard table entailed_sc_5a92d9ca405f8b2d (generated).
sc_5a92d9ca405f8b2d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/hold_refs/items/minLength
Entailed after sc_a6b0e2c2b7ac7801: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_5a92d9ca405f8b2d(value, context):
    if value['sc_a6b0e2c2b7ac7801'] != []:
        return None
    if value['sc_5a92d9ca405f8b2d'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_5a92d9ca405f8b2d', g.Invariant('/checkpoint/retired_publications/*/hold_refs/*', 'minLength at owner schema /properties/retired_publications/items/properties/hold_refs/items/minLength'), 'schema_invalid', sc_5a92d9ca405f8b2d),
    ])

    def check(value):
        table.require('sc_5a92d9ca405f8b2d', value, context)
        return True
    return g.Case(table, check, context)

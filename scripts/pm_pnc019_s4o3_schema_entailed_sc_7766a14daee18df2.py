"""W3I schema guard table entailed_sc_7766a14daee18df2 (generated).
sc_7766a14daee18df2: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/stream_id/minLength
Entailed after sc_d4875cd0d468e7cd: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_7766a14daee18df2(value, context):
    if value['sc_d4875cd0d468e7cd'] != []:
        return None
    if value['sc_7766a14daee18df2'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_7766a14daee18df2', g.Invariant('/checkpoint/retired_publications/*/stream_id', 'minLength at owner schema /properties/retired_publications/items/properties/stream_id/minLength'), 'schema_invalid', sc_7766a14daee18df2),
    ])

    def check(value):
        table.require('sc_7766a14daee18df2', value, context)
        return True
    return g.Case(table, check, context)

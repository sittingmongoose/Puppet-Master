"""W3I schema guard table entailed_sc_01ef6eda1a0f849c (generated).
sc_01ef6eda1a0f849c: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/publication_id/minLength
Entailed after sc_bd8e3174f1a95142: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_01ef6eda1a0f849c(value, context):
    if value['sc_bd8e3174f1a95142'] != []:
        return None
    if value['sc_01ef6eda1a0f849c'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_01ef6eda1a0f849c', g.Invariant('/checkpoint/retired_publications/*/publication_id', 'minLength at owner schema /properties/retired_publications/items/properties/publication_id/minLength'), 'schema_invalid', sc_01ef6eda1a0f849c),
    ])

    def check(value):
        table.require('sc_01ef6eda1a0f849c', value, context)
        return True
    return g.Case(table, check, context)

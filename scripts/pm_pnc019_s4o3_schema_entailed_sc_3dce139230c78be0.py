"""W3I schema guard table entailed_sc_3dce139230c78be0 (generated).
sc_3dce139230c78be0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/project_id/minLength
Entailed after sc_d93d7b24363c158c: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_3dce139230c78be0(value, context):
    if value['sc_d93d7b24363c158c'] != []:
        return None
    if value['sc_3dce139230c78be0'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_3dce139230c78be0', g.Invariant('/checkpoint/retired_publications/*/project_id', 'minLength at owner schema /properties/retired_publications/items/properties/project_id/minLength'), 'schema_invalid', sc_3dce139230c78be0),
    ])

    def check(value):
        table.require('sc_3dce139230c78be0', value, context)
        return True
    return g.Case(table, check, context)

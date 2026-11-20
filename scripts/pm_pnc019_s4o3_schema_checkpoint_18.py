"""W3I schema guard table checkpoint_18 (generated).
sc_d93d7b24363c158c: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/project_id/pattern
sc_b9f91498e7ef046e: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/project_id/not
sc_2ca5797c71971aee: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/stream_id/maxLength
sc_d4875cd0d468e7cd: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/stream_id/pattern
sc_7273b59c4d988bb8: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/stream_id/not
sc_4ce095844f7ec8e3: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/publication_id/maxLength
sc_bd8e3174f1a95142: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/publication_id/pattern
sc_80f11262d652d0fb: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/publication_id/not
"""
import pm_guard_isolation as g


def sc_d93d7b24363c158c(value, context):
    if value['sc_d93d7b24363c158c'] != []:
        return 'schema_invalid'
    return None


def sc_b9f91498e7ef046e(value, context):
    if value['sc_b9f91498e7ef046e'] != []:
        return 'schema_invalid'
    return None


def sc_2ca5797c71971aee(value, context):
    if value['sc_2ca5797c71971aee'] != []:
        return 'schema_invalid'
    return None


def sc_d4875cd0d468e7cd(value, context):
    if value['sc_d4875cd0d468e7cd'] != []:
        return 'schema_invalid'
    return None


def sc_7273b59c4d988bb8(value, context):
    if value['sc_7273b59c4d988bb8'] != []:
        return 'schema_invalid'
    return None


def sc_4ce095844f7ec8e3(value, context):
    if value['sc_4ce095844f7ec8e3'] != []:
        return 'schema_invalid'
    return None


def sc_bd8e3174f1a95142(value, context):
    if value['sc_bd8e3174f1a95142'] != []:
        return 'schema_invalid'
    return None


def sc_80f11262d652d0fb(value, context):
    if value['sc_80f11262d652d0fb'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_d93d7b24363c158c', g.Invariant('/checkpoint/retired_publications/*/project_id', 'pattern at owner schema /properties/retired_publications/items/properties/project_id/pattern'), 'schema_invalid', sc_d93d7b24363c158c),
        g.Guard('sc_b9f91498e7ef046e', g.Invariant('/checkpoint/retired_publications/*/project_id', 'not at owner schema /properties/retired_publications/items/properties/project_id/not'), 'schema_invalid', sc_b9f91498e7ef046e),
        g.Guard('sc_2ca5797c71971aee', g.Invariant('/checkpoint/retired_publications/*/stream_id', 'maxLength at owner schema /properties/retired_publications/items/properties/stream_id/maxLength'), 'schema_invalid', sc_2ca5797c71971aee),
        g.Guard('sc_d4875cd0d468e7cd', g.Invariant('/checkpoint/retired_publications/*/stream_id', 'pattern at owner schema /properties/retired_publications/items/properties/stream_id/pattern'), 'schema_invalid', sc_d4875cd0d468e7cd),
        g.Guard('sc_7273b59c4d988bb8', g.Invariant('/checkpoint/retired_publications/*/stream_id', 'not at owner schema /properties/retired_publications/items/properties/stream_id/not'), 'schema_invalid', sc_7273b59c4d988bb8),
        g.Guard('sc_4ce095844f7ec8e3', g.Invariant('/checkpoint/retired_publications/*/publication_id', 'maxLength at owner schema /properties/retired_publications/items/properties/publication_id/maxLength'), 'schema_invalid', sc_4ce095844f7ec8e3),
        g.Guard('sc_bd8e3174f1a95142', g.Invariant('/checkpoint/retired_publications/*/publication_id', 'pattern at owner schema /properties/retired_publications/items/properties/publication_id/pattern'), 'schema_invalid', sc_bd8e3174f1a95142),
        g.Guard('sc_80f11262d652d0fb', g.Invariant('/checkpoint/retired_publications/*/publication_id', 'not at owner schema /properties/retired_publications/items/properties/publication_id/not'), 'schema_invalid', sc_80f11262d652d0fb),
    ])

    def check(value):
        table.require('sc_d93d7b24363c158c', value, context)
        table.require('sc_b9f91498e7ef046e', value, context)
        table.require('sc_2ca5797c71971aee', value, context)
        table.require('sc_d4875cd0d468e7cd', value, context)
        table.require('sc_7273b59c4d988bb8', value, context)
        table.require('sc_4ce095844f7ec8e3', value, context)
        table.require('sc_bd8e3174f1a95142', value, context)
        table.require('sc_80f11262d652d0fb', value, context)
        return True
    return g.Case(table, check, context)

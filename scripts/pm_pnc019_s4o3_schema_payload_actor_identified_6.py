"""W3I schema guard table payload_actor_identified_6 (generated).
sc_bb73660b66717e12: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/created_at_utc/type
sc_af7f9c0db018900f: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/created_at_utc/format
sc_139d15462293d550: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/schema_id/const
sc_9e1db9ed4e5fcd52: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/schema_version/const
"""
import pm_guard_isolation as g


def sc_bb73660b66717e12(value, context):
    if value['sc_bb73660b66717e12'] != []:
        return 'schema_invalid'
    return None


def sc_af7f9c0db018900f(value, context):
    if value['sc_af7f9c0db018900f'] != []:
        return 'schema_invalid'
    return None


def sc_139d15462293d550(value, context):
    if value['sc_139d15462293d550'] != []:
        return 'schema_invalid'
    return None


def sc_9e1db9ed4e5fcd52(value, context):
    if value['sc_9e1db9ed4e5fcd52'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_bb73660b66717e12', g.Invariant('/payload_actor_identified/created_at_utc', 'type at owner schema /properties/created_at_utc/type'), 'schema_invalid', sc_bb73660b66717e12),
        g.Guard('sc_af7f9c0db018900f', g.Invariant('/payload_actor_identified/created_at_utc', 'format at owner schema /properties/created_at_utc/format'), 'schema_invalid', sc_af7f9c0db018900f),
        g.Guard('sc_139d15462293d550', g.Invariant('/payload_actor_identified/schema_id', 'const at owner schema /properties/schema_id/const'), 'schema_invalid', sc_139d15462293d550),
        g.Guard('sc_9e1db9ed4e5fcd52', g.Invariant('/payload_actor_identified/schema_version', 'const at owner schema /properties/schema_version/const'), 'schema_invalid', sc_9e1db9ed4e5fcd52),
    ])

    def check(value):
        table.require('sc_bb73660b66717e12', value, context)
        table.require('sc_af7f9c0db018900f', value, context)
        table.require('sc_139d15462293d550', value, context)
        table.require('sc_9e1db9ed4e5fcd52', value, context)
        return True
    return g.Case(table, check, context)

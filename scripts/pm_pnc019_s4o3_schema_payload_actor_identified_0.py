"""W3I schema guard table payload_actor_identified_0 (generated).
sc_b06184a1ab3d7089: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/type
sc_be2d59e8980b9595: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/project_id
sc_b85683aa9722b607: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/continuity_id
sc_6fdcd7e3a3a5261b: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/stream_id
sc_dd55d19e613f37a7: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/fact_ref
sc_b122b98d3df3b831: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/actor_ref
sc_72dad46e2ea925b0: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/actor_kind
sc_96ecbba28d249c47: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/source_event_id
"""
import pm_guard_isolation as g


def sc_b06184a1ab3d7089(value, context):
    if value['sc_b06184a1ab3d7089'] != []:
        return 'schema_invalid'
    return None


def sc_be2d59e8980b9595(value, context):
    if value['sc_be2d59e8980b9595'] != []:
        return 'schema_invalid'
    return None


def sc_b85683aa9722b607(value, context):
    if value['sc_b85683aa9722b607'] != []:
        return 'schema_invalid'
    return None


def sc_6fdcd7e3a3a5261b(value, context):
    if value['sc_6fdcd7e3a3a5261b'] != []:
        return 'schema_invalid'
    return None


def sc_dd55d19e613f37a7(value, context):
    if value['sc_dd55d19e613f37a7'] != []:
        return 'schema_invalid'
    return None


def sc_b122b98d3df3b831(value, context):
    if value['sc_b122b98d3df3b831'] != []:
        return 'schema_invalid'
    return None


def sc_72dad46e2ea925b0(value, context):
    if value['sc_72dad46e2ea925b0'] != []:
        return 'schema_invalid'
    return None


def sc_96ecbba28d249c47(value, context):
    if value['sc_96ecbba28d249c47'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_b06184a1ab3d7089', g.Invariant('/payload_actor_identified/', 'type at owner schema /type'), 'schema_invalid', sc_b06184a1ab3d7089),
        g.Guard('sc_be2d59e8980b9595', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/project_id'), 'schema_invalid', sc_be2d59e8980b9595),
        g.Guard('sc_b85683aa9722b607', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/continuity_id'), 'schema_invalid', sc_b85683aa9722b607),
        g.Guard('sc_6fdcd7e3a3a5261b', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/stream_id'), 'schema_invalid', sc_6fdcd7e3a3a5261b),
        g.Guard('sc_dd55d19e613f37a7', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/fact_ref'), 'schema_invalid', sc_dd55d19e613f37a7),
        g.Guard('sc_b122b98d3df3b831', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/actor_ref'), 'schema_invalid', sc_b122b98d3df3b831),
        g.Guard('sc_72dad46e2ea925b0', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/actor_kind'), 'schema_invalid', sc_72dad46e2ea925b0),
        g.Guard('sc_96ecbba28d249c47', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/source_event_id'), 'schema_invalid', sc_96ecbba28d249c47),
    ])

    def check(value):
        table.require('sc_b06184a1ab3d7089', value, context)
        table.require('sc_be2d59e8980b9595', value, context)
        table.require('sc_b85683aa9722b607', value, context)
        table.require('sc_6fdcd7e3a3a5261b', value, context)
        table.require('sc_dd55d19e613f37a7', value, context)
        table.require('sc_b122b98d3df3b831', value, context)
        table.require('sc_72dad46e2ea925b0', value, context)
        table.require('sc_96ecbba28d249c47', value, context)
        return True
    return g.Case(table, check, context)

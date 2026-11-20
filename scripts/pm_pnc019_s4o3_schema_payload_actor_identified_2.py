"""W3I schema guard table payload_actor_identified_2 (generated).
sc_b3ac40285e1cbbc0: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/project_id/pattern
sc_39dfd545abdb634a: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/project_id/not
sc_768df982a831bcd4: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/continuity_id/maxLength
sc_ab8ce6f57b0ded41: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/continuity_id/pattern
sc_ba58180066b6b7c3: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/continuity_id/not
sc_aec7ab27c2804bb2: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/stream_id/maxLength
sc_a62f2471069183d8: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/stream_id/pattern
sc_0b29ded9c8368263: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/stream_id/not
"""
import pm_guard_isolation as g


def sc_b3ac40285e1cbbc0(value, context):
    if value['sc_b3ac40285e1cbbc0'] != []:
        return 'schema_invalid'
    return None


def sc_39dfd545abdb634a(value, context):
    if value['sc_39dfd545abdb634a'] != []:
        return 'schema_invalid'
    return None


def sc_768df982a831bcd4(value, context):
    if value['sc_768df982a831bcd4'] != []:
        return 'schema_invalid'
    return None


def sc_ab8ce6f57b0ded41(value, context):
    if value['sc_ab8ce6f57b0ded41'] != []:
        return 'schema_invalid'
    return None


def sc_ba58180066b6b7c3(value, context):
    if value['sc_ba58180066b6b7c3'] != []:
        return 'schema_invalid'
    return None


def sc_aec7ab27c2804bb2(value, context):
    if value['sc_aec7ab27c2804bb2'] != []:
        return 'schema_invalid'
    return None


def sc_a62f2471069183d8(value, context):
    if value['sc_a62f2471069183d8'] != []:
        return 'schema_invalid'
    return None


def sc_0b29ded9c8368263(value, context):
    if value['sc_0b29ded9c8368263'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_b3ac40285e1cbbc0', g.Invariant('/payload_actor_identified/project_id', 'pattern at owner schema /properties/project_id/pattern'), 'schema_invalid', sc_b3ac40285e1cbbc0),
        g.Guard('sc_39dfd545abdb634a', g.Invariant('/payload_actor_identified/project_id', 'not at owner schema /properties/project_id/not'), 'schema_invalid', sc_39dfd545abdb634a),
        g.Guard('sc_768df982a831bcd4', g.Invariant('/payload_actor_identified/continuity_id', 'maxLength at owner schema /properties/continuity_id/maxLength'), 'schema_invalid', sc_768df982a831bcd4),
        g.Guard('sc_ab8ce6f57b0ded41', g.Invariant('/payload_actor_identified/continuity_id', 'pattern at owner schema /properties/continuity_id/pattern'), 'schema_invalid', sc_ab8ce6f57b0ded41),
        g.Guard('sc_ba58180066b6b7c3', g.Invariant('/payload_actor_identified/continuity_id', 'not at owner schema /properties/continuity_id/not'), 'schema_invalid', sc_ba58180066b6b7c3),
        g.Guard('sc_aec7ab27c2804bb2', g.Invariant('/payload_actor_identified/stream_id', 'maxLength at owner schema /properties/stream_id/maxLength'), 'schema_invalid', sc_aec7ab27c2804bb2),
        g.Guard('sc_a62f2471069183d8', g.Invariant('/payload_actor_identified/stream_id', 'pattern at owner schema /properties/stream_id/pattern'), 'schema_invalid', sc_a62f2471069183d8),
        g.Guard('sc_0b29ded9c8368263', g.Invariant('/payload_actor_identified/stream_id', 'not at owner schema /properties/stream_id/not'), 'schema_invalid', sc_0b29ded9c8368263),
    ])

    def check(value):
        table.require('sc_b3ac40285e1cbbc0', value, context)
        table.require('sc_39dfd545abdb634a', value, context)
        table.require('sc_768df982a831bcd4', value, context)
        table.require('sc_ab8ce6f57b0ded41', value, context)
        table.require('sc_ba58180066b6b7c3', value, context)
        table.require('sc_aec7ab27c2804bb2', value, context)
        table.require('sc_a62f2471069183d8', value, context)
        table.require('sc_0b29ded9c8368263', value, context)
        return True
    return g.Case(table, check, context)

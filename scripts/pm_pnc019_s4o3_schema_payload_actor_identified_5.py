"""W3I schema guard table payload_actor_identified_5 (generated).
sc_d7e967cad8019ffb: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/redaction_profile_id/pattern
sc_7e0bb7e42e882e32: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/redaction_profile_id/not
sc_202dfb0d7e5629be: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/redaction_decision/maxLength
sc_7f06ada0e233aa47: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/redaction_decision/pattern
sc_a71c27f8545a4d07: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/redaction_decision/not
sc_18deaa09d45fc83c: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/replay_checkpoint_ref/maxLength
sc_2d18478ea473aac3: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/replay_checkpoint_ref/pattern
sc_fc0df172dee39024: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/replay_checkpoint_ref/not
"""
import pm_guard_isolation as g


def sc_d7e967cad8019ffb(value, context):
    if value['sc_d7e967cad8019ffb'] != []:
        return 'schema_invalid'
    return None


def sc_7e0bb7e42e882e32(value, context):
    if value['sc_7e0bb7e42e882e32'] != []:
        return 'schema_invalid'
    return None


def sc_202dfb0d7e5629be(value, context):
    if value['sc_202dfb0d7e5629be'] != []:
        return 'schema_invalid'
    return None


def sc_7f06ada0e233aa47(value, context):
    if value['sc_7f06ada0e233aa47'] != []:
        return 'schema_invalid'
    return None


def sc_a71c27f8545a4d07(value, context):
    if value['sc_a71c27f8545a4d07'] != []:
        return 'schema_invalid'
    return None


def sc_18deaa09d45fc83c(value, context):
    if value['sc_18deaa09d45fc83c'] != []:
        return 'schema_invalid'
    return None


def sc_2d18478ea473aac3(value, context):
    if value['sc_2d18478ea473aac3'] != []:
        return 'schema_invalid'
    return None


def sc_fc0df172dee39024(value, context):
    if value['sc_fc0df172dee39024'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_d7e967cad8019ffb', g.Invariant('/payload_actor_identified/redaction_profile_id', 'pattern at owner schema /properties/redaction_profile_id/pattern'), 'schema_invalid', sc_d7e967cad8019ffb),
        g.Guard('sc_7e0bb7e42e882e32', g.Invariant('/payload_actor_identified/redaction_profile_id', 'not at owner schema /properties/redaction_profile_id/not'), 'schema_invalid', sc_7e0bb7e42e882e32),
        g.Guard('sc_202dfb0d7e5629be', g.Invariant('/payload_actor_identified/redaction_decision', 'maxLength at owner schema /properties/redaction_decision/maxLength'), 'schema_invalid', sc_202dfb0d7e5629be),
        g.Guard('sc_7f06ada0e233aa47', g.Invariant('/payload_actor_identified/redaction_decision', 'pattern at owner schema /properties/redaction_decision/pattern'), 'schema_invalid', sc_7f06ada0e233aa47),
        g.Guard('sc_a71c27f8545a4d07', g.Invariant('/payload_actor_identified/redaction_decision', 'not at owner schema /properties/redaction_decision/not'), 'schema_invalid', sc_a71c27f8545a4d07),
        g.Guard('sc_18deaa09d45fc83c', g.Invariant('/payload_actor_identified/replay_checkpoint_ref', 'maxLength at owner schema /properties/replay_checkpoint_ref/maxLength'), 'schema_invalid', sc_18deaa09d45fc83c),
        g.Guard('sc_2d18478ea473aac3', g.Invariant('/payload_actor_identified/replay_checkpoint_ref', 'pattern at owner schema /properties/replay_checkpoint_ref/pattern'), 'schema_invalid', sc_2d18478ea473aac3),
        g.Guard('sc_fc0df172dee39024', g.Invariant('/payload_actor_identified/replay_checkpoint_ref', 'not at owner schema /properties/replay_checkpoint_ref/not'), 'schema_invalid', sc_fc0df172dee39024),
    ])

    def check(value):
        table.require('sc_d7e967cad8019ffb', value, context)
        table.require('sc_7e0bb7e42e882e32', value, context)
        table.require('sc_202dfb0d7e5629be', value, context)
        table.require('sc_7f06ada0e233aa47', value, context)
        table.require('sc_a71c27f8545a4d07', value, context)
        table.require('sc_18deaa09d45fc83c', value, context)
        table.require('sc_2d18478ea473aac3', value, context)
        table.require('sc_fc0df172dee39024', value, context)
        return True
    return g.Case(table, check, context)

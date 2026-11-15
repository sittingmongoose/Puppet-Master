"""W3I schema guard table checkpoint_13 (generated).
sc_8cb0abe1058d187a: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern
sc_781481e69e0724f2: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type
sc_331f7b4069dce058: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern
sc_8ef9e71b0070cdde: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type
sc_f2eb8c18b0c04cc5: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern
sc_de6aaa4ee245b424: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_through_sequence_id/type
sc_5d9a5fec5aff8418: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_through_sequence_id/minimum
sc_e139989a0bd68916: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_through_sequence_id/maximum
"""
import pm_guard_isolation as g


def sc_8cb0abe1058d187a(value, context):
    if value['sc_8cb0abe1058d187a'] != []:
        return 'schema_invalid'
    return None


def sc_781481e69e0724f2(value, context):
    if value['sc_781481e69e0724f2'] != []:
        return 'schema_invalid'
    return None


def sc_331f7b4069dce058(value, context):
    if value['sc_331f7b4069dce058'] != []:
        return 'schema_invalid'
    return None


def sc_8ef9e71b0070cdde(value, context):
    if value['sc_8ef9e71b0070cdde'] != []:
        return 'schema_invalid'
    return None


def sc_f2eb8c18b0c04cc5(value, context):
    if value['sc_f2eb8c18b0c04cc5'] != []:
        return 'schema_invalid'
    return None


def sc_de6aaa4ee245b424(value, context):
    if value['sc_de6aaa4ee245b424'] != []:
        return 'schema_invalid'
    return None


def sc_5d9a5fec5aff8418(value, context):
    if value['sc_5d9a5fec5aff8418'] != []:
        return 'schema_invalid'
    return None


def sc_e139989a0bd68916(value, context):
    if value['sc_e139989a0bd68916'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_8cb0abe1058d187a', g.Invariant('/checkpoint/index_read_token/source_selection/durable_watermarks_sha256', 'pattern at owner schema /properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern'), 'schema_invalid', sc_8cb0abe1058d187a),
        g.Guard('sc_781481e69e0724f2', g.Invariant('/checkpoint/index_read_token/source_selection/excluded_ranges_sha256', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type'), 'schema_invalid', sc_781481e69e0724f2),
        g.Guard('sc_331f7b4069dce058', g.Invariant('/checkpoint/index_read_token/source_selection/excluded_ranges_sha256', 'pattern at owner schema /properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern'), 'schema_invalid', sc_331f7b4069dce058),
        g.Guard('sc_8ef9e71b0070cdde', g.Invariant('/checkpoint/index_read_token/source_selection/retired_inputs_sha256', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type'), 'schema_invalid', sc_8ef9e71b0070cdde),
        g.Guard('sc_f2eb8c18b0c04cc5', g.Invariant('/checkpoint/index_read_token/source_selection/retired_inputs_sha256', 'pattern at owner schema /properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern'), 'schema_invalid', sc_f2eb8c18b0c04cc5),
        g.Guard('sc_de6aaa4ee245b424', g.Invariant('/checkpoint/index_through_sequence_id', 'type at owner schema /properties/index_through_sequence_id/type'), 'schema_invalid', sc_de6aaa4ee245b424),
        g.Guard('sc_5d9a5fec5aff8418', g.Invariant('/checkpoint/index_through_sequence_id', 'minimum at owner schema /properties/index_through_sequence_id/minimum'), 'schema_invalid', sc_5d9a5fec5aff8418),
        g.Guard('sc_e139989a0bd68916', g.Invariant('/checkpoint/index_through_sequence_id', 'maximum at owner schema /properties/index_through_sequence_id/maximum'), 'schema_invalid', sc_e139989a0bd68916),
    ])

    def check(value):
        table.require('sc_8cb0abe1058d187a', value, context)
        table.require('sc_781481e69e0724f2', value, context)
        table.require('sc_331f7b4069dce058', value, context)
        table.require('sc_8ef9e71b0070cdde', value, context)
        table.require('sc_f2eb8c18b0c04cc5', value, context)
        table.require('sc_de6aaa4ee245b424', value, context)
        table.require('sc_5d9a5fec5aff8418', value, context)
        table.require('sc_e139989a0bd68916', value, context)
        return True
    return g.Case(table, check, context)

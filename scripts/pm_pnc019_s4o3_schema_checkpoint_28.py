"""W3I schema guard table checkpoint_28 (generated).
sc_dcda26b4d1c89e96: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type
sc_13561b7b4bb3233f: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern
sc_c2ad2a71ccf2c4e6: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_through_sequence_id/type
sc_fb4fc8f7983d3b71: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_through_sequence_id/minimum
sc_bcb98c62b9d3e000: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_through_sequence_id/maximum
sc_1a8a274fbeda3667: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/source_cursor/anyOf
sc_378371a8c33411ba: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/filter_complete/const
sc_30105657c3eefc67: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/state/enum
"""
import pm_guard_isolation as g


def sc_dcda26b4d1c89e96(value, context):
    if value['sc_dcda26b4d1c89e96'] != []:
        return 'schema_invalid'
    return None


def sc_13561b7b4bb3233f(value, context):
    if value['sc_13561b7b4bb3233f'] != []:
        return 'schema_invalid'
    return None


def sc_c2ad2a71ccf2c4e6(value, context):
    if value['sc_c2ad2a71ccf2c4e6'] != []:
        return 'schema_invalid'
    return None


def sc_fb4fc8f7983d3b71(value, context):
    if value['sc_fb4fc8f7983d3b71'] != []:
        return 'schema_invalid'
    return None


def sc_bcb98c62b9d3e000(value, context):
    if value['sc_bcb98c62b9d3e000'] != []:
        return 'schema_invalid'
    return None


def sc_1a8a274fbeda3667(value, context):
    if value['sc_1a8a274fbeda3667'] != []:
        return 'schema_invalid'
    return None


def sc_378371a8c33411ba(value, context):
    if value['sc_378371a8c33411ba'] != []:
        return 'schema_invalid'
    return None


def sc_30105657c3eefc67(value, context):
    if value['sc_30105657c3eefc67'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_dcda26b4d1c89e96', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/retired_inputs_sha256', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type'), 'schema_invalid', sc_dcda26b4d1c89e96),
        g.Guard('sc_13561b7b4bb3233f', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/retired_inputs_sha256', 'pattern at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern'), 'schema_invalid', sc_13561b7b4bb3233f),
        g.Guard('sc_c2ad2a71ccf2c4e6', g.Invariant('/checkpoint/retired_publications/*/index_through_sequence_id', 'type at owner schema /properties/retired_publications/items/properties/index_through_sequence_id/type'), 'schema_invalid', sc_c2ad2a71ccf2c4e6),
        g.Guard('sc_fb4fc8f7983d3b71', g.Invariant('/checkpoint/retired_publications/*/index_through_sequence_id', 'minimum at owner schema /properties/retired_publications/items/properties/index_through_sequence_id/minimum'), 'schema_invalid', sc_fb4fc8f7983d3b71),
        g.Guard('sc_bcb98c62b9d3e000', g.Invariant('/checkpoint/retired_publications/*/index_through_sequence_id', 'maximum at owner schema /properties/retired_publications/items/properties/index_through_sequence_id/maximum'), 'schema_invalid', sc_bcb98c62b9d3e000),
        g.Guard('sc_1a8a274fbeda3667', g.Invariant('/checkpoint/retired_publications/*/source_cursor', 'anyOf at owner schema /properties/retired_publications/items/properties/source_cursor/anyOf'), 'schema_invalid', sc_1a8a274fbeda3667),
        g.Guard('sc_378371a8c33411ba', g.Invariant('/checkpoint/retired_publications/*/filter_complete', 'const at owner schema /properties/retired_publications/items/properties/filter_complete/const'), 'schema_invalid', sc_378371a8c33411ba),
        g.Guard('sc_30105657c3eefc67', g.Invariant('/checkpoint/retired_publications/*/state', 'enum at owner schema /properties/retired_publications/items/properties/state/enum'), 'schema_invalid', sc_30105657c3eefc67),
    ])

    def check(value):
        table.require('sc_dcda26b4d1c89e96', value, context)
        table.require('sc_13561b7b4bb3233f', value, context)
        table.require('sc_c2ad2a71ccf2c4e6', value, context)
        table.require('sc_fb4fc8f7983d3b71', value, context)
        table.require('sc_bcb98c62b9d3e000', value, context)
        table.require('sc_1a8a274fbeda3667', value, context)
        table.require('sc_378371a8c33411ba', value, context)
        table.require('sc_30105657c3eefc67', value, context)
        return True
    return g.Case(table, check, context)

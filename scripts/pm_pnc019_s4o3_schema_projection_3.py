"""W3I schema guard table projection_3 (generated).
sc_32ae6bdf83f0bb71: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/event_id/pattern
sc_496bfea35d873a4a: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/event_id/not
sc_8bb9f9c9932ee7ba: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/publication_id/maxLength
sc_677c33d475967725: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/publication_id/pattern
sc_df6f1fd67e961cc4: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/publication_id/not
sc_1e45124842a84589: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/event_type/enum
sc_0b8b53c6f1f7bd8a: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/sequence_id/type
sc_6c86f373cd5bc30e: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/sequence_id/minimum
"""
import pm_guard_isolation as g


def sc_32ae6bdf83f0bb71(value, context):
    if value['sc_32ae6bdf83f0bb71'] != []:
        return 'schema_invalid'
    return None


def sc_496bfea35d873a4a(value, context):
    if value['sc_496bfea35d873a4a'] != []:
        return 'schema_invalid'
    return None


def sc_8bb9f9c9932ee7ba(value, context):
    if value['sc_8bb9f9c9932ee7ba'] != []:
        return 'schema_invalid'
    return None


def sc_677c33d475967725(value, context):
    if value['sc_677c33d475967725'] != []:
        return 'schema_invalid'
    return None


def sc_df6f1fd67e961cc4(value, context):
    if value['sc_df6f1fd67e961cc4'] != []:
        return 'schema_invalid'
    return None


def sc_1e45124842a84589(value, context):
    if value['sc_1e45124842a84589'] != []:
        return 'schema_invalid'
    return None


def sc_0b8b53c6f1f7bd8a(value, context):
    if value['sc_0b8b53c6f1f7bd8a'] != []:
        return 'schema_invalid'
    return None


def sc_6c86f373cd5bc30e(value, context):
    if value['sc_6c86f373cd5bc30e'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_32ae6bdf83f0bb71', g.Invariant('/projection/event_id', 'pattern at owner schema /properties/event_id/pattern'), 'schema_invalid', sc_32ae6bdf83f0bb71),
        g.Guard('sc_496bfea35d873a4a', g.Invariant('/projection/event_id', 'not at owner schema /properties/event_id/not'), 'schema_invalid', sc_496bfea35d873a4a),
        g.Guard('sc_8bb9f9c9932ee7ba', g.Invariant('/projection/publication_id', 'maxLength at owner schema /properties/publication_id/maxLength'), 'schema_invalid', sc_8bb9f9c9932ee7ba),
        g.Guard('sc_677c33d475967725', g.Invariant('/projection/publication_id', 'pattern at owner schema /properties/publication_id/pattern'), 'schema_invalid', sc_677c33d475967725),
        g.Guard('sc_df6f1fd67e961cc4', g.Invariant('/projection/publication_id', 'not at owner schema /properties/publication_id/not'), 'schema_invalid', sc_df6f1fd67e961cc4),
        g.Guard('sc_1e45124842a84589', g.Invariant('/projection/event_type', 'enum at owner schema /properties/event_type/enum'), 'schema_invalid', sc_1e45124842a84589),
        g.Guard('sc_0b8b53c6f1f7bd8a', g.Invariant('/projection/sequence_id', 'type at owner schema /properties/sequence_id/type'), 'schema_invalid', sc_0b8b53c6f1f7bd8a),
        g.Guard('sc_6c86f373cd5bc30e', g.Invariant('/projection/sequence_id', 'minimum at owner schema /properties/sequence_id/minimum'), 'schema_invalid', sc_6c86f373cd5bc30e),
    ])

    def check(value):
        table.require('sc_32ae6bdf83f0bb71', value, context)
        table.require('sc_496bfea35d873a4a', value, context)
        table.require('sc_8bb9f9c9932ee7ba', value, context)
        table.require('sc_677c33d475967725', value, context)
        table.require('sc_df6f1fd67e961cc4', value, context)
        table.require('sc_1e45124842a84589', value, context)
        table.require('sc_0b8b53c6f1f7bd8a', value, context)
        table.require('sc_6c86f373cd5bc30e', value, context)
        return True
    return g.Case(table, check, context)

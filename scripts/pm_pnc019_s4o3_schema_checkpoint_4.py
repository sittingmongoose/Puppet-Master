"""W3I schema guard table checkpoint_4 (generated).
sc_e1a0c381499edaa0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/publication_id/maxLength
sc_7ac7bbcd140fbaa9: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/publication_id/pattern
sc_64396ebfdeca47d3: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/publication_id/not
sc_2d938cf64a771a7a: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types/type
sc_24c14a7c40e4f5f4: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types/minItems
sc_f4e471f2a85c03c0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types/uniqueItems
sc_b2c2145fb81019c0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types/items/enum
sc_7faef3b9d64f7007: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/type
"""
import pm_guard_isolation as g


def sc_e1a0c381499edaa0(value, context):
    if value['sc_e1a0c381499edaa0'] != []:
        return 'schema_invalid'
    return None


def sc_7ac7bbcd140fbaa9(value, context):
    if value['sc_7ac7bbcd140fbaa9'] != []:
        return 'schema_invalid'
    return None


def sc_64396ebfdeca47d3(value, context):
    if value['sc_64396ebfdeca47d3'] != []:
        return 'schema_invalid'
    return None


def sc_2d938cf64a771a7a(value, context):
    if value['sc_2d938cf64a771a7a'] != []:
        return 'schema_invalid'
    return None


def sc_24c14a7c40e4f5f4(value, context):
    if value['sc_24c14a7c40e4f5f4'] != []:
        return 'schema_invalid'
    return None


def sc_f4e471f2a85c03c0(value, context):
    if value['sc_f4e471f2a85c03c0'] != []:
        return 'schema_invalid'
    return None


def sc_b2c2145fb81019c0(value, context):
    if value['sc_b2c2145fb81019c0'] != []:
        return 'schema_invalid'
    return None


def sc_7faef3b9d64f7007(value, context):
    if value['sc_7faef3b9d64f7007'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_e1a0c381499edaa0', g.Invariant('/checkpoint/publication_id', 'maxLength at owner schema /properties/publication_id/maxLength'), 'schema_invalid', sc_e1a0c381499edaa0),
        g.Guard('sc_7ac7bbcd140fbaa9', g.Invariant('/checkpoint/publication_id', 'pattern at owner schema /properties/publication_id/pattern'), 'schema_invalid', sc_7ac7bbcd140fbaa9),
        g.Guard('sc_64396ebfdeca47d3', g.Invariant('/checkpoint/publication_id', 'not at owner schema /properties/publication_id/not'), 'schema_invalid', sc_64396ebfdeca47d3),
        g.Guard('sc_2d938cf64a771a7a', g.Invariant('/checkpoint/admitted_event_types', 'type at owner schema /properties/admitted_event_types/type'), 'schema_invalid', sc_2d938cf64a771a7a),
        g.Guard('sc_24c14a7c40e4f5f4', g.Invariant('/checkpoint/admitted_event_types', 'minItems at owner schema /properties/admitted_event_types/minItems'), 'schema_invalid', sc_24c14a7c40e4f5f4),
        g.Guard('sc_f4e471f2a85c03c0', g.Invariant('/checkpoint/admitted_event_types', 'uniqueItems at owner schema /properties/admitted_event_types/uniqueItems'), 'schema_invalid', sc_f4e471f2a85c03c0),
        g.Guard('sc_b2c2145fb81019c0', g.Invariant('/checkpoint/admitted_event_types/*', 'enum at owner schema /properties/admitted_event_types/items/enum'), 'schema_invalid', sc_b2c2145fb81019c0),
        g.Guard('sc_7faef3b9d64f7007', g.Invariant('/checkpoint/index_read_token', 'type at owner schema /properties/index_read_token/type'), 'schema_invalid', sc_7faef3b9d64f7007),
    ])

    def check(value):
        table.require('sc_e1a0c381499edaa0', value, context)
        table.require('sc_7ac7bbcd140fbaa9', value, context)
        table.require('sc_64396ebfdeca47d3', value, context)
        table.require('sc_2d938cf64a771a7a', value, context)
        table.require('sc_24c14a7c40e4f5f4', value, context)
        table.require('sc_f4e471f2a85c03c0', value, context)
        table.require('sc_b2c2145fb81019c0', value, context)
        table.require('sc_7faef3b9d64f7007', value, context)
        return True
    return g.Case(table, check, context)

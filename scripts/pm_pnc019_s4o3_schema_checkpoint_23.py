"""W3I schema guard table checkpoint_23 (generated).
sc_999184e1444c30bc: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/type
sc_1ce0b5f6fa1e75d8: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/storage_instance_id
sc_b4435c5ce3b8a954: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/current_ref
sc_15caf453dada023a: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/current_bytes_sha256
sc_6af8954491014e00: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/selected_segment_generation
sc_74c7a6ba1dbce7e0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/manifest_ref
sc_e26586439e3c2693: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/manifest_bytes_sha256
sc_4493175984570d19: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/manifest_generation
"""
import pm_guard_isolation as g


def sc_999184e1444c30bc(value, context):
    if value['sc_999184e1444c30bc'] != []:
        return 'schema_invalid'
    return None


def sc_1ce0b5f6fa1e75d8(value, context):
    if value['sc_1ce0b5f6fa1e75d8'] != []:
        return 'schema_invalid'
    return None


def sc_b4435c5ce3b8a954(value, context):
    if value['sc_b4435c5ce3b8a954'] != []:
        return 'schema_invalid'
    return None


def sc_15caf453dada023a(value, context):
    if value['sc_15caf453dada023a'] != []:
        return 'schema_invalid'
    return None


def sc_6af8954491014e00(value, context):
    if value['sc_6af8954491014e00'] != []:
        return 'schema_invalid'
    return None


def sc_74c7a6ba1dbce7e0(value, context):
    if value['sc_74c7a6ba1dbce7e0'] != []:
        return 'schema_invalid'
    return None


def sc_e26586439e3c2693(value, context):
    if value['sc_e26586439e3c2693'] != []:
        return 'schema_invalid'
    return None


def sc_4493175984570d19(value, context):
    if value['sc_4493175984570d19'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_999184e1444c30bc', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/type'), 'schema_invalid', sc_999184e1444c30bc),
        g.Guard('sc_1ce0b5f6fa1e75d8', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/storage_instance_id'), 'schema_invalid', sc_1ce0b5f6fa1e75d8),
        g.Guard('sc_b4435c5ce3b8a954', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/current_ref'), 'schema_invalid', sc_b4435c5ce3b8a954),
        g.Guard('sc_15caf453dada023a', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/current_bytes_sha256'), 'schema_invalid', sc_15caf453dada023a),
        g.Guard('sc_6af8954491014e00', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/selected_segment_generation'), 'schema_invalid', sc_6af8954491014e00),
        g.Guard('sc_74c7a6ba1dbce7e0', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/manifest_ref'), 'schema_invalid', sc_74c7a6ba1dbce7e0),
        g.Guard('sc_e26586439e3c2693', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/manifest_bytes_sha256'), 'schema_invalid', sc_e26586439e3c2693),
        g.Guard('sc_4493175984570d19', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/manifest_generation'), 'schema_invalid', sc_4493175984570d19),
    ])

    def check(value):
        table.require('sc_999184e1444c30bc', value, context)
        table.require('sc_1ce0b5f6fa1e75d8', value, context)
        table.require('sc_b4435c5ce3b8a954', value, context)
        table.require('sc_15caf453dada023a', value, context)
        table.require('sc_6af8954491014e00', value, context)
        table.require('sc_74c7a6ba1dbce7e0', value, context)
        table.require('sc_e26586439e3c2693', value, context)
        table.require('sc_4493175984570d19', value, context)
        return True
    return g.Case(table, check, context)

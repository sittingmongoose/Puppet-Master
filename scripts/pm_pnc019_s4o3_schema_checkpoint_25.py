"""W3I schema guard table checkpoint_25 (generated).
sc_aa5845684d59fe2e: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/storage_instance_id/format
sc_668a4f2372910172: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/current_ref/const
sc_26a082d7c9c1d7c0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type
sc_26c8abedbedec74d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern
sc_48175ab107a2defd: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type
sc_ef216d352fa8e571: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum
sc_634d2a5591b6cec3: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum
sc_f041c5739e4c62b4: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_ref/const
"""
import pm_guard_isolation as g


def sc_aa5845684d59fe2e(value, context):
    if value['sc_aa5845684d59fe2e'] != []:
        return 'schema_invalid'
    return None


def sc_668a4f2372910172(value, context):
    if value['sc_668a4f2372910172'] != []:
        return 'schema_invalid'
    return None


def sc_26a082d7c9c1d7c0(value, context):
    if value['sc_26a082d7c9c1d7c0'] != []:
        return 'schema_invalid'
    return None


def sc_26c8abedbedec74d(value, context):
    if value['sc_26c8abedbedec74d'] != []:
        return 'schema_invalid'
    return None


def sc_48175ab107a2defd(value, context):
    if value['sc_48175ab107a2defd'] != []:
        return 'schema_invalid'
    return None


def sc_ef216d352fa8e571(value, context):
    if value['sc_ef216d352fa8e571'] != []:
        return 'schema_invalid'
    return None


def sc_634d2a5591b6cec3(value, context):
    if value['sc_634d2a5591b6cec3'] != []:
        return 'schema_invalid'
    return None


def sc_f041c5739e4c62b4(value, context):
    if value['sc_f041c5739e4c62b4'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_aa5845684d59fe2e', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/storage_instance_id', 'format at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/storage_instance_id/format'), 'schema_invalid', sc_aa5845684d59fe2e),
        g.Guard('sc_668a4f2372910172', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/current_ref', 'const at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/current_ref/const'), 'schema_invalid', sc_668a4f2372910172),
        g.Guard('sc_26a082d7c9c1d7c0', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/current_bytes_sha256', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type'), 'schema_invalid', sc_26a082d7c9c1d7c0),
        g.Guard('sc_26c8abedbedec74d', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/current_bytes_sha256', 'pattern at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern'), 'schema_invalid', sc_26c8abedbedec74d),
        g.Guard('sc_48175ab107a2defd', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/selected_segment_generation', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type'), 'schema_invalid', sc_48175ab107a2defd),
        g.Guard('sc_ef216d352fa8e571', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/selected_segment_generation', 'minimum at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum'), 'schema_invalid', sc_ef216d352fa8e571),
        g.Guard('sc_634d2a5591b6cec3', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/selected_segment_generation', 'maximum at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum'), 'schema_invalid', sc_634d2a5591b6cec3),
        g.Guard('sc_f041c5739e4c62b4', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/manifest_ref', 'const at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_ref/const'), 'schema_invalid', sc_f041c5739e4c62b4),
    ])

    def check(value):
        table.require('sc_aa5845684d59fe2e', value, context)
        table.require('sc_668a4f2372910172', value, context)
        table.require('sc_26a082d7c9c1d7c0', value, context)
        table.require('sc_26c8abedbedec74d', value, context)
        table.require('sc_48175ab107a2defd', value, context)
        table.require('sc_ef216d352fa8e571', value, context)
        table.require('sc_634d2a5591b6cec3', value, context)
        table.require('sc_f041c5739e4c62b4', value, context)
        return True
    return g.Case(table, check, context)

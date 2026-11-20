"""W3I schema guard table checkpoint_26 (generated).
sc_34b16e95f4e2e2cd: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type
sc_7546c5a20c44de08: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern
sc_d1ec743f8ef2018d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_generation/type
sc_ad30af33d1be7d69: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum
sc_5ece135f70f29833: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum
sc_3c2b2a535d51a78a: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/recovery_epoch/type
sc_af97d509659a7189: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum
sc_05ceeabe0424a495: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum
"""
import pm_guard_isolation as g


def sc_34b16e95f4e2e2cd(value, context):
    if value['sc_34b16e95f4e2e2cd'] != []:
        return 'schema_invalid'
    return None


def sc_7546c5a20c44de08(value, context):
    if value['sc_7546c5a20c44de08'] != []:
        return 'schema_invalid'
    return None


def sc_d1ec743f8ef2018d(value, context):
    if value['sc_d1ec743f8ef2018d'] != []:
        return 'schema_invalid'
    return None


def sc_ad30af33d1be7d69(value, context):
    if value['sc_ad30af33d1be7d69'] != []:
        return 'schema_invalid'
    return None


def sc_5ece135f70f29833(value, context):
    if value['sc_5ece135f70f29833'] != []:
        return 'schema_invalid'
    return None


def sc_3c2b2a535d51a78a(value, context):
    if value['sc_3c2b2a535d51a78a'] != []:
        return 'schema_invalid'
    return None


def sc_af97d509659a7189(value, context):
    if value['sc_af97d509659a7189'] != []:
        return 'schema_invalid'
    return None


def sc_05ceeabe0424a495(value, context):
    if value['sc_05ceeabe0424a495'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_34b16e95f4e2e2cd', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/manifest_bytes_sha256', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type'), 'schema_invalid', sc_34b16e95f4e2e2cd),
        g.Guard('sc_7546c5a20c44de08', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/manifest_bytes_sha256', 'pattern at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern'), 'schema_invalid', sc_7546c5a20c44de08),
        g.Guard('sc_d1ec743f8ef2018d', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/manifest_generation', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_generation/type'), 'schema_invalid', sc_d1ec743f8ef2018d),
        g.Guard('sc_ad30af33d1be7d69', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/manifest_generation', 'minimum at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum'), 'schema_invalid', sc_ad30af33d1be7d69),
        g.Guard('sc_5ece135f70f29833', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/manifest_generation', 'maximum at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum'), 'schema_invalid', sc_5ece135f70f29833),
        g.Guard('sc_3c2b2a535d51a78a', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/recovery_epoch', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/recovery_epoch/type'), 'schema_invalid', sc_3c2b2a535d51a78a),
        g.Guard('sc_af97d509659a7189', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/recovery_epoch', 'minimum at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum'), 'schema_invalid', sc_af97d509659a7189),
        g.Guard('sc_05ceeabe0424a495', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/recovery_epoch', 'maximum at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum'), 'schema_invalid', sc_05ceeabe0424a495),
    ])

    def check(value):
        table.require('sc_34b16e95f4e2e2cd', value, context)
        table.require('sc_7546c5a20c44de08', value, context)
        table.require('sc_d1ec743f8ef2018d', value, context)
        table.require('sc_ad30af33d1be7d69', value, context)
        table.require('sc_5ece135f70f29833', value, context)
        table.require('sc_3c2b2a535d51a78a', value, context)
        table.require('sc_af97d509659a7189', value, context)
        table.require('sc_05ceeabe0424a495', value, context)
        return True
    return g.Case(table, check, context)

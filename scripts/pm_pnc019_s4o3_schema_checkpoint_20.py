"""W3I schema guard table checkpoint_20 (generated).
sc_9dd1bd9dd0244966: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/required/generation_id
sc_c7f8527a6d7f6121: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/required/generation_anchor_sha256
sc_931294ea8207650e: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/required/frontier_revision
sc_cb03ec3732422b92: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/required/frontier_sha256
sc_1d3c5b88ad099f02: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/required/index_dataset_name
sc_269658b5b1b94b52: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/required/source_selection
sc_e5ae005cffbe9e32: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/additionalProperties
sc_92515e022ff39b51: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/storage_instance_id/type
"""
import pm_guard_isolation as g


def sc_9dd1bd9dd0244966(value, context):
    if value['sc_9dd1bd9dd0244966'] != []:
        return 'schema_invalid'
    return None


def sc_c7f8527a6d7f6121(value, context):
    if value['sc_c7f8527a6d7f6121'] != []:
        return 'schema_invalid'
    return None


def sc_931294ea8207650e(value, context):
    if value['sc_931294ea8207650e'] != []:
        return 'schema_invalid'
    return None


def sc_cb03ec3732422b92(value, context):
    if value['sc_cb03ec3732422b92'] != []:
        return 'schema_invalid'
    return None


def sc_1d3c5b88ad099f02(value, context):
    if value['sc_1d3c5b88ad099f02'] != []:
        return 'schema_invalid'
    return None


def sc_269658b5b1b94b52(value, context):
    if value['sc_269658b5b1b94b52'] != []:
        return 'schema_invalid'
    return None


def sc_e5ae005cffbe9e32(value, context):
    if value['sc_e5ae005cffbe9e32'] != []:
        return 'schema_invalid'
    return None


def sc_92515e022ff39b51(value, context):
    if value['sc_92515e022ff39b51'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_9dd1bd9dd0244966', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/required/generation_id'), 'schema_invalid', sc_9dd1bd9dd0244966),
        g.Guard('sc_c7f8527a6d7f6121', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/required/generation_anchor_sha256'), 'schema_invalid', sc_c7f8527a6d7f6121),
        g.Guard('sc_931294ea8207650e', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/required/frontier_revision'), 'schema_invalid', sc_931294ea8207650e),
        g.Guard('sc_cb03ec3732422b92', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/required/frontier_sha256'), 'schema_invalid', sc_cb03ec3732422b92),
        g.Guard('sc_1d3c5b88ad099f02', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/required/index_dataset_name'), 'schema_invalid', sc_1d3c5b88ad099f02),
        g.Guard('sc_269658b5b1b94b52', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/required/source_selection'), 'schema_invalid', sc_269658b5b1b94b52),
        g.Guard('sc_e5ae005cffbe9e32', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'additionalProperties at owner schema /properties/retired_publications/items/properties/index_read_token/additionalProperties'), 'schema_invalid', sc_e5ae005cffbe9e32),
        g.Guard('sc_92515e022ff39b51', g.Invariant('/checkpoint/retired_publications/*/index_read_token/storage_instance_id', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/storage_instance_id/type'), 'schema_invalid', sc_92515e022ff39b51),
    ])

    def check(value):
        table.require('sc_9dd1bd9dd0244966', value, context)
        table.require('sc_c7f8527a6d7f6121', value, context)
        table.require('sc_931294ea8207650e', value, context)
        table.require('sc_cb03ec3732422b92', value, context)
        table.require('sc_1d3c5b88ad099f02', value, context)
        table.require('sc_269658b5b1b94b52', value, context)
        table.require('sc_e5ae005cffbe9e32', value, context)
        table.require('sc_92515e022ff39b51', value, context)
        return True
    return g.Case(table, check, context)

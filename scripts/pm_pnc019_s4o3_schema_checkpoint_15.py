"""W3I schema guard table checkpoint_15 (generated).
sc_7f4cb75d18ec71b4: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/schema_version
sc_8c83cda724b2041e: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/projector_id
sc_f2ff5ccaaf1dc9cb: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/projector_version
sc_86b90ce3ad5faf73: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/storage_instance_id
sc_4fa7e43c9ef3349d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/project_id
sc_2918cf6e08634f80: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/stream_id
sc_cbf073519fc22286: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/publication_id
sc_2148e9b43f62e991: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/admitted_event_types
"""
import pm_guard_isolation as g


def sc_7f4cb75d18ec71b4(value, context):
    if value['sc_7f4cb75d18ec71b4'] != []:
        return 'schema_invalid'
    return None


def sc_8c83cda724b2041e(value, context):
    if value['sc_8c83cda724b2041e'] != []:
        return 'schema_invalid'
    return None


def sc_f2ff5ccaaf1dc9cb(value, context):
    if value['sc_f2ff5ccaaf1dc9cb'] != []:
        return 'schema_invalid'
    return None


def sc_86b90ce3ad5faf73(value, context):
    if value['sc_86b90ce3ad5faf73'] != []:
        return 'schema_invalid'
    return None


def sc_4fa7e43c9ef3349d(value, context):
    if value['sc_4fa7e43c9ef3349d'] != []:
        return 'schema_invalid'
    return None


def sc_2918cf6e08634f80(value, context):
    if value['sc_2918cf6e08634f80'] != []:
        return 'schema_invalid'
    return None


def sc_cbf073519fc22286(value, context):
    if value['sc_cbf073519fc22286'] != []:
        return 'schema_invalid'
    return None


def sc_2148e9b43f62e991(value, context):
    if value['sc_2148e9b43f62e991'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_7f4cb75d18ec71b4', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/schema_version'), 'schema_invalid', sc_7f4cb75d18ec71b4),
        g.Guard('sc_8c83cda724b2041e', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/projector_id'), 'schema_invalid', sc_8c83cda724b2041e),
        g.Guard('sc_f2ff5ccaaf1dc9cb', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/projector_version'), 'schema_invalid', sc_f2ff5ccaaf1dc9cb),
        g.Guard('sc_86b90ce3ad5faf73', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/storage_instance_id'), 'schema_invalid', sc_86b90ce3ad5faf73),
        g.Guard('sc_4fa7e43c9ef3349d', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/project_id'), 'schema_invalid', sc_4fa7e43c9ef3349d),
        g.Guard('sc_2918cf6e08634f80', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/stream_id'), 'schema_invalid', sc_2918cf6e08634f80),
        g.Guard('sc_cbf073519fc22286', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/publication_id'), 'schema_invalid', sc_cbf073519fc22286),
        g.Guard('sc_2148e9b43f62e991', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/admitted_event_types'), 'schema_invalid', sc_2148e9b43f62e991),
    ])

    def check(value):
        table.require('sc_7f4cb75d18ec71b4', value, context)
        table.require('sc_8c83cda724b2041e', value, context)
        table.require('sc_f2ff5ccaaf1dc9cb', value, context)
        table.require('sc_86b90ce3ad5faf73', value, context)
        table.require('sc_4fa7e43c9ef3349d', value, context)
        table.require('sc_2918cf6e08634f80', value, context)
        table.require('sc_cbf073519fc22286', value, context)
        table.require('sc_2148e9b43f62e991', value, context)
        return True
    return g.Case(table, check, context)

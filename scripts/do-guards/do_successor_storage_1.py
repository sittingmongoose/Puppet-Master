"""DO guard suite `successor_storage_1` (sweep part 2A). Successor graph: the Storage member and profile match the V2 wrapper.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def successor_storage_value_schema(value, context):
    if value['storage_member_count'] != 1:
        return None
    return 'successor_storage_selection' if value['storage_value_schema_text'] != value['wrapper_definition_text'] else None


def successor_storage_schema_version(value, context):
    if value['storage_member_count'] != 1:
        return None
    return 'successor_storage_selection' if value['storage_row']['schema_version'] != '2.0.0' else None


def successor_storage_value_schema_id(value, context):
    if value['storage_member_count'] != 1:
        return None
    return ('successor_storage_selection'
            if value['storage_row']['value_schema_id'] != 'pm.storage_value.crew_board_message.application.v2' else None)


def successor_storage_value_schema_ref(value, context):
    if value['storage_member_count'] != 1:
        return None
    return ('successor_storage_selection'
            if value['storage_row']['value_schema_ref'] != value['graph']['physical_selection']['wrapper_root_ref'] else None)


def successor_storage_profile(value, context):
    if value['storage_member_count'] != 1:
        return None
    expected = {'redb_file': 'canonical', 'storage_group': 'coordination_and_storage', 'encoding_target': 'messagepack_canonical',
                'encoding_note': 'SP-723 governed V2 wrapper uses CV-366 deterministic MessagePack algorithm; frozen V1 remains exact.',
                'max_value_bytes': 16384}
    return 'successor_storage_selection' if value['storage_profile'] != expected else None


ROWS = (
    ('successor_storage_value_schema', '/storage_value_registry/families/v2/value_schema', 'equals the V2 wrapper definition',
     'successor_storage_selection', successor_storage_value_schema, ('storage_member_count', 'storage_value_schema_text', 'wrapper_definition_text'), 'storage'),
    ('successor_storage_schema_version', '/storage_value_registry/families/v2/schema_version', "is '2.0.0'",
     'successor_storage_selection', successor_storage_schema_version, ('storage_member_count', 'storage_row'), 'storage'),
    ('successor_storage_value_schema_id', '/storage_value_registry/families/v2/value_schema_id', 'is the V2 storage value id',
     'successor_storage_selection', successor_storage_value_schema_id, ('storage_member_count', 'storage_row'), 'storage'),
    ('successor_storage_value_schema_ref', '/storage_value_registry/families/v2/value_schema_ref', "equals the graph's wrapper root",
     'successor_storage_selection', successor_storage_value_schema_ref, ('storage_member_count', 'storage_row', 'graph'), 'storage'),
    ('successor_storage_profile', '/storage_value_registry/storage_profile/family_profiles/v2', 'is the SP-723 profile',
     'successor_storage_selection', successor_storage_profile, ('storage_member_count', 'storage_profile'), 'storage'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('successor_storage_value_schema', g.Invariant('/storage_value_registry/families/v2/value_schema', 'equals the V2 wrapper definition'), 'successor_storage_selection', successor_storage_value_schema),
        g.Guard('successor_storage_schema_version', g.Invariant('/storage_value_registry/families/v2/schema_version', "is '2.0.0'"), 'successor_storage_selection', successor_storage_schema_version),
        g.Guard('successor_storage_value_schema_id', g.Invariant('/storage_value_registry/families/v2/value_schema_id', 'is the V2 storage value id'), 'successor_storage_selection', successor_storage_value_schema_id),
        g.Guard('successor_storage_value_schema_ref', g.Invariant('/storage_value_registry/families/v2/value_schema_ref', "equals the graph's wrapper root"), 'successor_storage_selection', successor_storage_value_schema_ref),
        g.Guard('successor_storage_profile', g.Invariant('/storage_value_registry/storage_profile/family_profiles/v2', 'is the SP-723 profile'), 'successor_storage_selection', successor_storage_profile),
    ])
    context = None

    def check(complete):
        table.require('successor_storage_value_schema', complete, context)
        table.require('successor_storage_schema_version', complete, context)
        table.require('successor_storage_value_schema_id', complete, context)
        table.require('successor_storage_value_schema_ref', complete, context)
        table.require('successor_storage_profile', complete, context)
        return True
    return g.Case(table, check, context)

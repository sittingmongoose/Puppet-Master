"""W3I schema guard table checkpoint_10 (generated).
sc_cfd1ed97ed160671: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/retired_inputs_sha256
sc_14f015cf3d25dee0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/additionalProperties
sc_51b90bec120b73c4: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/storage_instance_id/type
sc_3f36cccbddb8e578: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/storage_instance_id/format
sc_f61270235a788117: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/current_ref/const
sc_329151b637047b5a: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type
sc_d21bca3d942ad85f: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern
sc_4ee69c9a53e4c089: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type
"""
import pm_guard_isolation as g


def sc_cfd1ed97ed160671(value, context):
    if value['sc_cfd1ed97ed160671'] != []:
        return 'schema_invalid'
    return None


def sc_14f015cf3d25dee0(value, context):
    if value['sc_14f015cf3d25dee0'] != []:
        return 'schema_invalid'
    return None


def sc_51b90bec120b73c4(value, context):
    if value['sc_51b90bec120b73c4'] != []:
        return 'schema_invalid'
    return None


def sc_3f36cccbddb8e578(value, context):
    if value['sc_3f36cccbddb8e578'] != []:
        return 'schema_invalid'
    return None


def sc_f61270235a788117(value, context):
    if value['sc_f61270235a788117'] != []:
        return 'schema_invalid'
    return None


def sc_329151b637047b5a(value, context):
    if value['sc_329151b637047b5a'] != []:
        return 'schema_invalid'
    return None


def sc_d21bca3d942ad85f(value, context):
    if value['sc_d21bca3d942ad85f'] != []:
        return 'schema_invalid'
    return None


def sc_4ee69c9a53e4c089(value, context):
    if value['sc_4ee69c9a53e4c089'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_cfd1ed97ed160671', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/retired_inputs_sha256'), 'schema_invalid', sc_cfd1ed97ed160671),
        g.Guard('sc_14f015cf3d25dee0', g.Invariant('/checkpoint/index_read_token/source_selection', 'additionalProperties at owner schema /properties/index_read_token/properties/source_selection/additionalProperties'), 'schema_invalid', sc_14f015cf3d25dee0),
        g.Guard('sc_51b90bec120b73c4', g.Invariant('/checkpoint/index_read_token/source_selection/storage_instance_id', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/storage_instance_id/type'), 'schema_invalid', sc_51b90bec120b73c4),
        g.Guard('sc_3f36cccbddb8e578', g.Invariant('/checkpoint/index_read_token/source_selection/storage_instance_id', 'format at owner schema /properties/index_read_token/properties/source_selection/properties/storage_instance_id/format'), 'schema_invalid', sc_3f36cccbddb8e578),
        g.Guard('sc_f61270235a788117', g.Invariant('/checkpoint/index_read_token/source_selection/current_ref', 'const at owner schema /properties/index_read_token/properties/source_selection/properties/current_ref/const'), 'schema_invalid', sc_f61270235a788117),
        g.Guard('sc_329151b637047b5a', g.Invariant('/checkpoint/index_read_token/source_selection/current_bytes_sha256', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type'), 'schema_invalid', sc_329151b637047b5a),
        g.Guard('sc_d21bca3d942ad85f', g.Invariant('/checkpoint/index_read_token/source_selection/current_bytes_sha256', 'pattern at owner schema /properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern'), 'schema_invalid', sc_d21bca3d942ad85f),
        g.Guard('sc_4ee69c9a53e4c089', g.Invariant('/checkpoint/index_read_token/source_selection/selected_segment_generation', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type'), 'schema_invalid', sc_4ee69c9a53e4c089),
    ])

    def check(value):
        table.require('sc_cfd1ed97ed160671', value, context)
        table.require('sc_14f015cf3d25dee0', value, context)
        table.require('sc_51b90bec120b73c4', value, context)
        table.require('sc_3f36cccbddb8e578', value, context)
        table.require('sc_f61270235a788117', value, context)
        table.require('sc_329151b637047b5a', value, context)
        table.require('sc_d21bca3d942ad85f', value, context)
        table.require('sc_4ee69c9a53e4c089', value, context)
        return True
    return g.Case(table, check, context)

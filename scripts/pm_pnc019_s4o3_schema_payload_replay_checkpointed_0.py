"""W3I schema guard table payload_replay_checkpointed_0 (generated).
sc_af94b0f592cf924a: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/type
sc_f392bbc7f3997f10: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/project_id
sc_5ce0761b7d3ec76a: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/continuity_id
sc_313fb539e2ca7e3c: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/stream_id
sc_37a40c063fc565aa: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/fact_ref
sc_09fec4e8c14af350: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/actor_ref
sc_bf73301813fd1213: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/actor_kind
sc_4c72642d9ffde2ae: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/source_event_id
"""
import pm_guard_isolation as g


def sc_af94b0f592cf924a(value, context):
    if value['sc_af94b0f592cf924a'] != []:
        return 'schema_invalid'
    return None


def sc_f392bbc7f3997f10(value, context):
    if value['sc_f392bbc7f3997f10'] != []:
        return 'schema_invalid'
    return None


def sc_5ce0761b7d3ec76a(value, context):
    if value['sc_5ce0761b7d3ec76a'] != []:
        return 'schema_invalid'
    return None


def sc_313fb539e2ca7e3c(value, context):
    if value['sc_313fb539e2ca7e3c'] != []:
        return 'schema_invalid'
    return None


def sc_37a40c063fc565aa(value, context):
    if value['sc_37a40c063fc565aa'] != []:
        return 'schema_invalid'
    return None


def sc_09fec4e8c14af350(value, context):
    if value['sc_09fec4e8c14af350'] != []:
        return 'schema_invalid'
    return None


def sc_bf73301813fd1213(value, context):
    if value['sc_bf73301813fd1213'] != []:
        return 'schema_invalid'
    return None


def sc_4c72642d9ffde2ae(value, context):
    if value['sc_4c72642d9ffde2ae'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_af94b0f592cf924a', g.Invariant('/payload_replay_checkpointed/', 'type at owner schema /type'), 'schema_invalid', sc_af94b0f592cf924a),
        g.Guard('sc_f392bbc7f3997f10', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/project_id'), 'schema_invalid', sc_f392bbc7f3997f10),
        g.Guard('sc_5ce0761b7d3ec76a', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/continuity_id'), 'schema_invalid', sc_5ce0761b7d3ec76a),
        g.Guard('sc_313fb539e2ca7e3c', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/stream_id'), 'schema_invalid', sc_313fb539e2ca7e3c),
        g.Guard('sc_37a40c063fc565aa', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/fact_ref'), 'schema_invalid', sc_37a40c063fc565aa),
        g.Guard('sc_09fec4e8c14af350', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/actor_ref'), 'schema_invalid', sc_09fec4e8c14af350),
        g.Guard('sc_bf73301813fd1213', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/actor_kind'), 'schema_invalid', sc_bf73301813fd1213),
        g.Guard('sc_4c72642d9ffde2ae', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/source_event_id'), 'schema_invalid', sc_4c72642d9ffde2ae),
    ])

    def check(value):
        table.require('sc_af94b0f592cf924a', value, context)
        table.require('sc_f392bbc7f3997f10', value, context)
        table.require('sc_5ce0761b7d3ec76a', value, context)
        table.require('sc_313fb539e2ca7e3c', value, context)
        table.require('sc_37a40c063fc565aa', value, context)
        table.require('sc_09fec4e8c14af350', value, context)
        table.require('sc_bf73301813fd1213', value, context)
        table.require('sc_4c72642d9ffde2ae', value, context)
        return True
    return g.Case(table, check, context)

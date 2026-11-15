"""W3I schema guard table payload_replay_checkpointed_1 (generated).
sc_bd7698ff26d33956: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/provenance_ref
sc_76ce37f07003263c: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/redaction_profile_id
sc_d9047df52de2da76: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/redaction_decision
sc_d9590e7b908e25f6: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/replay_checkpoint_ref
sc_507a0134eccc9a57: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/created_at_utc
sc_39deba529bb6a87d: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/schema_id
sc_42b8fd668450b95e: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/required/schema_version
sc_c7dbc9915036049d: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/additionalProperties
"""
import pm_guard_isolation as g


def sc_bd7698ff26d33956(value, context):
    if value['sc_bd7698ff26d33956'] != []:
        return 'schema_invalid'
    return None


def sc_76ce37f07003263c(value, context):
    if value['sc_76ce37f07003263c'] != []:
        return 'schema_invalid'
    return None


def sc_d9047df52de2da76(value, context):
    if value['sc_d9047df52de2da76'] != []:
        return 'schema_invalid'
    return None


def sc_d9590e7b908e25f6(value, context):
    if value['sc_d9590e7b908e25f6'] != []:
        return 'schema_invalid'
    return None


def sc_507a0134eccc9a57(value, context):
    if value['sc_507a0134eccc9a57'] != []:
        return 'schema_invalid'
    return None


def sc_39deba529bb6a87d(value, context):
    if value['sc_39deba529bb6a87d'] != []:
        return 'schema_invalid'
    return None


def sc_42b8fd668450b95e(value, context):
    if value['sc_42b8fd668450b95e'] != []:
        return 'schema_invalid'
    return None


def sc_c7dbc9915036049d(value, context):
    if value['sc_c7dbc9915036049d'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_bd7698ff26d33956', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/provenance_ref'), 'schema_invalid', sc_bd7698ff26d33956),
        g.Guard('sc_76ce37f07003263c', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/redaction_profile_id'), 'schema_invalid', sc_76ce37f07003263c),
        g.Guard('sc_d9047df52de2da76', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/redaction_decision'), 'schema_invalid', sc_d9047df52de2da76),
        g.Guard('sc_d9590e7b908e25f6', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/replay_checkpoint_ref'), 'schema_invalid', sc_d9590e7b908e25f6),
        g.Guard('sc_507a0134eccc9a57', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/created_at_utc'), 'schema_invalid', sc_507a0134eccc9a57),
        g.Guard('sc_39deba529bb6a87d', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/schema_id'), 'schema_invalid', sc_39deba529bb6a87d),
        g.Guard('sc_42b8fd668450b95e', g.Invariant('/payload_replay_checkpointed/', 'required at owner schema /required/schema_version'), 'schema_invalid', sc_42b8fd668450b95e),
        g.Guard('sc_c7dbc9915036049d', g.Invariant('/payload_replay_checkpointed/', 'additionalProperties at owner schema /additionalProperties'), 'schema_invalid', sc_c7dbc9915036049d),
    ])

    def check(value):
        table.require('sc_bd7698ff26d33956', value, context)
        table.require('sc_76ce37f07003263c', value, context)
        table.require('sc_d9047df52de2da76', value, context)
        table.require('sc_d9590e7b908e25f6', value, context)
        table.require('sc_507a0134eccc9a57', value, context)
        table.require('sc_39deba529bb6a87d', value, context)
        table.require('sc_42b8fd668450b95e', value, context)
        table.require('sc_c7dbc9915036049d', value, context)
        return True
    return g.Case(table, check, context)

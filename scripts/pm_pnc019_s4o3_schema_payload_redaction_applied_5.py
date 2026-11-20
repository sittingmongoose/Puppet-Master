"""W3I schema guard table payload_redaction_applied_5 (generated).
sc_736c66a0ccb4d4b5: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/redaction_profile_id/pattern
sc_95a8eedb11428a5a: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/redaction_profile_id/not
sc_8542f0f335e44f45: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/redaction_decision/maxLength
sc_04cb95998676b625: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/redaction_decision/pattern
sc_383e27901a976dc5: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/redaction_decision/not
sc_ebbcd6b537813b29: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/replay_checkpoint_ref/maxLength
sc_6957cbf3c240890d: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/replay_checkpoint_ref/pattern
sc_8794f85b8312b3da: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/replay_checkpoint_ref/not
"""
import pm_guard_isolation as g


def sc_736c66a0ccb4d4b5(value, context):
    if value['sc_736c66a0ccb4d4b5'] != []:
        return 'schema_invalid'
    return None


def sc_95a8eedb11428a5a(value, context):
    if value['sc_95a8eedb11428a5a'] != []:
        return 'schema_invalid'
    return None


def sc_8542f0f335e44f45(value, context):
    if value['sc_8542f0f335e44f45'] != []:
        return 'schema_invalid'
    return None


def sc_04cb95998676b625(value, context):
    if value['sc_04cb95998676b625'] != []:
        return 'schema_invalid'
    return None


def sc_383e27901a976dc5(value, context):
    if value['sc_383e27901a976dc5'] != []:
        return 'schema_invalid'
    return None


def sc_ebbcd6b537813b29(value, context):
    if value['sc_ebbcd6b537813b29'] != []:
        return 'schema_invalid'
    return None


def sc_6957cbf3c240890d(value, context):
    if value['sc_6957cbf3c240890d'] != []:
        return 'schema_invalid'
    return None


def sc_8794f85b8312b3da(value, context):
    if value['sc_8794f85b8312b3da'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_736c66a0ccb4d4b5', g.Invariant('/payload_redaction_applied/redaction_profile_id', 'pattern at owner schema /properties/redaction_profile_id/pattern'), 'schema_invalid', sc_736c66a0ccb4d4b5),
        g.Guard('sc_95a8eedb11428a5a', g.Invariant('/payload_redaction_applied/redaction_profile_id', 'not at owner schema /properties/redaction_profile_id/not'), 'schema_invalid', sc_95a8eedb11428a5a),
        g.Guard('sc_8542f0f335e44f45', g.Invariant('/payload_redaction_applied/redaction_decision', 'maxLength at owner schema /properties/redaction_decision/maxLength'), 'schema_invalid', sc_8542f0f335e44f45),
        g.Guard('sc_04cb95998676b625', g.Invariant('/payload_redaction_applied/redaction_decision', 'pattern at owner schema /properties/redaction_decision/pattern'), 'schema_invalid', sc_04cb95998676b625),
        g.Guard('sc_383e27901a976dc5', g.Invariant('/payload_redaction_applied/redaction_decision', 'not at owner schema /properties/redaction_decision/not'), 'schema_invalid', sc_383e27901a976dc5),
        g.Guard('sc_ebbcd6b537813b29', g.Invariant('/payload_redaction_applied/replay_checkpoint_ref', 'maxLength at owner schema /properties/replay_checkpoint_ref/maxLength'), 'schema_invalid', sc_ebbcd6b537813b29),
        g.Guard('sc_6957cbf3c240890d', g.Invariant('/payload_redaction_applied/replay_checkpoint_ref', 'pattern at owner schema /properties/replay_checkpoint_ref/pattern'), 'schema_invalid', sc_6957cbf3c240890d),
        g.Guard('sc_8794f85b8312b3da', g.Invariant('/payload_redaction_applied/replay_checkpoint_ref', 'not at owner schema /properties/replay_checkpoint_ref/not'), 'schema_invalid', sc_8794f85b8312b3da),
    ])

    def check(value):
        table.require('sc_736c66a0ccb4d4b5', value, context)
        table.require('sc_95a8eedb11428a5a', value, context)
        table.require('sc_8542f0f335e44f45', value, context)
        table.require('sc_04cb95998676b625', value, context)
        table.require('sc_383e27901a976dc5', value, context)
        table.require('sc_ebbcd6b537813b29', value, context)
        table.require('sc_6957cbf3c240890d', value, context)
        table.require('sc_8794f85b8312b3da', value, context)
        return True
    return g.Case(table, check, context)

"""W3I schema guard table payload_replay_checkpointed_5 (generated).
sc_195761c9bf328e41: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/redaction_profile_id/maxLength
sc_5e5c89827d14396e: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/redaction_profile_id/pattern
sc_9d16451a42848256: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/redaction_profile_id/not
sc_4c3c585b502761f0: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/redaction_decision/maxLength
sc_f25b6dbdfb35faed: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/redaction_decision/pattern
sc_63eb343fb9eb8c3d: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/redaction_decision/not
sc_81a980e768910e13: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/replay_checkpoint_ref/maxLength
sc_4b96ecc62c11d705: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/replay_checkpoint_ref/pattern
"""
import pm_guard_isolation as g


def sc_195761c9bf328e41(value, context):
    if value['sc_195761c9bf328e41'] != []:
        return 'schema_invalid'
    return None


def sc_5e5c89827d14396e(value, context):
    if value['sc_5e5c89827d14396e'] != []:
        return 'schema_invalid'
    return None


def sc_9d16451a42848256(value, context):
    if value['sc_9d16451a42848256'] != []:
        return 'schema_invalid'
    return None


def sc_4c3c585b502761f0(value, context):
    if value['sc_4c3c585b502761f0'] != []:
        return 'schema_invalid'
    return None


def sc_f25b6dbdfb35faed(value, context):
    if value['sc_f25b6dbdfb35faed'] != []:
        return 'schema_invalid'
    return None


def sc_63eb343fb9eb8c3d(value, context):
    if value['sc_63eb343fb9eb8c3d'] != []:
        return 'schema_invalid'
    return None


def sc_81a980e768910e13(value, context):
    if value['sc_81a980e768910e13'] != []:
        return 'schema_invalid'
    return None


def sc_4b96ecc62c11d705(value, context):
    if value['sc_4b96ecc62c11d705'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_195761c9bf328e41', g.Invariant('/payload_replay_checkpointed/redaction_profile_id', 'maxLength at owner schema /properties/redaction_profile_id/maxLength'), 'schema_invalid', sc_195761c9bf328e41),
        g.Guard('sc_5e5c89827d14396e', g.Invariant('/payload_replay_checkpointed/redaction_profile_id', 'pattern at owner schema /properties/redaction_profile_id/pattern'), 'schema_invalid', sc_5e5c89827d14396e),
        g.Guard('sc_9d16451a42848256', g.Invariant('/payload_replay_checkpointed/redaction_profile_id', 'not at owner schema /properties/redaction_profile_id/not'), 'schema_invalid', sc_9d16451a42848256),
        g.Guard('sc_4c3c585b502761f0', g.Invariant('/payload_replay_checkpointed/redaction_decision', 'maxLength at owner schema /properties/redaction_decision/maxLength'), 'schema_invalid', sc_4c3c585b502761f0),
        g.Guard('sc_f25b6dbdfb35faed', g.Invariant('/payload_replay_checkpointed/redaction_decision', 'pattern at owner schema /properties/redaction_decision/pattern'), 'schema_invalid', sc_f25b6dbdfb35faed),
        g.Guard('sc_63eb343fb9eb8c3d', g.Invariant('/payload_replay_checkpointed/redaction_decision', 'not at owner schema /properties/redaction_decision/not'), 'schema_invalid', sc_63eb343fb9eb8c3d),
        g.Guard('sc_81a980e768910e13', g.Invariant('/payload_replay_checkpointed/replay_checkpoint_ref', 'maxLength at owner schema /properties/replay_checkpoint_ref/maxLength'), 'schema_invalid', sc_81a980e768910e13),
        g.Guard('sc_4b96ecc62c11d705', g.Invariant('/payload_replay_checkpointed/replay_checkpoint_ref', 'pattern at owner schema /properties/replay_checkpoint_ref/pattern'), 'schema_invalid', sc_4b96ecc62c11d705),
    ])

    def check(value):
        table.require('sc_195761c9bf328e41', value, context)
        table.require('sc_5e5c89827d14396e', value, context)
        table.require('sc_9d16451a42848256', value, context)
        table.require('sc_4c3c585b502761f0', value, context)
        table.require('sc_f25b6dbdfb35faed', value, context)
        table.require('sc_63eb343fb9eb8c3d', value, context)
        table.require('sc_81a980e768910e13', value, context)
        table.require('sc_4b96ecc62c11d705', value, context)
        return True
    return g.Case(table, check, context)

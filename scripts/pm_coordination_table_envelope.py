"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['unknown_event_type'] is True else 'unknown_event_type'

def p_1(value, context):
    return None if value['project_only'] is True else 'project_only'

def p_2(value, context):
    return None if value['inline_only'] is True else 'inline_only'

def p_3(value, context):
    return None if value['payload_schema_id'] is True else 'payload_schema_id'

def p_4(value, context):
    return None if value['payload_envelope_identity'] is True else 'payload_envelope_identity'

def p_5(value, context):
    return None if value['redaction_profile'] is True else 'redaction_profile'

def p_6(value, context):
    return None if value['replay_only_not_appendable'] is True else 'replay_only_not_appendable'

def p_7(value, context):
    return None if value['replay_policy'] is True else 'replay_policy'

def p_8(value, context):
    return None if value['occurred_at_join'] is True else 'occurred_at_join'

def p_9(value, context):
    return None if value['identity_recipe'] is True else 'identity_recipe'

def p_10(value, context):
    return None if value['envelope_occurred_at'] is True else 'envelope_occurred_at'

def p_11(value, context):
    return None if value['envelope_storage_time'] is True else 'envelope_storage_time'

def envelope_case():
    table = g.GuardTable([
        g.Guard('unknown_event_type', g.Invariant('/unknown_event_type', 'the unknown event type observation holds'), 'unknown_event_type', p_0),
        g.Guard('project_only', g.Invariant('/project_only', 'the project only observation holds'), 'project_only', p_1),
        g.Guard('inline_only', g.Invariant('/inline_only', 'the inline only observation holds'), 'inline_only', p_2),
        g.Guard('payload_schema_id', g.Invariant('/payload_schema_id', 'the payload schema id observation holds'), 'payload_schema_id', p_3),
        g.Guard('payload_envelope_identity', g.Invariant('/payload_envelope_identity', 'the payload envelope identity observation holds'), 'payload_envelope_identity', p_4),
        g.Guard('redaction_profile', g.Invariant('/redaction_profile', 'the redaction profile observation holds'), 'redaction_profile', p_5),
        g.Guard('replay_only_not_appendable', g.Invariant('/replay_only_not_appendable', 'the replay only not appendable observation holds'), 'replay_only_not_appendable', p_6),
        g.Guard('replay_policy', g.Invariant('/replay_policy', 'the replay policy observation holds'), 'replay_policy', p_7),
        g.Guard('envelope_occurred_at', g.Invariant('/envelope_occurred_at', 'the envelope occurred at observation holds'), 'envelope_occurred_at', p_10),
        g.Guard('envelope_storage_time', g.Invariant('/envelope_storage_time', 'the envelope storage time observation holds'), 'envelope_storage_time', p_11),
        g.Guard('occurred_at_join', g.Invariant('/occurred_at_join', 'the occurred at join observation holds'), 'occurred_at_join', p_8),
        g.Guard('identity_recipe', g.Invariant('/identity_recipe', 'the identity recipe observation holds'), 'identity_recipe', p_9),
    ])
    def check(value):
        table.require('unknown_event_type', value)
        table.require('project_only', value)
        table.require('inline_only', value)
        table.require('payload_schema_id', value)
        table.require('payload_envelope_identity', value)
        table.require('redaction_profile', value)
        table.require('replay_only_not_appendable', value)
        table.require('replay_policy', value)
        table.require('envelope_occurred_at', value)
        table.require('envelope_storage_time', value)
        table.require('occurred_at_join', value)
        table.require('identity_recipe', value)
        return True
    return g.Case(table, check)


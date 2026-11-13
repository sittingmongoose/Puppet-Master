"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['unknown_event_type'] is True else 'unknown_event_type'

def p_1(value, context):
    return None if value['schema'] is True else 'schema'

def p_2(value, context):
    return None if value['payload_integer_slots'] is True else 'payload_integer_slots'

def p_3(value, context):
    return None if value['valid_utc_datetime'] is True else 'valid_utc_datetime'

def p_4(value, context):
    return None if value['identity_recipe'] is True else 'identity_recipe'

def p_5(value, context):
    return None if value['path_hash_recipe'] is True else 'path_hash_recipe'

def p_6(value, context):
    return None if value['abort_ref_join'] is True else 'abort_ref_join'

def payload_instance_case():
    table = g.GuardTable([
        g.Guard('unknown_event_type', g.Invariant('/unknown_event_type', 'the unknown event type observation holds'), 'unknown_event_type', p_0),
        g.Guard('schema', g.Invariant('/schema', 'the schema observation holds'), 'schema', p_1),
        g.Guard('payload_integer_slots', g.Invariant('/payload_integer_slots', 'the payload integer slots observation holds'), 'payload_integer_slots', p_2),
        g.Guard('valid_utc_datetime', g.Invariant('/valid_utc_datetime', 'the valid utc datetime observation holds'), 'valid_utc_datetime', p_3),
        g.Guard('identity_recipe', g.Invariant('/identity_recipe', 'the identity recipe observation holds'), 'identity_recipe', p_4),
        g.Guard('path_hash_recipe', g.Invariant('/path_hash_recipe', 'the path hash recipe observation holds'), 'path_hash_recipe', p_5),
        g.Guard('abort_ref_join', g.Invariant('/abort_ref_join', 'the abort ref join observation holds'), 'abort_ref_join', p_6),
    ])
    def check(value):
        table.require('unknown_event_type', value)
        table.require('schema', value)
        table.require('payload_integer_slots', value)
        table.require('valid_utc_datetime', value)
        table.require('identity_recipe', value)
        table.require('path_hash_recipe', value)
        table.require('abort_ref_join', value)
        return True
    return g.Case(table, check)


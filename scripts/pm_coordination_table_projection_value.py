"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['schema'] is True else 'schema'

def p_1(value, context):
    return None if value['path_hash_recipe'] is True else 'path_hash_recipe'

def p_2(value, context):
    return None if value['checkpoint_scope_partition'] is True else 'checkpoint_scope_partition'

def p_3(value, context):
    return None if value['checkpoint_token_storage_instance'] is True else 'checkpoint_token_storage_instance'

def p_4(value, context):
    return None if value['checkpoint_admitted_types_not_sorted'] is True else 'checkpoint_admitted_types_not_sorted'

def p_5(value, context):
    return None if value['checkpoint_range_or_cursor'] is True else 'checkpoint_range_or_cursor'

def p_6(value, context):
    return None if value['checkpoint_retired_core_other_key'] is True else 'checkpoint_retired_core_other_key'

def p_7(value, context):
    return None if value['checkpoint_publication_reused'] is True else 'checkpoint_publication_reused'

def p_8(value, context):
    return None if value['retired_checkpoint_token_storage_instance'] is True else 'retired_checkpoint_token_storage_instance'

def p_9(value, context):
    return None if value['retired_checkpoint_admitted_types_not_sorted'] is True else 'retired_checkpoint_admitted_types_not_sorted'

def p_10(value, context):
    return None if value['retired_checkpoint_range_or_cursor'] is True else 'retired_checkpoint_range_or_cursor'

def p_11(value, context):
    return None if value['projection_timestamp'] is True else 'projection_timestamp'

def projection_value_case():
    table = g.GuardTable([
        g.Guard('schema', g.Invariant('/schema', 'the schema observation holds'), 'schema', p_0),
        g.Guard('projection_timestamp', g.Invariant('/projection_timestamp', 'the projection timestamp observation holds'), 'projection_timestamp', p_11),
        g.Guard('path_hash_recipe', g.Invariant('/path_hash_recipe', 'the path hash recipe observation holds'), 'path_hash_recipe', p_1),
        g.Guard('checkpoint_scope_partition', g.Invariant('/checkpoint_scope_partition', 'the checkpoint scope partition observation holds'), 'checkpoint_scope_partition', p_2),
        g.Guard('checkpoint_token_storage_instance', g.Invariant('/checkpoint_token_storage_instance', 'the checkpoint token storage instance observation holds'), 'checkpoint_token_storage_instance', p_3),
        g.Guard('checkpoint_admitted_types_not_sorted', g.Invariant('/checkpoint_admitted_types_not_sorted', 'the checkpoint admitted types not sorted observation holds'), 'checkpoint_admitted_types_not_sorted', p_4),
        g.Guard('checkpoint_range_or_cursor', g.Invariant('/checkpoint_range_or_cursor', 'the checkpoint range or cursor observation holds'), 'checkpoint_range_or_cursor', p_5),
        g.Guard('checkpoint_retired_core_other_key', g.Invariant('/checkpoint_retired_core_other_key', 'the checkpoint retired core other key observation holds'), 'checkpoint_retired_core_other_key', p_6),
        g.Guard('checkpoint_publication_reused', g.Invariant('/checkpoint_publication_reused', 'the checkpoint publication reused observation holds'), 'checkpoint_publication_reused', p_7),
        g.Guard('retired_checkpoint_token_storage_instance', g.Invariant('/retired_checkpoint_token_storage_instance', 'the retired checkpoint token storage instance observation holds'), 'retired_checkpoint_token_storage_instance', p_8),
        g.Guard('retired_checkpoint_admitted_types_not_sorted', g.Invariant('/retired_checkpoint_admitted_types_not_sorted', 'the retired checkpoint admitted types not sorted observation holds'), 'retired_checkpoint_admitted_types_not_sorted', p_9),
        g.Guard('retired_checkpoint_range_or_cursor', g.Invariant('/retired_checkpoint_range_or_cursor', 'the retired checkpoint range or cursor observation holds'), 'retired_checkpoint_range_or_cursor', p_10),
    ])
    def check(value):
        table.require('schema', value)
        table.require('projection_timestamp', value)
        table.require('path_hash_recipe', value)
        table.require('checkpoint_scope_partition', value)
        table.require('checkpoint_token_storage_instance', value)
        table.require('checkpoint_admitted_types_not_sorted', value)
        table.require('checkpoint_range_or_cursor', value)
        table.require('checkpoint_retired_core_other_key', value)
        table.require('checkpoint_publication_reused', value)
        table.require('retired_checkpoint_token_storage_instance', value)
        table.require('retired_checkpoint_admitted_types_not_sorted', value)
        table.require('retired_checkpoint_range_or_cursor', value)
        return True
    return g.Case(table, check)


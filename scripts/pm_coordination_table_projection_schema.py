"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['projection_schema_invalid'] is True else 'projection_schema_invalid'

def p_1(value, context):
    return None if value['projection_schema_uri'] is True else 'projection_schema_uri'

def p_2(value, context):
    return None if value['projection_schema_definition_census'] is True else 'projection_schema_definition_census'

def p_3(value, context):
    return None if value['projection_schema_root_members'] is True else 'projection_schema_root_members'

def p_4(value, context):
    return None if value['projection_value_identity'] is True else 'projection_value_identity'

def p_5(value, context):
    return None if value['checkpoint_token_not_sp278_durable_token'] is True else 'checkpoint_token_not_sp278_durable_token'

def p_6(value, context):
    return None if value['checkpoint_token_binding'] is True else 'checkpoint_token_binding'

def p_7(value, context):
    return None if value['checkpoint_cursor_not_sp278_last_frame'] is True else 'checkpoint_cursor_not_sp278_last_frame'

def p_8(value, context):
    return None if value['checkpoint_admitted_domain'] is True else 'checkpoint_admitted_domain'

def p_9(value, context):
    return None if value['platform_pattern'] is True else 'platform_pattern'

def p_10(value, context):
    return None if value['path_ref_pattern'] is True else 'path_ref_pattern'

def p_11(value, context):
    return None if value['stored_live_snapshot_fence'] is True else 'stored_live_snapshot_fence'

def p_12(value, context):
    return None if value['coordination_authority_binding_mismatch'] is True else 'coordination_authority_binding_mismatch'

def projection_schema_case():
    table = g.GuardTable([
        g.Guard('projection_schema_invalid', g.Invariant('/projection_schema_invalid', 'the projection schema invalid observation holds'), 'projection_schema_invalid', p_0),
        g.Guard('projection_schema_uri', g.Invariant('/projection_schema_uri', 'the projection schema uri observation holds'), 'projection_schema_uri', p_1),
        g.Guard('projection_schema_definition_census', g.Invariant('/projection_schema_definition_census', 'the projection schema definition census observation holds'), 'projection_schema_definition_census', p_2),
        g.Guard('projection_schema_root_members', g.Invariant('/projection_schema_root_members', 'the projection schema root members observation holds'), 'projection_schema_root_members', p_3),
        g.Guard('projection_value_identity', g.Invariant('/projection_value_identity', 'the projection value identity observation holds'), 'projection_value_identity', p_4),
        g.Guard('checkpoint_token_not_sp278_durable_token', g.Invariant('/checkpoint_token_not_sp278_durable_token', 'the checkpoint token not sp278 durable token observation holds'), 'checkpoint_token_not_sp278_durable_token', p_5),
        g.Guard('checkpoint_token_binding', g.Invariant('/checkpoint_token_binding', 'the checkpoint token binding observation holds'), 'checkpoint_token_binding', p_6),
        g.Guard('checkpoint_cursor_not_sp278_last_frame', g.Invariant('/checkpoint_cursor_not_sp278_last_frame', 'the checkpoint cursor not sp278 last frame observation holds'), 'checkpoint_cursor_not_sp278_last_frame', p_7),
        g.Guard('checkpoint_admitted_domain', g.Invariant('/checkpoint_admitted_domain', 'the checkpoint admitted domain observation holds'), 'checkpoint_admitted_domain', p_8),
        g.Guard('platform_pattern', g.Invariant('/platform_pattern', 'the platform pattern observation holds'), 'platform_pattern', p_9),
        g.Guard('path_ref_pattern', g.Invariant('/path_ref_pattern', 'the path ref pattern observation holds'), 'path_ref_pattern', p_10),
        g.Guard('stored_live_snapshot_fence', g.Invariant('/stored_live_snapshot_fence', 'the stored live snapshot fence observation holds'), 'stored_live_snapshot_fence', p_11),
        g.Guard('coordination_authority_binding_mismatch', g.Invariant('/coordination_authority_binding_mismatch', 'the coordination authority binding mismatch observation holds'), 'coordination_authority_binding_mismatch', p_12),
    ])
    def check(value):
        table.require('projection_schema_invalid', value)
        table.require('projection_schema_uri', value)
        table.require('projection_schema_definition_census', value)
        table.require('projection_schema_root_members', value)
        table.require('projection_value_identity', value)
        table.require('checkpoint_token_not_sp278_durable_token', value)
        table.require('checkpoint_token_binding', value)
        table.require('checkpoint_cursor_not_sp278_last_frame', value)
        table.require('checkpoint_admitted_domain', value)
        table.require('platform_pattern', value)
        table.require('path_ref_pattern', value)
        table.require('stored_live_snapshot_fence', value)
        table.require('coordination_authority_binding_mismatch', value)
        return True
    return g.Case(table, check)


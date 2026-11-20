"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['fixture_storage_context_partition'] is True else 'fixture_storage_context_partition'

def p_1(value, context):
    return None if value['fixture_schema_refs'] is True else 'fixture_schema_refs'

def p_2(value, context):
    return None if value['fixture_case_id_duplicate'] is True else 'fixture_case_id_duplicate'

def p_3(value, context):
    return None if value['positive_payload_rejected'] is True else 'positive_payload_rejected'

def p_4(value, context):
    return None if value['negative_payload_base'] is True else 'negative_payload_base'

def p_5(value, context):
    return None if value['negative_payload_not_rejected_for_stated_reason'] is True else 'negative_payload_not_rejected_for_stated_reason'

def p_6(value, context):
    return None if value['valid_event_payload_join'] is True else 'valid_event_payload_join'

def p_7(value, context):
    return None if value['valid_event_envelope_schema'] is True else 'valid_event_envelope_schema'

def p_8(value, context):
    return None if value['valid_event_rejected'] is True else 'valid_event_rejected'

def p_9(value, context):
    return None if value['negative_event_base'] is True else 'negative_event_base'

def p_10(value, context):
    return None if value['negative_event_not_rejected_for_stated_reason'] is True else 'negative_event_not_rejected_for_stated_reason'

def p_11(value, context):
    return None if value['identity_vector_mismatch'] is True else 'identity_vector_mismatch'

def p_12(value, context):
    return None if value['path_vector_mismatch'] is True else 'path_vector_mismatch'

def p_13(value, context):
    return None if value['transition_step_payload_missing'] is True else 'transition_step_payload_missing'

def p_14(value, context):
    return None if value['transition_step_mismatch'] is True else 'transition_step_mismatch'

def p_15(value, context):
    return None if value['transition_final_state_mismatch'] is True else 'transition_final_state_mismatch'

def p_16(value, context):
    return None if value['positive_projection_rejected'] is True else 'positive_projection_rejected'

def p_17(value, context):
    return None if value['negative_projection_base'] is True else 'negative_projection_base'

def p_18(value, context):
    return None if value['negative_projection_not_rejected_for_stated_reason'] is True else 'negative_projection_not_rejected_for_stated_reason'

def p_19(value, context):
    return None if value['native_oracles_must_stay_not_run'] is True else 'native_oracles_must_stay_not_run'

def p_20(value, context):
    return None if value['family_without_positive_negative_and_transition_cases'] is True else 'family_without_positive_negative_and_transition_cases'

def p_21(value, context):
    return None if value['family_without_own_event_join_cases'] is True else 'family_without_own_event_join_cases'

def fixtures_case():
    table = g.GuardTable([
        g.Guard('fixture_storage_context_partition', g.Invariant('/fixture_storage_context_partition', 'the fixture storage context partition observation holds'), 'fixture_storage_context_partition', p_0),
        g.Guard('fixture_schema_refs', g.Invariant('/fixture_schema_refs', 'the fixture schema refs observation holds'), 'fixture_schema_refs', p_1),
        g.Guard('fixture_case_id_duplicate', g.Invariant('/fixture_case_id_duplicate', 'the fixture case id duplicate observation holds'), 'fixture_case_id_duplicate', p_2),
        g.Guard('positive_payload_rejected', g.Invariant('/positive_payload_rejected', 'the positive payload rejected observation holds'), 'positive_payload_rejected', p_3),
        g.Guard('negative_payload_base', g.Invariant('/negative_payload_base', 'the negative payload base observation holds'), 'negative_payload_base', p_4),
        g.Guard('negative_payload_not_rejected_for_stated_reason', g.Invariant('/negative_payload_not_rejected_for_stated_reason', 'the negative payload not rejected for stated reason observation holds'), 'negative_payload_not_rejected_for_stated_reason', p_5),
        g.Guard('valid_event_payload_join', g.Invariant('/valid_event_payload_join', 'the valid event payload join observation holds'), 'valid_event_payload_join', p_6),
        g.Guard('valid_event_envelope_schema', g.Invariant('/valid_event_envelope_schema', 'the valid event envelope schema observation holds'), 'valid_event_envelope_schema', p_7),
        g.Guard('valid_event_rejected', g.Invariant('/valid_event_rejected', 'the valid event rejected observation holds'), 'valid_event_rejected', p_8),
        g.Guard('negative_event_base', g.Invariant('/negative_event_base', 'the negative event base observation holds'), 'negative_event_base', p_9),
        g.Guard('negative_event_not_rejected_for_stated_reason', g.Invariant('/negative_event_not_rejected_for_stated_reason', 'the negative event not rejected for stated reason observation holds'), 'negative_event_not_rejected_for_stated_reason', p_10),
        g.Guard('identity_vector_mismatch', g.Invariant('/identity_vector_mismatch', 'the identity vector mismatch observation holds'), 'identity_vector_mismatch', p_11),
        g.Guard('path_vector_mismatch', g.Invariant('/path_vector_mismatch', 'the path vector mismatch observation holds'), 'path_vector_mismatch', p_12),
        g.Guard('transition_step_payload_missing', g.Invariant('/transition_step_payload_missing', 'the transition step payload missing observation holds'), 'transition_step_payload_missing', p_13),
        g.Guard('transition_step_mismatch', g.Invariant('/transition_step_mismatch', 'the transition step mismatch observation holds'), 'transition_step_mismatch', p_14),
        g.Guard('transition_final_state_mismatch', g.Invariant('/transition_final_state_mismatch', 'the transition final state mismatch observation holds'), 'transition_final_state_mismatch', p_15),
        g.Guard('positive_projection_rejected', g.Invariant('/positive_projection_rejected', 'the positive projection rejected observation holds'), 'positive_projection_rejected', p_16),
        g.Guard('negative_projection_base', g.Invariant('/negative_projection_base', 'the negative projection base observation holds'), 'negative_projection_base', p_17),
        g.Guard('negative_projection_not_rejected_for_stated_reason', g.Invariant('/negative_projection_not_rejected_for_stated_reason', 'the negative projection not rejected for stated reason observation holds'), 'negative_projection_not_rejected_for_stated_reason', p_18),
        g.Guard('native_oracles_must_stay_not_run', g.Invariant('/native_oracles_must_stay_not_run', 'the native oracles must stay not run observation holds'), 'native_oracles_must_stay_not_run', p_19),
        g.Guard('family_without_positive_negative_and_transition_cases', g.Invariant('/family_without_positive_negative_and_transition_cases', 'the family without positive negative and transition cases observation holds'), 'family_without_positive_negative_and_transition_cases', p_20),
        g.Guard('family_without_own_event_join_cases', g.Invariant('/family_without_own_event_join_cases', 'the family without own event join cases observation holds'), 'family_without_own_event_join_cases', p_21),
    ])
    def check(value):
        table.require('fixture_storage_context_partition', value)
        table.require('fixture_schema_refs', value)
        table.require('fixture_case_id_duplicate', value)
        table.require('positive_payload_rejected', value)
        table.require('negative_payload_base', value)
        table.require('negative_payload_not_rejected_for_stated_reason', value)
        table.require('valid_event_payload_join', value)
        table.require('valid_event_envelope_schema', value)
        table.require('valid_event_rejected', value)
        table.require('negative_event_base', value)
        table.require('negative_event_not_rejected_for_stated_reason', value)
        table.require('identity_vector_mismatch', value)
        table.require('path_vector_mismatch', value)
        table.require('transition_step_payload_missing', value)
        table.require('transition_step_mismatch', value)
        table.require('transition_final_state_mismatch', value)
        table.require('positive_projection_rejected', value)
        table.require('negative_projection_base', value)
        table.require('negative_projection_not_rejected_for_stated_reason', value)
        table.require('native_oracles_must_stay_not_run', value)
        table.require('family_without_positive_negative_and_transition_cases', value)
        table.require('family_without_own_event_join_cases', value)
        return True
    return g.Case(table, check)


"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['validation_case_of_other_family'] is True else 'validation_case_of_other_family'

def p_1(value, context):
    return None if value['validation_sequence_without_family_step'] is True else 'validation_sequence_without_family_step'

def p_2(value, context):
    return None if value['validation_case_missing'] is True else 'validation_case_missing'

def p_3(value, context):
    return None if value['family_cases_not_named_by_ledger_row'] is True else 'family_cases_not_named_by_ledger_row'

def p_4(value, context):
    return None if value['transition_sequence_unclaimed'] is True else 'transition_sequence_unclaimed'

def validation_case():
    table = g.GuardTable([
        g.Guard('validation_case_of_other_family', g.Invariant('/validation_case_of_other_family', 'the validation case of other family observation holds'), 'validation_case_of_other_family', p_0),
        g.Guard('validation_sequence_without_family_step', g.Invariant('/validation_sequence_without_family_step', 'the validation sequence without family step observation holds'), 'validation_sequence_without_family_step', p_1),
        g.Guard('validation_case_missing', g.Invariant('/validation_case_missing', 'the validation case missing observation holds'), 'validation_case_missing', p_2),
        g.Guard('family_cases_not_named_by_ledger_row', g.Invariant('/family_cases_not_named_by_ledger_row', 'the family cases not named by ledger row observation holds'), 'family_cases_not_named_by_ledger_row', p_3),
        g.Guard('transition_sequence_unclaimed', g.Invariant('/transition_sequence_unclaimed', 'the transition sequence unclaimed observation holds'), 'transition_sequence_unclaimed', p_4),
    ])
    def check(value):
        table.require('validation_case_of_other_family', value)
        table.require('validation_sequence_without_family_step', value)
        table.require('validation_case_missing', value)
        table.require('family_cases_not_named_by_ledger_row', value)
        table.require('transition_sequence_unclaimed', value)
        return True
    return g.Case(table, check)


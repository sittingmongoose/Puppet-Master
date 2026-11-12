"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['admitted_coordination_family_missing_or_duplicate'] is True else 'admitted_coordination_family_missing_or_duplicate'

def p_1(value, context):
    return None if value['admitted_coordination_row_differs_from_prepared_row'] is True else 'admitted_coordination_row_differs_from_prepared_row'

def p_2(value, context):
    return None if value['prepared_coordination_family_registered'] is True else 'prepared_coordination_family_registered'

def p_3(value, context):
    return None if value['unexpected_coordination_registry_family'] is True else 'unexpected_coordination_registry_family'

def registry_case():
    table = g.GuardTable([
        g.Guard('admitted_coordination_family_missing_or_duplicate', g.Invariant('/admitted_coordination_family_missing_or_duplicate', 'the admitted coordination family missing or duplicate observation holds'), 'admitted_coordination_family_missing_or_duplicate', p_0),
        g.Guard('admitted_coordination_row_differs_from_prepared_row', g.Invariant('/admitted_coordination_row_differs_from_prepared_row', 'the admitted coordination row differs from prepared row observation holds'), 'admitted_coordination_row_differs_from_prepared_row', p_1),
        g.Guard('prepared_coordination_family_registered', g.Invariant('/prepared_coordination_family_registered', 'the prepared coordination family registered observation holds'), 'prepared_coordination_family_registered', p_2),
        g.Guard('unexpected_coordination_registry_family', g.Invariant('/unexpected_coordination_registry_family', 'the unexpected coordination registry family observation holds'), 'unexpected_coordination_registry_family', p_3),
    ])
    def check(value):
        table.require('admitted_coordination_family_missing_or_duplicate', value)
        table.require('admitted_coordination_row_differs_from_prepared_row', value)
        table.require('prepared_coordination_family_registered', value)
        table.require('unexpected_coordination_registry_family', value)
        return True
    return g.Case(table, check)


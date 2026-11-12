"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['threshold_owner_literals'] is True else 'threshold_owner_literals'

def p_1(value, context):
    return None if value['threshold_oracle_census'] is True else 'threshold_oracle_census'

def p_2(value, context):
    return None if value['sp_unit_literals'] is True else 'sp_unit_literals'

def p_3(value, context):
    return None if value['project_registry_composition_mismatch'] is True else 'project_registry_composition_mismatch'

def wave2_case():
    table = g.GuardTable([
        g.Guard('threshold_owner_literals', g.Invariant('/threshold_owner_literals', 'the threshold owner literals observation holds'), 'threshold_owner_literals', p_0),
        g.Guard('threshold_oracle_census', g.Invariant('/threshold_oracle_census', 'the threshold oracle census observation holds'), 'threshold_oracle_census', p_1),
        g.Guard('sp_unit_literals', g.Invariant('/sp_unit_literals', 'the sp unit literals observation holds'), 'sp_unit_literals', p_2),
        g.Guard('project_registry_composition_mismatch', g.Invariant('/project_registry_composition_mismatch', 'the project registry composition mismatch observation holds'), 'project_registry_composition_mismatch', p_3),
    ])
    def check(value):
        table.require('threshold_owner_literals', value)
        table.require('threshold_oracle_census', value)
        table.require('sp_unit_literals', value)
        table.require('project_registry_composition_mismatch', value)
        return True
    return g.Case(table, check)


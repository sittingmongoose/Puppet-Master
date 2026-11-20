"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['ats_coordination_oracle_entry_missing'] is True else 'ats_coordination_oracle_entry_missing'

def p_1(value, context):
    return None if value['ats_native_oracle_not_named'] is True else 'ats_native_oracle_not_named'

def ats_case():
    table = g.GuardTable([
        g.Guard('ats_coordination_oracle_entry_missing', g.Invariant('/ats_coordination_oracle_entry_missing', 'the ats coordination oracle entry missing observation holds'), 'ats_coordination_oracle_entry_missing', p_0),
        g.Guard('ats_native_oracle_not_named', g.Invariant('/ats_native_oracle_not_named', 'the ats native oracle not named observation holds'), 'ats_native_oracle_not_named', p_1),
    ])
    def check(value):
        table.require('ats_coordination_oracle_entry_missing', value)
        table.require('ats_native_oracle_not_named', value)
        return True
    return g.Case(table, check)


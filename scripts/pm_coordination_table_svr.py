"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['coordination_storage_family_missing_or_duplicate'] is True else 'coordination_storage_family_missing_or_duplicate'

def p_1(value, context):
    return None if value['coordination_storage_family_mismatch'] is True else 'coordination_storage_family_mismatch'

def p_2(value, context):
    return None if value['coordination_retention_policy_changed'] is True else 'coordination_retention_policy_changed'

def svr_case():
    table = g.GuardTable([
        g.Guard('coordination_storage_family_missing_or_duplicate', g.Invariant('/coordination_storage_family_missing_or_duplicate', 'the coordination storage family missing or duplicate observation holds'), 'coordination_storage_family_missing_or_duplicate', p_0),
        g.Guard('coordination_storage_family_mismatch', g.Invariant('/coordination_storage_family_mismatch', 'the coordination storage family mismatch observation holds'), 'coordination_storage_family_mismatch', p_1),
        g.Guard('coordination_retention_policy_changed', g.Invariant('/coordination_retention_policy_changed', 'the coordination retention policy changed observation holds'), 'coordination_retention_policy_changed', p_2),
    ])
    def check(value):
        table.require('coordination_storage_family_missing_or_duplicate', value)
        table.require('coordination_storage_family_mismatch', value)
        table.require('coordination_retention_policy_changed', value)
        return True
    return g.Case(table, check)


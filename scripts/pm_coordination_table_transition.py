"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['idempotency_conflict'] is True else 'idempotency_conflict'

def p_1(value, context):
    return None if value['quarantined_before_append'] is True else 'quarantined_before_append'

def p_2(value, context):
    return None if value['coordination_conflict:not_registered'] is True else 'coordination_conflict:not_registered'

def p_3(value, context):
    return None if value['coordination_conflict:already_terminal'] is True else 'coordination_conflict:already_terminal'

def p_4(value, context):
    return None if value['coordination_conflict:already_registered'] is True else 'coordination_conflict:already_registered'

def p_5(value, context):
    return None if value['coordination_conflict:stale_revision'] is True else 'coordination_conflict:stale_revision'

def p_6(value, context):
    return None if value['coordination_conflict:lineage_mismatch'] is True else 'coordination_conflict:lineage_mismatch'

def p_7(value, context):
    return None if value['coordination_unchanged'] is True else 'coordination_unchanged'

def transition_case():
    table = g.GuardTable([
        g.Guard('idempotency_conflict', g.Invariant('/idempotency_conflict', 'the idempotency conflict observation holds'), 'idempotency_conflict', p_0),
        g.Guard('quarantined_before_append', g.Invariant('/quarantined_before_append', 'the quarantined before append observation holds'), 'quarantined_before_append', p_1),
        g.Guard('coordination_conflict:not_registered', g.Invariant('/coordination_conflict_not_registered', 'the coordination conflict not registered observation holds'), 'coordination_conflict:not_registered', p_2),
        g.Guard('coordination_conflict:already_terminal', g.Invariant('/coordination_conflict_already_terminal', 'the coordination conflict already terminal observation holds'), 'coordination_conflict:already_terminal', p_3),
        g.Guard('coordination_conflict:already_registered', g.Invariant('/coordination_conflict_already_registered', 'the coordination conflict already registered observation holds'), 'coordination_conflict:already_registered', p_4),
        g.Guard('coordination_conflict:stale_revision', g.Invariant('/coordination_conflict_stale_revision', 'the coordination conflict stale revision observation holds'), 'coordination_conflict:stale_revision', p_5),
        g.Guard('coordination_conflict:lineage_mismatch', g.Invariant('/coordination_conflict_lineage_mismatch', 'the coordination conflict lineage mismatch observation holds'), 'coordination_conflict:lineage_mismatch', p_6),
        g.Guard('coordination_unchanged', g.Invariant('/coordination_unchanged', 'the coordination unchanged observation holds'), 'coordination_unchanged', p_7),
    ])
    def check(value):
        table.require('idempotency_conflict', value)
        table.require('quarantined_before_append', value)
        table.require('coordination_conflict:not_registered', value)
        table.require('coordination_conflict:already_terminal', value)
        table.require('coordination_conflict:already_registered', value)
        table.require('coordination_conflict:stale_revision', value)
        table.require('coordination_conflict:lineage_mismatch', value)
        table.require('coordination_unchanged', value)
        return True
    return g.Case(table, check)


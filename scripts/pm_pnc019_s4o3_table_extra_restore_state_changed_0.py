"""S4 reference-store extra_restore_state_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_restore_preview_current(v, context):
    if v['extra_restore_preview_current']['preview_manifest'] != v['extra_restore_preview_current']['selected_manifest']:
        return 'owner_predicate_failed'
    return None


def extra_restore_human_approval(v, context):
    if v['extra_restore_human_approval']['approval_principal']['kind'] != 'human':
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_restore_preview_current', g.Invariant('/extra_restore_preview_current', 'actual reference-store extra_restore_preview_current invariant'), 'owner_predicate_failed', extra_restore_preview_current),
        g.Guard('extra_restore_human_approval', g.Invariant('/extra_restore_human_approval', 'actual reference-store extra_restore_human_approval invariant'), 'owner_predicate_failed', extra_restore_human_approval),
    ])

    def check(value):
        table.require('extra_restore_preview_current', value, context)
        table.require('extra_restore_human_approval', value, context)
        return True
    return g.Case(table, check, context)

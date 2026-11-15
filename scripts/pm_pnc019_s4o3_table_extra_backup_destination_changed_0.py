"""S4 reference-store extra_backup_destination_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_destination_not_backup(v, context):
    if v['extra_destination_not_backup']['verification_after'] != v['extra_destination_not_backup']['verification_before']:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_destination_not_backup', g.Invariant('/extra_destination_not_backup', 'actual reference-store extra_destination_not_backup invariant'), 'owner_predicate_failed', extra_destination_not_backup),
    ])

    def check(value):
        table.require('extra_destination_not_backup', value, context)
        return True
    return g.Case(table, check, context)

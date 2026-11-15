"""S4 reference-store extra_backup_state_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_capture_barrier(v, context):
    if 'start_background_upload' in v['extra_capture_barrier']['journal'] and ('release_capture_barrier' not in v['extra_capture_barrier']['journal'] or v['extra_capture_barrier']['journal'].index('release_capture_barrier') >= v['extra_capture_barrier']['journal'].index('start_background_upload')):
        return 'owner_predicate_failed'
    return None


def extra_cancel_generation(v, context):
    if v['extra_cancel_generation']['verified_after_cancel'] != v['extra_cancel_generation']['last_verified_before']:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_capture_barrier', g.Invariant('/extra_capture_barrier', 'actual reference-store extra_capture_barrier invariant'), 'owner_predicate_failed', extra_capture_barrier),
        g.Guard('extra_cancel_generation', g.Invariant('/extra_cancel_generation', 'actual reference-store extra_cancel_generation invariant'), 'owner_predicate_failed', extra_cancel_generation),
    ])

    def check(value):
        table.require('extra_capture_barrier', value, context)
        table.require('extra_cancel_generation', value, context)
        return True
    return g.Case(table, check, context)

"""S4 reference-store restore_chain predicates (generated)."""
import pm_guard_isolation as g


def restore_phase_order(v, context):
    if v['phases'] != v['required_phases']:
        return 'restore_phase_order'
    return None


def restore_evidence(v, context):
    if v['resolved_receipts'] != v['original_receipts']:
        return 'restore_evidence_missing'
    return None


def restore_quiesce(v, context):
    if v['active_writers_at_activation'] != []:
        return 'restore_not_quiesced'
    return None


def restore_no_revival(v, context):
    if v['revived_authority'] != []:
        return 'restore_revived_authority'
    return None


def restore_pause(v, context):
    if v['running_after_restore'] != []:
        return 'restore_work_not_paused'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('restore_phase_order', g.Invariant('/restore_phase_order', 'actual reference-store restore_phase_order invariant'), 'restore_phase_order', restore_phase_order),
        g.Guard('restore_evidence', g.Invariant('/restore_evidence', 'actual reference-store restore_evidence invariant'), 'restore_evidence_missing', restore_evidence),
        g.Guard('restore_quiesce', g.Invariant('/restore_quiesce', 'actual reference-store restore_quiesce invariant'), 'restore_not_quiesced', restore_quiesce),
        g.Guard('restore_no_revival', g.Invariant('/restore_no_revival', 'actual reference-store restore_no_revival invariant'), 'restore_revived_authority', restore_no_revival),
        g.Guard('restore_pause', g.Invariant('/restore_pause', 'actual reference-store restore_pause invariant'), 'restore_work_not_paused', restore_pause),
    ])

    def check(value):
        table.require('restore_phase_order', value, context)
        table.require('restore_evidence', value, context)
        table.require('restore_quiesce', value, context)
        table.require('restore_no_revival', value, context)
        table.require('restore_pause', value, context)
        return True
    return g.Case(table, check, context)

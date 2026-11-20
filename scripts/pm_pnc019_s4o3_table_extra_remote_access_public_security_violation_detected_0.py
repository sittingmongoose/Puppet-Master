"""S4 reference-store extra_remote_access_public_security_violation_detected_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_violation_failed_control(v, context):
    if v['extra_violation_failed_control']['control_results'].get(v['extra_violation_failed_control']['violated_control']) != 'failed':
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_violation_failed_control', g.Invariant('/extra_violation_failed_control', 'actual reference-store extra_violation_failed_control invariant'), 'owner_predicate_failed', extra_violation_failed_control),
    ])

    def check(value):
        table.require('extra_violation_failed_control', value, context)
        return True
    return g.Case(table, check, context)

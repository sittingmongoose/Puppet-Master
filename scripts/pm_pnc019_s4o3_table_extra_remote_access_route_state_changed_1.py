"""S4 reference-store extra_remote_access_route_state_changed_1 predicates (generated)."""
import pm_guard_isolation as g


def extra_disable_preserves_private(v, context):
    if v['extra_disable_preserves_private']['private_routes_after_disable'] != v['extra_disable_preserves_private']['private_routes_before']:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_disable_preserves_private', g.Invariant('/extra_disable_preserves_private', 'actual reference-store extra_disable_preserves_private invariant'), 'owner_predicate_failed', extra_disable_preserves_private),
    ])

    def check(value):
        table.require('extra_disable_preserves_private', value, context)
        return True
    return g.Case(table, check, context)

"""S4 reference-store extra_server_discovery_observed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_discovery_not_verified_identity(v, context):
    if v['extra_discovery_not_verified_identity']['verified_servers_after_discovery'] != v['extra_discovery_not_verified_identity']['verified_servers_before']:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_discovery_not_verified_identity', g.Invariant('/extra_discovery_not_verified_identity', 'actual reference-store extra_discovery_not_verified_identity invariant'), 'owner_predicate_failed', extra_discovery_not_verified_identity),
    ])

    def check(value):
        table.require('extra_discovery_not_verified_identity', value, context)
        return True
    return g.Case(table, check, context)

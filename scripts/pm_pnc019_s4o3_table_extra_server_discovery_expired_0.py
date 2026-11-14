"""S4 reference-store extra_server_discovery_expired_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_expiry_preserves_newer(v, context):
    if v['extra_expiry_preserves_newer']['newer_observation_id'] in v['extra_expiry_preserves_newer']['expired_observation_ids']:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_expiry_preserves_newer', g.Invariant('/extra_expiry_preserves_newer', 'actual reference-store extra_expiry_preserves_newer invariant'), 'owner_predicate_failed', extra_expiry_preserves_newer),
    ])

    def check(value):
        table.require('extra_expiry_preserves_newer', value, context)
        return True
    return g.Case(table, check, context)

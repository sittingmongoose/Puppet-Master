"""S4 reference-store extra_remote_access_private_endpoint_state_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_private_connector_owner(v, context):
    if v['extra_private_connector_owner']['connector_server'] != v['extra_private_connector_owner']['listener_server']:
        return 'owner_predicate_failed'
    return None


def extra_funnel_independent(v, context):
    if v['extra_funnel_independent']['private_listener_after_funnel'] != v['extra_funnel_independent']['private_listener_before']:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_private_connector_owner', g.Invariant('/extra_private_connector_owner', 'actual reference-store extra_private_connector_owner invariant'), 'owner_predicate_failed', extra_private_connector_owner),
        g.Guard('extra_funnel_independent', g.Invariant('/extra_funnel_independent', 'actual reference-store extra_funnel_independent invariant'), 'owner_predicate_failed', extra_funnel_independent),
    ])

    def check(value):
        table.require('extra_private_connector_owner', value, context)
        table.require('extra_funnel_independent', value, context)
        return True
    return g.Case(table, check, context)

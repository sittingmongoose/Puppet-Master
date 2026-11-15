"""S4 reference-store extra_remote_access_remote_link_state_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_remote_link_e2e(v, context):
    if v['extra_remote_link_e2e']['e2e_channel_ref'] not in v['extra_remote_link_e2e']['verified_e2e_channels']:
        return 'owner_predicate_failed'
    return None


def extra_remote_link_resolution(v, context):
    if v['extra_remote_link_resolution']['used_resolution'] != v['extra_remote_link_resolution']['original_verified_resolution']:
        return 'owner_predicate_failed'
    return None


def extra_remote_link_server(v, context):
    if v['extra_remote_link_server']['server_after_transport_change'] != v['extra_remote_link_server']['original_server']:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_remote_link_e2e', g.Invariant('/extra_remote_link_e2e', 'actual reference-store extra_remote_link_e2e invariant'), 'owner_predicate_failed', extra_remote_link_e2e),
        g.Guard('extra_remote_link_resolution', g.Invariant('/extra_remote_link_resolution', 'actual reference-store extra_remote_link_resolution invariant'), 'owner_predicate_failed', extra_remote_link_resolution),
        g.Guard('extra_remote_link_server', g.Invariant('/extra_remote_link_server', 'actual reference-store extra_remote_link_server invariant'), 'owner_predicate_failed', extra_remote_link_server),
    ])

    def check(value):
        table.require('extra_remote_link_e2e', value, context)
        table.require('extra_remote_link_resolution', value, context)
        table.require('extra_remote_link_server', value, context)
        return True
    return g.Case(table, check, context)

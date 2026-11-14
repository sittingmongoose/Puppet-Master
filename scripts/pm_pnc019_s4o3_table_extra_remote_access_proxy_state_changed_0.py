"""S4 reference-store extra_remote_access_proxy_state_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_proxy_ready_test(v, context):
    if v['extra_proxy_ready_test']['route_state'] in ['ready', 'active'] and v['extra_proxy_ready_test']['test_receipt']['terminal_status'] != 'passed':
        return 'owner_predicate_failed'
    return None


def extra_npm_existing_only(v, context):
    if v['extra_npm_existing_only']['proxy_kind'] == 'nginx_proxy_manager' and v['extra_npm_existing_only']['new_artifacts'] != []:
        return 'owner_predicate_failed'
    return None


def extra_proxy_headers_peer(v, context):
    if v['extra_proxy_headers_peer']['header_source_peer'] not in v['extra_proxy_headers_peer']['configured_trusted_peers']:
        return 'owner_predicate_failed'
    return None


def extra_proxy_no_certificate_claim(v, context):
    if v['extra_proxy_no_certificate_claim']['certificate_claims'] != []:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_proxy_ready_test', g.Invariant('/extra_proxy_ready_test', 'actual reference-store extra_proxy_ready_test invariant'), 'owner_predicate_failed', extra_proxy_ready_test),
        g.Guard('extra_npm_existing_only', g.Invariant('/extra_npm_existing_only', 'actual reference-store extra_npm_existing_only invariant'), 'owner_predicate_failed', extra_npm_existing_only),
        g.Guard('extra_proxy_headers_peer', g.Invariant('/extra_proxy_headers_peer', 'actual reference-store extra_proxy_headers_peer invariant'), 'owner_predicate_failed', extra_proxy_headers_peer),
        g.Guard('extra_proxy_no_certificate_claim', g.Invariant('/extra_proxy_no_certificate_claim', 'actual reference-store extra_proxy_no_certificate_claim invariant'), 'owner_predicate_failed', extra_proxy_no_certificate_claim),
    ])

    def check(value):
        table.require('extra_proxy_ready_test', value, context)
        table.require('extra_npm_existing_only', value, context)
        table.require('extra_proxy_headers_peer', value, context)
        table.require('extra_proxy_no_certificate_claim', value, context)
        return True
    return g.Case(table, check, context)

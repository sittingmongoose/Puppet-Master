"""S4 reference-store extra_remote_access_route_state_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_reachability_not_trust(v, context):
    if v['extra_reachability_not_trust']['trust_after_reachability'] != v['extra_reachability_not_trust']['trust_before']:
        return 'owner_predicate_failed'
    return None


def extra_public_consent_generation_number_consent_policy_generation(v, context):
    if v['extra_public_consent_generation']['numeric_reasons']['consent_policy_generation'] is not None:
        return 'number_domain'
    return None


def extra_public_consent_generation_number_current_policy_generation(v, context):
    if v['extra_public_consent_generation']['numeric_reasons']['current_policy_generation'] is not None:
        return 'number_domain'
    return None


def extra_public_consent_generation(v, context):
    if v['extra_public_consent_generation']['numeric_reasons'] == {'consent_policy_generation': None, 'current_policy_generation': None} and (v['extra_public_consent_generation']['consent_policy_generation'] != v['extra_public_consent_generation']['current_policy_generation']):
        return 'owner_predicate_failed'
    return None


def extra_public_preflight_generation_number_preflight_route_generation(v, context):
    if v['extra_public_preflight_generation']['numeric_reasons']['preflight_route_generation'] is not None:
        return 'number_domain'
    return None


def extra_public_preflight_generation_number_current_route_generation(v, context):
    if v['extra_public_preflight_generation']['numeric_reasons']['current_route_generation'] is not None:
        return 'number_domain'
    return None


def extra_public_preflight_generation(v, context):
    if v['extra_public_preflight_generation']['numeric_reasons'] == {'preflight_route_generation': None, 'current_route_generation': None} and (v['extra_public_preflight_generation']['preflight_route_generation'] != v['extra_public_preflight_generation']['current_route_generation']):
        return 'owner_predicate_failed'
    return None


def extra_headscale_no_funnel(v, context):
    if v['extra_headscale_no_funnel']['provider'] == 'headscale' and v['extra_headscale_no_funnel']['route_type'] == 'funnel_public':
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_reachability_not_trust', g.Invariant('/extra_reachability_not_trust', 'actual reference-store extra_reachability_not_trust invariant'), 'owner_predicate_failed', extra_reachability_not_trust),
        g.Guard('extra_public_consent_generation_number_consent_policy_generation', g.Invariant('/extra_public_consent_generation_number_consent_policy_generation', 'actual reference-store extra_public_consent_generation_number_consent_policy_generation invariant'), 'number_domain', extra_public_consent_generation_number_consent_policy_generation),
        g.Guard('extra_public_consent_generation_number_current_policy_generation', g.Invariant('/extra_public_consent_generation_number_current_policy_generation', 'actual reference-store extra_public_consent_generation_number_current_policy_generation invariant'), 'number_domain', extra_public_consent_generation_number_current_policy_generation),
        g.Guard('extra_public_consent_generation', g.Invariant('/extra_public_consent_generation', 'actual reference-store extra_public_consent_generation invariant'), 'owner_predicate_failed', extra_public_consent_generation),
        g.Guard('extra_public_preflight_generation_number_preflight_route_generation', g.Invariant('/extra_public_preflight_generation_number_preflight_route_generation', 'actual reference-store extra_public_preflight_generation_number_preflight_route_generation invariant'), 'number_domain', extra_public_preflight_generation_number_preflight_route_generation),
        g.Guard('extra_public_preflight_generation_number_current_route_generation', g.Invariant('/extra_public_preflight_generation_number_current_route_generation', 'actual reference-store extra_public_preflight_generation_number_current_route_generation invariant'), 'number_domain', extra_public_preflight_generation_number_current_route_generation),
        g.Guard('extra_public_preflight_generation', g.Invariant('/extra_public_preflight_generation', 'actual reference-store extra_public_preflight_generation invariant'), 'owner_predicate_failed', extra_public_preflight_generation),
        g.Guard('extra_headscale_no_funnel', g.Invariant('/extra_headscale_no_funnel', 'actual reference-store extra_headscale_no_funnel invariant'), 'owner_predicate_failed', extra_headscale_no_funnel),
    ])

    def check(value):
        table.require('extra_reachability_not_trust', value, context)
        table.require('extra_public_consent_generation_number_consent_policy_generation', value, context)
        table.require('extra_public_consent_generation_number_current_policy_generation', value, context)
        table.require('extra_public_consent_generation', value, context)
        table.require('extra_public_preflight_generation_number_preflight_route_generation', value, context)
        table.require('extra_public_preflight_generation_number_current_route_generation', value, context)
        table.require('extra_public_preflight_generation', value, context)
        table.require('extra_headscale_no_funnel', value, context)
        return True
    return g.Case(table, check, context)

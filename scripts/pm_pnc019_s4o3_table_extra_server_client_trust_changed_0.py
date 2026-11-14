"""S4 reference-store extra_server_client_trust_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_active_trust_original_grant(v, context):
    if v['extra_active_trust_original_grant']['grant_receipt_ref'] not in v['extra_active_trust_original_grant']['original_protected_grant_receipts']:
        return 'owner_predicate_failed'
    return None


def extra_trust_session_fence_number_session_generation(v, context):
    if v['extra_trust_session_fence']['numeric_reasons']['session_generation'] is not None:
        return 'number_domain'
    return None


def extra_trust_session_fence_number_current_session_generation(v, context):
    if v['extra_trust_session_fence']['numeric_reasons']['current_session_generation'] is not None:
        return 'number_domain'
    return None


def extra_trust_session_fence(v, context):
    if v['extra_trust_session_fence']['numeric_reasons'] == {'session_generation': None, 'current_session_generation': None} and (v['extra_trust_session_fence']['session_generation'] != v['extra_trust_session_fence']['current_session_generation']):
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_active_trust_original_grant', g.Invariant('/extra_active_trust_original_grant', 'actual reference-store extra_active_trust_original_grant invariant'), 'owner_predicate_failed', extra_active_trust_original_grant),
        g.Guard('extra_trust_session_fence_number_session_generation', g.Invariant('/extra_trust_session_fence_number_session_generation', 'actual reference-store extra_trust_session_fence_number_session_generation invariant'), 'number_domain', extra_trust_session_fence_number_session_generation),
        g.Guard('extra_trust_session_fence_number_current_session_generation', g.Invariant('/extra_trust_session_fence_number_current_session_generation', 'actual reference-store extra_trust_session_fence_number_current_session_generation invariant'), 'number_domain', extra_trust_session_fence_number_current_session_generation),
        g.Guard('extra_trust_session_fence', g.Invariant('/extra_trust_session_fence', 'actual reference-store extra_trust_session_fence invariant'), 'owner_predicate_failed', extra_trust_session_fence),
    ])

    def check(value):
        table.require('extra_active_trust_original_grant', value, context)
        table.require('extra_trust_session_fence_number_session_generation', value, context)
        table.require('extra_trust_session_fence_number_current_session_generation', value, context)
        table.require('extra_trust_session_fence', value, context)
        return True
    return g.Case(table, check, context)
